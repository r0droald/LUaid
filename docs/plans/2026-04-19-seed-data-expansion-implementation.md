# Seed Data Expansion + Photo Compression — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `supabase/seed-demo.sql` with richer, inland-only La Union demo data (8 orgs / 8 hubs / 15 needs / 6 hazards / 14 donations / 8 purchases / 0 deployments) and compress the 4 existing hazard photos via a one-shot `sharp` script.

**Architecture:** Two independent workstreams. (1) A new `scripts/compress-hazard-photos.ts` that downscales and re-encodes `public/demo-hazards/*.jpg` in place via `sharp`, run once and the results committed. (2) Complete rewrite of `supabase/seed-demo.sql` preserving its existing idempotent structure (fixed UUIDs, `ON CONFLICT` clauses, single `DO $$ ... $$` block for aid-category variable resolution).

**Tech Stack:** PostgreSQL (Supabase), TypeScript, `sharp` (new devDep), `tsx` (existing).

**Spec:** [2026-04-19-seed-data-expansion.md](./2026-04-19-seed-data-expansion.md)

---

## File Structure

- **Create:** `scripts/compress-hazard-photos.ts` — one-shot image compression
- **Modify:** `public/demo-hazards/flooding.jpg` — binary replaced by script output
- **Modify:** `public/demo-hazards/landslide.jpg` — binary replaced by script output
- **Modify:** `public/demo-hazards/bridge.jpg` — binary replaced by script output
- **Modify:** `public/demo-hazards/power-lines.jpg` — binary replaced by script output
- **Modify:** `package.json` — add `sharp` to `devDependencies`, add `compress-photos` npm script
- **Modify:** `supabase/seed-demo.sql` — complete rewrite with expanded data

Each seed section (orgs, hubs, needs, hazards, donations/purchases) gets its own task with complete SQL so each commit is a reviewable unit.

---

## Task 1: Add `sharp` and the compression script

**Files:**
- Modify: `package.json`
- Create: `scripts/compress-hazard-photos.ts`

- [ ] **Step 1: Install sharp as a devDependency**

Run:

```bash
npm install --save-dev sharp
```

Expected: adds `"sharp": "^0.33.x"` (or newer) to `devDependencies` in `package.json`. `tsx` is already installed (^4.21.0).

- [ ] **Step 2: Create the compression script**

Create `scripts/compress-hazard-photos.ts` with this exact content:

```typescript
import { readdirSync, statSync } from "node:fs";
import { resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const photoDir = resolve(__dirname, "..", "public", "demo-hazards");

const MAX_WIDTH = 1000;
const JPEG_QUALITY = 72;

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function compress(filePath: string): Promise<void> {
  const before = statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  // Only write back if the savings are meaningful (>10%). Tiny shavings
  // come from JPEG re-encoding drift, not real compression gains.
  const savingsPct = (before - buffer.length) / before;
  if (savingsPct > 0.1) {
    const fs = await import("node:fs/promises");
    await fs.writeFile(filePath, buffer);
    console.log(`  ${basename(filePath)}: ${kb(before)} → ${kb(buffer.length)} ✓`);
  } else {
    console.log(`  ${basename(filePath)}: ${kb(before)} (already compressed, skipping)`);
  }
}

async function main(): Promise<void> {
  const files = readdirSync(photoDir)
    .filter((f) => extname(f).toLowerCase() === ".jpg" || extname(f).toLowerCase() === ".jpeg")
    .map((f) => resolve(photoDir, f));

  if (files.length === 0) {
    console.log(`No JPEGs found in ${photoDir}`);
    return;
  }

  console.log(`Compressing ${files.length} hazard photo(s)…`);
  for (const file of files) {
    await compress(file);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Add an npm script for convenience**

Modify `package.json` — add this line to the `scripts` section (alongside the existing `translate`, `perf`, etc. scripts):

```json
"compress-photos": "tsx scripts/compress-hazard-photos.ts",
```

- [ ] **Step 4: Run the script**

Run:

```bash
npm run compress-photos
```

Expected output (approximate, exact KB will vary with the source images):

```
Compressing 4 hazard photo(s)…
  bridge.jpg: 587KB → ~200-230KB ✓
  flooding.jpg: 638KB → ~150-200KB ✓
  landslide.jpg: 736KB → ~230-280KB ✓
  power-lines.jpg: 144KB → ~20-30KB ✓
