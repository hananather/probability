"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useMathJaxProcessor } from '../MathJaxProvider';

/**
 * WorkedExampleContainer V3 - More reliable MathJax rendering
 * 
 * This version uses a different strategy:
 * 1. Renders LaTeX content as plain text first
 * 2. Processes MathJax after content is stable in DOM
 * 3. Uses keys to force full re-render when content changes
 */
export const WorkedExampleContainer = ({ 
  title = "Worked Example",
  children,
  className = "",
  style = {}
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef(null);
  const { processMathJax } = useMathJaxProcessor();
  const [renderKey, setRenderKey] = useState(0);
  
  // Generate a content hash to detect real changes
  const contentHash = useMemo(() => {
    return JSON.stringify(children);
  }, [children]);
  
  // Track previous hash to detect changes
  const prevHashRef = useRef(contentHash);
  
  useEffect(() => {
    // Only update if content actually changed
    if (prevHashRef.current !== contentHash) {
      prevHashRef.current = contentHash;
      setIsUpdating(true);
      
      // Force a new render with new key
      setRenderKey(prev => prev + 1);
      
      // Process after DOM updates
      const timer = setTimeout(() => {
        if (containerRef.current) {
          processMathJax(containerRef.current).then(() => {
            setIsUpdating(false);
          });
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [contentHash, processMathJax]);
  
  // Initial render
  useEffect(() => {
    if (containerRef.current) {
      processMathJax(containerRef.current);
    }
  }, [processMathJax]);
  
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
        ref={containerRef}
        key={renderKey}
        style={{
          opacity: isUpdating ? 0.5 : 1,
          transition: 'opacity 200ms ease-in-out'
        }}
      >
        {children}
      </div>
      
      {isUpdating && (
        <div 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2A303C',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            color: '#71717a',
            fontSize: '0.875rem',
            fontStyle: 'italic',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Updating equations...
        </div>
      )}
    </div>
  );
};

/**
 * Step component - same as before
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
 * LaTeX equation wrapper - same as before
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