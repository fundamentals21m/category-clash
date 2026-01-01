import {
  GameState,
  GamePhase,
  TriviaRoundState,
  CategoryBattleState,
  GAME_CONSTANTS
} from '@category-clash/shared';
import { TriviaService } from '../services/TriviaService';
import { CategoryService } from '../services/CategoryService';

export class GameStateMachine {
  private triviaService: TriviaService;
  private categoryService: CategoryService;

  constructor() {
    this.triviaService = new TriviaService();
    this.categoryService = new CategoryService();
  }

  async startGame(gameState: GameState): Promise<GameState> {
    gameState.phase = GamePhase.TRIVIA;
    gameState.currentRound = 1;
    gameState.score = 0;
    return await this.startTriviaRound(gameState);
  }

  async startTriviaRound(gameState: GameState): Promise<GameState> {
    const question = await this.triviaService.fetchQuestion();

    gameState.phase = GamePhase.TRIVIA;
    gameState.triviaState = {
      question,
      timeRemaining: GAME_CONSTANTS.TRIVIA_TIME_LIMIT,
      player1Answer: null,
      player2Answer: null,
      revealedAnswer: null
    };
    gameState.categoryState = null;
    gameState.roundStartTime = Date.now();

    return gameState;
  }

  startCategoryBattle(gameState: GameState): GameState {
    const category = this.categoryService.getRandomCategory();
    // Alternate who goes first based on round number
    const firstPlayer =
      gameState.currentRound % 2 === 1
        ? gameState.players[0]!.id
        : gameState.players[1]!.id;

    gameState.phase = GamePhase.CATEGORY_BATTLE;
    gameState.triviaState = null;
    gameState.categoryState = {
      category,
      currentTurnPlayerId: firstPlayer,
      timeRemaining: GAME_CONSTANTS.CATEGORY_TURN_TIME,
      usedItems: [],
      consecutiveFails: 0
    };
    gameState.turnStartTime = Date.now();

    return gameState;
  }

  processTriviaAnswer(
    gameState: GameState,
    playerId: string,
    answer: string
  ): { gameState: GameState; bothAnswered: boolean } {
    const state = gameState.triviaState!;

    if (gameState.players[0]?.id === playerId) {
      state.player1Answer = answer;
    } else {
      state.player2Answer = answer;
    }

    const bothAnswered =
      state.player1Answer !== null && state.player2Answer !== null;
    return { gameState, bothAnswered };
  }

  resolveTriviaRound(gameState: GameState): {
    winnerId: string | null;
    pointChange: number;
    correctAnswer: string;
  } {
    const state = gameState.triviaState!;
    const correctAnswer = state.question.correctAnswer;
    state.revealedAnswer = correctAnswer;

    const p1Correct = state.player1Answer === correctAnswer;
    const p2Correct = state.player2Answer === correctAnswer;

    let winnerId: string | null = null;
    let pointChange = 0;

    if (p1Correct && !p2Correct) {
      winnerId = gameState.players[0]!.id;
      pointChange = GAME_CONSTANTS.TRIVIA_CORRECT_POINTS;
    } else if (!p1Correct && p2Correct) {
      winnerId = gameState.players[1]!.id;
      pointChange = -GAME_CONSTANTS.TRIVIA_CORRECT_POINTS;
    }
    // Both correct or both wrong = no change

    gameState.score = Math.max(
      -GAME_CONSTANTS.WIN_THRESHOLD,
      Math.min(GAME_CONSTANTS.WIN_THRESHOLD, gameState.score + pointChange)
    );
    gameState.lastRoundWinner = winnerId;
    gameState.lastRoundPointChange = Math.abs(pointChange);

    return { winnerId, pointChange, correctAnswer };
  }

