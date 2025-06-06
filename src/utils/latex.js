// Utility functions for LaTeX rendering in React components
import { useEffect } from 'react';

/**
 * Process MathJax for a given element
 * @param {HTMLElement} element - The DOM element containing LaTeX
 * @param {number} delay - Optional delay before processing (default: 100ms)
 * @returns {Promise} - Resolves when MathJax processing is complete
 */
export const processMathJax = (element, delay = 100) => {
  return new Promise((resolve) => {
    const process = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && element) {
        // Clear previous rendering
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
        
        // Process the element
        window.MathJax.typesetPromise([element])
          .then(() => resolve())
          .catch((err) => {
            console.error('MathJax processing error:', err);
            resolve();
          });
      } else {
        resolve();
      }
    };
    
    // Try immediately
    process();
    
    // Also try after delay to handle race conditions
    if (delay > 0) {
      setTimeout(process, delay);
    }
  });
};

/**
 * React hook for processing MathJax
 * @param {React.RefObject} ref - React ref to the element containing LaTeX
 * @param {Array} deps - Dependencies array for re-processing
 * @param {number} delay - Optional delay before processing
 */
export const useMathJax = (ref, deps = [], delay = 100) => {
  useEffect(() => {
    if (ref.current) {
      processMathJax(ref.current, delay);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * Format inline LaTeX expression
 * @param {string} latex - The LaTeX expression
 * @returns {string} - Properly formatted inline LaTeX
 */
export const inlineMath = (latex) => `\\(${latex}\\)`;

/**
 * Format block LaTeX expression
 * @param {string} latex - The LaTeX expression
 * @returns {string} - Properly formatted block LaTeX
 */
export const blockMath = (latex) => `\\[${latex}\\]`;

/**
 * Create a LaTeX-ready span element
 * @param {string} latex - The LaTeX expression
 * @param {boolean} block - Whether it's a block equation
 * @returns {Object} - Props object for dangerouslySetInnerHTML
 */
export const latexHTML = (latex, block = false) => ({
  dangerouslySetInnerHTML: { 
    __html: block ? blockMath(latex) : inlineMath(latex) 
  }
});

// Standard LaTeX formatting patterns for common expressions
export const latex = {
  // Greek letters
  mu: '\\mu',
  sigma: '\\sigma',
  lambda: '\\lambda',
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  theta: '\\theta',
  
  // Common expressions
  expectation: (X = 'X') => `E[${X}]`,
  variance: (X = 'X') => `\\text{Var}(${X})`,
  probability: (expr) => `P(${expr})`,
  integral: (a, b, expr) => `\\int_{${a}}^{${b}} ${expr} \\, dx`,
  sum: (i, n, expr) => `\\sum_{${i}=1}^{${n}} ${expr}`,
  
  // Distributions
  normal: (mu = '\\mu', sigma = '\\sigma') => `N(${mu}, ${sigma}^2)`,
  exponential: (lambda = '\\lambda') => `\\text{Exp}(${lambda})`,
  binomial: (n = 'n', p = 'p') => `\\text{Bin}(${n}, ${p})`,
  
  // Common formulas
  normalPDF: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
  exponentialPDF: 'f(x) = \\lambda e^{-\\lambda x}',
};