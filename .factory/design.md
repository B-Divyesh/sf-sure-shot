# Sure Shot visual system

## Direction

Sure Shot uses a dithered / halftone print system: a late-night pocket puzzle
sheet printed in ink, not a clinical scorecard. The texture makes uncertainty
feel playful and tangible while the large, calm numbers keep each decision easy
to read.

## Palette

* Paper `#f5eddc` — warm background.
* Ink `#18221e` — primary text and rules.
* Moss `#315b48` — surfaces and confident states.
* Tomato `#b94432` — action and overconfident states.
* Sun `#f1bd43` — timing signal and underconfident states.
* Mist `#d9e0d4` — quiet surfaces.
* Chalk `#fffaf0` — contrast text on dark surfaces.

Ink on paper and chalk on moss have at least 4.5:1 contrast. The single-mode
paper palette is deliberate: it reads like a daily printed game card.

## Type and layout

Headlines use Georgia (a sturdy editorial serif), and interface copy uses the
local system sans-serif stack. The 8px scale sets all gaps. A wide asymmetric
hero art panel balances a narrow task panel; at phone width these stack with the
task first. Buttons have square-ish corners, strong outlines, and 44px targets.

## Interaction and motion

Confidence is always a labeled range, never color alone. The signature motion
is a short ink-stamp settle when an answer is judged. It runs once, lasts 220ms,
and becomes instant under `prefers-reduced-motion`. Dither texture is static;
there are no flashing effects. The game uses a fixed 60 Hz timing loop for the
timing round and pauses when the tab is hidden.

## Art plan and provenance

One original hero illustration shows abstract measurement objects, a pattern
grid, and a stop-watch on warm paper, rendered as a restrained screenprint. It
is decorative context; all game information stays in HTML/canvas. Generated
using the factory image deployment on 2026-09-02. Prompt: “Editorial
screenprint illustration for a playful confidence calibration browser game,
abstract ruler, stop-watch, spatial blocks and pattern tiles floating on warm
cream paper, limited forest green tomato red and mustard yellow ink, visible
halftone dots, imperfect registration, lots of quiet negative space, no people,
no text, no logos, no watermark.” The asset is original generated imagery and
is disclosed in the footer. A WebP derivative is used below 300 KB.

## Difficulty curve

Each daily run has five seeded rounds. The visual estimate asks for a rough
count; pattern recall grows from four to five positions; timing targets 3.2
seconds; spatial judgment rotates a 2×2 shape; the final estimate uses a more
crowded arrangement. Assist mode slows the timing target by 1.5 seconds.
