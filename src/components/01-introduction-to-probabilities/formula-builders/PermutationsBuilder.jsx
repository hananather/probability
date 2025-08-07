"use client";
import React, { useState } from 'react';
import { Check, ArrowRightLeft, List } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const PermutationsBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    result: false,
    nFactorial: false,
    differenceFactorial: false
  });
  
  const [understanding, setUnderstanding] = useState({
    arrangement: false,
    choices: false,
    remaining: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg p-6 border border-violet-700/50">
      <h3 className="text-xl font-bold text-violet-400 mb-6">
        Build the Permutations Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how to count arrangements when order matters
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2">
          <span
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
              understanding.arrangement ? 'text-green-400' : 
              selectedParts.result ? 'text-violet-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('result', 'arrangement')}
          >
            P(n,r)
          </span>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator: n! */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                understanding.choices ? 'text-green-400' : 
                selectedParts.nFactorial ? 'text-purple-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('nFactorial', 'choices')}
            >
              n!
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator: (n-r)! */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                understanding.remaining ? 'text-green-400' : 
                selectedParts.differenceFactorial ? 'text-indigo-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('differenceFactorial', 'remaining')}
            >
              (n-r)!
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Expanded form:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(n,r) = n \\times (n-1) \\times (n-2) \\times ... \\times (n-r+1)\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            r factors starting from n and counting down
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.result && (
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-500/30">
            <h5 className="font-semibold text-violet-400 mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              P(n,r) - Permutations
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The number of ways to arrange r items from n total items when order DOES matter. 
              Each different ordering counts as a different permutation.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(5,3) - Ways to award Gold, Silver, Bronze to 5 runners = 60 ways
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.nFactorial && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <List className="w-4 h-4" />
              n! - All Possible Arrangements
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Start with n! which gives all possible arrangements of all n items. 
              This is our starting point before we adjust for selecting only r items.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> 5! = 120 ways to arrange all 5 people in a line
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.differenceFactorial && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2">
              (n-r)! - Remove Unused Positions
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Divide by (n-r)! to "cancel out" the arrangements of items we're not selecting. 
              We only want to arrange r items, not all n.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Selecting 3 from 5: divide by (5-3)! = 2! to remove the last 2 positions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.nFactorial && selectedParts.differenceFactorial && (
        <div className="mt-6 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-4 border border-violet-500/30">
          <h5 className="font-semibold text-violet-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Permutations use the <strong>multiplication principle</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• 1st position: n choices</li>
            <li>• 2nd position: (n-1) choices</li>
            <li>• 3rd position: (n-2) choices</li>
            <li>• ...continue for r positions</li>
            <li>• Total: n × (n-1) × ... × (n-r+1)</li>
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
                {key === 'arrangement' && 'Arrangements P(n,r)'}
                {key === 'choices' && 'Total Choices n!'}
                {key === 'remaining' && 'Remove Excess'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand permutations! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Use when order matters (rankings, passwords, lineups).
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

PermutationsBuilder.displayName = 'PermutationsBuilder';

export default PermutationsBuilder;