import { IDBFactory } from 'fake-indexeddb';
import { vi } from 'vitest';
import { createActiveProgressController } from '@/lib/progress/active';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { createAccountProgressStore, createProgressStore } from '@/lib/progress/store';
import { createEmptyCloudDocument } from '@/lib/progress/cloud/schema';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';

export const A = '11111111-1111-4111-8111-111111111111';
export const B = '22222222-2222-4222-8222-222222222222';
export const ACTIVITY = 'chapter-1:foundations:foundations';
export const copy = value => JSON.parse(JSON.stringify(value));
export const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function activeFixture(controllerOptions = {}) {
  const indexedDB = new IDBFactory();
  let time = Date.now();
  let verified = null;
  let authError = false;
  let progressError = false;
  let listener;
  let writeHold;
  let remoteHold;
  let sessionHold;
  let signOutHold;
  const requests = [];
  const accounts = new Map();
  const databases = new Map();
  const remote = new Map();
  const options = persistence => ({ persistence, deviceId: 'active-test-device', legacyStorage: null, importLegacy: false, eventTarget: new EventTarget(), document: new EventTarget(), broadcastFactory: () => null, pollInterval: 0 });
  const guestDb = createIndexedDbPersistence({ indexedDB, databaseName: 'active-guest' });
  const guest = createProgressStore({ ...options(guestDb), ownerScope: 'guest:active-test-device' });
  const createAccountStore = id => {
    const database = createIndexedDbPersistence({ indexedDB, databaseName: `active-${id}` });
    const originalUpdate = database.update;
    database.update = async (scope, reducer) => {
      const held = writeHold;
      if (held && scope === `account:${held.id}`) { writeHold = null; held.entered.resolve(); await held.gate.promise; }
      return originalUpdate(scope, reducer);
    };
    const store = createAccountProgressStore({ ...options(database), accountId: id });
    accounts.set(id, store); databases.set(id, database); return store;
  };
  const fetchImpl = vi.fn(async (path, options = {}) => {
    requests.push({ path, options, authority: verified?.id || null });
    if (path === '/api/auth/session') {
      if (authError) throw new Error('Controlled offline session request');
      const response = { configured: true, account: verified && copy(verified), status: verified ? 'authenticated' : 'guest' };
      const held = sessionHold;
      if (held) { sessionHold = null; held.entered.resolve(); await held.gate.promise; }
      return json(response);
    }
    if (path === '/api/auth/signout') {
      if (authError) return json({ error: 'auth-unavailable' }, 503);
      const body = JSON.parse(options.body);
      if (body.expectedAccountId !== verified?.id) return json({ error: 'account-mismatch' }, 409);
      const held = signOutHold;
      if (held) { signOutHold = null; held.entered.resolve(); await held.gate.promise; }
      verified = null; return json({ accountId: body.expectedAccountId, signedOut: true });
    }
    if (progressError) throw new Error('Controlled offline progress request');
    const body = options.body && JSON.parse(options.body);
    const id = body?.expectedAccountId || new URL(path, 'https://test.example').searchParams.get('expectedAccountId');
    if (verified?.id !== id) return json({ error: 'account-mismatch' }, 409);
    const ownerScope = `account:${id}`;
    if (!remote.has(id)) remote.set(id, { document: createEmptyCloudDocument({ ownerScope }), revision: 0 });
    const row = remote.get(id);
    const outcomes = [];
    if (body) {
      for (const mutation of body.mutations) { const reduced = applyCloudMutation(row.document, mutation, { verifiedOwnerScope: ownerScope }); row.document = reduced.document; outcomes.push({ id: mutation.id, digest: mutation.digest, ...reduced.outcome }); }
      row.revision++;
    }
    const response = { accountId: id, ownerScope, revision: row.revision, document: copy(row.document), outcomes, updatedAt: '2026-10-03T12:00:00.000Z' };
    const held = remoteHold;
    if (held && held.id === id) { remoteHold = null; held.entered.resolve(); await held.gate.promise; }
    return json(response);
  });
  const authClient = { auth: {
    onAuthStateChange: callback => { listener = callback; return { data: { subscription: { unsubscribe: () => { listener = null; } } } }; },
    stopAutoRefresh: vi.fn(async () => {}), signOut: vi.fn(async () => ({ error: null })),
  } };
  const eventTarget = new EventTarget();
  const controller = createActiveProgressController({ getGuestStore: () => guest, createAccountStore, getAuthClient: () => authClient, fetchImpl, eventTarget, now: () => time, ...controllerOptions });
  return {
    controller, guest, accounts, databases, remote, requests, fetchImpl, eventTarget, authClient,
    setAccount(id, expiresAt = time + 3600000) { verified = id ? { id, email: id === A ? 'alice@example.test' : 'bob@example.test', expiresAt } : null; },
    emit(event, id) { listener?.(event, id ? { user: { id }, expires_at: 9999999999 } : null); },
    setAuthError(value) { authError = value; }, setProgressError(value) { progressError = value; },
    advanceTime(value) { time += value; },
    holdWrite(id = A) { const hold = { id, gate: deferred(), entered: deferred() }; writeHold = hold; return hold; },
    holdRemote(id = A) { const hold = { id, gate: deferred(), entered: deferred() }; remoteHold = hold; return hold; },
    holdSession() { const hold = { gate: deferred(), entered: deferred() }; sessionHold = hold; return hold; },
    holdSignOut() { const hold = { gate: deferred(), entered: deferred() }; signOutHold = hold; return hold; },
    dispose() { controller.stop(); guest.dispose(); accounts.forEach(store => store.dispose()); },
  };
}