  processCategoryItem(
    gameState: GameState,
    playerId: string,
    item: string
  ): {
    isValid: boolean;
    pointChange: number;
    roundEnded: boolean;
    winnerId?: string;
    reason?: string;
  } {
    const state = gameState.categoryState!;

    // Validate it's the correct player's turn
    if (state.currentTurnPlayerId !== playerId) {
      return { isValid: false, pointChange: 0, roundEnded: false };
    }

    // Handle pass/skip
    const isPass = item === '__PASS__' || item.trim() === '';

    // Check if item is valid (not already used, matches category)
    const isValid =
      !isPass &&
      this.categoryService.validateItem(
        state.category,
        item,
        state.usedItems.map((i) => i.value)
      );

    // Record the item
    state.usedItems.push({
      value: isPass ? '[PASS]' : item,
      playerId,
      timestamp: Date.now(),
      isValid
    });

    let pointChange = 0;
    let roundEnded = false;
    let winnerId: string | undefined;
    let reason: string | undefined;

    if (isValid) {
      // Valid answer - award points and switch turn
      const isHost = gameState.players[0]?.id === playerId;
      pointChange = isHost
        ? GAME_CONSTANTS.CATEGORY_ITEM_POINTS
        : -GAME_CONSTANTS.CATEGORY_ITEM_POINTS;
      gameState.score = Math.max(
        -GAME_CONSTANTS.WIN_THRESHOLD,
        Math.min(GAME_CONSTANTS.WIN_THRESHOLD, gameState.score + pointChange)
      );

      state.consecutiveFails = 0;
      state.currentTurnPlayerId = isHost
        ? gameState.players[1]!.id
        : gameState.players[0]!.id;
      state.timeRemaining = GAME_CONSTANTS.CATEGORY_TURN_TIME;
      gameState.turnStartTime = Date.now();
    } else {
      state.consecutiveFails++;

      // Two consecutive fails ends the round (other player wins)
      if (state.consecutiveFails >= 2) {
        roundEnded = true;
        winnerId =
          state.currentTurnPlayerId === gameState.players[0]?.id
            ? gameState.players[1]!.id
            : gameState.players[0]!.id;
        reason = isPass ? 'pass' : 'invalid';
      } else {
        // Switch turn after invalid answer
        state.currentTurnPlayerId =
          playerId === gameState.players[0]?.id
            ? gameState.players[1]!.id
            : gameState.players[0]!.id;
        state.timeRemaining = GAME_CONSTANTS.CATEGORY_TURN_TIME;
        gameState.turnStartTime = Date.now();
      }
    }

    return { isValid, pointChange, roundEnded, winnerId, reason };
  }

  handleCategoryTimeout(gameState: GameState): {
    roundEnded: boolean;
    winnerId?: string;
  } {
    const state = gameState.categoryState!;
    state.consecutiveFails++;

    state.usedItems.push({
      value: '[TIMEOUT]',
      playerId: state.currentTurnPlayerId,
      timestamp: Date.now(),
      isValid: false
    });

    if (state.consecutiveFails >= 2) {
      const winnerId =
        state.currentTurnPlayerId === gameState.players[0]?.id
          ? gameState.players[1]!.id
          : gameState.players[0]!.id;
      return { roundEnded: true, winnerId };
    }

    // Switch turn
    state.currentTurnPlayerId =
      state.currentTurnPlayerId === gameState.players[0]?.id
        ? gameState.players[1]!.id
        : gameState.players[0]!.id;
    state.timeRemaining = GAME_CONSTANTS.CATEGORY_TURN_TIME;
    gameState.turnStartTime = Date.now();

    return { roundEnded: false };
  }

  checkGameOver(gameState: GameState): {
    isOver: boolean;
    winnerId?: string;
    reason?: 'threshold' | 'rounds';
  } {
    if (gameState.score >= GAME_CONSTANTS.WIN_THRESHOLD) {
      return {
        isOver: true,
        winnerId: gameState.players[0]!.id,
        reason: 'threshold'
      };
    }
    if (gameState.score <= -GAME_CONSTANTS.WIN_THRESHOLD) {
      return {
        isOver: true,
        winnerId: gameState.players[1]!.id,
        reason: 'threshold'
      };
    }
    if (gameState.currentRound >= gameState.maxRounds) {
      const winnerId =
        gameState.score >= 0
          ? gameState.players[0]!.id
          : gameState.players[1]!.id;
      return { isOver: true, winnerId, reason: 'rounds' };
    }
    return { isOver: false };
  }

  advanceToNextRound(gameState: GameState): GameState {
    gameState.currentRound++;
    gameState.triviaState = null;
    gameState.categoryState = null;
    return gameState;
  }
}
