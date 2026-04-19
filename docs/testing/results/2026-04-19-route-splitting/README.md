# 2026-04-19 — Route-Level Code Splitting

Captures the effect of Task 4 (lazy-loading all 5 route pages via `React.lazy` + `lazyWithReload`). Same throttling profile as the prior captures — 400/400 Kbps, 2000ms RTT, 6× CPU, 412×869 @ 2.625 DPR, cold cache, 3 runs.

## Cold-visit results (median, 3 runs)

| Metric | Tile prewarm | Route splitting | Delta |
|---|---|---|---|
| First Paint | 4676ms | 4640ms | −36ms (noise) |
| First Contentful Paint | 4676ms | 4640ms | −36ms (noise) |
| DOMContentLoaded | 7938ms | 7659ms | −279ms |
| load event | 7938ms | 7660ms | −278ms |

First Paint / FCP are effectively unchanged, as expected — the inline app shell is still the first pixel, and the `index-*.js` bundle still has to parse before React mounts. The ~280ms DCL improvement is consistent with the main bundle shedding the 57 KB of page code that is now lazy-loaded.

## Bundle split

```
dist/assets/index-*.js                 162.50 KB gzip   (main entry; ReactDOM, router, auth, i18n)
dist/assets/ReliefMapLeaflet-*.js       46.08 KB gzip   (was already lazy)
dist/assets/ReliefMapPage-*.js           6.12 KB gzip   (new)
dist/assets/ReportPage-*.js              5.34 KB gzip   (new)
dist/assets/TransparencyPage-*.js        1.72 KB gzip   (new)
dist/assets/LoginPage-*.js               0.82 KB gzip   (new)
dist/assets/AuthCallbackPage-*.js        0.42 KB gzip   (new)
```

`precache 26 entries (905.64 KiB)` in the Workbox log confirms every new chunk is still precached at SW install, so offline navigation continues to work across all five routes.

## Where the real win lives

The cold filmstrip only shows the local first-visit gain from a smaller critical-path parse. The resilience benefit is qualitative and not in these numbers: each route chunk is now an independently-retryable fetch. On a flaky cellular link, a TCP interruption during a page-chunk download used to invalidate the monolithic bundle; now only the 0.42–6 KB chunk needs to retry. Workbox's `CacheFirst` + `networkFallback` for precached assets means a partial install is still serviceable.

## What the cold filmstrip *does* tell us

That Suspense fallbacks don't introduce a flicker. The top-level `<AppShell />` fallback in `src/main.tsx` remains pixel-identical to the inline shell in `index.html`, and the inner `<Suspense fallback={null}>` in `RootLayout` is scoped beneath `OutboxProvider` so cross-route SPA navigation doesn't briefly re-render the app shell (it renders nothing for the chunk-fetch interval and each page's own skeleton takes over).

## AuthCallbackPage lives outside the locale layout

The OAuth landing route `/auth/callback` is registered at the top level of the router, outside `<RootLayout>`, so its only Suspense ancestor is the root `fallback={<AppShell />}` in `src/main.tsx`. A cold redirect from Supabase hits the inline shell in `index.html`, React mounts `<AppShell />` while the 0.42 KB chunk fetches, and the page then swaps in — pixel-identical to the inline shell throughout the transition. This is the right scope for an OAuth interstitial: it's a full-page takeover anyway, not a navigation within the app.

## Reproducing

Frames and Chrome traces are not committed. To recreate:

```bash
git checkout <commit-that-added-route-splitting>
npm run perf:mobile -- --label=2026-04-19-route-splitting --runs=3
```

`summary.json` in this directory has the per-run paint/load timings.
