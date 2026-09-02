# Sure Shot

Play five visual challenges and compare your confidence with your answers.
Sure Shot is for curious adults who want a short daily mental game, not an
intelligence test.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Open `/demo` for the isolated sample game. Demo
state uses `demo:active` in localStorage; a real game uses `sure-shot:active`.

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

## Deploy

Deploy the contents of `dist/` to a static web host with SPA fallback. The
included `staticwebapp.config.json` supplies the fallback, cache headers, and
security headers for Azure Static Web Apps.
