# Compare confidence with visual challenges — handoff 7

## Outcome

**PASS — no findings remain.** This repair fixes verification 6 finding
F-6-1 at its cause. The `build-output` claim now uses Vitest's supported
`--testNamePattern` option. Its existing tagged regression test is
outcome-based: it runs the production build and verifies the required
deployable files in `dist/`.

Implementation: `dd6c3c4d0ad6e558a08a656592907ed8ec7fb17e`.

## What changed

- Changed the one `build-output` command in `.factory/claims.json` from the
  unsupported `--grep` to `--testNamePattern @claim:build-output`.
- Kept the game, published copy, product scope, storage model, and shipped
  asset bundle unchanged.
- Copied the verb-first catalog description to
  `/work/.evidence/catalog-description.txt`.

## Verification

From a separate clean clone at the implementation SHA, `npm ci` completed
with 141 packages and no reported vulnerabilities. All 18 exact commands in
`.factory/claims.json` passed individually, including:

```bash
npm test -- --testNamePattern @claim:build-output
```

That command ran one matching test. The test executed `npm run build` and
checked `dist/index.html`, `dist/404.html`, the deployment config, robots,
and sitemap outputs.

The repository gates also passed:

```bash
npm test                 # 9 passed
npm run typecheck
npm run lint
npx playwright test      # 31 passed
npm run build            # dist/ emitted; 21.75 kB JS, 12.32 kB CSS
```

The `test-results/` artifact recorded the full browser suite as `passed` and
was removed afterward.

## HTTPS check and game run

`dd6c3c4` was pushed to `origin/main`. No repository deployment wrapper is
configured. This repair affects the factory verification manifest only, which
is not part of the Vite production bundle, so a product-image change is not
expected. The HTTPS product was checked cold after the push.

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. `/404` and an unknown
  address returned the designed page with HTTP 404.
- Fresh 1440×900 desktop and 390×844 touch contexts stated the job as
  **Compare your confidence with your answers**, named curious adults as the
  audience, and offered **Try it with sample data** before scrolling.
- At 390×844 the active challenge strip began at 665 px and its prompt at
  777 px, so active play was visible on the first screen.
- The sample action opened a populated visual-estimate challenge. The
  persistent banner read **Demo — sample data, nothing is saved**. An answer,
  feedback, and **Reset demo** left a seeded real-game value unchanged. Reset
  restored `{ round: 0, answers: [], phase: "answer" }`.
- A deterministic 20-challenge demo run reached the real result screen with a
  3/20 score and four populated calibration rows. This is a completed loss
  result, not a mocked end screen.
- No browser console or page errors occurred. Playwright axe checks found no
  serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`,
  `/404`, or an unknown route.
- Live response headers included the self-only CSP, HSTS, `nosniff`, and the
  strict-origin referrer policy. Requests and storage behavior remain covered
  by the passing `local-scores` and `no-server-data` claims.

## Earlier history

The earlier review and verification records were read before this repair.
Their pattern choices, daily challenge variation, visible active game,
first-read audience, accessible visual alternatives, malformed-storage
recovery, route metadata, touch targets, duration measurement, no-server-data
proof, static 404, design, demo wording, result sharing, and copy findings
remain fixed. Verification 6 was the only outstanding finding, and its exact
claim command now passes from the clean clone.

## Scope and known gaps

Sure Shot is a static, local-first entertainment game. It has no backend,
account, payment, analytics, multiplayer, service worker, external AI, or
third-party requests. Backend isolation, SQLite restart, rate limiting,
PWA-update, and installed-consumer checks do not apply. There are no known
remaining product gaps for this repair.

See [`verification-7.md`](verification-7.md) for the complete repair record.
