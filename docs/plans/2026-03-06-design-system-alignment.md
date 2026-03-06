# Design System Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Codify Rod's front-end spec as Tailwind design tokens and restyle all 7 dashboard components + Header to use them.

**Architecture:** Define CSS custom properties via Tailwind v4's `@theme` directive in `index.css`. Load Inter font locally via `@fontsource-variable/inter` for offline-first. Replace all ad-hoc Tailwind color classes with semantic token-based classes. No structural/layout changes — visual alignment only.

**Tech Stack:** Tailwind CSS v4, `@fontsource-variable/inter`, Vitest (regression testing)

---

### Task 1: Baseline — Run existing tests

Confirm all tests pass before any changes.

**Step 1: Run tests**

Run: `npm test`
Expected: All 8 test files pass (7 components + DashboardPage)

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no TypeScript errors

---

### Task 2: Install Inter font

**Files:**
- Modify: `package.json`

**Step 1: Install @fontsource-variable/inter**

Run: `npm install @fontsource-variable/inter`

**Step 2: Verify installation**

Run: `ls node_modules/@fontsource-variable/inter/index.css`
Expected: File exists

---

### Task 3: Define design tokens and global styles

**Files:**
- Modify: `src/index.css`

**Step 1: Replace `src/index.css` with token-based design system**

Replace the full contents of `src/index.css` with:

```css
@import "@fontsource-variable/inter";
@import "tailwindcss";

@theme inline {
  --color-primary: #1976D2;
  --color-secondary: #263238;
  --color-accent: #FFC107;
  --color-success: #388E3C;
  --color-warning: #FFA000;
  --color-error: #D32F2F;
  --color-neutral-50: #FFFFFF;
  --color-neutral-100: #F5F5F5;
  --color-neutral-400: #B0BEC5;
  --color-base: #1a252b;
}

body {
  background: var(--color-base);
  color: var(--color-neutral-50);
  font-family: "Inter Variable", Inter, Arial, sans-serif;
}
```

Key changes:
- Imports Inter Variable font (bundled locally for offline-first)
- Defines all 10 design tokens from Rod's spec (see Design Tokens table below)
- Removes `navy-900`/`navy-950` custom colors
- Removes `prefers-color-scheme: dark` media query (single dark theme)
- Sets body bg to `base`, text to `neutral-50`, font to Inter

**Step 2: Run build to check for errors**

Run: `npm run build`
Expected: Build succeeds. Note — components still reference `bg-navy-900`/`bg-navy-950` which are now undefined Tailwind classes. These will be inert (no styling) but won't cause build errors.

**Step 3: Commit foundation**

```bash
git add src/index.css package.json package-lock.json
git commit -m "feat: add design system tokens and Inter font

Define Tailwind v4 theme tokens matching Rod's front-end spec:
primary (#1976D2), secondary (#263238), accent (#FFC107),
success (#388E3C), warning (#FFA000), error (#D32F2F),
neutrals, and derived base (#1a252b) page background.

Load Inter Variable font via @fontsource for offline-first."
```

---

### Task 4: Restyle DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

**Step 1: Swap color classes**

Color mapping:
- `bg-navy-950` → `bg-base` (page background)
- `text-gray-400` → `text-neutral-400` (loading text)
- `text-red-400` → `text-error` (error text)
- `bg-blue-600` → `bg-primary` (retry button)
- `hover:bg-blue-500` → `hover:bg-primary/80` (retry button hover)

**Step 2: Run tests**

Run: `npm test -- tests/unit/pages/DashboardPage.test.tsx`
Expected: PASS

---

### Task 5: Restyle Header

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Swap color classes**

Color mapping:
- `border-gray-800` → `border-neutral-400/20`
- `bg-navy-950` → `bg-secondary`
- `text-gray-300` → `text-neutral-400` (language label)
- `bg-blue-600` → `bg-primary` (volunteer button)
- `hover:bg-blue-500` → `hover:bg-primary/80`

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/Header.test.tsx`
Expected: PASS

---

### Task 6: Restyle SummaryCards

**Files:**
- Modify: `src/components/SummaryCards.tsx`

**Step 1: Swap color classes**

Color mapping (applied to all 3 cards):
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-gray-400` → `text-neutral-400` (labels)
- `text-emerald-400` → `text-success` (donation amount)
- `text-white` → `text-neutral-50` (beneficiaries, volunteer counts)

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/SummaryCards.test.tsx`
Expected: PASS

---

### Task 7: Restyle DonationsByOrg

**Files:**
- Modify: `src/components/DonationsByOrg.tsx`

**Step 1: Swap card-level color classes**

Color mapping:
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-white` → `text-neutral-50` (heading)
- `text-gray-300` → `text-neutral-400` (org names)
- `text-gray-500` → `text-neutral-400/60` (percentages)
- `bg-gray-800` → `bg-base` (bar track)
- `text-emerald-400` → `text-success` (amounts)

**Step 2: Align bar colors to spec palette**

Replace the `BAR_COLORS` array with spec-aligned colors:

