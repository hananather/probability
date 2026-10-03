import { ACTIVITY_BY_ID, LEGACY_SOURCE_BY_KEY, LEGACY_STORAGE_KEYS, resolveActivityId, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress, isFiniteNumber, isLegacyAnswerValue, isRecord, validTimestamp, validateProgressSnapshot } from './schema';

function own(record, key) {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

function setOwn(record, key, value) {
  Object.defineProperty(record, key, { value, enumerable: true, configurable: true, writable: true });
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

// A deterministic identifier for migration, never an authentication or integrity check.
function fingerprint(value) {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
}

function issue(snapshot, key, code) {
  if (!snapshot.migration.issues.some(item => item.key === key && item.code === code)) snapshot.migration.issues.push({ key, code });
  const previous = own(snapshot.unattributedLegacy, key);
  setOwn(snapshot.unattributedLegacy, key, {
    raw: own(snapshot.migration.sources, key)?.raw,
    issues: [...new Set([...(previous?.issues || []), code])],
  });
}

function complete(snapshot, activityId, key, legacyId, kind = 'study-completed') {
  const previous = own(snapshot.activities, activityId);
  const evidence = { kind, sourceKey: key, legacyId, completedAt: null };
  const records = previous?.evidence || [];
  setOwn(snapshot.activities, activityId, {
    activityId,
    generation: previous?.generation || 0,
    evidence: records.some(record => stableStringify(record) === stableStringify(evidence)) ? records : [...records, evidence],
  });
}

function resume(snapshot, containerId, data) {
  const device = own(snapshot.resumeByDevice, snapshot.deviceId) || {};
  setOwn(device, containerId, { containerId, ...data });
  setOwn(snapshot.resumeByDevice, snapshot.deviceId, device);
}

/** Resolve only a registered historical renderer position; this creates no attainment. */
export function readLegacySectionResume(key, raw) {
  const source = own(LEGACY_SOURCE_BY_KEY, key);
  if (source?.kind !== 'section-resume' || typeof raw !== 'string') return null;
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  const savedIndex = typeof data === 'number' ? data : isRecord(data) ? data.index : null;
  const idIndex = isRecord(data) && typeof data.sectionId === 'string' ? source.positionIds.indexOf(data.sectionId) : -1;
  const index = idIndex >= 0 ? idIndex : savedIndex;
  if (!Number.isInteger(index) || index < 0 || index >= source.positionIds.length) return null;
  return { containerId: source.containerId, activityId: null, kind: 'section', positionId: source.positionIds[index], legacyIndex: index, sourceKey: key };
}

function sectionResume(snapshot, key, raw, source) {
  const locator = readLegacySectionResume(key, raw);
  if (!locator) return issue(snapshot, key, 'invalid-section-position');
  const checkpoints = snapshot.legacySectionResumeByDevice ||= {};
  const device = own(checkpoints, snapshot.deviceId) || {};
  if (!own(device, key)) {
    if (!own(snapshot.resumeByDevice, snapshot.deviceId)?.[source.containerId]) resume(snapshot, source.containerId, locator);
    setOwn(device, key, { containerId: source.containerId, status: 'adopted', fingerprint: snapshot.migration.sources[key].fingerprint });
    setOwn(checkpoints, snapshot.deviceId, device);
  }
}

function completionArray(snapshot, key, data, source) {
  if (!Array.isArray(data)) return issue(snapshot, key, 'expected-completion-array');
  for (const legacyId of data) {
    const id = source.targetIds.find(targetId => legacyId === targetId || legacyId === ACTIVITY_BY_ID[targetId].legacyId);
    if (id) complete(snapshot, id, key, legacyId);
    else issue(snapshot, key, 'unrecognized-completion');
  }
}

function journey(snapshot, key, data, source) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-journey-object');
  if (Array.isArray(data.completed)) {
    for (const index of data.completed) {
      if (Number.isInteger(index) && index >= 0 && index < source.targetIds.length) complete(snapshot, source.targetIds[index], key, index);
      else issue(snapshot, key, 'invalid-completed-stage');
    }
  } else issue(snapshot, key, 'expected-completed-stages');
  if (Number.isInteger(data.stage) && data.stage >= 0 && data.stage < source.targetIds.length) {
    resume(snapshot, source.containerId, { activityId: source.targetIds[data.stage], legacyIndex: data.stage, kind: 'stage', sourceKey: key });
  } else issue(snapshot, key, 'invalid-current-stage');
}

function progressiveContent(snapshot, key, data, source) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-progressive-object');
  if (Number.isInteger(data.currentSection) && data.currentSection >= 0 && data.currentSection < source.legacyPositions.length) {
    resume(snapshot, source.containerId, { activityId: source.legacyPositions[data.currentSection], legacyIndex: data.currentSection, kind: 'section', sourceKey: key, lastUpdated: validTimestamp(data.lastUpdated) });
  } else issue(snapshot, key, 'invalid-current-section');
  if (!isRecord(data.quizCompletions)) return issue(snapshot, key, 'expected-quiz-completions');
  for (const [legacyId, completed] of Object.entries(data.quizCompletions)) {
    const index = /^section-\d+$/.test(legacyId) ? Number(legacyId.slice(8)) : -1;
    if (source.quizPositions.includes(index) && typeof completed === 'boolean') {
      if (completed) complete(snapshot, source.legacyPositions[index], key, legacyId, 'knowledge-check-completed');
    } else issue(snapshot, key, 'unrecognized-quiz-position');
  }
}

