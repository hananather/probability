"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { BookOpen, Code, FileText, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { QuizBreak } from '../mdx/QuizBreak';
import { Chapter5ReferenceSheet } from '../reference-sheets/Chapter5ReferenceSheet';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Chapter 7-style tab sections
const TAB_SECTIONS = {
  FOUNDATIONS: 'foundations',
  WORKED_EXAMPLES: 'worked',
  QUICK_REFERENCE: 'reference',
  INTERACTIVE: 'interactive'
};

// Helper function for quantile calculation
const quantileNormal = (p) => {
  const a1 = -39.69683028665376;
  const a2 = 220.9460984245205;
  const a3 = -275.9285104469687;
  const a4 = 138.3577518672690;
  const a5 = -30.66479806614716;
  const a6 = 2.506628277459239;
  const b1 = -54.47609879822406;
  const b2 = 161.5858368580409;
  const b3 = -155.6989798598866;
  const b4 = 66.80131188771972;
  const b5 = -13.28068155288572;
  const c1 = -0.007784894002430293;
  const c2 = -0.3223964580411365;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;
  const d1 = 0.007784695709041462;
  const d2 = 0.3224671290700398;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;
  
  const p_low = 0.02425;
  const p_high = 1 - p_low;
  
  let q, r;
  if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
};

// Foundations Tab Content
const FoundationsContent = React.memo(function FoundationsContent() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Common Mistakes Section */}
      <div className="bg-neutral-900/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-red-400 mb-4">Common Mistakes to Avoid</h3>
        <div className="space-y-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
            <h4 className="font-semibold text-red-400 mb-2">Mistake #1: Wrong Interpretation</h4>
            <p className="text-sm text-neutral-300 mb-2">
              <span className="text-red-400">❌ Wrong:</span> "There's a 95% chance the true mean is in this interval"
            </p>
            <p className="text-sm text-neutral-300">
              <span className="text-green-400">✓ Correct:</span> "95% of such intervals will contain the true mean"
            </p>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
            <h4 className="font-semibold text-red-400 mb-2">Mistake #2: Using Wrong Distribution</h4>
            <p className="text-sm text-neutral-300 mb-2">
              <span className="text-red-400">❌ Wrong:</span> Using z when σ is unknown
            </p>
            <p className="text-sm text-neutral-300">
              <span className="text-green-400">✓ Correct:</span> Use t-distribution when σ is unknown
            </p>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
            <h4 className="font-semibold text-red-400 mb-2">Mistake #3: Confusing CI Width</h4>
            <p className="text-sm text-neutral-300 mb-2">
              <span className="text-red-400">❌ Wrong:</span> "99% CI is narrower than 95% CI"
            </p>
            <p className="text-sm text-neutral-300">
              <span className="text-green-400">✓ Correct:</span> Higher confidence = wider interval
            </p>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
            <h4 className="font-semibold text-red-400 mb-2">Mistake #4: Forgetting Assumptions</h4>
            <p className="text-sm text-neutral-300 mb-2">
              <span className="text-red-400">❌ Wrong:</span> Using CI without checking normality for small samples
            </p>
            <p className="text-sm text-neutral-300">
              <span className="text-green-400">✓ Correct:</span> Verify normality when n &lt; 30
            </p>
          </div>
        </div>
      </div>
      
      {/* Key Concepts Review */}
      <div className="bg-neutral-900/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-teal-400 mb-4">Essential Concepts Review</h3>
        <div className="space-y-3">
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-semibold text-white mb-2">Interpretation</h4>
            <p className="text-sm text-neutral-300">
              A 95% CI means that if we repeated the sampling process many times,
              approximately 95% of the resulting intervals would contain the true population parameter.
            </p>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-semibold text-white mb-2">Width Factors</h4>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>• ↑ Sample size (n) → ↓ Width (narrower CI)</li>
              <li>• ↑ Confidence level → ↑ Width (wider CI)</li>
              <li>• ↑ Population SD (σ) → ↑ Width (wider CI)</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-semibold text-white mb-2">When to Use Z vs T</h4>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>• Use Z: σ known, any sample size</li>
              <li>• Use T: σ unknown (using s), especially for n &lt; 30</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

