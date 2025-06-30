"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, Activity, Calculator, FlaskConical,
  ChevronRight, RefreshCw, ArrowRight, Info
} from 'lucide-react';

const colorScheme = createColorScheme('hypothesis');

// Sample data sets for different examples
const EXAMPLES = {
  income: {
    name: "Alberta vs Ontario Income",
    group1: { 
      label: "Alberta", 
      data: [35000, 32000, 38000, 31000, 34000, 33000, 36000, 30000, 37000, 32000],
      knownSigma: 5000
    },
    group2: { 
      label: "Ontario", 
      data: [31000, 33000, 32000, 30000, 34000, 31500, 32500, 33000],
      knownSigma: 2000
    },
    unit: "$",
    context: "Testing if average income differs between provinces"
  },
  fertilizer: {
    name: "New vs Old Fertilizer",
    group1: { 
      label: "Control (Old)", 
      data: [42.5, 39.8, 40.3, 43.1, 39.6, 41.0, 39.9, 42.1],
      knownSigma: null
    },
    group2: { 
      label: "New Fertilizer", 
      data: [47.8, 45.2, 48.9, 46.3, 47.1, 48.5, 46.9, 47.5],
      knownSigma: null
    },
    unit: "cm",
    context: "Testing if new fertilizer produces taller plants"
  }
};

// Learning stages for progressive disclosure
const LEARNING_STAGES = [
  {
    id: 'decision-tree',
    title: 'Part A: Decision Tree Navigator',
    description: 'Choose the appropriate test based on what you know',
    unlocks: ['decision-tree-viz', 'test-selector']
  },
  {
    id: 'data-visualization',
    title: 'Part A: Visualize Your Data',
    description: 'Compare the two groups visually',
    unlocks: ['dual-distributions', 'data-table']
  },
  {
    id: 'test-calculation',
    title: 'Part B: Calculate Test Statistic',
    description: 'Apply the selected test method',
    unlocks: ['test-statistic-calc', 'variance-comparison']
  },
  {
    id: 'decision-making',
    title: 'Part C: Make a Decision',
    description: 'Use critical values and p-values',
    unlocks: ['critical-value-viz', 'p-value-viz']
  },
  {
    id: 'sample-size-effects',
    title: 'Part D: Sample Size Effects',
    description: 'See how sample size impacts conclusions',
    unlocks: ['sample-size-explorer', 'power-analysis']
  }
];

// Discovery definitions
const discoveryDefinitions = [
  {
    id: 'test-selection',
    title: 'Test Selection Decision Tree',
    description: 'Choose test based on known parameters and assumptions',
    category: 'concept'
  },
  {
    id: 'pooled-variance',
    title: 'Pooled Variance',
    description: 'Weighted average of sample variances when assumed equal',
    formula: 'S_p^2 = \\frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1 + n_2 - 2}',
    category: 'formula'
  },
  {
    id: 'two-sample-z-test',
    title: 'Two-Sample Z-Test',
    description: 'Used when population variances are known',
    formula: 'Z = \\frac{(\\bar{X}_1 - \\bar{X}_2)}{\\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}}',
    category: 'formula'
  },
  {
    id: 'pooled-t-test',
    title: 'Pooled t-Test',
    description: 'Used when variances are unknown but assumed equal',
    formula: 't = \\frac{(\\bar{X}_1 - \\bar{X}_2)}{S_p\\sqrt{1/n_1 + 1/n_2}}',
    category: 'formula'
  },
  {
    id: 'welch-t-test',
    title: "Welch's t-Test",
    description: 'Used when variances are unknown and unequal',
    formula: 't = \\frac{(\\bar{X}_1 - \\bar{X}_2)}{\\sqrt{S_1^2/n_1 + S_2^2/n_2}}',
    category: 'formula'
  },
  {
    id: 'variance-ratio-rule',
    title: 'Variance Ratio Rule',
    description: 'If S₁²/S₂² > 3, use Welch\'s test instead of pooled',
    category: 'pattern'
  },
  {
    id: 'sample-size-effect',
    title: 'Sample Size Impact',
    description: 'Same effect size can lead to different conclusions with different n',
    category: 'pattern'
  }
];

