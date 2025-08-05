"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";

// Helper function for inverse normal CDF
const quantileNormal = (p) => {
  const a1 = -39.69683028665376;
  const a2 = 220.9460984245205;
  const a3 = -275.9285104469687;
  const a4 = 138.3577518672690;
  const a5 = -30.66479806614716;
  const a6 = 2.506628277459239;
  const b1 = -54.47609879822406;
  const b2 = 161.5858368580409;
  const b3 = -155.6989798598866;
  const b4 = 66.80131188771972;
  const b5 = -13.28068155288572;
  const c1 = -0.007784894002430293;
  const c2 = -0.3223964580411365;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;
  const d1 = 0.007784695709041462;
  const d2 = 0.3224671290700398;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;
  
  const p_low = 0.02425;
  const p_high = 1 - p_low;
  
  let q, r;
  if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
};
import { GraphContainer } from '../ui/VisualizationContainer';
import { Info, TrendingUp } from 'lucide-react';
import { useMathJax } from '../../hooks/useMathJax';

/**
 * EmpiricalRuleEnhanced - Deep explanation of the 68-95-99.7 rule
 * Shows why these specific percentages and their connection to standard deviations
 */
const EmpiricalRuleEnhanced = React.memo(function EmpiricalRuleEnhanced() {
  const svgRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState(2); // 1, 2, or 3 sigma
  const [showProbabilities, setShowProbabilities] = useState(true);
  const contentRef = useMathJax([selectedLevel]);
  
  const levels = {
    1: { percentage: 68.27, zValue: 1, color: '#3b82f6' },
    2: { percentage: 95.45, zValue: 2, color: '#10b981' },
    3: { percentage: 99.73, zValue: 3, color: '#8b5cf6' }
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // X scale for z-scores
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, innerWidth]);
    
    // Y scale for density
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Normal distribution curve
    const normalPDF = (x) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    
    const curveData = d3.range(-4, 4.1, 0.1).map(x => ({
      x: x,
      y: normalPDF(x)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Add gradients
    const defs = svg.append("defs");
    
    // Create gradient for each level
    Object.entries(levels).forEach(([level, config]) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `area-gradient-${level}`)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", config.color)
        .attr("stop-opacity", 0.6);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", config.color)
        .attr("stop-opacity", 0.2);
    });
    
    // Draw areas for each level
    [3, 2, 1].forEach(level => {
      const areaData = curveData.filter(d => d.x >= -level && d.x <= level);
      
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      g.append("path")
        .datum(areaData)
        .attr("fill", `url(#area-gradient-${level})`)
        .attr("opacity", selectedLevel >= level ? 0.8 : 0.2)
        .attr("d", area)
        .style("transition", "opacity 0.3s");
    });
    
    // Draw the curve
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add vertical lines at sigma boundaries
    [-3, -2, -1, 0, 1, 2, 3].forEach(sigma => {
      const isSelected = Math.abs(sigma) <= selectedLevel;
      
      g.append("line")
        .attr("x1", xScale(sigma))
        .attr("x2", xScale(sigma))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", isSelected ? levels[Math.abs(sigma) || 1].color : "#6b7280")
        .attr("stroke-width", sigma === 0 ? 2 : 1)
        .attr("stroke-dasharray", sigma === 0 ? "none" : "5,3")
        .style("opacity", isSelected ? 0.8 : 0.3);
      
      // Add labels
      g.append("text")
        .attr("x", xScale(sigma))
        .attr("y", innerHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", isSelected ? levels[Math.abs(sigma) || 1].color : "#6b7280")
        .style("font-size", "12px")
        .style("font-weight", sigma === 0 ? "bold" : "normal")
        .text(sigma === 0 ? "μ" : `${sigma > 0 ? '+' : ''}${sigma}σ`);
    });
    
    // Add percentage labels
    if (showProbabilities) {
      const currentLevel = levels[selectedLevel];
      
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", currentLevel.color)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(`${currentLevel.percentage}%`);
      
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2 + 25)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "14px")
        .text(`within ±${selectedLevel}σ`);
    }
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues([-3, -2, -1, 0, 1, 2, 3]).tickFormat(""))
      .style("font-size", "12px");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
        .ticks(5)
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
  }, [selectedLevel, showProbabilities]);
  
  const calculateZScore = (confidenceLevel) => {
    // For a two-tailed test
    const alpha = 1 - confidenceLevel;
    return quantileNormal(1 - alpha / 2);
  };
  
  return (
    <div ref={contentRef} className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        The 68-95-99.7 Rule Explained
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Why These Specific Percentages?
          </h4>
          <p className="text-sm text-neutral-300">
            The 68-95-99.7 rule (also called the Empirical Rule) describes how data is distributed 
            in a normal distribution. These aren't arbitrary numbers – they correspond to exactly 
            1, 2, and 3 standard deviations from the mean.
          </p>
        </div>
        
        <GraphContainer title="Standard Normal Distribution">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {Object.entries(levels).map(([level, config]) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(Number(level))}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === Number(level)
                  ? 'text-white shadow-md ring-2'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              style={selectedLevel === Number(level) ? {
                backgroundColor: config.color,
                boxShadow: `0 4px 6px ${config.color}33`,
                ringColor: `${config.color}88`
              } : {}}
            >
              ±{level}σ ({config.percentage}%)
            </button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-4 border transition-all ${
            selectedLevel === 1 
              ? 'bg-blue-900/20 border-blue-700/50' 
              : 'bg-neutral-900/50 border-neutral-700/50'
          }`}>
            <h5 className="font-semibold text-blue-400 mb-2">±1σ (68.27%)</h5>
            <p className="text-sm text-neutral-300 mb-2">
              About 68% of data falls within one standard deviation of the mean.
            </p>
            <div className="bg-neutral-800 rounded p-2 text-xs">
              <span dangerouslySetInnerHTML={{ __html: `\\[P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx 0.6827\\]` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              CI: Use z = 1.00 for ~68% confidence
            </p>
          </div>
          
          <div className={`rounded-lg p-4 border transition-all ${
            selectedLevel === 2 
              ? 'bg-emerald-900/20 border-emerald-700/50' 
              : 'bg-neutral-900/50 border-neutral-700/50'
          }`}>
            <h5 className="font-semibold text-emerald-400 mb-2">±2σ (95.45%)</h5>
            <p className="text-sm text-neutral-300 mb-2">
              About 95% of data falls within two standard deviations of the mean.
            </p>
            <div className="bg-neutral-800 rounded p-2 text-xs">
              <span dangerouslySetInnerHTML={{ __html: `\\[P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 0.9545\\]` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              CI: Use z = 1.96 for exactly 95% confidence
            </p>
          </div>
          
          <div className={`rounded-lg p-4 border transition-all ${
            selectedLevel === 3 
              ? 'bg-purple-900/20 border-purple-700/50' 
              : 'bg-neutral-900/50 border-neutral-700/50'
          }`}>
            <h5 className="font-semibold text-purple-400 mb-2">±3σ (99.73%)</h5>
            <p className="text-sm text-neutral-300 mb-2">
              About 99.7% of data falls within three standard deviations of the mean.
            </p>
            <div className="bg-neutral-800 rounded p-2 text-xs">
              <span dangerouslySetInnerHTML={{ __html: `\\[P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) \\approx 0.9973\\]` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              CI: Use z = 2.58 for exactly 99% confidence
            </p>
          </div>
        </div>
        
        <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
          <h5 className="font-semibold text-amber-400 mb-2">Common Confidence Levels</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-400 mb-2">Standard Levels:</p>
              <ul className="space-y-1 text-neutral-300">
                <li>• 90% confidence: z = {calculateZScore(0.90).toFixed(3)}</li>
                <li>• 95% confidence: z = {calculateZScore(0.95).toFixed(3)}</li>
                <li>• 99% confidence: z = {calculateZScore(0.99).toFixed(3)}</li>
              </ul>
            </div>
            <div>
              <p className="text-neutral-400 mb-2">Why Not Exactly 2?</p>
              <p className="text-neutral-300">
                While ±2σ gives 95.45%, we often want exactly 95%. 
                That's why we use z = 1.96 instead of 2.00 for 95% CIs.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/50">
          <h5 className="font-semibold text-blue-400 mb-2">Connection to Quality Control</h5>
          <p className="text-sm text-neutral-300">
            The 68-95-99.7 rule is fundamental in Six Sigma quality control:
          </p>
          <ul className="text-sm text-neutral-300 mt-2 space-y-1">
            <li>• 3σ control limits catch 99.73% of normal variation</li>
            <li>• Anything outside ±3σ is likely a special cause</li>
            <li>• "Six Sigma" means the specification limits are ±6σ from the mean</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export { EmpiricalRuleEnhanced };