import {
  GameState,
  GamePhase,
  Player,
  PlayerRole,
  GAME_CONSTANTS
} from '@category-clash/shared';

export class RoomManager {
  private rooms: Map<string, GameState> = new Map();
  private playerToRoom: Map<string, string> = new Map();

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
    let code: string;
    do {
      code = Array.from(
        { length: GAME_CONSTANTS.ROOM_CODE_LENGTH },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId: string, hostName: string): GameState {
    const roomCode = this.generateRoomCode();
    const host: Player = {
      id: hostId,
      name: hostName,
      role: PlayerRole.HOST,
      isConnected: true,
      isReady: false
    };

    const gameState: GameState = {
      roomCode,
      phase: GamePhase.LOBBY,
      players: [host, null],
      score: 0,
      currentRound: 0,
      maxRounds: GAME_CONSTANTS.MAX_ROUNDS,
      triviaState: null,
      categoryState: null,
      lastRoundWinner: null,
      lastRoundPointChange: 0,
      roundStartTime: null,
      turnStartTime: null
    };

    this.rooms.set(roomCode, gameState);
    this.playerToRoom.set(hostId, roomCode);
    return gameState;
  }

  joinRoom(
    roomCode: string,
    guestId: string,
    guestName: string
  ): GameState | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.players[1] !== null || room.phase !== GamePhase.LOBBY) {
      return null;
    }

    const guest: Player = {
      id: guestId,
      name: guestName,
      role: PlayerRole.GUEST,
      isConnected: true,
      isReady: false
    };

    room.players[1] = guest;
    this.playerToRoom.set(guestId, roomCode.toUpperCase());
    return room;
  }

  getRoom(roomCode: string): GameState | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  getRoomByPlayerId(playerId: string): GameState | undefined {
    const roomCode = this.playerToRoom.get(playerId);
    return roomCode ? this.rooms.get(roomCode) : undefined;
  }

  removePlayer(playerId: string): { room: GameState; wasHost: boolean } | null {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    this.playerToRoom.delete(playerId);
    const wasHost = room.players[0]?.id === playerId;

    if (wasHost) {
      room.players[0] = null;
    } else {
      room.players[1] = null;
    }

    // Clean up empty rooms
    if (!room.players[0] && !room.players[1]) {
      this.rooms.delete(roomCode);
    }

    return { room, wasHost };
  }

  setPlayerReady(playerId: string): GameState | null {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return null;

    const player = room.players.find((p) => p?.id === playerId);
    if (player) {
      player.isReady = !player.isReady;
    }

    return room;
  }

  updateRoom(roomCode: string, updates: Partial<GameState>): GameState | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    Object.assign(room, updates);
    return room;
  }

  canStartGame(room: GameState): boolean {
    return (
      room.phase === GamePhase.LOBBY &&
      room.players[0] !== null &&
      room.players[1] !== null &&
      room.players[0].isReady &&
      room.players[1].isReady
    );
  }
}
