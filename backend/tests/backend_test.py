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

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "arfuu9@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "arfuu7778")
OLD_ADMIN_EMAIL = "admin@uonogamesapk.com"
OLD_ADMIN_PASSWORD = "Admin@12345"


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

    def test_old_admin_credentials_rejected(self, api_session):
        """Old admin credentials must NOT grant access (creds rotated to arfuu9@gmail.com)."""
        r = api_session.post(f"{API}/auth/login", json={"email": OLD_ADMIN_EMAIL, "password": OLD_ADMIN_PASSWORD})
        assert r.status_code == 401, f"Old creds should be rejected, got {r.status_code} {r.text}"

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


# ---------------------------------------------------------------------------
# Public + Admin: /api/faqs
# ---------------------------------------------------------------------------
class TestFaqsPublic:
    def test_list_faqs_seeded(self, api_session):
        r = api_session.get(f"{API}/faqs")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Seed should provide exactly 10 FAQs
        assert len(data) >= 10, f"expected >=10 FAQs, got {len(data)}"
        # sorted by order ascending
        orders = [f.get("order", 0) for f in data]
        assert orders == sorted(orders), f"FAQs not sorted by order: {orders}"
        # each has required fields
        for f in data:
            assert "id" in f
            assert "question" in f and f["question"]
            assert "answer" in f and f["answer"]
            assert "_id" not in f  # ObjectId must not leak


class TestFaqsAdminAuth:
    def test_create_faq_without_auth(self, api_session):
        r = api_session.post(f"{API}/admin/faqs", json={"question": "q", "answer": "a"})
        assert r.status_code == 401

    def test_update_faq_without_auth(self, api_session):
        r = api_session.put(f"{API}/admin/faqs/507f1f77bcf86cd799439011", json={"question": "q"})
        assert r.status_code == 401

    def test_delete_faq_without_auth(self, api_session):
        r = api_session.delete(f"{API}/admin/faqs/507f1f77bcf86cd799439011")
        assert r.status_code == 401

    def test_reorder_faqs_without_auth(self, api_session):
        r = api_session.put(f"{API}/admin/faqs/reorder", json={"ids": []})
        assert r.status_code == 401


