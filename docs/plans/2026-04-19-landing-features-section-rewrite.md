---
name: Landing Features Section Rewrite
description: Restructure the landing page's "What it does" section into a generalizable "Features" section with four feature cards and a full-width open-source/community closer.
type: spec
---

# Landing Features Section Rewrite

## Background

The current "What it does" section on `LandingPage.tsx` lists five parallel bullets: Map, Dashboard, Signal, Language, No Dependencies. Two problems:

1. **Too La Union / typhoon-specific.** The landing audience is broader than one province — it includes developers and curious visitors who might deploy for their own community (see project memory: landing audience is LU community + devs + curious; adoption goal, not funder pitch).
2. **The fifth slot ("No Dependencies — Runs on free tools") is technical and awkward.** It's really a *why-you-can-fork-this* point, not a feature on par with the others. The GitHub link and open-source pitch are currently buried.

## Goal

Rework the section into a clear two-part block:

- **Four feature cards** in the existing 2×2 grid: Relief Map, Transparency Dashboard, Offline First, Multilingual — with generalizable, community-agnostic copy.
- **One full-width closing block** inside the same section: "Open Source" — folds in the "runs on free tools, no grant money" principle and makes the GitHub link a prominent CTA.

Section framing shifts from *"Five things, done simply"* to **Features** with a short hero-style title.

## Non-Goals

- No changes to other landing sections (Story, Get Involved, Hero, etc.).
- No changes to the `LandingHeader` nav links (the in-page anchor `#what-it-does` can be kept or renamed — see Open Questions).
- No visual system changes (colors, fonts, grid structure stay the same).

## Section Content

### Eyebrow + Title

- **Eyebrow:** `FEATURES` (replaces `WHAT IT DOES`)
- **Title:** **Built for the field.** (drops "Five things, done simply.")

The title keeps the existing `font-logo` treatment. No italic sunset phrase needed — the title is short and declarative. (If a two-tone variant is wanted, the implementation can add one; otherwise ship monochrome.)

### Four Feature Cards (2×2 grid)

Keep the existing grid structure, border treatment, eyebrow number/label, h3, and body copy pattern. Only copy changes.

**01 / RELIEF MAP** · Live chip (keep the pulse-dot "Live" chip inline with the eyebrow, per `feat(landing): inline the Live chip beside 01 / MAP label`)
- Headline: *View live needs and hazards.*
- Body: See what's happening on the ground, pinned and updated as reports come in.

**02 / TRANSPARENCY DASHBOARD**
- Headline: *Know what's been given, and to whom.*
- Body: Donations, beneficiaries, volunteer hours, and deployments, all in one place, all open to the public.

**03 / OFFLINE FIRST**
- Headline: *Works without internet.*
- Body: Submit reports when the signal's out; they'll sync when you're back online.

**04 / MULTILINGUAL**
- Headline: *Speak to your community in their language.*
- Body: English, Filipino, and Ilocano out of the box. One tap to switch. More languages welcome.

### Closing Block — Open Source (full-width, same section)

Replaces the current `05 / NO DEPENDENCIES` `md:col-span-2` list item. Visually heavier than a plain card — this is the section's payoff and the primary GitHub entry point on the landing page.

- **Eyebrow:** `05 / OPEN SOURCE` (keeps numbered rhythm with the grid above)
- **Headline:** **Take it. Run it for your community.**
- **Body:** Kapwa Help is free and open source. It runs on free-tier tools, so a disaster response doesn't stall when a budget runs out. Fork the repo, deploy it for your own community, or help us improve it.
- **CTA:** A prominent button styled to match the hero CTA weight (sunset background, ink text, same padding/type scale). Label: `View on GitHub →` or similar. Links to `https://github.com/kapwa-help/kapwa-help` in a new tab (consistent with recent commit `feat(landing): open demo in a new tab from all CTAs`).

Layout: the closer sits below the 2×2 grid, full-width, inside the same `<section id="what-it-does">` container. Visually, it should read as a culmination of the grid — same horizontal rule treatment above it, but the interior is heavier (larger headline, CTA button) rather than a plain bullet.

## Implementation Notes

- File: `src/pages/LandingPage.tsx`, the `{/* ---------- WHAT IT DOES ---------- */}` section (currently lines ~123–212).
- Reuse the existing border/eyebrow/h3 classes for the four cards — only copy strings change.
- The closing block replaces the `<li ... md:col-span-2>` with a distinct sub-block. It can still live inside the `<ul>` as a final `<li md:col-span-2>` for structural simplicity, OR move outside the `<ul>` as its own `<div>` if the semantic/visual weight warrants. Recommend moving outside the `<ul>` since it's no longer parallel to the feature items — it's a CTA block.
- Use landing tokens only: `landing-cream`, `landing-ink`, `landing-sunset`, `landing-sunset-deep`, `landing-live` (per `.claude/rules/design-system.md`). No arbitrary colors.
- GitHub link: `https://github.com/kapwa-help/kapwa-help`, `target="_blank"` with `rel="noopener noreferrer"`.
- No new dependencies.

## Verification

Per `.claude/rules/verification.md`: running `npm run verify` after landing-page component changes. Landing smoke tests (if any beyond scoping) and the three locale snapshot tests should continue passing. Additionally:

- Visual check in all three locales (`en`, `fil`, `ilo`) — the new copy will need translations (see Open Questions).
- Click the GitHub CTA, confirm it opens in a new tab.
- Mobile layout: the 2×2 grid collapses to single column; the closer should still look deliberate and not squished.

## Resolved Decisions

1. **i18n:** English-only for the landing page. No `fil`/`ilo` translations for these strings.
2. **Section anchor id:** Rename `id="what-it-does"` → `id="features"`. Update any in-page nav links in `LandingHeader.tsx` accordingly. The anchor is in-page only (not an external URL), so the public-URL redirect rule doesn't apply.
3. **Title styling:** Monochrome. "Built for the field." in `font-logo`, no italic sunset phrase.
