import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function TugOfWarBar() {
  const { state } = useGame();
  const score = state.gameState?.score || 0;

  // Calculate position: -100 = left edge (0%), +100 = right edge (100%)
  const position = ((score + 100) / 200) * 100;

  const hostName = state.gameState?.players[0]?.name || 'Host';
  const guestName = state.gameState?.players[1]?.name || 'Guest';

  // Determine who's winning for colors
  const hostWinning = score > 0;
  const guestWinning = score < 0;

  return (
    <div className="w-full px-4">
      <div className="flex justify-between text-sm mb-2">
        <span
          className={`font-semibold ${
            hostWinning ? 'text-primary' : 'text-gray-400'
          }`}
        >
          {hostName}
        </span>
        <span
          className={`font-semibold ${
            guestWinning ? 'text-secondary' : 'text-gray-400'
          }`}
        >
          {guestName}
        </span>
      </div>

      <div className="relative h-8 bg-gradient-to-r from-primary/30 via-gray-700 to-secondary/30 rounded-full overflow-hidden">
        {/* Win zone indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-secondary" />

        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 z-10 -translate-x-1/2" />

        {/* Score indicator */}
        <motion.div
          className="absolute top-1 bottom-1 w-6 bg-white rounded-full shadow-lg flex items-center justify-center"
          animate={{ left: `calc(${position}% - 12px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="w-2 h-2 rounded-full bg-gray-600" />
        </motion.div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>-100</span>
        <span
          className={`text-lg font-bold ${
            score > 0
              ? 'text-primary'
              : score < 0
              ? 'text-secondary'
              : 'text-white'
          }`}
        >
          {score > 0 ? '+' : ''}
          {score}
        </span>
        <span>+100</span>
      </div>
    </div>
  );
}
