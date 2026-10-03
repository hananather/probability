'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { CURRICULUM, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress } from '@/lib/progress/schema';
import progressService, { projectChapterProgress, projectOverallProgress } from '@/services/progressService';

const SERVER_SNAPSHOT = Object.freeze({ data: createEmptyProgress({ ownerScope: 'guest:loading', deviceId: 'loading' }), loading: true, error: null, persistenceStatus: 'loading', pendingLocalWrites: 0 });
const getServerSnapshot = () => SERVER_SNAPSHOT;
const subscribeOnServer = () => () => {};
const emptyChapter = () => ({ status: 'not_started', progress: 0, completedSections: [], lastVisited: null, timeSpent: 0 });

/** Every reader of a local profile subscribes to the same stable store. */
export function useProgress(userId = 'local') {
  const store = useMemo(() => typeof window === 'undefined' ? null : progressService.getStore(userId), [userId]);
  const state = useSyncExternalStore(store?.subscribe || subscribeOnServer, store?.getSnapshot || getServerSnapshot, store?.getServerSnapshot || getServerSnapshot);
  const [actionErrors, setActionErrors] = useState({});
  const [syncingProfiles, setSyncingProfiles] = useState({});
  const setActionError = useCallback(message => setActionErrors(previous => ({ ...previous, [userId]: message })), [userId]);
  const setSyncing = useCallback(active => setSyncingProfiles(previous => ({ ...previous, [userId]: active })), [userId]);
  const progress = useMemo(() => projectChapterProgress(state.data), [state.data]);
  const overallStats = useMemo(() => {
    const summary = projectOverallProgress(state.data);
    return { totalProgress: summary.overallProgress, completedChapters: summary.completedChapters, inProgressChapters: summary.inProgressChapters, notStartedChapters: summary.totalChapters - summary.completedChapters - summary.inProgressChapters, totalChapters: summary.totalChapters, totalTimeSpent: summary.totalTimeSpent, completedLessons: summary.completedLessons, totalLessons: summary.totalLessons };
  }, [state.data]);
  const execute = useCallback(async (action, failure = null) => {
    try { setActionError(null); return await action(); }
    catch (error) { setActionError(error.message); return failure; }
  }, [setActionError]);
  const updateChapterProgress = useCallback((chapterId, data) => execute(() => progressService.updateChapterProgress(userId, chapterId, data)), [execute, userId]);
  const completeSection = useCallback((chapterId, sectionId) => execute(() => progressService.completeSection(chapterId, sectionId, userId)), [execute, userId]);
  const completeChapter = useCallback(chapterId => {
    const chapter = CURRICULUM.chapters.find(item => item.id === resolveChapterId(chapterId));
    const completedSections = chapter?.lessons.filter(lesson => lesson.required && lesson.published).map(lesson => lesson.legacyId) || [];
    return updateChapterProgress(chapterId, { status: 'completed', progress: 100, completedSections, completedAt: new Date().toISOString() });
  }, [updateChapterProgress]);
  const startChapter = useCallback(chapterId => updateChapterProgress(chapterId, { status: 'in_progress', startedAt: new Date().toISOString() }), [updateChapterProgress]);
  const getChapterProgress = useCallback(chapterId => progress[resolveChapterId(chapterId)] || emptyChapter(), [progress]);
  const resetChapter = useCallback(chapterId => execute(async () => {
    await progressService.resetChapterProgress(chapterId, userId);
    return store?.getSnapshot().persistenceStatus !== 'session-only';
  }, false), [execute, store, userId]);
  const resetAll = useCallback(() => execute(async () => {
    await progressService.resetAllProgress(userId);
    return store?.getSnapshot().persistenceStatus !== 'session-only';
  }, false), [execute, store, userId]);
  const exportProgress = useCallback(() => execute(async () => {
    const data = await progressService.exportProgress(userId);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `problab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  }, false), [execute, userId]);
  const importProgress = useCallback(file => execute(async () => {
    const data = JSON.parse(await file.text());
    const success = await progressService.importProgress(data, userId, { allowGuestTransfer: true });
    if (!success && !store?.getSnapshot().error) setActionError('Progress file could not be imported into this local profile');
    return success;
  }, false), [execute, setActionError, store, userId]);
  const syncProgress = useCallback(() => execute(async () => {
    setSyncing(true);
    try { return await progressService.syncWithDatabase(userId); }
    finally { setSyncing(false); }
  }, false), [execute, setSyncing, userId]);
  const retryLocalPersistence = useCallback(() => execute(() => progressService.retryLocalPersistence(userId), false), [execute, userId]);
  return {
    progress, loading: state.loading, error: state.error || (Object.hasOwn(actionErrors, userId) ? actionErrors[userId] : null), syncing: Object.hasOwn(syncingProfiles, userId) && syncingProfiles[userId], hasPendingSync: false,
    persistenceStatus: state.persistenceStatus, pendingLocalWrites: state.pendingLocalWrites,
    updateChapterProgress, completeSection, completeChapter, startChapter, getChapterProgress,
    resetChapter, resetAll, exportProgress, importProgress, syncProgress, retryLocalPersistence, overallStats,
  };
}

export function useChapterProgress(chapterId, userId = 'local') {
  const value = useProgress(userId);
  const { updateChapterProgress, completeChapter, startChapter, resetChapter, completeSection } = value;
  const chapterProgress = value.getChapterProgress(chapterId);
  const updateProgress = useCallback(data => updateChapterProgress(chapterId, data), [updateChapterProgress, chapterId]);
  const complete = useCallback(() => completeChapter(chapterId), [completeChapter, chapterId]);
  const start = useCallback(() => startChapter(chapterId), [startChapter, chapterId]);
  const reset = useCallback(() => resetChapter(chapterId), [resetChapter, chapterId]);
  const markSectionComplete = useCallback(sectionId => completeSection(chapterId, sectionId), [completeSection, chapterId]);
  return {
    chapterProgress, loading: value.loading, error: value.error, persistenceStatus: value.persistenceStatus, pendingLocalWrites: value.pendingLocalWrites,
    updateProgress, complete, start, reset, markSectionComplete,
    isCompleted: chapterProgress.status === 'completed', isInProgress: chapterProgress.status === 'in_progress', isNotStarted: chapterProgress.status === 'not_started', progressPercentage: chapterProgress.progress || 0,
  };
}
