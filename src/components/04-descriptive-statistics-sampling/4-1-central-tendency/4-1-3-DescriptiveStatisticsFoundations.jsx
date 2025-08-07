"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Calculator, BarChart3, Target, TrendingUp, AlertCircle } from 'lucide-react';

// Layout configuration for consistent spacing across visualizations
const LAYOUT = {
  // Standard SVG dimensions
  svg: {
    height: 400,
    defaultWidth: 800,
  },
  // Consistent margins for all visualizations
  margins: {
    top: 80,
    right: 60,
    bottom: 100,
    left: 60,
  },
  // Zone definitions for different content areas
  zones: {
    title: { y: 30 },               // Title area at top
    legend: { y: 50 },              // Legend below title
    mainChart: { y: 80 },           // Main visualization area
    annotations: { y: 320 },        // Annotations near bottom
    controls: { y: 340 },           // Interactive controls
    footer: { y: 380 },             // Bottom information
  },
  // Text spacing configurations
  text: {
    lineHeight: 20,
    minSpacing: 30,                 // Minimum space between text elements
    labelOffset: 5,                 // Offset from data points
  },
};

// Helper function to calculate inner dimensions
const calculateInnerDimensions = (svgWidth = LAYOUT.svg.defaultWidth, svgHeight = LAYOUT.svg.height) => {
  return {
    width: svgWidth - LAYOUT.margins.left - LAYOUT.margins.right,
    height: svgHeight - LAYOUT.margins.top - LAYOUT.margins.bottom,
    innerLeft: LAYOUT.margins.left,
    innerTop: LAYOUT.margins.top,
    innerRight: svgWidth - LAYOUT.margins.right,
    innerBottom: svgHeight - LAYOUT.margins.bottom,
  };
};

// Helper function to get y position for different zones
const getZoneY = (zoneName) => {
  return LAYOUT.zones[zoneName]?.y || LAYOUT.margins.top;
};

// Helper function for basic collision detection and prevention
const preventTextOverlap = (textElements) => {
  // Sort elements by x position
  const sorted = [...textElements].sort((a, b) => a.x - b.x);
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    // Check for horizontal overlap
    const minDistance = LAYOUT.text.minSpacing;
    const distance = curr.x - prev.x;
    
    if (distance < minDistance) {
      // Adjust current element position
      curr.x = prev.x + minDistance;
    }
    
    // Check for vertical overlap if elements are at same x position
    if (Math.abs(curr.x - prev.x) < 5) {
      const verticalDistance = Math.abs(curr.y - prev.y);
      if (verticalDistance < LAYOUT.text.lineHeight) {
        // Move current element down
        curr.y = prev.y + LAYOUT.text.lineHeight;
      }
    }
  }
  
  return sorted;
};

// Color scheme for statistics
const statColors = {
  mean: '#3b82f6',       // Blue
  median: '#10b981',     // Green
  q1: '#06b6d4',         // Cyan
  q3: '#14b8a6',         // Teal
  outlier: '#ef4444',    // Red
  normal: '#6b7280',     // Gray
  highlight: '#8b5cf6',  // Purple
  range: '#f59e0b',      // Amber
};

// Illustrative dataset with well-separated mean, median, and mode
const ACCIDENT_DATA = [2, 3, 3, 5, 8, 9, 15, 18, 25, 35, 42];

// Learning sections
const SECTIONS = [
  {
    id: 'review',
    title: 'Central Tendency Review',
    icon: Calculator,
    description: 'Quick recap with our accident data'
  },
  {
    id: 'quartiles',
    title: 'Quartiles & Five-Number Summary',
    icon: BarChart3,
    description: 'Dividing data into quarters'
  },
  {
    id: 'spread',
    title: 'Measures of Spread',
    icon: TrendingUp,
    description: 'Understanding data variability'
  },
  {
    id: 'outliers',
    title: 'Outlier Detection',
    icon: AlertCircle,
    description: 'Finding unusual values'
  },
  {
    id: 'summary',
    title: 'Putting It All Together',
    icon: Target,
    description: 'Complete descriptive analysis'
  }
];

