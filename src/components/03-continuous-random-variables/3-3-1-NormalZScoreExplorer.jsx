"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { NormalZScoreWorkedExample } from "./3-3-2-NormalZScoreWorkedExample";
import { RotateCcw } from "lucide-react";
import * as jStat from "jstat";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { tutorial_3_3_1 } from '@/tutorials/chapter3';

// LaTeX content wrapper component to prevent re-renders
const LatexContent = memo(function LatexContent({ children }) {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [children]);
  
  return <span ref={contentRef}>{children}</span>;
});

// Separated visualization component to prevent re-renders
const NormalVisualization = memo(({ 
  mu, 
  sigma, 
  xValue, 
  onXValueChange,
  onDragStart,
  onDragEnd
}) => {
  const svgRef = useRef(null);
  const isInitialized = useRef(false);
  const scalesRef = useRef({});
  const elementsRef = useRef({});
  
  // Calculate derived values
  const zScore = (xValue - mu) / sigma;
  const probability = jStat.normal.cdf(zScore, 0, 1);
  
  // Initialize SVG structure (only once)
  useEffect(() => {
    if (!svgRef.current || isInitialized.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 800; // Increased height for better spacing
    const margin = { top: 80, right: 60, bottom: 80, left: 60 }; // More generous margins
    const plotHeight = (height - margin.top - margin.bottom - 140) / 2; // More space between plots
    const innerWidth = width - margin.left - margin.right;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Gradient definitions
    const defs = svg.append("defs");
    
    // Background gradient
    const bgGradient = defs.append("linearGradient")
      .attr("id", "bgGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#0f172a;stop-opacity:1");
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#1e293b;stop-opacity:1");
    
    // Primary gradient (for shaded areas)
    const primaryGradient = defs.append("linearGradient")
      .attr("id", "primaryGradientNormal")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    primaryGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#06b6d4")
      .attr("stop-opacity", 0.8);
    
    primaryGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0891b2")
      .attr("stop-opacity", 0.3);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bgGradient)");
    
    // Create main group
    const g = svg.append("g");
    
    // Plot backgrounds
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", plotHeight)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("rx", 4);
    
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top + plotHeight + 140) // Increased gap between plots
      .attr("width", innerWidth)
      .attr("height", plotHeight)
      .attr("fill", "#1a1a1a")
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 1)
      .attr("rx", 4);
    
    // Titles with better spacing
    elementsRef.current.topTitle = g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 35) // Move up to avoid overlap with x value label
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#f3f4f6");
    
    elementsRef.current.bottomTitle = g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 105) // Slightly closer
      .attr("text-anchor", "middle")
      .style("font-size", "14px") // Reduced from 18px
      .style("font-weight", "500")
      .style("fill", "#f3f4f6")
      .text("Standard Normal: Z ~ N(0, 1)");
    
    // Axes groups
    elementsRef.current.xAxisTop = g.append("g")
      .attr("transform", `translate(0,${margin.top + plotHeight})`);
    
    elementsRef.current.xAxisBottom = g.append("g")
      .attr("transform", `translate(0,${margin.top + plotHeight + 140 + plotHeight})`);
    
    elementsRef.current.yAxisTop = g.append("g")
      .attr("transform", `translate(${margin.left},0)`);
    
    elementsRef.current.yAxisBottom = g.append("g")
      .attr("transform", `translate(${margin.left},0)`);
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 50) // More space for x-axis label
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#e5e7eb")
      .text("x");
    
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 140 + plotHeight + 50) // More space for z-axis label
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#e5e7eb")
      .text("z");
    
    // Distribution paths
    elementsRef.current.areaTop = g.append("path");
    elementsRef.current.lineTop = g.append("path");
    elementsRef.current.areaBottom = g.append("path");
    elementsRef.current.lineBottom = g.append("path");
    
    // Mean line
    elementsRef.current.meanLine = g.append("line");
    
    // Sigma markers group
    elementsRef.current.sigmaMarkers = g.append("g");
    
    // Value lines and labels
    elementsRef.current.xLine = g.append("line");
    elementsRef.current.zLine = g.append("line");
    elementsRef.current.xLabel = g.append("text");
    elementsRef.current.zLabel = g.append("text");
    
    // Draggable marker will be added here
    elementsRef.current.draggableMarker = null;
    
    // Add transformation formula as subtle text between plots (no arrow box)
    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + plotHeight + 70)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "400")
      .style("fill", "#9ca3af")
      .style("opacity", 0.8)
      .text("Transform: z = (x - μ) / σ");
    
    // Store dimensions
    scalesRef.current.dimensions = { 
      width, height, margin, plotHeight, innerWidth
    };
    
    elementsRef.current.g = g;
    
    isInitialized.current = true;
  }, []);
  
  // Update visualization when parameters change
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const { margin, plotHeight, innerWidth } = scalesRef.current.dimensions;
    const colorScheme = createColorScheme('inference');
    
    // Fixed scales
    const xScaleTop = d3.scaleLinear()
      .domain([0, 200])
      .range([margin.left, margin.left + innerWidth]);
    
    const xScaleBottom = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, margin.left + innerWidth]);
    
    const yScaleTop = d3.scaleLinear()
      .domain([0, 0.03])
      .range([margin.top + plotHeight, margin.top]);
    
    const yScaleBottom = d3.scaleLinear()
      .domain([0, 0.45])
      .range([margin.top + plotHeight + 140 + plotHeight, margin.top + plotHeight + 140]);
    
    // Store scales
    scalesRef.current.xScaleTop = xScaleTop;
    scalesRef.current.xScaleBottom = xScaleBottom;
    scalesRef.current.yScaleTop = yScaleTop;
    scalesRef.current.yScaleBottom = yScaleBottom;
    
    // Normal PDF function
    const normalPDF = (x, mean, sd) => {
      const exp = -0.5 * Math.pow((x - mean) / sd, 2);
      return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };
    
    // Generate data
    const topData = d3.range(0, 200, 0.5)
      .map(x => ({ x, y: normalPDF(x, mu, sigma) }));
    
    const bottomData = d3.range(-4, 4, 0.05)
      .map(z => ({ x: z, y: normalPDF(z, 0, 1) }));
    
    // Update title
    elementsRef.current.topTitle
      .text(`Original Distribution: X ~ N(μ=${mu}, σ=${sigma})`);
    
    // Update axes
    const xAxisTop = d3.axisBottom(xScaleTop).ticks(10).tickFormat(d => d.toFixed(0));
    const xAxisBottom = d3.axisBottom(xScaleBottom).tickValues([-3, -2, -1, 0, 1, 2, 3]);
    const yAxisTop = d3.axisLeft(yScaleTop).ticks(5);
    const yAxisBottom = d3.axisLeft(yScaleBottom).ticks(5);
    
    elementsRef.current.xAxisTop.call(xAxisTop);
    elementsRef.current.xAxisBottom.call(xAxisBottom);
    elementsRef.current.yAxisTop.call(yAxisTop);
    elementsRef.current.yAxisBottom.call(yAxisBottom);
    
    // Style axes
    [elementsRef.current.xAxisTop, elementsRef.current.xAxisBottom, 
     elementsRef.current.yAxisTop, elementsRef.current.yAxisBottom].forEach(axis => {
      axis.selectAll("path, line").attr("stroke", colorScheme.chart.grid);
      axis.selectAll("text").attr("fill", colorScheme.chart.text);
    });
    
    // Area and line generators
    const areaTop = d3.area()
      .x(d => xScaleTop(d.x))
      .y0(margin.top + plotHeight)
      .y1(d => yScaleTop(d.y))
      .curve(d3.curveBasis);
    
    const lineTop = d3.line()
      .x(d => xScaleTop(d.x))
      .y(d => yScaleTop(d.y))
      .curve(d3.curveBasis);
    
    const areaBottom = d3.area()
      .x(d => xScaleBottom(d.x))
      .y0(margin.top + plotHeight + 140 + plotHeight)
      .y1(d => yScaleBottom(d.y))
      .curve(d3.curveBasis);
    
    const lineBottom = d3.line()
      .x(d => xScaleBottom(d.x))
      .y(d => yScaleBottom(d.y))
      .curve(d3.curveBasis);
    
    // Update areas (shaded up to current value)
    const areaDataTop = topData.filter(d => d.x <= xValue);
    const areaDataBottom = bottomData.filter(d => d.x <= zScore);
    
    elementsRef.current.areaTop
      .datum(areaDataTop)
      .attr("d", areaTop)
      .attr("fill", "url(#primaryGradientNormal)")
      .attr("opacity", 0.8)
      .attr("filter", "drop-shadow(0 0 10px rgba(6, 182, 212, 0.3))");
    
    elementsRef.current.areaBottom
      .datum(areaDataBottom)
      .attr("d", areaBottom)
      .attr("fill", "url(#primaryGradientNormal)")
      .attr("opacity", 0.8)
      .attr("filter", "drop-shadow(0 0 10px rgba(6, 182, 212, 0.3))");
    
    // Update lines
    elementsRef.current.lineTop
      .datum(topData)
      .attr("d", lineTop)
      .attr("stroke", "#06b6d4")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("filter", "drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))");
    
    elementsRef.current.lineBottom
      .datum(bottomData)
      .attr("d", lineBottom)
      .attr("stroke", "#06b6d4")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("filter", "drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))");
    
    // Update mean line
    elementsRef.current.meanLine
      .attr("x1", xScaleTop(mu))
      .attr("y1", margin.top)
      .attr("x2", xScaleTop(mu))
      .attr("y2", margin.top + plotHeight)
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6)
      .attr("stroke-dasharray", "5,5")
      .attr("filter", "drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))");
    
    // Update sigma markers
    const sigmaData = [-3, -2, -1, 1, 2, 3]
      .map(n => ({ n, x: mu + n * sigma }))
      .filter(d => d.x >= 0 && d.x <= 200);
    
    const sigmaMarkers = elementsRef.current.sigmaMarkers
      .selectAll("g")
      .data(sigmaData);
    
    const sigmaEnter = sigmaMarkers.enter().append("g");
    sigmaEnter.append("line");
    sigmaEnter.append("text");
    
    sigmaMarkers.merge(sigmaEnter).select("line")
      .attr("x1", d => xScaleTop(d.x))
      .attr("y1", margin.top + plotHeight - 5)
      .attr("x2", d => xScaleTop(d.x))
      .attr("y2", margin.top + plotHeight)
      .attr("stroke", colorScheme.chart.text)
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
    
    sigmaMarkers.merge(sigmaEnter).select("text")
      .attr("x", d => xScaleTop(d.x))
      .attr("y", margin.top + plotHeight + 25) // Slightly lower to avoid overlap
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .style("font-weight", "500")
      .style("fill", "#fbbf24")
      .style("opacity", 0.8)
      .text(d => `${d.n > 0 ? '+' : ''}${d.n}σ`);
    
    sigmaMarkers.exit().remove();
    
    // Update value lines
    elementsRef.current.xLine
      .attr("x1", xScaleTop(xValue))
      .attr("y1", margin.top)
      .attr("x2", xScaleTop(xValue))
      .attr("y2", margin.top + plotHeight)
      .attr("stroke", "#f97316")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("filter", "drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))");
    
    elementsRef.current.zLine
      .attr("x1", xScaleBottom(zScore))
      .attr("y1", margin.top + plotHeight + 140) // Updated for new spacing
      .attr("x2", xScaleBottom(zScore))
      .attr("y2", margin.top + plotHeight + 140 + plotHeight)
      .attr("stroke", "#f97316")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("filter", "drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))");
    
    // Update labels
    elementsRef.current.xLabel
      .attr("x", xScaleTop(xValue))
      .attr("y", margin.top - 10) // More clearance from plot
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-family", "monospace")
      .style("font-weight", "600")
      .style("fill", "#f97316")
      .style("filter", "drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))")
      .text(`x = ${xValue.toFixed(1)}`);
    
    elementsRef.current.zLabel
      .attr("x", xScaleBottom(zScore))
      .attr("y", margin.top + plotHeight + 125) // Updated for new spacing
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-family", "monospace")
      .style("font-weight", "600")
      .style("fill", "#f97316")
      .style("filter", "drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))")
      .text(`z = ${zScore.toFixed(3)}`);
    
  }, [mu, sigma, xValue, zScore]);
  
  // Add draggable marker after SVG is initialized
  useEffect(() => {
    if (!isInitialized.current || !scalesRef.current.xScaleTop || !elementsRef.current.g) return;
    
    const g = elementsRef.current.g;
    const xScaleTop = scalesRef.current.xScaleTop;
    const { margin, plotHeight } = scalesRef.current.dimensions;
    const colorScheme = createColorScheme('inference');
    
    // Remove existing marker if any
    if (elementsRef.current.draggableMarker) {
      elementsRef.current.draggableMarker.remove();
    }
    
    // Create draggable marker
    const marker = g.append('g')
      .attr('class', 'draggable-marker')
      .attr('transform', `translate(${xScaleTop(xValue)}, ${margin.top + plotHeight})`);
    
    marker.append('circle')
      .attr('r', 8)
      .attr('fill', colorScheme.chart.secondary)
      .attr('stroke', colorScheme.chart.secondaryLight)
      .attr('stroke-width', 2)
      .style('cursor', 'ew-resize');
    
    // Add drag behavior
    const drag = d3.drag()
      .on('start', onDragStart)
      .on('drag', (event) => {
        const newX = xScaleTop.invert(event.x);
        const clampedX = Math.max(0, Math.min(200, newX));
        onXValueChange(clampedX);
      })
      .on('end', onDragEnd);
    
    marker.call(drag);
    
    // Store reference
    elementsRef.current.draggableMarker = marker;
    
  }, [xValue, onXValueChange, onDragStart, onDragEnd]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: 800 }} />;
});

