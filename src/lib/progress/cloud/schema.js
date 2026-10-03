import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { ACTIVITY_BY_ID, CURRICULUM, CURRICULUM_REVISION, QUIZ_BY_ID } from '@/lib/curriculum/manifest';
import { createEmptyProgress, isRecord, isSafeId, validateProgressSnapshot } from '../schema';

export const CLOUD_SCHEMA_VERSION = 1;
export const CLOUD_LIMITS = Object.freeze({
  documentBytes: 4 * 1024 * 1024, mutationBytes: 1024 * 1024,
  batchBytes: 2 * 1024 * 1024, batchMutations: 16,
  attempts: 1000, receipts: 10000, evidencePerActivity: 256,
  transferSources: 256, transferFactsPerSource: 10000, depth: 32, nodes: 100000,
});
const chapterIds = new Set(CURRICULUM.chapters.filter(chapter => chapter.published).map(chapter => chapter.id));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const digest = /^[a-f0-9]{64}$/;
const isDigest = value => typeof value === 'string' && digest.test(value);
const factKeys = ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores', 'quizPreferences', 'closedQuizSessions'];
const chapterFields = ['status', 'progress', 'score', 'timeSpent', 'lastVisited', 'lastUpdated', 'startedAt', 'completedAt'];
const commonAttempt = ['id', 'chapterId', 'date', 'legacy', 'bankRevision', 'requestedVersion', 'effectiveVersion', 'score', 'percentage', 'timeSpent', 'totalQuestions', 'correctAnswers'];
export const CLOUD_MUTATION_TYPES = Object.freeze(['complete', 'chapter-history', 'quiz-finish', 'quiz-close', 'quiz-preferences', 'reset', 'guest-transfer']);

export function normalizeCloudMutationId(value) {
  if (typeof value !== 'string' || !uuid.test(value)) throw new TypeError('Invalid cloud mutation ID');
  return value.toLowerCase();
}
export const isCloudMutationId = value => typeof value === 'string' && value === value.toLowerCase() && uuid.test(value);
export function normalizeAccountScope(value) {
  if (typeof value !== 'string' || !value.startsWith('account:') || !uuid.test(value.slice(8))) throw new TypeError('Cloud progress requires an account scope');
  return value.toLowerCase();
}
export const isAccountScope = value => typeof value === 'string' && value === value.toLowerCase() && value.startsWith('account:') && isCloudMutationId(value.slice(8));
export const isCloudChapter = value => typeof value === 'string' && chapterIds.has(value);
export const isCloudContainer = value => typeof value === 'string' && (Object.hasOwn(ACTIVITY_BY_ID, value) || Object.hasOwn(QUIZ_BY_ID, value));
export const chapterFor = value => typeof value !== 'string' ? null : ACTIVITY_BY_ID[value]?.chapterId || (chapterIds.has(value) ? value : Object.hasOwn(QUIZ_BY_ID, value) ? value.split(':')[0] : null);
export function ancestorsFor(id) {
  const result = [];
  if (typeof id !== 'string') return result;
  while (id) { result.push(id); id = ACTIVITY_BY_ID[id]?.parentId || null; }
  return result;
}

