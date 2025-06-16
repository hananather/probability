"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import analytics, { Events } from '../../utils/analytics';

/**
 * ProgressiveContent Component
 * 
 * This component breaks educational content into sections and tracks user progress.
 * It saves progress to localStorage so users can continue where they left off.
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
 *   progressKey="chapter-1"
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
export function ProgressiveContent({ children, progressKey, onAnalytics, metadata = {} }) {
  // Generate a unique key for this content based on the URL path
  // This ensures different pages have separate progress tracking
  // We use a state to avoid SSR issues with window object
  const [storageKey, setStorageKey] = useState(progressKey || 'progressive-content-default');
  
  // State for tracking which section the user is currently viewing
  // Starts at 0 (first section)
  const [currentSection, setCurrentSection] = useState(0);
  
  // State for tracking which quizzes have been completed
  // Format: { 'section-0': true, 'section-2': false, ... }
  const [quizCompletions, setQuizCompletions] = useState({});
  
  // State to track if we've loaded saved progress from localStorage
  // This prevents overwriting progress on initial render
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  
  // Refs to track section elements for scrolling
  const sectionRefs = useRef({});
  
  // Track analytics
  const trackEvent = onAnalytics || ((event, data) => analytics.track(event, data));
  
  /**
   * Set the proper storage key after component mounts
   * This avoids SSR issues with accessing window object
   */
  useEffect(() => {
    if (!progressKey && typeof window !== 'undefined') {
      setStorageKey(`progressive-content-${window.location.pathname}`);
    }
  }, [progressKey]);
  
  /**
   * Load saved progress from localStorage when component mounts
   * This runs only once when the component first renders
   */
  useEffect(() => {
    try {
      // Check if localStorage is available (it might not be in some environments)
      if (typeof window !== 'undefined' && window.localStorage) {
        // Get the saved progress data from localStorage
        const savedProgress = localStorage.getItem(storageKey);
        
        if (savedProgress) {
          // Parse the JSON string back into an object
          const progressData = JSON.parse(savedProgress);
          
          // Validate the data structure to ensure it's what we expect
          if (progressData && typeof progressData.currentSection === 'number') {
            setCurrentSection(progressData.currentSection);
          }
          
          if (progressData && progressData.quizCompletions) {
            setQuizCompletions(progressData.quizCompletions);
          }
          
          console.log(`Progress restored for ${storageKey}:`, progressData);
        }
      }
    } catch (error) {
      // If there's any error loading progress (corrupted data, etc.), 
      // we'll just start fresh rather than crashing
      console.warn('Failed to load progress from localStorage:', error);
    }
    
    // Mark that we've attempted to load progress
    setHasLoadedProgress(true);
  }, [storageKey]); // Only run when storageKey changes
  
  /**
   * Save progress to localStorage whenever it changes
   * This ensures users don't lose their progress if they leave the page
   */
  useEffect(() => {
    // Don't save until we've loaded any existing progress
    // This prevents overwriting saved progress with initial state
    if (!hasLoadedProgress) return;
    
    try {
      // Check if localStorage is available
      if (typeof window !== 'undefined' && window.localStorage) {
        // Create an object with all progress data
        const progressData = {
          currentSection,
          quizCompletions,
          lastUpdated: new Date().toISOString() // Track when progress was saved
        };
        
        // Convert to JSON and save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(progressData));
        
        console.log(`Progress saved for ${storageKey}:`, progressData);
      }
    } catch (error) {
      // localStorage might be full or disabled
      // We'll continue without saving but warn in console
      console.warn('Failed to save progress to localStorage:', error);
    }
  }, [currentSection, quizCompletions, storageKey, hasLoadedProgress]);
  
  // Convert children to array and split by SectionBreak components
  const childArray = React.Children.toArray(children);
  const sections = [];
  let currentSectionContent = [];
  
  /**
   * Process children to split content into sections
   * We look for SectionBreak and QuizBreak components as dividers
   */
  childArray.forEach((child) => {
    // Check if this child is a SectionBreak component
    // We check both the name (for development) and static marker (for production)
    const isSectionBreak = child.type && 
      (child.type.name === 'SectionBreak' || child.type._isSectionBreak);
    
    // Check if this child is a QuizBreak component
    const isQuizBreak = child.type && 
      (child.type.name === 'QuizBreak' || child.type._isQuizBreak);
    
    if (isSectionBreak) {
      // End the current section and start a new one
      sections.push(currentSectionContent);
      currentSectionContent = [];
    } else if (isQuizBreak) {
      // QuizBreak components are special - they end a section but are included in it
      // This ensures quizzes appear at the end of their section
      currentSectionContent.push(child);
      sections.push(currentSectionContent);
      currentSectionContent = [];
    } else {
      // Regular content - add to current section
      currentSectionContent.push(child);
    }
  });
  
  // Don't forget the last section
  if (currentSectionContent.length > 0) {
    sections.push(currentSectionContent);
  }
  
  // Track component load when sections are ready
  useEffect(() => {
    if (sections.length > 0 && hasLoadedProgress) {
      trackEvent('progressive_content_loaded', {
        totalSections: sections.length,
        startingSection: currentSection,
        hasQuizzes: sections.some(section => {
          const lastElement = section[section.length - 1];
          return lastElement?.type && 
            (lastElement.type.name === 'QuizBreak' || lastElement.type._isQuizBreak);
        }),
        progressKey: storageKey,
        ...metadata
      });
    }
  }, [hasLoadedProgress]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Helper function: Check if current section ends with a quiz
   * @returns {boolean} true if the section has a quiz at the end
   */
  const currentSectionHasQuiz = () => {
    const section = sections[currentSection];
    if (!section || section.length === 0) return false;
    
    // Check if the last element is a QuizBreak
    const lastElement = section[section.length - 1];
    // Check both name (development) and static marker (production)
    return lastElement?.type && 
      (lastElement.type.name === 'QuizBreak' || lastElement.type._isQuizBreak === true);
  };
  
  /**
   * Helper function: Check if the quiz in the current section is completed
   * @returns {boolean} true if the quiz has been completed
   */
  const isCurrentQuizCompleted = () => {
    // Quiz completions are stored with keys like 'section-0', 'section-1', etc.
    return quizCompletions[`section-${currentSection}`] === true;
  };
  
  /**
   * Handle quiz completion callback
   * Called when a user successfully completes a quiz
   * @param {number} sectionIndex - The index of the section containing the quiz
   */
  const handleQuizComplete = useCallback((sectionIndex) => {
    setQuizCompletions(prev => ({
      ...prev,
      [`section-${sectionIndex}`]: true
    }));
  }, []);
  
  /**
   * Handle continue button click
   * Advances to the next section
   */
  const handleContinue = () => {
    if (currentSection < sections.length - 1) {
      // Track section completion
      trackEvent(Events.SECTION_COMPLETED, {
        sectionNumber: currentSection + 1,
        totalSections: sections.length,
        hadQuiz: currentSectionHasQuiz(),
        progressKey: storageKey,
        ...metadata
      });
      
      setCurrentSection(currentSection + 1);
      
      // Scroll to the new section instead of top
      if (typeof window !== 'undefined') {
        // Small delay to ensure the new section is rendered
        setTimeout(() => {
          if (sectionRefs.current[currentSection + 1]) {
            const headerHeight = 80; // Height of sticky header
            const element = sectionRefs.current[currentSection + 1];
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  };
  
  // Determine if user can continue to next section
  // They can continue if:
  // 1. Current section has no quiz, OR
  // 2. Current section has a quiz AND it's completed
  const canContinue = !currentSectionHasQuiz() || isCurrentQuizCompleted();
  
  /**
   * Reset progress function (optional - can be exposed via ref if needed)
   * Clears all progress and starts from the beginning
   */
  const resetProgress = () => {
    setCurrentSection(0);
    setQuizCompletions({});
    // Also clear from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(storageKey);
        console.log(`Progress reset for ${storageKey}`);
      }
    } catch (error) {
      console.warn('Failed to clear progress from localStorage:', error);
    }
  };
  
  return (
    <div>
      {/* Progress Bar - Full width sticky header */}
      <div className="sticky top-0 bg-[#0F0F10]/95 backdrop-blur-sm border-b border-neutral-800 py-4 z-20 -mx-6 px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-400">Section {currentSection + 1} of {sections.length}</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Rendered Sections */}
        <div className="space-y-12 mdx-content">
          {sections.slice(0, currentSection + 1).map((section, index) => (
            <div 
              key={index}
              ref={el => sectionRefs.current[index] = el}
              className={`${index === currentSection ? 'animate-fadeIn' : ''}`}
            >
              {/* Render section content, enhancing QuizBreak with completion handler */}
              {section.map((child, childIndex) => {
                // Check if this is a QuizBreak component
                const isQuizBreak = child?.type && 
                  (child.type.name === 'QuizBreak' || child.type._isQuizBreak);
                
                if (isQuizBreak) {
                  // Clone the quiz component with additional props for tracking
                  return React.cloneElement(child, {
                    key: `${index}-${childIndex}`,
                    onComplete: () => handleQuizComplete(index),
                    isCompleted: quizCompletions[`section-${index}`] || false,
                    onAnalytics,
                    metadata: {
                      ...metadata,
                      sectionNumber: index + 1,
                      progressiveContent: true
                    }
                  });
                }
                return <React.Fragment key={`${index}-${childIndex}`}>{child}</React.Fragment>;
              })}
              {/* Section divider */}
              {index < currentSection && index < sections.length - 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <div className="w-16 h-px bg-neutral-800"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      
        {/* Continue Button - Aligned with content */}
        {currentSection < sections.length - 1 && (
          <div className="mt-12 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
              </div>
              <Button 
                onClick={handleContinue}
                disabled={!canContinue}
                className={`mx-6 min-w-[160px] font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                  canContinue 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/20' 
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {!canContinue ? 'Complete Quiz to Continue' : 'Continue →'}
              </Button>
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
              </div>
            </div>
          </div>
        )}
      
        {/* Completion Message */}
        {currentSection === sections.length - 1 && (
          <div className="mt-12 pb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] rounded-lg">
              <div className="bg-[#0F0F10] rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-xl font-semibold text-white mb-2">
                  Section Complete!
                </p>
                <p className="text-neutral-400">
                  Great job! You've completed this section.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Marker component to indicate section breaks in MDX
export function SectionBreak() {
  return null; // This component is just a marker
}

// Add static marker to SectionBreak for production build compatibility
// In production, component.type.name gets minified (e.g., becomes 'a' or 'b')
// Using a static property ensures reliable component detection
SectionBreak._isSectionBreak = true;