"use client";
import React, { useState } from 'react';
import { Check, Crosshair, MapPin, Calculator, ArrowRight } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const LeastSquaresInterceptBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    yBar: false,
    slopeXBar: false,
    geometric: false
  });
  
  const [understanding, setUnderstanding] = useState({
    centroid: false,
    linePassesThrough: false,
    yIntercept: false,
    relationship: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Build the Least Squares Intercept Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we find where the line crosses the y-axis
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 mb-6">
          <span className="text-neutral-500">b₀ =</span>
          
          {/* First term */}
          <span 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
              understanding.centroid ? 'text-green-400' : 
              selectedParts.yBar ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('yBar', 'centroid')}
          >
            ȳ
          </span>
          
          {/* Minus sign */}
          <span className="text-neutral-500">−</span>
          
          {/* Second term */}
          <span 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
              understanding.linePassesThrough ? 'text-green-400' : 
              selectedParts.slopeXBar ? 'text-pink-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('slopeXBar', 'linePassesThrough')}
          >
            b₁x̄
          </span>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Understanding the constraint:</p>
          <div className="text-lg font-mono text-neutral-300 mb-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Since the line passes through } (\\bar{x}, \\bar{y}): \\quad \\bar{y} = b_0 + b_1\\bar{x}\\]` 
            }} />
          </div>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Solving for } b_0: \\quad b_0 = \\bar{y} - b_1\\bar{x}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The intercept adjusts so the line passes through the center of the data
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.yBar && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              The First Term: ȳ (Mean of Y)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This is the average of all y-values in your data. It represents the "typical" y-value 
              and serves as the starting point for finding the y-intercept.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>Geometric meaning:</strong> If the slope were zero (horizontal line), 
                then b₀ = ȳ and the line would be y = ȳ for all x.
              </p>
              <p className="text-xs text-neutral-400">
                <strong>Why start with ȳ?</strong> The least squares line must pass through 
                the centroid (x̄, ȳ) of the data points.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.slopeXBar && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              The Adjustment Term: −b₁x̄
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This term adjusts the intercept based on the slope and the mean of x. 
              Since the line must pass through (x̄, ȳ), we need to "back up" along the line 
              to find where it crosses the y-axis.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2 space-y-2">
              <p className="text-xs text-neutral-400">
                <strong>Think of it this way:</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Start at point (x̄, ȳ) on the line</li>
                <li>• Move left to x = 0 (the y-axis)</li>
                <li>• The distance moved is x̄ units</li>
                <li>• The vertical change is −b₁ × x̄</li>
                <li>• So y-intercept = ȳ + (−b₁ × x̄)</li>
              </ul>
            </div>
          </div>
        )}

        {selectedParts.yBar && selectedParts.slopeXBar && (
          <div 
            className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border cursor-pointer transition-all ${
              selectedParts.geometric ? 'border-indigo-500/50' : 'border-purple-500/30 hover:border-purple-400/50'
            }`}
            onClick={() => {
              handlePartClick('geometric', 'yIntercept');
              if (!understanding.relationship) {
                setUnderstanding({...understanding, relationship: true});
              }
            }}
          >
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              Click to See the Geometric Interpretation! 👆
            </h5>
            <p className="text-sm text-neutral-300">
              Understanding why this formula guarantees the line passes through (x̄, ȳ)
            </p>
          </div>
        )}

        {selectedParts.geometric && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Geometric Interpretation: Moving Along the Line
            </h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-300 mb-2">
                  <strong>The constraint:</strong> The line y = b₀ + b₁x must pass through (x̄, ȳ)
                </p>
                <div className="bg-neutral-900/50 rounded p-2 text-xs">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[\\bar{y} = b_0 + b_1\\bar{x}\\]` 
                  }} />
                </div>
              </div>
              <div>
                <p className="text-neutral-300 mb-2">
                  <strong>To find y-intercept:</strong> Set x = 0 and solve for y
                </p>
                <div className="bg-neutral-900/50 rounded p-2 text-xs">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[b_0 = \\bar{y} - b_1\\bar{x}\\]` 
                  }} />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-neutral-800/50 rounded">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>Visual understanding:</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• If x̄ &gt; 0 and slope &gt; 0: intercept &lt; ȳ (line rises from left)</li>
                <li>• If x̄ &gt; 0 and slope &lt; 0: intercept &gt; ȳ (line falls from left)</li>
                <li>• If x̄ = 0: intercept = ȳ (data centered at origin)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Key Properties */}
      {allUnderstood && (
        <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-2">Key Properties of the Intercept</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h6 className="font-medium text-white mb-2">Always Ensures:</h6>
              <span className="text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[\\text{Line passes through } (\\bar{x}, \\bar{y})\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">
                The centroid property is guaranteed by this formula
              </p>
            </div>
            <div>
              <h6 className="font-medium text-white mb-2">Interpretation:</h6>
              <p className="text-xs text-neutral-400">
                Predicted y-value when x = 0. May or may not be meaningful 
                depending on whether x = 0 is within the data range.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-neutral-800/50 rounded">
            <h6 className="font-medium text-white mb-2">Residual Sum Property:</h6>
            <span className="text-sm" dangerouslySetInnerHTML={{ 
              __html: `\\[\\sum_{i=1}^{n} (y_i - \\hat{y}_i) = 0 \\quad \\text{and} \\quad \\sum_{i=1}^{n} x_i(y_i - \\hat{y}_i) = 0\\]` 
            }} />
            <p className="text-xs text-neutral-400 mt-1">
              These normal equations lead directly to our formulas for b₀ and b₁
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
                {key === 'centroid' && 'Mean of Y (ȳ)'}
                {key === 'linePassesThrough' && 'Centroid Property'}
                {key === 'yIntercept' && 'Y-Intercept Meaning'}
                {key === 'relationship' && 'Slope Relationship'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the least squares intercept! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              The intercept ensures the line passes through the data's center point.
            </p>
          </div>
        )}
      </div>

      {/* Real Example */}
      {allUnderstood && (
        <div className="mt-6 bg-purple-900/10 rounded-lg p-4 border border-purple-700/30">
          <h5 className="font-semibold text-purple-300 mb-2">Example: Study Hours vs Test Score</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-300 mb-2">Given data:</p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• x̄ = 5 hours (mean study time)</li>
                <li>• ȳ = 78 points (mean test score)</li>
                <li>• b₁ = 4 points per hour</li>
              </ul>
            </div>
            <div>
              <div className="bg-neutral-900/50 rounded p-3">
                <p className="text-neutral-300 mb-1">
                  <strong>b₀ = 78 − 4(5) = 58 points</strong>
                </p>
                <p className="text-xs text-neutral-400 mb-2">
                  Predicted score with 0 hours of study
                </p>
                <p className="text-xs text-yellow-400">
                  <strong>Check:</strong> At x̄ = 5: ŷ = 58 + 4(5) = 78 = ȳ ✓
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning about extrapolation */}
      <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
        <p className="text-sm text-yellow-400">
          <strong>⚠️ Extrapolation Warning:</strong> The intercept (b₀) represents the predicted y-value 
          when x = 0. This may not be meaningful if x = 0 is outside your data range!
        </p>
      </div>
    </div>
  );
});

LeastSquaresInterceptBuilder.displayName = 'LeastSquaresInterceptBuilder';

export default LeastSquaresInterceptBuilder;