// Worked Examples Tab Content
const WorkedExamplesContent = React.memo(function WorkedExamplesContent() {
  const contentRef = useRef(null);
  const [currentExample, setCurrentExample] = useState(0);
  
  const examples = [
    {
      title: "Manufacturing Quality Control",
      context: "A factory produces bolts with known σ = 0.5mm. Sample of n = 36 bolts has mean = 10.2mm.",
      question: "Find the 95% CI for the true mean bolt diameter.",
      solution: {
        steps: [
          { label: "Identify values", value: "x̄ = 10.2, σ = 0.5, n = 36, α = 0.05" },
          { label: "Find critical value", value: "z₀.₀₂₅ = 1.96" },
          { label: "Calculate SE", value: "SE = 0.5/√36 = 0.0833" },
          { label: "Calculate margin", value: "ME = 1.96 × 0.0833 = 0.163" },
          { label: "Final CI", value: "[10.037, 10.363] mm" }
        ]
      }
    },
    {
      title: "Medical Research",
      context: "Blood pressure study: σ = 12 mmHg, n = 100 patients, x̄ = 125 mmHg.",
      question: "Find the 99% CI for mean blood pressure.",
      solution: {
        steps: [
          { label: "Identify values", value: "x̄ = 125, σ = 12, n = 100, α = 0.01" },
          { label: "Find critical value", value: "z₀.₀₀₅ = 2.576" },
          { label: "Calculate SE", value: "SE = 12/√100 = 1.2" },
          { label: "Calculate margin", value: "ME = 2.576 × 1.2 = 3.09" },
          { label: "Final CI", value: "[121.91, 128.09] mmHg" }
        ]
      }
    },
    {
      title: "Market Research",
      context: "Customer satisfaction scores: σ = 15 points, n = 64 customers, x̄ = 82 points.",
      question: "Find the 90% CI for the true mean satisfaction score.",
      solution: {
        steps: [
          { label: "Identify values", value: "x̄ = 82, σ = 15, n = 64, α = 0.10" },
          { label: "Find critical value", value: "z₀.₀₅ = 1.645" },
          { label: "Calculate SE", value: "SE = 15/√64 = 1.875" },
          { label: "Calculate margin", value: "ME = 1.645 × 1.875 = 3.08" },
          { label: "Final CI", value: "[78.92, 85.08] points" }
        ]
      }
    }
  ];
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [currentExample]);
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Example Selector */}
      <div className="flex gap-2 mb-4">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setCurrentExample(i)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              i === currentExample 
                ? 'bg-teal-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>
      
      {/* Current Example */}
      <div className="bg-neutral-900/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-teal-400 mb-4">
          Example: {examples[currentExample].title}
        </h3>
        
        <div className="space-y-4">
          <div className="bg-neutral-800/50 rounded p-4">
            <p className="text-sm text-neutral-400 mb-2">Context:</p>
            <p className="text-neutral-200">{examples[currentExample].context}</p>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <p className="text-sm text-neutral-400 mb-2">Question:</p>
            <p className="text-neutral-200 font-semibold">{examples[currentExample].question}</p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-neutral-400">Step-by-step solution:</p>
            {examples[currentExample].solution.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-neutral-800/50 rounded p-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <span className="text-teal-400 text-sm font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">{step.label}</p>
                  <p className="text-neutral-200 font-mono">{step.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
            <h4 className="font-bold text-teal-400 mb-2">Interpretation</h4>
            <p className="text-sm text-neutral-300">
              We are {currentExample === 0 ? '95%' : currentExample === 1 ? '99%' : '90%'} confident that the true population mean 
              lies within this interval. This means if we repeated this sampling process many times, 
              {currentExample === 0 ? ' 95%' : currentExample === 1 ? ' 99%' : ' 90%'} of the intervals would contain the true parameter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Quick Reference Tab Content
const QuickReferenceContent = React.memo(function QuickReferenceContent() {
  const contentRef = useRef(null);
  const [selectedSection, setSelectedSection] = useState('formulas');
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedSection]);
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedSection('formulas')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedSection === 'formulas'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Formula Card
        </button>
        <button
          onClick={() => setSelectedSection('summary')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedSection === 'summary'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Summary
        </button>
      </div>
      
      {/* Content based on selection */}
      {selectedSection === 'formulas' && (
        <div className="bg-neutral-900/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Formula Reference Card</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-semibold text-white mb-2">Basic CI Formula</h4>
                <div className="text-center my-3">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
              </div>
              
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-semibold text-white mb-2">Margin of Error</h4>
                <div className="text-center my-3">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[ME = z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-semibold text-white mb-2">Sample Size Formula</h4>
                <div className="text-center my-3">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{ME}\\right)^2\\]` 
                  }} />
                </div>
              </div>
              
              <div className="bg-neutral-800/50 rounded p-4">
                <h4 className="font-semibold text-white mb-2">Standard Error</h4>
                <div className="text-center my-3">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[SE = \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Critical Values Table */}
          <div className="mt-6 bg-neutral-800/50 rounded p-4">
            <h4 className="font-semibold text-white mb-3">Common Critical Values</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 text-neutral-400">Confidence Level</th>
                  <th className="text-center py-2 text-neutral-400">α</th>
                  <th className="text-center py-2 text-neutral-400">α/2</th>
                  <th className="text-right py-2 text-neutral-400">z<sub>α/2</sub></th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-neutral-800">
                  <td className="py-2">90%</td>
                  <td className="text-center">0.10</td>
                  <td className="text-center">0.05</td>
                  <td className="text-right font-mono">1.645</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="py-2">95%</td>
                  <td className="text-center">0.05</td>
                  <td className="text-center">0.025</td>
                  <td className="text-right font-mono">1.96</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="py-2">99%</td>
                  <td className="text-center">0.01</td>
                  <td className="text-center">0.005</td>
                  <td className="text-right font-mono">2.576</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedSection === 'summary' && (
        <div className="bg-neutral-900/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">📊 Quick Summary</h3>
          <div className="space-y-4">
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-semibold text-white mb-2">When to Use</h4>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Population standard deviation (σ) is known</li>
                <li>• Sample size is large (n ≥ 30) OR population is normal</li>
                <li>• Want to estimate population mean with uncertainty</li>
              </ul>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-semibold text-white mb-2">Key Steps</h4>
              <ol className="text-sm text-neutral-300 space-y-1">
                <li>1. Calculate sample mean (x̄)</li>
                <li>2. Determine confidence level and find z-value</li>
                <li>3. Calculate standard error (σ/√n)</li>
                <li>4. Find margin of error (z × SE)</li>
                <li>5. Construct interval (x̄ ± ME)</li>
              </ol>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-semibold text-white mb-2">Key Insights</h4>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Higher confidence → Wider interval</li>
                <li>• Larger sample → Narrower interval</li>
                <li>• More variability (σ) → Wider interval</li>
                <li>• To halve width: need 4× sample size</li>
              </ul>
            </div>
            
            <div className="bg-neutral-800/50 rounded p-4">
              <h4 className="font-semibold text-white mb-2">Interpretation Template</h4>
              <p className="text-sm text-neutral-300 italic">
                "We are C% confident that the true population mean lies between [lower, upper]"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Interactive Practice Tab Content
const InteractivePracticeContent = React.memo(function InteractivePracticeContent() {
  const [quizComplete, setQuizComplete] = useState(false);
  const [practiceMode, setPracticeMode] = useState('quiz'); // 'quiz' or 'calculator'
  
  const practiceQuestions = [
    {
      question: "A sample of 64 observations has mean 50 and σ = 8. What is the 95% CI?",
      options: [
        "[48.04, 51.96]",
        "[46.08, 53.92]", 
        "[49.02, 50.98]",
        "[47.00, 53.00]"
      ],
      correctIndex: 0,
      explanation: "SE = 8/√64 = 1, ME = 1.96 × 1 = 1.96, CI = 50 ± 1.96 = [48.04, 51.96]"
    },
    {
      question: "Which factor does NOT affect the width of a confidence interval?",
      options: [
        "Sample size (n)",
        "Population mean (μ)",
        "Confidence level",
        "Population standard deviation (σ)"
      ],
      correctIndex: 1,
      explanation: "The population mean μ doesn't affect CI width. Width depends on n, σ, and confidence level."
    },
    {
      question: "If we increase the confidence level from 95% to 99%, the interval will:",
      options: [
        "Become narrower",
        "Become wider",
        "Stay the same",
        "Cannot determine"
      ],
      correctIndex: 1,
      explanation: "Higher confidence requires a wider interval to be more certain of capturing the parameter."
    },
    {
      question: "To halve the width of a CI while keeping confidence level constant, sample size must:",
      options: [
        "Double",
        "Quadruple",
        "Be halved",
        "Stay the same"
      ],
      correctIndex: 1,
      explanation: "Width is proportional to 1/√n. To halve width, need √n to double, so n must quadruple."
    },
    {
      question: "A 90% CI is [45.2, 54.8]. What is the sample mean?",
      options: [
        "45.2",
        "50.0",
        "54.8",
        "9.6"
      ],
      correctIndex: 1,
      explanation: "The sample mean is at the center of the CI: (45.2 + 54.8) / 2 = 50.0"
    },
    {
      question: "If a 95% CI for μ is [10, 20], what is the margin of error?",
      options: [
        "5",
        "10",
        "15",
        "30"
      ],
      correctIndex: 0,
      explanation: "ME = (Upper - Lower) / 2 = (20 - 10) / 2 = 5"
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPracticeMode('quiz')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            practiceMode === 'quiz'
              ? 'bg-amber-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Practice Quiz
        </button>
        <button
          onClick={() => setPracticeMode('calculator')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            practiceMode === 'calculator'
              ? 'bg-amber-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Interactive Calculator
        </button>
      </div>
      
      {practiceMode === 'quiz' && (
        <div className="bg-neutral-900/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-amber-400 mb-4">Practice Problems</h3>
          
          <QuizBreak
            questions={practiceQuestions}
            onComplete={() => setQuizComplete(true)}
          />
          
          {quizComplete && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                ✓ Excellent work! You've completed the practice problems. 
                Review any concepts you found challenging or try the interactive calculator.
              </p>
            </div>
          )}
        </div>
      )}
      
      {practiceMode === 'calculator' && <InteractiveCalculator />}
    </div>
  );
});

// Interactive CI Calculator Component
const InteractiveCalculator = React.memo(function InteractiveCalculator() {
  const [sampleMean, setSampleMean] = useState(100);
  const [populationSD, setPopulationSD] = useState(15);
  const [sampleSize, setSampleSize] = useState(36);
  const [confidence, setConfidence] = useState(95);
  
  // Calculate CI
  const zValues = { 90: 1.645, 95: 1.96, 99: 2.576 };
  const z = zValues[confidence];
  const se = populationSD / Math.sqrt(sampleSize);
  const me = z * se;
  const lower = sampleMean - me;
  const upper = sampleMean + me;
  
  return (
    <div className="bg-neutral-900/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">Interactive CI Calculator</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ControlGroup label="Sample Mean (x̄)">
            <input
              type="range"
              min="50"
              max="150"
              value={sampleMean}
              onChange={(e) => setSampleMean(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-neutral-400">{sampleMean}</span>
          </ControlGroup>
          
          <ControlGroup label="Population SD (σ)">
            <input
              type="range"
              min="5"
              max="30"
              value={populationSD}
              onChange={(e) => setPopulationSD(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-neutral-400">{populationSD}</span>
          </ControlGroup>
          
          <ControlGroup label="Sample Size (n)">
            <input
              type="range"
              min="10"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-neutral-400">{sampleSize}</span>
          </ControlGroup>
          
          <ControlGroup label="Confidence Level">
            <div className="flex gap-2">
              {[90, 95, 99].map(level => (
                <button
                  key={level}
                  onClick={() => setConfidence(level)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    confidence === level 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          </ControlGroup>
        </div>
        
        <div className="space-y-4">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Calculations</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Standard Error:</span>
                <span className="font-mono text-neutral-200">{se.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Critical Value (z):</span>
                <span className="font-mono text-neutral-200">{z}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Margin of Error:</span>
                <span className="font-mono text-neutral-200">±{me.toFixed(3)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2">Confidence Interval</h4>
            <p className="text-2xl font-mono text-emerald-400">
              [{lower.toFixed(2)}, {upper.toFixed(2)}]
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              We are {confidence}% confident the true mean lies in this interval
            </p>
          </div>
          
          {/* Visual representation */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Visual Width Comparison</h4>
            <div className="space-y-2">
              {[90, 95, 99].map(level => {
                const zVal = zValues[level];
                const width = 2 * zVal * se;
                const maxWidth = 2 * zValues[99] * se;
                const percentage = (width / maxWidth) * 100;
                
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-8">{level}%</span>
                    <div className="flex-1 bg-neutral-700 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          level === confidence ? 'bg-emerald-500' : 'bg-neutral-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-12 text-right">
                      ±{(zVal * se).toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main Component
export default function ConfidenceIntervalPractice() {
  const [activeTab, setActiveTab] = useState(TAB_SECTIONS.FOUNDATIONS);
  
  // Tab configuration
  const tabs = [
    { id: TAB_SECTIONS.FOUNDATIONS, label: 'Foundations', icon: BookOpen },
    { id: TAB_SECTIONS.WORKED_EXAMPLES, label: 'Worked Examples', icon: Code },
    { id: TAB_SECTIONS.QUICK_REFERENCE, label: 'Quick Reference', icon: FileText },
    { id: TAB_SECTIONS.INTERACTIVE, label: 'Interactive', icon: Zap }
  ];
  
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <VisualizationContainer
        title="Practice: Confidence Intervals"
        description="Master confidence interval problems through practice and interactive exploration"
      >
      <div className="space-y-8">
        {/* Back to Hub */}
        <BackToHub chapter={5} />
        
        {/* Tab Navigation (Chapter 7 Style) */}
        <div className="border-b border-neutral-700">
          <div className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === id
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <VisualizationSection>
          {activeTab === TAB_SECTIONS.FOUNDATIONS && <FoundationsContent />}
          {activeTab === TAB_SECTIONS.WORKED_EXAMPLES && <WorkedExamplesContent />}
          {activeTab === TAB_SECTIONS.QUICK_REFERENCE && <QuickReferenceContent />}
          {activeTab === TAB_SECTIONS.INTERACTIVE && <InteractivePracticeContent />}
        </VisualizationSection>
        
        {/* Section Complete */}
        <SectionComplete 
          chapter={5}
          section="confidence-intervals-practice"
        />
      </div>
      </VisualizationContainer>
    </>
  );
}