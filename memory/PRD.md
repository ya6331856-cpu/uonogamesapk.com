# Uonogamesapk.com — Product Requirements & Status

## Original Problem
Premium, mobile-first APK Store (White & Gold theme) hosted at `uonogamesapk.com`. Users can browse & download Rummy/Games APK apps with sign-up bonus & min-withdraw info. Admin panel controls apps, SEO, sections, blog, reviews, winners, etc.

## Architecture (as of Feb 2026)
- **Frontend:** React (CRA) + react-router + react-helmet-async + framer-motion + shadcn/ui.
- **Backend:** FastAPI (single `server.py` ~1300 lines).
- **Databases (Hybrid):**
  - **Firestore** (Firebase Admin SDK) → `apps`, `categories`.
  - **MongoDB** → `users`, `settings`, `reviews`, `winners`, `blog`, `faq`, `codes`.
- **File Storage:** **Emergent Object Storage** (persistent) — replaces local disk & Firebase Storage.
- **Frontend API client:** Custom `fetch`-based shim at `/app/frontend/src/lib/api.js` (axios was hanging in this container env).

## Completed (Feb 13, 2026)
### 🔴 P0 — Image Upload Persistence Bug (FIXED)
- Root cause: uploads were saved to `/app/backend/uploads/` (local container disk) → wiped on every deploy/restart. Firebase Storage was blocked (Spark plan, no bucket).
- Fix: created `/app/backend/object_storage.py` → uploads to Emergent Object Storage (persistent). Serve endpoint `/api/uploads/{filename}` reads from object storage first, falls back to local disk + auto-migrates legacy files. All 71 existing local files migrated via `migrate_uploads_to_object_storage.py`.
- File size validation added (10 MB images, 100 MB APKs), proper error messages, no more silent failures.

### 🟢 SEO Package (COMPLETE)
- **JSON-LD** on every app page: `SoftwareApplication` + `BreadcrumbList` + `FAQPage` (3 blocks).
- **Open Graph & Twitter Cards** on every page (og:title, og:url, og:image, twitter:card).
- **Canonical URL** — single, per-page.
- **Robots meta** — `index, follow, max-image-preview:large, max-snippet:-1` by default; `noindex, nofollow` when app has `noindex=true` or `hidden=true`.
- **Breadcrumbs** — both visible (`data-testid=breadcrumbs`) and JSON-LD.
- **Image ALT tags** — `${app.name} APK icon - ${category}`.
- **Sitemap.xml** — auto-generated, includes `<image:image>` for every app, lastmod dates.
- **Robots.txt** — allows all, disallows `/admin`, references sitemap.
- **`cleanupDuplicates()`** in `SEOHead.jsx` removes duplicate meta/link tags injected by third-party scripts.
- **New App SEO fields** in admin form: `focus_keyword`, `og_image`, `noindex`, `faq_items`.

### 🟢 SEO Dashboard (`/admin/seo-dashboard`)
- SEO Score % (100% currently)
- Total Apps / Indexable / Noindex stats
- Missing title / description / keywords / icon counters
- Duplicate slug warnings
- Sitemap.xml + robots.txt viewers + Google Search Console link
- **Regenerate Sitemap** button
- Per-app table with SEO Score %, index status, **Auto-Fill** per row, **Auto-Fix All Missing** bulk button
- View page link per app

### 🟢 PWA Install Banner
- `/app/frontend/src/components/PWAInstallBanner.jsx` — appears when browser fires `beforeinstallprompt`
- `/app/frontend/public/manifest.json` — start_url, icons, theme_color
- 7-day dismiss TTL in localStorage

### 🟢 Backend SEO endpoints
- `GET /api/sitemap.xml` — dynamic, includes image sitemap
- `GET /api/robots.txt`
- `GET /api/seo/{slug}` — JSON SEO metadata
- `GET /api/admin/seo/overview` — dashboard stats
- `GET /api/admin/seo/apps` — per-app SEO status list
- `POST /api/admin/seo/auto-generate/{app_id}` — AI-style fill for one app
- `POST /api/admin/seo/bulk-fix` — fill all apps missing SEO fields

## Blocked (waiting on user)
- **Firebase Storage:** requires Blaze plan upgrade — currently blocked. Uploads go to Emergent Object Storage instead (works perfectly).
- **Firebase Auth:** Email/Password provider not enabled in Firebase Console — currently blocked. Backend falls back to JWT + MongoDB successfully.

## Test Credentials
Admin: `arfuu9@gmail.com` / `arfuu7778` (JWT).

## Regression Health (last run: iteration_7.json)
- 14 pytest backend cases: **ALL PASS**
- Frontend E2E: homepage, app detail (breadcrumbs + 3 JSON-LD), SEO Dashboard (55 apps, 100% score), Add-New-App SEO fields — **ALL PASS**
- Zero issues logged.

## Backlog / Future
- Blog Management page enhancements (currently basic — needs categories, tags, scheduling, drafts, SEO fields per post).
- Google Analytics 4 tag + Search Console verification meta.
- Rate limiting + firestore security rules review (once Blaze plan enabled).
- WebP/AVIF auto-conversion pipeline for uploaded icons.
- Related-apps / trending logic tuning.
