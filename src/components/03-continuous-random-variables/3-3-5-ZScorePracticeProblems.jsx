"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, RefreshCw, HelpCircle, ChevronRight } from "lucide-react";
import * as jStat from "jstat";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { tutorial_3_3_5 } from '@/tutorials/chapter3';

// Memoized component for problem type buttons to prevent re-renders
const ProblemTypeButton = React.memo(({ type, isSelected, onClick }) => {
  const buttonRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(buttonRef, []);
  
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50 shadow-sm'
          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
      }`}
    >
      <div className="font-medium text-sm">{type.title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{type.description}</div>
    </button>
  );
});

// Memoized component for Quick Reference section
const QuickReference = React.memo(() => {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, []);
  
  return (
    <div ref={contentRef} className="mt-6 grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Formulas</h4>
        <div className="space-y-2 font-mono text-sm">
          <div className="text-blue-400" dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{x - \\mu}{\\sigma}\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\(Z \\sim N(0, 1)\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq z) = \\Phi(z)\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\(P(a < Z < b) = \\Phi(b) - \\Phi(a)\\)` }} />
        </div>
      </div>
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Empirical Rule</h4>
        <div className="space-y-2 font-mono text-sm">
          <div><span dangerouslySetInnerHTML={{ __html: `\\(\\pm 1\\sigma\\)` }} />: <span className="text-emerald-400">68%</span></div>
          <div><span dangerouslySetInnerHTML={{ __html: `\\(\\pm 2\\sigma\\)` }} />: <span className="text-emerald-400">95%</span></div>
          <div><span dangerouslySetInnerHTML={{ __html: `\\(\\pm 3\\sigma\\)` }} />: <span className="text-emerald-400">99.7%</span></div>
        </div>
      </div>
    </div>
  );
});

