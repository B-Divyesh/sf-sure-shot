import "./style.css";
import {
  answerFor,
  calibration,
  isSavedRun,
  LEVEL_COUNT,
  newRun,
  roundsForSeed,
  takeaway,
  type Run,
} from "./game";

type Settings = { assist: boolean; motion: boolean };
type State = {
  demo: boolean;
  run: Run | null;
  settings: Settings;
  selected: string | null;
  confidence: number;
  timerStarted: number | null;
  elapsed: number;
  patternShown: boolean;
  patternStarted: boolean;
  explanation: boolean;
  recovered: boolean;
};

const app = document.querySelector<HTMLDivElement>("#app")!;
const storageKey = (demo: boolean) => `${demo ? "demo:" : "sure-shot:"}active`;
const settingsKey = (demo: boolean) =>
  `${demo ? "demo:" : "sure-shot:"}settings`;
let state: State = loadState(
  location.pathname === "/demo" ||
    new URLSearchParams(location.search).get("demo") === "1",
);
let raf = 0;
let accumulator = 0;
let previous = performance.now();
let hiddenAt = 0;

function loadState(demo: boolean): State {
  const saved = readStored(storageKey(demo));
  const validRun = isSavedRun(saved.value) ? saved.value : null;
  const recovered = saved.found && !validRun;
  if (recovered) localStorage.removeItem(storageKey(demo));

  const storedSettings = readStored(settingsKey(demo)).value;
  const settings = isSettings(storedSettings) ? storedSettings : {
    assist: false,
    motion: true,
  };
  return {
    demo,
    // A run owns its seed so an unfinished game remains stable after midnight.
    run: validRun ?? newRun(),
    settings,
    selected: null,
    confidence: 75,
    timerStarted: null,
    elapsed: 0,
    patternShown: false,
    patternStarted: false,
    explanation: false,
    recovered,
  };
}
function readStored(key: string): { found: boolean; value: unknown } {
  const value = localStorage.getItem(key);
  if (!value) return { found: false, value: null };
  try {
    return { found: true, value: JSON.parse(value) };
  } catch {
    return { found: true, value: null };
  }
}
function isSettings(value: unknown): value is Settings {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Settings).assist === "boolean" &&
    typeof (value as Settings).motion === "boolean"
  );
}
function saveRun() {
  if (state.run)
    localStorage.setItem(storageKey(state.demo), JSON.stringify(state.run));
}
function escape(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}
function route(path: string) {
  history.pushState({}, "", path);
  state = loadState(path === "/demo");
  render(true);
}
function setTitle(title: string) {
  document.title = title;
}
function setRouteMeta(path: string) {
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  const normalized = path === "/" ? "/" : path;
  if (canonical) canonical.href = `https://sure-shot.sociobot.in${normalized}`;
  const description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (description)
    description.content =
      path === "/demo"
        ? "Try a sample Sure Shot confidence game without changing your saved game."
        : path === "/privacy"
        ? "Read how Sure Shot keeps game data in your browser."
        : path === "/terms"
          ? "Read the terms for the Sure Shot entertainment game."
          : "Play twenty visual challenges and compare your confidence with your answers.";
}
function header() {
  return `<a class="skip" href="#main">Skip to game</a><header><a class="wordmark" href="/" data-route>Sure Shot<span>●</span></a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a></nav></header>`;
}
function footer() {
  return `<footer><p>Twenty short visual challenges about confidence.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · Built by Param Factory · v1.2</p><p>Illustration generated for Sure Shot.</p></footer>`;
}
function demoBar() {
  return state.demo
    ? `<aside class="demo-bar" aria-label="Demo controls"><strong>Demo — sample game, nothing is saved</strong><button data-action="reset-demo">Reset demo</button><button data-action="start-real">Start for real</button></aside>`
    : "";
}
function dots(count: number) {
  return `<div class="dot-field" role="img" aria-label="A group of ${count} dark marks to estimate">${Array.from({ length: count }, () => "<i></i>").join("")}</div>`;
}
function patternDescription(values: number[]) {
  const names = ["top left", "top middle", "top right", "middle left", "center", "middle right", "bottom left", "bottom middle", "bottom right"];
  return `filled tiles: ${values.map((value) => names[value]).join(", ")}`;
}
function spatialDescription(code: string) {
  const names = ["top left", "top right", "bottom left", "bottom right"];
  const filled = [...code]
    .map((value, index) => (value === "1" ? names[index] : null))
    .filter((name): name is string => Boolean(name));
  return `a two by two shape with filled squares at ${filled.join(", ")}`;
}
function grid(values: number[], label: string) {
  return `<div class="pattern" role="img" aria-label="${escape(label || patternDescription(values))}">${Array.from({ length: 9 }, (_, i) => `<i class="${values.includes(i) ? "on" : ""}"></i>`).join("")}</div>`;
}
function spatial(code: string) {
  return `<span class="shape" aria-hidden="true">${[...code].map((v) => `<i class="${v === "1" ? "on" : ""}"></i>`).join("")}</span>`;
}
function pageShell(content: string) {
  app.innerHTML = `${header()}${demoBar()}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="sr-only" aria-live="polite" id="announce"></div>`;
  bind();
}
function game() {
  const run = state.run!;
  if (run.phase === "results") return results();
  const dailyRounds = roundsForSeed(run.seed);
  const round = dailyRounds[run.round];
  setTitle(state.demo ? "Demo — Sure Shot" : "Sure Shot — Daily confidence game");
  const isTiming = round.kind === "Timing";
  const choiceMarkup = round.choices.map((choice, index) => {
    const optionPattern = round.optionPatterns?.[index];
    const description = optionPattern ? patternDescription(optionPattern) : "";
    const visual = optionPattern ? `<span class="choice-pattern" aria-hidden="true">${grid(optionPattern, "")}</span>` : "";
    const spatialDetail = round.kind === "Spatial judgment" ? spatialDescription(round.spatial![index + 1]) : "";
    const choiceDescription = description || spatialDetail;
    const tabIndex = state.selected === choice || (!state.selected && index === 0) ? 0 : -1;
    return `<button role="radio" tabindex="${tabIndex}" aria-checked="${state.selected === choice}" aria-label="${escape(`${choice}${choiceDescription ? ` — ${choiceDescription}` : ""}`)}" class="choice ${state.selected === choice ? "selected" : ""}" data-choice="${escape(choice)}"><span>${escape(choice)}</span>${visual}${round.kind === "Spatial judgment" ? spatial(round.spatial![index + 1]) : ""}</button>`;
  }).join("");
  const selection = isTiming
    ? state.timerStarted
      ? `<p class="timer-readout" aria-live="polite">${state.elapsed.toFixed(2)} s</p><button class="danger" data-action="stop-timer">Stop timer</button>`
      : `<button class="primary" data-action="start-timer">Start timer</button>`
    : round.kind === "Pattern recall" && state.patternShown
      ? ""
    : `<div class="choices" role="radiogroup" aria-label="Answer choices">${choiceMarkup}</div>`;
  let challenge = "";
  if (round.dots) challenge = dots(round.dots);
  if (round.kind === "Pattern recall") {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    challenge = state.patternShown
      ? `<div class="pattern-stage">${grid(round.pattern!, "Remember this pattern")}${reducedMotion ? `<div class="pattern-ready"><strong>The pattern stays visible while reduced motion is on.</strong><button class="quiet" data-action="hide-pattern">Hide pattern and choose an answer</button></div>` : ""}</div>`
      : `<div class="pattern-stage muted-stage"><strong>Choose the pattern you saw.</strong></div>`;
  }
  if (isTiming) {
    const target = (round.target ?? 3.2) + (state.settings.assist ? 1.5 : 0);
    challenge = `<div class="timer-stage"><span aria-hidden="true">◷</span><p>Target: ${target.toFixed(1)} seconds</p></div>`;
  }
  if (round.kind === "Spatial judgment")
    challenge = `<div class="spatial-stage" role="img" aria-label="Starting shape: ${escape(spatialDescription(round.spatial![0]))}. Turn it clockwise once."><span class="shape large">${spatial(round.spatial![0])}</span><span class="turn" aria-hidden="true">↻</span></div>`;
  const feedback = run.phase === "feedback" ? feedbackPanel() : "";
  pageShell(
    `<section class="game-screen">${!state.demo ? `<section class="game-first-read" aria-labelledby="game-intro-title"><p class="eyebrow">20 levels · 4–6 minutes</p><h1 id="game-intro-title">Calibrate confidence with visual challenges</h1><p>For curious adults who want a daily mental game that compares confidence with answers.</p><div class="intro-action"><button class="primary" data-action="demo">Try it with sample data</button><span>Open an isolated 20-level game. It will not change this run.</span></div><ul class="game-facts"><li>Private: scores stay in this browser.</li><li>Connection: finish a loaded challenge offline.</li><li>Price: free to play.</li></ul></section>` : ""}${state.recovered ? `<p class="recovery" role="status">Your saved game could not be restored. A fresh run has started.</p>` : ""}<div class="run-top"><p class="eyebrow">Level ${run.round + 1} of ${LEVEL_COUNT} · ${round.kind} · ${run.seed}</p><button class="quiet" data-action="toggle-assist">${state.settings.assist ? "Assist mode on" : "Use timing assist"}</button></div><progress class="round-progress" aria-label="Level progress" max="${LEVEL_COUNT}" value="${run.round + 1}">${run.round + 1} of ${LEVEL_COUNT}</progress><h${state.demo ? "1" : "2"} class="round-question">${round.prompt}</h${state.demo ? "1" : "2"}><p class="round-detail">${round.detail}</p><div class="challenge">${challenge}</div>${selection}<div class="confidence"><label for="confidence">How sure are you? <output id="confidence-value">${state.confidence}%</output></label><input id="confidence" type="range" min="50" max="100" step="5" value="${state.confidence}" aria-describedby="confidence-help" /><p id="confidence-help">50% means a close call. 100% means you expect to be right.</p></div>${!isTiming && run.phase === "answer" ? `<button class="primary lock" data-action="lock" ${state.selected ? "" : "disabled"}>Lock in answer and confidence</button>` : ""}${feedback}</section>`,
  );
  if (
    round.kind === "Pattern recall" &&
    !state.patternStarted &&
    run.phase === "answer"
  ) {
    state.patternStarted = true;
    state.patternShown = true;
    render();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(() => {
        if (state.run?.round === run.round && state.run.phase === "answer") {
          state.patternShown = false;
          render();
        }
      }, 2000);
    }
  }
}
function feedbackPanel() {
  const answer = state.run!.answers.at(-1)!;
  return `<section class="feedback ${answer.correct ? "right" : "wrong"}" tabindex="-1"><p class="eyebrow">${answer.correct ? "Correct" : "Not this time"}</p><h2>${answer.correct ? "Your answer held up." : `The answer was ${answer.answer}.`}</h2><p>You were ${answer.confidence}% sure.</p><button class="primary" data-action="next">${state.run!.round === LEVEL_COUNT - 1 ? "See calibration" : "Next challenge"}</button></section>`;
}
function results() {
  const answers = state.run!.answers;
  const rows = calibration(answers);
  setTitle("Sure Shot — Your calibration");
  pageShell(
    `<section class="results"><p class="eyebrow">${LEVEL_COUNT} levels complete</p><h1>See how your confidence matched</h1><p class="lead">Accuracy is how often you were right. Confidence is what you said before seeing the answer.</p><div class="score-line"><strong>${answers.filter((a) => a.correct).length}/${LEVEL_COUNT}</strong><span>answers correct</span></div><section class="chart" aria-labelledby="chart-title"><h2 id="chart-title">Confidence by challenge type</h2>${rows.map((row) => `<div class="chart-row"><div><strong>${row.kind}</strong><span>${row.gap > 8 ? "More sure than accurate" : row.gap < -8 ? "Less sure than accurate" : "Close match"}</span></div><div class="bars"><label>Confidence ${row.confidence}%<progress class="confidence-bar" max="100" value="${row.confidence}">${row.confidence}%</progress></label><label>Accuracy ${row.accuracy}%<progress class="accuracy-bar" max="100" value="${row.accuracy}">${row.accuracy}%</progress></label></div></div>`).join("")}</section><section class="takeaway"><h2>One takeaway</h2><p>${takeaway(answers)}</p></section><button class="text-button" data-action="explain">${state.explanation ? "Hide calibration explanation" : "What does calibration mean?"}</button>${state.explanation ? `<section class="explanation"><h2>How to read this</h2><p>Across many choices, 70% confidence should be right about seven times in ten. ${LEVEL_COUNT} levels give a fuller daily sample.</p></section>` : ""}<div class="actions"><button class="primary" data-action="again">Play a fresh practice run</button></div></section>`,
  );
}
function infoPage(kind: "privacy" | "terms") {
  const privacy = kind === "privacy";
  setTitle(`${privacy ? "Privacy" : "Terms"} — Sure Shot`);
  pageShell(
    `<article class="legal"><h1>${privacy ? "Privacy for a local game" : "Terms for a local game"}</h1>${privacy ? "<p>Sure Shot stores an active game and your settings in this browser. It does not send game answers, confidence, or identity to a server.</p><p>Demo games use a separate local browser key. Resetting the demo removes that sample game.</p><p>You can clear stored game data in your browser settings at any time.</p>" : "<p>Sure Shot is a free entertainment game. It is not an intelligence test, medical tool, or diagnosis.</p><p>Use it for personal play. The game is provided as is.</p>"}</article>`,
  );
}
function notFound() {
  setTitle("Page not found — Sure Shot");
  pageShell(
    `<section class="not-found"><h1>Page not found</h1><p>This address does not lead to a Sure Shot page.</p><a class="primary button-link" href="/" data-route>Return home</a></section>`,
  );
}
function render(focusHeading = false) {
  cancelAnimationFrame(raf);
  const path = location.pathname;
  setRouteMeta(path);
  if (path === "/privacy") infoPage("privacy");
  else if (path === "/terms") infoPage("terms");
  else if (path === "/404") notFound();
  else if (path === "/" || path === "/demo") game();
  else notFound();
  const heading = document.querySelector<HTMLElement>("h1");
  if (focusHeading && heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  const announcement = document.querySelector("#announce");
  if (announcement && heading)
    announcement.textContent = `Now viewing: ${heading.textContent}`;
}
function selectChoice(choice: string) {
  state.selected = choice;
  document
    .querySelectorAll<HTMLButtonElement>("[data-choice]")
    .forEach((button) => {
      const selected = button.dataset.choice === choice;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  const lock = document.querySelector<HTMLButtonElement>(
    '[data-action="lock"]',
  );
  if (lock) lock.disabled = false;
}
function bind() {
  document.querySelectorAll<HTMLElement>("[data-route]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      route((a as HTMLAnchorElement).pathname);
    }),
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-action]")
    .forEach((b) => b.addEventListener("click", () => act(b.dataset.action!)));
  document
    .querySelectorAll<HTMLButtonElement>("[data-choice]")
    .forEach((b) => {
      b.addEventListener("click", () => selectChoice(b.dataset.choice!));
      b.addEventListener("keydown", (event) => {
        const choices = [...document.querySelectorAll<HTMLButtonElement>("[data-choice]")];
        const current = choices.indexOf(b);
        let next = current;
        if (event.key === "ArrowRight" || event.key === "ArrowDown")
          next = (current + 1) % choices.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
          next = (current - 1 + choices.length) % choices.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = choices.length - 1;
        else return;
        event.preventDefault();
        const selected = choices[next];
        selectChoice(selected.dataset.choice!);
        selected.focus();
      });
    });
  const range = document.querySelector<HTMLInputElement>("#confidence");
  range?.addEventListener("input", () => {
    state.confidence = Number(range.value);
    const out = document.querySelector("#confidence-value");
    if (out) out.textContent = `${state.confidence}%`;
  });
}
function act(action: string) {
  if (action === "demo") {
    state = loadState(true);
    state.demo = true;
    state.run = newRun();
    saveRun();
    history.pushState({}, "", "/demo");
    render(true);
  }
  if (action === "start-real") {
    localStorage.removeItem("demo:active");
    localStorage.removeItem("demo:settings");
    state = loadState(false);
    state.demo = false;
    state.run = newRun();
    saveRun();
    history.pushState({}, "", "/");
    render(true);
  }
  if (action === "reset-demo") {
    localStorage.removeItem("demo:active");
    localStorage.removeItem("demo:settings");
    state = loadState(true);
    state.demo = true;
    state.run = newRun();
    saveRun();
    render(true);
  }
  if (action === "hide-pattern") {
    state.patternShown = false;
    render();
    document.querySelector<HTMLButtonElement>("[data-choice]")?.focus();
  }
  if (action === "home") {
    state.run = null;
    history.pushState({}, "", state.demo ? "/demo" : "/");
    render(true);
  }
  if (action === "toggle-assist") {
    state.settings.assist = !state.settings.assist;
    localStorage.setItem(
      settingsKey(state.demo),
      JSON.stringify(state.settings),
    );
    render();
    document
      .querySelector<HTMLButtonElement>('[data-action="toggle-assist"]')
      ?.focus();
  }
  if (action === "start-timer") {
    state.timerStarted = performance.now();
    state.elapsed = 0;
    accumulator = 0;
    previous = performance.now();
    render();
    document
      .querySelector<HTMLButtonElement>('[data-action="stop-timer"]')
      ?.focus();
    timingLoop();
    return;
  }
  if (action === "stop-timer" && state.timerStarted) {
    state.selected = "Stop timer";
    lock();
  }
  if (action === "lock") lock();
  if (action === "next") {
    state.run!.round++;
    state.run!.phase = state.run!.round >= LEVEL_COUNT ? "results" : "answer";
    state.selected = null;
    state.confidence = 75;
    state.timerStarted = null;
    state.elapsed = 0;
    state.patternShown = false;
    state.patternStarted = false;
    saveRun();
    render(true);
  }
  if (action === "again") {
    state.run = newRun();
    state.selected = null;
    state.confidence = 75;
    state.patternShown = false;
    state.patternStarted = false;
    state.explanation = false;
    saveRun();
    render(true);
  }
  if (action === "explain") {
    state.explanation = !state.explanation;
    render();
    document
      .querySelector<HTMLButtonElement>('[data-action="explain"]')
      ?.focus();
  }
}
function lock() {
  const run = state.run!;
  const round = roundsForSeed(run.seed)[run.round];
  const judged = answerFor(
    round,
    state.selected!,
    state.elapsed,
    state.settings.assist,
  );
  run.answers.push({
    id: round.id,
    kind: round.kind,
    confidence: state.confidence,
    correct: judged.correct,
    chosen: state.selected!,
    answer: judged.answer,
  });
  run.phase = "feedback";
  saveRun();
  render();
  document.querySelector<HTMLElement>(".feedback")?.focus();
}
function timingLoop(now = performance.now()) {
  if (!state.timerStarted || document.hidden) return;
  const dt = Math.min(100, now - previous);
  previous = now;
  accumulator += dt;
  while (accumulator + 0.0001 >= 1000 / 60) {
    state.elapsed += 1 / 60;
    accumulator -= 1000 / 60;
  }
  const readout = document.querySelector(".timer-readout");
  if (readout) readout.textContent = `${state.elapsed.toFixed(2)} s`;
  raf = requestAnimationFrame(timingLoop);
}
window.addEventListener("popstate", () => {
  state = loadState(location.pathname === "/demo");
  render(true);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = performance.now();
    cancelAnimationFrame(raf);
  } else if (state.timerStarted) {
    previous = performance.now();
    if (hiddenAt) state.timerStarted += performance.now() - hiddenAt;
    timingLoop();
  }
});
render();
