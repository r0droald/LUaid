# Seed Data Expansion & Hazard Photo Compression

**Date:** 2026-04-19
**Status:** Design — pending user review

## Context

The current demo seed (`supabase/seed-demo.sql`) has 4 organizations, 5 deployment hubs, 8 needs, 4 hazards, 8 donations, 4 purchases, and 2 deployments. Now that the data model is stable, the demo data should feel fuller and more realistic — enough volume to make the map and dashboard pop, and enough depth (coordinator names, phone numbers, current-status notes) to read as a real disaster-relief operation in La Union.

Separately, the 4 hazard photos (`public/demo-hazards/*.jpg`) are uncompressed full-size JPEGs (144–736KB, 1600px wide). They only load when a user opens a hazard popup (not on initial page load), but for an offline-first PWA on low-bandwidth networks the size penalty matters. This spec folds in a one-shot compression pass for those photos.

This is scoped narrowly: seed data + photo compression only. No schema changes, no RLS changes, no new UI, no migration to Supabase Storage for hazard photos.

## Scope

### In

- Replace the demo data in `supabase/seed-demo.sql` with expanded, richer data:
  - 8 organizations (up from 4)
  - 8 deployment hubs (up from 5)
  - 15 needs (up from 8)
  - 6 hazards (up from 4)
  - 14 donations (up from 8)
  - 8 purchases (up from 4)
  - 0 deployments (down from 2 — no UI renders them)
- Compress the 4 existing hazard photos in place via a new one-shot Node script using `sharp`.
- Add `sharp` as a devDependency if not already present.

### Out (deferred)

- New hazard photos beyond the 4 that already exist (user will add later).
- Moving hazard photos to Supabase Storage — static files win for offline-first PWA caching; revisit if/when that tradeoff changes.
- Schema, RLS, or RPC changes.
- UI changes of any kind.
- Adding municipalities outside La Union.
- Inventing specific barangay names (municipalities only).
- Expanding `aid_categories` beyond the existing 9.

## Decisions

### D1 — Geographic bounds

