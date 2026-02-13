import { useMemo } from 'react';
import { domains, layers } from '../data/domains';
import type { Question, Screen, UserState } from '../types';
import { getDueCards } from '../lib/spaced-repetition';
import { getQuestionsByDomain } from '../data/questions';
import { BADGE_DEFINITIONS } from './BadgeScreen';

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

  // Count ever-incorrect questions for the review section
  const reviewCount = useMemo(() => {
    return questions.filter((q) => {
      const card = user.cards[q.id];
      return card?.wasEverIncorrect;
    }).length;
  }, [user.cards, questions]);

  // Check if all domains through Layer 4 are complete (all questions answered with lastQuality === 5)
  const allDomainsComplete = useMemo(() => {
    return domains.every((domain) => {
      const domainQs = getQuestionsByDomain(questions, domain.id);
      if (domainQs.length === 0) return false;
      return domainQs.every((q) => user.cards[q.id]?.lastQuality === 5);
    });
  }, [questions, user.cards]);

  // Daily challenge status
  const today = new Date().toISOString().split('T')[0];
  const isDailyCompleted = user.dailyChallengeDate === today
    && user.dailyChallengeResults
    && Object.keys(user.dailyChallengeResults).length >= 5;
  const streak = user.dailyStreak?.currentStreak ?? 0;

  // Badges count
  const earnedCount = user.earnedBadges?.length ?? 0;
  const totalBadges = BADGE_DEFINITIONS.length;

  // Time attack best
  const taBest = user.timeAttackBest;

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

      {/* 復習セクション - 全領域完了後のみ表示 */}
      {allDomainsComplete && (
        <button
          className="review-section-bar"
          onClick={() => onNavigate({ type: 'mistake-review', mode: 'all-incorrect' })}
          disabled={reviewCount === 0}
        >
          <span className="review-section-icon">📖</span>
          <span className="review-section-label">復習</span>
          <span className="review-section-count">{reviewCount}問</span>
        </button>
      )}

      {/* タイムアタック セクション - 全領域完了後のみ表示 */}
      {allDomainsComplete && (
        <button
          className="home-section-bar time-attack-bar"
          onClick={() => onNavigate({ type: 'time-attack' })}
        >
          <span className="review-section-icon">⏱️</span>
          <span className="review-section-label">タイムアタック</span>
          <span className="review-section-count">
            {taBest ? `Best ${taBest.correct}/${taBest.total}（${(taBest.avgTime / 1000).toFixed(1)}s）` : '5秒で即断'}
          </span>
        </button>
      )}

      {/* 学習モード セクション - 全領域完了後のみ表示 */}
      {allDomainsComplete && (
        <button
          className="home-section-bar study-bar"
          onClick={() => onNavigate({ type: 'study-select' })}
        >
          <span className="review-section-icon">📚</span>
          <span className="review-section-label">学習モード</span>
          <span className="review-section-count">問題と解説を読む</span>
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

      {/* デイリーチャレンジ & 実力テスト - 全領域完了後のみ表示 */}
      {allDomainsComplete && (
        <div className="home-feature-grid">
          <button
            className={`feature-card daily-card ${isDailyCompleted ? 'feature-completed' : ''}`}
            onClick={() => onNavigate({ type: 'daily-challenge' })}
          >
            <div className="feature-icon">{isDailyCompleted ? '✅' : '🌟'}</div>
            <div className="feature-name">デイリー</div>
            <div className="feature-meta">
              {isDailyCompleted ? '完了!' : '5問に挑戦'}
              {streak > 0 && <span className="streak-chip">🔥{streak}</span>}
            </div>
          </button>

          <button
            className="feature-card comp-card"
            onClick={() => onNavigate({ type: 'comprehensive-test' })}
          >
            <div className="feature-icon">📊</div>
            <div className="feature-name">実力テスト</div>
            <div className="feature-meta">6領域レーダー</div>
          </button>
        </div>
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

              {/* PPP Quiz Cards in Layer 1 */}
              {isFoundation && (
                <>
                  {([
                    { variant: 'nba' as const, icon: '📊', badge: '9種', badgeClass: 'ppp-badge', cardClass: 'ppp-card', name: 'PPP期待値順序', desc: 'NBA基準のシュート期待値を順番に並べる', total: 9 },
                    { variant: 'japan-hs' as const, icon: '🏫', badge: '7種', badgeClass: 'ppp-badge-jp', cardClass: 'ppp-card ppp-card-jp', name: '中高バスケ期待値', desc: '日本の中高における推定期待値を順番に並べる', total: 7 },
                  ]).map((ppp) => {
                    const score = user.pppBestScores?.[ppp.variant];
                    const bestCorrect = score?.correct ?? 0;
                    const isPppComplete = bestCorrect >= ppp.total;
                    return (
                      <button
                        key={ppp.variant}
                        className={`domain-card ${ppp.cardClass}`}
                        onClick={() => onNavigate({ type: 'ppp-quiz', variant: ppp.variant })}
                      >
                        <div className="card-top">
                          <span className="card-icon">{ppp.icon}</span>
                          <span className={`card-badge ${ppp.badgeClass}`}>{ppp.badge}</span>
                        </div>
                        <h3 className="card-name">{ppp.name}</h3>
                        <p className="card-desc">{ppp.desc}</p>
                        <div className="card-segments">
                          <div className="card-segments-bar">
                            {Array.from({ length: ppp.total }, (_, i) => (
                              <span
                                key={i}
                                className={`card-seg ${i < bestCorrect ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                          <span className={`card-segments-label ${isPppComplete ? 'complete' : ''}`}>
                            {isPppComplete ? 'COMPLETE' : `${bestCorrect}/${ppp.total}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer actions */}
      <div className="home-footer">
        <button
          className="btn-ghost"
          onClick={() => onNavigate({ type: 'badges' })}
        >
          🏅 バッジ ({earnedCount}/{totalBadges})
        </button>
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
