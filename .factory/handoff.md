# Sure Shot repair handoff

## What changed

The repair fixes candidate `4e8c996def56a2a53e07149e6582d955b1f42d7c` without changing its browser-game or static-deployment class.

- Replaced every runtime `style` attribute with CSP-safe rendering. Dot positions now come from checked-in `:nth-child` rules. Round and result bars use native `<progress>` elements styled by the bundled stylesheet.
- Corrected the hero request from the nonexistent `/assets/sure-shot-hero.webp` to the emitted `/sure-shot-hero.webp` file.
- Added a production-like local server that applies the deployed CSP during browser tests. The focused regression visits the landing page, checks the hero, completes all five rounds, reaches results, rejects any HTTP failure or browser error, and asserts that no `style` attributes exist.
- Added keyboard submission, 390 px mobile fit and 44 px target, results-screen axe, and loaded-offline coverage.
- Stopped answer selection from rebuilding the page and losing keyboard focus. Route and round changes now move focus deliberately. The pattern preview runs once instead of restarting every two seconds.
- Isolated demo settings under `demo:settings`. Demo play no longer reads or writes real-play settings.
- Replaced the `/404` self-refresh loop with a complete CSP-safe 404 document and added route coverage.

## Local verification

Run from a clean checkout with Node 22:

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run test:browser -- --grep '@claim:'
```

Evidence recorded on 2026-09-02:

- `npm test`: 3 deterministic core tests passed.
- Exact production build `npm run build`: passed; `dist/` contains the static artifact and deployment configuration.
- `npm run test:browser`: 13/13 Chromium tests passed under the production CSP. The scripted run reaches “See how your confidence matched.”
- Claim-only run: 6/6 listed claim tests passed.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo .factory/evidence-repair`: HTTP 200, no console errors, one `<h1>`, `lang="en"`, `<main>`, and no missing alt text or unlabeled buttons.
- Playwright axe integration: no serious or critical findings on round one or the end screen.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 10 ms, CLS 0.
- Initial bundles: JavaScript 15.9 KB raw / 6.1 KB gzip; CSS 10.7 KB raw / 3.2 KB gzip. Hero WebP: 125 KB.

Local reports and desktop/mobile screenshots are in `.factory/evidence-repair/`.

## Deployment and known gaps

Deployment `317dddcc-912f-4ea6-b0f4-cbc983e5b03a` succeeded on the product-owned Azure Static Web App `sf-sure-shot`. The custom domain is `https://sure-shot.sociobot.in`.

Live verification returned HTTP 200 with the expected title, language, landmark, and accessible names. The hero returned 200. A fresh mobile browser played all five deterministic rounds to “See how your confidence matched” at `/demo` with zero console errors, failed requests, HTTP failures, or inline style attributes. Live headers retain `style-src 'self'` without `unsafe-inline`. Live reports and the end-screen screenshot are in `.factory/evidence-live/`.

The application deliberately has no analytics, account, payment, online leaderboard, service worker, or offline-reload claim. A fully loaded run continues if the network drops.
