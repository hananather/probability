"use client";
import React, { useState } from 'react';
import { Check, Target, Activity, Users, TrendingDown } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const StandardErrorBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    standardError: false,
    populationStdDev: false,
    sampleSize: false,
    sqrt: false
  });
  
  const [understanding, setUnderstanding] = useState({
    standardErrorConcept: false,
    populationStdDevConcept: false,
    sampleSizeConcept: false,
    sqrtConcept: false
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
        Build the Standard Error Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand the precision of sample means
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* Standard Error */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.standardErrorConcept ? 'text-green-400' : 
              selectedParts.standardError ? 'text-emerald-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
          >
            <span className="block text-sm">standard</span>
            <span className="block text-sm">error</span>
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator - Population Standard Deviation */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.populationStdDevConcept ? 'text-green-400' : 
                selectedParts.populationStdDev ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('populationStdDev', 'populationStdDevConcept')}
            >
              <span className="block text-sm">population</span>
              <span className="block text-sm">std dev</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator - Square Root of Sample Size */}
            <div className="flex items-center gap-1">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.sqrtConcept ? 'text-green-400' : 
                  selectedParts.sqrt ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('sqrt', 'sqrtConcept')}
              >
                <span className="block text-xs">square</span>
                <span className="block text-xs">root of</span>
              </div>
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
              __html: `\\[SE(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where SE is standard error of the mean, σ is population standard deviation, n is sample size
          </p>
        </div>

        {/* Alternative with sample standard deviation */}
        <div className="mt-4 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">When population σ is unknown (estimated standard error):</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[SE(\\bar{X}) = \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            We use sample standard deviation s as an estimate of σ
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.standardError && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Standard Error - Precision of Sample Means
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The standard deviation of the sampling distribution of sample means. It tells us how much sample means typically vary around the true population mean.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Interpretation:</strong> If SE = 2.5, about 68% of sample means will be within ±2.5 of the true population mean
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.populationStdDev && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Population Standard Deviation (σ) - The Numerator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Measures the inherent variability in the population. This represents the "raw" amount of spread in individual observations.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If individual exam scores have σ = 15 points, that's the baseline variability
              </p>
            </div>
          </div>
        )}

        {selectedParts.sqrt && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Square Root - The Reduction Factor
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The square root creates the magical "diminishing returns" effect. Each additional sample doesn't reduce error linearly - larger samples have diminishing impact.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> To halve the standard error, you need 4× the sample size (√4 = 2)
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleSize && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sample Size (n) - The Precision Driver
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Larger samples give more precise estimates. However, the improvement follows a square root pattern - to get twice the precision, you need four times the data.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> n = 100 → SE = σ/10; n = 400 → SE = σ/20 (half the error, 4× the sample)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.standardError && selectedParts.sqrt && selectedParts.sampleSize && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">🔑 The Square Root Law</h5>
          <p className="text-sm text-neutral-300">
            The standard error formula reveals the fundamental <strong>"Square Root Law"</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Sample mean precision improves with sample size, but with diminishing returns</li>
            <li>• To cut error in half, you need 4× more data</li>
            <li>• To cut error by 90%, you need 100× more data</li>
            <li>• This is why massive sample sizes often aren't cost-effective</li>
          </ul>
        </div>
      )}

      {/* Practical Examples */}
      {allUnderstood && (
        <div className="mt-6 bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">Practical Applications</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-indigo-300">Poll Accuracy</p>
              <p className="text-xs text-neutral-400 mt-1">
                News polls: SE = √(p(1-p)/n). For 50% support, n = 1000 gives SE ≈ 1.6%
              </p>
            </div>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-medium text-indigo-300">Quality Control</p>
              <p className="text-xs text-neutral-400 mt-1">
                Manufacturing: If parts vary with σ = 2mm, samples of 25 have SE = 0.4mm
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Size Planning */}
      {allUnderstood && (
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <h5 className="font-semibold text-yellow-400 mb-2">Sample Size Planning</h5>
          <p className="text-sm text-neutral-300">
            To achieve a desired standard error SE*:
          </p>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{\\sigma}{SE^*}\\right)^2\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-400">
            Example: Want SE = 1 when σ = 10? Need n = (10/1)² = 100 samples
          </p>
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
                {key === 'standardErrorConcept' && 'Standard Error'}
                {key === 'populationStdDevConcept' && 'Population σ'}
                {key === 'sqrtConcept' && 'Square Root'}
                {key === 'sampleSizeConcept' && 'Sample Size'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the standard error formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Standard error decreases with √n - bigger samples help, but with diminishing returns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

StandardErrorBuilder.displayName = 'StandardErrorBuilder';

export default StandardErrorBuilder;