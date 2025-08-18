"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { 
  BarChart3, Vote, BookOpen, Wrench, Calculator, 
  CheckCircle, XCircle, TrendingUp, Heart, AlertCircle 
} from "lucide-react";
import { 
  VisualizationContainer, 
  VisualizationSection, 
  GraphContainer, 
  ControlGroup 
} from "../ui/VisualizationContainer";
import BackToHub from "../ui/BackToHub";
import SectionComplete from '@/components/ui/SectionComplete';
import { createColorScheme, typography } from "@/lib/design-system";
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox } from '../ui/patterns/InterpretationBox';
import { Chapter5ReferenceSheet } from '../reference-sheets/Chapter5ReferenceSheet';

// Use Chapter 7 color scheme for consistency
const colorScheme = createColorScheme('regression');

// Learning modes
const LEARNING_MODES = {
  FOUNDATIONS: 'foundations',
  EXAMPLES: 'examples', 
  PRACTICE: 'practice'
};

// Mode colors
const MODE_COLORS = {
  [LEARNING_MODES.FOUNDATIONS]: '#8b5cf6', // purple
  [LEARNING_MODES.EXAMPLES]: '#3b82f6', // blue
  [LEARNING_MODES.PRACTICE]: '#10b981' // emerald
};

// Animation constants for consistency (1.5s as per checklist)
const ANIMATION_DURATION = 1.5;
const ANIMATION_CONFIG = {
  duration: ANIMATION_DURATION,
  ease: "easeInOut"
};

// Helper function to get z-critical value
const getZCritical = (confidence) => {
  const zTable = {
    90: 1.645,
    95: 1.96,
    98: 2.326,
    99: 2.576
  };
  return zTable[confidence] || 1.96;
};

// Mathematical Foundations Section with Enhanced Pedagogy
const MathematicalFoundations = React.memo(function MathematicalFoundations() {
  const contentRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  
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
  }, [currentStep]);
  
  const steps = [
    {
      title: "Starting with the Binomial",
      content: (
        <div>
          <p className="mb-3">
            When we count successes in n trials, we have a binomial random variable:
          </p>
          <div className="text-center text-lg mb-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[X \\sim B(n, p)\\]` 
            }} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg p-4 border" style={{
              backgroundColor: `${colorScheme.primary}15`,
              borderColor: `${colorScheme.primary}50`
            }}>
              <p className="text-sm font-semibold text-purple-400 mb-2">Mean</p>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[E[X] = np\\]` 
              }} />
            </div>
            <div className="rounded-lg p-4 border" style={{
            backgroundColor: `${colorScheme.primary}20`,
            borderColor: `${colorScheme.primary}50`
          }}>
              <p className="text-sm font-semibold text-blue-400 mb-2">Variance</p>
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[Var(X) = np(1-p)\\]` 
              }} />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Sample Proportion",
      content: (
        <div>
          <p className="mb-3">
            We estimate the population proportion p using the sample proportion:
          </p>
          <div className="text-center text-lg mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} = \\frac{X}{n} = \\frac{\\text{number of successes}}{\\text{sample size}}\\]` 
            }} />
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-white mb-2">Properties of <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{P}\\)` }} />:</p>
            <div className="space-y-2">
              <p>• <span dangerouslySetInnerHTML={{ __html: `\\(E[\\hat{P}] = E\\left[\\frac{X}{n}\\right] = \\frac{E[X]}{n} = \\frac{np}{n} = p\\)` }} /></p>
              <p>• <span dangerouslySetInnerHTML={{ __html: `\\(Var(\\hat{P}) = Var\\left(\\frac{X}{n}\\right) = \\frac{Var(X)}{n^2} = \\frac{np(1-p)}{n^2} = \\frac{p(1-p)}{n}\\)` }} /></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Normal Approximation (CLT)",
      content: (
        <div>
          <p className="mb-3">
            By the Central Limit Theorem, for large n:
          </p>
          <div className="text-center text-lg mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} \\approx N\\left(p, \\frac{p(1-p)}{n}\\right)\\]` 
            }} />
          </div>
          <p className="mb-3">
            Standardizing gives us:
          </p>
          <div className="text-center text-lg mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\hat{P} - p}{\\sqrt{\\frac{p(1-p)}{n}}} \\approx N(0,1)\\]` 
            }} />
          </div>
          <div className="rounded-lg p-4 border" style={{
            backgroundColor: `${colorScheme.secondary}20`,
            borderColor: `${colorScheme.secondary}50`
          }}>
            <p className="text-sm mb-2">
              <strong className="text-yellow-400">When is this valid?</strong> Both np ≥ 10 AND n(1-p) ≥ 10
            </p>
            <p className="text-xs text-neutral-400">
              <strong>Intuition:</strong> We need at least 10 expected successes AND 10 expected failures. 
              This ensures our binomial distribution is "bell-shaped enough" for the normal approximation to work well.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Building the Confidence Interval",
      content: (
        <div>
          <p className="mb-3">
            For a 100(1-α)% confidence interval:
          </p>
          <div className="text-center text-lg mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P\\left(-z_{\\alpha/2} < \\frac{\\hat{P} - p}{\\sqrt{\\frac{p(1-p)}{n}}} < z_{\\alpha/2}\\right) = 1-\\alpha\\]` 
            }} />
          </div>
          <p className="mb-3">
            Rearranging to solve for p:
          </p>
          <div className="text-center text-lg mb-4">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} - z_{\\alpha/2}\\sqrt{\\frac{p(1-p)}{n}} < p < \\hat{P} + z_{\\alpha/2}\\sqrt{\\frac{p(1-p)}{n}}\\]` 
            }} />
          </div>
          <div className="rounded-lg p-4 border" style={{
            backgroundColor: '#ef444420',
            borderColor: '#ef444450'
          }}>
            <p className="text-sm">
              <strong className="text-red-400">Problem:</strong> We don't know p! It appears in the standard error.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "The Wald Interval Solution",
      content: (
        <div>
          <p className="mb-3">
            We substitute <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} /> for p in the standard error:
          </p>
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg p-6 border border-purple-500/30">
            <p className="text-sm font-semibold text-purple-400 mb-3">The Wald Confidence Interval:</p>
            <div className="text-center text-lg">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\hat{p} \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` 
              }} />
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <p className="text-sm font-semibold text-green-400 mb-2">Advantages</p>
              <ul className="text-sm space-y-1">
                <li>• Simple to calculate</li>
                <li>• Works well for moderate p</li>
                <li>• Standard in most software</li>
              </ul>
            </div>
            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
              <p className="text-sm font-semibold text-orange-400 mb-2">Limitations</p>
              <ul className="text-sm space-y-1">
                <li>• Poor for p near 0 or 1</li>
                <li>• Can produce intervals outside [0,1]</li>
                <li>• Coverage probability issues</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-6" style={{ fontSize: typography.h2 }}>
        Mathematical Foundations: From Binomial to Confidence Interval
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500'
                  : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
        
        {/* Current step content */}
        <div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ANIMATION_CONFIG}
          className="bg-neutral-800 rounded-xl p-6"
        >
          <h4 className="font-semibold text-white mb-4" style={{ fontSize: typography.h3 }}>
            Step {currentStep + 1}: {steps[currentStep].title}
          </h4>
          {steps[currentStep].content}
        </div>
        
        {/* Navigation buttons - Chapter 7 style */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === steps.length - 1 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Introduction section with LaTeX formulas
const ProportionIntroduction = React.memo(function ProportionIntroduction() {
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-4">
        <p className="font-semibold text-white mb-4" style={{ fontSize: typography.h3 }}>
          Confidence Intervals for Proportions
        </p>
        
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-sm mb-3">
            If X ~ B(n, p) (number of successes in n trials), then the point estimator 
            for p is:
          </p>
          <div className="text-center text-lg">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} = \\frac{X}{n}\\]` 
            }} />
          </div>
        </div>
        
        <p>
          Recall that E[X] = np and Var[X] = np(1-p). We can standardize:
        </p>
        
        <div className="bg-neutral-700/50 rounded-lg p-4">
          <div className="text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\hat{P} - p}{\\sqrt{\\frac{p(1-p)}{n}}} \\text{ is approximately } N(0,1)\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-sm">
            <strong className="text-yellow-400">Key Point:</strong> We don't know p (that's what we're estimating!), 
            so we use <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{P}\\)` }} /> in the standard error calculation.
          </p>
        </div>
      </div>
    </div>
  );
});


