"use client";
import React, { useState } from 'react';
import { Check, Info, Lightbulb, AlertCircle } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const BayesTheoremBuilder = React.memo(() => {
  const [selectedParts, setSelectedParts] = useState({
    posterior: false,
    likelihood: false,
    prior: false,
    evidence: false,
    numerator: false,
    denominator: false
  });
  
  const [understanding, setUnderstanding] = useState({
    posterior: false,
    likelihood: false,
    prior: false,
    evidence: false
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
        Build Bayes' Theorem Step by Step
      </h3>
      
      <div className="text-center mb-8">
        <p className="text-neutral-300 mb-6">
          Click on each part to understand how Bayes' Theorem updates beliefs with evidence
        </p>
        
        {/* Interactive Formula Display */}
        <div className="text-3xl md:text-4xl font-mono inline-flex items-center gap-2 flex-wrap justify-center">
          {/* P(H|D) = */}
          <span
            className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
              understanding.posterior ? 'text-green-400' : 
              selectedParts.posterior ? 'text-blue-400' : 'text-neutral-400'
            }`}
            onClick={() => handlePartClick('posterior', 'posterior')}
          >
            P(H|D)
          </span>
          
          <span className="text-neutral-500">=</span>
          
          {/* Fraction */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator: P(D|H) × P(H) */}
            <div className="flex items-center gap-1">
              <span 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                  understanding.likelihood ? 'text-green-400' : 
                  selectedParts.likelihood ? 'text-yellow-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('likelihood', 'likelihood')}
              >
                P(D|H)
              </span>
              
              <span className="text-neutral-400">×</span>
              
              <span 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                  understanding.prior ? 'text-green-400' : 
                  selectedParts.prior ? 'text-purple-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('prior', 'prior')}
              >
                P(H)
              </span>
            </div>
            
            {/* Fraction bar */}
            <div className="w-full h-0.5 bg-neutral-500 my-1"></div>
            
            {/* Denominator: P(D) */}
            <div>
              <span 
                className={`cursor-pointer transition-all hover:scale-110 hover:text-white active:scale-90 ${
                  understanding.evidence ? 'text-green-400' : 
                  selectedParts.evidence ? 'text-teal-400' : 'text-neutral-400'
                }`}
                onClick={() => handlePartClick('evidence', 'evidence')}
              >
                P(D)
              </span>
            </div>
          </div>
        </div>

        {/* Alternative: Expanded Form */}
        <div className="mt-6 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">Expanded form (for binary hypotheses):</p>
          <div className="text-lg font-mono text-neutral-300">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}\\]` 
            }} />
          </div>
        </div>
      </div>
      
      {/* Explanations for each part */}
      <div className="space-y-4">
        {selectedParts.posterior && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              P(H|D) - The Posterior
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              This is what we want to find: the probability of our hypothesis H being true, 
              AFTER we've observed the data D. It's our "updated belief."
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Disease | Positive Test) - The probability you have the disease 
                given that you tested positive.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.likelihood && (
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              P(D|H) - The Likelihood
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              How likely would we be to observe this data D if our hypothesis H were true? 
              This is often given as test accuracy or sensor reliability.
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Positive Test | Disease) - The test's sensitivity or true positive rate. 
                If the test is 95% accurate, this would be 0.95.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.prior && (
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              P(H) - The Prior
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              Our initial belief about the hypothesis BEFORE seeing any data. 
              This is crucial - rare conditions remain rare even with positive tests!
            </p>
            <div className="bg-neutral-800/50 p-2 rounded mt-2">
              <p className="text-xs text-neutral-400">
                <strong>Example:</strong> P(Disease) - The base rate or prevalence of the disease in the population. 
                If 1% of people have it, P(H) = 0.01.
              </p>
            </div>
          </div>
        )}
        
        {selectedParts.evidence && (
          <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-500/30">
            <h5 className="font-semibold text-teal-400 mb-2">
              P(D) - The Evidence (Normalizing Constant)
            </h5>
            <p className="text-sm text-neutral-300 mb-2">
              The total probability of observing this data, considering all possible hypotheses. 
              This ensures our posterior probabilities sum to 1.
            </p>
            <div className="mt-3 text-center">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[P(D) = P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)\\]` 
              }} />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              This denominator accounts for both true positives AND false positives.
            </p>
          </div>
        )}
      </div>

      {/* The Key Insight */}
      {selectedParts.likelihood && selectedParts.prior && (
        <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold text-pink-400 mb-2">🔑 The Key Insight</h5>
          <p className="text-sm text-neutral-300">
            Bayes' Theorem is fundamentally about <strong>reversing conditional probabilities</strong>:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• We know P(Data|Hypothesis) - how tests behave</li>
            <li>• We want P(Hypothesis|Data) - what the test result means</li>
            <li>• The prior P(H) acts as a "reality check" on our inference</li>
          </ul>
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
                {key === 'posterior' && 'Posterior P(H|D)'}
                {key === 'likelihood' && 'Likelihood P(D|H)'}
                {key === 'prior' && 'Prior P(H)'}
                {key === 'evidence' && 'Evidence P(D)'}
              </p>
              {understood && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
            </div>
          ))}
        </div>
        
        {allUnderstood && (
          <div className="mt-4 text-center">
            <p className="text-green-400 font-medium">
              Excellent! You understand all components of Bayes' Theorem! 🎉
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Remember: It's all about updating prior beliefs with new evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

BayesTheoremBuilder.displayName = 'BayesTheoremBuilder';

export default BayesTheoremBuilder;