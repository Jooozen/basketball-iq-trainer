import { useReducer, useEffect, useCallback } from 'react';
import type { AppState, AppAction, Screen, DomainId } from '../types';
import { updateCard, createCardState } from '../lib/spaced-repetition';
import { loadUserState, saveUserState } from '../lib/storage';

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen };

    case 'ANSWER_QUESTION': {
      const existing = state.user.cards[action.questionId];
      const card = existing ?? createCardState(action.questionId);
      const updated = updateCard(card, action.quality);
      return {
        ...state,
        user: {
          ...state.user,
          cards: { ...state.user.cards, [action.questionId]: updated },
        },
      };
    }

    case 'UNLOCK_LEVEL': {
      const dp = state.user.domainProgress[action.domainId];
      if (dp.unlockedLevel >= action.level) return state;
      return {
        ...state,
        user: {
          ...state.user,
          domainProgress: {
            ...state.user.domainProgress,
            [action.domainId]: { ...dp, unlockedLevel: action.level },
          },
        },
      };
    }

    case 'UPDATE_LEVEL_STATS': {
      const dp = state.user.domainProgress[action.domainId];
      return {
        ...state,
        user: {
          ...state.user,
          domainProgress: {
            ...state.user.domainProgress,
            [action.domainId]: {
              ...dp,
              levelStats: {
                ...dp.levelStats,
                [action.level]: { correct: action.correct, total: action.total },
              },
            },
          },
        },
      };
    }

    case 'RESET_PROGRESS':
      return {
        ...state,
        user: loadUserState(), // will return fresh defaults since we clear first
      };

    default:
      return state;
  }
}

function initState(): AppState {
  return {
    user: loadUserState(),
    screen: { type: 'home' },
  };
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, null, initState);

  // Persist user state on every change
  useEffect(() => {
    saveUserState(state.user);
  }, [state.user]);

  const navigate = useCallback(
    (screen: Screen) => dispatch({ type: 'NAVIGATE', screen }),
    [],
  );

  const answerQuestion = useCallback(
    (questionId: string, quality: number) =>
      dispatch({ type: 'ANSWER_QUESTION', questionId, quality }),
    [],
  );

  const updateLevelStats = useCallback(
    (domainId: DomainId, level: number, correct: number, total: number) =>
      dispatch({ type: 'UPDATE_LEVEL_STATS', domainId, level, correct, total }),
    [],
  );

  const unlockLevel = useCallback(
    (domainId: DomainId, level: number) =>
      dispatch({ type: 'UNLOCK_LEVEL', domainId, level }),
    [],
  );

  return {
    state,
    navigate,
    answerQuestion,
    updateLevelStats,
    unlockLevel,
  };
}
