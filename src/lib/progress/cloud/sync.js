import { CURRICULUM, QUIZ_BY_ID } from '@/lib/curriculum/manifest';
import { isRecord, isSafeId, validTimestamp, validateProgressSnapshot } from '../schema';
import { applyCloudMutation } from './reducer';
import { createGuestTransferPayload } from './projection';
import { CLOUD_LIMITS, ancestorsFor, chapterFor, captureCloudWriteContext, canonicalJson, cloneCloudValue, createCloudMutation, createEmptyCloudDocument, emptyCloudFacts, hashCloudValue, isAccountScope, isCloudJson, normalizeAccountScope, normalizeCloudMutationId, validateCloudContext, validateCloudDocument, validateCloudMutation } from './schema';

const bytes = value => new TextEncoder().encode(canonicalJson(value)).byteLength;
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const own = (value, key) => Object.hasOwn(value, key) ? value[key] : undefined;
const LOCAL_LIMITS = Object.freeze({ outbox: 256, bytes: 8 * 1024 * 1024 });
export function createAccountMetadata(ownerScope) {
  return { version: 1, base: { document: createEmptyCloudDocument({ ownerScope }), revision: null, updatedAt: null }, outbox: [], rejected: [], sessionContexts: {}, blocked: [] };
}
export function validateAccountMetadata(value, ownerScope) {
  if (!isCloudJson(value) || !isRecord(value) || Object.keys(value).sort().join(',') !== 'base,blocked,outbox,rejected,sessionContexts,version' || value.version !== 1 || !isRecord(value.base) || !validateCloudDocument(value.base.document, { ownerScope }).valid || (value.base.revision !== null && (!Number.isSafeInteger(value.base.revision) || value.base.revision < 0)) || (value.base.updatedAt !== null && !validTimestamp(value.base.updatedAt)) || !Array.isArray(value.outbox) || value.outbox.length > LOCAL_LIMITS.outbox || !Array.isArray(value.rejected) || !isRecord(value.sessionContexts) || !Array.isArray(value.blocked) || value.blocked.some(item => !isRecord(item) || !isSafeId(item.operationId) || typeof item.reason !== 'string')) return false;
  const ids = new Set();
  for (const mutation of value.outbox) {
    if (!validateCloudMutation(mutation).valid || mutation.ownerScope !== ownerScope || ids.has(mutation.id)) return false;
    ids.add(mutation.id);
  }
  if (value.rejected.some(item => !isRecord(item) || typeof item.reason !== 'string' || !validateCloudMutation(item.mutation).valid || item.mutation.ownerScope !== ownerScope)) return false;
  if (Object.entries(value.sessionContexts).some(([id, context]) => !isSafeId(id) || !validateCloudContext(context) || context.ownerScope !== ownerScope)) return false;
  try { return bytes(value) <= LOCAL_LIMITS.bytes; } catch { return false; }
}
export function accountView(cloud, ownerScope) {
  if (!validateAccountMetadata(cloud, ownerScope)) throw new Error('Account sync metadata is invalid; the original record was preserved');
  let document = cloneCloudValue(cloud.base.document);
  for (const mutation of cloud.outbox) document = applyCloudMutation(document, mutation, { verifiedOwnerScope: ownerScope }).document;
  return document;
}
function preserveRejection(record, mutation, reason) {
  if (!record.cloud.rejected.some(item => item.mutation.id === mutation.id)) record.cloud.rejected.push({ mutation: cloneCloudValue(mutation), reason });
}

