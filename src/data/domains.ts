import type { Domain, Layer } from '../types';

export const layers: Layer[] = [
  {
    id: 'foundation',
    number: 1,
    name: '基盤',
    subtitle: '知る・判断する',
    description: '個人の頭の中に入れる「OS」。ここが弱いと何をしていいかわからない選手になる。',
    domainIds: ['basic-logic', 'decision-making'],
  },
  {
    id: 'execution',
    number: 2,
    name: '実行',
    subtitle: '動く・守る',
    description: 'OSの上で走る「アプリケーション」。チームとして設計図を実行し、同時にリスクを管理する。',
    domainIds: ['team-tactics', 'risk-management'],
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
    domainIds: ['game-reading'],
  },
];

export const domains: Domain[] = [
  {
    id: 'basic-logic',
    layerId: 'foundation',
    name: '基礎論理',
    description: 'ポゼッション×PPPの構造理解 / スペーシングの原則 / アドバンテージの発生条件',
    icon: '📐',
    levels: 3,
  },
  {
    id: 'decision-making',
    layerId: 'foundation',
    name: '意思決定',
    description: '状況別の最適選択肢を反復で直感化 / リスクとリターンの瞬時評価',
    icon: '🎯',
    levels: 3,
  },
  {
    id: 'team-tactics',
    layerId: 'execution',
    name: '集団戦術',
    description: 'ハイバリュースポットの創出 / オフボールの連動 / セットとモーションの使い分け',
    icon: '♟️',
    levels: 3,
  },
  {
    id: 'risk-management',
    layerId: 'execution',
    name: 'リスク管理',
    description: 'TO削減 / ディフェンスの誘導と限定 / ファウルマネジメント / トランジションバック',
    icon: '🛡️',
    levels: 3,
  },
  {
    id: 'communication',
    layerId: 'connection',
    name: 'コミュニケーション',
    description: 'スクリーン・ローテーションのコール / ディフェンスの声かけ / ベンチとの情報共有',
    icon: '📢',
    levels: 3,
  },
  {
    id: 'game-reading',
    layerId: 'integration',
    name: 'ゲームリーディング',
    description: 'タイム＆スコア管理 / モメンタムの感知と操作 / 相手の弱点・傾向の察知',
    icon: '🧠',
    levels: 3,
  },
];

export function getDomainById(id: string) {
  return domains.find((d) => d.id === id);
}

export function getLayerById(id: string) {
  return layers.find((l) => l.id === id);
}