function centralProgress(snapshot, key, data) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-chapter-object');
  for (const [legacyChapterId, chapter] of Object.entries(data)) {
    const chapterId = resolveChapterId(legacyChapterId);
    if (!chapterId || !isRecord(chapter)) {
      issue(snapshot, key, 'unrecognized-chapter');
      continue;
    }
    const record = { ...(own(snapshot.chaptersLegacy, chapterId) || {}) };
    if (['not_started', 'in_progress', 'completed'].includes(chapter.status)) {
      const order = ['not_started', 'in_progress', 'completed'];
      record.status = order[Math.max(order.indexOf(record.status), order.indexOf(chapter.status))];
    } else if (chapter.status !== undefined) issue(snapshot, key, 'invalid-chapter-status');
    for (const field of ['progress', 'score', 'timeSpent']) {
      if (chapter[field] === undefined) continue;
      if (isFiniteNumber(chapter[field], 0, field === 'timeSpent' ? Number.MAX_SAFE_INTEGER : 100)) record[field] = Math.max(record[field] || 0, chapter[field]);
      else issue(snapshot, key, `invalid-chapter-${field}`);
    }
    for (const field of ['lastVisited', 'lastUpdated', 'startedAt', 'completedAt']) {
      if (chapter[field] === undefined) continue;
      const timestamp = validTimestamp(chapter[field]);
      if (timestamp) {
        const previous = record[field];
        record[field] = previous && (field === 'startedAt' || field === 'completedAt') ? (previous < timestamp ? previous : timestamp) : previous && previous > timestamp ? previous : timestamp;
      } else if (chapter[field] !== null) issue(snapshot, key, `invalid-chapter-${field}`);
      else if (record[field] === undefined) record[field] = null;
    }
    if (chapter.completedSections !== undefined) {
      if (Array.isArray(chapter.completedSections)) {
        for (const legacyId of chapter.completedSections) {
          const id = resolveActivityId(chapterId, legacyId);
          if (id) complete(snapshot, id, key, legacyId);
          else issue(snapshot, key, 'unrecognized-chapter-section');
        }
      } else issue(snapshot, key, 'expected-chapter-sections');
    }
    setOwn(snapshot.chaptersLegacy, chapterId, record);
  }
}

function safeAnswers(snapshot, key, answers) {
  const result = {};
  if (!isRecord(answers)) {
    issue(snapshot, key, 'invalid-answers');
    return result;
  }
  for (const [index, answer] of Object.entries(answers)) {
    if (!/^\d{1,4}$/.test(index) || !isRecord(answer)) {
      issue(snapshot, key, 'invalid-answer-index');
      continue;
    }
    if (!isLegacyAnswerValue(answer.answer)) {
      issue(snapshot, key, 'invalid-answer-value');
      continue;
    }
    setOwn(result, index, {
      answer: answer.answer,
      isCorrect: typeof answer.isCorrect === 'boolean' ? answer.isCorrect : null,
      timestamp: isFiniteNumber(answer.timestamp) ? answer.timestamp : null,
    });
  }
  return result;
}

