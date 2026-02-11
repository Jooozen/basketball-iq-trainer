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
}

// ── User Progress Types ─────────────────────────────────────

export interface DomainProgress {
  domainId: DomainId;
  unlockedLevel: number;
  levelStats: Record<number, { correct: number; total: number }>;
}

export interface UserState {
  cards: Record<string, CardState>;
  domainProgress: Record<DomainId, DomainProgress>;
  lastSessionDate: string;
}

// ── App State & Actions ─────────────────────────────────────

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
