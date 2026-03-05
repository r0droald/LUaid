# Local Development Setup

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier)

## 1. Clone and Install

```bash
git clone https://github.com/r0droald/LUaid.git
cd LUaid
npm install
```

## 2. Set Up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql` — this creates all tables and seeds the aid categories
3. Go to **Settings → API** and copy your **Project URL** and **service_role key**

## 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

This file is gitignored. Never commit real keys.

## 4. Seed the Database (Optional)

The repo includes real deployment data from Typhoon Emong relief operations. To seed your Supabase database:

```bash
npx tsx supabase/seed-kml.ts data/Emong_relief_operations.kml
```

This parses the KML file and inserts 6 organizations and ~55 deployment records.

**Note:** The schema must be applied first (step 2) — the seed script expects the `aid_categories` table to already be populated.

## 5. Run the Dev Server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The dev server uses Turbopack and does not generate a service worker.

To test offline/PWA behavior, use a production build:

```bash
npm run build && npm run start
```

## 6. Run Tests

```bash
npm test            # Single run
npm run test:watch  # Watch mode
```

## 7. Lint

```bash
npm run lint
```

## Common Issues

| Issue | Fix |
|-------|-----|
| `SUPABASE_URL is not defined` | Make sure `.env.local` exists and has both variables set |
| Seed script fails with "relation does not exist" | Run `supabase/schema.sql` in the Supabase SQL Editor first |
| Service worker not working in dev | Expected — Serwist only generates the SW on `npm run build` (webpack). Use a production build to test offline. |