class TestFaqsAdminCRUD:
    def test_faq_full_flow(self, api_session, admin_headers):
        # Create
        payload = {"question": "TEST_faq_question?", "answer": "TEST_faq_answer_body"}
        r = api_session.post(f"{API}/admin/faqs", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["question"] == payload["question"]
        assert created["answer"] == payload["answer"]
        assert "id" in created
        assert isinstance(created["order"], int)
        faq_id = created["id"]

        # Public GET should list it
        listing = api_session.get(f"{API}/faqs").json()
        found = [f for f in listing if f["id"] == faq_id]
        assert found and found[0]["question"] == payload["question"]

        # Update
        u = api_session.put(
            f"{API}/admin/faqs/{faq_id}",
            json={"answer": "TEST_faq_updated_answer"},
            headers=admin_headers,
        )
        assert u.status_code == 200
        assert u.json()["answer"] == "TEST_faq_updated_answer"
        assert u.json()["question"] == payload["question"]  # unchanged

        # Verify via public GET
        listing2 = api_session.get(f"{API}/faqs").json()
        row = next(f for f in listing2 if f["id"] == faq_id)
        assert row["answer"] == "TEST_faq_updated_answer"

        # Delete
        d = api_session.delete(f"{API}/admin/faqs/{faq_id}", headers=admin_headers)
        assert d.status_code == 200
        assert d.json().get("success") is True

        # Verify gone from public GET
        listing3 = api_session.get(f"{API}/faqs").json()
        assert not any(f["id"] == faq_id for f in listing3)

    def test_faq_reorder_persists(self, api_session, admin_headers):
        listing = api_session.get(f"{API}/faqs").json()
        assert len(listing) >= 2, "need at least 2 FAQs to test reorder"

        original_ids = [f["id"] for f in listing]
        # Swap first two
        reordered_ids = [original_ids[1], original_ids[0]] + original_ids[2:]

        r = api_session.put(
            f"{API}/admin/faqs/reorder",
            json={"ids": reordered_ids},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("success") is True

        # Re-fetch, must be in the new order
        listing2 = api_session.get(f"{API}/faqs").json()
        new_ids = [f["id"] for f in listing2]
        assert new_ids[:len(reordered_ids)] == reordered_ids, (
            f"reorder did not persist: {new_ids} vs {reordered_ids}"
        )

        # Restore original order (cleanup)
        api_session.put(
            f"{API}/admin/faqs/reorder",
            json={"ids": original_ids},
            headers=admin_headers,
        )

    def test_reorder_route_not_shadowed_by_id_route(self, api_session, admin_headers):
        """Regression: PUT /admin/faqs/reorder must not be caught by PUT /admin/faqs/{id}."""
        listing = api_session.get(f"{API}/faqs").json()
        ids = [f["id"] for f in listing]
        r = api_session.put(f"{API}/admin/faqs/reorder", json={"ids": ids}, headers=admin_headers)
        # Should not be 400 (invalid ObjectId 'reorder') or 404
        assert r.status_code == 200, f"reorder route shadowed: {r.status_code} {r.text}"


# ---------------------------------------------------------------------------
# Iteration 3: App Detail fields (developer, package_name, min_android, whats_new, screenshots)
# ---------------------------------------------------------------------------
class TestAppDetailFields:
    def test_seeded_apps_have_detail_fields(self, api_session):
        listing = api_session.get(f"{API}/apps").json()
        all_apps = listing["featured"] + listing["apps"]
        assert len(all_apps) > 0
        # After seed backfill, every app should have detail fields
        for app in all_apps:
            r = api_session.get(f"{API}/apps/{app['id']}")
            assert r.status_code == 200
            data = r.json()
            for field in ("developer", "package_name", "min_android", "whats_new", "screenshots"):
                assert field in data, f"missing {field} on app {data.get('name')}"
            assert isinstance(data["screenshots"], list)
            assert data["min_android"], f"empty min_android on {data.get('name')}"
            assert len(data["screenshots"]) >= 1, f"screenshots empty on {data.get('name')}"

    def test_create_app_persists_all_new_fields(self, api_session, admin_headers):
        payload = {
            "name": "TEST_DetailApp",
            "version": "1.2.3",
            "size": "42 MB",
            "rating": 4.7,
            "downloads": 555,
            "category": "Games",
            "description": "detail test",
            "apk_url": "https://example.com/apk/detail.apk",
            "developer": "TEST_DevStudio",
            "package_name": "com.test.detail",
            "min_android": "Android 8.0+",
            "whats_new": "TEST what's new content",
            "screenshots": [
                "https://example.com/s1.png",
                "https://example.com/s2.png",
                "https://example.com/s3.png",
            ],
        }
        r = api_session.post(f"{API}/admin/apps", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["developer"] == "TEST_DevStudio"
        assert created["package_name"] == "com.test.detail"
        assert created["min_android"] == "Android 8.0+"
        assert created["whats_new"] == "TEST what's new content"
        assert created["screenshots"] == payload["screenshots"]
        new_id = created["id"]

        # GET verifies persistence
        g = api_session.get(f"{API}/apps/{new_id}").json()
        assert g["developer"] == "TEST_DevStudio"
        assert g["package_name"] == "com.test.detail"
        assert g["min_android"] == "Android 8.0+"
        assert g["whats_new"] == "TEST what's new content"
        assert g["screenshots"] == payload["screenshots"]

        # Cleanup
        api_session.delete(f"{API}/admin/apps/{new_id}", headers=admin_headers)

    def test_partial_update_exclude_unset(self, api_session, admin_headers):
        """PUT should use exclude_unset — unspecified fields must NOT be wiped."""
        # Create with full payload
        payload = {
            "name": "TEST_PartialUpdate",
            "developer": "OrigDev",
            "package_name": "com.orig.pkg",
            "min_android": "Android 7.0+",
            "whats_new": "orig whats new",
            "screenshots": ["https://example.com/orig1.png", "https://example.com/orig2.png"],
        }
        c = api_session.post(f"{API}/admin/apps", json=payload, headers=admin_headers)
        assert c.status_code == 200
        app_id = c.json()["id"]

        # Update ONLY developer — others must remain intact
        u = api_session.put(
            f"{API}/admin/apps/{app_id}",
            json={"developer": "NewDev"},
            headers=admin_headers,
        )
        assert u.status_code == 200
        u_data = u.json()
        assert u_data["developer"] == "NewDev"
        assert u_data["package_name"] == "com.orig.pkg", "package_name was wiped by partial update"
        assert u_data["min_android"] == "Android 7.0+", "min_android was wiped"
        assert u_data["whats_new"] == "orig whats new", "whats_new was wiped"
        assert u_data["screenshots"] == payload["screenshots"], "screenshots array was wiped"

        # Now update ONLY screenshots (replace array)
        new_shots = ["https://example.com/new1.png"]
        u2 = api_session.put(
            f"{API}/admin/apps/{app_id}",
            json={"screenshots": new_shots},
            headers=admin_headers,
        )
        assert u2.status_code == 200
        assert u2.json()["screenshots"] == new_shots
        assert u2.json()["developer"] == "NewDev"  # still intact

        # Cleanup
        api_session.delete(f"{API}/admin/apps/{app_id}", headers=admin_headers)


# ---------------------------------------------------------------------------
# Iteration 4: Site Settings (CMS singleton)
# ---------------------------------------------------------------------------
class TestSiteSettings:
    def test_get_settings_returns_singleton(self, api_session):
        r = api_session.get(f"{API}/settings")
        assert r.status_code == 200
        data = r.json()
        # Required top-level keys
        for key in ("branding", "hero", "stats", "telegram", "announcement",
                    "theme", "sections", "seo", "ads", "winners_config", "legal"):
            assert key in data, f"missing settings key: {key}"
        assert isinstance(data["sections"], list)
        assert len(data["sections"]) >= 1
        # No leaked _id
        assert "_id" not in data
        # Branding defaults
        assert data["branding"]["site_name"]

    def test_update_settings_requires_auth(self, api_session):
        r = api_session.put(f"{API}/admin/settings", json={"branding": {"site_name": "Hack"}})
        assert r.status_code == 401

    def test_update_settings_persists(self, api_session, admin_headers):
        # Snapshot
        original = api_session.get(f"{API}/settings").json()
        original_name = original["branding"]["site_name"]
        original_headline = original["hero"]["headline"]

        # Update site_name + hero.headline
        payload = {
            "branding": {**original["branding"], "site_name": "TEST_CMS_Name"},
            "hero": {**original["hero"], "headline": "TEST_CMS_Headline"},
        }
        u = api_session.put(f"{API}/admin/settings", json=payload, headers=admin_headers)
        assert u.status_code == 200
        updated = u.json()
        assert updated["branding"]["site_name"] == "TEST_CMS_Name"
        assert updated["hero"]["headline"] == "TEST_CMS_Headline"

        # Public GET reflects update
        g = api_session.get(f"{API}/settings").json()
        assert g["branding"]["site_name"] == "TEST_CMS_Name"
        assert g["hero"]["headline"] == "TEST_CMS_Headline"

        # Restore
        restore = {
            "branding": {**updated["branding"], "site_name": original_name},
            "hero": {**updated["hero"], "headline": original_headline},
        }
        api_session.put(f"{API}/admin/settings", json=restore, headers=admin_headers)


# ---------------------------------------------------------------------------
# Iteration 4: Reviews
# ---------------------------------------------------------------------------
class TestReviews:
    def test_public_reviews_only_approved(self, api_session, admin_headers):
        # Create an unapproved review
        c = api_session.post(f"{API}/admin/reviews", json={
            "name": "TEST_HiddenReviewer", "rating": 3, "text": "hidden", "approved": False,
        }, headers=admin_headers)
        assert c.status_code == 200
        rid = c.json()["id"]

        # Public list must NOT contain it
        pub = api_session.get(f"{API}/reviews")
        assert pub.status_code == 200
        assert all(r["id"] != rid for r in pub.json()), "unapproved review leaked in public list"

        # Admin list DOES contain it
        adm = api_session.get(f"{API}/admin/reviews", headers=admin_headers)
        assert adm.status_code == 200
        assert any(r["id"] == rid for r in adm.json())
        # No _id leak
        for r in adm.json():
            assert "_id" not in r

        # Toggle approve
        u = api_session.put(f"{API}/admin/reviews/{rid}", json={"approved": True}, headers=admin_headers)
        assert u.status_code == 200
        assert u.json()["approved"] is True
        pub2 = api_session.get(f"{API}/reviews").json()
        assert any(r["id"] == rid for r in pub2), "approved review not visible publicly"

        # Toggle back off — must disappear
        api_session.put(f"{API}/admin/reviews/{rid}", json={"approved": False}, headers=admin_headers)
        pub3 = api_session.get(f"{API}/reviews").json()
        assert all(r["id"] != rid for r in pub3)

        # Delete cleanup
        d = api_session.delete(f"{API}/admin/reviews/{rid}", headers=admin_headers)
        assert d.status_code == 200

    def test_reviews_admin_endpoints_require_auth(self, api_session):
        assert api_session.get(f"{API}/admin/reviews").status_code == 401
        assert api_session.post(f"{API}/admin/reviews", json={"name": "x"}).status_code == 401
        assert api_session.put(f"{API}/admin/reviews/507f1f77bcf86cd799439011",
                               json={"name": "x"}).status_code == 401
        assert api_session.delete(f"{API}/admin/reviews/507f1f77bcf86cd799439011").status_code == 401


# ---------------------------------------------------------------------------
# Iteration 4: Winners
# ---------------------------------------------------------------------------
class TestWinners:
    def test_winners_public_list(self, api_session):
        r = api_session.get(f"{API}/winners")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        # Seed provides at least 3 winners
        for w in r.json():
            assert "id" in w and "_id" not in w

    def test_winners_admin_auth(self, api_session):
        assert api_session.post(f"{API}/admin/winners", json={"name": "x"}).status_code == 401
        assert api_session.put(f"{API}/admin/winners/507f1f77bcf86cd799439011",
                               json={"name": "x"}).status_code == 401
        assert api_session.delete(f"{API}/admin/winners/507f1f77bcf86cd799439011").status_code == 401

    def test_winner_crud_flow(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/winners",
                             json={"name": "TEST_Winner", "amount": "₹999", "game": "Test Rummy"},
                             headers=admin_headers)
        assert c.status_code == 200
        wid = c.json()["id"]
        assert c.json()["name"] == "TEST_Winner"

        # Public listing contains it
        assert any(w["id"] == wid for w in api_session.get(f"{API}/winners").json())

        # Update
        u = api_session.put(f"{API}/admin/winners/{wid}",
                            json={"amount": "₹1234"}, headers=admin_headers)
        assert u.status_code == 200 and u.json()["amount"] == "₹1234"
        assert u.json()["name"] == "TEST_Winner"  # unchanged

        # Delete
        d = api_session.delete(f"{API}/admin/winners/{wid}", headers=admin_headers)
        assert d.status_code == 200
        assert all(w["id"] != wid for w in api_session.get(f"{API}/winners").json())


# ---------------------------------------------------------------------------
# Iteration 4: Redeem Codes
# ---------------------------------------------------------------------------
class TestCodes:
    def test_codes_admin_auth(self, api_session):
        assert api_session.get(f"{API}/admin/codes").status_code == 401
        assert api_session.post(f"{API}/admin/codes", json={"code": "X"}).status_code == 401
        assert api_session.put(f"{API}/admin/codes/507f1f77bcf86cd799439011",
                               json={"code": "X"}).status_code == 401
        assert api_session.delete(f"{API}/admin/codes/507f1f77bcf86cd799439011").status_code == 401

    def test_redeem_seeded_welcome100(self, api_session):
        # Public endpoint; seed inserts WELCOME100 (unlimited, no expiry)
        r = api_session.post(f"{API}/redeem", json={"code": "WELCOME100"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert isinstance(data.get("reward", ""), str) and data["reward"]

        # Lowercase / whitespace normalization
        r2 = api_session.post(f"{API}/redeem", json={"code": " welcome100 "})
        assert r2.status_code == 200

    def test_redeem_invalid_code(self, api_session):
        r = api_session.post(f"{API}/redeem", json={"code": "DOES_NOT_EXIST_XYZ"})
        assert r.status_code == 404
        assert "detail" in r.json()

    def test_redeem_empty_code(self, api_session):
        r = api_session.post(f"{API}/redeem", json={"code": ""})
        assert r.status_code == 400

    def test_redeem_inactive_returns_404(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/codes",
                             json={"code": "TEST_INACTIVE_CODE", "reward": "n/a",
                                   "expiry": "", "usage_limit": 0, "active": False},
                             headers=admin_headers)
        assert c.status_code == 200
        cid = c.json()["id"]
        try:
            r = api_session.post(f"{API}/redeem", json={"code": "TEST_INACTIVE_CODE"})
            assert r.status_code == 404
        finally:
            api_session.delete(f"{API}/admin/codes/{cid}", headers=admin_headers)

    def test_redeem_expired_returns_400(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/codes",
                             json={"code": "TEST_EXPIRED", "reward": "old",
                                   "expiry": "2020-01-01", "usage_limit": 0, "active": True},
                             headers=admin_headers)
        assert c.status_code == 200
        cid = c.json()["id"]
        try:
            r = api_session.post(f"{API}/redeem", json={"code": "TEST_EXPIRED"})
            assert r.status_code == 400
            assert "expired" in r.json().get("detail", "").lower()
        finally:
            api_session.delete(f"{API}/admin/codes/{cid}", headers=admin_headers)

    def test_redeem_usage_limit_exceeded(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/codes",
                             json={"code": "TEST_ONCE", "reward": "one shot",
                                   "expiry": "", "usage_limit": 1, "active": True},
                             headers=admin_headers)
        assert c.status_code == 200
        cid = c.json()["id"]
        try:
            r1 = api_session.post(f"{API}/redeem", json={"code": "TEST_ONCE"})
            assert r1.status_code == 200
            r2 = api_session.post(f"{API}/redeem", json={"code": "TEST_ONCE"})
            assert r2.status_code == 400
            assert "limit" in r2.json().get("detail", "").lower()
        finally:
            api_session.delete(f"{API}/admin/codes/{cid}", headers=admin_headers)

    def test_code_crud_and_list(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/codes",
                             json={"code": "test_lowercase", "reward": "r",
                                   "expiry": "", "usage_limit": 0, "active": True},
                             headers=admin_headers)
        assert c.status_code == 200
        # Backend uppercases codes
        assert c.json()["code"] == "TEST_LOWERCASE"
        cid = c.json()["id"]

        lst = api_session.get(f"{API}/admin/codes", headers=admin_headers)
        assert lst.status_code == 200
        assert any(x["id"] == cid for x in lst.json())

        # Update reward
        u = api_session.put(f"{API}/admin/codes/{cid}",
                            json={"reward": "updated"}, headers=admin_headers)
        assert u.status_code == 200 and u.json()["reward"] == "updated"
        assert u.json()["code"] == "TEST_LOWERCASE"

        d = api_session.delete(f"{API}/admin/codes/{cid}", headers=admin_headers)
        assert d.status_code == 200


# ---------------------------------------------------------------------------
# Iteration 4: Analytics
# ---------------------------------------------------------------------------
class TestAnalytics:
    def test_analytics_requires_auth(self, api_session):
        r = api_session.get(f"{API}/admin/analytics")
        assert r.status_code == 401

    def test_analytics_shape(self, api_session, admin_headers):
        r = api_session.get(f"{API}/admin/analytics", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        for key in ("total_apps", "total_downloads", "total_reviews",
                    "by_category", "top_apps"):
            assert key in d, f"missing analytics key {key}"
        assert isinstance(d["total_apps"], int)
        assert isinstance(d["total_downloads"], int)
        assert isinstance(d["by_category"], dict)
        assert isinstance(d["top_apps"], list)
        assert len(d["top_apps"]) <= 5
        for row in d["top_apps"]:
            assert "name" in row and "downloads" in row


# ---------------------------------------------------------------------------
# Iteration 4: New AppModel fields + hidden/trending
# ---------------------------------------------------------------------------
class TestAppNewFields:
    def test_create_persists_new_fields(self, api_session, admin_headers):
        payload = {
            "name": "TEST_BadgeApp",
            "apk_url": "https://example.com/x.apk",
            "badge": "Hot",
            "trending": True,
            "hidden": False,
            "features": ["Multiplayer", "Offline mode"],
            "requirements": "2GB RAM",
            "permissions": ["Storage", "Internet"],
        }
        c = api_session.post(f"{API}/admin/apps", json=payload, headers=admin_headers)
        assert c.status_code == 200
        created = c.json()
        assert created["badge"] == "Hot"
        assert created["trending"] is True
        assert created["features"] == ["Multiplayer", "Offline mode"]
        assert created["requirements"] == "2GB RAM"
        assert created["permissions"] == ["Storage", "Internet"]
        aid = created["id"]

        # GET reflects
        g = api_session.get(f"{API}/apps/{aid}").json()
        assert g["badge"] == "Hot"
        assert g["trending"] is True

        # Cleanup
        api_session.delete(f"{API}/admin/apps/{aid}", headers=admin_headers)

    def test_hidden_app_excluded_from_public_list_and_trending_array(self, api_session, admin_headers):
        # Create a hidden trending app
        c = api_session.post(f"{API}/admin/apps",
                             json={"name": "TEST_HiddenApp",
                                   "apk_url": "https://example.com/h.apk",
                                   "hidden": True, "trending": True},
                             headers=admin_headers)
        assert c.status_code == 200
        aid = c.json()["id"]

        try:
            listing = api_session.get(f"{API}/apps").json()
            assert "trending" in listing, "public list must include trending array"
            assert isinstance(listing["trending"], list)
            all_ids = {a["id"] for a in listing["featured"] + listing["apps"]}
            trend_ids = {a["id"] for a in listing["trending"]}
            # Hidden app must be absent from featured, apps, and trending (query filters hidden)
            assert aid not in all_ids, "hidden app leaked in public list"
            assert aid not in trend_ids, "hidden app leaked in trending"

            # include_hidden=true (admin usage) — should return it
            adm = api_session.get(f"{API}/apps", params={"include_hidden": "true"}).json()
            all_adm = {a["id"] for a in adm["featured"] + adm["apps"]}
            assert aid in all_adm, "include_hidden=true must return hidden apps"
        finally:
            api_session.delete(f"{API}/admin/apps/{aid}", headers=admin_headers)

    def test_partial_update_preserves_new_fields(self, api_session, admin_headers):
        c = api_session.post(f"{API}/admin/apps",
                             json={"name": "TEST_PartialBadge",
                                   "apk_url": "https://example.com/y.apk",
                                   "badge": "New",
                                   "features": ["A", "B"],
                                   "permissions": ["Camera"]},
                             headers=admin_headers)
        aid = c.json()["id"]
        try:
            u = api_session.put(f"{API}/admin/apps/{aid}",
                                json={"trending": True}, headers=admin_headers)
            assert u.status_code == 200
            data = u.json()
            assert data["trending"] is True
            assert data["badge"] == "New", "badge wiped by partial update"
            assert data["features"] == ["A", "B"], "features wiped"
            assert data["permissions"] == ["Camera"], "permissions wiped"
        finally:
            api_session.delete(f"{API}/admin/apps/{aid}", headers=admin_headers)

