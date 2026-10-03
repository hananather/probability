"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from 'next/navigation';
import { InteractiveJourneyNavigation } from './InteractiveJourneyNavigation';
import BackToHub from './BackToHub';
import { VisualizationSection } from './VisualizationContainer';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LearningActivityContext } from '@/hooks/useLearningActivity';
import { ACTIVITY_BY_ID } from '@/lib/curriculum/manifest';
import { isSafeId } from '@/lib/progress/schema';

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
 * @param {string} props.storageKey - Optional section-renderer identity; progress uses the enclosing registered activity
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
  const learning = useContext(LearningActivityContext);
  const containerId = learning?.containerId;
  const registered = !!learning?.supported && Object.hasOwn(ACTIVITY_BY_ID, containerId);
  const loading = registered && learning.loading;
  const tabId = (title || 'sections').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const identity = JSON.stringify([containerId || null, pathname, storageKey || tabId, registered ? learning.resetGeneration : 'session']);
  const [position, setPosition] = useState(null);
  const [completionIdentity, setCompletionIdentity] = useState(null);
  const savedPosition = registered && !loading ? learning.getResume(containerId) : null;
  const legacyPosition = registered && !loading ? learning.getLegacySectionResume?.(containerId) : null;
  const locator = position?.identity === identity ? position : savedPosition;
  const idIndex = locator?.positionId ? sections.findIndex(section => section.id === locator.positionId) : -1;
  const currentSection = idIndex >= 0 ? idIndex
    : Number.isInteger(locator?.legacyIndex) && locator.legacyIndex >= 0 && locator.legacyIndex < sections.length
      ? locator.legacyIndex : 0;
  const hasCompleted = completionIdentity === identity || (registered && !loading && learning.isCompleted(containerId));
  const contentRef = useRef(null);
  const headingRef = useRef(null);
  const focusOnNavigate = useRef(false);
  const isCurrentSectionCompleted = hasCompleted;

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
    const nextPosition = { identity, legacyIndex: newSection, positionId: sections[newSection].id };
    setPosition(nextPosition);
    if (registered && !loading) {
      const nextLocator = {
        activityId: null,
        kind: 'section',
        legacyIndex: newSection,
        ...(isSafeId(nextPosition.positionId) ? { positionId: nextPosition.positionId } : {}),
      };
      void learning.setResume(containerId, nextLocator, { context: learning.writeContext }).finally(() => {
        setPosition(previous => previous === nextPosition ? null : previous);
      });
    }
  };

  // Handle completion
  const handleComplete = () => {
    if (!hasCompleted && !loading) {
      setCompletionIdentity(identity);
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
            <p role="status" className="text-xs text-neutral-400 mt-1">
              {!registered ? 'Your section position is kept only while this lesson is open.'
                : loading ? 'Loading your saved section position…'
                  : learning.persistenceStatus === 'session-only' ? 'Your section position is only kept for this visit.'
                    : learning.pendingLocalWrites > 0 ? 'Saving your section position…'
                      : savedPosition ? 'Your section position is saved in this browser.'
                        : 'Your section position will be saved as you move.'}
            </p>
            {legacyPosition && (
              <div className="mt-2 text-xs text-neutral-400">
                <p>A position from an older version of this lesson is available.</p>
                <button
                  type="button"
                  className="min-h-11 text-sm text-teal-300 underline underline-offset-4"
                  onClick={() => {
                    focusOnNavigate.current = true;
                    void learning.restoreLegacySectionResume(containerId, legacyPosition.sourceKey, { context: learning.writeContext }).then(result => {
                      if (!result?.applied) focusOnNavigate.current = false;
                    });
                  }}
                >Restore saved position</button>
              </div>
            )}
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
