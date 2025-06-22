"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { WorkedExample, ExampleSection, Formula, InsightBox, CalculationSteps } from '../ui/WorkedExample';
import { Button } from '../ui/button';
import { RangeSlider } from '../ui/RangeSlider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Star, Zap, Shield, Target, TrendingUp, 
  AlertCircle, HelpCircle, CheckCircle, XCircle 
} from 'lucide-react';

const colorScheme = createColorScheme('estimation');

// Enhanced color palette
const enhancedColors = {
  mean: {
    primary: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    light: '#60a5fa',
    dark: '#2563eb'
  },
  median: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    light: '#34d399',
    dark: '#059669'
  },
  mode: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    light: '#fbbf24',
    dark: '#d97706'
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

// Challenge system with progressive difficulty
const CHALLENGES = {
  beginner: [
    {
      id: 'first_mean',
      name: 'Balance Master',
      description: 'Create a dataset with mean = 50',
      check: (stats) => Math.abs(stats.mean - 50) < 0.5,
      points: 10,
      hint: 'Try values around 50',
      reward: { icon: Trophy, color: '#FFD700' }
    },
    {
      id: 'simple_median',
      name: 'Middle Finder',
      description: 'Create 5 points with median = 30',
      check: (stats, data) => data.length === 5 && Math.abs(stats.median - 30) < 0.5,
      points: 15,
      hint: 'Remember: median is the middle value when sorted',
      reward: { icon: Target, color: '#10b981' }
    }
  ],
  intermediate: [
    {
      id: 'symmetric',
      name: 'Perfect Symmetry',
      description: 'Create data where mean = median',
      check: (stats) => Math.abs(stats.mean - stats.median) < 0.1,
      points: 25,
      hint: 'Symmetric distributions have equal mean and median',
      reward: { icon: Star, color: '#f59e0b' }
    },
    {
      id: 'bimodal',
      name: 'Double Peak',
      description: 'Create a bimodal distribution',
      check: (stats) => stats.modes.length === 2,
      points: 30,
      hint: 'Two values need the same high frequency',
      reward: { icon: Award, color: '#8b5cf6' }
    }
  ],
  expert: [
    {
      id: 'outlier_resistant',
      name: 'Shield the Median',
      description: 'Keep median at 50 while adding 3 values > 90',
      check: (stats, data) => {
        const highValues = data.filter(d => d > 90).length;
        return highValues >= 3 && Math.abs(stats.median - 50) < 1;
      },
      points: 50,
      hint: 'Median resists outliers!',
      reward: { icon: Shield, color: '#dc2626' }
    },
    {
      id: 'precise_skew',
      name: 'Skew Master',
      description: 'Make mean exactly 10 points higher than median',
      check: (stats) => Math.abs((stats.mean - stats.median) - 10) < 0.2,
      points: 75,
      hint: 'Add high outliers to pull the mean right',
      reward: { icon: TrendingUp, color: '#0ea5e9' }
    }
  ]
};

// Interactive tutorials for each concept
const TUTORIALS = {
  mean: {
    title: "The Democratic Average",
    steps: [
      {
        text: "Every value gets an equal vote",
        action: "Add some data points and watch the mean update",
        visual: "highlight_all_points"
      },
      {
        text: "The mean is the balance point",
        action: "Notice how the seesaw balances at the mean",
        visual: "show_balance"
      },
      {
        text: "But it's sensitive to extremes",
        action: "Add an outlier and watch the mean chase it!",
        visual: "animate_outlier_effect"
      }
    ]
  },
  median: {
    title: "The Stable Middle",
    steps: [
      {
        text: "The median splits data in half",
        action: "We'll sort your data and find the middle",
        visual: "animate_sort"
      },
      {
        text: "It's robust against outliers",
        action: "Add extreme values - the median barely moves!",
        visual: "show_robustness"
      }
    ]
  },
  mode: {
    title: "The Popular Vote",
    steps: [
      {
        text: "Mode is the most frequent value",
        action: "Create clusters to see modes appear",
        visual: "highlight_frequencies"
      },
      {
        text: "There can be multiple modes",
        action: "Create two popular values",
        visual: "show_bimodal"
      }
    ]
  }
};

