"use client";
import React, { useEffect, useState, useRef } from "react";
import { useMathJax } from '@/hooks/useMathJax';

/**
 * Unified WorkedExampleContainer with IntegralWorkedExample styling and anti-flash
 * 
 * Features:
 * - Consistent styling matching IntegralWorkedExample
 * - Smart rendering to prevent LaTeX flash
 * - Shows "Updating..." during transitions
 * - Smooth opacity transitions
 * - Reusable for all worked examples
 */
export const WorkedExampleContainer = ({ 
  title = "Worked Example",
  children,
  className = "",
  style = {}
}) => {
  const [isStable, setIsStable] = useState(true);
  const [displayContent, setDisplayContent] = useState(children);
  const updateTimerRef = useRef(null);
  const contentRef = useRef(null);
  useMathJax(contentRef, [displayContent]);

  // Handle content updates
  useEffect(() => {
    // Clear any pending update
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    // Mark as unstable immediately when content changes
    setIsStable(false);
    
    // Debounce the content update
    updateTimerRef.current = setTimeout(() => {
      // Update display content
      setDisplayContent(children);
      
      // Show content immediately
      setIsStable(true);

    }, 150); // Short delay to batch rapid updates
    
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [children]);
  
  return (
    <div
      style={{
        backgroundColor: '#2A303C', // Matching IntegralWorkedExample
        padding: '1.5rem',
        borderRadius: '8px',
        color: '#e0e0e0',
        width: '100%',
        maxWidth: '768px',
        marginTop: '1.5rem',
        overflowX: 'auto',
        fontFamily: 'var(--font-sans)',
        minHeight: '200px', // Prevent layout shift
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
      
      {/* Content wrapper with smooth transition */}
      <div
        ref={contentRef}
        style={{
          opacity: isStable ? 1 : 0,
          transition: 'opacity 150ms ease-in-out',
          visibility: isStable ? 'visible' : 'hidden',
          position: isStable ? 'relative' : 'absolute',
          width: '100%'
        }}
      >
        {displayContent}
      </div>
      
      {/* Loading indicator */}
      {!isStable && (
        <div 
          style={{ 
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#71717a',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}
        >
          Updating equations...
        </div>
      )}
    </div>
  );
};

/**
 * Reusable step component for worked examples
 * Matches the numbered step format from IntegralWorkedExample
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
 * LaTeX equation wrapper with block/inline support
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

/**
 * Simple equation display without step numbering
 * For simpler worked examples that don't need numbered steps
 */
export const SimpleEquationList = ({ equations }) => {
  return (
    <>
      {equations.map((eq, index) => (
        <LaTeXEquation key={index} equation={eq} />
      ))}
    </>
  );
};
