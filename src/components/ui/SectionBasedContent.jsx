"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from 'next/navigation';
import { InteractiveJourneyNavigation } from './InteractiveJourneyNavigation';
import BackToHub from './BackToHub';
import { VisualizationSection } from './VisualizationContainer';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const SectionRenderer = React.memo(function SectionRenderer({ content, sectionIndex, isCompleted }) {
  return React.isValidElement(content)
    ? content
    : React.createElement(content, { sectionIndex, isCompleted });
});

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
 * @param {string} props.storageKey - Optional device-local key for the active section, independent of completion
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
  sections = [],
  onComplete,
  chapter,
  progressVariant = 'purple',
  showBackToHub = true,
  showHeader = true,
  storageKey
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const tabId = (title || 'sections').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const resumeKey = storageKey || `probability:resume:section:${pathname || '/'}:${tabId}`;
  const sectionSignature = JSON.stringify(sections.map(section => section.id));
  const identity = `${resumeKey}:${sectionSignature}`;
  const [position, setPosition] = useState({ identity: null, index: 0 });
  const currentSection = position.identity === identity && Number.isInteger(position.index) && position.index >= 0 && position.index < sections.length
    ? position.index : 0;
  const [completedSections, setCompletedSections] = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const contentRef = useRef(null);
  const headingRef = useRef(null);
  const focusOnNavigate = useRef(false);
  const isCurrentSectionCompleted = completedSections.includes(currentSection) ||
    (currentSection === sections.length - 1 && hasCompleted);

  useEffect(() => {
    const sectionIds = JSON.parse(sectionSignature);
    let restoredIndex = 0;
    try {
      const saved = JSON.parse(localStorage.getItem(resumeKey) || 'null');
      const savedIndex = typeof saved === 'number' ? saved : saved?.index;
      const idIndex = saved?.sectionId ? sectionIds.indexOf(saved.sectionId) : -1;
      if (idIndex >= 0) restoredIndex = idIndex;
      else if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < sectionIds.length) restoredIndex = savedIndex;
    } catch {
      // Corrupt or unavailable device storage must not prevent reading a lesson.
    }
    setPosition({ identity, index: restoredIndex });
    setCompletedSections([]);
    setHasCompleted(false);
  }, [resumeKey, sectionSignature, identity]);

  useEffect(() => {
    if (position.identity !== identity || !sections[currentSection]) return;
    try {
      localStorage.setItem(resumeKey, JSON.stringify({ index: currentSection, sectionId: sections[currentSection].id }));
    } catch {
      // Section navigation remains usable without persisted device state.
    }
  }, [position.identity, identity, resumeKey, currentSection, sections]);

  useEffect(() => {
    if (!focusOnNavigate.current || !headingRef.current) return;
    focusOnNavigate.current = false;
    headingRef.current.focus({ preventScroll: true });
    headingRef.current.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }, [currentSection, reducedMotion]);

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
  }, [currentSection, isCurrentSectionCompleted, reducedMotion]);

  // Handle section navigation
  const handleNavigate = (newSection) => {
    if (!Number.isInteger(newSection) || newSection < 0 || newSection >= sections.length || newSection === currentSection) return;
    focusOnNavigate.current = true;
    setPosition({ identity, index: newSection });
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

  const currentSectionData = sections[currentSection];

  if (!currentSectionData) {
    return <p role="status" className="text-neutral-400">No sections are available.</p>;
  }

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
            <h3 ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-lg font-semibold text-white focus:outline-none">
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
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        className="min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          <SectionRenderer
            content={currentSectionData.content}
            sectionIndex={currentSection}
            isCompleted={isCurrentSectionCompleted}
          />
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
