/**
 * Error handling utilities for probability components
 */

import { 
  createMathErrorHandler, 
  createValidationErrorHandler,
  createStandardError,
  ERROR_TYPES,
  ERROR_SEVERITY 
} from './errorReporting.js';

// Small epsilon for floating point comparisons
export const EPSILON = 1e-10;

/**
 * Safe division with zero check
 * @param {number} numerator 
 * @param {number} denominator 
 * @param {number} defaultValue - Value to return if division by zero
 * @returns {number}
 */
export function safeDivide(numerator, denominator, defaultValue = 0) {
  if (Math.abs(denominator) < EPSILON) {
    return defaultValue;
  }
  return numerator / denominator;
}

/**
 * Clamp value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate probability value
 * @param {number} prob 
 * @param {Object} options - Validation options
 * @returns {Object} { value: number, isValid: boolean, error?: string }
 */
export function validateProbability(prob, options = {}) {
  const { throwOnError = false, defaultValue = 0 } = options;
  const validationErrorHandler = createValidationErrorHandler('probability');
  
  if (typeof prob !== 'number' || isNaN(prob)) {
    const error = validationErrorHandler(
      `Invalid probability value: ${prob}. Expected a number between 0 and 1.`,
      { inputValue: prob, expectedType: 'number' }
    );
    
    if (throwOnError) {
      throw error;
    }
    
    return {
      value: defaultValue,
      isValid: false,
      error: error.message
    };
  }
  
  const clampedValue = clamp(prob, 0, 1);
  const wasClampedNeeded = clampedValue !== prob;
  
  if (wasClampedNeeded) {
    const clampError = validationErrorHandler(
      `Probability ${prob} was clamped to ${clampedValue}`,
      { originalValue: prob, clampedValue }
    );
    
    return {
      value: clampedValue,
      isValid: false,
      error: clampError.message
    };
  }
  
  return {
    value: clampedValue,
    isValid: true
  };
}

/**
 * Safe factorial calculation with overflow protection
 * @param {number} n 
 * @returns {number}
 */
export function safeFactorial(n) {
  if (n < 0 || !Number.isInteger(n)) return 0;
  if (n > 170) return Infinity; // Prevent overflow
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Safe combination calculation (nCr)
 * @param {number} n 
 * @param {number} r 
 * @returns {number}
 */
export function safeCombination(n, r) {
  if (r > n || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) return 0;
  if (r === 0 || r === n) return 1;
  
  // Use the more efficient formula
  r = Math.min(r, n - r);
  let result = 1;
  
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
    // Check for overflow
    if (!isFinite(result)) return Infinity;
  }
  
  return Math.round(result);
}

/**
 * Safe permutation calculation (nPr)
 * @param {number} n 
 * @param {number} r 
 * @returns {number}
 */
export function safePermutation(n, r) {
  if (r > n || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) return 0;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
    // Check for overflow
    if (!isFinite(result)) return Infinity;
  }
  
  return result;
}

/**
 * Create error boundary for calculations
 * @param {Function} fn 
 * @param {*} defaultValue 
 * @param {Object} options - Error handling options
 * @returns {*}
 */
export function withErrorBoundary(fn, defaultValue = 0, options = {}) {
  const { throwOnError = false, onError = null } = options;
  const mathErrorHandler = createMathErrorHandler(fn.name || 'anonymous');
  
  return (...args) => {
    try {
      const result = fn(...args);
      if (!isFinite(result)) {
        const error = mathErrorHandler(
          new Error(`Non-finite result: ${result}`),
          { functionName: fn.name, args, result }
        );
        
        if (onError) {
          onError(error);
        }
        
        if (throwOnError) {
          throw error;
        }
        
        return defaultValue;
      }
      return result;
    } catch (originalError) {
      const error = mathErrorHandler(originalError, { 
        functionName: fn.name, 
        args 
      });
      
      if (onError) {
        onError(error);
      }
      
      if (throwOnError) {
        throw error;
      }
      
      return defaultValue;
    }
  };
}

/**
 * Validate SVG dimensions
 * @param {DOMRect} rect 
 * @param {Object} options - Validation options
 * @returns {Object} { dimensions: Object, isValid: boolean, error?: string }
 */
export function validateSVGDimensions(rect, options = {}) {
  const { 
    defaults = { width: 600, height: 400 }, 
    throwOnError = false,
    onError = null 
  } = options;
  
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    const error = createStandardError(
      `Invalid SVG dimensions: ${rect ? `width: ${rect.width}, height: ${rect.height}` : 'null rect'}. Using defaults.`,
      ERROR_TYPES.SVG_ERROR,
      ERROR_SEVERITY.MEDIUM,
      { rect, defaults }
    );
    
    if (onError) {
      onError(error);
    }
    
    if (throwOnError) {
      throw error;
    }
    
    return {
      dimensions: defaults,
      isValid: false,
      error: error.message
    };
  }
  
  return {
    dimensions: {
      width: rect.width,
      height: rect.height
    },
    isValid: true
  };
}

/**
 * Format number for display with appropriate precision
 * @param {number} value 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatProbability(value, decimals = 3) {
  if (!isFinite(value)) return '—';
  
  const formatted = value.toFixed(decimals);
  // Remove trailing zeros after decimal point
  return formatted.replace(/\.?0+$/, '');
}