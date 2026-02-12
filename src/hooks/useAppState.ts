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

    case 'UPDATE_PPP_SCORE': {
      const prev = state.user.pppBestScores?.[action.variant];
      // Only update if new score is better
      if (prev && prev.correct >= action.correct) return state;
      return {
        ...state,
        user: {
          ...state.user,
          pppBestScores: {
            ...state.user.pppBestScores,
            [action.variant]: { correct: action.correct, total: action.total },
          },
        },
      };
    }

    case 'RESET_PROGRESS':
      return {
        ...state,
        user: loadUserState(), // will return fresh defaults since we clear first
      };

    case 'SET_DAILY_CHALLENGE':
      return {
        ...state,
        user: {
          ...state.user,
          dailyChallengeQuestionIds: action.questionIds,
          dailyChallengeDate: action.date,
          dailyChallengeResults: {},
        },
      };

    case 'COMPLETE_DAILY_CHALLENGE': {
      const today = new Date().toISOString().split('T')[0];
      const prev = state.user.dailyStreak;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const wasYesterday = prev?.lastCompletedDate === yesterday;
      const wasToday = prev?.lastCompletedDate === today;
      const newStreak = wasToday
        ? (prev?.currentStreak ?? 1)
        : wasYesterday
          ? (prev?.currentStreak ?? 0) + 1
          : 1;
      return {
        ...state,
        user: {
          ...state.user,
          dailyChallengeResults: action.results,
          dailyStreak: {
            currentStreak: newStreak,
            bestStreak: Math.max(newStreak, prev?.bestStreak ?? 0),
            lastCompletedDate: today,
          },
        },
      };
    }

    case 'SAVE_COMPREHENSIVE_RESULT': {
      return {
        ...state,
        user: {
          ...state.user,
          comprehensiveTestBest: {
            scores: action.scores,
            date: new Date().toISOString(),
          },
        },
      };
    }

    case 'EARN_BADGE': {
      const existing = state.user.earnedBadges ?? [];
      if (existing.includes(action.badgeId)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          earnedBadges: [...existing, action.badgeId],
        },
      };
    }

    case 'UPDATE_TIME_ATTACK_BEST': {
      const prev = state.user.timeAttackBest;
      // Better = more correct, or same correct with faster time
      const isBetter = !prev
        || action.correct > prev.correct
        || (action.correct === prev.correct && action.avgTime < prev.avgTime);
      if (!isBetter) return state;
      return {
        ...state,
        user: {
          ...state.user,
          timeAttackBest: {
            correct: action.correct,
            total: action.total,
            avgTime: action.avgTime,
            date: new Date().toISOString(),
          },
        },
      };
    }

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

  const updatePppScore = useCallback(
    (variant: string, correct: number, total: number) =>
      dispatch({ type: 'UPDATE_PPP_SCORE', variant, correct, total }),
    [],
  );

  const setDailyChallenge = useCallback(
    (questionIds: string[], date: string) =>
      dispatch({ type: 'SET_DAILY_CHALLENGE', questionIds, date }),
    [],
  );

  const completeDailyChallenge = useCallback(
    (results: Record<string, boolean>) =>
      dispatch({ type: 'COMPLETE_DAILY_CHALLENGE', results }),
    [],
  );

  const saveComprehensiveResult = useCallback(
    (scores: Record<DomainId, { correct: number; total: number }>) =>
      dispatch({ type: 'SAVE_COMPREHENSIVE_RESULT', scores }),
    [],
  );

  const earnBadge = useCallback(
    (badgeId: string) => dispatch({ type: 'EARN_BADGE', badgeId }),
    [],
  );

  const updateTimeAttackBest = useCallback(
    (correct: number, total: number, avgTime: number) =>
      dispatch({ type: 'UPDATE_TIME_ATTACK_BEST', correct, total, avgTime }),
    [],
  );

  return {
    state,
    navigate,
    answerQuestion,
    updateLevelStats,
    unlockLevel,
    updatePppScore,
    setDailyChallenge,
    completeDailyChallenge,
    saveComprehensiveResult,
    earnBadge,
    updateTimeAttackBest,
  };
}
