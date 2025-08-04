"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { tutorial_2_3_1 } from '@/tutorials/chapter2.jsx';
import { RotateCcw, Play, Pause } from 'lucide-react';

// Use probability color scheme for discrete distributions
const colorScheme = createColorScheme('probability');

/**
 * LinearTransformations Component
 * 
 * An interactive visualization exploring linear transformations Y = aX + b and their effects
 * on probability distributions, expectation, and variance.
 * 
 * ## Mathematical Foundation
 * 
 * Linear transformations follow these key properties:
 * - Expected Value: E[aX + b] = aE[X] + b
 * - Variance: Var(aX + b) = a²Var(X) 
 * - Standard Deviation: SD(aX + b) = |a|SD(X)
 * 
 * ## Component Features
 * 
 * 1. **Real-time Parameter Control**: Interactive sliders for scaling (a) and shifting (b)
 * 2. **Animated Transformations**: Smooth transitions showing parameter changes
 * 3. **Statistical Verification**: Live comparison of theoretical vs. computed values
 * 4. **Visual Indicators**: Progress bars and equation updates during animations
 * 5. **Enhanced Tooltips**: Positioned tooltips with mathematical context
 * 6. **Reset Functionality**: Quick return to default parameters
 * 
 * ## D3.js Implementation Pattern
 * 
 * This component uses a sophisticated D3.js pattern optimized for React:
 * - Single initialization with persistent element references
 * - Smooth transitions using D3's animation system
 * - Efficient updates that only modify changed elements
 * - Proper cleanup and memory management
 * 
 * @version 2.0.0
 * @author Probability Lab Team
 */

