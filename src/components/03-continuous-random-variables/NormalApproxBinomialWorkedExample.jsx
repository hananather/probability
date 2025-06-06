"use client";
import React, { useEffect, useRef } from "react";

const NormalApproxBinomialWorkedExample = React.memo(function NormalApproxBinomialWorkedExample({
  n = 50,
  p = 0.5,
  k = 25,
  probType = "le",
  showCC = true,
  binomialProb = 0,
  normalProb = 0,
  error = 0
}) {
  const contentRef = useRef(null);
  
  // Calculate Normal parameters
  const mu = n * p;
  const variance = n * p * (1 - p);
  const sigma = Math.sqrt(variance);
  
  // Rule of thumb values
  const np = n * p;
  const nq = n * (1 - p);
  const ruleOfThumbMet = np >= 5 && nq >= 5;
  
  // Continuity correction values
  let correctedK, zScore;
  switch (probType) {
    case "le":
      correctedK = showCC ? k + 0.5 : k;
      break;
    case "ge":
      correctedK = showCC ? k - 0.5 : k;
      break;
    case "eq":
      correctedK = k; // For display purposes
      break;
  }
  
  // Calculate z-score
  if (probType === "eq" && showCC) {
    const lowerZ = ((k - 0.5) - mu) / sigma;
    const upperZ = ((k + 0.5) - mu) / sigma;
    zScore = `${lowerZ.toFixed(3)} \\text{ and } ${upperZ.toFixed(3)}`;
  } else {
    const z = (correctedK - mu) / sigma;
    zScore = z.toFixed(3);
  }
  
  // Format probability type for display
  const getProbabilityNotation = () => {
    switch (probType) {
      case "le": return `P(X \\le ${k})`;
      case "ge": return `P(X \\ge ${k})`;
      case "eq": return `P(X = ${k})`;
    }
  };
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error in NormalApproxBinomialWorkedExample:', err);
        });
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    
    return () => clearTimeout(timeoutId);
  }, [n, p, k, probType, showCC, mu, sigma, correctedK, zScore]);
  
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
        Normal Approximation to Binomial {showCC ? "(with Continuity Correction)" : "(without Continuity Correction)"}
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          1. Problem: Approximate \({getProbabilityNotation()}\) for \(X \sim B(n={n}, p={p})\)
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          2. Calculate Normal Parameters:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[\\begin{align}
            \\text{Mean } \\mu &= np = ${n} \\times ${p} = ${mu} \\\\
            \\text{Variance } \\sigma^2 &= np(1-p) = ${n} \\times ${p} \\times ${(1-p).toFixed(2)} = ${variance.toFixed(2)} \\\\
            \\text{Std. Dev. } \\sigma &= \\sqrt{${variance.toFixed(2)}} = ${sigma.toFixed(3)}
          \\end{align}\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          3. Check Rule of Thumb:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[\\begin{align}
            np &= ${np.toFixed(2)} ${np >= 5 ? '\\ge' : '<'} 5 \\quad ${np >= 5 ? '\\checkmark' : '\\times'} \\\\
            n(1-p) &= ${nq.toFixed(2)} ${nq >= 5 ? '\\ge' : '<'} 5 \\quad ${nq >= 5 ? '\\checkmark' : '\\times'}
          \\end{align}\\]` 
        }} />
        <p style={{ marginTop: '0.5rem', color: ruleOfThumbMet ? '#86efac' : '#fca5a5' }}>
          Is approximation suitable? {ruleOfThumbMet ? "Yes ✓" : "No ✗"} (Both should be ≥ 5)
        </p>
      </div>
      
      {showCC && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
            4. Apply Continuity Correction:
          </p>
          {probType === "le" && (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{For } P(X \\le ${k}), \\text{ we adjust: } k' = ${k} + 0.5 = ${k + 0.5}\\]` 
            }} />
          )}
          {probType === "ge" && (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{For } P(X \\ge ${k}), \\text{ we adjust: } k' = ${k} - 0.5 = ${k - 0.5}\\]` 
            }} />
          )}
          {probType === "eq" && (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{For } P(X = ${k}), \\text{ we use interval: } [${k - 0.5}, ${k + 0.5}]\\]` 
            }} />
          )}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          {showCC ? "5" : "4"}. Standardize (Calculate Z-score):
        </p>
        {probType !== "eq" ? (
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[Z = \\frac{k' - \\mu}{\\sigma} = \\frac{${correctedK} - ${mu}}{${sigma.toFixed(3)}} = ${zScore}\\]` 
          }} />
        ) : (
          showCC ? (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[\\begin{align}
                Z_1 &= \\frac{${k - 0.5} - ${mu}}{${sigma.toFixed(3)}} = ${((k - 0.5 - mu) / sigma).toFixed(3)} \\\\
                Z_2 &= \\frac{${k + 0.5} - ${mu}}{${sigma.toFixed(3)}} = ${((k + 0.5 - mu) / sigma).toFixed(3)}
              \\end{align}\\]` 
            }} />
          ) : (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{${k} - ${mu}}{${sigma.toFixed(3)}} = ${((k - mu) / sigma).toFixed(3)}\\]` 
            }} />
          )
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          {showCC ? "6" : "5"}. Find Probability using Standard Normal:
        </p>
        {probType === "le" && (
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[P(X \\le ${k}) \\approx P(Y \\le ${correctedK}) = P(Z \\le ${zScore}) = \\Phi(${zScore}) = ${normalProb.toFixed(6)}\\]` 
          }} />
        )}
        {probType === "ge" && (
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[P(X \\ge ${k}) \\approx P(Y \\ge ${correctedK}) = 1 - P(Z < ${zScore}) = 1 - \\Phi(${zScore}) = ${normalProb.toFixed(6)}\\]` 
          }} />
        )}
        {probType === "eq" && (
          showCC ? (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[\\begin{align}
                P(X = ${k}) &\\approx P(${k - 0.5} \\le Y \\le ${k + 0.5}) \\\\
                &= \\Phi(${((k + 0.5 - mu) / sigma).toFixed(3)}) - \\Phi(${((k - 0.5 - mu) / sigma).toFixed(3)}) \\\\
                &= ${normalProb.toFixed(6)}
              \\end{align}\\]` 
            }} />
          ) : (
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = ${k}) \\approx \\text{Normal PDF at } k = ${normalProb.toFixed(6)}\\]` 
            }} />
          )
        )}
      </div>
      
      <div style={{ 
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#374151',
        borderRadius: '6px',
        border: '1px solid #4B5563'
      }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          7. Comparison with Exact Value:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: '#93c5fd' }}>Exact (Binomial):</span> {binomialProb.toFixed(6)}
          </div>
          <div>
            <span style={{ color: '#86efac' }}>Approx (Normal):</span> {normalProb.toFixed(6)}
          </div>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <span style={{ color: '#fbbf24' }}>Absolute Error:</span> |{binomialProb.toFixed(6)} - {normalProb.toFixed(6)}| = {error.toFixed(6)}
        </div>
        {!showCC && probType === "eq" && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#fca5a5' }}>
            Note: Without continuity correction for P(X = k), the approximation is usually poor!
          </p>
        )}
      </div>
      
      {showCC && (
        <div style={{ 
          padding: '0.75rem',
          backgroundColor: '#1e3a8a',
          borderRadius: '6px',
          border: '1px solid #3b82f6'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            💡 Why Continuity Correction?
          </p>
          <p style={{ fontSize: '0.8125rem' }}>
            The Binomial is discrete (bars), while the Normal is continuous (smooth curve). 
            The bar for \(k\) spans from \(k-0.5\) to \(k+0.5\), so we adjust our boundaries 
            to capture the entire bar's area when using the continuous approximation.
          </p>
        </div>
      )}
    </div>
  );
});

export { NormalApproxBinomialWorkedExample };
export default NormalApproxBinomialWorkedExample;