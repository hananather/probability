"use client";

import React from 'react';
import { useMathJaxWithState } from '@/hooks/useMathJax';
import { MathJaxSkeleton } from '@/utils/mathJaxFix';

/**
 * Example component showing best practices for MathJax rendering
 * with loading states and proper error handling
 */
export const MathJaxExample = ({ formula, dependencies = [] }) => {
  const { ref, isLoading, error } = useMathJaxWithState(dependencies);
  
  if (error) {
    return (
      <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
        <p className="text-red-400">Failed to render mathematical content</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <MathJaxSkeleton className="w-full" />
        </div>
      )}
      <div 
        ref={ref} 
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      >
        <span dangerouslySetInnerHTML={{ __html: formula }} />
      </div>
    </div>
  );
};

/**
 * Example of a full component with MathJax content
 */
export const MathJaxContentExample = () => {
  const formulas = [
    { id: 'bayes', content: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\]` },
    { id: 'conditional', content: `\\[P(A \\cap B) = P(A|B) \\cdot P(B)\\]` },
    { id: 'independence', content: `\\[P(A \\cap B) = P(A) \\cdot P(B)\\]` }
  ];
  
  const { ref, isLoading } = useMathJaxWithState([formulas]);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Mathematical Formulas</h3>
      
      <div ref={ref} className="space-y-4">
        {formulas.map((formula) => (
          <div 
            key={formula.id}
            className={`bg-neutral-800 p-4 rounded-lg transition-opacity duration-300 ${
              isLoading ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: formula.content }} />
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="text-center text-neutral-400 text-sm">
          Loading mathematical content...
        </div>
      )}
    </div>
  );
};

/**
 * Pattern for components with dynamic LaTeX content
 */
export const DynamicMathJaxExample = ({ value, onChange }) => {
  const formula = `\\[f(x) = ${value}x^2\\]`;
  const { ref, isLoading } = useMathJaxWithState([value]);
  
  return (
    <div className="space-y-4">
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      
      <div className="relative min-h-[60px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <MathJaxSkeleton className="w-32" />
          </div>
        )}
        <div 
          ref={ref}
          className={`text-center transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span dangerouslySetInnerHTML={{ __html: formula }} />
        </div>
      </div>
    </div>
  );
};