const ZScorePracticeProblems = () => {
  const colors = createColorScheme('probability');
  
  // Problem types
  const problemTypes = [
    {
      id: 'z-to-p',
      title: 'Find Probability from Z-Score',
      description: <span>Given a z-score, find <span dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq z)\\)` }} /></span>
    },
    {
      id: 'p-to-z',
      title: 'Find Z-Score from Probability',
      description: 'Given a probability, find the corresponding z-score'
    },
    {
      id: 'x-to-z',
      title: 'Convert X to Z-Score',
      description: <span>Given <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim N(\\mu, \\sigma^2)\\)` }} />, convert <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> to <span dangerouslySetInnerHTML={{ __html: `\\(z\\)` }} /></span>
    },
    {
      id: 'range',
      title: 'Find Probability in Range',
      description: <span>Find <span dangerouslySetInnerHTML={{ __html: `\\(P(a < X < b)\\)` }} /> for normal distribution</span>
    },
    {
      id: 'empirical',
      title: 'Apply Empirical Rule',
      description: <span>Use the <span dangerouslySetInnerHTML={{ __html: `\\(68\\)` }} />-<span dangerouslySetInnerHTML={{ __html: `\\(95\\)` }} />-<span dangerouslySetInnerHTML={{ __html: `\\(99.7\\)` }} /> rule</span>
    }
  ];
  
  // State
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [problemHistory, setProblemHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [selectedType, setSelectedType] = useState('z-to-p');
  
  // Generate a new problem
  const generateProblem = (type = selectedType) => {
    let problem = {};
    
    switch (type) {
      case 'z-to-p':
        const z = (Math.random() * 6 - 3).toFixed(2);
        const p = jStat.normal.cdf(parseFloat(z), 0, 1);
        problem = {
          type,
          question: <span>Find <span dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq ${z})\\)` }} /></span>,
          given: { z: parseFloat(z) },
          answer: p,
          tolerance: 0.0005,
          hint: <span>Use the standard normal CDF: <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(${z})\\)` }} /></span>,
          solution: <span><span dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq ${z}) = \\Phi(${z}) = ${p.toFixed(4)}\\)` }} /></span>
        };
        break;
        
      case 'p-to-z':
        const prob = Math.random() * 0.98 + 0.01;
        const zScore = jStat.normal.inv(prob, 0, 1);
        problem = {
          type,
          question: <span>Find <span dangerouslySetInnerHTML={{ __html: `\\(z\\)` }} /> such that <span dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq z) = ${prob.toFixed(3)}\\)` }} /></span>,
          given: { p: prob },
          answer: zScore,
          tolerance: 0.005,
          hint: <span>Use the inverse normal CDF: <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi^{-1}(${prob.toFixed(3)})\\)` }} /></span>,
          solution: <span><span dangerouslySetInnerHTML={{ __html: `\\(z = \\Phi^{-1}(${prob.toFixed(3)}) = ${zScore.toFixed(3)}\\)` }} /></span>
        };
        break;
        
      case 'x-to-z':
        const mu = Math.round(Math.random() * 100 + 50);
        const sigma = Math.round(Math.random() * 20 + 5);
        const x = mu + (Math.random() * 6 - 3) * sigma;
        const zCalc = (x - mu) / sigma;
        problem = {
          type,
          question: <span>Given <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim N(${mu}, ${sigma}^2)\\)` }} />, find the z-score for <span dangerouslySetInnerHTML={{ __html: `\\(x = ${x.toFixed(1)}\\)` }} /></span>,
          given: { mu, sigma, x },
          answer: zCalc,
          tolerance: 0.005,
          hint: <span>Use <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{x - \\mu}{\\sigma} = \\frac{${x.toFixed(1)} - ${mu}}{${sigma}}\\)` }} /></span>,
          solution: <span><span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{${x.toFixed(1)} - ${mu}}{${sigma}} = ${zCalc.toFixed(3)}\\)` }} /></span>
        };
        break;
        
      case 'range':
        const muRange = Math.round(Math.random() * 100 + 50);
        const sigmaRange = Math.round(Math.random() * 20 + 5);
        const a = muRange - (Math.random() * 2 + 0.5) * sigmaRange;
        const b = muRange + (Math.random() * 2 + 0.5) * sigmaRange;
        const z1 = (a - muRange) / sigmaRange;
        const z2 = (b - muRange) / sigmaRange;
        const pRange = jStat.normal.cdf(z2, 0, 1) - jStat.normal.cdf(z1, 0, 1);
        problem = {
          type,
          question: <span>Given <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim N(${muRange}, ${sigmaRange}^2)\\)` }} />, find <span dangerouslySetInnerHTML={{ __html: `\\(P(${a.toFixed(1)} < X < ${b.toFixed(1)})\\)` }} /></span>,
          given: { mu: muRange, sigma: sigmaRange, a, b },
          answer: pRange,
          tolerance: 0.0005,
          hint: <span>Convert to z-scores: <span dangerouslySetInnerHTML={{ __html: `\\(z_1 = ${z1.toFixed(2)}\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(z_2 = ${z2.toFixed(2)}\\)` }} /></span>,
          solution: <span><span dangerouslySetInnerHTML={{ __html: `\\(P(${a.toFixed(1)} < X < ${b.toFixed(1)}) = \\Phi(${z2.toFixed(2)}) - \\Phi(${z1.toFixed(2)}) = ${pRange.toFixed(4)}\\)` }} /></span>
        };
        break;
        
      case 'empirical':
        const muEmp = Math.round(Math.random() * 100 + 50);
        const sigmaEmp = Math.round(Math.random() * 20 + 5);
        const numSigmas = Math.floor(Math.random() * 3) + 1;
        const empiricalProbs = { 1: 0.68, 2: 0.95, 3: 0.997 };
        problem = {
          type,
          question: <span>Given <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim N(${muEmp}, ${sigmaEmp}^2)\\)` }} />, what percentage of values fall within <span dangerouslySetInnerHTML={{ __html: `\\(${numSigmas}\\sigma\\)` }} /> of the mean?</span>,
          given: { mu: muEmp, sigma: sigmaEmp, numSigmas },
          answer: empiricalProbs[numSigmas],
          tolerance: 0.005,
          hint: <span>Use the empirical rule: <span dangerouslySetInnerHTML={{ __html: `\\(${numSigmas}\\sigma\\)` }} /> corresponds to a specific percentage</span>,
          solution: <span>Within <span dangerouslySetInnerHTML={{ __html: `\\(\\pm ${numSigmas}\\sigma\\)` }} />: approximately <span dangerouslySetInnerHTML={{ __html: `\\(${(empiricalProbs[numSigmas] * 100).toFixed(1)}\\%\\)` }} /> of values</span>
        };
        break;
    }
    
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setShowHint(false);
  };
  
  // Check answer
  const checkAnswer = () => {
    if (!currentProblem || !userAnswer) return;
    
    const userNum = parseFloat(userAnswer);
    const correct = Math.abs(userNum - currentProblem.answer) <= currentProblem.tolerance;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update history
    setProblemHistory(prev => [...prev, {
      ...currentProblem,
      userAnswer: userNum,
      correct,
      timestamp: new Date()
    }]);
    
    // Update streak
    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };
  
  // Generate initial problem
  useEffect(() => {
    generateProblem();
  }, []);
  
  // Calculate statistics
  const getStats = () => {
    const total = problemHistory.length;
    const correct = problemHistory.filter(p => p.correct).length;
    const byType = {};
    
    problemTypes.forEach(type => {
      const typeProblems = problemHistory.filter(p => p.type === type.id);
      byType[type.id] = {
        total: typeProblems.length,
        correct: typeProblems.filter(p => p.correct).length
      };
    });
    
    return { total, correct, byType };
  };
  
  const stats = getStats();
  
  // Memoized component for problem display
  const ProblemDisplay = React.memo(({ problemNumber, question }) => {
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
    }, [question]);
    
    return (
      <div ref={contentRef} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">Problem</span>
          <span className="text-2xl font-bold font-mono text-blue-400">{problemNumber}</span>
        </div>
        <p className="text-xl leading-relaxed">{question}</p>
      </div>
    );
  });
  
  // Memoized component for hint display
  const HintDisplay = React.memo(({ hint }) => {
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
    }, [hint]);
    
    return (
      <div ref={contentRef} className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm">{hint}</p>
      </div>
    );
  });
  
  // Memoized component for solution display
  const SolutionDisplay = React.memo(({ solution }) => {
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
    }, [solution]);
    
    return (
      <div ref={contentRef} className="pt-3 border-t border-gray-700">
        <p className="text-sm font-semibold mb-2">Solution</p>
        <p className="font-mono text-sm leading-relaxed">{solution}</p>
      </div>
    );
  });
  
  return (
    <VisualizationContainer 
      title="Z-Score Practice Problems"
      tutorialSteps={tutorial_3_3_5}
      tutorialKey="z-score-practice-3-3-5"
    >
      <div className="w-full max-w-6xl mx-auto space-y-4">
        {/* Header with Streak and New Problem */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <span className="text-sm text-muted-foreground">Streak</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{streak}</span>
        </div>
        <Button
          onClick={() => generateProblem()}
          variant="primary"
          size="default"
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          New Problem
        </Button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-4">
        {/* Left Sidebar */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardContent className="p-4 space-y-4">
            {/* Problem Type Selection */}
            <div>
              <h3 className="text-base font-semibold mb-3">Problem Type</h3>
              <div className="space-y-2">
                {problemTypes.map(type => (
                  <ProblemTypeButton
                    key={type.id}
                    type={type}
                    isSelected={selectedType === type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      generateProblem(type.id);
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Progress Stats */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-3">Your Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Problems</span>
                  <span className="font-mono font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Correct</span>
                  <span className="font-mono font-medium">
                    {stats.correct} ({stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                
                {stats.total > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Type</p>
                    {problemTypes.map(type => {
                      const typeStats = stats.byType[type.id];
                      if (typeStats.total === 0) return null;
                      return (
                        <div key={type.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{type.title}</span>
                          <span className="font-mono">{typeStats.correct}/{typeStats.total}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Problem Area */}
        <Card className="flex-1">
          <CardContent className="p-6">
            {currentProblem && (
              <div className="space-y-6">
                {/* Problem Display */}
                <ProblemDisplay 
                  problemNumber={stats.total + 1} 
                  question={currentProblem.question} 
                />
                
                {/* Answer Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Answer
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        step="0.0001"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        className="flex-1 px-4 py-3 text-lg font-mono border rounded-lg bg-gray-900 border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your answer..."
                        disabled={showFeedback}
                      />
                      <Button
                        onClick={checkAnswer}
                        disabled={!userAnswer || showFeedback}
                        variant="primary"
                        size="lg"
                        className="min-w-[120px]"
                      >
                        Check
                      </Button>
                    </div>
                  </div>
                  
                  {/* Hint Section */}
                  {!showFeedback && (
                    <div>
                      <Button
                        onClick={() => setShowHint(!showHint)}
                        variant="neutral"
                        size="sm"
                        className="gap-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {showHint ? 'Hide' : 'Show'} Hint
                      </Button>
                      
                      {showHint && (
                        <HintDisplay hint={currentProblem.hint} />
                      )}
                    </div>
                  )}
                  
                  {/* Feedback */}
                  {showFeedback && (
                    <div className={`p-6 rounded-lg border-2 ${
                      isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-3">
                          <p className="font-semibold text-lg">
                            {isCorrect ? 'Correct!' : 'Not quite right'}
                          </p>
                          {!isCorrect && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Your answer:</span>
                                <span className="font-mono text-lg">{parseFloat(userAnswer).toFixed(4)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Correct answer:</span>
                                <span className="font-mono text-lg text-emerald-400">{currentProblem.answer.toFixed(4)}</span>
                              </div>
                            </div>
                          )}
                          <SolutionDisplay solution={currentProblem.solution} />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => generateProblem()}
                        variant="primary"
                        size="lg"
                        className="mt-4 w-full gap-2"
                      >
                        Next Problem
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Quick Reference */}
                <QuickReference />
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default ZScorePracticeProblems;