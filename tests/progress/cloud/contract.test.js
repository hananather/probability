import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from '@/lib/progress/schema';
import { createPinnedQuizAttempt, validatePinnedQuizAttempt } from '@/lib/progress/quizContract';
import { migrateLegacyProgress } from '@/lib/progress/legacyMigration';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { createGuestTransferPayload, projectCloudFacts } from '@/lib/progress/cloud/projection';
import { canonicalJson, captureCloudWriteContext, CLOUD_LIMITS, createCloudMutation, emptyCloudFacts, hashCloudValue, isCloudJson, normalizeAccountScope, validateClosedQuizSessions, validateCloudContext, validateCloudDocument, validateCloudFacts, validateCloudMutation } from '@/lib/progress/cloud/schema';
import { ACCOUNT_A, ACCOUNT_B, ACTIVITY, OTHER_ACTIVITY, PARENT, DATE, complete, copy, document, guest, mutation, pinnedAttempt, reduce, reset, uuid } from './helpers';
import { quizSession, START } from '../store/typed-fixtures';

describe('cloud learning projection and content hashes', () => {
  it('exports allowlisted learning history while leaving original device/raw/auth data intact', () => {
    const source = guest();
    source.resumeByDevice['original-device'] = { [PARENT]: { containerId: PARENT, activityId: ACTIVITY, kind: 'tab' } };
    source.preferences.device.devMode = true;
    source.migration.sources.secret = { raw: 'PRIVATE_RAW', fingerprint: 'abc', previous: [] };
    source.unattributedLegacy.secret = { raw: 'PRIVATE_UNKNOWN', issues: [] };
    source.accessToken = 'PRIVATE_AUTH'; source.quizAttempts['attempt-one'].accessToken = 'PRIVATE_NESTED';
    const original = copy(source);
    const result = projectCloudFacts(source, { closedQuizSessions: { 'session-one': { chapterId: 'chapter-1', operationId: 'legacy-op', reason: 'finished', attemptId: 'attempt-one' } } });
    const serialized = JSON.stringify(result);
    for (const text of ['PRIVATE_', 'deviceId', 'resumeByDevice', 'unattributedLegacy', 'migration', 'ownerScope', 'devMode', 'accessToken', 'originalId']) expect(serialized).not.toContain(text);
    expect(result.activities[ACTIVITY].evidence[0].completedAt).toBeNull();
    expect(result.quizAttempts['attempt-one'].bank).toEqual(original.quizAttempts['attempt-one'].bank);
    expect(result.quizAttempts['attempt-one'].percentage).toBe(100);
    expect(result.legacyBestScores['chapter-2'].percentage).toBe(95);
    expect(result.closedQuizSessions['session-one']).toEqual({ chapterId: 'chapter-1', operationId: 'legacy-op', reason: 'finished', attemptId: 'attempt-one' });
    expect(source).toEqual(original); expect(validateCloudFacts(result).valid).toBe(true);
  });

  it('preserves legacy indexed answers, unknown bank identity, 0 best score and inconsistent historical aggregates', () => {
    const source = migrateLegacyProgress({
      quiz_attempts: JSON.stringify({ 1: [{ id: 'old', chapterId: 1, date: DATE, version: 'social', score: 9, totalQuestions: 2, correctAnswers: 9, percentage: 33, timeSpent: 11, answers: { 0: { answer: 1, isCorrect: true, timestamp: 0 } } }] }),
      quiz_best_scores: '{"1":0}',
    }, { ownerScope: 'guest:legacy', deviceId: 'legacy' });
    const result = projectCloudFacts(source); const attempt = Object.values(result.quizAttempts)[0];
    const { originalId, ...preserved } = Object.values(source.quizAttempts)[0];
    expect(attempt).toEqual(preserved); expect(originalId).toBe('old');
    expect(attempt).not.toHaveProperty('originalId');
    expect(attempt.bankRevision).toBeNull(); expect(attempt.effectiveVersion).toBeNull();
    expect(attempt.percentage).toBe(33); expect(attempt.correctAnswers).toBe(9);
    expect(attempt.answersByIndex['0'].timestamp).toBe(0); expect(result.legacyBestScores['chapter-1'].percentage).toBe(0);
  });

  it('does not invent attainment from a completed chapter and has deterministic projection IDs', () => {
    const source = createEmptyProgress(); source.chaptersLegacy['chapter-1'] = { status: 'completed', progress: 100 };
    expect(projectCloudFacts(source).activities).toEqual({});
    expect(projectCloudFacts(guest())).toEqual(projectCloudFacts(guest()));
  });

  it('matches the standard SHA-256 implementation and ignores property order, not payload changes', () => {
    const value = { z: ['π', 0, false, null], a: { y: 'x', b: 3 } };
    const encoded = '{"a":{"b":3,"y":"x"},"z":["π",0,false,null]}';
    expect(canonicalJson(value)).toBe(encoded);
    expect(hashCloudValue(value)).toBe(createHash('sha256').update(encoded).digest('hex'));
    expect(hashCloudValue({ a: { b: 3, y: 'x' }, z: value.z })).toBe(hashCloudValue(value));
    expect(hashCloudValue({ ...value, z: ['π', 1, false, null] })).not.toBe(hashCloudValue(value));
  });

  it('rejects non-JSON behavior without executing getters', () => {
    let calls = 0; const getter = {};
    Object.defineProperty(getter, 'schemaVersion', { get() { calls++; return 1; } });
    const cyclic = {}; cyclic.self = cyclic;
    for (const bad of [getter, cyclic, new Date(), new Map(), [, 1], [undefined], { x: Infinity }, { x: undefined }, JSON.parse('{"__proto__":{}}')]) expect(isCloudJson(bad)).toBe(false);
    expect(calls).toBe(0);
    expect(validateCloudDocument(getter).valid).toBe(false); expect(calls).toBe(0);
    expect(validateCloudContext(getter)).toBe(false); expect(validateClosedQuizSessions(getter)).toBe(false); expect(calls).toBe(0);
    const trapped = new Proxy({}, { ownKeys() { throw new Error('trap'); } });
    expect(isCloudJson(trapped)).toBe(false); expect(validateCloudDocument(trapped).valid).toBe(false);
    const inherited = [1]; Object.setPrototypeOf(inherited, { map() { calls++; return []; } });
    const nullPrototype = [1]; Object.setPrototypeOf(nullPrototype, null);
    expect(isCloudJson(inherited)).toBe(false); expect(isCloudJson(nullPrototype)).toBe(false);
    expect(() => canonicalJson(inherited)).toThrow(/JSON/); expect(calls).toBe(0);
    const source = guest(); Object.defineProperty(source, 'ownerScope', { enumerable: true, get() { calls++; return 'guest:hidden'; } });
    expect(() => createGuestTransferPayload(source)).toThrow(); expect(calls).toBe(0);
    const closure = {}; Object.defineProperty(closure, 'session', { enumerable: true, get() { calls++; return {}; } });
    expect(() => projectCloudFacts(guest(), { closedQuizSessions: closure })).toThrow(); expect(calls).toBe(0);
    const guarded = document(); Object.defineProperty(guarded, 'ownerScope', { enumerable: true, get() { calls++; return ACCOUNT_A; } });
    expect(() => applyCloudMutation(guarded, complete(document()), { verifiedOwnerScope: ACCOUNT_A })).toThrow(); expect(calls).toBe(0);
    const authority = {}; Object.defineProperty(authority, 'ownerScope', { enumerable: true, get() { calls++; return ACCOUNT_A; } });
    expect(validateCloudDocument(document(), authority).valid).toBe(false); expect(calls).toBe(0);
  });
});

