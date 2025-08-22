"use client";
import React, { useState } from 'react';
import CorrelationCoefficientBuilder from './CorrelationCoefficientBuilder';
import LeastSquaresSlopeBuilder from './LeastSquaresSlopeBuilder';
import LinearRegressionBuilder from './LinearRegressionBuilder';
import LeastSquaresInterceptBuilder from './LeastSquaresInterceptBuilder';
import RSquaredBuilder from './RSquaredBuilder';
import ResidualStandardErrorBuilder from './ResidualStandardErrorBuilder';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Target,
  PieChart,
  Activity,
  Crosshair
} from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter7FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    correlationCoefficient: true,
    leastSquaresSlope: false,
    linearRegressionSlope: false,
    leastSquaresIntercept: false,
    rSquared: false,
    residualStandardError: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-full lg:max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Chapter 7: Linear Regression Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of linear regression by building them step-by-step. 
            From correlation to prediction intervals, understand why each formula works and when to use it.
          </p>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-700/30">
            <p className="text-sm text-blue-300">
              <strong>Learning Path:</strong> Start with correlation to understand relationships, 
              then build the regression line, measure its quality, and quantify uncertainty.
            </p>
          </div>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Correlation Coefficient */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('correlationCoefficient')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Correlation Coefficient Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Measure the strength and direction of linear relationship: r = Cov(X,Y)/(σₓσᵧ)
                  </p>
                  <div className="text-xs text-blue-400 mt-2">
                    Foundation concept • Start here to understand linear relationships
                  </div>
                </div>
              </div>
              {expandedSections.correlationCoefficient ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.correlationCoefficient && (
              <div className="p-4 sm:p-6 pt-0">
                <CorrelationCoefficientBuilder />
              </div>
            )}
          </div>

          {/* Least Squares Slope */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('leastSquaresSlope')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Least Squares Slope Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Find the best-fit line slope: b₁ = Σ(x-x̄)(y-ȳ)/Σ(x-x̄)² = r×(sᵧ/sₓ)
                  </p>
                  <div className="text-xs text-teal-400 mt-2">
                    Core regression • How correlation becomes slope
                  </div>
                </div>
              </div>
              {expandedSections.leastSquaresSlope ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.leastSquaresSlope && (
              <div className="p-4 sm:p-6 pt-0">
                <LeastSquaresSlopeBuilder />
              </div>
            )}
          </div>

          {/* Linear Regression Slope (Correlation Method) */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('linearRegressionSlope')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Linear Regression Slope (Correlation Method)</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Alternative approach: Understanding slope through correlation b₁ = r × (sᵧ/sₓ)
                  </p>
                  <div className="text-xs text-indigo-400 mt-2">
                    Simplified approach • See how correlation directly becomes slope
                  </div>
                </div>
              </div>
              {expandedSections.linearRegressionSlope ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.linearRegressionSlope && (
              <div className="p-4 sm:p-6 pt-0">
                <LinearRegressionBuilder />
              </div>
            )}
          </div>

          {/* Least Squares Intercept */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('leastSquaresIntercept')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <Crosshair className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Least Squares Intercept Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Where the line crosses the y-axis: b₀ = ȳ - b₁x̄
                  </p>
                  <div className="text-xs text-purple-400 mt-2">
                    Line positioning • Ensures line passes through (x̄, ȳ)
                  </div>
                </div>
              </div>
              {expandedSections.leastSquaresIntercept ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.leastSquaresIntercept && (
              <div className="p-4 sm:p-6 pt-0">
                <LeastSquaresInterceptBuilder />
              </div>
            )}
          </div>

          {/* R-Squared */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('rSquared')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <PieChart className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">R-Squared Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Coefficient of determination: R² = SSR/SST = 1 - SSE/SST = r²
                  </p>
                  <div className="text-xs text-emerald-400 mt-2">
                    Model quality • Proportion of variance explained
                  </div>
                </div>
              </div>
              {expandedSections.rSquared ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.rSquared && (
              <div className="p-4 sm:p-6 pt-0">
                <RSquaredBuilder />
              </div>
            )}
          </div>

          {/* Residual Standard Error */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('residualStandardError')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Residual Standard Error Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Typical prediction error size: s = √[SSE/(n-2)]
                  </p>
                  <div className="text-xs text-orange-400 mt-2">
                    Error quantification • Basis for confidence & prediction intervals
                  </div>
                </div>
              </div>
              {expandedSections.residualStandardError ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.residualStandardError && (
              <div className="p-4 sm:p-6 pt-0">
                <ResidualStandardErrorBuilder />
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-700/50">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-3">
            <Target className="w-6 h-6" />
            The Complete Linear Regression Story
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-3">Building the Model:</h3>
              <ol className="space-y-2 text-neutral-300">
                <li className="flex gap-2">
                  <span className="text-blue-400 font-mono">1.</span>
                  <div>
                    <strong>Measure relationship:</strong> Calculate correlation coefficient r 
                    to quantify linear association strength and direction.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-400 font-mono">2.</span>
                  <div>
                    <strong>Find the slope:</strong> Use least squares to find b₁, 
                    the change in y per unit change in x.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400 font-mono">3.</span>
                  <div>
                    <strong>Position the line:</strong> Calculate intercept b₀ 
                    so the line passes through (x̄, ȳ).
                  </div>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Evaluating the Model:</h3>
              <ol className="space-y-2 text-neutral-300" start="4">
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-mono">4.</span>
                  <div>
                    <strong>Assess model quality:</strong> Calculate R² to see 
                    what percentage of variation is explained.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400 font-mono">5.</span>
                  <div>
                    <strong>Quantify uncertainty:</strong> Use residual standard error s 
                    for confidence intervals and prediction intervals.
                  </div>
                </li>
              </ol>
            </div>
          </div>
          
          {/* Key Relationships */}
          <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg">
            <h4 className="font-semibold text-white mb-3">Key Relationships to Remember:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="text-blue-400 font-mono mb-1">b₁ = r × (sᵧ/sₓ)</div>
                <p className="text-neutral-400">Slope from correlation</p>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 font-mono mb-1">R² = r²</div>
                <p className="text-neutral-400">Simple linear regression</p>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-mono mb-1">SST = SSR + SSE</div>
                <p className="text-neutral-400">Variance decomposition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tips */}
        <div className="mt-8 bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">💡 Learning Tips:</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• <strong>Start with correlation</strong> to understand the relationship concept</li>
            <li>• <strong>Build the regression line</strong> by understanding slope and intercept</li>
            <li>• <strong>Evaluate model quality</strong> with R² before making predictions</li>
            <li>• <strong>Use residual standard error</strong> to understand prediction uncertainty</li>
            <li>• <strong>Click on each formula part</strong> to see why it's there and what it means</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chapter7FormulaHub;