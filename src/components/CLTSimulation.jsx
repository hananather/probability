"use client";
import { useState, useEffect, useRef } from "react";
import React, { memo } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from './ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../lib/design-system';
import { RangeSlider } from "./ui/RangeSlider";

// Use hypothesis color scheme for CLT
const colorScheme = createColorScheme('hypothesis');

function CLTSimulation() {
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(5);
  const [n, setN] = useState(10);
  const [draws, setDraws] = useState(10);
  const [showNorm, setShowNorm] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [counts, setCounts] = useState([]);
  
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Calculate theoretical statistics
  const theoreticalMean = alpha / (alpha + beta);
  const theoreticalVar = (alpha * beta) / ((alpha + beta) * (alpha + beta) * (alpha + beta + 1));
  const theoreticalSEM = Math.sqrt(theoreticalVar / n);
  
  // Calculate sample statistics
  const sampleMean = counts.length > 0 ? d3.mean(counts) : 0;
  const sampleSD = counts.length > 1 ? d3.deviation(counts) : 0;

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 560;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear everything except histogram bars
    svg.selectAll("> *").each(function() {
      const elem = d3.select(this);
      if (!elem.classed("histogram-container")) {
        elem.remove();
      }
    });
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Add dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Layout dimensions
    const y1 = innerHeight * 0.25;  // Height for beta PDF
    const y2 = innerHeight * 0.15;  // Gap between sections
    const histHeight = innerHeight - y1 - y2;
    
    // Scales
    const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const yBeta = d3.scaleLinear().domain([0, 3]).range([0, y1]);
    const yHist = d3.scaleLinear().domain([0, 3]).range([0, histHeight]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${y1 + y2})`)
      .call(d3.axisLeft(d3.scaleLinear()
        .domain([0, 1])
        .range([histHeight, 0]))
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .text("Sample Mean");
    
    // Section labels with better styling
    function drawSectionLabel(y, label, color) {
      const labelGroup = g.append("g");
      
      labelGroup.append("rect")
        .attr("x", -margin.left + 5)
        .attr("y", y - 18)
        .attr("width", 100)
        .attr("height", 24)
        .attr("fill", "#0a0a0a")
        .attr("opacity", 0.9)
        .attr("rx", 4);
      
      labelGroup.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "5,5");
      
      labelGroup.append("text")
        .attr("x", -margin.left + 10)
        .attr("y", y - 2)
        .attr("fill", color || colors.chart.text)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("text-transform", "uppercase")
        .text(label);
    }
    
    drawSectionLabel(y1, "Original Beta", colorScheme.chart.primary);
    drawSectionLabel(y1 + y2, "Sample Means", colorScheme.chart.secondary);
    
    // Beta distribution
    const betaPDF = d3.range(0, 1.01, 0.01).map(t => ({
      x: t,
      y: Math.min(jStat.beta.pdf(t, alpha, beta), 3)
    }));
    
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y1 - yBeta(d.y))
      .curve(d3.curveBasis);
    
    const area = d3.area()
      .x(d => x(d.x))
      .y0(y1)
      .y1(d => y1 - yBeta(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(betaPDF)
      .attr("fill", colorScheme.chart.primaryArea)
      .attr("opacity", 0.3)
      .attr("d", area);
    
    g.append("path")
      .datum(betaPDF)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("d", line);
    
    // Normal overlay
    const normPath = g.append("path")
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("opacity", showNorm ? 1 : 0)
      .attr("stroke-dasharray", "8,4");
    
    // Create histogram generator - matching reference code
    const bins = 20;
    const histogramGen = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(bins))
      .value(d => d);  // Important: specify the value accessor
    
    // Create or select histogram group
    let barsGroup = svg.select(".histogram-container");
    if (barsGroup.empty()) {
      barsGroup = svg.append("g")
        .attr("class", "histogram-container")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }
    barsGroup = barsGroup.append("g").attr("class", "histogram");
    
    // Update functions
    function updateNormalCurve() {
      if (n === 1) {
        normPath.datum(betaPDF)
          .attr("d", d3.line()
            .x(d => x(d.x))
            .y(d => y1 + y2 + histHeight - yHist(d.y))
            .curve(d3.curveBasis)
          );
      } else {
        const mu = theoreticalMean;
        const sigma = theoreticalSEM;
        const normPDF = d3.range(0, 1.01, 0.01).map(t => ({
          x: t,
          y: jStat.normal.pdf(t, mu, sigma)
        }));
        
        // Update yHist scale based on normal peak
        const normPeak = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        yHist.domain([0, Math.max(3, normPeak * 1.2)]);
        
        normPath.datum(normPDF)
          .attr("d", d3.line()
            .x(d => x(d.x))
            .y(d => y1 + y2 + histHeight - yHist(d.y))
            .curve(d3.curveBasis)
          );
      }
    }
    
    function updateHistogram() {
      if (counts.length === 0) return;
      
      // Find the histogram group within the persistent container
      const histogramGroup = svg.select(".histogram-container .histogram");
      if (histogramGroup.empty()) return;
      
      // Create histogram generator matching the reference
      const bins = 20;
      const histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(bins));
      
      // Get histogram of counts
      const data = histogram(counts);
      
      // Update scale - simpler approach for better visibility
      const ymax = d3.max(data, d => d.length);
      yHist.domain([0, ymax || 1]);
      
      // Enter bars
      const bar = histogramGroup.selectAll("g").data(data);
      const barEnter = bar.enter().append("g").attr("class", "bar");
      barEnter.append("rect")
        .attr("y", y1 + y2 + histHeight)
        .attr("height", 0)
        .attr("fill", "#14b8a6")
        .attr("opacity", 0.7);
      barEnter.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .attr("fill", "#fff");
      
      // Update bars
      const allBars = bar.merge(barEnter);
      
      allBars.select("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => {
          const width = x(d.x1) - x(d.x0) - 2;
          return Math.max(0, width);
        })
        .transition().duration(250)
        .attr("y", d => y1 + y2 + histHeight - yHist(d.length))
        .attr("height", d => yHist(d.length));
      
      allBars.select("text")
        .attr("x", d => x(d.x0 + (d.x1 - d.x0) / 2))
        .attr("y", d => {
          const barHeight = yHist(d.length);
          return y1 + y2 + histHeight - barHeight / 2;
        })
        .text(d => d.length > 0 ? Math.round((d.length / counts.length) * 100) + "%" : "");
      
      // Exit bars
      bar.exit().remove();
    }
    
    // Mean line
    if (counts.length > 0) {
      g.append("line")
        .attr("x1", x(sampleMean))
        .attr("x2", x(sampleMean))
        .attr("y1", y1 + y2)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      g.append("text")
        .attr("x", x(sampleMean))
        .attr("y", y1 + y2 - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.tertiary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`x̄ = ${sampleMean.toFixed(3)}`);
    }
    
    updateNormalCurve();
    updateHistogram(); // Update histogram if counts exist
    
  }, [alpha, beta, n, showNorm, theoreticalMean, theoreticalSEM]); // Remove counts dependency to prevent clearing

  // Animation function - adapted from reference CLT code
  function dropSamples() {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const g = svg.select("g");
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 560;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Matching the reference code's layout
    const x_scale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const y1 = innerHeight / 3;
    const y2 = innerHeight / 4;
    const y_scale = d3.scaleLinear().domain([0, 3]).range([0, innerHeight - (2*y1)]);
    const bins = 20;
    
    // Local counts array to avoid React re-renders
    const localCounts = [...counts];
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Dynamic timing based on sample size for better visualization
    const baseTime = n <= 5 ? 500 : (n <= 10 ? 350 : 250);
    const dt = baseTime / Math.pow(1.04, draws);
    let count = 0;
    
    // Histogram drawing function - local to avoid re-render issues
    function drawHistogram() {
      const histogram = d3.histogram()
        .domain(x_scale.domain())
        .thresholds(x_scale.ticks(bins));
      
      const data = histogram(localCounts);
      
      // Simpler scaling for histogram height
      const maxCount = d3.max(data, d => d.length) || 1;
      const histogramBaseY = y1 + y2; // Base of histogram area
      const histogramHeight = innerHeight - histogramBaseY;
      const yHistScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([0, histogramHeight - 10]); // Leave some padding
      
      // Find or create the persistent histogram container
      let histogramContainer = svg.select(".histogram-container");
      if (histogramContainer.empty()) {
        histogramContainer = svg.append("g")
          .attr("class", "histogram-container")
          .attr("transform", `translate(${margin.left},${margin.top})`);
      }
      
      let histogramGroup = histogramContainer.select(".histogram");
      if (histogramGroup.empty()) {
        histogramGroup = histogramContainer.append("g").attr("class", "histogram");
      }
      
      const bars = histogramGroup.selectAll("g.bar").data(data);
      const barEnter = bars.enter().append("g").attr("class", "bar");
      barEnter.append("rect");
      barEnter.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .attr("fill", "#fff");
      
      const allBars = bars.merge(barEnter);
      
      allBars.select("rect")
        .attr("x", d => x_scale(d.x0) + 1)
        .attr("width", d => {
          const width = x_scale(d.x1) - x_scale(d.x0) - 2;
          return Math.max(0, width);
        })
        .attr("fill", "#14b8a6")
        .attr("opacity", 0.7)
        .transition().duration(250)
        .attr("y", d => innerHeight - yHistScale(d.length))
        .attr("height", d => yHistScale(d.length));
      
      allBars.select("text")
        .attr("x", d => x_scale(d.x0 + (d.x1 - d.x0) / 2))
        .attr("y", d => {
          const barHeight = yHistScale(d.length);
          return innerHeight - barHeight / 2;
        })
        .text(d => d.length > 0 ? Math.round((d.length / localCounts.length) * 100) + "%" : "");
      
      bars.exit().remove();
    }
    
    // Creates Circles and transitions - direct from reference
    function tick() {
      // take samples
      const data = [];
      for (let i = 0; i < n; i++) {
        data.push(jStat.beta.sample(alpha, beta));
      }
      const mean = d3.mean(data);
      
      // add balls
      const group = g.append("g").attr("class", "ball-group");
      const balls = group.selectAll(".ball").data(data);
      
      // animate balls - using the exact pattern from reference
      let i = 0, j = 0;
      balls.enter()
        .append("circle")
        .attr("class", "ball")
        .attr("cx", d => x_scale(d))
        .attr("cy", y1)
        .attr("r", 5)
        .style("fill", d => {
          // Use our color scheme
          const idx = data.indexOf(d);
          const colors = ['#f59e42', '#38bdf8', '#f472b6', '#a3e635', '#facc15'];
          return colors[idx % colors.length];
        })
        .transition()
        .duration(Math.max(dt, 100)) // Ensure minimum transition time
        .attr("cy", y1 + y2 - 5)
        .each(function() { ++i; })
        .on("end", function() {
          if (!--i) {
            // Select all balls in this group
            group.selectAll(".ball")
              .transition()
              .duration(Math.max(400, n * 20)) // Scale with sample size
              .attr("cx", x_scale(mean))
              .style("fill", "#FF8B22")
              .transition()
              .duration(Math.max(400, n * 10)) // Scale with sample size
              .attr("cy", innerHeight - 3)
              .attr("r", 3)
              .each(function() { ++j; })
              .on("end", function() {
                if (!--j) {
                  // Update local counts and draw histogram
                  localCounts.push(mean);
                  drawHistogram();
                }
                d3.select(this).remove();
              });
          }
        });
    }
    
    // initiate sampling - from reference
    intervalRef.current = setInterval(function() { 
      tick();
      if (++count === draws) {
        clearInterval(intervalRef.current);
        // Update React state once at the end
        setCounts(localCounts);
        setIsAnimating(false);
      }
    }, dt);
  }

  function handleReset() {
    // reset and clear CLT - from reference
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCounts([]);
    
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("circle").remove();
      svg.selectAll(".bar").remove();
      svg.selectAll(".ball-group").remove();
      svg.selectAll(".histogram-container").remove(); // Remove the persistent container too
    }
    
    setIsAnimating(false);
  }

  return (
    <VisualizationContainer title="Central Limit Theorem Demonstration" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              The Central Limit Theorem states that the distribution of sample means 
              approaches a normal distribution as sample size increases, regardless of 
              the population distribution shape.
            </p>
            <div className="mt-2 p-2 bg-neutral-800 rounded text-xs text-neutral-300">
              <strong>Beta(α, β)</strong> → <strong>Normal(μ, σ/√n)</strong>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <ControlGroup>
              <div className="space-y-3">
                {/* Beta parameters */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Alpha (α)</label>
                    <span className="text-sm font-mono text-green-400">{alpha.toFixed(1)}</span>
                  </div>
                  <RangeSlider
                    value={alpha}
                    onChange={setAlpha}
                    min={0.5}
                    max={10}
                    step={0.5}
                    showValue={false}
                    className="accent-green-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Beta (β)</label>
                    <span className="text-sm font-mono text-red-400">{beta.toFixed(1)}</span>
                  </div>
                  <RangeSlider
                    value={beta}
                    onChange={setBeta}
                    min={0.5}
                    max={10}
                    step={0.5}
                    showValue={false}
                    className="accent-red-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Sample Size (n)</label>
                    <span className="text-sm font-mono text-yellow-400">{n}</span>
                  </div>
                  <RangeSlider
                    value={n}
                    onChange={setN}
                    min={1}
                    max={50}
                    step={1}
                    showValue={false}
                    className="accent-yellow-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-neutral-300">Number of Samples</label>
                    <span className="text-sm font-mono text-purple-400">{draws}</span>
                  </div>
                  <RangeSlider
                    value={draws}
                    onChange={setDraws}
                    min={1}
                    max={100}
                    step={1}
                    showValue={false}
                    className="accent-purple-500"
                  />
                </div>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showNorm} 
                    onChange={e => setShowNorm(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show normal distribution overlay</span>
                </label>
                
                <div className="flex gap-2 pt-2">
                  <button
                    className={cn(
                      "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                      isAnimating 
                        ? "bg-neutral-600 text-neutral-400 cursor-not-allowed" 
                        : "bg-green-600 hover:bg-green-700 text-white"
                    )}
                    onClick={dropSamples}
                    disabled={isAnimating}
                  >
                    {isAnimating ? "Sampling..." : "Drop Samples"}
                  </button>
                  <button
                    className={cn(
                      "px-3 py-2 rounded text-sm font-medium transition-colors",
                      "bg-neutral-700 hover:bg-neutral-600 text-white"
                    )}
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Distribution Statistics</h4>
            
            <div className="space-y-3">
              {/* Theoretical stats */}
              <div className="bg-neutral-800 rounded-lg p-3 border border-green-600/50">
                <h5 className="text-sm font-semibold text-green-400 mb-2">Theoretical (Beta)</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Mean (μ):</span>
                    <span className="font-mono font-bold text-white">{formatNumber(theoreticalMean, 3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Std Error (σ/√n):</span>
                    <span className="font-mono font-bold text-white">{formatNumber(theoreticalSEM, 3)}</span>
                  </div>
                </div>
              </div>

              {/* Sample stats */}
              {counts.length > 0 && (
                <div className="bg-neutral-800 rounded-lg p-3 border border-red-600/50">
                  <h5 className="text-sm font-semibold text-red-400 mb-2">Sample Means (n={n}, {counts.length} means)</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Mean:</span>
                      <span className="font-mono font-bold text-white">{formatNumber(sampleMean, 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Std Dev:</span>
                      <span className="font-mono font-bold text-white">{formatNumber(sampleSD, 3)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CLT indicator */}
              {counts.length >= 30 && (
                <div className="text-xs text-neutral-400 text-center p-2 bg-neutral-800 rounded">
                  {Math.abs(sampleMean - theoreticalMean) < 0.05 && 
                   Math.abs(sampleSD - theoreticalSEM) < 0.05 ? 
                    "✓ Sample distribution converging to normal!" : 
                    "Keep sampling to see convergence..."}
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="600px">
            <svg ref={svgRef} style={{ width: "100%", height: 600 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default memo(CLTSimulation);