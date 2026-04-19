# Loading Performance Findings

> Reference document for future performance work on Kapwa Help. Captures
> what has been investigated, what was tried, what didn't work, and what's
> worth trying next. **Read this before proposing bundle-size or code-splitting
> optimizations** — the obvious ones have been tested and rejected.

**Snapshot date:** 2026-04-18
**Related issue:** [#89 — Investigate loading performance on older phones](https://github.com/kapwa-help/kapwa-help/issues/89)
**Related branches:** `perf/lighthouse-fixes` (preserved, not merged), `perf/system-fonts-precache` (font optimization, merged separately)

## About this app

Kapwa Help is an open-source PWA for disaster-relief coordination in La Union, Philippines. React 19 + Vite + Supabase + Leaflet. Offline-first. Three locales (en/fil/ilo). The app's landing route renders a Leaflet map of needs, relief hubs, and hazards.

## The problem this doc exists to solve

Future sessions will look at the 590 kB main JS bundle and want to "optimize the big lever." That lever has been tried. It doesn't help. This doc prevents re-walking the same dead ends.

---

## Original tester feedback

From initial deployment, a tester reported:

> "ran in some issues with loading on older model of phones and andorid. might need to work on compatibility"

Follow-up: newer iPhones worked fine; older iPhones and Android devices struggled. **The feedback is ambiguous.** We do not know if "loading issues" meant:

1. White screen for too long (LCP issue)
2. Content appeared but UI felt frozen / laggy (real-device TBT issue)
3. Map area specifically never rendered (network/offline/tile-server issue)
4. App crashed (RAM / low-memory-device issue)
5. Something else entirely

This ambiguity blocks targeted optimization. Resolving it via a clarifying tester question is the cheapest highest-info next action.

---

## Baseline Lighthouse data

Measured on the production build via `npm run preview`, Lighthouse Mobile + Navigation mode, Chrome Incognito, `http://localhost:4173/en`:

| Metric | Value |
|--------|-------|
| Performance | 86 |
| LCP | 4.1s |
| FCP | 1.9s |
| TBT | **0ms** |
| Accessibility | 92 |

### Key finding: TBT = 0ms

JavaScript is **not** blocking the main thread. The main bundle (172 KB gzipped at the time, now 173 KB) parses fine on Lighthouse's simulated mid-tier hardware. **This rules out bundle-size reduction as the correct lever for the measured performance profile** — the bottleneck is elsewhere.

### The real bottleneck: LCP critical chain

The LCP element is an OpenStreetMap tile image. Tiles download fast (~20ms each), but the browser cannot discover tile URLs until this sequential chain completes:

```
HTML loads → JS downloads → JS parses → React mounts → i18n loads
→ Page component renders → Leaflet initializes → viewport calculated
→ tile URLs generated → browser fetches tiles → tile paints (LCP)
```

That chain is ~4 seconds on simulated mobile. Each step depends on the previous. **Bundle splitting doesn't help this chain — it just changes where bytes land, not which steps must execute sequentially.**

---

## What was tried on `perf/lighthouse-fixes` (branch preserved, not merged)

Five commits implementing the plan at `docs/plans/2026-04-09-lighthouse-performance-fixes.md`:

| # | Change | Commit | Result |
|---|--------|--------|--------|
| 1 | Removed i18n Suspense render-blocking | `2624b76` | **FCP got worse** (1.9s → 2.2s). The old `<div>Loading...</div>` Suspense fallback had been painting as a fast FCP. Removing it meant first paint had to wait for real content. |
| 2 | Route-level code splitting (`React.lazy`) for all 3 pages | `034e013` | **LCP unchanged.** Main bundle dropped 172 KB → 161 KB gzipped, but the map landing page still needs all its code — splitting just added a network roundtrip to the critical path. |
| 3 | Preconnect hints for OSM tile servers | `d206d02` | **Unmeasurable on localhost** (no DNS to resolve). Should save 200-400ms on real networks. **Untested on real deploy.** |
| 4 | Marker accessibility: 14px → 24px touch targets, aria-labels | `6712ff9`, `117a145` | **Accessibility score 92 → 96.** Clean win, unrelated to perf concerns. Safe to cherry-pick separately. |

### Final delta across all five commits

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Performance | 86 | 84 | Noise |
| LCP | 4.1s | 4.2s | No improvement |
| FCP | 1.9s | 2.2s | **Worse** |
| Accessibility | 92 | 96 | +4 |

**Decision: not merged.** Complexity cost with no perf payoff. The branch is preserved so the accessibility commits can be cherry-picked independently.

---

## What was learned

### 1. Route splitting doesn't help landing-route LCP

The map landing page (`/:locale`) needs all its code to render a useful first screen. Splitting the 3-page router shifts bytes between chunks but doesn't change first-paint behavior on that route. It only helps subsequent navigation to unvisited pages — but those pages are already precached by the SW, so the network-savings argument doesn't apply either.

**Don't re-propose route splitting as a first-paint optimization for this app.**

### 2. Weight ≠ speed on older devices

A common mental trap: "Kapwa Help is lighter than Facebook so it should run anywhere." This is category-confused:

- **Facebook / native apps:** pre-installed, platform-compiled, no download-parse-bootstrap cost
- **Kapwa Help:** web app that must download, parse, JIT-compile, and bootstrap every cold load

A fair comparison is *other web apps with map rendering* (Google Maps Web, Mapbox demos), where Kapwa Help is mid-weight. Map web apps are notoriously CPU-heavy on older browsers regardless of bundle size.

### 3. Leaflet is the dominant runtime CPU cost

Even with TBT = 0ms on Lighthouse's simulated mobile (~4× CPU throttle), a 2018 budget Android (Snapdragon 625 class, 10-15× slower than a modern laptop) can spend 1-2 real seconds on Leaflet's initial mount. This is invisible in Lighthouse output but visible to real testers.

Any future Leaflet-touching optimization (static map fallback, deferred rendering, skeleton placeholder) is higher-leverage than JS bundle work.

### 4. Older-device constraints are beyond Lighthouse's simulation

Real budget Androids have:
- 10-15× slower single-thread CPU than a modern laptop (vs. Lighthouse's 4× throttle)
- 2-3 GB RAM with meaningful background-app pressure (Messenger, WhatsApp, Facebook)
- Older WebKit/V8 engines with slower JS execution and missing optimizations
- Firmware-locked browser versions that can't be updated

**Lighthouse localhost scores understate real-world degradation on these devices.** The 4.1s LCP on Lighthouse could realistically be 7-10s on a 2018 budget Android under typical conditions.

### 5. Font optimization (April 2026) — orthogonal win

A separate pass on the same day as this doc shrank the SW precache from 1062 KiB to 893 KiB (−170 KiB, −16%). Details:

- Replaced Karla/Rubik web fonts with system UI stack (`system-ui, -apple-system, ...`). Zero bytes for body + headings.
- Kept Kagitingan for the logo — deliberate cultural choice (Filipino heritage, Edsel Pingol design inspired by *Araw ng Kagitingan*). Intentionally **not precached**: ~45 kB saved on first install, HTTP cache covers 99% of cases, `font-display: swap` handles graceful fallback.
- Deleted 443 kB of orphan TTF files from `public/fonts/`.
- Uninstalled `@fontsource-variable/karla` and `@fontsource-variable/rubik`.

**This is not a fix for the tester feedback.** Precache reduction helps first-install bandwidth on 2G/3G. It does not change LCP or render performance. Committed on `perf/system-fonts-precache`, commit `ec3d46a`. The intent is documented in `src/index.css`, `.claude/rules/design-system.md`, and `docs/design-system.md`.

---

## What's worth trying next (prioritized)

### Priority 1: Clarify the tester feedback

Send a short checklist to the testers:

> Thanks for the feedback! When you said "loading issues," which of these matches what you saw?
> 1. Screen was blank/white for a long time before anything appeared
> 2. Stuff appeared, but the app felt frozen or laggy when you tried to tap or scroll
> 3. The map area specifically stayed empty
> 4. The app opened briefly then closed/crashed
> 5. Something else
>
> Also: phone model + OS version, wifi or mobile data?

Without this, every fix is a guess.

### Priority 2: LCP element swap — real UX win regardless of root cause

Render meaningful content *above* the map on ReliefMapPage — active event name, need counts, hazard counts. This element paints in <1s from cached IndexedDB data (`src/lib/cache.ts`), becomes the new LCP target, drops measured LCP from 4.1s to ~1.5-2s.

**Not a Lighthouse trick.** A relief coordinator sees "Typhoon Emong, 12 needs, 3 critical" instantly instead of blank space for 4 seconds. Helps across most interpretations of the tester feedback:

- White-screen interpretation → becomes meaningful content fast
- Frozen-feeling interpretation → visual feedback lands sooner
- Map-never-loads interpretation → users still see useful context + can navigate away
- Crash interpretation → no help (but other interpretations benefit)

### Priority 3: Extract marker a11y commits as a clean PR

Cherry-pick `6712ff9` and `117a145` from `perf/lighthouse-fixes` into a fresh branch (`a11y/marker-touch-targets` or similar). +4 accessibility score, zero perf coupling, no tradeoffs. 15-minute change.

### Priority 4: Preconnect hints, tested on real deploy

Cherry-pick `d206d02`. Deploy to a Vercel preview. Run Lighthouse against the preview URL (not localhost). Preconnect only shows benefit when DNS/TLS handshakes are actually non-zero, which cannot be measured locally.

### Priority 5: Test on a real older device

Options, in decreasing order of realism:
- Borrow or buy a cheap 2018-era Android (~$100 budget, most accurate signal)
- BrowserStack / Sauce Labs remote session against a 2018 Android profile
- Vercel preview + Lighthouse-as-a-service against that URL

Only real-device data validates whether localhost's 4.1s LCP reflects what testers see.

---

## What is NOT worth trying (already established)

### Bundle size reduction via more splitting
**Why not:** Tried as Task 2 of the original plan. LCP unchanged. TBT = 0ms confirms parse isn't the bottleneck. Don't repeat.

### Removing i18n Suspense
**Why not:** Tried as Task 1. FCP got worse. The Suspense `<div>Loading...</div>` fallback was load-bearing — it was the fast FCP element itself.

### Preact compatibility alias
**Why not:** Would save ~30 kB gzipped and reduce JS parse time. But TBT is already 0ms on Lighthouse — parse isn't the bottleneck. Complexity and compatibility risk for no measurable Lighthouse win. *Might* be worth re-examining if real-device testing reveals non-zero TBT on older phones, but don't reach for it first.

### Supabase subpackage imports (`postgrest-js` / `gotrue-js` / `storage-js`)
**Why not:** Medium-complexity refactor splitting `@supabase/supabase-js` into subpackages. Saves 40-60 kB raw. Same "bundle size isn't the bottleneck" reasoning applies. Skip unless other levers are exhausted and real-device data shows parse as a bottleneck.

### Font precache shrinking as a perf fix
**Why not:** Already done in April 2026 (commit `ec3d46a`). Helps first-install bandwidth, does not affect LCP or render performance. Not a lever for the tester-feedback problem.

---

## Key files and references

| Resource | Purpose |
|----------|---------|
| Issue [#89](https://github.com/kapwa-help/kapwa-help/issues/89) | Original investigation + decision not to merge `perf/lighthouse-fixes` |
| Branch `perf/lighthouse-fixes` | Preserved; a11y commits (`6712ff9`, `117a145`) are safe to cherry-pick, perf commits (`2624b76`, `034e013`, `d206d02`) are dead ends or unmeasured |
| `docs/plans/2026-04-09-lighthouse-performance-fixes.md` | Original implementation plan (fully executed, not merged) |
| Commit `ec3d46a` (`perf/system-fonts-precache`) | Font optimization; precache 1062 → 893 KiB |
| `src/router.tsx` | Static imports for 3 pages. **Do not convert to `lazy()` without a new theory that addresses the LCP chain.** |
| `src/lib/cache.ts` | IndexedDB cache for map + transparency data. Data source for the proposed LCP hero element. |
| `src/lib/lazy-reload.ts` | Unused lazy helper (was built for Task 2; left in place for potential future use) |
| `src/components/maps/ReliefMapLeaflet.tsx` | Leaflet mount and marker rendering. Primary CPU cost on older devices. |
| `vite.config.ts` | Workbox `globPatterns` controls precache; currently matches `woff2` but not `otf` (intentional, documented in `src/index.css`) |

---

## Mental models for future perf work on this codebase

1. **Bundle size is not the problem.** TBT = 0ms rules out JS parse as the Lighthouse-measurable bottleneck. Don't optimize weight without a new measurement showing otherwise.
2. **LCP is pinned by the critical chain, not byte count.** Speeding up any single step in the chain by 10% doesn't break the chain. Eliminating a step (e.g., rendering meaningful content before Leaflet mounts) does.
3. **Leaflet is the heaviest single runtime cost.** Any optimization that touches Leaflet's initial mount — static map fallback, deferred rendering, skeleton placeholder, marker clustering — is higher-leverage than JS bundle work.
4. **Lighthouse localhost ≠ real devices.** Real budget Androids are 3-5× slower than Lighthouse's simulated throttle. Assume LCP on real devices is 1.5-2× what Lighthouse reports.
5. **The user sees a web app, not a bundle.** Perceived-performance optimizations (skeletons, progressive rendering, fast first paints of *something useful*) matter more than raw byte shaving for this app's use case.

---

## Before proposing an optimization, check

1. `gh issue list --state all --search "performance"` — has anyone investigated this?
2. `git log --all --oneline | grep -i perf` — has anyone tried it?
3. This document — has it been tried and documented as a dead end?

Skipping these checks is how the same optimization gets re-proposed and the same conclusion gets re-discovered. A 3-command search saves a week of circular work.
