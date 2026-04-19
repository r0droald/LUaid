# Landing Page + `/demo/:locale` Refactor

**Date:** 2026-04-19
**Status:** Design approved — ready to write an implementation plan
**Supersedes (narrowly):** Sections 1 and 2 of [2026-04-16 tenant deploy & landing architecture](./2026-04-16-tenant-deploy-and-landing-architecture.md). Everything else in that doc (demo-mode flag, open-source, template extraction, tenant subdomains, auth) stays deferred.

## Context

`kapwahelp.org` currently serves the app directly at `/:locale`. The project now needs a canonical "project home" so people arriving from GitHub, shared links, or the Hannah / La Union circle land on a consistent story — not straight into the app with no framing.

Scope is deliberately narrow. We are **not** building demo-mode data isolation, we are **not** open-sourcing the repo yet, we are **not** extracting a tenant template. We are only splitting the URL space so there's a landing at `/` and moving the app under `/demo/:locale`.

## Scope

### In
- A landing page at `/`
- Refactor the existing app from `/:locale/...` to `/demo/:locale/...`
- Redirects from every old `/:locale/...` path to its `/demo/:locale/...` counterpart (per the CLAUDE.md rule: never rename a public URL without a redirect in the same commit)
- PWA `start_url` points at `/demo/en` so installed-PWA users open the app, not the landing
- Header logo inside the demo navigates back to `/` (landing becomes the project home)
- Landing page is English-only at launch

### Out (deferred)
- `VITE_DEMO_MODE` flag, static JSON fixtures, data-provider extraction
- Open-sourcing the repo (public GitHub, CONTRIBUTING, etc.)
- Template extraction of hard-coded La Union values
- Tenant subdomains (`launion.kapwahelp.org`, etc.)
- Auth
- Filipino / Ilocano translations of the landing page (may come later)
- Any hardening of the demo against vandalism — we are accepting the current risk because the site is not widely shared yet and the audience is small

## Decisions

### D1 — Keep the current data architecture
The existing Supabase demo project stays as the data source. No demo-mode flag, no fixtures, no data-provider abstraction. The existing offline layer (`src/lib/cache.ts`, `src/lib/eager-cache.ts`, `src/lib/form-cache.ts`, `src/lib/outbox-context.tsx`) continues to work unchanged. Vandalism risk on the shared demo DB is accepted for now.

**Why:** The "carve out a data provider and swap in fixtures" work is real (~1 module extraction + 2 implementations). Doing it before there's a second audience who needs it is speculative. When the landing goes widely public or when a real tenant deploys, we revisit.

### D2 — URL structure
- `/` → Landing page
- `/demo/:locale` → current `ReliefMapPage` (what `/:locale` was)
- `/demo/:locale/dashboard` → `TransparencyPage`
- `/demo/:locale/report` → `ReportPage`
- `/demo/:locale/login` → `LoginPage`
- `/auth/callback` → unchanged

### D3 — Redirects (mandatory, in the same commit as the rename)
- `/:locale` → `/demo/:locale`
- `/:locale/dashboard` → `/demo/:locale/dashboard`
- `/:locale/report` → `/demo/:locale/report`
- `/:locale/login` → `/demo/:locale/login`
- `/:locale/transparency` → `/demo/:locale/dashboard` (chains through the existing `transparency → dashboard` alias)

The existing `/` → `/en` redirect is **removed**; `/` now renders the landing page.

### D4 — Landing page structure (hybrid: story-forward editorial with demo-forward hero)
Split hero above the fold:
- **Left:** H1 headline, subtitle paragraph, two CTAs (primary "View Live Demo" → `/demo/en`, secondary "Get Involved" → anchor or mailto)
- **Right:** Dashboard screenshot, also clickable to `/demo/en`

