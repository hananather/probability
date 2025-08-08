"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, Sigma, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ExpectedValueBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    expectation: false,
    summation: false,
    value: false,
    probability: false
  });
  
  const [understanding, setUnderstanding] = useState({
    concept: false,
    operation: false,
    outcomes: false,
    weights: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-6 border border-blue-700/50">
      <h3 className="text-xl font-bold text-blue-400 mb-6">
        Build the Expected Value Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to calculate the average value of a random variable
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* E[X] */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.concept ? 'text-green-400' : 
              selectedParts.expectation ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('expectation', 'concept')}
          >
            E[X]
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* Σ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.operation ? 'text-green-400' : 
              selectedParts.summation ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('summation', 'operation')}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">Σ</span>
              <span className="text-xs">all x</span>
            </div>
          </div>
          
          {/* x */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.outcomes ? 'text-green-400' : 
              selectedParts.value ? 'text-yellow-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('value', 'outcomes')}
          >
            x
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* P(X = x) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.weights ? 'text-green-400' : 
              selectedParts.probability ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('probability', 'weights')}
          >
            P(X = x)
          </div>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-neutral-800/30 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2">Discrete case - summation notation:</p>
            <div className="text-lg font-mono text-neutral-300">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[E[X] = \\sum_{x} x \\cdot P(X = x)\\]` 
              }} />
            </div>
          </div>
          
          <div className="p-3 bg-neutral-800/30 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2">Expanded form for finite outcomes:</p>
            <div className="text-lg font-mono text-neutral-300">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[E[X] = x_1 P(X = x_1) + x_2 P(X = x_2) + \\cdots + x_n P(X = x_n)\\]` 
              }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.expectation && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              E[X] - Expected Value (Mean)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The theoretical average value of the random variable X. Also called the population mean or mathematical expectation.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Think of it as:</strong> The long-run average if you repeated the experiment infinitely many times
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.summation && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              Σ - Summation Over All Possible Values
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Sum over every possible value that the random variable X can take. This ensures we account for all outcomes.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For a die roll, sum from x = 1 to x = 6
              </p>
            </div>
          </div>
        )}

        {selectedParts.value && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              x - The Outcome Value
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Each possible numeric value that the random variable can take. These are the actual outcomes we care about.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For a die: x ∈ {1, 2, 3, 4, 5, 6}
              </p>
            </div>
          </div>
        )}

        {selectedParts.probability && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              P(X = x) - Probability Weight
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that the random variable X equals the specific value x. Acts as a "weight" for that outcome.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For fair die: P(X = 1) = P(X = 2) = ... = P(X = 6) = 1/6
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Expected value is a <strong>weighted average</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Each outcome is multiplied by its probability (weight)</li>
            <li>• More likely outcomes contribute more to the average</li>
            <li>• The sum of all probability weights equals 1</li>
            <li>• E[X] may not be a value X can actually take!</li>
          </ul>
        </div>
      )}

      {/* Properties section */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-2">Key Properties of Expected Value</h5>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-300 mb-1">
                  <strong>Linearity:</strong>
                </p>
                <span className="font-mono text-xs" dangerouslySetInnerHTML={{ 
                  __html: `\\[E[aX + b] = aE[X] + b\\]` 
                }} />
              </div>
              <div>
                <p className="text-neutral-300 mb-1">
                  <strong>Independence:</strong>
                </p>
                <span className="font-mono text-xs" dangerouslySetInnerHTML={{ 
                  __html: `\\[E[XY] = E[X]E[Y]\\]` 
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
          <h5 className="font-semibold text-orange-400 mb-2">Concrete Example: Fair Die Roll</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[E[X] = 1 \\cdot \\frac{1}{6} + 2 \\cdot \\frac{1}{6} + 3 \\cdot \\frac{1}{6} + 4 \\cdot \\frac{1}{6} + 5 \\cdot \\frac{1}{6} + 6 \\cdot \\frac{1}{6}\\]` 
            }} />
          </div>
          <div className="text-center my-2">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[= \\frac{1 + 2 + 3 + 4 + 5 + 6}{6} = \\frac{21}{6} = 3.5\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            The average value of a fair die roll is 3.5, even though you can never actually roll 3.5!
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                {key === 'concept' && 'Expected Value'}
                {key === 'operation' && 'Summation'}
                {key === 'outcomes' && 'Outcome Values'}
                {key === 'weights' && 'Probability Weights'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the expected value formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's a probability-weighted average of all possible outcomes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ExpectedValueBuilder.displayName = 'ExpectedValueBuilder';

export default ExpectedValueBuilder;