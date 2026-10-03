import { describe, expect, it } from 'vitest';
import { ACTIVITY_BY_ID, LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { migrateLegacyProgress } from '@/lib/progress/legacyMigration';
import { createEmptyProgress, validTimestamp, validateProgressSnapshot } from '@/lib/progress/schema';
import { isActivityCompleted, selectChapterProgress, selectCourseProgress, selectQuizProgress } from '@/lib/progress/selectors';
import { ATTEMPT_FIXTURE, HUB_FIXTURES, RAW_FIXTURES, TAB_FIXTURES } from './fixtures';

describe('legacy migration preserves facts and recovery data', () => {
  it('migrates every hub and tab fixture without crossing lesson scopes', () => {
    const snapshot = migrateLegacyProgress(RAW_FIXTURES, { ownerScope: 'guest:device-one', deviceId: 'device-one' });
    expect(validateProgressSnapshot(snapshot)).toEqual({ valid: true, errors: [] });
    for (const key of Object.keys({ ...HUB_FIXTURES, ...TAB_FIXTURES })) {
      for (const id of LEGACY_SOURCE_BY_KEY[key].targetIds) expect(isActivityCompleted(snapshot, id)).toBe(true);
    }
    for (const key of Object.keys(TAB_FIXTURES)) {
      const source = LEGACY_SOURCE_BY_KEY[key];
      expect(snapshot.resumeByDevice['device-one'][source.containerId].activityId).toBe(source.targetIds.at(-1));
    }
    expect(snapshot.ownerScope).toBe('guest:device-one');
    expect(snapshot.sync).toEqual({ status: 'local', pendingMutationIds: [] });
    expect(snapshot.migration.legacyMeta).toEqual({ userId: 'someone-else', pendingSync: true, version: '1.0.0' });
    expect(snapshot.activities['chapter-1:foundations'].evidence.every(record => record.completedAt === null)).toBe(true);
  });

  it('is deterministic across key order and idempotent when retried against its own snapshot', () => {
    const rawBefore = structuredClone(RAW_FIXTURES);
    const first = migrateLegacyProgress(RAW_FIXTURES);
    const reversed = migrateLegacyProgress(Object.fromEntries(Object.entries(RAW_FIXTURES).reverse()));
    expect(JSON.stringify(reversed)).toBe(JSON.stringify(first));
    expect(migrateLegacyProgress(RAW_FIXTURES, { existing: first })).toEqual(first);
    expect(RAW_FIXTURES).toEqual(rawBefore);
    expect(migrateLegacyProgress(RAW_FIXTURES)).toEqual(first);
  });

  it('keeps raw unknown, corrupt and ambiguous records while excluding them from attainment', () => {
    const raw = {
      chapter1Progress: JSON.stringify(['foundations', 'foundations', 'future-lesson', '__proto__', 1]),
      discreteDistributionsProgress: '{broken json',
      continuousDistributionsProgress: JSON.stringify({ completed: ['normal-distributions'] }),
      probLabProgress: JSON.stringify({ 'chapter-999': { status: 'completed' }, 'chapter-1': { status: 'completed', progress: 350, completedSections: ['1-0', 'constructor'] } }),
      'progressive-content-default': JSON.stringify({ currentSection: 1, quizCompletions: { 'section-1': true } }),
      unknownProgress: JSON.stringify({ secretOwnershipClaim: 'account:someone' }),
    };
    const snapshot = migrateLegacyProgress(raw);
    expect(selectCourseProgress(snapshot)).toMatchObject({ completedLessons: 1, totalLessons: 66, completedChapters: 0 });
    for (const [key, value] of Object.entries(raw)) expect(snapshot.migration.sources[key].raw).toBe(value);
    for (const key of Object.keys(raw)) expect(snapshot.unattributedLegacy[key].raw).toBe(raw[key]);
    expect(snapshot.chaptersLegacy['chapter-1'].status).toBe('completed');
    expect(snapshot.chaptersLegacy['chapter-1'].progress).toBeUndefined();
    expect(snapshot.activities['chapter-1:foundations'].evidence).toHaveLength(1);
    expect(snapshot.activities['resource:lesson-based-approach:sample-spaces']).toBeUndefined();
    expect(validateProgressSnapshot(snapshot).valid).toBe(true);
  });

  it('never expands a legacy chapter completed flag into fabricated activities or dates', () => {
    const snapshot = migrateLegacyProgress({ probLabProgress: JSON.stringify({ 'chapter-1': { status: 'completed', progress: 100, completedAt: '2025-01-01T12:00:00.000Z' } }) });
    expect(snapshot.activities).toEqual({});
    expect(snapshot.chaptersLegacy['chapter-1']).toMatchObject({ status: 'completed', completedAt: '2025-01-01T12:00:00.000Z' });
    expect(selectChapterProgress(snapshot, 1)).toMatchObject({ legacyStatus: 'completed', status: 'in_progress', primary: { completed: 0, total: 12, percentage: 0 } });
  });

  it('maps fixed journey indices, guards invalid stages, and preserves nested partial study', () => {
    const snapshot = migrateLegacyProgress({
      'monty-hall-journey-progress': JSON.stringify({ stage: 2, completed: [0, 1, -1, 4, 1.2] }),
      'descriptive-stats-journey-progress': JSON.stringify({ stage: 999, completed: [2] }),
      dataDescriptionsProgress: JSON.stringify(['intuitive-intro']),
    });
    expect(isActivityCompleted(snapshot, 'chapter-1:monty-hall-masterclass:intro')).toBe(true);
    expect(isActivityCompleted(snapshot, 'chapter-1:monty-hall-masterclass:play')).toBe(true);
    expect(isActivityCompleted(snapshot, 'chapter-1:monty-hall-masterclass:proof')).toBe(false);
    expect(snapshot.resumeByDevice.local['chapter-1:monty-hall-masterclass'].activityId).toBe('chapter-1:monty-hall-masterclass:proof');
    expect(snapshot.resumeByDevice.local['chapter-4:central-tendency:descriptive-stats-journey']).toBeUndefined();
    expect(isActivityCompleted(snapshot, 'chapter-4:central-tendency:descriptive-stats-journey:quartiles')).toBe(true);
    expect(selectChapterProgress(snapshot, 4)).toMatchObject({ status: 'in_progress', primary: { completed: 0 } });
    expect(snapshot.unattributedLegacy['monty-hall-journey-progress']).toBeDefined();
    expect(snapshot.unattributedLegacy['descriptive-stats-journey-progress']).toBeDefined();
  });

  it('preserves MDX spacer locators and maps only its four actual knowledge checks', () => {
    const snapshot = migrateLegacyProgress({ 'progressive-content-/lesson-based-approach': JSON.stringify({ currentSection: 2, quizCompletions: { 'section-1': true, 'section-2': true, 'section-3': false, 'section-7': true }, lastUpdated: '2025-01-01T12:00:00Z' }) });
    expect(snapshot.resumeByDevice.local['resource:lesson-based-approach']).toMatchObject({ activityId: null, legacyIndex: 2 });
    expect(isActivityCompleted(snapshot, 'resource:lesson-based-approach:sample-spaces')).toBe(true);
    expect(isActivityCompleted(snapshot, 'resource:lesson-based-approach:complementary-events')).toBe(true);
    expect(isActivityCompleted(snapshot, 'resource:lesson-based-approach:events')).toBe(false);
    expect(snapshot.activities['resource:lesson-based-approach:sample-spaces'].evidence[0]).toMatchObject({ kind: 'knowledge-check-completed', completedAt: null });
    expect(selectCourseProgress(snapshot).completedLessons).toBe(0);
    expect(snapshot.unattributedLegacy['progressive-content-/lesson-based-approach']).toBeDefined();
  });

  it('recovers the new section-resume family without guessing title-derived activity identities', () => {
    const key = 'probability:resume:section:/chapter1/01-foundations:unregistered-foundations';
    const raw = JSON.stringify({ index: 2, sectionId: 'probability-models' });
    const snapshot = migrateLegacyProgress({ [key]: raw });
    expect(snapshot.unattributedLegacy[key]).toEqual({ raw, issues: ['unattributed-source'] });
    expect(snapshot.migration.sources[key].raw).toBe(raw);
    expect(snapshot.activities).toEqual({});
    expect(selectCourseProgress(snapshot).completedLessons).toBe(0);
  });

  it('preserves historical scores and index answers without inventing bank identity or regrading', () => {
    const snapshot = migrateLegacyProgress({ quiz_attempts: RAW_FIXTURES.quiz_attempts, quiz_best_scores: RAW_FIXTURES.quiz_best_scores });
    const [attempt] = Object.values(snapshot.quizAttempts);
    expect(attempt).toMatchObject({ chapterId: 'chapter-1', legacy: true, originalId: ATTEMPT_FIXTURE.id, percentage: 60, requestedVersion: 'social', effectiveVersion: null, bankRevision: null, answersByIndex: ATTEMPT_FIXTURE.answers });
    expect(attempt.answersByQuestionId).toBeUndefined();
    expect(selectQuizProgress(snapshot, 1)).toMatchObject({ attemptCount: 1, bestScore: 90, legacyBestScore: 90, passingScore: 50, passed: true });
    expect(selectQuizProgress(snapshot, 2)).toMatchObject({ attemptCount: 0, attempted: true, bestScore: 0, passed: false });
  });

  it('retains all supplied attempts, same-date collisions, and distinguishable identical records', () => {
    const records = Array.from({ length: 12 }, (_, index) => ({ ...ATTEMPT_FIXTURE, percentage: index * 5 }));
    records.push(ATTEMPT_FIXTURE, ATTEMPT_FIXTURE);
    const raw = { quiz_attempts: JSON.stringify({ 1: records }) };
    const snapshot = migrateLegacyProgress(raw);
    expect(Object.values(snapshot.quizAttempts)).toHaveLength(14);
    expect(new Set(Object.keys(snapshot.quizAttempts)).size).toBe(14);
    expect(Object.values(snapshot.quizAttempts).every(attempt => attempt.originalId === ATTEMPT_FIXTURE.id)).toBe(true);
    expect(migrateLegacyProgress(raw, { existing: snapshot })).toEqual(snapshot);
  });

  it('quarantines invalid scores, mismatched chapters and answer keys without a crash or pollution', () => {
    const raw = JSON.parse('{"__proto__":"{\\"polluted\\":true}","constructor":"{}","quiz_best_scores":"{\\"1\\":101,\\"2\\":-2,\\"8\\":100,\\"999\\":100}"}');
    raw.quiz_attempts = JSON.stringify({ 1: [{ ...ATTEMPT_FIXTURE, percentage: 101, answers: JSON.parse('{"__proto__":{"polluted":true},"0":{"answer":1,"isCorrect":true}}') }, { ...ATTEMPT_FIXTURE, chapterId: 2 }] });
    const snapshot = migrateLegacyProgress(raw);
    expect({}.polluted).toBeUndefined();
    expect(Object.hasOwn(snapshot.unattributedLegacy, '__proto__')).toBe(true);
    expect(snapshot.unattributedLegacy.__proto__.raw).toBe(raw.__proto__);
    expect(snapshot.legacyBestScores).toEqual({});
    expect(Object.values(snapshot.quizAttempts)).toHaveLength(1);
    expect(Object.values(snapshot.quizAttempts)[0].percentage).toBeNull();
    expect(Object.hasOwn(Object.values(snapshot.quizAttempts)[0].answersByIndex, '__proto__')).toBe(false);
    expect(validateProgressSnapshot(snapshot).valid).toBe(true);
  });

  it('separates UI preferences from attainment and guards cross-owner/device migration', () => {
    const snapshot = migrateLegacyProgress({ quiz_preferences: RAW_FIXTURES.quiz_preferences, quiz_current_session: RAW_FIXTURES.quiz_current_session, sidebarOpen: 'false', chapter1Progress_devMode: 'true', 'tutorial-test-completed': 'skipped' }, { ownerScope: 'guest:one', deviceId: 'one' });
    expect(snapshot.preferences.quiz).toEqual({ showTimer: false, immediateFeedback: true, showQuestionNumbers: true, allowSkipping: false, version: 'social' });
    expect(snapshot.preferences.device).toEqual({ sidebarOpen: false, chapter1Progress_devMode: true, 'tutorial-test-completed': 'skipped' });
    expect(selectCourseProgress(snapshot).completedLessons).toBe(0);
    expect(snapshot.resumeByDevice.one['chapter-1:quiz']).toMatchObject({ bankRevision: null, compatibility: 'unverified', legacySession: { chapterId: 'chapter-1', deadline: 1700000120000, isPaused: true, pausedRemaining: 120 } });
    expect(() => migrateLegacyProgress({}, { existing: snapshot, ownerScope: 'guest:two' })).toThrow(/owners or devices/);
    expect(() => migrateLegacyProgress({}, { existing: snapshot, deviceId: 'two' })).toThrow(/owners or devices/);
    expect(() => createEmptyProgress({ ownerScope: 'account:someone' })).toThrow();
    expect(createEmptyProgress({ ownerScope: 'account:12345678-1234-1234-1234-123456789abc' }).ownerScope).toBe('account:12345678-1234-1234-1234-123456789abc');
  });

  it('merges a changed source without discarding earlier facts or the original raw record', () => {
    const firstRaw = { chapter1Progress: '["foundations"]' };
    const first = migrateLegacyProgress(firstRaw);
    const secondRaw = { chapter1Progress: '["probability-dictionary"]' };
    const second = migrateLegacyProgress(secondRaw, { existing: first });
    expect(selectChapterProgress(second, 1).primary.completed).toBe(2);
    expect(second.migration.sources.chapter1Progress.previous).toEqual([{ fingerprint: first.migration.sources.chapter1Progress.fingerprint, raw: firstRaw.chapter1Progress }]);
    expect(first.migration.sources.chapter1Progress.raw).toBe(firstRaw.chapter1Progress);
    expect(migrateLegacyProgress(secondRaw, { existing: second })).toEqual(second);
  });

  it('does not resurrect reset facts when the store retains the migration checkpoint', () => {
    const first = migrateLegacyProgress(RAW_FIXTURES);
    const reset = { ...createEmptyProgress(), migration: structuredClone(first.migration) };
    const retried = migrateLegacyProgress(RAW_FIXTURES, { existing: reset });
    expect(retried.activities).toEqual({});
    expect(retried.quizAttempts).toEqual({});
    expect(retried.legacyBestScores).toEqual({});
    expect(selectCourseProgress(retried)).toMatchObject({ completedLessons: 0, passedQuizzes: 0 });
  });

  it.each([
    { arbitrary: { answer: {}, isCorrect: 'yes', timestamp: -5 } },
    { 0: { answer: 1, isCorrect: true, timestamp: -5 } },
  ])('rejects malformed normalized answer records before reusing a snapshot', answersByIndex => {
    const snapshot = migrateLegacyProgress({ quiz_attempts: RAW_FIXTURES.quiz_attempts });
    const id = Object.keys(snapshot.quizAttempts)[0];
    const corrupt = { ...snapshot, quizAttempts: { [id]: { ...snapshot.quizAttempts[id], answersByIndex } } };
    expect(validateProgressSnapshot(corrupt).valid).toBe(false);
    expect(() => migrateLegacyProgress({}, { existing: corrupt })).toThrow();
  });

  it.each([{ pendingMutationIds: [null, { bad: 'id' }] }, { pendingMutationIds: ['same-id', 'same-id'] }])('rejects malformed or duplicate pending mutation identifiers', ({ pendingMutationIds }) => {
    const snapshot = createEmptyProgress();
    const corrupt = { ...snapshot, sync: { status: 'local', pendingMutationIds } };
    expect(validateProgressSnapshot(corrupt).valid).toBe(false);
    expect(() => migrateLegacyProgress({}, { existing: corrupt })).toThrow();
  });

  it('validates schema and date boundaries without accepting rolled-over calendar dates', () => {
    const snapshot = createEmptyProgress();
    expect(validateProgressSnapshot(snapshot)).toEqual({ valid: true, errors: [] });
    expect(validateProgressSnapshot({ ...snapshot, schemaVersion: 1 }).valid).toBe(false);
    expect(validateProgressSnapshot({ ...snapshot, activities: { unknown: { activityId: 'unknown', generation: -1, evidence: [] } } }).valid).toBe(false);
    expect(validateProgressSnapshot({ ...snapshot, migration: {} }).valid).toBe(false);
    for (const corrupt of [
      { resumeByDevice: { local: [] } },
      { resumeByDevice: { local: { unknown: { containerId: 'unknown', activityId: null, kind: 'section' } } } },
      { preferences: { quiz: { showTimer: 'yes' }, device: {} } },
      { migration: { sources: { chapter1Progress: null }, issues: [] } },
      { migration: { sources: {}, issues: [null] } },
      { unattributedLegacy: { unknown: { raw: 'original', issues: null } } },
    ]) {
      expect(validateProgressSnapshot({ ...snapshot, ...corrupt }).valid).toBe(false);
      expect(() => migrateLegacyProgress({}, { existing: { ...snapshot, ...corrupt } })).toThrow();
    }
    expect(validTimestamp('2026-02-30T12:00:00Z')).toBeNull();
    expect(validTimestamp('2024-02-29T12:00:00Z')).toBe('2024-02-29T12:00:00.000Z');
    expect(validTimestamp('42')).toBeNull();
    expect(() => migrateLegacyProgress([], {})).toThrow();
    expect(() => migrateLegacyProgress({ chapter1Progress: [] })).toThrow();
    expect(migrateLegacyProgress({ chapter1Progress: null })).toEqual(snapshot);
    expect(ACTIVITY_BY_ID['chapter-1:foundations']).toBeDefined();
  });
});

describe('manifest-derived progress selectors', () => {
  it('uses 66 primary lessons, seven chapters, and five separate chapter-six bonus lessons', () => {
    const snapshot = migrateLegacyProgress(RAW_FIXTURES);
    expect(selectCourseProgress(snapshot)).toEqual({ totalChapters: 7, completedChapters: 7, inProgressChapters: 0, completedLessons: 66, totalLessons: 66, percentage: 100, attemptedQuizzes: 2, passedQuizzes: 1, totalQuizzes: 7 });
    expect(selectChapterProgress(snapshot, 6)).toMatchObject({ primary: { completed: 10, total: 10, percentage: 100 }, bonus: { completed: 5, total: 5, percentage: 100 } });
    expect(selectChapterProgress(snapshot, 8)).toMatchObject({ published: false, primary: { total: 0, percentage: 0 } });
    expect(selectChapterProgress(snapshot, 99)).toBeNull();
  });

  it('does not increase primary progress for bonus-only learning or unknown IDs', () => {
    const snapshot = migrateLegacyProgress({ hypothesisTestingBonusProgress: JSON.stringify(HUB_FIXTURES.hypothesisTestingBonusProgress) });
    expect(selectCourseProgress(snapshot)).toMatchObject({ completedLessons: 0, percentage: 0, completedChapters: 0, inProgressChapters: 1 });
    expect(selectChapterProgress(snapshot, 6)).toMatchObject({ primary: { percentage: 0 }, bonus: { percentage: 100 } });
    expect(isActivityCompleted(snapshot, 'constructor')).toBe(false);
  });

  it('completes a tabbed lesson only when every required child or explicit lesson evidence exists', () => {
    const partial = migrateLegacyProgress({ 'chapter1-foundations-progress': '["foundations","worked-examples","quick-reference"]' });
    expect(selectChapterProgress(partial, 1)).toMatchObject({ status: 'in_progress', primary: { completed: 0 } });
    const complete = migrateLegacyProgress({ 'chapter1-foundations-progress': JSON.stringify(TAB_FIXTURES['chapter1-foundations-progress']) });
    expect(selectChapterProgress(complete, 1).primary.completed).toBe(1);
    expect(selectChapterProgress(migrateLegacyProgress({ chapter1Progress: '["foundations"]' }), 1).primary.completed).toBe(1);
  });

  it.each([49, 50, 69, 70])('uses the source bank 50%% passing threshold at %i%%', percentage => {
    const snapshot = migrateLegacyProgress({ quiz_best_scores: JSON.stringify({ 1: percentage }) });
    expect(selectQuizProgress(snapshot, 1).passed).toBe(percentage >= 50);
    expect(selectCourseProgress(snapshot).passedQuizzes).toBe(percentage >= 50 ? 1 : 0);
    expect(selectCourseProgress(snapshot).completedLessons).toBe(0);
  });
});
