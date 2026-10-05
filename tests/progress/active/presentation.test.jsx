import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ActiveProgressProvider } from '@/components/shared/ActiveProgressProvider';
import LearningProgressPage from '@/components/progress/LearningProgressPage';
import { createEmptyCloudDocument } from '@/lib/progress/cloud/schema';
import { createProgressStore } from '@/lib/progress/store';
import { A, B, activeFixture } from './helpers';
import { environment, memoryPersistence } from '../store/helpers';

vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
const MODULE = 'chapter-1:foundations';
const fixtures = [];
const stores = [];
const subject = (options = {}) => { const fixture = activeFixture(options); fixtures.push(fixture); return fixture; };
const renderPage = fixture => render(<ActiveProgressProvider controller={fixture.controller}><LearningProgressPage /></ActiveProgressProvider>);
const click = element => act(async () => fireEvent.click(element));
afterEach(() => { fixtures.splice(0).forEach(fixture => fixture.dispose()); stores.splice(0).forEach(store => store.dispose()); });
function remoteStudy(fixture, id = A) {
  const document = createEmptyCloudDocument({ ownerScope: `account:${id}` });
  document.facts.activities[MODULE] = { activityId: MODULE, evidence: [{ id: 'existing-module-evidence', kind: 'study-completed', sourceKey: 'original-account-record', completedAt: null }] };
  fixture.remote.set(id, { document, revision: 3 });
}
function nativeBodyFallback() {
  // jsdom keeps a disabled focused button active. Model the native BODY
  // fallback observed by the browser reviewer without claiming a native run.
  const previous = document.body.getAttribute('tabindex');
  document.body.tabIndex = -1; document.body.focus();
  if (previous === null) document.body.removeAttribute('tabindex');
  else document.body.setAttribute('tabindex', previous);
}

