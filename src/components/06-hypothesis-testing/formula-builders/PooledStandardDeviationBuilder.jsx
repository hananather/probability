"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, BarChart3, Combine } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const PooledStandardDeviationBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    weightedVariances: false,
    degreesOfFreedom: false,
    squareRoot: false
  });
  
  const [understanding, setUnderstanding] = useState({
    weightedVariancesConcept: false,
    degreesOfFreedomConcept: false,
    combinedEstimatorConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-lg p-6 border border-amber-700/50">
      <h3 className="text-xl font-bold text-amber-400 mb-6">
        Build the Pooled Standard Deviation Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to combine variance estimates from two samples
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-1">
          <span className="text-neutral-500">sp =</span>
          
          {/* Square root symbol */}
          <span className="text-neutral-500">√</span>
          
          {/* Fraction inside square root */}
          <div className="inline-flex flex-col items-center border-l-2 border-neutral-500 pl-2">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-105 hover:text-white active:scale-95 px-2 ${
                understanding.weightedVariancesConcept ? 'text-green-400' : 
                selectedParts.weightedVariances ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('weightedVariances', 'weightedVariancesConcept')}
            >
              <div className="text-sm text-center">
                <div>(n₁-1)s₁² + (n₂-1)s₂²</div>
              </div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-105 hover:text-white active:scale-95 px-2 ${
                understanding.degreesOfFreedomConcept ? 'text-green-400' : 
                selectedParts.degreesOfFreedom ? 'text-amber-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('degreesOfFreedom', 'degreesOfFreedomConcept')}
            >
              <span className="text-sm">n₁ + n₂ - 2</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative forms of the pooled variance:</p>
          <div className="text-base font-mono text-neutral-300 space-y-2">
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[s_p^2 = \\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1 + n_2 - 2}\\]` 
            }} />
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[s_p = \\sqrt{s_p^2} = \\sqrt{\\frac{\\text{SS}_1 + \\text{SS}_2}{df_1 + df_2}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where SS = sum of squares and df = degrees of freedom
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.weightedVariances && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              (n₁-1)s₁² + (n₂-1)s₂² - Weighted Sum of Variances
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator combines the sum of squares from both samples. Each sample variance is weighted by its degrees of freedom (n-1), giving more influence to larger samples.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Group 1: n₁=20, s₁²=16 → (20-1)×16 = 304. Group 2: n₂=15, s₂²=25 → (15-1)×25 = 350. Sum = 654
              </p>
            </div>
          </div>
        )}

        {selectedParts.degreesOfFreedom && (
          <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
            <h5 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              n₁ + n₂ - 2 - Combined Degrees of Freedom
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator represents the total degrees of freedom from both samples. We subtract 2 because we estimated two sample means, reducing our degrees of freedom by one for each sample.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Group 1: df₁ = 20-1 = 19, Group 2: df₂ = 15-1 = 14. Total df = 19+14 = 33
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).slice(0, 2).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-4 border border-amber-500/30">
          <h5 className="font-semibold text-amber-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The pooled standard deviation combines information optimally:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Weights each sample by its degrees of freedom</li>
            <li>• Assumes both populations have the same variance (σ₁² = σ₂²)</li>
            <li>• Provides a more precise estimate than either sample alone</li>
            <li>• Used in pooled t-tests and effect size calculations</li>
          </ul>
        </div>
      )}

      {/* Why Pool Variances? */}
      {Object.values(selectedParts).slice(0, 2).every(Boolean) && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <Combine className="w-4 h-4" />
            Why Pool Variances?
          </h5>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-800/30 p-3 rounded">
                <p className="font-medium text-green-300 mb-2">Advantages:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Better estimate with more data</li>
                  <li>• Higher power for detecting differences</li>
                  <li>• Utilizes all available information</li>
                </ul>
              </div>
              <div className="bg-red-800/30 p-3 rounded">
                <p className="font-medium text-red-300 mb-2">Requirements:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Equal population variances</li>
                  <li>• Can be sensitive to violations</li>
                  <li>• Test with Levene's or F-test</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Pooling Test Scores</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[s_p = \\sqrt{\\frac{(25-1) \\times 36 + (20-1) \\times 49}{25 + 20 - 2}} = \\sqrt{\\frac{864 + 931}{43}} = \\sqrt{41.74} = 6.46\\]` 
            }} />
          </div>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Pooling variances from two classes: Class A (n₁=25, s₁=6, s₁²=36) and Class B (n₂=20, s₂=7, s₂²=49).
            </p>
            <div className="bg-neutral-800/50 p-2 rounded text-xs">
              <p><strong>Step by step:</strong></p>
              <p>• Weighted sum: (24×36) + (19×49) = 864 + 931 = 1795</p>
              <p>• Total df: 25 + 20 - 2 = 43</p>
              <p>• Pooled variance: s²p = 1795/43 = 41.74</p>
              <p>• Pooled SD: sp = √41.74 = 6.46</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                {key === 'weightedVariancesConcept' && 'Weighted Variances'}
                {key === 'degreesOfFreedomConcept' && 'Degrees of Freedom'}
                {key === 'combinedEstimatorConcept' && 'Combined Estimator'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the pooled standard deviation formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Only pool when you can assume equal population variances.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

PooledStandardDeviationBuilder.displayName = 'PooledStandardDeviationBuilder';

export default PooledStandardDeviationBuilder;