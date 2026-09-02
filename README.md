# Sure Shot

Play twenty visual challenges and compare your confidence with your answers.
Sure Shot is for curious adults who want a 4–6 minute daily mental game, not
an intelligence test. Play with keyboard, mouse, or touch; the root page opens
directly into today's active game, while `/demo` is an isolated sample run.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Open `/demo` for the isolated sample game. Demo
state uses `demo:*` keys in localStorage; a real game uses `sure-shot:*` keys.

## Test and build

```bash
npm test
npx playwright test
npm run build
```

The static deployment files are written to `dist/`. The exact production build
command is `npm run build`.

## Privacy and scope

Game answers and settings remain in the browser. The game includes no analytics
or third-party requests. Read the in-app `/privacy` and `/terms` pages for details.

## Daily game and performance

Each UTC date creates a deterministic 20-level set from its displayed `SS-YYYYMMDD`
seed. An unfinished run keeps that seed after midnight. Sure Shot uses a fixed 60 Hz
simulation loop and measured 60.006 FPS across 60 animation frames in the local
Chromium 390px mobile profile (the regression acceptance margin is 55 FPS). `npm test`
also verifies exactly 60 fixed steps for a deterministic one-second frame trace.

## Deploy

Deploy the contents of `dist/` to a static web host with SPA fallback. The
included `staticwebapp.config.json` supplies the fallback, cache headers, and
security headers for Azure Static Web Apps.
