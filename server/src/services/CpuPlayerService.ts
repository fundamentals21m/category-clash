import { CpuDifficulty } from '@category-clash/shared';
import { CategoryService } from './CategoryService.js';

interface DifficultySettings {
  triviaAccuracy: number;
  minResponseDelay: number;
  maxResponseDelay: number;
  categoryMistakeChance: number;
}

const DIFFICULTY_SETTINGS: Record<CpuDifficulty, DifficultySettings> = {
  [CpuDifficulty.EASY]: {
    triviaAccuracy: 0.35,
    minResponseDelay: 3000,
    maxResponseDelay: 6000,
    categoryMistakeChance: 0.25
  },
  [CpuDifficulty.MEDIUM]: {
    triviaAccuracy: 0.60,
    minResponseDelay: 1500,
    maxResponseDelay: 4000,
    categoryMistakeChance: 0.10
  },
  [CpuDifficulty.HARD]: {
    triviaAccuracy: 0.85,
    minResponseDelay: 500,
    maxResponseDelay: 2000,
    categoryMistakeChance: 0.02
  }
};

export class CpuPlayerService {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  private getSettings(difficulty: CpuDifficulty): DifficultySettings {
    return DIFFICULTY_SETTINGS[difficulty];
  }

  getCpuTriviaAnswer(
    correctAnswer: string,
    allAnswers: string[],
    difficulty: CpuDifficulty
  ): string {
    const settings = this.getSettings(difficulty);
    const isCorrect = Math.random() < settings.triviaAccuracy;

    if (isCorrect) {
      return correctAnswer;
    }

    // Pick a random wrong answer
    const wrongAnswers = allAnswers.filter(a => a !== correctAnswer);
    return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  }

  getCpuCategoryItem(
    category: string,
    usedItems: string[],
    difficulty: CpuDifficulty
  ): string | null {
    const settings = this.getSettings(difficulty);
    const validItems = this.categoryService.getValidItemsForCategory(category);
    if (!validItems) return null;

    // Filter out already used items (normalized)
    const normalizedUsed = usedItems.map(item => item.toLowerCase().trim());
    const availableItems = validItems.filter(
      item => !normalizedUsed.includes(item.toLowerCase().trim())
    );

    if (availableItems.length === 0) {
      return null; // CPU passes
    }

    // Chance to make a mistake (pass when items are available)
    if (Math.random() < settings.categoryMistakeChance) {
      return null;
    }

    // Pick a random available item
    return availableItems[Math.floor(Math.random() * availableItems.length)];
  }

  getResponseDelay(difficulty: CpuDifficulty): number {
    const settings = this.getSettings(difficulty);
    const range = settings.maxResponseDelay - settings.minResponseDelay;
    return settings.minResponseDelay + Math.random() * range;
  }
}
