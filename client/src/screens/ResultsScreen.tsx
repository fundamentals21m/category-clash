import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const gameState = state.gameState;

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET' });
    navigate('/');
  };

  // Redirect if no game state
  useEffect(() => {
    if (!gameState) {
      navigate('/');
    }
  }, [gameState, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darker">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No game data available</p>
          <button
            onClick={handlePlayAgain}
            className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Determine winner
  const hostWon = gameState.score >= 0;
  const winner = hostWon ? gameState.players[0] : gameState.players[1];
  const isCurrentPlayerWinner = winner?.id === state.playerId;
  const finalScore = Math.abs(gameState.score);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-darker">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Trophy or sad face */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-8xl mb-6"
        >
          {isCurrentPlayerWinner ? '🏆' : '😢'}
        </motion.div>

        {/* Win/Lose message */}
        <h1
          className={`text-5xl font-bold mb-4 ${
            isCurrentPlayerWinner ? 'text-success' : 'text-danger'
          }`}
        >
          {isCurrentPlayerWinner ? 'You Win!' : 'You Lose!'}
        </h1>

        {/* Winner name */}
        <p className="text-xl text-gray-300 mb-2">
          <span className={isCurrentPlayerWinner ? 'text-success' : 'text-primary'}>
            {winner?.name}
          </span>{' '}
          wins!
        </p>

        {/* Score */}
        <div className="my-8 p-6 bg-dark rounded-xl">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
            Final Margin
          </p>
          <p className="text-4xl font-bold text-white">{finalScore}</p>
          <p className="text-gray-500 text-sm mt-2">
            {gameState.currentRound} rounds played
          </p>
        </div>

        {/* Player scores visual */}
        <div className="flex justify-around items-center mb-8 text-sm">
          <div className={hostWon ? 'text-success' : 'text-gray-400'}>
            <p className="font-semibold">{gameState.players[0]?.name}</p>
            <p>{hostWon ? 'Winner' : 'Loser'}</p>
          </div>
          <div className="text-gray-600">vs</div>
          <div className={!hostWon ? 'text-success' : 'text-gray-400'}>
            <p className="font-semibold">{gameState.players[1]?.name}</p>
            <p>{!hostWon ? 'Winner' : 'Loser'}</p>
          </div>
        </div>

        {/* Play again button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          className="px-8 py-4 bg-primary hover:bg-primary/80 rounded-lg font-semibold text-lg transition w-full"
        >
          Play Again
        </motion.button>
      </motion.div>
    </div>
  );
}
