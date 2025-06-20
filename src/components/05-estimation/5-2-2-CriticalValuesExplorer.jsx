"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Critical Values Table Component
const CriticalValuesTable = memo(function CriticalValuesTable({ selectedLevel }) {
  const commonLevels = [
    { confidence: 0.90, alpha: 0.10, zCritical: 1.645 },
    { confidence: 0.95, alpha: 0.05, zCritical: 1.960 },
    { confidence: 0.99, alpha: 0.01, zCritical: 2.576 },
    { confidence: 0.999, alpha: 0.001, zCritical: 3.291 }
  ];
  
  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-white mb-3">Common Critical Values</h4>
      <div className="space-y-2">
        {commonLevels.map(({ confidence, alpha, zCritical }) => (
          <div 
            key={confidence}
            className={cn(
              "flex justify-between items-center p-2 rounded transition-colors",
              Math.abs(confidence - selectedLevel) < 0.001 
                ? "bg-purple-900/30 border border-purple-600/30" 
                : "bg-neutral-900/50"
            )}
          >
            <div className="text-sm">
              <span className="text-neutral-300">CL: </span>
              <span className="font-mono text-white">{(confidence * 100).toFixed(0)}%</span>
              <span className="text-neutral-500 ml-2">α = {alpha}</span>
            </div>
            <div className="font-mono text-cyan-400">
              ±{zCritical.toFixed(3)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-700">
        <p className="text-xs text-neutral-400">
          Remember: For two-tailed tests, we use ±z<sub>α/2</sub>
        </p>
      </div>
    </div>
  );
});

function CriticalValuesExplorer() {
  // State management
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showShading, setShowShading] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [animating, setAnimating] = useState(false);
  
  const svgRef = useRef(null);
  
  // Calculate values
  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 100, left: 60 };
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
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Critical Values and the Standard Normal Distribution");
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
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
    
    // Generate normal curve data
    const xValues = d3.range(-4, 4.01, 0.01);
    const normalData = xValues.map(x => ({
      x: x,
      y: jStat.normal.pdf(x, 0, 1)
    }));
    
    // Draw shaded areas if enabled
    if (showShading) {
      // Left tail
      const leftTailData = normalData.filter(d => d.x <= -zCritical);
      const leftArea = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(leftTailData)
        .attr("fill", colorScheme.chart.error)
        .attr("opacity", 0.3)
        .attr("d", leftArea)
        .attr("clip-path", "url(#clip)");
      
      // Right tail
      const rightTailData = normalData.filter(d => d.x >= zCritical);
      const rightArea = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(rightTailData)
        .attr("fill", colorScheme.chart.error)
        .attr("opacity", 0.3)
        .attr("d", rightArea)
        .attr("clip-path", "url(#clip)");
      
      // Middle area (confidence region)
      const middleData = normalData.filter(d => d.x >= -zCritical && d.x <= zCritical);
      const middleArea = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(middleData)
        .attr("fill", colorScheme.chart.success)
        .attr("opacity", 0.2)
        .attr("d", middleArea)
        .attr("clip-path", "url(#clip)");
    }
    
    // Draw normal curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Draw critical value lines
    [-zCritical, zCritical].forEach((value, i) => {
      const criticalLine = g.append("line")
        .attr("x1", xScale(value))
        .attr("x2", xScale(value))
        .attr("y1", innerHeight)
        .attr("y2", 0)
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0);
      
      criticalLine.transition()
        .delay(300 + i * 200)
        .duration(500)
        .attr("opacity", 1);
      
      if (showLabels) {
        // Critical value label
        const label = g.append("text")
          .attr("x", xScale(value))
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.accent)
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .text(value > 0 ? `+${zCritical.toFixed(3)}` : `-${zCritical.toFixed(3)}`)
          .attr("opacity", 0);
        
        label.transition()
          .delay(500 + i * 200)
          .duration(500)
          .attr("opacity", 1);
      }
    });
    
    // Area labels
    if (showLabels) {
      // Left tail
      g.append("text")
        .attr("x", xScale(-zCritical - 1))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.error)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`α/2 = ${(alpha/2).toFixed(3)}`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .duration(500)
        .attr("opacity", 1);
      
      // Right tail
      g.append("text")
        .attr("x", xScale(zCritical + 1))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.error)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`α/2 = ${(alpha/2).toFixed(3)}`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .duration(500)
        .attr("opacity", 1);
      
      // Middle area
      g.append("text")
        .attr("x", xScale(0))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.success)
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text(`${(confidenceLevel * 100).toFixed(0)}%`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .duration(500)
        .attr("opacity", 1);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(9));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Standard Normal (z)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Probability Density");
    
    // Add formula annotation
    const formulaGroup = g.append("g")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 70})`);
    
    formulaGroup.append("rect")
      .attr("x", -150)
      .attr("y", -5)
      .attr("width", 300)
      .attr("height", 30)
      .attr("fill", "#0a0a0a")
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("opacity", 0.9);
    
    formulaGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 15)
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "14px")
      .style("font-family", "monospace")
      .text(`P(-${zCritical.toFixed(3)} < Z < ${zCritical.toFixed(3)}) = ${(confidenceLevel).toFixed(3)}`);
    
  }, [confidenceLevel, showShading, showLabels, zCritical, alpha]);
  
  // Animation for level changes
  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [confidenceLevel]);
  
  return (
    <VisualizationContainer 
      title="Critical Values Explorer"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Explore how critical values divide the standard normal distribution into 
              rejection and non-rejection regions. These values determine the width of confidence intervals.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">Key Concept</p>
                <p className="text-neutral-300">
                  For a (1-α)×100% CI, we need the z-value where P(|Z| &gt; z) = α
                </p>
              </div>
              
              <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                <p className="font-semibold text-purple-400 mb-1">Two-Tailed Test</p>
                <p className="text-neutral-300">
                  We split α equally: α/2 in each tail
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Confidence level slider */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Confidence Level: {(confidenceLevel * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min={0.80}
                  max={0.999}
                  step={0.001}
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>80%</span>
                  <span>99.9%</span>
                </div>
              </div>
              
              {/* Quick select buttons */}
              <div>
                <p className="text-sm text-neutral-300 mb-2">Quick Select:</p>
                <div className="flex gap-2 flex-wrap">
                  {[0.90, 0.95, 0.99].map(level => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                        Math.abs(confidenceLevel - level) < 0.001
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                      )}
                    >
                      {(level * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* View options */}
              <div className="space-y-2 pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showShading} 
                    onChange={e => setShowShading(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show area shading</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showLabels} 
                    onChange={e => setShowLabels(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show area labels</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Current Values Display */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Current Values</h4>
            
            <div className="space-y-3">
              <div className="bg-neutral-800 rounded p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Confidence Level (1-α)</span>
                    <span className="font-mono text-purple-400">{(confidenceLevel * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Significance Level (α)</span>
                    <span className="font-mono text-yellow-400">{alpha.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">α/2 (each tail)</span>
                    <span className="font-mono text-red-400">{(alpha/2).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-700 pt-2">
                    <span className="text-neutral-300">Critical Value (±z<sub>α/2</sub>)</span>
                    <span className="font-mono text-cyan-400 font-semibold">±{zCritical.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              
              {/* Probability statements */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Probability Statement</h5>
                <p className="text-xs font-mono text-neutral-300 leading-relaxed">
                  P(Z &lt; -{zCritical.toFixed(3)}) = {(alpha/2).toFixed(3)}<br/>
                  P(Z &gt; {zCritical.toFixed(3)}) = {(alpha/2).toFixed(3)}<br/>
                  P(-{zCritical.toFixed(3)} &lt; Z &lt; {zCritical.toFixed(3)}) = {confidenceLevel.toFixed(3)}
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Critical Values Table */}
          <CriticalValuesTable selectedLevel={confidenceLevel} />
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="500px">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {/* Insights */}
          <VisualizationSection className="p-4 mt-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-cyan-400 font-semibold mb-1">Higher Confidence → Wider Interval</p>
                <p className="text-neutral-300">
                  As confidence level increases, critical values move farther from zero, 
                  creating wider confidence intervals.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-yellow-400 font-semibold mb-1">68-95-99.7 Rule</p>
                <p className="text-neutral-300">
                  Remember: ±1σ ≈ 68%, ±2σ ≈ 95%, ±3σ ≈ 99.7% for the standard normal distribution.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-green-400 font-semibold mb-1">Symmetry Property</p>
                <p className="text-neutral-300">
                  For symmetric confidence intervals, we always use ±z<sub>α/2</sub> as the critical values.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="text-purple-400 font-semibold mb-1">Trade-off</p>
                <p className="text-neutral-300">
                  You can't have both high confidence AND high precision. Choose based on your context!
                </p>
              </div>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default CriticalValuesExplorer;