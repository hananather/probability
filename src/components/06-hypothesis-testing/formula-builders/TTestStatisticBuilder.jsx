"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const TTestStatisticBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    testStatistic: false,
    difference: false,
    standardError: false
  });
  
  const [understanding, setUnderstanding] = useState({
    testStatisticConcept: false,
    differenceConcept: false,
    standardErrorConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-red-900/20 to-rose-900/20 rounded-lg p-6 border border-red-700/50">
      <h3 className="text-xl font-bold text-red-400 mb-6">
        Build the t-Test Statistic Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to test hypotheses about means
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
              <span className="text-sm">x̄ - μ₀</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.standardErrorConcept ? 'text-green-400' : 
                selectedParts.standardError ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
            >
              <span className="text-sm">s/√n</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing degrees of freedom:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t_{df} = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} \\quad \\text{where} \\quad df = n - 1\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The test statistic follows a t-distribution with n-1 degrees of freedom
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.testStatistic && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              t - Test Statistic
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The t-statistic measures how many standard errors the sample mean is from the hypothesized population mean. It quantifies the strength of evidence against the null hypothesis.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If t = 2.5, the sample mean is 2.5 standard errors away from the hypothesized mean
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.difference && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              x̄ - μ₀ - Difference from Hypothesized Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator represents the difference between what we observed (sample mean x̄) and what we hypothesized (μ₀). This is the "signal" we're testing for.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If we claim μ = 100 but observe x̄ = 105, then x̄ - μ₀ = 5 units of difference
              </p>
            </div>
          </div>
        )}

        {selectedParts.standardError && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              s/√n - Standard Error
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator is the standard error of the sample mean, measuring the variability we expect in sample means. It scales the difference to account for sampling variability.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If s = 20 and n = 25, then s/√n = 20/5 = 4 is our standard error
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-red-900/30 to-rose-900/30 rounded-lg p-4 border border-red-500/30">
          <h5 className="font-semibold text-red-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The t-statistic standardizes the difference between sample and hypothesis:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Large |t| values indicate the sample mean is far from μ₀</li>
            <li>• Small |t| values suggest the sample is consistent with the null hypothesis</li>
            <li>• Extreme t-values (beyond critical values) lead to rejection of H₀</li>
            <li>• The t-distribution accounts for additional uncertainty when σ is unknown</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Testing Average Height</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{68.5 - 68.0}{3.2/\\sqrt{36}} = \\frac{0.5}{0.533} = 0.94\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Testing if average height equals 68 inches: With x̄ = 68.5, μ₀ = 68, s = 3.2, and n = 36, we get t = 0.94. 
            This moderate t-value suggests the sample is reasonably consistent with the claimed population mean.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                {key === 'testStatisticConcept' && 'Test Statistic'}
                {key === 'differenceConcept' && 'Difference from H₀'}
                {key === 'standardErrorConcept' && 'Standard Error'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the t-test statistic formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Larger |t| values provide stronger evidence against the null hypothesis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TTestStatisticBuilder.displayName = 'TTestStatisticBuilder';

export default TTestStatisticBuilder;