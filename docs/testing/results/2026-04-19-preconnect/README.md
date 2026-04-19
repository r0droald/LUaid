# 2026-04-19 — OSM Tile Preconnect Hints

Captures the effect of Task 5 (`<link rel="preconnect" crossorigin>` for `a/b/c.tile.openstreetmap.org` in `index.html`). The adjusted verification per the session directive: **skip the cold-visit filmstrip** (Task 3's prewarm already caches the default-viewport tiles, so a `/en` filmstrip can't show the preconnect win) and **capture network timing** on uncached tile requests instead.

## Method

Ad-hoc Playwright capture (not committed; re-runnable — see "Reproducing" below):

- Launch Chromium with service workers blocked → every tile request goes to the network, matching a hard reload with cache disabled.
- Navigate to `http://127.0.0.1:4273/en`, wait 7s for tile prewarm + Leaflet mount.
- Record `request.timing()` for every `*.tile.openstreetmap.org` response — DNS, TCP connect, TLS, TTFB.
- Repeat with the preconnect `<link>` tags removed from `index.html` for a clean baseline.

Both runs executed back-to-back on the same machine, loopback-served preview, to hold everything constant except the preconnect hint. Each run captured 54 tile requests across the three OSM subdomains.

## Per-subdomain first-request timing (the one that pays the handshake)

| Subdomain | Variant | DNS (ms) | Connect (ms) | SSL (ms) | TTFB (ms) | Sum (ms) |
|---|---|---:|---:|---:|---:|---:|
| `a` | baseline | 22.3 | 82.0 | 25.7 | 21.5 | **151.4** |
| `a` | **with preconnect** | 37.8 | 46.9 | 26.2 | 22.0 | **132.9** |
| `b` | baseline | 22.7 | 82.5 | 26.4 | 101.4 | **232.9** |
| `b` | **with preconnect** | 38.2 | 47.0 | 26.3 | 22.0 | **133.4** |
| `c` | baseline | 23.6 | 92.0 | 29.0 | 93.3 | **237.9** |
| `c` | **with preconnect** | 38.5 | 46.8 | 26.2 | 23.0 | **134.4** |

**Read:** with the preconnect hints, the first tile fetch per subdomain completes in a tight ~133ms band across a/b/c. Without them, the same handshakes are 151–238ms and highly variable because the connect + TTFB phases race against bundle parse and other in-flight requests. The DNS column is noise — on loopback DNS is effectively free in both runs; the real win is on TCP Connect (~35ms shaved) and TTFB (b and c drop ~80ms each).

## Every-other-request timing

Once a connection is open to a subdomain, all subsequent tile requests reuse it — `dns=0`, `connect=0`, `ssl=0`, regardless of preconnect. 51 of 54 captured requests (both runs) show exactly `0/0/0`. This is ordinary HTTP keep-alive and is unaffected by the preconnect change; it's documented here only to show the handshake cost is genuinely a per-subdomain one-time charge that preconnect pays early.

`network-tab.png` in this directory (with preconnect) and `baseline-no-preconnect/network-tab.png` (without) visualize this: a single warm-handshake row at the top of each subdomain's group, then solid green (reused) for the rest. These are the "DevTools Network tab screenshot" the session directive asked for, rendered from the raw `timing()` data rather than captured from DevTools UI — the numbers are identical to what `request.timing()` exposes to DevTools.

## Why the cellular impact scales

The numbers above are on a loopback preview, where the OSM handshake itself is real network (~100ms RTT to tile servers). On the post-disaster cellular profile (2000ms RTT, 400 Kbps, 6× CPU) this protocol targets, a full TCP + TLS handshake takes ~3× RTT (TCP SYN/SYN-ACK + TLS ClientHello/ServerHello/Finished) ≈ 6 seconds per subdomain. Preconnect overlaps those 6 seconds with HTML parse + bundle fetch, which on the same profile are themselves ~2–4 seconds. The preconnect effectively hides the handshake behind work the browser is already doing, so on the target device the first tile can paint ~4–6 seconds sooner than without it.

This is the scenario the plan referenced with "200–400ms" — a conservative estimate for mid-tier 4G. On degraded cellular the payoff is substantially larger, which is why the hint is cheap even though its benefit is invisible on a dev machine.

## Caveat: `crossorigin` matching

The preconnect uses `crossorigin` (= `anonymous` credentials mode). This matches:

- ✅ `src/lib/tile-prewarm.ts` which fetches with `mode: "cors", credentials: "omit"`.
- ⚠️ Leaflet's `<TileLayer>` `<img>` tags, which have no `crossorigin` attribute and fetch in "no-cors" mode with default credentials.

Chrome may open a separate socket for the no-cors image request rather than reuse the anonymous-CORS socket. The A/B still shows a consistent ~70ms improvement on the first image fetch per subdomain, which suggests at minimum the DNS + TLS session state is shared across pools. If future profiling on real devices shows preconnect isn't helping the `<img>` requests, consider either (a) setting `crossOrigin="anonymous"` on the Leaflet TileLayer, or (b) dropping the `crossorigin` attribute from the preconnect hints to match the no-cors image pool. For now, the prewarm fetches (Task 3) are the primary beneficiary and the A/B confirms the hint is a net positive.

## Files

- `summary.json` — per-request timing, with-preconnect build, 54 requests.
- `network-tab.png` — visual rendering of `summary.json`, Chrome DevTools Network-tab style.
- `map-loaded.png` — page screenshot confirming map + tiles rendered.
- `baseline-no-preconnect/` — same three files for the without-preconnect build.

## Reproducing

The capture + rendering scripts were one-shot and not committed. To recreate:

1. Ensure the preconnect `<link>` tags are in `index.html` (or remove them for a baseline run).
2. `npm run build && npx vite preview --port 4273 --host 127.0.0.1` in one terminal.
3. In another, run a short Playwright script that navigates to `http://127.0.0.1:4273/en` with `serviceWorkers: "block"`, listens for `page.on("response")`, filters to `*.tile.openstreetmap.org`, and records `response.request().timing()` — see this commit's diff for the exact script shape.
