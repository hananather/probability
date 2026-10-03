import { afterEach, describe, expect, it } from 'vitest';
import { createProgressStore } from '@/lib/progress/store';
import { environment, memoryPersistence } from './helpers';
import { answer, quizSession, START } from './typed-fixtures';

const stores = [];
const copy = value => JSON.parse(JSON.stringify(value));
const current = store => store.getSnapshot().data.resumeByDevice['device-one']['chapter-1:quiz'].session;
async function create(db = memoryPersistence()) {
  const store = createProgressStore(environment(db)); stores.push(store);
  await store.hydrate();
  await store.beginQuizSession('chapter-1', quizSession(), { context: store.captureWriteContext('chapter-1:quiz') });
  return store;
}
afterEach(() => stores.splice(0).forEach(store => store.dispose()));

describe('active pinned quiz backup imports', () => {
  it('preserves newer answers and live controls when restoring an older backup', async () => {
    const db = memoryPersistence(); const store = await create(db);
    const backup = await store.exportProgress();
    await store.updateQuizSession('chapter-1', 'session-one', {
      answersByQuestionId: { 'ch1-q1': answer(1, START + 2000) },
      currentQuestionId: 'ch1-q2', flaggedQuestionIds: ['ch1-q2'],
      deadline: START + 2400000, isPaused: true, pausedRemaining: 500,
    }, { context: store.captureWriteContext('chapter-1:quiz') });
    const live = copy(current(store));
    expect(await store.importProgress(backup)).toBe(true);
    expect(current(store)).toEqual(live);
    const reloaded = createProgressStore(environment(db)); stores.push(reloaded); await reloaded.hydrate();
    expect(current(reloaded)).toEqual(live);
  });

  it('adds independent answers from a compatible backup without erasing live answers', async () => {
    const store = await create(); const backup = await store.exportProgress();
    backup.snapshot.resumeByDevice['device-one']['chapter-1:quiz'].session.answersByQuestionId = { 'ch1-q2': { ...answer([0, 1]), isCorrect: true } };
    await store.updateQuizSession('chapter-1', 'session-one', { answersByQuestionId: { 'ch1-q1': answer(1) } }, { context: store.captureWriteContext('chapter-1:quiz') });
    await store.importProgress(backup);
    expect(current(store).answersByQuestionId).toMatchObject({
      'ch1-q1': { answer: 1, isCorrect: true }, 'ch1-q2': { answer: [0, 1], isCorrect: true },
    });
  });

  it.each(['bank', 'startTime'])('retains conflicting same-session %s data for recovery without replacing pinned work', async field => {
    const store = await create(); const backup = await store.exportProgress();
    const incoming = backup.snapshot.resumeByDevice['device-one']['chapter-1:quiz'].session;
    if (field === 'bank') { incoming.bank.questions[0].question = 'Changed archived question'; incoming.bank.questions[0].correct = 0; }
    else incoming.startTime -= 1000;
    const live = copy(current(store));
    expect(await store.importProgress(backup)).toBe(true);
    expect(current(store)).toEqual(live);
    expect((await store.exportProgress()).recovery).toContainEqual({ reason: 'imported-file', raw: JSON.stringify(backup) });
  });

  it('uses answer timestamps for same-question merges and retains the live answer on a tie', async () => {
    const store = await create(); const backup = await store.exportProgress();
    const incoming = backup.snapshot.resumeByDevice['device-one']['chapter-1:quiz'].session;
    await store.updateQuizSession('chapter-1', 'session-one', { answersByQuestionId: { 'ch1-q1': answer(1, START + 2000) } }, { context: store.captureWriteContext('chapter-1:quiz') });
    for (const timestamp of [START + 1000, START + 2000]) {
      incoming.answersByQuestionId = { 'ch1-q1': { ...answer(0, timestamp), isCorrect: false } };
      await store.importProgress(backup);
      expect(current(store).answersByQuestionId['ch1-q1']).toMatchObject({ answer: 1, isCorrect: true });
    }
    incoming.answersByQuestionId = { 'ch1-q1': { ...answer(0, START + 3000), isCorrect: false } };
    await store.importProgress(backup);
    expect(current(store).answersByQuestionId['ch1-q1']).toMatchObject({ answer: 0, isCorrect: false, timestamp: START + 3000 });
  });

  it('does not replace or remove a live retake when an old closed session is imported', async () => {
    const store = await create(); const backup = await store.exportProgress();
    await store.beginQuizSession('chapter-1', quizSession({ sessionId: 'session-retake', startTime: START + 1000 }), { context: store.captureWriteContext('chapter-1:quiz') });
    const live = copy(current(store));
    await store.importProgress(backup);
    expect(current(store)).toEqual(live);
    expect((await store.exportProgress()).checkpoint.closedQuizSessions['session-one'].reason).toBe('replaced');
  });
});
