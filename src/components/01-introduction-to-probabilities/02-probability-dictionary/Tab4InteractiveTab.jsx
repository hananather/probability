"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { createColorScheme } from '@/lib/design-system';

// Use Chapter 7 consistent colors
const chapterColors = createColorScheme('probability');

export default function Tab4InteractiveTab({ onComplete }) {
  const [currentMode, setCurrentMode] = useState('practice'); // 'practice' or 'reference'
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Interactive translation challenges
  const translationChallenges = [
    {
      id: 1,
      english: "The probability that it rains OR snows tomorrow",
      correct: ["P(Rain ∪ Snow)", "P(R ∪ S)", "Rain ∪ Snow"],
      hint: "'OR' usually means union (∪)",
      explanation: "The word 'OR' translates to the union symbol ∪"
    },
    {
      id: 2,
      english: "Given that the test is positive, probability of disease",
      correct: ["P(Disease | Test⁺)", "P(D | T⁺)", "P(Disease | Positive)"],
      hint: "'Given that' indicates conditional probability",
      explanation: "The condition (what we know) comes after the | symbol"
    },
    {
      id: 3,
      english: "At least one of the three machines fails",
      correct: ["M₁ᶜ ∪ M₂ᶜ ∪ M₃ᶜ", "F₁ ∪ F₂ ∪ F₃", "(M₁ ∩ M₂ ∩ M₃)ᶜ"],
      hint: "'At least one' means union of the individual events",
      explanation: "Multiple correct ways: union of failures OR complement of all working"
    },
    {
      id: 4,
      english: "The event that both A and B occur",
      correct: ["A ∩ B", "A AND B"],
      hint: "'Both' and 'and' indicate intersection",
      explanation: "Intersection (∩) represents events happening together"
    },
    {
      id: 5,
      english: "It's not the case that A happens",
      correct: ["Aᶜ", "A'", "¬A", "NOT A"],
      hint: "'Not' indicates complement",
      explanation: "Complement represents the opposite of an event"
    }
  ];

  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Interactive reference dictionary with clickable phrases
  const interactiveDictionary = [
    {
      id: 'basic-events',
      category: 'Basic Events',
      entries: [
        { english: "sample space", math: "S", explanation: "The set of all possible outcomes" },
        { english: "an event", math: "A ⊆ S", explanation: "A subset of the sample space" },
        { english: "event A occurred", math: "s_actual ∈ A", explanation: "The actual outcome is in set A" },
        { english: "something must happen", math: "s_actual ∈ S", explanation: "The outcome must be in the sample space" }
      ]
    },
    {
      id: 'combinations',
      category: 'Event Combinations',
      entries: [
        { english: "A or B", math: "A ∪ B", explanation: "Union - elements in either A or B (or both)" },
        { english: "A and B", math: "A ∩ B", explanation: "Intersection - elements in both A and B" },
        { english: "not A", math: "Aᶜ", explanation: "Complement - everything except A" },
        { english: "A or B, but not both", math: "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)", explanation: "Exclusive or - one but not the other" }
      ]
    },
    {
      id: 'multiple-events',
      category: 'Multiple Events',
      entries: [
        { english: "at least one of A₁, A₂, A₃", math: "A₁ ∪ A₂ ∪ A₃", explanation: "Union of all events" },
        { english: "all of A₁, A₂, A₃", math: "A₁ ∩ A₂ ∩ A₃", explanation: "Intersection of all events" },
        { english: "exactly one of A₁, A₂, A₃", math: "(A₁ ∩ A₂ᶜ ∩ A₃ᶜ) ∪ (A₁ᶜ ∩ A₂ ∩ A₃ᶜ) ∪ (A₁ᶜ ∩ A₂ᶜ ∩ A₃)", explanation: "Only one event occurs, others don't" }
      ]
    },
    {
      id: 'relationships',
      category: 'Event Relationships',
      entries: [
        { english: "A implies B", math: "A ⊆ B", explanation: "If A happens, then B must happen" },
        { english: "A and B are mutually exclusive", math: "A ∩ B = ∅", explanation: "A and B cannot both occur" },
        { english: "A₁, A₂, A₃ partition S", math: "A₁ ∪ A₂ ∪ A₃ = S and Aᵢ ∩ Aⱼ = ∅ for i ≠ j", explanation: "Events cover everything and don't overlap" }
      ]
    }
  ];

  const handleSubmit = () => {
    const challenge = translationChallenges[currentChallenge];
    const isCorrect = challenge.correct.some(answer => 
      userInput.toLowerCase().replace(/\s/g, '').includes(answer.toLowerCase().replace(/\s/g, ''))
    );

    if (isCorrect) {
      setFeedback(`✓ Correct! ${challenge.explanation}`);
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setFeedback(`Try again. ${challenge.explanation}`);
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const nextChallenge = () => {
    setCurrentChallenge((prev) => (prev + 1) % translationChallenges.length);
    setUserInput('');
    setFeedback('');
    setShowHint(false);
  };

  const handlePhraseClick = (entry) => {
    setSelectedPhrase(entry);
  };

  return (
    <VisualizationContainer title="Interactive Translation Hub" className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Mode Selection */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-4">
            <h4 className="font-bold text-white mb-3">Learning Mode</h4>
            <div className="space-y-2">
              <Button
                onClick={() => setCurrentMode('practice')}
                variant={currentMode === 'practice' ? 'primary' : 'neutral'}
                className="w-full"
              >
                Translation Practice
              </Button>
              <Button
                onClick={() => setCurrentMode('reference')}
                variant={currentMode === 'reference' ? 'primary' : 'neutral'}
                className="w-full"
              >
                Interactive Reference
              </Button>
            </div>
          </VisualizationSection>

          {currentMode === 'practice' && (
            <VisualizationSection className="p-4">
              <h4 className="font-bold text-white mb-3">Practice Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Correct:</span>
                  <span className="text-green-400">{score.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Attempts:</span>
                  <span>{score.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="text-blue-400">
                    {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </VisualizationSection>
          )}

          {selectedPhrase && currentMode === 'reference' && (
            <VisualizationSection className="p-4">
              <h4 className="font-bold text-white mb-3">Selected Phrase</h4>
              <div className="space-y-3">
                <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                  <p className="text-sm font-medium text-blue-400">English:</p>
                  <p className="text-neutral-300">"{selectedPhrase.english}"</p>
                </div>
                <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                  <p className="text-sm font-medium text-green-400">Mathematical:</p>
                  <p className="text-neutral-300 font-mono" dangerouslySetInnerHTML={{ __html: selectedPhrase.math }} />
                </div>
                <div className="bg-purple-900/20 p-3 rounded border border-purple-600/30">
                  <p className="text-sm font-medium text-purple-400">Explanation:</p>
                  <p className="text-neutral-300 text-sm">{selectedPhrase.explanation}</p>
                </div>
              </div>
            </VisualizationSection>
          )}
        </div>

        {/* Right Panel - Main Content */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {currentMode === 'practice' ? (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VisualizationSection className="p-6">
                <h4 className="font-bold text-white mb-4">
                  Translation Challenge {currentChallenge + 1} of {translationChallenges.length}
                </h4>
              
              <div className="space-y-6">
                <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
                  <p className="text-lg text-neutral-300">
                    Translate this English phrase to mathematical notation:
                  </p>
                  <p className="text-xl font-semibold text-white mt-2">
                    "{translationChallenges[currentChallenge].english}"
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-300">
                    Your Answer:
                  </label>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter mathematical notation..."
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-blue-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <p className="text-xs text-neutral-500">
                    Tip: Use symbols like ∪ (union), ∩ (intersection), ᶜ (complement), | (given)
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} variant="primary">
                    Check Answer
                  </Button>
                  <Button 
                    onClick={() => setShowHint(!showHint)} 
                    variant="neutral"
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  <Button onClick={nextChallenge} variant="neutral">
                    Next Challenge
                  </Button>
                </div>

                {showHint && (
                  <SimpleInsightBox title="Hint" theme="orange">
                    <p>{translationChallenges[currentChallenge].hint}</p>
                  </SimpleInsightBox>
                )}

                {feedback && (
                  <InterpretationBox 
                    theme={feedback.startsWith('✓') ? 'green' : 'red'}
                    title={feedback.startsWith('✓') ? 'Correct!' : 'Keep Trying'}
                  >
                    <p>{feedback}</p>
                  </InterpretationBox>
                )}
              </div>
              </VisualizationSection>
            </motion.div>
          ) : (
            <motion.div
              key="reference"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VisualizationSection className="p-6">
                <h4 className="font-bold text-white mb-4">Interactive Translation Reference</h4>
                <p className="text-neutral-400 mb-6">Click on any English phrase to see its mathematical translation and explanation.</p>
              
              <div className="space-y-6">
                {interactiveDictionary.map((category) => (
                  <div key={category.id}>
                    <h5 className="font-semibold text-white mb-3 text-lg">{category.category}</h5>
                    <div className="grid gap-2">
                      {category.entries.map((entry, index) => (
                        <button
                          key={index}
                          onClick={() => handlePhraseClick(entry)}
                          className={`text-left p-3 rounded-lg border transition-colors ${
                            selectedPhrase === entry
                              ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                              : 'bg-neutral-800/50 border-neutral-600 text-neutral-300 hover:bg-neutral-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>"{entry.english}"</span>
                            <span className="font-mono text-sm" dangerouslySetInnerHTML={{ __html: entry.math }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </VisualizationSection>
            </motion.div>
          )}
          </AnimatePresence>

          <div className="mt-6">
            <SimpleInsightBox title="Mastery Goal" theme="purple">
              <p>
                The goal is automatic translation. When you see English, you should immediately 
                think in mathematical notation. When you see symbols, you should instantly know 
                what they mean in plain language.
              </p>
            </SimpleInsightBox>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}