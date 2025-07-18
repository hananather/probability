"use client";

import React, { useState } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { Button } from '@/components/ui/button';
import { useMathJax } from '@/hooks/useMathJax';
import { cn } from '@/lib/utils';
import { createColorScheme } from '@/lib/design-system';
import { Calculator, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// Use consistent color scheme
const colorScheme = createColorScheme('blue');

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
      showHeader={false}
      showBackToHub={false}
    />
  );
}

// Section 1: Basic Example
const BasicExampleSection = React.memo(function BasicExampleSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">📊 Factory Quality Control Problem</h3>
        <p className="text-neutral-300 mb-4">
          A factory produces widgets with the following characteristics:
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
          <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Defective}) = 0.02\\)` }} /> (2% of widgets are defective)</li>
          <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Fail Test}|\\text{Defective}) = 0.98\\)` }} /> (98% of defective widgets fail the test)</li>
          <li><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Fail Test}|\\text{Good}) = 0.05\\)` }} /> (5% of good widgets fail the test)</li>
        </ul>
        <p className="mt-4 font-semibold text-yellow-400">
          Question: If a widget fails the test, what's the probability it's defective?
        </p>
      </div>

      <StepByStepCalculation title="Step-by-Step Solution" theme="blue">
        <CalculationStep title="Step 1: Set Up Bayes' Theorem" variant="default">
          <p className="text-neutral-300 mb-3">
            We want to find <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Defective}|\\text{Fail Test})\\)` }} />
          </p>
          <FormulaDisplay formula="P(\text{Defective}|\text{Fail Test}) = \frac{P(\text{Fail Test}|\text{Defective}) \cdot P(\text{Defective})}{P(\text{Fail Test})}" />
        </CalculationStep>

        <CalculationStep title="Step 2: Calculate P(Fail Test) using Total Probability" variant="default">
          <FormulaDisplay formula="P(\text{Fail Test}) = P(\text{Fail Test}|\text{Defective}) \cdot P(\text{Defective}) + P(\text{Fail Test}|\text{Good}) \cdot P(\text{Good})" />
          <FormulaDisplay formula="= 0.98 \times 0.02 + 0.05 \times 0.98" />
          <FormulaDisplay formula="= 0.0196 + 0.049 = 0.0686" />
        </CalculationStep>

        <CalculationStep title="Step 3: Apply Bayes' Theorem" variant="highlight">
          <FormulaDisplay formula="P(\text{Defective}|\text{Fail Test}) = \frac{0.98 \times 0.02}{0.0686}" />
          <FormulaDisplay formula="= \frac{0.0196}{0.0686} \approx 0.286" />
          <p className="mt-4 font-semibold text-green-400 text-center">
            Answer: About 28.6% chance the widget is defective
          </p>
        </CalculationStep>
      </StepByStepCalculation>

      <SimpleInsightBox variant="info" className="border-blue-700/50">
        <h4 className="font-semibold text-blue-400 mb-2">Key Insight</h4>
        <p className="text-neutral-300">
          This counterintuitive result happens because the base rate of defects is low (2%). 
          Even with a good test, false positives outnumber true positives when the condition is rare.
        </p>
      </SimpleInsightBox>
    </div>
  );
});

