# Independent verification 4 — FAIL

**Candidate:** `b9dd20f293afcfddf1c694ee0566679cb6cf2d8b`

**Verified URL:** `https://sure-shot.sociobot.in`

**Date:** 2026-09-02

**Verdict:** **FAIL — release blocked.**

The game works end to end and the live application assets exactly match the
candidate build. The cold first-read gate passes, all declared claim commands
pass, and the real end screen is reachable. The candidate still violates the
non-negotiable mobile touch-target baseline and the claims contract. The live
`/404` response also differs from the repository test's required status.

## Cold first read

The live root was opened in a fresh browser context before broader QA.

* **What it does:** “Calibrate confidence with visual challenges.”
* **For whom:** “For curious adults who want a daily mental game that compares
  confidence with answers.”
* **What to click first:** **Try it with sample data**, followed immediately by
  “Open an isolated 20-level game. It will not change this run.”

The first screen also shows three plain privacy/connection/price facts and the
active first challenge. At 390 px, the first challenge heading begins at
`y=739.14` in an 844 px viewport, so the captured screen shows the game rather
than a menu wall. The one-click action opens `/demo` with the persistent
**Demo — sample game, nothing is saved** banner. Evidence:
`evidence-verify-4-root/screenshot-desktop.png`,
`evidence-verify-4-root/screenshot-mobile.png`, and
`qa-verify-4-first-read-mobile.png`.

## Release-blocking defects

### P1 — Several mobile links are smaller than the required 44 px touch target

Measurements in a 390×844 mobile Chromium context found:

| Route/control | Measured CSS box |
|---|---:|
| Header home wordmark on `/`, `/demo`, `/privacy`, `/terms` | 112.8×39.6 px |
| Footer Privacy link on those routes | 51.0×16.0 px |
| Footer Terms link on those routes | 41.5×16.0 px |
| Static 404 home wordmark | 112.8×31.0 px |
| Static 404 Demo link | 47.5×24.0 px |
| Static 404 Privacy link | 57.9×24.0 px |
| Static 404 Terms link | 47.1×24.0 px |

The attached accessibility and design contracts require every touch/click
target to be at least 44×44 CSS px. The repository regression named “visible
controls meet touch target size” checks only `button` and range `input`
elements, so it misses every undersized link above. This is a release-blocking
manual accessibility finding even though axe reports no serious/critical
violations.

### P1 — The 4–6 minute quantitative claim is not measured by its claim test

`.factory/claims.json` publishes: “A full daily game has 20 levels planned for
4–6 minutes.” Its tagged test checks the visible label, the progress maximum,
and that 20 scripted levels can be completed. It never measures or asserts a
4–6 minute duration or a defined proxy with a margin. The exact claim command
passes in about 10.4 seconds because it automates the run. Under the claims
contract, quantitative claims must measure and assert the published number.

The product must either add a meaningful measured definition for the 4–6
minute claim or remove the duration claim from the product and README.

### P1 — The stronger no-server-data claim is absent from the manifest

README says the game has “no ... server API,” and `/privacy` says it “does not
send game answers, confidence, or identity to a server.” The closest manifest
entry, `local-scores`, only lists no analytics or third-party requests. Its
test permits every same-origin request and therefore would still pass if game
data were posted to a same-origin API. The stronger published no-server
transmission promise is neither listed nor directly asserted.

Independent live evidence is favorable: the entire 20-level run requested only
the root document, `/demo`, and the two same-origin hashed assets, with no API
request. The defect is the incomplete required claim inventory/test, not an
observed data leak.

## Other defect

### P2 — The live `/404` route returns HTTP 200

`https://sure-shot.sociobot.in/does-not-exist` correctly returns the designed
page with HTTP 404. Direct `/404` and `/404.html` requests return HTTP 200.
This contradicts the repository browser test, which explicitly expects `/404`
to return 404, and the prior handoff's statement that `/404` returns 404. The
local test server masks the Azure Static Web Apps behavior. The shipped sitemap
also lists `/404` as a regular route.

## Claims gate run first

The clone was clean and exactly at the candidate before testing. After the
required `npm ci`, every command in `.factory/claims.json` was run separately
through the configured production-like demo entry point.

| Claim | Exact command | Result |
|---|---|---|
| complete-run | `npx playwright test --grep @claim:complete-run` | 1 passed |
| restart-run | `npx playwright test --grep @claim:restart-run` | 1 passed |
| daily-levels | `npx playwright test --grep @claim:daily-levels` | 1 passed |
| session-length | `npx playwright test --grep @claim:session-length` | 1 passed |
| input-methods | `npx playwright test --grep @claim:input-methods` | 1 passed |
| seed-resume | `npx playwright test --grep @claim:seed-resume` | 1 passed |
| demo-isolation | `npx playwright test --grep @claim:demo-isolation` | 1 passed |
| local-scores | `npx playwright test --grep @claim:local-scores` | 1 passed |
| loaded-offline | `npx playwright test --grep @claim:loaded-offline` | 1 passed |
| assist-persist | `npx playwright test --grep @claim:assist-persist` | 1 passed |
| assist-seconds | `npx playwright test --grep @claim:assist-seconds` | 1 passed |
| free-play | `npx playwright test --grep @claim:free-play` | 1 passed |
| no-account | `npx playwright test --grep @claim:no-account` | 1 passed |
| fps-60 | `npx playwright test --grep @claim:fps-60` | 1 passed |

Passing commands do not override the two claims-contract findings above.

## End-to-end game evidence

