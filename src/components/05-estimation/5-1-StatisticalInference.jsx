"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { QuizBreak } from '../mdx/QuizBreak';
import { Chapter5ReferenceSheet } from '../reference-sheets/Chapter5ReferenceSheet';
import { 
  Brain, Target, Activity, BarChart, RefreshCw, 
  TrendingUp, Users, Dice6, Package, Vote, ChevronRight,
  Play, Pause, RotateCcw, CheckCircle
} from 'lucide-react';

// Use probability color scheme for consistency with Chapter 2
const chapterColors = createColorScheme('probability');

// Learning modes
const LEARNING_MODES = {
  FOUNDATIONS: 'foundations',
  EXPLORATION: 'exploration',
  PRACTICE: 'practice'
};

// Mode colors
const MODE_COLORS = {
  [LEARNING_MODES.FOUNDATIONS]: '#3b82f6', // blue
  [LEARNING_MODES.EXPLORATION]: '#10b981', // emerald
  [LEARNING_MODES.PRACTICE]: '#8b5cf6' // purple
};

// Learning Path Navigation Component
const LearningPathNavigation = React.memo(function LearningPathNavigation({ mode, onModeChange }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [mode]);
  
  return (
    <div className="mb-8">
      <VisualizationSection className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Learning Path</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(LEARNING_MODES).map(([key, value]) => {
            const isActive = mode === value;
            const color = MODE_COLORS[value];
            
            return (
              <button
                key={key}
                onClick={() => onModeChange(value)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'bg-gradient-to-br border-opacity-100' 
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
                style={isActive ? { borderColor: color, background: `linear-gradient(to bottom right, ${color}20, ${color}10)` } : {}}
              >
                {isActive && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4" style={{ color }} />
                )}
                
                <h3 className="font-semibold text-lg mb-1" style={{ color: isActive ? color : '#fff' }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-gray-400">
                  {value === LEARNING_MODES.FOUNDATIONS && "Core concepts and theory"}
                  {value === LEARNING_MODES.EXPLORATION && "Interactive demonstrations"}
                  {value === LEARNING_MODES.PRACTICE && "Apply your knowledge"}
                </p>
              </button>
            );
          })}
        </div>
        
        <div ref={contentRef} className="text-center">
          <p className="text-gray-300 text-sm">
            Choose your learning path to explore statistical inference concepts
          </p>
        </div>
      </VisualizationSection>
    </div>
  );
});

// Add Bayesian Inference Introduction Component
const BayesianInferenceIntro = React.memo(function BayesianInferenceIntro({ isActive }) {
  if (!isActive) return null;
  
  const contentRef = useRef(null);
  const [priorBelief, setPriorBelief] = useState(0.5);
  const [evidence, setEvidence] = useState({ heads: 0, tails: 0 });
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [priorBelief, evidence]);
  
  // Calculate posterior using Beta-Binomial model
  const alpha = priorBelief * 10 + evidence.heads + 1;
  const beta = (1 - priorBelief) * 10 + evidence.tails + 1;
  const posterior = alpha / (alpha + beta);
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Bayesian Inference: Updating Beliefs with Data
      </h3>
      
      <div ref={contentRef} className="space-y-4">
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-3">The Bayesian Approach</h4>
          <p className="text-sm text-neutral-300 mb-3">
            While classical (frequentist) inference treats parameters as fixed but unknown constants, 
            Bayesian inference treats them as random variables with probability distributions. This allows 
            us to incorporate prior knowledge and update our beliefs as we collect data.
          </p>
          <div className="text-center p-3 bg-neutral-800 rounded">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Posterior} \\propto \\text{Likelihood} \\times \\text{Prior}\\]` 
            }} />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="font-semibold text-purple-400 mb-3">Interactive Coin Bias Example</h5>
            <p className="text-sm text-neutral-300 mb-3">
              Is this coin fair? Start with your prior belief and update it with evidence:
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-neutral-300">Prior belief (probability of heads): {priorBelief.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={priorBelief}
                  onChange={(e) => setPriorBelief(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEvidence({...evidence, heads: evidence.heads + 1})}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                >
                  Flip: Heads
                </button>
                <button
                  onClick={() => setEvidence({...evidence, tails: evidence.tails + 1})}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                >
                  Flip: Tails
                </button>
              </div>
              
              <div className="text-sm text-neutral-400">
                Evidence: {evidence.heads} heads, {evidence.tails} tails
              </div>
              
              <button
                onClick={() => setEvidence({ heads: 0, tails: 0 })}
                className="text-sm text-neutral-400 hover:text-neutral-300"
              >
                Reset Evidence
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="font-semibold text-purple-400 mb-3">Belief Evolution</h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Prior:</span>
                <span className="font-mono text-neutral-300">{priorBelief.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Posterior:</span>
                <span className="font-mono text-purple-400">{posterior.toFixed(3)}</span>
              </div>
              <div className="h-px bg-neutral-700" />
              <p className="text-xs text-neutral-400">
                {evidence.heads + evidence.tails === 0 
                  ? "Start flipping to see how evidence updates your belief!"
                  : `After ${evidence.heads + evidence.tails} flips, your belief has ${Math.abs(posterior - priorBelief) > 0.1 ? 'significantly' : 'slightly'} changed.`
                }
              </p>
              
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-xs text-neutral-400 mb-2">Mathematical Update:</p>
                <div className="text-xs" dangerouslySetInnerHTML={{ 
                  __html: `\\[p(\\theta|data) \\propto \\theta^{${evidence.heads}}(1-\\theta)^{${evidence.tails}} \\times Beta(${(priorBelief * 10).toFixed(1)}, ${((1-priorBelief) * 10).toFixed(1)})\\]` 
                }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-700/50">
          <h5 className="font-semibold text-purple-400 mb-2">Key Differences: Bayesian vs. Frequentist</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-indigo-400 mb-1">Frequentist Approach:</p>
              <ul className="text-neutral-300 space-y-1">
                <li>• Parameters are fixed constants</li>
                <li>• Probability = long-run frequency</li>
                <li>• Confidence intervals</li>
                <li>• No prior information used</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-purple-400 mb-1">Bayesian Approach:</p>
              <ul className="text-neutral-300 space-y-1">
                <li>• Parameters have distributions</li>
                <li>• Probability = degree of belief</li>
                <li>• Credible intervals</li>
                <li>• Prior knowledge incorporated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Introduction Component
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  const [selectedExample, setSelectedExample] = useState('manufacturing');
  
  // Example details from course material
  const manufacturingDetails = {
    parameter: 'Mean defect rate',
    notation: <span dangerouslySetInnerHTML={{ __html: '\\(\\mu\\)' }} />,
    sample: 'n = 100 products',
    estimate: <><span dangerouslySetInnerHTML={{ __html: '\\(\\bar{x}\\)' }} /> = sample mean</>,
    question: 'Is the production process meeting quality standards?'
  };
  
  const electionDetails = {
    parameter: 'True proportion of support',
    notation: 'p',
    sample: 'n = 1000 voters',
    estimate: 'p̂ = sample proportion',
    question: 'What percentage of the population supports each candidate?'
  };
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedExample]);
  
  const ExampleCard = ({ icon: Icon, title, description, details, isSelected, onSelect }) => (
    <div
      className={`p-4 rounded-lg border cursor-pointer ${
        isSelected 
          ? 'bg-blue-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-neutral-400'}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-400 mb-1">{title}</h4>
          <p className="text-sm text-neutral-300">{description}</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Primary Definition */}
      <div 
        className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20"
      >
        <h3 className="text-xl font-bold text-blue-400 mb-4">
          The Fundamental Challenge of Statistical Inference
        </h3>
        <div className="space-y-4">
          <p className="text-base text-neutral-200 leading-relaxed">
            Statistical inference is the art and science of drawing conclusions about a
            <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              population
            </span>
            based on information from a
            <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              random sample
            </span>
            from that population.
          </p>
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-sm text-neutral-300 mb-3">
              <span className="text-blue-400 font-semibold">The Central Question:</span> How can we use limited data (what we observe) 
              to make reliable statements about the entire population (what we want to know)?
            </p>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">What We Want</p>
                <p className="font-semibold text-blue-400">Parameters</p>
                <p className="text-xs mt-1">True population values</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-neutral-400">→</span>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">What We Have</p>
                <p className="font-semibold text-purple-400">Statistics</p>
                <p className="text-xs mt-1">Sample-based estimates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Examples Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <ExampleCard
          icon={Package}
          title="Manufacturing Reliability"
          description="Can we assess the reliability of a product's manufacturing process by randomly selecting a sample?"
          details={manufacturingDetails}
          isSelected={selectedExample === 'manufacturing'}
          onSelect={() => setSelectedExample(selectedExample === 'manufacturing' ? null : 'manufacturing')}
        />
        <ExampleCard
          icon={Vote}
          title="Election Polling"
          description="Can we determine who will win an election by polling a small sample of respondents?"
          details={electionDetails}
          isSelected={selectedExample === 'election'}
          onSelect={() => setSelectedExample(selectedExample === 'election' ? null : 'election')}
        />
      </div>
      
      {/* Mathematical Framework */}
        {selectedExample && (
          <div
            className="bg-neutral-800/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-blue-400">Mathematical Framework</h4>
              <span className="text-xs text-blue-400">
                {selectedExample === 'manufacturing' ? 'Manufacturing Example' : 'Election Example'}
              </span>
            </div>
            
            {/* Example-specific details */}
            <div className="bg-neutral-900/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-neutral-300">
                <span className="text-neutral-400">Research Question:</span> 
                <span className="ml-2">
                  {selectedExample === 'manufacturing' 
                    ? manufacturingDetails.question 
                    : electionDetails.question}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Parameter:</span>
                  <span className="ml-2 text-neutral-200">
                    {selectedExample === 'manufacturing' 
                      ? manufacturingDetails.parameter 
                      : electionDetails.parameter}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Sample Size:</span>
                  <span className="ml-2 text-neutral-200">
                    {selectedExample === 'manufacturing' 
                      ? manufacturingDetails.sample 
                      : electionDetails.sample}
                  </span>
                </div>
              </div>
            </div>
            
            {/* General framework */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Population Parameter</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(\\mu\\)' 
                    : '\\(p\\)' 
                }} />
                <p className="text-xs mt-1">Unknown true value</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Point Estimate</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(\\bar{X}\\)' 
                    : '\\(\\hat{p}\\)' 
                }} />
                <p className="text-xs mt-1">Sample statistic</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Standard Error</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(SE(\\bar{X})\\)' 
                    : '\\(SE(\\hat{p})\\)' 
                }} />
                <p className="text-xs mt-1">Uncertainty measure</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-neutral-400">
                Statistical inference allows us to make probabilistic statements about the 
                {selectedExample === 'manufacturing' ? ' true mean defect rate' : ' true proportion'} 
                based on our sample data.
              </p>
            </div>
          </div>
        )}
    </div>
  );
});

// Properties of Estimators Component
const EstimatorProperties = React.memo(function EstimatorProperties() {
  const contentRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState('unbiased');
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProperty]);
  
  const properties = {
    unbiased: {
      name: 'Unbiasedness',
      definition: 'An estimator is unbiased if its expected value equals the true parameter value.',
      formula: `E[\\hat{\\theta}] = \\theta`,
      example: 'Sample mean is an unbiased estimator of population mean',
      visual: 'Center of sampling distribution matches true value'
    },
    consistent: {
      name: 'Consistency',
      definition: 'An estimator is consistent if it converges to the true parameter as sample size increases.',
      formula: `\\lim_{n \\to \\infty} P(|\\hat{\\theta}_n - \\theta| < \\epsilon) = 1`,
      example: 'Sample variance (with n-1) is consistent for population variance',
      visual: 'Sampling distribution narrows around true value as n increases'
    },
    efficient: {
      name: 'Efficiency',
      definition: 'An estimator is efficient if it has the smallest variance among all unbiased estimators.',
      formula: `Var(\\hat{\\theta}) \\geq \\frac{1}{nI(\\theta)}`,
      example: 'Sample mean is the most efficient estimator of normal distribution mean',
      visual: 'Narrowest possible sampling distribution'
    },
    sufficient: {
      name: 'Sufficiency',
      definition: 'An estimator is sufficient if it captures all information about the parameter in the sample.',
      formula: `P(X|T(X)=t, \\theta) = P(X|T(X)=t)`,
      example: 'Sum of observations is sufficient for Poisson rate parameter',
      visual: 'No information loss when reducing data to statistic'
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Desirable Properties of Estimators
      </h3>
      
      {/* Advanced Topic Warning */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <span className="text-yellow-500 text-lg">📚</span>
          <div>
            <span className="text-yellow-500 font-semibold text-sm">Advanced Topic</span>
            <p className="text-xs text-yellow-400/80 mt-1">
              This section covers advanced theoretical concepts. While important for deeper understanding,
              you may skip this section if you're focusing on practical applications.
            </p>
          </div>
        </div>
      </div>
      
      <div ref={contentRef} className="space-y-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <p className="text-sm text-neutral-300">
            Not all estimators are created equal! Good estimators should possess certain mathematical 
            properties that ensure they provide reliable and accurate estimates. Let's explore the 
            four most important properties:
          </p>
        </div>
        
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(properties).map(([key, prop]) => (
            <button
              key={key}
              onClick={() => setSelectedProperty(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedProperty === key
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {prop.name}
            </button>
          ))}
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
          <h4 className="font-semibold text-blue-400 mb-3">
            {properties[selectedProperty].name}
          </h4>
          
          <div className="space-y-4">
            <p className="text-neutral-300">
              {properties[selectedProperty].definition}
            </p>
            
            <div className="bg-neutral-800 rounded p-3 text-center">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[${properties[selectedProperty].formula}\\]` 
              }} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
                <p className="text-sm font-semibold text-blue-400 mb-1">Example:</p>
                <p className="text-sm text-neutral-300">
                  {properties[selectedProperty].example}
                </p>
              </div>
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50">
                <p className="text-sm font-semibold text-purple-400 mb-1">Visual Interpretation:</p>
                <p className="text-sm text-neutral-300">
                  {properties[selectedProperty].visual}
                </p>
              </div>
            </div>
            
            {selectedProperty === 'unbiased' && (
              <div className="mt-3">
                <p className="text-sm text-amber-400 flex items-start gap-2">
                  <span className="text-amber-500">💡</span>
                  <span><strong>Note:</strong> Unbiasedness alone doesn't guarantee a good estimator. A broken clock 
                  that randomly shows times is unbiased for the true time on average, but it's 
                  not useful!</span>
                </p>
              </div>
            )}
            
            {selectedProperty === 'efficient' && (
              <div className="bg-teal-900/20 rounded-lg p-3 border border-teal-700/50">
                <p className="text-sm text-teal-400">
                  The Cramér-Rao Lower Bound sets the theoretical limit on how efficient 
                  an unbiased estimator can be. Estimators achieving this bound are called 
                  "minimum variance unbiased estimators" (MVUE).
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-4 border border-indigo-700/50">
          <h5 className="font-semibold text-indigo-400 mb-2">The Trade-offs</h5>
          <p className="text-sm text-neutral-300">
            In practice, we often face trade-offs between these properties. For example, a biased 
            estimator might have lower overall error (MSE) than an unbiased one if it has much 
            smaller variance. The key is choosing estimators that balance these properties 
            appropriately for your specific application.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Mathematical Foundations Component
const MathematicalFoundations = React.memo(function MathematicalFoundations() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Mathematical Foundations
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Point Estimation */}
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Point Estimation</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                A point estimate <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{\\theta}\\)` }} /> 
                is a single value used to estimate an unknown population parameter 
                <span dangerouslySetInnerHTML={{ __html: ` \\(\\theta\\)` }} />. It's our "best guess" 
                based on the available sample data.
              </p>
              <div className="text-center p-3 bg-neutral-800 rounded">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\hat{\\theta} = g(X_1, X_2, ..., X_n)\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                where g is a function that combines the sample observations into a single estimate
              </p>
            </div>
            
            <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
              <h5 className="font-semibold text-amber-400 mb-2">Common Point Estimation Methods</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-amber-400">1. Method of Moments (MoM)</p>
                  <p className="text-neutral-300 mt-1">
                    Set sample moments equal to population moments and solve for parameters. 
                    Simple but not always efficient.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Example: For normal distribution, x̄ estimates μ and s² estimates σ²
                  </p>
                </div>
                <div>
                  <p className="font-medium text-amber-400">2. Maximum Likelihood Estimation (MLE)</p>
                  <p className="text-neutral-300 mt-1">
                    Find parameter values that maximize the probability of observing the data. 
                    Often more efficient than MoM.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Example: MLE for exponential rate λ is 1/x̄
                  </p>
                </div>
                <div>
                  <p className="font-medium text-amber-400">3. Bayesian Estimation</p>
                  <p className="text-neutral-300 mt-1">
                    Combine prior knowledge with data using Bayes' theorem. Provides full 
                    posterior distribution, not just point estimate.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Example: Posterior mean or mode as point estimate
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
                <p className="text-sm font-semibold text-blue-400 mb-1">Population Mean</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = E[X]\\)` }} />
              </div>
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50">
                <p className="text-sm font-semibold text-purple-400 mb-1">Sample Mean</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i\\)` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sampling Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Sampling Distribution</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                The sampling distribution is the probability distribution of a statistic 
                over all possible samples of size n from the population.
              </p>
              <div className="text-center p-3 bg-neutral-800 rounded">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` 
                }} />
              </div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
              <p className="text-sm font-semibold text-blue-400 mb-2">Key Properties:</p>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(E[\\bar{X}] = \\mu\\)` }} /> (unbiased)</li>
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}\\)` }} /></li>
                <li>• As n increases, variance decreases</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Standard Error */}
        <div>
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Standard Error</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-purple-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                The standard error (SE) is the standard deviation of the sampling distribution 
                of a statistic.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="text-center p-3 bg-neutral-800 rounded">
                  <p className="text-xs text-neutral-400 mb-1">σ known</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[SE(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
                <div className="text-center p-3 bg-neutral-800 rounded">
                  <p className="text-xs text-neutral-400 mb-1">σ unknown</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}\\]` 
                  }} />
                </div>
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
              <p className="text-sm font-semibold text-purple-400 mb-2">Interpretation:</p>
              <p className="text-sm text-neutral-300">
                SE measures the average distance between the sample statistic and the 
                population parameter across all possible samples.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Interactive Insights Cards
