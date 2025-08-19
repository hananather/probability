"use client";
import React, { useState } from 'react';
import { Check, BarChart3, TrendingUp, Calculator } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const CorrelationCoefficientBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false,
    interpretation: false
  });
  
  const [understanding, setUnderstanding] = useState({
    covariance: false,
    standardDeviations: false,
    relationship: false,
    scaling: false
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
        Build the Correlation Coefficient Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how correlation measures linear relationship strength
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 mb-6">
          <span className="text-neutral-500">r =</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator - Covariance terms */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
                understanding.covariance ? 'text-green-400' : 
                selectedParts.numerator ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('numerator', 'covariance')}
            >
              <div className="text-base">Σ(x - x̄)(y - ȳ)</div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-2"></div>
            
            {/* Denominator - Standard deviations */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded ${
                understanding.standardDeviations ? 'text-green-400' : 
                selectedParts.denominator ? 'text-indigo-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('denominator', 'standardDeviations')}
            >
              <div className="text-base">√[Σ(x - x̄)²Σ(y - ȳ)²]</div>
            </div>
          </div>
        </div>

        {/* Alternative notation */}
        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[r = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\sigma_Y} = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Where Cov(X,Y) is covariance and σₓ, σᵧ are standard deviations
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.numerator && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              The Numerator: Covariance Σ(x - x̄)(y - ȳ)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This measures how x and y vary together. When both are above their means, 
              the product is positive. When both are below, the product is positive. 
              When one is above and one below, the product is negative.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>Geometric interpretation:</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Positive: Points tend to be in quadrants I and III (positive slope)</li>
                <li>• Negative: Points tend to be in quadrants II and IV (negative slope)</li>
                <li>• Zero: No linear pattern (points scattered)</li>
              </ul>
            </div>
          </div>
        )}
        
        {selectedParts.denominator && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              The Denominator: Standard Deviation Product
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This normalizes the covariance by the spread of both variables. 
              √[Σ(x - x̄)²] is the standard deviation of x times √n, 
              √[Σ(y - ȳ)²] is the standard deviation of y times √n.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Why normalize?</strong> Without this, correlation would depend on the units 
                of measurement. Dividing by the standard deviations makes r unitless and bounded 
                between -1 and +1.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.numerator && selectedParts.denominator && (
        <div 
          className={`mt-6 rounded-lg p-4 border transition-all cursor-pointer hover:scale-[1.02] ${
            understanding.relationship 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-500/30 hover:from-blue-900/40 hover:to-indigo-900/40'
          }`}
          onClick={() => {
            setUnderstanding(prev => 
              prev.relationship ? prev : {...prev, relationship: true}
            );
          }}
        >
          <h5 className={`font-semibold mb-2 flex items-center gap-2 ${
            understanding.relationship ? 'text-green-400' : 'text-blue-400'
          }`}>
            <TrendingUp className="w-4 h-4" />
            The Key Insight: Standardized Covariance {!understanding.relationship && '(Click to understand)'}
          </h5>
          <p className="text-sm text-neutral-300 mb-3">
            Correlation is <strong>standardized covariance</strong> - it measures the strength 
            and direction of linear relationship on a fixed scale:
          </p>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• <strong>r = +1:</strong> Perfect positive linear relationship</li>
            <li>• <strong>r = -1:</strong> Perfect negative linear relationship</li>
            <li>• <strong>r = 0:</strong> No linear relationship</li>
            <li>• <strong>|r| &gt; 0.7:</strong> Strong linear relationship</li>
            <li>• <strong>|r| &lt; 0.3:</strong> Weak linear relationship</li>
          </ul>
        </div>
      )}

      {/* Advanced Properties - Clickable for scaling understanding */}
      {selectedParts.numerator && selectedParts.denominator && (
        <div 
          className={`mt-6 rounded-lg p-4 border transition-all cursor-pointer hover:scale-[1.02] ${
            understanding.scaling 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30'
          }`}
          onClick={() => {
            setUnderstanding(prev => 
              prev.scaling ? prev : {...prev, scaling: true}
            );
          }}
        >
          <h5 className={`font-semibold mb-2 ${
            understanding.scaling ? 'text-green-400' : 'text-purple-400'
          }`}>Advanced Properties of Correlation {!understanding.scaling && '(Click to understand)'}</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h6 className="font-medium text-white mb-2">Scale Invariance:</h6>
              <span className="text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[r(aX + b, cY + d) = \\text{sign}(ac) \\cdot r(X,Y)\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">
                Linear transformations don't change correlation magnitude
              </p>
            </div>
            <div>
              <h6 className="font-medium text-white mb-2">Cauchy-Schwarz Bound:</h6>
              <span className="text-xs" dangerouslySetInnerHTML={{ 
                __html: `\\[|r| = \\frac{|\\text{Cov}(X,Y)|}{\\sigma_X \\sigma_Y} \\leq 1\\]` 
              }} />
              <p className="text-xs text-neutral-400 mt-1">
                Correlation is always bounded by -1 and +1
              </p>
            </div>
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
                {key === 'standardDeviations' && 'Standard Deviations'}
                {key === 'relationship' && 'Linear Relationship'}
                {key === 'scaling' && 'Scale Independence'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the correlation coefficient! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Correlation quantifies linear relationships and is the foundation for regression analysis.
            </p>
          </div>
        )}
      </div>

      {/* Real Example */}
      {allUnderstood && (
        <div className="mt-6 bg-blue-900/10 rounded-lg p-4 border border-blue-700/30">
          <h5 className="font-semibold text-blue-300 mb-2">Example: Height vs Weight</h5>
          <p className="text-sm text-neutral-300 mb-2">
            For height (x) and weight (y) data with r = 0.85:
          </p>
          <div className="bg-neutral-900/50 rounded p-3 text-xs text-neutral-400">
            <p><strong>Interpretation:</strong> Strong positive linear relationship</p>
            <p><strong>Meaning:</strong> Taller people tend to weigh more</p>
            <p><strong>r² = 0.72:</strong> 72% of weight variation explained by height</p>
          </div>
        </div>
      )}
    </div>
  );
});

CorrelationCoefficientBuilder.displayName = 'CorrelationCoefficientBuilder';

export default CorrelationCoefficientBuilder;