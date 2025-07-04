import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { colors, typography } from '@/lib/design-system';
import { useMathJax } from '@/hooks/useMathJax';

/**
 * Standardized WorkedExample component for consistent styling and MathJax rendering
 * @param {Object} props
 * @param {string} props.title - Title of the worked example
 * @param {React.ReactNode} props.children - Content of the example
 * @param {string} [props.className] - Additional classes
 * @param {Array} [props.dependencies=[]] - Dependencies for MathJax re-rendering
 * @param {string} [props.variant="default"] - Visual variant: "default", "compact", "highlight"
 */
export function WorkedExample({ 
  title, 
  children, 
  className,
  dependencies = [],
  variant = "default"
}) {
  const mathJaxRef = useMathJax(dependencies);
  
  const variants = {
    default: {
      container: "bg-neutral-800 p-6 rounded-lg",
      title: "text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white",
      content: "text-neutral-200"
    },
    compact: {
      container: "bg-neutral-800 p-4 rounded-lg",
      title: "text-base font-semibold border-b border-neutral-600 pb-2 mb-3 text-white",
      content: "text-neutral-200 text-sm"
    },
    highlight: {
      container: "bg-neutral-800 p-6 rounded-lg border-2 border-yellow-600/50",
      title: "text-lg font-semibold border-b border-yellow-600/50 pb-2 mb-4 text-yellow-400",
      content: "text-neutral-200"
    }
  };
  
  const styles = variants[variant] || variants.default;
  
  return (
    <div 
      ref={mathJaxRef}
      className={cn(styles.container, className)}
    >
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

/**
 * Section within a worked example
 */
export function ExampleSection({ title, children, className }) {
  return (
    <div className={cn("mb-4", className)}>
      {title && (
        <p className="mb-2 font-medium text-purple-400">{title}</p>
      )}
      {children}
    </div>
  );
}

/**
 * Formula display within worked example
 * Properly handles LaTeX rendering with MathJax processing
 * 
 * Usage:
 *   <Formula latex="E[X] = \mu" />  // For LaTeX strings
 *   <Formula>{content}</Formula>    // For JSX content with LaTeX
 */
export function Formula({ children, latex, className, inline = false }) {
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
  }, [children, latex]);
  
  // If latex prop is provided, render it properly with delimiters
  if (latex) {
    const delimiter = inline ? '\\(' : '\\[';
    const endDelimiter = inline ? '\\)' : '\\]';
    
    return (
      <div 
        ref={contentRef} 
        className={cn(inline ? "inline-block" : "my-4 text-center", className)}
        dangerouslySetInnerHTML={{ 
          __html: `${delimiter}${latex}${endDelimiter}` 
        }}
      />
    );
  }
  
  // Otherwise render children (for JSX content that may contain LaTeX)
  return (
    <div ref={contentRef} className={cn("my-4 text-center", className)}>
      {children}
    </div>
  );
}

/**
 * Key insight or note box
 */
export function InsightBox({ children, icon = "💡", variant = "default", className }) {
  const variants = {
    default: "bg-neutral-900 border-neutral-700",
    info: "bg-blue-900/20 border-blue-600/30",
    warning: "bg-amber-900/20 border-amber-600/30",
    success: "bg-green-900/20 border-green-600/30",
    error: "bg-red-900/20 border-red-600/30"
  };
  
  return (
    <div className={cn(
      "p-3 rounded border text-sm",
      variants[variant] || variants.default,
      className
    )}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </div>
  );
}

/**
 * Calculation steps display
 */
export function CalculationSteps({ steps, className }) {
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
  }, [steps]);
  
  return (
    <div ref={contentRef} className={cn("space-y-3", className)}>
      {steps.map((step, index) => {
        // Handle both string and object formats
        if (typeof step === 'string') {
          return (
            <div key={index} className="font-mono text-sm">
              {step}
            </div>
          );
        }
        
        // Handle object format with label, content, and explanation
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-neutral-300">{step.label}:</span>
              <div className="flex-1">
                <div className="font-mono text-sm text-neutral-100">
                  <span dangerouslySetInnerHTML={{ __html: step.content }} />
                </div>
                {step.explanation && (
                  <div className="text-sm text-neutral-400 mt-1">
                    {step.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Real-world example box
 */
export function RealWorldExample({ title = "Real-world Example:", children, className }) {
  return (
    <InsightBox variant="info" icon="🌍" className={className}>
      <p className="text-yellow-400 font-medium mb-1">{title}</p>
      <div className="text-neutral-300">
        {children}
      </div>
    </InsightBox>
  );
}

/**
 * Step component for step-by-step solutions
 */
export function Step({ number, description, children, className }) {
  return (
    <div className={cn("mb-4 p-4 bg-neutral-900 rounded-lg border border-neutral-700", className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {number}
          </div>
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-white mb-2">{description}</h5>
          <div className="text-neutral-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}