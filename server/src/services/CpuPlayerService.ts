import type { GameState } from '@category-clash/shared';
import { CategoryService } from './CategoryService.js';

export class CpuPlayerService {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  // CPU has 60% chance of getting trivia correct
  getCpuTriviaAnswer(correctAnswer: string, allAnswers: string[]): string {
    const isCorrect = Math.random() < 0.6;
    if (isCorrect) {
      return correctAnswer;
    }
    // Pick a random wrong answer
    const wrongAnswers = allAnswers.filter(a => a !== correctAnswer);
    return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  }

  // Get a valid category item for CPU
  getCpuCategoryItem(category: string, usedItems: string[]): string | null {
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

    // Pick a random available item
    return availableItems[Math.floor(Math.random() * availableItems.length)];
  }

  // Get random delay for CPU response (1.5-4 seconds)
  getResponseDelay(): number {
    return 1500 + Math.random() * 2500;
  }
}
