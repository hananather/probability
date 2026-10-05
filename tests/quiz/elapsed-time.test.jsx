import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { QuizResults } from '@/components/quiz/QuizResults';
import { getChapterQuestions } from '@/lib/quiz/questionBank';
import { createPinnedQuizAttempt, validatePinnedQuizAttempt } from '@/lib/progress/quizContract';

vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
function results(timeSpent) {
  return render(<QuizResults score={1} totalQuestions={18} timeSpent={timeSpent} correctAnswers={[0]} incorrectAnswers={[]} unansweredQuestions={Array.from({ length: 17 }, (_, index) => index + 1)} chapterId={3} chapterTitle="Chapter 3" />);
}

it.each([[0, '0:00'], [20, '0:20'], [3599, '59:59'], [3600, '1h 0m 0s'], [86400, '1d 0h 0m 0s'], [115941, '1d 8h 12m 21s']])('formats %s recorded wall seconds while identifying pauses and time away', (seconds, expected) => {
  const { container } = results(seconds);
  expect(screen.getByText(expected)).toBeInTheDocument();
  expect(screen.getByText('Time since start')).toBeInTheDocument();
  expect(screen.getByText('Includes pauses and time away')).toBeInTheDocument();
  const time = container.querySelector('time');
  expect(time).toHaveAttribute('datetime', `PT${seconds}S`);
  expect(time.getAttribute('aria-label')).toMatch(/since start, including pauses and time away/);
});

it.each([undefined, NaN, -1])('does not invent a duration when it is unrecorded or invalid: %s', seconds => {
  const { container } = results(seconds);
  expect(screen.getByText('Not recorded')).toBeInTheDocument();
  expect(container.querySelector('time')).toBeNull();
});

it('keeps the original long-paused full-bank grade and its immutable wall seconds unchanged', () => {
  const data = getChapterQuestions(3, 'engineering');
  const startTime = Date.parse('2026-10-03T20:00:00Z');
  const bank = { revision: data.bankRevision, requestedVersion: data.requestedVersion, effectiveVersion: data.effectiveVersion, questions: JSON.parse(JSON.stringify(data.questions)) };
  const session = { sessionId: 'long-paused-original', chapterId: 'chapter-3', bank, currentQuestionId: bank.questions[0].id, flaggedQuestionIds: [], answersByQuestionId: { [bank.questions[0].id]: { answer: bank.questions[0].correct, timestamp: startTime + 1000 } }, startTime, deadline: startTime + 1800000, isPaused: true, pausedRemaining: 1800 };
  const attempt = createPinnedQuizAttempt(session, { attemptId: 'long-paused-attempt', date: '2026-10-05T04:12:21Z' });
  const original = JSON.stringify(attempt); results(attempt.timeSpent);
  expect(attempt).toMatchObject({ timeSpent: 115941, score: 1, percentage: 6, totalQuestions: 18 });
  expect(validatePinnedQuizAttempt(attempt).valid).toBe(true); expect(JSON.stringify(attempt)).toBe(original);
  expect(screen.getByText('1d 8h 12m 21s')).toHaveAttribute('aria-label', '1 day, 8 hours, 12 minutes, 21 seconds since start, including pauses and time away');
});
