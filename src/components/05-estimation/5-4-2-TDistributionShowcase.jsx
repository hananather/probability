'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { VisualizationContainer, VisualizationSection, ControlPanel, ControlGroup, GraphContainer } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '@/lib/utils';
import { FlaskConical, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import jStat from 'jstat';

// Beautiful gradient theme
const tTheme = {
  colors: {
    normal: '#f97316',       // Orange for normal
    tDist: '#8b5cf6',        // Purple for t-distribution
    difference: '#ec4899',   // Pink for differences
    convergence: '#10b981',  // Green for convergence
    warning: '#eab308',      // Yellow for warnings
    background: '#1f2937',
    grid: '#374151',
    text: '#ffffff'
  },
  gradients: {
    normalToT: 'linear-gradient(90deg, #f97316 0%, #8b5cf6 100%)',
    confidence: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    convergence: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  }
};

// T-distribution critical values for common confidence levels
const tCriticalValues = {
  0.90: { 1: 6.314, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697, 100: 1.660, Infinity: 1.645 },
  0.95: { 1: 12.706, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042, 100: 1.984, Infinity: 1.96 },
  0.99: { 1: 63.657, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750, 100: 2.626, Infinity: 2.576 }
};

// Button styles
const buttonStyles = {
  primary: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300 transform",
    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
  ),
  secondary: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600 text-white"
  ),
  scenario: cn(
    "w-full px-4 py-3 rounded-lg text-left transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600",
    "border-2 border-transparent hover:border-purple-500/50"
  )
};

