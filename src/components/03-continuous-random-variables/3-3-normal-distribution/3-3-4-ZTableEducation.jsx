"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMathJax } from '@/hooks/useMathJax';
import { createColorScheme, typography } from "../../../lib/design-system";
import { 
  ArrowRight, BookOpen, 
  Info, TrendingUp, Target, Award,
  Lightbulb, CheckCircle, AlertCircle
} from "lucide-react";
import { 
  VisualizationContainer, 
  VisualizationSection
} from "../../ui/VisualizationContainer";
import { Button } from "../../ui/button";
import { ProgressBar, ProgressNavigation } from "../../ui/ProgressBar";
import { tutorial_3_3_4 } from '@/tutorials/chapter3';
import BackToHub from '../../ui/BackToHub';

const ZTableEducation = () => {
  const colors = createColorScheme('hypothesis');
  const contentRef = useRef(null);
  
  // Learning flow state
  const [learningStage, setLearningStage] = useState(1);
  const totalStages = 4;
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && learningStage > 1) {
      e.preventDefault();
      setLearningStage(Math.max(1, learningStage - 1));
    } else if (e.key === 'ArrowRight' && learningStage < totalStages) {
      e.preventDefault();
      setLearningStage(Math.min(totalStages, learningStage + 1));
    }
  }, [learningStage, totalStages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Use safe MathJax processing with error handling
  useMathJax(contentRef, [learningStage]);
  
  // Critical values for quick reference
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
                    <h3 className="text-xl font-semibold text-white">Z-Tables in Hypothesis Testing</h3>
                    <p className="text-neutral-300 mt-1">Essential tool for finding critical values when testing hypotheses with known σ</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      What it represents
                    </h4>
                    <p className="text-neutral-300 mb-3">
                      The Z-table shows the cumulative probability Φ(z) = P(Z ≤ z) for the standard normal distribution.
                    </p>
                    <div className="bg-neutral-900 p-3 rounded border border-neutral-700">
                      <p className="text-sm text-neutral-400 mb-2">Mathematical notation:</p>
                      <div className="text-center" dangerouslySetInnerHTML={{ 
                        __html: `\\(\\Phi(z) = P(Z \\leq z) = \\int_{-\\infty}^{z} \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{t^2}{2}} dt\\)` 
                      }} />
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Why it's important
                    </h4>
                    <ul className="space-y-2 text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Find critical values for any significance level (α)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Determine rejection regions for hypothesis tests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Calculate p-values for test statistics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Essential for z-tests when population σ is known</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );

      case 2: // How to Read the Table
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-900/50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">How to Read a Z-Table</h3>
                    <p className="text-neutral-300 mt-1">Step-by-step guide to finding probabilities</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-3">Table Structure</h4>
                    <div className="space-y-3 text-neutral-300">
                      <p>• <strong>Rows:</strong> z-values to the tenths place (0.0, 0.1, 0.2...)</p>
                      <p>• <strong>Columns:</strong> hundredths place (0.00, 0.01, 0.02...)</p>
                      <p>• <strong>Values:</strong> Cumulative probabilities Φ(z)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h4 className="font-semibold text-white mb-3">Example: Finding Φ(1.96)</h4>
                    <ol className="space-y-2 text-neutral-300">
                      <li>1. Find row 1.9 (tenths place)</li>
                      <li>2. Find column 0.06 (hundredths place)</li>
                      <li>3. Read intersection: Φ(1.96) = 0.9750</li>
                      <li>4. This means P(Z ≤ 1.96) = 97.50%</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                    <p className="text-blue-300 flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Tip:</strong> For negative z-values, use symmetry: Φ(-z) = 1 - Φ(z)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );

      case 3: // Critical Values
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-900/50 rounded-lg">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Critical Values</h3>
                    <p className="text-neutral-300 mt-1">Common z-scores for confidence intervals and hypothesis testing</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-700">
                          <th className="text-left py-3 px-4 text-neutral-300">Confidence Level</th>
                          <th className="text-left py-3 px-4 text-neutral-300">α (two-tailed)</th>
                          <th className="text-left py-3 px-4 text-neutral-300">Critical z-value</th>
                          <th className="text-left py-3 px-4 text-neutral-300">Common Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criticalValues.map((cv, index) => (
                          <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                            <td className="py-3 px-4 text-white font-semibold">{cv.confidence}</td>
                            <td className="py-3 px-4 text-neutral-300">{cv.alpha}</td>
                            <td className="py-3 px-4 text-blue-400 font-mono">±{cv.z}</td>
                            <td className="py-3 px-4 text-neutral-400">{cv.use}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
                  <p className="text-emerald-300 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Most Important:</strong> z = ±1.96 for 95% confidence intervals
                    </span>
                  </p>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );

      case 4: // Practical Applications
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-900/50 rounded-lg">
                    <Award className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Real-World Applications</h3>
                    <p className="text-neutral-300 mt-1">How z-tables are used in practice</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  {practicalExamples.map((example, index) => (
                    <div key={index} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-neutral-700 rounded">
                          {example.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{example.title}</h4>
                          <p className="text-neutral-300 text-sm mb-2">{example.description}</p>
                          <p className="text-blue-300 text-sm mb-2">
                            <strong>Question:</strong> {example.question}
                          </p>
                          <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
                            <p className="text-emerald-300 text-sm">
                              <strong>Solution:</strong> {example.solution}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
      title="Z-Table for Hypothesis Testing: Finding Critical Values"
      className="max-w-full"
      tutorialSteps={tutorial_3_3_4}
      tutorialKey="z-table-education-3-3-4"
    >
      <BackToHub chapter={6} />
      <div ref={contentRef} className="space-y-6">
        
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
        
        {/* Keyboard Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-neutral-500">
            Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
          </p>
        </div>
        
        {/* Learning Content Section */}
        {learningStage <= totalStages && (
          <div className="mb-6">
            {renderLearningContent()}
          </div>
        )}
        
      </div>
    </VisualizationContainer>
  );
};

export default ZTableEducation;