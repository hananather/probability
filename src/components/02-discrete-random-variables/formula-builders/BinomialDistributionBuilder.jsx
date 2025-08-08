"use client";
import React, { useState } from 'react';
import { Check, Target, Layers, Calculator, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const BinomialDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    probability: false,
    binomial: false,
    successes: false,
    failures: false
  });
  
  const [understanding, setUnderstanding] = useState({
    outcome: false,
    coefficient: false,
    successPart: false,
    failurePart: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-lg p-6 border border-emerald-700/50">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">
        Build the Binomial Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to calculate probabilities for repeated trials
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* P(X = k) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.outcome ? 'text-green-400' : 
              selectedParts.probability ? 'text-emerald-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('probability', 'outcome')}
          >
            P(X = k)
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* C(n,k) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.coefficient ? 'text-green-400' : 
              selectedParts.binomial ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('binomial', 'coefficient')}
          >
            C(n,k)
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* p^k */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.successPart ? 'text-green-400' : 
              selectedParts.successes ? 'text-yellow-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('successes', 'successPart')}
          >
            <span>p<sup>k</sup></span>
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* (1-p)^(n-k) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.failurePart ? 'text-green-400' : 
              selectedParts.failures ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('failures', 'failurePart')}
          >
            <span>(1-p)<sup>(n-k)</sup></span>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing expanded binomial coefficient:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = \\frac{n!}{k!(n-k)!} \\times p^k \\times (1-p)^{n-k}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where n! is n factorial, representing all ways to arrange n items
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.probability && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              P(X = k) - The Probability of Exactly k Successes
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This represents the probability of getting exactly k successes in n independent trials.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(X = 3) for flipping exactly 3 heads in 10 coin flips
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.binomial && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              C(n,k) - The Binomial Coefficient (n choose k)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Counts the number of ways to choose k successes from n trials. Order doesn't matter.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> C(10,3) = 120 ways to choose which 3 flips out of 10 are heads
              </p>
            </div>
          </div>
        )}

        {selectedParts.successes && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              p^k - Probability of k Successes
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that each of the k chosen trials results in success, multiplied together.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For fair coin, getting 3 specific heads: (0.5)³ = 0.125
              </p>
            </div>
          </div>
        )}

        {selectedParts.failures && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              (1-p)^(n-k) - Probability of (n-k) Failures
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that each of the remaining (n-k) trials results in failure.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For fair coin, getting 7 specific tails: (0.5)⁷ = 0.0078
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The binomial formula uses the <strong>multiplication principle</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Count all possible ways to arrange k successes (binomial coefficient)</li>
            <li>• Multiply by probability of any specific arrangement of successes and failures</li>
            <li>• Each trial is independent with the same success probability p</li>
            <li>• Total probability = (number of arrangements) × (probability of each arrangement)</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Concrete Example: Quality Control</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = 2) = C(5,2) \\times (0.1)^2 \\times (0.9)^3 = 10 \\times 0.01 \\times 0.729 = 0.0729\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Probability of exactly 2 defective items in a batch of 5, when each item has 10% defect rate.
          </p>
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
                {key === 'outcome' && 'Specific Probability'}
                {key === 'coefficient' && 'Binomial Coefficient'}
                {key === 'successPart' && 'Success Component'}
                {key === 'failurePart' && 'Failure Component'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the binomial distribution formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Count the arrangements, then multiply by the probability of each arrangement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

BinomialDistributionBuilder.displayName = 'BinomialDistributionBuilder';

export default BinomialDistributionBuilder;