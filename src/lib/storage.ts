import type { UserState, DomainId } from '../types';

const STORAGE_KEY = 'basketball-iq-trainer';

const DOMAIN_IDS: DomainId[] = [
  'basic-logic',
  'decision-making',
  'team-tactics',
  'risk-management',
  'situational-judgment',
];

export function createDefaultUserState(): UserState {
  const domainProgress: UserState['domainProgress'] = {} as UserState['domainProgress'];
  for (const id of DOMAIN_IDS) {
    domainProgress[id] = {
      domainId: id,
      unlockedLevel: 1,
      levelStats: {},
    };
  }
  return {
    cards: {},
    domainProgress,
    lastSessionDate: new Date().toISOString(),
  };
}

export function loadUserState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserState;
    }
  } catch {
    // Corrupted data — start fresh
  }
  return createDefaultUserState();
}

export function saveUserState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
