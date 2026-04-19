# Landing Features Section Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the landing page's "What it does" section as a generalizable "Features" block — four feature cards with community-agnostic copy plus a full-width open-source/GitHub closer — and rename the section anchor to `#features`.

**Architecture:** Pure copy + markup edit in `src/pages/LandingPage.tsx`. Update the one nav link in `LandingHeader.tsx` and the one anchor assertion in the landing scoping smoke test. English-only; no i18n files touched. Verification via `npm run verify` (Playwright smoke + landing scoping) plus a manual browser check of the GitHub CTA.

**Tech Stack:** React 19, Vite, Tailwind v4 (landing tokens only: `landing-cream`, `landing-ink`, `landing-sunset`, `landing-live`), Playwright for smoke.

**Related spec:** `docs/plans/2026-04-19-landing-features-section-rewrite.md`

---

## File Structure

**Modify (3 files):**
- `src/pages/LandingPage.tsx` — replace contents of the `{/* ---------- WHAT IT DOES ---------- */}` section (lines ~123–212): new eyebrow/title, four rewritten cards, new full-width open-source closer. Rename `id="what-it-does"` → `id="features"`.
- `src/components/LandingHeader.tsx` — update the one in-page nav link (line 27): `href="#what-it-does"` → `href="#features"` and the label `What it does` → `Features`.
- `tests/e2e/landing-scoping.spec.ts` — update the anchor-id list (line 57): replace `"what-it-does"` with `"features"`.

**No new files. No i18n files touched.**

---

### Task 1: Rewrite the Features section in LandingPage.tsx

**Files:**
- Modify: `src/pages/LandingPage.tsx:123-212`

- [ ] **Step 1: Replace the entire section**

Open `src/pages/LandingPage.tsx` and replace the block starting at the `{/* ---------- WHAT IT DOES ---------- */}` comment through the closing `</section>` (currently lines ~123–212) with the exact block below.

```tsx
      {/* ---------- FEATURES ---------- */}
      <section id="features" className="bg-landing-cream px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-landing-sunset">
            Features
          </p>
          <h2 className="mb-10 max-w-[16ch] font-logo text-4xl leading-[0.95] md:text-[56px]">
            Built for the field.
          </h2>

          <ul className="grid grid-cols-1 border-t-2 border-landing-ink md:grid-cols-2">
            {/* 01 — Relief Map */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <div className="mb-2 flex items-center gap-3">
                <p className="font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                  01 / RELIEF MAP
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-landing-live">
                  <span className="landing-pulse-dot" aria-hidden="true" />
                  Live
                </div>
              </div>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                View live needs and hazards.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                See what's happening on the ground, pinned and updated as reports come in.
              </p>
            </li>

            {/* 02 — Transparency Dashboard */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                02 / TRANSPARENCY DASHBOARD
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Know what's been given, and to whom.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Donations, beneficiaries, volunteer hours, and deployments, all in one place, all open to the public.
              </p>
            </li>

            {/* 03 — Offline First */}
            <li className="border-b-2 border-landing-ink py-6 md:border-r-2 md:pr-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                03 / OFFLINE FIRST
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Works without internet.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                Submit reports when the signal's out; they'll sync when you're back online.
              </p>
            </li>

            {/* 04 — Multilingual */}
            <li className="border-b-2 border-landing-ink py-6 md:pl-7">
              <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
                04 / MULTILINGUAL
              </p>
              <h3 className="mb-1.5 font-logo text-[22px] leading-tight text-landing-ink">
                Speak to your community in their language.
              </h3>
              <p className="text-sm leading-relaxed text-landing-ink/75">
                English, Filipino, and Ilocano out of the box. One tap to switch. More languages welcome.
              </p>
            </li>
          </ul>

          {/* 05 — Open Source closer (full-width) */}
          <div className="border-b-2 border-landing-ink py-10 md:py-14">
            <p className="mb-2 font-logo text-[11px] tracking-[0.2em] text-landing-sunset">
              05 / OPEN SOURCE
            </p>
            <h3 className="mb-4 max-w-[18ch] font-logo text-[28px] leading-tight text-landing-ink md:text-[40px]">
              Take it. Run it for your community.
            </h3>
            <p className="mb-6 max-w-[62ch] text-sm leading-relaxed text-landing-ink/75 md:text-base">
              Kapwa Help is free and open source. It runs on free-tier tools, so a disaster response doesn't stall when a budget runs out. Fork the repo, deploy it for your own community, or help us improve it.
            </p>
            <a
              href="https://github.com/kapwa-help/kapwa-help"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-landing-sunset px-5 py-3 text-sm font-semibold text-landing-cream hover:opacity-90 md:text-base"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>
```

