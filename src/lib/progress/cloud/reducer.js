import { ACTIVITY_BY_ID, CURRICULUM, QUIZ_BY_ID } from '@/lib/curriculum/manifest';
import { isRecord } from '../schema';
import { ancestorsFor, chapterFor, cloneCloudValue, hashCloudValue, isCloudJson, normalizeAccountScope, validateCloudDocument, validateCloudMutation } from './schema';

const own = (value, key) => Object.hasOwn(value, key) ? value[key] : undefined;
const same = (a, b) => hashCloudValue(a) === hashCloudValue(b);
const contains = (parent, id) => parent === id || id.startsWith(`${parent}:`);
function targetFor(mutation) {
  const { type, payload } = mutation;
  if (type === 'complete') return payload.activityId;
  if (type === 'chapter-history') return payload.chapterId;
  if (type === 'quiz-finish') return `${payload.attempt.chapterId}:quiz`;
  if (type === 'quiz-close') return `${payload.chapterId}:quiz`;
  if (type === 'reset') return payload.targetId;
  return null;
}
function staleContext(document, mutation) {
  const current = document.checkpoints; const context = mutation.context;
  if (context.global !== current.global) return true;
  const target = targetFor(mutation);
  const all = mutation.type === 'guest-transfer' || mutation.type === 'reset' && mutation.payload.scope === 'global';
  const allQuizzes = mutation.type === 'quiz-preferences' || mutation.type === 'reset' && mutation.payload.scope === 'quizzes';
  const chapter = chapterFor(target);
  const chapterKeys = all ? new Set([...Object.keys(current.chapters), ...Object.keys(context.chapters)]) : chapter ? new Set([chapter]) : new Set();
  if (allQuizzes) for (const item of CURRICULUM.chapters) if (item.quiz) chapterKeys.add(item.id);
  if ([...chapterKeys].some(id => (own(current.chapters, id) || null) !== (own(context.chapters, id) || null))) return true;
  const keys = new Set([...Object.keys(current.containers), ...Object.keys(context.containers)]);
  const relevant = all ? [...keys] : allQuizzes ? [...keys].filter(id => Object.hasOwn(QUIZ_BY_ID, id)) : [...keys].filter(id => target && (ancestorsFor(target).includes(id) || contains(target, id)));
  return relevant.some(id => (own(current.containers, id) || null) !== (own(context.containers, id) || null));
}
function mergeChapter(previous = {}, patch) {
  const result = { ...previous }; const statuses = ['not_started', 'in_progress', 'completed'];
  if (patch.status !== undefined) result.status = statuses[Math.max(statuses.indexOf(result.status), statuses.indexOf(patch.status))];
  for (const field of ['progress', 'score', 'timeSpent']) if (patch[field] !== undefined) result[field] = Math.max(previous[field] || 0, patch[field]);
  for (const field of ['startedAt', 'completedAt', 'lastVisited', 'lastUpdated']) if (patch[field] !== undefined) result[field] = !previous[field] ? patch[field] : patch[field] === null ? previous[field] : ['startedAt', 'completedAt'].includes(field) ? [previous[field], patch[field]].sort()[0] : [previous[field], patch[field]].sort()[1];
  return result;
}
function addEvidence(facts, activityId, evidence) {
  const current = facts.activities[activityId] || { activityId, evidence: [] };
  const existing = current.evidence.find(item => item.id === evidence.id);
  if (existing && !same(existing, evidence)) return 'evidence-id-conflict';
  if (!existing) facts.activities[activityId] = { activityId, evidence: [...current.evidence, evidence] };
  return null;
}
function addAttempt(facts, attempt, operationId, { allowNewFinishedClosure = false } = {}) {
  if (Object.entries(facts.closedQuizSessions).some(([sessionId, closed]) => closed.attemptId === attempt.id && (sessionId !== attempt.sessionId || closed.chapterId !== attempt.chapterId))) return 'quiz-attempt-id-conflict';
  const existing = own(facts.quizAttempts, attempt.id);
  if (existing && !same(existing, attempt)) return 'quiz-attempt-id-conflict';
  if (attempt.legacy) { if (!existing) facts.quizAttempts[attempt.id] = attempt; return null; }
  const closure = own(facts.closedQuizSessions, attempt.sessionId);
  if (closure && (!existing && !allowNewFinishedClosure || closure.chapterId !== attempt.chapterId || closure.reason !== 'finished' || closure.attemptId !== attempt.id)) return 'quiz-session-closed';
  if (Object.values(facts.quizAttempts).some(item => !item.legacy && item.sessionId === attempt.sessionId && (item.id !== attempt.id || item.chapterId !== attempt.chapterId))) return 'quiz-session-attempt-conflict';
  if (!existing) facts.quizAttempts[attempt.id] = attempt;
  if (!closure) facts.closedQuizSessions[attempt.sessionId] = { chapterId: attempt.chapterId, operationId, reason: 'finished', attemptId: attempt.id };
  return null;
}
function addClosure(facts, sessionId, closure) {
  const previous = own(facts.closedQuizSessions, sessionId);
  if (previous && previous.chapterId !== closure.chapterId) return 'quiz-session-chapter-conflict';
  if (!previous) facts.closedQuizSessions[sessionId] = closure;
  return null;
}
function reset(document, mutation) {
  const { scope, targetId, closedSessions = [] } = mutation.payload;
  const facts = document.facts;
  if (scope === 'activity') {
    for (const id of Object.keys(facts.activities)) if (contains(targetId, id) || ancestorsFor(targetId).includes(id)) delete facts.activities[id];
    document.checkpoints.containers[targetId] = mutation.id;
  } else {
    const quizzesOnly = scope === 'quiz' || scope === 'quizzes';
    const chapter = chapterFor(targetId);
    for (const group of quizzesOnly ? ['quizAttempts', 'legacyBestScores'] : ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores']) {
      for (const [id, item] of Object.entries(facts[group])) if (!chapter || chapterFor(group === 'quizAttempts' ? item.chapterId : id) === chapter) delete facts[group][id];
    }
    if (scope === 'quizzes') facts.quizPreferences = {};
    if (scope === 'global') document.checkpoints.global = mutation.id;
    else if (scope === 'chapter') document.checkpoints.chapters[targetId] = mutation.id;
    else if (scope === 'quiz') document.checkpoints.containers[targetId] = mutation.id;
    else for (const id of Object.keys(QUIZ_BY_ID)) document.checkpoints.containers[id] = mutation.id;
  }
  for (const session of closedSessions) {
    const error = addClosure(facts, session.sessionId, { chapterId: session.chapterId, operationId: mutation.id, reason: 'reset' });
    if (error) return error;
  }
  return null;
}