Below the fold, in order:
1. **The Story** — Typhoon Emong origin paragraph and the "we publish openly" paragraph from `README.md`
2. **What it does** — Five features from the README, rendered as an editorial list (icon + title + short paragraph), not a grid
3. **Get Involved** — Adapted from the README "Get Involved" section. Primary action is a contact email; the "see Issues tab" bit is dropped until the repo is public
4. **Footer** — MIT license line and a short tagline

No "working prototype / open-sourcing soon" badge or banner. No GitHub link (until the repo is public). English only.

All demo CTAs on the landing page target `/demo/en` literally (not the visitor's browser locale). The landing is English-only at launch, so English-speaking visitors entering the demo in English is the expected path. Locale negotiation from the landing (e.g. respecting `Accept-Language`) is a future enhancement, not part of this spec.

### D5 — Landing page header
The landing page has its **own** minimal header, separate from the app's `Header.tsx`. Contents:
- Kapwa Help logo (links to `/`)
- In-page anchor links: "The Story", "Get Involved"
- Primary CTA: "View Demo" → `/demo/en`

No locale picker on the landing page (English only). No dashboard / report nav.

### D6 — Demo header behavior
The existing `Header.tsx` is reused inside the demo. One change: the logo `<Link>` target changes from `/${locale}` to `/`. Everything else (locale picker, nav tabs, outbox badge, admin invite) stays as-is.

**Why:** Anchoring the logo to the project home reinforces "the demo is a piece of the project site." One click always returns you to the canonical home.

### D7 — PWA manifest
In `vite.config.ts`, the PWA manifest `start_url` changes to `/demo/en` so installed-PWA users open directly into the app on cold launch. The PWA scope stays `/` so both the landing and the demo are cached / installable.

### D8 — Caching / IndexedDB / service-worker behavior across landing vs. demo

The landing page is **pure static content** — no Supabase, no map, no forms, no locale picker. To avoid dragging the app's data-layer side effects onto a page that doesn't need them, the landing uses its own minimal layout tree. Concretely:

- The landing page does **not** wrap in `RootLayout` and does **not** import the Supabase client, `useEagerCache`, `OutboxProvider`, `prewarmTileCache`, or any function from `src/lib/queries.ts`
- No IndexedDB reads or writes happen while a visitor is on `/`. All IDB state (`cache.ts` dashboard cache, `eager-cache.ts` reference data, `form-cache.ts` outbox, `form-cache.ts` form dropdown cache) stays exclusively a concern of the demo pages
- The SW scope stays `/`, so the SW precaches both the landing shell and the demo shell; offline visitors who previously loaded either page will see that page offline
- The Workbox `map-tiles` CacheFirst cache only gets populated while someone is on a demo map page — unchanged from today
- The `UpdatePrompt` SW-update flow is unchanged; it's mounted inside the demo layout, not the landing

**Why this matters:** a cold visitor who just wants to read the project story shouldn't trigger Supabase auth checks, IDB opens, or tile prefetches. Keeping the landing side-effect-free is also what makes it easy (later) to either strip Supabase credentials from a landing-only build, or to split the landing into its own bundle, without rearchitecting.

### D9 — Supabase: no changes required

No schema, RLS, RPC function, seed, or Supabase-dashboard config (Site URL, Redirect URLs, auth providers) changes are needed. The client continues to point at the same demo project with the same anon key. The `/auth/callback` route path is unchanged, so Supabase redirect-URL settings are not affected.

**One surface to check during implementation:** after `AuthCallbackPage` sets up the session, it navigates the user into the app. That post-auth destination currently targets `/:locale`-shaped URLs and needs to shift to `/demo/:locale`. This is a client-side change in `AuthCallbackPage.tsx`, not a Supabase config change.

## Affected surfaces (non-exhaustive)

- `src/router.tsx` — add `/` landing route; nest existing children under `/demo/:locale`; add per-path redirects for the five old URLs; remove the old `/` → `/en` redirect
- `src/pages/LandingPage.tsx` — **new** page containing hero, story, features, get-involved, footer
- `src/components/LandingHeader.tsx` — **new** minimal header for the landing page
- `src/components/Header.tsx` — change logo link target from `/${locale}` to `/`
- `src/pages/AuthCallbackPage.tsx` — shift post-auth navigation target from `/:locale` to `/demo/:locale` (no Supabase-side change)
- `vite.config.ts` — update `manifest.start_url` to `/demo/en`
- `tests/e2e/` smoke tests — update routes from `/:locale` to `/demo/:locale`; add a smoke test for `/` (landing) and for at least one redirect
- `docs/plans/2026-04-16-tenant-deploy-and-landing-architecture.md` — add a note pointing readers to this narrower spec and clarify which pieces are now being executed vs. still deferred
- `README.md` — this is not load-bearing for the refactor, but the existing `r0droald/LUaid` URL and stale `LUaid` name should be cleaned up at some point; flagged as a small separate follow-up, not scope of this plan

## Content: what lives on the landing page

All copy is pulled from `README.md` and lightly adapted. No new writing required for v1.

| Section | Source |
|---|---|
| H1 headline | "Citizen-led disaster relief for La Union." (freshly written, ~6 words) |
| Subtitle | Paraphrase of README paragraphs 1–2, compressed to one sentence |
| "The Story" | README paragraphs 1–3 (Typhoon Emong → "we publish openly") |
| "What it does" | README "What It Does" list, same 5 items |
| "Get Involved" | README "Get Involved" paragraph, adapted to drop GitHub / Issues references; include a contact email (exact address confirmed during implementation — the README doesn't currently list a project-level contact, so this is a small content decision, not an architecture one) |
| Footer | "MIT License · Built for La Union, shared with everyone." |

The dashboard screenshot asset (`docs/dashboard-screenshot.png`) is already in the repo. We may want to re-shoot it for the landing page since the app UI has evolved, but the current one is acceptable for v1. Flag as a polish item.

## Testing / verification

Per CLAUDE.md's "Verify your own test plan" rule, we run these before marking the branch done:

1. **Playwright smoke** (`npm run verify`): updated to hit `/demo/:locale` across all three locales; existing assertions still pass
2. **New smoke: landing page at `/`** — asserts H1, hero CTAs, screenshot, and one link to `/demo/en`
3. **Redirect smoke** — at minimum `/` no longer redirects, and `/en` redirects to `/demo/en`; one representative subpath (`/en/dashboard` → `/demo/en/dashboard`)
4. **PWA sanity** — `npm run build && npm run preview`, install, confirm the installed PWA opens to `/demo/en`
5. **Offline sanity** — the existing offline caching still works inside the demo; air-plane-mode spot-check on the relief map + dashboard after a warm visit

Verification is manual for v1 beyond the smoke tests; we do not need to write new unit tests for the landing page.

## Risks / follow-ups

- **Stale service workers** — existing users with a cached SW will navigate to old `/:locale` URLs; the new router handles these with redirects, so the worst case is one bounce. No special SW handling needed.
- **Offline-only users on the old URL** — if someone is offline with an old SW, they keep seeing the old UI until they come back online and the SW updates. Graceful.
- **Search-engine indexing** — the landing page is a new canonical URL; we may want a `<link rel="canonical">` and a basic `<meta>` description at some point. Not blocking v1.
- **Landing page i18n** — deferred. If Hannah's circle asks for it, revisit.
- **README cleanup** — `r0droald/LUaid` URL and `LUaid` name references are stale. Small PR, separate from this one.

## Not doing (explicit non-goals)

Repeating these so there is no ambiguity later:

- No `VITE_DEMO_MODE` flag, no static JSON fixtures, no separate demo build
- No read-only / submit-theater mode in the demo — forms stay fully functional against Supabase
- No changes to the data layer (`src/lib/queries.ts`, `src/lib/supabase.ts`)
- No changes to the offline caching layer
- No open-sourcing activities (public repo, CONTRIBUTING, etc.)
- No template extraction of hard-coded La Union values
- No tenant subdomain setup
- No landing page translations

Each of these has its own doc or will when the need is real.
