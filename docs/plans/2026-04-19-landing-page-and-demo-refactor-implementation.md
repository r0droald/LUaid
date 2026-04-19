# Landing Page + `/demo/:locale` Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the site URL space so `/` serves a project landing page and the existing app moves under `/demo/:locale/*`, with redirects from every old URL.

**Architecture:** Add a new landing page that does not wrap in `RootLayout` (no Supabase / IDB / outbox / tile-prewarm side effects). Restructure the router to put the existing app as nested children of `/demo/:locale`. Add redirect routes from every old `/:locale/...` path to its new `/demo/:locale/...` counterpart. Update the app `Header` logo to point at `/` and shift internal nav to `/demo/:locale`. Update `AuthCallbackPage` post-auth navigation and the PWA manifest `start_url` / `scope` so installed PWAs open into the app and the landing is still in-scope for the service worker.

**Tech Stack:** React 18 + TypeScript (strict), react-router v7, Tailwind v4 (`@tailwindcss/vite`) with semantic design tokens, vite-plugin-pwa (Workbox GenerateSW), Playwright for smoke tests.

**Spec:** [2026-04-19 landing-page-and-demo-refactor design doc](./2026-04-19-landing-page-and-demo-refactor.md)

---

## File Structure

**Files to create:**
- `public/landing/dashboard.png` — landing hero image (copy/resize of `docs/dashboard-screenshot.png`)
- `src/pages/LandingPage.tsx` — new landing page with hero, story, features, get-involved, footer
- `src/components/LandingHeader.tsx` — minimal landing-page header (logo + anchor links + View Demo CTA)

**Files to modify:**
- `src/router.tsx` — add landing route at `/`, nest app under `/demo/:locale`, add per-path redirects from old URLs
- `src/components/Header.tsx` — logo link target from `/${locale}` → `/`; all nav / report / locale-change from `/${locale}/...` → `/demo/${locale}/...`
- `src/pages/AuthCallbackPage.tsx` — post-auth `navigate('/')` → `navigate('/demo/en')`
- `vite.config.ts` — PWA manifest `start_url: "/"` → `"/demo/en"`, add explicit `scope: "/"`
- `tests/e2e/smoke.spec.ts` — update every route assertion for the new URL structure and add landing / redirect tests
- `docs/plans/2026-04-16-tenant-deploy-and-landing-architecture.md` — add a short note pointing readers to this plan + the design doc; clarify what is now executing vs. still deferred

**Files unchanged:**
- `src/lib/queries.ts`, `src/lib/supabase.ts`, `src/lib/cache.ts`, `src/lib/eager-cache.ts`, `src/lib/form-cache.ts`, `src/lib/outbox-context.tsx`, `src/lib/tile-prewarm.ts`, `src/components/RootLayout.tsx` — the entire data / offline / caching layer is intentionally untouched
- Supabase schema, RLS, RPC, seed data, dashboard config — no backend changes

---

### Task 1: Copy and resize the hero screenshot into `public/`

**Files:**
- Create: `public/landing/dashboard.png`

- [ ] **Step 1: Verify the source screenshot exists**

Run:
```bash
ls -la docs/dashboard-screenshot.png
```

