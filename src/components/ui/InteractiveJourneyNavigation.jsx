"use client";
import React, { useEffect } from 'react';
import { Button } from './button';
import { ProgressBar } from './ProgressBar';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standardized navigation component for interactive journey sections
 * @param {Object} props
 * @param {number} props.currentSection - Current section index (0-based)
 * @param {number} props.totalSections - Total number of sections
 * @param {Function} props.onNavigate - Callback when navigating (receives new section index)
 * @param {Function} props.onComplete - Callback when completing the journey
 * @param {Array<string>} props.sectionTitles - Optional array of section titles
 * @param {boolean} props.showProgress - Show progress bar (default: true)
 * @param {string} props.progressVariant - Progress bar color variant (default: 'purple')
 * @param {boolean} props.allowKeyboardNav - Enable arrow key navigation (default: true)
 * @param {boolean} props.isCompleted - Whether the current section is completed
 * @param {string} props.className - Additional CSS classes
 */
export function InteractiveJourneyNavigation({
  currentSection,
  totalSections,
  onNavigate,
  onComplete,
  sectionTitles = [],
  showProgress = true,
  progressVariant = 'purple',
  allowKeyboardNav = true,
  isCompleted = false,
  className
}) {
  // Keyboard navigation
  useEffect(() => {
    if (!allowKeyboardNav) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentSection > 0) {
        onNavigate(currentSection - 1);
      } else if (e.key === 'ArrowRight' && currentSection < totalSections - 1) {
        onNavigate(currentSection + 1);
      } else if (e.key === 'Enter' && currentSection === totalSections - 1 && onComplete) {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection, totalSections, onNavigate, onComplete, allowKeyboardNav]);

  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const getPreviousButtonText = () => {
    if (currentSection > 0 && sectionTitles[currentSection - 1]) {
      return sectionTitles[currentSection - 1];
    }
    return 'Previous';
  };

  const getNextButtonText = () => {
    if (currentSection < totalSections - 1 && sectionTitles[currentSection + 1]) {
      return sectionTitles[currentSection + 1];
    }
    return 'Next';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar Always Shown */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProgressBar
          current={currentSection + 1}
          total={totalSections}
          variant={progressVariant}
        />
      </motion.div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        {/* Previous Button */}
        <Button
          variant="secondary"
          onClick={() => onNavigate(Math.max(0, currentSection - 1))}
          disabled={isFirstSection}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{getPreviousButtonText()}</span>
          <span className="sm:hidden">Previous</span>
        </Button>

        {/* Center Info */}
        <div className="text-center">
          <div className="text-sm text-neutral-400">
            {currentSection + 1} of {totalSections}
          </div>
          {allowKeyboardNav && (
            <div className="text-xs text-neutral-500 mt-1">
              Use ← → arrow keys
            </div>
          )}
        </div>

        {/* Next/Complete Button */}
        {isLastSection ? (
          <Button
            variant={isCompleted ? "secondary" : "primary"}
            onClick={() => {
              if (!isCompleted && onComplete) {
                onComplete();
              }
            }}
            disabled={isCompleted && !onComplete}
            className="flex items-center gap-2"
          >
            {isCompleted ? "✓ Completed" : "Complete Section"}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => onNavigate(currentSection + 1)}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">{getNextButtonText()}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default InteractiveJourneyNavigation;