import { afterEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createAccountProgressStore, createProgressStore } from '@/lib/progress/store';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { createGuestTransferPayload } from '@/lib/progress/cloud/projection';
import { captureCloudWriteContext, createCloudMutation, createEmptyCloudDocument, validateCloudMutation } from '@/lib/progress/cloud/schema';
import { createPinnedQuizAttempt } from '@/lib/progress/quizContract';
import { ACCOUNT_A, ACCOUNT_B, ACTIVITY, DATE, OTHER_ACTIVITY, complete, copy, guest, mutation, pinnedAttempt, uuid } from '../helpers';
import { environment, memoryPersistence } from '../../store/helpers';
import { BANK, START, quizSession } from '../../store/typed-fixtures';

const resources = []; let counter = 10000;
afterEach(() => resources.splice(0).reverse().forEach(item => item.dispose?.()));
function store(persistence = memoryPersistence(), overrides = {}) {
  const result = createAccountProgressStore({ ...environment(persistence), accountId: ACCOUNT_A.slice(8), deviceId: 'device-one', createId: () => uuid(++counter), ...overrides });
  resources.push(result); return result;
}
function response(doc = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), revision = 0, outcomes = []) { return { accountId: doc.ownerScope.slice(8), ownerScope: doc.ownerScope, document: doc, revision, updatedAt: DATE, outcomes }; }
function reduce(doc, mutation) { return applyCloudMutation(doc, mutation, { verifiedOwnerScope: doc.ownerScope }); }
function remoteReset(doc, scope = 'global', targetId = null) { return createCloudMutation({ id: uuid(++counter), deviceId: 'device-two', type: 'reset', context: captureCloudWriteContext(doc), payload: { scope, targetId } }); }
function adapter(factory) { return createIndexedDbPersistence({ indexedDB: factory, createId: () => 'device-one' }); }
async function finishOversized(subject, { sessionId = 'large-session', attemptId = 'large-attempt' } = {}) {
  await subject.hydrate(); const context = subject.captureWriteContext('chapter-1:quiz');
  const bank = { ...copy(BANK), questions: Array.from({ length: 10 }, (_, i) => ({ ...copy(BANK.questions[0]), id: `huge-${i}`, options: Array.from({ length: 20 }, () => 'x'.repeat(6000)) })) };
  await subject.beginQuizSession(1, quizSession({ sessionId, bank, currentQuestionId: bank.questions[0].id }), { context });
  const result = await subject.finishQuizAttempt(1, { sessionId, attemptId }, { context });
  expect(result.applied).toBe(true); expect(result.persisted).toBe(true); return bank;
}

