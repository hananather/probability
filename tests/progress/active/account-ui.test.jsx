import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import LearningProgressPage from '@/components/progress/LearningProgressPage';
import { createEmptyCloudDocument } from '@/lib/progress/cloud/schema';
import { A, B, ACTIVITY, activeFixture, copy } from './helpers';
import { PROGRESS_BACKUP_LIMITS } from '@/lib/progress/backups';
import { validatePinnedQuizAttempt } from '@/lib/progress/quizContract';

vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
const fixtures = [];
afterEach(() => fixtures.splice(0).forEach(fixture => fixture.dispose()));
const subject = () => { const fixture = activeFixture(); fixtures.push(fixture); return fixture; };
const renderPage = fixture => render(<ActiveProgressProvider controller={fixture.controller}><LearningProgressPage /></ActiveProgressProvider>);
const click = async element => act(async () => { fireEvent.click(element); });
const upload = async input => act(async () => { fireEvent.change(screen.getByLabelText('Choose an account recovery backup'), { target: { files: [input] } }); });
const jsonFile = value => {
  const source = JSON.stringify(value);
  const bytes = new TextEncoder().encode(source);
  const input = new File([source], 'account-recovery.json', { type: 'application/json' });
  // jsdom's File omits the modern browser arrayBuffer method.
  input.arrayBuffer = async () => bytes.buffer;
  return input;
};

async function blockedGradeBackup(f) {
  f.setAccount(A); f.controller.start(); await f.controller.reconnect();
  const store = f.accounts.get(A);
  for (let bank = 1; bank <= 3; bank++) {
    const questions = Array.from({ length: 40 }, (_, index) => ({
      id: `retained-bank-${bank}-q-${index}`, type: 'multiple-choice', correct: 0,
      question: `Worked probability problem ${index}: ${'q'.repeat(4500)}`,
      explanation: `Derivation and numerical interpretation: ${'e'.repeat(24000)}`,
      options: Array.from({ length: 4 }, (_, option) => `Choice ${option}: ${'o'.repeat(1200)}`),
    }));
    const startTime = Date.now() - 1000;
    const session = { sessionId: `oversized-session-${bank}`, chapterId: 'chapter-1', bank: { revision: `oversized-bank-${bank}`, requestedVersion: 'engineering', effectiveVersion: 'engineering', questions }, currentQuestionId: questions[0].id, flaggedQuestionIds: [], answersByQuestionId: {}, startTime, deadline: startTime + 3600000, isPaused: false, pausedRemaining: null };
    const context = store.captureWriteContext('chapter-1:quiz');
    expect((await store.beginQuizSession('chapter-1', session, { context })).applied).toBe(true);
    const result = await store.finishQuizAttempt('chapter-1', { sessionId: session.sessionId, attemptId: `oversized-attempt-${bank}`, answersByQuestionId: { [questions[0].id]: { answer: 0, timestamp: startTime + 100 } } }, { context });
    expect(result.applied).toBe(true);
    expect(validatePinnedQuizAttempt(result.attempt).valid).toBe(true);
    expect(result.attempt.percentage).toBe(3);
  }
  const backup = await store.exportProgress();
  expect(backup.accountBlocked).toHaveLength(3);
  expect(backup.cloud.blocked).toHaveLength(3);
  expect(Object.keys(backup.snapshot.quizAttempts)).toHaveLength(3);
  return backup;
}

it('names the account destination and requires explicit preview plus confirmation to copy guest records', async () => {
  const f = subject(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A); renderPage(f);
  await screen.findByText('Account: alice@example.test');
  expect(f.accounts.get(A).getSnapshot().data.activities).toEqual({});
  await click(screen.getByRole('button', { name: 'Review guest progress' }));
  await screen.findByRole('heading', { name: 'Add guest records to this account' });
  expect(screen.getByRole('heading', { name: 'Add guest records to this account' })).toHaveFocus();
  expect(screen.getByText(/1 studied-module records and 0 quiz attempts/)).toBeInTheDocument();
  expect(screen.getByText('Destination: alice@example.test')).toBeInTheDocument();
  expect(f.accounts.get(A).getSnapshot().data.activities).toEqual({});
  await click(screen.getByRole('button', { name: 'Add these guest records' }));
  await waitFor(() => expect(f.accounts.get(A).getSnapshot().data.activities[ACTIVITY]).toBeDefined());
  await screen.findByText('Guest records were saved to this account in this browser. Check the account sync status for cloud acknowledgement.');
  expect(screen.getByRole('button', { name: 'Review guest progress' })).toHaveFocus();
  expect(f.guest.getSnapshot().data.activities[ACTIVITY]).toBeDefined();
});