function DescriptiveStatisticsFoundations({ onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [data] = useState(ACCIDENT_DATA);
  const svgRef = useRef(null);
  const mathRef = useRef(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Calculate all statistics
  const stats = useMemo(() => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    
    // Central tendency
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode
    const frequency = {};
    data.forEach(x => {
      frequency[x] = (frequency[x] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq)
      .map(Number);
    
    // Quartiles
    const q1Index = Math.floor(n / 4);
    const q3Index = Math.floor(3 * n / 4);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Five-number summary
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    // Outlier bounds
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = data.filter(x => x < lowerFence || x > upperFence);
    
    // Variance and standard deviation
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation
    const cv = (stdDev / mean) * 100;
    
    return {
      sorted, n, mean, median, modes, frequency,
      q1, q3, iqr, min, max, range,
      lowerFence, upperFence, outliers,
      variance, stdDev, cv
    };
  }, [data]);
  
  // Render LaTeX
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && mathRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([mathRef.current]);
        }
        window.MathJax.typesetPromise([mathRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [currentSection, animationStep]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(currentSection - 1);
        setAnimationStep(0);
      } else if (e.key === 'ArrowRight' && currentSection < SECTIONS.length - 1) {
        setCurrentSection(currentSection + 1);
        setAnimationStep(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);
  
  // Render visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    
    // Dynamic height based on section content requirements
    const contentHeights = {
      0: 400,  // Central Tendency
      1: 500,  // Quartiles
      2: 400,  // Measures of Spread
      3: 450,  // Outlier Detection
      4: 800   // Putting It All Together - needs more space!
    };
    
    const height = contentHeights[currentSection] || 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Set viewBox for proper scaling
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet");
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    switch(currentSection) {
      case 0:
        renderCentralTendencyReview(g, innerWidth, innerHeight);
        break;
      case 1:
        renderQuartiles(g, innerWidth, innerHeight);
        break;
      case 2:
        renderSpread(g, innerWidth, innerHeight);
        break;
      case 3:
        renderOutliers(g, innerWidth, innerHeight);
        break;
      case 4:
        renderSummary(g, innerWidth, innerHeight);
        break;
    }
  }, [currentSection, data, stats, animationStep]);
  
  const renderCentralTendencyReview = (g, width, height) => {
    // Helper calculations for proper positioning within margins
    const margin = { top: 50, right: 40, bottom: 50, left: 60 };
    const drawHeight = height - margin.top - margin.bottom;
    const centerY = margin.top + drawHeight / 2;
    const bottomY = height - margin.bottom;
    
    // Create a dot plot showing sorted data with measures clearly separated
    const xScale = d3.scaleLinear()
      .domain([0, 45])
      .range([0, width]);
    
    // Center the dot plot vertically
    const y = centerY;
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${bottomY})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Number of Accidents");
    
    // Title for sorted data with more space
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Why Mean, Median, and Mode Differ in Skewed Data");
    
    // Sorted data points
    stats.sorted.forEach((value, i) => {
      const circle = g.append("circle")
        .attr("cx", xScale(value))
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", value === 3 ? statColors.range : statColors.normal)
        .attr("stroke", value === 3 ? statColors.range : "none")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .transition()
        .duration(500)
        .delay(i * 100)
        .attr("r", 8);
      
      // Add value labels on the dots
      g.append("text")
        .attr("x", xScale(value))
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(value)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(i * 100)
        .attr("opacity", 1);
    });
    
    // Histogram in background
    const bins = d3.histogram()
      .domain([0, 45])
      .thresholds(15)
      (data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([centerY - drawHeight * 0.1, centerY - drawHeight * 0.4]);
    
    // Bars (subtle in background)
    g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("y", d => yScale(d.length))
      .attr("height", d => (centerY - drawHeight * 0.1) - yScale(d.length))
      .attr("fill", statColors.normal)
      .attr("opacity", 0.2);
    
    // Central tendency measures with enhanced visual separation
    const measures = [
      { name: 'Mode', value: stats.modes[0], color: statColors.range, description: 'Most frequent' },
      { name: 'Median', value: stats.median, color: statColors.median, description: 'Middle value' },
      { name: 'Mean', value: stats.mean, color: statColors.mean, description: 'Balance point' }
    ];
    
    measures.forEach((measure, i) => {
      const x = xScale(measure.value);
      
      // Vertical line
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", margin.top)
        .attr("y2", centerY - drawHeight * 0.05)
        .attr("stroke", measure.color)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1200 + i * 300)
        .attr("opacity", 0.8);
      
      // Arrow pointing to the line with better spacing
      const arrowY = centerY - drawHeight * 0.3 + i * 35;
      g.append("path")
        .attr("d", `M${x},${arrowY} L${x-5},${arrowY-10} L${x+5},${arrowY-10} Z`)
        .attr("fill", measure.color)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1200 + i * 300)
        .attr("opacity", 1);
      
      // Label with value and description
      const labelGroup = g.append("g")
        .attr("opacity", 0);
      
      labelGroup.append("rect")
        .attr("x", x - 40)
        .attr("y", -20 + i * 25)
        .attr("width", 80)
        .attr("height", 20)
        .attr("fill", measure.color)
        .attr("rx", 3);
      
      labelGroup.append("text")
        .attr("x", x)
        .attr("y", -5 + i * 25)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text(`${measure.name} = ${formatNumber(measure.value, 1)}`);
      
      // Apply transition to the group after creating elements
      labelGroup.transition()
        .duration(800)
        .delay(1200 + i * 300)
        .attr("opacity", 1);
    });
    
    // Visual explanation of the skew
    if (animationStep >= 1) {
      // Draw connecting lines to show the pull of outliers
      const meanX = xScale(stats.mean);
      const medianX = xScale(stats.median);
      
      // Arrow showing the pull
      const arrowPath = g.append("path")
        .attr("d", `M${medianX},${centerY + drawHeight * 0.15} Q${(meanX + medianX) / 2},${centerY + drawHeight * 0.05} ${meanX},${centerY + drawHeight * 0.15}`)
        .attr("fill", "none")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.7);
      
      // Add arrowhead marker
      const defs = g.append("defs");
      defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 8)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 Z")
        .attr("fill", "#f59e0b");
      
      // Explanation text
      g.append("text")
        .attr("x", width * 0.7)
        .attr("y", centerY + drawHeight * 0.1)
        .attr("text-anchor", "middle")
        .attr("fill", "#f59e0b")
        .attr("font-size", "12px")
        .text("Large values pull")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", width * 0.7)
        .attr("y", centerY + drawHeight * 0.15)
        .attr("text-anchor", "middle")
        .attr("fill", "#f59e0b")
        .attr("font-size", "12px")
        .text("the mean right →")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    }
  };
  
  const renderQuartiles = (g, width, height) => {
    // Helper calculations for proper positioning within margins
    const margin = { top: 50, right: 40, bottom: 80, left: 60 };
    const drawHeight = height - margin.top - margin.bottom;
    const centerY = margin.top + drawHeight / 2;
    const bottomY = height - margin.bottom;
    
    const xScale = d3.scaleLinear()
      .domain([0, 45])
      .range([0, width]);
    
    // X-axis at the bottom
    g.append("g")
      .attr("transform", `translate(0,${bottomY})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Number of Accidents");
    
    // Color mapping for each statistic
    const statColorMap = {
      min: '#3b82f6',    // blue
      q1: '#06b6d4',     // cyan
      median: '#10b981', // green
      q3: '#14b8a6',     // teal
      max: '#f59e0b'     // orange
    };
    
    // Find indices for quartiles
    const n = stats.sorted.length;
    const q1Index = Math.floor(n / 4);
    const medianIndex = Math.floor(n / 2);
    const q3Index = Math.floor(3 * n / 4);
    
    // Zone 1: Sorted data visualization - moved higher
    const dataZoneY = margin.top + 20;
    const dataZoneHeight = 80;
    const dataY = dataZoneY + dataZoneHeight / 2;
    
    // Title for sorted data
    g.append("text")
      .attr("x", width / 2)
      .attr("y", dataZoneY - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Sorted Data with Quartile Positions");
    
    // Sorted data points with quartile highlights
    stats.sorted.forEach((value, i) => {
      let color = statColors.normal;
      let size = 4;
      let isQuartile = false;
      
      // Determine if this is a quartile point
      if (i === 0) {
        color = statColorMap.min;
        size = 8;
        isQuartile = true;
      } else if (i === q1Index) {
        color = statColorMap.q1;
        size = 8;
        isQuartile = true;
      } else if (i === medianIndex) {
        color = statColorMap.median;
        size = 8;
        isQuartile = true;
      } else if (i === q3Index) {
        color = statColorMap.q3;
        size = 8;
        isQuartile = true;
      } else if (i === n - 1) {
        color = statColorMap.max;
        size = 8;
        isQuartile = true;
      }
      
      // Draw the data point
      const circle = g.append("circle")
        .attr("cx", xScale(value))
        .attr("cy", dataY)
        .attr("r", 0)
        .attr("fill", color)
        .attr("stroke", isQuartile ? "#fff" : "none")
        .attr("stroke-width", isQuartile ? 2 : 0)
        .attr("opacity", 0.8)
        .transition()
        .duration(500)
        .delay(i * 20)
        .attr("r", size);
    });
    
    // Visual divisions at quartiles  
    if (animationStep >= 1) {
      // Quartile division lines
      [q1Index, medianIndex, q3Index].forEach((index, i) => {
        const value = stats.sorted[index];
        g.append("line")
          .attr("x1", xScale(value))
          .attr("x2", xScale(value))
          .attr("y1", dataZoneY)
          .attr("y2", dataZoneY + dataZoneHeight)
          .attr("stroke", "#666")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "3,3")
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(800 + i * 100)
          .attr("opacity", 0.5);
      });
      
      // Quartile range labels
      const quartileRanges = [
        { label: "25% of data", start: 0, end: q1Index, percent: "0-25%" },
        { label: "25% of data", start: q1Index, end: medianIndex, percent: "25-50%" },
        { label: "25% of data", start: medianIndex, end: q3Index, percent: "50-75%" },
        { label: "25% of data", start: q3Index, end: n - 1, percent: "75-100%" }
      ];
      
      quartileRanges.forEach((range, i) => {
        const startX = xScale(stats.sorted[range.start]);
        const endX = xScale(stats.sorted[range.end]);
        const midX = (startX + endX) / 2;
        
        // Percentage label
        g.append("text")
          .attr("x", midX)
          .attr("y", dataZoneY - 25)
          .attr("text-anchor", "middle")
          .attr("fill", "#999")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .text(range.percent)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(1000 + i * 100)
          .attr("opacity", 1);
        
        // "25% of data" label
        g.append("text")
          .attr("x", midX)
          .attr("y", dataZoneY - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#666")
          .attr("font-size", "10px")
          .text(range.label)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(1000 + i * 100)
          .attr("opacity", 1);
      });
    }
    
    // Zone 2: Percentile visualization
    if (animationStep >= 1) {
      const percentileY = dataZoneY + dataZoneHeight + 60;
      
      // Percentile explanation
      g.append("text")
        .attr("x", width / 2)
        .attr("y", percentileY)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .text("Understanding Percentiles")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1200)
        .attr("opacity", 1);
      
      // Visual percentile bars
      const barHeight = 30;
      const barY = percentileY + 20;
      
      // Background bar
      g.append("rect")
        .attr("x", xScale(stats.min))
        .attr("y", barY)
        .attr("width", xScale(stats.max) - xScale(stats.min))
        .attr("height", barHeight)
        .attr("fill", "#1a1a1a")
        .attr("stroke", "#333")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1300)
        .attr("opacity", 1);
      
      // Colored segments for each quartile
      const segments = [
        { start: stats.min, end: stats.q1, color: statColorMap.min, label: "25%" },
        { start: stats.q1, end: stats.median, color: statColorMap.q1, label: "25%" },
        { start: stats.median, end: stats.q3, color: statColorMap.median, label: "25%" },
        { start: stats.q3, end: stats.max, color: statColorMap.q3, label: "25%" }
      ];
      
      segments.forEach((seg, i) => {
        const segX = xScale(seg.start);
        const segWidth = xScale(seg.end) - segX;
        
        g.append("rect")
          .attr("x", segX)
          .attr("y", barY)
          .attr("width", 0)
          .attr("height", barHeight)
          .attr("fill", seg.color)
          .attr("opacity", 0.3)
          .transition()
          .duration(600)
          .delay(1400 + i * 150)
          .attr("width", segWidth);
        
        // Percentage text inside each segment
        g.append("text")
          .attr("x", segX + segWidth / 2)
          .attr("y", barY + barHeight / 2 + 5)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .text(seg.label)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(1600 + i * 150)
          .attr("opacity", 1);
      });
    }
    
    // Zone 3: Box plot visualization
    const boxZoneY = centerY + 40;
    const boxZoneHeight = 80;
    const boxY = boxZoneY + boxZoneHeight / 2;
    const boxHeight = 50;
    
    // Title for box plot
    g.append("text")
      .attr("x", width / 2)
      .attr("y", boxZoneY - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Box Plot Representation")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(1500)
      .attr("opacity", 1);
    
    // Main statistics for labeling
    const mainStats = [
      { key: 'min', value: stats.min, color: statColorMap.min, label: 'Min' },
      { key: 'q1', value: stats.q1, color: statColorMap.q1, label: 'Q1' },
      { key: 'median', value: stats.median, color: statColorMap.median, label: 'Median' },
      { key: 'q3', value: stats.q3, color: statColorMap.q3, label: 'Q3' },
      { key: 'max', value: stats.max, color: statColorMap.max, label: 'Max' }
    ];
    
    if (animationStep >= 1) {
      // IQR box - filled box from Q1 to Q3
      g.append("rect")
        .attr("x", xScale(stats.q1))
        .attr("y", boxY - boxHeight/2)
        .attr("width", 0)
        .attr("height", boxHeight)
        .attr("fill", "#2a2a2a")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .transition()
        .duration(800)
        .delay(500)
        .attr("width", xScale(stats.q3) - xScale(stats.q1));
      
      // Median line in box
      g.append("line")
        .attr("x1", xScale(stats.median))
        .attr("x2", xScale(stats.median))
        .attr("y1", boxY - boxHeight/2)
        .attr("y2", boxY + boxHeight/2)
        .attr("stroke", statColorMap.median)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(700)
        .attr("opacity", 1);
      
      // Left whisker (min to Q1)
      g.append("line")
        .attr("x1", xScale(stats.min))
        .attr("x2", xScale(stats.min))
        .attr("y1", boxY)
        .attr("y2", boxY)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .transition()
        .duration(800)
        .delay(900)
        .attr("x2", xScale(stats.q1));
      
      // Right whisker (Q3 to max)
      g.append("line")
        .attr("x1", xScale(stats.q3))
        .attr("x2", xScale(stats.q3))
        .attr("y1", boxY)
        .attr("y2", boxY)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .transition()
        .duration(800)
        .delay(1100)
        .attr("x2", xScale(stats.max));
      
      // End caps for whiskers
      // Min cap
      g.append("line")
        .attr("x1", xScale(stats.min))
        .attr("x2", xScale(stats.min))
        .attr("y1", boxY - boxHeight/3)
        .attr("y2", boxY + boxHeight/3)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .delay(900)
        .attr("opacity", 1);
      
      // Max cap
      g.append("line")
        .attr("x1", xScale(stats.max))
        .attr("x2", xScale(stats.max))
        .attr("y1", boxY - boxHeight/3)
        .attr("y2", boxY + boxHeight/3)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .delay(1100)
        .attr("opacity", 1);
    }
    
    // Labels with values - automatically appear after box plot
    if (animationStep >= 1) {
      // Prepare label elements for overlap prevention
      const labelElements = mainStats.map((stat, i) => ({
        x: xScale(stat.value),
        y: bottomY - 35,
        width: (`${stat.label} = ${stat.value}`).length * 7 + 10,
        text: `${stat.label} = ${stat.value}`,
        color: stat.color,
        originalIndex: i
      }));
      
      // Apply overlap prevention
      const adjustedLabels = preventTextOverlap(labelElements);
      
      adjustedLabels.forEach((label, i) => {
        const labelGroup = g.append("g")
          .attr("opacity", 0);
        
        // Connection line if label was moved
        if (Math.abs(label.x - xScale(mainStats[label.originalIndex].value)) > 5) {
          labelGroup.append("line")
            .attr("x1", xScale(mainStats[label.originalIndex].value))
            .attr("y1", bottomY - 10)
            .attr("x2", label.x)
            .attr("y2", label.y + 10)
            .attr("stroke", label.color)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.5);
        }
        
        // Label background
        labelGroup.append("rect")
          .attr("x", label.x - label.width/2)
          .attr("y", label.y - 2)
          .attr("width", label.width)
          .attr("height", 20)
          .attr("fill", "rgba(26, 26, 26, 0.9)")
          .attr("stroke", label.color)
          .attr("stroke-width", 1)
          .attr("rx", 3);
        
        // Label text
        labelGroup.append("text")
          .attr("x", label.x)
          .attr("y", label.y + 13)
          .attr("text-anchor", "middle")
          .attr("fill", label.color)
          .attr("font-weight", "bold")
          .attr("font-size", "13px")
          .text(label.text);
        
        // Apply transition to the group
        labelGroup.transition()
          .duration(300)
          .delay(1800 + label.originalIndex * 100)
          .attr("opacity", 1);
      });
    }
  };
  
  const renderSpread = (g, width, height) => {
    // Helper calculations for proper positioning within margins
    const margin = { top: 50, right: 40, bottom: 50, left: 60 };
    const drawHeight = height - margin.top - margin.bottom;
    const centerY = margin.top + drawHeight / 2;
    const bottomY = height - margin.bottom;
    
    const xScale = d3.scaleLinear()
      .domain([0, 45])
      .range([0, width]);
    
    // Different visualization based on animation step
    // Step 0: Range visualization
    // Step 1: Variance/SD visualization  
    // Step 2: Coefficient of variation comparison
    // Step 3: All measures together
    
    // For step 3, create a clean comparison layout
    if (animationStep === 3) {
      // Title for comparison view
      g.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Comparing Measures of Spread")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
      
      // Create three panels for side-by-side comparison
      const panelHeight = (drawHeight - 60) / 3;
      const panelSpacing = 20;
      
      // Panel 1: Range
      const rangePanel = g.append("g")
        .attr("transform", `translate(0, ${margin.top})`);
      
      rangePanel.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", panelHeight)
        .attr("fill", "#1a1a1a")
        .attr("stroke", statColors.range)
        .attr("stroke-width", 1)
        .attr("opacity", 0.3)
        .attr("rx", 5);
      
      // Range content
      const rangeY = panelHeight / 2;
      rangePanel.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("fill", statColors.range)
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Range: Max - Min");
      
      // Range visualization
      rangePanel.append("line")
        .attr("x1", xScale(stats.min))
        .attr("x2", xScale(stats.min))
        .attr("y1", rangeY)
        .attr("y2", rangeY)
        .attr("stroke", statColors.range)
        .attr("stroke-width", 4)
        .transition()
        .duration(1000)
        .attr("x2", xScale(stats.max));
      
      [stats.min, stats.max].forEach((value, i) => {
        rangePanel.append("circle")
          .attr("cx", xScale(value))
          .attr("cy", rangeY)
          .attr("r", 0)
          .attr("fill", statColors.range)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .transition()
          .duration(500)
          .delay(i * 300)
          .attr("r", 6);
        
        rangePanel.append("text")
          .attr("x", xScale(value))
          .attr("y", rangeY - 15)
          .attr("text-anchor", "middle")
          .attr("fill", statColors.range)
          .attr("font-size", "12px")
          .text(value)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 300 + 200)
          .attr("opacity", 1);
      });
      
      rangePanel.append("text")
        .attr("x", width - 10)
        .attr("y", rangeY + 5)
        .attr("text-anchor", "end")
        .attr("fill", statColors.range)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`= ${stats.range}`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(800)
        .attr("opacity", 1);
      
      // Pros/Cons
      rangePanel.append("text")
        .attr("x", 10)
        .attr("y", panelHeight - 20)
        .attr("fill", "#666")
        .attr("font-size", "11px")
        .text("Simple to calculate but affected by outliers");
      
      // Panel 2: Standard Deviation
      const sdPanel = g.append("g")
        .attr("transform", `translate(0, ${margin.top + panelHeight + panelSpacing})`);
      
      sdPanel.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", panelHeight)
        .attr("fill", "#1a1a1a")
        .attr("stroke", statColors.highlight)
        .attr("stroke-width", 1)
        .attr("opacity", 0.3)
        .attr("rx", 5);
      
      // SD content
      const sdY = panelHeight / 2;
      sdPanel.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("fill", statColors.highlight)
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Standard Deviation: Average Distance from Mean");
      
      // Mean line
      sdPanel.append("line")
        .attr("x1", xScale(stats.mean))
        .attr("x2", xScale(stats.mean))
        .attr("y1", sdY - 20)
        .attr("y2", sdY + 20)
        .attr("stroke", statColors.mean)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
      
      // SD bars
      [-1, 1].forEach(n => {
        const x = xScale(stats.mean + n * stats.stdDev);
        sdPanel.append("rect")
          .attr("x", Math.min(xScale(stats.mean), x))
          .attr("y", sdY - 15)
          .attr("width", 0)
          .attr("height", 30)
          .attr("fill", statColors.highlight)
          .attr("opacity", 0.2)
          .transition()
          .duration(800)
          .delay(500)
          .attr("width", Math.abs(x - xScale(stats.mean)));
        
        sdPanel.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", sdY - 20)
          .attr("y2", sdY + 20)
          .attr("stroke", statColors.highlight)
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(500)
          .attr("opacity", 1);
      });
      
      sdPanel.append("text")
        .attr("x", width - 10)
        .attr("y", sdY + 5)
        .attr("text-anchor", "end")
        .attr("fill", statColors.highlight)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`σ = ${formatNumber(stats.stdDev, 2)}`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(800)
        .attr("opacity", 1);
      
      // Pros/Cons
      sdPanel.append("text")
        .attr("x", 10)
        .attr("y", panelHeight - 20)
        .attr("fill", "#666")
        .attr("font-size", "11px")
        .text("Uses all data points, less affected by outliers, more complex");
      
      // Panel 3: Coefficient of Variation
      const cvPanel = g.append("g")
        .attr("transform", `translate(0, ${margin.top + 2 * (panelHeight + panelSpacing)})`);
      
      cvPanel.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", panelHeight)
        .attr("fill", "#1a1a1a")
        .attr("stroke", statColors.q3)
        .attr("stroke-width", 1)
        .attr("opacity", 0.3)
        .attr("rx", 5);
      
      // CV content
      const cvY = panelHeight / 2;
      cvPanel.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("fill", statColors.q3)
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Coefficient of Variation: Relative Spread (SD/Mean)");
      
      // Visual bars showing ratio
      const barHeight = 20;
      const maxBarWidth = width * 0.5;
      
      // Mean bar (reference)
      cvPanel.append("rect")
        .attr("x", 50)
        .attr("y", cvY - 10)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", statColors.mean)
        .attr("opacity", 0.7)
        .transition()
        .duration(800)
        .delay(200)
        .attr("width", maxBarWidth);
      
      cvPanel.append("text")
        .attr("x", 45)
        .attr("y", cvY + 5)
        .attr("text-anchor", "end")
        .attr("fill", statColors.mean)
        .attr("font-size", "12px")
        .text("Mean");
      
      // SD bar (proportion of mean)
      const sdBarWidth = maxBarWidth * (stats.stdDev / stats.mean);
      cvPanel.append("rect")
        .attr("x", 50)
        .attr("y", cvY - 10)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", statColors.highlight)
        .attr("opacity", 0.7)
        .transition()
        .duration(800)
        .delay(600)
        .attr("width", sdBarWidth);
      
      cvPanel.append("text")
        .attr("x", 50 + sdBarWidth + 5)
        .attr("y", cvY + 5)
        .attr("fill", statColors.highlight)
        .attr("font-size", "12px")
        .text(`SD (${formatNumber(stats.cv, 0)}% of mean)`);
      
      cvPanel.append("text")
        .attr("x", width - 10)
        .attr("y", cvY + 5)
        .attr("text-anchor", "end")
        .attr("fill", statColors.q3)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`CV = ${formatNumber(stats.cv, 1)}%`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(800)
        .attr("opacity", 1);
      
      // Pros/Cons
      cvPanel.append("text")
        .attr("x", 10)
        .attr("y", panelHeight - 20)
        .attr("fill", "#666")
        .attr("font-size", "11px")
        .text("Scale-independent comparison, not useful when mean ≈ 0");
      
      // Bottom axis for reference
      g.append("g")
        .attr("transform", `translate(0,${bottomY})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#999")
        .attr("text-anchor", "middle")
        .text("Number of Accidents");
      
      return; // Exit early for comparison view
    }
    
    // X-axis - positioned at the bottom
    g.append("g")
      .attr("transform", `translate(0,${bottomY})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Number of Accidents");
    
    if (animationStep === 0) {
      // Range Visualization
      const rangeY = centerY; // Adjusted for better centering
      
      // Title for range
      g.append("text")
        .attr("x", width / 2)
        .attr("y", rangeY - 40) // Adjusted spacing
        .attr("text-anchor", "middle")
        .attr("fill", statColors.range)
        .attr("font-weight", "bold")
        .text("Range: Simplest Measure of Spread")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
      
      // Range line
      g.append("line")
        .attr("x1", xScale(stats.min))
        .attr("x2", xScale(stats.min))
        .attr("y1", rangeY)
        .attr("y2", rangeY)
        .attr("stroke", statColors.range)
        .attr("stroke-width", 4)
        .transition()
        .duration(1000)
        .attr("x2", xScale(stats.max));
      
      // Min and Max points
      [stats.min, stats.max].forEach((value, i) => {
        // Large circles for min/max
        g.append("circle")
          .attr("cx", xScale(value))
          .attr("cy", rangeY)
          .attr("r", 0)
          .attr("fill", statColors.range)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .transition()
          .duration(500)
          .delay(i * 300)
          .attr("r", 8);
        
        // Labels with better positioning
        g.append("text")
          .attr("x", xScale(value))
          .attr("y", rangeY - 20) // More space above circles
          .attr("text-anchor", "middle")
          .attr("fill", statColors.range)
          .attr("font-weight", "bold")
          .text(i === 0 ? `Min = ${value}` : `Max = ${value}`)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 300 + 200)
          .attr("opacity", 1);
      });
      
      // Range value in the middle
      g.append("text")
        .attr("x", xScale((stats.min + stats.max) / 2))
        .attr("y", rangeY + 30) // Slightly more space below
        .attr("text-anchor", "middle")
        .attr("fill", statColors.range)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`Range = ${stats.range}`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1000)
        .attr("opacity", 1);
      
      // Show all data points
      data.forEach((value, i) => {
        g.append("circle")
          .attr("cx", xScale(value))
          .attr("cy", rangeY + 70) // Adjusted for better spacing
          .attr("r", 0)
          .attr("fill", statColors.normal)
          .attr("opacity", 0.4)
          .transition()
          .duration(300)
          .delay(i * 20 + 1200)
          .attr("r", 3);
      });
    }
    
    if (animationStep === 1) {
      // Variance/Standard Deviation Visualization
      const sdY = centerY; // Better vertical centering
      
      // Title
      g.append("text")
        .attr("x", width / 2)
        .attr("y", sdY - 60) // Adjusted spacing
        .attr("text-anchor", "middle")
        .attr("fill", statColors.highlight)
        .attr("font-weight", "bold")
        .text("Variance & Standard Deviation: Average Spread from Mean")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
      
      // Mean line
      g.append("line")
        .attr("x1", xScale(stats.mean))
        .attr("x2", xScale(stats.mean))
        .attr("y1", sdY - 40)
        .attr("y2", sdY + 40)
        .attr("stroke", statColors.mean)
        .attr("stroke-width", 3)
        .attr("opacity", 0.8);
      
      // Mean label
      g.append("text")
        .attr("x", xScale(stats.mean))
        .attr("y", sdY - 50) // More space above mean line
        .attr("text-anchor", "middle")
        .attr("fill", statColors.mean)
        .attr("font-weight", "bold")
        .text(`Mean = ${formatNumber(stats.mean, 1)}`);
      
      // Data points with deviation lines
      stats.sorted.forEach((value, i) => {
        const deviation = value - stats.mean;
        const squaredDev = deviation * deviation;
        
        // Point
        g.append("circle")
          .attr("cx", xScale(value))
          .attr("cy", sdY)
          .attr("r", 0)
          .attr("fill", Math.abs(deviation) > stats.stdDev ? statColors.outlier : statColors.normal)
          .attr("opacity", 0.7)
          .transition()
          .duration(400)
          .delay(i * 15)
          .attr("r", 4);
        
        // Deviation line
        g.append("line")
          .attr("x1", xScale(stats.mean))
          .attr("y1", sdY)
          .attr("x2", xScale(stats.mean))
          .attr("y2", sdY)
          .attr("stroke", deviation > 0 ? statColors.highlight : statColors.q1)
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.4)
          .transition()
          .duration(600)
          .delay(i * 15 + 200)
          .attr("x2", xScale(value));
      });
      
      // Standard deviation regions
      [-1, 1].forEach(n => {
        const x1 = xScale(stats.mean);
        const x2 = xScale(stats.mean + n * stats.stdDev);
        
        // Shaded region
        g.append("rect")
          .attr("x", Math.min(x1, x2))
          .attr("y", sdY - 30)
          .attr("width", 0)
          .attr("height", 60)
          .attr("fill", statColors.highlight)
          .attr("opacity", 0.1)
          .transition()
          .duration(800)
          .delay(1000)
          .attr("width", Math.abs(x2 - x1));
        
        // SD line
        g.append("line")
          .attr("x1", x2)
          .attr("x2", x2)
          .attr("y1", sdY - 35)
          .attr("y2", sdY + 35)
          .attr("stroke", statColors.highlight)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,2")
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(1000)
          .attr("opacity", 0.7);
        
        // Label with better positioning to avoid overlap
        const labelOffset = n > 0 ? 15 : -15; // Offset labels to avoid overlapping with mean
        g.append("text")
          .attr("x", x2 + labelOffset)
          .attr("y", sdY + 55) // More space below
          .attr("text-anchor", "middle")
          .attr("fill", statColors.highlight)
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(`${n > 0 ? '+' : ''}1σ`)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(1200)
          .attr("opacity", 1);
      });
      
      // SD value display
      g.append("text")
        .attr("x", width / 2)
        .attr("y", sdY + 80) // More space below
        .attr("text-anchor", "middle")
        .attr("fill", statColors.highlight)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`σ = ${formatNumber(stats.stdDev, 2)}`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1400)
        .attr("opacity", 1);
    }
    
    if (animationStep === 2) {
      // Coefficient of Variation Visualization
      const cvY = centerY; // Better positioning for visibility
      
      // Title
      g.append("text")
        .attr("x", width / 2)
        .attr("y", cvY - 40) // Adjusted spacing
        .attr("text-anchor", "middle")
        .attr("fill", statColors.q3)
        .attr("font-weight", "bold")
        .text("Coefficient of Variation: Relative Spread")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);
      
      // Visual comparison bars
      const barWidth = width * 0.6;
      const barX = (width - barWidth) / 2;
      const barHeight = 25; // Slightly larger bars
      
      // Mean bar
      g.append("rect")
        .attr("x", barX)
        .attr("y", cvY)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", statColors.mean)
        .attr("opacity", 0.7)
        .transition()
        .duration(800)
        .delay(200)
        .attr("width", barWidth * (stats.mean / 35));
      
      // SD overlay
      g.append("rect")
        .attr("x", barX)
        .attr("y", cvY)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("fill", statColors.highlight)
        .attr("opacity", 0.5)
        .transition()
        .duration(800)
        .delay(600)
        .attr("width", barWidth * (stats.stdDev / 35));
      
      // Labels - positioned to avoid overlap
      g.append("text")
        .attr("x", barX + barWidth * (stats.mean / 35) / 2)
        .attr("y", cvY + barHeight + 20) // Below bar
        .attr("text-anchor", "middle")
        .attr("fill", statColors.mean)
        .attr("font-size", "12px")
        .text(`Mean = ${formatNumber(stats.mean, 1)}`)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1000)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", barX + barWidth * (stats.stdDev / 35) / 2)
        .attr("y", cvY - 10) // Above bar
        .attr("text-anchor", "middle")
        .attr("fill", statColors.highlight)
        .attr("font-size", "12px")
        .text(`SD = ${formatNumber(stats.stdDev, 1)}`)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1200)
        .attr("opacity", 1);
      
      // CV formula and value - with more spacing
      g.append("text")
        .attr("x", width / 2)
        .attr("y", cvY + barHeight + 50) // More space below bars
        .attr("text-anchor", "middle")
        .attr("fill", statColors.q3)
        .attr("font-size", "14px")
        .text(`CV = (σ / μ) × 100 = ${formatNumber(stats.cv, 1)}%`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1400)
        .attr("opacity", 1);
      
      // Interpretation
      g.append("text")
        .attr("x", width / 2)
        .attr("y", cvY + barHeight + 75) // More space for interpretation
        .attr("text-anchor", "middle")
        .attr("fill", "#999")
        .attr("font-size", "11px")
        .text(`High variability: SD is ${formatNumber(stats.cv, 0)}% of the mean`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(1600)
        .attr("opacity", 1);
    }
  };
  
  const renderOutliers = (g, width, height) => {
    // Helper calculations for proper positioning within margins
    const margin = { top: 50, right: 40, bottom: 50, left: 60 };
    const drawHeight = height - margin.top - margin.bottom;
    const centerY = margin.top + drawHeight / 2;
    const bottomY = height - margin.bottom;
    
    const xScale = d3.scaleLinear()
      .domain([0, 45])
      .range([0, width]);
    
    // Center the main visualization
    const y = centerY;
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${bottomY})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Number of Accidents");
    
    // IQR box and fences with better vertical centering
    const boxY = y - 40;
    const boxHeight = 80;
    
    // IQR box with label
    g.append("rect")
      .attr("x", xScale(stats.q1))
      .attr("y", boxY)
      .attr("width", xScale(stats.q3) - xScale(stats.q1))
      .attr("height", boxHeight)
      .attr("fill", statColors.highlight)
      .attr("fill-opacity", 0.2)
      .attr("stroke", statColors.highlight)
      .attr("stroke-width", 2);
    
    // IQR label
    g.append("text")
      .attr("x", xScale((stats.q1 + stats.q3) / 2))
      .attr("y", boxY - 5)
      .attr("text-anchor", "middle")
      .attr("fill", statColors.highlight)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(`IQR = ${stats.iqr}`);
    
    // Q1 and Q3 lines with labels
    [{ value: stats.q1, label: 'Q1' }, { value: stats.q3, label: 'Q3' }].forEach((q) => {
      g.append("line")
        .attr("x1", xScale(q.value))
        .attr("x2", xScale(q.value))
        .attr("y1", boxY)
        .attr("y2", boxY + boxHeight)
        .attr("stroke", statColors.highlight)
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
      
      g.append("text")
        .attr("x", xScale(q.value))
        .attr("y", boxY + boxHeight + 15)
        .attr("text-anchor", "middle")
        .attr("fill", statColors.highlight)
        .attr("font-size", "11px")
        .text(`${q.label} = ${q.value}`);
    });
    
    // Fences with calculation visualization
    [{ fence: stats.lowerFence, label: 'Lower Fence', formula: `Q1 - 1.5×IQR`, calculation: `${stats.q1} - 1.5×${stats.iqr}` },
     { fence: stats.upperFence, label: 'Upper Fence', formula: `Q3 + 1.5×IQR`, calculation: `${stats.q3} + 1.5×${stats.iqr}` }].forEach((item, i) => {
      if (item.fence >= -5 && item.fence <= 40) {
        const fenceX = xScale(Math.max(0, Math.min(35, item.fence)));
        
        // Fence line with better vertical distribution
        g.append("line")
          .attr("x1", fenceX)
          .attr("x2", fenceX)
          .attr("y1", margin.top + drawHeight * 0.15)
          .attr("y2", bottomY - drawHeight * 0.15)
          .attr("stroke", statColors.outlier)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(i * 200)
          .attr("opacity", 0.7);
        
        // Fence label with calculation
        const labelGroup = g.append("g")
          .attr("opacity", 0);
        
        labelGroup.append("text")
          .attr("x", fenceX)
          .attr("y", margin.top + drawHeight * 0.1)
          .attr("text-anchor", "middle")
          .attr("fill", statColors.outlier)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(item.label);
        
        labelGroup.append("text")
          .attr("x", fenceX)
          .attr("y", margin.top + drawHeight * 0.1 + 15)
          .attr("text-anchor", "middle")
          .attr("fill", statColors.outlier)
          .attr("font-size", "10px")
          .text(item.formula);
        
        labelGroup.append("text")
          .attr("x", fenceX)
          .attr("y", margin.top + drawHeight * 0.1 + 28)
          .attr("text-anchor", "middle")
          .attr("fill", statColors.outlier)
          .attr("font-size", "10px")
          .text(`= ${formatNumber(item.fence, 1)}`);
        
        // Apply transition to the group after creating elements
        labelGroup.transition()
          .duration(800)
          .delay(i * 200)
          .attr("opacity", 1);
      }
    });
    
    // Normal range shading with better vertical centering
    const normalRangeX1 = xScale(Math.max(0, stats.lowerFence));
    const normalRangeX2 = xScale(Math.min(35, stats.upperFence));
    
    g.append("rect")
      .attr("x", normalRangeX1)
      .attr("y", y - 50)
      .attr("width", normalRangeX2 - normalRangeX1)
      .attr("height", 100)
      .attr("fill", statColors.normal)
      .attr("fill-opacity", 0.1)
      .attr("stroke", "none");
    
    // Normal range label with better positioning
    g.append("text")
      .attr("x", (normalRangeX1 + normalRangeX2) / 2)
      .attr("y", y + 65)
      .attr("text-anchor", "middle")
      .attr("fill", statColors.normal)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Normal Range")
      .attr("opacity", 0.7);
    
    // Data points with enhanced outlier visualization
    data.forEach((value, i) => {
      const isOutlier = value < stats.lowerFence || value > stats.upperFence;
      
      const circle = g.append("circle")
        .attr("cx", xScale(value))
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", isOutlier ? '#ef4444' : '#6b7280')
        .attr("stroke", isOutlier ? "#fff" : "none")
        .attr("stroke-width", 2)
        .attr("opacity", isOutlier ? 1 : 0.6)
        .transition()
        .duration(500)
        .delay(i * 20)
        .attr("r", isOutlier ? 8 : 5);
      
      // Outlier labels
      if (isOutlier) {
        // Value label with better spacing
        g.append("text")
          .attr("x", xScale(value))
          .attr("y", y - 20)
          .attr("text-anchor", "middle")
          .attr("fill", '#ef4444')
          .attr("font-weight", "bold")
          .attr("font-size", "14px")
          .text(value)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(800)
          .attr("opacity", 1);
        
        // "Outlier" label with better spacing
        if (animationStep >= 1) {
          g.append("text")
            .attr("x", xScale(value))
            .attr("y", y - 35)
            .attr("text-anchor", "middle")
            .attr("fill", '#ef4444')
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .text("Outlier")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .delay(1000)
            .attr("opacity", 1);
        }
      }
    });
    
    // Outlier summary box with better positioning
    if (animationStep >= 1) {
      const summaryBox = g.append("g")
        .attr("transform", `translate(${width - 180}, ${margin.top + drawHeight * 0.15})`);
      
      // Removed black background rect for outlier summary box to prevent overlap
      
      summaryBox.append("text")
        .attr("x", 5)
        .attr("y", 5)
        .attr("fill", statColors.outlier)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("Outliers Detected:")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1400)
        .attr("opacity", 1);
      
      const outlierValues = stats.outliers.sort((a, b) => b - a);
      outlierValues.forEach((value, i) => {
        summaryBox.append("text")
          .attr("x", 10)
          .attr("y", 25 + i * 18)
          .attr("fill", '#ef4444')
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .attr("font-family", "monospace")
          .text(`• ${value} accidents`)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(1500 + i * 100)
          .attr("opacity", 1);
      });
    }
  };
  
  const renderSummary = (g, width, height) => {
    // Use full available height effectively with cleaner layout
    const margin = { top: 20, right: 60, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear layout sections
    const topPanelHeight = innerHeight * 0.45;  // Box plot with quartiles
    const middlePanelHeight = innerHeight * 0.45;  // Histogram with central tendency
    const spacing = innerHeight * 0.05;
    
    const xScale = d3.scaleLinear()
      .domain([0, 45])
      .range([margin.left, width - margin.right]);
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Central Tendency vs Spread: A Complete Picture");
    
    // TOP PANEL: Box Plot with Quartiles
    const boxPlotY = margin.top + 40;
    const boxHeight = 80;
    const boxY = boxPlotY + topPanelHeight / 2 - boxHeight / 2;
    
    // Box plot title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", boxPlotY + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("font-size", "14px")
      .text("Box Plot: Understanding Data Spread Through Quartiles");
    
    // IQR box with clear gradient
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "iqr-gradient-clean")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", statColors.q1)
      .attr("stop-opacity", 0.4);
    
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", statColors.median)
      .attr("stop-opacity", 0.6);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", statColors.q3)
      .attr("stop-opacity", 0.4);
    
    // IQR box
    g.append("rect")
      .attr("x", xScale(stats.q1))
      .attr("y", boxY)
      .attr("width", 0)
      .attr("height", boxHeight)
      .attr("fill", "url(#iqr-gradient-clean)")
      .attr("stroke", statColors.highlight)
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .attr("width", xScale(stats.q3) - xScale(stats.q1));
    
    // Whiskers
    g.append("line")
      .attr("x1", xScale(stats.min))
      .attr("x2", xScale(stats.q1))
      .attr("y1", boxY + boxHeight / 2)
      .attr("y2", boxY + boxHeight / 2)
      .attr("stroke", statColors.normal)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(800)
      .attr("opacity", 0.7);
    
    g.append("line")
      .attr("x1", xScale(stats.q3))
      .attr("x2", xScale(stats.max))
      .attr("y1", boxY + boxHeight / 2)
      .attr("y2", boxY + boxHeight / 2)
      .attr("stroke", statColors.normal)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(800)
      .attr("opacity", 0.7);
    
    // Min and Max caps
    [stats.min, stats.max].forEach((value, i) => {
      g.append("line")
        .attr("x1", xScale(value))
        .attr("x2", xScale(value))
        .attr("y1", boxY + boxHeight * 0.25)
        .attr("y2", boxY + boxHeight * 0.75)
        .attr("stroke", statColors.range)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1000 + i * 100)
        .attr("opacity", 0.8);
    });
    
    // Key quartile lines
    const quartileLines = [
      { value: stats.q1, label: 'Q1', sublabel: '25%', color: statColors.q1 },
      { value: stats.median, label: 'Median', sublabel: '50%', color: statColors.median },
      { value: stats.q3, label: 'Q3', sublabel: '75%', color: statColors.q3 }
    ];
    
    quartileLines.forEach((line, i) => {
      const x = xScale(line.value);
      
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", boxY)
        .attr("y2", boxY + boxHeight)
        .attr("stroke", line.color)
        .attr("stroke-width", 3)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1200 + i * 150)
        .attr("opacity", 0.9);
      
      // Labels
      g.append("text")
        .attr("x", x)
        .attr("y", boxY - 10)
        .attr("text-anchor", "middle")
        .attr("fill", line.color)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(line.label)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1200 + i * 150)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", x)
        .attr("y", boxY + boxHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", line.color)
        .attr("font-size", "11px")
        .text(line.sublabel)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(1200 + i * 150)
        .attr("opacity", 0.8);
    });
    
    // IQR and Range annotations
    const iqrMidX = xScale((stats.q1 + stats.q3) / 2);
    g.append("text")
      .attr("x", iqrMidX)
      .attr("y", boxY + boxHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`IQR = ${stats.iqr}`)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(1600)
      .attr("opacity", 1);
    
    // Range annotation
    g.append("text")
      .attr("x", xScale((stats.min + stats.max) / 2))
      .attr("y", boxY + boxHeight + 50)
      .attr("text-anchor", "middle")
      .attr("fill", statColors.range)
      .attr("font-size", "12px")
      .text(`Range = ${stats.range} (${stats.min} to ${stats.max})`)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(1800)
      .attr("opacity", 0.8);
    
    // MIDDLE PANEL: Histogram with Central Tendency
    const histogramY = boxPlotY + topPanelHeight + spacing;
    const histogramHeight = middlePanelHeight * 0.7;
    
    // Histogram title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", histogramY)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("font-size", "14px")
      .text("Distribution with Mean and Standard Deviation");
    
    const bins = d3.histogram()
      .domain([0, 40])
      .thresholds(12)
      (data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([histogramHeight, 0]);
    
    // Histogram bars
    g.selectAll(".hist-bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "hist-bar")
      .attr("x", d => xScale(d.x0))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("y", histogramY + 20 + histogramHeight)
      .attr("height", 0)
      .attr("fill", statColors.normal)
      .attr("opacity", 0.7)
      .transition()
      .duration(800)
      .delay((d, i) => 2000 + i * 50)
      .attr("y", d => histogramY + 20 + yScale(d.length))
      .attr("height", d => histogramHeight - yScale(d.length));
    
    // Mean line with standard deviation shading
    const meanX = xScale(stats.mean);
    const sdLeft = xScale(Math.max(0, stats.mean - stats.stdDev));
    const sdRight = xScale(Math.min(40, stats.mean + stats.stdDev));
    
    // Standard deviation shading
    g.append("rect")
      .attr("x", sdLeft)
      .attr("y", histogramY + 20)
      .attr("width", 0)
      .attr("height", histogramHeight)
      .attr("fill", statColors.mean)
      .attr("opacity", 0.1)
      .transition()
      .duration(800)
      .delay(2800)
      .attr("width", sdRight - sdLeft);
    
    // Mean line
    g.append("line")
      .attr("x1", meanX)
      .attr("x2", meanX)
      .attr("y1", histogramY + 20)
      .attr("y2", histogramY + 20 + histogramHeight)
      .attr("stroke", statColors.mean)
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(3000)
      .attr("opacity", 0.9);
    
    // Mean label
    g.append("text")
      .attr("x", meanX)
      .attr("y", histogramY + 10)
      .attr("text-anchor", "middle")
      .attr("fill", statColors.mean)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(`Mean = ${formatNumber(stats.mean, 1)}`)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(3000)
      .attr("opacity", 1);
    
    // SD annotation
    g.append("text")
      .attr("x", (sdLeft + sdRight) / 2)
      .attr("y", histogramY + 20 + histogramHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", statColors.mean)
      .attr("font-size", "12px")
      .text(`σ = ${formatNumber(stats.stdDev, 1)}`)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(3200)
      .attr("opacity", 0.8);
    
    // Median line for comparison
    const medianX = xScale(stats.median);
    g.append("line")
      .attr("x1", medianX)
      .attr("x2", medianX)
      .attr("y1", histogramY + 20)
      .attr("y2", histogramY + 20 + histogramHeight)
      .attr("stroke", statColors.median)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(3400)
      .attr("opacity", 0.7);
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom + 20})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#999")
      .attr("text-anchor", "middle")
      .text("Number of Accidents");
    
    // KEY INSIGHTS PANEL (instead of complex table)
    if (animationStep >= 1) {
      const insightX = width - 240;
      const insightY = histogramY + 30;
      
      // Insight box
      g.append("rect")
        .attr("x", insightX - 10)
        .attr("y", insightY - 10)
        .attr("width", 220)
        .attr("height", 160)
        .attr("fill", "#0a0a0a")
        .attr("stroke", "#444")
        .attr("stroke-width", 1)
        .attr("rx", 8)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(3600)
        .attr("opacity", 0.9);
      
      // Title
      g.append("text")
        .attr("x", insightX + 100)
        .attr("y", insightY + 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Key Insights")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(3800)
        .attr("opacity", 1);
      
      // Insights
      const insights = [
        { text: "Mean > Median", subtext: "Right-skewed distribution", color: statColors.mean },
        { text: `CV = ${formatNumber(stats.cv, 0)}%`, subtext: "High relative variability", color: "#999" },
        { text: `${stats.outliers.length} outliers`, subtext: "Extreme values present", color: statColors.outlier },
        { text: "50% of data", subtext: `Between ${stats.q1} and ${stats.q3}`, color: statColors.highlight }
      ];
      
      insights.forEach((insight, i) => {
        const yPos = insightY + 35 + i * 30;
        
        g.append("text")
          .attr("x", insightX)
          .attr("y", yPos)
          .attr("fill", insight.color)
          .attr("font-size", "13px")
          .attr("font-weight", "bold")
          .text(insight.text)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(4000 + i * 150)
          .attr("opacity", 1);
        
        g.append("text")
          .attr("x", insightX)
          .attr("y", yPos + 15)
          .attr("fill", "#999")
          .attr("font-size", "11px")
          .text(insight.subtext)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(4000 + i * 150)
          .attr("opacity", 0.8);
      });
    }
    
    // Educational annotations
    if (animationStep >= 2) {
      // When to use median vs mean
      const eduX = margin.left;
      const eduY = boxPlotY + 30;
      
      g.append("rect")
        .attr("x", eduX - 10)
        .attr("y", eduY - 10)
        .attr("width", 200)
        .attr("height", 100)
        .attr("fill", "#0a0a0a")
        .attr("stroke", "#444")
        .attr("stroke-width", 1)
        .attr("rx", 8)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(4800)
        .attr("opacity", 0.9);
      
      g.append("text")
        .attr("x", eduX + 90)
        .attr("y", eduY + 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .text("When to Use")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(5000)
        .attr("opacity", 1);
      
      const usage = [
        { measure: "Median:", when: "Skewed data, outliers", color: statColors.median },
        { measure: "Mean:", when: "Symmetric, no outliers", color: statColors.mean },
        { measure: "IQR:", when: "Robust spread measure", color: statColors.highlight }
      ];
      
      usage.forEach((item, i) => {
        const yPos = eduY + 35 + i * 20;
        
        g.append("text")
          .attr("x", eduX)
          .attr("y", yPos)
          .attr("fill", item.color)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(item.measure)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(5200 + i * 150)
          .attr("opacity", 1);
        
        g.append("text")
          .attr("x", eduX + 50)
          .attr("y", yPos)
          .attr("fill", "#999")
          .attr("font-size", "11px")
          .text(item.when)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(5200 + i * 150)
          .attr("opacity", 0.8);
      });
    }
  };
  
  const renderSectionContent = () => {
    switch(currentSection) {
      case 0:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Central Tendency Review</h3>
            <p className="text-neutral-300">
              Let's explore a carefully chosen dataset that clearly shows why mean, median, and mode can differ dramatically.
            </p>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-400 mb-2">Our dataset (sorted):</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {stats.sorted.map((value, i) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1 rounded font-mono text-sm ${
                      value === 3 ? 'bg-amber-900/50 text-amber-400 ring-2 ring-amber-400' : 
                      'bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <p className="text-xs text-neutral-500">n = {stats.n} road segments</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-900 p-3 rounded border border-amber-800/50">
                <p className="text-sm text-neutral-400">Mode</p>
                <p className="text-3xl font-mono text-amber-400">{stats.modes[0]}</p>
                <p className="text-xs text-neutral-500 mt-1">Most frequent value</p>
                <p className="text-xs text-amber-400/80 mt-1">Appears {stats.frequency[stats.modes[0]]} times</p>
              </div>
              <div className="bg-neutral-900 p-3 rounded border border-green-800/50">
                <p className="text-sm text-neutral-400">Median</p>
                <p className="text-3xl font-mono text-green-400">{stats.median}</p>
                <p className="text-xs text-neutral-500 mt-1">Middle value</p>
                <p className="text-xs text-green-400/80 mt-1">Position {Math.floor(stats.n / 2) + 1}</p>
              </div>
              <div className="bg-neutral-900 p-3 rounded border border-blue-800/50">
                <p className="text-sm text-neutral-400">Mean</p>
                <p className="text-3xl font-mono text-blue-400">{formatNumber(stats.mean, 1)}</p>
                <p className="text-xs text-neutral-500 mt-1">Average value</p>
                <p className="text-xs text-blue-400/80 mt-1">Σx / n</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-800/30">
              <p className="text-sm font-semibold text-purple-400 mb-2">Why are they so different?</p>
              <ul className="text-sm text-neutral-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong>Mode = 3:</strong> Two segments have exactly 3 accidents (most common)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span><strong>Median = 9:</strong> Half the segments have ≤9 accidents, half have ≥9</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong>Mean ≈ 15:</strong> Large values (25, 35, 42) pull the average up significantly</span>
                </li>
              </ul>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAnimationStep(1)}
              disabled={animationStep >= 1}
              className="mx-auto block"
            >
              Show How Outliers Pull the Mean
            </Button>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Quartiles & Five-Number Summary</h3>
            <p className="text-neutral-300">
              Quartiles divide sorted data into four equal parts, helping us understand how data is distributed.
            </p>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-400 mb-2">Five-Number Summary:</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Min', value: stats.min, position: '0th', color: '#3b82f6', desc: 'Smallest value' },
                  { label: 'Q1', value: stats.q1, position: '25th', color: '#06b6d4', desc: 'First quartile' },
                  { label: 'Median', value: stats.median, position: '50th', color: '#10b981', desc: 'Middle value' },
                  { label: 'Q3', value: stats.q3, position: '75th', color: '#14b8a6', desc: 'Third quartile' },
                  { label: 'Max', value: stats.max, position: '100th', color: '#f59e0b', desc: 'Largest value' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xs text-neutral-500">{item.position} %ile</p>
                    <p className="font-mono text-lg" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-xs text-neutral-400">{item.label}</p>
                    <p className="text-xs text-neutral-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 p-4 rounded-lg border border-cyan-800/30">
              <p className="text-sm font-semibold text-cyan-400 mb-3">Understanding Percentiles</p>
              <div className="space-y-2 text-sm text-neutral-300">
                <p>• <strong className="text-cyan-400">Q1 (25th percentile):</strong> 25% of segments have ≤{stats.q1} accidents</p>
                <p>• <strong className="text-green-400">Median (50th percentile):</strong> 50% of segments have ≤{stats.median} accidents</p>
                <p>• <strong className="text-teal-400">Q3 (75th percentile):</strong> 75% of segments have ≤{stats.q3} accidents</p>
              </div>
              <div className="mt-3 p-3 bg-neutral-900/50 rounded">
                <p className="text-sm font-semibold text-purple-400 mb-1">Quartile Position Formula:</p>
                <p className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(\\text{Position} = \\frac{P}{100} \\times (n + 1)\\)` 
                  }} />
                </p>
                <p className="text-xs text-neutral-400 mt-2 text-center">Where P is the percentile and n is the number of data points</p>
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-teal-400 mb-2">Interquartile Range (IQR)</p>
              <p className="text-center">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(\\text{IQR} = Q_3 - Q_1 = ${stats.q3} - ${stats.q1} = ${stats.iqr}\\)` 
                }} />
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-neutral-800/50 p-2 rounded text-center">
                  <p className="text-xs text-neutral-400">IQR contains</p>
                  <p className="text-lg font-bold text-teal-400">50%</p>
                  <p className="text-xs text-neutral-400">of the data</p>
                </div>
                <div className="bg-neutral-800/50 p-2 rounded text-center">
                  <p className="text-xs text-neutral-400">Robust to</p>
                  <p className="text-lg font-bold text-orange-400">Outliers</p>
                  <p className="text-xs text-neutral-400">in the data</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800 p-3 rounded text-sm">
              <p className="text-purple-400 font-semibold mb-1">Visualization Guide:</p>
              <ul className="text-neutral-300 space-y-1">
                <li>• <strong>Top section:</strong> All {stats.n} data points sorted and color-coded</li>
                <li>• <strong>Middle section:</strong> Visual representation of percentile ranges</li>
                <li>• <strong>Bottom section:</strong> Box plot showing the five-number summary</li>
                <li>• <strong>Labels:</strong> Automatically positioned to avoid overlap</li>
              </ul>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAnimationStep(1)}
              disabled={animationStep >= 1}
              className="mx-auto block"
            >
              Show Complete Analysis
            </Button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Measures of Spread</h3>
            <p className="text-neutral-300">
              How much do accident counts vary across road segments? Let's explore different ways to measure spread.
            </p>
            
            {animationStep === 0 && (
              <div className="bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm font-semibold text-amber-400 mb-2">1. Range - The Simplest Measure</p>
                <p className="text-sm text-neutral-300 mb-3">
                  The range shows the total span of our data from minimum to maximum value.
                </p>
                <div className="bg-neutral-800 p-3 rounded text-center">
                  <p className="text-lg">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(\\text{Range} = \\text{Max} - \\text{Min} = ${stats.max} - ${stats.min} = ${stats.range}\\)` 
                    }} />
                  </p>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Limitation: Range only uses two values and ignores the distribution of all other data points.
                </p>
              </div>
            )}
            
            {animationStep === 1 && (
              <div className="bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm font-semibold text-purple-400 mb-2">2. Variance & Standard Deviation</p>
                <p className="text-sm text-neutral-300 mb-3">
                  These measure the average squared distance from the mean, giving us a sense of typical spread.
                </p>
                <div className="space-y-2">
                  <p className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(s^2 = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})^2}{n-1} = ${formatNumber(stats.variance, 2)}\\)` 
                    }} />
                  </p>
                  <p className="text-center">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(s = \\sqrt{s^2} = ${formatNumber(stats.stdDev, 2)}\\)` 
                    }} />
                  </p>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  About 68% of data typically falls within ±1 standard deviation of the mean.
                </p>
              </div>
            )}
            
            {animationStep === 2 && (
              <div className="bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm font-semibold text-cyan-400 mb-2">3. Coefficient of Variation (CV)</p>
                <p className="text-sm text-neutral-300 mb-3">
                  CV expresses the standard deviation as a percentage of the mean, allowing comparison across different scales.
                </p>
                <div className="bg-neutral-800 p-3 rounded text-center">
                  <p className="text-lg">
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\(\\text{CV} = \\frac{\\sigma}{\\mu} \\times 100 = \\frac{${formatNumber(stats.stdDev, 2)}}{${formatNumber(stats.mean, 2)}} \\times 100 = ${formatNumber(stats.cv, 1)}\\%\\)` 
                    }} />
                  </p>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  CV &gt; 100% indicates very high variability relative to the mean.
                </p>
              </div>
            )}
            
            {animationStep === 3 && (
              <div className="space-y-3">
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-400 mb-3">Comparing All Spread Measures</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-800 p-3 rounded text-center">
                      <p className="text-xs text-amber-400">Range</p>
                      <p className="font-mono text-lg">{stats.range}</p>
                      <p className="text-xs text-neutral-500">Total span</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded text-center">
                      <p className="text-xs text-purple-400">Std Dev</p>
                      <p className="font-mono text-lg">{formatNumber(stats.stdDev, 2)}</p>
                      <p className="text-xs text-neutral-500">Typical spread</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded text-center">
                      <p className="text-xs text-cyan-400">CV</p>
                      <p className="font-mono text-lg">{formatNumber(stats.cv, 1)}%</p>
                      <p className="text-xs text-neutral-500">Relative spread</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-800 p-3 rounded">
                  <p className="text-sm text-green-400 font-semibold">Key Insights:</p>
                  <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                    <li>• Range of {stats.range} shows wide variation, but doesn't tell us about typical values</li>
                    <li>• SD of {formatNumber(stats.stdDev, 1)} means most segments deviate by about this amount from the mean</li>
                    <li>• CV of {formatNumber(stats.cv, 0)}% indicates very high relative variability - the data is quite spread out</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(0)}
                className={animationStep === 0 ? "ring-2 ring-amber-400" : ""}
              >
                Range
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(1)}
                className={animationStep === 1 ? "ring-2 ring-purple-400" : ""}
              >
                Variance/SD
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(2)}
                className={animationStep === 2 ? "ring-2 ring-cyan-400" : ""}
              >
                Coeff. of Variation
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(3)}
                className={animationStep === 3 ? "ring-2 ring-green-400" : ""}
              >
                Compare All
              </Button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Outlier Detection</h3>
            <p className="text-neutral-300">
              Using the IQR method to identify unusually dangerous road segments.
            </p>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-red-400 mb-2">1.5 × IQR Rule</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(\\text{Lower Fence} = Q_1 - 1.5 \\times \\text{IQR} = ${stats.q1} - 1.5 \\times ${stats.iqr} = ${formatNumber(stats.lowerFence, 1)}\\)` 
                  }} />
                </p>
                <p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(\\text{Upper Fence} = Q_3 + 1.5 \\times \\text{IQR} = ${stats.q3} + 1.5 \\times ${stats.iqr} = ${formatNumber(stats.upperFence, 1)}\\)` 
                  }} />
                </p>
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-red-400 mb-2">Identified Outliers:</p>
              {stats.outliers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.outliers.map((value, i) => (
                    <span key={i} className="px-3 py-1 bg-red-900/50 rounded font-mono text-red-400">
                      {value}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400">No outliers detected</p>
              )}
              <p className="text-xs text-neutral-400 mt-2">
                {stats.outliers.length} segment{stats.outliers.length !== 1 ? 's' : ''} with unusually high accidents
              </p>
            </div>
            
            <div className="bg-neutral-800 p-3 rounded">
              <p className="text-sm text-purple-400 font-semibold">Why This Matters:</p>
              <ul className="text-sm text-neutral-300 mt-1 space-y-1">
                <li>• Outlier segments may need immediate safety improvements</li>
                <li>• Could indicate specific hazards (curves, intersections, etc.)</li>
                <li>• Important for resource allocation and prioritization</li>
              </ul>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAnimationStep(1)}
              disabled={animationStep >= 1}
              className="mx-auto block"
            >
              Highlight Outliers
            </Button>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4" ref={mathRef}>
            <h3 className="text-xl font-bold text-white">Central Tendency vs Spread: A Complete Picture</h3>
            <p className="text-neutral-300">
              Understanding when to use different measures based on your data's characteristics.
            </p>
            
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-800/30">
              <p className="text-sm font-semibold text-blue-400 mb-2">What the Visualization Shows</p>
              <p className="text-sm text-neutral-300">
                The top panel displays a <span className="text-purple-400 font-semibold">box plot</span> that visualizes data spread through quartiles,
                while the bottom panel shows a <span className="text-green-400 font-semibold">histogram</span> with mean and standard deviation.
              </p>
              <p className="text-sm text-neutral-300 mt-2">
                Together, they provide complementary views of the same data.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm font-semibold text-green-400 mb-3">Median vs Mean</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">Median = {stats.median}:</span> The middle value, unaffected by outliers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">Mean = {formatNumber(stats.mean, 1)}:</span> Average value, pulled up by outliers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">Mean {'>'} Median:</span> Indicates right skew
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm font-semibold text-purple-400 mb-3">IQR vs Standard Deviation</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">IQR = {stats.iqr}:</span> Middle 50% of data, robust to outliers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">SD = {formatNumber(stats.stdDev, 1)}:</span> Average distance from mean
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span className="text-neutral-300">
                      <span className="font-semibold">CV = {formatNumber(stats.cv, 0)}%:</span> High relative variability
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-amber-400 mb-3">Practical Insights</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-300">
                    <span className="font-semibold">For this accident data:</span>
                  </p>
                  <ul className="text-sm text-neutral-300 mt-2 space-y-1 ml-4">
                    <li>• Use <span className="text-green-400 font-semibold">median (9)</span> as the typical value since we have outliers</li>
                    <li>• Use <span className="text-purple-400 font-semibold">IQR (11)</span> to describe spread, not standard deviation</li>
                    <li>• The <span className="text-red-400 font-semibold">{stats.outliers.length} outliers</span> ({stats.outliers.join(', ')}) need special attention</li>
                  </ul>
                </div>
                <div className="mt-3 p-3 bg-neutral-800 rounded">
                  <p className="text-xs text-neutral-400">
                    <span className="font-semibold">Rule of thumb:</span> When mean and median differ significantly,
                    prefer median and IQR for summary statistics.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-800/30">
              <p className="text-sm font-semibold text-purple-400 mb-2">Key Takeaway</p>
              <p className="text-sm text-neutral-300">
                Box plots excel at showing data spread and identifying outliers, while histograms 
                reveal the overall distribution shape. Use both together for complete understanding.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(1)}
                disabled={animationStep >= 1}
              >
                Show Summary Table
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnimationStep(2)}
                disabled={animationStep >= 2}
              >
                Add Color Legend
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer 
      title="4.1.2 Descriptive Statistics: Foundations"
      className="min-h-screen max-w-7xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          current={currentSection + 1} 
          total={SECTIONS.length}
          variant="purple"
          showSteps
        />
      </div>
      
      {/* Section Header */}
      <motion.div 
        key={currentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {React.createElement(SECTIONS[currentSection].icon, { 
            size: 24, 
            className: "text-purple-400" 
          })}
          <h2 className="text-2xl font-bold text-white">
            {SECTIONS[currentSection].title}
          </h2>
        </div>
        <p className="text-neutral-400">{SECTIONS[currentSection].description}</p>
      </motion.div>
      
      {/* Main Content - Full Width Visualization First */}
      <div className="space-y-6">
        {/* Visualization - Full Width */}
        <VisualizationSection className="w-full">
          <GraphContainer height={currentSection === 4 ? "800px" : currentSection === 1 ? "500px" : "450px"} className="w-full">
            <svg ref={svgRef} className="w-full h-full" style={{ overflow: 'visible' }} />
          </GraphContainer>
        </VisualizationSection>
        
        {/* Text Content Below */}
        <VisualizationSection className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </VisualizationSection>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="secondary"
          onClick={() => {
            setCurrentSection(Math.max(0, currentSection - 1));
            setAnimationStep(0);
          }}
          disabled={currentSection === 0}
        >
          ← {currentSection > 0 ? SECTIONS[currentSection - 1].title : 'Previous'}
        </Button>
        <div className="text-center">
          <div className="text-sm text-neutral-400">
            {currentSection + 1} of {SECTIONS.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Use ← → arrow keys
          </div>
        </div>
        {currentSection < SECTIONS.length - 1 ? (
          <Button
            variant="primary"
            onClick={() => {
              setCurrentSection(currentSection + 1);
              setAnimationStep(0);
            }}
          >
            {SECTIONS[currentSection + 1].title} →
          </Button>
        ) : (
          <Button
            variant={hasCompleted ? "secondary" : "primary"}
            onClick={() => {
              if (!hasCompleted) {
                setHasCompleted(true);
                if (onComplete) onComplete();
              }
            }}
          >
            {hasCompleted ? "Completed" : "Complete Section"}
          </Button>
        )}
      </div>
    </VisualizationContainer>
  );
}

export default DescriptiveStatisticsFoundations;