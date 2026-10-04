import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import { useLearningActivity } from '@/hooks/useLearningActivity';
import { A, B, ACTIVITY, activeFixture } from './helpers';

const LESSON = 'chapter-1:foundations';
const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(fixture => fixture.dispose()));

async function setup() {
  const fixture = activeFixture({ schedule: () => 1, cancel: () => {} }); fixtures.push(fixture); fixture.setAccount(A);
  const actions = { current: null, pending: null };
  function Lesson() {
    const learning = useLearningActivity(LESSON);
    const [outcome, setOutcome] = useState('No success yet');
    actions.current = learning;
    const start = kind => {
      const action = kind === 'completion' ? learning.completeActivity(ACTIVITY) : learning.setResume(LESSON, { activityId: ACTIVITY, kind: 'tab' });
      actions.pending = action.then(result => { setOutcome(result ? 'Saved current learning work' : 'Stale work ignored'); return result; });
    };
    return <><output aria-label="Learning owner">{learning.learningData.ownerScope}</output><p role="status" aria-label="Learning action result">{outcome}</p><button onClick={() => start('completion')}>Complete held learning</button><button onClick={() => start('resume')}>Save held resume</button></>;
  }
  render(<ActiveProgressProvider controller={fixture.controller}><Lesson /></ActiveProgressProvider>);
  await waitFor(() => expect(screen.getByLabelText('Learning owner')).toHaveTextContent(`account:${A}`));
  return { ...fixture, actions };
}

it.each(['completion', 'resume'])('preserves a held %s transaction in A but returns false and no stale success after B activates', async kind => {
  const f = await setup(); const held = f.holdWrite(A);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: kind === 'completion' ? 'Complete held learning' : 'Save held resume' })); });
  await held.entered.promise;
  f.setAccount(B); await act(async () => { await f.controller.reconcile(); });
  await waitFor(() => expect(screen.getByLabelText('Learning owner')).toHaveTextContent(`account:${B}`));
  await act(async () => { held.gate.resolve(); expect(await f.actions.pending).toBe(false); });
  const a = await f.databases.get(A).read(`account:${A}`);
  const b = await f.databases.get(B).read(`account:${B}`);
  if (kind === 'completion') expect(a.data.activities[ACTIVITY]).toBeDefined();
  else expect(a.data.resumeByDevice['active-test-device'][LESSON].activityId).toBe(ACTIVITY);
  expect(b.data.activities).toEqual({}); expect(b.data.resumeByDevice['active-test-device']?.[LESSON]).toBeUndefined();
  expect(screen.queryByText('Saved current learning work')).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Learning action result' })).toHaveTextContent('Stale work ignored');
});

it.each(['completion', 'resume'])('returns false for a held %s result after known expiry while preserving the previously authorized A transaction', async kind => {
  const f = await setup(); const held = f.holdWrite(A);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: kind === 'completion' ? 'Complete held learning' : 'Save held resume' })); });
  await held.entered.promise; f.advanceTime(3600001);
  await act(async () => { held.gate.resolve(); expect(await f.actions.pending).toBe(false); });
  const a = await f.databases.get(A).read(`account:${A}`);
  if (kind === 'completion') expect(a.data.activities[ACTIVITY]).toBeDefined();
  else expect(a.data.resumeByDevice['active-test-device'][LESSON].activityId).toBe(ACTIVITY);
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(screen.getByLabelText('Learning owner')).toHaveTextContent('guest:');
  expect(screen.queryByText('Saved current learning work')).not.toBeInTheDocument();
});

it('cannot capture a fresh write context from an old hook after known expiry or start another account write', async () => {
  const f = await setup(); const captured = f.actions.current; f.advanceTime(3600001);
  await act(async () => {
    expect(captured.captureWriteContext(LESSON)).toBeNull();
    expect(await captured.completeActivity(ACTIVITY)).toBe(false);
    expect(await captured.setResume(LESSON, { activityId: ACTIVITY, kind: 'tab' })).toBe(false);
  });
  const a = await f.databases.get(A).read(`account:${A}`);
  expect(a.data.activities).toEqual({}); expect(a.data.resumeByDevice['active-test-device']?.[LESSON]).toBeUndefined();
});
