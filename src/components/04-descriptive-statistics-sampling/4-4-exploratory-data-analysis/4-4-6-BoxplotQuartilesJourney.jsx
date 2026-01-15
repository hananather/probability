"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import jStat from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import SharedNavigation from '../shared/SharedNavigation';

// Use clean color scheme for better focus on learning
const colorScheme = createColorScheme('descriptive');

// Learning stages
const STAGES = {
  SORTING: 'sorting',
  QUARTILES: 'quartiles',
  BOXPLOT: 'boxplot',
  PATTERNS: 'patterns'
};

// Stage configurations
const stageConfig = {
  [STAGES.SORTING]: {
    title: "Finding the Middle",
    subtitle: "Let's start by organizing our data",
    description: "When we sort data from smallest to largest, we can find special positions that tell us about the distribution."
  },
  [STAGES.QUARTILES]: {
    title: "Discovering Quartiles",
    subtitle: "Dividing data into quarters",
    description: "Quartiles split our sorted data into 4 equal parts. Q1 has 25% below it, Q2 (median) has 50%, and Q3 has 75%."
  },
  [STAGES.BOXPLOT]: {
    title: "Building the Box",
    subtitle: "From numbers to visualization",
    description: "A boxplot visualizes the five-number summary: minimum, Q1, median, Q3, and maximum."
  },
  [STAGES.PATTERNS]: {
    title: "Patterns & Real World",
    subtitle: "Understanding distributions",
    description: "Different shapes tell different stories. Let's explore how boxplots reveal data patterns."
  }
};

