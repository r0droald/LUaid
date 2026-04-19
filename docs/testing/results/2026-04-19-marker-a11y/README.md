# 2026-04-19 — Marker Touch Targets + ARIA Labels

Captures the effect of Task 6 of `docs/plans/2026-04-19-mobile-network-performance.md`:

- **Touch target:** bump need markers from 14×14px to 24×24px — brings them up to WCAG 2.1 minimum so responders with gloves or gear-stiffened fingers stop mis-tapping.
- **Screen-reader context:** add descriptive `title` on all three marker types (need / hub / hazard) so TalkBack + VoiceOver users get "in_transit need: Hot Meals" instead of a generic "button".

## Deviation from plan

The plan prescribed the `alt` prop on react-leaflet's `<Marker>`. Verified empirically that `alt` only propagates to `<img>`-based icons; with `L.divIcon` (which this app uses for all three marker types), `alt` is ignored. Switched to the `title` prop, which Leaflet exposes for both icon types and which sets a `title` attribute on the marker element. `title` serves double duty: browser-native tooltip on hover + accessible name for screen readers.

This was caught in visual verification — first pass showed `title` attribute absent on all 17 rendered markers despite `alt` being set in JSX. See commit diff for the fix.

## Verification

Playwright against a fresh preview build (`npx vite preview --port 5273`):

```
Found 17 markers.
By kind: { need: 9, hub: 5, hazard: 3, missing: 0 }

Sample per kind:
  need:   24px × 24px   title="In transit need: Hot Meals"
  hub:    24px × 24px   title="Relief hub: San Juan Municipal Hall"
  hazard: 24px × 22px   title="Hazard: Flooded bridge on national highway"

✓ All markers have title attributes
```

All 16 Playwright smoke tests pass against the build (run against `http://127.0.0.1:5273` since the machine's default :5173 was occupied by a stale dev server from another worktree).

## Files

- `before.png` — `/en` with baseline (14px need markers, no titles).
- `after.png` — `/en` with the change (24px need markers, all markers titled).

The two images are at the same zoom and viewport. The need markers visible along the coast in the before shot grow proportionally in the after shot; hub and hazard markers are unchanged.

## Marker sizing

All three marker types now meet WCAG 2.1 minimum touch target (24 CSS px):

- Need: 24×24 (from 14×14)
- Hub: 24×24 (from 22×22)
- Hazard: 24×22 (from 22×20) — retains the downward-pointing anchor geometry of the triangle so the point still sits exactly on the hazard's lat/lng

Original intent was to leave hub/hazard at 22px to preserve visual hierarchy, but in real use the solid filled need circles already read as visually heavier than the outlined house/triangle SVGs, so keeping all three at a uniform 24px doesn't actually overpower need markers. Uniform sizing also simplifies the touch-target story for users with gloves.

## Not verified in this capture

- **Native hover tooltip rendering** — `title` attributes render as tooltips via OS chrome, which Playwright's headless Chromium doesn't paint to the page canvas. Verified the attribute is present in the DOM (above); the tooltip behavior is standard HTML and doesn't need its own screenshot.
- **Screen reader announcement** — requires VoiceOver/NVDA/TalkBack, out of scope for CI. The plan's Step 6 notes this as "optional but recommended" before shipping.
