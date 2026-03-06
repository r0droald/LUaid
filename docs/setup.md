# Local Development Setup

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)

## 1. Clone and Install

```bash
git clone https://github.com/r0droald/LUaid.git
cd LUaid
npm install
```

## 2. Configure Environment

```bash
cp .env.example .env.local
```

The `.env.example` file already contains the project's Supabase credentials — no changes needed.

> **Why are these credentials in the repo?** LUaid uses the Supabase **anon (public) key**, which is designed to be exposed. It ships to every user's browser in the built JavaScript bundle and is visible in network requests on the deployed site. Supabase's security model does not rely on this key being secret — all access control is enforced by [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) policies on the database. Our RLS policies grant public **read-only** access to all tables (see `supabase/rls-policies.sql`).
>
> The **service role key** (which bypasses RLS) is never committed and is only needed for admin scripts like the KML seeder.

## 3. Run the Dev Server

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173). The dashboard should load with live data from the shared Supabase database.

## 4. Understanding the Data

The dashboard displays relief operation data from two sources:

### Real data — KML field exports

The file `data/Emong_relief_operations.kml` contains GPS-tagged deployment records from **Typhoon Emong** relief operations in La Union, Philippines. This data was exported from Google Earth by field coordinators and includes 6 organizations and ~55 deployment records across San Juan.

The KML seeder script (`supabase/seed-kml.ts`) parses this file and inserts it into Supabase. **You don't need to run this** — the data is already in the shared database.

### Demo data — prototype seed

The file `supabase/seed-demo.sql` adds mock data to fill out the dashboard prototype: additional organizations, donations (totaling ~₱2.8M), barangay records, volunteer counts, and deployments spread across Bacnotan, Bauang, and Luna. All demo records are tagged with `notes = 'demo-seed'` for easy identification and cleanup.

**You don't need to run this either** — it's already seeded in the shared database.

### Setting up your own Supabase project (optional)

If you want a private database instance instead of using the shared one:

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Run `supabase/schema.sql` in the **SQL Editor** (creates tables + aid categories)
3. Run `supabase/rls-policies.sql` in the **SQL Editor** (enables public read access)
4. Update `.env.local` with your project's URL and anon key (from **Settings → API**)
5. Optionally seed data:
   - **Real data:** Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, then run `npx tsx supabase/seed-kml.ts data/Emong_relief_operations.kml`
   - **Demo data:** Run `supabase/seed-demo.sql` in the SQL Editor

## 5. Testing and Linting

```bash
npm test              # Run tests (single run)
npm run test:watch    # Run tests (watch mode)
npm run lint          # ESLint
```

## 6. Testing Offline / PWA

The Vite dev server does not generate a service worker. To test offline behavior:

```bash
npm run build && npm run preview
```

## Common Issues

| Issue | Fix |
|-------|-----|
| Dashboard shows no data | Check that `.env.local` exists and has the `VITE_` prefixed variables |
| Port 5173 in use | Vite auto-increments to the next available port |
| Service worker not working in dev | Expected — use `npm run build && npm run preview` to test offline |
| Seed script fails with "relation does not exist" | Run `supabase/schema.sql` in the SQL Editor first |
