import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { MotionPreferenceContext } from '@/hooks/useReducedMotion';
import { useProgress } from '@/hooks/useProgress';
import { A, B, ACTIVITY, activeFixture, deferred } from './helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
vi.mock('@/lib/quiz/questionBank', () => ({
  isQuizVersion: version => ['engineering', 'biostats', 'social'].includes(version),
  getChapterQuestions: () => ({ title: 'Identity test chapter', timeLimit: 1, passingScore: 50, bankRevision: 'identity-test-1', requestedVersion: 'engineering', effectiveVersion: 'engineering', questions: [
    { id: 'identity-q1', type: 'multiple-choice', question: 'Choose Alpha', options: ['Alpha', 'Beta'], correct: 0, explanation: 'Alpha is correct.' },
    { id: 'identity-q2', type: 'multiple-choice', question: 'Choose Beta', options: ['Alpha', 'Beta'], correct: 1, explanation: 'Beta is correct.' },
  ] }),
}));
const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(fixture => fixture.dispose()));
function Summary() {
  const progress = useProgress();
  return <output aria-label="Active owner">{progress.learningData.ownerScope}; {Object.keys(progress.learningData.quizAttempts).length} attempts</output>;
}
async function setup(children = <><ChapterQuiz /><Summary /></>) {
  const fixture = activeFixture(); fixtures.push(fixture); fixture.setAccount(A);
  const view = render(<MotionPreferenceContext.Provider value={true}><ActiveProgressProvider controller={fixture.controller}>{children}</ActiveProgressProvider></MotionPreferenceContext.Provider>);
  await waitFor(() => expect(screen.getByLabelText('Active owner')).toHaveTextContent(`account:${A}`));
  return { ...fixture, view };
}
const click = async element => act(async () => { fireEvent.click(element); });
async function switchToB(fixture) {
  fixture.setAccount(B);
  await act(async () => { await fixture.controller.reconcile(); });
  await waitFor(() => expect(screen.getByLabelText('Active owner')).toHaveTextContent(`account:${B}`));
}

it('keeps a held actual IndexedDB quiz-start transaction in A and never renders its settled session in B', async () => {
  const f = await setup(); const held = f.holdWrite(A);
  await click(screen.getByRole('button', { name: 'Start Quiz' })); await held.entered.promise;
  await switchToB(f);
  expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
  const requestsBeforeRelease = f.requests.length;
  await act(async () => { held.gate.resolve(); });
  await waitFor(() => expect(f.accounts.get(A).getSnapshot().pendingLocalWrites).toBe(0));
  const aStored = await f.databases.get(A).read(`account:${A}`);
  const bStored = await f.databases.get(B).read(`account:${B}`);
  expect(aStored.data.resumeByDevice['active-test-device']['chapter-1:quiz'].session.bank.questions[0].id).toBe('identity-q1');
  expect(bStored.data.resumeByDevice['active-test-device']?.['chapter-1:quiz']).toBeUndefined();
  expect(screen.queryByRole('heading', { name: 'Choose Alpha' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
  expect(f.requests.slice(requestsBeforeRelease).some(request => request.path.startsWith('/api/progress') && request.authority === A)).toBe(false);
});

it('keeps a held actual IndexedDB quiz-finish attempt and tombstone in A without presenting a result or grade in B', async () => {
  const f = await setup(); await click(screen.getByRole('button', { name: 'Start Quiz' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finish and review' })).toBeEnabled());
  await click(screen.getByRole('button', { name: 'Alpha' })); await click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Correct'));
  await click(screen.getByRole('button', { name: 'Finish and review' }));
  const held = f.holdWrite(A);
  await click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' })); await held.entered.promise;
  await switchToB(f); await act(async () => { held.gate.resolve(); });
  await waitFor(() => expect(f.accounts.get(A).getSnapshot().pendingLocalWrites).toBe(0));
  const aStored = await f.databases.get(A).read(`account:${A}`);
  const attempt = Object.values(aStored.data.quizAttempts)[0];
  expect(attempt.percentage).toBe(50); expect(aStored.closedQuizSessions[attempt.sessionId].reason).toBe('finished');
  expect(Object.keys((await f.databases.get(B).read(`account:${B}`)).data.quizAttempts)).toEqual([]);
  expect(screen.getByLabelText('Active owner')).toHaveTextContent('0 attempts');
  expect(screen.queryByRole('heading', { name: 'Quiz Results' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeEnabled();
});

it('cancels an import held in file.text before it can mutate the newly active account', async () => {
  const file = deferred(); let importResult;
  function Importer() {
    const progress = useProgress();
    return <button onClick={() => { importResult = progress.importProgress({ text: () => file.promise }); }}>Import held file</button>;
  }
  const f = await setup(<><Importer /><Summary /></>);
  const aExport = await f.accounts.get(A).exportProgress();
  await click(screen.getByRole('button', { name: 'Import held file' })); await switchToB(f);
  await act(async () => { file.resolve(JSON.stringify(aExport)); expect(await importResult).toBe(false); });
  expect(f.accounts.get(B).getSnapshot().data.activities).toEqual({});
  expect(f.accounts.get(B).getSnapshot().cloud.pendingMutations).toBe(0);
});

it('shares one provider store subscription across two progress readers and a quiz', async () => {
  const f = activeFixture(); fixtures.push(f);
  const subscribe = vi.spyOn(f.guest, 'subscribe');
  function SecondReader() { const progress = useProgress(); return <p>{progress.loading ? 'Loading second reader' : 'Second reader ready'}</p>; }
  render(<ActiveProgressProvider controller={f.controller}><ChapterQuiz /><Summary /><SecondReader /></ActiveProgressProvider>);
  await screen.findByText('Second reader ready');
  expect(subscribe).toHaveBeenCalledTimes(1);
  await act(async () => { await f.guest.completeActivity(ACTIVITY); });
  expect(f.controller.getSnapshot().state.data.activities[ACTIVITY]).toBeDefined();
});
