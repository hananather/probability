"use client";
import React, { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { 
  VisualizationContainer,
  VisualizationSection
} from '@/components/ui/VisualizationContainer';
import BackToHub from '@/components/ui/BackToHub';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calculator, 
  Layers, 
  Zap, 
  TrendingUp,
  Loader2 
} from 'lucide-react';

// Dynamic imports for all components with updated file names
const SamplingDistributionsInteractive = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-1-SamplingDistributionsInteractive'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const SamplingDistributionsTheory = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-SamplingDistributionsTheory'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const CLTGateway = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-3-CLTGateway'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const CLTProperties = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-4-CLTProperties'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const SamplingDistributionsVisual = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-5-SamplingDistributionsVisual'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
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

// Tab configuration with clean sequential numbering (4-3-1 through 4-3-5)
const TABS = [
  {
    id: '4-3-1-interactive',
    label: 'Interactive Discovery',
    icon: Sparkles,
    description: 'Hands-on exploration with dice sampling',
    component: SamplingDistributionsInteractive,
    color: '#10b981'
  },
  {
    id: '4-3-2-theory',
    label: 'Theory Foundations',
    icon: Calculator,
    description: 'Mathematical theory of sampling distributions',
    component: SamplingDistributionsTheory,
    color: '#3b82f6'
  },
  {
    id: '4-3-3-clt-gateway',
    label: 'CLT Gateway',
    icon: Layers,
    description: 'Bridge to Central Limit Theorem',
    component: CLTGateway,
    color: '#6366f1'
  },
  {
    id: '4-3-4-clt-properties',
    label: 'CLT Properties',
    icon: Zap,
    description: 'Sample size effects and transformations',
    component: CLTProperties,
    color: '#7c3aed'
  },
  {
    id: '4-3-5-visual-master',
    label: 'CLT Mastery',
    icon: TrendingUp,
    description: 'Advanced CLT exploration and applications',
    component: SamplingDistributionsVisual,
    color: '#8b5cf6'
  }
];

// Progress tracking
function useTabProgress() {
  const [completedTabs, setCompletedTabs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sampling-distributions-tab-progress');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sampling-distributions-tab-progress', JSON.stringify(completedTabs));
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
    // Section completion tracking - removed debug console.log
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
export default function SamplingDistributionsPage() {
  const [activeTab, setActiveTab] = useState('4-3-1-interactive');
  const { completedTabs, markTabComplete } = useTabProgress();

  const handleTabComplete = (tabId) => {
    markTabComplete(tabId);
  };

  const activeTabData = TABS.find(tab => tab.id === activeTab);

  return (
    <VisualizationContainer>
      <BackToHub chapter={4} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sampling Distributions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover how sample statistics behave when we repeatedly sample from a population
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