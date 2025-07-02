"use client";

import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import BackToHub from '../ui/BackToHub';
import { MathematicalDiscoveries, useDiscoveries } from '@/components/ui/MathematicalDiscoveries';
import { D3DragWrapper } from '../ui/D3DragWrapper';

const colorScheme = createColorScheme('hypothesis');

// Sample data from manufacturing process
const SAMPLE_DATA = [
  42.5, 39.8, 40.3, 43.1, 39.6, 41.0,
  39.9, 42.1, 40.7, 41.6, 42.1, 40.8
];

// Simplified learning journey
const LEARNING_JOURNEY = [
  {
    id: 'explore',
    title: 'Explore the Evidence',
    description: 'Is our new process really better?',
    icon: '🔍'
  },
  {
    id: 'methods',
    title: 'Two Ways to Decide',
    description: 'Critical values vs p-values',
    icon: '⚖️'
  },
  {
    id: 'connect',
    title: 'The Big Picture',
    description: 'How it all connects',
    icon: '🔗'
  }
];

// Discovery definitions
const discoveryDefinitions = [
  {
    id: 'sample-evidence',
    title: 'Sample Evidence',
    description: 'Your sample suggests the process improved!',
    formula: '\\bar{x} = 41.125 > \\mu_0 = 40',
    category: 'pattern'
  },
  {
    id: 'standardization',
    title: 'Standardization',
    description: 'Converting evidence to a universal scale',
    formula: 'Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}',
    category: 'formula'
  },
  {
    id: 'critical-decision',
    title: 'Critical Value Rule',
    description: 'Evidence beyond the threshold means reject H₀',
    category: 'concept'
  },
  {
    id: 'p-value-meaning',
    title: 'P-Value Insight',
    description: 'The probability of seeing this if nothing changed',
    category: 'concept'
  },
  {
    id: 'equivalence',
    title: 'Method Equivalence',
    description: 'All approaches lead to the same decision!',
    category: 'pattern'
  }
];

