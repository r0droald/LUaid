# Supabase Backend — Design Document

**Date:** 2026-03-05
**Status:** Draft
**Related issues:** #17 (Supabase proposal), #9 (Dashboard), #10 (Offline sync), #6 (GSheets — superseded)

## Summary

Replace the proposed Google Sheets backend with Supabase (Postgres) as the data layer for LUaid.org. The MVP is a read-only transparency dashboard powered by server-side rendering, with data entered via the Supabase table editor. Real deployment data from Typhoon Emong relief operations (KML export from Google Maps) will seed the database.

## Goals

- Ship a working prototype dashboard with real data that collaborators can share with aid workers
- Establish a schema that matches real-world relief operation data (validated against KML export of 55 actual deployment points)
- Keep the architecture simple: SSR fetch → render → cache for offline
- Design for future expansion (forms, offline sync, real-time) without over-building now

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Backend | Supabase (free tier) | Postgres + Auth + Realtime + Storage at zero cost. GSheets has 60 req/min limits, no relational queries, no auth |
| Data entry (MVP) | Supabase table editor | Fastest path to real data in the prototype. No forms to build yet |
| Frontend data fetching | Server components (SSR) | Keys stay server-side, rendered HTML cached by service worker for offline, simplest architecture |
| Primary keys | UUIDs | Future offline sync needs collision-free IDs from multiple devices |
| Schema design | Deployment-centric | Real KML data shows every aid delivery is a located event. One core table instead of separate deployments/goods/distributions |

## Schema

### Entity Relationship

```
organizations ──┬──→ donations
                │
                └──→ deployments ←── aid_categories
                         │
                         └──→ barangays (optional grouping)
```

### Tables

#### organizations
Who is doing the work — donors, deployment hubs, or both.

```sql
CREATE TABLE organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  type         text NOT NULL CHECK (type IN ('donor', 'hub', 'both')),
  municipality text,
  lat          decimal(9,6),
  lng          decimal(9,6),
  created_at   timestamptz DEFAULT now()
);
```

Seed data from KML: Waves4Water, Citizens for LU, CURMA, Emerging Islands, FEED/Citizens for LU, Burt Rebuild.

#### aid_categories
Broad groupings for dashboard rollups.

```sql
CREATE TABLE aid_categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text
);
```

Seed values: Water Filtration, Meals, Relief Goods, Construction Materials, Cleaning Supplies, Drinking Water, Kiddie Packs.

#### barangays
Geographic aggregation layer for the dashboard's "Aid Distribution Map" section.

```sql
CREATE TABLE barangays (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  municipality text NOT NULL,
  lat          decimal(9,6),
  lng          decimal(9,6),
  population   integer,
  created_at   timestamptz DEFAULT now()
);
```

Barangay coordinates can be derived by clustering nearby deployment points from the KML data, or entered manually from known barangay center coordinates.

#### donations
Monetary contributions — separate from aid delivery.

```sql
CREATE TABLE donations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  amount          decimal(12,2) NOT NULL,
  date            date NOT NULL,
  notes           text,
  created_at      timestamptz DEFAULT now()
);
```

No KML source for this — will be entered manually via Supabase table editor using data from the team.

#### deployments
The core table. Every aid delivery event = one row. Maps 1:1 to KML Placemarks.

```sql
CREATE TABLE deployments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  aid_category_id uuid NOT NULL REFERENCES aid_categories(id),
  barangay_id     uuid REFERENCES barangays(id),
  quantity        integer,
  unit            text,
  recipient       text,
  lat             decimal(9,6),
  lng             decimal(9,6),
  date            date,
  volunteer_count integer,
  hours           decimal(5,1),
  notes           text,
  created_at      timestamptz DEFAULT now()
);
```

Real data examples from KML:
| org | category | quantity | unit | recipient | lat | lng |
|-----|----------|----------|------|-----------|-----|-----|
| Waves4Water | Water Filtration | 6 | filters | — | 16.6589 | 120.3312 |
| Citizens for LU | Meals | 200 | meals | Residents | 16.6912 | 120.3410 |
| Emerging Islands | Relief Goods | 50 | packs | Residents (kiddie packs) | 16.7340 | 120.3433 |
| Burt Rebuild | Construction Materials | 3 | sheets | Aileen Paguirigan | 16.7334 | 120.3667 |

### Dashboard Query Mapping

| Dashboard Section | Query |
|---|---|
| Total Donations (₱) | `SELECT SUM(amount) FROM donations` |
| Total Beneficiaries | `SELECT SUM(quantity) FROM deployments WHERE unit IN ('meals','packs','goods',...)` |
| Volunteer Count | `SELECT SUM(volunteer_count) FROM deployments` |
| Donations by Org | `SELECT o.name, SUM(d.amount) FROM donations d JOIN organizations o ... GROUP BY o.id` |
| Deployment Hubs | `SELECT o.name, o.municipality, COUNT(*) FROM deployments d JOIN organizations o ... GROUP BY o.id` |
| Goods by Category | `SELECT ac.name, SUM(d.quantity) FROM deployments d JOIN aid_categories ac ... GROUP BY ac.id` |
| Aid Map (pins) | `SELECT lat, lng, quantity, unit FROM deployments` |
| Aid Map (by barangay) | `SELECT b.name, b.municipality, SUM(d.quantity) FROM deployments d JOIN barangays b ... GROUP BY b.id` |

## Integration Architecture

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

### Files to create

```
src/
  lib/
    supabase.ts       # Server-side Supabase client (service role key)
    queries.ts         # Typed query functions for each dashboard section
```

### Environment variables

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<key>
```

Server-side only. Never exposed to the browser. Added to `.env.local` (gitignored) and Vercel environment settings.

### Dependencies

```
@supabase/supabase-js  # Only new dependency
```

## Seed Data

The KML file (`Emong_relief_operations.kml`) contains 55 real deployment points from Typhoon Emong relief operations across 6 organizations. A one-time seed script will:

1. Parse the KML XML
2. Create organization records for each `<Folder>`
3. Map Placemark names to aid categories (e.g., "Filters" → Water Filtration, "meals served" → Meals)
4. Insert deployment records with coordinates, quantities, and units

This gives the prototype real data from day one.

## What This Enables Next

Once this MVP is live and in collaborators' hands:

1. **Dashboard UI (#9)** — build the frontend against real Supabase data
2. **Offline sync (#10)** — add IndexedDB caching and background sync
3. **Forms (#11)** — authenticated forms to submit data (replace Supabase table editor)
4. **Maps (#7)** — Leaflet rendering of deployment coordinates
5. **Barangay triage (#15)** — status board using barangay + deployment data

## Out of Scope (for now)

- Supabase Auth (no user-facing forms yet)
- Real-time subscriptions (SSR with revalidation is sufficient for MVP)
- Row-Level Security policies (add when auth is introduced)
- Image/photo storage (wireframe mentions on-site photos — future feature)
- Timeline/phases view (CMS content, not database)
