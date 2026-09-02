# Sure Shot verification 5 handoff

## Outcome

**PASS.** Independent verification of candidate
`9eb15c88d4fb60435045e90d4882da47a68cf70e` at
`https://sure-shot.sociobot.in` passed on 2026-09-02. The full report is
[`verification-5.md`](verification-5.md). Product code was not changed.

## How verified

From a clean checkout: `npm ci`; every one of the 15 exact claim commands in
`.factory/claims.json`; `npm test`; `npm run typecheck`; `npm run lint`;
`npm run build`; and `npx playwright test` (26/26 passed). A fresh live
Playwright run completed the 20-level demo to its calibration end screen,
tested restart, keyboard, mobile, reduced motion, axe, privacy request logging,
headers, cache policy, and local/live asset hashes. Live Lighthouse was 100 in
all four categories.

## Known gaps and next step

No release-blocking gaps were found. This remains a static, local-first game;
there is no backend/API, account, payment, service worker, or package surface.
The next step is normal release/deployment handling by the factory.

---

# Sure Shot repair 4 handoff

## Outcome

All findings from independent verification commit
`ced52110f1e43a3371b284af0b9c557b8f01e489` for candidate
`b9dd20f293afcfddf1c694ee0566679cb6cf2d8b` are repaired. The application
repair is commit `5558cfe5cca68f065001c9ebcb855aa03383f086`, pushed to `main` and
deployed to `https://sure-shot.sociobot.in` on 2026-09-02. Deployment ID:
`68f6b288-98a1-4e46-9167-5613c5bd15b1`.

The scripted 20-level game still reaches the real **See how your confidence
matched** end screen and resets to a fresh run.

## Reproduction before repair

The untouched candidate reproduced the verifier's exact 390 px measurements:

* App wordmark: 112.8 × 39.6 px; footer Privacy: 51.0 × 16.0 px; footer Terms:
  41.5 × 16.0 px.
* Static-404 wordmark: 112.8 × 31.0 px; Demo: 47.5 × 24.0 px; Privacy:
  57.9 × 24.0 px; Terms: 47.1 × 24.0 px.
* The old `@claim:session-length` command passed in 8.625 seconds without
  measuring a session-duration proxy.
* Live `/404` and `/404.html` returned 200, while an unknown path returned 404.
* The old request assertion accepted every same-origin request, including a
  hypothetical same-origin data POST.

## Repairs

* The app wordmark, footer links, static-404 wordmark, and static-404 navigation
  now have 44 px minimum dimensions. Mobile navigation also keeps 8 px between
  targets. The regression enumerates every visible link, button, and range on
  `/`, `/demo`, `/privacy`, `/terms`, `/404`, and an unknown path at 390 px.
* The session claim now uses an explicit interaction-pacing model: 14 seconds
  for a visual estimate, 16 for pattern recall, 15 for spatial judgment, and
  the generated timing target plus 11 seconds. The tagged test measures all 20
  generated levels and asserts 240–360 seconds with a one-second boundary
  margin. Seed `SS-20260902` measures 295.7 seconds (4.93 minutes).
* New claim `no-server-data` completes all 20 demo levels and permits only
  same-origin, payload-free GET requests for `/demo` and its hashed CSS/JS.
  Any query string, request body, non-GET method, cross-origin request, API
  path, or unlisted asset fails the claim test.
* Azure Static Web Apps now has an explicit `/404` status-only route. Its 404
  response override renders `/404.html`; the invalid combination of rewrite
  and status code is not used. `/404` was removed from the sitemap. A deployment
  regression compares the shipped and source configs and asserts this shape.
* Typecheck and ESLint commands were added so both gates are repeatable.

## Verification evidence

Clean install and local gates:

```text
npm ci                         141 packages, 0 vulnerabilities
npm test                       8/8 passed
npm run typecheck              passed
npm run lint                   passed
npm run build                  passed; dist/ emitted
npm run test:browser           26/26 passed
all 15 claims, run separately  15/15 passed
```

The build contains 19,401 bytes of JavaScript (7.32 KB gzip) and 11,640 bytes
of CSS (3.36 KB gzip), below the 200 KB and 50 KB budgets. Local Lighthouse on
`/demo` scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100
SEO; FCP and LCP were 1,127 ms, TBT was 0 ms, and CLS was 0.

Browser verification covered desktop and 390 × 844 touch layouts, 200% text,
mouse, tap, radio arrows, Space, Enter, range keys, route focus, browser Back,
reduced motion, invalid-storage recovery, demo isolation/reset, offline
completion of a loaded challenge, timing assist, restart, and the full
deterministic end screen. A live keyboard-only run entered the demo from the
first screen and completed all 20 levels. At 390 px, the smallest live app
target was 45.6 × 44 px and the smallest static-404 target was 47.1 × 44 px.

The Playwright axe integration reports zero serious/critical findings on the
active game and results. A separate live axe run also found zero at 390 px.
`verify-url.sh` passed live `/` and `/demo` with one `h1`, one `main`, `lang=en`,
no missing alt text, no unnamed buttons, and no console/page errors.

Live Lighthouse on `/demo` scored 100 in all four categories: FCP 761 ms, LCP
787 ms, TBT 1 ms, and CLS 0. A 120-frame live mobile sample measured 60.003 FPS.

## Privacy, response policy, and live identity

The live full run made exactly three requests: `GET /demo` plus one hashed JS
and one hashed CSS file. All had empty query strings and no request payload.
The already-loaded challenge also completed with the browser offline and no
console errors.

Live `/404` returns 404 with the designed page; an unknown path returns 404.
Known app routes return 200. The physical `/404.html` error document is not
linked or indexed. HTML uses `public, must-revalidate, max-age=30` and returned
304 to an `If-None-Match` check. Hashed assets use one-year immutable caching.
Live CSP restricts connections to self and includes `frame-ancestors 'none'`;
HSTS, `nosniff`, and strict-origin referrer policy are present.

Local and live SHA-256 hashes match exactly:

| File | SHA-256 |
|---|---|
| `index.html` | `20d167ebf64343c1be2b710adb2f88867f586b36621bc853a9c0398e0b595c9b` |
| `assets/index-CZWgbXiP.js` | `c5b592c73bdaa23bd8e2b39093f5d15e7828ec886a8f2decb964dccabcb8a15b` |
| `assets/index-1XiwDg6U.css` | `3e5f6a4802a64ec9cd07a6a5106effccdd7ac8d8594d4ab354e5b078bfff2a30` |

Evidence is in `.factory/evidence-repair-4-*`,
`.factory/evidence-live-repair-4-*`, `.factory/qa-repair-4-*`,
`.factory/qa-live-repair-4-results-desktop.png`, and the local/live Lighthouse
JSON reports.

## Known gaps and next step

No release-blocking gap is known. This remains the intended static browser
game: there is no backend, service worker, account, payment, multiplayer mode,
or package consumer surface. The next step is independent verification of the
deployed repair.
