import { useMemo } from 'react';
import type { Question, Screen, UserState } from '../types';

interface Props {
  user: UserState;
  questions: Question[];
  onNavigate: (screen: Screen) => void;
}

export function ReviewSelectScreen({ user, questions, onNavigate }: Props) {
  const counts = useMemo(() => {
    // 未正解問題: attempted but lastQuality < 5 (not yet mastered)
    const unsolved = questions.filter((q) => {
      const card = user.cards[q.id];
      return card && card.lastQuality < 3;
    }).length;

    // 不正解した全ての問題: ever answered incorrectly
    const allIncorrect = questions.filter((q) => {
      const card = user.cards[q.id];
      return card?.wasEverIncorrect;
    }).length;

    return { unsolved, allIncorrect };
  }, [user.cards, questions]);

  return (
    <div className="review-select-screen">
      <div className="review-select-header">
        <h2 className="review-select-title">復習モード</h2>
        <p className="review-select-subtitle">
          間違えた問題を復習して理解度を高めましょう
        </p>
      </div>

      <div className="review-select-options">
        <button
          className="review-select-card"
          onClick={() =>
            onNavigate({ type: 'mistake-review', mode: 'unsolved' })
          }
          disabled={counts.unsolved === 0}
        >
          <div className="review-select-card-icon">
            <span className="rs-icon">&#x2717;</span>
          </div>
          <div className="review-select-card-body">
            <h3 className="review-select-card-title">未正解問題</h3>
            <p className="review-select-card-desc">
              まだ正解できていない問題だけを集中的に復習
            </p>
          </div>
          <div className="review-select-card-count">
            <span className="rs-count">{counts.unsolved}</span>
            <span className="rs-count-label">問</span>
          </div>
        </button>

        <button
          className="review-select-card"
          onClick={() =>
            onNavigate({ type: 'mistake-review', mode: 'all-incorrect' })
          }
          disabled={counts.allIncorrect === 0}
        >
          <div className="review-select-card-icon">
            <span className="rs-icon">&#x21BA;</span>
          </div>
          <div className="review-select-card-body">
            <h3 className="review-select-card-title">
              不正解した全ての問題
            </h3>
            <p className="review-select-card-desc">
              過去に一度でも間違えた問題を全て復習
            </p>
          </div>
          <div className="review-select-card-count">
            <span className="rs-count">{counts.allIncorrect}</span>
            <span className="rs-count-label">問</span>
          </div>
        </button>
      </div>

      {counts.unsolved === 0 && counts.allIncorrect === 0 && (
        <div className="review-select-empty">
          <p>復習する問題はまだありません。</p>
          <p className="text-muted">まずはクイズに挑戦しましょう！</p>
        </div>
      )}
    </div>
  );
}
