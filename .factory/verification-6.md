# Verify the 20-challenge confidence game — report 6

**Work order:** `sure-shot-verify-6`  
**Implementation candidate:** `461f2c88c1bb8620fd897edb385c480a68fd83f6`  
**Documentation candidate:** `874b9af6061d3b867134e5427c038f2c7fb9f7ba`  
**Live URL:** `https://sure-shot.sociobot.in`  
**Verified:** 2026-09-05  
**Verdict:** **FAIL — 1 finding, 0 untested claims.**

The live game works end to end and matches the implementation candidate. One
of the 18 exact claim commands does not run from the documented clean setup.
The claims contract makes that a release failure even though the underlying
build behavior passes the full test suite.

## First screen

Fresh browsers were opened without stored data and without scrolling.

| Viewport | Job | Audience | First action | Active play shown |
|---|---|---|---|---|
| 1440 × 900 | **Compare your confidence with your answers** | Curious adults who want a daily mental game | **Try it with sample data** | Yes; Challenge 1 starts at y=751.5 px |
| 390 × 844 | **Compare your confidence with your answers** | Curious adults who want a daily mental game | **Try it with sample data** | Yes; Challenge 1 starts at y=777.0 px |

Both screens also show the privacy, offline, and price facts. The game itself
is visible on the first screen, so the home page is not a menu wall.

## Finding

### F-6-1 — P1 — The `build-output` claim command cannot run

`.factory/claims.json` declares this exact command:

```text
npm test -- --grep @claim:build-output
```

After `npm ci` in a clean clone, Vitest exits non-zero with:

```text
CACError: Unknown option `--grep`
```

This is a public build claim with a broken required proof command. It also
contradicts the documentation candidate's statement that all 18 exact claim
commands passed. The unfiltered `npm test` run does execute the tagged test,
and `npm run build` writes `dist/`, but those facts cannot replace the exact
manifest command during verification.

Verified repair direction: Vitest accepts
`npm test -- --testNamePattern @claim:build-output`; it ran only the tagged
test and passed. No product or manifest file was changed in this work order.

## Claim commands

All 18 commands were attempted separately from the clean clone. No claim was
left untested.

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
| `build-output` | `npm test -- --grep @claim:build-output` | **FAIL** — unsupported Vitest option |
| `static-routing` | `npx playwright test --grep @claim:static-routing` | PASS |

Live copy, README, privacy text, demo notes, and claims were cross-checked.
The published behavior is represented in the claim inventory. The failure is
the unusable command above, not a missing or untested claim.

## Live game run

A fresh reduced-motion desktop browser opened `/demo` and completed the real
20-challenge game. The deterministic run included five visual estimates, five
pattern recalls, five timing challenges, and five spatial judgments.

- Final score: **4/20**.
- Feedback included 4 **Correct** and 16 **Not this time** outcomes.
- Pattern answers had three pictured choices and full filled-tile descriptions.
- The end screen had four populated confidence/accuracy rows and one takeaway.
- The calibration explanation opened.
- **Copy daily result** copied the daily code, score, and four gaps without answers.
- Denied clipboard access produced a clear retry or manual-copy message.
- **Play a fresh practice game** reset to challenge 1 with no answers.

The end screen is recorded in `verification-6-end-screen.png`.

## Demo isolation and recovery

- The first click entered `/demo` on a populated challenge.
- The exact persistent label was **Demo — sample data, nothing is saved**.
- Demo play and **Reset demo** did not change a seeded real game.
- Reset restored `round: 0`, no answers, and `phase: "answer"`.
- **Start for real** removed every `demo:*` key and created `sure-shot:active`.
- Empty answer submission stayed disabled.
- Confidence accepted the 50% and 100% boundaries.
- Arrow keys selected radios; Enter submitted the focused action.
- Refresh restored feedback without losing progress.
- Invalid JSON and incomplete saved objects recovered to usable play with a status message.
- Timing assist added 1.5 seconds and persisted after reload.
- A loaded timing challenge completed offline.
- A synthetic visibility change showed a one-second hidden wait added no game time.
- In-app Back navigation restored `/demo`, focused its `h1`, and announced the route.

The product has no service worker and promises only loaded-challenge offline
completion. Offline reload and update behavior are not advertised.

## Accessibility and site structure

`/`, `/demo`, `/privacy`, and `/terms` returned 200. `/404` and an unknown
address returned the designed page with HTTP 404. Those deliberate 404
responses are expected and are not defects.

Every checked route had `lang="en"`, one `h1`, one `main`, header, navigation,
footer, route-specific title, canonical URL, Open Graph data, Twitter data,
and no image missing `alt`. All rendered destination links worked. The static
404 footer included Privacy and Terms.

Additional results:

- Axe on all six routes and the result screen: zero violations.
- Fleet URL verifier on `/` and `/demo`: passed with no console errors.
- Initial Tab reached **Skip to main content** with a visible focus ring.
- Every visible phone link, button, and range control measured at least 44×44 px.
- No horizontal overflow at 390 px or simulated 200% text.
- Reduced motion kept the pattern visible until the explicit hide action and ran no animation.
- Pattern and spatial challenges exposed non-color text descriptions.

