# Sure Shot handoff

## What shipped

Sure Shot is a local-first browser game with five daily visual rounds: two mark
estimates, pattern recall, timing, and spatial rotation. Every round records an
answer and a confidence setting before feedback. Results compare confidence and
accuracy by challenge type and give one retry-free takeaway. The game has a
fixed-step timer loop, pauses when the tab is hidden, saves active runs and
settings locally, supports keyboard/pointer/touch, and includes timing assist.

`/demo` begins an isolated sample game immediately. Its data uses
`demo:active`; real play uses `sure-shot:active`. The persistent demo banner can
reset the sample or discard it before starting a real local game.

The dithered print visual system and generated-art provenance are documented in
`.factory/design.md`. The original hero was generated through the factory image
deployment and compressed to `public/sure-shot-hero.webp` (123 KB). Its source
and prompt sidecar are retained in `assets/src/`.

## Verification

Commands run successfully:

```bash
npm test
npx playwright test
npm run build
```

Results: 3 deterministic core tests and 8 browser tests passed. The browser
tests cover a complete demo run, restart, local-only storage/request behavior,
persisted assist mode, free and account-free entry, console errors, and axe
serious/critical violations.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo .factory/evidence`
passed: HTTP 200, no console errors, one h1, main landmark, `lang="en"`, and
no missing image alt text. Evidence is in `.factory/evidence/`.

Lighthouse mobile run against `/demo`: Performance 95, Accessibility 100, Best
Practices 100, SEO 100. Measured FCP 2.3 s, LCP 2.5 s, TBT 30 ms, CLS 0. The
initial bundled JS is 5.98 KB gzip; CSS is 2.89 KB gzip.

## Known gaps and next steps

There is intentionally no account, leaderboard, analytics, payment flow, or
offline claim. A future version could add more daily round arrangements while
keeping scores local. Deployment should publish `dist/` with the included
`staticwebapp.config.json` headers and SPA fallback.
