/**
 * Centralized Error Reporting and Formatting Utilities
 * 
 * Provides consistent error handling patterns across the application
 */

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  MATH_ERROR: 'MATH_ERROR',
  SVG_ERROR: 'SVG_ERROR',
  MATHJAX_ERROR: 'MATHJAX_ERROR',
  D3_ERROR: 'D3_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_ERROR: 'USER_ERROR'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type from ERROR_TYPES
 * @param {string} severity - Error severity from ERROR_SEVERITY
 * @param {Object} context - Additional context information
 * @returns {Error} Enhanced error object
 */
export function createStandardError(message, type, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
  const error = new Error(message);
  error.type = type;
  error.severity = severity;
  error.context = context;
  error.timestamp = new Date().toISOString();
  
  // Add stack trace context if available
  if (context.originalError) {
    error.originalStack = context.originalError.stack;
  }
  
  return error;
}

/**
 * Format error for user display
 * @param {Error} error - Error object
 * @returns {Object} Formatted error for UI display
 */
export function formatErrorForUser(error) {
  const userMessages = {
    [ERROR_TYPES.MATH_ERROR]: 'A mathematical calculation encountered an error. Please check your input values.',
    [ERROR_TYPES.SVG_ERROR]: 'The visualization could not be rendered. This might be due to browser compatibility or invalid data.',
    [ERROR_TYPES.MATHJAX_ERROR]: 'Mathematical formulas could not be displayed. Please refresh the page.',
    [ERROR_TYPES.D3_ERROR]: 'The interactive chart could not be loaded. Please try refreshing the page.',
    [ERROR_TYPES.VALIDATION_ERROR]: 'Invalid input detected. Please check your values and try again.',
    [ERROR_TYPES.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
    [ERROR_TYPES.USER_ERROR]: 'Please check your input and try again.'
  };

  const severityColors = {
    [ERROR_SEVERITY.LOW]: 'blue',
    [ERROR_SEVERITY.MEDIUM]: 'yellow',
    [ERROR_SEVERITY.HIGH]: 'orange',
    [ERROR_SEVERITY.CRITICAL]: 'red'
  };

  return {
    message: userMessages[error.type] || error.message,
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    color: severityColors[error.severity] || 'yellow',
    canRetry: error.severity !== ERROR_SEVERITY.CRITICAL,
    technicalDetails: process.env.NODE_ENV === 'development' ? {
      originalMessage: error.message,
      type: error.type,
      context: error.context,
      stack: error.stack
    } : null
  };
}

/**
 * Log error with standardized formatting
 * @param {Error} error - Error to log
 * @param {Object} options - Logging options
 */
export function logError(error, options = {}) {
  const { 
    component = 'Unknown',
    action = 'Unknown',
    userId = null,
    silent = false 
  } = options;

  // Only log in development or if explicitly requested
  if (process.env.NODE_ENV !== 'development' && silent) {
    return;
  }

  const logEntry = {
    timestamp: error.timestamp || new Date().toISOString(),
    type: error.type,
    severity: error.severity,
    message: error.message,
    component,
    action,
    userId,
    context: error.context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };

  // Use appropriate console method based on severity
  switch (error.severity) {
    case ERROR_SEVERITY.CRITICAL:
      console.error('[CRITICAL]', logEntry);
      break;
    case ERROR_SEVERITY.HIGH:
      console.error('[HIGH]', logEntry);
      break;
    case ERROR_SEVERITY.MEDIUM:
      console.warn('[MEDIUM]', logEntry);
      break;
    case ERROR_SEVERITY.LOW:
    default:
      console.info('[LOW]', logEntry);
      break;
  }

  // In production, you might want to send this to an error tracking service
  // Example: sendToErrorTracking(logEntry);
}

/**
 * Create error handler for mathematical operations
 * @param {string} operationName - Name of the operation
 * @returns {Function} Error handler function
 */
export function createMathErrorHandler(operationName) {
  return (originalError, context = {}) => {
    const error = createStandardError(
      `Mathematical operation '${operationName}' failed: ${originalError.message}`,
      ERROR_TYPES.MATH_ERROR,
      ERROR_SEVERITY.MEDIUM,
      { operationName, originalError, ...context }
    );
    
    logError(error, { component: 'MathUtils', action: operationName });
    return error;
  };
}

/**
 * Create error handler for SVG operations
 * @param {string} componentName - Name of the SVG component
 * @returns {Function} Error handler function
 */
export function createSVGErrorHandler(componentName) {
  return (originalError, context = {}) => {
    const error = createStandardError(
      `SVG rendering in '${componentName}' failed: ${originalError.message}`,
      ERROR_TYPES.SVG_ERROR,
      ERROR_SEVERITY.HIGH,
      { componentName, originalError, ...context }
    );
    
    logError(error, { component: componentName, action: 'SVG_RENDER' });
    return error;
  };
}

/**
 * Create error handler for MathJax operations
 * @param {string} componentName - Name of the component using MathJax
 * @returns {Function} Error handler function
 */
export function createMathJaxErrorHandler(componentName) {
  return (originalError, context = {}) => {
    const error = createStandardError(
      `MathJax rendering in '${componentName}' failed: ${originalError.message}`,
      ERROR_TYPES.MATHJAX_ERROR,
      ERROR_SEVERITY.MEDIUM,
      { componentName, originalError, ...context }
    );
    
    logError(error, { component: componentName, action: 'MATHJAX_RENDER' });
    return error;
  };
}

/**
 * Create error handler for D3 operations
 * @param {string} visualizationName - Name of the D3 visualization
 * @returns {Function} Error handler function
 */
export function createD3ErrorHandler(visualizationName) {
  return (originalError, context = {}) => {
    const error = createStandardError(
      `D3 visualization '${visualizationName}' failed: ${originalError.message}`,
      ERROR_TYPES.D3_ERROR,
      ERROR_SEVERITY.HIGH,
      { visualizationName, originalError, ...context }
    );
    
    logError(error, { component: visualizationName, action: 'D3_RENDER' });
    return error;
  };
}

/**
 * Create error handler for validation operations
 * @param {string} validationType - Type of validation
 * @returns {Function} Error handler function
 */
export function createValidationErrorHandler(validationType) {
  return (message, context = {}) => {
    const error = createStandardError(
      `Validation error in '${validationType}': ${message}`,
      ERROR_TYPES.VALIDATION_ERROR,
      ERROR_SEVERITY.LOW,
      { validationType, ...context }
    );
    
    logError(error, { component: 'Validation', action: validationType });
    return error;
  };
}

/**
 * Global error boundary helper
 * @param {Error} error - The caught error
 * @param {Object} errorInfo - React error info
 * @param {string} componentName - Name of the component where error occurred
 */
export function handleGlobalError(error, errorInfo, componentName) {
  const standardError = createStandardError(
    `Unhandled error in component '${componentName}': ${error.message}`,
    ERROR_TYPES.USER_ERROR,
    ERROR_SEVERITY.HIGH,
    { 
      originalError: error, 
      errorInfo, 
      componentName,
      componentStack: errorInfo?.componentStack 
    }
  );
  
  logError(standardError, { 
    component: componentName, 
    action: 'COMPONENT_ERROR' 
  });
  
  return formatErrorForUser(standardError);
}

/**
 * Utility to check if error should be displayed to user
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error should be shown to user
 */
export function shouldDisplayError(error) {
  // Don't show low severity errors to users in production
  if (process.env.NODE_ENV === 'production' && error.severity === ERROR_SEVERITY.LOW) {
    return false;
  }
  
  // Always show critical and high severity errors
  if (error.severity === ERROR_SEVERITY.CRITICAL || error.severity === ERROR_SEVERITY.HIGH) {
    return true;
  }
  
  // Show medium severity errors with some filtering
  return error.type !== ERROR_TYPES.VALIDATION_ERROR;
}