"use client";
import React, { useEffect, useRef } from "react";

const ExponentialDistributionWorkedExample = React.memo(function ExponentialDistributionWorkedExample({
  lambda = 1,
  t = 1,
  pdfValue = 0,
  cdfValue = 0,
  mean = 1,
  variance = 1
}) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error in ExponentialDistributionWorkedExample:', err);
        });
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    
    return () => clearTimeout(timeoutId);
  }, [lambda, t, pdfValue, cdfValue, mean, variance]);
  
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
      }}
      className="text-sm"
    >
      <h4 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        borderBottom: '1px solid #4A5568', 
        paddingBottom: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        Exponential Distribution Calculations
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          {`1. Distribution: \(X \sim \text{Exp}(\lambda = ${lambda})\)`}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
          {`The exponential distribution models waiting times with constant hazard rate \(\lambda\).`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          2. Probability Density Function (PDF):
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[f(t) = \\lambda e^{-\\lambda t} = ${lambda} e^{-${lambda} \\cdot ${t}} = ${pdfValue.toFixed(4)}\\]` 
        }} />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
          {`for \(t \ge 0\), and \(f(t) = 0\) for \(t < 0\)`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          3. Cumulative Distribution Function (CDF):
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[\\begin{align}
            F(t) = P(T \\le ${t}) &= \\int_0^{${t}} \\lambda e^{-\\lambda s} \\, ds \\\\
            &= 1 - e^{-\\lambda t} \\\\
            &= 1 - e^{-${lambda} \\cdot ${t}} \\\\
            &= ${cdfValue.toFixed(4)}
          \\end{align}\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          4. Mean and Variance:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[\\begin{align}
            E[X] &= \\frac{1}{\\lambda} = \\frac{1}{${lambda}} = ${mean.toFixed(3)} \\\\
            \\text{Var}(X) &= \\frac{1}{\\lambda^2} = \\frac{1}{${lambda}^2} = ${variance.toFixed(3)} \\\\
            \\text{SD}(X) &= \\frac{1}{\\lambda} = ${Math.sqrt(variance).toFixed(3)}
          \\end{align}\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          5. Survival Probability:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[P(T > ${t}) = e^{-\\lambda t} = e^{-${lambda} \\cdot ${t}} = ${(1 - cdfValue).toFixed(4)}\\]` 
        }} />
      </div>
      
      <div style={{ 
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#1e3a8a',
        borderRadius: '6px',
        border: '1px solid #3b82f6'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          💡 Memoryless Property
        </p>
        <p style={{ fontSize: '0.8125rem' }}>
          {`For any \\(s, t > 0\\): \\(P(T > s + t | T > s) = P(T > t) = e^{-\\lambda t}\\)`}
        </p>
        <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
          This means the probability of waiting an additional time \\(t\\) doesn't depend on how long you've already waited!
        </p>
      </div>
      
      <div style={{ 
        padding: '0.75rem',
        backgroundColor: '#374151',
        borderRadius: '6px',
        border: '1px solid #4B5563'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          📊 Example Applications:
        </p>
        <ul style={{ fontSize: '0.8125rem', marginLeft: '1rem', listStyle: 'disc' }}>
          <li>Time between arrivals at a service center</li>
          <li>Lifetime of electronic components</li>
          <li>Time between radioactive decay events</li>
          <li>Inter-arrival times in a Poisson process</li>
        </ul>
      </div>
    </div>
  );
});

export { ExponentialDistributionWorkedExample };
export default ExponentialDistributionWorkedExample;