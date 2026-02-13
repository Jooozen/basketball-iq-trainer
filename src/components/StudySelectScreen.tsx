import { domains, layers } from '../data/domains';
import type { Question, Screen } from '../types';
import { getQuestionsByDomain } from '../data/questions';

interface Props {
  questions: Question[];
  onNavigate: (screen: Screen) => void;
}

export function StudySelectScreen({ questions, onNavigate }: Props) {
  return (
    <div className="study-select-screen">
      <div className="study-select-header">
        <div className="study-select-icon">📚</div>
        <h2 className="study-select-title">学習モード</h2>
        <p className="study-select-subtitle">
          問題と正解・解説をまとめて読めます。<br />
          領域を選んでください。
        </p>
      </div>

      {layers.map((layer) => {
        const layerDomains = domains.filter((d) =>
          layer.domainIds.includes(d.id),
        );

        return (
          <div key={layer.id} className="study-layer-section">
            <div className="layer-label">
              第{layer.number}層：{layer.name}
            </div>

            <div className="study-domain-list">
              {layerDomains.map((domain) => {
                const qCount = getQuestionsByDomain(questions, domain.id).length;

                return (
                  <button
                    key={domain.id}
                    className="study-domain-card"
                    onClick={() => onNavigate({ type: 'study', domainId: domain.id })}
                    disabled={qCount === 0}
                  >
                    <span className="study-domain-icon">{domain.icon}</span>
                    <div className="study-domain-info">
                      <div className="study-domain-name">{domain.name}</div>
                      <div className="study-domain-desc">{domain.description}</div>
                    </div>
                    <span className="study-domain-count">{qCount}問</span>
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
