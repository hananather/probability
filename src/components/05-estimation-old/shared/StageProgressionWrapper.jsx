import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/design-system';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

/**
 * StageProgressionWrapper - A component for guided learning with progressive feature unlocking
 * Shows current stage with progress dots and unlocks features as learners progress
 * 
 * @param {Object} props
 * @param {Array} props.stages - Array of stage objects with structure:
 *   {
 *     id: string,
 *     title: string,
 *     description: string,
 *     completed: boolean,
 *     locked: boolean
 *   }
 * @param {number} props.currentStage - Current stage index (0-based)
 * @param {function} props.onStageComplete - Callback when a stage is completed
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} [props.className] - Additional CSS classes
 */
export function StageProgressionWrapper({
  stages = [],
  currentStage = 0,
  onStageComplete,
  children,
  className
}) {
  const [animatingStage, setAnimatingStage] = useState(null);
  
  // Handle stage completion animation
  const handleStageComplete = () => {
    setAnimatingStage(currentStage);
    setTimeout(() => {
      setAnimatingStage(null);
      if (onStageComplete) {
        onStageComplete(currentStage);
      }
    }, 600);
  };
  
  // Calculate progress percentage
  const completedStages = stages.filter(stage => stage.completed).length;
  const progressPercentage = (completedStages / stages.length) * 100;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        {/* Stage Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            Stage {currentStage + 1}: {stages[currentStage]?.title}
          </h3>
          <p className="text-sm text-neutral-400">
            {stages[currentStage]?.description}
          </p>
        </div>
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {stages.map((stage, index) => {
            const isCompleted = stage.completed;
            const isCurrent = index === currentStage;
            const isAnimating = index === animatingStage;
            const isLocked = stage.locked;
            
            return (
              <div
                key={stage.id}
                className="relative group"
              >
                {/* Progress Dot */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                    isCompleted && "bg-teal-600 shadow-lg shadow-teal-600/30",
                    isCurrent && !isCompleted && "bg-neutral-600 ring-2 ring-teal-500 ring-offset-2 ring-offset-neutral-800",
                    !isCompleted && !isCurrent && !isLocked && "bg-neutral-700",
                    isLocked && "bg-neutral-800 opacity-50",
                    isAnimating && "animate-pulse scale-125"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
                
                {/* Stage Number */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-neutral-500 font-mono">
                  {index + 1}
                </div>
                
                {/* Tooltip */}
                <div className={cn(
                  "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                  index > stages.length / 2 && "left-auto right-0 translate-x-0"
                )}>
                  {stage.title}
                </div>
                
                {/* Connecting Line */}
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-1/2 left-full w-[calc(100%+0.75rem)] h-0.5 -translate-y-1/2 transition-all duration-300",
                      stages[index + 1].completed || (isCurrent && isCompleted) 
                        ? "bg-teal-600" 
                        : "bg-neutral-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8 mb-2">
          <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-600 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Progress Text */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">Learning Progress</span>
          <span className="text-teal-400 font-mono">
            {completedStages}/{stages.length} stages complete
          </span>
        </div>
      </div>
      
      {/* Stage Content */}
      <div className="relative">
        {/* Lock Overlay for Future Stages */}
        {stages[currentStage]?.locked && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">
                Complete previous stages to unlock this content
              </p>
            </div>
          </div>
        )}
        
        {/* Render Children */}
        {children}
      </div>
      
      {/* Stage Complete Button */}
      {!stages[currentStage]?.completed && !stages[currentStage]?.locked && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleStageComplete}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all duration-300",
              "bg-teal-600 hover:bg-teal-700 text-white",
              "shadow-lg hover:shadow-xl hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            )}
          >
            Complete Stage {currentStage + 1}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Helper hook for managing stage progression state
 */
export function useStageProgression(stageDefinitions) {
  const [stages, setStages] = useState(() =>
    stageDefinitions.map((stage, index) => ({
      ...stage,
      completed: false,
      locked: index > 0 // First stage is unlocked by default
    }))
  );
  
  const [currentStage, setCurrentStage] = useState(0);
  
  const completeStage = (stageIndex) => {
    setStages(prev => {
      const newStages = [...prev];
      // Mark current stage as completed
      newStages[stageIndex].completed = true;
      // Unlock next stage if it exists
      if (stageIndex + 1 < newStages.length) {
        newStages[stageIndex + 1].locked = false;
        setCurrentStage(stageIndex + 1);
      }
      return newStages;
    });
  };
  
  const resetProgression = () => {
    setStages(stageDefinitions.map((stage, index) => ({
      ...stage,
      completed: false,
      locked: index > 0
    })));
    setCurrentStage(0);
  };
  
  return {
    stages,
    currentStage,
    completeStage,
    resetProgression,
    setCurrentStage
  };
}

export default StageProgressionWrapper;