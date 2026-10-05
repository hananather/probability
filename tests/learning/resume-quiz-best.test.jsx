import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { quizStorage } from '@/lib/quiz/quizStorage';
import progressService from '@/services/progressService';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence } from '../progress/store/helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/lib/quiz/questionBank', () => ({
  isQuizVersion: value => ['engineering', 'biostats', 'social'].includes(value),
  getChapterQuestions: (chapter, version = 'engineering') => ({
    bankRevision: 'test-bank-1', requestedVersion: version, effectiveVersion: 'engineering',
    title: 'Test chapter', timeLimit: 1, passingScore: 50,
    questions: [
      { id: 'one', type: 'multiple-choice', topic: 'Basics', question: 'Choose A', options: ['A', 'B'], correct: 0, explanation: 'A is correct.' },
      { id: 'two', type: 'multiple-choice', topic: 'Events', question: 'Choose C', options: ['C', 'D'], correct: 0, explanation: 'C is correct.' }
    ]
  })
}));

let store;
beforeEach(() => {
  store = createProgressStore(environment(memoryPersistence(), { legacyStorage: window.localStorage, now: () => new Date().toISOString() }));
  vi.spyOn(progressService, 'getStore').mockReturnValue(store);
});
afterEach(() => { store.dispose(); vi.useRealTimers(); });
const flush = () => act(async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); });
const click = async button => { await act(async () => { fireEvent.click(button); }); await flush(); };

async function savePriorAttempt(percentage) {
  await quizStorage.saveAttempt(1, { score: percentage / 50, percentage, timeSpent: 10, totalQuestions: 2, correctAnswers: percentage / 50, answers: {}, version: 'engineering' });
}

async function saveCompleteSession(overrides = {}) {
  await store.hydrate();
  const { getChapterQuestions } = await import('@/lib/quiz/questionBank');
  const data = getChapterQuestions(1);
  const startTime = overrides.startTime ?? Date.now();
  await store.beginQuizSession(1, { sessionId: 'seed-session', chapterId: 'chapter-1',
    bank: { revision: data.bankRevision, requestedVersion: 'engineering', effectiveVersion: 'engineering', questions: data.questions },
    currentQuestionId: 'two', answersByQuestionId: { one: { answer: 0, timestamp: startTime }, two: { answer: 0, timestamp: startTime } },
    flaggedQuestionIds: [], startTime, deadline: overrides.deadline ?? startTime + 60000,
    isPaused: overrides.isPaused || false, pausedRemaining: overrides.pausedRemaining ?? null,
  }, { context: store.captureWriteContext('chapter-1:quiz') });
}

describe('quiz history before the current attempt', async () => {
  it.each([0, 50])('keeps the prior best of %s%% when a better attempt is saved', async previousBest => {
    await savePriorAttempt(previousBest);
    await saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText(`Previous Best: ${previousBest}%`)).toBeInTheDocument();
    expect(screen.getByText(`+${100 - previousBest}% improvement!`)).toBeInTheDocument();
    expect(quizStorage.getChapterStats(1).bestScore).toBe(100);
  });

  it('shows an attempted zero score in the introduction', async () => {
    await savePriorAttempt(0);
    render(<ChapterQuiz chapterId={1} />); await flush();
    expect(screen.getByText('Your Best').parentElement).toHaveTextContent('0%');
    expect(screen.queryByText('Not attempted')).not.toBeInTheDocument();
  });

  it('does not present the first attempt itself as a previous best', async () => {
    await saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.queryByText(/Previous Best:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Same as best')).not.toBeInTheDocument();
  });

  it('captures the newly saved best before a retake', async () => {
    await savePriorAttempt(50);
    await saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Previous Best: 50%')).toBeInTheDocument();
    await click(screen.getByRole('button', { name: 'Retake Quiz' }));
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    await click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Previous Best: 100%')).toBeInTheDocument();
    expect(quizStorage.getAttempts(1)).toHaveLength(3);
  });

  it('labels paused session wall time as elapsed time and preserves the stored duration', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    await saveCompleteSession({ startTime: Date.now() - 20000, isPaused: true, pausedRemaining: 50, deadline: Date.now() + 50000 });
    render(<ChapterQuiz chapterId={1} />); await flush();
    await click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Time since start').parentElement).toHaveTextContent('0:20');
    expect(quizStorage.getAttempts(1)[0].timeSpent).toBe(20);
  });
});
