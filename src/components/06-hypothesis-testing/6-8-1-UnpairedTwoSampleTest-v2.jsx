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
  ChevronRight, RefreshCw, ArrowRight, Info,
  Sparkles, TrendingUp, BarChart3, Zap
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
    icon: GitBranch,
    unlocks: ['decision-tree-viz', 'test-selector']
  },
  {
    id: 'data-visualization',
    title: 'Part B: Visualize Your Data',
    description: 'Compare the two groups visually',
    icon: Activity,
    unlocks: ['dual-distributions', 'data-table']
  },
  {
    id: 'test-calculation',
    title: 'Part C: Calculate Test Statistic',
    description: 'Apply the selected test method',
    icon: Calculator,
    unlocks: ['test-statistic-calc', 'variance-comparison']
  },
  {
    id: 'decision-making',
    title: 'Part D: Make a Decision',
    description: 'Use critical values and p-values',
    icon: TrendingUp,
    unlocks: ['critical-value-viz', 'p-value-viz']
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
    description: 'If ratio of variances exceeds 3:1, use Welch\'s test',
    category: 'pattern'
  },
  {
    id: 'sample-size-effect',
    title: 'Sample Size Impact',
    description: 'Same effect size can lead to different conclusions with different n',
    category: 'pattern'
  }
];

// LaTeX formula display component
const FormulaDisplay = React.memo(({ formula, className = "" }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current]);
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [formula]);
  
  return (
    <span ref={ref} className={className}>
      <span dangerouslySetInnerHTML={{ __html: formula }} />
    </span>
  );
});

FormulaDisplay.displayName = 'FormulaDisplay';

// Decision Tree Component with animations
const DecisionTreeNavigator = memo(({ selectedCase, onSelectCase, isUnlocked }) => {
  const [hoveredPath, setHoveredPath] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    if (!isUnlocked) return;
    
    const phases = [
      { delay: 0, phase: 1 },
      { delay: 300, phase: 2 },
      { delay: 600, phase: 3 }
    ];
    
    phases.forEach(({ delay, phase }) => {
      setTimeout(() => setAnimationPhase(phase), delay);
    });
  }, [isUnlocked]);

  if (!isUnlocked) return null;

  return (
    <div className="relative p-8 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/10 rounded-xl border border-purple-700/30 overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #8b5cf6 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #8b5cf6 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <GitBranch className="w-6 h-6" />
          </motion.div>
          Test Selection Decision Tree
        </h4>
        
        {/* Root Question */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: animationPhase >= 1 ? 1 : 0, scale: animationPhase >= 1 ? 1 : 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block p-6 bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl border border-neutral-700 backdrop-blur-sm shadow-2xl">
            <p className="text-lg text-white font-semibold">
              Are population variances <FormulaDisplay formula="\\(\\sigma_1^2\\)" /> and <FormulaDisplay formula="\\(\\sigma_2^2\\)" /> known?
            </p>
          </div>
        </motion.div>

        {/* Animated connection lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          <defs>
            <linearGradient id="gradient-yes" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient-no" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 50% 140 Q 30% 170 25% 220"
            stroke="url(#gradient-yes)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationPhase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M 50% 140 Q 70% 170 75% 220"
            stroke="url(#gradient-no)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationPhase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Branches */}
        <div className="grid grid-cols-2 gap-8 mt-20">
          {/* Yes Branch */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: animationPhase >= 2 ? 1 : 0, x: animationPhase >= 2 ? 0 : -50 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => onSelectCase('z-test')}
              onMouseEnter={() => setHoveredPath('z-test')}
              onMouseLeave={() => setHoveredPath(null)}
              className={cn(
                "w-full p-6 rounded-xl transition-all duration-300 text-left relative overflow-hidden group",
                selectedCase === 'z-test' 
                  ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500 shadow-xl shadow-purple-500/20" 
                  : "bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/50"
              )}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
                initial={false}
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <motion.span 
                    className="text-green-400 font-bold text-lg"
                    animate={hoveredPath === 'z-test' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    Yes →
                  </motion.span>
                  <span className="text-white font-bold text-lg">Case 1: Z-test</span>
                </div>
                <p className="text-sm text-neutral-300 mb-3">Use known population standard deviations</p>
                <div className="p-3 bg-neutral-900/50 rounded-lg">
                  <FormulaDisplay 
                    formula="\\(Z = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}}\\)" 
                    className="text-purple-300 text-sm"
                  />
                </div>
                {selectedCase === 'z-test' && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                )}
              </div>
            </button>
          </motion.div>

          {/* No Branch */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: animationPhase >= 2 ? 1 : 0, x: animationPhase >= 2 ? 0 : 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="text-red-400 font-bold text-lg mb-2">No ↓</div>
            
            <motion.div 
              className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationPhase >= 3 ? 1 : 0, y: animationPhase >= 3 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-white mb-4 font-semibold">Are variances assumed equal?</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => onSelectCase('pooled-t')}
                  onMouseEnter={() => setHoveredPath('pooled-t')}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={cn(
                    "w-full p-4 rounded-lg transition-all duration-300 text-left relative overflow-hidden group",
                    selectedCase === 'pooled-t' 
                      ? "bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-2 border-purple-500" 
                      : "bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50"
                  )}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 text-sm">Yes →</span>
                      <span className="text-white font-semibold">Case 2: Pooled t-test</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-2">Equal variances assumed</p>
                    <div className="p-2 bg-neutral-900/50 rounded text-xs">
                      <FormulaDisplay formula="\\(t = \\frac{\\bar{X}_1 - \\bar{X}_2}{S_p\\sqrt{1/n_1 + 1/n_2}}\\)" />
                    </div>
                    {selectedCase === 'pooled-t' && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => onSelectCase('welch-t')}
                  onMouseEnter={() => setHoveredPath('welch-t')}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={cn(
                    "w-full p-4 rounded-lg transition-all duration-300 text-left relative overflow-hidden group",
                    selectedCase === 'welch-t' 
                      ? "bg-gradient-to-br from-purple-600/30 to-orange-600/30 border-2 border-purple-500" 
                      : "bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50"
                  )}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 text-sm">No →</span>
                      <span className="text-white font-semibold">Case 3: Welch's t-test</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-2">Unequal variances (default)</p>
                    <div className="p-2 bg-neutral-900/50 rounded text-xs">
                      <FormulaDisplay formula="\\(t = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{S_1^2/n_1 + S_2^2/n_2}}\\)" />
                    </div>
                    {selectedCase === 'welch-t' && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Selected Case Info with animation */}
        <AnimatePresence mode="wait">
          {selectedCase && (
            <motion.div
              key={selectedCase}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/50 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className="p-2 bg-purple-600/20 rounded-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Info className="w-5 h-5 text-purple-400" />
                </motion.div>
                <div className="flex-1">
                  <h5 className="font-bold text-purple-300 mb-2">
                    {selectedCase === 'z-test' && "Z-test: When Population Variances Are Known"}
                    {selectedCase === 'pooled-t' && "Pooled t-test: When Variances Are Equal"}
                    {selectedCase === 'welch-t' && "Welch's t-test: The Safe Default Choice"}
                  </h5>
                  <p className="text-sm text-neutral-300">
                    {selectedCase === 'z-test' && "Use when σ₁ and σ₂ are known from previous studies or large historical datasets. Common in quality control with established processes."}
                    {selectedCase === 'pooled-t' && "Use when you have reason to believe the two populations have similar variability. Check that the variance ratio is less than 3:1."}
                    {selectedCase === 'welch-t' && "The most conservative choice. Use when variances might be different or when you're unsure. Most statistical software uses this as default."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

DecisionTreeNavigator.displayName = 'DecisionTreeNavigator';

// Enhanced Dual Distribution Visualization with proper D3 patterns
const DualDistributionViz = memo(({ group1Stats, group2Stats, testCase }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const isInitialized = useRef(false);
  const animationRef = useRef(null);
  const glowRef = useRef(0);
  
  // Store D3 selections as refs
  const elementsRef = useRef({
    svg: null,
    mainGroup: null,
    group1Area: null,
    group1Line: null,
    group2Area: null,
    group2Line: null,
    xAxis: null,
    yAxis: null,
    gridLinesX: null,
    gridLinesY: null,
    meanLine1: null,
    meanLine2: null,
    labels: null,
    diffAnnotation: null
  });
  
  // Initialize visualization once
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`);
    
    svgRef.current = svg.node();
    elementsRef.current.svg = svg;
    
    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Group 1 gradient with animation
    const gradient1 = defs.append('linearGradient')
      .attr('id', 'dist-gradient-1')
      .attr('x1', '0%').attr('x2', '0%')
      .attr('y1', '0%').attr('y2', '100%');
    
    gradient1.append('stop')
      .attr('offset', '0%')
      .attr('class', 'gradient-stop-1')
      .attr('stop-color', colorScheme.chart.primary)
      .attr('stop-opacity', 0.8);
    
    gradient1.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScheme.chart.primary)
      .attr('stop-opacity', 0.1);
    
    // Group 2 gradient
    const gradient2 = defs.append('linearGradient')
      .attr('id', 'dist-gradient-2')
      .attr('x1', '0%').attr('x2', '0%')
      .attr('y1', '0%').attr('y2', '100%');
    
    gradient2.append('stop')
      .attr('offset', '0%')
      .attr('class', 'gradient-stop-2')
      .attr('stop-color', colorScheme.chart.accent)
      .attr('stop-opacity', 0.8);
    
    gradient2.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScheme.chart.accent)
      .attr('stop-opacity', 0.1);
    
    // Glow filters
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // Create main group
    const g = svg.append('g');
    elementsRef.current.mainGroup = g;
    
    // Create grid lines groups
    elementsRef.current.gridLinesX = g.append('g').attr('class', 'grid-x');
    elementsRef.current.gridLinesY = g.append('g').attr('class', 'grid-y');
    
    // Create axes groups
    elementsRef.current.xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`);
    
    elementsRef.current.yAxis = g.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`);
    
    // Create area and line elements for both groups
    elementsRef.current.group1Area = g.append('path')
      .attr('class', 'area-1')
      .attr('fill', 'url(#dist-gradient-1)')
      .attr('opacity', 0);
    
    elementsRef.current.group1Line = g.append('path')
      .attr('class', 'line-1')
      .attr('fill', 'none')
      .attr('stroke', colorScheme.chart.primary)
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .attr('opacity', 0);
    
    elementsRef.current.group2Area = g.append('path')
      .attr('class', 'area-2')
      .attr('fill', 'url(#dist-gradient-2)')
      .attr('opacity', 0);
    
    elementsRef.current.group2Line = g.append('path')
      .attr('class', 'line-2')
      .attr('fill', 'none')
      .attr('stroke', colorScheme.chart.accent)
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .attr('opacity', 0);
    
    // Mean lines
    elementsRef.current.meanLine1 = g.append('line')
      .attr('class', 'mean-1')
      .attr('stroke', colorScheme.chart.primary)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')
      .attr('opacity', 0);
    
    elementsRef.current.meanLine2 = g.append('line')
      .attr('class', 'mean-2')
      .attr('stroke', colorScheme.chart.accent)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')
      .attr('opacity', 0);
    
    // Labels group
    elementsRef.current.labels = g.append('g').attr('class', 'labels');
    
    // Difference annotation
    elementsRef.current.diffAnnotation = g.append('text')
      .attr('class', 'diff-annotation')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0);
    
    isInitialized.current = true;
  }, []);
  
  // Update visualization when data changes
  useEffect(() => {
    if (!isInitialized.current || !group1Stats || !group2Stats || !containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
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
    
    // Update axes with animation
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    elementsRef.current.xAxis
      .transition()
      .duration(750)
      .call(xAxis);
    
    elementsRef.current.yAxis
      .transition()
      .duration(750)
      .call(yAxis);
    
    // Update grid lines
    const xGridLines = d3.axisBottom(xScale)
      .ticks(8)
      .tickSize(-height + margin.top + margin.bottom)
      .tickFormat('');
    
    const yGridLines = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat('');
    
    elementsRef.current.gridLinesX
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .transition()
      .duration(750)
      .call(xGridLines);
    
    elementsRef.current.gridLinesY
      .attr('transform', `translate(${margin.left},0)`)
      .transition()
      .duration(750)
      .call(yGridLines);
    
    // Style grid lines
    elementsRef.current.svg.selectAll('.grid-x line, .grid-y line')
      .attr('stroke', '#374151')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '2,2');
    
    // Generate distribution data
    const generateDistData = (stats) => {
      return d3.range(xMin, xMax, (xMax - xMin) / 200).map(x => ({
        x: x,
        y: jStat.normal.pdf(x, stats.mean, stats.sd)
      }));
    };
    
    const data1 = generateDistData(group1Stats);
    const data2 = generateDistData(group2Stats);
    
    // Create area and line generators
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Animate distributions with stagger
    elementsRef.current.group1Area
      .transition()
      .duration(1000)
      .attr('d', area(data1))
      .attr('opacity', 0.6);
    
    elementsRef.current.group1Line
      .transition()
      .duration(1000)
      .attr('d', line(data1))
      .attr('opacity', 1);
    
    elementsRef.current.group2Area
      .transition()
      .duration(1000)
      .delay(200)
      .attr('d', area(data2))
      .attr('opacity', 0.6);
    
    elementsRef.current.group2Line
      .transition()
      .duration(1000)
      .delay(200)
      .attr('d', line(data2))
      .attr('opacity', 1);
    
    // Update mean lines with animation
    elementsRef.current.meanLine1
      .transition()
      .duration(1000)
      .attr('x1', xScale(group1Stats.mean))
      .attr('x2', xScale(group1Stats.mean))
      .attr('y1', yScale(0))
      .attr('y2', yScale(0.4))
      .attr('opacity', 0.8);
    
    elementsRef.current.meanLine2
      .transition()
      .duration(1000)
      .delay(200)
      .attr('x1', xScale(group2Stats.mean))
      .attr('x2', xScale(group2Stats.mean))
      .attr('y1', yScale(0))
      .attr('y2', yScale(0.4))
      .attr('opacity', 0.8);
    
    // Update labels with fade effect
    const labels = elementsRef.current.labels;
    labels.selectAll('.mean-label').remove();
    
    // Group 1 label
    labels.append('text')
      .attr('class', 'mean-label')
      .attr('x', xScale(group1Stats.mean))
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', colorScheme.chart.primary)
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text(`${group1Stats.label}: μ̂=${group1Stats.mean.toFixed(2)}`)
      .transition()
      .duration(1000)
      .attr('opacity', 1);
    
    // Group 2 label
    labels.append('text')
      .attr('class', 'mean-label')
      .attr('x', xScale(group2Stats.mean))
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', colorScheme.chart.accent)
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text(`${group2Stats.label}: μ̂=${group2Stats.mean.toFixed(2)}`)
      .transition()
      .duration(1000)
      .delay(200)
      .attr('opacity', 1);
    
    // Update difference annotation
    const diff = Math.abs(group1Stats.mean - group2Stats.mean);
    elementsRef.current.diffAnnotation
      .attr('x', width / 2)
      .attr('y', height - 15)
      .transition()
      .duration(1000)
      .delay(400)
      .attr('opacity', 1)
      .text(`Difference: |μ̂₁ - μ̂₂| = ${diff.toFixed(2)}`);
    
    // Add continuous glow animation
    const animateGlow = () => {
      glowRef.current += 0.02;
      const glowIntensity = (Math.sin(glowRef.current) + 1) / 2;
      
      elementsRef.current.group1Line
        .attr('stroke-opacity', 0.8 + glowIntensity * 0.2);
      
      elementsRef.current.group2Line
        .attr('stroke-opacity', 0.8 + glowIntensity * 0.2);
      
      // Animate gradient stops
      elementsRef.current.svg.select('.gradient-stop-1')
        .attr('stop-opacity', 0.7 + glowIntensity * 0.3);
      
      elementsRef.current.svg.select('.gradient-stop-2')
        .attr('stop-opacity', 0.7 + glowIntensity * 0.3);
      
      animationRef.current = requestAnimationFrame(animateGlow);
    };
    
    animateGlow();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [group1Stats, group2Stats]);
  
  return (
    <div ref={containerRef} className="w-full h-[400px]" />
  );
});

DualDistributionViz.displayName = 'DualDistributionViz';

// Enhanced slider component with visual polish
const AnimatedSlider = ({ label, value, onChange, min, max, step, unit = "", icon: Icon }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          {Icon && (
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-4 h-4 text-purple-400" />
            </motion.div>
          )}
          {label}
        </label>
        <motion.span 
          className="text-lg font-mono font-bold text-purple-400"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </motion.span>
      </div>
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track background */}
        <div className="absolute inset-0 h-3 bg-neutral-700 rounded-full overflow-hidden">
          {/* Animated fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%]"
            initial={{ width: 0 }}
            animate={{ 
              width: `${percentage}%`,
              backgroundPosition: isHovered ? "100% 0" : "0% 0"
            }}
            transition={{ 
              width: { duration: 0.3 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>
        
        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer z-10 
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 
                     [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500
                     [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                     [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-purple-500/50
                     [&::-webkit-slider-thumb]:hover:shadow-xl"
        />
        
        {/* Value indicator on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute -top-8 bg-purple-600 text-white text-xs px-2 py-1 rounded pointer-events-none"
              style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {value.toFixed(step < 1 ? 1 : 0)}{unit}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// Memoized group stats calculation
const useGroupStats = (data, label, knownSigma) => {
  return React.useMemo(() => {
    const n = data.length;
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const sd = knownSigma || Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    
    return { n, mean, variance, sd, se, label };
  }, [data, label, knownSigma]);
};

// Memoized test result calculation
const useTestResult = (selectedCase, group1Stats, group2Stats) => {
  return React.useMemo(() => {
    const diff = group1Stats.mean - group2Stats.mean;
    
    switch (selectedCase) {
      case 'z-test':
        const seZ = Math.sqrt(
          Math.pow(group1Stats.sd, 2) / group1Stats.n + 
          Math.pow(group2Stats.sd, 2) / group2Stats.n
        );
        return { statistic: diff / seZ, df: null, se: seZ };
        
      case 'pooled-t':
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
      
      default:
        return { statistic: 0, df: null, se: 0 };
    }
  }, [selectedCase, group1Stats, group2Stats]);
};

// Main Component
export default function UnpairedTwoSampleTest() {
  // State management
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [selectedExample, setSelectedExample] = useState('income');
  const [selectedCase, setSelectedCase] = useState('z-test');
  const [hypothesisType, setHypothesisType] = useState('two');
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showFocusedView, setShowFocusedView] = useState(false);
  const [activeStageDetail, setActiveStageDetail] = useState(null);

  // Discovery tracking
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions);

  // Get current example data
  const example = EXAMPLES[selectedExample];
  const group1Data = example.group1.data;
  const group2Data = example.group2.data;

  // Calculate statistics with memoization
  const group1Stats = useGroupStats(group1Data, example.group1.label, example.group1.knownSigma);
  const group2Stats = useGroupStats(group2Data, example.group2.label, example.group2.knownSigma);

  // Calculate test statistics with memoization
  const testResult = useTestResult(selectedCase, group1Stats, group2Stats);

  // Get critical values
  const criticalValues = React.useMemo(() => {
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
  }, [selectedCase, testResult.df, significanceLevel, hypothesisType]);

  // Calculate p-value
  const pValue = React.useMemo(() => {
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
      switch (hypothesisType) {
        case 'left':
          return jStat.studentt.cdf(stat, testResult.df);
        case 'right':
          return 1 - jStat.studentt.cdf(stat, testResult.df);
        case 'two':
          return 2 * (1 - jStat.studentt.cdf(Math.abs(stat), testResult.df));
      }
    }
  }, [testResult.statistic, testResult.df, selectedCase, hypothesisType]);

  // Stage management functions
  const isStageUnlocked = useCallback((stageId) => {
    const index = LEARNING_STAGES.findIndex(s => s.id === stageId);
    return index === 0 || completedStages.includes(LEARNING_STAGES[index - 1].id);
  }, [completedStages]);

  const isFeatureUnlocked = useCallback((featureId) => {
    return LEARNING_STAGES.some(stage => 
      completedStages.includes(stage.id) && stage.unlocks.includes(featureId)
    );
  }, [completedStages]);

  const completeStage = useCallback(() => {
    const stage = LEARNING_STAGES[currentStage];
    if (!completedStages.includes(stage.id)) {
      setCompletedStages([...completedStages, stage.id]);
      
      if (currentStage < LEARNING_STAGES.length - 1) {
        setCurrentStage(currentStage + 1);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1500);
      }
    }
  }, [currentStage, completedStages]);

  // Progress calculation
  const totalDiscoveries = discoveryDefinitions.length;
  const discoveredCount = discoveries.length;
  const progress = (discoveredCount / totalDiscoveries) * 100;

  return (
    <VisualizationContainer
      title="Unpaired Two-Sample Test"
      description="Compare means from two independent groups with different variance assumptions"
    >
      {/* Progress Bar with animation */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProgressBar 
          value={progress} 
          max={100}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-neutral-400">
          <motion.span
            key={discoveredCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {discoveredCount} / {totalDiscoveries} concepts discovered
          </motion.span>
          <motion.span
            key={completedStages.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {completedStages.length} / {LEARNING_STAGES.length} stages completed
          </motion.span>
        </div>
      </motion.div>

      {/* Example Selector with enhanced visuals */}
      <VisualizationSection className="mb-6 p-0 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FlaskConical className="w-6 h-6 text-purple-400" />
            </motion.div>
            Select Example Dataset
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(EXAMPLES).map(([key, ex]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedExample(key);
                  setSelectedCase(ex.group1.knownSigma ? 'z-test' : 'pooled-t');
                }}
                className={cn(
                  "p-6 rounded-xl transition-all duration-300 text-left relative overflow-hidden group",
                  selectedExample === key
                    ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500 shadow-xl shadow-purple-500/20"
                    : "bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/50"
                )}
              >
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className={cn(
                        "p-2 rounded-lg",
                        selectedExample === key 
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-neutral-700"
                      )}
                      animate={selectedExample === key ? { rotate: 360 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <FlaskConical className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="font-bold text-lg text-white">{ex.name}</span>
                  </div>
                  <p className="text-sm text-neutral-300 mb-3">{ex.context}</p>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{ex.group1.label}: n={ex.group1.data.length}</span>
                    <span>{ex.group2.label}: n={ex.group2.data.length}</span>
                  </div>
                  {selectedExample === key && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </VisualizationSection>

      {/* Focus Mode Toggle */}
      <motion.div 
        className="mb-6 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setShowFocusedView(!showFocusedView)}
          variant="outline"
          className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-700 hover:border-purple-500 group"
        >
          <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
          {showFocusedView ? "Show All Stages" : "Focus Mode"}
        </Button>
      </motion.div>

      {/* Main Content with Focus Mode */}
      <AnimatePresence mode="wait">
        {showFocusedView && activeStageDetail ? (
          <motion.div
            key="focused"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <Button
              onClick={() => setActiveStageDetail(null)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Overview
            </Button>
            
            <VisualizationSection className="min-h-[600px]">
              {renderStageContent(activeStageDetail)}
            </VisualizationSection>
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {LEARNING_STAGES.map((stage, index) => {
              const isUnlocked = isStageUnlocked(stage.id);
              const isActive = index === currentStage;
              const isCompleted = completedStages.includes(stage.id);
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ 
                    opacity: isUnlocked ? 1 : 0.5, 
                    x: 0,
                    scale: isActive && showAnimation ? [1, 1.02, 1] : 1
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    scale: { duration: 0.5 }
                  }}
                >
                  <VisualizationSection
                    className={cn(
                      "transition-all duration-500 relative overflow-hidden",
                      !isUnlocked && "opacity-50 pointer-events-none",
                      isActive && "ring-2 ring-purple-500 ring-opacity-50"
                    )}
                  >
                    {/* Active stage background effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg",
                              isCompleted ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white" :
                              isActive ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
                              isUnlocked ? "bg-neutral-700 text-neutral-300" :
                              "bg-neutral-800 text-neutral-500"
                            )}
                            animate={isActive && !isCompleted ? { 
                              boxShadow: [
                                "0 0 20px rgba(139, 92, 246, 0.5)",
                                "0 0 40px rgba(139, 92, 246, 0.8)",
                                "0 0 20px rgba(139, 92, 246, 0.5)"
                              ]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                ✓
                              </motion.div>
                            ) : (
                              <Icon className="w-6 h-6" />
                            )}
                          </motion.div>
                          <div>
                            <h3 className={cn(
                              "text-xl font-bold",
                              isUnlocked ? "text-white" : "text-neutral-500"
                            )}>
                              {stage.title}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-1">{stage.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {isUnlocked && !showFocusedView && (
                            <Button
                              onClick={() => {
                                setActiveStageDetail(stage.id);
                                setShowFocusedView(true);
                              }}
                              variant="outline"
                              className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-700 hover:border-purple-500"
                            >
                              View Details
                            </Button>
                          )}
                          {isActive && !isCompleted && (
                            <Button
                              onClick={completeStage}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg group"
                            >
                              Complete Stage
                              <motion.div
                                className="ml-2"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </motion.div>
                            </Button>
                          )}
                        </div>
                      </div>

                      {isUnlocked && !showFocusedView && (
                        <motion.div 
                          className="mt-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {renderStageContent(stage.id)}
                        </motion.div>
                      )}
                    </div>
                  </VisualizationSection>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mathematical Discoveries */}
      {discoveries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MathematicalDiscoveries 
            discoveries={discoveries}
            title="Two-Sample Test Concepts"
            className="mt-6"
          />
        </motion.div>
      )}

      {/* Summary Table with enhanced visuals */}
      {completedStages.length === LEARNING_STAGES.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <VisualizationSection className="mt-6 p-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Two-Sample Test Decision Framework
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left p-4 text-neutral-400 font-semibold">Case</th>
                      <th className="text-left p-4 text-neutral-400 font-semibold">When to Use</th>
                      <th className="text-left p-4 text-neutral-400 font-semibold">Test Statistic</th>
                      <th className="text-left p-4 text-neutral-400 font-semibold">Distribution</th>
                      <th className="text-left p-4 text-neutral-400 font-semibold">Key Assumption</th>
                    </tr>
                  </thead>
                  <tbody>
                    <motion.tr 
                      className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <td className="p-4 text-white font-bold">Z-test</td>
                      <td className="p-4 text-neutral-300">σ₁, σ₂ known</td>
                      <td className="p-4">
                        <FormulaDisplay 
                          formula="\\(Z = \\frac{\\bar{X}_1-\\bar{X}_2}{\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}}\\)" 
                          className="text-purple-300 text-xs"
                        />
                      </td>
                      <td className="p-4 text-neutral-300">N(0,1)</td>
                      <td className="p-4 text-neutral-300">Population SDs known</td>
                    </motion.tr>
                    <motion.tr 
                      className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <td className="p-4 text-white font-bold">Pooled t-test</td>
                      <td className="p-4 text-neutral-300">σ₁=σ₂ unknown</td>
                      <td className="p-4">
                        <FormulaDisplay 
                          formula="\\(t = \\frac{\\bar{X}_1-\\bar{X}_2}{S_p\\sqrt{1/n_1+1/n_2}}\\)" 
                          className="text-purple-300 text-xs"
                        />
                      </td>
                      <td className="p-4 text-neutral-300">t(n₁+n₂-2)</td>
                      <td className="p-4 text-neutral-300">Equal variances</td>
                    </motion.tr>
                    <motion.tr 
                      className="hover:bg-neutral-800/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <td className="p-4 text-white font-bold">Welch's t-test</td>
                      <td className="p-4 text-neutral-300">σ₁≠σ₂ unknown</td>
                      <td className="p-4">
                        <FormulaDisplay 
                          formula="\\(t = \\frac{\\bar{X}_1-\\bar{X}_2}{\\sqrt{S_1^2/n_1+S_2^2/n_2}}\\)" 
                          className="text-purple-300 text-xs"
                        />
                      </td>
                      <td className="p-4 text-neutral-300">t(df*)</td>
                      <td className="p-4 text-neutral-300">Unequal variances</td>
                    </motion.tr>
                  </tbody>
                </table>
              </div>
              
              <motion.div 
                className="mt-6 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-bold text-purple-300 mb-3 text-lg">Practical Guidelines</h4>
                <ul className="text-sm text-neutral-300 space-y-2 list-disc list-inside">
                  <li>When in doubt, use Welch's test (more conservative)</li>
                  <li>Check variance ratio: if S₁²/S₂² {'>'} 3, avoid pooling</li>
                  <li>Large samples (n {'>'} 30) make methods converge</li>
                  <li>Always report which method was used</li>
                </ul>
              </motion.div>
            </div>
          </VisualizationSection>
        </motion.div>
      )}
    </VisualizationContainer>
  );

  // Render stage content based on stage ID
  function renderStageContent(stageId) {
    switch (stageId) {
      case 'decision-tree':
        return (
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
        );
      
      case 'data-visualization':
        return (
          <DataVisualization 
            group1Stats={group1Stats}
            group2Stats={group2Stats}
            example={example}
            isUnlocked={isFeatureUnlocked('dual-distributions')}
          />
        );
      
      case 'test-calculation':
        return (
          <TestCalculation
            selectedCase={selectedCase}
            testResult={testResult}
            group1Stats={group1Stats}
            group2Stats={group2Stats}
            markDiscovered={markDiscovered}
            discoveries={discoveries}
          />
        );
      
      case 'decision-making':
        return (
          <DecisionMaking
            testResult={testResult}
            criticalValues={criticalValues}
            pValue={pValue}
            hypothesisType={hypothesisType}
            setHypothesisType={setHypothesisType}
            significanceLevel={significanceLevel}
            setSignificanceLevel={setSignificanceLevel}
            selectedCase={selectedCase}
            markDiscovered={markDiscovered}
            discoveries={discoveries}
          />
        );
      
      default:
        return null;
    }
  }
}

// Component: Data Visualization with enhanced visuals
const DataVisualization = React.memo(({ group1Stats, group2Stats, example, isUnlocked }) => {
  if (!isUnlocked) return null;

  const varianceRatio = Math.max(
    group1Stats.variance / group2Stats.variance,
    group2Stats.variance / group1Stats.variance
  );

  return (
    <div className="space-y-6">
      {/* Dual Distribution Plot */}
      <GraphContainer className="h-[400px] p-0 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-400" />
            Distribution Comparison
          </h4>
        </div>
        <div className="p-4">
          <DualDistributionViz 
            group1Stats={group1Stats} 
            group2Stats={group2Stats}
          />
        </div>
      </GraphContainer>

      {/* Summary Statistics Table with enhanced visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group 1 Stats */}
        <motion.div 
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h5 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {group1Stats.label}
          </h5>
          <div className="space-y-3">
            {[
              { label: "Sample Size", key: "n", value: group1Stats.n, icon: "📊" },
              { label: "Mean", key: "mean", value: group1Stats.mean.toFixed(2), unit: example.unit, icon: "📈" },
              { label: "Std Dev", key: "sd", value: group1Stats.sd.toFixed(2), unit: example.unit, icon: "📉" },
              { label: "Variance", key: "variance", value: group1Stats.variance.toFixed(2), icon: "🎯" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.key}
                className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg group hover:bg-neutral-800/70 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm text-neutral-400 flex items-center gap-2">
                  <span className="text-lg group-hover:animate-bounce">{stat.icon}</span>
                  {stat.label}:
                </span>
                <motion.span 
                  className="font-mono text-white font-semibold"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}{stat.unit || ""}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Group 2 Stats */}
        <motion.div 
          className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-700/30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h5 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full bg-pink-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            {group2Stats.label}
          </h5>
          <div className="space-y-3">
            {[
              { label: "Sample Size", key: "n", value: group2Stats.n, icon: "📊" },
              { label: "Mean", key: "mean", value: group2Stats.mean.toFixed(2), unit: example.unit, icon: "📈" },
              { label: "Std Dev", key: "sd", value: group2Stats.sd.toFixed(2), unit: example.unit, icon: "📉" },
              { label: "Variance", key: "variance", value: group2Stats.variance.toFixed(2), icon: "🎯" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.key}
                className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg group hover:bg-neutral-800/70 transition-colors"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm text-neutral-400 flex items-center gap-2">
                  <span className="text-lg group-hover:animate-bounce">{stat.icon}</span>
                  {stat.label}:
                </span>
                <motion.span 
                  className="font-mono text-white font-semibold"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}{stat.unit || ""}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Variance Ratio Check with visual indicator */}
      <motion.div 
        className={cn(
          "p-6 rounded-xl border-2 transition-all duration-300",
          varianceRatio > 3 
            ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/50" 
            : "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/50"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-bold text-white">Variance Ratio Check</h5>
          <motion.div 
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold",
              varianceRatio > 3 
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400" 
                : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400"
            )}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ratio: {varianceRatio.toFixed(2)}
          </motion.div>
        </div>
        
        {/* Visual ratio bar */}
        <div className="relative h-8 bg-neutral-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className={cn(
              "h-full",
              varianceRatio > 3 
                ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" 
                : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(varianceRatio / 5 * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Animated particles */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-bold text-white drop-shadow-lg">
              S₁²/S₂² = {varianceRatio.toFixed(2)}
            </span>
          </motion.div>
        </div>
        
        <p className={cn(
          "text-sm flex items-center gap-2",
          varianceRatio > 3 ? "text-yellow-300" : "text-green-300"
        )}>
          <motion.span
            animate={{ rotate: varianceRatio > 3 ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: varianceRatio > 3 ? Infinity : 0 }}
          >
            {varianceRatio > 3 ? "⚠️" : "✓"}
          </motion.span>
          {varianceRatio > 3
            ? "Variance ratio exceeds 3:1. Consider using Welch's test for more conservative results."
            : "Variance ratio is within acceptable range. Pooling variances is reasonable."}
        </p>
      </motion.div>
    </div>
  );
});

DataVisualization.displayName = 'DataVisualization';

// Component: Test Calculation with LaTeX and animations
const TestCalculation = React.memo(({ selectedCase, testResult, group1Stats, group2Stats, markDiscovered, discoveries }) => {
  const contentRef = useRef(null);
  
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
    
    // Process MathJax
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
  }, [selectedCase, discoveries, markDiscovered]);

  return (
    <div ref={contentRef} className="space-y-6">
      <motion.div 
        className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl p-8 border border-neutral-700 overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, purple 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "32px 32px"]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <motion.div 
              className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calculator className="w-6 h-6" />
            </motion.div>
            {selectedCase === 'z-test' && "Z-Test Calculation"}
            {selectedCase === 'pooled-t' && "Pooled t-Test Calculation"}
            {selectedCase === 'welch-t' && "Welch's t-Test Calculation"}
          </h4>
          
          {/* Show pooled variance calculation if applicable */}
          {selectedCase === 'pooled-t' && testResult.pooledVar && (
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h5 className="text-lg font-bold text-purple-300 mb-4">Step 1: Calculate Pooled Variance</h5>
              <div className="text-center space-y-4">
                <motion.div 
                  className="text-2xl text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[S_p^2 = \\frac{(n_1-1)S_1^2 + (n_2-1)S_2^2}{n_1 + n_2 - 2}\\]` 
                  }} />
                </motion.div>
                <motion.div 
                  className="text-lg text-neutral-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[= \\frac{(${group1Stats.n}-1) \\times ${group1Stats.variance.toFixed(2)} + (${group2Stats.n}-1) \\times ${group2Stats.variance.toFixed(2)}}{${group1Stats.n} + ${group2Stats.n} - 2}\\]` 
                  }} />
                </motion.div>
                <motion.div 
                  className="text-3xl font-mono font-bold text-purple-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <span dangerouslySetInnerHTML={{ __html: `\\(S_p^2 = ${testResult.pooledVar.toFixed(2)}\\)` }} />
                </motion.div>
                <motion.div 
                  className="text-lg text-neutral-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(S_p = ${Math.sqrt(testResult.pooledVar).toFixed(2)}\\)` 
                  }} />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Test Statistic Calculation */}
          <motion.div 
            className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h5 className="text-lg font-bold text-blue-300 mb-4">
              {selectedCase === 'pooled-t' ? "Step 2: " : ""}Calculate Test Statistic
            </h5>
            <div className="text-center space-y-6">
              <motion.div 
                className="text-2xl text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {selectedCase === 'z-test' && (
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[Z = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}}\\]` 
                  }} />
                )}
                {selectedCase === 'pooled-t' && (
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[t = \\frac{\\bar{X}_1 - \\bar{X}_2}{S_p\\sqrt{1/n_1 + 1/n_2}}\\]` 
                  }} />
                )}
                {selectedCase === 'welch-t' && (
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[t = \\frac{\\bar{X}_1 - \\bar{X}_2}{\\sqrt{S_1^2/n_1 + S_2^2/n_2}}\\]` 
                  }} />
                )}
              </motion.div>
              
              <div className="grid grid-cols-3 gap-6">
                <motion.div 
                  className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 rounded-lg p-4 border border-green-700/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-green-400 font-mono text-xl font-bold">
                    {group1Stats.mean.toFixed(2)} - {group2Stats.mean.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-2">Difference in Means</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-blue-800/30 to-cyan-800/30 rounded-lg p-4 border border-blue-700/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-blue-400 font-mono text-xl font-bold">
                    {testResult.se.toFixed(3)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-2">Standard Error</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg p-4 border border-purple-500/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
                >
                  <div className="text-purple-300 font-mono text-2xl font-bold">
                    {testResult.statistic.toFixed(3)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-2">Test Statistic</div>
                </motion.div>
              </div>
              
              {/* Standard Error Formula */}
              <motion.div 
                className="mt-6 p-4 bg-neutral-800/50 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-sm text-neutral-400 mb-2">Standard Error Formula:</div>
                <div className="text-lg text-white">
                  {selectedCase === 'z-test' && (
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(SE = \\sqrt{\\sigma_1^2/n_1 + \\sigma_2^2/n_2}\\)` 
                    }} />
                  )}
                  {selectedCase === 'pooled-t' && (
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(SE = S_p \\times \\sqrt{1/n_1 + 1/n_2}\\)` 
                    }} />
                  )}
                  {selectedCase === 'welch-t' && (
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(SE = \\sqrt{S_1^2/n_1 + S_2^2/n_2}\\)` 
                    }} />
                  )}
                </div>
              </motion.div>
              
              {/* Degrees of Freedom */}
              {testResult.df && (
                <motion.div 
                  className="text-lg flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-neutral-400">Degrees of Freedom:</span>
                  <motion.span 
                    className="font-mono text-yellow-400 font-bold text-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    df = {testResult.df}
                  </motion.span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

TestCalculation.displayName = 'TestCalculation';

// Component: Decision Making with enhanced visuals
const DecisionMaking = React.memo(({ 
  testResult, 
  criticalValues, 
  pValue, 
  hypothesisType, 
  setHypothesisType,
  significanceLevel,
  setSignificanceLevel,
  selectedCase,
  markDiscovered,
  discoveries 
}) => {
  const isZTest = selectedCase === 'z-test';
  const statName = isZTest ? 'Z' : 't';
  const vizRef = useRef(null);
  const isInitialized = useRef(false);
  const elementsRef = useRef({});
  
  // Determine decision
  const isRejected = React.useMemo(() => {
    switch (hypothesisType) {
      case 'left':
        return testResult.statistic < criticalValues.lower;
      case 'right':
        return testResult.statistic > criticalValues.upper;
      case 'two':
        return Math.abs(testResult.statistic) > criticalValues.upper;
    }
  }, [hypothesisType, testResult.statistic, criticalValues]);

  // Initialize visualization once
  useEffect(() => {
    if (!vizRef.current || isInitialized.current) return;
    
    const svg = d3.select(vizRef.current);
    const width = 600;
    const height = 300;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'dist-gradient-decision')
      .attr('x1', '0%').attr('x2', '0%')
      .attr('y1', '0%').attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);
    
    // Create main group
    const g = svg.append('g');
    
    // Create elements
    elementsRef.current = {
      mainGroup: g,
      xAxis: g.append('g').attr('class', 'x-axis'),
      distributionArea: g.append('path').attr('class', 'distribution-area'),
      distributionLine: g.append('path').attr('class', 'distribution-line'),
      criticalRegions: g.append('g').attr('class', 'critical-regions'),
      testStatLine: g.append('line').attr('class', 'test-stat-line'),
      testStatLabel: g.append('text').attr('class', 'test-stat-label'),
      criticalLines: g.append('g').attr('class', 'critical-lines'),
      labels: g.append('g').attr('class', 'labels')
    };
    
    isInitialized.current = true;
  }, []);

  // Update visualization
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([height - margin.bottom, margin.top]);
    
    // Update axis
    elementsRef.current.xAxis
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScale));
    
    // Generate distribution data
    const data = d3.range(-4, 4.01, 0.05).map(x => ({
      x: x,
      y: jStat.normal.pdf(x, 0, 1)
    }));
    
    // Area generator
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Update main distribution
    elementsRef.current.distributionArea
      .transition()
      .duration(500)
      .attr('fill', 'url(#dist-gradient-decision)')
      .attr('d', area(data));
    
    elementsRef.current.distributionLine
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line(data));
    
    // Clear and redraw critical regions
    const criticalRegions = elementsRef.current.criticalRegions;
    criticalRegions.selectAll('*').remove();
    
    const drawCriticalRegion = (start, end) => {
      const regionData = data.filter(d => d.x >= start && d.x <= end);
      criticalRegions.append('path')
        .datum(regionData)
        .attr('fill', '#ef4444')
        .attr('fill-opacity', 0)
        .attr('d', area)
        .transition()
        .duration(500)
        .attr('fill-opacity', 0.4);
    };
    
    // Draw regions based on hypothesis type
    if (hypothesisType === 'left' && criticalValues.lower) {
      drawCriticalRegion(-4, criticalValues.lower);
    } else if (hypothesisType === 'right' && criticalValues.upper) {
      drawCriticalRegion(criticalValues.upper, 4);
    } else if (hypothesisType === 'two') {
      if (criticalValues.lower) drawCriticalRegion(-4, criticalValues.lower);
      if (criticalValues.upper) drawCriticalRegion(criticalValues.upper, 4);
    }
    
    // Update critical value lines
    const criticalLines = elementsRef.current.criticalLines;
    criticalLines.selectAll('*').remove();
    
    const drawCriticalLine = (value) => {
      const g = criticalLines.append('g');
      
      g.append('line')
        .attr('x1', xScale(value))
        .attr('x2', xScale(value))
        .attr('y1', height - margin.bottom)
        .attr('y2', yScale(0.35))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
      
      g.append('text')
        .attr('x', xScale(value))
        .attr('y', margin.top)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-weight', 'bold')
        .text(`${value.toFixed(3)}`)
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    };
    
    if (criticalValues.lower) drawCriticalLine(criticalValues.lower);
    if (criticalValues.upper) drawCriticalLine(criticalValues.upper);
    
    // Update test statistic line
    elementsRef.current.testStatLine
      .transition()
      .duration(500)
      .attr('x1', xScale(testResult.statistic))
      .attr('x2', xScale(testResult.statistic))
      .attr('y1', height - margin.bottom)
      .attr('y2', yScale(0.35))
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 3);
    
    // Update test statistic label
    elementsRef.current.testStatLabel
      .transition()
      .duration(500)
      .attr('x', xScale(testResult.statistic))
      .attr('y', yScale(0.4))
      .attr('text-anchor', 'middle')
      .attr('fill', '#8b5cf6')
      .attr('font-weight', 'bold')
      .text(`${statName} = ${testResult.statistic.toFixed(3)}`);
    
  }, [hypothesisType, criticalValues, testResult, statName]);

  return (
    <div className="space-y-6">
      {/* Hypothesis Type Selection */}
      <motion.div 
        className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl p-6 border border-neutral-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-lg font-bold text-white mb-4">Select Alternative Hypothesis</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { 
              value: 'left', 
              label: 'Left-tailed', 
              formula: '\\(H_1: \\mu_1 < \\mu_2\\)',
              icon: '←',
              color: 'from-blue-600 to-cyan-600',
              description: 'Testing if first mean is less'
            },
            { 
              value: 'right', 
              label: 'Right-tailed', 
              formula: '\\(H_1: \\mu_1 > \\mu_2\\)',
              icon: '→',
              color: 'from-purple-600 to-pink-600',
              description: 'Testing if first mean is greater'
            },
            { 
              value: 'two', 
              label: 'Two-tailed', 
              formula: '\\(H_1: \\mu_1 \\neq \\mu_2\\)',
              icon: '↔',
              color: 'from-orange-600 to-red-600',
              description: 'Testing if means differ'
            }
          ].map(type => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHypothesisType(type.value)}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 relative overflow-hidden group",
                hypothesisType === type.value
                  ? "bg-gradient-to-br " + type.color + " text-white shadow-xl"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                initial={false}
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="text-3xl mb-2"
                  animate={hypothesisType === type.value ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {type.icon}
                </motion.div>
                <div className="font-bold mb-2">{type.label}</div>
                <FormulaDisplay formula={type.formula} className="text-sm mb-1" />
                <div className="text-xs opacity-80">{type.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Significance Level */}
      <motion.div 
        className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl p-6 border border-neutral-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-bold text-white mb-4">Significance Level (α)</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { 
              value: 0.01, 
              label: 'Very Strict', 
              desc: '1% chance of Type I error', 
              color: 'from-red-600 to-orange-600',
              icon: '🎯'
            },
            { 
              value: 0.05, 
              label: 'Standard', 
              desc: '5% chance of Type I error', 
              color: 'from-purple-600 to-pink-600',
              icon: '⚖️'
            },
            { 
              value: 0.10, 
              label: 'Lenient', 
              desc: '10% chance of Type I error', 
              color: 'from-blue-600 to-cyan-600',
              icon: '🎲'
            }
          ].map(alpha => (
            <motion.button
              key={alpha.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSignificanceLevel(alpha.value)}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 relative overflow-hidden group",
                significanceLevel === alpha.value
                  ? "bg-gradient-to-br " + alpha.color + " text-white shadow-xl"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                initial={false}
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="text-2xl mb-2"
                  animate={significanceLevel === alpha.value ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {alpha.icon}
                </motion.div>
                <div className="font-mono text-2xl font-bold mb-1">{alpha.value}</div>
                <div className="text-sm font-semibold mb-1">{alpha.label}</div>
                <div className="text-xs opacity-80">{alpha.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Critical Region Visualization */}
      <GraphContainer className="p-0 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <h4 className="text-lg font-bold text-white">Critical Region Visualization</h4>
        </div>
        <div className="p-4">
          <svg ref={vizRef} style={{ width: "100%", height: 300 }} />
        </div>
      </GraphContainer>

      {/* Decision Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Value Method */}
        <motion.div 
          className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h5 className="text-lg font-bold text-white mb-4">Critical Value Method</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
              <span className="text-sm text-neutral-400">Test Statistic:</span>
              <motion.span 
                className="font-mono text-purple-400 font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {statName} = {testResult.statistic.toFixed(3)}
              </motion.span>
            </div>
            <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
              <span className="text-sm text-neutral-400">Critical Value(s):</span>
              <span className="font-mono text-yellow-400 font-bold">
                {hypothesisType === 'two' 
                  ? `±${Math.abs(criticalValues.upper).toFixed(3)}`
                  : hypothesisType === 'left'
                  ? criticalValues.lower?.toFixed(3)
                  : criticalValues.upper?.toFixed(3)
                }
              </span>
            </div>
            <motion.div 
              className={cn(
                "mt-4 p-4 rounded-lg text-center font-bold text-lg",
                isRejected 
                  ? "bg-gradient-to-br from-red-600/30 to-orange-600/30 text-red-400 border border-red-500/50" 
                  : "bg-gradient-to-br from-green-600/30 to-emerald-600/30 text-green-400 border border-green-500/50"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {isRejected ? "Reject H₀" : "Fail to Reject H₀"}
            </motion.div>
          </div>
        </motion.div>

        {/* P-Value Method */}
        <motion.div 
          className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-xl p-6 border border-pink-700/30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h5 className="text-lg font-bold text-white mb-4">P-Value Method</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
              <span className="text-sm text-neutral-400">P-Value:</span>
              <motion.span 
                className="font-mono text-purple-400 font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4)}
              </motion.span>
            </div>
            <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
              <span className="text-sm text-neutral-400">Significance (α):</span>
              <span className="font-mono text-yellow-400 font-bold">{significanceLevel}</span>
            </div>
            <motion.div 
              className={cn(
                "mt-4 p-4 rounded-lg text-center font-bold text-lg",
                pValue < significanceLevel 
                  ? "bg-gradient-to-br from-red-600/30 to-orange-600/30 text-red-400 border border-red-500/50" 
                  : "bg-gradient-to-br from-green-600/30 to-emerald-600/30 text-green-400 border border-green-500/50"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {pValue < significanceLevel ? "Reject H₀" : "Fail to Reject H₀"}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Interpretation with animation */}
      <motion.div 
        className={cn(
          "rounded-xl p-6 border-2 transition-all duration-300 relative overflow-hidden",
          isRejected 
            ? "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700/50" 
            : "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: isRejected
              ? ["radial-gradient(circle at 0% 0%, #ef4444 0%, transparent 50%)",
                 "radial-gradient(circle at 100% 100%, #f97316 0%, transparent 50%)",
                 "radial-gradient(circle at 0% 0%, #ef4444 0%, transparent 50%)"]
              : ["radial-gradient(circle at 0% 0%, #10b981 0%, transparent 50%)",
                 "radial-gradient(circle at 100% 100%, #34d399 0%, transparent 50%)",
                 "radial-gradient(circle at 0% 0%, #10b981 0%, transparent 50%)"]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <h5 className="font-bold text-xl mb-3 text-white flex items-center gap-2">
            Conclusion
            <motion.span
              animate={{ rotate: isRejected ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isRejected ? Infinity : 0 }}
            >
              {isRejected ? "⚠️" : "✅"}
            </motion.span>
          </h5>
          <p className="text-lg mb-3">
            {isRejected 
              ? "There is sufficient evidence to conclude that the means of the two groups are different at the " + (significanceLevel * 100) + "% significance level."
              : "There is insufficient evidence to conclude that the means of the two groups are different at the " + (significanceLevel * 100) + "% significance level."
            }
          </p>
          <p className="text-sm text-neutral-400">
            {isRejected 
              ? "The observed difference is unlikely to have occurred by chance alone."
              : "The observed difference could reasonably be due to chance variation."
            }
          </p>
        </div>
      </motion.div>
    </div>
  );
});

DecisionMaking.displayName = 'DecisionMaking';