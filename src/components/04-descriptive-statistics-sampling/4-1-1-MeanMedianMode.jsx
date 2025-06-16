"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressBar, ProgressNavigation } from '../ui/ProgressBar';
import { Button } from '../ui/button';

// Use estimation color scheme for statistics
const colorScheme = createColorScheme('estimation');

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
        data.push(Math.round(10 + z0 * 3)); // mean=10, std=3
      }
      break;
      
    case 'skewed':
      // Exponential-like distribution for right skew
      for (let i = 0; i < size; i++) {
        data.push(Math.round(Math.min(20, -Math.log(Math.random()) * 4)));
      }
      break;
      
    default:
      return [];
  }
  
  return data.filter(x => x >= 1 && x <= 20);
};

function MeanMedianMode() {
  const [dataPoints, setDataPoints] = useState([3, 5, 5, 7, 8, 9, 9, 9, 10, 12]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [stage, setStage] = useState(1);
  const [totalInteractions, setTotalInteractions] = useState(0);
  
  const svgRef = useRef(null);
  const d3Container = useRef(null);
  
  // Calculate descriptive statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, mode: [] };
    
    // Mean
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // Median
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Mode
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq)
      .map(Number);
    
    return { mean, median, mode };
  };
  
  const { mean, median, mode } = calculateStats(dataPoints);
  
  // Clear all data
  const clearData = () => {
    setDataPoints([]);
    setTotalInteractions(0);
    setStage(1);
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
      .domain([0, 20])
      .range([0, innerWidth]);
    
    const value = Math.round(xScale.invert(x - margin.left));
    if (value >= 0 && value <= 20) {
      setDataPoints([...dataPoints, value]);
      setTotalInteractions(prev => prev + 1);
    }
  }, [dataPoints, draggingIndex]);
  
  // Update stage based on interactions
  useEffect(() => {
    if (totalInteractions >= 20) setStage(4);
    else if (totalInteractions >= 10) setStage(3);
    else if (totalInteractions >= 5) setStage(2);
  }, [totalInteractions]);
  
  // Main visualization (dot plot)
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500; // Increased height for better space utilization
    const margin = { top: 40, right: 40, bottom: 80, left: 60 };
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
    
    // Fixed scales for consistency
    const xScale = d3.scaleLinear()
      .domain([0, 20])
      .range([0, innerWidth]);
    
    // Count occurrences for y scale
    const valueCounts = dataPoints.length > 0 
      ? d3.rollup(dataPoints, v => v.length, d => d)
      : new Map();
    const maxCount = Math.max(8, ...Array.from(valueCounts.values()));
    
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Draw vertical lines for mean, median, mode with smooth transitions
    const measureGroup = g.selectAll(".measure-line-group")
      .data(dataPoints.length > 0 ? [
        { value: mean, color: colorScheme.chart.primary, label: 'Mean' },
        { value: median, color: colorScheme.chart.secondary, label: 'Median' },
        ...(mode.length === 1 ? [{ value: mode[0], color: colorScheme.chart.tertiary, label: 'Mode' }] : [])
      ] : []);
    
    const measureEnter = measureGroup.enter()
      .append("g")
      .attr("class", "measure-line-group");
    
    measureEnter.append("line")
      .attr("class", "measure-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke-width", 3)
      .attr("opacity", 0);
    
    measureEnter.append("text")
      .attr("class", "measure-label")
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace");
    
    // Update
    measureGroup.merge(measureEnter)
      .select(".measure-line")
      .transition()
      .duration(500)
      .attr("x1", d => xScale(d.value))
      .attr("x2", d => xScale(d.value))
      .attr("stroke", d => d.color)
      .attr("opacity", 0.9);
    
    measureGroup.merge(measureEnter)
      .select(".measure-label")
      .transition()
      .duration(500)
      .attr("x", d => xScale(d.value))
      .attr("fill", d => d.color)
      .text(d => `${d.label}: ${d.value.toFixed(1)}`);
    
    measureGroup.exit()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
    
    // Prepare data for dots with indices
    const dotData = [];
    dataPoints.forEach((value, originalIndex) => {
      const count = dotData.filter(d => d.value === value).length;
      dotData.push({ value, stackIndex: count, originalIndex });
    });
    
    // Draw dots with drag functionality
    const dots = g.selectAll(".data-dot")
      .data(dotData, d => d.originalIndex);
    
    // Enter
    const dotsEnter = dots.enter()
      .append("circle")
      .attr("class", "data-dot")
      .attr("cx", d => xScale(d.value))
      .attr("cy", innerHeight)
      .attr("r", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 12)
          .attr("opacity", 1);
        setHoveredValue(d.value);
      })
      .on("mouseleave", function() {
        if (draggingIndex === null) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8)
            .attr("opacity", 0.85);
        }
        setHoveredValue(null);
      });
    
    // Update
    dots.merge(dotsEnter)
      .transition()
      .duration(500)
      .attr("cx", d => xScale(d.value))
      .attr("cy", d => yScale(d.stackIndex + 0.5))
      .attr("r", 8)
      .attr("opacity", 0.85);
    
    // Exit
    dots.exit()
      .transition()
      .duration(300)
      .attr("r", 0)
      .remove();
    
    // Add drag behavior
    const drag = d3.drag()
      .on("start", function(event, d) {
        setDraggingIndex(d.originalIndex);
        d3.select(this).attr("opacity", 1).attr("r", 12);
      })
      .on("drag", function(event, d) {
        const newValue = Math.round(xScale.invert(event.x));
        if (newValue >= 0 && newValue <= 20) {
          const newPoints = [...dataPoints];
          newPoints[d.originalIndex] = newValue;
          setDataPoints(newPoints);
        }
      })
      .on("end", function() {
        setDraggingIndex(null);
        setTotalInteractions(prev => prev + 1);
        d3.select(this).attr("opacity", 0.85).attr("r", 8);
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
    
    // Y axis (hidden for cleaner look)
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(0));
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    // Add instruction text
    if (dataPoints.length === 0) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.5)
        .text("Click anywhere to add data points");
    }
    
  }, [dataPoints, mean, median, mode, draggingIndex, handleVisualizationClick]);
  
  // Get milestone message based on stage
  const getMilestoneMessage = () => {
    switch(stage) {
      case 1:
        return {
          title: "🎯 Ready to explore!",
          message: "Click on the plot to add data points, or drag existing points to move them."
        };
      case 2:
        return {
          title: "📊 Great start!",
          message: "Notice how mean changes more than median when you add outliers."
        };
      case 3:
        return {
          title: "🎓 Key insight!",
          message: "The median is robust to outliers - it stays stable while mean shifts!"
        };
      case 4:
        return {
          title: "✨ Statistics Expert!",
          message: "You've mastered central tendency! Try creating different distribution shapes."
        };
      default:
        return { title: "", message: "" };
    }
  };
  
  return (
    <VisualizationContainer title="Measures of Central Tendency">
      <div className="flex flex-col gap-6">
        {/* Main Visualization - 85% of vertical space */}
        <div 
          ref={d3Container}
          className="relative cursor-pointer"
          onClick={handleVisualizationClick}
          style={{ height: '500px' }}
        >
          <GraphContainer height="100%">
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
          </GraphContainer>
        </div>
          
        {/* Controls and Stats - 15% of vertical space */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Quick Actions */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('normal'));
                  setTotalInteractions(prev => prev + 1);
                }}
              >
                Normal Distribution
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setDataPoints(generateDistributionData('skewed'));
                  setTotalInteractions(prev => prev + 1);
                }}
              >
                Skewed Distribution
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={clearData}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          {/* Statistics Display */}
          <div className="flex gap-6 items-center">
            <div>
              <span className="text-sm text-neutral-400">Data Points</span>
              <div className="font-mono text-2xl text-white">{dataPoints.length}</div>
            </div>
            {dataPoints.length > 0 && (
              <>
                <div>
                  <span className="text-sm text-neutral-400">Distribution</span>
                  <div className="font-mono text-lg text-white">
                    {Math.abs(mean - median) < 0.5 ? 'Symmetric' :
                     mean > median ? 'Right-Skewed' : 'Left-Skewed'}
                  </div>
                </div>
                {hoveredValue !== null && (
                  <div className="animate-pulse">
                    <span className="text-sm text-neutral-400">Hovering</span>
                    <div className="font-mono text-2xl text-white">{hoveredValue}</div>
                  </div>
                )}
              </>
            )}
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
              variant="emerald"
            />
          </div>
          
          <div className="text-white">
            <div className="text-lg font-semibold mb-1">{getMilestoneMessage().title}</div>
            <div className="text-sm text-neutral-300">{getMilestoneMessage().message}</div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default MeanMedianMode;