"""One-time migration: copy existing MongoDB `apps` into Firestore.

Idempotent: an app is matched by its original Mongo id stored as `mongo_id`
in Firestore. Existing MongoDB data is NOT deleted. Slugs are generated from
the app name when missing.
"""
import os
import asyncio
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
import firebase_service as fbs  # noqa: E402

SEO_FIELDS = ("slug", "seo_title", "meta_description", "keywords")


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    mongo_apps = await db.apps.find({}).to_list(2000)
    print(f"Found {len(mongo_apps)} apps in MongoDB")

    # Build set of already-migrated mongo_ids
    existing = await fbs.list_apps()
    migrated_ids = {a.get("mongo_id") for a in existing if a.get("mongo_id")}
    existing_slugs = {a.get("slug") for a in existing if a.get("slug")}
    print(f"Firestore already has {len(existing)} apps ({len(migrated_ids)} previously migrated)")

    created = 0
    skipped = 0
    for doc in mongo_apps:
        mid = str(doc.get("_id"))
        if mid in migrated_ids:
            skipped += 1
            continue
        data = {k: v for k, v in doc.items() if k != "_id"}
        data["mongo_id"] = mid
        # ensure slug
        base_slug = data.get("slug") or fbs.slugify(data.get("name", "app"))
        slug = base_slug
        i = 2
        while slug in existing_slugs:
            slug = f"{base_slug}-{i}"
            i += 1
        data["slug"] = slug
        existing_slugs.add(slug)
        # ensure SEO defaults
        if not data.get("seo_title"):
            data["seo_title"] = f"{data.get('name', '')} - Download APK | Uonogamesapk.com"
        if not data.get("meta_description"):
            data["meta_description"] = (data.get("description", "") or "")[:160]
        new = await fbs.create_app(data)
        created += 1
        print(f"  migrated: {data.get('name')} -> /{new.get('slug')} (id={new.get('id')})")

    print(f"\nDONE. Created {created}, skipped {skipped} (already migrated).")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
