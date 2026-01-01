import { motion } from 'framer-motion';

interface TimerProps {
  timeRemaining: number;
  maxTime: number;
}

export default function Timer({ timeRemaining, maxTime }: TimerProps) {
  const percentage = (timeRemaining / maxTime) * 100;
  const isLow = timeRemaining <= 3;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`text-5xl font-bold tabular-nums ${
          isLow ? 'text-danger' : 'text-white'
        }`}
        animate={isLow ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {timeRemaining}
      </motion.div>

      <div className="w-32 h-2 bg-dark rounded-full overflow-hidden mt-3">
        <motion.div
          className={`h-full ${isLow ? 'bg-danger' : 'bg-primary'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
