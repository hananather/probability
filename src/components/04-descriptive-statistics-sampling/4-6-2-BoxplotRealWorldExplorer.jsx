"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';

// Use clean color scheme
const colorScheme = createColorScheme('descriptive');

// Real-world scenarios
const scenarios = {
  manufacturing: {
    title: "Quality Control Inspector",
    subtitle: "Monitor production line output",
    description: "You're inspecting widget weights from 3 production lines. Find which line has quality issues.",
    units: "grams",
    target: 100,
    tolerance: 5,
    datasets: [
      { name: "Line A", data: [98, 99, 100, 101, 99, 100, 102, 98, 101, 100, 99, 100, 101, 99, 100], color: colorScheme.chart.primary },
      { name: "Line B", data: [95, 96, 98, 100, 102, 104, 106, 97, 99, 101, 103, 105, 94, 107, 108], color: colorScheme.chart.secondary },
      { name: "Line C", data: [100, 101, 99, 100, 120, 98, 102, 100, 99, 101, 100, 80, 99, 100, 101], color: colorScheme.chart.tertiary }
    ],
    insight: "Line A: Consistent quality. Line B: High variability. Line C: Outliers indicate defects!"
  },
  education: {
    title: "School Data Analyst",
    subtitle: "Compare test scores across classes",
    description: "Analyze math test scores from 3 different teaching methods. Which method works best?",
    units: "score",
    target: 75,
    tolerance: null,
    datasets: [
      { name: "Traditional", data: [65, 70, 72, 68, 75, 80, 73, 69, 71, 74, 67, 70, 72, 76, 68], color: colorScheme.chart.primary },
      { name: "Interactive", data: [72, 78, 85, 88, 82, 79, 84, 86, 80, 83, 77, 81, 85, 87, 90], color: colorScheme.chart.secondary },
      { name: "Hybrid", data: [70, 75, 78, 80, 82, 76, 79, 81, 77, 74, 78, 80, 83, 79, 75], color: colorScheme.chart.tertiary }
    ],
    insight: "Interactive method shows higher median and less variability. It's the most effective!"
  },
  healthcare: {
    title: "Hospital Administrator",
    subtitle: "Analyze patient wait times",
    description: "Emergency room wait times (minutes) for 3 shifts. Which shift needs more staff?",
    units: "minutes",
    target: 30,
    tolerance: null,
    datasets: [
      { name: "Morning", data: [15, 20, 25, 30, 22, 18, 28, 35, 24, 26, 19, 23, 27, 21, 29], color: colorScheme.chart.primary },
      { name: "Afternoon", data: [25, 35, 45, 60, 40, 38, 50, 65, 42, 48, 55, 70, 45, 52, 58], color: colorScheme.chart.secondary },
      { name: "Night", data: [20, 25, 30, 28, 32, 35, 40, 120, 38, 33, 29, 31, 27, 34, 36], color: colorScheme.chart.tertiary }
    ],
    insight: "Afternoon shift has longest waits. Night shift has outliers (emergencies). Both need more staff!"
  },
  finance: {
    title: "Investment Analyst",
    subtitle: "Compare portfolio returns",
    description: "Monthly returns (%) for 3 investment strategies. Which has the best risk-reward profile?",
    units: "%",
    target: 0,
    tolerance: null,
    datasets: [
      { name: "Conservative", data: [1.2, 1.5, 0.8, 1.0, 1.3, 0.9, 1.1, 1.4, 0.7, 1.2, 1.0, 0.8, 1.3, 1.1, 0.9], color: colorScheme.chart.primary },
      { name: "Balanced", data: [2.5, 3.0, -1.0, 4.0, 2.0, -0.5, 3.5, 2.8, 1.5, 3.2, -2.0, 4.5, 2.2, 3.8, 1.0], color: colorScheme.chart.secondary },
      { name: "Aggressive", data: [5.0, 8.0, -5.0, 10.0, -3.0, 12.0, -8.0, 15.0, 6.0, -4.0, 9.0, -6.0, 11.0, 7.0, -2.0], color: colorScheme.chart.tertiary }
    ],
    insight: "Conservative: Low risk, low return. Aggressive: High risk, high return. Balanced offers best risk-reward!"
  }
};

