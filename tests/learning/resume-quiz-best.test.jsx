import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { quizStorage } from '@/lib/quiz/quizStorage';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/lib/quiz/questionBank', () => ({
  getChapterQuestions: () => ({
    title: 'Test chapter', timeLimit: 1, passingScore: 50,
    questions: [
      { id: 'one', type: 'multiple-choice', topic: 'Basics', question: 'Choose A', options: ['A', 'B'], correct: 0, explanation: 'A is correct.' },
      { id: 'two', type: 'multiple-choice', topic: 'Events', question: 'Choose C', options: ['C', 'D'], correct: 0, explanation: 'C is correct.' }
    ]
  })
}));

afterEach(() => vi.useRealTimers());

function savePriorAttempt(percentage) {
  quizStorage.saveAttempt(1, { score: percentage / 50, percentage, timeSpent: 10, totalQuestions: 2, correctAnswers: percentage / 50, answers: {}, version: 'engineering' });
}

function saveCompleteSession(overrides = {}) {
  localStorage.setItem('quiz_current_session', JSON.stringify({ chapterId: 1, version: 'engineering', currentQuestion: 1,
    answers: { 0: { answer: 0, isCorrect: true }, 1: { answer: 0, isCorrect: true } }, startTime: Date.now(), ...overrides }));
}

describe('quiz history before the current attempt', () => {
  it.each([0, 50])('keeps the prior best of %s%% when a better attempt is saved', previousBest => {
    savePriorAttempt(previousBest);
    saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText(`Previous Best: ${previousBest}%`)).toBeInTheDocument();
    expect(screen.getByText(`+${100 - previousBest}% improvement!`)).toBeInTheDocument();
    expect(quizStorage.getChapterStats(1).bestScore).toBe(100);
  });

  it('shows an attempted zero score in the introduction', () => {
    savePriorAttempt(0);
    render(<ChapterQuiz chapterId={1} />);
    expect(screen.getByText('Your Best').parentElement).toHaveTextContent('0%');
    expect(screen.queryByText('Not attempted')).not.toBeInTheDocument();
  });

  it('does not present the first attempt itself as a previous best', () => {
    saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.queryByText(/Previous Best:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Same as best')).not.toBeInTheDocument();
  });

  it('captures the newly saved best before a retake', () => {
    savePriorAttempt(50);
    saveCompleteSession();
    render(<ChapterQuiz chapterId={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Previous Best: 50%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retake Quiz' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish and review' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Previous Best: 100%')).toBeInTheDocument();
    expect(quizStorage.getAttempts(1)).toHaveLength(3);
  });

  it('labels paused session wall time as elapsed time and preserves the stored duration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    saveCompleteSession({ startTime: Date.now() - 20000, isPaused: true, pausedRemaining: 50, deadline: Date.now() + 50000 });
    render(<ChapterQuiz chapterId={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Finish and review' }));
    expect(screen.getByText('Elapsed time').parentElement).toHaveTextContent('0:20');
    expect(quizStorage.getAttempts(1)[0].timeSpent).toBe(20);
  });
});