export default function TestForMeanKnownVariance() {
  // State management
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hypothesisType, setHypothesisType] = useState('right');
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [criticalValue, setCriticalValue] = useState(1.645);
  const [isDragging, setIsDragging] = useState(false);
  const [showPValue, setShowPValue] = useState(false);
  const [showCI, setShowCI] = useState(false);
  
  // Animation refs
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  
  // Known parameters
  const mu0 = 40;
  const sigma = 1.2;
  const n = SAMPLE_DATA.length;
  const sampleMean = useMemo(() => 
    SAMPLE_DATA.reduce((sum, x) => sum + x, 0) / n, []
  );
  
  // Discovery tracking
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions);
  
  // Calculate test statistic
  const testStatistic = useMemo(() => 
    (sampleMean - mu0) / (sigma / Math.sqrt(n)), [sampleMean]
  );
  
  // Calculate critical values based on hypothesis type
  const criticalValues = useMemo(() => {
    const z = jStat.normal.inv(1 - significanceLevel, 0, 1);
    
    switch (hypothesisType) {
      case 'left':
        return { lower: -z, upper: null };
      case 'right':
        return { lower: null, upper: z };
      case 'two':
        const z2 = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
        return { lower: -z2, upper: z2 };
    }
  }, [hypothesisType, significanceLevel]);
  
  // Calculate p-value
  const pValue = useMemo(() => {
    switch (hypothesisType) {
      case 'left':
        return jStat.normal.cdf(testStatistic, 0, 1);
      case 'right':
        return 1 - jStat.normal.cdf(testStatistic, 0, 1);
      case 'two':
        return 2 * (1 - jStat.normal.cdf(Math.abs(testStatistic), 0, 1));
    }
  }, [testStatistic, hypothesisType]);
  
  // Start initial animation
  useEffect(() => {
    let start = null;
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 1500, 1);
      
      progressRef.current = progress;
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    setTimeout(() => {
      setIsAnimating(true);
      animationRef.current = requestAnimationFrame(animate);
    }, 500);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Progress calculation
  const progress = (discoveries.length / discoveryDefinitions.length) * 100;
  
  return (
    <VisualizationContainer
      title="Is Our Manufacturing Process Better?"
      description="Use hypothesis testing to make data-driven decisions"
    >
      {/* Back to Hub Button */}
      <BackToHub chapter={6} />
      
      {/* Minimal Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {LEARNING_JOURNEY.map((journey, idx) => (
            <div
              key={journey.id}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-500",
                idx === stage 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                  : idx < stage
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "bg-neutral-800 text-neutral-500"
              )}
            >
              <span className="mr-2">{journey.icon}</span>
              {journey.title}
            </div>
          ))}
        </div>
        <div className="text-sm text-neutral-400">
          {discoveries.length}/{discoveryDefinitions.length} discoveries
        </div>
      </div>
      
      {/* Main Visualization Area */}
      <div className="relative">
        {/* Stage 0: Initial Hook */}
        {stage === 0 && <InitialExploration />}
        
        {/* Stage 1: Two Methods */}
        {stage === 1 && <TwoMethods />}
        
        {/* Stage 2: Big Picture */}
        {stage === 2 && <BigPicture />}
      </div>
      
      {/* Mathematical Discoveries */}
      {discoveries.length > 0 && (
        <MathematicalDiscoveries 
          discoveries={discoveries}
          title="Your Discoveries"
          className="mt-6"
        />
      )}
    </VisualizationContainer>
  );
  
  // Stage 0: Initial Exploration
  function InitialExploration() {
    const svgRef = useRef(null);
    const [revealed, setRevealed] = useState(false);
    
    useEffect(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const { width } = svgRef.current.getBoundingClientRect();
      const height = 400;
      const margin = { top: 40, right: 40, bottom: 80, left: 60 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Gradient definitions
      const defs = svg.append("defs");
      
      // Blue gradient for normal curve
      const blueGradient = defs.append("linearGradient")
        .attr("id", "blue-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
        
      blueGradient.append("stop")
        .attr("offset", "0%")
        .attr("style", "stop-color:#3b82f6;stop-opacity:0.8");
        
      blueGradient.append("stop")
        .attr("offset", "100%")
        .attr("style", "stop-color:#1e40af;stop-opacity:0.3");
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([37, 45])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 1.5])
        .range([height - margin.bottom, margin.top]);
      
      // Draw axes
      const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("opacity", 0);
        
      xAxis.transition()
        .duration(800)
        .style("opacity", 1)
        .call(d3.axisBottom(xScale).ticks(9));
        
      xAxis.append("text")
        .attr("x", width / 2)
        .attr("y", 45)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Component Strength (units)");
      
      // Draw hypothetical population distribution
      const populationCurve = d3.range(37, 45, 0.1).map(x => ({
        x: x,
        y: jStat.normal.pdf(x, mu0, sigma)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveNatural);
      
      // Population curve (old process)
      const popPath = svg.append("path")
        .datum(populationCurve)
        .attr("fill", "url(#blue-gradient)")
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        )
        .style("opacity", 0);
        
      popPath.transition()
        .duration(1000)
        .style("opacity", 1);
      
      // Add label for old process
      svg.append("text")
        .attr("x", xScale(mu0))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text("Old Process μ = 40")
        .transition()
        .delay(500)
        .duration(800)
        .style("opacity", 1);
      
      // Draw sample points
      const sampleGroup = svg.append("g");
      
      SAMPLE_DATA.forEach((value, i) => {
        sampleGroup.append("circle")
          .attr("cx", xScale(value))
          .attr("cy", height - margin.bottom - 20)
          .attr("r", 0)
          .attr("fill", "#10b981")
          .style("filter", "drop-shadow(0 0 4px #10b981)")
          .transition()
          .delay(1500 + i * 100)
          .duration(500)
          .attr("r", 6)
          .transition()
          .duration(300)
          .attr("r", 4);
      });
      
      // Sample mean line
      const meanLine = svg.append("line")
        .attr("x1", xScale(sampleMean))
        .attr("x2", xScale(sampleMean))
        .attr("y1", height - margin.bottom)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0 0 6px #10b981)")
        .style("opacity", 0);
        
      meanLine.transition()
        .delay(2500)
        .duration(800)
        .attr("y2", margin.top)
        .style("opacity", 1);
      
      // Sample mean label
      svg.append("text")
        .attr("x", xScale(sampleMean))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(`New Sample x̄ = ${sampleMean.toFixed(3)}`)
        .transition()
        .delay(3000)
        .duration(800)
        .style("opacity", 1);
      
      // Question mark that transforms to exclamation
      const questionGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
        
      questionGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "48px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text("?")
        .transition()
        .delay(3500)
        .duration(500)
        .style("opacity", 1)
        .transition()
        .delay(1000)
        .duration(300)
        .style("opacity", 0)
        .on("end", function() {
          d3.select(this).text("!");
        })
        .transition()
        .duration(300)
        .style("opacity", 1)
        .style("fill", "#10b981");
        
      // Reveal insights after animation
      setTimeout(() => {
        setRevealed(true);
        if (!discoveries.includes('sample-evidence')) {
          markDiscovered('sample-evidence');
        }
      }, 5000);
      
    }, []);
    
    return (
      <GraphContainer>
        <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
        
        {revealed && (
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-700/30">
              <h3 className="text-lg font-semibold text-white mb-3">
                The Evidence Speaks! 🎯
              </h3>
              <p className="text-neutral-300 mb-4">
                Your sample average (<span className="font-mono text-green-400">{sampleMean.toFixed(3)}</span>) is higher than the old process average (<span className="font-mono text-blue-400">{mu0}</span>).
                But is this difference real or just random chance?
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setStage(1)}
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30"
                >
                  Let's Find Out! →
                </Button>
                <span className="text-sm text-neutral-400">
                  We need a systematic way to decide...
                </span>
              </div>
            </div>
          </div>
        )}
      </GraphContainer>
    );
  }
  
  // Stage 1: Two Methods
  function TwoMethods() {
    const criticalRef = useRef(null);
    const pValueRef = useRef(null);
    const [method, setMethod] = useState('critical');
    const [customCritical, setCustomCritical] = useState(criticalValues.upper || 1.645);
    const isInitialized = useRef(false);
    const criticalLineRef = useRef(null);
    const criticalTextRef = useRef(null);
    const areaRef = useRef(null);
    const decisionTextRef = useRef(null);
    
    useEffect(() => {
      if (!discoveries.includes('standardization')) {
        markDiscovered('standardization');
      }
      
      // Initialize both visualizations
      if (!isInitialized.current) {
        initializeCriticalValue();
        animatePValue();
        isInitialized.current = true;
      }
    }, []);
    
    // Update critical value visualization when custom value changes
    useEffect(() => {
      if (isInitialized.current) {
        updateCriticalValue();
      }
    }, [customCritical]);
    
    const initializeCriticalValue = () => {
      if (!criticalRef.current) return;
      
      const svg = d3.select(criticalRef.current);
      const { width } = criticalRef.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 60, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Create gradient
      const defs = svg.append("defs");
      
      const redGradient = defs.append("linearGradient")
        .attr("id", "red-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");
        
      redGradient.append("stop")
        .attr("offset", "0%")
        .attr("style", "stop-color:#ef4444;stop-opacity:0.8");
        
      redGradient.append("stop")
        .attr("offset", "100%")
        .attr("style", "stop-color:#dc2626;stop-opacity:0.3");
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Store scales for drag handler
      svg.node().__scales = { xScale, yScale };
      
      // Normal curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(9));
      
      // Draw normal curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Critical region (will be updated)
      areaRef.current = svg.append("path")
        .attr("fill", "url(#red-gradient)")
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(yScale(0))
          .curve(d3.curveNatural)
        );
      
      // Draggable critical value group
      const criticalGroup = svg.append("g")
        .attr("cursor", "ew-resize");
        
      criticalLineRef.current = criticalGroup.append("line")
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.45))
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0 0 6px #ef4444)");
      
      // Add drag indicator with visual feedback
      const dragHandle = criticalGroup.append("g");
      
      // Glow effect when hovering
      dragHandle.append("circle")
        .attr("cy", yScale(0.22))
        .attr("r", 12)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .style("filter", "blur(8px)")
        .classed("drag-glow", true);
      
      // Visible drag handle
      dragHandle.append("circle")
        .attr("cy", yScale(0.22))
        .attr("r", 8)
        .attr("fill", "#ef4444")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("cursor", "ew-resize");
      
      // Drag indicator arrows
      dragHandle.append("text")
        .attr("y", yScale(0.22) + 1)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text("⟷");
        
      criticalTextRef.current = criticalGroup.append("text")
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("font-weight", "bold");
      
      // Implement drag behavior
      const drag = d3.drag()
        .on("start", function(event) {
          d3.select(this).style("cursor", "grabbing");
          // Enhance glow on drag start
          d3.select(this).select(".drag-glow")
            .transition()
            .duration(200)
            .attr("r", 20)
            .attr("opacity", 0.5);
          setIsDragging(true);
        })
        .on("drag", function(event) {
          const newX = Math.max(margin.left, Math.min(width - margin.right, event.x));
          const newZ = xScale.invert(newX);
          const clampedZ = Math.max(0, Math.min(3, newZ));
          setCustomCritical(clampedZ);
        })
        .on("end", function() {
          d3.select(this).style("cursor", "ew-resize");
          // Return glow to normal
          d3.select(this).select(".drag-glow")
            .transition()
            .duration(200)
            .attr("r", 12)
            .attr("opacity", 0.3);
          setIsDragging(false);
        });
      
      criticalGroup.call(drag);
      
      // Test statistic (static)
      const testLine = svg.append("line")
        .attr("x1", xScale(testStatistic))
        .attr("x2", xScale(testStatistic))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "#10b981")
        .attr("stroke-width", 4)
        .style("filter", "drop-shadow(0 0 8px #10b981)");
        
      testLine.transition()
        .delay(1200)
        .duration(800)
        .attr("y2", yScale(0.35));
        
      svg.append("text")
        .attr("x", xScale(testStatistic))
        .attr("y", yScale(0.4))
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(`Z = ${testStatistic.toFixed(3)}`)
        .transition()
        .delay(2000)
        .duration(500)
        .style("opacity", 1);
      
      // Decision text placeholder
      decisionTextRef.current = svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("opacity", 0);
      
      // Initial update
      updateCriticalValue();
    };
    
    const updateCriticalValue = () => {
      if (!criticalRef.current || !criticalLineRef.current) return;
      
      const svg = d3.select(criticalRef.current);
      const { xScale, yScale } = svg.node().__scales;
      
      // Update critical line position
      const xPos = xScale(customCritical);
      criticalLineRef.current
        .attr("x1", xPos)
        .attr("x2", xPos);
      
      criticalTextRef.current
        .attr("x", xPos)
        .text(`z = ${customCritical.toFixed(3)}`);
      
      // Update critical region
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      const criticalRegion = normalCurve.filter(d => d.x >= customCritical);
      
      areaRef.current
        .datum(criticalRegion)
        .transition()
        .duration(300)
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // Update decision
      const isRejected = testStatistic > customCritical;
      decisionTextRef.current
        .attr("fill", isRejected ? "#ef4444" : "#10b981")
        .text(isRejected ? "REJECT H₀!" : "FAIL TO REJECT H₀")
        .transition()
        .duration(300)
        .style("opacity", 1);
      
      if (isRejected && !discoveries.includes('critical-decision')) {
        markDiscovered('critical-decision');
      }
    };
    
    const animatePValue = () => {
      if (!pValueRef.current) return;
      
      const svg = d3.select(pValueRef.current);
      const { width } = pValueRef.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 60, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Normal curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Draw curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
      
      // P-value region with animation
      const pValueRegion = normalCurve.filter(d => d.x >= testStatistic);
      
      const pArea = svg.append("path")
        .datum(pValueRegion)
        .attr("fill", "#8b5cf6")
        .attr("fill-opacity", 0)
        .attr("d", d3.area()
          .x(d => xScale(d.x))
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(d3.curveNatural)
        );
        
      // Animate fill
      pArea.transition()
        .delay(500)
        .duration(1500)
        .attr("fill-opacity", 0.6);
      
      // Test statistic
      svg.append("line")
        .attr("x1", xScale(testStatistic))
        .attr("x2", xScale(testStatistic))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.35))
        .attr("stroke", "#10b981")
        .attr("stroke-width", 4)
        .style("filter", "drop-shadow(0 0 8px #10b981)");
      
      // P-value label with animation
      const pLabel = svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#8b5cf6")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(`p-value = ${pValue.toFixed(4)}`);
        
      pLabel.transition()
        .delay(2000)
        .duration(800)
        .style("opacity", 1);
        
      // Comparison with alpha
      setTimeout(() => {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("fill", pValue < significanceLevel ? "#ef4444" : "#10b981")
          .style("font-size", "16px")
          .style("opacity", 0)
          .text(`${pValue.toFixed(4)} ${pValue < significanceLevel ? '<' : '>'} ${significanceLevel} (α)`)
          .transition()
          .duration(500)
          .style("opacity", 1);
          
        if (!discoveries.includes('p-value-meaning')) {
          markDiscovered('p-value-meaning');
        }
      }, 3000);
    };
    
    return (
      <div className="space-y-6">
        {/* Method Toggle */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMethod('critical')}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all duration-300",
              method === 'critical'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            )}
          >
            Critical Value Method
          </button>
          <button
            onClick={() => setMethod('pvalue')}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all duration-300",
              method === 'pvalue'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            )}
          >
            P-Value Method
          </button>
        </div>
        
        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraphContainer className={method === 'critical' ? 'ring-2 ring-purple-600' : ''}>
            <h4 className="text-lg font-semibold text-white mb-4">Critical Value Method</h4>
            <svg ref={criticalRef} style={{ width: "100%", height: 300 }} />
            <div className="mt-4 space-y-2">
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-300">
                  Draw a line in the sand: if our evidence crosses it, we reject H₀
                </p>
              </div>
              {method === 'critical' && (
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                  <p className="text-sm text-purple-300 flex items-center gap-2">
                    <span className="text-lg">👆</span>
                    Try dragging the red critical value to see how it affects the decision!
                  </p>
                </div>
              )}
            </div>
          </GraphContainer>
          
          <GraphContainer className={method === 'pvalue' ? 'ring-2 ring-purple-600' : ''}>
            <h4 className="text-lg font-semibold text-white mb-4">P-Value Method</h4>
            <svg ref={pValueRef} style={{ width: "100%", height: 300 }} />
            <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
              <p className="text-sm text-neutral-300">
                Calculate the probability: how likely is this if nothing changed?
              </p>
            </div>
          </GraphContainer>
        </div>
        
        {/* Insight Panel */}
        <VisualizationSection className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700/30">
          <h3 className="text-lg font-semibold text-white mb-3">
            Both Methods Agree! 🎯
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-neutral-400">Critical Value</div>
              <div className="text-xl font-mono text-purple-400">
                {testStatistic.toFixed(3)} {'>'} {criticalValue.toFixed(3)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-400">P-Value</div>
              <div className="text-xl font-mono text-purple-400">
                {pValue.toFixed(4)} {'<'} {significanceLevel}
              </div>
            </div>
          </div>
          <p className="text-neutral-300 mb-4">
            Both methods lead to the same conclusion: <span className="font-bold text-green-400">Reject H₀</span>.
            The evidence strongly suggests our new process is better!
          </p>
          <Button
            onClick={() => {
              setStage(2);
              if (!discoveries.includes('equivalence')) {
                markDiscovered('equivalence');
              }
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            See the Big Picture →
          </Button>
        </VisualizationSection>
      </div>
    );
  }
  
  // Stage 2: Big Picture
  function BigPicture() {
    const connectionRef = useRef(null);
    
    useEffect(() => {
      if (!connectionRef.current) return;
      
      const svg = d3.select(connectionRef.current);
      const { width } = connectionRef.current.getBoundingClientRect();
      const height = 250;
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain([38, 44])
        .range([margin.left, width - margin.right]);
      
      // Draw axis
      svg.append("g")
        .attr("transform", `translate(0,${height / 2})`)
        .call(d3.axisBottom(xScale).ticks(7));
      
      // Calculate confidence interval
      const zScore = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
      const standardError = sigma / Math.sqrt(n);
      const marginOfError = zScore * standardError;
      const ciLower = sampleMean - marginOfError;
      const ciUpper = sampleMean + marginOfError;
      
      // Draw CI with animation
      const ciY = height / 2 - 20;
      
      const ciLine = svg.append("line")
        .attr("x1", xScale(sampleMean))
        .attr("x2", xScale(sampleMean))
        .attr("y1", ciY)
        .attr("y2", ciY)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 4)
        .style("filter", "drop-shadow(0 0 6px #3b82f6)");
        
      ciLine.transition()
        .duration(1000)
        .attr("x1", xScale(ciLower))
        .attr("x2", xScale(ciUpper));
      
      // CI endpoints
      [ciLower, ciUpper].forEach((endpoint, i) => {
        svg.append("line")
          .attr("x1", xScale(endpoint))
          .attr("x2", xScale(endpoint))
          .attr("y1", ciY)
          .attr("y2", ciY)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 3)
          .style("opacity", 0)
          .transition()
          .delay(1000 + i * 200)
          .duration(300)
          .attr("y1", ciY - 10)
          .attr("y2", ciY + 10)
          .style("opacity", 1);
      });
      
      // Sample mean
      svg.append("circle")
        .attr("cx", xScale(sampleMean))
        .attr("cy", ciY)
        .attr("r", 0)
        .attr("fill", "#10b981")
        .style("filter", "drop-shadow(0 0 6px #10b981)")
        .transition()
        .delay(500)
        .duration(500)
        .attr("r", 8);
      
      // Null hypothesis value
      const mu0Line = svg.append("line")
        .attr("x1", xScale(mu0))
        .attr("x2", xScale(mu0))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0);
        
      mu0Line.transition()
        .delay(1500)
        .duration(800)
        .style("opacity", 1);
      
      // Labels
      svg.append("text")
        .attr("x", xScale(mu0))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .style("opacity", 0)
        .text("μ₀ = 40")
        .transition()
        .delay(2000)
        .duration(500)
        .style("opacity", 1);
        
      svg.append("text")
        .attr("x", xScale((ciLower + ciUpper) / 2))
        .attr("y", ciY + 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .style("opacity", 0)
        .html(`95% CI: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]`)
        .transition()
        .delay(2500)
        .duration(500)
        .style("opacity", 1);
      
      // Show relationship
      setTimeout(() => {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#10b981")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .style("opacity", 0)
          .text("μ₀ is outside the CI → Reject H₀!")
          .transition()
          .duration(800)
          .style("opacity", 1);
      }, 3000);
      
    }, []);
    
    return (
      <div className="space-y-6">
        <GraphContainer>
          <h3 className="text-lg font-semibold text-white mb-4">
            The Complete Picture
          </h3>
          <svg ref={connectionRef} style={{ width: "100%", height: 250 }} />
        </GraphContainer>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VisualizationSection className="text-center p-6">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-white mb-2">Critical Value</h4>
            <p className="text-sm text-neutral-300">
              Set a threshold for extreme evidence
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="text-center p-6">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-white mb-2">P-Value</h4>
            <p className="text-sm text-neutral-300">
              Calculate probability under H₀
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="text-center p-6">
            <div className="text-3xl mb-2">🔗</div>
            <h4 className="font-semibold text-white mb-2">Confidence Interval</h4>
            <p className="text-sm text-neutral-300">
              Check if μ₀ is plausible
            </p>
          </VisualizationSection>
        </div>
        
        {/* Final Insight */}
        <FinalInsight />
      </div>
    );
  }
  
  // Final Insight Component with proper LaTeX handling
  const FinalInsight = React.memo(function FinalInsight() {
    const contentRef = useRef(null);
    
    useEffect(() => {
      const processMathJax = () => {
        if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([contentRef.current]);
          }
          window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
        }
      };
      
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }, []);
    
    return (
      <VisualizationSection className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-3">
          Congratulations! 🎉
        </h3>
        <p className="text-neutral-300 mb-4">
          You've mastered hypothesis testing for means with known variance. 
          All three methods confirmed that your manufacturing process has significantly improved!
        </p>
        <div ref={contentRef} className="bg-neutral-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-2">Key Formula</h4>
          <div className="text-center text-lg">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}} = \\frac{41.125 - 40}{1.2/\\sqrt{12}} = 3.244\\]`
            }} />
          </div>
        </div>
      </VisualizationSection>
    );
  });
}