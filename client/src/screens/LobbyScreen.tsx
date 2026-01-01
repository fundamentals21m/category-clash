import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useGameSocket } from '../hooks/useGameSocket';
import { useEffect } from 'react';

export default function LobbyScreen() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { state } = useGame();
  const { setReady, startGame, leaveGame } = useGameSocket();

  const gameState = state.gameState;
  const currentPlayer = gameState?.players.find((p) => p?.id === state.playerId);
  const otherPlayer = gameState?.players.find((p) => p?.id !== state.playerId);
  const isHost = currentPlayer?.role === 'host';
  const bothReady =
    gameState?.players[0]?.isReady && gameState?.players[1]?.isReady;

  // Redirect if no game state
  useEffect(() => {
    if (!gameState && roomCode) {
      // Could try to rejoin here, but for now redirect home
      navigate('/');
    }
  }, [gameState, roomCode, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <p className="text-gray-400 mb-2">Room Code</p>
        <h1 className="text-5xl font-bold font-mono tracking-widest text-primary">
          {gameState.roomCode}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Share this code with your friend
        </p>
      </div>

      {state.error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-2 rounded mb-4">
          {state.error}
        </div>
      )}

      <div className="w-full max-w-md space-y-4 mb-8">
        {/* Host player */}
        <PlayerCard
          name={gameState.players[0]?.name || 'Waiting...'}
          isReady={gameState.players[0]?.isReady || false}
          isYou={gameState.players[0]?.id === state.playerId}
          isConnected={gameState.players[0]?.isConnected || false}
          isEmpty={!gameState.players[0]}
          role="Host"
        />

        <div className="text-center text-gray-500 text-2xl">vs</div>

        {/* Guest player */}
        <PlayerCard
          name={gameState.players[1]?.name || 'Waiting for player...'}
          isReady={gameState.players[1]?.isReady || false}
          isYou={gameState.players[1]?.id === state.playerId}
          isConnected={gameState.players[1]?.isConnected || false}
          isEmpty={!gameState.players[1]}
          role="Guest"
        />
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={setReady}
          disabled={!gameState.players[1]}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
            currentPlayer?.isReady
              ? 'bg-success text-white'
              : 'bg-dark border-2 border-success text-success hover:bg-success/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {currentPlayer?.isReady ? 'Ready!' : 'Click when Ready'}
        </button>

        {isHost && (
          <button
            onClick={startGame}
            disabled={!bothReady}
            className="w-full py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Start Game
          </button>
        )}

        {!isHost && bothReady && (
          <p className="text-center text-gray-400">
            Waiting for host to start...
          </p>
        )}

        <button
          onClick={leaveGame}
          className="w-full py-2 text-gray-400 hover:text-danger transition"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  name: string;
  isReady: boolean;
  isYou: boolean;
  isConnected: boolean;
  isEmpty: boolean;
  role: 'Host' | 'Guest';
}

function PlayerCard({
  name,
  isReady,
  isYou,
  isConnected,
  isEmpty,
  role
}: PlayerCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isEmpty
          ? 'border-dashed border-gray-700 bg-dark/50'
          : isReady
          ? 'border-success bg-success/10'
          : 'border-gray-700 bg-dark'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {role}
          </p>
          <p className={`text-xl font-semibold ${isEmpty ? 'text-gray-500' : ''}`}>
            {name}
            {isYou && <span className="text-primary ml-2">(You)</span>}
          </p>
        </div>
        {!isEmpty && (
          <div className="text-right">
            {isReady ? (
              <span className="text-success font-semibold">Ready</span>
            ) : (
              <span className="text-gray-500">Not Ready</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
