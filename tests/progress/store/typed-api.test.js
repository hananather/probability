import { afterEach, describe, expect, it } from 'vitest';
import { createProgressStore } from '@/lib/progress/store';
import { createEmptyProgress, validateProgressSnapshot } from '@/lib/progress/schema';
import { createPinnedQuizAttempt, normalizeQuizSession, validatePinnedQuizAttempt, validatePinnedQuizBank } from '@/lib/progress/quizContract';
import { selectCourseProgress, selectQuizProgress } from '@/lib/progress/selectors';
import { getChapterQuestions } from '@/lib/quiz/questionBank';
import { environment, memoryPersistence, storageWith } from './helpers';
import { BANK, START, answer, quizSession } from './typed-fixtures';

const active = [];
const create = (db, overrides = {}) => { const value = createProgressStore(environment(db, overrides)); active.push(value); return value; };
const quizId = 'chapter-1:quiz';
const lesson = 'chapter-1:foundations';
const child = `${lesson}:foundations`;
const sibling = `${lesson}:worked-examples`;
const current = subject => subject.getSnapshot().data.resumeByDevice['device-one']?.[quizId]?.session;
afterEach(() => active.splice(0).forEach(subject => subject.dispose()));

describe('pinned quiz contract', () => {
  it('accepts every current actual question bank, including empty-version engineering fallbacks', () => {
    for (let chapter = 1; chapter <= 7; chapter++) for (const requestedVersion of ['engineering', 'biostats', 'social']) {
      const data = getChapterQuestions(chapter, requestedVersion);
      const effectiveVersion = data[requestedVersion]?.length ? requestedVersion : 'engineering';
      const result = validatePinnedQuizBank({ revision: 'baseline-bank', requestedVersion, effectiveVersion, questions: data.questions });
      expect(result.errors, `chapter ${chapter}/${requestedVersion}`).toEqual([]);
    }
  });
  it('grades ordered single and multi answers from the retained bank and preserves actual fallback identity', () => {
    const session = normalizeQuizSession(quizSession({ answersByQuestionId: { 'ch1-q1': answer(1), 'ch1-q2': answer([1, 0]) } }));
    const attempt = createPinnedQuizAttempt(session, { attemptId: 'attempt-one', date: '2026-10-03T12:00:00.000Z' });
    expect(attempt).toMatchObject({ score: 2, correctAnswers: 2, totalQuestions: 2, percentage: 100, timeSpent: 600, legacy: false, requestedVersion: 'social', effectiveVersion: 'engineering', bankRevision: BANK.revision });
    expect(attempt.answersByQuestionId['ch1-q2'].answer).toEqual([0, 1]);
    expect(attempt.bank.questions).toEqual(BANK.questions);
    expect(validatePinnedQuizAttempt(attempt).valid).toBe(true);
    const snapshot = createEmptyProgress(); snapshot.quizAttempts[attempt.id] = attempt;
    expect(validateProgressSnapshot(snapshot).valid).toBe(true);
    expect(selectQuizProgress(snapshot, 'chapter-1')).toMatchObject({ attempted: true, passed: true, bestScore: 100 });
    expect(selectCourseProgress(snapshot).completedLessons).toBe(0);
  });

  it('rejects invalid option indices, duplicate selections, foreign question IDs and fabricated grades', () => {
    for (const answers of [{ 'ch1-q1': answer(2) }, { 'ch1-q2': answer([0, 0]) }, { other: answer(1) }, { 'ch1-q1': { ...answer(1), isCorrect: false } }, { 'ch1-q1': answer(1, START - 1) }]) expect(() => normalizeQuizSession(quizSession({ answersByQuestionId: answers }))).toThrow('Invalid pinned');
    const attempt = createPinnedQuizAttempt(normalizeQuizSession(quizSession({ answersByQuestionId: { 'ch1-q1': answer(1) } })), { attemptId: 'attempt-one', date: '2026-10-03T12:00:00.000Z' });
    expect(validatePinnedQuizAttempt({ ...attempt, percentage: 100 }).valid).toBe(false);
    expect(validatePinnedQuizAttempt({ ...attempt, orderedQuestionIds: ['ch1-q2', 'ch1-q1'] }).valid).toBe(false);
    expect(validatePinnedQuizAttempt({ ...attempt, bankRevision: 'another' }).valid).toBe(false);
    const incompleteSession = quizSession({ answersByQuestionId: { 'ch1-q1': answer(1) } });
    const snapshot = createEmptyProgress(); snapshot.resumeByDevice.local = { [quizId]: { containerId: quizId, activityId: null, kind: 'quiz-session', session: incompleteSession } };
    expect(validateProgressSnapshot(snapshot).valid).toBe(false);
    snapshot.resumeByDevice.local[quizId].session = normalizeQuizSession(incompleteSession);
    expect(validateProgressSnapshot(snapshot).valid).toBe(true);
  });

  it('rejects ambiguous or malformed banks without mutating them', () => {
    expect(validatePinnedQuizBank({ ...BANK, questions: [BANK.questions[0], BANK.questions[0]] }).valid).toBe(false);
    expect(validatePinnedQuizBank({ ...BANK, requestedVersion: 'unknown' }).valid).toBe(false);
    expect(validatePinnedQuizBank({ ...BANK, questions: [{ ...BANK.questions[0], correct: 2 }] }).valid).toBe(false);
    expect(validatePinnedQuizBank({ ...BANK, questions: [] }).valid).toBe(false);
  });

  it('preserves clearing a multi-select answer without awarding credit', () => {
    const session = normalizeQuizSession(quizSession({ answersByQuestionId: { 'ch1-q2': answer([]) } }));
    const attempt = createPinnedQuizAttempt(session, { attemptId: 'attempt-empty', date: '2026-10-03T12:00:00.000Z' });
    expect(attempt.answersByQuestionId['ch1-q2']).toMatchObject({ answer: [], isCorrect: false });
    expect(attempt.percentage).toBe(0);
  });
});

