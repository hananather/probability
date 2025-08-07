"use client";
import React, { useState } from 'react';
import { Check, Filter, Slash } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ConditionalProbabilityBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    result: false,
    intersection: false,
    given: false
  });
  
  const [understanding, setUnderstanding] = useState({
    conditional: false,
    intersection: false,
    normalization: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-6 border border-cyan-700/50">
      <h3 className="text-xl font-bold text-cyan-400 mb-6">
        Build the Conditional Probability Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand probability given that something has already happened
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
              understanding.conditional ? 'text-green-400' : 
              selectedParts.result ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('result', 'conditional')}
          >
            P(A|B)
          </span>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator: P(A ∩ B) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                understanding.intersection ? 'text-green-400' : 
                selectedParts.intersection ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('intersection', 'intersection')}
            >
              P(A ∩ B)
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator: P(B) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                understanding.normalization ? 'text-green-400' : 
                selectedParts.given ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('given', 'normalization')}
            >
              P(B)
            </div>
          </div>
        </div>

        {/* Alternative interpretation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Read as:</p>
          <p className="text-lg text-neutral-300">
            "The probability of A given B equals the probability of both A and B divided by the probability of B"
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.result && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              P(A|B) - The Conditional Probability
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability of event A occurring, given that we already know B has occurred. 
              The vertical bar "|" means "given" or "conditional on".
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Rain|Cloudy) - The probability it will rain, given that it's cloudy.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.intersection && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Slash className="w-4 h-4" />
              P(A ∩ B) - The Intersection
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability that BOTH A and B occur together. This is the overlap between the two events.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Rain ∩ Cloudy) - The probability it's both rainy AND cloudy.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.given && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2">
              P(B) - The Given Event
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The probability of the condition B. We divide by this to "zoom in" on just the cases where B occurs, 
              making it our new sample space.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Cloudy) - The probability it's cloudy (our new "universe" of possibilities).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.intersection && selectedParts.given && (
        <div className="mt-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30">
          <h5 className="font-semibold text-cyan-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Conditional probability <strong>restricts our sample space</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• We're no longer considering all possibilities</li>
            <li>• We only look at cases where B has occurred</li>
            <li>• Within that restricted space, we find the proportion where A also occurs</li>
            <li>• It's like zooming in on a subset of the probability space</li>
          </ul>
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
                {key === 'conditional' && 'Conditional P(A|B)'}
                {key === 'intersection' && 'Intersection P(A∩B)'}
                {key === 'normalization' && 'Normalization P(B)'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Great! You understand conditional probability! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's about updating probabilities when you have new information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ConditionalProbabilityBuilder.displayName = 'ConditionalProbabilityBuilder';

export default ConditionalProbabilityBuilder;