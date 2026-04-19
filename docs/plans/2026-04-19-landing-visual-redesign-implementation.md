# Landing page visual redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current plain landing page with the Community Zine visual redesign specified in `docs/plans/2026-04-19-landing-visual-redesign.md`, while keeping landing-specific fonts scoped to the landing route so tenant subdomain deploys don't pay for them.

**Architecture:** Lazy-load `LandingPage` so its CSS (including Google Font imports) code-splits out of the main bundle. Add landing-specific color tokens to `src/index.css` `@theme inline`. Put Public Sans and Instrument Serif `@import` URLs, keyframes, noise texture, and decorative utility classes in a new `src/styles/landing.css` that `LandingPage.tsx` imports — so Vite binds them to the landing chunk. Rewrite `LandingHeader.tsx` and `LandingPage.tsx` in the new aesthetic using Tailwind v4 utilities + the new tokens + a small number of scoped utility classes. Update the root-page smoke test assertions.

**Tech Stack:** React + react-router v7, TypeScript (strict), Vite, Tailwind CSS v4 (`@theme inline`), Vitest, Playwright.

**Prerequisites:** Start from the `feat/landing-refactor` branch with the spec committed at `docs/plans/2026-04-19-landing-visual-redesign.md`. Run `npm install` and `npm run dev` if you haven't already, and copy `.env.local` into this worktree if it's missing (per the `Copy .env.local to new worktrees` project convention — otherwise Supabase-backed routes silently fail).

---

## Task 1: Lazy-load `LandingPage` in the router

