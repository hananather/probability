"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../../ui/VisualizationContainer';
import { colors, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../../ui/ProgressBar';
import { tutorial_5_4_1 } from '@/tutorials/chapter5';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Stages for progressive learning
const STAGES = [
  { n: 5, label: "Small Sample", description: "Maximum difference" },
  { n: 15, label: "Medium Sample", description: "Still noticeably wider" },
  { n: 30, label: "Large Sample", description: "Nearly converged" },
  { n: 100, label: "Convergence", description: "Practically identical" }
];

// Course example data (n=9)
const COURSE_EXAMPLE = {
  n: 9,
  xbar: 100,
  s: 15,
  confidence: 0.95,
  description: "Course example from page 34"
};

// Interval Comparison Visualization
const IntervalComparisonViz = memo(function IntervalComparisonViz({ 
  sampleSize, xbar, s, sigma, confidenceLevel 
}) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate critical values and intervals
    const df = sampleSize - 1;
    const alpha = 1 - confidenceLevel;
    const tCritical = jStat.studentt.inv(1 - alpha/2, df);
    const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
    
    // T-interval (using s)
    const tSE = s / Math.sqrt(sampleSize);
    const tMOE = tCritical * tSE;
    const tLower = xbar - tMOE;
    const tUpper = xbar + tMOE;
    
    // Z-interval (using σ)
    const zSE = sigma / Math.sqrt(sampleSize);
    const zMOE = zCritical * zSE;
    const zLower = xbar - zMOE;
    const zUpper = xbar + zMOE;
    
    // Scale
    const extent = Math.max(tMOE, zMOE) * 1.5;
    const xScale = d3.scaleLinear()
      .domain([xbar - extent, xbar + extent])
      .range([0, innerWidth]);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`${confidenceLevel * 100}% Confidence Intervals (n = ${sampleSize})`);
    
    // Center line (sample mean)
    g.append("line")
      .attr("x1", xScale(xbar))
      .attr("x2", xScale(xbar))
      .attr("y1", 20)
      .attr("y2", innerHeight - 20)
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("text")
      .attr("x", xScale(xbar))
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`x̄ = ${xbar}`);
    
    // Interval positions
    const tY = innerHeight * 0.35;
    const zY = innerHeight * 0.65;
    const barHeight = 12;
    const bracketHeight = 20;
    
    // T-interval visualization
    const tInterval = g.append("g");
    
    // T-interval bar
    tInterval.append("rect")
      .attr("x", xScale(tLower))
      .attr("y", tY - barHeight/2)
      .attr("width", xScale(tUpper) - xScale(tLower))
      .attr("height", barHeight)
      .attr("fill", colorScheme.chart.primary)
      .attr("rx", 2);
    
    // T-interval brackets
    [tLower, tUpper].forEach(x => {
      tInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", tY - bracketHeight/2)
        .attr("y2", tY + bracketHeight/2)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 3);
    });
    
    // T-interval labels
    tInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", tY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("T-interval (σ unknown, use s)");
    
    // T-interval values
    tInterval.append("text")
      .attr("x", xScale(tLower) - 5)
      .attr("y", tY + 35)
      .attr("text-anchor", "end")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(tLower.toFixed(2));
    
    tInterval.append("text")
      .attr("x", xScale(tUpper) + 5)
      .attr("y", tY + 35)
      .attr("text-anchor", "start")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(tUpper.toFixed(2));
    
    // Z-interval visualization
    const zInterval = g.append("g");
    
    // Z-interval bar
    zInterval.append("rect")
      .attr("x", xScale(zLower))
      .attr("y", zY - barHeight/2)
      .attr("width", xScale(zUpper) - xScale(zLower))
      .attr("height", barHeight)
      .attr("fill", colorScheme.chart.secondary)
      .attr("rx", 2);
    
    // Z-interval brackets
    [zLower, zUpper].forEach(x => {
      zInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", zY - bracketHeight/2)
        .attr("y2", zY + bracketHeight/2)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3);
    });
    
    // Z-interval labels
    zInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", zY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.secondary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Z-interval (σ known)");
    
    // Z-interval values
    zInterval.append("text")
      .attr("x", xScale(zLower) - 5)
      .attr("y", zY + 35)
      .attr("text-anchor", "end")
      .attr("fill", colorScheme.chart.secondary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(zLower.toFixed(2));
    
    zInterval.append("text")
      .attr("x", xScale(zUpper) + 5)
      .attr("y", zY + 35)
      .attr("text-anchor", "start")
      .attr("fill", colorScheme.chart.secondary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(zUpper.toFixed(2));
    
    // Width difference annotation
    const widthDiff = ((tMOE - zMOE) / zMOE * 100);
    
    // Draw connecting lines to show width difference
    const diffY = innerHeight - 10;
    g.append("line")
      .attr("x1", xScale(zLower))
      .attr("x2", xScale(zLower))
      .attr("y1", zY + barHeight/2)
      .attr("y2", diffY)
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");
    
    g.append("line")
      .attr("x1", xScale(tLower))
      .attr("x2", xScale(tLower))
      .attr("y1", tY + barHeight/2)
      .attr("y2", diffY)
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");
    
    // Width difference arrow and label
    g.append("line")
      .attr("x1", xScale(zLower))
      .attr("x2", xScale(tLower))
      .attr("y1", diffY)
      .attr("y2", diffY)
      .attr("stroke", colorScheme.chart.warning)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");
    
    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 5)
      .attr("refY", 3)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 5 3 L 0 6")
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.warning)
      .attr("stroke-width", 2);
    
    g.append("text")
      .attr("x", (xScale(zLower) + xScale(tLower)) / 2)
      .attr("y", diffY - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.warning)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`+${widthDiff.toFixed(1)}% wider`);
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text);
    
  }, [sampleSize, xbar, s, sigma, confidenceLevel]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: 300 }} />;
});

