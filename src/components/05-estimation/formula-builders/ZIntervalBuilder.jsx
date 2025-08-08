"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ZIntervalBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    sampleMean: false,
    plusMinus: false,
    zCritical: false,
    sigma: false,
    sampleSize: false
  });
  
  const [understanding, setUnderstanding] = useState({
    sampleMeanConcept: false,
    plusMinusConcept: false,
    zCriticalConcept: false,
    sigmaConcept: false,
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-6 border border-blue-700/50">
      <h3 className="text-xl font-bold text-blue-400 mb-6">
        Build the Z-Interval Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand confidence intervals when σ is known
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* x̄ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.sampleMeanConcept ? 'text-green-400' : 
              selectedParts.sampleMean ? 'text-teal-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('sampleMean', 'sampleMeanConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="block text-sm">sample</span>
              <span className="block text-sm">mean</span>
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
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* σ */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.sigmaConcept ? 'text-green-400' : 
                selectedParts.sigma ? 'text-purple-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('sigma', 'sigmaConcept')}
            >
              <span className="block text-sm">population</span>
              <span className="block text-sm">std dev</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* √n */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.sampleSizeConcept ? 'text-green-400' : 
                selectedParts.sampleSize ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('sampleSize', 'sampleSizeConcept')}
            >
              <span className="block text-sm">√sample</span>
              <span className="block text-sm">size</span>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\times \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Valid when σ is known and population is normal, or n ≥ 30 by CLT
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.sampleMean && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              x̄ - Sample Mean (Center of Interval)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The sample mean is our best unbiased point estimate for the population mean μ. It forms the center of our confidence interval.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If 36 students scored an average of x̄ = 85 on a test, this is our estimate for the population mean
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
              Creates a symmetric interval around the sample mean, accounting for sampling uncertainty. The width depends on our confidence level and sampling variability.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If margin of error = 3, then 85 ± 3 gives interval [82, 88]
              </p>
            </div>
          </div>
        )}

        {selectedParts.zCritical && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              z(α/2) - Critical Z-Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The z-value that cuts off α/2 area in each tail of the standard normal distribution. Higher confidence requires larger z-values.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Common values:</strong> 90% → z = 1.645, 95% → z = 1.96, 99% → z = 2.576
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
              The known population standard deviation. This is what distinguishes z-intervals from t-intervals - we know the exact population variability.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If test scores have σ = 12 points (known from historical data), we use this exact value
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleSize && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              √n - Sample Size Effect
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The square root of sample size in the denominator shows that standard error decreases as sample size increases. Larger samples give more precise intervals.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> With n = 36 students, √36 = 6, so SE = σ/6. Quadrupling sample size halves the standard error.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">🔑 When to Use Z-Intervals</h5>
          <p className="text-sm text-neutral-300">
            Z-intervals are appropriate when we know the population standard deviation σ:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>Known σ:</strong> From historical data, specifications, or theory</li>
            <li>• <strong>Normal population:</strong> Or large sample size (n ≥ 30) by Central Limit Theorem</li>
            <li>• <strong>More precise:</strong> Than t-intervals because no uncertainty in σ</li>
            <li>• <strong>Standard error:</strong> σ/√n is exact, not estimated</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Complete Example: SAT Scores</h5>
          <div className="space-y-2">
            <p className="text-sm text-neutral-300">
              <strong>Given:</strong> n = 36 students, x̄ = 1150, σ = 120 (known), 95% confidence
            </p>
            <div className="text-center my-3">
              <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
                __html: `\\[1150 \\pm 1.96 \\times \\frac{120}{\\sqrt{36}} = 1150 \\pm 1.96 \\times 20 = 1150 \\pm 39.2\\]` 
              }} />
            </div>
            <p className="text-sm text-neutral-300">
              <strong>Interpretation:</strong> We are 95% confident that the true mean SAT score is between 1110.8 and 1189.2 points.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Notice how the known σ = 120 gives us a precise standard error of exactly 20 points.
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
                {key === 'sampleMeanConcept' && 'Sample Mean'}
                {key === 'plusMinusConcept' && 'Interval'}
                {key === 'zCriticalConcept' && 'Z Critical'}
                {key === 'sigmaConcept' && 'Known σ'}
                {key === 'sampleSizeConcept' && 'Sample Size'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand Z-intervals for known σ!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Use z when σ is known, t when σ is unknown (estimated with s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ZIntervalBuilder.displayName = 'ZIntervalBuilder';

export default ZIntervalBuilder;