# Review 2 — Compare confidence with answers

**Work order:** `sure-shot-review-2`  
**Implementation reviewed:** `dd6c3c4d0ad6e558a08a656592907ed8ec7fb17e`  
**Documentation baseline:** `88e1b447bc4497ca3e3038ab083564f7647afb8a`  
**Live URL:** `https://sure-shot.sociobot.in`  
**Reviewed:** 2026-09-05

## Verdict

**PASS — 0 findings and 0 untested claims.**

The implementation candidate was tested from a fresh detached checkout. Later
documentation commits do not alter the product image. Freshly built
`index.html`, JavaScript, and CSS exactly match the live files.

## First screen

Fresh storage-free browsers were opened without scrolling.

| Browser | Job | Audience | First action | Game on screen |
|---|---|---|---|---|
| Desktop, 1440×900 | Compare your confidence with your answers | Curious adults who want a daily mental game | Try it with sample data | Challenge 1 is present below the first-read panel |
| Phone, 390×844 touch | Compare your confidence with your answers | Curious adults who want a daily mental game | Try it with sample data | Challenge strip is visible; the challenge starts in the first screen |

Both screens show the three concrete facts: scores stay in the browser, a
loaded challenge can finish offline, and play is free. The game is not a menu
wall. Captures: `review-2-first-read-desktop.png` and
`review-2-first-read-phone.png`.

## Sample game and completed run

**Try it with sample data** opened `/demo` in one click and immediately showed
a populated visual-estimate challenge. The persistent label was exactly
**Demo — sample data, nothing is saved** and included **Reset demo** and
**Start for real**.

The deterministic run played all 20 challenges with reduced motion enabled:
five visual estimates, five pattern recalls, five timing challenges, and five
spatial-judgment challenges. It reached the actual result screen with a
completed-loss score of **3/20**, four populated confidence/accuracy rows, a
one-takeaway result, calibration explanation control, spoiler-free result
copy, and fresh-practice restart. A pre-existing real-game value was unchanged
throughout the demo; reset returned the demo to Challenge 1 and retained the
label. Evidence: `review-2-demo-start.png` and `review-2-end-screen.png`.

The clean browser suite covered disabled empty submission; 50% and 100%
confidence boundaries; pointer, touch, Space, Enter, and radio-arrow input;
reload persistence; malformed local-state recovery; assist persistence and its
exact 1.5 s effect; hidden-tab pause; reduced-motion pattern recall; loaded
offline completion; clipboard-denial recovery; and history/focus restoration.

## Claims and clean quality gates

`npm ci` ran in a fresh worktree at the implementation SHA (141 packages, 0
vulnerabilities). Every declared command was run separately and passed.

| Claims | Result |
|---|---|
| complete-game, restart-game, daily-challenges, game-length | PASS |
| input-methods, seed-resume, demo-isolation, local-scores | PASS |
| no-server-data, loaded-offline, assist-persist, assist-seconds | PASS |
| free-play, no-account, fps-60, daily-result-copy | PASS |
| build-output | PASS — `npm test -- --testNamePattern @claim:build-output` |
| static-routing | PASS |

Each of the 18 manifest IDs occurs exactly once as an `@claim:` test tag.
Live copy, README, privacy/terms copy, demo notes, and catalog description were
cross-checked against the manifest. No unlisted public claim was found.

```text
npm test                 9 passed
npm run typecheck        passed
npm run lint             passed
npx playwright test      31 passed
npm run build            passed; dist/ emitted
```

The build contains 21,752 bytes of JavaScript (7.97 kB gzip) and 12,323 bytes
of CSS (3.54 kB gzip).

## Accessibility, routes, privacy, and performance

The factory URL checker passed both `/` and `/demo` with `lang=en`, one
`h1`, a `main`, no missing image alt text, no unnamed buttons, and no
console errors. Fresh axe checks found zero violations on `/`, `/demo`,
`/privacy`, `/terms`, `/404`, and an unknown address. The phone run had no
horizontal overflow; its smallest visible control was 45.58×44 CSS px. The
fresh mobile FPS measurement was **60.003 FPS**, above the advertised 55 FPS
acceptance margin.

| Route | HTTP | Title |
|---|---:|---|
| `/` | 200 | Sure Shot — Compare confidence with answers |
| `/demo` | 200 | Demo — Sure Shot |
| `/privacy` | 200 | Privacy — Sure Shot |
| `/terms` | 200 | Terms — Sure Shot |
| `/404` | 404 | Page not found — Sure Shot |
| unknown address | 404 | Page not found — Sure Shot |

The 404 responses are deliberate and render the designed recovery page, so they
are expected behavior rather than defects. The live `/demo` headers include
HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
self-only CSP with `frame-ancestors 'none'`.

The complete live run made only same-origin, payload-free GET requests for the
document, hashed CSS/JS, and local hero image. There is no backend, account,
payment, analytics, third-party request, multiplayer mode, service worker,
update claim, or API. Backend tenant isolation, SQLite restart checks, health
checks, 429/`Retry-After`, offline reload, and installed-artifact checks do
not apply to this static browser game.

| File | SHA-256, live = clean build |
|---|---|
| `index.html` | `7135533e54984d8dda149048f0f856eefc20734944d8011d372a7de13fc2d6c4` |
| `assets/index-ezRoUGo-.js` | `a3120d3035d8b168a82b0a40bcd9d1c9ade5aaa562298f28dfbd30b528295f6d` |
| `assets/index-gmYMhl2G.css` | `af8633d3e700b9727af25657c94476f2c5dca0aba80e565d2daee69b74cce5a1` |

## Earlier findings

All earlier verification and review findings were rechecked. Every item below
is fixed and did not regress.

| Earlier finding | Current proof |
|---|---|
| Review F-1-1 through F-1-4 | Required home sections, original disclosed art, per-route social metadata, and full 404 footer are present. |
| Review F-1-5 through F-1-8 | The skip text, exact demo label, game/challenge terms, and plain job headline are correct. |
| Review F-1-9 through F-1-14 | README uses plain words, stays within the copy limit, and explains demo and deployment behavior clearly. |
| Review F-1-15 | Build and routing claims are in the manifest and their exact commands pass. |
| Review F-1-16 | The result screen copies a spoiler-free daily summary and recovers from clipboard denial. |
| Verification 2: unplayable patterns and fixed five levels | Pattern choices are pictured and described; two date codes produce distinct deterministic 20-challenge games. |
| Verification 2: menu wall, FPS, and initial focus | Active play is visible; the FPS claim passes; first Tab reaches the skip link. |
| Verification 3: audience and inaccessible visual input | Audience copy, non-colour descriptions, arrow keys, focus contrast, reduced motion, and text zoom all pass. |
| Verification 3: claims, malformed storage, soft 404, demo title | Claim inventory is complete; malformed storage recovers; direct/unknown routes return 404; demo has its own title. |
| Verification 4: touch targets, duration, no-server claim, direct 404 | Phone targets meet 44 px; 240–360 seconds is tested; full-run request allowlist passes; direct 404 is HTTP 404. |
| Verification 6 F-6-1 | The documented `--testNamePattern` build-output command now works and passes. |

## Evidence

- `review-2-first-read-desktop.png`
- `review-2-first-read-phone.png`
- `review-2-demo-start.png`
- `review-2-end-screen.png`
- `evidence-review-2-root/`
- `evidence-review-2-demo/`