function quizAttempts(snapshot, key, data) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-attempt-object');
  for (const [chapterValue, records] of Object.entries(data)) {
    const chapterId = resolveChapterId(chapterValue);
    if (!chapterId || chapterId === 'chapter-8' || !Array.isArray(records)) {
      issue(snapshot, key, 'invalid-attempt-chapter');
      continue;
    }
    const occurrences = new Map();
    for (const record of records) {
      if (!isRecord(record) || (record.chapterId !== undefined && resolveChapterId(record.chapterId) !== chapterId)) {
        issue(snapshot, key, 'invalid-attempt-record');
        continue;
      }
      const signature = stableStringify(record);
      const occurrence = occurrences.get(signature) || 0;
      occurrences.set(signature, occurrence + 1);
      const id = `legacy:${chapterId}:${fingerprint(signature)}:${occurrence}`;
      const attempt = {
        id, chapterId, legacy: true,
        originalId: typeof record.id === 'string' ? record.id : null,
        date: validTimestamp(record.date),
        bankRevision: null,
        requestedVersion: ['engineering', 'biostats', 'social'].includes(record.version) ? record.version : null,
        effectiveVersion: null,
        answersByIndex: safeAnswers(snapshot, key, record.answers),
      };
      for (const field of ['percentage', 'score', 'timeSpent', 'totalQuestions', 'correctAnswers']) {
        const maximum = field === 'percentage' ? 100 : Number.MAX_SAFE_INTEGER;
        const count = field === 'totalQuestions' || field === 'correctAnswers';
        attempt[field] = isFiniteNumber(record[field], 0, maximum) && (!count || Number.isInteger(record[field])) ? record[field] : null;
        if (attempt[field] === null) issue(snapshot, key, `invalid-attempt-${field}`);
      }
      if (attempt.totalQuestions !== null && attempt.correctAnswers !== null && attempt.correctAnswers > attempt.totalQuestions) issue(snapshot, key, 'inconsistent-answer-count');
      setOwn(snapshot.quizAttempts, id, attempt);
    }
  }
}

function bestScores(snapshot, key, data) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-best-score-object');
  for (const [chapterValue, percentage] of Object.entries(data)) {
    const chapterId = resolveChapterId(chapterValue);
    if (!chapterId || chapterId === 'chapter-8' || !isFiniteNumber(percentage, 0, 100)) {
      issue(snapshot, key, 'invalid-best-score');
      continue;
    }
    const previous = own(snapshot.legacyBestScores, chapterId);
    setOwn(snapshot.legacyBestScores, chapterId, { percentage: Math.max(previous?.percentage || 0, percentage), sourceKey: key });
  }
}

function quizPreferences(snapshot, key, data) {
  if (!isRecord(data)) return issue(snapshot, key, 'expected-preferences-object');
  for (const field of ['showTimer', 'showQuestionNumbers', 'allowSkipping']) {
    if (typeof data[field] === 'boolean') snapshot.preferences.quiz[field] = data[field];
    else if (data[field] !== undefined) issue(snapshot, key, `invalid-preference-${field}`);
  }
  const feedback = data.immediateFeedback ?? data.immediateFeeback;
  if (typeof feedback === 'boolean') snapshot.preferences.quiz.immediateFeedback = feedback;
  else if (feedback !== undefined) issue(snapshot, key, 'invalid-preference-immediateFeedback');
  if (['engineering', 'biostats', 'social'].includes(data.version)) snapshot.preferences.quiz.version = data.version;
  else if (data.version !== undefined) issue(snapshot, key, 'invalid-preference-version');
}

