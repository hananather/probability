/**
 * Error handling utilities for probability components
 */

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
 * @returns {number} Clamped probability between 0 and 1
 */
export function validateProbability(prob) {
  if (typeof prob !== 'number' || isNaN(prob)) {
    console.warn('Invalid probability value:', prob);
    return 0;
  }
  return clamp(prob, 0, 1);
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
 * @returns {*}
 */
export function withErrorBoundary(fn, defaultValue = 0) {
  return (...args) => {
    try {
      const result = fn(...args);
      if (!isFinite(result)) {
        console.warn('Non-finite result from calculation:', fn.name, args);
        return defaultValue;
      }
      return result;
    } catch (error) {
      console.error('Calculation error:', error, fn.name, args);
      return defaultValue;
    }
  };
}

/**
 * Validate SVG dimensions
 * @param {DOMRect} rect 
 * @param {Object} defaults 
 * @returns {Object} Valid dimensions
 */
export function validateSVGDimensions(rect, defaults = { width: 600, height: 400 }) {
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    console.warn('Invalid SVG dimensions, using defaults:', rect);
    return defaults;
  }
  
  return {
    width: rect.width,
    height: rect.height
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