describe('owner, immutable operation and grade validation', () => {
  it('requires independent verified account authority and does not reinterpret body ownership', () => {
    const doc = document(); const operation = complete(doc); const before = copy(doc);
    expect(() => applyCloudMutation(doc, operation)).toThrow(/ownership/);
    expect(() => applyCloudMutation(doc, operation, { verifiedOwnerScope: ACCOUNT_B })).toThrow(/ownership/);
    expect(() => applyCloudMutation(document(ACCOUNT_B), operation, { verifiedOwnerScope: ACCOUNT_B })).toThrow(/ownership/);
    expect(doc).toEqual(before);
    expect(validateCloudDocument(doc, { ownerScope: ACCOUNT_B }).valid).toBe(false);
  });

  it('normalizes physical account UUID case at construction/authority and rejects alias documents', () => {
    const lower = 'account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const mixed = 'account:AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE';
    expect(document(mixed)).toEqual(document(lower)); expect(normalizeAccountScope(mixed)).toBe(lower);
    const doc = document(lower); const operation = complete(doc);
    expect(applyCloudMutation(doc, operation, { verifiedOwnerScope: mixed }).outcome.status).toBe('applied');
    expect(validateCloudDocument({ ...doc, ownerScope: mixed }).valid).toBe(false);
    expect(validateCloudDocument(doc, { ownerScope: mixed }).valid).toBe(true);
    const alias = copy(operation); alias.ownerScope = mixed; alias.context.ownerScope = mixed;
    expect(validateCloudMutation(alias).valid).toBe(false);
    const mixedId = 'AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE';
    expect(complete(doc, ACTIVITY, { id: mixedId }).id).toBe(mixedId.toLowerCase());
  });

  it('deduplicates a verified receipt after reset without rebasing the original mutation', () => {
    const original = document(); const operation = complete(original);
    const applied = reduce(original, operation).document;
    const cleared = reduce(applied, reset(applied, 'global')).document;
    const result = reduce(cleared, operation);
    expect(result.document).toBe(cleared); expect(result.outcome.duplicate).toBe(true);
    expect(result.document.facts.activities).toEqual({});
    expect(Object.keys(result.document.receipts)).toHaveLength(2);
  });

  it('rejects the same operation ID with different content, and forged content/digests', () => {
    const original = document(); const first = complete(original); const saved = reduce(original, first).document;
    const changed = complete(saved, OTHER_ACTIVITY, { id: first.id });
    expect(() => reduce(saved, changed)).toThrow(/another payload/);
    const tampered = copy(first); tampered.payload.completedAt = null;
    expect(validateCloudMutation(tampered).errors).toContain('mutation:digest');
    expect(() => reduce(original, tampered)).toThrow(/mutation:digest/);
  });

  it('adds disjoint evidence in either order while immutable ID conflicts cannot overwrite history', () => {
    const initial = document(); const a = complete(initial); const b = complete(initial, OTHER_ACTIVITY, { deviceId: 'device-two' });
    const ab = reduce(reduce(initial, a).document, b).document;
    const ba = reduce(reduce(initial, b).document, a).document;
    expect(ab).toEqual(ba);
    expect(Object.keys(ab.facts.activities)).toEqual(expect.arrayContaining([ACTIVITY, OTHER_ACTIVITY]));
    expect(initial.facts.activities).toEqual({});
  });

  it('never fabricates grade/bank identity and atomically adds immutable attempt plus closure', () => {
    const initial = document(); const attempt = pinnedAttempt();
    expect(validatePinnedQuizAttempt(attempt).valid).toBe(true);
    const result = reduce(initial, mutation(initial, 'quiz-finish', { attempt }));
    expect(result.document.facts.quizAttempts['attempt-one']).toEqual(attempt);
    expect(result.document.facts.closedQuizSessions['session-one']).toMatchObject({ chapterId: 'chapter-1', reason: 'finished', attemptId: 'attempt-one' });
    expect(validateCloudDocument(result.document).valid).toBe(true);
    for (const change of [{ percentage: 0 }, { score: 0 }, { effectiveVersion: 'social' }, { orderedQuestionIds: ['ch1-q2', 'ch1-q1'] }]) expect(() => mutation(initial, 'quiz-finish', { attempt: { ...attempt, ...change } })).toThrow(/mutation:payload/);
  });

  it('rejects changed bank content/answers under an existing attempt ID', () => {
    const initial = document(); const first = pinnedAttempt(); const saved = reduce(initial, mutation(initial, 'quiz-finish', { attempt: first })).document;
    const changed = copy(first); changed.bank.questions[0].question = 'New bank wording';
    const result = reduce(saved, mutation(saved, 'quiz-finish', { attempt: changed }));
    expect(result.outcome.reason).toBe('quiz-attempt-id-conflict');
    expect(result.document.facts.quizAttempts).toEqual(saved.facts.quizAttempts);
    expect(result.document.facts.closedQuizSessions).toEqual(saved.facts.closedQuizSessions);
  });

  it('does not finish a cleared/replaced session or finish one session twice under new attempt IDs', () => {
    const initial = document(); const cleared = reduce(initial, mutation(initial, 'quiz-close', { chapterId: 'chapter-1', sessionId: 'session-one', reason: 'cleared' })).document;
    const finish = reduce(cleared, mutation(cleared, 'quiz-finish', { attempt: pinnedAttempt() }));
    expect(finish.outcome.reason).toBe('quiz-session-closed'); expect(finish.document.facts.quizAttempts).toEqual({});
    const saved = reduce(initial, mutation(initial, 'quiz-finish', { attempt: pinnedAttempt() })).document;
    const second = { ...pinnedAttempt(), id: 'attempt-two' };
    expect(reduce(saved, mutation(saved, 'quiz-finish', { attempt: second })).outcome.reason).toBe('quiz-session-closed');
    expect(reduce(saved, mutation(saved, 'quiz-finish', { attempt: pinnedAttempt() })).outcome.status).toBe('applied');
    const resetDoc = reduce(saved, reset(saved, 'global')).document;
    expect(reduce(resetDoc, mutation(resetDoc, 'quiz-finish', { attempt: pinnedAttempt() })).outcome.reason).toBe('quiz-session-closed');
    expect(resetDoc.facts.quizAttempts).toEqual({});
    const rebound = { ...pinnedAttempt(), sessionId: 'new-session' };
    expect(reduce(resetDoc, mutation(resetDoc, 'quiz-finish', { attempt: rebound })).outcome.reason).toBe('quiz-attempt-id-conflict');
  });

  it('guards chapter/session identity even on idempotent finishes and malformed cloud documents', () => {
    const initial = document(); const saved = reduce(initial, mutation(initial, 'quiz-finish', { attempt: pinnedAttempt() })).document;
    const wrong = { ...pinnedAttempt(), chapterId: 'chapter-2' };
    expect(reduce(saved, mutation(saved, 'quiz-finish', { attempt: wrong })).outcome.reason).toBe('quiz-attempt-id-conflict');
    const duplicate = copy(saved); duplicate.facts.quizAttempts['attempt-two'] = { ...pinnedAttempt(), id: 'attempt-two' };
    expect(validateCloudDocument(duplicate).errors).toContain('quizAttempts:duplicate-session');
    const rebound = copy(saved); rebound.facts.closedQuizSessions['other-session'] = { chapterId: 'chapter-1', operationId: 'other-op', reason: 'finished', attemptId: 'attempt-one' };
    expect(validateCloudDocument(rebound).valid).toBe(false);
    const resetDoc = reduce(saved, reset(saved, 'global')).document;
    resetDoc.facts.closedQuizSessions['other-session'] = rebound.facts.closedQuizSessions['other-session'];
    expect(validateCloudDocument(resetDoc).valid).toBe(false);
    const misplaced = copy(saved); delete misplaced.facts.closedQuizSessions['session-one'];
    misplaced.facts.closedQuizSessions['other-session'] = rebound.facts.closedQuizSessions['other-session'];
    expect(validateCloudDocument(misplaced).valid).toBe(false);
  });
});

