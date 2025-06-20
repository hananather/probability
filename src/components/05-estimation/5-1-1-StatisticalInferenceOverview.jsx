"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Concept Card Component
const ConceptCard = memo(function ConceptCard({ title, description, icon, color }) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-300 hover:scale-105",
      `bg-${color}-900/20 border-${color}-600/30`
    )}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h5 className={`text-sm font-semibold text-${color}-400 mb-1`}>{title}</h5>
          <p className="text-xs text-neutral-300">{description}</p>
        </div>
      </div>
    </div>
  );
});

function StatisticalInferenceOverview() {
  // State management
  const [populationSize] = useState(10000);
  const [sampleSize, setSampleSize] = useState(30);
  const [populationMean] = useState(100);
  const [populationStd] = useState(15);
  const [currentSample, setCurrentSample] = useState([]);
  const [sampleStatistics, setSampleStatistics] = useState(null);
  const [samplingHistory, setSamplingHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPopulation, setShowPopulation] = useState(true);
  const [showSample, setShowSample] = useState(true);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Generate a new sample
  const generateSample = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Generate sample
    const sample = Array.from({ length: sampleSize }, () => 
      jStat.normal.sample(populationMean, populationStd)
    );
    
    // Calculate statistics
    const stats = {
      mean: jStat.mean(sample),
      std: jStat.stdev(sample, true),
      median: jStat.median(sample),
      min: Math.min(...sample),
      max: Math.max(...sample)
    };
    
    setCurrentSample(sample);
    setSampleStatistics(stats);
    setSamplingHistory(prev => [...prev.slice(-19), stats]);
    
    setTimeout(() => setIsAnimating(false), 1000);
  }, [sampleSize, populationMean, populationStd, isAnimating]);
  
  // Reset
  const reset = () => {
    setCurrentSample([]);
    setSampleStatistics(null);
    setSamplingHistory([]);
  };
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
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
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("From Population to Sample: Statistical Inference");
    
    // Layout: Split visualization into two parts
    const populationHeight = innerHeight * 0.4;
    const sampleHeight = innerHeight * 0.4;
    const gap = innerHeight * 0.2;
    
    // Population visualization
    if (showPopulation) {
      const popGroup = g.append("g")
        .attr("transform", `translate(0, 0)`);
      
      // Population label
      popGroup.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text("Population");
      
      // Population distribution
      const xScale = d3.scaleLinear()
        .domain([populationMean - 4 * populationStd, populationMean + 4 * populationStd])
        .range([0, innerWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 0.03])
        .range([populationHeight, 0]);
      
      // Generate normal curve
      const xValues = d3.range(xScale.domain()[0], xScale.domain()[1], 1);
      const normalData = xValues.map(x => ({
        x: x,
        y: jStat.normal.pdf(x, populationMean, populationStd)
      }));
      
      // Area under curve
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(populationHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      popGroup.append("path")
        .datum(normalData)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0.2)
        .attr("d", area);
      
      // Curve line
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      popGroup.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("d", line);
      
      // Population mean line
      popGroup.append("line")
        .attr("x1", xScale(populationMean))
        .attr("x2", xScale(populationMean))
        .attr("y1", 0)
        .attr("y2", populationHeight)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      popGroup.append("text")
        .attr("x", xScale(populationMean))
        .attr("y", populationHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.tertiary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text(`μ = ${populationMean}`);
      
      // Population info box
      const infoBox = popGroup.append("g")
        .attr("transform", `translate(${innerWidth - 150}, 10)`);
      
      infoBox.append("rect")
        .attr("width", 140)
        .attr("height", 60)
        .attr("fill", "#0a0a0a")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 1)
        .attr("rx", 4);
      
      infoBox.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(`N = ${populationSize.toLocaleString()}`);
      
      infoBox.append("text")
        .attr("x", 10)
        .attr("y", 35)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(`μ = ${populationMean}`);
      
      infoBox.append("text")
        .attr("x", 10)
        .attr("y", 50)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(`σ = ${populationStd}`);
    }
    
    // Sampling arrow
    if (isAnimating) {
      const arrowY = populationHeight + gap / 2;
      const arrow = g.append("g")
        .attr("transform", `translate(${innerWidth / 2}, ${arrowY})`);
      
      arrow.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -gap / 3)
        .attr("y2", gap / 3)
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");
      
      // Arrow marker
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 0)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 6 3, 0 6")
        .attr("fill", colorScheme.chart.accent);
      
      arrow.append("text")
        .attr("x", 30)
        .attr("y", 5)
        .attr("fill", colorScheme.chart.accent)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Sampling");
    }
    
    // Sample visualization
    if (showSample && currentSample.length > 0) {
      const sampleGroup = g.append("g")
        .attr("transform", `translate(0, ${populationHeight + gap})`);
      
      // Sample label
      sampleGroup.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text("Sample");
      
      // Create histogram for sample
      const xScale = d3.scaleLinear()
        .domain([populationMean - 4 * populationStd, populationMean + 4 * populationStd])
        .range([0, innerWidth]);
      
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(20));
      
      const bins = histogram(currentSample);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([sampleHeight, 0]);
      
      // Draw bars
      sampleGroup.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => sampleHeight - yScale(d.length))
        .attr("fill", colorScheme.chart.primary)
        .attr("opacity", 0.7);
      
      // Sample mean line
      if (sampleStatistics) {
        sampleGroup.append("line")
          .attr("x1", xScale(sampleStatistics.mean))
          .attr("x2", xScale(sampleStatistics.mean))
          .attr("y1", 0)
          .attr("y2", sampleHeight)
          .attr("stroke", colorScheme.chart.accent)
          .attr("stroke-width", 2);
        
        sampleGroup.append("text")
          .attr("x", xScale(sampleStatistics.mean))
          .attr("y", sampleHeight + 20)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.accent)
          .style("font-size", "14px")
          .style("font-weight", "600")
          .text(`x̄ = ${sampleStatistics.mean.toFixed(2)}`);
      }
      
      // Sample info box
      if (sampleStatistics) {
        const infoBox = sampleGroup.append("g")
          .attr("transform", `translate(${innerWidth - 150}, 10)`);
        
        infoBox.append("rect")
          .attr("width", 140)
          .attr("height", 75)
          .attr("fill", "#0a0a0a")
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 1)
          .attr("rx", 4);
        
        infoBox.append("text")
          .attr("x", 10)
          .attr("y", 20)
          .attr("fill", colors.chart.text)
          .style("font-size", "12px")
          .text(`n = ${sampleSize}`);
        
        infoBox.append("text")
          .attr("x", 10)
          .attr("y", 35)
          .attr("fill", colors.chart.text)
          .style("font-size", "12px")
          .text(`x̄ = ${sampleStatistics.mean.toFixed(2)}`);
        
        infoBox.append("text")
          .attr("x", 10)
          .attr("y", 50)
          .attr("fill", colors.chart.text)
          .style("font-size", "12px")
          .text(`s = ${sampleStatistics.std.toFixed(2)}`);
        
        infoBox.append("text")
          .attr("x", 10)
          .attr("y", 65)
          .attr("fill", colors.chart.text)
          .style("font-size", "12px")
          .text(`SE = ${(populationStd / Math.sqrt(sampleSize)).toFixed(2)}`);
      }
    }
    
    // X axis (shared)
    const xScale = d3.scaleLinear()
      .domain([populationMean - 4 * populationStd, populationMean + 4 * populationStd])
      .range([0, innerWidth]);
    
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
  }, [currentSample, sampleStatistics, populationSize, populationMean, populationStd, 
      sampleSize, showPopulation, showSample, isAnimating]);
  
  // Initialize with a sample
  useEffect(() => {
    generateSample();
  }, []);
  
  return (
    <VisualizationContainer 
      title="Statistical Inference: Population to Sample"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Statistical inference allows us to draw conclusions about a population based on sample data. 
              This fundamental concept underlies all of estimation and hypothesis testing.
            </p>
            
            <div className="mt-3 space-y-2">
              <ConceptCard
                title="Population"
                description="The entire group we want to study. Usually too large to measure completely."
                icon="🌍"
                color="blue"
              />
              <ConceptCard
                title="Sample"
                description="A subset of the population we actually observe and measure."
                icon="🎯"
                color="purple"
              />
              <ConceptCard
                title="Inference"
                description="Using sample statistics to estimate population parameters."
                icon="💡"
                color="yellow"
              />
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize})
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={sampleSize}
                  onChange={(e) => {
                    setSampleSize(Number(e.target.value));
                    reset();
                  }}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={generateSample}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  {isAnimating ? "Sampling..." : "Take New Sample"}
                </button>
                
                <button
                  onClick={reset}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset
                </button>
              </div>
              
              {/* View options */}
              <div className="space-y-2 pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showPopulation} 
                    onChange={e => setShowPopulation(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show population</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showSample} 
                    onChange={e => setShowSample(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show sample</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Key Concepts */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Key Concepts</h4>
            
            <div className="space-y-3">
              <div className="bg-neutral-800 rounded p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Parameters vs Statistics</h5>
                <div className="space-y-1 text-xs text-neutral-300">
                  <p>• <span className="text-blue-400">Parameters</span>: Fixed values describing the population (μ, σ)</p>
                  <p>• <span className="text-purple-400">Statistics</span>: Values calculated from samples (x̄, s)</p>
                  <p>• Statistics estimate parameters!</p>
                </div>
              </div>
              
              <div className="bg-neutral-800 rounded p-3">
                <h5 className="text-sm font-semibold text-cyan-400 mb-2">Sampling Variability</h5>
                <div className="space-y-1 text-xs text-neutral-300">
                  <p>Different samples → Different statistics</p>
                  <p>But they follow predictable patterns!</p>
                  <p>Standard Error = σ/√n</p>
                </div>
              </div>
            </div>
          </VisualizationSection>

          {/* Sampling History */}
          {samplingHistory.length > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Sampling History</h4>
              <div className="space-y-2">
                <div className="text-xs text-neutral-300">
                  <p>Last {samplingHistory.length} sample means:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {samplingHistory.map((stats, i) => (
                      <span key={i} className="font-mono text-cyan-400 bg-neutral-800 px-1 rounded">
                        {stats.mean.toFixed(1)}
                      </span>
                    ))}
                  </div>
                </div>
                {samplingHistory.length >= 5 && (
                  <div className="text-xs text-green-400 mt-2">
                    Average of sample means: {(jStat.mean(samplingHistory.map(s => s.mean))).toFixed(2)} 
                    {Math.abs(jStat.mean(samplingHistory.map(s => s.mean)) - populationMean) < 1 && " ≈ μ ✓"}
                  </div>
                )}
              </div>
              
              <ProgressBar 
                current={samplingHistory.length} 
                total={20} 
                label="Samples taken"
                variant="purple"
              />
            </VisualizationSection>
          )}
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="500px">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {/* Insights */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Statistical Inference Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-neutral-800/50 p-3 rounded">
                <div className="text-blue-400 font-semibold mb-1">1. Population</div>
                <p className="text-neutral-300">
                  Contains the true parameters (μ, σ) we want to know
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <div className="text-purple-400 font-semibold mb-1">2. Random Sample</div>
                <p className="text-neutral-300">
                  Select n observations randomly from the population
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <div className="text-cyan-400 font-semibold mb-1">3. Calculate Statistics</div>
                <p className="text-neutral-300">
                  Use x̄ to estimate μ, s to estimate σ
                </p>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
              <p className="text-xs text-yellow-400 font-semibold mb-1">Central Limit Theorem</p>
              <p className="text-xs text-neutral-300">
                As n increases, the sampling distribution of x̄ approaches N(μ, σ²/n), 
                regardless of the population distribution!
              </p>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default StatisticalInferenceOverview;