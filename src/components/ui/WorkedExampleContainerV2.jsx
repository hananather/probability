"use client";
import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";

/**
 * Enhanced WorkedExampleContainer with smart rendering to prevent LaTeX flash
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
  
  useEffect(() => {
    // Clear any pending update
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    // Mark as unstable immediately
    setIsStable(false);
    
    // Debounce the content update
    updateTimerRef.current = setTimeout(() => {
      setDisplayContent(children);
      
      // Give MathJax time to process
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise().then(() => {
          setIsStable(true);
        }).catch(() => {
          setIsStable(true); // Even on error, show content
        });
      } else {
        setIsStable(true);
      }
    }, 200); // Shorter delay since we're hiding flash
    
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [children]);
  
  return (
    <>
      <Script
        id={`mathjax-script-${title.replace(/\s+/g, '-').toLowerCase()}`}
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
      />
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
        <div
          style={{
            opacity: isStable ? 1 : 0,
            transition: 'opacity 100ms ease-in-out',
            visibility: isStable ? 'visible' : 'hidden'
          }}
        >
          {displayContent}
        </div>
        {!isStable && (
          <div 
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#71717a',
              fontSize: '0.875rem'
            }}
          >
            Updating...
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Reusable step component for worked examples
 */
export const WorkedExampleStep = ({ stepNumber, label, children }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
        {stepNumber}. {label}
      </p>
      {children}
    </div>
  );
};

/**
 * LaTeX equation wrapper
 */
export const LaTeXEquation = ({ equation, block = true }) => {
  if (block) {
    return <div dangerouslySetInnerHTML={{ __html: `\\[${equation}\\]` }} />;
  }
  return <span dangerouslySetInnerHTML={{ __html: `\\(${equation}\\)` }} />;
};