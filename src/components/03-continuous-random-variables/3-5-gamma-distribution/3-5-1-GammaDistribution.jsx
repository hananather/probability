"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer } from "../../ui/VisualizationContainer";
import { Button } from "../../ui/button";
import { ProgressBar, ProgressNavigation } from "../../ui/ProgressBar";
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import { createColorScheme, typography } from "../../../lib/design-system";
import { jStat } from "jstat";
import { Tutorial } from "../../ui/Tutorial";
import { Clock, Zap, ChartBar, Target } from "lucide-react";
import { tutorial_3_5_1 } from '@/tutorials/chapter3';
import BackToHub from '../../ui/BackToHub';

const GammaDistribution = React.memo(function GammaDistribution() {
  // Core state
  const [stage, setStage] = useState(1);
  const totalStages = 4;
  const [shape, setShape] = useState(2);
  const [rate, setRate] = useState(1);
  const [showBuilding, setShowBuilding] = useState(false);
  
  // Refs
  const mainSvgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Color scheme
  const colors = createColorScheme('probability');
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && stage > 1) {
      e.preventDefault();
      setStage(Math.max(1, stage - 1));
    } else if (e.key === 'ArrowRight' && stage < totalStages) {
      e.preventDefault();
      setStage(Math.min(totalStages, stage + 1));
    }
  }, [stage, totalStages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Derived values
  const scale = 1 / rate;
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const stdDev = Math.sqrt(variance);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to the Gamma Distribution",
      content: "Learn how waiting times for multiple events create the Gamma distribution.",
    },
    {
      target: ".progress-bar",
      title: "Follow Your Progress",
      content: "Work through 4 stages to master the Gamma distribution.",
      position: "bottom"
    },
    {
      target: ".main-visualization",
      title: "Interactive Visualization",
      content: "Watch how the distribution changes as you adjust parameters.",
      position: "left"
    }
  ];
  
  useSafeMathJax(contentRef, [shape, rate, stage]);
  
  // Main visualization
  useEffect(() => {
    if (!mainSvgRef.current) return;
    
    const containerWidth = mainSvgRef.current.getBoundingClientRect().width;
    const containerHeight = 500;
    const margin = { top: 40, right: 60, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(mainSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(mainSvgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xMax = Math.min(20, mean + 3 * stdDev);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Generate PDF data
    const data = [];
    const step = xMax / 300;
    let yMax = 0;
    
    for (let i = 0; i <= xMax; i += step) {
      const yValue = jStat.gamma.pdf(i, shape, scale);
      if (!isNaN(yValue) && isFinite(yValue) && yValue >= 0) {
        data.push({ x: i, y: yValue });
        yMax = Math.max(yMax, yValue);
      }
    }
    
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height, 0]);
    
    // Grid lines with better visibility
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#4b5563");
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#4b5563");
    
    // Axes with better visibility
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    xAxis.selectAll("text")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px");
    xAxis.selectAll("line")
      .style("stroke", "#9ca3af");
    xAxis.select(".domain")
      .style("stroke", "#9ca3af");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(y));
    
    yAxis.selectAll("text")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px");
    yAxis.selectAll("line")
      .style("stroke", "#9ca3af");
    yAxis.select(".domain")
      .style("stroke", "#9ca3af");
    
    // Labels with better visibility
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#f3f4f6")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Time");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#f3f4f6")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Probability Density");
    
    // Create gradient for area fill
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "gamma-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.7);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.2);
    
    // Area under curve with gradient
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height)
      .y1(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data)
      .attr("fill", "url(#gamma-gradient)")
      .attr("d", area);
    
    // Main curve with vibrant color
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("opacity", 0.95)
      .attr("d", line);
    
    // Animate
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);
    
    // Mean line with better color
    if (mean <= xMax) {
      g.append("line")
        .attr("x1", x(mean))
        .attr("x2", x(mean))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "5,3")
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .attr("opacity", 0.9);
      
      g.append("text")
        .attr("x", x(mean))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#fbbf24")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(`μ = ${mean.toFixed(1)}`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .attr("opacity", 1);
    }
    
    // Building visualization for stage 2
    if (stage === 2 && showBuilding) {
      const buildingG = g.append("g")
        .attr("transform", `translate(0, -${height + 100})`);
      
      // Show individual exponentials with vibrant colors
      const numExp = Math.floor(shape);
      const expColors = d3.scaleOrdinal()
        .domain(d3.range(numExp))
        .range(["#3b82f6", "#ef4444", "#fbbf24", "#a855f7", "#06b6d4"]);
      
      for (let i = 0; i < numExp; i++) {
        const expData = [];
        for (let x = 0; x <= xMax; x += step) {
          expData.push({
            x: x,
            y: rate * Math.exp(-rate * x)
          });
        }
        
        buildingG.append("path")
          .datum(expData)
          .attr("fill", "none")
          .attr("stroke", expColors(i))
          .attr("stroke-width", 2.5)
          .attr("opacity", 0.85)
          .attr("d", line)
          .attr("stroke-dasharray", function() { return this.getTotalLength(); })
          .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
          .transition()
          .duration(800)
          .delay(i * 200)
          .attr("stroke-dashoffset", 0);
      }
      
      buildingG.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "13px")
        .text("Sum of these → Gamma distribution")
        .attr("opacity", 0)
        .transition()
        .delay(numExp * 200 + 500)
        .attr("opacity", 1);
    }
    
  }, [shape, rate, stage, showBuilding, colors]);
  
  // Stage content
  const getStageContent = () => {
    switch(stage) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">What is the Gamma Distribution?</h3>
            <p className="text-sm text-gray-300">
              The Gamma distribution models the time until the k-th event occurs in a Poisson process.
            </p>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Real-world examples:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Time until the 3rd customer arrives</li>
                <li>• Time until the 5th machine failure</li>
                <li>• Total rainfall from multiple storms</li>
              </ul>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
              <p className="text-sm text-blue-300">
                <strong>Key insight:</strong> If individual events follow an exponential distribution,
                the sum of k events follows a Gamma distribution.
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Building Intuition</h3>
            <p className="text-sm text-gray-300">
              See how multiple exponential wait times combine to form the Gamma distribution.
            </p>
            <div className="space-y-3">
              <Button
                variant={showBuilding ? "primary" : "neutral"}
                size="sm"
                onClick={() => setShowBuilding(!showBuilding)}
                className="w-full"
              >
                {showBuilding ? "Hide" : "Show"} Building Blocks
              </Button>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 5].map(k => (
                  <Button
                    key={k}
                    variant={shape === k ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => setShape(k)}
                  >
                    k = {k}
                  </Button>
                ))}
              </div>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
              <p className="text-sm text-purple-300">
                Notice how the distribution becomes more bell-shaped as k increases!
              </p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Understanding Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Shape (k) = {shape.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={shape}
                  onChange={(e) => setShape(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <p className="text-xs text-gray-400 mt-1">Number of events to wait for</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Rate (λ) = {rate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <p className="text-xs text-gray-400 mt-1">How fast events occur</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-400">Mean</p>
                <p className="text-lg font-mono text-emerald-400">{mean.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-400">Std Dev</p>
                <p className="text-lg font-mono text-blue-400">{stdDev.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Mathematical Foundation</h3>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Probability Density Function:</p>
              <div className="text-center py-2" ref={contentRef}>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[f(x) = \\frac{\\lambda^k}{\\Gamma(k)} x^{k-1} e^{-\\lambda x}\\]` 
                }} />
              </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Key Properties:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Mean: μ = k/λ = {mean.toFixed(2)}</li>
                <li>• Variance: σ² = k/λ² = {variance.toFixed(2)}</li>
                <li>• When k=1: Exponential distribution</li>
                <li>• When k is integer: Erlang distribution</li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer 
      title="Understanding the Gamma Distribution"
      className="max-w-7xl mx-auto"
      tutorialSteps={tutorial_3_5_1}
      tutorialKey="gamma-distribution-3-5-1"
    >
      <BackToHub />
      <Tutorial
        steps={tutorialSteps}
        persistKey="gamma-distribution-simplified"
      />
      
      <div className="space-y-6">
        {/* Progress */}
        <div className="progress-bar">
          <ProgressBar
            current={stage}
            total={totalStages}
            label="Learning Progress"
            variant="orange"
          />
          <ProgressNavigation
            current={stage}
            total={totalStages}
            onPrevious={() => setStage(Math.max(1, stage - 1))}
            onNext={() => setStage(Math.min(totalStages, stage + 1))}
            variant="orange"
            className="mt-3"
          />
          
          {/* Keyboard Hint */}
          <div className="mt-2 text-center">
            <p className="text-xs text-neutral-500">
              Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              {getStageContent()}
            </div>
          </div>
          
          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 main-visualization">
              <svg ref={mainSvgRef} style={{ width: '100%', height: '500px' }}></svg>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
});

export default GammaDistribution;