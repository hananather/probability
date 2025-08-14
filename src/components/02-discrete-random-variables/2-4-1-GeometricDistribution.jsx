"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { RangeSlider, SliderPresets } from '../ui/RangeSlider';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { colors, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Enhanced color scheme for geometric distribution
const colorScheme = createColorScheme('waiting');
const geometricColors = {
  ...colorScheme,
  primary: '#f97316', // orange-500
  primaryLight: '#fb923c', // orange-400
  primaryDark: '#ea580c', // orange-600
  secondary: '#fbbf24', // amber-400
  accent: '#f59e0b', // amber-500
  success: '#10b981', // emerald-500
  failure: '#ef4444', // red-500
  gradients: {
    primary: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    failure: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  }
};

// Key Concepts Card with LaTeX (using LinearRegressionHub scaffolding)
const GeometricConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "PMF Formula", definition: "Probability mass function", latex: "P(X = k) = (1-p)^{k-1} p" },
    { term: "Expected Value", definition: "Average number of trials", latex: "E[X] = \\frac{1}{p}" },
    { term: "Variance", definition: "Measure of spread", latex: "\\text{Var}(X) = \\frac{1-p}{p^2}" },
    { term: "Standard Deviation", definition: "Square root of variance", latex: "\\sigma = \\sqrt{\\frac{1-p}{p^2}}" },
  ];

  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Geometric Distribution Concepts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
              </div>
              <div className="text-lg font-mono text-orange-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

