# Demo sandbox

Open `/demo` (or `/?demo=1`) to begin the sample five-round game immediately.
The demo has the full deterministic round set: two mark estimates, one pattern,
one timing round, and one spatial rotation. It uses the `demo:active` and
`demo:settings` localStorage keys. The real game uses `sure-shot:active` and
`sure-shot:settings` instead. The persistent
banner has **Reset demo**, which clears the demo keys and starts a new sample
game, and **Start for real**, which discards the demo keys before creating a
separate local game.
