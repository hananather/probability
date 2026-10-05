import { validateProgressSnapshot } from '../schema';
import { isRecord } from '../schema';
import { cloneCloudValue, emptyCloudFacts, hashCloudValue, isCloudJson, validateClosedQuizSessions, validateCloudFacts } from './schema';

const pick = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
export function projectCloudQuizAttempt(attempt) {
  if (!isCloudJson(attempt) || !isRecord(attempt)) throw new TypeError('Quiz projection requires bounded JSON data');
  const result = pick(attempt, ['id', 'chapterId', 'date', 'legacy', 'bankRevision', 'requestedVersion', 'effectiveVersion', 'score', 'percentage', 'timeSpent', 'totalQuestions', 'correctAnswers', ...(attempt.legacy ? ['answersByIndex'] : ['sessionId', 'orderedQuestionIds', 'bank', 'answersByQuestionId'])]);
  if (attempt.legacy) result.answersByIndex = Object.fromEntries(Object.entries(attempt.answersByIndex).map(([id, answer]) => [id, pick(answer, ['answer', 'isCorrect', 'timestamp'])]));
  else {
    result.bank = pick(attempt.bank, ['revision', 'requestedVersion', 'effectiveVersion']);
    result.bank.questions = attempt.bank.questions.map(question => pick(question, ['id', 'type', 'question', 'options', 'correct', 'explanation', 'topic', 'difficulty']));
    result.answersByQuestionId = Object.fromEntries(Object.entries(attempt.answersByQuestionId).map(([id, answer]) => [id, pick(answer, ['answer', 'isCorrect', 'timestamp'])]));
  }
  return result;
}

/** Allowlisted learning evidence only; device locators and recovery archives stay local. */
export function projectCloudFacts(snapshot, options = {}) {
  if (!isCloudJson(snapshot) || !validateProgressSnapshot(snapshot).valid) throw new TypeError('Invalid local progress snapshot');
  if (!isCloudJson(options) || !isRecord(options) || Object.keys(options).some(key => key !== 'closedQuizSessions')) throw new TypeError('Invalid local quiz closure metadata');
  const { closedQuizSessions = {} } = options;
  if (!validateClosedQuizSessions(closedQuizSessions)) throw new TypeError('Invalid local quiz closure metadata');
  const facts = emptyCloudFacts();
  for (const [id, activity] of Object.entries(snapshot.activities)) {
    const evidence = activity.evidence.map(item => {
      const value = pick(item, ['kind', 'sourceKey', 'completedAt']);
      return { id: `evidence:${hashCloudValue({ activityId: id, ...value })}`, ...value };
    });
    facts.activities[id] = { activityId: id, evidence: [...new Map(evidence.map(item => [item.id, item])).values()] };
  }
  for (const [id, chapter] of Object.entries(snapshot.chaptersLegacy)) facts.chaptersLegacy[id] = pick(chapter, ['status', 'progress', 'score', 'timeSpent', 'lastVisited', 'lastUpdated', 'startedAt', 'completedAt']);
  for (const [id, attempt] of Object.entries(snapshot.quizAttempts)) facts.quizAttempts[id] = projectCloudQuizAttempt(attempt);
  for (const [id, best] of Object.entries(snapshot.legacyBestScores)) facts.legacyBestScores[id] = pick(best, ['percentage', 'sourceKey']);
  facts.quizPreferences = { ...snapshot.preferences.quiz };
  facts.closedQuizSessions = Object.fromEntries(Object.entries(closedQuizSessions).map(([id, closure]) => [id, pick(closure, ['chapterId', 'operationId', 'reason', 'attemptId'])]));
  const projected = cloneCloudValue(facts);
  const result = validateCloudFacts(projected);
  if (!result.valid) throw new TypeError(`Invalid cloud learning facts: ${result.errors.join(', ')}`);
  return projected;
}

export function createGuestTransferPayload(snapshot, options) {
  if (!isCloudJson(snapshot) || typeof snapshot?.ownerScope !== 'string' || !snapshot.ownerScope.startsWith('guest:')) throw new TypeError('Guest transfer requires a guest snapshot');
  const facts = projectCloudFacts(snapshot, options);
  const body = { sourceOwnerScope: snapshot.ownerScope, facts };
  return { ...body, contentDigest: hashCloudValue(body) };
}
