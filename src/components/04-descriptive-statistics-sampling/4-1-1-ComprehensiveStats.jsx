"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';

// Use vibrant color scheme for statistics
const colorScheme = createColorScheme('descriptive');
const vibrantColors = {
  teal: 'from-teal-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  blue: 'from-blue-500 to-indigo-500',
  emerald: 'from-emerald-500 to-green-500',
  orange: 'from-orange-500 to-red-500',
  violet: 'from-violet-500 to-purple-500'
};

// Helper function for generating distribution data
const generateDistributionData = (type, size = 30) => {
  let data = [];
  
  switch (type) {
    case 'normal':
      // Box-Muller transform for normal distribution
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        data.push(Math.round(50 + z0 * 15)); // mean=50, std=15
      }
      break;
      
    case 'skewed':
      // Exponential-like distribution for right skew
      for (let i = 0; i < size; i++) {
        data.push(Math.round(Math.min(100, 20 - Math.log(Math.random()) * 20)));
      }
      break;
      
    case 'uniform':
      // Uniform distribution
      for (let i = 0; i < size; i++) {
        data.push(Math.round(20 + Math.random() * 60));
      }
      break;
      
    case 'bimodal':
      // Two normal distributions mixed
      for (let i = 0; i < size; i++) {
        if (Math.random() < 0.5) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push(Math.round(35 + z0 * 8));
        } else {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push(Math.round(65 + z0 * 8));
        }
      }
      break;
      
    default:
      return [];
  }
  
  return data.filter(x => x >= 0 && x <= 100);
};

