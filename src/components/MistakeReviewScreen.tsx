import { useState, useMemo } from 'react';
import type { Question, Screen, UserState } from '../types';

interface Props {
  mode: 'unsolved' | 'all-incorrect';
  user: UserState;
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
}

export function MistakeReviewScreen({
  mode,
  user,
  questions,
  onAnswer,
  onNavigate,
}: Props) {
  const reviewQuestions = useMemo(() => {
    let filtered: Question[];
    if (mode === 'unsolved') {
      filtered = questions.filter((q) => {
        const card = user.cards[q.id];
        return card && card.lastQuality < 3;
      });
    } else {
      filtered = questions.filter((q) => {
        const card = user.cards[q.id];
        return card?.wasEverIncorrect;
      });
    }
    // Fisher-Yates shuffle for random order each time
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user.cards, questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  if (reviewQuestions.length === 0) {
    return (
      <div className="review-screen">
        <div className="quiz-empty">
          <p>
            {mode === 'unsolved'
              ? '未正解の問題はありません'
              : '不正解の履歴がありません'}
          </p>
          <button
            className="btn-primary"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const question = reviewQuestions[currentIndex];
  if (!question) {
    const rate = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    return (
      <div className="review-screen">
        <div className="mistake-review-complete">
          <div className="review-complete-icon">&#x1F389;</div>
          <h2 className="review-complete-title">復習完了！</h2>
          <p className="review-complete-stats">
            {sessionCorrect}/{sessionTotal} 正解（{rate}%）
          </p>
          <button
            className="btn-primary"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const modeLabel =
    mode === 'unsolved' ? '未正解問題' : '不正解した全ての問題';
  const remaining = reviewQuestions.length - currentIndex;

  function handleSelect(index: number) {
    if (revealed) return;
    const isCorrect = index === question.correctIndex;
    setSelectedIndex(index);
    setRevealed(true);
    setSessionTotal((t) => t + 1);
    if (isCorrect) setSessionCorrect((c) => c + 1);
    onAnswer(question.id, isCorrect ? 5 : 1);
  }

  function handleNext() {
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  return (
    <div className="review-screen">
      <div className="quiz-header">
        <span className="quiz-domain">{modeLabel}</span>
        <span className="quiz-progress">残り {remaining} 問</span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentIndex + (revealed ? 1 : 0)) / reviewQuestions.length) * 100}%`,
          }}
        />
      </div>

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
              selectedIndex === question.correctIndex
                ? 'badge-correct'
                : 'badge-incorrect'
            }`}
          >
            {selectedIndex === question.correctIndex
              ? '\u2713 正解！'
              : '\u2717 不正解'}
          </div>
          <p className="explanation-text">{question.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex + 1 >= reviewQuestions.length
              ? '復習完了'
              : '次の問題 \u2192'}
          </button>
        </div>
      )}
    </div>
  );
}
