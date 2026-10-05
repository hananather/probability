import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { AccountProgressPanel } from '@/components/progress/AccountProgressPanel';
import { useActiveProgress } from '@/contexts/ActiveProgressContext';
import { MotionPreferenceContext } from '@/hooks/useReducedMotion';
import { getChapterQuestions } from '@/lib/quiz/questionBank';
import { A, activeFixture } from './helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(fixture => fixture.dispose()));
const click = element => act(async () => { fireEvent.click(element); });
function Status() { return <AccountProgressPanel active={useActiveProgress()} />; }

it('finishes the real 18-question Chapter 4 quiz and shows cloud acknowledgement only after its original 1/18 grade has been accepted', async () => {
  const f = activeFixture(); fixtures.push(f); f.setAccount(A);
  render(<MotionPreferenceContext.Provider value={true}><ActiveProgressProvider controller={f.controller}><ChapterQuiz chapterId={4} /><Status /></ActiveProgressProvider></MotionPreferenceContext.Provider>);
  await screen.findByText('Account progress synchronized');
  await click(screen.getByRole('button', { name: 'Start Quiz' }));
  const original = getChapterQuestions(4);
  expect(original.questions).toHaveLength(18);
  await waitFor(() => expect(screen.getByRole('button', { name: '20', exact: true })).toBeEnabled());
  await click(screen.getByRole('button', { name: '20', exact: true }));
  await click(screen.getByRole('button', { name: /Submit/i }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finish and review' })).toBeEnabled());
  const hold = f.holdRemote(A);
  await click(screen.getByRole('button', { name: 'Finish and review' }));
  await click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' }));
  await screen.findByRole('heading', { name: /Quiz Complete/ });
  await hold.entered.promise;
  expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
  expect(f.accounts.get(A).getSnapshot().cloud.blockedMutations).toBe(0);
  const saved = await f.databases.get(A).read(`account:${A}`);
  const [attempt] = Object.values(saved.data.quizAttempts);
  expect(attempt).toMatchObject({ chapterId: 'chapter-4', totalQuestions: 18, correctAnswers: 1, score: 1, percentage: 6 });
  expect(attempt.bank.questions.map(question => question.question)).toEqual(original.questions.map(question => question.question));
  expect(saved.cloud.outbox).toHaveLength(1);
  await act(async () => { hold.gate.resolve(); });
  await screen.findByText('Account progress synchronized');
  const [remote] = Object.values(f.remote.get(A).document.facts.quizAttempts);
  expect(remote).toEqual(attempt);
  expect((await f.databases.get(A).read(`account:${A}`)).cloud.outbox).toEqual([]);
  expect(f.guest.getSnapshot().data.quizAttempts).toEqual({});
});
