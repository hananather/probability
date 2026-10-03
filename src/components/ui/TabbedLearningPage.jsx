"use client";

import React, { useState, useEffect, useId, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import BackToHub from '@/components/ui/BackToHub';

/**
 * Generic Tabbed Learning Page Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {number} props.chapter - Chapter number for BackToHub
 * @param {Array} props.tabs - Array of tab configurations
 * @param {string} props.storageKey - localStorage key for progress tracking
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

// Progress tracking hook
function useTabProgress(storageKey, tabIds) {
  const [completedTabs, setCompletedTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(tabIds[0] || '');
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadedKey, setLoadedKey] = useState(null);
  const tabSignature = JSON.stringify(tabIds);

  // Load from localStorage after hydration
  useEffect(() => {
    const validIds = JSON.parse(tabSignature);
    let completed = [];
    let active = validIds[0] || '';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) {
        completed = [...new Set(saved.filter(id => validIds.includes(id)))];
      }
      const savedActive = localStorage.getItem(`${storageKey}:active-tab`);
      if (validIds.includes(savedActive)) active = savedActive;
    } catch {
      // Lessons remain usable when saved data is corrupt or storage is unavailable.
    }
    setLoadedKey(storageKey);
    setCompletedTabs(completed);
    setActiveTab(active);
    setIsHydrated(true);
  }, [storageKey, tabSignature]);

  useEffect(() => {
    if (isHydrated && loadedKey === storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(completedTabs));
        localStorage.setItem(`${storageKey}:active-tab`, activeTab);
      } catch {
        // Keep this session's progress even when it cannot be persisted.
      }
    }
  }, [completedTabs, activeTab, storageKey, isHydrated, loadedKey]);

  const markTabComplete = (tabId) => {
    setCompletedTabs(prev => prev.includes(tabId) ? prev : [...prev, tabId]);
  };

  const resetProgress = () => {
    setCompletedTabs([]);
  };

  return { completedTabs, activeTab, setActiveTab, markTabComplete, resetProgress, isHydrated };
}

// Component wrapper to standardize interfaces
const ComponentWrapper = ({ component: Component, tabId, onComplete, isActive }) => {
  const handleComplete = () => {
    if (onComplete) {
      onComplete(tabId);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full">
      <Component onComplete={handleComplete} />
    </div>
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
  const { completedTabs, activeTab, setActiveTab, markTabComplete, isHydrated } = useTabProgress(storageKey, tabs.map(tab => tab.id));
  const navigationId = useId();
  const tabButtons = useRef([]);

  const handleTabKeyDown = (event, index) => {
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

  const handleTabComplete = (tabId) => {
    markTabComplete(tabId);
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

      {/* Tab Content */}
      <motion.div
        id={`${navigationId}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${navigationId}-tab-${activeTab}`}
        tabIndex={0}
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <Suspense fallback={<LoadingComponent />}>
          {tabs.map(tab => (
            <ComponentWrapper
              key={tab.id}
              component={tab.component}
              tabId={tab.id}
              onComplete={handleTabComplete}
              isActive={activeTab === tab.id}
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
