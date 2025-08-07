"use client";
import React, { useState } from 'react';
import { Check, Target, Grid } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const BasicProbabilityBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false
  });
  
  const [understanding, setUnderstanding] = useState({
    favorable: false,
    total: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 rounded-lg p-6 border border-teal-700/50">
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Build the Basic Probability Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how probability measures chance
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span className="text-neutral-500">P(A) =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.favorable ? 'text-green-400' : 
                selectedParts.numerator ? 'text-teal-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('numerator', 'favorable')}
            >
              <span className="block text-sm">favorable</span>
              <span className="block text-sm">outcomes</span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.total ? 'text-green-400' : 
                selectedParts.denominator ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('denominator', 'total')}
            >
              <span className="block text-sm">total</span>
              <span className="block text-sm">outcomes</span>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A) = \\frac{|A|}{|S|}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where |A| is the size of event A and |S| is the size of the sample space
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.numerator && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Favorable Outcomes - The Numerator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Count the outcomes where your event occurs. This is what you want to happen.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Rolling an even number on a die: favorable = {2, 4, 6} = 3 outcomes
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.denominator && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Total Outcomes - The Denominator
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Count ALL possible outcomes. This is your sample space - everything that could happen.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Rolling a die: total = {1, 2, 3, 4, 5, 6} = 6 outcomes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.numerator && selectedParts.denominator && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 rounded-lg p-4 border border-teal-500/30">
          <h5 className="font-semibold text-teal-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Probability is fundamentally about <strong>proportions</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• It's always a fraction between 0 and 1</li>
            <li>• 0 means impossible (no favorable outcomes)</li>
            <li>• 1 means certain (all outcomes are favorable)</li>
            <li>• 0.5 means equally likely to happen or not</li>
          </ul>
        </div>
      )}

      {/* Complement Rule - Show after understanding basics */}
      {allUnderstood && (
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <h5 className="font-semibold text-yellow-400 mb-2">The Complement Rule</h5>
          <div className="text-center my-3">
            <span className="text-xl font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[P(\\text{not } A) = 1 - P(A)\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            The probability of something NOT happening equals 1 minus the probability of it happening.
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
                {key === 'favorable' && 'Favorable Outcomes'}
                {key === 'total' && 'Total Outcomes'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the basic probability formula! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's all about counting favorable vs. total possibilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

BasicProbabilityBuilder.displayName = 'BasicProbabilityBuilder';

export default BasicProbabilityBuilder;