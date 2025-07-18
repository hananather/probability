"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { cn, createColorScheme, typography, colors } from "@/lib/design-system";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { RangeSlider } from "@/components/ui/RangeSlider";
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';

// Use sampling color scheme to match ExpectationVariance
const colorScheme = createColorScheme('sampling');

export function TDistributionExplorer() {
  const [sampleSize, setSampleSize] = useState(5);
  const [showNormalOverlay, setShowNormalOverlay] = useState(false);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showDifferenceArea, setShowDifferenceArea] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  
  const svgRef = useRef(null);
  const transitionRef = useRef(null);
  
  const degreesOfFreedom = Math.max(1, sampleSize - 1); // Ensure df >= 1

  // Mathematical discoveries based on exploration
  const discoveries = [
    {
      id: 'heavy-tails',
      title: 'Heavy Tails with Small Samples',
      description: 'The t-distribution has heavier tails than the normal distribution when degrees of freedom are small',
      formula: 'P(|T| > t_{\\alpha/2}) > P(|Z| > z_{\\alpha/2})',
      discovered: sampleSize <= 10,
      category: 'concept'
    },
    {
      id: 'df-relationship',
      title: 'Degrees of Freedom',
      description: 'Degrees of freedom equals sample size minus one',
      formula: 'df = n - 1',
      discovered: sampleSize >= 2,
      category: 'formula'
    },
    {
      id: 'uncertainty-principle',
      title: 'Uncertainty in Small Samples',
      description: 'Smaller samples have more uncertainty because we must estimate the population variance',
      discovered: sampleSize <= 5 && showNormalOverlay,
      category: 'concept'
    },
    {
      id: 'convergence',
      title: 'Convergence to Normal',
      description: 'As degrees of freedom increase, the t-distribution approaches the standard normal distribution',
      formula: '\\lim_{df \\to \\infty} t(df) = N(0,1)',
      discovered: sampleSize >= 30,
      category: 'pattern'
    },
    {
      id: 'critical-values',
      title: 'Critical Value Relationship',
      description: 'T-distribution critical values are always larger than normal critical values for finite samples',
      formula: 't_{\\alpha/2}(df) > z_{\\alpha/2}',
      discovered: showConfidenceInterval && sampleSize < 30,
      category: 'relationship'
    },
    {
      id: 'practical-rule',
      title: 'Rule of Thumb',
      description: 'For practical purposes, use normal distribution when n ≥ 30',
      discovered: sampleSize >= 30,
      category: 'pattern'
    }
  ];

  // Educational insights based on sample size - matching ExpectationVariance style
  const getEducationalInsights = () => {
    if (sampleSize === 2) {
      return {
        stage: "minimum",
        title: "Minimum Sample Size Analysis",
        insights: [
          "With n=2, we have only 1 degree of freedom",
          "The t-distribution has extremely heavy tails",
          "Much more uncertainty than normal distribution",
          "95% CI critical value: ±12.706 (vs ±1.96 for normal)"
        ],
        realWorldExample: "Quality control with only 2 measurements - very unreliable"
      };
    } else if (sampleSize <= 5) {
      return {
        stage: "small",
        title: "Small Sample Properties",
        insights: [
          `With n=${sampleSize}, df=${degreesOfFreedom} - still quite small`,
          "Notice the t-distribution's fatter tails",
          "This accounts for uncertainty in estimating σ",
          `95% CI critical value: ±${jStat.studentt.inv(0.975, degreesOfFreedom).toFixed(3)}`
        ],
        realWorldExample: "Testing tensile strength with limited material samples"
      };
    } else if (sampleSize <= 30) {
      return {
        stage: "moderate",
        title: "Moderate Sample Behavior",
        insights: [
          `Sample size n=${sampleSize}, df=${degreesOfFreedom}`,
          "T-distribution getting closer to normal",
          "Tails are still slightly heavier",
          `95% CI critical value: ±${jStat.studentt.inv(0.975, degreesOfFreedom).toFixed(3)}`
        ],
        realWorldExample: "Clinical trial with moderate participant group"
      };
    } else {
      return {
        stage: "large",
        title: "Large Sample Convergence",
        insights: [
          `With n=${sampleSize}, df=${degreesOfFreedom}`,
          "T-distribution is nearly identical to normal",
          `95% CI critical value: ±${jStat.studentt.inv(0.975, degreesOfFreedom).toFixed(3)} (→ ±1.96)`,
          "In practice, we often use normal for n≥30"
        ],
        realWorldExample: "Large-scale manufacturing quality assessment"
      };
    }
  };

  const educationalContent = getEducationalInsights();

  // Calculate critical values
  const criticalValues = {
    t: {
      90: jStat.studentt.inv(0.95, degreesOfFreedom),
      95: jStat.studentt.inv(0.975, degreesOfFreedom),
      99: jStat.studentt.inv(0.995, degreesOfFreedom)
    },
    normal: {
      90: 1.645,
      95: 1.960,
      99: 2.576
    }
  };

  // Simplified cleanup function for D3 transitions and animations
  const cleanup = useCallback(() => {
    if (transitionRef.current) {
      // Cancel any ongoing transitions or intervals
      clearInterval(transitionRef.current);
      transitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Cleanup previous transitions
    cleanup();

    const margin = { top: 30, right: 40, bottom: 60, left: 50 };
    const width = 700;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Dark background matching ExpectationVariance
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xDomain = [-4, 4];
    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    // Dynamic y-scale to handle varying PDF heights
    const maxY = Math.max(
      0.45,
      jStat.studentt.pdf(0, degreesOfFreedom),
      jStat.normal.pdf(0, 0, 1)
    ) * 1.1;

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([innerHeight, 0]);

    // Grid lines (before axes)
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(9);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");

    xAxisGroup.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", colors.chart.text)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Standard Deviations from Mean");

    const yAxisGroup = g.append("g")
      .call(yAxis);

    yAxisGroup.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxisGroup.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");

    yAxisGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", colors.chart.text)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability Density");

    // Generate data points for curves
    const numPoints = 300; // More points for smoother curves
    const xValues = d3.range(xDomain[0], xDomain[1], (xDomain[1] - xDomain[0]) / numPoints);

    // T-distribution data with error handling
    const tData = xValues.map(x => ({
      x: x,
      y: degreesOfFreedom >= 1 ? jStat.studentt.pdf(x, degreesOfFreedom) : 0
    })).filter(d => !isNaN(d.y) && isFinite(d.y));

    // Normal distribution data
    const normalData = xValues.map(x => ({
      x: x,
      y: jStat.normal.pdf(x, 0, 1)
    }));

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Add gradient for t-distribution using colorScheme with unique ID
    const gradientId = `t-gradient-${Date.now()}`;
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.chart.primary)
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", colorScheme.chart.primaryLight || colorScheme.chart.primary)
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.chart.primary)
      .attr("stop-opacity", 1);

    // Add confidence interval shading if enabled
    if (showConfidenceInterval) {
      const alpha = 1 - confidenceLevel;
      const criticalValue = jStat.studentt.inv(1 - alpha/2, degreesOfFreedom);
      
      // Create area generator for confidence interval
      const ciData = xValues.filter(x => x >= -criticalValue && x <= criticalValue).map(x => ({
        x: x,
        y: degreesOfFreedom >= 1 ? jStat.studentt.pdf(x, degreesOfFreedom) : 0
      }));

      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(ciData)
        .attr("fill", colorScheme.chart.primary)
        .attr("fill-opacity", 0.15)
        .attr("d", area)
        .style("opacity", 0)
        .transition()
        .duration(animationSpeed)
        .style("opacity", 1);

      // Add critical value lines
      [-criticalValue, criticalValue].forEach(cv => {
        g.append("line")
          .attr("x1", xScale(cv))
          .attr("x2", xScale(cv))
          .attr("y1", innerHeight)
          .attr("y2", yScale(0))
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "3,3")
          .style("opacity", 0)
          .transition()
          .duration(animationSpeed)
          .style("opacity", 0.6);

        g.append("text")
          .attr("x", xScale(cv))
          .attr("y", innerHeight + 15)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.primary)
          .style("font-size", "10px")
          .style("font-weight", "500")
          .text(`${cv > 0 ? '+' : ''}${cv.toFixed(3)}`)
          .style("opacity", 0)
          .transition()
          .duration(animationSpeed)
          .style("opacity", 1);
      });

      // Add confidence level label
      g.append("text")
        .attr("x", xScale(0))
        .attr("y", yScale(maxY * 0.3))
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(`${(confidenceLevel * 100).toFixed(0)}% CI`)
        .style("opacity", 0)
        .transition()
        .duration(animationSpeed)
        .style("opacity", 0.8);
    }

    // Draw difference area between t and normal if enabled
    if (showDifferenceArea && showNormalOverlay) {
      const differenceData = xValues.map(x => {
        const tY = degreesOfFreedom >= 1 ? jStat.studentt.pdf(x, degreesOfFreedom) : 0;
        const normalY = jStat.normal.pdf(x, 0, 1);
        return {
          x: x,
          y0: Math.min(tY, normalY),
          y1: Math.max(tY, normalY)
        };
      });

      const differenceArea = d3.area()
        .x(d => xScale(d.x))
        .y0(d => yScale(d.y0))
        .y1(d => yScale(d.y1))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(differenceData)
        .attr("fill", colorScheme.chart.secondary)
        .attr("fill-opacity", 0.2)
        .attr("d", differenceArea)
        .style("opacity", 0)
        .transition()
        .duration(animationSpeed)
        .style("opacity", 1);
    }

    // Draw t-distribution with animation - with fallback color
    const tPath = g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.primary) // Fallback color
      .attr("stroke", `url(#${gradientId})`) // Gradient if available
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("opacity", 0);

    // Animate path appearance
    tPath.transition()
      .duration(animationSpeed)
      .style("opacity", 1);

    // Draw normal distribution if toggled
    if (showNormalOverlay) {
      const normalPath = g.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,2")
        .attr("d", line)
        .style("opacity", 0);

      normalPath.transition()
        .duration(animationSpeed)
        .delay(animationSpeed / 2)
        .style("opacity", 0.8);

      // Add enhanced legend with background
      const legend = g.append("g")
        .attr("transform", `translate(${innerWidth - 140}, 10)`);

      // Legend background
      legend.append("rect")
        .attr("x", -10)
        .attr("y", -5)
        .attr("width", 140)
        .attr("height", 50)
        .attr("fill", "#1a1a1a")
        .attr("stroke", colors.chart.grid)
        .attr("stroke-width", 1)
        .attr("rx", 4);

      // T-distribution legend item
      legend.append("line")
        .attr("x1", 0)
        .attr("x2", 25)
        .attr("y1", 10)
        .attr("y2", 10)
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 2.5);

      legend.append("text")
        .attr("x", 30)
        .attr("y", 14)
        .attr("fill", colors.chart.text)
        .style("font-size", "11px")
        .text(`t(${degreesOfFreedom})`);

      // Normal distribution legend item
      legend.append("line")
        .attr("x1", 0)
        .attr("x2", 25)
        .attr("y1", 28)
        .attr("y2", 28)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,2");

      legend.append("text")
        .attr("x", 30)
        .attr("y", 32)
        .attr("fill", colors.chart.text)
        .style("font-size", "11px")
        .text("N(0,1)");
    }

    // Add interactive hover functionality
    const hoverGroup = g.append("g").style("pointer-events", "none");
    
    const verticalLine = hoverGroup.append("line")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .style("opacity", 0);

    const hoverCircle = hoverGroup.append("circle")
      .attr("r", 4)
      .attr("fill", colorScheme.chart.primary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0);

    const hoverText = hoverGroup.append("text")
      .attr("fill", "#fff")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("opacity", 0);

    // Create invisible overlay for mouse events
    const overlay = g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const x = xScale.invert(mouseX);
        
        if (x >= -4 && x <= 4) {
          const tY = degreesOfFreedom >= 1 ? jStat.studentt.pdf(x, degreesOfFreedom) : 0;
          
          verticalLine
            .attr("x1", mouseX)
            .attr("x2", mouseX)
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .style("opacity", 0.5);

          hoverCircle
            .attr("cx", mouseX)
            .attr("cy", yScale(tY))
            .style("opacity", 1);

          hoverText
            .attr("x", mouseX)
            .attr("y", yScale(tY) - 10)
            .attr("text-anchor", mouseX > innerWidth / 2 ? "end" : "start")
            .text(`x=${x.toFixed(2)}, p=${tY.toFixed(4)}`)
            .style("opacity", 1);

          setHoveredPoint({ x: x.toFixed(2), y: tY.toFixed(4) });
        }
      })
      .on("mouseleave", function() {
        verticalLine.style("opacity", 0);
        hoverCircle.style("opacity", 0);
        hoverText.style("opacity", 0);
        setHoveredPoint(null);
      });

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [sampleSize, showNormalOverlay, showConfidenceInterval, confidenceLevel, showDifferenceArea, degreesOfFreedom, animationSpeed, cleanup]);

  // Animation controls with cleanup
  const handleAnimateConvergence = () => {
    // Clear any existing animation
    if (transitionRef.current) {
      clearInterval(transitionRef.current);
      transitionRef.current = null;
    }
    
    // Auto-enable all visualization options for full effect
    setShowNormalOverlay(true);
    setShowConfidenceInterval(true);
    setShowDifferenceArea(true);
    
    let n = 2;
    setSampleSize(2); // Start from 2
    
    const targetN = 50;
    const totalDuration = 5000; // 5 seconds for the full animation
    const frameInterval = 50; // Update every 50ms for smooth animation
    const totalFrames = totalDuration / frameInterval;
    
    let frame = 0;
    
    transitionRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Custom easing: slow start, moderate middle, slow end for "aha" moment
      let easeProgress;
      if (progress < 0.2) {
        // Very slow start (first 20% takes longer)
        easeProgress = progress * progress * 2.5;
      } else if (progress < 0.8) {
        // Normal speed in middle
        easeProgress = 0.1 + (progress - 0.2) * 1.5;
      } else {
        // Slow down for the "aha" moment at the end
        const endProgress = (progress - 0.8) / 0.2;
        easeProgress = 1 - Math.pow(1 - endProgress, 3) * 0.1;
      }
      
      n = Math.round(2 + easeProgress * (targetN - 2));
      
      if (frame >= totalFrames || n >= targetN) {
        setSampleSize(targetN);
        clearInterval(transitionRef.current);
        transitionRef.current = null;
      } else if (n !== sampleSize) { // Only update if value changed
        setSampleSize(n);
      }
    }, frameInterval);
  };

  return (
    <VisualizationContainer
      title="4.4 T-Distribution Explorer"
      description={
        <>
          <p className={typography.description}>
            <strong>Why do small samples need special treatment?</strong> When we estimate the population variance 
            from a small sample, we introduce extra uncertainty. The t-distribution accounts for this by having 
            heavier tails than the normal distribution.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            Watch how the <span className="text-emerald-400">t-distribution</span> transforms into the 
            <span className="text-purple-400"> normal distribution</span> as sample size increases. 
            This convergence is why we can use normal approximations for large samples!
          </p>
        </>
      }
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Distribution Controls</h4>
            <ControlGroup>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Sample Size: {sampleSize}
                  </label>
                  <RangeSlider
                    value={sampleSize}
                    onChange={setSampleSize}
                    min={2}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <div className="text-xs text-gray-400">
                    Degrees of Freedom: ν = {degreesOfFreedom}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Confidence Level: {(confidenceLevel * 100).toFixed(0)}%
                  </label>
                  <RangeSlider
                    value={confidenceLevel}
                    onChange={setConfidenceLevel}
                    min={0.80}
                    max={0.99}
                    step={0.01}
                    className="mb-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNormalOverlay}
                      onChange={(e) => setShowNormalOverlay(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-300">Show Normal Distribution</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showConfidenceInterval}
                      onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Show Confidence Interval</span>
                  </label>

                  {showNormalOverlay && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDifferenceArea}
                        onChange={(e) => setShowDifferenceArea(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-300">Show Difference Area</span>
                    </label>
                  )}
                </div>

                <button
                  className={cn(
                    "w-full px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 text-white"
                  )}
                  onClick={handleAnimateConvergence}
                >
                  Animate Convergence
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>

          {/* Critical Values Comparison */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Critical Values Comparison</h4>
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-3 gap-2 text-gray-400 border-b border-gray-700 pb-1">
                <div>CI Level</div>
                <div>t({degreesOfFreedom})</div>
                <div>Normal</div>
              </div>
              {[90, 95, 99].map(level => (
                <div key={level} className="grid grid-cols-3 gap-2 text-gray-300">
                  <div>{level}%</div>
                  <div className={cn(
                    criticalValues.t[level] > criticalValues.normal[level] * 1.1 
                      ? "text-amber-400 font-medium" 
                      : "text-gray-300"
                  )}>
                    ±{criticalValues.t[level].toFixed(3)}
                  </div>
                  <div>±{criticalValues.normal[level].toFixed(3)}</div>
                </div>
              ))}
            </div>
            {hoveredPoint && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-purple-400">
                  Hover point: x={hoveredPoint.x}, p={hoveredPoint.y}
                </p>
              </div>
            )}
          </VisualizationSection>

          {/* Educational Insights */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">{educationalContent.title}</h4>
            <div className="space-y-2 text-sm">
              <ul className="space-y-1 text-gray-300">
                {educationalContent.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              
              {/* Statistical Impact */}
              <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs">
                <p className="text-gray-400 mb-1">
                  <strong>Statistical Impact:</strong>
                </p>
                <p className="text-gray-300">
                  {sampleSize <= 10 
                    ? `Confidence intervals are ${((jStat.studentt.inv(0.975, degreesOfFreedom) / 1.96 - 1) * 100).toFixed(0)}% wider than normal`
                    : sampleSize < 30
                    ? `Critical value approaches normal as n increases (currently ${((jStat.studentt.inv(0.975, degreesOfFreedom) / 1.96 - 1) * 100).toFixed(1)}% wider)`
                    : `Difference from normal is negligible (${Math.abs(jStat.studentt.inv(0.975, degreesOfFreedom) - 1.96).toFixed(4)})`
                  }
                </p>
              </div>
              
              {/* Real-world Application */}
              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-xs">
                <p className="text-blue-400 mb-1">
                  <strong>Application:</strong>
                </p>
                <p className="text-gray-300">
                  {educationalContent.realWorldExample}
                </p>
              </div>
              
              {/* Observation Guide */}
              {showNormalOverlay && (
                <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded text-xs">
                  <p className="text-purple-300">
                    <strong>Observation:</strong> Compare the tail thickness between t and normal distributions. 
                    Notice how they converge as sample size increases.
                  </p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right side - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="450px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">
              t-Distribution with df = {degreesOfFreedom}
              {showNormalOverlay && <span className="text-xs font-normal text-gray-400 ml-2">vs Normal Distribution</span>}
            </h4>
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          {/* Key Concepts */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <VisualizationSection className="p-3">
              <h5 className="text-sm font-semibold text-amber-400 mb-2">When to Use t-Distribution</h5>
              <div className="space-y-2 text-xs text-gray-300">
                <div>
                  <strong className="text-emerald-400">Use t when:</strong>
                  <ul className="mt-1 space-y-0.5 ml-3">
                    <li>• σ is unknown (estimated from sample)</li>
                    <li>• Sample size is small (n &lt; 30)</li>
                    <li>• Population is normally distributed</li>
                  </ul>
                </div>
                <div className="mt-2 font-mono text-purple-400">
                  T = (X̄ - μ)/(S/√n)
                </div>
              </div>
            </VisualizationSection>
            
            <VisualizationSection className="p-3">
              <h5 className="text-sm font-semibold text-purple-400 mb-2">Understanding the Difference</h5>
              <div className="space-y-2 text-xs text-gray-300">
                <p>
                  The t-distribution has heavier tails because we're estimating σ from the sample.
                </p>
                <p className={cn(
                  "font-semibold",
                  sampleSize < 30 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {sampleSize < 30 
                    ? `With n=${sampleSize}, the difference is significant!`
                    : `With n=${sampleSize}, t ≈ normal distribution`}
                </p>
                <p className="text-gray-400 italic">
                  Try the "Animate Convergence" button!
                </p>
              </div>
            </VisualizationSection>
          </div>
          
          {/* Mathematical Discoveries */}
          <VisualizationSection className="mt-4 p-3">
            <MathematicalDiscoveries 
              discoveries={discoveries}
              title="Statistical Concepts Discovered"
            />
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}