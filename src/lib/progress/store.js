import { ACTIVITY_BY_ID, CURRICULUM, LEGACY_STORAGE_KEYS, isLegacyStorageKey, resolveActivityId, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress, isFiniteNumber, isOwnerScope, isRecord, isSafeId, validTimestamp, validateProgressSnapshot } from './schema';
import { migrateLegacyProgress } from './legacyMigration';
import { createIndexedDbPersistence, createProgressId } from './persistence';

const copy = value => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const own = (value, key) => Object.hasOwn(value, key) ? value[key] : undefined;
function put(value, key, item) { Object.defineProperty(value, key, { value: item, writable: true, configurable: true, enumerable: true }); }
function isJsonValue(value, ancestors = new Set(), depth = 0) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if ((!Array.isArray(value) && !isRecord(value)) || ancestors.has(value) || depth > 100) return false;
  if (Object.getOwnPropertySymbols(value).length || (Array.isArray(value) && Object.keys(value).length !== value.length)) return false;
  const next = new Set(ancestors).add(value);
  return Object.values(value).every(item => isJsonValue(item, next, depth + 1));
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function newRecord(identity) {
  return { version: 1, ...identity, revision: 0, epoch: 0, chapterEpochs: {}, data: createEmptyProgress(identity), legacyObserved: {}, appliedOperations: {}, recovery: [] };
}
function safeRecord(value, identity, { allowRecovery = true } = {}) {
  if (value === undefined) {
    if (!allowRecovery) throw new Error('Progress write could not be verified');
    return newRecord(identity);
  }
  if (isRecord(value) && ((Object.hasOwn(value, 'ownerScope') && value.ownerScope !== identity.ownerScope) || (Object.hasOwn(value, 'deviceId') && value.deviceId !== identity.deviceId))) throw new Error('Stored progress belongs to another owner or device');
  if (isRecord(value?.data) && ((Object.hasOwn(value.data, 'ownerScope') && value.data.ownerScope !== identity.ownerScope) || (Object.hasOwn(value.data, 'deviceId') && value.data.deviceId !== identity.deviceId))) throw new Error('Stored progress belongs to another owner or device');
  if (!isJsonValue(value)) throw new Error('Stored progress has unsupported data; its original record was preserved');
  if (isRecord(value) && value.version === 1 && validateProgressSnapshot(value.data).valid && value.data.ownerScope === identity.ownerScope && value.data.deviceId === identity.deviceId && Number.isSafeInteger(value.revision) && value.revision >= 0 && Number.isSafeInteger(value.epoch) && value.epoch >= 0 && isRecord(value.chapterEpochs) && Object.entries(value.chapterEpochs).every(([id, epoch]) => resolveChapterId(id) === id && Number.isSafeInteger(epoch) && epoch >= 0) && isRecord(value.legacyObserved) && Object.values(value.legacyObserved).every(raw => raw === null || typeof raw === 'string') && isRecord(value.appliedOperations) && Object.keys(value.appliedOperations).every(isSafeId) && Array.isArray(value.recovery)) return copy(value);
  if (!allowRecovery) throw new Error('Progress write could not be verified');
  const recovered = newRecord(identity);
  const raw = JSON.stringify(value);
  if (typeof raw !== 'string') throw new Error('Stored progress cannot be safely recovered');
  recovered.recovery.push({ reason: 'invalid-stored-record', raw });
  return recovered;
}
function chapterOf(activityId) { return /^chapter-[1-8](?=:|$)/.exec(activityId)?.[0] || null; }
function evidenceKey(evidence) { return JSON.stringify(evidence); }
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
      if (!Object.hasOwn(data.resumeByDevice, device)) put(data.resumeByDevice, device, {});
      put(data.resumeByDevice[device], container, copy(locator));
    }
  }
  for (const group of ['quiz', 'device']) for (const [key, value] of Object.entries(incoming.preferences[group])) if (!same(value, own(before.preferences[group], key))) put(data.preferences[group], key, copy(value));
}
function ingest(record, rawByKey) {
  const identity = { ownerScope: record.ownerScope, deviceId: record.deviceId };
  for (const [key, raw] of Object.entries(rawByKey)) {
    if (own(record.legacyObserved, key) === raw) continue;
    const beforeRaw = own(record.legacyObserved, key);
    const before = migrateLegacyProgress(beforeRaw == null ? {} : { [key]: beforeRaw }, identity);
    const after = migrateLegacyProgress(raw == null ? {} : { [key]: raw }, identity);
    // Keep the complete recovery archive while applying only newly observed facts.
    const archive = migrateLegacyProgress(raw == null ? {} : { [key]: raw }, { ...identity, existing: record.data });
    record.data.migration = archive.migration;
    record.data.unattributedLegacy = archive.unattributedLegacy;
    mergeFacts(record.data, after, before);
    put(record.legacyObserved, key, raw);
  }
}
function reset(record, chapterId) {
  const match = id => !chapterId || chapterOf(id) === chapterId;
  for (const group of ['activities', 'chaptersLegacy', 'quizAttempts', 'legacyBestScores']) {
    for (const [id, item] of Object.entries(record.data[group])) if (match(group === 'quizAttempts' ? item.chapterId : id)) delete record.data[group][id];
  }
  for (const locators of Object.values(record.data.resumeByDevice)) for (const id of Object.keys(locators)) if (match(id)) delete locators[id];
  if (chapterId) record.chapterEpochs[chapterId] = (record.chapterEpochs[chapterId] || 0) + 1;
  else record.epoch++;
}
function applyOperation(record, operation) {
  if (Object.hasOwn(record.appliedOperations, operation.id)) return record;
  if (operation.type !== 'legacy' && (operation.epoch !== record.epoch || (operation.chapterId && operation.chapterEpoch !== (record.chapterEpochs[operation.chapterId] || 0)))) {
    record.recovery.push({ reason: 'write-predates-reset', operation: copy(operation) });
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
  } else if (operation.type === 'reset') reset(record, operation.chapterId);
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
    mergeFacts(record.data, incoming);
    const archive = migrateLegacyProgress(Object.fromEntries(Object.entries(operation.incoming.migration.sources).map(([key, source]) => [key, source.raw])), { existing: record.data });
    record.data.migration = archive.migration;
    for (const [key, source] of Object.entries(operation.incoming.migration.sources)) {
      const stored = own(record.data.migration.sources, key);
      for (const previous of source.previous) if (!same(previous, stored) && !stored.previous.some(item => same(item, previous))) stored.previous.push(copy(previous));
    }
    for (const sources of [archive.unattributedLegacy, operation.incoming.unattributedLegacy]) for (const [key, value] of Object.entries(sources)) put(record.data.unattributedLegacy, key, copy(value));
    record.recovery.push({ reason: 'imported-file', raw: operation.raw });
  }
  if (!validateProgressSnapshot(record.data).valid) throw new Error('Progress operation produced an invalid snapshot');
  record.revision++;
  put(record.appliedOperations, operation.id, record.revision);
  return record;
}

