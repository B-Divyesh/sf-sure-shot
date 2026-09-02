# Independent verification 2 — FAIL

**Candidate:** `d70495f1595ce0f30cad6df1faae453e66904b7d`
**Verified URL:** `https://sure-shot.sociobot.in`
**Date:** 2026-09-02
**Verdict:** **FAIL — release blocked.**

The deployed HTML and its two hashed assets match the candidate exactly, but
the candidate does not meet the browser-game acceptance contract. In
particular, one of its five advertised visual challenges cannot be answered
from the UI.

## Cold first read

On a new desktop browser at `/`, the first screen plainly says that the
product is a five-round confidence game, is for curious adults who want to
compare certainty with answers, and tells the visitor to click **“Try it with
sample data”**. That action is present and starts `/demo` in one click. This
part passes.

However, the captured root first screen is a marketing landing screen with
hero art and a preview, not an active game. The game-lane contract explicitly
requires the captured first screen to show the game itself rather than a menu
wall. `/demo` does correctly open directly on round one.

## Release-blocking defects

### P0 — Pattern-recall round is not a playable challenge

After its two-second preview, round 2 says **“Choose the pattern you saw”**
but displays only three text buttons: **Pattern A**, **Pattern B**, and
**Pattern C**. It renders zero pattern diagrams or other answer graphics.
There is no way for a player to relate the remembered pattern to an option;
the test can only complete it by hard-coding the implementation answer,
`Pattern B`.

Fresh live evidence at `/demo`, after completing round 1:

```
Which pattern did you just see?
Choose the pattern you saw.
Pattern A | Pattern B | Pattern C
```

Playwright found `.choices .pattern === 0` and no image, SVG, canvas, or
other choice graphic. This breaks the required pattern-recall challenge and
the product's real job-to-be-done. It also leaves no meaningful non-colour or
screen-reader alternative for this game information.

### P1 — “Daily” game has no daily/procedural content and insufficient replayable content

The page and README call this a daily game and show a date-derived `SS-YYYYMMDD`
seed. The seed only changes displayed text. `src/game.ts` exports one fixed
array of exactly five rounds; `newRun()` always returns that same array's
first round. There is neither a seeded generator nor the required 20 levels.
The only variation is the date label. This is both a false/unlisted daily
claim and misses the game-lane content requirement.

### P1 — Root capture does not show active play

The cold root screen presents a landing hero, navigation, explanatory copy,
and a button. Active play is one click away at `/demo`. This violates the
explicit game-lane capture requirement even though the one-click demo itself
works.

### P1 — Required measured 60 FPS claim/test is absent

The implementation uses a 60 Hz fixed timestep, but there is no measured
mid-range-phone frame-rate result and no `@claim:` entry/test for the required
“60 fps” game claim. The current claims file covers completion, restart,
local-only data, assist persistence, free play, and no account only.

### P2 — Initial keyboard focus bypasses the header and skip link

On a fresh `/demo` load the app programmatically focuses the `h1`. Pressing
Tab then lands on the first answer button (`10`), rather than the skip link or
header navigation. Those controls are only reached by reverse tabbing. The
focused answer does have a visible `4px` outline and the core game is
keyboard-operable, but initial focus should not make the skip/header controls
inaccessible in normal forward keyboard order.

## Claims: run first from the clean checkout

`.factory/claims.json` exists. After `npm ci`, every declared claim test was
run separately through the configured production-like demo server and passed:

| Claim | Command | Result |
|---|---|---|
| complete-run | `npx playwright test --grep @claim:complete-run` | 1 passed |
| restart-run | `npx playwright test --grep @claim:restart-run` | 1 passed |
| local-scores | `npx playwright test --grep @claim:local-scores` | 1 passed |
| assist-persist | `npx playwright test --grep @claim:assist-persist` | 1 passed |
| free-play | `npx playwright test --grep @claim:free-play` | 1 passed |
| no-account | `npx playwright test --grep @claim:no-account` | 1 passed |

These passing tests do not exercise whether the pattern options are
meaningful, whether the labelled daily seed affects the challenges, or a
measured frame-rate claim.

## Checks that passed

- Clean install: `npm ci` completed (59 packages; 0 reported vulnerabilities).
- Unit rules: `npm test` passed, 3/3 tests.
- Exact production build: `npm run build` passed and wrote `dist/`.
  Built JS is 15,901 bytes / 6,070 gzip and CSS is 10,741 bytes / 3,180 gzip.
- Browser suite: `npm run test:browser` completed 13/13 Chromium tests
  (`test-results/.last-run.json` is `passed`).
- Live deterministic run: at `/demo`, selected 13, Pattern B, stopped timing
  at approximately 3.2 seconds, selected Option B, selected 22, reached
  **“See how your confidence matched”**, then restarted to round 1. Result
  state was persisted under `demo:active`; timing assist persistence also
  passed its claim test.
- Invalid-input/recovery checks: the answer lock is disabled until a choice is
  made; reloading a saved feedback state restores it; resetting the demo
  starts a separate demo run.
- Desktop root and 390px mobile demo/root: no console or page errors and no
  horizontal overflow. Visible mobile controls measured at least 44px high.
  Keyboard selection (Space), confidence adjustment (ArrowRight), and submit
  (Enter) worked. Reduced-motion feedback animation computed to `1e-06s`.
- Accessibility: the local axe integration passed with no serious/critical
  violations on demo and results. Independent live axe injection on results
  also returned no serious/critical violations. `/opt/fleet/lib/verify-url.sh
  https://sure-shot.sociobot.in/demo` reported title, `lang=en`, one `h1`, a
  `main` landmark, no missing image alt text, no unnamed buttons, and no
  console errors.
- Privacy/network: a full live `/demo` run requested only the same-origin
  HTML, JS, and CSS. A cold root visit additionally requested only the
  same-origin hero image. No analytics, third-party request, account, payment,
  or server-side API endpoint was observed. Therefore no request allowance or
  429/`Retry-After` check applies to this static product.
- Response headers: live pages supply HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and CSP with
  `connect-src 'self'` and `frame-ancestors 'none'`. The hashed JS has
  `Cache-Control: public, max-age=31536000, immutable`.
- Route smoke: `/`, `/demo`, `/privacy`, `/terms`, `/404`, and an unknown path
  returned 200 and rendered without browser errors. No service worker/PWA
  behavior is advertised or required.
- Independent live Lighthouse (`/demo`, Chromium): Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 0.9s,
  TBT 80ms, CLS 0.

## Deployment identity

Fresh downloads prove the live deployment is this candidate's built output:

| File | SHA-256 (local `dist/` and live are identical) |
|---|---|
| `index.html` | `399b794067d2238cf08b9f6e2e1a64c7c29d589dae8777132132b3011c20a9b8` |
| `assets/index-BsZTlNgM.js` | `997d002841c7d5e8f04187a0063597c3327db913d472ffef0b79070d3e9d070d` |
| `assets/index-CazCao3X.css` | `aba1384e21915cf1e67bf9fd828f5ab2a986dcdc643b7ce1dfb869944cb36831` |

## Required repair before re-verification

1. Render three distinct, labelled pattern options (including an accessible
   non-colour description) and test that the user can select the option that
   matches the preview without hard-coding an internal answer.
2. Make the daily seed actually generate/retrieve a deterministic varied round
   set, or provide at least 20 real levels; add a claim test for the promise.
3. Make active play the root capture state while retaining a plain-language
   first-read explanation and one-click sandbox entry.
4. Add and pass a measured 60 FPS claim/test on the target mobile profile.
5. Do not autofocus the `h1` on the initial page load; preserve normal forward
   Tab access to skip link and header.
