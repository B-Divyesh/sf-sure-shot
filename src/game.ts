export type ChallengeKind = 'Visual estimate' | 'Pattern recall' | 'Timing' | 'Spatial judgment' | 'Visual estimate';

export type Round = {
  id: string;
  kind: ChallengeKind;
  prompt: string;
  answer: string;
  choices: string[];
  detail: string;
  dots?: number;
  pattern?: number[];
  spatial?: string[];
};

export type Answer = { id: string; kind: ChallengeKind; confidence: number; correct: boolean; chosen: string; answer: string };
export type Run = { round: number; answers: Answer[]; phase: 'answer' | 'feedback' | 'results'; startedAt: number };

export const rounds: Round[] = [
  { id: 'count-near', kind: 'Visual estimate', prompt: 'How many marks are on this card?', answer: '13', choices: ['10', '13', '16'], detail: 'Count the marks if you want. Quick estimates are welcome too.', dots: 13 },
  { id: 'pattern', kind: 'Pattern recall', prompt: 'Which pattern did you just see?', answer: 'Pattern B', choices: ['Pattern A', 'Pattern B', 'Pattern C'], detail: 'The pattern appears for two seconds, then the choices replace it.', pattern: [0, 2, 4, 7] },
  { id: 'timing', kind: 'Timing', prompt: 'Stop the timer as close to 3.2 seconds as you can.', answer: 'within 0.45s', choices: ['Stop timer'], detail: 'Start, estimate, then stop. Assist mode gives you a 4.7 second target.' },
  { id: 'spatial', kind: 'Spatial judgment', prompt: 'Which option is the left shape after one clockwise turn?', answer: 'Option B', choices: ['Option A', 'Option B', 'Option C'], detail: 'Picture the dark square turning one quarter turn.', spatial: ['1001', '1100', '0110'] },
  { id: 'count-far', kind: 'Visual estimate', prompt: 'How many marks are on this card?', answer: '22', choices: ['18', '22', '26'], detail: 'One last estimate. Choose before the confidence dial.', dots: 22 }
];

export function newRun(): Run { return { round: 0, answers: [], phase: 'answer', startedAt: Date.now() }; }
export function answerFor(round: Round, chosen: string, elapsed: number | undefined, assist: boolean): { correct: boolean; answer: string } {
  if (round.id === 'timing') {
    const target = assist ? 4.7 : 3.2;
    return { correct: Math.abs((elapsed ?? 0) - target) <= 0.45, answer: `within 0.45 seconds of ${target.toFixed(1)}` };
  }
  return { correct: chosen === round.answer, answer: round.answer };
}
export function calibration(answers: Answer[]) {
  const byKind = new Map<string, Answer[]>();
  answers.forEach(a => byKind.set(a.kind, [...(byKind.get(a.kind) ?? []), a]));
  return [...byKind].map(([kind, values]) => {
    const confidence = Math.round(values.reduce((sum, a) => sum + a.confidence, 0) / values.length);
    const accuracy = Math.round(values.filter(a => a.correct).length / values.length * 100);
    return { kind, confidence, accuracy, gap: confidence - accuracy };
  });
}
export function takeaway(answers: Answer[]) {
  const averageConfidence = Math.round(answers.reduce((n, a) => n + a.confidence, 0) / answers.length);
  const accuracy = Math.round(answers.filter(a => a.correct).length / answers.length * 100);
  const gap = averageConfidence - accuracy;
  if (gap > 12) return `Your confidence ran ${gap} points above your answers. On the next run, pause before choosing a high number.`;
  if (gap < -12) return `Your confidence ran ${Math.abs(gap)} points below your answers. Give a strong first hunch more credit.`;
  return 'Your confidence stayed close to your answers. Keep naming what makes you sure.';
}