it('keeps local save evidence separate from a held remote acknowledgement', async () => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account progress synchronized');
  const held = f.holdRemote();
  await act(async () => { await f.accounts.get(A).completeActivity(ACTIVITY); }); await held.entered.promise;
  expect(screen.getByText('Saved in this browser')).toBeInTheDocument();
  expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
  expect(screen.getByText('Connecting and synchronizing account progress…')).toBeInTheDocument();
  await act(async () => { held.gate.resolve(); });
  await screen.findByText('Account progress synchronized');
  expect(f.remote.get(A).document.facts.activities[ACTIVITY]).toBeDefined();
});

it('makes a capacity-blocked exact original record exportable without advertising synchronized progress', async () => {
  const f = subject(); const document = createEmptyCloudDocument({ ownerScope: `account:${A}` });
  document.facts.activities[ACTIVITY] = { activityId: ACTIVITY, evidence: Array.from({ length: 256 }, (_, index) => ({ id: `retained-${index}`, kind: 'study-completed', sourceKey: 'existing-record', completedAt: null })) };
  f.remote.set(A, { document, revision: 0 }); f.setAccount(A); renderPage(f); await screen.findByText('Account progress synchronized');
  await act(async () => { await f.accounts.get(A).completeActivity(ACTIVITY); });
  await screen.findByText(/Some account updates exceed sync limits/);
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
  const backup = await f.accounts.get(A).exportProgress();
  expect(backup.snapshot.activities[ACTIVITY].evidence).toHaveLength(257);
  expect(backup.accountBlocked).toHaveLength(1);
  expect(backup.cloud.blocked).toHaveLength(1);
});

it('keeps session-only changes visible and backed up without labeling local persistence as a cloud save', async () => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account progress synchronized');
  const database = f.databases.get(A);
  const update = database.update; database.update = vi.fn(async () => { throw new Error('Controlled quota failure'); });
  await act(async () => { await f.accounts.get(A).completeActivity(ACTIVITY); });
  await screen.findByText('Your recent changes are only kept for this visit.');
  expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  const backup = await f.accounts.get(A).exportProgress(); expect(backup.snapshot.activities[ACTIVITY]).toBeDefined();
  database.update = update;
});

