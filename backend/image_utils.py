"""Image validation & optimization utilities.

- Sniffs magic bytes to detect real image type (rejects fake extensions).
- Optionally converts large PNG/JPEG images to WebP to reduce size.
"""
from __future__ import annotations
import io
import logging

try:
    from PIL import Image  # type: ignore
    HAS_PIL = True
except Exception:
    HAS_PIL = False

logger = logging.getLogger(__name__)

# Signatures: prefix bytes → (mime, canonical_ext)
_IMAGE_SIGS: list[tuple[bytes, str, str]] = [
    (b"\xff\xd8\xff", "image/jpeg", "jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", "png"),
    (b"GIF87a", "image/gif", "gif"),
    (b"GIF89a", "image/gif", "gif"),
    (b"RIFF", "image/webp", "webp"),  # RIFF...WEBP
    (b"<svg", "image/svg+xml", "svg"),
    (b"<?xml", "image/svg+xml", "svg"),  # svg with xml decl
]

APK_SIG = b"PK\x03\x04"  # ZIP header (APKs are ZIPs)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}


def sniff_image(data: bytes) -> tuple[str | None, str | None]:
    """Return (mime, ext) if `data` looks like a supported image, else (None, None)."""
    if not data:
        return None, None
    head = data[:16]
    for sig, mime, ext in _IMAGE_SIGS:
        if head.startswith(sig):
            if mime == "image/webp":
                # Full check: RIFF....WEBP
                if len(data) >= 12 and data[8:12] == b"WEBP":
                    return mime, "webp"
            else:
                return mime, ext
    return None, None


def is_apk(data: bytes) -> bool:
    return data[:4] == APK_SIG


def validate_upload(data: bytes, filename: str, expected: str | None = None) -> tuple[str, str]:
    """Validate upload data. Returns (mime, ext).

    Args:
        data: raw file bytes
        filename: original filename (used to detect if user tried to upload an APK)
        expected: 'image' or 'apk' or None (any). If 'image', APKs are rejected.
    """
    ext_hint = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if is_apk(data) or ext_hint == "apk":
        if expected == "image":
            raise ValueError("APK files not allowed here — expected an image.")
        return "application/vnd.android.package-archive", "apk"
    mime, ext = sniff_image(data)
    if not mime:
        raise ValueError(
            f"Unsupported or corrupt file type. Allowed images: JPEG, PNG, GIF, WebP, SVG. Got extension '{ext_hint}'."
        )
    return mime, ext


def optimize_image(data: bytes, mime: str, max_kb: int = 300) -> tuple[bytes, str, str]:
    """Convert oversized JPEG/PNG to WebP if it shrinks the file substantially.

    Returns (new_bytes, new_mime, new_ext). If no benefit, returns input unchanged.
    Safe: never expands file, never crashes upload.
    """
    if not HAS_PIL:
        return data, mime, mime.split("/")[-1]
    ext = mime.split("/")[-1]
    if mime not in ("image/jpeg", "image/png"):
        return data, mime, ext
    original_size = len(data)
    if original_size <= max_kb * 1024:
        return data, mime, ext
    try:
        with Image.open(io.BytesIO(data)) as im:
            # Convert palette/greyscale to RGB(A) before saving as WebP
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
            buf = io.BytesIO()
            im.save(buf, format="WEBP", quality=85, method=4)
            new_data = buf.getvalue()
        if len(new_data) < original_size * 0.85:  # at least 15% smaller
            logger.info(
                "Optimized image %s: %dKB → %dKB (WebP)",
                mime, original_size // 1024, len(new_data) // 1024,
            )
            return new_data, "image/webp", "webp"
    except Exception as e:
        logger.warning("optimize_image failed, keeping original: %s", e)
    return data, mime, ext