describe('typed owner-scoped local operations', () => {
  it('requires hydration for stable, frozen reset contexts and ignores unrelated revisions', async () => {
    const subject = create(memoryPersistence());
    expect(() => subject.captureWriteContext(lesson)).toThrow('hydrate');
    await subject.hydrate();
    const context = subject.captureWriteContext(child);
    expect(Object.isFrozen(context.containerEpochs)).toBe(true);
    await subject.completeActivity('chapter-1:probability-dictionary');
    expect(await subject.completeActivity(child, { context })).toBe(true);
    expect(() => subject.captureWriteContext('unknown')).toThrow('Invalid');
  });

  it('publishes loading=false only when an immediate subscriber can safely capture context', async () => {
    const subject = create(memoryPersistence(), { legacyStorage: storageWith({ chapter1Progress: '["foundations"]' }) });
    const states = []; const contexts = [];
    const unsubscribe = subject.subscribe(() => {
      const snapshot = subject.getSnapshot(); states.push(snapshot.loading);
      if (!snapshot.loading) contexts.push(subject.captureWriteContext(lesson));
    });
    await subject.hydrate(); unsubscribe();
    expect(states).toEqual([true, false]);
    expect(contexts).toHaveLength(1);
    expect(contexts[0].ownerScope).toBe(subject.getSnapshot().data.ownerScope);
    expect(subject.getSnapshot().persistenceStatus).toBe('persisted');
  });

  it('rejects contexts from another profile/device or an unrelated container before writing', async () => {
    const db = memoryPersistence(); const subject = create(db); await subject.hydrate();
    const context = subject.captureWriteContext(child); const writes = db.writes;
    await expect(subject.completeActivity(child, { context: { ...context, ownerScope: 'guest:other' } })).rejects.toThrow('another owner');
    await expect(subject.completeActivity(child, { context: { ...context, deviceId: 'other' } })).rejects.toThrow('another owner');
    await expect(subject.completeActivity(sibling, { context })).rejects.toThrow('does not contain');
    expect(db.writes).toBe(writes);
    expect((await subject.exportProgress()).recovery).toEqual([]);
  });

  it('ignores and recovers a learner callback captured before a chapter/global reset', async () => {
    for (const reset of [subject => subject.resetChapter(1), subject => subject.resetAll()]) {
      const subject = create(memoryPersistence()); await subject.hydrate();
      const context = subject.captureWriteContext(child);
      await reset(subject);
      expect(await subject.completeActivity(child, { context, sourceKey: 'late-game' })).toBe(false);
      expect(subject.getSnapshot().data.activities[child]).toBeUndefined();
      expect((await subject.exportProgress()).recovery.at(-1)).toMatchObject({ reason: 'write-predates-reset', operation: { activityId: child, evidence: { sourceKey: 'late-game' } } });
    }
  });

  it('resets one activity subtree and aggregate evidence while retaining siblings and raw checkpoints', async () => {
    const raw = JSON.stringify(['foundations', 'worked-examples']);
    const subject = create(memoryPersistence(), { legacyStorage: storageWith({ 'chapter1-foundations-progress': raw }) });
    await subject.hydrate(); await subject.completeActivity(lesson);
    await subject.setResume(child, { kind: 'section', positionId: 'intuition', legacyIndex: 1 });
    const staleChild = subject.captureWriteContext(child); const staleParent = subject.captureWriteContext(lesson); const validSibling = subject.captureWriteContext(sibling);
    expect(await subject.resetActivity(child, { context: staleChild })).toMatchObject({ applied: true, persisted: true });
    expect(subject.getSnapshot().data.activities[child]).toBeUndefined();
    expect(subject.getSnapshot().data.activities[lesson]).toBeUndefined();
    expect(subject.getSnapshot().data.activities[sibling]).toBeDefined();
    expect(subject.getSnapshot().data.resumeByDevice['device-one'][child]).toBeUndefined();
    expect(await subject.completeActivity(child, { context: staleChild })).toBe(false);
    expect(await subject.completeActivity(lesson, { context: staleParent })).toBe(false);
    expect(await subject.completeActivity(sibling, { context: validSibling })).toBe(true);
    await subject.refreshLegacy();
    expect(subject.getSnapshot().data.activities[child]).toBeUndefined();
    const exported = await subject.exportProgress();
    expect(exported.snapshot.migration.sources['chapter1-foundations-progress'].raw).toBe(raw);
    expect(exported.checkpoint.legacyObserved['chapter1-foundations-progress']).toBe(raw);
    expect(exported.checkpoint.containerEpochs[child]).toBe(1);
  });

  it('retains stable renderer positions independently from activity completion and clears only the current device locator', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate();
    const context = subject.captureWriteContext(child);
    await subject.setResume(child, { kind: 'section', positionId: 'why-probability', legacyIndex: 2 }, { context });
    expect(subject.getSnapshot().data.resumeByDevice['device-one'][child]).toMatchObject({ positionId: 'why-probability', activityId: null });
    expect(subject.getSnapshot().data.activities).toEqual({});
    expect(await subject.clearResume(child, { context })).toMatchObject({ applied: true, persisted: true });
    expect(subject.getSnapshot().data.resumeByDevice['device-one'][child]).toBeUndefined();
    await expect(subject.setResume(child, { kind: 'section', positionId: '__proto__' })).rejects.toThrow('Invalid resume');
    await expect(subject.clearResume(quizId)).rejects.toThrow('matching session ID');
  });

  it('merges disjoint preferences, normalizes the historical typo, and preserves preference values across resets', async () => {
    const db = memoryPersistence(); const a = create(db); const b = create(db);
    await Promise.all([a.hydrate(), b.hydrate()]);
    await Promise.all([a.setQuizPreferences({ immediateFeeback: true }), b.setQuizPreferences({ showTimer: false })]);
    await a.setDevicePreference('chapter1Progress_devMode', true);
    await a.setDevicePreference('tutorial-ch1-foundations-completed', 'skipped');
    await a.resetAll();
    expect(a.getSnapshot().data.preferences).toEqual({ quiz: { immediateFeedback: true, showTimer: false }, device: { chapter1Progress_devMode: true, 'tutorial-ch1-foundations-completed': 'skipped' } });
    await a.setDevicePreference('tutorial-ch1-foundations-completed', null);
    expect(a.getSnapshot().data.preferences.device['tutorial-ch1-foundations-completed']).toBeUndefined();
    await expect(a.setQuizPreferences({ unknown: true })).rejects.toThrow('Invalid');
    await expect(a.setQuizPreferences({ immediateFeeback: true, immediateFeedback: false })).rejects.toThrow('Conflicting');
    await expect(a.setDevicePreference('analytics_session_id', true)).rejects.toThrow('Invalid');
    expect(a.getSnapshot().data.activities).toEqual({});
  });

  it('supports separate chapter sessions without losing the actual bank or grading rules', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate();
    const input = quizSession(); await subject.beginQuizSession(1, input, { context: subject.captureWriteContext(quizId) });
    input.bank = { ...BANK, revision: 'changed-current-bank' };
    await subject.beginQuizSession(2, quizSession({ sessionId: 'session-two', chapterId: 'chapter-2' }), { context: subject.captureWriteContext('chapter-2:quiz') });
    expect(current(subject).bank.revision).toBe(BANK.revision);
    expect(subject.getSnapshot().data.resumeByDevice['device-one']['chapter-2:quiz'].session.sessionId).toBe('session-two');
    expect(subject.getSnapshot().data.activities).toEqual({});
    await expect(subject.setResume(quizId, { kind: 'quiz-session', session: quizSession() })).rejects.toThrow('typed quiz');
    await expect(subject.beginQuizSession(1, quizSession())).rejects.toThrow('Capture a write context');
  });

  it('merges two tabs’ disjoint answers and ignores a stale older answer timestamp', async () => {
    const db = memoryPersistence(); const a = create(db); await a.hydrate();
    await a.beginQuizSession(1, quizSession(), { context: a.captureWriteContext(quizId) });
    const b = create(db); await b.hydrate();
    await Promise.all([a.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q1': answer(1, START + 2000) } }), b.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q2': answer([0, 1]) }, currentQuestionId: 'ch1-q2', flaggedQuestionIds: ['ch1-q1'] })]);
    await a.refresh();
    expect(Object.keys(current(a).answersByQuestionId)).toEqual(['ch1-q1', 'ch1-q2']);
    await a.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q1': answer(0) } });
    expect(current(a).answersByQuestionId['ch1-q1'].answer).toBe(1);
    await expect(a.updateQuizSession(1, 'session-one', { bank: BANK })).rejects.toThrow('Invalid quiz session patch');
  });

  it('finishes atomically with final answers, records one immutable attempt and clears only matching session', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate();
    const context = subject.captureWriteContext(quizId);
    await subject.beginQuizSession(1, quizSession(), { context });
    const result = await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one', answersByQuestionId: { 'ch1-q1': answer(1) } }, { context });
    expect(result).toMatchObject({ applied: true, persisted: true, reason: null, attempt: { score: 1, percentage: 50 } });
    expect(current(subject)).toBeUndefined();
    expect(selectQuizProgress(subject.getSnapshot().data, 'chapter-1').passed).toBe(true);
    const original = result.attempt;
    expect(await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one', answersByQuestionId: { 'ch1-q1': answer(0) } }, { context })).toMatchObject({ applied: true, persisted: true, attempt: original });
    expect(Object.keys(subject.getSnapshot().data.quizAttempts)).toHaveLength(1);
    expect(await subject.beginQuizSession(1, quizSession(), { context })).toMatchObject({ applied: false, reason: 'quiz-session-closed' });
  });

  it('leaves a retake intact when old save/clear/finish callbacks arrive and retains their recoverable payloads', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate();
    const context = subject.captureWriteContext(quizId);
    await subject.beginQuizSession(1, quizSession(), { context });
    await subject.beginQuizSession(1, quizSession({ sessionId: 'retake' }), { context });
    for (const operation of [() => subject.updateQuizSession(1, 'session-one', { answersByQuestionId: { 'ch1-q1': answer(1) } }, { context }), () => subject.clearQuizSession(1, 'session-one', { context }), () => subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-old' }, { context })]) expect(await operation()).toMatchObject({ applied: false, persisted: true, reason: 'quiz-session-mismatch' });
    expect(current(subject).sessionId).toBe('retake');
    expect(subject.getSnapshot().data.quizAttempts).toEqual({});
    const exported = await subject.exportProgress();
    expect(exported.recovery.filter(item => item.reason === 'quiz-session-mismatch')).toHaveLength(3);
    expect(exported.checkpoint.closedQuizSessions['session-one'].reason).toBe('replaced');
  });

  it('keeps quota-failed atomic completion exportable and retries exactly once without losing the attempt', async () => {
    const db = memoryPersistence(); const subject = create(db); await subject.hydrate();
    await subject.beginQuizSession(1, quizSession(), { context: subject.captureWriteContext(quizId) }); db.failures.write = true;
    expect(await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one', answersByQuestionId: { 'ch1-q1': answer(1) } })).toMatchObject({ applied: true, persisted: false, attempt: { percentage: 50 } });
    expect(current(subject)).toBeUndefined();
    const exported = await subject.exportProgress();
    expect(exported.pendingLocalOperations).toHaveLength(1);
    expect(exported.snapshot.quizAttempts['attempt-one'].bank).toEqual(BANK);
    db.failures.write = false; expect(await subject.retryPersistence()).toBe(true);
    const reloaded = create(db); await reloaded.hydrate();
    expect(Object.keys(reloaded.getSnapshot().data.quizAttempts)).toEqual(['attempt-one']);
    expect(current(reloaded)).toBeUndefined();
  });

  it('prevents queued and late session writes from undoing a reset in a second tab', async () => {
    const db = memoryPersistence(); const a = create(db); await a.hydrate();
    const context = a.captureWriteContext(quizId); await a.beginQuizSession(1, quizSession(), { context });
    db.failures.write = true;
    await a.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context });
    db.failures.write = false;
    const b = create(db); await b.hydrate(); await b.resetChapter(1);
    expect(await a.retryPersistence()).toBe(true);
    expect(a.getSnapshot().data.quizAttempts).toEqual({});
    expect(await a.beginQuizSession(1, quizSession({ sessionId: 'late' }), { context })).toMatchObject({ applied: false, reason: 'write-predates-reset' });
    expect(current(a)).toBeUndefined();
    expect((await a.exportProgress()).recovery.some(item => item.operation?.type === 'quiz-finish')).toBe(true);
  });

  it('preserves legacy sessions as unverified history without silently binding old indices to new questions', async () => {
    const raw = JSON.stringify({ chapterId: 1, currentQuestion: 1, answers: { 0: { answer: 1, isCorrect: true, timestamp: START } }, version: 'engineering', startTime: START, timeRemaining: 120 });
    const subject = create(memoryPersistence(), { legacyStorage: storageWith({ quiz_current_session: raw }) });
    await subject.hydrate();
    expect(current(subject)).toBeUndefined();
    expect(subject.getSnapshot().data.resumeByDevice['device-one'][quizId].legacySession).toBeDefined();
    await subject.beginQuizSession(1, quizSession(), { context: subject.captureWriteContext(quizId) });
    expect(current(subject).answersByQuestionId).toEqual({});
    expect((await subject.exportProgress()).snapshot.migration.sources.quiz_current_session.raw).toBe(raw);
  });

  it('accepts previous envelope records without losing history or treating new optional checkpoints as corruption', async () => {
    const db = memoryPersistence(); const first = create(db); await first.hydrate(); await first.completeActivity(child);
    const record = db.records.get(db.identity.ownerScope); delete record.containerEpochs; delete record.closedQuizSessions;
    const second = create(db); await second.hydrate();
    expect(second.getSnapshot().data.activities[child]).toBeDefined();
    expect(second.captureWriteContext(child).containerEpochs).toEqual({});
    expect((await second.exportProgress()).recovery).toEqual([]);
  });

  it('filters a pending multi-activity import against a later scoped reset while preserving siblings and exact raw recovery', async () => {
    const db = memoryPersistence(); const a = create(db); await a.hydrate();
    const incoming = createEmptyProgress(db.identity);
    for (const id of [lesson, child, sibling]) incoming.activities[id] = { activityId: id, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'file-import', completedAt: null }] };
    const file = { snapshot: incoming }; db.failures.write = true;
    await a.importProgress(file); db.failures.write = false;
    const b = create(db); await b.hydrate(); await b.resetActivity(child);
    await a.retryPersistence();
    expect(a.getSnapshot().data.activities[child]).toBeUndefined();
    expect(a.getSnapshot().data.activities[lesson]).toBeUndefined();
    expect(a.getSnapshot().data.activities[sibling]).toBeDefined();
    const exported = await a.exportProgress();
    expect(exported.recovery.some(item => item.reason === 'import-predates-activity-reset' && item.containerIds.includes(child))).toBe(true);
    expect(exported.recovery.find(item => item.reason === 'imported-file').raw).toBe(JSON.stringify(file));
  });

  it('does not import a previously closed session back into active state or drop the recoverable file', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate(); await subject.beginQuizSession(1, quizSession(), { context: subject.captureWriteContext(quizId) });
    const file = await subject.exportProgress();
    await subject.clearQuizSession(1, 'session-one'); await subject.importProgress(file);
    expect(current(subject)).toBeUndefined();
    expect((await subject.exportProgress()).recovery.at(-1).raw).toBe(JSON.stringify(file));
  });

  it('rejects generic quiz resume before it can bypass matching-session closure and reopen a session', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate(); const context = subject.captureWriteContext(quizId);
    await subject.beginQuizSession(1, quizSession(), { context });
    await expect(subject.setResume(quizId, { kind: 'quiz-session', activityId: null }, { context })).rejects.toThrow('typed quiz API');
    expect(current(subject).sessionId).toBe('session-one');
    await subject.clearQuizSession(1, 'session-one', { context });
    await expect(subject.setResume(quizId, { kind: 'quiz-session', activityId: null }, { context })).rejects.toThrow('typed quiz API');
    expect(await subject.beginQuizSession(1, quizSession(), { context })).toMatchObject({ applied: false, reason: 'quiz-session-closed' });
  });

  it('imports closed session checkpoints into a fresh store before an older active export can resurrect that session', async () => {
    const source = create(memoryPersistence()); await source.hydrate(); const context = source.captureWriteContext(quizId);
    await source.beginQuizSession(1, quizSession(), { context }); const activeFile = await source.exportProgress();
    await source.clearQuizSession(1, 'session-one', { context }); const closedFile = await source.exportProgress();
    const target = create(memoryPersistence()); await target.hydrate();
    await target.importProgress(closedFile); await target.importProgress(activeFile);
    expect(current(target)).toBeUndefined();
    const recovered = await target.exportProgress();
    expect(recovered.checkpoint.closedQuizSessions['session-one']).toEqual(closedFile.checkpoint.closedQuizSessions['session-one']);
    expect(recovered.recovery.filter(item => item.reason === 'imported-file').map(item => item.raw)).toEqual([JSON.stringify(closedFile), JSON.stringify(activeFile)]);
    expect(await target.beginQuizSession(1, quizSession(), { context: target.captureWriteContext(quizId) })).toMatchObject({ applied: false, reason: 'quiz-session-closed' });
  });

  it('rejects malformed imported tombstones before writing, and retains existing closure facts when imports conflict', async () => {
    const db = memoryPersistence(); const subject = create(db); await subject.hydrate(); const context = subject.captureWriteContext(quizId);
    await subject.beginQuizSession(1, quizSession(), { context }); await subject.clearQuizSession(1, 'session-one', { context });
    const file = await subject.exportProgress(); const original = file.checkpoint.closedQuizSessions['session-one'];
    const invalid = JSON.parse(JSON.stringify(file)); invalid.checkpoint.closedQuizSessions['session-one'].chapterId = 'chapter-8'; const writes = db.writes;
    await expect(subject.importProgress(invalid)).rejects.toThrow('Invalid imported quiz');
    expect(db.writes).toBe(writes);
    const conflicting = JSON.parse(JSON.stringify(file)); conflicting.checkpoint.closedQuizSessions['session-one'] = { ...original, reason: 'replaced', operationId: 'foreign-import-operation' };
    await subject.importProgress(conflicting);
    expect((await subject.exportProgress()).checkpoint.closedQuizSessions['session-one']).toEqual(original);
    expect((await subject.exportProgress()).recovery.at(-1).raw).toBe(JSON.stringify(conflicting));
  });

  it('never returns an attempt from another chapter through the idempotent finish branch', async () => {
    const subject = create(memoryPersistence()); await subject.hydrate(); const context = subject.captureWriteContext(quizId);
    await subject.beginQuizSession(1, quizSession(), { context }); await subject.finishQuizAttempt(1, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context });
    const original = subject.getSnapshot().data.quizAttempts['attempt-one'];
    const result = await subject.finishQuizAttempt(2, { sessionId: 'session-one', attemptId: 'attempt-one' }, { context: subject.captureWriteContext('chapter-2:quiz') });
    expect(result).toEqual({ applied: false, persisted: true, reason: 'quiz-session-mismatch', attempt: null });
    expect(subject.getSnapshot().data.quizAttempts['attempt-one']).toEqual(original);
  });
});
