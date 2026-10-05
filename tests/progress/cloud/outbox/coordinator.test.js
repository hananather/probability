import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAccountProgressStore } from '@/lib/progress/store';
import { createAccountSyncCoordinator } from '@/lib/progress/cloud/sync';
import { createEmptyCloudDocument } from '@/lib/progress/cloud/schema';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { ACCOUNT_A, ACCOUNT_B, ACTIVITY, DATE, OTHER_ACTIVITY, copy, uuid } from '../helpers';
import { environment, memoryPersistence } from '../../store/helpers';
const resources = []; let sequence = 30000;
afterEach(() => resources.splice(0).reverse().forEach(item => item.dispose?.()));
function subject(db = memoryPersistence(), ownerScope = ACCOUNT_A) { const store = createAccountProgressStore({ ...environment(db), accountId: ownerScope.slice(8), deviceId: 'device-one', createId: () => uuid(++sequence) }); resources.push(store); return store; }
function server(ownerScope = ACCOUNT_A) {
  let document = createEmptyCloudDocument({ ownerScope }); let revision = 0;
  const result = outcomes => ({ accountId: ownerScope.slice(8), ownerScope, document: copy(document), revision, updatedAt: DATE, outcomes });
  return {
    read: vi.fn(async () => result([])),
    write: vi.fn(async ({ expectedAccountId, mutations }) => {
      if (expectedAccountId !== ownerScope.slice(8)) throw new Error('Wrong account');
      const outcomes = [];
      for (const item of mutations) { const reduced = applyCloudMutation(document, item, { verifiedOwnerScope: ownerScope }); document = reduced.document; outcomes.push({ id: item.id, digest: item.digest, ...reduced.outcome }); }
      revision++; return result(outcomes);
    }),
    get document() { return copy(document); },
  };
}
function coordinator(store, transport, options = {}) { const result = createAccountSyncCoordinator({ store, transport, accountId: ACCOUNT_A.slice(8), generation: 1, ...options }); resources.push(result); return result; }
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }

