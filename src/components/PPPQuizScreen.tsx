import { useState, useMemo } from 'react';
import type { Screen } from '../types';

interface ShotType {
  id: string;
  name: string;
  ev: string;
  rank: number; // 1 = highest expected value
  explanation: string;
}

const NBA_SHOT_TYPES: ShotType[] = [
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

const JAPAN_HS_SHOT_TYPES: ShotType[] = [
  {
    id: 'jp_transition',
    name: '速攻レイアップ',
    ev: '推定1.10〜1.40',
    rank: 1,
    explanation:
      '推定FG% 55〜70%×2点。ディフェンスが戻り切る前のレイアップは中高でも最も効率が高い。速攻の質がチーム力に直結する。',
  },
  {
    id: 'jp_rim',
    name: 'ゴール下（ハーフコート）',
    ev: '推定1.00〜1.20',
    rank: 2,
    explanation:
      '推定FG% 50〜60%×2点。ハーフコートオフェンスでのゴール下。フィジカルコンタクトが多く、リバウンドからのセカンドチャンスも含む。',
  },
  {
    id: 'jp_paint',
    name: 'ペイント内ショート',
    ev: '推定0.80〜1.00',
    rank: 3,
    explanation:
      '推定FG% 40〜50%×2点。ペイントエリア内からのフローターやショートジャンパー。ゴール下よりやや距離があるが、ドライブの選択肢として重要。',
  },
  {
    id: 'jp_ft_area',
    name: 'フリースロー付近',
    ev: '推定0.76〜0.90',
    rank: 4,
    explanation:
      '推定FG% 38〜45%×2点。フリースローライン前後からのジャンパー。中高では「エルボー」からの攻撃が多く、セットプレーの起点になりやすい。',
  },
  {
    id: 'jp_midrange',
    name: 'ミッドレンジ',
    ev: '推定0.66〜0.80',
    rank: 5,
    explanation:
      '推定FG% 33〜40%×2点。ペイント外〜3ポイントライン内のエリア。中高では3ポイントが入りにくい分、ミッドレンジの比重が高くなりがち。',
  },
  {
    id: 'jp_three_elite',
    name: '3ポイント（上位校）',
    ev: '推定0.84〜0.99',
    rank: 6,
    explanation:
      '推定FG% 28〜33%×3点。シューティング練習が充実した上位校ではミッドレンジより高い期待値になる。ただし安定感にばらつきがある。',
  },
  {
    id: 'jp_three_avg',
    name: '3ポイント（一般的）',
    ev: '推定0.60〜0.78',
    rank: 7,
    explanation:
      '推定FG% 20〜26%×3点。一般的な中高チームの3ポイント成功率。練習量や体格の問題で成功率が低く、最も効率が悪いショットになりやすい。',
  },
];

type PPPVariant = 'nba' | 'japan-hs';

const VARIANT_CONFIG: Record<
  PPPVariant,
  { shots: ShotType[]; title: string; headerLabel: string; badge: string }
> = {
  nba: {
    shots: NBA_SHOT_TYPES,
    title: 'NBA PPP 期待値順序クイズ',
    headerLabel: 'PPP 期待値順序クイズ',
    badge: '9種',
  },
  'japan-hs': {
    shots: JAPAN_HS_SHOT_TYPES,
    title: '中高バスケ 期待値順序クイズ',
    headerLabel: '中高バスケ 期待値順序クイズ',
    badge: '7種',
  },
};

interface Props {
  variant: PPPVariant;
  onNavigate: (screen: Screen) => void;
  onComplete: (variant: string, correct: number, total: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PPPQuizScreen({ variant, onNavigate, onComplete }: Props) {
  const config = VARIANT_CONFIG[variant];
  const shotTypes = config.shots;
  const totalSteps = shotTypes.length;

  // Shuffled choices for display
  const shuffledShots = useMemo(() => shuffleArray(shotTypes), [shotTypes]);

  // Current step: 0 = "most highest", 1 = "2nd highest", ... last = "lowest"
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
  const correctShot = shotTypes.find((s) => s.rank === correctRank)!;

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
      onComplete(variant, correctCount, totalSteps);
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
          <h2 className="review-complete-title">{config.title}完了！</h2>
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
        <span className="quiz-domain">{config.headerLabel}</span>
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
