# Sure Shot

Sure Shot is a 20-level, 4–6 minute daily mental game for curious adults who
want to compare confidence with answers. Play with a keyboard, mouse, or touch.
The duration uses a measured per-level pacing budget for reading, choosing,
setting confidence, and checking feedback.

Each UTC date creates a deterministic daily set from its displayed
`SS-YYYYMMDD` seed. An unfinished game keeps that seed after midnight. Timing
assist adds exactly 1.5 seconds to each timing target. The 390px Chromium
regression accepts at least 55 FPS across 60 animation frames.

## Run

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The root opens today’s active game. Open `/demo`
for the isolated sample game; its data uses `demo:*` localStorage keys and
never changes `sure-shot:*` real-game keys.

## Test and build

```bash
npm test
npx playwright test
npm run build
```

Run every exact command in `.factory/claims.json` before release. The static
production files are written to `dist/` by `npm run build`.

## Privacy and scope

Scores and settings stay in the browser. The game has no account, payment
step, analytics, or third-party requests. It sends no game answers, confidence,
or identity to a server. After a game page loads, you can finish its current
challenge while offline. Read the in-app `/privacy` and `/terms` pages for
details.

## Deploy

Deploy `dist/` as a static site. `staticwebapp.config.json` rewrites only the
known app routes, returns the designed `/404.html` page with HTTP 404 for
unknown routes, and provides cache and security headers for Azure Static Web
Apps.
