# Adversarial first-read review 1 — Sure Shot

**Work order:** `sure-shot-review-1`

**Candidate:** `a7d1ee204fd6268621569e3820dbf6b247ed3f17`

**Live URL:** `https://sure-shot.sociobot.in`

**Reviewed:** 2026-09-02

**Verdict:** **FAIL — 16 findings remain. None is release-blocking, but PASS requires zero findings.**

The game, demo isolation, claims, routes, accessibility baseline, and production
build work. The remaining findings concern required landing structure, the
documented visual thesis, route metadata, copy clarity, claim inventory, and a
missing result-sharing affordance.

## Findings

### F-1-1 — Minor — The landing page omits two required sections

**Location/quote:** `/` goes from the active game to the footer text, “Twenty
short visual challenges about confidence.” There is no “How it works” section
and no section naming what the product does not do.

**Why this matters:** A first-time visitor can start successfully, but the
standard site skeleton requires three concrete steps and a plain statement of
the product boundary. The separate Privacy and Terms links do not replace those
landing-page sections.

**Concrete fix:** Add a compact **How to play** section with three steps:
“Answer a visual challenge,” “Set your confidence,” and “Compare confidence
with accuracy.” Add **What Sure Shot does not do** with: “Sure Shot is a game,
not an intelligence test, medical tool, or diagnosis. Your results stay in
this browser.”

### F-1-2 — Minor — The live hero does not implement the recorded visual thesis

**Location/quote:** `.factory/design.md` says, “A wide asymmetric hero art
panel balances a narrow task panel.” It also specifies an original hero
illustration. The live hero contains only the bordered text panel; the shipped
`/sure-shot-hero.webp` is never referenced. The footer nevertheless says,
“Illustration generated for Sure Shot.”

**Why this matters:** The design file is the source of truth for the product's
look. The absent art weakens the promised distinctive composition, and the
footer refers to artwork a visitor never sees.

**Concrete fix:** Render `sure-shot-hero.webp` in the documented asymmetric
hero panel, with `alt=""` if it remains decorative. Otherwise revise the design
record and footer, then remove the unused asset and `.hero-art` CSS.

### F-1-3 — Minor — Social metadata is missing or stale on non-home routes

**Location/quote:** `/privacy` has the correct document title “Privacy — Sure
Shot,” but still serves `og:title="Sure Shot — Play twenty confidence
challenges"` and the home-page Open Graph description. `/demo` and `/terms`
behave the same way. All routes omit `twitter:title`, `twitter:description`,
and `twitter:image`.

**Why this matters:** Shared deep links describe the game landing page rather
than the destination. The site-structure contract requires title, description,
and image metadata for Open Graph and Twitter cards.

**Concrete fix:** Update Open Graph and Twitter title, description, image, and
URL metadata whenever the SPA route changes. Add equivalent static metadata to
the designed 404 where appropriate; keep the 404 `noindex` directive.

### F-1-4 — Minor — The designed 404 footer is incomplete and inconsistent

**Location/quote:** The normal footer contains “Privacy,” “Terms,” “Built by
Param Factory,” and “v1.3.” The `/404` footer contains only “Twenty short visual
challenges about confidence. · Built by Param Factory · v1.3”.

**Why this matters:** The site-structure contract requires the same footer
destinations on every route. A visitor who reaches the error page loses the
footer Privacy and Terms links.

**Concrete fix:** Give `public/404.html` the same product line, Privacy link,
Terms link, factory credit, and version as the application footer.

### F-1-5 — Minor — The skip link is mislabeled on legal pages

**Location/quote:** `/privacy` and `/terms` show “Skip to game,” although the
target is legal content in `<main>`.

**Why this matters:** The accessible name promises a game destination that is
not present, so keyboard and screen-reader users receive the wrong instruction.

**Concrete fix:** Use “Skip to main content” in the shared application header.

### F-1-6 — Minor — The demo banner does not use the required sandbox wording

**Location/quote:** `/demo`: “Demo — sample game, nothing is saved”. The demo
contract specifies “Demo — sample data, nothing is saved”.

