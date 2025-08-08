"use client";
import React, { useState } from 'react';
import { Check, PieChart, Target, TrendingUp, BarChart3, Award } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const RSquaredBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    ratio: false,
    alternative: false,
    correlation: false
  });
  
  const [understanding, setUnderstanding] = useState({
    regression: false,
    total: false,
    explained: false,
    percentage: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-6 border border-emerald-700/50">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">
        Build the R-Squared (Coefficient of Determination) Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how much variation the regression explains
        </p>
        
        {/* Interactive Formula Display - Primary */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 mb-6">
          <span className="text-neutral-500">R² =</span>
          
          {/* Fraction */}
          <div 
            className={`inline-flex flex-col items-center cursor-pointer transition-all hover:scale-110 rounded-lg px-4 py-2 ${
              understanding.regression || understanding.total ? 'bg-emerald-900/30 border border-emerald-500/50' : 'hover:bg-neutral-800/30'
            }`}
            onClick={() => handlePartClick('ratio', understanding.regression ? 'total' : 'regression')}
          >
            {/* Numerator */}
            <div className={`text-base ${
              understanding.regression ? 'text-green-400' : 
              selectedParts.ratio ? 'text-emerald-400' : 'text-neutral-400'
            }`}>
              SSR
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator */}
            <div className={`text-base ${
              understanding.total ? 'text-green-400' : 
              selectedParts.ratio ? 'text-teal-400' : 'text-neutral-400'
            }`}>
              SST
            </div>
          </div>
        </div>

        {/* Alternative formulations */}
        <div className="mt-6 space-y-4">
          <div 
            className={`p-4 bg-neutral-800/30 rounded-lg cursor-pointer transition-all ${
              selectedParts.alternative ? 'bg-blue-900/30 border border-blue-500/50' : 'hover:bg-neutral-700/30'
            }`}
            onClick={() => handlePartClick('alternative', 'explained')}
          >
            <p className="text-sm text-neutral-400 mb-2">Alternative formulation (click to explore!):</p>
            <div className="text-lg font-mono text-neutral-300">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}} = \\frac{\\text{SST} - \\text{SSE}}{\\text{SST}}\\]` 
              }} />
            </div>
            <p className="text-xs text-blue-400 mt-1">
              1 minus the proportion of unexplained variation
            </p>
          </div>

          <div 
            className={`p-4 bg-neutral-800/30 rounded-lg cursor-pointer transition-all ${
              selectedParts.correlation ? 'bg-purple-900/30 border border-purple-500/50' : 'hover:bg-neutral-700/30'
            }`}
            onClick={() => handlePartClick('correlation', 'percentage')}
          >
            <p className="text-sm text-neutral-400 mb-2">Connection to correlation (click!):</p>
            <div className="text-lg font-mono text-neutral-300">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[R^2 = r^2\\]` 
              }} />
            </div>
            <p className="text-xs text-purple-400 mt-1">
              R-squared equals the correlation coefficient squared!
            </p>
          </div>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.ratio && (
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              The Ratio: SSR/SST
            </h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-300 mb-2">
                  <strong>SSR (Sum of Squares Regression):</strong>
                </p>
                <div className="bg-neutral-800/50 rounded p-2 mb-2">
                  <span className="text-xs" dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{SSR} = \\sum_{i=1}^{n} (\\hat{y}_i - \\bar{y})^2\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400">
                  Measures how much the regression line predictions vary from the mean.
                  This is the variation <em>explained</em> by the model.
                </p>
              </div>
              <div>
                <p className="text-neutral-300 mb-2">
                  <strong>SST (Sum of Squares Total):</strong>
                </p>
                <div className="bg-neutral-800/50 rounded p-2 mb-2">
                  <span className="text-xs" dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{SST} = \\sum_{i=1}^{n} (y_i - \\bar{y})^2\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400">
                  Measures how much the actual y-values vary from their mean.
                  This is the <em>total</em> variation in y.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {selectedParts.alternative && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Alternative View: R² = 1 - SSE/SST
            </h5>
            <p className="text-sm text-neutral-300 mb-3">
              This shows R² as "1 minus the proportion of unexplained variation."
            </p>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-xs text-neutral-400 mb-2">
                <strong>SSE (Sum of Squares Error):</strong>
              </p>
              <div className="text-xs mb-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{SSE} = \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400">
                The variation that remains unexplained after fitting the model.
              </p>
            </div>
            <div className="mt-3 p-2 bg-blue-900/30 rounded">
              <p className="text-xs text-blue-300">
                <strong>Key insight:</strong> SST = SSR + SSE, so R² = SSR/SST = 1 - SSE/SST
              </p>
            </div>
          </div>
        )}

        {selectedParts.correlation && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              The Beautiful Connection: R² = r²
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              In simple linear regression, R-squared equals the correlation coefficient squared!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-xs text-neutral-400 mb-1">
                  <strong>If r = 0.8:</strong>
                </p>
                <p className="text-xs text-purple-300">
                  R² = (0.8)² = 0.64 = 64%
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-xs text-neutral-400 mb-1">
                  <strong>If r = -0.9:</strong>
                </p>
                <p className="text-xs text-purple-300">
                  R² = (-0.9)² = 0.81 = 81%
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Note: R² is always positive, even when correlation is negative!
            </p>
          </div>
        )}
      </div>

      {/* The Key Interpretation */}
      {selectedParts.ratio && (
        <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            What R² Tells Us: Proportion of Variance Explained
          </h5>
          <div className="text-sm space-y-3">
            <p className="text-neutral-300">
              R² represents the <strong>proportion of the variance in y that is explained by x</strong>.
            </p>
            <div className="bg-neutral-800/50 rounded p-3">
              <ul className="space-y-1 text-xs text-neutral-400">
                <li>• <strong>R² = 0:</strong> The model explains none of the variation (no relationship)</li>
                <li>• <strong>R² = 0.25:</strong> The model explains 25% of the variation</li>
                <li>• <strong>R² = 0.64:</strong> The model explains 64% of the variation (r = ±0.8)</li>
                <li>• <strong>R² = 1:</strong> The model explains all variation (perfect fit)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Decomposition Visualization */}
      {allUnderstood && (
        <div className="mt-6 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold text-green-400 mb-3">Variance Decomposition</h5>
          <div className="text-center mb-3">
            <span className="text-lg" dangerouslySetInnerHTML={{ 
              __html: `\\[\\underbrace{\\sum(y_i - \\bar{y})^2}_{\\text{Total Variation}} = \\underbrace{\\sum(\\hat{y}_i - \\bar{y})^2}_{\\text{Explained by Model}} + \\underbrace{\\sum(y_i - \\hat{y}_i)^2}_{\\text{Unexplained Error}}\\]` 
            }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-neutral-800/50 p-2 rounded">
              <p className="text-neutral-300 font-medium">SST</p>
              <p className="text-neutral-400">Total</p>
            </div>
            <div className="bg-emerald-800/50 p-2 rounded">
              <p className="text-emerald-300 font-medium">SSR</p>
              <p className="text-emerald-400">Explained</p>
            </div>
            <div className="bg-red-800/50 p-2 rounded">
              <p className="text-red-300 font-medium">SSE</p>
              <p className="text-red-400">Error</p>
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
                {key === 'regression' && 'SSR (Explained)'}
                {key === 'total' && 'SST (Total)'}
                {key === 'explained' && 'Variance Explained'}
                {key === 'percentage' && 'Percentage Interpretation'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand R-squared! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              R² measures how well the regression model explains the variation in your data.
            </p>
          </div>
        )}
      </div>

      {/* Real Example */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/10 rounded-lg p-4 border border-emerald-700/30">
          <h5 className="font-semibold text-emerald-300 mb-2">Example: Advertising Budget vs Sales</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-300 mb-2">Given data:</p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• SST = 10,000 (total sales variation)</li>
                <li>• SSR = 7,500 (explained by advertising)</li>
                <li>• SSE = 2,500 (unexplained variation)</li>
              </ul>
            </div>
            <div>
              <div className="bg-neutral-900/50 rounded p-3">
                <p className="text-emerald-300 mb-1">
                  <strong>R² = 7,500/10,000 = 0.75 = 75%</strong>
                </p>
                <p className="text-xs text-neutral-400 mb-2">
                  75% of sales variation is explained by advertising budget
                </p>
                <p className="text-xs text-teal-400">
                  <strong>Check:</strong> SST = SSR + SSE = 7,500 + 2,500 = 10,000 ✓
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
            <strong>⚠️ Important:</strong> Higher R² doesn't automatically mean a better model. 
            Consider context, overfitting, and whether the relationship makes practical sense.
          </p>
        </div>
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
          <p className="text-sm text-blue-400">
            <strong>💡 Remember:</strong> R² only measures linear relationships. 
            A low R² doesn't mean there's no relationship - it might be non-linear!
          </p>
        </div>
      </div>
    </div>
  );
});

RSquaredBuilder.displayName = 'RSquaredBuilder';

export default RSquaredBuilder;