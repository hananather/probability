"use client";

import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from "react";
import { VisualizationContainer, VisualizationSection } from "@/components/ui/VisualizationContainer";
import { Button } from "@/components/ui/button";
import BackToHub from "@/components/ui/BackToHub";
import { ChevronLeft, BarChart3, Box, Sparkles, Grid3X3, ChevronRight, Target, Activity, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createColorScheme } from "@/lib/design-system";
import dynamic from 'next/dynamic';

// Color scheme for this section
const colorScheme = createColorScheme('probability');

// Lazy load components for performance
const HistogramHub = lazy(() => import("@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-0-HistogramHub"));
const HistogramIntuitiveIntro = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-1-HistogramIntuitiveIntro'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);
const HistogramShapeExplorer = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-1-HistogramShapeExplorer'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);
const HistogramInteractiveJourney = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-2-HistogramInteractiveJourney'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);
const HistogramShapeAnalysis = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-3-HistogramShapeAnalysis'),
  {
    loading: () => <LoadingComponent />,
    ssr: false
  }
);

const BoxplotQuartilesExplorer = lazy(() => import("@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-4-BoxplotQuartilesExplorer"));
const BoxplotQuartilesJourney = lazy(() => import("@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-5-BoxplotQuartilesJourney"));
const BoxplotRealWorldExplorer = lazy(() => import("@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-6-BoxplotRealWorldExplorer"));

// Default dataset
const defaultDataset = {
  studentGrades: [
    85, 78, 92, 88, 76, 95, 83, 79, 87, 91,
    84, 89, 77, 93, 86, 80, 82, 90, 81, 94,
    75, 88, 85, 79, 83, 87, 92, 78, 86, 90
  ],
  testScores: [
    72, 85, 91, 78, 88, 92, 75, 83, 89, 94,
    77, 86, 90, 82, 87, 93, 79, 84, 88, 91
  ]
};

// Animation variants for smooth transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" }
};

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3 text-neutral-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading section...</span>
    </div>
  </div>
);

// Tab configuration with clean sequential numbering (4-2-1 through 4-2-4)
const TABS = [
  {
    id: '4-2-1-intro',
    label: 'Intuitive Introduction',
    icon: BarChart3,
    description: 'Getting started with histogram fundamentals',
    component: HistogramIntuitiveIntro,
    color: '#10b981'
  },
  {
    id: '4-2-2-journey',
    label: 'Interactive Journey',
    icon: Target,
    description: 'Hands-on histogram exploration and creation',
    component: HistogramInteractiveJourney,
    color: '#3b82f6'
  },
  {
    id: '4-2-3-shapes',
    label: 'Shape Analysis',
    icon: Activity,
    description: 'Understanding distribution shapes and patterns',
    component: HistogramShapeAnalysis,
    color: '#6366f1'
  },
  {
    id: '4-2-4-explorer',
    label: 'Advanced Explorer',
    icon: TrendingUp,
    description: 'Advanced histogram analysis and comparison',
    component: HistogramShapeExplorer,
    color: '#7c3aed'
  }
];

// Progress tracking
function useTabProgress() {
  const [completedTabs, setCompletedTabs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('histograms-tab-progress');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('histograms-tab-progress', JSON.stringify(completedTabs));
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

// Mode selector component
const ModeSelector = ({ currentMode, onModeChange, completedModes = [] }) => {
  const modes = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'histograms', label: 'Histograms', icon: BarChart3 },
    { id: 'boxplots', label: 'Boxplots', icon: Box },
    { id: 'comparison', label: 'Compare', icon: Grid3X3 }
  ];

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {modes.map(mode => (
        <Button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          variant={currentMode === mode.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-2",
            completedModes.includes(mode.id) && "border-green-600"
          )}
        >
          <mode.icon className="w-4 h-4" />
          {mode.label}
          {completedModes.includes(mode.id) && " ✓"}
        </Button>
      ))}
    </div>
  );
};

