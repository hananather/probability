"use client";
import React, { useEffect, useRef } from "react";

const ExpectationVarianceWorkedExample = React.memo(function ExpectationVarianceWorkedExample({
  probs
}) {
  const contentRef = useRef(null);

  // Calculate expectation, E[X^2], and variance
  const expectation = probs.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const e2 = probs.reduce((sum, p, i) => sum + p * Math.pow(i + 1, 2), 0);
  const variance = e2 - Math.pow(expectation, 2);

  useEffect(() => {
    // Process MathJax when component mounts or updates
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        // Clear and re-process MathJax
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error in ExpectationVarianceWorkedExample
        });
      }
    };
    
    // Try to process immediately
    processMathJax();
    
    // Also try after a small delay in case MathJax isn't ready
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => clearTimeout(timeoutId);
  }, [probs, expectation, e2, variance]); // Retypeset when any relevant value changes

  return (
    <div
      ref={contentRef}
      style={{
        backgroundColor: '#2A303C', // Darker gray, adjust as needed
        padding: '1.5rem',
        borderRadius: '8px',
        color: '#e0e0e0', // Lighter text color
        width: '100%',
        maxWidth: '768px', // md:max-w-3xl
        marginTop: '1.5rem', // space-y-6
        overflowX: 'auto',
        fontFamily: 'var(--font-sans)',
      }}
      className="text-sm"
    >
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Expectation and Variance Calculation Steps
      </h4>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Calculate the Expected Value:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X] = \\sum_{i=1}^{6} i \\cdot P(X = i)\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X] = ${probs.map((p, i) => `${i + 1} \\cdot ${p.toFixed(3)}`).join(' + ')}\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X] = ${expectation.toFixed(4)}\\]` }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Calculate \(E[X^2]\):</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X^2] = \\sum_{i=1}^{6} i^2 \\cdot P(X = i)\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X^2] = ${probs.map((p, i) => `${Math.pow(i + 1, 2)} \\cdot ${p.toFixed(3)}`).join(' + ')}\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[E[X^2] = ${e2.toFixed(4)}\\]` }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Calculate the Variance:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Var}(X) = E[X^2] - (E[X])^2\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Var}(X) = ${e2.toFixed(4)} - (${expectation.toFixed(4)})^2\\]` }} />
        <div dangerouslySetInnerHTML={{ __html: `\\[\\text{Var}(X) = ${variance.toFixed(4)}\\]` }} />
      </div>
    </div>
  );
});

export { ExpectationVarianceWorkedExample }; // Exporting for use
export default ExpectationVarianceWorkedExample;