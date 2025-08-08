"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const VarianceBuilder = React.memo(() => {
  const [selectedFormula, setSelectedFormula] = useState('definition'); // 'definition' or 'computational'
  const [selectedParts, setSelectedParts] = useState({
    variance: false,
    expectation: false,
    deviation: false,
    squared: false,
    // For computational formula
    expectedSquare: false,
    expectedSquared: false
  });
  
  const [understanding, setUnderstanding] = useState({
    concept: false,
    spread: false,
    squaring: false,
    // For computational formula
    computational: false,
    efficiency: false
  });
  
  const allUnderstood = Object.values(understanding).every(v => v);
  const mathJaxRef = useMathJax([selectedParts, understanding, selectedFormula]);

  const handlePartClick = (part, understandingKey) => {
    if (!selectedParts[part]) {
      setSelectedParts({...selectedParts, [part]: true});
    }
    if (understandingKey && !understanding[understandingKey]) {
      setUnderstanding({...understanding, [understandingKey]: true});
    }
  };

  const handleFormulaSwitch = (formula) => {
    setSelectedFormula(formula);
    // Reset parts and understanding when switching formulas
    setSelectedParts({
      variance: false,
      expectation: false,
      deviation: false,
      squared: false,
      expectedSquare: false,
      expectedSquared: false
    });
    setUnderstanding({
      concept: false,
      spread: false,
      squaring: false,
      computational: false,
      efficiency: false
    });
  };

  return (
    <div ref={mathJaxRef} className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-6 border border-emerald-700/50">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">
        Build the Variance Formula Step by Step
      </h3>
      
      {/* Formula Selection */}
      <div className="mb-6 flex justify-center gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedFormula === 'definition' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
          onClick={() => handleFormulaSwitch('definition')}
        >
          Definition Formula
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedFormula === 'computational' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
          onClick={() => handleFormulaSwitch('computational')}
        >
          Computational Formula
        </button>
      </div>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how variance measures the spread of a distribution
        </p>
        
        {selectedFormula === 'definition' ? (
          /* Definition Formula: Var(X) = E[(X - μ)²] */
          <div>
            <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
              {/* Var(X) */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.concept ? 'text-green-400' : 
                  selectedParts.variance ? 'text-emerald-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('variance', 'concept')}
              >
                Var(X)
              </div>
              
              <span className="text-neutral-500">=</span>
              
              {/* E[ */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.spread ? 'text-green-400' : 
                  selectedParts.expectation ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('expectation', 'spread')}
              >
                E[
              </div>
              
              {/* (X - μ) */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.spread ? 'text-green-400' : 
                  selectedParts.deviation ? 'text-yellow-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('deviation', 'spread')}
              >
                (X - μ)
              </div>
              
              {/* ² */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.squaring ? 'text-green-400' : 
                  selectedParts.squared ? 'text-red-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('squared', 'squaring')}
              >
                ²
              </div>
              
              {/* ] */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.spread ? 'text-green-400' : 
                  selectedParts.expectation ? 'text-blue-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('expectation', 'spread')}
              >
                ]
              </div>
            </div>

            <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-sm text-neutral-400 mb-2">Definition formula (conceptual):</p>
              <div className="text-lg font-mono text-neutral-300">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{Var}(X) = E[(X - \\mu)^2]\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Where μ = E[X] is the mean of X
              </p>
            </div>
          </div>
        ) : (
          /* Computational Formula: Var(X) = E[X²] - (E[X])² */
          <div>
            <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
              {/* Var(X) */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.concept ? 'text-green-400' : 
                  selectedParts.variance ? 'text-emerald-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('variance', 'concept')}
              >
                Var(X)
              </div>
              
              <span className="text-neutral-500">=</span>
              
              {/* E[X²] */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.computational ? 'text-green-400' : 
                  selectedParts.expectedSquare ? 'text-purple-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('expectedSquare', 'computational')}
              >
                E[X²]
              </div>
              
              <span className="text-neutral-500">-</span>
              
              {/* (E[X])² */}
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.efficiency ? 'text-green-400' : 
                  selectedParts.expectedSquared ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('expectedSquared', 'efficiency')}
              >
                (E[X])²
              </div>
            </div>

            <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-sm text-neutral-400 mb-2">Computational formula (easier to calculate):</p>
              <div className="text-lg font-mono text-neutral-300">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{Var}(X) = E[X^2] - (E[X])^2\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Often easier to compute than the definition formula
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.variance && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Var(X) - Variance of Random Variable X
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              A measure of how spread out the values of X are around the mean. Higher variance means more spread.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Units:</strong> Variance has units of X², which is why we often use standard deviation (√Var(X))
              </p>
            </div>
          </div>
        )}

        {selectedFormula === 'definition' && (
          <>
            {selectedParts.expectation && (
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  E[...] - Expected Value of the Squared Deviations
                </h5>
                <p className="text-sm text-neutral-300 mb-2">
                  Takes the average of all squared deviations from the mean, weighted by their probabilities.
                </p>
                <div className="bg-neutral-800/50 p-2 rounded mt-2">
                  <p className="text-xs text-neutral-400">
                    <strong>Remember:</strong> E[...] = Σ (...) × P(X = x) for all possible values x
                  </p>
                </div>
              </div>
            )}

            {selectedParts.deviation && (
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  (X - μ) - Deviation from Mean
                </h5>
                <p className="text-sm text-neutral-300 mb-2">
                  How far each value X is from the mean μ. Positive when above mean, negative when below.
                </p>
                <div className="bg-neutral-800/50 p-2 rounded mt-2">
                  <p className="text-xs text-neutral-400">
                    <strong>Note:</strong> E[X - μ] = 0 always, which is why we need to square the deviations
                  </p>
                </div>
              </div>
            )}

            {selectedParts.squared && (
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  ²  - Squaring the Deviations
                </h5>
                <p className="text-sm text-neutral-300 mb-2">
                  Eliminates negative values and emphasizes larger deviations more than smaller ones.
                </p>
                <div className="bg-neutral-800/50 p-2 rounded mt-2">
                  <p className="text-xs text-neutral-400">
                    <strong>Why square?:</strong> Ensures all deviations are positive and larger deviations have more impact
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {selectedFormula === 'computational' && (
          <>
            {selectedParts.expectedSquare && (
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  E[X²] - Expected Value of X Squared
                </h5>
                <p className="text-sm text-neutral-300 mb-2">
                  The average of the squared values of X. Calculate by summing x² × P(X = x) for all x.
                </p>
                <div className="bg-neutral-800/50 p-2 rounded mt-2">
                  <p className="text-xs text-neutral-400">
                    <strong>Note:</strong> This is different from (E[X])² - we square first, then take expectation
                  </p>
                </div>
              </div>
            )}

            {selectedParts.expectedSquared && (
              <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  (E[X])² - Squared Expected Value
                </h5>
                <p className="text-sm text-neutral-300 mb-2">
                  The square of the mean. Calculate E[X] first, then square the result.
                </p>
                <div className="bg-neutral-800/50 p-2 rounded mt-2">
                  <p className="text-xs text-neutral-400">
                    <strong>Order matters:</strong> (E[X])² ≠ E[X²] in general
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).some(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Variance measures <strong>variability</strong> around the mean:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Low variance: values cluster tightly around the mean</li>
            <li>• High variance: values spread widely from the mean</li>
            <li>• Variance is always non-negative (≥ 0)</li>
            <li>• Units are squared; standard deviation σ = √Var(X) has original units</li>
          </ul>
        </div>
      )}

      {/* Formula Equivalence */}
      {selectedParts.variance && (
        <div className="mt-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2">Both Formulas are Equivalent!</h5>
          <div className="text-center my-3 space-y-2">
            <div className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(X) = E[(X - \\mu)^2] = E[X^2] - (E[X])^2\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            The computational formula E[X²] - (E[X])² is often easier to calculate but both give the same result.
          </p>
        </div>
      )}

      {/* Concrete Example - Show after understanding key parts */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">Concrete Example: Fair Die Roll</h5>
          <div className="text-sm space-y-2">
            <p className="text-neutral-300">X = {1, 2, 3, 4, 5, 6}, each with probability 1/6</p>
            <p className="text-neutral-300">E[X] = 3.5 (we calculated this before)</p>
            <div className="text-center my-2">
              <span className="font-mono text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[E[X^2] = 1^2 \\cdot \\frac{1}{6} + 2^2 \\cdot \\frac{1}{6} + \\cdots + 6^2 \\cdot \\frac{1}{6} = \\frac{91}{6}\\]` 
              }} />
            </div>
            <div className="text-center my-2">
              <span className="font-mono text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[\\text{Var}(X) = \\frac{91}{6} - (3.5)^2 = 15.17 - 12.25 = 2.92\\]` 
              }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(understanding).filter(([key]) => 
            selectedFormula === 'definition' 
              ? !['computational', 'efficiency'].includes(key)
              : !['spread', 'squaring'].includes(key)
          ).map(([key, understood]) => (
            <div 
              key={key}
              className={`p-3 rounded-lg text-center transition-all ${
                understood 
                  ? 'bg-green-900/30 border border-green-500/50' 
                  : 'bg-neutral-700/50 border border-neutral-600'
              }`}
            >
              <p className="text-sm font-medium">
                {key === 'concept' && 'Variance Concept'}
                {key === 'spread' && 'Spread Measure'}
                {key === 'squaring' && 'Squaring Effect'}
                {key === 'computational' && 'E[X²] Term'}
                {key === 'efficiency' && '(E[X])² Term'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand how variance measures spread!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Variance = average squared deviation from the mean.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

VarianceBuilder.displayName = 'VarianceBuilder';

export default VarianceBuilder;