describe('account sync request ownership and replay', () => {
  it('downloads acknowledged base, uploads original mutations, and distinguishes local persistence from server acknowledgment', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const original = (await store.getCloudBatch())[0]; const transport = server(); const sync = coordinator(store, transport);
    expect(await sync.sync()).toBe(true); expect(transport.write.mock.calls[0][0].mutations).toEqual([original]); expect(transport.write.mock.calls[0][0].expectedAccountId).toBe(ACCOUNT_A.slice(8));
    expect(store.getSnapshot().cloud.status).toBe('synced'); expect(await store.getCloudBatch()).toEqual([]); expect(transport.document.facts.activities[ACTIVITY]).toBeDefined();
  });
  it('network failure after server commit survives restart and GET receipts acknowledge without re-applying facts', async () => {
    const db = memoryPersistence(); const store = subject(db); await store.completeActivity(ACTIVITY); const transport = server(); const write = transport.write;
    transport.write = vi.fn(async request => { await write(request); throw new Error('Response lost'); }); const sync = coordinator(store, transport);
    expect(await sync.sync()).toBe(false); expect(await store.getCloudBatch()).toHaveLength(1); expect(store.getSnapshot().cloud.status).toBe('offline');
    const restarted = subject(db); transport.write = write; const retry = coordinator(restarted, transport); expect(await retry.sync()).toBe(true);
    expect(await restarted.getCloudBatch()).toEqual([]); expect(write).toHaveBeenCalledTimes(1); expect(transport.document.facts.activities[ACTIVITY].evidence).toHaveLength(1);
  });
  it('held account-A response after detach cannot update A or bind account B', async () => {
    const db = memoryPersistence(); const a = subject(db); const b = subject(db, ACCOUNT_B); await a.completeActivity(ACTIVITY); await b.hydrate();
    const transport = server(); const held = deferred(); const started = deferred(); const realRead = transport.read;
    transport.read = vi.fn(async () => { started.resolve(); await held.promise; return realRead(); }); const sync = coordinator(a, transport);
    const before = copy(db.records.get(ACCOUNT_A)); const work = sync.sync(); await started.promise; sync.detach(); held.resolve(); expect(await work).toBe(false);
    expect(db.records.get(ACCOUNT_A)).toEqual(before); expect(b.getSnapshot().data.activities).toEqual({}); expect(b.getSnapshot().data.ownerScope).toBe(ACCOUNT_B); expect(transport.write).not.toHaveBeenCalled();
  });
  it('an identity generation change rejects an in-flight response even if AbortSignal is ignored', async () => {
    const store = subject(); await store.hydrate(); const transport = server(); const held = deferred(); const started = deferred(); let generation = 1;
    transport.read = vi.fn(async () => { started.resolve(); await held.promise; return server().read(); }); const sync = coordinator(store, transport, { isCurrent: identity => identity.generation === generation });
    const work = sync.sync(); await started.promise; generation = 2; held.resolve(); expect(await work).toBe(false); expect(store.getSnapshot().cloud.remoteRevision).toBe(null);
  });
  it('rejects foreign owner responses before persistence or publication', async () => {
    const db = memoryPersistence(); const store = subject(db); await store.completeActivity(ACTIVITY); const before = copy(db.records.get(ACCOUNT_A)); const foreign = server(ACCOUNT_B); const sync = coordinator(store, foreign);
    expect(await sync.sync()).toBe(false); expect(db.records.get(ACCOUNT_A)).toEqual(before); expect(store.getSnapshot().error).toBe(null); expect(store.getSnapshot().cloud.error).toContain('Invalid account server response');
    expect(JSON.stringify(await store.exportProgress())).not.toContain(ACCOUNT_B);
  });
  it('guards identity again inside the durable acknowledgment transaction', async () => {
    const db = memoryPersistence(); const store = subject(db); await store.completeActivity(ACTIVITY); const transport = server(); let active = true;
    const response = await transport.read(); const originalUpdate = db.update; let intercept = true;
    db.update = (scope, reducer) => originalUpdate(scope, record => { if (intercept) { active = false; intercept = false; } return reducer(record); });
    const before = copy(db.records.get(ACCOUNT_A)); expect(await store.acceptCloudResponse(response, { isCurrent: () => active })).toBe(false); expect(db.records.get(ACCOUNT_A)).toEqual(before);
  });
  it('retains original outbox on 413 capacity and 429 network backoff errors', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const original = await store.getCloudBatch(); const transport = server(); transport.write = vi.fn(async () => { const error = new Error('Account history is full'); error.status = 413; throw error; });
    const sync = coordinator(store, transport); expect(await sync.sync()).toBe(false); expect(store.getSnapshot().cloud.status).toBe('capacity'); expect(await store.getCloudBatch()).toEqual(original);
    transport.write = vi.fn(async () => { const error = new Error('Try later'); error.status = 429; error.retryAfterMs = 60000; throw error; }); expect(await sync.retry()).toBe(false); expect(await store.getCloudBatch()).toEqual(original); expect(transport.write).toHaveBeenCalledTimes(1);
  });
  it('does not delete originals when a server response omits receipts or mismatches digest', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const original = await store.getCloudBatch(); const transport = server(); transport.write = vi.fn(async () => transport.read());
    const sync = coordinator(store, transport); expect(await sync.sync()).toBe(false); expect(await store.getCloudBatch()).toEqual(original); expect(store.getSnapshot().cloud.error).toContain('did not acknowledge');
    const committed = await server().write({ expectedAccountId: ACCOUNT_A.slice(8), mutations: original }); committed.document.receipts[original[0].id].digest = 'a'.repeat(64); committed.outcomes = [];
    await expect(store.acceptCloudResponse(committed)).rejects.toThrow('original payload'); expect(await store.getCloudBatch()).toEqual(original);
  });
  it('automatic subscriptions respect network retry cooldown while explicit retry remains available', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const transport = server(); transport.read = vi.fn(async () => { const error = new Error('Rate limited'); error.status = 429; error.retryAfterMs = 60000; throw error; });
    const sync = coordinator(store, transport); expect(await sync.start()).toBe(false); await store.completeActivity(OTHER_ACTIVITY); await Promise.resolve();
    expect(transport.read).toHaveBeenCalledTimes(1); expect(await sync.sync({ automatic: true })).toBe(false); expect(transport.read).toHaveBeenCalledTimes(1); expect(await sync.retry()).toBe(false); expect(transport.read).toHaveBeenCalledTimes(2);
  });
  it('does not restart requests on its own status publications, and start/detach subscribe exactly once', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const transport = server(); const sync = coordinator(store, transport);
    const a = sync.start(); const b = sync.start(); expect(a).toBe(b); await a; expect(transport.read).toHaveBeenCalledTimes(1); expect(transport.write).toHaveBeenCalledTimes(1);
    sync.detach(); await store.completeActivity(OTHER_ACTIVITY); await Promise.resolve(); expect(transport.read).toHaveBeenCalledTimes(1); expect(sync.isAttached()).toBe(false);
  });
  it.each(['hydrate', 'retryPersistence', 'acceptCloudResponse', 'getCloudBatch'])('detachment during awaited %s prevents later requests and syncing publications', async method => {
    const store = subject(); await store.completeActivity(ACTIVITY); const transport = server(); const held = deferred(); const started = deferred(); const original = store[method];
    store[method] = async (...args) => { started.resolve(); await held.promise; return original(...args); };
    const states = []; const publish = store.setCloudSyncState; store.setCloudSyncState = state => { states.push(state.status); return publish(state); };
    const sync = coordinator(store, transport); const work = sync.sync(); await started.promise; const beforeDetach = [...states]; sync.detach(); held.resolve();
    expect(await work).toBe(false); expect(states).toEqual(beforeDetach); expect(transport.write).not.toHaveBeenCalled();
    expect(transport.read).toHaveBeenCalledTimes(['acceptCloudResponse', 'getCloudBatch'].includes(method) ? 1 : 0); expect((await store.exportProgress()).cloud.outbox).toHaveLength(1);
  });
  it('detachment in a synchronous syncing subscriber prevents the first network request', async () => {
    const store = subject(); await store.hydrate(); const transport = server(); const sync = coordinator(store, transport);
    const unsubscribe = store.subscribe(() => { if (store.getSnapshot().cloud.status === 'syncing') sync.detach(); });
    expect(await sync.sync()).toBe(false); unsubscribe(); expect(transport.read).not.toHaveBeenCalled(); expect(transport.write).not.toHaveBeenCalled();
  });
  it('detachment while reading remaining batches after a write never publishes synced or starts another request', async () => {
    const store = subject(); await store.completeActivity(ACTIVITY); const transport = server(); const held = deferred(); const started = deferred(); const original = store.getCloudBatch; let calls = 0;
    store.getCloudBatch = async () => { if (++calls === 2) { started.resolve(); await held.promise; } return original(); };
    const states = []; const publish = store.setCloudSyncState; store.setCloudSyncState = state => { states.push(state.status); return publish(state); };
    const sync = coordinator(store, transport); const work = sync.sync(); await started.promise; const beforeDetach = [...states]; sync.detach(); held.resolve();
    expect(await work).toBe(false); expect(states).toEqual(beforeDetach); expect(transport.write).toHaveBeenCalledTimes(1); expect(await store.getCloudBatch()).toEqual([]);
  });
});
