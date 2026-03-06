# Architecture

## System Overview

LUaid is a Vite + React SPA that fetches data from Supabase (Postgres) client-side and caches the entire app shell for offline use via a Workbox service worker. Content comes from a WordPress CMS. The architecture prioritizes simplicity — client-side fetch, render, cache — with room to grow into forms, real-time updates, and offline sync.

```
┌─────────────────────┐   client fetch    ┌──────────────┐
│   React SPA         │ ──────────────→   │   Supabase   │
│   (Vite + Router)   │                   │  (Postgres)  │
│                     │ ← JSON ────────   │              │
└──────────┬──────────┘                   └──────────────┘
           │
           │  precached shell
           ▼
┌─────────────────────┐
│   Service Worker     │  Workbox GenerateSW
│   (vite-plugin-pwa)  │  precaches shell, NetworkFirst for API
└─────────────────────┘
```

**Data flow:** React components call query functions in `src/lib/queries.ts` → Supabase client (`src/lib/supabase.ts`) fetches from Postgres using the anon key → the entire app shell is precached by the Workbox service worker → Supabase API calls use NetworkFirst caching strategy.

The Supabase anon key is safe for browser use — it relies on Row Level Security (RLS) policies to control access.

## Database Schema

Five tables, centered around the `deployments` table which represents individual aid delivery events.

```
organizations ──┬──→ donations
                │
                └──→ deployments ←── aid_categories
                         │
                         └──→ barangays (optional grouping)
```

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organizations` | Donors and deployment hubs | name, type (donor/hub/both), municipality, lat/lng |
| `aid_categories` | Lookup table for aid types | name, icon (7 pre-seeded categories) |
| `barangays` | Geographic aggregation | name, municipality, lat/lng, population |
| `donations` | Monetary contributions | organization_id, amount, date |
| `deployments` | Aid delivery events (core table) | organization_id, aid_category_id, barangay_id, quantity, unit, recipient, lat/lng, date |

All primary keys are UUIDs — designed for future offline sync where multiple devices need collision-free IDs.

Full SQL schema: `supabase/schema.sql`

### Query Functions

`src/lib/queries.ts` provides 8 typed functions that map to dashboard sections:

| Function | Returns |
|----------|---------|
| `getTotalDonations()` | Sum of all donation amounts |
| `getTotalBeneficiaries()` | Sum of deployment quantities |
| `getVolunteerCount()` | Sum of volunteer counts |
| `getDonationsByOrganization()` | Donations grouped by org, sorted by amount |
| `getDeploymentHubs()` | Deployment count per org + municipality |
| `getGoodsByCategory()` | Quantities grouped by aid category |
| `getDeploymentMapPoints()` | Lat/lng points with metadata for map pins |
| `getBeneficiariesByBarangay()` | Beneficiary totals grouped by barangay |

## Seed Data

Real deployment data from Typhoon Emong relief operations is stored in `data/Emong_relief_operations.kml` — 55 deployment points across 6 organizations. The seed script (`supabase/seed-kml.ts`) parses the KML and inserts organizations + deployments into Supabase.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vite + React SPA | Client-side routing works offline natively; no server required. Next.js RSC payload fetches on every navigation conflict with offline-first. |
| Backend | Supabase (free tier) | Postgres + Auth + Realtime at zero cost. Google Sheets had 60 req/min limits, no relational queries, no auth |
| Data fetching | Client-side (anon key + RLS) | Entire app shell precacheable; API calls cached via Workbox NetworkFirst |
| Routing | react-router v7 | Client-side routing, locale via URL params (`/:locale`), works offline |
| PWA | vite-plugin-pwa (Workbox GenerateSW) | Precaches entire shell, navigateFallback to index.html, runtime caching for API |
| Primary keys | UUIDs | Collision-free IDs for future offline sync from multiple devices |
| Schema design | Deployment-centric | Real KML data shows every aid delivery is a located event — one core table |
| Data entry (MVP) | Supabase table editor | No forms to build yet, fastest path to real data |

## Internationalization

Locale-based routing via react-router URL params: `/:locale` (en, fil, ilo). Translation files in `public/locales/`. Client-side language detection via `i18next-browser-languagedetector` with path-based lookup. `RootLayout` component syncs the i18n language with the URL param.

## What's Built vs Planned

**Built:**
- Vite + React SPA with vite-plugin-pwa service worker
- Client-side locale routing (en, fil, ilo) via react-router v7
- Supabase schema, client, and query functions
- KML seed script with real Typhoon Emong data
- Vitest testing framework
- 7 dashboard components (Header, SummaryCards, DonationsByOrg, DeploymentHubs, GoodsByCategory, AidDistributionMap, StatusFooter) with tests

**Planned (see GitHub Issues):**
- Dashboard route — wire existing components into a routed page with client-side data fetching
- Supabase RLS policies — enable anon key read access to all tables
- Offline sync (#10) — IndexedDB caching + background sync
- Data entry forms (#11) — replace Supabase table editor
- Map visualization (#7) — interactive Leaflet map (static AidDistributionMap placeholder exists)
- Barangay triage (#15) — status board for prioritizing aid
- CMS integration (#13) — WordPress content via REST API

## Further Reading

- `docs/plans/` — Design documents for each implementation phase
- `docs/project-history.md` — Origin story and project direction
