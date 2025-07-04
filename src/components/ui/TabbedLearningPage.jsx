"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createColorScheme } from "@/lib/design-system";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
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
function useTabProgress(storageKey) {
  const [completedTabs, setCompletedTabs] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedTabs(JSON.parse(saved));
      }
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(completedTabs));
    }
  }, [completedTabs, storageKey, isHydrated]);

  const markTabComplete = (tabId) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs(prev => [...prev, tabId]);
    }
  };

  const resetProgress = () => {
    setCompletedTabs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  return { completedTabs, markTabComplete, resetProgress, isHydrated };
}

// Component wrapper to standardize interfaces
const ComponentWrapper = ({ component: Component, tabId, onComplete, isActive }) => {
  const handleComplete = () => {
    console.log(`${tabId} section completed!`);
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
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const { completedTabs, markTabComplete, resetProgress, isHydrated } = useTabProgress(storageKey);
  const colors = createColorScheme(colorScheme);

  const handleTabComplete = (tabId) => {
    markTabComplete(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Calculate overall progress
  const progressPercentage = Math.round((completedTabs.length / tabs.length) * 100);

  return (
    <VisualizationContainer>
      <BackToHub chapter={chapter} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Tab Navigation */}
      <VisualizationSection className="bg-neutral-800/30 rounded-lg mb-6">
        <div className="border-b border-neutral-700">
          <div className="flex space-x-1 px-6 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, description, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap",
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
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
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