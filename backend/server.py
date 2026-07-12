from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import uuid
import shutil
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict

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
    query: dict = {}
    if not include_hidden:
        query["hidden"] = {"$ne": True}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category and category != "All":
        query["category"] = category
    docs = await db.apps.find(query).to_list(1000)
    apps = [serialize_app(d) for d in docs]

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


@api_router.get("/apps/{app_id}")
async def get_app(app_id: str):
    doc = await db.apps.find_one({"_id": to_object_id(app_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    return serialize_app(doc)


@api_router.get("/apps/{app_id}/download")
async def download_app(app_id: str):
    doc = await db.apps.find_one({"_id": to_object_id(app_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    await db.apps.update_one({"_id": to_object_id(app_id)}, {"$inc": {"downloads": 1}})
    apk_url = doc.get("apk_url", "")
    if not apk_url:
        raise HTTPException(status_code=404, detail="No APK file available")
    if apk_url.startswith("http"):
        return RedirectResponse(url=apk_url)
    filename = apk_url.split("/")[-1]
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="APK file not found on server")
    download_name = f"{doc.get('name', 'app').replace(' ', '_')}.apk"
    return FileResponse(path=str(file_path), filename=download_name, media_type="application/vnd.android.package-archive")


@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=str(file_path))


# ---------------------------------------------------------------------------
# Admin app routes
# ---------------------------------------------------------------------------
@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = Path(file.filename or "").suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / unique_name
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/api/uploads/{unique_name}", "filename": file.filename}


@api_router.post("/admin/apps")
async def create_app(payload: AppCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["created_at"] = now_iso()
    result = await db.apps.insert_one(doc)
    new_doc = await db.apps.find_one({"_id": result.inserted_id})
    return serialize_app(new_doc)


@api_router.put("/admin/apps/{app_id}")
async def update_app(app_id: str, payload: AppUpdate, admin: dict = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.apps.update_one({"_id": to_object_id(app_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    doc = await db.apps.find_one({"_id": to_object_id(app_id)})
    return serialize_app(doc)


@api_router.delete("/admin/apps/{app_id}")
async def delete_app(app_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.apps.delete_one({"_id": to_object_id(app_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    return {"success": True}


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


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_url: Optional[str] = None
    published: Optional[bool] = None


def slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")


@api_router.get("/blog")
async def list_blog():
    docs = await db.blog.find({"published": True}).sort("created_at", -1).to_list(200)
    return [serialize_doc(d) for d in docs]


@api_router.get("/blog/{slug}")
async def get_blog(slug: str):
    doc = await db.blog.find_one({"slug": slug})
    if not doc:
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
    return {"message": "Uonogamesapk API"}


# ---------------------------------------------------------------------------
# Site Settings (single CMS document) — controls branding, hero, theme,
# sections, telegram, seo, ads, announcement, legal pages.
# ---------------------------------------------------------------------------
SETTINGS_ID = "site"


def default_settings() -> dict:
    return {
        "branding": {
            "site_name": "Uonogamesapk.com",
            "logo_text": "Uonogamesapk",
            "logo_url": "/logo-v2.png",
            "favicon_url": "/logo-icon-v2.png",
            "footer_text": "Premium APK store for safe, verified Android games and apps.",
            "copyright": "Uonogamesapk.com",
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
        "announcement": {"enabled": False, "text": "Welcome to Uonogamesapk.com!", "link": ""},
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
            "meta_title": "Uonogamesapk.com | Premium APK Store",
            "meta_description": "Download premium APK games. Fast, safe & verified.",
            "keywords": "apk, rummy, games, download, android",
            "og_image": "/hero-banner.png",
        },
        "ads": {"enabled": False, "adsense_client": "", "banner_html": ""},
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
    {"question": "Is this APK safe to install?", "answer": "Yes. Every APK listed on Uonogamesapk.com is scanned for malware and manually reviewed before publishing. Files marked with the green 'Verified' badge have passed our security checks. We recommend only downloading from this official page and always keeping Google Play Protect enabled on your device for an extra layer of safety."},
    {"question": "How do I download the APK?", "answer": "Simply tap the yellow 'Download APK' button on any app card. The download will begin instantly. Once finished, open the file from your notification bar or your device's Downloads folder and tap 'Install'. The entire process usually takes less than a minute on a normal connection."},
    {"question": "What is the latest APK version?", "answer": "The version number is displayed directly on each app card (for example, v3.2.1). We always publish the most recent stable release, and the version shown is the one you will download. Check back regularly or join our Telegram channel to be notified the moment a new version goes live."},
    {"question": "Is the APK verified?", "answer": "APKs displaying the green 'Verified' badge have been checked for authenticity, tested for stability, and confirmed to be free of malicious code. Verification means the file matches the original developer package and has not been tampered with or repackaged with unwanted software."},
    {"question": "What Android version is supported?", "answer": "Most APKs on our store support Android 6.0 (Marshmallow) and above, with the best experience on Android 8.0+. Some newer titles may require Android 9 or higher. If an app fails to install, your device may be running an unsupported Android version — check Settings > About Phone > Android Version."},
    {"question": "How do I update the APK?", "answer": "To update, return to this page and download the latest version. Install it over your existing app — your data and progress are preserved in most cases. You do not need to uninstall the old version first unless you receive a 'signature mismatch' error, in which case remove the old app and reinstall."},
    {"question": "Why is installation blocked?", "answer": "Android blocks installs from outside the Play Store by default. To fix this, go to Settings > Security (or Apps & Notifications > Special App Access > Install Unknown Apps), select your browser or file manager, and enable 'Allow from this source'. Then reopen the downloaded APK and installation will proceed."},
    {"question": "Is registration free?", "answer": "Yes, downloading APKs from Uonogamesapk.com is completely free and does not require any account or registration. Some individual apps may offer optional in-app registration or purchases, but browsing and downloading from our store never costs anything."},
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
