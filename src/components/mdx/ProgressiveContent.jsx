"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import analytics, { Events } from '../../utils/analytics';
import { usePathname } from 'next/navigation';
import { LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { useLearningActivity } from '@/hooks/useLearningActivity';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ProgressiveContent Component
 * 
 * This component breaks educational content into sections and tracks user progress.
 * Registered lessons save completion and resume positions through the shared progress store.
 * 
 * IMPORTANT: Component Detection Pattern for Production Builds
 * ===========================================================
 * In production builds, React component names get minified (e.g., 'SectionBreak' becomes 'a').
 * This breaks any code that relies on component.type.name for detection.
 * 
 * Solution: We use static markers (_isSectionBreak, _isQuizBreak) attached to component functions.
 * These markers survive minification and provide reliable component detection.
 * 
 * Example:
 *   SectionBreak._isSectionBreak = true;
 *   QuizBreak._isQuizBreak = true;
 * 
 * Detection:
 *   if (child.type._isSectionBreak) { ... }  // ✅ Works in production
 *   if (child.type.name === 'SectionBreak') { ... }  // ❌ Breaks in production
 * 
 * This pattern ensures the component works correctly in both development and production builds.
 * 
 * Features:
 * - Splits content at <SectionBreak /> and <QuizBreak /> components
 * - Shows one section at a time with a progress bar
 * - Requires quiz completion before continuing (if section has a quiz)
 * - Automatically saves and restores progress
 * 
 * @example
 * // Basic usage in MDX
 * <ProgressiveContent>
 *   # Section 1
 *   Content for section 1...
 *   
 *   <SectionBreak />
 *   
 *   # Section 2  
 *   Content for section 2...
 *   <QuizBreak question="Test question" options={["A", "B"]} correct={0} />
 * </ProgressiveContent>
 * 
 * @example
 * // With custom analytics
 * <ProgressiveContent
 *   progressKey="progressive-content-/lesson-based-approach"
 *   onAnalytics={(event, data) => myAnalytics.track(event, data)}
 *   metadata={{ chapter: 1, topic: 'probability' }}
 * >
 *   {children}
 * </ProgressiveContent>
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - MDX content with SectionBreak markers
 * @param {string} [props.progressKey] - Unique key for saving progress (defaults to URL path)
 * @param {Function} [props.onAnalytics] - Custom analytics handler
 * @param {Object} [props.metadata] - Additional metadata for analytics
 */
const isQuiz = child => child?.type && (child.type._isQuizBreak || child.type.name === 'QuizBreak');
const isBreak = child => child?.type && (child.type._isSectionBreak || child.type.name === 'SectionBreak');

function TrackedQuiz({ child, index, completed, learning, source, onSessionComplete, onAnalytics, metadata }) {
  const [context] = useState(() => source ? learning.captureWriteContext(source.containerId) : null);
  const sent = useRef(false);
  return React.cloneElement(child, {
    onComplete: () => {
      if (completed || sent.current) return;
      sent.current = true;
      if (source) void learning.completeActivity(source.legacyPositions[index], { kind: 'knowledge-check-completed', sourceKey: 'progressive-lesson-correct-check', context });
      else onSessionComplete(index);
    },
    isCompleted: completed, onAnalytics,
    metadata: { ...metadata, sectionNumber: index + 1, progressiveContent: true },
  });
}

function ProgressiveReader({ sections, storageKey, source, learning, onAnalytics, metadata }) {
  const [sessionSection, setSessionSection] = useState(0);
  const [sessionCompletions, setSessionCompletions] = useState({});
  const sectionRefs = useRef({});
  const focusPosition = useRef(null);
  const loadedKey = useRef(null);
  const reducedMotion = useReducedMotion();
  const locator = source ? learning.resume : null;
  const stableIndex = /^position-(\d+)$/.exec(locator?.positionId || '');
  const savedIndex = stableIndex ? Number(stableIndex[1]) : Number.isInteger(locator?.legacyIndex) ? locator.legacyIndex : source?.legacyPositions.indexOf(locator?.activityId);
  const currentSection = source ? Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < sections.length ? savedIndex : 0 : sessionSection;
  const hasLoadedProgress = !source || !learning.loading;
  const trackEvent = useCallback((event, data) => onAnalytics ? onAnalytics(event, data) : analytics.track(event, data), [onAnalytics]);
  const quizCompleted = index => source ? learning.isCompleted(source.legacyPositions[index]) : sessionCompletions[`section-${index}`] === true;
  const hasQuiz = index => isQuiz(sections[index]?.at(-1));

  useEffect(() => {
    if (!hasLoadedProgress || !sections.length || loadedKey.current === storageKey) return;
    loadedKey.current = storageKey;
    trackEvent('progressive_content_loaded', { totalSections: sections.length, startingSection: currentSection, hasQuizzes: sections.some(section => isQuiz(section.at(-1))), progressKey: storageKey, ...metadata });
  }, [hasLoadedProgress, sections, storageKey, currentSection, trackEvent, metadata]);

  useEffect(() => {
    if (focusPosition.current !== currentSection || !sectionRefs.current[currentSection]) return;
    focusPosition.current = null;
    sectionRefs.current[currentSection].focus({ preventScroll: true });
    sectionRefs.current[currentSection].scrollIntoView?.({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }, [currentSection, reducedMotion]);

  const canContinue = !hasQuiz(currentSection) || quizCompleted(currentSection);
  const handleContinue = () => {
    if (!canContinue || currentSection >= sections.length - 1) return;
    trackEvent(Events.SECTION_COMPLETED, { sectionNumber: currentSection + 1, totalSections: sections.length, hadQuiz: hasQuiz(currentSection), progressKey: storageKey, ...metadata });
    const index = currentSection + 1;
    focusPosition.current = index;
    if (source) void learning.setResume(source.containerId, { activityId: source.legacyPositions[index], kind: 'section', legacyIndex: index, positionId: `position-${index}` }, { context: learning.writeContext });
    else setSessionSection(index);
  };

  if (!sections.length) return <p role="status">No sections are available.</p>;
  if (!hasLoadedProgress) return <p role="status">Loading your lesson progress…</p>;
  return (
    <div>
      {!source ? <p role="status" className="mb-4 text-sm text-amber-200">Progress for this lesson is available only in this session.</p> : learning.persistenceStatus === 'session-only' && <div role="status" className="mb-4 text-sm text-amber-200">
        <p>Your recent changes are only kept for this visit. Export a backup from Your progress before closing this page.</p>
        <button className="min-h-11 underline" onClick={() => learning.retryLocalPersistence()}>Try saving again</button>
      </div>}
      <div className="sticky top-0 bg-[#0F0F10]/95 backdrop-blur-sm border-b border-neutral-800 py-4 z-20 -mx-6 px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-neutral-400">Section {currentSection + 1} of {sections.length}</span></div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-12 mdx-content">
          {sections.slice(0, currentSection + 1).map((section, index) => (
            <div key={index} ref={element => { sectionRefs.current[index] = element; }} tabIndex={-1} aria-label={`Section ${index + 1} of ${sections.length}`} className={`scroll-mt-24 focus:outline-none ${index === currentSection ? 'animate-fadeIn' : ''}`}>
              {section.map((child, childIndex) => isQuiz(child) ?
                <TrackedQuiz key={`${index}-${childIndex}`} child={child} index={index} completed={quizCompleted(index)} learning={learning} source={source} onSessionComplete={position => setSessionCompletions(previous => ({ ...previous, [`section-${position}`]: true }))} onAnalytics={onAnalytics} metadata={metadata} /> :
                <React.Fragment key={`${index}-${childIndex}`}>{child}</React.Fragment>)}
              {source && source.legacyPositions[index] && !hasQuiz(index) && <div className="mt-4">
                <Button onClick={() => learning.completeActivity(source.legacyPositions[index], { sourceKey: 'progressive-lesson-explicit-study', context: learning.writeContext })} disabled={learning.isCompleted(source.legacyPositions[index])}>
                  {learning.isCompleted(source.legacyPositions[index]) ? '✓ Section studied' : 'Mark section as studied'}
                </Button>
              </div>}
              {index < currentSection && index < sections.length - 1 && <div className="mt-12 flex items-center justify-center"><div className="w-16 h-px bg-neutral-800" /></div>}
            </div>
          ))}
        </div>
        {currentSection < sections.length - 1 && <div className="mt-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1"><div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" /></div>
            <Button onClick={handleContinue} disabled={!canContinue} className={`mx-6 min-w-[160px] font-medium py-3 px-6 rounded-lg transition-all duration-200 ${canContinue ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}>
              {!canContinue ? 'Complete Quiz to Continue' : 'Continue →'}
            </Button>
            <div className="flex-1"><div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" /></div>
          </div>
        </div>}
        {currentSection === sections.length - 1 && <div className="mt-12 pb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] rounded-lg"><div className="bg-[#0F0F10] rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-xl font-semibold text-white mb-2">{source && learning.isCompleted(source.containerId) ? 'Lesson studied' : 'Final section'}</p>
            <p className="text-neutral-400">{source && learning.isCompleted(source.containerId) ? 'You have studied every section and completed its knowledge checks.' : 'Revisit the explanations and knowledge checks whenever you need them.'}</p>
          </div></div>
        </div>}
      </div>
    </div>
  );
}

export function ProgressiveContent({ children, progressKey, onAnalytics, metadata = {} }) {
  const pathname = usePathname();
  const storageKey = progressKey || `progressive-content-${pathname || '/'}`;
  const candidate = Object.hasOwn(LEGACY_SOURCE_BY_KEY, storageKey) ? LEGACY_SOURCE_BY_KEY[storageKey] : null;
  const sections = [];
  let content = [];
  React.Children.toArray(children).forEach(child => {
    if (isBreak(child)) { sections.push(content); content = []; }
    else if (isQuiz(child)) { content.push(child); sections.push(content); content = []; }
    else content.push(child);
  });
  if (content.length) sections.push(content);
  const source = candidate?.kind === 'progressive-content' && candidate.legacyPositions.length === sections.length && candidate.quizPositions.every(index => isQuiz(sections[index]?.at(-1))) && sections.every((section, index) => !isQuiz(section.at(-1)) || candidate.quizPositions.includes(index)) ? candidate : null;
  const learning = useLearningActivity(source?.containerId || null);
  const generation = source ? JSON.stringify([learning.getResetGeneration(source.containerId, learning.writeCheckpoint), ...source.legacyPositions.filter(Boolean).map(id => learning.getResetGeneration(id, learning.writeCheckpoint))]) : storageKey;
  return <ProgressiveReader key={`${storageKey}:${generation}`} sections={sections} storageKey={storageKey} source={source} learning={learning} onAnalytics={onAnalytics} metadata={metadata} />;
}

// Marker component to indicate section breaks in MDX
export function SectionBreak() {
  return null; // This component is just a marker
}

// Add static marker to SectionBreak for production build compatibility
// In production, component.type.name gets minified (e.g., becomes 'a' or 'b')
// Using a static property ensures reliable component detection
SectionBreak._isSectionBreak = true;
