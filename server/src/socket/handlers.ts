import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GamePhase,
  GAME_CONSTANTS
} from '@category-clash/shared';
import { RoomManager } from '../game/RoomManager.js';
import { GameStateMachine } from '../game/GameStateMachine.js';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  const roomManager = new RoomManager();
  const gameStateMachine = new GameStateMachine();
  const roundTimers = new Map<string, NodeJS.Timeout>();

  // ========== Timer Management ==========

  function startRoundTimer(roomCode: string, seconds: number) {
    clearRoundTimer(roomCode);

    let remaining = seconds;

    const timer = setInterval(() => {
      remaining--;
      io.to(roomCode).emit('timer-tick', remaining);

      const room = roomManager.getRoom(roomCode);
      if (room) {
        if (room.phase === GamePhase.TRIVIA && room.triviaState) {
          room.triviaState.timeRemaining = remaining;
        } else if (
          room.phase === GamePhase.CATEGORY_BATTLE &&
          room.categoryState
        ) {
          room.categoryState.timeRemaining = remaining;
        }
      }

      if (remaining <= 0) {
        clearInterval(timer);
        roundTimers.delete(roomCode);
        handleTimeout(roomCode);
      }
    }, 1000);

    roundTimers.set(roomCode, timer);
  }

  function clearRoundTimer(roomCode: string) {
    const timer = roundTimers.get(roomCode);
    if (timer) {
      clearInterval(timer);
      roundTimers.delete(roomCode);
    }
  }

  async function handleTimeout(roomCode: string) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (room.phase === GamePhase.TRIVIA) {
      await resolveTriviaAndAdvance(roomCode);
    } else if (room.phase === GamePhase.CATEGORY_BATTLE) {
      const result = gameStateMachine.handleCategoryTimeout(room);

      if (result.roundEnded) {
        io.to(roomCode).emit('category-end', result.winnerId!, 'timeout');
        await advanceGame(roomCode);
      } else {
        io.to(roomCode).emit(
          'turn-change',
          room.categoryState!.currentTurnPlayerId
        );
        io.to(roomCode).emit('game-state-update', room);
        startRoundTimer(roomCode, GAME_CONSTANTS.CATEGORY_TURN_TIME);
      }
    }
  }

  async function resolveTriviaAndAdvance(roomCode: string) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const result = gameStateMachine.resolveTriviaRound(room);
    io.to(roomCode).emit('trivia-result', result);
    io.to(roomCode).emit('game-state-update', room);

    // Check for game over
    const gameOverCheck = gameStateMachine.checkGameOver(room);
    if (gameOverCheck.isOver) {
      room.phase = GamePhase.GAME_OVER;
      io.to(roomCode).emit('game-state-update', room);
      io.to(roomCode).emit('game-over', {
        winnerId: gameOverCheck.winnerId!,
        finalScore: room.score,
        reason: gameOverCheck.reason!
      });
      return;
    }

    // Transition to category battle after a delay
    setTimeout(() => {
      const currentRoom = roomManager.getRoom(roomCode);
      if (!currentRoom || !currentRoom.players[0] || !currentRoom.players[1]) {
        return; // Room or players no longer valid
      }
      const updatedRoom = gameStateMachine.startCategoryBattle(currentRoom);
      io.to(roomCode).emit('game-state-update', updatedRoom);
      io.to(roomCode).emit(
        'category-start',
        updatedRoom.categoryState!.category,
        updatedRoom.categoryState!.currentTurnPlayerId
      );
      startRoundTimer(roomCode, GAME_CONSTANTS.CATEGORY_TURN_TIME);
    }, 3000); // 3 second delay to show results
  }

  async function advanceGame(roomCode: string) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    // Check for game over
    const gameOverCheck = gameStateMachine.checkGameOver(room);
    if (gameOverCheck.isOver) {
      room.phase = GamePhase.GAME_OVER;
      io.to(roomCode).emit('game-state-update', room);
      io.to(roomCode).emit('game-over', {
        winnerId: gameOverCheck.winnerId!,
        finalScore: room.score,
        reason: gameOverCheck.reason!
      });
      return;
    }

    // Advance to next round (trivia) after a delay
    setTimeout(async () => {
      gameStateMachine.advanceToNextRound(room);
      const updatedRoom = await gameStateMachine.startTriviaRound(room);
      io.to(roomCode).emit('game-state-update', updatedRoom);
      io.to(roomCode).emit(
        'trivia-question',
        updatedRoom.triviaState!.question
      );
      startRoundTimer(roomCode, GAME_CONSTANTS.TRIVIA_TIME_LIMIT);
    }, 3000);
  }

  // ========== Socket Connection Handler ==========

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('connected', socket.id);

    // ========== Lobby Events ==========

    socket.on('create-room', (playerName) => {
      try {
        const gameState = roomManager.createRoom(socket.id, playerName);
        socket.join(gameState.roomCode);
        socket.emit('room-created', gameState.roomCode);
        socket.emit('game-state-update', gameState);
        console.log(`Room ${gameState.roomCode} created by ${playerName}`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', 'Failed to create room');
      }
    });

    socket.on('join-room', (roomCode, playerName) => {
      try {
        const gameState = roomManager.joinRoom(
          roomCode,
          socket.id,
          playerName
        );
        if (!gameState) {
          socket.emit('error', 'Room not found or full');
          return;
        }
        socket.join(roomCode.toUpperCase());
        socket.emit('room-joined', gameState);
        io.to(roomCode.toUpperCase()).emit('game-state-update', gameState);
        io.to(roomCode.toUpperCase()).emit(
          'player-joined',
          gameState.players[1]!
        );
        console.log(`${playerName} joined room ${roomCode}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', 'Failed to join room');
      }
    });

    socket.on('player-ready', () => {
      try {
        const room = roomManager.setPlayerReady(socket.id);
        if (!room) {
          socket.emit('error', 'Not in a room');
          return;
        }

        const player = room.players.find((p): p is NonNullable<typeof p> => p?.id === socket.id);
        if (player) {
          io.to(room.roomCode).emit(
            'player-ready-changed',
            socket.id,
            player.isReady
          );
          io.to(room.roomCode).emit('game-state-update', room);
        }
      } catch (error) {
        console.error('Error toggling ready:', error);
        socket.emit('error', 'Failed to toggle ready state');
      }
    });

    socket.on('start-game', async () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) {
          socket.emit('error', 'Not in a room');
          return;
        }

        // Only host can start
        if (room.players[0]?.id !== socket.id) {
          socket.emit('error', 'Only host can start the game');
          return;
        }

        if (!roomManager.canStartGame(room)) {
          socket.emit('error', 'Both players must be ready');
          return;
        }

        console.log(`Game starting in room ${room.roomCode}`);
        const updatedRoom = await gameStateMachine.startGame(room);
        io.to(room.roomCode).emit('game-state-update', updatedRoom);
        io.to(room.roomCode).emit(
          'trivia-question',
          updatedRoom.triviaState!.question
        );
        startRoundTimer(room.roomCode, GAME_CONSTANTS.TRIVIA_TIME_LIMIT);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', 'Failed to start game');
      }
    });

    // ========== Trivia Events ==========

    socket.on('submit-trivia-answer', async (answer) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room || room.phase !== GamePhase.TRIVIA) return;

        const { bothAnswered } = gameStateMachine.processTriviaAnswer(
          room,
          socket.id,
          answer
        );

        io.to(room.roomCode).emit('trivia-answer-submitted', socket.id);

        if (bothAnswered) {
          clearRoundTimer(room.roomCode);
          await resolveTriviaAndAdvance(room.roomCode);
        }
      } catch (error) {
        console.error('Error submitting trivia answer:', error);
      }
    });

    // ========== Category Battle Events ==========

    socket.on('submit-category-item', async (item) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room || room.phase !== GamePhase.CATEGORY_BATTLE) return;

        const result = gameStateMachine.processCategoryItem(
          room,
          socket.id,
          item
        );

        io.to(room.roomCode).emit('category-item-result', {
          item,
          playerId: socket.id,
          isValid: result.isValid,
          pointChange: result.pointChange
        });

        if (result.roundEnded) {
          clearRoundTimer(room.roomCode);
          io.to(room.roomCode).emit(
            'category-end',
            result.winnerId!,
            result.reason || 'invalid'
          );
          await advanceGame(room.roomCode);
        } else {
          // Reset turn timer
          clearRoundTimer(room.roomCode);
          io.to(room.roomCode).emit(
            'turn-change',
            room.categoryState!.currentTurnPlayerId
          );
          io.to(room.roomCode).emit('game-state-update', room);
          startRoundTimer(room.roomCode, GAME_CONSTANTS.CATEGORY_TURN_TIME);
        }
      } catch (error) {
        console.error('Error submitting category item:', error);
      }
    });

    socket.on('pass-turn', async () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room || room.phase !== GamePhase.CATEGORY_BATTLE) return;
        if (room.categoryState?.currentTurnPlayerId !== socket.id) return;

        // Passing is treated as an invalid answer
        const result = gameStateMachine.processCategoryItem(
          room,
          socket.id,
          '__PASS__'
        );

        io.to(room.roomCode).emit('category-item-result', {
          item: '[PASS]',
          playerId: socket.id,
          isValid: false,
          pointChange: 0
        });

        if (result.roundEnded) {
          clearRoundTimer(room.roomCode);
          io.to(room.roomCode).emit(
            'category-end',
            result.winnerId!,
            'pass'
          );
          await advanceGame(room.roomCode);
        } else {
          clearRoundTimer(room.roomCode);
          io.to(room.roomCode).emit(
            'turn-change',
            room.categoryState!.currentTurnPlayerId
          );
          io.to(room.roomCode).emit('game-state-update', room);
          startRoundTimer(room.roomCode, GAME_CONSTANTS.CATEGORY_TURN_TIME);
        }
      } catch (error) {
        console.error('Error passing turn:', error);
      }
    });

    // ========== General Events ==========

    socket.on('leave-game', () => {
      const result = roomManager.removePlayer(socket.id);
      if (result) {
        clearRoundTimer(result.room.roomCode);
        socket.leave(result.room.roomCode);
        io.to(result.room.roomCode).emit('player-left', socket.id);
        io.to(result.room.roomCode).emit('game-state-update', result.room);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const result = roomManager.removePlayer(socket.id);
      if (result) {
        clearRoundTimer(result.room.roomCode);
        io.to(result.room.roomCode).emit('player-left', socket.id);

        // If game was in progress, end it
        if (
          result.room.phase !== GamePhase.LOBBY &&
          (result.room.players[0] || result.room.players[1])
        ) {
          const remainingPlayer =
            result.room.players[0] || result.room.players[1];
          if (remainingPlayer) {
            result.room.phase = GamePhase.GAME_OVER;
            io.to(result.room.roomCode).emit('game-over', {
              winnerId: remainingPlayer.id,
              finalScore: result.room.score,
              reason: 'forfeit'
            });
          }
        }
      }
    });
  });
}
