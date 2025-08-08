"use client";
import React, { useState } from 'react';
import { Check, Target, Repeat, Zap, Clock } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const GeometricDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    probability: false,
    failures: false,
    success: false
  });
  
  const [understanding, setUnderstanding] = useState({
    outcome: false,
    failurePart: false,
    successPart: false
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
        Build the Geometric Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to model the number of trials until first success
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* P(X = k) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.outcome ? 'text-green-400' : 
              selectedParts.probability ? 'text-rose-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('probability', 'outcome')}
          >
            P(X = k)
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* (1-p)^(k-1) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.failurePart ? 'text-green-400' : 
              selectedParts.failures ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('failures', 'failurePart')}
          >
            <div className="flex flex-col items-center">
              <span className="text-sm">(1-p)</span>
              <span className="text-xs">k-1</span>
            </div>
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* p */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.successPart ? 'text-green-400' : 
              selectedParts.success ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('success', 'successPart')}
          >
            p
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = (1-p)^{k-1} \\times p\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where p is the probability of success on each trial, k ≥ 1
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.probability && (
          <div className="bg-rose-900/20 rounded-lg p-4 border border-rose-500/30">
            <h5 className="font-semibold text-rose-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              P(X = k) - First Success on Trial k
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that the first success occurs exactly on the k-th trial.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(X = 4) for getting first heads on 4th coin flip
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.failures && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              (1-p)^(k-1) - The k-1 Failures Before Success
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability of having exactly (k-1) consecutive failures before getting the first success.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> (0.5)³ = 0.125 for 3 tails before the first heads
              </p>
            </div>
          </div>
        )}

        {selectedParts.success && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              p - The Final Success
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that the k-th trial is successful, ending the sequence.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> p = 0.5 for getting heads on the final flip
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg p-4 border border-rose-500/30">
          <h5 className="font-semibold text-rose-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The geometric distribution models <strong>"waiting time"</strong> until success:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Each trial is independent with same success probability p</li>
            <li>• We stop at the first success (memoryless property)</li>
            <li>• Need exactly (k-1) failures followed by 1 success</li>
            <li>• Used for modeling time until first event occurs</li>
          </ul>
        </div>
      )}

      {/* Properties section */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2">Key Properties</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-300">
                <strong>Mean (Expected Value):</strong>
              </p>
              <div className="text-center my-2">
                <span className="font-mono" dangerouslySetInnerHTML={{ 
                  __html: `\\[E[X] = \\frac{1}{p}\\]` 
                }} />
              </div>
            </div>
            <div>
              <p className="text-neutral-300">
                <strong>Variance:</strong>
              </p>
              <div className="text-center my-2">
                <span className="font-mono" dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{Var}(X) = \\frac{1-p}{p^2}\\]` 
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Concrete Example: Job Applications</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = 5) = (1-0.2)^{5-1} \\times 0.2 = (0.8)^4 \\times 0.2 = 0.4096 \\times 0.2 = 0.082\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Probability that you get your first job offer on the 5th application, if each has a 20% success rate.
          </p>
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
                {key === 'outcome' && 'Target Trial'}
                {key === 'failurePart' && 'Prior Failures'}
                {key === 'successPart' && 'Final Success'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the geometric distribution formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's all about waiting for that first success!
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

GeometricDistributionBuilder.displayName = 'GeometricDistributionBuilder';

export default GeometricDistributionBuilder;