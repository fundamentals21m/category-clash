import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { GameState } from '@category-clash/shared';

interface GameContextState {
  playerId: string | null;
  playerName: string;
  gameState: GameState | null;
  isConnected: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'SET_PLAYER_ID'; payload: string }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

const initialState: GameContextState = {
  playerId: null,
  playerName: '',
  gameState: null,
  isConnected: false,
  error: null
};

function gameReducer(
  state: GameContextState,
  action: GameAction
): GameContextState {
  switch (action.type) {
    case 'SET_PLAYER_ID':
      return { ...state, playerId: action.payload };
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload, error: null };
    case 'UPDATE_TIMER':
      if (!state.gameState) return state;
      const updatedGameState = { ...state.gameState };
      if (updatedGameState.triviaState) {
        updatedGameState.triviaState = {
          ...updatedGameState.triviaState,
          timeRemaining: action.payload
        };
      }
      if (updatedGameState.categoryState) {
        updatedGameState.categoryState = {
          ...updatedGameState.categoryState,
          timeRemaining: action.payload
        };
      }
      return { ...state, gameState: updatedGameState };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return { ...initialState, playerName: state.playerName };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
