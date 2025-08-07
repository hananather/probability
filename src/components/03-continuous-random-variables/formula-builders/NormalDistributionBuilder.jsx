"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, Sigma, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const NormalDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    function: false,
    normalizing: false,
    mean: false,
    variance: false,
    exponential: false
  });
  
  const [understanding, setUnderstanding] = useState({
    pdfFunction: false,
    normalizingConstant: false,
    meanParameter: false,
    varianceParameter: false,
    exponentialDecay: false
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
        Build the Normal Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand the bell curve equation
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* f(x) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.pdfFunction ? 'text-green-400' : 
              selectedParts.function ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('function', 'pdfFunction')}
          >
            f(x)
          </div>
          
          <span className="text-neutral-500">=</span>
          
          {/* 1/(σ√(2π)) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.normalizingConstant ? 'text-green-400' : 
              selectedParts.normalizing ? 'text-cyan-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('normalizing', 'normalizingConstant')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `\\frac{1}{\\sigma\\sqrt{2\\pi}}` 
            }} />
          </div>
          
          <span className="text-neutral-500">×</span>
          
          {/* e^[-(x-μ)²/(2σ²)] */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.exponentialDecay ? 'text-green-400' : 
              selectedParts.exponential ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('exponential', 'exponentialDecay')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}` 
            }} />
          </div>
        </div>

        {/* Highlight individual parameters within the exponential */}
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-400 mb-3">Key parameters in the exponential:</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {/* μ - Mean */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded-lg border ${
                understanding.meanParameter ? 'text-green-400 border-green-500/30 bg-green-900/20' : 
                selectedParts.mean ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('mean', 'meanParameter')}
            >
              <span className="text-lg font-mono">μ</span>
              <p className="text-xs mt-1">Mean</p>
            </div>
            
            {/* σ² - Variance */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-3 py-2 rounded-lg border ${
                understanding.varianceParameter ? 'text-green-400 border-green-500/30 bg-green-900/20' : 
                selectedParts.variance ? 'text-orange-400 border-orange-500/30 bg-orange-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('variance', 'varianceParameter')}
            >
              <span className="text-lg font-mono">σ²</span>
              <p className="text-xs mt-1">Variance</p>
            </div>
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing standard normal form:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{z^2}{2}} \\quad \\text{where} \\quad z = \\frac{x - \\mu}{\\sigma}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            The standard normal form with z-score transformation
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.function && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              f(x) - The Probability Density Function
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This represents the height of the normal curve at any given value x. Higher values indicate more likely outcomes.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For human heights, f(70 inches) gives the relative likelihood of someone being exactly 70 inches tall
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.normalizing && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              1/(σ√(2π)) - The Normalizing Constant
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This constant ensures the total area under the curve equals 1, making it a valid probability distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For σ = 10, this constant ≈ 0.04, making the curve narrower and taller
              </p>
            </div>
          </div>
        )}

        {selectedParts.mean && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              μ - The Mean (Center of Distribution)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The mean determines where the bell curve is centered. The curve is perfectly symmetric around μ.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If μ = 500 for SAT scores, the curve peaks at 500 points
              </p>
            </div>
          </div>
        )}

        {selectedParts.variance && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Sigma className="w-4 h-4" />
              σ² - The Variance (Spread)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The variance controls how spread out the distribution is. Larger σ² means wider, flatter curves.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> SAT scores with σ² = 10,000 (σ = 100) spread from roughly 200 to 800
              </p>
            </div>
          </div>
        )}

        {selectedParts.exponential && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              e^[-(x-μ)²/(2σ²)] - The Exponential Decay
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This creates the characteristic bell shape by decreasing exponentially as we move away from the mean.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Values 2 standard deviations from the mean have probability density about e^(-2) ≈ 0.135 times the peak
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold text-blue-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The normal distribution formula creates the perfect bell curve through:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• <strong>μ</strong> shifts the entire curve left or right (location parameter)</li>
            <li>• <strong>σ²</strong> makes the curve wider or narrower (scale parameter)</li>
            <li>• The <strong>exponential decay</strong> creates smooth, symmetric tails</li>
            <li>• The <strong>normalizing constant</strong> ensures total probability equals 1</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Adult Heights</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[f(70) = \\frac{1}{3\\sqrt{2\\pi}} e^{-\\frac{(70-69)^2}{2(3^2)}} = \\frac{1}{3\\sqrt{2\\pi}} e^{-\\frac{1}{18}} \\approx 0.129\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Probability density for someone being exactly 70 inches tall, given μ = 69 inches and σ = 3 inches.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                {key === 'pdfFunction' && 'PDF Function'}
                {key === 'normalizingConstant' && 'Normalizing'}
                {key === 'meanParameter' && 'Mean Parameter'}
                {key === 'varianceParameter' && 'Variance Parameter'}
                {key === 'exponentialDecay' && 'Exponential Decay'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the normal distribution formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: μ controls location, σ² controls spread, and the exponential creates the bell shape.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

NormalDistributionBuilder.displayName = 'NormalDistributionBuilder';

export default NormalDistributionBuilder;