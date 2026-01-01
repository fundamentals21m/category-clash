import { useState } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';
import { useGame } from '../context/GameContext';

type Mode = 'home' | 'create' | 'join';

export default function HomeScreen() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<Mode>('home');
  const { createRoom, joinRoom, isConnected } = useGameSocket();
  const { state } = useGame();

  const handleCreate = () => {
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && roomCode.trim().length === 4) {
      joinRoom(roomCode.trim(), playerName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-2">Category Clash</h1>
      <p className="text-gray-400 mb-8">Trivia meets word battle</p>

      {!isConnected && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-4 py-2 rounded mb-4">
          Connecting to server...
        </div>
      )}

      {state.error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-2 rounded mb-4">
          {state.error}
        </div>
      )}

      {mode === 'home' && (
        <div className="space-y-4 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            disabled={!isConnected}
            className="w-full py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Create Game
          </button>
          <button
            onClick={() => setMode('join')}
            disabled={!isConnected}
            className="w-full py-4 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Join Game
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCreate)}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
            maxLength={20}
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!playerName.trim() || !isConnected}
            className="w-full py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('home')}
            className="w-full py-2 text-gray-400 hover:text-white transition"
          >
            Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="space-y-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
            maxLength={20}
            autoFocus
          />
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => handleKeyDown(e, handleJoin)}
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-secondary focus:outline-none text-center text-2xl tracking-widest font-mono"
            maxLength={4}
          />
          <button
            onClick={handleJoin}
            disabled={!playerName.trim() || roomCode.length !== 4 || !isConnected}
            className="w-full py-4 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Join Room
          </button>
          <button
            onClick={() => setMode('home')}
            className="w-full py-2 text-gray-400 hover:text-white transition"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
