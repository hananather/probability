"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveJourneyNavigation } from './InteractiveJourneyNavigation';
import BackToHub from './BackToHub';
import { VisualizationSection } from './VisualizationContainer';
import { cn } from '@/lib/utils';

/**
 * Generic Section-Based Content Component
 * Provides a consistent structure for multi-section learning content
 * 
 * @param {Object} props
 * @param {string} props.title - Content title
 * @param {string} props.description - Content description
 * @param {Array} props.sections - Array of section configurations
 * @param {Function} props.onComplete - Callback when all sections are completed
 * @param {number} props.chapter - Chapter number for BackToHub
 * @param {string} props.progressVariant - Progress bar color variant
 * @param {boolean} props.showBackToHub - Whether to show BackToHub button (default: true)
 * @param {boolean} props.showHeader - Whether to show the main header section (default: true)
 * 
 * Section configuration:
 * {
 *   id: string,
 *   title: string,
 *   icon: React component (optional),
 *   content: React component or render function
 * }
 */

export default function SectionBasedContent({
  title,
  description,
  sections,
  onComplete,
  chapter,
  progressVariant = 'purple',
  showBackToHub = true,
  showHeader = true
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const contentRef = useRef(null);

  // Process MathJax when section changes
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [currentSection]);

  // Handle section navigation
  const handleNavigate = (newSection) => {
    setCurrentSection(newSection);
    // Mark previous section as completed when navigating forward
    if (newSection > currentSection && !completedSections.includes(currentSection)) {
      setCompletedSections(prev => [...prev, currentSection]);
    }
  };

  // Handle completion
  const handleComplete = () => {
    if (!hasCompleted) {
      // Mark last section as completed
      if (!completedSections.includes(sections.length - 1)) {
        setCompletedSections(prev => [...prev, sections.length - 1]);
      }
      setHasCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Check if current section is completed
  const isCurrentSectionCompleted = completedSections.includes(currentSection) || 
                                   (currentSection === sections.length - 1 && hasCompleted);

  const currentSectionData = sections[currentSection];

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="bg-neutral-900 border border-purple-600/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              {description && (
                <p className="text-neutral-300">{description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <VisualizationSection className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700/50">
        <div className="flex items-center gap-3">
          {currentSectionData.icon && (
            <span className="text-3xl">{currentSectionData.icon}</span>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Section {currentSection + 1}: {currentSectionData.title}
            </h3>
            <p className="text-sm text-neutral-400">
              {currentSection + 1} of {sections.length} sections
            </p>
          </div>
        </div>
      </VisualizationSection>

      {/* Section Content */}
      <motion.div
        ref={contentRef}
        key={currentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          {React.isValidElement(currentSectionData.content) 
            ? currentSectionData.content
            : React.createElement(currentSectionData.content, {
                sectionIndex: currentSection,
                isCompleted: isCurrentSectionCompleted
              })
          }
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <InteractiveJourneyNavigation
        currentSection={currentSection}
        totalSections={sections.length}
        onNavigate={handleNavigate}
        onComplete={handleComplete}
        sectionTitles={sections.map(s => s.title)}
        showProgress={true}
        progressVariant={progressVariant}
        isCompleted={isCurrentSectionCompleted}
        allowKeyboardNav={true}
        className="mt-8"
      />

      {/* Back to Hub */}
      {showBackToHub && <BackToHub chapter={chapter} bottom />}
    </div>
  );
}

/**
 * Helper component for creating bite-sized content sections
 */
export function SectionContent({ children, className }) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * Helper component for LaTeX formulas with consistent styling
 */
export function MathFormula({ children, className, block = true }) {
  return (
    <div className={cn(
      "my-4",
      block ? "text-center" : "inline-block",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Helper component for interactive elements within sections
 */
export function InteractiveElement({ title, children, className }) {
  return (
    <VisualizationSection 
      title={title} 
      className={cn("bg-neutral-900/50 rounded-lg p-4", className)}
    >
      {children}
    </VisualizationSection>
  );
}