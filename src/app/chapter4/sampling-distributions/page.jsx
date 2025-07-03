"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import BackToHub from '@/components/ui/BackToHub';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, createColorScheme } from '@/lib/design-system';
import { 
  Play, Pause, RotateCcw, Download, ChevronRight,
  Activity, BarChart3, Calculator, Layers, Eye,
  Info, X, Sparkles
} from 'lucide-react';
import * as d3 from 'd3';

// Get consistent color scheme
const colorScheme = createColorScheme('probability');

// Dynamic imports for stage components
const SamplingDistributionsHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-0-SamplingDistributionsHub')
);
const SamplingDistributionsInteractive = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-0-SamplingDistributionsInteractive')
);
const SamplingDistributionsProperties = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-SamplingDistributionsProperties-impl')
);
const SamplingDistributionsTheory = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-SamplingDistributionsTheory')
);
const SamplingDistributionsVisual = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-4-SamplingDistributionsVisual')
);

// Sampling Engine Class
class SamplingEngine {
  constructor({ population = 'uniform', seed = null }) {
    this.population = population;
    // Use d3-random for consistent random number generation
    this.seed = seed;
    
    this.distributions = {
      uniform: () => d3.randomUniform(0, 100)(),
      normal: () => d3.randomNormal(50, 15)(),
      exponential: () => d3.randomExponential(1/50)(),
      bimodal: () => {
        if (Math.random() < 0.5) {
          return d3.randomNormal(30, 10)();
        } else {
          return d3.randomNormal(70, 10)();
        }
      }
    };
  }
  
  drawSample(size) {
    const values = Array(size).fill(0)
      .map(() => this.distributions[this.population]());
    
    return {
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      values,
      mean: d3.mean(values),
      variance: d3.variance(values),
      timestamp: Date.now()
    };
  }
  
  drawBatch(sampleSize, batchSize) {
    return Array(batchSize).fill(0)
      .map(() => this.drawSample(sampleSize));
  }
  
  updatePopulation(newPopulation) {
    this.population = newPopulation;
  }
}

// Formula display component with proper LaTeX rendering
const FormulaDisplay = React.memo(function FormulaDisplay({ title }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="bg-gray-800/50 p-4 rounded-lg mb-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-400">{title}</h3>
      <div className="text-lg">
        <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i\\)` }} />
      </div>
      <div className="mt-2 text-sm text-gray-500">
        where <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X}\\)` }} /> is the sample mean 
        and <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /> is the sample size
      </div>
    </div>
  );
});

