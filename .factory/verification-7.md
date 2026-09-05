# Verify the daily confidence game — report 7

**Work order:** `sure-shot-verify-7`

**Implementation reviewed:** `dd6c3c4d0ad6e558a08a656592907ed8ec7fb17e`

**Documentation baseline:** `39f9b7305a23128f6f546e1c18d942c44ec90882`

**Live URL:** `https://sure-shot.sociobot.in`

**Verified:** 2026-09-05

**Verdict:** **PASS — 0 findings and 0 untested claims.**

This was a fresh independent verification. Product code was not changed. The
two commits after the implementation change only the verification report and
handoff, so they do not require a different product image. The live HTML,
JavaScript, CSS, and hero image are byte-identical to a clean production build
of the implementation reviewed.

## First screen

Fresh browsers were opened without stored data and without scrolling.

| Viewport | Job | Audience | First action | Active play |
|---|---|---|---|---|
| 1440×900 | **Compare your confidence with your answers** | Curious adults who want a daily mental game | **Try it with sample data** | Challenge 1 starts at 654 px |
| 390×844 touch | **Compare your confidence with your answers** | Curious adults who want a daily mental game | **Try it with sample data** | Challenge strip starts at 665 px; prompt starts at 777 px |

Both screens show the privacy, loaded-offline, and free-play facts. The game is
visible on the first screen, so the page is not a menu wall. The phone page had
no horizontal overflow. Its smallest visible target measured 45.58×44 CSS px.
Fresh desktop and phone screenshots are
`verification-7-first-read-desktop.png` and
`verification-7-first-read-phone.png`.

## Claim commands

A separate clone was checked out at the implementation SHA. `npm ci` installed
141 packages and reported no vulnerabilities. Every command was then run
independently and exactly as declared in `.factory/claims.json`.

| Claim | Exact command | Result |
|---|---|---|
| `complete-game` | `npx playwright test --grep @claim:complete-game` | PASS |
| `restart-game` | `npx playwright test --grep @claim:restart-game` | PASS |
| `daily-challenges` | `npx playwright test --grep @claim:daily-challenges` | PASS |
| `game-length` | `npx playwright test --grep @claim:game-length` | PASS |
| `input-methods` | `npx playwright test --grep @claim:input-methods` | PASS |
| `seed-resume` | `npx playwright test --grep @claim:seed-resume` | PASS |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS |
| `local-scores` | `npx playwright test --grep @claim:local-scores` | PASS |
| `no-server-data` | `npx playwright test --grep @claim:no-server-data` | PASS |
| `loaded-offline` | `npx playwright test --grep @claim:loaded-offline` | PASS |
| `assist-persist` | `npx playwright test --grep @claim:assist-persist` | PASS |
| `assist-seconds` | `npx playwright test --grep @claim:assist-seconds` | PASS |
| `free-play` | `npx playwright test --grep @claim:free-play` | PASS |
| `no-account` | `npx playwright test --grep @claim:no-account` | PASS |
| `fps-60` | `npx playwright test --grep @claim:fps-60` | PASS |
| `daily-result-copy` | `npx playwright test --grep @claim:daily-result-copy` | PASS |
| `build-output` | `npm test -- --testNamePattern @claim:build-output` | PASS |
| `static-routing` | `npx playwright test --grep @claim:static-routing` | PASS |

The repaired `build-output` command selected one tagged test, ran the real
production build, and checked the required static files. Live copy, README,
privacy text, demo notes, and the catalog description were cross-checked
against the manifest. No unlisted, false, incomplete, or untested public claim
was found.

## Live sample and completed game

The home-page sample action opened `/demo` in one touch on a phone and one
click on desktop. It immediately showed the populated visual-estimate game and
the persistent label **Demo — sample data, nothing is saved**, with **Reset
demo** and **Start for real**.

A real-game value was seeded in the fresh browser before entering the sample.
After a sample answer and **Reset demo**, that value was byte-for-byte
unchanged. The reset sample contained `round: 0`, no answers, and
`phase: "answer"`. Starting for real removed the product's demo state and
created a separate `sure-shot:active` game.