```tsx
const BAR_COLORS = [
  "bg-primary",     // #1976D2 Blue
  "bg-accent",      // #FFC107 Amber
  "bg-success",     // #388E3C Green
  "bg-error",       // #D32F2F Red
  "bg-warning",     // #FFA000 Orange
  "bg-primary/70",  // Blue variant
  "bg-accent/70",   // Amber variant
  "bg-success/70",  // Green variant
];
```

**Step 3: Run tests**

Run: `npm test -- tests/unit/components/DonationsByOrg.test.tsx`
Expected: PASS

---

### Task 8: Restyle DeploymentHubs

**Files:**
- Modify: `src/components/DeploymentHubs.tsx`

**Step 1: Swap color classes**

Color mapping:
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-white` → `text-neutral-50` (heading, hub name, count)
- `text-gray-400` → `text-neutral-400` (municipality)
- `text-gray-500` → `text-neutral-400/60` (deployments label)
- `divide-gray-700/50` → `divide-neutral-400/20`

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/DeploymentHubs.test.tsx`
Expected: PASS

---

### Task 9: Restyle GoodsByCategory

**Files:**
- Modify: `src/components/GoodsByCategory.tsx`

**Step 1: Swap color classes**

Color mapping:
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-white` → `text-neutral-50` (heading, totals)
- `bg-gray-800/50` → `bg-base/50` (inner category cards)
- `text-gray-400` → `text-neutral-400` (category names)

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/GoodsByCategory.test.tsx`
Expected: PASS

---

### Task 10: Restyle AidDistributionMap

**Files:**
- Modify: `src/components/AidDistributionMap.tsx`

**Step 1: Swap color classes**

Color mapping:
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-white` → `text-neutral-50` (heading)
- `bg-red-500/20` → `bg-error/20` (Live Map badge bg)
- `text-red-400` → `text-error` (Live Map text, pin icon, beneficiary counts)
- `bg-gray-800/30` → `bg-base/30` (map placeholder)
- `text-gray-500` → `text-neutral-400/60` (placeholder text)
- `text-gray-300` → `text-neutral-400` (barangay names)
- `divide-gray-700/50` → `divide-neutral-400/20`

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/AidDistributionMap.test.tsx`
Expected: PASS

---

### Task 11: Restyle StatusFooter

**Files:**
- Modify: `src/components/StatusFooter.tsx`

**Step 1: Swap color classes**

Color mapping:
- `border-gray-700/50` → `border-neutral-400/20`
- `bg-navy-900` → `bg-secondary`
- `text-gray-400` → `text-neutral-400`
- `bg-emerald-400` → `bg-success` (online indicator dot)

**Step 2: Run tests**

Run: `npm test -- tests/unit/components/StatusFooter.test.tsx`
Expected: PASS

---

### Task 12: Final verification and commit

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no TypeScript errors

**Step 3: Commit all component changes**

```bash
git add src/pages/DashboardPage.tsx src/components/Header.tsx src/components/SummaryCards.tsx src/components/DonationsByOrg.tsx src/components/DeploymentHubs.tsx src/components/GoodsByCategory.tsx src/components/AidDistributionMap.tsx src/components/StatusFooter.tsx
git commit -m "feat: restyle dashboard components to design system tokens

Replace all ad-hoc Tailwind color classes with semantic design
tokens from Rod's front-end spec. Dark theme with charcoal cards
(#263238) on derived dark page background (#1a252b).

Align DonationsByOrg bar colors to spec palette cycle."
```

**Step 4: Visual check**

Run: `npm run dev`
Open browser to `http://localhost:5173/en` and visually compare against the Figma mockup.

---

## Design Tokens Reference

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `primary` | `#1976D2` | `bg-primary`, `text-primary` | Navigation, buttons, links |
| `secondary` | `#263238` | `bg-secondary` | Card backgrounds |
| `accent` | `#FFC107` | `text-accent`, `bg-accent` | Highlights, status |
| `success` | `#388E3C` | `text-success`, `bg-success` | Positive values, online |
| `warning` | `#FFA000` | `text-warning` | Caution states |
| `error` | `#D32F2F` | `text-error`, `bg-error` | Errors, map markers |
| `neutral-50` | `#FFFFFF` | `text-neutral-50` | Primary text |
| `neutral-100` | `#F5F5F5` | `text-neutral-100` | Secondary text |
| `neutral-400` | `#B0BEC5` | `text-neutral-400`, `border-neutral-400` | Muted text, borders |
| `base` | `#1a252b` | `bg-base` | Page background |

## Out of Scope (Future PRs)

<!-- TODO: Track these as issues -->
- Header subtitle ("Disaster Relief Transparency / Real-time tracking...")
- Arrow/link icons on summary cards (visible in Figma)
- Interactive Leaflet map (Issue #7)
- Responsive breakpoint refinement per spec (320/601/1025/1441)
- Component library: Button variants (primary/secondary/disabled), Modal, Form fields
- WCAG 2.1 AA audit (focus indicators, tap targets, screen reader testing)
- Language switcher styling alignment
