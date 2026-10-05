import { afterEach, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { createActiveProgressController, ACTIVE_PROGRESS_SERVER_SNAPSHOT } from '@/lib/progress/active';
import { A, B, ACTIVITY, activeFixture, deferred } from './helpers';

const browser = vi.hoisted(() => ({ evaluations: 0, factory: vi.fn() }));
vi.mock('@/lib/auth/browser', () => {
  browser.evaluations++;
  return { getBrowserAuthClient: (...args) => browser.factory(...args) };
});

const fixtures = [];
const subject = options => { const f = activeFixture(options); fixtures.push(f); return f; };
afterEach(() => { fixtures.splice(0).forEach(f => f.dispose()); vi.unstubAllEnvs(); });

it('keeps the browser SDK module cold for SSR and configured guest hydration, study and focus; loads it once after server verification', async () => {
  expect(browser.evaluations).toBe(0);
  const ssr = createActiveProgressController();
  expect(ssr.getServerSnapshot()).toBe(ACTIVE_PROGRESS_SERVER_SNAPSHOT);
  expect(browser.evaluations).toBe(0);
  const f = subject({ getAuthClient: undefined });
  browser.factory.mockReturnValue(f.authClient);
  await f.controller.start();
  await f.guest.completeActivity(ACTIVITY);
  f.eventTarget.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(f.requests.filter(r => r.path === '/api/auth/session')).toHaveLength(2));
  expect(f.controller.getSnapshot().store).toBe(f.guest);
  expect(browser.evaluations).toBe(0);
  expect(browser.factory).not.toHaveBeenCalled();
  const failModule = vi.fn(() => { throw new Error('chunk unavailable'); });
  vi.doMock('@/lib/auth/browser', failModule);
  f.setAccount(A); await f.controller.reconcile();
  await waitFor(() => expect(failModule).toHaveBeenCalledTimes(1));
  expect(f.controller.getSnapshot().state.cloud.status).toBe('synced');
  expect(browser.factory).not.toHaveBeenCalled();
  vi.doMock('@/lib/auth/browser', () => { browser.evaluations++; return { getBrowserAuthClient: (...args) => browser.factory(...args) }; });
  await f.controller.reconcile();
  await waitFor(() => expect(browser.factory).toHaveBeenCalledTimes(1));
  expect(browser.evaluations).toBe(1);
  await f.controller.reconcile();
  expect(browser.factory).toHaveBeenCalledTimes(1);
});

it('does not construct even an injected SDK client for unconfigured or configured verified guests', async () => {
  const getAuthClient = vi.fn();
  const f = subject({ getAuthClient });
  await f.controller.start(); await f.guest.completeActivity(ACTIVITY);
  expect(getAuthClient).not.toHaveBeenCalled();
  expect(f.accounts.size).toBe(0);
});

it('keeps an unconfigured guest usable without invoking the SDK load lane', async () => {
  const loadAuthClient = vi.fn();
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ configured: false, status: 'guest', account: null }), { headers: { 'content-type': 'application/json' } }));
  const f = subject({ getAuthClient: undefined, loadAuthClient, fetchImpl });
  await f.controller.start(); await f.guest.completeActivity(ACTIVITY);
  expect(f.controller.getSnapshot().state.data.activities[ACTIVITY]).toBeDefined();
  f.eventTarget.dispatchEvent(new Event('online')); await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
  expect(loadAuthClient).not.toHaveBeenCalled(); expect(f.controller.getSnapshot().configured).toBe(false);
});