describe('reset lineage and captured descendants', () => {
  it('defeats independent devices both resetting numeric epoch 0 to 1', () => {
    const initial = document(); const oldContext = captureCloudWriteContext(initial);
    const resetA = reset(initial, 'global', null, { deviceId: 'A', context: oldContext });
    const resetB = reset(initial, 'global', null, { deviceId: 'B', context: oldContext });
    const optimisticB = reduce(initial, resetB).document;
    const descendantB = complete(optimisticB, ACTIVITY, { deviceId: 'B' });
    const acknowledgedA = reduce(initial, resetA).document;
    const rejectedResetB = reduce(acknowledgedA, resetB);
    expect(rejectedResetB.outcome.reason).toBe('write-predates-reset');
    expect(rejectedResetB.document.checkpoints.global).toBe(resetA.id);
    const rejectedDescendant = reduce(rejectedResetB.document, descendantB);
    expect(rejectedDescendant.outcome.reason).toBe('write-predates-reset');
    expect(rejectedDescendant.document.facts.activities).toEqual({});
    expect(reduce(rejectedDescendant.document, complete(acknowledgedA)).outcome.status).toBe('applied');
    expect(descendantB.context.global).toBe(resetB.id);
  });

  it.each([
    ['chapter', 'chapter-1'], ['activity', PARENT], ['activity', ACTIVITY],
  ])('rejects old %s activity work but preserves unrelated chapter work', (scope, targetId) => {
    const initial = document(); const old = complete(initial); const unrelated = complete(initial, OTHER_ACTIVITY);
    const cleared = reduce(initial, reset(initial, scope, targetId)).document;
    expect(reduce(cleared, old).outcome.reason).toBe('write-predates-reset');
    expect(reduce(cleared, unrelated).outcome.status).toBe('applied');
    expect(reduce(cleared, complete(cleared)).outcome.status).toBe('applied');
  });

  it('rejects parent aggregation captured before a child reset, and invalidates existing ancestor completion', () => {
    const initial = document(); const parent = complete(initial, PARENT); const child = complete(initial);
    const before = reduce(reduce(initial, parent).document, child).document;
    const cleared = reduce(before, reset(before, 'activity', ACTIVITY)).document;
    expect(cleared.facts.activities).toEqual({});
    const delayedParent = complete(before, PARENT);
    expect(reduce(cleared, delayedParent).outcome.reason).toBe('write-predates-reset');
    const sibling = complete(before, 'chapter-1:foundations:worked-examples');
    expect(reduce(cleared, sibling).outcome.status).toBe('applied');
  });

  it('captures child scope so it cannot be used for another lesson or account-wide mutation', () => {
    const initial = document(); const context = captureCloudWriteContext(initial, ACTIVITY);
    expect(reduce(initial, complete(initial, OTHER_ACTIVITY, { context })).outcome.reason).toBe('write-context-target-mismatch');
    expect(reduce(initial, reset(initial, 'global', null, { context })).outcome.reason).toBe('write-context-target-mismatch');
  });

  it.each(['quiz', 'quizzes'])('keeps study independent during %s reset while old finish/prefs fail', scope => {
    const initial = document(); const oldFinish = mutation(initial, 'quiz-finish', { attempt: pinnedAttempt() });
    let saved = reduce(initial, complete(initial)).document;
    saved = reduce(saved, oldFinish).document;
    saved = reduce(saved, mutation(saved, 'quiz-preferences', { patch: { showTimer: false } })).document;
    const oldPrefs = mutation(saved, 'quiz-preferences', { patch: { showTimer: true } });
    const cleared = reduce(saved, reset(saved, scope, scope === 'quiz' ? 'chapter-1:quiz' : null)).document;
    expect(cleared.facts.activities[ACTIVITY]).toBeDefined();
    expect(cleared.facts.quizAttempts).toEqual({}); expect(cleared.facts.quizPreferences).toEqual(scope === 'quiz' ? { showTimer: false } : {});
    expect(cleared.facts.closedQuizSessions['session-one'].reason).toBe('finished');
    const late = mutation(initial, 'quiz-finish', { attempt: { ...pinnedAttempt(), id: 'attempt-late' } });
    expect(reduce(cleared, late).outcome.reason).toBe('write-predates-reset');
    expect(reduce(cleared, oldPrefs).outcome.reason).toBe('write-predates-reset');
  });

  it('retains device-session close tombstones through reset and rejects a cross-chapter closure', () => {
    const initial = document(); const close = mutation(initial, 'quiz-close', { sessionId: 'session-one', chapterId: 'chapter-1', reason: 'replaced' });
    const saved = reduce(initial, close).document;
    const cleared = reduce(saved, reset(saved, 'global')).document;
    expect(cleared.facts.closedQuizSessions).toEqual(saved.facts.closedQuizSessions);
    expect(reduce(cleared, mutation(cleared, 'quiz-close', { sessionId: 'session-one', chapterId: 'chapter-2', reason: 'cleared' })).outcome.reason).toBe('quiz-session-chapter-conflict');
    expect(reduce(cleared, mutation(cleared, 'quiz-finish', { attempt: pinnedAttempt() })).outcome.reason).toBe('quiz-session-closed');
  });

  it('closes only matching supplied local sessions on reset, atomically with the token', () => {
    const initial = document(); const payload = { scope: 'chapter', targetId: 'chapter-1', closedSessions: [{ chapterId: 'chapter-1', sessionId: 'unfinished-device-session' }] };
    const operation = mutation(initial, 'reset', payload);
    const result = reduce(initial, operation).document;
    expect(result.checkpoints.chapters['chapter-1']).toBe(operation.id);
    expect(result.facts.closedQuizSessions['unfinished-device-session']).toMatchObject({ reason: 'reset', operationId: operation.id });
    expect(() => mutation(initial, 'reset', { ...payload, closedSessions: [{ chapterId: 'chapter-2', sessionId: 'bad' }] })).toThrow(/payload/);
  });

  it('checks reset token provenance against the accepted reset receipt', () => {
    const doc = document(); doc.checkpoints.global = uuid(9999);
    expect(validateCloudDocument(doc).valid).toBe(false);
    const initial = document(); const operation = reset(initial, 'chapter', 'chapter-1'); const saved = reduce(initial, operation).document;
    expect(validateCloudDocument(saved).valid).toBe(true);
    const changed = copy(saved); changed.checkpoints.global = operation.id;
    expect(validateCloudDocument(changed).errors).toContain('checkpoints:global-receipt');
  });
});