function BoxplotQuartilesJourney() {
  // State management
  const [stage, setStage] = useState(STAGES.SORTING);
  const [stageProgress, setStageProgress] = useState(0);
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMedian, setShowMedian] = useState(false);
  const [showQuartiles, setShowQuartiles] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [showWhiskers, setShowWhiskers] = useState(false);
  const [showOutliers, setShowOutliers] = useState(false);
  const [distribution, setDistribution] = useState('normal');
  const [interactionCount, setInteractionCount] = useState(0);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Calculate statistics
  const calculateStats = useCallback((values) => {
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate quartiles using standard method
    const q1Index = Math.floor(n / 4);
    const q1 = q1Index + 1 <= n ? 
      (sorted[q1Index] + sorted[Math.min(q1Index + 1, n - 1)]) / 2 : 
      sorted[q1Index];
    
    const q2 = jStat.median(sorted);
    
    const q3Index = Math.floor(3 * n / 4);
    const q3 = q3Index + 1 <= n ? 
      (sorted[q3Index] + sorted[Math.min(q3Index + 1, n - 1)]) / 2 : 
      sorted[q3Index];
    
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    
    // Find actual whisker endpoints
    const dataWithinFences = sorted.filter(d => d >= lowerFence && d <= upperFence);
    const whiskerMin = dataWithinFences.length > 0 ? Math.min(...dataWithinFences) : q1;
    const whiskerMax = dataWithinFences.length > 0 ? Math.max(...dataWithinFences) : q3;
    
    // Identify outliers
    const outliers = sorted.filter(d => d < lowerFence || d > upperFence);
    
    return {
      min: sorted[0],
      q1,
      q2,
      q3,
      max: sorted[n - 1],
      iqr,
      lowerFence,
      upperFence,
      whiskerMin,
      whiskerMax,
      outliers,
      mean: jStat.mean(sorted)
    };
  }, []);
  
  // Generate initial data
  const generateData = useCallback((type = 'normal', size = 12) => {
    let newData = [];
    
    switch(type) {
      case 'normal':
        // Small dataset for learning
        newData = [23, 45, 67, 34, 89, 56, 78, 90, 45, 67, 34, 56];
        break;
        
      case 'skewedRight':
        // Right-skewed dataset
        newData = [10, 12, 15, 18, 20, 22, 25, 30, 35, 45, 60, 95];
        break;
        
      case 'skewedLeft':
        // Left-skewed dataset
        newData = [5, 40, 65, 70, 72, 75, 78, 80, 82, 85, 88, 90];
        break;
        
      case 'outliers':
        // Dataset with clear outliers
        newData = [5, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 120];
        break;
    }
    
    setData(newData);
    setSortedData([]);
    resetVisualStates();
  }, []);
  
  // Reset visual states
  const resetVisualStates = () => {
    setShowMedian(false);
    setShowQuartiles(false);
    setShowBox(false);
    setShowWhiskers(false);
    setShowOutliers(false);
  };
  
  // Initialize data
  useEffect(() => {
    generateData();
  }, [generateData]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 80, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scale
    const xScale = d3.scaleLinear()
      .domain([0, 130])
      .range([0, innerWidth]);
    
    // Draw based on stage
    if (stage === STAGES.SORTING) {
      drawSortingStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === STAGES.QUARTILES) {
      drawQuartilesStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === STAGES.BOXPLOT) {
      drawBoxplotStage(g, xScale, innerWidth, innerHeight);
    } else if (stage === STAGES.PATTERNS) {
      drawPatternsStage(g, xScale, innerWidth, innerHeight);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight - 20})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line")
      .attr("stroke", colors.chart.grid)
      .attr("opacity", 0.3);
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .attr("fill", "#f3f4f6")
      .attr("opacity", 1);
    
  }, [data, sortedData, stage, showMedian, showQuartiles, showBox, showWhiskers, showOutliers]);
  
  // Stage-specific drawing functions
  const drawSortingStage = (g, xScale, innerWidth, innerHeight) => {
    const yUnsorted = innerHeight * 0.3;
    const ySorted = innerHeight * 0.7;
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Step 1: Sort the Data");
    
    // Draw unsorted data
    g.append("text")
      .attr("x", 0)
      .attr("y", yUnsorted - 25)
      .style("font-size", "12px")
      .attr("fill", colors.chart.text)
      .attr("opacity", 0.7)
      .text("Unsorted:");
    
    const unsortedG = g.append("g").attr("class", "unsorted-data");
    
    data.forEach((d, i) => {
      const x = (i + 1) * (innerWidth / (data.length + 1));
      
      unsortedG.append("circle")
        .attr("cx", x)
        .attr("cy", yUnsorted)
        .attr("r", 20)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0.2)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2);
      
      unsortedG.append("text")
        .attr("x", x)
        .attr("y", yUnsorted + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "monospace")
        .style("font-weight", "600")
        .attr("fill", colors.chart.text)
        .text(d);
    });
    
    // Draw sorted data if available
    if (sortedData.length > 0) {
      g.append("text")
        .attr("x", 0)
        .attr("y", ySorted - 25)
        .style("font-size", "12px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.7)
        .text("Sorted:");
      
      const sortedG = g.append("g").attr("class", "sorted-data");
      
      // Calculate positions with collision detection
      const circleRadius = 20;
      const minDistance = circleRadius * 2 + 5; // Add 5px spacing between circles
      const positions = [];
      
      sortedData.forEach((d, i) => {
        let x = xScale(d);
        
        // Check for collisions with previous circles
        if (i > 0) {
          const prevPos = positions[i - 1];
          const distance = x - prevPos;
          
          // If circles would overlap, adjust position
          if (distance < minDistance) {
            x = prevPos + minDistance;
          }
        }
        
        positions.push(x);
        
        sortedG.append("circle")
          .attr("cx", x)
          .attr("cy", ySorted)
          .attr("r", 0)
          .transition()
          .duration(800)
          .delay(i * 100)
          .attr("r", circleRadius)
          .attr("fill", colorScheme.chart.success)
          .attr("fill-opacity", 0.2)
          .attr("stroke", colorScheme.chart.success)
          .attr("stroke-width", 2);
        
        sortedG.append("text")
          .attr("x", x)
          .attr("y", ySorted + 5)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-family", "monospace")
          .style("font-weight", "600")
          .attr("fill", colors.chart.text)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(i * 100)
          .attr("opacity", 1)
          .text(d);
      });
      
      // Highlight median if shown
      if (showMedian && sortedData.length > 0) {
        const stats = calculateStats(sortedData);
        const medianIndex = Math.floor(sortedData.length / 2);
        
        // Highlight median value
        g.append("rect")
          .attr("x", xScale(stats.q2) - 30)
          .attr("y", ySorted - 30)
          .attr("width", 60)
          .attr("height", 60)
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 3)
          .attr("rx", 5)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 1);
        
        g.append("text")
          .attr("x", xScale(stats.q2))
          .attr("y", ySorted + 55)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "600")
          .attr("fill", colorScheme.chart.secondary)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 1)
          .text(`Median = ${stats.q2}`);
      }
    }
  };
  
  const drawQuartilesStage = (g, xScale, innerWidth, innerHeight) => {
    const y = innerHeight * 0.5;
    const stats = calculateStats(data);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Step 2: Find the Quartiles");
    
    // Draw all data points
    const sorted = [...data].sort((a, b) => a - b);
    sorted.forEach((d, i) => {
      g.append("circle")
        .attr("cx", xScale(d))
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0.3)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 1.5);
    });
    
    if (showQuartiles) {
      // Draw quartile lines and labels
      const quartiles = [
        { value: stats.q1, label: "Q1", color: colorScheme.chart.primary, desc: "25% below" },
        { value: stats.q2, label: "Q2 (Median)", color: colorScheme.chart.secondary, desc: "50% below" },
        { value: stats.q3, label: "Q3", color: colorScheme.chart.primary, desc: "75% below" }
      ];
      
      quartiles.forEach((q, i) => {
        const qG = g.append("g")
          .attr("opacity", 0);
        
        // Vertical line
        qG.append("line")
          .attr("x1", xScale(q.value))
          .attr("x2", xScale(q.value))
          .attr("y1", y - 40)
          .attr("y2", y + 40)
          .attr("stroke", q.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", q.label === "Q2 (Median)" ? "none" : "3,3");
        
        // Label
        qG.append("text")
          .attr("x", xScale(q.value))
          .attr("y", y - 50)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "600")
          .attr("fill", q.color)
          .text(q.label);
        
        // Value
        qG.append("text")
          .attr("x", xScale(q.value))
          .attr("y", y + 60)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-family", "monospace")
          .attr("fill", colors.chart.text)
          .text(q.value.toFixed(1));
        
        // Description
        qG.append("text")
          .attr("x", xScale(q.value))
          .attr("y", y + 75)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .attr("fill", colors.chart.text)
          .attr("opacity", 0.6)
          .text(q.desc);
        
        // Animate the group
        qG.transition()
          .duration(600)
          .delay(i * 300)
          .attr("opacity", 1);
      });
      
      // Show IQR
      g.append("rect")
        .attr("x", xScale(stats.q1))
        .attr("y", y - 15)
        .attr("width", xScale(stats.q3) - xScale(stats.q1))
        .attr("height", 30)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0)
        .transition()
        .duration(600)
        .delay(900)
        .attr("fill-opacity", 0.1);
      
      // IQR label
      g.append("text")
        .attr("x", xScale((stats.q1 + stats.q3) / 2))
        .attr("y", y - 80)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0)
        .transition()
        .duration(600)
        .delay(900)
        .attr("opacity", 0.7)
        .text(`IQR = ${stats.iqr.toFixed(1)} (middle 50% of data)`);
    }
  };
  
  const drawBoxplotStage = (g, xScale, innerWidth, innerHeight) => {
    const y = innerHeight * 0.5;
    const boxHeight = 80;
    const stats = calculateStats(data);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Step 3: Build the Boxplot");
    
    // Draw components progressively
    const components = g.append("g").attr("class", "boxplot-components");
    
    // 1. Box (IQR)
    if (showBox) {
      components.append("rect")
        .attr("x", xScale(stats.q1))
        .attr("y", y - boxHeight/2)
        .attr("width", 0)
        .attr("height", boxHeight)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0.2)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("rx", 4)
        .transition()
        .duration(800)
        .attr("width", xScale(stats.q3) - xScale(stats.q1));
      
      // Median line
      components.append("line")
        .attr("x1", xScale(stats.q2))
        .attr("x2", xScale(stats.q2))
        .attr("y1", y - boxHeight/2)
        .attr("y2", y + boxHeight/2)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 0)
        .transition()
        .duration(800)
        .delay(400)
        .attr("stroke-width", 3);
    }
    
    // 2. Whiskers
    if (showWhiskers) {
      // Lower whisker
      const lowerWhisker = components.append("g")
        .attr("opacity", 0);
      
      lowerWhisker.append("line")
        .attr("x1", xScale(stats.whiskerMin))
        .attr("x2", xScale(stats.q1))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2);
      
      lowerWhisker.append("line")
        .attr("x1", xScale(stats.whiskerMin))
        .attr("x2", xScale(stats.whiskerMin))
        .attr("y1", y - 20)
        .attr("y2", y + 20)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2);
      
      // Animate the lower whisker
      lowerWhisker.transition()
        .duration(600)
        .attr("opacity", 1);
      
      // Upper whisker
      const upperWhisker = components.append("g")
        .attr("opacity", 0);
      
      upperWhisker.append("line")
        .attr("x1", xScale(stats.q3))
        .attr("x2", xScale(stats.whiskerMax))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2);
      
      upperWhisker.append("line")
        .attr("x1", xScale(stats.whiskerMax))
        .attr("x2", xScale(stats.whiskerMax))
        .attr("y1", y - 20)
        .attr("y2", y + 20)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 2);
      
      // Animate the upper whisker
      upperWhisker.transition()
        .duration(600)
        .delay(200)
        .attr("opacity", 1);
    }
    
    // 3. Outliers
    if (showOutliers && stats.outliers.length > 0) {
      const outlierG = components.append("g")
        .attr("class", "outliers");
      
      stats.outliers.forEach((d, i) => {
        outlierG.append("circle")
          .attr("cx", xScale(d))
          .attr("cy", y)
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.tertiary)
          .attr("stroke-width", 2)
          .transition()
          .duration(400)
          .delay(i * 100)
          .attr("r", 6);
      });
      
      // Fence lines (subtle)
      const fences = components.append("g")
        .attr("opacity", 0);
      
      fences.append("line")
        .attr("x1", xScale(stats.lowerFence))
        .attr("x2", xScale(stats.lowerFence))
        .attr("y1", y - boxHeight/2 - 10)
        .attr("y2", y + boxHeight/2 + 10)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,4");
      
      fences.append("line")
        .attr("x1", xScale(stats.upperFence))
        .attr("x2", xScale(stats.upperFence))
        .attr("y1", y - boxHeight/2 - 10)
        .attr("y2", y + boxHeight/2 + 10)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,4");
      
      // Animate the fences
      fences.transition()
        .duration(600)
        .delay(400)
        .attr("opacity", 0.3);
    }
    
    // Labels
    if (showBox && showWhiskers && showOutliers) {
      const labels = [
        { x: stats.whiskerMin, text: "Min", y: y + boxHeight/2 + 25 },
        { x: stats.q1, text: "Q1", y: y + boxHeight/2 + 25 },
        { x: stats.q2, text: "Median", y: y - boxHeight/2 - 15 },
        { x: stats.q3, text: "Q3", y: y + boxHeight/2 + 25 },
        { x: stats.whiskerMax, text: "Max", y: y + boxHeight/2 + 25 }
      ];
      
      labels.forEach((label, i) => {
        g.append("text")
          .attr("x", xScale(label.x))
          .attr("y", label.y)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-family", "monospace")
          .attr("fill", colors.chart.text)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(1200 + i * 100)
          .attr("opacity", 0.7)
          .text(`${label.text}: ${label.x.toFixed(1)}`);
      });
    }
  };
  
  const drawPatternsStage = (g, xScale, innerWidth, innerHeight) => {
    const y = innerHeight * 0.5;
    const boxHeight = 60;
    const stats = calculateStats(data);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`Step 4: ${distribution === 'normal' ? 'Symmetric Distribution' : 
              distribution === 'skewedRight' ? 'Right-Skewed Distribution' :
              distribution === 'skewedLeft' ? 'Left-Skewed Distribution' :
              'Distribution with Outliers'}`);
    
    // Draw complete boxplot
    const boxplotG = g.append("g").attr("class", "complete-boxplot");
    
    // Box
    boxplotG.append("rect")
      .attr("x", xScale(stats.q1))
      .attr("y", y - boxHeight/2)
      .attr("width", xScale(stats.q3) - xScale(stats.q1))
      .attr("height", boxHeight)
      .attr("fill", colorScheme.chart.primary)
      .attr("fill-opacity", 0.2)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2)
      .attr("rx", 4);
    
    // Median
    boxplotG.append("line")
      .attr("x1", xScale(stats.q2))
      .attr("x2", xScale(stats.q2))
      .attr("y1", y - boxHeight/2)
      .attr("y2", y + boxHeight/2)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3);
    
    // Whiskers
    boxplotG.append("line")
      .attr("x1", xScale(stats.whiskerMin))
      .attr("x2", xScale(stats.q1))
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    boxplotG.append("line")
      .attr("x1", xScale(stats.whiskerMin))
      .attr("x2", xScale(stats.whiskerMin))
      .attr("y1", y - 15)
      .attr("y2", y + 15)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    boxplotG.append("line")
      .attr("x1", xScale(stats.q3))
      .attr("x2", xScale(stats.whiskerMax))
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    boxplotG.append("line")
      .attr("x1", xScale(stats.whiskerMax))
      .attr("x2", xScale(stats.whiskerMax))
      .attr("y1", y - 15)
      .attr("y2", y + 15)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 2);
    
    // Outliers
    stats.outliers.forEach(d => {
      boxplotG.append("circle")
        .attr("cx", xScale(d))
        .attr("cy", y)
        .attr("r", 5)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 2);
    });
    
    // Mean indicator
    boxplotG.append("line")
      .attr("x1", xScale(stats.mean) - 8)
      .attr("x2", xScale(stats.mean) + 8)
      .attr("y1", y - 8)
      .attr("y2", y + 8)
      .attr("stroke", colorScheme.chart.warning)
      .attr("stroke-width", 2);
    
    boxplotG.append("line")
      .attr("x1", xScale(stats.mean) - 8)
      .attr("x2", xScale(stats.mean) + 8)
      .attr("y1", y + 8)
      .attr("y2", y - 8)
      .attr("stroke", colorScheme.chart.warning)
      .attr("stroke-width", 2);
    
    // Legend
    const legendData = [
      { symbol: 'line', color: colorScheme.chart.secondary, label: 'Median' },
      { symbol: 'x', color: colorScheme.chart.warning, label: 'Mean' }
    ];
    
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 100}, 20)`);
    
    legendData.forEach((item, i) => {
      const itemG = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      if (item.symbol === 'line') {
        itemG.append("line")
          .attr("x1", 0)
          .attr("x2", 15)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", item.color)
          .attr("stroke-width", 3);
      } else {
        itemG.append("line")
          .attr("x1", 0)
          .attr("x2", 15)
          .attr("y1", -5)
          .attr("y2", 5)
          .attr("stroke", item.color)
          .attr("stroke-width", 2);
        itemG.append("line")
          .attr("x1", 0)
          .attr("x2", 15)
          .attr("y1", 5)
          .attr("y2", -5)
          .attr("stroke", item.color)
          .attr("stroke-width", 2);
      }
      
      itemG.append("text")
        .attr("x", 20)
        .attr("y", 3)
        .style("font-size", "11px")
        .attr("fill", colors.chart.text)
        .text(item.label);
    });
    
    // Pattern description
    const patternText = distribution === 'normal' ? 
      "Symmetric: Mean ≈ Median, balanced whiskers" :
      distribution === 'skewedRight' ?
      "Right-skewed: Mean > Median, longer right whisker" :
      distribution === 'skewedLeft' ?
      "Left-skewed: Mean < Median, longer left whisker" :
      "Outliers: Points beyond 1.5×IQR from the box";
    
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .attr("fill", colors.chart.text)
      .attr("opacity", 0.8)
      .text(patternText);
  };
  
  // Progress tracking
  const updateProgress = () => {
    const totalSteps = 4;
    const currentStep = Object.values(STAGES).indexOf(stage) + 1;
    setStageProgress((currentStep / totalSteps) * 100);
    setInteractionCount(prev => prev + 1);
  };
  
  // Stage controls
  const handleSortData = () => {
    setIsAnimating(true);
    setSortedData([...data].sort((a, b) => a - b));
    setTimeout(() => {
      setIsAnimating(false);
      updateProgress();
    }, 1500);
  };
  
  const handleShowMedian = () => {
    setShowMedian(true);
    updateProgress();
  };
  
  const handleShowQuartiles = () => {
    setShowQuartiles(true);
    updateProgress();
  };
  
  const handleBuildBox = () => {
    setShowBox(true);
    setTimeout(() => setShowWhiskers(true), 1000);
    setTimeout(() => setShowOutliers(true), 2000);
    updateProgress();
  };
  
  const handleNextStage = () => {
    const stages = Object.values(STAGES);
    const currentIndex = stages.indexOf(stage);
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);
      if (stage === STAGES.SORTING) {
        setSortedData([...data].sort((a, b) => a - b));
      }
      updateProgress();
    }
  };
  
  const handlePrevStage = () => {
    const stages = Object.values(STAGES);
    const currentIndex = stages.indexOf(stage);
    if (currentIndex > 0) {
      setStage(stages[currentIndex - 1]);
      updateProgress();
    }
  };

  // Navigation handlers for SharedNavigation
  const handleNavigate = (stepIndex) => {
    const stages = Object.values(STAGES);
    if (stepIndex >= 0 && stepIndex < stages.length) {
      setStage(stages[stepIndex]);
      if (stages[stepIndex] === STAGES.QUARTILES && sortedData.length === 0) {
        setSortedData([...data].sort((a, b) => a - b));
      }
      updateProgress();
    }
  };

  const getCurrentStep = () => {
    const stages = Object.values(STAGES);
    return stages.indexOf(stage);
  };
  
  // Get current stats
  const stats = calculateStats(data);
  
  return (
    <VisualizationContainer 
      title="4.6 Understanding Boxplots & Quartiles"
      description="A step-by-step journey to master boxplots and quartiles"
    >
      <div className="flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar 
            value={stageProgress} 
            max={100}
            className="h-2"
          />
          <div className="flex justify-between mt-2">
            {Object.entries(stageConfig).map(([key, config], index) => (
              <div
                key={key}
                className={cn(
                  "text-xs",
                  stage === key ? "text-white font-semibold" : "text-neutral-500"
                )}
              >
                {index + 1}. {config.title}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Stage Info */}
        <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            {stageConfig[stage].subtitle}
          </h3>
          <p className="text-sm text-neutral-300">
            {stageConfig[stage].description}
          </p>
        </div>
        
        {/* Main Visualization */}
        <GraphContainer height="500px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Stage-specific Controls */}
        <div className="flex flex-col gap-4">
          {stage === STAGES.SORTING && (
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSortData}
                disabled={isAnimating || sortedData.length > 0}
              >
                Sort Data
              </Button>
              {sortedData.length > 0 && !showMedian && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShowMedian}
                >
                  Find Median
                </Button>
              )}
            </div>
          )}
          
          {stage === STAGES.QUARTILES && (
            <div className="flex gap-3">
              {!showQuartiles && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleShowQuartiles}
                >
                  Show Quartiles
                </Button>
              )}
            </div>
          )}
          
          {stage === STAGES.BOXPLOT && (
            <div className="flex gap-3">
              {!showBox ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBuildBox}
                >
                  Build Step by Step
                </Button>
              ) : !showOutliers && (
                <Button variant="secondary" size="sm" disabled>
                  Building...
                </Button>
              )}
            </div>
          )}
          
          {stage === STAGES.PATTERNS && (
            <div className="flex flex-col gap-3">
              <ControlGroup label="Distribution Type">
                <div className="flex gap-2">
                  {[
                    { value: 'normal', label: 'Symmetric' },
                    { value: 'skewedRight', label: 'Right Skewed' },
                    { value: 'skewedLeft', label: 'Left Skewed' },
                    { value: 'outliers', label: 'With Outliers' }
                  ].map(dist => (
                    <Button
                      key={dist.value}
                      variant={distribution === dist.value ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setDistribution(dist.value);
                        generateData(dist.value);
                        updateProgress();
                      }}
                    >
                      {dist.label}
                    </Button>
                  ))}
                </div>
              </ControlGroup>
            </div>
          )}
        </div>
        
        {/* SharedNavigation */}
        <SharedNavigation
          currentStep={getCurrentStep()}
          totalSteps={Object.values(STAGES).length}
          onNavigate={handleNavigate}
          nextLabel={stage === STAGES.PATTERNS ? "Complete" : "Next Stage"}
          previousLabel="Previous Stage"
          disabled={
            (stage === STAGES.SORTING && sortedData.length === 0) ||
            (stage === STAGES.QUARTILES && !showQuartiles) ||
            (stage === STAGES.BOXPLOT && !showOutliers)
          }
        />
        
        {/* Key Insights */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <span className="text-xs text-neutral-500">Median (Q2)</span>
              <div className="font-mono text-lg text-white">{stats.q2.toFixed(1)}</div>
            </div>
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <span className="text-xs text-neutral-500">Mean</span>
              <div className="font-mono text-lg text-white">{stats.mean.toFixed(1)}</div>
            </div>
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <span className="text-xs text-neutral-500">IQR</span>
              <div className="font-mono text-lg text-white">{stats.iqr.toFixed(1)}</div>
            </div>
          </div>
        )}
        
        {/* Learning Tips */}
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-600/30 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">
            {stage === STAGES.SORTING ? "Why Sort?" :
                stage === STAGES.QUARTILES ? "Understanding Quartiles" :
                stage === STAGES.BOXPLOT ? "Boxplot Components" :
                "Reading Patterns"}
          </h4>
          <p className="text-sm text-neutral-300">
            {stage === STAGES.SORTING ? 
              "Sorting data helps us find positional measures like the median and quartiles. The median is the middle value that splits the data in half." :
              stage === STAGES.QUARTILES ?
              "Quartiles divide sorted data into 4 equal parts. Q1 has 25% of data below it, Q2 (median) has 50%, and Q3 has 75%. The IQR (Q3 - Q1) contains the middle 50% of your data." :
              stage === STAGES.BOXPLOT ?
              "The box shows the IQR, whiskers extend to data within 1.5×IQR from the box, and points beyond are potential outliers. This 5-number summary gives a complete picture of your data's distribution." :
              "Compare the mean and median: if they're close, the distribution is symmetric. If mean > median, it's right-skewed. If mean < median, it's left-skewed. Outliers pull the mean but not the median."
            }
          </p>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default BoxplotQuartilesJourney;