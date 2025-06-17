"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { createColorScheme, typography } from "../../lib/design-system";
import { 
  ArrowRight, Calculator, BookOpen, 
  Info, TrendingUp, Target, Award,
  Lightbulb, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "../../lib/utils";
import { 
  VisualizationContainer, 
  VisualizationSection
} from "../ui/VisualizationContainer";
import { Button } from "../ui/button";
import { ProgressBar, ProgressNavigation } from "../ui/ProgressBar";
import { Tutorial } from "../ui/Tutorial";
import ZTableExplorer from "./ZTableExplorer";
import { tutorial_3_3_4 } from '@/tutorials/chapter3';

const ZTableLookup = () => {
  const colors = createColorScheme('hypothesis'); // Using hypothesis scheme for better vibrancy
  const contentRef = useRef(null);
  
  // Learning flow state
  const [learningStage, setLearningStage] = useState(1);
  const totalStages = 4;
  
  // UI state
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [learningStage]);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Z-Table Lookup!",
      content: (
        <div className="space-y-2">
          <p>This tool helps you master the standard normal distribution table.</p>
          <p className="text-blue-400">You'll learn to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Convert z-scores to probabilities</li>
            <li>Find critical values for confidence intervals</li>
            <li>Understand real-world applications</li>
          </ul>
        </div>
      )
    },
    {
      target: '.z-visualization',
      title: "Interactive Visualization",
      content: "This graph shows the standard normal distribution. The shaded area represents the cumulative probability Φ(z).",
      position: 'bottom'
    },
    {
      target: '.z-controls',
      title: "Controls",
      content: "Use the slider or search box to explore different z-values. Try common values like 1.96 for 95% confidence.",
      position: 'top'
    },
    {
      target: '.z-table-section',
      title: "Z-Table Reference",
      content: "The table shows cumulative probabilities. Find your z-value by row (tenths) and column (hundredths).",
      position: 'left'
    }
  ];
  
  // Critical values for quick reference - reordered for common use
  const criticalValues = [
    { z: 1.645, confidence: "90%", alpha: "0.10", use: "One-tailed" },
    { z: 1.96, confidence: "95%", alpha: "0.05", use: "Most common" },
    { z: 2.576, confidence: "99%", alpha: "0.01", use: "High precision" },
    { z: 1.282, confidence: "80%", alpha: "0.20", use: "Basic" },
    { z: 2.326, confidence: "98%", alpha: "0.02", use: "Higher conf." },
    { z: 3.090, confidence: "99.8%", alpha: "0.002", use: "Very high" }
  ];
  
  // Real-world examples
  const practicalExamples = [
    {
      title: "Quality Control",
      icon: <Target className="w-5 h-5" />,
      description: "A factory produces batteries with mean life 500 hours, σ = 50 hours.",
      question: "What percentage last more than 580 hours?",
      solution: "z = (580-500)/50 = 1.6, P(Z > 1.6) = 1 - 0.9452 = 5.48%",
      zValue: 1.6
    },
    {
      title: "Medical Testing",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Blood pressure readings: mean 120 mmHg, σ = 15 mmHg.",
      question: "What z-score defines the top 5% (hypertension)?",
      solution: "Need P(Z > z) = 0.05, so Φ(z) = 0.95, z ≈ 1.645",
      zValue: 1.645
    },
    {
      title: "Six Sigma",
      icon: <Award className="w-5 h-5" />,
      description: "Process capability for near-zero defects.",
      question: "What's the defect rate at 6σ quality?",
      solution: "P(|Z| > 6) ≈ 2 × 10⁻⁹ or 2 defects per billion",
      zValue: 6
    }
  ];
  
  // Learning content for each stage
  const renderLearningContent = () => {
    switch (learningStage) {
      case 1: // Introduction - What is a Z-Table?
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <Info className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">What is a Z-Table?</h3>
                    <p className="text-neutral-300 mt-1">A lookup table for cumulative probabilities of the standard normal distribution</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  {/* What it represents */}
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-400" />
                      What a Z-Table Actually Represents
                    </h4>
                    <p className="text-neutral-300 leading-relaxed mb-3">
                      A Z-table contains pre-calculated values of the cumulative distribution function (CDF) for the standard normal distribution:
                    </p>
                    <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-700">
                      <p className="text-center font-mono text-lg text-emerald-400" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z) = P(Z \\leq z) = \\int_{-\\infty}^{z} \\frac{1}{\\sqrt{2\\pi}} e^{-t^2/2} dt\\)` }} />
                    </div>
                    <p className="text-sm text-neutral-400 mt-3">
                      Each entry tells you what percentage of the data falls below a given z-score. It's the area under the curve from negative infinity to z.
                    </p>
                  </div>
                  
                  {/* Historical context */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-600/50">
                      <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-400" />
                        Historical Necessity
                      </h4>
                      <p className="text-amber-200 text-sm leading-relaxed">
                        Before computers, calculating <span className="inline-block mx-1" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z)\\)` }} /> required complex numerical integration. 
                        Tables were essential tools that saved hours of computation. Statisticians would carry these tables everywhere!
                      </p>
                    </div>
                    
                    <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-600/50">
                      <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Modern Relevance
                      </h4>
                      <p className="text-emerald-200 text-sm leading-relaxed">
                        Today, computers can calculate these instantly. So why still learn tables? 
                        Because understanding them builds deep intuition about probability distributions!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 2: // Why Z-tables STILL matter
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">Why Understanding Z-Tables Still Matters in the Modern Era</h3>
              
              <div className="space-y-4">
                {/* Main argument */}
                <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg border border-indigo-600/50">
                  <p className="text-indigo-300 font-medium mb-2">
                    We're NOT promoting memorization — we're building intuition!
                  </p>
                  <p className="text-indigo-200 text-sm">
                    While computers can instantly calculate any probability, understanding Z-tables helps you develop a "feel" for the normal distribution that no calculator can provide.
                  </p>
                </div>
                
                {/* Four key reasons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      1. Builds Intuition
                    </h4>
                    <p className="text-neutral-300 text-sm mb-2">
                      Z-tables show how probability accumulates as you move along the distribution. You can literally see:
                    </p>
                    <ul className="space-y-1 text-sm text-neutral-400 ml-4">
                      <li>• How quickly probability grows near the mean</li>
                      <li>• How slowly it changes in the tails</li>
                      <li>• Why extreme events are so rare</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      2. Quick Mental Estimates
                    </h4>
                    <p className="text-neutral-300 text-sm mb-2">
                      Knowing key values helps you make rapid assessments:
                    </p>
                    <ul className="space-y-1 text-sm text-neutral-400 ml-4">
                      <li>• "That's about 2 standard deviations" → ~95%</li>
                      <li>• "z = 1.65" → roughly 90th percentile</li>
                      <li>• Instant sanity checks on calculations</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      3. Understanding Reports
                    </h4>
                    <p className="text-neutral-300 text-sm mb-2">
                      Statistical reports often reference z-scores:
                    </p>
                    <ul className="space-y-1 text-sm text-neutral-400 ml-4">
                      <li>• "Significant at z = 2.5" → What does this mean?</li>
                      <li>• Medical test results in standard deviations</li>
                      <li>• Quality control limits (e.g., Six Sigma)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      4. Connection to CDF
                    </h4>
                    <p className="text-neutral-300 text-sm mb-2">
                      Tables reveal the CDF's behavior:
                    </p>
                    <ul className="space-y-1 text-sm text-neutral-400 ml-4">
                      <li>• Why <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(0) = 0.5\\)` }} /></li>
                      <li>• How symmetry works: <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(-z) = 1 - \\Phi(z)\\)` }} /></li>
                      <li>• The S-shaped cumulative curve</li>
                    </ul>
                  </div>
                </div>
                
                {/* Key insight */}
                <div className="p-4 bg-emerald-900/20 border border-emerald-600/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-300 mb-1">The Real Goal</p>
                      <p className="text-emerald-200 text-sm">
                        After working with Z-tables, you'll have an intuitive sense for probabilities. 
                        When someone says "that's a 3-sigma event," you'll instantly know it's extraordinarily rare (0.3%). 
                        This intuition is invaluable in data science, quality control, and research.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 3: // How to read the table (step by step)
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">How to Read a Z-Table: Step-by-Step Guide</h3>
              
              <div className="space-y-4">
                {/* Visual guide */}
                <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg">
                  <h4 className="font-medium text-indigo-300 mb-3">The Three-Step Process</h4>
                  <div className="space-y-3">
                    {[
                      { 
                        step: 1, 
                        title: "Split your z-value",
                        desc: "Separate the tenths from hundredths. For z = 1.96: tenths = 1.9, hundredths = 0.06",
                        example: "z = 1.96 → Row: 1.9, Column: 0.06"
                      },
                      { 
                        step: 2, 
                        title: "Navigate the table",
                        desc: "Find the row labeled with your tenths value, then move to the column for hundredths",
                        example: "Go to row 1.9, then move right to column 0.06"
                      },
                      { 
                        step: 3, 
                        title: "Read the probability",
                        desc: "The value at the intersection is Φ(z) — the cumulative probability up to that z-score",
                        example: "The cell shows 0.9750, meaning 97.5% of data falls below z = 1.96"
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-neutral-300 text-sm mt-1">{item.desc}</p>
                          <p className="text-indigo-300 text-sm font-mono mt-1 bg-indigo-900/30 px-2 py-1 rounded inline-block">
                            {item.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Examples grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-900/20 border border-emerald-600/50 rounded-lg">
                    <h5 className="font-medium text-emerald-300 mb-3">✓ Worked Example: Φ(2.33)</h5>
                    <ol className="space-y-2 text-sm text-emerald-200">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Split: 2.33 → Row 2.3, Column 0.03</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Find row 2.3 in the table</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Move to column 0.03</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Read: <span className="font-mono font-bold">0.9901</span></span>
                      </li>
                    </ol>
                    <p className="text-emerald-300 text-sm mt-3 font-medium">
                      Interpretation: 99.01% of values are below z = 2.33
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 border border-purple-600/50 rounded-lg">
                    <h5 className="font-medium text-purple-300 mb-3">🔄 The Symmetry Property</h5>
                    <p className="text-sm text-purple-200 mb-3">
                      For negative z-values, use the symmetry of the normal distribution:
                    </p>
                    <div className="p-3 bg-purple-900/30 rounded text-center">
                      <span className="font-mono text-purple-300" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(-z) = 1 - \\Phi(z)\\)` }} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-purple-200">
                      <p><strong>Example:</strong> Find Φ(-1.50)</p>
                      <p>1. Look up Φ(1.50) = 0.9332</p>
                      <p>2. Apply symmetry: Φ(-1.50) = 1 - 0.9332 = <span className="font-mono font-bold">0.0668</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Common errors */}
                <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                  <h4 className="font-medium text-red-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Common Errors to Avoid
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      {
                        error: "Confusing rows and columns",
                        fix: "Remember: First two digits → row, last digit → column"
                      },
                      {
                        error: "Forgetting what the table shows",
                        fix: "Z-table gives LEFT tail area (cumulative probability)"
                      },
                      {
                        error: "Wrong calculation for P(Z > z)",
                        fix: "Use P(Z > z) = 1 - Φ(z), not just Φ(z)"
                      },
                      {
                        error: "Mishandling negative z-values",
                        fix: "Always use symmetry: Φ(-z) = 1 - Φ(z)"
                      }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-sm font-medium text-red-300">❌ {item.error}</p>
                        <p className="text-xs text-red-200">✓ {item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 4: // Connection to CDF and practical use
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">The Deep Connection: Z-Table and the CDF</h3>
              
              <div className="space-y-4">
                {/* CDF explanation */}
                <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-600/50">
                  <h4 className="font-semibold text-blue-300 mb-3">Understanding What You're Really Looking At</h4>
                  <p className="text-blue-200 mb-3">
                    Every Z-table entry is a point on the cumulative distribution function (CDF) curve:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-800 rounded border border-blue-600/50">
                      <p className="font-medium text-white mb-2">The Mathematical Truth</p>
                      <p className="text-sm text-neutral-300">
                        Each table value represents the integral of the probability density function from -∞ to z.
                        This is why values start near 0 and approach 1.
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-800 rounded border border-blue-600/50">
                      <p className="font-medium text-white mb-2">The Visual Insight</p>
                      <p className="text-sm text-neutral-300">
                        As you move right in the table (increasing z), you're accumulating more area under the bell curve.
                        The S-shaped pattern shows how probability accumulates.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Key insights */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-600/50">
                    <h5 className="font-medium text-amber-300 mb-2">Why Φ(0) = 0.5?</h5>
                    <p className="text-sm text-amber-200">
                      The standard normal is symmetric around 0. 
                      Half the data lies below the mean, half above.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-600/50">
                    <h5 className="font-medium text-emerald-300 mb-2">Why values near 0 and 1?</h5>
                    <p className="text-sm text-emerald-200">
                      CDF ranges from 0 to 1 because it represents probability. 
                      You'll never see values outside this range.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-600/50">
                    <h5 className="font-medium text-purple-300 mb-2">The tail behavior</h5>
                    <p className="text-sm text-purple-200">
                      Notice how slowly values change for |z| {'>'} 3. 
                      This shows why extreme events are so rare.
                    </p>
                  </div>
                </div>
                
                {/* Practical examples with deeper explanation */}
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">See It In Action: Real-World Applications</h4>
                  <div className="space-y-3">
                    {practicalExamples.map((example, idx) => (
                      <div key={idx} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-blue-500 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400">
                            {example.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white">{example.title}</h5>
                            <p className="text-sm text-neutral-300 mt-1">{example.description}</p>
                            <p className="text-sm font-medium text-blue-300 mt-2">{example.question}</p>
                            
                            <div className="mt-3 p-3 bg-neutral-900 rounded border border-neutral-700">
                              <p className="text-sm text-emerald-400 font-mono">{example.solution}</p>
                              <p className="text-xs text-neutral-400 mt-2">
                                <strong>Why this matters:</strong> Understanding z-tables helps you quickly assess 
                                {idx === 0 ? " quality control limits" : idx === 1 ? " medical test significance" : " process capabilities"}.
                              </p>
                            </div>
                            
                            {/* Removed button as it requires setZValue which is now in ZTableExplorer */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mental math tips */}
                <div className="p-4 bg-indigo-900/20 border border-indigo-600/50 rounded-lg">
                  <h4 className="font-medium text-indigo-300 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                    Quick Mental Estimates Using Z-Tables
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-indigo-300 mb-2">For positive z:</p>
                      <ul className="space-y-1 text-indigo-200 ml-4">
                        <li>• z ≈ 0 → Φ(z) ≈ 0.5 (50%)</li>
                        <li>• z ≈ 1 → Φ(z) ≈ 0.84 (84%)</li>
                        <li>• z ≈ 2 → Φ(z) ≈ 0.98 (98%)</li>
                        <li>• z ≈ 3 → Φ(z) ≈ 0.999 (99.9%)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-indigo-300 mb-2">For finding percentiles:</p>
                      <ul className="space-y-1 text-indigo-200 ml-4">
                        <li>• 90th percentile → z ≈ 1.28</li>
                        <li>• 95th percentile → z ≈ 1.65</li>
                        <li>• 97.5th percentile → z ≈ 1.96</li>
                        <li>• 99th percentile → z ≈ 2.33</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer 
      title="Z-Table Lookup: Master the Standard Normal Distribution"
      className="max-w-full"
      tutorialSteps={tutorial_3_3_4}
      tutorialKey="z-table-lookup-3-3-4"
    >
      <div ref={contentRef} className="space-y-6">
        {/* Tutorial Component */}
        {showTutorial && (
          <Tutorial
            steps={tutorialSteps}
            onComplete={() => setShowTutorial(false)}
            onSkip={() => setShowTutorial(false)}
            persistKey="z-table-lookup"
            mode="tooltip"
          />
        )}
        
        {/* Progress Bar */}
        <ProgressBar
          current={learningStage}
          total={totalStages}
          label="Learning Progress"
          variant="emerald"
        />
        
        {/* Navigation Buttons */}
        <ProgressNavigation
          current={learningStage}
          total={totalStages}
          onPrevious={() => setLearningStage(Math.max(1, learningStage - 1))}
          onNext={() => setLearningStage(Math.min(totalStages, learningStage + 1))}
          variant="emerald"
          nextLabel={learningStage === totalStages ? "Complete" : "Next"}
          completeLabel="Complete"
        />
        
        {/* Learning Content Section */}
        {learningStage <= totalStages && (
          <div className="mb-6">
            {renderLearningContent()}
          </div>
        )}
        
        {/* Divider */}
        <div className="my-8 border-t border-neutral-700"></div>
        
        {/* Interactive Z-Table Explorer Tool */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Interactive Z-Table Explorer</h2>
            <p className="text-neutral-300 text-sm">Use the tool below to explore z-scores and probabilities</p>
          </div>
          <ZTableExplorer 
            practicalExamples={practicalExamples}
            criticalValues={criticalValues}
            showTutorial={showTutorial}
            setShowTutorial={setShowTutorial}
          />
        </div>
        
        {/* Help Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="shadow-lg"
          >
            <Info className="w-4 h-4" />
            Help
          </Button>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default ZTableLookup;