const InteractiveInsights = React.memo(() => {
  const insights = [
    {
      id: 'population',
      title: 'Population',
      icon: Users,
      color: 'teal',
      shortDesc: 'The entire group we want to study',
      fullDesc: 'A population includes all members of a defined group. In practice, it\'s often impossible or impractical to study everyone.',
      example: 'All voters in a country, all products from a factory',
      formula: 'Population parameter: θ (theta)'
    },
    {
      id: 'sample',
      title: 'Random Sample',
      icon: Dice6,
      color: 'blue',
      shortDesc: 'A subset selected from the population',
      fullDesc: 'A random sample ensures each member of the population has an equal chance of being selected, reducing bias.',
      example: '1000 randomly selected voters, 50 randomly tested products',
      formula: 'Sample statistic: θ̂ (theta hat)'
    },
    {
      id: 'inference',
      title: 'Inference',
      icon: TrendingUp,
      color: 'purple',
      shortDesc: 'Drawing conclusions about the population',
      fullDesc: 'Statistical inference uses sample data to make probabilistic statements about population parameters.',
      example: 'Estimating election outcome, determining product quality',
      formula: 'P(θ̂ - θ < ε) = confidence level'
    }
  ];
  
  return (
    <div className="grid md:grid-cols-3 gap-4 my-6">
      {insights.map((insight, idx) => (
        <div
          key={insight.id}
          className="relative group"
        >
          <div
            className={`relative bg-neutral-800 rounded-xl p-4 border ${
              insight.color === 'teal' 
                ? 'border-neutral-700 hover:border-blue-500/60' 
                : insight.color === 'blue'
                  ? 'border-neutral-700 hover:border-blue-500/60'
                  : 'border-neutral-700 hover:border-purple-500/60'
            }`}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              insight.color === 'teal' 
                ? 'bg-blue-500/20' 
                : insight.color === 'blue'
                  ? 'bg-blue-500/20'
                  : 'bg-purple-500/20'
            }`}>
              <insight.icon className={`w-5 h-5 ${
                insight.color === 'teal' 
                  ? 'text-blue-400' 
                  : insight.color === 'blue'
                    ? 'text-blue-400'
                    : 'text-purple-400'
              }`} />
            </div>
            
            <h4 className={`font-bold mb-2 ${
              insight.color === 'teal' 
                ? 'text-blue-400' 
                : insight.color === 'blue'
                  ? 'text-blue-400'
                  : 'text-purple-400'
            }`}>
              {insight.title}
            </h4>
            
            <div className="space-y-2">
              <p className="text-sm text-neutral-300">{insight.fullDesc}</p>
              <p className="text-xs text-neutral-400 italic">Example: {insight.example}</p>
              <div className="mt-2 p-2 bg-neutral-900/50 rounded text-center">
                <span className={`text-xs font-mono ${
                  insight.color === 'teal' 
                    ? 'text-blue-400' 
                    : insight.color === 'blue'
                      ? 'text-blue-400'
                      : 'text-purple-400'
                }`}>
                  {insight.formula}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// Gear Wheel Factory Visualization - Updated with Gold Standard styling
const GearWheelFactory = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(30);
  const [isSampling, setIsSampling] = useState(false);
  const [samples, setSamples] = useState([]);
  const [allSampleMeans, setAllSampleMeans] = useState([]);
  const [currentMean, setCurrentMean] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // True population parameters (hidden from user)
  const TRUE_MU = 50;
  const TRUE_SIGMA = 2;
  
  const performSampling = async () => {
    if (isSampling) return;
    
    setIsSampling(true);
    const newSamples = [];
    
    // Generate samples
    for (let i = 0; i < sampleSize; i++) {
      const value = d3.randomNormal(TRUE_MU, TRUE_SIGMA)();
      newSamples.push(value);
    }
    
    const mean = d3.mean(newSamples);
    setCurrentMean(mean);
    setAllSampleMeans(prev => [...prev, mean]);
    setSamples(newSamples);
    setIsSampling(false);
  };
  
  
  // Initialize visualization when active
  useEffect(() => {
    if (!isActive) return;
    if (!svgRef.current) return;
    
    // Use a timeout to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const width = svgRef.current.clientWidth || 800;
      const height = 400;
      const margin = { top: 40, right: 40, bottom: 60, left: 60 };
      
      if (!hasInitialized && isActive) {
        setHasInitialized(true);
      }
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Always show axes and grid
    const xScale = d3.scaleLinear()
      .domain([45, 55])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, allSampleMeans.length > 0 ? d3.max(d3.histogram()
        .domain(xScale.domain())
        .thresholds(20)(allSampleMeans), d => d.length) : 10])
      .range([innerHeight, 0]);
    
    // Add gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.6);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 1);
    
    // Draw axes with gold standard styling
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Sample Mean Weight (grams)");
    
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Frequency");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    // True mean line with emphasis - always show
    g.append("line")
      .attr("x1", xScale(TRUE_MU))
      .attr("x2", xScale(TRUE_MU))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .style("filter", "drop-shadow(0 0 4px rgba(20, 184, 166, 0.5))");
    
    g.append("text")
      .attr("x", xScale(TRUE_MU) + 5)
      .attr("y", 15)
      .attr("fill", "#14b8a6")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("μ = 50g");
    
    // If no data yet, show a placeholder message and hint
    if (allSampleMeans.length === 0) {
      // Add a subtle background rect to indicate the active area
      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "url(#diagonal-stripes)")
        .attr("opacity", 0.05);
      
      // Add diagonal stripes pattern
      const pattern = defs.append("pattern")
        .attr("id", "diagonal-stripes")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 10)
        .attr("height", 10);
      
      pattern.append("path")
        .attr("d", "M0,10 L10,0")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 0.5);
      
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .style("font-size", "16px")
        .text("Histogram will appear here");
      
      // Add arrow pointing to button
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2 + 25)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .style("font-size", "14px")
        .text("↓ Start sampling below");
    } else {
      // Histogram of sample means
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(20)(allSampleMeans);
      
      g.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", "url(#bar-gradient)")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 0.5)
        .style("filter", "drop-shadow(0 0 2px rgba(16, 185, 129, 0.3))")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);
    }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(initTimeout);
  }, [allSampleMeans, isActive, hasInitialized]);
  
  if (!isActive) return null;
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5" />
        The Gear Wheel Factory
      </h3>
      <p className="text-sm text-neutral-300 mb-6">
        Explore how sample statistics estimate population parameters
      </p>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <p className="text-xs text-neutral-400 mb-1">Samples Taken</p>
          <p className="text-2xl font-mono text-teal-400">{allSampleMeans.length}</p>
        </div>
        {currentMean && (
          <>
            <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
              <p className="text-xs text-neutral-400 mb-1">Last Sample Mean</p>
              <p className="text-xl font-mono text-blue-400">{currentMean.toFixed(3)}g</p>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
              <p className="text-xs text-neutral-400 mb-1">Error from True μ</p>
              <p className="text-xl font-mono text-purple-400">
                {Math.abs(currentMean - TRUE_MU).toFixed(3)}g
              </p>
            </div>
          </>
        )}
      </div>
      
      <GraphContainer title="Sampling Distribution of Sample Means" className="!bg-transparent">
        <svg ref={svgRef} className="w-full" />
      </GraphContainer>
      
      <ControlGroup>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Sample Size (n): {sampleSize}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
              disabled={isSampling}
            />
            <p className="text-xs text-neutral-400">
              SE ∝ 1/√n (larger samples → smaller error)
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <button
              onClick={performSampling}
              disabled={isSampling}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2
                         ${isSampling 
                           ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed' 
                           : 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50 hover:bg-teal-700'
                         }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSampling ? 'animate-spin' : ''}`} />
              {isSampling ? 'Sampling...' : 'Draw New Sample'}
            </button>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
            <p className="text-xs text-neutral-400 mb-2">Sampling Distribution</p>
            {allSampleMeans.length > 1 && (
              <>
                <p className="text-sm">
                  Mean of means: <span className="font-mono text-teal-400">
                    {d3.mean(allSampleMeans).toFixed(3)}
                  </span>
                </p>
                <p className="text-sm">
                  SE of means: <span className="font-mono text-purple-400">
                    {d3.deviation(allSampleMeans).toFixed(3)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
        
        {allSampleMeans.length === 0 && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              Ready to explore! Click "Draw New Sample" to see how sample means distribute around the true population mean.
            </p>
          </div>
        )}
        {allSampleMeans.length > 0 && allSampleMeans.length < 10 && (
          <div className="mt-4 p-4 bg-gradient-to-br from-amber-900/20 to-amber-800/20 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              Keep drawing samples to see the pattern emerge! ({allSampleMeans.length} samples so far)
            </p>
          </div>
        )}
        {allSampleMeans.length >= 10 && (
          <div className="mt-4 p-4 bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg">
            <p className="text-sm text-teal-400">
              Notice how the sample means cluster around the true population mean!
            </p>
          </div>
        )}
      </ControlGroup>
    </VisualizationSection>
  );
});

// Central Limit Theorem Demonstration - Replacing confusing visualization
const CentralLimitTheoremDemo = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const [activeDistribution, setActiveDistribution] = useState('uniform');
  const [sampleSize, setSampleSize] = useState(5);
  const contentRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  const distributions = {
    uniform: {
      name: 'Uniform Distribution',
      color: '#3b82f6',
      generate: () => Math.random() * 10,
      description: 'Flat distribution: all values equally likely'
    },
    exponential: {
      name: 'Exponential Distribution',
      color: '#8b5cf6',
      generate: () => -Math.log(1 - Math.random()) * 3,
      description: 'Skewed distribution: many small values, few large'
    },
    bimodal: {
      name: 'Bimodal Distribution',
      color: '#ec4899',
      generate: () => Math.random() < 0.5 ? d3.randomNormal(2, 0.5)() : d3.randomNormal(7, 0.5)(),
      description: 'Two peaks: values cluster around two centers'
    }
  };
  
  useEffect(() => {
    if (!isActive) return;
    if (!svgRef.current) return;
    
    // Force initialization on first active render
    if (!isInitialized && isActive) {
      setIsInitialized(true);
    }
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth || 800; // Fallback width
    const height = 550;
    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
    
    // Create two panels with proper spacing using percentage-based layout
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const panelHeight = innerHeight * 0.40; // 40% for each panel
    const gapHeight = innerHeight * 0.20; // 20% gap between panels
    
    // Panel 1: Original Distribution
    const g1 = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Generate data for original distribution
    const originalData = Array.from({ length: 1000 }, () => distributions[activeDistribution].generate());
    
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);
    
    const bins1 = d3.histogram()
      .domain(xScale.domain())
      .thresholds(30)(originalData);
    
    const yScale1 = d3.scaleLinear()
      .domain([0, d3.max(bins1, d => d.length)])
      .range([panelHeight, 0]);
    
    // Add title
    g1.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Original Distribution");
    
    // Draw histogram
    g1.selectAll(".bar")
      .data(bins1)
      .join("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale1(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => panelHeight - yScale1(d.length))
      .attr("fill", distributions[activeDistribution].color)
      .attr("opacity", 0.8);
    
    // Add axes
    g1.append("g")
      .attr("transform", `translate(0,${panelHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("font-size", "10px")
      .style("color", "#9ca3af");
    
    // Panel 2: Sampling Distribution (removed middle panel showing single sample)
    const g2 = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + panelHeight + gapHeight})`);
    
    g2.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Sampling Distribution of Sample Means");
    
    // Generate many sample means
    const sampleMeans = Array.from({ length: 500 }, () => {
      const sample = Array.from({ length: sampleSize }, () => distributions[activeDistribution].generate());
      return d3.mean(sample);
    });
    
    const bins2 = d3.histogram()
      .domain([0, 10])
      .thresholds(30)(sampleMeans);
    
    const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(bins2, d => d.length)])
      .range([panelHeight, 0]);
    
    // Draw histogram with gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "mean-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", panelHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.6);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 1);
    
    g2.selectAll(".bar")
      .data(bins2)
      .join("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale2(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => panelHeight - yScale2(d.length))
      .attr("fill", "url(#mean-gradient)")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 0.5);
    
    // Add normal curve overlay
    const meanOfMeans = d3.mean(sampleMeans);
    const stdOfMeans = d3.deviation(sampleMeans);
    
    const normalCurve = d3.range(0, 10, 0.1).map(x => ({
      x,
      y: (1 / (stdOfMeans * Math.sqrt(2 * Math.PI))) * 
         Math.exp(-0.5 * Math.pow((x - meanOfMeans) / stdOfMeans, 2))
    }));
    
    const lineScale = d3.scaleLinear()
      .domain([0, d3.max(normalCurve, d => d.y)])
      .range([panelHeight, 0]);
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => lineScale(d.y))
      .curve(d3.curveBasis);
    
    g2.append("path")
      .datum(normalCurve)
      .attr("fill", "none")
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", line);
    
    g2.append("g")
      .attr("transform", `translate(0,${panelHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("font-size", "10px")
      .style("color", "#9ca3af");
    
    // Add grid lines
    [g1, g2].forEach(g => {
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(d3.scaleLinear().domain([0, 1]).range([panelHeight, 0]))
          .tickSize(-innerWidth)
          .tickFormat("")
          .ticks(3)
        )
        .style("stroke", "#374151")
        .style("stroke-dasharray", "2,2")
        .style("opacity", 0.3);
    });
    
  }, [activeDistribution, sampleSize, isActive, isInitialized]);
  
  // Don't render if not active
  if (!isActive) return null;
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Central Limit Theorem Demonstration
      </h3>
      
      <div ref={contentRef} className="mb-6 p-4 bg-gradient-to-br from-teal-900/20 to-teal-800/20 border border-teal-500/30 rounded-lg">
        <h4 className="font-semibold text-teal-400 mb-2">The Magic of the Central Limit Theorem</h4>
        <p className="text-sm text-neutral-300 mb-3">
          No matter what shape the original distribution has, the distribution of sample means 
          approaches a normal distribution as sample size increases!
        </p>
        <div className="text-center text-teal-400">
          <span dangerouslySetInnerHTML={{ __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` }} />
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Choose Original Distribution
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(distributions).map(([key, dist]) => (
              <button
                key={key}
                onClick={() => setActiveDistribution(key)}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeDistribution === key
                    ? `bg-${key === 'uniform' ? 'blue' : key === 'exponential' ? 'purple' : 'pink'}-600 text-white shadow-md ring-2 ring-${key === 'uniform' ? 'blue' : key === 'exponential' ? 'purple' : 'pink'}-500/50`
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                }`}
                style={activeDistribution === key ? {
                  backgroundColor: dist.color,
                  boxShadow: `0 4px 6px ${dist.color}33, 0 0 0 2px ${dist.color}88`
                } : {}}
              >
                {dist.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {distributions[activeDistribution].description}
          </p>
        </div>
        
        <div className="w-px bg-neutral-700"></div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Sample Size: {sampleSize}
          </label>
          <input
            type="range"
            min="2"
            max="50"
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            className="w-48"
          />
          <p className="text-xs text-neutral-400 mt-2">
            Larger n → More normal shape
          </p>
        </div>
      </div>
      
      <GraphContainer title="CLT in Action" className="!bg-transparent">
        <svg ref={svgRef} className="w-full" style={{ height: '550px' }} />
      </GraphContainer>
      
      <div className="grid md:grid-cols-3 gap-4" style={{ marginTop: '200px' }}>
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h5 className="font-semibold text-blue-400 mb-2">Key Insight 1</h5>
          <p className="text-sm text-neutral-300">
            The original distribution can be any shape - uniform, skewed, even multimodal!
          </p>
        </div>
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h5 className="font-semibold text-teal-400 mb-2">Key Insight 2</h5>
          <p className="text-sm text-neutral-300">
            Sample means always cluster around the population mean with reduced variability.
          </p>
        </div>
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
          <h5 className="font-semibold text-purple-400 mb-2">Key Insight 3</h5>
          <p className="text-sm text-neutral-300">
            As n increases, the sampling distribution becomes more normal and narrower.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Baseball Heights Example
const BaseballHeights = React.memo(function BaseballHeights({ isActive }) {
  const contentRef = useRef(null);
  
  if (!isActive) return null;
  const [showCalculation, setShowCalculation] = useState(true);
  
  // Exact data from course
  const heights = [74,74,72,72,73,69,69,71,76,71,73,73,74,74,69,70,72,73,75,78];
  const n = 20;
  const xBar = 72.6;
  const s2 = 5.6211;
  const s = Math.sqrt(s2);
  const se = s / Math.sqrt(n);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showCalculation]);
  
  const StatCard = ({ label, value, formula, color }) => {
    const bgClass = color === 'blue' ? 'bg-blue-900/20' : color === 'purple' ? 'bg-purple-900/20' : 'bg-blue-900/20';
    const borderClass = color === 'blue' ? 'border-blue-700/50' : color === 'purple' ? 'border-purple-700/50' : 'border-blue-700/50';
    const textClass = color === 'blue' ? 'text-blue-400' : color === 'purple' ? 'text-purple-400' : 'text-blue-400';
    
    return (
      <div className={`${bgClass} rounded-lg p-4 border ${borderClass}`}>
        <h5 className={`font-semibold ${textClass} mb-1`}>{label}</h5>
        <p className="text-2xl font-mono mb-2">{value}</p>
        <div className="text-xs text-neutral-400">
          <span dangerouslySetInnerHTML={{ __html: formula }} />
        </div>
      </div>
    );
  };
  
  return (
    <VisualizationSection>
      <div ref={contentRef} className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-400" />
          Example: Baseball Player Heights
        </h3>
        
        <div className="bg-neutral-800 rounded-lg p-4">
          <p className="text-sm text-neutral-300 mb-3">
            Heights (in inches) of 20 randomly selected baseball players:
          </p>
          <div className="flex flex-wrap gap-2">
            {heights.map((h, i) => (
              <span key={i} className="px-2 py-1 bg-neutral-700 rounded font-mono text-sm">
                {h}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            label="Sample Mean"
            value={`${xBar}"`}
            formula={`\\bar{X} = \\frac{1}{n}\\sum X_i`}
            color="blue"
          />
          <StatCard
            label="Sample Variance"
            value={s2.toFixed(4)}
            formula={`S^2 = \\frac{1}{n-1}\\sum(X_i - \\bar{X})^2`}
            color="purple"
          />
          <StatCard
            label="Standard Error"
            value={se.toFixed(4)}
            formula={`SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}`}
            color="teal"
          />
        </div>
        
        <div
          className="bg-blue-900/20 rounded-lg p-4"
        >
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ChevronRight className={`w-4 h-4 transform ${
              showCalculation ? 'rotate-90' : ''
            }`} />
            Show Calculation Steps
          </button>
          
            {showCalculation && (
              <div
                className="mt-4 space-y-2 text-sm"
              >
                <div className="pl-6">
                  <p>1. Calculate mean: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(\\bar{X} = \\frac{1452}{20} = 72.6\\)' 
                  }} /></p>
                  <p>2. Calculate variance: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(S^2 = \\frac{106.8}{19} = 5.6211\\)' 
                  }} /></p>
                  <p>3. Calculate SE: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(SE = \\frac{\\sqrt{5.6211}}{\\sqrt{20}} = 0.5301\\)' 
                  }} /></p>
                </div>
              </div>
            )}
        </div>
      </div>
    </VisualizationSection>
  );
});

