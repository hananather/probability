"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';

/**
 * SimpleFormulaCard - Ultra-simple reusable formula card
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.formula - LaTeX formula (without delimiters)
 * @param {string} props.description - Optional description
 * @param {string} props.theme - Color: 'teal', 'blue', 'purple', 'green', 'yellow'
 */
export function SimpleFormulaCard({ title, formula, description, theme = 'teal', className }) {
  const contentRef = useRef(null);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [formula]);

  const themeColors = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div ref={contentRef} className={cn("bg-neutral-900/50 rounded-lg p-4", className)}>
      <h4 className={`font-bold text-white mb-3`}>{title}</h4>
      <div className={`text-center my-3 ${themeColors[theme]} overflow-x-auto`}>
        <span dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
      {description && (
        <p className="text-xs text-neutral-400">{description}</p>
      )}
    </div>
  );
}

/**
 * SimpleInsightBox - Ultra-simple insight/conclusion box
 * 
 * @param {Object} props
 * @param {string} props.title - Box title
 * @param {React.ReactNode} props.children - Content
 * @param {string} props.theme - Color: 'teal', 'blue', 'green', 'orange', 'red'
 */
export function SimpleInsightBox({ title = "Insight", children, theme = 'teal', className }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [children]);

  const themes = {
    teal: {
      gradient: 'bg-gradient-to-br from-teal-900/20 to-teal-800/20',
      border: 'border-teal-500/30',
      title: 'text-teal-400'
    },
    blue: {
      gradient: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
      border: 'border-blue-500/30',
      title: 'text-blue-400'
    },
    green: {
      gradient: 'bg-gradient-to-br from-green-900/20 to-green-800/20',
      border: 'border-green-500/30',
      title: 'text-green-400'
    },
    orange: {
      gradient: 'bg-gradient-to-br from-orange-900/20 to-orange-800/20',
      border: 'border-orange-500/30',
      title: 'text-orange-400'
    },
    red: {
      gradient: 'bg-gradient-to-br from-red-900/20 to-red-800/20',
      border: 'border-red-500/30',
      title: 'text-red-400'
    }
  };

  const currentTheme = themes[theme] || themes.teal;

  return (
    <div ref={contentRef} className={cn(
      `${currentTheme.gradient} border ${currentTheme.border} rounded-lg p-4`,
      className
    )}>
      <h4 className={`font-bold mb-3 ${currentTheme.title}`}>{title}</h4>
      <div className="text-sm text-neutral-300">
        {children}
      </div>
    </div>
  );
}

/**
 * SimpleFormulaGrid - Grid of formulas side-by-side
 * 
 * @param {Object} props
 * @param {string} props.title - Grid title  
 * @param {Array} props.formulas - Array of {title, formula, description}
 * @param {string} props.theme - Color theme
 */
export function SimpleFormulaGrid({ title, formulas, theme = 'purple', className }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const themeColors = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    teal: 'text-teal-400',
    green: 'text-green-400'
  };

  return (
    <div ref={contentRef} className={cn("bg-neutral-800/30 rounded-lg p-6", className)}>
      {title && (
        <h3 className={`text-xl font-bold mb-6 ${themeColors[theme]}`}>{title}</h3>
      )}
      <div className={cn(
        "grid gap-4",
        formulas.length === 2 ? "md:grid-cols-2" : 
        formulas.length === 3 ? "md:grid-cols-3" : 
        "md:grid-cols-2"
      )}>
        {formulas.map((formula, index) => (
          <div key={index} className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-2">{formula.title}</h5>
            <div className="text-center text-neutral-200 overflow-x-auto">
              <span dangerouslySetInnerHTML={{ __html: `\\[${formula.formula}\\]` }} />
            </div>
            {formula.description && (
              <p className="text-xs text-neutral-400 mt-2">{formula.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SimpleCalculationBox - Single calculation step
 * 
 * @param {Object} props
 * @param {string} props.title - Step title
 * @param {string} props.formula - LaTeX formula
 * @param {string} props.explanation - Optional explanation
 */
export function SimpleCalculationBox({ title, formula, explanation, className }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [formula]);

  return (
    <div ref={contentRef} className={cn("bg-neutral-900/50 rounded-lg p-4", className)}>
      <h4 className="font-bold text-white mb-3">{title}</h4>
      <div className="text-center my-3 overflow-x-auto">
        <span dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
      {explanation && (
        <p className="text-sm text-neutral-400">{explanation}</p>
      )}
    </div>
  );
}

// Pre-built common formulas for easy copy-paste
export const commonFormulas = {
  correlation: "r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}",
  mean: "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i",
  variance: "s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}",
  standardDev: "s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}",
  regression: "\\hat{y} = b_0 + b_1 x",
  tStat: "t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}}"
};