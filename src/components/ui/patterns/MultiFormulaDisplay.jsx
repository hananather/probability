"use client";
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';
import { VisualizationSection } from '../VisualizationContainer';

/**
 * MultiFormulaDisplay - Extracted from Chapter 7.1 Multiple Formula Representations
 * 
 * Creates the beautiful purple gradient container with interactive formula selection.
 * Based on the exact pattern used in the Multiple Formula Representations section.
 * 
 * @param {Object} props
 * @param {string} props.title - Main title of the display
 * @param {Object} props.formulas - Object with formula definitions
 * @param {string} props.theme - Color theme: 'purple', 'blue', 'teal', 'green'
 * @param {string} props.defaultFormula - Key of default formula to show
 * @param {string} props.note - Bottom note about equivalence
 * @param {string} props.className - Additional CSS classes
 */
export function MultiFormulaDisplay({ 
  title, 
  formulas,
  theme = 'purple',
  defaultFormula,
  note,
  className 
}) {
  const contentRef = useRef(null);
  const [activeFormula, setActiveFormula] = useState(
    defaultFormula || Object.keys(formulas)[0]
  );
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [activeFormula]);

  // Theme configurations - exact gradients from Chapter 7.1
  const themes = {
    purple: {
      gradient: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      border: 'border-purple-500/30',
      title: 'text-purple-400',
      button: 'bg-purple-600',
      buttonHover: 'hover:bg-purple-700',
      ring: 'ring-purple-500/50',
      note: 'text-purple-300'
    },
    blue: {
      gradient: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
      border: 'border-blue-500/30',
      title: 'text-blue-400',
      button: 'bg-blue-600',
      buttonHover: 'hover:bg-blue-700',
      ring: 'ring-blue-500/50',
      note: 'text-blue-300'
    },
    teal: {
      gradient: 'bg-gradient-to-br from-teal-900/20 to-teal-800/20',
      border: 'border-teal-500/30',
      title: 'text-teal-400',
      button: 'bg-teal-600',
      buttonHover: 'hover:bg-teal-700',
      ring: 'ring-teal-500/50',
      note: 'text-teal-300'
    },
    green: {
      gradient: 'bg-gradient-to-br from-green-900/20 to-green-800/20',
      border: 'border-green-500/30',
      title: 'text-green-400',
      button: 'bg-green-600',
      buttonHover: 'hover:bg-green-700',
      ring: 'ring-green-500/50',
      note: 'text-green-300'
    }
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <VisualizationSection className={cn(
      `${currentTheme.gradient} border ${currentTheme.border} rounded-lg p-6`,
      className
    )}>
      <h3 className={`text-xl font-bold mb-6 ${currentTheme.title}`}>
        {title}
      </h3>
      
      <div className="space-y-4">
        {/* Formula Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(formulas).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setActiveFormula(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeFormula === key
                  ? `${currentTheme.button} text-white shadow-md ring-2 ${currentTheme.ring}`
                  : `bg-neutral-700 text-neutral-300 hover:bg-neutral-600 ${currentTheme.buttonHover} hover:text-white`
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        
        {/* Formula Display */}
        <div ref={contentRef} className="bg-neutral-900/50 rounded-lg p-6">
          <h4 className="font-bold text-white mb-2">
            {formulas[activeFormula].name}
          </h4>
          <p className="text-sm text-neutral-400 mb-4">
            {formulas[activeFormula].description}
          </p>
          
          <div className="my-6 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: formulas[activeFormula].formula 
            }} />
          </div>
          
          <p className={`text-sm mt-4 ${currentTheme.note}`}>
            <strong>Key insight:</strong> {formulas[activeFormula].notes}
          </p>
        </div>
        
        {/* Equivalence Note */}
        {note && (
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-sm text-neutral-300">
              <span className="text-yellow-400 font-semibold">Note:</span> {note}
            </p>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
}

/**
 * FormulaDefinition - Helper type for defining formulas
 * 
 * @typedef {Object} FormulaDefinition
 * @property {string} name - Display name of the formula
 * @property {string} description - Brief description
 * @property {string} formula - LaTeX formula string
 * @property {string} notes - Key insight or note
 */

/**
 * createCorrelationFormulas - Pre-built correlation coefficient formulas
 * Ready to use with MultiFormulaDisplay
 */
export const createCorrelationFormulas = () => ({
  definition: {
    name: 'Definition Formula',
    description: 'The original mathematical definition',
    formula: `\\[r = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_{i=1}^{n}(x_i - \\bar{x})^2 \\sum_{i=1}^{n}(y_i - \\bar{y})^2}}\\]`,
    notes: 'Measures covariation relative to individual variations'
  },
  computational: {
    name: 'Computational Formula',
    description: 'More efficient for calculations',
    formula: `\\[r = \\frac{n\\sum x_i y_i - \\sum x_i \\sum y_i}{\\sqrt{[n\\sum x_i^2 - (\\sum x_i)^2][n\\sum y_i^2 - (\\sum y_i)^2]}}\\]`,
    notes: 'Avoids computing means explicitly'
  },
  zscore: {
    name: 'Z-Score Formula',
    description: 'Shows correlation as average product of z-scores',
    formula: `\\[r = \\frac{1}{n-1}\\sum_{i=1}^{n}\\left(\\frac{x_i - \\bar{x}}{s_x}\\right)\\left(\\frac{y_i - \\bar{y}}{s_y}\\right) = \\frac{1}{n-1}\\sum_{i=1}^{n}z_{x_i}z_{y_i}\\]`,
    notes: 'Emphasizes that r is dimensionless'
  },
  covariance: {
    name: 'Covariance Form',
    description: 'Normalized covariance',
    formula: `\\[r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\cdot \\sigma_Y} = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]`,
    notes: 'Shows r as standardized covariance'
  }
});

/**
 * SimpleFormulaSelector - Simplified version without full container
 * 
 * @param {Object} props
 * @param {Object} props.formulas - Formula definitions
 * @param {string} props.defaultFormula - Default formula key
 * @param {string} props.theme - Color theme
 */
export function SimpleFormulaSelector({ formulas, defaultFormula, theme = 'purple' }) {
  const contentRef = useRef(null);
  const [activeFormula, setActiveFormula] = useState(
    defaultFormula || Object.keys(formulas)[0]
  );
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [activeFormula]);

  const themeColors = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    teal: 'bg-teal-600',
    green: 'bg-green-600'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(formulas).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => setActiveFormula(key)}
            className={`px-3 py-1 text-sm rounded transition-all ${
              activeFormula === key
                ? `${themeColors[theme]} text-white`
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="bg-neutral-900/50 rounded p-4">
        <div className="text-center">
          <span dangerouslySetInnerHTML={{ 
            __html: formulas[activeFormula].formula 
          }} />
        </div>
      </div>
    </div>
  );
}