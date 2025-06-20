"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { VisualizationContainer, GraphContainer, VisualizationSection } from "../ui/VisualizationContainer";
import { createColorScheme, cn, typography, colors } from "../../lib/design-system";
import { Button } from "../ui/button";
import { RangeSlider } from "../ui/RangeSlider";
import { FDistributionWorkedExample } from "./4-5-2-FDistributionWorkedExample";

// Constants
const MAX_STORED_VALUES = 1000; // Prevent memory issues
const HISTOGRAM_BINS = 30;
const CRITICAL_VALUES = {
  0.1: { label: '90%', color: '#f59e0b' },
  0.05: { label: '95%', color: '#ef4444' },
  0.01: { label: '99%', color: '#dc2626' }
};

// Animation timing formula from CLAUDE.md
const getAnimationDuration = (n) => {
  return n <= 5 ? 500 : (n <= 10 ? 350 : 250);
};

// Helper function for color classes
const getColorClasses = (scheme) => {
  const colorMap = {
    hypothesis: {
      bg: 'bg-teal-900/20',
      border: 'border-teal-600/30',
      primary: 'text-teal-400',
      secondary: 'text-teal-300'
    },
    probability: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-600/30',
      primary: 'text-blue-400',
      secondary: 'text-blue-300'
    },
    estimation: {
      bg: 'bg-violet-900/20',
      border: 'border-violet-600/30',
      primary: 'text-violet-400',
      secondary: 'text-violet-300'
    }
  };
  return colorMap[scheme] || colorMap.hypothesis;
};