## Privacy, performance, and deployment identity

The complete live demo made exactly three requests: `GET /demo` and the two
hashed CSS/JavaScript assets. All were same-origin, payload-free, and had no
query string. There were no console or page errors. No analytics, third-party
request, account, payment, backend, multiplayer, or external integration is
present.

Fresh Lighthouse 13.4.1 on live `/demo`:

| Measure | Result |
|---|---:|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 833 ms |
| LCP | 862 ms |
| TBT | 20 ms |
| CLS | 0 |

The phone browser measured **60.003 FPS** across 120 frames. The clean build
emitted 21,752 bytes of JavaScript and 12,323 bytes of CSS. The hero image is
125,042 bytes. These are within the declared budgets.

The live deployment is byte-identical to a clean build of the implementation:

| File | SHA-256 |
|---|---|
| `index.html` | `7135533e54984d8dda149048f0f856eefc20734944d8011d372a7de13fc2d6c4` |
| `assets/index-ezRoUGo-.js` | `a3120d3035d8b168a82b0a40bcd9d1c9ade5aaa562298f28dfbd30b528295f6d` |
| `assets/index-gmYMhl2G.css` | `af8633d3e700b9727af25657c94476f2c5dca0aba80e565d2daee69b74cce5a1` |

Security headers include a self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, and strict-origin referrer policy.

## Earlier finding disposition

Every earlier defect was inspected, including the 16 minor review findings.

| Earlier finding | Current evidence | Disposition |
|---|---|---|
| Review F-1-1 | Home has **How to play** and **What Sure Shot does not do** | Fixed |
| Review F-1-2 | Original hero art is visible and disclosed | Fixed |
| Review F-1-3 | Every route has matching Open Graph and Twitter metadata | Fixed |
| Review F-1-4 | Static 404 has standard footer and legal links | Fixed |
| Review F-1-5 | Shared link says **Skip to main content** | Fixed |
| Review F-1-6 | Demo label uses the required sample-data wording | Fixed |
| Review F-1-7 | Live copy and docs use game/challenge consistently | Fixed |
| Review F-1-8 | Headline names the comparison job plainly | Fixed |
| Review F-1-9 | README removes “pacing budget” | Fixed |
| Review F-1-10 | README explains the daily code without generator jargon | Fixed |
| Review F-1-11 | README states the frame test in plain words | Fixed |
| Review F-1-12 | README says “home page,” not “root” | Fixed |
| Review F-1-13 | README explains demo separation before storage details | Fixed |
| Review F-1-14 | README sentences stay within the copy limit | Fixed |
| Review F-1-15 | Both deployment claims are listed and tagged | Fixed, but F-6-1 affects one exact command |
| Review F-1-16 | Spoiler-free result copy and denial recovery both work | Fixed |
| Verification 2: unplayable patterns | Pictured, described choices work in all five pattern challenges | Fixed |
| Verification 2: five fixed levels | Two date codes produce distinct deterministic 20-challenge games | Fixed |
| Verification 2: root menu wall | Active Challenge 1 is visible on desktop and phone | Fixed |
| Verification 2: missing FPS proof | Tagged test passes; live phone measured 60.003 FPS | Fixed |
| Verification 2: initial focus | First Tab reaches the skip link | Fixed |
| Verification 3: missing audience | First screen names curious adults | Fixed |
| Verification 3: inaccessible visual challenges | Pattern/spatial descriptions, radio arrows, reduced motion, focus, and 200% text pass | Fixed |
| Verification 3: incomplete claim coverage | The former missing behavior now has tagged tests | Fixed; new command defect is F-6-1 |
| Verification 3: malformed storage crash | Invalid and incomplete storage recover visibly | Fixed |
| Verification 3: soft 404 | Direct and unknown routes return HTTP 404 | Fixed |
| Verification 3: shared demo title | `/demo` title is **Demo — Sure Shot** | Fixed |
| Verification 4: small touch targets | Minimum checked phone target is 44 px high and 45.6 px wide | Fixed |
| Verification 4: unmeasured duration | Tagged test sums all 20 pacing values and enforces 240–360 seconds | Fixed |
| Verification 4: missing no-server claim | Tagged full-run request allowlist passes locally and live | Fixed |
| Verification 4: `/404` returned 200 | Live `/404` returns the designed HTTP 404 | Fixed |

## Clean-checkout quality gates

| Command | Result |
|---|---|
| `npm ci` | PASS; 141 packages, 0 vulnerabilities |
| `npm test` | PASS; 9 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npx playwright test` | PASS; 31 tests |
| `npm run build` | PASS; `dist/` emitted |

This is a static browser game. Backend tenant isolation, SQLite restart
persistence, health endpoints, 429/`Retry-After`, multiplayer clients, and
installed consumer artifacts do not apply.

## Evidence

- `verification-6-first-read-desktop.png`
- `verification-6-first-read-phone.png`
- `verification-6-demo-start.png`
- `verification-6-end-screen.png`
- `evidence-verification-6-root/`
- `evidence-verification-6-demo/`
- `lighthouse-verification-6.json`

