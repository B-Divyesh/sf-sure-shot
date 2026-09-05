# Sure Shot

Sure Shot is a 20-challenge daily game for curious adults who want to compare
confidence with answers. Play with a keyboard, mouse, or touch. A full game is
planned for four to six minutes. That estimate allows 12–18 seconds for each
challenge.

Each UTC date generates the same 20 challenges from the daily code shown in
the game. An unfinished game keeps that code after midnight. Timing assist adds
exactly 1.5 seconds to each timing target. The mobile browser test measures 60
frames and requires at least 55 frames per second at 390 px.

## Run

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. Open the home page to play today’s game. Open
`/demo` for a sample game. Demo progress uses separate browser storage and
cannot overwrite your daily game.

## Test and build

```bash
npm test
npm run typecheck
npm run lint
npx playwright test
npm run build
```

Run every exact command in `.factory/claims.json` before release. `npm run
build` writes static production files to `dist/`.

## Privacy and scope

Scores and settings stay in the browser. The game has no account, payment
step, analytics, or third-party requests. It sends no game answers, confidence,
or identity to a server. After a game page loads, you can finish its current
challenge while offline. Read the in-app `/privacy` and `/terms` pages for
details.

## Deploy

Deploy `dist/` as a static site. `staticwebapp.config.json` rewrites only the
known app routes. Unknown routes return the designed Page not found page. Use
the config file when deploying to Azure Static Web Apps.
