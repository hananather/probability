import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";
import { cn } from '@/lib/design-system';

/**
 * ConfidenceIntervalVisualizer - A reusable component for visualizing confidence intervals
 * Shows a normal distribution curve with shaded confidence interval region
 * 
 * @param {Object} props
 * @param {number} props.mean - Population mean
 * @param {number} props.std - Standard deviation
 * @param {number} props.sampleSize - Sample size
 * @param {number} props.confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @param {boolean} [props.showAnimation=true] - Whether to animate changes
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.width=400] - Chart width
 * @param {number} [props.height=250] - Chart height
 */
export function ConfidenceIntervalVisualizer({
  mean = 0,
  std = 1,
  sampleSize = 30,
  confidenceLevel = 0.95,
  showAnimation = true,
  className,
  width = 400,
  height = 250
}) {
  const svgRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Calculate z-score for confidence level
  const zScore = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  }[confidenceLevel] || 1.96;
  
  // Calculate standard error
  const standardError = std / Math.sqrt(sampleSize);
  
  // Calculate confidence interval bounds
  const lowerBound = mean - zScore * standardError;
  const upperBound = mean + zScore * standardError;
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([mean - 4 * std, mean + 4 * std])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Normal distribution function
    const normalPDF = (x, mu, sigma) => {
      const factor = 1 / (sigma * Math.sqrt(2 * Math.PI));
      const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
      return factor * Math.exp(exponent);
    };
    
    // Generate curve data
    const curveData = d3.range(mean - 4 * std, mean + 4 * std, std / 50)
      .map(x => ({ x, y: normalPDF(x, mean, std) }));
    
    // Create gradient for shaded area
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "confidence-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#14b8a6")
      .attr("stop-opacity", 0.4);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#14b8a6")
      .attr("stop-opacity", 0.1);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickFormat(d => d.toFixed(1));
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(2));
    
    // Add X axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .style("color", "#9CA3AF");
    
    // Add Y axis
    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .style("color", "#9CA3AF");
    
    // Add gridlines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Create area generator for confidence interval
    const areaGenerator = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    // Filter data for confidence interval
    const confidenceData = curveData.filter(d => d.x >= lowerBound && d.x <= upperBound);
    
    // Add shaded confidence interval area
    const confidenceArea = g.append("path")
      .datum(confidenceData)
      .attr("class", "confidence-area")
      .attr("d", areaGenerator)
      .attr("fill", "url(#confidence-gradient)")
      .attr("opacity", 0);
    
    // Create line generator
    const lineGenerator = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    // Add the curve
    const curve = g.append("path")
      .datum(curveData)
      .attr("class", "distribution-curve")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#14b8a6")
      .attr("stroke-width", 2)
      .attr("opacity", 0);
    
    // Add vertical lines for bounds
    const addBoundLine = (x, label) => {
      const lineGroup = g.append("g")
        .attr("class", "bound-line")
        .attr("opacity", 0);
      
      lineGroup.append("line")
        .attr("x1", xScale(x))
        .attr("y1", 0)
        .attr("x2", xScale(x))
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,2");
      
      lineGroup.append("text")
        .attr("x", xScale(x))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-size", "12px")
        .style("font-family", "monospace")
        .text(x.toFixed(2));
      
      return lineGroup;
    };
    
    const lowerLine = addBoundLine(lowerBound);
    const upperLine = addBoundLine(upperBound);
    
    // Add mean line
    const meanLine = g.append("g")
      .attr("class", "mean-line")
      .attr("opacity", 0);
    
    meanLine.append("line")
      .attr("x1", xScale(mean))
      .attr("y1", 0)
      .attr("x2", xScale(mean))
      .attr("y2", innerHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2);
    
    meanLine.append("text")
      .attr("x", xScale(mean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .text(`μ = ${mean.toFixed(2)}`);
    
    // Add confidence level label
    const confidenceLabel = g.append("text")
      .attr("class", "confidence-label")
      .attr("x", xScale((lowerBound + upperBound) / 2))
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#14b8a6")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`${(confidenceLevel * 100).toFixed(0)}% CI`)
      .attr("opacity", 0);
    
    // Animate elements
    const duration = showAnimation ? 800 : 0;
    
    curve.transition()
      .duration(duration)
      .attr("opacity", 1);
    
    confidenceArea.transition()
      .duration(duration)
      .delay(duration / 2)
      .attr("opacity", 1);
    
    meanLine.transition()
      .duration(duration / 2)
      .delay(duration)
      .attr("opacity", 1);
    
    lowerLine.transition()
      .duration(duration / 2)
      .delay(duration * 1.25)
      .attr("opacity", 1);
    
    upperLine.transition()
      .duration(duration / 2)
      .delay(duration * 1.25)
      .attr("opacity", 1);
    
    confidenceLabel.transition()
      .duration(duration / 2)
      .delay(duration * 1.5)
      .attr("opacity", 1);
    
    setIsInitialized(true);
    
  }, [mean, std, sampleSize, confidenceLevel, showAnimation, width, height]);
  
  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      />
      
      {/* Legend */}
      <div className="absolute top-2 right-2 bg-neutral-800/90 rounded p-2 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-fbbf24"></div>
          <span className="text-neutral-300">Mean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-ef4444 border-dashed"></div>
          <span className="text-neutral-300">CI Bounds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500/30"></div>
          <span className="text-neutral-300">CI Region</span>
        </div>
      </div>
    </div>
  );
}

export default ConfidenceIntervalVisualizer;