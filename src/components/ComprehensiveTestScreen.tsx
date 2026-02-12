import { useState, useMemo } from 'react';
import type { Question, DomainId, Screen } from '../types';
import { domains } from '../data/domains';
import { getQuestionsByDomain } from '../data/questions';

interface Props {
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
  onComplete: (scores: Record<DomainId, { correct: number; total: number }>) => void;
}

const QUESTIONS_PER_DOMAIN = 3;

export function ComprehensiveTestScreen({
  questions,
  onAnswer,
  onNavigate,
  onComplete,
}: Props) {
  // Select random questions from each domain
  const testQuestions = useMemo(() => {
    const selected: Question[] = [];
    for (const domain of domains) {
      const domainQs = getQuestionsByDomain(questions, domain.id);
      const shuffled = [...domainQs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      selected.push(...shuffled.slice(0, QUESTIONS_PER_DOMAIN));
    }
    return selected;
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const question = testQuestions[currentIndex];
  const isLast = currentIndex === testQuestions.length - 1;

  if (!question) {
    return (
      <div className="quiz-screen">
        <div className="quiz-empty">
          <p>問題がありません。</p>
          <button className="btn-primary" onClick={() => onNavigate({ type: 'home' })}>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const currentDomain = domains.find((d) => d.id === question.domainId);

  function handleSelect(index: number) {
    if (revealed) return;
    const isCorrect = index === question.correctIndex;
    const quality = isCorrect ? 5 : 1;

    setSelectedIndex(index);
    setRevealed(true);
    setResults((prev) => ({ ...prev, [question.id]: isCorrect }));
    onAnswer(question.id, quality);
  }

  function handleNext() {
    if (isLast) {
      // Compile per-domain scores
      const scores = {} as Record<DomainId, { correct: number; total: number }>;
      for (const domain of domains) {
        const domainTestQs = testQuestions.filter((q) => q.domainId === domain.id);
        const correct = domainTestQs.filter((q) => results[q.id]).length;
        scores[domain.id] = { correct, total: domainTestQs.length };
      }
      onComplete(scores);
      onNavigate({ type: 'comprehensive-result', scores });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setRevealed(false);
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="quiz-domain">
          {currentDomain?.icon} {currentDomain?.name}
        </span>
        <span className="quiz-progress">
          {currentIndex + 1} / {testQuestions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentIndex + (revealed ? 1 : 0)) / testQuestions.length) * 100}%`,
          }}
        />
      </div>

      <div className="comprehensive-domain-indicator">
        {domains.map((d, i) => {
          const startIdx = i * QUESTIONS_PER_DOMAIN;
          const endIdx = startIdx + QUESTIONS_PER_DOMAIN;
          const isCurrent = currentIndex >= startIdx && currentIndex < endIdx;
          const isDone = currentIndex >= endIdx;
          return (
            <span
              key={d.id}
              className={`domain-dot ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}`}
              title={d.name}
            >
              {d.icon}
            </span>
          );
        })}
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