Currently `LandingPage` is imported statically in `src/router.tsx`, which would cause its CSS (including Google Font `@import` URLs we'll add) to end up in the main bundle — defeating the point of scoping fonts to the landing route. Switch it to the same `lazyWithReload` pattern the other routes use.

**Files:**
- Modify: `src/router.tsx:4`

- [ ] **Step 1: Edit the import**

Replace line 4:

```tsx
import LandingPage from "./pages/LandingPage";
```

with:

```tsx
const LandingPage = lazyWithReload(() => import("./pages/LandingPage"));
```

(No other changes needed — `LandingPage` is already wrapped by the router's top-level Suspense boundary established by `RootLayout`. Verify by running the app.)

- [ ] **Step 2: Verify the app still renders**

Run: `npm run dev`
Browse to `http://localhost:5173/` and confirm the current (pre-redesign) landing page renders. Then browse to `http://localhost:5173/demo/en` to confirm the app still loads. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/router.tsx
git commit -m "refactor(router): lazy-load LandingPage so its CSS code-splits

Landing-specific fonts and styles belong in the landing chunk, not the
main bundle. Keeps tenant subdomain routes (/demo/*) from paying for
landing-only assets."
```

---

## Task 2: Add landing-specific color tokens to `@theme inline`

Extend `src/index.css` with the landing palette. Keep them prefixed `landing-*` so they're obviously scoped by convention, even though `@theme inline` makes them global.

**Files:**
- Modify: `src/index.css:15-28`

- [ ] **Step 1: Extend the `@theme inline` block**

Replace lines 15–28 with:

```css
@theme inline {
  --color-primary: #007EA7;
  --color-secondary: #003249;
  --color-accent: #80CED7;
  --color-success: #10B981;
  --color-warning: #FBBF24;
  --color-high: #F97316;
  --color-error: #FF6B6B;
  --color-neutral-50: #FFFFFF;
  --color-neutral-100: #CCDBDC;
  --color-neutral-400: #9AD1D4;
  --color-base: #001A26;

  /* Landing-page palette — scoped by convention to src/pages/LandingPage.tsx.
     Do NOT use these on /demo/* app routes. */
  --color-landing-cream: #F4EDDF;
  --color-landing-ink: #1C1611;
  --color-landing-sunset: #E85D2F;
  --color-landing-sunset-deep: #7A3A1F;
  --color-landing-live: #C93B12;

  --font-logo: 'Kagitingan', sans-serif;
}
```

- [ ] **Step 2: Verify Tailwind generates the utilities**

Run: `npm run dev`
Open the browser dev tools on any page and in the Elements tab apply `bg-landing-cream` as a class to `<body>` — if Tailwind picked up the token, the background turns cream. Remove the class. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(design): add landing-* color tokens scoped to landing page

Adds landing-cream, landing-ink, landing-sunset, landing-sunset-deep,
and landing-live to @theme inline. These are for use only on the /
landing route; /demo/* app routes keep the existing palette."
```

---

## Task 3: Create `src/styles/landing.css`

This module carries everything that's landing-specific and should ride the landing chunk: Google Font imports (Public Sans + Instrument Serif), the noise-texture data URI reusable as a class, the live-pulse keyframes + class, and the screenshot-frame utility.

**Files:**
- Create: `src/styles/landing.css`

- [ ] **Step 1: Create the file**

Create `src/styles/landing.css` with this exact content:

```css
/* Landing-only styles. Imported by src/pages/LandingPage.tsx so Vite
   code-splits this (and the Google Font fetches it triggers) into the
   landing chunk. Do NOT import from any /demo/* route. */

@import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap");

/* ---------- Grain / noise overlay ---------- */
.landing-grain {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.35'/></svg>");
  mix-blend-mode: multiply;
  opacity: 0.45;
  pointer-events: none;
}

/* ---------- Riso-style circle shape ---------- */
.landing-riso {
  position: absolute;
  border-radius: 9999px;
  mix-blend-mode: multiply;
  pointer-events: none;
}

/* ---------- Live pulse dot (used on feature #1) ---------- */
@keyframes landing-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(201, 59, 18, 0.25); }
  50% { box-shadow: 0 0 0 7px rgba(201, 59, 18, 0); }
}
.landing-pulse-dot {
  width: 7px;
  height: 7px;
  background: var(--color-landing-live);
  border-radius: 9999px;
  animation: landing-pulse 1.8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .landing-pulse-dot { animation: none; box-shadow: 0 0 0 3px rgba(201, 59, 18, 0.25); }
}

/* ---------- Tilted screenshot frame with hard offset shadow ---------- */
.landing-screenshot-frame {
  transform: rotate(1.5deg);
  box-shadow: 12px 12px 0 var(--color-landing-ink);
}
@media (max-width: 768px) {
  /* On mobile the tilt reads as broken. Flatten. */
  .landing-screenshot-frame {
    transform: none;
    box-shadow: 4px 4px 0 var(--color-landing-ink);
  }
}

/* ---------- Hand-stamped label ---------- */
.landing-stamp {
  transform: rotate(-2.5deg);
}

/* ---------- Dropcap for story opening paragraph ---------- */
.landing-story-body > p:first-of-type::first-letter {
  font-family: var(--font-logo);
  font-size: 68px;
  float: left;
  line-height: 0.85;
  padding-right: 10px;
  padding-top: 6px;
  color: var(--color-landing-sunset);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/landing.css
git commit -m "feat(landing): add landing.css with fonts, grain, pulse, frame

Scoped stylesheet for the landing page. @imports Google Fonts (Public
Sans, Instrument Serif) — scoped here rather than in index.html so
Vite ties them to the lazy landing chunk."
```

---

## Task 4: Rewrite `LandingHeader.tsx`

Replace the current header with the zine-styled header: cream background, Kagitingan wordmark, ink 2px bottom rule, ink CTA button.

**Files:**
- Modify: `src/components/LandingHeader.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/LandingHeader.tsx` with:

```tsx
import { Link } from "react-router";

export default function LandingHeader() {
  return (
    <header className="bg-landing-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b-2 border-landing-ink px-6 pt-3 pb-6 md:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-logo text-2xl tracking-tight text-landing-ink hover:opacity-90"
        >
          <img
            src="/icons/kapwahelp_v1.svg"
            alt=""
            aria-hidden="true"
            className="h-9 w-9"
          />
          Kapwa Help
        </Link>

        <nav className="flex items-center gap-6 text-[13px] font-medium text-landing-ink">
          <a href="#story" className="hidden hover:opacity-70 sm:inline">
            The Story
          </a>
          <a href="#what-it-does" className="hidden hover:opacity-70 sm:inline">
            What it does
          </a>
          <a href="#get-involved" className="hidden hover:opacity-70 sm:inline">
            Get Involved
          </a>
          <Link
            to="/demo/en"
            className="rounded-md bg-landing-ink px-4 py-2 font-semibold text-landing-cream hover:opacity-90"
          >
            View Demo →
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LandingHeader.tsx
git commit -m "feat(landing): restyle header for community zine aesthetic

Cream background, Kagitingan wordmark, 2px ink bottom rule, ink CTA.
Adds #what-it-does anchor link alongside existing #story and
#get-involved."
```

---

## Task 5: Rewrite `LandingPage.tsx` — hero section + wiring

Replace the whole page with the hero-only scaffold so we can ship and verify each section incrementally. We'll add story, features, CTA, footer in subsequent tasks. The page imports `landing.css` to pull in Google Fonts and utility classes.

**Files:**
- Modify: `src/pages/LandingPage.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/pages/LandingPage.tsx` with:

```tsx
import { Link } from "react-router";
import LandingHeader from "../components/LandingHeader";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-landing-cream font-[Public_Sans,system-ui,sans-serif] text-landing-ink">
      <LandingHeader />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-landing-cream px-6 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28">
        {/* Riso circles */}
        <span
          className="landing-riso"
          style={{
            top: "-80px",
            right: "-120px",
            width: "360px",
            height: "360px",
            background: "var(--color-landing-sunset)",
            opacity: 0.88,
          }}
          aria-hidden="true"
        />
        <span
          className="landing-riso"
          style={{
            bottom: "-180px",
            left: "40%",
            width: "360px",
            height: "360px",
            background: "var(--color-primary)",
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
        {/* Grain */}
        <span className="landing-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <div className="landing-stamp mb-6 inline-block border-[2.5px] border-landing-ink bg-landing-cream px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em]">
              Ginawa sa La Union · 2025
            </div>
            <h1 className="font-logo text-[52px] leading-[0.95] tracking-tight text-landing-ink md:text-[72px]">
              Built on the ground.{" "}
              <span className="font-serif italic tracking-normal text-landing-sunset" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Shared with everyone.
              </span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-landing-ink">
              An open-source coordination tool for disaster relief — born during Typhoon Emong, built by the volunteers who were there.
            </p>
            <p
              className="mt-5 text-[19px] italic text-landing-sunset-deep"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              — Para sa komunidad. Ng komunidad.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/demo/en"
                className="rounded-md bg-landing-ink px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90"
              >
                View Live Demo →
              </Link>
              <a
                href="#story"
                className="rounded-md border-2 border-landing-ink px-5 py-[10px] text-sm font-semibold text-landing-ink hover:bg-landing-ink/5"
              >
                Read the Story
              </a>
            </div>
          </div>

          <Link to="/demo/en" className="block">
            <img
              src="/landing/dashboard.png"
              alt="Kapwa Help dashboard showing relief coordination map and donation tracking"
              className="landing-screenshot-frame w-full rounded-[10px] border-[3px] border-landing-ink"
              loading="eager"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`
Browse to `http://localhost:5173/`. Expected:
- Cream background, Kagitingan logotype in header
- Hero headline large ("Built on the ground. Shared with everyone.") with italic serif accent in sunset orange
- Stamp label tilted left, stamp text reads "Ginawa sa La Union · 2025"
- Screenshot on right, tilted ~1.5°, with hard offset shadow
- Sunset-orange and cerulean riso circles overlapping corners with grain texture
- Two buttons side-by-side

Check the Network panel: a `landing-<hash>.css` chunk loads (not in the main CSS bundle), and requests go to `fonts.gstatic.com` for Public Sans + Instrument Serif. Then stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): rewrite hero in community zine aesthetic

Cream paper background with riso-print sunset/cerulean circles, noise
grain, hand-stamped 'Ginawa sa La Union' label, Kagitingan headline
with Instrument Serif italic accent, tilted screenshot frame with
offset shadow."
```

---

## Task 6: Add story section

Add the near-black ink story section after the hero, with sunset-colored "Emong." accent, Kagitingan dropcap on the opening paragraph, and an Instrument Serif italic pull quote.

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Append the story section**

Inside `LandingPage.tsx`, add the following `<section>` immediately after the closing `</section>` of the hero (before the final `</div>` that closes the page wrapper):

```tsx
      {/* ---------- STORY ---------- */}
      <section id="story" className="bg-landing-ink px-6 py-20 text-landing-cream md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-[1fr_2fr] md:gap-14">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-landing-sunset">
              The Story
            </p>
            <h2 className="font-logo text-4xl leading-[0.95] md:text-5xl">
              Born during <span className="text-landing-sunset">Emong.</span>
            </h2>
          </div>

          <div className="landing-story-body space-y-4 text-[15px] leading-[1.7] text-landing-cream/80">
            <p>
              When Typhoon Emong hit La Union in 2025, volunteers self-organized across municipalities to distribute meals, relief goods, drinking water, and medical supplies. Coordination happened over group chats. Tracking happened in spreadsheets — when it happened at all.
            </p>
            <blockquote
              className="my-6 border-l-[3px] border-landing-sunset pl-4 text-[22px] italic leading-snug text-landing-cream"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              "The next disaster response should start where this one left off."
            </blockquote>
            <p>
              Kapwa Help was born out of that experience: a transparency and coordination tool built by the people who were on the ground. We publish this software openly in the hope that it's useful for disaster relief operations in your community too.
            </p>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Browse to `/`. Expected: near-black section below hero. Opening paragraph has a large sunset-orange Kagitingan dropcap. Pull quote in italic serif with sunset-orange left rule. "Emong." in the H2 is sunset orange. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): add story section with dropcap and pull quote"