Expected: a file on disk (~2 MB is OK for now, we'll shrink it in the next step).

- [ ] **Step 2: Create the `public/landing/` directory and copy a resized PNG**

Run (macOS — uses the built-in `sips` tool, no extra install):
```bash
mkdir -p public/landing
sips -Z 1600 docs/dashboard-screenshot.png --out public/landing/dashboard.png
```

Expected: `public/landing/dashboard.png` exists, max dimension 1600px. Verify with `ls -la public/landing/dashboard.png` — should be noticeably smaller than the 2 MB source (likely 400 KB – 1 MB).

- [ ] **Step 3: Commit**

Run:
```bash
git add public/landing/dashboard.png
git commit -m "chore(landing): add resized hero screenshot"
```

Note: this asset intentionally lives under `public/landing/` (served verbatim at `/landing/dashboard.png`) rather than being imported through Vite. It's a one-off hero image — plain URL reference keeps things simple.

---

### Task 2: Update Playwright smoke tests for the new URL structure (TDD: failing tests first)

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`

This task writes the external-oracle smoke tests that the remaining tasks need to satisfy. Tests fail until Task 3 (router + stub landing) lands.

- [ ] **Step 1: Replace every app-page `page.goto` and URL assertion to point at `/demo/:locale`**

Open `tests/e2e/smoke.spec.ts` and change:

Relief map block (line ~7):
```ts
for (const locale of LOCALES) {
  test(`relief map page renders in ${locale}`, async ({ page }) => {
    await page.goto(`/demo/${locale}`);
    // ...everything inside unchanged
  });
}
```

Dashboard block (line ~32):
```ts
await page.goto(`/demo/${locale}/dashboard`);
```

Report block (line ~52):
```ts
await page.goto(`/demo/${locale}/report`);
```

Hazard form (line ~67):
```ts
await page.goto("/demo/en/report");
```

Locale switcher (line ~89):
```ts
await page.goto("/demo/en");
// ...
await expect(page).toHaveURL(/\/demo\/fil$/);
```

Nav links (line ~98):
```ts
await page.goto("/demo/en");
// ...
await expect(page).toHaveURL(/\/demo\/en\/dashboard$/);
```

Mobile hamburger (line ~107):
```ts
await page.goto("/demo/en");
// ...
await expect(page).toHaveURL(/\/demo\/en\/dashboard$/);
```

- [ ] **Step 2: Rewrite the "root redirects to /en" test to assert landing renders**

Replace (around line 74):

```ts
test("root renders the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /view live demo/i })).toBeVisible();
});
```

- [ ] **Step 3: Rewrite the invalid-locale test for the new structure**

Replace (around line 79):

```ts
test("old /:locale path redirects to /demo/:locale", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/\/demo\/en$/);
});

test("old /:locale/dashboard redirects to /demo/:locale/dashboard", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/demo\/en\/dashboard$/);
});

test("old /:locale/report redirects to /demo/:locale/report", async ({ page }) => {
  await page.goto("/en/report");
  await expect(page).toHaveURL(/\/demo\/en\/report$/);
});
```

Delete the pre-existing `invalid locale redirects to /en` test — the behavior it tested (`/xyz` → `/en`) no longer makes sense in the new structure; `/xyz` would now land on the landing page or 404 depending on routing, and we're not defining a canonical behavior here.

- [ ] **Step 4: Rewrite the legacy transparency-redirect test**

Replace (around line 84):

```ts
test("legacy /:locale/transparency redirects to /demo/:locale/dashboard", async ({ page }) => {
  await page.goto("/en/transparency");
  await expect(page).toHaveURL(/\/demo\/en\/dashboard$/);
});
```

- [ ] **Step 5: Run tests to verify they fail in the right way**

Run:
```bash
npm run verify
```

Expected: the landing test and redirect tests fail (no landing page, no new routes yet). The app-page tests (relief map, dashboard, report) may pass or fail depending on how Playwright handles the missing redirect — this is acceptable; Task 3 will make them pass.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test(landing): rewrite smoke tests for /demo prefix + landing route"
```

---

### Task 3: Refactor the router and add a stub landing page

**Files:**
- Create: `src/pages/LandingPage.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: Create a stub `LandingPage.tsx` just rich enough to pass the landing smoke test**

Create `src/pages/LandingPage.tsx`:

```tsx
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-base px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-logo text-4xl font-bold text-neutral-50">Kapwa Help</h1>
        <p className="mt-4 text-lg text-neutral-100/90">
          Citizen-led disaster relief for La Union, Philippines.
        </p>
        <Link
          to="/demo/en"
          className="mt-8 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/80 transition-all"
        >
          View Live Demo →
        </Link>
      </div>
    </div>
  );
}
```

This is intentionally minimal. Task 8 replaces it with the full content.

- [ ] **Step 2: Update `src/router.tsx` with the new structure**

Replace the entire contents of `src/router.tsx` with:

```tsx
import { createBrowserRouter, Navigate, useParams, useLocation } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ReliefMapPage } from "./pages/ReliefMapPage";
import { TransparencyPage } from "./pages/TransparencyPage";
import { ReportPage } from "./pages/ReportPage";
import { LoginPage } from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import LandingPage from "./pages/LandingPage";