export default function LinearTransformations() {
  // Transformation parameters
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredElement, setHoveredElement] = useState(null);
  
  // Default values for reset functionality
  const DEFAULT_A = 2;
  const DEFAULT_B = 1;
  
  // Animation reference for smooth transitions
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);
  const tooltipRef = useRef(null);
  
  // Refs for D3-managed SVGs and elements
  const svgRef = useRef(null);
  const originalBarsRef = useRef(null);
  const transformedBarsRef = useRef(null);
  const originalLabelsRef = useRef(null);
  const transformedLabelsRef = useRef(null);
  const originalLineRef = useRef(null);
  const transformedLineRef = useRef(null);
  const scalesRef = useRef({ x: null, y: null });
  
  // Base distribution data (dice roll 1-6, each with probability 1/6)
  const baseDistribution = [
    { x: 1, p: 1/6 },
    { x: 2, p: 1/6 },
    { x: 3, p: 1/6 },
    { x: 4, p: 1/6 },
    { x: 5, p: 1/6 },
    { x: 6, p: 1/6 }
  ];
  
  /**
   * Calculate transformed distribution Y = aX + b
   * 
   * Applies linear transformation to each point in the base distribution,
   * handling cases where multiple original values map to the same transformed value.
   * 
   * @param {number} currentA - Scaling parameter (default: current a value)
   * @param {number} currentB - Shift parameter (default: current b value)
   * @returns {Array<{x: number, p: number}>} Transformed distribution points
   * 
   * ## Implementation Details
   * - Accumulates probabilities for identical transformed values
   * - Handles edge cases (a=0, negative scaling)
   * - Maintains numerical precision with parseFloat
   */
  const getTransformedDistribution = (currentA = a, currentB = b) => {
    const transformed = {};
    baseDistribution.forEach(({ x, p }) => {
      const newX = currentA * x + currentB;
      if (transformed[newX]) {
        transformed[newX] += p;
      } else {
        transformed[newX] = p;
      }
    });
    
    return Object.entries(transformed).map(([x, p]) => ({
      x: parseFloat(x),
      p
    })).sort((a, b) => a.x - b.x);
  };
  
  /**
   * Calculate statistical measures for a probability distribution
   * 
   * Computes expectation and variance using standard probability formulas:
   * - E[X] = Σ(x × P(X = x))
   * - Var(X) = Σ(P(X = x) × (x - E[X])²)
   * 
   * @param {Array<{x: number, p: number}>} distribution - Distribution data
   * @returns {{expectation: number, variance: number, sd: number}} Statistics
   */
  const calculateStats = (distribution) => {
    const expectation = distribution.reduce((sum, { x, p }) => sum + x * p, 0);
    const variance = distribution.reduce((sum, { x, p }) => {
      return sum + p * Math.pow(x - expectation, 2);
    }, 0);
    return { expectation, variance, sd: Math.sqrt(Math.max(0, variance)) };
  };
  
  /**
   * Reset parameters to default values
   * Provides quick way to return to initial educational state
   */
  const resetParameters = () => {
    if (!isAnimating) {
      setA(DEFAULT_A);
      setB(DEFAULT_B);
    }
  };

  // Initialize visualization once
  useEffect(() => {
    if (!svgRef.current || isInitializedRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a")
      .style("pointer-events", "none");

    // Calculate initial scales based on both distributions
    const originalData = baseDistribution;
    const transformedData = getTransformedDistribution();
    const allValues = [
      ...originalData.map(d => d.x),
      ...transformedData.map(d => d.x)
    ];
    const xExtent = d3.extent(allValues);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 0.35])
      .range([height - margin.bottom, margin.top]);

    // Store scales for updates
    scalesRef.current = { x: xScale, y: yScale };

    // Create main group
    const g = svg.append("g");

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .style("pointer-events", "none")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);

    // Axes
    const xAxis = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .style("pointer-events", "none")
      .call(d3.axisBottom(xScale).tickFormat(d => d.toFixed(1)));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text").attr("fill", colors.chart.text);

    const yAxis = g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .style("pointer-events", "none")
      .call(d3.axisLeft(yScale).tickFormat(d => `${(d * 100).toFixed(0)}%`));

    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text").attr("fill", colors.chart.text).style("font-size", "11px");

    // Axis labels
    g.append("text")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("Value");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("Probability");

    // Bar width calculation
    const barWidth = Math.min(25, (width - margin.left - margin.right) / (allValues.length * 3));

    // Create original distribution bars
    originalBarsRef.current = g.selectAll(".original-bar")
      .data(originalData)
      .join("rect")
      .attr("class", "original-bar")
      .attr("x", d => xScale(d.x) - barWidth / 2)
      .attr("y", d => yScale(d.p))
      .attr("width", barWidth)
      .attr("height", d => yScale(0) - yScale(d.p))
      .attr("fill", "#3B82F6") // Blue for original
      .attr("opacity", 0.8)
      .attr("rx", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "#60A5FA")
          .attr("stroke-width", 2);
        setHoveredElement({type: 'original', value: d.x, probability: d.p});
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "none");
        setHoveredElement(null);
      });

    // Create transformed distribution bars
    transformedBarsRef.current = g.selectAll(".transformed-bar")
      .data(transformedData)
      .join("rect")
      .attr("class", "transformed-bar")
      .attr("x", d => xScale(d.x) + barWidth / 2)
      .attr("y", d => yScale(d.p))
      .attr("width", barWidth)
      .attr("height", d => yScale(0) - yScale(d.p))
      .attr("fill", "#10B981") // Green for transformed
      .attr("opacity", 0.8)
      .attr("rx", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "#34D399")
          .attr("stroke-width", 2);
        setHoveredElement({type: 'transformed', value: d.x, probability: d.p});
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "none");
        setHoveredElement(null);
      });

    // Create expectation lines
    const originalStats = calculateStats(originalData);
    const transformedStats = calculateStats(transformedData);

    originalLineRef.current = g.append("line")
      .attr("class", "expectation-line-original")
      .attr("x1", xScale(originalStats.expectation))
      .attr("x2", xScale(originalStats.expectation))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8);

    transformedLineRef.current = g.append("line")
      .attr("class", "expectation-line-transformed")
      .attr("x1", xScale(transformedStats.expectation))
      .attr("x2", xScale(transformedStats.expectation))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#10B981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8);

    // Create expectation labels
    originalLabelsRef.current = g.append("text")
      .attr("x", xScale(originalStats.expectation))
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#3B82F6")
      .attr("font-size", "12px")
      .text(`E[X] = ${originalStats.expectation.toFixed(2)}`);

    transformedLabelsRef.current = g.append("text")
      .attr("x", xScale(transformedStats.expectation))
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#10B981")
      .attr("font-size", "12px")
      .text(`E[Y] = ${transformedStats.expectation.toFixed(2)}`);

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 180}, ${margin.top + 20})`);

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#3B82F6")
      .attr("opacity", 0.8);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("X (Original)");

    legend.append("rect")
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#10B981")
      .attr("opacity", 0.8);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", colors.chart.text)
      .attr("font-size", "12px")
      .text("Y = aX + b");

    isInitializedRef.current = true;
  }, []); // Initialize once

  // Update visualization when parameters change
  useEffect(() => {
    if (!isInitializedRef.current || !svgRef.current) return;

    // Update scales based on new transformed distribution
    const transformedData = getTransformedDistribution();
    const originalData = baseDistribution;
    const allValues = [
      ...originalData.map(d => d.x),
      ...transformedData.map(d => d.x)
    ];
    const xExtent = d3.extent(allValues);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;

    const { width } = svgRef.current.getBoundingClientRect();
    const margin = { top: 40, right: 30, bottom: 80, left: 60 };

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([margin.left, width - margin.right]);

    scalesRef.current.x = xScale;

    // Calculate bar width
    const barWidth = Math.min(25, (width - margin.left - margin.right) / (allValues.length * 3));

    // Update transformed bars with smooth transitions
    if (transformedBarsRef.current) {
      transformedBarsRef.current
        .data(transformedData)
        .join("rect")
        .transition()
        .duration(300)
        .attr("x", d => xScale(d.x) + barWidth / 2)
        .attr("y", d => scalesRef.current.y(d.p))
        .attr("width", barWidth)
        .attr("height", d => scalesRef.current.y(0) - scalesRef.current.y(d.p));
    }

    // Update expectation lines and labels
    const originalStats = calculateStats(originalData);
    const transformedStats = calculateStats(transformedData);

    if (transformedLineRef.current) {
      transformedLineRef.current
        .transition()
        .duration(300)
        .attr("x1", xScale(transformedStats.expectation))
        .attr("x2", xScale(transformedStats.expectation));
    }

    if (transformedLabelsRef.current) {
      transformedLabelsRef.current
        .transition()
        .duration(300)
        .attr("x", xScale(transformedStats.expectation))
        .text(`E[Y] = ${transformedStats.expectation.toFixed(2)}`);
    }

    // Update axes if scale domain changed significantly
    const svg = d3.select(svgRef.current);
    svg.select(".x-axis")
      .transition()
      .duration(300)
      .call(d3.axisBottom(xScale).tickFormat(d => d.toFixed(1)));

  }, [a, b]); // Update when parameters change

  /**
   * Animate transformation from identity (a=1, b=0) to target values
   * 
   * Uses requestAnimationFrame for smooth 60fps animation with visual progress indicators.
   * Implements ease-out cubic easing for natural motion feel.
   * 
   * ## Animation Flow
   * 1. Store current target values
   * 2. Reset to identity transformation (Y = X)
   * 3. Smoothly interpolate to target over 2 seconds
   * 4. Update progress indicator throughout
   * 5. Clean up and restore exact final values
   */
  const animateTransformation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationProgress(0);
    
    // Store target values and start from identity transformation
    const startA = 1;
    const startB = 0;
    const targetA = a;
    const targetB = b;
    
    setA(startA);
    setB(startB);
    
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate transformation parameters
      const currentA = startA + (targetA - startA) * easeProgress;
      const currentB = startB + (targetB - startB) * easeProgress;
      
      // Update state with smooth values
      setA(currentA);
      setB(currentB);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure exact final values and clean up
        setA(targetA);
        setB(targetB);
        setAnimationProgress(1);
        setIsAnimating(false);
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate current statistics for display
  const baseStats = calculateStats(baseDistribution);
  const transformedStats = calculateStats(getTransformedDistribution());
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <VisualizationContainer
      title="Linear Transformations Explorer"
      tutorialSteps={tutorial_2_3_1}
      tutorialKey="linear-transformations-2-3-1"
      description={
        <>
          <p className={typography.description}>
            <strong>Transform and observe!</strong> Adjust the parameters a and b to see how linear 
            transformations Y = aX + b affect probability distributions, expectation, and variance.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            <span className="text-blue-400">Original distribution X</span> (dice roll 1-6) is shown in blue, while 
            <span className="text-green-400"> transformed distribution Y</span> appears in green. 
            Watch how the transformation rules apply perfectly!
          </p>
        </>
      }
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Transformation Parameters</h4>
            <ControlGroup>
              <div className="space-y-4">
                {/* Dynamic Equation Display */}
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-3 border border-indigo-500/30">
                  <div className="text-center">
                    <div className="text-lg font-mono text-indigo-300 font-bold">
                      Y = {a.toFixed(1)}X + {b.toFixed(1)}
                    </div>
                    <div className="text-xs text-indigo-400 mt-1">
                      Current Transformation Equation
                    </div>
                  </div>
                </div>
                
                {/* Animation Progress Bar */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/30"
                    >
                      <div className="text-xs text-yellow-400 mb-2 flex items-center gap-2">
                        <Play className="w-3 h-3" />
                        Animation Progress: {Math.round(animationProgress * 100)}%
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${animationProgress * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Scale factor (a): 
                    <motion.span 
                      key={a.toFixed(1)}
                      initial={{ color: '#10B981' }}
                      animate={{ color: '#D1D5DB' }}
                      transition={{ duration: 0.3 }}
                      className="font-mono font-bold ml-1"
                    >
                      {a.toFixed(1)}
                    </motion.span>
                  </label>
                  <RangeSlider
                    value={a}
                    onChange={(v) => setA(v)}
                    min={-3}
                    max={3}
                    step={0.1}
                    disabled={isAnimating}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Shift (b): 
                    <motion.span 
                      key={b.toFixed(1)}
                      initial={{ color: '#10B981' }}
                      animate={{ color: '#D1D5DB' }}
                      transition={{ duration: 0.3 }}
                      className="font-mono font-bold ml-1"
                    >
                      {b.toFixed(1)}
                    </motion.span>
                  </label>
                  <RangeSlider
                    value={b}
                    onChange={(v) => setB(v)}
                    min={-10}
                    max={10}
                    step={0.5}
                    disabled={isAnimating}
                    className="mb-2"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={animateTransformation}
                    disabled={isAnimating}
                    className={cn(
                      components.button.base,
                      components.button.primary,
                      "flex-1 flex items-center justify-center gap-2"
                    )}
                  >
                    {isAnimating ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Animating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Animate
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetParameters}
                    disabled={isAnimating}
                    className={cn(
                      components.button.base,
                      "bg-gray-600 hover:bg-gray-500 text-white",
                      "px-3 flex items-center justify-center"
                    )}
                    title="Reset to default values (a=2, b=1)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Statistical Properties</h4>
            <div className="space-y-4">
              {/* Original statistics */}
              <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                <h5 className="text-sm font-semibold text-blue-400">Original Distribution (X)</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">E[X]:</span>
                    <span className="font-mono text-blue-400 font-medium">
                      {formatNumber(baseStats.expectation)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Var(X):</span>
                    <span className="font-mono text-blue-400 font-medium">
                      {formatNumber(baseStats.variance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transformed statistics with animation */}
              <motion.div 
                className="bg-gray-800/30 rounded-lg p-3 space-y-2"
                animate={{ 
                  borderColor: isAnimating ? '#10B981' : 'transparent',
                  boxShadow: isAnimating ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                transition={{ duration: 0.3 }}
              >
                <h5 className="text-sm font-semibold text-green-400">
                  Transformed Distribution (Y = {a.toFixed(1)}X + {b.toFixed(1)})
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">E[Y]:</span>
                    <motion.span 
                      key={transformedStats.expectation.toFixed(3)}
                      initial={{ color: '#10B981', scale: 1.1 }}
                      animate={{ color: '#10B981', scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono font-medium"
                    >
                      {formatNumber(transformedStats.expectation)}
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Var(Y):</span>
                    <motion.span 
                      key={transformedStats.variance.toFixed(3)}
                      initial={{ color: '#10B981', scale: 1.1 }}
                      animate={{ color: '#10B981', scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono font-medium"
                    >
                      {formatNumber(transformedStats.variance)}
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              {/* Verification with enhanced animation */}
              <motion.div 
                className="bg-gray-800/30 rounded-lg p-3"
                animate={{ 
                  borderColor: isAnimating ? '#F59E0B' : 'transparent',
                  boxShadow: isAnimating ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none'
                }}
                transition={{ duration: 0.3 }}
              >
                <h5 className="text-sm font-semibold text-yellow-400 mb-2">Transformation Rules</h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-gray-400">E[aX + b] = aE[X] + b</div>
                    <motion.div 
                      key={`exp-${a.toFixed(1)}-${b.toFixed(1)}`}
                      initial={{ color: '#F59E0B', fontWeight: 'bold' }}
                      animate={{ color: '#F59E0B', fontWeight: 'normal' }}
                      transition={{ duration: 0.5 }}
                      className="font-mono"
                    >
                      {a.toFixed(1)} × {baseStats.expectation.toFixed(2)} + {b.toFixed(1)} = {formatNumber(a * baseStats.expectation + b)}
                    </motion.div>
                  </div>
                  <div>
                    <div className="text-gray-400">Var(aX + b) = a²Var(X)</div>
                    <motion.div 
                      key={`var-${a.toFixed(1)}`}
                      initial={{ color: '#F59E0B', fontWeight: 'bold' }}
                      animate={{ color: '#F59E0B', fontWeight: 'normal' }}
                      transition={{ duration: 0.5 }}
                      className="font-mono"
                    >
                      {a.toFixed(1)}² × {baseStats.variance.toFixed(2)} = {formatNumber(a * a * baseStats.variance)}
                    </motion.div>
                  </div>
                  {/* Error check */}
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-500">Verification accuracy:</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">E[Y] match:</span>
                      <span className={Math.abs(transformedStats.expectation - (a * baseStats.expectation + b)) < 0.001 ? 'text-green-400' : 'text-red-400'}>
                        {Math.abs(transformedStats.expectation - (a * baseStats.expectation + b)) < 0.001 ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Var(Y) match:</span>
                      <span className={Math.abs(transformedStats.variance - (a * a * baseStats.variance)) < 0.001 ? 'text-green-400' : 'text-red-400'}>
                        {Math.abs(transformedStats.variance - (a * a * baseStats.variance)) < 0.001 ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualization */}
        <div className="lg:flex-1">
          <GraphContainer title="Linear Transformation: Y = aX + b">
            <div className="relative">
              <svg ref={svgRef} className="w-full" style={{ height: 400 }} />
              
              {/* Enhanced Tooltip */}
              <AnimatePresence>
                {hoveredElement && (
                  <motion.div
                    ref={tooltipRef}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl z-10 pointer-events-none"
                    style={{
                      left: '50%',
                      top: '20%',
                      transform: 'translateX(-50%)',
                      minWidth: '200px'
                    }}
                  >
                    <div className="text-sm font-semibold text-white mb-2">
                      {hoveredElement.type === 'original' ? 'Original Distribution' : 'Transformed Distribution'}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {hoveredElement.type === 'original' ? 'X =' : 'Y ='}
                        </span>
                        <span className={hoveredElement.type === 'original' ? 'text-blue-400' : 'text-green-400'}>
                          {hoveredElement.value}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probability:</span>
                        <span className="text-white font-mono">
                          {formatNumber(hoveredElement.probability)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Percentage:</span>
                        <span className="text-white font-mono">
                          {(hoveredElement.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      {hoveredElement.type === 'transformed' && (
                        <div className="pt-2 mt-2 border-t border-gray-600">
                          <div className="text-gray-400 text-xs">
                            Transformation: {a.toFixed(1)} × X + {b.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-gray-400">X (Original)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-400">Y = aX + b (Transformed)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-500" />
                <span className="text-gray-400">Expected Values</span>
              </div>
            </div>
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}