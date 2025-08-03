"use client";

import React, { useState, useRef } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { useSafeMathJax } from '@/utils/mathJaxFix';
import { motion, AnimatePresence } from 'framer-motion';

// Visual Symbol Introduction
const VisualSymbolsSection = () => {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef);
  
  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-purple-600/30">
        <h4 className="font-semibold text-purple-400 mb-4 text-lg">
          Think of Symbols as Actions, Not Math!
        </h4>
        <p className="text-neutral-200 mb-6">
          Each symbol represents a simple action you can do with events:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* AND Symbol */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">∩</span>
              <div>
                <h5 className="text-green-400 font-semibold">AND (Intersection)</h5>
                <p className="text-xs text-neutral-400">Both must happen</p>
              </div>
            </div>
            <div className="bg-green-900/20 p-3 rounded">
              <p className="text-sm text-neutral-300 mb-2">
                <strong>Visual:</strong> Overlap of two circles
              </p>
              <svg viewBox="0 0 120 80" className="w-full h-20">
                <circle cx="40" cy="40" r="25" fill="rgba(34, 197, 94, 0.3)" stroke="rgb(34, 197, 94)" strokeWidth="2"/>
                <circle cx="80" cy="40" r="25" fill="rgba(59, 130, 246, 0.3)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
                <path d="M 60 20 A 25 25 0 0 1 60 60 A 25 25 0 0 1 60 20" fill="rgba(168, 85, 247, 0.5)"/>
                <text x="25" y="45" fill="white" fontSize="12">A</text>
                <text x="85" y="45" fill="white" fontSize="12">B</text>
                <text x="55" y="45" fill="white" fontSize="10">∩</text>
              </svg>
              <p className="text-xs text-neutral-400 mt-2">
                Example: "Rainy AND Cold" = only days that are BOTH
              </p>
            </div>
          </div>
          
          {/* OR Symbol */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">∪</span>
              <div>
                <h5 className="text-blue-400 font-semibold">OR (Union)</h5>
                <p className="text-xs text-neutral-400">At least one happens</p>
              </div>
            </div>
            <div className="bg-blue-900/20 p-3 rounded">
              <p className="text-sm text-neutral-300 mb-2">
                <strong>Visual:</strong> Everything in either circle
              </p>
              <svg viewBox="0 0 120 80" className="w-full h-20">
                <circle cx="40" cy="40" r="25" fill="rgba(59, 130, 246, 0.4)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
                <circle cx="80" cy="40" r="25" fill="rgba(59, 130, 246, 0.4)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
                <text x="25" y="45" fill="white" fontSize="12">A</text>
                <text x="85" y="45" fill="white" fontSize="12">B</text>
                <text x="55" y="70" fill="white" fontSize="10">All shaded = A ∪ B</text>
              </svg>
              <p className="text-xs text-neutral-400 mt-2">
                Example: "Rainy OR Sunny" = any day that's rainy, sunny, or both
              </p>
            </div>
          </div>
          
          {/* NOT Symbol */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">ᶜ</span>
              <div>
                <h5 className="text-red-400 font-semibold">NOT (Complement)</h5>
                <p className="text-xs text-neutral-400">Doesn't happen</p>
              </div>
            </div>
            <div className="bg-red-900/20 p-3 rounded">
              <p className="text-sm text-neutral-300 mb-2">
                <strong>Visual:</strong> Everything outside the circle
              </p>
              <svg viewBox="0 0 120 80" className="w-full h-20">
                <rect x="10" y="10" width="100" height="60" fill="rgba(239, 68, 68, 0.2)" stroke="rgb(239, 68, 68)"/>
                <circle cx="60" cy="40" r="25" fill="rgba(31, 41, 55, 0.8)" stroke="rgb(239, 68, 68)" strokeWidth="2"/>
                <text x="55" y="45" fill="white" fontSize="12">A</text>
                <text x="15" y="25" fill="white" fontSize="10">Aᶜ</text>
              </svg>
              <p className="text-xs text-neutral-400 mt-2">
                Example: "NOT Rainy" = all days except rainy ones
              </p>
            </div>
          </div>
          
          {/* GIVEN Symbol */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">|</span>
              <div>
                <h5 className="text-yellow-400 font-semibold">GIVEN (Conditional)</h5>
                <p className="text-xs text-neutral-400">Assuming B happened</p>
              </div>
            </div>
            <div className="bg-yellow-900/20 p-3 rounded">
              <p className="text-sm text-neutral-300 mb-2">
                <strong>Visual:</strong> Zoom into B, then look for A
              </p>
              <div className="text-center">
                <p className="text-2xl mb-1">A | B</p>
                <p className="text-xs text-neutral-400">Read: "A given B"</p>
                <p className="text-xs text-neutral-400 mt-2">
                  Example: "Rain | Cloudy" = probability of rain IF we know it's cloudy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SimpleInsightBox title="Memory Trick" theme="cyan">
        <p>
          • ∩ looks like ∩ in "AND" turned sideways<br/>
          • ∪ looks like a U for "Union" (OR)<br/>
          • | is a barrier - you're looking from one side (given condition)<br/>
          • ᶜ is up high like "complement" - everything else
        </p>
      </SimpleInsightBox>
    </div>
  );
};

// Pattern Recognition Section
const PatternRecognitionSection = () => {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef);
  
  const patterns = [
    {
      keyword: "both",
      symbol: "∩",
      examples: ["both A and B", "A as well as B", "A together with B"],
      color: "green"
    },
    {
      keyword: "at least one",
      symbol: "∪",
      examples: ["A or B", "either A or B", "A or B or both"],
      color: "blue"
    },
    {
      keyword: "exactly one",
      symbol: "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)",
      examples: ["A or B but not both", "either A or B (exclusive)"],
      color: "purple"
    },
    {
      keyword: "given that",
      symbol: "|",
      examples: ["A given B", "if B then what's probability of A", "knowing that B"],
      color: "yellow"
    },
    {
      keyword: "not",
      symbol: "ᶜ",
      examples: ["not A", "A doesn't happen", "anything except A"],
      color: "red"
    }
  ];
  
  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-600/30">
        <h4 className="font-semibold text-blue-400 mb-4 text-lg">
          Key Phrase Patterns
        </h4>
        <p className="text-neutral-200 mb-4">
          Look for these keywords in English - they directly map to symbols:
        </p>
      </div>
      
      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <div key={index} className={`bg-neutral-800/50 rounded-lg p-4 border border-${pattern.color}-600/30`}>
            <div className="flex items-center justify-between mb-2">
              <h5 className={`text-${pattern.color}-400 font-semibold`}>
                Keyword: "{pattern.keyword}"
              </h5>
              <span className="text-2xl font-mono">{pattern.symbol}</span>
            </div>
            <div className="text-sm text-neutral-300">
              <p className="mb-1">Also appears as:</p>
              <div className="flex flex-wrap gap-2">
                {pattern.examples.map((ex, i) => (
                  <span key={i} className="bg-neutral-700/50 px-2 py-1 rounded text-xs">
                    "{ex}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Build-Up Practice Section
const BuildUpPracticeSection = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [answers, setAnswers] = useState({});
  const contentRef = useRef(null);
  useSafeMathJax(contentRef);
  
  const levels = [
    {
      title: "Level 1: Single Events",
      instruction: "Start simple - just identify what the event is",
      problems: [
        {
          english: "The probability that it rains",
          hint: "What's the event? Just name it.",
          answer: "Let R = 'it rains', then P(R)",
          options: ["P(rain)", "P(R)", "rain", "Pr(rain)"],
          correct: 1,
          feedback: ["Needs a defined event letter", "Perfect! Define event then use P()", "This is just the event name", "We use P, not Pr"]
        },
        {
          english: "The probability that a student passes",
          hint: "Choose a letter for the event first",
          answer: "Let S = 'student passes', then P(S)",
          options: ["P(S)", "P(pass)", "S", "P(student)"],
          correct: 0,
          feedback: ["Correct! S represents the event", "Need to define what 'pass' means", "This is just the event", "Too vague - use a single letter"]
        }
      ]
    },
    {
      title: "Level 2: Two Events with AND/OR",
      instruction: "Now combine two events",
      problems: [
        {
          english: "The probability that it's sunny OR warm",
          hint: "OR means at least one happens",
          answer: "Let S = 'sunny', W = 'warm', then P(S ∪ W)",
          options: ["P(S ∪ W)", "P(S ∩ W)", "P(S + W)", "P(S, W)"],
          correct: 0,
          feedback: ["Yes! ∪ means OR", "∩ means AND, not OR", "Don't use + in probability", "Ambiguous notation"]
        },
        {
          english: "The probability that it's cold AND rainy",
          hint: "AND means both must happen",
          answer: "Let C = 'cold', R = 'rainy', then P(C ∩ R)",
          options: ["P(C ∪ R)", "P(C ∩ R)", "P(C × R)", "P(C and R)"],
          correct: 1,
          feedback: ["∪ means OR, not AND", "Perfect! ∩ means AND", "Don't use × for AND", "Use symbols, not words"]
        }
      ]
    },
    {
      title: "Level 3: Conditional Probability",
      instruction: "Handle 'given that' statements",
      problems: [
        {
          english: "The probability of rain given that it's cloudy",
          hint: "'Given that' means we know something already happened",
          answer: "Let R = 'rain', C = 'cloudy', then P(R | C)",
          options: ["P(R | C)", "P(C | R)", "P(R ∩ C)", "P(R → C)"],
          correct: 0,
          feedback: ["Correct! R given C", "Backwards - this is cloudy given rain", "This is both, not conditional", "We don't use arrows"]
        }
      ]
    }
  ];
  
  const handleAnswer = (levelIndex, problemIndex, optionIndex) => {
    const key = `${levelIndex}-${problemIndex}`;
    setAnswers(prev => ({ ...prev, [key]: optionIndex }));
  };
  
  const isLevelComplete = (levelIndex) => {
    return levels[levelIndex].problems.every((_, pIndex) => 
      answers[`${levelIndex}-${pIndex}`] === levels[levelIndex].problems[pIndex].correct
    );
  };
  
  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-lg border border-green-600/30">
        <h4 className="font-semibold text-green-400 mb-4 text-lg">
          🎮 Build Your Skills Step by Step
        </h4>
        <p className="text-neutral-200">
          Start with simple translations and work your way up. Each level unlocks when you complete the previous one!
        </p>
      </div>
      
      {levels.map((level, levelIndex) => {
        const isUnlocked = levelIndex === 0 || isLevelComplete(levelIndex - 1);
        const isComplete = isLevelComplete(levelIndex);
        
        return (
          <motion.div
            key={levelIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isUnlocked ? 1 : 0.5, y: 0 }}
            className={`bg-neutral-900/50 rounded-lg p-6 border ${
              isUnlocked ? 'border-neutral-600' : 'border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h5 className={`font-semibold text-lg ${
                isComplete ? 'text-green-400' : isUnlocked ? 'text-white' : 'text-neutral-500'
              }`}>
                {level.title} {isComplete && 'Complete'}
              </h5>
              {!isUnlocked && (
                <span className="text-xs text-neutral-500">🔒 Complete previous level to unlock</span>
              )}
            </div>
            
            {isUnlocked && (
              <>
                <p className="text-neutral-300 text-sm mb-4">{level.instruction}</p>
                
                {level.problems.map((problem, pIndex) => {
                  const key = `${levelIndex}-${pIndex}`;
                  const hasAnswered = answers[key] !== undefined;
                  const isCorrect = answers[key] === problem.correct;
                  
                  return (
                    <div key={pIndex} className="mb-6 last:mb-0">
                      <div className="bg-blue-900/20 p-3 rounded mb-2">
                        <p className="text-neutral-200">"{problem.english}"</p>
                        <p className="text-xs text-blue-400 mt-1">Hint: {problem.hint}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {problem.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => handleAnswer(levelIndex, pIndex, oIndex)}
                            disabled={hasAnswered}
                            className={`p-2 rounded text-sm transition-all ${
                              hasAnswered
                                ? oIndex === problem.correct
                                  ? 'bg-green-900/30 border border-green-500 text-green-400'
                                  : oIndex === answers[key]
                                    ? 'bg-red-900/30 border border-red-500 text-red-400'
                                    : 'bg-neutral-800/50 border border-neutral-700 text-neutral-500'
                                : 'bg-neutral-800 border border-neutral-600 hover:border-neutral-500'
                            }`}
                          >
                            <span dangerouslySetInnerHTML={{ __html: option }} />
                          </button>
                        ))}
                      </div>
                      
                      {hasAnswered && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`text-xs p-2 rounded ${
                              isCorrect ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                            }`}
                          >
                            {problem.feedback[answers[key]]}
                            {!isCorrect && (
                              <p className="mt-1 text-neutral-400">
                                Correct answer: {problem.answer}
                              </p>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// Real Context Practice
const RealContextSection = () => {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef);
  const [selectedContext, setSelectedContext] = useState(0);
  
  const contexts = [
    {
      title: "Medical Testing",
      scenario: "A medical test for a disease has these properties:\n• 95% accurate for sick patients (correctly identifies disease)\n• 98% accurate for healthy patients (correctly identifies no disease)\n• The disease affects 2% of the population",
      questions: [
        {
          ask: "Define the events we need",
          answer: "D = 'person has disease'\nT⁺ = 'test result is positive'\nT⁻ = 'test result is negative'"
        },
        {
          ask: "What does '95% accurate for sick patients' mean?",
          answer: "P(T⁺ | D) = 0.95\n(Probability of positive test GIVEN disease)"
        },
        {
          ask: "What do we usually want to know?",
          answer: "P(D | T⁺)\n(Probability of disease GIVEN positive test)\nThis is NOT the same as accuracy!"
        }
      ]
    },
    {
      title: "Weather Forecasting",
      scenario: "Weather patterns in your city:\n• If it's cloudy, there's a 40% chance of rain\n• 60% of days are cloudy\n• It rains on 30% of all days",
      questions: [
        {
          ask: "Define the events",
          answer: "C = 'cloudy day'\nR = 'rainy day'"
        },
        {
          ask: "Translate: 'If cloudy, 40% chance of rain'",
          answer: "P(R | C) = 0.40"
        },
        {
          ask: "What's the probability it's cloudy AND rainy?",
          answer: "P(C ∩ R) = P(R | C) × P(C) = 0.40 × 0.60 = 0.24"
        }
      ]
    }
  ];
  
  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-600/30">
        <h4 className="font-semibold text-purple-400 mb-4 text-lg">
          🌍 Real-World Translations
        </h4>
        <p className="text-neutral-200">
          Practice with scenarios you'll actually encounter:
        </p>
      </div>
      
      <div className="flex gap-2 mb-4">
        {contexts.map((ctx, index) => (
          <button
            key={index}
            onClick={() => setSelectedContext(index)}
            className={`px-4 py-2 rounded transition-all ${
              selectedContext === index
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {ctx.title}
          </button>
        ))}
      </div>
      
      <div className="bg-neutral-900/50 rounded-lg p-6">
        <h5 className="font-semibold text-white mb-3">{contexts[selectedContext].title}</h5>
        <div className="bg-neutral-800/50 p-4 rounded mb-4">
          <p className="text-sm text-neutral-300 whitespace-pre-line">
            {contexts[selectedContext].scenario}
          </p>
        </div>
        
        <div className="space-y-4">
          {contexts[selectedContext].questions.map((q, index) => (
            <div key={index} className="border-l-2 border-purple-600 pl-4">
              <p className="text-neutral-300 font-medium mb-2">{q.ask}</p>
              <div className="bg-neutral-800/50 p-3 rounded">
                <pre className="text-sm text-green-400 font-mono">{q.answer}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <InterpretationBox theme="purple">
        <p>
          <strong>Key Insight:</strong> Real-world problems often give you conditional probabilities 
          (like test accuracy) but ask for the reverse conditional (like disease given positive test). 
          Always identify what you HAVE vs what you WANT.
        </p>
      </InterpretationBox>
    </div>
  );
};

const SECTIONS = [
  {
    id: 'visual-symbols',
    title: 'Symbols Are Just Actions',
    icon: 'View',
    content: VisualSymbolsSection
  },
  {
    id: 'pattern-recognition',
    title: 'Recognize Key Phrases',
    icon: 'Search',
    content: PatternRecognitionSection
  },
  {
    id: 'build-up-practice',
    title: 'Level Up Your Skills',
    icon: '🎮',
    content: BuildUpPracticeSection
  },
  {
    id: 'real-context',
    title: 'Real-World Practice',
    icon: '🌍',
    content: RealContextSection
  }
];

export default function Tab2WorkedExamplesTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Master Probability Translation"
      description="Build intuition for converting English to math notation"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="blue"
      showHeader={true}
    />
  );
}