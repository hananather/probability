import React from 'react';
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
 */
export function Formula({ children, className }) {
  return (
    <div className={cn("my-2", className)}>
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
  return (
    <div className={cn("space-y-1", className)}>
      {steps.map((step, index) => (
        <div key={index} className="font-mono text-sm">
          {step}
        </div>
      ))}
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