export default function TDistributionShowcase() {
  // Parameters
  const [df, setDf] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [sampleSize, setSampleSize] = useState(10);
  const [showAnimation, setShowAnimation] = useState(false);
  const [compareMode, setCompareMode] = useState(true);
  
  // Sample data for CI comparison
  const [sampleMean] = useState(100);
  const [sampleSD] = useState(15);
  const [populationSD] = useState(15); // Known sigma for z-interval
  
  // Animation state
  const [animationDf, setAnimationDf] = useState(1);
  const animationRef = useRef(null);
  
  // D3 refs
  const distributionRef = useRef(null);
  const ciComparisonRef = useRef(null);
  const tailsRef = useRef(null);
  const scalesRef = useRef({});
  
  // Calculate critical values and intervals
  const calculations = useMemo(() => {
    const alpha = 1 - confidenceLevel;
    const zCritical = jStat.normal.inv(1 - alpha / 2, 0, 1);
    const tCritical = jStat.studentt.inv(1 - alpha / 2, df);
    
    // Calculate intervals
    const zMargin = zCritical * populationSD / Math.sqrt(sampleSize);
    const tMargin = tCritical * sampleSD / Math.sqrt(sampleSize);
    
    const zInterval = {
      lower: sampleMean - zMargin,
      upper: sampleMean + zMargin,
      width: 2 * zMargin,
      critical: zCritical
    };
    
    const tInterval = {
      lower: sampleMean - tMargin,
      upper: sampleMean + tMargin,
      width: 2 * tMargin,
      critical: tCritical
    };
    
    // Width ratio
    const widthRatio = tInterval.width / zInterval.width;
    
    return {
      zInterval,
      tInterval,
      widthRatio,
      percentWider: ((widthRatio - 1) * 100).toFixed(1)
    };
  }, [df, confidenceLevel, sampleSize, sampleMean, sampleSD, populationSD]);
  
  // Initialize distribution comparison
  useEffect(() => {
    if (!distributionRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(distributionRef.current);
      svg.selectAll("*").remove();
      
      const container = distributionRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 350;
      const margin = { top: 20, right: 50, bottom: 50, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Set SVG dimensions explicitly
      svg.attr("width", width)
         .attr("height", height)
         .attr("viewBox", `0 0 ${width} ${height}`)
         .attr("preserveAspectRatio", "xMidYMid meet")
         .style("display", "block");
      
      // Create gradients
    const defs = svg.append("defs");
    
    const normalGradient = defs.append("linearGradient")
      .attr("id", "normal-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    normalGradient.append("stop").attr("offset", "0%").attr("stop-color", tTheme.colors.normal).attr("stop-opacity", 0.3);
    normalGradient.append("stop").attr("offset", "100%").attr("stop-color", tTheme.colors.normal).attr("stop-opacity", 0.1);
    
    const tGradient = defs.append("linearGradient")
      .attr("id", "t-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    tGradient.append("stop").attr("offset", "0%").attr("stop-color", tTheme.colors.tDist).attr("stop-opacity", 0.3);
    tGradient.append("stop").attr("offset", "100%").attr("stop-color", tTheme.colors.tDist).attr("stop-opacity", 0.1);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickValues([-4, -3, -2, -1, 0, 1, 2, 3, 4]));
    
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5));
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", tTheme.colors.text)
      .style("font-size", "14px")
      .text("Standardized Value");
    
    // Distribution paths
    g.append("path").attr("class", "normal-curve");
    g.append("path").attr("class", "normal-area");
    g.append("path").attr("class", "t-curve");
    g.append("path").attr("class", "t-area");
    
    // Legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth - 120}, 20)`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", tTheme.colors.normal)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 4)
      .attr("fill", tTheme.colors.text)
      .style("font-size", "12px")
      .text("Normal(0,1)");
    
    // T legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 20).attr("y2", 20)
      .attr("stroke", tTheme.colors.tDist)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 24)
      .attr("fill", tTheme.colors.text)
      .style("font-size", "12px")
      .attr("class", "t-legend-text");
    
    // Store scales
    scalesRef.current.distribution = { x, y, g, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update distribution comparison
  useEffect(() => {
    if (!scalesRef.current.distribution) return;
    
    // Small delay to ensure initialization completes first
    const timer = setTimeout(() => {
      const { x, y, g, innerHeight } = scalesRef.current.distribution;
      const currentDf = showAnimation ? animationDf : df;
    
    // Generate data
    const xValues = d3.range(-5, 5.01, 0.01);
    
    const normalData = xValues.map(val => ({
      x: val,
      y: jStat.normal.pdf(val, 0, 1)
    }));
    
    const tData = xValues.map(val => ({
      x: val,
      y: jStat.studentt.pdf(val, currentDf)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Area generator
    const area = d3.area()
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Update normal curve
    g.select(".normal-curve")
      .datum(normalData)
      .transition()
      .duration(300)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", tTheme.colors.normal)
      .attr("stroke-width", 2)
      .style("opacity", compareMode ? 0.8 : 0.3);
    
    // Update t curve
    g.select(".t-curve")
      .datum(tData)
      .transition()
      .duration(300)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", tTheme.colors.tDist)
      .attr("stroke-width", 2.5);
    
    // Update critical value areas
    const criticalValue = calculations.tInterval.critical;
    const criticalData = tData.filter(d => Math.abs(d.x) > criticalValue);
    
    g.select(".t-area")
      .datum(criticalData)
      .transition()
      .duration(300)
      .attr("d", area)
      .attr("fill", "url(#t-gradient)")
      .style("opacity", 0.5);
    
    // Update legend
    g.select(".t-legend-text")
      .text(`t(${currentDf})`);
    
    // Add annotations for key differences
    if (currentDf <= 5 && compareMode) {
      g.selectAll(".annotation").remove();
      
      const annotation = g.append("g")
        .attr("class", "annotation")
        .attr("transform", `translate(${x(0)}, ${y(0.3)})`);
      
      annotation.append("path")
        .attr("d", "M0,0 L30,30")
        .attr("stroke", tTheme.colors.difference)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
      
      annotation.append("text")
        .attr("x", 35)
        .attr("y", 35)
        .attr("fill", tTheme.colors.difference)
        .style("font-size", "12px")
        .text("Heavier tails");
      
      // Arrow marker
      const defs = g.select("defs").empty() ? g.append("defs") : g.select("defs");
      const marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 8)
        .attr("refY", 4)
        .attr("orient", "auto");
      
      marker.append("path")
        .attr("d", "M0,0 L8,4 L0,8")
        .attr("fill", tTheme.colors.difference);
    }
    
    }, 150); // Small delay for initial render
    
    return () => clearTimeout(timer);
  }, [df, animationDf, showAnimation, compareMode, calculations]);
  
  // Initialize CI comparison
  useEffect(() => {
    if (!ciComparisonRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(ciComparisonRef.current);
      svg.selectAll("*").remove();
      
      const container = ciComparisonRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 200;
      const margin = { top: 40, right: 30, bottom: 50, left: 30 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Set SVG dimensions explicitly
      svg.attr("width", width)
         .attr("height", height)
         .attr("viewBox", `0 0 ${width} ${height}`)
         .attr("preserveAspectRatio", "xMidYMid meet")
         .style("display", "block");
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Background
      g.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", tTheme.colors.background)
        .attr("rx", 8);
    
    // Scale
    const x = d3.scaleLinear()
      .range([20, innerWidth - 20]);
    
    // Groups for intervals
    g.append("g").attr("class", "z-interval");
    g.append("g").attr("class", "t-interval");
    g.append("g").attr("class", "comparison-labels");
    
    scalesRef.current.ciComparison = { g, x, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update CI comparison
  useEffect(() => {
    if (!scalesRef.current.ciComparison) return;
    
    // Small delay to ensure initialization completes first
    const timer = setTimeout(() => {
      const { g, x, innerHeight } = scalesRef.current.ciComparison;
      const { zInterval, tInterval } = calculations;
    
    // Update scale
    const padding = Math.max(zInterval.width, tInterval.width) * 0.3;
    x.domain([
      Math.min(zInterval.lower, tInterval.lower) - padding,
      Math.max(zInterval.upper, tInterval.upper) + padding
    ]);
    
    // Z-interval (σ known)
    const zGroup = g.select(".z-interval");
    zGroup.selectAll("*").remove();
    
    const zY = innerHeight * 0.3;
    
    zGroup.append("line")
      .attr("x1", x(zInterval.lower))
      .attr("x2", x(zInterval.upper))
      .attr("y1", zY)
      .attr("y2", zY)
      .attr("stroke", tTheme.colors.normal)
      .attr("stroke-width", 4)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    
    // Z bounds
    [zInterval.lower, zInterval.upper].forEach(bound => {
      zGroup.append("line")
        .attr("x1", x(bound))
        .attr("x2", x(bound))
        .attr("y1", zY - 15)
        .attr("y2", zY + 15)
        .attr("stroke", tTheme.colors.normal)
        .attr("stroke-width", 3);
    });
    
    // Z label
    zGroup.append("text")
      .attr("x", x(sampleMean))
      .attr("y", zY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", tTheme.colors.normal)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Z-interval (σ known)");
    
    // T-interval (σ unknown)
    const tGroup = g.select(".t-interval");
    tGroup.selectAll("*").remove();
    
    const tY = innerHeight * 0.7;
    
    tGroup.append("line")
      .attr("x1", x(tInterval.lower))
      .attr("x2", x(tInterval.upper))
      .attr("y1", tY)
      .attr("y2", tY)
      .attr("stroke", tTheme.colors.tDist)
      .attr("stroke-width", 4)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    
    // T bounds
    [tInterval.lower, tInterval.upper].forEach(bound => {
      tGroup.append("line")
        .attr("x1", x(bound))
        .attr("x2", x(bound))
        .attr("y1", tY - 15)
        .attr("y2", tY + 15)
        .attr("stroke", tTheme.colors.tDist)
        .attr("stroke-width", 3);
    });
    
    // T label
    tGroup.append("text")
      .attr("x", x(sampleMean))
      .attr("y", tY + 35)
      .attr("text-anchor", "middle")
      .attr("fill", tTheme.colors.tDist)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("t-interval (σ unknown)");
    
    // Sample mean
    const meanLine = g.append("line")
      .attr("x1", x(sampleMean))
      .attr("x2", x(sampleMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", tTheme.colors.text)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    // Width comparison
    const comparisonLabels = g.select(".comparison-labels");
    comparisonLabels.selectAll("*").remove();
    
    if (calculations.percentWider !== "0.0") {
      const widthLabel = comparisonLabels.append("g")
        .attr("transform", `translate(${x(tInterval.upper) + 10}, ${tY})`);
      
      widthLabel.append("path")
        .attr("d", `M0,0 L20,0`)
        .attr("stroke", tTheme.colors.difference)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#width-arrow)");
      
      widthLabel.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .attr("fill", tTheme.colors.difference)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(`${calculations.percentWider}% wider`);
    }
    
    }, 150); // Small delay for initial render
    
    return () => clearTimeout(timer);
  }, [calculations, sampleMean]);
  
  // Animation loop
  useEffect(() => {
    if (showAnimation) {
      let currentDf = 1;
      const animate = () => {
        setAnimationDf(currentDf);
        currentDf += 0.5;
        
        if (currentDf <= 100) {
          animationRef.current = setTimeout(animate, 50);
        } else {
          // Show infinity symbol at the end
          setTimeout(() => {
            setAnimationDf(Infinity);
            setTimeout(() => {
              setShowAnimation(false);
              setAnimationDf(df);
            }, 1000);
          }, 500);
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [showAnimation, df]);
  
  // Apply scenario
  const applyScenario = useCallback((scenario) => {
    switch (scenario) {
      case 'small':
        setSampleSize(5);
        setDf(4);
        setConfidenceLevel(0.95);
        break;
      case 'medium':
        setSampleSize(15);
        setDf(14);
        setConfidenceLevel(0.95);
        break;
      case 'large':
        setSampleSize(50);
        setDf(49);
        setConfidenceLevel(0.95);
        break;
    }
  }, []);
  
  return (
    <VisualizationContainer
      title="t-Distribution Showcase"
      description="Explore when and why to use t-distributions for confidence intervals"
      className="bg-neutral-900"
    >
      <div className="space-y-6">
        {/* Main distribution comparison */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisualizationSection 
              title="t-Distribution vs Normal Distribution"
              className="bg-neutral-800"
            >
              <GraphContainer height="350px">
                <svg ref={distributionRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </GraphContainer>
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setShowAnimation(true)}
                  disabled={showAnimation}
                  className={buttonStyles.primary}
                >
                  <TrendingUp className="w-4 h-4 mr-2 inline" />
                  {showAnimation ? "Animating..." : "Animate df → ∞"}
                </button>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={compareMode}
                    onChange={(e) => setCompareMode(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-neutral-300">Show normal for comparison</span>
                </label>
              </div>
              
              {/* Key insight */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
                <h4 className="text-sm font-medium text-purple-400 mb-2">Key Insight</h4>
                <p className="text-sm text-neutral-300">
                  As degrees of freedom increase, the t-distribution approaches the normal distribution. 
                  By df ≈ 30, they're nearly identical. This is why we use z for large samples!
                </p>
              </div>
            </VisualizationSection>
          </div>
          
          <div>
            <ControlPanel className="bg-neutral-800 h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
              
              <ControlGroup label="Degrees of Freedom">
                <RangeSlider
                  value={df}
                  onChange={setDf}
                  min={1}
                  max={100}
                  step={1}
                  gradient="from-purple-500 to-pink-500"
                  disabled={showAnimation}
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>df = {df}</span>
                  <span>n = {df + 1}</span>
                </div>
              </ControlGroup>
              
              <ControlGroup label="Sample Size (for CI)">
                <RangeSlider
                  value={sampleSize}
                  onChange={(val) => {
                    setSampleSize(val);
                    setDf(val - 1);
                  }}
                  min={2}
                  max={100}
                  step={1}
                  gradient="from-orange-500 to-purple-500"
                />
              </ControlGroup>
              
              <ControlGroup label="Confidence Level">
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                  className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </ControlGroup>
              
              {/* Critical values display */}
              <div className="mt-6 p-4 bg-neutral-900 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">Critical Values</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">z-critical:</span>
                    <span className="font-mono text-orange-400">
                      {calculations.zInterval.critical.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">t-critical:</span>
                    <span className="font-mono text-purple-400">
                      {calculations.tInterval.critical.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-700">
                    <span className="text-neutral-400">Difference:</span>
                    <span className="font-mono text-pink-400">
                      +{(calculations.tInterval.critical - calculations.zInterval.critical).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </ControlPanel>
          </div>
        </div>
        
        {/* CI Width Comparison */}
        <VisualizationSection 
          title="Confidence Interval Width Comparison"
          className="bg-neutral-800"
        >
          <div className="mb-4 p-3 bg-neutral-900 rounded-lg">
            <p className="text-sm text-neutral-300">
              Sample: n = {sampleSize}, x̄ = {sampleMean}, s = {sampleSD} 
              {populationSD && `, σ = ${populationSD} (known)`}
            </p>
          </div>
          
          <GraphContainer height="200px">
            <svg ref={ciComparisonRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </GraphContainer>
          
          {/* Formulas */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-900/20 to-neutral-900/20 rounded-lg border border-orange-500/30">
              <h4 className="text-sm font-medium text-orange-400 mb-2">When σ is known</h4>
              <div className="text-center">
                {`\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-900/20 to-neutral-900/20 rounded-lg border border-purple-500/30">
              <h4 className="text-sm font-medium text-purple-400 mb-2">When σ is unknown</h4>
              <div className="text-center">
                {`\\[CI = \\bar{x} \\pm t_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}\\]`}
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Scenarios and insights */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sample size scenarios */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                Sample Size Scenarios
              </h3>
              
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  onClick={() => applyScenario('small')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Small Sample</div>
                  <div className="text-sm text-neutral-400">n = 5 (df = 4)</div>
                  <div className="text-xs text-purple-400 mt-1">
                    t-critical ≈ {tCriticalValues[confidenceLevel]?.[5]?.toFixed(2) || "2.78"}
                  </div>
                </button>
                
                <button
                  onClick={() => applyScenario('medium')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Medium Sample</div>
                  <div className="text-sm text-neutral-400">n = 15 (df = 14)</div>
                  <div className="text-xs text-purple-400 mt-1">
                    t-critical ≈ {((tCriticalValues[confidenceLevel]?.[10] + tCriticalValues[confidenceLevel]?.[20]) / 2)?.toFixed(2) || "2.14"}
                  </div>
                </button>
                
                <button
                  onClick={() => applyScenario('large')}
                  className={buttonStyles.scenario}
                >
                  <div className="font-medium text-white">Large Sample</div>
                  <div className="text-sm text-neutral-400">n = 50 (df = 49)</div>
                  <div className="text-xs text-purple-400 mt-1">
                    t-critical ≈ {((tCriticalValues[confidenceLevel]?.[30] + tCriticalValues[confidenceLevel]?.[100]) / 2)?.toFixed(2) || "2.01"}
                  </div>
                </button>
              </div>
              
              {/* When to use each */}
              <div className="mt-6 space-y-3">
                <h4 className="text-md font-medium text-white">When to Use Each Distribution</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-900/20 to-neutral-900/20 rounded-lg border border-orange-500/30">
                    <h5 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Use Z (Normal)
                    </h5>
                    <ul className="space-y-1 text-sm text-neutral-300">
                      <li>• σ is known</li>
                      <li>• Large sample (n ≥ 30)</li>
                      <li>• Population is normal</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-900/20 to-neutral-900/20 rounded-lg border border-purple-500/30">
                    <h5 className="font-medium text-purple-400 mb-2 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Use t-Distribution
                    </h5>
                    <ul className="space-y-1 text-sm text-neutral-300">
                      <li>• σ is unknown (use s)</li>
                      <li>• Small sample (n &lt; 30)</li>
                      <li>• Population approximately normal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key insights */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Insights
              </h3>
              
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <p>t-intervals are always wider than z-intervals</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                  <p>The difference is most dramatic for small samples</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <p>By n ≈ 30, t and z are nearly identical</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Notes
              </h3>
              
              <div className="space-y-2 text-sm text-neutral-300">
                <p>• t-distribution assumes the population is approximately normal</p>
                <p>• For very small samples (n &lt; 10), check for outliers</p>
                <p>• When in doubt, use t (it's more conservative)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}