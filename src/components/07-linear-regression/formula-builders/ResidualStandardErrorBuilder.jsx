"use client";
import React, { useState } from 'react';
import { Check, Activity, AlertTriangle, BarChart3, Calculator, Ruler } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ResidualStandardErrorBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    numerator: false,
    denominator: false,
    squareRoot: false
  });
  
  const [understanding, setUnderstanding] = useState({
    residuals: false,
    degreesOfFreedom: false,
    standardError: false,
    interpretation: false
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
        Build the Residual Standard Error Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how we measure the typical prediction error
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 mb-6">
          <span className="text-neutral-500">s =</span>
          
          {/* Square root */}
          <span 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.standardError ? 'text-green-400' : 
              selectedParts.squareRoot ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('squareRoot', 'standardError')}
          >
            √
          </span>
          
          {/* Bracket */}
          <span className="text-neutral-500">[</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-1 rounded ${
                understanding.residuals ? 'text-green-400' : 
                selectedParts.numerator ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('numerator', 'residuals')}
            >
              <div className="text-base">SSE</div>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-1 rounded ${
                understanding.degreesOfFreedom ? 'text-green-400' : 
                selectedParts.denominator ? 'text-red-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('denominator', 'degreesOfFreedom')}
            >
              <div className="text-base">n − 2</div>
            </div>
          </div>
          
          {/* Closing bracket */}
          <span className="text-neutral-500">]</span>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-3">Alternative notations:</p>
          <div className="space-y-2 text-lg font-mono text-neutral-300">
            <div>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[s = \\sqrt{\\frac{\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2}{n-2}}\\]` 
              }} />
            </div>
            <div>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[s = \\sqrt{\\text{MSE}} \\quad \\text{where MSE} = \\frac{\\text{SSE}}{n-2}\\]` 
              }} />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            MSE is the Mean Squared Error - the average squared prediction error
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.numerator && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              The Numerator: SSE (Sum of Squared Errors)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              SSE measures the total amount of variation that remains unexplained by the regression model.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2">
              <div className="text-sm mb-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{SSE} = \\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 = \\sum_{i=1}^{n} e_i^2\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400 mb-2">
                where eᵢ = yᵢ - ŷᵢ is the residual for observation i.
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Larger SSE = model predictions are further from actual values</li>
                <li>• Smaller SSE = model predictions are closer to actual values</li>
                <li>• SSE = 0 would mean perfect predictions (rare!)</li>
              </ul>
            </div>
          </div>
        )}
        
        {selectedParts.denominator && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              The Denominator: n − 2 (Degrees of Freedom)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              We divide by n − 2, not n, because we estimated 2 parameters (b₀ and b₁) from the data.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2 space-y-2">
              <p className="text-xs text-neutral-400">
                <strong>Why n − 2?</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Started with n data points</li>
                <li>• Used data to estimate slope (b₁) → lose 1 degree of freedom</li>
                <li>• Used data to estimate intercept (b₀) → lose 1 more degree of freedom</li>
                <li>• Left with n − 2 degrees of freedom for error estimation</li>
              </ul>
              <div className="mt-2 p-2 bg-red-900/30 rounded">
                <p className="text-xs text-red-300">
                  <strong>Key insight:</strong> This adjustment makes s an unbiased estimator 
                  of the true population standard error σ.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedParts.squareRoot && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              The Square Root: Converting Back to Original Units
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Taking the square root converts from squared units back to the original units of y.
            </p>
            <div className="bg-neutral-800/50 p-3 rounded mt-2 space-y-2">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>Unit conversion example:</strong>
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• If y is in dollars, SSE is in dollars²</li>
                <li>• MSE = SSE/(n-2) is in dollars²</li>
                <li>• s = √MSE is back in dollars</li>
              </ul>
              <div className="mt-2 p-2 bg-yellow-900/30 rounded">
                <p className="text-xs text-yellow-300">
                  <strong>Interpretation:</strong> s represents the typical size of 
                  prediction errors in the same units as y.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Practical Interpretation Section */}
      {(selectedParts.numerator || selectedParts.denominator || selectedParts.squareRoot) && !understanding.interpretation && (
        <div 
          className="mt-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30 cursor-pointer transition-all hover:border-purple-400/50"
          onClick={() => setUnderstanding({...understanding, interpretation: true})}
        >
          <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Click to Learn: What Does 's' Actually Tell Us? 👆
          </h5>
          <p className="text-sm text-neutral-300">
            Understand the practical meaning of the residual standard error in real-world terms.
          </p>
        </div>
      )}

      {understanding.interpretation && (
        <div className="mt-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            ✓ Practical Interpretation of s
          </h5>
          <p className="text-sm text-neutral-300 mb-3">
            The residual standard error 's' gives you the typical size of prediction errors:
          </p>
          <div className="bg-neutral-800/50 rounded p-3">
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>• <strong className="text-purple-300">Rule of thumb:</strong> About 68% of actual values fall within ±s of predicted values</li>
              <li>• <strong className="text-purple-300">95% interval:</strong> About 95% fall within ±2s of predictions</li>
              <li>• <strong className="text-purple-300">Context matters:</strong> An s of $10,000 might be excellent for house prices but terrible for coffee prices</li>
              <li>• <strong className="text-purple-300">Model comparison:</strong> Lower s indicates better fit (but beware overfitting)</li>
            </ul>
          </div>
          <div className="mt-3 p-2 bg-purple-900/30 rounded">
            <p className="text-xs text-purple-300">
              <strong>Example:</strong> If s = $15,000 for house prices, typical predictions are off by about $15,000.
            </p>
          </div>
        </div>
      )}

      {/* The Key Interpretation */}
      {selectedParts.numerator && selectedParts.denominator && selectedParts.squareRoot && understanding.interpretation && (
        <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
          <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            What s Tells Us: Typical Prediction Error
          </h5>
          <div className="text-sm space-y-3">
            <p className="text-neutral-300">
              The residual standard error (s) estimates the <strong>typical size of prediction errors</strong>.
            </p>
            <div className="bg-neutral-800/50 rounded p-3">
              <ul className="space-y-1 text-xs text-neutral-400">
                <li>• <strong>Smaller s:</strong> Predictions are typically closer to actual values</li>
                <li>• <strong>Larger s:</strong> Predictions have more variability around actual values</li>
                <li>• <strong>Rule of thumb:</strong> ~68% of residuals within ±s, ~95% within ±2s</li>
                <li>• <strong>Units:</strong> Same units as the response variable y</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Connection to Confidence/Prediction Intervals */}
      {allUnderstood && (
        <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-3">Uses of Residual Standard Error</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h6 className="font-medium text-white mb-2">Confidence Intervals for β₁:</h6>
              <div className="bg-neutral-800/50 p-2 rounded text-xs">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[b_1 \\pm t_{\\alpha/2,n-2} \\cdot \\text{SE}(b_1)\\]` 
                }} />
                <p className="text-neutral-400 mt-1">where SE(b₁) depends on s</p>
              </div>
            </div>
            <div>
              <h6 className="font-medium text-white mb-2">Prediction Intervals:</h6>
              <div className="bg-neutral-800/50 p-2 rounded text-xs">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\hat{y} \\pm t_{\\alpha/2,n-2} \\cdot s \\sqrt{1 + \\frac{1}{n} + \\frac{(x-\\bar{x})^2}{S_{xx}}}\\]` 
                }} />
                <p className="text-neutral-400 mt-1">s is the key component</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-neutral-800/50 rounded">
            <h6 className="font-medium text-white mb-2">Model Comparison:</h6>
            <p className="text-xs text-neutral-400">
              Compare models using s - lower values indicate better fit to the data, 
              but watch out for overfitting!
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
                {key === 'residuals' && 'SSE (Residuals)'}
                {key === 'degreesOfFreedom' && 'Degrees of Freedom'}
                {key === 'standardError' && 'Standard Error'}
                {key === 'interpretation' && 'Practical Meaning'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand residual standard error! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              s measures the typical size of prediction errors in your regression model.
            </p>
          </div>
        )}
      </div>

      {/* Real Example */}
      {allUnderstood && (
        <div className="mt-6 bg-orange-900/10 rounded-lg p-4 border border-orange-700/30">
          <h5 className="font-semibold text-orange-300 mb-2">Example: Predicting House Prices</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-300 mb-2">Given data (n = 52 houses):</p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• SSE = 480,000 (sum of squared errors)</li>
                <li>• n - 2 = 50 degrees of freedom</li>
                <li>• y = house price in $1000s</li>
              </ul>
            </div>
            <div>
              <div className="bg-neutral-900/50 rounded p-3">
                <p className="text-orange-300 mb-2">
                  <strong>s = √(480,000/50) = √9,600 ≈ $98K</strong>
                </p>
                <p className="text-xs text-neutral-400 mb-1">
                  Typical prediction error: about $98,000
                </p>
                <p className="text-xs text-yellow-400">
                  <strong>Rule of thumb:</strong> ~68% of predictions within ±$98K of actual price
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
          <p className="text-sm text-yellow-400">
            <strong>⚠️ Context Matters:</strong> A "good" value of s depends entirely on your field 
            and the scale of your y-variable. $1K error in house prices vs $1K error in car prices have very different meanings.
          </p>
        </div>
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
          <p className="text-sm text-blue-400">
            <strong>💡 Model Assumptions:</strong> s assumes residuals are normally distributed 
            and have constant variance. Check residual plots to verify these assumptions!
          </p>
        </div>
      </div>
    </div>
  );
});

ResidualStandardErrorBuilder.displayName = 'ResidualStandardErrorBuilder';

export default ResidualStandardErrorBuilder;