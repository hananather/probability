/**
 * MathJax Initial Render Fix
 * 
 * This utility ensures LaTeX renders on initial page load
 * by implementing a robust retry mechanism with proper error handling
 */
import { useEffect, useState } from 'react';

/**
 * Safe MathJax processing wrapper with error handling
 * 
 * @param {HTMLElement} element - The DOM element containing LaTeX
 * @param {Object} options - Configuration options
 * @returns {Promise} Promise that resolves when processing is complete or fails gracefully
 */
export const safeMathJaxProcess = async (element, options = {}) => {
  const { silent = true, maxRetries = 3, onError = null } = options;
  
  if (!element || !document.contains(element)) {
    const error = new Error('MathJax: Element not found or not in DOM');
    error.type = 'ELEMENT_NOT_FOUND';
    
    if (onError) {
      onError(error);
    }
    
    if (!silent && process.env.NODE_ENV === 'development') {
      console.warn(error.message);
    }
    return { success: false, error };
  }
  
  if (typeof window === 'undefined' || !window.MathJax || !window.MathJax.typesetPromise) {
    const error = new Error('MathJax: Library not loaded yet');
    error.type = 'LIBRARY_NOT_READY';
    
    if (onError) {
      onError(error);
    }
    
    if (!silent && process.env.NODE_ENV === 'development') {
      console.warn(error.message);
    }
    return { success: false, error };
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
      return { success: true }; // Success!
      
    } catch (error) {
      attempt++;
      if (attempt === maxRetries) {
        const finalError = new Error(`MathJax: Failed to process after ${maxRetries} attempts: ${error.message}`);
        finalError.type = 'PROCESSING_FAILED';
        finalError.originalError = error;
        finalError.element = element.tagName;
        finalError.content = element.textContent?.substring(0, 50) + '...';
        
        if (options.onError) {
          options.onError(finalError);
        }
        
        if (!silent && process.env.NODE_ENV === 'development') {
          console.warn(finalError.message, {
            error: error.message,
            element: element.tagName,
            content: element.textContent?.substring(0, 50) + '...'
          });
        }
        
        return { success: false, error: finalError };
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
            // Handle error on final attempt
            if (attempts >= maxAttempts - 1) {
              const finalError = new Error(`MathJax: Processing failed after maximum attempts: ${error.message}`);
              finalError.type = 'PROCESSING_FAILED';
              finalError.originalError = error;
              finalError.element = element.tagName;
              
              if (process.env.NODE_ENV === 'development') {
                console.warn(finalError.message, {
                  error: error.message,
                  element: element.tagName
                });
              }
            }
            scheduleRetry();
          });
      } catch (err) {
        // Handle error on final attempt only
        if (attempts >= maxAttempts - 1) {
          const finalError = new Error(`MathJax: Processing error: ${err.message}`);
          finalError.type = 'PROCESSING_ERROR';
          finalError.originalError = err;
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(finalError.message);
          }
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
 * Enhanced MathJax hook with loading state support
 * @param {Array} dependencies - React dependencies for re-processing
 * @param {Object} options - Configuration options
 * @returns {Object} { ref, isLoading, error }
 */
export const useEnhancedMathJax = (dependencies = [], options = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let attempts = 0;
    const maxAttempts = options.maxRetries || 10;
    const baseDelay = 100;
    let timeoutIds = [];
    
    setIsLoading(true);
    setError(null);
    
    const attemptProcess = async () => {
      if (!mountedRef.current || !containerRef.current || !document.contains(containerRef.current)) {
        return;
      }
      
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        try {
          // Clear previous rendering
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([containerRef.current]);
          }
          
          // Process the element
          await window.MathJax.typesetPromise([containerRef.current]);
          
          if (mountedRef.current) {
            setIsLoading(false);
            setError(null);
          }
          
          // Clear any remaining timeouts
          timeoutIds.forEach(id => clearTimeout(id));
          timeoutIds = [];
        } catch (err) {
          if (attempts >= maxAttempts - 1) {
            if (mountedRef.current) {
              setError(err);
              setIsLoading(false);
            }
            const finalError = new Error(`MathJax: Processing failed after maximum attempts: ${err.message}`);
            finalError.type = 'PROCESSING_FAILED';
            finalError.originalError = err;
            
            if (process.env.NODE_ENV === 'development') {
              console.warn(finalError.message);
            }
          } else {
            scheduleRetry();
          }
        }
      } else {
        scheduleRetry();
      }
    };
    
    const scheduleRetry = () => {
      attempts++;
      if (attempts < maxAttempts && mountedRef.current) {
        const delay = Math.min(baseDelay * Math.pow(1.5, attempts), 2000);
        const timeoutId = setTimeout(attemptProcess, delay);
        timeoutIds.push(timeoutId);
      } else if (mountedRef.current) {
        setError(new Error('MathJax not available after maximum attempts'));
        setIsLoading(false);
      }
    };
    
    // Start processing
    attemptProcess();
    
    // Cleanup
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  return { ref: containerRef, isLoading, error };
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
          const globalError = new Error(`MathJax: Global processing error: ${error.message}`);
          globalError.type = 'GLOBAL_PROCESSING_ERROR';
          globalError.originalError = error;
          globalError.elementCount = mathElements.length;
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(globalError.message, {
              error: error.message,
              elementCount: mathElements.length
            });
          }
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
        const hookError = new Error(`MathJax: Unexpected error in hook: ${error.message}`);
        hookError.type = 'HOOK_ERROR';
        hookError.originalError = error;
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(hookError.message);
        }
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

// LaTeX formatter to ensure proper escaping
export const formatLatex = (latex, inline = true) => {
  // Ensure proper escaping of curly braces in sets
  const formatted = latex
    .replace(/\\\{/g, '\\\\{')
    .replace(/\\\}/g, '\\\\}');
  
  return inline ? `\\(${formatted}\\)` : `\\[${formatted}\\]`;
};

// Component wrapper for LaTeX content
export const LaTeX = ({ children, inline = true, className = "" }) => {
  const formatted = formatLatex(children, inline);
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: formatted }} 
    />
  );
};

// Loading skeleton for MathJax content
export const MathJaxSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    </div>
  );
};

