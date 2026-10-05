import { afterEach, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createAccountProgressStore } from '@/lib/progress/store';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { captureCloudWriteContext, createCloudMutation, createEmptyCloudDocument, validateCloudMutation } from '@/lib/progress/cloud/schema';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { projectCloudQuizAttempt } from '@/lib/progress/cloud/projection';
import { seedRetainedQuiz } from './retained-fixtures';
import { ACCOUNT_A, ACCOUNT_B, ACTIVITY, OTHER_ACTIVITY, copy, uuid } from '../helpers';

const resources = []; let next = 400000;
afterEach(() => resources.splice(0).forEach(store => store.dispose()));
function fixture(factory = new IDBFactory()) {
  const persistence = createIndexedDbPersistence({ indexedDB: factory });
  const store = createAccountProgressStore({ persistence, accountId: ACCOUNT_A.slice(8), deviceId: 'retained-device', createId: () => uuid(++next), legacyStorage: null, importLegacy: false, pollInterval: 0, eventTarget: new EventTarget(), document: new EventTarget(), broadcastFactory: () => null });
  resources.push(store); return { persistence, store, factory };
}
const response = (document, revision = 0) => ({ accountId: ACCOUNT_A.slice(8), ownerScope: ACCOUNT_A, document, revision, outcomes: [], updatedAt: new Date().toISOString() });
const retry = store => store.retryRetainedQuizUpdates({ isCurrent: () => true });

it('restarts a native-shaped 18-question blocked original, explicitly queues its exact UUID/context, retains its original bank archive and acknowledges idempotently', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  const restarted = fixture(f.factory).store; await restarted.hydrate();
  expect(await restarted.getCloudBatch()).toEqual([]);
  expect(restarted.getSnapshot().cloud.retryableQuizUpdates).toBe(1);
  expect(await retry(restarted)).toEqual({ queued: 1, persisted: true });
  const [mutation] = await restarted.getCloudBatch();
  expect(mutation.id).toBe(seeded.originalId); expect(mutation.context).toEqual(seeded.context.cloud);
  expect(mutation.payload.attempt).toEqual(projectCloudQuizAttempt(seeded.attempt));
  expect(validateCloudMutation(mutation).valid).toBe(true);
  const backup = await restarted.exportProgress(); expect(backup.accountBlocked[0]).toEqual(seeded.branch);
  expect(backup.recovery[0].message).toBe(seeded.message); expect(backup.accountBlocked[0].snapshot.quizAttempts[seeded.attempt.id].bank.questions[0].helpLink).toBeTruthy();
  expect(await retry(restarted)).toEqual({ queued: 0, persisted: true });
  expect(await restarted.getCloudBatch()).toEqual([mutation]);
  const committed = applyCloudMutation(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), mutation, { verifiedOwnerScope: ACCOUNT_A }).document;
  await restarted.acceptCloudResponse(response(committed, 1));
  expect(await restarted.getCloudBatch()).toEqual([]);
  expect(applyCloudMutation(committed, mutation, { verifiedOwnerScope: ACCOUNT_A }).outcome.duplicate).toBe(true);
  const final = fixture(f.factory).store; await final.hydrate();
  expect(final.getSnapshot().data.quizAttempts[seeded.attempt.id].percentage).toBe(6);
  expect(final.getSnapshot().cloud.blockedMutations).toBe(0);
  expect((await final.exportProgress()).accountBlocked[0]).toEqual(seeded.branch);
});

it('queues the original stale reset lineage and receives a rejection receipt without resurrecting attainment after reload', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  const empty = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
  const reset = createCloudMutation({ id: uuid(++next), deviceId: 'other-device', type: 'reset', context: captureCloudWriteContext(empty, 'chapter-4:quiz'), payload: { scope: 'quiz', targetId: 'chapter-4:quiz' } });
  const resetDoc = applyCloudMutation(empty, reset, { verifiedOwnerScope: ACCOUNT_A }).document;
  await f.store.acceptCloudResponse(response(resetDoc, 1));
  expect(f.store.getSnapshot().data.quizAttempts).toEqual({});
  expect(await retry(f.store)).toEqual({ queued: 1, persisted: true });
  const [mutation] = await f.store.getCloudBatch(); expect(mutation.context).toEqual(seeded.context.cloud);
  expect(f.store.getSnapshot().data.quizAttempts).toEqual({});
  const rejected = applyCloudMutation(resetDoc, mutation, { verifiedOwnerScope: ACCOUNT_A });
  expect(rejected.outcome).toMatchObject({ status: 'rejected', reason: 'write-predates-reset' });
  // A response lost before local acknowledgement leaves the same original in
  // the durable outbox, and replay receives the same receipt.
  const restarted = fixture(f.factory).store; await restarted.hydrate();
  expect(await restarted.getCloudBatch()).toEqual([mutation]);
  expect(applyCloudMutation(rejected.document, mutation, { verifiedOwnerScope: ACCOUNT_A }).outcome.duplicate).toBe(true);
  await restarted.acceptCloudResponse(response(rejected.document, 2));
  expect(restarted.getSnapshot().data.quizAttempts).toEqual({}); expect(restarted.getSnapshot().cloud.rejectedMutations).toBe(1);
  expect((await restarted.exportProgress()).accountBlocked[0]).toEqual(seeded.branch);
});

