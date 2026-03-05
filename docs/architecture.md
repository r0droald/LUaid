# Architecture

## System Overview

LUaid is a Next.js PWA that fetches data from Supabase (Postgres) via server components and caches rendered HTML for offline use. Content comes from a WordPress CMS. The architecture prioritizes simplicity — SSR fetch, render, cache — with room to grow into forms, real-time updates, and offline sync.

```
┌─────────────────────┐    SSR fetch     ┌──────────────┐
│   Next.js App       │ ──────────────→  │   Supabase   │
│ (Server Components) │                  │  (Postgres)  │
│                     │ ← JSON ────────  │              │
└──────────┬──────────┘                  └──────────────┘
           │
           │  rendered HTML
           ▼
┌─────────────────────┐
│   Service Worker     │  caches pages for offline
│     (Serwist)        │
└─────────────────────┘
```

**Data flow:** Server components call query functions in `src/lib/queries.ts` → Supabase client (`src/lib/supabase.ts`) fetches from Postgres using the service role key → rendered HTML is served to the browser → Serwist service worker caches pages for offline access.

The Supabase service role key is server-side only and never reaches the browser.

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
| Backend | Supabase (free tier) | Postgres + Auth + Realtime at zero cost. Google Sheets had 60 req/min limits, no relational queries, no auth |
| Data fetching | Server components (SSR) | Keys stay server-side, rendered HTML cached by service worker |
| Primary keys | UUIDs | Collision-free IDs for future offline sync from multiple devices |
| Schema design | Deployment-centric | Real KML data shows every aid delivery is a located event — one core table |
| Data entry (MVP) | Supabase table editor | No forms to build yet, fastest path to real data |

## Internationalization

Locale-based routing via `next-intl`: `/en/`, `/fil/`, `/ilo/`. Translation files in `messages/`. Server-side locale detection in `middleware.ts` redirects to the appropriate locale.

## What's Built vs Planned

**Built:**
- Next.js PWA scaffold with Serwist service worker
- Locale-based routing (en, fil, ilo)
- Supabase schema, client, and query functions
- KML seed script with real Typhoon Emong data
- Vitest testing framework

**Planned (see GitHub Issues):**
- Dashboard UI (#9) — frontend consuming the query functions
- Offline sync (#10) — IndexedDB caching + background sync
- Data entry forms (#11) — replace Supabase table editor
- Map visualization (#7) — Leaflet rendering of deployment coordinates
- Barangay triage (#15) — status board for prioritizing aid
- CMS integration (#13) — WordPress content via REST API
- Supabase Auth + RLS — add when user-facing forms are built

## Further Reading

- `docs/plans/` — Design documents for each implementation phase
- `docs/project-history.md` — Origin story and project direction
