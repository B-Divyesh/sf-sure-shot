# Sure Shot repair 5 handoff

## Outcome

**PASS.** All 16 findings from `review-1.md` are resolved. Sure Shot remains a
free, local-first browser game for curious adults who want to compare stated
confidence with visual answers. A game has 20 challenges and is planned for
four to six minutes.

**Implementation SHA:** `461f2c88c1bb8620fd897edb385c480a68fd83f6`.
This report is a later documentation-only commit; it does not change the
deployed product image.

## Review finding disposition

| Finding | Disposition |
|---|---|
| F-1-1 | Added **How to play** with three steps and **What Sure Shot does not do** on the home page. |
| F-1-2 | Rendered the original generated `/sure-shot-hero.webp` in the home task panel. The footer disclosure is now accurate. |
| F-1-3 | Added route-specific description, canonical, Open Graph title/description/URL/image, and Twitter title/description/image. The static 404 has its own metadata. |
| F-1-4 | Added Privacy and Terms destinations, product line, factory credit, version, and image disclosure to the static 404 footer. |
| F-1-5 | Changed every shared skip link to **Skip to main content**. |
| F-1-6 | The persistent demo banner now says **Demo — sample data, nothing is saved**. |
| F-1-7 | Uses **game** for the 20-challenge session and **challenge** for one item in live copy, README, claims, demo notes, and design notes. |
| F-1-8 | Replaced the headline with **Compare your confidence with your answers**. |
| F-1-9 to F-1-14 | Rewrote the README in plain terms; the copy audit records the landing wording and terminology. |
| F-1-15 | Added outcome-based `build-output` and `static-routing` claims with uniquely tagged checks. |
| F-1-16 | Added **Copy daily result**. It copies the daily code, score, confidence, accuracy, and gaps without answers. It reports a clear recovery message if clipboard access is denied. |

The earlier verification 2–4 defects remain fixed: deterministic 20-challenge
daily content, pictured and described pattern choices, active play on the first
screen, measured FPS, normal initial tab order, non-colour alternatives,
reduced-motion pattern controls, radio arrows, storage recovery, real 404s,
44 px links and controls, and direct no-server-data coverage.

## How to run and verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npx playwright test
npm run build
```

Run every command in `.factory/claims.json`. The final clean-style run executed
all 18 commands separately; all passed. The suite contains 9 Vitest checks and
31 Playwright checks. The two new deployment claims prove a real build creates
deployable files and that the built static server serves known routes while
returning the designed 404 for unknown paths.

## Live deployment and browser evidence

The committed build was deployed with the factory static deployer to the
existing one-replica static app `sf-sure-shot`. Its checked-in
`staticwebapp.config.json` remained in use. The deployed HTML, JavaScript, and
CSS match the implementation build:

| File | SHA-256 |
|---|---|
| `index.html` | `7135533e54984d8dda149048f0f856eefc20734944d8011d372a7de13fc2d6c4` |
| `assets/index-ezRoUGo-.js` | `a3120d3035d8b168a82b0a40bcd9d1c9ade5aaa562298f28dfbd30b528295f6d` |
| `assets/index-gmYMhl2G.css` | `af8633d3e700b9727af25657c94476f2c5dca0aba80e565d2daee69b74cce5a1` |

- Fresh 1440 × 900 and 390 × 844 HTTPS contexts both showed: job **Compare
  your confidence with your answers**; audience **curious adults**; first
  action **Try it with sample data**; and the first challenge before scrolling.
  The challenge heading began at 751.5 px desktop and 777.0 px mobile.
- One click opened `/demo` on Challenge 1 with three answer choices and the
  persistent sample-data banner. Reset returned `round: 0`, no answers, and
  `phase: "answer"`; the seeded real game value was unchanged. Start for real
  removed all `demo:*` keys and created a real local game.
- A fresh live demo completed all 20 challenges and reached **See how your
  confidence matched** with a 3/20 scripted score, four challenge-type rows,
  both Correct and Not this time feedback, the explanation control, restart,
  and Copy daily result. The copied text included the date code, score, and
  four confidence/accuracy gaps with no answer choices.
- The live demo made only same-origin, payload-free GET requests for its page
  and hashed assets. The home page additionally loaded the local hero image.
  There were no product console or page errors. The two browser messages for
  direct `/404` were the expected HTTP 404 response, not product failures.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. `/404` and an unknown
  path return the designed page with HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passed on live `/` and `/demo`: route titles,
  `lang="en"`, one `h1`, `main`, image alt attributes, named controls, and no
  console errors. Playwright axe checks on `/`, `/demo`, `/privacy`, `/terms`,
  `/404`, and the live result screen found zero serious or critical violations.
- Live Lighthouse on `/demo`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.8 s, LCP 0.9 s, TBT 20 ms, CLS 0.

Evidence includes `qa-repair-5-*.png`, `evidence-live-repair-5-*.png`,
`evidence-live-repair-5-root/`, `evidence-live-repair-5-demo/`,
the captured live HTML and assets, and `lighthouse-live-repair-5.json`.

## Known gaps

None. This static product has no backend, account, payment, multiplayer,
service worker, analytics, or external integration. Therefore tenant,
rate-limit, payment, PWA-update, and multi-client checks do not apply.