function transfer(document, mutation, skipped) {
  const { facts, sourceOwnerScope, contentDigest } = mutation.payload;
  const sourceId = hashCloudValue(sourceOwnerScope);
  const source = document.transferSources[sourceId] || { seenFacts: {}, digests: {} };
  const priorClosures = new Set(Object.keys(document.facts.closedQuizSessions));
  if (Object.hasOwn(source.digests, contentDigest)) { skipped.push({ group: 'transfer', key: contentDigest, reason: 'already-transferred' }); return null; }
  function once(group, key, value, action) {
    const factId = hashCloudValue([group, key]);
    const fingerprint = hashCloudValue(value);
    const globalId = hashCloudValue([group, key, ...(['activities', 'quizAttempts', 'closedQuizSessions'].includes(group) ? [] : [fingerprint])]);
    const seen = own(source.seenFacts, factId) || own(document.transferredFacts, globalId);
    if (seen) {
      if (group === 'quizAttempts' && seen !== fingerprint) return 'quiz-attempt-id-conflict';
      source.seenFacts[factId] ||= fingerprint;
      skipped.push({ group, key, reason: 'previously-transferred' }); return null;
    }
    const error = action();
    if (error === 'quiz-session-closed') skipped.push({ group, key, reason: error });
    else if (error) return error;
    source.seenFacts[factId] = fingerprint;
    document.transferredFacts[globalId] = fingerprint;
    return null;
  }
  // Apply tombstones first; a previously cleared session cannot return with history.
  for (const [id, closure] of Object.entries(facts.closedQuizSessions)) {
    const error = once('closedQuizSessions', id, closure, () => addClosure(document.facts, id, closure));
    if (error) return error;
  }
  for (const [id, activity] of Object.entries(facts.activities)) for (const evidence of activity.evidence) {
    const error = once('activities', `${id}:${evidence.id}`, evidence, () => addEvidence(document.facts, id, evidence));
    if (error) return error;
  }
  for (const [id, attempt] of Object.entries(facts.quizAttempts)) {
    const closure = facts.closedQuizSessions[attempt.sessionId];
    const error = once('quizAttempts', id, attempt, () => addAttempt(document.facts, attempt, mutation.id, { allowNewFinishedClosure: !priorClosures.has(attempt.sessionId) && closure?.reason === 'finished' && closure.attemptId === id && closure.chapterId === attempt.chapterId }));
    if (error) return error;
  }
  for (const [id, chapter] of Object.entries(facts.chaptersLegacy)) for (const [field, value] of Object.entries(chapter)) {
    const error = once('chaptersLegacy', `${id}:${field}`, value, () => { document.facts.chaptersLegacy[id] = mergeChapter(document.facts.chaptersLegacy[id], { [field]: value }); return null; });
    if (error) return error;
  }
  for (const [id, best] of Object.entries(facts.legacyBestScores)) once('legacyBestScores', id, best, () => { const previous = document.facts.legacyBestScores[id]; document.facts.legacyBestScores[id] = !previous || best.percentage > previous.percentage ? best : previous; return null; });
  for (const [key, value] of Object.entries(facts.quizPreferences)) once('quizPreferences', key, value, () => { document.facts.quizPreferences[key] = value; return null; });
  source.digests[contentDigest] = mutation.id;
  document.transferSources[sourceId] = source;
  return null;
}