Done.
```

Dense disaster scenes (debris, water textures) compress worse than smooth photos — `landslide.jpg` is expected to be the largest.

- [ ] **Step 5: Verify compression achieved**

Run:

```bash
ls -lh public/demo-hazards/
```

Expected: all files ≤ 280KB, total directory size ~700KB (down from ~2.1MB). If any file exceeds 300KB, investigate (may indicate a larger source image than expected).

- [ ] **Step 6: Verify idempotency**

Run the script a second time:

```bash
npm run compress-photos
```

Expected: every file reports `(already compressed, skipping)`. File sizes unchanged from Step 5.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/compress-hazard-photos.ts public/demo-hazards/
git commit -m "chore(seed): compress hazard photos + add one-shot sharp script

Downscale to 1200px max width, JPEG quality 75 progressive (mozjpeg).
Script is idempotent — only writes back if the new buffer is smaller.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Rewrite seed — organizations (4 → 8)

**Files:**
- Modify: `supabase/seed-demo.sql` (organizations section, lines ~17-29)

- [ ] **Step 1: Replace the Organizations block**

In `supabase/seed-demo.sql`, find the block that starts with `-- Organizations` and replace the entire `INSERT INTO organizations ... ON CONFLICT DO NOTHING;` statement with:

```sql
-- ============================================================
-- Organizations
-- ============================================================
INSERT INTO organizations (id, event_id, name, description, contact_info) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Citizens for La Union', 'Local civic org coordinating donations and volunteer dispatch', 'info@citizensforlu.ph'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Buhaki LU Chapter', 'Volunteer rescue and relief group — boat and 4x4 access', 'buhaki.launion@gmail.com'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Art Relief Mobile Kitchen', 'Hot meals program for displaced communities', 'artrelief@gmail.com'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'LU Provincial Disaster Response', 'Provincial government disaster response unit (PDRRMO)', 'pdrrmo@launion.gov.ph'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Ilocos Medical Volunteers', 'Volunteer nurses and doctors coordinating health outreach', 'ilocosmed@gmail.com'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'San Fernando Rotary Club', 'Civic club funding hygiene kits and potable water', 'rotary.sanfernando@gmail.com'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
   'La Union Surf Association', 'Local surfer-led community supporting coastal barangays', 'lusurf@gmail.com'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
   'Bayanihan Builders LU', 'Construction volunteers rebuilding homes and shelters', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  contact_info = EXCLUDED.contact_info;
```

Note the conflict clause changes from `ON CONFLICT DO NOTHING` to `ON CONFLICT (id) DO UPDATE SET ...` — this lets re-runs refresh descriptions without duplicating. Matches the pattern already used on `deployment_hubs`.

- [ ] **Step 2: Verify SQL syntax**

Run (from repo root):

```bash
python3 -c "import re; content=open('supabase/seed-demo.sql').read(); m=re.findall(r'INSERT INTO organizations.*?;', content, re.DOTALL); print(f'{len(m)} organizations insert block(s)'); assert len(m)==1, 'Expected exactly one orgs insert'; print('OK')"
```

Expected: `1 organizations insert block(s)` then `OK`.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): expand organizations 4 → 8

Add Ilocos Medical Volunteers, San Fernando Rotary, LU Surf Association,
Bayanihan Builders LU. Contact emails and richer descriptions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Rewrite seed — deployment hubs (5 → 8) + hub_inventory

**Files:**
- Modify: `supabase/seed-demo.sql` (deployment_hubs section and hub_inventory block)

- [ ] **Step 1: Replace the Deployment Hubs block**

In `supabase/seed-demo.sql`, find the `-- Deployment Hubs` block and replace the `INSERT INTO deployment_hubs ...` statement with:

```sql
-- ============================================================
-- Deployment Hubs (independent from orgs, with lat/lng)
-- ============================================================
INSERT INTO deployment_hubs (id, event_id, name, lat, lng, description, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'San Juan Municipal Hall', 16.6619, 120.3269, 'Main coordination center',
   'Open 24/7 during relief ops. Running low on hot meals — requesting more rice and canned goods. Volunteers needed for evening shifts. Coordinator: Mayor''s Office, 09175550101.'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Bacnotan Community Center', 16.7314, 120.3494, 'Northern relief staging area',
   'Staging area currently at ~80% capacity. Urgent need for blankets and children''s clothing for evacuees. Contact Brgy. Capt. Reyes at 09175550202.'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'San Fernando City Hall', 16.6159, 120.3267, 'Provincial capital hub',
   'Serves as backup comms center. Supplies adequate. Looking for volunteers for Saturday and Sunday shifts. Satellite phone available for remote coordination. Coordinator: Ms. Aquino, 09175550303.'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Bauang Relief Center', 16.5328, 120.3378, 'Southern relief distribution',
   'Southern distribution point. Drinking water stock lasts ~2 days — resupply requested. Medical team on-site until 6 PM daily. Bridge access OK via truck. Coordinator: Mr. Villanueva, 09175550404.'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Luna Emergency Shelter', 16.8555, 120.3603, 'Emergency shelter for evacuees',
   'Capacity: ~200 people (currently sheltering 145). Need hygiene kits and additional cots. Road access via 4x4 only after landslide at km 14. Coordinator: Ms. Domingo, 09175550505.'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Agoo Parish Hall', 16.3267, 120.3695, 'Southernmost coordination point',
   'Parish hall converted to staging area. Good road access. Kitchen serves 300 meals/day. Low on rice and cooking oil. Coordinator: Fr. Castillo, 09175550606.'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
   'Aringay Barangay Hall', 16.4008, 120.3554, 'Central-south relief post',
   'New staging area stood up 2026-04-02. Functioning well but limited vehicle access during high tide. Need fuel for the delivery truck. Coordinator: Brgy. Capt. Molina, 09175550707.'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
   'Balaoan Community Gym', 16.8122, 120.3878, 'Northern alternate shelter',
   'Alternate shelter for Luna overflow. 50-person capacity, currently 28 occupied. Volunteer cooks needed mornings. Coordinator: Mr. Pascual, 09175550808.')
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  notes = EXCLUDED.notes;
```

All coordinates verified inland (lng ≥ 120.32) within La Union bounds (lat 16.32–16.86).

- [ ] **Step 2: Replace the Hub Inventory block**

Find the `-- Hub Inventory` section inside the `DO $$` block. Replace the existing inventory inserts (covering hubs 1–5) with inserts covering all 8 hubs:

```sql
  -- San Juan hub: hot meals, water, medical
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000001', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000001', cat_water),
    ('c0000000-0000-0000-0000-000000000001', cat_medical)
  ON CONFLICT DO NOTHING;

  -- Bacnotan hub: shelter, clothing, canned food
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000002', cat_shelter),
    ('c0000000-0000-0000-0000-000000000002', cat_clothing),
    ('c0000000-0000-0000-0000-000000000002', cat_canned)
  ON CONFLICT DO NOTHING;

  -- San Fernando hub: water filtration, hygiene, medical
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000003', cat_filtration),
    ('c0000000-0000-0000-0000-000000000003', cat_hygiene),
    ('c0000000-0000-0000-0000-000000000003', cat_medical)
  ON CONFLICT DO NOTHING;

  -- Bauang hub: hot meals, water, canned food
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000004', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000004', cat_water),
    ('c0000000-0000-0000-0000-000000000004', cat_canned)
  ON CONFLICT DO NOTHING;

  -- Luna hub: shelter, construction, hygiene
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000005', cat_shelter),
    ('c0000000-0000-0000-0000-000000000005', cat_construction),
    ('c0000000-0000-0000-0000-000000000005', cat_hygiene)
  ON CONFLICT DO NOTHING;

  -- Agoo hub: hot meals, canned food, clothing
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000006', cat_hot_meals),
    ('c0000000-0000-0000-0000-000000000006', cat_canned),
    ('c0000000-0000-0000-0000-000000000006', cat_clothing)
  ON CONFLICT DO NOTHING;

  -- Aringay hub: water, medical, hygiene
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000007', cat_water),
    ('c0000000-0000-0000-0000-000000000007', cat_medical),
    ('c0000000-0000-0000-0000-000000000007', cat_hygiene)
  ON CONFLICT DO NOTHING;

  -- Balaoan hub: shelter, clothing
  INSERT INTO hub_inventory (hub_id, aid_category_id) VALUES
    ('c0000000-0000-0000-0000-000000000008', cat_shelter),
    ('c0000000-0000-0000-0000-000000000008', cat_clothing)
  ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Verify hub count and coordinate bounds**