it('removes account-specific transfer UI and retains guest public access immediately on sign-out', async () => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account: alice@example.test');
  await click(screen.getByRole('button', { name: 'Review guest progress' })); await screen.findByRole('button', { name: 'Add these guest records' });
  await click(screen.getByRole('button', { name: 'Sign out' }));
  await screen.findByText('Guest progress in this browser');
  expect(screen.queryByRole('button', { name: 'Add these guest records' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Sign in with email' })).toHaveAttribute('href', '/auth/sign-in');
  expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
  expect(f.authClient.auth.signOut).not.toHaveBeenCalled();
});

it('prevents an overlapping sign-in while the previous server sign-out is held', async () => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account: alice@example.test');
  const held = f.holdSignOut(); await click(screen.getByRole('button', { name: 'Sign out' })); await held.entered.promise;
  expect(screen.queryByRole('link', { name: 'Sign in with email' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Check account connection' })).toBeDisabled();
  expect(screen.getByRole('heading', { name: 'Progress destination' })).toHaveFocus();
  expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
  await act(async () => { held.gate.resolve(); });
  await screen.findByRole('link', { name: 'Sign in with email' });
});

it('imports a measured >10 MiB blocked-grade backup as exact recovery without adopting its attainment or remote base', async () => {
  const source = subject(); const backup = await blockedGradeBackup(source);
  // A valid file-provided base is still recovery input, never server authority.
  backup.cloud.base.document.facts.activities['chapter-2:random-variables'] = { activityId: 'chapter-2:random-variables', evidence: [{ id: 'file-only-evidence', kind: 'study-completed', sourceKey: 'file-only', completedAt: null }] };
  const input = jsonFile(backup);
  expect(input.size).toBeGreaterThan(PROGRESS_BACKUP_LIMITS.guestBytes);
  expect(input.size).toBeLessThan(PROGRESS_BACKUP_LIMITS.accountBytes);
  const nodes = value => 1 + (value && typeof value === 'object' ? Object.values(value).reduce((count, child) => count + nodes(child), 0) : 0);
  expect(nodes(backup)).toBeLessThan(PROGRESS_BACKUP_LIMITS.accountNodes);
  console.info('A4 blocked-grade recovery measurement:', JSON.stringify({ bytes: input.size, nodes: nodes(backup), banks: 3, questionsPerBank: 40 }));
  const target = subject(); target.setAccount(A); renderPage(target); await screen.findByText('Account progress synchronized');
  await act(async () => { await target.accounts.get(A).completeActivity(ACTIVITY); });
  await screen.findByText('Account progress synchronized');
  const before = copy(target.accounts.get(A).getSnapshot().data);
  await upload(input);
  await screen.findByText(/The account backup is retained for recovery export/);
  const saved = await target.accounts.get(A).exportProgress();
  const retained = saved.recovery.find(entry => entry.reason === 'imported-account-file');
  expect(retained.raw).toBe(JSON.stringify(backup));
  expect((await target.databases.get(A).read(`account:${A}`)).recovery.find(entry => entry.reason === 'imported-account-file').raw).toBe(retained.raw);
  expect(JSON.parse(retained.raw).snapshot.quizAttempts['oversized-attempt-3'].bank).toEqual(backup.snapshot.quizAttempts['oversized-attempt-3'].bank);
  expect(saved.snapshot.quizAttempts).toEqual(before.quizAttempts);
  expect(saved.snapshot.activities).toEqual(before.activities);
  expect(saved.snapshot.resumeByDevice).toEqual(before.resumeByDevice);
  expect(saved.cloud.base.document.facts.activities['chapter-2:random-variables']).toBeUndefined();
  expect(screen.getByText(/Archived blocked records do not become current attainment/)).toBeInTheDocument();
}, 20000);

it.each(['oversized', 'malformed', 'foreign-owner', 'invalid-grade'])('refuses %s account recovery atomically without changing durable records', async mode => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account progress synchronized');
  const store = f.accounts.get(A); const database = f.databases.get(A);
  const before = await database.read(`account:${A}`);
  const update = vi.spyOn(database, 'update'); update.mockClear();
  let input;
  if (mode === 'oversized') input = { size: PROGRESS_BACKUP_LIMITS.accountBytes + 1, arrayBuffer: vi.fn() };
  else if (mode === 'malformed') input = { size: 3, arrayBuffer: async () => new TextEncoder().encode('{no').buffer };
  else {
    const backup = await store.exportProgress();
    if (mode === 'foreign-owner') backup.snapshot.ownerScope = `account:${B}`;
    else backup.snapshot.quizAttempts.invalid = { id: 'invalid', percentage: 101 };
    input = jsonFile(backup);
  }
  await upload(input);
  await screen.findByRole('alert');
  expect(update).not.toHaveBeenCalled();
  expect(await database.read(`account:${A}`)).toEqual(before);
  if (mode === 'oversized') expect(input.arrayBuffer).not.toHaveBeenCalled();
});

it('preserves the original account file for export when its recovery transaction hits quota', async () => {
  const f = subject(); f.setAccount(A); renderPage(f); await screen.findByText('Account progress synchronized');
  const store = f.accounts.get(A); const backup = await store.exportProgress();
  const database = f.databases.get(A); const before = await database.read(`account:${A}`);
  const originalUpdate = database.update; database.update = vi.fn(async () => { throw new Error('Controlled import quota'); });
  await upload(jsonFile(backup));
  await screen.findByText('We could not finish importing this backup. Check your progress below and try again.');
  expect(await database.read(`account:${A}`)).toEqual(before);
  expect(screen.getByText('Your recent changes are only kept for this visit.')).toBeInTheDocument();
  const recoverable = await store.exportProgress();
  expect(recoverable.recovery.some(entry => entry.reason === 'imported-account-file' && entry.raw === JSON.stringify(backup))).toBe(true);
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  database.update = originalUpdate;
});
