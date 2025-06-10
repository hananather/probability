"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { cn, createColorScheme, typography, colors } from "@/lib/design-system";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { RangeSlider } from "@/components/ui/RangeSlider";

// Use sampling color scheme to match ExpectationVariance
const colorScheme = createColorScheme('sampling');

export function TDistributionExplorer() {
  const [sampleSize, setSampleSize] = useState(5);
  const [showNormalOverlay, setShowNormalOverlay] = useState(false);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showDifferenceArea, setShowDifferenceArea] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  
  const svgRef = useRef(null);
  const transitionRef = useRef(null);
  
  const degreesOfFreedom = Math.max(1, sampleSize - 1); // Ensure df >= 1

  // Educational insights based on sample size - matching ExpectationVariance style
  const getEducationalInsights = () => {
    if (sampleSize === 2) {
      return {
        stage: "minimum",
        title: "🎯 Minimum Sample Size!",
        insights: [
          "With n=2, we have only 1 degree of freedom",
          "The t-distribution has extremely heavy tails",
          "Much more uncertainty than normal distribution",
          "95% CI critical value: ±12.706 (vs ±1.96 for normal!)"
        ],
        realWorldExample: "Quality control with only 2 measurements - very unreliable!"
      };
    } else if (sampleSize <= 5) {
      return {
        stage: "small",
        title: "📊 Small Sample Territory",
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
        title: "📈 Approaching Normality",
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
        title: "✨ Large Sample Success!",
        insights: [
          `With n=${sampleSize}, df=${degreesOfFreedom}`,
          "T-distribution is nearly identical to normal!",
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

  // Cleanup function for D3 transitions
  const cleanup = useCallback(() => {
    if (transitionRef.current) {
      // Check if interrupt method exists before calling
      if (typeof transitionRef.current.interrupt === 'function') {
        transitionRef.current.interrupt();
      }
      transitionRef.current = null;
    }
  }, []);

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

    // Add gradient for t-distribution using colorScheme
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "t-gradient-enhanced")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.chart.primary)
      .attr("stop-opacity", 0.9);

    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", colorScheme.chart.primaryLight)
      .attr("stop-opacity", 0.9);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.chart.primary)
      .attr("stop-opacity", 0.9);

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

    // Draw t-distribution with animation
    const tPath = g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", "url(#t-gradient-enhanced)")
      .attr("stroke-width", 2.5)
      .attr("d", line)
      .style("opacity", 0);

    // Store the transition, not the selection
    const transition = tPath.transition()
      .duration(animationSpeed)
      .style("opacity", 1);
    
    // Store reference to the transition
    transitionRef.current = transition;

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
        .attr("stroke", "url(#t-gradient-enhanced)")
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

  // Animation controls
  const handleAnimateConvergence = () => {
    let n = 2;
    const interval = setInterval(() => {
      setSampleSize(n);
      n += 1;
      if (n > 50) {
        clearInterval(interval);
      }
    }, 100);
  };

  return (
    <VisualizationContainer
      title="📊 t-Distribution vs Normal Distribution"
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

          {/* Educational Insights - Matching ExpectationVariance style */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-600/30">
            <h4 className="text-base font-bold text-purple-300 mb-3">🎓 Learning Insights</h4>
            <div className="space-y-2 text-sm">
              {sampleSize === 2 && (
                <div>
                  <p className="text-purple-200">🎯 Minimum sample size - maximum uncertainty!</p>
                  <p className="text-purple-300 mt-1">
                    With only 1 degree of freedom, the t-distribution has extremely heavy tails.
                  </p>
                  <div className="mt-2 p-2 bg-indigo-900/30 rounded text-xs">
                    <p className="text-indigo-300">💡 <strong>Tip:</strong> Toggle the normal overlay to see the dramatic difference!</p>
                  </div>
                  <div className="mt-2 p-2 bg-amber-900/30 rounded text-xs">
                    <p className="text-amber-300">🎮 <strong>Challenge:</strong> Find the sample size where t ≈ normal</p>
                  </div>
                </div>
              )}
              
              {sampleSize > 2 && sampleSize <= 10 && (
                <div>
                  <p className="text-purple-200">📊 Small sample with {degreesOfFreedom} degrees of freedom</p>
                  <p className="text-purple-300 mt-1">
                    Critical value: ±{jStat.studentt.inv(0.975, degreesOfFreedom).toFixed(3)} (vs ±1.96 for normal)
                  </p>
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-600/30 rounded text-xs">
                    <p className="text-red-300">
                      ⚠️ <strong>Real impact:</strong> Confidence intervals are {((jStat.studentt.inv(0.975, degreesOfFreedom) / 1.96 - 1) * 100).toFixed(0)}% wider!
                    </p>
                  </div>
                </div>
              )}
              
              {sampleSize > 10 && sampleSize < 30 && (
                <div>
                  <p className="text-purple-200">📈 Getting closer with n={sampleSize}!</p>
                  <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                    <div className="text-xs text-purple-300">
                      🎯 Goal: Reach n=30 for normal approximation
                    </div>
                    <div className="mt-1.5">
                      <div className="w-full bg-purple-900/30 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((sampleSize / 30) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-center mt-1 text-purple-400 font-mono" style={{ fontSize: '10px' }}>
                        {sampleSize}/30
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {sampleSize >= 30 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Normal Approximation Territory!
                  </p>
                  <p className="text-purple-200 text-xs">
                    With n={sampleSize}, the t-distribution is practically indistinguishable from normal.
                  </p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Critical value difference:</span>
                      <span className="text-emerald-400 font-mono">
                        {Math.abs(jStat.studentt.inv(0.975, degreesOfFreedom) - 1.96).toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-green-900/20 border border-green-600/30 rounded text-xs">
                    <p className="text-green-300">
                      <strong>Engineering insight:</strong> {educationalContent.realWorldExample}
                    </p>
                  </div>
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
        </div>
      </div>
    </VisualizationContainer>
  );
}