// Decision Tree Helper Component
const DecisionTreeHelper = React.memo(function DecisionTreeHelper({ onSelect }) {
  const [currentStep, setCurrentStep] = useState('start');
  
  const steps = {
    start: {
      question: "What are you trying to find?",
      options: [
        { id: 'ci', label: 'Confidence Interval for μ', next: 'sigma-known' },
        { id: 'n', label: 'Sample Size needed', next: 'sample-size' },
        { id: 'prop', label: 'Confidence Interval for proportion', next: 'proportion' }
      ]
    },
    'sigma-known': {
      question: "Is the population standard deviation (σ) known?",
      options: [
        { id: 'yes', label: 'Yes, σ is given', formula: 'ci-known-sigma' },
        { id: 'no', label: 'No, only sample s is given', formula: 'ci-unknown-sigma' }
      ]
    },
    'sample-size': {
      question: "Sample size calculation selected",
      formula: 'sample-size'
    },
    'proportion': {
      question: "Proportion calculation selected",
      formula: 'proportion'
    }
  };
  
  const handleOptionClick = (option) => {
    if (option.formula) {
      onSelect(option.formula);
      setCurrentStep('start');
    } else if (option.next) {
      setCurrentStep(option.next);
    }
  };
  
  return (
    <div className="bg-neutral-900/50 rounded-lg p-4 mb-4 border border-neutral-700/50">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-blue-400">Formula Helper</h5>
        {currentStep !== 'start' && (
          <button
            onClick={() => setCurrentStep('start')}
            className="text-sm text-neutral-400 hover:text-neutral-300"
          >
            ← Start Over
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-300 mb-3">{steps[currentStep].question}</p>
      {steps[currentStep].options && (
        <div className="space-y-2">
          {steps[currentStep].options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left p-3 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-sm text-neutral-300 hover:text-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Visual Formula Card Component
const VisualFormulaCard = React.memo(function VisualFormulaCard({ type, values }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [type, values]);
  
  const formulas = {
    'ci-known-sigma': {
      title: 'CI when σ is known',
      color: 'blue',
      bgGradient: 'from-blue-900/20 to-blue-900/20',
      borderColor: 'border-blue-700/50',
      textColor: 'text-blue-400',
      icon: '',
      formula: `\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`,
      steps: [
        { label: 'Find z-value', calc: 'For 95% CI: z = 1.96' },
        { label: 'Calculate SE', calc: `SE = ${values.sigma}/${Math.sqrt(values.n).toFixed(2)} = ${(values.sigma/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Find margin', calc: `E = 1.96 × ${(values.sigma/Math.sqrt(values.n)).toFixed(3)} = ${(1.96 * values.sigma/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Build CI', calc: `${values.xBar} ± ${(1.96 * values.sigma/Math.sqrt(values.n)).toFixed(3)}` }
      ],
      commonMistakes: ['Forgetting to divide σ by √n', 'Using t instead of z']
    },
    'ci-unknown-sigma': {
      title: 'CI when σ is unknown',
      color: 'purple',
      bgGradient: 'from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-700/50',
      textColor: 'text-purple-400',
      icon: '',
      formula: `\\[\\bar{X} \\pm t_{\\alpha/2,n-1} \\cdot \\frac{S}{\\sqrt{n}}\\]`,
      steps: [
        { label: 'Find df', calc: `df = n - 1 = ${values.n - 1}` },
        { label: 'Find t-value', calc: 'Look up in t-table' },
        { label: 'Calculate SE', calc: `SE = ${values.s}/${Math.sqrt(values.n).toFixed(2)} = ${(values.s/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Build CI', calc: 'Apply formula with t-value' }
      ],
      commonMistakes: ['Using z instead of t', 'Wrong degrees of freedom']
    }
  };
  
  const current = formulas[type];
  if (!current) return null;
  
  return (
    <div ref={contentRef} className={`bg-gradient-to-br ${current.bgGradient} rounded-lg p-4 border ${current.borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{current.icon}</span>
        <h5 className={`font-semibold ${current.textColor}`}>{current.title}</h5>
      </div>
      
      <div className="bg-neutral-900/50 rounded p-3 mb-3 text-center">
        <span dangerouslySetInnerHTML={{ __html: current.formula }} />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-300 mb-2">Step-by-Step:</p>
        {current.steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm"
          >
            <span className="text-blue-400 font-mono">{idx + 1}.</span>
            <div className="flex-1">
              <span className="text-neutral-300">{step.label}:</span>
              <span className="ml-2 font-mono text-neutral-400">{step.calc}</span>
            </div>
          </div>
        ))}
        
        <div 
          className="mt-3 p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded border border-red-700/50"
        >
          <p className="text-xs font-medium text-red-400 mb-1">⚠️ Common Mistakes:</p>
          <ul className="text-xs text-neutral-300">
            {current.commonMistakes.map((mistake, idx) => (
              <li key={idx}>• {mistake}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

// Interactive Calculator Component
const InteractiveCalculator = () => {
  const contentRef = useRef(null);
  const [mode, setMode] = useState('ci-known-sigma'); // Auto-select first option
  const [values, setValues] = useState({
    n: 30,
    xBar: 100,
    sigma: 15,
    s: 14.5,
    confidenceLevel: 0.95
  });
  const [showDecisionTree, setShowDecisionTree] = useState(true);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [mode, values]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Interactive Formula Calculator
      </h3>
      
      <div ref={contentRef}>
        {showDecisionTree && (
            <div
              className="bg-gradient-to-br from-blue-900/20 to-blue-900/20 rounded-lg p-4 mb-4 border border-blue-700/50"
            >
              <p className="text-sm text-blue-400 mb-2">
                Use the decision tree below to find the right formula for your problem!
              </p>
              <DecisionTreeHelper onSelect={setMode} />
            </div>
        )}
        
        {/* Input Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Size (n)</label>
            <input
              type="number"
              value={values.n}
              onChange={(e) => setValues({...values, n: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Mean (x̄)</label>
            <input
              type="number"
              value={values.xBar}
              onChange={(e) => setValues({...values, xBar: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pop. Std Dev (σ)</label>
            <input
              type="number"
              value={values.sigma}
              onChange={(e) => setValues({...values, sigma: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
              placeholder="If known"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Std Dev (s)</label>
            <input
              type="number"
              value={values.s}
              onChange={(e) => setValues({...values, s: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
              placeholder="If σ unknown"
            />
          </div>
        </div>
        
        {/* Formula Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('ci-known-sigma')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'ci-known-sigma'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            CI (σ known)
          </button>
          <button
            onClick={() => setMode('ci-unknown-sigma')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'ci-unknown-sigma'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            CI (σ unknown)
          </button>
        </div>
        
        {/* Formula Display */}
        {mode && (
          <div
            className="space-y-4"
          >
            <VisualFormulaCard type={mode} values={values} />
            
          </div>
        )}
      </div>
    </VisualizationSection>
  );
};

// Field-Specific Examples Component
const FieldSpecificExamples = React.memo(function FieldSpecificExamples({ isActive }) {
  if (!isActive) return null;
  
  const [activeTab, setActiveTab] = useState('engineering');
  
  const fields = {
    engineering: {
      title: 'Engineering Applications',
      icon: '⚙️',
      examples: [
        {
          scenario: 'Quality Control',
          question: 'Are manufactured parts within tolerance?',
          approach: 'Sample measurements → CI for mean dimension'
        },
        {
          scenario: 'Reliability Testing',
          question: 'What is the failure rate?',
          approach: 'Test sample → CI for failure proportion'
        }
      ]
    },
    medical: {
      title: 'Medical Research',
      icon: '🏥',
      examples: [
        {
          scenario: 'Drug Efficacy',
          question: 'Does the treatment work?',
          approach: 'Clinical trial → CI for effect size'
        },
        {
          scenario: 'Disease Prevalence',
          question: 'What percentage have the condition?',
          approach: 'Random screening → CI for proportion'
        }
      ]
    },
    business: {
      title: 'Business Analytics',
      icon: '',
      examples: [
        {
          scenario: 'Customer Satisfaction',
          question: 'How satisfied are customers?',
          approach: 'Survey sample → CI for mean rating'
        },
        {
          scenario: 'Market Share',
          question: 'What is our market penetration?',
          approach: 'Sales data → CI for proportion'
        }
      ]
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Real-World Applications</h3>
      
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 border-b border-neutral-700">
        {Object.entries(fields).map(([key, field]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === key
                ? 'bg-neutral-700 text-white border-b-2 border-blue-500'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {field.title}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div 
        className="grid gap-4"
      >
        {fields[activeTab].examples.map((example, idx) => (
          <div
            key={idx}
            className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
          >
            <h4 className="font-semibold text-blue-400 mb-2">{example.scenario}</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Research Question:</p>
                <p className="text-neutral-200">{example.question}</p>
              </div>
              <div>
                <p className="text-neutral-400">Statistical Approach:</p>
                <p className="text-neutral-200">{example.approach}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VisualizationSection>
  );
});

// Concept Connections Component
const ConceptConnections = ({ isActive }) => {
  if (!isActive) return null;
  
  const connections = [
    {
      from: 'Sampling Distribution',
      to: 'Standard Error',
      relationship: 'SE is the standard deviation of the sampling distribution'
    },
    {
      from: 'Standard Error',
      to: 'Confidence Intervals',
      relationship: 'CI width is determined by SE × critical value'
    },
    {
      from: 'Sample Size',
      to: 'Standard Error',
      relationship: 'SE decreases as √n increases'
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Concept Connections</h3>
      
      <div className="space-y-4">
        {connections.map((conn, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4"
          >
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50 flex-1 text-center">
              <p className="text-sm font-semibold text-blue-400">{conn.from}</p>
            </div>
            <div className="text-2xl text-neutral-400">→</div>
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50 flex-1 text-center">
              <p className="text-sm font-semibold text-purple-400">{conn.to}</p>
            </div>
          </div>
        ))}
        
        <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
          <p className="text-sm text-neutral-300">
            These connections form the foundation of statistical inference, 
            allowing us to quantify uncertainty and make data-driven decisions.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Practice Problems Component
const PracticeProblems = React.memo(function PracticeProblems() {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProblem, showSolution]);
  
  const problems = [
    {
      title: "Manufacturing Quality",
      difficulty: "Medium",
      problem: "A factory produces bolts with a target diameter of 10mm. A sample of 25 bolts has mean diameter 10.2mm and standard deviation 0.5mm. Calculate a 95% CI for the true mean diameter.",
      hints: [
        "σ is unknown, so use t-distribution",
        "df = n - 1 = 24",
        "For 95% CI with df=24, t ≈ 2.064"
      ],
      solution: {
        steps: [
          { text: "Identify: n = 25, x̄ = 10.2, s = 0.5", math: null },
          { text: "Calculate SE:", math: "SE = \\frac{s}{\\sqrt{n}} = \\frac{0.5}{\\sqrt{25}} = 0.1" },
          { text: "Find t-value: df = 24, α = 0.05, t = 2.064", math: null },
          { text: "Calculate CI:", math: "10.2 \\pm 2.064 \\times 0.1 = 10.2 \\pm 0.206" },
          { text: "Result: [9.994, 10.406]", math: null }
        ],
        interpretation: "We are 95% confident the true mean diameter is between 9.994mm and 10.406mm. The bolts may be slightly oversized."
      }
    },
    {
      title: "Election Polling",
      difficulty: "Easy",
      problem: "A poll of 1000 voters shows 520 support candidate A. Calculate a 95% CI for the true proportion of support.",
      hints: [
        "This is a proportion problem",
        "p̂ = 520/1000 = 0.52",
        "Use z-distribution for large samples"
      ],
      solution: {
        steps: [
          { text: "Calculate sample proportion:", math: "\\hat{p} = \\frac{520}{1000} = 0.52" },
          { text: "Calculate SE:", math: "SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = 0.0158" },
          { text: "For 95% CI, z = 1.96", math: null },
          { text: "Calculate CI:", math: "0.52 \\pm 1.96 \\times 0.0158 = 0.52 \\pm 0.031" },
          { text: "Result: [0.489, 0.551]", math: null }
        ],
        interpretation: "We are 95% confident that between 48.9% and 55.1% of voters support candidate A."
      }
    }
  ];
  
  const currentProblem = problems[selectedProblem];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Practice Problems</h3>
      
      <div className="flex gap-2 mb-4">
        {problems.map((prob, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedProblem(idx);
              setShowSolution(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              selectedProblem === idx
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Problem {idx + 1}
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="space-y-4">
        {/* Problem Statement */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-blue-400">{currentProblem.title}</h4>
            <span className={`px-2 py-1 rounded text-xs ${
              currentProblem.difficulty === 'Easy' 
                ? 'bg-green-900/50 text-green-400'
                : 'bg-yellow-900/50 text-yellow-400'
            }`}>
              {currentProblem.difficulty}
            </span>
          </div>
          <p className="text-neutral-300">{currentProblem.problem}</p>
        </div>
        
        {/* Hints */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h5 className="font-semibold text-blue-400 mb-2">Hints:</h5>
          <ul className="text-sm text-neutral-300 space-y-1">
            {currentProblem.hints.map((hint, idx) => (
              <li key={idx}>• {hint}</li>
            ))}
          </ul>
        </div>
        
        {/* Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
        
        {/* Solution */}
          {showSolution && (
            <div
              className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50 space-y-3"
            >
              <h5 className="font-semibold text-blue-400">Step-by-Step Solution:</h5>
              {currentProblem.solution.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2"
                >
                  <span className="text-blue-400 font-mono">{idx + 1}.</span>
                  <div>
                    <p className="text-sm text-neutral-300">{step.text}</p>
                    {step.math && (
                      <div className="mt-1 p-2 bg-neutral-800 rounded">
                        <span dangerouslySetInnerHTML={{ __html: `\\[${step.math}\\]` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-neutral-800/50 rounded">
                <p className="text-sm font-semibold text-blue-400 mb-1">Interpretation:</p>
                <p className="text-sm text-neutral-300">{currentProblem.solution.interpretation}</p>
              </div>
            </div>
          )}
      </div>
    </VisualizationSection>
  );
});

// Common Mistakes Component
const CommonMistakes = React.memo(function CommonMistakes() {
  const [expandedSection, setExpandedSection] = useState('mistakes'); // Auto-expand mistakes
  
  const examTopics = [
    {
      id: 'concepts',
      title: 'Key Concepts to Master',
      items: [
        'Difference between population parameter and sample statistic',
        'Sampling distribution and its properties',
        'Standard error calculation and interpretation',
        'Central Limit Theorem applications'
      ]
    },
    {
      id: 'formulas',
      title: 'Essential Formulas',
      items: [
        'Standard Error: SE = σ/√n or s/√n',
        'CI (σ known): x̄ ± z·σ/√n',
        'CI (σ unknown): x̄ ± t·s/√n',
        'Sample size: n = (z·σ/E)²'
      ]
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes to Avoid',
      items: [
        'Using z when σ is unknown (use t instead)',
        'Forgetting to divide by √n for SE',
        'Wrong degrees of freedom for t-distribution',
        'Misinterpreting confidence level'
      ]
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Common Mistakes & Tips</h3>
      
      <div className="space-y-3">
        {examTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-neutral-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedSection(
                expandedSection === topic.id ? null : topic.id
              )}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              <h4 className="font-semibold text-blue-400 group-hover:text-blue-300">{topic.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Click to expand</span>
                <ChevronRight className={`w-5 h-5 text-neutral-400 group-hover:text-blue-400 transform transition-transform ${
                expandedSection === topic.id ? 'rotate-90' : ''
              }`} />
              </div>
            </button>
            
              {expandedSection === topic.id && (
                <div
                  className="px-4 pb-4"
                >
                  <ul className="space-y-2">
                    {topic.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-sm text-neutral-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ))}
      </div>
      
      {/* Quick Reference Card */}
      <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-blue-900/20 rounded-lg p-4 border border-blue-700/50">
        <h5 className="font-semibold text-blue-400 mb-3">Quick Decision Guide</h5>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-400 mb-1">If σ is known:</p>
            <p className="text-neutral-200">→ Use z-distribution</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">If σ is unknown:</p>
            <p className="text-neutral-200">→ Use t-distribution with df = n-1</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">For proportions:</p>
            <p className="text-neutral-200">→ SE = √[p̂(1-p̂)/n]</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">For means:</p>
            <p className="text-neutral-200">→ SE = σ/√n or s/√n</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Takeaways Component
const KeyTakeaways = () => {
  const takeaways = [
    {
      icon: '',
      title: 'Core Principle',
      content: 'Statistical inference allows us to make probabilistic statements about populations based on sample data.'
    },
    {
      icon: '',
      title: 'Sampling Distribution',
      content: 'The distribution of sample statistics follows predictable patterns, enabling confidence intervals and hypothesis tests.'
    },
    {
      icon: '',
      title: 'Standard Error',
      content: 'SE quantifies the variability of sample statistics and decreases with larger sample sizes (√n relationship).'
    },
    {
      icon: '',
      title: 'Central Limit Theorem',
      content: 'Sample means approach normality for large n, regardless of the population distribution shape.'
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Key Takeaways</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {takeaways.map((takeaway, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-neutral-800/50 to-neutral-700/50 rounded-lg p-4 border border-neutral-600/50"
          >
            <div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">{takeaway.title}</h4>
                <p className="text-sm text-neutral-300">{takeaway.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div 
        className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30"
      >
        <p className="text-sm text-blue-400 text-center">
          Remember: The goal is not just to calculate, but to understand what the results mean for decision-making!
        </p>
      </div>
    </VisualizationSection>
  );
};

// Main Component - Simplified
export default function StatisticalInference() {
  const [mode, setMode] = useState(LEARNING_MODES.FOUNDATIONS);
  
  return (
    <>
      {/* Chapter 5 Reference Sheet - Floating button */}
      <Chapter5ReferenceSheet mode="floating" />
      
      <VisualizationContainer
      title="5.1 Statistical Inference"
      description="From Data to Decisions"
    >
      <BackToHub chapter={5} />
      
      <LearningPathNavigation 
        mode={mode} 
        onModeChange={setMode}
      />
      
      {/* FOUNDATIONS Mode */}
      <div style={{ display: mode === LEARNING_MODES.FOUNDATIONS ? 'block' : 'none' }}>
        <div className="space-y-8">
        {/* Introduction */}
        <div>
          <StatisticalInferenceIntroduction />
        </div>
        
        {/* Mathematical Foundations */}
        <div>
          <MathematicalFoundations />
        </div>
        
        {/* Estimator Properties - Advanced Topic */}
        <div>
          <EstimatorProperties />
        </div>
        </div>
      </div>
      
      {/* EXPLORATION Mode */}
      <div style={{ display: mode === LEARNING_MODES.EXPLORATION ? 'block' : 'none' }}>
        <div className="space-y-8">
        {/* Interactive Insights */}
        <div>
          <InteractiveInsights />
        </div>
        
        {/* Exploration */}
        <div>
          <GearWheelFactory isActive={mode === LEARNING_MODES.EXPLORATION} />
        </div>
        
        {/* Discovery */}
        <div>
          <CentralLimitTheoremDemo />
          <BaseballHeights />
        </div>
        
        {/* Bayesian Inference */}
        <div>
          <BayesianInferenceIntro isActive={mode === LEARNING_MODES.EXPLORATION} />
        </div>
        
        {/* Application */}
        <div>
          <FieldSpecificExamples isActive={mode === LEARNING_MODES.EXPLORATION} />
          <ConceptConnections isActive={mode === LEARNING_MODES.EXPLORATION} />
        </div>
        </div>
      </div>
      
      {/* PRACTICE Mode */}
      <div style={{ display: mode === LEARNING_MODES.PRACTICE ? 'block' : 'none' }}>
        <div className="space-y-8">
        
        {/* Concept Check Quiz */}
        <div className="bg-neutral-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Check Your Understanding</h3>
          <QuizBreak
            questions={[
              {
                question: "What is the fundamental difference between a parameter and a statistic?",
                type: "multiple-choice",
                options: [
                  "Parameters describe samples, statistics describe populations",
                  "Parameters describe populations, statistics describe samples",
                  "Parameters are calculated, statistics are estimated",
                  "There is no difference, they are synonyms"
                ],
                correct: 1,
                explanation: "Parameters are fixed (but unknown) values that describe populations (like μ or σ). Statistics are values calculated from samples (like x̄ or s) that we use to estimate parameters."
              },
              {
                question: "Which of the following is NOT a desirable property of an estimator?",
                type: "multiple-choice",
                options: [
                  "Unbiasedness",
                  "Consistency",
                  "Maximum variance",
                  "Efficiency"
                ],
                correct: 2,
                explanation: "We want estimators with MINIMUM variance (efficiency), not maximum. High variance means our estimates are unreliable and vary widely from sample to sample."
              },
              {
                question: "In Bayesian inference, what does the posterior distribution represent?",
                type: "multiple-choice",
                options: [
                  "Our belief about the parameter before seeing data",
                  "The probability of the data given the parameter",
                  "Our updated belief about the parameter after seeing data",
                  "The long-run frequency of the parameter"
                ],
                correct: 2,
                explanation: "The posterior distribution combines our prior beliefs with the likelihood of the observed data to give us an updated belief about the parameter. It's calculated as: Posterior ∝ Likelihood × Prior"
              },
              {
                question: "According to the Central Limit Theorem, what happens to the sampling distribution of x̄ as n increases?",
                type: "multiple-choice",
                options: [
                  "It becomes more skewed",
                  "It approaches a normal distribution",
                  "It becomes uniform",
                  "It matches the population distribution"
                ],
                correct: 1,
                explanation: "The CLT states that regardless of the population distribution shape, the sampling distribution of the sample mean approaches a normal distribution as sample size increases. This is why we can use normal-based methods for large samples."
              },
              {
                question: "If the standard error of x̄ is 2 when n = 25, what will it be when n = 100?",
                type: "multiple-choice",
                options: [
                  "0.5",
                  "1",
                  "4",
                  "8"
                ],
                correct: 1,
                explanation: "Standard error follows the formula SE = σ/√n. When n increases by a factor of 4 (from 25 to 100), SE decreases by a factor of 2 (since √4 = 2). So SE goes from 2 to 1."
              }
            ]}
            onComplete={() => console.log('Quiz completed')}
          />
        </div>
        
        {/* Practice Problems */}
        <div>
          <PracticeProblems />
        </div>
        
        {/* Interactive Calculator */}
        <div>
          <InteractiveCalculator />
        </div>
        
        {/* Common Mistakes */}
        <div>
          <CommonMistakes />
        </div>
        
        {/* Key Takeaways */}
        <div>
          <KeyTakeaways />
        </div>
        </div>
      </div>
      
      {/* Section Complete - Standardized Component */}
      <SectionComplete chapter={5} />
    </VisualizationContainer>
    </>
  );
}