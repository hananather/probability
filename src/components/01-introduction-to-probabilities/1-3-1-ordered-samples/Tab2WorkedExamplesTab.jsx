"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula, Step } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { CheckCircle2, XCircle } from 'lucide-react';

const SECTIONS = [
  {
    id: 'basic-example',
    title: 'Basic Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [showSolution, setShowSolution] = useState(false);
      
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
      }, [showSolution]);
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Restaurant Seating Problem">
              <ExampleSection title="Problem Statement">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <p className="text-neutral-300">
                    A restaurant has 6 unique dishes to feature. They want to create a 3-course 
                    tasting menu (appetizer, main, dessert). How many different menus can they create if:
                  </p>
                  <ol className="list-decimal list-inside mt-3 space-y-2 text-neutral-300 ml-4">
                    <li>The same dish can be served in multiple courses?</li>
                    <li>Each dish can only appear once in the menu?</li>
                  </ol>
                </div>
              </ExampleSection>
              
              <Button 
                onClick={() => setShowSolution(!showSolution)}
                variant="outline"
                className="my-4"
              >
                {showSolution ? 'Hide' : 'Show'} Step-by-Step Solution
              </Button>
              
              {showSolution && (
                <>
                  <ExampleSection title="Part 1: With Replacement">
                    <Step number={1} description="Identify the parameters">
                      <p className="text-neutral-300">
                        • <span dangerouslySetInnerHTML={{ __html: `\\(n = 6\\)` }} /> (total dishes)<br/>
                        • <span dangerouslySetInnerHTML={{ __html: `\\(r = 3\\)` }} /> (positions to fill)
                      </p>
                    </Step>
                    
                    <Step number={2} description="Apply the formula">
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[\\text{Number of menus} = n^r = 6^3\\]` 
                      }} />
                    </Step>
                    
                    <Step number={3} description="Calculate">
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[6^3 = 6 \\times 6 \\times 6 = 216\\]` 
                      }} />
                    </Step>
                    
                    <InsightBox variant="success">
                      ✅ Answer: 216 different menus possible
                    </InsightBox>
                  </ExampleSection>
                  
                  <ExampleSection title="Part 2: Without Replacement">
                    <Step number={1} description="Use the permutation formula">
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(6,3) = \\frac{6!}{(6-3)!} = \\frac{6!}{3!}\\]` 
                      }} />
                    </Step>
                    
                    <Step number={2} description="Expand the calculation">
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(6,3) = 6 \\times 5 \\times 4 = 120\\]` 
                      }} />
                    </Step>
                    
                    <Step number={3} description="Verify the logic">
                      <p className="text-neutral-300">
                        • 1st course: 6 choices<br/>
                        • 2nd course: 5 choices (one dish used)<br/>
                        • 3rd course: 4 choices (two dishes used)
                      </p>
                    </Step>
                    
                    <InsightBox variant="success">
                      ✅ Answer: 120 different menus possible
                    </InsightBox>
                  </ExampleSection>
                  
                  <ExampleSection title="Key Takeaway">
                    <div className="bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-neutral-300">
                        With replacement gives <span className="font-mono text-purple-400">216/120 = 1.8×</span> more 
                        possibilities because dishes can repeat!
                      </p>
                    </div>
                  </ExampleSection>
                </>
              )}
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'exam-level',
    title: 'Exam-Level Example',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [showHints, setShowHints] = useState(false);
      const [showSolution, setShowSolution] = useState(false);
      
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
      }, [showHints, showSolution]);
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Complex Scheduling Problem">
              <ExampleSection title="The Challenge">
                <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
                  <p className="text-neutral-300 mb-3">
                    A data science team has 12 different ML models to evaluate. They need to:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-300 ml-4">
                    <li>Select 4 models for detailed analysis (order matters for presentation)</li>
                    <li>The first 2 selected will also be deployed to production</li>
                    <li>Production models must be different (no model deployed twice)</li>
                  </ol>
                  <p className="text-neutral-300 mt-3">
                    How many ways can they organize this evaluation process?
                  </p>
                </div>
              </ExampleSection>
              
              <div className="flex gap-2 my-4">
                <Button 
                  onClick={() => setShowHints(!showHints)}
                  variant="outline"
                  size="sm"
                >
                  {showHints ? 'Hide' : 'Show'} Hints
                </Button>
                <Button 
                  onClick={() => setShowSolution(!showSolution)}
                  variant="outline"
                  size="sm"
                >
                  {showSolution ? 'Hide' : 'Show'} Full Solution
                </Button>
              </div>
              
              {showHints && (
                <ExampleSection title="Hints">
                  <div className="space-y-2">
                    <div className="bg-blue-900/20 p-3 rounded text-sm">
                      💡 This is a two-stage problem - break it down!
                    </div>
                    <div className="bg-green-900/20 p-3 rounded text-sm">
                      💡 First 2 positions: without replacement (production constraint)
                    </div>
                    <div className="bg-purple-900/20 p-3 rounded text-sm">
                      💡 Positions 3-4: can these repeat earlier selections?
                    </div>
                  </div>
                </ExampleSection>
              )}
              
              {showSolution && (
                <>
                  <ExampleSection title="Solution Approach">
                    <Step number={1} description="Understand the constraints">
                      <ul className="list-disc list-inside text-neutral-300 space-y-1">
                        <li>Positions 1-2: Must be different (production deployment)</li>
                        <li>Positions 3-4: Can be any of the 12 models</li>
                        <li>Order matters for all 4 positions</li>
                      </ul>
                    </Step>
                    
                    <Step number={2} description="Calculate positions 1-2">
                      <p className="text-neutral-300 mb-2">
                        Without replacement for first 2:
                      </p>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[P(12,2) = 12 \\times 11 = 132\\]` 
                      }} />
                    </Step>
                    
                    <Step number={3} description="Calculate positions 3-4">
                      <p className="text-neutral-300 mb-2">
                        Each can be any of the 12 models:
                      </p>
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[12^2 = 12 \\times 12 = 144\\]` 
                      }} />
                    </Step>
                    
                    <Step number={4} description="Apply multiplication principle">
                      <div dangerouslySetInnerHTML={{ 
                        __html: `\\[\\text{Total} = 132 \\times 144 = 19,008\\]` 
                      }} />
                    </Step>
                  </ExampleSection>
                  
                  <ExampleSection title="Verification">
                    <div className="bg-neutral-800 p-4 rounded-lg">
                      <p className="text-sm text-neutral-300">
                        Alternative calculation:
                      </p>
                      <div className="mt-2" dangerouslySetInnerHTML={{ 
                        __html: `\\[(12 \\times 11) \\times (12 \\times 12) = 132 \\times 144 = 19,008 \\checkmark\\]` 
                      }} />
                    </div>
                  </ExampleSection>
                  
                  <InsightBox variant="warning">
                    ⚠️ Common Mistake: Treating all 4 positions the same would give 
                    <span dangerouslySetInnerHTML={{ __html: ` \\(P(12,4) = 11,880\\)` }} /> or 
                    <span dangerouslySetInnerHTML={{ __html: ` \\(12^4 = 20,736\\)` }} />, 
                    both incorrect!
                  </InsightBox>
                </>
              )}
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'variations',
    title: 'Variations',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [selectedVariation, setSelectedVariation] = useState(null);
      
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
      }, [selectedVariation]);
      
      const variations = [
        {
          id: 'circular',
          title: 'Circular Arrangements',
          problem: '5 people sitting at a round table',
          solution: '(5-1)! = 4! = 24',
          explanation: 'In circular arrangements, rotations are considered the same'
        },
        {
          id: 'restrictions',
          title: 'With Restrictions',
          problem: 'Arrange 6 books where 2 specific books must be together',
          solution: 'Treat as 5 units: 5! × 2! = 240',
          explanation: 'Group restricted items as one unit, then arrange internally'
        },
        {
          id: 'repetition',
          title: 'With Repetition',
          problem: 'Arrange letters in "STATISTICS"',
          solution: '10!/(3!×3!×2!) = 50,400',
          explanation: 'Divide by factorial of each repetition count'
        }
      ];
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Common Variation Types">
              <ExampleSection title="Select a Variation to Explore">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {variations.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariation(v.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedVariation === v.id 
                          ? 'bg-purple-900/30 border-purple-600' 
                          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      <h5 className="font-semibold text-white">{v.title}</h5>
                      <p className="text-xs text-neutral-400 mt-1">{v.problem}</p>
                    </button>
                  ))}
                </div>
              </ExampleSection>
              
              {selectedVariation && (
                <ExampleSection title="Solution">
                  {(() => {
                    const variation = variations.find(v => v.id === selectedVariation);
                    return (
                      <div className="space-y-3">
                        <div className="bg-neutral-800 p-4 rounded-lg">
                          <p className="text-neutral-300 font-medium mb-2">
                            Problem: {variation.problem}
                          </p>
                          <p className="text-sm text-neutral-400">
                            {variation.explanation}
                          </p>
                        </div>
                        <div className="bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm text-neutral-300 mb-2">Solution:</p>
                          <div className="text-lg font-mono text-purple-400" 
                               dangerouslySetInnerHTML={{ __html: `\\[${variation.solution}\\]` }} />
                        </div>
                      </div>
                    );
                  })()}
                </ExampleSection>
              )}
              
              <ExampleSection title="Quick Recognition Guide">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">
                      <strong>Standard permutation:</strong> "Arrange n items in r positions"
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">
                      <strong>With replacement:</strong> "Can reuse", "with repetition allowed"
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">
                      <strong>Circular:</strong> "Around a table", "in a circle"
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">
                      <strong>Restrictions:</strong> "Must be adjacent", "cannot be next to"
                    </span>
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
    id: 'practice',
    title: 'Practice Time',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [currentProblem, setCurrentProblem] = useState(0);
      const [showAnswer, setShowAnswer] = useState(false);
      const [userAnswer, setUserAnswer] = useState('');
      const [feedback, setFeedback] = useState(null);
      
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
      
      const problems = [
        {
          question: "A password must be 4 digits long. How many possible passwords exist?",
          answer: "10000",
          solution: "10^4 = 10,000 (each position has 10 choices: 0-9)",
          hint: "With replacement - digits can repeat"
        },
        {
          question: "In how many ways can you arrange 5 different books on a shelf?",
          answer: "120",
          solution: "5! = 5 × 4 × 3 × 2 × 1 = 120",
          hint: "All books used, order matters"
        },
        {
          question: "From 8 candidates, select a president, VP, and treasurer. How many ways?",
          answer: "336",
          solution: "P(8,3) = 8 × 7 × 6 = 336",
          hint: "Different people for different positions"
        }
      ];
      
      const checkAnswer = () => {
        const correct = userAnswer.trim() === problems[currentProblem].answer;
        setFeedback({
          correct,
          message: correct ? "Correct! Well done!" : "Not quite. Try again or view the solution."
        });
      };
      
      const nextProblem = () => {
        setCurrentProblem((prev) => (prev + 1) % problems.length);
        setShowAnswer(false);
        setUserAnswer('');
        setFeedback(null);
      };
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Test Your Understanding">
              <ExampleSection title={`Problem ${currentProblem + 1} of ${problems.length}`}>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <p className="text-neutral-300 font-medium">
                    {problems[currentProblem].question}
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    Hint: {problems[currentProblem].hint}
                  </p>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
                      onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    />
                    <Button onClick={checkAnswer} variant="outline">
                      Check
                    </Button>
                  </div>
                  
                  {feedback && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                      feedback.correct ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                    }`}>
                      {feedback.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {feedback.message}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant="outline"
                      size="sm"
                    >
                      {showAnswer ? 'Hide' : 'Show'} Solution
                    </Button>
                    <Button 
                      onClick={nextProblem}
                      variant="outline"
                      size="sm"
                    >
                      Next Problem
                    </Button>
                  </div>
                  
                  {showAnswer && (
                    <div className="bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-neutral-300">
                        <strong>Solution:</strong> {problems[currentProblem].solution}
                      </p>
                    </div>
                  )}
                </div>
              </ExampleSection>
              
              <ExampleSection title="Progress">
                <div className="flex gap-1">
                  {problems.map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-2 rounded ${
                        i === currentProblem ? 'bg-blue-500' : 'bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </ExampleSection>
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  }
];

export default function Tab2WorkedExamplesTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Worked Examples - Ordered Sampling"
      description="Step-by-step solutions to build your confidence"
      sections={SECTIONS}
      onComplete={onComplete}
      progressVariant="blue"
    />
  );
}