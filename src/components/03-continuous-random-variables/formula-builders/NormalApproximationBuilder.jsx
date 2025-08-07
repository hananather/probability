"use client";
import React, { useState } from 'react';
import { Check, Target, TrendingUp, Sigma, ArrowRight, Users } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const NormalApproximationBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    binomial: false,
    approximation: false,
    mean: false,
    variance: false,
    conditions: false,
    continuity: false
  });
  
  const [understanding, setUnderstanding] = useState({
    centralLimit: false,
    meanFormula: false,
    varianceFormula: false,
    validityConditions: false,
    continuityCorrection: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-lg p-6 border border-indigo-700/50">
      <h3 className="text-xl font-bold text-indigo-400 mb-6">
        Build the Normal Approximation to Binomial Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand when and how binomial becomes normal
        </p>
        
        {/* Interactive Approximation Display */}
        <div className="mb-6">
          <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
            {/* B(n,p) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.centralLimit ? 'text-green-400' : 
                selectedParts.binomial ? 'text-indigo-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('binomial', 'centralLimit')}
            >
              B(n, p)
            </div>
            
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                selectedParts.approximation ? 'text-cyan-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('approximation')}
            >
              <ArrowRight className="w-6 h-6" />
            </div>
            
            {/* N(μ, σ²) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                selectedParts.approximation ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('approximation')}
            >
              N(μ, σ²)
            </div>
          </div>
        </div>

        {/* Parameter mapping */}
        <div className="mb-6">
          <p className="text-lg text-neutral-300 mb-4">Parameter Mapping:</p>
          <div className="space-y-3">
            {/* Mean */}
            <div className="text-xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
              <span className="text-neutral-500">μ =</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.meanFormula ? 'text-green-400' : 
                  selectedParts.mean ? 'text-yellow-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('mean', 'meanFormula')}
              >
                n × p
              </div>
            </div>
            
            {/* Variance */}
            <div className="text-xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
              <span className="text-neutral-500">σ² =</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.varianceFormula ? 'text-green-400' : 
                  selectedParts.variance ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('variance', 'varianceFormula')}
              >
                n × p × (1 - p)
              </div>
            </div>
          </div>
        </div>

        {/* Conditions for validity */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400 mb-3">Conditions for good approximation:</p>
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-4 py-3 rounded-lg border mx-auto max-w-md ${
              understanding.validityConditions ? 'text-green-400 border-green-500/30 bg-green-900/20' : 
              selectedParts.conditions ? 'text-purple-400 border-purple-500/30 bg-purple-900/20' : 'text-neutral-400 border-neutral-600'
            }`}
            onClick={() => handlePartClick('conditions', 'validityConditions')}
          >
            <p className="text-lg font-mono">np ≥ 5 and n(1-p) ≥ 5</p>
            <p className="text-xs mt-1">Both conditions must be met</p>
          </div>
        </div>

        {/* Continuity correction */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Continuity Correction (optional enhancement):</p>
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
              understanding.continuityCorrection ? 'text-green-400' : 
              selectedParts.continuity ? 'text-pink-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('continuity', 'continuityCorrection')}
          >
            <div className="text-sm font-mono text-neutral-300">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[P(X = k) \\approx P(k - 0.5 < Y < k + 0.5)\\]` 
              }} />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Adjust discrete values by ±0.5 for better accuracy
            </p>
          </div>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.binomial && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              B(n,p) - The Binomial Distribution
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Counts the number of successes in n independent trials, each with probability p. Becomes hard to calculate for large n.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Flipping a coin 100 times (n=100, p=0.5) - exact binomial calculation is complex
              </p>
            </div>
          </div>
        )}

        {selectedParts.approximation && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              The Approximation Arrow
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              For large n, the discrete binomial distribution approaches the continuous normal distribution shape. This is a consequence of the Central Limit Theorem.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Why it works:</strong> Sum of many independent random variables tends toward normal, regardless of individual distributions
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.mean && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              μ = np - The Expected Number of Successes
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The mean of the binomial distribution becomes the mean of the normal approximation. It's the expected number of successes in n trials.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 100 coin flips: μ = 100 × 0.5 = 50 expected heads
              </p>
            </div>
          </div>
        )}

        {selectedParts.variance && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              σ² = np(1-p) - The Variance
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The variance of the binomial becomes the variance of the normal. It measures the spread around the expected value.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 100 coin flips: σ² = 100 × 0.5 × 0.5 = 25, so σ = 5
              </p>
            </div>
          </div>
        )}

        {selectedParts.conditions && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              np ≥ 5 and n(1-p) ≥ 5 - Validity Conditions
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              These ensure we have enough expected successes AND failures for the normal shape to emerge. Both conditions must be satisfied.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> n=100, p=0.02: np=2 &lt; 5, so approximation is poor. Need larger n or different p.
              </p>
            </div>
          </div>
        )}

        {selectedParts.continuity && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Continuity Correction - Bridging Discrete to Continuous
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Since binomial is discrete but normal is continuous, we adjust discrete values by ±0.5 to account for this difference.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(X = 45) becomes P(44.5 &lt; Y &lt; 45.5) for better approximation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.binomial && selectedParts.approximation && (
        <div className="mt-6 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The normal approximation transforms <strong>difficult discrete calculations</strong> into <strong>easy continuous ones</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Binomial: P(X = k) requires complex combinatorial formulas</li>
            <li>• Normal: Use standard Z-tables and simple arithmetic</li>
            <li>• Works because of the Central Limit Theorem</li>
            <li>• Accuracy improves as n increases and p approaches 0.5</li>
          </ul>
        </div>
      )}

      {/* When to use */}
      {understanding.centralLimit && understanding.validityConditions && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">When to Use This Approximation</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-400 mb-1">✓ Good candidates:</p>
              <ul className="space-y-1 text-neutral-400">
                <li>• Large sample sizes (n ≥ 30)</li>
                <li>• p close to 0.5</li>
                <li>• Both np ≥ 5 and n(1-p) ≥ 5</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-400 mb-1">✗ Avoid when:</p>
              <ul className="space-y-1 text-neutral-400">
                <li>• Very small or large p (close to 0 or 1)</li>
                <li>• Small sample sizes</li>
                <li>• Either condition fails</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
          <h5 className="font-semibold text-teal-400 mb-2">Concrete Example: Quality Control</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[B(200, 0.1) \\approx N(20, 18)\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Inspecting 200 items with 10% defect rate. Instead of complex binomial calculations:
          </p>
          <ul className="text-sm text-neutral-400 mt-2 space-y-1">
            <li>• μ = 200 × 0.1 = 20 expected defects</li>
            <li>• σ² = 200 × 0.1 × 0.9 = 18, so σ ≈ 4.24</li>
            <li>• Conditions: np = 20 ≥ 5 ✓, n(1-p) = 180 ≥ 5 ✓</li>
            <li>• Use Z-score: Z = (X - 20) / 4.24</li>
          </ul>
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
                {key === 'centralLimit' && 'Central Limit'}
                {key === 'meanFormula' && 'Mean Formula'}
                {key === 'varianceFormula' && 'Variance Formula'}
                {key === 'validityConditions' && 'Validity Check'}
                {key === 'continuityCorrection' && 'Continuity Fix'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the normal approximation to binomial!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Check conditions first, then use μ = np and σ² = np(1-p).
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

NormalApproximationBuilder.displayName = 'NormalApproximationBuilder';

export default NormalApproximationBuilder;