import type { Domain, Layer } from '../types';

export const layers: Layer[] = [
  {
    id: 'foundation',
    number: 1,
    name: '基盤',
    subtitle: '知る・判断する',
    description: '個人の頭の中に入れる「OS」。ここが弱いと何をしていいかわからない選手になる。',
    domainIds: ['fundamentals', 'decision'],
  },
  {
    id: 'execution',
    number: 2,
    name: '実行',
    subtitle: '動く・守る',
    description: 'OSの上で走る「アプリケーション」。チームとして設計図を実行し、同時にリスクを管理する。',
    domainIds: ['team_tactics', 'risk'],
  },
  {
    id: 'connection',
    number: 3,
    name: '接続',
    subtitle: '伝える',
    description: '個人と集団をつなぐ「ネットワーク」。これがなければ5人はバラバラの個人のまま。',
    domainIds: ['communication'],
  },
  {
    id: 'integration',
    number: 4,
    name: '統合',
    subtitle: '読む',
    description: '試合全体を俯瞰する「マネージャー」。40分間を通じて勝率を最大化する視点。',
    domainIds: ['game_reading'],
  },
];

export const domains: Domain[] = [
  {
    id: 'fundamentals',
    layerId: 'foundation',
    name: '基礎論理',
    description: 'なぜ勝てるのかの原理を知る',
    icon: '🧠',
    levels: 3,
  },
  {
    id: 'decision',
    layerId: 'foundation',
    name: '意思決定',
    description: '判断を自動化し、迷いをなくす',
    icon: '⚡',
    levels: 3,
  },
  {
    id: 'team_tactics',
    layerId: 'execution',
    name: '集団戦術',
    description: '設計図通りにアドバンテージを生み出す',
    icon: '♟️',
    levels: 3,
  },
  {
    id: 'risk',
    layerId: 'execution',
    name: 'リスク管理',
    description: '損失を最小化し、イージーな得点を与えない',
    icon: '🛡️',
    levels: 3,
  },
  {
    id: 'communication',
    layerId: 'connection',
    name: 'コミュニケーション',
    description: '個人の認知をチーム全体の認知にする',
    icon: '📢',
    levels: 3,
  },
  {
    id: 'game_reading',
    layerId: 'integration',
    name: 'ゲームリーディング',
    description: '確率を試合単位で最大化する',
    icon: '🔭',
    levels: 3,
  },
];

export function getDomainById(id: string) {
  return domains.find((d) => d.id === id);
}

export function getLayerById(id: string) {
  return layers.find((l) => l.id === id);
}
