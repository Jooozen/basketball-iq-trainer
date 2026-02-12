import type { Screen, UserState, Question } from '../types';
import { domains } from '../data/domains';
import { getQuestionsByDomain } from '../data/questions';

interface Props {
  user: UserState;
  onNavigate: (screen: Screen) => void;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  // Domain mastery badges
  { id: 'master_fundamentals', name: '基礎論理マスター', description: '基礎論理の全問正解', icon: '🧠' },
  { id: 'master_decision', name: '意思決定マスター', description: '意思決定の全問正解', icon: '⚡' },
  { id: 'master_team_tactics', name: '集団戦術マスター', description: '集団戦術の全問正解', icon: '♟️' },
  { id: 'master_risk', name: 'リスク管理マスター', description: 'リスク管理の全問正解', icon: '🛡️' },
  { id: 'master_communication', name: 'コミュニケーションマスター', description: 'コミュニケーションの全問正解', icon: '📢' },
  { id: 'master_game_reading', name: 'ゲームリーディングマスター', description: 'ゲームリーディングの全問正解', icon: '🔭' },

  // Streak badges
  { id: 'streak_3', name: '3日連続', description: 'デイリーチャレンジを3日連続クリア', icon: '🔥' },
  { id: 'streak_7', name: '1週間継続', description: 'デイリーチャレンジを7日連続クリア', icon: '💪' },
  { id: 'streak_30', name: '30日継続', description: 'デイリーチャレンジを30日連続クリア', icon: '👑' },

  // Comprehensive test badges
  { id: 'comp_pass', name: '実力テスト合格', description: '実力テストで正答率70%以上', icon: '📊' },
  { id: 'comp_perfect', name: '実力テスト満点', description: '実力テストで全問正解', icon: '💯' },

  // Time attack badges
  { id: 'ta_speed', name: 'スピードスター', description: 'タイムアタックで平均2秒以内', icon: '⏱️' },
  { id: 'ta_perfect', name: '完璧な判断', description: 'タイムアタックで全問正解', icon: '🎯' },

  // General badges
  { id: 'first_quiz', name: '初めの一歩', description: '最初のクイズを完了', icon: '🏀' },
  { id: 'all_domains', name: '全領域挑戦', description: '全6領域のクイズに挑戦', icon: '🌟' },
];

export function checkBadges(user: UserState, questions: Question[]): string[] {
  const newBadges: string[] = [];
  const earned = user.earnedBadges ?? [];

  // Domain mastery
  for (const domain of domains) {
    const badgeId = `master_${domain.id}`;
    if (earned.includes(badgeId)) continue;
    const domainQs = getQuestionsByDomain(questions, domain.id);
    const allCorrect = domainQs.length > 0 && domainQs.every(
      (q) => user.cards[q.id]?.lastQuality === 5,
    );
    if (allCorrect) newBadges.push(badgeId);
  }

  // Streak badges
  const streak = user.dailyStreak?.currentStreak ?? 0;
  if (streak >= 3 && !earned.includes('streak_3')) newBadges.push('streak_3');
  if (streak >= 7 && !earned.includes('streak_7')) newBadges.push('streak_7');
  if (streak >= 30 && !earned.includes('streak_30')) newBadges.push('streak_30');

  // Comprehensive test
  if (user.comprehensiveTestBest) {
    const scores = user.comprehensiveTestBest.scores;
    const totalCorrect = Object.values(scores).reduce((s, v) => s + v.correct, 0);
    const totalQ = Object.values(scores).reduce((s, v) => s + v.total, 0);
    const rate = totalQ > 0 ? totalCorrect / totalQ : 0;
    if (rate >= 0.7 && !earned.includes('comp_pass')) newBadges.push('comp_pass');
    if (totalCorrect === totalQ && totalQ > 0 && !earned.includes('comp_perfect')) newBadges.push('comp_perfect');
  }

  // Time attack
  if (user.timeAttackBest) {
    if (user.timeAttackBest.avgTime <= 2000 && !earned.includes('ta_speed')) newBadges.push('ta_speed');
    if (user.timeAttackBest.correct === user.timeAttackBest.total && !earned.includes('ta_perfect')) newBadges.push('ta_perfect');
  }

  // First quiz
  if (Object.keys(user.cards).length > 0 && !earned.includes('first_quiz')) {
    newBadges.push('first_quiz');
  }

  // All domains attempted
  if (!earned.includes('all_domains')) {
    const attempted = new Set(
      Object.keys(user.cards).map((qId) => {
        const q = questions.find((qq) => qq.id === qId);
        return q?.domainId;
      }).filter(Boolean),
    );
    if (attempted.size >= 6) newBadges.push('all_domains');
  }

  return newBadges;
}

export function BadgeScreen({ user, onNavigate }: Props) {
  const earned = user.earnedBadges ?? [];

  return (
    <div className="badge-screen">
      <div className="badge-header">
        <h2 className="section-title">バッジ・称号</h2>
        <p className="badge-subtitle">
          獲得: {earned.length} / {BADGE_DEFINITIONS.length}
        </p>
      </div>

      <div className="badge-grid">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = earned.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`badge-card ${isEarned ? 'badge-earned' : 'badge-locked'}`}
            >
              <div className="badge-icon">{isEarned ? badge.icon : '🔒'}</div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="home-footer">
        <button
          className="btn-ghost"
          onClick={() => onNavigate({ type: 'home' })}
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}