describe('explicit guest transfers and retained reset receipts', () => {
  it('does not transfer without an explicit mutation and refuses account-source adoption', () => {
    const doc = document(); const source = guest(); const before = copy(source);
    const payload = createGuestTransferPayload(source);
    expect(doc.facts.activities).toEqual({}); expect(source).toEqual(before);
    expect(() => createGuestTransferPayload({ ...source, ownerScope: ACCOUNT_B })).toThrow(/guest/);
    const result = reduce(doc, mutation(doc, 'guest-transfer', payload));
    expect(result.outcome.status).toBe('applied'); expect(result.document.facts.quizAttempts['attempt-one'].bank).toEqual(source.quizAttempts['attempt-one'].bank);
    expect(source).toEqual(before);
  });

  it('imports genuine finished history and its closure together without overriding a preexisting reset tombstone', () => {
    const initial = document(); const payload = createGuestTransferPayload(guest(), { closedQuizSessions: { 'session-one': { chapterId: 'chapter-1', operationId: 'guest-finish', reason: 'finished', attemptId: 'attempt-one' } } });
    const saved = reduce(initial, mutation(initial, 'guest-transfer', payload));
    expect(saved.document.facts.quizAttempts['attempt-one']).toEqual(pinnedAttempt());
    expect(saved.document.facts.closedQuizSessions['session-one'].operationId).toBe('guest-finish');
    const blocked = reduce(initial, mutation(initial, 'quiz-close', { chapterId: 'chapter-1', sessionId: 'session-one', reason: 'reset' })).document;
    const result = reduce(blocked, mutation(blocked, 'guest-transfer', payload));
    expect(result.document.facts.quizAttempts).toEqual({});
    expect(result.document.facts.closedQuizSessions['session-one']).toEqual(blocked.facts.closedQuizSessions['session-one']);
    expect(result.outcome.skipped.some(item => item.reason === 'quiz-session-closed')).toBe(true);
  });

  it('computes source/content digests from actual projected facts, not supplied authority', () => {
    const initial = document(); const payload = createGuestTransferPayload(guest());
    const wrong = { ...payload, contentDigest: '0'.repeat(64) };
    expect(() => mutation(initial, 'guest-transfer', wrong)).toThrow(/payload/);
    const changed = copy(payload); changed.facts.quizAttempts['attempt-one'].bank.questions[0].question = 'Other wording';
    expect(() => mutation(initial, 'guest-transfer', changed)).toThrow(/payload/);
    expect(() => reduce(document(ACCOUNT_B), mutation(initial, 'guest-transfer', payload))).toThrow(/ownership/);
  });

  it('does not resurrect a repeated transfer after reset, even with a new mutation and fresh context', () => {
    const initial = document(); const payload = createGuestTransferPayload(guest());
    const transfer = mutation(initial, 'guest-transfer', payload);
    const saved = reduce(initial, transfer).document;
    const cleared = reduce(saved, reset(saved, 'global')).document;
    expect(reduce(cleared, transfer).document.facts.activities).toEqual({});
    const replay = reduce(cleared, mutation(cleared, 'guest-transfer', payload));
    expect(replay.outcome.changed).toBe(false);
    expect(replay.document.facts.activities).toEqual({}); expect(replay.document.facts.quizAttempts).toEqual({});
    expect(Object.keys(replay.document.transferSources)).toHaveLength(1);
  });

  it('a changed guest digest adds new work without bringing previously transferred facts back', () => {
    const source = guest(); const initial = document();
    const saved = reduce(initial, mutation(initial, 'guest-transfer', createGuestTransferPayload(source))).document;
    const cleared = reduce(saved, reset(saved, 'global')).document;
    source.activities[OTHER_ACTIVITY] = { activityId: OTHER_ACTIVITY, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'new-study', completedAt: DATE }] };
    source.chaptersLegacy['chapter-1'].timeSpent = 200;
    const result = reduce(cleared, mutation(cleared, 'guest-transfer', createGuestTransferPayload(source)));
    expect(result.outcome.status).toBe('applied'); expect(result.document.facts.activities[OTHER_ACTIVITY]).toBeDefined();
    expect(result.document.facts.activities[ACTIVITY]).toBeUndefined();
    expect(result.document.facts.quizAttempts).toEqual({}); expect(result.document.facts.chaptersLegacy).toEqual({});
    expect(result.document.facts.legacyBestScores).toEqual({});
    expect(result.outcome.skipped.some(item => item.reason === 'previously-transferred')).toBe(true);
  });

  it('does not restore or regrade a previously transferred immutable attempt under changed guest content', () => {
    const source = guest(); const initial = document();
    const saved = reduce(initial, mutation(initial, 'guest-transfer', createGuestTransferPayload(source))).document;
    const cleared = reduce(saved, reset(saved, 'global')).document;
    source.quizAttempts['attempt-one'].bank.questions[0].question = 'Changed old bank';
    const result = reduce(cleared, mutation(cleared, 'guest-transfer', createGuestTransferPayload(source)));
    expect(result.outcome.reason).toBe('quiz-attempt-id-conflict');
    expect(result.document.facts).toEqual(cleared.facts);
    expect(result.document.transferSources).toEqual(cleared.transferSources);
  });

  it('changing only the body-supplied guest source cannot evade reset protection for old semantic facts', () => {
    const source = guest(); const initial = document();
    const saved = reduce(initial, mutation(initial, 'guest-transfer', createGuestTransferPayload(source))).document;
    const cleared = reduce(saved, reset(saved, 'global')).document;
    source.ownerScope = 'guest:renamed-source'; source.deviceId = 'renamed-source';
    const result = reduce(cleared, mutation(cleared, 'guest-transfer', createGuestTransferPayload(source)));
    expect(result.outcome.changed).toBe(false);
    expect(result.document.facts.activities).toEqual({}); expect(result.document.facts.quizAttempts).toEqual({});
    expect(result.document.facts.chaptersLegacy).toEqual({}); expect(result.document.facts.legacyBestScores).toEqual({});
  });

  it('is deterministic and idempotent, never double-adds aggregate time or duplicates attempts', () => {
    const initial = document(); const source = guest(); const payload = createGuestTransferPayload(source);
    const first = mutation(initial, 'guest-transfer', payload); const saved = reduce(initial, first).document;
    const again = reduce(saved, mutation(saved, 'guest-transfer', payload)).document;
    expect(again.facts).toEqual(saved.facts); expect(again.facts.chaptersLegacy['chapter-1'].timeSpent).toBe(100);
    expect(Object.keys(again.facts.quizAttempts)).toEqual(['attempt-one']);
    expect(reduce(initial, first).document).toEqual(saved);
  });

  it('keeps unrelated existing history/best scores and applies a chapter aggregate using max, not addition', () => {
    const initial = document(); const facts = guest();
    initial.facts.legacyBestScores['chapter-2'] = { percentage: 99, sourceKey: 'other-legacy' };
    initial.facts.chaptersLegacy['chapter-1'] = { timeSpent: 120, progress: 10 };
    const saved = reduce(initial, mutation(initial, 'guest-transfer', createGuestTransferPayload(facts))).document;
    expect(saved.facts.legacyBestScores['chapter-2'].percentage).toBe(99);
    expect(saved.facts.chaptersLegacy['chapter-1'].timeSpent).toBe(120); expect(saved.facts.chaptersLegacy['chapter-1'].progress).toBe(100);
  });

  it('rejects a stale transfer atomically and retains its rejection receipt rather than rebasing', () => {
    const initial = document(); const operation = mutation(initial, 'guest-transfer', createGuestTransferPayload(guest()));
    const cleared = reduce(initial, reset(initial, 'chapter', 'chapter-1')).document;
    const result = reduce(cleared, operation);
    expect(result.outcome.reason).toBe('write-predates-reset');
    expect(result.document.facts).toEqual(cleared.facts); expect(result.document.transferSources).toEqual({});
    expect(reduce(result.document, operation).outcome.duplicate).toBe(true);
  });
});

