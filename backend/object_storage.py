"""Emergent Object Storage integration - persistent file storage.

Replaces local disk uploads (which get wiped on container restart) and Firebase
Storage (which requires Blaze plan). Files are uploaded to Emergent's managed
object storage and served through the backend `/api/uploads/{path}` route.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_PREFIX = "uonogamesapk"

_storage_key: str | None = None


def _emergent_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    return key


def init_storage() -> str:
    """Initialize session storage key. Safe to call multiple times."""
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": _emergent_key()},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    logger.info("Emergent Object Storage initialized")
    return _storage_key


def _reset_key():
    global _storage_key
    _storage_key = None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file; returns {path, size, etag}. Retries once on 403."""
    key = init_storage()
    for attempt in range(2):
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=300,
        )
        if resp.status_code == 403 and attempt == 0:
            _reset_key()
            key = init_storage()
            continue
        resp.raise_for_status()
        return resp.json()
    raise RuntimeError("Object storage upload failed")


def get_object(path: str) -> tuple[bytes, str]:
    """Download file bytes; returns (content, content_type)."""
    key = init_storage()
    for attempt in range(2):
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=120,
        )
        if resp.status_code == 403 and attempt == 0:
            _reset_key()
            key = init_storage()
            continue
        resp.raise_for_status()
        return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
    raise RuntimeError("Object storage download failed")


def object_exists(path: str) -> bool:
    key = init_storage()
    try:
        resp = requests.head(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=15,
        )
        return resp.status_code == 200
    except Exception:
        return False


def build_upload_path(filename: str) -> str:
    return f"{APP_PREFIX}/uploads/{filename}"