it('refuses a newer retained-branch reset lineage that contradicts its original operation lineage', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  const empty = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
  const reset = createCloudMutation({ id: uuid(++next), deviceId: 'other-device', type: 'reset', context: captureCloudWriteContext(empty, 'chapter-4:quiz'), payload: { scope: 'quiz', targetId: 'chapter-4:quiz' } });
  const resetDoc = applyCloudMutation(empty, reset, { verifiedOwnerScope: ACCOUNT_A }).document;
  await f.store.acceptCloudResponse(response(resetDoc, 1));
  await f.persistence.update(ACCOUNT_A, saved => {
    const record = copy(saved);
    record.accountBlocked[0].context = captureCloudWriteContext(resetDoc, 'chapter-4:quiz');
    return record;
  });
  expect(await retry(f.store)).toEqual({ queued: 0, persisted: true });
  expect(await f.store.getCloudBatch()).toEqual([]);
  const durable = await f.persistence.read(ACCOUNT_A);
  expect(durable.cloud.blocked).toHaveLength(1);
  expect(durable.accountBlocked[0].operation.cloudContext).toEqual(seeded.context.cloud);
});

it('lets independent valid study and new full-bank grades synchronize beside an oversized retained quiz without claiming the retained record was synchronized', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence, { oversized: true });
  expect(await retry(f.store)).toEqual({ queued: 0, persisted: true });
  await f.store.completeActivity(ACTIVITY);
  const session = copy(seeded.session); session.sessionId = 'new-valid-retake'; session.bank = copy((await seedOriginalBank()).bank);
  session.currentQuestionId = session.bank.questions[0].id; session.answersByQuestionId = {};
  const context = f.store.captureWriteContext('chapter-4:quiz');
  expect((await f.store.beginQuizSession(4, session, { context })).applied).toBe(true);
  expect((await f.store.finishQuizAttempt(4, { sessionId: session.sessionId, attemptId: 'new-valid-grade' }, { context })).persisted).toBe(true);
  const mutations = await f.store.getCloudBatch(); expect(mutations.map(item => item.type)).toEqual(['complete', 'quiz-finish']);
  let doc = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
  for (const mutation of mutations) doc = applyCloudMutation(doc, mutation, { verifiedOwnerScope: ACCOUNT_A }).document;
  await f.store.acceptCloudResponse(response(doc, 1));
  expect(f.store.getSnapshot().cloud.blockedMutations).toBe(1); expect(f.store.getSnapshot().cloud.status).toBe('capacity');
  expect(f.store.getSnapshot().cloud.pendingMutations).toBe(0); expect(doc.facts.quizAttempts[seeded.attempt.id]).toBeUndefined();
  expect(doc.facts.quizAttempts['new-valid-grade']).toBeDefined();
  expect((await f.store.exportProgress()).accountBlocked[0]).toEqual(seeded.branch);
});
async function seedOriginalBank() { const f = fixture(); return (await seedRetainedQuiz(f.store, f.persistence)).session; }

it('cannot promote imported blocked banks or private facts into cloud mutations', async () => {
  const source = fixture(); const seeded = await seedRetainedQuiz(source.store, source.persistence);
  const backup = await source.store.exportProgress(); const target = fixture(); await target.store.hydrate();
  expect(await target.store.importProgress(backup)).toBe(true);
  expect(await retry(target.store)).toEqual({ queued: 0, persisted: true });
  expect(await target.store.getCloudBatch()).toEqual([]); expect(target.store.getSnapshot().data.quizAttempts).toEqual({});
  expect(JSON.parse((await target.store.exportProgress()).recovery.find(item => item.reason === 'imported-account-file').raw).accountBlocked[0]).toEqual(seeded.branch);
});

it('does not clear the block or queue an original when quota aborts the recovery transaction', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  const update = f.persistence.update; f.persistence.update = () => Promise.reject(new Error('Quota aborted'));
  expect(await retry(f.store)).toEqual({ queued: 0, persisted: false });
  expect((await f.persistence.read(ACCOUNT_A)).accountBlocked[0]).toEqual(seeded.branch);
  expect((await f.persistence.read(ACCOUNT_A)).cloud.blocked).toHaveLength(1);
  f.persistence.update = update;
  expect(await retry(f.store)).toEqual({ queued: 1, persisted: true });
});

