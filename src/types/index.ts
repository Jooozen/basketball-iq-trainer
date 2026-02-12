// ── Domain & Layer Types ─────────────────────────────────────

export type DomainId =
  | 'fundamentals'
  | 'decision'
  | 'team_tactics'
  | 'risk'
  | 'communication'
  | 'game_reading';

export type LayerId = 'foundation' | 'execution' | 'connection' | 'integration';

export interface Layer {
  id: LayerId;
  number: number;
  name: string;
  subtitle: string;
  description: string;
  domainIds: DomainId[];
}

export interface Domain {
  id: DomainId;
  layerId: LayerId;
  name: string;
  description: string;
  icon: string;
  levels: number;
}

// ── Question Types ──────────────────────────────────────────

export interface Question {
  id: string;
  domainId: DomainId;
  level: number;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  tags?: string[];
}

// ── Spaced Repetition (SM-2) Types ──────────────────────────

export interface CardState {
  questionId: string;
  ef: number;
  interval: number;
  repetition: number;
  nextReview: string;
  lastQuality: number;
  wasEverIncorrect?: boolean;
}

// ── User Progress Types ─────────────────────────────────────

export interface DomainProgress {
  domainId: DomainId;
  unlockedLevel: number;
  levelStats: Record<number, { correct: number; total: number }>;
}

export interface DailyStreak {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
}

export interface ComprehensiveTestResult {
  scores: Record<DomainId, { correct: number; total: number }>;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate?: string;
}

export interface TimeAttackBest {
  correct: number;
  total: number;
  avgTime: number; // ms
  date: string;
}

export interface UserState {
  cards: Record<string, CardState>;
  domainProgress: Record<DomainId, DomainProgress>;
  pppBestScores?: Record<string, { correct: number; total: number }>;
  lastSessionDate: string;
  dailyStreak?: DailyStreak;
  dailyChallengeQuestionIds?: string[]; // question IDs for today
  dailyChallengeDate?: string; // YYYY-MM-DD
  dailyChallengeResults?: Record<string, boolean>; // questionId -> correct
  comprehensiveTestBest?: ComprehensiveTestResult;
  earnedBadges?: string[];
  timeAttackBest?: TimeAttackBest;
}

// ── App State & Actions ─────────────────────────────────────

export type Screen =
  | { type: 'home' }
  | { type: 'quiz'; domainId: DomainId; level: number }
  | { type: 'result'; domainId: DomainId; level: number; correct: number; total: number }
  | { type: 'review' }
  | { type: 'review-select' }
  | { type: 'mistake-review'; mode: 'unsolved' | 'all-incorrect' }
  | { type: 'ppp-quiz'; variant: 'nba' | 'japan-hs' }
  | { type: 'progress' }
  | { type: 'study'; domainId: DomainId }
  | { type: 'time-attack' }
  | { type: 'time-attack-result'; correct: number; total: number; avgTime: number }
  | { type: 'comprehensive-test' }
  | { type: 'comprehensive-result'; scores: Record<DomainId, { correct: number; total: number }> }
  | { type: 'daily-challenge' }
  | { type: 'badges' };

export interface AppState {
  user: UserState;
  screen: Screen;
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'ANSWER_QUESTION'; questionId: string; quality: number }
  | { type: 'UNLOCK_LEVEL'; domainId: DomainId; level: number }
  | { type: 'UPDATE_LEVEL_STATS'; domainId: DomainId; level: number; correct: number; total: number }
  | { type: 'UPDATE_PPP_SCORE'; variant: string; correct: number; total: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'COMPLETE_DAILY_CHALLENGE'; results: Record<string, boolean> }
  | { type: 'SET_DAILY_CHALLENGE'; questionIds: string[]; date: string }
  | { type: 'SAVE_COMPREHENSIVE_RESULT'; scores: Record<DomainId, { correct: number; total: number }> }
  | { type: 'EARN_BADGE'; badgeId: string }
  | { type: 'UPDATE_TIME_ATTACK_BEST'; correct: number; total: number; avgTime: number };
