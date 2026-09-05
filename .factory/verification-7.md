# Verify the build claim command — report 7

**Work order:** `sure-shot-repair-6`  
**Implementation candidate:** `dd6c3c4d0ad6e558a08a656592907ed8ec7fb17e`  
**Previous verification:** `2eee208ba0f7ea0261b2b3d32481c2b616bbbdf8`  
**Live URL:** `https://sure-shot.sociobot.in`  
**Verified:** 2026-09-05  
**Verdict:** **PASS — 0 findings, 0 untested claims.**

## Repair

Verification 6 found that the `build-output` claim declared:

```text
npm test -- --grep @claim:build-output
```

Vitest rejects `--grep`. The manifest now declares the supported exact
command:

```text
npm test -- --testNamePattern @claim:build-output
```

It passed in a clean clone. The tagged test does not assert source text. It
runs the documented production build and verifies the generated static files,
including the deployment configuration and crawler files.

## Clean setup and claims

A separate clone at the implementation SHA ran `npm ci` before any tests. It
installed 141 packages with no reported vulnerabilities. Every exact command
in `.factory/claims.json` then passed independently:

| Claim | Result |
|---|---|
| complete-game | PASS |
| restart-game | PASS |
| daily-challenges | PASS |
| game-length | PASS |
| input-methods | PASS |
| seed-resume | PASS |
| demo-isolation | PASS |
| local-scores | PASS |
| no-server-data | PASS |
| loaded-offline | PASS |
| assist-persist | PASS |
| assist-seconds | PASS |
| free-play | PASS |
| no-account | PASS |
| fps-60 | PASS |
| daily-result-copy | PASS |
| build-output | PASS |
| static-routing | PASS |

Additional repository checks passed: `npm test` (9 tests), `npm run
typecheck`, `npm run lint`, `npx playwright test` (31 tests), and `npm run
build`. The production build emitted `dist/` with 21.75 kB JavaScript and
12.32 kB CSS before gzip.

## Cold HTTPS checks

The implementation was pushed to `origin/main`. The repository has no
separate deployment wrapper. The repaired file is factory verification
metadata, not an app asset, so the hosted game bundle is intentionally
unchanged. The HTTPS product was nevertheless opened in new browser contexts.

| Viewport | Job before scrolling | Audience | First action | Active play |
|---|---|---|---|---|
| 1440×900 | Compare your confidence with your answers | Curious adults who want a daily mental game | Try it with sample data | Visible |
| 390×844 touch | Compare your confidence with your answers | Curious adults who want a daily mental game | Try it with sample data | Challenge strip at 665 px; prompt at 777 px |

Both contexts loaded without console or page errors. A one-click live demo
opened on the realistic visual-estimate challenge and kept the persistent
**Demo — sample data, nothing is saved** banner. After a demo answer and
**Reset demo**, a seeded `sure-shot:active` value was byte-for-byte unchanged;
the demo state returned to round zero with no answers.

A scripted live demo completed all twenty real challenges. It reached **See
how your confidence matched** with a 3/20 score and four confidence/accuracy
rows. This is a real completed loss screen. The browser showed no error.

`/`, `/demo`, `/privacy`, and `/terms` returned 200. `/404` and an unknown
address returned the designed page with HTTP 404; those expected 404s are not
defects. Axe injection found zero serious or critical issues on all six of
those routes. Live headers included HSTS, `nosniff`, strict-origin referrer
policy, and the configured self-only CSP.

## Earlier findings

All earlier review and verification records were checked. The sixteen review
items and verification 2–5 defects remain covered by the existing behavior
and regression suites: visual pattern choices, daily variation, active play on
entry, audience copy, keyboard and non-color alternatives, storage recovery,
metadata, touch size, measured game length, strict no-server-data proof, real
404s, design implementation, demo wording, and result copying all remain
present. The previous F-6-1 command failure is fixed.

The static product has no backend, accounts, payment, multiplayer, service
worker, external integration, or consumer install. Those unrelated checks do
not apply. No known gaps remain.