function BoxplotRealWorldExplorer() {
  // State management
  const [scenario, setScenario] = useState('manufacturing');
  const [showComparison, setShowComparison] = useState(false);
  const [highlightOutliers, setHighlightOutliers] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [insights, setInsights] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  
  const svgRef = useRef(null);
  
  // Calculate comprehensive stats for a dataset
  const calculateStats = useCallback((data) => {
    if (!data || data.length === 0) return null;
    
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Quartiles
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
    
    // Whisker endpoints
    const dataWithinFences = sorted.filter(d => d >= lowerFence && d <= upperFence);
    const whiskerMin = dataWithinFences.length > 0 ? Math.min(...dataWithinFences) : q1;
    const whiskerMax = dataWithinFences.length > 0 ? Math.max(...dataWithinFences) : q3;
    
    // Outliers
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
      mean: jStat.mean(sorted),
      std: jStat.stdev(sorted, true),
      cv: jStat.stdev(sorted, true) / Math.abs(jStat.mean(sorted)) // Coefficient of variation
    };
  }, []);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    const currentScenario = scenarios[scenario];
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(currentScenario.title);
    
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .attr("opacity", 0.7)
      .text(currentScenario.subtitle);
    
    // Calculate domain
    let allData = [];
    currentScenario.datasets.forEach(ds => {
      allData = allData.concat(ds.data);
    });
    
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(...allData) - 5,
        Math.max(...allData) + 5
      ])
      .range([0, innerWidth]);
    
    // Draw boxplots
    const boxHeight = 60;
    const boxSpacing = 100;
    const startY = 80;
    
    currentScenario.datasets.forEach((dataset, index) => {
      const stats = calculateStats(dataset.data);
      const y = startY + index * boxSpacing;
      
      const datasetG = g.append("g")
        .attr("class", `dataset-${index}`)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedDataset(selectedDataset === index ? null : index);
          setInteractionCount(prev => prev + 1);
        });
      
      // Highlight on selection
      if (selectedDataset === index) {
        datasetG.append("rect")
          .attr("x", -20)
          .attr("y", y - boxHeight)
          .attr("width", innerWidth + 40)
          .attr("height", boxHeight * 2)
          .attr("fill", dataset.color)
          .attr("fill-opacity", 0.05)
          .attr("rx", 8);
      }
      
      // Dataset name
      datasetG.append("text")
        .attr("x", -10)
        .attr("y", y + 5)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", selectedDataset === index ? "600" : "400")
        .attr("fill", dataset.color)
        .text(dataset.name);
      
      // Box
      datasetG.append("rect")
        .attr("x", xScale(stats.q1))
        .attr("y", y - boxHeight/2)
        .attr("width", 0)
        .attr("height", boxHeight)
        .attr("fill", dataset.color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", dataset.color)
        .attr("stroke-width", 2)
        .attr("rx", 4)
        .transition()
        .duration(600)
        .delay(index * 200)
        .attr("width", xScale(stats.q3) - xScale(stats.q1));
      
      // Median
      datasetG.append("line")
        .attr("x1", xScale(stats.q2))
        .attr("x2", xScale(stats.q2))
        .attr("y1", y - boxHeight/2)
        .attr("y2", y + boxHeight/2)
        .attr("stroke", dataset.color)
        .attr("stroke-width", 0)
        .transition()
        .duration(600)
        .delay(index * 200 + 200)
        .attr("stroke-width", 3);
      
      // Whiskers
      const whiskersG = datasetG.append("g")
        .attr("opacity", 0);
      
      // Lower whisker
      whiskersG.append("line")
        .attr("x1", xScale(stats.whiskerMin))
        .attr("x2", xScale(stats.q1))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
      
      whiskersG.append("line")
        .attr("x1", xScale(stats.whiskerMin))
        .attr("x2", xScale(stats.whiskerMin))
        .attr("y1", y - 15)
        .attr("y2", y + 15)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
      
      // Upper whisker
      whiskersG.append("line")
        .attr("x1", xScale(stats.q3))
        .attr("x2", xScale(stats.whiskerMax))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
      
      whiskersG.append("line")
        .attr("x1", xScale(stats.whiskerMax))
        .attr("x2", xScale(stats.whiskerMax))
        .attr("y1", y - 15)
        .attr("y2", y + 15)
        .attr("stroke", colors.chart.text)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
      
      // Animate the whiskers group
      whiskersG.transition()
        .duration(600)
        .delay(index * 200 + 400)
        .attr("opacity", 1);
      
      // Outliers
      if (stats.outliers.length > 0) {
        const outliersG = datasetG.append("g")
          .attr("class", "outliers");
        
        stats.outliers.forEach((outlier, i) => {
          const outlierG = outliersG.append("g");
          
          outlierG.append("circle")
            .attr("cx", xScale(outlier))
            .attr("cy", y)
            .attr("r", 0)
            .attr("fill", "none")
            .attr("stroke", colorScheme.chart.tertiary)
            .attr("stroke-width", 2)
            .transition()
            .duration(400)
            .delay(index * 200 + 600 + i * 50)
            .attr("r", highlightOutliers ? 8 : 5);
          
          if (highlightOutliers) {
            outlierG.append("text")
              .attr("x", xScale(outlier))
              .attr("y", y - 15)
              .attr("text-anchor", "middle")
              .style("font-size", "10px")
              .style("font-family", "monospace")
              .attr("fill", colorScheme.chart.tertiary)
              .attr("opacity", 0)
              .transition()
              .duration(400)
              .delay(index * 200 + 600 + i * 50)
              .attr("opacity", 1)
              .text(outlier);
          }
        });
      }
      
      // Mean indicator (if comparing)
      if (showComparison) {
        datasetG.append("g")
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(index * 200 + 800)
          .attr("opacity", 1)
          .append("path")
          .attr("d", d3.symbol().type(d3.symbolDiamond).size(100))
          .attr("transform", `translate(${xScale(stats.mean)}, ${y})`)
          .attr("fill", dataset.color)
          .attr("stroke", colors.chart.text)
          .attr("stroke-width", 1);
      }
    });
    
    // Target line (if applicable)
    if (showTarget && currentScenario.target !== null) {
      g.append("line")
        .attr("x1", xScale(currentScenario.target))
        .attr("x2", xScale(currentScenario.target))
        .attr("y1", 20)
        .attr("y2", innerHeight - 20)
        .attr("stroke", colorScheme.chart.warning)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(600)
        .attr("opacity", 0.8);
      
      g.append("text")
        .attr("x", xScale(currentScenario.target))
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .attr("fill", colorScheme.chart.warning)
        .attr("opacity", 0)
        .transition()
        .duration(600)
        .attr("opacity", 1)
        .text(`Target: ${currentScenario.target}${currentScenario.units ? ' ' + currentScenario.units : ''}`);
      
      // Tolerance bands
      if (currentScenario.tolerance) {
        const toleranceG = g.append("g")
          .attr("opacity", 0)
          .transition()
          .duration(600)
          .delay(200)
          .attr("opacity", 0.2);
        
        toleranceG.append("rect")
          .attr("x", xScale(currentScenario.target - currentScenario.tolerance))
          .attr("y", 20)
          .attr("width", xScale(currentScenario.target + currentScenario.tolerance) - xScale(currentScenario.target - currentScenario.tolerance))
          .attr("height", innerHeight - 40)
          .attr("fill", colorScheme.chart.success);
      }
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
      .attr("fill", colors.chart.text)
      .attr("opacity", 0.7);
    
    // Axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text)
      .text(currentScenario.units ? `Value (${currentScenario.units})` : 'Value');
    
    // Legend
    if (showComparison) {
      const legendG = g.append("g")
        .attr("transform", `translate(${innerWidth - 100}, ${innerHeight - 60})`);
      
      legendG.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 110)
        .attr("height", 50)
        .attr("fill", colors.background.secondary)
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("opacity", 0.9);
      
      // Box symbol
      legendG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 10)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0.2)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 1.5);
      
      legendG.append("line")
        .attr("x1", 15)
        .attr("x2", 15)
        .attr("y1", 0)
        .attr("y2", 10)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2);
      
      legendG.append("text")
        .attr("x", 35)
        .attr("y", 8)
        .style("font-size", "11px")
        .attr("fill", colors.chart.text)
        .text("Median");
      
      // Diamond symbol
      legendG.append("path")
        .attr("d", d3.symbol().type(d3.symbolDiamond).size(60))
        .attr("transform", "translate(15, 25)")
        .attr("fill", colorScheme.chart.primary);
      
      legendG.append("text")
        .attr("x", 35)
        .attr("y", 28)
        .style("font-size", "11px")
        .attr("fill", colors.chart.text)
        .text("Mean");
    }
    
  }, [scenario, showComparison, highlightOutliers, showTarget, selectedDataset]);
  
  // Generate insights based on data
  useEffect(() => {
    const currentScenario = scenarios[scenario];
    const newInsights = [];
    
    // Calculate stats for all datasets
    const allStats = currentScenario.datasets.map(ds => ({
      name: ds.name,
      stats: calculateStats(ds.data)
    }));
    
    // Compare medians
    const medians = allStats.map(s => ({ name: s.name, value: s.stats.q2 }));
    medians.sort((a, b) => b.value - a.value);
    newInsights.push(`Highest median: ${medians[0].name} (${medians[0].value.toFixed(1)})`);
    
    // Compare variability (IQR)
    const iqrs = allStats.map(s => ({ name: s.name, value: s.stats.iqr }));
    iqrs.sort((a, b) => a.value - b.value);
    newInsights.push(`Most consistent: ${iqrs[0].name} (IQR: ${iqrs[0].value.toFixed(1)})`);
    
    // Check for outliers
    const outlierCounts = allStats.map(s => ({ 
      name: s.name, 
      count: s.stats.outliers.length 
    }));
    const hasOutliers = outlierCounts.filter(o => o.count > 0);
    if (hasOutliers.length > 0) {
      newInsights.push(`⚠️ Outliers detected in: ${hasOutliers.map(o => `${o.name} (${o.count})`).join(', ')}`);
    }
    
    // Target analysis
    if (currentScenario.target !== null && showTarget) {
      const targetAnalysis = allStats.map(s => ({
        name: s.name,
        median: s.stats.q2,
        withinTolerance: currentScenario.tolerance ? 
          Math.abs(s.stats.q2 - currentScenario.target) <= currentScenario.tolerance : 
          null
      }));
      
      if (currentScenario.tolerance) {
        const withinTarget = targetAnalysis.filter(t => t.withinTolerance);
        if (withinTarget.length > 0) {
          newInsights.push(`✅ Within tolerance: ${withinTarget.map(t => t.name).join(', ')}`);
        }
      }
    }
    
    setInsights(newInsights);
  }, [scenario, showTarget, calculateStats]);
  
  // Progress indicator
  const progress = Math.min(100, (interactionCount / 10) * 100);
  
  return (
    <VisualizationContainer 
      title="4.6 Boxplots in Action"
      description="Apply your knowledge to real-world scenarios"
    >
      <div className="flex flex-col gap-4">
        {/* Scenario Selector */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-400 mb-3">Choose Your Role:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(scenarios).map(([key, scen]) => (
              <Button
                key={key}
                variant={scenario === key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setScenario(key);
                  setSelectedDataset(null);
                  setInteractionCount(prev => prev + 1);
                }}
                className="text-xs"
              >
                {key === 'manufacturing' ? '🏭 Manufacturing' :
                 key === 'education' ? '🎓 Education' :
                 key === 'healthcare' ? '🏥 Healthcare' :
                 '💰 Finance'}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Scenario Description */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-600/30 rounded-lg p-3">
          <p className="text-sm text-neutral-300">
            <span className="font-semibold">Your Mission:</span> {scenarios[scenario].description}
          </p>
        </div>
        
        {/* Main Visualization */}
        <GraphContainer height="500px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Analysis Tools */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showComparison ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setShowComparison(!showComparison);
              setInteractionCount(prev => prev + 1);
            }}
          >
            {showComparison ? '✓ ' : ''}Compare Mean vs Median
          </Button>
          <Button
            variant={highlightOutliers ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setHighlightOutliers(!highlightOutliers);
              setInteractionCount(prev => prev + 1);
            }}
          >
            {highlightOutliers ? '✓ ' : ''}Highlight Outliers
          </Button>
          {scenarios[scenario].target !== null && (
            <Button
              variant={showTarget ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setShowTarget(!showTarget);
                setInteractionCount(prev => prev + 1);
              }}
            >
              {showTarget ? '✓ ' : ''}Show Target
            </Button>
          )}
        </div>
        
        {/* Insights Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data Insights */}
          <div className="bg-neutral-800/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-neutral-400 mb-2">📊 Key Findings</h4>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <p key={i} className="text-sm text-neutral-300">• {insight}</p>
              ))}
            </div>
          </div>
          
          {/* Selected Dataset Stats */}
          {selectedDataset !== null && (
            <div className="bg-neutral-800/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: scenarios[scenario].datasets[selectedDataset].color }}>
                {scenarios[scenario].datasets[selectedDataset].name} Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-neutral-500">Median:</span>
                  <div className="font-mono">{calculateStats(scenarios[scenario].datasets[selectedDataset].data).q2.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-neutral-500">IQR:</span>
                  <div className="font-mono">{calculateStats(scenarios[scenario].datasets[selectedDataset].data).iqr.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Mean:</span>
                  <div className="font-mono">{calculateStats(scenarios[scenario].datasets[selectedDataset].data).mean.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Outliers:</span>
                  <div className="font-mono">{calculateStats(scenarios[scenario].datasets[selectedDataset].data).outliers.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Solution Reveal */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">
            💡 Expert Analysis
          </h4>
          <p className="text-sm text-neutral-300">
            {scenarios[scenario].insight}
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Analysis Experience</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} max={100} className="h-1" />
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default BoxplotRealWorldExplorer;