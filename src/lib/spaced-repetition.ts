import type { CardState } from '../types';

/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm
 *
 * quality: 0-5 rating of answer quality
 *   0 - complete blackout
 *   1 - incorrect, but recognized on reveal
 *   2 - incorrect, but easy to recall after seeing answer
 *   3 - correct with significant difficulty
 *   4 - correct after hesitation
 *   5 - perfect response
 */

const MIN_EF = 1.3;
const DEFAULT_EF = 2.5;

export function createCardState(questionId: string): CardState {
  return {
    questionId,
    ef: DEFAULT_EF,
    interval: 0,
    repetition: 0,
    nextReview: new Date().toISOString(),
    lastQuality: 0,
  };
}

export function updateCard(card: CardState, quality: number): CardState {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, quality));

  let { ef, interval, repetition } = card;

  if (q >= 3) {
    // Correct answer
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetition += 1;
  } else {
    // Incorrect — reset
    repetition = 0;
    interval = 1;
  }

  // Update easiness factor
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < MIN_EF) ef = MIN_EF;

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    questionId: card.questionId,
    ef: Math.round(ef * 100) / 100,
    interval,
    repetition,
    nextReview: nextReview.toISOString(),
    lastQuality: q,
  };
}

/** Returns question IDs that are due for review */
export function getDueCards(cards: Record<string, CardState>): CardState[] {
  const now = new Date();
  return Object.values(cards)
    .filter((card) => new Date(card.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
}

/** Maps binary correct/incorrect to SM-2 quality score */
export function qualityFromAnswer(correct: boolean, hesitated: boolean): number {
  if (!correct) return 1;
  return hesitated ? 3 : 5;
}