Run:

```bash
python3 -c "
import re
content = open('supabase/seed-demo.sql').read()
block = re.search(r'INSERT INTO deployment_hubs.*?ON CONFLICT', content, re.DOTALL).group()
rows = re.findall(r\"'c0000000-0000-0000-0000-00000000000[0-9]'\", block)
print(f'Hub rows: {len(rows)}')
assert len(rows) == 8, f'Expected 8 hubs, got {len(rows)}'
# Extract longitudes
lngs = [float(m.group(1)) for m in re.finditer(r',\s*16\.\d+,\s*(120\.\d+),', block)]
print(f'Longitudes: {lngs}')
assert all(l >= 120.32 for l in lngs), f'Some hub coords west of 120.32'
print('OK — 8 hubs, all inland')
"
```

Expected: `Hub rows: 8`, all longitudes ≥ 120.32, `OK — 8 hubs, all inland`.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): expand deployment hubs 5 → 8 + inventory

Add Agoo, Aringay, Balaoan hubs. All coordinates inland (lng >= 120.32).
Notes include coordinator names + phone for every hub.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Rewrite seed — needs (8 → 15) + need_categories

**Files:**
- Modify: `supabase/seed-demo.sql` (needs and need_categories blocks inside `DO $$`)

Status distribution: 8 pending / 3 verified / 4 in_transit / 0 confirmed. All rows have `contact_phone`. All coordinates inland (lng ≥ 120.32).

- [ ] **Step 1: Replace the Needs block**

Find the `-- Needs` section inside `DO $$` and replace the `INSERT INTO needs ... ON CONFLICT DO NOTHING;` with:

```sql
  -- ============================================================
  -- Needs (15 needs: 8 pending, 3 verified, 4 in_transit, 0 confirmed)
  -- ============================================================
  INSERT INTO needs (id, event_id, hub_id, lat, lng, access_status, urgency, status, num_people, contact_name, contact_phone, notes) VALUES
    -- 8 pending
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.6734, 120.3345, 'truck', 'high', 'pending', 45,
     'Maria Santos', '09171234567', 'Flooded area near the river, families on rooftops'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.7012, 120.3389, '4x4', 'critical', 'pending', 120,
     'Juan Dela Cruz', '09189876543', 'Landslide blocked main road, no food for 2 days'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.5912, 120.3489, 'foot_only', 'critical', 'pending', 60,
     'Rosa Fernandez', '09153334455', 'Mountain village, bridge washed out'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.6289, 120.3398, 'cut_off', 'high', 'pending', 200,
     'Carlos Mendoza', '09161112222', 'Entire sitio cut off by flooding'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.4112, 120.3645, 'truck', 'medium', 'pending', 35,
     'Lourdes Aquino', '09177778899', 'Elderly residents displaced, need dry clothes and blankets'),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.3412, 120.3723, 'truck', 'high', 'pending', 80,
     'Antonio Reyes', '09208889900', 'Barangay health center damaged, requesting medical supplies'),
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.8223, 120.3812, '4x4', 'medium', 'pending', 55,
     'Miguel Torres', '09192223344', 'Remote barangay, needs hygiene kits'),
    ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.7823, 120.3689, 'foot_only', 'high', 'pending', 42,
     'Celia Bautista', '09173456789', 'Footbridge collapsed, families isolated since Tuesday'),
    -- 3 verified
    ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001', 16.6555, 120.3401, 'truck', 'medium', 'verified', 30,
     'Ana Reyes', '09164445566', 'Elderly residents need medical supplies — verified by PDRRMO team'),
    ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000002', 16.7456, 120.3567, '4x4', 'high', 'verified', 85,
     'Pedro Garcia', '09201112233', 'Coastal community cut off by debris, verified by Buhaki volunteers'),
    ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', NULL,
     16.5401, 120.3556, 'truck', 'low', 'verified', 25,
     'Elena Ramos', '09167778899', 'Minor flooding, households need canned food'),
    -- 4 in_transit
    ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000004', 16.5489, 120.3412, 'truck', 'high', 'in_transit', 95,
     'Ricardo Dizon', '09175556677', 'Delivery en route — hot meals and drinking water'),
    ('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000006', 16.3378, 120.3689, 'truck', 'medium', 'in_transit', 50,
     'Josefina Lim', '09182223344', 'Blankets and hygiene kits dispatched via Agoo hub'),
    ('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000007', 16.3955, 120.3512, '4x4', 'critical', 'in_transit', 110,
     'Benjamin Cortez', '09195556677', 'Medical team en route — pregnant women and children need care'),
    ('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000005', 16.8478, 120.3723, '4x4', 'high', 'in_transit', 65,
     'Teresita Gomez', '09207778899', 'Shelter materials and tarps being delivered by Luna hub team')
  ON CONFLICT (id) DO UPDATE SET
    hub_id = EXCLUDED.hub_id,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    access_status = EXCLUDED.access_status,
    urgency = EXCLUDED.urgency,
    status = EXCLUDED.status,
    num_people = EXCLUDED.num_people,
    contact_name = EXCLUDED.contact_name,
    contact_phone = EXCLUDED.contact_phone,
    notes = EXCLUDED.notes;
```

Added `ON CONFLICT DO UPDATE` so reruns refresh fields on rows that already exist with the same UUID. This matters because needs `d0000000-...00000001` through `...00000008` already exist in the DB with old values; without DO UPDATE the old `verified/critical` status etc. would persist.

- [ ] **Step 2: Replace the Need Categories block**

Find the `-- Need Categories` section and replace with:

```sql
  -- ============================================================
  -- Need Categories (multi-select per need)
  -- ============================================================
  DELETE FROM need_categories WHERE need_id IN (
    'd0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006',
    'd0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000008',
    'd0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000010',
    'd0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000012',
    'd0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000014',
    'd0000000-0000-0000-0000-000000000015'
  );
  INSERT INTO need_categories (need_id, aid_category_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000001', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_canned),
    ('d0000000-0000-0000-0000-000000000002', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_shelter),
    ('d0000000-0000-0000-0000-000000000003', cat_construction),
    ('d0000000-0000-0000-0000-000000000003', cat_shelter),
    ('d0000000-0000-0000-0000-000000000004', cat_water),
    ('d0000000-0000-0000-0000-000000000004', cat_filtration),
    ('d0000000-0000-0000-0000-000000000004', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000005', cat_clothing),
    ('d0000000-0000-0000-0000-000000000005', cat_shelter),
    ('d0000000-0000-0000-0000-000000000006', cat_medical),
    ('d0000000-0000-0000-0000-000000000006', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_clothing),
    ('d0000000-0000-0000-0000-000000000008', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000008', cat_water),
    ('d0000000-0000-0000-0000-000000000009', cat_medical),
    ('d0000000-0000-0000-0000-000000000010', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000010', cat_clothing),
    ('d0000000-0000-0000-0000-000000000010', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000011', cat_canned),
    ('d0000000-0000-0000-0000-000000000012', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000012', cat_water),
    ('d0000000-0000-0000-0000-000000000013', cat_clothing),
    ('d0000000-0000-0000-0000-000000000013', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000014', cat_medical),
    ('d0000000-0000-0000-0000-000000000015', cat_shelter),
    ('d0000000-0000-0000-0000-000000000015', cat_construction);
```

`DELETE` first to avoid duplicates on rerun (junction rows have no natural id to `ON CONFLICT` on — the UNIQUE is on the pair but reruns of the INSERT without DELETE would violate it only if the unique-pair constraint isn't a conflict target, and the original seed used `ON CONFLICT DO NOTHING` which relies on PG's `UNIQUE(need_id, aid_category_id)` — that works. Use the same pattern to stay consistent):

Actually **drop the `DELETE` statement above** and just use the existing pattern:

```sql
  INSERT INTO need_categories (need_id, aid_category_id) VALUES
    -- ... (rows as above) ...
  ON CONFLICT DO NOTHING;
```

The `UNIQUE(need_id, aid_category_id)` constraint in the schema means `ON CONFLICT DO NOTHING` handles reruns correctly — existing pairs are skipped, new ones are added. Don't delete; matches the idempotent pattern used everywhere else in the seed.

**Final form of the Need Categories block:**

