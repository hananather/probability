import { afterEach, describe, expect, it, vi } from 'vitest';
import { createActiveProgressController, ACTIVE_PROGRESS_SERVER_SNAPSHOT } from '@/lib/progress/active';
import { getActiveProgressBinding } from '@/lib/progress/activeBinding';
import { A, B, ACTIVITY, activeFixture } from './helpers';
const fixtures = [];
const subject = options => { const fixture = activeFixture(options); fixtures.push(fixture); return fixture; };
afterEach(() => { fixtures.splice(0).forEach(fixture => fixture.dispose()); vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('verified active identity and captured progress binding', () => {
  it('has a deterministic SSR guest/loading snapshot without creating a store or reading browser identity', () => {
    const getGuestStore = vi.fn(); const getAuthClient = vi.fn();
    const controller = createActiveProgressController({ getGuestStore, getAuthClient });
    expect(controller.getSnapshot()).toBe(ACTIVE_PROGRESS_SERVER_SNAPSHOT);
    expect(controller.getServerSnapshot()).toBe(ACTIVE_PROGRESS_SERVER_SNAPSHOT);
    expect(getGuestStore).not.toHaveBeenCalled(); expect(getAuthClient).not.toHaveBeenCalled();
  });
  it('keeps public guest progress available when the actual browser auth client has no configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ''); vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', ''); vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const { getBrowserAuthClient } = await import('@/lib/auth/browser');
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ configured: false, status: 'guest', account: null }), { headers: { 'content-type': 'application/json' } }));
    const f = subject({ getAuthClient: getBrowserAuthClient, fetchImpl }); await f.controller.start();
    expect(f.controller.getSnapshot().configured).toBe(false); expect(f.controller.getSnapshot().account).toBeNull();
    expect(f.controller.getSnapshot().store).toBe(f.guest); expect(f.accounts.size).toBe(0);
    await f.guest.completeActivity(ACTIVITY); expect(f.controller.getSnapshot().state.data.activities[ACTIVITY]).toBeDefined();
    expect(fetchImpl).toHaveBeenCalledTimes(1); expect(fetchImpl.mock.calls[0][0]).toBe('/api/auth/session');
  });
  it('activates only verified account data and never transfers guest facts on sign-in', async () => {
    const f = subject(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A);
    const subscriptions = vi.spyOn(f.guest, 'subscribe');
    await f.controller.start();
    const active = f.controller.getSnapshot();
    expect(active.account.id).toBe(A); expect(active.state.data.ownerScope).toBe(`account:${A}`);
    expect(active.state.data.activities).toEqual({}); expect(f.remote.get(A).document.facts.activities).toEqual({});
    expect(f.guest.getSnapshot().data.activities[ACTIVITY]).toBeDefined(); expect(subscriptions).toHaveBeenCalledTimes(1);
  });
  it('publishes matching destination and store ownership atomically across activation and sign-out', async () => {
    const f = subject(); const bindings = []; f.controller.subscribe(() => bindings.push(f.controller.getSnapshot()));
    f.setAccount(A); await f.controller.start(); await f.controller.signOut();
    for (const binding of bindings) expect(binding.account ? binding.state.data.ownerScope : binding.state.data.ownerScope.startsWith('guest:')).toBe(binding.account ? `account:${binding.account.id}` : true);
  });
  it('detaches immediately on a different raw session hint but requires endpoint verification before activating B', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start();
    const prior = f.controller.getSnapshot(); f.setAuthError(true); f.emit('SIGNED_IN', B);
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.isCurrentBinding(prior.store, prior.generation)).toBe(false);
    await Promise.resolve(); await Promise.resolve();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.accounts.has(B)).toBe(false);
  });
  it('discards a held A remote response after sign-out and cannot publish it over the guest destination', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start();
    const a = f.accounts.get(A); const held = f.holdRemote(); const pending = f.controller.sync(); await held.entered.promise;
    expect(await f.controller.signOut()).toBe(true); held.gate.resolve(); expect(await pending).toBe(false);
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().store).toBe(f.guest);
    expect(a.getSnapshot().data.ownerScope).toBe(`account:${A}`);
  });
  it('discards a held verified-session response for A after a newer verified response activates B', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start(); const held = f.holdSession();
    const first = f.controller.reconcile(); await held.entered.promise;
    f.setAccount(B); expect(await f.controller.reconcile()).toBe(true);
    held.gate.resolve(); expect(await first).toBe(false);
    expect(f.controller.getSnapshot().account.id).toBe(B); expect(f.controller.getSnapshot().store).toBe(f.accounts.get(B));
  });
  it('expires the verified binding on its captured timer and does not extend it using raw SDK expiry metadata', async () => {
    const timers = new Map(); let sequence = 0;
    const f = subject({ schedule: (callback, delay) => { const id = ++sequence; timers.set(id, { callback, delay }); return id; }, cancel: id => timers.delete(id) });
    f.setAccount(A); await f.controller.start(); const old = f.controller.getSnapshot();
    expect([...timers.values()][0].delay).toBe(3600000);
    f.advanceTime(3600001); [...timers.values()][0].callback();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.isCurrentBinding(old.store, old.generation)).toBe(false);
    f.emit('TOKEN_REFRESHED', A); await Promise.resolve(); await Promise.resolve();
    expect(f.controller.getSnapshot().account).toBeNull();
  });
  it('expires captured binding checks synchronously when browser timers are throttled', async () => {
    const f = subject({ schedule: () => 1, cancel: () => {} }); f.setAccount(A); await f.controller.start();
    const captured = f.controller.getSnapshot(); f.advanceTime(3600001);
    expect(f.controller.isCurrentBinding(captured.store, captured.generation)).toBe(false);
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().store).toBe(f.guest);
  });
  it('blocks reconnect and a second sign-in transition while local sign-out remains in flight', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start(); const held = f.holdSignOut();
    const signout = f.controller.signOut(); await held.entered.promise;
    expect(f.controller.getSnapshot().signingOut).toBe(true); expect(f.controller.getSnapshot().account).toBeNull();
    expect(await f.controller.reconnect()).toBe(false); f.emit('SIGNED_IN', B);
    expect(f.accounts.has(B)).toBe(false);
    held.gate.resolve(); expect(await signout).toBe(true); expect(f.controller.getSnapshot().signingOut).toBe(false);
    expect(f.authClient.auth.signOut).not.toHaveBeenCalled();
  });
  it('keeps a verified unexpired exact account offline, then detaches when verification is no longer unexpired', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start(); f.setAuthError(true);
    expect(await f.controller.reconcile()).toBe(false); expect(f.controller.getSnapshot().account.id).toBe(A); expect(f.controller.getSnapshot().sessionStatus).toBe('offline');
    f.advanceTime(3600001); await f.controller.reconcile();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().store).toBe(f.guest);
  });
  it('does not retain account authority offline when a verified expiry is absent', async () => {
    const f = subject(); f.setAccount(A, null); await f.controller.start(); f.setAuthError(true); await f.controller.reconcile();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().store).toBe(f.guest);
  });
  it('detaches immediately when progress connectivity fails and no verified offline expiry exists', async () => {
    const f = subject(); f.setAccount(A, null); await f.controller.start(); f.setProgressError(true);
    expect(await f.controller.sync()).toBe(false);
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().sessionStatus).toBe('reconnect');
  });
  it('fails safe to guest if remote hydration fails before this account has an acknowledged cache', async () => {
    const f = subject(); f.setAccount(A); f.setProgressError(true); await f.controller.start();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().sessionStatus).toBe('unavailable');
    expect(f.accounts.get(A).getSnapshot().cloud.remoteRevision).toBeNull();
  });
  it('detaches to preserved guest data on failed sign-out without immediately reactivating the old cookies', async () => {
    const f = subject(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A); await f.controller.start(); f.setAuthError(true);
    expect(await f.controller.signOut()).toBe(false); f.setAuthError(false); f.emit('TOKEN_REFRESHED', A); f.eventTarget.dispatchEvent(new Event('focus'));
    await Promise.resolve(); await Promise.resolve();
    expect(f.controller.getSnapshot().account).toBeNull(); expect(f.controller.getSnapshot().state.data.activities[ACTIVITY]).toBeDefined();
    expect(f.controller.getSnapshot().sessionError).toContain('before refreshing');
    await f.controller.reconnect(); expect(f.controller.getSnapshot().account.id).toBe(A);
  });
  it('requires a preview with unchanged digest and original account context before guest transfer', async () => {
    const f = subject(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A); await f.controller.start();
    await expect(f.controller.confirmGuestTransfer('unreviewed')).rejects.toThrow('Review guest');
    const preview = await f.controller.previewGuestTransfer(); expect(preview.activities).toBe(1);
    await f.guest.completeActivity('chapter-2:random-variables');
    await expect(f.controller.confirmGuestTransfer(preview.digest)).rejects.toThrow('Guest progress changed');
    expect(f.accounts.get(A).getSnapshot().data.activities).toEqual({});
    const fresh = await f.controller.previewGuestTransfer(); expect(await f.controller.confirmGuestTransfer(fresh.digest)).toBe(true);
    expect(Object.keys(f.accounts.get(A).getSnapshot().data.activities)).toHaveLength(2); expect(Object.keys(f.guest.getSnapshot().data.activities)).toHaveLength(2);
  });
  it('does not transfer a preview selected for A into B after account switching', async () => {
    const f = subject(); await f.guest.completeActivity(ACTIVITY); f.setAccount(A); await f.controller.start(); const preview = await f.controller.previewGuestTransfer();
    f.setAccount(B); await f.controller.reconcile();
    await expect(f.controller.confirmGuestTransfer(preview.digest)).rejects.toThrow('Review guest');
    expect(f.accounts.get(A).getSnapshot().data.activities).toEqual({}); expect(f.accounts.get(B).getSnapshot().data.activities).toEqual({});
  });
  it('invalidates captured direct-service bindings and unsubscribes auth/events when stopped, then supports Strict Mode restart', async () => {
    const f = subject(); f.setAccount(A); await f.controller.start(); const binding = getActiveProgressBinding();
    f.controller.stop(); expect(binding.isCurrent()).toBe(false); expect(getActiveProgressBinding()).toBeNull();
    await f.controller.start(); expect(f.controller.getSnapshot().account.id).toBe(A); expect(getActiveProgressBinding().isCurrent()).toBe(true);
  });
});
