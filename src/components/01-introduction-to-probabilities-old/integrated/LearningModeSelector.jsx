import React from 'react';
import { cn } from '../../../lib/design-system';

/**
 * LearningModeSelector Component
 * Allows users to switch between Beginner, Intermediate, and Advanced modes
 * Each mode progressively reveals more features and complexity
 */
export function LearningModeSelector({ 
  currentMode, 
  onModeChange,
  className = "" 
}) {
  const modes = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Guided tutorials with basic operations',
      icon: '🎯',
      color: 'green'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Hints available, all basic operations',
      icon: '📊',
      color: 'yellow'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Full freedom, complex expressions',
      icon: '🚀',
      color: 'purple'
    }
  ];
  
  return (
    <div className={cn("learning-mode-selector", className)}>
      <div className="flex gap-2 mb-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "hover:scale-105 hover:shadow-lg",
              currentMode === mode.id
                ? `bg-${mode.color}-600 text-white shadow-md`
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            )}
          >
            <span className="mr-2">{mode.icon}</span>
            {mode.name}
          </button>
        ))}
      </div>
      
      {/* Mode Description */}
      <div className="mode-description mt-2">
        {modes.map(mode => (
          <div
            key={mode.id}
            className={cn(
              "text-xs text-neutral-400 transition-opacity duration-200",
              currentMode === mode.id ? "block" : "hidden"
            )}
          >
            {mode.description}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ModeFeatureGate Component
 * Conditionally renders content based on the current learning mode
 */
export function ModeFeatureGate({ 
  mode, 
  minMode, 
  children,
  fallback = null 
}) {
  const modeHierarchy = ['beginner', 'intermediate', 'advanced'];
  const currentLevel = modeHierarchy.indexOf(mode);
  const requiredLevel = modeHierarchy.indexOf(minMode);
  
  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }
  
  return fallback;
}

/**
 * TutorialOverlay Component
 * Shows guided instructions for beginner mode
 */
export function TutorialOverlay({ 
  step, 
  totalSteps,
  onNext,
  onSkip,
  children 
}) {
  const tutorials = [
    {
      title: "Welcome to Set Operations!",
      content: "Let's learn how to combine sets using Venn diagrams. Click Next to begin.",
      highlight: null
    },
    {
      title: "Meet the Sets",
      content: "These circles represent sets A, B, and C. Each contains different elements.",
      highlight: ".set-circle"
    },
    {
      title: "Build an Expression",
      content: "Use these buttons to create set expressions. Try clicking 'A' then '∪' then 'B'.",
      highlight: ".set-builder"
    },
    {
      title: "Evaluate Your Expression",
      content: "Click 'Evaluate' to see which elements are in your set expression.",
      highlight: ".evaluate-button"
    },
    {
      title: "See the Results",
      content: "The yellow highlighted areas show which elements are in your result set!",
      highlight: ".venn-diagram"
    }
  ];
  
  const currentTutorial = tutorials[step] || tutorials[0];
  
  return (
    <div className="relative">
      {children}
      
      {step < totalSteps && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
          
          {/* Tutorial Card */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                          bg-neutral-800 rounded-lg shadow-xl p-6 max-w-md
                          pointer-events-auto z-50">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {currentTutorial.title}
              </h3>
              <span className="text-xs text-neutral-400">
                Step {step + 1} of {totalSteps}
              </span>
            </div>
            
            <p className="text-sm text-neutral-300 mb-6">
              {currentTutorial.content}
            </p>
            
            <div className="flex justify-between">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
              
              <button
                onClick={onNext}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg text-sm font-medium
                         transition-colors"
              >
                {step === totalSteps - 1 ? 'Get Started!' : 'Next'}
              </button>
            </div>
          </div>
          
          {/* Highlight Element */}
          {currentTutorial.highlight && (
            <div 
              className="tutorial-highlight"
              data-highlight={currentTutorial.highlight}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * HintBubble Component
 * Shows contextual hints in intermediate mode
 */
export function HintBubble({ 
  show, 
  content, 
  position = 'bottom',
  onDismiss 
}) {
  if (!show) return null;
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };
  
  return (
    <div className={cn(
      "absolute z-40",
      positionClasses[position],
      "animate-fade-in"
    )}>
      <div className="bg-blue-900/90 text-blue-100 rounded-lg p-3 
                      shadow-lg max-w-xs relative">
        <button
          onClick={onDismiss}
          className="absolute top-1 right-1 text-blue-300 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <p className="text-sm pr-4">{content}</p>
        
        {/* Arrow */}
        <div className={cn(
          "absolute w-3 h-3 bg-blue-900/90 transform rotate-45",
          position === 'bottom' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
          position === 'top' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
          position === 'left' && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
          position === 'right' && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
        )} />
      </div>
    </div>
  );
}