```sql
  -- ============================================================
  -- Need Categories (multi-select per need)
  -- ============================================================
  INSERT INTO need_categories (need_id, aid_category_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000001', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_canned),
    ('d0000000-0000-0000-0000-000000000002', cat_water),
    ('d0000000-0000-0000-0000-000000000002', cat_shelter),
    ('d0000000-0000-0000-0000-000000000003', cat_construction),
    ('d0000000-0000-0000-0000-000000000003', cat_shelter),
    ('d0000000-0000-0000-0000-000000000004', cat_water),
    ('d0000000-0000-0000-0000-000000000004', cat_filtration),
    ('d0000000-0000-0000-0000-000000000004', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000005', cat_clothing),
    ('d0000000-0000-0000-0000-000000000005', cat_shelter),
    ('d0000000-0000-0000-0000-000000000006', cat_medical),
    ('d0000000-0000-0000-0000-000000000006', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000007', cat_clothing),
    ('d0000000-0000-0000-0000-000000000008', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000008', cat_water),
    ('d0000000-0000-0000-0000-000000000009', cat_medical),
    ('d0000000-0000-0000-0000-000000000010', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000010', cat_clothing),
    ('d0000000-0000-0000-0000-000000000010', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000011', cat_canned),
    ('d0000000-0000-0000-0000-000000000012', cat_hot_meals),
    ('d0000000-0000-0000-0000-000000000012', cat_water),
    ('d0000000-0000-0000-0000-000000000013', cat_clothing),
    ('d0000000-0000-0000-0000-000000000013', cat_hygiene),
    ('d0000000-0000-0000-0000-000000000014', cat_medical),
    ('d0000000-0000-0000-0000-000000000015', cat_shelter),
    ('d0000000-0000-0000-0000-000000000015', cat_construction)
  ON CONFLICT DO NOTHING;
```

Note: no trailing comma on the final value row, `ON CONFLICT DO NOTHING` as terminator.

- [ ] **Step 3: Verify need count, status distribution, contact_phone coverage**

Run:

```bash
python3 << 'EOF'
import re
content = open('supabase/seed-demo.sql').read()
block = re.search(r'-- Needs \(15 needs.*?ON CONFLICT \(id\) DO UPDATE', content, re.DOTALL).group()

# Count rows by status
pending = block.count("'pending'")
verified = block.count("'verified'")
in_transit = block.count("'in_transit'")
confirmed = block.count("'confirmed'")
print(f'pending={pending}, verified={verified}, in_transit={in_transit}, confirmed={confirmed}')
assert (pending, verified, in_transit, confirmed) == (8, 3, 4, 0), 'Status distribution wrong'

# Every row has contact_phone (looks for 09XXXXXXXXX pattern, 11 digits after 09)
phones = re.findall(r"'09\d{9}'", block)
print(f'phones={len(phones)}')
assert len(phones) == 15, f'Expected 15 phones, got {len(phones)}'
print('OK')
EOF
```

Expected: `pending=8, verified=3, in_transit=4, confirmed=0`, `phones=15`, `OK`.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): expand needs 8 → 15 with full status mix

8 pending, 3 verified, 4 in_transit, 0 confirmed. All rows have
contact_phone. All coordinates inland (lng >= 120.32). Uses
ON CONFLICT DO UPDATE so reruns refresh existing UUIDs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Rewrite seed — hazards (4 → 6) with contact_phone

**Files:**
- Modify: `supabase/seed-demo.sql` (Hazards block, currently outside `DO $$`)

- [ ] **Step 1: Replace the Hazards block**

Find the `-- Hazards` section near the end of the file and replace the `INSERT INTO hazards ...` statement with:

```sql
-- ============================================================
-- Hazards (6 hazards: 4 active + 2 resolved; 4 with photos, 2 without)
-- ============================================================
INSERT INTO hazards (id, event_id, description, photo_url, latitude, longitude, status, reported_by, contact_phone) VALUES
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Major flooding along Bauang River — water level 2m above normal, families evacuating to higher ground',
   '/demo-hazards/flooding.jpg', 16.5412, 120.3401, 'active', 'MDRRMO Bauang', '09175551111'),
  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Landslide blocking Naguilian Road km 14 — debris extends approx 30m, heavy equipment needed',
   '/demo-hazards/landslide.jpg', 16.5189, 120.3956, 'active', 'PNP Naguilian', '09175552222'),
  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Downed power lines near Bacnotan market — keep clear, area not yet secured',
   '/demo-hazards/power-lines.jpg', 16.7289, 120.3512, 'active', NULL, NULL),
  ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Storm damage to San Fernando elementary school roof — classrooms unsafe, avoid north wing',
   NULL, 16.6245, 120.3388, 'active', 'Principal Tanoza', '09175553333'),
  ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Bridge weakened at San Gabriel crossing — do not use heavy vehicles (cleared for light traffic 04-12)',
   '/demo-hazards/bridge.jpg', 16.6945, 120.4123, 'resolved', 'DPWH La Union', '09175554444'),
  ('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Debris blocking access road near Aringay market — cleared by community volunteers',
   NULL, 16.4023, 120.3612, 'resolved', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  photo_url = EXCLUDED.photo_url,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status = EXCLUDED.status,
  reported_by = EXCLUDED.reported_by,
  contact_phone = EXCLUDED.contact_phone;
```

Spec mapping:
- 4 with photos (`photo_url` non-null): flooding, landslide, power-lines, bridge → maps to existing compressed files.
- 2 without photos (`photo_url = NULL`): storm damage, debris.
- 4 with `contact_phone`: flooding, landslide, storm damage, bridge.
- 2 anonymous (no phone, no reporter): power-lines, debris.
- 4 active + 2 resolved.
- All coordinates inland (lng ≥ 120.32).

- [ ] **Step 2: Verify hazard count, photo/phone distribution, and inland bounds**

Run:

