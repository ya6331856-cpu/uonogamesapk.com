"""
Backend API tests for Uonogamesapk.com
- Public store endpoints
- Auth (login/me)
- Admin CRUD + File upload
"""
import io
import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load backend .env to get admin credentials for tests
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if "REACT_APP_BACKEND_URL" in os.environ else "https://smooth-apk-market.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@uonogamesapk.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@12345")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def api_session():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def admin_token(api_session):
    r = api_session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0
    assert "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture()
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------------------------------------------------------------------
# Health / Root
# ---------------------------------------------------------------------------
class TestHealth:
    def test_api_root(self, api_session):
        r = api_session.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------------------------------------------------------------------------
# Public: /api/apps
# ---------------------------------------------------------------------------
class TestPublicApps:
    def test_list_apps_structure(self, api_session):
        r = api_session.get(f"{API}/apps")
        assert r.status_code == 200
        data = r.json()
        assert set(["featured", "apps", "total"]).issubset(data.keys())
        assert isinstance(data["featured"], list)
        assert isinstance(data["apps"], list)
        assert isinstance(data["total"], int)
        # Seed should provide at least 3 featured
        assert len(data["featured"]) == 3
        # featured must be sorted by featured_order asc
        orders = [a.get("featured_order") or 99 for a in data["featured"]]
        assert orders == sorted(orders), f"featured order not sorted: {orders}"
        # No overlap
        feat_ids = {a["id"] for a in data["featured"]}
        reg_ids = {a["id"] for a in data["apps"]}
        assert feat_ids.isdisjoint(reg_ids)
        # total = featured + apps
        assert data["total"] == len(data["featured"]) + len(data["apps"])

    def test_get_single_app(self, api_session):
        listing = api_session.get(f"{API}/apps").json()
        app_id = listing["featured"][0]["id"]
        r = api_session.get(f"{API}/apps/{app_id}")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == app_id
        assert "name" in data and "apk_url" in data

    def test_get_single_app_invalid(self, api_session):
        # Invalid ObjectId -> 400/500 acceptable; nonexistent valid ObjectId -> 404
        r = api_session.get(f"{API}/apps/507f1f77bcf86cd799439011")
        assert r.status_code == 404

    def test_download_redirect_and_increment(self, api_session):
        listing = api_session.get(f"{API}/apps").json()
        app = listing["featured"][0]
        app_id = app["id"]
        before = api_session.get(f"{API}/apps/{app_id}").json()["downloads"]
        # allow_redirects=False so we can inspect the 302
        r = api_session.get(f"{API}/apps/{app_id}/download", allow_redirects=False)
        assert r.status_code in (302, 307), f"Expected redirect, got {r.status_code}"
        loc = r.headers.get("location", "")
        assert loc.startswith("http"), f"Redirect location invalid: {loc}"
        after = api_session.get(f"{API}/apps/{app_id}").json()["downloads"]
        assert after == before + 1, f"downloads did not increment: {before}->{after}"

    def test_search_filter(self, api_session):
        r = api_session.get(f"{API}/apps", params={"search": "Pixel"})
        assert r.status_code == 200
        # every returned app (featured+regular) should contain 'pixel'
        for a in r.json()["featured"] + r.json()["apps"]:
            assert "pixel" in a["name"].lower()

    def test_category_filter(self, api_session):
        r = api_session.get(f"{API}/apps", params={"category": "Puzzle"})
        assert r.status_code == 200
        for a in r.json()["featured"] + r.json()["apps"]:
            assert a["category"] == "Puzzle"


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_login_success(self, api_session):
        r = api_session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"

    def test_login_wrong_password(self, api_session):
        r = api_session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_unknown_user(self, api_session):
        r = api_session.post(f"{API}/auth/login", json={"email": "nobody@nowhere.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, api_session, admin_headers):
        r = api_session.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password_hash" not in data

    def test_me_without_token(self, api_session):
        r = api_session.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bad_token(self, api_session):
        r = api_session.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage.token.value"})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Admin CRUD
# ---------------------------------------------------------------------------
class TestAdminAppsCRUD:
    def test_create_without_auth(self, api_session):
        r = api_session.post(f"{API}/admin/apps", json={"name": "TEST_NoAuth"})
        assert r.status_code == 401

    def test_update_without_auth(self, api_session):
        r = api_session.put(f"{API}/admin/apps/507f1f77bcf86cd799439011", json={"name": "x"})
        assert r.status_code == 401

    def test_delete_without_auth(self, api_session):
        r = api_session.delete(f"{API}/admin/apps/507f1f77bcf86cd799439011")
        assert r.status_code == 401

    def test_create_edit_delete_flow(self, api_session, admin_headers):
        # Create
        payload = {
            "name": "TEST_NewApp",
            "version": "9.9.9",
            "size": "10 MB",
            "rating": 4.2,
            "downloads": 100,
            "category": "Tools",
            "description": "created by test",
            "apk_url": "https://example.com/apk/test.apk",
            "featured": False,
        }
        r = api_session.post(f"{API}/admin/apps", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == payload["name"]
        assert created["version"] == payload["version"]
        assert "id" in created
        new_id = created["id"]

        # Verify via GET
        g = api_session.get(f"{API}/apps/{new_id}")
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_NewApp"

        # Update
        u = api_session.put(
            f"{API}/admin/apps/{new_id}",
            json={"name": "TEST_Updated", "rating": 4.9},
            headers=admin_headers,
        )
        assert u.status_code == 200
        assert u.json()["name"] == "TEST_Updated"
        assert u.json()["rating"] == 4.9

        # Verify update persisted
        g2 = api_session.get(f"{API}/apps/{new_id}").json()
        assert g2["name"] == "TEST_Updated"
        assert g2["version"] == "9.9.9"  # untouched

        # Delete
        d = api_session.delete(f"{API}/admin/apps/{new_id}", headers=admin_headers)
        assert d.status_code == 200
        assert d.json().get("success") is True

        # Verify gone
        g3 = api_session.get(f"{API}/apps/{new_id}")
        assert g3.status_code == 404


# ---------------------------------------------------------------------------
# File upload
# ---------------------------------------------------------------------------
class TestFileUpload:
    def test_upload_without_auth(self, api_session):
        files = {"file": ("t.png", b"\x89PNG\r\n\x1a\n", "image/png")}
        r = api_session.post(f"{API}/admin/upload", files=files)
        assert r.status_code == 401

    def test_upload_image_and_serve(self, api_session, admin_headers):
        # minimal valid PNG bytes
        png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf"
            b"\xc0\x00\x00\x00\x03\x00\x01\xdd\x8a\xdb\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test.png", png, "image/png")}
        r = api_session.post(f"{API}/admin/upload", files=files, headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert data["url"].startswith("/api/uploads/")

        # Serve
        g = api_session.get(f"{BASE_URL}{data['url']}")
        assert g.status_code == 200
        assert g.content[:8] == png[:8]
