"use client";

import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * SharedNavigation - A consistent navigation component for all Interactive Explorer implementations
 * 
 * @param {Object} props
 * @param {number} props.currentStep - Current step/page index
 * @param {number} props.totalSteps - Total number of steps/pages
 * @param {Function} props.onNavigate - Callback function when navigating (receives new step index)
 * @param {Function} props.onComplete - Optional callback when reaching the end
 * @param {boolean} props.showProgress - Whether to show progress indicator (default: true)
 * @param {string} props.nextLabel - Custom label for next button (default: "Next")
 * @param {string} props.previousLabel - Custom label for previous button (default: "Previous")
 * @param {boolean} props.disabled - Whether navigation is disabled (default: false)
 * @param {string} props.className - Additional CSS classes for the container
 */
export default function SharedNavigation({
  currentStep,
  totalSteps,
  onNavigate,
  onComplete,
  showProgress = true,
  nextLabel = "Next",
  previousLabel = "Previous",
  disabled = false,
  className = ""
}) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    if (e.key === 'ArrowLeft' && !isFirstStep) {
      e.preventDefault();
      onNavigate(currentStep - 1);
    } else if (e.key === 'ArrowRight' && !isLastStep) {
      e.preventDefault();
      onNavigate(currentStep + 1);
    } else if (e.key === 'ArrowRight' && isLastStep && onComplete) {
      e.preventDefault();
      onComplete();
    }
  }, [currentStep, totalSteps, onNavigate, onComplete, disabled, isFirstStep, isLastStep]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handlePrevious = () => {
    if (!isFirstStep && !disabled) {
      onNavigate(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep && !disabled) {
      onNavigate(currentStep + 1);
    } else if (isLastStep && onComplete && !disabled) {
      onComplete();
    }
  };

  return (
    <div className={`mt-8 pt-6 border-t border-neutral-700 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          disabled={isFirstStep || disabled}
          variant="neutral"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {previousLabel}
        </Button>

        {/* Progress Indicator */}
        {showProgress && (
          <div className="flex items-center gap-4">
            {/* Progress Bar */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-neutral-400">Progress</span>
              <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm text-neutral-300 font-medium">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>

            {/* Mobile Progress Dots */}
            <div className="flex md:hidden gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? 'bg-blue-500 w-6'
                      : i < currentStep
                      ? 'bg-blue-600'
                      : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={disabled}
          variant={isLastStep && !onComplete ? "neutral" : "primary"}
          className="flex items-center gap-2"
        >
          {isLastStep && !onComplete ? "Complete" : nextLabel}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-500">
          Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
          <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
        </p>
      </div>
    </div>
  );
}

// Export a variant for step-by-step components that have internal navigation
export function StepNavigation({
  currentStep,
  totalSteps,
  onStepChange,
  onComplete,
  stepLabels = [],
  className = ""
}) {
  return (
    <SharedNavigation
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNavigate={onStepChange}
      onComplete={onComplete}
      nextLabel={stepLabels[currentStep + 1] ? `Next: ${stepLabels[currentStep + 1]}` : "Next Step"}
      previousLabel={stepLabels[currentStep - 1] ? `Back: ${stepLabels[currentStep - 1]}` : "Previous Step"}
      className={className}
    />
  );
}