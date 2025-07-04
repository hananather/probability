"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';

/**
 * InterpretationBox - Extracted from Chapter 7.1 Fuel Quality Example
 * 
 * Creates beautiful gradient interpretation boxes with proper MathJax handling.
 * Based on the exact teal interpretation pattern from the step-by-step calculation.
 * 
 * @param {Object} props
 * @param {string} props.title - Box title (default: "Interpretation")
 * @param {React.ReactNode} props.children - Content of the interpretation
 * @param {string} props.theme - Color theme: 'teal', 'blue', 'green', 'purple', 'orange', 'red'
 * @param {string} props.className - Additional CSS classes
 */
export function InterpretationBox({ 
  title = "Interpretation", 
  children, 
  theme = 'teal',
  className 
}) {
  const contentRef = useRef(null);
  
  // MathJax processing - exact pattern from Chapter 7.1
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

  // Theme configurations - exact gradients from Chapter 7.1
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
    purple: {
      gradient: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
      border: 'border-purple-500/30',
      title: 'text-purple-400'
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
    <div className={cn(
      `${currentTheme.gradient} border ${currentTheme.border} rounded-lg p-4`,
      className
    )}>
      <h4 className={`font-bold mb-3 ${currentTheme.title}`}>{title}</h4>
      <div ref={contentRef} className="text-sm text-neutral-300 space-y-2">
        {children}
      </div>
    </div>
  );
}

/**
 * StepInterpretation - Specialized interpretation for step-by-step calculations
 * 
 * @param {Object} props
 * @param {string|number} props.result - The calculated result to highlight
 * @param {string} props.strength - Descriptive strength ("very strong positive", etc.)
 * @param {string} props.meaning - What the result means in context
 * @param {string} props.note - Additional note (like causation warning)
 * @param {string} props.theme - Color theme
 */
export function StepInterpretation({ result, strength, meaning, note, theme = 'teal' }) {
  return (
    <InterpretationBox title="Interpretation" theme={theme}>
      <p>
        With <span dangerouslySetInnerHTML={{ __html: `\\(r = ${result}\\)` }} />, 
        we have a <strong className={`${theme === 'teal' ? 'text-teal-400' : `text-${theme}-400`}`}>
          {strength}
        </strong> linear relationship.
      </p>
      {meaning && (
        <p className="mt-2">{meaning}</p>
      )}
      {note && (
        <p className="text-yellow-400 mt-3">
          <strong>Note:</strong> {note}
        </p>
      )}
    </InterpretationBox>
  );
}