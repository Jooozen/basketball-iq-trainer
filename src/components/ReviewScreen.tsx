import { useState, useMemo } from 'react';
import type { Question, Screen } from '../types';
import { getDueCards } from '../lib/spaced-repetition';
import type { UserState } from '../types';

interface Props {
  user: UserState;
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
}

export function ReviewScreen({ user, questions, onAnswer, onNavigate }: Props) {
  const dueCards = useMemo(() => getDueCards(user.cards), [user.cards]);
  const dueQuestions = useMemo(() => {
    const ids = new Set(dueCards.map((c) => c.questionId));
    return questions.filter((q) => ids.has(q.id));
  }, [dueCards, questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (dueQuestions.length === 0) {
    return (
      <div className="review-screen">
        <div className="quiz-empty">
          <p>復習する問題はありません 🎊</p>
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

  const question = dueQuestions[currentIndex];
  if (!question) {
    return (
      <div className="review-screen">
        <div className="quiz-empty">
          <p>復習完了！おつかれさまでした 🎊</p>
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

  const remaining = dueQuestions.length - currentIndex;

  function handleSelect(index: number) {
    if (revealed) return;
    const isCorrect = index === question.correctIndex;
    setSelectedIndex(index);
    setRevealed(true);
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
        <span className="quiz-domain">🔄 復習モード</span>
        <span className="quiz-progress">残り {remaining} 問</span>
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
            className={`explanation-badge ${selectedIndex === question.correctIndex ? 'badge-correct' : 'badge-incorrect'}`}
          >
            {selectedIndex === question.correctIndex
              ? '✓ 正解！'
              : '✗ 不正解'}
          </div>
          <p className="explanation-text">{question.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex + 1 >= dueQuestions.length ? '復習完了' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
