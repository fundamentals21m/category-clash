import { randomUUID } from 'crypto';
import type { TriviaQuestion, OpenTDBResponse } from '@category-clash/shared';

export class TriviaService {
  private baseUrl = 'https://opentdb.com/api.php';
  private lastFetchTime = 0;
  private minFetchInterval = 5000; // 5 seconds per API rate limit

  // Open Trivia DB category IDs
  private categories = [
    { id: 9, name: 'General Knowledge' },
    { id: 10, name: 'Books' },
    { id: 11, name: 'Film' },
    { id: 12, name: 'Music' },
    { id: 14, name: 'Television' },
    { id: 15, name: 'Video Games' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Computers' },
    { id: 19, name: 'Mathematics' },
    { id: 20, name: 'Mythology' },
    { id: 21, name: 'Sports' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
    { id: 25, name: 'Art' },
    { id: 26, name: 'Celebrities' },
    { id: 27, name: 'Animals' },
    { id: 28, name: 'Vehicles' },
    { id: 31, name: 'Anime & Manga' },
    { id: 32, name: 'Cartoons' }
  ];

  private getRandomCategory(): { id: number; name: string } {
    return this.categories[Math.floor(Math.random() * this.categories.length)];
  }

  async fetchQuestion(): Promise<TriviaQuestion> {
    // Respect rate limiting
    const now = Date.now();
    const timeSinceLastFetch = now - this.lastFetchTime;
    if (timeSinceLastFetch < this.minFetchInterval) {
      await this.delay(this.minFetchInterval - timeSinceLastFetch);
    }

    try {
      const category = this.getRandomCategory();
      const url = new URL(this.baseUrl);
      url.searchParams.set('amount', '1');
      url.searchParams.set('category', category.id.toString());
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
        category: 'Science & Nature',
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
      },
      {
        id: randomUUID(),
        category: 'Film',
        difficulty: 'medium',
        question: 'Who directed the movie "Jaws"?',
        correctAnswer: 'Steven Spielberg',
        incorrectAnswers: ['James Cameron', 'Martin Scorsese', 'Ridley Scott'],
        allAnswers: ['Steven Spielberg', 'James Cameron', 'Martin Scorsese', 'Ridley Scott']
      },
      {
        id: randomUUID(),
        category: 'Music',
        difficulty: 'easy',
        question: 'Which band performed "Bohemian Rhapsody"?',
        correctAnswer: 'Queen',
        incorrectAnswers: ['The Beatles', 'Led Zeppelin', 'Pink Floyd'],
        allAnswers: ['Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd']
      },
      {
        id: randomUUID(),
        category: 'Video Games',
        difficulty: 'easy',
        question: 'What is the best-selling video game of all time?',
        correctAnswer: 'Minecraft',
        incorrectAnswers: ['Tetris', 'GTA V', 'Wii Sports'],
        allAnswers: ['Minecraft', 'Tetris', 'GTA V', 'Wii Sports']
      },
      {
        id: randomUUID(),
        category: 'Sports',
        difficulty: 'medium',
        question: 'How many players are on a soccer team on the field?',
        correctAnswer: '11',
        incorrectAnswers: ['9', '10', '12'],
        allAnswers: ['9', '10', '11', '12']
      },
      {
        id: randomUUID(),
        category: 'Animals',
        difficulty: 'easy',
        question: 'What is the fastest land animal?',
        correctAnswer: 'Cheetah',
        incorrectAnswers: ['Lion', 'Gazelle', 'Horse'],
        allAnswers: ['Cheetah', 'Lion', 'Gazelle', 'Horse']
      },
      {
        id: randomUUID(),
        category: 'Computers',
        difficulty: 'medium',
        question: 'What does "HTTP" stand for?',
        correctAnswer: 'HyperText Transfer Protocol',
        incorrectAnswers: ['High Tech Transfer Protocol', 'HyperText Transit Program', 'High Transfer Text Protocol'],
        allAnswers: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'HyperText Transit Program', 'High Transfer Text Protocol']
      },
      {
        id: randomUUID(),
        category: 'Mythology',
        difficulty: 'medium',
        question: 'In Greek mythology, who is the king of the gods?',
        correctAnswer: 'Zeus',
        incorrectAnswers: ['Poseidon', 'Hades', 'Apollo'],
        allAnswers: ['Zeus', 'Poseidon', 'Hades', 'Apollo']
      },
      {
        id: randomUUID(),
        category: 'Television',
        difficulty: 'easy',
        question: 'What is the longest-running animated TV show in the US?',
        correctAnswer: 'The Simpsons',
        incorrectAnswers: ['Family Guy', 'South Park', 'SpongeBob SquarePants'],
        allAnswers: ['The Simpsons', 'Family Guy', 'South Park', 'SpongeBob SquarePants']
      }
    ];

    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