```bash
python3 << 'EOF'
import re
content = open('supabase/seed-demo.sql').read()
block = re.search(r'-- Hazards \(6 hazards.*?ON CONFLICT \(id\) DO UPDATE', content, re.DOTALL).group()

rows = re.findall(r"'10000000-0000-0000-0000-00000000000[0-9]'", block)
print(f'Hazard rows: {len(rows)}')
assert len(rows) == 6

active = block.count("'active'")
resolved = block.count("'resolved'")
print(f'active={active}, resolved={resolved}')
assert active == 4 and resolved == 2

# Photos: 4 with path, 2 with NULL (NULL appears twice in photo position)
photos = block.count("/demo-hazards/")
print(f'with photos: {photos}')
assert photos == 4

# Phones: 4 with 09XXXXXXXXX
phones = re.findall(r"'09\d{9}'", block)
print(f'with phones: {len(phones)}')
assert len(phones) == 4

# Longitudes inland
lngs = re.findall(r',\s*(120\.\d+),\s*\'(?:active|resolved)\'', block)
print(f'lngs: {lngs}')
assert all(float(l) >= 120.32 for l in lngs)
print('OK')
EOF
```

Expected: `Hazard rows: 6`, `active=4, resolved=2`, `with photos: 4`, `with phones: 4`, all lngs ≥ 120.32, `OK`.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): expand hazards 4 → 6 + add contact_phone

4 active + 2 resolved. 4 with photos (reusing existing compressed
images), 2 without. 4 with contact_phone, 2 anonymous. All inland.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Rewrite seed — donations (8 → 14) + purchases (4 → 8)

**Files:**
- Modify: `supabase/seed-demo.sql` (donations, donation_categories, purchases, purchase_categories blocks inside `DO $$`)

- [ ] **Step 1: Replace the Donations block**

Find the `-- Donations` section inside `DO $$` and replace with:

```sql
  -- ============================================================
  -- Donations (14 total: cash and in-kind, spread across all 8 orgs)
  -- ============================================================
  INSERT INTO donations (id, event_id, organization_id, donor_name, donor_type, type, amount, date, notes) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Overseas Filipino Workers Assoc.', 'organization', 'cash',
     500000.00, '2026-03-25', 'Emergency fund from OFW community'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Gov. Ricardo Ortega', 'individual', 'cash',
     200000.00, '2026-03-26', NULL),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', NULL, NULL, 'cash',
     150000.00, '2026-03-27', 'Anonymous donor via GCash'),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'San Juan Lions Club', 'organization', 'cash',
     300000.00, '2026-03-28', NULL),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 'LU Chamber of Commerce', 'organization', 'cash',
     750000.00, '2026-03-29', 'Business community relief fund'),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 'Red Cross LU', 'organization', 'in_kind',
     NULL, '2026-03-26', 'Medical supplies and hygiene kits'),
    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 'Barangay Urbiztondo', 'organization', 'in_kind',
     NULL, '2026-03-27', 'Hot meals for 3 days'),
    ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 'Manila Volunteers', 'organization', 'in_kind',
     NULL, '2026-03-28', 'Clothing and blankets'),
    -- New donations (recent activity, across newly-added orgs)
    ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 'Dr. Elena Aguilar', 'individual', 'cash',
     75000.00, '2026-04-02', 'Donation from Baguio medical community'),
    ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000006', 'San Fernando Rotarians', 'organization', 'in_kind',
     NULL, '2026-04-05', 'Hygiene kits assembled at weekly meeting'),
    ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000007', NULL, NULL, 'cash',
     45000.00, '2026-04-08', 'Anonymous GCash donations via surf community'),
    ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000008', 'LU Home Depot', 'organization', 'in_kind',
     NULL, '2026-04-10', 'Tarps, rope, and basic construction materials'),
    ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 'Bataan Nurses Union', 'organization', 'in_kind',
     NULL, '2026-04-14', 'Second shipment of basic medical supplies'),
    ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 'Ayala Foundation', 'organization', 'cash',
     1200000.00, '2026-04-17', 'Major corporate grant earmarked for rebuilding phase')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    donor_name = EXCLUDED.donor_name,
    donor_type = EXCLUDED.donor_type,
    type = EXCLUDED.type,
    amount = EXCLUDED.amount,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes;
```

- [ ] **Step 2: Replace the Donation Categories block**

```sql
  -- ============================================================
  -- Donation Categories (for in-kind)
  -- ============================================================
  INSERT INTO donation_categories (donation_id, aid_category_id) VALUES
    ('e0000000-0000-0000-0000-000000000006', cat_medical),
    ('e0000000-0000-0000-0000-000000000006', cat_hygiene),
    ('e0000000-0000-0000-0000-000000000007', cat_hot_meals),
    ('e0000000-0000-0000-0000-000000000008', cat_clothing),
    ('e0000000-0000-0000-0000-000000000010', cat_hygiene),
    ('e0000000-0000-0000-0000-000000000012', cat_shelter),
    ('e0000000-0000-0000-0000-000000000012', cat_construction),
    ('e0000000-0000-0000-0000-000000000013', cat_medical)
  ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Replace the Purchases block**

```sql
  -- ============================================================
  -- Purchases (8 total, spread across 6 orgs, recent dates)
  -- ============================================================
  INSERT INTO purchases (id, event_id, organization_id, cost, date, notes) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001', 85000.00, '2026-03-27', 'Bulk water purchase from supplier'),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 120000.00, '2026-03-28', 'Hot meals ingredients for 500 servings'),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000004', 250000.00, '2026-03-29', 'Temporary shelter materials'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000002', 45000.00, '2026-03-30', 'Hygiene kits assembly'),
    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000005', 95000.00, '2026-04-04', 'Medical supplies restock (IV fluids, wound care)'),
    ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000006', 60000.00, '2026-04-09', 'Water filtration units for 4 barangays'),
    ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000008', 180000.00, '2026-04-13', 'Lumber and roofing materials for rebuilds'),
    ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003', 72000.00, '2026-04-17', 'Rice, canned goods for next 5 days')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    cost = EXCLUDED.cost,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes;
