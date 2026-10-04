import { afterEach, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createAccountProgressStore } from '@/lib/progress/store';
import { createIndexedDbPersistence } from '@/lib/progress/persistence';
import { getChapterQuestions, QUIZ_VERSIONS } from '@/lib/quiz/questionBank';
import { createPinnedQuizAttempt, validatePinnedQuizAttempt } from '@/lib/progress/quizContract';
import { validateCloudMutation } from '@/lib/progress/cloud/schema';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { readAccountProgress, writeAccountProgress } from '@/lib/auth/progressAdapter';
import { ACCOUNT_A, copy, DATE, uuid } from '../helpers';

const resources = [];
let counter = 200000;
const startTime = Date.parse(DATE) - 60000;
afterEach(() => resources.splice(0).forEach(store => store.dispose()));
function createStore(factory = new IDBFactory(), deviceId = 'full-bank-device') {
  const persistence = createIndexedDbPersistence({ indexedDB: factory });
  const store = createAccountProgressStore({ persistence, accountId: ACCOUNT_A.slice(8), deviceId, createId: () => uuid(++counter), now: () => DATE, legacyStorage: null, importLegacy: false, pollInterval: 0, eventTarget: new EventTarget(), document: new EventTarget(), broadcastFactory: () => null });
  resources.push(store); return { store, persistence, factory };
}
function bankSession(chapter, version) {
  const selected = getChapterQuestions(chapter, version);
  const bank = { revision: selected.bankRevision, requestedVersion: selected.requestedVersion, effectiveVersion: selected.effectiveVersion, questions: copy(selected.questions) };
  const answersByQuestionId = Object.fromEntries(bank.questions.slice(0, 1).map(question => [question.id, { answer: copy(question.correct), timestamp: startTime + 1000 }]));
  return { sessionId: `full-${chapter}-${version}`, chapterId: `chapter-${chapter}`, bank, currentQuestionId: bank.questions[0].id, answersByQuestionId, flaggedQuestionIds: [], startTime, deadline: startTime + 1800000, isPaused: false, pausedRemaining: null };
}

// Only the database query boundary is controlled; the production CAS adapter,
// document reducer, validation and mutation acknowledgements are exercised.
function database() {
  let row;
  const client = { from() {
    let op = 'read'; let value; const filters = {};
    const query = {
      select: () => query,
      eq(key, entry) { filters[key] = entry; return query; },
      insert(entry) { op = 'insert'; value = copy(entry); return query; },
      update(entry) { op = 'update'; value = copy(entry); return query; },
      async maybeSingle() {
        if (op === 'read') return { data: row ? copy(row) : null, error: null };
        if (op === 'insert' && row) return { data: null, error: { code: '23505' } };
        if (op === 'update' && (filters.user_id !== row?.user_id || filters.revision !== row.revision)) return { data: null, error: null };
        row = { ...row, ...value, updated_at: DATE }; return { data: copy(row), error: null };
      },
    }; return query;
  } }; return { client, get row() { return row; } };
}

it.each(Array.from({ length: 7 }, (_, index) => index + 1).flatMap(chapter => QUIZ_VERSIONS.map(version => [chapter, version])))('queues, validates and acknowledges the actual complete Chapter %s %s bank without changing its grade or instructional content', async (chapter, version) => {
  const { store, persistence } = createStore();
  const session = bankSession(chapter, version); const original = copy(session);
  const expected = createPinnedQuizAttempt(session, { attemptId: `attempt-${chapter}-${version}`, date: DATE });
  const db = database(); await store.acceptCloudResponse(await readAccountProgress(db.client, ACCOUNT_A.slice(8)));
  const context = store.captureWriteContext(`${session.chapterId}:quiz`);
  expect((await store.beginQuizSession(chapter, session, { context })).persisted).toBe(true);
  const result = await store.finishQuizAttempt(chapter, { sessionId: session.sessionId, attemptId: expected.id }, { context });
  expect(result).toMatchObject({ applied: true, persisted: true });
  expect(store.getSnapshot().cloud.blockedMutations).toBe(0);
  const [mutation] = await store.getCloudBatch();
  expect(mutation?.type).toBe('quiz-finish'); expect(validateCloudMutation(mutation).valid).toBe(true);
  const attempt = mutation.payload.attempt;
  expect(validatePinnedQuizAttempt(attempt).valid).toBe(true);
  expect(attempt).toMatchObject({ id: expected.id, sessionId: expected.sessionId, requestedVersion: expected.requestedVersion, effectiveVersion: expected.effectiveVersion, totalQuestions: session.bank.questions.length, score: 1, correctAnswers: 1, percentage: Math.round(100 / session.bank.questions.length), orderedQuestionIds: expected.orderedQuestionIds, answersByQuestionId: expected.answersByQuestionId, date: DATE, timeSpent: 60 });
  for (let index = 0; index < session.bank.questions.length; index++) {
    const question = session.bank.questions[index];
    expect(attempt.bank.questions[index]).toEqual(Object.fromEntries(Object.entries(question).filter(([key]) => key !== 'helpLink')));
  }
  expect(session).toEqual(original);
  const acknowledged = await writeAccountProgress(db.client, ACCOUNT_A.slice(8), [mutation]);
  expect(acknowledged.outcomes).toMatchObject([{ id: mutation.id, status: 'applied' }]);
  await store.acceptCloudResponse(acknowledged);
  expect(await store.getCloudBatch()).toEqual([]); expect(store.getSnapshot().cloud.blockedMutations).toBe(0);
  expect(db.row.document.facts.quizAttempts[expected.id]).toEqual(attempt);
  const durable = await persistence.read(ACCOUNT_A);
  expect(durable.data.quizAttempts[expected.id]).toEqual(attempt);
  const second = createStore(new IDBFactory(), 'second-full-bank-device').store;
  await second.acceptCloudResponse(await readAccountProgress(db.client, ACCOUNT_A.slice(8)));
  expect(second.getSnapshot().data.quizAttempts[expected.id]).toEqual(attempt);
  expect(second.getSnapshot().data.resumeByDevice['second-full-bank-device']?.[`${session.chapterId}:quiz`]).toBeUndefined();
  const tampered = copy(mutation); tampered.payload.attempt.percentage = attempt.percentage === 100 ? 0 : 100;
  expect(validateCloudMutation(tampered).valid).toBe(false);
  expect(() => applyCloudMutation(acknowledged.document, tampered, { verifiedOwnerScope: ACCOUNT_A })).toThrow();
});
