# CLAUDE.md — LUaid.org

## Project Overview

LUaid.org is an open-source Progressive Web App for disaster relief operations in La Union, Philippines. It tracks and visualizes donations, volunteer deployments, and aid distribution. Designed for offline-first use in low-connectivity disaster zones.

## Architecture

- **Frontend**: Vite + React SPA with react-router v7, TypeScript (strict mode)
- **Database**: Supabase (Postgres) — browser-side via anon key (RLS required)
- **CMS**: WordPress backend at cms.LUaid.org (REST API for content)
- **Maps**: Leaflet + OpenStreetMap (static placeholder exists; interactive map planned — Issue #7)
- **PWA**: vite-plugin-pwa (Workbox GenerateSW) for offline caching
- **i18n**: react-i18next with i18next-http-backend (loads from `public/locales/`)
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
- Vite SPA with client-side routing (react-router v7)
- Tailwind CSS for styling (via `@tailwindcss/vite` plugin)
- Components in `src/components/`, pages in `src/pages/`, query functions in `src/lib/queries.ts`
- Environment variables use `VITE_` prefix via `import.meta.env`

## Commands

```bash
npm run dev          # Vite dev server (HMR, no service worker)
npm run build        # TypeScript check + Vite production build (generates SW)
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm test             # Run tests (Vitest, once)
npm run test:watch   # Run tests (watch mode)
```

## Project Structure

```
src/
  main.tsx            # App entry point (ReactDOM + RouterProvider)
  index.css           # Global styles (Tailwind)
  i18n.ts             # i18next config (HTTP backend, language detection)
  router.tsx          # Client-side routes (react-router v7)
  components/
    RootLayout.tsx    # Locale-aware layout (syncs i18n + html lang)
    Header.tsx        # Site header with navigation
    SummaryCards.tsx   # Dashboard summary cards
    DonationsByOrg.tsx
    DeploymentHubs.tsx
    GoodsByCategory.tsx
    AidDistributionMap.tsx
    StatusFooter.tsx
    dashboard/        # Dashboard-specific components (planned)
    forms/            # Form components (planned)
    maps/             # Map components (planned)
    shared/           # Shared UI components (planned)
  pages/
    HomePage.tsx      # Landing page
  hooks/              # Custom React hooks
  lib/
    supabase.ts       # Supabase client (anon key via import.meta.env)
    queries.ts        # Typed query functions for dashboard sections
supabase/
  schema.sql          # Database schema (5 tables)
  seed-kml.ts         # KML parser → Supabase seed script
data/                 # Real relief operation data (KML exports)
public/
  locales/            # Translation files ({en,fil,ilo}/translation.json)
  icons/              # PWA icons
index.html            # SPA entry point
vite.config.ts        # Vite config (React, Tailwind, PWA, tsconfig paths)
docs/                 # Architecture, setup guide, plans
```

## Lessons Learned

- `Problem:` Supabase JS client returns nested relations as `unknown` types → `Rule:` Cast join results explicitly (e.g., `row.organizations as unknown as { name: string }`) in query functions
- `Problem:` PWA service worker only generated on production build → `Rule:` Use `npm run build && npm run preview` to test offline behavior
