import { domains, layers } from '../data/domains';
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

      {layers.map((layer) => {
        const layerDomains = domains.filter((d) =>
          layer.domainIds.includes(d.id),
        );

        return (
          <div
            key={layer.id}
            className="layer-section"
            data-layer={layer.number}
          >
            <div className="layer-header">
              <div className="layer-number">{layer.number}</div>
              <div className="layer-info">
                <div className="layer-name">
                  {layer.name}
                </div>
                <div className="layer-subtitle">{layer.subtitle}</div>
              </div>
            </div>

            <div className="layer-domains">
              {layerDomains.map((domain) => {
                const progress = user.domainProgress[domain.id];

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
                    <div className="domain-body">
                      <h3 className="domain-name">{domain.name}</h3>
                      <p className="domain-desc">{domain.description}</p>
                    </div>
                    <div className="domain-meta">
                      <span className="domain-level">
                        Lv.{progress?.unlockedLevel ?? 1}
                      </span>
                      <span className="domain-arrow">›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
