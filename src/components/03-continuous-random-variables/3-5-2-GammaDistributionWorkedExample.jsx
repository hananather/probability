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

const GammaDistributionWorkedExample = React.memo(function GammaDistributionWorkedExample({
  initialShape = 2,
  initialRate = 1
}) {
  // Interactive state
  const [shape, setShape] = useState(initialShape);
  const [rate, setRate] = useState(initialRate);
  const [interactionCount, setInteractionCount] = useState(0);
  const [expandedStep, setExpandedStep] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [highlightedFeature, setHighlightedFeature] = useState(null);
  
  // Refs for D3 visualization
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Derived values
  const scale = 1 / rate;
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const mode = shape > 1 ? (shape - 1) * scale : 0;
  const stdDev = Math.sqrt(variance);
  
  // Check special cases
  const isExponential = Math.abs(shape - 1) < 0.01;
  const isChiSquared = shape % 1 === 0 && Math.abs(scale - 2) < 0.01;
  
  // Track interactions
  const handleParameterChange = useCallback((setter) => {
    return (value) => {
      setter(value);
      setInteractionCount(prev => prev + 1);
    };
  }, []);
  
  // Milestones for progressive learning
  const milestones = {
    explorer: { threshold: 5, message: "Try different parameter values!", badge: "Parameter Explorer" },
    specialCase: { threshold: 10, message: "You found a special case!", badge: "Special Case Finder" },
    engineer: { threshold: 15, message: "Explore engineering applications!", badge: "Engineering Applications" },
    master: { threshold: 20, message: "You've mastered the Gamma distribution!", badge: "Gamma Distribution Master" }
  };
  
  // Generate distribution data for visualization
  const distributionData = useMemo(() => {
    const xMax = Math.max(mean + 4 * stdDev, 10);
    const step = xMax / 200;
    const data = [];
    
    for (let x = 0.01; x <= xMax; x += step) {
      try {
        const y = jStat.gamma.pdf(x, shape, scale);
        if (!isNaN(y) && isFinite(y)) {
          data.push({ x, y });
        }
      } catch (e) {
        // Skip invalid values
      }
    }
    
    return data;
  }, [shape, scale, mean, stdDev]);
  
  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || distributionData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    
    svg.selectAll("*").remove();
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(distributionData, d => d.x)])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(distributionData, d => d.y) * 1.1])
      .range([height - margin.bottom, margin.top]);
    
    // Gradient definitions
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", "gamma-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.primary)
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.primary)
      .attr("stop-opacity", 0.1);
    
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
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .style("fill", colors.chart.text)
      .text("x");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => d.toFixed(2)))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("fill", colors.chart.text)
      .text("f(x)");
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    svg.append("path")
      .datum(distributionData)
      .attr("fill", "url(#gamma-gradient)")
      .attr("d", area);
    
    // Line
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    svg.append("path")
      .datum(distributionData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add mean line
    svg.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", colorScheme.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    svg.append("text")
      .attr("x", xScale(mean))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .style("fill", colorScheme.secondary)
      .style("font-size", "12px")
      .text(`μ = ${mean.toFixed(2)}`);
    
    // Add mode line if shape > 1
    if (shape > 1) {
      svg.append("line")
        .attr("x1", xScale(mode))
        .attr("x2", xScale(mode))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", colorScheme.tertiary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
      
      svg.append("text")
        .attr("x", xScale(mode))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .style("fill", colorScheme.tertiary)
        .style("font-size", "12px")
        .text(`Mode = ${mode.toFixed(2)}`);
    }
    
  }, [distributionData, shape, mean, mode, colorScheme]);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error in GammaDistributionWorkedExample:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    
    return () => clearTimeout(timeoutId);
  }, [shape, rate, scale, mean, variance, mode]);
  
  // Engineering context based on parameters
  const getEngineeringContext = () => {
    if (isExponential) {
      return {
        title: "Exponential Distribution (k = 1)",
        description: "Models time between independent events in a Poisson process.",
        example: `With rate λ = ${rate.toFixed(2)}, the mean time between failures is ${mean.toFixed(2)} hours.`
      };
    }
    
    if (shape < 1) {
      return {
        title: "Early Failure Mode (k < 1)",
        description: "J-shaped distribution models decreasing failure rates.",
        example: "Common in burn-in period of electronic components."
      };
    }
    
    if (shape > 1 && shape <= 3) {
      return {
        title: "Wear-Out Failure (1 < k ≤ 3)",
        description: "Models increasing failure rates due to aging.",
        example: `With k = ${shape.toFixed(1)}, this represents a ${Math.floor(shape)}-stage failure process.`
      };
    }
    
    return {
      title: "Multi-Stage Process (k > 3)",
      description: "Approximates normal distribution for large k.",
      example: `Sum of ${Math.floor(shape)} independent exponential stages.`
    };
  };
  
  const engineeringContext = getEngineeringContext();
  
  return (
    <VisualizationContainer
      title="Interactive Gamma Distribution Explorer"
      description="Explore how shape and rate parameters affect the Gamma distribution"
    >
      {/* Progress Tracker */}
      <ProgressTracker 
        current={interactionCount}
        goal={20}
        label="Exploration Progress"
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
            <svg
              ref={svgRef}
              className="w-full h-[400px]"
              style={{ minHeight: '400px' }}
            />
          </div>
          
          {/* Engineering Context Box */}
          {interactionCount >= 5 && (
            <div className={cn(
              "mt-4 p-4 rounded-lg",
              "bg-gradient-to-r from-blue-900/50 to-teal-900/50",
              "border border-blue-700/50",
              "animate-fadeIn"
            )}>
              <h4 className="text-base font-semibold text-blue-300 mb-2">
                {engineeringContext.title}
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                {engineeringContext.description}
              </p>
              <p className="text-sm font-mono text-yellow-400">
                {engineeringContext.example}
              </p>
            </div>
          )}
        </div>
        
        {/* Controls and Calculations (40% width on desktop) */}
        <div className="lg:col-span-2 space-y-4" ref={contentRef}>
          {/* Parameter Controls */}
          <ControlGroup>
            <RangeSlider
              label="Shape (k)"
              value={shape}
              onChange={handleParameterChange(setShape)}
              min={0.1}
              max={10}
              step={0.1}
              formatValue={v => v.toFixed(1)}
              className="mb-4"
            />
            <RangeSlider
              label="Rate (β)"
              value={rate}
              onChange={handleParameterChange(setRate)}
              min={0.1}
              max={5}
              step={0.1}
              formatValue={v => v.toFixed(1)}
              className="mb-4"
            />
          </ControlGroup>
          
          {/* Special Case Indicators */}
          {(isExponential || isChiSquared) && interactionCount >= 3 && (
            <div className={cn(
              "p-3 rounded-lg mb-4 animate-fadeIn",
              "bg-emerald-900/30 border border-emerald-700/50"
            )}>
              <p className="text-sm font-semibold text-emerald-400">
                ✨ Special Case Detected!
              </p>
              {isExponential && (
                <p className="text-xs text-gray-300 mt-1">
                  Gamma(1, θ) = Exponential(λ = 1/θ)
                </p>
              )}
              {isChiSquared && (
                <p className="text-xs text-gray-300 mt-1">
                  Gamma({shape}, 2) = χ²(df = {2 * shape})
                </p>
              )}
            </div>
          )}
          
          {/* Statistics Display */}
          <div className={cn(
            "p-4 rounded-lg",
            "bg-gray-800 border border-gray-700"
          )}>
            <h4 className="text-base font-semibold mb-3">Distribution Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Mean (μ)</span>
                <span className="font-mono text-yellow-400">{mean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Variance (σ²)</span>
                <span className="font-mono text-yellow-400">{variance.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Std Dev (σ)</span>
                <span className="font-mono text-yellow-400">{stdDev.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Mode</span>
                <span className="font-mono text-yellow-400">
                  {shape > 1 ? mode.toFixed(3) : "0 (at boundary)"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Step-by-Step Calculations */}
          <div className="space-y-3">
            {/* Step 1: Distribution Parameters */}
            <div 
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all",
                "bg-gray-800 border border-gray-700",
                "hover:border-gray-600",
                expandedStep === 1 && "border-teal-600"
              )}
              onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}
            >
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold">1. Distribution Parameters</h5>
                <span className="text-xs text-gray-500">
                  {expandedStep === 1 ? "▼" : "▶"}
                </span>
              </div>
              {expandedStep === 1 && (
                <div className="mt-3 text-sm space-y-2">
                  <p>{`\(X \sim \text{Gamma}(k = ${shape.toFixed(1)}, \theta = ${scale.toFixed(3)})\)`}</p>
                  <p className="text-xs text-gray-400">
                    {`Alternative: \(\text{Gamma}(\alpha = ${shape.toFixed(1)}, \beta = ${rate.toFixed(1)})\) where \(\theta = 1/\beta\)`}
                  </p>
                </div>
              )}
            </div>
      
            {/* Step 2: PDF Formula */}
            <div 
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all",
                "bg-gray-800 border border-gray-700",
                "hover:border-gray-600",
                expandedStep === 2 && "border-teal-600"
              )}
              onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}
            >
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold">2. Probability Density Function</h5>
                <span className="text-xs text-gray-500">
                  {expandedStep === 2 ? "▼" : "▶"}
                </span>
              </div>
              {expandedStep === 2 && (
                <div className="mt-3 text-sm">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[f(x; k, \\theta) = \\frac{1}{\\Gamma(k)\\theta^k} x^{k-1} e^{-x/\\theta}\\]` 
                  }} />
                  <p className="text-xs text-gray-400 mt-2">
                    {`for \(x > 0\), where \(\Gamma(k)\) is the gamma function`}
                  </p>
                  {interactionCount >= 7 && (
                    <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                      <p className="text-yellow-400">💡 Shape Behavior:</p>
                      <ul className="mt-1 space-y-1 text-gray-300">
                        <li>• k &lt; 1: J-shaped, decreasing</li>
                        <li>• k = 1: Exponential decay</li>
                        <li>• k &gt; 1: Bell-shaped with mode</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
      
            {/* Step 3: Mean, Variance, Mode */}
            <div 
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all",
                "bg-gray-800 border border-gray-700",
                "hover:border-gray-600",
                expandedStep === 3 && "border-teal-600"
              )}
              onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}
            >
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold">3. Mean, Variance, and Mode</h5>
                <span className="text-xs text-gray-500">
                  {expandedStep === 3 ? "▼" : "▶"}
                </span>
              </div>
              {expandedStep === 3 && (
                <div className="mt-3 text-sm">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[\\begin{align}
                      E[X] &= k\\theta = ${shape.toFixed(1)} \\times ${scale.toFixed(3)} = ${mean.toFixed(3)} \\\\
                      \\text{Var}(X) &= k\\theta^2 = ${shape.toFixed(1)} \\times ${scale.toFixed(3)}^2 = ${variance.toFixed(3)} \\\\
                      \\text{Mode} &= ${shape > 1 ? `(k-1)\\theta = (${shape.toFixed(1)}-1) \\times ${scale.toFixed(3)} = ${mode.toFixed(3)}` : '\\text{0 (at boundary)'}
                    \\end{align}\\]` 
                  }} />
                  {interactionCount >= 10 && (
                    <p className="text-xs text-gray-400 mt-2">
                      The mean shifts right as either k or θ increases
                    </p>
                  )}
                </div>
              )}
            </div>
      
            {/* Step 4: Special Connections */}
            {interactionCount >= 5 && (
              <div 
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all animate-fadeIn",
                  "bg-gray-800 border border-gray-700",
                  "hover:border-gray-600",
                  expandedStep === 4 && "border-teal-600"
                )}
                onClick={() => setExpandedStep(expandedStep === 4 ? null : 4)}
              >
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-semibold">4. Special Connections</h5>
                  <span className="text-xs text-gray-500">
                    {expandedStep === 4 ? "▼" : "▶"}
                  </span>
                </div>
                {expandedStep === 4 && (
                  <div className="mt-3 text-sm space-y-3">
                    {/* Exponential Connection */}
                    <div>
                      <p className="font-semibold text-blue-400 mb-1">Exponential Distribution:</p>
                      {isExponential ? (
                        <div>
                          <p className="text-emerald-400 mb-2">
                            ✓ When k = 1, Gamma(1, θ) = Exponential(λ = 1/θ)
                          </p>
                          <div dangerouslySetInnerHTML={{ 
                            __html: `\\[f(x) = \\frac{1}{\\theta} e^{-x/\\theta} = ${rate.toFixed(3)} e^{-${rate.toFixed(3)}x}\\]` 
                          }} />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">
                          {`Sum of ${Math.floor(shape)} independent Exp(${rate.toFixed(1)}) variables`}
                        </p>
                      )}
                    </div>
                    
                    {/* Chi-Squared Connection */}
                    {isChiSquared && (
                      <div>
                        <p className="font-semibold text-blue-400 mb-1">Chi-Squared Distribution:</p>
                        <p className="text-emerald-400">
                          ✓ Gamma({shape}, 2) = χ²(df = {2 * shape})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
      
          {/* Key Properties - Always visible */}
          {interactionCount >= 10 && (
            <div className={cn(
              "p-4 rounded-lg animate-fadeIn",
              "bg-gradient-to-r from-blue-900/30 to-indigo-900/30",
              "border border-blue-700/50"
            )}>
              <p className="text-sm font-semibold text-blue-300 mb-2">
                💡 Key Properties
              </p>
              <ul className="text-xs space-y-1 text-gray-300">
                <li>• Shape k controls distribution form</li>
                <li>• Scale θ stretches/compresses horizontally</li>
                <li>• Becomes more symmetric as k increases</li>
                {isExponential && <li className="text-yellow-400">• Memoryless property active!</li>}
              </ul>
            </div>
          )}
          
          {/* Applications - Shown at higher interaction count */}
          {interactionCount >= 15 && (
            <div className={cn(
              "p-4 rounded-lg animate-fadeIn",
              "bg-gray-800 border border-gray-700"
            )}>
              <p className="text-sm font-semibold mb-2">
                📊 Applications
              </p>
              <ul className="text-xs space-y-1 text-gray-400">
                <li>• Wait time until k-th event (Poisson process)</li>
                <li>• Rainfall amounts modeling</li>
                <li>• Insurance claim sizes</li>
                <li>• System reliability analysis</li>
                <li>• Bayesian statistics (conjugate prior)</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
});

export { GammaDistributionWorkedExample };
export default GammaDistributionWorkedExample;