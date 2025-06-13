"use client";
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/design-system';
import { Button } from './button';

/**
 * Reusable Tutorial Component
 * 
 * Usage:
 * <Tutorial 
 *   steps={[
 *     { 
 *       target: '.element-selector', // Optional: element to highlight
 *       title: 'Step Title',
 *       content: 'Step description...',
 *       position: 'bottom' // Optional: top, bottom, left, right
 *     }
 *   ]}
 *   onComplete={() => console.log('Tutorial completed')}
 *   onSkip={() => console.log('Tutorial skipped')}
 *   showOnMount={true}
 *   persistKey="myComponent" // Optional: localStorage key to remember completion
 * />
 */

export function Tutorial({ 
  steps = [], 
  onComplete, 
  onSkip,
  showOnMount = true,
  persistKey = null,
  mode = 'modal', // 'modal' or 'tooltip'
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const tooltipRef = useRef(null);

  // Check if tutorial was already completed/skipped
  useEffect(() => {
    if (persistKey) {
      const completed = localStorage.getItem(`tutorial-${persistKey}-completed`);
      if (completed) return;
    }
    
    if (showOnMount && steps.length > 0) {
      setIsVisible(true);
    }
  }, [showOnMount, persistKey, steps.length]);

  // Highlight target element when step changes
  useEffect(() => {
    if (!isVisible || mode !== 'tooltip') return;

    const step = steps[currentStep];
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
      }
    };
  }, [currentStep, isVisible, mode, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (persistKey) {
      localStorage.setItem(`tutorial-${persistKey}-completed`, 'true');
    }
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (persistKey) {
      localStorage.setItem(`tutorial-${persistKey}-completed`, 'skipped');
    }
    onSkip?.();
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          mode === 'tooltip' && highlightedElement && "pointer-events-none"
        )}
        onClick={mode === 'modal' ? undefined : handleSkip}
      />

      {/* Highlighted Element Cutout (for tooltip mode) */}
      {mode === 'tooltip' && highlightedElement && (
        <div
          className="fixed z-50 ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent rounded-lg pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tutorial Content */}
      <div 
        ref={tooltipRef}
        className={cn(
          "fixed z-50 bg-neutral-800 rounded-lg shadow-2xl p-6 max-w-md",
          mode === 'modal' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          mode === 'tooltip' && "transition-all duration-300",
          className
        )}
        style={mode === 'tooltip' && highlightedElement ? getTooltipPosition(highlightedElement, currentStepData.position) : {}}
      >
        {/* Progress */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {currentStepData.title}
          </h3>
          <span className="text-sm text-neutral-400">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-700 rounded-full h-1.5 mb-4">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="text-neutral-300 text-sm mb-6 space-y-2">
          {typeof currentStepData.content === 'string' ? (
            <p>{currentStepData.content}</p>
          ) : (
            currentStepData.content
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <Button
            variant="neutral"
            size="sm"
            onClick={handleSkip}
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="neutral"
                size="sm"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? 'Start Learning' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to calculate tooltip position
function getTooltipPosition(targetElement, position = 'bottom') {
  const rect = targetElement.getBoundingClientRect();
  const tooltipWidth = 400; // max-w-md
  const tooltipHeight = 200; // approximate
  const offset = 12;

  let styles = {};

  switch (position) {
    case 'top':
      styles = {
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
        bottom: window.innerHeight - rect.top + offset
      };
      break;
    case 'bottom':
      styles = {
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
        top: rect.bottom + offset
      };
      break;
    case 'left':
      styles = {
        right: window.innerWidth - rect.left + offset,
        top: rect.top + rect.height / 2 - tooltipHeight / 2
      };
      break;
    case 'right':
      styles = {
        left: rect.right + offset,
        top: rect.top + rect.height / 2 - tooltipHeight / 2
      };
      break;
    default:
      styles = {
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
        top: rect.bottom + offset
      };
  }

  // Ensure tooltip stays within viewport
  if (styles.left !== undefined) {
    styles.left = Math.max(10, Math.min(styles.left, window.innerWidth - tooltipWidth - 10));
  }
  if (styles.top !== undefined) {
    styles.top = Math.max(10, Math.min(styles.top, window.innerHeight - tooltipHeight - 10));
  }

  return styles;
}

// Hook for programmatic control
export function useTutorial(persistKey) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (persistKey) {
      const completed = localStorage.getItem(`tutorial-${persistKey}-completed`);
      setShouldShow(!completed);
    }
  }, [persistKey]);

  const resetTutorial = () => {
    if (persistKey) {
      localStorage.removeItem(`tutorial-${persistKey}-completed`);
      setShouldShow(true);
    }
  };

  return { shouldShow, resetTutorial };
}