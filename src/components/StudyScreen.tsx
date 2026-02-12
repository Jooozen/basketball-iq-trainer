import { useState, useMemo } from 'react';
import type { Question, DomainId, Screen } from '../types';
import { getQuestionsByDomain } from '../data/questions';
import { getDomainById } from '../data/domains';

interface Props {
  domainId: DomainId;
  questions: Question[];
  onNavigate: (screen: Screen) => void;
}

export function StudyScreen({ domainId, questions, onNavigate }: Props) {
  const domain = getDomainById(domainId);
  const domainQuestions = useMemo(
    () => getQuestionsByDomain(questions, domainId),
    [questions, domainId],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (domainQuestions.length === 0) {
    return (
      <div className="study-screen">
        <div className="quiz-empty">
          <p>この領域にはまだ問題がありません。</p>
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

  const question = domainQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === domainQuestions.length - 1;

  return (
    <div className="study-screen">
      <div className="quiz-header">
        <span className="quiz-domain">
          {domain?.icon} {domain?.name}
        </span>
        <span className="quiz-progress">
          {currentIndex + 1} / {domainQuestions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentIndex + 1) / domainQuestions.length) * 100}%`,
          }}
        />
      </div>

      <div className="study-card">
        <p className="question-text">{question.text}</p>

        <div className="study-choices">
          {question.choices.map((choice, i) => (
            <div
              key={i}
              className={`study-choice ${i === question.correctIndex ? 'study-correct' : ''}`}
            >
              <span className="choice-label">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="choice-text">{choice}</span>
              {i === question.correctIndex && (
                <span className="study-correct-mark">&#10003;</span>
              )}
            </div>
          ))}
        </div>

        <div className="study-explanation">
          <div className="study-explanation-label">解説</div>
          <p className="explanation-text">{question.explanation}</p>
        </div>
      </div>

      <div className="study-nav">
        <button
          className="btn-secondary"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
        >
          ← 前へ
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            if (isLast) {
              onNavigate({ type: 'home' });
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }}
        >
          {isLast ? 'ホームに戻る' : '次へ →'}
        </button>
      </div>
    </div>
  );
}
