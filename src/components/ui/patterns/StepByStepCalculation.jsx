"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';
import { VisualizationSection } from '../VisualizationContainer';

/**
 * StepByStepCalculation - Extracted from Chapter 7.1 Fuel Quality Example
 * 
 * Creates the beautiful purple gradient container with step-by-step calculation layout.
 * Based on the exact pattern used in the Fuel Quality Example.
 * 
 * @param {Object} props
 * @param {string} props.title - Main title of the calculation
 * @param {React.ReactNode} props.children - Step components
 * @param {string} props.theme - Color theme: 'purple', 'blue', 'teal', 'green'
 * @param {string} props.className - Additional CSS classes
 */
export function StepByStepCalculation({ 
  title, 
  children, 
  theme = 'purple',
  className 
}) {
  // Theme configurations - exact gradients from Chapter 7.1
  const themes = {
    purple: {
      gradient: 'bg-gradient-to-br from-neutral-800/50 to-neutral-900/50',
      border: 'border-neutral-700/50',
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
    <VisualizationSection className={cn(
      `${currentTheme.gradient} rounded-lg p-6 border ${currentTheme.border}`,
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
 * CalculationStep - Individual step within StepByStepCalculation
 * 
 * @param {Object} props
 * @param {string} props.title - Step title
 * @param {React.ReactNode} props.children - Step content
 * @param {string} props.variant - Style variant: 'default', 'nested', 'highlight'
 * @param {string} props.className - Additional CSS classes
 */
export function CalculationStep({ 
  title, 
  children, 
  variant = 'default',
  className 
}) {
  const contentRef = useRef(null);
  
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
  }, [children]);

  const variants = {
    default: 'bg-neutral-900/50',
    nested: 'bg-neutral-800/50', 
    highlight: 'bg-neutral-800/50 ring-1 ring-yellow-500/30'
  };

  return (
    <div className={cn(
      `${variants[variant]} rounded-lg p-4`,
      className
    )}>
      <h4 className="font-bold text-white mb-3">{title}</h4>
      <div ref={contentRef} className="text-sm text-neutral-300 space-y-2">
        {children}
      </div>
    </div>
  );
}

/**
 * NestedCalculation - For calculations within calculations (like in Step 3)
 * 
 * @param {Object} props
 * @param {string} props.label - Calculation label ("For X:", "For Y:", etc.)
 * @param {React.ReactNode} props.children - Calculation content
 */
export function NestedCalculation({ label, children }) {
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
  }, [children]);

  return (
    <div className="bg-neutral-800/50 rounded p-3 mb-4">
      <p className="font-semibold mb-2">{label}</p>
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

/**
 * FormulaDisplay - For centered mathematical formulas in calculations
 * 
 * @param {Object} props
 * @param {string} props.formula - LaTeX formula string (without delimiters)
 * @param {string} props.className - Additional CSS classes
 */
export function FormulaDisplay({ formula, className }) {
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
  }, [formula]);

  return (
    <div ref={contentRef} className={cn("text-center my-2", className)}>
      <span dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
    </div>
  );
}