it('does not advertise successful durability on a stale valid readback; the committed original can still be recovered on refresh', async () => {
  const f = fixture(); await seedRetainedQuiz(f.store, f.persistence);
  const prior = await f.persistence.read(ACCOUNT_A); const read = f.persistence.read;
  f.persistence.read = async () => copy(prior);
  expect(await retry(f.store)).toEqual({ queued: 0, persisted: false });
  f.persistence.read = read; await f.store.refresh();
  expect(await f.store.getCloudBatch()).toHaveLength(1); expect(f.store.getSnapshot().cloud.blockedMutations).toBe(0);
});

it('verifies a concurrent matching server receipt during recovery readback without requiring the original to remain pending', async () => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  const other = fixture(f.factory).store; await other.hydrate();
  const read = f.persistence.read; let acknowledged = false;
  f.persistence.read = async scope => {
    const row = await read(scope);
    if (!acknowledged && row.cloud.outbox.length) {
      acknowledged = true;
      const committed = applyCloudMutation(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), row.cloud.outbox[0], { verifiedOwnerScope: ACCOUNT_A }).document;
      await other.acceptCloudResponse(response(committed, 1));
    }
    return read(scope);
  };
  expect(await retry(f.store)).toEqual({ queued: 1, persisted: true });
  expect(await f.store.getCloudBatch()).toEqual([]);
  expect(f.store.getSnapshot().data.quizAttempts[seeded.attempt.id].percentage).toBe(6);
});

it.each(['owner', 'device'])('preserves a foreign %s durable record without retrying or rewriting it', async change => {
  const f = fixture(); await seedRetainedQuiz(f.store, f.persistence);
  await f.persistence.update(ACCOUNT_A, saved => { const record = copy(saved); record[change === 'owner' ? 'ownerScope' : 'deviceId'] = change === 'owner' ? ACCOUNT_B : 'foreign-device'; return record; });
  const original = await f.persistence.read(ACCOUNT_A);
  expect(await retry(f.store)).toEqual({ queued: 0, persisted: false });
  expect(await f.persistence.read(ACCOUNT_A)).toEqual(original);
});

it('does not bypass a non-additive blocked completion or label its unrelated local work as cloud-ready', async () => {
  const f = fixture(); const doc = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
  doc.facts.activities[ACTIVITY] = { activityId: ACTIVITY, evidence: Array.from({ length: 256 }, (_, index) => ({ id: `original-evidence-${index}`, kind: 'study-completed', sourceKey: 'prior-evidence', completedAt: null })) };
  await f.store.acceptCloudResponse(response(doc));
  await f.store.completeActivity(ACTIVITY);
  expect(f.store.getSnapshot().cloud.blockedMutations).toBe(1);
  await f.store.completeActivity(OTHER_ACTIVITY);
  expect(f.store.getSnapshot().cloud.pendingSyncAllowed).toBe(false);
  expect(await f.store.getCloudBatch()).toEqual([]);
  expect((await f.store.exportProgress()).accountBlocked.map(branch => branch.operation.type)).toEqual(['complete', 'complete']);
});

it('rejects behavioral quiz inputs before reading any getter and retains the strict cloud question contract', async () => {
  let calls = 0; const behavioral = {};
  Object.defineProperty(behavioral, 'legacy', { enumerable: true, get() { calls++; return false; } });
  expect(() => projectCloudQuizAttempt(behavioral)).toThrow('bounded JSON'); expect(calls).toBe(0);
  const f = fixture(); await seedRetainedQuiz(f.store, f.persistence); await retry(f.store);
  const [mutation] = await f.store.getCloudBatch();
  mutation.payload.attempt.bank.questions[0].unknownNested = { expression: 'unsupported' };
  expect(validateCloudMutation(mutation).valid).toBe(false);
});

it.each(['missing-applied', 'closure-mismatch', 'wrong-context', 'unsupported-reason'])('does not queue a retained record with %s', async change => {
  const f = fixture(); const seeded = await seedRetainedQuiz(f.store, f.persistence);
  await f.persistence.update(ACCOUNT_A, saved => {
    const record = copy(saved);
    if (change === 'missing-applied') delete record.appliedOperations[seeded.originalId];
    if (change === 'closure-mismatch') record.accountBlocked[0].closedQuizSessions[seeded.session.sessionId].operationId = uuid(++next);
    if (change === 'wrong-context') record.accountBlocked[0].context.containerId = null;
    if (change === 'unsupported-reason') record.cloud.blocked[0].reason = 'Unsupported retained payload';
    return record;
  });
  await f.store.refresh(); expect(await retry(f.store)).toEqual({ queued: 0, persisted: true });
  expect(await f.store.getCloudBatch()).toEqual([]); expect((await f.persistence.read(ACCOUNT_A)).cloud.blocked).toHaveLength(1);
});
