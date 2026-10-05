"use client";

import React from "react";
import { useMathJax } from '@/hooks/useMathJax';
import { calculateVarianceRatioTest } from './varianceRatioTest';

const FDistributionWorkedExample = React.memo(function FDistributionWorkedExample({ 
  n1 = 15, 
  n2 = 20,
  s1_squared = 2.5,
  s2_squared = 1.8,
  alpha = 0.05 
}) {
  const contentRef = useMathJax([n1, n2, s1_squared, s2_squared, alpha]);
  
  const result = calculateVarianceRatioTest({ n1, n2, s1_squared, s2_squared, alpha });
  if (!result.valid) return <div ref={contentRef} role="status" className="rounded-lg bg-gray-800/50 p-6 text-gray-200">{result.error}</div>;
  const { df1, df2, fStatistic, lowerCriticalValue, upperCriticalValue, rejectNull } = result;
  
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
        <p className="ml-4 mt-2 text-gray-300">Assume independent random samples from two normal populations.</p>
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
        <p className="mb-1 font-medium text-pink-400">4. Find both critical values:</p>
        <div className="ml-4">
          <p className="text-pink-200">
            A two-sided test places α/2 = {alpha / 2} in each tail. These cutoffs are cumulative-distribution quantiles for ({df1}, {df2}) degrees of freedom:
          </p>
          <p className="font-mono mt-1">
            Lower cutoff (quantile {alpha / 2}): {lowerCriticalValue.toFixed(3)}
          </p>
          <p className="font-mono mt-1">Upper cutoff (quantile {1 - alpha / 2}): {upperCriticalValue.toFixed(3)}</p>
          <p className="mt-2 text-gray-300">Reject H₀ when F is below the lower cutoff or above the upper cutoff. Keep sample 1 in the numerator.</p>
          <p className="mt-2 text-gray-300">Cutoffs are rounded for display; the decision uses unrounded values.</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-violet-400">5. Make decision:</p>
        <div className={`ml-4 p-3 rounded-lg ${
          rejectNull
            ? "bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-600/30" 
            : "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30"
        }`}>
          <p className={rejectNull ? "text-red-300" : "text-green-300"}>
            F = {fStatistic.toFixed(3)} is {rejectNull ? 'outside' : 'inside'} the non-rejection interval [{lowerCriticalValue.toFixed(3)}, {upperCriticalValue.toFixed(3)}].<br/>
            We {rejectNull ? 'reject' : 'fail to reject'} H₀ at the {alpha} significance level.
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
        <a href="https://itl.nist.gov/div898/handbook/eda/section3/eda359.htm" className="mt-2 inline-block underline">Reference: NIST F-test for equality of variances</a>
      </div>
    </div>
  );
});

export default FDistributionWorkedExample;
