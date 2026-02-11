import { domains } from '../data/domains';
import type { Screen, UserState } from '../types';

interface Props {
  user: UserState;
  onNavigate: (screen: Screen) => void;
}

export function ProgressScreen({ user, onNavigate }: Props) {
  const totalCards = Object.keys(user.cards).length;
  const masteredCards = Object.values(user.cards).filter(
    (c) => c.repetition >= 3,
  ).length;

  return (
    <div className="progress-screen">
      <h2 className="section-title">学習進捗</h2>

      <div className="progress-overview">
        <div className="stat-card">
          <span className="stat-value">{totalCards}</span>
          <span className="stat-label">学習済み問題</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{masteredCards}</span>
          <span className="stat-label">習得済み</span>
        </div>
      </div>

      <h3 className="section-subtitle">ドメイン別</h3>

      <div className="progress-domains">
        {domains.map((domain) => {
          const dp = user.domainProgress[domain.id];
          const stats = dp?.levelStats ?? {};
          const totalCorrect = Object.values(stats).reduce(
            (s, v) => s + v.correct,
            0,
          );
          const totalAnswered = Object.values(stats).reduce(
            (s, v) => s + v.total,
            0,
          );
          const accuracy =
            totalAnswered > 0
              ? Math.round((totalCorrect / totalAnswered) * 100)
              : 0;

          return (
            <div key={domain.id} className="progress-domain-card">
              <div className="progress-domain-header">
                <span>
                  {domain.icon} {domain.name}
                </span>
                <span className="progress-level">
                  Lv.{dp?.unlockedLevel ?? 1} / {domain.levels}
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${((dp?.unlockedLevel ?? 1) / domain.levels) * 100}%`,
                  }}
                />
              </div>
              <div className="progress-domain-stats">
                {totalAnswered > 0 ? (
                  <>
                    正答率 {accuracy}% ({totalCorrect}/{totalAnswered})
                  </>
                ) : (
                  <span className="text-muted">未学習</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn-primary"
        onClick={() => onNavigate({ type: 'home' })}
        style={{ marginTop: '1.5rem' }}
      >
        ホームに戻る
      </button>
    </div>
  );
}