```

---

## Task 7: Add features section (5 items, reordered, non-technical)

Add the cream-background features section with 5 items in the new order (#1 Live map, #2 Dashboard, #3 Signal, #4 Language, #5 No dependencies). Item #1 has a pulsing red "Live" label; item #5 spans the full width.

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Append the features section**

Add after the closing `</section>` of the story section:

```tsx
      {/* ---------- WHAT IT DOES ---------- */}
      <section id="what-it-does" className="bg-landing-cream px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-landing-sunset">
            What it does
          </p>
          <h2 className="mb-10 max-w-[16ch] font-logo text-4xl leading-[0.95] md:text-[56px]">
            Five things,{" "}
            <span
              className="italic text-landing-sunset"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              done simply.
            </span>
          </h2>

          <ul className="grid grid-cols-1 border-t-2 border-landing-ink md:grid-cols-2">
            {/* 01 — Live map */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-landing-live">
                <span className="landing-pulse-dot" aria-hidden="true" />
                Live
              </div>
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                01 / MAP
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                See where aid is going — right now.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Every relief delivery, pinned to the map of La Union, updated as it happens.
              </p>
            </li>

            {/* 02 — Dashboard */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                02 / DASHBOARD
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Know what's been given, and to whom.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Donations, beneficiaries, volunteer hours, and deployments — all in one place, all open to the public.
              </p>
            </li>

            {/* 03 — Signal */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                03 / SIGNAL
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Works without internet.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Built for the field. Submit reports when the signal's out; they'll sync when you're back online.
              </p>
            </li>

            {/* 04 — Languages */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                04 / LANGUAGE
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                English · Filipino · Ilocano.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Speak to your community in their language. One tap to switch — more languages welcome.
              </p>
            </li>

            {/* 05 — No dependencies (full-width) */}
            <li className="border-b-2 border-landing-ink py-6 md:col-span-2">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                05 / NO DEPENDENCIES
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Runs on free tools. No grant money required.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Built so a typhoon response doesn't stall when a budget runs out.
              </p>
            </li>
          </ul>
        </div>
      </section>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Browse to `/`. Expected:
- Cream section below story with 2-column grid
- Each item has a sunset-orange numbered label and a Kagitingan heading
- Item 01 has a pulsing red dot + "Live" label above the number
- Item 05 spans both columns
- 2px ink rules between cells and under each row
- Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): add features section with reordered non-technical copy

Map is now #1 (with live pulse), dashboard #2, signal #3, language #4,
no-dependencies #5. Technical vocabulary removed — details live in the
README on GitHub."
```

---

## Task 8: Add CTA section

Add the sunset-orange CTA section with overlapping cerulean riso circle, Ilocano greeting, and `mailto:` primary button.

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Append the CTA section**

After the features section's closing `</section>`:

```tsx
      {/* ---------- GET INVOLVED ---------- */}
      <section
        id="get-involved"
        className="relative overflow-hidden bg-landing-sunset px-6 py-20 text-landing-ink md:px-10 md:py-28"
      >
        <span
          className="landing-riso"
          style={{
            top: "-60px",
            right: "-60px",
            width: "240px",
            height: "240px",
            background: "var(--color-primary)",
            opacity: 0.9,
          }}
          aria-hidden="true"
        />
        <span className="landing-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-[700px]">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.35em]">
            Get Involved
          </p>
          <h2 className="mb-4 font-logo text-4xl leading-[0.95] md:text-[58px]">
            Every skill set{" "}
            <span
              className="italic"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              has a place.
            </span>
          </h2>
          <p className="mb-3 max-w-[46ch] text-base leading-relaxed">
            Kapwa Help is volunteer-driven. We welcome help from anyone — developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute.
          </p>
          <p
            className="mb-7 text-[19px] italic text-landing-sunset-deep"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            — Naimbag nga aldaw. Come join us.
          </p>
          <a
            href="mailto:contact@kapwahelp.org"
            className="inline-block rounded-md bg-landing-ink px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90"
          >
            Get in Touch →
          </a>
        </div>
      </section>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Browse to `/`. Expected: sunset-orange section with cerulean circle in top-right corner (multiply blend), grain, Ilocano italic line, ink primary button. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): add get-involved CTA section with ilocano accent"
```

---

## Task 9: Rewrite footer

Replace the existing minimal footer with the near-black footer with sunset top-rule, meta text, GitHub + contact links.

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Append the footer**

After the CTA section's closing `</section>`:

```tsx
      {/* ---------- FOOTER ---------- */}
      <footer className="border-t-[6px] border-landing-sunset bg-landing-ink px-6 py-8 text-xs text-landing-cream md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p className="text-landing-cream/60">
            <span className="mr-5">MIT License</span>
            <span>Built for La Union, shared with everyone</span>
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/kapwa-help/kapwa-help"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              GitHub
            </a>
            <a href="mailto:contact@kapwahelp.org" className="hover:opacity-80">
              Contact
            </a>
          </div>
        </div>
      </footer>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Browse to `/`. Expected: footer with sunset top rule, ink background, cream text, "GitHub" and "Contact" links on the right. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): add ink footer with sunset top rule"
