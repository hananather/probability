import { useEffect, useRef } from 'react';

/**
 * Custom hook for MathJax rendering with proper cleanup and error handling
 * @param {Array} dependencies - Array of dependencies that should trigger re-rendering
 * @returns {Object} ref - Ref to attach to the container element
 */
export function useMathJax(dependencies = []) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    let mounted = true;
    
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
        } catch (err) {
          console.error('MathJax rendering error:', err);
        }
      }
    };
    
    // Process immediately
    processMathJax();
    
    // Also process after a short delay to handle race conditions
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  return containerRef;
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