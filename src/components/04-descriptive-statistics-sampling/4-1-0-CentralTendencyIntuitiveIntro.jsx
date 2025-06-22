"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, Scale, Target, BarChart3, AlertCircle } from 'lucide-react';

// Color scheme for central tendency
const measureColors = {
  mean: '#3b82f6',      // Blue - flowing, dynamic
  median: '#10b981',    // Green - stable, centered
  mode: '#f59e0b',      // Amber - popular, frequent
  data: '#6b7280',      // Gray - neutral data points
  highlight: '#8b5cf6', // Purple - emphasis
  surface: '#0f0f0f',   // Near black for focus
  card: '#1a1a1a'       // Elevated surface
};

// Learning journey stages
const JOURNEY_STAGES = [
  {
    id: 'discovery',
    title: 'Where is the Center?',
    subtitle: 'An intuitive exploration',
    icon: Target,
    description: 'Discover what "central" means in data'
  },
  {
    id: 'mean',
    title: 'The Balance Point',
    subtitle: 'Understanding the mean',
    icon: Scale,
    description: 'Find where data balances perfectly'
  },
  {
    id: 'median',
    title: 'The True Middle',
    subtitle: 'Discovering the median',
    icon: Target,
    description: 'The value that splits data in half'
  },
  {
    id: 'mode',
    title: 'The Popular Choice',
    subtitle: 'Exploring the mode',
    icon: BarChart3,
    description: 'Finding the most common value'
  }
];

// Discovery moments that create "aha!" experiences
const DISCOVERIES = {
  balance_found: {
    trigger: (data, mean) => Math.abs(calculateBalance(data, mean)) < 0.1,
    message: "Perfect balance! You've found the mean!",
    animation: 'celebrate'
  },
  outlier_effect: {
    trigger: (data) => hasOutlier(data),
    message: "Watch how the outlier pulls the mean!",
    animation: 'highlight_mean_movement'
  },
  median_stability: {
    trigger: (data, prevMedian, currMedian) => 
      hasOutlier(data) && Math.abs(prevMedian - currMedian) < 0.1,
    message: "The median stays steady despite outliers!",
    animation: 'shield_effect'
  }
};

// Helper functions
function calculateBalance(data, pivot) {
  return data.reduce((sum, val) => sum + (val - pivot), 0);
}

function hasOutlier(data) {
  if (data.length < 3) return false;
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return data.some(val => val < q1 - 1.5 * iqr || val > q3 + 1.5 * iqr);
}

// Custom hook for central tendency calculations
function useCentralTendency(data) {
  return useMemo(() => {
    if (data.length === 0) return { mean: 0, median: 0, modes: [] };
    
    // Mean
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    
    // Median
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    
    // Mode(s)
    const frequency = {};
    data.forEach(val => {
      const rounded = Math.round(val);
      frequency[rounded] = (frequency[rounded] || 0) + 1;
    });
    
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = maxFreq > 1 
      ? Object.keys(frequency)
          .filter(key => frequency[key] === maxFreq)
          .map(Number)
      : [];
    
    return { mean, median, modes, frequency };
  }, [data]);
}

