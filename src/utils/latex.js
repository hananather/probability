// Utility functions for LaTeX rendering in React components
import { useMathJax as useSharedMathJax } from '@/hooks/useMathJax';
import { getMathJaxRuntime } from '@/lib/mathjax/runtime';

/**
 * Process MathJax for a given element
 * @param {HTMLElement} element - The DOM element containing LaTeX
 * @param {number} delay - Retained compatibility argument; readiness is shared
 * @returns {Promise} - Resolves when MathJax processing is complete
 */
export const processMathJax = (element, delay = 100) => {
  void delay;
  if (!element || typeof window === 'undefined') return Promise.resolve({ status: 'cancelled' });
  return getMathJaxRuntime().enqueue(element).promise;
};

/**
 * React hook for processing MathJax
 * @param {React.RefObject} ref - React ref to the element containing LaTeX
 * @param {Array} deps - Dependencies array for re-processing
 * @param {number} delay - Retained compatibility argument; readiness is shared
 */
export const useMathJax = (ref, deps = [], delay = 100) => {
  void delay;
  return useSharedMathJax(ref, deps);
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