/** JSON inputs have no accessors, prototypes with behavior, cycles or sparse arrays. */
export function isCloudJson(value) {
  let nodes = 0;
  function visit(item, parents, depth) {
    if (++nodes > CLOUD_LIMITS.nodes || depth > CLOUD_LIMITS.depth) return false;
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return true;
    if (typeof item === 'number') return Number.isFinite(item);
    if ((!Array.isArray(item) && !isRecord(item)) || parents.has(item) || Object.getOwnPropertySymbols(item).length) return false;
    if (Array.isArray(item) && Object.getPrototypeOf(item) !== Array.prototype) return false;
    const descriptors = Object.getOwnPropertyDescriptors(item);
    const keys = Object.keys(item);
    if (Object.entries(descriptors).some(([key, descriptor]) => !(Array.isArray(item) && key === 'length') && (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')))) return false;
    if (Array.isArray(item) && (keys.length !== item.length || keys.some((key, index) => key !== String(index)))) return false;
    const next = new Set(parents).add(item);
    return keys.every(key => !['__proto__', 'prototype', 'constructor'].includes(key) && Object.hasOwn(descriptors[key], 'value') && visit(descriptors[key].value, next, depth + 1));
  }
  try { return visit(value, new Set(), 0); }
  catch { return false; }
}

export function canonicalJson(value) {
  if (!isCloudJson(value)) throw new TypeError('Cloud progress must contain bounded JSON data');
  function encode(item) {
    if (Array.isArray(item)) return `[${item.map(encode).join(',')}]`;
    if (isRecord(item)) return `{${Object.keys(item).sort().map(key => `${JSON.stringify(key)}:${encode(item[key])}`).join(',')}}`;
    return JSON.stringify(item);
  }
  return encode(value);
}
export const hashCloudValue = value => bytesToHex(sha256(utf8ToBytes(canonicalJson(value))));
export const cloneCloudValue = value => JSON.parse(canonicalJson(value));
const fields = (value, allowed, required = allowed) => isRecord(value) && Object.keys(value).every(key => allowed.includes(key)) && required.every(key => Object.hasOwn(value, key));
const sourceText = value => typeof value === 'string' && value.length > 0 && value.length <= 256;
const tokenMap = (value, allowed) => isRecord(value) && Object.entries(value).every(([key, token]) => allowed(key) && isCloudMutationId(token));
const bounded = (value, bytes) => utf8ToBytes(canonicalJson(value)).byteLength <= bytes;

export function validateClosedQuizSessions(value) {
  if (!isCloudJson(value) || !isRecord(value) || !Object.entries(value).every(([id, closure]) => isSafeId(id) && fields(closure, ['chapterId', 'operationId', 'reason', 'attemptId'], ['chapterId', 'operationId', 'reason']) && isCloudChapter(closure.chapterId) && isSafeId(closure.operationId) && ['finished', 'replaced', 'cleared', 'reset'].includes(closure.reason) && (closure.reason === 'finished' ? isSafeId(closure.attemptId) : closure.attemptId === undefined))) return false;
  const finishedIds = Object.values(value).filter(closure => closure.reason === 'finished').map(closure => closure.attemptId);
  return new Set(finishedIds).size === finishedIds.length;
}

function exactAttempt(attempt) {
  if (!fields(attempt, [...commonAttempt, ...(attempt?.legacy ? ['answersByIndex'] : ['sessionId', 'orderedQuestionIds', 'bank', 'answersByQuestionId'])])) return false;
  if (attempt.legacy) return attempt.legacy === true && (attempt.requestedVersion === null || ['engineering', 'biostats', 'social'].includes(attempt.requestedVersion)) && Object.values(attempt.answersByIndex || {}).every(answer => fields(answer, ['answer', 'isCorrect', 'timestamp']) && (!Array.isArray(answer.answer) || answer.answer.length <= 200));
  const bank = attempt.bank;
  return fields(bank, ['revision', 'requestedVersion', 'effectiveVersion', 'questions']) && Array.isArray(bank.questions) && bank.questions.every(question => fields(question, ['id', 'type', 'question', 'options', 'correct', 'explanation', 'topic', 'difficulty'], ['id', 'type', 'question', 'options', 'correct', 'explanation'])) && isRecord(attempt.answersByQuestionId) && Object.values(attempt.answersByQuestionId).every(answer => fields(answer, ['answer', 'timestamp', 'isCorrect']));
}

export function validateCloudFacts(value) {
  const errors = [];
  if (!isCloudJson(value) || !fields(value, factKeys)) return { valid: false, errors: ['facts:shape'] };
  for (const group of factKeys) if (!isRecord(value[group])) errors.push(`facts:${group}`);
  if (errors.length) return { valid: false, errors };
  for (const [id, activity] of Object.entries(value.activities)) {
    if (!fields(activity, ['activityId', 'evidence']) || activity.activityId !== id || !Array.isArray(activity.evidence) || new Set(activity.evidence.map(item => item?.id)).size !== activity.evidence.length) { errors.push(`activities:${id}`); continue; }
    if (activity.evidence.length > CLOUD_LIMITS.evidencePerActivity) errors.push(`activities:${id}:limit`);
    for (const item of activity.evidence) if (!fields(item, ['id', 'kind', 'sourceKey', 'completedAt']) || !isSafeId(item.id) || !sourceText(item.sourceKey)) errors.push(`activities:${id}:evidence`);
  }
  for (const [id, chapter] of Object.entries(value.chaptersLegacy)) if (!isCloudChapter(id) || !fields(chapter, chapterFields, [])) errors.push(`chaptersLegacy:${id}`);
  if (Object.keys(value.quizAttempts).length > CLOUD_LIMITS.attempts) errors.push('quizAttempts:limit');
  for (const [id, attempt] of Object.entries(value.quizAttempts)) if (!exactAttempt(attempt)) errors.push(`quizAttempts:${id}:shape`);
  for (const [id, best] of Object.entries(value.legacyBestScores)) if (!fields(best, ['percentage', 'sourceKey']) || !sourceText(best.sourceKey)) errors.push(`legacyBestScores:${id}:shape`);
  if (!validateClosedQuizSessions(value.closedQuizSessions)) errors.push('closedQuizSessions');
  if (!errors.length) {
    const local = createEmptyProgress({ ownerScope: 'guest:cloud-validation', deviceId: 'cloud-validation' });
    Object.assign(local, { activities: Object.fromEntries(Object.entries(value.activities).map(([id, activity]) => [id, { ...activity, generation: 0 }])), chaptersLegacy: value.chaptersLegacy, quizAttempts: value.quizAttempts, legacyBestScores: value.legacyBestScores });
    local.preferences.quiz = value.quizPreferences;
    try { errors.push(...validateProgressSnapshot(local).errors); }
    catch { errors.push('facts:canonical-validation'); }
  }
  const sessions = new Set();
  for (const attempt of Object.values(value.quizAttempts)) if (isRecord(attempt) && attempt.legacy === false) {
    if (!isSafeId(attempt.sessionId)) continue;
    if (sessions.has(attempt.sessionId)) errors.push('quizAttempts:duplicate-session');
    sessions.add(attempt.sessionId);
    const closure = value.closedQuizSessions[attempt.sessionId];
    if (closure && (closure.chapterId !== attempt.chapterId || closure.reason !== 'finished' || closure.attemptId !== attempt.id)) errors.push('quizAttempts:closure-conflict');
  }
  for (const [sessionId, closure] of Object.entries(value.closedQuizSessions)) {
    if (!isRecord(closure) || !isSafeId(closure.attemptId)) continue;
    const attempt = value.quizAttempts[closure?.attemptId];
    if (closure?.reason === 'finished' && attempt?.legacy === false && (attempt.sessionId !== sessionId || attempt.chapterId !== closure.chapterId)) errors.push('closedQuizSessions:attempt-conflict');
  }
  return { valid: errors.length === 0, errors };
}

export function emptyCloudFacts() {
  return { activities: {}, chaptersLegacy: {}, quizAttempts: {}, legacyBestScores: {}, quizPreferences: {}, closedQuizSessions: {} };
}
export function createEmptyCloudDocument(options) {
  if (!isCloudJson(options) || !fields(options, ['ownerScope'])) throw new TypeError('Invalid cloud account identity');
  let { ownerScope } = options;
  ownerScope = normalizeAccountScope(ownerScope);
  return { schemaVersion: CLOUD_SCHEMA_VERSION, ownerScope, curriculumRevision: CURRICULUM_REVISION, facts: emptyCloudFacts(), checkpoints: { global: null, chapters: {}, containers: {} }, receipts: {}, transferSources: {}, transferredFacts: {} };
}
export function validateCloudContext(value) {
  return isCloudJson(value) && fields(value, ['ownerScope', 'containerId', 'global', 'chapters', 'containers']) && isAccountScope(value.ownerScope) && (value.containerId === null || isCloudChapter(value.containerId) || isCloudContainer(value.containerId)) && (value.global === null || isCloudMutationId(value.global)) && tokenMap(value.chapters, isCloudChapter) && tokenMap(value.containers, isCloudContainer);
}

function validResetTarget(scope, targetId) {
  if (['global', 'quizzes'].includes(scope)) return targetId === null;
  if (scope === 'chapter') return isCloudChapter(targetId);
  if (scope === 'quiz') return typeof targetId === 'string' && Object.hasOwn(QUIZ_BY_ID, targetId);
  return scope === 'activity' && typeof targetId === 'string' && Object.hasOwn(ACTIVITY_BY_ID, targetId);
}

export function validateCloudDocument(value, options = {}) {
  const errors = [];
  if (!isCloudJson(options) || !fields(options, ['ownerScope'], [])) return { valid: false, errors: ['document:verification-owner'] };
  let ownerScope;
  if (Object.hasOwn(options, 'ownerScope')) {
    try { ownerScope = normalizeAccountScope(options.ownerScope); }
    catch { return { valid: false, errors: ['document:verification-owner'] }; }
  }
  if (!isCloudJson(value) || !fields(value, ['schemaVersion', 'ownerScope', 'curriculumRevision', 'facts', 'checkpoints', 'receipts', 'transferSources', 'transferredFacts'])) return { valid: false, errors: ['document:shape'] };
  if (value.schemaVersion !== CLOUD_SCHEMA_VERSION || !isAccountScope(value.ownerScope) || (ownerScope !== undefined && value.ownerScope !== ownerScope) || !isSafeId(value.curriculumRevision)) errors.push('document:identity');
  errors.push(...validateCloudFacts(value.facts).errors);
  if (!fields(value.checkpoints, ['global', 'chapters', 'containers']) || !validateCloudContext({ ...value.checkpoints, ownerScope: value.ownerScope, containerId: null })) errors.push('checkpoints');
  if (!isRecord(value.receipts) || Object.keys(value.receipts).length > CLOUD_LIMITS.receipts) errors.push('receipts:limit');
  else for (const [id, receipt] of Object.entries(value.receipts)) if (!isCloudMutationId(id) || !fields(receipt, ['digest', 'type', 'status', 'reason', 'resetScope', 'targetId'], ['digest', 'type', 'status', 'reason']) || !isDigest(receipt.digest) || !CLOUD_MUTATION_TYPES.includes(receipt.type) || !['applied', 'rejected'].includes(receipt.status) || (receipt.status === 'applied' ? receipt.reason !== null : !sourceText(receipt.reason)) || (receipt.type === 'reset' ? !validResetTarget(receipt.resetScope, receipt.targetId) : receipt.resetScope !== undefined || receipt.targetId !== undefined)) errors.push(`receipts:${id}`);
  if (isRecord(value.receipts) && isRecord(value.checkpoints)) {
    const matches = (token, scope, targetId) => token === null || isCloudMutationId(token) && value.receipts[token]?.status === 'applied' && value.receipts[token].type === 'reset' && value.receipts[token].resetScope === scope && value.receipts[token].targetId === targetId;
    if (!matches(value.checkpoints.global, 'global', null)) errors.push('checkpoints:global-receipt');
    for (const [id, token] of Object.entries(value.checkpoints.chapters || {})) if (!matches(token, 'chapter', id)) errors.push(`checkpoints:chapter-receipt:${id}`);
    for (const [id, token] of Object.entries(value.checkpoints.containers || {})) if (!matches(token, Object.hasOwn(QUIZ_BY_ID, id) ? 'quiz' : 'activity', id) && !(Object.hasOwn(QUIZ_BY_ID, id) && matches(token, 'quizzes', null))) errors.push(`checkpoints:container-receipt:${id}`);
  }
  if (!isRecord(value.transferSources) || Object.keys(value.transferSources).length > CLOUD_LIMITS.transferSources) errors.push('transferSources:limit');
  else for (const [sourceId, source] of Object.entries(value.transferSources)) {
    if (!isDigest(sourceId) || !fields(source, ['seenFacts', 'digests']) || !isRecord(source.seenFacts) || Object.keys(source.seenFacts).length > CLOUD_LIMITS.transferFactsPerSource || Object.entries(source.seenFacts).some(([key, fingerprint]) => !isDigest(key) || !isDigest(fingerprint)) || !isRecord(source.digests) || Object.entries(source.digests).some(([key, mutationId]) => !isDigest(key) || !isCloudMutationId(mutationId) || value.receipts?.[mutationId]?.type !== 'guest-transfer' || value.receipts[mutationId].status !== 'applied')) errors.push(`transferSources:${sourceId}`);
  }
  if (!isRecord(value.transferredFacts) || Object.keys(value.transferredFacts).length > CLOUD_LIMITS.transferFactsPerSource || Object.entries(value.transferredFacts).some(([key, fingerprint]) => !isDigest(key) || !isDigest(fingerprint))) errors.push('transferredFacts:limit');
  if (!bounded(value, CLOUD_LIMITS.documentBytes)) errors.push('document:bytes');
  return { valid: errors.length === 0, errors };
}

function payloadValid(type, payload) {
  if (type === 'complete') {
    if (!fields(payload, ['activityId', 'kind', 'sourceKey', 'completedAt']) || typeof payload.activityId !== 'string' || !Object.hasOwn(ACTIVITY_BY_ID, payload.activityId) || !sourceText(payload.sourceKey)) return false;
    const facts = emptyCloudFacts();
    facts.activities[payload.activityId] = { activityId: payload.activityId, evidence: [{ id: 'validation', kind: payload.kind, sourceKey: payload.sourceKey, completedAt: payload.completedAt }] };
    return validateCloudFacts(facts).valid;
  }
  if (type === 'chapter-history') {
    if (!fields(payload, ['chapterId', 'patch']) || !isCloudChapter(payload.chapterId)) return false;
    const facts = emptyCloudFacts(); facts.chaptersLegacy[payload.chapterId] = payload.patch;
    return validateCloudFacts(facts).valid;
  }
  if (type === 'quiz-finish') {
    if (!fields(payload, ['attempt']) || payload.attempt?.legacy !== false) return false;
    const facts = emptyCloudFacts(); facts.quizAttempts[payload.attempt.id] = payload.attempt;
    return validateCloudFacts(facts).valid;
  }
  if (type === 'quiz-close') return fields(payload, ['chapterId', 'sessionId', 'reason']) && isCloudChapter(payload.chapterId) && isSafeId(payload.sessionId) && ['replaced', 'cleared', 'reset'].includes(payload.reason);
  if (type === 'quiz-preferences') {
    if (!fields(payload, ['patch'])) return false;
    const facts = emptyCloudFacts(); facts.quizPreferences = payload.patch;
    return validateCloudFacts(facts).valid;
  }
  if (type === 'reset') {
    if (!fields(payload, ['scope', 'targetId', 'closedSessions'], ['scope', 'targetId']) || !['global', 'chapter', 'activity', 'quiz', 'quizzes'].includes(payload.scope)) return false;
    if (!validResetTarget(payload.scope, payload.targetId)) return false;
    return payload.closedSessions === undefined || Array.isArray(payload.closedSessions) && payload.closedSessions.length <= 200 && new Set(payload.closedSessions.map(item => item?.sessionId)).size === payload.closedSessions.length && payload.closedSessions.every(item => fields(item, ['sessionId', 'chapterId']) && isSafeId(item.sessionId) && isCloudChapter(item.chapterId) && (['global', 'quizzes'].includes(payload.scope) || item.chapterId === chapterFor(payload.targetId)) && payload.scope !== 'activity');
  }
  return type === 'guest-transfer' && fields(payload, ['sourceOwnerScope', 'contentDigest', 'facts']) && isSafeId(payload.sourceOwnerScope) && /^guest:[a-zA-Z0-9._-]+$/.test(payload.sourceOwnerScope) && isDigest(payload.contentDigest) && validateCloudFacts(payload.facts).valid && payload.contentDigest === hashCloudValue({ sourceOwnerScope: payload.sourceOwnerScope, facts: payload.facts });
}

export function validateCloudMutation(value) {
  const errors = [];
  if (!isCloudJson(value) || !fields(value, ['schemaVersion', 'id', 'ownerScope', 'deviceId', 'type', 'context', 'payload', 'digest'])) return { valid: false, errors: ['mutation:shape'] };
  if (value.schemaVersion !== CLOUD_SCHEMA_VERSION || !isCloudMutationId(value.id) || !isAccountScope(value.ownerScope) || !isSafeId(value.deviceId) || !CLOUD_MUTATION_TYPES.includes(value.type)) errors.push('mutation:identity');
  if (!validateCloudContext(value.context) || value.context.ownerScope !== value.ownerScope) errors.push('mutation:context');
  if (!payloadValid(value.type, value.payload)) errors.push('mutation:payload');
  const { digest: supplied, ...body } = value;
  if (!isDigest(supplied) || supplied !== hashCloudValue(body)) errors.push('mutation:digest');
  if (!bounded(value, CLOUD_LIMITS.mutationBytes)) errors.push('mutation:bytes');
  return { valid: errors.length === 0, errors };
}

export function createCloudMutation(options) {
  if (!isCloudJson(options) || !fields(options, ['id', 'deviceId', 'type', 'context', 'payload']) || !validateCloudContext(options.context)) throw new TypeError('Invalid cloud mutation parameters');
  let { id, deviceId, type, context, payload } = options;
  id = normalizeCloudMutationId(id);
  const body = cloneCloudValue({ schemaVersion: CLOUD_SCHEMA_VERSION, id, deviceId, ownerScope: context.ownerScope, type, context, payload });
  const mutation = { ...body, digest: hashCloudValue(body) };
  const result = validateCloudMutation(mutation);
  if (!result.valid) throw new TypeError(`Invalid cloud mutation: ${result.errors.join(', ')}`);
  return mutation;
}

export function captureCloudWriteContext(document, containerId = null) {
  const result = validateCloudDocument(document);
  if (!result.valid || (containerId !== null && !isCloudChapter(containerId) && !isCloudContainer(containerId))) throw new TypeError('Invalid cloud write context');
  return cloneCloudValue({ ownerScope: document.ownerScope, containerId, ...document.checkpoints });
}