describe('cloud contract bounds and failed-operation purity', () => {
  it('returns invalid for hostile JSON-shaped checkpoint/receipt/transfer fields without throwing', () => {
    const values = [null, false, 0, -1, '', 'x', [], [null], {}, { bad: null }, { toString: null }, { global: null }, { chapters: null, containers: null }, { [uuid(4)]: null }];
    for (const key of ['schemaVersion', 'ownerScope', 'curriculumRevision', 'facts', 'checkpoints', 'receipts', 'transferSources', 'transferredFacts']) for (const value of values) {
      if (['receipts', 'transferSources', 'transferredFacts'].includes(key) && JSON.stringify(value) === '{}') continue;
      if (key === 'curriculumRevision' && value === 'x') continue;
      const candidate = { ...document(), [key]: value };
      expect(() => validateCloudDocument(candidate), `${key}:${JSON.stringify(value)}`).not.toThrow();
      expect(validateCloudDocument(candidate).valid, `${key}:${JSON.stringify(value)}`).toBe(false);
    }
    for (const key of ['global', 'chapters', 'containers']) for (const value of values) {
      const candidate = document(); candidate.checkpoints[key] = value;
      expect(() => validateCloudDocument(candidate)).not.toThrow();
    }
    for (const key of ['schemaVersion', 'id', 'ownerScope', 'deviceId', 'type', 'context', 'payload', 'digest']) for (const value of values) {
      const candidate = { ...complete(document()), [key]: value };
      expect(() => validateCloudMutation(candidate), `${key}:${JSON.stringify(value)}`).not.toThrow();
      expect(validateCloudMutation(candidate).valid).toBe(false);
    }
  });

  it('checks forged token/receipt pairings, not only token syntax', () => {
    const initial = document(); const operation = reset(initial, 'chapter', 'chapter-1');
    const applied = reduce(initial, operation).document;
    for (const patch of [{ type: 'complete' }, { status: 'rejected', reason: 'stale' }, { resetScope: 'global', targetId: null }, { targetId: 'chapter-2' }]) {
      const corrupted = copy(applied); Object.assign(corrupted.receipts[operation.id], patch);
      expect(validateCloudDocument(corrupted).valid).toBe(false);
    }
  });

  it('rejects unknown/prototype-like fields and nested answer corruption without repairing the source', () => {
    const doc = document(); const changed = { ...doc, auth: 'secret' };
    expect(validateCloudDocument(changed).errors).toContain('document:shape');
    const facts = projectCloudFacts(guest()); facts.quizAttempts['attempt-one'].answersByQuestionId['ch1-q1'].isCorrect = false;
    expect(validateCloudFacts(facts).valid).toBe(false);
    expect(validateCloudDocument(JSON.parse('{"__proto__":{"ownerScope":"x"}}')).valid).toBe(false);
  });

  it('enforces evidence and receipt cardinalities while keeping the last valid document intact', () => {
    const initial = document(); initial.facts.activities[ACTIVITY] = { activityId: ACTIVITY, evidence: Array.from({ length: CLOUD_LIMITS.evidencePerActivity }, (_, index) => ({ id: `evidence-${index}`, kind: 'study-completed', sourceKey: 'fixture', completedAt: null })) };
    expect(validateCloudDocument(initial).valid).toBe(true);
    const before = copy(initial);
    expect(() => reduce(initial, complete(initial))).toThrow(/capacity/); expect(initial).toEqual(before);
    const tooMany = document(); tooMany.receipts = Object.fromEntries(Array.from({ length: CLOUD_LIMITS.receipts + 1 }, (_, index) => [uuid(index), { digest: '0'.repeat(64), type: 'complete', status: 'applied', reason: null }]));
    expect(validateCloudDocument(tooMany).errors).toContain('receipts:limit');
    delete tooMany.receipts[uuid(CLOUD_LIMITS.receipts)];
    expect(validateCloudDocument(tooMany).valid).toBe(true);
    const prior = copy(tooMany);
    expect(() => reduce(tooMany, complete(tooMany, ACTIVITY, { id: uuid(20000) }))).toThrow(/receipts:limit/);
    try { reduce(tooMany, complete(tooMany, ACTIVITY, { id: uuid(20001) })); }
    catch (error) { expect(error.code).toBe('cloud-capacity'); expect(error.errors).toContain('receipts:limit'); }
    expect(tooMany).toEqual(prior); expect(tooMany.facts.activities).toEqual({});
  });

  it('rejects a validator-legal bank that exceeds the cloud mutation byte limit without truncating it', () => {
    const questions = Array.from({ length: 100 }, (_, index) => ({ id: `large-${index}`, type: 'multiple-choice', question: 'x'.repeat(19000), options: ['a', 'b'], correct: 0, explanation: 'An explanation.' }));
    const session = quizSession({ bank: { revision: 'large-bank', requestedVersion: 'engineering', effectiveVersion: 'engineering', questions }, currentQuestionId: 'large-0' });
    const attempt = createPinnedQuizAttempt(session, { attemptId: 'large-attempt', date: DATE });
    expect(validatePinnedQuizAttempt(attempt).valid).toBe(true);
    const original = copy(attempt);
    expect(() => mutation(document(), 'quiz-finish', { attempt })).toThrow(/mutation:bytes/); expect(attempt).toEqual(original);
  });

  it('keeps reduced failed operations atomic even if the conflict appears after part of a transfer/reset', () => {
    const initial = document(); const existing = pinnedAttempt();
    const saved = reduce(initial, mutation(initial, 'quiz-finish', { attempt: existing })).document;
    const source = guest(); source.quizAttempts['attempt-one'].bank.questions[0].question = 'Different preserved bank';
    const result = reduce(saved, mutation(saved, 'guest-transfer', createGuestTransferPayload(source)));
    expect(result.outcome.reason).toBe('quiz-attempt-id-conflict'); expect(result.document.facts).toEqual(saved.facts);
    expect(result.document.transferSources).toEqual({});
    const payload = { scope: 'global', targetId: null, closedSessions: [{ sessionId: 'session-one', chapterId: 'chapter-2' }] };
    const failedReset = reduce(saved, mutation(saved, 'reset', payload));
    expect(failedReset.outcome.reason).toBe('quiz-session-chapter-conflict'); expect(failedReset.document.facts).toEqual(saved.facts);
    expect(failedReset.document.checkpoints).toEqual(saved.checkpoints);
  });

  it('checks accepted reset and transfer metadata through JSON serialization round trips', () => {
    const initial = document(); const adopted = reduce(initial, mutation(initial, 'guest-transfer', createGuestTransferPayload(guest()))).document;
    const cleared = reduce(adopted, reset(adopted, 'quizzes')).document;
    expect(validateCloudDocument(copy(cleared)).valid).toBe(true);
    expect(captureCloudWriteContext(copy(cleared))).toEqual(captureCloudWriteContext(cleared));
    expect(emptyCloudFacts().activities).toEqual({});
    expect(() => createCloudMutation({ id: 'not-a-uuid', deviceId: 'device', type: 'quiz-preferences', context: captureCloudWriteContext(initial), payload: { patch: { showTimer: true } } })).toThrow(/mutation ID/);
    expect(START).toBeLessThan(Date.parse(DATE));
    const older = copy(cleared); older.curriculumRevision = '2026-09-01.1';
    expect(validateCloudDocument(older).valid).toBe(true);
  });
});
