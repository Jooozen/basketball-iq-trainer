// ── Domain & Question Types ──────────────────────────────────────

export type DomainId =
  | 'basic-logic'
  | 'decision-making'
  | 'team-tactics'
  | 'risk-management'
  | 'situational-judgment';

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  icon: string;
  levels: number; // total levels available (1-3)
}

export interface Question {
  id: string;
  domainId: DomainId;
  level: number; // 1 | 2 | 3
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  /** Tags for cross-referencing concepts */
  tags?: string[];
}

// ── Spaced Repetition (SM-2) Types ──────────────────────────────

export interface CardState {
  questionId: string;
  /** Easiness Factor (minimum 1.3) */
  ef: number;
  /** Current interval in days */
  interval: number;
  /** Number of consecutive correct answers */
  repetition: number;
  /** Next scheduled review date (ISO string) */
  nextReview: string;
  /** Last answer quality (0-5) */
  lastQuality: number;
}

// ── User Progress Types ─────────────────────────────────────────

export interface DomainProgress {
  domainId: DomainId;
  /** Highest unlocked level (starts at 1) */
  unlockedLevel: number;
  /** Correct / total per level */
  levelStats: Record<number, { correct: number; total: number }>;
}

export interface UserState {
  /** Per-question spaced repetition state */
  cards: Record<string, CardState>;
  /** Per-domain progress */
  domainProgress: Record<DomainId, DomainProgress>;
  /** Timestamp of last session */
  lastSessionDate: string;
}

// ── App State & Actions ─────────────────────────────────────────

export type Screen =
  | { type: 'home' }
  | { type: 'quiz'; domainId: DomainId; level: number }
  | { type: 'result'; domainId: DomainId; level: number; correct: number; total: number }
  | { type: 'review' }
  | { type: 'progress' };

export interface AppState {
  user: UserState;
  screen: Screen;
}

export type AppAction =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'ANSWER_QUESTION'; questionId: string; quality: number }
  | { type: 'UNLOCK_LEVEL'; domainId: DomainId; level: number }
  | { type: 'RESET_PROGRESS' };
