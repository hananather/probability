"use client";
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  ControlPanel,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { RangeSlider } from '../ui/RangeSlider';
import { Button } from '../ui/button';
import { createColorScheme, typography, formatNumber } from '../../lib/design-system';
import { IntegralWorkedExample } from "./3-1-2-IntegralWorkedExample";
import { Info, Sparkles, ArrowRight, CheckCircle, BarChart3, TrendingUp } from "lucide-react";
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import { useSafeMathJax } from '../../utils/mathJaxFix';

// Color scheme for the visualization - using vibrant colors
const colorScheme = createColorScheme('estimation'); // Violet/Cyan/Amber for better visibility

// Learning stages for guided progression
const learningStages = [
  {
    id: 'motivation',
    title: 'Why PDFs Matter',
    subtitle: 'Understanding continuous probability',
    distribution: null,
    content: {
      main: "Unlike discrete distributions where we can assign probability to individual outcomes, continuous distributions pose a challenge: What's the probability of getting exactly π when measuring?",
      points: [
        "With infinite precision, P(X = exactly π) = 0",
        "Instead, we ask: What's P(3.14 ≤ X ≤ 3.15)?",
        "PDFs give us probability through area under the curve"
      ],
      insight: "The Probability Density Function (PDF) tells us how probability is distributed across continuous values."
    }
  },
  {
    id: 'uniform-intro',
    title: 'The Uniform Distribution',
    subtitle: 'Equal probability across an interval',
    distribution: 'uniform',
    params: { a: 0, b: 1 },
    content: {
      main: "The simplest continuous distribution: every value in the interval [a, b] is equally likely.",
      realWorld: "Computer random number generators produce uniform values between 0 and 1",
      activity: "Drag the interval markers below to see how probability equals area!"
    }
  },
  {
    id: 'uniform-explore',
    title: 'Exploring Uniform Properties',
    subtitle: 'Understanding constant density',
    distribution: 'uniform',
    params: { a: -2, b: 3 },
    content: {
      main: "Notice how the PDF is a constant height rectangle. This height equals 1/(b-a) so the total area is 1.",
      explore: [
        "Try changing the interval width [a, b]",
        "Observe how the height adjusts to keep total area = 1",
        "Calculate some probabilities by dragging the shaded region"
      ]
    }
  },
  {
    id: 'normal-intro',
    title: 'The Normal Distribution',
    subtitle: 'The famous bell curve',
    distribution: 'normal',
    params: { μ: 0, σ: 1 },
    content: {
      main: "The normal distribution appears everywhere in nature due to the Central Limit Theorem.",
      realWorld: "Manufacturing tolerances: part dimensions cluster around target values",
      key: "68% of values fall within ±1σ, 95% within ±2σ, 99.7% within ±3σ"
    }
  },
  {
    id: 'normal-explore',
    title: 'Normal Distribution Properties',
    subtitle: 'Mean and standard deviation',
    distribution: 'normal',
    params: { μ: 2, σ: 0.5 },
    content: {
      main: "The normal distribution is completely determined by two parameters: mean (μ) and standard deviation (σ).",
      explore: [
        "Adjust μ to shift the center",
        "Adjust σ to control the spread",
        "Find P(-1σ ≤ X ≤ +1σ) - it should be ≈0.68"
      ]
    }
  },
  {
    id: 'exponential-intro',
    title: 'The Exponential Distribution',
    subtitle: 'Modeling waiting times',
    distribution: 'exponential',
    params: { λ: 1 },
    content: {
      main: "The exponential distribution models the time between random events, like customer arrivals or component failures.",
      realWorld: "Time between customer arrivals at a service counter",
      property: "Memoryless property: P(X > s+t | X > s) = P(X > t)"
    }
  },
  {
    id: 'synthesis',
    title: 'Putting It All Together',
    subtitle: 'Key concepts review',
    distribution: 'normal',
    params: { μ: 0, σ: 1 },
    content: {
      main: "You've learned the fundamental concepts of continuous distributions!",
      keyTakeaways: [
        "PDFs describe probability density, not probability itself",
        "Probability = Area under the curve over an interval",
        "Total area under any PDF must equal 1",
        "Different distributions model different phenomena"
      ]
    }
  }
];

