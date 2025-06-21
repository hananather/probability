"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, formatNumber, cn } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';

// Scientific datasets with dramatic outlier effects for clear statistical teaching
const scenarios = {
  income: {
    name: "Household Income",
    description: "Annual household income in thousands (typical metropolitan area)",
    normal: [42, 45, 48, 52, 55, 58, 60, 62, 64, 65, 67, 68, 70, 72, 74, 76, 78, 80, 82, 85],
    withOutlier: [42, 45, 48, 52, 55, 58, 60, 62, 64, 65, 67, 68, 70, 72, 74, 76, 78, 80, 950, 1200], // High net worth
    unit: "k",
    insight: "Income distributions are classic examples where median better represents typical household than mean"
  },
  reaction: {
    name: "Clinical Trial",
    description: "Time to therapeutic effect in clinical trial (hours)",
    normal: [2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.0, 4.2],
    withOutlier: [2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 48.0, 72.0], // Non-responders
    unit: "hrs",
    insight: "Non-responders to treatment create extreme outliers - median better represents typical response"
  },
  contamination: {
    name: "Water Quality",
    description: "Chemical concentration in water samples (parts per million)",
    normal: [1.2, 1.5, 1.8, 2.0, 2.2, 2.4, 2.5, 2.7, 2.9, 3.0, 3.1, 3.3, 3.5, 3.7, 3.9, 4.1, 4.3, 4.5, 4.8, 5.0],
    withOutlier: [1.2, 1.5, 1.8, 2.0, 2.2, 2.4, 2.5, 2.7, 2.9, 3.0, 3.1, 3.3, 3.5, 3.7, 3.9, 4.1, 4.3, 4.5, 125, 180], // Contamination spike
    unit: "ppm",
    insight: "Contamination spikes require median for accurate baseline assessment of water quality"
  },
  network: {
    name: "Network Latency",
    description: "Server response times during 24-hour monitoring period",
    normal: [12, 15, 18, 20, 22, 24, 25, 27, 28, 30, 31, 32, 34, 35, 37, 38, 40, 42, 45, 48],
    withOutlier: [12, 15, 18, 20, 22, 24, 25, 27, 28, 30, 31, 32, 34, 35, 37, 38, 40, 42, 980, 1500], // Network failure
    unit: "ms",
    insight: "Network failures create extreme outliers - median latency better represents typical performance"
  }
};

// Color scheme for different measures
const measureColors = {
  mean: '#facc15',     // Yellow - sensitive to outliers
  median: '#14b8a6',   // Teal - robust to outliers
  mode: '#8b5cf6',     // Purple - most frequent
  quartile: '#f97316', // Orange - for Q1 and Q3
};

