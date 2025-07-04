"use client";

import React, { useRef, useEffect, useState } from 'react';
import SectionBasedContent, { SectionContent, MathFormula, InteractiveElement } from '@/components/ui/SectionBasedContent';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calculator, AlertTriangle, Timer, ChevronRight } from 'lucide-react';

export default function Tab3QuickReferenceTab({ onComplete }) {
  const sections = [
    {
      id: 'formula-sheet',
      title: 'Formula Sheet',
      icon: '📋',
      content: () => <FormulaSheetSection />
    },
    {
      id: 'decision-guide',
      title: 'Decision Guide',
      icon: '🗺️',
      content: () => <DecisionGuideSection />
    },
    {
      id: 'common-mistakes',
      title: 'Common Mistakes',
      icon: '⚠️',
      content: () => <CommonMistakesSection />
    },
    {
      id: 'speed-practice',
      title: 'Speed Practice',
      icon: '⚡',
      content: () => <SpeedPracticeSection />
    }
  ];

  return (
    <SectionBasedContent
      title="Quick Reference Guide"
      description="Everything you need for exams in one place"
      sections={sections}
      onComplete={onComplete}
      progressVariant="violet"
      showBackToHub={false}
    />
  );
}

// Section 1: Formula Sheet
function FormulaSheetSection() {
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
    <SectionContent>
      <div ref={contentRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Bayes */}
          <VisualizationSection className="bg-purple-950/30 border-purple-700/50">
            <h4 className="font-bold text-purple-400 mb-3">Basic Bayes' Theorem</h4>
            <div className="space-y-3">
              <div className="bg-neutral-900 p-3 rounded" dangerouslySetInnerHTML={{ 
                __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D)}\\]` 
              }} />
              <div className="text-sm space-y-1">
                <p><strong>When to use:</strong> Single hypothesis, single evidence</p>
                <p><strong>Remember:</strong> Posterior ∝ Likelihood × Prior</p>
              </div>
            </div>
          </VisualizationSection>

          {/* Expanded Form */}
          <VisualizationSection className="bg-blue-950/30 border-blue-700/50">
            <h4 className="font-bold text-blue-400 mb-3">Expanded Form (Binary)</h4>
            <div className="space-y-3">
              <div className="bg-neutral-900 p-3 rounded text-sm" dangerouslySetInnerHTML={{ 
                __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}\\]` 
              }} />
              <div className="text-sm space-y-1">
                <p><strong>When to use:</strong> Two hypotheses (H and not H)</p>
                <p><strong>Key:</strong> Denominator is total probability of evidence</p>
              </div>
            </div>
          </VisualizationSection>

          {/* Multiple Hypotheses */}
          <VisualizationSection className="bg-green-950/30 border-green-700/50">
            <h4 className="font-bold text-green-400 mb-3">Multiple Hypotheses</h4>
            <div className="space-y-3">
              <div className="bg-neutral-900 p-3 rounded" dangerouslySetInnerHTML={{ 
                __html: `\\[P(H_i|D) = \\frac{P(D|H_i) \\cdot P(H_i)}{\\sum_j P(D|H_j) \\cdot P(H_j)}\\]` 
              }} />
              <div className="text-sm space-y-1">
                <p><strong>When to use:</strong> More than 2 hypotheses</p>
                <p><strong>Check:</strong> All posteriors must sum to 1</p>
              </div>
            </div>
          </VisualizationSection>

          {/* Odds Form */}
          <VisualizationSection className="bg-orange-950/30 border-orange-700/50">
            <h4 className="font-bold text-orange-400 mb-3">Odds Form</h4>
            <div className="space-y-3">
              <div className="bg-neutral-900 p-3 rounded" dangerouslySetInnerHTML={{ 
                __html: `\\[\\frac{P(H|D)}{P(\\neg H|D)} = \\frac{P(D|H)}{P(D|\\neg H)} \\cdot \\frac{P(H)}{P(\\neg H)}\\]` 
              }} />
              <div className="text-sm space-y-1">
                <p><strong>When to use:</strong> Quick mental math</p>
                <p><strong>Formula:</strong> Post. odds = LR × Prior odds</p>
              </div>
            </div>
          </VisualizationSection>
        </div>

        {/* Common Values Reference */}
        <div className="mt-6 bg-neutral-800/50 p-4 rounded-lg">
          <h4 className="font-semibold text-neutral-300 mb-3">Quick Conversion Table</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-neutral-500">Probability → Odds</p>
              <p className="font-mono">0.5 → 1:1</p>
              <p className="font-mono">0.25 → 1:3</p>
              <p className="font-mono">0.1 → 1:9</p>
            </div>
            <div>
              <p className="text-neutral-500">Odds → Probability</p>
              <p className="font-mono">1:1 → 0.5</p>
              <p className="font-mono">1:4 → 0.2</p>
              <p className="font-mono">2:3 → 0.4</p>
            </div>
            <div>
              <p className="text-neutral-500">Percentages</p>
              <p className="font-mono">1% = 0.01</p>
              <p className="font-mono">5% = 0.05</p>
              <p className="font-mono">10% = 0.1</p>
            </div>
            <div>
              <p className="text-neutral-500">Common LRs</p>
              <p className="font-mono">99:1 (strong)</p>
              <p className="font-mono">10:1 (moderate)</p>
              <p className="font-mono">2:1 (weak)</p>
            </div>
          </div>
        </div>
      </div>
    </SectionContent>
  );
}

