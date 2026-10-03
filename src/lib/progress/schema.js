import { ACTIVITY_BY_ID, CURRICULUM, CURRICULUM_REVISION, resolveChapterId } from '@/lib/curriculum/manifest';
import { validatePinnedQuizAttempt, validateQuizSession } from './quizContract';

export const PROGRESS_SCHEMA_VERSION = 2;

export function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isFiniteNumber(value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

export function isSafeId(value) {
  return typeof value === 'string' && !['__proto__', 'constructor', 'prototype'].includes(value) && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,255}$/.test(value);
}

export function isOwnerScope(value) {
  return isSafeId(value) && (/^guest:[a-zA-Z0-9._-]+$/.test(value) || /^account:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

export function isLegacyAnswerValue(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.every(item => typeof item === 'boolean' || (typeof item === 'string' && item.length <= 1000) || isFiniteNumber(item, -Number.MAX_SAFE_INTEGER));
}

export function validTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const normalized = new Date(time).toISOString();
  return normalized.slice(0, 19) === value.slice(0, 19) ? normalized : null;
}

/** Ownership is supplied by the caller, never copied from a legacy import. */
export function createEmptyProgress({ ownerScope = 'guest:local', deviceId = 'local' } = {}) {
  if (!isOwnerScope(ownerScope) || !isSafeId(deviceId)) throw new TypeError('Invalid progress ownership');
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    ownerScope,
    deviceId,
    curriculumRevision: CURRICULUM_REVISION,
    activities: {},
    chaptersLegacy: {},
    quizAttempts: {},
    legacyBestScores: {},
    resumeByDevice: {},
    preferences: { quiz: {}, device: {} },
    unattributedLegacy: {},
    migration: { sources: {}, issues: [] },
    sync: { status: 'local', pendingMutationIds: [] },
  };
}

