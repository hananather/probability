"use client";
import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with D3
const SpatialRandomVariable = dynamic(
  () => import('@/components/02-discrete-random-variables/SpatialRandomVariable'),
  { ssr: false }
);

export default function Chapter2() {
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
  }, []);
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4" ref={contentRef}>
        {/* Chapter Header */}
        <div className="max-w-4xl mx-auto mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            Chapter 2: Discrete Random Variables
          </h1>
          <p className="text-base text-neutral-400">
            Understanding probability through mapping functions
          </p>
        </div>

        {/* Core Concept */}
        <div className="max-w-4xl mx-auto mb-4">
          <p className="text-base text-neutral-300 mb-3">
            A <span className="text-teal-400 font-semibold">random variable <span dangerouslySetInnerHTML={{ __html: `\\(X\\)` }} /></span> is a mapping function 
            that assigns numerical values to outcomes:
          </p>
          
          <div className="flex items-center gap-3 text-sm font-mono mb-3 ml-4">
            <span dangerouslySetInnerHTML={{ __html: `\\(X:\\)` }} />
            <span className="text-teal-400">outcome</span>
            <span className="text-neutral-500">→</span>
            <span className="text-white">numerical value</span>
          </div>
          
          <p className="text-sm text-neutral-300 mb-2">
            In this interactive visualization:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Paint regions on the grid (these are your outcomes)</li>
            <li>Assign values to create the mapping <span dangerouslySetInnerHTML={{ __html: `\\(X\\)` }} /></li>
            <li>Sample to see probability emerge from region sizes</li>
          </ul>
          
          <p className="text-xs text-yellow-400/90 italic">
            💡 Larger regions = higher probability of being sampled
          </p>
        </div>

        {/* Main Visualization */}
        <div className="max-w-7xl mx-auto">
          <SpatialRandomVariable />
        </div>

        {/* Optional: Mathematical Note */}
        <div className="max-w-4xl mx-auto mt-6 pt-4 border-t border-neutral-800/50">
          <p className="text-sm text-neutral-400">
            <span dangerouslySetInnerHTML={{ __html: `Formally: \\(X: \\Omega \\to \\mathbb{R}\\) where \\(P(X=x) = P(\\{\\omega \\in \\Omega : X(\\omega) = x\\})\\)` }} />
          </p>
        </div>
      </div>
    </div>
  );
}