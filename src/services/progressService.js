import { CURRICULUM, resolveActivityId, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress } from '@/lib/progress/schema';
import { isActivityCompleted, selectChapterProgress, selectCourseProgress } from '@/lib/progress/selectors';
import { getLocalProgressStore } from '@/lib/progress/store';
import { getActiveProgressBinding } from '@/lib/progress/activeBinding';

const EMPTY_CHAPTER = Object.freeze({ status: 'not_started', progress: 0, completedSections: [], lastVisited: null, timeSpent: 0 });
const defaultStore = userId => {
  if (userId !== undefined) return getLocalProgressStore(userId);
  const binding = getActiveProgressBinding();
  if (binding?.isCurrent()) return binding.store;
  return getActiveProgressBinding()?.store || getLocalProgressStore();
};

/** Existing chapter-shaped consumers read the canonical facts through this projection. */
export function projectChapterProgress(data) {
  return Object.fromEntries(CURRICULUM.chapters.filter(chapter => chapter.published || data?.chaptersLegacy?.[chapter.id]).map(chapter => {
    const historical = data?.chaptersLegacy?.[chapter.id] || {};
    const summary = selectChapterProgress(data, chapter.id);
    const timestamps = [historical.lastUpdated, ...Object.values(data?.activities || {}).filter(activity => activity.activityId.startsWith(`${chapter.id}:`)).flatMap(activity => activity.evidence.map(item => item.completedAt))].filter(Boolean).sort();
    return [chapter.id, {
      ...EMPTY_CHAPTER,
      ...historical,
      status: summary.status,
      progress: summary.primary.percentage,
      completedSections: chapter.lessons.filter(lesson => isActivityCompleted(data, lesson.id)).map(lesson => lesson.legacyId),
      legacyStatus: summary.legacyStatus,
      ...(timestamps.length ? { lastUpdated: timestamps.at(-1) } : {}),
    }];
  }));
}

export function projectOverallProgress(data) {
  const summary = selectCourseProgress(data);
  const chapters = projectChapterProgress(data);
  const published = CURRICULUM.chapters.filter(chapter => chapter.published);
  const timestamps = published.map(chapter => chapters[chapter.id].lastUpdated).filter(Boolean).sort();
  return {
    overallProgress: summary.percentage,
    completedChapters: summary.completedChapters,
    inProgressChapters: summary.inProgressChapters,
    totalChapters: summary.totalChapters,
    totalTimeSpent: published.reduce((total, chapter) => total + chapters[chapter.id].timeSpent, 0),
    lastActivity: timestamps.at(-1) || null,
    completedLessons: summary.completedLessons,
    totalLessons: summary.totalLessons,
  };
}

/** Compatibility facade. userId selects a local profile and carries no authentication authority. */
export class ProgressService {
  constructor({ storeProvider = defaultStore } = {}) {
    this.storeProvider = storeProvider;
    this.storageKey = 'probLabProgress';
    this.metaKey = 'probLabProgressMeta';
  }

  getStore(userId) { return this.storeProvider(userId); }

  async getProgress(userId) {
    if (typeof window === 'undefined') return {};
    const store = this.getStore(userId);
    await store.refresh();
    return projectChapterProgress(store.getSnapshot().data);
  }

  async updateChapterProgress(userId, chapterId, data) {
    if (typeof window === 'undefined') return {};
    const store = this.getStore(userId);
    await store.updateChapter(chapterId, { ...data, lastUpdated: new Date().toISOString() });
    return projectChapterProgress(store.getSnapshot().data);
  }

  async getChapterProgress(chapterId, userId) {
    const progress = await this.getProgress(userId);
    return progress[resolveChapterId(chapterId)] || { ...EMPTY_CHAPTER, completedSections: [] };
  }

  async completeSection(chapterId, sectionId, userId) {
    if (typeof window === 'undefined') return {};
    const activityId = resolveActivityId(resolveChapterId(chapterId), sectionId);
    if (!activityId) throw new TypeError('Unrecognized completed section');
    const store = this.getStore(userId);
    await store.completeActivity(activityId, { sourceKey: 'progress-service' });
    return projectChapterProgress(store.getSnapshot().data);
  }

  calculateProgress(chapterId, completedSections) {
    const id = resolveChapterId(chapterId);
    const chapter = CURRICULUM.chapters.find(value => value.id === id);
    const required = chapter?.lessons.filter(lesson => lesson.published && lesson.required) || [];
    if (!required.length || !Array.isArray(completedSections)) return 0;
    const completed = new Set(completedSections.map(section => resolveActivityId(id, section)).filter(Boolean));
    return Math.round(required.filter(lesson => completed.has(lesson.id)).length / required.length * 100);
  }

  async getOverallProgress(userId) {
    if (typeof window === 'undefined') return projectOverallProgress(createEmptyProgress());
    const store = this.getStore(userId); await store.refresh();
    return projectOverallProgress(store.getSnapshot().data);
  }

  getLastActivity(progress) { return Object.values(progress || {}).map(chapter => chapter.lastUpdated).filter(Boolean).sort().at(-1) || null; }

  async resetChapterProgress(chapterId, userId) {
    if (typeof window === 'undefined') return {};
    const store = this.getStore(userId); await store.resetChapter(chapterId);
    return projectChapterProgress(store.getSnapshot().data);
  }

  async resetAllProgress(userId) {
    if (typeof window !== 'undefined') await this.getStore(userId).resetAll();
  }

  async exportProgress(userId) {
    if (typeof window === 'undefined') return { meta: { version: '2.0.0' }, progress: {} };
    const exported = await this.getStore(userId).exportProgress();
    return { ...exported, progress: projectChapterProgress(exported.snapshot) };
  }

  async importProgress(data, userId, options = {}) {
    if (typeof window === 'undefined') return false;
    try { return await this.getStore(userId).importProgress(data, options); }
    catch { return false; }
  }

  queueSync(userId) { return userId === undefined ? getActiveProgressBinding()?.retrySync?.() || false : false; }
  async syncWithDatabase(userId) { return this.queueSync(userId); }
  hasPendingSync(userId) { return typeof window !== 'undefined' && Boolean(this.getStore(userId).getSnapshot().cloud?.pendingMutations); }
  async retryLocalPersistence(userId) { return this.getStore(userId).retryPersistence(); }
}

const progressService = new ProgressService();
export default progressService;
