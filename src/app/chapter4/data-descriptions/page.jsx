"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createColorScheme, typography } from "@/lib/design-system";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, BarChart3 } from "lucide-react";
import Link from "next/link";

// Lazy load all components for performance
const CentralTendencyHub = lazy(() => 
  import("@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-0-CentralTendencyHub")
);
const CentralTendencyIntuitiveIntro = lazy(() => 
  import("@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyIntro")
);
const DescriptiveStatsJourney = lazy(() => 
  import("@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-2-DescriptiveStatsJourney")
);
const DescriptiveStatisticsFoundations = lazy(() => 
  import("@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-3-DescriptiveStatisticsFoundations")
);
const MathematicalFoundations = lazy(() => 
  import("@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-4-MathematicalFoundations")
);

// Default dataset for consistency across components
const defaultDataset = [65, 72, 68, 74, 81, 69, 73, 70, 75, 78, 82, 71, 66, 77, 79];

// Stage configuration
const stages = [
  { id: 'introduction', name: 'Introduction', icon: '📊', duration: '5 min' },
  { id: 'journey', name: 'Interactive Journey', icon: '🎯', duration: '15 min' },
  { id: 'foundations', name: 'Statistical Foundations', icon: '📈', duration: '10 min' },
  { id: 'mathematical', name: 'Mathematical Depth', icon: '∑', duration: '10 min' },
  { id: 'practice', name: 'Practice & Apply', icon: '✍️', duration: '10 min' }
];

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Back to Hub navigation
const BackToHub = () => (
  <Link href="/chapter4" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4">
    <ArrowLeft className="w-4 h-4" />
    <span>Back to Chapter 4 Hub</span>
  </Link>
);

