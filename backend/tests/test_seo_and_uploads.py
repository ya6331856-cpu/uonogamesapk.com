"""
Backend tests for SEO endpoints, image upload persistence, PWA manifest, and
per-app SEO admin flow. Uses REACT_APP_BACKEND_URL from frontend/.env so we hit
the same public URL a user hits.
"""
import io
import os
import re
import struct
import zlib
import pytest
import requests
from pathlib import Path

# Read frontend/.env to get the public URL (source of truth)
_env_path = Path("/app/frontend/.env")
_env = {}
for line in _env_path.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        _env[k.strip()] = v.strip().strip('"')

BASE_URL = _env["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "arfuu9@gmail.com"
ADMIN_PASSWORD = "arfuu7778"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    token = r.json().get("token")
    assert token
    return token


@pytest.fixture(scope="session")
def admin_client(api_client, admin_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {admin_token}"})
    return s


def _tiny_png_bytes() -> bytes:
    """Return a valid 1x1 red PNG (~70 bytes)."""
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    idat_raw = b"\x00\xff\x00\x00"  # filter=0, R,G,B
    idat = zlib.compress(idat_raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


# ---------------------------------------------------------------------------
# Health / basic public endpoints
# ---------------------------------------------------------------------------
class TestPublicEndpoints:
    def test_api_root(self, api_client):
        r = api_client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "Uonogamesapk" in r.text

    def test_list_apps_returns_apps(self, api_client):
        r = api_client.get(f"{API}/apps", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "apps" in data and "featured" in data and "total" in data
        assert isinstance(data["apps"], list)
        # Should be 55+ apps as per problem statement
        assert data["total"] >= 50, f"Expected 50+ apps, got {data['total']}"

    def test_manifest_json(self, api_client):
        r = api_client.get(f"{BASE_URL}/manifest.json", timeout=15)
        assert r.status_code == 200
        m = r.json()
        for key in ["name", "short_name", "start_url", "icons"]:
            assert key in m, f"manifest missing {key}"
        assert isinstance(m["icons"], list) and len(m["icons"]) >= 1


# ---------------------------------------------------------------------------
# SEO endpoints
# ---------------------------------------------------------------------------
class TestSEOEndpoints:
    def test_sitemap_xml(self, api_client):
        r = api_client.get(f"{API}/sitemap.xml", timeout=30)
        assert r.status_code == 200
        assert "application/xml" in r.headers.get("Content-Type", "")
        body = r.text
        assert body.startswith("<?xml")
        assert "<urlset" in body and "xmlns:image=" in body
        # Should contain <image:image> tags
        assert "<image:image>" in body, "sitemap missing image tags"
        # Should contain <lastmod>
        assert "<lastmod>" in body
        # Count URL entries
        loc_count = len(re.findall(r"<loc>", body))
        assert loc_count >= 50, f"Expected 50+ URLs in sitemap, got {loc_count}"

    def test_robots_txt(self, api_client):
        r = api_client.get(f"{API}/robots.txt", timeout=15)
        assert r.status_code == 200
        body = r.text
        assert "User-agent: *" in body
        assert "Sitemap:" in body
        assert "Disallow: /admin" in body

    def test_seo_meta_for_slug(self, api_client):
        # Grab first slug from apps list
        apps = api_client.get(f"{API}/apps", timeout=30).json()["apps"]
        slug = None
        for a in apps:
            if a.get("slug"):
                slug = a["slug"]
                break
        if not slug:
            pytest.skip("No app with slug found")
        r = api_client.get(f"{API}/seo/{slug}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ["title", "description", "url", "name"]:
            assert key in data


# ---------------------------------------------------------------------------
# Image upload persistence (CRITICAL)
# ---------------------------------------------------------------------------
class TestImageUploadPersistence:
    def test_upload_png_returns_emergent_storage(self, admin_client):
        png = _tiny_png_bytes()
        files = {"file": ("test_persist.png", io.BytesIO(png), "image/png")}
        r = admin_client.post(f"{API}/admin/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert data["url"].startswith("/api/uploads/")
        assert data.get("storage") == "emergent", (
            f"Expected storage=emergent but got {data.get('storage')} — "
            f"warning: {data.get('warning')}"
        )
        # Immediately fetch the file and verify bytes match
        fetch_url = f"{BASE_URL}{data['url']}"
        r2 = requests.get(fetch_url, timeout=30)
        assert r2.status_code == 200
        assert r2.content == png, "Uploaded bytes do not match downloaded bytes"
        assert "image/png" in r2.headers.get("Content-Type", "")

    def test_legacy_image_still_served(self, api_client):
        """Prior test data: an old image was migrated. Verify it's still accessible."""
        url = f"{API}/uploads/00cc5a9062f84ce5aacbf51df61cac9e.jpg"
        r = api_client.get(url, timeout=30)
        assert r.status_code == 200, f"Legacy image returned {r.status_code}"
        assert len(r.content) > 0


# ---------------------------------------------------------------------------
# Admin SEO dashboard endpoints
# ---------------------------------------------------------------------------
class TestAdminSEODashboard:
    def test_seo_overview(self, admin_client):
        r = admin_client.get(f"{API}/admin/seo/overview", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for key in ["total_apps", "indexed", "noindex", "seo_score", "sitemap_url", "robots_url"]:
            assert key in d
        assert d["total_apps"] >= 50

    def test_seo_apps_list(self, admin_client):
        r = admin_client.get(f"{API}/admin/seo/apps", timeout=30)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 50
        # Every row must expose id, name, score, noindex fields for the UI table
        for row in arr[:5]:
            for key in ["id", "name", "slug", "score", "noindex"]:
                assert key in row, f"seo/apps row missing {key}: {row}"

    def test_bulk_fix(self, admin_client):
        r = admin_client.post(f"{API}/admin/seo/bulk-fix", timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "fixed" in d and "total" in d
        assert d["total"] >= 50

    def test_auto_generate_single_app(self, admin_client):
        # Grab an app id and run per-app auto-generate
        r = admin_client.get(f"{API}/admin/seo/apps", timeout=30)
        apps = r.json()
        if not apps:
            pytest.skip("No apps")
        target = apps[0]
        app_id = target["id"]
        rr = admin_client.post(f"{API}/admin/seo/auto-generate/{app_id}", timeout=60)
        assert rr.status_code == 200, rr.text
        d = rr.json()
        # Should return the updated doc with SEO fields present
        assert d.get("seo_title")
        assert d.get("meta_description")
        assert d.get("keywords")


# ---------------------------------------------------------------------------
# Auth: unauthenticated requests must 401
# ---------------------------------------------------------------------------
class TestAuthProtection:
    def test_admin_upload_requires_auth(self, api_client):
        png = _tiny_png_bytes()
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = api_client.post(f"{API}/admin/upload", files=files, timeout=30)
        assert r.status_code == 401

    def test_seo_overview_requires_auth(self, api_client):
        r = api_client.get(f"{API}/admin/seo/overview", timeout=15)
        assert r.status_code == 401
