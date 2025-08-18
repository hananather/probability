/**
 * useProgress Hook
 * 
 * React hook for accessing and updating user progress.
 * Provides a clean interface to the progressService for React components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import progressService from '../services/progressService';

/**
 * Hook for managing user progress
 * @param {string} userId - Optional user identifier (defaults to 'local')
 * @returns {Object} Progress data and methods
 */
export function useProgress(userId = 'local') {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await progressService.getProgress(userId);
        setProgress(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  // Update chapter progress
  const updateChapterProgress = useCallback(async (chapterId, data) => {
    try {
      const updated = await progressService.updateChapterProgress(userId, chapterId, data);
      setProgress(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  // Mark a section as completed
  const completeSection = useCallback(async (chapterId, sectionId) => {
    try {
      const updated = await progressService.completeSection(chapterId, sectionId, userId);
      setProgress(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  // Mark entire chapter as completed
  const completeChapter = useCallback(async (chapterId) => {
    return updateChapterProgress(chapterId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });
  }, [updateChapterProgress]);

  // Start a chapter (mark as in progress)
  const startChapter = useCallback(async (chapterId) => {
    return updateChapterProgress(chapterId, {
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
  }, [updateChapterProgress]);

  // Get specific chapter progress
  const getChapterProgress = useCallback((chapterId) => {
    return progress[chapterId] || {
      status: 'not_started',
      progress: 0,
      completedSections: [],
      lastVisited: null,
      timeSpent: 0
    };
  }, [progress]);

  // Reset chapter progress
  const resetChapter = useCallback(async (chapterId) => {
    try {
      const updated = await progressService.resetChapterProgress(chapterId, userId);
      setProgress(updated);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [userId]);

  // Reset all progress
  const resetAll = useCallback(async () => {
    try {
      await progressService.resetAllProgress(userId);
      setProgress({});
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [userId]);

  // Export progress data
  const exportProgress = useCallback(async () => {
    try {
      const data = await progressService.exportProgress(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `problab-progress-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [userId]);

  // Import progress data
  const importProgress = useCallback(async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const success = await progressService.importProgress(data, userId);
      if (success) {
        const updated = await progressService.getProgress(userId);
        setProgress(updated);
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [userId]);

  // Sync with database (future feature)
  const syncProgress = useCallback(async () => {
    try {
      setSyncing(true);
      const success = await progressService.syncWithDatabase(userId);
      if (success) {
        const updated = await progressService.getProgress(userId);
        setProgress(updated);
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const chapters = Object.keys(progress);
    
    if (chapters.length === 0) {
      return {
        totalProgress: 0,
        completedChapters: 0,
        inProgressChapters: 0,
        notStartedChapters: 8,
        totalTimeSpent: 0
      };
    }

    let totalProgress = 0;
    let completedChapters = 0;
    let inProgressChapters = 0;
    let totalTimeSpent = 0;

    chapters.forEach(chapterId => {
      const chapter = progress[chapterId];
      totalProgress += chapter.progress || 0;
      totalTimeSpent += chapter.timeSpent || 0;

      if (chapter.status === 'completed') {
        completedChapters++;
      } else if (chapter.status === 'in_progress') {
        inProgressChapters++;
      }
    });

    return {
      totalProgress: chapters.length > 0 ? Math.round(totalProgress / 8) : 0, // Average across all 8 chapters
      completedChapters,
      inProgressChapters,
      notStartedChapters: 8 - completedChapters - inProgressChapters,
      totalTimeSpent
    };
  }, [progress]);

  // Check if sync is needed
  const hasPendingSync = useMemo(() => {
    return progressService.hasPendingSync();
  }, []);

  return {
    // State
    progress,
    loading,
    error,
    syncing,
    hasPendingSync,
    
    // Chapter operations
    updateChapterProgress,
    completeSection,
    completeChapter,
    startChapter,
    getChapterProgress,
    
    // Reset operations
    resetChapter,
    resetAll,
    
    // Import/Export
    exportProgress,
    importProgress,
    
    // Sync
    syncProgress,
    
    // Statistics
    overallStats
  };
}

/**
 * Hook for managing progress of a specific chapter
 * @param {string} chapterId - Chapter identifier
 * @param {string} userId - Optional user identifier
 * @returns {Object} Chapter-specific progress data and methods
 */
export function useChapterProgress(chapterId, userId = 'local') {
  const {
    progress,
    loading,
    error,
    updateChapterProgress,
    completeSection,
    completeChapter,
    startChapter,
    resetChapter,
    getChapterProgress
  } = useProgress(userId);

  const chapterData = useMemo(() => {
    return getChapterProgress(chapterId);
  }, [getChapterProgress, chapterId]);

  const updateProgress = useCallback((data) => {
    return updateChapterProgress(chapterId, data);
  }, [updateChapterProgress, chapterId]);

  const complete = useCallback(() => {
    return completeChapter(chapterId);
  }, [completeChapter, chapterId]);

  const start = useCallback(() => {
    return startChapter(chapterId);
  }, [startChapter, chapterId]);

  const reset = useCallback(() => {
    return resetChapter(chapterId);
  }, [resetChapter, chapterId]);

  const markSectionComplete = useCallback((sectionId) => {
    return completeSection(chapterId, sectionId);
  }, [completeSection, chapterId]);

  return {
    // State
    chapterProgress: chapterData,
    loading,
    error,
    
    // Actions
    updateProgress,
    complete,
    start,
    reset,
    markSectionComplete,
    
    // Computed values
    isCompleted: chapterData.status === 'completed',
    isInProgress: chapterData.status === 'in_progress',
    isNotStarted: chapterData.status === 'not_started',
    progressPercentage: chapterData.progress || 0
  };
}