"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3, Percent, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const SampleSizeProportionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    zCritical: false,
    proportion: false,
    oneMinus: false,
    marginError: false,
    squared: false
  });
  
  const [understanding, setUnderstanding] = useState({
    zCriticalConcept: false,
    proportionConcept: false,
    oneMinusConcept: false,
    marginErrorConcept: false,
    squaredConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-lg p-6 border border-emerald-700/50">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">
        Build the Sample Size Formula for Proportions Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to calculate required sample size for estimating proportions
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="text-neutral-500">n =</span>
          
          {/* z²(α/2) × p(1-p) / E² */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div className="inline-flex items-center gap-1">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.zCriticalConcept ? 'text-green-400' : 
                  selectedParts.zCritical ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('zCritical', 'zCriticalConcept')}
              >
                <div className="flex flex-col items-center">
                  <span className="block text-sm">z²</span>
                  <span className="block text-xs">(squared)</span>
                </div>
              </div>
              <span className="text-neutral-500">×</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.proportionConcept ? 'text-green-400' : 
                  selectedParts.proportion ? 'text-purple-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('proportion', 'proportionConcept')}
              >
                <div className="flex flex-col items-center">
                  <span className="block text-sm">p</span>
                  <span className="block text-xs">(prop.)</span>
                </div>
              </div>
              <span className="text-neutral-500">×</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.oneMinusConcept ? 'text-green-400' : 
                  selectedParts.oneMinus ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('oneMinus', 'oneMinusConcept')}
              >
                <div className="flex flex-col items-center">
                  <span className="block text-sm">(1-p)</span>
                  <span className="block text-xs">(failure)</span>
                </div>
              </div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.marginErrorConcept ? 'text-green-400' : 
                selectedParts.marginError ? 'text-red-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('marginError', 'marginErrorConcept')}
            >
              <div className="flex flex-col items-center">
                <span className="block text-sm">E²</span>
                <span className="block text-xs">(error squared)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\frac{z_{\\alpha/2}^2 \\times p(1-p)}{E^2}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            If p is unknown, use p = 0.5 for the most conservative (largest) sample size
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.zCritical && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              z²(α/2) - Squared Critical Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The critical z-value is squared in this formula. This means that increasing confidence level has an even more dramatic effect on sample size for proportions than for means.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Examples:</strong> 90% → z² = (1.645)² = 2.71, 95% → z² = (1.96)² = 3.84, 99% → z² = (2.576)² = 6.63
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.proportion && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              p - Population Proportion (Success Probability)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The true population proportion we're trying to estimate. If unknown, we use a prior estimate, pilot study result, or the most conservative value p = 0.5.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Strategy:</strong> Use p = 0.5 when no prior information exists - this maximizes p(1-p) and gives the largest (safest) sample size
              </p>
            </div>
          </div>
        )}

        {selectedParts.oneMinus && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              (1-p) - Failure Probability
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The complement of the success probability. Together with p, this creates the term p(1-p) which represents the variance of the binomial distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Maximum variability:</strong> p(1-p) is maximized when p = 0.5, where p(1-p) = 0.25. This is why p = 0.5 is conservative.
              </p>
            </div>
          </div>
        )}

        {selectedParts.marginError && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              E² - Squared Margin of Error
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The desired margin of error, squared. This is the maximum acceptable difference between your sample proportion and the true population proportion.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> To estimate within ±3 percentage points, E = 0.03, so E² = 0.0009. Small margins require very large samples!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">🔑 Key Insights for Proportion Sample Sizes</h5>
          <p className="text-sm text-neutral-300">
            Sample size calculation for proportions has unique properties:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>Maximum at p = 0.5:</strong> This is why we use p = 0.5 when p is unknown</li>
            <li>• <strong>Independent of population size:</strong> (unless population is small relative to sample)</li>
            <li>• <strong>Margin of error in denominator:</strong> Small improvements in precision are expensive</li>
            <li>• <strong>Common rule of thumb:</strong> n ≈ 1000 gives E ≈ 3% for 95% confidence</li>
          </ul>
        </div>
      )}

      {/* Concrete Examples - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Sample Size Examples for Proportions</h5>
          <div className="space-y-4">
            
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Example 1: Political Poll (Conservative)</p>
              <p className="text-xs text-neutral-400">
                <strong>Goal:</strong> 95% confidence, E = 3% = 0.03, p unknown (use p = 0.5)
              </p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\frac{(1.96)^2 \\times 0.5 \\times 0.5}{(0.03)^2} = \\frac{3.84 \\times 0.25}{0.0009} = \\frac{0.96}{0.0009} = 1067\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">Need 1,067 people for ±3% margin with 95% confidence.</p>
            </div>

            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Example 2: Quality Control (Known p)</p>
              <p className="text-xs text-neutral-400">
                <strong>Goal:</strong> 95% confidence, E = 2% = 0.02, expect p ≈ 0.1 (low defect rate)
              </p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\frac{(1.96)^2 \\times 0.1 \\times 0.9}{(0.02)^2} = \\frac{3.84 \\times 0.09}{0.0004} = \\frac{0.346}{0.0004} = 865\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">Need 865 items - smaller than the conservative estimate because p(1-p) is smaller when p ≠ 0.5.</p>
            </div>

            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Example 3: Precision Comparison</p>
              <p className="text-xs text-neutral-400">
                <strong>Same as Example 1, but E = 1.5% (half the margin):</strong>
              </p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\frac{(1.96)^2 \\times 0.5 \\times 0.5}{(0.015)^2} = \\frac{0.96}{0.000225} = 4267\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">Need 4,267 people - 4 times larger for half the margin of error!</p>
            </div>
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
                {key === 'zCriticalConcept' && 'Z² Critical'}
                {key === 'proportionConcept' && 'Proportion p'}
                {key === 'oneMinusConcept' && 'Failure (1-p)'}
                {key === 'marginErrorConcept' && 'Error E²'}
                {key === 'squaredConcept' && 'Squaring Effect'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Perfect! You understand sample size calculation for proportions!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Use p = 0.5 when unknown for the most conservative estimate
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

SampleSizeProportionBuilder.displayName = 'SampleSizeProportionBuilder';

export default SampleSizeProportionBuilder;