"use client";
import React, { useState } from 'react';
import { Check, Target, Percent, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ProportionTestBuilder = React.memo(() => {
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-700/50">
      <h3 className="text-xl font-bold text-green-400 mb-6">
        Build the Proportion Test Statistic Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to test hypotheses about population proportions
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
              <span className="text-sm">p̂ - p₀</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.standardErrorConcept ? 'text-green-400' : 
                selectedParts.standardError ? 'text-emerald-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
            >
              <div className="text-sm">
                <div>√[p₀(1-p₀)/n]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Complete formula with assumptions:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[z = \\frac{\\hat{p} - p_0}{\\sqrt{\\frac{p_0(1-p_0)}{n}}} \\sim N(0,1)\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Valid when np₀ ≥ 5 and n(1-p₀) ≥ 5 (normal approximation conditions)
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.difference && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              p̂ - p₀ - Difference in Proportions
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator represents the difference between the observed sample proportion (p̂) and the hypothesized population proportion (p₀). This measures how far our sample proportion is from what we claim.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If we claim 60% support a policy (p₀ = 0.6) but observe p̂ = 0.65, then p̂ - p₀ = 0.05 or 5 percentage points difference
              </p>
            </div>
          </div>
        )}

        {selectedParts.standardError && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              √[p₀(1-p₀)/n] - Standard Error of Proportion
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator is the standard error of the sample proportion under the null hypothesis. It measures the expected variability in sample proportions if H₀ were true.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If p₀ = 0.6 and n = 100, then √[0.6(1-0.6)/100] = √[0.24/100] = 0.049 is our standard error
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The proportion test standardizes the difference using binomial theory:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Uses null hypothesis value p₀ to calculate standard error</li>
            <li>• Assumes binomial distribution with normal approximation</li>
            <li>• Standard error depends on both p₀ and sample size n</li>
            <li>• Maximum standard error occurs when p₀ = 0.5</li>
          </ul>
        </div>
      )}

      {/* Normal Approximation Conditions */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <h5 className="font-semibold text-yellow-400 mb-2">Normal Approximation Conditions</h5>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For the z-test to be valid, both conditions must be met:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-800/30 p-3 rounded">
                <p className="font-medium text-green-300">Success condition:</p>
                <p className="text-neutral-400 font-mono">np₀ ≥ 5</p>
              </div>
              <div className="bg-green-800/30 p-3 rounded">
                <p className="font-medium text-green-300">Failure condition:</p>
                <p className="text-neutral-400 font-mono">n(1-p₀) ≥ 5</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              These ensure the sampling distribution of p̂ is approximately normal
            </p>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Testing Voter Support</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[z = \\frac{0.58 - 0.55}{\\sqrt{\\frac{0.55(0.45)}{400}}} = \\frac{0.03}{0.0249} = 1.20\\]` 
            }} />
          </div>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Testing if voter support equals 55%: With p̂ = 0.58, p₀ = 0.55, and n = 400, we get z = 1.20.
            </p>
            <p className="text-xs text-neutral-400">
              <strong>Check conditions:</strong> np₀ = 400(0.55) = 220 ≥ 5 ✓ and n(1-p₀) = 400(0.45) = 180 ≥ 5 ✓
            </p>
            <p>
              Since |z| = 1.20 &lt; 1.96, we fail to reject H₀ at α = 0.05.
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
                {key === 'differenceConcept' && 'Proportion Difference'}
                {key === 'standardErrorConcept' && 'Standard Error of Proportion'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the proportion test statistic!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Always check normal approximation conditions before using this test.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ProportionTestBuilder.displayName = 'ProportionTestBuilder';

export default ProportionTestBuilder;