// Learning Path Navigator Component with smooth animations
const LearningPathNavigator = ({ stages, current, completed, onNavigate }) => {
  const stageConfig = {
    introduction: { icon: Activity, label: 'Introduction', color: colorScheme.primary },
    interactive: { icon: BarChart3, label: 'Interactive', color: colorScheme.secondary },
    properties: { icon: Calculator, label: 'Properties', color: colorScheme.accent },
    theory: { icon: Layers, label: 'Theory', color: colorScheme.success },
    visualization: { icon: Eye, label: 'Visualization', color: colorScheme.warning }
  };
  
  return (
    <VisualizationSection title="Learning Path" className="mb-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const config = stageConfig[stage];
          const Icon = config.icon;
          const isCompleted = completed.includes(stage);
          const isCurrent = stage === current;
          
          return (
            <React.Fragment key={stage}>
              <motion.button
                onClick={() => onNavigate(stage)}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-lg transition-all",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isCurrent && "bg-white dark:bg-gray-700 shadow-lg",
                  isCompleted && !isCurrent && "opacity-80",
                  !isCompleted && !isCurrent && "opacity-50"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                    "transition-all duration-300"
                  )}
                  style={{ 
                    backgroundColor: isCurrent ? config.color : '#e5e7eb',
                    color: isCurrent ? 'white' : '#6b7280'
                  }}
                  animate={isCurrent ? {
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs font-medium">{config.label}</span>
                
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.button>
              
              {index < stages.length - 1 && (
                <motion.div
                  className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"
                  animate={{
                    backgroundColor: completed.includes(stages[index + 1]) 
                      ? colorScheme.success 
                      : '#e5e7eb'
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <ProgressBar 
        progress={(completed.length / stages.length) * 100}
        className="mt-4"
      />
    </VisualizationSection>
  );
};

// Sampling Control Panel Component
const SamplingControlPanel = ({ 
  population, 
  sampleSize, 
  onPopulationChange, 
  onSampleSizeChange,
  autoSample,
  onAutoSampleToggle,
  onSampleNow,
  onReset
}) => {
  return (
    <ControlGroup>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Population Distribution</label>
          <select 
            value={population} 
            onChange={(e) => onPopulationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="uniform">Uniform</option>
            <option value="normal">Normal</option>
            <option value="exponential">Exponential</option>
            <option value="bimodal">Bimodal</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">
            Sample Size: {sampleSize}
          </label>
          <RangeSlider
            value={sampleSize}
            onChange={onSampleSizeChange}
            min={5}
            max={200}
            step={5}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-end gap-2">
          <Button
            onClick={onSampleNow}
            variant="default"
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Sample Now
          </Button>
          
          <Button
            onClick={onAutoSampleToggle}
            variant={autoSample ? "secondary" : "outline"}
            size="sm"
          >
            {autoSample ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={onReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </ControlGroup>
  );
};

// Sampling History Panel Component with animations
const SamplingHistoryPanel = ({ history, minimized, onClear, onExport }) => {
  const [isMinimized, setIsMinimized] = useState(minimized);
  const contentRef = useRef(null);
  
  const stats = useMemo(() => {
    if (!history.sampleMeans.length) return null;
    
    return {
      meanOfMeans: d3.mean(history.sampleMeans),
      stdError: d3.deviation(history.sampleMeans),
      minMean: d3.min(history.sampleMeans),
      maxMean: d3.max(history.sampleMeans)
    };
  }, [history.sampleMeans]);
  
  // Process MathJax for formulas
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [stats]);
  
  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 cursor-pointer"
        onClick={() => setIsMinimized(false)}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{history.metadata.totalSamples} samples</span>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Sampling History
        </h3>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div ref={contentRef} className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Samples:</span>
          <span className="font-mono font-medium">{history.metadata.totalSamples}</span>
        </div>
        
        {stats && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{\\bar{X}}\\)` }} />:
              </span>
              <span className="font-mono font-medium">{stats.meanOfMeans?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                <span dangerouslySetInnerHTML={{ __html: `\\(SE_{\\bar{X}}\\)` }} />:
              </span>
              <span className="font-mono font-medium">{stats.stdError?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Range:</span>
              <span className="font-mono font-medium">
                [{stats.minMean?.toFixed(1)}, {stats.maxMean?.toFixed(1)}]
              </span>
            </div>
          </>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          onClick={onExport}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>
    </motion.div>
  );
};

// Task Guide Component
const TaskGuide = ({ tasks, current, onTaskComplete }) => {
  const currentTask = tasks[current];
  if (!currentTask) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium mb-1">Task {current + 1} of {tasks.length}</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {currentTask.instruction}
            </p>
          </div>
        </div>
        
        <ProgressBar 
          progress={((current) / tasks.length) * 100}
          className="mt-3"
        />
      </Card>
    </motion.div>
  );
};

// Main Page Component
export default function SamplingDistributionsPage() {
  // Ref for MathJax processing
  const contentRef = useRef(null);
  
  // Global sampling state
  const [globalState, setGlobalState] = useState({
    currentStage: 'introduction',
    populationDistribution: 'uniform',
    sampleSize: 30,
    samplingHistory: {
      samples: [],
      sampleMeans: [],
      metadata: {
        totalSamples: 0,
        startTime: Date.now()
      }
    },
    learningProgress: {
      completedStages: [],
      discoveries: [],
      tasksCompleted: 0
    },
    simulationSettings: {
      autoSample: false,
      sampleRate: 100,
      maxHistory: 10000
    }
  });
  
  // Create sampling engine
  const samplingEngine = useMemo(() => {
    return new SamplingEngine({ 
      population: globalState.populationDistribution 
    });
  }, []);
  
  // Update engine when population changes
  useEffect(() => {
    samplingEngine.updatePopulation(globalState.populationDistribution);
  }, [globalState.populationDistribution, samplingEngine]);
  
  // Auto-sampling effect
  useEffect(() => {
    if (!globalState.simulationSettings.autoSample) return;
    
    const interval = setInterval(() => {
      handleSampleDraw();
    }, globalState.simulationSettings.sampleRate);
    
    return () => clearInterval(interval);
  }, [globalState.simulationSettings.autoSample, globalState.simulationSettings.sampleRate]);
  
  // Navigation handler
  const navigateToStage = useCallback((stage) => {
    setGlobalState(prev => ({
      ...prev,
      currentStage: stage,
      learningProgress: {
        ...prev.learningProgress,
        completedStages: prev.learningProgress.completedStages.includes(prev.currentStage)
          ? prev.learningProgress.completedStages
          : [...prev.learningProgress.completedStages, prev.currentStage]
      }
    }));
  }, []);
  
  // Sample drawing handler
  const handleSampleDraw = useCallback(() => {
    const sample = samplingEngine.drawSample(globalState.sampleSize);
    
    setGlobalState(prev => {
      // Check memory limit
      if (prev.samplingHistory.samples.length >= prev.simulationSettings.maxHistory) {
        // Archive old samples (in real app, move to IndexedDB)
        const archiveCount = Math.floor(prev.simulationSettings.maxHistory * 0.2);
        return {
          ...prev,
          samplingHistory: {
            samples: [...prev.samplingHistory.samples.slice(archiveCount), sample],
            sampleMeans: [...prev.samplingHistory.sampleMeans.slice(archiveCount), sample.mean],
            metadata: {
              ...prev.samplingHistory.metadata,
              totalSamples: prev.samplingHistory.metadata.totalSamples + 1
            }
          }
        };
      }
      
      return {
        ...prev,
        samplingHistory: {
          samples: [...prev.samplingHistory.samples, sample],
          sampleMeans: [...prev.samplingHistory.sampleMeans, sample.mean],
          metadata: {
            ...prev.samplingHistory.metadata,
            totalSamples: prev.samplingHistory.metadata.totalSamples + 1
          }
        }
      };
    });
  }, [samplingEngine, globalState.sampleSize]);
  
  // Population change handler
  const handlePopulationChange = useCallback((population) => {
    setGlobalState(prev => ({
      ...prev,
      populationDistribution: population,
      samplingHistory: {
        samples: [],
        sampleMeans: [],
        metadata: {
          totalSamples: 0,
          startTime: Date.now()
        }
      }
    }));
  }, []);
  
  // Sample size change handler
  const handleSampleSizeChange = useCallback((size) => {
    setGlobalState(prev => ({
      ...prev,
      sampleSize: size
    }));
  }, []);
  
  // Auto-sample toggle
  const toggleAutoSample = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      simulationSettings: {
        ...prev.simulationSettings,
        autoSample: !prev.simulationSettings.autoSample
      }
    }));
  }, []);
  
  // Reset handler
  const handleReset = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      samplingHistory: {
        samples: [],
        sampleMeans: [],
        metadata: {
          totalSamples: 0,
          startTime: Date.now()
        }
      }
    }));
  }, []);
  
  // Export handler
  const handleExport = useCallback(() => {
    const data = {
      metadata: globalState.samplingHistory.metadata,
      populationDistribution: globalState.populationDistribution,
      sampleSize: globalState.sampleSize,
      sampleMeans: globalState.samplingHistory.sampleMeans,
      summary: {
        meanOfMeans: d3.mean(globalState.samplingHistory.sampleMeans),
        standardError: d3.deviation(globalState.samplingHistory.sampleMeans),
        totalSamples: globalState.samplingHistory.metadata.totalSamples
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sampling-distribution-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [globalState]);
  
  // Render current stage
  const renderCurrentStage = () => {
    const stageProps = {
      globalState,
      samplingEngine,
      updateState: setGlobalState,
      onSampleDrawn: handleSampleDraw
    };
    
    switch (globalState.currentStage) {
      case 'introduction':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            <SamplingDistributionsHub />
          </motion.div>
        );
        
      case 'interactive':
        return (
          <VisualizationSection title="Interactive Sampling">
            <TaskGuide 
              tasks={[
                { id: 'first-sample', instruction: 'Draw your first sample of 30 values' },
                { id: 'multiple-samples', instruction: 'Draw 10 samples and observe the means' },
                { id: 'different-sizes', instruction: 'Try different sample sizes (10, 30, 100)' },
                { id: 'pattern-recognition', instruction: 'What pattern do you see forming?' }
              ]}
              current={Math.min(
                Math.floor(globalState.samplingHistory.metadata.totalSamples / 10),
                3
              )}
              onTaskComplete={() => {}}
            />
            
            <GraphContainer>
              <SamplingDistributionsInteractive 
                population={globalState.populationDistribution}
                sampleSize={globalState.sampleSize}
                onSampleDrawn={handleSampleDraw}
                samplingHistory={globalState.samplingHistory.samples}
              />
            </GraphContainer>
          </VisualizationSection>
        );
        
      case 'properties':
        return (
          <VisualizationSection title="Properties of Sampling Distributions">
            <FormulaDisplay title="Key Formula" />
            <GraphContainer>
              <SamplingDistributionsProperties 
                focusProperty="mean"
                samplingHistory={globalState.samplingHistory}
                populationParams={{
                  mean: globalState.populationDistribution === 'uniform' ? 50 : 50,
                  variance: globalState.populationDistribution === 'uniform' ? 833.33 : 225
                }}
              />
            </GraphContainer>
          </VisualizationSection>
        );
        
      case 'theory':
        return (
          <VisualizationSection title="Mathematical Theory">
            <SamplingDistributionsTheory />
          </VisualizationSection>
        );
        
      case 'visualization':
        return (
          <VisualizationSection title="Advanced Visualizations">
            <GraphContainer>
              <SamplingDistributionsVisual 
                samplingHistory={globalState.samplingHistory}
                populationDistribution={globalState.populationDistribution}
                sampleSize={globalState.sampleSize}
              />
            </GraphContainer>
          </VisualizationSection>
        );
        
      default:
        return null;
    }
  };
  
  // Process MathJax for the entire page
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [globalState.currentStage]);
  
  return (
    <VisualizationContainer ref={contentRef}>
      <BackToHub chapter={4} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sampling Distributions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover how sample statistics behave when we repeatedly sample from a population
        </p>
      </div>
      
      <LearningPathNavigator 
        stages={['introduction', 'interactive', 'properties', 'theory', 'visualization']}
        current={globalState.currentStage}
        completed={globalState.learningProgress.completedStages}
        onNavigate={navigateToStage}
      />
      
      {globalState.currentStage !== 'introduction' && (
        <SamplingControlPanel 
          population={globalState.populationDistribution}
          sampleSize={globalState.sampleSize}
          onPopulationChange={handlePopulationChange}
          onSampleSizeChange={handleSampleSizeChange}
          autoSample={globalState.simulationSettings.autoSample}
          onAutoSampleToggle={toggleAutoSample}
          onSampleNow={handleSampleDraw}
          onReset={handleReset}
        />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={globalState.currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentStage()}
        </motion.div>
      </AnimatePresence>
      
      <SamplingHistoryPanel 
        history={globalState.samplingHistory}
        minimized={globalState.currentStage === 'introduction'}
        onClear={handleReset}
        onExport={handleExport}
      />
    </VisualizationContainer>
  );
}