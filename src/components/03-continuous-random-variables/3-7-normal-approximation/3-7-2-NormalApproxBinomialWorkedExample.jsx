"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import jStat from "jstat";
import { cn } from "../../../lib/utils";
import { RangeSlider } from "../../ui/RangeSlider";
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import { colors, typography, components, formatNumber } from '../../../lib/design-system';
import { VisualizationContainer, ControlGroup } from '../../ui/VisualizationContainer';
import { SemanticGradientCard } from '../../ui/patterns/SemanticGradientCard';
import { InterpretationBox, StepInterpretation } from '../../ui/patterns/InterpretationBox';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '../../ui/patterns/StepByStepCalculation';
import { ChevronRight, Calculator, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';

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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && currentStep > 1) {
      e.preventDefault();
      setCurrentStep(Math.max(1, currentStep - 1));
    } else if (e.key === 'ArrowRight' && currentStep < 7) {
      e.preventDefault();
      setCurrentStep(Math.min(7, currentStep + 1));
    }
  }, [currentStep]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
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
    if (!svgRef.current) return;
    if (!distributionData || !distributionData.binomialData || distributionData.binomialData.length === 0) return;
    
    // Small delay to ensure DOM is ready
    const renderChart = () => {
      const svg = d3.select(svgRef.current);
      // Ensure minimum width if container hasn't sized yet
      const containerWidth = svgRef.current.parentElement?.clientWidth || svgRef.current.clientWidth;
      const width = containerWidth > 0 ? containerWidth : 800;
      const height = 450;
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      
      // Set SVG dimensions explicitly
      svg.attr("width", width).attr("height", height);
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
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.6)
      .attr("stroke", "#3b82f6")
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
          .attr("fill", "#3b82f6")
          .attr("opacity", 0.8)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2);
        
        // Show continuity correction boundaries if enabled
        if (showCC && highlightedConcept === "continuity") {
          svg.append("line")
            .attr("x1", xScale(k - 0.5))
            .attr("x2", xScale(k - 0.5))
            .attr("y1", yScale(0))
            .attr("y2", yScale(kData.y))
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
          
          svg.append("line")
            .attr("x1", xScale(k + 0.5))
            .attr("x2", xScale(k + 0.5))
            .attr("y1", yScale(0))
            .attr("y2", yScale(kData.y))
            .attr("stroke", "#3b82f6")
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
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add mean line
    svg.append("line")
      .attr("x1", xScale(mu))
      .attr("x2", xScale(mu))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    svg.append("text")
      .attr("x", xScale(mu))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .style("fill", "#3b82f6")
      .style("font-size", "12px")
      .text(`\u03bc = ${mu.toFixed(2)}`);
    };
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(renderChart);
    
  }, [n, p, k, mu, sigma, showCC, highlightedConcept, distributionData]);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [n, p, k, mu, sigma, probType, showCC, currentStep]);
  
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
      default: return `P(X \\le ${k})`;
    }
  };
  
  // Memoized Step 2 Component to prevent LaTeX re-rendering
  const Step2NormalParameters = React.memo(function Step2NormalParameters({ n, p, mu, variance, sigma }) {
    const stepRef = useRef(null);
    
    // Use safe MathJax processing with error handling
    useSafeMathJax(stepRef, [n, p, mu, variance, sigma]);
    
    return (
      <div ref={stepRef} className="space-y-3">
        <FormulaDisplay>
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[\\begin{align}
              \\mu &= np = ${n} \\times ${p} = ${mu.toFixed(2)} \\\\
              \\sigma^2 &= np(1-p) = ${variance.toFixed(2)} \\\\
              \\sigma &= \\sqrt{${variance.toFixed(2)}} = ${sigma.toFixed(3)}
            \\end{align}\\]` 
          }} />
        </FormulaDisplay>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-purple-900/20 border border-purple-700/50 rounded p-2 text-center">
            <p className="text-xs text-purple-300">Mean</p>
            <p className="font-mono text-purple-400">μ = {mu.toFixed(2)}</p>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-700/50 rounded p-2 text-center">
            <p className="text-xs text-indigo-300">Variance</p>
            <p className="font-mono text-indigo-400">σ² = {variance.toFixed(2)}</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-700/50 rounded p-2 text-center">
            <p className="text-xs text-blue-300">Std Dev</p>
            <p className="font-mono text-blue-400">σ = {sigma.toFixed(3)}</p>
          </div>
        </div>
      </div>
    );
  });
  
  // Memoized Z-Score Calculation Component
  const ZScoreCalculation = React.memo(function ZScoreCalculation({ probType, showCC, k, mu, sigma }) {
    const stepRef = useRef(null);
    
    // Use safe MathJax processing with error handling
    useSafeMathJax(stepRef, [probType, showCC, k, mu, sigma]);
    
    return (
      <div ref={stepRef}>
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
    );
  });
  
  return (
    <VisualizationContainer
      title="Interactive Normal Approximation to Binomial"
      description="Explore when and how the normal distribution approximates the binomial distribution"
    >
      
      {/* Main Content Area - Reorganized Layout */}
      <div className="space-y-6">
        {/* Full Width Visualization at Top */}
        <div className={cn(
          "bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg p-4",
          "border border-neutral-700"
        )}>
          {/* Distribution Comparison Legend */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span>Binomial (Exact)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-emerald-500" />
                <span>Normal (Approximation)</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              μ = {mu.toFixed(2)}, σ = {sigma.toFixed(3)}
            </div>
          </div>
          
          <svg
            ref={svgRef}
            className="w-full"
            style={{ minHeight: '450px', height: '450px', display: 'block' }}
          />
        </div>
        
        {/* Controls and Dynamic Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Controls */}
          <div className="space-y-4" ref={contentRef}>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Parameters & Controls</h3>
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
                  { value: "le", label: "P(X \u2264 k)" },
                  { value: "ge", label: "P(X \u2265 k)" },
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
                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
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
          
          {/* Enhanced Step Navigation with Progress Indicator */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="bg-neutral-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs font-mono text-teal-400">Step {currentStep} of {showCC ? 7 : 6}</span>
              </div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(currentStep / (showCC ? 7 : 6)) * 100}%` }}
                />
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-3">
                {Array.from({ length: showCC ? 7 : 6 }, (_, i) => i + 1).map(step => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-bold transition-all",
                      step <= currentStep 
                        ? "bg-teal-600 text-white" 
                        : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                    )}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all",
                  currentStep === 1
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-600 text-white hover:bg-neutral-500"
                )}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(showCC ? 7 : 6, currentStep + 1))}
                disabled={currentStep === (showCC ? 7 : 6)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all",
                  currentStep === (showCC ? 7 : 6)
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-600 text-white hover:bg-neutral-500"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <StepByStepCalculation>
            {/* Step 1: Problem Setup */}
            {currentStep >= 1 && (
              <CalculationStep 
                number={1} 
                title="Problem Setup"
                icon={<Info className="w-4 h-4" />}
                variant="info"
              >
                <div className="space-y-2">
                  <p className="text-sm" dangerouslySetInnerHTML={{ 
                    __html: `Approximate \\(${getProbabilityNotation()}\\)` 
                  }} />
                  <FormulaDisplay>
                    <div dangerouslySetInnerHTML={{ 
                      __html: `\\[X \\sim B(n=${n}, p=${p})\\]` 
                    }} />
                  </FormulaDisplay>
                </div>
              </CalculationStep>
            )}
            
            {/* Step 2: Normal Parameters */}
            {currentStep >= 2 && (
              <CalculationStep 
                number={2} 
                title="Normal Parameters"
                icon={<Calculator className="w-4 h-4" />}
                variant="primary"
              >
                <Step2NormalParameters 
                  n={n} 
                  p={p} 
                  mu={mu} 
                  variance={variance} 
                  sigma={sigma} 
                />
              </CalculationStep>
            )}
            
            {/* Step 3: Rule of Thumb */}
            {currentStep >= 3 && (
              <CalculationStep 
                number={3} 
                title="Rule of Thumb Check"
                icon={ruleOfThumbMet ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                variant={ruleOfThumbMet ? "success" : "warning"}
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={cn("flex items-center justify-between p-2 rounded", 
                      np >= 10 ? "bg-green-900/20 border border-green-700/50" : "bg-red-900/20 border border-red-700/50"
                    )}>
                      <span>np = {np.toFixed(2)}</span>
                      <span className={np >= 10 ? "text-green-400" : "text-red-400"}>
                        {np >= 10 ? "✓ ≥ 10" : "✗ < 10"}
                      </span>
                    </div>
                    <div className={cn("flex items-center justify-between p-2 rounded",
                      nq >= 10 ? "bg-green-900/20 border border-green-700/50" : "bg-red-900/20 border border-red-700/50"
                    )}>
                      <span>n(1-p) = {nq.toFixed(2)}</span>
                      <span className={nq >= 10 ? "text-green-400" : "text-red-400"}>
                        {nq >= 10 ? "✓ ≥ 10" : "✗ < 10"}
                      </span>
                    </div>
                  </div>
                  <InterpretationBox type={ruleOfThumbMet ? "success" : "warning"}>
                    Approximation {ruleOfThumbMet ? "suitable" : "not recommended"} - 
                    {ruleOfThumbMet 
                      ? " Both conditions met for accurate normal approximation"
                      : " Consider using exact binomial calculations instead"}
                  </InterpretationBox>
                </div>
              </CalculationStep>
            )}
            
            {/* Step 4: Continuity Correction */}
            {currentStep >= 4 && showCC && (
              <CalculationStep 
                number={4} 
                title="Continuity Correction"
                icon={<TrendingUp className="w-4 h-4" />}
                variant="info"
              >
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    Converting discrete to continuous distribution:
                  </p>
                  <FormulaDisplay>
                    {probType === "le" && (
                      <div dangerouslySetInnerHTML={{ __html: `\\[P(X \\leq ${k}) \\approx P(X < ${k + 0.5})\\]` }} />
                    )}
                    {probType === "ge" && (
                      <div dangerouslySetInnerHTML={{ __html: `\\[P(X \\geq ${k}) \\approx P(X > ${k - 0.5})\\]` }} />
                    )}
                    {probType === "eq" && (
                      <div dangerouslySetInnerHTML={{ __html: `\\[P(X = ${k}) \\approx P(${k - 0.5} < X < ${k + 0.5})\\]` }} />
                    )}
                  </FormulaDisplay>
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded p-2">
                    <p className="text-xs text-blue-300">
                      Adjusted value: k' = {
                        probType === "le" ? `${k + 0.5}` :
                        probType === "ge" ? `${k - 0.5}` :
                        `[${k - 0.5}, ${k + 0.5}]`
                      }
                    </p>
                  </div>
                </div>
              </CalculationStep>
            )}
            
            {/* Step 5: Z-Score */}
            {currentStep >= (showCC ? 5 : 4) && (
              <CalculationStep 
                number={showCC ? 5 : 4} 
                title="Calculate Z-Score"
                icon={<Calculator className="w-4 h-4" />}
                variant="primary"
              >
                <ZScoreCalculation 
                  probType={probType}
                  showCC={showCC}
                  k={k}
                  mu={mu}
                  sigma={sigma}
                />
              </CalculationStep>
            )}
            
            {/* Step 6: Probability Result */}
            {currentStep >= (showCC ? 6 : 5) && (
              <CalculationStep 
                number={showCC ? 6 : 5} 
                title="Probability Result"
                icon={<TrendingUp className="w-4 h-4" />}
                variant="success"
              >
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-3 border border-emerald-700/50">
                    <p className="text-sm text-gray-300 mb-2">Normal Approximation:</p>
                    <p className="text-2xl font-mono text-emerald-400">
                      {normalProb.toFixed(6)}
                    </p>
                  </div>
                  <InterpretationBox type="info">
                    Using the standard normal table with Z = {(((showCC ? (probType === "le" ? k + 0.5 : probType === "ge" ? k - 0.5 : k) : k) - mu) / sigma).toFixed(3)}
                  </InterpretationBox>
                </div>
              </CalculationStep>
            )}
            
            {/* Step 7: Comparison */}
            {currentStep >= (showCC ? 7 : 6) && (
              <CalculationStep 
                number={showCC ? 7 : 6} 
                title="Final Comparison"
                icon={<CheckCircle className="w-4 h-4" />}
                variant="highlight"
              >
                <SemanticGradientCard type="comparison">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-300 mb-1">Exact (Binomial)</p>
                      <p className="text-2xl font-mono text-blue-400">
                        {binomialProb.toFixed(6)}
                      </p>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-emerald-300 mb-1">Normal Approximation</p>
                      <p className="text-2xl font-mono text-emerald-400">
                        {normalProb.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Error Analysis */}
                  <div className="space-y-3">
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Absolute Error</span>
                        <span className="font-mono text-yellow-400">{error.toFixed(6)}</span>
                      </div>
                      <div className="h-3 bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            error < 0.01 ? "bg-gradient-to-r from-green-500 to-emerald-500" : 
                            error < 0.05 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : 
                            "bg-gradient-to-r from-red-500 to-pink-500"
                          )}
                          style={{ width: `${Math.min(error * 1000, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <InterpretationBox type={error < 0.01 ? "success" : error < 0.05 ? "warning" : "error"}>
                      {error < 0.01 ? "Excellent approximation!" : error < 0.05 ? "Good approximation." : "Poor approximation."}
                      {error < 0.01 
                        ? " The normal distribution closely matches the binomial." 
                        : error < 0.05 
                        ? " Consider whether this accuracy is sufficient for your use case."
                        : " Consider using exact binomial calculations instead."}
                    </InterpretationBox>
                  </div>
                </SemanticGradientCard>
              </CalculationStep>
            )}
          </StepByStepCalculation>
          </div>
          
          {/* Right Column: Dynamic Insights and Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Analysis & Insights</h3>
            {/* Continuity Correction Visual */}
            {showCC && probType === "eq" && interactionCount >= 5 && (
              <div className={cn(
                "p-3 rounded-lg",
                "bg-gradient-to-r from-teal-900/30 to-emerald-900/30",
                "border border-teal-700/50 cursor-pointer"
              )}
              onClick={() => setHighlightedConcept(
                highlightedConcept === "continuity" ? null : "continuity"
              )}>
                <p className="text-sm font-semibold text-teal-400">
                  Continuity Correction Visualization
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  The bar at k={k} spans from {k-0.5} to {k+0.5}. 
                  {highlightedConcept === "continuity" && " (Shown as dashed lines)"}
                </p>
              </div>
            )}
            
            {/* Dynamic Insight Box */}
            {dynamicInsight && interactionCount >= 3 && (
              <div className={cn(
                "p-4 rounded-lg animate-fadeIn",
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
            
            {/* Educational Tips */}
            {interactionCount >= 10 && (
              <div className={cn(
                "p-4 rounded-lg animate-fadeIn",
                "bg-gradient-to-r from-blue-900/30 to-indigo-900/30",
                "border border-blue-700/50"
              )}>
                <p className="text-sm font-semibold text-blue-300 mb-2">
                  Key Insights
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
        
      </div>
    </VisualizationContainer>
  );
});

export default NormalApproxBinomialWorkedExample;