// This component serves as a comprehensive practice tool after students have learned
// the basic concepts through the interactive journey components
function ComprehensiveStats() {
  const [selectedScenario, setSelectedScenario] = useState('income');
  const [showOutliers, setShowOutliers] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [interactions, setInteractions] = useState(0);
  
  const svgRef = useRef(null);
  
  // Get current data based on scenario and outlier state
  const currentScenario = scenarios[selectedScenario];
  const currentData = showOutliers ? currentScenario.withOutlier : currentScenario.normal;
  
  // Calculate all statistics
  const calculateStats = useCallback((data) => {
    if (data.length === 0) return null;
    
    // Sort data for median and quartiles
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Mean
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    
    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode (most frequent value)
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
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
    
    // Variance and standard deviation
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      median,
      mode: modes.length === data.length ? [] : modes, // No mode if all values unique
      q1,
      q3,
      iqr,
      min: sorted[0],
      max: sorted[n - 1],
      variance,
      stdDev,
      sum,
      count: n
    };
  }, []);
  
  const stats = calculateStats(currentData);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || !stats) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 60, right: 40, bottom: 60, left: 60 };
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
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...currentData) * 1.1])
      .range([0, innerWidth]);
    
    // Create bins for histogram
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(20));
    
    const bins = histogram(currentData);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .call(grid => {
        grid.selectAll("path").remove();
        grid.selectAll("line")
          .style("stroke", "#374151")
          .style("stroke-dasharray", "2,2")
          .style("opacity", 0.2);
      });
    
    // Draw histogram bars
    const barWidth = innerWidth / bins.length * 0.9;
    
    g.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#1e40af")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .transition()
      .duration(500)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Draw measure lines
    const measures = [
      { type: 'mean', value: stats.mean, color: measureColors.mean, label: 'Mean' },
      { type: 'median', value: stats.median, color: measureColors.median, label: 'Median' }
    ];
    
    if (stats.mode.length === 1) {
      measures.push({ 
        type: 'mode', 
        value: stats.mode[0], 
        color: measureColors.mode, 
        label: 'Mode' 
      });
    }
    
    const linesGroup = g.append("g").attr("class", "measure-lines");
    
    measures.forEach((measure, i) => {
      const lineGroup = linesGroup.append("g")
        .attr("class", `measure-${measure.type}`);
      
      // Line
      lineGroup.append("line")
        .attr("x1", xScale(measure.value))
        .attr("x2", xScale(measure.value))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", measure.color)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", measure.type === 'median' ? "5,5" : "none")
        .attr("opacity", 0)
        .transition()
        .duration(700)
        .delay(i * 200)
        .attr("opacity", 0.9);
      
      // Label with background
      const labelGroup = lineGroup.append("g")
        .attr("transform", `translate(${xScale(measure.value)}, ${-10})`);
      
      const text = `${measure.label}: ${measure.value.toFixed(1)}${currentScenario.unit}`;
      
      // Background rect
      const bbox = { width: text.length * 8, height: 20 };
      labelGroup.append("rect")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2 - 5)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .attr("rx", 3)
        .attr("fill", "#0a0a0a")
        .attr("opacity", 0.8);
      
      labelGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", measure.color)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(text)
        .attr("opacity", 0)
        .transition()
        .duration(700)
        .delay(i * 200)
        .attr("opacity", 1);
    });
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    xAxis.selectAll("path, line")
      .attr("stroke", colors.chart.grid);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    yAxis.selectAll("path, line")
      .attr("stroke", colors.chart.grid);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 45})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text(`Value (${currentScenario.unit})`);
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
    // Show outliers with highlighting
    if (showOutliers) {
      const outlierThreshold = stats.q3 + 1.5 * stats.iqr;
      const outliers = currentData.filter(d => d > outlierThreshold || d < stats.q1 - 1.5 * stats.iqr);
      
      if (outliers.length > 0) {
        g.selectAll(".outlier-marker")
          .data(outliers)
          .enter()
          .append("circle")
          .attr("class", "outlier-marker")
          .attr("cx", d => xScale(d))
          .attr("cy", innerHeight - 10)
          .attr("r", 0)
          .attr("fill", "#ef4444")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .transition()
          .duration(500)
          .delay(1000)
          .attr("r", 6);
      }
    }
    
  }, [currentData, stats, showOutliers, currentScenario]);
  
  // Handle scenario change
  const handleScenarioChange = (scenario) => {
    setSelectedScenario(scenario);
    setShowOutliers(false);
    setInteractions(prev => prev + 1);
  };
  
  // Handle outlier toggle
  const toggleOutliers = () => {
    setShowOutliers(!showOutliers);
    setInteractions(prev => prev + 1);
  };
  
  // Calculate changes when outliers are added
  const normalStats = calculateStats(currentScenario.normal);
  const outlierStats = calculateStats(currentScenario.withOutlier);
  const meanChange = outlierStats ? ((outlierStats.mean - normalStats.mean) / normalStats.mean * 100).toFixed(1) : 0;
  const medianChange = outlierStats ? ((outlierStats.median - normalStats.median) / normalStats.median * 100).toFixed(1) : 0;
  
  return (
    <VisualizationContainer title="Stats Lab: Real-World Applications">
      <div className="flex flex-col gap-6">
        {/* Learning Objective */}
        <VisualizationSection className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-600/30">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">🧪 Practice Lab</h3>
            <p className="text-neutral-300">
              Apply your knowledge of central tendency to real-world scenarios. 
              Explore how outliers affect different measures and when to use each one.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-yellow-900/30 border border-yellow-600/30 rounded text-xs text-yellow-400">Mean</span>
              <span className="px-2 py-1 bg-teal-900/30 border border-teal-600/30 rounded text-xs text-teal-400">Median</span>
              <span className="px-2 py-1 bg-purple-900/30 border border-purple-600/30 rounded text-xs text-purple-400">Mode</span>
              <span className="px-2 py-1 bg-orange-900/30 border border-orange-600/30 rounded text-xs text-orange-400">IQR</span>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Scenario Selection */}
        <VisualizationSection>
          <ControlGroup>
            <label className="text-sm text-neutral-400 mb-2 block">Select Scenario:</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <Button
                  key={key}
                  variant={selectedScenario === key ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleScenarioChange(key)}
                  className="text-xs"
                >
                  {scenario.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              {currentScenario.description}
            </p>
          </ControlGroup>
        </VisualizationSection>
        
        {/* Main Visualization - 85% of space */}
        <GraphContainer height="400px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Statistics Display */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <VisualizationSection className="p-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Mean</span>
              {showOutliers && (
                <span className={cn(
                  "text-xs font-mono",
                  Math.abs(parseFloat(meanChange)) > 10 ? "text-red-400" : "text-yellow-400"
                )}>
                  {meanChange > 0 ? '+' : ''}{meanChange}%
                </span>
              )}
            </div>
            <div className="font-mono text-2xl" style={{ color: measureColors.mean }}>
              {stats?.mean.toFixed(1)}{currentScenario.unit}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Σx/n = {stats?.sum.toFixed(0)}/{stats?.count}
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Median</span>
              {showOutliers && (
                <span className={cn(
                  "text-xs font-mono",
                  Math.abs(parseFloat(medianChange)) < 5 ? "text-green-400" : "text-yellow-400"
                )}>
                  {medianChange > 0 ? '+' : ''}{medianChange}%
                </span>
              )}
            </div>
            <div className="font-mono text-2xl" style={{ color: measureColors.median }}>
              {stats?.median.toFixed(1)}{currentScenario.unit}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Middle value (robust)
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">Mode</span>
            <div className="font-mono text-2xl" style={{ color: measureColors.mode }}>
              {stats?.mode.length === 0 ? '—' : 
               stats?.mode.length === 1 ? `${stats.mode[0]}${currentScenario.unit}` :
               'Multiple'}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Most frequent
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">IQR</span>
            <div className="font-mono text-2xl text-white">
              {stats?.iqr.toFixed(1)}{currentScenario.unit}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Q3 - Q1
            </div>
          </VisualizationSection>
        </div>
        
        {/* Controls */}
        <VisualizationSection>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant={showOutliers ? "danger" : "primary"}
              size="md"
              onClick={toggleOutliers}
              className="min-w-[160px]"
            >
              {showOutliers ? "Remove Outliers" : "Add Outliers"}
            </Button>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showCalculations} 
                onChange={e => setShowCalculations(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-neutral-300">Show Calculations</span>
            </label>
          </div>
        </VisualizationSection>
        
        {/* Show Calculations - Enhanced with visual steps */}
        {showCalculations && (
          <VisualizationSection className="p-4">
            <h4 className="text-lg font-semibold text-white mb-3">📐 Step-by-Step Calculations</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-yellow-400 mb-2">⚖️ Mean Calculation:</p>
                <div className="bg-neutral-900/50 p-3 rounded font-mono text-sm">
                  <div>Sum = {currentData.slice(0, 5).join(' + ')} ... + {currentData[currentData.length - 1]} = {stats?.sum.toFixed(1)}</div>
                  <div className="mt-1">Mean = {stats?.sum.toFixed(1)} ÷ {stats?.count} = {stats?.mean.toFixed(1)}</div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-teal-400 mb-2">🎯 Median Calculation:</p>
                <div className="bg-neutral-900/50 p-3 rounded font-mono text-sm">
                  <div>Sorted: [{[...currentData].sort((a, b) => a - b).slice(0, 5).join(', ')} ... {[...currentData].sort((a, b) => a - b).slice(-3).join(', ')}]</div>
                  <div className="mt-1">
                    {currentData.length % 2 === 0 
                      ? `Middle two values → (${[...currentData].sort((a,b)=>a-b)[currentData.length/2-1]} + ${[...currentData].sort((a,b)=>a-b)[currentData.length/2]}) ÷ 2` 
                      : `Middle value at position ${Math.ceil(currentData.length/2)}`}
                  </div>
                  <div className="mt-1">Median = {stats?.median.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </VisualizationSection>
        )}
        
        {/* Insight Box */}
        {showOutliers && (
          <VisualizationSection className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30">
            <div className="p-4">
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">Key Insight</h4>
              <p className="text-neutral-300">
                {currentScenario.insight}
              </p>
              <div className="mt-2 text-sm text-neutral-400">
                The mean changed by <span className="text-red-400 font-mono">{Math.abs(parseFloat(meanChange))}%</span> while 
                the median only changed by <span className="text-green-400 font-mono">{Math.abs(parseFloat(medianChange))}%</span>.
              </div>
            </div>
          </VisualizationSection>
        )}
        
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Interactions: {interactions}</span>
          <ProgressBar 
            current={Math.min(interactions, 20)} 
            total={20} 
            label="Understanding" 
            variant="emerald"
            className="w-48"
          />
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ComprehensiveStats;