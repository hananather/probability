"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const SampleSizeMeanBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    zCritical: false,
    sigma: false,
    marginError: false,
    squared: false
  });
  
  const [understanding, setUnderstanding] = useState({
    zCriticalConcept: false,
    sigmaConcept: false,
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg p-6 border border-violet-700/50">
      <h3 className="text-xl font-bold text-violet-400 mb-6">
        Build the Sample Size Formula for Means Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to calculate required sample size for estimating means
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="text-neutral-500">n =</span>
          
          {/* (z(α/2) × σ / E)² */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.squaredConcept ? 'text-green-400' : 
              selectedParts.squared ? 'text-pink-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('squared', 'squaredConcept')}
          >
            <div className="inline-flex items-center">
              <span className="text-2xl">(</span>
              <div className="inline-flex flex-col items-center mx-1">
                {/* Numerator: z(α/2) × σ */}
                <div className="inline-flex items-center gap-1">
                  <div 
                    className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
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
                  <div 
                    className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                      understanding.sigmaConcept ? 'text-green-400' : 
                      selectedParts.sigma ? 'text-purple-400' : 'text-neutral-400'
                    }`}
                    onClick={() => handlePartClick('sigma', 'sigmaConcept')}
                  >
                    <div className="flex flex-col items-center">
                      <span className="block text-sm">population</span>
                      <span className="block text-sm">std dev</span>
                    </div>
                  </div>
                </div>
                
                {/* Fraction bar */}
                <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
                
                {/* Denominator: E */}
                <div 
                  className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                    understanding.marginErrorConcept ? 'text-green-400' : 
                    selectedParts.marginError ? 'text-orange-400' : 'text-neutral-400'
                  }`}
                  onClick={() => handlePartClick('marginError', 'marginErrorConcept')}
                >
                  <div className="flex flex-col items-center">
                    <span className="block text-sm">margin of</span>
                    <span className="block text-sm">error</span>
                  </div>
                </div>
              </div>
              <span className="text-2xl">)</span>
              <span className="text-xl align-super">²</span>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\times \\sigma}{E}\\right)^2\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Always round UP to the next integer to ensure the desired margin of error
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.zCritical && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              z(α/2) - Critical Value for Confidence Level
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The z-score that corresponds to your desired confidence level. Higher confidence requires larger critical values, which increases the required sample size.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Common values:</strong> 90% confidence → z = 1.645, 95% confidence → z = 1.96, 99% confidence → z = 2.576
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.sigma && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              σ - Population Standard Deviation
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The population standard deviation, which must be known or estimated from prior studies. More variable populations require larger sample sizes for the same precision.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>If unknown:</strong> Use a pilot study, historical data, or a conservative estimate. Some use σ ≈ range/4 as a rough approximation.
              </p>
            </div>
          </div>
        )}

        {selectedParts.marginError && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              E - Desired Margin of Error
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The maximum acceptable difference between your sample mean and the true population mean. Smaller margins of error require dramatically larger sample sizes.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If you want to estimate mean income within ±$500, then E = 500. This represents practical precision requirements.
              </p>
            </div>
          </div>
        )}

        {selectedParts.squared && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              ()² - The Squaring Effect
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The entire ratio is squared, which means small changes in confidence level or precision requirements can lead to dramatic changes in required sample size.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Key insight:</strong> Halving the margin of error requires 4× the sample size. Increasing confidence increases n by the square of the z‑ratio (e.g., 95% → 99% multiplies n by ≈ (2.576/1.96)² ≈ 1.73).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-4 border border-violet-500/30">
          <h5 className="font-semibold text-violet-400 mb-2">🔑 The Sample Size Tradeoffs</h5>
          <p className="text-sm text-neutral-300">
            Sample size determination involves balancing competing demands:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>Higher confidence</strong> → larger z → larger n</li>
            <li>• <strong>Higher precision</strong> (smaller E) → larger n (quadratically!)</li>
            <li>• <strong>More variable population</strong> (larger σ) → larger n</li>
            <li>• <strong>Cost constraints</strong> may limit achievable precision</li>
          </ul>
        </div>
      )}

      {/* Concrete Examples - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Sample Size Calculations</h5>
          <div className="space-y-4">
            
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Example 1: Estimating Average Height</p>
              <p className="text-xs text-neutral-400">
                <strong>Goal:</strong> 95% confidence, margin of error = 1 inch, σ = 4 inches
              </p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\left(\\frac{1.96 \\times 4}{1}\\right)^2 = (7.84)^2 = 61.47 \\rightarrow 62\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">Need 62 people to estimate mean height within ±1 inch.</p>
            </div>

            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Example 2: Comparing Precision</p>
              <p className="text-xs text-neutral-400">
                <strong>Same setup, but E = 0.5 inches (twice as precise):</strong>
              </p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\left(\\frac{1.96 \\times 4}{0.5}\\right)^2 = (15.68)^2 = 245.86 \\rightarrow 246\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">Need 246 people - 4 times larger for half the margin of error!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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
                {key === 'zCriticalConcept' && 'Critical Value'}
                {key === 'sigmaConcept' && 'Population σ'}
                {key === 'marginErrorConcept' && 'Margin of Error'}
                {key === 'squaredConcept' && 'Squaring Effect'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand sample size calculation for means!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Always round UP and consider the quadratic relationship with precision
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

SampleSizeMeanBuilder.displayName = 'SampleSizeMeanBuilder';

export default SampleSizeMeanBuilder;