**Why this matters:** The entry action says “sample data,” while the banner
switches to “sample game.” This weakens the required persistent state cue.

**Concrete fix:** Change the banner to “Demo — sample data, nothing is saved”
and keep **Reset demo** and **Start for real** beside it.

### F-1-7 — Minor — The same game concepts use inconsistent terms

**Location/quote:** The landing page mixes “20 levels,” “visual challenges,”
“loaded challenge,” “isolated 20-level game,” “this run,” and “Next challenge.”
`.factory/copy-audit.md` says a session is always a “run” and an item is always
a “level,” which the live copy does not follow.

**Why this matters:** A new visitor must infer whether a game, run, level, and
challenge are different things.

**Concrete fix:** Use **game** for the full 20-item session and **challenge**
for one item everywhere. For example: “20 challenges,” “It will not change
your game,” and “Challenge 1 of 20.” Update the terminology table to match.

### F-1-8 — Minor — The headline uses specialist language instead of naming the action

**Location/quote:** “Calibrate confidence with visual challenges.”

**Why this matters:** “Calibrate” is the concept the product teaches; it is not
the plain action a distracted first-time visitor already knows. The following
sentence has to decode the headline.

**Concrete fix:** Use “Compare your confidence with your answers.” This is a
seven-word, verb-first description of the actual result.

### F-1-9 — Minor — README uses the jargon phrase “pacing budget”

**Location/quote:** “The duration uses a measured per-level pacing budget for
reading, choosing, setting confidence, and checking feedback.”

**Why this matters:** “Per-level pacing budget” describes the test mechanism,
not what a reader needs to know.

**Concrete fix:** “The 4–6 minute estimate allows 12–18 seconds for each
challenge.”

### F-1-10 — Minor — README explains daily play with implementation jargon

**Location/quote:** “Each UTC date creates a deterministic daily set from its
displayed `SS-YYYYMMDD` seed.”

**Why this matters:** “Deterministic” and “seed” make the basic daily rule
harder to parse.

**Concrete fix:** “Each UTC date generates the same 20 challenges from the code
shown in the game.”

### F-1-11 — Minor — README states the frame-rate check in test jargon

**Location/quote:** “The 390px Chromium regression accepts at least 55 FPS
across 60 animation frames.”

**Why this matters:** “Chromium regression” hides the useful fact inside test
terminology.

**Concrete fix:** “The mobile browser test measures 60 frames and requires at
least 55 frames per second at 390 px.”

### F-1-12 — Minor — README calls the home page “the root”

**Location/quote:** “The root opens today’s active game.”

**Why this matters:** “Root” is developer shorthand and is less direct than
the name of the destination.

**Concrete fix:** “Open the home page to play today’s game.”

### F-1-13 — Minor — README exposes storage implementation before explaining the behavior

**Location/quote:** “Open `/demo` for the isolated sample game; its data uses
`demo:*` localStorage keys and never changes `sure-shot:*` real-game keys.”

**Why this matters:** A visitor has to parse key prefixes and `localStorage` to
understand the useful privacy guarantee.

**Concrete fix:** “Open `/demo` for a sample game. Demo progress uses separate
browser storage and cannot overwrite your daily game.” Put the exact key names
in `.factory/demo.md` only.

### F-1-14 — Minor — A 29-word README sentence exceeds the copy limit

**Location/quote:** “`staticwebapp.config.json` rewrites only the known app
routes, returns the designed `/404.html` page with HTTP 404 for unknown routes,
and provides cache and security headers for Azure Static Web Apps.”

**Why this matters:** It exceeds the 22-word hard cap and combines routing,
error handling, caching, security, and hosting in one sentence.

**Concrete fix:** “The deployment config rewrites known app routes. Unknown
routes return `/404.html` with HTTP 404. It also adds cache and security
headers.”

### F-1-15 — Minor — Two README deployment claims are absent from `claims.json`

**Location/quote:** “The static production files are written to `dist/` by
`npm run build`.” The following paragraph also claims that the deployment
config rewrites known routes, returns HTTP 404, and adds cache and security
headers.