// Decision Tree Component
const DecisionTreeNavigator = memo(({ selectedCase, onSelectCase, isUnlocked }) => {
  if (!isUnlocked) return null;

  return (
    <div className="relative p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-700/30">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        Test Selection Decision Tree
      </h4>
      
      <div className="relative">
        {/* Root Question */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <p className="text-white font-semibold">Are population variances σ₁² and σ₂² known?</p>
          </div>
        </motion.div>

        {/* Branches */}
        <div className="grid grid-cols-2 gap-8">
          {/* Yes Branch */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => onSelectCase('z-test')}
              className={cn(
                "w-full p-4 rounded-lg transition-all duration-300 text-left",
                selectedCase === 'z-test' 
                  ? "bg-purple-600/20 border-2 border-purple-500 shadow-lg" 
                  : "bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 font-semibold">Yes →</span>
                <span className="text-white font-semibold">Case 1: Z-test</span>
              </div>
              <p className="text-sm text-neutral-300">Use known σ₁ and σ₂</p>
              <div className="mt-2 text-xs font-mono text-purple-400">
                Z = (X̄₁ - X̄₂) / √(σ₁²/n₁ + σ₂²/n₂)
              </div>
            </button>
          </motion.div>

          {/* No Branch */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="text-red-400 font-semibold">No ↓</div>
            
            <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
              <p className="text-sm text-white mb-3">Are variances assumed equal?</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => onSelectCase('pooled-t')}
                  className={cn(
                    "w-full p-3 rounded transition-all duration-300 text-left",
                    selectedCase === 'pooled-t' 
                      ? "bg-purple-600/20 border-2 border-purple-500" 
                      : "bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">Yes →</span>
                    <span className="text-white font-semibold">Case 2: Pooled t-test</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Equal variances assumed</p>
                </button>
                
                <button
                  onClick={() => onSelectCase('welch-t')}
                  className={cn(
                    "w-full p-3 rounded transition-all duration-300 text-left",
                    selectedCase === 'welch-t' 
                      ? "bg-purple-600/20 border-2 border-purple-500" 
                      : "bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">No →</span>
                    <span className="text-white font-semibold">Case 3: Welch's t-test</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Unequal variances (default)</p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selected Case Info */}
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30"
          >
            <div className="flex items-center gap-2 text-purple-300">
              <Info className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {selectedCase === 'z-test' && "Z-test: Use when σ₁ and σ₂ are known from previous studies"}
                {selectedCase === 'pooled-t' && "Pooled t-test: Use when variances can be assumed equal (ratio < 3:1)"}
                {selectedCase === 'welch-t' && "Welch's t-test: Default choice, more conservative with fewer df"}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

DecisionTreeNavigator.displayName = 'DecisionTreeNavigator';

// Dual Distribution Visualization
const DualDistributionViz = memo(({ group1Stats, group2Stats, testCase }) => {
  const vizRef = useRef(null);
  
  useEffect(() => {
    if (!vizRef.current || !group1Stats || !group2Stats) return;
    
    const svg = d3.select(vizRef.current);
    const { width } = vizRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Determine x-axis range
    const minMean = Math.min(group1Stats.mean, group2Stats.mean);
    const maxMean = Math.max(group1Stats.mean, group2Stats.mean);
    const maxSD = Math.max(group1Stats.sd, group2Stats.sd);
    const xMin = minMean - 4 * maxSD;
    const xMax = maxMean + 4 * maxSD;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([height - margin.bottom, margin.top]);
    
    // Create axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("Value");
      
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));
    
    // Draw distributions
    const drawDistribution = (stats, color, label) => {
      const data = d3.range(xMin, xMax, (xMax - xMin) / 200).map(x => ({
        x: x,
        y: jStat.normal.pdf(x, stats.mean, stats.sd)
      }));
      
      // Area under curve
      svg.append("path")
        .datum(data)
        .attr("fill", color)
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Curve line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Mean line
      svg.append("line")
        .attr("x1", xScale(stats.mean))
        .attr("x2", xScale(stats.mean))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.4))
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Label
      svg.append("text")
        .attr("x", xScale(stats.mean))
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-weight", "bold")
        .text(`${label}: μ̂=${stats.mean.toFixed(2)}`);
    };
    
    drawDistribution(group1Stats, colorScheme.chart.primary, group1Stats.label);
    drawDistribution(group2Stats, colorScheme.chart.accent, group2Stats.label);
    
    // Add difference annotation
    const diff = Math.abs(group1Stats.mean - group2Stats.mean);
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14")
      .text(`Difference: |μ̂₁ - μ̂₂| = ${diff.toFixed(2)}`);
    
  }, [group1Stats, group2Stats, testCase]);
  
  return <svg ref={vizRef} style={{ width: "100%", height: 300 }} />;
});

DualDistributionViz.displayName = 'DualDistributionViz';

// Main Component
export default function UnpairedTwoSampleTest() {
  // State management
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [selectedExample, setSelectedExample] = useState('income');
  const [selectedCase, setSelectedCase] = useState('z-test');
  const [hypothesisType, setHypothesisType] = useState('two'); // 'left', 'right', 'two'
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [showAnimation, setShowAnimation] = useState(false);
  const [customData, setCustomData] = useState({
    group1: [],
    group2: []
  });

  // Discovery tracking
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions);

  // Get current example data
  const example = EXAMPLES[selectedExample];
  const group1Data = customData.group1.length > 0 ? customData.group1 : example.group1.data;
  const group2Data = customData.group2.length > 0 ? customData.group2 : example.group2.data;

  // Calculate statistics for both groups
  const calculateGroupStats = (data, label, knownSigma = null) => {
    const n = data.length;
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const sd = knownSigma || Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    
    return { n, mean, variance, sd, se, label };
  };

  const group1Stats = calculateGroupStats(
    group1Data, 
    example.group1.label, 
    example.group1.knownSigma
  );
  const group2Stats = calculateGroupStats(
    group2Data, 
    example.group2.label, 
    example.group2.knownSigma
  );

  // Calculate test statistics based on selected case
  const calculateTestStatistic = () => {
    const diff = group1Stats.mean - group2Stats.mean;
    
    switch (selectedCase) {
      case 'z-test':
        // Known variances
        const seZ = Math.sqrt(
          Math.pow(group1Stats.sd, 2) / group1Stats.n + 
          Math.pow(group2Stats.sd, 2) / group2Stats.n
        );
        return { statistic: diff / seZ, df: null, se: seZ };
        
      case 'pooled-t':
        // Unknown but equal variances
        const pooledVar = ((group1Stats.n - 1) * group1Stats.variance + 
                          (group2Stats.n - 1) * group2Stats.variance) / 
                         (group1Stats.n + group2Stats.n - 2);
        const pooledSd = Math.sqrt(pooledVar);
        const sePooled = pooledSd * Math.sqrt(1/group1Stats.n + 1/group2Stats.n);
        const df = group1Stats.n + group2Stats.n - 2;
        
        return { 
          statistic: diff / sePooled, 
          df: df, 
          se: sePooled,
          pooledVar: pooledVar 
        };
        
      case 'welch-t':
        // Unknown and unequal variances (Welch's test)
        const seWelch = Math.sqrt(
          group1Stats.variance / group1Stats.n + 
          group2Stats.variance / group2Stats.n
        );
        const dfNum = Math.pow(seWelch, 4);
        const dfDenom = Math.pow(group1Stats.variance / group1Stats.n, 2) / (group1Stats.n - 1) +
                       Math.pow(group2Stats.variance / group2Stats.n, 2) / (group2Stats.n - 1);
        const dfWelch = Math.floor(dfNum / dfDenom);
        
        return { 
          statistic: diff / seWelch, 
          df: dfWelch, 
          se: seWelch 
        };
    }
  };

  const testResult = calculateTestStatistic();

  // Get critical values
  const getCriticalValues = () => {
    const isZTest = selectedCase === 'z-test';
    const df = testResult.df;
    
    if (isZTest) {
      const z = jStat.normal.inv(1 - significanceLevel, 0, 1);
      
      switch (hypothesisType) {
        case 'left':
          return { lower: -z, upper: null };
        case 'right':
          return { lower: null, upper: z };
        case 'two':
          const z2 = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
          return { lower: -z2, upper: z2 };
      }
    } else {
      // t-distribution
      const t = jStat.studentt.inv(1 - significanceLevel, df);
      
      switch (hypothesisType) {
        case 'left':
          return { lower: -t, upper: null };
        case 'right':
          return { lower: null, upper: t };
        case 'two':
          const t2 = jStat.studentt.inv(1 - significanceLevel/2, df);
          return { lower: -t2, upper: t2 };
      }
    }
  };

  // Calculate p-value
  const calculatePValue = () => {
    const stat = testResult.statistic;
    const isZTest = selectedCase === 'z-test';
    
    if (isZTest) {
      switch (hypothesisType) {
        case 'left':
          return jStat.normal.cdf(stat, 0, 1);
        case 'right':
          return 1 - jStat.normal.cdf(stat, 0, 1);
        case 'two':
          return 2 * (1 - jStat.normal.cdf(Math.abs(stat), 0, 1));
      }
    } else {
      // t-distribution
      switch (hypothesisType) {
        case 'left':
          return jStat.studentt.cdf(stat, testResult.df);
        case 'right':
          return 1 - jStat.studentt.cdf(stat, testResult.df);
        case 'two':
          return 2 * (1 - jStat.studentt.cdf(Math.abs(stat), testResult.df));
      }
    }
  };

  const criticalValues = getCriticalValues();
  const pValue = calculatePValue();

  // Stage management functions
  const isStageUnlocked = (stageId) => {
    const index = LEARNING_STAGES.findIndex(s => s.id === stageId);
    return index === 0 || completedStages.includes(LEARNING_STAGES[index - 1].id);
  };

  const isFeatureUnlocked = (featureId) => {
    return LEARNING_STAGES.some(stage => 
      completedStages.includes(stage.id) && stage.unlocks.includes(featureId)
    );
  };

  const completeStage = () => {
    const stage = LEARNING_STAGES[currentStage];
    if (!completedStages.includes(stage.id)) {
      setCompletedStages([...completedStages, stage.id]);
      
      if (currentStage < LEARNING_STAGES.length - 1) {
        setCurrentStage(currentStage + 1);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1500);
      }
    }
  };

  // Progress calculation
  const totalDiscoveries = discoveryDefinitions.length;
  const discoveredCount = discoveries.length;
  const progress = (discoveredCount / totalDiscoveries) * 100;

  return (
    <VisualizationContainer
      title="Unpaired Two-Sample Test"
      description="Compare means from two independent groups with different variance assumptions"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          value={progress} 
          max={100}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{discoveredCount} / {totalDiscoveries} concepts discovered</span>
          <span>{completedStages.length} / {LEARNING_STAGES.length} stages completed</span>
        </div>
      </div>

      {/* Example Selector */}
      <VisualizationSection className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Select Example Dataset</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(EXAMPLES).map(([key, ex]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedExample(key);
                setSelectedCase(ex.group1.knownSigma ? 'z-test' : 'pooled-t');
              }}
              className={cn(
                "p-4 rounded-lg transition-all duration-300 text-left",
                selectedExample === key
                  ? "bg-purple-600/20 border-2 border-purple-500 shadow-lg"
                  : "bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">{ex.name}</span>
              </div>
              <p className="text-sm text-neutral-300">{ex.context}</p>
              <div className="mt-2 text-xs text-neutral-400">
                {ex.group1.label}: n={ex.group1.data.length} | 
                {ex.group2.label}: n={ex.group2.data.length}
              </div>
            </button>
          ))}
        </div>
      </VisualizationSection>

      {/* Main Content */}
      <div className="space-y-6">
        {LEARNING_STAGES.map((stage, index) => {
          const isUnlocked = isStageUnlocked(stage.id);
          const isActive = index === currentStage;
          const isCompleted = completedStages.includes(stage.id);

          return (
            <VisualizationSection
              key={stage.id}
              className={cn(
                "transition-all duration-500",
                !isUnlocked && "opacity-50",
                isActive && showAnimation && "ring-2 ring-purple-500 ring-opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    isCompleted ? "bg-green-600 text-white" :
                    isActive ? "bg-purple-600 text-white" :
                    isUnlocked ? "bg-neutral-700 text-neutral-300" :
                    "bg-neutral-800 text-neutral-500"
                  )}>
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isUnlocked ? "text-white" : "text-neutral-500"
                    )}>
                      {stage.title}
                    </h3>
                    <p className="text-sm text-neutral-400">{stage.description}</p>
                  </div>
                </div>
                {isActive && !isCompleted && (
                  <Button
                    onClick={completeStage}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Complete Stage
                  </Button>
                )}
              </div>

              {isUnlocked && (
                <div className="mt-4">
                  {stage.id === 'decision-tree' && (
                    <DecisionTreeNavigator 
                      selectedCase={selectedCase}
                      onSelectCase={(newCase) => {
                        setSelectedCase(newCase);
                        if (!discoveries.includes('test-selection')) {
                          markDiscovered('test-selection');
                        }
                      }}
                      isUnlocked={isFeatureUnlocked('decision-tree-viz')}
                    />
                  )}
                  
                  {stage.id === 'data-visualization' && (
                    <DataVisualization 
                      group1Stats={group1Stats}
                      group2Stats={group2Stats}
                      example={example}
                      isUnlocked={isFeatureUnlocked('dual-distributions')}
                    />
                  )}
                  
                  {stage.id === 'test-calculation' && (
                    <TestCalculation
                      selectedCase={selectedCase}
                      testResult={testResult}
                      group1Stats={group1Stats}
                      group2Stats={group2Stats}
                      markDiscovered={markDiscovered}
                      discoveries={discoveries}
                    />
                  )}
                  
                  {stage.id === 'decision-making' && (
                    <DecisionMaking
                      testResult={testResult}
                      criticalValues={criticalValues}
                      pValue={pValue}
                      hypothesisType={hypothesisType}
                      setHypothesisType={setHypothesisType}
                      significanceLevel={significanceLevel}
                      setSignificanceLevel={setSignificanceLevel}
                      selectedCase={selectedCase}
                    />
                  )}
                  
                  {stage.id === 'sample-size-effects' && (
                    <SampleSizeEffects
                      baseStats={{ group1: group1Stats, group2: group2Stats }}
                      selectedCase={selectedCase}
                      hypothesisType={hypothesisType}
                      significanceLevel={significanceLevel}
                      markDiscovered={markDiscovered}
                      discoveries={discoveries}
                    />
                  )}
                </div>
              )}
            </VisualizationSection>
          );
        })}
      </div>

      {/* Mathematical Discoveries */}
      {discoveries.length > 0 && (
        <MathematicalDiscoveries 
          discoveries={discoveries}
          title="Two-Sample Test Concepts"
          className="mt-6 text-xs"
        />
      )}

      {/* Summary Table */}
      {completedStages.length === LEARNING_STAGES.length && (
        <VisualizationSection className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Two-Sample Test Decision Framework
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left p-3 text-neutral-400">Case</th>
                  <th className="text-left p-3 text-neutral-400">When to Use</th>
                  <th className="text-left p-3 text-neutral-400">Test Statistic</th>
                  <th className="text-left p-3 text-neutral-400">Distribution</th>
                  <th className="text-left p-3 text-neutral-400">Key Assumption</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="p-3 text-white font-semibold">Z-test</td>
                  <td className="p-3 text-neutral-300">σ₁, σ₂ known</td>
                  <td className="p-3 font-mono text-purple-300 text-xs">
                    Z = (X̄₁-X̄₂)/√(σ₁²/n₁+σ₂²/n₂)
                  </td>
                  <td className="p-3 text-neutral-300">N(0,1)</td>
                  <td className="p-3 text-neutral-300">Population SDs known</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="p-3 text-white font-semibold">Pooled t-test</td>
                  <td className="p-3 text-neutral-300">σ₁=σ₂ unknown</td>
                  <td className="p-3 font-mono text-purple-300 text-xs">
                    t = (X̄₁-X̄₂)/(Sp√(1/n₁+1/n₂))
                  </td>
                  <td className="p-3 text-neutral-300">t(n₁+n₂-2)</td>
                  <td className="p-3 text-neutral-300">Equal variances</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-semibold">Welch's t-test</td>
                  <td className="p-3 text-neutral-300">σ₁≠σ₂ unknown</td>
                  <td className="p-3 font-mono text-purple-300 text-xs">
                    t = (X̄₁-X̄₂)/√(S₁²/n₁+S₂²/n₂)
                  </td>
                  <td className="p-3 text-neutral-300">t(df*)</td>
                  <td className="p-3 text-neutral-300">Unequal variances</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <h4 className="font-semibold text-purple-300 mb-2">Practical Guidelines</h4>
            <ul className="text-sm text-neutral-300 space-y-1 list-disc list-inside">
              <li>When in doubt, use Welch's test (more conservative)</li>
              <li>Check variance ratio: if S₁²/S₂² {'>'} 3, avoid pooling</li>
              <li>Large samples (n {'>'} 30) make methods converge</li>
              <li>Always report which method was used</li>
            </ul>
          </div>
        </VisualizationSection>
      )}
    </VisualizationContainer>
  );
}

// Component: Data Visualization
function DataVisualization({ group1Stats, group2Stats, example, isUnlocked }) {
  if (!isUnlocked) return null;

  return (
    <div className="space-y-6">
      {/* Dual Distribution Plot */}
      <GraphContainer>
        <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Distribution Comparison
        </h4>
        <DualDistributionViz 
          group1Stats={group1Stats} 
          group2Stats={group2Stats}
        />
      </GraphContainer>

      {/* Summary Statistics Table */}
      <div className="bg-neutral-800/50 rounded-lg p-4">
        <h4 className="text-base font-semibold text-white mb-3">Summary Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-purple-400">{group1Stats.label}</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Sample Size (n₁):</span>
                <span className="font-mono text-white">{group1Stats.n}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Mean (X̄₁):</span>
                <span className="font-mono text-white">{group1Stats.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Std Dev (S₁):</span>
                <span className="font-mono text-white">{group1Stats.sd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Variance (S₁²):</span>
                <span className="font-mono text-white">{group1Stats.variance.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-purple-400">{group2Stats.label}</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Sample Size (n₂):</span>
                <span className="font-mono text-white">{group2Stats.n}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Mean (X̄₂):</span>
                <span className="font-mono text-white">{group2Stats.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Std Dev (S₂):</span>
                <span className="font-mono text-white">{group2Stats.sd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Variance (S₂²):</span>
                <span className="font-mono text-white">{group2Stats.variance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Variance Ratio Check */}
        <div className="mt-4 p-3 bg-neutral-900/50 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Variance Ratio (S₁²/S₂²):</span>
            <span className={cn(
              "font-mono font-bold",
              group1Stats.variance / group2Stats.variance > 3 || 
              group2Stats.variance / group1Stats.variance > 3
                ? "text-yellow-400" : "text-green-400"
            )}>
              {Math.max(
                group1Stats.variance / group2Stats.variance,
                group2Stats.variance / group1Stats.variance
              ).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {group1Stats.variance / group2Stats.variance > 3 || 
             group2Stats.variance / group1Stats.variance > 3
              ? "Ratio > 3: Consider using Welch's test"
              : "Ratio < 3: Pooling variances is reasonable"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Component: Test Calculation
function TestCalculation({ selectedCase, testResult, group1Stats, group2Stats, markDiscovered, discoveries }) {
  useEffect(() => {
    // Mark discoveries based on selected case
    if (selectedCase === 'z-test' && !discoveries.includes('two-sample-z-test')) {
      markDiscovered('two-sample-z-test');
    } else if (selectedCase === 'pooled-t' && !discoveries.includes('pooled-t-test')) {
      markDiscovered('pooled-t-test');
      if (!discoveries.includes('pooled-variance')) {
        markDiscovered('pooled-variance');
      }
    } else if (selectedCase === 'welch-t' && !discoveries.includes('welch-t-test')) {
      markDiscovered('welch-t-test');
    }
  }, [selectedCase, discoveries, markDiscovered]);

  return (
    <div className="space-y-4">
      <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
        <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {selectedCase === 'z-test' && "Z-Test Calculation"}
          {selectedCase === 'pooled-t' && "Pooled t-Test Calculation"}
          {selectedCase === 'welch-t' && "Welch's t-Test Calculation"}
        </h4>
        
        {/* Show pooled variance calculation if applicable */}
        {selectedCase === 'pooled-t' && testResult.pooledVar && (
          <div className="mb-6 p-4 bg-neutral-900/50 rounded-lg">
            <h5 className="text-sm font-semibold text-purple-400 mb-3">Step 1: Calculate Pooled Variance</h5>
            <div className="text-center">
              <div className="text-lg text-white mb-2">
                S²<sub>p</sub> = 
                <span className="text-green-400"> [(n₁-1)S₁² + (n₂-1)S₂²]</span> / 
                <span className="text-blue-400"> (n₁ + n₂ - 2)</span>
              </div>
              <div className="text-sm text-neutral-300">
                = <span className="text-green-400">[({group1Stats.n}-1)×{group1Stats.variance.toFixed(2)} + 
                ({group2Stats.n}-1)×{group2Stats.variance.toFixed(2)}]</span> / 
                <span className="text-blue-400"> {group1Stats.n + group2Stats.n - 2}</span>
              </div>
              <div className="text-xl font-mono text-purple-400 mt-2">
                S²<sub>p</sub> = {testResult.pooledVar.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-400 mt-1">
                S<sub>p</sub> = {Math.sqrt(testResult.pooledVar).toFixed(2)}
              </div>
            </div>
          </div>
        )}
        
        {/* Test Statistic Calculation */}
        <div className="p-4 bg-neutral-900/50 rounded-lg">
          <h5 className="text-sm font-semibold text-purple-400 mb-3">
            {selectedCase === 'pooled-t' ? "Step 2: " : ""}Calculate Test Statistic
          </h5>
          <div className="text-center">
            <div className="text-xl text-white mb-4">
              {selectedCase === 'z-test' && "Z = "}
              {selectedCase !== 'z-test' && "t = "}
              <span className="text-green-400">(X̄₁ - X̄₂)</span> / 
              <span className="text-blue-400"> SE</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <div className="text-green-400 font-mono text-lg">
                  {group1Stats.mean.toFixed(2)} - {group2Stats.mean.toFixed(2)}
                </div>
                <div className="text-xs text-neutral-400">Difference</div>
              </div>
              <div>
                <div className="text-blue-400 font-mono text-lg">
                  {testResult.se.toFixed(3)}
                </div>
                <div className="text-xs text-neutral-400">Standard Error</div>
              </div>
              <div>
                <div className="text-purple-400 font-mono text-2xl font-bold">
                  {testResult.statistic.toFixed(3)}
                </div>
                <div className="text-xs text-neutral-400">Test Statistic</div>
              </div>
            </div>
            
            {/* Standard Error Formula */}
            <div className="mt-4 p-3 bg-neutral-800/50 rounded text-sm">
              <div className="text-neutral-400 mb-1">Standard Error Formula:</div>
              <div className="text-white">
                {selectedCase === 'z-test' && 
                  "SE = √(σ₁²/n₁ + σ₂²/n₂)"}
                {selectedCase === 'pooled-t' && 
                  "SE = Sp × √(1/n₁ + 1/n₂)"}
                {selectedCase === 'welch-t' && 
                  "SE = √(S₁²/n₁ + S₂²/n₂)"}
              </div>
            </div>
            
            {/* Degrees of Freedom */}
            {testResult.df && (
              <div className="mt-3 text-sm">
                <span className="text-neutral-400">Degrees of Freedom: </span>
                <span className="font-mono text-yellow-400">df = {testResult.df}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Decision Making
function DecisionMaking({ 
  testResult, 
  criticalValues, 
  pValue, 
  hypothesisType, 
  setHypothesisType,
  significanceLevel,
  setSignificanceLevel,
  selectedCase 
}) {
  const isZTest = selectedCase === 'z-test';
  const statName = isZTest ? 'Z' : 't';
  
  // Determine decision
  const isRejected = (() => {
    switch (hypothesisType) {
      case 'left':
        return testResult.statistic < criticalValues.lower;
      case 'right':
        return testResult.statistic > criticalValues.upper;
      case 'two':
        return Math.abs(testResult.statistic) > criticalValues.upper;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Hypothesis Type Selection */}
      <div className="bg-neutral-800/50 rounded-lg p-4">
        <h4 className="text-base font-semibold text-white mb-3">Select Alternative Hypothesis</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'left', label: 'Left-tailed', symbol: '<', desc: 'μ₁ < μ₂' },
            { value: 'right', label: 'Right-tailed', symbol: '>', desc: 'μ₁ > μ₂' },
            { value: 'two', label: 'Two-tailed', symbol: '≠', desc: 'μ₁ ≠ μ₂' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setHypothesisType(type.value)}
              className={cn(
                "p-3 rounded-lg transition-all duration-300",
                hypothesisType === type.value
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
              )}
            >
              <div className="font-semibold">{type.label}</div>
              <div className="text-sm mt-1">H₁: {type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Significance Level */}
      <div className="bg-neutral-800/50 rounded-lg p-4">
        <h4 className="text-base font-semibold text-white mb-3">Significance Level (α)</h4>
        <div className="flex gap-3">
          {[0.01, 0.05, 0.10].map(alpha => (
            <button
              key={alpha}
              onClick={() => setSignificanceLevel(alpha)}
              className={cn(
                "flex-1 p-3 rounded-lg transition-all duration-300",
                significanceLevel === alpha
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
              )}
            >
              <div className="font-mono text-lg">{alpha}</div>
              <div className="text-xs">
                {alpha === 0.01 ? 'Very strict' :
                 alpha === 0.05 ? 'Standard' :
                 'Lenient'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical Value Method */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-white mb-3">Critical Value Method</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Test Statistic:</span>
              <span className="font-mono text-purple-400">
                {statName} = {testResult.statistic.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Critical Value(s):</span>
              <span className="font-mono text-yellow-400">
                {hypothesisType === 'two' 
                  ? `±${Math.abs(criticalValues.upper).toFixed(3)}`
                  : hypothesisType === 'left'
                  ? criticalValues.lower.toFixed(3)
                  : criticalValues.upper.toFixed(3)
                }
              </span>
            </div>
            <div className={cn(
              "mt-2 p-2 rounded text-center font-semibold",
              isRejected ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"
            )}>
              {isRejected ? "Reject H₀" : "Fail to Reject H₀"}
            </div>
          </div>
        </div>

        {/* P-Value Method */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-white mb-3">P-Value Method</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">P-Value:</span>
              <span className="font-mono text-purple-400">
                {pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Significance (α):</span>
              <span className="font-mono text-yellow-400">{significanceLevel}</span>
            </div>
            <div className={cn(
              "mt-2 p-2 rounded text-center font-semibold",
              pValue < significanceLevel ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"
            )}>
              {pValue < significanceLevel ? "Reject H₀" : "Fail to Reject H₀"}
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className={cn(
        "rounded-lg p-4",
        isRejected ? "bg-red-900/20 border border-red-700/30" : "bg-green-900/20 border border-green-700/30"
      )}>
        <h5 className="font-semibold mb-2">Conclusion</h5>
        <p className="text-sm">
          {isRejected 
            ? "There is sufficient evidence to conclude that the means of the two groups are different."
            : "There is insufficient evidence to conclude that the means of the two groups are different."
          }
        </p>
      </div>
    </div>
  );
}

// Component: Sample Size Effects
function SampleSizeEffects({ 
  baseStats, 
  selectedCase, 
  hypothesisType, 
  significanceLevel,
  markDiscovered,
  discoveries 
}) {
  const [sampleSizeMultiplier, setSampleSizeMultiplier] = useState(1);
  
  useEffect(() => {
    if (!discoveries.includes('sample-size-effect')) {
      markDiscovered('sample-size-effect');
    }
  }, [discoveries, markDiscovered]);

  // Calculate test results for different sample sizes
  const calculateForSampleSize = (multiplier) => {
    const n1 = Math.round(baseStats.group1.n * multiplier);
    const n2 = Math.round(baseStats.group2.n * multiplier);
    const diff = baseStats.group1.mean - baseStats.group2.mean;
    
    let se, df, statistic;
    
    switch (selectedCase) {
      case 'z-test':
        se = Math.sqrt(
          Math.pow(baseStats.group1.sd, 2) / n1 + 
          Math.pow(baseStats.group2.sd, 2) / n2
        );
        statistic = diff / se;
        df = null;
        break;
        
      case 'pooled-t':
        const pooledVar = ((baseStats.group1.n - 1) * baseStats.group1.variance + 
                          (baseStats.group2.n - 1) * baseStats.group2.variance) / 
                         (baseStats.group1.n + baseStats.group2.n - 2);
        const pooledSd = Math.sqrt(pooledVar);
        se = pooledSd * Math.sqrt(1/n1 + 1/n2);
        statistic = diff / se;
        df = n1 + n2 - 2;
        break;
        
      case 'welch-t':
        se = Math.sqrt(
          baseStats.group1.variance / n1 + 
          baseStats.group2.variance / n2
        );
        statistic = diff / se;
        const dfNum = Math.pow(se, 4);
        const dfDenom = Math.pow(baseStats.group1.variance / n1, 2) / (n1 - 1) +
                       Math.pow(baseStats.group2.variance / n2, 2) / (n2 - 1);
        df = Math.floor(dfNum / dfDenom);
        break;
    }
    
    // Calculate p-value
    let pValue;
    const isZTest = selectedCase === 'z-test';
    
    if (isZTest) {
      switch (hypothesisType) {
        case 'left':
          pValue = jStat.normal.cdf(statistic, 0, 1);
          break;
        case 'right':
          pValue = 1 - jStat.normal.cdf(statistic, 0, 1);
          break;
        case 'two':
          pValue = 2 * (1 - jStat.normal.cdf(Math.abs(statistic), 0, 1));
          break;
      }
    } else {
      switch (hypothesisType) {
        case 'left':
          pValue = jStat.studentt.cdf(statistic, df);
          break;
        case 'right':
          pValue = 1 - jStat.studentt.cdf(statistic, df);
          break;
        case 'two':
          pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(statistic), df));
          break;
      }
    }
    
    return { n1, n2, statistic, pValue, se, df };
  };

  const results = [0.5, 1, 2, 5, 10].map(mult => ({
    multiplier: mult,
    ...calculateForSampleSize(mult)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-neutral-800/50 rounded-lg p-4">
        <h4 className="text-base font-semibold text-white mb-3">
          Sample Size Effects on Test Results
        </h4>
        
        {/* Sample Size Slider */}
        <div className="mb-6">
          <label className="text-sm text-neutral-400 mb-2 block">
            Sample Size Multiplier: {sampleSizeMultiplier}x
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={sampleSizeMultiplier}
            onChange={(e) => setSampleSizeMultiplier(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>0.5x</span>
            <span>1x (original)</span>
            <span>10x</span>
          </div>
        </div>
        
        {/* Current Result */}
        <div className="p-4 bg-neutral-900/50 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-400">Sample Sizes:</span>
              <span className="font-mono text-white ml-2">
                n₁={Math.round(baseStats.group1.n * sampleSizeMultiplier)}, 
                n₂={Math.round(baseStats.group2.n * sampleSizeMultiplier)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Test Statistic:</span>
              <span className="font-mono text-purple-400 ml-2">
                {calculateForSampleSize(sampleSizeMultiplier).statistic.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">P-Value:</span>
              <span className="font-mono text-purple-400 ml-2">
                {calculateForSampleSize(sampleSizeMultiplier).pValue.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Decision:</span>
              <span className={cn(
                "font-semibold ml-2",
                calculateForSampleSize(sampleSizeMultiplier).pValue < significanceLevel
                  ? "text-red-400" : "text-green-400"
              )}>
                {calculateForSampleSize(sampleSizeMultiplier).pValue < significanceLevel
                  ? "Reject H₀" : "Fail to Reject"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-2 text-neutral-400">Multiplier</th>
                <th className="text-left p-2 text-neutral-400">n₁, n₂</th>
                <th className="text-left p-2 text-neutral-400">Test Stat</th>
                <th className="text-left p-2 text-neutral-400">P-Value</th>
                <th className="text-left p-2 text-neutral-400">Decision</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => (
                <tr key={i} className="border-b border-neutral-800">
                  <td className="p-2 font-mono">{result.multiplier}x</td>
                  <td className="p-2 font-mono text-xs">{result.n1}, {result.n2}</td>
                  <td className="p-2 font-mono text-purple-300">{result.statistic.toFixed(3)}</td>
                  <td className="p-2 font-mono text-purple-300">
                    {result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4)}
                  </td>
                  <td className={cn(
                    "p-2 font-semibold",
                    result.pValue < significanceLevel ? "text-red-400" : "text-green-400"
                  )}>
                    {result.pValue < significanceLevel ? "Reject" : "Fail to Reject"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
        <h5 className="font-semibold text-purple-300 mb-2">Key Insight</h5>
        <p className="text-sm text-neutral-300">
          The same effect size (difference in means) can lead to different statistical 
          conclusions depending on sample size. Larger samples provide more power to 
          detect small differences, but statistical significance doesn't always mean 
          practical significance!
        </p>
      </div>
    </div>
  );
}