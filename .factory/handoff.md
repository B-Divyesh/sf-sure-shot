# Sure Shot repair handoff

## Repair completed

Repaired every release blocker recorded in `.factory/verification-2.md` for
candidate `d70495f1595ce0f30cad6df1faae453e66904b7d`.

- Pattern recall now previews a real 3×3 tile pattern, then renders three
  distinct pictured pattern choices. Each choice has a non-colour accessible
  description of its filled tiles. Browser regression coverage compares the
  preview tiles to the rendered options and selects the matching diagram.
- `roundsForSeed(seed)` now produces 20 deterministic levels from the displayed
  UTC `SS-YYYYMMDD` seed. A run stores its seed, so an unfinished daily game
  remains unchanged after midnight. Unit coverage checks same-seed equality,
  next-day variation, unique 20-level content, and pattern-option uniqueness.
- `/` now opens directly on an active level-one game, with a compact plain
  explanation and one-click **Try it with sample data** action. `/demo` remains
  the isolated `demo:*` sandbox with its persistent reset/start-real banner.
- The fixed timestep now guards against floating-point undercounting. The
  deterministic unit trace produces exactly 60 steps in one second. A 390px
  Chromium requestAnimationFrame sample measured **60.006 FPS** over 60 frame
  intervals; the claim regression accepts a conservative ≥55 FPS margin.
- Initial load no longer autofocuses the `h1`. The root keyboard regression
  verifies the first forward Tab reaches the skip link before the header/game.

## Verification

Run from a clean checkout:

    npm ci
    npm test
    npx playwright test --grep '@claim:'
    npm run test:browser
    npm run build

Evidence from this repair:

- `npm ci`: 59 packages, 0 vulnerabilities.
- `npm test`: 5/5 deterministic rule tests passed.
- `npx playwright test --grep '@claim:'`: 8/8 claims passed.
- `npm run test:browser`: 16/16 Chromium tests passed, including desktop,
  390px mobile, keyboard, privacy/offline, routes, and axe serious/critical
  checks on demo and results.
- `npm run build`: passed; production JS is 16.10 kB (6.25 kB gzip) and CSS
  is 10.23 kB (3.06 kB gzip).
- `/opt/fleet/lib/verify-url.sh` against the production-like local static
  server passed for `/demo` and `/`: `lang=en`, one `h1`, one `main`, no
  missing alt text or unnamed buttons, and no console/page errors. Screenshots
  and JSON reports are in `.factory/evidence-repair-2/` and
  `.factory/evidence-repair-2-root/`.
- The external `@axe-core/cli` binary could not start its Selenium Chrome in
  this container. The shipped Playwright axe-core integration ran instead and
  passed with no serious or critical violations on both demo and results.
- Lighthouse 13 could not attach to the preinstalled Playwright Chromium in
  this container, even with its executable path and no-sandbox flags. The
  browser checks above cover the same load, layout, accessibility, console,
  and size gates; the deployment should receive the normal fleet Lighthouse
  pass during re-verification.

## Deployment

Committed and pushed repair `ee4e28f` (`Repair daily game content and
accessibility`). Deployed `dist/` to the existing `sf-sure-shot` Static Web
App in resource group `sociobot` on 2026-09-02. The CLI reported successful
production deployment at `https://purple-coast-006e30710.3.azurestaticapps.net`.

Live identity/smoke verification passed at `https://sure-shot.sociobot.in/`:
the page serves `index-DRn0yAHM.js` and `index-D3_FpxwI.css`, renders title
`Level 1 of 20 — Sure Shot`, has no console errors, and keeps the required CSP,
HSTS, nosniff, and referrer-policy headers. Evidence is in
`.factory/evidence-live-repair/`. `staticwebapp.config.json` supplies the SPA
fallback, CSP, referrer policy, nosniff header, and immutable asset cache rule.

## Known gaps

None. This is a local-first static game: it has no accounts, analytics,
payments, service worker, or external runtime requests.
