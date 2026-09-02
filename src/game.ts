export type ChallengeKind =
  | "Visual estimate"
  | "Pattern recall"
  | "Timing"
  | "Spatial judgment";

export type Round = {
  id: string;
  level: number;
  kind: ChallengeKind;
  prompt: string;
  answer: string;
  choices: string[];
  detail: string;
  dots?: number;
  pattern?: number[];
  optionPatterns?: number[][];
  spatial?: string[];
  target?: number;
};

export type Answer = {
  id: string;
  kind: ChallengeKind;
  confidence: number;
  correct: boolean;
  chosen: string;
  answer: string;
};
export type Run = {
  round: number;
  answers: Answer[];
  phase: "answer" | "feedback" | "results";
  startedAt: number;
  seed: string;
};

export const LEVEL_COUNT = 20;
export const FRAME_MS = 1000 / 60;

/**
 * A planning proxy for the advertised session length. The budget includes
 * reading, choosing, setting confidence, and checking feedback. Pattern rounds
 * include their two-second preview; timing rounds include their generated
 * target. It is deliberately independent of test automation speed.
 */
export function plannedSeconds(round: Round) {
  if (round.kind === "Pattern recall") return 16;
  if (round.kind === "Timing") return Number(((round.target ?? 3.2) + 11).toFixed(1));
  if (round.kind === "Spatial judgment") return 15;
  return 14;
}

const kinds: ChallengeKind[] = [
  "Visual estimate",
  "Pattern recall",
  "Timing",
  "Spatial judgment",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnswer(value: unknown): value is Answer {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    kinds.includes(value.kind as ChallengeKind) &&
    typeof value.confidence === "number" &&
    Number.isFinite(value.confidence) &&
    value.confidence >= 50 &&
    value.confidence <= 100 &&
    typeof value.correct === "boolean" &&
    typeof value.chosen === "string" &&
    typeof value.answer === "string"
  );
}

/**
 * Only restore complete, internally consistent saved runs. This is deliberately
 * stricter than a type cast: browser storage is user-editable and can outlive
 * a released schema.
 */
export function isSavedRun(value: unknown): value is Run {
  if (
    !isRecord(value) ||
    typeof value.round !== "number" ||
    !Number.isInteger(value.round) ||
    value.round < 0 ||
    value.round > LEVEL_COUNT ||
    !Array.isArray(value.answers) ||
    !value.answers.every(isAnswer) ||
    (value.phase !== "answer" && value.phase !== "feedback" && value.phase !== "results") ||
    typeof value.startedAt !== "number" ||
    !Number.isFinite(value.startedAt) ||
    typeof value.seed !== "string" ||
    !/^SS-\d{8}$/.test(value.seed)
  ) {
    return false;
  }

  if (value.phase === "answer")
    return value.round < LEVEL_COUNT && value.answers.length === value.round;
  if (value.phase === "feedback")
    return value.round < LEVEL_COUNT && value.answers.length === value.round + 1;
  return value.round === LEVEL_COUNT && value.answers.length === LEVEL_COUNT;
}

