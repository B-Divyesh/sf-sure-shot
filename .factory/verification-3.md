# Independent verification 3 — FAIL

**Candidate:** `90531b850c23d6a13cfc484dc8d213828d0291fd`

**Verified URL:** `https://sure-shot.sociobot.in`

**Date:** 2026-09-02

**Verdict:** **FAIL — release blocked.**

The live deployment is healthy and its HTML, JavaScript, and CSS match the
candidate's fresh production build byte for byte. The candidate nevertheless
fails the mandatory cold first-read gate, manual accessibility requirements,
and the claims contract.

## Cold first read

Cold desktop and 390 px captures are in `qa-first-read-desktop.png` and
`qa-first-read-mobile.png`.

* **What it does:** “Play today’s 20 visual challenges and compare your
  confidence with your answers.”
* **For whom:** not stated anywhere on the first screen.
* **What to click first:** **Try it with sample data** is visible and opens the
  isolated demo in one click.

The first screen does show the active game rather than a menu wall. However,
the missing audience alone triggers the work order's explicit first-read FAIL.
The mandatory plain-words shape is also incomplete: the `h1` is the challenge
question rather than a job headline, there is no adjacent explanation of what
the sample-data action does, and the required three privacy/offline/price facts
are absent.

## Release-blocking defects

### P1 — The first screen does not say who the game is for

The intended audience in the brief is curious adults who want a daily mental
game about confidence calibration. The only introductory live sentence says
what the game does. It never names that audience. This fails the mandatory
first-read acceptance gate even though the one-click demo and active game are
present.

### P1 — Visual challenges are not fully accessible

Manual checks found failures not detected by the automated axe scan:

* On a spatial-judgment level, the accessibility tree for the target contains
  only `↻`; answer controls are named only “Option A/B/C”. A screen-reader user
  receives no description of the starting or answer shapes and cannot solve
  the challenge. This violates the brief's non-colour alternative constraint.
* With `prefers-reduced-motion: reduce`, a pattern-recall target is removed
  immediately. At 50 ms the “Remember this pattern” image count is zero and
  only “Choose the pattern you saw” remains. The reduced-motion treatment
  makes that challenge impossible instead of providing a static/manual path.
* The designed 4 px focus ring is `#f1bd43`. Its contrast against the paper
  background is **1.49:1** and against the chalk surface is **1.67:1**, below
  the required 3:1. `qa-live-focus.png` captures the focused skip link.
* At 200% text sizing in a 390 px viewport, document width becomes **470 px**.
  The Terms navigation link ends at x=470, forcing horizontal scrolling.
  Evidence: `qa-live-text-200.png`.
* Answer controls use `role="radio"`, but ArrowRight leaves focus and selection
  on the first item. Space works, but the custom radio group lacks required
  arrow-key behavior.

### P1 — Published claims are missing or not proved by their tagged tests

Every command in `.factory/claims.json` passes, but the inventory is incomplete.
README and live copy additionally promise a 4–6 minute session, keyboard/mouse/
touch play, an unfinished seed stable across midnight, a fixed 60 Hz simulation,
and a timing assist that adds 1.5 seconds. Those visitor-relevant claims have no
corresponding manifest entries and tagged sandbox tests.

The tagged `@claim:daily-levels` test also does not prove its own stated claim.
It sees “Level 1 of 20”, reads the displayed seed, deletes storage, and reloads
on the same date. It neither reaches level 20 nor changes the date and compares
observable challenges. Untagged unit tests inspect the generator, but the exact
manifest command runs only the tagged Playwright test. Under the attached
claims contract, unlisted claims and a claim test that does not assert the
promised outcome are release blockers.

## Other defects

### P2 — A structurally malformed saved run blanks the app

Invalid JSON is recovered safely. Valid JSON with a `seed` but missing run
fields is accepted, then the page renders no `main` or `h1` and raises
`Cannot read properties of undefined (reading 'kind')`. Stored state needs
schema validation and a recoverable reset path.

### P2 — Unknown routes are soft 404s

`/not-a-real-route` returns HTTP **200** and the SPA renders its not-found page.
`/404` also returns 200. This is not a real 404 response as required by the
site-structure contract.

### P2 — The demo route does not have a route-specific document title

Both `/` and `/demo` render `Level 1 of 20 — Sure Shot`. The site-structure
contract requires a distinct demo title (for example, `Demo — Sure Shot`) and
the standard product-name-first title pattern.

## Claims run first from the clean checkout

The checkout was clean and exactly at the candidate before testing. After
`npm ci`, all eight manifest commands ran separately through the configured
production-like demo entry point:

| Claim | Exact command | Result |
|---|---|---|
| complete-run | `npx playwright test --grep @claim:complete-run` | 1 passed |
| restart-run | `npx playwright test --grep @claim:restart-run` | 1 passed |
| daily-levels | `npx playwright test --grep @claim:daily-levels` | 1 passed |
| local-scores | `npx playwright test --grep @claim:local-scores` | 1 passed |
| assist-persist | `npx playwright test --grep @claim:assist-persist` | 1 passed |
| free-play | `npx playwright test --grep @claim:free-play` | 1 passed |
| no-account | `npx playwright test --grep @claim:no-account` | 1 passed |
| fps-60 | `npx playwright test --grep @claim:fps-60` | 1 passed |

