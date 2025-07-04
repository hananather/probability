"use client";

import React, { useEffect, useRef } from 'react';

/**
 * MathJax Section Component - Handles MathJax processing with proper hook usage
 * This component ensures hooks are at the top level, preventing React hooks order violations
 */
export default function MathJaxSection({ children, className = "" }) {
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
  }, []);
  
  return (
    <div ref={contentRef} className={className}>
      {children}
    </div>
  );
}