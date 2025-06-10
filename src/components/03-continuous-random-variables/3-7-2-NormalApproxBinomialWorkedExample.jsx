"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import jStat from "jstat";
import { cn } from "../../lib/utils";
import { RangeSlider } from "../ui/RangeSlider";
import { colors, typography, components, formatNumber, createColorScheme } from '../../lib/design-system';
import { VisualizationContainer, ControlGroup } from '../ui/VisualizationContainer';
import { ProgressTracker } from '../ui/ProgressTracker';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

const NormalApproxBinomialWorkedExample = React.memo(function NormalApproxBinomialWorkedExample({
  initialN = 50,
  initialP = 0.5,
  initialK = 25,
  initialProbType = "le",
  initialShowCC = true
}) {
  // Interactive state
  const [n, setN] = useState(initialN);
  const [p, setP] = useState(initialP);
  const [k, setK] = useState(initialK);
  const [probType, setProbType] = useState(initialProbType);
  const [showCC, setShowCC] = useState(initialShowCC);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [highlightedConcept, setHighlightedConcept] = useState(null);
  
  // Refs for D3 visualization
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Calculate Normal parameters
  const mu = n * p;
  const variance = n * p * (1 - p);
  const sigma = Math.sqrt(variance);
  
  // Rule of thumb values
  const np = n * p;
  const nq = n * (1 - p);
  const ruleOfThumbMet = np >= 10 && nq >= 10;
  
  // Calculate probabilities
  const binomialProb = useMemo(() => {
    try {
      switch (probType) {
        case "le":
          return jStat.binomial.cdf(k, n, p);
        case "ge":
          return 1 - jStat.binomial.cdf(k - 1, n, p);
        case "eq":
          return jStat.binomial.pdf(k, n, p);
        default:
          return 0;
      }
    } catch (e) {
      return 0;
    }
  }, [n, p, k, probType]);
  
  const normalProb = useMemo(() => {
    try {
      switch (probType) {
        case "le":
          const zLe = ((showCC ? k + 0.5 : k) - mu) / sigma;
          return jStat.normal.cdf(zLe, 0, 1);
        case "ge":
          const zGe = ((showCC ? k - 0.5 : k) - mu) / sigma;
          return 1 - jStat.normal.cdf(zGe, 0, 1);
        case "eq":
          if (showCC) {
            const z1 = ((k - 0.5) - mu) / sigma;
            const z2 = ((k + 0.5) - mu) / sigma;
            return jStat.normal.cdf(z2, 0, 1) - jStat.normal.cdf(z1, 0, 1);
          } else {
            return jStat.normal.pdf(k, mu, sigma);
          }
        default:
          return 0;
      }
    } catch (e) {
      return 0;
    }
  }, [n, p, k, mu, sigma, probType, showCC]);
  
  const error = Math.abs(binomialProb - normalProb);
  const relativeError = binomialProb > 0 ? error / binomialProb : 0;
  
  // Track interactions
  const handleParameterChange = useCallback((setter) => {
    return (value) => {
      setter(value);
      setInteractionCount(prev => prev + 1);
    };
  }, []);
  
  // Milestones for progressive learning
  const milestones = {
    explorer: { threshold: 5, message: "Explore different parameters!", badge: "Parameter Explorer" },
    ruleChecker: { threshold: 10, message: "Found edge cases!", badge: "Rule of Thumb Expert" },
    correctionMaster: { threshold: 15, message: "Mastered continuity correction!", badge: "Correction Master" },
    approximator: { threshold: 20, message: "Expert at normal approximation!", badge: "Approximation Expert" }
  };
  
  // Generate distribution data for visualization
  const distributionData = useMemo(() => {
    const binomialData = [];
    const normalData = [];
    
    // Binomial bars
    const xMin = Math.max(0, mu - 4 * sigma);
    const xMax = Math.min(n, mu + 4 * sigma);
    
    for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x++) {
      if (x >= 0 && x <= n) {
        try {
          const prob = jStat.binomial.pdf(x, n, p);
          if (!isNaN(prob) && isFinite(prob)) {
            binomialData.push({ x, y: prob });
          }
        } catch (e) {
          // Skip invalid values
        }
      }
    }
    
    // Normal curve
    const step = (xMax - xMin) / 200;
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = jStat.normal.pdf(x, mu, sigma);
        if (!isNaN(y) && isFinite(y)) {
          normalData.push({ x, y });
        }
      } catch (e) {
        // Skip invalid values
      }
    }
    
    return { binomialData, normalData };
  }, [n, p, mu, sigma]);
  
  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || !distributionData.binomialData.length) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    
    svg.selectAll("*").remove();
    
    const { binomialData, normalData } = distributionData;
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(...binomialData.map(d => d.x), ...normalData.map(d => d.x)),
        Math.max(...binomialData.map(d => d.x), ...normalData.map(d => d.x))
      ])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...binomialData.map(d => d.y), ...normalData.map(d => d.y)) * 1.1])
      .range([height - margin.bottom, margin.top]);
    
    // Add grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .style("fill", colors.chart.text)
      .text("x");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(3)))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("fill", colors.chart.text)
      .text("Probability");
    
    // Draw binomial bars
    const barWidth = (xScale(1) - xScale(0)) * 0.8;
    
    svg.selectAll(".binomial-bar")
      .data(binomialData)
      .enter()
      .append("rect")
      .attr("class", "binomial-bar")
      .attr("x", d => xScale(d.x) - barWidth / 2)
      .attr("y", d => yScale(d.y))
      .attr("width", barWidth)
      .attr("height", d => height - margin.bottom - yScale(d.y))
      .attr("fill", colorScheme.primary)
      .attr("opacity", 0.6)
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 1);
    
    // Highlight selected k
    if (k >= 0 && k <= n) {
      const kData = binomialData.find(d => d.x === k);
      if (kData) {
        svg.append("rect")
          .attr("x", xScale(k) - barWidth / 2)
          .attr("y", yScale(kData.y))
          .attr("width", barWidth)
          .attr("height", height - margin.bottom - yScale(kData.y))
          .attr("fill", colorScheme.secondary)
          .attr("opacity", 0.8)
          .attr("stroke", colorScheme.secondary)
          .attr("stroke-width", 2);
        
        // Show continuity correction boundaries if enabled
        if (showCC && highlightedConcept === "continuity") {
          svg.append("line")
            .attr("x1", xScale(k - 0.5))
            .attr("x2", xScale(k - 0.5))
            .attr("y1", yScale(0))
            .attr("y2", yScale(kData.y))
            .attr("stroke", colorScheme.tertiary)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
          
          svg.append("line")
            .attr("x1", xScale(k + 0.5))
            .attr("x2", xScale(k + 0.5))
            .attr("y1", yScale(0))
            .attr("y2", yScale(kData.y))
            .attr("stroke", colorScheme.tertiary)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
        }
      }
    }
    
    // Draw normal curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    svg.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.tertiary)
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add mean line
    svg.append("line")
      .attr("x1", xScale(mu))
      .attr("x2", xScale(mu))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", colorScheme.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    svg.append("text")
      .attr("x", xScale(mu))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .style("fill", colorScheme.secondary)
      .style("font-size", "12px")
      .text(`μ = ${mu.toFixed(2)}`);
    
  }, [distributionData, k, mu, showCC, highlightedConcept, colorScheme]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error in NormalApproxBinomialWorkedExample:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => clearTimeout(timeoutId);
  }, [n, p, k, mu, sigma, probType, showCC, currentStep]);
  
  // Get dynamic insight based on current state
  const getDynamicInsight = () => {
    if (!ruleOfThumbMet) {
      return {
        type: 'warning',
        title: 'Poor Approximation Expected',
        content: `With np=${np.toFixed(1)} and n(1-p)=${nq.toFixed(1)}, the normal approximation will be inaccurate.`
      };
    }
    
    if (probType === 'eq' && !showCC) {
      return {
        type: 'error',
        title: 'Continuity Correction Needed',
        content: 'For P(X=k), continuity correction is essential for accuracy!'
      };
    }
    
    if (Math.abs(p - 0.5) > 0.3) {
      return {
        type: 'info',
        title: 'Skewed Distribution',
        content: `With p=${p.toFixed(2)}, the distribution is skewed. The approximation works better when p is closer to 0.5.`
      };
    }
    
    if (error < 0.001) {
      return {
        type: 'success',
        title: 'Excellent Approximation!',
        content: `Error of ${error.toFixed(6)} shows the normal approximation is very accurate for these parameters.`
      };
    }
    
    return null;
  };
  
  const dynamicInsight = getDynamicInsight();
  
  // Format probability notation
  const getProbabilityNotation = () => {
    switch (probType) {
      case "le": return `P(X \\le ${k})`;
      case "ge": return `P(X \\ge ${k})`;
      case "eq": return `P(X = ${k})`;
    }
  };
  
  return (
    <VisualizationContainer
      title="Interactive Normal Approximation to Binomial"
      description="Explore when and how the normal distribution approximates the binomial distribution"
    >
      {/* Progress Tracker */}
      <ProgressTracker 
        milestones={milestones} 
        currentCount={interactionCount}
        className="mb-6"
      />
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Visualization (60% width on desktop) */}
        <div className="lg:col-span-3">
          <div className={cn(
            "bg-gray-900 rounded-lg p-4",
            "border border-gray-700"
          )}>
            {/* Distribution Comparison */}
            <div className="mb-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded", `bg-${colorScheme.primary}`)} 
                       style={{ backgroundColor: colorScheme.primary }} />
                  <span>Binomial (Exact)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-4 h-1", `bg-${colorScheme.tertiary}`)} 
                       style={{ backgroundColor: colorScheme.tertiary }} />
                  <span>Normal (Approximation)</span>
                </div>
              </div>
            </div>
            
            <svg
              ref={svgRef}
              className="w-full h-[400px]"
              style={{ minHeight: '400px' }}
            />
            
            {/* Continuity Correction Visual */}
            {showCC && probType === "eq" && interactionCount >= 5 && (
              <div className={cn(
                "mt-4 p-3 rounded-lg animate-fadeIn",
                "bg-gradient-to-r from-teal-900/30 to-emerald-900/30",
                "border border-teal-700/50 cursor-pointer"
              )}
              onClick={() => setHighlightedConcept(
                highlightedConcept === "continuity" ? null : "continuity"
              )}>
                <p className="text-sm font-semibold text-teal-400">
                  📐 Continuity Correction Visualization
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  The bar at k={k} spans from {k-0.5} to {k+0.5}. 
                  {highlightedConcept === "continuity" && " (Shown as dashed lines)"}
                </p>
              </div>
            )}
          </div>
          
          {/* Dynamic Insight Box */}
          {dynamicInsight && interactionCount >= 3 && (
            <div className={cn(
              "mt-4 p-4 rounded-lg animate-fadeIn",
              dynamicInsight.type === 'warning' && "bg-yellow-900/30 border border-yellow-700/50",
              dynamicInsight.type === 'error' && "bg-red-900/30 border border-red-700/50",
              dynamicInsight.type === 'info' && "bg-blue-900/30 border border-blue-700/50",
              dynamicInsight.type === 'success' && "bg-green-900/30 border border-green-700/50"
            )}>
              <h4 className={cn(
                "text-base font-semibold mb-2",
                dynamicInsight.type === 'warning' && "text-yellow-400",
                dynamicInsight.type === 'error' && "text-red-400",
                dynamicInsight.type === 'info' && "text-blue-400",
                dynamicInsight.type === 'success' && "text-green-400"
              )}>
                {dynamicInsight.title}
              </h4>
              <p className="text-sm text-gray-300">
                {dynamicInsight.content}
              </p>
            </div>
          )}
        </div>
        
        {/* Controls and Calculations (40% width on desktop) */}
        <div className="lg:col-span-2 space-y-4" ref={contentRef}>
          {/* Parameter Controls */}
          <ControlGroup>
            <RangeSlider
              label="n (trials)"
              value={n}
              onChange={handleParameterChange(setN)}
              min={10}
              max={200}
              step={1}
              className="mb-3"
            />
            <RangeSlider
              label="p (probability)"
              value={p}
              onChange={handleParameterChange(setP)}
              min={0.05}
              max={0.95}
              step={0.05}
              formatValue={v => v.toFixed(2)}
              className="mb-3"
            />
            <RangeSlider
              label="k (value)"
              value={k}
              onChange={handleParameterChange(setK)}
              min={0}
              max={n}
              step={1}
              className="mb-3"
            />
            
            {/* Probability Type Selector */}
            <div className="mb-3">
              <label className="text-sm text-gray-400 mb-2 block">Probability Type</label>
              <div className="flex gap-2">
                {[
                  { value: "le", label: "P(X ≤ k)" },
                  { value: "ge", label: "P(X ≥ k)" },
                  { value: "eq", label: "P(X = k)" }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setProbType(value);
                      setInteractionCount(prev => prev + 1);
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded text-sm transition-all",
                      probType === value
                        ? "bg-teal-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Continuity Correction Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCC}
                onChange={(e) => {
                  setShowCC(e.target.checked);
                  setInteractionCount(prev => prev + 1);
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Use Continuity Correction</span>
            </label>
          </ControlGroup>
          
          {/* Step Navigation */}
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={cn(
                "px-3 py-1 rounded text-sm",
                currentStep === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              )}
            >
              Previous Step
            </button>
            <span className="text-sm font-mono">Step {currentStep} of 7</span>
            <button
              onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
              disabled={currentStep === 7}
              className={cn(
                "px-3 py-1 rounded text-sm",
                currentStep === 7
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              )}
            >
              Next Step
            </button>
          </div>
          
          {/* Step-by-Step Calculations */}
          <div className="space-y-3">
            {/* Step 1: Problem Setup */}
            {currentStep >= 1 && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border border-gray-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">1. Problem Setup</h5>
                <p className="text-sm">
                  Approximate {getProbabilityNotation()} for \(X \sim B(n={n}, p={p})\)
                </p>
              </div>
            )}
            
            {/* Step 2: Normal Parameters */}
            {currentStep >= 2 && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border border-gray-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">2. Normal Parameters</h5>
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\begin{align}
                    \\mu &= np = ${n} \\times ${p} = ${mu.toFixed(2)} \\\\
                    \\sigma^2 &= np(1-p) = ${variance.toFixed(2)} \\\\
                    \\sigma &= ${sigma.toFixed(3)}
                  \\end{align}\\]` 
                }} />
              </div>
            )}
            
            {/* Step 3: Rule of Thumb */}
            {currentStep >= 3 && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border",
                ruleOfThumbMet ? "border-green-700" : "border-red-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">3. Rule of Thumb Check</h5>
                <div className="space-y-1 text-sm">
                  <div className={cn("flex justify-between", np >= 10 ? "text-green-400" : "text-red-400")}>
                    <span>np = {np.toFixed(2)}</span>
                    <span>{np >= 10 ? "✓ ≥ 10" : "✗ < 10"}</span>
                  </div>
                  <div className={cn("flex justify-between", nq >= 10 ? "text-green-400" : "text-red-400")}>
                    <span>n(1-p) = {nq.toFixed(2)}</span>
                    <span>{nq >= 10 ? "✓ ≥ 10" : "✗ < 10"}</span>
                  </div>
                </div>
                <p className={cn("text-xs mt-2", ruleOfThumbMet ? "text-green-400" : "text-red-400")}>
                  Approximation {ruleOfThumbMet ? "suitable ✓" : "not recommended ✗"}
                </p>
              </div>
            )}
            
            {/* Step 4: Continuity Correction */}
            {currentStep >= 4 && showCC && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border border-gray-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">4. Continuity Correction</h5>
                {probType === "le" && (
                  <p className="text-sm">For {getProbabilityNotation()}, adjust: k' = {k} + 0.5 = {k + 0.5}</p>
                )}
                {probType === "ge" && (
                  <p className="text-sm">For {getProbabilityNotation()}, adjust: k' = {k} - 0.5 = {k - 0.5}</p>
                )}
                {probType === "eq" && (
                  <p className="text-sm">For {getProbabilityNotation()}, use interval: [{k - 0.5}, {k + 0.5}]</p>
                )}
              </div>
            )}
            
            {/* Step 5: Z-Score */}
            {currentStep >= 5 && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border border-gray-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">
                  {showCC ? "5" : "4"}. Calculate Z-Score
                </h5>
                {probType !== "eq" ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[Z = \\frac{k' - \\mu}{\\sigma} = \\frac{${showCC ? (probType === "le" ? k + 0.5 : k - 0.5) : k} - ${mu.toFixed(2)}}{${sigma.toFixed(3)}} = ${(((showCC ? (probType === "le" ? k + 0.5 : k - 0.5) : k) - mu) / sigma).toFixed(3)}\\]` 
                  }} />
                ) : (
                  showCC ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: `\\[\\begin{align}
                        Z_1 &= \\frac{${k - 0.5} - ${mu.toFixed(2)}}{${sigma.toFixed(3)}} = ${((k - 0.5 - mu) / sigma).toFixed(3)} \\\\
                        Z_2 &= \\frac{${k + 0.5} - ${mu.toFixed(2)}}{${sigma.toFixed(3)}} = ${((k + 0.5 - mu) / sigma).toFixed(3)}
                      \\end{align}\\]` 
                    }} />
                  ) : (
                    <p className="text-sm text-yellow-400">
                      Note: Without CC for P(X=k), we use the PDF at k
                    </p>
                  )
                )}
              </div>
            )}
            
            {/* Step 6: Probability Result */}
            {currentStep >= 6 && (
              <div className={cn(
                "p-3 rounded-lg animate-fadeIn",
                "bg-gray-800 border border-gray-700"
              )}>
                <h5 className="text-sm font-semibold mb-2">
                  {showCC ? "6" : "5"}. Probability Result
                </h5>
                <p className="text-sm mb-2">
                  Normal Approximation: <span className="font-mono text-emerald-400">{normalProb.toFixed(6)}</span>
                </p>
              </div>
            )}
            
            {/* Step 7: Comparison */}
            {currentStep >= 7 && (
              <div className={cn(
                "p-4 rounded-lg animate-fadeIn",
                "bg-gradient-to-r from-gray-800 to-gray-700",
                "border border-gray-600"
              )}>
                <h5 className="text-sm font-semibold mb-3">7. Comparison</h5>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-mono text-blue-400">
                      {binomialProb.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-400">Exact (Binomial)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono text-emerald-400">
                      {normalProb.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-400">Approximation</div>
                  </div>
                </div>
                
                {/* Error Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Absolute Error</span>
                    <span className="font-mono text-yellow-400">{error.toFixed(6)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        error < 0.01 ? "bg-green-500" : 
                        error < 0.05 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(error * 1000, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {error < 0.01 ? "Excellent" : error < 0.05 ? "Good" : "Poor"} approximation
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Educational Tips */}
          {interactionCount >= 10 && (
            <div className={cn(
              "p-4 rounded-lg animate-fadeIn",
              "bg-gradient-to-r from-blue-900/30 to-indigo-900/30",
              "border border-blue-700/50"
            )}>
              <p className="text-sm font-semibold text-blue-300 mb-2">
                💡 Key Insights
              </p>
              <ul className="text-xs space-y-1 text-gray-300">
                <li>• Continuity correction improves accuracy, especially for P(X=k)</li>
                <li>• Approximation works best when p is near 0.5</li>
                <li>• Larger n generally gives better approximation</li>
                <li>• Check the rule of thumb before using this method</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
});

export { NormalApproxBinomialWorkedExample };
export default NormalApproxBinomialWorkedExample;