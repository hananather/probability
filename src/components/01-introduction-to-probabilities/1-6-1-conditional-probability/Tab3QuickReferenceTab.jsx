"use client";

import React, { useEffect, useRef, useState } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { createColorScheme } from '@/lib/design-system';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const colorScheme = createColorScheme('probability');

// Speed Practice Component
const SpeedPractice = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per problem
  const [isActive, setIsActive] = useState(false);
  
  const problems = [
    {
      question: "P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.12. Find P(A|B).",
      answer: "0.3",
      solution: "P(A|B) = P(A∩B)/P(B) = 0.12/0.4 = 0.3"
    },
    {
      question: "P(A) = 0.5, P(B|A) = 0.6. Find P(A∩B).",
      answer: "0.3",
      solution: "P(A∩B) = P(B|A)·P(A) = 0.6×0.5 = 0.3"
    },
    {
      question: "P(A) = 0.4, P(B) = 0.5, P(A|B) = 0.4. Are A and B independent?",
      answer: "Yes",
      solution: "P(A|B) = P(A) = 0.4, so they are independent"
    },
    {
      question: "Disease rate: 1%, Test sensitivity: 90%, Test specificity: 95%. P(Disease|Positive) = ?",
      answer: "≈ 0.154",
      solution: "Using Bayes: P(D|+) = (0.9×0.01)/[(0.9×0.01)+(0.05×0.99)] ≈ 0.154"
    },
    {
      question: "Urn has 3 red, 2 blue balls. Draw 2 without replacement. P(2nd red | 1st red) = ?",
      answer: "1/2",
      solution: "After drawing 1 red: 2 red, 2 blue remain. P = 2/4 = 1/2"
    }
  ];
  
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowAnswer(true);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  const startTimer = () => {
    setIsActive(true);
    setTimeLeft(120);
    setShowAnswer(false);
  };
  
  const nextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
      setShowAnswer(false);
      setTimeLeft(120);
      setIsActive(true);
    }
  };
  
  const markAnswer = (correct) => {
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    setShowAnswer(true);
    setIsActive(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium text-neutral-300">
          Problem {currentProblem + 1} of {problems.length}
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className={`font-mono ${timeLeft < 30 ? 'text-red-400' : 'text-neutral-300'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="text-sm text-neutral-400">
            Score: <span className="font-mono">{score.correct}/{score.total}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-800 p-6 rounded-lg">
        <p className="text-lg text-neutral-200 mb-4">
          {problems[currentProblem].question}
        </p>
        
        {!isActive && !showAnswer && (
          <button
            onClick={startTimer}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white rounded transition-all duration-1500"
          >
            Start Timer
          </button>
        )}
        
        {isActive && (
          <div className="flex gap-3">
            <button
              onClick={() => markAnswer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#10b981]/80 text-white rounded transition-all duration-1500"
            >
              <CheckCircle2 className="w-4 h-4" />
              I got it right
            </button>
            <button
              onClick={() => markAnswer(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#ef4444]/80 text-white rounded transition-all duration-1500"
            >
              <XCircle className="w-4 h-4" />
              I need help
            </button>
          </div>
        )}
        
        {showAnswer && (
          <div className="mt-4 space-y-3">
            <div className="bg-blue-900/20 p-3 rounded">
              <p className="text-sm font-semibold text-blue-400">Answer:</p>
              <p className="text-neutral-200 font-mono">{problems[currentProblem].answer}</p>
            </div>
            <div className="bg-neutral-700 p-3 rounded">
              <p className="text-sm font-semibold text-neutral-300">Solution:</p>
              <p className="text-neutral-300">{problems[currentProblem].solution}</p>
            </div>
            {currentProblem < problems.length - 1 ? (
              <button
                onClick={nextProblem}
                className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#8b5cf6]/80 text-white rounded transition-all duration-1500"
              >
                Next Problem
              </button>
            ) : (
              <div className="bg-green-900/20 p-4 rounded border border-green-600/30">
                <p className="text-green-400 font-semibold">
                  Practice Complete! Score: <span className="font-mono">{score.correct}/{score.total}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Formula Sheet',
    content: ({ sectionIndex, isCompleted }) => {
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
          </div>
        </SectionContent>
      );
    }
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
                      Have: Partition {A₁, A₂, ...} → Need: P(B)
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
                  ❌ Mistake 1: Confusing P(A|B) with P(B|A)
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
                  ❌ Mistake 2: Forgetting P(B) > 0 requirement
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
                  ❌ Mistake 3: Assuming independence without checking
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
                  ❌ Mistake 4: Wrong denominator in Bayes
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
                  ❌ Mistake 5: Mishandling "at least one" problems
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
          🎯 Pro Tip: When stuck, draw a Venn diagram or tree diagram. 
          Visual representations often reveal the solution path!
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'speed-practice',
    title: 'Speed Practice',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Timed Practice Problems">
          <p className="text-neutral-300 mb-4">
            Practice these 5 problems with a 2-minute timer each. 
            This simulates exam conditions where speed matters!
          </p>
          
          <SpeedPractice />
          
          <div className="mt-6 bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <h5 className="font-semibold text-blue-400 mb-2">
              Speed Tips:
            </h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
              <li>Identify the type of problem immediately</li>
              <li>Write down given information clearly</li>
              <li>Choose the right formula without hesitation</li>
              <li>Check if events are independent early</li>
              <li>Use fractions when possible (more accurate)</li>
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
      description="Everything you need for the exam"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="violet"
      showBackToHub={false}
    />
  );
}