**Why this matters:** Both statements are observable promises a deployer can
rely on. The build and deployment unit test currently support them, but neither
has a claim entry or a uniquely tagged claim test.

**Concrete fix:** Add `build-output` and `static-routing` entries to
`.factory/claims.json`, each with one tagged test that asserts the stated
artifact or response behavior. Alternatively remove these claim-like
sentences and leave them as commands with expected output.

### F-1-16 — Minor — A daily game has no spoiler-free result sharing

**Location/quote:** The result screen ends with “Play a fresh practice run.” It
offers no copy or share action.

**Why this matters:** A normal player of a dated daily game expects to share a
result without revealing answers. That is the clearest missed leverage; AI,
sync, and accounts would add unnecessary privacy and operating cost here.

**Concrete fix:** Add **Copy daily result** after the calibration summary. Copy
the date code, score, and confidence/accuracy gaps without answers. Keep the
action local, add a failure message for denied clipboard access, and list/test
the copy claim in `claims.json`.

## Cold first read

Fresh contexts were opened without stored data and without scrolling.

| Viewport | What it does | For whom | What to click first | Result |
|---|---|---|---|---|
| 390 × 844 | Compares confidence with answers across visual challenges | Curious adults seeking a short daily mental game | **Try it with sample data** | Pass |
| 1440 × 900 | Same | Same | **Try it with sample data** | Pass |

At 390 px, the headline ends at y=273, the audience sentence at y=355, the
button at y=415, and all three facts at y=589. The active challenge begins at
y=744, so the first screen also visibly leads into the product. There is no
blocking first-read finding.

## Copy audit

Counts are whitespace-delimited words; standalone separator marks are not
words. Navigation labels, headings, controls, values, and the screen-reader
announcement are included so the audit is complete. No banned marketing word
appears. All action buttons name an action or result.

### Live landing page

| Copy unit | Words | Flag |
|---|---:|---|
| Skip to game | 3 | F-1-5 on non-game routes |
| Sure Shot | 2 | — |
| Demo | 1 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| 20 levels · 4–6 minutes | 4 | F-1-7 |
| Calibrate confidence with visual challenges | 5 | F-1-8; F-1-7 |
| For curious adults who want a daily mental game that compares confidence with answers. | 14 | — |
| Try it with sample data | 5 | — |
| Open an isolated 20-level game. | 5 | F-1-7 |
| It will not change this run. | 6 | F-1-7 |
| Private: scores stay in this browser. | 6 | — |
| Connection: finish a loaded challenge offline. | 6 | F-1-7 |
| Price: free to play. | 4 | — |
| Level 1 of 20 · Visual estimate · SS-20260902 | 7 | F-1-7 |
| Use timing assist | 3 | — |
| How many marks are on this card? | 7 | — |
| Count the marks if you want. | 6 | — |
| Quick estimates are welcome too. | 5 | — |
| 24 / 27 / 21 | 3 | — |
| How sure are you? | 4 | — |
| 75% | 1 | — |
| 50% means a close call. | 5 | — |
| 100% means you expect to be right. | 7 | — |
| Lock in answer and confidence | 5 | — |
| Twenty short visual challenges about confidence. | 6 | F-1-7 |
| Built by Param Factory · v1.3 | 5 | — |
| Illustration generated for Sure Shot. | 5 | F-1-2 |
| Now viewing: Calibrate confidence with visual challenges | 7 | F-1-8 |

The demo-only banner is five words excluding the separator: “Demo — sample
game, nothing is saved.” It is flagged as F-1-6.

### README

Code blocks are commands, not sentences, and are not counted.

