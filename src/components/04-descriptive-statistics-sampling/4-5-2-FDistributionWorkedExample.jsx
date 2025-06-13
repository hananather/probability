"use client";

import React, { useEffect, useRef } from "react";

const FDistributionWorkedExample = React.memo(function FDistributionWorkedExample({ 
  n1 = 15, 
  n2 = 20,
  s1_squared = 2.5,
  s2_squared = 1.8,
  alpha = 0.05 
}) {
  const contentRef = useRef(null);
  
  // Calculate values
  const df1 = n1 - 1;
  const df2 = n2 - 1;
  const fStatistic = s1_squared / s2_squared;
  const criticalValue = 2.35; // F(0.05, 14, 19) from table
  
  useEffect(() => {
    // REQUIRED: MathJax timeout pattern to handle race conditions
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [n1, n2, s1_squared, s2_squared, alpha]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      fontSize: '14px',
      lineHeight: '1.8',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        F-Test for Comparing Two Variances
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Problem Setup:</p>
        <p style={{ marginLeft: '1rem', color: '#cbd5e0' }}>
          {`Two independent samples: \\(n_1 = ${n1}\\), \\(n_2 = ${n2}\\)`}<br/>
          {`Sample variances: \\(s_1^2 = ${s1_squared}\\), \\(s_2^2 = ${s2_squared}\\)`}<br/>
          {`Test if population variances are equal at \\(\\alpha = ${alpha}\\) level.`}
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. State the hypotheses:</p>
        <div style={{ marginLeft: '1rem' }}>
          <div dangerouslySetInnerHTML={{ __html: `\\[H_0: \\sigma_1^2 = \\sigma_2^2 \\quad \\text{vs} \\quad H_a: \\sigma_1^2 \\neq \\sigma_2^2\\]` }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Calculate the F-statistic:</p>
        <div style={{ marginLeft: '1rem' }}>
          <p style={{ color: '#cbd5e0' }}>The F-statistic is the ratio of sample variances:</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[F = \\frac{s_1^2}{s_2^2} = \\frac{${s1_squared}}{${s2_squared}} = ${fStatistic.toFixed(3)}\\]` }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Determine degrees of freedom:</p>
        <div style={{ marginLeft: '1rem' }}>
          <div dangerouslySetInnerHTML={{ __html: `\\[\\nu_1 = n_1 - 1 = ${n1} - 1 = ${df1}\\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\[\\nu_2 = n_2 - 1 = ${n2} - 1 = ${df2}\\]` }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>4. Find critical value:</p>
        <div style={{ marginLeft: '1rem' }}>
          <p style={{ color: '#cbd5e0' }}>
            {`For a two-tailed test at \\(\\alpha = ${alpha}\\), we need \\(F_{\\alpha/2, \\nu_1, \\nu_2}\\):`}<br/>
            {`\\(F_{0.025, ${df1}, ${df2}} = ${criticalValue}\\) (from F-table)`}
          </p>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>5. Make decision:</p>
        <div style={{ marginLeft: '1rem', backgroundColor: fStatistic > criticalValue ? '#7C2D12' : '#14532D', padding: '0.5rem', borderRadius: '4px' }}>
          <p>
            {`Since F = ${fStatistic.toFixed(3)} ${fStatistic > criticalValue ? '>' : '<'} ${criticalValue} (critical value),`}<br/>
            {`we ${fStatistic > criticalValue ? 'reject' : 'fail to reject'} \\(H_0\\) at the ${alpha} significance level.`}
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '4px' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>💡 Key Insight:</p>
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
          {`The F-distribution is right-skewed and always positive. When \\(\\sigma_1^2 = \\sigma_2^2\\), 
          the F-statistic follows an F-distribution with \\((\\nu_1, \\nu_2)\\) degrees of freedom. 
          This test is sensitive to the normality assumption of the underlying populations.`}
        </p>
      </div>
    </div>
  );
});

export { FDistributionWorkedExample };