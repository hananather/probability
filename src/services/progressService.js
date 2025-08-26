/**
 * Progress Tracking Service
 * 
 * This service provides an abstraction layer for progress tracking.
 * Currently uses localStorage but designed to easily migrate to a database.
 * 
 * Data Structure:
 * {
 *   "chapter-1": {
 *     status: "completed" | "in_progress" | "not_started",
 *     progress: 0-100,
 *     completedSections: ["1-0", "1-1", ...],
 *     lastVisited: "2024-01-15T10:30:00Z",
 *     timeSpent: 3600, // seconds
 *     score: 85 // optional quiz score
 *   }
 * }
 */

class ProgressService {
  constructor() {
    this.storageKey = 'probLabProgress';
    this.metaKey = 'probLabProgressMeta';
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Get all progress data for a user
   * @param {string} userId - User identifier (optional, for future DB integration)
   * @returns {Promise<Object>} Progress data object
   */
  async getProgress(userId = 'local') {
    if (!this.isClient) return {};
    
    try {
      // Future: Try to fetch from API first
      // const response = await fetch(`/api/progress/${userId}`);
      // if (response.ok) {
      //   const data = await response.json();
      //   this.cacheProgress(data);
      //   return data;
      // }
      
      // Fall back to localStorage
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error fetching progress:', error);
      return {};
    }
  }

  /**
   * Update progress for a specific chapter
   * @param {string} userId - User identifier
   * @param {string} chapterId - Chapter identifier (e.g., "chapter-1")
   * @param {Object} data - Progress data to update
   * @returns {Promise<Object>} Updated progress object
   */
  async updateChapterProgress(userId = 'local', chapterId, data) {
    if (!this.isClient) return {};
    
    try {
      const progress = await this.getProgress(userId);
      
      // Merge with existing data
      progress[chapterId] = {
        ...progress[chapterId],
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      // Calculate overall progress if sections are provided
      if (data.completedSections) {
        progress[chapterId].progress = this.calculateProgress(chapterId, data.completedSections);
      }
      
      // Save to localStorage immediately (optimistic update)
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
      
      // Queue for database sync (future enhancement)
      this.queueSync(userId, progress);
      
      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      return {};
    }
  }

  /**
   * Get progress for a specific chapter
   * @param {string} chapterId - Chapter identifier
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Chapter progress data
   */
  async getChapterProgress(chapterId, userId = 'local') {
    const progress = await this.getProgress(userId);
    return progress[chapterId] || {
      status: 'not_started',
      progress: 0,
      completedSections: [],
      lastVisited: null,
      timeSpent: 0
    };
  }

  /**
   * Mark a section as completed
   * @param {string} chapterId - Chapter identifier
   * @param {string} sectionId - Section identifier
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Updated progress
   */
  async completeSection(chapterId, sectionId, userId = 'local') {
    const chapterProgress = await this.getChapterProgress(chapterId, userId);
    const completedSections = chapterProgress.completedSections || [];
    
    if (!completedSections.includes(sectionId)) {
      completedSections.push(sectionId);
    }
    
    const status = completedSections.length === 1 ? 'in_progress' : chapterProgress.status;
    
    return this.updateChapterProgress(userId, chapterId, {
      completedSections,
      status
    });
  }

  /**
   * Calculate progress percentage based on completed sections
   * @param {string} chapterId - Chapter identifier
   * @param {Array} completedSections - Array of completed section IDs
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(chapterId, completedSections) {
    // This should be updated based on actual chapter structure
    const chapterSectionCounts = {
      'chapter-1': 12,
      'chapter-2': 15,
      'chapter-3': 18,
      'chapter-4': 14,
      'chapter-5': 16,
      'chapter-6': 20,
      'chapter-7': 17
    };
    
    const totalSections = chapterSectionCounts[chapterId] || 10;
    return Math.round((completedSections.length / totalSections) * 100);
  }

  /**
   * Get overall course progress
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Overall progress statistics
   */
  async getOverallProgress(userId = 'local') {
    const progress = await this.getProgress(userId);
    const chapters = Object.keys(progress);
    
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
      overallProgress: chapters.length > 0 ? Math.round(totalProgress / chapters.length) : 0,
      completedChapters,
      inProgressChapters,
      totalChapters: 7,
      totalTimeSpent,
      lastActivity: this.getLastActivity(progress)
    };
  }

  /**
   * Get the most recent activity timestamp
   * @param {Object} progress - Progress data object
   * @returns {string|null} ISO timestamp of last activity
   */
  getLastActivity(progress) {
    let lastActivity = null;
    
    Object.values(progress).forEach(chapter => {
      if (chapter.lastUpdated && (!lastActivity || chapter.lastUpdated > lastActivity)) {
        lastActivity = chapter.lastUpdated;
      }
    });
    
    return lastActivity;
  }

  /**
   * Reset progress for a specific chapter
   * @param {string} chapterId - Chapter identifier
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Updated progress
   */
  async resetChapterProgress(chapterId, userId = 'local') {
    const progress = await this.getProgress(userId);
    delete progress[chapterId];
    
    if (this.isClient) {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    }
    
    this.queueSync(userId, progress);
    return progress;
  }

  /**
   * Reset all progress
   * @param {string} userId - User identifier
   * @returns {Promise<void>}
   */
  async resetAllProgress(userId = 'local') {
    if (this.isClient) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metaKey);
    }
    