/** Identity comes from a verified caller; this function performs no authentication or IO. */
export function applyCloudMutation(document, mutation, options = {}) {
  const before = validateCloudDocument(document);
  const validation = validateCloudMutation(mutation);
  if (!before.valid || !validation.valid) throw new TypeError(`Invalid cloud progress: ${[...before.errors, ...validation.errors].join(', ')}`);
  if (!isCloudJson(options) || !isRecord(options) || Object.keys(options).some(key => key !== 'verifiedOwnerScope')) throw new TypeError('Cloud account ownership mismatch');
  let { verifiedOwnerScope } = options;
  try { verifiedOwnerScope = normalizeAccountScope(verifiedOwnerScope); }
  catch { throw new TypeError('Cloud account ownership mismatch'); }
  if (document?.ownerScope !== verifiedOwnerScope || mutation?.ownerScope !== verifiedOwnerScope) throw new TypeError('Cloud account ownership mismatch');
  const existing = own(document.receipts, mutation.id);
  if (existing) {
    if (existing.digest !== mutation.digest) throw new TypeError('Cloud mutation ID has another payload');
    return { document, outcome: { status: existing.status, reason: existing.reason, duplicate: true, changed: false, skipped: [] } };
  }
  const target = targetFor(mutation);
  let reason = mutation.type !== 'quiz-preferences' && mutation.context.containerId !== null && (target === null || !contains(mutation.context.containerId, target)) ? 'write-context-target-mismatch' : staleContext(document, mutation) ? 'write-predates-reset' : null;
  const next = cloneCloudValue(document); const skipped = [];
  if (!reason) {
    const { type, payload } = mutation;
    if (type === 'complete') reason = addEvidence(next.facts, payload.activityId, { id: mutation.id, kind: payload.kind, sourceKey: payload.sourceKey, completedAt: payload.completedAt });
    else if (type === 'chapter-history') next.facts.chaptersLegacy[payload.chapterId] = mergeChapter(next.facts.chaptersLegacy[payload.chapterId], payload.patch);
    else if (type === 'quiz-finish') reason = addAttempt(next.facts, payload.attempt, mutation.id);
    else if (type === 'quiz-close') reason = addClosure(next.facts, payload.sessionId, { chapterId: payload.chapterId, operationId: mutation.id, reason: payload.reason });
    else if (type === 'quiz-preferences') Object.assign(next.facts.quizPreferences, payload.patch);
    else if (type === 'reset') reason = reset(next, mutation);
    else reason = transfer(next, mutation, skipped);
  }
  const result = reason ? cloneCloudValue(document) : next;
  const status = reason ? 'rejected' : 'applied';
  result.receipts[mutation.id] = { digest: mutation.digest, type: mutation.type, status, reason, ...(mutation.type === 'reset' ? { resetScope: mutation.payload.scope, targetId: mutation.payload.targetId } : {}) };
  const after = validateCloudDocument(result, { ownerScope: verifiedOwnerScope });
  if (!after.valid) {
    const error = new TypeError(`Cloud progress capacity or validation failed: ${after.errors.join(', ')}`);
    error.code = after.errors.every(item => /:(?:limit|bytes)$/.test(item)) ? 'cloud-capacity' : 'cloud-validation';
    error.errors = after.errors;
    throw error;
  }
  return { document: result, outcome: { status, reason, duplicate: false, changed: !reason && (!same(document.facts, result.facts) || !same(document.checkpoints, result.checkpoints)), skipped: reason ? [] : skipped } };
}
