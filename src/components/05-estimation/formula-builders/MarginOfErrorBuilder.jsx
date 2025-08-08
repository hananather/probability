"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const MarginOfErrorBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    criticalValue: false,
    standardError: false
  });
  
  const [understanding, setUnderstanding] = useState({
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-700/50">
      <h3 className="text-xl font-bold text-orange-400 mb-6">
        Build the Margin of Error Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand what creates uncertainty in our estimates
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-3 flex-wrap justify-center">
          <span className="text-neutral-500">ME =</span>
          
          {/* Critical Value */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.criticalValueConcept ? 'text-green-400' : 
              selectedParts.criticalValue ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('criticalValue', 'criticalValueConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="block text-base">critical</span>
              <span className="block text-base">value</span>
            </div>
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* Standard Error */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.standardErrorConcept ? 'text-green-400' : 
              selectedParts.standardError ? 'text-yellow-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('standardError', 'standardErrorConcept')}
          >
            <div className="flex flex-col items-center">
              <span className="block text-base">standard</span>
              <span className="block text-base">error</span>
            </div>
          </div>
        </div>

        {/* Mathematical notation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{ME} = z_{\\alpha/2} \\times \\text{SE} \\quad \\text{or} \\quad \\text{ME} = t_{(\\alpha/2,df)} \\times \\text{SE}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Use z for known σ, t for unknown σ (estimated with s)
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.criticalValue && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Critical Value - Controls Confidence Level
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The critical value determines how many standard errors away from the mean we need to go to capture the desired percentage of the sampling distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Common values:</strong> 90% confidence → z = 1.645, 95% confidence → z = 1.96, 99% confidence → z = 2.576
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.standardError && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Standard Error - Measures Sampling Variability
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The standard error quantifies how much our sample statistic varies from sample to sample. It's the standard deviation of the sampling distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>For means:</strong> SE = σ/√n (known σ) or s/√n (unknown σ). <strong>For proportions:</strong> SE = √[p̂(1-p̂)/n]
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
          <h5 className="font-semibold text-orange-400 mb-2">🔑 The Precision-Confidence Tradeoff</h5>
          <p className="text-sm text-neutral-300">
            The margin of error represents the maximum likely difference between our sample estimate and the true population parameter:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Higher confidence level → larger critical value → wider margin of error</li>
            <li>• Larger sample size → smaller standard error → smaller margin of error</li>
            <li>• More variable population → larger standard error → larger margin of error</li>
            <li>• We can only reduce margin of error by sacrificing confidence or increasing sample size</li>
          </ul>
        </div>
      )}

      {/* Concrete Examples - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Examples of Margin of Error</h5>
          <div className="space-y-3">
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Mean (known σ):</p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{ME} = 1.96 \\times \\frac{15}{\\sqrt{100}} = 1.96 \\times 1.5 = 2.94\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">For σ = 15, n = 100, 95% confidence</p>
            </div>
            
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm text-neutral-300 font-medium">Proportion:</p>
              <div className="text-center my-2">
                <span className="font-mono text-sm" dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{ME} = 1.96 \\times \\sqrt{\\frac{0.6 \\times 0.4}{400}} = 1.96 \\times 0.0245 = 0.048\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">For p̂ = 0.6, n = 400, 95% confidence</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 gap-3">
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
                {key === 'criticalValueConcept' && 'Critical Value'}
                {key === 'standardErrorConcept' && 'Standard Error'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Perfect! You understand how margin of error quantifies uncertainty!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Margin of error = Critical Value × Standard Error
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

MarginOfErrorBuilder.displayName = 'MarginOfErrorBuilder';

export default MarginOfErrorBuilder;