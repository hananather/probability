"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const LinearRegressionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    slope: false,
    correlation: false,
    stdDevY: false,
    stdDevX: false
  });
  
  const [understanding, setUnderstanding] = useState({
    slopeConcept: false,
    correlationConcept: false,
    stdDevYConcept: false,
    stdDevXConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-lg p-6 border border-indigo-700/50">
      <h3 className="text-xl font-bold text-indigo-400 mb-6">
        Build the Linear Regression Slope Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how correlation becomes slope
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* b₁ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.slopeConcept ? 'text-green-400' : 
              selectedParts.slope ? 'text-indigo-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('slope', 'slopeConcept')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `b_1` 
            }} />
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* r */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.correlationConcept ? 'text-green-400' : 
              selectedParts.correlation ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('correlation', 'correlationConcept')}
          >
            r
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* (sᵧ/sₓ) */}
          <div className="flex items-center">
            <span className="text-neutral-500">(</span>
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                understanding.stdDevYConcept ? 'text-green-400' : 
                selectedParts.stdDevY ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('stdDevY', 'stdDevYConcept')}
            >
              <span dangerouslySetInnerHTML={{ 
                __html: `s_y` 
              }} />
            </div>
            <span className="text-neutral-500">/</span>
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-1 ${
                understanding.stdDevXConcept ? 'text-green-400' : 
                selectedParts.stdDevX ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('stdDevX', 'stdDevXConcept')}
            >
              <span dangerouslySetInnerHTML={{ 
                __html: `s_x` 
              }} />
            </div>
            <span className="text-neutral-500">)</span>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing covariance form:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[b_1 = \\frac{\\text{Cov}(X,Y)}{\\text{Var}(X)} = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The slope represents the covariance scaled by the variance of the predictor variable
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.slope && (
          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
            <h5 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              b₁ - The Slope Coefficient
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The slope coefficient represents the expected change in Y for each one-unit increase in X. It quantifies the linear relationship between the predictor and response variables.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If b₁ = 2.5 for predicting sales from advertising spend, then each additional dollar of advertising increases expected sales by $2.50
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.correlation && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              r - Correlation Coefficient
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The correlation coefficient measures the strength and direction of the linear relationship between X and Y. It captures the core association that drives the regression relationship.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If r = 0.8 between advertising and sales, there's a strong positive linear relationship that forms the foundation of our prediction model
              </p>
            </div>
          </div>
        )}

        {selectedParts.stdDevY && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              sᵧ - Standard Deviation of Y
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The standard deviation of the response variable Y measures the variability in the outcome we're trying to predict. This scaling factor determines how much the slope responds to changes in correlation.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If sales have sᵧ = $10,000, this large variability means the slope will be scaled up to match the natural variation in sales data
              </p>
            </div>
          </div>
        )}

        {selectedParts.stdDevX && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              sₓ - Standard Deviation of X
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The standard deviation of the predictor variable X measures the variability in our input variable. It appears in the denominator to adjust the slope based on the natural scale of X.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If advertising spend has sₓ = $500, this moderate variability means each unit change in advertising represents a meaningful shift in the predictor scale
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The regression slope transforms correlation into a meaningful prediction tool:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Correlation (r) provides the strength and direction of the relationship</li>
            <li>• The ratio (sᵧ/sₓ) rescales correlation to match the units of both variables</li>
            <li>• Strong correlation with large sᵧ/sₓ ratio produces steep slopes</li>
            <li>• The slope converts correlation into actionable predictions with proper units</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Predicting Sales from Advertising</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[b_1 = 0.8 \\times \\frac{\\$10,000}{\\$500} = 0.8 \\times 20 = 16\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            With r = 0.8, sᵧ = $10,000 (sales variability), and sₓ = $500 (advertising variability), we get b₁ = 16. 
            This means each additional $1 in advertising spend is associated with $16 more in expected sales.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                {key === 'slopeConcept' && 'Slope Coefficient'}
                {key === 'correlationConcept' && 'Correlation Coefficient'}
                {key === 'stdDevYConcept' && 'Y Standard Deviation'}
                {key === 'stdDevXConcept' && 'X Standard Deviation'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the linear regression slope formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Correlation provides direction, while standard deviations provide the proper scaling for predictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

LinearRegressionBuilder.displayName = 'LinearRegressionBuilder';

export default LinearRegressionBuilder;