import { afterEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { createProgressStore, getLocalProgressStore } from '@/lib/progress/store';
import { createEmptyProgress } from '@/lib/progress/schema';
import { environment, storageWith } from './helpers';

const resources = [];
afterEach(() => { resources.splice(0).reverse().forEach(value => value.dispose ? value.dispose() : value.close()); vi.unstubAllGlobals(); });
function adapter(factory = new IDBFactory(), options = {}) {
  const persistence = createIndexedDbPersistence({ indexedDB: factory, createId: () => 'native-device', ...options });
  resources.push(persistence); return persistence;
}
function subject(persistence, options = {}) {
  const value = createProgressStore(environment(persistence, options)); resources.push(value); return value;
}

describe('real IndexedDB adapter transactions', () => {
  it('atomically generates one identity across independent connections and claims legacy keys once', async () => {
    const factory = new IDBFactory(); const a = adapter(factory); const b = adapter(factory, { createId: () => 'other-generated-device' });
    const identities = await Promise.all([a.getIdentity(), b.getIdentity()]);
    expect(identities[0]).toEqual(identities[1]);
    expect(identities[0]).toEqual({ ownerScope: 'guest:native-device', deviceId: 'native-device' });
    expect(await a.claimLegacyOwner(identities[0].ownerScope)).toBe(true);
    expect(await b.claimLegacyOwner('guest:another-profile')).toBe(false);
    expect(await b.claimLegacyOwner('account:00000000-0000-0000-0000-000000000001')).toBe(false);
  });

  it('serializes overlapping read/write reducers rather than losing disjoint updates', async () => {
    const factory = new IDBFactory(); const a = adapter(factory); const b = adapter(factory);
    const scope = 'guest:native-device';
    await Promise.all([a.update(scope, value => ({ ...value, one: true })), b.update(scope, value => ({ ...value, two: true }))]);
    expect(await a.read(scope)).toEqual({ one: true, two: true });
  });

  it('aborts a thrown reducer and a noncloneable write without replacing the previous record', async () => {
    const persistence = adapter(); const scope = 'guest:native-device';
    await persistence.update(scope, () => ({ preserved: 7 }));
    await expect(persistence.update(scope, () => { throw new Error('Reducer rejected'); })).rejects.toThrow('Reducer rejected');
    expect(await persistence.read(scope)).toEqual({ preserved: 7 });
    await expect(persistence.update(scope, () => ({ unsupported: () => {} }))).rejects.toThrow();
    expect(await persistence.read(scope)).toEqual({ preserved: 7 });
  });

  it('rejects asynchronous reducers before a transaction can write a partial record', async () => {
    const persistence = adapter(); const scope = 'guest:native-device';
    await persistence.update(scope, () => ({ preserved: true }));
    await expect(persistence.update(scope, async () => ({ dropped: true }))).rejects.toThrow('must be synchronous');
    expect(await persistence.read(scope)).toEqual({ preserved: true });
  });

  it('preserves JSON data through a closed connection and a later reopened read', async () => {
    const persistence = adapter(); const scope = 'guest:native-device';
    await persistence.update(scope, () => ({ history: [{ score: 0 }], exactRaw: '{broken' }));
    persistence.close();
    expect(await persistence.read(scope)).toEqual({ history: [{ score: 0 }], exactRaw: '{broken' });
  });
});

describe('guest store through IndexedDB', () => {
  it('keeps legacy userId arguments in isolated local guest profiles without ingesting old default data', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory());
    window.localStorage.setItem('chapter1Progress', '["foundations"]');
    const alice = getLocalProgressStore('alice-long-email-for-local-profile@example.test'); const bob = getLocalProgressStore('bob-native-test');
    resources.push(alice, bob);
    expect(getLocalProgressStore('alice-long-email-for-local-profile@example.test')).toBe(alice);
    await Promise.all([alice.hydrate(), bob.hydrate()]);
    expect(alice.getSnapshot().data.activities).toEqual({});
    await alice.completeActivity('chapter-2:random-variables'); await bob.refresh();
    expect(bob.getSnapshot().data.activities).toEqual({});
    expect(alice.getSnapshot().data.ownerScope).not.toBe(bob.getSnapshot().data.ownerScope);
    expect(alice.getSnapshot().data.ownerScope).toMatch(/^guest:/);
  });

  it('persists and read-verifies concurrent completions from two independent store instances', async () => {
    const factory = new IDBFactory();
    let left = 0; let right = 0;
    const a = subject(adapter(factory), { legacyStorage: null, createId: () => `left-${++left}` });
    const b = subject(adapter(factory), { legacyStorage: null, createId: () => `right-${++right}` });
    await Promise.all([a.hydrate(), b.hydrate()]);
    await Promise.all([a.completeActivity('chapter-1:foundations'), b.completeActivity('chapter-1:probability-dictionary')]);
    await Promise.all([a.refresh(), b.refresh()]);
    expect(Object.keys(a.getSnapshot().data.activities).sort()).toEqual(['chapter-1:foundations', 'chapter-1:probability-dictionary'].sort());
    expect(a.getSnapshot().data).toEqual(b.getSnapshot().data);
    expect(a.getSnapshot().persistenceStatus).toBe('persisted');
    const reloaded = subject(adapter(factory), { legacyStorage: null }); await reloaded.hydrate();
    expect(reloaded.getSnapshot().data).toEqual(a.getSnapshot().data);
  });

  it('keeps a committed write pending after readback failure and retries it exactly once', async () => {
    const persistence = adapter(); let failRead = false;
    const wrapped = { ...persistence, read(scope) { if (failRead) throw new Error('Readback denied'); return persistence.read(scope); } };
    const value = subject(wrapped, { legacyStorage: null }); await value.hydrate();
    failRead = true; expect(await value.completeActivity('chapter-2:random-variables')).toBe(false);
    expect(value.getSnapshot()).toMatchObject({ persistenceStatus: 'session-only', pendingLocalWrites: 1 });
    failRead = false; expect(await value.retryPersistence()).toBe(true);
    const stored = await persistence.read(value.getSnapshot().data.ownerScope);
    expect(stored.data.activities['chapter-2:random-variables'].evidence).toHaveLength(1);
    expect(value.getSnapshot()).toMatchObject({ persistenceStatus: 'persisted', pendingLocalWrites: 0 });
  });

  it('recovers exact corrupt JSON data and refuses nested foreign ownership without rewriting it', async () => {
    const persistence = adapter(); const identity = await persistence.getIdentity();
    await persistence.update(identity.ownerScope, () => '{broken');
    const value = subject(persistence, { legacyStorage: null }); await value.hydrate();
    expect((await value.exportProgress()).recovery).toEqual([{ reason: 'invalid-stored-record', raw: JSON.stringify('{broken') }]);
    value.dispose();
    const foreign = { version: 1, data: createEmptyProgress({ ownerScope: 'account:00000000-0000-0000-0000-000000000001', deviceId: 'foreign-device' }) };
    await persistence.update(identity.ownerScope, () => foreign);
    const guarded = subject(persistence, { legacyStorage: null }); await guarded.hydrate();
    expect(guarded.getSnapshot().error).toContain('another owner');
    expect(await persistence.read(identity.ownerScope)).toEqual(foreign);
    expect(JSON.stringify(await guarded.exportProgress())).not.toContain('foreign-device');
  });

  it('retains reset checkpoints and only ingests new legacy facts across IndexedDB reload', async () => {
    const factory = new IDBFactory(); const legacyStorage = storageWith({ chapter1Progress: '["foundations"]' });
    const value = subject(adapter(factory), { legacyStorage }); await value.hydrate(); await value.resetAll(); value.dispose();
    legacyStorage.setItem('chapter1Progress', '["foundations","probability-dictionary"]');
    const reloaded = subject(adapter(factory), { legacyStorage }); await reloaded.hydrate();
    expect(reloaded.getSnapshot().data.activities['chapter-1:foundations']).toBeUndefined();
    expect(reloaded.getSnapshot().data.activities['chapter-1:probability-dictionary']).toBeDefined();
    const exported = await reloaded.exportProgress();
    expect(exported.checkpoint.epoch).toBe(1);
    expect(exported.snapshot.migration.sources.chapter1Progress.previous).toContainEqual(expect.objectContaining({ raw: '["foundations"]' }));
  });
});
