"use client";
import React, { useState, useRef } from "react";
import MontyHallIntro from './MontyHallIntro';
import MontyHallInteractive from './MontyHallGame';
import MontyHallBayesian from './MontyHallBayesProof';
import MontyHallSimulation from './MontyHallSimulation';
import { Button } from '../../ui/button';
import { ProgressBar } from '../../ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter1ReferenceSheet } from '../../reference-sheets/Chapter1ReferenceSheet';
import { LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { LearningActivityContext, useLearningActivity } from '@/hooks/useLearningActivity';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Animation timing constants
const ANIMATION_CONSTANTS = {
  STAGE_TRANSITION_DURATION: 0.3, // Duration for stage transitions
};

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

const SOURCE = LEGACY_SOURCE_BY_KEY['monty-hall-journey-progress'];

function MontyStage({ index, learning, onComplete }) {
  const [context] = useState(() => learning.captureWriteContext(SOURCE.containerId));
  const gameCount = useRef(0);
  const stage = STAGES[index];
  const Component = stage.component;
  const complete = () => onComplete(index, context);
  const activity = {
    ...learning, containerId: SOURCE.targetIds[index], writeContext: context,
    resume: learning.getResume(SOURCE.targetIds[index]),
    completeActivity: (id = SOURCE.targetIds[index], options = {}) => learning.completeActivity(id, { ...options, context: options.context || context }),
    setResume: (id, locator, options = {}) => learning.setResume(id, locator, { ...options, context: options.context || context }),
  };
  return <LearningActivityContext.Provider value={activity}>
    <Component {...stage.props} onStageComplete={complete} onGameComplete={index === 1 ? () => {
      gameCount.current += 1;
      if (gameCount.current === 3) complete();
    } : undefined} />
    <div className="mt-4 flex justify-end">
      <Button onClick={complete} disabled={learning.isCompleted(SOURCE.targetIds[index])}>
        {learning.isCompleted(SOURCE.targetIds[index]) ? '✓ Stage studied' : 'Mark stage as studied'}
      </Button>
    </div>
  </LearningActivityContext.Provider>;
}

function JourneyContent({ learning }) {
  const restored = SOURCE.targetIds.indexOf(learning.resume?.activityId);
  const currentStage = restored >= 0 ? restored : 0;
  const currentStageRef = useRef(currentStage);
  currentStageRef.current = currentStage;
  const completedStages = STAGES.map((_, index) => index).filter(index => learning.isCompleted(SOURCE.targetIds[index]));
  const [showStageSelect, setShowStageSelect] = useState(false);
  const reducedMotion = useReducedMotion();
  const handleStageSelect = index => {
    if (!Number.isInteger(index) || index < 0 || index >= STAGES.length) return;
    void learning.setResume(SOURCE.containerId, { activityId: SOURCE.targetIds[index], kind: 'stage' }, { context: learning.writeContext });
    setShowStageSelect(false);
  };
  const handleStageComplete = async (index, context) => {
    const currentContext = () => learning.getResetGeneration(SOURCE.targetIds[index], learning.captureWriteContext(SOURCE.targetIds[index])) === learning.getResetGeneration(SOURCE.targetIds[index], context);
    if (!currentContext()) return;
    await learning.completeActivity(SOURCE.targetIds[index], { sourceKey: 'monty-hall-stage-study', context });
    if (currentContext() && currentStageRef.current === index && index < STAGES.length - 1) {
      await learning.setResume(SOURCE.containerId, { activityId: SOURCE.targetIds[index + 1], kind: 'stage' }, { context });
    }
  };

  return (
    <>
      <Chapter1ReferenceSheet mode="floating" />
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
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                aria-pressed={currentStage === index}
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
          key={`${currentStage}:${learning.getResetGeneration(SOURCE.targetIds[currentStage], learning.writeContext)}`}
          initial={reducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: reducedMotion ? 0 : ANIMATION_CONSTANTS.STAGE_TRANSITION_DURATION }}
        >
          <MontyStage index={currentStage} learning={learning} onComplete={handleStageComplete} />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleStageSelect(Math.max(0, currentStage - 1))}
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
            onClick={() => handleStageSelect(currentStage + 1)}
          >
            Next Stage →
          </Button>
        )}
      </div>
    </div>
    </>
  );
}

export default function MontyHallJourney() {
  const learning = useLearningActivity(SOURCE.containerId);
  if (learning.loading) return <p role="status">Loading your journey progress…</p>;
  return <>
    {learning.persistenceStatus === 'session-only' && <div role="status" className="mb-4 text-sm text-amber-200">
      <p>Your recent changes are only kept for this visit. Export a backup from Your progress before closing this page.</p>
      <button className="min-h-11 underline" onClick={() => learning.retryLocalPersistence()}>Try saving again</button>
    </div>}
    <JourneyContent key={learning.resetGeneration} learning={learning} />
  </>;
}