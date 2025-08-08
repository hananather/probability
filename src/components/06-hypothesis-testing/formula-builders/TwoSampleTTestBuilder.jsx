"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, BarChart3, Users } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const TwoSampleTTestBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    difference: false,
    pooledStandardError: false
  });
  
  const [understanding, setUnderstanding] = useState({
    differenceConcept: false,
    pooledStandardErrorConcept: false
  });
  
  const allUnderstood = Object.values(understanding).every(v => v);
  const mathJaxRef = useMathJax([selectedParts, understanding]);

  const handlePartClick = (part, understandingKey) => {
    if (!selectedParts[part]) {
      setSelectedParts({...selectedParts, [part]: true});
    }
    if (understandingKey && !understanding[understandingKey]) {
      setUnderstanding({...understanding, [understandingKey]: true});
    }
  };

  return (
    <div ref={mathJaxRef} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg p-6 border border-purple-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Build the Two-Sample T-Test Statistic Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to compare means between two independent groups
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">t =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.differenceConcept ? 'text-green-400' : 
                selectedParts.difference ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('difference', 'differenceConcept')}
            >
              <span className="text-sm">x̄₁ - x̄₂</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.pooledStandardErrorConcept ? 'text-green-400' : 
                selectedParts.pooledStandardError ? 'text-indigo-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('pooledStandardError', 'pooledStandardErrorConcept')}
            >
              <div className="text-sm text-center">
                <div>sp√(1/n₁ + 1/n₂)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Complete formula with degrees of freedom:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{x}_1 - \\bar{x}_2}{s_p\\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}}} \\quad df = n_1 + n_2 - 2\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Assumes equal population variances (σ₁² = σ₂²) and uses pooled standard deviation sp
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.difference && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              x̄₁ - x̄₂ - Difference Between Sample Means
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator is the observed difference between the two sample means. Under the null hypothesis H₀: μ₁ = μ₂, we expect this difference to be close to zero.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Group 1 mean = 75, Group 2 mean = 72, so x̄₁ - x̄₂ = 3 points difference
              </p>
            </div>
          </div>
        )}

        {selectedParts.pooledStandardError && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              sp√(1/n₁ + 1/n₂) - Pooled Standard Error
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator combines information from both samples to estimate the standard error of the difference between means. The pooled standard deviation sp accounts for variability in both groups.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If sp = 8, n₁ = 25, n₂ = 30, then sp√(1/25 + 1/30) = 8√(0.073) = 2.16
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The two-sample t-test compares group means while accounting for combined variability:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Assumes equal population variances (homoscedasticity)</li>
            <li>• Pools variance information from both samples for better estimation</li>
            <li>• Standard error depends on both sample sizes</li>
            <li>• Uses df = n₁ + n₂ - 2 degrees of freedom</li>
          </ul>
        </div>
      )}

      {/* Assumptions and Alternatives */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <h5 className="font-semibold text-yellow-400 mb-2">Assumptions & Alternatives</h5>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-800/30 p-3 rounded">
                <p className="font-medium text-green-300 mb-2">Pooled t-test (this formula):</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Equal variances: σ₁² = σ₂²</li>
                  <li>• Both samples normally distributed</li>
                  <li>• Independent samples</li>
                </ul>
              </div>
              <div className="bg-blue-800/30 p-3 rounded">
                <p className="font-medium text-blue-300 mb-2">Welch's t-test:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Unequal variances allowed</li>
                  <li>• More complex df calculation</li>
                  <li>• Generally more robust</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Comparing Teaching Methods</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{82 - 78}{6.5\\sqrt{\\frac{1}{20} + \\frac{1}{22}}} = \\frac{4}{6.5 \\times 0.309} = 1.99\\]` 
            }} />
          </div>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Comparing two teaching methods: Method A (x̄₁ = 82, n₁ = 20) vs Method B (x̄₂ = 78, n₂ = 22) with sp = 6.5.
            </p>
            <p className="text-xs text-neutral-400">
              <strong>Degrees of freedom:</strong> df = 20 + 22 - 2 = 40
            </p>
            <p>
              With t = 1.99 and df = 40, this is marginally significant at α = 0.05 (critical value ≈ 2.02).
            </p>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(understanding).map(([key, understood]) => (
            <div 
              key={key}
              className={`p-3 rounded-lg text-center transition-all ${
                understood 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-neutral-700/50 border border-neutral-600'
              }`}
            >
              <p className="text-sm font-medium">
                {key === 'differenceConcept' && 'Difference Between Means'}
                {key === 'pooledStandardErrorConcept' && 'Pooled Standard Error'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the two-sample t-test formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: This assumes equal variances. Use Welch's test when variances differ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TwoSampleTTestBuilder.displayName = 'TwoSampleTTestBuilder';

export default TwoSampleTTestBuilder;