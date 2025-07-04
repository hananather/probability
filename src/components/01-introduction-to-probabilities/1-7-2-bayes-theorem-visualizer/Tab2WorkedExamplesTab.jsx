"use client";

import React, { useRef, useEffect, useState } from 'react';
import SectionBasedContent, { SectionContent, MathFormula, InteractiveElement } from '@/components/ui/SectionBasedContent';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { WorkedExample, ExampleSection, CalculationSteps, InsightBox } from '@/components/ui/WorkedExample';
import { cn } from '@/lib/utils';
import { colors, createColorScheme } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';

// Use consistent color scheme
const colorScheme = createColorScheme('probability');
import { Calculator, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function Tab2WorkedExamplesTab({ onComplete }) {
  const sections = [
    {
      id: 'basic-example',
      title: 'Basic Example',
      icon: '📊',
      content: () => <BasicExampleSection />
    },
    {
      id: 'exam-level',
      title: 'Exam-Level Example',
      icon: '🎯',
      content: () => <ExamLevelSection />
    },
    {
      id: 'variations',
      title: 'Variations',
      icon: '🔄',
      content: () => <VariationsSection />
    },
    {
      id: 'practice',
      title: 'Practice Time',
      icon: '✏️',
      content: () => <PracticeSection />
    }
  ];

  return (
    <SectionBasedContent
      title="Worked Examples"
      description="Master Bayes' Theorem through step-by-step problem solving"
      sections={sections}
      onComplete={onComplete}
      progressVariant="blue"
      showBackToHub={false}
    />
  );
}

// Section 1: Basic Example
function BasicExampleSection() {
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

  const steps = [
    {
      title: "Identify Given Information",
      content: (
        <div>
          <p>A factory produces widgets. We know:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Defective}) = 0.02\\)` }} /> (2% of widgets are defective)</li>
            <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Fail Test}|\\text{Defective}) = 0.98\\)` }} /> (98% of defective widgets fail the test)</li>
            <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Fail Test}|\\text{Good}) = 0.05\\)` }} /> (5% of good widgets fail the test)</li>
          </ul>
          <p className="mt-3 font-semibold">Question: If a widget fails the test, what's the probability it's defective?</p>
        </div>
      )
    },
    {
      title: "Set Up Bayes' Theorem",
      content: (
        <div>
          <p>We want to find <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Defective}|\\text{Fail Test})\\)` }} /></p>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[P(\\text{Defective}|\\text{Fail Test}) = \\frac{P(\\text{Fail Test}|\\text{Defective}) \\cdot P(\\text{Defective})}{P(\\text{Fail Test})}\\]` 
          }} />
        </div>
      )
    },
    {
      title: "Calculate P(Fail Test) using Total Probability",
      content: (
        <div>
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[P(\\text{Fail Test}) = P(\\text{Fail Test}|\\text{Defective}) \\cdot P(\\text{Defective}) + P(\\text{Fail Test}|\\text{Good}) \\cdot P(\\text{Good})\\]` 
          }} />
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[= 0.98 \\times 0.02 + 0.05 \\times 0.98\\]` 
          }} />
          <div className="mt-2" dangerouslySetInnerHTML={{ 
            __html: `\\[= 0.0196 + 0.049 = 0.0686\\]` 
          }} />
        </div>
      )
    },
    {
      title: "Apply Bayes' Theorem",
      content: (
        <div>
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[P(\\text{Defective}|\\text{Fail Test}) = \\frac{0.98 \\times 0.02}{0.0686}\\]` 
          }} />
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[= \\frac{0.0196}{0.0686} \\approx 0.286\\]` 
          }} />
          <p className="mt-4 font-semibold text-green-400">
            Answer: About 28.6% chance the widget is defective
          </p>
        </div>
      )
    }
  ];

  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample
          problem={{
            statement: "A factory quality control test for defective widgets",
            context: "This is a classic application of Bayes' Theorem in quality control"
          }}
          steps={steps}
          solution={{
            answer: "P(Defective|Fail Test) ≈ 0.286 or 28.6%",
            interpretation: "Even though the test is quite accurate (98% for defective, 95% for good), most widgets that fail are actually good because defective widgets are rare (only 2%)."
          }}
        />

        <div className="mt-6 p-4 bg-blue-950/30 border border-blue-700/50 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Key Insight</h4>
          <p className="text-neutral-300 text-sm">
            This counterintuitive result happens because the base rate of defects is low (2%). 
            Even with a good test, false positives outnumber true positives when the condition is rare.
          </p>
        </div>
      </div>
    </SectionContent>
  );
}

// Section 2: Exam-Level Example
function ExamLevelSection() {
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

  const steps = [
    {
      title: "Parse the Complex Problem",
      content: (
        <div>
          <p className="font-semibold">Three boxes contain colored balls:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Box A: 2 red, 3 blue (chosen with probability 0.3)</li>
            <li>Box B: 3 red, 2 blue (chosen with probability 0.5)</li>
            <li>Box C: 1 red, 4 blue (chosen with probability 0.2)</li>
          </ul>
          <p className="mt-3">You randomly select a box and draw a ball. It's red.</p>
          <p className="font-semibold">Find: P(Box B | Red ball)</p>
        </div>
      )
    },
    {
      title: "Calculate P(Red | Each Box)",
      content: (
        <div>
          <p>Probability of drawing red from each box:</p>
          <div className="mt-3 space-y-2">
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Red}|A) = \\frac{2}{5} = 0.4\\)` }} /></div>
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Red}|B) = \\frac{3}{5} = 0.6\\)` }} /></div>
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Red}|C) = \\frac{1}{5} = 0.2\\)` }} /></div>
          </div>
        </div>
      )
    },
    {
      title: "Calculate Total P(Red)",
      content: (
        <div>
          <p>Using the law of total probability:</p>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[P(\\text{Red}) = P(\\text{Red}|A)P(A) + P(\\text{Red}|B)P(B) + P(\\text{Red}|C)P(C)\\]` 
          }} />
          <div className="mt-2" dangerouslySetInnerHTML={{ 
            __html: `\\[= 0.4 \\times 0.3 + 0.6 \\times 0.5 + 0.2 \\times 0.2\\]` 
          }} />
          <div className="mt-2" dangerouslySetInnerHTML={{ 
            __html: `\\[= 0.12 + 0.30 + 0.04 = 0.46\\]` 
          }} />
        </div>
      )
    },
    {
      title: "Apply Bayes' Theorem",
      content: (
        <div>
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[P(B|\\text{Red}) = \\frac{P(\\text{Red}|B) \\cdot P(B)}{P(\\text{Red})}\\]` 
          }} />
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[= \\frac{0.6 \\times 0.5}{0.46} = \\frac{0.30}{0.46}\\]` 
          }} />
          <div className="mt-2" dangerouslySetInnerHTML={{ 
            __html: `\\[= \\frac{30}{46} = \\frac{15}{23} \\approx 0.652\\]` 
          }} />
        </div>
      )
    },
    {
      title: "Verify with All Posteriors",
      content: (
        <div>
          <p>Let's calculate all posterior probabilities to verify:</p>
          <div className="mt-3 space-y-2">
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(A|\\text{Red}) = \\frac{0.12}{0.46} \\approx 0.261\\)` }} /></div>
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(B|\\text{Red}) = \\frac{0.30}{0.46} \\approx 0.652\\)` }} /></div>
            <div><span dangerouslySetInnerHTML={{ __html: `\\(P(C|\\text{Red}) = \\frac{0.04}{0.46} \\approx 0.087\\)` }} /></div>
          </div>
          <p className="mt-3 text-green-400">✓ Sum = 0.261 + 0.652 + 0.087 = 1.000 ✓</p>
        </div>
      )
    }
  ];

  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample
          problem={{
            statement: "Multi-hypothesis Bayes problem with three boxes",
            context: "Common exam problem involving multiple hypotheses and careful probability calculations"
          }}
          steps={steps}
          solution={{
            answer: "P(Box B | Red ball) = 15/23 ≈ 0.652 or 65.2%",
            interpretation: "Box B is most likely because it has both a high probability of being chosen (0.5) and a high proportion of red balls (3/5)."
          }}
        />

        <div className="mt-6 bg-purple-950/30 p-4 rounded-lg border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-2">Exam Tips</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
            <li>Always verify your posteriors sum to 1</li>
            <li>Keep fractions when possible for exact answers</li>
            <li>Draw a probability tree if the problem gets complex</li>
            <li>Double-check your P(Evidence) calculation - it's where most errors occur</li>
          </ul>
        </div>
      </div>
    </SectionContent>
  );
}

// Section 3: Variations
function VariationsSection() {
  const contentRef = useRef(null);
  const [activeVariation, setActiveVariation] = useState(0);
  
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
  }, [activeVariation]);

  const variations = [
    {
      title: "Sequential Updates",
      content: (
        <div>
          <p className="font-semibold mb-3">Updating beliefs with multiple pieces of evidence</p>
          <div className="bg-neutral-800/50 p-4 rounded-lg">
            <p>Initial: Patient has 1% chance of disease</p>
            <p>Test 1 positive: Updates to 16.7%</p>
            <p>Test 2 positive: Updates to 78.5%</p>
            <p>Test 3 positive: Updates to 98.7%</p>
          </div>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[P(H|D_1, D_2, ...) = P(H) \\prod_{i} \\frac{P(D_i|H)}{P(D_i|\\neg H)} \\cdot \\text{normalizer}\\]` 
          }} />
        </div>
      )
    },
    {
      title: "Multiple Hypotheses",
      content: (
        <div>
          <p className="font-semibold mb-3">When there are more than two possibilities</p>
          <div className="bg-neutral-800/50 p-4 rounded-lg">
            <p>Email classification: Spam, Promotional, Personal, Work</p>
            <p>Each category has different word probabilities</p>
          </div>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[P(H_i|D) = \\frac{P(D|H_i)P(H_i)}{\\sum_j P(D|H_j)P(H_j)}\\]` 
          }} />
          <p className="mt-2 text-sm text-neutral-400">The denominator sums over all hypotheses</p>
        </div>
      )
    },
    {
      title: "Continuous Variables",
      content: (
        <div>
          <p className="font-semibold mb-3">Bayes with probability densities</p>
          <div className="bg-neutral-800/50 p-4 rounded-lg">
            <p>Estimating a parameter θ from noisy measurements</p>
            <p>Prior: θ ~ Normal(μ₀, σ₀²)</p>
            <p>Likelihood: x|θ ~ Normal(θ, σ²)</p>
          </div>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[p(\\theta|x) = \\frac{p(x|\\theta)p(\\theta)}{p(x)}\\]` 
          }} />
          <p className="mt-2 text-sm text-neutral-400">Using probability densities instead of probabilities</p>
        </div>
      )
    },
    {
      title: "Odds Form",
      content: (
        <div>
          <p className="font-semibold mb-3">Useful for quick mental calculations</p>
          <div className="bg-neutral-800/50 p-4 rounded-lg">
            <p>Prior odds: 1:99 (1% disease prevalence)</p>
            <p>Likelihood ratio: 99:5 (test accuracy)</p>
            <p>Posterior odds: (1×99):(99×5) = 99:495 = 1:5</p>
            <p>Therefore P(Disease|+) = 1/6 ≈ 16.7%</p>
          </div>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[\\text{Posterior Odds} = \\text{Likelihood Ratio} \\times \\text{Prior Odds}\\]` 
          }} />
        </div>
      )
    }
  ];

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Common Variations You'll Encounter">
          <div className="mb-4 flex flex-wrap gap-2">
            {variations.map((v, i) => (
              <Button
                key={i}
                variant={activeVariation === i ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveVariation(i)}
              >
                {v.title}
              </Button>
            ))}
          </div>

          <div className="mt-6">
            {variations[activeVariation].content}
          </div>

          <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-700/50 rounded-lg">
            <h4 className="font-semibold text-yellow-400 mb-2">Pattern Recognition</h4>
            <p className="text-sm text-neutral-300">
              All variations follow the same core principle: posterior ∝ likelihood × prior. 
              The key is recognizing which form to use for your specific problem.
            </p>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}

// Section 4: Practice Time
function PracticeSection() {
  const contentRef = useRef(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  
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
      question: "A coin is either fair (50% heads) or biased (70% heads). You believe there's a 40% chance it's biased. You flip it once and get heads. What's the probability the coin is biased?",
      options: ["40%", "46.7%", "53.8%", "70%"],
      correct: 2,
      solution: "P(Biased|Heads) = (0.7 × 0.4) / (0.7 × 0.4 + 0.5 × 0.6) = 0.28 / 0.58 ≈ 53.8%"
    },
    {
      question: "1% of people have a certain gene. A test for the gene is 95% accurate (both sensitivity and specificity). Someone tests positive. What's the probability they have the gene?",
      options: ["1%", "16.1%", "50%", "95%"],
      correct: 1,
      solution: "P(Gene|+) = (0.95 × 0.01) / (0.95 × 0.01 + 0.05 × 0.99) = 0.0095 / 0.059 ≈ 16.1%"
    },
    {
      question: "An AI model classifies images as cats or dogs. On cat images, it says 'cat' 90% of the time. On dog images, it says 'cat' 20% of the time. In your dataset, 30% are cats. The model says 'cat'. What's P(actually cat)?",
      options: ["30%", "60%", "63.2%", "90%"],
      correct: 2,
      solution: "P(Cat|'cat') = (0.9 × 0.3) / (0.9 × 0.3 + 0.2 × 0.7) = 0.27 / 0.41 ≈ 63.2%"
    },
    {
      question: "Three identical-looking coins: one always heads, one always tails, one fair. You pick one randomly and flip it twice, getting two heads. What's the probability you have the always-heads coin?",
      options: ["1/3", "1/2", "2/3", "4/5"],
      correct: 3,
      solution: "P(Always-heads|HH) = (1 × 1/3) / (1 × 1/3 + 0.25 × 1/3 + 0 × 1/3) = (1/3) / (5/12) = 4/5"
    },
    {
      question: "A spam filter uses word frequency. 'Free' appears in 60% of spam and 1% of legitimate emails. Overall, 20% of emails are spam. An email contains 'free'. What's P(spam)?",
      options: ["20%", "60%", "88.2%", "93.8%"],
      correct: 3,
      solution: "P(Spam|'free') = (0.6 × 0.2) / (0.6 × 0.2 + 0.01 × 0.8) = 0.12 / 0.128 ≈ 93.8%"
    }
  ];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowSolution(true);
    setAttempted(attempted + 1);
    if (index === problems[currentProblem].correct) {
      setScore(score + 1);
    }
  };

  const nextProblem = () => {
    setCurrentProblem((currentProblem + 1) % problems.length);
    setSelectedAnswer(null);
    setShowSolution(false);
  };

  const resetPractice = () => {
    setCurrentProblem(0);
    setSelectedAnswer(null);
    setShowSolution(false);
    setScore(0);
    setAttempted(0);
  };

  const problem = problems[currentProblem];

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Test Your Understanding">
          <div className="space-y-6">
            {/* Score display */}
            <div className="flex justify-between items-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-neutral-400">Score:</span>
                <span className="font-bold text-xl text-white">{score}/{attempted}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetPractice}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* Problem */}
            <div className="bg-blue-950/30 p-6 rounded-lg border border-blue-700/50">
              <h4 className="font-semibold text-blue-400 mb-3">
                Problem {currentProblem + 1} of {problems.length}
              </h4>
              <p className="text-neutral-300">{problem.question}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showSolution && handleAnswer(index)}
                  disabled={showSolution}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    showSolution && index === problem.correct
                      ? "bg-green-900/30 border-green-600"
                      : showSolution && index === selectedAnswer && index !== problem.correct
                      ? "bg-red-900/30 border-red-600"
                      : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-500",
                    !showSolution && "cursor-pointer"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">{option}</span>
                    {showSolution && index === problem.correct && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {showSolution && index === selectedAnswer && index !== problem.correct && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Solution */}
            {showSolution && (
              <div className="bg-neutral-800/50 p-4 rounded-lg space-y-3">
                <h5 className="font-semibold text-neutral-300">Solution:</h5>
                <p className="text-sm text-neutral-400 font-mono">{problem.solution}</p>
                <Button
                  variant="primary"
                  onClick={nextProblem}
                  className="w-full"
                >
                  Next Problem
                </Button>
              </div>
            )}
          </div>
        </VisualizationSection>

        <div className="mt-6 p-4 bg-green-950/30 border border-green-700/50 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-2">Practice Tips</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
            <li>Always identify what you're looking for: P(Hypothesis|Evidence)</li>
            <li>Write out all the given probabilities before starting</li>
            <li>Use the expanded form when calculating P(Evidence)</li>
            <li>Check your answer makes intuitive sense</li>
          </ul>
        </div>
      </div>
    </SectionContent>
  );
}