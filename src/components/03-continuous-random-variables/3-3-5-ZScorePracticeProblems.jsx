"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, RefreshCw, HelpCircle } from "lucide-react";
import * as jStat from "jstat";

const ZScorePracticeProblems = () => {
  const colors = createColorScheme('estimation');
  
  // Problem types
  const problemTypes = [
    {
      id: 'z-to-p',
      title: 'Find Probability from Z-Score',
      description: 'Given a z-score, find P(Z ≤ z)'
    },
    {
      id: 'p-to-z',
      title: 'Find Z-Score from Probability',
      description: 'Given a probability, find the corresponding z-score'
    },
    {
      id: 'x-to-z',
      title: 'Convert X to Z-Score',
      description: 'Given X ~ N(μ, σ²), convert x to z'
    },
    {
      id: 'range',
      title: 'Find Probability in Range',
      description: 'Find P(a < X < b) for normal distribution'
    },
    {
      id: 'empirical',
      title: 'Apply Empirical Rule',
      description: 'Use the 68-95-99.7 rule'
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
          question: `Find P(Z ≤ ${z})`,
          given: { z: parseFloat(z) },
          answer: p,
          tolerance: 0.0005,
          hint: `Use the standard normal CDF: Φ(${z})`,
          solution: `P(Z ≤ ${z}) = Φ(${z}) = ${p.toFixed(4)}`
        };
        break;
        
      case 'p-to-z':
        const prob = Math.random() * 0.98 + 0.01;
        const zScore = jStat.normal.inv(prob, 0, 1);
        problem = {
          type,
          question: `Find z such that P(Z ≤ z) = ${prob.toFixed(3)}`,
          given: { p: prob },
          answer: zScore,
          tolerance: 0.005,
          hint: `Use the inverse normal CDF: Φ⁻¹(${prob.toFixed(3)})`,
          solution: `z = Φ⁻¹(${prob.toFixed(3)}) = ${zScore.toFixed(3)}`
        };
        break;
        
      case 'x-to-z':
        const mu = Math.round(Math.random() * 100 + 50);
        const sigma = Math.round(Math.random() * 20 + 5);
        const x = mu + (Math.random() * 6 - 3) * sigma;
        const zCalc = (x - mu) / sigma;
        problem = {
          type,
          question: `Given X ~ N(${mu}, ${sigma}²), find the z-score for x = ${x.toFixed(1)}`,
          given: { mu, sigma, x },
          answer: zCalc,
          tolerance: 0.005,
          hint: `Use z = (x - μ) / σ = (${x.toFixed(1)} - ${mu}) / ${sigma}`,
          solution: `z = (${x.toFixed(1)} - ${mu}) / ${sigma} = ${zCalc.toFixed(3)}`
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
          question: `Given X ~ N(${muRange}, ${sigmaRange}²), find P(${a.toFixed(1)} < X < ${b.toFixed(1)})`,
          given: { mu: muRange, sigma: sigmaRange, a, b },
          answer: pRange,
          tolerance: 0.0005,
          hint: `Convert to z-scores: z₁ = ${z1.toFixed(2)}, z₂ = ${z2.toFixed(2)}`,
          solution: `P(${a.toFixed(1)} < X < ${b.toFixed(1)}) = Φ(${z2.toFixed(2)}) - Φ(${z1.toFixed(2)}) = ${pRange.toFixed(4)}`
        };
        break;
        
      case 'empirical':
        const muEmp = Math.round(Math.random() * 100 + 50);
        const sigmaEmp = Math.round(Math.random() * 20 + 5);
        const numSigmas = Math.floor(Math.random() * 3) + 1;
        const empiricalProbs = { 1: 0.68, 2: 0.95, 3: 0.997 };
        problem = {
          type,
          question: `Given X ~ N(${muEmp}, ${sigmaEmp}²), what percentage of values fall within ${numSigmas}σ of the mean?`,
          given: { mu: muEmp, sigma: sigmaEmp, numSigmas },
          answer: empiricalProbs[numSigmas],
          tolerance: 0.005,
          hint: `Use the empirical rule: ${numSigmas}σ corresponds to a specific percentage`,
          solution: `Within ±${numSigmas}σ: approximately ${(empiricalProbs[numSigmas] * 100).toFixed(1)}% of values`
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
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Z-Score Practice Problems</span>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Streak:</span>{' '}
                <span className="font-bold text-lg">{streak}</span>
              </div>
              <Button
                onClick={() => generateProblem()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Problem
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Problem Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Problem Type</h3>
                <div className="space-y-2">
                  {problemTypes.map(type => (
                    <Button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        generateProblem(type.id);
                      }}
                      variant={selectedType === type.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-left"
                    >
                      <div>
                        <div className="font-semibold">{type.title}</div>
                        <div className="text-xs opacity-80">{type.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Statistics */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold">Your Progress</h4>
                <div className="space-y-1 text-sm">
                  <p>Total Problems: {stats.total}</p>
                  <p>Correct: {stats.correct} ({stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0}%)</p>
                  <p>Current Streak: {streak}</p>
                </div>
                
                {stats.total > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-xs font-semibold">By Type:</p>
                    {problemTypes.map(type => {
                      const typeStats = stats.byType[type.id];
                      if (typeStats.total === 0) return null;
                      return (
                        <div key={type.id} className="text-xs flex justify-between">
                          <span>{type.title}:</span>
                          <span>{typeStats.correct}/{typeStats.total}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Problem */}
            <div className="col-span-2 space-y-4">
              {currentProblem && (
                <>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Problem {stats.total + 1}</h4>
                    <p className="text-lg">{currentProblem.question}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Your Answer:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                          className="flex-1 px-3 py-2 border rounded-md bg-background"
                          placeholder="Enter your answer..."
                          disabled={showFeedback}
                        />
                        <Button
                          onClick={checkAnswer}
                          disabled={!userAnswer || showFeedback}
                        >
                          Check
                        </Button>
                      </div>
                    </div>
                    
                    {!showFeedback && (
                      <Button
                        onClick={() => setShowHint(!showHint)}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {showHint ? 'Hide' : 'Show'} Hint
                      </Button>
                    )}
                    
                    {showHint && !showFeedback && (
                      <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                        <p className="text-sm">{currentProblem.hint}</p>
                      </div>
                    )}
                    
                    {showFeedback && (
                      <div className={`p-4 rounded-lg border ${
                        isCorrect 
                          ? 'bg-emerald-900/20 border-emerald-600/30' 
                          : 'bg-red-900/20 border-red-600/30'
                      }`}>
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          )}
                          <div className="space-y-2">
                            <p className="font-semibold">
                              {isCorrect ? 'Correct!' : 'Not quite right'}
                            </p>
                            {!isCorrect && (
                              <>
                                <p className="text-sm">
                                  Your answer: {parseFloat(userAnswer).toFixed(4)}
                                </p>
                                <p className="text-sm">
                                  Correct answer: {currentProblem.answer.toFixed(4)}
                                </p>
                              </>
                            )}
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold">Solution:</p>
                              <p className="text-sm">{currentProblem.solution}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => generateProblem()}
                          className="mt-4 w-full"
                        >
                          Next Problem
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Formulas Reference */}
                  <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Quick Reference</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <p>Z-score: z = (x - μ) / σ</p>
                      <p>Standard Normal: Z ~ N(0, 1)</p>
                      <p>P(Z ≤ z) = Φ(z)</p>
                      <p>P(a &lt; Z &lt; b) = Φ(b) - Φ(a)</p>
                      <p>Empirical Rule: 68-95-99.7</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZScorePracticeProblems;