import { describe, expect, it } from "vitest";
import {
  answerFor,
  calibration,
  fixedSteps,
  FRAME_MS,
  isSavedRun,
  LEVEL_COUNT,
  newRun,
  roundsForSeed,
  takeaway,
  type Answer,
} from "../src/game";

describe("Sure Shot deterministic game rules", () => {
  it("creates a date-seeded twenty-level run with distinct daily content", () => {
    const first = roundsForSeed("SS-20260902");
    const sameDay = roundsForSeed("SS-20260902");
    const nextDay = roundsForSeed("SS-20260903");
    expect(newRun(new Date("2026-09-02T12:00:00Z")).seed).toBe("SS-20260902");
    expect(first).toHaveLength(LEVEL_COUNT);
    expect(first).toEqual(sameDay);
    expect(first).not.toEqual(nextDay);
    expect(new Set(first.map((round) => round.id))).toHaveLength(LEVEL_COUNT);
  });

  it("builds pictured, distinct pattern options with one answer matching the preview", () => {
    const round = roundsForSeed("SS-20260902").find((item) => item.kind === "Pattern recall")!;
    expect(round.optionPatterns).toHaveLength(3);
    expect(new Set(round.optionPatterns!.map((option) => option.join(",")))).toHaveLength(3);
    expect(round.optionPatterns!["ABC".indexOf(round.answer.at(-1)!)]).toEqual(round.pattern);
  });

  it("judges the generated timing window, including assist mode", () => {
    const round = roundsForSeed("SS-20260902").find((item) => item.kind === "Timing")!;
    expect(answerFor(round, "Stop timer", round.target!, false).correct).toBe(true);
    expect(answerFor(round, "Stop timer", round.target! + 0.8, false).correct).toBe(false);
    expect(answerFor(round, "Stop timer", round.target! + 1.5, true).correct).toBe(true);
  });

  it("keeps exactly sixty fixed simulation steps in a deterministic second", () => {
    const frames = Array.from({ length: 61 }, (_, index) => index * FRAME_MS);
    expect(fixedSteps(frames)).toBe(60);
  });

  it("computes confidence and accuracy by challenge kind", () => {
    const answers: Answer[] = [
      { id: "a", kind: "Visual estimate", confidence: 80, correct: true, chosen: "x", answer: "x" },
      { id: "b", kind: "Visual estimate", confidence: 60, correct: false, chosen: "x", answer: "y" },
    ];
    expect(calibration(answers)).toEqual([{ kind: "Visual estimate", confidence: 70, accuracy: 50, gap: 20 }]);
    expect(takeaway(answers)).toContain("20 points above");
  });

  it("rejects structurally incomplete saved runs before they can render", () => {
    expect(isSavedRun({ seed: "SS-20260902" })).toBe(false);
    expect(isSavedRun({
      round: 0,
      answers: [],
      phase: "answer",
      startedAt: 1,
      seed: "SS-20260902",
    })).toBe(true);
  });
});
