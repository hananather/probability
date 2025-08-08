"use client";
import React, { useState } from 'react';
import { Check, TrendingUp, Target, Calculator, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const LeastSquaresSlopeBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false,
    correlation: false
  });
  
  const [understanding, setUnderstanding] = useState({
    covariance: false,
    varianceX: false,
    geometric: false,
    leastSquares: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 rounded-lg p-6 border border-teal-700/50">
      <h3 className="text-xl font-bold text-teal-400 mb-6">
        Build the Least Squares Slope Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we find the best-fit line slope
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 mb-6">
          <span className="text-neutral-500">b₁ =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
                understanding.covariance ? 'text-green-400' : 
                selectedParts.numerator ? 'text-teal-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('numerator', 'covariance')}
            >
              <div className="text-base">Σ(x - x̄)(y - ȳ)</div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
                understanding.varianceX ? 'text-green-400' : 
                selectedParts.denominator ? 'text-cyan-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('denominator', 'varianceX')}
            >
              <div className="text-base">Σ(x - x̄)²</div>
            </div>
          </div>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-3">Alternative formulations:</p>
          <div className="space-y-2 text-lg font-mono text-neutral-300">
            <div>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[b_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{\\text{Cov}(X,Y)}{\\text{Var}(X)}\\]` 
              }} />
            </div>
            <div 
              className={`cursor-pointer transition-all hover:scale-105 p-2 rounded ${
                selectedParts.correlation ? 'bg-purple-900/30 border border-purple-500/50' : 'hover:bg-neutral-700/30'
              }`}
              onClick={() => handlePartClick('correlation', 'geometric')}
            >
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[b_1 = r \\cdot \\frac{s_y}{s_x}\\]` 
              }} />
              <p className="text-xs text-purple-400 mt-1">Click to see the correlation connection!</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The slope is the correlation times the ratio of standard deviations
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.numerator && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              The Numerator: Covariance Σ(x - x̄)(y - ȳ)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This measures how x and y change together. It's the same numerator as in correlation! 
              When x is above its mean and y is above its mean (or both below), this contributes positively.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Units:</strong> The covariance has units of (x-units) × (y-units). 
                For example, if x is height in inches and y is weight in pounds, 
                covariance has units of inch-pounds.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.denominator && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              The Denominator: Variance of X, Σ(x - x̄)²
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This measures how much x varies from its mean. Dividing covariance by this gives 
              us the change in y per unit change in x - exactly what slope means!
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>Why this denominator?</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• It standardizes by the spread of x values</li>
                <li>• Gives slope units of y-units per x-unit</li>
                <li>• Makes slope independent of x's measurement scale</li>
              </ul>
            </div>
          </div>
        )}

        {selectedParts.correlation && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              The Connection to Correlation: b₁ = r × (sᵧ/sₓ)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This reveals the beautiful relationship between slope and correlation! 
              The slope equals correlation times the ratio of standard deviations.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2 space-y-2">
              <p className="text-xs text-neutral-400">
                <strong>Interpretation:</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• If sᵧ = sₓ, then slope = correlation</li>
                <li>• If y is more spread out than x, slope > |r|</li>
                <li>• If x is more spread out than y, slope < |r|</li>
                <li>• The sign of slope always matches the sign of r</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* The Geometric Interpretation */}
      {selectedParts.numerator && selectedParts.denominator && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-4 border border-teal-500/30">
          <h5 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            The Geometric Interpretation: Finding the Best Fit
          </h5>
          <p className="text-sm text-neutral-300 mb-3">
            This slope minimizes the sum of squared vertical distances from points to the line:
          </p>
          <div className="bg-neutral-900/50 rounded p-3 text-sm">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Minimize: } \\sum_{i=1}^{n} (y_i - b_0 - b_1 x_i)^2\\]` 
            }} />
            <p className="text-xs text-neutral-400 mt-2">
              Taking the derivative with respect to b₁ and setting to zero gives our formula!
            </p>
          </div>
        </div>
      )}

      {/* Least Squares Properties */}
      {allUnderstood && (
        <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-2">Properties of the Least Squares Slope</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h6 className="font-medium text-white mb-2">Unbiased Estimator:</h6>
              <span className="text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[E[b_1] = \\beta_1\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">
                Expected value equals true population slope
              </p>
            </div>
            <div>
              <h6 className="font-medium text-white mb-2">Line Always Passes Through:</h6>
              <span className="text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[(\\bar{x}, \\bar{y})\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">
                The centroid of the data points
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-neutral-800/50 rounded">
            <h6 className="font-medium text-white mb-2">Sum of Residuals Property:</h6>
            <span className="text-sm" dangerouslySetInnerHTML={{ 
              __html: `\\[\\sum_{i=1}^{n} (y_i - \\hat{y}_i) = 0\\]` 
            }} />
            <p className="text-xs text-neutral-400 mt-1">
              The residuals always sum to zero - the line balances positive and negative errors
            </p>
          </div>
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
                {key === 'covariance' && 'Covariance (Numerator)'}
                {key === 'varianceX' && 'Variance of X'}
                {key === 'geometric' && 'Geometric Meaning'}
                {key === 'leastSquares' && 'Least Squares Method'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the least squares slope! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              The slope quantifies how y changes per unit change in x, minimizing squared errors.
            </p>
          </div>
        )}
      </div>

      {/* Real Example */}
      {allUnderstood && (
        <div className="mt-6 bg-teal-900/10 rounded-lg p-4 border border-teal-700/30">
          <h5 className="font-semibold text-teal-300 mb-2">Example: House Size vs Price</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-300 mb-2">Given data:</p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Σ(x - x̄)(y - ȳ) = 180,000</li>
                <li>• Σ(x - x̄)² = 1,200</li>
                <li>• x = house size (sq ft)</li>
                <li>• y = price ($1000s)</li>
              </ul>
            </div>
            <div>
              <div className="bg-neutral-900/50 rounded p-3">
                <p className="text-neutral-300 mb-1">
                  <strong>b₁ = 180,000/1,200 = $150 per sq ft</strong>
                </p>
                <p className="text-xs text-neutral-400">
                  Each additional square foot increases price by $150 on average
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

LeastSquaresSlopeBuilder.displayName = 'LeastSquaresSlopeBuilder';

export default LeastSquaresSlopeBuilder;