// Section 2: Exam-Level Example
const ExamLevelSection = React.memo(function ExamLevelSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border border-teal-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-teal-300 mb-4">🎯 Multi-Hypothesis Problem</h3>
        <p className="text-neutral-300 mb-4 font-semibold">Three boxes contain colored balls:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-neutral-800/50 p-3 rounded border border-neutral-600/30">
            <p className="font-semibold text-orange-400">Box A</p>
            <p className="text-sm text-neutral-300">2 red, 3 blue</p>
            <p className="text-xs text-neutral-400"><span dangerouslySetInnerHTML={{ __html: '\\(P(A) = 0.3\\)' }} /></p>
          </div>
          <div className="bg-neutral-800/50 p-3 rounded border border-neutral-600/30">
            <p className="font-semibold text-blue-400">Box B</p>
            <p className="text-sm text-neutral-300">3 red, 2 blue</p>
            <p className="text-xs text-neutral-400"><span dangerouslySetInnerHTML={{ __html: '\\(P(B) = 0.5\\)' }} /></p>
          </div>
          <div className="bg-neutral-800/50 p-3 rounded border border-neutral-600/30">
            <p className="font-semibold text-green-400">Box C</p>
            <p className="text-sm text-neutral-300">1 red, 4 blue</p>
            <p className="text-xs text-neutral-400"><span dangerouslySetInnerHTML={{ __html: '\\(P(C) = 0.2\\)' }} /></p>
          </div>
        </div>
        <p className="font-semibold text-yellow-400">
          Question: You randomly select a box and draw a red ball. Find <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Box B | Red ball})\\)' }} />
        </p>
      </div>

      <StepByStepCalculation title="Multi-Hypothesis Solution" theme="teal">
        <CalculationStep title="Step 1: Calculate P(Red | Each Box)" variant="default">
          <div className="space-y-2">
            <FormulaDisplay formula="P(\text{Red}|A) = \frac{2}{5} = 0.4" />
            <FormulaDisplay formula="P(\text{Red}|B) = \frac{3}{5} = 0.6" />
            <FormulaDisplay formula="P(\text{Red}|C) = \frac{1}{5} = 0.2" />
          </div>
        </CalculationStep>

        <CalculationStep title="Step 2: Calculate Total P(Red)" variant="default">
          <FormulaDisplay formula="P(\text{Red}) = P(\text{Red}|A)P(A) + P(\text{Red}|B)P(B) + P(\text{Red}|C)P(C)" />
          <FormulaDisplay formula="= 0.4 \times 0.3 + 0.6 \times 0.5 + 0.2 \times 0.2" />
          <FormulaDisplay formula="= 0.12 + 0.30 + 0.04 = 0.46" />
        </CalculationStep>

        <CalculationStep title="Step 3: Apply Bayes' Theorem" variant="highlight">
          <FormulaDisplay formula="P(B|\text{Red}) = \frac{P(\text{Red}|B) \cdot P(B)}{P(\text{Red})}" />
          <FormulaDisplay formula="= \frac{0.6 \times 0.5}{0.46} = \frac{0.30}{0.46}" />
          <FormulaDisplay formula="= \frac{15}{23} \approx 0.652" />
          <p className="mt-4 font-semibold text-green-400 text-center">
            Answer: 65.2% chance it came from Box B
          </p>
        </CalculationStep>

        <CalculationStep title="Step 4: Verification" variant="default">
          <p className="text-neutral-300 mb-3">All posterior probabilities should sum to 1:</p>
          <div className="space-y-1">
            <FormulaDisplay formula="P(A|\text{Red}) = \frac{0.12}{0.46} \approx 0.261" />
            <FormulaDisplay formula="P(B|\text{Red}) = \frac{0.30}{0.46} \approx 0.652" />
            <FormulaDisplay formula="P(C|\text{Red}) = \frac{0.04}{0.46} \approx 0.087" />
          </div>
          <p className="mt-3 text-center text-green-400 font-semibold">✓ Sum = 0.261 + 0.652 + 0.087 = 1.000 ✓</p>
        </CalculationStep>
      </StepByStepCalculation>

      <SimpleInsightBox variant="success" className="border-purple-700/50">
        <h4 className="font-semibold text-purple-400 mb-2">Exam Strategy Tips</h4>
        <ul className="list-disc list-inside space-y-1 text-neutral-300">
          <li>Always verify your posteriors sum to 1</li>
          <li>Keep fractions when possible for exact answers</li>
          <li>Draw a probability tree if the problem gets complex</li>
          <li>Double-check your <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Evidence})\\)' }} /> calculation - it's where most errors occur</li>
        </ul>
      </SimpleInsightBox>
    </div>
  );
});

// Section 3: Variations
const VariationsSection = React.memo(function VariationsSection() {
  const [activeVariation, setActiveVariation] = useState(0);
  const contentRef = useMathJax([activeVariation]);

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
            <p>Estimating a parameter <span dangerouslySetInnerHTML={{ __html: '\\(\\theta\\)' }} /> from noisy measurements</p>
            <p>Prior: <span dangerouslySetInnerHTML={{ __html: '\\(\\theta \\sim \\text{Normal}(\\mu_0, \\sigma_0^2)\\)' }} /></p>
            <p>Likelihood: <span dangerouslySetInnerHTML={{ __html: '\\(x|\\theta \\sim \\text{Normal}(\\theta, \\sigma^2)\\)' }} /></p>
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
            <p>Therefore <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Disease}|+) = 1/6 \\approx 16.7\\%\\)' }} /></p>
          </div>
          <div className="mt-3" dangerouslySetInnerHTML={{ 
            __html: `\\[\\text{Posterior Odds} = \\text{Likelihood Ratio} \\times \\text{Prior Odds}\\]` 
          }} />
        </div>
      )
    }
  ];

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-4">🔄 Common Variations You'll Encounter</h3>
        
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
      </div>

      <SimpleInsightBox variant="warning" className="border-yellow-700/50">
        <h4 className="font-semibold text-yellow-400 mb-2">Pattern Recognition</h4>
        <p className="text-neutral-300">
          All variations follow the same core principle: posterior ∝ likelihood × prior. 
          The key is recognizing which form to use for your specific problem.
        </p>
      </SimpleInsightBox>
    </div>
  );
});

// Section 4: Practice Time
const PracticeSection = React.memo(function PracticeSection() {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const contentRef = useMathJax([currentProblem, showSolution]);

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
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">✏️ Test Your Understanding</h3>
        
        {/* Score display */}
        <div className="flex justify-between items-center p-4 bg-neutral-800/50 rounded-lg mb-6">
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
        <div className="bg-blue-950/30 p-6 rounded-lg border border-blue-700/50 mb-6">
          <h4 className="font-semibold text-blue-400 mb-3">
            Problem {currentProblem + 1} of {problems.length}
          </h4>
          <p className="text-neutral-300">{problem.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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

      <SimpleInsightBox variant="success" className="border-green-700/50">
        <h4 className="font-semibold text-green-400 mb-2">Practice Tips</h4>
        <ul className="list-disc list-inside space-y-1 text-neutral-300">
          <li>Always identify what you're looking for: <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Hypothesis|Evidence})\\)' }} /></li>
          <li>Write out all the given probabilities before starting</li>
          <li>Use the expanded form when calculating <span dangerouslySetInnerHTML={{ __html: '\\(P(\\text{Evidence})\\)' }} /></li>
          <li>Check your answer makes intuitive sense</li>
        </ul>
      </SimpleInsightBox>
    </div>
  );
});