// Worked Example Component
const ComprehensiveStatsWorkedExample = memo(function ComprehensiveStatsWorkedExample({ 
  data, mean, median, mode, q1, q3, iqr, stdDev, variance 
}) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data, mean, median, mode, q1, q3, iqr, stdDev, variance]);
  
  if (data.length === 0) {
    return (
      <div className="bg-neutral-800/50 rounded-lg p-4 text-neutral-400 text-center">
        Add some data points to see the worked example!
      </div>
    );
  }
  
  // Outlier bounds
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = data.filter(x => x < lowerBound || x > upperBound);
  
  return (
    <div ref={contentRef} className="bg-neutral-800/50 rounded-lg p-4 space-y-4">
      <h4 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
        Complete Statistical Analysis
      </h4>
      
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-purple-400 mb-1">1. Central Tendency:</p>
          <div className="bg-neutral-900/50 p-3 rounded">
            <div className="text-center py-2 text-white bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded">
              <span className="font-mono text-sm">Mean = x̄ = Σxᵢ/n = {data.reduce((a,b) => a+b, 0)}/{data.length} = {mean.toFixed(2)}</span>
            </div>
            <p className="text-sm text-neutral-300 mt-2">
              <span className="text-yellow-400">Median:</span> {median.toFixed(2)} | 
              <span className="text-cyan-400 ml-2">Mode:</span> {mode.length === 0 ? 'None' : mode.join(', ')}
            </p>
          </div>
        </div>
        
        <div>
          <p className="font-semibold text-purple-400 mb-1">2. Dispersion Measures:</p>
          <div className="bg-neutral-900/50 p-3 rounded">
            <div className="text-center py-2 text-white bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded mt-2">
              <span className="font-mono text-sm">Variance = σ² = Σ(xᵢ - x̄)²/n = {variance.toFixed(2)}</span>
            </div>
            <div className="text-center py-2 text-white bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded mt-2">
              <span className="font-mono text-sm">Std Dev = σ = √σ² = {stdDev.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="font-semibold text-purple-400 mb-1">3. Five-Number Summary:</p>
          <div className="bg-neutral-900/50 p-3 rounded text-sm">
            <div className="flex justify-between font-mono">
              <span>Min: {Math.min(...data).toFixed(0)}</span>
              <span className="text-yellow-400">Q1: {q1.toFixed(1)}</span>
              <span className="text-cyan-400">Median: {median.toFixed(1)}</span>
              <span className="text-yellow-400">Q3: {q3.toFixed(1)}</span>
              <span>Max: {Math.max(...data).toFixed(0)}</span>
            </div>
            <div className="mt-2 text-center py-2 text-white bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded">
              <span className="font-mono text-sm">IQR = Q₃ - Q₁ = {iqr.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="font-semibold text-purple-400 mb-1">4. Outlier Detection (1.5×IQR):</p>
          <div className="bg-neutral-900/50 p-3 rounded">
            <p className="text-sm text-neutral-300">
              Lower fence: {lowerBound.toFixed(1)} | Upper fence: {upperBound.toFixed(1)}
            </p>
            <p className={cn("text-sm mt-1", outliers.length > 0 ? "text-red-400" : "text-green-400")}>
              {outliers.length > 0 ? `Outliers: ${outliers.map(x => x.toFixed(0)).join(', ')}` : 'No outliers detected'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3 text-sm">
        <strong className="text-blue-400">💡 Key Insight:</strong>
        <p className="text-neutral-300 mt-1">
          The data is {Math.abs(mean - median) < stdDev * 0.3 ? 'roughly symmetric' : 
                      mean > median ? 'right-skewed (mean > median)' : 'left-skewed (mean < median)'}.
          {outliers.length > 0 && ' The presence of outliers significantly affects the mean but not the median.'}
        </p>
      </div>
    </div>
  );
});

// Tutorial steps
const tutorialSteps = [
  {
    title: "Welcome to Comprehensive Statistics!",
    content: "This interactive tool lets you explore all fundamental descriptive statistics concepts in one place.",
    target: ".visualization-title"
  },
  {
    title: "Interactive Data Points",
    content: "Click anywhere on the plot to add data points, or drag existing points to see how statistics change in real-time.",
    target: "[data-tutorial='main-plot']"
  },
  {
    title: "Distribution Templates",
    content: "Use these buttons to generate different types of distributions and see how they affect the statistics.",
    target: "[data-tutorial='distribution-buttons']"
  },
  {
    title: "Central Tendency Measures",
    content: "Watch how mean (blue), median (yellow), and mode (red) respond differently to your data changes.",
    target: "[data-tutorial='statistics-display']"
  },
  {
    title: "Dispersion & Quartiles",
    content: "See variance, standard deviation, and the five-number summary update as you modify the data.",
    target: "[data-tutorial='dispersion-stats']"
  },
  {
    title: "Worked Example",
    content: "Toggle this to see detailed mathematical calculations for all statistics.",
    target: "[data-tutorial='worked-example-toggle']"
  }
];

function ComprehensiveStats() {
  const [dataPoints, setDataPoints] = useState([25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [outlierMultiplier, setOutlierMultiplier] = useState(1.5);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const svgRef = useRef(null);
  const d3Container = useRef(null);
  
  // Calculate comprehensive statistics
  const calculateStats = useCallback((data) => {
    if (data.length === 0) return { 
      mean: 0, median: 0, mode: [], q1: 0, q3: 0, iqr: 0, 
      variance: 0, stdDev: 0, min: 0, max: 0 
    };
    
    // Sort data for order statistics
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Mean
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = maxFreq > 1 
      ? Object.keys(frequency)
          .filter(key => frequency[key] === maxFreq)
          .map(Number)
      : [];
    
    // Quartiles
    const q1Index = Math.floor(n / 4);
    const q3Index = Math.floor(3 * n / 4);
    
    const q1 = n >= 4 
      ? (sorted[q1Index] + sorted[Math.min(q1Index + 1, n - 1)]) / 2
      : sorted[0];
    const q3 = n >= 4
      ? (sorted[q3Index] + sorted[Math.min(q3Index + 1, n - 1)]) / 2
      : sorted[n - 1];
    const iqr = q3 - q1;
    
    // Variance and standard deviation
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    return { 
      mean, median, mode, q1, q3, iqr, variance, stdDev,
      min: sorted[0], max: sorted[n - 1]
    };
  }, []);
  
  const stats = calculateStats(dataPoints);
  
  // Clear all data
  const clearData = () => {
    setDataPoints([]);
    setTotalInteractions(0);
  };
  
  // Handle click on visualization to add point
  const handleVisualizationClick = useCallback((event) => {
    if (!d3Container.current || draggingIndex !== null) return;
    
    const rect = d3Container.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
    const innerWidth = rect.width - margin.left - margin.right;
    
    // Calculate value from x position
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    const value = Math.round(xScale.invert(x - margin.left));
    if (value >= 0 && value <= 100) {
      setDataPoints([...dataPoints, value]);
      setTotalInteractions(prev => prev + 1);
    }
  }, [dataPoints, draggingIndex]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Gradient background
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0a0a0a");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1a0a1a");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Fixed scales for consistency
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    // Better dot radius and spacing
    const dotRadius = 8;
    const dotSpacing = dotRadius * 2.5;
    const maxStackHeight = Math.floor(innerHeight / dotSpacing);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Draw vertical lines for mean, median, mode
    if (dataPoints.length > 0) {
      const measures = [
        { value: stats.mean, color: colorScheme.chart.primary, label: 'Mean', dash: "none" },
        { value: stats.median, color: colorScheme.chart.secondary, label: 'Median', dash: "5,5" },
        ...(stats.mode.length === 1 ? [{ value: stats.mode[0], color: colorScheme.chart.tertiary, label: 'Mode', dash: "2,2" }] : [])
      ];
      
      measures.forEach((measure, index) => {
        g.append("line")
          .attr("x1", xScale(measure.value))
          .attr("x2", xScale(measure.value))
          .attr("y1", 0)
          .attr("y2", innerHeight)
          .attr("stroke", measure.color)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", measure.dash)
          .attr("opacity", 0.8);
        
        // Stagger labels to avoid overlap
        const labelY = -10 - (index * 20);
        const labelGroup = g.append("g");
        
        // Background for better readability
        labelGroup.append("rect")
          .attr("x", xScale(measure.value) - 40)
          .attr("y", labelY - 12)
          .attr("width", 80)
          .attr("height", 18)
          .attr("rx", 3)
          .attr("fill", "rgba(0,0,0,0.7)");
        
        labelGroup.append("text")
          .attr("x", xScale(measure.value))
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .attr("fill", measure.color)
          .text(`${measure.label}: ${measure.value.toFixed(1)}`);
      });
    }
    
    // Prepare data for dots with better stacking
    const dotData = [];
    const valueStacks = new Map();
    
    dataPoints.forEach((value, originalIndex) => {
      if (!valueStacks.has(value)) {
        valueStacks.set(value, 0);
      }
      const stackIndex = valueStacks.get(value);
      valueStacks.set(value, stackIndex + 1);
      
      dotData.push({ 
        value, 
        stackIndex, 
        originalIndex,
        y: innerHeight - (stackIndex * dotSpacing) - dotRadius - 5
      });
    });
    
    // Draw dots with better visibility
    const dots = g.selectAll(".data-dot")
      .data(dotData, d => d.originalIndex);
    
    dots.enter()
      .append("circle")
      .attr("class", "data-dot")
      .attr("cx", d => xScale(d.value))
      .attr("cy", innerHeight)
      .attr("r", 0)
      .merge(dots)
      .attr("fill", d => {
        // Check if outlier
        const lowerBound = stats.q1 - outlierMultiplier * stats.iqr;
        const upperBound = stats.q3 + outlierMultiplier * stats.iqr;
        return (d.value < lowerBound || d.value > upperBound) 
          ? colorScheme.chart.tertiary 
          : colorScheme.chart.primary;
      })
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9)
      .style("cursor", "grab")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", dotRadius + 4)
          .attr("opacity", 1);
        
        // Show value tooltip
        const tooltip = g.append("g")
          .attr("class", "value-tooltip");
        
        const rect = tooltip.append("rect")
          .attr("x", xScale(d.value) - 20)
          .attr("y", d.y - 35)
          .attr("width", 40)
          .attr("height", 24)
          .attr("rx", 4)
          .attr("fill", "rgba(0,0,0,0.8)");
        
        tooltip.append("text")
          .attr("x", xScale(d.value))
          .attr("y", d.y - 20)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .text(d.value);
          
        setHoveredValue(d.value);
      })
      .on("mouseleave", function(event, d) {
        if (draggingIndex !== d.originalIndex) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", dotRadius)
            .attr("opacity", 0.9);
        }
        g.selectAll(".value-tooltip").remove();
        setHoveredValue(null);
      })
      .transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("cx", d => xScale(d.value))
      .attr("cy", d => d.y)
      .attr("r", dotRadius);
    
    dots.exit()
      .transition()
      .duration(300)
      .attr("r", 0)
      .remove();
    
    // Add improved drag behavior
    const drag = d3.drag()
      .on("start", function(event, d) {
        setDraggingIndex(d.originalIndex);
        d3.select(this)
          .raise()
          .attr("r", dotRadius + 4)
          .style("cursor", "grabbing");
        g.selectAll(".value-tooltip").remove();
      })
      .on("drag", function(event, d) {
        const newValue = Math.round(Math.max(0, Math.min(100, xScale.invert(event.x))));
        const newPoints = [...dataPoints];
        newPoints[d.originalIndex] = newValue;
        setDataPoints(newPoints);
        
        // Show dragging value
        g.selectAll(".drag-value").remove();
        g.append("text")
          .attr("class", "drag-value")
          .attr("x", xScale(newValue))
          .attr("y", d.y - 25)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("pointer-events", "none")
          .text(newValue);
      })
      .on("end", function(event, d) {
        setDraggingIndex(null);
        setTotalInteractions(prev => prev + 1);
        d3.select(this)
          .attr("r", dotRadius)
          .style("cursor", "grab");
        g.selectAll(".drag-value").remove();
      });
    
    g.selectAll(".data-dot").call(drag);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    // Add clear instructions
    if (showInstructions || dataPoints.length === 0) {
      const instructions = g.append("g")
        .attr("class", "instructions")
        .attr("opacity", dataPoints.length === 0 ? 1 : 0.8);
      
      const bgRect = instructions.append("rect")
        .attr("x", innerWidth / 2 - 200)
        .attr("y", innerHeight / 2 - 40)
        .attr("width", 400)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("fill", "rgba(0,0,0,0.7)");
      
      instructions.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2 - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .attr("fill", "white")
        .text("📊 Click to add data points");
      
      instructions.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2 + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", colors.chart.text)
        .text("Drag points to see how statistics change");
      
      if (dataPoints.length > 0) {
        instructions
          .style("cursor", "pointer")
          .on("click", () => setShowInstructions(false));
      }
    }
    
  }, [dataPoints, stats, outlierMultiplier, draggingIndex, showInstructions, handleVisualizationClick]);
  
  // Learning insights based on interactions
  const getLearningInsight = () => {
    if (totalInteractions === 0) {
      return "🎯 Ready to explore! Click to add data points or use the distribution buttons.";
    } else if (totalInteractions < 5) {
      return "📊 Great start! Notice how each measure of central tendency responds differently.";
    } else if (totalInteractions < 10) {
      return "🎓 Key insight: The median is robust to outliers while the mean is sensitive!";
    } else if (totalInteractions < 20) {
      return "💡 Try creating outliers by dragging points to the extremes. Watch the statistics!";
    } else {
      return "✨ Expert level! You've mastered descriptive statistics. Try different distributions!";
    }
  };
  
  return (
    <VisualizationContainer 
      title="Comprehensive Descriptive Statistics"
      tutorialSteps={tutorialSteps}
      tutorialKey="comprehensive-stats"
      showTutorialOnMount={true}
    >
      {/* Educational Purpose Banner */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">🎯 Learning Objective</h3>
        <p className="text-neutral-300">
          Explore how different measures of central tendency (mean, median, mode) and spread 
          (variance, standard deviation, IQR) respond to data changes. See how outliers affect 
          each statistic differently!
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          {/* Distribution Controls */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-neutral-400 mb-2">Generate Distributions</h4>
            <div className="flex flex-wrap gap-2" data-tutorial="distribution-buttons">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('normal'));
                  setTotalInteractions(prev => prev + 1);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                Normal
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('skewed'));
                  setTotalInteractions(prev => prev + 1);
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                Skewed
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('uniform'));
                  setTotalInteractions(prev => prev + 1);
                }}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                Uniform
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('bimodal'));
                  setTotalInteractions(prev => prev + 1);
                }}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                Bimodal
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={clearData}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                Clear
              </Button>
            </div>
          </VisualizationSection>
          
          {/* Central Tendency Stats */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30" data-tutorial="statistics-display">
            <h4 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Central Tendency</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Mean</span>
                <span className="font-mono text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stats.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Median</span>
                <span className="font-mono text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{stats.median.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Mode</span>
                <span className="font-mono text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.mode.length === 0 ? '—' : stats.mode.join(', ')}
                </span>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Dispersion Stats */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-600/30" data-tutorial="dispersion-stats">
            <h4 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Dispersion & Quartiles</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Variance</span>
                <span className="font-mono text-lg text-white">{stats.variance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-300">Std Dev</span>
                <span className="font-mono text-lg text-white">{stats.stdDev.toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Q1</span>
                  <span className="font-mono text-white">{stats.q1.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Q3</span>
                  <span className="font-mono text-white">{stats.q3.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">IQR</span>
                  <span className="font-mono text-white">{stats.iqr.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Controls */}
          <VisualizationSection className="p-3">
            <ControlGroup>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Outlier Multiplier</label>
                    <span className="text-sm font-mono text-white">{outlierMultiplier}×IQR</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.5"
                    value={outlierMultiplier}
                    onChange={(e) => setOutlierMultiplier(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <label className="flex items-center gap-2 text-sm" data-tutorial="worked-example-toggle">
                  <input 
                    type="checkbox" 
                    checked={showWorkedExample} 
                    onChange={e => setShowWorkedExample(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show worked example</span>
                </label>
              </div>
            </ControlGroup>
          </VisualizationSection>
          
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 space-y-4">
          {/* Progress and Learning Insights */}
          <VisualizationSection className="p-4 bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-600/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-emerald-200 flex-1">
                {getLearningInsight()}
              </div>
              <div className="ml-4">
                <ProgressBar 
                  current={Math.min(totalInteractions, 20)} 
                  total={20} 
                  label="" 
                  variant="emerald"
                  className="w-32"
                />
              </div>
            </div>
          </VisualizationSection>
          
          <div 
            ref={d3Container}
            className="relative cursor-pointer"
            onClick={handleVisualizationClick}
            data-tutorial="main-plot"
          >
            <GraphContainer height="500px">
              <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
            </GraphContainer>
          </div>
          
          {/* Worked Example */}
          {showWorkedExample && (
            <div className="mt-4">
              <ComprehensiveStatsWorkedExample {...stats} data={dataPoints} />
            </div>
          )}
          
          {/* Summary Stats Display */}
          {dataPoints.length > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-semibold text-neutral-400 mb-3">Data Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-neutral-900/50 p-3 rounded">
                  <span className="text-neutral-500">n</span>
                  <div className="font-mono text-white text-lg">{dataPoints.length}</div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded">
                  <span className="text-neutral-500">Min</span>
                  <div className="font-mono text-white text-lg">{stats.min}</div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded">
                  <span className="text-neutral-500">Max</span>
                  <div className="font-mono text-white text-lg">{stats.max}</div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded">
                  <span className="text-neutral-500">Range</span>
                  <div className="font-mono text-white text-lg">{stats.max - stats.min}</div>
                </div>
              </div>
            </VisualizationSection>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ComprehensiveStats;