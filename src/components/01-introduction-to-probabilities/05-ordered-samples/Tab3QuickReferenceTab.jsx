"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import SectionBasedContent, { SectionContent } from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { useMathJax } from '@/hooks/useMathJax';

const SECTIONS = [
  {
    id: 'core-formulas',
    title: 'Core Formulas',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Essential Permutation Formulas">
          <div className="space-y-6">
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-violet-400 mb-2">With Replacement</h5>
              <Formula latex="n^r" />
              <p className="text-sm text-neutral-300 mt-2">Choose r items from n options, can reuse</p>
              <p className="text-xs text-neutral-400 mt-1">Example: 3-digit PIN using 0-9: 10³ = 1,000</p>
            </div>
            
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-violet-400 mb-2">Without Replacement</h5>
              <Formula latex="P(n,r) = \frac{n!}{(n-r)!}" />
              <p className="text-sm text-neutral-300 mt-2">Choose r items from n options, no reuse</p>
              <p className="text-xs text-neutral-400 mt-1">Example: Choose president, VP from 10: P(10,2) = 90</p>
            </div>
            
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-violet-400 mb-2">All Items</h5>
              <Formula latex="n!" />
              <p className="text-sm text-neutral-300 mt-2">Arrange all n distinct items</p>
              <p className="text-xs text-neutral-400 mt-1">Example: Arrange 5 books: 5! = 120</p>
            </div>
            
            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <h5 className="font-semibold text-violet-400 mb-2">Circular</h5>
              <Formula latex="(n-1)!" />
              <p className="text-sm text-neutral-300 mt-2">Arrange n items in a circle</p>
              <p className="text-xs text-neutral-400 mt-1">Example: 5 people at round table: 4! = 24</p>
            </div>
          </div>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving Techniques',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="How to Approach Permutation Problems">
          <ExampleSection title="Step-by-Step Strategy">
            <div className="space-y-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h5 className="font-semibold text-violet-400 mb-2">1. Identify Type</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
                  <li>Can items repeat? → Use n^r</li>
                  <li>Order matters, no repeat? → Use P(n,r)</li>
                  <li>Arranging all items? → Use n!</li>
                  <li>Circular arrangement? → Use (n-1)!</li>
                </ul>
              </div>
              
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h5 className="font-semibold text-violet-400 mb-2">2. Common Patterns</h5>
                <ComparisonTable
                  columns={[
                    { key: 'keyword', title: 'Keyword' },
                    { key: 'formula', title: 'Formula' },
                    { key: 'example', title: 'Example' }
                  ]}
                  rows={[
                    { aspect: "codes/passwords", keyword: "codes/passwords", formula: "n^r", example: "4-digit code: 10^4" },
                    { aspect: "lineup/ranking", keyword: "lineup/ranking", formula: "P(n,r)", example: "Top 3 from 10: P(10,3)" },
                    { aspect: "arrange all", keyword: "arrange all", formula: "n!", example: "Arrange 6 people: 6!" },
                    { aspect: "around table", keyword: "around table", formula: "(n-1)!", example: "8 at round table: 7!" }
                  ]}
                />
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
          <div className="space-y-4">
            <SimpleInsightBox variant="error">
              <h5 className="font-semibold mb-2">Mistake #1: Confusing P(n,r) with C(n,r)</h5>
              <p className="text-sm">P(n,r) is for order matters, C(n,r) is for order doesn't matter</p>
            </SimpleInsightBox>
            
            <SimpleInsightBox variant="error">
              <h5 className="font-semibold mb-2">Mistake #2: Forgetting circular reduces by 1</h5>
              <p className="text-sm">Circular arrangements: (n-1)! not n!</p>
            </SimpleInsightBox>
            
            <SimpleInsightBox variant="error">
              <h5 className="font-semibold mb-2">Mistake #3: Wrong formula for codes</h5>
              <p className="text-sm">Codes with repeating digits use n^r, not P(n,r)</p>
            </SimpleInsightBox>
          </div>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'practice-problems',
    title: 'Practice Problems',
    content: ({ sectionIndex, isCompleted }) => (
      <PracticeSection />
    )
  }
];

const PracticeSection = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const contentRef = useMathJax([currentProblem, showAnswer]);
  
  const problems = [
    {
      question: "How many 3-letter codes using A-Z?",
      answer: "17,576",
      solution: "26³ = 26 × 26 × 26 = 17,576",
      formula: "n^r with replacement",
      explanation: "Each position can be any of 26 letters, with repetition allowed"
    },
    {
      question: "Arrange 4 people in a line?",
      answer: "24",
      solution: "4! = 4 × 3 × 2 × 1 = 24",
      formula: "n! for all items",
      explanation: "First position has 4 choices, second has 3, third has 2, last has 1"
    },
    {
      question: "Select president, VP from 7 people?",
      answer: "42",
      solution: "P(7,2) = 7!/(7-2)! = 7!/5! = 7 × 6 = 42",
      formula: "P(n,r) without replacement",
      explanation: "President: 7 choices, then VP: 6 remaining choices"
    },
    {
      question: "5 people around circular table?",
      answer: "24",
      solution: "(5-1)! = 4! = 24",
      formula: "Circular arrangement",
      explanation: "Fix one person's position, arrange the other 4"
    },
    {
      question: "3-digit numbers using 0-9, no repeat?",
      answer: "720",
      solution: "P(10,3) = 10!/(10-3)! = 10!/7! = 10 × 9 × 8 = 720",
      formula: "P(n,r) without replacement",
      explanation: "First digit: 10 choices, second: 9, third: 8"
    }
  ];
  
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
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample title="Practice Problems">
          <div className="mb-4">
            <p className="text-neutral-300">
              Work through these problems at your own pace. Click "Show Answer" when ready.
            </p>
          </div>
          
          <ExampleSection title={`Problem ${currentProblem + 1} of ${problems.length}`}>
            <div className="space-y-4">
              <div className="bg-neutral-800/50 rounded-lg p-6">
                <p className="text-xl text-neutral-100">
                  {problems[currentProblem].question}
                </p>
              </div>
              
              {!showAnswer ? (
                <div className="flex justify-center">
                  <Button 
                    onClick={toggleAnswer}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <h5 className="font-semibold text-green-400 mb-2">Answer</h5>
                    <p className="text-2xl font-bold text-white">{problems[currentProblem].answer}</p>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-400 mb-2">Solution</h5>
                    <p className="text-neutral-200">{problems[currentProblem].solution}</p>
                    <p className="text-sm text-blue-300 mt-2">
                      Using: {problems[currentProblem].formula}
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-300 mb-2">Explanation</h5>
                    <p className="text-sm text-neutral-400">
                      {problems[currentProblem].explanation}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    {currentProblem > 0 && (
                      <Button
                        onClick={previousProblem}
                        variant="secondary"
                      >
                        Previous
                      </Button>
                    )}
                    {currentProblem < problems.length - 1 && (
                      <Button
                        onClick={nextProblem}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        Next Problem
                      </Button>
                    )}
                    <Button
                      onClick={toggleAnswer}
                      variant="outline"
                    >
                      Hide Answer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ExampleSection>
          
          <div className="mt-6 bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <h5 className="font-semibold text-blue-400 mb-2">
              Problem-Solving Tips
            </h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
              <li>Read carefully - does order matter?</li>
              <li>Can items be reused?</li>
              <li>Are you arranging all items or just some?</li>
              <li>Is it a circular arrangement?</li>
              <li>Double-check your arithmetic</li>
            </ul>
          </div>
        </WorkedExample>
      </div>
    </SectionContent>
  );
};

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