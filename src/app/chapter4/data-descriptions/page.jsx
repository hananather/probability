"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createColorScheme, typography } from "@/lib/design-system";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, BarChart3, Calculator, Target, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic imports for all components with updated file names
const CentralTendencyIntro = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyIntro'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const DescriptiveStatsJourney = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-2-DescriptiveStatsJourney'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const DescriptiveStatisticsFoundations = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-3-DescriptiveStatisticsFoundations'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const MathematicalFoundations = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-4-MathematicalFoundations'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

// Default dataset for consistency across components
const defaultDataset = [65, 72, 68, 74, 81, 69, 73, 70, 75, 78, 82, 71, 66, 77, 79];

// Stage configuration
const stages = [
  { id: 'introduction', name: 'Introduction', icon: '📊', duration: '5 min' },
  { id: 'journey', name: 'Interactive Journey', icon: '🎯', duration: '15 min' },
  { id: 'foundations', name: 'Statistical Foundations', icon: '📈', duration: '10 min' },
  { id: 'mathematical', name: 'Mathematical Depth', icon: '∑', duration: '10 min' },
  { id: 'practice', name: 'Practice & Apply', icon: '✍️', duration: '10 min' }
];

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Back to Hub navigation
const BackToHub = () => (
  <Link href="/chapter4" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4">
    <ArrowLeft className="w-4 h-4" />
    <span>Back to Chapter 4 Hub</span>
  </Link>
);

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3 text-neutral-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading section...</span>
    </div>
  </div>
);

// Tab configuration with clean sequential numbering (4-1-1 through 4-1-4)
const TABS = [
  {
    id: '4-1-1-intro',
    label: 'Introduction',
    icon: BarChart3,
    description: 'Getting started with central tendency concepts',
    component: CentralTendencyIntro,
    color: '#10b981'
  },
  {
    id: '4-1-2-journey',
    label: 'Interactive Journey',
    icon: Target,
    description: 'Hands-on exploration of mean, median, mode',
    component: DescriptiveStatsJourney,
    color: '#3b82f6'
  },
  {
    id: '4-1-3-foundations',
    label: 'Statistical Foundations',
    icon: BookOpen,
    description: 'Deep dive into statistical concepts',
    component: DescriptiveStatisticsFoundations,
    color: '#6366f1'
  },
  {
    id: '4-1-4-mathematical',
    label: 'Mathematical Depth',
    icon: Calculator,
    description: 'Advanced mathematical understanding',
    component: MathematicalFoundations,
    color: '#7c3aed'
  }
];

// Progress tracking
function useTabProgress() {
  const [completedTabs, setCompletedTabs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('central-tendency-tab-progress');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('central-tendency-tab-progress', JSON.stringify(completedTabs));
    }
  }, [completedTabs]);

  const markTabComplete = (tabId) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs(prev => [...prev, tabId]);
    }
  };

  return { completedTabs, markTabComplete };
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

