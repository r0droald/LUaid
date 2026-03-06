# Dashboard Figma Alignment

Match the live dashboard styling to the original Figma design. All changes are CSS/layout/component-level — no schema changes.

## Changes

### 1. Hero Section
Add centered "Disaster Relief Transparency" title + subtitle between Header and SummaryCards in `DashboardPage.tsx`. Both strings use `t()` keys.

### 2. Layout: 3-Column Middle Row
Change the donations/hubs grid from `lg:grid-cols-2` to `lg:grid-cols-3` and move `GoodsByCategory` into the same row.

### 3. Summary Cards Subtitles
Add derived subtitle stats to each card:
- **Donations**: "N organizations" (from `donationsByOrg.length`)
- **Beneficiaries**: "N locations served" (from `barangays.length`)
- **Volunteers**: "across N deployments" (from sum of hub counts)

Add trend icon (↗ SVG) on first two cards.

### 4. Goods Icons Fix
Replace raw DB icon strings with emoji lookup map. Expand `FALLBACK_ICONS` to cover all known categories. Always use the map instead of `cat.icon`.

### 5. Live Map Badge Color
Change from `bg-error/20 text-error` → `bg-success/20 text-success`.

### 6. Header Globe Icon
Add inline SVG globe icon before the language selector dropdown.

### 7. i18n Keys
Add translation keys for hero title/subtitle and card subtitles in `en`, `fil`, `ilo` locale files.

## Files Touched
- `src/pages/DashboardPage.tsx`
- `src/components/SummaryCards.tsx`
- `src/components/GoodsByCategory.tsx`
- `src/components/AidDistributionMap.tsx`
- `src/components/Header.tsx`
- `public/locales/en/translation.json`
- `public/locales/fil/translation.json`
- `public/locales/ilo/translation.json`
