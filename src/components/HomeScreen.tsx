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

  // Count mistakes for the review section badge
  const mistakeCounts = useMemo(() => {
    const unsolved = questions.filter((q) => {
      const card = user.cards[q.id];
      return card && card.lastQuality < 3;
    }).length;
    const allIncorrect = questions.filter((q) => {
      const card = user.cards[q.id];
      return card?.wasEverIncorrect;
    }).length;
    return { unsolved, allIncorrect, total: Math.max(unsolved, allIncorrect) };
  }, [user.cards, questions]);

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

      {/* Review Section - 復習セクション */}
      {mistakeCounts.total > 0 && (
        <button
          className="review-section-banner"
          onClick={() => onNavigate({ type: 'review-select' })}
        >
          <span className="review-section-icon">📖</span>
          <span className="review-section-text">
            <strong>復習セクション</strong>
            <span className="review-section-detail">
              未正解 {mistakeCounts.unsolved}問 ・ 不正解履歴 {mistakeCounts.allIncorrect}問
            </span>
          </span>
          <span className="review-arrow">→</span>
        </button>
      )}

      {/* Review Banner (spaced repetition) */}
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

        // Check if this is Layer 1 (foundation) to add PPP quiz
        const isFoundation = layer.id === 'foundation';

        return (
          <div key={layer.id} className="layer-section">
            <div className="layer-label">
              第{layer.number}層：{layer.name}
            </div>

            <div className={`domain-grid ${layerDomains.length === 1 && !isFoundation ? 'single' : ''}`}>
              {layerDomains.map((domain) => {
                const qCount = domainQuestionCounts[domain.id] ?? 0;

                return (
                  <button
                    key={domain.id}
                    className="domain-card"
                    onClick={() =>
                      onNavigate({
                        type: 'quiz',
                        domainId: domain.id,
                        level: 1,
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
                      const domainQs = getQuestionsByDomain(questions, domain.id);
                      const correctCount = domainQs.filter(
                        (q) => user.cards[q.id]?.lastQuality === 5,
                      ).length;
                      const isComplete = qCount > 0 && correctCount >= qCount;
                      return (
                        <div className="card-segments">
                          <div className="card-segments-bar">
                            {Array.from({ length: qCount }, (_, i) => (
                              <span
                                key={i}
                                className={`card-seg ${i < correctCount ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                          <span className={`card-segments-label ${isComplete ? 'complete' : ''}`}>
                            {isComplete ? 'COMPLETE' : `${correctCount}/${qCount}`}
                          </span>
                        </div>
                      );
                    })()}
                  </button>
                );
              })}

              {/* PPP Quiz Card in Layer 1 */}
              {isFoundation && (
                <button
                  className="domain-card ppp-card"
                  onClick={() => onNavigate({ type: 'ppp-quiz' })}
                >
                  <div className="card-top">
                    <span className="card-icon">📊</span>
                    <span className="card-badge ppp-badge">9種</span>
                  </div>
                  <h3 className="card-name">PPP期待値順序</h3>
                  <p className="card-desc">
                    シュートセレクションの期待値を順番に並べる
                  </p>
                </button>
              )}
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