// Main Page Component
export default function DataDescriptionsPage() {
  const [activeTab, setActiveTab] = useState('4-1-1-intro');
  const { completedTabs, markTabComplete } = useTabProgress();

  const handleTabComplete = (tabId) => {
    markTabComplete(tabId);
  };

  const activeTabData = TABS.find(tab => tab.id === activeTab);

  return (
    <VisualizationContainer>
      <BackToHub />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Central Tendency & Data Descriptions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore measures of central tendency: mean, median, and mode
        </p>
      </div>

      {/* Tab Navigation */}
      <VisualizationSection className="bg-neutral-800/30 rounded-lg mb-6">
        <div className="border-b border-neutral-700">
          <div className="flex space-x-1 px-6 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon, description, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-neutral-700 text-white border-b-2'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
                style={{
                  borderBottomColor: activeTab === id ? color : 'transparent'
                }}
              >
                <Icon className="w-4 h-4" style={{ color: activeTab === id ? color : 'currentColor' }} />
                <span>{label}</span>
                {completedTabs.includes(id) && (
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
          {TABS.map(tab => (
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

      {/* Progress indicator */}
      <div className="fixed bottom-6 right-6 bg-neutral-800 rounded-lg p-3 shadow-lg border border-neutral-700">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">Progress:</span>
          <span className="font-semibold text-white">
            {completedTabs.length}/{TABS.length}
          </span>
          <div className="flex gap-1 ml-2">
            {TABS.map(tab => (
              <div
                key={tab.id}
                className={`w-2 h-2 rounded-full ${
                  completedTabs.includes(tab.id) 
                    ? 'bg-green-500' 
                    : activeTab === tab.id 
                      ? 'bg-blue-500' 
                      : 'bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

// Stage Components
const IntroductionStage = ({ globalState, onComplete }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  return (
    <motion.div
      key="introduction"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          Welcome to Descriptive Statistics
        </h2>
        <p className={cn(typography.body, "mb-4 text-gray-300")}>
          Descriptive statistics help us understand and summarize data. In this section, 
          you'll explore measures of central tendency, spread, and distribution shape 
          through hands-on interactions.
        </p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CentralTendencyIntro 
          onInteraction={() => setHasInteracted(true)}
        />
      </Suspense>
      
      {hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          >
            Start Learning Journey
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const JourneyStage = ({ globalState, updateGlobalState, onComplete }) => {
  const [journeyComplete, setJourneyComplete] = useState(false);
  
  const handleJourneyUpdate = (updates) => {
    // Update global state with journey progress
    if (updates.calculations) {
      updateGlobalState({
        calculations: {
          ...globalState.calculations,
          ...updates.calculations
        }
      });
    }
    
    if (updates.conceptsMastered) {
      updateGlobalState({
        userProgress: {
          ...globalState.userProgress,
          conceptsMastered: updates.conceptsMastered
        }
      });
    }
    
    // Check if journey is complete
    if (updates.isComplete) {
      setJourneyComplete(true);
    }
  };
  
  return (
    <motion.div
      key="journey"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DescriptiveStatsJourney 
          initialDataset={globalState.dataset.values}
          onUpdate={handleJourneyUpdate}
        />
      </Suspense>
      
      {journeyComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue to Foundations
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const FoundationsStage = ({ globalState, updateGlobalState, onComplete }) => {
  const [foundationsComplete, setFoundationsComplete] = useState(false);
  
  return (
    <motion.div
      key="foundations"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DescriptiveStatisticsFoundations 
          dataset={globalState.dataset.values}
          previousCalculations={globalState.calculations}
          onComplete={() => setFoundationsComplete(true)}
        />
      </Suspense>
      
      {foundationsComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Explore Mathematical Foundations
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const MathematicalStage = ({ globalState, onComplete }) => {
  const [mathComplete, setMathComplete] = useState(false);
  
  return (
    <motion.div
      key="mathematical"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <MathematicalFoundations 
          dataset={globalState.dataset.values}
          calculations={globalState.calculations}
          onComplete={() => setMathComplete(true)}
        />
      </Suspense>
      
      {mathComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end mt-6"
        >
          <Button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Practice Your Skills
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const PracticeStage = ({ globalState, updateGlobalState }) => {
  const colors = createColorScheme('estimation');
  
  return (
    <motion.div
      key="practice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          Practice & Apply Your Knowledge
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Summary of learned concepts */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-purple-300">Concepts Mastered</h3>
            <div className="space-y-2">
              {globalState.userProgress.conceptsMastered.map((concept, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 capitalize">{concept}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key calculations summary */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-purple-300">Your Dataset Summary</h3>
            <div className="space-y-2 font-mono text-sm">
              {globalState.calculations.mean !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Mean:</span>
                  <span className="text-gray-200">{globalState.calculations.mean.toFixed(2)}</span>
                </div>
              )}
              {globalState.calculations.median !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Median:</span>
                  <span className="text-gray-200">{globalState.calculations.median.toFixed(2)}</span>
                </div>
              )}
              {globalState.calculations.stdDev !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard Deviation:</span>
                  <span className="text-gray-200">{globalState.calculations.stdDev.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
          <p className="text-purple-300">
            🎉 Congratulations! You've completed the Data Descriptions learning journey. 
            You now understand the fundamental measures used to summarize and describe data.
          </p>
        </div>
      </div>
    </motion.div>
  );
};