All coordinates stay inland in La Union. Bounding box:
- **Latitude:** 16.40 – 16.87
- **Longitude:** 120.32 – 120.45 (never below 120.32 — that's the South China Sea)

Real municipality names used: San Juan, Bacnotan, Balaoan, Luna, San Fernando, Bauang, Aringay, Agoo, Naguilian, San Gabriel. No invented barangay names; notes reference generic landmarks ("the river crossing," "the market," "the elementary school").

**Why:** The existing seed has a hazard near the coast that reads as floating in the ocean, and a few needs close to or past the shoreline. Keeping everything ≥ 120.32 longitude guarantees inland placement. Barangay-level specificity was declined because it requires confident real-admin-division data that I don't have without a web lookup.

### D2 — Need status distribution (15 total)

| Status | Count | Rationale |
|---|---|---|
| `pending` | 8 | Largest bucket — shows fresh reports awaiting triage, the main work queue |
| `verified` | 3 | Confirmed reports that haven't been dispatched yet |
| `in_transit` | 4 | Active deliveries — shows ops in motion |
| `confirmed` | 0 | Excluded per user direction — confirmed needs don't belong on the open-work map |

**Why:** The `need_status` enum has 4 states (`pending → verified → in_transit → confirmed`). The map is for open work only, so `confirmed` is excluded. Weighting toward `pending` mirrors a real early-relief scenario where reports arrive faster than the team can triage.

### D3 — Zero deployments in seed

`deployments` rows conventionally link to `confirmed` needs. With zero confirmed needs, there are zero deployments. The Deployments page doesn't exist in the current router (`src/router.tsx` only exposes `/`, `/dashboard`, `/report`, `/login`), so this has no visible impact.

**Why:** A planned Deployments page was considered earlier but never shipped. Seeding deployments against invented confirmed needs to "fill" a page that doesn't render would be work for nothing.

### D4 — Phone number policy

- **Needs:** all 15 have `contact_phone`. Philippine mobile format, compact form (`09XXXXXXXXX`) to match existing seed style.
- **Hazards:** 4 of 6 have `contact_phone` (the schema supports it but the current seed never sets it). 2 left NULL to model the "anonymous report" pattern.

**Why:** User wants contacts reliably reachable. Hazards are a mix because hazard reports are sometimes anonymous walk-ups.

### D5 — Hazard photos (6 hazards, 4 photos)

| Hazard type | Photo used | `contact_phone`? |
|---|---|---|
| Major flooding (Bauang River) | `flooding.jpg` | yes |
| Landslide (Naguilian Road) | `landslide.jpg` | yes |
| Downed power lines (Bacnotan market) | `power-lines.jpg` | no (anonymous) |
| Weakened bridge (San Gabriel, resolved) | `bridge.jpg` | yes |
| Storm damage to elementary school roof | NULL | yes |
| Debris blocking access road (resolved) | NULL | no (anonymous) |

4 active + 2 resolved. Exact lat/lng/municipality assignments will be nailed down during implementation, all within D1 bounds.

**Why:** Reuses existing images rather than adding new files. Two photo-less hazards demonstrate the NULL-`photo_url` path in the UI.

### D6 — Hazard photo compression

New file: `scripts/compress-hazard-photos.ts` (TypeScript, runnable via `tsx`). Uses `sharp`:

- Reads each `public/demo-hazards/*.jpg` file.
- Resizes to max 1200px on the long edge (preserves aspect ratio).
- Re-encodes as JPEG quality 75, progressive, `mozjpeg: true`.
- Writes back in place.
- Idempotent — safe to rerun; if the file is already small, recompressing barely changes size.
- Not part of `npm run build` — run manually once (`npx tsx scripts/compress-hazard-photos.ts`), commit the compressed results.

**Targets (approximate, implementation will verify):**
- `flooding.jpg` 638KB → ≤150KB
- `landslide.jpg` 736KB → ≤150KB
- `bridge.jpg` 587KB → ≤150KB
- `power-lines.jpg` 144KB → ≤80KB

**Why `sharp` not a browser canvas:** `sharp` handles arbitrary input sizes without browser memory limits. A prior compression attempt (per user) failed when source images were too big — this is the fix. `sharp` downscales first in a streaming decoder before re-encoding, so 16MP+ sources work fine.

**Why commit the compressed output:** The compressed files are what ship. No runtime compression cost, no build-step cost. If a future source image needs re-compression, rerun the script and recommit.

### D7 — Donations and purchases

- **Donations:** 14 total. Spread across all 8 organizations (not weighted toward 2–3). Mix of cash and in-kind. Dates span 2026-03-25 through 2026-04-18 to show ongoing fundraising.
- **Purchases:** 8 total. Spread across 5–6 of the organizations. Recent purchases (dates through 2026-04-18) emphasized per user direction.
- **Donor variety:** mix of named individuals, named organizations, and a couple anonymous (NULL `donor_name`). Include OFW / diaspora themes that read as authentic to a La Union relief op.

**Why:** Current donations are concentrated in 4 orgs; with 8 orgs, the dashboard's per-org breakdown needs data across all of them to look populated. Recent-date purchases make "ongoing spend" feel active.

### D8 — Hub notes depth

Every hub gets a 2–3 sentence `notes` field in the style of the current seed:

- Current operational status (open hours, capacity, or stock level)
- What they currently need (specific shortage)
- Coordinator name + phone (Philippine mobile, compact form)

**Why:** Matches the pattern already set by the current seed notes. Populated notes make hub popups feel alive and reinforce the "kapwa / community-led" tone of the project.

### D9 — Idempotency and re-runnability

The seed file keeps its existing structure:
- Fixed UUIDs for top-level rows (events, orgs, hubs, etc.) so re-running doesn't duplicate.
- `ON CONFLICT (id) DO UPDATE SET ...` on hubs (to refresh descriptions/notes on rerun).
- `ON CONFLICT DO NOTHING` elsewhere.
- Wrapped in a single `DO $$ ... $$` block for category-ID variable resolution (unchanged pattern).

**Why:** Current seed is already idempotent; expansion should preserve that. Devs should be able to run the seed against an existing DB to top up new rows without breaking existing ones.

## Success Criteria

- `supabase/seed-demo.sql` runs cleanly against a fresh schema + RPC-functions load.
- Running the expanded seed against the current demo DB produces exactly:
  - 1 event, 8 organizations, 8 deployment hubs, 15 needs, 6 hazards, 14 donations, 8 purchases, 0 deployments.
- Map view at `/demo/en` shows 8 hubs, 6 hazards, and 11 open needs (pending + verified + in_transit) — no confirmed needs, no ocean pins.
- Dashboard at `/demo/en/dashboard` shows donation totals and purchase activity distributed across all 8 organizations.
- Each `public/demo-hazards/*.jpg` file is ≤150KB after the compression script runs.
- The compression script is idempotent — rerunning produces byte-for-byte identical output.

## Out of Scope (Future Work)

- Adding more hazard photo files (user will do this).
- Supabase Storage migration for hazard photos (accepted as future work if we ever break offline-caching).
- Deployments page UI — if/when it ships, the seed gets a deployments-expansion pass.
- Tenant-specific seed data for non–La Union deployments (deferred with the broader tenant architecture).
