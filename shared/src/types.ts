// ========== Core Enums ==========
export enum GamePhase {
  LOBBY = 'lobby',
  TRIVIA = 'trivia',
  CATEGORY_BATTLE = 'category_battle',
  ROUND_RESULT = 'round_result',
  GAME_OVER = 'game_over'
}

export enum PlayerRole {
  HOST = 'host',
  GUEST = 'guest'
}

// ========== Player Types ==========
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isConnected: boolean;
  isReady: boolean;
}

// ========== Trivia Types ==========
export interface TriviaQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
}

export interface TriviaRoundState {
  question: TriviaQuestion;
  timeRemaining: number;
  player1Answer: string | null;
  player2Answer: string | null;
  revealedAnswer: string | null;
}

// ========== Category Battle Types ==========
export interface CategoryItem {
  value: string;
  playerId: string;
  timestamp: number;
  isValid: boolean;
}

export interface CategoryBattleState {
  category: string;
  currentTurnPlayerId: string;
  timeRemaining: number;
  usedItems: CategoryItem[];
  consecutiveFails: number;
}

// ========== Game State ==========
export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: [Player | null, Player | null];
  score: number; // -100 to +100 (positive = host winning)
  currentRound: number;
  maxRounds: number;

  // Round-specific state
  triviaState: TriviaRoundState | null;
  categoryState: CategoryBattleState | null;

  // Round results
  lastRoundWinner: string | null;
  lastRoundPointChange: number;

  // Timing
  roundStartTime: number | null;
  turnStartTime: number | null;
}

// ========== API Response Types ==========
export interface OpenTDBResponse {
  response_code: number;
  results: Array<{
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }>;
}

// ========== Constants ==========
export const GAME_CONSTANTS = {
  ROOM_CODE_LENGTH: 4,
  TRIVIA_TIME_LIMIT: 10,
  CATEGORY_TURN_TIME: 10,
  WIN_THRESHOLD: 100,
  TRIVIA_CORRECT_POINTS: 15,
  CATEGORY_ITEM_POINTS: 5,
  MAX_ROUNDS: 10,
  MIN_PLAYERS: 2
} as const;