describe('atomic account learning and cloud outbox', () => {
  it('normalizes account UUIDs and never uploads retained guest progress implicitly', async () => {
    const db = memoryPersistence(); const local = createProgressStore(environment(db)); resources.push(local);
    await local.completeActivity(ACTIVITY);
    const subject = store(db, { accountId: 'ABCDEF01-1234-4321-ABCD-123456789ABC' }); await subject.hydrate();
    expect(subject.getSnapshot().data.ownerScope).toBe('account:abcdef01-1234-4321-abcd-123456789abc');
    expect(subject.getSnapshot().data.activities).toEqual({}); expect(await subject.getCloudBatch()).toEqual([]);
    expect((await local.exportProgress()).snapshot.activities[ACTIVITY]).toBeDefined();
  });
  it('failed device identity stays account-bound and session-only without any upload authority', async () => {
    const db = memoryPersistence(); db.failures.identity = true;
    const subject = store(db, { deviceId: undefined }); await subject.hydrate();
    expect(subject.getSnapshot().data.ownerScope).toBe(ACCOUNT_A); expect(subject.getSnapshot().persistenceStatus).toBe('session-only');
    expect(await subject.completeActivity(ACTIVITY)).toBe(false); const exported = await subject.exportProgress();
    expect(exported.snapshot.ownerScope).toBe(ACCOUNT_A); expect(exported.snapshot.deviceId).toMatch(/^unverified-/); expect(exported.snapshot.activities[ACTIVITY]).toBeDefined(); expect(db.records.has(ACCOUNT_A)).toBe(false);
    await expect(subject.getCloudBatch()).rejects.toThrow('saved before uploading');
  });
  it('public account response and backup guards never execute JSON accessors', async () => {
    const subject = store(); await subject.hydrate(); let calls = 0; const hostile = {};
    Object.defineProperty(hostile, 'ownerScope', { enumerable: true, get() { calls++; return ACCOUNT_A; } });
    await expect(subject.acceptCloudResponse(hostile)).rejects.toThrow('Invalid account server response');
    await expect(subject.importProgress(hostile)).rejects.toThrow('JSON values'); expect(calls).toBe(0);
  });
  it('commits a fact and its original mutation in one real IndexedDB write, survives restart, and local acknowledgment leaves outbox', async () => {
    const factory = new IDBFactory(); const db = adapter(factory); const subject = store(db);
    await subject.hydrate(); const context = subject.captureWriteContext(ACTIVITY);
    expect(await subject.completeActivity(ACTIVITY, { context })).toBe(true);
    const stored = await db.read(ACCOUNT_A); expect(stored.data.activities[ACTIVITY]).toBeDefined(); expect(stored.cloud.outbox).toHaveLength(1);
    expect(stored.cloud.outbox[0].context).toEqual(context.cloud); expect(subject.getSnapshot().pendingLocalWrites).toBe(0);
    const restarted = store(adapter(factory)); await restarted.hydrate();
    expect(await restarted.getCloudBatch()).toEqual(stored.cloud.outbox);
  });
  it('accepts the real empty-GET to first-INSERT revision-zero boundary but rejects later same-revision rewrites', async () => {
    const subject = store(); await subject.completeActivity(ACTIVITY); const [mutation] = await subject.getCloudBatch(); const empty = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
    await subject.acceptCloudResponse({ ...response(empty, 0), updatedAt: null });
    const committed = reduce(empty, mutation).document; await subject.acceptCloudResponse(response(committed, 0));
    expect(await subject.getCloudBatch()).toEqual([]); expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeDefined();
    await expect(subject.acceptCloudResponse(response(empty, 0))).rejects.toThrow('without advancing');
    expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeDefined();
  });
  it('a real IndexedDB reducer abort cannot commit either the fact or its outbox and retry preserves its ID', async () => {
    const factory = new IDBFactory(); const db = adapter(factory); let abort = true; const update = db.update;
    db.update = (scope, reducer) => update(scope, value => { const result = reducer(value); if (abort) throw new Error('Transaction aborted by control'); return result; });
    const subject = store(db); await subject.hydrate(); expect(await subject.completeActivity(ACTIVITY)).toBe(false); const exported = await subject.exportProgress();
    expect(await db.read(ACCOUNT_A)).toBeUndefined(); expect(exported.cloud.outbox).toHaveLength(1); expect(exported.snapshot.activities[ACTIVITY]).toBeDefined();
    abort = false; expect(await subject.retryPersistence()).toBe(true); const stored = await db.read(ACCOUNT_A); expect(stored.cloud.outbox).toEqual(exported.cloud.outbox); expect(stored.data.activities[ACTIVITY]).toBeDefined();
  });
  it('an acknowledged transaction with a failed readback is durable across restart and never replays the acknowledged mutation', async () => {
    const factory = new IDBFactory(); const db = adapter(factory); const subject = store(db); await subject.completeActivity(ACTIVITY); const [mutation] = await subject.getCloudBatch();
    const committed = reduce(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), mutation).document; const read = db.read; db.read = async () => { throw new Error('Readback failed'); };
    await expect(subject.acceptCloudResponse(response(committed, 1))).rejects.toThrow('Readback failed');
    expect(subject.getSnapshot().cloud.pendingMutations).toBe(1); db.read = read;
    const restarted = store(adapter(factory)); await restarted.hydrate(); expect(await restarted.getCloudBatch()).toEqual([]); expect(restarted.getSnapshot().cloud.remoteRevision).toBe(1);
    expect(restarted.getSnapshot().data.activities[ACTIVITY].evidence).toHaveLength(1);
  });
  it('an activity reset leaves an unrelated active quiz intact and retains shared quiz preferences', async () => {
    const subject = store(); await subject.hydrate(); await subject.setQuizPreferences({ showTimer: false });
    await subject.beginQuizSession(1, quizSession(), { context: subject.captureWriteContext('chapter-1:quiz') });
    expect((await subject.resetActivity(ACTIVITY, { context: subject.captureWriteContext(ACTIVITY) })).applied).toBe(true);
    expect(subject.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz'].session.sessionId).toBe('session-one'); expect(subject.getSnapshot().cloud.blockedMutations).toBe(0);
    expect(subject.getSnapshot().data.preferences.quiz.showTimer).toBe(false); const reset = (await subject.getCloudBatch()).find(item => item.type === 'reset'); expect(reset.payload.closedSessions).toBeUndefined();
  });
  it('serializes simultaneous disjoint completions across real connections', async () => {
    const factory = new IDBFactory(); const a = store(adapter(factory)); const b = store(adapter(factory));
    await Promise.all([a.hydrate(), b.hydrate()]);
    await Promise.all([a.completeActivity(ACTIVITY), b.completeActivity(OTHER_ACTIVITY)]);
    await a.refresh(); expect(Object.keys(a.getSnapshot().data.activities)).toEqual(expect.arrayContaining([ACTIVITY, OTHER_ACTIVITY]));
    expect(await a.getCloudBatch()).toHaveLength(2);
  });
  it('retains optimistic fact and original mutation on transaction failure, retrying exactly once', async () => {
    const db = memoryPersistence(); const subject = store(db); await subject.hydrate(); db.failures.write = true;
    expect(await subject.completeActivity(ACTIVITY)).toBe(false);
    const exported = await subject.exportProgress(); expect(exported.snapshot.activities[ACTIVITY]).toBeDefined(); expect(exported.cloud.outbox).toHaveLength(1);
    expect(exported.pendingLocalOperations).toHaveLength(1); expect(db.records.has(ACCOUNT_A)).toBe(false);
    db.failures.write = false; expect(await subject.retryPersistence()).toBe(true);
    expect((await subject.getCloudBatch())[0]).toEqual(exported.cloud.outbox[0]); expect(subject.getSnapshot().data.activities[ACTIVITY].evidence).toHaveLength(1);
  });
  it('a committed write followed by failed readback retains the same immutable outbox ID through retry', async () => {
    const db = memoryPersistence(); const subject = store(db); await subject.hydrate();
    const read = db.read; db.read = async () => { throw new Error('Readback unavailable'); };
    expect(await subject.completeActivity(ACTIVITY)).toBe(false); const mutation = (await subject.exportProgress()).cloud.outbox[0];
    expect(db.records.get(ACCOUNT_A).cloud.outbox[0]).toEqual(mutation);
    db.read = read; await subject.retryPersistence(); expect(await subject.getCloudBatch()).toEqual([mutation]);
  });
  it('does not overwrite corrupt or foreign-owned cloud metadata and does not export foreign contents', async () => {
    const db = memoryPersistence(); const first = store(db); await first.completeActivity(ACTIVITY);
    const saved = copy(db.records.get(ACCOUNT_A)); saved.cloud.base.document.ownerScope = ACCOUNT_B; db.records.set(ACCOUNT_A, saved);
    const subject = store(db); await subject.hydrate(); expect(subject.getSnapshot().persistenceStatus).toBe('session-only');
    expect(await subject.completeActivity(OTHER_ACTIVITY)).toBe(false); expect(db.records.get(ACCOUNT_A)).toEqual(saved);
    expect(JSON.stringify(await subject.exportProgress())).not.toContain(ACCOUNT_B);
  });
  it('does not drop a concurrently appended queue item when another tab acknowledges an earlier item', async () => {
    const factory = new IDBFactory(); const a = store(adapter(factory)); const b = store(adapter(factory)); await Promise.all([a.hydrate(), b.hydrate()]);
    await a.completeActivity(ACTIVITY); const [mutation] = await a.getCloudBatch(); const result = reduce(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), mutation);
    await Promise.all([a.acceptCloudResponse(response(result.document, 1)), b.completeActivity(OTHER_ACTIVITY)]);
    await a.refresh(); const pending = await a.getCloudBatch(); expect(pending).toHaveLength(1); expect(pending[0].payload.activityId).toBe(OTHER_ACTIVITY);
    expect(a.getSnapshot().data.activities[ACTIVITY]).toBeDefined(); expect(a.getSnapshot().data.activities[OTHER_ACTIVITY]).toBeDefined();
  });
  it('persists a receipt-only rejected acknowledgment and archives original stale facts without rebasing', async () => {
    const db = memoryPersistence(); const subject = store(db); await subject.completeActivity(ACTIVITY); const [mutation] = await subject.getCloudBatch();
    const reset = remoteReset(createEmptyCloudDocument({ ownerScope: ACCOUNT_A })); const resetDoc = reduce(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), reset).document;
    const rejected = reduce(resetDoc, mutation); expect(rejected.outcome.status).toBe('rejected'); expect(rejected.outcome.changed).toBe(false);
    await subject.acceptCloudResponse(response(rejected.document, 2));
    expect(await subject.getCloudBatch()).toEqual([]); expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeUndefined();
    const exported = await subject.exportProgress(); expect(exported.cloud.rejected[0].mutation).toEqual(mutation); expect(exported.cloud.base.document.receipts[mutation.id].status).toBe('rejected');
    const restarted = store(db); await restarted.hydrate(); expect(restarted.getSnapshot().cloud.rejectedMutations).toBe(1);
  });
  it('opposing offline resets keep unique lineages and reject dependent descendants', async () => {
    const a = store(); const b = store(); await Promise.all([a.hydrate(), b.hydrate()]);
    await a.resetAll(); await b.resetAll(); await b.completeActivity(ACTIVITY);
    const [resetA] = await a.getCloudBatch(); const resetDoc = reduce(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), resetA).document;
    await b.acceptCloudResponse(response(resetDoc, 1));
    expect(b.getSnapshot().data.activities[ACTIVITY]).toBeUndefined(); const exported = await b.exportProgress();
    expect(exported.cloud.rejected).toHaveLength(2); expect(exported.cloud.outbox[1].context.global).toBe(exported.cloud.outbox[0].id);
    expect(exported.cloud.outbox[0].id).not.toBe(resetA.id);
  });
  it('keeps private drafts local and atomically queues immutable finish plus matching closure', async () => {
    const subject = store(); await subject.hydrate(); const context = subject.captureWriteContext('chapter-1:quiz');
    await subject.beginQuizSession(1, quizSession(), { context }); await subject.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q1': { answer: 1, timestamp: START + 1000 } } }, { context });
    expect(await subject.getCloudBatch()).toEqual([]);
    const result = await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context });
    expect(result.applied).toBe(true); const [mutation] = await subject.getCloudBatch(); expect(mutation.type).toBe('quiz-finish'); expect(mutation.payload.attempt).toEqual(result.attempt);
    expect(mutation.context).toEqual(context.cloud); expect(subject.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz']).toBeUndefined();
    const repeated = await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context }); expect(repeated.applied).toBe(true); expect(await subject.getCloudBatch()).toHaveLength(1);
  });
  it('remote reset invalidates active private session and late callbacks without losing its original recovery', async () => {
    const subject = store(); await subject.hydrate(); const context = subject.captureWriteContext('chapter-1:quiz'); await subject.beginQuizSession(1, quizSession(), { context });
    const doc = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }); const reset = remoteReset(doc, 'quiz', 'chapter-1:quiz'); await subject.acceptCloudResponse(response(reduce(doc, reset).document, 1));
    expect(subject.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz']).toBeUndefined();
    const result = await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context }); expect(result.applied).toBe(false); expect(result.reason).toBe('write-predates-reset'); expect(await subject.getCloudBatch()).toEqual([]);
  });
  it('does not enqueue repeated attainment evidence or unchanged preferences', async () => {
    const subject = store(); await subject.completeActivity(ACTIVITY); await subject.completeActivity(ACTIVITY); await subject.setQuizPreferences({ showTimer: false }); await subject.setQuizPreferences({ showTimer: false });
    expect(await subject.getCloudBatch()).toHaveLength(2); expect(subject.getSnapshot().data.activities[ACTIVITY].evidence).toHaveLength(1);
  });
  it('refuses contexts stripped of cloud lineage and cross-account backups', async () => {
    const subject = store(); await subject.hydrate(); const context = subject.captureWriteContext(ACTIVITY); delete (context.cloud || {}).anything;
    const stripped = copy(context); delete stripped.cloud; await expect(subject.completeActivity(ACTIVITY, { context: stripped })).rejects.toThrow('captured cloud lineage');
    const b = store(memoryPersistence(), { accountId: ACCOUNT_B.slice(8) }); await b.hydrate(); await expect(b.importProgress(await subject.exportProgress())).rejects.toThrow('same owner');
  });
  it('account backup import preserves originals and cannot restore an acknowledged fact removed by reset', async () => {
    const subject = store(); await subject.completeActivity(ACTIVITY); const pendingBackup = await subject.exportProgress(); const [mutation] = await subject.getCloudBatch();
    let doc = reduce(createEmptyCloudDocument({ ownerScope: ACCOUNT_A }), mutation).document; await subject.acceptCloudResponse(response(doc, 1));
    doc = reduce(doc, remoteReset(doc)).document; await subject.acceptCloudResponse(response(doc, 2));
    await subject.importProgress(pendingBackup); expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeUndefined(); expect(await subject.getCloudBatch()).toEqual([]);
    expect((await subject.exportProgress()).recovery.some(item => item.reason === 'imported-account-file')).toBe(true);
  });
  it('explicitly previews and transfers guest data without touching its source, and rejects changed preview content', async () => {
    const subject = store(); await subject.hydrate(); const input = guest(); const before = copy(input); const preview = await subject.previewGuestTransfer(input); const context = subject.captureWriteContext();
    expect(await subject.getCloudBatch()).toEqual([]); const result = await subject.queueGuestTransfer(input, { expectedDigest: preview.digest, context }); expect(result.applied).toBe(true); expect(input).toEqual(before);
    expect(subject.getSnapshot().data.quizAttempts['attempt-one']).toEqual(input.quizAttempts['attempt-one']);
    input.activities[OTHER_ACTIVITY] = { activityId: OTHER_ACTIVITY, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'new', completedAt: DATE }] };
    await expect(subject.queueGuestTransfer(input, { expectedDigest: preview.digest, context })).rejects.toThrow('changed since');
  });
  it('chunks an explicit guest transfer over 1MiB while keeping whole pinned attempts and closures together', async () => {
    const subject = store(); await subject.hydrate(); const input = guest(); input.quizAttempts = {};
    for (let i = 0; i < 6; i++) {
      const bank = { ...copy(BANK), questions: Array.from({ length: 8 }, (_, q) => ({ ...copy(BANK.questions[0]), id: `large-${i}-${q}`, explanation: 'x'.repeat(20000), question: 'q'.repeat(20000) })) };
      const session = quizSession({ sessionId: `session-large-${i}`, bank, currentQuestionId: bank.questions[0].id }); const attempt = createPinnedQuizAttempt(session, { attemptId: `attempt-large-${i}`, date: DATE }); input.quizAttempts[attempt.id] = attempt;
    }
    expect(JSON.stringify(createGuestTransferPayload(input)).length).toBeGreaterThan(1024 * 1024);
    const preview = await subject.previewGuestTransfer(input); const result = await subject.queueGuestTransfer(input, { expectedDigest: preview.digest, context: subject.captureWriteContext() });
    expect(result.mutations).toBeGreaterThan(1); const batch = await subject.getCloudBatch(); expect(batch.every(item => validateCloudMutation(item).valid)).toBe(true);
    expect(Object.keys(subject.getSnapshot().data.quizAttempts)).toHaveLength(6); expect(input.quizAttempts).toHaveProperty('attempt-large-0');
  });
  it('preserves an oversized valid local finished bank and grade with explicit blocked export instead of cloud success', async () => {
    const db = memoryPersistence(); const subject = store(db); await subject.hydrate(); const context = subject.captureWriteContext('chapter-1:quiz');
    const bank = { ...copy(BANK), questions: Array.from({ length: 10 }, (_, i) => ({ ...copy(BANK.questions[0]), id: `huge-${i}`, options: Array.from({ length: 20 }, () => 'x'.repeat(6000)) })) };
    const session = quizSession({ bank, currentQuestionId: bank.questions[0].id }); expect((await subject.beginQuizSession(1, session, { context })).applied).toBe(true);
    const result = await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'oversized-attempt' }, { context });
    expect(result.applied).toBe(true); expect(result.persisted).toBe(true); expect(result.attempt.totalQuestions).toBe(10); expect(result.attempt.bank).toEqual(bank);
    expect(subject.getSnapshot().cloud.blockedMutations).toBe(1); expect(await subject.getCloudBatch()).toEqual([]); expect(subject.getSnapshot().data.sync.status).toBe('capacity');
    const exported = await subject.exportProgress(); expect(exported.accountBlocked[0].snapshot.quizAttempts['oversized-attempt'].bank).toEqual(bank);
    await subject.beginQuizSession(1, quizSession({ sessionId: 'small-retake' }), { context: subject.captureWriteContext('chapter-1:quiz') });
    await subject.updateQuizSession(1, 'small-retake', { isPaused: true, pausedRemaining: 60000 }, { context: subject.captureWriteContext('chapter-1:quiz') });
    expect((await subject.exportProgress()).accountBlocked).toHaveLength(1); expect(subject.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz'].session.isPaused).toBe(true);
    const restarted = store(db); await restarted.hydrate(); expect(restarted.getSnapshot().data.quizAttempts['oversized-attempt'].bank).toEqual(bank);
    const doc = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }); await restarted.acceptCloudResponse(response(reduce(doc, remoteReset(doc)).document, 1));
    expect(restarted.getSnapshot().data.quizAttempts['oversized-attempt']).toBeUndefined(); expect((await restarted.exportProgress()).accountBlocked[0].snapshot.quizAttempts['oversized-attempt']).toBeDefined();
  });
  it('overlays only a blocked grade and closure beside new canonical activity, same-chapter history, best and preferences', async () => {
    const factory = new IDBFactory(); const subject = store(adapter(factory)); await subject.setQuizPreferences({ showTimer: true });
    let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
    for (const item of await subject.getCloudBatch()) remote = reduce(remote, item).document;
    await subject.acceptCloudResponse(response(remote, 1)); const bank = await finishOversized(subject);
    const remoteAttempt = pinnedAttempt({ sessionId: 'remote-session' });
    for (const item of [complete(remote, OTHER_ACTIVITY), mutation(remote, 'quiz-finish', { attempt: remoteAttempt }), mutation(remote, 'chapter-history', { chapterId: 'chapter-1', patch: { score: 98, status: 'completed', progress: 100 } }), mutation(remote, 'quiz-preferences', { patch: { showTimer: false } })]) remote = reduce(remote, item).document;
    const history = guest(); history.activities = {}; history.chaptersLegacy = {}; history.quizAttempts = {}; history.legacyBestScores = { 'chapter-1': { percentage: 99, sourceKey: 'quiz_best_scores' } }; history.preferences.quiz = {};
    remote = reduce(remote, mutation(remote, 'guest-transfer', createGuestTransferPayload(history))).document;
    await subject.acceptCloudResponse(response(remote, 2));
    const restarted = store(adapter(factory)); await restarted.hydrate(); const data = restarted.getSnapshot().data;
    expect(data.activities[OTHER_ACTIVITY]).toBeDefined(); expect(data.quizAttempts['large-attempt'].bank).toEqual(bank); expect(data.quizAttempts[remoteAttempt.id]).toEqual(remoteAttempt);
    expect(data.chaptersLegacy['chapter-1'].score).toBe(98); expect(data.legacyBestScores['chapter-1'].percentage).toBe(99); expect(data.preferences.quiz.showTimer).toBe(false);
    const exported = await restarted.exportProgress(); expect(exported.checkpoint.closedQuizSessions['large-session'].attemptId).toBe('large-attempt'); expect(exported.checkpoint.closedQuizSessions['remote-session'].attemptId).toBe(remoteAttempt.id);
    expect(exported.accountBlocked[0].changes.quizAttempts.put).toEqual({ 'large-attempt': true }); expect(exported.accountBlocked[0].changes.quizPreferences.put).toEqual({});
    expect(await restarted.getCloudBatch()).toEqual([]); expect(restarted.getSnapshot().cloud.status).toBe('capacity');
  });
  it('preserves a blocked chapter-one grade across a chapter-two reset without resurrecting chapter-two facts', async () => {
    const subject = store(adapter(new IDBFactory())); await subject.completeActivity(OTHER_ACTIVITY);
    let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }); for (const item of await subject.getCloudBatch()) remote = reduce(remote, item).document;
    await subject.acceptCloudResponse(response(remote, 1)); const bank = await finishOversized(subject);
    remote = reduce(remote, remoteReset(remote, 'chapter', 'chapter-2')).document; await subject.acceptCloudResponse(response(remote, 2));
    expect(subject.getSnapshot().data.activities[OTHER_ACTIVITY]).toBeUndefined(); expect(subject.getSnapshot().data.quizAttempts['large-attempt'].bank).toEqual(bank);
    expect((await subject.exportProgress()).accountBlocked[0].snapshot.activities[OTHER_ACTIVITY]).toBeDefined();
  });
  it('a related quiz reset removes a blocked grade from attainment but preserves its full bank and unrelated study', async () => {
    const subject = store(); const bank = await finishOversized(subject); let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
    remote = reduce(remote, complete(remote, ACTIVITY)).document; remote = reduce(remote, remoteReset(remote, 'quiz', 'chapter-1:quiz')).document;
    await subject.acceptCloudResponse(response(remote, 1)); expect(subject.getSnapshot().data.quizAttempts['large-attempt']).toBeUndefined(); expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeDefined();
    expect((await subject.exportProgress()).accountBlocked[0].snapshot.quizAttempts['large-attempt'].bank).toEqual(bank); expect(subject.getSnapshot().cloud.blockedMutations).toBe(1);
  });
  it('keeps a blocked grade beside independent pending valid writes without replacing remote evidence on the same activity', async () => {
    const db = memoryPersistence(); const subject = store(db); const bank = await finishOversized(subject);
    await subject.completeActivity(ACTIVITY); await subject.setQuizPreferences({ showTimer: false });
    let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }); remote = reduce(remote, complete(remote, ACTIVITY)).document; remote = reduce(remote, complete(remote, OTHER_ACTIVITY)).document;
    await subject.acceptCloudResponse(response(remote, 1)); const restarted = store(db); await restarted.hydrate(); const data = restarted.getSnapshot().data;
    expect(data.quizAttempts['large-attempt'].bank).toEqual(bank); expect(data.activities[ACTIVITY].evidence).toHaveLength(2); expect(data.activities[OTHER_ACTIVITY]).toBeDefined(); expect(data.preferences.quiz.showTimer).toBe(false);
    expect((await restarted.exportProgress()).accountBlocked).toHaveLength(1);
    expect((await restarted.getCloudBatch()).map(item => item.type)).toEqual(['complete', 'quiz-preferences']);
  });
  it('a canonical session closure defeats a blocked finished grade while its exact original stays exportable', async () => {
    const subject = store(); const bank = await finishOversized(subject); let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A });
    remote = reduce(remote, mutation(remote, 'quiz-close', { chapterId: 'chapter-1', sessionId: 'large-session', reason: 'cleared' })).document;
    await subject.acceptCloudResponse(response(remote, 1)); expect(subject.getSnapshot().data.quizAttempts['large-attempt']).toBeUndefined();
    await subject.completeActivity(ACTIVITY); await subject.refresh(); expect(subject.getSnapshot().data.quizAttempts['large-attempt']).toBeUndefined(); expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeDefined();
    const exported = await subject.exportProgress(); expect(exported.checkpoint.closedQuizSessions['large-session'].reason).toBe('cleared'); expect(exported.accountBlocked[0].snapshot.quizAttempts['large-attempt'].bank).toEqual(bank);
  });
  it('a differing canonical immutable attempt wins an ID collision with an exact exportable blocked grade', async () => {
    const subject = store(adapter(new IDBFactory())); const bank = await finishOversized(subject);
    let remote = createEmptyCloudDocument({ ownerScope: ACCOUNT_A }); const attempt = { ...pinnedAttempt({ sessionId: 'canonical-session' }), id: 'large-attempt' };
    remote = reduce(remote, mutation(remote, 'quiz-finish', { attempt })).document; await subject.acceptCloudResponse(response(remote, 1));
    expect(subject.getSnapshot().data.quizAttempts['large-attempt']).toEqual(attempt); expect(subject.getSnapshot().data.quizAttempts['large-attempt'].percentage).toBe(100);
    const exported = await subject.exportProgress(); expect(exported.accountBlocked[0].snapshot.quizAttempts['large-attempt'].bank).toEqual(bank); expect(exported.checkpoint.closedQuizSessions['large-session']).toBeUndefined(); expect(exported.checkpoint.closedQuizSessions['canonical-session'].attemptId).toBe('large-attempt');
  });
  it('an explicit transfer keeps cross-group IDs when an activity and finished quiz session have the same safe ID', async () => {
    const subject = store(); await subject.hydrate(); const snapshot = guest(); const attempt = createPinnedQuizAttempt(quizSession({ sessionId: ACTIVITY }), { attemptId: 'attempt-one', date: DATE }); snapshot.quizAttempts = { 'attempt-one': attempt };
    const input = { snapshot, checkpoint: { closedQuizSessions: { [ACTIVITY]: { chapterId: 'chapter-1', operationId: uuid(++counter), reason: 'finished', attemptId: attempt.id } } } };
    const preview = await subject.previewGuestTransfer(input); expect(preview.activities).toBe(1);
    expect((await subject.queueGuestTransfer(input, { expectedDigest: preview.digest, context: subject.captureWriteContext() })).applied).toBe(true);
    expect(subject.getSnapshot().data.activities[ACTIVITY]).toBeDefined(); expect(subject.getSnapshot().data.quizAttempts['attempt-one']).toEqual(attempt);
  });
  it('rejects corrupt recovery overlay pointers without rewriting their original durable record', async () => {
    const db = memoryPersistence(); const subject = store(db); await finishOversized(subject); await subject.completeActivity(ACTIVITY);
    const saved = copy(db.records.get(ACCOUNT_A)); saved.accountBlocked[0].changes.activities.put[ACTIVITY] = [999]; db.records.set(ACCOUNT_A, saved);
    const restarted = store(db); await restarted.hydrate(); expect(restarted.getSnapshot().persistenceStatus).toBe('session-only'); expect(db.records.get(ACCOUNT_A)).toEqual(saved);
    expect(await restarted.completeActivity(OTHER_ACTIVITY)).toBe(false); expect(db.records.get(ACCOUNT_A)).toEqual(saved);
  });
});