A fresh live root was opened, **Try it with sample data** was activated, and a
deterministic run played all 20 levels to **See how your confidence matched**.
The run exercised five visual estimates, five pattern recalls, five timing
levels, and five spatial judgments. It reached a real `6/20` result, displayed
four confidence/accuracy rows, produced a retry-free takeaway, and opened the
calibration explanation. Evidence: `qa-verify-4-results-desktop.png`.

The run demonstrated both outcomes: exact-target timing produced **Correct —
Your answer held up**, while an immediate stop produced **Not this time** and
the correct ±0.45-second condition. The assist changed a target from 3.9 to
5.4 seconds, exactly 1.5 seconds.

**Play a fresh practice run** reset storage to level 1, zero answers, and
`phase: answer`. Assist mode and the first feedback state persisted through a
reload. **Reset demo** removed demo settings and created a fresh demo run;
**Start for real** removed every `demo:*` key and created only
`sure-shot:active`.

Normal, boundary, invalid, and recovery paths passed:

* Submit is disabled until an answer is selected.
* Confidence reaches exactly 50% and 100% from the keyboard.
* Invalid JSON and the structurally incomplete `{"seed":"SS-20260902"}`
  payload are cleared, announced, and replaced with a usable game without an
  exception.
* A loaded challenge can be finished after the browser context is taken
  offline.
* Pattern recall under reduced motion retains the target until the player
  explicitly hides it; answer choices are unavailable before that action.
* Pattern and spatial choices expose full non-color text descriptions.
* The displayed seed was `SS-20260902`; the claim suite played and compared
  all 20 observable levels for `SS-20260902` and `SS-20260903`.

Keyboard-only navigation reached the sample action from the cold root, entered
demo, completed the full run, opened the explanation, and restarted. Radio
arrows, Space, Enter, range keys, mouse click, and mobile tap all worked. Route
changes and browser Back focused the destination `h1`. The focus outline was
4 px moss on chalk and passed the repository's 3:1 contrast assertion.

## Accessibility and responsive QA

Live axe-core injection found zero serious or critical violations on both the
active demo and result screen. Factory `verify-url.sh` passed `/` and `/demo`:
`lang=en`, one `h1`, one `main`, no missing image alternatives, no unnamed
buttons, and no console/page errors. Reports and captures are in
`evidence-verify-4-root/` and `evidence-verify-4-demo/`.

At 390 px there was no horizontal overflow. At simulated 200% text, document
width remained 390 px and all header navigation stayed within the viewport.
Zoom is not disabled. Reduced motion is respected. The touch-target exception
is the P1 finding above.

## Performance, privacy, and deployment

Lighthouse 13 mobile on live `/demo` (`lighthouse-verify-4.json`):

| Category/metric | Result |
|---|---:|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 861 ms |
| LCP | 923 ms |
| Total blocking time | 92.5 ms |
| CLS | 0 |

The active timing loop measured **60.002 FPS** across 120 frames at 390 px;
the declared 60-frame check measured **60.006 FPS**, above its 55 FPS margin.
Production output is 19,196 bytes JS (7,273 gzip) and 11,326 bytes CSS (3,319
gzip), within the 200 KB and 50 KB budgets. The hero is 125,042 bytes.

The full live flow made no cross-origin requests and no requests after the
static document/hashed assets and `/demo` navigation. It produced no console
or page errors. Demo storage stayed under `demo:*`; real storage stayed under
`sure-shot:*`.

Live headers include CSP with `connect-src 'self'` and `frame-ancestors
'none'`, HSTS, `nosniff`, and strict-origin referrer policy. HTML uses
`public, must-revalidate, max-age=30` and conditional requests return 304.
Hashed JS/CSS use `public, max-age=31536000, immutable` and Brotli encoding.

Fresh local and live SHA-256 hashes are identical:

| File | SHA-256 |
|---|---|
| `index.html` | `b703f38b713bdbb8c75fbdb97b0964d71157f751c8079bfd5000ff53d3ad3ee3` |
| `assets/index-BQSy8QLR.js` | `ecc8cd6393f896471257fca73c935776c3c082c5e8b5debdce4131e23c8eb739` |
| `assets/index-Hde-0Hgs.css` | `b63bf131c7fa46293136314f72e4f254870454ec5e184d5d177f2416ece119a2` |

This proves that the live application assets match candidate
`b9dd20f293afcfddf1c694ee0566679cb6cf2d8b`; there is no deployment-only asset
failure to excuse the findings.

## Local quality gates

| Check | Result |
|---|---|
| `npm ci` | Passed; 59 packages, 0 vulnerabilities |
| `npm test` | Passed; 6/6 unit tests |
| `npm run test:browser` | Passed; 25/25 Playwright tests |
| Type check | Passed as the `tsc` stage of `npm run build` |
| Lint | No lint script is available |
| `npm run build` | Passed; emitted `dist/` |

The product is static and has no service worker, backend/API endpoints,
sign-in, payment, CLI/library package, or multiplayer mode. PWA offline reload,
API concurrency/persistence, 429/`Retry-After`, Entra authority, and consumer
package checks are therefore not applicable.

## Required before acceptance

1. Make every interactive link, including footer and static-404 navigation,
   at least 44×44 CSS px and expand the regression to include links.
2. Measure the stated 4–6 minute session duration in its tagged sandbox test,
   or remove that duration claim.
3. List and test the published no-server-data promise so same-origin data
   transmission would fail the test.
4. Make direct `/404` return HTTP 404 in production and add a live-compatible
   regression for the deployed host behavior.
