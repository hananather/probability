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
import { Play, Pause, RotateCcw } from 'lucide-react';
import { colors, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Enhanced color scheme for negative binomial distribution
const colorScheme = createColorScheme('estimation');
const nbColors = {
  ...colorScheme,
  primary: '#8b5cf6', // violet-600
  primaryLight: '#a78bfa', // violet-400
  primaryDark: '#7c3aed', // violet-700
  secondary: '#ec4899', // pink-500
  accent: '#f97316', // orange-500
  success: '#10b981', // emerald-500
  failure: '#6b7280', // gray-500
  milestone: '#fbbf24', // amber-400
  gradients: {
    primary: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    milestone: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  }
};

// Helper function - binomial coefficient with overflow protection
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  
  // Use logarithms to prevent overflow
  let logResult = 0;
  for (let i = 0; i < r; i++) {
    logResult += Math.log(n - i) - Math.log(i + 1);
  }
  
  return Math.exp(logResult);
}

// Negative binomial PMF with overflow protection
function negativeBinomialPMF(k, r, p) {
  if (k < r || p <= 0 || p >= 1 || r <= 0) return 0;
  
  // Use logarithms to prevent overflow
  const logBinom = Math.log(nCr(k - 1, r - 1));
  const logProb = r * Math.log(p) + (k - r) * Math.log(1 - p);
  
  return Math.exp(logBinom + logProb);
}

// Key Concepts Card with LaTeX (using LinearRegressionHub scaffolding)
const NegativeBinomialConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "PMF Formula", definition: "Probability mass function", latex: "P(X = k) = \\binom{k-1}{r-1} p^r (1-p)^{k-r}" },
    { term: "Expected Value", definition: "Average number of trials", latex: "E[X] = \\frac{r}{p}" },
    { term: "Variance", definition: "Measure of spread", latex: "\\text{Var}(X) = \\frac{r(1-p)}{p^2}" },
    { term: "Standard Deviation", definition: "Square root of variance", latex: "\\sigma = \\sqrt{\\frac{r(1-p)}{p^2}}" },
  ];

  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Negative Binomial Distribution Concepts</h3>
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
              <div className="text-lg font-mono text-violet-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