A deterministic sample played all 20 challenges: five visual estimates, five
pattern recalls, five timing challenges, and five spatial judgments. It
received 3 **Correct** and 17 **Not this time** outcomes, then reached the real
completed-loss result screen:

- score: **3/20**;
- four populated confidence and accuracy rows;
- one retry-free takeaway;
- the calibration explanation;
- a copied daily result containing the code, score, and four gaps, with no
  answers;
- a fresh-practice restart returning to challenge 1 with no answers.

The result is recorded in `verification-7-end-screen.png`; the populated
sample start is in `verification-7-demo-start.png`.

## Normal, boundary, invalid, and recovery checks

- Empty submission stayed disabled.
- Radio arrows changed both focus and selection. Space, Enter, mouse, and real
  touch input worked.
- The confidence range reached its exact 50% and 100% boundaries by keyboard.
- Feedback state survived reload.
- Invalid JSON and a structurally incomplete saved object were removed. Both
  showed **Your saved game could not be restored. A fresh game has started.**
- Timing assist added exactly 1.5 seconds and persisted after reload.
- A 2.8-second timing attempt reached **Correct — Your answer held up.**
- A one-second simulated hidden-tab wait produced only 0.58 seconds of elapsed
  game time around 0.6 seconds of visible play. The timer therefore pauses
  while hidden.
- Reduced-motion pattern recall kept the pattern visible until the explicit
  hide action. No answer appeared early; all three choices then had text
  alternatives.
- A loaded challenge produced feedback after the browser went offline.
- Browser Back restored the Privacy page, focused its `h1`, and announced
  **Now viewing: Privacy for a local game**. Forward returned to the demo.
- The 390 px layout did not overflow with the repository's 200% text check.

The product promises only loaded-challenge offline completion. It has no
service worker and makes no offline-reload or update claim.

## Accessibility and site structure

| Route | HTTP | Title | Axe violations |
|---|---:|---|---:|
| `/` | 200 | Sure Shot — Compare confidence with answers | 0 |
| `/demo` | 200 | Demo — Sure Shot | 0 |
| `/privacy` | 200 | Privacy — Sure Shot | 0 |
| `/terms` | 200 | Terms — Sure Shot | 0 |
| `/404` | 404 | Page not found — Sure Shot | 0 |
| unknown address | 404 | Page not found — Sure Shot | 0 |

The deliberate 404 responses are expected. Both pages are designed and link
back to the game; `verification-7-404-phone.png` records the phone version.
Every checked route had `lang="en"`, one `h1`, one `main`, header, navigation,
footer, route-specific metadata, a canonical URL, no image missing `alt`, and
no horizontal overflow. All linked destinations and crawler assets returned
their expected status.

The first Tab reached **Skip to main content** with a 4 px moss focus outline.
The phone controls met the 44 px target minimum. Pattern and spatial challenges
included non-color descriptions. The chart exposed text labels and values.
There were no console or page errors.

The factory URL verifier passed `/` and `/demo`. Its reports are in
`evidence-verification-7-root/` and `evidence-verification-7-demo/`.

## Privacy, performance, and live identity

The live completed game made only same-origin, payload-free GET requests for
the page and static assets. It made no request with a query string. No
analytics, third-party script, API, account, payment, multiplayer, or external
integration is present. The privacy page explains local storage and how to
clear it. Backend tenant isolation, SQLite restart persistence, health, 429
responses, and `Retry-After` do not apply to this static product.

Fresh Lighthouse 13 results on live `/demo`:

| Measure | Result |
|---|---:|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First contentful paint | 786 ms |
| Largest contentful paint | 824 ms |
| Total blocking time | 23 ms |
| Cumulative layout shift | 0 |

The fresh phone browser measured 60 FPS across 120 animation frames. The clean
build emitted 21,752 bytes of JavaScript and 12,323 bytes of CSS. The hero is
125,042 bytes. These are inside the required budgets.

Live headers include HSTS, `nosniff`, strict-origin referrer policy, and the
self-only CSP with `frame-ancestors 'none'`. Hashed assets use one-year
immutable caching.

