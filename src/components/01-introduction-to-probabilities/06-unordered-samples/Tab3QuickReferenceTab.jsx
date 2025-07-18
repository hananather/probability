"use client";

import React, { useState, useEffect } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    id: 'formula-sheet',
    title: 'Formula Sheet',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <VisualizationSection className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-4">Core Formulas</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <p className="text-sm font-semibold text-green-400 mb-2">Combinations (Order Doesn't Matter)</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400 mt-2">Choose r from n items</p>
              </div>
              
              <div className="bg-neutral-800 p-4 rounded-lg">
                <p className="text-sm font-semibold text-orange-400 mb-2">Permutations (Order Matters)</p>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[P(n,r) = \\frac{n!}{(n-r)!}\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400 mt-2">Arrange r from n items</p>
              </div>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-4">Important Properties</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                <span className="text-sm text-neutral-300">Symmetry:</span>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(C(n,r) = C(n,n-r)\\)` 
                }} />
              </div>
              
              <div className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                <span className="text-sm text-neutral-300">Pascal's Identity:</span>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(C(n,r) = C(n-1,r-1) + C(n-1,r)\\)` 
                }} />
              </div>
              
              <div className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                <span className="text-sm text-neutral-300">Sum of Row:</span>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(\\sum_{r=0}^{n} C(n,r) = 2^n\\)` 
                }} />
              </div>
              
              <div className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                <span className="text-sm text-neutral-300">Relationship:</span>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(C(n,r) = \\frac{P(n,r)}{r!}\\)` 
                }} />
              </div>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-4">Quick Calculation Tips</h4>
            
            <div className="space-y-2 text-sm text-neutral-300">
              <div className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>Small r:</strong> Use formula directly (e.g., C(10,2) = 10×9/2 = 45)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>Large r:</strong> Use symmetry (e.g., C(10,8) = C(10,2) = 45)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>r = 0 or r = n:</strong> Always equals 1</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>r {`>`} n:</strong> Always equals 0</span>
              </div>
            </div>
          </VisualizationSection>
        </div>
      </SectionContent>
    )
  },
  {
    id: 'decision-guide',
    title: 'Decision Guide',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="When to Use Combinations vs Permutations">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-neutral-800 rounded-lg p-4 w-full max-w-md text-center">
                <p className="font-semibold text-yellow-400 text-lg mb-2">Start Here:</p>
                <p className="text-neutral-300">Does changing the order create a different outcome?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="text-center">
                  <div className="bg-green-900/30 rounded-lg p-4 border-2 border-green-500">
                    <p className="font-bold text-green-400 mb-2">NO → COMBINATIONS</p>
                    <div className="text-center">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[C(n,r) = \\frac{n!}{r!(n-r)!}\\]` 
                      }} />
                    </div>
                  </div>
                  <div className="mt-4 text-left space-y-2">
                    <p className="text-sm font-semibold text-green-400">Examples:</p>
                    <ul className="text-xs text-neutral-300 space-y-1">
                      <li>• Selecting team members</li>
                      <li>• Choosing lottery numbers</li>
                      <li>• Picking pizza toppings</li>
                      <li>• Forming committees</li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-red-900/30 rounded-lg p-4 border-2 border-red-500">
                    <p className="font-bold text-red-400 mb-2">YES → PERMUTATIONS</p>
                    <div className="text-center">
                      <span dangerouslySetInnerHTML={{ 
                        __html: `\\[P(n,r) = \\frac{n!}{(n-r)!}\\]` 
                      }} />
                    </div>
                  </div>
                  <div className="mt-4 text-left space-y-2">
                    <p className="text-sm font-semibold text-red-400">Examples:</p>
                    <ul className="text-xs text-neutral-300 space-y-1">
                      <li>• Assigning positions/roles</li>
                      <li>• Creating passwords</li>
                      <li>• Race rankings (1st, 2nd, 3rd)</li>
                      <li>• Arranging books on shelf</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WorkedExample>
        
        <InsightBox variant="tip" className="mt-4">
          🎯 Quick Test: If {`ABC = BAC = CAB`} for your problem, use combinations!
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-4">
          <h4 className="font-semibold text-red-400 text-lg mb-4">⚠️ Avoid These Errors</h4>
          
          <div className="space-y-3">
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400 mb-1">Mistake #1: Using wrong formula</p>
                  <p className="text-sm text-neutral-300 mb-2">
                    "Select 3 people for President, VP, and Secretary positions"
                  </p>
                  <p className="text-sm">
                    <span className="text-red-400">Wrong:</span> C(n,3)<br/>
                    <span className="text-green-400">Right:</span> P(n,3) - positions are different!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400 mb-1">Mistake #2: Adding instead of multiplying</p>
                  <p className="text-sm text-neutral-300 mb-2">
                    "Choose 2 from group A and 3 from group B"
                  </p>
                  <p className="text-sm">
                    <span className="text-red-400">Wrong:</span> C(A,2) + C(B,3)<br/>
                    <span className="text-green-400">Right:</span> C(A,2) × C(B,3)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400 mb-1">Mistake #3: Forgetting constraints</p>
                  <p className="text-sm text-neutral-300 mb-2">
                    "Select 5 people including Alice"
                  </p>
                  <p className="text-sm">
                    <span className="text-red-400">Wrong:</span> C(n,5)<br/>
                    <span className="text-green-400">Right:</span> C(n-1,4) - Alice is already selected!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400 mb-1">Mistake #4: Not using symmetry</p>
                  <p className="text-sm text-neutral-300 mb-2">
                    Calculating C(50,47) the hard way
                  </p>
                  <p className="text-sm">
                    <span className="text-red-400">Wrong:</span> 50!/(47!×3!) = huge numbers<br/>
                    <span className="text-green-400">Right:</span> C(50,3) = 50×49×48/(3×2×1) = 19,600
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <InsightBox variant="success" className="mt-6">
          ✅ Remember: Read the problem carefully, identify constraints, 
          and always ask "Does order matter?"
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'speed-practice',
    title: 'Speed Practice',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-neutral-200 mb-2">
            60-Second Challenge
          </h3>
          <p className="text-neutral-400">
            Speed practice content will be populated dynamically...
          </p>
        </div>
      </SectionContent>
    )
  }
];

export default function QuickReferenceTab({ onComplete }) {
  // Move all hooks to component top level
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [attempted, setAttempted] = useState(0);
  
  const problems = [
    { question: "C(7,3) = ?", answer: 35 },
    { question: "C(10,2) = ?", answer: 45 },
    { question: "C(5,5) = ?", answer: 1 },
    { question: "C(8,6) = ?", answer: 28 },
    { question: "C(12,1) = ?", answer: 12 },
  ];
  
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  const startPractice = () => {
    setIsActive(true);
    setCurrentProblem(0);
    setScore(0);
    setTimeLeft(60);
    setUserAnswer('');
    setShowResult(false);
    setAttempted(0);
  };
  
  const checkAnswer = () => {
    if (!userAnswer) return;
    
    const isCorrect = parseInt(userAnswer) === problems[currentProblem].answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setAttempted(attempted + 1);
    setShowResult(true);
    
    setTimeout(() => {
      if (currentProblem < problems.length - 1 && timeLeft > 0) {
        setCurrentProblem(currentProblem + 1);
        setUserAnswer('');
        setShowResult(false);
      } else {
        setIsActive(false);
      }
    }, 1500);
  };

  // Create sections with state passed down
  const sectionsWithState = SECTIONS.map((section, index) => {
    if (index === 3) { // Speed Practice section
      return {
        ...section,
        content: ({ sectionIndex, isCompleted }) => (
          <SectionContent>
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                  60-Second Challenge
                </h3>
                <p className="text-neutral-400">
                  Solve as many combination problems as you can!
                </p>
              </div>
              
              {!isActive && attempted === 0 ? (
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={startPractice}
                  className="mx-auto"
                >
                  Start Speed Practice
                </Button>
              ) : (
                <div className="max-w-md mx-auto space-y-4">
                  {/* Timer and Score */}
                  <div className="flex justify-between items-center bg-neutral-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-yellow-400" />
                      <span className="font-mono text-lg">{timeLeft}s</span>
                    </div>
                    <div className="text-lg">
                      Score: <span className="font-bold text-green-400">{score}/{attempted}</span>
                    </div>
                  </div>
                  
                  {isActive ? (
                    <div className="bg-neutral-900 p-6 rounded-lg">
                      <p className="text-2xl font-mono font-bold text-cyan-400 mb-4">
                        {problems[currentProblem].question}
                      </p>
                      
                      <div className="flex gap-2 items-center justify-center">
                        <input
                          type="number"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                          className="w-32 px-3 py-2 text-lg text-center bg-neutral-800 border border-neutral-600 rounded"
                          placeholder="Answer"
                          disabled={showResult}
                        />
                        <Button
                          variant="success"
                          onClick={checkAnswer}
                          disabled={!userAnswer || showResult}
                        >
                          Submit
                        </Button>
                      </div>
                      
                      {showResult && (
                        <div className={cn(
                          "mt-4 p-2 rounded text-center",
                          parseInt(userAnswer) === problems[currentProblem].answer
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        )}>
                          {parseInt(userAnswer) === problems[currentProblem].answer
                            ? "Correct! ✓"
                            : `Wrong. Answer: ${problems[currentProblem].answer}`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-neutral-900 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-neutral-200 mb-4">
                        Practice Complete!
                      </h4>
                      <div className="text-3xl font-bold text-cyan-400 mb-4">
                        {score}/{problems.length}
                      </div>
                      <p className="text-neutral-400 mb-4">
                        {score === problems.length 
                          ? "Perfect score! You're ready for any exam!"
                          : score >= problems.length * 0.8
                          ? "Great job! You're almost there!"
                          : "Keep practicing to improve your speed!"}
                      </p>
                      <Button 
                        variant="primary"
                        onClick={startPractice}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <VisualizationSection className="bg-neutral-900/50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-neutral-200 mb-3">Speed Tips</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>• For C(n,2): Use n×(n-1)/2</li>
                <li>• For C(n,1): Always equals n</li>
                <li>• For C(n,n-1): Equals n</li>
                <li>• Use symmetry for large r values</li>
              </ul>
            </VisualizationSection>
          </SectionContent>
        )
      };
    }
    return section;
  });

  return (
    <SectionBasedContent
      title="Quick Reference & Practice"
      description="Everything you need for exams in one place"
      sections={sectionsWithState}
      onComplete={onComplete}
      chapter={1}
      progressVariant="violet"
      showBackToHub={false}
    />
  );
}