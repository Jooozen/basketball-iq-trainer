import type { Domain } from '../types';

export const domains: Domain[] = [
  {
    id: 'basic-logic',
    name: '基礎論理',
    description: 'ポゼッション×PPP（Points Per Possession）の構造を理解し、得点効率の基本原理を身につける',
    icon: '📐',
    levels: 3,
  },
  {
    id: 'decision-making',
    name: '意思決定',
    description: '状況別の期待値（EV）を理解し、最適なプレー選択を瞬時に判断できるようになる',
    icon: '🎯',
    levels: 3,
  },
  {
    id: 'team-tactics',
    name: '集団戦術',
    description: 'ハイバリュースポットの創出方法を学び、チームとしての得点機会を最大化する',
    icon: '♟️',
    levels: 3,
  },
  {
    id: 'risk-management',
    name: 'リスク管理',
    description: 'ターンオーバーコストの定量的理解とディフェンスの誘導テクニックを習得する',
    icon: '🛡️',
    levels: 3,
  },
  {
    id: 'situational-judgment',
    name: '状況判断',
    description: 'タイム＆スコア管理と相手の弱点分析に基づく試合中の意思決定を磨く',
    icon: '⏱️',
    levels: 3,
  },
];

export function getDomainById(id: string) {
  return domains.find((d) => d.id === id);
}