const NormalZScoreExplorer = () => {
  const colorScheme = createColorScheme('inference');
  
  // Parameters
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [xValue, setXValue] = useState(115);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showTransformation, setShowTransformation] = useState(false);
  
  // Calculated values
  const zScore = (xValue - mu) / sigma;
  const probability = jStat.normal.cdf(zScore, 0, 1);
  
  // Track meaningful interactions only
  const lastParams = useRef({ mu, sigma });
  const hasDragged = useRef(false);
  
  // Increment interaction count only on meaningful changes
  useEffect(() => {
    const paramsChanged = Math.abs(lastParams.current.mu - mu) > 1 || 
                         Math.abs(lastParams.current.sigma - sigma) > 0.5;
    
    if (paramsChanged && interactionCount > 0) {
      setInteractionCount(prev => prev + 1);
      lastParams.current = { mu, sigma };
    }
  }, [mu, sigma]);
  
  // Reset function
  const handleReset = () => {
    setMu(100);
    setSigma(15);
    setXValue(115);
    setInteractionCount(0);
    setShowTransformation(false);
    hasDragged.current = false;
    lastParams.current = { mu: 100, sigma: 15 };
  };
  
  // Drag handlers
  const handleDragStart = useCallback(() => {
    if (!hasDragged.current) {
      hasDragged.current = true;
      setInteractionCount(1);
    }
  }, []);
  
  const handleDragEnd = useCallback(() => {
    // Could add any end-of-drag logic here
  }, []);
  
  // Educational insights
  const getInsight = () => {
    if (interactionCount === 0) {
      return {
        message: <span>Welcome! Let's see how any Normal distribution <span dangerouslySetInnerHTML={{ __html: `\\(N(\\mu,\\sigma^2)\\)` }} /> can be 'standardized' to the <span dangerouslySetInnerHTML={{ __html: `\\(N(0,1)\\)` }} /> Z-distribution. Change <span dangerouslySetInnerHTML={{ __html: `\\(\\mu\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />, and <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> to see the magic.</span>,
        stage: 0
      };
    } else if (interactionCount <= 5) {
      return {
        message: <span>Play with <span dangerouslySetInnerHTML={{ __html: `\\(\\mu\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />. Notice the top curve changes shape and position, but the bottom Z-curve is fixed. The x-value you pick on top has a corresponding z-value on the bottom.</span>,
        stage: 1
      };
    } else if (interactionCount <= 14) {
      const specialCase1 = Math.abs(xValue - mu) < 0.5 ? 
        <span> Try setting <span dangerouslySetInnerHTML={{ __html: `\\(x=\\mu\\)` }} />. What is the z-score? What is the probability <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z)\\)` }} />? (Should be <span dangerouslySetInnerHTML={{ __html: `\\(z=0\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(0)=0.5\\)` }} />)</span> : null;
      
      const specialCase2 = <span> What happens to <span dangerouslySetInnerHTML={{ __html: `\\(z\\)` }} /> if you increase <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> while keeping <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(\\mu\\)` }} /> the same distance apart? (Z gets smaller)</span>;
      
      return {
        message: <span>The shaded areas represent <span dangerouslySetInnerHTML={{ __html: `\\(P(X\\leq x)\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(P(Z\\leq z)\\)` }} />. Observe that these probabilities (areas) are always equal! The z-score tells you how many 'standard units' <span dangerouslySetInnerHTML={{ __html: `\\(x\\)` }} /> is away from its mean.{specialCase1}{specialCase2}</span>,
        stage: 2
      };
    } else {
      return {
        message: <span>✨ Standardization Mastered! You've seen that <span dangerouslySetInnerHTML={{ __html: `\\(P(X\\leq x)=\\Phi\\left(\\frac{x-\\mu}{\\sigma}\\right)\\)` }} />. This is powerful because we only need one table (or function) for the Standard Normal CDF, <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z)\\)` }} />, to find probabilities for any Normal distribution.</span>,
        stage: 3,
        application: <span>Engineering Application: Imagine testing steel rods. Spec: length = 500±2mm. Your process gives <span dangerouslySetInnerHTML={{ __html: `\\(\\mu=500\\text{mm}\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma=0.5\\text{mm}\\)` }} />. A rod at 501mm has <span dangerouslySetInnerHTML={{ __html: `\\(z=\\frac{501-500}{0.5}=+2\\)` }} />. A rod at 498.5mm has <span dangerouslySetInnerHTML={{ __html: `\\(z=\\frac{498.5-500}{0.5}=-3\\)` }} />. This tells you immediately how 'typical' or 'extreme' these rods are relative to your process variation, without needing a new probability curve for every spec!</span>
      };
    }
  };
  
  const insight = getInsight();
  const progressPercent = Math.min((interactionCount / 15) * 100, 100);
  
  return (
    <VisualizationContainer
      title="📊 Normal Distribution & Z-Score Explorer"
      description={
        <>
          <p className={typography.description}>
            <strong>How do we standardize any normal distribution?</strong> The Z-score transformation 
            converts any Normal distribution <span dangerouslySetInnerHTML={{ __html: `\\(N(\\mu,\\sigma^2)\\)` }} /> to the Standard Normal <span dangerouslySetInnerHTML={{ __html: `\\(N(0,1)\\)` }} />.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            <span className="text-teal-400">Z-scores</span> tell us how many standard deviations 
            a value is from the mean. Watch how the <span className="text-orange-400">transformation preserves probabilities</span>!
          </p>
        </>
      }
      tutorialSteps={tutorial_3_3_1}
      tutorialKey="normal-z-score-explorer-3-3-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Controls and Stats */}
        <div className="lg:w-1/3 space-y-4">
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Distribution Parameters</h4>
            <ControlGroup>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Mean (μ): {mu}
                  </label>
                  <RangeSlider
                    value={mu}
                    onChange={(v) => setMu(v)}
                    min={50}
                    max={150}
                    step={1}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Standard Deviation (σ): {sigma}
                  </label>
                  <RangeSlider
                    value={sigma}
                    onChange={(v) => setSigma(v)}
                    min={5}
                    max={30}
                    step={1}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    x-value: {xValue.toFixed(1)}
                  </label>
                  <RangeSlider
                    value={xValue}
                    onChange={(v) => setXValue(v)}
                    min={0}
                    max={200}
                    step={0.1}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-400">
                    Or drag the orange point on the visualization
                  </p>
                </div>
                
                <button
                  className={cn(
                    "w-full px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset All
                </button>
              </div>
            </ControlGroup>
          </VisualizationSection>
          
          {/* Statistics Display */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Calculated Values</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current x:</span>
                <span className="text-white font-medium">{xValue.toFixed(1)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Z-Score:</span>
                  <span className="text-teal-400 font-mono font-medium">{zScore.toFixed(4)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  <LatexContent>
                    <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{x - \\mu}{\\sigma} = \\frac{${xValue.toFixed(1)} - ${mu}}{${sigma}} = ${((xValue - mu) / sigma).toFixed(4)}\\)` }} />
                  </LatexContent>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">
                    <LatexContent>
                      <span dangerouslySetInnerHTML={{ __html: `\\(P(X \\leq ${xValue.toFixed(1)})\\):` }} />
                    </LatexContent>
                  </span>
                  <span className="text-orange-400 font-mono font-medium">{probability.toFixed(4)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <LatexContent>
                    <span dangerouslySetInnerHTML={{ __html: `\\(= P(Z \\leq ${zScore.toFixed(4)}) = \\Phi(${zScore.toFixed(4)})\\)` }} />
                  </LatexContent>
                </div>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Educational Insights - 4 Stage System */}
          <VisualizationSection className="p-3 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-600/30">
            <h4 className="text-base font-bold text-teal-300 mb-3">Learning Insights</h4>
            <div className="space-y-2 text-sm">
              {insight.stage === 0 && (
                <div>
                  <p className="text-teal-200"><LatexContent>{insight.message}</LatexContent></p>
                  <div className="mt-2 p-2 bg-cyan-900/30 rounded text-xs">
                    <p className="text-cyan-300">💡 <strong>Tip:</strong> Try dragging the orange dot on the top plot!</p>
                  </div>
                </div>
              )}
              
              {insight.stage === 1 && (
                <div>
                  <p className="text-teal-200"><LatexContent>{insight.message}</LatexContent></p>
                </div>
              )}
              
              {insight.stage === 2 && (
                <div>
                  <p className="text-teal-200"><LatexContent>{insight.message}</LatexContent></p>
                  {interactionCount > 0 && interactionCount < 15 && (
                    <div className="mt-2 p-2 bg-teal-900/20 border border-teal-600/30 rounded">
                      <div className="text-xs text-teal-300">
                        🎯 Goal: {15 - interactionCount} more interactions to master standardization!
                      </div>
                      <div className="mt-1.5">
                        <div className="w-full bg-teal-900/30 rounded-full h-1.5">
                          <div 
                            className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="text-center mt-1 text-teal-400 font-mono" style={{ fontSize: '10px' }}>
                          {interactionCount}/15
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {insight.stage === 3 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    <LatexContent>{insight.message}</LatexContent>
                  </p>
                  {insight.application && (
                    <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-600/30 rounded">
                      <p className="text-emerald-200 text-xs"><LatexContent>{insight.application}</LatexContent></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right side - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="700px">
            <h4 className="text-sm font-semibold text-white mb-2 px-4 pt-3">
              Normal Distribution Standardization
              <span className="text-xs font-normal text-gray-400 ml-2">(drag the orange point to explore)</span>
            </h4>
            <NormalVisualization
              mu={mu}
              sigma={sigma}
              xValue={xValue}
              onXValueChange={setXValue}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </GraphContainer>
        </div>
      </div>

      {/* Worked Example */}
      <VisualizationSection divider className="mt-4">
        <NormalZScoreWorkedExample 
          mu={mu}
          sigma={sigma}
          xValue={xValue}
          zScore={zScore}
          probability={probability}
        />
      </VisualizationSection>
    </VisualizationContainer>
  );
};

export default NormalZScoreExplorer;