| Copy unit | Words | Flag |
|---|---:|---|
| Sure Shot | 2 | — |
| Sure Shot is a 20-level, 4–6 minute daily mental game for curious adults who want to compare confidence with answers. | 20 | F-1-7 |
| Play with a keyboard, mouse, or touch. | 7 | — |
| The duration uses a measured per-level pacing budget for reading, choosing, setting confidence, and checking feedback. | 16 | F-1-9 |
| Each UTC date creates a deterministic daily set from its displayed `SS-YYYYMMDD` seed. | 13 | F-1-10 |
| An unfinished game keeps that seed after midnight. | 8 | F-1-10 |
| Timing assist adds exactly 1.5 seconds to each timing target. | 10 | — |
| The 390px Chromium regression accepts at least 55 FPS across 60 animation frames. | 13 | F-1-11 |
| Run | 1 | — |
| Open `http://localhost:5173`. | 2 | — |
| The root opens today’s active game. | 6 | F-1-12 |
| Open `/demo` for the isolated sample game; its data uses `demo:*` localStorage keys and never changes `sure-shot:*` real-game keys. | 19 | F-1-13 |
| Test and build | 3 | — |
| Run every exact command in `.factory/claims.json` before release. | 8 | — |
| The static production files are written to `dist/` by `npm run build`. | 12 | F-1-15 |
| Privacy and scope | 3 | — |
| Scores and settings stay in the browser. | 7 | — |
| The game has no account, payment step, analytics, or third-party requests. | 11 | — |
| It sends no game answers, confidence, or identity to a server. | 11 | — |
| After a game page loads, you can finish its current challenge while offline. | 13 | F-1-7 |
| Read the in-app `/privacy` and `/terms` pages for details. | 9 | — |
| Deploy | 1 | — |
| Deploy `dist/` as a static site. | 6 | — |
| `staticwebapp.config.json` rewrites only the known app routes, returns the designed `/404.html` page with HTTP 404 for unknown routes, and provides cache and security headers for Azure Static Web Apps. | 29 | F-1-14; F-1-15 |

## Demo and sandbox

The demo gate passes apart from banner wording F-1-6.

- One click from the live home screen opened `/demo` directly on a populated
  visual-estimate challenge with three answers and confidence input.
- The banner persisted with **Reset demo** and **Start for real**.
- A seeded `sure-shot:active` value was byte-for-byte unchanged after a demo
  answer and after **Reset demo**.
- Reset returned the sample to challenge 1 with no answers.
- **Start for real** removed all `demo:*` keys and created only
  `sure-shot:active`.
- A loaded challenge produced feedback after Playwright set the context
  offline.
- A fresh live demo completed all 20 challenges and reached “See how your
  confidence matched,” a 6/20 score, and four calibration rows.
- That full run made only `GET /demo` and GET requests for the two hashed local
  assets. Every request was same-origin and payload-free; no console or page
  error occurred.

## Claims

All 15 listed claim commands were run separately after `npm ci` from the clean
candidate checkout.

| Claim | Exact command | Result |
|---|---|---|
| complete-run | `npx playwright test --grep @claim:complete-run` | PASS — 1 test |
| restart-run | `npx playwright test --grep @claim:restart-run` | PASS — 1 test |
| daily-levels | `npx playwright test --grep @claim:daily-levels` | PASS — 1 test |
| session-length | `npx playwright test --grep @claim:session-length` | PASS — 1 test |
| input-methods | `npx playwright test --grep @claim:input-methods` | PASS — 1 test |
| seed-resume | `npx playwright test --grep @claim:seed-resume` | PASS — 1 test |
| demo-isolation | `npx playwright test --grep @claim:demo-isolation` | PASS — 1 test |
| local-scores | `npx playwright test --grep @claim:local-scores` | PASS — 1 test |
| no-server-data | `npx playwright test --grep @claim:no-server-data` | PASS — 1 test |
| loaded-offline | `npx playwright test --grep @claim:loaded-offline` | PASS — 1 test |
| assist-persist | `npx playwright test --grep @claim:assist-persist` | PASS — 1 test |
| assist-seconds | `npx playwright test --grep @claim:assist-seconds` | PASS — 1 test |
| free-play | `npx playwright test --grep @claim:free-play` | PASS — 1 test |
| no-account | `npx playwright test --grep @claim:no-account` | PASS — 1 test |
| fps-60 | `npx playwright test --grep @claim:fps-60` | PASS — 1 test |

The claim suite meaningfully exercises observable outcomes, including all 20
generated challenges, the pacing model, separate browser contexts for touch
and offline checks, and a payload-aware request allowlist. F-1-15 is the only
claim-inventory gap found on the landing page or README.