// Local pinned banks may exceed cloud bounds. Compare their already validated
// JSON without applying the cloud node/byte limits a second time.
function localJson(value) {
  if (Array.isArray(value)) return `[${value.map(localJson).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${localJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
const localCopy = value => JSON.parse(JSON.stringify(value));
const localFingerprint = value => hashCloudValue(localJson(value));
const branchGroups = ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores', 'quizPreferences', 'closedQuizSessions'];
function localFacts(record) {
  return { ...Object.fromEntries(branchGroups.slice(0, 4).map(group => [group, record.data[group]])), quizPreferences: record.data.preferences.quiz, closedQuizSessions: record.closedQuizSessions };
}
export function createAccountBlockedBranch(record, before, operation) {
  const prior = localFacts(before); const after = localFacts(record);
  const changes = Object.fromEntries(branchGroups.map(group => [group, { put: {}, remove: {} }]));
  for (const group of branchGroups) {
    for (const [id, value] of Object.entries(after[group])) {
      const previous = own(prior[group], id);
      if (previous !== undefined && localJson(previous) === localJson(value)) continue;
      if (group === 'activities') {
        const seen = new Set((previous?.evidence || []).map(localJson));
        changes[group].put[id] = value.evidence.flatMap((item, index) => seen.has(localJson(item)) ? [] : [index]);
      } else if (group === 'chaptersLegacy') changes[group].put[id] = Object.keys(value).filter(key => previous?.[key] === undefined || localJson(previous[key]) !== localJson(value[key]));
      else changes[group].put[id] = true;
    }
    for (const [id, value] of Object.entries(prior[group])) if (!Object.hasOwn(after[group], id)) changes[group].remove[id] = localFingerprint(value);
  }
  const priorSession = operation.type === 'quiz-begin' ? before.data.resumeByDevice[before.deviceId]?.[`${operation.chapterId}:quiz`]?.session?.sessionId : operation.sessionId;
  const context = ['quiz-finish', 'quiz-clear', 'quiz-begin'].includes(operation.type) && priorSession ? before.cloud.sessionContexts[priorSession] || operation.cloudContext : operation.cloudContext;
  return { reason: 'account-unsyncable', operation: localCopy(operation), snapshot: localCopy(record.data), closedQuizSessions: localCopy(record.closedQuizSessions), context: localCopy(context), changes };
}
function validBlockedOperation(operation, ownerScope) {
  if (!isRecord(operation) || !isSafeId(operation.id) || !validateCloudContext(operation.cloudContext) || operation.cloudContext.ownerScope !== ownerScope) return false;
  if (operation.type === 'complete') return chapterFor(operation.activityId) !== null && !Object.hasOwn(QUIZ_BY_ID, operation.activityId);
  if (operation.type === 'chapter') return chapterFor(operation.chapterId) === operation.chapterId && isRecord(operation.patch) && Array.isArray(operation.activityIds) && operation.activityIds.every(id => chapterFor(id) === operation.chapterId);
  if (operation.type === 'reset') return operation.chapterId === null || chapterFor(operation.chapterId) === operation.chapterId;
  if (operation.type === 'reset-activity') return chapterFor(operation.containerId) !== null && !Object.hasOwn(QUIZ_BY_ID, operation.containerId);
  if (operation.type === 'quiz-reset') return operation.chapterId === null || Object.hasOwn(QUIZ_BY_ID, `${operation.chapterId}:quiz`);
  if (operation.type === 'quiz-preferences') return isRecord(operation.patch);
  if (!Object.hasOwn(QUIZ_BY_ID, `${operation.chapterId}:quiz`)) return false;
  if (operation.type === 'quiz-begin') return isRecord(operation.session) && operation.session.chapterId === operation.chapterId && isSafeId(operation.session.sessionId);
  return ['quiz-finish', 'quiz-clear'].includes(operation.type) && isSafeId(operation.sessionId) && (operation.type !== 'quiz-finish' || isSafeId(operation.attemptId));
}
export function validateAccountBlockedBranch(branch, ownerScope) {
  if (!isRecord(branch) || branch.reason !== 'account-unsyncable' || !validBlockedOperation(branch.operation, ownerScope) || !validateProgressSnapshot(branch.snapshot).valid || !isRecord(branch.closedQuizSessions) || !validateCloudContext(branch.context) || branch.context.ownerScope !== ownerScope || !isRecord(branch.changes) || Object.keys(branch.changes).sort().join(',') !== [...branchGroups].sort().join(',')) return false;
  const facts = localFacts({ data: branch.snapshot, closedQuizSessions: branch.closedQuizSessions });
  return branchGroups.every(group => {
    const diff = branch.changes[group];
    if (!isRecord(diff) || Object.keys(diff).sort().join(',') !== 'put,remove' || !isRecord(diff.put) || !isRecord(diff.remove) || !isRecord(facts[group])) return false;
    if (Object.entries(diff.remove).some(([id, fingerprint]) => !isSafeId(id) || typeof fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(fingerprint))) return false;
    return Object.entries(diff.put).every(([id, change]) => {
      if (!Object.hasOwn(facts[group], id) || Object.hasOwn(diff.remove, id)) return false;
      if (group === 'activities') return Array.isArray(change) && new Set(change).size === change.length && change.every(index => Number.isInteger(index) && index >= 0 && index < facts[group][id].evidence.length);
      if (group === 'chaptersLegacy') return Array.isArray(change) && new Set(change).size === change.length && change.every(key => typeof key === 'string' && Object.hasOwn(facts[group][id], key));
      return change === true;
    });
  });
}
function branchIsCurrent(branch, checkpoints) {
  const { operation, context } = branch;
  if (context.global !== checkpoints.global) return false;
  const target = operation.type === 'complete' ? operation.activityId : operation.type === 'chapter' || operation.type === 'reset' ? operation.chapterId : operation.type === 'reset-activity' ? operation.containerId : ['quiz-finish', 'quiz-clear', 'quiz-begin', 'quiz-reset'].includes(operation.type) && operation.chapterId ? `${operation.chapterId}:quiz` : null;
  const all = operation.type === 'reset' && !operation.chapterId;
  const quizzes = operation.type === 'quiz-preferences' || operation.type === 'quiz-reset' && !operation.chapterId;
  if (!target && !all && !quizzes) return false;
  const chapter = chapterFor(target);
  const chapters = all ? new Set([...Object.keys(checkpoints.chapters), ...Object.keys(context.chapters)]) : chapter ? new Set([chapter]) : new Set();
  if (quizzes) for (const item of CURRICULUM.chapters) if (item.quiz) chapters.add(item.id);
  if ([...chapters].some(id => (own(context.chapters, id) || null) !== (own(checkpoints.chapters, id) || null))) return false;
  const containers = new Set([...Object.keys(context.containers), ...Object.keys(checkpoints.containers)]);
  const relevant = all ? [...containers] : quizzes ? [...containers].filter(id => Object.hasOwn(QUIZ_BY_ID, id)) : [...containers].filter(id => ancestorsFor(target).includes(id) || id === target || id.startsWith(`${target}:`));
  return relevant.every(id => (own(context.containers, id) || null) === (own(checkpoints.containers, id) || null));
}
function mergeChapterHistory(previous = {}, patch) {
  const result = { ...previous }; const statuses = ['not_started', 'in_progress', 'completed'];
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'status') result[key] = statuses[Math.max(statuses.indexOf(previous[key]), statuses.indexOf(value))];
    else if (['progress', 'score', 'timeSpent'].includes(key)) result[key] = Math.max(previous[key] || 0, value);
    else result[key] = !previous[key] ? value : value === null ? previous[key] : ['startedAt', 'completedAt'].includes(key) ? [previous[key], value].sort()[0] : [previous[key], value].sort()[1];
  }
  return result;
}
function branchOwnsFact(branch, group, id, value) {
  const operation = branch.operation; const type = operation.type;
  if (type === 'complete') return group === 'activities' && id === operation.activityId;
  if (type === 'chapter') return group === 'chaptersLegacy' && id === operation.chapterId || group === 'activities' && operation.activityIds.includes(id);
  if (type === 'quiz-finish') return group === 'quizAttempts' && id === operation.attemptId && value.chapterId === operation.chapterId && value.sessionId === operation.sessionId || group === 'closedQuizSessions' && id === operation.sessionId && value.chapterId === operation.chapterId && value.reason === 'finished' && value.attemptId === operation.attemptId;
  if (type === 'quiz-clear') return group === 'closedQuizSessions' && id === operation.sessionId && value.chapterId === operation.chapterId && value.reason === 'cleared';
  if (type === 'quiz-begin') return group === 'closedQuizSessions' && value.chapterId === operation.chapterId && value.reason === 'replaced';
  if (type === 'quiz-preferences') return group === 'quizPreferences' && Object.hasOwn(operation.patch, id);
  if (type === 'reset-activity') return group === 'activities' && (ancestorsFor(operation.containerId).includes(id) || id.startsWith(`${operation.containerId}:`));
  if (type === 'quiz-reset') return ['quizAttempts', 'legacyBestScores', 'closedQuizSessions'].includes(group) && (!operation.chapterId || (group === 'legacyBestScores' ? id : value.chapterId) === operation.chapterId) || group === 'quizPreferences' && !operation.chapterId;
  return type === 'reset' && group !== 'quizPreferences' && (!operation.chapterId || (['quizAttempts', 'closedQuizSessions'].includes(group) ? value.chapterId : chapterFor(id)) === operation.chapterId);
}
function overlayBlockedBranch(record, branch, view) {
  if (!branchIsCurrent(branch, view.checkpoints)) return;
  const source = localFacts({ data: branch.snapshot, closedQuizSessions: branch.closedQuizSessions });
  const target = localFacts(record);
  for (const group of branchGroups) for (const [id, fingerprint] of Object.entries(branch.changes[group].remove)) if (Object.hasOwn(target[group], id) && branchOwnsFact(branch, group, id, target[group][id]) && localFingerprint(target[group][id]) === fingerprint) delete target[group][id];
  for (const [id, indices] of Object.entries(branch.changes.activities.put)) {
    if (!branchOwnsFact(branch, 'activities', id, source.activities[id])) continue;
    const activity = target.activities[id] || { activityId: id, generation: 0, evidence: [] };
    const seen = new Set(activity.evidence.map(localJson));
    target.activities[id] = { ...activity, evidence: [...activity.evidence, ...indices.flatMap(index => { const evidence = source.activities[id].evidence[index]; const key = localJson(evidence); if (seen.has(key)) return []; seen.add(key); return [localCopy(evidence)]; })] };
  }
  for (const [id, fields] of Object.entries(branch.changes.chaptersLegacy.put)) if (branchOwnsFact(branch, 'chaptersLegacy', id, source.chaptersLegacy[id])) target.chaptersLegacy[id] = mergeChapterHistory(target.chaptersLegacy[id], Object.fromEntries(fields.filter(key => Object.hasOwn(branch.operation.patch || {}, key)).map(key => [key, source.chaptersLegacy[id][key]])));
  for (const id of Object.keys(branch.changes.legacyBestScores.put)) if (branchOwnsFact(branch, 'legacyBestScores', id, source.legacyBestScores[id]) && (!target.legacyBestScores[id] || source.legacyBestScores[id].percentage > target.legacyBestScores[id].percentage)) target.legacyBestScores[id] = localCopy(source.legacyBestScores[id]);
  for (const id of Object.keys(branch.changes.quizPreferences.put)) if (branchOwnsFact(branch, 'quizPreferences', id, source.quizPreferences[id])) target.quizPreferences[id] = source.quizPreferences[id];
  const acceptedAttempts = new Set();
  for (const id of Object.keys(branch.changes.quizAttempts.put)) {
    const attempt = source.quizAttempts[id]; const existing = own(target.quizAttempts, id); const closure = own(target.closedQuizSessions, attempt.sessionId);
    if (!branchOwnsFact(branch, 'quizAttempts', id, attempt)) continue;
    if (existing) { if (localJson(existing) === localJson(attempt)) acceptedAttempts.add(id); continue; }
    if (closure || Object.entries(target.closedQuizSessions).some(([sessionId, item]) => item.attemptId === id && sessionId !== attempt.sessionId) || Object.values(target.quizAttempts).some(item => !item.legacy && item.sessionId === attempt.sessionId)) continue;
    target.quizAttempts[id] = localCopy(attempt); acceptedAttempts.add(id);
  }
  for (const id of Object.keys(branch.changes.closedQuizSessions.put)) {
    const closure = source.closedQuizSessions[id];
    if (closure.operationId !== branch.operation.id || !branchOwnsFact(branch, 'closedQuizSessions', id, closure)) continue;
    if (!Object.hasOwn(target.closedQuizSessions, id) && (closure.reason !== 'finished' || acceptedAttempts.has(closure.attemptId))) target.closedQuizSessions[id] = localCopy(closure);
  }
}
export function materializeAccount(record, previousView) {
  const view = accountView(record.cloud, record.ownerScope);
  const old = previousView?.checkpoints;
  const current = view.checkpoints;
  const resetScopes = [];
  if (old && old.global !== current.global) { record.epoch++; resetScopes.push(null); }
  if (old) for (const id of new Set([...Object.keys(old.chapters), ...Object.keys(current.chapters)])) if ((old.chapters[id] || null) !== (current.chapters[id] || null)) { record.chapterEpochs[id] = (record.chapterEpochs[id] || 0) + 1; resetScopes.push(id); }
  if (old) for (const id of new Set([...Object.keys(old.containers), ...Object.keys(current.containers)])) if ((old.containers[id] || null) !== (current.containers[id] || null)) { record.containerEpochs[id] = (record.containerEpochs[id] || 0) + 1; resetScopes.push(id); }
  for (const locators of Object.values(record.data.resumeByDevice)) for (const [id, locator] of Object.entries(locators)) {
    const reset = resetScopes.some(scope => scope === null || id === scope || id.startsWith(`${scope}:`));
    if (reset || locator.session && view.facts.closedQuizSessions[locator.session.sessionId]) {
      if (locator.session) delete record.cloud.sessionContexts[locator.session.sessionId];
      delete locators[id];
    }
  }
  record.data.activities = Object.fromEntries(Object.entries(view.facts.activities).map(([id, activity]) => [id, { ...cloneCloudValue(activity), generation: 0 }]));
  for (const group of ['chaptersLegacy', 'quizAttempts', 'legacyBestScores']) record.data[group] = cloneCloudValue(view.facts[group]);
  record.data.preferences.quiz = cloneCloudValue(view.facts.quizPreferences);
  record.closedQuizSessions = cloneCloudValue(view.facts.closedQuizSessions);
  record.data.sync = { status: record.cloud.blocked.length ? 'capacity' : record.cloud.rejected.length ? 'conflict' : record.cloud.outbox.length ? 'pending' : record.cloud.base.revision === null ? 'local' : 'synced', pendingMutationIds: record.cloud.outbox.map(item => item.id) };
  for (const branch of record.accountBlocked || []) overlayBlockedBranch(record, branch, view);
  if (!validateProgressSnapshot(record.data).valid) throw new Error('Account materialization produced invalid progress');
  return view;
}
function derivedId(id, suffix) {
  const hex = hashCloudValue([id, suffix]).slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
}
export function appendAccountOperation(record, operation, before, locallyRejected) {
  if (!record.cloud) return;
  if (locallyRejected) return;
  const context = operation.cloudContext;
  if (!validateCloudContext(context) || context.ownerScope !== record.ownerScope) throw new TypeError('Account work requires its original cloud context');
  const mutations = [];
  const add = (type, payload, suffix = null, captured = context) => mutations.push(createCloudMutation({ id: suffix ? derivedId(operation.id, suffix) : normalizeCloudMutationId(operation.id), deviceId: record.deviceId, type, payload, context: captured }));
  if (operation.type === 'complete') {
    if (!before.data.activities[operation.activityId]?.evidence.some(item => item.kind === operation.evidence.kind && item.sourceKey === operation.evidence.sourceKey)) add('complete', { activityId: operation.activityId, ...operation.evidence });
  }
  else if (operation.type === 'chapter') {
    if (Object.keys(operation.patch).length) add('chapter-history', { chapterId: operation.chapterId, patch: operation.patch });
    for (const id of operation.activityIds) if (!before.data.activities[id]?.evidence.some(item => item.kind === 'study-completed' && item.sourceKey === 'progress-service')) add('complete', { activityId: id, kind: 'study-completed', sourceKey: 'progress-service', completedAt: operation.timestamp }, `activity:${id}`);
  } else if (operation.type === 'quiz-finish') {
    const attempt = record.data.quizAttempts[operation.attemptId];
    if (attempt && !before.data.quizAttempts[operation.attemptId]) add('quiz-finish', { attempt }, null, before.cloud.sessionContexts[operation.sessionId] || context);
    delete record.cloud.sessionContexts[operation.sessionId];
  } else if (operation.type === 'quiz-clear') { add('quiz-close', { chapterId: operation.chapterId, sessionId: operation.sessionId, reason: 'cleared' }, null, before.cloud.sessionContexts[operation.sessionId] || context); delete record.cloud.sessionContexts[operation.sessionId]; }
  else if (operation.type === 'quiz-begin') {
    const prior = before.data.resumeByDevice[before.deviceId]?.[`${operation.chapterId}:quiz`]?.session;
    if (prior && prior.sessionId !== operation.session.sessionId) add('quiz-close', { chapterId: operation.chapterId, sessionId: prior.sessionId, reason: 'replaced' }, null, before.cloud.sessionContexts[prior.sessionId] || context);
    if (prior && prior.sessionId !== operation.session.sessionId) delete record.cloud.sessionContexts[prior.sessionId];
    record.cloud.sessionContexts[operation.session.sessionId] = cloneCloudValue(context);
  } else if (operation.type === 'quiz-preferences' && Object.entries(operation.patch).some(([key, value]) => before.data.preferences.quiz[key] !== value)) add('quiz-preferences', { patch: operation.patch });
  else if (['reset', 'reset-activity', 'quiz-reset'].includes(operation.type)) {
    const scope = operation.type === 'reset' ? operation.chapterId ? 'chapter' : 'global' : operation.type === 'reset-activity' ? 'activity' : operation.chapterId ? 'quiz' : 'quizzes';
    const targetId = scope === 'activity' ? operation.containerId : scope === 'quiz' ? `${operation.chapterId}:quiz` : scope === 'chapter' ? operation.chapterId : null;
    const closedSessions = scope === 'activity' ? [] : Object.values(before.data.resumeByDevice).flatMap(locators => Object.values(locators).flatMap(locator => locator.session && (!operation.chapterId || locator.session.chapterId === operation.chapterId) ? [{ chapterId: locator.session.chapterId, sessionId: locator.session.sessionId }] : []));
    add('reset', { scope, targetId, ...(closedSessions.length ? { closedSessions } : {}) });
    for (const session of closedSessions) delete record.cloud.sessionContexts[session.sessionId];
  } else if (operation.type === 'account-transfer') mutations.push(...operation.cloudMutations);
  else if (operation.type === 'account-import') {
    mutations.push(...operation.cloudMutations);
  }
  for (const mutation of mutations) {
    const existing = record.cloud.outbox.find(item => item.id === mutation.id);
    if (existing && existing.digest !== mutation.digest) throw new Error('Cloud mutation ID cannot be rebound');
    const receipt = record.cloud.base.document.receipts[mutation.id];
    if (receipt && receipt.digest !== mutation.digest) throw new Error('Cloud mutation ID cannot be rebound');
    if (!existing && !receipt) record.cloud.outbox.push(mutation);
  }
  if (!validateAccountMetadata(record.cloud, record.ownerScope)) throw new Error('Account outbox capacity reached; export progress before retrying');
  const view = accountView(record.cloud, record.ownerScope);
  for (const mutation of mutations) if (view.receipts[mutation.id]?.status === 'rejected') { preserveRejection(record, mutation, view.receipts[mutation.id].reason); record.recovery.push({ reason: view.receipts[mutation.id].reason, operation: JSON.parse(JSON.stringify(operation)) }); }
  // The local reset already advanced its numeric guard. Reconciliation only
  // advances guards when a different remote lineage changes the current view.
  materializeAccount(record);
}
export function validateCloudResponse(value, ownerScope) {
  if (!isCloudJson(value) || !isRecord(value) || value.accountId !== ownerScope.slice(8) || value.ownerScope !== ownerScope || !Number.isSafeInteger(value.revision) || value.revision < 0 || !validateCloudDocument(value.document, { ownerScope }).valid || (value.updatedAt !== null && !validTimestamp(value.updatedAt)) || !Array.isArray(value.outcomes)) return false;
  const ids = new Set();
  return value.outcomes.every(item => {
    if (!isRecord(item) || ids.has(item.id) || typeof item.digest !== 'string') return false;
    ids.add(item.id);
    const receipt = value.document.receipts[item.id];
    return receipt && receipt.digest === item.digest && receipt.status === item.status && receipt.reason === item.reason;
  });
}
export function acceptAccountResponse(record, response) {
  if (!validateCloudResponse(response, record.ownerScope)) throw new TypeError('Server progress response has invalid account ownership or data');
  const before = accountView(record.cloud, record.ownerScope);
  const base = record.cloud.base;
  if (base.revision !== null && response.revision < base.revision) return record;
  const firstInsert = base.revision === 0 && base.updatedAt === null && response.updatedAt !== null && same(base.document, createEmptyCloudDocument({ ownerScope: record.ownerScope }));
  if (base.revision === response.revision && !same(base.document, response.document) && !firstInsert) throw new Error('Server progress revision changed without advancing');
  const acknowledged = [];
  for (const mutation of record.cloud.outbox) {
    const receipt = response.document.receipts[mutation.id];
    if (!receipt) continue;
    if (receipt.digest !== mutation.digest) throw new Error('Server mutation receipt does not match its original payload');
    acknowledged.push(mutation.id);
    if (receipt.status === 'rejected') preserveRejection(record, mutation, receipt.reason);
  }
  record.cloud.base = { document: cloneCloudValue(response.document), revision: response.revision, updatedAt: response.updatedAt };
  record.cloud.outbox = record.cloud.outbox.filter(item => !acknowledged.includes(item.id));
  const pendingView = accountView(record.cloud, record.ownerScope);
  for (const mutation of record.cloud.outbox) if (pendingView.receipts[mutation.id]?.status === 'rejected') preserveRejection(record, mutation, pendingView.receipts[mutation.id].reason);
  materializeAccount(record, before);
  record.revision++;
  return record;
}
export function selectCloudBatch(cloud, ownerScope) {
  if (!validateAccountMetadata(cloud, ownerScope)) throw new TypeError('Invalid account outbox');
  const mutations = [];
  if (cloud.blocked.length) return mutations;
  for (const item of cloud.outbox) {
    const next = [...mutations, item];
    if (next.length > CLOUD_LIMITS.batchMutations || bytes({ expectedAccountId: ownerScope.slice(8), mutations: next }) > CLOUD_LIMITS.batchBytes) break;
    mutations.push(cloneCloudValue(item));
  }
  return mutations;
}
export function previewGuestTransfer(input) {
  if (!isCloudJson(input)) throw new TypeError('Guest transfer requires JSON progress');
  const payload = createGuestTransferPayload(input.snapshot || input, input.checkpoint?.closedQuizSessions ? { closedQuizSessions: input.checkpoint.closedQuizSessions } : {});
  return { digest: payload.contentDigest, activities: Object.keys(payload.facts.activities).length, quizAttempts: Object.keys(payload.facts.quizAttempts).length };
}
export function createGuestTransferMutations(input, { expectedDigest, context, deviceId, createId }) {
  if (!isCloudJson(input)) throw new TypeError('Guest transfer requires JSON progress');
  const snapshot = input.snapshot || input;
  const options = input.checkpoint?.closedQuizSessions ? { closedQuizSessions: input.checkpoint.closedQuizSessions } : {};
  const projected = createGuestTransferPayload(snapshot, options);
  if (expectedDigest !== projected.contentDigest) throw new Error('Guest progress changed since its transfer preview');
  if (!validateCloudContext(context) || !isAccountScope(context.ownerScope) || context.containerId !== null) throw new TypeError('Guest transfer requires a captured whole-account context');
  const chunks = []; let facts = emptyCloudFacts();
  function payload(value) { return { sourceOwnerScope: projected.sourceOwnerScope, facts: value, contentDigest: hashCloudValue({ sourceOwnerScope: projected.sourceOwnerScope, facts: value }) }; }
  function flush() { if (Object.values(facts).some(value => Object.keys(value).length)) { chunks.push(payload(facts)); facts = emptyCloudFacts(); } }
  function include(group, key, value, closure) {
    let next = cloneCloudValue(facts); next[group][key] = value;
    if (closure) next.closedQuizSessions[closure.id] = closure.value;
    if (bytes(payload(next)) > CLOUD_LIMITS.mutationBytes - 4096) { flush(); next = emptyCloudFacts(); next[group][key] = value; if (closure) next.closedQuizSessions[closure.id] = closure.value; }
    if (bytes(payload(next)) > CLOUD_LIMITS.mutationBytes - 4096) throw new Error('One pinned quiz attempt exceeds the account transfer limit');
    facts = next;
  }
  const linkedClosures = new Set();
  for (const [key, attempt] of Object.entries(projected.facts.quizAttempts)) {
    const closure = projected.facts.closedQuizSessions[attempt.sessionId];
    if (closure) linkedClosures.add(attempt.sessionId);
    include('quizAttempts', key, attempt, closure && { id: attempt.sessionId, value: closure });
  }
  for (const group of ['activities', 'chaptersLegacy', 'legacyBestScores', 'closedQuizSessions']) for (const [key, value] of Object.entries(projected.facts[group])) if (group !== 'closedQuizSessions' || !linkedClosures.has(key)) include(group, key, value);
  if (Object.keys(projected.facts.quizPreferences).length) { facts.quizPreferences = projected.facts.quizPreferences; if (bytes(payload(facts)) > CLOUD_LIMITS.mutationBytes - 4096) { const preferences = facts.quizPreferences; facts.quizPreferences = {}; flush(); facts.quizPreferences = preferences; } }
  flush();
  return { digest: projected.contentDigest, mutations: chunks.map(chunk => createCloudMutation({ id: createId(), deviceId, type: 'guest-transfer', context, payload: chunk })) };
}

/** The authenticated provider supplies identity; every request is also verified by the server. */
export function createAccountSyncCoordinator({ store, transport, accountId, generation, isCurrent = () => true } = {}) {
  const ownerScope = normalizeAccountScope(`account:${accountId}`);
  if (!store || !transport || typeof transport.read !== 'function' || typeof transport.write !== 'function' || generation === undefined) throw new TypeError('Account sync requires a store, transport and captured generation');
  let attached = true; let running = null; let controller; let unsubscribe; let retryAt = 0;
  const current = () => attached && isCurrent({ accountId: ownerScope.slice(8), generation });
  async function run() {
    if (!current()) return false;
    await store.hydrate();
    if (!current() || store.getSnapshot().data.ownerScope !== ownerScope) return false;
    const persisted = await store.retryPersistence();
    if (!current() || !persisted) return false;
    controller = new AbortController();
    if (!current()) return false;
    store.setCloudSyncState({ status: 'syncing', error: null });
    try {
      if (!current()) return false;
      const response = await transport.read({ expectedAccountId: ownerScope.slice(8), signal: controller.signal });
      if (!current()) return false;
      const accepted = await store.acceptCloudResponse(response, { isCurrent: current });
      if (!current() || !accepted) return false;
      let batches = 0;
      while (current() && batches++ < LOCAL_LIMITS.outbox) {
        const mutations = await store.getCloudBatch();
        if (!current()) return false;
        if (!mutations.length) break;
        const result = await transport.write({ expectedAccountId: ownerScope.slice(8), mutations, signal: controller.signal });
        if (!current()) return false;
        const acknowledged = await store.acceptCloudResponse(result, { isCurrent: current });
        if (!current() || !acknowledged) return false;
        const remaining = await store.getCloudBatch();
        if (!current()) return false;
        if (remaining[0]?.id === mutations[0].id) throw new Error('Server did not acknowledge the pending mutation');
      }
      if (!current()) return false;
      retryAt = 0;
      store.setCloudSyncState({ status: store.getSnapshot().cloud?.blockedMutations ? 'capacity' : store.getSnapshot().cloud?.rejectedMutations ? 'conflict' : 'synced', error: null });
      return current();
    } catch (error) {
      retryAt = Date.now() + Math.min(3600000, Math.max(30000, Number.isFinite(error?.retryAfterMs) ? error.retryAfterMs : 30000));
      if (current()) store.setCloudSyncState({ status: error?.code === 'cloud-capacity' || error?.status === 413 ? 'capacity' : 'offline', error: error?.message || 'Account progress could not be synchronized' });
      return false;
    }
  }
  function sync({ automatic = false } = {}) { if (automatic && Date.now() < retryAt) return Promise.resolve(false); if (!running) running = run().finally(() => { running = null; }); return running; }
  return {
    start() { if (!attached) return Promise.resolve(false); if (!unsubscribe) unsubscribe = store.subscribe(() => { if (current() && !store.getSnapshot().loading && store.getSnapshot().cloud?.pendingMutations && !store.getSnapshot().cloud?.blockedMutations && Date.now() >= retryAt && !running) void sync({ automatic: true }); }); return sync(); },
    sync, retry: sync,
    detach() { attached = false; controller?.abort(); unsubscribe?.(); unsubscribe = undefined; },
    dispose() { this.detach(); },
    isAttached: current,
  };
}