// Distribution configurations
const distributions = {
  uniform: {
    pdf: (x, a, b) => x >= a && x <= b ? 1 / (b - a) : 0,
    cdf: (x, a, b) => jStat.uniform.cdf(x, a, b),
    mean: (a, b) => (a + b) / 2,
    domain: (a, b) => [a - (b-a)*0.2, b + (b-a)*0.2],
    pdfTex: "\\frac{1}{b-a}, \\quad a \\le x \\le b",
    paramConfig: [
      {name: "a (Min)", min: -5, max: 5, step: 0.1, default: 0}, 
      {name: "b (Max)", min: -4, max: 6, step: 0.1, default: 1}
    ]
  },
  normal: {
    pdf: (x, μ, σ) => jStat.normal.pdf(x, μ, σ),
    cdf: (x, μ, σ) => jStat.normal.cdf(x, μ, σ),
    mean: (μ, σ) => μ,
    domain: (μ, σ) => [μ - 4*σ, μ + 4*σ],
    pdfTex: "\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",
    paramConfig: [
      {name: "μ (Mean)", min: -5, max: 5, step: 0.1, default: 0}, 
      {name: "σ (Std Dev)", min: 0.1, max: 3, step: 0.1, default: 1}
    ]
  },
  exponential: {
    pdf: (x, λ) => x >= 0 ? jStat.exponential.pdf(x, λ) : 0,
    cdf: (x, λ) => x >= 0 ? jStat.exponential.cdf(x, λ) : 0,
    mean: (λ) => 1 / λ,
    domain: (λ) => [0, Math.max(5, 5/λ)],
    pdfTex: "\\lambda e^{-\\lambda x}, \\quad x \\ge 0",
    paramConfig: [
      {name: "λ (Rate)", min: 0.1, max: 5, step: 0.1, default: 1}
    ]
  }
};

// Memoized PDF formula display
const PDFFormulaDisplay = memo(function PDFFormulaDisplay({ pdfTex, label }) {
  const formulaRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(formulaRef, [pdfTex]);
  
  return (
    <div className="p-3 bg-gradient-to-r from-blue-900/20 to-emerald-900/20 rounded-lg border border-blue-700/30">
      <div className="text-xs text-gray-400 mb-1">{label || "PDF Formula:"}</div>
      <div ref={formulaRef} className="text-center text-sm">
        <span dangerouslySetInnerHTML={{ __html: `\\(f(x) = ${pdfTex}\\)` }} />
      </div>
    </div>
  );
});