function LegacyLocaleRedirect() {
  const { locale } = useParams<{ locale: string }>();
  const { pathname, search, hash } = useLocation();
  const suffix = pathname.replace(/^\/[^/]+/, "");
  return <Navigate to={`/demo/${locale ?? "en"}${suffix}${search}${hash}`} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/demo/:locale",
    element: <RootLayout />,
    children: [
      { index: true, element: <ReliefMapPage /> },
      { path: "dashboard", element: <TransparencyPage /> },
      { path: "transparency", element: <Navigate to="../dashboard" replace /> },
      { path: "report", element: <ReportPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    path: "/:locale",
    children: [
      { index: true, element: <LegacyLocaleRedirect /> },
      { path: "dashboard", element: <LegacyLocaleRedirect /> },
      { path: "transparency", element: <LegacyLocaleRedirect /> },
      { path: "report", element: <LegacyLocaleRedirect /> },
      { path: "login", element: <LegacyLocaleRedirect /> },
    ],
  },
]);
```

Why this shape:
- `LegacyLocaleRedirect` is one redirect component reused across the five legacy paths. It preserves query string + hash, and it strips only the leading `/locale` segment so the tail (e.g. `/dashboard`) is preserved.
- The legacy `/:locale/transparency` redirects to `/demo/:locale/transparency`, which in turn hits the nested `transparency` route inside `/demo/:locale` and redirects again to `/demo/:locale/dashboard`. Two hops, but no duplicated rule.
- Note the `AuthCallbackPage` import changes to a default import (matches how `LandingPage` is exported). If the current code uses a named import, update accordingly — the file already has a default export (see `src/pages/AuthCallbackPage.tsx:5`).

- [ ] **Step 3: Run tests to verify they now pass**

Run:
```bash
npm run verify
```

Expected: all tests in `smoke.spec.ts` pass. The landing test passes because `LandingPage` renders an `<h1>` and a `View Live Demo` link. The app-page tests pass because `/demo/:locale` routes now exist. The legacy-redirect tests pass because `LegacyLocaleRedirect` fires.

- [ ] **Step 4: Commit**

```bash
git add src/router.tsx src/pages/LandingPage.tsx
git commit -m "feat(landing): split landing and /demo/:locale routes with redirects"
```

---

### Task 4: Update the demo `Header` — logo to `/`, internal links to `/demo/:locale`

**Files:**
- Modify: `src/components/Header.tsx`

Current behavior: logo goes to `/${locale}`, nav items + report CTA + locale picker all use `/${locale}/...`. After Task 3, the legacy redirect handles these gracefully, but every click bounces through a redirect — bad UX. This task makes links canonical.

- [ ] **Step 1: Update the logo link target**

In `src/components/Header.tsx`, find the logo `<Link>` (around line 66):

```tsx
<Link to={`/${locale}`} className="flex items-center gap-2 font-logo text-xl font-bold text-white hover:text-neutral-100">
```

Replace with:

```tsx
<Link to="/" className="flex items-center gap-2 font-logo text-xl font-bold text-white hover:text-neutral-100">
```

- [ ] **Step 2: Update the locale-change handler**

Find `handleLocaleChange` (around line 52):

```tsx
const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const subPath = locale ? location.pathname.replace(`/${locale}`, "") : "";
  navigate(`/${e.target.value}${subPath}`);
};
```

Replace with:

```tsx
const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const subPath = locale ? location.pathname.replace(`/demo/${locale}`, "") : "";
  navigate(`/demo/${e.target.value}${subPath}`);
};
```

- [ ] **Step 3: Update the nav items**

Find `navItems` (around line 57):

```tsx
const navItems = [
  { to: `/${locale}`, label: t("Navigation.reliefMap"), end: true },
  { to: `/${locale}/dashboard`, label: t("Navigation.dashboard") },
];
```

Replace with:

```tsx
const navItems = [
  { to: `/demo/${locale}`, label: t("Navigation.reliefMap"), end: true },
  { to: `/demo/${locale}/dashboard`, label: t("Navigation.dashboard") },
];
```

- [ ] **Step 4: Update the report CTA link**

Find the report `<Link>` (around line 108):

```tsx
<Link
  to={`/${locale}/report`}
  ...
