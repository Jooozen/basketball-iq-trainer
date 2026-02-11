import { domains } from '../data/domains';
import type { Screen, UserState } from '../types';
import { getDueCards } from '../lib/spaced-repetition';

interface Props {
  user: UserState;
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ user, onNavigate }: Props) {
  const dueCards = getDueCards(user.cards);

  return (
    <div className="home-screen">
      {dueCards.length > 0 && (
        <button
          className="review-banner"
          onClick={() => onNavigate({ type: 'review' })}
        >
          <span className="review-icon">🔄</span>
          <span className="review-text">
            復習カードが <strong>{dueCards.length}枚</strong> あります
          </span>
          <span className="review-arrow">→</span>
        </button>
      )}

      <h2 className="section-title">ドメインを選択</h2>

      <div className="domain-grid">
        {domains.map((domain) => {
          const progress = user.domainProgress[domain.id];
          const stats = progress?.levelStats ?? {};
          const totalCorrect = Object.values(stats).reduce(
            (s, v) => s + v.correct,
            0,
          );
          const totalAnswered = Object.values(stats).reduce(
            (s, v) => s + v.total,
            0,
          );

          return (
            <button
              key={domain.id}
              className="domain-card"
              onClick={() =>
                onNavigate({
                  type: 'quiz',
                  domainId: domain.id,
                  level: progress?.unlockedLevel ?? 1,
                })
              }
            >
              <span className="domain-icon">{domain.icon}</span>
              <h3 className="domain-name">{domain.name}</h3>
              <p className="domain-desc">{domain.description}</p>
              <div className="domain-meta">
                <span className="domain-level">
                  Lv.{progress?.unlockedLevel ?? 1} / {domain.levels}
                </span>
                {totalAnswered > 0 && (
                  <span className="domain-accuracy">
                    正答率 {Math.round((totalCorrect / totalAnswered) * 100)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
