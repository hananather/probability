"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const SECTIONS = [
  {
    id: 'formulas',
    title: 'Formula Sheet',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [expandedFormula, setExpandedFormula] = useState(null);
      
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
      }, [expandedFormula]);
      
      const formulas = [
        {
          id: 'with-replacement',
          name: 'Ordered WITH Replacement',
          formula: 'n^r',
          latex: '\\[\\text{Ways} = n^r\\]',
          when: 'Items can be reused (passwords, dice rolls)',
          example: '3-digit PIN: 10^3 = 1000',
          calculation: 'Multiply n by itself r times'
        },
        {
          id: 'without-replacement',
          name: 'Ordered WITHOUT Replacement (Permutation)',
          formula: 'P(n,r) = n!/(n-r)!',
          latex: '\\[P(n,r) = \\frac{n!}{(n-r)!} = n \\times (n-1) \\times \\cdots \\times (n-r+1)\\]',
          when: 'Each item used at most once (rankings, assignments)',
          example: 'Top 3 from 10: P(10,3) = 10×9×8 = 720',
          calculation: 'Multiply decreasing numbers starting from n'
        },
        {
          id: 'all-items',
          name: 'Arrange ALL Items',
          formula: 'n!',
          latex: '\\[n! = n \\times (n-1) \\times (n-2) \\times \\cdots \\times 1\\]',
          when: 'Arranging all n distinct items',
          example: '5 books on shelf: 5! = 120',
          calculation: 'Special case of P(n,n)'
        },
        {
          id: 'circular',
          name: 'Circular Arrangements',
          formula: '(n-1)!',
          latex: '\\[(n-1)!\\]',
          when: 'Arranging in a circle (rotations are same)',
          example: '6 people around table: 5! = 120',
          calculation: 'Fix one position, arrange the rest'
        }
      ];
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Essential Formulas for Ordered Sampling">
              <div className="space-y-3">
                {formulas.map(f => (
                  <div 
                    key={f.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      expandedFormula === f.id 
                        ? 'border-purple-600 bg-purple-900/10' 
                        : 'border-neutral-700 bg-neutral-800/50'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFormula(expandedFormula === f.id ? null : f.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-700/30 transition-colors"
                    >
                      <div>
                        <h5 className="font-semibold text-white">{f.name}</h5>
                        <code className="text-sm text-purple-400 font-mono">{f.formula}</code>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-neutral-400 transition-transform ${
                          expandedFormula === f.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedFormula === f.id && (
                      <div className="p-4 border-t border-neutral-700">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-300 mb-1">Formula:</p>
                            <div dangerouslySetInnerHTML={{ __html: f.latex }} />
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold text-green-400 mb-1">When to use:</p>
                            <p className="text-sm text-neutral-300">{f.when}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold text-blue-400 mb-1">Example:</p>
                            <p className="text-sm font-mono text-neutral-300">{f.example}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold text-amber-400 mb-1">How to calculate:</p>
                            <p className="text-sm text-neutral-300">{f.calculation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <InsightBox variant="info" className="mt-4">
                💡 Pro Tip: Most exam problems use either n^r (with replacement) or P(n,r) (without). 
                Master these two and you'll handle 90% of questions!
              </InsightBox>
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'decision-guide',
    title: 'Decision Guide',
    content: ({ sectionIndex, isCompleted }) => {
      const [currentStep, setCurrentStep] = useState(0);
      
      const decisionTree = [
        {
          question: "Does order matter in your problem?",
          yes: { next: 1, hint: "Positions/sequences are different" },
          no: { result: "Use Combinations (not covered here)", hint: "Groups/sets are the same" }
        },
        {
          question: "Can items be used more than once?",
          yes: { result: "Use n^r", hint: "With replacement" },
          no: { next: 2, hint: "Without replacement" }
        },
        {
          question: "Are you using all n items?",
          yes: { result: "Use n!", hint: "Full permutation" },
          no: { result: "Use P(n,r) = n!/(n-r)!", hint: "Partial permutation" }
        }
      ];
      
      const currentNode = decisionTree[currentStep];
      const answer = currentNode.yes?.result || currentNode.no?.result || null;
      
      return (
        <SectionContent>
          <WorkedExample title="Interactive Decision Flowchart">
            <ExampleSection title="Answer the questions to find your formula">
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Step {currentStep + 1}: {currentNode.question}
                  </h4>
                </div>
                
                {!answer && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        if (currentNode.yes.next !== undefined) {
                          setCurrentStep(currentNode.yes.next);
                        }
                      }}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Yes
                      <p className="text-xs mt-1 opacity-75">{currentNode.yes.hint}</p>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (currentNode.no.next !== undefined) {
                          setCurrentStep(currentNode.no.next);
                        }
                      }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      No
                      <p className="text-xs mt-1 opacity-75">{currentNode.no.hint}</p>
                    </button>
                  </div>
                )}
                
                {currentNode.yes?.result && (
                  <div className="bg-green-900/20 p-4 rounded-lg text-center">
                    <p className="text-green-400 font-semibold mb-2">✅ Formula Found!</p>
                    <p className="text-2xl font-mono text-white">{currentNode.yes.result}</p>
                    <p className="text-sm text-neutral-400 mt-2">{currentNode.yes.hint}</p>
                  </div>
                )}
                
                {currentNode.no?.result && (
                  <div className="bg-amber-900/20 p-4 rounded-lg text-center">
                    <p className="text-amber-400 font-semibold mb-2">📝 Note:</p>
                    <p className="text-lg text-white">{currentNode.no.result}</p>
                    <p className="text-sm text-neutral-400 mt-2">{currentNode.no.hint}</p>
                  </div>
                )}
                
                <Button 
                  onClick={() => setCurrentStep(0)}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Start Over
                </Button>
              </div>
            </ExampleSection>
            
            <ExampleSection title="Quick Decision Rules">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-900/20 p-3 rounded-lg">
                  <h5 className="font-semibold text-blue-400 mb-2">Keywords for "With Replacement"</h5>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li>• "can be repeated"</li>
                    <li>• "with replacement"</li>
                    <li>• "multiple times"</li>
                    <li>• "reusable"</li>
                  </ul>
                </div>
                
                <div className="bg-green-900/20 p-3 rounded-lg">
                  <h5 className="font-semibold text-green-400 mb-2">Keywords for "Without Replacement"</h5>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li>• "distinct positions"</li>
                    <li>• "different items"</li>
                    <li>• "no repetition"</li>
                    <li>• "unique assignments"</li>
                  </ul>
                </div>
              </div>
            </ExampleSection>
          </WorkedExample>
        </SectionContent>
      );
    }
  },
  {
    id: 'mistakes',
    title: 'Common Mistakes',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [expandedMistake, setExpandedMistake] = useState(null);
      
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
      }, [expandedMistake]);
      
      const mistakes = [
        {
          id: 'wrong-formula',
          title: 'Using the wrong formula type',
          wrong: 'Using P(n,r) when items can repeat',
          right: 'Use n^r for with replacement, P(n,r) for without',
          example: '4-digit PIN uses 10^4, not P(10,4)'
        },
        {
          id: 'order-confusion',
          title: 'Confusing permutations with combinations',
          wrong: 'Using C(n,r) when order matters',
          right: 'Permutations when order matters, combinations when it doesn\'t',
          example: 'Race positions need P(n,r), team selection needs C(n,r)'
        },
        {
          id: 'calculation-error',
          title: 'Calculation errors with factorials',
          wrong: 'P(10,3) = 10!/(10-3)! = 10!/7! = 10!',
          right: 'P(10,3) = 10!/7! = 10×9×8 = 720',
          example: 'Cancel out the (n-r)! properly'
        },
        {
          id: 'circular-fix',
          title: 'Forgetting circular arrangement adjustment',
          wrong: 'Using n! for circular arrangements',
          right: 'Use (n-1)! for circular arrangements',
          example: '6 people around table: 5!, not 6!'
        }
      ];
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="Avoid These Common Pitfalls">
              <ExampleSection title="Click each mistake to learn more">
                <div className="space-y-3">
                  {mistakes.map(mistake => (
                    <div
                      key={mistake.id}
                      className="border border-neutral-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedMistake(
                          expandedMistake === mistake.id ? null : mistake.id
                        )}
                        className="w-full p-4 text-left flex items-start gap-3 hover:bg-neutral-800 transition-colors"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-white">{mistake.title}</h5>
                          {expandedMistake === mistake.id && (
                            <div className="mt-3 space-y-3">
                              <div className="bg-red-900/20 p-3 rounded">
                                <p className="text-sm font-semibold text-red-400 mb-1">❌ Wrong:</p>
                                <p className="text-sm text-neutral-300">{mistake.wrong}</p>
                              </div>
                              
                              <div className="bg-green-900/20 p-3 rounded">
                                <p className="text-sm font-semibold text-green-400 mb-1">✅ Right:</p>
                                <p className="text-sm text-neutral-300">{mistake.right}</p>
                              </div>
                              
                              <div className="bg-blue-900/20 p-3 rounded">
                                <p className="text-sm font-semibold text-blue-400 mb-1">Example:</p>
                                <p className="text-sm text-neutral-300">{mistake.example}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </ExampleSection>
              
              <InsightBox variant="warning">
                ⚠️ Most Common Error: Not recognizing whether replacement is allowed. 
                Always check: "Can I use the same item twice?"
              </InsightBox>
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'speed-practice',
    title: 'Speed Practice',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useRef(null);
      const [currentProblem, setCurrentProblem] = useState(0);
      const [timeLeft, setTimeLeft] = useState(60);
      const [isRunning, setIsRunning] = useState(false);
      const [score, setScore] = useState(0);
      const [answers, setAnswers] = useState({});
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
      }, [currentProblem, showResults]);
      
      useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
          interval = setInterval(() => {
            setTimeLeft(time => time - 1);
          }, 1000);
        } else if (timeLeft === 0) {
          setIsRunning(false);
          setShowResults(true);
        }
        return () => clearInterval(interval);
      }, [isRunning, timeLeft]);
      
      const problems = [
        {
          question: "How many 3-letter codes using A-Z?",
          answer: "17576",
          solution: "26^3 = 17,576",
          formula: "n^r with replacement"
        },
        {
          question: "Arrange 4 people in a line?",
          answer: "24",
          solution: "4! = 24",
          formula: "n! for all items"
        },
        {
          question: "Select president, VP from 7 people?",
          answer: "42",
          solution: "P(7,2) = 7×6 = 42",
          formula: "P(n,r) without replacement"
        },
        {
          question: "5 people around circular table?",
          answer: "24",
          solution: "(5-1)! = 4! = 24",
          formula: "Circular arrangement"
        },
        {
          question: "3-digit numbers using 0-9, no repeat?",
          answer: "720",
          solution: "P(10,3) = 10×9×8 = 720",
          formula: "P(n,r) without replacement"
        }
      ];
      
      const startPractice = () => {
        setIsRunning(true);
        setTimeLeft(60);
        setScore(0);
        setAnswers({});
        setShowResults(false);
        setCurrentProblem(0);
      };
      
      const handleAnswer = (problemIndex, answer) => {
        setAnswers(prev => ({ ...prev, [problemIndex]: answer }));
      };
      
      const calculateScore = () => {
        let correct = 0;
        problems.forEach((p, i) => {
          if (answers[i]?.trim() === p.answer) {
            correct++;
          }
        });
        return correct;
      };
      
      return (
        <SectionContent>
          <div ref={contentRef}>
            <WorkedExample title="60-Second Challenge">
              {!isRunning && !showResults && (
                <ExampleSection title="Ready for Speed Practice?">
                  <div className="text-center py-8">
                    <p className="text-neutral-300 mb-4">
                      Answer 5 permutation problems in 60 seconds!
                    </p>
                    <Button onClick={startPractice} size="lg">
                      Start Challenge
                    </Button>
                  </div>
                </ExampleSection>
              )}
              
              {isRunning && (
                <ExampleSection title={`Time Left: ${timeLeft}s`}>
                  <div className="space-y-4">
                    {problems.map((problem, index) => (
                      <div key={index} className="bg-neutral-800 p-3 rounded-lg">
                        <p className="text-sm text-neutral-300 mb-2">
                          {index + 1}. {problem.question}
                        </p>
                        <input
                          type="text"
                          value={answers[index] || ''}
                          onChange={(e) => handleAnswer(index, e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-white text-sm"
                          placeholder="Your answer"
                        />
                      </div>
                    ))}
                    
                    <Button 
                      onClick={() => {
                        setIsRunning(false);
                        setShowResults(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Submit Early
                    </Button>
                  </div>
                  
                  <div className="mt-4 bg-neutral-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 60) * 100}%` }}
                    />
                  </div>
                </ExampleSection>
              )}
              
              {showResults && (
                <ExampleSection title="Results">
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-white">
                      Score: {calculateScore()}/5
                    </p>
                    <p className="text-neutral-400 mt-2">
                      {calculateScore() >= 4 ? 'Excellent!' : 
                       calculateScore() >= 2 ? 'Good effort!' : 
                       'Keep practicing!'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {problems.map((problem, index) => {
                      const userAnswer = answers[index]?.trim();
                      const isCorrect = userAnswer === problem.answer;
                      
                      return (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border ${
                            isCorrect 
                              ? 'bg-green-900/20 border-green-600' 
                              : 'bg-red-900/20 border-red-600'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-neutral-300">
                                {problem.question}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                Your answer: {userAnswer || '(no answer)'} | 
                                Correct: {problem.solution}
                              </p>
                              <p className="text-xs text-blue-400 mt-1">
                                Formula: {problem.formula}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    onClick={startPractice}
                    className="w-full mt-4"
                  >
                    Try Again
                  </Button>
                </ExampleSection>
              )}
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  }
];

export default function Tab3QuickReferenceTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Quick Reference - Ordered Sampling"
      description="Everything you need at your fingertips"
      sections={SECTIONS}
      onComplete={onComplete}
      progressVariant="violet"
    />
  );
}