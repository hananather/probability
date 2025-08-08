"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, BarChart3, Link } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const PairedTTestBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    meanDifference: false,
    standardErrorDifference: false
  });
  
  const [understanding, setUnderstanding] = useState({
    meanDifferenceConcept: false,
    standardErrorDifferenceConcept: false
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
        Build the Paired T-Test Statistic Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to test differences within paired observations
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">t =</span>
          
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
              <span className="text-sm">d̄</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.standardErrorDifferenceConcept ? 'text-green-400' : 
                selectedParts.standardErrorDifference ? 'text-pink-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('standardErrorDifference', 'standardErrorDifferenceConcept')}
            >
              <span className="text-sm">sd/√n</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Complete formula showing differences:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{d}}{s_d/\\sqrt{n}} \\quad \\text{where} \\quad d_i = x_{1i} - x_{2i}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Uses n-1 degrees of freedom where n is the number of pairs
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.meanDifference && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              d̄ - Mean of Paired Differences
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The numerator is the average of all paired differences d̄ = Σdi/n, where each di = x₁i - x₂i. Under H₀: μd = 0, we expect this to be close to zero.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Before-after weight loss: differences = [-2, -3, -1, -4, -2], so d̄ = -2.4 pounds
              </p>
            </div>
          </div>
        )}

        {selectedParts.standardErrorDifference && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              sd/√n - Standard Error of Differences
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The denominator is the standard error of the mean differences, where sd is the standard deviation of the paired differences. This accounts for the variability in how much individuals change.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If sd = 1.5 and n = 20 pairs, then sd/√n = 1.5/√20 = 0.335 is our standard error
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg p-4 border border-rose-500/30">
          <h5 className="font-semibold text-rose-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The paired t-test focuses on the differences within each pair:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Controls for individual differences by pairing</li>
            <li>• More powerful than independent samples when pairing is effective</li>
            <li>• Tests H₀: μd = 0 (mean difference is zero)</li>
            <li>• Requires differences to be approximately normal</li>
          </ul>
        </div>
      )}

      {/* When to Use Paired vs Independent Samples */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <Link className="w-4 h-4" />
            Paired vs Independent Samples T-Test
          </h5>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-800/30 p-3 rounded">
                <p className="font-medium text-rose-300 mb-2">Use Paired T-Test When:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Same subjects measured twice</li>
                  <li>• Natural pairing exists</li>
                  <li>• Before/after comparisons</li>
                  <li>• Matched pairs design</li>
                </ul>
              </div>
              <div className="bg-purple-800/30 p-3 rounded">
                <p className="font-medium text-purple-300 mb-2">Use Independent T-Test When:</p>
                <ul className="space-y-1 text-neutral-400 text-xs">
                  <li>• Different subjects in each group</li>
                  <li>• No natural pairing</li>
                  <li>• Random assignment to groups</li>
                  <li>• Cross-sectional comparisons</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Sleep Study</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{1.2}{0.8/\\sqrt{25}} = \\frac{1.2}{0.16} = 7.5\\]` 
            }} />
          </div>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Testing if a sleep aid increases sleep duration: 25 participants measured before and after treatment.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded text-xs space-y-1">
              <p><strong>Data:</strong> Mean difference d̄ = 1.2 hours more sleep, sd = 0.8 hours, n = 25 pairs</p>
              <p><strong>Calculation:</strong> t = 1.2 / (0.8/√25) = 1.2 / 0.16 = 7.5</p>
              <p><strong>Degrees of freedom:</strong> df = n - 1 = 24</p>
            </div>
            <p>
              With t = 7.5 and df = 24, this is highly significant (p &lt; 0.001), providing strong evidence the sleep aid works.
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
                {key === 'meanDifferenceConcept' && 'Mean of Differences'}
                {key === 'standardErrorDifferenceConcept' && 'Standard Error of Differences'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the paired t-test formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Pairing increases power by controlling for individual differences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

PairedTTestBuilder.displayName = 'PairedTTestBuilder';

export default PairedTTestBuilder;