# Sure Shot verification 3 handoff — FAIL

## Verdict

**FAIL — release blocked.** Independently verified candidate
`90531b850c23d6a13cfc484dc8d213828d0291fd` at
`https://sure-shot.sociobot.in` on 2026-09-02.

The deployment is live, healthy, and byte-identical to the candidate build.
This is not a deployment-only failure. Full evidence and defect details are in
`.factory/verification-3.md`.

## Release blockers

* The cold first screen explains what to play and offers the required one-click
  demo, but never says who the game is for. This triggers the work order's
  explicit first-read FAIL.
* Spatial challenges lack screen-reader shape descriptions; reduced motion
  removes the pattern target immediately; the focus ring is only 1.49:1
  against the page; custom radios ignore arrow keys; and 200% text sizing at
  390 px creates a 470 px-wide page.
* README/live promises are absent from `.factory/claims.json`, including the
  4–6 minute duration and advertised inputs. The tagged daily-level claim test
  does not traverse 20 levels or compare dates, so it does not prove its claim.

Lower-severity findings: structurally malformed saved JSON blanks the app,
unknown routes return soft HTTP 200 pages, and `/demo` has no distinct title.

## What passed

* All eight claim commands passed individually before broader QA.
* `npm ci`: passed, 59 packages, 0 vulnerabilities.
* `npm test`: 5/5 passed.
* `npm run test:browser`: 16/16 passed.
* `npm run build`: passed with TypeScript; `dist/` emitted.
* Live scripted run: level 1 through level 20 to calibration; restart reset to
  level 1; demo/real storage and assist persistence worked.
* Privacy: full run made only same-origin static requests; no analytics or
  server API exists, so no 429 allowance applies.
* Live axe serious/critical: zero. Factory URL smoke checks passed.
* Lighthouse mobile: 100/100/100/100; LCP 0.9 s, TBT 60 ms, CLS 0.
* Measured 390 px Chromium frame rate: 60.006 FPS.
* Live HTML/JS/CSS SHA-256 hashes exactly match the fresh candidate build.

## Reproduce

```bash
npm ci
npm test
npm run test:browser
npm run build
```

Run every exact command in `.factory/claims.json` separately before the full
suite. Use `/demo` for the isolated `demo:*` sandbox. Key captures and reports
are in `.factory/qa-*.png`, `.factory/evidence-verify-3-*`, and
`.factory/lighthouse-verify-3.json`.