// Main component
const ContinuousDistributionsPDF = () => {
  const svgRef = useRef();
  const componentRef = useRef();
  
  // Stage management
  const [currentStage, setCurrentStage] = useState(0);
  const stage = learningStages[currentStage];
  
  // Distribution state
  const [params, setParams] = useState([]);
  const [intervalA, setIntervalA] = useState(-1);
  const [intervalB, setIntervalB] = useState(1);
  
  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Initialize parameters when stage changes
  useEffect(() => {
    if (stage.distribution && stage.params) {
      const dist = distributions[stage.distribution];
      const paramValues = dist.paramConfig.map((config, i) => {
        const paramName = config.name.split(' ')[0];
        // Ensure we always have a defined value to prevent controlled/uncontrolled warning
        const value = stage.params[paramName];
        return value !== undefined ? value : config.default;
      });
      setParams(paramValues);
      
      // Set appropriate interval defaults
      if (stage.distribution === 'uniform') {
        setIntervalA(stage.params.a + (stage.params.b - stage.params.a) * 0.2);
        setIntervalB(stage.params.a + (stage.params.b - stage.params.a) * 0.8);
      } else if (stage.distribution === 'normal') {
        setIntervalA(-1);
        setIntervalB(1);
      } else if (stage.distribution === 'exponential') {
        setIntervalA(0.5);
        setIntervalB(2);
      }
    }
    setHasInteracted(false);
  }, [currentStage, stage]);
  
  // Calculate distribution data with fixed axis ranges
  const calculateDistributionData = useCallback(() => {
    if (!stage.distribution) return { data: [], fixedDomain: [-10, 10], mean: 0, probability: 0 };
    
    const dist = distributions[stage.distribution];
    
    // Fixed domains for each distribution type for stable axes
    let fixedDomain;
    switch (stage.distribution) {
      case 'uniform':
        fixedDomain = [-6, 6];
        break;
      case 'normal':
        fixedDomain = [-8, 8];
        break;
      case 'exponential':
        fixedDomain = [-1, 10];
        break;
      default:
        fixedDomain = [-10, 10];
    }
    
    const numPoints = 500;
    
    // Calculate data across the full fixed domain
    const data = d3.range(fixedDomain[0], fixedDomain[1], (fixedDomain[1] - fixedDomain[0]) / numPoints).map(x => ({
      x,
      y: dist.pdf(x, ...params)
    }));
    
    const mean = dist.mean(...params);
    const cdfA = dist.cdf(intervalA, ...params);
    const cdfB = dist.cdf(intervalB, ...params);
    const probability = Math.max(0, cdfB - cdfA);
    
    return { data, fixedDomain, mean, probability, cdfA, cdfB };
  }, [stage.distribution, params, intervalA, intervalB]);
  
  // D3 Visualization with smooth transitions
  useEffect(() => {
    if (!svgRef.current || !stage.distribution) return;
    
    const { data, fixedDomain, mean, probability } = calculateDistributionData();
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const isFirstRender = svg.selectAll("g.main-group").empty();
    // Disable transitions during dragging for smooth interaction
    const transitionDuration = isFirstRender || isDragging ? 0 : 300;
    
    if (isFirstRender) {
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
    }
    
    // Create or select main group
    let g = svg.select("g.main-group");
    if (g.empty()) {
      g = svg.append("g")
        .attr("class", "main-group")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }
    
    // Create gradient definitions for vibrant fills (only once)
    let defs = svg.select("defs");
    if (defs.empty()) {
      defs = svg.append("defs");
    }
    
    // Primary gradient - vibrant purple to blue
    // Create gradients only if they don't exist
    if (defs.select("#primaryGradient").empty()) {
      const primaryGradient = defs.append("linearGradient")
        .attr("id", "primaryGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      primaryGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#8b5cf6")
        .attr("stop-opacity", 0.8);
      
      primaryGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3b82f6")
        .attr("stop-opacity", 0.3);
    }
    
    if (defs.select("#secondaryGradient").empty()) {
      const secondaryGradient = defs.append("linearGradient")
        .attr("id", "secondaryGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      secondaryGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#14b8a6")
        .attr("stop-opacity", 0.9);
      
      secondaryGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#06b6d4")
        .attr("stop-opacity", 0.4);
    }
    
    // Fixed scales for stable visualization
    const xScale = d3.scaleLinear()
      .domain(fixedDomain)
      .range([0, innerWidth]);
    
    // Fixed y-scale based on distribution type
    let yMax;
    switch (stage.distribution) {
      case 'uniform':
        yMax = 1.5;  // Uniform can have high density for narrow intervals
        break;
      case 'normal':
        yMax = 0.6;  // Normal PDF peak is ~0.4 for σ=1
        break;
      case 'exponential':
        yMax = 2.5;  // Exponential can have high density at x=0
        break;
      default:
        yMax = 1;
    }
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
    
    // Grid lines (create only once)
    if (g.select(".grid-x").empty()) {
      g.append("g")
        .attr("class", "grid grid-x")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat("")
        )
        .style("stroke", "#374151")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5);
      
      g.append("g")
        .attr("class", "grid grid-y")
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat("")
        )
        .style("stroke", "#374151")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5);
    }
    
    // Axes (create only once)
    let xAxis = g.select(".x-axis");
    if (xAxis.empty()) {
      xAxis = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(8));
    }
    
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#e5e7eb");
    
    xAxis.selectAll("line")
      .style("stroke", "#6b7280");
    
    xAxis.select(".domain")
      .style("stroke", "#6b7280");
    
    if (g.select(".x-label").empty()) {
      g.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .style("font-size", "14px")
        .style("fill", "#e5e7eb")
        .style("font-weight", "500")
        .text("x");
    }
    
    let yAxis = g.select(".y-axis");
    if (yAxis.empty()) {
      yAxis = g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));
    }
    
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#e5e7eb");
    
    yAxis.selectAll("line")
      .style("stroke", "#6b7280");
    
    yAxis.select(".domain")
      .style("stroke", "#6b7280");
    
    if (g.select(".y-label").empty()) {
      g.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .style("font-size", "14px")
        .style("fill", "#e5e7eb")
        .style("font-weight", "500")
        .text("f(x)");
    }
    
    // Area and line generators
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Create clip path (only once)
    if (defs.select("#chart-area").empty()) {
      defs.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight);
    }
    
    // Apply clipping to distribution paths
    let clippedGroup = g.select(".clipped-group");
    if (clippedGroup.empty()) {
      clippedGroup = g.append("g")
        .attr("class", "clipped-group")
        .attr("clip-path", "url(#chart-area)");
    }
    
    // Full distribution area with gradient (update with transition)
    let areaPath = clippedGroup.select(".distribution-area");
    if (areaPath.empty()) {
      areaPath = clippedGroup.append("path")
        .attr("class", "distribution-area")
        .attr("fill", "url(#primaryGradient)")
        .attr("opacity", 0.7);
    }
    
    areaPath
      .datum(data)
      .transition()
      .duration(transitionDuration)
      .attr("d", area);
    
    // Distribution line (update with transition)
    let linePath = clippedGroup.select(".distribution-line");
    if (linePath.empty()) {
      linePath = clippedGroup.append("path")
        .attr("class", "distribution-line")
        .attr("fill", "none")
        .attr("stroke", "#a855f7")
        .attr("stroke-width", 3)
        .attr("filter", "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))");
    }
    
    linePath
      .datum(data)
      .transition()
      .duration(transitionDuration)
      .attr("d", line);
    
    // Highlighted interval area (update with transition)
    const intervalData = data.filter(d => d.x >= intervalA && d.x <= intervalB);
    let intervalPath = clippedGroup.select(".interval-area");
    
    if (intervalData.length > 0) {
      if (intervalPath.empty()) {
        intervalPath = clippedGroup.append("path")
          .attr("class", "interval-area")
          .attr("fill", "url(#secondaryGradient)")
          .attr("opacity", 0.8)
          .attr("stroke", "#14b8a6")
          .attr("stroke-width", 2)
          .attr("filter", "drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))");
      }
      
      intervalPath
        .datum(intervalData)
        .transition()
        .duration(transitionDuration)
        .attr("d", area);
    } else {
      intervalPath.remove();
    }
    
    // Mean line - update with transition
    const meanX = xScale(mean);
    let meanLine = g.select(".mean-line");
    let meanText = g.select(".mean-text");
    
    if (mean !== undefined && meanX >= 0 && meanX <= innerWidth) {
      if (meanLine.empty()) {
        meanLine = g.append("line")
          .attr("class", "mean-line")
          .attr("y1", 0)
          .attr("y2", innerHeight)
          .attr("stroke", "#fbbf24")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("filter", "drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))");
      }
      
      meanLine
        .transition()
        .duration(transitionDuration)
        .attr("x1", meanX)
        .attr("x2", meanX);
      
      if (meanText.empty()) {
        meanText = g.append("text")
          .attr("class", "mean-text")
          .attr("y", 15)
          .attr("fill", "#fbbf24")
          .style("font-size", "12px")
          .style("font-family", "monospace");
      }
      
      meanText
        .transition()
        .duration(transitionDuration)
        .attr("x", meanX + 5)
        .text(`μ = ${mean.toFixed(2)}`);
    } else {
      meanLine.remove();
      meanText.remove();
    }
    
    // Drag behavior for interval markers
    const createDragBehavior = (type) => {
      return d3.drag()
        .on("start", () => {
          setIsDragging(true);
          setDragType(type);
          setHasInteracted(true);
        })
        .on("drag", (event) => {
          const newX = Math.max(0, Math.min(innerWidth, event.x));
          const newValue = xScale.invert(newX);
          
          if (type === 'a') {
            // Ensure intervalA stays within the fixed domain
            const constrainedValue = Math.max(fixedDomain[0], Math.min(fixedDomain[1], newValue));
            setIntervalA(Math.min(constrainedValue, intervalB - 0.01));
          } else if (type === 'b') {
            // Ensure intervalB stays within the fixed domain
            const constrainedValue = Math.max(fixedDomain[0], Math.min(fixedDomain[1], newValue));
            setIntervalB(Math.max(constrainedValue, intervalA + 0.01));
          }
        })
        .on("end", () => {
          setIsDragging(false);
          setDragType(null);
        });
    };
    
    // Interval markers - update existing or create new
    let markerA = g.select(".marker-a");
    if (markerA.empty()) {
      markerA = g.append("g")
        .attr("class", "marker-a")
        .attr("cursor", "ew-resize")
        .call(createDragBehavior('a'));
      
      markerA.append("line")
        .attr("class", "marker-a-line")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#06b6d4")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "none")
        .attr("filter", "drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))");
      
      markerA.append("circle")
        .attr("class", "marker-a-circle")
        .attr("cy", innerHeight)
        .attr("r", 10)
        .attr("fill", "#06b6d4")
        .attr("stroke", "#0e7490")
        .attr("stroke-width", 2);
      
      markerA.append("text")
        .attr("class", "marker-a-text")
        .attr("y", innerHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#06b6d4")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "0 0 8px rgba(6, 182, 212, 0.6)")
        .text("a");
    }
    
    // Update marker A position (no transition during drag)
    const markerALine = markerA.select(".marker-a-line");
    const markerACircle = markerA.select(".marker-a-circle");
    const markerAText = markerA.select(".marker-a-text");
    
    if (isDragging && dragType === 'a') {
      markerALine
        .attr("x1", xScale(intervalA))
        .attr("x2", xScale(intervalA));
      markerACircle.attr("cx", xScale(intervalA));
      markerAText.attr("x", xScale(intervalA));
    } else {
      markerALine
        .transition()
        .duration(transitionDuration)
        .attr("x1", xScale(intervalA))
        .attr("x2", xScale(intervalA));
      markerACircle
        .transition()
        .duration(transitionDuration)
        .attr("cx", xScale(intervalA));
      markerAText
        .transition()
        .duration(transitionDuration)
        .attr("x", xScale(intervalA));
    }
    
    let markerB = g.select(".marker-b");
    if (markerB.empty()) {
      markerB = g.append("g")
        .attr("class", "marker-b")
        .attr("cursor", "ew-resize")
        .call(createDragBehavior('b'));
      
      markerB.append("line")
        .attr("class", "marker-b-line")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#06b6d4")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "none")
        .attr("filter", "drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))");
      
      markerB.append("circle")
        .attr("class", "marker-b-circle")
        .attr("cy", innerHeight)
        .attr("r", 10)
        .attr("fill", "#06b6d4")
        .attr("stroke", "#0e7490")
        .attr("stroke-width", 2);
      
      markerB.append("text")
        .attr("class", "marker-b-text")
        .attr("y", innerHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#06b6d4")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "0 0 8px rgba(6, 182, 212, 0.6)")
        .text("b");
    }
    
    // Update marker B position (no transition during drag)
    const markerBLine = markerB.select(".marker-b-line");
    const markerBCircle = markerB.select(".marker-b-circle");
    const markerBText = markerB.select(".marker-b-text");
    
    if (isDragging && dragType === 'b') {
      markerBLine
        .attr("x1", xScale(intervalB))
        .attr("x2", xScale(intervalB));
      markerBCircle.attr("cx", xScale(intervalB));
      markerBText.attr("x", xScale(intervalB));
    } else {
      markerBLine
        .transition()
        .duration(transitionDuration)
        .attr("x1", xScale(intervalB))
        .attr("x2", xScale(intervalB));
      markerBCircle
        .transition()
        .duration(transitionDuration)
        .attr("cx", xScale(intervalB));
      markerBText
        .transition()
        .duration(transitionDuration)
        .attr("x", xScale(intervalB));
    }
    
    // Probability display - update existing or create new
    let probGroup = g.select(".probability-display");
    if (probability > 0) {
      const probX = xScale((intervalA + intervalB) / 2);
      const probY = 30;
      
      if (probGroup.empty()) {
        probGroup = g.append("g")
          .attr("class", "probability-display");
        
        probGroup.append("rect")
          .attr("class", "prob-rect")
          .attr("width", 200)
          .attr("height", 30)
          .attr("fill", "#1e293b")
          .attr("stroke", "#06b6d4")
          .attr("stroke-width", 2)
          .attr("rx", 6)
          .attr("filter", "drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))");
        
        probGroup.append("text")
          .attr("class", "prob-text")
          .attr("text-anchor", "middle")
          .attr("fill", "#67e8f9")
          .style("font-size", "16px")
          .style("font-family", "monospace")
          .style("font-weight", "bold")
          .style("text-shadow", "0 0 10px rgba(103, 232, 249, 0.6)");
      }
      
      // Update positions
      probGroup.select(".prob-rect")
        .transition()
        .duration(transitionDuration)
        .attr("x", probX - 100)
        .attr("y", probY - 15);
      
      probGroup.select(".prob-text")
        .transition()
        .duration(transitionDuration)
        .attr("x", probX)
        .attr("y", probY + 5)
        .text(`P = ${probability.toFixed(4)}`);
    } else {
      probGroup.remove();
    }
    
  }, [calculateDistributionData, intervalA, intervalB, stage.distribution, colorScheme]);
  
  // Handle parameter changes
  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = parseFloat(value);
    
    // Validate parameters
    if (stage.distribution === 'uniform' && index === 0 && newParams[0] >= newParams[1]) {
      newParams[1] = newParams[0] + 0.1;
    } else if (stage.distribution === 'uniform' && index === 1 && newParams[1] <= newParams[0]) {
      newParams[0] = newParams[1] - 0.1;
    }
    
    setParams(newParams);
  };
  
  // Progress milestone check
  const checkMilestone = () => {
    if (hasInteracted && currentStage === 1) {
      return "Great! You've discovered that probability = area under the curve!";
    }
    if (currentStage === 4 && Math.abs(intervalB - intervalA - 2) < 0.1) {
      return "Perfect! You found that P(μ-σ ≤ X ≤ μ+σ) ≈ 0.68";
    }
    return null;
  };
  
  const milestone = checkMilestone();
  
  return (
    <VisualizationContainer 
      ref={componentRef}
      title="Understanding Probability Density Functions"
      subtitle="A guided journey through continuous distributions"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          current={currentStage + 1}
          total={learningStages.length}
          label="Learning Journey"
          variant="emerald"
        />
      </div>
      
      {/* Stage Content */}
      <VisualizationSection className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{stage.title}</h2>
              <p className="text-sm text-gray-400">{stage.subtitle}</p>
            </div>
            {stage.distribution && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span className="capitalize">{stage.distribution} Distribution</span>
              </div>
            )}
          </div>
          
          {/* Stage-specific content */}
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-emerald-900/20 rounded-lg border border-blue-700/30">
            <p className="text-sm text-gray-300 mb-3">{stage.content.main}</p>
            
            {stage.content.points && (
              <ul className="space-y-2 ml-4">
                {stage.content.points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {stage.content.realWorld && (
              <div className="mt-3 p-3 bg-amber-900/20 rounded border border-amber-700/30">
                <p className="text-xs text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Real-world example: {stage.content.realWorld}
                </p>
              </div>
            )}
            
            {stage.content.activity && (
              <p className="mt-3 text-sm text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {stage.content.activity}
              </p>
            )}
            
            {stage.content.explore && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Try these:</p>
                {stage.content.explore.map((item, i) => (
                  <p key={i} className="text-sm text-gray-400 ml-4">• {item}</p>
                ))}
              </div>
            )}
            
            {stage.content.keyTakeaways && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-emerald-400">Key Takeaways:</p>
                {stage.content.keyTakeaways.map((takeaway, i) => (
                  <p key={i} className="text-sm text-gray-300 ml-4 flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    {takeaway}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          {/* Milestone feedback */}
          {milestone && (
            <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {milestone}
              </p>
            </div>
          )}
        </div>
      </VisualizationSection>
      
      {/* Main visualization */}
      {stage.distribution && (
        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          <GraphContainer className="relative">
            <svg ref={svgRef} className="w-full" />
            {isDragging && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-black/80 rounded-md">
                <span className="text-xs text-gray-300">
                  Adjusting {dragType === 'a' ? 'lower' : 'upper'} bound
                </span>
              </div>
            )}
          </GraphContainer>
          
          <ControlPanel className="space-y-4">
            {/* Distribution parameters */}
            {distributions[stage.distribution].paramConfig.map((config, index) => (
              <ControlGroup key={config.name} title={config.name}>
                <RangeSlider
                  value={params[index]}
                  onChange={(value) => handleParamChange(index, value)}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  className="mb-1"
                />
                <span className="font-mono text-sm text-blue-400">
                  {formatNumber(params[index])}
                </span>
              </ControlGroup>
            ))}
            
            {/* PDF Formula */}
            <PDFFormulaDisplay 
              pdfTex={distributions[stage.distribution].pdfTex}
              label={`${stage.distribution.charAt(0).toUpperCase() + stage.distribution.slice(1)} PDF`}
            />
            
            {/* Statistics */}
            <StatsDisplay
              stats={[
                { 
                  label: "Mean (μ)", 
                  value: formatNumber(calculateDistributionData().mean), 
                  color: colorScheme.accent 
                },
                { 
                  label: `P(${formatNumber(intervalA)} ≤ X ≤ ${formatNumber(intervalB)})`, 
                  value: formatNumber(calculateDistributionData().probability, 4), 
                  color: colorScheme.secondary 
                }
              ]}
            />
            
            {/* Interval bounds display */}
            <div className="p-3 bg-neutral-800/50 rounded-lg space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Current Interval</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">a = {formatNumber(intervalA)}</span>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-mono">b = {formatNumber(intervalB)}</span>
              </div>
            </div>
          </ControlPanel>
        </div>
      )}
      
      {/* Navigation */}
      <div className="mt-6">
        <ProgressNavigation
          current={currentStage + 1}
          total={learningStages.length}
          onPrevious={() => setCurrentStage(Math.max(0, currentStage - 1))}
          onNext={() => setCurrentStage(Math.min(learningStages.length - 1, currentStage + 1))}
          variant="emerald"
        />
      </div>
      
      {/* Worked example for applicable stages */}
      {stage.distribution && currentStage > 0 && (
        <VisualizationSection className="mt-8">
          <IntegralWorkedExample
            distName={stage.distribution}
            params={params}
            intervalA={intervalA}
            intervalB={intervalB}
            probValue={calculateDistributionData().probability}
            pdfFormula={distributions[stage.distribution].pdfTex}
            cdfAValue={calculateDistributionData().cdfA}
            cdfBValue={calculateDistributionData().cdfB}
          />
        </VisualizationSection>
      )}
    </VisualizationContainer>
  );
};

export default memo(ContinuousDistributionsPDF);