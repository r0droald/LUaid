# CLAUDE.md — LUaid.org

## Project Overview

LUaid.org is an open-source Progressive Web App for disaster relief operations in La Union, Philippines. It tracks and visualizes donations, volunteer deployments, and aid distribution. Designed for offline-first use in low-connectivity disaster zones.

## Architecture

- **Frontend**: Next.js (App Router) + TypeScript (strict mode), hosted on Vercel
- **Database**: Supabase (Postgres + Auth + Realtime + Storage) — proposed, pending team approval; current prototype uses Google Sheets
- **CMS**: WordPress backend at cms.LUaid.org (REST API for content)
- **Maps**: Leaflet + OpenStreetMap — proposed, pending team approval
- **PWA**: Service workers for offline caching, IndexedDB for local data, background sync

## Contributing Context

This is a collaborative open-source project. The main repo is `r0droald/LUaid`. We work on forks and submit PRs for review.

- `origin` → personal fork (Jaskey15/LUaid)
- `upstream` → main repo (r0droald/LUaid)
- Feature branches: `feat/<name>`, `fix/<name>`
- PRs go from fork branches → upstream main

## Key Constraints

- **Zero-budget first**: Prefer free-tier services. The project serves volunteer-driven disaster relief.
- **Offline-first**: Everything must work without internet. Cache aggressively, sync when online.
- **Non-technical users**: Volunteers, writers, and relief coordinators use this. Keep UX simple.
- **Multilingual**: Must support English, Filipino, and Ilocano at minimum.

## Code Conventions

- TypeScript (strict mode) — all source, test, and config files use `.ts`/`.tsx`
- App Router (not Pages Router)
- Tailwind CSS for styling
- Components in `src/components/`
- Keep dependencies minimal — every dependency is a liability in disaster scenarios

## Commands

```bash
# Dev server (Turbopack — no service worker in dev)
npm run dev

# Production build (webpack — generates service worker)
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Run tests (once)
npm test

# Run tests (watch mode)
npm run test:watch
```

## Project Structure

```
src/
  app/
    [locale]/       # Locale-based routing (en, fil, ilo)
      layout.tsx    # Root layout with NextIntlClientProvider
      page.tsx      # Homepage
      ~offline/     # Offline fallback page (Serwist)
    globals.css     # Global styles (Tailwind)
    sw.ts           # Service worker source (Serwist)
  components/       # Reusable UI components
  hooks/            # Custom React hooks
  lib/              # Utilities, API clients, helpers
  i18n/
    routing.ts      # Locale definitions
    request.ts      # Server-side i18n config
    types.ts        # next-intl AppConfig type augmentation
  middleware.ts     # Locale detection/redirect
messages/           # Translation files (en.json, fil.json, ilo.json)
public/
  manifest.json     # PWA manifest
  icons/            # PWA icons
```

## Open Issues Tracking

See the GitHub Issues on the main repo for the current backlog. MVP milestone covers: scaffold (#8), dashboard (#9), offline sync (#10), maps (#7), forms (#11), CMS (#13), multilanguage (#12).
