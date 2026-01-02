import type { GameState, Player, TriviaQuestion, CpuDifficulty } from './types.js';

// ========== Client -> Server Events ==========
export interface ClientToServerEvents {
  // Lobby
  'create-room': (playerName: string) => void;
  'join-room': (roomCode: string, playerName: string) => void;
  'create-cpu-game': (playerName: string, difficulty: CpuDifficulty) => void;
  'player-ready': () => void;
  'start-game': () => void;

  // Trivia
  'submit-trivia-answer': (answer: string) => void;

  // Category Battle
  'submit-category-item': (item: string) => void;
  'pass-turn': () => void;

  // General
  'leave-game': () => void;
  'request-rematch': () => void;
}

// ========== Server -> Client Events ==========
export interface ServerToClientEvents {
  // Connection
  connected: (playerId: string) => void;
  error: (message: string) => void;

  // Lobby
  'room-created': (roomCode: string) => void;
  'room-joined': (gameState: GameState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-ready-changed': (playerId: string, isReady: boolean) => void;

  // Game State
  'game-state-update': (gameState: GameState) => void;
  'phase-change': (phase: string, data: unknown) => void;

  // Trivia
  'trivia-question': (question: TriviaQuestion) => void;
  'trivia-answer-submitted': (playerId: string) => void;
  'trivia-result': (result: {
    correctAnswer: string;
    winnerId: string | null;
    pointChange: number;
  }) => void;

  // Category Battle
  'category-start': (category: string, firstPlayerId: string) => void;
  'category-item-result': (result: {
    item: string;
    playerId: string;
    isValid: boolean;
    pointChange: number;
  }) => void;
  'turn-change': (playerId: string) => void;
  'category-end': (winnerId: string, reason: string) => void;

  // Timer
  'timer-tick': (timeRemaining: number) => void;

  // Game Over
  'game-over': (result: {
    winnerId: string;
    finalScore: number;
    reason: 'threshold' | 'rounds' | 'forfeit';
  }) => void;

  // Rematch
  'rematch-requested': (playerId: string) => void;
  'rematch-accepted': () => void;
}
