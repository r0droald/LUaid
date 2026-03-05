# CLAUDE.md — LUaid.org

## Project Overview

LUaid.org is an open-source Progressive Web App for disaster relief operations in La Union, Philippines. It tracks and visualizes donations, volunteer deployments, and aid distribution. Designed for offline-first use in low-connectivity disaster zones.

## Architecture

- **Frontend**: Next.js (App Router) + TypeScript (strict mode), hosted on Vercel
- **Database**: Supabase (Postgres) — server-side only via service role key, never exposed to browser
- **CMS**: WordPress backend at cms.LUaid.org (REST API for content)
- **Maps**: Leaflet + OpenStreetMap (static placeholder exists; interactive map planned — Issue #7)
- **PWA**: Serwist service worker for offline caching, IndexedDB for local data (planned)
- **Testing**: Vitest + React Testing Library

See `docs/architecture.md` for system design details and schema overview.

## Contributing

Main repo: `r0droald/LUaid`. Feature branches (`feat/<name>`, `fix/<name>`) → PR to `main`.

See `docs/setup.md` for local development setup.

## Key Constraints

- **Zero-budget first**: Prefer free-tier services. The project serves volunteer-driven disaster relief.
- **Offline-first**: Everything must work without internet. Cache aggressively, sync when online.
- **Non-technical users**: Volunteers, writers, and relief coordinators use this. Keep UX simple.
- **Multilingual**: Must support English, Filipino, and Ilocano at minimum.
- **Minimal dependencies**: Every dependency is a liability in disaster scenarios.

## Code Conventions

- TypeScript strict mode — all source, test, and config files use `.ts`/`.tsx`
- App Router (not Pages Router)
- Tailwind CSS for styling
- Server components for data fetching (keys stay server-side)
- Components in `src/components/`, query functions in `src/lib/queries.ts`

## Commands

```bash
npm run dev          # Dev server (Turbopack — no service worker)
npm run build        # Production build (webpack — generates service worker)
npm run start        # Start production server
npm run lint         # ESLint
npm test             # Run tests (Vitest, once)
npm run test:watch   # Run tests (watch mode)
```

## Project Structure

```
src/
  app/
    [locale]/         # Locale-based routing (en, fil, ilo)
      layout.tsx      # Root layout with NextIntlClientProvider
      page.tsx        # Transparency dashboard (async server component)
      ~offline/       # Offline fallback page (Serwist)
    globals.css       # Global styles (Tailwind)
    sw.ts             # Service worker source (Serwist)
  components/         # Dashboard UI (Header, SummaryCards, DonationsByOrg, DeploymentHubs, GoodsByCategory, AidDistributionMap, StatusFooter)
  hooks/              # Custom React hooks
  lib/
    supabase.ts       # Server-side Supabase client
    queries.ts        # Typed query functions for dashboard sections
  i18n/
    routing.ts        # Locale definitions
    request.ts        # Server-side i18n config
    types.ts          # next-intl AppConfig type augmentation
  middleware.ts       # Locale detection/redirect
supabase/
  schema.sql          # Database schema (5 tables)
  seed-kml.ts         # KML parser → Supabase seed script
data/                 # Real relief operation data (KML exports)
messages/             # Translation files (en.json, fil.json, ilo.json)
docs/                 # Architecture, setup guide, plans
public/
  manifest.json       # PWA manifest
  icons/              # PWA icons
```

## Lessons Learned

- `Problem:` Supabase JS client returns nested relations as `unknown` types → `Rule:` Cast join results explicitly (e.g., `row.organizations as unknown as { name: string }`) in query functions
- `Problem:` Serwist only generates service worker on webpack builds → `Rule:` Use `npm run build` (not dev server) to test offline behavior