// Election Story Section - with step-by-step navigation
const ElectionStory = React.memo(function ElectionStory({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef(null);
  
  // Fixed values for example
  const n = 1000;
  const supportA = 0.52;
  const supportB = 0.48;
  const z_alpha2 = 1.96; // 95% confidence
  
  // Calculate CIs
  const se_A = Math.sqrt((supportA * (1 - supportA)) / n);
  const se_B = Math.sqrt((supportB * (1 - supportB)) / n);
  const moe_A = z_alpha2 * se_A;
  const moe_B = z_alpha2 * se_B;
  
  const ci_A = {
    lower: supportA - moe_A,
    upper: supportA + moe_A
  };
  
  const ci_B = {
    lower: supportB - moe_B,
    upper: supportB + moe_B
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
  }, [currentStep]);
  
  const steps = [
    {
      title: "The Election Dilemma",
      content: (
        <div>
          <p className="text-neutral-300">
            It's one week before a major election. A news organization wants to know:
            <span className="font-semibold" style={{ color: colorScheme.primary }}> Will Candidate A win?</span>
          </p>
          <p className="text-neutral-300 mt-3">
            They can't ask all 10 million voters, so they poll a random sample of 1,000 voters...
          </p>
          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <p className="text-sm font-semibold text-purple-400 mb-2">The Challenge:</p>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>• Population: 10 million voters</li>
              <li>• Sample: 1,000 voters (0.01% of population)</li>
              <li>• Question: Can such a small sample predict the outcome?</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Poll Results",
      content: (
        <div>
          <p className="text-neutral-300 mb-4">
            After polling 1,000 randomly selected voters, here are the results:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/30 text-center">
              <p className="text-sm text-neutral-400 mb-2">Candidate A</p>
              <div className="text-4xl font-mono text-purple-400 font-bold">52%</div>
              <p className="text-sm text-neutral-500 mt-2">(520 out of 1,000 votes)</p>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30 text-center">
              <p className="text-sm text-neutral-400 mb-2">Candidate B</p>
              <div className="text-4xl font-mono text-blue-400 font-bold">48%</div>
              <p className="text-sm text-neutral-500 mt-2">(480 out of 1,000 votes)</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-neutral-900/50 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Question:</strong> Candidate A has a 4-point lead in our sample. 
              But is this enough to confidently predict they'll win the actual election?
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Confidence Intervals Reveal the Truth",
      content: (
        <div ref={contentRef}>
          <p className="text-neutral-300 mb-4">
            Let's calculate 95% confidence intervals to quantify our uncertainty:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
              <p className="font-semibold mb-3" style={{ color: colorScheme.primary }}>Candidate A</p>
              <div className="space-y-2 text-sm">
                <p><span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_A = 0.52\\)` }} /></p>
                <p><span dangerouslySetInnerHTML={{ __html: `\\(SE_A = \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = ${se_A.toFixed(4)}\\)` }} /></p>
                <p><span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = 1.96 \\times ${se_A.toFixed(4)} = ${moe_A.toFixed(4)}\\)` }} /></p>
                <p className="font-semibold mt-2 text-purple-400">
                  CI: [{(ci_A.lower * 100).toFixed(1)}%, {(ci_A.upper * 100).toFixed(1)}%]
                </p>
              </div>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <p className="font-semibold mb-3" style={{ color: colorScheme.secondary }}>Candidate B</p>
              <div className="space-y-2 text-sm">
                <p><span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}_B = 0.48\\)` }} /></p>
                <p><span dangerouslySetInnerHTML={{ __html: `\\(SE_B = \\sqrt{\\frac{0.48 \\times 0.52}{1000}} = ${se_B.toFixed(4)}\\)` }} /></p>
                <p><span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = 1.96 \\times ${se_B.toFixed(4)} = ${moe_B.toFixed(4)}\\)` }} /></p>
                <p className="font-semibold mt-2 text-blue-400">
                  CI: [{(ci_B.lower * 100).toFixed(1)}%, {(ci_B.upper * 100).toFixed(1)}%]
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg border" style={{
            backgroundColor: `${colorScheme.secondary}20`,
            borderColor: `${colorScheme.secondary}50`
          }}>
            <p className="text-sm">
              <strong className="text-yellow-400">Statistical Dead Heat!</strong> The confidence intervals overlap
              ([{(ci_A.lower * 100).toFixed(1)}%, {(ci_A.upper * 100).toFixed(1)}%] vs [{(ci_B.lower * 100).toFixed(1)}%, {(ci_B.upper * 100).toFixed(1)}%]),
              meaning we cannot confidently predict a winner. The race is too close to call!
            </p>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-6" style={{ fontSize: typography.h2 }}>
        The Election Story: A Real-World Application
      </h3>
      
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500'
                  : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
        
        {/* Current step content */}
        <div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-neutral-800 rounded-xl p-6"
        >
          <h4 className="font-semibold text-white mb-4" style={{ fontSize: typography.h3 }}>
            Step {currentStep + 1}: {steps[currentStep].title}
          </h4>
          {steps[currentStep].content}
        </div>
        
        {/* Navigation buttons - Chapter 7 style */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === steps.length - 1 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Understanding Normal Approximation Theory
const NormalApproximationTheory = React.memo(function NormalApproximationTheory() {
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
  
  // Visual intuition data - no longer needed with direct table
  const conditionsTable = null;
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Core Question */}
      <InterpretationBox title="The Fundamental Question" theme="blue">
        <p className="text-lg mb-3">
          <strong>When can we approximate a discrete binomial with a continuous normal distribution?</strong>
        </p>
        <p className="mb-2">
          The binomial distribution is <span className="text-blue-400">discrete</span> (you can have 0, 1, 2... successes, but not 1.5).
          The normal distribution is <span className="text-green-400">continuous</span> (any real value).
        </p>
        <p>
          We're essentially asking: When does the discrete "staircase" of binomial probabilities look enough like a smooth bell curve?
        </p>
      </InterpretationBox>
      
      {/* Mathematical Foundation */}
      <SemanticGradientGrid title="Mathematical Foundation" theme="purple">
        <SemanticGradientCard
          title="1. The Binomial Distribution"
          description="For X ~ B(n, p), we have:"
          formula={`\\[E[X] = np \\quad \\text{and} \\quad Var(X) = np(1-p)\\]`}
          note="These are the exact mean and variance of the binomial."
          theme="purple"
        />
        <SemanticGradientCard
          title="2. Sample Proportion"
          description="The sample proportion is:"
          formula={`\\[\\hat{P} = \\frac{X}{n} \\quad \\text{where} \\quad E[\\hat{P}] = p\\]`}
          note={`Standard error: \\(SE = \\sqrt{\\frac{p(1-p)}{n}}\\)`}
          theme="blue"
        />
        <SemanticGradientCard
          title="3. Central Limit Theorem"
          description="As n increases:"
          formula={`\\[\\hat{P} \\xrightarrow{d} N\\left(p, \\frac{p(1-p)}{n}\\right)\\]`}
          note="The distribution approaches normal, but how fast depends on p."
          theme="teal"
        />
        <SemanticGradientCard
          title="4. The Magic Conditions"
          description="Normal approximation is valid when:"
          formula={`\\[np \\geq 10 \\quad \\text{AND} \\quad n(1-p) \\geq 10\\]`}
          note="Both expected successes AND failures must be at least 10."
          theme="green"
        />
      </SemanticGradientGrid>
      
      {/* Why These Conditions? */}
      <InterpretationBox title="Why np ≥ 10 and n(1-p) ≥ 10?" theme="teal">
        <p className="mb-3">
          <strong>These conditions ensure sufficient data in both categories to form a bell shape:</strong>
        </p>
        <ul className="space-y-2 ml-4">
          <li>• <span className="text-teal-400">np ≥ 10</span>: We need at least 10 expected successes</li>
          <li>• <span className="text-teal-400">n(1-p) ≥ 10</span>: We need at least 10 expected failures</li>
        </ul>
        <p className="mt-3 text-yellow-400">
          <strong>Why 10?</strong> This is empirical - statisticians found that with at least 10 in each category, 
          the approximation error is typically less than 5%. It's a practical threshold, not a mathematical certainty.
        </p>
      </InterpretationBox>
      
      {/* Visual Intuition Table */}
      <div className="bg-neutral-800 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4" style={{ fontSize: typography.h3 }}>
          Visual Intuition: When Does the Approximation Work?
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-2 px-3 text-neutral-400">Scenario</th>
                <th className="text-center py-2 px-3 text-neutral-400">n</th>
                <th className="text-center py-2 px-3 text-neutral-400">p</th>
                <th className="text-center py-2 px-3 text-neutral-400">np</th>
                <th className="text-center py-2 px-3 text-neutral-400">n(1-p)</th>
                <th className="text-center py-2 px-3 text-neutral-400">Meets Conditions?</th>
                <th className="text-center py-2 px-3 text-neutral-400">Distribution Shape</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-700/50">
                <td className="py-2 px-3 text-neutral-300">Rare event</td>
                <td className="text-center py-2 px-3">100</td>
                <td className="text-center py-2 px-3">0.01</td>
                <td className="text-center py-2 px-3 text-red-400">1</td>
                <td className="text-center py-2 px-3 text-green-400">99</td>
                <td className="text-center py-2 px-3 text-red-400">❌ No</td>
                <td className="text-center py-2 px-3 text-neutral-400">Extremely skewed right</td>
              </tr>
              <tr className="border-b border-neutral-700/50">
                <td className="py-2 px-3 text-neutral-300">Uncommon</td>
                <td className="text-center py-2 px-3">100</td>
                <td className="text-center py-2 px-3">0.10</td>
                <td className="text-center py-2 px-3 text-yellow-400">10</td>
                <td className="text-center py-2 px-3 text-green-400">90</td>
                <td className="text-center py-2 px-3 text-yellow-400">✓ Borderline</td>
                <td className="text-center py-2 px-3 text-neutral-400">Slightly skewed</td>
              </tr>
              <tr className="border-b border-neutral-700/50">
                <td className="py-2 px-3 text-neutral-300">Moderate</td>
                <td className="text-center py-2 px-3">110</td>
                <td className="text-center py-2 px-3">0.40</td>
                <td className="text-center py-2 px-3 text-green-400">44</td>
                <td className="text-center py-2 px-3 text-green-400">66</td>
                <td className="text-center py-2 px-3 text-green-400">✓ Yes</td>
                <td className="text-center py-2 px-3 text-neutral-400">Bell-shaped</td>
              </tr>
              <tr className="border-b border-neutral-700/50">
                <td className="py-2 px-3 text-neutral-300">Balanced</td>
                <td className="text-center py-2 px-3">50</td>
                <td className="text-center py-2 px-3">0.50</td>
                <td className="text-center py-2 px-3 text-green-400">25</td>
                <td className="text-center py-2 px-3 text-green-400">25</td>
                <td className="text-center py-2 px-3 text-green-400">✓ Yes</td>
                <td className="text-center py-2 px-3 text-neutral-400">Perfect symmetry</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-neutral-300">Common</td>
                <td className="text-center py-2 px-3">100</td>
                <td className="text-center py-2 px-3">0.95</td>
                <td className="text-center py-2 px-3 text-green-400">95</td>
                <td className="text-center py-2 px-3 text-red-400">5</td>
                <td className="text-center py-2 px-3 text-red-400">❌ No</td>
                <td className="text-center py-2 px-3 text-neutral-400">Extremely skewed left</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-neutral-700/50 rounded-lg">
          <p className="text-sm text-neutral-300">
            <strong>Key Insight:</strong> The distribution shape depends on both n and p. When p is near 0.5, 
            we get symmetry with smaller n. When p is extreme (near 0 or 1), we need much larger n to achieve normality.
          </p>
        </div>
      </div>
      
      {/* What Happens When Conditions Fail */}
      <InterpretationBox title="What Happens When Conditions Aren't Met?" theme="red">
        <p className="mb-3">
          When np &lt; 10 or n(1-p) &lt; 10, the normal approximation becomes unreliable:
        </p>
        <ul className="space-y-2 ml-4">
          <li>• <span className="text-red-400">Confidence intervals become inaccurate</span> (may not achieve stated coverage)</li>
          <li>• <span className="text-red-400">Hypothesis tests have wrong Type I error rates</span></li>
          <li>• <span className="text-red-400">The distribution is too skewed</span> for the symmetric normal curve</li>
        </ul>
        <p className="mt-3 text-yellow-400">
          <strong>Solution:</strong> Use exact binomial methods or other alternatives like the Wilson score interval.
        </p>
      </InterpretationBox>
    </div>
  );
});

