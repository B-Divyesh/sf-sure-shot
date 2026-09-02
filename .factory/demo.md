# Demo sandbox

Open `/demo` (or `/?demo=1`) to begin the sample five-round game immediately.
The demo has the full deterministic round set: two mark estimates, one pattern,
one timing round, and one spatial rotation. It uses only the `demo:active`
localStorage key. The real game uses `sure-shot:active` instead. The persistent
banner has **Reset demo**, which clears the demo key and starts a new sample
game, and **Start for real**, which discards the demo key before creating a
separate local game.
