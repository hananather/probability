"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';
import { VisualizationSection } from '../VisualizationContainer';

/**
 * StatisticalTestCard - Extracted from Chapter 7.1 Testing Statistical Significance
 * 
 * Creates the beautiful blue gradient container for statistical hypothesis testing.
 * Based on the exact pattern used in the Statistical Significance section.
 * 
 * @param {Object} props
 * @param {string} props.title - Main title of the test
 * @param {React.ReactNode} props.children - Test components
 * @param {string} props.theme - Color theme: 'blue', 'purple', 'teal', 'green'
 * @param {string} props.className - Additional CSS classes
 */
export function StatisticalTestCard({ 
  title, 
  children, 
  theme = 'blue',
  className 
}) {
  // Theme configurations - exact gradients from Chapter 7.1
  const themes = {
    blue: {
      gradient: 'bg-gradient-to-br from-blue-900/20 to-blue-800/20',
      border: 'border-blue-500/30',
      title: 'text-blue-400'
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      border: 'border-purple-500/30',
      title: 'text-purple-400'
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

  const currentTheme = themes[theme] || themes.blue;

  return (
    <VisualizationSection className={cn(
      `${currentTheme.gradient} border ${currentTheme.border} rounded-lg p-6`,
      className
    )}>
      <h3 className={`text-xl font-bold mb-6 ${currentTheme.title}`}>
        {title}
      </h3>
      
      <div className="space-y-6">
        {children}
      </div>
    </VisualizationSection>
  );
}

/**
 * HypothesisSetup - Component for hypothesis test setup
 * 
 * @param {Object} props
 * @param {string} props.nullHypothesis - H₀ hypothesis in LaTeX
 * @param {string} props.alternativeHypothesis - H₁ hypothesis in LaTeX  
 * @param {string} props.description - Description of what we're testing
 * @param {string} props.theme - Color theme to match parent
 */
export function HypothesisSetup({ 
  nullHypothesis, 
  alternativeHypothesis, 
  description,
  theme = 'blue'
}) {
  const contentRef = useRef(null);
  
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
  }, [nullHypothesis, alternativeHypothesis]);

  const themeColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    teal: 'text-teal-400',
    green: 'text-green-400'
  };

  return (
    <div className="bg-neutral-900/50 rounded-lg p-4">
      <h4 className="font-bold text-white mb-3">Hypothesis Test for Correlation</h4>
      <div className="text-sm text-neutral-300 space-y-2">
        {description && <p className="mb-3">{description}</p>}
        <div ref={contentRef} className="bg-neutral-800/50 rounded p-3 space-y-2">
          <p>
            <strong className={themeColors[theme]}>Null hypothesis:</strong>{' '}
            <span dangerouslySetInnerHTML={{ __html: `\\(${nullHypothesis}\\)` }} />
          </p>
          <p>
            <strong className={themeColors[theme]}>Alternative hypothesis:</strong>{' '}
            <span dangerouslySetInnerHTML={{ __html: `\\(${alternativeHypothesis}\\)` }} />
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * TestStatistic - Component for test statistic calculation
 * 
 * @param {Object} props
 * @param {string} props.title - Title (e.g., "Test Statistic")
 * @param {string} props.description - Description of the statistic
 * @param {string} props.formula - LaTeX formula
 * @param {string} props.calculation - Actual calculation with values
 * @param {string} props.note - Additional note about degrees of freedom, etc.
 * @param {string} props.theme - Color theme
 */
export function TestStatistic({ 
  title = "Test Statistic", 
  description, 
  formula, 
  calculation, 
  note,
  theme = 'blue'
}) {
  const contentRef = useRef(null);
  
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
  }, [formula, calculation]);

  const themeColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400', 
    teal: 'text-teal-400',
    green: 'text-green-400'
  };

  return (
    <div className="bg-neutral-900/50 rounded-lg p-4">
      <h4 className="font-bold text-white mb-3">{title}</h4>
      <div ref={contentRef} className="text-sm text-neutral-300 space-y-3">
        {description && <p>{description}</p>}
        {formula && (
          <div className={`text-center my-4 ${themeColors[theme]}`}>
            <span dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
          </div>
        )}
        {calculation && (
          <>
            <p>For our data:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[${calculation}\\]` }} />
            </div>
          </>
        )}
        {note && (
          <p className="text-xs text-neutral-400">{note}</p>
        )}
      </div>
    </div>
  );
}

/**
 * SignificanceResults - Component for displaying test results
 * 
 * @param {Object} props
 * @param {Array} props.levels - Array of significance levels with results
 * @param {string} props.conclusion - Overall conclusion
 * @param {string} props.theme - Color theme
 */
export function SignificanceResults({ levels, conclusion, theme = 'blue' }) {
  return (
    <div className="bg-neutral-900/50 rounded-lg p-4">
      <h4 className="font-bold text-white mb-3">Results at Common Significance Levels</h4>
      <div className="text-sm text-neutral-300 space-y-3">
        {levels && levels.map((level, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-neutral-800/50 rounded">
            <span>α = {level.alpha}:</span>
            <span className={level.isSignificant ? 'text-green-400' : 'text-red-400'}>
              {level.isSignificant ? 'Significant' : 'Not Significant'}
            </span>
          </div>
        ))}
        
        {conclusion && (
          <div className="mt-4 p-3 bg-neutral-800/50 rounded">
            <p><strong>Conclusion:</strong> {conclusion}</p>
          </div>
        )}
      </div>
    </div>
  );
}