import { afterEach, describe, expect, it } from 'vitest';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence, storageWith } from './helpers';
import { quizSession } from './typed-fixtures';

const stores = [];
const create = (db = memoryPersistence(), overrides = {}) => {
  const store = createProgressStore(environment(db, overrides));
  stores.push(store);
  return store;
};
const quizId = chapter => `${chapter}:quiz`;
const session = (store, chapter = 'chapter-1') => store.getSnapshot().data.resumeByDevice['device-one']?.[quizId(chapter)]?.session;
async function begin(store, chapter = 'chapter-1', sessionId = 'session-one') {
  await store.beginQuizSession(chapter, quizSession({ chapterId: chapter, sessionId }), { context: store.captureWriteContext(quizId(chapter)) });
}
afterEach(() => stores.splice(0).forEach(store => store.dispose()));

describe('quiz-only reset boundaries', () => {
  it('resets one quiz while preserving independent study, other quizzes, and preferences', async () => {
    const store = create(undefined, { legacyStorage: storageWith({ quiz_best_scores: '{"1":70,"2":90}' }) });
    await store.hydrate();
    await store.completeActivity('chapter-1:foundations');
    await store.setQuizPreferences({ showTimer: false });
    await begin(store);
    await store.finishQuizAttempt('chapter-1', { sessionId: 'session-one', attemptId: 'attempt-one' }, { context: store.captureWriteContext('chapter-1:quiz') });
    await begin(store, 'chapter-2', 'session-two');
    await store.resetQuiz('chapter-1', { context: store.captureWriteContext('chapter-1:quiz') });
    expect(store.getSnapshot().data.activities['chapter-1:foundations']).toBeDefined();
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
    expect(store.getSnapshot().data.legacyBestScores['chapter-1']).toBeUndefined();
    expect(store.getSnapshot().data.legacyBestScores['chapter-2'].percentage).toBe(90);
    expect(session(store, 'chapter-2').sessionId).toBe('session-two');
    expect(store.getSnapshot().data.preferences.quiz.showTimer).toBe(false);
  });

  it('clears all quiz data and quiz preferences while retaining study, device preferences, and raw recovery', async () => {
    const storage = storageWith({ quiz_best_scores: '{"1":70,"2":90}' });
    const store = create(undefined, { legacyStorage: storage }); await store.hydrate();
    await store.completeActivity('chapter-1:foundations');
    await store.setDevicePreference('sidebarOpen', true);
    await store.setQuizPreferences({ version: 'social' });
    await begin(store); await begin(store, 'chapter-2', 'session-two');
    expect(await store.resetAllQuizzes()).toBe(true);
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
    expect(store.getSnapshot().data.legacyBestScores).toEqual({});
    expect(store.getSnapshot().data.preferences.quiz).toEqual({});
    expect(store.getSnapshot().data.preferences.device.sidebarOpen).toBe(true);
    expect(store.getSnapshot().data.activities['chapter-1:foundations']).toBeDefined();
    expect(session(store)).toBeUndefined(); expect(session(store, 'chapter-2')).toBeUndefined();
    expect(storage.getItem('quiz_best_scores')).toBe('{"1":70,"2":90}');
    expect(store.getSnapshot().data.migration.sources.quiz_best_scores.raw).toBe('{"1":70,"2":90}');
    expect(Object.keys(store.getSnapshot().writeContext.containerEpochs)).toHaveLength(7);
  });

  it('rejects pre-reset callbacks and permits freshly captured quiz work', async () => {
    const store = create(); await store.hydrate(); await begin(store);
    const context = store.captureWriteContext('chapter-1:quiz');
    await store.resetQuiz('chapter-1', { context });
    expect(await store.updateQuizSession('chapter-1', 'session-one', { flaggedQuestionIds: ['ch1-q1'] }, { context })).toMatchObject({ applied: false, reason: 'write-predates-reset' });
    expect(await store.finishQuizAttempt('chapter-1', { sessionId: 'session-one', attemptId: 'attempt-late' }, { context })).toMatchObject({ applied: false });
    expect(await store.beginQuizSession('chapter-1', quizSession({ sessionId: 'session-late' }), { context })).toMatchObject({ applied: false });
    await begin(store, 'chapter-1', 'session-new');
    expect(session(store).sessionId).toBe('session-new');
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
  });

  it('closes old sessions against an explicit backup import without erasing unrelated study', async () => {
    const store = create(); await store.hydrate(); await begin(store);
    const backup = await store.exportProgress();
    await store.resetAllQuizzes();
    await store.importProgress(backup);
    expect(session(store)).toBeUndefined();
    expect((await store.exportProgress()).checkpoint.closedQuizSessions['session-one'].reason).toBe('reset');
  });

  it.each(['quiz', 'chapter', 'global'])('rejects a captured legacy adapter import after a %s reset', async scope => {
    const store = create(); await store.hydrate(); await begin(store);
    const context = store.captureWriteContext('chapter-1:quiz');
    const backup = await store.exportProgress();
    if (scope === 'quiz') await store.resetQuiz('chapter-1', { context });
    else if (scope === 'chapter') await store.resetChapter('chapter-1');
    else await store.resetAll();
    expect(await store.importProgress(backup, { context })).toBe(false);
    expect(session(store)).toBeUndefined();
    expect(store.getSnapshot().data.quizAttempts).toEqual({});
  });

  it('does not restore delayed quiz preferences after clearing all quiz data', async () => {
    const store = create(); await store.hydrate();
    const context = store.captureWriteContext();
    await store.setQuizPreferences({ version: 'social' }, { context });
    await store.resetAllQuizzes();
    expect(await store.setQuizPreferences({ version: 'social' }, { context })).toMatchObject({ applied: false });
    expect(store.getSnapshot().data.preferences.quiz).toEqual({});
  });

  it('retains a failed reset for retry and reload without resurrecting the session', async () => {
    const db = memoryPersistence(); const store = create(db); await store.hydrate(); await begin(store);
    await store.completeActivity('chapter-1:foundations');
    db.failures.write = true;
    expect(await store.resetAllQuizzes()).toBe(false);
    expect(session(store)).toBeUndefined();
    expect(store.getSnapshot().persistenceStatus).toBe('session-only');
    expect((await store.exportProgress()).pendingLocalOperations).toHaveLength(1);
    db.failures.write = false; expect(await store.retryPersistence()).toBe(true);
    const restored = create(db); await restored.hydrate();
    expect(session(restored)).toBeUndefined();
    expect(restored.getSnapshot().data.activities['chapter-1:foundations']).toBeDefined();
  });

  it('rejects an unpublished quiz and contexts belonging to a lesson', async () => {
    const store = create(); await store.hydrate();
    await expect(store.resetQuiz('chapter-8')).rejects.toThrow('Invalid quiz');
    await expect(store.resetQuiz('chapter-1', { context: store.captureWriteContext('chapter-1:foundations') })).rejects.toThrow('does not contain');
  });

  it('clears the exact archived locator without deleting historical results or its raw recovery', async () => {
    const raw = '{"chapterId":1,"currentQuestion":0,"answers":{}}';
    const storage = storageWith({ quiz_current_session: raw, quiz_best_scores: '{"1":70}' });
    const store = create(undefined, { legacyStorage: storage }); await store.hydrate();
    const locator = store.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz'];
    const context = store.captureWriteContext('chapter-1:quiz');
    const backup = await store.exportProgress();
    expect(await store.clearLegacyQuizSession('chapter-1', locator, { context })).toMatchObject({ applied: true, persisted: true });
    expect(store.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz']).toBeUndefined();
    expect(store.getSnapshot().data.legacyBestScores['chapter-1'].percentage).toBe(70);
    expect(storage.getItem('quiz_current_session')).toBe(raw);
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toBe(raw);
    expect(await store.importProgress(backup, { context })).toBe(false);
    await expect(store.clearLegacyQuizSession('chapter-1', locator)).rejects.toThrow('Capture');
  });

  it('rejects an old archive clear after a fresh pinned retake has replaced it', async () => {
    const store = create(undefined, { legacyStorage: storageWith({ quiz_current_session: '{"chapterId":1,"answers":{}}' }) });
    await store.hydrate();
    const locator = store.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz'];
    const context = store.captureWriteContext('chapter-1:quiz');
    await begin(store, 'chapter-1', 'session-retake');
    expect(await store.clearLegacyQuizSession('chapter-1', locator, { context })).toMatchObject({ applied: false, reason: 'legacy-quiz-session-changed' });
    expect(session(store).sessionId).toBe('session-retake');
  });

  it('archives an indexed legacy import without overwriting a pinned retake that began after capture', async () => {
    const raw = '{"chapterId":1,"answers":{}}';
    const historical = create(undefined, { legacyStorage: storageWith({ quiz_current_session: raw }) });
    await historical.hydrate(); const backup = await historical.exportProgress();
    const target = create(); await target.hydrate();
    const context = target.captureWriteContext('chapter-1:quiz');
    await begin(target, 'chapter-1', 'session-retake');
    expect(await target.importProgress(backup, { context })).toBe(true);
    expect(session(target).sessionId).toBe('session-retake');
    expect(target.getSnapshot().data.migration.sources.quiz_current_session.raw).toBe(raw);
  });

  it.each(['quiz', 'chapter', 'global'])('keeps changed legacy quiz keys as recovery only after a %s reset', async scope => {
    const storage = storageWith({ quiz_best_scores: '{"1":70}', quiz_current_session: '{"chapterId":1,"answers":{}}', quiz_preferences: '{"version":"social"}' });
    const store = create(undefined, { legacyStorage: storage }); await store.hydrate();
    if (scope === 'quiz') await store.resetAllQuizzes();
    else if (scope === 'chapter') await store.resetChapter('chapter-1');
    else await store.resetAll();
    storage.setItem('quiz_best_scores', '{"1":99}');
    storage.setItem('quiz_current_session', '{"chapterId":1,"currentQuestion":1,"answers":{}}');
    storage.setItem('quiz_preferences', '{"version":"biostats"}');
    await store.refreshLegacy();
    expect(store.getSnapshot().data.legacyBestScores['chapter-1']).toBeUndefined();
    expect(store.getSnapshot().data.resumeByDevice['device-one']?.['chapter-1:quiz']).toBeUndefined();
    expect(store.getSnapshot().data.preferences.quiz.version).not.toBe('biostats');
    expect(store.getSnapshot().data.migration.sources.quiz_best_scores.raw).toBe('{"1":99}');
    expect(store.getSnapshot().data.migration.sources.quiz_current_session.raw).toContain('"currentQuestion":1');
    await begin(store, 'chapter-1', 'fresh-session');
    await store.setQuizPreferences({ version: 'engineering' }, { context: store.captureWriteContext() });
    expect(session(store).sessionId).toBe('fresh-session');
    expect(store.getSnapshot().data.preferences.quiz.version).toBe('engineering');
  });
});
