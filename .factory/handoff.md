# Verify the 20-challenge confidence game — handoff 6

## Outcome

**FAIL — 1 finding, 0 untested claims.** The live product works end to end and
is byte-identical to implementation `461f2c88c1bb8620fd897edb385c480a68fd83f6`.
The documentation candidate is `874b9af6061d3b867134e5427c038f2c7fb9f7ba`.

The complete report is [`verification-6.md`](verification-6.md).

## Required repair

The `build-output` entry in `.factory/claims.json` declares
`npm test -- --grep @claim:build-output`. Vitest rejects `--grep`, so the exact
claim command fails from a clean install. Replace it with the supported name
filter. `npm test -- --testNamePattern @claim:build-output` was checked and
passes the one tagged test.

No product source was changed during independent verification.

## Verification summary

- Opened fresh 1440×900 and 390×844 live browsers without scrolling.
- Confirmed the job, audience, sample action, three facts, and active game.
- Verified one-click demo entry, persistent label, reset, real-data isolation,
  and Start for real.
- Completed and recorded a deterministic 20-challenge live run to a 4/20 end
  screen with all four challenge types, copy, explanation, and restart.
- Verified keyboard, boundary, invalid-storage, refresh, offline, reduced-motion,
  visibility-pause, focus, mobile, 200% text, and clipboard-denial paths.
- Verified titles, metadata, links, legal pages, deliberate 404 responses,
  security headers, privacy requests, and all earlier findings.
- Ran all 18 exact claim commands: 17 passed and `build-output` failed.
- Ran `npm test` (9), typecheck, lint, Playwright (31), and build; all passed.
- Fresh Lighthouse `/demo`: 100 Performance, Accessibility, Best Practices,
  and SEO. Phone frame rate measured 60.003 FPS.

## Evidence

Use `.factory/verification-6-*.png`, `.factory/evidence-verification-6-root/`,
`.factory/evidence-verification-6-demo/`, and
`.factory/lighthouse-verification-6.json`.

The product is static. Backend, SQLite, rate-limit, multiplayer, PWA-update,
and installed-consumer checks do not apply.