```

- [ ] **Step 4: Replace the Purchase Categories block**

```sql
  -- ============================================================
  -- Purchase Categories
  -- ============================================================
  INSERT INTO purchase_categories (purchase_id, aid_category_id) VALUES
    ('f0000000-0000-0000-0000-000000000001', cat_water),
    ('f0000000-0000-0000-0000-000000000002', cat_hot_meals),
    ('f0000000-0000-0000-0000-000000000003', cat_shelter),
    ('f0000000-0000-0000-0000-000000000003', cat_construction),
    ('f0000000-0000-0000-0000-000000000004', cat_hygiene),
    ('f0000000-0000-0000-0000-000000000005', cat_medical),
    ('f0000000-0000-0000-0000-000000000006', cat_filtration),
    ('f0000000-0000-0000-0000-000000000006', cat_water),
    ('f0000000-0000-0000-0000-000000000007', cat_construction),
    ('f0000000-0000-0000-0000-000000000007', cat_shelter),
    ('f0000000-0000-0000-0000-000000000008', cat_hot_meals),
    ('f0000000-0000-0000-0000-000000000008', cat_canned)
  ON CONFLICT DO NOTHING;
```

- [ ] **Step 5: Verify counts and organization distribution**

Run:

```bash
python3 << 'EOF'
import re
content = open('supabase/seed-demo.sql').read()

# Donations
don_block = re.search(r'-- Donations \(14 total.*?ON CONFLICT \(id\) DO UPDATE', content, re.DOTALL).group()
don_rows = re.findall(r"'e0000000-0000-0000-0000-00000000000[0-9a-f]+'", don_block)
print(f'Donation rows: {len(don_rows)}')
assert len(don_rows) == 14

# Purchases
pur_block = re.search(r'-- Purchases \(8 total.*?ON CONFLICT \(id\) DO UPDATE', content, re.DOTALL).group()
pur_rows = re.findall(r"'f0000000-0000-0000-0000-00000000000[0-9a-f]+'", pur_block)
print(f'Purchase rows: {len(pur_rows)}')
assert len(pur_rows) == 8

# Donations should touch all 8 orgs (b...000000001 through ...000000008)
orgs_in_donations = set(re.findall(r"'b0000000-0000-0000-0000-00000000000([0-9])'", don_block))
print(f'Orgs with donations: {sorted(orgs_in_donations)}')
assert orgs_in_donations == {'1','2','3','4','5','6','7','8'}

# Purchases spread across at least 6 orgs
orgs_in_purchases = set(re.findall(r"'b0000000-0000-0000-0000-00000000000([0-9])'", pur_block))
print(f'Orgs with purchases: {sorted(orgs_in_purchases)}')
assert len(orgs_in_purchases) >= 6
print('OK')
EOF
```

Expected: 14 donations, 8 purchases, donations touch all 8 orgs, purchases touch ≥ 6 orgs.

- [ ] **Step 6: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): expand donations 8 → 14, purchases 4 → 8

Donations now touch all 8 orgs for balanced dashboard breakdown.
Recent-date spread (through 2026-04-17) shows ongoing activity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Remove the deployments block

**Files:**
- Modify: `supabase/seed-demo.sql` (remove Deployments section at end of file)

Zero deployments per spec (no UI renders them, no confirmed needs to link to).

- [ ] **Step 1: Remove the Deployments block**

In `supabase/seed-demo.sql`, find and delete this entire block (currently at the bottom of the file):

```sql
-- ============================================================
-- Deployments (for confirmed needs)
-- ============================================================
INSERT INTO deployments (id, event_id, hub_id, need_id, date, notes) VALUES
  ('20000000-0000-0000-0000-000000000001', ...),
  ('20000000-0000-0000-0000-000000000002', ...)
