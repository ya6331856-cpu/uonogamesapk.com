"""One-time migration: upload all local files in /app/backend/uploads/ to
Emergent Object Storage so they survive container restarts.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
sys.path.insert(0, str(ROOT))

import object_storage as obs

MIME = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
    "apk": "application/vnd.android.package-archive",
    "pdf": "application/pdf",
}

def guess(name: str) -> str:
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    return MIME.get(ext, "application/octet-stream")


def main():
    upload_dir = ROOT / "uploads"
    if not upload_dir.exists():
        print("No uploads dir")
        return
    files = sorted(upload_dir.iterdir())
    print(f"Migrating {len(files)} files...")
    obs.init_storage()
    ok, skipped, failed = 0, 0, 0
    for f in files:
        if not f.is_file():
            continue
        path = obs.build_upload_path(f.name)
        if obs.object_exists(path):
            skipped += 1
            continue
        try:
            obs.put_object(path, f.read_bytes(), guess(f.name))
            ok += 1
            print(f"  OK {f.name}")
        except Exception as e:
            failed += 1
            print(f"  FAIL {f.name}: {e}")
    print(f"Done. uploaded={ok} skipped={skipped} failed={failed}")


if __name__ == "__main__":
    main()
