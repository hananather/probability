"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, BarChart3, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const EffectSizeBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    meanDifference: false,
    pooledStandardDeviation: false
  });
  
  const [understanding, setUnderstanding] = useState({
    meanDifferenceConcept: false,
    pooledStandardDeviationConcept: false
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
        Build Cohen's d Effect Size Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to measure the practical significance of differences
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">d =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.meanDifferenceConcept ? 'text-green-400' : 
                selectedParts.meanDifference ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('meanDifference', 'meanDifferenceConcept')}
            >
              <span className="text-sm">x̄₁ - x̄₂</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.pooledStandardDeviationConcept ? 'text-green-400' : 
                selectedParts.pooledStandardDeviation ? 'text-purple-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('pooledStandardDeviation', 'pooledStandardDeviationConcept')}
            >
              <span className="text-sm">sp</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative formula for single sample (vs population):</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[d = \\frac{\\bar{x} - \\mu}{s} \\quad \\text{or} \\quad d = \\frac{\\bar{x} - \\mu}{\\sigma}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Cohen's d standardizes differences in units of standard deviations
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.meanDifference && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              x̄₁ - x̄₂ - Raw Difference Between Means
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator is the raw difference between group means. This tells us the magnitude of the difference in the original units of measurement, but doesn't account for variability.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Treatment group mean = 85, Control group mean = 80, so x̄₁ - x̄₂ = 5 points
              </p>
            </div>
          </div>
        )}

        {selectedParts.pooledStandardDeviation && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              sp - Pooled Standard Deviation
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator standardizes the difference by dividing by the pooled standard deviation. This converts the raw difference into units of standard deviations, making it comparable across different scales.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If sp = 10, then our 5-point difference becomes d = 5/10 = 0.5 standard deviations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-4 border border-violet-500/30">
          <h5 className="font-semibold text-violet-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Cohen's d measures practical significance independent of sample size:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Standardized measure (unitless)</li>
            <li>• Independent of sample size (unlike p-values)</li>
            <li>• Allows comparison across different studies</li>
            <li>• Focuses on practical vs statistical significance</li>
          </ul>
        </div>
      )}

      {/* Effect Size Interpretation */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Cohen's Guidelines for Effect Size Interpretation
          </h5>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-800/30 p-3 rounded">
                <p className="font-medium text-green-300 mb-1">Small Effect</p>
                <p className="text-neutral-400 font-mono">d = 0.2</p>
                <p className="text-xs text-neutral-500 mt-1">Subtle difference</p>
              </div>
              <div className="bg-yellow-800/30 p-3 rounded">
                <p className="font-medium text-yellow-300 mb-1">Medium Effect</p>
                <p className="text-neutral-400 font-mono">d = 0.5</p>
                <p className="text-xs text-neutral-500 mt-1">Noticeable difference</p>
              </div>
              <div className="bg-red-800/30 p-3 rounded">
                <p className="font-medium text-red-300 mb-1">Large Effect</p>
                <p className="text-neutral-400 font-mono">d = 0.8</p>
                <p className="text-xs text-neutral-500 mt-1">Substantial difference</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              These are rough guidelines; context matters more than arbitrary cutoffs
            </p>
          </div>
        </div>
      )}

      {/* Effect Size vs P-Values */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Effect Size vs P-Values</h5>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-violet-800/30 p-3 rounded">
                <p className="font-medium text-violet-300 mb-2">Effect Size (Cohen's d):</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Measures practical significance</li>
                  <li>• Independent of sample size</li>
                  <li>• Standardized and comparable</li>
                  <li>• Answers "How big is the difference?"</li>
                </ul>
              </div>
              <div className="bg-teal-800/30 p-3 rounded">
                <p className="font-medium text-teal-300 mb-2">P-Values:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Measures statistical significance</li>
                  <li>• Influenced by sample size</li>
                  <li>• Context-dependent interpretation</li>
                  <li>• Answers "Is there evidence of difference?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Comparing Study Methods</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[d = \\frac{78 - 74}{8.5} = \\frac{4}{8.5} = 0.47\\]` 
            }} />
          </div>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Comparing active learning vs traditional lecture: Active learning mean = 78, Traditional mean = 74, pooled SD = 8.5.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded text-xs space-y-1">
              <p><strong>Interpretation:</strong> d = 0.47 indicates a small-to-medium effect size</p>
              <p><strong>Meaning:</strong> Active learning improves scores by almost half a standard deviation</p>
              <p><strong>Practical significance:</strong> This is a meaningful improvement worth implementing</p>
            </div>
            <p>
              Even if p-value is not significant (due to small sample), d = 0.47 suggests the difference may still be practically important.
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
                {key === 'meanDifferenceConcept' && 'Raw Mean Difference'}
                {key === 'pooledStandardDeviationConcept' && 'Standardizing Denominator'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand Cohen's d effect size!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Effect size tells us practical significance beyond just statistical significance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

EffectSizeBuilder.displayName = 'EffectSizeBuilder';

export default EffectSizeBuilder;