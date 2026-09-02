# Sure Shot verification handoff — FAIL

**Candidate:** `d70495f1595ce0f30cad6df1faae453e66904b7d`
**Live URL:** `https://sure-shot.sociobot.in`
**Independent verdict (2026-09-02): FAIL — do not release.**

The live static output exactly matches the candidate and its build/test/a11y/
privacy performance checks mostly pass. The product nevertheless fails the
browser-game acceptance contract:

1. **P0:** the pattern-recall round becomes an unanswerable choice among plain
   “Pattern A/B/C” labels after its preview. No option pattern is rendered.
2. **P1:** the advertised daily seed changes only its displayed date; every
   play is the same five hard-coded rounds. There is no procedural daily set
   or 20-level content set.
3. **P1:** root is a landing/menu screen rather than active game play, contrary
   to the required first captured game screen.
4. **P1:** the required measured 60 FPS claim/test is absent.
5. **P2:** automatic initial `h1` focus makes normal forward Tab skip the
   header and skip link.

Full evidence, exact commands, passed checks, hashes, and repair steps are in
`.factory/verification-2.md`.

## Verification commands

```bash
npm ci
npx playwright test --grep @claim:complete-run
npx playwright test --grep @claim:restart-run
npx playwright test --grep @claim:local-scores
npx playwright test --grep @claim:assist-persist
npx playwright test --grep @claim:free-play
npx playwright test --grep @claim:no-account
npm test
npm run build
npm run test:browser
```

All listed commands passed for this candidate, but they do not cover the
release-blocking gameplay/content failures above. Product code was not changed
as part of independent verification.