    // Future: Also clear from database
    // await fetch(`/api/progress/${userId}`, { method: 'DELETE' });
  }

  /**
   * Export progress data as JSON
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Exportable progress data
   */
  async exportProgress(userId = 'local') {
    const progress = await this.getProgress(userId);
    const meta = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      userId
    };
    
    return {
      meta,
      progress
    };
  }

  /**
   * Import progress data from JSON
   * @param {Object} data - Progress data to import
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} Success status
   */
  async importProgress(data, userId = 'local') {
    try {
      if (!data || !data.progress) {
        throw new Error('Invalid progress data format');
      }
      
      if (this.isClient) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.progress));
        localStorage.setItem(this.metaKey, JSON.stringify(data.meta || {}));
      }
      
      this.queueSync(userId, data.progress);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }

  /**
   * Queue progress for sync with database (placeholder for future)
   * @param {string} userId - User identifier
   * @param {Object} progress - Progress data to sync
   */
  queueSync(userId, progress) {
    // Future implementation:
    // - Add to sync queue
    // - Retry failed syncs
    // - Handle offline/online transitions
    
    // For now, just store a sync timestamp
    if (this.isClient) {
      const meta = {
        lastLocalUpdate: new Date().toISOString(),
        pendingSync: true
      };
      localStorage.setItem(this.metaKey, JSON.stringify(meta));
    }
  }

  /**
   * Sync local progress with database (future enhancement)
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} Sync success status
   */
  async syncWithDatabase(userId = 'local') {
    // Future implementation
    try {
      const localProgress = await this.getProgress(userId);
      
      // const response = await fetch(`/api/progress/${userId}/sync`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(localProgress)
      // });
      
      // if (response.ok) {
      //   const meta = { lastSync: new Date().toISOString(), pendingSync: false };
      //   localStorage.setItem(this.metaKey, JSON.stringify(meta));
      //   return true;
      // }
      
      return false;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  /**
   * Check if there's pending data to sync
   * @returns {boolean} Whether there's pending sync
   */
  hasPendingSync() {
    if (!this.isClient) return false;
    
    try {
      const meta = localStorage.getItem(this.metaKey);
      if (meta) {
        const parsed = JSON.parse(meta);
        return parsed.pendingSync === true;
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
    
    return false;
  }
}

// Export singleton instance
const progressService = new ProgressService();
export default progressService;