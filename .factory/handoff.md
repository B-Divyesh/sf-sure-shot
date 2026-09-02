# Sure Shot repair 3 handoff

## Release repair

Repaired every verifier finding from `.factory/verification-3.md` for
candidate `90531b850c23d6a13cfc484dc8d213828d0291fd`. Product repair commit:
`36d1d07` (`Repair accessibility, recovery, and route QA`).

### Fixed

* The active root game now starts with the plain headline **“Calibrate
  confidence with visual challenges”**, names curious adults as its audience,
  explains the one-click isolated sample action, and shows privacy,
  loaded-offline, and price facts without hiding level one.
* Spatial targets and each spatial answer now expose a full two-by-two shape
  description. Reduced-motion pattern rounds keep the target static until the
  player chooses **Hide pattern and choose an answer**. Pattern answers remain
  unavailable until that explicit step.
* Custom radio answers now implement roving focus and ArrowLeft/Right,
  ArrowUp/Down, Home, and End selection. The focus treatment is moss on light
  surfaces and chalk on selected dark surfaces; regression checks its required
  3:1 contrast. The mobile header wraps safely at 200% text sizing.
* Restored runs are schema validated. The exact previously crashing payload,
  `{"seed":"SS-20260902"}`, now clears safely, announces recovery, and starts
  a usable fresh game rather than removing `<main>` and throwing an error.
* `/demo` now has title **Demo — Sure Shot**. Known app routes are rewritten
  individually; unknown routes use the designed static `404.html` response
  with HTTP 404 rather than a soft SPA 200.
* The claim inventory now covers every published session, input, date/level,
  seed resume, demo isolation, privacy, offline, assist, price/account, and
  performance statement. The date claim plays all 20 observable levels for
  two UTC seeds and compares their actual generated content.

## Verification

Run from a clean checkout:

```bash
npm ci
npm test
npm run test:browser
npm run build
```

Results on 2026-09-02:

* `npm ci`: passed.
* `npm test`: 6/6 deterministic TypeScript tests passed.
* `npm run test:browser`: 25/25 Playwright tests passed. Coverage includes a
  deterministic title-to-calibration 20-level run, restart/reset storage,
  desktop and 390px mobile, mouse/keyboard/touch, radio arrows, reduced motion,
  200% text layout, malformed state recovery, live-style headers, route status,
  privacy, and loaded-offline play.
* All 14 commands listed in `.factory/claims.json` were then run separately;
  each passed in its own production-like browser server.
* `npm run build`: passed. Output is 19,196 bytes JS (7,274 gzip) and 11,326
  bytes CSS (3,300 gzip), within the static budgets.
* The bundled Playwright axe-core integration found no serious or critical
  violations on the demo and completed results screens. The external
  Lighthouse CLI was attempted against the bundled Chromium, but its launcher
  could not attach in this container (`Unable to connect to Chrome`). The prior
  verifier’s live Lighthouse 13 report is retained at
  `.factory/lighthouse-verify-3.json`; browser performance, layout, console,
  and asset-size gates above were rerun for this repair.
* `/opt/fleet/lib/verify-url.sh` passed locally for `/` and `/demo`: titles,
  `lang=en`, one `<h1>`, `<main>`, image alt text, labelled buttons, and no
  console/page errors. Evidence: `.factory/evidence-repair-3-root/` and
  `.factory/evidence-repair-3-demo/`.

## Deployment and live verification

Deployed `dist/` to the product-owned `sf-sure-shot` Static Web App in resource
group `sociobot` on 2026-09-02. The deploy CLI reported:
`https://purple-coast-006e30710.3.azurestaticapps.net`.

Live checks at `https://sure-shot.sociobot.in` passed:

* `/` returns 200 with title **Sure Shot — Daily confidence game**; `/demo`
  returns 200 with title **Demo — Sure Shot**; an unknown route returns 404.
* `verify-url.sh` found no console/page errors and the required semantic basics
  on root and demo. Live screenshots and reports are in
  `.factory/evidence-live-repair-3-root/` and
  `.factory/evidence-live-repair-3-demo/`.
* The live root, JS, and CSS SHA-256 hashes exactly match the production build:
  `b703f38b713bdbb8c75fbdb97b0964d71157f751c8079bfd5000ff53d3ad3ee3`,
  `ecc8cd6393f896471257fca73c935776c3c082c5e8b5debdce4131e23c8eb739`,
  and `b63bf131c7fa46293136314f72e4f254870454ec5e184d5c177f2416ece119a2`.
* Live headers include CSP with `connect-src 'self'` and
  `frame-ancestors 'none'`, `nosniff`, strict referrer policy, and HSTS.
* A fresh live scripted demo played all 20 levels to **See how your confidence
  matched**, then restarted to `{round: 0, answers: 0, phase: "answer"}` with
  no console errors.

## Known gaps

No product gaps. This is a static local-first game: it has no account,
analytics, payment, backend, service worker, or offline-reload/update claim.
The only verification-environment limitation is the Lighthouse CLI attachment
failure noted above.
