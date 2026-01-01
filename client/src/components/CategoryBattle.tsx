import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useGameSocket } from '../hooks/useGameSocket';
import Timer from './Timer';
import { GAME_CONSTANTS } from '@category-clash/shared';

export default function CategoryBattle() {
  const { state } = useGame();
  const { submitCategoryItem, passTurn } = useGameSocket();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryState = state.gameState?.categoryState;
  const isMyTurn = categoryState?.currentTurnPlayerId === state.playerId;
  const usedItems = categoryState?.usedItems || [];

  // Focus input when it's our turn
  useEffect(() => {
    if (isMyTurn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMyTurn, categoryState?.currentTurnPlayerId]);

  // Clear input when turn changes
  useEffect(() => {
    setInputValue('');
  }, [categoryState?.currentTurnPlayerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || !inputValue.trim()) return;
    submitCategoryItem(inputValue.trim());
    setInputValue('');
  };

  const handlePass = () => {
    if (!isMyTurn) return;
    passTurn();
  };

  if (!categoryState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading category...</div>
      </div>
    );
  }

  const currentPlayerName = state.gameState?.players.find(
    (p) => p?.id === categoryState.currentTurnPlayerId
  )?.name;

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto w-full">
      <Timer
        timeRemaining={categoryState.timeRemaining}
        maxTime={GAME_CONSTANTS.CATEGORY_TURN_TIME}
      />

      <div className="mt-6 text-2xl font-bold text-primary text-center">
        {categoryState.category}
      </div>

      <p
        className={`mt-2 text-lg ${
          isMyTurn ? 'text-success font-semibold' : 'text-gray-400'
        }`}
      >
        {isMyTurn ? "Your turn!" : `${currentPlayerName}'s turn...`}
      </p>

      {/* Used items list */}
      <div className="w-full mt-6 max-h-48 overflow-y-auto rounded-lg bg-dark/50 p-2">
        {usedItems.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No items yet - be first!
          </p>
        ) : (
          <AnimatePresence>
            {usedItems.map((item, index) => {
              const playerName = state.gameState?.players.find(
                (p) => p?.id === item.playerId
              )?.name;
              const isMe = item.playerId === state.playerId;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`py-2 px-4 mb-2 rounded-lg flex justify-between items-center ${
                    item.isValid
                      ? 'bg-success/20 border border-success/30'
                      : 'bg-danger/20 border border-danger/30'
                  }`}
                >
                  <span
                    className={
                      item.isValid
                        ? 'text-success'
                        : 'text-danger line-through'
                    }
                  >
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {playerName}
                    {isMe && ' (you)'}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full mt-6">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isMyTurn ? 'Type your answer...' : 'Wait for your turn...'
          }
          disabled={!isMyTurn}
          className="w-full px-4 py-4 bg-dark border-2 border-gray-700 rounded-lg text-white text-lg placeholder-gray-500 focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
          autoCapitalize="off"
        />

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={!isMyTurn || !inputValue.trim()}
            className="flex-1 py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handlePass}
            disabled={!isMyTurn}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            Pass
          </button>
        </div>
      </form>

      {categoryState.consecutiveFails > 0 && (
        <p className="mt-4 text-yellow-500 text-sm">
          Warning: {categoryState.consecutiveFails} fail
          {categoryState.consecutiveFails > 1 ? 's' : ''} in a row. One more
          ends the round!
        </p>
      )}
    </div>
  );
}
