import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useGameSocket } from '../hooks/useGameSocket';
import { GamePhase } from '@category-clash/shared';
import TugOfWarBar from '../components/TugOfWarBar';
import TriviaRound from '../components/TriviaRound';
import CategoryBattle from '../components/CategoryBattle';

export default function GameScreen() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { leaveGame } = useGameSocket();
  const gameState = state.gameState;

  // Redirect if no game state
  useEffect(() => {
    if (!gameState) {
      navigate('/');
    }
  }, [gameState, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darker">
        <div className="text-gray-400">Loading game...</div>
      </div>
    );
  }

  const phase = gameState.phase as GamePhase;
  const currentRound = gameState.currentRound || 1;
  const maxRounds = gameState.maxRounds || 10;

  // Get phase label
  const getPhaseLabel = () => {
    switch (phase) {
      case GamePhase.TRIVIA:
        return 'Trivia';
      case GamePhase.CATEGORY_BATTLE:
        return 'Category Battle';
      case GamePhase.ROUND_RESULT:
        return 'Results';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-darker">
      {/* Header */}
      <header className="p-4 bg-dark border-b border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">
            Round {currentRound} / {maxRounds}
          </div>
          <div className="text-sm font-medium text-primary">{getPhaseLabel()}</div>
          <button
            onClick={leaveGame}
            className="text-sm text-gray-500 hover:text-danger transition"
          >
            Leave
          </button>
        </div>
        <TugOfWarBar />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center overflow-y-auto py-4">
        {phase === GamePhase.TRIVIA && <TriviaRound />}
        {phase === GamePhase.CATEGORY_BATTLE && <CategoryBattle />}
        {phase === GamePhase.ROUND_RESULT && (
          <div className="text-center p-8">
            <div className="text-2xl font-bold text-white mb-2">
              Round Complete!
            </div>
            <div className="text-gray-400">Next round starting...</div>
          </div>
        )}
      </main>
    </div>
  );
}