## End-to-end game evidence

A fresh live `/demo` run was scripted from level 1 through all 20 levels and
reached the real **“See how your confidence matched”** screen. The run exercised
five visual estimates, five pattern recalls, five timing levels, and five
spatial judgments. It finished at **6/20**, showed all four confidence/accuracy
rows, produced the one-takeaway text, opened the calibration explanation, and
saved the result only under `demo:*`. Evidence is in
`qa-live-results-desktop.png` and `qa-live-pattern.png`.

The game goal and challenge are clear. Correct answers receive “Your answer
held up”; incorrect answers receive “Not this time”. Completion always leads to
calibration, so these per-level states are its only win/loss feedback; there is
no run-level win or loss outcome. **Play a fresh practice run** reset the saved
run to level 1, `answers: []`, and `phase: answer`.

Normal, boundary, and recovery checks:

* The answer lock stays disabled until a choice is made.
* The confidence range reaches exactly 50% and 100% by keyboard.
* A target-3.9-second timing attempt displayed 3.90 s and was judged correct;
  an immediate stop was judged incorrect.
* Mouse click, keyboard Space/Enter, slider keys, and touchscreen tap work.
* Timing assist persists after reload. Reset demo clears demo settings and
  starts level 1. Start for real removes all `demo:*` keys and creates only a
  `sure-shot:active` run.
* Active run progress and result state survive reload. Malformed-state recovery
  has the P2 exception above.
* The deterministic displayed seed was `SS-20260902`.
* The measured 390 px Chromium requestAnimationFrame sample was
  **60.006 FPS**, above the manifest's 55 FPS acceptance margin.

The product has no audio, sign-in, account, payment, service worker, PWA claim,
server endpoint, or multiplayer mode. Therefore Entra identity, offline reload,
API concurrency/persistence, and 429/`Retry-After` allowance checks do not apply.

## Local quality gates

| Check | Result |
|---|---|
| `npm ci` | Passed; 59 packages, 0 vulnerabilities |
| `npm test` | Passed; 5/5 unit tests |
| `npm run test:browser` | Passed; 16/16 Playwright tests |
| Type check | Passed as the `tsc` stage of `npm run build` |
| Lint | No lint script is available |
| `npm run build` | Passed; emitted `dist/` |

Production output is 16,102 bytes JS (6,256 gzip) and 10,231 bytes CSS
(3,081 gzip), below the 200 KB JS and 50 KB CSS budgets. The generated hero is
125,042 bytes and the 1200×630 social card is 118,744 bytes.

Factory `verify-url.sh` passed on `/` and `/demo`: `lang=en`, one `h1`, one
`main`, no missing image alt text, no unnamed buttons, and no console/page
errors. Reports and captures are in `evidence-verify-3-root/` and
`evidence-verify-3-demo/`. Live axe injection returned no serious or critical
violations on the game and results screens.

Lighthouse 13 mobile results for `/demo` (full report:
`lighthouse-verify-3.json`): Performance 100, Accessibility 100, Best Practices
100, SEO 100; FCP 0.9 s, LCP 0.9 s, TBT 60 ms, CLS 0.

## Privacy, headers, caching, and deployment identity

A full live run, reloads, and navigation requested only the same-origin HTML,
hashed JS, CSS, and favicon. There were no analytics, third-party requests,
console errors, or page errors. The demo used only `demo:active` and
`demo:settings`; switching to real play removed those keys.

Live document headers include:

* `Content-Security-Policy` with `connect-src 'self'` and
  `frame-ancestors 'none'`
* `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`
* `X-Content-Type-Options: nosniff`
* `Referrer-Policy: strict-origin-when-cross-origin`
* HTML caching: `public, must-revalidate, max-age=30`
* Hashed asset caching: `public, max-age=31536000, immutable`

Fresh local and live SHA-256 hashes are identical:

| File | SHA-256 |
|---|---|
| `index.html` | `f060b712bcf79429232dcf31c3467092d8a1e526e6b2f09d74b76ce4328be459` |
| `assets/index-DRn0yAHM.js` | `5bc9f5f4c1360560ecb50f01bb79c10c6146eb388c6c55c1d4f82daf2ba97c31` |
| `assets/index-D3_FpxwI.css` | `649d4cc1637895dba0104bf9326aa57624607f8c5d5d95275b4afc662e76779e` |

This proves the live deployment is candidate
`90531b850c23d6a13cfc484dc8d213828d0291fd`; there is no deployment-only
failure to excuse the product findings.

## Required before re-verification

1. Put the intended user in plain words on the active first screen and complete
   the required first-screen facts/action explanation without hiding the game.
2. Add meaningful screen-reader descriptions for spatial targets/options and a
   usable reduced-motion pattern-recall path.
3. Give the focus indicator at least 3:1 contrast, implement radio arrow keys,
   and prevent horizontal overflow at 200% text sizing.
4. Inventory every published claim and ensure each tagged manifest test proves
   the observable statement, especially daily 20-level/date variation.
5. Validate restored state before use and return real 404 status codes.
