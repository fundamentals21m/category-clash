import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CpuDifficulty } from '@category-clash/shared';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';

export function useGameSocket() {
  const socket = useSocket();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const createRoom = useCallback(
    (playerName: string) => {
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
      dispatch({ type: 'CLEAR_ERROR' });
      socket?.emit('create-room', playerName);
    },
    [dispatch, socket]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
      dispatch({ type: 'CLEAR_ERROR' });
      socket?.emit('join-room', roomCode.toUpperCase(), playerName);
    },
    [dispatch, socket]
  );

  const createCpuGame = useCallback(
    (playerName: string, difficulty: CpuDifficulty) => {
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
      dispatch({ type: 'CLEAR_ERROR' });
      socket?.emit('create-cpu-game', playerName, difficulty);
    },
    [dispatch, socket]
  );

  const setReady = useCallback(() => {
    socket?.emit('player-ready');
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('start-game');
  }, [socket]);

  const submitTriviaAnswer = useCallback((answer: string) => {
    socket?.emit('submit-trivia-answer', answer);
  }, [socket]);

  const submitCategoryItem = useCallback((item: string) => {
    socket?.emit('submit-category-item', item);
  }, [socket]);

  const passTurn = useCallback(() => {
    socket?.emit('pass-turn');
  }, [socket]);

  const leaveGame = useCallback(() => {
    socket?.emit('leave-game');
    dispatch({ type: 'RESET' });
    navigate('/');
  }, [dispatch, navigate, socket]);

  return {
    socket,
    isConnected: state.isConnected,
    createRoom,
    joinRoom,
    createCpuGame,
    setReady,
    startGame,
    submitTriviaAnswer,
    submitCategoryItem,
    passTurn,
    leaveGame
  };
}
