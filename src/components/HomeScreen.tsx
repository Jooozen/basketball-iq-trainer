import { useMemo } from 'react';
import { domains, layers } from '../data/domains';
import type { Question, Screen, UserState } from '../types';
import { getDueCards } from '../lib/spaced-repetition';
import { getQuestionsByDomain } from '../data/questions';

interface Props {
  user: UserState;
  questions: Question[];
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ user, questions, onNavigate }: Props) {
  const dueCards = getDueCards(user.cards);
  const totalQuestions = questions.length;

  const domainQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of domains) {
      counts[d.id] = getQuestionsByDomain(questions, d.id).length;
    }
    return counts;
  }, [questions]);

  return (
    <div className="home-screen">
      {/* Hero */}
      <div className="hero">
        <div className="hero-icon">🏀</div>
        <h1 className="hero-title">BASKETBALL IQ</h1>
        <p className="hero-subtitle">
          頭脳6領域 × {totalQuestions}問
        </p>
      </div>

      {/* Review Banner */}
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

      {/* Layers */}
      {layers.map((layer) => {
        const layerDomains = domains.filter((d) =>
          layer.domainIds.includes(d.id),
        );

        return (
          <div key={layer.id} className="layer-section">
            <div className="layer-label">
              第{layer.number}層：{layer.name}
            </div>

            <div className={`domain-grid ${layerDomains.length === 1 ? 'single' : ''}`}>
              {layerDomains.map((domain) => {
                const progress = user.domainProgress[domain.id];
                const qCount = domainQuestionCounts[domain.id] ?? 0;

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
                    <div className="card-top">
                      <span className="card-icon">{domain.icon}</span>
                      <span className="card-badge">{qCount}Q</span>
                    </div>
                    <h3 className="card-name">{domain.name}</h3>
                    <p className="card-desc">{domain.description}</p>

                    {(() => {
                      const stats = progress?.levelStats ?? {};
                      const correctSum = Object.values(stats).reduce((s, v) => s + v.correct, 0);
                      const totalSum = Object.values(stats).reduce((s, v) => s + v.total, 0);
                      if (totalSum === 0) return null;
                      const pct = Math.round((correctSum / totalSum) * 100);
                      return (
                        <div className="card-progress">
                          <div className="card-progress-header">
                            <span className="card-progress-score">{correctSum}/{totalSum}</span>
                            <span className="card-progress-pct">{pct}%</span>
                          </div>
                          <div className="card-progress-bar">
                            <div
                              className="card-progress-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer actions */}
      <div className="home-footer">
        <button
          className="btn-ghost"
          onClick={() => onNavigate({ type: 'progress' })}
        >
          📊 学習進捗を見る
        </button>
      </div>
    </div>
  );
}
