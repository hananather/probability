"use client";
import React, { useState } from 'react';
import { Check, Package, Hash } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const CombinationsBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    result: false,
    nFactorial: false,
    rFactorial: false,
    differenceFactorial: false
  });
  
  const [understanding, setUnderstanding] = useState({
    choosing: false,
    overcounting: false,
    formula: false
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
        Build the Combinations Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to count selections when order doesn't matter
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
              understanding.choosing ? 'text-green-400' : 
              selectedParts.result ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('result', 'choosing')}
          >
            C(n,r)
          </span>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator: n! */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                understanding.formula ? 'text-green-400' : 
                selectedParts.nFactorial ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('nFactorial', 'formula')}
            >
              n!
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator: r!(n-r)! */}
            <div className="flex items-center gap-1">
              <span 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                  understanding.overcounting ? 'text-green-400' : 
                  selectedParts.rFactorial ? 'text-red-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('rFactorial', 'overcounting')}
              >
                r!
              </span>
              <span className="text-neutral-400">×</span>
              <span 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                  selectedParts.differenceFactorial ? 'text-pink-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('differenceFactorial', '')}
              >
                (n-r)!
              </span>
            </div>
          </div>
        </div>

        {/* Alternative notations */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Also written as:</p>
          <div className="text-lg font-mono text-neutral-300 space-x-4">
            <span dangerouslySetInnerHTML={{ __html: `\\(\\binom{n}{r}\\)` }} />
            <span className="text-neutral-500">or</span>
            <span dangerouslySetInnerHTML={{ __html: `\\({}^nC_r\\)` }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            "n choose r" - choosing r items from n total
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.result && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              C(n,r) - Combinations
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The number of ways to choose r items from n total items when order doesn't matter. 
              A combination is a selection without regard to arrangement.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> C(5,3) - Ways to choose 3 people from 5 for a committee = 10 ways
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.nFactorial && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              n! - Total Arrangements
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Start with all possible arrangements of n items. This counts every possible ordering, 
              which initially overcounts what we want.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 5! = 120 total arrangements of 5 people
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.rFactorial && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="font-semibold text-red-400 mb-2">
              r! - Remove Order Within Selection
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Divide by r! to remove the orderings within our selection. Since order doesn't matter, 
              ABC is the same as BAC, CAB, etc. (r! different orderings).
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Choosing ABC is same as BAC, CAB... (3! = 6 arrangements to remove)
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.differenceFactorial && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2">
              (n-r)! - Remove Order of Unselected
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Divide by (n-r)! to remove orderings of the items we didn't select. 
              We don't care about the arrangement of what's left behind.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If choosing 3 from 5, the 2 not chosen can be arranged 2! = 2 ways
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.rFactorial && selectedParts.nFactorial && (
        <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
          <h5 className="font-semibold text-orange-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Combinations = Permutations ÷ Redundant orderings:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Start with all permutations (order matters)</li>
            <li>• Divide by r! to ignore order within selection</li>
            <li>• Result: unique selections only</li>
            <li>• Always smaller than permutations: C(n,r) ≤ P(n,r)</li>
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
                {key === 'choosing' && 'Choosing Items'}
                {key === 'overcounting' && 'Remove Overcounting'}
                {key === 'formula' && 'Formula Structure'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Perfect! You understand combinations! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Use when order doesn't matter (committees, lottery, hands of cards).
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

CombinationsBuilder.displayName = 'CombinationsBuilder';

export default CombinationsBuilder;