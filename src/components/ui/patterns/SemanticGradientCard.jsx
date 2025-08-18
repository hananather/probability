"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';

/**
 * SemanticGradientCard - Extracted from Chapter 7.1 Mathematical Framework
 * 
 * Creates beautiful cards with semantic color themes and proper MathJax handling.
 * Based on the exact pattern used in Mathematical Properties of Correlation.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Brief description text
 * @param {string} props.formula - LaTeX formula string (without delimiters)
 * @param {string} props.note - Additional note text below formula
 * @param {string} props.theme - Color theme: 'teal', 'blue', 'yellow', 'green', 'purple', 'neutral'
 * @param {string} props.className - Additional CSS classes
 */
export function SemanticGradientCard({ 
  title, 
  description, 
  formula, 
  note, 
  theme = 'neutral',
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
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [formula]);

  // Theme configurations - exact colors from Chapter 7.1
  const themes = {
    teal: {
      formula: 'text-teal-400',
      title: 'text-white'
    },
    blue: {
      formula: 'text-blue-400', 
      title: 'text-white'
    },
    yellow: {
      formula: 'text-yellow-400',
      title: 'text-white'
    },
    green: {
      formula: 'text-green-400',
      title: 'text-white'
    },
    purple: {
      formula: 'text-purple-400',
      title: 'text-white'
    },
    neutral: {
      formula: 'text-neutral-300',
      title: 'text-white'
    }
  };

  const currentTheme = themes[theme] || themes.neutral;

  return (
    <div ref={contentRef} className={cn("bg-neutral-900/50 rounded-lg p-4", className)}>
      <h4 className={`font-bold mb-3 ${currentTheme.title}`}>{title}</h4>
      <div className="text-sm text-neutral-300">
        {description && <p className="mb-2">{description}</p>}
        {formula && (
          <div className={`text-center my-3 ${currentTheme.formula} overflow-x-auto`}>
            <span dangerouslySetInnerHTML={{ __html: formula }} />
          </div>
        )}
        {note && (
          <p className="text-xs text-neutral-400">
            <span dangerouslySetInnerHTML={{ __html: note }} />
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * SemanticGradientGrid - Container for multiple SemanticGradientCards
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.theme - Overall theme color
 * @param {React.ReactNode} props.children - SemanticGradientCard components
 * @param {string} props.className - Additional CSS classes
 */
export function SemanticGradientGrid({ title, theme = 'teal', children, className }) {
  const contentRef = useRef(null);
  
  // MathJax processing for the grid container
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
  }, [children]);

  const themeColors = {
    teal: 'text-teal-400',
    blue: 'text-blue-400', 
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    neutral: 'text-neutral-400'
  };

  return (
    <div ref={contentRef} className={cn("bg-neutral-800/30 rounded-lg p-6", className)}>
      <h3 className={`text-xl font-bold mb-6 ${themeColors[theme] || themeColors.teal}`}>
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}