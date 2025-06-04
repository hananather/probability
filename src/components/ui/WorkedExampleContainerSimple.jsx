"use client";
import React, { useEffect, useRef } from "react";

/**
 * Simple WorkedExampleContainer based on IntegralWorkedExample approach
 * No fancy state management - just direct MathJax processing
 */
export const WorkedExampleContainer = ({ 
  title = "Worked Example",
  children,
  className = "",
  style = {}
}) => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      // Clear and re-process MathJax
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([contentRef.current]);
      }
      window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
        console.error('MathJax error in WorkedExampleContainer:', err);
      });
    }
  });
  
  return (
    <div
      ref={contentRef}
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
      {children}
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