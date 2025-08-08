"use client";
import React, { useState } from 'react';
import { Check, Target, Minus, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const TDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    tStatistic: false,
    sampleMean: false,
    popMean: false,
    sampleStd: false,
    sampleSize: false,
    difference: false
  });
  
  const [understanding, setUnderstanding] = useState({
    tStatisticConcept: false,
    sampleMeanConcept: false,
    popMeanConcept: false,
    sampleStdConcept: false,
    sampleSizeConcept: false,
    differenceConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-rose-900/20 to-pink-900/20 rounded-lg p-6 border border-rose-700/50">
      <h3 className="text-xl font-bold text-rose-400 mb-6">
        Build the t-Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we standardize when σ is unknown
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* t-statistic */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.tStatisticConcept ? 'text-green-400' : 
              selectedParts.tStatistic ? 'text-rose-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('tStatistic', 'tStatisticConcept')}
          >
            <span className="block text-sm">t</span>
            <span className="block text-xs">statistic</span>
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator - Difference */}
            <div className="flex items-center gap-1">
              <span className="text-neutral-500">(</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.sampleMeanConcept ? 'text-green-400' : 
                  selectedParts.sampleMean ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sampleMean', 'sampleMeanConcept')}
              >
                <span className="block text-xs">sample</span>
                <span className="block text-xs">mean</span>
              </div>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.differenceConcept ? 'text-green-400' : 
                  selectedParts.difference ? 'text-yellow-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('difference', 'differenceConcept')}
              >
                <span className="text-lg">-</span>
              </div>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.popMeanConcept ? 'text-green-400' : 
                  selectedParts.popMean ? 'text-cyan-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('popMean', 'popMeanConcept')}
              >
                <span className="block text-xs">hypothesized</span>
                <span className="block text-xs">mean</span>
              </div>
              <span className="text-neutral-500">)</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator - Standard Error with sample std */}
            <div className="flex items-center gap-1">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.sampleStdConcept ? 'text-green-400' : 
                  selectedParts.sampleStd ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sampleStd', 'sampleStdConcept')}
              >
                <span className="block text-xs">sample</span>
                <span className="block text-xs">std dev</span>
              </div>
              <span className="text-neutral-500">/</span>
              <span className="text-neutral-500">√</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.sampleSizeConcept ? 'text-green-400' : 
                  selectedParts.sampleSize ? 'text-purple-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sampleSize', 'sampleSizeConcept')}
              >
                <span className="block text-xs">sample</span>
                <span className="block text-xs">size</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{x} - \\mu}{s / \\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where t follows a t-distribution with (n-1) degrees of freedom
          </p>
        </div>

        {/* Comparison with Z-score */}
        <div className="mt-4 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Compare with Z-score (when σ is known):</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\bar{x} - \\mu}{\\sigma / \\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The key difference: we use sample standard deviation s instead of population σ
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.tStatistic && (
          <div className="bg-rose-900/20 rounded-lg p-4 border border-rose-500/30">
            <h5 className="font-semibold text-rose-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              t-Statistic - Standardized When σ Unknown
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              A standardized score that measures how far the sample mean is from the hypothesized population mean, in units of estimated standard error. Follows a t-distribution, not normal.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Key:</strong> Uses sample standard deviation s (estimated), so has more uncertainty than Z-score
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.difference && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Minus className="w-4 h-4" />
              The Difference (x̄ - μ) - Signal
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              How far our sample mean is from what we expect under the null hypothesis. This is the "signal" - the effect we're trying to detect.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If H₀: μ = 100 and x̄ = 105, the difference is 5 units
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleMean && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Sample Mean (x̄) - What We Observed
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The average from our actual sample data. This is what we calculated from real observations.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Sample of 20 students had average test score x̄ = 78.5
              </p>
            </div>
          </div>
        )}

        {selectedParts.popMean && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Hypothesized Mean (μ) - What We're Testing
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The population mean we're testing against (from our null hypothesis H₀: μ = some value). This is our baseline assumption.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Testing if average score equals 75: H₀: μ = 75
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleStd && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sample Standard Deviation (s) - Estimated Noise
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Our estimate of population variability, calculated from sample data using Bessel's correction (n-1). This adds uncertainty compared to knowing true σ.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Key:</strong> Since s is estimated, we need t-distribution (heavier tails) instead of normal
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleSize && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Sample Size (n) - Degrees of Freedom
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Determines both the standard error magnitude and the t-distribution shape. Larger n gives t-distribution closer to normal, and smaller standard error.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Note:</strong> t-distribution has (n-1) degrees of freedom due to estimating μ with x̄
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.tStatistic && selectedParts.sampleStd && (
        <div className="mt-6 bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg p-4 border border-rose-500/30">
          <h5 className="font-semibold text-rose-400 mb-2">🔑 t vs Z: The Uncertainty Trade-off</h5>
          <p className="text-sm text-neutral-300">
            The t-statistic accounts for the extra uncertainty from estimating σ:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>Z-score:</strong> Uses known σ → Normal distribution</li>
            <li>• <strong>t-statistic:</strong> Uses estimated s → t-distribution (heavier tails)</li>
            <li>• Heavier tails mean we need stronger evidence to reject H₀</li>
            <li>• As n increases, t-distribution approaches normal distribution</li>
          </ul>
        </div>
      )}

      {/* Degrees of Freedom */}
      {allUnderstood && (
        <div className="mt-6 bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">Degrees of Freedom: n - 1</h5>
          <p className="text-sm text-neutral-300 mb-2">
            Why do we lose one degree of freedom when using the sample standard deviation?
          </p>
          <div className="bg-neutral-800/50 p-3 rounded mt-2">
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• We use x̄ to calculate s, creating a constraint</li>
              <li>• Once we know (n-1) deviations and x̄, the last deviation is determined</li>
              <li>• This constraint reduces our effective sample size by 1</li>
              <li>• Results in t-distribution with heavier tails than normal</li>
            </ul>
          </div>
        </div>
      )}

      {/* When to Use t vs Z */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">When to Use t vs Z</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-emerald-300">Use t-statistic when:</p>
              <ul className="text-xs text-neutral-400 mt-1 space-y-1">
                <li>• Population σ is unknown</li>
                <li>• Small to moderate sample sizes</li>
                <li>• Testing means with sample data</li>
                <li>• Most real-world situations</li>
              </ul>
            </div>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-red-300">Use Z-score when:</p>
              <ul className="text-xs text-neutral-400 mt-1 space-y-1">
                <li>• Population σ is known (rare)</li>
                <li>• Very large sample sizes (n &gt; 30)</li>
                <li>• Theoretical problems</li>
                <li>• t ≈ Z when n is large</li>
              </ul>
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
              <p className="text-sm font-medium">
                {key === 'tStatisticConcept' && 't-Statistic'}
                {key === 'sampleMeanConcept' && 'Sample Mean'}
                {key === 'popMeanConcept' && 'Hypothesized μ'}
                {key === 'sampleStdConcept' && 'Sample Std Dev'}
                {key === 'sampleSizeConcept' && 'Sample Size'}
                {key === 'differenceConcept' && 'Difference'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the t-distribution formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: t-statistic = signal/noise, where noise is estimated (not known).
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TDistributionBuilder.displayName = 'TDistributionBuilder';

export default TDistributionBuilder;