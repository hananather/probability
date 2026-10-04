import { ACTIVITY_BY_ID, CURRICULUM, QUIZ_BY_ID, LEGACY_SECTION_SOURCE_BY_CONTAINER, LEGACY_SOURCE_BY_KEY, LEGACY_STORAGE_KEYS, isLegacyStorageKey, resolveActivityId, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress, isFiniteNumber, isOwnerScope, isRecord, isSafeId, validTimestamp, validateProgressSnapshot } from './schema';
import { migrateLegacyProgress, readLegacySectionResume } from './legacyMigration';
import { createIndexedDbPersistence, createProgressId } from './persistence';
import { accountView, acceptAccountResponse, appendAccountOperation, createAccountBlockedBranch, createAccountMetadata, createGuestTransferMutations, materializeAccount, previewGuestTransfer, selectCloudBatch, validateAccountBlockedBranch, validateAccountMetadata, validateCloudResponse } from './cloud/sync';
import { captureCloudWriteContext, isAccountScope, isCloudJson, normalizeAccountScope, normalizeCloudMutationId, validateCloudContext } from './cloud/schema';
import { createPinnedQuizAttempt, mergeQuizSession, normalizeQuizSession } from './quizContract';

const copy = value => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const own = (value, key) => Object.hasOwn(value, key) ? value[key] : undefined;
function put(value, key, item) { Object.defineProperty(value, key, { value: item, writable: true, configurable: true, enumerable: true }); }
function isJsonValue(value, ancestors = new Set(), depth = 0) {
  try {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if ((!Array.isArray(value) && !isRecord(value)) || ancestors.has(value) || depth > 100) return false;
    if (Object.getOwnPropertySymbols(value).length || (Array.isArray(value) && (Object.getPrototypeOf(value) !== Array.prototype || Object.keys(value).length !== value.length))) return false;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.entries(descriptors).some(([key, descriptor]) => !(Array.isArray(value) && key === 'length') && (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')))) return false;
    const next = new Set(ancestors).add(value);
    return Object.keys(value).every(key => Object.hasOwn(descriptors[key], 'value') && isJsonValue(descriptors[key].value, next, depth + 1));
  } catch { return false; }
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function newRecord(identity) {
  return { ...(isAccountScope(identity.ownerScope) ? { cloud: createAccountMetadata(identity.ownerScope), accountBlocked: [] } : {}), version: 1, ...identity, revision: 0, epoch: 0, chapterEpochs: {}, containerEpochs: {}, closedQuizSessions: {}, data: createEmptyProgress(identity), legacyObserved: {}, appliedOperations: {}, recovery: [] };
}
function safeRecord(value, identity, { allowRecovery = true } = {}) {
  if (value === undefined) {
    if (!allowRecovery) throw new Error('Progress write could not be verified');
    return newRecord(identity);
  }
  if (isAccountScope(identity.ownerScope) && !isJsonValue(value)) throw new Error('Stored account progress has unsupported data; its original record was preserved');
  if (isRecord(value) && ((Object.hasOwn(value, 'ownerScope') && value.ownerScope !== identity.ownerScope) || (Object.hasOwn(value, 'deviceId') && value.deviceId !== identity.deviceId))) throw new Error('Stored progress belongs to another owner or device');
  if (isRecord(value?.data) && ((Object.hasOwn(value.data, 'ownerScope') && value.data.ownerScope !== identity.ownerScope) || (Object.hasOwn(value.data, 'deviceId') && value.data.deviceId !== identity.deviceId))) throw new Error('Stored progress belongs to another owner or device');
  if (isAccountScope(identity.ownerScope) && (!validateAccountMetadata(value?.cloud, identity.ownerScope) || !Array.isArray(value?.accountBlocked) || value.accountBlocked.some(branch => !isRecord(branch) || !validateProgressSnapshot(branch.snapshot).valid || branch.snapshot.ownerScope !== identity.ownerScope || branch.snapshot.deviceId !== identity.deviceId || !validClosedSessions(branch.closedQuizSessions) || !validateAccountBlockedBranch(branch, identity.ownerScope)))) throw new Error('Account sync metadata is invalid; its original record was preserved');
  if (isAccountScope(identity.ownerScope) && Object.values(value.data?.resumeByDevice || {}).some(locators => Object.values(locators).some(locator => locator.session && !validateCloudContext(value.cloud.sessionContexts[locator.session.sessionId])))) throw new Error('Account quiz session has no original cloud context; its record was preserved');
  if (!isJsonValue(value)) throw new Error('Stored progress has unsupported data; its original record was preserved');
  if (isRecord(value) && value.version === 1 && validateProgressSnapshot(value.data).valid && value.data.ownerScope === identity.ownerScope && value.data.deviceId === identity.deviceId && Number.isSafeInteger(value.revision) && value.revision >= 0 && Number.isSafeInteger(value.epoch) && value.epoch >= 0 && isRecord(value.chapterEpochs) && Object.entries(value.chapterEpochs).every(([id, epoch]) => resolveChapterId(id) === id && Number.isSafeInteger(epoch) && epoch >= 0) && validContainerEpochs(value.containerEpochs ?? {}) && validClosedSessions(value.closedQuizSessions ?? {}) && isRecord(value.legacyObserved) && Object.values(value.legacyObserved).every(raw => raw === null || typeof raw === 'string') && isRecord(value.appliedOperations) && Object.keys(value.appliedOperations).every(isSafeId) && Array.isArray(value.recovery)) { const result = { ...copy(value), containerEpochs: copy(value.containerEpochs ?? {}), closedQuizSessions: copy(value.closedQuizSessions ?? {}) }; if (result.cloud) materializeAccount(result); return result; }
  if (isAccountScope(identity.ownerScope)) throw new Error('Stored account progress is invalid; its original record was preserved');
  if (!allowRecovery) throw new Error('Progress write could not be verified');
  const recovered = newRecord(identity);
  const raw = JSON.stringify(value);
  if (typeof raw !== 'string') throw new Error('Stored progress cannot be safely recovered');
  recovered.recovery.push({ reason: 'invalid-stored-record', raw });
  return recovered;
}
function chapterOf(activityId) { return /^chapter-[1-8](?=:|$)/.exec(activityId)?.[0] || null; }
function knownContainer(id) { return resolveChapterId(id) === id || Object.hasOwn(ACTIVITY_BY_ID, id) || Object.hasOwn(QUIZ_BY_ID, id); }
function validContainerEpochs(value) { return isRecord(value) && Object.entries(value).every(([id, epoch]) => knownContainer(id) && Number.isSafeInteger(epoch) && epoch >= 0); }
function validClosedSessions(value) { return isRecord(value) && Object.entries(value).every(([id, item]) => isSafeId(id) && isRecord(item) && /^chapter-[1-7]$/.test(item.chapterId) && isSafeId(item.operationId) && ['finished', 'replaced', 'cleared', 'reset'].includes(item.reason) && (item.attemptId === undefined || isSafeId(item.attemptId))); }
function ancestorsOf(id) {
  const result = [];
  let current = id;
  while (current) { result.push(current); current = ACTIVITY_BY_ID[current]?.parentId || null; }
  return result;
}
function reject(record, operation, reason) { record.recovery.push({ reason, operation: copy(operation) }); }
function closeSession(record, session, operation, reason, attemptId) {
  if (session) put(record.closedQuizSessions, session.sessionId, { chapterId: session.chapterId, operationId: operation.id, reason, ...(attemptId ? { attemptId } : {}) });
}
function currentQuizSession(record, chapterId) { return own(record.data.resumeByDevice, record.deviceId)?.[`${chapterId}:quiz`]?.session; }
function sessionWasFinished(record, sessionId) { return Object.values(record.data.quizAttempts).some(attempt => attempt.legacy === false && attempt.sessionId === sessionId); }
function evidenceKey(evidence) { return JSON.stringify(evidence); }
function sectionCheckpoint(data, deviceId, key) { return own(data.legacySectionResumeByDevice || {}, deviceId)?.[key]; }
function putSectionCheckpoint(data, deviceId, key, checkpoint) {
  data.legacySectionResumeByDevice ||= {};
  if (!Object.hasOwn(data.legacySectionResumeByDevice, deviceId)) put(data.legacySectionResumeByDevice, deviceId, {});
  put(data.legacySectionResumeByDevice[deviceId], key, checkpoint);
}
function clearSectionRecovery(record, matches) {
  const devices = new Set([record.deviceId, ...Object.keys(record.data.resumeByDevice), ...Object.keys(record.data.legacySectionResumeByDevice || {})]);
  for (const source of Object.values(LEGACY_SECTION_SOURCE_BY_CONTAINER)) if (matches(source.containerId)) {
    for (const deviceId of devices) putSectionCheckpoint(record.data, deviceId, source.key, { containerId: source.containerId, status: 'cleared', fingerprint: own(record.data.migration.sources, source.key)?.fingerprint || null });
  }
}
function containerWasReset(record, containerId) {
  return record.epoch > 0 || (record.chapterEpochs[chapterOf(containerId)] || 0) > 0 || ancestorsOf(containerId).some(id => (own(record.containerEpochs, id) || 0) > 0);
}
function mergeActivities(target, incoming, before = {}) {
  for (const [id, activity] of Object.entries(incoming)) {
    const existing = own(target, id);
    const excluded = new Set((own(before, id)?.evidence || []).map(evidenceKey));
    const additions = activity.evidence.filter(evidence => !excluded.has(evidenceKey(evidence)));
    if (!additions.length) continue;
    const evidence = [...(existing?.evidence || [])];
    const seen = new Set(evidence.map(evidenceKey));
    additions.forEach(item => { if (!seen.has(evidenceKey(item))) { evidence.push(copy(item)); seen.add(evidenceKey(item)); } });
    put(target, id, { activityId: id, generation: existing?.generation || 0, evidence });
  }
}
function mergeChapter(target, patch) {
  const result = { ...target };
  const statuses = ['not_started', 'in_progress', 'completed'];
  if (patch.status !== undefined) result.status = statuses[Math.max(statuses.indexOf(result.status), statuses.indexOf(patch.status))];
  for (const field of ['progress', 'score', 'timeSpent']) if (patch[field] !== undefined) result[field] = Math.max(result[field] || 0, patch[field]);
  for (const field of ['startedAt', 'completedAt', 'lastVisited', 'lastUpdated']) {
    if (patch[field] === undefined) continue;
    if (patch[field] === null) { if (result[field] === undefined) result[field] = null; continue; }
    result[field] = !result[field] ? patch[field] : ['startedAt', 'completedAt'].includes(field) ? [result[field], patch[field]].sort()[0] : [result[field], patch[field]].sort()[1];
  }
  return result;
}
function mergeFacts(data, incoming, before = createEmptyProgress(data)) {
  mergeActivities(data.activities, incoming.activities, before.activities);
  for (const [id, chapter] of Object.entries(incoming.chaptersLegacy)) {
    const patch = Object.fromEntries(Object.entries(chapter).filter(([field, value]) => !same(value, own(before.chaptersLegacy, id)?.[field])));
    if (Object.keys(patch).length) put(data.chaptersLegacy, id, mergeChapter(own(data.chaptersLegacy, id) || {}, patch));
  }
  for (const [id, attempt] of Object.entries(incoming.quizAttempts)) if (!Object.hasOwn(before.quizAttempts, id) && !Object.hasOwn(data.quizAttempts, id)) put(data.quizAttempts, id, copy(attempt));
  for (const [id, best] of Object.entries(incoming.legacyBestScores)) if (!same(best, own(before.legacyBestScores, id))) put(data.legacyBestScores, id, { ...best, percentage: Math.max(own(data.legacyBestScores, id)?.percentage || 0, best.percentage) });
  for (const [device, locators] of Object.entries(incoming.resumeByDevice)) {
    for (const [container, locator] of Object.entries(locators)) if (!same(locator, own(before.resumeByDevice, device)?.[container])) {
      const source = own(LEGACY_SECTION_SOURCE_BY_CONTAINER, container);
      if (source && (own(data.resumeByDevice, device)?.[container] || sectionCheckpoint(data, device, source.key)?.status === 'cleared')) continue;
      const current = own(data.resumeByDevice, device)?.[container];
      if (Object.hasOwn(QUIZ_BY_ID, container) && current?.session) {
        // A backup adds answers to the same pinned session; it cannot replace
        // an active retake, rewrite its questions, or rewind its timer/position.
        const existing = current.session;
        const imported = locator.session;
        if (!imported || imported.sessionId !== existing.sessionId || imported.startTime !== existing.startTime || !same(imported.bank, existing.bank)) continue;
        const additions = Object.fromEntries(Object.entries(imported.answersByQuestionId).filter(([id, answer]) => !existing.answersByQuestionId[id] || answer.timestamp > existing.answersByQuestionId[id].timestamp));
        put(data.resumeByDevice[device], container, { ...copy(current), session: mergeQuizSession(existing, { answersByQuestionId: additions }) });
        continue;
      }
      if (!Object.hasOwn(data.resumeByDevice, device)) put(data.resumeByDevice, device, {});
      put(data.resumeByDevice[device], container, copy(locator));
    }
  }
  for (const [device, checkpoints] of Object.entries(incoming.legacySectionResumeByDevice || {})) for (const [key, checkpoint] of Object.entries(checkpoints)) {
    const previous = sectionCheckpoint(data, device, key);
    if (!previous || (checkpoint.status === 'cleared' && previous.status !== 'cleared')) putSectionCheckpoint(data, device, key, copy(checkpoint));
  }
  for (const group of ['quiz', 'device']) for (const [key, value] of Object.entries(incoming.preferences[group])) if (!same(value, own(before.preferences[group], key))) put(data.preferences[group], key, copy(value));
}
function ingest(record, rawByKey) {
  const identity = { ownerScope: record.ownerScope, deviceId: record.deviceId };
  for (const [key, raw] of Object.entries(rawByKey)) {
    if (own(record.legacyObserved, key) === raw) continue;
    const sectionSource = own(LEGACY_SOURCE_BY_KEY, key);
    if (sectionSource?.kind === 'section-resume' && containerWasReset(record, sectionSource.containerId)) clearSectionRecovery(record, id => id === sectionSource.containerId);
    const beforeRaw = own(record.legacyObserved, key);
    const before = migrateLegacyProgress(beforeRaw == null ? {} : { [key]: beforeRaw }, identity);
    const after = migrateLegacyProgress(raw == null ? {} : { [key]: raw }, identity);
    const resetQuizChapters = CURRICULUM.chapters.filter(chapter => chapter.quiz && containerWasReset(record, chapter.quiz.id)).map(chapter => chapter.id);
    for (const [id, attempt] of Object.entries(after.quizAttempts)) if (resetQuizChapters.includes(attempt.chapterId)) delete after.quizAttempts[id];
    for (const id of resetQuizChapters) delete after.legacyBestScores[id];
    for (const locators of Object.values(after.resumeByDevice)) for (const chapterId of resetQuizChapters) delete locators[`${chapterId}:quiz`];
    if (key === 'quiz_preferences' && resetQuizChapters.length) after.preferences.quiz = {};
    // Previously observed archives may have been deliberately cleared before
    // section mappings existed. Only an explicit restoration may attribute them.
    if (sectionSource?.kind === 'section-resume' && typeof beforeRaw === 'string' && !sectionCheckpoint(record.data, record.deviceId, key)) {
      if (after.resumeByDevice[record.deviceId]) delete after.resumeByDevice[record.deviceId][sectionSource.containerId];
      if (after.legacySectionResumeByDevice?.[record.deviceId]) delete after.legacySectionResumeByDevice[record.deviceId][key];
    }
    // Keep the complete recovery archive while applying only newly observed facts.
    const archive = migrateLegacyProgress(raw == null ? {} : { [key]: raw }, { ...identity, existing: record.data });
    record.data.migration = archive.migration;
    record.data.unattributedLegacy = archive.unattributedLegacy;
    mergeFacts(record.data, after, before);
    put(record.legacyObserved, key, raw);
  }
}
function reset(record, chapterId, operation) {
  const match = id => !chapterId || chapterOf(id) === chapterId;
  for (const group of ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores']) {
    for (const [id, item] of Object.entries(record.data[group])) if (match(group === 'quizAttempts' ? item.chapterId : id)) delete record.data[group][id];
  }
  for (const locators of Object.values(record.data.resumeByDevice)) for (const id of Object.keys(locators)) if (match(id)) { closeSession(record, locators[id].session, operation, 'reset'); delete locators[id]; }
  clearSectionRecovery(record, match);
  if (chapterId) record.chapterEpochs[chapterId] = (record.chapterEpochs[chapterId] || 0) + 1;
  else record.epoch++;
}
function resetActivity(record, containerId) {
  const contains = id => id === containerId || id.startsWith(`${containerId}:`);
  for (const id of Object.keys(record.data.activities)) if (contains(id)) delete record.data.activities[id];
  // An explicit aggregate completion cannot keep a reset child completed.
  for (const ancestor of ancestorsOf(containerId).slice(1)) delete record.data.activities[ancestor];
  for (const locators of Object.values(record.data.resumeByDevice)) for (const id of Object.keys(locators)) if (contains(id)) delete locators[id];
  clearSectionRecovery(record, contains);
  put(record.containerEpochs, containerId, (own(record.containerEpochs, containerId) || 0) + 1);
}
function resetQuizzes(record, chapterId, operation) {
  const chapters = chapterId ? [chapterId] : CURRICULUM.chapters.filter(chapter => chapter.quiz).map(chapter => chapter.id);
  for (const [id, attempt] of Object.entries(record.data.quizAttempts)) if (chapters.includes(attempt.chapterId)) delete record.data.quizAttempts[id];
  for (const id of chapters) {
    delete record.data.legacyBestScores[id];
    const containerId = `${id}:quiz`;
    for (const locators of Object.values(record.data.resumeByDevice)) {
      closeSession(record, locators[containerId]?.session, operation, 'reset');
      delete locators[containerId];
    }
    put(record.containerEpochs, containerId, (own(record.containerEpochs, containerId) || 0) + 1);
  }
  if (!chapterId) record.data.preferences.quiz = {};
}
function changedContainerCheckpoint(record, operation) {
  const targets = operation.guardContainerId ? [operation.guardContainerId] : operation.type === 'chapter' ? operation.activityIds
    : operation.type === 'quiz-preferences' ? Object.keys(QUIZ_BY_ID) : [];
  return targets.some(target => {
    const relevant = new Set(ancestorsOf(target));
    if (operation.type === 'complete' || operation.type === 'chapter') for (const id of [...Object.keys(record.containerEpochs), ...Object.keys(operation.containerEpochs || {})]) if (id.startsWith(`${target}:`)) relevant.add(id);
    return [...relevant].some(id => (operation.containerEpochs?.[id] || 0) !== (own(record.containerEpochs, id) || 0));
  });
}
function applyLocalOperation(record, operation) {
  if (Object.hasOwn(record.appliedOperations, operation.id)) return record;
  if (operation.type !== 'legacy' && (operation.epoch !== record.epoch || (operation.chapterId && operation.chapterEpoch !== (record.chapterEpochs[operation.chapterId] || 0)) || changedContainerCheckpoint(record, operation))) {
    reject(record, operation, 'write-predates-reset');
  } else if (operation.type === 'complete') {
    const previous = own(record.data.activities, operation.activityId);
    if (!previous?.evidence.some(item => item.kind === operation.evidence.kind && item.sourceKey === operation.evidence.sourceKey)) mergeActivities(record.data.activities, { [operation.activityId]: { evidence: [operation.evidence] } });
  } else if (operation.type === 'chapter') {
    put(record.data.chaptersLegacy, operation.chapterId, mergeChapter(own(record.data.chaptersLegacy, operation.chapterId) || {}, operation.patch));
    for (const activityId of operation.activityIds) if (!own(record.data.activities, activityId)?.evidence.some(item => item.kind === 'study-completed' && item.sourceKey === 'progress-service')) mergeActivities(record.data.activities, { [activityId]: { evidence: [{ kind: 'study-completed', sourceKey: 'progress-service', completedAt: operation.timestamp }] } });
  } else if (operation.type === 'resume') {
    const device = record.deviceId;
    if (!Object.hasOwn(record.data.resumeByDevice, device)) put(record.data.resumeByDevice, device, {});
    put(record.data.resumeByDevice[device], operation.containerId, copy(operation.locator));
  } else if (operation.type === 'clear-resume') {
    const locators = own(record.data.resumeByDevice, record.deviceId);
    closeSession(record, own(locators || {}, operation.containerId)?.session, operation, 'cleared');
    if (locators) delete locators[operation.containerId];
    clearSectionRecovery(record, id => id === operation.containerId);
  } else if (operation.type === 'restore-section-resume') {
    const source = own(LEGACY_SECTION_SOURCE_BY_CONTAINER, operation.containerId);
    const archived = own(record.data.migration.sources, operation.sourceKey);
    const locator = readLegacySectionResume(operation.sourceKey, archived?.raw);
    if (!source || source.key !== operation.sourceKey || !locator || archived.raw !== operation.raw || archived.fingerprint !== operation.fingerprint) reject(record, operation, 'section-resume-source-changed');
    else if (sectionCheckpoint(record.data, record.deviceId, source.key) || containerWasReset(record, source.containerId)) reject(record, operation, 'section-resume-already-consumed');
    else if (own(record.data.resumeByDevice, record.deviceId)?.[source.containerId]) reject(record, operation, 'canonical-section-position-exists');
    else {
      if (!Object.hasOwn(record.data.resumeByDevice, record.deviceId)) put(record.data.resumeByDevice, record.deviceId, {});
      put(record.data.resumeByDevice[record.deviceId], source.containerId, locator);
      putSectionCheckpoint(record.data, record.deviceId, source.key, { containerId: source.containerId, status: 'adopted', fingerprint: archived.fingerprint });
    }
  } else if (operation.type === 'reset-activity') resetActivity(record, operation.containerId);
  else if (operation.type === 'quiz-reset') resetQuizzes(record, operation.chapterId, operation);
  else if (operation.type === 'quiz-begin') {
    const existing = currentQuizSession(record, operation.chapterId);
    if (Object.hasOwn(record.closedQuizSessions, operation.session.sessionId) || sessionWasFinished(record, operation.session.sessionId)) reject(record, operation, 'quiz-session-closed');
    else if (existing?.sessionId === operation.session.sessionId) {
      if (!same(existing, operation.session)) reject(record, operation, 'quiz-session-id-conflict');
    } else {
      closeSession(record, existing, operation, 'replaced');
      if (!Object.hasOwn(record.data.resumeByDevice, record.deviceId)) put(record.data.resumeByDevice, record.deviceId, {});
      put(record.data.resumeByDevice[record.deviceId], `${operation.chapterId}:quiz`, { containerId: `${operation.chapterId}:quiz`, activityId: null, kind: 'quiz-session', session: copy(operation.session) });
    }
  } else if (operation.type === 'quiz-update' || operation.type === 'quiz-finish' || operation.type === 'quiz-clear') {
    const existing = currentQuizSession(record, operation.chapterId);
    const finished = own(record.closedQuizSessions, operation.sessionId);
    const savedAttempt = own(record.data.quizAttempts, operation.attemptId);
    if (operation.type === 'quiz-finish' && finished?.reason === 'finished' && finished.chapterId === operation.chapterId && finished.attemptId === operation.attemptId && savedAttempt?.chapterId === operation.chapterId && savedAttempt.sessionId === operation.sessionId) {
      // A repeated finish is successful without changing the immutable attempt.
    } else if (!existing || existing.sessionId !== operation.sessionId) reject(record, operation, 'quiz-session-mismatch');
    else if (operation.type === 'quiz-update') put(record.data.resumeByDevice[record.deviceId][`${operation.chapterId}:quiz`], 'session', mergeQuizSession(existing, operation.patch));
    else if (operation.type === 'quiz-clear') {
      closeSession(record, existing, operation, 'cleared');
      delete record.data.resumeByDevice[record.deviceId][`${operation.chapterId}:quiz`];
    } else if (Object.hasOwn(record.data.quizAttempts, operation.attemptId)) reject(record, operation, 'quiz-attempt-id-conflict');
    else {
      const session = mergeQuizSession(existing, operation.patch);
      const attempt = createPinnedQuizAttempt(session, { attemptId: operation.attemptId, date: operation.timestamp });
      put(record.data.quizAttempts, operation.attemptId, attempt);
      closeSession(record, session, operation, 'finished', operation.attemptId);
      delete record.data.resumeByDevice[record.deviceId][`${operation.chapterId}:quiz`];
    }
  } else if (operation.type === 'legacy-quiz-clear') {
    const locators = own(record.data.resumeByDevice, record.deviceId);
    const current = own(locators || {}, operation.containerId);
    if (!current?.legacySession || !same(current, operation.expectedLocator)) reject(record, operation, 'legacy-quiz-session-changed');
    else {
      delete locators[operation.containerId];
      put(record.containerEpochs, operation.containerId, (own(record.containerEpochs, operation.containerId) || 0) + 1);
    }
  } else if (operation.type === 'quiz-preferences') Object.assign(record.data.preferences.quiz, operation.patch);
  else if (operation.type === 'device-preference') {
    if (operation.value === null) delete record.data.preferences.device[operation.key];
    else put(record.data.preferences.device, operation.key, operation.value);
  } else if (operation.type === 'reset') reset(record, operation.chapterId, operation);
  else if (operation.type === 'legacy') ingest(record, operation.rawByKey);
  else if (operation.type === 'import') {
    const incoming = copy(operation.incoming);
    const staleChapters = CURRICULUM.chapters.map(chapter => chapter.id).filter(id => (operation.chapterEpochs[id] || 0) !== (record.chapterEpochs[id] || 0));
    if (staleChapters.length) {
      const stale = id => staleChapters.includes(chapterOf(id));
      for (const group of ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores']) for (const [id, item] of Object.entries(incoming[group])) if (stale(group === 'quizAttempts' ? item.chapterId : id)) delete incoming[group][id];
      for (const locators of Object.values(incoming.resumeByDevice)) for (const id of Object.keys(locators)) if (stale(id)) delete locators[id];
      record.recovery.push({ reason: 'import-predates-chapter-reset', operationId: operation.id, chapterIds: staleChapters });
    }
    const staleContainers = [...new Set([...Object.keys(record.containerEpochs), ...Object.keys(operation.containerEpochs || {})])].filter(id => (operation.containerEpochs?.[id] || 0) !== (own(record.containerEpochs, id) || 0));
    if (staleContainers.length) {
      const withinReset = id => staleContainers.some(container => id === container || id.startsWith(`${container}:`));
      const aggregateOfReset = id => staleContainers.some(container => container.startsWith(`${id}:`));
      for (const id of Object.keys(incoming.activities)) if (withinReset(id) || aggregateOfReset(id)) delete incoming.activities[id];
      const resetQuizChapters = staleContainers.filter(id => Object.hasOwn(QUIZ_BY_ID, id)).map(chapterOf);
      for (const [id, attempt] of Object.entries(incoming.quizAttempts)) if (resetQuizChapters.includes(attempt.chapterId)) delete incoming.quizAttempts[id];
      for (const id of resetQuizChapters) delete incoming.legacyBestScores[id];
      if (resetQuizChapters.length) incoming.preferences.quiz = {};
      for (const locators of Object.values(incoming.resumeByDevice)) for (const id of Object.keys(locators)) if (withinReset(id)) delete locators[id];
      record.recovery.push({ reason: 'import-predates-activity-reset', operationId: operation.id, containerIds: staleContainers });
    }
    for (const [sessionId, closed] of Object.entries(operation.closedQuizSessions || {})) {
      if (!staleChapters.includes(closed.chapterId) && !Object.hasOwn(record.closedQuizSessions, sessionId)) put(record.closedQuizSessions, sessionId, copy(closed));
    }
    mergeFacts(record.data, incoming);
    for (const locators of Object.values(record.data.resumeByDevice)) for (const [id, locator] of Object.entries(locators)) if (locator.session && (Object.hasOwn(record.closedQuizSessions, locator.session.sessionId) || sessionWasFinished(record, locator.session.sessionId))) delete locators[id];
    const archive = migrateLegacyProgress(Object.fromEntries(Object.entries(operation.incoming.migration.sources).map(([key, source]) => [key, source.raw])), { existing: record.data });
    record.data.migration = archive.migration;
    for (const [key, source] of Object.entries(operation.incoming.migration.sources)) {
      const stored = own(record.data.migration.sources, key);
      for (const previous of source.previous) if (!same(previous, stored) && !stored.previous.some(item => same(item, previous))) stored.previous.push(copy(previous));
    }
    for (const sources of [archive.unattributedLegacy, operation.incoming.unattributedLegacy]) for (const [key, value] of Object.entries(sources)) put(record.data.unattributedLegacy, key, copy(value));
    record.recovery.push({ reason: 'imported-file', raw: operation.raw });
  }
  if (operation.type === 'account-import') record.recovery.push({ reason: 'imported-account-file', raw: operation.raw });
  if (!validateProgressSnapshot(record.data).valid) throw new Error('Progress operation produced an invalid snapshot');
  record.revision++;
  put(record.appliedOperations, operation.id, record.revision);
  return record;
}


function applyOperation(record, operation) {
  if (Object.hasOwn(record.appliedOperations, operation.id)) return record;
  const before = record.cloud ? copy(record) : null;
  applyLocalOperation(record, operation);
  if (before) {
    const locallyRejected = record.recovery.some(item => item.operation?.id === operation.id);
    try {
      const replacesQuiz = operation.type === 'quiz-begin' && currentQuizSession(before, operation.chapterId) && currentQuizSession(before, operation.chapterId).sessionId !== operation.session.sessionId;
      const cloudWrite = replacesQuiz || ['complete', 'chapter', 'quiz-finish', 'quiz-clear', 'quiz-preferences', 'reset', 'reset-activity', 'quiz-reset', 'account-transfer', 'account-import'].includes(operation.type);
      if (before.cloud.blocked.length && !locallyRejected && cloudWrite) throw new Error('Account synchronization is blocked; local progress remains exportable');
      appendAccountOperation(record, operation, before, locallyRejected);
    } catch (error) {
      if (operation.type === 'account-transfer' || operation.type === 'account-import') throw error;
      // Local learning has wider content bounds than the cloud document. Keep
      // its exact bank and grade when the bounded cloud contract cannot fit it.
      record.cloud = before.cloud;
      if (!record.cloud.blocked.some(item => item.operationId === operation.id)) record.cloud.blocked.push({ operationId: operation.id, reason: error.message });
      const branch = createAccountBlockedBranch(record, before, operation);
      record.accountBlocked.push(branch);
      record.recovery.push({ reason: 'account-unsyncable', operationId: operation.id, branchIndex: record.accountBlocked.length - 1, message: error.message });
      record.data.sync = { status: 'capacity', pendingMutationIds: record.cloud.outbox.map(item => item.id) };
    }
  }
  return record;
}

/** One owner-scoped store. Persistence reducers run in atomic read/write transactions. */
export function createProgressStore({ persistence = createIndexedDbPersistence(), ownerScope, deviceId, importLegacy = true, legacyStorage, eventTarget, document: page, broadcastFactory, createId = createProgressId, now = () => new Date().toISOString(), pollInterval = 2000, accountOwnerScope } = {}) {
  if ((ownerScope === undefined) !== (deviceId === undefined) || (ownerScope !== undefined && (!isOwnerScope(ownerScope) || !isSafeId(deviceId)))) throw new TypeError('Progress owner and device must be supplied together');
  if (ownerScope?.startsWith('account:')) ownerScope = normalizeAccountScope(ownerScope);
  if (accountOwnerScope !== undefined) accountOwnerScope = normalizeAccountScope(accountOwnerScope);
  let identity = ownerScope ? { ownerScope, deviceId } : null;
  let record = newRecord(identity || { ownerScope: accountOwnerScope || 'guest:loading', deviceId: 'loading' });
  let pending = [];
  let hydration;
  let hydrated = false;
  let disposed = false;
  let legacyOwner = false;
  let identityConfirmed = !!identity;
  let working = Promise.resolve();
  let timer;
  let channel;
  let listening = false;
  const listeners = new Set();
  const serverSnapshot = freeze({ data: createEmptyProgress({ ownerScope: 'guest:loading', deviceId: 'loading' }), loading: true, error: null, persistenceStatus: 'loading', revision: 0, pendingLocalWrites: 0, writeContext: { ownerScope: 'guest:loading', deviceId: 'loading', epoch: 0, chapterEpochs: {}, containerEpochs: {} } });
  let snapshot = serverSnapshot;
  let cloudConnection = { status: 'local', error: null };
  function cloudSummary() {
    if (!record.cloud) return undefined;
    const status = record.cloud.blocked.length ? 'capacity' : ['syncing', 'capacity'].includes(cloudConnection.status) ? cloudConnection.status : record.cloud.rejected.length ? 'conflict' : record.cloud.outbox.length ? cloudConnection.status === 'offline' ? 'offline' : 'pending' : cloudConnection.status;
    const error = cloudConnection.error || (record.cloud.blocked.length ? 'Some local progress cannot fit account sync limits. Its original data is retained for export.' : record.cloud.rejected.length ? 'Some work was made before a reset. Its original data is retained for export.' : null);
    return { ...cloudConnection, status, error, ownerScope: record.ownerScope, remoteRevision: record.cloud.base.revision, updatedAt: record.cloud.base.updatedAt, pendingMutations: record.cloud.outbox.length, rejectedMutations: record.cloud.rejected.length, blockedMutations: record.cloud.blocked.length };
  }
  function publish({ error = null, status = !hydrated ? 'loading' : pending.length ? 'pending' : 'persisted', loading = !hydrated } = {}) {
    const next = { data: record.data, loading, error, persistenceStatus: status, revision: record.revision, pendingLocalWrites: pending.length, writeContext: { ownerScope: record.ownerScope, deviceId: record.deviceId, epoch: record.epoch, chapterEpochs: record.chapterEpochs, containerEpochs: record.containerEpochs, ...(record.cloud ? { cloud: captureCloudWriteContext(accountView(record.cloud, record.ownerScope)) } : {}) }, ...(record.cloud ? { cloud: cloudSummary() } : {}) };
    if (same(snapshot, next)) return;
    snapshot = freeze(copy(next));
    listeners.forEach(listener => listener());
  }
  function browserStorage() {
    if (legacyStorage !== undefined) return legacyStorage;
    return typeof window === 'undefined' ? null : window.localStorage;
  }
  function collectLegacy() {
    const storage = browserStorage();
    if (!storage) return {};
    const keys = new Set([...LEGACY_STORAGE_KEYS, ...Object.keys(record.legacyObserved)]);
    for (let index = 0; index < storage.length; index++) { const key = storage.key(index); if (typeof key === 'string' && isLegacyStorageKey(key)) keys.add(key); }
    return Object.fromEntries([...keys].map(key => [key, storage.getItem(key)]));
  }
  function notifyTabs() {
    try { channel?.postMessage({ ownerScope: identity.ownerScope, revision: record.revision }); } catch { /* A closed channel cannot invalidate a verified write. */ }
    try { browserStorage()?.setItem('probability:progress:revision', JSON.stringify({ ownerScope: identity.ownerScope, revision: record.revision })); } catch { /* The durable record remains the authority. */ }
  }
  function replay(base) { for (const operation of pending) applyOperation(base, operation); return base; }
  async function flush() {
    if (disposed) throw new Error('Progress store has been disposed');
    if (!identityConfirmed) throw new Error('Progress identity could not be verified; export session progress before reloading');
    const operations = [...pending];
    const written = await persistence.update(identity.ownerScope, stored => {
      const next = safeRecord(stored, identity);
      for (const operation of operations) applyOperation(next, operation);
      return next;
    });
    const readback = safeRecord(await persistence.read(identity.ownerScope), identity, { allowRecovery: false });
    if (readback.revision < written.revision || operations.some(operation => !Object.hasOwn(readback.appliedOperations, operation.id)) || (written.recovery.length && !readback.recovery.some(item => same(item, written.recovery[0])))) throw new Error('Progress write could not be verified');
    pending = pending.filter(operation => !operations.some(saved => saved.id === operation.id));
    record = replay(readback);
    publish();
    notifyTabs();
  }
  function queue(operation) {
    const optimistic = applyOperation(copy(record), operation);
    pending.push(operation);
    record = optimistic;
    publish();
    working = working.catch(() => {}).then(async () => {
      try { await flush(); return true; }
      catch (error) { publish({ error: error.message, status: 'session-only' }); return false; }
    });
    return working;
  }
  function validateContext(context, targetId) {
    if (context === undefined) return;
    if (record.cloud && (!isCloudJson(context) || !validateCloudContext(context.cloud) || context.cloud.ownerScope !== record.ownerScope)) throw new TypeError('Account write context requires its captured cloud lineage');
    if (!isRecord(context) || context.ownerScope !== identity.ownerScope || context.deviceId !== identity.deviceId) throw new TypeError('Write context belongs to another owner or device');
    if (!Number.isSafeInteger(context.epoch) || context.epoch < 0 || !isRecord(context.chapterEpochs) || !Object.entries(context.chapterEpochs).every(([id, epoch]) => resolveChapterId(id) === id && Number.isSafeInteger(epoch) && epoch >= 0) || !validContainerEpochs(context.containerEpochs)) throw new TypeError('Invalid write context checkpoints');
    if (context.containerId !== null && !knownContainer(context.containerId)) throw new TypeError('Invalid write context container');
    if (targetId && context.containerId !== null && targetId !== context.containerId && !targetId.startsWith(`${context.containerId}:`)) throw new TypeError('Write context does not contain this activity');
  }
  function makeOperation(type, extra = {}, context) {
    const targetId = extra.guardContainerId || extra.activityId || extra.containerId || extra.chapterId || null;
    validateContext(context, targetId);
    const id = record.cloud ? normalizeCloudMutationId(createId()) : createId();
    if (!isSafeId(id)) throw new TypeError('Invalid generated progress operation ID');
    const checkpoints = context || record;
    return { id, type, ...(record.cloud ? { cloudContext: copy(context?.cloud || captureCloudWriteContext(accountView(record.cloud, record.ownerScope), targetId)) } : {}), epoch: checkpoints.epoch, chapterEpoch: extra.chapterId ? checkpoints.chapterEpochs[extra.chapterId] || 0 : null, containerEpochs: copy(checkpoints.containerEpochs), ...extra };
  }
  async function refreshLegacy() {
    await hydrate();
    if (!legacyOwner || disposed) return false;
    try {
      const rawByKey = collectLegacy();
      if (Object.entries(rawByKey).every(([key, raw]) => own(record.legacyObserved, key) === raw)) return true;
      return await queue(makeOperation('legacy', { rawByKey }));
    } catch (error) { publish({ error: error.message, status: snapshot.persistenceStatus }); return false; }
  }
  async function refresh() {
    await hydrate();
    await working.catch(() => {});
    if (disposed || !identityConfirmed) return false;
    try {
      record = replay(safeRecord(await persistence.read(identity.ownerScope), identity));
      publish({ status: pending.length ? 'session-only' : 'persisted', error: pending.length ? snapshot.error : null });
      await refreshLegacy();
      return true;
    } catch (error) { publish({ error: error.message, status: 'session-only' }); return false; }
  }
  const events = eventTarget || (typeof window === 'undefined' ? null : window);
  const visibility = page || (typeof document === 'undefined' ? null : document);
  const onFocus = () => { void refresh(); };
  const onStorage = event => { if (event.key === 'probability:progress:revision' || isLegacyStorageKey(event.key || '')) void refresh(); };
  function schedule() {
    clearInterval(timer); timer = undefined;
    if (!disposed && legacyOwner && listeners.size && visibility?.visibilityState !== 'hidden' && pollInterval > 0) timer = setInterval(() => { void refreshLegacy(); }, pollInterval);
  }
  const onVisibility = () => { schedule(); if (visibility?.visibilityState !== 'hidden') void refresh(); };
  function startListening() {
    if (listening || disposed) return;
    listening = true;
    events?.addEventListener('focus', onFocus);
    events?.addEventListener('storage', onStorage);
    visibility?.addEventListener('visibilitychange', onVisibility);
    try {
      const factory = broadcastFactory || (typeof BroadcastChannel === 'function' ? name => new BroadcastChannel(name) : null);
      channel = factory?.('probability-learning-progress');
      if (channel) channel.onmessage = event => { if (event.data?.ownerScope === identity?.ownerScope) void refresh(); };
    } catch { channel = null; }
    schedule();
  }
  function stopListening() {
    clearInterval(timer); timer = undefined;
    events?.removeEventListener('focus', onFocus);
    events?.removeEventListener('storage', onStorage);
    visibility?.removeEventListener('visibilitychange', onVisibility);
    channel?.close(); channel = null; listening = false;
  }
  async function hydrate() {
    if (disposed) throw new Error('Progress store has been disposed');
    if (hydration) return hydration;
    hydration = (async () => {
      try {
        if (!identity) {
          const candidate = await persistence.getIdentity();
          if (!isRecord(candidate) || !isOwnerScope(candidate.ownerScope) || !isSafeId(candidate.deviceId)) throw new Error('Invalid stored progress identity');
          if (accountOwnerScope && candidate.ownerScope !== accountOwnerScope) throw new Error('Account persistence identity belongs to another owner');
          identity = { ownerScope: candidate.ownerScope, deviceId: candidate.deviceId }; identityConfirmed = true;
        }
        record = newRecord(identity);
        record = safeRecord(await persistence.read(identity.ownerScope), identity);
        legacyOwner = importLegacy && identity.ownerScope.startsWith('guest:') && await persistence.claimLegacyOwner(identity.ownerScope);
        if (legacyOwner) {
          const rawByKey = collectLegacy();
          if (Object.entries(rawByKey).some(([key, raw]) => own(record.legacyObserved, key) !== raw)) {
            const operation = makeOperation('legacy', { rawByKey });
            pending.push(operation); record = applyOperation(record, operation);
          }
        }
        // Write a recovery record or migration only after all reads have completed.
        if (pending.length || record.recovery.length) await flush();
        hydrated = true; publish();
      } catch (error) {
        if (!identity) {
          const id = createId(); identity = { ownerScope: accountOwnerScope || `guest:${id}`, deviceId: accountOwnerScope ? `unverified-${id}` : id }; identityConfirmed = false;
          record = newRecord(identity);
        }
        hydrated = true;
        publish({ error: error.message, status: 'session-only' });
      }
      schedule();
      return snapshot;
    })();
    return hydration;
  }
  function rejectedReason(operationId) { return record.recovery.find(item => item.reason !== 'account-unsyncable' && item.operation?.id === operationId)?.reason || null; }
  async function mutate(type, extra, context) {
    await hydrate(); if (disposed) throw new Error('Progress store has been disposed');
    const operation = makeOperation(type, extra, context);
    const persisted = await queue(operation);
    return persisted && !rejectedReason(operation.id);
  }
  async function mutateTyped(type, extra, context) {
    await hydrate(); if (disposed) throw new Error('Progress store has been disposed');
    const operation = makeOperation(type, extra, context);
    const persisted = await queue(operation);
    const reason = rejectedReason(operation.id);
    return { applied: !reason, persisted, reason };
  }
  function quizChapter(value) {
    const id = resolveChapterId(value);
    if (!id || !Object.hasOwn(QUIZ_BY_ID, `${id}:quiz`)) throw new TypeError('Invalid quiz chapter');
    return id;
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener) {
      if (disposed) throw new Error('Progress store has been disposed');
      listeners.add(listener); startListening(); void hydrate();
      return () => { listeners.delete(listener); if (!listeners.size) stopListening(); };
    },
    hydrate, refresh, refreshLegacy,
    captureWriteContext(containerId = null) {
      if (!hydrated || snapshot.loading) throw new Error('Progress must hydrate before capturing a write context');
      if (containerId !== null && !knownContainer(containerId)) throw new TypeError('Invalid write context container');
      return freeze(copy({ ...snapshot.writeContext, containerId, ...(record.cloud ? { cloud: captureCloudWriteContext(accountView(record.cloud, record.ownerScope), containerId) } : {}) }));
    },
    async completeActivity(activityId, { kind = 'study-completed', sourceKey = 'explicit-study-action', context } = {}) {
      if (!Object.hasOwn(ACTIVITY_BY_ID, activityId) || !['study-completed', 'knowledge-check-completed'].includes(kind) || typeof sourceKey !== 'string') throw new TypeError('Invalid activity completion');
      if (kind === 'knowledge-check-completed' && ACTIVITY_BY_ID[activityId].completionPolicy !== 'knowledge-check-completion') throw new TypeError('Activity is not a knowledge check');
      return mutate('complete', { chapterId: chapterOf(activityId), guardContainerId: activityId, activityId, evidence: { kind, sourceKey, completedAt: now() } }, context);
    },
    async updateChapter(chapterId, patch, { context } = {}) {
      const id = resolveChapterId(chapterId);
      if (!id || !isRecord(patch)) throw new TypeError('Invalid chapter update');
      const normalized = {};
      for (const [field, value] of Object.entries(patch)) {
        if (field === 'completedSections') continue;
        if (field === 'status' && ['not_started', 'in_progress', 'completed'].includes(value)) normalized[field] = value;
        else if (['progress', 'score', 'timeSpent'].includes(field) && isFiniteNumber(value, 0, field === 'timeSpent' ? Number.MAX_SAFE_INTEGER : 100)) normalized[field] = value;
        else if (['lastVisited', 'lastUpdated', 'startedAt', 'completedAt'].includes(field) && (value === null || validTimestamp(value))) normalized[field] = value === null ? null : validTimestamp(value);
        else throw new TypeError(`Invalid chapter field: ${field}`);
      }
      const sections = patch.completedSections || [];
      if (!Array.isArray(sections)) throw new TypeError('Invalid completed sections');
      const activityIds = sections.map(section => resolveActivityId(id, section));
      if (activityIds.some(activity => !activity)) throw new TypeError('Unrecognized completed section');
      return mutate('chapter', { chapterId: id, patch: normalized, activityIds, timestamp: now() }, context);
    },
    async setResume(containerId, locator, { context } = {}) {
      if (!Object.hasOwn(ACTIVITY_BY_ID, containerId) || !isRecord(locator)) throw new TypeError('Invalid resume container; quiz sessions require the typed quiz API');
      if (locator.session !== undefined) throw new TypeError('Use the typed quiz session API');
      const normalized = { containerId, activityId: locator.activityId ?? null, kind: locator.kind, ...(locator.legacyIndex === undefined ? {} : { legacyIndex: locator.legacyIndex }), ...(locator.positionId === undefined ? {} : { positionId: locator.positionId }) };
      const candidate = createEmptyProgress(identity || { ownerScope: 'guest:loading', deviceId: 'loading' });
      candidate.resumeByDevice[candidate.deviceId] = { [containerId]: normalized };
      if (!validateProgressSnapshot(candidate).valid) throw new TypeError('Invalid resume locator');
      return mutate('resume', { chapterId: chapterOf(containerId), guardContainerId: containerId, containerId, locator: normalized }, context);
    },
    async clearResume(containerId, { context } = {}) {
      if (!Object.hasOwn(ACTIVITY_BY_ID, containerId)) throw new TypeError('Invalid resume container; quiz sessions require a matching session ID');
      return mutateTyped('clear-resume', { chapterId: chapterOf(containerId), guardContainerId: containerId, containerId }, context);
    },
    getLegacySectionResume(containerId) {
      const source = own(LEGACY_SECTION_SOURCE_BY_CONTAINER, containerId);
      if (!hydrated || !source || sectionCheckpoint(record.data, record.deviceId, source.key) || containerWasReset(record, containerId) || own(record.data.resumeByDevice, record.deviceId)?.[containerId]) return null;
      const locator = readLegacySectionResume(source.key, own(record.data.migration.sources, source.key)?.raw);
      return locator ? freeze(copy(locator)) : null;
    },
    async restoreLegacySectionResume(containerId, sourceKey, { context } = {}) {
      if (context === undefined) throw new TypeError('Capture a write context before restoring a section');
      const source = own(LEGACY_SECTION_SOURCE_BY_CONTAINER, containerId);
      if (!source || source.key !== sourceKey) throw new TypeError('Invalid legacy section resume source');
      await hydrate();
      const archived = own(record.data.migration.sources, sourceKey);
      if (!readLegacySectionResume(sourceKey, archived?.raw)) throw new TypeError('No valid archived section position');
      return mutateTyped('restore-section-resume', { chapterId: chapterOf(containerId), guardContainerId: containerId, containerId, sourceKey, raw: archived.raw, fingerprint: archived.fingerprint }, context);
    },
    async resetActivity(containerId, { context } = {}) {
      if (!Object.hasOwn(ACTIVITY_BY_ID, containerId)) throw new TypeError('Invalid activity reset');
      await refreshLegacy();
      return mutateTyped('reset-activity', { chapterId: chapterOf(containerId), guardContainerId: containerId, containerId }, context);
    },
    async beginQuizSession(chapterId, session, { context } = {}) {
      const chapter = quizChapter(chapterId);
      if (context === undefined) throw new TypeError('Capture a write context before beginning a quiz session');
      if (!isJsonValue(session)) throw new TypeError('Quiz session must contain only JSON values');
      if (session?.chapterId !== chapter) throw new TypeError('Quiz session belongs to another chapter');
      const normalized = normalizeQuizSession(session);
      return mutateTyped('quiz-begin', { chapterId: chapter, guardContainerId: `${chapter}:quiz`, session: normalized }, context);
    },
    async updateQuizSession(chapterId, sessionId, patch, { context } = {}) {
      const chapter = quizChapter(chapterId);
      if (!isSafeId(sessionId) || !isRecord(patch) || !isJsonValue(patch)) throw new TypeError('Invalid quiz session update');
      await hydrate();
      const session = currentQuizSession(record, chapter);
      if (session?.sessionId === sessionId) mergeQuizSession(session, patch);
      return mutateTyped('quiz-update', { chapterId: chapter, guardContainerId: `${chapter}:quiz`, sessionId, patch: copy(patch) }, context);
    },
    async finishQuizAttempt(chapterId, { sessionId, attemptId, answersByQuestionId } = {}, { context } = {}) {
      const chapter = quizChapter(chapterId);
      if (!isSafeId(sessionId) || !isSafeId(attemptId)) throw new TypeError('Invalid quiz finish identity');
      const patch = answersByQuestionId === undefined ? {} : { answersByQuestionId };
      if (!isJsonValue(patch)) throw new TypeError('Invalid quiz finish answers');
      await hydrate();
      const session = currentQuizSession(record, chapter);
      if (session?.sessionId === sessionId) createPinnedQuizAttempt(mergeQuizSession(session, patch), { attemptId, date: now() });
      const result = await mutateTyped('quiz-finish', { chapterId: chapter, guardContainerId: `${chapter}:quiz`, sessionId, attemptId, patch: copy(patch), timestamp: now() }, context);
      return { ...result, attempt: result.applied ? copy(own(record.data.quizAttempts, attemptId) || null) : null };
    },
    async clearQuizSession(chapterId, sessionId, { context } = {}) {
      const chapter = quizChapter(chapterId);
      if (!isSafeId(sessionId)) throw new TypeError('Invalid quiz session identity');
      return mutateTyped('quiz-clear', { chapterId: chapter, guardContainerId: `${chapter}:quiz`, sessionId }, context);
    },
    async clearLegacyQuizSession(chapterId, expectedLocator, { context } = {}) {
      const chapter = quizChapter(chapterId);
      if (context === undefined) throw new TypeError('Capture a write context before clearing an archived quiz');
      if (!isRecord(expectedLocator) || !isJsonValue(expectedLocator) || expectedLocator.containerId !== `${chapter}:quiz` || expectedLocator.kind !== 'quiz-session' || expectedLocator.compatibility !== 'unverified' || expectedLocator.legacySession?.chapterId !== chapter || expectedLocator.session !== undefined) throw new TypeError('Invalid archived quiz identity');
      return mutateTyped('legacy-quiz-clear', { chapterId: chapter, guardContainerId: `${chapter}:quiz`, containerId: `${chapter}:quiz`, expectedLocator: copy(expectedLocator) }, context);
    },
    async resetQuiz(chapterId, { context } = {}) {
      const chapter = quizChapter(chapterId);
      await refreshLegacy();
      return mutateTyped('quiz-reset', { chapterId: chapter, guardContainerId: `${chapter}:quiz` }, context);
    },
    async resetAllQuizzes({ context } = {}) { await refreshLegacy(); return mutate('quiz-reset', { chapterId: null }, context); },
    async setQuizPreferences(patch, { context } = {}) {
      if (!isRecord(patch) || !isJsonValue(patch)) throw new TypeError('Invalid quiz preferences');
      const normalized = copy(patch);
      if (Object.hasOwn(normalized, 'immediateFeeback')) {
        if (Object.hasOwn(normalized, 'immediateFeedback') && normalized.immediateFeedback !== normalized.immediateFeeback) throw new TypeError('Conflicting quiz feedback preferences');
        normalized.immediateFeedback = normalized.immediateFeeback; delete normalized.immediateFeeback;
      }
      const candidate = createEmptyProgress(); candidate.preferences.quiz = normalized;
      if (!validateProgressSnapshot(candidate).valid) throw new TypeError('Invalid quiz preferences');
      return mutateTyped('quiz-preferences', { patch: normalized }, context);
    },
    async setDevicePreference(key, value, { context } = {}) {
      const tutorial = typeof key === 'string' && /^tutorial-.+-completed$/.test(key) && key.length <= 1000;
      const recognized = key === 'sidebarOpen' || (typeof key === 'string' && key.endsWith('_devMode') && LEGACY_STORAGE_KEYS.includes(key));
      if ((!tutorial && !recognized) || (value !== null && (tutorial ? !['true', 'skipped'].includes(value) : typeof value !== 'boolean'))) throw new TypeError('Invalid device preference');
      return mutateTyped('device-preference', { key, value }, context);
    },
    async resetChapter(chapterId, { context } = {}) { const id = resolveChapterId(chapterId); if (!id) throw new TypeError('Invalid chapter reset'); await refreshLegacy(); return mutate('reset', { chapterId: id }, context); },
    async resetAll({ context } = {}) { await refreshLegacy(); return mutate('reset', { chapterId: null }, context); },
    async exportProgress() {
      await hydrate();
      return copy({ meta: { version: '2.0.0', exportDate: now() }, snapshot: record.data, checkpoint: { epoch: record.epoch, chapterEpochs: record.chapterEpochs, containerEpochs: record.containerEpochs, closedQuizSessions: record.closedQuizSessions, legacyObserved: record.legacyObserved }, recovery: record.recovery, pendingLocalOperations: pending, ...(record.cloud ? { cloud: record.cloud, accountBlocked: record.accountBlocked } : {}) });
    },
    async importProgress(input, { allowGuestTransfer = false, context } = {}) {
      await hydrate();
      if (!isJsonValue(input)) throw new TypeError('Imported progress must contain only JSON values');
      const raw = JSON.stringify(input);
      if (record.cloud) {
        if (!isRecord(input.snapshot) || input.snapshot.ownerScope !== record.ownerScope || input.snapshot.deviceId !== record.deviceId || !validateProgressSnapshot(input.snapshot).valid || !validateAccountMetadata(input.cloud, record.ownerScope)) throw new TypeError('Account backups must retain the same owner, device and original sync metadata');
        for (const mutation of input.cloud.outbox) {
          const known = record.cloud.outbox.find(item => item.id === mutation.id) || record.cloud.base.document.receipts[mutation.id];
          if (known && known.digest !== mutation.digest) throw new TypeError('Account backup cannot rebind a mutation ID');
        }
        return mutate('account-import', { cloudMutations: copy(input.cloud.outbox), raw }, context);
      }
      let incoming;
      let closedQuizSessions = {};
      if (isRecord(input) && isRecord(input.snapshot)) {
        if (!validateProgressSnapshot(input.snapshot).valid) throw new TypeError('Invalid imported progress snapshot');
        if (input.snapshot.ownerScope !== identity.ownerScope || input.snapshot.deviceId !== identity.deviceId) {
          if (!allowGuestTransfer || !input.snapshot.ownerScope.startsWith('guest:') || !identity.ownerScope.startsWith('guest:')) throw new Error('Cannot import progress across owners or devices');
        }
        incoming = copy(input.snapshot);
        if (input.checkpoint?.closedQuizSessions !== undefined) {
          if (!validClosedSessions(input.checkpoint.closedQuizSessions)) throw new TypeError('Invalid imported quiz session checkpoints');
          closedQuizSessions = copy(input.checkpoint.closedQuizSessions);
        }
        const originalDevice = incoming.deviceId;
        incoming.ownerScope = identity.ownerScope; incoming.deviceId = identity.deviceId;
        if (originalDevice !== identity.deviceId && incoming.resumeByDevice[originalDevice]) { incoming.resumeByDevice[identity.deviceId] = incoming.resumeByDevice[originalDevice]; delete incoming.resumeByDevice[originalDevice]; }
        if (originalDevice !== identity.deviceId && incoming.legacySectionResumeByDevice?.[originalDevice]) { incoming.legacySectionResumeByDevice[identity.deviceId] = incoming.legacySectionResumeByDevice[originalDevice]; delete incoming.legacySectionResumeByDevice[originalDevice]; }
      } else if (isRecord(input) && isRecord(input.progress)) {
        if (!identity.ownerScope.startsWith('guest:')) throw new Error('Legacy files can only be imported into guest progress');
        incoming = migrateLegacyProgress({ probLabProgress: JSON.stringify(input.progress), probLabProgressMeta: JSON.stringify(input.meta || {}) }, identity);
      } else throw new TypeError('Invalid imported progress format');
      return mutate('import', { incoming, raw, closedQuizSessions,
        chapterEpochs: { ...(context?.chapterEpochs || record.chapterEpochs) },
        ...(context?.containerId ? { guardContainerId: context.containerId, chapterId: chapterOf(context.containerId) } : {}),
      }, context);
    },
    setCloudSyncState(state) {
      if (!record.cloud || !isRecord(state) || !['local', 'syncing', 'synced', 'offline', 'conflict', 'capacity'].includes(state.status) || (state.error !== null && typeof state.error !== 'string')) throw new TypeError('Invalid account sync state');
      cloudConnection = copy(state); publish();
    },
    async getCloudBatch() {
      await hydrate(); await working.catch(() => {});
      if (!record.cloud) throw new Error('Guest progress has no cloud outbox');
      if (pending.length) throw new Error('Local progress must be saved before uploading');
      if (!await refresh()) throw new Error('Account progress could not be read for synchronization');
      return selectCloudBatch(record.cloud, record.ownerScope);
    },
    async acceptCloudResponse(response, { isCurrent = () => true } = {}) {
      await hydrate(); await working.catch(() => {});
      if (!record.cloud || !validateCloudResponse(response, record.ownerScope)) throw new TypeError('Invalid account server response');
      if (!isCurrent() || disposed) return false;
      const result = working.catch(() => {}).then(async () => {
        const written = await persistence.update(identity.ownerScope, stored => {
          if (!isCurrent() || disposed) return stored;
          return acceptAccountResponse(safeRecord(stored, identity), response);
        });
        if (!written || !isCurrent() || disposed) return false;
        const readback = safeRecord(await persistence.read(identity.ownerScope), identity, { allowRecovery: false });
        if (readback.revision < written.revision || readback.cloud.base.revision < written.cloud.base.revision) throw new Error('Account acknowledgment could not be verified locally');
        if (!isCurrent() || disposed) return false;
        record = replay(readback); publish(); notifyTabs(); return true;
      });
      working = result;
      return result;
    },
    async previewGuestTransfer(input) {
      await hydrate();
      if (!record.cloud || !isJsonValue(input)) throw new TypeError('Guest transfer requires an account store and JSON progress');
      return previewGuestTransfer(input);
    },
    async queueGuestTransfer(input, { expectedDigest, context } = {}) {
      await hydrate();
      if (!record.cloud || context === undefined) throw new TypeError('Capture account context before confirming a guest transfer');
      validateContext(context, null);
      const transfer = createGuestTransferMutations(input, { expectedDigest, context: context.cloud, deviceId: record.deviceId, createId });
      const result = await mutateTyped('account-transfer', { cloudMutations: transfer.mutations }, context);
      return { ...result, digest: transfer.digest, mutations: transfer.mutations.length };
    },
    async retryPersistence() {
      await hydrate();
      working = working.catch(() => {}).then(async () => { try { await flush(); return true; } catch (error) { publish({ error: error.message, status: 'session-only' }); return false; } });
      return working;
    },
    dispose() { disposed = true; stopListening(); listeners.clear(); persistence.close?.(); },
    isHydrated: () => hydrated,
  };
}

const browserStores = new Map();
/** Legacy userId arguments select isolated local guest profiles, never authenticated accounts. */
export function getLocalProgressStore(userId = 'local') {
  if (typeof window === 'undefined') throw new Error('Guest progress is only available in the browser');
  if (typeof userId !== 'string' || !userId || userId.length > 128) throw new TypeError('Invalid local progress profile');
  if (!browserStores.has(userId)) {
    if (userId === 'local') browserStores.set(userId, createProgressStore());
    else {
      const bytes = new TextEncoder().encode(userId);
      if (bytes.length > 128) throw new TypeError('Local profile identifier is too long');
      const encoded = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const persistence = createIndexedDbPersistence();
      const scoped = {
        ...persistence,
        async getIdentity() {
          const identity = await persistence.getIdentity();
          return { ownerScope: `guest:${identity.deviceId}.profile.${encoded}`, deviceId: identity.deviceId };
        },
      };
      browserStores.set(userId, createProgressStore({ persistence: scoped, importLegacy: false }));
    }
  }
  return browserStores.get(userId);
}
export const getGuestProgressStore = () => getLocalProgressStore();

/** Account identity is supplied by the verified auth provider, never by local profile names. */
export function createAccountProgressStore({ accountId, persistence = createIndexedDbPersistence(), deviceId, ...options } = {}) {
  const ownerScope = normalizeAccountScope(`account:${accountId}`);
  if (deviceId !== undefined) return createProgressStore({ ...options, persistence, ownerScope, deviceId, importLegacy: false });
  const scoped = { ...persistence, async getIdentity() { const guestIdentity = await persistence.getIdentity(); return { ownerScope, deviceId: guestIdentity.deviceId }; } };
  return createProgressStore({ ...options, persistence: scoped, importLegacy: false, accountOwnerScope: ownerScope });
}