```

Replace with:

```tsx
<Link
  to={`/demo/${locale}/report`}
  ...
```

- [ ] **Step 5: Run tests**

Run:
```bash
npm run verify
```

Expected: all tests still pass, and URL assertions now match canonically (no redirect bounces during nav-click flows).

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.tsx
git commit -m "refactor(header): point logo to / and internal nav to /demo/:locale"
```

---

### Task 5: Update `AuthCallbackPage` post-auth navigation

**Files:**
- Modify: `src/pages/AuthCallbackPage.tsx:11,18`

- [ ] **Step 1: Update both post-auth `navigate` calls**

In `src/pages/AuthCallbackPage.tsx`, change:

```tsx
navigate('/', { replace: true });
```

to:

```tsx
navigate('/demo/en', { replace: true });
```

There are two occurrences (one in the initial `getSession()` resolution, one inside `onAuthStateChange`). Update both.

- [ ] **Step 2: Run tests**

Run:
```bash
npm run verify
```

Expected: all tests still pass. Auth callback is not smoke-tested end-to-end, so no test change is needed.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AuthCallbackPage.tsx
git commit -m "fix(auth): navigate to /demo/en after auth callback"
```

---

### Task 6: Update PWA manifest — `start_url` + explicit `scope`

**Files:**
- Modify: `vite.config.ts:22`

- [ ] **Step 1: Set `start_url` to the demo and add an explicit `scope`**

In `vite.config.ts`, find the `manifest` object (around line 17) and change:

```ts
start_url: "/",
```

to:

```ts
start_url: "/demo/en",
scope: "/",
```

**Why `scope: "/"` is required:** per the Web App Manifest spec, if `scope` is omitted it defaults to the directory of `start_url`. With `start_url: "/demo/en"`, the implicit scope would be `/demo/` — meaning `/` (the landing) would fall *outside* the PWA scope, so the service worker would neither precache it nor serve it offline. Explicitly setting `scope: "/"` keeps both the landing and the demo in-scope.

- [ ] **Step 2: Verify the build still succeeds**

Run:
```bash
npm run build
```

Expected: build succeeds. The generated `dist/manifest.webmanifest` should now contain `"start_url": "/demo/en"` and `"scope": "/"`. Verify by reading the generated file:

```bash
cat dist/manifest.webmanifest
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat(pwa): start installed PWA at /demo/en, keep scope at /"
```

---

### Task 7: Create the `LandingHeader` component

**Files:**
- Create: `src/components/LandingHeader.tsx`

- [ ] **Step 1: Write `LandingHeader.tsx`**

Create `src/components/LandingHeader.tsx`:

```tsx
import { Link } from "react-router";

