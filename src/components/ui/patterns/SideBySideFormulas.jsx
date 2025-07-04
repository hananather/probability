"use client";
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';
import { Button } from '../button';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * SideBySideFormulas - Extracted from Chapter 7 Design Patterns
 * 
 * Creates the beautiful purple gradient container with side-by-side formula comparison.
 * Based on the exact "Multiple Formula Representations" pattern you love.
 * 
 * @param {Object} props
 * @param {string} props.title - Main title
 * @param {Array} props.formulas - Array of formula objects
 * @param {boolean} props.defaultExpanded - Whether to show formulas by default
 * @param {string} props.theme - Color theme: 'purple', 'blue', 'teal', 'green'
 * @param {string} props.className - Additional CSS classes
 */
export function SideBySideFormulas({ 
  title, 
  formulas,
  defaultExpanded = false,
  theme = 'purple',
  className 
}) {
  const [showDetails, setShowDetails] = useState(defaultExpanded);
  const mathRef = useRef(null);
  
  // MathJax processing - exact pattern from Chapter 7
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([mathRef.current]);
        }
        window.MathJax.typesetPromise([mathRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showDetails]);

  // Theme configurations - exact gradients from Chapter 7
  const themes = {
    purple: {
      gradient: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      border: 'border-purple-500/30',
      title: 'text-purple-400'
    },
    blue: {
      gradient: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
      border: 'border-blue-500/30',
      title: 'text-blue-400'
    },
    teal: {
      gradient: 'bg-gradient-to-br from-teal-900/20 to-teal-800/20',
      border: 'border-teal-500/30',
      title: 'text-teal-400'
    },
    green: {
      gradient: 'bg-gradient-to-br from-green-900/20 to-green-800/20',
      border: 'border-green-500/30',
      title: 'text-green-400'
    }
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <div className={cn(
      `${currentTheme.gradient} border ${currentTheme.border} rounded-lg p-6`,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-semibold ${currentTheme.title}`}>
          {title}
        </h4>
        <Button
          variant="neutral"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>
      
      {showDetails && (
        <div ref={mathRef} className="space-y-4 text-neutral-200">
          <div className={cn(
            "grid gap-4",
            formulas.length === 2 ? "md:grid-cols-2" : 
            formulas.length === 3 ? "md:grid-cols-3" : 
            "md:grid-cols-2"
          )}>
            {formulas.map((formula, index) => (
              <div key={index} className="bg-neutral-900/50 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{formula.title}</h5>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ __html: formula.latex }} />
                </div>
                {formula.description && (
                  <p className="text-xs text-neutral-400 mt-2">{formula.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * createCorrelationSideBySide - Pre-built correlation coefficient comparison
 * Ready to use with SideBySideFormulas
 */
export const createCorrelationSideBySide = () => ({
  title: "Multiple Formula Representations",
  formulas: [
    {
      title: "Conceptual Formula",
      latex: `\\[r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}\\]`,
      description: "Shows the relationship as covariation over individual variations"
    },
    {
      title: "Computational Formula", 
      latex: `\\[r = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]`,
      description: "More efficient for calculations, uses sums of squares"
    }
  ]
});

/**
 * createRegressionSideBySide - Regression equation comparison
 */
export const createRegressionSideBySide = () => ({
  title: "Regression Equation Forms",
  formulas: [
    {
      title: "Sample Regression Line",
      latex: `\\[\\hat{y} = b_0 + b_1 x\\]`,
      description: "Estimated line from sample data"
    },
    {
      title: "Population Regression Line",
      latex: `\\[E[Y|X=x] = \\beta_0 + \\beta_1 x\\]`,
      description: "True relationship in the population"
    }
  ]
});

/**
 * createVarianceSideBySide - Variance formulas comparison
 */
export const createVarianceSideBySide = () => ({
  title: "Variance Calculations",
  formulas: [
    {
      title: "Population Variance",
      latex: `\\[\\sigma^2 = \\frac{\\sum(x_i - \\mu)^2}{N}\\]`,
      description: "True variance using population mean"
    },
    {
      title: "Sample Variance",
      latex: `\\[s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}\\]`,
      description: "Unbiased estimator using sample mean"
    }
  ]
});

/**
 * StaticFormulaGrid - Simplified version without toggle
 * 
 * @param {Object} props
 * @param {string} props.title - Grid title
 * @param {Array} props.formulas - Formula objects
 * @param {string} props.theme - Color theme
 */
export function StaticFormulaGrid({ title, formulas, theme = 'purple', className }) {
  const mathRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([mathRef.current]);
        }
        window.MathJax.typesetPromise([mathRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const themes = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    teal: 'text-teal-400',
    green: 'text-green-400'
  };

  return (
    <div className={cn("bg-neutral-800/30 rounded-lg p-6", className)}>
      <h3 className={`text-xl font-bold mb-6 ${themes[theme] || themes.purple}`}>
        {title}
      </h3>
      <div ref={mathRef} className={cn(
        "grid gap-4",
        formulas.length === 2 ? "md:grid-cols-2" : 
        formulas.length === 3 ? "md:grid-cols-3" : 
        "md:grid-cols-2"
      )}>
        {formulas.map((formula, index) => (
          <div key={index} className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-2">{formula.title}</h5>
            <div className="text-center text-neutral-200">
              <span dangerouslySetInnerHTML={{ __html: formula.latex }} />
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