// Unified controls component
const UnifiedControls = ({ settings, onSettingsChange, availableControls }) => {
  return (
    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <h4 className="text-sm font-semibold mb-3 text-gray-300">Visualization Settings</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableControls.includes('binCount') && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Number of Bins</label>
            <input
              type="range"
              min="5"
              max="20"
              value={settings.binCount}
              onChange={(e) => onSettingsChange({ ...settings, binCount: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{settings.binCount} bins</span>
          </div>
        )}
        {availableControls.includes('showOutliers') && (
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={settings.showOutliers}
                onChange={(e) => onSettingsChange({ ...settings, showOutliers: e.target.checked })}
                className="rounded"
              />
              Show Outliers
            </label>
          </div>
        )}
        {availableControls.includes('dataset') && (
          <div>
            <label className="text-xs text-gray-400 block mb-1">Dataset</label>
            <select
              value={settings.datasetName}
              onChange={(e) => onSettingsChange({ ...settings, datasetName: e.target.value })}
              className="w-full px-2 py-1 bg-gray-700 text-gray-300 rounded border border-gray-600"
            >
              <option value="studentGrades">Student Grades</option>
              <option value="testScores">Test Scores</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// Overview mode component with vibrant animations
const OverviewMode = ({ onSelectMode, dataset }) => {
  return (
    <motion.div 
      className="grid md:grid-cols-2 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <motion.div 
        className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-600/30 cursor-pointer group"
        whileHover={cardHover}
        onClick={() => onSelectMode('histograms')}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
          }
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-300">Histograms</h3>
        </div>
        <p className="text-gray-300 mb-4">
          Reveal distribution shapes and patterns through binned frequency visualization
        </p>
        <div className="bg-gray-800/50 rounded p-3 mb-4 group-hover:bg-gray-800/70 transition-colors duration-300">
          <svg width="100%" height="80" viewBox="0 0 200 80">
            {/* Animated histogram preview */}
            <motion.rect x="20" y="50" width="20" height="30" fill={colorScheme.chart.primary} opacity="0.8" 
              initial={{ height: 0, y: 80 }}
              animate={{ height: 30, y: 50 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            <motion.rect x="45" y="30" width="20" height="50" fill={colorScheme.chart.primary} opacity="0.8"
              initial={{ height: 0, y: 80 }}
              animate={{ height: 50, y: 30 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            <motion.rect x="70" y="20" width="20" height="60" fill={colorScheme.chart.primary} opacity="0.8"
              initial={{ height: 0, y: 80 }}
              animate={{ height: 60, y: 20 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
            <motion.rect x="95" y="25" width="20" height="55" fill={colorScheme.chart.primary} opacity="0.8"
              initial={{ height: 0, y: 80 }}
              animate={{ height: 55, y: 25 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
            <motion.rect x="120" y="35" width="20" height="45" fill={colorScheme.chart.primary} opacity="0.8"
              initial={{ height: 0, y: 80 }}
              animate={{ height: 45, y: 35 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            />
            <motion.rect x="145" y="45" width="20" height="35" fill={colorScheme.chart.primary} opacity="0.8"
              initial={{ height: 0, y: 80 }}
              animate={{ height: 35, y: 45 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            />
          </svg>
        </div>
        <Button variant="outline" className="w-full group-hover:bg-blue-600/10 transition-colors duration-300">
          Explore Histograms →
        </Button>
      </motion.div>
      
      <motion.div 
        className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg border border-purple-600/30 cursor-pointer group"
        whileHover={cardHover}
        onClick={() => onSelectMode('boxplots')}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.1 }
          }
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Box className="w-8 h-8 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-300">Boxplots</h3>
        </div>
        <p className="text-gray-300 mb-4">
          Compare groups and spot outliers with five-number summary visualization
        </p>
        <div className="bg-gray-800/50 rounded p-3 mb-4 group-hover:bg-gray-800/70 transition-colors duration-300">
          <svg width="100%" height="80" viewBox="0 0 200 80">
            {/* Animated boxplot preview */}
            <motion.line x1="50" y1="40" x2="150" y2="40" stroke={colorScheme.chart.secondary} strokeWidth="2" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
            <motion.rect x="70" y="25" width="60" height="30" fill={colorScheme.chart.secondary} opacity="0.3" stroke={colorScheme.chart.secondary} strokeWidth="2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            />
            <motion.line x1="100" y1="25" x2="100" y2="55" stroke={colorScheme.chart.secondary} strokeWidth="2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            />
            <motion.line x1="50" y1="30" x2="50" y2="50" stroke={colorScheme.chart.secondary} strokeWidth="2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            />
            <motion.line x1="150" y1="30" x2="150" y2="50" stroke={colorScheme.chart.secondary} strokeWidth="2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.4, duration: 0.3 }}
            />
            <motion.circle cx="35" cy="40" r="3" fill={colorScheme.chart.secondary}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.3 }}
            />
            <motion.circle cx="165" cy="40" r="3" fill={colorScheme.chart.secondary}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.6, duration: 0.3 }}
            />
          </svg>
        </div>
        <Button variant="outline" className="w-full group-hover:bg-purple-600/10 transition-colors duration-300">
          Explore Boxplots →
        </Button>
      </motion.div>
      
      <motion.div 
        className="md:col-span-2 p-6 bg-gradient-to-br from-emerald-900/20 to-teal-800/20 rounded-lg border border-emerald-600/30 cursor-pointer group"
        whileHover={{ scale: 1.01 }}
        onClick={() => onSelectMode('comparison')}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.2 }
          }
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Grid3X3 className="w-8 h-8 text-emerald-400" />
          <h3 className="text-lg font-semibold text-emerald-300">Compare Visualizations</h3>
        </div>
        <p className="text-gray-300 mb-4">
          See how different views reveal different insights from the same dataset
        </p>
        <Button variant="primary" className="w-full md:w-auto group-hover:bg-emerald-600/20 transition-colors duration-300">
          Compare Side-by-Side →
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Histogram mode component
const HistogramMode = ({ globalState, updateState }) => {
  const [stage, setStage] = useState('intro');
  
  const stages = {
    intro: { component: HistogramIntuitiveIntro, label: 'Introduction' },
    journey: { component: HistogramInteractiveJourney, label: 'Finding Optimal Bins' },
    explorer: { component: HistogramShapeExplorer, label: 'Shape Explorer' },
    analysis: { component: HistogramShapeAnalysis, label: 'Shape Analysis' }
  };
  
  const CurrentStage = stages[stage].component;
  
  const advanceStage = () => {
    const stageOrder = Object.keys(stages);
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex < stageOrder.length - 1) {
      setStage(stageOrder[currentIndex + 1]);
    }
  };

  return (
    <div>
      {/* Stage Progress */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          {Object.entries(stages).map(([key, config], index) => (
            <Button
              key={key}
              onClick={() => setStage(key)}
              variant={stage === key ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {index + 1}. {config.label}
            </Button>
          ))}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
            style={{ 
              width: `${((Object.keys(stages).indexOf(stage) + 1) / Object.keys(stages).length) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Stage Content */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading visualization...</p>
          </div>
        </div>
      }>
        <CurrentStage />
      </Suspense>
      
      {/* Navigation */}
      <div className="mt-6 flex justify-end">
        {stage !== 'analysis' && (
          <Button onClick={advanceStage} className="flex items-center gap-2">
            Next Stage
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Boxplot mode component
const BoxplotMode = ({ globalState, updateState }) => {
  const [stage, setStage] = useState('explorer');
  
  const stages = {
    explorer: { component: BoxplotQuartilesExplorer, label: 'Quartiles Explorer' },
    journey: { component: BoxplotQuartilesJourney, label: 'Quartiles Journey' },
    realworld: { component: BoxplotRealWorldExplorer, label: 'Real World Applications' }
  };
  
  const CurrentStage = stages[stage].component;
  
  const advanceStage = () => {
    const stageOrder = Object.keys(stages);
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex < stageOrder.length - 1) {
      setStage(stageOrder[currentIndex + 1]);
    }
  };

  return (
    <div>
      {/* Stage Progress */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          {Object.entries(stages).map(([key, config], index) => (
            <Button
              key={key}
              onClick={() => setStage(key)}
              variant={stage === key ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {index + 1}. {config.label}
            </Button>
          ))}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
            style={{ 
              width: `${((Object.keys(stages).indexOf(stage) + 1) / Object.keys(stages).length) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Stage Content */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading visualization...</p>
          </div>
        </div>
      }>
        <CurrentStage />
      </Suspense>
      
      {/* Navigation */}
      <div className="mt-6 flex justify-end">
        {stage !== 'realworld' && (
          <Button onClick={advanceStage} className="flex items-center gap-2">
            Next Stage
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Comparison mode component
const ComparisonMode = ({ globalState }) => {
  const [syncInteractions, setSyncInteractions] = useState(true);
  const [highlightFeature, setHighlightFeature] = useState(null);
  
  const features = [
    { id: 'center', label: 'Central Tendency', description: 'Mean, median, mode' },
    { id: 'spread', label: 'Spread', description: 'Variance, range, IQR' },
    { id: 'skewness', label: 'Skewness', description: 'Distribution asymmetry' },
    { id: 'outliers', label: 'Outliers', description: 'Extreme values' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-600/30">
        <h2 className="text-xl font-semibold mb-2 text-emerald-300">
          Histogram vs Boxplot: Two Views, One Dataset
        </h2>
        <p className="text-gray-300">
          See how different visualizations reveal different aspects of the same data
        </p>
      </div>
      
      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Distribution View</h3>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading histogram...</p>
                </div>
              </div>
            }>
              <HistogramShapeExplorer />
            </Suspense>
          </div>
          <div className="mt-3 p-3 bg-blue-900/20 rounded border border-blue-600/30">
            <h4 className="text-sm font-semibold text-blue-300 mb-1">What Histograms Show Best:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Overall distribution shape</li>
              <li>• Multiple modes or peaks</li>
              <li>• Gradual changes in frequency</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">Summary View</h3>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading boxplot...</p>
                </div>
              </div>
            }>
              <BoxplotQuartilesExplorer />
            </Suspense>
          </div>
          <div className="mt-3 p-3 bg-purple-900/20 rounded border border-purple-600/30">
            <h4 className="text-sm font-semibold text-purple-300 mb-1">What Boxplots Show Best:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Quartiles and median</li>
              <li>• Outliers clearly marked</li>
              <li>• Easy group comparisons</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Feature Selector */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold mb-3 text-gray-300">Highlight Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map(feature => (
            <Button
              key={feature.id}
              onClick={() => setHighlightFeature(feature.id === highlightFeature ? null : feature.id)}
              variant={feature.id === highlightFeature ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="font-semibold">{feature.label}</span>
              <span className="text-xs opacity-70">{feature.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function VisualSummariesPage() {
  const [activeTab, setActiveTab] = useState('4-2-1-intro');
  const { completedTabs, markTabComplete } = useTabProgress();

  const handleTabComplete = (tabId) => {
    markTabComplete(tabId);
  };

  const activeTabData = TABS.find(tab => tab.id === activeTab);

  return (
    <VisualizationContainer>
      <BackToHub chapter={4} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Visual Summaries & Histograms</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master the art of visualizing data distributions through histograms
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

