"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressTracker } from '../ui/ProgressTracker';
import { RangeSlider, SliderPresets } from "../ui/RangeSlider";

// Use estimation color scheme for statistics
const colorScheme = createColorScheme('estimation');

// Worked Example Component
const DescriptiveStatsWorkedExample = React.memo(function DescriptiveStatsWorkedExample({ 
  data, mean, median, mode, q1, q3, iqr, stdDev, outlierMultiplier 
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
  }, [data, mean, median, mode, q1, q3, iqr, stdDev, outlierMultiplier]);
  
  // Calculate variance
  const variance = data.length > 0 
    ? data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length 
    : 0;
  
  // Outlier bounds
  const lowerBound = q1 - outlierMultiplier * iqr;
  const upperBound = q3 + outlierMultiplier * iqr;
  const outliers = data.filter(x => x < lowerBound || x > upperBound);
  
  return (
    <div ref={contentRef} className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 p-6 rounded-xl text-neutral-200 border border-violet-600/30 shadow-lg shadow-violet-900/20">
      <h4 className="text-lg font-semibold border-b border-violet-600/30 pb-2 mb-4 text-white bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
        📊 Complete Statistical Analysis
      </h4>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-purple-400">1. Measures of Central Tendency:</p>
        <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 p-3 rounded-lg">
          <div className="text-center py-2">
            <span className="font-mono text-sm">Mean = x̄ = Σxᵢ/n = {mean.toFixed(2)}</span>
          </div>
          <p className="text-sm mt-2 text-purple-200">
            Median = {median.toFixed(2)}, Mode = {mode.length === 0 ? 'None' : mode.join(', ')}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-blue-400">2. Measures of Dispersion:</p>
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-3 rounded-lg space-y-2">
          <div className="text-center">
            <span className="font-mono text-sm">Range = xₘₐₓ - xₘᵢₙ = {(Math.max(...data) - Math.min(...data)).toFixed(2)}</span>
          </div>
          <div className="text-center">
            <span className="font-mono text-sm">Variance = σ² = Σ(xᵢ - x̄)²/n = {variance.toFixed(2)}</span>
          </div>
          <div className="text-center">
            <span className="font-mono text-sm">Std Dev = σ = √σ² = {stdDev.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-emerald-400">3. Five-Number Summary & IQR:</p>
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-3 rounded-lg">
          <p className="text-sm text-emerald-200">
            Min = {Math.min(...data).toFixed(2)}, Q1 = {q1.toFixed(2)}, Median = {median.toFixed(2)}, Q3 = {q3.toFixed(2)}, Max = {Math.max(...data).toFixed(2)}
          </p>
          <div className="text-center mt-2">
            <span className="font-mono text-sm">IQR = Q₃ - Q₁ = {q3.toFixed(2)} - {q1.toFixed(2)} = {iqr.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="mb-1 font-medium text-orange-400">4. Outlier Detection ({outlierMultiplier}×IQR Rule):</p>
        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-3 rounded-lg">
          <div className="text-center">
            <span className="font-mono text-sm">Lower Fence = Q₁ - {outlierMultiplier} × IQR = {lowerBound.toFixed(2)}</span>
          </div>
          <div className="text-center mt-1">
            <span className="font-mono text-sm">Upper Fence = Q₃ + {outlierMultiplier} × IQR = {upperBound.toFixed(2)}</span>
          </div>
          <p className={cn("text-sm mt-2", outliers.length > 0 ? "text-orange-400" : "text-emerald-400")}>
            {outliers.length > 0 ? `Outliers detected: ${outliers.map(x => x.toFixed(2)).join(', ')}` : 'No outliers detected'}
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 p-3 rounded-lg text-sm border border-teal-600/30">
        <strong className="text-teal-400">🔍 Robustness Analysis:</strong>
        <div className="mt-2 space-y-1 text-xs text-teal-200">
          <p>• Mean is {Math.abs(mean - median) > stdDev * 0.5 ? 'significantly' : 'slightly'} affected by outliers</p>
          <p>• Median remains stable (robust measure)</p>
          <p>• IQR is unaffected by extreme values</p>
        </div>
      </div>
    </div>
  );
});

function DescriptiveStatsExplorer() {
  // State management
  const [dataPoints, setDataPoints] = useState([5, 7, 8, 9, 10, 11, 12, 14, 15, 18]);
  const [inputValue, setInputValue] = useState("");
  const [showMean, setShowMean] = useState(true);
  const [showMedian, setShowMedian] = useState(true);
  const [showMode, setShowMode] = useState(true);
  const [showStdDev, setShowStdDev] = useState(true);
  const [showQuartiles, setShowQuartiles] = useState(true);
  const [showRange, setShowRange] = useState(true);
  const [outlierMultiplier, setOutlierMultiplier] = useState(1.5);
  const [interactionCount, setInteractionCount] = useState(0);
  const [draggedPoints, setDraggedPoints] = useState(0);
  
  const svgRef = useRef(null);
  const boxplotRef = useRef(null);
  
  // Calculate all statistics
  const calculateStats = (data) => {
    if (data.length === 0) return {
      mean: 0, median: 0, mode: [], stdDev: 0, 
      q1: 0, q3: 0, iqr: 0, range: 0, min: 0, max: 0
    };
    
    // Sort data for percentile calculations
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
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Standard deviation
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Range
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    return { mean, median, mode, stdDev, q1, q3, iqr, range, min, max };
  };
  
  const stats = calculateStats(dataPoints);
  
  // Data manipulation functions
  const addDataPoint = () => {
    const values = inputValue.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (values.length > 0) {
      setDataPoints([...dataPoints, ...values]);
      setInputValue("");
      setInteractionCount(prev => prev + 1);
    }
  };
  
  const generateDataset = (type) => {
    let data = [];
    const size = 20;
    
    switch (type) {
      case 'symmetric':
        // Normal-like distribution
        for (let i = 0; i < size; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push(Math.round(10 + z0 * 3));
        }
        break;
        
      case 'right-skewed':
        // Exponential-like
        for (let i = 0; i < size; i++) {
          data.push(Math.round(Math.min(25, -Math.log(Math.random()) * 5)));
        }
        break;
        
      case 'with-outlier':
        // Normal with outliers
        for (let i = 0; i < size - 2; i++) {
          data.push(Math.round(10 + Math.random() * 5));
        }
        data.push(1); // Low outlier
        data.push(30); // High outlier
        break;
    }
    
    setDataPoints(data);
    setInteractionCount(prev => prev + 1);
  };
  
  const clearData = () => {
    setDataPoints([]);
    setInteractionCount(0);
    setDraggedPoints(0);
  };
  
  // Main visualization with draggable points
  useEffect(() => {
    if (!svgRef.current || dataPoints.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 250;
    const margin = { top: 60, right: 40, bottom: 40, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Scales (bake margins into scale for drag)
    const xExtent = d3.extent(dataPoints);
    const padding = (xExtent[1] - xExtent[0]) * 0.1 || 2;
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - padding, xExtent[1] + padding])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);
    
    // Draw axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Draw statistical markers
    const meanX = showMean ? xScale(stats.mean) : null;
    const medianX = showMedian ? xScale(stats.median) : null;
    const labelDistance = meanX && medianX ? Math.abs(meanX - medianX) : Infinity;
    
    if (showMean) {
      svg.append("line")
        .attr("x1", meanX)
        .attr("x2", meanX)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
    }
    
    if (showMedian) {
      svg.append("line")
        .attr("x1", medianX)
        .attr("x2", medianX)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
    }
    
    // Position labels to avoid overlap
    if (labelDistance < 60) {
      // Stack labels when close
      if (showMean) {
        svg.append("text")
          .attr("x", meanX)
          .attr("y", margin.top - 25)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "11px")
          .style("font-weight", "600")
          .text(`Mean: ${stats.mean.toFixed(2)}`);
      }
      
      if (showMedian) {
        svg.append("text")
          .attr("x", medianX)
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.secondary)
          .style("font-size", "11px")
          .style("font-weight", "600")
          .text(`Median: ${stats.median.toFixed(2)}`);
      }
    } else {
      // Normal positioning when far apart
      if (showMean) {
        svg.append("text")
          .attr("x", meanX)
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "11px")
          .style("font-weight", "600")
          .text(`Mean: ${stats.mean.toFixed(2)}`);
      }
      
      if (showMedian) {
        svg.append("text")
          .attr("x", medianX)
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.secondary)
          .style("font-size", "11px")
          .style("font-weight", "600")
          .text(`Median: ${stats.median.toFixed(2)}`);
      }
    }
    
    // Draw data points with drag behavior
    const drag = d3.drag()
      .on("start", function(event) {
        d3.select(this).raise().attr("stroke", "#fff");
      })
      .on("drag", function(event, d) {
        const newX = Math.max(margin.left, Math.min(width - margin.right, event.x));
        const newValue = xScale.invert(newX);
        
        d3.select(this)
          .attr("cx", newX);
        
        // Update the data point value
        const index = dataPoints.indexOf(d);
        if (index !== -1) {
          const newData = [...dataPoints];
          newData[index] = newValue;
          setDataPoints(newData);
        }
      })
      .on("end", function() {
        d3.select(this).attr("stroke", null);
        setDraggedPoints(prev => prev + 1);
        setInteractionCount(prev => prev + 1);
      });
    
    // Jitter y positions to avoid overlap
    const jitteredData = dataPoints.map((d, i) => ({
      value: d,
      y: 0.5 + (Math.random() - 0.5) * 0.3
    }));
    
    svg.selectAll("circle")
      .data(jitteredData)
      .enter().append("circle")
      .attr("cx", d => xScale(d.value))
      .attr("cy", d => yScale(d.y))
      .attr("r", 6)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .style("cursor", "grab")
      .call(drag);
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Interactive Number Line (Drag Points to Adjust Values)");
    
  }, [dataPoints, showMean, showMedian, stats]);
  
  // Boxplot visualization
  useEffect(() => {
    if (!boxplotRef.current || dataPoints.length === 0) return;
    
    const svg = d3.select(boxplotRef.current);
    const { width } = boxplotRef.current.getBoundingClientRect();
    const height = 200;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scale
    const xExtent = d3.extent(dataPoints);
    const padding = (xExtent[1] - xExtent[0]) * 0.1 || 2;
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - padding, xExtent[1] + padding])
      .range([0, innerWidth]);
    
    // Outlier detection
    const lowerBound = stats.q1 - outlierMultiplier * stats.iqr;
    const upperBound = stats.q3 + outlierMultiplier * stats.iqr;
    const outliers = dataPoints.filter(d => d < lowerBound || d > upperBound);
    const nonOutliers = dataPoints.filter(d => d >= lowerBound && d <= upperBound);
    
    // Box dimensions
    const boxY = innerHeight * 0.3;
    const boxHeight = innerHeight * 0.4;
    
    // Draw box
    g.append("rect")
      .attr("x", xScale(stats.q1))
      .attr("y", boxY)
      .attr("width", xScale(stats.q3) - xScale(stats.q1))
      .attr("height", boxHeight)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.3)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 2);
    
    // Median line
    g.append("line")
      .attr("x1", xScale(stats.median))
      .attr("x2", xScale(stats.median))
      .attr("y1", boxY)
      .attr("y2", boxY + boxHeight)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3);
    
    // Whiskers
    const whiskerMin = Math.max(stats.min, lowerBound);
    const whiskerMax = Math.min(stats.max, upperBound);
    
    // Left whisker
    g.append("line")
      .attr("x1", xScale(stats.q1))
      .attr("x2", xScale(whiskerMin))
      .attr("y1", boxY + boxHeight / 2)
      .attr("y2", boxY + boxHeight / 2)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 1);
    
    g.append("line")
      .attr("x1", xScale(whiskerMin))
      .attr("x2", xScale(whiskerMin))
      .attr("y1", boxY + boxHeight * 0.25)
      .attr("y2", boxY + boxHeight * 0.75)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 1);
    
    // Right whisker
    g.append("line")
      .attr("x1", xScale(stats.q3))
      .attr("x2", xScale(whiskerMax))
      .attr("y1", boxY + boxHeight / 2)
      .attr("y2", boxY + boxHeight / 2)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 1);
    
    g.append("line")
      .attr("x1", xScale(whiskerMax))
      .attr("x2", xScale(whiskerMax))
      .attr("y1", boxY + boxHeight * 0.25)
      .attr("y2", boxY + boxHeight * 0.75)
      .attr("stroke", colors.chart.text)
      .attr("stroke-width", 1);
    
    // Outliers
    g.selectAll(".outlier")
      .data(outliers)
      .enter().append("circle")
      .attr("class", "outlier")
      .attr("cx", d => xScale(d))
      .attr("cy", boxY + boxHeight / 2)
      .attr("r", 4)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2);
    
    // Outlier bounds
    if (showQuartiles) {
      g.append("line")
        .attr("x1", xScale(lowerBound))
        .attr("x2", xScale(lowerBound))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.5);
      
      g.append("line")
        .attr("x1", xScale(upperBound))
        .attr("x2", xScale(upperBound))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.5);
    }
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Labels
    g.append("text")
      .attr("x", xScale(stats.q1))
      .attr("y", boxY - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text)
      .text(`Q1: ${stats.q1.toFixed(1)}`);
    
    g.append("text")
      .attr("x", xScale(stats.q3))
      .attr("y", boxY - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text)
      .text(`Q3: ${stats.q3.toFixed(1)}`);
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Dynamic Boxplot with Outlier Detection");
    
  }, [dataPoints, outlierMultiplier, showQuartiles, stats]);
  
  return (
    <VisualizationContainer title="Interactive Descriptive Statistics Explorer" className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-4">
            <p className={cn(typography.description, "text-sm leading-relaxed text-neutral-300")}>
              Explore how different statistics describe data. Drag points on the number line, 
              toggle calculations, and observe how outliers affect different measures.
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-4">Data Input</h4>
            
            <ControlGroup label="Add Data Points">
              <div className="flex gap-2 items-stretch">
                <input
                  type="text"
                  placeholder="e.g., 5, 10, 15"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDataPoint()}
                  className={cn(components.input, "flex-1 min-w-0")}
                />
                <button
                  onClick={addDataPoint}
                  disabled={!inputValue.trim()}
                  className={cn(components.button.base, components.button.primary, "px-6 flex-shrink-0")}
                >
                  Add
                </button>
              </div>
            </ControlGroup>
            
            <ControlGroup label="Sample Datasets" className="mt-4">
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => generateDataset('symmetric')}
                  className={cn(components.button.base, components.button.secondary, "text-sm py-2.5")}
                >
                  Generate Symmetric Data
                </button>
                <button
                  onClick={() => generateDataset('right-skewed')}
                  className={cn(components.button.base, components.button.secondary, "text-sm py-2.5")}
                >
                  Generate Right-Skewed Data
                </button>
                <button
                  onClick={() => generateDataset('with-outlier')}
                  className={cn(components.button.base, components.button.secondary, "text-sm py-2.5")}
                >
                  Generate Data with Outliers
                </button>
              </div>
            </ControlGroup>
            
            <button
              onClick={clearData}
              disabled={dataPoints.length === 0}
              className={cn(components.button.base, components.button.danger, "w-full mt-3 py-2.5")}
            >
              Clear All Data
            </button>
          </VisualizationSection>
          
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-4">Calculation Toggles</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={showMean}
                  onChange={(e) => setShowMean(e.target.checked)}
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-neutral-300">Show Mean</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={showMedian}
                  onChange={(e) => setShowMedian(e.target.checked)}
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-neutral-300">Show Median</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={showStdDev}
                  onChange={(e) => setShowStdDev(e.target.checked)}
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-neutral-300">Show Standard Deviation</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={showQuartiles}
                  onChange={(e) => setShowQuartiles(e.target.checked)}
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-neutral-300">Show Quartiles & IQR</span>
              </label>
            </div>
            
            <ControlGroup label="Outlier Detection Multiplier" className="mt-4">
              <RangeSlider
                min={1}
                max={3}
                step={0.1}
                value={outlierMultiplier}
                onChange={setOutlierMultiplier}
                label={`${outlierMultiplier.toFixed(1)}× IQR`}
              />
            </ControlGroup>
          </VisualizationSection>
          
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-4">Numerical Summary</h4>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="space-y-2 text-sm font-mono">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-neutral-400">n:</div>
                <div className="text-white">{dataPoints.length}</div>
                
                {showMean && (
                  <>
                    <div className="text-neutral-400">Mean:</div>
                    <div className="text-white">{stats.mean.toFixed(2)}</div>
                  </>
                )}
                
                {showMedian && (
                  <>
                    <div className="text-neutral-400">Median:</div>
                    <div className="text-white">{stats.median.toFixed(2)}</div>
                  </>
                )}
                
                {showMode && stats.mode.length > 0 && (
                  <>
                    <div className="text-neutral-400">Mode:</div>
                    <div className="text-white">{stats.mode.join(', ')}</div>
                  </>
                )}
                
                {showStdDev && (
                  <>
                    <div className="text-neutral-400">Std Dev:</div>
                    <div className="text-white">{stats.stdDev.toFixed(2)}</div>
                  </>
                )}
                
                {showQuartiles && (
                  <>
                    <div className="text-neutral-400">Q1:</div>
                    <div className="text-white">{stats.q1.toFixed(2)}</div>
                    <div className="text-neutral-400">Q3:</div>
                    <div className="text-white">{stats.q3.toFixed(2)}</div>
                    <div className="text-neutral-400">IQR:</div>
                    <div className="text-white">{stats.iqr.toFixed(2)}</div>
                  </>
                )}
                
                {showRange && (
                  <>
                    <div className="text-neutral-400">Range:</div>
                    <div className="text-white">{stats.range.toFixed(2)}</div>
                  </>
                )}
                </div>
              </div>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Learning Progress</h4>
            
            <ProgressTracker 
              current={interactionCount} 
              goal={30} 
              label="Statistical Explorations"
              color="purple"
            />
            
            <div className="space-y-2 text-xs text-neutral-300 mt-4">
              {interactionCount === 0 && (
                <div>
                  <p>🎯 Ready to explore descriptive statistics?</p>
                  <p className="text-purple-300 mt-1">
                    Start by dragging points on the number line or generating sample data!
                  </p>
                </div>
              )}
              {interactionCount > 0 && interactionCount < 5 && (
                <div>
                  <p>📊 Great start! Try dragging points to extreme values.</p>
                  <p className="text-purple-300 mt-1">
                    Notice how the mean changes dramatically while the median stays stable!
                  </p>
                </div>
              )}
              {interactionCount >= 5 && interactionCount < 15 && (
                <div>
                  <p>🎓 Key insight: Mean vs Median robustness!</p>
                  <p className="text-purple-300 mt-1">
                    The boxplot shows outliers as circles. Try adjusting the IQR multiplier to see how outlier detection changes.
                  </p>
                </div>
              )}
              {interactionCount >= 15 && interactionCount < 30 && (
                <div>
                  <p>🔍 Advanced exploration!</p>
                  <p className="text-purple-300 mt-1">
                    You've dragged {draggedPoints} points. The IQR and quartiles are resistant to outliers - they describe the "middle bulk" of your data.
                  </p>
                </div>
              )}
              {interactionCount >= 30 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Statistical Explorer Expert! {interactionCount} interactions completed.
                  </p>
                  <p>You understand how different statistics respond to data changes!</p>
                  <p className="text-purple-300 mt-1">
                    Challenge: Create a dataset where mean = median = mode. What shape is this distribution?
                  </p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualizations */}
        <div className="lg:w-2/3 space-y-5">
          <GraphContainer height="300px">
            <svg ref={svgRef} style={{ width: "100%", height: 250 }} />
          </GraphContainer>
          
          <GraphContainer height="250px">
            <svg ref={boxplotRef} style={{ width: "100%", height: 200 }} />
          </GraphContainer>
          
          {dataPoints.length > 0 && (
            <>
              <VisualizationSection className="p-4 bg-amber-900/20 border border-amber-600/30">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  📈 Error/Robustness Zone
                </h4>
                <div className="text-xs space-y-2">
                  <p className="text-amber-200">
                    <strong>Outlier Impact Analysis:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-neutral-300">
                    <div>
                      <p>• Mean shift from median: <span className="text-white font-mono">
                        {Math.abs(stats.mean - stats.median).toFixed(2)}
                      </span></p>
                      <p>• Relative to std dev: <span className="text-white font-mono">
                        {(Math.abs(stats.mean - stats.median) / stats.stdDev).toFixed(2)}σ
                      </span></p>
                    </div>
                    <div>
                      <p>• Outliers detected: <span className="text-white font-mono">
                        {dataPoints.filter(d => 
                          d < stats.q1 - outlierMultiplier * stats.iqr || 
                          d > stats.q3 + outlierMultiplier * stats.iqr
                        ).length}
                      </span></p>
                      <p>• Data skewness: <span className="text-white font-mono">
                        {stats.mean > stats.median ? 'Right' : stats.mean < stats.median ? 'Left' : 'None'}
                      </span></p>
                    </div>
                  </div>
                </div>
              </VisualizationSection>
              
              <DescriptiveStatsWorkedExample 
                data={dataPoints}
                mean={stats.mean}
                median={stats.median}
                mode={stats.mode}
                q1={stats.q1}
                q3={stats.q3}
                iqr={stats.iqr}
                stdDev={stats.stdDev}
                outlierMultiplier={outlierMultiplier}
              />
            </>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default DescriptiveStatsExplorer;