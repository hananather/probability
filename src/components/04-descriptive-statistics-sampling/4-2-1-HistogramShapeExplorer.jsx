"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { RangeSlider } from "../ui/RangeSlider";

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Helper function to validate and clean data
const cleanData = (data) => {
  return data
    .filter(x => !isNaN(x) && isFinite(x))
    .map(x => Math.max(-10, Math.min(10, x))); // Bound data to reasonable range
};

// Preset scenarios for quick exploration
const presetScenarios = [
  { 
    name: "Symmetric (Normal)", 
    type: "normal", 
    params: { mean: 0, std: 1 }, 
    bins: 20,
    description: "Bell-shaped curve"
  },
  { 
    name: "Right-Skewed (Income)", 
    type: "exponential", 
    params: { rate: 1.5 }, 
    bins: 25,
    description: "Long tail to the right" 
  },
  { 
    name: "Test Scores", 
    type: "normal", 
    params: { mean: 2, std: 0.8 }, 
    bins: 20,
    description: "Slightly left-skewed"
  }
];

function HistogramShapeExplorer() {
  const [distributionType, setDistributionType] = useState('normal');
  const [numBins, setNumBins] = useState(20);
  const [data, setData] = useState([]);
  const [stage, setStage] = useState(1);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);
  
  // Distribution parameters - simplified
  const [normalParams, setNormalParams] = useState({ mean: 0, std: 1 });
  const [exponentialParams, setExponentialParams] = useState({ rate: 1 });
  
  const svgRef = useRef(null);
  
  // Generate data based on distribution type
  const generateData = useCallback(() => {
    let newData = [];
    const sampleSize = 300; // Fixed sample size for clarity
    
    try {
      switch (distributionType) {
        case 'normal':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.normal.sample(normalParams.mean, normalParams.std);
            newData.push(value);
          }
          break;
          
        case 'exponential':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.exponential.sample(exponentialParams.rate);
            // Transform to create right skew, cap at reasonable range
            newData.push(Math.min(value - 1, 8));
          }
          break;
      }
      
      // Clean and validate data
      const cleanedData = cleanData(newData);
      setData(cleanedData);
      setTotalInteractions(prev => prev + 1);
      
    } catch (error) {
      // Fallback to simple normal distribution
      const fallbackData = Array.from({ length: sampleSize }, () => 
        jStat.normal.sample(0, 1)
      );
      setData(cleanData(fallbackData));
    }
  }, [distributionType, normalParams, exponentialParams]);
  
  // Initialize with data
  useEffect(() => {
    generateData();
  }, []); // Only run once on mount
  
  // Update stage based on interactions
  useEffect(() => {
    if (totalInteractions >= 15) setStage(4);
    else if (totalInteractions >= 10) setStage(3);
    else if (totalInteractions >= 5) setStage(2);
  }, [totalInteractions]);
  
  // Calculate statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0 };
    
    const cleanedData = cleanData(data);
    if (cleanedData.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0 };
    
    const mean = jStat.mean(cleanedData);
    const median = jStat.median(cleanedData);
    const std = jStat.stdev(cleanedData);
    
    // Calculate skewness
    const n = cleanedData.length;
    let skewness = 0;
    
    if (n >= 3 && std > 0) {
      const m3 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
      const m2 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
      
      if (m2 > 0) {
        const g1 = m3 / Math.pow(m2, 1.5);
        skewness = Math.sqrt(n * (n - 1)) / (n - 2) * g1;
      }
    }
    
    return { mean, median, std, skewness };
  };
  
  const stats = calculateStats(data);
  
  // Get milestone message
  const getMilestoneMessage = () => {
    switch(stage) {
      case 1:
        return {
          title: "🎯 Getting Started",
          message: "Explore how histogram shapes reveal data distribution patterns."
        };
      case 2:
        return {
          title: "📊 Bin Width Matters!",
          message: "Too few bins hide details, too many create noise. Find the sweet spot!"
        };
      case 3:
        return {
          title: "🎓 Skewness Detection",
          message: "Right-skewed: mean > median. Left-skewed: mean < median."
        };
      case 4:
        return {
          title: "✨ Histogram Expert!",
          message: "You understand how to interpret distribution shapes!"
        };
      default:
        return { title: "", message: "" };
    }
  };
  
  // Main histogram visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 600; // Increased height for better space utilization
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Dark background - matching ExpectationVariance
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xExtent = d3.extent(data);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);
    
    // Create histogram
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines - matching ExpectationVariance style
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
    
    // Draw histogram bars with hover effects
    const barGroup = g.append("g");
    
    const bars = barGroup.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4) // Rounded corners
      .style("cursor", "pointer")
      .transition()
      .duration(300)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Hover effects
    barGroup.selectAll("rect")
      .on("mouseover", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", colorScheme.chart.primaryLight);
          
        // Show tooltip with bin info
        const tooltip = g.append("g")
          .attr("class", "tooltip");
          
        const x = xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2;
        const y = yScale(d.length) - 10;
        
        const rect = tooltip.append("rect")
          .attr("x", x - 30)
          .attr("y", y - 20)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "#1a1a1a")
          .attr("stroke", colors.chart.grid)
          .attr("rx", 3);
          
        tooltip.append("text")
          .attr("x", x)
          .attr("y", y - 5)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .attr("font-size", "11px")
          .text(`n=${d.length}`);
      })
      .on("mouseout", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", colorScheme.chart.primary);
          
        g.selectAll(".tooltip").remove();
      });
    
    // Add title showing current distribution
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(distributionType === 'normal' ? 'Normal Distribution' : 'Exponential Distribution (Right-Skewed)');
    
    // Always draw mean and median lines with smooth transitions
    const meanLine = g.append("line")
      .attr("x1", xScale(stats.mean))
      .attr("x2", xScale(stats.mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 0.9);
    
    const medianLine = g.append("line")
      .attr("x1", xScale(stats.median))
      .attr("x2", xScale(stats.median))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 0.9);
    
    // Labels with better positioning
    const meanX = xScale(stats.mean);
    const medianX = xScale(stats.median);
    const labelDistance = Math.abs(meanX - medianX);
    
    if (labelDistance < 100) {
      // Stack labels vertically when close
      g.append("text")
        .attr("x", meanX)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Mean: ${stats.mean.toFixed(2)}`);
      
      g.append("text")
        .attr("x", medianX)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Median: ${stats.median.toFixed(2)}`);
    } else {
      // Normal side-by-side labels
      g.append("text")
        .attr("x", meanX)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Mean: ${stats.mean.toFixed(2)}`);
      
      g.append("text")
        .attr("x", medianX)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Median: ${stats.median.toFixed(2)}`);
    }
    
    // Add skewness indicator
    const skewText = g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .attr("fill", Math.abs(stats.skewness) < 0.5 ? '#10B981' : 
                   stats.skewness > 0 ? '#F97316' : '#3B82F6')
      .text(`Skewness: ${stats.skewness.toFixed(2)}`);
    
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", 50)
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text(Math.abs(stats.skewness) < 0.5 ? "Symmetric" :
            stats.skewness > 0 ? "Right-Skewed" : "Left-Skewed");
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("font-family", "monospace");
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("font-family", "monospace");
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
  }, [data, numBins, distributionType, normalParams, exponentialParams, stats]);
  
  // Handle preset selection
  const handlePresetSelect = (index) => {
    const preset = presetScenarios[index];
    setSelectedPreset(index);
    setDistributionType(preset.type);
    setNumBins(preset.bins);
    
    if (preset.type === 'normal') {
      setNormalParams(preset.params);
    } else if (preset.type === 'exponential') {
      setExponentialParams(preset.params);
    }
    
    generateData();
  };
  
  return (
    <VisualizationContainer title="Histogram Shape Explorer">
      <div className="flex flex-col gap-6">
        {/* Main Visualization - 85% of vertical space */}
        <GraphContainer height="600px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
          
        {/* Controls and Stats - 15% of vertical space */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Quick Actions */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Preset Scenarios */}
              <div className="flex gap-2">
                {presetScenarios.map((preset, index) => (
                  <Button
                    key={index}
                    variant={selectedPreset === index ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => handlePresetSelect(index)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              
              {/* Bin Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Bins:</span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={numBins}
                  onChange={(e) => {
                    setNumBins(Number(e.target.value));
                    setTotalInteractions(prev => prev + 1);
                  }}
                  className="w-32"
                />
                <span className="font-mono text-sm text-white w-8">{numBins}</span>
              </div>
              
              <Button
                variant="success"
                size="sm"
                onClick={generateData}
              >
                Generate New Data
              </Button>
            </div>
          </div>
          
          {/* Statistics Display */}
          <div className="flex gap-6 items-center">
            <div>
              <span className="text-sm text-neutral-400">Distribution</span>
              <div className="text-lg font-semibold text-white">
                {Math.abs(stats.mean - stats.median) < 0.1 ? "Symmetric" :
                 stats.mean > stats.median ? "Right-Skewed" : "Left-Skewed"}
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-400">Mean vs Median</span>
              <div className="font-mono text-lg text-white">
                {stats.mean > stats.median + 0.1 ? "Mean > Median" :
                 stats.mean < stats.median - 0.1 ? "Mean < Median" : "Mean ≈ Median"}
              </div>
            </div>
          </div>
        </div>
          
        {/* Progress and Insights */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">Learning Progress</h4>
            <ProgressBar 
              current={stage} 
              total={4} 
              label="Stage" 
              variant="purple"
            />
          </div>
          
          <div className="text-white">
            <div className="text-lg font-semibold mb-1">{getMilestoneMessage().title}</div>
            <div className="text-sm text-neutral-300">{getMilestoneMessage().message}</div>
            
            {stage < 4 && (
              <div className="mt-3 p-3 bg-neutral-900/50 rounded-lg">
                <div className="text-xs text-neutral-400 mb-1">💡 Quick Tip</div>
                <div className="text-sm text-neutral-200">
                  {numBins < 10 ? "Try increasing bins to see more detail!" :
                   numBins > 30 ? "Too many bins can create noise. Try reducing them." :
                   "Good bin choice! Notice how the shape reveals the distribution pattern."}
                </div>
              </div>
            )}
          </div>
        </div>
          
      </div>
    </VisualizationContainer>
  );
}

export default HistogramShapeExplorer;