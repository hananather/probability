// LocalStorage management for quiz tracking
// Handles quiz attempts, scores, and preferences

const STORAGE_KEYS = {
  ATTEMPTS: 'quiz_attempts',
  BEST_SCORES: 'quiz_best_scores',
  PREFERENCES: 'quiz_preferences',
  CURRENT_SESSION: 'quiz_current_session'
};

// Default preferences
const DEFAULT_PREFERENCES = {
  showTimer: true,
  immediateFeeback: false,
  showQuestionNumbers: true,
  allowSkipping: true,
  version: 'engineering' // engineering, biostats, social
};

// Quiz attempt management
export const quizStorage = {
  // Save a quiz attempt
  saveAttempt(chapterId, attemptData) {
    try {
      const attempts = this.getAttempts(chapterId);
      const newAttempt = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        chapterId,
        score: attemptData.score,
        percentage: attemptData.percentage,
        timeSpent: attemptData.timeSpent, // in seconds
        totalQuestions: attemptData.totalQuestions,
        correctAnswers: attemptData.correctAnswers,
        answers: attemptData.answers, // Store for review
        version: attemptData.version || 'engineering'
      };
      
      attempts.push(newAttempt);
      
      // Keep only last 10 attempts per chapter
      if (attempts.length > 10) {
        attempts.shift();
      }
      
      const allAttempts = this.getAllAttempts();
      allAttempts[chapterId] = attempts;
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(allAttempts));
      
      // Update best score
      this.updateBestScore(chapterId, attemptData.percentage);
      
      return newAttempt;
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      return null;
    }
  },
  
  // Get all attempts for a chapter
  getAttempts(chapterId) {
    try {
      const allAttempts = this.getAllAttempts();
      return allAttempts[chapterId] || [];
    } catch {
      return [];
    }
  },
  
  // Get all attempts
  getAllAttempts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  
  // Get last attempt for a chapter
  getLastAttempt(chapterId) {
    const attempts = this.getAttempts(chapterId);
    return attempts[attempts.length - 1] || null;
  },
  
  // Update best score
  updateBestScore(chapterId, percentage) {
    try {
      const bestScores = this.getBestScores();
      if (!bestScores[chapterId] || percentage > bestScores[chapterId]) {
        bestScores[chapterId] = percentage;
        localStorage.setItem(STORAGE_KEYS.BEST_SCORES, JSON.stringify(bestScores));
      }
    } catch (error) {
      console.error('Error updating best score:', error);
    }
  },
  
  // Get best scores
  getBestScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BEST_SCORES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  
  // Get best score for a chapter
  getBestScore(chapterId) {
    const bestScores = this.getBestScores();
    return bestScores[chapterId] || 0;
  },
  
  // Check if chapter quiz is passed
  isChapterPassed(chapterId, passingScore = 50) {
    return this.getBestScore(chapterId) >= passingScore;
  },
  
  // Get quiz statistics for a chapter
  getChapterStats(chapterId) {
    const attempts = this.getAttempts(chapterId);
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        averageTime: 0,
        lastAttemptDate: null,
        passed: false
      };
    }
    
    const scores = attempts.map(a => a.percentage);
    const times = attempts.map(a => a.timeSpent);
    
    return {
      totalAttempts: attempts.length,
      bestScore: Math.max(...scores),
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      lastAttemptDate: attempts[attempts.length - 1].date,
      passed: Math.max(...scores) >= 70
    };
  },
  
  // Session management (for resuming incomplete quizzes)
  saveCurrentSession(chapterId, sessionData) {
    try {
      const session = {
        chapterId,
        currentQuestion: sessionData.currentQuestion,
        answers: sessionData.answers,
        timeRemaining: sessionData.timeRemaining,
        startTime: sessionData.startTime,
        flaggedQuestions: sessionData.flaggedQuestions || [],
        version: sessionData.version
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },
  
  getCurrentSession(chapterId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!data) return null;
      
      const session = JSON.parse(data);
      // Only return if it's for the requested chapter
      return session.chapterId === chapterId ? session : null;
    } catch {
      return null;
    }
  },
  
  clearCurrentSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
  
  // Preferences management
  getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },
  
  savePreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },
  
  updatePreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    this.savePreferences(preferences);
  },
  
  // Clear all quiz data (for debugging/reset)
  clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing quiz data:', error);
    }
  },
  
  // Export data (for future database migration)
  exportData() {
    return {
      attempts: this.getAllAttempts(),
      bestScores: this.getBestScores(),
      preferences: this.getPreferences()
    };
  },
  
  // Import data (for future database migration)
  importData(data) {
    try {
      if (data.attempts) {
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data.attempts));
      }
      if (data.bestScores) {
        localStorage.setItem(STORAGE_KEYS.BEST_SCORES, JSON.stringify(data.bestScores));
      }
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};

// Progress tracking across all chapters
export function getOverallProgress() {
  const totalChapters = 7; // Update as chapters are added
  const bestScores = quizStorage.getBestScores();
  const passedChapters = Object.values(bestScores).filter(score => score >= 70).length;
  
  return {
    completedChapters: Object.keys(bestScores).length,
    passedChapters,
    totalChapters,
    percentageComplete: (passedChapters / totalChapters) * 100,
    chapterScores: bestScores
  };
}