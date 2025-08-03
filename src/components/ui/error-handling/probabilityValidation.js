/**
 * Utility functions for probability calculation validation and safe operations
 */

// Validate that a value is a valid probability (between 0 and 1)
export const isValidProbability = (value) => {
  return typeof value === 'number' && isFinite(value) && value >= 0 && value <= 1;
};

// Validate that values sum to 1 (for probability distributions)
export const isValidProbabilityDistribution = (values, tolerance = 1e-10) => {
  if (!Array.isArray(values) || values.length === 0) return false;
  
  const sum = values.reduce((acc, val) => {
    if (!isValidProbability(val)) return NaN;
    return acc + val;
  }, 0);
  
  return isFinite(sum) && Math.abs(sum - 1) <= tolerance;
};

// Safely calculate conditional probability P(A|B) = P(A ∩ B) / P(B)
export const safeConditionalProbability = (intersection, condition) => {
  if (!isValidProbability(intersection) || !isValidProbability(condition)) {
    throw new Error('Invalid probability values: probabilities must be between 0 and 1');
  }
  
  if (condition === 0) {
    throw new Error('Conditional probability undefined: P(B) = 0 (cannot condition on impossible event)');
  }
  
  if (intersection > condition) {
    throw new Error('Invalid probabilities: P(A ∩ B) cannot be greater than P(B)');
  }
  
  return intersection / condition;
};

// Safely calculate Bayes' theorem: P(A|B) = P(B|A) * P(A) / P(B)
export const safeBayesTheorem = (likelihood, prior, evidence) => {
  if (!isValidProbability(likelihood) || !isValidProbability(prior) || !isValidProbability(evidence)) {
    throw new Error('Invalid probability values: probabilities must be between 0 and 1');
  }
  
  if (evidence === 0) {
    throw new Error('Bayes theorem undefined: P(B) = 0 (cannot condition on impossible event)');
  }
  
  return (likelihood * prior) / evidence;
};

// Safely normalize probabilities to sum to 1
export const normalizeDistribution = (values) => {
  const sum = values.reduce((acc, val) => acc + Math.max(0, val), 0);
  
  if (sum === 0) {
    // Return uniform distribution if all values are 0
    return values.map(() => 1 / values.length);
  }
  
  return values.map(val => Math.max(0, val) / sum);
};

// Validate event relationships
export const validateEventRelationship = (eventA, eventB, intersection) => {
  const errors = [];
  
  if (!isValidProbability(eventA)) {
    errors.push('P(A) must be a valid probability between 0 and 1');
  }
  
  if (!isValidProbability(eventB)) {
    errors.push('P(B) must be a valid probability between 0 and 1');
  }
  
  if (!isValidProbability(intersection)) {
    errors.push('P(A ∩ B) must be a valid probability between 0 and 1');
  }
  
  if (intersection > eventA) {
    errors.push('P(A ∩ B) cannot be greater than P(A)');
  }
  
  if (intersection > eventB) {
    errors.push('P(A ∩ B) cannot be greater than P(B)');
  }
  
  if (intersection > eventA + eventB - 1) {
    errors.push('Invalid probability combination: violates Bonferroni inequality');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Safe calculation wrapper with meaningful error messages
export const safeCalculation = (calculationFn, context = 'calculation') => {
  try {
    const result = calculationFn();
    
    if (!isFinite(result)) {
      throw new Error(`${context} produced non-finite result`);
    }
    
    return { success: true, result, error: null };
  } catch (error) {
    return { 
      success: false, 
      result: null, 
      error: {
        message: error.message,
        context,
        suggestion: getSuggestionForError(error.message)
      }
    };
  }
};

// Get helpful suggestions for common probability errors
const getSuggestionForError = (errorMessage) => {
  if (errorMessage.includes('division by zero') || errorMessage.includes('P(B) = 0')) {
    return 'Check that you are not conditioning on an impossible event (probability = 0)';
  }
  
  if (errorMessage.includes('greater than')) {
    return 'Verify that intersection probabilities do not exceed individual event probabilities';
  }
  
  if (errorMessage.includes('between 0 and 1')) {
    return 'Ensure all probability values are between 0 and 1 (inclusive)';
  }
  
  if (errorMessage.includes('non-finite')) {
    return 'Check for invalid mathematical operations (division by zero, overflow, etc.)';
  }
  
  return 'Double-check your input values and calculation logic';
};