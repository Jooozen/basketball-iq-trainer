import type { DomainId, Screen } from '../types';
import { domains } from '../data/domains';

interface Props {
  scores: Record<DomainId, { correct: number; total: number }>;
  onNavigate: (screen: Screen) => void;
}

export function ComprehensiveResultScreen({ scores, onNavigate }: Props) {
  const totalCorrect = Object.values(scores).reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
  const overallRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Radar chart calculations
  const domainRates = domains.map((d) => {
    const s = scores[d.id];
    return s && s.total > 0 ? (s.correct / s.total) * 100 : 0;
  });

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const n = domains.length;

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Grid rings
  const rings = [25, 50, 75, 100];

  // Data polygon
  const dataPoints = domainRates.map((rate, i) => getPoint(i, rate));
  const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  return (
    <div className="result-screen comprehensive-result">
      <div className="result-card comprehensive-result-card">
        <div className="result-icon">&#128202;</div>
        <h2 className="result-title">実力テスト結果</h2>

        <div className="result-score">
          <span className="score-number">{totalCorrect}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{totalQuestions}</span>
        </div>
        <p className="result-rate">
          総合正答率 {overallRate}%
          {overallRate >= 70 && <span className="pass-badge">PASS</span>}
        </p>

        {/* Radar Chart */}
        <div className="radar-chart-container">
          <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart">
            {/* Grid rings */}
            {rings.map((ring) => {
              const points = Array.from({ length: n }, (_, i) => getPoint(i, ring));
              const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
              return <path key={ring} d={path} className="radar-grid" />;
            })}

            {/* Axis lines */}
            {Array.from({ length: n }, (_, i) => {
              const p = getPoint(i, 100);
              return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="radar-axis" />;
            })}

            {/* Data polygon */}
            <path d={dataPath} className="radar-data" />

            {/* Data points */}
            {dataPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3.5} className="radar-point" />
            ))}

            {/* Labels */}
            {domains.map((d, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const labelR = radius + 18;
              const lx = cx + labelR * Math.cos(angle);
              const ly = cy + labelR * Math.sin(angle);
              return (
                <text
                  key={d.id}
                  x={lx}
                  y={ly}
                  className="radar-label"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {d.icon}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Per-domain scores */}
        <div className="comprehensive-domain-scores">
          {domains.map((d) => {
            const s = scores[d.id];
            const rate = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={d.id} className="comp-domain-row">
                <span className="comp-domain-icon">{d.icon}</span>
                <span className="comp-domain-name">{d.name}</span>
                <span className="comp-domain-score">{s?.correct ?? 0}/{s?.total ?? 0}</span>
                <span className={`comp-domain-rate ${rate >= 70 ? 'rate-good' : rate >= 40 ? 'rate-ok' : 'rate-bad'}`}>
                  {rate}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button
            className="btn-primary"
            onClick={() => onNavigate({ type: 'comprehensive-test' })}
          >
            もう一度テスト
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