ON CONFLICT DO NOTHING;
```

After removal, the file should end with the closing `END $$;` of the `DO` block and the `-- Hazards` INSERT (which is outside the DO block).

- [ ] **Step 2: Verify deployments block is gone**

Run:

```bash
grep -c "INSERT INTO deployments" supabase/seed-demo.sql
```

Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add supabase/seed-demo.sql
git commit -m "feat(seed): remove deployments — no UI renders them

Deployments table exists in schema but no route renders it.
Zero confirmed needs → zero deployments is consistent with spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Run the seed against the demo Supabase project and verify

> **REQUIRES USER APPROVAL:** This task mutates the demo database. Per user preference, Supabase writes need explicit approval before running.

- [ ] **Step 1: Ask the user to confirm the reseed**

Prompt:

> "Ready to run the expanded seed against the demo Supabase project. This will:
> 1. Drop and recreate the 12 data tables (via `supabase/schema.sql`)
> 2. Re-apply RPC functions (`supabase/rpc-functions.sql`)
> 3. Apply the new seed (`supabase/seed-demo.sql`)
>
> All existing demo data will be wiped. Proceed? (yes/no)"

Wait for explicit "yes" before continuing.

- [ ] **Step 2: Run schema + rpc + seed via Supabase**

User's preferred flow (per `reference_supabase_cli.md` memory): use the Supabase SQL editor in the web dashboard, or `supabase db push` + SQL run. The key steps the user will execute (presented here for them to run):

1. Open the Supabase SQL editor for the demo project.
2. Run `supabase/schema.sql` (drops and recreates all tables — destructive).
3. Run `supabase/rpc-functions.sql`.
4. Run `supabase/seed-demo.sql`.

Each step should complete without errors. If any step errors, report the exact SQL error to debug.

- [ ] **Step 3: Verify row counts**

Run this verification query in the Supabase SQL editor (read-only, safe to share):

```sql
SELECT 'organizations' AS table_name, COUNT(*) FROM organizations UNION ALL
SELECT 'deployment_hubs', COUNT(*) FROM deployment_hubs UNION ALL
SELECT 'hub_inventory', COUNT(*) FROM hub_inventory UNION ALL
SELECT 'needs', COUNT(*) FROM needs UNION ALL
SELECT 'need_categories', COUNT(*) FROM need_categories UNION ALL
SELECT 'hazards', COUNT(*) FROM hazards UNION ALL
SELECT 'donations', COUNT(*) FROM donations UNION ALL
SELECT 'donation_categories', COUNT(*) FROM donation_categories UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases UNION ALL
SELECT 'purchase_categories', COUNT(*) FROM purchase_categories UNION ALL
SELECT 'deployments', COUNT(*) FROM deployments
ORDER BY table_name;
```

Expected counts:

| table_name | count |
|---|---|
| deployment_hubs | 8 |
| deployments | 0 |
| donation_categories | 8 |
| donations | 14 |
| hazards | 6 |
| hub_inventory | 23 |
| needs | 15 |
| need_categories | 30 |
| organizations | 8 |
| purchase_categories | 12 |
| purchases | 8 |

- [ ] **Step 4: Verify need-status distribution**

```sql
SELECT status, COUNT(*) FROM needs GROUP BY status ORDER BY status;
```

Expected:

| status | count |
|---|---|
| in_transit | 4 |
| pending | 8 |
| verified | 3 |

(No `confirmed` row at all.)

- [ ] **Step 5: Verify hazards mix**

```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'active') AS active,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved,
  COUNT(*) FILTER (WHERE photo_url IS NOT NULL) AS with_photos,
  COUNT(*) FILTER (WHERE contact_phone IS NOT NULL) AS with_phones
FROM hazards;
```

Expected: `active=4, resolved=2, with_photos=4, with_phones=4`.

- [ ] **Step 6: Visual verification in the app**

Run:

```bash
npm run dev
```

Navigate to `http://localhost:5173/demo/en` and confirm:

- Map shows 8 hub pins, 6 hazard pins (4 active + 2 resolved), 15 need pins spread across 3 statuses.
- No pins floating in the ocean west of the La Union coastline.
- Open a hub popup — notes are visible and read naturally.
- Open a hazard popup with a photo — image loads; check network tab, file size is ≤150KB.
- Open a hazard popup without a photo — renders cleanly without a broken image.
- Navigate to `/demo/en/dashboard` — donation totals visible, purchase activity distributed across multiple organizations.

Stop the dev server with Ctrl-C.

- [ ] **Step 7: Final commit (if any untracked changes remain)**

Run:

```bash
git status
```

If clean, no commit needed. If any incidental file changed (e.g., a log), handle manually or commit as appropriate.

---

## Success Criteria

All of the following must be true before marking this plan complete:

- [ ] `npm run compress-photos` runs idempotently (second run reports all files as "already compressed, skipping") and all `public/demo-hazards/*.jpg` files are ≤280KB.
- [ ] `supabase/seed-demo.sql` runs cleanly against a fresh schema + RPC load (no SQL errors).
- [ ] Row counts match Task 8 Step 3 expected values exactly.
- [ ] Status distribution matches Task 8 Step 4 (8 pending / 3 verified / 4 in_transit / 0 confirmed).
- [ ] Hazards mix matches Task 8 Step 5 (4 active / 2 resolved / 4 with photos / 4 with phones).
- [ ] `npm test` still passes (33/33 per clean baseline).
- [ ] Map view at `/demo/en` shows inland-only pins with expected volumes and variety.
- [ ] Dashboard at `/demo/en/dashboard` shows donations distributed across all 8 orgs.

## Notes for the Implementer

- The seed file is one PostgreSQL script wrapped in a single `DO $$ ... $$` block for aid-category variable resolution. The Hazards INSERT is OUTSIDE the DO block (it doesn't need category variables). Don't accidentally move it inside.
- The existing file uses fixed UUIDs like `b0000000-0000-0000-0000-000000000001`. Stay in that sequence (the last octet increments): orgs use `b...`, hubs use `c...`, needs use `d...`, donations use `e...`, purchases use `f...`, hazards use `10000000-...`, deployments use `20000000-...`.
- All timestamps are dates (not timestamps). Keep them in `YYYY-MM-DD` format.
- Philippine phone numbers use the compact format `09XXXXXXXXX` (11 digits). No dashes, no parentheses — match existing seed style.
- Longitudes must be ≥ 120.32 to stay inland. Latitudes ~16.32–16.86 for La Union.
- Don't introduce `completed` or `resolved` as need statuses — those aren't in the enum. The enum is only `pending`, `verified`, `in_transit`, `confirmed`.
