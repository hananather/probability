"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { createColorScheme } from '@/lib/design-system';
import { useMathJax } from '@/hooks/useMathJax';

const chapterColors = createColorScheme('probability');

export default function Tab4InteractiveTab({ onComplete }) {
  const [currentMode, setCurrentMode] = useState('practice');
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const contentRef = useMathJax([]);

  // Enhanced challenges with multiple choice
  const challenges = [
    {
      id: 1,
      english: "The probability that it rains OR snows tomorrow",
      setup: "Let R = 'it rains', S = 'it snows'",
      options: [
        { value: "P(R ∪ S)", feedback: "Correct! Union captures the inclusive OR" },
        { value: "P(R ∩ S)", feedback: "Intersection would mean both rain AND snow simultaneously" },
        { value: "P(R) + P(S)", feedback: "This formula overcounts the overlap when both occur" },
        { value: "P(R | S)", feedback: "This reads as 'rain given snow', which is different" }
      ],
      correct: 0,
      hint: "Consider all the ways the statement could be true",
      visual: "union"
    },
    {
      id: 2,
      english: "Given that the test is positive, what's the probability of disease?",
      setup: "Let D = 'has disease', T⁺ = 'test positive'",
      options: [
        { value: "P(T⁺ | D)", feedback: "This expresses test accuracy for sick patients" },
        { value: "P(D | T⁺)", feedback: "Yes! This is what we want to know after seeing a positive test" },
        { value: "P(D ∩ T⁺)", feedback: "This is the joint probability, not what we're asked" },
        { value: "P(D) × P(T⁺)", feedback: "This formula assumes the events are independent" }
      ],
      correct: 1,
      hint: "What information do we have, and what are we trying to find?",
      visual: "conditional"
    },
    {
      id: 3,
      english: "At least one of the three machines fails",
      setup: "Let F₁ = 'machine 1 fails', F₂ = 'machine 2 fails', F₃ = 'machine 3 fails'",
      options: [
        { value: "F₁ ∪ F₂ ∪ F₃", feedback: "Yes! 'At least one' means OR (union) of all" },
        { value: "F₁ ∩ F₂ ∩ F₃", feedback: "This means ALL fail, not at least one" },
        { value: "P(F₁) + P(F₂) + P(F₃)", feedback: "This is probability notation, not event notation" },
        { value: "(F₁ ∩ F₂) ∪ F₃", feedback: "This groups incorrectly - we want any of them" }
      ],
      correct: 0,
      hint: "Think about what makes this statement true",
      visual: "multipleUnion"
    },
    {
      id: 4,
      english: "Both events A and B occur",
      setup: "Events A and B are defined",
      options: [
        { value: "A ∪ B", feedback: "Union means at least one, not both" },
        { value: "A ∩ B", feedback: "Excellent! Intersection means both happen" },
        { value: "A + B", feedback: "We don't use + for events in probability" },
        { value: "A × B", feedback: "We don't use × for events either" }
      ],
      correct: 1,
      hint: "What must be true for this statement to hold?",
      visual: "intersection"
    },
    {
      id: 5,
      english: "It's not the case that event A happens",
      setup: "Event A is defined",
      options: [
        { value: "Aᶜ", feedback: "Perfect! The complement symbol ᶜ means 'not'" },
        { value: "¬A", feedback: "This is logical notation, but Aᶜ is more common in probability" },
        { value: "~A", feedback: "Close, but use Aᶜ for probability notation" },
        { value: "!A", feedback: "This is programming notation, not probability" }
      ],
      correct: 0,
      hint: "We need everything outside of A",
      visual: "complement"
    }
  ];

  // Visual helpers for concepts
  const VisualHelper = ({ type }) => {
    switch(type) {
      case 'union':
        return (
          <svg viewBox="0 0 200 100" className="w-full max-w-xs mx-auto">
            {/* Background for contrast */}
            <rect x="0" y="0" width="200" height="100" fill="rgba(0, 0, 0, 0.2)" rx="8"/>
            
            {/* Both circles filled with bright color for union */}
            <circle cx="70" cy="50" r="35" fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
            <circle cx="130" cy="50" r="35" fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
            
            {/* Labels only */}
            <text x="55" y="55" fill="white" fontSize="16" fontWeight="bold">R</text>
            <text x="135" y="55" fill="white" fontSize="16" fontWeight="bold">S</text>
          </svg>
        );
      case 'intersection':
        return (
          <svg viewBox="0 0 200 100" className="w-full max-w-xs mx-auto">
            {/* Background for contrast */}
            <rect x="0" y="0" width="200" height="100" fill="rgba(0, 0, 0, 0.2)" rx="8"/>
            
            {/* Define clipping paths for proper intersection */}
            <defs>
              <clipPath id="clip-left">
                <circle cx="70" cy="50" r="35"/>
              </clipPath>
              <clipPath id="clip-right">
                <circle cx="130" cy="50" r="35"/>
              </clipPath>
            </defs>
            
            {/* Unfilled circles with borders */}
            <circle cx="70" cy="50" r="35" fill="none" stroke="rgb(156, 163, 175)" strokeWidth="2" opacity="0.5"/>
            <circle cx="130" cy="50" r="35" fill="none" stroke="rgb(156, 163, 175)" strokeWidth="2" opacity="0.5"/>
            
            {/* Intersection area - bright color */}
            <g>
              <circle cx="130" cy="50" r="35" fill="rgba(168, 85, 247, 0.7)" clipPath="url(#clip-left)"/>
            </g>
            
            {/* Labels */}
            <text x="50" y="55" fill="white" fontSize="16" fontWeight="bold">A</text>
            <text x="140" y="55" fill="white" fontSize="16" fontWeight="bold">B</text>
            
          </svg>
        );
      case 'conditional':
        return (
          <div className="text-center space-y-2">
            <div className="text-2xl font-mono">P(D | T⁺)</div>
            <div className="text-sm text-neutral-400">
              Read: "Probability of D given T⁺"
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              We KNOW T⁺ happened, what's the chance of D?
            </div>
          </div>
        );
      case 'complement':
        return (
          <svg viewBox="0 0 200 100" className="w-full max-w-xs mx-auto">
            {/* Background for contrast */}
            <rect x="0" y="0" width="200" height="100" fill="rgba(0, 0, 0, 0.2)" rx="8"/>
            
            {/* Universe (sample space) - filled */}
            <rect x="20" y="15" width="160" height="60" fill="rgba(239, 68, 68, 0.5)" stroke="rgb(239, 68, 68)" strokeWidth="2" rx="4"/>
            
            {/* Event A - dark/unfilled to show it's NOT included */}
            <circle cx="100" cy="45" r="25" fill="rgba(0, 0, 0, 0.7)" stroke="rgb(239, 68, 68)" strokeWidth="2"/>
            
            {/* Labels */}
            <text x="100" y="50" fill="rgb(156, 163, 175)" fontSize="16" textAnchor="middle" fontWeight="bold">A</text>
            <text x="40" y="30" fill="white" fontSize="14" fontWeight="bold">Aᶜ</text>
            
          </svg>
        );
      case 'multipleUnion':
        return (
          <svg viewBox="0 0 250 100" className="w-full max-w-xs mx-auto">
            {/* Background for contrast */}
            <rect x="0" y="0" width="250" height="100" fill="rgba(0, 0, 0, 0.2)" rx="8"/>
            
            {/* Three circles all filled for union */}
            <circle cx="70" cy="45" r="30" fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
            <circle cx="125" cy="45" r="30" fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
            <circle cx="180" cy="45" r="30" fill="rgba(59, 130, 246, 0.5)" stroke="rgb(59, 130, 246)" strokeWidth="2"/>
            
            {/* Labels */}
            <text x="70" y="50" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">F₁</text>
            <text x="125" y="50" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">F₂</text>
            <text x="180" y="50" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">F₃</text>
            
          </svg>
        );
      default:
        return null;
    }
  };

  const handleAnswer = (optionIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(optionIndex);
    const correct = optionIndex === challenges[currentChallenge].correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0
    }));
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Complete!
      if (onComplete) onComplete();
    }
  };

  const resetPractice = () => {
    setCurrentChallenge(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore({ correct: 0, total: 0, streak: 0 });
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  // Interactive Reference Mode
  const InteractiveReference = () => {
    const [selectedCategory, setSelectedCategory] = useState('basic-events');
    
    const categories = [
      {
        id: 'basic-events',
        title: 'Basic Events',
        icon: 'Target',
        entries: [
          { english: "The sample space", math: "S", example: "All possible outcomes" },
          { english: "An event A", math: "A ⊆ S", example: "A subset of outcomes" },
          { english: "Probability of A", math: "P(A)", example: "Chance A occurs" }
        ]
      },
      {
        id: 'combinations',
        title: 'Combining Events',
        icon: 'Link',
        entries: [
          { english: "A or B", math: "A ∪ B", example: "At least one happens" },
          { english: "A and B", math: "A ∩ B", example: "Both happen" },
          { english: "Not A", math: "Aᶜ", example: "A doesn't happen" },
          { english: "A given B", math: "A | B", example: "A, knowing B happened" }
        ]
      },
      {
        id: 'multiple',
        title: 'Multiple Events',
        icon: 'Chart',
        entries: [
          { english: "At least one", math: "A₁ ∪ A₂ ∪ ... ∪ Aₙ", example: "Any of them" },
          { english: "All of them", math: "A₁ ∩ A₂ ∩ ... ∩ Aₙ", example: "Every single one" },
          { english: "None of them", math: "(A₁ ∪ A₂ ∪ ... ∪ Aₙ)ᶜ", example: "Not any" }
        ]
      }
    ];

    const currentCategory = categories.find(c => c.id === selectedCategory);

    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900/50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              {currentCategory.icon} {currentCategory.title}
            </h3>
            
            <div className="space-y-3">
              {currentCategory.entries.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-800/50 rounded-lg p-4 hover:bg-neutral-800/70 transition-colors"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">English</p>
                      <p className="text-neutral-200">{entry.english}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Mathematical</p>
                      <p className="text-green-400 font-mono text-lg">{entry.math}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Meaning</p>
                      <p className="text-neutral-400 text-sm">{entry.example}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <VisualizationContainer
      title="Interactive Translation Hub"
      icon="Target"
      colorScheme={chapterColors}
    >
      <div ref={contentRef} className="space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setCurrentMode('practice')}
            variant={currentMode === 'practice' ? 'default' : 'secondary'}
            className="flex-1"
          >
            Translation Practice
          </Button>
          <Button
            onClick={() => setCurrentMode('reference')}
            variant={currentMode === 'reference' ? 'default' : 'secondary'}
            className="flex-1"
          >
            Interactive Reference
          </Button>
        </div>

        {currentMode === 'practice' ? (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">Correct</p>
                <p className="text-xl font-bold text-green-400">{score.correct}</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">Accuracy</p>
                <p className="text-xl font-bold text-blue-400">{accuracy}%</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">Streak</p>
                <p className="text-xl font-bold text-purple-400">{score.streak}</p>
              </div>
            </div>

            {/* Challenge */}
            <VisualizationSection>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-2">
                    Challenge {currentChallenge + 1} of {challenges.length}
                  </p>
                  <div className="w-full bg-neutral-800 rounded-full h-2 mb-6">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
                  <h3 className="text-lg font-semibold mb-2">Translate to Mathematical Notation:</h3>
                  <p className="text-xl text-neutral-200 mb-2">
                    "{challenges[currentChallenge].english}"
                  </p>
                  <p className="text-sm text-neutral-400">
                    {challenges[currentChallenge].setup}
                  </p>
                </div>

                {/* Visual Helper */}
                {challenges[currentChallenge].visual && (
                  <div className="bg-neutral-900/30 rounded-lg p-4">
                    <VisualHelper type={challenges[currentChallenge].visual} />
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {challenges[currentChallenge].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        showFeedback
                          ? selectedAnswer === index
                            ? index === challenges[currentChallenge].correct
                              ? 'bg-green-900/30 border-green-500 text-green-400'
                              : 'bg-red-900/30 border-red-500 text-red-400'
                            : index === challenges[currentChallenge].correct
                              ? 'bg-green-900/20 border-green-600/50 text-green-400/70'
                              : 'bg-neutral-800/30 border-neutral-700 text-neutral-500'
                          : 'bg-neutral-800 border-neutral-600 hover:border-blue-500 text-neutral-200'
                      }`}
                    >
                      <span className="font-mono text-lg" dangerouslySetInnerHTML={{ __html: option.value }} />
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <InterpretationBox 
                        theme={isCorrect ? "green" : "red"}
                        title={isCorrect ? "Correct!" : "Not quite..."}
                      >
                        <p>{challenges[currentChallenge].options[selectedAnswer].feedback}</p>
                        {!isCorrect && (
                          <p className="mt-2 text-sm">
                            <strong>Hint:</strong> {challenges[currentChallenge].hint}
                          </p>
                        )}
                      </InterpretationBox>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3">
                  {showFeedback && currentChallenge < challenges.length - 1 && (
                    <Button onClick={nextChallenge} className="flex-1">
                      Next Challenge →
                    </Button>
                  )}
                  {showFeedback && currentChallenge === challenges.length - 1 && (
                    <Button onClick={resetPractice} variant="secondary" className="flex-1">
                      Practice Again
                    </Button>
                  )}
                </div>
              </div>
            </VisualizationSection>

            {/* Completion Message */}
            {score.total === challenges.length && accuracy >= 80 && (
              <SimpleInsightBox title="Great Job!" theme="green">
                <p>
                  You've completed all challenges with {accuracy}% accuracy! 
                  You're ready to tackle more complex probability problems.
                </p>
              </SimpleInsightBox>
            )}
          </>
        ) : (
          <InteractiveReference />
        )}
      </div>
    </VisualizationContainer>
  );
}