"use client";
import React, { useState } from 'react';
import { Check, Target, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const CentralLimitTheoremBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    sampleMean: false,
    normalDistribution: false,
    populationMean: false,
    sampleVariance: false
  });
  
  const [understanding, setUnderstanding] = useState({
    sampleMeanConcept: false,
    normalDistributionConcept: false,
    populationMeanConcept: false,
    sampleVarianceConcept: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 rounded-lg p-6 border border-purple-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Build the Central Limit Theorem Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how sample means are distributed
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* X̄ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.sampleMeanConcept ? 'text-green-400' : 
              selectedParts.sampleMean ? 'text-purple-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('sampleMean', 'sampleMeanConcept')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `\\bar{X}` 
            }} />
          </div>
          
          <span className="text-neutral-500">~</span>
          
          {/* N(...) */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.normalDistributionConcept ? 'text-green-400' : 
              selectedParts.normalDistribution ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('normalDistribution', 'normalDistributionConcept')}
          >
            N(
          </div>
          
          {/* μ */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.populationMeanConcept ? 'text-green-400' : 
              selectedParts.populationMean ? 'text-yellow-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('populationMean', 'populationMeanConcept')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `\\mu` 
            }} />
          </div>
          
          <span className="text-neutral-500">,</span>
          
          {/* σ²/n */}
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.sampleVarianceConcept ? 'text-green-400' : 
              selectedParts.sampleVariance ? 'text-orange-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('sampleVariance', 'sampleVarianceConcept')}
          >
            <span dangerouslySetInnerHTML={{ 
              __html: `\\frac{\\sigma^2}{n}` 
            }} />
          </div>
          
          <div 
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
              understanding.normalDistributionConcept ? 'text-green-400' : 
              selectedParts.normalDistribution ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('normalDistribution', 'normalDistributionConcept')}
          >
            )
          </div>
        </div>

        {/* Alternative representation */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Alternative notation showing standard error:</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad \\text{or} \\quad \\bar{X} \\sim N\\left(\\mu, \\left(\\frac{\\sigma}{\\sqrt{n}}\\right)^2\\right)\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Standard error: σ/√n decreases as sample size n increases
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.sampleMean && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              X̄ - The Sample Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The average of all values in a sample drawn from the population. Each sample will have its own mean.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> From a population of exam scores, one sample of 25 students might have X̄ = 78.2
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.normalDistribution && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              N(...) - Normal Distribution
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The Central Limit Theorem states that sample means follow a normal distribution, regardless of the original population distribution.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Even if individual exam scores are skewed, the distribution of sample means will be bell-shaped
              </p>
            </div>
          </div>
        )}

        {selectedParts.populationMean && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              μ - Population Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The true mean of the entire population. Sample means center around this value on average.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If the true population mean exam score is μ = 75, sample means will average around 75
              </p>
            </div>
          </div>
        )}

        {selectedParts.sampleVariance && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              σ²/n - Variance of Sample Mean
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The variance of sample means decreases as sample size n increases. This is why larger samples give more precise estimates.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> If σ² = 100, samples of size n = 25 have variance 100/25 = 4, so standard error = 2
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {Object.values(selectedParts).every(Boolean) && (
        <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-purple-400 mb-2">🔑 Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The Central Limit Theorem shows us that as sample size increases:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Sample means become <strong>normally distributed</strong> (regardless of population shape)</li>
            <li>• Sample means center around the <strong>true population mean μ</strong></li>
            <li>• Variability of sample means <strong>decreases by factor of n</strong></li>
            <li>• Standard error σ/√n gets smaller, making estimates more precise</li>
          </ul>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Manufacturing Quality</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{X} \\sim N\\left(50, \\frac{4^2}{36}\\right) = N(50, 0.44)\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            If parts have mean length μ = 50mm and σ = 4mm, samples of 36 parts will have means distributed 
            around 50mm with standard error = 4/√36 = 0.67mm.
          </p>
        </div>
      )}
      
      {/* Understanding Progress */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h5 className="font-semibold text-white mb-3">Your Understanding</h5>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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
                {key === 'sampleMeanConcept' && 'Sample Mean'}
                {key === 'normalDistributionConcept' && 'Normal Distribution'}
                {key === 'populationMeanConcept' && 'Population Mean'}
                {key === 'sampleVarianceConcept' && 'Sample Variance'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the Central Limit Theorem formula!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Larger samples mean more normal distributions and smaller standard errors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

CentralLimitTheoremBuilder.displayName = 'CentralLimitTheoremBuilder';

export default CentralLimitTheoremBuilder;