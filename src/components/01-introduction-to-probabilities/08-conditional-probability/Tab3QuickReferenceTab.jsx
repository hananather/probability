"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import MathJaxSection from '@/components/ui/MathJaxSection';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { createColorScheme } from '@/lib/design-system';
import { CheckCircle2 } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const colorScheme = createColorScheme('probability');

// Practice Problems Component
const PracticeProblems = React.memo(() => {
  const contentRef = useRef(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Use the safe MathJax hook
  useMathJax(contentRef, [currentProblem, showAnswer]);
  
  
  const problems = [
    {
      question: "P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.12. Find P(A|B).",
      questionLatex: `\\(P(A) = 0.3\\), \\(P(B) = 0.4\\), \\(P(A \\cap B) = 0.12\\). Find \\(P(A|B)\\).`,
      answer: "0.3",
      solution: "P(A|B) = P(A∩B)/P(B) = 0.12/0.4 = 0.3",
      solutionLatex: `\\(P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.12}{0.4} = 0.3\\)`
    },
    {
      question: "P(A) = 0.5, P(B|A) = 0.6. Find P(A∩B).",
      questionLatex: `\\(P(A) = 0.5\\), \\(P(B|A) = 0.6\\). Find \\(P(A \\cap B)\\).`,
      answer: "0.3",
      solution: "P(A∩B) = P(B|A)·P(A) = 0.6×0.5 = 0.3",
      solutionLatex: `\\(P(A \\cap B) = P(B|A) \\cdot P(A) = 0.6 \\times 0.5 = 0.3\\)`
    },
    {
      question: "P(A) = 0.4, P(B) = 0.5, P(A|B) = 0.4. Are A and B independent?",
      questionLatex: `\\(P(A) = 0.4\\), \\(P(B) = 0.5\\), \\(P(A|B) = 0.4\\). Are A and B independent?`,
      answer: "Yes",
      solution: "P(A|B) = P(A) = 0.4, so they are independent",
      solutionLatex: `\\(P(A|B) = P(A) = 0.4\\), so they are independent`
    },
    {
      question: "Disease rate: 1%, Test sensitivity: 90%, Test specificity: 95%. P(Disease|Positive) = ?",
      questionLatex: "Disease rate: 1%, Test sensitivity: 90%, Test specificity: 95%. \\(P(\\text{Disease}|\\text{Positive}) = ?\\)",
      answer: "≈ 0.154",
      solution: "Using Bayes: P(D|+) = (0.9×0.01)/[(0.9×0.01)+(0.05×0.99)] ≈ 0.154",
      solutionLatex: "Using Bayes: \\(P(D|+) = \\frac{0.9 \\times 0.01}{(0.9 \\times 0.01) + (0.05 \\times 0.99)} \\approx 0.154\\)"
    },
    {
      question: "Urn has 3 red, 2 blue balls. Draw 2 without replacement. P(2nd red | 1st red) = ?",
      questionLatex: "Urn has 3 red, 2 blue balls. Draw 2 without replacement. \\(P(\\text{2nd red} | \\text{1st red}) = ?\\)",
      answer: "1/2",
      solution: "After drawing 1 red: 2 red, 2 blue remain. P = 2/4 = 1/2",
      solutionLatex: "After drawing 1 red: 2 red, 2 blue remain. \\(P = \\frac{2}{4} = \\frac{1}{2}\\)"
    }
  ];
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  const nextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
      setShowAnswer(false);
    }
  };
  
  const previousProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(prev => prev - 1);
      setShowAnswer(false);
    }
  };
  
  return (
    <div ref={contentRef} className="space-y-4 font-mono">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium text-neutral-300">
          Problem {currentProblem + 1} of {problems.length}
        </h4>
      </div>
      
      <div className="bg-neutral-800 p-6 rounded-lg">
        <div key={`problem-${currentProblem}`} className="text-lg text-neutral-200 mb-4">
          <span dangerouslySetInnerHTML={{ __html: problems[currentProblem].questionLatex }} />
        </div>
        
        {!showAnswer && (
          <button
            onClick={toggleAnswer}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white rounded transition-all duration-200"
          >
            Show Answer
          </button>
        )}
        
        {showAnswer && (
          <div className="mt-4 space-y-3">
            <div className="bg-blue-900/20 p-3 rounded">
              <p className="text-sm font-semibold text-blue-400">Answer:</p>
              <p className="text-neutral-200 font-mono">{problems[currentProblem].answer}</p>
            </div>
            <div className="bg-neutral-700 p-3 rounded">
              <p className="text-sm font-semibold text-neutral-300">Solution:</p>
              <div key={`solution-${currentProblem}`} className="text-neutral-300">
                <span dangerouslySetInnerHTML={{ __html: problems[currentProblem].solutionLatex }} />
              </div>
            </div>
            <div className="flex gap-3">
              {currentProblem > 0 && (
                <button
                  onClick={previousProblem}
                  className="px-4 py-2 bg-neutral-600 hover:bg-neutral-600/80 text-white rounded transition-all duration-200"
                >
                  Previous
                </button>
              )}
              {currentProblem < problems.length - 1 && (
                <button
                  onClick={nextProblem}
                  className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#8b5cf6]/80 text-white rounded transition-all duration-200"
                >
                  Next Problem
                </button>
              )}
              <button
                onClick={toggleAnswer}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-700/80 text-white rounded transition-all duration-200"
              >
                Hide Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Formula Sheet',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Essential Formulas">
              <ExampleSection title="Core Formulas">
                <div className="space-y-4">
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-neutral-200 mb-2">Conditional Probability</h5>
                    <Formula>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(A|B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(B) > 0\\]` 
                      }} />
                    </Formula>
                    <p className="text-sm text-neutral-400 mt-2">
                      Use when: You know the joint probability and want conditional
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-neutral-200 mb-2">Multiplication Rule</h5>
                    <Formula>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(A \\cap B) = P(A|B) \\cdot P(B) = P(B|A) \\cdot P(A)\\]` 
                      }} />
                    </Formula>
                    <p className="text-sm text-neutral-400 mt-2">
                      Use when: Finding joint probability from conditionals
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-neutral-200 mb-2">Bayes' Theorem</h5>
                    <Formula>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\]` 
                      }} />
                    </Formula>
                    <p className="text-sm text-neutral-400 mt-2">
                      Use when: You have P(B|A) but need P(A|B)
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-neutral-200 mb-2">Law of Total Probability</h5>
                    <Formula>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(B) = \\sum_{i} P(B|A_i) \\cdot P(A_i)\\]` 
                      }} />
                    </Formula>
                    <p className="text-sm text-neutral-400 mt-2">
                      Use when: A<sub>i</sub> form a partition of the sample space
                    </p>
                  </div>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Special Cases">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-purple-900/20 p-3 rounded">
                    <p className="font-semibold text-purple-400">Independence</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(A|B) = P(A) \\Leftrightarrow P(A \\cap B) = P(A) \\cdot P(B)\\]` 
                    }} />
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded">
                    <p className="font-semibold text-blue-400">Complement</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(A^c|B) = 1 - P(A|B)\\]` 
                    }} />
                  </div>
                </div>
              </ExampleSection>
            </WorkedExample>
        </MathJaxSection>
      </SectionContent>
    )
  },
  {
    id: 'decision-guide',
    title: 'Decision Guide',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Which Formula to Use?">
          <ExampleSection title="Decision Flowchart">
            <div className="space-y-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <p className="font-semibold text-neutral-200 mb-3">
                  Start Here: What do you have? What do you need?
                </p>
                
                <div className="space-y-3">
                  <div className="ml-4 border-l-2 border-blue-500 pl-4">
                    <p className="text-neutral-300 font-medium">
                      Have: P(A∩B) and P(B) → Need: P(A|B)
                    </p>
                    <p className="text-sm text-blue-400 mt-1">
                      ✓ Use definition: P(A|B) = P(A∩B)/P(B)
                    </p>
                  </div>
                  
                  <div className="ml-4 border-l-2 border-green-500 pl-4">
                    <p className="text-neutral-300 font-medium">
                      Have: P(A|B) and P(B) → Need: P(A∩B)
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      ✓ Use multiplication: P(A∩B) = P(A|B)·P(B)
                    </p>
                  </div>
                  
                  <div className="ml-4 border-l-2 border-purple-500 pl-4">
                    <p className="text-neutral-300 font-medium">
                      Have: P(B|A), P(A), P(B) → Need: P(A|B)
                    </p>
                    <p className="text-sm text-purple-400 mt-1">
                      ✓ Use Bayes: P(A|B) = P(B|A)·P(A)/P(B)
                    </p>
                  </div>
                  
                  <div className="ml-4 border-l-2 border-amber-500 pl-4">
                    <p className="text-neutral-300 font-medium">
                      Have: Partition {`{A₁, A₂, ...} → Need: P(B)`}
                    </p>
                    <p className="text-sm text-amber-400 mt-1">
                      ✓ Use total probability: P(B) = Σ P(B|Aᵢ)·P(Aᵢ)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Quick Recognition Patterns">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-900/20 p-3 rounded">
                <p className="font-semibold text-red-400 mb-1">Medical Testing</p>
                <p className="text-sm text-neutral-300">
                  → Usually Bayes' theorem (test result given disease)
                </p>
              </div>
              
              <div className="bg-blue-900/20 p-3 rounded">
                <p className="font-semibold text-blue-400 mb-1">Quality Control</p>
                <p className="text-sm text-neutral-300">
                  → Often total probability (multiple factories)
                </p>
              </div>
              
              <div className="bg-green-900/20 p-3 rounded">
                <p className="font-semibold text-green-400 mb-1">Card/Dice Problems</p>
                <p className="text-sm text-neutral-300">
                  → Direct counting or definition
                </p>
              </div>
              
              <div className="bg-purple-900/20 p-3 rounded">
                <p className="font-semibold text-purple-400 mb-1">Sequential Events</p>
                <p className="text-sm text-neutral-300">
                  → Chain rule (multiplication)
                </p>
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Avoid These Errors">
          <ExampleSection title="Top 5 Mistakes">
            <div className="space-y-4">
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">
                  Mistake 1: Confusing P(A|B) with P(B|A)
                </h5>
                <p className="text-neutral-300 text-sm">
                  These are completely different! P(Disease|Positive) ≠ P(Positive|Disease)
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✓ Fix: Always read carefully - which is the condition?
                </p>
              </div>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">
                  Mistake 2: Forgetting P(B) {`>`} 0 requirement
                </h5>
                <p className="text-neutral-300 text-sm">
                  P(A|B) is undefined when P(B) = 0
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✓ Fix: Always check that the conditioning event is possible
                </p>
              </div>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">
                  Mistake 3: Assuming independence without checking
                </h5>
                <p className="text-neutral-300 text-sm">
                  Don't assume P(A∩B) = P(A)·P(B) unless verified!
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✓ Fix: Test independence explicitly or look for keywords
                </p>
              </div>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">
                  Mistake 4: Wrong denominator in Bayes
                </h5>
                <p className="text-neutral-300 text-sm">
                  Forgetting to calculate P(B) using total probability
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✓ Fix: P(B) = P(B|A)·P(A) + P(B|A<sup>c</sup>)·P(A<sup>c</sup>)
                </p>
              </div>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
                <h5 className="font-semibold text-red-400 mb-2">
                  Mistake 5: Mishandling "at least one" problems
                </h5>
                <p className="text-neutral-300 text-sm">
                  P(at least one) ≠ P(exactly one)
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✓ Fix: Use complement: P(at least one) = 1 - P(none)
                </p>
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
        
        <InsightBox variant="warning">
          Pro Tip: When stuck, draw a Venn diagram or tree diagram. 
          Visual representations often reveal the solution path!
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'practice-problems',
    title: 'Practice Problems',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Practice Problems">
          <p className="text-neutral-300 mb-4">
            Practice these 5 problems. Click "Show Answer" to reveal the solution.
          </p>
          
          <PracticeProblems />
          
          <div className="mt-6 bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <h5 className="font-semibold text-blue-400 mb-2">
              Problem-Solving Tips:
            </h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
              <li>Identify the type of problem (conditional, independence, etc.)</li>
              <li>Write down given information clearly</li>
              <li>Choose the right formula based on what you have and need</li>
              <li>Check if events are independent when relevant</li>
              <li>Use fractions when possible for exact answers</li>
            </ul>
          </div>
        </WorkedExample>
      </SectionContent>
    )
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Essential formulas and practice problems"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="violet"
      showBackToHub={false}
    />
  );
}