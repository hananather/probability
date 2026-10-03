import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOverallProgress, quizStorage } from '@/lib/quiz/quizStorage';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence } from '../progress/store/helpers';

let store;
beforeEach(() => {
  store = createProgressStore(environment(memoryPersistence(), { legacyStorage: window.localStorage, now: () => new Date().toISOString() }));
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
});
afterEach(() => store.dispose());

describe('quiz pass summaries', () => {
  it.each([[49, false], [50, true], [69, true], [70, true]])('agrees on the chapter threshold at %s%%', async (percentage, passed) => {
    await quizStorage.saveAttempt(1, { percentage, timeSpent: 10, totalQuestions: 20, answers: {} });
    expect(quizStorage.isChapterPassed(1)).toBe(passed);
    expect(quizStorage.getChapterStats(1).passed).toBe(passed);
    expect(getOverallProgress().passedChapters).toBe(passed ? 1 : 0);
    expect(quizStorage.getAttempts(1)[0].legacy).toBe(true);
  });

  it('retains a best score after the corresponding attempt ages out of history', async () => {
    localStorage.setItem('quiz_best_scores', JSON.stringify({ 1: 90 }));
    localStorage.setItem('quiz_attempts', JSON.stringify({ 1: [{ percentage: 20, timeSpent: 12, date: '2026-10-03' }] }));
    await quizStorage.hydrate();
    expect(quizStorage.getChapterStats(1)).toMatchObject({ bestScore: 90, averageScore: 20, totalAttempts: 1, passed: true });
  });

  it('uses an aggregate without inventing attempts and retains unknown input only in its raw archive', async () => {
    const raw = JSON.stringify({ 1: 50, 8: 100, 99: 100, 2: '100', 3: -2, 4: 101 });
    localStorage.setItem('quiz_best_scores', raw);
    await quizStorage.hydrate();
    expect(quizStorage.getChapterStats(1)).toMatchObject({ bestScore: 50, totalAttempts: 0, passed: true });
    expect(getOverallProgress()).toMatchObject({ completedChapters: 1, attemptedChapters: 1, passedChapters: 1, totalChapters: 7 });
    expect(getOverallProgress().chapterScores[99]).toBeUndefined();
    expect(store.getSnapshot().data.migration.sources.quiz_best_scores.raw).toBe(raw);
    expect(quizStorage.isChapterPassed(99)).toBe(false);
  });

  it('recovers summaries from retained attempts when the separate best-score record is missing', async () => {
    localStorage.setItem('quiz_attempts', JSON.stringify({ 1: [{ percentage: 60, timeSpent: 2 }, { percentage: 'bad', timeSpent: null }] }));
    await quizStorage.hydrate();
    expect(quizStorage.getChapterStats(1)).toMatchObject({ bestScore: 60, averageScore: 60, averageTime: 2, passed: true });
    expect(getOverallProgress().passedChapters).toBe(1);
  });
});