```

---

## Task 10: Update smoke tests for new landing copy

The existing `root renders the landing page` test (`tests/e2e/smoke.spec.ts:74-100`) asserts the old H1 copy ("citizen-led disaster relief"). Update it to the new H1 and add assertions for the stamp, features, and CTA.

**Files:**
- Modify: `tests/e2e/smoke.spec.ts:74-100`

- [ ] **Step 1: Replace the landing test**

Replace lines 74–100 (the full `root renders the landing page` test) with:

```ts
test("root renders the landing page", async ({ page }) => {
  await page.goto("/");

  // H1 copy
  await expect(
    page.getByRole("heading", { level: 1, name: /built on the ground/i }),
  ).toBeVisible();

  // Ginawa sa La Union stamp (provenance signal)
  await expect(page.getByText(/ginawa sa la union/i)).toBeVisible();

  // Primary CTA → /demo/en
  const primaryCta = page.getByRole("link", { name: /view live demo/i }).first();
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute("href", "/demo/en");

  // Header CTA
  const headerCta = page.getByRole("link", { name: /view demo/i });
  await expect(headerCta).toBeVisible();

  // Hero screenshot
  await expect(
    page.getByRole("img", { name: /kapwa help dashboard/i }),
  ).toBeVisible();

  // Story section H2
  await expect(
    page.getByRole("heading", { level: 2, name: /born during emong/i }),
  ).toBeVisible();

  // Features section presence (live map is #1)
  await expect(
    page.getByRole("heading", { level: 3, name: /see where aid is going/i }),
  ).toBeVisible();

  // CTA section
  await expect(
    page.getByRole("heading", { level: 2, name: /every skill set/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /get in touch/i }),
  ).toHaveAttribute("href", "mailto:contact@kapwahelp.org");

  // Footer
  await expect(page.getByText(/mit license/i)).toBeVisible();

  // Screenshot for visual verification
  await page.screenshot({
    path: "tests/e2e/screenshots/landing.png",
    fullPage: true,
  });
});
```

- [ ] **Step 2: Run the smoke test**

Run: `npm run verify -- --grep "root renders the landing page"`
Expected: the single test passes. If Playwright complains that the dev server isn't running, it will auto-start via the config.

- [ ] **Step 3: Run the full smoke suite**

Run: `npm run verify`
Expected: all tests pass. If an unrelated test fails (e.g. because of missing Supabase env vars), re-verify that `.env.local` is present in this worktree.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test(landing): update smoke assertions for zine redesign

New H1 copy, stamp, story H2, features #1 title, CTA section, and
mailto href all asserted. Screenshot path unchanged."
```

