import { describe, expect, it } from 'vitest';
import { answerFor, calibration, newRun, rounds, takeaway, type Answer } from '../src/game';

describe('Sure Shot deterministic game rules', () => {
  it('creates a five-round run', () => {
    const run = newRun();
    expect(run.round).toBe(0);
    expect(rounds).toHaveLength(5);
  });

  it('judges the timing window, including assist mode', () => {
    expect(answerFor(rounds[2], 'Stop timer', 3.5, false).correct).toBe(true);
    expect(answerFor(rounds[2], 'Stop timer', 3.8, false).correct).toBe(false);
    expect(answerFor(rounds[2], 'Stop timer', 4.8, true).correct).toBe(true);
  });

  it('computes confidence and accuracy by challenge kind', () => {
    const answers: Answer[] = [
      { id: 'a', kind: 'Visual estimate', confidence: 80, correct: true, chosen: 'x', answer: 'x' },
      { id: 'b', kind: 'Visual estimate', confidence: 60, correct: false, chosen: 'x', answer: 'y' }
    ];
    expect(calibration(answers)).toEqual([{ kind: 'Visual estimate', confidence: 70, accuracy: 50, gap: 20 }]);
    expect(takeaway(answers)).toContain('20 points above');
  });
});
