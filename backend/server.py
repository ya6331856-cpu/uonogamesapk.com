from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import uuid
import shutil
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse, Response, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict

import firebase_service as fbs
import object_storage as obs
import image_utils as imu

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

# ---------------------------------------------------------------------------
# App / Router
# ---------------------------------------------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model helpers
# ---------------------------------------------------------------------------
PyObjectId = Annotated[str, BeforeValidator(str)]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AppModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    version: str = "1.0.0"
    size: str = "0 MB"
    rating: float = 4.5
    downloads: int = 0
    verified: bool = True
    category: str = "Games"
    description: str = ""
    icon_url: str = ""
    apk_url: str = ""
    featured: bool = False
    featured_order: Optional[int] = None
    developer: str = ""
    package_name: str = ""
    min_android: str = "Android 6.0+"
    whats_new: str = ""
    screenshots: List[str] = Field(default_factory=list)
    trending: bool = False
    hidden: bool = False
    features: List[str] = Field(default_factory=list)
    requirements: str = ""
    permissions: List[str] = Field(default_factory=list)
    badge: str = "Auto"
    signup_bonus: str = ""
    min_withdraw: str = ""
    slug: str = ""
    seo_title: str = ""
    meta_description: str = ""
    keywords: str = ""
    focus_keyword: str = ""
    og_image: str = ""
    noindex: bool = False
    faq_items: List[dict] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)


class AppCreate(BaseModel):
    name: str
    version: str = "1.0.0"
    size: str = "0 MB"
    rating: float = 4.5
    downloads: int = 0
    verified: bool = True
    category: str = "Games"
    description: str = ""
    icon_url: str = ""
    apk_url: str = ""
    featured: bool = False
    featured_order: Optional[int] = None
    developer: str = ""
    package_name: str = ""
    min_android: str = "Android 6.0+"
    whats_new: str = ""
    screenshots: List[str] = Field(default_factory=list)
    trending: bool = False
    hidden: bool = False
    features: List[str] = Field(default_factory=list)
    requirements: str = ""
    permissions: List[str] = Field(default_factory=list)
    badge: str = "Auto"
    signup_bonus: str = ""
    min_withdraw: str = ""
    slug: str = ""
    seo_title: str = ""
    meta_description: str = ""
    keywords: str = ""
    focus_keyword: str = ""
    og_image: str = ""
    noindex: bool = False
    faq_items: List[dict] = Field(default_factory=list)


class AppUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[str] = None
    size: Optional[str] = None
    rating: Optional[float] = None
    downloads: Optional[int] = None
    verified: Optional[bool] = None
    category: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    apk_url: Optional[str] = None
    featured: Optional[bool] = None
    featured_order: Optional[int] = None
    developer: Optional[str] = None
    package_name: Optional[str] = None
    min_android: Optional[str] = None
    whats_new: Optional[str] = None
    screenshots: Optional[List[str]] = None
    trending: Optional[bool] = None
    hidden: Optional[bool] = None
    features: Optional[List[str]] = None
    requirements: Optional[str] = None
    permissions: Optional[List[str]] = None
    badge: Optional[str] = None
    signup_bonus: Optional[str] = None
    min_withdraw: Optional[str] = None
    slug: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: Optional[str] = None
    focus_keyword: Optional[str] = None
    og_image: Optional[str] = None
    noindex: Optional[bool] = None
    faq_items: Optional[List[dict]] = None


class LoginInput(BaseModel):
    email: str
    password: str


class FaqCreate(BaseModel):
    question: str
    answer: str
    order: Optional[int] = None


class FaqUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    order: Optional[int] = None


class ReorderInput(BaseModel):
    ids: List[str]


