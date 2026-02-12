import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Question, Screen } from '../types';

interface Props {
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
  onComplete: (correct: number, total: number, avgTime: number) => void;
}

const QUESTION_COUNT = 10;
const TIME_LIMIT_MS = 5000; // 5 seconds per question

export function TimeAttackScreen({
  questions,
  onAnswer,
  onNavigate,
  onComplete,
}: Props) {
  const shuffled = useMemo(() => {
    const copy = [...questions];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, QUESTION_COUNT);
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; timeMs: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const question = shuffled[currentIndex];
  const isLast = currentIndex === shuffled.length - 1;

  const handleTimeOut = useCallback(() => {
    if (revealed) return;
    setIsTimedOut(true);
    setRevealed(true);
    setResults((prev) => [...prev, { correct: false, timeMs: TIME_LIMIT_MS }]);
    onAnswer(question.id, 1);
  }, [revealed, question, onAnswer]);

  useEffect(() => {
    if (revealed) return;
    startTimeRef.current = Date.now();
    setTimeLeft(TIME_LIMIT_MS);
    setIsTimedOut(false);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        handleTimeOut();
      }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, revealed, handleTimeOut]);

  function handleSelect(index: number) {
    if (revealed) return;
    clearInterval(timerRef.current);

    const elapsed = Date.now() - startTimeRef.current;
    const isCorrect = index === question.correctIndex;
    const quality = isCorrect ? 5 : 1;

    setSelectedIndex(index);
    setRevealed(true);
    setResults((prev) => [...prev, { correct: isCorrect, timeMs: elapsed }]);
    onAnswer(question.id, quality);
  }

  function handleNext() {
    if (isLast) {
      const finalResults = results;
      const correct = finalResults.filter((r) => r.correct).length;
      const avgTime = Math.round(
        finalResults.reduce((sum, r) => sum + r.timeMs, 0) / finalResults.length,
      );
      onComplete(correct, shuffled.length, avgTime);
      onNavigate({
        type: 'time-attack-result',
        correct,
        total: shuffled.length,
        avgTime,
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  const timerPercent = (timeLeft / TIME_LIMIT_MS) * 100;
  const timerClass =
    timerPercent > 40 ? 'timer-ok' : timerPercent > 20 ? 'timer-warn' : 'timer-danger';

  return (
    <div className="quiz-screen time-attack-screen">
      <div className="quiz-header">
        <span className="quiz-domain">&#9889; タイムアタック</span>
        <span className="quiz-progress">
          {currentIndex + 1} / {shuffled.length}
        </span>
      </div>

      <div className="time-attack-timer">
        <div
          className={`time-attack-timer-fill ${timerClass}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>
      <div className="time-attack-timer-label">
        {revealed
          ? isTimedOut
            ? 'TIME UP!'
            : `${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s`
          : `${(timeLeft / 1000).toFixed(1)}s`}
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
              !isTimedOut && selectedIndex === question.correctIndex
                ? 'badge-correct'
                : 'badge-incorrect'
            }`}
          >
            {isTimedOut
              ? '&#8986; タイムアウト'
              : selectedIndex === question.correctIndex
                ? '&#10003; 正解！'
                : '&#10007; 不正解'}
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
