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
async def list_apps(search: Optional[str] = None, category: Optional[str] = None):
    query: dict = {}
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
    return {"featured": featured, "apps": regular, "total": len(apps)}


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
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
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


@api_router.get("/")
async def root():
    return {"message": "Uonogamesapk API"}


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

    if await db.faqs.count_documents({}) == 0:
        faq_docs = [{**f, "order": i, "created_at": now_iso()} for i, f in enumerate(DEFAULT_FAQS)]
        await db.faqs.insert_many(faq_docs)
        logger.info("Seeded %d FAQs", len(faq_docs))


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