// Section 2: Decision Guide
function DecisionGuideSection() {
  const contentRef = useRef(null);
  const [selectedPath, setSelectedPath] = useState(null);
  
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

  const decisionTree = {
    start: {
      question: "How many possible hypotheses?",
      options: [
        { label: "Two (binary)", next: "binary" },
        { label: "More than two", next: "multiple" },
        { label: "Continuous parameter", next: "continuous" }
      ]
    },
    binary: {
      question: "What format do you need?",
      options: [
        { label: "Probability", next: "binary-prob" },
        { label: "Odds (for quick calc)", next: "binary-odds" },
        { label: "Sequential updates", next: "sequential" }
      ]
    },
    multiple: {
      question: "Do you have all likelihoods?",
      options: [
        { label: "Yes", next: "multiple-full" },
        { label: "Only some", next: "multiple-partial" }
      ]
    },
    // Terminal nodes
    "binary-prob": {
      result: "Use expanded binary form",
      formula: "P(H|D) = P(D|H)P(H) / [P(D|H)P(H) + P(D|¬H)P(¬H)]",
      tip: "Remember: P(¬H) = 1 - P(H)"
    },
    "binary-odds": {
      result: "Use odds form",
      formula: "Posterior odds = Likelihood ratio × Prior odds",
      tip: "Convert back: P = odds/(1+odds)"
    },
    sequential: {
      result: "Update iteratively",
      formula: "New posterior becomes next prior",
      tip: "Each update: P(H|D₁,D₂) uses P(H|D₁) as prior"
    },
    "multiple-full": {
      result: "Use full Bayes with normalization",
      formula: "P(Hᵢ|D) = P(D|Hᵢ)P(Hᵢ) / Σⱼ P(D|Hⱼ)P(Hⱼ)",
      tip: "Check: All posteriors sum to 1"
    },
    "multiple-partial": {
      result: "Find missing probabilities first",
      formula: "Use constraint: Σ P(Hᵢ) = 1",
      tip: "Sometimes you can work with ratios"
    },
    continuous: {
      result: "Use Bayesian inference formula",
      formula: "p(θ|data) ∝ p(data|θ) × p(θ)",
      tip: "Often involves integrals or conjugate priors"
    }
  };

  const currentNode = selectedPath ? decisionTree[selectedPath] : decisionTree.start;

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Step-by-Step Decision Tree">
          <div className="space-y-6">
            {/* Current Question/Result */}
            <div className="bg-neutral-900 p-6 rounded-lg">
              {currentNode.question ? (
                <>
                  <h4 className="text-lg font-semibold text-white mb-4">{currentNode.question}</h4>
                  <div className="space-y-2">
                    {currentNode.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPath(option.next)}
                        className="w-full text-left p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <span>{option.label}</span>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-900/30 p-4 rounded-lg border border-green-700/50">
                    <h4 className="font-bold text-green-400 mb-2">{currentNode.result}</h4>
                    <p className="font-mono text-sm text-neutral-300">{currentNode.formula}</p>
                  </div>
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
                    <p className="text-sm text-blue-300">
                      <strong>Tip:</strong> {currentNode.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reset button */}
            {selectedPath && (
              <Button
                variant="secondary"
                onClick={() => setSelectedPath(null)}
                className="w-full"
              >
                Start Over
              </Button>
            )}

            {/* Quick Decision Matrix */}
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-neutral-300 mb-3">Quick Decision Matrix</h5>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-2">Scenario</th>
                    <th className="text-left py-2">Use This Form</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-400">
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">Medical test (rare disease)</td>
                    <td className="py-2">Expanded binary</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">Multiple suspects</td>
                    <td className="py-2">Multiple hypotheses</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">Quick mental math</td>
                    <td className="py-2">Odds form</td>
                  </tr>
                  <tr>
                    <td className="py-2">Parameter estimation</td>
                    <td className="py-2">Continuous Bayes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}

// Section 3: Common Mistakes
function CommonMistakesSection() {
  const contentRef = useRef(null);
  const [selectedMistake, setSelectedMistake] = useState(0);
  
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
  }, [selectedMistake]);

  const mistakes = [
    {
      title: "Confusing P(A|B) with P(B|A)",
      wrong: (
        <div>
          <p className="text-red-400 mb-2">❌ Wrong:</p>
          <p>"The test is 95% accurate, so if I test positive, I'm 95% likely to have the disease"</p>
          <p className="mt-2">This confuses P(+|Disease) with P(Disease|+)</p>
        </div>
      ),
      right: (
        <div>
          <p className="text-green-400 mb-2">✓ Correct:</p>
          <p>P(+|Disease) = 95% means the test detects 95% of disease cases</p>
          <p>P(Disease|+) depends on the base rate and must be calculated with Bayes</p>
        </div>
      )
    },
    {
      title: "Ignoring the Base Rate",
      wrong: (
        <div>
          <p className="text-red-400 mb-2">❌ Wrong:</p>
          <p>"The test is highly accurate, so a positive result means I probably have it"</p>
          <p className="mt-2">Ignores that rare conditions have more false positives</p>
        </div>
      ),
      right: (
        <div>
          <p className="text-green-400 mb-2">✓ Correct:</p>
          <p>Always consider the prior probability P(H)</p>
          <p>For rare events (low prior), even good tests give mostly false positives</p>
        </div>
      )
    },
    {
      title: "Forgetting to Normalize",
      wrong: (
        <div>
          <p className="text-red-400 mb-2">❌ Wrong:</p>
          <div dangerouslySetInnerHTML={{ 
            __html: `<p>P(H|D) = P(D|H) × P(H) = 0.9 × 0.3 = 0.27</p>` 
          }} />
          <p className="mt-2">This is just the numerator!</p>
        </div>
      ),
      right: (
        <div>
          <p className="text-green-400 mb-2">✓ Correct:</p>
          <div dangerouslySetInnerHTML={{ 
            __html: `<p>P(H|D) = P(D|H) × P(H) / P(D)</p>` 
          }} />
          <p>Must divide by total probability of evidence</p>
        </div>
      )
    },
    {
      title: "Wrong P(Evidence) Calculation",
      wrong: (
        <div>
          <p className="text-red-400 mb-2">❌ Wrong:</p>
          <p>P(D) = P(D|H) = 0.9</p>
          <p className="mt-2">P(D) is NOT just the likelihood!</p>
        </div>
      ),
      right: (
        <div>
          <p className="text-green-400 mb-2">✓ Correct:</p>
          <div dangerouslySetInnerHTML={{ 
            __html: `<p>P(D) = P(D|H)P(H) + P(D|¬H)P(¬H)</p>` 
          }} />
          <p>Sum over all ways the evidence can occur</p>
        </div>
      )
    },
    {
      title: "Updating with Dependent Evidence",
      wrong: (
        <div>
          <p className="text-red-400 mb-2">❌ Wrong:</p>
          <p>Two positive tests from same lab → multiply likelihoods</p>
          <p className="mt-2">Tests might not be independent!</p>
        </div>
      ),
      right: (
        <div>
          <p className="text-green-400 mb-2">✓ Correct:</p>
          <p>Check if evidence is truly independent</p>
          <p>Correlated evidence provides less information than independent evidence</p>
        </div>
      )
    }
  ];

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Avoid These Common Pitfalls">
          <div className="space-y-6">
            {/* Mistake selector */}
            <div className="flex flex-wrap gap-2">
              {mistakes.map((mistake, idx) => (
                <Button
                  key={idx}
                  variant={selectedMistake === idx ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedMistake(idx)}
                  className="text-xs"
                >
                  Mistake {idx + 1}
                </Button>
              ))}
            </div>

            {/* Current mistake display */}
            <div className="bg-neutral-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                {mistakes[selectedMistake].title}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-950/30 p-4 rounded-lg border border-red-700/50">
                  {mistakes[selectedMistake].wrong}
                </div>
                <div className="bg-green-950/30 p-4 rounded-lg border border-green-700/50">
                  {mistakes[selectedMistake].right}
                </div>
              </div>
            </div>

            {/* Quick checklist */}
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-neutral-300 mb-3">Pre-Submission Checklist</h5>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 text-neutral-400">
                  <input type="checkbox" className="rounded" />
                  Did I identify what I'm solving for? P(_|_)
                </label>
                <label className="flex items-center gap-2 text-neutral-400">
                  <input type="checkbox" className="rounded" />
                  Did I write down all given probabilities?
                </label>
                <label className="flex items-center gap-2 text-neutral-400">
                  <input type="checkbox" className="rounded" />
                  Did I calculate P(Evidence) correctly?
                </label>
                <label className="flex items-center gap-2 text-neutral-400">
                  <input type="checkbox" className="rounded" />
                  Do my posteriors sum to 1 (if applicable)?
                </label>
                <label className="flex items-center gap-2 text-neutral-400">
                  <input type="checkbox" className="rounded" />
                  Does my answer make intuitive sense?
                </label>
              </div>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}

