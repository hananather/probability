"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { createColorScheme, cn, typography } from "../../lib/design-system";
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

export const FDistributionExplorer = () => {
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
  
  // Calculate degrees of freedom
  const df1 = sampleSizeN1 - 1;
  const df2 = sampleSizeN2 - 1;
  
  // Color scheme
  const colorScheme = createColorScheme('hypothesis');
  const colorClasses = getColorClasses('hypothesis');
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        clearTimeout(animationIdRef.current);
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
    const numSamples = 100;
    const newFValues = [];
    
    for (let i = 0; i < numSamples; i++) {
      newFValues.push(generateSingleFStatistic());
    }
    
    let isCancelled = false;
    
    // Animate addition of values
    const animateAddition = (index) => {
      if (isCancelled || index >= newFValues.length) {
        if (!isCancelled) {
          setSimulatedFValues(prev => {
            const combined = [...prev, ...newFValues];
            return combined.length > MAX_STORED_VALUES 
              ? combined.slice(-MAX_STORED_VALUES)
              : combined;
          });
          setIsGenerating(false);
        }
        return;
      }
      
      // Memory management for local ref
      if (localFValuesRef.current.length >= MAX_STORED_VALUES) {
        localFValuesRef.current = localFValuesRef.current.slice(-MAX_STORED_VALUES + 1);
      }
      localFValuesRef.current = [...localFValuesRef.current, newFValues[index]];
      
      const timeoutId = setTimeout(() => {
        animateAddition(index + 1);
      }, Math.max(20, 200 / Math.sqrt(index + 1)));
      
      animationIdRef.current = timeoutId;
    };
    
    animateAddition(0);
    
    // Cleanup function
    return () => {
      isCancelled = true;
      if (animationIdRef.current) {
        clearTimeout(animationIdRef.current);
      }
    };
  }, [generateSingleFStatistic, isGenerating]);
  
  // Reset function
  const handleReset = useCallback(() => {
    setSimulatedFValues([]);
    localFValuesRef.current = [];
    setLastGeneratedF(null);
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
    const width = 700;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
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
      .attr("fill", colorScheme.text.secondary)
      .style("text-anchor", "middle")
      .text("F-value");
    
    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", colorScheme.text.secondary)
      .style("text-anchor", "middle")
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
      
      // Proper histogram normalization
      const binWidth = bins[0] ? bins[0].x1 - bins[0].x0 : 1;
      const totalArea = localFValuesRef.current.length * binWidth;
      
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
        .attr("y", d => yScale(d.length / totalArea))
        .attr("height", d => innerHeight - yScale(d.length / totalArea));
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
    if (animationIdRef.current) {
      clearTimeout(animationIdRef.current);
    }
    setIsGenerating(false);
  }, [sampleSizeN1, sampleSizeN2]);
  
  return (
    <VisualizationContainer
      title="F-Distribution Explorer"
      description="Explore how the ratio of sample variances follows the F-distribution"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Controls and Insights */}
        <div className="col-span-1 space-y-4">
          {/* Controls Section */}
          <div className={cn("p-4 rounded-lg", colorClasses.bg, colorClasses.border)}>
            <h3 className={cn(typography.h4, "mb-4")}>Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className={cn(typography.label, "mb-2 block")}>
                  Sample Size 1 (n₁ = {sampleSizeN1})
                  <span className="text-xs ml-2 text-gray-500">ν₁ = {df1}</span>
                </label>
                <RangeSlider
                  value={[sampleSizeN1]}
                  onValueChange={([value]) => {
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
                  value={[sampleSizeN2]}
                  onValueChange={([value]) => {
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
          </div>
          
          {/* Action Buttons */}
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
          
          {/* Visualization Options */}
          <div className={cn("p-4 rounded-lg", colorClasses.bg, colorClasses.border)}>
            <h3 className={cn(typography.h4, "mb-3")}>Visualization Options</h3>
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
          </div>
          
          {/* Statistics Display */}
          {simulatedFValues.length > 0 && (
            <div className={cn("p-4 rounded-lg", colorClasses.bg, colorClasses.border)}>
              <h3 className={cn(typography.h4, "mb-3")}>Sample Statistics</h3>
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
            </div>
          )}
          
          {/* Variance Details */}
          {showVarianceDetails && lastGeneratedF && (
            <div className={cn("p-4 rounded-lg", "bg-purple-900/20 border border-purple-600/30")}>
              <h3 className={cn(typography.h4, "mb-3")}>Variance Calculations</h3>
              <div className="space-y-2 text-sm font-mono">
                <p>Latest F-statistic: {lastGeneratedF.toFixed(4)}</p>
                <p className="text-xs text-gray-400">F = S₁²/S₂²</p>
                <p className="text-xs text-gray-400">where S₁² and S₂² are sample variances</p>
              </div>
            </div>
          )}
          
          {/* Mathematical Formula */}
          <div className={cn("p-4 rounded-lg", "bg-indigo-900/20 border border-indigo-600/30")}>
            <h3 className={cn(typography.h4, "mb-3")}>Mathematical Definition</h3>
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
          </div>
          
          {/* Educational Insights */}
          <div className={cn(
            "p-4 rounded-lg transition-all duration-300",
            insights.stage === 0 ? "bg-gray-800/50 border border-gray-600/30" :
            insights.stage === 1 ? "bg-teal-900/20 border border-teal-600/30" :
            insights.stage === 2 ? "bg-blue-900/20 border border-blue-600/30" :
            "bg-green-900/20 border border-green-600/30"
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
        <div className="col-span-2">
          <div className={cn("p-4 rounded-lg", "bg-gray-800/50 border border-gray-700")}>
            <svg ref={svgRef}></svg>
          </div>
        </div>
      </div>
      
      {/* Worked Example Section */}
      <div className="mt-8">
        <h3 className={cn(typography.h3, "mb-4")}>Worked Example: F-Test for Variance Comparison</h3>
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