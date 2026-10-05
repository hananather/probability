import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { createProgressStore } from '@/lib/progress/store';
import { environment } from './helpers';
import { answer, quizSession } from './typed-fixtures';

const resources = [];
function instance(factory, overrides = {}) {
  const adapter = createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' });
  const store = createProgressStore(environment(adapter, { legacyStorage: null, ...overrides }));
  resources.push(adapter, store); return { adapter, store };
}
afterEach(() => resources.splice(0).reverse().forEach(value => value.dispose ? value.dispose() : value.close()));
const quizId = 'chapter-1:quiz';
const savedSession = value => value.getSnapshot().data.resumeByDevice['device-one']?.[quizId]?.session;

describe('typed operations through IndexedDB transactions', () => {
  it('merges simultaneous disjoint answers, then commits one attempt and session tombstone atomically across connections', async () => {
    const factory = new IDBFactory(); const { store: a, adapter } = instance(factory); await a.hydrate();
    await a.beginQuizSession(1, quizSession(), { context: a.captureWriteContext(quizId) });
    const { store: b } = instance(factory); await b.hydrate();
    await Promise.all([
      a.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q1': answer(1) } }, { context: a.captureWriteContext(quizId) }),
      b.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q2': answer([1, 0]) } }, { context: b.captureWriteContext(quizId) }),
    ]);
    const context = a.captureWriteContext(quizId);
    await Promise.all([
      a.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context }),
      b.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context: b.captureWriteContext(quizId) }),
    ]);
    const stored = await adapter.read(a.getSnapshot().data.ownerScope);
    expect(Object.keys(stored.data.quizAttempts)).toEqual(['attempt-one']);
    expect(stored.data.quizAttempts['attempt-one'].percentage).toBe(100);
    expect(stored.data.resumeByDevice['device-one'][quizId]).toBeUndefined();
    expect(stored.closedQuizSessions['session-one']).toMatchObject({ reason: 'finished', attemptId: 'attempt-one' });
    const { store: reloaded } = instance(factory); await reloaded.hydrate();
    expect(reloaded.getSnapshot().data.quizAttempts).toEqual(stored.data.quizAttempts);
    expect(savedSession(reloaded)).toBeUndefined();
  });

  it('keeps a committed finish pending when readback fails and retries without a duplicate or session reopening', async () => {
    const factory = new IDBFactory(); const base = createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' });
    resources.push(base); let failRead = false;
    const persistence = { ...base, read(scope) { if (failRead) throw new Error('Readback failed'); return base.read(scope); } };
    const store = createProgressStore(environment(persistence, { legacyStorage: null })); resources.push(store); await store.hydrate();
    const context = store.captureWriteContext(quizId);
    await store.beginQuizSession(1, quizSession(), { context }); failRead = true;
    expect(await store.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one', answersByQuestionId: { 'ch1-q1': answer(1) } }, { context })).toMatchObject({ applied: true, persisted: false });
    expect(store.getSnapshot().pendingLocalWrites).toBe(1);
    expect((await base.read(store.getSnapshot().data.ownerScope)).data.quizAttempts['attempt-one'].percentage).toBe(50);
    failRead = false; expect(await store.retryPersistence()).toBe(true);
    expect(store.getSnapshot().pendingLocalWrites).toBe(0);
    expect(Object.keys((await base.read(store.getSnapshot().data.ownerScope)).data.quizAttempts)).toHaveLength(1);
    expect(savedSession(store)).toBeUndefined();
  });

  it('retains scoped reset checkpoints across reload and rejects a delayed callback token from another connection', async () => {
    const factory = new IDBFactory(); const { store: a } = instance(factory); await a.hydrate();
    const child = 'chapter-1:foundations:foundations'; const sibling = 'chapter-1:foundations:worked-examples';
    const context = a.captureWriteContext(child); await a.completeActivity(child, { context }); await a.completeActivity(sibling);
    const { store: b } = instance(factory); await b.hydrate(); await b.resetActivity(child, { context: b.captureWriteContext(child) });
    expect(await a.completeActivity(child, { context })).toBe(false);
    const { store: reloaded } = instance(factory); await reloaded.hydrate();
    expect(reloaded.getSnapshot().data.activities[child]).toBeUndefined();
    expect(reloaded.getSnapshot().data.activities[sibling]).toBeDefined();
    expect(reloaded.getSnapshot().writeContext.containerEpochs[child]).toBe(1);
    expect((await reloaded.exportProgress()).recovery.at(-1).reason).toBe('write-predates-reset');
  });
});
