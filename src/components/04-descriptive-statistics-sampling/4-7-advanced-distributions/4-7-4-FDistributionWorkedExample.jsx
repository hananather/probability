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
    <div ref={contentRef} className="bg-gray-800/50 p-6 rounded-lg text-gray-200 text-sm leading-relaxed">
      <h4 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-4 text-white">
        F-Test for Comparing Two Variances
      </h4>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-cyan-400">Problem Setup:</p>
        <p className="ml-4 text-gray-300">
          {`Two independent samples: \\(n_1 = ${n1}\\), \\(n_2 = ${n2}\\)`}<br/>
          {`Sample variances: \\(s_1^2 = ${s1_squared}\\), \\(s_2^2 = ${s2_squared}\\)`}<br/>
          {`Test if population variances are equal at \\(\\alpha = ${alpha}\\) level.`}
        </p>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-purple-400">1. State the hypotheses:</p>
        <div className="ml-4">
          <div dangerouslySetInnerHTML={{ __html: `\\[H_0: \\sigma_1^2 = \\sigma_2^2 \\quad \\text{vs} \\quad H_a: \\sigma_1^2 \\neq \\sigma_2^2\\]` }} />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-blue-400">2. Calculate the F-statistic:</p>
        <div className="ml-4">
          <p className="text-gray-300">The F-statistic is the ratio of sample variances:</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[F = \\frac{s_1^2}{s_2^2} = \\frac{${s1_squared}}{${s2_squared}} = ${fStatistic.toFixed(3)}\\]` }} />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-orange-400">3. Determine degrees of freedom:</p>
        <div className="ml-4 bg-gradient-to-r from-orange-900/30 to-red-900/30 p-3 rounded-lg space-y-1">
          <div className="text-center">
            <span className="font-mono">ν₁ = n₁ - 1 = {n1} - 1 = {df1}</span>
          </div>
          <div className="text-center">
            <span className="font-mono">ν₂ = n₂ - 1 = {n2} - 1 = {df2}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-pink-400">4. Find critical value:</p>
        <div className="ml-4">
          <p className="text-pink-200">
            For a two-tailed test at α = {alpha}, we need Fₐ/₂,ν₁,ν₂:
          </p>
          <p className="font-mono mt-1">
            F₀.₀₂₅, {df1}, {df2} = {criticalValue} (from F-table)
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-violet-400">5. Make decision:</p>
        <div className={`ml-4 p-3 rounded-lg ${
          fStatistic > criticalValue 
            ? "bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-600/30" 
            : "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30"
        }`}>
          <p className={fStatistic > criticalValue ? "text-red-300" : "text-green-300"}>
            Since F = {fStatistic.toFixed(3)} {fStatistic > criticalValue ? '>' : '<'} {criticalValue} (critical value),<br/>
            we {fStatistic > criticalValue ? 'reject' : 'fail to reject'} H₀ at the {alpha} significance level.
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-600/30">
        <p className="text-sm font-medium text-cyan-400">Key Insight:</p>
        <p className="text-sm text-cyan-200 mt-1">
          The F-distribution is right-skewed and always positive. When σ₁² = σ₂², 
          the F-statistic follows an F-distribution with (ν₁, ν₂) degrees of freedom. 
          This test is sensitive to the normality assumption of the underlying populations.
        </p>
      </div>
    </div>
  );
});

export default FDistributionWorkedExample;