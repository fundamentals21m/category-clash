import { randomUUID } from 'crypto';
import type { TriviaQuestion, OpenTDBResponse } from '@category-clash/shared';

export class TriviaService {
  private baseUrl = 'https://opentdb.com/api.php';
  private lastFetchTime = 0;
  private minFetchInterval = 5000; // 5 seconds per API rate limit

  async fetchQuestion(): Promise<TriviaQuestion> {
    // Respect rate limiting
    const now = Date.now();
    const timeSinceLastFetch = now - this.lastFetchTime;
    if (timeSinceLastFetch < this.minFetchInterval) {
      await this.delay(this.minFetchInterval - timeSinceLastFetch);
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('amount', '1');
      url.searchParams.set('type', 'multiple');
      url.searchParams.set('encode', 'url3986');

      const response = await fetch(url.toString());
      const data: OpenTDBResponse = await response.json();
      this.lastFetchTime = Date.now();

      if (data.response_code !== 0 || !data.results.length) {
        console.warn('Failed to fetch trivia, using fallback');
        return this.getFallbackQuestion();
      }

      const raw = data.results[0];
      const question: TriviaQuestion = {
        id: randomUUID(),
        category: decodeURIComponent(raw.category),
        difficulty: raw.difficulty as 'easy' | 'medium' | 'hard',
        question: decodeURIComponent(raw.question),
        correctAnswer: decodeURIComponent(raw.correct_answer),
        incorrectAnswers: raw.incorrect_answers.map((a) => decodeURIComponent(a)),
        allAnswers: this.shuffleAnswers([
          decodeURIComponent(raw.correct_answer),
          ...raw.incorrect_answers.map((a) => decodeURIComponent(a))
        ])
      };

      return question;
    } catch (error) {
      console.error('Trivia fetch error:', error);
      return this.getFallbackQuestion();
    }
  }

  private shuffleAnswers(answers: string[]): string[] {
    const shuffled = [...answers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getFallbackQuestion(): TriviaQuestion {
    const fallbackQuestions: TriviaQuestion[] = [
      {
        id: randomUUID(),
        category: 'General Knowledge',
        difficulty: 'medium',
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        incorrectAnswers: ['London', 'Berlin', 'Madrid'],
        allAnswers: ['London', 'Paris', 'Berlin', 'Madrid']
      },
      {
        id: randomUUID(),
        category: 'Science',
        difficulty: 'easy',
        question: 'What planet is known as the Red Planet?',
        correctAnswer: 'Mars',
        incorrectAnswers: ['Venus', 'Jupiter', 'Saturn'],
        allAnswers: ['Venus', 'Mars', 'Jupiter', 'Saturn']
      },
      {
        id: randomUUID(),
        category: 'History',
        difficulty: 'medium',
        question: 'In which year did World War II end?',
        correctAnswer: '1945',
        incorrectAnswers: ['1944', '1946', '1943'],
        allAnswers: ['1944', '1945', '1946', '1943']
      },
      {
        id: randomUUID(),
        category: 'Geography',
        difficulty: 'easy',
        question: 'Which ocean is the largest?',
        correctAnswer: 'Pacific Ocean',
        incorrectAnswers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
        allAnswers: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean']
      }
    ];

    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
