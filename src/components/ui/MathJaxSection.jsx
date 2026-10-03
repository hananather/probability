"use client";

import React, { useRef } from 'react';
import { useMathJax } from '@/hooks/useMathJax';

/**
 * MathJax Section Component - Handles MathJax processing with proper hook usage
 * This component ensures hooks are at the top level, preventing React hooks order violations
 */
export default function MathJaxSection({ children, className = "" }) {
  const contentRef = useRef(null);
  
  useMathJax(contentRef, [children]);
  
  return (
    <div ref={contentRef} className={className}>
      {children}
    </div>
  );
}
