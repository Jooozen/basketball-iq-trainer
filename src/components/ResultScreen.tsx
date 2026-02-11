import { useEffect } from 'react';
import type { DomainId, Screen, UserState } from '../types';
import { getDomainById, domains } from '../data/domains';

interface Props {
  domainId: DomainId;
  level: number;
  correct: number;
  total: number;
  user: UserState;
  onNavigate: (screen: Screen) => void;
  onUnlockLevel: (domainId: DomainId, level: number) => void;
  onUpdateStats: (domainId: DomainId, level: number, correct: number, total: number) => void;
}

const PASS_THRESHOLD = 0.7;

function getNextDomain(currentId: DomainId) {
  const idx = domains.findIndex((d) => d.id === currentId);
  return idx >= 0 && idx < domains.length - 1 ? domains[idx + 1] : null;
}

export function ResultScreen({
  domainId,
  level,
  correct,
  total,
  user,
  onNavigate,
  onUnlockLevel,
  onUpdateStats,
}: Props) {
  const domain = getDomainById(domainId);
  const rate = total > 0 ? correct / total : 0;
  const passed = rate >= PASS_THRESHOLD;
  const currentUnlocked = user.domainProgress[domainId]?.unlockedLevel ?? 1;
  const canUnlockNext = passed && level >= currentUnlocked && level < (domain?.levels ?? 3);
  const isLastLevel = level >= (domain?.levels ?? 3);
  const nextDomain = getNextDomain(domainId);

  useEffect(() => {
    onUpdateStats(domainId, level, correct, total);
  }, [domainId, level, correct, total, onUpdateStats]);

  function handleUnlockNext() {
    onUnlockLevel(domainId, level + 1);
    onNavigate({ type: 'quiz', domainId, level: level + 1 });
  }

  function handleNextSection() {
    if (!nextDomain) return;
    const nextLevel = user.domainProgress[nextDomain.id]?.unlockedLevel ?? 1;
    onNavigate({ type: 'quiz', domainId: nextDomain.id, level: nextLevel });
  }

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className={`result-icon ${passed ? 'passed' : 'failed'}`}>
          {passed ? '🎉' : '💪'}
        </div>

        <h2 className="result-title">
          {passed ? 'クリア！' : 'もう一度チャレンジ！'}
        </h2>

        <div className="result-domain">
          {domain?.icon} {domain?.name} - Lv.{level}
        </div>

        <div className="result-score">
          <span className="score-number">{correct}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>

        <div className="result-rate">
          正答率 {Math.round(rate * 100)}%
          {passed && <span className="pass-badge">PASS</span>}
        </div>

        <div className="result-actions">
          {canUnlockNext && (
            <button className="btn-primary" onClick={handleUnlockNext}>
              次のレベルへ進む →
            </button>
          )}

          {isLastLevel && nextDomain && (
            <button className="btn-primary" onClick={handleNextSection}>
              次のセクション「{nextDomain.name}」へ →
            </button>
          )}

          <button
            className="btn-secondary"
            onClick={() => onNavigate({ type: 'quiz', domainId, level })}
          >
            もう一度挑戦
          </button>

          <button
            className="btn-text"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
