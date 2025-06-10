"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, BarChart } from "lucide-react";
import * as jStat from "jstat";
import { useMathJax, latexHTML, inlineMath } from "../../utils/latex";

const EmpiricalRuleOptimized = () => {
  // Use vibrant custom colors to reduce blue dominance
  const colors = useMemo(() => {
    const baseColors = createColorScheme('inference');
    return {
      ...baseColors,
      primary: '#10b981', // Emerald for 68%
      secondary: '#f59e0b', // Amber for 95%
      accent: '#ef4444', // Red for 99.7%
      curve: '#8b5cf6', // Violet for the normal curve
      histogram: '#06b6d4', // Cyan for histogram
      text: baseColors.text,
      background: baseColors.background
    };
  }, []);
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const mathRef = useRef(null);
  const intervalRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  
  // State
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [samples, setSamples] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);
  const [selectedRule, setSelectedRule] = useState(1); // 1, 2, or 3 for σ ranges
  const [counts, setCounts] = useState({
    within1SD: 0,
    within2SD: 0,
    within3SD: 0,
    total: 0
  });
  
  // Use MathJax hook for LaTeX rendering
  useMathJax(mathRef, [mu, sigma, selectedRule]);
  
  // Optimized sample generation with incremental count updates
  const generateSample = useCallback(() => {
    const newSample = jStat.normal.sample(mu, sigma);
    const deviation = Math.abs(newSample - mu);
    
    setSamples(prev => {
      const isAtLimit = prev.length >= 1000;
      const updated = isAtLimit ? [...prev.slice(1), newSample] : [...prev, newSample];
      
      // Update counts incrementally
      setCounts(prevCounts => {
        let newCounts = { ...prevCounts };
        
        // If we're removing an old sample
        if (isAtLimit && prev.length > 0) {
          const removedSample = prev[0];
          const removedDeviation = Math.abs(removedSample - mu);
          if (removedDeviation <= sigma) newCounts.within1SD--;
          if (removedDeviation <= 2 * sigma) newCounts.within2SD--;
          if (removedDeviation <= 3 * sigma) newCounts.within3SD--;
          newCounts.total = Math.max(0, newCounts.total - 1);
        }
        
        // Add new sample
        if (deviation <= sigma) newCounts.within1SD++;
        if (deviation <= 2 * sigma) newCounts.within2SD++;
        if (deviation <= 3 * sigma) newCounts.within3SD++;
        newCounts.total++;
        
        return newCounts;
      });
      
      return updated;
    });
  }, [mu, sigma]);
  
  // Start/stop generation
  const toggleGeneration = useCallback(() => {
    setIsGenerating(prev => !prev);
  }, []);
  
  // Effect to manage interval based on isGenerating state
  useEffect(() => {
    if (isGenerating) {
      intervalRef.current = setInterval(generateSample, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGenerating, generateSample]);
  
  // Reset - now also properly resets counts
  const handleReset = useCallback(() => {
    setSamples([]);
    setIsGenerating(false);
    setCounts({
      within1SD: 0,
      within2SD: 0,
      within3SD: 0,
      total: 0
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
  
  // Reset counts when parameters change
  useEffect(() => {
    if (samples.length > 0) {
      // Recalculate counts when mu or sigma changes
      const within1SD = samples.filter(x => Math.abs(x - mu) <= sigma).length;
      const within2SD = samples.filter(x => Math.abs(x - mu) <= 2 * sigma).length;
      const within3SD = samples.filter(x => Math.abs(x - mu) <= 3 * sigma).length;
      
      setCounts({
        within1SD,
        within2SD,
        within3SD,
        total: samples.length
      });
    }
  }, [mu, sigma]); // Only recalculate when parameters change, not on every sample

  // Debounced resize handler
  const handleResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: Math.min(width - 32, 1200),
            height: Math.min(500, window.innerHeight * 0.6)
          });
        }
      }, 100);
    };
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Memoize curve data
  const curveData = useMemo(() => {
    const normalPDF = (x) => {
      const exp = -0.5 * Math.pow((x - mu) / sigma, 2);
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };
    
    return d3.range(mu - 4 * sigma, mu + 4 * sigma, sigma / 50)
      .map(x => ({ x, y: normalPDF(x) }));
  }, [mu, sigma]);
  
  // Memoize scales
  const { xScale, yScale, yHistScale } = useMemo(() => {
    const xScale = d3.scaleLinear()
      .domain([mu - 4 * sigma, mu + 4 * sigma])
      .range([50, dimensions.width - 30]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.4 / sigma])
      .range([dimensions.height - 50, 30]);
      
    const maxBinHeight = samples.length > 0 ? 
      Math.max(...d3.histogram()
        .domain([mu - 4 * sigma, mu + 4 * sigma])
        .thresholds(25)
        (samples)
        .map(d => d.length)) : 10;
    
    const yHistScale = d3.scaleLinear()
      .domain([0, maxBinHeight])
      .range([dimensions.height - 50, 30]);
    
    return { xScale, yScale, yHistScale };
  }, [mu, sigma, dimensions, samples.length]);
  
  // Static D3 elements (curve, axes, regions)
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    
    const g = svg.append("g").attr("class", "static-layer");
    const dynamicG = svg.append("g").attr("class", "dynamic-layer");
    
    // Subtle gradient background
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "bgGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#1e293b;stop-opacity:0.1");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#334155;stop-opacity:0.05");
    
    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "url(#bgGradient)")
      .attr("rx", 8);
    
    // Empirical Rule regions
    const regions = [
      { sd: 3, color: colors.accent, opacity: 0.2, label: "99.7%" },
      { sd: 2, color: colors.secondary, opacity: 0.25, label: "95%" },
      { sd: 1, color: colors.primary, opacity: 0.3, label: "68%" }
    ];
    
    regions.forEach((region) => {
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.y))
        .curve(d3.curveBasis);
        
      const regionData = curveData.filter(d => 
        d.x >= mu - region.sd * sigma && d.x <= mu + region.sd * sigma
      );
      
      const regionGroup = g.append("g")
        .attr("class", `region-${region.sd}`)
        .style("opacity", selectedRule >= region.sd ? 1 : 0.3);
      
      regionGroup.append("path")
        .datum(regionData)
        .attr("d", area)
        .attr("fill", region.color)
        .attr("opacity", region.opacity);
      
      // Boundary lines
      [-1, 1].forEach(side => {
        const x = mu + side * region.sd * sigma;
        regionGroup.append("line")
          .attr("x1", xScale(x))
          .attr("y1", margin.top)
          .attr("x2", xScale(x))
          .attr("y2", height - margin.bottom)
          .attr("stroke", region.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0.7);
          
        // Labels
        regionGroup.append("text")
          .attr("x", xScale(x))
          .attr("y", height - margin.bottom + 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", region.color)
          .text(`${side > 0 ? '+' : ''}${region.sd}σ`);
      });
      
      // Percentage label
      regionGroup.append("text")
        .attr("x", xScale(mu))
        .attr("y", yScale(curveData.find(d => d.x === mu)?.y || 0) + (region.sd * 40))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .style("fill", region.color)
        .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.5))")
        .text(region.label);
    });
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    // Add glow effect for the curve
    const curveGlow = defs.append("filter")
      .attr("id", "curveGlow");
    
    curveGlow.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = curveGlow.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
      
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.curve)
      .attr("stroke-width", 4)
      .attr("fill", "none")
      .attr("filter", "url(#curveGlow)");
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues([
        mu - 3*sigma, mu - 2*sigma, mu - sigma, 
        mu, 
        mu + sigma, mu + 2*sigma, mu + 3*sigma
      ])
      .tickFormat(d => d.toFixed(0));
      
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("color", colors.secondary);
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("color", colors.secondary);
    
    // Distribution info
    g.append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top + 20)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", colors.text)
      .style("opacity", 0.8)
      .text(`μ = ${mu}, σ = ${sigma}`);
    
    // Mean line
    g.append("line")
      .attr("x1", xScale(mu))
      .attr("y1", margin.top)
      .attr("x2", xScale(mu))
      .attr("y2", height - margin.bottom)
      .attr("stroke", colors.text)
      .attr("stroke-width", 2)
      .attr("opacity", 0.5);
      
  }, [mu, sigma, selectedRule, colors, dimensions, curveData, xScale, yScale]);
  
  // Dynamic D3 elements (samples, histogram)
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    const dynamicG = svg.select("g.dynamic-layer");
    
    // Clear previous dynamic content
    dynamicG.selectAll("*").remove();
    
    const height = dimensions.height;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    
    // If showing histogram, overlay sample data
    if (showHistogram && samples.length > 0) {
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(25))
        (samples);
      
      // Create gradient for histogram bars
      const defs = svg.select("defs");
      if (defs.select("#histGradient").empty()) {
        const histGradient = defs.append("linearGradient")
          .attr("id", "histGradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");
        
        histGradient.append("stop")
          .attr("offset", "0%")
          .attr("style", `stop-color:${colors.histogram};stop-opacity:0.9`);
        
        histGradient.append("stop")
          .attr("offset", "100%")
          .attr("style", `stop-color:${colors.histogram};stop-opacity:0.6`);
      }
      
      dynamicG.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0) + 1)
        .attr("y", d => yHistScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
        .attr("height", d => height - margin.bottom - yHistScale(d.length))
        .attr("fill", "url(#histGradient)")
        .attr("stroke", colors.histogram)
        .attr("stroke-width", 0.5)
        .attr("rx", 2);
    }
    
    // Sample points (last 100)
    if (samples.length > 0 && !showHistogram) {
      const recentSamples = samples.slice(-100);
      
      dynamicG.selectAll(".sample-point")
        .data(recentSamples)
        .enter().append("circle")
        .attr("class", "sample-point")
        .attr("cx", d => xScale(d))
        .attr("cy", height - margin.bottom - 5)
        .attr("r", 2)
        .attr("fill", d => {
          const deviation = Math.abs(d - mu) / sigma;
          if (deviation <= 1) return colors.primary;
          if (deviation <= 2) return colors.secondary;
          if (deviation <= 3) return colors.accent;
          return colors.text;
        })
        .attr("opacity", 0.6);
    }
    
  }, [samples, showHistogram, colors, dimensions, xScale, yHistScale, mu, sigma]);
  
  // Memoize percentages calculation
  const percentages = useMemo(() => {
    if (counts.total === 0) {
      return {
        actual1SD: "0.0",
        actual2SD: "0.0",
        actual3SD: "0.0"
      };
    }
    
    return {
      actual1SD: (counts.within1SD / counts.total * 100).toFixed(1),
      actual2SD: (counts.within2SD / counts.total * 100).toFixed(1),
      actual3SD: (counts.within3SD / counts.total * 100).toFixed(1)
    };
  }, [counts]);
  
  return (
    <div className="w-full" ref={containerRef}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl">The Empirical Rule (68-95-99.7 Rule)</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowHistogram(!showHistogram)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart className="w-4 h-4" />
                {showHistogram ? 'Hide' : 'Show'} Histogram
              </Button>
              <Button
                onClick={toggleGeneration}
                variant={isGenerating ? "destructive" : "default"}
                size="sm"
                className="gap-2"
              >
                {isGenerating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isGenerating ? 'Pause' : 'Generate'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3" ref={mathRef}>
          {/* Main visualization area */}
          <div className="w-full mb-4">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              className="w-full"
            />
          </div>
          
          {/* Controls in a horizontal layout below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parameters */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Distribution Parameters</h4>
              <div className="space-y-2">
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <span>Mean <span {...latexHTML('\\mu')}></span>:</span>
                    <span className="font-mono text-sm">{mu}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={mu}
                    onChange={(e) => setMu(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="flex items-center justify-between text-sm">
                    <span>Std Dev <span {...latexHTML('\\sigma')}></span>:</span>
                    <span className="font-mono text-sm">{sigma}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={sigma}
                    onChange={(e) => setSigma(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3].map(sd => (
                  <Button
                    key={sd}
                    onClick={() => setSelectedRule(sd)}
                    variant={selectedRule === sd ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    <span {...latexHTML(`\\pm${sd}\\sigma`)}></span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Sample Statistics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Sample Statistics</h4>
              <div className="space-y-1 text-sm bg-gray-800/50 p-3 rounded-lg">
                <p>Total Samples: <span className="font-mono">{counts.total}</span></p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Within <span {...latexHTML('\\pm 1\\sigma')}></span>:</span>
                    <span className="font-mono text-emerald-400">
                      {counts.within1SD} ({percentages.actual1SD}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Within <span {...latexHTML('\\pm 2\\sigma')}></span>:</span>
                    <span className="font-mono text-amber-400">
                      {counts.within2SD} ({percentages.actual2SD}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Within <span {...latexHTML('\\pm 3\\sigma')}></span>:</span>
                    <span className="font-mono text-red-400">
                      {counts.within3SD} ({percentages.actual3SD}%)
                    </span>
                  </div>
                </div>
              </div>
              
              {counts.total >= 100 && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Convergence</p>
                  <div className="space-y-1 text-xs">
                    <p>68% → {percentages.actual1SD}% {Math.abs(68 - parseFloat(percentages.actual1SD)) < 2 ? '✓' : ''}</p>
                    <p>95% → {percentages.actual2SD}% {Math.abs(95 - parseFloat(percentages.actual2SD)) < 2 ? '✓' : ''}</p>
                    <p>99.7% → {percentages.actual3SD}% {Math.abs(99.7 - parseFloat(percentages.actual3SD)) < 1 ? '✓' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Empirical Rule Explanation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">The Empirical Rule</h4>
              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded transition-all ${
                  selectedRule >= 1 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'opacity-50'
                }`}>
                  <p className="font-semibold text-emerald-400">68% Rule <span {...latexHTML('(\\pm 1\\sigma)')}></span></p>
                  <p>≈68% of data within one standard deviation</p>
                  <p className="text-xs opacity-80 mt-1 font-mono">
                    [{(mu - sigma).toFixed(1)}, {(mu + sigma).toFixed(1)}]
                  </p>
                </div>
                
                <div className={`p-2 rounded transition-all ${
                  selectedRule >= 2 ? 'bg-amber-500/20 border border-amber-500/30' : 'opacity-50'
                }`}>
                  <p className="font-semibold text-amber-400">95% Rule <span {...latexHTML('(\\pm 2\\sigma)')}></span></p>
                  <p>≈95% of data within two standard deviations</p>
                  <p className="text-xs opacity-80 mt-1 font-mono">
                    [{(mu - 2*sigma).toFixed(1)}, {(mu + 2*sigma).toFixed(1)}]
                  </p>
                </div>
                
                <div className={`p-2 rounded transition-all ${
                  selectedRule >= 3 ? 'bg-red-500/20 border border-red-500/30' : 'opacity-50'
                }`}>
                  <p className="font-semibold text-red-400">99.7% Rule <span {...latexHTML('(\\pm 3\\sigma)')}></span></p>
                  <p>≈99.7% of data within three standard deviations</p>
                  <p className="text-xs opacity-80 mt-1 font-mono">
                    [{(mu - 3*sigma).toFixed(1)}, {(mu + 3*sigma).toFixed(1)}]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpiricalRuleOptimized;