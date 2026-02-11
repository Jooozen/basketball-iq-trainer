import { useState, useMemo } from 'react';
import type { Question, DomainId, Screen } from '../types';
import { getQuestionsByDomain } from '../data/questions';
import { getDomainById } from '../data/domains';

interface Props {
  domainId: DomainId;
  level: number;
  questions: Question[];
  onAnswer: (questionId: string, quality: number) => void;
  onNavigate: (screen: Screen) => void;
}

interface AnswerState {
  selectedIndex: number | null;
  revealed: boolean;
}

export function QuizScreen({
  domainId,
  level,
  questions,
  onAnswer,
  onNavigate,
}: Props) {
  const domain = getDomainById(domainId);
  const levelQuestions = useMemo(
    () => getQuestionsByDomain(questions, domainId, level),
    [questions, domainId, level],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({
    selectedIndex: null,
    revealed: false,
  });
  const [results, setResults] = useState<boolean[]>([]);

  if (levelQuestions.length === 0) {
    return (
      <div className="quiz-screen">
        <div className="quiz-empty">
          <p>このレベルにはまだ問題がありません。</p>
          <p className="quiz-empty-sub">
            <code>public/questions.json</code> に問題を追加してください。
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

  const question = levelQuestions[currentIndex];
  const isLast = currentIndex === levelQuestions.length - 1;
  const correct = results.filter(Boolean).length;

  function handleSelect(index: number) {
    if (answerState.revealed) return;

    const isCorrect = index === question.correctIndex;
    const quality = isCorrect ? 5 : 1;

    setAnswerState({ selectedIndex: index, revealed: true });
    setResults((prev) => [...prev, isCorrect]);
    onAnswer(question.id, quality);
  }

  function handleNext() {
    if (isLast) {
      const finalCorrect = results.filter(Boolean).length;
      onNavigate({
        type: 'result',
        domainId,
        level,
        correct: finalCorrect,
        total: levelQuestions.length,
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setAnswerState({ selectedIndex: null, revealed: false });
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="quiz-domain">
          {domain?.icon} {domain?.name} - Lv.{level}
        </span>
        <span className="quiz-progress">
          {currentIndex + 1} / {levelQuestions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentIndex + (answerState.revealed ? 1 : 0)) / levelQuestions.length) * 100}%`,
          }}
        />
      </div>

      <div className="quiz-question">
        <p className="question-text">{question.text}</p>
      </div>

      <div className="quiz-choices">
        {question.choices.map((choice, i) => {
          let className = 'choice-btn';
          if (answerState.revealed) {
            if (i === question.correctIndex) className += ' correct';
            else if (i === answerState.selectedIndex) className += ' incorrect';
            else className += ' dimmed';
          }

          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(i)}
              disabled={answerState.revealed}
            >
              <span className="choice-label">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="choice-text">{choice}</span>
            </button>
          );
        })}
      </div>

      {answerState.revealed && (
        <div className="quiz-explanation">
          <div
            className={`explanation-badge ${answerState.selectedIndex === question.correctIndex ? 'badge-correct' : 'badge-incorrect'}`}
          >
            {answerState.selectedIndex === question.correctIndex
              ? '✓ 正解！'
              : '✗ 不正解'}
          </div>
          <p className="explanation-text">{question.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            {isLast ? `結果を見る（${correct}/${levelQuestions.length}）` : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
