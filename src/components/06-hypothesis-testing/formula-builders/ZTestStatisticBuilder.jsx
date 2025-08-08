"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ZTestStatisticBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    difference: false,
    standardError: false
  });
  
  const [understanding, setUnderstanding] = useState({
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-6 border border-blue-700/50">
      <h3 className="text-xl font-bold text-blue-400 mb-6">
        Build the Z-Test Statistic Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to test hypotheses when population standard deviation is known
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">z =</span>
          
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
                selectedParts.standardError ? 'text-cyan-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
            >
              <span className="text-sm">σ/√n</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Standard normal distribution:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[z \\sim N(0,1) \\text{ when } H_0 \\text{ is true}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The z-statistic follows a standard normal distribution under the null hypothesis
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
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
                <strong>Example:</strong> If we claim μ = 500 but observe x̄ = 510, then x̄ - μ₀ = 10 units of difference
              </p>
            </div>
          </div>
        )}

        {selectedParts.standardError && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              σ/√n - Standard Error of the Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator is the standard error, measuring the variability we expect in sample means when we know the population standard deviation σ. It standardizes our difference.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If σ = 50 and n = 100, then σ/√n = 50/10 = 5 is our standard error
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The z-statistic standardizes the difference using known population variability:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Uses population standard deviation σ (assumed known)</li>
            <li>• Follows standard normal distribution N(0,1) when H₀ is true</li>
            <li>• More precise than t-test when σ is truly known</li>
            <li>• Critical values: ±1.96 for α = 0.05, ±2.58 for α = 0.01</li>
          </ul>
        </div>
      )}

      {/* When to Use Z-Test vs T-Test */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2">When to Use Z-Test vs T-Test</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-800/30 p-3 rounded">
              <p className="font-medium text-blue-300 mb-2">Use Z-Test When:</p>
              <ul className="space-y-1 text-neutral-400">
                <li>• Population σ is known</li>
                <li>• Large sample size (n ≥ 30)</li>
                <li>• Population is normal or large n</li>
              </ul>
            </div>
            <div className="bg-red-800/30 p-3 rounded">
              <p className="font-medium text-red-300 mb-2">Use T-Test When:</p>
              <ul className="space-y-1 text-neutral-400">
                <li>• Population σ is unknown</li>
                <li>• Small sample size (n &lt; 30)</li>
                <li>• Estimate σ using sample s</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Testing SAT Scores</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[z = \\frac{1520 - 1500}{100/\\sqrt{64}} = \\frac{20}{12.5} = 1.6\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Testing if SAT scores equal the national average of 1500: With x̄ = 1520, μ₀ = 1500, σ = 100, and n = 64, we get z = 1.6. 
            This z-value is less than 1.96, so we fail to reject H₀ at α = 0.05.
          </p>
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
                {key === 'differenceConcept' && 'Difference from H₀'}
                {key === 'standardErrorConcept' && 'Standard Error (Known σ)'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the z-test statistic formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Use z-test when σ is known, t-test when σ is unknown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ZTestStatisticBuilder.displayName = 'ZTestStatisticBuilder';

export default ZTestStatisticBuilder;