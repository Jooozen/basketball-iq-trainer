import { useState, useEffect } from 'react';
import type { Question } from './types';
import { loadQuestions } from './data/questions';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { ProgressScreen } from './components/ProgressScreen';
import './App.css';

function App() {
  const { state, navigate, answerQuestion, updateLevelStats, unlockLevel } = useAppState();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions()
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-loading">
        <p>エラー: {error}</p>
        <p className="text-muted">public/questions.json を確認してください</p>
      </div>
    );
  }

  const isHome = state.screen.type === 'home';

  function renderScreen() {
    const { screen } = state;

    switch (screen.type) {
      case 'home':
        return (
          <HomeScreen
            user={state.user}
            questions={questions}
            onNavigate={navigate}
          />
        );

      case 'quiz':
        return (
          <QuizScreen
            domainId={screen.domainId}
            level={screen.level}
            questions={questions}
            onAnswer={answerQuestion}
            onNavigate={navigate}
          />
        );

      case 'result':
        return (
          <ResultScreen
            domainId={screen.domainId}
            level={screen.level}
            correct={screen.correct}
            total={screen.total}
            user={state.user}
            onNavigate={navigate}
            onUnlockLevel={unlockLevel}
            onUpdateStats={updateLevelStats}
          />
        );

      case 'review':
        return (
          <ReviewScreen
            user={state.user}
            questions={questions}
            onAnswer={answerQuestion}
            onNavigate={navigate}
          />
        );

      case 'progress':
        return <ProgressScreen user={state.user} onNavigate={navigate} />;
    }
  }

  return (
    <div className="app">
      {!isHome && <Header screen={state.screen} onNavigate={navigate} />}
      <main className="app-main">{renderScreen()}</main>
    </div>
  );
}

export default App;