Notes on the exact changes vs. current file:
- Comment header changed from `WHAT IT DOES` to `FEATURES`.
- `<section id>` changed from `"what-it-does"` to `"features"`.
- Eyebrow text: `What it does` → `Features`.
- `<h2>` simplified to single-color `Built for the field.` — no italic sunset span, no `<span>` styling.
- Card copy updated per spec (four cards).
- Card 05 `<li md:col-span-2>` replaced with a sibling `<div>` outside the `<ul>` for the open-source closer with GitHub CTA.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits cleanly with no errors.

- [ ] **Step 3: Visually confirm in the dev server**

Run: `npm run dev` (if not already running).
Open the landing page, scroll to the Features section. Confirm:
- Eyebrow reads `FEATURES`, title reads `Built for the field.`
- Four cards in a 2×2 grid on desktop, stacked on mobile.
- Card 01 still shows the red pulse-dot `Live` chip inline with `01 / RELIEF MAP`.
- Full-width `05 / OPEN SOURCE` block below the grid with the `View on GitHub →` button.
- Clicking `View on GitHub →` opens `https://github.com/kapwa-help/kapwa-help` in a new tab.

---

### Task 2: Update the in-page nav link in LandingHeader

**Files:**
- Modify: `src/components/LandingHeader.tsx:27-29`

- [ ] **Step 1: Update href and label**

In `src/components/LandingHeader.tsx`, replace:

```tsx
          <a href="#what-it-does" className="hidden hover:opacity-70 sm:inline">
            What it does
          </a>
```

with:

```tsx
          <a href="#features" className="hidden hover:opacity-70 sm:inline">
            Features
          </a>
```

- [ ] **Step 2: Confirm in the browser**

With the dev server still running, click the `Features` link in the header. The page should scroll to the new Features section.

---

### Task 3: Update the landing scoping smoke test

**Files:**
- Modify: `tests/e2e/landing-scoping.spec.ts:57`

- [ ] **Step 1: Swap the anchor id in the test**

Replace:

```ts
  for (const id of ["story", "what-it-does", "get-involved"]) {
```

with:

```ts
  for (const id of ["story", "features", "get-involved"]) {
```

- [ ] **Step 2: Run the scoping test**

Run: `npx playwright test tests/e2e/landing-scoping.spec.ts`
Expected: all tests pass.

---

### Task 4: Run the full smoke suite

- [ ] **Step 1: Run verify**

Run: `npm run verify`
Expected: all Playwright smoke tests pass. New landing screenshots (if any are regenerated) reflect the new section.

- [ ] **Step 2: Run the unit tests**

Run: `npm test`
Expected: all pass. (No unit tests reference the section copy; this is a safety check.)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors.

---

### Task 5: Commit

- [ ] **Step 1: Review the diff**

Run: `git status && git diff`
Confirm only the three files listed in File Structure are changed.

- [ ] **Step 2: Commit**

```bash
git add src/pages/LandingPage.tsx src/components/LandingHeader.tsx tests/e2e/landing-scoping.spec.ts
git commit -m "$(cat <<'EOF'
feat(landing): rewrite features section with open-source closer

Rename the former "What it does" section to "Features". Four cards
(Relief Map, Transparency Dashboard, Offline First, Multilingual) with
generalizable community-agnostic copy, plus a full-width Open Source
closer with a prominent GitHub CTA. Rename anchor #what-it-does to
#features and update the header nav link and landing-scoping test.
EOF
)"
```

---

## Verification Summary

Covered by this plan:
- **Type safety:** `npx tsc --noEmit` in Task 1.
- **Smoke:** `npm run verify` in Task 4, including the landing scoping test updated in Task 3.
- **Unit/lint:** `npm test` and `npm run lint` in Task 4.
- **Manual:** Dev-server visual check in Task 1; GitHub CTA opens in a new tab; header nav link in Task 2 scrolls to the right section.

Per project CLAUDE.md ("Verify your own test plan before finishing a branch"), the implementer must complete Task 4 and the manual checks in Task 1/Task 2 before marking this done.
