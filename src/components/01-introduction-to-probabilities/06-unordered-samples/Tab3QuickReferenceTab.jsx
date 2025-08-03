"use client";

import React, { useState, useRef, useEffect } from 'react';
import SectionBasedContent, { SectionContent } from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox } from '@/components/ui/WorkedExample';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { createColorScheme } from '@/lib/design-system';
import { useMathJax } from '@/hooks/useMathJax';

const colorScheme = createColorScheme('binomial');

const PracticeProblems = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const contentRef = useMathJax([currentProblem, showAnswer]);
  
  const problems = [
    { question: "C(6,2) = ?", answer: 15, solution: "6!/(2!(6-2)!) = 6!/(2!4!) = (6×5)/(2×1) = 15" },
    { question: "C(7,3) = ?", answer: 35, solution: "7!/(3!(7-3)!) = 7!/(3!4!) = (7×6×5)/(3×2×1) = 35" },
    { question: "C(10,2) = ?", answer: 45, solution: "10!/(2!(10-2)!) = 10!/(2!8!) = (10×9)/(2×1) = 45" },
    { question: "C(5,5) = ?", answer: 1, solution: "5!/(5!(5-5)!) = 5!/(5!0!) = 1 (only one way to choose all)" },
    { question: "C(8,6) = ?", answer: 28, solution: "8!/(6!(8-6)!) = 8!/(6!2!) = C(8,2) = (8×7)/(2×1) = 28" },
    { question: "C(12,1) = ?", answer: 12, solution: "12!/(1!(12-1)!) = 12!/(1!11!) = 12" },
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
          <p className="text-neutral-300 mb-6">
            Practice calculating combinations. Work through these problems at your own pace.
          </p>
          
          <div className="bg-neutral-800/50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-neutral-200 mb-2">
              Problem {currentProblem + 1} of {problems.length}
            </h4>
            <p className="text-2xl font-mono text-white">
              {problems[currentProblem].question}
            </p>
          </div>
          
          {!showAnswer ? (
            <div className="flex justify-center">
              <Button onClick={toggleAnswer} className="bg-cyan-600 hover:bg-cyan-700">
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">Answer</h5>
                <p className="text-3xl font-bold text-white">{problems[currentProblem].answer}</p>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h5 className="font-semibold text-blue-400 mb-2">Solution</h5>
                <p className="text-sm font-mono text-neutral-200">{problems[currentProblem].solution}</p>
              </div>
              
              <div className="flex gap-3 justify-center">
                {currentProblem > 0 && (
                  <Button onClick={previousProblem} variant="secondary">
                    Previous
                  </Button>
                )}
                {currentProblem < problems.length - 1 && (
                  <Button onClick={nextProblem} className="bg-cyan-600 hover:bg-cyan-700">
                    Next Problem
                  </Button>
                )}
                <Button onClick={toggleAnswer} variant="outline">
                  Hide Answer
                </Button>
              </div>
            </div>
          )}
        </WorkedExample>
        
        <div className="mt-6 bg-cyan-900/20 p-4 rounded-lg border border-cyan-600/30">
          <h5 className="font-semibold text-cyan-400 mb-2">Quick Tips</h5>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
            <li>Remember: C(n,r) = C(n,n-r) - choosing r is same as leaving out n-r</li>
            <li>C(n,0) = C(n,n) = 1 always</li>
            <li>Use Pascal's triangle for small values</li>
            <li>Break down larger factorials: 8!/6! = 8×7</li>
          </ul>
        </div>
      </div>
    </SectionContent>
  );
};

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Formula Sheet',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <VisualizationSection className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Core Combination Formula
            </h4>
            <div className="grid gap-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h5 className="font-semibold text-cyan-300 mb-2">Combinations (Choose r from n)</h5>
                <div className="text-xl font-mono text-center my-3">
                  <span dangerouslySetInnerHTML={{ __html: `\\[C(n,r) = \\frac{n!}{r!(n-r)!}\\]` }} />
                </div>
                <p className="text-sm text-neutral-300">Number of ways to choose r items from n items when order doesn't matter</p>
                <p className="text-sm text-neutral-400 mt-1">Example: Choosing 3 people from 10: C(10,3) = 120</p>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h5 className="font-semibold text-cyan-300 mb-2">Alternative Notation</h5>
                <div className="text-xl font-mono text-center my-3">
                  <span dangerouslySetInnerHTML={{ __html: `\\[C(n,r) = \\binom{n}{r} = {}^nC_r\\]` }} />
                </div>
                <p className="text-sm text-neutral-300">Different ways to write the same formula</p>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h5 className="font-semibold text-cyan-300 mb-2">Symmetry Property</h5>
                <div className="text-xl font-mono text-center my-3">
                  <span dangerouslySetInnerHTML={{ __html: `\\[C(n,r) = C(n,n-r)\\]` }} />
                </div>
                <p className="text-sm text-neutral-300">Choosing r items is the same as choosing which n-r to leave out</p>
                <p className="text-sm text-neutral-400 mt-1">Example: C(10,3) = C(10,7) = 120</p>
              </div>
            </div>
          </VisualizationSection>
          
          <ComparisonTable
            columns={[
              { key: 'cases', title: 'Special Cases' },
              { key: 'value', title: 'Value' },
              { key: 'why', title: 'Why?' }
            ]}
            rows={[
              { aspect: "C(n,0)", cases: "C(n,0)", value: "1", why: "Only one way to choose nothing" },
              { aspect: "C(n,1)", cases: "C(n,1)", value: "n", why: "n ways to choose one item" },
              { aspect: "C(n,n)", cases: "C(n,n)", value: "1", why: "Only one way to choose all" },
              { aspect: "C(n,n-1)", cases: "C(n,n-1)", value: "n", why: "n ways to leave out one" }
            ]}
          />
        </div>
      </SectionContent>
    )
  },
  {
    id: 'quick-calculation',
    title: 'Quick Calculation Methods',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Efficient Calculation Techniques">
          <ExampleSection title="Method 1: Cancel Before Calculating">
            <div className="bg-neutral-800 p-4 rounded-lg space-y-3">
              <p className="text-cyan-400 font-semibold">Example: C(8,3)</p>
              <div className="font-mono text-sm">
                <p>C(8,3) = 8!/(3!×5!)</p>
                <p className="text-green-400">= (8×7×6×5!)/(3!×5!)</p>
                <p className="text-green-400">= (8×7×6)/(3×2×1)</p>
                <p className="text-green-400">= 336/6 = 56</p>
              </div>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Method 2: Use Symmetry">
            <div className="bg-neutral-800 p-4 rounded-lg space-y-3">
              <p className="text-cyan-400 font-semibold">Example: C(10,8)</p>
              <div className="font-mono text-sm">
                <p>C(10,8) = C(10,2) ← Much easier!</p>
                <p className="text-green-400">= (10×9)/(2×1)</p>
                <p className="text-green-400">= 90/2 = 45</p>
              </div>
            </div>
          </ExampleSection>
          
          <SimpleInsightBox variant="info">
            <p className="font-semibold">Pro Tip:</p>
            <p className="text-sm">Always use C(n,r) = C(n,n-r) when r &gt; n/2 to minimize calculations!</p>
          </SimpleInsightBox>
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
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <h5 className="font-semibold text-red-400 mb-2">
                <AlertCircle className="inline w-4 h-4 mr-2" />
                Mistake 1: Using Permutation Formula
              </h5>
              <p className="text-sm text-neutral-300">
                Wrong: P(5,3) = 60 for choosing 3 from 5<br/>
                Right: C(5,3) = 10 (order doesn't matter!)
              </p>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <h5 className="font-semibold text-red-400 mb-2">
                <AlertCircle className="inline w-4 h-4 mr-2" />
                Mistake 2: Forgetting 0! = 1
              </h5>
              <p className="text-sm text-neutral-300">
                C(5,5) = 5!/(5!×0!) = 5!/(5!×1) = 1<br/>
                Not undefined!
              </p>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <h5 className="font-semibold text-red-400 mb-2">
                <AlertCircle className="inline w-4 h-4 mr-2" />
                Mistake 3: Wrong Simplification
              </h5>
              <p className="text-sm text-neutral-300">
                Wrong: 8!/5! = 8/5<br/>
                Right: 8!/5! = 8×7×6 = 336
              </p>
            </div>
          </div>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'practice-problems',
    title: 'Practice Problems',
    content: ({ sectionIndex, isCompleted }) => <PracticeProblems />
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference"
      description="Master combination calculations with formulas and practice"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="cyan"
      showBackToHub={false}
    />
  );
}