function hash(value: string) {
  let result = 2166136261;
  for (const char of value) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomFor(seed: string) {
  let value = hash(seed) || 1;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let output = Math.imul(value ^ (value >>> 15), 1 | value);
    output ^= output + Math.imul(output ^ (output >>> 7), 61 | output);
    return ((output ^ (output >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: () => number) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function rotateClockwise(code: string) {
  return `${code[2]}${code[0]}${code[3]}${code[1]}`;
}

function patternKey(values: number[]) {
  return [...values].sort((a, b) => a - b).join(",");
}

function makePattern(random: () => number, filled: number) {
  return shuffle(Array.from({ length: 9 }, (_, index) => index), random)
    .slice(0, filled)
    .sort((a, b) => a - b);
}

function patternOptions(answer: number[], random: () => number) {
  const options = [answer];
  while (options.length < 3) {
    const candidate = makePattern(random, answer.length);
    if (!options.some((value) => patternKey(value) === patternKey(candidate))) options.push(candidate);
  }
  return shuffle(options, random);
}

export function dailySeed(date = new Date()) {
  return `SS-${date.toISOString().slice(0, 10).replaceAll("-", "")}`;
}

/** Builds a reproducible, date-seeded twenty-level daily game. */
export function roundsForSeed(seed: string): Round[] {
  const random = randomFor(seed);
  const spatialShapes = ["1001", "1100", "1010", "0111", "1110", "0101"];
  const rounds: Round[] = [];

  for (let level = 1; level <= LEVEL_COUNT; level++) {
    const cycle = (level - 1) % 4;
    if (cycle === 0) {
      const answer = 10 + Math.floor(random() * 16) + Math.floor(level / 5);
      const offset = 2 + (level % 3);
      rounds.push({
        id: `count-${level}`,
        level,
        kind: "Visual estimate",
        prompt: "How many marks are on this card?",
        answer: String(answer),
        choices: shuffle([answer - offset, answer, answer + offset].map(String), random),
        detail: "Count the marks if you want. Quick estimates are welcome too.",
        dots: answer,
      });
    } else if (cycle === 1) {
      const pattern = makePattern(random, 4 + Math.floor(level / 9));
      const options = patternOptions(pattern, random);
      const answerIndex = options.findIndex((option) => patternKey(option) === patternKey(pattern));
      rounds.push({
        id: `pattern-${level}`,
        level,
        kind: "Pattern recall",
        prompt: "Which pattern did you just see?",
        answer: `Pattern ${"ABC"[answerIndex]}`,
        choices: ["Pattern A", "Pattern B", "Pattern C"],
        detail: "Remember the filled tiles. The three pictured choices replace the preview.",
        pattern,
        optionPatterns: options,
      });
    } else if (cycle === 2) {
      const target = Number((2.6 + random() * 1.5 + Math.floor(level / 12) * 0.2).toFixed(1));
      rounds.push({
        id: `timing-${level}`,
        level,
        kind: "Timing",
        prompt: `Stop the timer as close to ${target.toFixed(1)} seconds as you can.`,
        answer: `within 0.45 seconds of ${target.toFixed(1)}`,
        choices: ["Stop timer"],
        detail: "Start, estimate, then stop. Assist mode adds 1.5 seconds to the target.",
        target,
      });
    } else {
      const base = spatialShapes[Math.floor(random() * spatialShapes.length)];
      const answerShape = rotateClockwise(base);
      const options = shuffle(
        [answerShape, ...shuffle(spatialShapes.filter((shape) => shape !== answerShape), random).slice(0, 2)],
        random,
      );
      const answerIndex = options.indexOf(answerShape);
      rounds.push({
        id: `spatial-${level}`,
        level,
        kind: "Spatial judgment",
        prompt: "Which option is the left shape after one clockwise turn?",
        answer: `Option ${"ABC"[answerIndex]}`,
        choices: ["Option A", "Option B", "Option C"],
        detail: "Picture the dark squares turning one quarter turn.",
        spatial: [base, ...options],
      });
    }
  }
  return rounds;
}

export function newRun(date = new Date()): Run {
  return { round: 0, answers: [], phase: "answer", startedAt: Date.now(), seed: dailySeed(date) };
}

export function answerFor(round: Round, chosen: string, elapsed: number | undefined, assist: boolean) {
  if (round.kind === "Timing") {
    const target = (round.target ?? 3.2) + (assist ? 1.5 : 0);
    return { correct: Math.abs((elapsed ?? 0) - target) <= 0.45, answer: `within 0.45 seconds of ${target.toFixed(1)}` };
  }
  return { correct: chosen === round.answer, answer: round.answer };
}

/** Deterministic fixed-step accounting used to regression-test the 60 Hz loop. */
export function fixedSteps(frameTimes: number[]) {
  let previous = frameTimes[0] ?? 0;
  let accumulator = 0;
  let steps = 0;
  for (const now of frameTimes.slice(1)) {
    accumulator += Math.min(100, now - previous);
    previous = now;
    while (accumulator + 0.0001 >= FRAME_MS) {
      steps++;
      accumulator -= FRAME_MS;
    }
  }
  return steps;
}

export function calibration(answers: Answer[]) {
  const byKind = new Map<string, Answer[]>();
  answers.forEach((answer) => byKind.set(answer.kind, [...(byKind.get(answer.kind) ?? []), answer]));
  return [...byKind].map(([kind, values]) => {
    const confidence = Math.round(values.reduce((sum, answer) => sum + answer.confidence, 0) / values.length);
    const accuracy = Math.round((values.filter((answer) => answer.correct).length / values.length) * 100);
    return { kind, confidence, accuracy, gap: confidence - accuracy };
  });
}

export function takeaway(answers: Answer[]) {
  const averageConfidence = Math.round(answers.reduce((number, answer) => number + answer.confidence, 0) / answers.length);
  const accuracy = Math.round((answers.filter((answer) => answer.correct).length / answers.length) * 100);
  const gap = averageConfidence - accuracy;
  if (gap > 12) return `Your confidence ran ${gap} points above your answers. On the next run, pause before choosing a high number.`;
  if (gap < -12) return `Your confidence ran ${Math.abs(gap)} points below your answers. Give a strong first hunch more credit.`;
  return "Your confidence stayed close to your answers. Keep naming what makes you sure.";
}