export default function NegativeBinomialDistribution() {
  // State
  const [r, setR] = useState(3);
  const [p, setP] = useState(0.3);
  const [animationSpeed] = useState(300); // ms per trial
  
  // Animation state - single object
  const [animation, setAnimation] = useState({
    isRunning: false,
    currentTrial: 0,
    successes: 0,
    failures: 0,
    history: []
  });
  
  // Simulation history
  const [simulations, setSimulations] = useState([]);
  
  // Refs
  const pmfSvgRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Derived values
  const isGeometric = r === 1;
  const validP = Math.max(0.001, Math.min(0.999, p));
  const expectedValue = r / validP;
  const variance = (r * (1 - validP)) / (validP * validP);
  const stdDev = Math.sqrt(variance);
  // Mode for number of trials to r-th success: floor((r-1)(1-p)/p) + r
  const modeTrials = Math.floor(((r - 1) * (1 - validP)) / validP) + r;
  
  // Calculate PMF values
  const calculatePMF = useCallback(() => {
    const pmfData = [];
    let cumulative = 0;
    const maxK = Math.min(100, Math.max(30, Math.ceil(expectedValue * 3)));
    
    for (let k = r; k <= maxK && cumulative < 0.999; k++) {
      const prob = negativeBinomialPMF(k, r, validP);
      if (prob > 0.0001) {
        pmfData.push({ k, prob });
        cumulative += prob;
      }
    }
    
    return pmfData;
  }, [r, validP, expectedValue]);

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
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(pmfData.map(d => d.k))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(0.3, d3.max(pmfData, d => d.prob) * 1.1)])
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
    
    // Bars
    const bars = svg.selectAll("rect.pmf-bar")
      .data(pmfData)
      .join("rect")
      .attr("class", "pmf-bar")
      .attr("x", d => xScale(d.k))
      .attr("y", d => yScale(d.prob))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(0) - yScale(d.prob))
      .attr("fill", d => d.k === r ? nbColors.secondary : nbColors.primary)
      .attr("opacity", 0.85)
      .attr("rx", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
      .style("transition", "all 300ms ease-in-out");
    
    // Enhanced hover effects with tooltips
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
          .attr("fill", "#f3f4f6")
          .attr("stroke", d.k === r ? nbColors.secondary : nbColors.primary)
          .attr("stroke-width", 1);
        
        const text = tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("fill", "#1f2937")
          .style("font-size", "12px");
        
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", 0)
          .text(`${d.k} trials: ${(d.prob * 100).toFixed(2)}%`);
        
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
          .attr("opacity", 0.85)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        svg.selectAll(".tooltip").remove();
      });
    
    // Expected value line
    const maxK = Math.min(100, Math.max(30, Math.ceil(expectedValue * 3)));
    if (expectedValue < maxK) {
      svg.append("line")
        .attr("x1", margin.left + (width - margin.left - margin.right) * (expectedValue - r) / (maxK - r))
        .attr("x2", margin.left + (width - margin.left - margin.right) * (expectedValue - r) / (maxK - r))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", colorScheme.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.7);
      
      svg.append("text")
        .attr("x", margin.left + (width - margin.left - margin.right) * (expectedValue - r) / (maxK - r))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.accent)
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(`E[X] = ${expectedValue.toFixed(1)}`);
    }
    
  }, [r, validP]);
  
  // Run animation using requestAnimationFrame
  const runAnimation = useCallback(() => {
    if (animation.isRunning) return;
    
    // Reset animation state
    setAnimation({
      isRunning: true,
      currentTrial: 0,
      successes: 0,
      failures: 0,
      history: []
    });
    
    const animate = () => {
      setAnimation(prev => {
        // Generate random outcome for this trial
        const success = Math.random() < validP;
        const newTrial = prev.currentTrial + 1;
        const newSuccesses = prev.successes + (success ? 1 : 0);
        const newFailures = prev.failures + (success ? 0 : 1);
        
        // Check if we've reached the target after this trial
        if (newSuccesses >= r) {
          // Completed - record the results with the correct trial count
          setSimulations(sims => [...sims.slice(-9), {
            totalTrials: newTrial,
            successes: newSuccesses,
            failures: newFailures
          }]);
          return {
            ...prev,
            currentTrial: newTrial,
            successes: newSuccesses,
            failures: newFailures,
            history: [...prev.history, { trial: newTrial, success }],
            isRunning: false
          };
        }
        
        // Continue animation for next trial
        timeoutRef.current = setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(animate);
        }, animationSpeed);
        
        return {
          ...prev,
          currentTrial: newTrial,
          successes: newSuccesses,
          failures: newFailures,
          history: [...prev.history, { trial: newTrial, success }]
        };
      });
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [r, validP, animationSpeed]);
  
  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAnimation(prev => ({ ...prev, isRunning: false }));
  }, []);
  
  // Reset
  const reset = useCallback(() => {
    stopAnimation();
    setAnimation({
      isRunning: false,
      currentTrial: 0,
      successes: 0,
      failures: 0,
      history: []
    });
    setSimulations([]);
  }, [stopAnimation]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Calculate milestone positions for progress bar
  const getMilestonePositions = () => {
    const positions = [];
    for (let i = 1; i <= r; i++) {
      positions.push({
        position: (i / r) * 100,
        label: i
      });
    }
    return positions;
  };
  
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
            Negative Binomial Distribution Explorer
          </h1>
          <p className="text-xl text-gray-400">
            Model the number of trials needed to get r successes
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <NegativeBinomialConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is the Negative Binomial Distribution?</h2>
          <p className="text-gray-300">
            The negative binomial distribution models the number of trials needed to achieve a fixed number of successes. 
            It generalizes the geometric distribution from "waiting for 1 success" to "waiting for r successes". 
            From quality control to medical trials, it's crucial for modeling repeated success scenarios.
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
                  label="Number of successes (r)"
                  value={r}
                  onChange={setR}
                  min={1}
                  max={10}
                  step={1}
                  formatValue={v => v}
                  className="mb-4"
                />
                <RangeSlider
                  label="Success probability (p)"
                  value={p}
                  onChange={setP}
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  formatValue={v => `${(v * 100).toFixed(0)}%`}
                  className="mb-4"
                />
                {isGeometric && (
                  <div className="text-xs text-purple-400 bg-purple-900/20 p-2 rounded">
                    When r=1, this becomes the Geometric distribution
                  </div>
                )}
                <div className="space-y-3 mt-4">
                  <button
                    onClick={animation.isRunning ? stopAnimation : runAnimation}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform flex items-center justify-center",
                      "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
                      "text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    )}
                  >
                    {animation.isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Until {r} Success{r > 1 ? 'es' : ''}
                      </>
                    )}
                  </button>
                  <button
                    onClick={reset}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center",
                      "bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800",
                      "text-white shadow-md hover:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    )}
                    disabled={animation.isRunning}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </button>
                </div>
              </ControlGroup>
            </VisualizationSection>
            
            <VisualizationSection>
              <h3 className="text-base font-semibold mb-3">Statistics</h3>
              <StatsDisplay
                stats={[
                  { 
                    label: "Expected trials", 
                    value: formatNumber(expectedValue),
                    highlight: true 
                  },
                  { 
                    label: "Variance", 
                    value: formatNumber(variance)
                  },
                  { 
                    label: "Std. Dev", 
                    value: formatNumber(stdDev)
                  },
                  { 
                    label: "Mode", 
                    value: modeTrials.toString()
                  }
                ]}
              />
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">
                    Expected value formula: E[X] = r/p
                  </div>
                  <div className="text-gray-400">
                    Variance formula: Var[X] = r(1-p)/p²
                  </div>
                </div>
              </div>
            </VisualizationSection>
            
            {/* Recent Simulations */}
            {simulations.length > 0 && (
              <VisualizationSection>
                <h3 className="text-base font-semibold mb-3">Recent Results</h3>
                <div className="space-y-1">
                  {simulations.slice(-5).map((sim, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">Run {i + 1}:</span>
                      <span className="font-mono text-white">
                        {sim.totalTrials} trials
                      </span>
                    </div>
                  ))}
                  {simulations.length >= 2 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Average:</span>
                        <span className="font-mono text-orange-400">
                          {(simulations.slice(-5).reduce((sum, s) => sum + s.totalTrials, 0) / Math.min(5, simulations.length)).toFixed(1)} trials
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </VisualizationSection>
            )}
          </div>
          
          {/* Right: Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Visualization */}
            <GraphContainer height="auto">
              <div className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                  <span>Progress to {r} Success{r > 1 ? 'es' : ''}</span>
                  {animation.currentTrial > 0 && (
                    <span className="text-sm font-mono text-orange-400">
                      Trial {animation.currentTrial}: {animation.successes}/{r} successes
                    </span>
                  )}
                </h3>
                
                {/* Single cumulative progress bar with milestones */}
                <div className="relative">
                  <ProgressBar
                    current={animation.successes}
                    total={r}
                    label="Successes"
                    variant="purple"
                    className="mb-2"
                  />
                  
                  {/* Milestone markers */}
                  {r > 1 && (
                    <div className="relative h-4 -mt-2 mb-4">
                      {getMilestonePositions().map((milestone, i) => (
                        <div
                          key={i}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${milestone.position}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className={cn(
                            "w-1 h-4 rounded-full transition-all duration-300",
                            animation.successes >= milestone.label 
                              ? "bg-gradient-to-b from-amber-400 to-amber-500 shadow-glow" 
                              : "bg-gray-600"
                          )} />
                          <span className={cn(
                            "text-xs font-mono mt-1 font-bold transition-all duration-300",
                            animation.successes >= milestone.label 
                              ? "text-amber-400 scale-110" 
                              : "text-gray-500"
                          )}>
                            {milestone.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Trial progress */}
                {animation.currentTrial > 0 && (
                  <ProgressBar
                    current={animation.currentTrial}
                    total={Math.max(animation.currentTrial, Math.ceil(expectedValue * 1.5))}
                    label="Trials completed"
                    variant="orange"
                    className="mb-4"
                  />
                )}
                
                {/* Trial history visualization */}
                <div className="min-h-[80px] bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  {animation.history.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      Click "Run Until {r} Success{r > 1 ? 'es' : ''}" to start
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {animation.history.slice(-30).map((trial, index) => {
                        const isLast = index === animation.history.slice(-30).length - 1;
                        return (
                          <div
                            key={trial.trial}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300",
                              trial.success 
                                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                                : "bg-gradient-to-br from-red-400 to-red-500",
                              "text-white shadow-md",
                              isLast && animation.isRunning && "scale-110 shadow-xl animate-pulse"
                            )}
                            style={{
                              animation: isLast && animation.isRunning
                                ? 'bounceIn 0.5s ease-out' 
                                : undefined
                            }}
                          >
                            {trial.success ? '✓' : '✗'}
                          </div>
                        );
                      })}
                      {animation.history.length > 30 && (
                        <div className="flex items-center text-gray-500 text-xs ml-2">
                          +{animation.history.length - 30} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Summary */}
                {animation.successes >= r && !animation.isRunning && (
                  <div className="mt-4 text-center">
                    <span className="text-gray-400">
                      Got {r} success{r > 1 ? 'es' : ''} in
                    </span>
                    <span className="font-mono text-orange-400 text-lg mx-2">
                      {animation.currentTrial}
                    </span>
                    <span className="text-gray-400">
                      trial{animation.currentTrial !== 1 ? 's' : ''}
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