---

## Task 11: Manual Playwright verification + cleanup

Per the Critical Rule in `CLAUDE.md`: verify the test plan yourself before declaring the PR ready. This section is the Playwright-CLI eyeball check that the smoke test screenshot and unit tests can't fully replace.

- [ ] **Step 1: Open the page in a headed browser**

Run: `npm run dev` in one terminal, then in another: `npm run verify:headed -- --grep "root renders the landing page"`

- [ ] **Step 2: Eyeball against the spec**

Confirm all of:
- [ ] Hero: Kagitingan headline reads crisply at 72px; italic serif accent visually distinct; stamp tilted; screenshot tilted with hard offset shadow; grain overlay visible but subtle
- [ ] Story: dropcap present on opening paragraph; pull quote italic; "Emong." in sunset orange
- [ ] Features: live pulse animating on item #1; 2px ink rules between cells; item #5 spans full width; no technical vocabulary present
- [ ] CTA: cerulean circle visible in top-right; Ilocano line in italic serif; button is mailto
- [ ] Footer: 6px sunset top rule; GitHub + Contact links on the right

- [ ] **Step 3: Mobile viewport check**

In the headed Playwright browser, resize the viewport to 375×667. Confirm:
- [ ] Hero stacks to single column
- [ ] Screenshot frame un-tilts (no rotation at ≤768px)
- [ ] Nav anchor links are hidden, "View Demo" CTA remains
- [ ] Features collapse to single column
- [ ] Nothing overflows horizontally

