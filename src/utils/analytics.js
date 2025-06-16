/**
 * Analytics interface for tracking user interactions with educational components
 * 
 * This is designed as a simple, extensible interface that can be connected
 * to any analytics backend (Google Analytics, Mixpanel, custom backend, etc.)
 * 
 * @example
 * // Basic usage
 * analytics.track('quiz_answered', { 
 *   questionId: 'q1', 
 *   correct: true, 
 *   attempts: 2 
 * });
 * 
 * // With custom analytics provider
 * const myAnalytics = createAnalytics({
 *   track: (event, data) => {
 *     // Send to your analytics backend
 *     myBackend.log(event, data);
 *   }
 * });
 */

/**
 * Default analytics interface - logs to console in development
 */
class Analytics {
  constructor(config = {}) {
    this.enabled = config.enabled ?? (process.env.NODE_ENV === 'production');
    this.debug = config.debug ?? (process.env.NODE_ENV === 'development');
    this.provider = config.provider || this.defaultProvider;
  }

  /**
   * Default provider that logs to console
   * @private
   */
  defaultProvider = {
    track: (event, data) => {
      if (this.debug) {
        console.log(`[Analytics] ${event}`, data);
      }
    },
    identify: (userId, traits) => {
      if (this.debug) {
        console.log(`[Analytics] Identify user: ${userId}`, traits);
      }
    },
    page: (name, properties) => {
      if (this.debug) {
        console.log(`[Analytics] Page view: ${name}`, properties);
      }
    }
  };

  /**
   * Track a custom event
   * @param {string} event - Event name (e.g., 'quiz_answered', 'simulation_started')
   * @param {Object} data - Event data/properties
   * @example
   * analytics.track('quiz_answered', {
   *   questionId: 'q1',
   *   questionText: 'What is the mean of X?',
   *   selectedAnswer: 2,
   *   correctAnswer: 3,
   *   correct: false,
   *   attempts: 1,
   *   timeSpent: 15.3, // seconds
   *   component: 'QuizBreak'
   * });
   */
  track(event, data = {}) {
    if (!this.enabled) return;
    
    // Add common properties
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      ...this.getCommonProperties()
    };

    try {
      this.provider.track(event, enrichedData);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Identify a user
   * @param {string} userId - Unique user identifier
   * @param {Object} traits - User properties/traits
   */
  identify(userId, traits = {}) {
    if (!this.enabled) return;
    
    try {
      this.provider.identify(userId, {
        ...traits,
        ...this.getCommonProperties()
      });
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }

  /**
   * Track a page view
   * @param {string} name - Page name
   * @param {Object} properties - Additional page properties
   */
  page(name, properties = {}) {
    if (!this.enabled) return;
    
    try {
      this.provider.page(name, {
        ...properties,
        ...this.getCommonProperties()
      });
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  /**
   * Get or create a session ID
   * @private
   */
  getSessionId() {
    if (typeof window === 'undefined') return null;
    
    const key = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(key);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get common properties to include with all events
   * @private
   */
  getCommonProperties() {
    if (typeof window === 'undefined') return {};
    
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      language: navigator.language
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

/**
 * Create a custom analytics instance
 * @param {Object} config - Configuration options
 * @returns {Analytics} - New analytics instance
 */
export function createAnalytics(config) {
  return new Analytics(config);
}

// Export singleton as default
export default analytics;

/**
 * Common event names for consistency
 */
export const Events = {
  // Quiz events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_ANSWERED: 'quiz_answered',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_RETRY: 'quiz_retry',
  
  // Simulation events
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_PARAMETER_CHANGED: 'simulation_parameter_changed',
  SIMULATION_MILESTONE_REACHED: 'simulation_milestone_reached',
  SIMULATION_RESET: 'simulation_reset',
  
  // Interactive component events
  SLIDER_CHANGED: 'slider_changed',
  BUTTON_CLICKED: 'button_clicked',
  TAB_CHANGED: 'tab_changed',
  
  // Learning progress events
  SECTION_COMPLETED: 'section_completed',
  CONCEPT_UNDERSTOOD: 'concept_understood',
  HELP_REQUESTED: 'help_requested'
};

/**
 * React hook for analytics
 * @example
 * const { track } = useAnalytics();
 * track('button_clicked', { buttonId: 'submit' });
 */
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics)
  };
}