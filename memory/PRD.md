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
admin@uonogamesapk.com / Admin@12345 (see test_credentials.md)

## Backlog / Next
- P1: Pagination + lazy-load for large catalogs; app detail page with screenshots
- P1: Real Telegram channel link (currently t.me/ placeholder)
- P2: Categories management from admin; drag-to-reorder featured
- P2: Persistent object storage for uploads (survives redeploys)
- P2: PWA install prompt for true "native app" install