// Main component
function CentralTendencyIntuitiveIntro() {
  const [stage, setStage] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredMeasure, setHoveredMeasure] = useState(null);
  const [showFormulas, setShowFormulas] = useState(false);
  
  const svgRef = useRef(null);
  const { mean, median, modes } = useCentralTendency(dataPoints);
  
  // Stage content
  const currentStage = JOURNEY_STAGES[stage];
  
  // Check for discoveries
  useEffect(() => {
    Object.entries(DISCOVERIES).forEach(([key, discovery]) => {
      if (!discoveries.includes(key)) {
        // Check trigger conditions based on discovery type
        if (key === 'balance_found' && dataPoints.length > 3) {
          if (discovery.trigger(dataPoints, mean)) {
            setDiscoveries(prev => [...prev, key]);
          }
        }
      }
    });
  }, [dataPoints, mean, median, discoveries]);
  
  // Main visualization
  const updateVisualization = useCallback(() => {
    if (!svgRef.current || dataPoints.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 60, right: 60, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", measureColors.surface);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    // Stage-specific visualization
    if (stage === 0) {
      // Discovery stage - simple dots
      renderDiscoveryStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === 1) {
      // Mean stage - balance visualization
      renderMeanStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === 2) {
      // Median stage - splitting visualization
      renderMedianStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === 3) {
      // Mode stage - frequency visualization
      renderModeStage(g, xScale, innerWidth, innerHeight);
    }
  }, [dataPoints, stage, mean, median, modes, hoveredMeasure]);
  
  // Render functions for each stage
  const renderDiscoveryStage = (g, xScale, width, height) => {
    // Simple number line with dots
    const y = height / 2;
    
    // Number line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 2);
    
    // Data points
    g.selectAll(".data-point")
      .data(dataPoints)
      .enter().append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(d))
      .attr("cy", y)
      .attr("r", 0)
      .attr("fill", measureColors.data)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .transition()
      .duration(500)
      .attr("r", 8);
    
    // Prompt text
    if (dataPoints.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", y - 40)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "18px")
        .text("Click anywhere to add data points");
    } else if (dataPoints.length > 2) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", y - 40)
        .attr("text-anchor", "middle")
        .attr("fill", measureColors.highlight)
        .style("font-size", "18px")
        .text("Where would you say the 'center' is?");
    }
  };
  
  const renderMeanStage = (g, xScale, width, height) => {
    const seesawY = height * 0.6;
    const fulcrumX = xScale(mean);
    
    // Seesaw plank
    const plankLength = width * 0.8;
    const angle = calculateBalance(dataPoints, mean) * 2; // Convert to angle
    
    const seesaw = g.append("g")
      .attr("transform", `translate(${fulcrumX}, ${seesawY})`);
    
    // Fulcrum
    seesaw.append("path")
      .attr("d", "M -20 0 L 0 -30 L 20 0 Z")
      .attr("fill", measureColors.mean)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Plank
    seesaw.append("line")
      .attr("x1", -plankLength / 2)
      .attr("x2", plankLength / 2)
      .attr("y1", -30)
      .attr("y2", -30)
      .attr("stroke", "#fff")
      .attr("stroke-width", 4)
      .attr("transform", `rotate(${angle})`);
    
    // Data points as weights
    dataPoints.forEach((val, i) => {
      const x = xScale(val) - fulcrumX;
      const y = -30 + Math.abs(x * Math.sin(angle * Math.PI / 180));
      
      seesaw.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 10)
        .attr("fill", measureColors.data)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    });
    
    // Balance indicator
    const balanced = Math.abs(angle) < 1;
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", balanced ? measureColors.mean : colors.chart.text)
      .style("font-size", "20px")
      .style("font-weight", balanced ? "bold" : "normal")
      .text(balanced ? "Perfect Balance!" : "Find the balance point...");
  };
  
  const renderMedianStage = (g, xScale, width, height) => {
    const y = height / 2;
    const sorted = [...dataPoints].sort((a, b) => a - b);
    
    // Split visualization
    const midIndex = Math.floor(sorted.length / 2);
    const isEven = sorted.length % 2 === 0;
    
    // Left group
    g.append("rect")
      .attr("x", 0)
      .attr("y", y - 30)
      .attr("width", xScale(median))
      .attr("height", 60)
      .attr("fill", measureColors.median)
      .attr("opacity", 0.2);
    
    // Right group
    g.append("rect")
      .attr("x", xScale(median))
      .attr("y", y - 30)
      .attr("width", width - xScale(median))
      .attr("height", 60)
      .attr("fill", measureColors.median)
      .attr("opacity", 0.2);
    
    // Data points with order numbers
    sorted.forEach((val, i) => {
      const isMedian = isEven 
        ? i === midIndex - 1 || i === midIndex
        : i === midIndex;
      
      g.append("circle")
        .attr("cx", xScale(val))
        .attr("cy", y)
        .attr("r", isMedian ? 12 : 8)
        .attr("fill", isMedian ? measureColors.median : measureColors.data)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      
      // Order number
      g.append("text")
        .attr("x", xScale(val))
        .attr("y", y - 20)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(i + 1);
    });
    
    // Median line
    g.append("line")
      .attr("x1", xScale(median))
      .attr("x2", xScale(median))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", measureColors.median)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");
  };
  
  const renderModeStage = (g, xScale, width, height) => {
    // Frequency histogram
    const { frequency } = useCentralTendency(dataPoints);
    const maxFreq = Math.max(...Object.values(frequency));
    
    const barWidth = width / 20;
    const yScale = d3.scaleLinear()
      .domain([0, maxFreq])
      .range([height, 0]);
    
    Object.entries(frequency).forEach(([value, count]) => {
      const x = xScale(Number(value));
      const barHeight = height - yScale(count);
      const isMode = modes.includes(Number(value));
      
      g.append("rect")
        .attr("x", x - barWidth / 2)
        .attr("y", yScale(count))
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", isMode ? measureColors.mode : measureColors.data)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("rx", 4);
      
      // Frequency label
      g.append("text")
        .attr("x", x)
        .attr("y", yScale(count) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(count);
    });
  };
  
  useEffect(() => {
    updateVisualization();
  }, [updateVisualization]);
  
  // Handle canvas clicks
  const handleCanvasClick = (event) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left - 60) / (rect.width - 120)) * 100;
    
    if (x >= 0 && x <= 100) {
      setDataPoints(prev => [...prev, x]);
      setIsInteracting(true);
      setTimeout(() => setIsInteracting(false), 300);
    }
  };
  
  return (
    <VisualizationContainer 
      title="4.1 Central Tendency: An Intuitive Journey"
      className="min-h-screen"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          current={stage + 1} 
          total={JOURNEY_STAGES.length}
          variant="purple"
          showSteps
        />
      </div>
      
      {/* Stage Header */}
      <motion.div 
        key={stage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {React.createElement(currentStage.icon, { 
            size: 24, 
            className: "text-purple-400" 
          })}
          <h2 className="text-2xl font-bold text-white">
            {currentStage.title}
          </h2>
        </div>
        <p className="text-lg text-neutral-300">{currentStage.subtitle}</p>
        <p className="text-sm text-neutral-400 mt-2">{currentStage.description}</p>
      </motion.div>
      
      {/* Main Visualization - 80% of viewport */}
      <GraphContainer height="calc(100vh - 350px)" className="mb-6">
        <svg 
          ref={svgRef} 
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
        />
        
        {/* Floating Stats Display */}
        <AnimatePresence>
          {dataPoints.length > 0 && stage > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div className="space-y-2">
                {stage >= 1 && (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('mean')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: measureColors.mean }}
                    />
                    <span className="text-sm text-white">Mean</span>
                    <span className="text-sm font-mono text-white ml-auto">
                      {formatNumber(mean, 1)}
                    </span>
                  </div>
                )}
                {stage >= 2 && (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('median')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: measureColors.median }}
                    />
                    <span className="text-sm text-white">Median</span>
                    <span className="text-sm font-mono text-white ml-auto">
                      {formatNumber(median, 1)}
                    </span>
                  </div>
                )}
                {stage >= 3 && modes.length > 0 && (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('mode')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: measureColors.mode }}
                    />
                    <span className="text-sm text-white">Mode</span>
                    <span className="text-sm font-mono text-white ml-auto">
                      {modes.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GraphContainer>
      
      {/* Discovery Notifications */}
      <AnimatePresence>
        {discoveries.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
            style={{ bottom: `${80 + index * 70}px` }}
          >
            <div className="bg-purple-500/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-semibold">{DISCOVERIES[key].message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Controls - Minimal and contextual */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDataPoints([])}
            disabled={dataPoints.length === 0}
          >
            Clear All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Add sample data
              setDataPoints([20, 30, 30, 40, 50, 60, 70, 80]);
            }}
          >
            Sample Data
          </Button>
          {stage === 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Add outlier
                setDataPoints(prev => [...prev, 95]);
              }}
            >
              Add Outlier
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStage(Math.max(0, stage - 1))}
            disabled={stage === 0}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setStage(Math.min(JOURNEY_STAGES.length - 1, stage + 1))}
            disabled={stage === JOURNEY_STAGES.length - 1 || dataPoints.length < 3}
          >
            Next Concept
          </Button>
        </div>
      </div>
      
      {/* Formula Toggle */}
      {stage > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {showFormulas ? 'Hide' : 'Show'} Mathematical Formulas
          </button>
          
          <AnimatePresence>
            {showFormulas && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-neutral-900 rounded-lg p-4 text-left"
              >
                {stage === 1 && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Arithmetic Mean:</p>
                    <p className="font-mono text-white">x̄ = (Σx) / n</p>
                  </div>
                )}
                {stage === 2 && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Median:</p>
                    <p className="font-mono text-white">Middle value when sorted</p>
                  </div>
                )}
                {stage === 3 && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Mode:</p>
                    <p className="font-mono text-white">Most frequent value</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </VisualizationContainer>
  );
}

export default CentralTendencyIntuitiveIntro;