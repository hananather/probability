"use client";
import React, { useState } from 'react';
import { Check, Target, Ruler, BarChart3, Calculator } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const UniformDistributionBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    pdfFunction: false,
    cdfFunction: false,
    constant: false,
    interval: false,
    lowerBound: false,
    upperBound: false
  });
  
  const [understanding, setUnderstanding] = useState({
    uniformProbability: false,
    intervalLength: false,
    linearCDF: false,
    equalLikelihood: false
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
    <div ref={mathJaxRef} className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg p-6 border border-violet-700/50">
      <h3 className="text-xl font-bold text-violet-400 mb-6">
        Build the Uniform Distribution Formula Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand the flat, rectangular distribution
        </p>
        
        {/* Interactive PDF Formula Display */}
        <div className="mb-6">
          <p className="text-lg text-neutral-300 mb-2">Probability Density Function (PDF):</p>
          <div className="text-2xl md:text-3xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
            {/* f(x) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.uniformProbability ? 'text-green-400' : 
                selectedParts.pdfFunction ? 'text-violet-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('pdfFunction', 'uniformProbability')}
            >
              f(x)
            </div>
            
            <span className="text-neutral-500">=</span>
            
            {/* 1/(b-a) */}
            <div className="inline-flex flex-col items-center">
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.equalLikelihood ? 'text-green-400' : 
                  selectedParts.constant ? 'text-cyan-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('constant', 'equalLikelihood')}
              >
                1
              </div>
              <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
              <div 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                  understanding.intervalLength ? 'text-green-400' : 
                  selectedParts.interval ? 'text-orange-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('interval', 'intervalLength')}
              >
                b - a
              </div>
            </div>
            
            <span className="text-neutral-500 text-lg">for a ≤ x ≤ b</span>
          </div>
        </div>

        {/* Interactive CDF Formula Display */}
        <div className="mb-6">
          <p className="text-lg text-neutral-300 mb-2">Cumulative Distribution Function (CDF):</p>
          <div className="text-xl md:text-2xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
            {/* F(x) */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-2 ${
                understanding.linearCDF ? 'text-green-400' : 
                selectedParts.cdfFunction ? 'text-blue-400' : 'text-neutral-400'
              }`}
              onClick={() => handlePartClick('cdfFunction', 'linearCDF')}
            >
              F(x)
            </div>
            
            <span className="text-neutral-500">=</span>
            
            {/* (x-a)/(b-a) */}
            <div className="inline-flex flex-col items-center">
              <div className="text-neutral-300">
                x - a
              </div>
              <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
              <div className="text-neutral-300">
                b - a
              </div>
            </div>
            
            <span className="text-neutral-500 text-lg">for a ≤ x ≤ b</span>
          </div>
        </div>

        {/* Key parameters explanation */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400 mb-3">Key parameters defining the interval:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {/* a - Lower bound */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-4 py-3 rounded-lg border ${
                selectedParts.lowerBound ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('lowerBound')}
            >
              <span className="text-xl font-mono">a</span>
              <p className="text-xs mt-1">Lower Bound</p>
              <p className="text-xs text-neutral-500">minimum value</p>
            </div>
            
            {/* b - Upper bound */}
            <div 
              className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 px-4 py-3 rounded-lg border ${
                selectedParts.upperBound ? 'text-pink-400 border-pink-500/30 bg-pink-900/20' : 'text-neutral-400 border-neutral-600'
              }`}
              onClick={() => handlePartClick('upperBound')}
            >
              <span className="text-xl font-mono">b</span>
              <p className="text-xs mt-1">Upper Bound</p>
              <p className="text-xs text-neutral-500">maximum value</p>
            </div>
          </div>
        </div>

        {/* Alternative representations */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Key properties:</p>
          <div className="text-sm font-mono text-neutral-300 space-y-1">
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[E[X] = \\frac{a + b}{2}, \\quad \\text{Var}(X) = \\frac{(b-a)^2}{12}\\]` 
            }} />
            <div dangerouslySetInnerHTML={{ 
              __html: `\\[P(c \\leq X \\leq d) = \\frac{d - c}{b - a} \\quad \\text{for } a \\leq c \\leq d \\leq b\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Mean is the midpoint, probability is proportional to interval length
          </p>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.pdfFunction && (
          <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-500/30">
            <h5 className="font-semibold text-violet-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              f(x) - The Probability Density Function
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The height of the rectangular distribution. It's constant across the entire interval [a, b] and zero elsewhere.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For a spinner from 0 to 10, f(x) = 1/10 = 0.1 for all values between 0 and 10
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
              A straight line rising from 0 to 1 across the interval. Shows the probability of getting a value ≤ x.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> For a spinner [0,10], F(7) = 7/10 = 0.7 means 70% chance of spinning 7 or less
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.constant && (
          <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
            <h5 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              1 - The Numerator (Constant Height)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This ensures that all values in the interval are equally likely - no value is more probable than any other.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Rolling a fair die: each number from 1 to 6 has equal probability
              </p>
            </div>
          </div>
        )}

        {selectedParts.interval && (
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
            <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              b - a - The Interval Length (Denominator)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The length of the interval. Longer intervals mean lower density (same total probability spread over more values).
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Uniform[0,10] has length 10, so f(x) = 1/10. Uniform[0,100] has length 100, so f(x) = 1/100
              </p>
            </div>
          </div>
        )}

        {selectedParts.lowerBound && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              a - The Lower Bound
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The smallest possible value. The distribution is zero for all x &lt; a.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Bus arrival time uniform from 8:00 AM to 8:10 AM, so a = 0 minutes (8:00)
              </p>
            </div>
          </div>
        )}

        {selectedParts.upperBound && (
          <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
            <h5 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              b - The Upper Bound
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The largest possible value. The distribution is zero for all x &gt; b.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> Bus arrival time uniform from 8:00 AM to 8:10 AM, so b = 10 minutes (8:10)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.pdfFunction && selectedParts.interval && (
        <div className="mt-6 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-4 border border-violet-500/30">
          <h5 className="font-semibold text-violet-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            The uniform distribution represents <strong>complete randomness</strong> within bounds:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• Every value in [a, b] is equally likely</li>
            <li>• The shape is a perfect rectangle - flat top, vertical edges</li>
            <li>• Total area under the curve = height × width = (1/(b-a)) × (b-a) = 1</li>
            <li>• CDF is a straight line from (a,0) to (b,1)</li>
          </ul>
        </div>
      )}

      {/* Rectangle visualization insight */}
      {understanding.uniformProbability && understanding.intervalLength && (
        <div className="mt-6 bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
          <h5 className="font-semibold text-indigo-400 mb-2">The Rectangle Rule</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Area} = \\text{height} \\times \\text{width} = \\frac{1}{b-a} \\times (b-a) = 1\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            The uniform distribution forms a rectangle where the height adjusts automatically to make the total area equal 1, ensuring it's a valid probability distribution. Wider intervals require shorter heights.
          </p>
        </div>
      )}

      {/* Concrete Example - Show after understanding all parts */}
      {allUnderstood && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <h5 className="font-semibold text-emerald-400 mb-2">Concrete Example: Random Number Generator</h5>
          <div className="text-center my-3">
            <span className="text-lg font-mono" dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{1}{100-0} = 0.01 \\quad \\text{for } 0 \\leq x \\leq 100\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            A random number generator producing values from 0 to 100. Every number has equal probability density of 0.01.
            P(25 ≤ X ≤ 75) = (75-25)/(100-0) = 50/100 = 0.5 = 50%.
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
                {key === 'uniformProbability' && 'Uniform Probability'}
                {key === 'intervalLength' && 'Interval Length'}
                {key === 'linearCDF' && 'Linear CDF'}
                {key === 'equalLikelihood' && 'Equal Likelihood'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand the uniform distribution!
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: Perfect for modeling situations where all outcomes in a range are equally likely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

UniformDistributionBuilder.displayName = 'UniformDistributionBuilder';

export default UniformDistributionBuilder;