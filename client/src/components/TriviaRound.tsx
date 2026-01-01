import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useGameSocket } from '../hooks/useGameSocket';
import Timer from './Timer';
import { GAME_CONSTANTS } from '@category-clash/shared';

export default function TriviaRound() {
  const { state } = useGame();
  const { submitTriviaAnswer } = useGameSocket();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const triviaState = state.gameState?.triviaState;
  const question = triviaState?.question;

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setHasSubmitted(false);
  }, [question?.id]);

  const handleSubmit = (answer: string) => {
    if (hasSubmitted) return;
    setSelectedAnswer(answer);
    setHasSubmitted(true);
    submitTriviaAnswer(answer);
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading question...</div>
      </div>
    );
  }

  const showResult = triviaState?.revealedAnswer !== null;
  const correctAnswer = triviaState?.revealedAnswer;

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto w-full">
      <Timer
        timeRemaining={triviaState?.timeRemaining || 0}
        maxTime={GAME_CONSTANTS.TRIVIA_TIME_LIMIT}
      />

      <div className="mt-6 text-sm text-gray-400 uppercase tracking-wider">
        {question.category}
      </div>

      <h2 className="text-xl font-semibold text-center mt-2 mb-6 leading-relaxed">
        {question.question}
      </h2>

      <div className="w-full space-y-3">
        {question.allAnswers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = showResult && answer === correctAnswer;
          const isWrong = showResult && isSelected && answer !== correctAnswer;

          let buttonClass =
            'w-full py-4 px-6 rounded-lg text-left font-medium transition border-2 ';

          if (showResult) {
            if (isCorrect) {
              buttonClass += 'bg-success/20 border-success text-success';
            } else if (isWrong) {
              buttonClass += 'bg-danger/20 border-danger text-danger';
            } else {
              buttonClass += 'bg-dark/50 border-gray-700 text-gray-500';
            }
          } else if (isSelected) {
            buttonClass += 'bg-primary border-primary text-white';
          } else if (hasSubmitted) {
            buttonClass +=
              'bg-dark/50 border-gray-700 text-gray-500 cursor-not-allowed';
          } else {
            buttonClass +=
              'bg-dark border-gray-700 hover:border-primary text-white';
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleSubmit(answer)}
              disabled={hasSubmitted}
              className={buttonClass}
              whileTap={hasSubmitted ? {} : { scale: 0.98 }}
            >
              <span className="mr-3 text-gray-500">
                {String.fromCharCode(65 + index)}.
              </span>
              {answer}
            </motion.button>
          );
        })}
      </div>

      {hasSubmitted && !showResult && (
        <p className="mt-6 text-gray-400 animate-pulse">
          Waiting for opponent...
        </p>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          {selectedAnswer === correctAnswer ? (
            <p className="text-success font-semibold">Correct!</p>
          ) : selectedAnswer ? (
            <p className="text-danger font-semibold">Wrong!</p>
          ) : (
            <p className="text-gray-400">Time's up!</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Category battle starting...
          </p>
        </motion.div>
      )}
    </div>
  );
}
