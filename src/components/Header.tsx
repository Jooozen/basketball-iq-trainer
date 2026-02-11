import type { Screen } from '../types';

interface Props {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Header({ screen, onNavigate }: Props) {
  const isHome = screen.type === 'home';

  return (
    <header className="app-header">
      <div className="header-left">
        {!isHome && (
          <button
            className="btn-back"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ← Back
          </button>
        )}
      </div>
      <h1 className="header-title" onClick={() => onNavigate({ type: 'home' })}>
        Basketball <span className="title-accent">IQ</span>
      </h1>
      <div className="header-right">
        {isHome && (
          <button
            className="btn-icon"
            onClick={() => onNavigate({ type: 'progress' })}
            title="学習進捗"
          >
            📊
          </button>
        )}
      </div>
    </header>
  );
}
