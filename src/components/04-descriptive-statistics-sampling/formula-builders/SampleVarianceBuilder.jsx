"use client";
import React, { useState } from 'react';
import { Check, Target, Minus, TrendingUp, AlertCircle } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const SampleVarianceBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    variance: false,
    besselCorrection: false,
    deviations: false,
    squaredDeviations: false,
    sum: false
  });
  
  const [understanding, setUnderstanding] = useState({
    varianceConcept: false,
    besselCorrectionConcept: false,
    deviationsConcept: false,
    squaredDeviationsConcept: false,
    sumConcept: false
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
        Build the Sample Variance Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we measure spread in a sample
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* Sample Variance */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.varianceConcept ? 'text-green-400' : 
              selectedParts.variance ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('variance', 'varianceConcept')}
          >
            <span className="block text-sm">sample</span>
            <span className="block text-sm">variance</span>
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator - Sum of squared deviations */}
            <div className="flex items-center gap-1">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.sumConcept ? 'text-green-400' : 
                  selectedParts.sum ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sum', 'sumConcept')}
              >
                <span className="block text-xs">sum of</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                    understanding.deviationsConcept ? 'text-green-400' : 
                    selectedParts.deviations ? 'text-yellow-400' : 'text-neutral-400'
                  }`}
                  onClick={() => handlePartClick('deviations', 'deviationsConcept')}
                >
                  <span className="block text-xs">(xi - x̄)</span>
                </div>
                <div 
                  className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                    understanding.squaredDeviationsConcept ? 'text-green-400' : 
                    selectedParts.squaredDeviations ? 'text-cyan-400' : 'text-neutral-400'
                  }`}
                  onClick={() => handlePartClick('squaredDeviations', 'squaredDeviationsConcept')}
                >
                  <span className="block text-xs">squared</span>
                </div>
              </div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator - Bessel's Correction */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.besselCorrectionConcept ? 'text-green-400' : 
                selectedParts.besselCorrection ? 'text-amber-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('besselCorrection', 'besselCorrectionConcept')}
            >
              <span className="block text-sm">n - 1</span>
              <span className="block text-xs">(degrees of freedom)</span>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[s^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where s² is sample variance, n is sample size, xi are observations, and x̄ is the sample mean
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.variance && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sample Variance (s²) - Measuring Spread
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              A measure of how spread out the data points are around the sample mean. Larger variance means more spread; smaller variance means data clustered near the mean.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Test scores {88, 90, 92} have low variance; {60, 90, 120} have high variance
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.deviations && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Deviations - (xi - x̄)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              For each data point, calculate how far it is from the mean. These deviations can be positive (above mean) or negative (below mean).
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If x̄ = 90, then for xi = 85: deviation = 85-90 = -5 (below mean)
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.squaredDeviations && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Squared Deviations - (xi - x̄)²
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              For each data point, subtract the mean and square the result. Squaring ensures all deviations are positive and emphasizes larger deviations.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If x̄ = 90, then for xi = 85: (85-90)² = (-5)² = 25
              </p>
            </div>
          </div>
        )}

        {selectedParts.sum && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Minus className="w-4 h-4" />
              Sum of Squared Deviations - The Numerator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Add up all the squared deviations. This gives us the total "spread energy" in the dataset.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For {85, 90, 95} with x̄ = 90: (85-90)² + (90-90)² + (95-90)² = 25 + 0 + 25 = 50
              </p>
            </div>
          </div>
        )}

        {selectedParts.besselCorrection && (
          <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
            <h5 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Bessel's Correction - Why n-1 Instead of n?
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              We divide by n-1 (not n) because using the sample mean in our calculation "uses up" one degree of freedom. This correction makes our estimate unbiased.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Why:</strong> Since Σ(xi - x̄) = 0 always, once we know n-1 deviations, the last one is determined
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight - Bessel's Correction */}
      {selectedParts.besselCorrection && selectedParts.variance && (
        <div className="mt-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-4 border border-amber-500/30">
          <h5 className="font-semibold text-amber-400 mb-2">🔑 Why Bessel's Correction Matters</h5>
          <p className="text-sm text-neutral-300">
            The n-1 correction is crucial for getting an <strong>unbiased estimate</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Using n would systematically <strong>underestimate</strong> the population variance</li>
            <li>• Sample mean is usually closer to sample points than population mean</li>
            <li>• n-1 "degrees of freedom" because one constraint: Σ(xi - x̄) = 0</li>
            <li>• Makes E[s²] = σ² - gives us an unbiased estimator</li>
          </ul>
        </div>
      )}

      {/* Population vs Sample Variance */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Population vs Sample Variance</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-red-300">Population Variance (σ²)</p>
              <div className="text-xs text-neutral-400 mt-1" dangerouslySetInnerHTML={{ 
                __html: `\\[\\sigma^2 = \\frac{1}{N} \\sum_{i=1}^N (x_i - \\mu)^2\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">Divide by N (population size)</p>
            </div>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-emerald-300">Sample Variance (s²)</p>
              <div className="text-xs text-neutral-400 mt-1" dangerouslySetInnerHTML={{ 
                __html: `\\[s^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">Divide by n-1 (Bessel's correction)</p>
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
                {key === 'varianceConcept' && 'Variance'}
                {key === 'besselCorrectionConcept' && 'Bessel\'s Correction'}
                {key === 'deviationsConcept' && 'Deviations'}
                {key === 'squaredDeviationsConcept' && 'Squared Deviations'}
                {key === 'sumConcept' && 'Sum'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Correct! You understand sample variance and Bessel's correction!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: n-1 gives us an unbiased estimate of population variance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

SampleVarianceBuilder.displayName = 'SampleVarianceBuilder';

export default SampleVarianceBuilder;