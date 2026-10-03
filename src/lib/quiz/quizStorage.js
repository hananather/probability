import { CURRICULUM, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress } from '@/lib/progress/schema';
import { migrateLegacyProgress } from '@/lib/progress/legacyMigration';
import { selectQuizProgress } from '@/lib/progress/selectors';
import progressService from '@/services/progressService';

const chapters = CURRICULUM.chapters.filter(chapter => chapter.published && chapter.quiz);
const validScore = value => Number.isFinite(value) && value >= 0 && value <= 100;
const copy = value => JSON.parse(JSON.stringify(value));
export const DEFAULT_QUIZ_PREFERENCES = Object.freeze({ showTimer: true, immediateFeedback: false, showQuestionNumbers: true, allowSkipping: true, version: 'engineering' });

export function createQuizId() {
  return globalThis.crypto?.randomUUID?.() || `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function dataOrCurrent(data) {
  return data || (typeof window === 'undefined' ? createEmptyProgress() : quizStorage.getStore().getSnapshot().data);
}
function chapterNumber(value) { return Number(resolveChapterId(value)?.split('-')[1]); }
function projectAnswers(record) {
  if (record.legacy) return copy(record.answersByIndex || {});
  return Object.fromEntries(record.bank.questions.flatMap((question, index) => record.answersByQuestionId[question.id] ? [[index, copy(record.answersByQuestionId[question.id])]] : []));
}

/** Compatibility readers project canonical facts; old browser keys are migration input only. */
export const quizStorage = {
  getStore() { return progressService.getStore('local'); },
  async hydrate() { return this.getStore().hydrate(); },
  captureWriteContext(chapterId) { return this.getStore().captureWriteContext(`${resolveChapterId(chapterId)}:quiz`); },
  getAttempts(chapterId, data) {
    const chapter = resolveChapterId(chapterId);
    return Object.values(dataOrCurrent(data).quizAttempts).filter(attempt => attempt.chapterId === chapter)
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || a.id.localeCompare(b.id))
      .map(attempt => ({ ...attempt, chapterId: chapterNumber(chapter), answers: projectAnswers(attempt), version: attempt.requestedVersion ?? null }));
  },
  getAllAttempts(data) {
    return Object.fromEntries(chapters.map(chapter => [chapter.number, this.getAttempts(chapter.number, data)]).filter(([, attempts]) => attempts.length));
  },
  getLastAttempt(chapterId, data) { return this.getAttempts(chapterId, data).at(-1) || null; },
  getBestScores(data) {
    const current = dataOrCurrent(data);
    return Object.fromEntries(chapters.map(chapter => [chapter.number, selectQuizProgress(current, chapter.id)]).filter(([, summary]) => summary.attempted).map(([chapter, summary]) => [chapter, summary.bestScore]));
  },
  getBestScore(chapterId, data) { return selectQuizProgress(dataOrCurrent(data), chapterId)?.bestScore || 0; },
  isChapterPassed(chapterId, passingScore, data) {
    const summary = selectQuizProgress(dataOrCurrent(data), chapterId);
    return Boolean(summary?.attempted && summary.bestScore >= (passingScore ?? summary.passingScore));
  },
  getChapterStats(chapterId, data) {
    const current = dataOrCurrent(data);
    const attempts = this.getAttempts(chapterId, current);
    const scores = attempts.map(attempt => attempt.percentage).filter(validScore);
    const times = attempts.map(attempt => attempt.timeSpent).filter(time => Number.isFinite(time) && time >= 0);
    return { totalAttempts: attempts.length, attempted: Boolean(selectQuizProgress(current, chapterId)?.attempted), bestScore: this.getBestScore(chapterId, current), averageScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0, averageTime: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0, lastAttemptDate: attempts.at(-1)?.date || null, passed: this.isChapterPassed(chapterId, undefined, current) };
  },
  getCurrentSession(chapterId, data) {
    const current = dataOrCurrent(data);
    const locator = current.resumeByDevice[current.deviceId]?.[`${resolveChapterId(chapterId)}:quiz`];
    if (locator?.session) {
      const session = locator.session;
      return { ...session, chapterId: chapterNumber(chapterId), currentQuestion: session.bank.questions.findIndex(question => question.id === session.currentQuestionId), answers: projectAnswers({ ...session, legacy: false }), flaggedQuestions: session.flaggedQuestionIds.map(id => session.bank.questions.findIndex(question => question.id === id)), version: session.bank.requestedVersion };
    }
    if (locator?.legacySession) return { ...locator.legacySession, chapterId: chapterNumber(chapterId), version: locator.legacySession.requestedVersion ?? null, legacy: true, compatibility: 'unverified', answers: copy(locator.legacySession.answersByIndex || {}) };
    return null;
  },
  getPreferences(data) {
    const preferences = { ...DEFAULT_QUIZ_PREFERENCES, ...dataOrCurrent(data).preferences.quiz };
    return { ...preferences, immediateFeeback: preferences.immediateFeedback };
  },
  async savePreferences(preferences, { context } = {}) {
    const store = this.getStore();
    if (!store.isHydrated()) await store.hydrate();
    return store.setQuizPreferences(preferences, { context: context || store.captureWriteContext() });
  },
  async updatePreference(key, value, options) { return this.savePreferences({ [key]: value }, options); },
  async saveAttempt(chapterId, attemptData, { context } = {}) {
    const store = this.getStore();
    if (!store.isHydrated()) await store.hydrate();
    const captured = context || this.captureWriteContext(chapterId);
    if (attemptData.sessionId) return store.finishQuizAttempt(chapterId, { sessionId: attemptData.sessionId, attemptId: attemptData.id || createQuizId(), answersByQuestionId: attemptData.answersByQuestionId }, { context: captured });
    // Historical callers lack a pinned bank. Retain their score/raw answers as unverified.
    const attempt = { ...copy(attemptData), id: attemptData.id || createQuizId(), date: attemptData.date || new Date().toISOString(), chapterId: chapterNumber(chapterId) };
    const snapshot = store.getSnapshot().data;
    const incoming = migrateLegacyProgress({ quiz_attempts: JSON.stringify({ [chapterNumber(chapterId)]: [attempt] }) }, { ownerScope: snapshot.ownerScope, deviceId: snapshot.deviceId });
    const applied = await store.importProgress({ snapshot: incoming }, { context: captured });
    if (!applied) return null;
    return this.getAttempts(chapterId).find(saved => saved.legacy && saved.originalId === attempt.id) || this.getLastAttempt(chapterId);
  },
  async updateBestScore(chapterId, percentage, { context } = {}) {
    if (!validScore(percentage)) throw new TypeError('Invalid historical quiz score');
    await this.hydrate();
    return this.importData({ bestScores: { [chapterNumber(chapterId)]: Math.max(this.getBestScore(chapterId), percentage) } }, { context });
  },
  async saveCurrentSession(chapterId, sessionData, { context } = {}) {
    const store = this.getStore();
    if (!store.isHydrated()) await store.hydrate();
    const captured = context || this.captureWriteContext(chapterId);
    if (sessionData.bank) {
      const existing = store.getSnapshot().data.resumeByDevice[store.getSnapshot().data.deviceId]?.[`${resolveChapterId(chapterId)}:quiz`]?.session;
      if (existing?.sessionId === sessionData.sessionId) {
        const { currentQuestionId, answersByQuestionId, flaggedQuestionIds, deadline, isPaused, pausedRemaining } = sessionData;
        return store.updateQuizSession(chapterId, sessionData.sessionId, { currentQuestionId, answersByQuestionId, flaggedQuestionIds, deadline, isPaused, pausedRemaining }, { context: captured });
      }
      return store.beginQuizSession(chapterId, { ...sessionData, chapterId: resolveChapterId(chapterId) }, { context: captured });
    }
    const snapshot = store.getSnapshot().data;
    const incoming = migrateLegacyProgress({ quiz_current_session: JSON.stringify({ ...sessionData, chapterId: chapterNumber(chapterId) }) }, { ownerScope: snapshot.ownerScope, deviceId: snapshot.deviceId });
    return store.importProgress({ snapshot: incoming }, { context: captured });
  },
  async clearCurrentSession(chapterId, sessionId, { context } = {}) {
    const store = this.getStore();
    if (!store.isHydrated()) await store.hydrate();
    const current = store.getSnapshot().data;
    const selected = chapters.filter(chapter => chapterId === undefined || chapter.id === resolveChapterId(chapterId)).map(chapter => ({ chapter, locator: current.resumeByDevice[current.deviceId]?.[chapter.quiz.id], context: context || store.captureWriteContext(chapter.quiz.id) }));
    return Promise.all(selected.filter(item => item.locator).map(item => item.locator.session
      ? store.clearQuizSession(item.chapter.number, sessionId || item.locator.session.sessionId, { context: item.context })
      : store.clearLegacyQuizSession(item.chapter.number, copy(item.locator), { context: item.context })));
  },
  async clearAllData() { await this.hydrate(); return this.getStore().resetAllQuizzes(); },
  async exportData() { await this.hydrate(); return { attempts: this.getAllAttempts(), bestScores: this.getBestScores(), preferences: this.getPreferences(), ...await this.getStore().exportProgress() }; },
  async importData(data, { context } = {}) {
    const store = this.getStore();
    if (!store.isHydrated()) await store.hydrate();
    if (data.snapshot) return store.importProgress(data, { context });
    const current = store.getSnapshot().data;
    const raw = {};
    if (data.attempts !== undefined) raw.quiz_attempts = JSON.stringify(data.attempts);
    if (data.bestScores !== undefined) raw.quiz_best_scores = JSON.stringify(data.bestScores);
    if (data.preferences !== undefined) raw.quiz_preferences = JSON.stringify(data.preferences);
    const incoming = migrateLegacyProgress(raw, { ownerScope: current.ownerScope, deviceId: current.deviceId });
    return store.importProgress({ snapshot: incoming }, { context: context || store.captureWriteContext() });
  },
};

export function getOverallProgress(data) {
  const current = dataOrCurrent(data);
  const summaries = chapters.map(chapter => selectQuizProgress(current, chapter.id));
  const attemptedChapters = summaries.filter(summary => summary.attempted).length;
  const passedChapters = summaries.filter(summary => summary.passed).length;
  return { completedChapters: attemptedChapters, attemptedChapters, passedChapters, totalChapters: chapters.length, percentageComplete: 100 * passedChapters / chapters.length, chapterScores: quizStorage.getBestScores(current) };
}
