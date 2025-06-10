"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { createColorScheme, typography } from "../../lib/design-system";
import { ExponentialDistributionWorkedExample } from "./3-4-2-ExponentialDistributionWorkedExample";

const ExponentialDistribution = React.memo(function ExponentialDistribution() {
  // Core parameter states
  const [lambda, setLambda] = useState(1);
  const [showCDF, setShowCDF] = useState(false);
  const [t, setT] = useState(1); // Time for probability calculation
  const [memorylessT1, setMemorylessT1] = useState(1);
  const [memorylessT2, setMemorylessT2] = useState(2);
  const [showMemoryless, setShowMemoryless] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Refs for D3
  const svgRef = useRef(null);
  const memorylessSvgRef = useRef(null);
  
  // Color scheme
  const colors = createColorScheme('estimation');
  
  // Ensure lambda is positive to avoid division by zero
  const safeLambda = Math.max(0.001, lambda);
  
  // Calculate probabilities
  const pdfAtT = safeLambda * Math.exp(-safeLambda * t);
  const cdfAtT = 1 - Math.exp(-safeLambda * t);
  const meanValue = 1 / safeLambda;
  const variance = 1 / (safeLambda * safeLambda);
  const stdDev = Math.sqrt(variance);
  
  // Memoryless property calculations
  const pGreaterThanT1 = Math.exp(-safeLambda * memorylessT1);
  const pGreaterThanT1PlusT2GivenT1 = Math.exp(-safeLambda * memorylessT2);
  const pGreaterThanT1PlusT2 = Math.exp(-safeLambda * (memorylessT1 + memorylessT2));
  
  // Track interactions
  useEffect(() => {
    setInteractionCount(prev => prev + 1);
  }, [lambda, showCDF, t, memorylessT1, memorylessT2, showMemoryless]);
  
  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // Dark background with subtle gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bgGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0a0a0a");
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f0f0f");
    
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "url(#bgGradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale - show up to 5/lambda for good visualization
    const xMax = Math.min(10, 5 / safeLambda);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Y scale
    const yMax = showCDF ? 1.1 : Math.min(2, lambda * 1.1);
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.15)
      .style("stroke", colors.chart.grid);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.15)
      .style("stroke", colors.chart.grid);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("Time (t)");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text(showCDF ? "F(t) = P(T ≤ t)" : "f(t)");
    
    // Generate data points
    const data = [];
    const step = xMax / 200;
    for (let i = 0; i <= xMax; i += step) {
      if (showCDF) {
        data.push({ x: i, y: 1 - Math.exp(-lambda * i) });
      } else {
        data.push({ x: i, y: safeLambda * Math.exp(-safeLambda * i) });
      }
    }
    
    // Draw the curve with glow effect
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    // Add glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Background glow path
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 4)
      .attr("opacity", 0.25)
      .attr("filter", "url(#glow)")
      .attr("d", line);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Animate the path
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(800)
      .ease(d3.easeQuadInOut)
      .attr("stroke-dashoffset", 0);
    
    // Highlight the point at t
    if (t <= xMax) {
      const yValue = showCDF ? cdfAtT : pdfAtT;
      
      // Vertical line at t
      g.append("line")
        .attr("x1", x(t))
        .attr("x2", x(t))
        .attr("y1", height)
        .attr("y2", y(yValue))
        .attr("stroke", colors.chart.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Point on curve with pulse animation
      const pointGroup = g.append("g");
      
      // Outer pulse circle
      pointGroup.append("circle")
        .attr("cx", x(t))
        .attr("cy", y(yValue))
        .attr("r", 5)
        .attr("fill", "none")
        .attr("stroke", colors.chart.accent)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("r", 15)
        .attr("opacity", 0)
        .transition()
        .duration(0)
        .attr("r", 5)
        .attr("opacity", 0.5)
        .on("end", function repeat() {
          d3.select(this)
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .attr("r", 15)
            .attr("opacity", 0)
            .transition()
            .duration(0)
            .attr("r", 5)
            .attr("opacity", 0.5)
            .on("end", repeat);
        });
      
      // Inner point
      pointGroup.append("circle")
        .attr("cx", x(t))
        .attr("cy", y(yValue))
        .attr("r", 5)
        .attr("fill", colors.chart.accent)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
      
      // Label
      g.append("text")
        .attr("x", x(t))
        .attr("y", y(yValue) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.accent)
        .style("font-size", "12px")
        .text(`(${t.toFixed(1)}, ${yValue.toFixed(3)})`);
      
      // Shade area under PDF up to t
      if (!showCDF) {
        const areaData = data.filter(d => d.x <= t);
        const area = d3.area()
          .x(d => x(d.x))
          .y0(height)
          .y1(d => y(d.y));
        
        g.append("path")
          .datum(areaData)
          .attr("fill", colors.chart.secondary)
          .attr("opacity", 0)
          .attr("d", area)
          .transition()
          .delay(800)
          .duration(500)
          .attr("opacity", 0.3);
      }
    }
    
    // Add mean line
    if (meanValue <= xMax) {
      g.append("line")
        .attr("x1", x(meanValue))
        .attr("x2", x(meanValue))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "10,5");
      
      g.append("text")
        .attr("x", x(meanValue))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.tertiary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`μ = ${meanValue.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .duration(300)
        .attr("opacity", 1);
    }
    
    // Add distribution label with gradient background
    const labelGroup = g.append("g");
    
    // Create gradient for label background
    const labelGradient = defs.append("linearGradient")
      .attr("id", "labelGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    labelGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1a1a2e")
      .attr("stop-opacity", 0.9);
    labelGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#16213e")
      .attr("stop-opacity", 0.9);
    
    labelGroup.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 180)
      .attr("height", 50)
      .attr("fill", "url(#labelGradient)")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-opacity", 0.3)
      .attr("rx", 6);
    
    labelGroup.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", colors.chart.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`Exponential(λ = ${lambda.toFixed(2)})`);
    
    labelGroup.append("text")
      .attr("x", 20)
      .attr("y", 50)
      .attr("fill", colors.chart.secondary)
      .style("font-size", "12px")
      .style("opacity", 0.9)
      .text(showCDF ? "Cumulative Distribution" : "Probability Density");
    
    // Cleanup D3 transitions on unmount
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").interrupt();
      }
    };
  }, [lambda, showCDF, t, colors, safeLambda]);
  
  // Memoryless property visualization
  useEffect(() => {
    if (!memorylessSvgRef.current || !showMemoryless) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(memorylessSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(memorylessSvgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // Dark background with subtle gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bgGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0a0a0a");
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f0f0f");
    
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "url(#bgGradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Timeline visualization
    const timelineY = height / 2;
    const maxTime = memorylessT1 + memorylessT2 + 1;
    const x = d3.scaleLinear()
      .domain([0, maxTime])
      .range([0, width]);
    
    // Draw timeline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", timelineY)
      .attr("y2", timelineY)
      .attr("stroke", "#666")
      .attr("stroke-width", 2);
    
    // Mark t1
    g.append("line")
      .attr("x1", x(memorylessT1))
      .attr("x2", x(memorylessT1))
      .attr("y1", timelineY - 20)
      .attr("y2", timelineY + 20)
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 3);
    
    g.append("text")
      .attr("x", x(memorylessT1))
      .attr("y", timelineY - 30)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.primary)
      .text(`t₁ = ${memorylessT1}`);
    
    // Mark t1 + t2
    g.append("line")
      .attr("x1", x(memorylessT1 + memorylessT2))
      .attr("x2", x(memorylessT1 + memorylessT2))
      .attr("y1", timelineY - 20)
      .attr("y2", timelineY + 20)
      .attr("stroke", colors.chart.secondary)
      .attr("stroke-width", 3);
    
    g.append("text")
      .attr("x", x(memorylessT1 + memorylessT2))
      .attr("y", timelineY - 30)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.secondary)
      .text(`t₁ + t₂ = ${memorylessT1 + memorylessT2}`);
    
    // Show intervals
    g.append("rect")
      .attr("x", x(memorylessT1))
      .attr("y", timelineY - 10)
      .attr("width", x(memorylessT2) - x(0))
      .attr("height", 20)
      .attr("fill", colors.chart.accent)
      .attr("opacity", 0.3);
    
    g.append("text")
      .attr("x", x(memorylessT1 + memorylessT2 / 2))
      .attr("y", timelineY + 40)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.accent)
      .text(`Additional t₂ = ${memorylessT2}`);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(x));
    
    // Cleanup D3 transitions on unmount
    return () => {
      if (memorylessSvgRef.current) {
        d3.select(memorylessSvgRef.current).selectAll("*").interrupt();
      }
    };
  }, [lambda, memorylessT1, memorylessT2, showMemoryless, colors, safeLambda]);
  
  // Educational insights based on interaction count
  const getInsights = () => {
    if (interactionCount === 0) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Exponential Distribution
          </h3>
          <p className={typography.description}>
            The exponential distribution models the time between events in a Poisson process. 
            It's the continuous analog of the geometric distribution and has a unique "memoryless" property!
          </p>
          <div className="mt-3 p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300">
              🎯 Goal: Explore 20+ parameter combinations to master the exponential distribution!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 5) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Understanding λ (Rate Parameter)
          </h3>
          <p className={typography.description}>
            Try different values of λ:
          </p>
          <ul className="text-xs text-gray-300 space-y-1 mt-2">
            <li>• λ = 0.5: Events occur slowly (mean time = 2)</li>
            <li>• λ = 1: Standard rate (mean time = 1)</li>
            <li>• λ = 2: Events occur quickly (mean time = 0.5)</li>
          </ul>
          <div className="mt-3 p-3 bg-indigo-900/30 border border-indigo-600/30 rounded">
            <div className="text-xs text-indigo-300">
              💡 Tip: The mean μ = 1/λ, so larger λ means shorter average wait times!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 19) {
      const progress = ((interactionCount - 5) / 15) * 100;
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Discovering the Memoryless Property
          </h3>
          <p className={typography.description}>
            Enable "Show Memoryless Property" to see something amazing:
          </p>
          <p className="text-xs text-purple-300 mt-2 font-mono">
            P(T {'>'} t₁ + t₂ | T {'>'} t₁) = P(T {'>'} t₂)
          </p>
          <p className="text-sm text-gray-300 mt-2">
            This means if you've already waited t₁ time, the probability of waiting 
            an additional t₂ time is the same as starting fresh!
          </p>
          <div className="mt-3 p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300 mb-2">
              🎯 Progress: Explore the memoryless property with different values!
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center mt-1 text-purple-400 font-mono" style={{ fontSize: '10px' }}>
              {interactionCount - 5}/15
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-emerald-100">
            ✨ Exponential Expert!
          </h3>
          <p className={typography.description}>
            You've mastered the exponential distribution! Key insights:
          </p>
          <ul className="text-xs text-gray-300 space-y-1 mt-2">
            <li>• Models time between random events (wait times, lifetimes)</li>
            <li>• Only continuous distribution with the memoryless property</li>
            <li>• CDF: F(t) = 1 - e^(-λt) gives probability of event by time t</li>
            <li>• Variance = 1/λ², so higher rates mean less variability</li>
          </ul>
          <div className="mt-3 p-3 bg-gradient-to-br from-emerald-900/20 to-emerald-900/10 border border-emerald-600/30 rounded">
            <p className="text-xs text-emerald-300 font-semibold mb-2">
              🔧 Engineering Example:
            </p>
            <p className="text-xs text-emerald-200">
              A server receives requests at rate λ = 10/hour. The probability of waiting 
              more than 6 minutes (0.1 hour) for the next request is e^(-10×0.1) = e^(-1) ≈ 0.368. 
              This is crucial for capacity planning and queue management!
            </p>
          </div>
        </div>
      );
    }
  };
  
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h2 className={typography.h2}>Exponential Distribution</h2>
        <p className={typography.description}>
          Explore the exponential distribution, which models the time between events in a Poisson 
          process. Discover its unique memoryless property and applications in reliability engineering 
          and queueing theory.
        </p>
      </div>
      
      <div className="space-y-4">
        <RangeSlider
          label="Rate parameter (λ)"
          value={lambda}
          onChange={setLambda}
          min={0.1}
          max={3}
          step={0.1}
          color="violet"
        />
        
        <RangeSlider
          label="Time value (t)"
          value={t}
          onChange={setT}
          min={0}
          max={5}
          step={0.1}
          color="cyan"
        />
        
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showCDF}
              onChange={(e) => setShowCDF(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show CDF</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showMemoryless}
              onChange={(e) => setShowMemoryless(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show Memoryless Property</span>
          </label>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-white">Distribution Properties</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">Mean (μ):</span>
            <span className="ml-2 font-mono text-emerald-400">{meanValue.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Variance (σ²):</span>
            <span className="ml-2 font-mono text-purple-400">{variance.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Std Dev (σ):</span>
            <span className="ml-2 font-mono text-amber-400">{stdDev.toFixed(3)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-white">Probability Calculations</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">f({t.toFixed(1)}):</span>
            <span className="ml-2 font-mono text-emerald-400">{pdfAtT.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-gray-400">P(T ≤ {t.toFixed(1)}):</span>
            <span className="ml-2 font-mono text-purple-400">{cdfAtT.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-gray-400">P(T {'>'} {t.toFixed(1)}):</span>
            <span className="ml-2 font-mono text-amber-400">{(1 - cdfAtT).toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      {showMemoryless && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Memoryless Property Demo</h3>
            <RangeSlider
              label="Initial time (t₁)"
              value={memorylessT1}
              onChange={setMemorylessT1}
              min={0.1}
              max={3}
              step={0.1}
              color="blue"
            />
            <RangeSlider
              label="Additional time (t₂)"
              value={memorylessT2}
              onChange={setMemorylessT2}
              min={0.1}
              max={3}
              step={0.1}
              color="emerald"
            />
          </div>
          
          <div className="p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-600/30 rounded-lg space-y-3">
            <h4 className="text-xs font-semibold text-purple-300">Memoryless Property Verification</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">P(T {'>'} {memorylessT1.toFixed(1)}):</span>
                <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-400">P(T {'>'} {(memorylessT1 + memorylessT2).toFixed(1)}):</span>
                <span className="ml-2 font-mono text-emerald-400">{pGreaterThanT1PlusT2.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <span className="text-gray-400">P(T {'>'} {(memorylessT1 + memorylessT2).toFixed(1)} | T {'>'} {memorylessT1.toFixed(1)}):</span>
                <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1PlusT2GivenT1.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-400">P(T {'>'} {memorylessT2.toFixed(1)}):</span>
                <span className="ml-2 font-mono text-purple-400">{pGreaterThanT1PlusT2GivenT1.toFixed(4)}</span>
              </div>
              <div className="mt-2 text-emerald-400 font-semibold">
                ✓ They're equal! The memoryless property holds.
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-6">
        {getInsights()}
      </div>
      
      <ExponentialDistributionWorkedExample
        lambda={lambda}
        t={t}
        pdfValue={pdfAtT}
        cdfValue={cdfAtT}
        mean={meanValue}
        variance={variance}
      />
    </div>
  );
  
  const rightPanel = (
    <div className="space-y-4">
      <div className="bg-gray-900/50 p-6 rounded-lg" style={{ height: '450px' }}>
        <svg ref={svgRef}></svg>
      </div>
      {showMemoryless && (
        <div className="bg-gray-900/50 p-6 rounded-lg" style={{ height: '350px' }}>
          <h3 className="text-sm font-bold text-white mb-4">Memoryless Property Visualization</h3>
          <svg ref={memorylessSvgRef}></svg>
        </div>
      )}
    </div>
  );
  
  return <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />;
});

export { ExponentialDistribution };