const FDistributionExplorer = () => {
  // State management
  const [sampleSizeN1, setSampleSizeN1] = useState(10);
  const [sampleSizeN2, setSampleSizeN2] = useState(10);
  const [simulatedFValues, setSimulatedFValues] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedF, setLastGeneratedF] = useState(null);
  const [showCriticalValues, setShowCriticalValues] = useState(false);
  const [showVarianceDetails, setShowVarianceDetails] = useState(false);
  const [animationRef, setAnimationRef] = useState(null);
  
  // Refs for D3 and animations
  const svgRef = useRef(null);
  const localFValuesRef = useRef([]);
  const animationIdRef = useRef(null);
  const isCancelledRef = useRef(false);
  
  // Calculate degrees of freedom
  const df1 = sampleSizeN1 - 1;
  const df2 = sampleSizeN2 - 1;
  
  // Color scheme
  const colorScheme = createColorScheme('hypothesis');
  const colorClasses = getColorClasses('hypothesis');
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (animationIdRef.current) {
        clearTimeout(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []);
  
  // Generate a single F-statistic
  const generateSingleFStatistic = useCallback(() => {
    // Generate samples from standard normal
    const sample1 = Array.from({ length: sampleSizeN1 }, () => jStat.normal.sample(0, 1));
    const sample2 = Array.from({ length: sampleSizeN2 }, () => jStat.normal.sample(0, 1));
    
    // Calculate sample variances
    const variance1 = jStat.variance(sample1, true); // true for sample variance
    const variance2 = jStat.variance(sample2, true);
    
    // Calculate F-statistic
    const fStatistic = variance1 / variance2;
    
    return fStatistic;
  }, [sampleSizeN1, sampleSizeN2]);
  
  // Generate single F-statistic with animation
  const handleGenerateSingle = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const fValue = generateSingleFStatistic();
    
    // Memory management - limit stored values
    if (localFValuesRef.current.length >= MAX_STORED_VALUES) {
      localFValuesRef.current = localFValuesRef.current.slice(-MAX_STORED_VALUES + 1);
    }
    
    // Update local ref first for animation
    localFValuesRef.current = [...localFValuesRef.current, fValue];
    setLastGeneratedF(fValue);
    
    // Update React state after a short delay
    const timeoutId = setTimeout(() => {
      setSimulatedFValues(prev => {
        if (prev.length >= MAX_STORED_VALUES) {
          return [...prev.slice(-MAX_STORED_VALUES + 1), fValue];
        }
        return [...prev, fValue];
      });
      setIsGenerating(false);
    }, getAnimationDuration(simulatedFValues.length));
    
    animationIdRef.current = timeoutId;
  }, [generateSingleFStatistic, isGenerating, simulatedFValues.length]);
  
  // Generate many F-statistics
  const handleGenerateMany = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    isCancelledRef.current = false;
    const numSamples = 100;
    const newFValues = [];
    
    for (let i = 0; i < numSamples; i++) {
      newFValues.push(generateSingleFStatistic());
    }
    
    // Animate addition of values
    const animateAddition = (index) => {
      if (isCancelledRef.current || index >= newFValues.length) {
        if (!isCancelledRef.current) {
          setSimulatedFValues(prev => {
            const combined = [...prev, ...newFValues];
            return combined.length > MAX_STORED_VALUES 
              ? combined.slice(-MAX_STORED_VALUES)
              : combined;
          });
          localFValuesRef.current = [...localFValuesRef.current, ...newFValues].slice(-MAX_STORED_VALUES);
        }
        setIsGenerating(false);
        animationIdRef.current = null;
        return;
      }
      
      // Update state incrementally for visual feedback
      setSimulatedFValues(prev => {
        const updated = [...prev, newFValues[index]];
        return updated.length > MAX_STORED_VALUES 
          ? updated.slice(-MAX_STORED_VALUES)
          : updated;
      });
      
      // Memory management for local ref
      localFValuesRef.current = [...localFValuesRef.current, newFValues[index]].slice(-MAX_STORED_VALUES);
      
      animationIdRef.current = setTimeout(() => {
        animateAddition(index + 1);
      }, Math.max(20, 200 / Math.sqrt(index + 1)));
    };
    
    animateAddition(0);
  }, [generateSingleFStatistic, isGenerating]);
  
  // Reset function
  const handleReset = useCallback(() => {
    // Cancel any ongoing animations
    isCancelledRef.current = true;
    if (animationIdRef.current) {
      clearTimeout(animationIdRef.current);
      animationIdRef.current = null;
    }
    
    // Reset state
    setSimulatedFValues([]);
    localFValuesRef.current = [];
    setLastGeneratedF(null);
    setIsGenerating(false);
  }, []);
  
  // Get insights based on current state
  const getInsights = () => {
    const count = simulatedFValues.length;
    
    if (count === 0) {
      return {
        title: "Ready to Explore the F-Distribution!",
        content: (
          <>
            <p className={cn(typography.description, "mb-2")}>
              The F-distribution is used to compare variances from two independent samples. 
              It's the ratio of two sample variances, each divided by their degrees of freedom.
            </p>
            <p className={cn(typography.description, "text-sm")}>
              🎯 <span className="font-semibold">Goal:</span> Generate F-statistics to see how the ratio 
              of sample variances follows the F-distribution with ν₁ = {df1} and ν₂ = {df2}.
            </p>
          </>
        ),
        stage: 0
      };
    } else if (count === 1) {
      return {
        title: "Your First F-Statistic!",
        content: (
          <>
            <p className={cn(typography.description, "mb-2")}>
              You generated F = {lastGeneratedF?.toFixed(3)}. This represents the ratio of two sample 
              variances: S₁²/S₂².
            </p>
            <p className={cn(typography.description, "text-sm")}>
              Notice how this single value falls on the F({df1}, {df2}) distribution curve. 
              The shape is typically skewed right, especially with small degrees of freedom.
            </p>
          </>
        ),
        stage: 1
      };
    } else if (count < 30) {
      return {
        title: "Building the Pattern",
        content: (
          <>
            <p className={cn(typography.description, "mb-2")}>
              With {count} F-statistics, you're starting to see a pattern emerge. The histogram 
              is beginning to match the theoretical F({df1}, {df2}) curve.
            </p>
            <p className={cn(typography.description, "text-sm")}>
              💡 <span className="font-semibold">Insight:</span> Most F-values cluster near 1.0 when 
              the true variances are equal, but there's a long right tail for extreme ratios.
            </p>
          </>
        ),
        stage: 2
      };
    } else {
      return {
        title: "F-Distribution Revealed!",
        content: (
          <>
            <p className={cn(typography.description, "mb-2")}>
              Excellent! With {count} F-statistics, the empirical distribution closely matches 
              the theoretical F({df1}, {df2}) distribution.
            </p>
            <p className={cn(typography.description, "text-sm")}>
              🎉 <span className="font-semibold">Achievement:</span> You've demonstrated that the 
              ratio of sample variances from normal populations follows the F-distribution. This 
              is crucial for ANOVA and variance ratio tests!
            </p>
          </>
        ),
        stage: 3
      };
    }
  };
  
  // Calculate dynamic y-axis domain based on F-distribution
  const yDomain = useMemo(() => {
    // Calculate the mode of F-distribution to find peak
    let mode = 0;
    if (df1 > 2) {
      mode = ((df1 - 2) / df1) * (df2 / (df2 + 2));
    }
    
    // Calculate peak density
    const peakDensity = jStat.centralF.pdf(mode, df1, df2);
    
    // Add 20% padding
    return [0, Math.min(2, peakDensity * 1.2)];
  }, [df1, df2]);
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const containerWidth = svgRef.current.parentElement?.offsetWidth || 800;
    const width = containerWidth;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Add gradient background
    const defs = svg.append("defs");
    const bgGradient = defs.append("linearGradient")
      .attr("id", "f-dist-bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0a0a2e");
    
    bgGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#1a0a3e");
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2a0a4e");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#f-dist-bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xMax = Math.max(6, d3.max(localFValuesRef.current) || 6, jStat.centralF.inv(0.99, df1, df2));
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(8);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", colors.chart.text)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("F-value");
    
    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", colors.chart.text)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Density");
    
    // Generate F-distribution curve points
    const xValues = d3.range(0.01, xScale.domain()[1], 0.01);
    const curveData = xValues.map(x => ({
      x: x,
      y: jStat.centralF.pdf(x, df1, df2)
    }));
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    // Draw F-distribution curve
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add critical values if enabled
    if (showCriticalValues) {
      Object.entries(CRITICAL_VALUES).forEach(([alpha, { label, color }]) => {
        const criticalValue = jStat.centralF.inv(1 - parseFloat(alpha), df1, df2);
        
        if (criticalValue <= xScale.domain()[1]) {
          // Draw critical value line
          g.append("line")
            .attr("x1", xScale(criticalValue))
            .attr("x2", xScale(criticalValue))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.8);
          
          // Add label
          g.append("text")
            .attr("x", xScale(criticalValue))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", color)
            .attr("font-size", "12px")
            .text(`${label} (${criticalValue.toFixed(2)})`);
        }
      });
    }
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Create histogram if we have data
    if (localFValuesRef.current.length > 0) {
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(HISTOGRAM_BINS);
      
      const bins = histogram(localFValuesRef.current);
      
      // Proper histogram normalization to match probability density
      const binWidth = bins.length > 0 && bins[0].x1 !== undefined ? bins[0].x1 - bins[0].x0 : 1;
      const totalArea = localFValuesRef.current.length * binWidth;
      
      // Ensure totalArea is valid
      const normalizedTotalArea = totalArea > 0 ? totalArea : 1;
      
      // Draw histogram bars
      const bars = g.selectAll(".bar")
        .data(bins);
      
      bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", colorScheme.secondary)
        .attr("opacity", 0.6)
        .transition()
        .duration(getAnimationDuration(localFValuesRef.current.length))
        .attr("y", d => yScale(d.length / normalizedTotalArea))
        .attr("height", d => innerHeight - yScale(d.length / normalizedTotalArea));
    }
    
    // Highlight last generated F-value
    if (lastGeneratedF !== null) {
      g.append("line")
        .attr("x1", xScale(lastGeneratedF))
        .attr("x2", xScale(lastGeneratedF))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 0.3);
    }
    
    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 180}, 20)`);
    
    legend.append("rect")
      .attr("width", 170)
      .attr("height", 80)
      .attr("fill", colorScheme.surface)
      .attr("stroke", colorScheme.border)
      .attr("rx", 4);
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", colorScheme.text.primary)
      .attr("font-weight", "bold")
      .text("F-Distribution");
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("fill", colorScheme.text.secondary)
      .attr("font-size", "12px")
      .text(`ν₁ = ${df1}, ν₂ = ${df2}`);
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 60)
      .attr("fill", colorScheme.text.secondary)
      .attr("font-size", "12px")
      .text(`n = ${localFValuesRef.current.length} samples`);
    
  }, [sampleSizeN1, sampleSizeN2, simulatedFValues, lastGeneratedF, df1, df2, showCriticalValues, colorScheme, yDomain]);
  
  const insights = getInsights();
  const progress = Math.min(100, (simulatedFValues.length / 30) * 100);
  
  // Cleanup animation on parameter change
  useEffect(() => {
    isCancelledRef.current = true;
    if (animationIdRef.current) {
      clearTimeout(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsGenerating(false);
    
    // Reset cancel flag after cleanup
    const timer = setTimeout(() => {
      isCancelledRef.current = false;
    }, 100);
    
    return () => clearTimeout(timer);
  }, [sampleSizeN1, sampleSizeN2]);
  
  return (
    <VisualizationContainer
      title="F-Distribution Explorer"
      description="Explore how the ratio of sample variances follows the F-distribution"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls and Insights */}
        <div className="lg:w-1/3 space-y-4">
          {/* Controls Section */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className={cn(typography.label, "mb-2 block")}>
                  Sample Size 1 (n₁ = {sampleSizeN1})
                  <span className="text-xs ml-2 text-gray-500">ν₁ = {df1}</span>
                </label>
                <RangeSlider
                  value={sampleSizeN1}
                  onChange={(value) => {
                    setSampleSizeN1(value);
                    handleReset();
                  }}
                  min={3}
                  max={50}
                  step={1}
                  className="mb-2"
                />
              </div>
              
              <div>
                <label className={cn(typography.label, "mb-2 block")}>
                  Sample Size 2 (n₂ = {sampleSizeN2})
                  <span className="text-xs ml-2 text-gray-500">ν₂ = {df2}</span>
                </label>
                <RangeSlider
                  value={sampleSizeN2}
                  onChange={(value) => {
                    setSampleSizeN2(value);
                    handleReset();
                  }}
                  min={3}
                  max={50}
                  step={1}
                  className="mb-2"
                />
              </div>
            </div>
          </VisualizationSection>
          
          {/* Action Buttons */}
          <VisualizationSection className="p-4">
            <div className="space-y-2">
            <Button
              onClick={handleGenerateSingle}
              disabled={isGenerating}
              className="w-full"
              variant="default"
            >
              Generate F-statistic
            </Button>
            
            <Button
              onClick={handleGenerateMany}
              disabled={isGenerating}
              className="w-full"
              variant="secondary"
            >
              Generate Many (100)
            </Button>
            
            <Button
              onClick={handleReset}
              disabled={isGenerating || simulatedFValues.length === 0}
              className="w-full"
              variant="outline"
            >
              Reset
            </Button>
            </div>
          </VisualizationSection>
          
          {/* Visualization Options */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Visualization Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCriticalValues}
                  onChange={(e) => setShowCriticalValues(e.target.checked)}
                  className="rounded"
                />
                <span className={typography.caption}>Show Critical Values</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVarianceDetails}
                  onChange={(e) => setShowVarianceDetails(e.target.checked)}
                  className="rounded"
                />
                <span className={typography.caption}>Show Variance Calculations</span>
              </label>
            </div>
          </VisualizationSection>
          
          {/* Statistics Display */}
          {simulatedFValues.length > 0 && (
            <VisualizationSection className="p-4">
              <h3 className="text-base font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-3">Sample Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={typography.caption}>Sample Mean:</span>
                  <span className="font-mono">
                    {jStat.mean(simulatedFValues).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={typography.caption}>Sample Std Dev:</span>
                  <span className="font-mono">
                    {jStat.stdev(simulatedFValues, true).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={typography.caption}>Theoretical Mean:</span>
                  <span className="font-mono">
                    {(df2 > 2 ? df2 / (df2 - 2) : "∞").toString()}
                  </span>
                </div>
              </div>
            </VisualizationSection>
          )}
          
          {/* Variance Details */}
          {showVarianceDetails && lastGeneratedF && (
            <VisualizationSection className="p-4">
              <h3 className="text-base font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">Variance Calculations</h3>
              <div className="space-y-2 text-sm font-mono">
                <p>Latest F-statistic: {lastGeneratedF.toFixed(4)}</p>
                <p className="text-xs text-gray-400">F = S₁²/S₂²</p>
                <p className="text-xs text-gray-400">where S₁² and S₂² are sample variances</p>
              </div>
            </VisualizationSection>
          )}
          
          {/* Mathematical Formula */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">Mathematical Definition</h3>
            <div className="text-sm space-y-2">
              <p>The F-distribution PDF:</p>
              <p className="text-xs font-mono text-center py-2">
                f(x) = [Γ((ν₁+ν₂)/2) / (Γ(ν₁/2)Γ(ν₂/2))] × 
                (ν₁/ν₂)^(ν₁/2) × x^((ν₁/2)-1) × 
                (1 + (ν₁/ν₂)x)^(-(ν₁+ν₂)/2)
              </p>
              <p className="text-xs text-gray-400">
                where ν₁ = {df1} and ν₂ = {df2} are degrees of freedom
              </p>
            </div>
          </VisualizationSection>
          
          {/* Educational Insights */}
          <div className={cn(
            "p-4 rounded-lg transition-all duration-300",
            insights.stage === 0 ? "bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-600/40" :
            insights.stage === 1 ? "bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border border-teal-600/40" :
            insights.stage === 2 ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-600/40" :
            "bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-600/40"
          )}>
            <h3 className={cn(typography.h4, "mb-3 flex items-center gap-2")}>
              {insights.stage === 0 && "🎯"}
              {insights.stage === 1 && "📊"}
              {insights.stage === 2 && "🔍"}
              {insights.stage === 3 && "🎉"}
              {insights.title}
            </h3>
            {insights.content}
            
            {/* Progress Bar */}
            {simulatedFValues.length > 0 && simulatedFValues.length < 30 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress to 30 samples</span>
                  <span>{simulatedFValues.length}/30</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      progress < 33 ? "bg-red-500" :
                      progress < 66 ? "bg-yellow-500" :
                      progress < 100 ? "bg-blue-500" :
                      "bg-green-500"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="500px">
            <svg ref={svgRef} style={{ width: "100%", height: "500px" }} />
          </GraphContainer>
        </div>
      </div>
      
      {/* Worked Example Section */}
      <div className="mt-6">
        <FDistributionWorkedExample 
          n1={sampleSizeN1}
          n2={sampleSizeN2}
          s1_squared={2.5}
          s2_squared={1.8}
          alpha={0.05}
        />
      </div>
    </VisualizationContainer>
  );
};

export { FDistributionExplorer };