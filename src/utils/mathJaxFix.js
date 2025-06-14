/**
 * MathJax Initial Render Fix
 * 
 * This utility ensures LaTeX renders on initial page load
 * by implementing a robust retry mechanism with proper error handling
 */
import { useEffect } from 'react';

/**
 * Safe MathJax processing wrapper with error handling
 * 
 * @param {HTMLElement} element - The DOM element containing LaTeX
 * @param {Object} options - Configuration options
 * @returns {Promise} Promise that resolves when processing is complete or fails gracefully
 */
export const safeMathJaxProcess = async (element, options = {}) => {
  const { silent = true, maxRetries = 3 } = options;
  
  if (!element || !document.contains(element)) {
    if (!silent) console.warn('MathJax: Element not found or not in DOM');
    return;
  }
  
  if (typeof window === 'undefined' || !window.MathJax || !window.MathJax.typesetPromise) {
    if (!silent) console.warn('MathJax: Library not loaded yet');
    return;
  }
  
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      // Clear previous rendering if available
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([element]);
      }
      
      // Process the element
      await window.MathJax.typesetPromise([element]);
      return; // Success!
      
    } catch (error) {
      attempt++;
      if (!silent && attempt === maxRetries) {
        console.warn(`MathJax: Failed to process after ${maxRetries} attempts`, {
          error: error.message,
          element: element.tagName,
          content: element.textContent?.substring(0, 50) + '...'
        });
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }
};

/**
 * Enhanced MathJax processing with guaranteed initial render
 * 
 * @param {HTMLElement} element - The DOM element containing LaTeX
 * @param {Array} dependencies - React dependencies for re-processing
 * @returns {Function} Cleanup function for useEffect
 */
export const processMathJaxWithRetry = (element, dependencies = []) => {
  let attempts = 0;
  const maxAttempts = 20; // Try for up to 10 seconds
  const baseDelay = 100;
  let timeoutIds = [];
  
  const attemptProcess = () => {
    // Check if element is still in DOM
    if (!element || !document.contains(element)) {
      return;
    }
    
    // Check if MathJax is available
    if (typeof window !== "undefined" && window.MathJax && window.MathJax.typesetPromise) {
      try {
        // Clear previous rendering
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
        
        // Process the element
        window.MathJax.typesetPromise([element])
          .then(() => {
            // Clear any remaining timeouts
            timeoutIds.forEach(id => clearTimeout(id));
            timeoutIds = [];
          })
          .catch((error) => {
            // Log warning on final attempt only
            if (attempts >= maxAttempts - 1) {
              console.warn('MathJax: Processing failed after maximum attempts', {
                error: error.message,
                element: element.tagName
              });
            }
            scheduleRetry();
          });
      } catch (err) {
        // Log warning on final attempt only
        if (attempts >= maxAttempts - 1) {
          console.warn('MathJax: Processing error', err.message);
        }
        scheduleRetry();
      }
    } else {
      scheduleRetry();
    }
  };
  
  const scheduleRetry = () => {
    attempts++;
    if (attempts < maxAttempts) {
      // Exponential backoff with cap at 2 seconds
      const delay = Math.min(baseDelay * Math.pow(1.5, attempts), 2000);
      const timeoutId = setTimeout(attemptProcess, delay);
      timeoutIds.push(timeoutId);
    } else {
      // MathJax processing failed after maximum attempts
    }
  };
  
  // Start processing
  attemptProcess();
  
  // Also set up a MutationObserver to detect when content changes
  const observer = new MutationObserver(() => {
    attempts = 0; // Reset attempts on content change
    attemptProcess();
  });
  
  // Observe only character data and childList changes
  observer.observe(element, {
    characterData: true,
    childList: true,
    subtree: true
  });
  
  // Return cleanup function
  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
    observer.disconnect();
  };
};

/**
 * React hook for reliable MathJax processing
 */
export const useReliableMathJax = (ref, dependencies = []) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const cleanup = processMathJaxWithRetry(ref.current, dependencies);
    
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

/**
 * Global initialization to catch any missed LaTeX on page load
 * Call this once in your app's root
 */
export const initGlobalMathJaxProcessor = () => {
  let hasProcessed = false;
  
  const processAllMath = () => {
    if (hasProcessed) return;
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      hasProcessed = true;
      
      // Find all elements that might contain LaTeX
      const elements = document.querySelectorAll('*');
      const mathElements = [];
      
      elements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('\\(') || text.includes('\\[') || 
            text.includes('\\\\(') || text.includes('\\\\[')) {
          mathElements.push(el);
        }
      });
      
      if (mathElements.length > 0) {
        window.MathJax.typesetPromise(mathElements).catch((error) => {
          console.warn('MathJax: Global processing error', {
            error: error.message,
            elementCount: mathElements.length
          });
        });
      }
    } else {
      // Retry after delay
      setTimeout(processAllMath, 200);
    }
  };
  
  // Try multiple strategies to ensure processing happens
  
  // Strategy 1: Process when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAllMath);
  } else {
    setTimeout(processAllMath, 100);
  }
  
  // Strategy 2: Process when window loads
  window.addEventListener('load', () => {
    setTimeout(processAllMath, 500);
  });
  
  // Strategy 3: Listen for MathJax ready event
  window.addEventListener('MathJaxReady', () => {
    setTimeout(processAllMath, 100);
  });
  
  // Strategy 4: Periodic check for first 5 seconds
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    checkCount++;
    if (checkCount > 25 || hasProcessed) { // 5 seconds
      clearInterval(checkInterval);
      return;
    }
    processAllMath();
  }, 200);
};

/**
 * Safe React hook for MathJax processing with error handling
 * 
 * @param {React.RefObject} ref - React ref to the element containing LaTeX
 * @param {Array} dependencies - React dependencies for re-processing
 * @param {Object} options - Configuration options
 */
export const useSafeMathJax = (ref, dependencies = [], options = {}) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    let isMounted = true;
    
    // Process with error handling
    const processElement = async () => {
      if (!isMounted) return;
      
      try {
        await safeMathJaxProcess(element, options);
      } catch (error) {
        console.warn('MathJax: Unexpected error in hook', error.message);
      }
    };
    
    // Initial processing
    processElement();
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      if (!isMounted) return;
      processElement();
    });
    
    observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true
    });
    
    // Cleanup
    return () => {
      isMounted = false;
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};