// Achievement system
const ACHIEVEMENTS = [
  { id: 'first_data', name: 'Data Explorer', description: 'Add your first data point', icon: Star },
  { id: 'balance_master', name: 'Balance Master', description: 'Balance the seesaw perfectly', icon: Trophy },
  { id: 'outlier_hunter', name: 'Outlier Hunter', description: 'Discover the outlier effect', icon: Zap },
  { id: 'challenge_complete', name: 'Challenge Champion', description: 'Complete 5 challenges', icon: Award },
  { id: 'all_measures', name: 'Measure Master', description: 'Understand all three measures', icon: Target }
];

// Animated notification component
const AchievementNotification = memo(({ achievement, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-2xl max-w-sm"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-full">
        {React.createElement(achievement.icon, { size: 24 })}
      </div>
      <div>
        <h4 className="font-bold">{achievement.name}</h4>
        <p className="text-sm opacity-90">{achievement.description}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto p-1 hover:bg-white/20 rounded"
      >
        <XCircle size={20} />
      </button>
    </div>
  </motion.div>
));

// Main component
function CentralTendencyDeepDive() {
  // State management
  const [dataPoints, setDataPoints] = useState([]);
  const [selectedMeasure, setSelectedMeasure] = useState('mean');
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [interactionMode, setInteractionMode] = useState('add'); // 'add', 'remove', 'drag'
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState(null);
  
  // Refs
  const mainVizRef = useRef(null);
  const comparisonVizRef = useRef(null);
  const draggedPoint = useRef(null);
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (dataPoints.length === 0) return { mean: 0, median: 0, modes: [], frequency: {} };
    
    const mean = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
    
    const sorted = [...dataPoints].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    
    const frequency = {};
    dataPoints.forEach(val => {
      const rounded = Math.round(val);
      frequency[rounded] = (frequency[rounded] || 0) + 1;
    });
    
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = maxFreq > 1 
      ? Object.keys(frequency)
          .filter(key => frequency[key] === maxFreq)
          .map(Number)
      : [];
    
    // Additional statistics
    const variance = dataPoints.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataPoints.length;
    const stdDev = Math.sqrt(variance);
    
    // Skewness indicator
    const skewness = mean > median ? 'right' : mean < median ? 'left' : 'symmetric';
    
    return { mean, median, modes, frequency, variance, stdDev, skewness };
  }, [dataPoints]);
  
  // Check challenges
  useEffect(() => {
    if (!selectedChallenge || completedChallenges.includes(selectedChallenge.id)) return;
    
    if (selectedChallenge.check(stats, dataPoints)) {
      setCompletedChallenges(prev => [...prev, selectedChallenge.id]);
      unlockAchievement('challenge_complete');
      
      // Celebration animation
      confetti();
    }
  }, [stats, dataPoints, selectedChallenge, completedChallenges]);
  
  // Achievement system
  const unlockAchievement = (achievementId) => {
    if (!unlockedAchievements.includes(achievementId)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        setUnlockedAchievements(prev => [...prev, achievementId]);
        setRecentAchievement(achievement);
        setTimeout(() => setRecentAchievement(null), 5000);
      }
    }
  };
  
  // Main visualization with enhanced interactivity
  const updateMainVisualization = useCallback(() => {
    if (!mainVizRef.current) return;
    
    const svg = d3.select(mainVizRef.current);
    const { width, height } = mainVizRef.current.getBoundingClientRect();
    const margin = { top: 60, right: 60, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Enhanced background with gradient
    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient")
      .attr("id", "bg-gradient");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1a1a1a");
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0a0a0a");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);
    
    // Enhanced grid with glow effect
    const gridGroup = g.append("g").attr("class", "grid");
    
    // Vertical grid lines
    xScale.ticks(10).forEach(tick => {
      gridGroup.append("line")
        .attr("x1", xScale(tick))
        .attr("x2", xScale(tick))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 1)
        .attr("opacity", 0.2);
    });
    
    // Interactive layer for adding points
    g.append("rect")
      .attr("class", "interactive-layer")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", interactionMode === 'add' ? 'crosshair' : 'default')
      .on("click", function(event) {
        if (interactionMode !== 'add') return;
        
        const [x] = d3.pointer(event);
        const value = xScale.invert(x);
        
        if (value >= 0 && value <= 100) {
          // Add with animation
          addDataPoint(value);
        }
      });
    
    // Draw measure-specific visualization
    if (selectedMeasure === 'mean') {
      drawMeanVisualization(g, xScale, yScale, innerWidth, innerHeight);
    } else if (selectedMeasure === 'median') {
      drawMedianVisualization(g, xScale, yScale, innerWidth, innerHeight);
    } else if (selectedMeasure === 'mode') {
      drawModeVisualization(g, xScale, yScale, innerWidth, innerHeight);
    }
    
    // Data points with enhanced interactivity
    const pointsGroup = g.append("g").attr("class", "data-points");
    
    dataPoints.forEach((value, index) => {
      const point = pointsGroup.append("g")
        .attr("class", "data-point-group")
        .attr("transform", `translate(${xScale(value)}, ${innerHeight / 2})`);
      
      // Glow effect
      point.append("circle")
        .attr("r", 20)
        .attr("fill", enhancedColors.mean.glow)
        .attr("filter", "blur(10px)");
      
      // Main point
      point.append("circle")
        .attr("class", "data-point")
        .attr("r", 8)
        .attr("fill", colors.chart.primary)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", interactionMode === 'remove' ? 'pointer' : 'move')
        .on("click", function(event) {
          event.stopPropagation();
          if (interactionMode === 'remove') {
            removeDataPoint(index);
          }
        })
        .on("mouseenter", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 12);
        })
        .on("mouseleave", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8);
        });
      
      // Value label on hover
      point.append("text")
        .attr("class", "value-label")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .style("opacity", 0)
        .text(formatNumber(value, 1));
      
      point.on("mouseenter", function() {
        d3.select(this).select(".value-label")
          .transition()
          .duration(200)
          .style("opacity", 1);
      })
      .on("mouseleave", function() {
        d3.select(this).select(".value-label")
          .transition()
          .duration(200)
          .style("opacity", 0);
      });
    });
    
  }, [dataPoints, selectedMeasure, interactionMode, stats]);
  
  // Visualization functions for each measure
  const drawMeanVisualization = (g, xScale, yScale, width, height) => {
    const meanX = xScale(stats.mean);
    
    // Balance beam visualization
    const beamY = height * 0.6;
    
    // Fulcrum with glow
    g.append("circle")
      .attr("cx", meanX)
      .attr("cy", beamY + 30)
      .attr("r", 30)
      .attr("fill", enhancedColors.mean.glow)
      .attr("filter", "blur(20px)");
    
    g.append("path")
      .attr("d", `M ${meanX - 20} ${beamY + 30} L ${meanX} ${beamY} L ${meanX + 20} ${beamY + 30} Z`)
      .attr("fill", enhancedColors.mean.primary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Calculate tilt based on balance
    const balance = dataPoints.reduce((sum, val) => sum + (val - stats.mean), 0);
    const tilt = Math.max(-15, Math.min(15, balance * 0.5));
    
    // Beam
    g.append("line")
      .attr("x1", meanX - width * 0.4)
      .attr("x2", meanX + width * 0.4)
      .attr("y1", beamY)
      .attr("y2", beamY)
      .attr("stroke", "#fff")
      .attr("stroke-width", 4)
      .attr("transform", `rotate(${tilt}, ${meanX}, ${beamY})`);
    
    // Mean line with glow
    g.append("line")
      .attr("x1", meanX)
      .attr("x2", meanX)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", enhancedColors.mean.primary)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6);
    
    // Label
    g.append("text")
      .attr("x", meanX)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", enhancedColors.mean.primary)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Mean: ${formatNumber(stats.mean, 1)}`);
  };
  
  const drawMedianVisualization = (g, xScale, yScale, width, height) => {
    const medianX = xScale(stats.median);
    const sorted = [...dataPoints].sort((a, b) => a - b);
    
    // Split visualization
    g.append("rect")
      .attr("x", 0)
      .attr("y", height * 0.3)
      .attr("width", medianX)
      .attr("height", height * 0.4)
      .attr("fill", enhancedColors.median.primary)
      .attr("opacity", 0.1);
    
    g.append("rect")
      .attr("x", medianX)
      .attr("y", height * 0.3)
      .attr("width", width - medianX)
      .attr("height", height * 0.4)
      .attr("fill", enhancedColors.median.primary)
      .attr("opacity", 0.1);
    
    // Median line with shield effect
    g.append("line")
      .attr("x1", medianX)
      .attr("x2", medianX)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", enhancedColors.median.primary)
      .attr("stroke-width", 4);
    
    // Shield icon at median
    g.append("circle")
      .attr("cx", medianX)
      .attr("cy", height / 2)
      .attr("r", 25)
      .attr("fill", enhancedColors.median.glow)
      .attr("filter", "blur(15px)");
    
    g.append("text")
      .attr("x", medianX)
      .attr("y", height / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "20px")
      .text("🛡️");
    
    // Label
    g.append("text")
      .attr("x", medianX)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", enhancedColors.median.primary)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Median: ${formatNumber(stats.median, 1)}`);
  };
  
  const drawModeVisualization = (g, xScale, yScale, width, height) => {
    // Frequency bars
    const barWidth = width / 50;
    const maxFreq = Math.max(...Object.values(stats.frequency));
    
    Object.entries(stats.frequency).forEach(([value, freq]) => {
      const x = xScale(Number(value));
      const barHeight = (freq / maxFreq) * height * 0.7;
      const isMode = stats.modes.includes(Number(value));
      
      // Bar with glow if mode
      if (isMode) {
        g.append("rect")
          .attr("x", x - barWidth / 2 - 5)
          .attr("y", height - barHeight - 5)
          .attr("width", barWidth + 10)
          .attr("height", barHeight + 10)
          .attr("fill", enhancedColors.mode.glow)
          .attr("filter", "blur(10px)");
      }
      
      g.append("rect")
        .attr("x", x - barWidth / 2)
        .attr("y", height - barHeight)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", isMode ? enhancedColors.mode.primary : colors.chart.primary)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("rx", 2);
      
      // Frequency label
      g.append("text")
        .attr("x", x)
        .attr("y", height - barHeight - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(freq);
    });
    
    // Mode label
    if (stats.modes.length > 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", enhancedColors.mode.primary)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Mode(s): ${stats.modes.join(', ')}`);
    }
  };
  
  // Update visualization on changes
  useEffect(() => {
    updateMainVisualization();
  }, [updateMainVisualization]);
  
  // Helper functions
  const addDataPoint = (value) => {
    setDataPoints(prev => [...prev, value]);
    
    // Check for first data achievement
    if (dataPoints.length === 0) {
      unlockAchievement('first_data');
    }
  };
  
  const removeDataPoint = (index) => {
    setDataPoints(prev => prev.filter((_, i) => i !== index));
  };
  
  const confetti = () => {
    // Simple confetti animation
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
    const particles = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4
      });
    }
    
    // Animate particles (simplified for this example)
    // In production, use a proper animation library
  };
  
  return (
    <VisualizationContainer 
      title="4.1 Central Tendency: Interactive Deep Dive"
      className="min-h-screen"
    >
      {/* Tutorial Modal */}
      <AnimatePresence>
        {currentTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setCurrentTutorial(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-xl p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">{TUTORIALS[currentTutorial].title}</h3>
              <div className="space-y-4">
                {TUTORIALS[currentTutorial].steps.map((step, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 rounded-lg transition-all",
                      index === tutorialStep ? "bg-blue-500/20 border border-blue-500" : "bg-neutral-800"
                    )}
                  >
                    <p className="font-medium">{step.text}</p>
                    <p className="text-sm text-neutral-400 mt-1">{step.action}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                  disabled={tutorialStep === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (tutorialStep < TUTORIALS[currentTutorial].steps.length - 1) {
                      setTutorialStep(tutorialStep + 1);
                    } else {
                      setCurrentTutorial(null);
                      setTutorialStep(0);
                    }
                  }}
                >
                  {tutorialStep < TUTORIALS[currentTutorial].steps.length - 1 ? 'Next' : 'Complete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievement Notification */}
      <AnimatePresence>
        {recentAchievement && (
          <AchievementNotification
            achievement={recentAchievement}
            onClose={() => setRecentAchievement(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Challenges & Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Measure Selector */}
          <VisualizationSection title="Select Measure">
            <div className="space-y-2">
              {['mean', 'median', 'mode'].map(measure => (
                <button
                  key={measure}
                  onClick={() => setSelectedMeasure(measure)}
                  className={cn(
                    "w-full p-3 rounded-lg transition-all flex items-center gap-3",
                    selectedMeasure === measure
                      ? "bg-blue-500/20 border border-blue-500"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  )}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: enhancedColors[measure].primary }}
                  />
                  <span className="capitalize font-medium">{measure}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTutorial(measure);
                    }}
                    className="ml-auto p-1 hover:bg-white/10 rounded"
                  >
                    <HelpCircle size={16} />
                  </button>
                </button>
              ))}
            </div>
          </VisualizationSection>
          
          {/* Current Stats */}
          <StatsDisplay
            stats={[
              { label: "Mean", value: formatNumber(stats.mean, 2), color: enhancedColors.mean.primary },
              { label: "Median", value: formatNumber(stats.median, 2), color: enhancedColors.median.primary },
              { label: "Mode", value: stats.modes.length > 0 ? stats.modes.join(', ') : '—', color: enhancedColors.mode.primary },
              { label: "Std Dev", value: formatNumber(stats.stdDev, 2) },
              { label: "Skewness", value: stats.skewness, highlight: stats.skewness !== 'symmetric' }
            ]}
          />
          
          {/* Challenges */}
          <VisualizationSection title="Challenges">
            <div className="space-y-2">
              {Object.entries(CHALLENGES).map(([difficulty, challenges]) => (
                <div key={difficulty}>
                  <h4 className="text-xs uppercase text-neutral-500 mb-1">{difficulty}</h4>
                  {challenges.map(challenge => (
                    <button
                      key={challenge.id}
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowHint(false);
                      }}
                      disabled={completedChallenges.includes(challenge.id)}
                      className={cn(
                        "w-full p-2 rounded text-left text-sm transition-all",
                        completedChallenges.includes(challenge.id)
                          ? "bg-green-500/20 border border-green-500 opacity-50"
                          : selectedChallenge?.id === challenge.id
                          ? "bg-purple-500/20 border border-purple-500"
                          : "bg-neutral-800 hover:bg-neutral-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{challenge.name}</span>
                        <span className="text-xs">{challenge.points} pts</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            
            {selectedChallenge && !completedChallenges.includes(selectedChallenge.id) && (
              <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm">{selectedChallenge.description}</p>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-purple-400 mt-1"
                >
                  {showHint ? 'Hide' : 'Show'} Hint
                </button>
                {showHint && (
                  <p className="text-xs text-neutral-400 mt-1">{selectedChallenge.hint}</p>
                )}
              </div>
            )}
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Main Visualization */}
        <div className="lg:col-span-3">
          {/* Interaction Mode Selector */}
          <div className="flex gap-2 mb-4">
            {[
              { mode: 'add', label: 'Add Points', icon: '➕' },
              { mode: 'remove', label: 'Remove Points', icon: '➖' },
              { mode: 'drag', label: 'Move Points', icon: '↔️' }
            ].map(({ mode, label, icon }) => (
              <Button
                key={mode}
                variant={interactionMode === mode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setInteractionMode(mode)}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </Button>
            ))}
            
            <div className="ml-auto flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDataPoints([])}
              >
                Clear All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Add sample data
                  const samples = [20, 30, 30, 40, 50, 60, 70, 80];
                  setDataPoints(samples);
                }}
              >
                Sample Data
              </Button>
            </div>
          </div>
          
          {/* Main Visualization */}
          <GraphContainer height="600px">
            <svg ref={mainVizRef} className="w-full h-full" />
            
            {dataPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xl text-neutral-500 mb-2">Click to add data points</p>
                  <p className="text-sm text-neutral-600">Try completing challenges to learn!</p>
                </div>
              </div>
            )}
          </GraphContainer>
          
          {/* Comparison Toggle */}
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide' : 'Show'} All Measures Comparison
            </Button>
          </div>
          
          {/* Comparison View */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <GraphContainer height="200px">
                  <svg ref={comparisonVizRef} className="w-full h-full" />
                </GraphContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Progress Summary */}
      <div className="mt-8 p-4 bg-neutral-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Your Progress</h3>
            <p className="text-sm text-neutral-400">
              Challenges: {completedChallenges.length}/{Object.values(CHALLENGES).flat().length} | 
              Achievements: {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </p>
          </div>
          <div className="flex gap-2">
            {unlockedAchievements.slice(-5).map(id => {
              const achievement = ACHIEVEMENTS.find(a => a.id === id);
              return achievement && (
                <div
                  key={id}
                  className="p-2 bg-purple-500/20 rounded-full"
                  title={achievement.name}
                >
                  {React.createElement(achievement.icon, { size: 20 })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default CentralTendencyDeepDive;