"use client";
import React, { useState } from 'react';
import { Check, Target, Clock, TrendingDown, Zap, BarChart3 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const ExponentialDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    pdfFunction: false,
    cdfFunction: false,
    rateParameter: false,
    exponentialDecay: false,
    complement: false
  });
  
  const [understanding, setUnderstanding] = useState({
    memorylessProperty: false,
    waitingTime: false,
    survivalFunction: false,
    rateParameter: false
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
        Build the Exponential Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand the distribution of waiting times
        </p>
        
        {/* Interactive PDF Formula Display */}
        <div className="mb-6">
          <p className="text-lg text-neutral-300 mb-2">Probability Density Function (PDF):</p>
          <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
            {/* f(x) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.waitingTime ? 'text-green-400' : 
                selectedParts.pdfFunction ? 'text-orange-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('pdfFunction', 'waitingTime')}
            >
              f(x)
            </div>
            
            <span className="text-neutral-500">=</span>
            
            {/* λ */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.rateParameter ? 'text-green-400' : 
                selectedParts.rateParameter ? 'text-cyan-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('rateParameter', 'rateParameter')}
            >
              λ
            </div>
            
            {/* e^(-λx) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                selectedParts.exponentialDecay ? 'text-purple-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('exponentialDecay')}
            >
              <span dangerouslySetInnerHTML={{ 
                __html: `\\(e^{-\\lambda x}\\)` 
              }} />
            </div>
          </div>
        </div>

        {/* Interactive CDF Formula Display */}
        <div className="mb-6">
          <p className="text-lg text-neutral-300 mb-2">Cumulative Distribution Function (CDF):</p>
          <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
            {/* F(x) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                selectedParts.cdfFunction ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('cdfFunction')}
            >
              F(x)
            </div>
            
            <span className="text-neutral-500">=</span>
            
            {/* 1 - */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.survivalFunction ? 'text-green-400' : 
                selectedParts.complement ? 'text-yellow-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('complement', 'survivalFunction')}
            >
              1 -
            </div>
            
            {/* e^(-λx) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                selectedParts.exponentialDecay ? 'text-purple-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('exponentialDecay')}
            >
              <span dangerouslySetInnerHTML={{ 
                __html: `\\(e^{-\\lambda x}\\)` 
              }} />
            </div>
          </div>
        </div>

        {/* Key parameter explanation */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400 mb-3">Key parameter:</p>
          <div className="flex justify-center">
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-4 py-3 rounded-lg border ${
                understanding.rateParameter ? 'text-green-400 border-green-500/30 bg-green-900/20' : 
                selectedParts.rateParameter ? 'text-cyan-400 border-cyan-500/30 bg-cyan-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('rateParameter', 'rateParameter')}
            >
              <span className="text-xl font-mono">λ</span>
              <p className="text-xs mt-1">Rate Parameter</p>
              <p className="text-xs text-neutral-500">events per unit time</p>
            </div>
          </div>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Key properties:</p>
          <div className="text-sm font-mono text-neutral-300 space-y-1">
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[E[X] = \\frac{1}{\\lambda}, \\quad \\text{Var}(X) = \\frac{1}{\\lambda^2}\\]` 
            }} />
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[P(X > t) = e^{-\\lambda t} \\quad \\text{(Survival function)}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Mean and variance both depend on 1/λ
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.pdfFunction && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              f(x) - The Probability Density Function
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Gives the relative likelihood of waiting exactly x time units for the next event to occur.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> f(5) for customer arrivals tells us the relative probability of waiting exactly 5 minutes for the next customer
              </p>
            </div>
          </div>
        )}

        {selectedParts.cdfFunction && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              F(x) - The Cumulative Distribution Function
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Gives the probability that the waiting time is less than or equal to x time units.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> F(10) = 0.63 means there's a 63% chance of waiting 10 minutes or less for the next customer
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.rateParameter && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              λ - The Rate Parameter
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The average number of events per time unit. Higher λ means events happen more frequently, so waiting times are shorter.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> λ = 0.5 customers/minute means on average, a customer arrives every 2 minutes
              </p>
            </div>
          </div>
        )}

        {selectedParts.exponentialDecay && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              e^(-λx) - The Exponential Decay
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Creates the characteristic exponential shape - highest probability at x=0, decreasing rapidly as time increases.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Short waiting times are most likely, very long waiting times are increasingly rare
              </p>
            </div>
          </div>
        )}

        {selectedParts.complement && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              1 - e^(-λx) - The Complement (Survival Function)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The CDF uses 1 minus the survival function. The survival function e^(-λx) gives the probability of waiting MORE than x time units.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(wait &gt; 5 min) = e^(-0.5×5) = e^(-2.5) ≈ 0.082 = 8.2%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.pdfFunction && selectedParts.cdfFunction && (
        <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
          <h5 className="font-semibold text-orange-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The exponential distribution is the <strong>memoryless distribution</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Perfect for modeling waiting times between independent events</li>
            <li>• The longer you've waited doesn't affect how much longer you'll wait</li>
            <li>• λ is the rate: higher λ = more frequent events = shorter waits</li>
            <li>• Only defined for x ≥ 0 (can't have negative waiting times)</li>
          </ul>
        </div>
      )}

      {/* Memoryless Property */}
      {understanding.waitingTime && understanding.rateParameter && (
        <div className="mt-6 bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">The Memoryless Property</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[P(X > s + t \\mid X > s) = P(X > t)\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Given that you've already waited s time units, the probability of waiting at least t more units is the same as the original probability of waiting at least t units. The distribution "forgets" how long you've already waited.
          </p>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Customer Service Calls</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[f(3) = 0.2 \\cdot e^{-0.2 \\cdot 3} = 0.2 \\cdot e^{-0.6} \\approx 0.2 \\cdot 0.549 = 0.110\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            With λ = 0.2 calls/minute, the probability density of waiting exactly 3 minutes for the next call is about 0.110.
            The probability of waiting 3 minutes or less is F(3) = 1 - e^(-0.6) ≈ 0.451 = 45.1%.
          </p>
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
                {key === 'memorylessProperty' && 'Memoryless Property'}
                {key === 'waitingTime' && 'Waiting Time Model'}
                {key === 'survivalFunction' && 'Survival Function'}
                {key === 'rateParameter' && 'Rate Parameter'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the exponential distribution!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Perfect for modeling waiting times with the memoryless property.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ExponentialDistributionBuilder.displayName = 'ExponentialDistributionBuilder';

export default ExponentialDistributionBuilder;