/** Pure validation; it neither repairs data nor writes it to storage. */
export function validateProgressSnapshot(value) {
  const errors = [];
  if (!isRecord(value)) return { valid: false, errors: ['snapshot:object'] };
  if (value.schemaVersion !== PROGRESS_SCHEMA_VERSION) errors.push('schemaVersion');
  if (!isOwnerScope(value.ownerScope)) errors.push('ownerScope');
  if (!isSafeId(value.deviceId)) errors.push('deviceId');
  if (typeof value.curriculumRevision !== 'string') errors.push('curriculumRevision');
  for (const key of ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores', 'resumeByDevice', 'preferences', 'unattributedLegacy', 'migration', 'sync']) {
    if (!isRecord(value[key])) errors.push(`${key}:object`);
  }
  for (const [id, activity] of Object.entries(isRecord(value.activities) ? value.activities : {})) {
    if (!Object.hasOwn(ACTIVITY_BY_ID, id) || !isRecord(activity) || activity.activityId !== id) errors.push(`activities:${id}`);
    if (!Array.isArray(activity?.evidence) || !Number.isInteger(activity?.generation) || activity.generation < 0) errors.push(`activities:${id}:evidence`);
    for (const evidence of Array.isArray(activity?.evidence) ? activity.evidence : []) {
      if (!isRecord(evidence) || !['study-completed', 'knowledge-check-completed'].includes(evidence.kind) || typeof evidence.sourceKey !== 'string' || (evidence.completedAt !== null && !validTimestamp(evidence.completedAt))) errors.push(`activities:${id}:evidence-record`);
    }
  }
  for (const [id, chapter] of Object.entries(isRecord(value.chaptersLegacy) ? value.chaptersLegacy : {})) {
    if (resolveChapterId(id) !== id || !isRecord(chapter)) errors.push(`chaptersLegacy:${id}`);
    if (chapter?.status !== undefined && !['not_started', 'in_progress', 'completed'].includes(chapter.status)) errors.push(`chaptersLegacy:${id}:status`);
    for (const field of ['progress', 'score', 'timeSpent']) {
      if (chapter?.[field] !== undefined && !isFiniteNumber(chapter[field], 0, field === 'timeSpent' ? Number.MAX_SAFE_INTEGER : 100)) errors.push(`chaptersLegacy:${id}:${field}`);
    }
    for (const field of ['lastVisited', 'lastUpdated', 'startedAt', 'completedAt']) {
      if (chapter?.[field] !== undefined && chapter[field] !== null && !validTimestamp(chapter[field])) errors.push(`chaptersLegacy:${id}:${field}`);
    }
  }
  for (const [id, attempt] of Object.entries(isRecord(value.quizAttempts) ? value.quizAttempts : {})) {
    if (!isSafeId(id) || !isRecord(attempt) || attempt.id !== id || resolveChapterId(attempt.chapterId) !== attempt.chapterId || attempt.chapterId === 'chapter-8') errors.push(`quizAttempts:${id}`);
    if (attempt?.percentage !== null && !isFiniteNumber(attempt?.percentage, 0, 100)) errors.push(`quizAttempts:${id}:percentage`);
    for (const field of ['score', 'timeSpent', 'totalQuestions', 'correctAnswers']) {
      if (attempt?.[field] !== null && !isFiniteNumber(attempt?.[field])) errors.push(`quizAttempts:${id}:${field}`);
    }
    for (const field of ['totalQuestions', 'correctAnswers']) {
      if (attempt?.[field] !== null && !Number.isInteger(attempt?.[field])) errors.push(`quizAttempts:${id}:${field}:integer`);
    }
    if (attempt?.date !== null && !validTimestamp(attempt?.date)) errors.push(`quizAttempts:${id}:date`);
    if (attempt?.legacy === true && (!isRecord(attempt.answersByIndex) || attempt.bankRevision !== null || attempt.effectiveVersion !== null)) errors.push(`quizAttempts:${id}:legacy-identity`);
    if (attempt?.legacy !== true && !validatePinnedQuizAttempt(attempt).valid) errors.push(`quizAttempts:${id}:pinned-identity`);
    for (const [index, answer] of Object.entries(isRecord(attempt?.answersByIndex) ? attempt.answersByIndex : {})) {
      if (!/^\d{1,4}$/.test(index) || !isRecord(answer) || !isLegacyAnswerValue(answer.answer) || (answer.isCorrect !== null && typeof answer.isCorrect !== 'boolean') || (answer.timestamp !== null && !isFiniteNumber(answer.timestamp))) errors.push(`quizAttempts:${id}:answer:${index}`);
    }
  }
  for (const [id, summary] of Object.entries(isRecord(value.legacyBestScores) ? value.legacyBestScores : {})) {
    if (resolveChapterId(id) !== id || id === 'chapter-8' || !isRecord(summary) || !isFiniteNumber(summary.percentage, 0, 100)) errors.push(`legacyBestScores:${id}`);
  }
  const quizIds = CURRICULUM.chapters.flatMap(chapter => chapter.quiz ? [chapter.quiz.id] : []);
  for (const [deviceId, locators] of Object.entries(isRecord(value.resumeByDevice) ? value.resumeByDevice : {})) {
    if (!isSafeId(deviceId) || !isRecord(locators)) { errors.push(`resumeByDevice:${deviceId}`); continue; }
    for (const [containerId, locator] of Object.entries(locators)) {
      if (!isRecord(locator) || locator.containerId !== containerId || (!Object.hasOwn(ACTIVITY_BY_ID, containerId) && !quizIds.includes(containerId))) errors.push(`resumeByDevice:${deviceId}:${containerId}`);
      if (locator?.activityId !== null && (!Object.hasOwn(ACTIVITY_BY_ID, locator?.activityId) || !locator.activityId.startsWith(`${containerId}:`))) errors.push(`resumeByDevice:${deviceId}:${containerId}:activityId`);
      if (locator?.legacyIndex !== undefined && (!Number.isInteger(locator.legacyIndex) || locator.legacyIndex < 0 || locator.legacyIndex >= 10000)) errors.push(`resumeByDevice:${deviceId}:${containerId}:legacyIndex`);
      if (!['tab', 'stage', 'section', 'quiz-session'].includes(locator?.kind)) errors.push(`resumeByDevice:${deviceId}:${containerId}:kind`);
      if (locator?.positionId !== undefined && !isSafeId(locator.positionId)) errors.push(`resumeByDevice:${deviceId}:${containerId}:positionId`);
      if (locator?.session !== undefined && (locator.kind !== 'quiz-session' || containerId !== `${locator.session?.chapterId}:quiz` || locator.activityId !== null || !validateQuizSession(locator.session).valid)) errors.push(`resumeByDevice:${deviceId}:${containerId}:session`);
      if (locator?.session !== undefined && Object.values(isRecord(locator.session?.answersByQuestionId) ? locator.session.answersByQuestionId : {}).some(answer => typeof answer?.isCorrect !== 'boolean')) errors.push(`resumeByDevice:${deviceId}:${containerId}:session-grade`);
    }
  }
  if (!isRecord(value.migration?.sources) || !Array.isArray(value.migration?.issues)) errors.push('migration:structure');
  for (const [key, source] of Object.entries(isRecord(value.migration?.sources) ? value.migration.sources : {})) {
    if (!isRecord(source) || typeof source.raw !== 'string' || typeof source.fingerprint !== 'string' || !Array.isArray(source.previous)) errors.push(`migration:sources:${key}`);
    for (const previous of Array.isArray(source?.previous) ? source.previous : []) if (!isRecord(previous) || typeof previous.raw !== 'string' || typeof previous.fingerprint !== 'string') errors.push(`migration:sources:${key}:previous`);
  }
  for (const issue of Array.isArray(value.migration?.issues) ? value.migration.issues : []) if (!isRecord(issue) || typeof issue.key !== 'string' || typeof issue.code !== 'string') errors.push('migration:issue');
  for (const [key, record] of Object.entries(isRecord(value.unattributedLegacy) ? value.unattributedLegacy : {})) {
    if (!isRecord(record) || typeof record.raw !== 'string' || !Array.isArray(record.issues) || record.issues.some(code => typeof code !== 'string')) errors.push(`unattributedLegacy:${key}`);
  }
  if (!isRecord(value.preferences?.quiz) || !isRecord(value.preferences?.device)) errors.push('preferences:structure');
  for (const [key, preference] of Object.entries(isRecord(value.preferences?.quiz) ? value.preferences.quiz : {})) {
    if (key === 'version' ? !['engineering', 'biostats', 'social'].includes(preference) : !['showTimer', 'immediateFeedback', 'showQuestionNumbers', 'allowSkipping'].includes(key) || typeof preference !== 'boolean') errors.push(`preferences:quiz:${key}`);
  }
  for (const [key, preference] of Object.entries(isRecord(value.preferences?.device) ? value.preferences.device : {})) if (typeof preference !== 'boolean' && !['true', 'skipped'].includes(preference)) errors.push(`preferences:device:${key}`);
  if (!Array.isArray(value.sync?.pendingMutationIds)) errors.push('sync:structure');
  else if (!value.sync.pendingMutationIds.every(isSafeId) || new Set(value.sync.pendingMutationIds).size !== value.sync.pendingMutationIds.length) errors.push('sync:pendingMutationIds');
  if (!isSafeId(value.sync?.status)) errors.push('sync:status');
  return { valid: errors.length === 0, errors };
}
