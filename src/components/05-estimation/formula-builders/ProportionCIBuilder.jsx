"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3, Percent } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ProportionCIBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    sampleProportion: false,
    plusMinus: false,
    zCritical: false,
    pHat: false,
    oneMinusPHat: false,
    sampleSize: false
  });
  
  const [understanding, setUnderstanding] = useState({
    sampleProportionConcept: false,
    plusMinusConcept: false,
    zCriticalConcept: false,
    pHatConcept: false,
    oneMinusPHatConcept: false,
    sampleSizeConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-lg p-6 border border-green-700/50">
      <h3 className="text-xl font-bold text-green-400 mb-6">
        Build the Proportion Confidence Interval Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand confidence intervals for population proportions
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* p̂ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.sampleProportionConcept ? 'text-green-400' : 
              selectedParts.sampleProportion ? 'text-teal-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('sampleProportion', 'sampleProportionConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="block text-sm">sample</span>
              <span className="block text-sm">proportion</span>
            </div>
          </div>
          
          {/* ± */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.plusMinusConcept ? 'text-green-400' : 
              selectedParts.plusMinus ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('plusMinus', 'plusMinusConcept')}
          >
            ±
          </div>
          
          {/* z(α/2) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.zCriticalConcept ? 'text-green-400' : 
              selectedParts.zCritical ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('zCritical', 'zCriticalConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="block text-sm">z critical</span>
              <span className="block text-sm">value</span>
            </div>
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* √[p̂(1-p̂)/n] */}
          <div className="inline-flex items-center">
            <span className="text-neutral-500 text-2xl">√</span>
            <div className="inline-flex flex-col items-center ml-1">
              {/* p̂(1-p̂) */}
              <div className="inline-flex items-center gap-1">
                <div 
                  className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                    understanding.pHatConcept ? 'text-green-400' : 
                    selectedParts.pHat ? 'text-purple-400' : 'text-neutral-400'
                  }`}
                  onClick={() => handlePartClick('pHat', 'pHatConcept')}
                >
                  <span className="text-sm">p̂</span>
                </div>
                <span className="text-neutral-500 text-sm">×</span>
                <div 
                  className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                    understanding.oneMinusPHatConcept ? 'text-green-400' : 
                    selectedParts.oneMinusPHat ? 'text-orange-400' : 'text-neutral-400'
                  }`}
                  onClick={() => handlePartClick('oneMinusPHat', 'oneMinusPHatConcept')}
                >
                  <span className="text-sm">(1-p̂)</span>
                </div>
              </div>
              
              {/* Fraction bar */}
              <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
              
              {/* n */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.sampleSizeConcept ? 'text-green-400' : 
                  selectedParts.sampleSize ? 'text-yellow-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sampleSize', 'sampleSizeConcept')}
              >
                <span className="text-sm">n</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{p} \\pm z_{\\alpha/2} \\times \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Valid when np̂ ≥ 5 and n(1-p̂) ≥ 5 (normal approximation conditions)
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.sampleProportion && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              p̂ - Sample Proportion (Point Estimate)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The sample proportion p̂ = x/n where x is the number of successes in n trials. This is our best estimate for the true population proportion p.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If 120 out of 300 voters support a candidate, then p̂ = 120/300 = 0.40
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.plusMinus && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              ± - Interval Construction
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Creates a symmetric interval around our sample proportion, acknowledging that the true population proportion could be somewhat higher or lower.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If margin of error = 0.057, then 0.40 ± 0.057 gives interval [0.343, 0.457] or 34.3% to 45.7%
              </p>
            </div>
          </div>
        )}

        {selectedParts.zCritical && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              z(α/2) - Critical Z-Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The z-value from the standard normal distribution for the desired confidence level. We use z (not t) because the sampling distribution of p̂ is approximately normal for large samples.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Common values:</strong> 90% confidence → z = 1.645, 95% confidence → z = 1.96, 99% confidence → z = 2.576
              </p>
            </div>
          </div>
        )}

        {selectedParts.pHat && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              p̂ - Success Probability Component
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This p̂ in the standard error formula represents the probability of success. The variance of a binomial proportion is p(1-p), and we estimate this using our sample proportion.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Note:</strong> We use the same p̂ = 0.40 in both the point estimate and the standard error calculation
              </p>
            </div>
          </div>
        )}

        {selectedParts.oneMinusPHat && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              (1-p̂) - Failure Probability Component
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability of failure (1-p̂) complements the success probability. Together, p̂(1-p̂) captures the maximum variability occurring when p ≈ 0.5.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If p̂ = 0.40, then (1-p̂) = 0.60, and p̂(1-p̂) = 0.40 × 0.60 = 0.24
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleSize && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              n - Sample Size in Denominator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Larger sample sizes reduce the standard error, making our confidence interval more precise. The standard error decreases proportionally to √n.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> With n = 300, the standard error = √(0.24/300) = √0.0008 = 0.0283. Quadrupling n halves the standard error.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-2">🔑 Key Properties of Proportion Intervals</h5>
          <p className="text-sm text-neutral-300">
            Confidence intervals for proportions have unique characteristics:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>Maximum variability:</strong> Occurs when p ≈ 0.5, making intervals widest there</li>
            <li>• <strong>Normal approximation:</strong> Valid when np̂ ≥ 5 and n(1-p̂) ≥ 5</li>
            <li>• <strong>Self-estimating SE:</strong> We use p̂ to estimate both the parameter and its variability</li>
            <li>• <strong>Asymmetric for extreme p̂:</strong> Cannot extend below 0 or above 1</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Complete Example: Political Poll</h5>
          <div className="space-y-2">
            <p className="text-sm text-neutral-300">
              <strong>Given:</strong> 120 of 300 voters support candidate (p̂ = 0.40), 95% confidence
            </p>
            <p className="text-sm text-neutral-300">
              <strong>Check conditions:</strong> np̂ = 300(0.40) = 120 ≥ 5 ✓, n(1-p̂) = 300(0.60) = 180 ≥ 5 ✓
            </p>
            <div className="text-center my-3">
              <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
                __html: `\\[0.40 \\pm 1.96 \\times \\sqrt{\\frac{0.40 \\times 0.60}{300}} = 0.40 \\pm 1.96 \\times 0.0283 = 0.40 \\pm 0.0555\\]` 
              }} />
            </div>
            <p className="text-sm text-neutral-300">
              <strong>Result:</strong> [0.3445, 0.4555] or [34.45%, 45.55%]
            </p>
            <p className="text-sm text-neutral-300">
              <strong>Interpretation:</strong> We are 95% confident that between 34.45% and 45.55% of all voters support this candidate.
            </p>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(understanding).map(([key, understood]) => (
            <div 
              key={key}
              className={`p-3 rounded-lg text-center transition-all ${
                understood 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-neutral-700/50 border border-neutral-600'
              }`}
            >
              <p className="text-xs font-medium">
                {key === 'sampleProportionConcept' && 'Sample p̂'}
                {key === 'plusMinusConcept' && 'Interval'}
                {key === 'zCriticalConcept' && 'Z Critical'}
                {key === 'pHatConcept' && 'Success p̂'}
                {key === 'oneMinusPHatConcept' && 'Failure (1-p̂)'}
                {key === 'sampleSizeConcept' && 'Sample Size'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Perfect! You understand proportion confidence intervals!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Check np̂ ≥ 5 and n(1-p̂) ≥ 5 before using this formula
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ProportionCIBuilder.displayName = 'ProportionCIBuilder';

export default ProportionCIBuilder;