// Section 4: Speed Practice
function SpeedPracticeSection() {
  const contentRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
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
  }, [currentProblem]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const problems = [
    {
      question: "P(Rain) = 0.3, P(Wet|Rain) = 0.9, P(Wet|No Rain) = 0.1. Find P(Rain|Wet).",
      answer: "0.73",
      solution: "(0.9 × 0.3) / (0.9 × 0.3 + 0.1 × 0.7) = 0.27 / 0.34 ≈ 0.73"
    },
    {
      question: "Prior odds 1:9, Likelihood ratio 5:1. Find posterior probability.",
      answer: "0.36",
      solution: "Posterior odds = 5:9, so P = 5/14 ≈ 0.36"
    },
    {
      question: "P(A) = 0.4, P(B) = 0.3, P(C) = 0.3. P(+|A) = 0.8, P(+|B) = 0.5, P(+|C) = 0.2. Find P(A|+).",
      answer: "0.64",
      solution: "(0.8 × 0.4) / (0.8 × 0.4 + 0.5 × 0.3 + 0.2 × 0.3) = 0.32 / 0.53 ≈ 0.64"
    },
    {
      question: "Disease prevalence 0.01, test sensitivity 0.95, specificity 0.90. Find P(Disease|+).",
      answer: "0.087",
      solution: "(0.95 × 0.01) / (0.95 × 0.01 + 0.10 × 0.99) = 0.0095 / 0.1085 ≈ 0.087"
    },
    {
      question: "P(Spam) = 0.4, word appears in 80% of spam, 10% of ham. Find P(Spam|word).",
      answer: "0.84",
      solution: "(0.8 × 0.4) / (0.8 × 0.4 + 0.1 × 0.6) = 0.32 / 0.38 ≈ 0.84"
    }
  ];

  const startPractice = () => {
    setTimeLeft(60);
    setIsRunning(true);
    setCurrentProblem(0);
    setAnswers([]);
    setShowResults(false);
  };

  const submitAnswer = (answer) => {
    const newAnswers = [...answers, { 
      problem: currentProblem, 
      answer, 
      correct: answer === problems[currentProblem].answer 
    }];
    setAnswers(newAnswers);
    
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
    } else {
      setIsRunning(false);
      setShowResults(true);
    }
  };

  const score = answers.filter(a => a.correct).length;

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="60-Second Speed Challenge">
          <div className="space-y-6">
            {!isRunning && !showResults ? (
              // Start screen
              <div className="text-center py-8">
                <Timer className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Speed Practice Challenge</h4>
                <p className="text-neutral-400 mb-6">
                  Solve 5 Bayes problems in 60 seconds. Quick mental math only!
                </p>
                <Button variant="primary" size="lg" onClick={startPractice}>
                  Start Challenge
                </Button>
              </div>
            ) : showResults ? (
              // Results screen
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Score: {score}/{problems.length}
                  </h4>
                  <p className="text-neutral-400">
                    Time: {60 - timeLeft} seconds
                  </p>
                </div>
                
                <div className="space-y-3">
                  {problems.map((problem, idx) => {
                    const answer = answers.find(a => a.problem === idx);
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-3 rounded-lg",
                          answer?.correct ? "bg-green-950/30 border border-green-700/50" : "bg-red-950/30 border border-red-700/50"
                        )}
                      >
                        <p className="text-sm text-neutral-300">{problem.question}</p>
                        <p className="text-xs mt-1">
                          <span className="text-neutral-500">Answer: </span>
                          <span className="font-mono">{problem.answer}</span>
                          {answer && !answer.correct && (
                            <span className="text-red-400 ml-2">(You: {answer.answer})</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{problem.solution}</p>
                      </div>
                    );
                  })}
                </div>
                
                <Button variant="primary" onClick={startPractice} className="w-full">
                  Try Again
                </Button>
              </div>
            ) : (
              // Active practice
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                  <span className="text-neutral-400">Problem {currentProblem + 1} of {problems.length}</span>
                  <span className={cn(
                    "font-bold font-mono text-lg",
                    timeLeft < 10 ? "text-red-400" : "text-white"
                  )}>
                    {timeLeft}s
                  </span>
                </div>
                
                <div className="bg-blue-950/30 p-6 rounded-lg border border-blue-700/50">
                  <p className="text-lg text-neutral-300">
                    {problems[currentProblem].question}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {["0.087", "0.36", "0.64", "0.73", "0.84", "0.16"].map(option => (
                    <Button
                      key={option}
                      variant="secondary"
                      onClick={() => submitAnswer(option)}
                      className="py-6 text-lg font-mono"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                
                <p className="text-center text-sm text-neutral-500">
                  Select the closest answer
                </p>
              </div>
            )}
          </div>
        </VisualizationSection>

        {!isRunning && !showResults && (
          <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-700/50 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Speed Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
              <li>Round aggressively - exact answers not needed</li>
              <li>Use odds form for 50/50 priors</li>
              <li>Remember: 0.01 = 1%, 0.1 = 10%</li>
              <li>Common pattern: rare disease = low posterior despite good test</li>
            </ul>
          </div>
        )}
      </div>
    </SectionContent>
  );
}