export default function GeometricDistribution() {
  // State
  const [p, setP] = useState(0.3); // probability of success
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trialHistory, setTrialHistory] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(300); // ms per trial
  const [stepMode, setStepMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  
  // Refs
  const pmfSvgRef = useRef(null);
  const animationRef = useRef(null);
  const isAnimatingRef = useRef(false);
  
  // Calculate statistics with edge case handling
  const expectedValue = p > 0 ? 1 / p : Infinity;
  const variance = p > 0 && p < 1 ? (1 - p) / (p * p) : 0;
  const stdDev = Math.sqrt(variance);
  
  // Calculate PMF values for display
  const calculatePMF = useCallback(() => {
    if (p <= 0 || p > 1) return [];
    
    const pmfData = [];
    let cumulative = 0;
    const maxK = Math.min(50, Math.max(20, Math.ceil(3 * expectedValue)));
    
    for (let k = 1; k <= maxK && cumulative < 0.999; k++) {
      const prob = Math.pow(1 - p, k - 1) * p;
      pmfData.push({ k, prob });
      cumulative += prob;
    }
    
    return pmfData;
  }, [p, expectedValue]);

  // MathJax processing is now handled by the useMathJax hook
  
  // Initialize PMF visualization
  useEffect(() => {
    if (!pmfSvgRef.current) return;
    
    const svg = d3.select(pmfSvgRef.current);
    const { width } = pmfSvgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", colorScheme.backgroundDark);
    
    const pmfData = calculatePMF();
    
    // Handle edge cases
    if (pmfData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .text("Invalid probability value");
      return;
    }
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(pmfData.map(d => d.k))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(0.5, d3.max(pmfData, d => d.prob) * 1.1)])
      .range([height - margin.bottom, margin.top]);
    
    // Grid lines
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
    
    // X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter((d, i) => i % Math.ceil(pmfData.length / 10) === 0))
      );
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");
    
    // X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text("Number of trials (k)");
    
    // Y axis
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${(d * 100).toFixed(1)}%`)
      );
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "11px");
    
    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .text("P(X = k)");
    
    // Bars with exponential decay pattern
    const bars = svg.selectAll("rect.pmf-bar")
      .data(pmfData)
      .join("rect")
      .attr("class", "pmf-bar")
      .attr("x", d => xScale(d.k))
      .attr("y", d => yScale(d.prob))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(0) - yScale(d.prob))
      .attr("fill", geometricColors.primary)
      .attr("opacity", d => 0.4 + 0.6 * Math.exp(-d.k / expectedValue))
      .attr("rx", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
      .style("transition", "all 300ms ease-in-out");
    
    // Enhanced hover effects with smooth transitions
    bars
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.1)");
        
        // Add tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.k) + xScale.bandwidth() / 2}, ${yScale(d.prob) - 10})`);
        
        const rect = tooltip.append("rect")
          .attr("rx", 4)
          .attr("fill", "#1f2937")
          .attr("stroke", geometricColors.primary)
          .attr("stroke-width", 1);
        
        const text = tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "12px");
        
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", 0)
          .text(`Trial ${d.k}: ${(d.prob * 100).toFixed(2)}%`);
        
        const bbox = text.node().getBBox();
        rect
          .attr("x", bbox.x - 8)
          .attr("y", bbox.y - 4)
          .attr("width", bbox.width + 16)
          .attr("height", bbox.height + 8);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.4 + 0.6 * Math.exp(-d.k / expectedValue))
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        svg.selectAll(".tooltip").remove();
      });
    
    // Expected value line
    const evLine = svg.append("line")
      .attr("x1", xScale(Math.round(expectedValue)) + xScale.bandwidth() / 2)
      .attr("x2", xScale(Math.round(expectedValue)) + xScale.bandwidth() / 2)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", geometricColors.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    
    // Expected value label
    svg.append("text")
      .attr("x", xScale(Math.round(expectedValue)) + xScale.bandwidth() / 2)
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .attr("fill", geometricColors.secondary)
      .style("font-size", "12px")
      .style("font-weight", "700")
      .text(`E[X] = ${expectedValue.toFixed(1)}`);
    
  }, [p]);
  
  // Run until success animation with proper cleanup
  const runAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    
    // Reset state
    setIsAnimating(true);
    isAnimatingRef.current = true;
    setCurrentTrial(0);
    setTrialHistory([]);
    setWaitingForContinue(false);
    
    const animate = (trial = 1, history = []) => {
      if (!isAnimatingRef.current) return;
      
      const success = Math.random() < p;
      const newHistory = [...history, { trial, success }];
      
      // Batch state updates
      setCurrentTrial(trial);
      setTrialHistory(newHistory);
      
      if (success || trial >= 100) {
        // Success or safety limit reached
        animationRef.current = setTimeout(() => {
          setIsAnimating(false);
          isAnimatingRef.current = false;
          setWaitingForContinue(false);
        }, animationSpeed);
      } else if (stepMode) {
        // In step mode, pause and wait for user to continue
        setWaitingForContinue(true);
      } else {
        // Continue animation automatically
        animationRef.current = setTimeout(() => animate(trial + 1, newHistory), animationSpeed);
      }
    };
    
    animate();
  }, [p, animationSpeed, stepMode]);
  
  // Continue animation from pause (for step mode)
  const continueAnimation = useCallback(() => {
    if (!isAnimatingRef.current || !waitingForContinue) return;
    
    setWaitingForContinue(false);
    
    const animate = (trial = currentTrial + 1, history = trialHistory) => {
      if (!isAnimatingRef.current) return;
      
      const success = Math.random() < p;
      const newHistory = [...history, { trial, success }];
      
      // Batch state updates
      setCurrentTrial(trial);
      setTrialHistory(newHistory);
      
      if (success || trial >= 100) {
        // Success or safety limit reached
        animationRef.current = setTimeout(() => {
          setIsAnimating(false);
          isAnimatingRef.current = false;
          setWaitingForContinue(false);
        }, animationSpeed);
      } else if (stepMode) {
        // In step mode, pause and wait for user to continue
        setWaitingForContinue(true);
      } else {
        // Continue animation automatically
        animationRef.current = setTimeout(() => animate(trial + 1, newHistory), animationSpeed);
      }
    };
    
    animate();
  }, [p, animationSpeed, stepMode, currentTrial, trialHistory]);
  
  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
    isAnimatingRef.current = false;
    setWaitingForContinue(false);
  }, []);
  
  // Reset
  const reset = useCallback(() => {
    stopAnimation();
    setCurrentTrial(0);
    setTrialHistory([]);
    setWaitingForContinue(false);
  }, [stopAnimation]);
  
  // Cleanup on unmount and p change
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);
  
  // Stop animation if p changes during animation
  useEffect(() => {
    if (isAnimating && (p <= 0 || p > 1)) {
      stopAnimation();
    }
  }, [p, isAnimating, stopAnimation]);
  
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Geometric Distribution Explorer
          </h1>
          <p className="text-xl text-gray-400">
            Model the number of trials needed to get the first success
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <GeometricConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is the Geometric Distribution?</h2>
          <p className="text-gray-300">
            The geometric distribution models the number of trials needed to get the first success in a sequence of independent trials. 
            From flipping coins until heads to waiting for the first defective product, 
            it's essential for understanding "waiting time" problems in probability.
          </p>
        </Card>
        
        {/* Interactive Component */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
          <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Controls and Stats */}
          <div className="space-y-4">
            <VisualizationSection>
              <h3 className="text-base font-semibold mb-3">Parameters</h3>
              <ControlGroup>
                <RangeSlider
                  label="Success probability (p)"
                  value={p}
                  onChange={setP}
                  {...SliderPresets.probability}
                  className="mb-4"
                />
                <div className="space-y-3">
                  <button
                    onClick={runAnimation}
                    disabled={isAnimating || p <= 0 || p > 1}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform",
                      "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700",
                      "text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    )}
                  >
                    {isAnimating ? 
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Running...
                      </span> : 
                      'Run Until Success'
                    }
                  </button>
                  
                  {/* Step Mode Toggle */}
                  <div className="flex items-center gap-2 px-2">
                    <input
                      type="checkbox"
                      id="step-mode"
                      checked={stepMode}
                      onChange={(e) => setStepMode(e.target.checked)}
                      className="accent-orange-500"
                      disabled={isAnimating}
                    />
                    <label htmlFor="step-mode" className="text-sm text-gray-300">
                      Step-by-step mode
                    </label>
                  </div>
                  
                  {waitingForContinue && (
                    <button
                      onClick={continueAnimation}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform",
                        "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
                        "text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
                        "animate-pulse"
                      )}
                    >
                      Continue to Next Trial
                    </button>
                  )}
                  
                  {isAnimating && (
                    <button
                      onClick={stopAnimation}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                        "text-white shadow-md hover:shadow-lg"
                      )}
                    >
                      Stop
                    </button>
                  )}
                  
                  <button
                    onClick={reset}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      "bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800",
                      "text-white shadow-md hover:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    )}
                    disabled={isAnimating}
                  >
                    Reset
                  </button>
                  
                  {(p <= 0 || p > 1) && (
                    <div className="text-xs text-red-400 text-center">
                      p must be between 0 and 1
                    </div>
                  )}
                </div>
              </ControlGroup>
            </VisualizationSection>
            
            <VisualizationSection>
              <h3 className="text-base font-semibold mb-3">Statistics</h3>
              <StatsDisplay
                stats={[
                  { 
                    label: "Expected trials", 
                    value: p > 0 ? formatNumber(expectedValue) : "∞",
                    highlight: true 
                  },
                  { 
                    label: "Variance", 
                    value: p > 0 && p < 1 ? formatNumber(variance) : p === 1 ? "0" : "∞"
                  },
                  { 
                    label: "Std. Dev", 
                    value: p > 0 && p < 1 ? formatNumber(stdDev) : p === 1 ? "0" : "∞"
                  },
                  { 
                    label: "Mode", 
                    value: "1" 
                  }
                ]}
              />
              {p > 0 && p <= 1 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs space-y-1">
                    <div className="text-gray-400">
                      Expected value formula: E[X] = 1/p
                    </div>
                    <div className="text-gray-400">
                      Variance formula: Var[X] = (1-p)/p²
                    </div>
                  </div>
                </div>
              )}
            </VisualizationSection>
          </div>
          
          {/* Right: Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trial Sequence Visualization */}
            <GraphContainer height="auto">
              <div className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                  <span>Trial Sequence</span>
                  {currentTrial > 0 && (
                    <span className="text-sm font-mono text-orange-400">
                      Trial {currentTrial}
                    </span>
                  )}
                </h3>
                
                {/* Progress bar showing current trial */}
                {currentTrial > 0 && (
                  <ProgressBar
                    current={currentTrial}
                    total={Math.max(currentTrial, Math.ceil(expectedValue * 2))}
                    label="Progress"
                    variant="orange"
                    className="mb-4"
                  />
                )}
                
                {/* Trial visualization - show only last 20 trials to prevent memory issues */}
                <div className="min-h-[120px] bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  {trialHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Click "Run Until Success" to start the animation
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {trialHistory.slice(-20).map((trial, index) => {
                        const isLast = index === trialHistory.slice(-20).length - 1;
                        return (
                          <div
                            key={trial.trial}
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-300",
                              trial.success 
                                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                                : "bg-gradient-to-br from-red-500 to-red-600",
                              "text-white shadow-md",
                              isLast && "scale-110 shadow-xl"
                            )}
                            style={{
                              animation: isLast && isAnimating
                                ? 'fadeInScale 0.3s ease-out' 
                                : undefined,
                              filter: isLast ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : undefined
                            }}
                          >
                            {trial.success ? '✓' : '✗'}
                          </div>
                        );
                      })}
                      {trialHistory.length > 20 && (
                        <div className="flex items-center text-gray-500 text-sm">
                          +{trialHistory.length - 20} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Summary */}
                {trialHistory.length > 0 && !isAnimating && (
                  <div className="mt-4 text-sm text-center">
                    <span className="text-gray-400">
                      First success after 
                    </span>
                    <span className="font-mono text-orange-400 text-lg mx-2">
                      {trialHistory.length}
                    </span>
                    <span className="text-gray-400">
                      trial{trialHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </GraphContainer>
            
            {/* PMF Visualization */}
            <GraphContainer>
              <div className="p-2">
                <h3 className="text-base font-semibold mb-2">
                  Probability Mass Function
                </h3>
                <svg ref={pmfSvgRef} className="w-full" style={{ height: 300 }} />
              </div>
            </GraphContainer>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}