import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProgressStore } from '@/lib/progress/store';
import { createEmptyProgress, validateProgressSnapshot } from '@/lib/progress/schema';
import { selectCourseProgress, selectQuizProgress } from '@/lib/progress/selectors';
import { RAW_FIXTURES, ATTEMPT_FIXTURE } from '../migration/fixtures';
import { environment, memoryPersistence, storageWith } from './helpers';

const activeStores = [];
const store = options => { const value = createProgressStore(options); activeStores.push(value); return value; };
const first = 'chapter-1:foundations';
const second = 'chapter-1:probability-dictionary';
afterEach(() => { activeStores.splice(0).forEach(value => value.dispose()); vi.useRealTimers(); });

describe('atomic guest progress', () => {
  it('awaits hydration before the first write and uses a shared stable frozen snapshot', async () => {
    const db = memoryPersistence();
    let release;
    db.getIdentity = () => new Promise(resolve => { release = () => resolve(db.identity); });
    const subject = store(environment(db));
    expect(subject.getSnapshot()).toBe(subject.getServerSnapshot());
    const pending = subject.completeActivity(first);
    expect(db.writes).toBe(0);
    release(); await pending;
    expect(db.writes).toBe(2); // Initial observed source checkpoint, then completion.
    expect(subject.getSnapshot().data.activities[first]).toBeDefined();
    expect(subject.getSnapshot()).toBe(subject.getSnapshot());
    expect(Object.isFrozen(subject.getSnapshot().data.activities)).toBe(true);
    expect(subject.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('imports every documented legacy family, retains raw values and excludes unrelated private keys', async () => {
    const db = memoryPersistence();
    const legacyStorage = storageWith({ ...RAW_FIXTURES, analytics_session_id: 'private-session', other_secret: 'private-value' });
    const subject = store(environment(db, { legacyStorage }));
    await subject.hydrate();
    const exported = await subject.exportProgress();
    expect(selectCourseProgress(exported.snapshot).completedChapters).toBe(7);
    expect(Object.keys(exported.snapshot.migration.sources)).toHaveLength(Object.keys(RAW_FIXTURES).length);
    expect(exported.snapshot.migration.sources.chapter1Progress.raw).toBe(RAW_FIXTURES.chapter1Progress);
    expect(JSON.stringify(exported)).not.toContain('private-session');
    expect(legacyStorage.getItem('chapter1Progress')).toBe(RAW_FIXTURES.chapter1Progress);
    expect(validateProgressSnapshot(exported.snapshot).valid).toBe(true);
  });

  it('preserves simultaneous disjoint completions from two tabs without last-write loss', async () => {
    const db = memoryPersistence();
    // No legacy collection prevents fixed operation IDs being used for hydration.
    const a = store(environment(db, { legacyStorage: null, createId: () => 'left-completion' }));
    const b = store(environment(db, { legacyStorage: null, createId: () => 'right-completion' }));
    await Promise.all([a.hydrate(), b.hydrate()]);
    await Promise.all([a.completeActivity(first), b.completeActivity(second)]);
    await Promise.all([a.refresh(), b.refresh()]);
    expect(Object.keys(a.getSnapshot().data.activities).sort()).toEqual([first, second].sort());
    expect(a.getSnapshot().data).toEqual(b.getSnapshot().data);
  });

  it('keeps the seven published chapters and separate bonus denominator', async () => {
    const subject = store(environment(memoryPersistence()));
    await subject.completeActivity('chapter-6:hypothesis-game');
    const summary = selectCourseProgress(subject.getSnapshot().data);
    expect(summary.totalChapters).toBe(7);
    expect(summary.totalLessons).toBe(66);
    expect(summary.completedLessons).toBe(0);
  });

  it('keeps repeated completion events idempotent within the current reset generation', async () => {
    let time = 0;
    const subject = store(environment(memoryPersistence(), { now: () => `2026-10-03T12:00:0${time++}.000Z` }));
    await subject.completeActivity(first); await subject.completeActivity(first);
    expect(subject.getSnapshot().data.activities[first].evidence).toHaveLength(1);
    await subject.resetChapter(1); await subject.completeActivity(first);
    expect(subject.getSnapshot().data.activities[first].evidence).toHaveLength(1);
    expect(subject.getSnapshot().data.activities[first].evidence[0].completedAt).toBe('2026-10-03T12:00:02.000Z');
  });

  it('never claims cloud synchronization and validates narrow completion and resume writes', async () => {
    const subject = store(environment(memoryPersistence()));
    await expect(subject.completeActivity('not-a-lesson')).rejects.toThrow('Invalid activity');
    await expect(subject.completeActivity(first, { kind: 'knowledge-check-completed' })).rejects.toThrow('not a knowledge check');
    await expect(subject.setResume(first, { activityId: second, kind: 'tab' })).rejects.toThrow('Invalid resume');
    await subject.setResume(first, { activityId: `${first}:foundations`, kind: 'tab' });
    expect(subject.getSnapshot().data.sync).toEqual({ status: 'local', pendingMutationIds: [] });
    expect(subject.getSnapshot().data.resumeByDevice['device-one'][first].activityId).toBe(`${first}:foundations`);
    expect(subject.getSnapshot().data.activities[first]).toBeUndefined();
  });
});

describe('persistence failure recovery', () => {
  it('keeps a quota-failed completion exportable and retries it without duplication', async () => {
    const db = memoryPersistence();
    const subject = store(environment(db)); await subject.hydrate();
    db.failures.write = true;
    expect(await subject.completeActivity(first)).toBe(false);
    expect(subject.getSnapshot()).toMatchObject({ persistenceStatus: 'session-only', pendingLocalWrites: 1, error: 'Quota exceeded' });
    expect((await subject.exportProgress()).snapshot.activities[first]).toBeDefined();
    db.failures.write = false;
    expect(await subject.retryPersistence()).toBe(true);
    expect(subject.getSnapshot().pendingLocalWrites).toBe(0);
    expect(subject.getSnapshot().data.activities[first].evidence).toHaveLength(1);
  });

  it('requires verified readback and deduplicates a committed write when readback fails', async () => {
    const db = memoryPersistence();
    const subject = store(environment(db)); await subject.hydrate();
    db.failures.read = true;
    expect(await subject.completeActivity(first)).toBe(false);
    expect(db.records.get(db.identity.ownerScope).data.activities[first]).toBeDefined();
    expect(subject.getSnapshot().persistenceStatus).toBe('session-only');
    db.failures.read = false;
    await subject.retryPersistence();
    expect(subject.getSnapshot().data.activities[first].evidence).toHaveLength(1);
    expect(subject.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('ignores a failed broadcast after a verified durable write', async () => {
    const db = memoryPersistence(); const channel = { close() {}, postMessage() { throw new Error('Channel closed'); } };
    const subject = store(environment(db, { broadcastFactory: () => channel })); subject.subscribe(() => {});
    expect(await subject.completeActivity(first)).toBe(true);
    expect(subject.getSnapshot()).toMatchObject({ persistenceStatus: 'persisted', pendingLocalWrites: 0, error: null });
  });

  it('rejects missing or stale readback instead of marking a write persisted', async () => {
    const db = memoryPersistence();
    const subject = store(environment(db)); await subject.hydrate();
    db.failures.staleRead = true;
    await subject.completeActivity(first);
    expect(subject.getSnapshot().error).toBe('Progress write could not be verified');
    expect(subject.getSnapshot().pendingLocalWrites).toBe(1);
    db.failures.staleRead = false; await subject.retryPersistence();
    expect(subject.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('archives the exact corrupt record before replacing it with an empty normalized record', async () => {
    const db = memoryPersistence();
    const corrupt = { ownerScope: db.identity.ownerScope, deviceId: db.identity.deviceId, data: '{broken', extra: { old: 7 } };
    db.records.set(db.identity.ownerScope, corrupt);
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    const exported = await subject.exportProgress();
    expect(exported.recovery).toEqual([{ reason: 'invalid-stored-record', raw: JSON.stringify(corrupt) }]);
    expect(db.records.get(db.identity.ownerScope).recovery).toEqual(exported.recovery);
    expect(subject.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('leaves corrupt data untouched when its recovery backup cannot be written', async () => {
    const db = memoryPersistence();
    const corrupt = '{broken'; db.records.set(db.identity.ownerScope, corrupt); db.failures.write = true;
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    expect(db.records.get(db.identity.ownerScope)).toBe(corrupt);
    expect((await subject.exportProgress()).recovery[0].raw).toBe(JSON.stringify(corrupt));
    expect(subject.getSnapshot().persistenceStatus).toBe('session-only');
  });

  it('leaves unsupported structured data untouched rather than losing it in a JSON recovery backup', async () => {
    const db = memoryPersistence(); const corrupt = { oldBinary: new Uint8Array([1, 2, 3]) };
    db.read = async () => corrupt;
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    expect(subject.getSnapshot().error).toContain('original record was preserved');
    expect(db.writes).toBe(0);
    expect(corrupt.oldBinary).toEqual(new Uint8Array([1, 2, 3]));
    await expect(subject.importProgress({ snapshot: createEmptyProgress(db.identity), unsupported: undefined })).rejects.toThrow('only JSON values');
  });

  it('retains an unconfirmed guest identity in memory without silently rebinding it on retry', async () => {
    const db = memoryPersistence(); db.failures.identity = true;
    const subject = store(environment(db)); await subject.hydrate();
    const owner = subject.getSnapshot().data.ownerScope;
    await subject.completeActivity(first);
    db.failures.identity = false;
    expect(await subject.retryPersistence()).toBe(false);
    expect(subject.getSnapshot().data.ownerScope).toBe(owner);
    expect(db.writes).toBe(0);
    expect((await subject.exportProgress()).snapshot.activities[first]).toBeDefined();
  });

  it('does not read stored cross-owner records into recovery exports or overwrite them', async () => {
    const db = memoryPersistence();
    const foreign = { ownerScope: 'guest:another-owner', deviceId: 'another-device', privateValue: 'foreign-private-value' };
    db.records.set(db.identity.ownerScope, foreign);
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    await subject.completeActivity(first);
    expect(subject.getSnapshot().error).toContain('another owner');
    expect(JSON.stringify(await subject.exportProgress())).not.toContain('foreign-private-value');
    expect(db.records.get(db.identity.ownerScope)).toEqual(foreign);
  });

  it('guards recognizable nested foreign ownership before archiving a malformed envelope', async () => {
    const db = memoryPersistence();
    const foreign = createEmptyProgress({ ownerScope: 'account:00000000-0000-0000-0000-000000000001', deviceId: 'foreign-device' });
    foreign.preferences.device.private = true;
    const malformed = { version: 1, data: foreign };
    db.records.set(db.identity.ownerScope, malformed);
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    expect(subject.getSnapshot().error).toContain('another owner');
    expect(JSON.stringify(await subject.exportProgress())).not.toContain('foreign-device');
    expect(db.records.get(db.identity.ownerScope)).toEqual(malformed);
  });

  it('retains confirmed identity in an export after the initial read and later write fail', async () => {
    const db = memoryPersistence(); db.failures.read = true; db.failures.write = true;
    const subject = store(environment(db, { legacyStorage: null })); await subject.hydrate();
    await subject.completeActivity(first);
    const exported = await subject.exportProgress();
    expect(exported.snapshot).toMatchObject(db.identity);
    expect(exported.snapshot.activities[first]).toBeDefined();
  });
});

describe('reset, legacy writers and import isolation', () => {
  it('keeps migration raw checkpoints through reset and reload, including changed arrays', async () => {
    const db = memoryPersistence();
    const legacyStorage = storageWith({ chapter1Progress: '["foundations"]' });
    const subject = store(environment(db, { legacyStorage })); await subject.hydrate();
    await subject.resetChapter(1);
    expect(subject.getSnapshot().data.activities[first]).toBeUndefined();
    await subject.refreshLegacy();
    expect(subject.getSnapshot().data.activities[first]).toBeUndefined();
    legacyStorage.setItem('chapter1Progress', '["foundations","probability-dictionary"]');
    await subject.refreshLegacy();
    expect(subject.getSnapshot().data.activities[first]).toBeUndefined();
    expect(subject.getSnapshot().data.activities[second]).toBeDefined();
    const reloaded = store(environment(db, { legacyStorage })); await reloaded.hydrate();
    expect(reloaded.getSnapshot().data.activities[first]).toBeUndefined();
    expect(reloaded.getSnapshot().data.activities[second]).toBeDefined();
    expect(reloaded.getSnapshot().data.migration.sources.chapter1Progress.previous).toContainEqual(expect.objectContaining({ raw: '["foundations"]' }));
  });

  it('observes removals before a later fresh legacy completion without deleting recovery history', async () => {
    const db = memoryPersistence(); const legacyStorage = storageWith({ chapter1Progress: '["foundations"]' });
    const subject = store(environment(db, { legacyStorage })); await subject.hydrate(); await subject.resetAll();
    legacyStorage.removeItem('chapter1Progress'); await subject.refreshLegacy();
    legacyStorage.setItem('chapter1Progress', '["foundations"]'); await subject.refreshLegacy();
    expect(subject.getSnapshot().data.activities[first]).toBeDefined();
    expect(subject.getSnapshot().data.migration.sources.chapter1Progress.raw).toBe('["foundations"]');
  });

  it('rejects stale pending typed writes after another tab resets while retaining their recovery record', async () => {
    const db = memoryPersistence();
    const left = store(environment(db, { legacyStorage: null, createId: () => 'stale-left' }));
    const right = store(environment(db, { legacyStorage: null, createId: () => 'reset-right' }));
    await Promise.all([left.hydrate(), right.hydrate()]);
    db.failures.write = true; await left.completeActivity(first);
    db.failures.write = false; await right.resetChapter(1);
    await left.retryPersistence();
    expect(left.getSnapshot().data.activities[first]).toBeUndefined();
    expect((await left.exportProgress()).recovery).toContainEqual(expect.objectContaining({ reason: 'write-predates-reset', operation: expect.objectContaining({ activityId: first }) }));
  });

  it('imports only new legacy attempts and preserves historical best scores after reset', async () => {
    const db = memoryPersistence(); const legacyStorage = storageWith({ quiz_attempts: JSON.stringify({ 1: [ATTEMPT_FIXTURE] }), quiz_best_scores: '{"1":90}' });
    const subject = store(environment(db, { legacyStorage })); await subject.hydrate();
    expect(selectQuizProgress(subject.getSnapshot().data, 1).bestScore).toBe(90);
    await subject.resetChapter(1);
    legacyStorage.setItem('quiz_attempts', JSON.stringify({ 1: [ATTEMPT_FIXTURE, { ...ATTEMPT_FIXTURE, id: 'new', percentage: 50 }] }));
    await subject.refreshLegacy();
    expect(Object.values(subject.getSnapshot().data.quizAttempts)).toHaveLength(1);
    expect(selectQuizProgress(subject.getSnapshot().data, 1).bestScore).toBe(50);
    expect(subject.getSnapshot().data.legacyBestScores['chapter-1']).toBeUndefined();
  });

  it('preserves invalid JSON for recovery while ingesting later corrected legacy input', async () => {
    const db = memoryPersistence(); const legacyStorage = storageWith({ chapter1Progress: '{bad', 'probability:resume:section:/chapter1:test': '{broken' });
    const subject = store(environment(db, { legacyStorage })); await subject.hydrate();
    expect(subject.getSnapshot().data.unattributedLegacy.chapter1Progress.raw).toBe('{bad');
    legacyStorage.setItem('chapter1Progress', '["foundations"]'); await subject.refreshLegacy();
    expect(subject.getSnapshot().data.activities[first]).toBeDefined();
    expect(subject.getSnapshot().data.migration.sources.chapter1Progress.previous[0].raw).toBe('{bad');
  });

  it('claims old global legacy keys only for the first guest and never for account scopes', async () => {
    const db = memoryPersistence(); const legacyStorage = storageWith({ chapter1Progress: '["foundations"]' });
    const guest = store(environment(db, { legacyStorage })); await guest.hydrate();
    const another = store(environment(db, { legacyStorage, ownerScope: 'guest:two', deviceId: 'two' })); await another.hydrate();
    const account = store(environment(db, { legacyStorage, ownerScope: 'account:00000000-0000-0000-0000-000000000001', deviceId: 'device-one' })); await account.hydrate();
    expect(guest.getSnapshot().data.activities[first]).toBeDefined();
    expect(another.getSnapshot().data.activities).toEqual({});
    expect(account.getSnapshot().data.activities).toEqual({});
  });

  it('requires explicit guest transfer, merges rather than replaces and rejects account ownership changes', async () => {
    const db = memoryPersistence(); const subject = store(environment(db)); await subject.completeActivity(first);
    const incoming = createEmptyProgress({ ownerScope: 'guest:old-device', deviceId: 'old-device' });
    incoming.activities[second] = { activityId: second, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'manual', completedAt: null }] };
    await expect(subject.importProgress({ snapshot: incoming })).rejects.toThrow('across owners');
    await subject.importProgress({ snapshot: incoming }, { allowGuestTransfer: true });
    expect(Object.keys(subject.getSnapshot().data.activities).sort()).toEqual([first, second].sort());
    incoming.ownerScope = 'account:00000000-0000-0000-0000-000000000001';
    await expect(subject.importProgress({ snapshot: incoming }, { allowGuestTransfer: true })).rejects.toThrow('across owners');
    expect((await subject.exportProgress()).recovery[0].reason).toBe('imported-file');
  });

  it('filters a pending imported chapter against another tab reset and preserves unaffected imported chapters', async () => {
    const db = memoryPersistence();
    const subject = store(environment(db, { legacyStorage: null, createId: () => 'import-operation' }));
    const other = store(environment(db, { legacyStorage: null, createId: () => 'reset-operation' }));
    await Promise.all([subject.hydrate(), other.hydrate()]);
    const incoming = createEmptyProgress(db.identity);
    for (const activityId of [first, 'chapter-2:random-variables']) incoming.activities[activityId] = { activityId, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'manual', completedAt: null }] };
    db.failures.write = true; await subject.importProgress({ snapshot: incoming });
    db.failures.write = false; await other.resetChapter(1); await subject.retryPersistence();
    expect(subject.getSnapshot().data.activities[first]).toBeUndefined();
    expect(subject.getSnapshot().data.activities['chapter-2:random-variables']).toBeDefined();
    expect((await subject.exportProgress()).recovery).toContainEqual({ reason: 'import-predates-chapter-reset', operationId: 'import-operation', chapterIds: ['chapter-1'] });
    expect((await subject.exportProgress()).recovery).toContainEqual(expect.objectContaining({ reason: 'imported-file', raw: JSON.stringify({ snapshot: incoming }) }));
  });

  it('imports an old service file without trusting its userId or inventing current lesson completion', async () => {
    const subject = store(environment(memoryPersistence()));
    await subject.importProgress({ meta: { userId: 'foreign-account' }, progress: { 'chapter-1': { status: 'completed', progress: 100, completedSections: ['1-0'], score: 0 } } });
    expect(subject.getSnapshot().data.ownerScope).toBe('guest:device-one');
    expect(subject.getSnapshot().data.chaptersLegacy['chapter-1'].score).toBe(0);
    expect(subject.getSnapshot().data.activities).toEqual({});
    expect(subject.getSnapshot().data.unattributedLegacy.probLabProgress.issues).toContain('unrecognized-chapter-section');
    expect(selectCourseProgress(subject.getSnapshot().data).completedChapters).toBe(0);
  });

  it('validates chapter patches and preserves monotone history without letting starts downgrade completion', async () => {
    const subject = store(environment(memoryPersistence()));
    await subject.updateChapter(1, { status: 'completed', timeSpent: 10, score: 0 });
    await subject.updateChapter(1, { status: 'in_progress', timeSpent: 3 });
    expect(subject.getSnapshot().data.chaptersLegacy['chapter-1']).toMatchObject({ status: 'completed', timeSpent: 10, score: 0 });
    await expect(subject.updateChapter(1, { completedSections: ['1-0'] })).rejects.toThrow('Unrecognized');
    await expect(subject.updateChapter(1, { progress: 101 })).rejects.toThrow('Invalid chapter field');
    await subject.updateChapter(1, { completedSections: ['foundations'] });
    expect(subject.getSnapshot().data.activities[first]).toBeDefined();
  });
});

describe('shared subscriptions and cleanup', () => {
  it('subscribes once per store and cleans listeners and visible polling when the final reader leaves', async () => {
    vi.useFakeTimers();
    const db = memoryPersistence(); const eventTarget = new EventTarget(); const page = new EventTarget();
    Object.defineProperty(page, 'visibilityState', { value: 'visible', writable: true });
    const add = vi.spyOn(eventTarget, 'addEventListener'); const remove = vi.spyOn(eventTarget, 'removeEventListener');
    const channel = { postMessage: vi.fn(), close: vi.fn() };
    const subject = store(environment(db, { eventTarget, document: page, pollInterval: 1000, broadcastFactory: () => channel }));
    const a = vi.fn(); const b = vi.fn(); const unsubscribeA = subject.subscribe(a); const unsubscribeB = subject.subscribe(b);
    await subject.hydrate();
    expect(add).toHaveBeenCalledTimes(2); expect(vi.getTimerCount()).toBe(1);
    page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange')); expect(vi.getTimerCount()).toBe(0);
    page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange')); expect(vi.getTimerCount()).toBe(1);
    unsubscribeA(); expect(remove).not.toHaveBeenCalled();
    unsubscribeB(); expect(remove).toHaveBeenCalledTimes(2); expect(vi.getTimerCount()).toBe(0); expect(channel.close).toHaveBeenCalledTimes(1);
    subject.dispose(); expect(() => subject.subscribe(() => {})).toThrow('disposed');
  });

  it('broadcasts only an invalidation identity and revision, never progress payloads', async () => {
    const db = memoryPersistence(); const channel = { postMessage: vi.fn(), close: vi.fn() };
    const subject = store(environment(db, { broadcastFactory: () => channel })); subject.subscribe(() => {});
    await subject.completeActivity(first);
    expect(channel.postMessage).toHaveBeenLastCalledWith({ ownerScope: 'guest:device-one', revision: subject.getSnapshot().revision });
    expect(JSON.stringify(channel.postMessage.mock.calls)).not.toContain('activities');
  });
});