- [ ] **Step 4: Tenant-subdomain leak check**

In the dev server (port 5173), browse to `/demo/en` with the Network tab open. Expected: no requests to `fonts.googleapis.com` or `fonts.gstatic.com`. If you see those requests, Public Sans and Instrument Serif are leaking into the demo route — re-check that `landing.css` is imported only from `src/pages/LandingPage.tsx`.

- [ ] **Step 5: Production build check**

Run: `npm run build`
Expected: build succeeds, TypeScript passes, Vite reports a separate `landing-<hash>.css` chunk. If fonts ended up in the main chunk's CSS, re-check the import location.

Then: `npm run preview` and browse to `/` to confirm fonts load and the page renders in production mode.

- [ ] **Step 6: Final commit (if any leftover changes)**

If the build surfaced anything (e.g. a lint warning, an unused import), fix it and commit with:

```bash
git add -u
git commit -m "chore(landing): post-verification cleanup"
```

If nothing is dirty, skip this step.

---

## Success criteria

- `/` renders the new Community Zine landing page exactly as described in `docs/plans/2026-04-19-landing-visual-redesign.md`
- `npm run build` succeeds
- `npm run verify` all green
- Visiting `/demo/en` triggers zero requests to `fonts.googleapis.com` / `fonts.gstatic.com`
- `LandingPage` is lazy-loaded (visible as a separate chunk in build output)
- Kagitingan renders the logo and all landing headlines
- Live pulse on feature #1 respects `prefers-reduced-motion`