| File | Live and clean-build SHA-256 |
|---|---|
| `index.html` | `7135533e54984d8dda149048f0f856eefc20734944d8011d372a7de13fc2d6c4` |
| `assets/index-ezRoUGo-.js` | `a3120d3035d8b168a82b0a40bcd9d1c9ade5aaa562298f28dfbd30b528295f6d` |
| `assets/index-gmYMhl2G.css` | `af8633d3e700b9727af25657c94476f2c5dca0aba80e565d2daee69b74cce5a1` |
| `sure-shot-hero.webp` | `bad320fed4af43502253cedb451e53938bccb9cbe0b64147cf6178a3a2d23764` |

## Earlier finding disposition

Every earlier finding, including all 16 minor review items, was inspected.

| Earlier finding | Current proof | Disposition |
|---|---|---|
| Review F-1-1 | Home includes **How to play** and **What Sure Shot does not do** | Fixed |
| Review F-1-2 | Original hero art is visible and disclosed | Fixed |
| Review F-1-3 | Every route has matching Open Graph and Twitter metadata | Fixed |
| Review F-1-4 | Static 404 has the standard footer and legal links | Fixed |
| Review F-1-5 | Shared skip link says **Skip to main content** | Fixed |
| Review F-1-6 | Demo label uses the exact sample-data wording | Fixed |
| Review F-1-7 | Product copy uses game and challenge consistently | Fixed |
| Review F-1-8 | Headline names the comparison job plainly | Fixed |
| Review F-1-9 | README does not use “pacing budget” | Fixed |
| Review F-1-10 | README explains the daily code without generator jargon | Fixed |
| Review F-1-11 | README explains the frame test in plain words | Fixed |
| Review F-1-12 | README says “home page,” not “root” | Fixed |
| Review F-1-13 | README explains demo separation before storage details | Fixed |
| Review F-1-14 | README sentences meet the copy limit | Fixed |
| Review F-1-15 | Build and routing claims are listed and their exact commands pass | Fixed |
| Review F-1-16 | Spoiler-free result copy and denial recovery are tested | Fixed |
| Verification 2: unplayable patterns | Five pictured pattern challenges have three distinct described options | Fixed |
| Verification 2: insufficient daily content | Two codes produce distinct deterministic 20-challenge games | Fixed |
| Verification 2: root menu wall | Active Challenge 1 is visible on desktop and phone | Fixed |
| Verification 2: missing FPS proof | Tagged claim passes; live phone measured 60 FPS | Fixed |
| Verification 2: initial focus | First Tab reaches the skip link | Fixed |
| Verification 3: missing audience | First screen names curious adults | Fixed |
| Verification 3: inaccessible visual challenges | Descriptions, arrows, focus, reduced motion, and text zoom pass | Fixed |
| Verification 3: incomplete claim coverage | All published behavior is inventoried and all exact commands pass | Fixed |
| Verification 3: malformed storage crash | Invalid and incomplete storage recover visibly | Fixed |
| Verification 3: soft 404 | Direct and unknown addresses return HTTP 404 | Fixed |
| Verification 3: shared demo title | `/demo` title is **Demo — Sure Shot** | Fixed |
| Verification 4: small touch targets | Minimum measured target is 45.58×44 px | Fixed |
| Verification 4: unmeasured duration | Tagged test enforces 240–360 planned seconds | Fixed |
| Verification 4: missing no-server claim | Full-game payload-aware request test passes | Fixed |
| Verification 4: direct `/404` returned 200 | Live direct `/404` returns designed HTTP 404 | Fixed |
| Verification 6 F-6-1 | Exact supported `--testNamePattern` command passes | Fixed |

## Clean-checkout quality gates

| Command | Result |
|---|---|
| `npm ci` | PASS — 141 packages, 0 vulnerabilities |
| `npm test` | PASS — 9 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npx playwright test` | PASS — 31 tests |
| `npm run build` | PASS — `dist/` emitted |

There are no findings, untested claims, or known product gaps.