export default function LandingHeader() {
  return (
    <header className="border-b border-neutral-400/10 bg-secondary/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-logo text-xl font-bold text-white hover:text-neutral-100"
        >
          <img
            src="/icons/kapwahelp_v1.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8"
          />
          Kapwa Help
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <a href="#story" className="hidden text-neutral-100 hover:text-neutral-50 sm:inline">
            The Story
          </a>
          <a href="#get-involved" className="hidden text-neutral-100 hover:text-neutral-50 sm:inline">
            Get Involved
          </a>
          <Link
            to="/demo/en"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-[0_0_12px_rgba(14,154,167,0.3)] hover:bg-primary/80 transition-all"
          >
            View Demo →
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

Design choices:
- Anchor links (`#story`, `#get-involved`) are hidden on small screens to avoid clutter; the CTA button is always visible.
- Uses only semantic tokens from the design system (`bg-secondary`, `bg-primary`, `text-neutral-*`) — no arbitrary colors.
- Reuses the existing logo SVG at `/icons/kapwahelp_v1.svg`.
- No locale picker — landing is English-only per the design doc.

- [ ] **Step 2: Commit**

```bash
git add src/components/LandingHeader.tsx
git commit -m "feat(landing): add minimal LandingHeader component"
```

No test yet — Task 9 adds the smoke-test assertions that cover this.

---

### Task 8: Fill out `LandingPage.tsx` with the full content

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Ask the user for the "Get in touch" email address**

Before wiring the mailto link, ask the user:

> "What email address should the landing page's 'Get in touch' button link to? (The design doc left this to be confirmed during implementation.)"

Use whatever they provide as `<CONTACT_EMAIL>` in Step 2. If they don't have one ready, use `contact@kapwahelp.org` as a placeholder and flag it in the commit message so they replace before shipping.

- [ ] **Step 2: Replace the stub `LandingPage.tsx` with the full content**

Replace the entire contents of `src/pages/LandingPage.tsx` with:

```tsx
import { Link } from "react-router";
import LandingHeader from "../components/LandingHeader";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-base text-neutral-100">
      <LandingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <h1 className="font-logo text-4xl font-bold leading-tight text-neutral-50 md:text-5xl">
              Citizen-led disaster relief for La Union.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-100/90 md:text-xl">
              An open-source, offline-first coordination tool — born on the ground during Typhoon Emong, built by the people who were there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/demo/en"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(14,154,167,0.3)] hover:bg-primary/80 transition-all"
              >
                View Live Demo →
              </Link>
              <a
                href="#get-involved"
                className="rounded-lg border border-neutral-400/30 px-5 py-2.5 text-sm font-medium text-neutral-100 hover:bg-neutral-400/10 transition-all"
              >
                Get Involved
              </a>
            </div>
          </div>
          <Link to="/demo/en" className="block">
            <img
              src="/landing/dashboard.png"
              alt="Kapwa Help dashboard showing relief coordination map and donation tracking"
              className="w-full rounded-2xl border border-neutral-400/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              loading="eager"
            />
          </Link>
        </div>
      </section>

      {/* The Story */}
      <section id="story" className="border-t border-neutral-400/10 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">The Story</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Born during Typhoon Emong.</h2>
          <div className="mt-6 space-y-5 leading-relaxed text-neutral-100/90">
            <p>
              When Typhoon Emong hit La Union in 2025, volunteers self-organized across municipalities to distribute meals, relief goods, drinking water, and medical supplies. Coordination happened over group chats. Tracking happened in spreadsheets — when it happened at all.
            </p>
            <p>
              Kapwa Help was born out of that experience: a transparency and coordination tool built by the people who were on the ground, designed so the next disaster response starts where this one left off.
            </p>
            <p>
              We publish this software openly in the hope that it's useful for disaster relief operations in your community too.
            </p>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="border-t border-neutral-400/10">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">What it does</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Five things.</h2>
          <ul className="mt-8 space-y-7">
            <li>
              <h3 className="font-semibold text-neutral-50">Transparency dashboard</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                Live tracking of donations, beneficiaries, volunteer counts, and deployment activity across organizations.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Interactive deployment map</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                GPS-tagged aid deliveries visualized on a Leaflet / OpenStreetMap layer.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Offline-capable PWA</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                The full app shell is cached on-device via service worker — works without internet.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Multilingual</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                English, Filipino, and Ilocano with a one-click language switcher.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-neutral-50">Zero-budget infrastructure</h3>
              <p className="mt-1 leading-relaxed text-neutral-100/85">
                Supabase free tier for the database, Vercel for hosting, no paid services.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Get Involved */}
      <section id="get-involved" className="border-t border-neutral-400/10 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">Get Involved</p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-50">Every skill set has a place here.</h2>
          <p className="mt-6 leading-relaxed text-neutral-100/90">
            Kapwa Help is a volunteer-driven project and we welcome help from anyone — developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute.
          </p>
          <div className="mt-8">
            <a
              href="mailto:<CONTACT_EMAIL>"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/80 transition-all"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-400/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-neutral-400">
          MIT License · Built for La Union, shared with everyone
        </div>
      </footer>
    </div>
  );
}
```

Replace the `<CONTACT_EMAIL>` literal on the `mailto:` href with whatever address the user provided in Step 1 (e.g., `mailto:hello@kapwahelp.org`).

Notes:
- No `RootLayout` import. This page is side-effect-free: no Supabase, no IDB, no outbox, no tile prewarm, no i18n.
- Only uses semantic Tailwind tokens (`bg-base`, `bg-secondary/30`, `text-neutral-*`, `bg-primary`) — never arbitrary colors.
- Hero image uses `loading="eager"` because it is above the fold.

- [ ] **Step 3: Manually sanity-check in dev**

Run:
```bash
npm run dev
```

Navigate to `http://localhost:5173/`. Verify:
- The hero renders with the headline, subtitle, two CTAs, and the dashboard screenshot
- "View Live Demo →" navigates to `/demo/en`
- Clicking the screenshot navigates to `/demo/en`
- Anchor links scroll to their sections
- Clicking the "Kapwa Help" logo from inside the demo (`/demo/en`) brings you back to `/`

- [ ] **Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): add full landing page content"
```

---

### Task 9: Strengthen the landing-page smoke test

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Beef up the `root renders the landing page` test with real assertions**

Find the test added in Task 2 Step 2 and replace with:

```ts
test("root renders the landing page", async ({ page }) => {
  await page.goto("/");

  // H1 text
  await expect(page.getByRole("heading", { level: 1, name: /citizen-led disaster relief/i })).toBeVisible();

  // Primary CTA
  const primaryCta = page.getByRole("link", { name: /view live demo/i }).first();
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute("href", "/demo/en");

  // Header CTA
  const headerCta = page.getByRole("link", { name: /view demo/i });
  await expect(headerCta).toBeVisible();

  // Hero screenshot
  await expect(page.getByRole("img", { name: /kapwa help dashboard/i })).toBeVisible();

  // Footer
  await expect(page.getByText(/mit license/i)).toBeVisible();

  // Screenshot for visual verification
  await page.screenshot({
    path: "tests/e2e/screenshots/landing.png",
    fullPage: true,
  });
});
```

- [ ] **Step 2: Run tests**

Run:
```bash
npm run verify
```

Expected: all tests pass, including the strengthened landing test.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test(landing): assert landing page hero, CTAs, image, footer"
```

---

### Task 10: Add a supersession note to the 2026-04-16 design doc

**Files:**
- Modify: `docs/plans/2026-04-16-tenant-deploy-and-landing-architecture.md:3-5`

- [ ] **Step 1: Add a pointer at the top of the deferred doc**

In `docs/plans/2026-04-16-tenant-deploy-and-landing-architecture.md`, replace the existing frontmatter lines (2–5):

```markdown
**Date:** 2026-04-16
**Status:** Deferred — decisions captured for future consideration
**Why deferred:** Higher priority is polishing the current demo, shipping it to La Union contacts for signoff, and gathering real feedback before committing to landing-page / template work.
```

with:

```markdown
**Date:** 2026-04-16
**Status:** Partially superseded — sections 1 and 2 (landing page + `/demo/:locale` refactor) are now being executed per [2026-04-19 landing-page-and-demo-refactor design](./2026-04-19-landing-page-and-demo-refactor.md) and [its implementation plan](./2026-04-19-landing-page-and-demo-refactor-implementation.md). Everything else in this doc (demo-mode flag, open-source, template extraction, tenant subdomains, auth) remains deferred.
**Original reason for deferring:** Higher priority was polishing the current demo, shipping it to La Union contacts for signoff, and gathering real feedback before committing to landing-page / template work.
```

- [ ] **Step 2: Commit**

```bash
git add docs/plans/2026-04-16-tenant-deploy-and-landing-architecture.md
git commit -m "docs: mark tenant-deploy doc partially superseded by 2026-04-19 refactor"
```

---

### Task 11: Manual verification before merging

This task is a checklist, not a code change. It satisfies the CLAUDE.md "Verify your own test plan before finishing a branch" rule.

- [ ] **Step 1: Run the full smoke suite one more time**

Run:
```bash
npm run verify
```

Expected: all tests pass.

- [ ] **Step 2: Build and preview the production bundle**

Run:
```bash
npm run build
npm run preview
```

Open the preview URL (usually `http://localhost:4173/`). Verify:
- `/` renders the landing page (not a redirect)
- `/demo/en` renders the relief map
- `/en` 302/301s to `/demo/en`
- `/en/dashboard` redirects to `/demo/en/dashboard`
- `/en/transparency` redirects to `/demo/en/dashboard` (two hops: first to `/demo/en/transparency`, then to `/demo/en/dashboard`)
- Logo click from inside the demo returns you to `/`

- [ ] **Step 3: Verify the generated PWA manifest**

Run:
```bash
cat dist/manifest.webmanifest
```

Expected: `"start_url": "/demo/en"` and `"scope": "/"` both present.

- [ ] **Step 4: Install the PWA and confirm cold-launch behavior**

With `npm run preview` still running, in Chrome / Edge:
1. Open `http://localhost:4173/`
2. Install the PWA (address-bar install icon)
3. Close the browser
4. Launch the installed PWA from the OS

Expected: the installed PWA opens directly to `/demo/en` (not the landing).

- [ ] **Step 5: Offline spot-check**

With the PWA still open at `/demo/en`:
1. Navigate to the dashboard
2. Open DevTools → Application → Service Workers → check "Offline"
3. Refresh the page

Expected: the demo continues to render from cached IDB + SW; outbox badge still works; map tiles render from the Workbox cache. Landing page at `/` also works offline (as long as it was visited at least once while online).

- [ ] **Step 6: Confirm `.env.local` is present in the worktree**

If this plan is being executed in a git worktree (per the `superpowers:using-git-worktrees` pattern), verify `.env.local` was copied across:

Run:
```bash
ls -la .env.local
```

Expected: the file exists. If it doesn't, copy it from the main working tree — per the project memory note ([worktree env local memory](file)), missing env vars cause the demo to silently fail and all-zero Lighthouse metrics.

- [ ] **Step 7: Final commit if anything changed during verification**

If Step 4 (PWA manifest) or any manual check surfaced an issue, fix it and commit. Otherwise the branch is ready for PR.

---

## Out of Scope (per the design doc)

- No `VITE_DEMO_MODE` flag, no static JSON fixtures, no data-provider extraction
- No read-only / submit-theater mode in the demo — forms stay fully functional against Supabase
- No changes to `src/lib/queries.ts`, `src/lib/supabase.ts`, or any cache / outbox file
- No Supabase schema, RLS, RPC, seed, or dashboard config changes
- No open-source release activities (public repo, CONTRIBUTING, etc.)
- No template extraction of hard-coded La Union values
- No tenant subdomain setup
- No landing-page translations (English-only at launch)
- No README cleanup (the stale `r0droald/LUaid` references are a separate follow-up)
- No hero-image optimization beyond the `sips -Z 1600` resize in Task 1 — further compression can be a polish follow-up if Lighthouse flags it
