"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ConfidenceIntervalBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    sampleMean: false,
    plusMinus: false,
    criticalValue: false,
    standardError: false
  });
  
  const [understanding, setUnderstanding] = useState({
    sampleMeanConcept: false,
    plusMinusConcept: false,
    criticalValueConcept: false,
    standardErrorConcept: false
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
        Build the Confidence Interval Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to estimate population parameters
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
            <span>x̄</span>
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
          
          {/* t(α/2,df) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.criticalValueConcept ? 'text-green-400' : 
              selectedParts.criticalValue ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('criticalValue', 'criticalValueConcept')}
          >
            <span>t<sub>(α/2,df)</sub></span>
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* s/√n */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.standardErrorConcept ? 'text-green-400' : 
              selectedParts.standardError ? 'text-yellow-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">s</span>
              <div className="w-full h-0.5 bg-current my-1"></div>
              <span className="text-lg">√n</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing margin of error:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm E \\quad \\text{where} \\quad E = t_{(\\alpha/2,df)} \\times \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The margin of error E captures the uncertainty in our estimate
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.sampleMean && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              x̄ - Sample Mean (Point Estimate)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The sample mean serves as our best point estimate for the unknown population mean μ. It's the center of our confidence interval.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If 25 light bulbs have an average lifetime of x̄ = 1,200 hours, this is our estimate for the population mean
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.plusMinus && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              ± - Plus/Minus (Interval Nature)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The ± symbol creates an interval around our point estimate, acknowledging uncertainty. It gives us a range of plausible values for the population parameter.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 1,200 ± 50 hours gives us the interval [1,150, 1,250] hours for the true mean lifetime
              </p>
            </div>
          </div>
        )}

        {selectedParts.criticalValue && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              t(α/2,df) - Critical t-Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The critical value from the t-distribution determines how wide our interval needs to be for the desired confidence level. Larger confidence levels require larger critical values.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For 95% confidence with df = 24, t(0.025,24) ≈ 2.064, making the interval wider than the z-value of 1.96
              </p>
            </div>
          </div>
        )}

        {selectedParts.standardError && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              s/√n - Standard Error
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The standard error measures the variability of our sample mean. It decreases as sample size increases, leading to more precise confidence intervals.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If s = 150 hours and n = 25, then s/√n = 150/5 = 30 hours is our standard error
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-4 border border-teal-500/30">
          <h5 className="font-semibold text-teal-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            A confidence interval captures the uncertainty in estimating a population parameter:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• The <strong>sample mean x̄</strong> is our best point estimate</li>
            <li>• The <strong>±</strong> acknowledges we don't know the exact population value</li>
            <li>• The <strong>critical t-value</strong> ensures our desired confidence level</li>
            <li>• The <strong>standard error</strong> reflects the precision of our sample</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Battery Life Study</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[1200 \\pm 2.064 \\times \\frac{150}{\\sqrt{25}} = 1200 \\pm 61.92\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            With x̄ = 1,200 hours, s = 150 hours, and n = 25 batteries, we are 95% confident the true mean battery life is between 1,138 and 1,262 hours.
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
                {key === 'sampleMeanConcept' && 'Point Estimate'}
                {key === 'plusMinusConcept' && 'Interval Nature'}
                {key === 'criticalValueConcept' && 'Critical t-Value'}
                {key === 'standardErrorConcept' && 'Standard Error'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the confidence interval formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: The interval width depends on confidence level, sample variability, and sample size.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ConfidenceIntervalBuilder.displayName = 'ConfidenceIntervalBuilder';

export default ConfidenceIntervalBuilder;