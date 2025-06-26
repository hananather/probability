"use client";
import React, { useState, useEffect } from "react";
import MontyHallIntro from './monty-hall/MontyHallIntro';
import MontyHallInteractive from './1-7-1-MontyHallInteractive';
import MontyHallBayesian from './1-7-2-MontyHallBayesian';
import MontyHallSimulation from './1-7-3-MontyHallSimulation';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  {
    id: 'intro',
    title: 'The Paradox',
    component: MontyHallIntro,
    icon: '🚪',
    description: 'Discover why this famous problem confuses even mathematicians'
  },
  {
    id: 'play',
    title: 'Play & Learn',
    component: MontyHallInteractive,
    icon: '🎮',
    description: 'Experience the paradox firsthand through interactive gameplay',
    props: { embedded: true }
  },
  {
    id: 'proof',
    title: 'Mathematical Proof',
    component: MontyHallBayesian,
    icon: '📐',
    description: 'See the mathematics behind the counterintuitive solution'
  },
  {
    id: 'simulation',
    title: 'Law of Large Numbers',
    component: MontyHallSimulation,
    icon: '📊',
    description: 'Run thousands of trials to prove the winning strategy'
  }
];

function MontyHallJourney() {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [stage2GameCount, setStage2GameCount] = useState(0);
  
  const CurrentComponent = STAGES[currentStage].component;
  const currentStageProps = STAGES[currentStage].props || {};
  
  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('monty-hall-journey-progress');
    if (savedProgress) {
      const { stage, completed } = JSON.parse(savedProgress);
      setCurrentStage(stage);
      setCompletedStages(completed);
    }
  }, []);
  
  // Save progress
  useEffect(() => {
    localStorage.setItem('monty-hall-journey-progress', JSON.stringify({
      stage: currentStage,
      completed: completedStages
    }));
  }, [currentStage, completedStages]);
  
  const handleStageComplete = () => {
    if (!completedStages.includes(currentStage)) {
      setCompletedStages([...completedStages, currentStage]);
    }
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  };
  
  // Handle game completion for Stage 2 (Play & Learn)
  const handleStage2GameComplete = () => {
    if (currentStage === 1) { // Stage 2 is at index 1
      const newCount = stage2GameCount + 1;
      setStage2GameCount(newCount);
      
      // Auto-complete stage after 3 games
      if (newCount >= 3 && !completedStages.includes(1)) {
        handleStageComplete();
      }
    }
  };
  
  const handleStageSelect = (index) => {
    setCurrentStage(index);
    setShowStageSelect(false);
    // Reset stage 2 game count when changing stages
    if (index !== 1) {
      setStage2GameCount(0);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-600/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Monty Hall Masterclass
            </h2>
            <p className="text-neutral-300">
              Master the most famous probability paradox through interactive exploration
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStageSelect(!showStageSelect)}
          >
            {showStageSelect ? 'Hide Stages' : 'View All Stages'}
          </Button>
        </div>
        
        {/* Progress Bar */}
        <ProgressBar
          current={completedStages.length}
          total={STAGES.length}
          label="Journey Progress"
          variant="green"
          className="w-full"
        />
        
        {/* Stage Indicators */}
        <div className="flex items-center gap-4 mt-4">
          {STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex items-center gap-2 ${
                index === currentStage ? 'text-white' : 'text-neutral-500'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  completedStages.includes(index)
                    ? 'bg-green-600 border-green-500'
                    : index === currentStage
                    ? 'bg-emerald-600 border-emerald-500'
                    : 'bg-neutral-800 border-neutral-700'
                }`}
              >
                {completedStages.includes(index) ? '✓' : stage.icon}
              </div>
              <span className="text-sm hidden md:inline">{stage.title}</span>
              {index < STAGES.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    completedStages.includes(index) ? 'bg-green-600' : 'bg-neutral-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stage Selection Panel */}
      <AnimatePresence>
        {showStageSelect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(index)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  index === currentStage
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{stage.icon}</span>
                  <h3 className="font-semibold text-white">{stage.title}</h3>
                </div>
                <p className="text-sm text-neutral-400">{stage.description}</p>
                {completedStages.includes(index) && (
                  <div className="mt-2 text-xs text-green-400">✓ Completed</div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Current Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentComponent 
            {...currentStageProps}
            onGameComplete={currentStage === 1 ? handleStage2GameComplete : undefined}
            onStageComplete={handleStageComplete}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
          disabled={currentStage === 0}
        >
          ← Previous Stage
        </Button>
        
        <div className="text-sm text-neutral-400">
          Stage {currentStage + 1} of {STAGES.length}
        </div>
        
        {currentStage < STAGES.length - 1 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStageComplete}
          >
            Next Stage →
          </Button>
        )}
      </div>
    </div>
  );
}

export default MontyHallJourney;