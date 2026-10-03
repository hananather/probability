"use client";

import React, { useState, useId, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import BackToHub from '@/components/ui/BackToHub';
import { ACTIVITY_BY_ID, LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { LearningActivityContext, useLearningActivity } from '@/hooks/useLearningActivity';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Generic Tabbed Learning Page Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {number} props.chapter - Chapter number for BackToHub
 * @param {Array} props.tabs - Array of tab configurations
 * @param {string} props.storageKey - Registered progress source key
 * @param {string} props.colorScheme - Color scheme name from design system
 * 
 * Tab configuration:
 * {
 *   id: string,
 *   label: string,
 *   icon: React component,
 *   description: string,
 *   component: React component or dynamic import,
 *   color: string (hex)
 * }
 */

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3 text-neutral-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading section...</span>
    </div>
  </div>
);

// A callback retains the context captured before this mounted child's work starts.
const ComponentWrapper = ({ component: Component, activityId, learning, onComplete }) => {
  const [capturedContext] = useState(() => activityId ? learning.captureWriteContext(activityId) : null);
  const context = {
    ...learning,
    containerId: activityId,
    writeContext: capturedContext,
    resume: activityId ? learning.getResume(activityId) : null,
    resetGeneration: learning.getResetGeneration(activityId, capturedContext),
    completeActivity: (id = activityId, options = {}) => learning.completeActivity(id, { ...options, context: capturedContext }),
    setResume: (id, locator, options = {}) => learning.setResume(id, locator, { ...options, context: capturedContext }),
    clearResume: (id = activityId, options = {}) => learning.clearResume(id, { ...options, context: capturedContext }),
    resetActivity: (id = activityId, options = {}) => learning.resetActivity(id, { ...options, context: capturedContext }),
  };
  return (
    <LearningActivityContext.Provider value={context}>
      <div className="w-full">
        <Component onComplete={() => onComplete(capturedContext)} />
      </div>
    </LearningActivityContext.Provider>
  );
};

export default function TabbedLearningPage({ 
  title, 
  subtitle, 
  chapter, 
  tabs, 
  storageKey,
  colorScheme = 'purple'
}) {
  const source = Object.hasOwn(LEGACY_SOURCE_BY_KEY, storageKey) ? LEGACY_SOURCE_BY_KEY[storageKey] : null;
  const registered = source?.kind === 'completion-array' && ACTIVITY_BY_ID[source.containerId]?.kind === 'lesson';
  const learning = useLearningActivity(registered ? source.containerId : null);
  const reducedMotion = useReducedMotion();
  const activityForTab = id => registered ? source.targetIds.find(activityId => ACTIVITY_BY_ID[activityId]?.legacyId === id) : null;
  const [selection, setSelection] = useState(null);
  const [sessionCompletion, setSessionCompletion] = useState({ key: storageKey, ids: [] });
  const selectionScope = `${storageKey}:${learning.resetGeneration}`;
  const restoredTab = registered && tabs.find(tab => activityForTab(tab.id) === learning.resume?.activityId)?.id;
  const activeTab = selection?.scope === selectionScope && tabs.some(tab => tab.id === selection.id)
    ? selection.id : restoredTab || tabs[0]?.id || '';
  const completedTabs = registered
    ? tabs.filter(tab => learning.isCompleted(activityForTab(tab.id))).map(tab => tab.id)
    : sessionCompletion.key === storageKey ? sessionCompletion.ids : [];
  const isHydrated = !registered || !learning.loading;
  const setActiveTab = id => {
    if (!tabs.some(tab => tab.id === id) || !isHydrated) return;
    setSelection({ scope: selectionScope, id });
    if (registered) {
      void learning.setResume(source.containerId, { activityId: activityForTab(id), kind: 'tab' }, { context: learning.writeContext })
        .finally(() => setSelection(previous => previous?.scope === selectionScope && previous.id === id ? null : previous));
    }
  };
  const navigationId = useId();
  const tabButtons = useRef([]);

  const handleTabKeyDown = (event, index) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    tabButtons.current[nextIndex]?.focus();
  };

  const handleTabComplete = (tabId, context) => {
    if (registered) {
      void learning.completeActivity(activityForTab(tabId), { context });
    } else {
      setSessionCompletion(previous => ({ key: storageKey, ids: [...new Set([...(previous.key === storageKey ? previous.ids : []), tabId])] }));
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Calculate overall progress
  const progressPercentage = tabs.length ? Math.round((completedTabs.length / tabs.length) * 100) : 0;

  return (
    <VisualizationContainer>
      <BackToHub chapter={chapter} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-neutral-400">{subtitle}</p>
      </div>

      {/* Tab Navigation */}
      <VisualizationSection className="bg-neutral-800/30 rounded-lg mb-6">
        <div className="border-b border-neutral-700">
          <div role="tablist" aria-label={`${title} sections`} className="flex space-x-1 px-6 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, color }, index) => (
              <button
                key={id}
                ref={element => { tabButtons.current[index] = element; }}
                id={`${navigationId}-tab-${id}`}
                role="tab"
                disabled={!isHydrated}
                aria-selected={activeTab === id}
                aria-controls={`${navigationId}-panel-${id}`}
                tabIndex={activeTab === id ? 0 : -1}
                onClick={() => setActiveTab(id)}
                onKeyDown={event => handleTabKeyDown(event, index)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap",
                  activeTab === id
                    ? 'bg-neutral-700 text-white border-b-2'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                )}
                style={{
                  borderBottomColor: activeTab === id ? color : 'transparent'
                }}
              >
                <Icon className="w-4 h-4" style={{ color: activeTab === id ? color : 'currentColor' }} />
                <span>{label}</span>
                {isHydrated && completedTabs.includes(id) && (
                  <>
                    <div aria-hidden="true" className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                    <span className="sr-only">Completed</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Active tab description */}
        {activeTabData && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${activeTabData.color}20` }}
              >
                <activeTabData.icon 
                  className="w-5 h-5" 
                  style={{ color: activeTabData.color }} 
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">{activeTabData.label}</h3>
                <p className="text-sm text-neutral-400">{activeTabData.description}</p>
              </div>
            </div>
          </div>
        )}
      </VisualizationSection>

      {!registered ? (
        <p role="status" className="mb-4 text-sm text-amber-200">Progress for this lesson is available only in this session.</p>
      ) : learning.persistenceStatus === 'session-only' ? (
        <div className="mb-4 text-sm text-amber-200" role="status">
          <p>Your recent changes are only kept for this visit. Export a backup from Your progress before closing this page.</p>
          <button type="button" className="mt-2 min-h-11 underline underline-offset-4" onClick={() => learning.retryLocalPersistence()}>Try saving again</button>
        </div>
      ) : null}

      {/* Tab Content */}
      <motion.div
        id={`${navigationId}-panel-${activeTab}`}
        role="tabpanel"
        aria-busy={!isHydrated}
        aria-labelledby={`${navigationId}-tab-${activeTab}`}
        tabIndex={0}
        key={`${activeTab}:${learning.getResetGeneration(activityForTab(activeTab), learning.writeContext)}:${storageKey}`}
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <Suspense fallback={<LoadingComponent />}>
          {!isHydrated ? <LoadingComponent /> : tabs.filter(tab => tab.id === activeTab).map(tab => (
            <ComponentWrapper
              key={tab.id}
              component={tab.component}
              activityId={activityForTab(tab.id)}
              learning={learning}
              onComplete={context => handleTabComplete(tab.id, context)}
            />
          ))}
        </Suspense>
      </motion.div>
      {tabs.filter(tab => tab.id !== activeTab).map(tab => (
        <div
          key={tab.id}
          id={`${navigationId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${navigationId}-tab-${tab.id}`}
          hidden
        />
      ))}

      {/* Progress indicator - only show after hydration */}
      {isHydrated && (
        <div className="fixed bottom-6 right-6 bg-neutral-800 rounded-lg p-3 shadow-lg border border-neutral-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-400">Progress:</span>
            <span className="font-semibold text-white">
              {completedTabs.length}/{tabs.length} ({progressPercentage}%)
            </span>
            <div className="flex gap-1 ml-2">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    completedTabs.includes(tab.id) 
                      ? 'bg-green-500' 
                      : activeTab === tab.id 
                        ? 'bg-blue-500' 
                        : 'bg-neutral-600'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </VisualizationContainer>
  );
}