it.each(['checking', 'connecting'])('waits for the %s destination before personal totals and backups while preserving public chapter links', async phase => {
  const fixture = subject(); await fixture.guest.hydrate(); remoteStudy(fixture); fixture.setAccount(A);
  const held = phase === 'checking' ? fixture.holdSession() : fixture.holdRemote();
  renderPage(fixture); await held.entered.promise;
  expect(fixture.controller.getSnapshot().sessionStatus).toBe(phase);
  expect(fixture.controller.getSnapshot().state.loading).toBe(false);
  expect(screen.getByText(phase === 'checking' ? 'Checking account connection…' : 'Opening verified account progress…')).toBeInTheDocument();
  expect(screen.queryByText('Guest progress in this browser')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Study and practice' })).not.toBeInTheDocument();
  expect(screen.queryByText('0 / 66')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Import backup' })).toBeDisabled();
  expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
  expect(screen.getAllByRole('link', { name: 'Practice quiz' })).toHaveLength(7);
  const original = JSON.stringify(fixture.remote.get(A));
  await act(async () => held.gate.resolve());
  await screen.findByText('Account: alice@example.test');
  expect(screen.getByText('1 / 66')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Import account recovery' })).toBeEnabled();
  expect(JSON.stringify(fixture.remote.get(A))).toBe(original);
});

it.each(['unconfigured', 'unavailable'])('keeps guest records and backup/navigation usable when verification is %s', async mode => {
  const fixture = subject(); await fixture.guest.hydrate(); await fixture.guest.completeActivity(MODULE);
  if (mode === 'unavailable') fixture.setAuthError(true);
  else fixture.fetchImpl.mockImplementation(async () => new Response(JSON.stringify({ configured: false, status: 'guest', account: null }), { headers: { 'content-type': 'application/json' } }));
  renderPage(fixture); await screen.findByText('1 / 66');
  await waitFor(() => expect(fixture.controller.getSnapshot().sessionStatus).toBe(mode === 'unavailable' ? 'unavailable' : 'guest'));
  expect(screen.getByText('Guest progress in this browser')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
  if (mode === 'unavailable') expect(screen.queryByText(/Account sign-in is unavailable in this installation/)).not.toBeInTheDocument();
});

it.each(['checking', 'connecting'])('defers session-only recovery prompts while %s and preserves guest recovery', async phase => {
  const persistence = memoryPersistence();
  const guest = createProgressStore(environment(persistence, { importLegacy: false })); stores.push(guest);
  await guest.hydrate(); persistence.failures.write = true; await guest.completeActivity(MODULE);
  expect(guest.getSnapshot().persistenceStatus).toBe('session-only');
  const retrySave = vi.spyOn(guest, 'retryPersistence');
  const fixture = subject({ getGuestStore: () => guest });
  if (phase === 'connecting') fixture.setAccount(A);
  const held = phase === 'checking' ? fixture.holdSession() : fixture.holdRemote();
  renderPage(fixture); await held.entered.promise;
  expect(fixture.controller.getSnapshot().state.persistenceStatus).toBe('session-only');
  expect(screen.queryByText('Export a backup before closing this page, then try saving again.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Try saving again' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeDisabled();
  expect(screen.getByRole('link', { name: 'Open chapter 1' })).toHaveAttribute('href', '/chapter1');
  expect(retrySave).not.toHaveBeenCalled();
  await act(async () => held.gate.resolve());
  expect(guest.getSnapshot().persistenceStatus).toBe('session-only');
  expect(guest.getSnapshot().data.activities[MODULE]).toBeDefined();
  if (phase === 'connecting') await screen.findByText('Account: alice@example.test');
  else {
    await screen.findByText('Guest progress in this browser');
    expect(screen.getByText('Your recent changes are only kept for this visit.')).toBeInTheDocument();
    expect(screen.getByText('Export a backup before closing this page, then try saving again.')).toBeInTheDocument();
    expect(screen.getByText('1 / 66')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
    persistence.failures.write = false;
    await click(screen.getByRole('button', { name: 'Try saving again' }));
    await screen.findByText('Your progress is saved in this browser.');
    expect(retrySave).toHaveBeenCalledOnce();
    expect(guest.getSnapshot().persistenceStatus).toBe('persisted');
    expect(screen.getByText('1 / 66')).toBeInTheDocument();
  }
});

it('keeps an acknowledged current account visible through offline verification', async () => {
  const fixture = subject(); remoteStudy(fixture); fixture.setAccount(A); renderPage(fixture);
  await screen.findByText('Account progress synchronized');
  fixture.setAuthError(true); await act(async () => fixture.controller.reconcile());
  expect(fixture.controller.getSnapshot().sessionStatus).toBe('offline');
  expect(screen.getByText('Account: alice@example.test')).toBeInTheDocument();
  expect(screen.getByText('1 / 66')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeEnabled();
});

it('returns a focused explicit sync control after disabled-trigger blur and successful settlement', async () => {
  const fixture = subject(); fixture.setAccount(A); renderPage(fixture); await screen.findByText('Account progress synchronized');
  const held = fixture.holdRemote(); const retry = screen.getByRole('button', { name: 'Retry account sync' });
  retry.focus(); await click(retry); await held.entered.promise; expect(retry).toBeDisabled();
  nativeBodyFallback(); expect(document.activeElement).toBe(document.body);
  await act(async () => held.gate.resolve());
  await screen.findByText('The account synchronization check finished. Check the status above for pending or conflicting records.');
  expect(retry).toBeEnabled(); expect(retry).toHaveFocus();
});

it('restores focused sync on failure without claiming cloud acknowledgement', async () => {
  const fixture = subject(); fixture.setAccount(A); renderPage(fixture); await screen.findByText('Account progress synchronized');
  fixture.setProgressError(true);
  const retry = screen.getByRole('button', { name: 'Retry account sync' }); retry.focus();
  const pending = click(retry); nativeBodyFallback(); await pending;
  await screen.findByText('This action could not be completed. Your existing progress is retained.');
  expect(retry).toHaveFocus(); expect(screen.queryByText('Account progress synchronized')).not.toBeInTheDocument();
});

it.each(['focus', 'pointer'])('does not restore an older sync intent after a newer %s action, even if focus later falls to BODY', async action => {
  const fixture = subject(); fixture.setAccount(A); renderPage(fixture); await screen.findByText('Account progress synchronized');
  const held = fixture.holdRemote(); const retry = screen.getByRole('button', { name: 'Retry account sync' });
  retry.focus(); await click(retry); await held.entered.promise;
  if (action === 'focus') screen.getByRole('link', { name: 'Open chapter 1' }).focus();
  else fireEvent.pointerDown(document.body);
  nativeBodyFallback(); await act(async () => held.gate.resolve());
  await screen.findByText('The account synchronization check finished. Check the status above for pending or conflicting records.');
  expect(document.activeElement).toBe(document.body);
});

it('does not request return focus when the explicit retry trigger did not hold keyboard focus', async () => {
  const fixture = subject(); fixture.setAccount(A); renderPage(fixture); await screen.findByText('Account progress synchronized');
  const held = fixture.holdRemote(); const link = screen.getByRole('link', { name: 'Open chapter 1' }); link.focus();
  await click(screen.getByRole('button', { name: 'Retry account sync' })); await held.entered.promise;
  await act(async () => held.gate.resolve());
  await screen.findByText('The account synchronization check finished. Check the status above for pending or conflicting records.');
  expect(link).toHaveFocus();
});

it('cannot publish an old sync message or focus into the next account after a held A response', async () => {
  const fixture = subject(); fixture.setAccount(A); renderPage(fixture); await screen.findByText('Account progress synchronized');
  const held = fixture.holdRemote(); const retry = screen.getByRole('button', { name: 'Retry account sync' });
  retry.focus(); await click(retry); await held.entered.promise;
  fixture.setAccount(B); await act(async () => fixture.controller.reconcile()); await screen.findByText('Account: bob@example.test');
  const heading = screen.getByRole('heading', { name: 'Progress destination' }); heading.focus();
  expect(retry.isConnected).toBe(false); await act(async () => held.gate.resolve());
  expect(heading).toHaveFocus();
  expect(screen.queryByText('The account synchronization check finished. Check the status above for pending or conflicting records.')).not.toBeInTheDocument();
});
