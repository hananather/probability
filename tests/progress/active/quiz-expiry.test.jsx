import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { useProgress } from '@/hooks/useProgress';
import { MotionPreferenceContext } from '@/hooks/useReducedMotion';
import progressService from '@/services/progressService';
import { A, ACTIVITY, activeFixture } from './helpers';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));
const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(fixture => fixture.dispose()));
const click = element => act(async () => { fireEvent.click(element); });
function Owner() { const value = useProgress(); return <output aria-label="Expiry owner">{value.learningData.ownerScope}</output>; }
async function setup() {
  const fixture = activeFixture({ schedule: () => 1, cancel: () => {} }); fixtures.push(fixture); fixture.setAccount(A);
  render(<MotionPreferenceContext.Provider value={true}><ActiveProgressProvider controller={fixture.controller}><ChapterQuiz /><Owner /></ActiveProgressProvider></MotionPreferenceContext.Provider>);
  await waitFor(() => expect(screen.getByLabelText('Expiry owner')).toHaveTextContent(`account:${A}`));
  return fixture;
}

it('rejects actual bank Start after verified expiry even when the expiry timer never fires', async () => {
  const f = await setup(); const captured = f.controller.getSnapshot(); f.advanceTime(3600001);
  await click(screen.getByRole('button', { name: 'Start Quiz' }));
  expect(f.controller.isCurrentBinding(captured.store, captured.generation)).toBe(false);
  const a = await f.databases.get(A).read(`account:${A}`);
  expect(a.data.resumeByDevice['active-test-device']?.['chapter-1:quiz']).toBeUndefined();
  expect(a.data.quizAttempts).toEqual({});
  expect(screen.getByLabelText('Expiry owner')).toHaveTextContent('guest:');
});

it('rejects an actual bank finish confirmation after verified expiry without deleting its saved unfinished A session', async () => {
  const f = await setup(); await click(screen.getByRole('button', { name: 'Start Quiz' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finish and review' })).toBeEnabled());
  const before = await f.databases.get(A).read(`account:${A}`);
  expect(before.data.resumeByDevice['active-test-device']['chapter-1:quiz'].session.bank.questions).toHaveLength(15);
  await click(screen.getByRole('button', { name: 'Finish and review' })); f.advanceTime(3600001);
  await click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finish and review' }));
  const after = await f.databases.get(A).read(`account:${A}`);
  expect(after.data.quizAttempts).toEqual({});
  expect(after.data.resumeByDevice['active-test-device']['chapter-1:quiz']).toEqual(before.data.resumeByDevice['active-test-device']['chapter-1:quiz']);
  expect(screen.queryByRole('heading', { name: 'Quiz Results' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Expiry owner')).toHaveTextContent('guest:');
});

it('rejects sync and detaches direct compatibility service lookup before using a known expired account', async () => {
  const f = await setup(); f.advanceTime(3600001);
  const progressRequests = f.requests.filter(request => request.path.startsWith('/api/progress')).length;
  await act(async () => { expect(await f.controller.sync()).toBe(false); });
  expect(f.requests.filter(request => request.path.startsWith('/api/progress'))).toHaveLength(progressRequests);
  expect(progressService.getStore()).toBe(f.guest);
  await act(async () => { await progressService.completeSection('chapter-1', 'foundations'); });
  expect(f.accounts.get(A).getSnapshot().data.activities[ACTIVITY]).toBeUndefined();
});