// Normal Approximation Validator
const NormalApproximationValidator = React.memo(function NormalApproximationValidator() {
  const [n, setN] = useState(110);
  const [p, setP] = useState(0.40);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // Check conditions
  const np = n * p;
  const nq = n * (1 - p);
  const conditionsMet = np >= 10 && nq >= 10;
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Get actual container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const width = Math.min(containerWidth, 500);
    const height = 220;
    const margin = { top: 35, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Set SVG dimensions and viewBox for proper scaling
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Normal approximation parameters
    const mean = p;
    const stdDev = Math.sqrt(p * (1 - p) / n);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    // Calculate max density for better scaling
    const maxDensity = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 1.1; // Add 10% padding
    
    const y = d3.scaleLinear()
      .domain([0, maxDensity])
      .range([innerHeight, 0]);
    
    // Generate normal curve data
    const normalData = d3.range(0, 1.01, 0.01).map(x => {
      const z = (x - mean) / stdDev;
      const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      return { x, y: pdf };
    });
    
    // Area under curve gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stop-opacity", 0);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stop-opacity", 0.3);
    
    // Area path
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);
    
    // Line
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", conditionsMet ? "#10b981" : "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
      
    g.select("g:last-child")
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 25)
      .attr("fill", "#e5e5e5")
      .style("text-anchor", "middle")
      .text("Proportion");
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(4))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
      
    g.select("g:last-child")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -28)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e5e5")
      .style("text-anchor", "middle")
      .text("Density");
    
    // Add mean line
    g.append("line")
      .attr("x1", x(mean))
      .attr("x2", x(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Mean label
    g.append("text")
      .attr("x", x(mean))
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .text(`p = ${p.toFixed(2)}`);
    
  }, [n, p, conditionsMet]);
  
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-2" style={{ fontSize: typography.h3 }}>
        Interactive Visualization: See How n and p Affect the Distribution
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <ControlGroup>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Sample Size (n): {n}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                True Proportion (p): {p.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-0.5">
                <span>Rare</span>
                <span>p = {p.toFixed(2)}</span>
                <span>Common</span>
              </div>
            </div>
          </ControlGroup>
          
          <div
            className={`p-3 rounded-lg border ${
              conditionsMet
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }`}
            animate={{
              borderColor: conditionsMet ? '#22c55e50' : '#ef444450'
            }}
          >
            <h4 className={`font-medium mb-1.5 flex items-center gap-1.5 text-sm ${
              conditionsMet ? 'text-green-400' : 'text-red-400'
            }`}>
              {conditionsMet ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {conditionsMet ? 'Conditions Met' : 'Conditions Not Met'}
            </h4>
            
            <div className="space-y-0.5 text-xs">
              <div className={`flex justify-between ${
                np >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>np = {np.toFixed(1)}</span>
                <span>{np >= 10 ? '≥' : '<'} 10 {np >= 10 ? '✓' : '✗'}</span>
              </div>
              <div className={`flex justify-between ${
                nq >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>n(1-p) = {nq.toFixed(1)}</span>
                <span>{nq >= 10 ? '≥' : '<'} 10 {nq >= 10 ? '✓' : '✗'}</span>
              </div>
            </div>
            
            {!conditionsMet && (
              <p className="text-xs text-neutral-400 mt-2">
                Use exact binomial methods instead.
              </p>
            )}
          </div>
        </div>
        
        <div ref={containerRef}>
          <GraphContainer height="220px">
            <svg ref={svgRef} className="w-full" style={{ height: '220px' }} />
          </GraphContainer>
          
          <div className="mt-2 p-3 bg-neutral-800/50 rounded-lg">
            <p className="text-xs text-neutral-400 mb-1">Key Insights:</p>
            <ul className="space-y-0.5 text-xs text-neutral-300">
              <li>• Extreme p values (near 0 or 1) need larger n</li>
              <li>• p = 0.5 needs smallest sample size</li>
              <li>• SE = √(p(1-p)/n) is largest when p = 0.5</li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Interactive CI Builder
const ProportionCIBuilder = React.memo(function ProportionCIBuilder() {
  const [inputs, setInputs] = useState({
    n: 1000,
    x: 493,
    confidence: 95
  });
  
  const [mode, setMode] = useState('count'); // count or proportion
  const [showSteps, setShowSteps] = useState(false);
  const contentRef = useRef(null);
  
  // Calculations
  const pHat = inputs.x / inputs.n;
  const q = 1 - pHat;
  const z = getZCritical(inputs.confidence);
  const se = Math.sqrt(pHat * q / inputs.n);
  const margin = z * se;
  
  // Wald interval (standard)
  const waldLower = Math.max(0, pHat - margin);
  const waldUpper = Math.min(1, pHat + margin);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    if (showSteps) {
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [showSteps, inputs]);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white" style={{ fontSize: typography.h2 }}>
          Proportion Confidence Interval Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('count')}
            className={`px-4 py-2 rounded ${
              mode === 'count' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Count Input
          </button>
          <button
            onClick={() => setMode('proportion')}
            className={`px-4 py-2 rounded ${
              mode === 'proportion' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Proportion Input
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sample Size (n)
          </label>
          <input
            type="number"
            value={inputs.n}
            onChange={(e) => setInputs({...inputs, n: Math.max(1, Number(e.target.value))})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
            min="1"
          />
        </div>
        
        {mode === 'count' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Success Count (x)
            </label>
            <input
              type="number"
              value={inputs.x}
              onChange={(e) => setInputs({
                ...inputs, 
                x: Math.max(0, Math.min(inputs.n, Number(e.target.value)))
              })}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max={inputs.n}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Proportion (p̂)
            </label>
            <input
              type="number"
              value={pHat.toFixed(3)}
              onChange={(e) => {
                const newP = Math.max(0, Math.min(1, Number(e.target.value)));
                setInputs({...inputs, x: Math.round(newP * inputs.n)});
              }}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max="1"
              step="0.001"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Level
          </label>
          <select
            value={inputs.confidence}
            onChange={(e) => setInputs({...inputs, confidence: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={98}>98%</option>
            <option value={99}>99%</option>
          </select>
        </div>
      </div>
      
      {/* Condition Check */}
      <div className="mb-6">
        <ConditionCheckPanel n={inputs.n} pHat={pHat} />
      </div>
      
      {/* Results */}
      <div
        style={{
          background: `linear-gradient(to bottom right, ${colorScheme.primary}40, #262626)`
        }}
        className="rounded-xl p-6 border border-purple-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        key={`${inputs.n}-${inputs.x}-${inputs.confidence}`}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-neutral-400 mb-2">
            {inputs.confidence}% Confidence Interval for p
          </p>
          <p className="text-3xl font-mono text-purple-400">
            [{(waldLower * 100).toFixed(1)}%, {(waldUpper * 100).toFixed(1)}%]
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Point estimate: p̂ = {(pHat * 100).toFixed(1)}%
          </p>
        </div>
        
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full py-2 text-sm text-purple-400 hover:text-purple-300"
        >
          {showSteps ? 'Hide' : 'Show'} Calculation Steps
        </button>
        
        <div>
          {showSteps && (
            <div
              ref={contentRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm"
            >
              <p>1. <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = \\frac{x}{n} = \\frac{${inputs.x}}{${inputs.n}} = ${pHat.toFixed(4)}\\)` }} /></p>
              <p>2. <span dangerouslySetInnerHTML={{ __html: `\\(SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{${pHat.toFixed(3)} \\times ${q.toFixed(3)}}{${inputs.n}}}\\)` }} /></p>
              <p>   <span dangerouslySetInnerHTML={{ __html: `\\(SE = ${se.toFixed(4)}\\)` }} /></p>
              <p>3. <span dangerouslySetInnerHTML={{ __html: `\\(z_{${inputs.confidence}\\%} = ${z.toFixed(3)}\\)` }} /></p>
              <p>4. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Margin} = z \\times SE = ${z.toFixed(3)} \\times ${se.toFixed(4)} = ${margin.toFixed(4)}\\)` }} /></p>
              <p>5. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{CI} = \\hat{p} \\pm \\text{margin} = ${pHat.toFixed(4)} \\pm ${margin.toFixed(4)}\\)` }} /></p>
              <p>6. <span dangerouslySetInnerHTML={{ __html: `\\(\\text{CI} = [${waldLower.toFixed(4)}, ${waldUpper.toFixed(4)}]\\)` }} /></p>
            </div>
          )}
        </div>
      </div>
    </VisualizationSection>
  );
});

// Condition Check Panel
const ConditionCheckPanel = ({ n, pHat }) => {
  const np = n * pHat;
  const nq = n * (1 - pHat);
  const conditionsMet = np >= 10 && nq >= 10;
  
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        conditionsMet
          ? 'bg-green-900/20 border-green-500/50'
          : 'bg-red-900/20 border-red-500/50'
      }`}
      animate={{
        borderColor: conditionsMet ? '#22c55e50' : '#ef444450'
      }}
    >
      <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
        conditionsMet ? 'text-green-400' : 'text-red-400'
      }`}>
        {conditionsMet ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        Normal Approximation Check
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className={np >= 10 ? 'text-green-400' : 'text-red-400'}>
          np̂ = {n} × {pHat.toFixed(3)} = {np.toFixed(1)} {np >= 10 ? '≥' : '<'} 10
        </div>
        <div className={nq >= 10 ? 'text-green-400' : 'text-red-400'}>
          n(1-p̂) = {n} × {(1-pHat).toFixed(3)} = {nq.toFixed(1)} {nq >= 10 ? '≥' : '<'} 10
        </div>
      </div>
    </div>
  );
};

// Sample Size Calculator Section
const SampleSizeCalculator = React.memo(function SampleSizeCalculator() {
  const [inputs, setInputs] = useState({
    confidence: 95,
    marginError: 0.03,
    pEstimate: 0.5,
    useConservative: true
  });
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
  }, [inputs]);
  
  // Calculate required sample size
  const z = getZCritical(inputs.confidence);
  const p = inputs.useConservative ? 0.5 : inputs.pEstimate;
  const q = 1 - p;
  const n = Math.ceil((z * z * p * q) / (inputs.marginError * inputs.marginError));
  
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-6" style={{ fontSize: typography.h2 }}>
        Sample Size Determination
      </h3>
      
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-6 border border-blue-500/30 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Calculator className="w-6 h-6 text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">
              Planning Your Study
            </h4>
            <p className="text-sm text-neutral-300">
              How many observations do you need to achieve your desired margin of error?
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ControlGroup>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confidence Level
              </label>
              <select
                value={inputs.confidence}
                onChange={(e) => setInputs({...inputs, confidence: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              >
                <option value={90}>90% (z = 1.645)</option>
                <option value={95}>95% (z = 1.96)</option>
                <option value={98}>98% (z = 2.326)</option>
                <option value={99}>99% (z = 2.576)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Desired Margin of Error: ±{(inputs.marginError * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.005"
                max="0.1"
                step="0.005"
                value={inputs.marginError}
                onChange={(e) => setInputs({...inputs, marginError: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>±0.5%</span>
                <span>±{(inputs.marginError * 100).toFixed(1)}%</span>
                <span>±10%</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Proportion Estimate
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inputs.useConservative}
                    onChange={(e) => setInputs({...inputs, useConservative: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-neutral-400">Use conservative (p = 0.5)</span>
                </label>
              </div>
              
              {!inputs.useConservative && (
                <div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={inputs.pEstimate}
                    onChange={(e) => setInputs({...inputs, pEstimate: Number(e.target.value)})}
                    className="w-full"
                    disabled={inputs.useConservative}
                  />
                  <div className="text-center text-sm text-neutral-400 mt-1">
                    p = {inputs.pEstimate.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </ControlGroup>
        </div>
        
        <div>
          <div ref={contentRef} className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
            <h4 className="font-semibold text-purple-400 mb-4">
              Required Sample Size
            </h4>
            
            <div className="text-center">
              <div className="text-5xl font-mono text-white mb-4">
                n = {n.toLocaleString()}
              </div>
              
              <div className="bg-neutral-900/50 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-purple-400 mb-2">
                  Formula:
                </p>
                <div className="text-center mb-3">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[n = \\left(\\frac{z_{\\alpha/2}^2 \\cdot p(1-p)}{E^2}\\right)\\]` 
                  }} />
                </div>
                
                <p className="text-sm font-semibold text-purple-400 mb-2">
                  Calculation:
                </p>
                <div className="text-sm space-y-1 font-mono">
                  <p>z = {z.toFixed(3)}</p>
                  <p>p = {p.toFixed(2)}, q = {q.toFixed(2)}</p>
                  <p>E = {inputs.marginError.toFixed(3)}</p>
                  <p>n = ({z.toFixed(3)})² × {p.toFixed(2)} × {q.toFixed(2)} / ({inputs.marginError.toFixed(3)})²</p>
                  <p className="text-purple-400 font-semibold">n = {n}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
            <p className="text-sm font-semibold text-amber-400 mb-2">
              💡 Key Insights:
            </p>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>• p = 0.5 gives the largest sample size (most conservative)</li>
              <li>• Halving the margin of error quadruples the sample size</li>
              <li>• Higher confidence requires larger samples</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Common Sample Sizes Reference */}
      <div className="mt-6 bg-neutral-800 rounded-lg p-6">
        <h4 className="font-semibold text-white mb-4">
          Common Sample Sizes for Polls
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
            <p className="text-sm text-neutral-400 mb-1">National Poll</p>
            <p className="text-2xl font-mono text-blue-400">n = 1,067</p>
            <p className="text-xs text-neutral-500">95% CI, ±3%</p>
          </div>
          <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
            <p className="text-sm text-neutral-400 mb-1">State Poll</p>
            <p className="text-2xl font-mono text-purple-400">n = 600</p>
            <p className="text-xs text-neutral-500">95% CI, ±4%</p>
          </div>
          <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
            <p className="text-sm text-neutral-400 mb-1">Quick Survey</p>
            <p className="text-2xl font-mono text-emerald-400">n = 385</p>
            <p className="text-xs text-neutral-500">95% CI, ±5%</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Scenario Explorer
const ScenarioExplorer = React.memo(function ScenarioExplorer() {
  const [selectedScenario, setSelectedScenario] = useState('election');
  
  const scenarios = {
    election: {
      title: 'Political Polling',
      icon: Vote,
      color: '#a855f7',
      description: 'Predicting election outcomes',
      examples: [
        { name: 'Presidential Race', n: 2000, p: 0.52, context: 'National poll' },
        { name: 'Local Election', n: 500, p: 0.48, context: 'City council' },
        { name: 'Exit Poll', n: 1500, p: 0.55, context: 'Election day' }
      ],
      insights: [
        'Margin of error typically ±3% for n=1000',
        'Watch for "statistical ties"',
        'Consider likely voter screens'
      ]
    },
    quality: {
      title: 'Quality Control',
      icon: CheckCircle,
      color: '#10b981',
      description: 'Manufacturing defect rates',
      examples: [
        { name: 'Electronics', n: 1000, p: 0.02, context: 'Defect rate' },
        { name: 'Pharmaceuticals', n: 10000, p: 0.001, context: 'Critical defects' },
        { name: 'Food Safety', n: 500, p: 0.05, context: 'Contamination' }
      ],
      insights: [
        'Small p requires large n',
        'Zero defects ≠ zero defect rate',
        'Consider sequential sampling'
      ]
    },
    medical: {
      title: 'Medical Studies',
      icon: Heart,
      color: '#ef4444',
      description: 'Treatment success rates',
      examples: [
        { name: 'Drug Efficacy', n: 300, p: 0.75, context: 'Response rate' },
        { name: 'Side Effects', n: 1000, p: 0.15, context: 'Adverse events' },
        { name: 'Vaccine Trial', n: 5000, p: 0.95, context: 'Protection rate' }
      ],
      insights: [
        'Clinical vs. statistical significance',
        'Number needed to treat (NNT)',
        'Consider confidence level carefully'
      ]
    },
    marketing: {
      title: 'A/B Testing',
      icon: TrendingUp,
      color: '#3b82f6',
      description: 'Conversion rate optimization',
      examples: [
        { name: 'Email Campaign', n: 5000, p: 0.23, context: 'Click rate' },
        { name: 'Landing Page', n: 2000, p: 0.08, context: 'Conversion' },
        { name: 'App Feature', n: 10000, p: 0.45, context: 'Adoption rate' }
      ],
      insights: [
        'Effect size matters more than p-value',
        'Consider practical significance',
        'Account for multiple comparisons'
      ]
    }
  };
  
  const scenario = scenarios[selectedScenario];
  
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-6" style={{ fontSize: typography.h2 }}>
        Real-World Applications
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => {
          const Icon = scen.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-current'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              style={{
                borderColor: selectedScenario === key ? scen.color : undefined,
                backgroundColor: selectedScenario === key 
                  ? `${scen.color}15` 
                  : 'rgb(38 38 38)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" style={{
                color: selectedScenario === key ? scen.color : '#e5e5e5'
              }} />
              <p className="text-xs font-medium">{scen.title}</p>
            </button>
          );
        })}
      </div>
      
      <div
        key={selectedScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-neutral-800 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-2" style={{ color: scenario.color }}>
            {scenario.title}: {scenario.description}
          </h4>
          
          <div className="mt-4 space-y-3">
            {scenario.examples.map((example, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-900/50 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{example.name}</p>
                  <p className="text-sm text-neutral-400">{example.context}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">n = {example.n.toLocaleString()}</p>
                  <p className="font-mono text-sm" style={{ color: scenario.color }}>
                    p = {(example.p * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-3">
            Important Considerations
          </h5>
          <ul className="space-y-2">
            {scenario.insights.map((insight, idx) => (
              <li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5"
                     style={{ backgroundColor: scenario.color }} />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Exam Practice Problems Section
const ExamPracticeProblems = React.memo(function ExamPracticeProblems() {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
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
  }, [currentProblem, showSolution]);
  
  const problems = [
    {
      id: 1,
      difficulty: "Easy",
      points: 10,
      examFrequency: "85%",
      question: "A quality control inspector randomly samples 200 circuit boards and finds 8 defective. Construct a 95% confidence interval for the true proportion of defective boards.",
      data: { n: 200, x: 8, confidence: 95 },
      solution: {
        pHat: 0.04,
        se: 0.0139,
        z: 1.96,
        margin: 0.0272,
        lower: 0.0128,
        upper: 0.0672,
        steps: [
          "Calculate sample proportion: p̂ = 8/200 = 0.04",
          "Check conditions: np̂ = 200(0.04) = 8 < 10 ❌",
          "Warning: Normal approximation may not be appropriate!",
          "SE = √[0.04(0.96)/200] = 0.0139",
          "Margin = 1.96 × 0.0139 = 0.0272",
          "CI: 0.04 ± 0.0272 = [0.0128, 0.0672]",
          "Or: [1.28%, 6.72%]"
        ]
      }
    },
    {
      id: 2,
      difficulty: "Medium",
      points: 15,
      examFrequency: "70%",
      question: "A university survey of 1500 students shows 1125 support extending library hours. Find a 99% confidence interval for the true proportion of all students who support this change.",
      data: { n: 1500, x: 1125, confidence: 99 },
      solution: {
        pHat: 0.75,
        se: 0.0112,
        z: 2.576,
        margin: 0.0288,
        lower: 0.7212,
        upper: 0.7788,
        steps: [
          "Calculate sample proportion: p̂ = 1125/1500 = 0.75",
          "Check conditions: np̂ = 1125 ≥ 10 ✓, n(1-p̂) = 375 ≥ 10 ✓",
          "SE = √[0.75(0.25)/1500] = 0.0112",
          "For 99% CI, z = 2.576",
          "Margin = 2.576 × 0.0112 = 0.0288",
          "CI: 0.75 ± 0.0288 = [0.7212, 0.7788]",
          "Or: [72.12%, 77.88%]"
        ]
      }
    },
    {
      id: 3,
      difficulty: "Hard",
      points: 20,
      examFrequency: "40%",
      question: "A medical trial tests a new treatment on 80 patients, with 68 showing improvement. (a) Construct a 95% CI for the success rate. (b) The old treatment has a 75% success rate. Based on your CI, is the new treatment significantly better?",
      data: { n: 80, x: 68, confidence: 95 },
      solution: {
        pHat: 0.85,
        se: 0.0399,
        z: 1.96,
        margin: 0.0782,
        lower: 0.7718,
        upper: 0.9282,
        steps: [
          "Part (a): Calculate sample proportion: p̂ = 68/80 = 0.85",
          "Check conditions: np̂ = 68 ≥ 10 ✓, n(1-p̂) = 12 ≥ 10 ✓",
          "SE = √[0.85(0.15)/80] = 0.0399",
          "Margin = 1.96 × 0.0399 = 0.0782",
          "CI: 0.85 ± 0.0782 = [0.7718, 0.9282]",
          "Or: [77.18%, 92.82%]",
          "Part (b): Old treatment rate (75%) is below the CI lower bound",
          "Conclusion: Yes, new treatment is significantly better at α = 0.05"
        ]
      }
    }
  ];
  
  const problem = problems[currentProblem];
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white" style={{ fontSize: typography.h2 }}>
          Exam Practice Problems
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            Problem {currentProblem + 1} of {problems.length}
          </span>
          <div className="flex gap-2">
            {problems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentProblem(idx);
                  setShowSolution(false);
                }}
                className="w-8 h-8 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: idx === currentProblem ? colorScheme.primary : '#374151',
                  color: idx === currentProblem ? 'white' : '#d1d5db',
                  transform: idx === currentProblem ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: idx === currentProblem ? `0 0 15px ${colorScheme.primary}4D` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (idx !== currentProblem) {
                    e.target.style.backgroundColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentProblem) {
                    e.target.style.backgroundColor = '#374151';
                  }
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div
        key={problem.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Problem Header */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: problem.difficulty === 'Easy' ? `${colorScheme.chart.success}30` :
                                  problem.difficulty === 'Medium' ? `${colorScheme.secondary}30` :
                                  `${colorScheme.chart.error}30`,
                  color: problem.difficulty === 'Easy' ? colorScheme.chart.success :
                         problem.difficulty === 'Medium' ? colorScheme.secondary :
                         colorScheme.chart.error
                }}>
                {problem.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                {problem.points} points
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Appears on {problem.examFrequency} of exams</span>
            </div>
          </div>
          
          <p className="text-white">{problem.question}</p>
        </div>
        
        {/* Your Work Space */}
        {!showSolution && (
          <div className="bg-neutral-800 rounded-lg p-6">
            <h4 className="font-semibold text-white mb-4">Your Work Space</h4>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Sample Proportion (p̂)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full px-3 py-2 bg-neutral-700 rounded text-white"
                    placeholder="Calculate p̂..."
                    onChange={(e) => setUserAnswers({
                      ...userAnswers,
                      [`${problem.id}_phat`]: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Standard Error
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-3 py-2 bg-neutral-700 rounded text-white"
                    placeholder="Calculate SE..."
                    onChange={(e) => setUserAnswers({
                      ...userAnswers,
                      [`${problem.id}_se`]: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Lower Bound
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-3 py-2 bg-neutral-700 rounded text-white"
                    placeholder="CI lower bound..."
                    onChange={(e) => setUserAnswers({
                      ...userAnswers,
                      [`${problem.id}_lower`]: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Upper Bound
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-3 py-2 bg-neutral-700 rounded text-white"
                    placeholder="CI upper bound..."
                    onChange={(e) => setUserAnswers({
                      ...userAnswers,
                      [`${problem.id}_upper`]: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <button
                onClick={() => setShowSolution(true)}
                className="w-full py-3 text-white rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: colorScheme.primary
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = `0 0 30px ${colorScheme.primary}80`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Show Solution
              </button>
            </div>
          </div>
        )}
        
        {/* Solution */}
        {showSolution && (
          <div
            ref={contentRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6 border border-emerald-500/30"
          >
            <h4 className="font-semibold text-emerald-400 mb-4">
              Complete Solution
            </h4>
            
            <div className="space-y-3">
              {problem.solution.steps.map((step, idx) => (
                <div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-emerald-400 font-mono">
                    {idx + 1}.
                  </span>
                  <span className="text-neutral-200">
                    {step}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
              <p className="text-sm font-semibold text-emerald-400 mb-2">
                Final Answer:
              </p>
              <p className="font-mono text-white">
                {problem.confidence}% CI: [{(problem.solution.lower * 100).toFixed(2)}%, {(problem.solution.upper * 100).toFixed(2)}%]
              </p>
            </div>
            
            {/* Exam Tips */}
            <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
              <p className="text-sm font-semibold text-amber-400 mb-1">
                💡 Exam Tip:
              </p>
              <p className="text-sm text-neutral-300">
                Always check the normal approximation conditions first! If they fail, 
                mention it in your answer for partial credit.
              </p>
            </div>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Common Mistakes Section
const CommonMistakes = React.memo(function CommonMistakes() {
  return (
    <VisualizationSection>
      <h3 className="font-bold text-white mb-4" style={{ fontSize: typography.h2 }}>
        Common Mistakes to Avoid
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4 border" style={{
          backgroundColor: `${colorScheme.chart.error}30`,
          borderColor: `${colorScheme.chart.error}50`
        }}>
          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: colorScheme.chart.error }}>
            <XCircle className="w-5 h-5" />
            Using p instead of p̂
          </h4>
          <p className="text-sm text-neutral-300 mb-2">
            We don't know the true proportion p! Always use the sample proportion p̂ 
            in the standard error calculation.
          </p>
          <div className="bg-neutral-900 rounded p-2 text-center font-mono text-sm">
            <span className="line-through" style={{ color: colorScheme.chart.error }}>√(p(1-p)/n)</span>
            <span className="ml-3" style={{ color: colorScheme.chart.success }}>√(p̂(1-p̂)/n)</span>
          </div>
        </div>
        
        <div className="rounded-lg p-4 border" style={{
          backgroundColor: `${colorScheme.chart.error}30`,
          borderColor: `${colorScheme.chart.error}50`
        }}>
          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: colorScheme.chart.error }}>
            <XCircle className="w-5 h-5" />
            Ignoring np ≥ 10 rule
          </h4>
          <p className="text-sm text-neutral-300">
            The normal approximation requires both np ≥ 10 AND n(1-p) ≥ 10. 
            For small samples or extreme proportions, use exact binomial methods.
          </p>
        </div>
        
        <div className="rounded-lg p-4 border" style={{
          backgroundColor: `${colorScheme.chart.error}30`,
          borderColor: `${colorScheme.chart.error}50`
        }}>
          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: colorScheme.chart.error }}>
            <XCircle className="w-5 h-5" />
            Misinterpreting overlapping CIs
          </h4>
          <p className="text-sm text-neutral-300">
            Overlapping confidence intervals suggest no significant difference, 
            but formal hypothesis testing is needed for conclusions.
          </p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            CI extending beyond [0,1]
          </h4>
          <p className="text-sm text-neutral-300">
            Proportions must be between 0 and 1. If your CI extends beyond these 
            bounds, truncate at 0 or 1, or use better methods (Wilson).
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Takeaways
// Learning Path Navigation Component
const LearningPathNavigation = React.memo(function LearningPathNavigation({ mode, onModeChange }) {
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
                    ? 'bg-gradient-to-br border-current' 
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
                  {value === LEARNING_MODES.FOUNDATIONS && "Mathematical theory and validation"}
                  {value === LEARNING_MODES.EXAMPLES && "Introduction and real-world examples"}
                  {value === LEARNING_MODES.PRACTICE && "Interactive practice and applications"}
                </p>
              </button>
            );
          })}
        </div>
      </VisualizationSection>
    </div>
  );
});

const KeyTakeaways = React.memo(function KeyTakeaways() {
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
    <div ref={contentRef} className="mt-8 bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">
        Key Takeaways
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            The Formula
          </h4>
          <div className="bg-neutral-900 rounded p-4 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{P}(1-\\hat{P})}{n}}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-400 mt-2">
            Remember: Use <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} />, not p, in the SE calculation!
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            When to Use
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Binary outcomes (success/failure)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Large enough sample (np ≥ 10, n(1-p) ≥ 10)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Independent observations</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
        <p className="text-sm text-yellow-300">
          <strong>Remember the Election Example:</strong> A 4-point lead in polls 
          doesn't guarantee victory if the confidence intervals overlap!
        </p>
      </div>
    </div>
  );
});

// Main Component
export default function ProportionConfidenceInterval() {
  const [mode, setMode] = useState(LEARNING_MODES.FOUNDATIONS);
  
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <VisualizationContainer
        title="5.5 Proportion Confidence Intervals"
        description="From polls to population proportions"
      >
      <BackToHub chapter={5} />
      
      <LearningPathNavigation 
        mode={mode} 
        onModeChange={setMode}
      />
      
      {/* FOUNDATIONS Mode */}
      <div style={{ display: mode === LEARNING_MODES.FOUNDATIONS ? 'block' : 'none' }}>
        <div className="space-y-8">
          <MathematicalFoundations />
          <NormalApproximationTheory />
          <NormalApproximationValidator />
        </div>
      </div>
      
      {/* EXAMPLES Mode */}
      <div style={{ display: mode === LEARNING_MODES.EXAMPLES ? 'block' : 'none' }}>
        {/* Conceptual Introduction */}
        <div className="mb-6 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-700/50">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Why Proportions Are Different</h2>
          <div className="space-y-4 text-neutral-300">
            <p>
              So far, we've built confidence intervals for means. But what about proportions – percentages, rates, and probabilities? 
              <span className="text-purple-400 font-semibold"> These require special treatment because they're bounded between 0 and 1.</span>
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Examples of Proportions</h3>
                <ul className="text-sm space-y-1">
                  <li>• Percentage voting for a candidate</li>
                  <li>• Product defect rate</li>
                  <li>• Drug effectiveness rate</li>
                  <li>• Customer satisfaction percentage</li>
                  <li>• Pass rate on an exam</li>
                </ul>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-2">Why They're Special</h3>
                <ul className="text-sm space-y-1">
                  <li>• Can't go below 0% or above 100%</li>
                  <li>• Variance depends on the proportion itself</li>
                  <li>• Extreme values (near 0 or 1) behave oddly</li>
                  <li>• Standard methods fail at boundaries</li>
                </ul>
              </div>
            </div>
            <p className="text-sm italic text-neutral-400">
              This section teaches you to handle these unique challenges properly.
            </p>
          </div>
        </div>
        
        <div className="space-y-8">
          <ProportionIntroduction />
          <ElectionStory 
            onComplete={() => {
              // No longer needed - removed navigation
            }}
          />
        </div>
      </div>
      
      {/* PRACTICE Mode */}
      <div style={{ display: mode === LEARNING_MODES.PRACTICE ? 'block' : 'none' }}>
        <div className="space-y-8">
          <ProportionCIBuilder />
          <ExamPracticeProblems />
          <SampleSizeCalculator />
          <ScenarioExplorer />
          <CommonMistakes />
          <KeyTakeaways />
        </div>
      </div>
      
      {/* Section Complete - Standardized Component */}
      <SectionComplete chapter={5} />
      </VisualizationContainer>
    </>
  );
}
