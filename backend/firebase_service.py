"""Firebase Admin SDK integration: Firestore (apps/categories), Auth verify, Storage.

Firestore is the source of truth for `apps` and `categories`.
Auth is used to verify admin ID tokens issued by Firebase client SDK.
Storage is used for uploads when the project's bucket is provisioned (Blaze plan).
"""
import os
import re
import asyncio
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore, auth as fb_auth, storage as fb_storage

import json

cred_input = os.environ.get("FIREBASE_CREDENTIALS") or os.environ.get("FIREBASE_CREDENTIALS_PATH", "")
_BUCKET_NAME = os.environ.get("FIREBASE_STORAGE_BUCKET")

if not firebase_admin._apps:
    if cred_input.strip().startswith("{"):
        cred_dict = json.loads(cred_input)
        _cred = credentials.Certificate(cred_dict)
    else:
        _cred = credentials.Certificate(cred_input)
        
    firebase_admin.initialize_app(_cred, {"storageBucket": _BUCKET_NAME})

fs = firestore.client()

APPS = "apps"
CATEGORIES = "categories"
ADMINS = "admins"

_bucket_checked = False
_bucket_ok = False


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "app"


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
def verify_id_token(id_token: str) -> dict:
    return fb_auth.verify_id_token(id_token)


def ensure_admin_user(email: str, password: str) -> str:
    """Create the admin in Firebase Auth (if missing) and record in `admins`."""
    email = email.lower().strip()
    try:
        user = fb_auth.get_user_by_email(email)
    except fb_auth.UserNotFoundError:
        user = fb_auth.create_user(email=email, password=password, email_verified=True)
    fs.collection(ADMINS).document(user.uid).set(
        {"email": email, "role": "admin", "created_at": _now_iso()}, merge=True
    )
    return user.uid


def is_admin(uid: str, email: str = "") -> bool:
    doc = fs.collection(ADMINS).document(uid).get()
    if doc.exists:
        return True
    # fallback: match by email
    if email:
        q = list(fs.collection(ADMINS).where("email", "==", email.lower().strip()).limit(1).stream())
        return len(q) > 0
    return False


# --------------------------------------------------------------------------
# Storage
# --------------------------------------------------------------------------
def get_bucket():
    global _bucket_checked, _bucket_ok
    if not _BUCKET_NAME:
        return None
    try:
        b = fb_storage.bucket()
        if not _bucket_checked:
            b.reload()  # raises if bucket missing
            _bucket_ok = True
        return b
    except Exception:
        _bucket_ok = False
        return None
    finally:
        _bucket_checked = True


def upload_bytes(data: bytes, dest_path: str, content_type: str) -> str | None:
    """Upload to Firebase Storage; return public URL or None if unavailable."""
    bucket = get_bucket()
    if bucket is None:
        return None
    blob = bucket.blob(dest_path)
    blob.upload_from_string(data, content_type=content_type)
    blob.make_public()
    return blob.public_url


# --------------------------------------------------------------------------
# Firestore helpers (async wrappers around the sync client)
# --------------------------------------------------------------------------
def _doc_to_app(doc) -> dict:
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


async def list_apps() -> list[dict]:
    def _run():
        return [_doc_to_app(d) for d in fs.collection(APPS).stream()]
    return await asyncio.to_thread(_run)


async def get_app(app_id: str) -> dict | None:
    def _run():
        d = fs.collection(APPS).document(app_id).get()
        return _doc_to_app(d) if d.exists else None
    return await asyncio.to_thread(_run)


async def get_app_by_slug(slug: str) -> dict | None:
    def _run():
        q = list(fs.collection(APPS).where("slug", "==", slug).limit(1).stream())
        return _doc_to_app(q[0]) if q else None
    return await asyncio.to_thread(_run)


async def _unique_slug(base: str, exclude_id: str | None = None) -> str:
    def _run():
        s = slugify(base)
        candidate = s
        i = 2
        while True:
            q = list(fs.collection(APPS).where("slug", "==", candidate).limit(1).stream())
            if not q or (exclude_id and q[0].id == exclude_id):
                return candidate
            candidate = f"{s}-{i}"
            i += 1
    return await asyncio.to_thread(_run)


async def create_app(data: dict) -> dict:
    if not data.get("slug"):
        data["slug"] = await _unique_slug(data.get("name", "app"))
    else:
        data["slug"] = await _unique_slug(data["slug"])
    if not data.get("created_at"):
        data["created_at"] = _now_iso()

    def _run():
        ref = fs.collection(APPS).document()
        ref.set(data)
        d = ref.get()
        return _doc_to_app(d)
    return await asyncio.to_thread(_run)


async def update_app(app_id: str, updates: dict) -> dict | None:
    if updates.get("slug"):
        updates["slug"] = await _unique_slug(updates["slug"], exclude_id=app_id)

    def _run():
        ref = fs.collection(APPS).document(app_id)
        if not ref.get().exists:
            return None
        ref.update(updates)
        return _doc_to_app(ref.get())
    return await asyncio.to_thread(_run)


async def bulk_set_order(items: list[dict]) -> int:
    """Persist homepage ordering for many apps in ONE atomic batch.

    `items` is a list of {"id": str, "sort_order": int, "pinned": bool}.

    Uses a Firestore WriteBatch rather than a loop of update_app() calls so a
    drag of 40 rows cannot half-apply and leave the homepage in a scrambled
    intermediate state. Firestore caps a batch at 500 operations, so the work
    is chunked.
    """
    if not items:
        return 0

    def _run():
        written = 0
        for start in range(0, len(items), 400):
            chunk = items[start:start + 400]
            batch = fs.batch()
            for it in chunk:
                ref = fs.collection(APPS).document(it["id"])
                batch.update(ref, {
                    "sort_order": int(it["sort_order"]),
                    "pinned": bool(it.get("pinned", False)),
                    "updated_at": _now_iso(),
                })
            batch.commit()
            written += len(chunk)
        return written

    return await asyncio.to_thread(_run)


async def delete_app(app_id: str) -> bool:
    def _run():
        ref = fs.collection(APPS).document(app_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True
    return await asyncio.to_thread(_run)


async def increment_downloads(app_id: str) -> None:
    def _run():
        fs.collection(APPS).document(app_id).update({"downloads": firestore.Increment(1)})
    await asyncio.to_thread(_run)


# --------------------------------------------------------------------------
# Categories
# --------------------------------------------------------------------------
async def list_categories() -> list[dict]:
    def _run():
        return [{**(d.to_dict() or {}), "id": d.id} for d in fs.collection(CATEGORIES).stream()]
    return await asyncio.to_thread(_run)


async def upsert_category(name: str) -> None:
    def _run():
        cid = slugify(name)
        fs.collection(CATEGORIES).document(cid).set(
            {"name": name, "slug": cid}, merge=True
        )
    await asyncio.to_thread(_run)