function quizSession(snapshot, key, data) {
  const chapterId = isRecord(data) ? resolveChapterId(data.chapterId) : null;
  if (!chapterId || chapterId === 'chapter-8') return issue(snapshot, key, 'invalid-quiz-session');
  const legacySession = { chapterId, answersByIndex: safeAnswers(snapshot, key, data.answers) };
  for (const field of ['currentQuestion', 'timeRemaining', 'deadline', 'pausedRemaining', 'startTime']) {
    if (isFiniteNumber(data[field]) && (field !== 'currentQuestion' || Number.isInteger(data[field]))) legacySession[field] = data[field];
    else if (data[field] !== undefined) issue(snapshot, key, `invalid-session-${field}`);
  }
  if (typeof data.isPaused === 'boolean') legacySession.isPaused = data.isPaused;
  if (['engineering', 'biostats', 'social'].includes(data.version)) legacySession.requestedVersion = data.version;
  if (Array.isArray(data.flaggedQuestions)) {
    legacySession.flaggedQuestions = [...new Set(data.flaggedQuestions.filter(index => Number.isInteger(index) && index >= 0 && index < 10000))];
    if (legacySession.flaggedQuestions.length !== new Set(data.flaggedQuestions).size) issue(snapshot, key, 'invalid-flagged-question');
  }
  resume(snapshot, `${chapterId}:quiz`, { activityId: null, kind: 'quiz-session', sourceKey: key, bankRevision: null, compatibility: 'unverified', legacySession });
}

/**
 * Convert explicitly supplied browser key/value records. No storage, clock, randomness,
 * network, or source-key deletion occurs here. Callers collect only documented keys.
 */
export function migrateLegacyProgress(rawByKey, options = {}) {
  if (!isRecord(rawByKey)) throw new TypeError('Expected legacy key/value records');
  const ownerScope = options.ownerScope ?? options.existing?.ownerScope ?? 'guest:local';
  const deviceId = options.deviceId ?? options.existing?.deviceId ?? 'local';
  let snapshot = createEmptyProgress({ ownerScope, deviceId });
  if (options.existing) {
    if (!validateProgressSnapshot(options.existing).valid || options.existing.ownerScope !== ownerScope || options.existing.deviceId !== deviceId) throw new TypeError('Cannot migrate across progress owners or devices');
    snapshot = JSON.parse(JSON.stringify(options.existing));
  }
  for (const key of Object.keys(rawByKey).sort()) {
    const raw = rawByKey[key];
    if (raw === null || raw === undefined) continue;
    if (typeof raw !== 'string') throw new TypeError('Legacy browser values must be strings or null');
    const previous = own(snapshot.migration.sources, key);
    if (previous?.raw === raw) continue;
    setOwn(snapshot.migration.sources, key, { fingerprint: fingerprint(raw), raw, previous: [...(previous?.previous || []), ...(previous ? [{ fingerprint: previous.fingerprint, raw: previous.raw }] : [])] });
    const source = own(LEGACY_SOURCE_BY_KEY, key);
    if (source?.kind === 'active-tab') {
      const id = source.targetIds.find(targetId => raw === ACTIVITY_BY_ID[targetId].legacyId || raw === targetId);
      if (id) resume(snapshot, source.containerId, { activityId: id, kind: 'tab', sourceKey: key });
      else issue(snapshot, key, 'invalid-active-tab');
      continue;
    }
    if (key === 'sidebarOpen' || (key.endsWith('_devMode') && LEGACY_STORAGE_KEYS.includes(key))) {
      if (raw === 'true' || raw === 'false') setOwn(snapshot.preferences.device, key, raw === 'true');
      else issue(snapshot, key, 'invalid-device-preference');
      continue;
    }
    if (/^tutorial-.+-completed$/.test(key)) {
      if (raw === 'true' || raw === 'skipped') setOwn(snapshot.preferences.device, key, raw);
      else issue(snapshot, key, 'invalid-tutorial-preference');
      continue;
    }
    let data;
    try { data = JSON.parse(raw); } catch { issue(snapshot, key, 'malformed-json'); continue; }
    if (source?.kind === 'section-resume') sectionResume(snapshot, key, raw, source);
    else if (source?.kind === 'completion-array') completionArray(snapshot, key, data, source);
    else if (source?.kind === 'journey') journey(snapshot, key, data, source);
    else if (source?.kind === 'progressive-content') progressiveContent(snapshot, key, data, source);
    else if (key === 'probLabProgress') centralProgress(snapshot, key, data);
    else if (key === 'probLabProgressMeta') snapshot.migration.legacyMeta = data;
    else if (key === 'quiz_attempts') quizAttempts(snapshot, key, data);
    else if (key === 'quiz_best_scores') bestScores(snapshot, key, data);
    else if (key === 'quiz_preferences') quizPreferences(snapshot, key, data);
    else if (key === 'quiz_current_session') quizSession(snapshot, key, data);
    else issue(snapshot, key, 'unattributed-source');
  }
  return snapshot;
}
