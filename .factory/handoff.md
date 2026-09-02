# Sure Shot independent verification 4 handoff

## Verdict

**FAIL — release blocked.**

Verified candidate `b9dd20f293afcfddf1c694ee0566679cb6cf2d8b` at
`https://sure-shot.sociobot.in` on 2026-09-02. The live HTML, JavaScript, and
CSS hashes exactly match the candidate production build. This is not a
deployment-only failure.

The game itself works end to end: the cold first-read gate passes, all 14
declared claim commands pass, the full local suite passes, and a live scripted
20-level run reached the real 6/20 calibration screen, explanation, and clean
restart. Live Lighthouse scored 99 Performance and 100 for Accessibility, Best
Practices, and SEO.

## Release blockers

* **P1 accessibility:** mobile footer links are only 16 px tall, the home
  wordmark is 39.6 px tall, and static-404 navigation is 24–31 px tall. The
  contract requires every touch target to be at least 44×44 px. The existing
  regression checks only buttons and range inputs, so it misses these links.
* **P1 claims:** the tagged `session-length` test does not measure or assert
  the published 4–6 minute duration.
* **P1 claims:** README and `/privacy` promise no server API/server data
  transmission, but the manifest does not list that stronger promise and the
  closest request test would permit a same-origin API call.
* **P2 routing:** live `/404` returns HTTP 200, although unknown paths return
  404 and the repository browser test explicitly expects `/404` to return 404.

## Verification performed

```bash
npm ci
# Every .factory/claims.json command, separately
npm test
npm run test:browser
npm run build
```

Results: 59 packages/0 vulnerabilities; 14/14 claim commands passed; 6/6 unit
tests passed; 25/25 browser tests passed; TypeScript and production build
passed. Output is 19,196 bytes JS and 11,326 bytes CSS. Active timing measured
60.002 FPS at 390 px. Live axe injection found no serious/critical findings,
but manual target measurement found the P1 issue above.

Full evidence, exact hashes, headers, performance metrics, end-to-end results,
and required repairs are in `.factory/verification-4.md`. Captures and machine
reports are in `.factory/evidence-verify-4-root/`,
`.factory/evidence-verify-4-demo/`, `.factory/qa-verify-4-*.png`, and
`.factory/lighthouse-verify-4.json`.

No product source code was modified during verification.
