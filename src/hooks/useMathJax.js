import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for MathJax rendering with proper cleanup and error handling
 * Accepts a dependency array, or an existing object ref followed by dependencies.
 * @param {Array|Object} refOrDependencies - Dependencies or an object ref
 * @param {Array} [suppliedDependencies] - Dependencies for an existing ref
 * @returns {Object} ref - Ref to attach to the container element
 */
export function useMathJax(refOrDependencies = [], suppliedDependencies = []) {
  const ownRef = useRef(null);
  const hasSuppliedRef = !Array.isArray(refOrDependencies);
  if (hasSuppliedRef && (!refOrDependencies || typeof refOrDependencies !== 'object' || !('current' in refOrDependencies))) {
    throw new TypeError('useMathJax expects a dependency array or an object ref');
  }
  const containerRef = hasSuppliedRef ? refOrDependencies : ownRef;
  const dependencies = hasSuppliedRef ? suppliedDependencies : refOrDependencies;
  if (!Array.isArray(dependencies)) {
    throw new TypeError('useMathJax dependencies must be an array');
  }
  
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    let timeoutIds = [];
    
    const processMathJax = async () => {
      if (!mounted || !containerRef.current) return;
      
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        try {
          // Clear previous typesetting
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([containerRef.current]);
          }
          
          // Process new content
          await window.MathJax.typesetPromise([containerRef.current]);
          
          // Clear timeouts on success
          timeoutIds.forEach(id => clearTimeout(id));
          timeoutIds = [];
        } catch (err) {
          if (!mounted) return;
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
            const timeoutId = setTimeout(processMathJax, delay);
            timeoutIds.push(timeoutId);
          } else {
            console.error('MathJax rendering error after retries:', err);
          }
        }
      } else if (retryCount < maxRetries) {
        // MathJax not ready, retry
        retryCount++;
        const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
        const timeoutId = setTimeout(processMathJax, delay);
        timeoutIds.push(timeoutId);
      }
    };
    
    // Process immediately
    processMathJax();
    
    // Also process after a short delay to handle race conditions
    const timeoutId = setTimeout(processMathJax, 100);
    timeoutIds.push(timeoutId);
    
    return () => {
      mounted = false;
      timeoutIds.forEach(id => clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...dependencies]);
  
  return containerRef;
}

/**
 * Enhanced MathJax hook with loading state
 * @param {Array} dependencies - Array of dependencies that should trigger re-rendering
 * @param {Object} options - Configuration options
 * @returns {Object} { ref, isLoading, error }
 */
export function useMathJaxWithState(dependencies = [], options = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = options.maxRetries || 5;
    let timeoutIds = [];
    
    setIsLoading(true);
    setError(null);
    
    const processMathJax = async () => {
      if (!mounted || !containerRef.current) return;
      
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        try {
          // Clear previous typesetting
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([containerRef.current]);
          }
          
          // Process new content
          await window.MathJax.typesetPromise([containerRef.current]);
          
          if (mounted) {
            setIsLoading(false);
            setError(null);
          }
          
          // Clear timeouts on success
          timeoutIds.forEach(id => clearTimeout(id));
          timeoutIds = [];
        } catch (err) {
          if (!mounted) return;
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
            const timeoutId = setTimeout(processMathJax, delay);
            timeoutIds.push(timeoutId);
          } else {
            if (mounted) {
              setError(err);
              setIsLoading(false);
            }
            console.error('MathJax rendering error after retries:', err);
          }
        }
      } else if (retryCount < maxRetries) {
        // MathJax not ready, retry
        retryCount++;
        const delay = Math.min(100 * Math.pow(1.5, retryCount), 1000);
        const timeoutId = setTimeout(processMathJax, delay);
        timeoutIds.push(timeoutId);
      } else {
        if (mounted) {
          setError(new Error('MathJax not available'));
          setIsLoading(false);
        }
      }
    };
    
    // Process immediately
    processMathJax();
    
    // Also process after a short delay to handle race conditions
    const timeoutId = setTimeout(processMathJax, 100);
    timeoutIds.push(timeoutId);
    
    return () => {
      mounted = false;
      timeoutIds.forEach(id => clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  return { ref: containerRef, isLoading, error };
}

/**
 * Render LaTeX string safely
 * @param {string} latex - LaTeX string to render
 * @param {boolean} inline - Whether to render inline or display mode
 * @returns {Object} Props to spread on the element
 */
export function useLatexString(latex, inline = false) {
  const delimiter = inline ? '\\(' : '\\[';
  const endDelimiter = inline ? '\\)' : '\\]';
  
  return {
    dangerouslySetInnerHTML: { 
      __html: `${delimiter}${latex}${endDelimiter}` 
    }
  };
}
