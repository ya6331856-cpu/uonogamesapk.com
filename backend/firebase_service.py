"""Firebase Admin SDK integration: Firestore (apps/categories), Auth verify, Storage.

Firestore is the source of truth for `apps` and `categories`.
Auth is used to verify admin ID tokens issued by Firebase client SDK.
Storage is used for uploads when the project's bucket is provisioned (Blaze plan).
"""
import os
import re
import json
import asyncio
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore, auth as fb_auth, storage as fb_storage

# Robust credential loading for Render environment variables (JSON string or file path)
cred_input = os.environ.get("FIREBASE_CREDENTIALS") or os.environ.get("FIREBASE_CREDENTIALS_PATH", "")
cred_input = cred_input.strip()
_BUCKET_NAME = os.environ.get("FIREBASE_STORAGE_BUCKET")

if not firebase_admin._apps:
    if not cred_input:
        raise ValueError("CRITICAL: FIREBASE_CREDENTIALS environment variable is missing or empty in Render!")
    
    try:
        if cred_input.startswith("{"):
            cred_dict = json.loads(cred_input)
            _cred = credentials.Certificate(cred_dict)
        else:
            try:
                cred_dict = json.loads(cred_input)
                _cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError:
                _cred = credentials.Certificate(cred_input)
    except Exception as e:
        print(f"Failed to load Firebase credentials: {e}")
        raise

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
from google.oauth2 import service_account
from googleapiclient.discovery import build

INDEXING_SCOPES = ["https://www.googleapis.com/auth/indexing"]

SERVICE_ACCOUNT_INFO = {
    "type": "service_account",
    "project_id": "uonogamesapk",
    "private_key_id": "f02c6f04e58802161f3b5e5b251fe7f22a016ae6",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDlmMpOEoA6dq5E\nSD+YPlgg/5OY4nGFAUXEZPRDJohhWVQuqwt8cFloYM3k1RF+EbPYRye9hFtKpKz0\nEwbdh7TQ8EN/VMvPwI2wsSotBf6rNOmPFQha4pHNxlZi+2X7Yp21YRtR3a0W8Nya\nxlk+0cHKwooa03f3os+p36l0nMY3QtqWsXxGTSpzXTnuCwrYTZOOGM8LeWHQDtVj\nSzF2FLkd7tMH4IcrdxkpRrZ5lH+bybScvgWNjExVsLVlxLSDU+0YfkO+FMPGI1x3\nGfxVx6g7uIioJ0aeV7LcTGmG1pYDgR+rkWCefQTxshTp2l/M8U+DqOhVQgZ0w/tZ\nqMwX6tUpAgMBAAECggEARBXPpGBLI0sveXM9XJ3cT4jK0bMQ++K5ODjB0Kn8FnZB\nhwdVBCVi9heC5yGiKtMAFJphOAuocNWtrkF4Lzh/j9g4A+n2+Jg+zE91VN2qvEWY\nH0Sa8iyvFSkEVBz+DJKddvyhd+D3Y86wdLtuGrlkMQcIolTkhgyDbXo0i66z/w2l\nxqXmj3mIkWPYZMJuVD/hzzVBCY+B8N/+NMTUuX07U0msUJsve/ResFIZunvUVaxr\nya81wDZIhUkvXXDL45xf+JRJrpG23/jbDK7jCkXX8aa+J2KDSwPwOmLwYVdeAPc9\VZqP+yO2KLojzSr1Xmbi10IN26HZ8XZE7d22eKlsswKBgQD+KTEu3Csmw8y7Q8ZD\nzD56XlbQBAFod/8BZHd4FvKScRidwhICZdxXQS+3XvQQUei9J2kLhFcZQpZshAIy\n3zhJY3RmThttK9I/xBaEy/ZyEDOTcNDoTUilxKXvfWcN+UFxn9jhVjPYFZrYRyRF\neQHMmrUJRCy7q2jgIwlWNTCijwKBgQDnQhh7IZdIFbK7myfUdEvgE4I2Q4ISFwlx\n6p65jvMxmEf6KgoH1FBAjqUjyBZdDSFyQCKRC8T3l/ADJt+eqULx61GcpNzcNWFB\nMWrO9+hTjsw0Ifgu3M1iHcRGnv++1UJlYcwkjfBxEUb11GGYMUaILwL95qbmQBHe\ncMOkCXgIxwKBgBpGOd5lRlS4kxac2Ac0OxU9YW4Zq+eX2BXVw//3J1Z6OJg+cswq\nqY+fnoYvW73AKfY798EIClUDLDfFodCOgOwdSvA0jONJT2/mHonV6AE8qYhJdl89\ndhAk9x598URhiyFq6+nHlo51FU/ccuR3sPbs22A82v7/plTdal6uGvwDAoGAbP85\HKfrbr1TXZs2fatGq9lmEP9mifIzsG5920WmGCUHH8C6s4/9N0BEU4YWDEuJDRlv\ncV/TuULyi/nBgj2S4QUhlSwbMOsz6I9LITu1U9TFKHkuSaAmaW1QOlzse1x2i+Q5\nXK1Nu20CPhGY4iuva7aEuXkCBxoBkg8iFumjmrcCgYEA6sKEvjaiA7sJkRYl+EDK\nBSEKulFDuKLuCh6pAMowV7+mfBLH9qqBQ02+8uQSAAeNnyQqu68OHQRto7oVF93o\n3kryvynr73KIHrPpRMR+mvQwDwtkPv4FRn6kWESVw57g+QLByc79Wk8X4TjPZeAJ\nhgfLW13lSv2NN2CFKi/cRbE=\n-----END PRIVATE KEY-----",
    "client_email": "newyono-indexer@uonogamesapk.iam.gserviceaccount.com",
    "client_id": "112018094980782324050",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/newyono-indexer%40uonogamesapk.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

def _get_indexing_service():
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_INFO, scopes=INDEXING_SCOPES
    )
    return build("indexing", "v3", credentials=credentials)

def notify_google_indexing(app_slug: str):
    target_url = f"https://newyono.games/{app_slug}"
    try:
        service = _get_indexing_service()
        body = {
            "url": target_url,
            "type": "URL_UPDATED"
        }
        request = service.urlNotifications().publish(body=body)
        return request.execute()
    except Exception as e:
        return {"error": str(e)}

async def bulk_index_all_firestore_apps():
    def _run():
        docs = fs.collection(APPS).stream()
        success, failed = 0, 0
        for doc in docs:
            data = doc.to_dict()
            slug = data.get("slug") or doc.id
            res = notify_google_indexing(slug)
            if isinstance(res, dict) and "error" in res:
                failed += 1
            else:
                success += 1
        return {"message": "Bulk indexing completed", "success": success, "failed": failed}
    
    return await asyncio.to_thread(_run)
