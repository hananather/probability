'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { CURRICULUM, resolveChapterId } from '@/lib/curriculum/manifest';
import { createEmptyProgress } from '@/lib/progress/schema';
import { useActiveProgress } from '@/contexts/ActiveProgressContext';
import { readProgressBackupFile } from '@/lib/progress/backups';
import progressService, { ProgressService, projectChapterProgress, projectOverallProgress } from '@/services/progressService';

const SERVER_SNAPSHOT = Object.freeze({ data: createEmptyProgress({ ownerScope: 'guest:loading', deviceId: 'loading' }), loading: true, error: null, persistenceStatus: 'loading', pendingLocalWrites: 0 });
const getServerSnapshot = () => SERVER_SNAPSHOT;
const subscribeOnServer = () => () => {};
const emptyChapter = () => ({ status: 'not_started', progress: 0, completedSections: [], lastVisited: null, timeSpent: 0 });

/** Every reader of a local profile subscribes to the same stable store. */
export function useProgress(userId) {
  const active = useActiveProgress();
  const usesActive = userId === undefined && Boolean(active);
  const store = useMemo(() => usesActive ? active.store : typeof window === 'undefined' ? null : progressService.getStore(userId), [usesActive, active?.store, userId]);
  const localState = useSyncExternalStore(!usesActive && store ? store.subscribe : subscribeOnServer, !usesActive && store ? store.getSnapshot : getServerSnapshot, !usesActive && store ? store.getServerSnapshot : getServerSnapshot);
  const state = usesActive ? active.state : localState;
  const generation = usesActive ? active.generation : 0;
  const errorScope = usesActive ? `${state.data.ownerScope}:${generation}` : userId || 'local';
  const checkActiveBinding = active?.isCurrentBinding;
  const retryActiveSync = active?.sync;
  const isCurrentBinding = useCallback(() => !usesActive || checkActiveBinding(store, generation), [usesActive, checkActiveBinding, store, generation]);
  const boundService = useMemo(() => new ProgressService({ storeProvider: () => store }), [store]);
  const [actionErrors, setActionErrors] = useState({});
  const [syncingProfiles, setSyncingProfiles] = useState({});
  const setActionError = useCallback(message => setActionErrors(previous => ({ ...previous, [errorScope]: message })), [errorScope]);
  const setSyncing = useCallback(active => setSyncingProfiles(previous => ({ ...previous, [errorScope]: active })), [errorScope]);
  const progress = useMemo(() => projectChapterProgress(state.data), [state.data]);
  const overallStats = useMemo(() => {
    const summary = projectOverallProgress(state.data);
    return { totalProgress: summary.overallProgress, completedChapters: summary.completedChapters, inProgressChapters: summary.inProgressChapters, notStartedChapters: summary.totalChapters - summary.completedChapters - summary.inProgressChapters, totalChapters: summary.totalChapters, totalTimeSpent: summary.totalTimeSpent, completedLessons: summary.completedLessons, totalLessons: summary.totalLessons };
  }, [state.data]);
  const execute = useCallback(async (action, failure = null) => {
    if (!store || !isCurrentBinding()) return failure;
    try { setActionError(null); const result = await action(); return isCurrentBinding() ? result : failure; }
    catch (error) { setActionError(error.message); return failure; }
  }, [setActionError, store, isCurrentBinding]);
  const updateChapterProgress = useCallback((chapterId, data) => execute(() => boundService.updateChapterProgress(userId, chapterId, data)), [execute, boundService, userId]);
  const completeSection = useCallback((chapterId, sectionId) => execute(() => boundService.completeSection(chapterId, sectionId, userId)), [execute, boundService, userId]);
  const completeChapter = useCallback(chapterId => {
    const chapter = CURRICULUM.chapters.find(item => item.id === resolveChapterId(chapterId));
    const completedSections = chapter?.lessons.filter(lesson => lesson.required && lesson.published).map(lesson => lesson.legacyId) || [];
    return updateChapterProgress(chapterId, { status: 'completed', progress: 100, completedSections, completedAt: new Date().toISOString() });
  }, [updateChapterProgress]);
  const startChapter = useCallback(chapterId => updateChapterProgress(chapterId, { status: 'in_progress', startedAt: new Date().toISOString() }), [updateChapterProgress]);
  const getChapterProgress = useCallback(chapterId => progress[resolveChapterId(chapterId)] || emptyChapter(), [progress]);
  const resetChapter = useCallback(chapterId => execute(async () => {
    await boundService.resetChapterProgress(chapterId, userId);
    return store?.getSnapshot().persistenceStatus !== 'session-only';
  }, false), [execute, boundService, store, userId]);
  const resetAll = useCallback(() => execute(async () => {
    await boundService.resetAllProgress(userId);
    return store?.getSnapshot().persistenceStatus !== 'session-only';
  }, false), [execute, boundService, store, userId]);
  const exportProgress = useCallback(() => execute(async () => {
    const data = await boundService.exportProgress(userId);
    if (!isCurrentBinding()) return false;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `problab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  }, false), [execute, boundService, userId, isCurrentBinding]);
  const importProgress = useCallback(file => execute(async () => {
    const context = store.captureWriteContext();
    const data = await readProgressBackupFile(file, { ownerScope: state.data.ownerScope, isCurrent: isCurrentBinding });
    if (!isCurrentBinding() || data === null) return false;
    const success = await boundService.importProgress(data, userId, { allowGuestTransfer: true, context });
    if (!success && !store?.getSnapshot().error) setActionError('Progress file could not be imported into this local profile');
    return success;
  }, false), [execute, boundService, setActionError, store, userId, isCurrentBinding, state.data.ownerScope]);
  const syncProgress = useCallback(() => execute(async () => {
    setSyncing(true);
    try { return usesActive ? await retryActiveSync() : false; }
    finally { setSyncing(false); }
  }, false), [execute, setSyncing, usesActive, retryActiveSync]);
  const retryLocalPersistence = useCallback(() => execute(() => boundService.retryLocalPersistence(userId), false), [execute, boundService, userId]);
  return {
    learningData: state.data, store, generation, isCurrentBinding,
    account: usesActive ? active.account : null, sessionStatus: usesActive ? active.sessionStatus : 'guest',
    signingOut: usesActive && active.signingOut,
    cloud: state.cloud || null,
    progress, loading: state.loading, error: state.error || (Object.hasOwn(actionErrors, errorScope) ? actionErrors[errorScope] : null), syncing: Object.hasOwn(syncingProfiles, errorScope) && syncingProfiles[errorScope], hasPendingSync: Boolean(state.cloud?.pendingMutations),
    persistenceStatus: state.persistenceStatus, pendingLocalWrites: state.pendingLocalWrites,
    updateChapterProgress, completeSection, completeChapter, startChapter, getChapterProgress,
    resetChapter, resetAll, exportProgress, importProgress, syncProgress, retryLocalPersistence, overallStats,
  };
}

export function useChapterProgress(chapterId, userId) {
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
