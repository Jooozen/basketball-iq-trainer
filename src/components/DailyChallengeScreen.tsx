import { useState, useMemo, useEffect } from 'react';
import type { Question, Screen, UserState } from '../types';

interface Props {
  user: UserState;
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
  onSetDaily: (questionIds: string[], date: string) => void;
  onCompleteDaily: (results: Record<string, boolean>) => void;
}

const DAILY_COUNT = 5;

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function seedRandom(seed: number) {
  // Simple seeded PRNG for deterministic daily selection
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function getDailyQuestions(questions: Question[], date: string): Question[] {
  // Use date as seed for deterministic daily selection
  const seed = date.split('-').reduce((acc, n) => acc * 100 + parseInt(n), 0);
  const rng = seedRandom(seed);
  const shuffled = [...questions].sort(() => rng() - 0.5);
  return shuffled.slice(0, DAILY_COUNT);
}

export function DailyChallengeScreen({
  user,
  questions,
  onAnswer,
  onNavigate,
  onSetDaily,
  onCompleteDaily,
}: Props) {
  const today = getTodayStr();
  const isCompleted = user.dailyChallengeDate === today
    && user.dailyChallengeResults
    && Object.keys(user.dailyChallengeResults).length >= DAILY_COUNT;

  const dailyQuestions = useMemo(() => {
    return getDailyQuestions(questions, today);
  }, [questions, today]);

  // Initialize daily challenge if needed
  useEffect(() => {
    if (user.dailyChallengeDate !== today) {
      onSetDaily(dailyQuestions.map((q) => q.id), today);
    }
  }, [today, user.dailyChallengeDate, dailyQuestions, onSetDaily]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    // Start from where user left off
    if (user.dailyChallengeDate === today && user.dailyChallengeResults) {
      return Math.min(Object.keys(user.dailyChallengeResults).length, dailyQuestions.length - 1);
    }
    return 0;
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [localResults, setLocalResults] = useState<Record<string, boolean>>(
    user.dailyChallengeDate === today ? (user.dailyChallengeResults ?? {}) : {},
  );

  // Show completion screen
  if (isCompleted || Object.keys(localResults).length >= DAILY_COUNT) {
    const correct = Object.values(localResults).filter(Boolean).length;
    const streak = user.dailyStreak;

    return (
      <div className="result-screen">
        <div className="result-card">
          <div className="result-icon">&#127775;</div>
          <h2 className="result-title">デイリーチャレンジ完了！</h2>

          <div className="result-score">
            <span className="score-number">{correct}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{DAILY_COUNT}</span>
          </div>

          <div className="daily-streak-display">
            <div className="streak-flame">&#128293;</div>
            <div className="streak-number">{streak?.currentStreak ?? 1}</div>
            <div className="streak-label">日連続</div>
          </div>

          {(streak?.bestStreak ?? 0) > 1 && (
            <p className="streak-best">
              最高記録: {streak?.bestStreak}日連続
            </p>
          )}

          <div className="result-actions">
            <button
              className="btn-primary"
              onClick={() => onNavigate({ type: 'home' })}
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = dailyQuestions[currentIndex];
  if (!question) return null;

  const isLast = currentIndex === dailyQuestions.length - 1;

  function handleSelect(index: number) {
    if (revealed) return;
    const isCorrect = index === question.correctIndex;
    const quality = isCorrect ? 5 : 1;

    setSelectedIndex(index);
    setRevealed(true);
    const newResults = { ...localResults, [question.id]: isCorrect };
    setLocalResults(newResults);
    onAnswer(question.id, quality);

    // If all answered, complete the challenge
    if (Object.keys(newResults).length >= DAILY_COUNT) {
      onCompleteDaily(newResults);
    }
  }

  function handleNext() {
    if (isLast) return; // Should show completion
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="quiz-domain">&#127775; デイリーチャレンジ</span>
        <span className="quiz-progress">
          {currentIndex + 1} / {dailyQuestions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill daily-progress-fill"
          style={{
            width: `${((currentIndex + (revealed ? 1 : 0)) / dailyQuestions.length) * 100}%`,
          }}
        />
      </div>

      {user.dailyStreak && user.dailyStreak.currentStreak > 0 && (
        <div className="daily-streak-mini">
          &#128293; {user.dailyStreak.currentStreak}日連続
        </div>
      )}

      <div className="quiz-question">
        <p className="question-text">{question.text}</p>
      </div>

      <div className="quiz-choices">
        {question.choices.map((choice, i) => {
          let className = 'choice-btn';
          if (revealed) {
            if (i === question.correctIndex) className += ' correct';
            else if (i === selectedIndex) className += ' incorrect';
            else className += ' dimmed';
          }
          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(i)}
              disabled={revealed}
            >
              <span className="choice-label">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="choice-text">{choice}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="quiz-explanation">
          <div
            className={`explanation-badge ${
              selectedIndex === question.correctIndex ? 'badge-correct' : 'badge-incorrect'
            }`}
          >
            {selectedIndex === question.correctIndex ? '✓ 正解！' : '✗ 不正解'}
          </div>
          <p className="explanation-text">{question.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            {isLast ? '結果を見る' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
