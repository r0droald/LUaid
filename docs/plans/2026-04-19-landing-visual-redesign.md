# Landing page visual redesign — Community Zine

**Date:** 2026-04-19
**Branch:** `feat/landing-refactor`
**Supersedes:** the visual layer of `src/pages/LandingPage.tsx` (content structure from PR #100 stays intact)

## Goal

Replace the current plain landing page (PR #100) with a bolder, more distinctive visual treatment that:

- Feels rooted in La Union (the primary audience for adoption)
- Reads as community-made, not corporate SaaS
- Uses distinctive typography and color with intent
- Keeps Kapwa Help's existing brand anchors intact

Non-goals: changing the URL structure, redoing the `/demo/*` app UI, adding JS animation libraries, making this page offline-first.

## Audience

Primary: **La Union community members** — residents, coordinators, the volunteers from the Emong response. The goal is adoption for the next disaster response, not funder pitching.

Secondary: **developers** evaluating whether to contribute, and **curious visitors** (press, casual) trying to understand what this project is.

Technical details (service workers, Supabase, PWA internals) deliberately stay on GitHub, not on the landing. This page speaks to humans, not engineers.

## Aesthetic direction: Community Zine

A warm, poster-like, of-the-place aesthetic. Think riso-printed community newsletter, not VC-backed dashboard marketing page. Signature moves:

- Cream paper background with layered color circles (sunset orange, cerulean) using `mix-blend-mode: multiply`
- SVG noise/grain texture over both
- Hand-stamped label "Ginawa sa La Union · 2025" (Filipino: "Made in La Union") in the hero
- Tagalog/Ilocano phrases used as design elements, not translated UI
- Numbered features like zine table-of-contents entries
- Screenshot in a tilted frame with hard offset shadow (poster-style)
- Dropcap on the opening paragraph of the story
- Alternating cream / near-black / cream / sunset-orange section rhythm

## Brand anchors (kept identical to app)

- **Logo:** `public/icons/kapwahelp_v1.svg` — unchanged. The illustrative hand-drawn feel actually fits this aesthetic better than a tech-mark would.
- **Logotype wordmark:** "Kapwa Help" set in Kagitingan Bold (already loaded site-wide from `public/fonts/Kagitingan-Bold.otf` via `font-logo` utility).
- **Primary CTA color:** cerulean `#007EA7` — stays the call-to-action color everywhere (though on this page it's a mood element, not always the literal CTA button color; button color defers to aesthetic contrast — near-black button on cream background, cream button on orange background).
- **Deep navy `#001A26`** available as a mood — used lightly here, gives way to a warmer near-black `#1C1611` for the landing-specific dark sections.

The logo's coral-red (`#F24855`) is slightly cooler than the landing's sunset orange (`#E85D2F`). At logo scale this is acceptable and we won't shift either — noted as a known minor harmonic friction.

## Typography

Three faces, all with a clear role:

| Role | Font | Source |
|------|------|--------|
| Display (all landing headlines, feature titles, numbered labels, logo wordmark) | **Kagitingan Bold** | Already loaded site-wide from `public/fonts/Kagitingan-Bold.otf`. No additional load. |
| Italic accent (decorative phrases, pull quotes, "accent" spans inside headlines) | **Instrument Serif (italic)** | New Google Font load. Used sparingly — roughly 4–6 places total. |
| Body (running prose, nav, lede) | **Public Sans** 400/500/600/700 | New Google Font load. Replaces system-ui on the landing page only; the app keeps system-ui. |

Font-load strategy: both Google Fonts use `display=swap` with a `preconnect` to `fonts.googleapis.com`. Kagitingan already loaded. Total new landing-only font payload: Public Sans (≈40 KB for used weights) + Instrument Serif italic (~20 KB).

## Color palette (landing-specific)

| Token | Hex | Usage |
|-------|-----|-------|
| `landing-cream` | `#F4EDDF` | Paper background for hero, features, warm section text |
| `landing-ink` | `#1C1611` | Near-black — primary text, buttons, borders, dark section background (warmer than `#001A26`) |
| `landing-sunset` | `#E85D2F` | Accent — riso circles, numbered labels, footer top rule, CTA background |
| `landing-sunset-deep` | `#7A3A1F` | Tagalog/Ilocano accent text |
| `landing-live` | `#C93B12` | Live-pulse dot on the map feature |
| `primary` (`#007EA7`) | — | Existing — riso circle on cream backgrounds, hover accents |

These tokens live in the landing page's scoped CSS/Tailwind — they do NOT go into the global design system. The `/demo/*` app keeps the existing palette untouched.

## Sections

### 1. Header / nav

- Logo SVG (36×36) + "Kapwa Help" wordmark (Kagitingan Bold, 24px)
- Right side: "The Story", "What it does", "Get Involved" text links (Public Sans 500, 13px)
- CTA button: "View Demo →" (ink background, cream text)
- Bottom border: 2px solid ink — hard rule, zine-style

Replaces the current `LandingHeader` component for the landing route only. The app keeps its existing `Header`.

### 2. Hero

- Cream background with layered decorative circles (sunset top-right, cerulean bottom-center) rendered with `mix-blend-mode: multiply` + noise grain overlay
- Two-column grid (1.2fr / 1fr), stacks on mobile
- Left column:
  - Tilted stamp: "Ginawa sa La Union · 2025" (rotated -2.5°, 2.5px ink border)
  - H1 headline: *"Built on the ground. **Shared with everyone.**"* — "Shared with everyone." in Instrument Serif italic + sunset color
  - Lede: *"An open-source coordination tool for disaster relief — born during Typhoon Emong, built by the volunteers who were there."*
  - Tagline (Instrument Serif italic, sunset-deep): *"— Para sa komunidad. Ng komunidad."*
  - Buttons: `View Live Demo →` (ink/cream), `Read the Story` (outline)
- Right column: existing `/landing/dashboard.png` screenshot in a 3px ink-bordered frame, rotated 1.5°, with a 12px hard offset shadow

### 3. Story

- Near-black ink background (`#1C1611`), cream text
- Two-column grid (1fr / 2fr)
- Left: label "The Story" (sunset uppercase) + H2 *"Born during **Emong.**"* (Kagitingan, "Emong." in sunset)
- Right: three paragraphs with a Kagitingan dropcap on the opening letter (sunset color, 68px, left-floated). Middle paragraph replaced with an Instrument Serif italic pull quote: *"The next disaster response should start where this one left off."*

Content is a condensed rewrite of the existing "Born during Typhoon Emong" section — same facts, tighter rhythm, additional pull quote.

### 4. What it does — five features

- Back to cream
- Head: label "What it does" + H2 *"Five things, **done simply.**"*
- 2-column grid with 2px ink rules between cells (zine/newspaper feel)
- **Order changed** from the current page. New order, with non-technical copy:
  1. **Live deployment map.** Pulsing red "Live" indicator above the number. *"See where aid is going — right now. Every relief delivery, pinned to the map of La Union, updated as it happens."*
  2. **Transparency dashboard.** *"Know what's been given, and to whom. Donations, beneficiaries, volunteer hours, and deployments — all in one place, all open to the public."*
  3. **Works without signal.** *"Built for the field. Submit reports when the signal's out; they'll sync when you're back online."*
  4. **Languages.** *"English · Filipino · Ilocano. Speak to your community in their language. One tap to switch — more languages welcome."*
  5. **No dependencies.** Full-width (spans both columns). *"Runs on free tools. No grant money required. Built so a typhoon response doesn't stall when a budget runs out."*

Each feature has a numbered label (e.g. `01 / MAP`) in Kagitingan + sunset color, a H3 headline in Kagitingan (22px), body in Public Sans.

Technical vocabulary (service worker, PWA, Supabase, Workbox, etc.) is deliberately excluded — those details belong in the GitHub README.

### 5. Get Involved CTA

- Full-bleed sunset-orange background, ink text
- Overlapping cerulean circle (top-right, multiply blend) — preserves the cerulean brand anchor on the only section that doesn't already have cream-and-ink
- Label "Get Involved" + H2 *"Every skill set **has a place.**"*
- Body: *"Kapwa Help is volunteer-driven. We welcome help from anyone — developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute."*
- Ilocano greeting (Instrument Serif italic): *"— Naimbag nga aldaw. Come join us."*
- Button: `Get in Touch` (ink/cream) — mailto link to `contact@kapwahelp.org` (matches current)
- **Verify before ship:** "Naimbag nga aldaw" should be sanity-checked with an Ilocano speaker for context and tone. If in doubt, swap for a Tagalog phrase we're confident in.

### 6. Footer

- Near-black ink background
- 6px sunset-orange top rule
- Left: "MIT License · Built for La Union, shared with everyone" (cream-dim)
- Right: "GitHub" + "Contact" links (cream)

## Behavior

- Hero image remains a link to `/demo/en` (matches current)
- Nav "View Demo" → `/demo/en`
- Nav anchor links: `#story`, `#get-involved` — and add `#what-it-does`
- "Get in touch" CTA → `mailto:contact@kapwahelp.org`
- No JS-driven animations. The "Live" pulse is a CSS `@keyframes`. That's the only motion.
- Fully responsive: two-column grids stack at a single breakpoint (≤768px). Hero screenshot un-tilts and unshadows on mobile (tilt reads as broken on narrow screens). Nav anchor links hide `<sm`, same as current.

## Technical notes

- Implemented as a replacement of `src/pages/LandingPage.tsx` and the corresponding header.
- Landing route is already code-split (PR #99). Landing-only deps (Public Sans, Instrument Serif, additional Tailwind utilities if needed) stay out of the `/demo/*` chunks.
- Service worker is unchanged — landing is not offline-first and doesn't need to be cached aggressively.
- Kagitingan already loaded via `src/index.css` `@font-face`; reuse with the `font-logo` utility or extend Tailwind config to expose `font-display` as an alias that resolves to the same stack.
- Google Fonts loaded via `<link rel="preconnect">` + `<link href>` in `index.html` so they don't need to round-trip through `@import`.
- Testing:
  - Existing smoke test (`tests/e2e/smoke.spec.ts`) tests for hero, CTAs, image, footer — assertions may need updating for new copy and structure.
  - New content assertions: "Live" map-feature label, numbered feature list, "Ginawa sa La Union" stamp text.
  - `npm run verify` must pass post-implementation.

## Known risks and open questions

- **Ilocano greeting accuracy** — "Naimbag nga aldaw" (good day) needs verification. If unverifiable, fall back to a known-good Tagalog phrase.
- **Kagitingan at large display sizes** — looks good in the mockup at 72px, but needs a proof at real render time. If it breaks down, headlines fall back to a chunky humanist sans (Archivo Black is the backup). Logo and feature-number usage is unaffected.
- **Logo / zine-orange color friction** — logo red (`#F24855`) vs landing sunset (`#E85D2F`) are close but not identical. Decision: accept the minor friction; don't modify the logo mark.
- **Pull quote source attribution** — the pull quote *"The next disaster response should start where this one left off"* is paraphrased from the existing copy, not a real human quote. Either keep it unattributed (reads as the project's thesis) or replace with an actual quote from a responder if we get one before ship. Lean toward unattributed for v1.
- **i18n** — the landing page is currently English-only. Tagalog/Ilocano phrases are treated as flavor/design text, not translated content. If at some point the landing becomes multilingual, the tagline phrases would need a translation strategy (probably: leave them as-is regardless of locale, since their effect depends on being Filipino).

## Out of scope

- Changes to the `/demo/*` app visuals
- Adding animation libraries (Motion, Framer Motion) — CSS is enough
- Making the landing offline-capable
- Adding a blog, press page, case studies, or any multi-page structure
- Logo redesign
- Modifying the global design system tokens