/** One owner-scoped store. Persistence reducers run in atomic read/write transactions. */
export function createProgressStore({ persistence = createIndexedDbPersistence(), ownerScope, deviceId, importLegacy = true, legacyStorage, eventTarget, document: page, broadcastFactory, createId = createProgressId, now = () => new Date().toISOString(), pollInterval = 2000 } = {}) {
  if ((ownerScope === undefined) !== (deviceId === undefined) || (ownerScope !== undefined && (!isOwnerScope(ownerScope) || !isSafeId(deviceId)))) throw new TypeError('Progress owner and device must be supplied together');
  let identity = ownerScope ? { ownerScope, deviceId } : null;
  let record = newRecord(identity || { ownerScope: 'guest:loading', deviceId: 'loading' });
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
  const serverSnapshot = freeze({ data: createEmptyProgress({ ownerScope: 'guest:loading', deviceId: 'loading' }), loading: true, error: null, persistenceStatus: 'loading', revision: 0, pendingLocalWrites: 0 });
  let snapshot = serverSnapshot;
  function publish({ error = null, status = pending.length ? 'pending' : 'persisted', loading = false } = {}) {
    const next = { data: record.data, loading, error, persistenceStatus: status, revision: record.revision, pendingLocalWrites: pending.length };
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
    pending.push(operation);
    record = applyOperation(copy(record), operation);
    publish();
    working = working.catch(() => {}).then(async () => {
      try { await flush(); return true; }
      catch (error) { publish({ error: error.message, status: 'session-only' }); return false; }
    });
    return working;
  }
  function makeOperation(type, extra = {}) {
    const id = createId();
    if (!isSafeId(id)) throw new TypeError('Invalid generated progress operation ID');
    return { id, type, epoch: record.epoch, chapterEpoch: extra.chapterId ? record.chapterEpochs[extra.chapterId] || 0 : null, ...extra };
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
    await working;
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
          const id = createId(); identity = { ownerScope: `guest:${id}`, deviceId: id }; identityConfirmed = false;
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
  async function mutate(type, extra) { await hydrate(); if (disposed) throw new Error('Progress store has been disposed'); return queue(makeOperation(type, extra)); }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener) {
      if (disposed) throw new Error('Progress store has been disposed');
      listeners.add(listener); startListening(); void hydrate();
      return () => { listeners.delete(listener); if (!listeners.size) stopListening(); };
    },
    hydrate, refresh, refreshLegacy,
    async completeActivity(activityId, { kind = 'study-completed', sourceKey = 'explicit-study-action' } = {}) {
      if (!Object.hasOwn(ACTIVITY_BY_ID, activityId) || !['study-completed', 'knowledge-check-completed'].includes(kind) || typeof sourceKey !== 'string') throw new TypeError('Invalid activity completion');
      if (kind === 'knowledge-check-completed' && ACTIVITY_BY_ID[activityId].completionPolicy !== 'knowledge-check-completion') throw new TypeError('Activity is not a knowledge check');
      return mutate('complete', { chapterId: chapterOf(activityId), activityId, evidence: { kind, sourceKey, completedAt: now() } });
    },
    async updateChapter(chapterId, patch) {
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
      return mutate('chapter', { chapterId: id, patch: normalized, activityIds, timestamp: now() });
    },
    async setResume(containerId, locator) {
      const quizIds = CURRICULUM.chapters.flatMap(chapter => chapter.quiz ? [chapter.quiz.id] : []);
      if ((!Object.hasOwn(ACTIVITY_BY_ID, containerId) && !quizIds.includes(containerId)) || !isRecord(locator)) throw new TypeError('Invalid resume container');
      const normalized = { containerId, activityId: locator.activityId ?? null, kind: locator.kind, ...(locator.legacyIndex === undefined ? {} : { legacyIndex: locator.legacyIndex }) };
      const candidate = createEmptyProgress(identity || { ownerScope: 'guest:loading', deviceId: 'loading' });
      candidate.resumeByDevice[candidate.deviceId] = { [containerId]: normalized };
      if (!validateProgressSnapshot(candidate).valid) throw new TypeError('Invalid resume locator');
      return mutate('resume', { chapterId: chapterOf(containerId), containerId, locator: normalized });
    },
    async resetChapter(chapterId) { const id = resolveChapterId(chapterId); if (!id) throw new TypeError('Invalid chapter reset'); await refreshLegacy(); return mutate('reset', { chapterId: id }); },
    async resetAll() { await refreshLegacy(); return mutate('reset', { chapterId: null }); },
    async exportProgress() {
      await hydrate();
      return copy({ meta: { version: '2.0.0', exportDate: now() }, snapshot: record.data, checkpoint: { epoch: record.epoch, chapterEpochs: record.chapterEpochs, legacyObserved: record.legacyObserved }, recovery: record.recovery, pendingLocalOperations: pending });
    },
    async importProgress(input, { allowGuestTransfer = false } = {}) {
      await hydrate();
      if (!isJsonValue(input)) throw new TypeError('Imported progress must contain only JSON values');
      const raw = JSON.stringify(input);
      let incoming;
      if (isRecord(input) && isRecord(input.snapshot)) {
        if (!validateProgressSnapshot(input.snapshot).valid) throw new TypeError('Invalid imported progress snapshot');
        if (input.snapshot.ownerScope !== identity.ownerScope || input.snapshot.deviceId !== identity.deviceId) {
          if (!allowGuestTransfer || !input.snapshot.ownerScope.startsWith('guest:') || !identity.ownerScope.startsWith('guest:')) throw new Error('Cannot import progress across owners or devices');
        }
        incoming = copy(input.snapshot);
        const originalDevice = incoming.deviceId;
        incoming.ownerScope = identity.ownerScope; incoming.deviceId = identity.deviceId;
        if (originalDevice !== identity.deviceId && incoming.resumeByDevice[originalDevice]) { incoming.resumeByDevice[identity.deviceId] = incoming.resumeByDevice[originalDevice]; delete incoming.resumeByDevice[originalDevice]; }
      } else if (isRecord(input) && isRecord(input.progress)) {
        if (!identity.ownerScope.startsWith('guest:')) throw new Error('Legacy files can only be imported into guest progress');
        incoming = migrateLegacyProgress({ probLabProgress: JSON.stringify(input.progress), probLabProgressMeta: JSON.stringify(input.meta || {}) }, identity);
      } else throw new TypeError('Invalid imported progress format');
      return mutate('import', { incoming, raw, chapterEpochs: { ...record.chapterEpochs } });
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
