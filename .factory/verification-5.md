# Independent verification 5 — PASS

**Candidate:** `9eb15c88d4fb60435045e90d4882da47a68cf70e`  
**Live URL:** `https://sure-shot.sociobot.in`  
**Verified:** 2026-09-02  
**Verdict:** **PASS — ready to release.**

This was a clean-checkout, independent verification. Product source was not changed. The live HTML and hashed JS/CSS are byte-identical to a fresh production build of the candidate.

## Required first checks

`npm ci` completed (141 packages, zero reported vulnerabilities). Before general QA, every command listed in `.factory/claims.json` was executed separately through the configured local production-like `/demo` entry point. All passed:

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
| no-server-data | `npx playwright test --grep @claim:no-server-data` | 1 passed |
| loaded-offline | `npx playwright test --grep @claim:loaded-offline` | 1 passed |
| assist-persist | `npx playwright test --grep @claim:assist-persist` | 1 passed |
| assist-seconds | `npx playwright test --grep @claim:assist-seconds` | 1 passed |
| free-play | `npx playwright test --grep @claim:free-play` | 1 passed |
| no-account | `npx playwright test --grep @claim:no-account` | 1 passed |
| fps-60 | `npx playwright test --grep @claim:fps-60` | 1 passed |

Cold-opening the live root in a new context gave the following first read:

* **What it does:** “Calibrate confidence with visual challenges.”
* **For whom:** “For curious adults who want a daily mental game that compares confidence with answers.”
* **What to click first:** **Try it with sample data**, followed by an explanation that it opens an isolated 20-level game.

The cold screen supplied the three privacy, offline, and price facts and showed Level 1's actual visual-estimate challenge. It passes the plain-word and one-click demo gates; it is not a menu wall.

## Local quality gates

| Check | Result |
|---|---|
| `npm test` | 8/8 passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run build` | passed; `dist/` emitted |
| `npx playwright test` | 26/26 passed |

The production bundle is 19,401 bytes JS (7.32 KB gzip) and 11,638 bytes CSS (3.36 KB gzip). A fresh mobile Lighthouse run on live `/demo` scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO; FCP and LCP were each 0.9 s, TBT 60 ms, CLS 0.

## Live end-to-end game QA

A fresh live `/demo` run completed all 20 deterministic levels: five visual estimates, five pattern recalls, five timing challenges, and five spatial judgments. It reached **See how your confidence matched**, with a 6/20 scripted score, four confidence-versus-accuracy rows, a retry-free takeaway, the optional calibration explanation, and **Play a fresh practice run**. Restart reset stored demo state to `round: 0`, an empty answer list, and `phase: "answer"`.

The goal is to compare stated confidence to actual answers. Each challenge has observable correct/incorrect feedback (**Your answer held up** / **Not this time**) before the calibration result; the completed run deliberately ends in a score and calibration summary rather than a binary judgment. Timing assist persisted after reload and adds exactly 1.5 seconds. The daily seed, unfinished-run resume, pointer/touch/keyboard inputs, and loaded-challenge offline recovery all passed dedicated claim tests.

Keyboard-only smoke testing reached the skip link, radio selection (Space and arrows), confidence range, submit (Enter), and next-level controls. The focused skip link has a visible `rgb(49, 91, 72) solid 4px` outline. Under reduced motion, the pattern remains visible until the explicit hide action, reports no animation, and leaves no answer choices prematurely available. At 390x844, there was zero horizontal overflow, every visible live control measured at least 44 px in both dimensions, and simulated 200% text also had zero overflow.

Live axe-core injection found zero serious or critical violations on the active demo and results screens. The repository does not contain `verify-url.sh`; equivalent live checks found `lang=en`, one `h1`, one `main`, named controls, no missing image alternatives, and no console or page errors.

## Privacy, deployment, and response policy

During the full live demo run, exactly three requests occurred: `GET /demo` and the hashed same-origin JS and CSS assets. All were payload-free, had no query string, and had origin `https://sure-shot.sociobot.in`; no console/page errors occurred. Demo state stayed in `demo:*` localStorage. The static product has no backend, account, payment, service worker, sign-in, or API endpoint, so API 429, concurrency, Entra, PWA-update, and consumer-package checks are not applicable.

Known routes `/`, `/demo`, `/privacy`, and `/terms` returned 200. `/404` and an unknown path returned a designed 404 with HTTP 404. HTML has `public, must-revalidate, max-age=30`; hashed JS has `public, max-age=31536000, immutable`. Live headers include a self-only CSP with `connect-src 'self'` and `frame-ancestors 'none'`, HSTS, `nosniff`, and a strict-origin referrer policy.

| File | SHA-256 (local build and live) |
|---|---|
| `index.html` | `20d167ebf64343c1be2b710adb2f88867f586b36621bc853a9c0398e0b595c9b` |
| `assets/index-CZWgbXiP.js` | `c5b592c73bdaa23bd8e2b39093f5d15e7828ec886a8f2decb964dccabcb8a15b` |
| `assets/index-1XiwDg6U.css` | `3e5f6a4802a64ec9cd07a6a5106effccdd7ac8d8594d4ab354e5b078bfff2a30` |

## Defects by severity

No P0, P1, P2, or P3 defects were found in this candidate.
