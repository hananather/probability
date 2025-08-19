"use client";
import React, { useState } from 'react';
import { Check, Target, Plus, Hash } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const SampleMeanBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    sampleMean: false,
    sum: false,
    sampleSize: false,
    observations: false
  });
  
  const [understanding, setUnderstanding] = useState({
    sampleMeanConcept: false,
    sumConcept: false,
    sampleSizeConcept: false,
    observationsConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 rounded-lg p-6 border border-teal-700/50">
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Build the Sample Mean Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we calculate the average of a sample
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* Sample Mean Symbol */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.sampleMeanConcept ? 'text-green-400' : 
              selectedParts.sampleMean ? 'text-teal-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('sampleMean', 'sampleMeanConcept')}
          >
            <span className="block text-sm">sample</span>
            <span className="block text-sm">mean</span>
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator - Sum with Observations */}
            <div className="flex items-center gap-1">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.observationsConcept ? 'text-green-400' : 
                  selectedParts.observations ? 'text-green-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('observations', 'observationsConcept')}
              >
                <span className="text-xs">Σxi</span>
              </div>
              <span className="text-neutral-500 text-xs">=</span>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.sumConcept ? 'text-green-400' : 
                  selectedParts.sum ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sum', 'sumConcept')}
              >
                <span className="block text-sm">sum of all</span>
                <span className="block text-sm">observations</span>
              </div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator - Sample Size */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.sampleSizeConcept ? 'text-green-400' : 
                selectedParts.sampleSize ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('sampleSize', 'sampleSizeConcept')}
            >
              <span className="block text-sm">sample</span>
              <span className="block text-sm">size</span>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where x̄ is the sample mean, n is sample size, and xi are individual observations
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.sampleMean && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sample Mean (x̄) - The Result
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The average value of all observations in your sample. It represents the "typical" value and is your best single estimate of the population mean.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Sample of 5 test scores: {85, 92, 78, 88, 97} → x̄ = 88
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.sum && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Sum of All Observations - The Numerator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Add up every single data point in your sample. This captures the total "amount" across all observations.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Test scores: 85 + 92 + 78 + 88 + 97 = 440
              </p>
            </div>
          </div>
        )}

        {selectedParts.observations && (
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
            <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Individual Observations (xi) - The Data Points
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Each xi represents an individual observation in your sample. These are the actual data values you collected.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Test scores x₁=85, x₂=92, x₃=78, x₄=88, x₅=97 are the individual observations
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleSize && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Sample Size (n) - The Denominator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Count how many observations you have. Dividing by n converts the total sum into an average per observation.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> We have 5 test scores, so n = 5 → 440 ÷ 5 = 88
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.sampleMean && selectedParts.sum && selectedParts.sampleSize && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-4 border border-teal-500/30">
          <h5 className="font-semibold text-teal-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The sample mean is fundamentally about <strong>redistribution</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• It redistributes the total equally among all observations</li>
            <li>• Values above the mean "donate" to values below the mean</li>
            <li>• The sum of deviations from the mean always equals zero</li>
            <li>• It minimizes the sum of squared deviations (least squares property)</li>
          </ul>
        </div>
      )}

      {/* Why We Use Sample Mean */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Why Sample Mean Matters</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-emerald-300">Unbiased Estimator</p>
              <p className="text-xs text-neutral-400 mt-1">
                E[x̄] = μ - The expected value of sample means equals the population mean
              </p>
            </div>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-emerald-300">Central Limit Theorem</p>
              <p className="text-xs text-neutral-400 mt-1">
                For large n, x̄ ~ N(μ, σ²/n) regardless of population distribution
              </p>
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
                {key === 'sampleMeanConcept' && 'Sample Mean'}
                {key === 'sumConcept' && 'Sum'}
                {key === 'sampleSizeConcept' && 'Sample Size'}
                {key === 'observationsConcept' && 'Observations'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Correct! You understand the sample mean formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's the total divided by the count - a fair redistribution of all values.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

SampleMeanBuilder.displayName = 'SampleMeanBuilder';

export default SampleMeanBuilder;