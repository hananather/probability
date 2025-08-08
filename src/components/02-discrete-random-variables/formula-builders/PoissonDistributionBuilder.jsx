"use client";
import React, { useState } from 'react';
import { Check, Target, Clock, Zap, TrendingUp } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const PoissonDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    probability: false,
    lambda: false,
    k: false,
    exponential: false,
    factorial: false
  });
  
  const [understanding, setUnderstanding] = useState({
    outcome: false,
    rate: false,
    count: false,
    decay: false,
    arrangements: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-6 border border-indigo-700/50">
      <h3 className="text-xl font-bold text-indigo-400 mb-6">
        Build the Poisson Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to model rare events over time or space
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* P(X = k) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.outcome ? 'text-green-400' : 
              selectedParts.probability ? 'text-indigo-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('probability', 'outcome')}
          >
            P(X = k)
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator: λ^k × e^(-λ) */}
            <div className="flex items-center gap-1">
              {/* λ^k */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.rate ? 'text-green-400' : 
                  selectedParts.lambda ? 'text-cyan-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('lambda', 'rate')}
              >
                <span className="block text-center text-sm">λ</span>
                <div className="flex items-center">
                  <span 
                    className={`text-xs ${
                      understanding.count ? 'text-green-400' : 
                      selectedParts.k ? 'text-yellow-400' : 'text-neutral-400'
                    } cursor-pointer`}
                    onClick={() => handlePartClick('k', 'count')}
                  >
                    k
                  </span>
                </div>
              </div>
              
              <span className="text-neutral-500 text-lg">×</span>
              
              {/* e^(-λ) */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                  understanding.decay ? 'text-green-400' : 
                  selectedParts.exponential ? 'text-red-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('exponential', 'decay')}
              >
                <span className="block text-center text-sm">e</span>
                <span className="block text-xs text-center">-λ</span>
              </div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator: k! */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.arrangements ? 'text-green-400' : 
                selectedParts.factorial ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('factorial', 'arrangements')}
            >
              <span className="block text-sm text-center">k!</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where λ (lambda) is the average rate of occurrence per interval
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.probability && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              P(X = k) - Probability of Exactly k Events
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability of observing exactly k occurrences of a rare event in a fixed interval.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(X = 3) for exactly 3 emails arriving in an hour
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.lambda && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              λ (Lambda) - The Average Rate Parameter
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The expected number of events occurring in the given interval. This is both the mean and variance of the Poisson distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> λ = 5 means on average 5 emails per hour
              </p>
            </div>
          </div>
        )}

        {selectedParts.k && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              k - The Specific Count We Want
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The actual number of events we're calculating the probability for. Must be a non-negative integer.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> k = 3 for exactly 3 events occurring
              </p>
            </div>
          </div>
        )}

        {selectedParts.exponential && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              e^(-λ) - The Exponential Decay Factor
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Represents the probability of having zero events. As λ increases, this probability decreases exponentially.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If λ = 5, then e^(-5) ≈ 0.0067 is the probability of no events
              </p>
            </div>
          </div>
        )}

        {selectedParts.factorial && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              k! - The Factorial Normalization
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Accounts for the fact that k identical events can occur in any order. Ensures probabilities sum to 1.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 3! = 3 × 2 × 1 = 6 different orderings of 3 events
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The Poisson distribution models <strong>rare events</strong> with these key properties:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Events occur independently at a constant average rate λ</li>
            <li>• The probability of multiple events in an infinitesimal interval is negligible</li>
            <li>• Mean = Variance = λ (unique property of Poisson)</li>
            <li>• Used for modeling arrivals, defects, accidents, and other rare occurrences</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Concrete Example: Website Traffic</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = 4) = \\frac{3^4 \\times e^{-3}}{4!} = \\frac{81 \\times 0.0498}{24} ≈ 0.168\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Probability of exactly 4 visitors arriving in an hour, when the average is 3 visitors per hour.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                {key === 'outcome' && 'Specific Count'}
                {key === 'rate' && 'Average Rate'}
                {key === 'count' && 'Target Number'}
                {key === 'decay' && 'Decay Factor'}
                {key === 'arrangements' && 'Factorial Term'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the Poisson distribution formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's perfect for modeling rare events with a known average rate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

PoissonDistributionBuilder.displayName = 'PoissonDistributionBuilder';

export default PoissonDistributionBuilder;