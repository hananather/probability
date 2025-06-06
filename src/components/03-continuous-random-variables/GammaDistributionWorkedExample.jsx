"use client";
import React, { useEffect, useRef } from "react";

const GammaDistributionWorkedExample = React.memo(function GammaDistributionWorkedExample({
  shape = 2,
  rate = 1,
  scale = 1,
  mean = 2,
  variance = 2,
  mode = 1
}) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error in GammaDistributionWorkedExample:', err);
        });
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    
    return () => clearTimeout(timeoutId);
  }, [shape, rate, scale, mean, variance, mode]);
  
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
        Gamma Distribution Calculations
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          {`1. Distribution: \(X \sim \text{Gamma}(k = ${shape}, \theta = ${scale.toFixed(3)})\)`}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
          {`Alternative parameterization: \(\text{Gamma}(\alpha = ${shape}, \beta = ${rate})\) where \(\theta = 1/\beta\)`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          2. Probability Density Function (PDF):
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[f(x; k, \\theta) = \\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}\\]` 
        }} />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
          {`for \(x > 0\), where \(\Gamma(k)\) is the gamma function`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          3. Mean, Variance, and Mode:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[\\begin{align}
            E[X] &= k\\theta = ${shape} \\times ${scale.toFixed(3)} = ${mean.toFixed(3)} \\\\
            \\text{Var}(X) &= k\\theta^2 = ${shape} \\times ${scale.toFixed(3)}^2 = ${variance.toFixed(3)} \\\\
            \\text{Mode} &= ${shape > 1 ? `(k-1)\\theta = (${shape}-1) \\times ${scale.toFixed(3)} = ${mode.toFixed(3)}` : '\\text{0 (at boundary)'}
          \\end{align}\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          4. Connection to Exponential Distribution:
        </p>
        {Math.abs(shape - 1) < 0.01 ? (
          <div>
            <p style={{ color: '#86efac', marginBottom: '0.5rem' }}>
              ✓ When k = 1, Gamma(1, θ) = Exponential(λ = 1/θ)
            </p>
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{1}{\\theta} e^{-x/\\theta} = ${rate.toFixed(3)} e^{-${rate.toFixed(3)}x}\\]` 
            }} />
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem' }}>
            {`If \(X_1, X_2, ..., X_k\) are independent \(\text{Exp}(\lambda = ${rate})\), then:`}
            <span dangerouslySetInnerHTML={{ 
              __html: ` \\(X_1 + X_2 + ... + X_{${Math.floor(shape)}} \\sim \\text{Gamma}(${Math.floor(shape)}, ${(1/rate).toFixed(3)})\\)` 
            }} />
          </p>
        )}
      </div>
      
      {shape % 1 === 0 && Math.abs(scale - 2) < 0.01 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
            5. Connection to Chi-Squared Distribution:
          </p>
          <p style={{ color: '#86efac' }}>
            ✓ Gamma({shape}, 2) = χ²(df = {2 * shape})
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            The chi-squared distribution with {2 * shape} degrees of freedom is a special case!
          </p>
        </div>
      )}
      
      <div style={{ 
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#1e3a8a',
        borderRadius: '6px',
        border: '1px solid #3b82f6'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          💡 Key Properties
        </p>
        <ul style={{ fontSize: '0.8125rem', marginLeft: '1rem', listStyle: 'disc' }}>
          <li>Shape parameter k controls the shape (k &lt; 1: J-shaped, k ≥ 1: unimodal)</li>
          <li>Scale parameter θ stretches/compresses the distribution</li>
          <li>As k increases, becomes more symmetric and approaches normal</li>
          <li>Memoryless property only when k = 1 (exponential case)</li>
        </ul>
      </div>
      
      <div style={{ 
        padding: '0.75rem',
        backgroundColor: '#374151',
        borderRadius: '6px',
        border: '1px solid #4B5563'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          📊 Applications:
        </p>
        <ul style={{ fontSize: '0.8125rem', marginLeft: '1rem', listStyle: 'disc' }}>
          <li>Wait time until the k-th event in a Poisson process</li>
          <li>Modeling rainfall amounts</li>
          <li>Insurance claim sizes</li>
          <li>Lifetime of systems with standby redundancy</li>
          <li>Bayesian statistics (conjugate prior for Poisson rate)</li>
        </ul>
      </div>
    </div>
  );
});

export { GammaDistributionWorkedExample };
export default GammaDistributionWorkedExample;