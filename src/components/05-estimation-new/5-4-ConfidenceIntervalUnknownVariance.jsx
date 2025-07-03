"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import { FlaskConical, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, RefreshCw, Activity } from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const UnknownVarianceIntroduction = React.memo(function UnknownVarianceIntroduction() {
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          When σ is Unknown: The t-Distribution
        </p>
        <p>
          In real-world scenarios, we rarely know the population standard deviation σ. Instead, we must estimate it 
          using the sample standard deviation s, which introduces additional uncertainty.
        </p>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-1">Z-Interval (σ known)</h4>
            <div className="text-center my-2">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
              }} />
            </div>
            <p className="text-xs">Uses normal distribution</p>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-purple-400 mb-1">t-Interval (σ unknown)</h4>
            <div className="text-center my-2">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
              }} />
            </div>
            <p className="text-xs">Uses t-distribution with df = n-1</p>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400">
          The t-distribution has heavier tails to account for the extra uncertainty from estimating σ. 
          As sample size increases, it converges to the normal distribution.
        </p>
      </div>
    </div>
  );
});

// T vs Z Interval Comparison (based on 5-4-1)
const TvsZComparison = () => {
  const [sampleSize, setSampleSize] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showAnimation, setShowAnimation] = useState(false);
  const svgRef = useRef(null);
  
  // Sample parameters
  const xbar = 100;
  const s = 15;
  const sigma = 15; // True σ for comparison
  
  // Calculate critical values and intervals
  const calculations = useMemo(() => {
    const df = sampleSize - 1;
    const alpha = 1 - confidenceLevel;
    const tCritical = jStat.studentt.inv(1 - alpha/2, df);
    const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
    
    const tSE = s / Math.sqrt(sampleSize);
    const tMOE = tCritical * tSE;
    const tLower = xbar - tMOE;
    const tUpper = xbar + tMOE;
    
    const zSE = sigma / Math.sqrt(sampleSize);
    const zMOE = zCritical * zSE;
    const zLower = xbar - zMOE;
    const zUpper = xbar + zMOE;
    
    const widthRatio = tMOE / zMOE;
    const percentWider = ((widthRatio - 1) * 100).toFixed(1);
    
    return {
      tCritical,
      zCritical,
      tInterval: { lower: tLower, upper: tUpper, moe: tMOE },
      zInterval: { lower: zLower, upper: zUpper, moe: zMOE },
      percentWider,
      df
    };
  }, [sampleSize, confidenceLevel]);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scale
    const extent = Math.max(calculations.tInterval.moe, calculations.zInterval.moe) * 1.5;
    const xScale = d3.scaleLinear()
      .domain([xbar - extent, xbar + extent])
      .range([0, innerWidth]);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`${confidenceLevel * 100}% Confidence Intervals (n = ${sampleSize})`);
    
    // Center line (sample mean)
    g.append("line")
      .attr("x1", xScale(xbar))
      .attr("x2", xScale(xbar))
      .attr("y1", 20)
      .attr("y2", innerHeight - 20)
      .attr("stroke", chapterColors.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("text")
      .attr("x", xScale(xbar))
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.accent)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`x̄ = ${xbar}`);
    
    // Interval positions
    const tY = innerHeight * 0.35;
    const zY = innerHeight * 0.65;
    const barHeight = 12;
    const bracketHeight = 20;
    
    // T-interval visualization
    const tInterval = g.append("g");
    
    // T-interval bar
    tInterval.append("rect")
      .attr("x", xScale(calculations.tInterval.lower))
      .attr("y", tY - barHeight/2)
      .attr("width", xScale(calculations.tInterval.upper) - xScale(calculations.tInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.primary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 1);
    
    // T-interval brackets
    [calculations.tInterval.lower, calculations.tInterval.upper].forEach(x => {
      tInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", tY - bracketHeight/2)
        .attr("y2", tY + bracketHeight/2)
        .attr("stroke", chapterColors.primary)
        .attr("stroke-width", 3);
    });
    
    // T-interval labels
    tInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", tY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.primary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("t-interval (σ unknown, use s)");
    
    // Z-interval visualization
    const zInterval = g.append("g");
    
    // Z-interval bar
    zInterval.append("rect")
      .attr("x", xScale(calculations.zInterval.lower))
      .attr("y", zY - barHeight/2)
      .attr("width", xScale(calculations.zInterval.upper) - xScale(calculations.zInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.secondary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(400)
      .attr("opacity", 1);
    
    // Z-interval brackets
    [calculations.zInterval.lower, calculations.zInterval.upper].forEach(x => {
      zInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", zY - bracketHeight/2)
        .attr("y2", zY + bracketHeight/2)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 3);
    });
    
    // Z-interval labels
    zInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", zY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", chapterColors.secondary)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("z-interval (σ known)");
    
    // Width difference annotation
    if (calculations.percentWider !== "0.0") {
      const diffY = innerHeight - 10;
      
      g.append("text")
        .attr("x", xScale(xbar))
        .attr("y", diffY)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.warning)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`t-interval is ${calculations.percentWider}% wider`);
    }
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text);
    
  }, [sampleSize, confidenceLevel, calculations]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">t-Interval vs z-Interval Comparison</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
      </GraphContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-neutral-800 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-blue-400 mb-1">z-critical</h5>
          <p className="font-mono text-lg">{calculations.zCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">σ known</p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-purple-400 mb-1">t-critical</h5>
          <p className="font-mono text-lg">{calculations.tCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">df = {calculations.df}</p>
        </div>
        <div className="col-span-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <p className="text-sm text-center">
            t-critical is <span className="font-mono text-yellow-400">{((calculations.tCritical - calculations.zCritical) / calculations.zCritical * 100).toFixed(1)}%</span> larger
          </p>
        </div>
      </div>
      
      <ControlGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size: {sampleSize}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Level
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
            >
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>As sample size increases, the t-distribution approaches the normal distribution. 
          By n ≈ 30, the difference is usually negligible in practice.</p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// T-Distribution Explorer (based on 5-4-2)
const TDistributionExplorer = () => {
  const [df, setDf] = useState(5);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationDf, setAnimationDf] = useState(1);
  const animationRef = useRef(null);
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Generate data
    const xValues = d3.range(-5, 5.01, 0.01);
    const currentDf = showAnimation ? animationDf : df;
    
    const normalData = xValues.map(val => ({
      x: val,
      y: jStat.normal.pdf(val, 0, 1)
    }));
    
    const tData = xValues.map(val => ({
      x: val,
      y: jStat.studentt.pdf(val, currentDf)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(""))
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .text("Standardized Value");
    
    // Normal curve
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("opacity", 0.8);
    
    // T curve
    g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 100}, 20)`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 4)
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text("Normal(0,1)");
    
    // T legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 20).attr("y2", 20)
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 24)
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text(`t(${currentDf})`);
    
    // Annotation for heavier tails
    if (currentDf <= 5) {
      const annotation = g.append("g")
        .attr("transform", `translate(${x(2.5)}, ${y(0.05)})`);
      
      annotation.append("path")
        .attr("d", "M0,0 L-30,-30")
        .attr("stroke", chapterColors.warning)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
      
      annotation.append("text")
        .attr("x", -35)
        .attr("y", -35)
        .attr("fill", chapterColors.warning)
        .style("font-size", "12px")
        .text("Heavier tails");
      
      // Arrow marker
      const defs = svg.append("defs");
      const marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 8)
        .attr("refY", 4)
        .attr("orient", "auto");
      
      marker.append("path")
        .attr("d", "M0,0 L8,4 L0,8")
        .attr("fill", chapterColors.warning);
    }
    
  }, [df, showAnimation, animationDf]);
  
  // Animation effect
  useEffect(() => {
    if (showAnimation) {
      let currentDf = 1;
      const animate = () => {
        setAnimationDf(currentDf);
        currentDf += 0.5;
        
        if (currentDf <= 100) {
          animationRef.current = setTimeout(animate, 50);
        } else {
          setTimeout(() => {
            setAnimationDf(Infinity);
            setTimeout(() => {
              setShowAnimation(false);
              setAnimationDf(df);
            }, 1000);
          }, 500);
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [showAnimation, df]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">t-Distribution Properties</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="350" viewBox="0 0 600 350" />
      </GraphContainer>
      
      <ControlGroup>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Degrees of Freedom: {df}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={df}
              onChange={(e) => setDf(Number(e.target.value))}
              className="w-full"
              disabled={showAnimation}
            />
          </div>
          
          <button
            onClick={() => setShowAnimation(true)}
            disabled={showAnimation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <TrendingUp size={16} />
            {showAnimation ? "Animating..." : "Animate df → ∞"}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insight</h4>
          <p className="text-sm text-neutral-300">
            As degrees of freedom increase, the t-distribution approaches the normal distribution. 
            By df ≈ 30, they're nearly identical. This is why we use z for large samples!
          </p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Bootstrap Method (based on 5-4-3)
const BootstrapMethod = () => {
  const [originalSample, setOriginalSample] = useState([]);
  const [bootstrapMeans, setBootstrapMeans] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sampleSize, setSampleSize] = useState(20);
  const intervalRef = useRef(null);
  const svgRef = useRef(null);
  const histogramRef = useRef(null);
  
  // Generate initial sample
  const generateSample = useCallback(() => {
    const sample = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(100, 15)()
    );
    setOriginalSample(sample);
    setBootstrapMeans([]);
  }, [sampleSize]);
  
  useEffect(() => {
    generateSample();
  }, [generateSample]);
  
  // Perform bootstrap resampling
  const performBootstrap = useCallback(() => {
    if (originalSample.length === 0) return;
    
    const resample = Array.from({ length: originalSample.length }, () => 
      originalSample[Math.floor(Math.random() * originalSample.length)]
    );
    const mean = d3.mean(resample);
    setBootstrapMeans(prev => [...prev, mean]);
  }, [originalSample]);
  
  // Start continuous bootstrapping
  const startBootstrapping = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(performBootstrap, 100);
  };
  
  const stopBootstrapping = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const reset = () => {
    stopBootstrapping();
    generateSample();
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Draw original sample
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    if (originalSample.length === 0) return;
    
    const width = 300;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const xScale = d3.scaleLinear()
      .domain([d3.min(originalSample) - 5, d3.max(originalSample) + 5])
      .range([margin.left, width - margin.right]);
    
    // Draw points
    svg.selectAll("circle")
      .data(originalSample)
      .join("circle")
      .attr("cx", d => xScale(d))
      .attr("cy", height / 2)
      .attr("r", 4)
      .attr("fill", chapterColors.primary)
      .attr("opacity", 0.7);
    
    // Draw mean line
    const mean = d3.mean(originalSample);
    svg.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", chapterColors.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));
    
  }, [originalSample]);
  
  // Draw bootstrap distribution
  useEffect(() => {
    const svg = d3.select(histogramRef.current);
    svg.selectAll("*").remove();
    
    if (bootstrapMeans.length === 0) return;
    
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const xScale = d3.scaleLinear()
      .domain([d3.min(bootstrapMeans) - 2, d3.max(bootstrapMeans) + 2])
      .range([margin.left, width - margin.right]);
    
    const bins = d3.histogram()
      .domain(xScale.domain())
      .thresholds(20)(bootstrapMeans);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height - margin.bottom, margin.top]);
    
    // Draw histogram
    svg.selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => height - margin.bottom - yScale(d.length))
      .attr("fill", chapterColors.secondary)
      .attr("opacity", 0.7);
    
    // Draw axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));
    
  }, [bootstrapMeans]);
  
  const originalMean = originalSample.length > 0 ? d3.mean(originalSample) : 0;
  const originalSD = originalSample.length > 0 ? d3.deviation(originalSample) : 0;
  const bootstrapSE = bootstrapMeans.length > 1 ? d3.deviation(bootstrapMeans) : 0;
  
  // Calculate bootstrap CI if we have enough samples
  let bootstrapCI = null;
  if (bootstrapMeans.length >= 100) {
    const sorted = [...bootstrapMeans].sort((a, b) => a - b);
    const lower = sorted[Math.floor(sorted.length * 0.025)];
    const upper = sorted[Math.floor(sorted.length * 0.975)];
    bootstrapCI = { lower, upper };
  }
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Bootstrap Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-300 mb-2">Original Sample</h4>
          <GraphContainer height="150px">
            <svg ref={svgRef} width="100%" height="150" viewBox="0 0 300 150" />
          </GraphContainer>
          <div className="mt-2 text-sm text-gray-400">
            <p>n = {originalSample.length}</p>
            <p>x̄ = {originalMean.toFixed(2)}, s = {originalSD.toFixed(2)}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-300 mb-2">Bootstrap Distribution</h4>
          <GraphContainer height="200px">
            <svg ref={histogramRef} width="100%" height="200" viewBox="0 0 300 200" />
          </GraphContainer>
          <div className="mt-2 text-sm text-gray-400">
            <p>Resamples: {bootstrapMeans.length}</p>
            <p>Bootstrap SE: {bootstrapSE.toFixed(3)}</p>
            {bootstrapCI && (
              <p className="text-emerald-400">
                95% CI: [{bootstrapCI.lower.toFixed(2)}, {bootstrapCI.upper.toFixed(2)}]
              </p>
            )}
          </div>
        </div>
      </div>
      
      <ControlGroup>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={performBootstrap}
            disabled={isRunning || originalSample.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Single Resample
          </button>
          
          {!isRunning ? (
            <button
              onClick={startBootstrapping}
              disabled={originalSample.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Start Bootstrapping
            </button>
          ) : (
            <button
              onClick={stopBootstrapping}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          )}
          
          <button
            onClick={reset}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            New Sample
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
          <h4 className="font-semibold text-gray-300 mb-2">The Bootstrap Method</h4>
          <p className="text-sm text-gray-400">
            Bootstrap resampling estimates the sampling distribution by repeatedly sampling 
            with replacement from the original data. This provides confidence intervals 
            without assuming any particular distribution.
          </p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Summary Comparison
const SummaryComparison = () => {
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
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">When to Use Each Method</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Z-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is known</li>
            <li>• Large sample (n ≥ 30)</li>
            <li>• Population is normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            t-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is unknown (use s)</li>
            <li>• Small sample (n &lt; 30)</li>
            <li>• Population approximately normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Bootstrap
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• No distribution assumptions</li>
            <li>• Complex statistics</li>
            <li>• Non-normal data</li>
          </ul>
          <div className="mt-3 text-center text-sm">
            <p>Resample data with replacement</p>
            <p>Use percentile method</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
        <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Important Notes
        </h4>
        <ul className="space-y-1 text-sm text-neutral-300">
          <li>• t-intervals are always wider than z-intervals for the same data</li>
          <li>• The difference is most dramatic for small samples</li>
          <li>• Bootstrap requires many resamples (typically 1000+) for accuracy</li>
          <li>• When in doubt, use t-intervals (more conservative)</li>
        </ul>
      </div>
    </VisualizationSection>
  );
};

// Main Component
export default function ConfidenceIntervalUnknownVariance() {
  return (
    <VisualizationContainer
      title="5.4 Confidence Intervals: Unknown Variance"
      description="Explore t-distributions, degrees of freedom, and bootstrap methods for real-world inference"
    >
      <BackToHub chapter={5} />
      
      <UnknownVarianceIntroduction />
      
      <TvsZComparison />
      
      <TDistributionExplorer />
      
      <BootstrapMethod />
      
      <SummaryComparison />
      
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Conceptual Understanding
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Using s instead of σ adds uncertainty</li>
              <li>• t-distribution accounts for this extra variability</li>
              <li>• Degrees of freedom measure available information</li>
              <li>• Bootstrap provides distribution-free alternative</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Activity size={16} />
              Practical Guidelines
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Always use t for small samples (n &lt; 30)</li>
              <li>• Check normality assumption for small n</li>
              <li>• Bootstrap for non-normal or complex cases</li>
              <li>• Report method and assumptions clearly</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
    </VisualizationContainer>
  );
}