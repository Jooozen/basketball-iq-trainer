import type { Screen, UserState } from '../types';

interface Props {
  correct: number;
  total: number;
  avgTime: number;
  user: UserState;
  onNavigate: (screen: Screen) => void;
}

export function TimeAttackResultScreen({ correct, total, avgTime, user, onNavigate }: Props) {
  const rate = Math.round((correct / total) * 100);
  const avgSec = (avgTime / 1000).toFixed(1);
  const best = user.timeAttackBest;
  const isNewBest = best && (
    correct > best.correct ||
    (correct === best.correct && avgTime < best.avgTime)
  );

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-icon">{rate >= 70 ? '&#9889;' : '&#128168;'}</div>
        <h2 className="result-title">
          {rate >= 70 ? '素晴らしい！' : 'もっと速く！'}
        </h2>
        <p className="result-domain">タイムアタック</p>

        <div className="result-score">
          <span className="score-number">{correct}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>

        <p className="result-rate">
          正答率 {rate}%
          {rate >= 70 && <span className="pass-badge">PASS</span>}
        </p>

        <div className="time-attack-stats">
          <div className="ta-stat">
            <span className="ta-stat-value">{avgSec}s</span>
            <span className="ta-stat-label">平均回答時間</span>
          </div>
          {best && (
            <div className="ta-stat">
              <span className="ta-stat-value">{best.correct}/{best.total}</span>
              <span className="ta-stat-label">
                ベスト（{(best.avgTime / 1000).toFixed(1)}s）
              </span>
            </div>
          )}
        </div>

        {isNewBest && (
          <div className="ta-new-best">&#127942; NEW BEST!</div>
        )}

        <div className="result-actions">
          <button
            className="btn-primary"
            onClick={() => onNavigate({ type: 'time-attack' })}
          >
            もう一度挑戦
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
