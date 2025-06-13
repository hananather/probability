"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { createColorScheme, typography } from "../../lib/design-system";
import { jStat } from "jstat";
import { GammaDistributionWorkedExample } from "./3-5-2-GammaDistributionWorkedExample";
import { ChevronDown, ChevronRight, AlertCircle, TrendingUp, Package, Heart, Cloud } from "lucide-react";

const GammaDistribution = React.memo(function GammaDistribution() {
  // Core parameter states - Start with integer k for easier understanding
  const [shape, setShape] = useState(3); // k or alpha - start with integer
  const [rate, setRate] = useState(0.5); // λ parameter (1/θ scale parameter)
  const [showCDF, setShowCDF] = useState(false);
  const [showExponentialSum, setShowExponentialSum] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentStage, setCurrentStage] = useState(1); // Progressive learning stages
  const [isAnimating, setIsAnimating] = useState(false);
  const [storyPhase, setStoryPhase] = useState(0);
  
  // Animation states for insurance story
  const [claims, setClaims] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showingStory, setShowingStory] = useState(true);
  
  // Add cleanup tracking
  const activeTimeouts = useRef([]);
  const activeAnimations = useRef([]);
  
  // Refs for D3
  const svgRef = useRef(null);
  const storySvgRef = useRef(null);
  const sumSvgRef = useRef(null);
  const animationRef = useRef(null);
  const storyAnimationRef = useRef(null);
  
  // Color scheme
  const colors = createColorScheme('inference');
  
  // Ensure rate is positive to avoid division by zero
  const safeRate = Math.max(0.001, rate);
  const scale = 1 / safeRate; // θ = 1/λ
  
  // Calculate distribution properties
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const mode = shape > 1 ? (shape - 1) * scale : 0;
  const stdDev = Math.sqrt(variance);
  
  // Track meaningful interactions with debouncing
  const lastParamUpdate = useRef({ shape, rate });
  useEffect(() => {
    const hasShapeChanged = Math.abs(shape - lastParamUpdate.current.shape) > 0.05;
    const hasRateChanged = Math.abs(rate - lastParamUpdate.current.rate) > 0.05;
    
    if ((hasShapeChanged || hasRateChanged) && interactionCount > 0) {
      setInteractionCount(prev => prev + 1);
      lastParamUpdate.current = { shape, rate };
    }
  }, [shape, rate, interactionCount]);
  
  // Track other interactions
  useEffect(() => {
    if (interactionCount > 0) {
      setInteractionCount(prev => prev + 1);
    }
  }, [showCDF, showExponentialSum]);
  
  // Progress through stages based on interactions
  useEffect(() => {
    if (interactionCount === 1) {
      setShowingStory(true);
      setStoryPhase(1);
    } else if (interactionCount > 5 && currentStage === 1) {
      setCurrentStage(2);
    } else if (interactionCount > 15 && currentStage === 2) {
      setCurrentStage(3);
    }
  }, [interactionCount, currentStage]);
  
  // Insurance claim story animation
  useEffect(() => {
    if (!storySvgRef.current || !showingStory || storyPhase === 0) return;
    
    const svg = d3.select(storySvgRef.current);
    const width = 700;
    const height = 200;
    
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a")
      .attr("rx", 8);
    
    const g = svg.append("g");
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.primary)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text("Insurance Claims Arriving Over Time");
    
    // Animate claims arriving
    if (storyPhase === 1) {
      let claimData = [];
      let currentTime = 0;
      const avgClaimSize = 5000;
      
      const animateClaims = () => {
        const waitTime = -Math.log(1 - Math.random()) / safeRate;
        currentTime += waitTime;
        
        if (currentTime < 10 && claimData.length < shape) {
          const claimSize = avgClaimSize * (0.5 + Math.random() * 1.5);
          claimData.push({
            time: currentTime,
            size: claimSize,
            id: claimData.length
          });
          
          setClaims(claimData);
          setTotalCost(claimData.reduce((sum, c) => sum + c.size, 0));
          
          // Draw claims
          const xScale = d3.scaleLinear()
            .domain([0, 10])
            .range([50, width - 50]);
          
          const claims = g.selectAll(".claim")
            .data(claimData, d => d.id);
          
          const newClaims = claims.enter()
            .append("g")
            .attr("class", "claim");
          
          newClaims.append("circle")
            .attr("cx", d => xScale(d.time))
            .attr("cy", height / 2)
            .attr("r", 0)
            .attr("fill", colors.chart.secondary)
            .attr("opacity", 0.8)
            .transition()
            .duration(500)
            .attr("r", d => Math.sqrt(d.size / 100));
          
          newClaims.append("text")
            .attr("x", d => xScale(d.time))
            .attr("y", height / 2 + 40)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.secondary)
            .style("font-size", "11px")
            .style("font-family", "monospace")
            .text(d => `$${(d.size / 1000).toFixed(1)}k`)
            .attr("opacity", 0)
            .transition()
            .delay(300)
            .duration(300)
            .attr("opacity", 1);
          
          // Timeline
          g.append("line")
            .attr("x1", 50)
            .attr("x2", width - 50)
            .attr("y1", height - 40)
            .attr("y2", height - 40)
            .attr("stroke", colors.chart.grid)
            .attr("stroke-width", 2);
          
          // Total cost display
          g.selectAll(".total-text").remove();
          g.append("text")
            .attr("class", "total-text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.accent)
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text(`Total Claims: $${(totalCost / 1000).toFixed(1)}k after ${claimData.length} claims`);
          
          if (claimData.length < shape) {
            const timeoutId = setTimeout(animateClaims, 1500);
            storyAnimationRef.current = timeoutId;
            activeTimeouts.current.push(timeoutId);
          } else {
            setStoryPhase(2);
          }
        }
      };
      
      const initialTimeout = setTimeout(animateClaims, 1000);
      storyAnimationRef.current = initialTimeout;
      activeTimeouts.current.push(initialTimeout);
    }
    
    return () => {
      // Clean up all timeouts
      activeTimeouts.current.forEach(timeout => clearTimeout(timeout));
      activeTimeouts.current = [];
      if (storyAnimationRef.current) {
        clearTimeout(storyAnimationRef.current);
        storyAnimationRef.current = null;
      }
    };
  }, [showingStory, storyPhase, shape, safeRate, colors]);
  
  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // Dark background
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale - adjust based on distribution parameters
    const xMax = Math.min(30, mean + 4 * stdDev);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Generate data points with error handling
    const data = [];
    const step = xMax / 400;
    let yMax = 0;
    
    try {
      for (let i = 0; i <= xMax; i += step) {
        let yValue;
        if (showCDF) {
          yValue = jStat.gamma.cdf(i, shape, scale);
        } else {
          yValue = jStat.gamma.pdf(i, shape, scale);
        }
        if (!isNaN(yValue) && isFinite(yValue) && yValue >= 0) {
          data.push({ x: i, y: yValue });
          if (!showCDF) yMax = Math.max(yMax, yValue);
        }
      }
    } catch (error) {
      // Silent error: Error calculating gamma distribution
      // Return empty data on error
      return;
    }
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, showCDF ? 1.1 : yMax * 1.1])
      .range([height, 0]);
    
    // Grid lines - subtle
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1)
      .style("stroke", colors.chart.grid);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1)
      .style("stroke", colors.chart.grid);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .style("font-size", "12px")
      .append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text(showingStory && storyPhase < 2 ? "Total Claim Amount ($1000s)" : "x");
    
    g.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .style("font-size", "12px")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text(showCDF ? "F(x) = P(X ≤ x)" : "Probability Density f(x)");
    
    // Area under curve (for PDF only)
    if (!showCDF) {
      const area = d3.area()
        .x(d => x(d.x))
        .y0(height)
        .y1(d => y(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(data)
        .attr("fill", colors.chart.primary)
        .attr("opacity", 0.15)
        .attr("d", area);
    }
    
    // Draw the main curve
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
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
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr("stroke-dashoffset", 0);
    
    // Add mean line
    if (mean <= xMax) {
      const meanGroup = g.append("g")
        .attr("opacity", 0);
      
      meanGroup.append("line")
        .attr("x1", x(mean))
        .attr("x2", x(mean))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3");
      
      meanGroup.append("text")
        .attr("x", x(mean))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.secondary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`μ = ${mean.toFixed(1)}`);
      
      meanGroup.transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 1);
    }
    
    // Add mode line for shape > 1
    if (shape > 1 && mode <= xMax) {
      const modeGroup = g.append("g")
        .attr("opacity", 0);
      
      modeGroup.append("line")
        .attr("x1", x(mode))
        .attr("x2", x(mode))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", colors.chart.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
      
      modeGroup.append("text")
        .attr("x", x(mode))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.tertiary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`mode = ${mode.toFixed(1)}`);
      
      modeGroup.transition()
        .delay(1200)
        .duration(500)
        .attr("opacity", 1);
    }
    
  }, [shape, rate, scale, showCDF, mean, mode, stdDev, colors, showingStory, storyPhase]);
  
  // Sum of exponentials visualization
  useEffect(() => {
    if (!sumSvgRef.current || !showExponentialSum) return;
    
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(sumSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(sumSvgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // Dark background
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(`Sum of ${Math.floor(shape)} Exponential(λ=${rate.toFixed(2)}) Random Variables`);
    
    // Simulate sum of exponentials
    const simulateSumOfExponentials = () => {
      setIsAnimating(true);
      let samples = [];
      const targetSamples = 1000;
      let sampleCount = 0;
      
      const addSamples = () => {
        // Add samples in batches for smooth animation
        for (let i = 0; i < 20; i++) {
          if (sampleCount >= targetSamples) {
            setIsAnimating(false);
            return;
          }
          
          // Generate sum of exponentials with validation
          let sum = 0;
          const shapeInt = Math.floor(shape);
          if (shapeInt > 0 && shapeInt <= 100) { // Limit shape to prevent excessive computation
            for (let j = 0; j < shapeInt; j++) {
              sum += -Math.log(1 - Math.random()) / safeRate;
            }
            samples.push(sum);
            sampleCount++;
          }
        }
        
        // Update histogram
        updateHistogram(samples);
        
        if (sampleCount < targetSamples) {
          const animId = requestAnimationFrame(addSamples);
          animationRef.current = animId;
          activeAnimations.current.push(animId);
        }
      };
      
      const updateHistogram = (samples) => {
        g.selectAll(".bar").remove();
        g.selectAll(".overlay-curve").remove();
        g.selectAll(".legend").remove();
        
        if (samples.length === 0) return;
        
        const xMax = Math.max(...samples) * 1.1;
        const xScale = d3.scaleLinear()
          .domain([0, xMax])
          .range([0, width]);
        
        // Create bins
        const bins = d3.histogram()
          .domain([0, xMax])
          .thresholds(40)(samples);
        
        const yMax = d3.max(bins, d => d.length);
        const yScale = d3.scaleLinear()
          .domain([0, yMax])
          .range([height, 0]);
        
        // Draw histogram bars
        g.selectAll(".bar")
          .data(bins)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.x0))
          .attr("y", d => yScale(d.length))
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
          .attr("height", d => height - yScale(d.length))
          .attr("fill", colors.chart.primary)
          .attr("opacity", 0.6);
        
        // Overlay theoretical Gamma PDF
        const gammaData = [];
        const step = xMax / 300;
        for (let i = 0; i <= xMax; i += step) {
          const binWidth = xMax / 40;
          const scaledPdf = jStat.gamma.pdf(i, Math.floor(shape), scale) * samples.length * binWidth;
          gammaData.push({ x: i, y: scaledPdf });
        }
        
        const line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
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
          .call(d3.axisBottom(xScale).tickSizeOuter(0))
          .style("font-size", "12px");
        
        g.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(yScale).tickSizeOuter(0))
          .style("font-size", "12px");
        
        // Legend
        const legend = g.append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${width - 200}, 20)`);
        
        legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", colors.chart.primary)
          .attr("opacity", 0.6);
        
        legend.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("fill", "white")
          .style("font-size", "12px")
          .text("Simulated Sum");
        
        legend.append("line")
          .attr("x1", 0)
          .attr("x2", 15)
          .attr("y1", 30)
          .attr("y2", 30)
          .attr("stroke", colors.chart.accent)
          .attr("stroke-width", 3);
        
        legend.append("text")
          .attr("x", 20)
          .attr("y", 34)
          .attr("fill", "white")
          .style("font-size", "12px")
          .text(`Gamma(${Math.floor(shape)}, ${scale.toFixed(2)})`);
      };
      
      addSamples();
    };
    
    // Start simulation
    simulateSumOfExponentials();
    
    return () => {
      // Clean up all animations
      activeAnimations.current.forEach(anim => cancelAnimationFrame(anim));
      activeAnimations.current = [];
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [showExponentialSum, shape, rate, scale, colors, safeRate]);
  
  // Educational insights with progressive complexity
  const getInsights = () => {
    if (interactionCount === 0) {
      return (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-teal-100">
            🏢 How do insurance companies predict total claim costs?
          </h3>
          <p className="text-sm text-gray-300">
            Imagine you're an insurance company. Claims arrive randomly over time, and each 
            claim has a different cost. How can you predict the total cost after a certain 
            number of claims?
          </p>
          <div className="p-3 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border border-teal-600/30 rounded-lg">
            <p className="text-xs text-teal-300 font-medium">
              🎯 Start by adjusting the parameters to see claims arrive!
            </p>
          </div>
        </div>
      );
    } else if (showingStory && storyPhase < 2) {
      return (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-orange-100">
            📊 Watch the pattern emerge...
          </h3>
          <p className="text-sm text-gray-300">
            Each claim arrives after a random wait time (exponentially distributed). 
            The total cost after k claims follows a Gamma distribution!
          </p>
          <div className="p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
            <p className="text-xs text-orange-300">
              💡 The Gamma models the sum of k exponential wait times
            </p>
          </div>
        </div>
      );
    } else if (currentStage === 1) {
      const progress = Math.min(100, (interactionCount / 5) * 100);
      return (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-white">
            📈 Stage 1: Integer Shape Parameters
          </h3>
          <p className="text-sm text-gray-300">
            When k is a whole number, Gamma(k, θ) represents the sum of k independent 
            exponential random variables. Try k = 1, 2, 3, 4...
          </p>
          <ul className="text-xs text-gray-400 space-y-1 mt-2">
            <li>• k = 1: Just an exponential distribution!</li>
            <li>• k = 2: Sum of 2 exponentials</li>
            <li>• k ≥ 3: Starts looking bell-shaped</li>
          </ul>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress to Stage 2</span>
              <span className="font-mono">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      );
    } else if (currentStage === 2) {
      const progress = Math.min(100, ((interactionCount - 5) / 10) * 100);
      return (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-purple-100">
            🔬 Stage 2: Fractional Shape Parameters
          </h3>
          <p className="text-sm text-gray-300">
            The Gamma distribution works for any positive k! Try k = 0.5, 1.5, 2.5...
          </p>
          <div className="mt-2 p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
            <p className="text-xs text-purple-300 mb-2">
              ✨ Enable "Show Sum of Exponentials" to see the connection!
            </p>
            <p className="text-xs text-purple-200 font-mono">
              Gamma(k, θ) = Sum of k Exponential(1/θ) variables
            </p>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress to Stage 3</span>
              <span className="font-mono">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-emerald-100">
            ✨ Stage 3: Special Cases & Applications
          </h3>
          <div className="space-y-2">
            <div className={`p-2.5 rounded-lg transition-all duration-300 ${
              Math.abs(shape - 1) < 0.01 
                ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-900/20 border border-emerald-600/30' 
                : 'opacity-60'
            }`}>
              <p className="text-xs text-emerald-300 font-medium">
                📊 Exponential Distribution
              </p>
              <p className="text-xs text-gray-400">k = 1 → Single event wait time</p>
            </div>
            
            <div className={`p-2.5 rounded-lg transition-all duration-300 ${
              shape % 1 === 0 && Math.abs(scale - 2) < 0.01 
                ? 'bg-gradient-to-br from-amber-900/30 to-amber-900/20 border border-amber-600/30' 
                : 'opacity-60'
            }`}>
              <p className="text-xs text-amber-300 font-medium">
                📈 Chi-Squared Distribution
              </p>
              <p className="text-xs text-gray-400">k = n/2, θ = 2 → χ²(n) distribution</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-bold text-cyan-100">🏭 Industry Applications:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-800/50 rounded flex items-start gap-2">
                <Package className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-200">Manufacturing</p>
                  <p className="text-xs text-gray-400">Multi-stage process times</p>
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded flex items-start gap-2">
                <Heart className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-200">Healthcare</p>
                  <p className="text-xs text-gray-400">Recovery time modeling</p>
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded flex items-start gap-2">
                <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-200">Insurance</p>
                  <p className="text-xs text-gray-400">Total claim predictions</p>
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded flex items-start gap-2">
                <Cloud className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-cyan-200">Environment</p>
                  <p className="text-xs text-gray-400">Rainfall amount models</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  const leftPanel = (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white mb-2">
          Gamma Distribution Explorer
        </h2>
        <p className="text-sm text-gray-300">
          Discover how the Gamma distribution models waiting times and insurance claims 
          through interactive exploration.
        </p>
      </div>
      
      {/* Insurance Story Visualization */}
      {showingStory && storyPhase > 0 && (
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <svg ref={storySvgRef}></svg>
          {storyPhase === 2 && (
            <button
              onClick={() => {
                setShowingStory(false);
                setInteractionCount(prev => prev + 1);
              }}
              className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white 
                       rounded-lg text-sm font-medium hover:from-teal-500 hover:to-cyan-500 
                       transition-all duration-200"
            >
              Continue to Distribution Explorer →
            </button>
          )}
        </div>
      )}
      
      {/* Main Controls - Single Row Layout */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <RangeSlider
            label={`Shape (k) ${currentStage === 1 ? '[integers]' : ''}`}
            value={shape}
            onChange={setShape}
            min={currentStage === 1 ? 1 : 0.5}
            max={currentStage === 1 ? 6 : 10}
            step={currentStage === 1 ? 1 : 0.5}
            color="teal"
          />
          
          <RangeSlider
            label="Rate (λ)"
            value={rate}
            onChange={setRate}
            min={0.2}
            max={2}
            step={0.1}
            color="orange"
          />
        </div>
        
        {/* Compact Options Row */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showCDF}
              onChange={(e) => setShowCDF(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">CDF</span>
          </label>
          
          {currentStage >= 2 && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showExponentialSum}
                onChange={(e) => setShowExponentialSum(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Sum of Exponentials
              </span>
            </label>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Advanced
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Distribution Properties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/30 p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Properties</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Mean</span>
              <span className="font-mono text-emerald-400">{mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Variance</span>
              <span className="font-mono text-purple-400">{variance.toFixed(2)}</span>
            </div>
            {shape > 1 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="font-mono text-amber-400">{mode.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Parameters</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Scale (θ)</span>
              <span className="font-mono text-cyan-400">{scale.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Std Dev</span>
              <span className="font-mono text-yellow-400">{stdDev.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Options (Collapsible) */}
      {showAdvanced && (
        <div className="animate-fadeIn space-y-3 p-3 bg-gray-800/20 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-400">Advanced Features</h4>
          <div className="text-xs text-gray-300 space-y-2">
            <p>• Compare with exponential (k=1) and chi-squared (k=n/2, θ=2)</p>
            <p>• Explore connection to Poisson processes</p>
            <p>• See Central Limit Theorem as k increases</p>
          </div>
        </div>
      )}
      
      {/* Educational Insights */}
      <div className="mt-4">
        {getInsights()}
      </div>
      
      {/* Worked Example */}
      {currentStage >= 2 && (
        <GammaDistributionWorkedExample
          initialShape={shape}
          initialRate={rate}
        />
      )}
    </div>
  );
  
  const rightPanel = (
    <div className="space-y-4">
      {/* Main Visualization - 85% of space */}
      <div className="bg-gray-900/50 p-4 rounded-lg" style={{ minHeight: '550px' }}>
        <svg ref={svgRef}></svg>
      </div>
      
      {/* Sum of Exponentials Visualization */}
      {showExponentialSum && (
        <div className="bg-gray-900/50 p-4 rounded-lg animate-fadeIn" style={{ minHeight: '450px' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">
              Gamma as Sum of Exponentials
            </h3>
            {isAnimating && (
              <span className="text-xs text-amber-400 animate-pulse">
                Generating samples...
              </span>
            )}
          </div>
          <svg ref={sumSvgRef}></svg>
        </div>
      )}
    </div>
  );
  
  return <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />;
});

export { GammaDistribution };