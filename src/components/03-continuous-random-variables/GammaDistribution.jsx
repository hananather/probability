"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { createColorScheme, typography } from "../../lib/design-system";
import { jStat } from "jstat";
import { GammaDistributionWorkedExample } from "./GammaDistributionWorkedExample";

const GammaDistribution = React.memo(function GammaDistribution() {
  // Core parameter states
  const [shape, setShape] = useState(2); // k or alpha
  const [rate, setRate] = useState(1); // theta or beta
  const [showCDF, setShowCDF] = useState(false);
  const [showExponentialSum, setShowExponentialSum] = useState(false);
  const [numExponentials, setNumExponentials] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Refs for D3
  const svgRef = useRef(null);
  const sumSvgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Color scheme
  const colors = createColorScheme('inference');
  
  // Ensure rate is positive to avoid division by zero
  const safeRate = Math.max(0.001, rate);
  
  // Calculate distribution properties
  const scale = 1 / safeRate; // scale parameter
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const mode = shape > 1 ? (shape - 1) * scale : 0;
  const stdDev = Math.sqrt(variance);
  
  // Track interactions
  useEffect(() => {
    setInteractionCount(prev => prev + 1);
  }, [shape, rate, showCDF, showExponentialSum, numExponentials]);
  
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
    
    // X scale - adjust based on distribution parameters
    const xMax = Math.min(20, mean + 4 * stdDev);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Generate data points
    const data = [];
    const step = xMax / 300;
    let yMax = 0;
    
    for (let i = 0; i <= xMax; i += step) {
      let yValue;
      if (showCDF) {
        yValue = jStat.gamma.cdf(i, shape, scale);
      } else {
        yValue = jStat.gamma.pdf(i, shape, scale);
      }
      if (!isNaN(yValue) && isFinite(yValue)) {
        data.push({ x: i, y: yValue });
        if (!showCDF) yMax = Math.max(yMax, yValue);
      }
    }
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, showCDF ? 1.1 : yMax * 1.1])
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
      .text("x");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text(showCDF ? "F(x) = P(X ≤ x)" : "f(x)");
    
    // Draw the curve with glow effect
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    // Add glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
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
      .attr("stroke-width", 5)
      .attr("opacity", 0.3)
      .attr("filter", "url(#glow)")
      .attr("d", line);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors.chart.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate the path
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
    
    // Add mean line
    if (mean <= xMax) {
      g.append("line")
        .attr("x1", x(mean))
        .attr("x2", x(mean))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "10,5")
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", x(mean))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.secondary)
        .style("font-size", "12px")
        .text(`μ = ${mean.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .attr("opacity", 1);
    }
    
    // Add mode line for shape > 1
    if (shape > 1 && mode <= xMax) {
      g.append("line")
        .attr("x1", x(mode))
        .attr("x2", x(mode))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .delay(1200)
        .attr("opacity", 1);
      
      g.append("text")
        .attr("x", x(mode))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.tertiary)
        .style("font-size", "12px")
        .text(`mode = ${mode.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .delay(1200)
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
      .attr("width", 200)
      .attr("height", 70)
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
      .text(`Gamma(k=${shape}, θ=${scale.toFixed(2)})`);
    
    labelGroup.append("text")
      .attr("x", 20)
      .attr("y", 50)
      .attr("fill", colors.chart.secondary)
      .style("font-size", "12px")
      .style("opacity", 0.9)
      .text(showCDF ? "Cumulative Distribution" : "Probability Density");
    
    // Special case labels with fade-in animation
    if (Math.abs(shape - 1) < 0.01) {
      labelGroup.append("text")
        .attr("x", 20)
        .attr("y", 70)
        .attr("fill", colors.chart.accent)
        .style("font-size", "11px")
        .style("font-style", "italic")
        .style("opacity", 0)
        .text("≈ Exponential(λ=" + rate.toFixed(2) + ")")
        .transition()
        .duration(500)
        .style("opacity", 0.8);
    } else if (shape % 1 === 0 && Math.abs(scale - 2) < 0.01) {
      labelGroup.append("text")
        .attr("x", 20)
        .attr("y", 70)
        .attr("fill", colors.chart.accent)
        .style("font-size", "11px")
        .style("font-style", "italic")
        .style("opacity", 0)
        .text("= χ²(df=" + (2 * shape) + ")")
        .transition()
        .duration(500)
        .style("opacity", 0.8);
    }
    
    // Cleanup D3 transitions on unmount
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").interrupt();
      }
    };
  }, [shape, rate, scale, showCDF, mean, mode, stdDev, colors, safeRate]);
  
  // Sum of exponentials visualization
  useEffect(() => {
    if (!sumSvgRef.current || !showExponentialSum) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(sumSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(sumSvgRef.current)
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
    
    // Simulate sum of exponentials
    const simulateSumOfExponentials = () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      
      setIsAnimating(true);
      let samples = [];
      const targetSamples = 500;
      
      animationRef.current = setInterval(() => {
        // Generate sum of exponentials
        let sum = 0;
        for (let i = 0; i < numExponentials; i++) {
          // Prevent Math.log(0) by ensuring random is not exactly 1
          const random = Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, Math.random()));
          sum += -Math.log(1 - random) / safeRate;
        }
        samples.push(sum);
        
        if (samples.length >= targetSamples) {
          clearInterval(animationRef.current);
          setIsAnimating(false);
        }
        
        // Update histogram
        updateHistogram(samples);
      }, 20);
    };
    
    const updateHistogram = (samples) => {
      g.selectAll(".histogram-bar").remove();
      g.selectAll(".overlay-curve").remove();
      
      const xMax = Math.max(...samples) * 1.2;
      const x = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, width]);
      
      // Create bins
      const bins = d3.histogram()
        .domain([0, xMax])
        .thresholds(30)(samples);
      
      const yMax = d3.max(bins, d => d.length / samples.length);
      const y = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);
      
      // Draw histogram bars
      g.selectAll(".histogram-bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "histogram-bar")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length / samples.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length / samples.length))
        .attr("fill", colors.chart.primary)
        .attr("opacity", 0.6);
      
      // Overlay theoretical Gamma PDF
      const gammaData = [];
      const step = xMax / 200;
      for (let i = 0; i <= xMax; i += step) {
        const binWidth = xMax / 30;
        const pdfValue = jStat.gamma.pdf(i, numExponentials, 1/safeRate) * binWidth;
        gammaData.push({ x: i, y: pdfValue });
      }
      
      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(gammaData)
        .attr("class", "overlay-curve")
        .attr("fill", "none")
        .attr("stroke", colors.chart.accent)
        .attr("stroke-width", 3)
        .attr("d", line);
      
      // Update axes
      g.selectAll(".x-axis").remove();
      g.selectAll(".y-axis").remove();
      
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));
    };
    
    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .text(`Sum of ${numExponentials} Exponential(${rate}) Random Variables`);
    
    // Start simulation
    simulateSumOfExponentials();
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
    
  }, [showExponentialSum, numExponentials, rate, colors, safeRate]);
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);
  
  // Educational insights based on interaction count
  const getInsights = () => {
    if (interactionCount === 0) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Gamma Distribution
          </h3>
          <p className={typography.description}>
            The Gamma distribution generalizes the exponential distribution. It models the time 
            until the k-th event in a Poisson process. Special cases include the exponential 
            and chi-squared distributions!
          </p>
          <div className="mt-3 p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300">
              🎯 Goal: Explore 20+ parameter combinations to master the Gamma distribution!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 5) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Understanding Shape and Rate
          </h3>
          <p className={typography.description}>
            Try these special cases:
          </p>
          <ul className="text-xs text-gray-300 space-y-1 mt-2">
            <li>• k = 1: Reduces to Exponential(θ)</li>
            <li>• k = n/2, θ = 2: Chi-squared with n degrees of freedom</li>
            <li>• Larger k: More bell-shaped, approaches normal</li>
          </ul>
          <div className="mt-3 p-3 bg-indigo-900/30 border border-indigo-600/30 rounded">
            <div className="text-xs text-indigo-300">
              💡 Tip: Shape k controls the form, rate θ controls the scale!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 19) {
      const progress = ((interactionCount - 5) / 15) * 100;
      return (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">
            Connection to Exponentials
          </h3>
          <p className={typography.description}>
            Enable "Show Sum of Exponentials" to see an amazing fact:
          </p>
          <p className="text-xs text-purple-300 mt-2 font-mono">
            If X₁, X₂, ..., Xₖ are independent Exponential(λ), then their sum 
            X₁ + X₂ + ... + Xₖ ~ Gamma(k, 1/λ)
          </p>
          <p className="text-sm text-gray-300 mt-2">
            This is why Gamma models the wait time to the k-th event!
          </p>
          <div className="mt-3 p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300 mb-2">
              🎯 Progress: Explore different shape parameters!
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
            ✨ Gamma Distribution Master!
          </h3>
          <p className={typography.description}>
            You've explored the versatile Gamma distribution! Key insights:
          </p>
          <ul className="text-xs text-gray-300 space-y-1 mt-2">
            <li>• Models wait time to k-th event in Poisson process</li>
            <li>• Sum of k exponentials gives Gamma(k, θ)</li>
            <li>• Special cases: Exponential (k=1), Chi-squared (θ=2)</li>
            <li>• Mean = kθ, Variance = kθ²</li>
          </ul>
          <div className="mt-3 p-3 bg-gradient-to-br from-emerald-900/20 to-emerald-900/10 border border-emerald-600/30 rounded">
            <p className="text-xs text-emerald-300 font-semibold mb-2">
              🔧 Engineering Example:
            </p>
            <p className="text-xs text-emerald-200">
              A system requires 3 components to fail before replacement. If each component 
              has exponential lifetime with mean 2 years, the system lifetime follows 
              Gamma(3, 2) with mean 6 years. Critical for maintenance scheduling!
            </p>
          </div>
        </div>
      );
    }
  };
  
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h2 className={typography.h2}>Gamma Distribution</h2>
        <p className={typography.description}>
          Explore the Gamma distribution, a flexible family that includes the exponential and 
          chi-squared distributions as special cases. Discover its connection to Poisson processes 
          and sums of exponential random variables.
        </p>
      </div>
      
      <div className="space-y-4">
        <RangeSlider
          label="Shape parameter (k)"
          value={shape}
          onChange={setShape}
          min={0.5}
          max={10}
          step={0.5}
          color="teal"
        />
        
        <RangeSlider
          label="Rate parameter (θ)"
          value={rate}
          onChange={setRate}
          min={0.2}
          max={3}
          step={0.1}
          color="orange"
        />
        
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showCDF}
              onChange={(e) => setShowCDF(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show CDF</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showExponentialSum}
              onChange={(e) => setShowExponentialSum(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Show Sum of Exponentials</span>
          </label>
        </div>
        
        {showExponentialSum && (
          <RangeSlider
            label="Number of exponentials"
            value={numExponentials}
            onChange={setNumExponentials}
            min={1}
            max={10}
            step={1}
            color="yellow"
          />
        )}
      </div>
      
      <div className="p-3 bg-gray-800/30 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-white">Distribution Properties</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">Mean (μ):</span>
            <span className="ml-2 font-mono text-emerald-400">{mean.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Variance (σ²):</span>
            <span className="ml-2 font-mono text-purple-400">{variance.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400">Std Dev (σ):</span>
            <span className="ml-2 font-mono text-amber-400">{stdDev.toFixed(3)}</span>
          </div>
          {shape > 1 && (
            <div>
              <span className="text-gray-400">Mode:</span>
              <span className="ml-2 font-mono text-cyan-400">{mode.toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Special Cases</h3>
        <div className="space-y-2 text-xs">
          <div className={`p-2.5 rounded-lg transition-all duration-300 ${Math.abs(shape - 1) < 0.01 ? 'bg-gradient-to-br from-teal-900/30 to-teal-900/20 border border-teal-600/30 shadow-sm shadow-teal-600/20' : 'opacity-50'}`}>
            <span className="text-gray-300 font-medium">Exponential(λ={rate.toFixed(2)})</span>
            <span className="ml-2 text-gray-400">when k = 1</span>
          </div>
          <div className={`p-2.5 rounded-lg transition-all duration-300 ${shape % 1 === 0 && Math.abs(scale - 2) < 0.01 ? 'bg-gradient-to-br from-orange-900/30 to-orange-900/20 border border-orange-600/30 shadow-sm shadow-orange-600/20' : 'opacity-50'}`}>
            <span className="text-gray-300 font-medium">χ²(df={(2 * shape).toFixed(0)})</span>
            <span className="ml-2 text-gray-400">when k = n/2, θ = 2</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        {getInsights()}
      </div>
      
      <GammaDistributionWorkedExample
        shape={shape}
        rate={rate}
        scale={scale}
        mean={mean}
        variance={variance}
        mode={mode}
      />
    </div>
  );
  
  const rightPanel = (
    <div className="space-y-4">
      <div className="bg-gray-900/50 p-6 rounded-lg" style={{ height: '450px' }}>
        <svg ref={svgRef}></svg>
      </div>
      {showExponentialSum && (
        <div className="bg-gray-900/50 p-6 rounded-lg" style={{ height: '350px' }}>
          <h3 className="text-sm font-bold text-white mb-4">
            Sum of Exponentials Simulation
            {isAnimating && <span className="ml-2 text-xs text-amber-400 animate-pulse">(Simulating...)</span>}
          </h3>
          <svg ref={sumSvgRef}></svg>
        </div>
      )}
    </div>
  );
  
  return <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />;
});

export { GammaDistribution };