def serialize_app(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def to_object_id(app_id: str) -> ObjectId:
    try:
        return ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid app id")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # 1) Try Firebase ID token (primary auth)
    try:
        decoded = await asyncio.to_thread(fbs.verify_id_token, token)
        uid = decoded.get("uid") or decoded.get("user_id")
        email = decoded.get("email", "")
        allowed = await asyncio.to_thread(fbs.is_admin, uid, email)
        if not allowed:
            raise HTTPException(status_code=403, detail="Not an admin account")
        return {"id": uid, "email": email, "name": decoded.get("name", "Admin"), "role": "admin"}
    except HTTPException:
        raise
    except Exception:
        pass

    # 2) Fallback: legacy JWT (kept for transition)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(payload: LoginInput):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    return {
        "token": token,
        "user": {"id": str(user["_id"]), "email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ---------------------------------------------------------------------------
# Public app routes
# ---------------------------------------------------------------------------
@api_router.get("/apps")
async def list_apps(search: Optional[str] = None, category: Optional[str] = None, include_hidden: bool = False):
    apps = await fbs.list_apps()
    if not include_hidden:
        apps = [a for a in apps if not a.get("hidden")]
    if search:
        s = search.lower()
        apps = [a for a in apps if s in (a.get("name", "").lower())]
    if category and category != "All":
        apps = [a for a in apps if a.get("category") == category]

    featured = sorted(
        [a for a in apps if a.get("featured")],
        key=lambda a: (a.get("featured_order") or 99),
    )[:3]
    featured_ids = {a["id"] for a in featured}
    regular = sorted(
        [a for a in apps if a["id"] not in featured_ids],
        key=lambda a: a.get("created_at", ""),
        reverse=True,
    )
    trending = sorted(
        [a for a in apps if a.get("trending")],
        key=lambda a: a.get("downloads", 0),
        reverse=True,
    )
    return {"featured": featured, "apps": regular, "trending": trending, "total": len(apps)}


@api_router.get("/apps/slug/{slug}")
async def get_app_by_slug(slug: str):
    doc = await fbs.get_app_by_slug(slug)
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    return doc


@api_router.get("/apps/{app_id}")
async def get_app(app_id: str):
    doc = await fbs.get_app(app_id)
    if not doc:
        doc = await fbs.get_app_by_slug(app_id)
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    return doc


@api_router.get("/apps/{app_id}/download")
async def download_app(app_id: str):
    doc = await fbs.get_app(app_id)
    if not doc:
        doc = await fbs.get_app_by_slug(app_id)
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    await fbs.increment_downloads(doc["id"])
    apk_url = doc.get("apk_url", "")
    if not apk_url:
        raise HTTPException(status_code=404, detail="No APK file available")
    if apk_url.startswith("http"):
        return RedirectResponse(url=apk_url)
    filename = apk_url.split("/")[-1]
    # Try persistent object storage first
    obs_path = obs.build_upload_path(filename)
    try:
        data, ct = await asyncio.to_thread(obs.get_object, obs_path)
        download_name = f"{doc.get('name', 'app').replace(' ', '_')}.apk"
        return Response(
            content=data,
            media_type="application/vnd.android.package-archive",
            headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
        )
    except Exception:
        pass
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="APK file not found on server")
    download_name = f"{doc.get('name', 'app').replace(' ', '_')}.apk"
    return FileResponse(path=str(file_path), filename=download_name, media_type="application/vnd.android.package-archive")


@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve uploaded file. Tries Emergent Object Storage first (persistent),
    then falls back to local disk for backward compatibility with older uploads.
    """
    # Try persistent object storage first
    obs_path = obs.build_upload_path(filename)
    try:
        data, content_type = await asyncio.to_thread(obs.get_object, obs_path)
        return Response(content=data, media_type=content_type,
                        headers={"Cache-Control": "public, max-age=31536000, immutable"})
    except Exception:
        pass
    # Fallback to local disk (legacy files)
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        # Auto-migrate: upload to persistent storage so it survives future restarts
        try:
            content = file_path.read_bytes()
            ct = _guess_content_type(filename)
            await asyncio.to_thread(obs.put_object, obs_path, content, ct)
            logger.info("Auto-migrated legacy file to object storage: %s", filename)
        except Exception as e:
            logger.warning("Auto-migration failed for %s: %s", filename, e)
        return FileResponse(path=str(file_path))
    raise HTTPException(status_code=404, detail="File not found")


def _guess_content_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
        "apk": "application/vnd.android.package-archive",
        "pdf": "application/pdf",
    }.get(ext, "application/octet-stream")


# ---------------------------------------------------------------------------
# Admin app routes
# ---------------------------------------------------------------------------
@api_router.post("/admin/upload")
async def upload_file(
    file: UploadFile = File(...),
    kind: str = "auto",
    admin: dict = Depends(get_current_admin),
):
    """Upload a file to persistent Emergent Object Storage.

    Validates the file by sniffing magic bytes (rejects fake extensions).
    Large JPEG/PNG images are auto-converted to WebP for size reduction.

    Query params:
        kind: "image" | "apk" | "auto" — restricts allowed types on this endpoint.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file — please choose a valid file.")

    # Basic size guard (before mime sniff so we never load massive junk)
    ext_hint = Path(file.filename).suffix.lower().lstrip(".")
    max_bytes = 100 * 1024 * 1024 if ext_hint == "apk" else 15 * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large — max {max_bytes // (1024 * 1024)} MB.",
        )

    # Sniff magic bytes: this is the source of truth for type
    try:
        expected = None if kind == "auto" else kind
        mime, ext = imu.validate_upload(content, file.filename, expected=expected)
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))

    # Optimize large raster images to WebP (safe, only if it saves space)
    if mime in ("image/jpeg", "image/png"):
        content, mime, ext = imu.optimize_image(content, mime)

    unique_name = f"{uuid.uuid4().hex}.{ext}"

    # Try persistent object storage first
    obs_path = obs.build_upload_path(unique_name)
    try:
        await asyncio.to_thread(obs.put_object, obs_path, content, mime)
        return {
            "url": f"/api/uploads/{unique_name}",
            "filename": file.filename,
            "content_type": mime,
            "size": len(content),
            "storage": "emergent",
        }
    except Exception as e:
        logger.error("Object storage upload failed, falling back to local disk: %s", e)

    # Last-resort fallback (may not survive redeploy — user is warned)
    dest = UPLOAD_DIR / unique_name
    with dest.open("wb") as buffer:
        buffer.write(content)
    return {
        "url": f"/api/uploads/{unique_name}",
        "filename": file.filename,
        "content_type": mime,
        "size": len(content),
        "storage": "local",
        "warning": "Persistent storage was unavailable — file saved to local disk and may be lost on redeploy. Please try again.",
    }