// Progress Navigator Component
const StageNavigator = ({ stages, current, completed, onNavigate }) => {
  const colors = createColorScheme('estimation');
  
  return (
    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-200">Your Learning Path</h3>
        <span className="text-sm text-gray-400">
          {completed.length} of {stages.length} stages completed
        </span>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => {
          const isCompleted = completed.includes(stage.id);
          const isCurrent = current === stage.id;
          const isAccessible = index === 0 || completed.includes(stages[index - 1]?.id);
          
          return (
            <button
              key={stage.id}
              onClick={() => isAccessible && onNavigate(stage.id)}
              disabled={!isAccessible}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg transition-all min-w-[100px]",
                isCurrent && "bg-purple-900/30 border-2 border-purple-600",
                isCompleted && !isCurrent && "bg-green-900/20 border border-green-600/30",
                !isCompleted && !isCurrent && isAccessible && "bg-gray-800/30 border border-gray-600/30 hover:bg-gray-700/30",
                !isAccessible && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-2xl mb-1">{stage.icon}</span>
              <span className={cn(
                "text-xs font-medium",
                isCurrent && "text-purple-300",
                isCompleted && !isCurrent && "text-green-300",
                !isCompleted && !isCurrent && "text-gray-300"
              )}>
                {stage.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">{stage.duration}</span>
              <div className="mt-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${(completed.length / stages.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Dataset Panel Component
const DatasetPanel = ({ dataset, calculations, minimized }) => {
  const [isMinimized, setIsMinimized] = useState(minimized);
  
  useEffect(() => {
    setIsMinimized(minimized);
  }, [minimized]);
  
  if (isMinimized) {
    return (
      <motion.div
        className="fixed right-4 top-24 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700 cursor-pointer"
        onClick={() => setIsMinimized(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BarChart3 className="w-5 h-5 text-purple-400" />
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-24 w-64 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-200">Current Dataset</h4>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-300"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-gray-900/50 rounded">
          <span className="text-gray-400">Name:</span>
          <span className="ml-2 text-gray-200">{dataset.name || 'Student Grades'}</span>
        </div>
        
        <div className="p-2 bg-gray-900/50 rounded">
          <span className="text-gray-400">Size:</span>
          <span className="ml-2 text-gray-200">{dataset.values.length} values</span>
        </div>
        
        {calculations.mean !== null && (
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <h5 className="text-xs font-semibold text-gray-300 uppercase">Calculations</h5>
            {calculations.mean !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mean:</span>
                <span className="text-gray-200 font-mono">{calculations.mean.toFixed(2)}</span>
              </div>
            )}
            {calculations.median !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">Median:</span>
                <span className="text-gray-200 font-mono">{calculations.median.toFixed(2)}</span>
              </div>
            )}
            {calculations.stdDev !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">Std Dev:</span>
                <span className="text-gray-200 font-mono">{calculations.stdDev.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Page Component
export default function DataDescriptionsPage() {
  // Global state management
  const [globalState, setGlobalState] = useState({
    currentStage: 'introduction',
    completedStages: [],
    dataset: {
      name: 'Student Grades',
      values: defaultDataset,
      source: 'preloaded'
    },
    calculations: {
      mean: null,
      median: null,
      mode: null,
      quartiles: { Q1: null, Q2: null, Q3: null },
      variance: null,
      stdDev: null,
      outliers: []
    },
    userProgress: {
      conceptsMastered: [],
      exercisesCompleted: 0,
      timeSpent: 0,
      accuracy: null
    }
  });

  // Update global state helper
  const updateGlobalState = (updates) => {
    setGlobalState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Navigation logic
  const navigateToStage = (stage) => {
    setGlobalState(prev => ({
      ...prev,
      currentStage: stage,
      completedStages: prev.currentStage !== stage && !prev.completedStages.includes(prev.currentStage) 
        ? [...new Set([...prev.completedStages, prev.currentStage])]
        : prev.completedStages
    }));
  };

  // Stage completion handler
  const handleStageComplete = (nextStage) => {
    setGlobalState(prev => ({
      ...prev,
      completedStages: [...new Set([...prev.completedStages, prev.currentStage])],
      currentStage: nextStage
    }));
  };

  // Render current stage
  const renderCurrentStage = () => {
    switch (globalState.currentStage) {
      case 'introduction':
        return (
          <IntroductionStage
            globalState={globalState}
            onComplete={() => handleStageComplete('journey')}
          />
        );
      case 'journey':
        return (
          <JourneyStage
            globalState={globalState}
            updateGlobalState={updateGlobalState}
            onComplete={() => handleStageComplete('foundations')}
          />
        );
      case 'foundations':
        return (
          <FoundationsStage
            globalState={globalState}
            updateGlobalState={updateGlobalState}
            onComplete={() => handleStageComplete('mathematical')}
          />
        );
      case 'mathematical':
        return (
          <MathematicalStage
            globalState={globalState}
            onComplete={() => handleStageComplete('practice')}
          />
        );
      case 'practice':
        return (
          <PracticeStage
            globalState={globalState}
            updateGlobalState={updateGlobalState}
          />
        );
      default:
        return <IntroductionStage globalState={globalState} onComplete={() => handleStageComplete('journey')} />;
    }
  };

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('dataDescriptionsProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setGlobalState(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error('Failed to load saved progress:', e);
      }
    }
  }, []);

  // Save progress on state change
  useEffect(() => {
    if (globalState.completedStages.length > 0) {
      localStorage.setItem('dataDescriptionsProgress', JSON.stringify({
        completedStages: globalState.completedStages,
        calculations: globalState.calculations,
        userProgress: globalState.userProgress
      }));
    }
  }, [globalState.completedStages, globalState.calculations, globalState.userProgress]);

  return (
    <VisualizationContainer className="data-descriptions-page max-w-7xl mx-auto">
      <BackToHub />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Section 4.1: Data Descriptions
        </h1>
        <p className={cn(typography.description, "text-gray-300")}>
          Master the fundamental tools of descriptive statistics through interactive exploration
        </p>
      </div>
      
      {/* Progress Navigator */}
      <StageNavigator 
        stages={stages}
        current={globalState.currentStage}
        completed={globalState.completedStages}
        onNavigate={navigateToStage}
      />
      
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          {renderCurrentStage()}
        </Suspense>
      </AnimatePresence>
      
      {/* Persistent Dataset Panel */}
      <DatasetPanel 
        dataset={globalState.dataset}
        calculations={globalState.calculations}
        minimized={globalState.currentStage === 'introduction'}
      />
    </VisualizationContainer>
  );
}

// Stage Components
const IntroductionStage = ({ globalState, onComplete }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  return (
    <motion.div
      key="introduction"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          Welcome to Descriptive Statistics
        </h2>
        <p className={cn(typography.body, "mb-4 text-gray-300")}>
          Descriptive statistics help us understand and summarize data. In this section, 
          you'll explore measures of central tendency, spread, and distribution shape 
          through hands-on interactions.
        </p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CentralTendencyIntuitiveIntro 
          onInteraction={() => setHasInteracted(true)}
        />
      </Suspense>
      
      {hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          >
            Start Learning Journey
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const JourneyStage = ({ globalState, updateGlobalState, onComplete }) => {
  const [journeyComplete, setJourneyComplete] = useState(false);
  
  const handleJourneyUpdate = (updates) => {
    // Update global state with journey progress
    if (updates.calculations) {
      updateGlobalState({
        calculations: {
          ...globalState.calculations,
          ...updates.calculations
        }
      });
    }
    
    if (updates.conceptsMastered) {
      updateGlobalState({
        userProgress: {
          ...globalState.userProgress,
          conceptsMastered: updates.conceptsMastered
        }
      });
    }
    
    // Check if journey is complete
    if (updates.isComplete) {
      setJourneyComplete(true);
    }
  };
  
  return (
    <motion.div
      key="journey"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DescriptiveStatsJourney 
          initialDataset={globalState.dataset.values}
          onUpdate={handleJourneyUpdate}
        />
      </Suspense>
      
      {journeyComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue to Foundations
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const FoundationsStage = ({ globalState, updateGlobalState, onComplete }) => {
  const [foundationsComplete, setFoundationsComplete] = useState(false);
  
  return (
    <motion.div
      key="foundations"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DescriptiveStatisticsFoundations 
          dataset={globalState.dataset.values}
          previousCalculations={globalState.calculations}
          onComplete={() => setFoundationsComplete(true)}
        />
      </Suspense>
      
      {foundationsComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Explore Mathematical Foundations
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const MathematicalStage = ({ globalState, onComplete }) => {
  const [mathComplete, setMathComplete] = useState(false);
  
  return (
    <motion.div
      key="mathematical"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <MathematicalFoundations 
          dataset={globalState.dataset.values}
          calculations={globalState.calculations}
          onComplete={() => setMathComplete(true)}
        />
      </Suspense>
      
      {mathComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Practice Your Skills
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const PracticeStage = ({ globalState, updateGlobalState }) => {
  const colors = createColorScheme('estimation');
  
  return (
    <motion.div
      key="practice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          Practice & Apply Your Knowledge
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Summary of learned concepts */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-purple-300">Concepts Mastered</h3>
            <div className="space-y-2">
              {globalState.userProgress.conceptsMastered.map((concept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 capitalize">{concept}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key calculations summary */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-purple-300">Your Dataset Summary</h3>
            <div className="space-y-2 font-mono text-sm">
              {globalState.calculations.mean !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Mean:</span>
                  <span className="text-gray-200">{globalState.calculations.mean.toFixed(2)}</span>
                </div>
              )}
              {globalState.calculations.median !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Median:</span>
                  <span className="text-gray-200">{globalState.calculations.median.toFixed(2)}</span>
                </div>
              )}
              {globalState.calculations.stdDev !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard Deviation:</span>
                  <span className="text-gray-200">{globalState.calculations.stdDev.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
          <p className="text-purple-300">
            🎉 Congratulations! You've completed the Data Descriptions learning journey. 
            You now understand the fundamental measures used to summarize and describe data.
          </p>
        </div>
      </div>
    </motion.div>
  );
};