"use client";
import React, { useState } from 'react';
import { Check, Target, TrendingUp, Sigma, Calculator } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ZScoreBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false,
    value: false,
    mean: false,
    stdDev: false
  });
  
  const [understanding, setUnderstanding] = useState({
    standardization: false,
    deviation: false,
    standardUnits: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-6 border border-emerald-700/50">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">
        Build the Z-Score Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to standardize any value
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">Z =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator (X - μ) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.deviation ? 'text-green-400' : 
                selectedParts.numerator ? 'text-emerald-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('numerator', 'deviation')}
            >
              <span className="block text-sm">X - μ</span>
              <span className="block text-xs">deviation</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator (σ) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.standardUnits ? 'text-green-400' : 
                selectedParts.denominator ? 'text-cyan-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('denominator', 'standardUnits')}
            >
              <span className="block text-sm">σ</span>
              <span className="block text-xs">std dev</span>
            </div>
          </div>
        </div>

        {/* Highlight individual parameters */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400 mb-3">Components of the Z-score:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {/* X - Value */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded-lg border ${
                understanding.standardization ? 'text-green-400 border-green-500/30 bg-green-900/20' : 
                selectedParts.value ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('value', 'standardization')}
            >
              <span className="text-lg font-mono">X</span>
              <p className="text-xs mt-1">Raw Value</p>
            </div>
            
            {/* μ - Mean */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded-lg border ${
                selectedParts.mean ? 'text-orange-400 border-orange-500/30 bg-orange-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('mean')}
            >
              <span className="text-lg font-mono">μ</span>
              <p className="text-xs mt-1">Population Mean</p>
            </div>
            
            {/* σ - Standard Deviation */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded-lg border ${
                selectedParts.stdDev ? 'text-purple-400 border-purple-500/30 bg-purple-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('stdDev')}
            >
              <span className="text-lg font-mono">σ</span>
              <p className="text-xs mt-1">Standard Deviation</p>
            </div>
          </div>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Common applications:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{For sample: } Z = \\frac{X - \\bar{x}}{s} \\quad \\text{For standard normal: } Z \\sim N(0, 1)\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Sample version uses sample mean and standard deviation
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.numerator && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              X - μ - The Deviation from Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This measures how far your value is from the average. Positive means above average, negative means below.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If test average is 75 and you scored 85, your deviation is 85 - 75 = 10 points above average
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.denominator && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              σ - Standard Deviation (The Scale)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Dividing by standard deviation converts your deviation into "standard units" - how many standard deviations away you are.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If σ = 5, then being 10 points above average = 10/5 = 2 standard deviations above
              </p>
            </div>
          </div>
        )}

        {selectedParts.value && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              X - The Raw Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This is your actual measurement or observation that you want to standardize and compare.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Your height (68 inches), test score (92), or any measured value
              </p>
            </div>
          </div>
        )}

        {selectedParts.mean && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              μ - The Population Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The average value of the entire population. This is your reference point for "typical."
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Average adult height (μ = 66 inches), average SAT score (μ = 500)
              </p>
            </div>
          </div>
        )}

        {selectedParts.stdDev && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              σ - The Standard Deviation
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Measures how spread out the data is. It's our unit of measurement for "typical variation."
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Height variation (σ = 3 inches), SAT score variation (σ = 100 points)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.numerator && selectedParts.denominator && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Z-scores create a <strong>universal comparison scale</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Z = 0 means exactly at the average</li>
            <li>• Z = 1 means one standard deviation above average</li>
            <li>• Z = -2 means two standard deviations below average</li>
            <li>• 68% of values have |Z| &lt; 1, 95% have |Z| &lt; 2</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Concrete Example: Standardizing Test Scores</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{85 - 75}{10} = \\frac{10}{10} = 1.0\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            A test score of 85 with class average 75 and standard deviation 10 gives Z = 1.0.
            This student scored exactly one standard deviation above the class average.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-3 gap-3">
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
                {key === 'standardization' && 'Standardization'}
                {key === 'deviation' && 'Deviation'}
                {key === 'standardUnits' && 'Standard Units'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand Z-scores and standardization!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Z-scores let you compare values from different distributions on the same scale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ZScoreBuilder.displayName = 'ZScoreBuilder';

export default ZScoreBuilder;