## Earlier-history audit

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files in
the working tree or Git history. I also rechecked every defect recorded in
`.factory/verification-2.md` through `verification-4.md` and the repair notes
in `.factory/handoff.md`.

| Earlier finding | Live and code confirmation | Result |
|---|---|---|
| Pattern recall had no pictured options | Distinct diagrams and complete text labels are rendered; unit/browser checks pass | Fixed |
| Daily seed did not vary 20 levels | Two dated seeds produce distinct deterministic 20-item sets | Fixed |
| Root did not show active play | Challenge 1 begins in the cold viewport at both widths | Fixed |
| 60 FPS claim/test absent | Listed `fps-60` test passed above 55 FPS | Fixed |
| Initial focus skipped header/skip link | Fresh load leaves normal order; first Tab reaches the skip link | Fixed |
| Audience absent on first screen | Audience sentence is visible before scrolling | Fixed |
| Visual challenges inaccessible | Dots, patterns, and spatial choices have text alternatives; arrow-key behavior passes | Fixed |
| Published claims missing or weak | Former gaps are listed and their tagged tests pass | Fixed |
| Malformed storage blanked the app | Invalid state is cleared and a fresh usable run is announced | Fixed |
| Unknown routes were soft 404s | `/404` and an unknown URL return HTTP 404 with the designed page | Fixed |
| Demo title was not route-specific | `/demo` title is “Demo — Sure Shot” | Fixed |
| Mobile links were under 44 px | Every visible control checked at 390 px is at least 44 px high and wide | Fixed |
| 4–6 minute claim was not measured | Tagged test sums 20 per-challenge budgets and asserts 240–360 seconds | Fixed |
| No-server-data claim was absent | Manifest entry and payload-aware full-run test now exist and pass | Fixed |
| Direct `/404` returned 200 | Fresh GET returns HTTP 404 | Fixed |

No earlier finding regressed.

## Structure, accessibility, and build evidence

- `/`, `/demo`, `/privacy`, and `/terms` return 200. `/404` and a random
  unknown route return 404 with the designed page.
- Every known page has `lang="en"`, one `<h1>`, one `<main>`, the consistent
  header, route-specific document title/description/canonical, and no
  horizontal overflow at 390 px. F-1-3 and F-1-4 record the remaining metadata
  and footer exceptions.
- Every crawled product link returned its expected 200 or 404 status. Browser
  Back restored `/` and focused its `<h1>`; client navigation focused the new
  route heading.
- All visible controls measured at least 44 × 44 CSS px at 390 px.
- Live axe checks found zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and `/404`. The fleet verifier passed `/` and `/demo` with no console errors.
- Reduced-motion behavior, keyboard input, mouse input, and touch input pass the
  browser suite.
- Live Lighthouse on `/demo`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0.
- `npm test`: 8/8 passed. `npm run typecheck`, `npm run lint`, and
  `npm run build` passed. `npx playwright test`: 26/26 passed.
- The build emits 19.40 kB JavaScript (7.32 kB gzip) and 11.64 kB CSS (3.36 kB
  gzip). Live HTML, JavaScript, and CSS SHA-256 hashes match the local build.
- The 1200 × 630 social image, SVG favicon, 180-unit apple-touch artwork,
  `robots.txt`, sitemap, self-only CSP, `nosniff`, referrer policy, and HSTS are
  present.

The standalone `@axe-core/cli` command could not start because this container
has no ChromeDriver binary. This is not an untested accessibility area: the
required Playwright axe alternative ran against all live routes above, and the
repository's Playwright suite also checks active and result states.

## What would make this perfect

Resolve F-1-1 through F-1-16, rerun the full claim and browser suites, deploy,
then repeat this review from fresh mobile and desktop contexts. The acceptance
target is zero findings: the documented hero composition is visible, the full
landing skeleton is present, every route shares accurate metadata and footer
content, every sentence uses one plain terminology set, every README promise
is listed and tested, and the result screen can copy a spoiler-free daily
summary.
