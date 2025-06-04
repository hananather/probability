"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useMathJaxQueue } from '../../hooks/useMathJaxQueue';

/**
 * Final WorkedExampleContainer with queue-based MathJax processing
 * 
 * This approach:
 * 1. Uses a global queue to prevent concurrent MathJax processing
 * 2. Batches updates for better performance
 * 3. Only re-processes when content actually changes
 */
export const WorkedExampleContainer = ({ 
  title = "Worked Example",
  children,
  className = "",
  style = {}
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { queueProcess, isReady, elementRef } = useMathJaxQueue();
  
  // Create a stable content hash
  const contentHash = useMemo(() => {
    // Convert children to string for comparison
    const childrenString = React.Children.toArray(children)
      .map((child, index) => {
        if (React.isValidElement(child)) {
          // Create a simple hash from key props without circular references
          const { key, type } = child;
          const typeName = typeof type === 'string' ? type : type?.name || 'Component';
          // Extract simple values from props, avoiding complex objects
          const simpleProps = {};
          if (child.props) {
            Object.keys(child.props).forEach(k => {
              const val = child.props[k];
              if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                simpleProps[k] = val;
              }
            });
          }
          return `${index}-${typeName}-${key || ''}-${JSON.stringify(simpleProps)}`;
        }
        return String(child);
      })
      .join('|');
    return childrenString;
  }, [children]);
  
  useEffect(() => {
    if (!elementRef.current || !isReady) return;
    
    setIsUpdating(true);
    
    queueProcess(elementRef.current, contentHash)
      .then(() => {
        setIsUpdating(false);
      });
  }, [contentHash, queueProcess, isReady]);
  
  return (
    <div
      style={{
        backgroundColor: '#2A303C',
        padding: '1.5rem',
        borderRadius: '8px',
        color: '#e0e0e0',
        width: '100%',
        maxWidth: '768px',
        marginTop: '1.5rem',
        overflowX: 'auto',
        fontFamily: 'var(--font-sans)',
        minHeight: '200px',
        position: 'relative',
        ...style
      }}
      className={`text-sm ${className}`}
    >
      <h4 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        borderBottom: '1px solid #4A5568', 
        paddingBottom: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        {title}
      </h4>
      
      <div 
        ref={elementRef}
        style={{
          opacity: isUpdating ? 0.7 : 1,
          transition: 'opacity 150ms ease-in-out'
        }}
      >
        {children}
      </div>
      
      {isUpdating && (
        <div 
          style={{ 
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(42, 48, 60, 0.9)',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            color: '#71717a',
            fontSize: '0.75rem',
            fontStyle: 'italic'
          }}
        >
          Updating...
        </div>
      )}
    </div>
  );
};

/**
 * Step component
 */
export const WorkedExampleStep = ({ stepNumber, label, children }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ 
        marginBottom: '0.25rem', 
        fontWeight: '500',
        color: '#e0e0e0'
      }}>
        {stepNumber}. {label}
      </p>
      <div style={{ paddingLeft: '1rem' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * LaTeX equation wrapper
 */
export const LaTeXEquation = ({ equation, block = true }) => {
  if (block) {
    return (
      <div 
        style={{ margin: '0.5rem 0' }}
        dangerouslySetInnerHTML={{ __html: `\\[${equation}\\]` }} 
      />
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: `\\(${equation}\\)` }} />;
};