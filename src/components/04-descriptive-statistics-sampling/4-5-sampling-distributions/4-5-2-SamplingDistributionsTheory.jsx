"use client";
import { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { RangeSlider } from "../../ui/RangeSlider";

// Use hypothesis color scheme for consistency
const colorScheme = createColorScheme('hypothesis');

function WhatAreSamplingDistributionsTheoryFirst() {
  // Animation states - matching CLTSimulation
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(5);
  const [n, setN] = useState(10);
  const [draws, setDraws] = useState(10);
  const [showNorm, setShowNorm] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [counts, setCounts] = useState([]);
  const [activeSection, setActiveSection] = useState('definition');
  
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Calculate theoretical statistics
  const theoreticalMean = alpha / (alpha + beta);
  const theoreticalVar = (alpha * beta) / ((alpha + beta) * (alpha + beta) * (alpha + beta + 1));
  const theoreticalSEM = Math.sqrt(theoreticalVar / n);
  
  // Calculate sample statistics
  const sampleMean = counts.length > 0 ? d3.mean(counts) : 0;
  const sampleSD = counts.length > 1 ? d3.deviation(counts) : 0;

  // Main visualization effect - copied from CLTSimulation with minor adjustments
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 650;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f3f4f6");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const y1 = innerHeight * 0.25;
    const y2 = innerHeight * 0.15;
    const histHeight = innerHeight - y1 - y2;
    
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
      .text("Sample Mean (x̄)");
    
    // Section labels
    function drawSectionLabel(y, label, color) {
      const labelGroup = g.append("g");
      
      labelGroup.append("rect")
        .attr("x", -margin.left + 5)
        .attr("y", y - 18)
        .attr("width", 100)
        .attr("height", 24)
        .attr("fill", "#f3f4f6")
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
    
    drawSectionLabel(y1, "Population", colorScheme.chart.primary);
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
  }, [alpha, beta, n, showNorm, theoreticalMean, theoreticalSEM]);

  // Histogram update effect
  useEffect(() => {
    if (!svgRef.current || counts.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select("g");
    if (g.empty()) return;
    
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 650;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const y1 = innerHeight * 0.25;
    const y2 = innerHeight * 0.15;
    const histHeight = innerHeight - y1 - y2;
    
    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20));
    
    const data = histogram(counts);
    const ymax = d3.max(data, d => d.length) || 1;
    const yHist = d3.scaleLinear()
      .domain([0, ymax])
      .range([0, histHeight - 10]);
    
    let histogramGroup = g.select(".histogram");
    if (histogramGroup.empty()) {
      histogramGroup = g.append("g").attr("class", "histogram");
    }
    
    const bars = histogramGroup.selectAll("g.bar").data(data);
    const barEnter = bars.enter().append("g").attr("class", "bar");
    barEnter.append("rect")
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", "#14b8a6")
      .attr("opacity", 0.7);
    barEnter.append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("fill", "#fff");
    
    const allBars = bars.merge(barEnter);
    
    allBars.select("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => {
        const width = x(d.x1) - x(d.x0) - 2;
        return Math.max(0, width);
      })
      .transition().duration(250)
      .attr("y", d => innerHeight - yHist(d.length))
      .attr("height", d => yHist(d.length));
    
    allBars.select("text")
      .attr("x", d => x(d.x0 + (d.x1 - d.x0) / 2))
      .attr("y", d => {
        const barHeight = yHist(d.length);
        return innerHeight - barHeight / 2;
      })
      .text(d => d.length > 0 ? Math.round((d.length / counts.length) * 100) + "%" : "");
    
    bars.exit().remove();
  }, [counts]);

  // Animation function - copied from CLTSimulation
  function dropSamples() {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const svg = d3.select(svgRef.current);
    const g = svg.select("g");
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 650;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x_scale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const y1 = innerHeight / 3;
    const y2 = innerHeight / 4;
    const y_scale = d3.scaleLinear().domain([0, 3]).range([0, innerHeight - (2*y1)]);
    const bins = 20;
    
    const localCounts = [...counts];
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const baseTime = n <= 5 ? 500 : (n <= 10 ? 350 : 250);
    const dt = baseTime / Math.pow(1.04, draws);
    let count = 0;
    
    function drawHistogram() {
      const histogram = d3.histogram()
        .domain(x_scale.domain())
        .thresholds(x_scale.ticks(bins));
      
      const data = histogram(localCounts);
      
      const maxCount = d3.max(data, d => d.length) || 1;
      const histogramBaseY = y1 + y2;
      const histogramHeight = innerHeight - histogramBaseY;
      const yHistScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([0, histogramHeight - 10]);
      
      let histogramGroup = g.select(".histogram");
      if (histogramGroup.empty()) {
        histogramGroup = g.append("g").attr("class", "histogram");
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
    
    function tick() {
      const data = [];
      for (let i = 0; i < n; i++) {
        data.push(jStat.beta.sample(alpha, beta));
      }
      const mean = d3.mean(data);
      
      const group = g.append("g").attr("class", "ball-group");
      const balls = group.selectAll(".ball").data(data);
      
      let i = 0, j = 0;
      balls.enter()
        .append("circle")
        .attr("class", "ball")
        .attr("cx", d => x_scale(d))
        .attr("cy", y1)
        .attr("r", 5)
        .style("fill", d => {
          const idx = data.indexOf(d);
          const colors = ['#f59e42', '#38bdf8', '#f472b6', '#a3e635', '#facc15'];
          return colors[idx % colors.length];
        })
        .transition()
        .duration(Math.max(dt, 100))
        .attr("cy", y1 + y2 - 5)
        .each(function() { ++i; })
        .on("end", function() {
          if (!--i) {
            group.selectAll(".ball")
              .transition()
              .duration(Math.max(400, n * 20))
              .attr("cx", x_scale(mean))
              .style("fill", "#FF8B22")
              .transition()
              .duration(Math.max(400, n * 10))
              .attr("cy", innerHeight - 3)
              .attr("r", 3)
              .each(function() { ++j; })
              .on("end", function() {
                if (!--j) {
                  localCounts.push(mean);
                  drawHistogram();
                }
                d3.select(this).remove();
              });
          }
        });
    }
    
    intervalRef.current = setInterval(function() { 
      tick();
      if (++count === draws) {
        clearInterval(intervalRef.current);
        setCounts(localCounts);
        setIsAnimating(false);
      }
    }, dt);
  }

  function handleReset() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCounts([]);
    
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("circle").remove();
      svg.selectAll(".bar").remove();
      svg.selectAll(".ball-group").remove();
      svg.selectAll(".histogram").remove();
    }
    
    setIsAnimating(false);
  }

  return (
    <VisualizationContainer title="What is a Sampling Distribution?" className="p-4">
      {/* Theory Section */}
      <VisualizationSection className="mb-6 p-6 bg-neutral-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Core Definition */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Definition & Foundation</h3>
              <div className="space-y-3 text-sm text-neutral-300">
                <p className="leading-relaxed">
                  A <span className="text-yellow-400 font-semibold">sampling distribution</span> is the probability distribution of a statistic 
                  (such as the sample mean) obtained from a large number of samples drawn from a specific population.
                </p>
                <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                  <p className="font-semibold text-white mb-2">The Key Insight:</p>
                  <p>When we repeatedly sample from a population and calculate the mean of each sample, 
                  these sample means form their own distribution — the <span className="italic">sampling distribution of the mean</span>.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Why Do We Need Sampling Distributions?</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">1.</span>
                  <span><strong>Inference:</strong> They allow us to make probabilistic statements about population parameters based on sample statistics.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">2.</span>
                  <span><strong>Uncertainty Quantification:</strong> They help us understand the variability in our estimates.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">3.</span>
                  <span><strong>Hypothesis Testing:</strong> They form the foundation for statistical tests and confidence intervals.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mathematical Properties */}
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h4 className="font-semibold text-white mb-3">Mathematical Properties</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-neutral-400 mb-1">Mean of Sampling Distribution:</p>
                <div className="bg-neutral-900 p-2 rounded text-center">
                  <span className="font-mono text-white">μ<sub>x̄</sub> = μ</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Same as population mean</p>
              </div>
              
              <div>
                <p className="text-neutral-400 mb-1">Standard Error (SE):</p>
                <div className="bg-neutral-900 p-2 rounded text-center">
                  <span className="font-mono text-white">σ<sub>x̄</sub> = σ/√n</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Decreases with sample size</p>
              </div>
              
              <div>
                <p className="text-neutral-400 mb-1">Shape:</p>
                <div className="bg-neutral-900 p-2 rounded text-xs">
                  <p className="text-white">• Normal if population is normal</p>
                  <p className="text-white">• Approximately normal for large n (CLT)</p>
                  <p className="text-white">• Approaches normality as n → ∞</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="mt-6 bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          <h4 className="font-semibold text-white mb-3">The Sampling Process</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mb-2">
                <span className="text-2xl"></span>
              </div>
              <p className="font-semibold text-blue-400">Population</p>
              <p className="text-xs text-neutral-400">Parameters: μ, σ</p>
            </div>
            <div className="text-center">
              <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 mb-2">
                <span className="text-2xl">🎲</span>
              </div>
              <p className="font-semibold text-green-400">Draw Sample</p>
              <p className="text-xs text-neutral-400">Size n</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-2">
                <span className="text-2xl">🧮</span>
              </div>
              <p className="font-semibold text-yellow-400">Calculate x̄</p>
              <p className="text-xs text-neutral-400">Sample mean</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-3 mb-2">
                <span className="text-2xl"></span>
              </div>
              <p className="font-semibold text-purple-400">Repeat</p>
              <p className="text-xs text-neutral-400">Many times</p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 text-center mt-3">
            The distribution of all these sample means is the sampling distribution
          </p>
        </div>
      </VisualizationSection>

      {/* Interactive Visualization */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Interactive Demonstration</h4>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Explore how sample means form a distribution. Watch as individual samples 
              are drawn from the population (Beta distribution) and their means accumulate 
              to form the sampling distribution.
            </p>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <ControlGroup>
              <div className="space-y-3">
                {/* Population parameters */}
                <div className="pb-2 border-b border-neutral-700">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">Population Parameters</p>
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
                  
                  <div className="mt-2">
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
                </div>
                
                {/* Sampling parameters */}
                <div className="pb-2">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">Sampling Parameters</p>
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
                  
                  <div className="mt-2">
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
                </div>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showNorm} 
                    onChange={e => setShowNorm(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show theoretical normal curve</span>
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
                    {isAnimating ? "Sampling..." : "Start Sampling"}
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

          {/* Real-time Statistics */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Real-time Statistics</h4>
            
            <div className="space-y-3">
              {/* Population stats */}
              <div className="bg-neutral-800 rounded-lg p-3 border border-blue-600/50">
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Population (Beta)</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Mean (μ):</span>
                    <span className="font-mono font-bold text-white">{formatNumber(theoreticalMean, 3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Standard Error (σ/√n):</span>
                    <span className="font-mono font-bold text-white">{formatNumber(theoreticalSEM, 3)}</span>
                  </div>
                </div>
              </div>

              {/* Sampling distribution stats */}
              {counts.length > 0 && (
                <div className="bg-neutral-800 rounded-lg p-3 border border-green-600/50">
                  <h5 className="text-sm font-semibold text-green-400 mb-2">Sampling Distribution</h5>
                  <div className="space-y-2 text-sm">
                    <div className="text-xs text-neutral-400 mb-2">
                      Based on {counts.length} sample{counts.length !== 1 ? 's' : ''}, 
                      each with n={n} observations
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Mean of x̄'s:</span>
                      <span className="font-mono font-bold text-white">{formatNumber(sampleMean, 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">SD of x̄'s:</span>
                      <span className="font-mono font-bold text-white">{formatNumber(sampleSD, 3)}</span>
                    </div>
                    {counts.length >= 30 && (
                      <div className="mt-2 pt-2 border-t border-neutral-700">
                        <p className="text-xs text-green-400">
                          With {counts.length} sample means collected, the histogram pattern is clearer.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              <div className="bg-neutral-800 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Observations</h4>
                <div className="space-y-2 text-xs text-neutral-300">
                  {counts.length === 0 && (
                    <p>Click "Start Sampling" to see how sample means create their own distribution.</p>
                  )}
                  {counts.length > 0 && counts.length < 10 && (
                    <p>Notice how each sample mean falls somewhere near the population mean μ = {formatNumber(theoreticalMean, 3)}.</p>
                  )}
                  {counts.length >= 10 && counts.length < 30 && (
                    <p>The sampling distribution is taking shape. It's centered at the population mean with less spread than the original distribution.</p>
                  )}
                  {counts.length >= 30 && (
                    <div>
                      <p className="mb-1">With sufficient samples, observe that:</p>
                      <ul className="ml-3 space-y-1">
                        <li>• The mean of sample means ≈ population mean</li>
                        <li>• The standard error follows σ/√n</li>
                        <li>• The shape becomes approximately normal</li>
                      </ul>
                    </div>
                  )}
                  {n === 1 && (
                    <p className="text-yellow-400 mt-2">
                      Special case: When n=1, the sampling distribution equals the population distribution.
                    </p>
                  )}
                  {n >= 30 && (
                    <p className="text-blue-400 mt-2">
                      With n≥30, the CLT ensures normality even for skewed populations!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="700px">
            <svg ref={svgRef} style={{ width: "100%", height: 700 }} />
          </GraphContainer>
        </div>
      </div>

      {/* Educational Summary */}
      <VisualizationSection className="mt-6 p-6 bg-neutral-900">
        <h3 className="text-lg font-bold text-white mb-4">Understanding the Connection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">What You're Seeing</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Top curve:</strong> The original population distribution (Beta)</li>
              <li>• <strong>Animation:</strong> Individual samples being drawn and averaged</li>
              <li>• <strong>Bottom histogram:</strong> The emerging sampling distribution</li>
              <li>• <strong>Dashed curve:</strong> Theoretical normal distribution (CLT prediction)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Real-World Applications</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Quality Control:</strong> Monitoring manufacturing processes</li>
              <li>• <strong>Opinion Polls:</strong> Estimating population preferences from samples</li>
              <li>• <strong>Medical Studies:</strong> Inferring treatment effects from clinical trials</li>
              <li>• <strong>A/B Testing:</strong> Comparing conversion rates between variants</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-neutral-800 rounded-lg border border-yellow-600/50">
          <p className="text-sm text-white">
            <span className="font-semibold text-yellow-400">Remember:</span> The sampling distribution is not about individual data points, 
            but about the behavior of statistics (like the mean) across many samples. This concept forms the foundation 
            for confidence intervals, hypothesis testing, and all of inferential statistics.
          </p>
        </div>
      </VisualizationSection>
    </VisualizationContainer>
  );
}

export default memo(WhatAreSamplingDistributionsTheoryFirst);
