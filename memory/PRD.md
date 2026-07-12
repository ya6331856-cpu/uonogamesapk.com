# Uonogamesapk.com — Premium APK Store

## Problem Statement
Ultra-premium, mobile-first APK Store (White & Gold) that feels like a native Android app.
Featured Apps section (1 large pinned card + 2 side-by-side) always before the app list.
Compact horizontal APK cards, admin panel to manage apps + pinned featured, real downloads.

## Stack
FastAPI + React + MongoDB. JWT admin auth. Local file uploads (icons + APKs).

## User Choices
- Auth: JWT username/password (admin only)
- File uploads for icon image + APK file (URLs also supported)
- Download button triggers real download/redirect
- Sample apps seeded
- Brand: Uonogamesapk.com

## Architecture
- Backend `/app/backend/server.py`: auth (login/me), public /api/apps + /api/apps/{id} + /api/apps/{id}/download (increments count, redirects/serves file), admin CRUD /api/admin/apps, /api/admin/upload (multipart -> /app/backend/uploads), /api/uploads/{filename}. Seeds admin + 8 sample apps (3 featured).
- Frontend: Store (`pages/Store.jsx`), AdminLogin, AdminDashboard. Components: FeaturedApps, AppCard, AppIcon, RippleButton, AnimatedCounter, Skeletons, Header. Token in localStorage `uono_token`, Bearer header.
- Hero banner edited via Gemini Nano Banana → `/app/frontend/public/hero-banner.png` (UONOGAMESAPK.COM branding).

## Implemented (2025-12)
- White & Gold premium UI, mobile-first centered shell (max 480px)
- Featured section (1 large + 2 grid), compact horizontal app cards with rating/verified/downloads
- Search + category filters (includes featured), animated counters, shimmer skeletons, ripple buttons, fade-up motion
- Telegram CTA
- JWT admin login + dashboard: add/edit/delete apps, pin 3 featured, icon + APK file uploads
- Real download via /api/apps/{id}/download
- Tested: backend 19/19, frontend all critical flows

## Credentials
arfuu9@gmail.com / arfuu7778 (admin). Old admin purged on startup. See test_credentials.md

## Implemented (updated)
- MANDATORY sections: FAQ (10 seeded, admin-editable accordion), Legal (10 policy cards w/ dialogs), enhanced Footer (legal links, Telegram, back-to-top, auto year)
- Sort control (Most Downloaded / Top Rated / Newest)
- Admin FAQ management (add/edit/delete/reorder) via Tabs (Apps | FAQs)
- SECOND PAGE: App Detail `/app/:id` — clicking any card opens full page (icon, developer, stats, screenshots gallery, description, what's new, additional info, sticky Download bar, share)
- Admin app form extended: developer, package_name, min_android, whats_new, multi-screenshot upload
- Security: seed() purges stale admins so rotated credentials invalidate old ones
- Tested: backend 31/31, all frontend flows

## Implemented — CMS (Iteration 4)
- **Admin CMS (7 tabs)**: Apps, FAQs, Content(site settings), Reviews, Winners, Codes, Analytics
- **Site Settings singleton** (`/api/settings`): branding (name/logo/footer/copyright), contact + socials, hero (banner/headline/subtitle/toggle), stats (editable + auto values), telegram (link/cta/members/toggle), announcement bar, theme colors, homepage **section order + enable/disable**, SEO (title/desc/keywords/OG — applied live), ads (AdSense/custom banner), winners ticker config, editable Legal pages
- **Storefront is now data-driven**: hero/stats/telegram/sections/announcement/theme/SEO all come from settings; Header/Footer dynamic
- **Reviews** (approve/hide + CRUD), **Live Winners** auto-scroll ticker (CRUD), **Redeem Codes** (CRUD + public /api/redeem with expiry & usage limits), **Analytics** dashboard (downloads/apps/reviews/codes + by-category + top apps)
- **App boxes now show tags/badges** (Hot/New/Popular/Trending — admin-selectable or auto)
- **Expanded APK fields**: badge, trending, hidden (hide/show), features[], requirements, permissions[] — surfaced on detail page
- Tested: backend 52/52; frontend 100% (fixed: admin list now includes hidden apps via include_hidden)

## Implemented — Full Admin CMS panel (Iteration 5)
- Professional multi-route admin at /admin/* with dark collapsible sidebar (grouped nav, icons, active states, animations), top navbar (search, notifications, profile menu, View Site), page transitions
- Routes: dashboard, apks, featured-apps, categories, hero, homepage, reviews, faq, live-winners, redeem-codes, blog, seo, ads, media-library, notifications, users, settings, security, backup
- Dashboard: stat cards + recharts bar chart + quick actions + top apps + recently added
- New backend: blog CRUD, media library (list/delete uploads), users list, change password, backup export/restore, settings.categories
- Redeem code box moved to bottom of homepage; every app card shows a Hot/New/Popular/Trending tag
- Tested: backend 69/69, frontend 100%
- Deployment readiness: PASS (no blockers)

## Logo (updated 2026-02)
- Brand logo: dark rummy/casino theme (green felt, poker chips, cards, golden crown + red spade). "UONOGAMES" white + "APK.COM" gold.
- Files: /app/frontend/public/logo.png (header via branding.logo_url="/logo.png"). Generator script: /app/scripts/gen_logo.py
- Verified rendering on preview URL (same-origin). Note: localhost:3000 testing shows cross-origin block because resolveUrl prepends BACKEND_URL — expected, not a real bug.

## Deployment fix (2026-02)
- Added root `@app.get("/health")` in /app/backend/server.py returning {"status":"healthy"} — fixes K8s health probe 404 that was blocking production deploy. Verified 200 locally.

## Welcome animation (2026-02)
- New component /app/frontend/src/components/WelcomeTypewriter.jsx — looping typewriter "Welcome to the UONOGAMESAPK.COM" (brand part gold gradient + blinking cursor). Rendered in Store.jsx after Header.

## Rummy rewards fields (2026-02)
- New per-app fields: signup_bonus + min_withdraw (strings, e.g. "₹51" / "₹100"). Added to AppModel/AppCreate/AppUpdate in server.py.
- Admin "Add New App" form (AppsManager.jsx): prominent gold "Rummy Rewards" box at top for signup_bonus & min_withdraw. EMPTY defaults pre-filled with rummy-ready values (rating 4.8, downloads 500000, size 45MB, developer, description, features, requirements, permissions, badge Hot, trending true) so admin only sets name + logo + bonus + min-withdraw.
- Display: AppCard shows gold "Bonus" chip + green "Min W/D" chip; AppDetail shows two reward highlight cards (gift/wallet) above download button + rows in Additional Information. Verified end-to-end on detail page.

## Deploy caveats to note
- Uploaded icons/APKs are stored on local disk (/app/backend/uploads) — NOT persistent across redeploys. For production use, move to object storage (S3/GCS).
- Seeded sample apps use example.com placeholder APK URLs — replace with real download links/files via the admin APK Manager.

## Deferred (enterprise add-ons, not built)
- Real per-visitor analytics (visitors/countries/devices/sources)
- Web push notifications
- Multi-admin roles/permissions, login history, activity logs
- Auto sitemap.xml/robots.txt, schema markup builder
- Drag-and-drop custom section builder (current: reorder + enable/disable fixed sections)