// Critical Values Display
const CriticalValuesDisplay = memo(function CriticalValuesDisplay({ 
  sampleSize, confidenceLevel 
}) {
  const df = sampleSize - 1;
  const alpha = 1 - confidenceLevel;
  const tCritical = jStat.studentt.inv(1 - alpha/2, df);
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  const difference = ((tCritical - zCritical) / zCritical * 100);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-neutral-800 p-3 rounded-lg">
        <h5 className="text-xs font-semibold text-purple-400 mb-2">T-critical</h5>
        <p className="font-mono text-lg text-purple-300">±{tCritical.toFixed(3)}</p>
        <p className="text-xs text-neutral-500 mt-1">df = {df}</p>
      </div>
      <div className="bg-neutral-800 p-3 rounded-lg">
        <h5 className="text-xs font-semibold text-cyan-400 mb-2">Z-critical</h5>
        <p className="font-mono text-lg text-cyan-300">±{zCritical.toFixed(3)}</p>
        <p className="text-xs text-neutral-500 mt-1">σ known</p>
      </div>
      <div className="col-span-2 bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
        <p className="text-sm text-center">
          T-critical is <span className="font-mono text-yellow-400">{difference.toFixed(1)}%</span> larger
        </p>
      </div>
    </div>
  );
});

// Main Component
function TConfidenceIntervals() {
  const [currentStage, setCurrentStage] = useState(0);
  const [showCourseExample, setShowCourseExample] = useState(false);
  const [confidenceLevel] = useState(0.95);
  
  // Current configuration based on stage or course example
  const config = showCourseExample ? COURSE_EXAMPLE : {
    n: STAGES[currentStage].n,
    xbar: 100,
    s: 15,
    confidence: confidenceLevel
  };
  
  // Use true σ = 15 for comparison
  const sigma = 15;
  
  return (
    <VisualizationContainer 
      title="T vs Z Confidence Intervals"
      tutorialSteps={tutorial_5_4_1}
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Controls and Info */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className="text-sm text-neutral-300 mb-3">
              When σ is unknown, we use the sample standard deviation s and the t-distribution. 
              This accounts for the extra uncertainty, making intervals wider.
            </p>
            
            <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insight</h4>
              <p className="text-xs text-neutral-300">
                T-intervals are wider because we're estimating σ with s. 
                The smaller the sample, the more uncertain our estimate, 
                and the wider the interval needs to be.
              </p>
            </div>
          </VisualizationSection>
          
          {/* Stage Selection */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Sample Size Stages</h4>
            
            <div className="space-y-2">
              {STAGES.map((stage, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStage(index);
                    setShowCourseExample(false);
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    currentStage === index && !showCourseExample
                      ? "bg-purple-600 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{stage.label}</p>
                      <p className="text-xs opacity-80">n = {stage.n}</p>
                    </div>
                    <p className="text-xs">{stage.description}</p>
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => setShowCourseExample(true)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border-2",
                  showCourseExample
                    ? "bg-yellow-900/30 border-yellow-600 text-yellow-300"
                    : "bg-neutral-800 border-transparent hover:bg-neutral-700 text-neutral-300"
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Course Example</p>
                    <p className="text-xs opacity-80">n = 9</p>
                  </div>
                  <p className="text-xs">Page 34</p>
                </div>
              </button>
            </div>
          </VisualizationSection>
          
          {/* Critical Values */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Critical Values</h4>
            <CriticalValuesDisplay 
              sampleSize={config.n} 
              confidenceLevel={config.confidence}
            />
          </VisualizationSection>
          
          {/* Progress Indicator */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Convergence Progress</h4>
            <ProgressBar 
              current={Math.min(config.n, 30)} 
              total={30} 
              label={`n = ${config.n}`}
              variant="purple"
            />
            <p className="text-xs text-neutral-500 mt-2">
              {config.n < 30 
                ? `${30 - config.n} more samples until practical convergence`
                : "T and Z distributions have practically converged"}
            </p>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="300px">
            <IntervalComparisonViz 
              sampleSize={config.n}
              xbar={config.xbar}
              s={config.s}
              sigma={sigma}
              confidenceLevel={config.confidence}
            />
          </GraphContainer>
          
          {/* Formula Display */}
          <VisualizationSection className="p-4 mt-4">
            <h4 className="text-sm font-semibold text-white mb-3">Confidence Interval Formulas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-600/30">
                <h5 className="text-xs font-semibold text-purple-400 mb-2">T-Interval (σ unknown)</h5>
                <p className="font-mono text-sm text-center">
                  x̄ ± t<sub>α/2,df</sub> × (s/√n)
                </p>
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  Use sample std dev s
                </p>
              </div>
              <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-600/30">
                <h5 className="text-xs font-semibold text-cyan-400 mb-2">Z-Interval (σ known)</h5>
                <p className="font-mono text-sm text-center">
                  x̄ ± z<sub>α/2</sub> × (σ/√n)
                </p>
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  Use population std dev σ
                </p>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Key Takeaways */}
          <VisualizationSection className="p-4 mt-4">
            <h4 className="text-sm font-semibold text-white mb-2">Key Takeaways</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <p>When we don't know σ, we must use s, which introduces additional uncertainty</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <p>The t-distribution has heavier tails to account for this uncertainty</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <p>As n increases, the t-distribution approaches the normal distribution</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <p>For n ≥ 30, the difference is usually negligible in practice</p>
              </div>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default TConfidenceIntervals;