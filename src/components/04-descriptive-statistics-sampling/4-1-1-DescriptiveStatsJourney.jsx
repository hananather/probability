"use client";
import React, { useState, useEffect } from "react";
import DataExplorerIntro from './4-1-1-DataExplorerIntro';
import CentralTendencyJourney from './4-1-central-tendency/4-1-1-CentralTendencyJourney';
import ComprehensiveStats from './4-1-1-ComprehensiveStats';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  {
    id: 'explore',
    title: 'Meet Your Data',
    component: DataExplorerIntro,
    icon: '📊',
    description: 'Start with the basics - see and feel your data'
  },
  {
    id: 'central',
    title: 'Finding the Center',
    component: CentralTendencyJourney,
    icon: '🎯',
    description: 'Master mean, median, and mode through interactive challenges'
  },
  {
    id: 'practice',
    title: 'Real-World Practice',
    component: ComprehensiveStats,
    icon: '🔬',
    description: 'Apply your knowledge to real scenarios'
  }
];

function DescriptiveStatsJourney() {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [showStageSelect, setShowStageSelect] = useState(false);
  
  const CurrentComponent = STAGES[currentStage].component;
  
  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('descriptive-stats-progress');
    if (savedProgress) {
      const { stage, completed } = JSON.parse(savedProgress);
      setCurrentStage(stage);
      setCompletedStages(completed);
    }
  }, []);
  
  // Save progress
  useEffect(() => {
    localStorage.setItem('descriptive-stats-progress', JSON.stringify({
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
  
  const handleStageSelect = (index) => {
    setCurrentStage(index);
    setShowStageSelect(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-600/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              4.1 Descriptive Stats Journey
            </h2>
            <p className="text-neutral-300">
              Master the fundamentals of data analysis through interactive exploration
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
          variant="purple"
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
                    ? 'bg-indigo-600 border-indigo-500'
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
            className="grid md:grid-cols-3 gap-4"
          >
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(index)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  index === currentStage
                    ? 'border-indigo-500 bg-indigo-900/20'
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
          <CurrentComponent />
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
        
        <Button
          variant="primary"
          size="sm"
          onClick={handleStageComplete}
          disabled={currentStage === STAGES.length - 1 && completedStages.includes(currentStage)}
        >
          {currentStage === STAGES.length - 1 ? 'Complete Journey' : 'Next Stage →'}
        </Button>
      </div>
    </div>
  );
}

export default DescriptiveStatsJourney;