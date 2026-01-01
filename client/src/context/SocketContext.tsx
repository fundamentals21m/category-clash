import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from '@category-clash/shared';
import { useGame } from './GameContext';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const SocketContext = createContext<GameSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<GameSocket | null>(null);
  const socketCreated = useRef(false);
  const { dispatch } = useGame();
  const navigate = useNavigate();

  // Store navigate in a ref to avoid recreating socket when navigate changes
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    // Prevent duplicate socket creation in StrictMode
    if (socketCreated.current) return;
    socketCreated.current = true;

    // Create socket connection once
    const newSocket: GameSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    // Connection events
    newSocket.on('connected', (playerId) => {
      console.log('Connected with ID:', playerId);
      dispatch({ type: 'SET_PLAYER_ID', payload: playerId });
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    newSocket.on('error', (message) => {
      console.error('Server error:', message);
      dispatch({ type: 'SET_ERROR', payload: message });
    });

    // Lobby events
    newSocket.on('room-created', (roomCode) => {
      console.log('Room created:', roomCode);
      navigateRef.current(`/lobby/${roomCode}`);
    });

    newSocket.on('room-joined', (gameState) => {
      console.log('Joined room:', gameState.roomCode);
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });
      navigateRef.current(`/lobby/${gameState.roomCode}`);
    });

    newSocket.on('player-joined', (player) => {
      console.log('Player joined:', player.name);
    });

    newSocket.on('player-left', (playerId) => {
      console.log('Player left:', playerId);
    });

    newSocket.on('player-ready-changed', (playerId, isReady) => {
      console.log('Player ready changed:', playerId, isReady);
    });

    // Game state updates
    newSocket.on('game-state-update', (gameState) => {
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });

      // Navigate based on phase (only if not already there)
      const phase = gameState.phase;
      const currentPath = window.location.pathname;

      if (phase === 'trivia' || phase === 'category_battle') {
        if (!currentPath.startsWith('/game/')) {
          navigateRef.current(`/game/${gameState.roomCode}`);
        }
      } else if (phase === 'game_over') {
        if (!currentPath.startsWith('/results/')) {
          navigateRef.current(`/results/${gameState.roomCode}`);
        }
      }
    });

    // Timer events
    newSocket.on('timer-tick', (timeRemaining) => {
      dispatch({ type: 'UPDATE_TIMER', payload: timeRemaining });
    });

    // Trivia events
    newSocket.on('trivia-question', (question) => {
      console.log('Trivia question received:', question.question);
    });

    newSocket.on('trivia-answer-submitted', (playerId) => {
      console.log('Player submitted answer:', playerId);
    });

    newSocket.on('trivia-result', (result) => {
      console.log('Trivia result:', result);
    });

    // Category battle events
    newSocket.on('category-start', (category, firstPlayerId) => {
      console.log('Category battle started:', category, 'First player:', firstPlayerId);
    });

    newSocket.on('category-item-result', (result) => {
      console.log('Category item result:', result);
    });

    newSocket.on('turn-change', (playerId) => {
      console.log('Turn changed to:', playerId);
    });

    newSocket.on('category-end', (winnerId, reason) => {
      console.log('Category ended. Winner:', winnerId, 'Reason:', reason);
    });

    // Game over
    newSocket.on('game-over', (result) => {
      console.log('Game over:', result);
    });

    // Cleanup only when app unmounts
    return () => {
      newSocket.disconnect();
      socketCreated.current = false;
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
