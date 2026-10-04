import { getChapterQuestions } from '@/lib/quiz/questionBank';
import { createPinnedQuizAttempt } from '@/lib/progress/quizContract';
import { createAccountBlockedBranch } from '@/lib/progress/cloud/sync';

const copy = value => JSON.parse(JSON.stringify(value));
// Reconstruct the durable record produced by the prior direct-payload path,
// using the full current bank and actual local begin/finish transactions.
export async function seedRetainedQuiz(store, persistence, { chapter = 4, suffix = 'native', oversized = false } = {}) {
  await store.hydrate();
  const selected = getChapterQuestions(chapter);
  const questions = copy(selected.questions);
  if (oversized) questions.forEach(question => { question.explanation = 'e'.repeat(40000); question.question = 'q'.repeat(20000); question.options = question.options.map(() => 'o'.repeat(20000)); });
  const bank = { revision: selected.bankRevision, requestedVersion: selected.requestedVersion, effectiveVersion: selected.effectiveVersion, questions };
  const startTime = Date.now() - 60000;
  const session = { sessionId: `retained-${suffix}`, chapterId: `chapter-${chapter}`, bank, currentQuestionId: questions[0].id, answersByQuestionId: { [questions[0].id]: { answer: questions[0].correct, timestamp: startTime + 1000 } }, flaggedQuestionIds: [], startTime, deadline: startTime + 1800000, isPaused: false, pausedRemaining: null };
  const context = store.captureWriteContext(`${session.chapterId}:quiz`);
  await store.beginQuizSession(chapter, session, { context });
  const before = await persistence.read(store.getSnapshot().data.ownerScope);
  const attemptId = `retained-attempt-${suffix}`;
  await store.finishQuizAttempt(chapter, { sessionId: session.sessionId, attemptId }, { context });
  const after = await persistence.read(store.getSnapshot().data.ownerScope);
  const originalId = after.closedQuizSessions[session.sessionId].operationId;
  const timestamp = after.data.quizAttempts[attemptId].date;
  const attempt = createPinnedQuizAttempt(session, { attemptId, date: timestamp });
  after.data.quizAttempts[attemptId] = copy(attempt);
  const operation = { id: originalId, type: 'quiz-finish', cloudContext: context.cloud, epoch: context.epoch, chapterEpoch: context.chapterEpochs[session.chapterId] || 0, containerEpochs: context.containerEpochs, chapterId: session.chapterId, guardContainerId: `${session.chapterId}:quiz`, sessionId: session.sessionId, attemptId, patch: {}, timestamp };
  const branch = createAccountBlockedBranch(after, before, operation);
  after.cloud = copy(before.cloud);
  const message = oversized ? 'Invalid cloud mutation: mutation:bytes' : 'Invalid cloud mutation: mutation:payload';
  after.cloud.blocked.push({ operationId: originalId, reason: message });
  after.accountBlocked = [...before.accountBlocked, branch];
  after.recovery = [...before.recovery, { reason: 'account-unsyncable', operationId: originalId, branchIndex: after.accountBlocked.length - 1, message }];
  await persistence.update(after.ownerScope, () => copy(after));
  await store.refresh();
  return { record: after, branch, originalId, context, attempt, session, message };
}
