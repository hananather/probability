'use client';

import { createContext, useCallback, useMemo, useState } from 'react';
import { ACTIVITY_BY_ID, CURRICULUM, QUIZ_BY_ID } from '@/lib/curriculum/manifest';
import { isActivityCompleted } from '@/lib/progress/selectors';
import progressService from '@/services/progressService';
import { useProgress } from './useProgress';

// Nested lesson renderers reuse their parent's subscription and captured work context.
export const LearningActivityContext = createContext(null);

function isContainer(id) {
  return typeof id === 'string' && (Object.hasOwn(ACTIVITY_BY_ID, id) ||
    Object.hasOwn(QUIZ_BY_ID, id) || CURRICULUM.chapters.some(chapter => chapter.id === id));
}

function generationFor(containerId, context) {
  if (!context) return 'loading';
  const chapterId = ACTIVITY_BY_ID[containerId]?.chapterId ||
    CURRICULUM.chapters.find(chapter => chapter.id === containerId || chapter.quiz?.id === containerId)?.id;
  const containers = [];
  let id = containerId;
  while (id) {
    containers.push([id, context.containerEpochs?.[id] || 0]);
    id = ACTIVITY_BY_ID[id]?.parentId;
  }
  return JSON.stringify([context.ownerScope, context.deviceId, context.epoch,
    chapterId ? context.chapterEpochs?.[chapterId] || 0 : null, containers]);
}

/** Canonical learning facts and typed actions through the existing progress subscription. */
export function useLearningActivity(containerId, { userId = 'local' } = {}) {
  const progress = useProgress(userId);
  const store = useMemo(() => typeof window === 'undefined' ? null : progressService.getStore(userId), [userId]);
  const supported = isContainer(containerId);
  const [actionErrors, setActionErrors] = useState({});
  const errorScope = `${progress.learningData.ownerScope}:${containerId || 'unregistered'}`;
  const writeCheckpoint = store?.getSnapshot().writeContext || null;
  const rawContext = supported && !progress.loading ? store?.captureWriteContext(containerId) || null : null;
  const contextSignature = JSON.stringify(rawContext);
  const writeContext = useMemo(() => JSON.parse(contextSignature), [contextSignature]);

  const execute = useCallback(async action => {
    if (!store || progress.loading || !supported) return false;
    setActionErrors(previous => ({ ...previous, [errorScope]: null }));
    try { return await action(); }
    catch (error) {
      setActionErrors(previous => ({ ...previous, [errorScope]: error.message }));
      return false;
    }
  }, [store, progress.loading, supported, errorScope]);
  const captureWriteContext = useCallback(id => !progress.loading && isContainer(id) ? store?.captureWriteContext(id) : null, [store, progress.loading]);
  const completeActivity = useCallback((id, options = {}) => execute(() => store.completeActivity(id, {
    sourceKey: 'shared-lesson-study', ...options, context: options.context || writeContext,
  })), [execute, store, writeContext]);
  const setResume = useCallback((id, locator, options = {}) => execute(() => store.setResume(id, locator, {
    ...options, context: options.context || writeContext,
  })), [execute, store, writeContext]);
  const resetActivity = useCallback((id = containerId, options = {}) => execute(() => store.resetActivity(id, {
    ...options, context: options.context || writeContext,
  })), [execute, store, containerId, writeContext]);
  const clearResume = useCallback((id = containerId, options = {}) => execute(() => store.clearResume(id, {
    ...options, context: options.context || writeContext,
  })), [execute, store, containerId, writeContext]);
  const setDevicePreference = useCallback((key, value, options = {}) => execute(() => store.setDevicePreference(key, value, {
    ...options, context: options.context || writeContext,
  })), [execute, store, writeContext]);
  const isCompleted = useCallback(id => !progress.loading && isActivityCompleted(progress.learningData, id), [progress.loading, progress.learningData]);
  const getResume = useCallback(id => progress.loading ? null : progress.learningData.resumeByDevice[progress.learningData.deviceId]?.[id] || null, [progress.loading, progress.learningData]);

  return {
    containerId, supported, loading: progress.loading, learningData: progress.learningData,
    writeCheckpoint, writeContext, resetGeneration: generationFor(containerId, writeContext),
    getResetGeneration: generationFor, captureWriteContext,
    isCompleted, getResume, resume: getResume(containerId),
    completeActivity, setResume, clearResume, resetActivity, setDevicePreference,
    persistenceStatus: supported ? progress.persistenceStatus : 'session-only',
    pendingLocalWrites: progress.pendingLocalWrites,
    error: progress.error || (Object.hasOwn(actionErrors, errorScope) ? actionErrors[errorScope] : null),
    retryLocalPersistence: progress.retryLocalPersistence,
  };
}