@api_router.post("/admin/apps")
async def create_app(payload: AppCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    new_doc = await fbs.create_app(doc)
    if new_doc.get("category"):
        await fbs.upsert_category(new_doc["category"])
    return new_doc


@api_router.put("/admin/apps/{app_id}")
async def update_app(app_id: str, payload: AppUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    # Preserve existing images: never clear icon_url/apk_url/screenshots/og_image
    # when the caller sends null or an empty value. If admin wants to remove an
    # image, they must explicitly replace it — this prevents accidental wipes
    # during partial edits.
    for field in ("icon_url", "apk_url", "og_image"):
        if field in updates and not updates[field]:
            updates.pop(field, None)
    if "screenshots" in updates:
        val = updates["screenshots"]
        if not val or (isinstance(val, list) and all(not s for s in val)):
            updates.pop("screenshots", None)
    # If every field the caller sent was an image-clear (which we ignore to
    # preserve existing images), don't hit Firestore with an empty update.
    if not updates:
        existing = await fbs.get_app(app_id)
        if not existing:
            raise HTTPException(status_code=404, detail="App not found")
        return existing
    doc = await fbs.update_app(app_id, updates)
    if doc is None:
        raise HTTPException(status_code=404, detail="App not found")
    if doc.get("category"):
        await fbs.upsert_category(doc["category"])
    return doc


@api_router.delete("/admin/apps/{app_id}")
async def delete_app(app_id: str, admin: dict = Depends(get_current_admin)):
    ok = await fbs.delete_app(app_id)
    if not ok:
        raise HTTPException(status_code=404, detail="App not found")
    return {"success": True}


@api_router.get("/categories")
async def list_categories():
    return await fbs.list_categories()


# ---------------------------------------------------------------------------
# Media audit / repair
# ---------------------------------------------------------------------------
def _extract_upload_filename(url: str) -> str | None:
    """Extract the object storage filename from a stored URL, or None if external."""
    if not url or not isinstance(url, str):
        return None
    if url.startswith("http"):
        # External URLs (e.g. https://images.unsplash.com/…) — trust as-is.
        return None
    prefix = "/api/uploads/"
    if url.startswith(prefix):
        return url[len(prefix):].split("?")[0]
    return None


async def _check_upload_exists(filename: str) -> bool:
    obs_path = obs.build_upload_path(filename)
    try:
        exists = await asyncio.to_thread(obs.object_exists, obs_path)
        if exists:
            return True
    except Exception:
        pass
    # Fallback to local disk
    return (UPLOAD_DIR / filename).exists()


@api_router.get("/admin/media/audit")
async def media_audit(admin: dict = Depends(get_current_admin)):
    """Scan all stored image references (apps, blog, settings) and report which
    ones point to files that no longer exist in persistent storage.
    """
    broken: list[dict] = []
    checked = 0

    apps = await fbs.list_apps()
    for a in apps:
        for field in ("icon_url", "apk_url", "og_image"):
            url = a.get(field)
            fname = _extract_upload_filename(url) if url else None
            if fname:
                checked += 1
                if not await _check_upload_exists(fname):
                    broken.append({"kind": "app", "id": a.get("id"), "name": a.get("name"), "field": field, "url": url})
        for i, shot in enumerate(a.get("screenshots") or []):
            fname = _extract_upload_filename(shot)
            if fname:
                checked += 1
                if not await _check_upload_exists(fname):
                    broken.append({"kind": "app", "id": a.get("id"), "name": a.get("name"), "field": f"screenshots[{i}]", "url": shot})

    async for post in db.blog.find({}):
        url = post.get("cover_url")
        fname = _extract_upload_filename(url) if url else None
        if fname:
            checked += 1
            if not await _check_upload_exists(fname):
                broken.append({"kind": "blog", "id": str(post.get("_id")), "name": post.get("title", ""), "field": "cover_url", "url": url})

    settings_doc = await db.settings.find_one({}) or {}
    for path in [("hero", "banner_url"), ("seo", "og_image")]:
        val = (settings_doc.get(path[0]) or {}).get(path[1])
        fname = _extract_upload_filename(val) if val else None
        if fname:
            checked += 1
            if not await _check_upload_exists(fname):
                broken.append({"kind": "settings", "id": ".".join(path), "name": ".".join(path), "field": path[1], "url": val})

    return {"checked": checked, "broken_count": len(broken), "broken": broken}


@api_router.post("/admin/media/repair")
async def media_repair(admin: dict = Depends(get_current_admin)):
    """Clear broken image references so the frontend gracefully falls back to a placeholder
    instead of showing broken image icons. Never touches valid references.
    """
    audit = await media_audit(admin=admin)  # type: ignore[arg-type]
    cleared = 0
    for issue in audit["broken"]:
        if issue["kind"] == "app":
            field = issue["field"]
            if field.startswith("screenshots["):
                a = await fbs.get_app(issue["id"])
                if a:
                    new_list = [s for s in (a.get("screenshots") or []) if _extract_upload_filename(s) != _extract_upload_filename(issue["url"])]
                    await fbs.update_app(issue["id"], {"screenshots": new_list})
                    cleared += 1
            else:
                await fbs.update_app(issue["id"], {field: ""})
                cleared += 1
        elif issue["kind"] == "blog":
            await db.blog.update_one({"_id": ObjectId(issue["id"])}, {"$set": {"cover_url": ""}})
            cleared += 1
    return {"cleared": cleared, "broken_before": audit["broken_count"]}


# ---------------------------------------------------------------------------
# SEO: dynamic sitemap, robots, per-app meta (auto-updates from Firestore)
# ---------------------------------------------------------------------------
SITE_URL = os.environ.get("SITE_URL", "https://uonogamesapk.com").rstrip("/")


def _xml_escape(text: str) -> str:
    return (
        (text or "")
        .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace('"', "&quot;").replace("'", "&apos;")
    )


@api_router.get("/sitemap.xml")
async def sitemap():
    apps = await fbs.list_apps()
    apps = [a for a in apps if not a.get("hidden") and not a.get("noindex") and a.get("slug")]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [
        f'  <url><loc>{SITE_URL}/</loc><lastmod>{today}</lastmod>'
        f'<changefreq>daily</changefreq><priority>1.0</priority></url>'
    ]
    for a in apps:
        loc = f"{SITE_URL}/{_xml_escape(a['slug'])}"
        lastmod = (a.get("updated_at") or a.get("created_at") or today)[:10]
        img_url = a.get("icon_url", "") or ""
        if img_url and not img_url.startswith("http"):
            img_url = f"{SITE_URL}{img_url}"
        image_block = ""
        if img_url:
            image_block = (
                f"<image:image><image:loc>{_xml_escape(img_url)}</image:loc>"
                f"<image:title>{_xml_escape(a.get('name', ''))}</image:title></image:image>"
            )
        urls.append(
            f"  <url><loc>{loc}</loc><lastmod>{lastmod}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>0.8</priority>{image_block}</url>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + "\n".join(urls)
        + "\n</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


@api_router.get("/robots.txt")
async def robots_txt():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin\n\n"
        f"Sitemap: {SITE_URL}/api/sitemap.xml\n"
    )
    return Response(content=content, media_type="text/plain")


@api_router.get("/seo/{slug}")
async def seo_meta(slug: str):
    a = await fbs.get_app_by_slug(slug)
    if not a:
        a = await fbs.get_app(slug)
    if not a:
        raise HTTPException(status_code=404, detail="App not found")
    title = a.get("seo_title") or f"{a.get('name', '')} APK Download - YONO GAMES"
    desc = a.get("meta_description") or (a.get("description", "")[:160])
    return JSONResponse({
        "slug": a.get("slug", slug),
        "title": title,
        "description": desc,
        "keywords": a.get("keywords", ""),
        "image": a.get("icon_url", ""),
        "url": f"{SITE_URL}/{a.get('slug', slug)}",
        "name": a.get("name", ""),
    })


# ---------------------------------------------------------------------------
# Admin SEO Dashboard endpoints
# ---------------------------------------------------------------------------
@api_router.get("/admin/seo/overview")
async def seo_overview(admin: dict = Depends(get_current_admin)):
    """Aggregate SEO health across all apps for the SEO Dashboard."""
    apps = await fbs.list_apps()
    total = len(apps)
    indexed = 0
    missing_title = 0
    missing_desc = 0
    missing_keywords = 0
    missing_icon = 0
    duplicate_slugs = {}
    fields_score = 0
    max_fields = 6  # title, desc, keywords, slug, icon, focus_keyword
    for a in apps:
        if a.get("hidden") or a.get("noindex"):
            pass
        else:
            indexed += 1
        if not a.get("seo_title"): missing_title += 1
        if not a.get("meta_description"): missing_desc += 1
        if not a.get("keywords"): missing_keywords += 1
        if not a.get("icon_url"): missing_icon += 1
        slug = a.get("slug", "")
        if slug:
            duplicate_slugs[slug] = duplicate_slugs.get(slug, 0) + 1
        # per-app score
        score = sum(1 for k in ["seo_title", "meta_description", "keywords", "slug", "icon_url", "focus_keyword"] if a.get(k))
        fields_score += score
    duplicates = [s for s, c in duplicate_slugs.items() if c > 1]
    overall_score = int((fields_score / (max_fields * total)) * 100) if total else 0
    return {
        "total_apps": total,
        "indexed": indexed,
        "noindex": total - indexed,
        "missing_title": missing_title,
        "missing_description": missing_desc,
        "missing_keywords": missing_keywords,
        "missing_icon": missing_icon,
        "duplicate_slugs": duplicates,
        "seo_score": overall_score,
        "sitemap_url": f"{SITE_URL}/api/sitemap.xml",
        "robots_url": f"{SITE_URL}/api/robots.txt",
    }


@api_router.get("/admin/seo/apps")
async def seo_apps_list(admin: dict = Depends(get_current_admin)):
    """Per-app SEO status list for the SEO Dashboard table."""
    apps = await fbs.list_apps()
    result = []
    for a in apps:
        score = sum(1 for k in ["seo_title", "meta_description", "keywords", "slug", "icon_url", "focus_keyword"] if a.get(k))
        result.append({
            "id": a.get("id"),
            "name": a.get("name", ""),
            "slug": a.get("slug", ""),
            "seo_title": a.get("seo_title", ""),
            "meta_description": a.get("meta_description", ""),
            "keywords": a.get("keywords", ""),
            "focus_keyword": a.get("focus_keyword", ""),
            "noindex": bool(a.get("noindex", False)),
            "hidden": bool(a.get("hidden", False)),
            "has_icon": bool(a.get("icon_url", "")),
            "score": int((score / 6) * 100),
        })
    return result


@api_router.post("/admin/seo/auto-generate/{app_id}")
async def seo_auto_generate(app_id: str, admin: dict = Depends(get_current_admin)):
    """Auto-generate SEO fields for a given app from its name/category/description."""
    a = await fbs.get_app(app_id)
    if not a:
        raise HTTPException(status_code=404, detail="App not found")
    name = a.get("name", "")
    category = a.get("category", "Games")
    description = a.get("description", "") or ""
    focus = a.get("focus_keyword") or f"{name} APK Download"
    title = a.get("seo_title") or f"{name} APK Download - Latest Version | YONO GAMES"
    if len(title) > 60:
        title = title[:57] + "..."
    desc = a.get("meta_description") or (
        f"Download {name} APK latest version for free. {description[:110]}"
        if description else
        f"Download {name} APK latest version free from YONO GAMES (uonogamesapk.com). Fast, safe and verified {category.lower()} download."
    )
    if len(desc) > 160:
        desc = desc[:157] + "..."
    keywords = a.get("keywords") or (
        f"{name} apk, {name} download, {name} latest version, {category.lower()} apk, "
        f"uono games apk, {name.lower()} free download"
    )
    updates = {
        "seo_title": title,
        "meta_description": desc,
        "keywords": keywords,
        "focus_keyword": focus,
    }
    doc = await fbs.update_app(app_id, updates)
    return doc


@api_router.post("/admin/seo/bulk-fix")
async def seo_bulk_fix(admin: dict = Depends(get_current_admin)):
    """Fix all apps with missing SEO fields in one shot."""
    apps = await fbs.list_apps()
    fixed = 0
    for a in apps:
        if a.get("seo_title") and a.get("meta_description") and a.get("keywords"):
            continue
        name = a.get("name", "")
        category = a.get("category", "Games")
        description = a.get("description", "") or ""
        updates = {}
        if not a.get("seo_title"):
            t = f"{name} APK Download - Latest Version | YONO GAMES"
            updates["seo_title"] = t[:60]
        if not a.get("meta_description"):
            d = (f"Download {name} APK latest version for free. {description[:110]}"
                 if description else
                 f"Download {name} APK latest version free from YONO GAMES (uonogamesapk.com). Fast, safe and verified {category.lower()} download.")
            updates["meta_description"] = d[:160]
        if not a.get("keywords"):
            updates["keywords"] = (
                f"{name} apk, {name} download, {name} latest version, "
                f"{category.lower()} apk, uono games apk"
            )
        if not a.get("focus_keyword"):
            updates["focus_keyword"] = f"{name} APK Download"
        if updates:
            await fbs.update_app(a["id"], updates)
            fixed += 1
    return {"fixed": fixed, "total": len(apps)}


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------
class BlogCreate(BaseModel):
    title: str
    slug: str = ""
    excerpt: str = ""
    content: str = ""
    cover_url: str = ""
    published: bool = True
    category: str = ""
    tags: List[str] = Field(default_factory=list)
    author: str = ""
    scheduled_at: str = ""  # ISO datetime; if in the future, treat as draft
    seo_title: str = ""
    meta_description: str = ""
    keywords: str = ""
    focus_keyword: str = ""
    og_image: str = ""
    noindex: bool = False


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_url: Optional[str] = None
    published: Optional[bool] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    author: Optional[str] = None
    scheduled_at: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: Optional[str] = None
    focus_keyword: Optional[str] = None
    og_image: Optional[str] = None
    noindex: Optional[bool] = None


def slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")


def _blog_is_live(doc: dict) -> bool:
    """A post is live if published=True and (no schedule OR schedule already passed)."""
    if not doc.get("published"):
        return False
    scheduled = doc.get("scheduled_at") or ""
    if not scheduled:
        return True
    try:
        dt = datetime.fromisoformat(scheduled.replace("Z", "+00:00"))
        return datetime.now(timezone.utc) >= dt
    except Exception:
        return True  # unparseable → treat as live


@api_router.get("/blog")
async def list_blog(category: Optional[str] = None, tag: Optional[str] = None):
    query: dict = {"published": True}
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    docs = await db.blog.find(query).sort("created_at", -1).to_list(500)
    return [serialize_doc(d) for d in docs if _blog_is_live(d)]


@api_router.get("/blog/{slug}")
async def get_blog(slug: str):
    doc = await db.blog.find_one({"slug": slug})
    if not doc or not _blog_is_live(doc):
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_doc(doc)


@api_router.get("/admin/blog")
async def admin_list_blog(admin: dict = Depends(get_current_admin)):
    docs = await db.blog.find().sort("created_at", -1).to_list(500)
    return [serialize_doc(d) for d in docs]


@api_router.post("/admin/blog")
async def create_blog(payload: BlogCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["slug"] = slugify(doc["slug"] or doc["title"])
    doc["created_at"] = now_iso()
    res = await db.blog.insert_one(doc)
    return serialize_doc(await db.blog.find_one({"_id": res.inserted_id}))


@api_router.put("/admin/blog/{bid}")
async def update_blog(bid: str, payload: BlogUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("slug"):
        updates["slug"] = slugify(updates["slug"])
    r = await db.blog.update_one({"_id": to_object_id(bid)}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_doc(await db.blog.find_one({"_id": to_object_id(bid)}))


@api_router.delete("/admin/blog/{bid}")
async def delete_blog(bid: str, admin: dict = Depends(get_current_admin)):
    r = await db.blog.delete_one({"_id": to_object_id(bid)})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@api_router.get("/blog-meta")
async def blog_meta():
    """Public list of all categories & tags used across live posts."""
    docs = await db.blog.find({"published": True}).to_list(1000)
    cats: set[str] = set()
    tags: set[str] = set()
    for d in docs:
        if not _blog_is_live(d):
            continue
        if d.get("category"):
            cats.add(d["category"])
        for t in d.get("tags") or []:
            if t:
                tags.add(t)
    return {"categories": sorted(cats), "tags": sorted(tags)}


# ---------------------------------------------------------------------------
# Related apps (public)
# ---------------------------------------------------------------------------
@api_router.get("/apps/{slug_or_id}/related")
async def related_apps(slug_or_id: str, limit: int = 6):
    """Return apps most similar to the given one.

    Scoring:
      +5 same category
      +2 each shared feature keyword
      +1 close download count (log-scale bucket)
      -inf if hidden or same id
    """
    src = await fbs.get_app_by_slug(slug_or_id) or await fbs.get_app(slug_or_id)
    if not src:
        raise HTTPException(status_code=404, detail="App not found")
    src_id = src.get("id")
    src_cat = src.get("category", "")
    src_features = {str(f).lower() for f in (src.get("features") or [])}
    src_dl = max(int(src.get("downloads", 0)), 1)

    import math
    apps = await fbs.list_apps()
    scored: list[tuple[float, dict]] = []
    for a in apps:
        if a.get("id") == src_id or a.get("hidden"):
            continue
        score = 0.0
        if src_cat and a.get("category") == src_cat:
            score += 5
        feats = {str(f).lower() for f in (a.get("features") or [])}
        score += 2 * len(feats & src_features)
        # Popularity closeness bonus
        dl = max(int(a.get("downloads", 0)), 1)
        score += 1 / (1 + abs(math.log10(dl) - math.log10(src_dl)))
        scored.append((score, a))

    scored.sort(key=lambda t: t[0], reverse=True)
    return [a for _, a in scored[: max(1, min(limit, 20))]]


# ---------------------------------------------------------------------------
# Media Library
# ---------------------------------------------------------------------------
@api_router.get("/admin/media")
async def list_media(admin: dict = Depends(get_current_admin)):
    files = []
    for f in sorted(UPLOAD_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if f.is_file():
            files.append({
                "filename": f.name,
                "url": f"/api/uploads/{f.name}",
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime, timezone.utc).isoformat(),
            })
    return files


@api_router.delete("/admin/media/{filename}")
async def delete_media(filename: str, admin: dict = Depends(get_current_admin)):
    fp = UPLOAD_DIR / filename
    if fp.exists() and fp.is_file():
        fp.unlink()
        return {"success": True}
    raise HTTPException(status_code=404, detail="File not found")


# ---------------------------------------------------------------------------
# Users / Security
# ---------------------------------------------------------------------------
@api_router.get("/admin/users")
async def list_users(admin: dict = Depends(get_current_admin)):
    docs = await db.users.find().to_list(100)
    return [{"id": str(u["_id"]), "email": u["email"], "name": u.get("name", ""), "role": u.get("role", "admin"), "created_at": u.get("created_at", "")} for u in docs]


@api_router.put("/admin/password")
async def change_password(payload: dict, admin: dict = Depends(get_current_admin)):
    current = payload.get("current", "")
    new = payload.get("new", "")
    if len(new) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    user = await db.users.find_one({"_id": ObjectId(admin.get("id") or admin.get("_id"))})
    if not user or not verify_password(current, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(new)}})
    return {"success": True}


# ---------------------------------------------------------------------------
# Backup (export / import)
# ---------------------------------------------------------------------------
BACKUP_COLLECTIONS = ["apps", "faqs", "reviews", "winners", "codes", "blog"]


@api_router.get("/admin/backup")
async def export_backup(admin: dict = Depends(get_current_admin)):
    data = {}
    for coll in BACKUP_COLLECTIONS:
        docs = await db[coll].find().to_list(5000)
        for d in docs:
            d["_id"] = str(d["_id"])
        data[coll] = docs
    settings = await db.settings.find_one({"_id": SETTINGS_ID}) or {}
    settings.pop("_id", None)
    data["settings"] = settings
    data["exported_at"] = now_iso()
    return data


@api_router.post("/admin/backup/restore")
async def restore_backup(payload: dict, admin: dict = Depends(get_current_admin)):
    for coll in BACKUP_COLLECTIONS:
        if coll in payload and isinstance(payload[coll], list):
            await db[coll].delete_many({})
            docs = []
            for d in payload[coll]:
                d.pop("_id", None)
                docs.append(d)
            if docs:
                await db[coll].insert_many(docs)
    if "settings" in payload and isinstance(payload["settings"], dict):
        s = dict(payload["settings"])
        s.pop("_id", None)
        await db.settings.update_one({"_id": SETTINGS_ID}, {"$set": s}, upsert=True)
    return {"success": True}


@api_router.get("/")
async def root():
    return {"message": "YONO GAMES API"}


# ---------------------------------------------------------------------------
# Site Settings (single CMS document) — controls branding, hero, theme,
# sections, telegram, seo, ads, announcement, legal pages.
# ---------------------------------------------------------------------------
SETTINGS_ID = "site"


def default_settings() -> dict:
    return {
        "branding": {
            "site_name": "YONO GAMES",
            "logo_text": "YONO GAMES",
            "logo_url": "/logo-v2.png",
            "favicon_url": "/logo-icon-v2.png",
            "footer_text": "Premium APK store for safe, verified Android games and apps.",
            "copyright": "YONO GAMES · uonogamesapk.com",
        },
        "contact": {"email": "support@uonogamesapk.com", "whatsapp": "", "instagram": "", "youtube": "", "twitter": ""},
        "hero": {
            "enabled": True,
            "banner_url": "/hero-banner.png",
            "headline": "Download Premium APK Games",
            "subtitle": "Fast, safe & verified downloads",
            "button_text": "Browse Apps",
            "button_link": "#apps",
        },
        "stats": {
            "enabled": True,
            "items": [
                {"label": "Downloads", "value": "10M", "suffix": "+"},
                {"label": "Verified", "value": "auto", "suffix": ""},
                {"label": "Rating", "value": "4.8", "suffix": ""},
            ],
        },
        "telegram": {"enabled": True, "link": "https://t.me/", "cta_text": "Join our Telegram", "sub_text": "Get instant updates & new APK releases", "member_count": ""},
        "announcement": {"enabled": False, "text": "Welcome to YONO GAMES — Play and Win!", "link": ""},
        "theme": {"primary": "#FFC107", "secondary": "#FFB300", "radius": 20},
        "sections": [
            {"id": "featured", "label": "Featured Apps", "enabled": True},
            {"id": "rummy", "label": "Rummy Features", "enabled": True},
            {"id": "telegram", "label": "Telegram CTA", "enabled": True},
            {"id": "winners", "label": "Live Winners", "enabled": True},
            {"id": "apps", "label": "App List", "enabled": True},
            {"id": "reviews", "label": "Reviews", "enabled": True},
            {"id": "faq", "label": "FAQ", "enabled": True},
            {"id": "legal", "label": "Legal", "enabled": True},
        ],
        "categories": ["Games", "Puzzle", "Simulation", "Tools", "Social", "Entertainment"],
        "seo": {
            "meta_title": "YONO GAMES - Play and Win | Premium APK Store",
            "meta_description": "Download premium APK games. Fast, safe & verified.",
            "keywords": "apk, rummy, games, download, android",
            "og_image": "/hero-banner.png",
        },
        "ads": {"enabled": False, "adsense_client": "", "adsense_slot": "", "banner_html": ""},
        "analytics": {
            "ga4_id": "",             # e.g. G-XXXXXXXXXX
            "gsc_verification": "",   # google-site-verification content value
            "bing_verification": "",  # msvalidate.01 value
        },
        "winners_config": {"enabled": True, "scroll_speed": 40},
        "legal": {},  # populated from LEGAL_DEFAULTS on seed
    }


async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({"_id": SETTINGS_ID})
    if not doc:
        doc = {"_id": SETTINGS_ID, **default_settings()}
        await db.settings.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/settings")
async def get_settings():
    return await get_settings_doc()


@api_router.put("/admin/settings")
async def update_settings(payload: dict, admin: dict = Depends(get_current_admin)):
    payload.pop("_id", None)
    await db.settings.update_one({"_id": SETTINGS_ID}, {"$set": payload}, upsert=True)
    return await get_settings_doc()


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------
def serialize_doc(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


class ReviewCreate(BaseModel):
    name: str
    rating: int = 5
    text: str = ""
    photo_url: str = ""
    approved: bool = True


class ReviewUpdate(BaseModel):
    name: Optional[str] = None
    rating: Optional[int] = None
    text: Optional[str] = None
    photo_url: Optional[str] = None
    approved: Optional[bool] = None


@api_router.get("/reviews")
async def list_reviews():
    docs = await db.reviews.find({"approved": True}).sort("created_at", -1).to_list(200)
    return [serialize_doc(d) for d in docs]


@api_router.get("/admin/reviews")
async def admin_list_reviews(admin: dict = Depends(get_current_admin)):
    docs = await db.reviews.find().sort("created_at", -1).to_list(500)
    return [serialize_doc(d) for d in docs]


@api_router.post("/admin/reviews")
async def create_review(payload: ReviewCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["created_at"] = now_iso()
    res = await db.reviews.insert_one(doc)
    return serialize_doc(await db.reviews.find_one({"_id": res.inserted_id}))


@api_router.put("/admin/reviews/{rid}")
async def update_review(rid: str, payload: ReviewUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    r = await db.reviews.update_one({"_id": to_object_id(rid)}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return serialize_doc(await db.reviews.find_one({"_id": to_object_id(rid)}))


@api_router.delete("/admin/reviews/{rid}")
async def delete_review(rid: str, admin: dict = Depends(get_current_admin)):
    r = await db.reviews.delete_one({"_id": to_object_id(rid)})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# Live Winners
# ---------------------------------------------------------------------------
class WinnerCreate(BaseModel):
    name: str
    amount: str = ""
    game: str = ""


class WinnerUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[str] = None
    game: Optional[str] = None


@api_router.get("/winners")
async def list_winners():
    docs = await db.winners.find().sort("created_at", -1).to_list(100)
    return [serialize_doc(d) for d in docs]


@api_router.post("/admin/winners")
async def create_winner(payload: WinnerCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["created_at"] = now_iso()
    res = await db.winners.insert_one(doc)
    return serialize_doc(await db.winners.find_one({"_id": res.inserted_id}))


@api_router.put("/admin/winners/{wid}")
async def update_winner(wid: str, payload: WinnerUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    r = await db.winners.update_one({"_id": to_object_id(wid)}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Winner not found")
    return serialize_doc(await db.winners.find_one({"_id": to_object_id(wid)}))


@api_router.delete("/admin/winners/{wid}")
async def delete_winner(wid: str, admin: dict = Depends(get_current_admin)):
    r = await db.winners.delete_one({"_id": to_object_id(wid)})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Winner not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# Redeem Codes
# ---------------------------------------------------------------------------
class CodeCreate(BaseModel):
    code: str
    reward: str = ""
    expiry: str = ""  # ISO date string, optional
    usage_limit: int = 0  # 0 = unlimited
    active: bool = True


class CodeUpdate(BaseModel):
    code: Optional[str] = None
    reward: Optional[str] = None
    expiry: Optional[str] = None
    usage_limit: Optional[int] = None
    active: Optional[bool] = None


@api_router.get("/admin/codes")
async def list_codes(admin: dict = Depends(get_current_admin)):
    docs = await db.codes.find().sort("created_at", -1).to_list(500)
    return [serialize_doc(d) for d in docs]


@api_router.post("/admin/codes")
async def create_code(payload: CodeCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["code"] = doc["code"].upper().strip()
    doc["used_count"] = 0
    doc["created_at"] = now_iso()
    res = await db.codes.insert_one(doc)
    return serialize_doc(await db.codes.find_one({"_id": res.inserted_id}))


@api_router.put("/admin/codes/{cid}")
async def update_code(cid: str, payload: CodeUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if "code" in updates:
        updates["code"] = updates["code"].upper().strip()
    r = await db.codes.update_one({"_id": to_object_id(cid)}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    return serialize_doc(await db.codes.find_one({"_id": to_object_id(cid)}))


@api_router.delete("/admin/codes/{cid}")
async def delete_code(cid: str, admin: dict = Depends(get_current_admin)):
    r = await db.codes.delete_one({"_id": to_object_id(cid)})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    return {"success": True}


@api_router.post("/redeem")
async def redeem_code(payload: dict):
    code = (payload.get("code") or "").upper().strip()
    if not code:
        raise HTTPException(status_code=400, detail="Enter a code")
    doc = await db.codes.find_one({"code": code})
    if not doc or not doc.get("active", True):
        raise HTTPException(status_code=404, detail="Invalid or inactive code")
    if doc.get("expiry"):
        try:
            if datetime.fromisoformat(doc["expiry"]).date() < datetime.now(timezone.utc).date():
                raise HTTPException(status_code=400, detail="This code has expired")
        except ValueError:
            pass
    limit = doc.get("usage_limit", 0)
    if limit and doc.get("used_count", 0) >= limit:
        raise HTTPException(status_code=400, detail="This code has reached its usage limit")
    await db.codes.update_one({"_id": doc["_id"]}, {"$inc": {"used_count": 1}})
    return {"success": True, "reward": doc.get("reward", "Reward unlocked!")}


# ---------------------------------------------------------------------------
# Basic analytics (aggregate from existing data)
# ---------------------------------------------------------------------------
@api_router.get("/admin/analytics")
async def analytics(admin: dict = Depends(get_current_admin)):
    apps = await db.apps.find().to_list(1000)
    total_downloads = sum(a.get("downloads", 0) for a in apps)
    by_category: dict = {}
    for a in apps:
        by_category[a.get("category", "Other")] = by_category.get(a.get("category", "Other"), 0) + a.get("downloads", 0)
    top = sorted(apps, key=lambda a: a.get("downloads", 0), reverse=True)[:5]
    return {
        "total_apps": len(apps),
        "total_downloads": total_downloads,
        "total_reviews": await db.reviews.count_documents({}),
        "total_faqs": await db.faqs.count_documents({}),
        "total_codes": await db.codes.count_documents({}),
        "by_category": by_category,
        "top_apps": [{"name": a.get("name"), "downloads": a.get("downloads", 0)} for a in top],
    }


# ---------------------------------------------------------------------------
# FAQ routes
# ---------------------------------------------------------------------------
def serialize_faq(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


@api_router.get("/faqs")
async def list_faqs():
    docs = await db.faqs.find().sort("order", 1).to_list(1000)
    return [serialize_faq(d) for d in docs]


@api_router.post("/admin/faqs")
async def create_faq(payload: FaqCreate, admin: dict = Depends(get_current_admin)):
    order = payload.order
    if order is None:
        order = await db.faqs.count_documents({})
    doc = {"question": payload.question, "answer": payload.answer, "order": order, "created_at": now_iso()}
    result = await db.faqs.insert_one(doc)
    new_doc = await db.faqs.find_one({"_id": result.inserted_id})
    return serialize_faq(new_doc)


@api_router.put("/admin/faqs/reorder")
async def reorder_faqs(payload: ReorderInput, admin: dict = Depends(get_current_admin)):
    for index, faq_id in enumerate(payload.ids):
        await db.faqs.update_one({"_id": to_object_id(faq_id)}, {"$set": {"order": index}})
    return {"success": True}


@api_router.put("/admin/faqs/{faq_id}")
async def update_faq(faq_id: str, payload: FaqUpdate, admin: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.faqs.update_one({"_id": to_object_id(faq_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    doc = await db.faqs.find_one({"_id": to_object_id(faq_id)})
    return serialize_faq(doc)


@api_router.delete("/admin/faqs/{faq_id}")
async def delete_faq(faq_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.faqs.delete_one({"_id": to_object_id(faq_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------
SAMPLE_APPS = [
    {
        "name": "Pixel Racer X", "version": "3.2.1", "size": "78 MB", "rating": 4.8,
        "downloads": 1250000, "verified": True, "category": "Games",
        "description": "High-octane arcade racing with stunning pixel graphics and online multiplayer.",
        "icon_url": "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/pixel-racer-x.apk",
        "featured": True, "featured_order": 1,
    },
    {
        "name": "Shadow Legends", "version": "5.0.4", "size": "142 MB", "rating": 4.7,
        "downloads": 890000, "verified": True, "category": "Games",
        "description": "Epic RPG adventure. Build your team of heroes and conquer the shadow realm.",
        "icon_url": "https://images.unsplash.com/photo-1685381949388-bb0402fbe133?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/shadow-legends.apk",
        "featured": True, "featured_order": 2,
    },
    {
        "name": "Neon Puzzle Blast", "version": "2.1.0", "size": "45 MB", "rating": 4.9,
        "downloads": 2100000, "verified": True, "category": "Puzzle",
        "description": "Addictive match-3 puzzle game with glowing neon visuals.",
        "icon_url": "https://images.unsplash.com/photo-1659885785824-3e72856b8fef?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/neon-puzzle.apk",
        "featured": True, "featured_order": 3,
    },
    {
        "name": "Sky Warriors: Air Combat", "version": "4.5.2", "size": "210 MB", "rating": 4.6,
        "downloads": 560000, "verified": True, "category": "Games",
        "description": "Take to the skies in intense aerial dogfights.",
        "icon_url": "https://images.unsplash.com/photo-1740059030535-a75661748bc8?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/sky-warriors.apk",
        "featured": False,
    },
    {
        "name": "Crypto Miner Tycoon", "version": "1.8.7", "size": "62 MB", "rating": 4.3,
        "downloads": 320000, "verified": True, "category": "Simulation",
        "description": "Build your crypto empire in this idle tycoon simulator.",
        "icon_url": "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/crypto-miner.apk",
        "featured": False,
    },
    {
        "name": "Word Quest Adventure", "version": "6.0.1", "size": "38 MB", "rating": 4.5,
        "downloads": 780000, "verified": True, "category": "Puzzle",
        "description": "Expand your vocabulary while exploring magical lands.",
        "icon_url": "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/word-quest.apk",
        "featured": False,
    },
    {
        "name": "Battle Royale Legends", "version": "12.3.0", "size": "1.2 GB", "rating": 4.4,
        "downloads": 5400000, "verified": True, "category": "Games",
        "description": "Drop in, gear up, and be the last one standing.",
        "icon_url": "https://images.unsplash.com/photo-1685381949388-bb0402fbe133?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/battle-royale.apk",
        "featured": False,
    },
    {
        "name": "Zen Garden Idle", "version": "2.4.9", "size": "54 MB", "rating": 4.7,
        "downloads": 410000, "verified": True, "category": "Simulation",
        "description": "Relax and grow your own peaceful zen garden.",
        "icon_url": "https://images.unsplash.com/photo-1659885785824-3e72856b8fef?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
        "apk_url": "https://example.com/apk/zen-garden.apk",
        "featured": False,
    },
]


DEFAULT_FAQS = [
    {"question": "Is this APK safe to install?", "answer": "Yes. Every APK listed on YONO GAMES (uonogamesapk.com) is scanned for malware and manually reviewed before publishing. Files marked with the green 'Verified' badge have passed our security checks. We recommend only downloading from this official page and always keeping Google Play Protect enabled on your device for an extra layer of safety."},
    {"question": "How do I download the APK?", "answer": "Simply tap the yellow 'Download APK' button on any app card. The download will begin instantly. Once finished, open the file from your notification bar or your device's Downloads folder and tap 'Install'. The entire process usually takes less than a minute on a normal connection."},
    {"question": "What is the latest APK version?", "answer": "The version number is displayed directly on each app card (for example, v3.2.1). We always publish the most recent stable release, and the version shown is the one you will download. Check back regularly or join our Telegram channel to be notified the moment a new version goes live."},
    {"question": "Is the APK verified?", "answer": "APKs displaying the green 'Verified' badge have been checked for authenticity, tested for stability, and confirmed to be free of malicious code. Verification means the file matches the original developer package and has not been tampered with or repackaged with unwanted software."},
    {"question": "What Android version is supported?", "answer": "Most APKs on our store support Android 6.0 (Marshmallow) and above, with the best experience on Android 8.0+. Some newer titles may require Android 9 or higher. If an app fails to install, your device may be running an unsupported Android version — check Settings > About Phone > Android Version."},
    {"question": "How do I update the APK?", "answer": "To update, return to this page and download the latest version. Install it over your existing app — your data and progress are preserved in most cases. You do not need to uninstall the old version first unless you receive a 'signature mismatch' error, in which case remove the old app and reinstall."},
    {"question": "Why is installation blocked?", "answer": "Android blocks installs from outside the Play Store by default. To fix this, go to Settings > Security (or Apps & Notifications > Special App Access > Install Unknown Apps), select your browser or file manager, and enable 'Allow from this source'. Then reopen the downloaded APK and installation will proceed."},
    {"question": "Is registration free?", "answer": "Yes, downloading APKs from YONO GAMES (uonogamesapk.com) is completely free and does not require any account or registration. Some individual apps may offer optional in-app registration or purchases, but browsing and downloading from our store never costs anything."},
    {"question": "How do I contact support?", "answer": "You can reach our support team through the Contact link in the footer or by joining our official Telegram channel, where our team responds to questions quickly. For issues with a specific app, please include the app name, version number, and your Android version so we can help you faster."},
    {"question": "How often is the APK updated?", "answer": "We monitor developer releases continuously and typically publish new versions within 24–72 hours of an official update. Popular titles are updated even faster. Follow our Telegram channel to get instant alerts whenever a new or updated APK becomes available on the store."},
]


async def seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    # Remove any stale admin accounts (e.g. after rotating ADMIN_EMAIL)
    await db.users.delete_many({"role": "admin", "email": {"$ne": admin_email}})
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.apps.count_documents({}) == 0:
        docs = [{**a, "created_at": now_iso()} for a in SAMPLE_APPS]
        await db.apps.insert_many(docs)
        logger.info("Seeded %d sample apps", len(docs))

    # Backfill detail fields on older app documents so detail pages look complete
    default_shots = [
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80",
    ]
    await db.apps.update_many(
        {"developer": {"$exists": False}},
        {"$set": {
            "developer": "Uonogames Studios",
            "package_name": "com.uonogames.app",
            "min_android": "Android 6.0+",
            "whats_new": "Performance improvements, new levels and bug fixes for a smoother experience.",
            "screenshots": default_shots,
        }},
    )

    if await db.faqs.count_documents({}) == 0:
        faq_docs = [{**f, "order": i, "created_at": now_iso()} for i, f in enumerate(DEFAULT_FAQS)]
        await db.faqs.insert_many(faq_docs)
        logger.info("Seeded %d FAQs", len(faq_docs))

    # Mark first two non-featured apps as trending if none set
    if await db.apps.count_documents({"trending": True}) == 0:
        cursor = db.apps.find({"featured": {"$ne": True}}).sort("downloads", -1).limit(4)
        async for a in cursor:
            await db.apps.update_one({"_id": a["_id"]}, {"$set": {"trending": True}})

    # Initialize settings singleton
    await get_settings_doc()
    # Backfill any newly added default keys (e.g. iteration 5: categories) so existing sites get them
    defaults = default_settings()
    current_settings = await db.settings.find_one({"_id": SETTINGS_ID}) or {}
    to_add = {k: v for k, v in defaults.items() if k not in current_settings}
    if to_add:
        await db.settings.update_one({"_id": SETTINGS_ID}, {"$set": to_add})
    # Ensure categories is never empty
    if not current_settings.get("categories") and "categories" not in to_add:
        await db.settings.update_one({"_id": SETTINGS_ID}, {"$set": {"categories": defaults["categories"]}})

    # Seed sample reviews
    if await db.reviews.count_documents({}) == 0:
        await db.reviews.insert_many([
            {"name": "Rahul S.", "rating": 5, "text": "Super fast downloads and totally safe. Best APK store!", "photo_url": "", "approved": True, "created_at": now_iso()},
            {"name": "Priya M.", "rating": 5, "text": "Won real cash on rummy and withdrawal was instant. Loved it.", "photo_url": "", "approved": True, "created_at": now_iso()},
            {"name": "Aman K.", "rating": 4, "text": "Great collection of games, easy to install. Recommended.", "photo_url": "", "approved": True, "created_at": now_iso()},
        ])

    # Seed sample winners
    if await db.winners.count_documents({}) == 0:
        await db.winners.insert_many([
            {"name": "Vikram", "amount": "₹12,500", "game": "Points Rummy", "created_at": now_iso()},
            {"name": "Sneha", "amount": "₹8,200", "game": "Pool Rummy", "created_at": now_iso()},
            {"name": "Arjun", "amount": "₹25,000", "game": "Deals Rummy", "created_at": now_iso()},
            {"name": "Neha", "amount": "₹5,750", "game": "Points Rummy", "created_at": now_iso()},
        ])

    # Seed a sample redeem code
    if await db.codes.count_documents({}) == 0:
        await db.codes.insert_one({"code": "WELCOME100", "reward": "₹100 bonus on first deposit", "expiry": "", "usage_limit": 0, "used_count": 0, "active": True, "created_at": now_iso()})


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await seed()
    # Initialize persistent object storage
    try:
        await asyncio.to_thread(obs.init_storage)
        logger.info("Emergent Object Storage ready")
    except Exception as e:
        logger.error("Object storage init failed: %s", e)
    # Ensure the admin exists in Firebase Auth for admin-panel login
    try:
        uid = await asyncio.to_thread(
            fbs.ensure_admin_user,
            os.environ["ADMIN_EMAIL"],
            os.environ["ADMIN_PASSWORD"],
        )
        logger.info("Firebase admin ensured: %s", uid)
    except Exception as e:
        logger.error("Failed to ensure Firebase admin user: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
