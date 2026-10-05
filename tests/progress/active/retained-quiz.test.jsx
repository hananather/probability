import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import LearningProgressPage from '@/components/progress/LearningProgressPage';
import { seedRetainedQuiz } from '../cloud/outbox/retained-fixtures';
import { A, B, activeFixture } from './helpers';

const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(f => f.dispose()));
async function fixture() {
  const f = activeFixture({ schedule: () => 1, cancel: () => {} }); fixtures.push(f);
  f.setAccount(A); await f.controller.start();
  // Build the previous durable failure while offline so the modern fixture
  // cannot acknowledge its corrected temporary grade during reconstruction.
  f.setProgressError(true);
  const original = await seedRetainedQuiz(f.accounts.get(A), f.databases.get(A));
  await f.controller.sync(); f.setProgressError(false);
  return { f, original };
}
const click = element => act(async () => { fireEvent.click(element); });

it('offers an explicit retained-quiz action, preserves the original backup, and waits for cloud acknowledgement before claiming synchronization', async () => {
  const { f, original } = await fixture();
  render(<ActiveProgressProvider controller={f.controller}><LearningProgressPage /></ActiveProgressProvider>);
  await screen.findByText('Account: alice@example.test');
  expect(screen.getByText(/Some account updates could not be queued for sync/)).toBeInTheDocument();
  const held = f.holdRemote(A);
  const retry = screen.getByRole('button', { name: 'Retry retained quiz updates' });
  retry.focus();
  await click(retry);
  await held.entered.promise;
  await screen.findByText(/Retained quiz updates were queued with their original identity/);
  expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry retained quiz updates' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry account sync' })).toHaveFocus();
  const pending = await f.accounts.get(A).getCloudBatch();
  expect(pending).toHaveLength(1); expect(pending[0].id).toBe(original.originalId); expect(pending[0].context).toEqual(original.context.cloud);
  await act(async () => { held.gate.resolve(); });
  await screen.findByText('Account progress synchronized');
  expect(f.remote.get(A).document.facts.quizAttempts[original.attempt.id].percentage).toBe(6);
  expect((await f.accounts.get(A).exportProgress()).accountBlocked[0]).toEqual(original.branch);
});

it.each(['owner', 'expiry'])('does not queue or render recovery success when %s changes while its real IndexedDB transaction is held', async change => {
  const { f, original } = await fixture();
  render(<ActiveProgressProvider controller={f.controller}><LearningProgressPage /></ActiveProgressProvider>);
  await screen.findByRole('button', { name: 'Retry retained quiz updates' });
  const held = f.holdWrite(A);
  fireEvent.click(screen.getByRole('button', { name: 'Retry retained quiz updates' }));
  await held.entered.promise;
  if (change === 'owner') {
    f.setAccount(B); await act(async () => { await f.controller.reconcile(); });
    await screen.findByText('Account: bob@example.test');
  } else {
    f.advanceTime(3600001);
  }
  await act(async () => { held.gate.resolve(); });
  await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(change === 'owner' ? B : undefined));
  expect(screen.queryByText(/Retained quiz updates were queued/)).not.toBeInTheDocument();
  const a = await f.databases.get(A).read(`account:${A}`);
  expect(a.cloud.outbox).toEqual([]); expect(a.cloud.blocked).toHaveLength(1); expect(a.accountBlocked[0]).toEqual(original.branch);
  expect(f.accounts.get(B)?.getSnapshot().data.quizAttempts || {}).toEqual({});
  expect(f.guest.getSnapshot().data.quizAttempts).toEqual({});
});

it('rejects a retained retry invoked after known expiry even if the timer was throttled', async () => {
  const { f, original } = await fixture(); f.advanceTime(3600001);
  const requests = f.requests.length;
  expect(await f.controller.retryRetainedQuizUpdates()).toBe(false);
  expect(f.requests.slice(requests).filter(request => request.path.startsWith('/api/progress'))).toEqual([]);
  expect(f.controller.getSnapshot().account).toBeNull();
  expect((await f.databases.get(A).read(`account:${A}`)).accountBlocked[0]).toEqual(original.branch);
});
