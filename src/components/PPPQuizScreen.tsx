import { useState, useMemo } from 'react';
import type { Screen } from '../types';

interface ShotType {
  id: string;
  name: string;
  ev: string;
  rank: number; // 1 = highest expected value
  explanation: string;
}

const SHOT_TYPES: ShotType[] = [
  {
    id: 'rim',
    name: 'ゴール下（リム周辺）',
    ev: '約1.20〜1.35',
    rank: 1,
    explanation:
      '成功率60〜68%前後の2点シュート。最も近い距離から打つため成功率が高く、ファウルをもらう確率も高い。And-1やフリースローを含めるとさらに上がる。',
  },
  {
    id: 'transition',
    name: '速攻（トランジション）',
    ev: '約1.10〜1.30',
    rank: 2,
    explanation:
      'ディフェンスが整っていない状態で攻めるため、最も効率が高い。数的優位からのレイアップやフリーの3ポイントが多い。',
  },
  {
    id: 'drive',
    name: 'フリースロー込みのドライブ',
    ev: '約1.05〜1.20',
    rank: 3,
    explanation:
      'ペイントアタック全体の期待値。フィニッシュ＋ファウルドローンを含めた総合値。',
  },
  {
    id: 'corner3',
    name: 'コーナー3ポイント',
    ev: '約1.05〜1.15',
    rank: 4,
    explanation:
      '成功率38〜40%前後×3点。3ポイントラインまでの距離が最短（約6.7m）で、最も効率の良い3ポイント。',
  },
  {
    id: 'above_break3',
    name: 'アバブ・ザ・ブレイク3（ウイング・トップの3ポイント）',
    ev: '約1.00〜1.10',
    rank: 5,
    explanation:
      '成功率35〜37%前後×3点。コーナーよりやや距離が長いがそれでも高効率。',
  },
  {
    id: 'post',
    name: 'ポストアップ（優秀なセンター）',
    ev: '約0.95〜1.05',
    rank: 6,
    explanation:
      'スキルの高いビッグマンに限れば効率が高いが、リーグ平均では下がる。',
  },
  {
    id: 'pullup',
    name: 'プルアップジャンパー（ミッドレンジ含む）',
    ev: '約0.85〜0.95',
    rank: 7,
    explanation:
      '成功率40〜45%前後×2点。ドリブルからのジャンプシュートは全体的に効率が低い。ただし、クロージングやショットクロック終盤で「作れるシュート」としての戦術的価値はある。',
  },
  {
    id: 'long_mid',
    name: 'ロングミッドレンジ（ロングツー）',
    ev: '約0.75〜0.85',
    rank: 8,
    explanation:
      '3ポイントラインの内側ギリギリからの2点シュート。「3ポイントとほぼ同じ距離なのに2点」なので、データ上は最も非効率。',
  },
  {
    id: 'contested',
    name: 'コンテステッドジャンパー（タフショット）',
    ev: '約0.70〜0.80',
    rank: 9,
    explanation:
      'ディフェンスが密着した状態でのジャンプシュート。ショットクロック切れ間際など追い込まれた場面で発生しやすい。',
  },
];

interface Props {
  onNavigate: (screen: Screen) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PPPQuizScreen({ onNavigate }: Props) {
  const totalSteps = SHOT_TYPES.length;

  // Shuffled choices for display
  const shuffledShots = useMemo(() => shuffleArray(SHOT_TYPES), []);

  // Current step: 0 = "most highest", 1 = "2nd highest", ... 8 = "lowest"
  const [currentStep, setCurrentStep] = useState(0);
  // IDs of already-selected (eliminated) shots
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  // Selected shot ID for current step
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Whether the answer is revealed
  const [revealed, setRevealed] = useState(false);
  // Track correct answers
  const [correctCount, setCorrectCount] = useState(0);
  // Completed
  const [completed, setCompleted] = useState(false);

  // The correct answer for the current step
  const correctRank = currentStep + 1;
  const correctShot = SHOT_TYPES.find((s) => s.rank === correctRank)!;

  // Determine question text
  function getQuestionText(step: number, total: number): string {
    if (step === 0) return 'この中で最も期待値が高いものは？';
    if (step === total - 1) return 'この中で最も期待値が低いものは？';
    return `この中で${step + 1}番目に期待値が高いものは？`;
  }

  function handleSelect(shotId: string) {
    if (revealed) return;
    setSelectedId(shotId);
    setRevealed(true);
    if (shotId === correctShot.id) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    // Eliminate the correct answer (always eliminate the correct one regardless of user's selection)
    const newEliminated = new Set(eliminatedIds);
    newEliminated.add(correctShot.id);
    setEliminatedIds(newEliminated);

    if (currentStep + 1 >= totalSteps) {
      setCompleted(true);
    } else {
      setCurrentStep((s) => s + 1);
      setSelectedId(null);
      setRevealed(false);
    }
  }

  if (completed) {
    const rate = Math.round((correctCount / totalSteps) * 100);
    return (
      <div className="ppp-quiz-screen">
        <div className="mistake-review-complete">
          <div className="review-complete-icon">&#x1F3C0;</div>
          <h2 className="review-complete-title">期待値順序クイズ完了！</h2>
          <p className="review-complete-stats">
            {correctCount}/{totalSteps} 正解（{rate}%）
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

  const isCorrect = selectedId === correctShot.id;

  return (
    <div className="ppp-quiz-screen">
      <div className="quiz-header">
        <span className="quiz-domain">PPP 期待値順序クイズ</span>
        <span className="quiz-progress">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentStep + (revealed ? 1 : 0)) / totalSteps) * 100}%`,
          }}
        />
      </div>

      <div className="quiz-question">
        <p className="question-text">
          {getQuestionText(currentStep, totalSteps)}
        </p>
      </div>

      <div className="ppp-choices">
        {shuffledShots.map((shot) => {
          const isEliminated = eliminatedIds.has(shot.id);
          const isThisCorrect = shot.id === correctShot.id;
          const isSelected = shot.id === selectedId;

          let className = 'ppp-choice-btn';
          if (isEliminated) {
            className += ' ppp-eliminated';
          } else if (revealed) {
            if (isThisCorrect) className += ' correct';
            else if (isSelected) className += ' incorrect';
            else className += ' dimmed';
          }

          return (
            <button
              key={shot.id}
              className={className}
              onClick={() => handleSelect(shot.id)}
              disabled={isEliminated || revealed}
            >
              <span className="ppp-choice-name">{shot.name}</span>
              {isEliminated && (
                <span className="ppp-eliminated-ev">{shot.ev}</span>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="quiz-explanation">
          <div
            className={`explanation-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}
          >
            {isCorrect ? '\u2713 正解！' : '\u2717 不正解'}
          </div>
          <div className="ppp-answer-detail">
            <p className="ppp-answer-name">
              {correctShot.name}
            </p>
            <p className="ppp-answer-ev">{correctShot.ev}</p>
          </div>
          <p className="explanation-text">{correctShot.explanation}</p>
          <button className="btn-primary" onClick={handleNext}>
            {currentStep + 1 >= totalSteps
              ? '結果を見る'
              : '次の問題 \u2192'}
          </button>
        </div>
      )}
    </div>
  );
}
