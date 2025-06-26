'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { VisualizationContainer, VisualizationSection, ControlPanel, ControlGroup, GraphContainer } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '@/lib/utils';
import { Calculator, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

// Beautiful color theme
const ciTheme = {
  colors: {
    estimate: '#f97316',      // Orange for estimates
    truth: '#8b5cf6',         // Purple for true values
    interval: '#ec4899',      // Pink for intervals
    accept: '#10b981',        // Green for coverage
    reject: '#ef4444',        // Red for miss
    background: '#1f2937',
    grid: '#374151',
    text: '#ffffff',
    textSecondary: '#9ca3af'
  },
  gradients: {
    confidence: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
    normalCurve: 'linear-gradient(180deg, rgba(249, 115, 22, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    critical: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  }
};

// Common confidence levels with z-values
const confidenceLevels = [
  { level: 0.68, z: 1.00, label: '68%', rule: '68' },
  { level: 0.90, z: 1.645, label: '90%' },
  { level: 0.95, z: 1.96, label: '95%', rule: '95' },
  { level: 0.99, z: 2.576, label: '99%' },
  { level: 0.997, z: 3.00, label: '99.7%', rule: '99.7' }
];

// Button styles
const buttonStyles = {
  primary: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300 transform",
    "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
    "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
  ),
  secondary: cn(
    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
    "bg-neutral-700 hover:bg-neutral-600 text-white"
  )
};

export default function ConfidenceIntervalMasterclass() {
  // Parameters
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [sampleMean, setSampleMean] = useState(100);
  const [populationMean] = useState(100); // True value (usually unknown)
  const [sigma, setSigma] = useState(15);
  const [sampleSize, setSampleSize] = useState(30);
  
  // Multiple CI simulation
  const [intervals, setIntervals] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showRule, setShowRule] = useState(true);
  
  // Example scenarios
  const [scenario, setScenario] = useState('default');
  
  // D3 refs
  const normalCurveRef = useRef(null);
  const ciBuilderRef = useRef(null);
  const coverageRef = useRef(null);
  const scalesRef = useRef({});
  
  // Calculate critical value and margin of error
  const calculations = useMemo(() => {
    const selectedLevel = confidenceLevels.find(cl => Math.abs(cl.level - confidenceLevel) < 0.001) || 
                         { level: confidenceLevel, z: 1.96 };
    const z = selectedLevel.z;
    const marginOfError = z * sigma / Math.sqrt(sampleSize);
    const lowerBound = sampleMean - marginOfError;
    const upperBound = sampleMean + marginOfError;
    
    return {
      z,
      marginOfError,
      lowerBound,
      upperBound,
      selectedLevel
    };
  }, [confidenceLevel, sampleMean, sigma, sampleSize]);
  
  // Initialize normal curve visualization
  useEffect(() => {
    if (!normalCurveRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(normalCurveRef.current);
      svg.selectAll("*").remove();
      
      const container = normalCurveRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 280;
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
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
    
    const areaGradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", ciTheme.colors.estimate).attr("stop-opacity", 0.3);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", ciTheme.colors.interval).attr("stop-opacity", 0.1);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([-4, 4])
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
      .call(d3.axisBottom(x).tickValues([-3, -2, -1, 0, 1, 2, 3]))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", ciTheme.colors.text)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Standard Normal (Z)");
    
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5));
    
    // Normal curve
    const normalData = d3.range(-4, 4.01, 0.01).map(z => ({
      z: z,
      density: (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z)
    }));
    
    const line = d3.line()
      .x(d => x(d.z))
      .y(d => y(d.density))
      .curve(d3.curveBasis);
    
    g.append("path")
      .attr("class", "normal-curve")
      .datum(normalData)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", ciTheme.colors.truth)
      .attr("stroke-width", 2);
    
    // Area groups
    g.append("g").attr("class", "confidence-area");
    g.append("g").attr("class", "critical-lines");
    g.append("g").attr("class", "labels");
    
    // Store scales
    scalesRef.current.normalCurve = { x, y, g, innerWidth, innerHeight, normalData, line };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update normal curve based on confidence level
  useEffect(() => {
    if (!scalesRef.current.normalCurve) return;
    
    const { x, y, g, normalData, line } = scalesRef.current.normalCurve;
    const z = calculations.z;
    
    // Update confidence area
    const areaData = normalData.filter(d => d.z >= -z && d.z <= z);
    
    const area = d3.area()
      .x(d => x(d.z))
      .y0(y(0))
      .y1(d => y(d.density))
      .curve(d3.curveBasis);
    
    const confidenceArea = g.select(".confidence-area").selectAll("path").data([areaData]);
    
    confidenceArea.enter()
      .append("path")
      .merge(confidenceArea)
      .transition()
      .duration(500)
      .attr("d", area)
      .attr("fill", "url(#area-gradient)");
    
    // Update critical lines
    const criticalLines = g.select(".critical-lines").selectAll("line").data([-z, z]);
    
    criticalLines.enter()
      .append("line")
      .attr("y1", 0)
      .attr("y2", y(0))
      .attr("stroke", ciTheme.colors.interval)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .merge(criticalLines)
      .transition()
      .duration(500)
      .attr("x1", d => x(d))
      .attr("x2", d => x(d));
    
    // Update labels
    const labels = g.select(".labels").selectAll("text").data([
      { x: 0, y: 0.15, text: `${(confidenceLevel * 100).toFixed(1)}%`, class: 'confidence-label' },
      { x: -z, y: -0.02, text: `-${z.toFixed(2)}`, class: 'z-label' },
      { x: z, y: -0.02, text: `+${z.toFixed(2)}`, class: 'z-label' }
    ]);
    
    labels.enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", d => d.class === 'confidence-label' ? ciTheme.colors.estimate : ciTheme.colors.interval)
      .style("font-size", d => d.class === 'confidence-label' ? "16px" : "12px")
      .style("font-weight", "bold")
      .merge(labels)
      .transition()
      .duration(500)
      .attr("x", d => x(d.x))
      .attr("y", d => y(d.y))
      .text(d => d.text);
    
  }, [confidenceLevel, calculations]);
  
  // Initialize CI builder
  useEffect(() => {
    if (!ciBuilderRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(ciBuilderRef.current);
      svg.selectAll("*").remove();
      
      const container = ciBuilderRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 200;
      const margin = { top: 40, right: 30, bottom: 40, left: 30 };
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
        .attr("fill", ciTheme.colors.background)
        .attr("rx", 8);
    
    // Scale (will be updated based on data)
    const x = d3.scaleLinear()
      .domain([50, 150])
      .range([20, innerWidth - 20]);
    
    // Main axis line
    g.append("line")
      .attr("class", "main-axis")
      .attr("x1", 20)
      .attr("x2", innerWidth - 20)
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", ciTheme.colors.grid)
      .attr("stroke-width", 2);
    
    // Groups for CI elements
    g.append("g").attr("class", "ci-elements");
    g.append("g").attr("class", "axis-ticks");
    
    scalesRef.current.ciBuilder = { g, x, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update CI builder
  useEffect(() => {
    if (!scalesRef.current.ciBuilder) return;
    
    const { g, x, innerHeight } = scalesRef.current.ciBuilder;
    const { lowerBound, upperBound, marginOfError } = calculations;
    
    // Update scale domain
    const padding = marginOfError * 2;
    x.domain([sampleMean - padding * 2, sampleMean + padding * 2]);
    
    // Update axis ticks
    const ticks = x.ticks(7);
    const axisTicks = g.select(".axis-ticks").selectAll("g.tick").data(ticks);
    
    const tickEnter = axisTicks.enter().append("g").attr("class", "tick");
    
    tickEnter.append("line")
      .attr("y1", innerHeight / 2 - 5)
      .attr("y2", innerHeight / 2 + 5)
      .attr("stroke", ciTheme.colors.grid);
    
    tickEnter.append("text")
      .attr("y", innerHeight / 2 + 20)
      .attr("text-anchor", "middle")
      .attr("fill", ciTheme.colors.textSecondary)
      .style("font-size", "12px");
    
    axisTicks.merge(tickEnter)
      .transition()
      .duration(300)
      .attr("transform", d => `translate(${x(d)}, 0)`)
      .select("text")
      .text(d => d.toFixed(0));
    
    axisTicks.exit().remove();
    
    // CI elements
    const ciElements = g.select(".ci-elements");
    ciElements.selectAll("*").remove();
    
    // Confidence interval bar
    const ciBar = ciElements.append("g").attr("class", "ci-bar");
    
    ciBar.append("rect")
      .attr("x", x(lowerBound))
      .attr("y", innerHeight / 2 - 15)
      .attr("width", x(upperBound) - x(lowerBound))
      .attr("height", 30)
      .attr("fill", ciTheme.colors.interval)
      .attr("opacity", 0.3)
      .attr("rx", 4);
    
    ciBar.append("line")
      .attr("x1", x(lowerBound))
      .attr("x2", x(upperBound))
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", ciTheme.colors.interval)
      .attr("stroke-width", 3);
    
    // Bounds
    [lowerBound, upperBound].forEach((bound, i) => {
      const boundGroup = ciBar.append("g")
        .attr("transform", `translate(${x(bound)}, ${innerHeight / 2})`);
      
      boundGroup.append("line")
        .attr("y1", -20)
        .attr("y2", 20)
        .attr("stroke", ciTheme.colors.interval)
        .attr("stroke-width", 3);
      
      boundGroup.append("text")
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .attr("fill", ciTheme.colors.interval)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(bound.toFixed(1));
    });
    
    // Sample mean point
    const meanGroup = ciElements.append("g")
      .attr("transform", `translate(${x(sampleMean)}, ${innerHeight / 2})`);
    
    meanGroup.append("circle")
      .attr("r", 8)
      .attr("fill", ciTheme.colors.estimate)
      .attr("stroke", ciTheme.colors.background)
      .attr("stroke-width", 2);
    
    meanGroup.append("text")
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", ciTheme.colors.estimate)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`x̄ = ${sampleMean.toFixed(1)}`);
    
    // True mean (if known)
    if (populationMean >= x.domain()[0] && populationMean <= x.domain()[1]) {
      const trueGroup = ciElements.append("g")
        .attr("transform", `translate(${x(populationMean)}, ${innerHeight / 2})`);
      
      trueGroup.append("line")
        .attr("y1", -30)
        .attr("y2", 30)
        .attr("stroke", ciTheme.colors.truth)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
      
      trueGroup.append("text")
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("fill", ciTheme.colors.truth)
        .style("font-size", "12px")
        .text(`μ = ${populationMean}`);
    }
    
    // Margin of error annotation
    const meGroup = ciElements.append("g")
      .attr("transform", `translate(${x(sampleMean)}, ${innerHeight / 2 - 40})`);
    
    meGroup.append("path")
      .attr("d", `M${x(sampleMean - marginOfError) - x(sampleMean)},0 L${x(sampleMean + marginOfError) - x(sampleMean)},0`)
      .attr("stroke", ciTheme.colors.estimate)
      .attr("stroke-width", 1)
      .attr("marker-start", "url(#arrow-start)")
      .attr("marker-end", "url(#arrow-end)");
    
    meGroup.append("text")
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", ciTheme.colors.estimate)
      .style("font-size", "11px")
      .text(`ME = ±${marginOfError.toFixed(1)}`);
    
    // Arrow markers
    const defs = g.select("defs").empty() ? g.append("defs") : g.select("defs");
    
    ["start", "end"].forEach(type => {
      const marker = defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", type === "end" ? 8 : 0)
        .attr("refY", 4)
        .attr("orient", "auto");
      
      marker.append("path")
        .attr("d", type === "end" ? "M0,0 L8,4 L0,8" : "M8,0 L0,4 L8,8")
        .attr("fill", ciTheme.colors.estimate);
    });
    
  }, [sampleMean, calculations, populationMean]);
  
  // Initialize coverage simulation
  useEffect(() => {
    if (!coverageRef.current) return;
    
    const timer = setTimeout(() => {
      const svg = d3.select(coverageRef.current);
      svg.selectAll("*").remove();
      
      const container = coverageRef.current.parentElement;
      const width = Math.max(container ? container.offsetWidth : 800, 400);
      const height = 300;
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
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
      
      // Scales
      const x = d3.scaleLinear()
        .domain([70, 130])
        .range([0, innerWidth]);
    
    const y = d3.scaleBand()
      .range([0, innerHeight])
      .padding(0.1);
    
    // Axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`);
    
    g.append("g")
      .attr("class", "y-axis");
    
    // True mean line
    g.append("line")
      .attr("class", "true-mean")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", ciTheme.colors.truth)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3");
    
    // Intervals group
    g.append("g").attr("class", "intervals");
    
    scalesRef.current.coverage = { g, x, y, innerWidth, innerHeight };
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update coverage simulation
  useEffect(() => {
    if (!scalesRef.current.coverage || intervals.length === 0) return;
    
    const { g, x, y, innerHeight } = scalesRef.current.coverage;
    
    // Update scales
    y.domain(intervals.map((_, i) => i));
    
    // Update axes
    g.select(".x-axis")
      .call(d3.axisBottom(x).ticks(6));
    
    // Update true mean line
    g.select(".true-mean")
      .attr("x1", x(populationMean))
      .attr("x2", x(populationMean));
    
    // Update intervals
    const intervalGroups = g.select(".intervals")
      .selectAll("g.interval")
      .data(intervals, d => d.id);
    
    const intervalEnter = intervalGroups.enter()
      .append("g")
      .attr("class", "interval")
      .attr("transform", (d, i) => `translate(0, ${y(i)})`);
    
    // CI line
    intervalEnter.append("line")
      .attr("class", "ci-line")
      .attr("y1", y.bandwidth() / 2)
      .attr("y2", y.bandwidth() / 2)
      .attr("stroke-width", 2);
    
    // Sample mean point
    intervalEnter.append("circle")
      .attr("class", "mean-point")
      .attr("cy", y.bandwidth() / 2)
      .attr("r", 3);
    
    // Update all intervals
    const allIntervals = intervalGroups.merge(intervalEnter);
    
    allIntervals.select(".ci-line")
      .attr("x1", d => x(d.lower))
      .attr("x2", d => x(d.upper))
      .attr("stroke", d => d.contains ? ciTheme.colors.accept : ciTheme.colors.reject)
      .style("opacity", 0.8);
    
    allIntervals.select(".mean-point")
      .attr("cx", d => x(d.mean))
      .attr("fill", d => d.contains ? ciTheme.colors.accept : ciTheme.colors.reject);
    
    intervalGroups.exit().remove();
    
    // Update coverage percentage
    const coverage = intervals.filter(i => i.contains).length / intervals.length;
    
    g.selectAll(".coverage-text").remove();
    g.append("text")
      .attr("class", "coverage-text")
      .attr("x", innerWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", ciTheme.colors.text)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`Coverage: ${(coverage * 100).toFixed(1)}% (Expected: ${(confidenceLevel * 100).toFixed(1)}%)`);
    
  }, [intervals, populationMean, confidenceLevel]);
  
  // Simulate multiple confidence intervals
  const simulateIntervals = useCallback(() => {
    setIsSimulating(true);
    const newIntervals = [];
    
    const simulate = (i) => {
      if (i >= 20) {
        setIsSimulating(false);
        return;
      }
      
      // Generate sample mean (normally distributed around population mean)
      const sampleMean = d3.randomNormal(populationMean, sigma / Math.sqrt(sampleSize))();
      const z = calculations.z;
      const marginOfError = z * sigma / Math.sqrt(sampleSize);
      
      const interval = {
        id: Date.now() + i,
        mean: sampleMean,
        lower: sampleMean - marginOfError,
        upper: sampleMean + marginOfError,
        contains: populationMean >= sampleMean - marginOfError && 
                  populationMean <= sampleMean + marginOfError
      };
      
      newIntervals.push(interval);
      setIntervals([...newIntervals]);
      
      setTimeout(() => simulate(i + 1), 150);
    };
    
    simulate(0);
  }, [populationMean, sigma, sampleSize, calculations.z]);
  
  // Example scenarios
  const applyScenario = useCallback((scenarioType) => {
    setScenario(scenarioType);
    
    switch (scenarioType) {
      case 'manufacturing':
        setSampleMean(10.2);
        setSigma(0.5);
        setSampleSize(50);
        setConfidenceLevel(0.95);
        break;
      case 'medical':
        setSampleMean(120);
        setSigma(15);
        setSampleSize(100);
        setConfidenceLevel(0.99);
        break;
      case 'survey':
        setSampleMean(0.52 * 100); // Convert proportion to percentage
        setSigma(Math.sqrt(0.52 * 0.48) * 100); // Binomial SD
        setSampleSize(1000);
        setConfidenceLevel(0.95);
        break;
      default:
        setSampleMean(100);
        setSigma(15);
        setSampleSize(30);
        setConfidenceLevel(0.95);
    }
  }, []);
  
  return (
    <VisualizationContainer
      title="Confidence Interval Masterclass"
      description="Master the construction and interpretation of confidence intervals"
      className="bg-neutral-900"
    >
      {/* Three-panel layout */}
      <div className="space-y-6">
        {/* Panel 1: Interactive Normal Curve */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisualizationSection 
              title="Critical Values & Confidence Levels"
              className="bg-neutral-800"
            >
              <GraphContainer height="280px">
                <svg ref={normalCurveRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </GraphContainer>
              
              {/* Quick select buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {confidenceLevels.map(cl => (
                  <button
                    key={cl.level}
                    onClick={() => setConfidenceLevel(cl.level)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      confidenceLevel === cl.level
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    )}
                  >
                    {cl.label}
                    {cl.rule && showRule && (
                      <span className="ml-1 text-xs opacity-75">({cl.rule} rule)</span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Formula display */}
              <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
                <div className="text-center">
                  {`\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}} = ${sampleMean} \\pm ${calculations.z.toFixed(3)} \\cdot \\frac{${sigma}}{\\sqrt{${sampleSize}}}\\]`}
                </div>
              </div>
            </VisualizationSection>
          </div>
          
          <div>
            <ControlPanel className="bg-neutral-800 h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
              
              <ControlGroup label="Confidence Level">
                <RangeSlider
                  value={confidenceLevel}
                  onChange={setConfidenceLevel}
                  min={0.50}
                  max={0.99}
                  step={0.01}
                  gradient="from-orange-500 to-pink-500"
                />
                <span className="text-sm text-orange-400 font-mono">
                  {(confidenceLevel * 100).toFixed(0)}%
                </span>
              </ControlGroup>
              
              <ControlGroup label="Sample Mean (x̄)">
                <RangeSlider
                  value={sampleMean}
                  onChange={setSampleMean}
                  min={80}
                  max={120}
                  step={0.5}
                  gradient="from-orange-500 to-purple-500"
                />
              </ControlGroup>
              
              <ControlGroup label="Population SD (σ)">
                <RangeSlider
                  value={sigma}
                  onChange={setSigma}
                  min={5}
                  max={30}
                  step={1}
                  gradient="from-pink-500 to-purple-500"
                />
              </ControlGroup>
              
              <ControlGroup label="Sample Size (n)">
                <RangeSlider
                  value={sampleSize}
                  onChange={setSampleSize}
                  min={10}
                  max={200}
                  step={10}
                  gradient="from-purple-500 to-pink-500"
                />
              </ControlGroup>
            </ControlPanel>
          </div>
        </div>
        
        {/* Panel 2: CI Builder */}
        <VisualizationSection 
          title="Confidence Interval Construction"
          className="bg-neutral-800"
        >
          <GraphContainer height="200px">
            <svg ref={ciBuilderRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </GraphContainer>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-900/20 to-pink-900/20 rounded-lg p-3 border border-orange-500/30">
              <div className="text-xs text-neutral-400 mb-1">Margin of Error</div>
              <div className="text-lg font-mono text-orange-400">
                ±{calculations.marginOfError.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg p-3 border border-pink-500/30">
              <div className="text-xs text-neutral-400 mb-1">Interval Width</div>
              <div className="text-lg font-mono text-pink-400">
                {(2 * calculations.marginOfError).toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-3 border border-purple-500/30">
              <div className="text-xs text-neutral-400 mb-1">CI Range</div>
              <div className="text-lg font-mono text-purple-400">
                [{calculations.lowerBound.toFixed(1)}, {calculations.upperBound.toFixed(1)}]
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Panel 3: Coverage Simulation */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisualizationSection 
              title="Long-Run Coverage Behavior"
              className="bg-neutral-800"
            >
              <GraphContainer height="300px">
                <svg ref={coverageRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </GraphContainer>
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={simulateIntervals}
                  disabled={isSimulating}
                  className={buttonStyles.primary}
                >
                  <TrendingUp className="w-4 h-4 mr-2 inline" />
                  {isSimulating ? "Simulating..." : "Generate 20 CIs"}
                </button>
                
                <button
                  onClick={() => setIntervals([])}
                  disabled={isSimulating}
                  className={buttonStyles.secondary}
                >
                  Clear
                </button>
              </div>
              
              {intervals.length > 0 && (
                <div className="mt-4 p-3 bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-green-500 rounded" />
                      <span className="text-neutral-300">Contains μ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-red-500 rounded" />
                      <span className="text-neutral-300">Misses μ</span>
                    </div>
                  </div>
                </div>
              )}
            </VisualizationSection>
          </div>
          
          <div className="space-y-4">
            {/* Example Scenarios */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-400" />
                Example Scenarios
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => applyScenario('manufacturing')}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all",
                    scenario === 'manufacturing'
                      ? "bg-gradient-to-r from-orange-900/30 to-pink-900/30 border border-orange-500/50"
                      : "bg-neutral-700 hover:bg-neutral-600"
                  )}
                >
                  <div className="text-sm font-medium text-white">Manufacturing QC</div>
                  <div className="text-xs text-neutral-400">Bolt diameter tolerance</div>
                </button>
                
                <button
                  onClick={() => applyScenario('medical')}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all",
                    scenario === 'medical'
                      ? "bg-gradient-to-r from-orange-900/30 to-pink-900/30 border border-orange-500/50"
                      : "bg-neutral-700 hover:bg-neutral-600"
                  )}
                >
                  <div className="text-sm font-medium text-white">Medical Study</div>
                  <div className="text-xs text-neutral-400">Blood pressure measurement</div>
                </button>
                
                <button
                  onClick={() => applyScenario('survey')}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all",
                    scenario === 'survey'
                      ? "bg-gradient-to-r from-orange-900/30 to-pink-900/30 border border-orange-500/50"
                      : "bg-neutral-700 hover:bg-neutral-600"
                  )}
                >
                  <div className="text-sm font-medium text-white">Election Poll</div>
                  <div className="text-xs text-neutral-400">Candidate support %</div>
                </button>
              </div>
            </div>
            
            {/* Key Insights */}
            <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 rounded-lg p-4 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Insights
              </h3>
              
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <p>Higher confidence → Wider intervals</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                  <p>Larger n → Narrower intervals (√n effect)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <p>{(confidenceLevel * 100).toFixed(0)}% of CIs contain μ in the long run</p>
                </div>
              </div>
            </div>
            
            {/* Common Misconceptions */}
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Common Misconceptions
              </h3>
              
              <div className="space-y-2 text-sm text-neutral-300">
                <p className="text-red-300">❌ "There's a {(confidenceLevel * 100).toFixed(0)}% chance μ is in this interval"</p>
                <p className="text-green-300">✓ "{(confidenceLevel * 100).toFixed(0)}% of such intervals contain μ"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}