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

## Backlog / Next
- P1: Real Telegram channel link (currently t.me/ placeholder)
- P1: Category/screenshot management UX polish; app ratings/reviews
- P2: Persistent object storage for uploads (survives redeploys)
- P2: PWA install prompt; pagination for large catalogs