function delayed(options = {}) {
  const held = deferred();
  const factory = vi.fn();
  const load = vi.fn(() => held.promise);
  const closeHints = vi.fn();
  let hint;
  const listen = vi.fn(callback => { hint = callback; return closeHints; });
  const f = subject({ getAuthClient: undefined, loadAuthClient: load, listenAuthHints: listen, ...options });
  factory.mockReturnValue(f.authClient);
  return { ...f, held, factory, load, closeHints, listen, hint: (event, id) => hint?.(event, id ? { user: { id } } : null) };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

it('keeps verified account hydration and durable study independent of a held SDK import', async () => {
  const f = delayed(); f.setAccount(A); await f.controller.start();
  expect(f.controller.getSnapshot().account.id).toBe(A);
  expect(f.controller.getSnapshot().state.cloud.status).toBe('synced');
  expect(f.load).toHaveBeenCalledTimes(1); expect(f.factory).not.toHaveBeenCalled();
  expect(f.closeHints).not.toHaveBeenCalled();
  await f.accounts.get(A).completeActivity(ACTIVITY);
  await waitFor(() => expect(f.remote.get(A).document.facts.activities[ACTIVITY]).toBeDefined());
  f.held.resolve(f.factory);
  await waitFor(() => expect(f.factory).toHaveBeenCalledTimes(1));
  expect(f.closeHints).toHaveBeenCalledTimes(1);
});

it('coalesces configured guest hints into fresh verification and does not activate their claimed identity', async () => {
  const f = delayed(); await f.controller.start();
  f.hint('SIGNED_IN', B); f.hint('SIGNED_IN', B);
  await settle();
  expect(f.requests.filter(r => r.path === '/api/auth/session')).toHaveLength(2);
  expect(f.accounts.size).toBe(0); expect(f.load).not.toHaveBeenCalled();
  f.setAccount(A); f.hint('SIGNED_IN', B);
  await waitFor(() => expect(f.controller.getSnapshot().account?.id).toBe(A));
  expect(f.accounts.has(B)).toBe(false); expect(f.load).toHaveBeenCalledTimes(1);
});

it('immediately invalidates A on a different-account passive hint while requiring verification of B', async () => {
  const f = delayed(); f.setAccount(A); await f.controller.start();
  const binding = f.controller.getSnapshot(); f.setAuthError(true); f.hint('SIGNED_IN', B);
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(f.controller.isCurrentBinding(binding.store, binding.generation)).toBe(false);
  await settle(); f.held.resolve(f.factory); await settle();
  expect(f.factory).not.toHaveBeenCalled(); expect(f.accounts.has(B)).toBe(false);
});

it('recovers a failed SDK chunk on a later verification without discarding acknowledged progress', async () => {
  const factory = vi.fn(); const load = vi.fn().mockRejectedValueOnce(new Error('chunk unavailable')).mockResolvedValue(factory);
  const f = delayed({ loadAuthClient: load }); factory.mockReturnValue(f.authClient);
  f.setAccount(A); await f.controller.start(); await settle();
  expect(f.controller.getSnapshot().account.id).toBe(A);
  expect(f.controller.getSnapshot().state.cloud.status).toBe('synced');
  expect(factory).not.toHaveBeenCalled(); expect(f.closeHints).not.toHaveBeenCalled();
  await f.controller.reconcile(); await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
  expect(load).toHaveBeenCalledTimes(2); expect(f.closeHints).toHaveBeenCalledTimes(1);
});

it('does not construct or subscribe after stop when the requested module finally arrives', async () => {
  const f = delayed(); f.setAccount(A); await f.controller.start();
  const subscribe = vi.spyOn(f.authClient.auth, 'onAuthStateChange');
  f.controller.stop(); f.held.resolve(f.factory); await settle();
  expect(f.factory).not.toHaveBeenCalled(); expect(subscribe).not.toHaveBeenCalled();
  expect(f.closeHints).toHaveBeenCalledTimes(1);
});

it('supports Strict Mode stop/restart with a shared held module and only one current SDK subscription', async () => {
  const f = delayed(); f.setAccount(A); await f.controller.start(); f.controller.stop();
  await f.controller.start();
  const subscribe = vi.spyOn(f.authClient.auth, 'onAuthStateChange');
  f.held.resolve(f.factory); await waitFor(() => expect(f.factory).toHaveBeenCalledTimes(1));
  expect(subscribe).toHaveBeenCalledTimes(1); expect(f.listen).toHaveBeenCalledTimes(2);
  expect(f.closeHints).toHaveBeenCalledTimes(2);
  f.controller.stop(); f.emit('SIGNED_IN', B);
  expect(f.controller.getSnapshot().account?.id).toBe(A);
});

it('lets B use the loaded module but prevents the old A completion from constructing an SDK client', async () => {
  const f = delayed(); f.setAccount(A); await f.controller.start();
  const a = f.controller.getSnapshot(); f.setAccount(B); await f.controller.reconcile();
  expect(f.controller.getSnapshot().account.id).toBe(B);
  expect(f.controller.isCurrentBinding(a.store, a.generation)).toBe(false);
  f.held.resolve(f.factory); await waitFor(() => expect(f.factory).toHaveBeenCalledTimes(1));
  expect(f.controller.getSnapshot().account.id).toBe(B);
  expect(f.controller.getSnapshot().store).toBe(f.accounts.get(B));
});

it('refuses late SDK construction after a known expiry even when the browser expiry timer is throttled', async () => {
  const f = delayed({ schedule: () => 1, cancel: () => {} });
  f.setAccount(A); await f.controller.start(); f.advanceTime(3600001);
  f.held.resolve(f.factory); await settle();
  expect(f.factory).not.toHaveBeenCalled();
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(f.controller.getSnapshot().store).toBe(f.guest);
});

it('refuses a held import both during and after sign-out while retaining guest study', async () => {
  const f = delayed(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A); await f.controller.start();
  const signout = f.holdSignOut(); const pending = f.controller.signOut(); await signout.entered.promise;
  f.held.resolve(f.factory); await settle();
  expect(f.factory).not.toHaveBeenCalled();
  expect(f.controller.getSnapshot().state.data.activities[ACTIVITY]).toBeDefined();
  signout.gate.resolve(); expect(await pending).toBe(true);
  f.hint('SIGNED_IN', A); await settle();
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(f.factory).not.toHaveBeenCalled();
});

it('installs the SDK for a fresh verified null-expiry account while preserving the stricter offline rule', async () => {
  const f = delayed(); f.setAccount(A, null); await f.controller.start();
  f.held.resolve(f.factory); await waitFor(() => expect(f.factory).toHaveBeenCalledTimes(1));
  expect(f.controller.getSnapshot().account.id).toBe(A);
  f.setAuthError(true); await f.controller.reconcile();
  expect(f.controller.getSnapshot().account).toBeNull();
  expect(f.controller.getSnapshot().store).toBe(f.guest);
});

it('keeps passive hints through a failed SDK subscription and closes them only after successful installation', async () => {
  const f = delayed(); const subscribe = vi.spyOn(f.authClient.auth, 'onAuthStateChange');
  subscribe.mockImplementationOnce(() => { throw new Error('listener unavailable'); });
  f.setAccount(A); await f.controller.start(); f.held.resolve(f.factory); await settle();
  expect(f.closeHints).not.toHaveBeenCalled();
  expect(f.controller.getSnapshot().account.id).toBe(A);
  await f.controller.reconcile(); await waitFor(() => expect(subscribe).toHaveBeenCalledTimes(2));
  expect(f.closeHints).toHaveBeenCalledTimes(1);
  await f.controller.reconcile(); expect(subscribe).toHaveBeenCalledTimes(2);
});
