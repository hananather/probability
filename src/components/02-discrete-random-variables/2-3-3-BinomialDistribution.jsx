"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { cn } from '@/lib/design-system';
import { RangeSlider, SliderPresets } from '@/components/ui/RangeSlider';
import { 
  binomialPMF, 
  generateBinomialPMFData, 
  binomialStats, 
  validateBinomialParams,
  clearBinomialCache 
} from '@/utils/distributions';

// Import new shared components
import PMFBarChart from '@/components/shared/distributions/PMFBarChart';
import SingleRunControls from '@/components/shared/distributions/SingleRunControls';
import AnimatedOutcome from '@/components/shared/distributions/AnimatedOutcome';
import { distributionThemes, getThemeStyles } from '@/utils/distribution-theme';

// Get theme and styles for binomial distribution
const theme = distributionThemes.binomial;
const themeStyles = getThemeStyles('binomial');

// Trial History Component
const TrialHistory = ({ trials, n, theme, showRecent = 10 }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (trials.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 250;
    const margin = { top: 20, right: 60, bottom: 40, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Calculate success counts
    const successCounts = trials.map((trial, i) => ({
      trial: i + 1,
      successes: trial.filter(o => o).length
    }));
    
    // Show only recent trials if many
    const displayData = showRecent && trials.length > showRecent 
      ? successCounts.slice(-showRecent)
      : successCounts;
    
    // Scales
    const x = d3.scaleLinear()
      .domain([displayData[0]?.trial || 1, displayData[displayData.length - 1]?.trial || 1])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, n])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .call(grid => {
        grid.selectAll("path").remove();
        grid.selectAll("line")
          .style("stroke", "#374151")
          .style("stroke-dasharray", "2,2")
          .style("opacity", 0.3);
      });
    
    // Line
    const line = d3.line()
      .x(d => x(d.trial))
      .y(d => y(d.successes))
      .curve(d3.curveMonotoneX);
    
    // Add gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", 0).attr("y2", y(n));
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme.secondary)
      .attr("stop-opacity", 1);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme.primary)
      .attr("stop-opacity", 1);
    
    // Draw line
    g.append("path")
      .datum(displayData)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
    
    // Draw points
    g.selectAll(".point")
      .data(displayData)
      .enter().append("circle")
      .attr("class", "point")
      .attr("cx", d => x(d.trial))
      .attr("cy", d => y(d.successes))
      .attr("r", 4)
      .attr("fill", theme.primary)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.4))")
      .on("mouseenter", function(event, d) {
        // Tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip");
        
        const rect = tooltip.append("rect")
          .attr("x", x(d.trial) - 40)
          .attr("y", y(d.successes) - 30)
          .attr("width", 80)
          .attr("height", 25)
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("rx", 4);
        
        tooltip.append("text")
          .attr("x", x(d.trial))
          .attr("y", y(d.successes) - 12)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "12px")
          .text(`Trial ${d.trial}: ${d.successes}`);
      })
      .on("mouseleave", function() {
        g.select(".tooltip").remove();
      });
    
    // Expected value line
    const expectedValue = n * (trials[0]?.length ? trials.reduce((sum, trial) => 
      sum + trial.filter(o => o).length, 0) / trials.length / n : 0.5);
    
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(expectedValue * n))
      .attr("y2", y(expectedValue * n))
      .attr("stroke", theme.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d))
      .call(axis => {
        axis.selectAll("path, line").attr("stroke", "#6b7280");
        axis.selectAll("text").attr("fill", "#9ca3af");
      });
    
    g.append("g")
      .call(d3.axisLeft(y))
      .call(axis => {
        axis.selectAll("path, line").attr("stroke", "#6b7280");
        axis.selectAll("text").attr("fill", "#9ca3af");
      });
    
    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#9ca3af")
      .style("font-size", "12px")
      .text("Trial Number");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("fill", "#9ca3af")
      .style("font-size", "12px")
      .text("Number of Successes");
  }, [trials, n, theme, showRecent]);
  
  return <svg ref={svgRef} className="w-full" style={{ height: 250 }} />;
};

export default function BinomialDistribution() {
  // Parameters with validation
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  
  // Validate parameters
  const paramValidation = useMemo(() => {
    const isValid = validateBinomialParams(n, p);
    const errors = [];
    if (!Number.isInteger(n) || n <= 0) errors.push('n must be a positive integer');
    if (p < 0 || p > 1) errors.push('p must be between 0 and 1');
    return { valid: isValid, errors };
  }, [n, p]);
  
  // Trial results and animation state
  const [trials, setTrials] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [singleRunMode, setSingleRunMode] = useState(false);
  const [currentTrial, setCurrentTrial] = useState([]);
  const [currentFlipIndex, setCurrentFlipIndex] = useState(-1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [multipleRunCount, setMultipleRunCount] = useState(100);
  
  // Refs
  const contentRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });
  const containerRef = useRef(null);
  
  // Memoized statistics calculations
  const stats = useMemo(() => {
    const baseStats = binomialStats(n, p);
    return {
      mean: baseStats.mean,
      expectedValue: baseStats.mean,
      variance: baseStats.variance,
      stdDev: Math.sqrt(baseStats.variance)
    };
  }, [n, p]);
  
  // Memoized PMF data generation
  const pmfData = useMemo(() => {
    const data = generateBinomialPMFData(n, p);
    return data.map(d => ({
      x: d.x,
      y: d.y,
      cumulative: d.cumulative
    }));
  }, [n, p]);
  
  // Observed statistics
  const observedStats = useMemo(() => {
    if (trials.length === 0) return null;
    
    const successCounts = trials.map(trial => trial.filter(o => o).length);
    const mean = successCounts.reduce((a, b) => a + b, 0) / trials.length;
    const variance = successCounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / trials.length;
    
    return {
      mean,
      variance,
      stdDev: Math.sqrt(variance)
    };
  }, [trials]);
  
  // Memoized success counts
  const successCounts = useMemo(() => {
    return trials.reduce((acc, trial) => {
      const successes = trial.filter(outcome => outcome).length;
      acc[successes] = (acc[successes] || 0) + 1;
      return acc;
    }, {});
  }, [trials]);
  
  // Process MathJax
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
  }, [n, p]);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Standard chart sizing for consistency with other components
        setDimensions({
          width: Math.min(width - 48, 800), // Max 800px width
          height: 400 // Fixed height like LinearTransformations
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      clearBinomialCache();
    };
  }, []);
  
  // Highlight data for current trial
  const highlightData = useMemo(() => {
    if (currentTrial.length === 0) return {};
    const successes = currentTrial.filter(o => o).length;
    return { [successes]: theme.success };
  }, [currentTrial]);
  
  // Run single trial with animation
  const runSingleTrial = useCallback(() => {
    if (isRunning || !paramValidation.valid) return;
    setIsRunning(true);
    setCurrentTrial([]);
    setCurrentFlipIndex(0);
    setIsFlipping(true);
    
    const trial = [];
    let flipIndex = 0;
    
    const animateFlip = () => {
      if (flipIndex >= n) {
        // Trial complete
        setTrials(prev => [...prev, trial]);
        setIsRunning(false);
        setCurrentFlipIndex(-1);
        setIsFlipping(false);
        // Keep current trial displayed for visual feedback
        setTimeout(() => setCurrentTrial([]), 2000);
        return;
      }
      
      // Animate current flip
      setIsFlipping(true);
      
      setTimeout(() => {
        const outcome = Math.random() < p;
        trial.push(outcome);
        setCurrentTrial([...trial]);
        setIsFlipping(false);
        setCurrentFlipIndex(flipIndex + 1);
        
        flipIndex++;
        animationTimeoutRef.current = setTimeout(animateFlip, 500);
      }, 300);
    };
    
    animateFlip();
  }, [n, p, isRunning, paramValidation.valid]);
  
  // Run multiple trials
  const runMultipleTrials = useCallback(() => {
    if (isRunning || !paramValidation.valid) return;
    setIsRunning(true);
    setCurrentTrial([]);
    
    // Generate all trials
    const newTrials = [];
    for (let i = 0; i < multipleRunCount; i++) {
      const trial = [];
      for (let j = 0; j < n; j++) {
        trial.push(Math.random() < p);
      }
      newTrials.push(trial);
    }
    
    // Add with animation
    let index = 0;
    const addBatch = () => {
      const batchSize = Math.min(10, multipleRunCount - index);
      if (batchSize === 0) {
        setIsRunning(false);
        return;
      }
      
      setTrials(prev => [...prev, ...newTrials.slice(index, index + batchSize)]);
      index += batchSize;
      
      if (index < multipleRunCount) {
        animationTimeoutRef.current = setTimeout(addBatch, 100);
      } else {
        setIsRunning(false);
      }
    };
    
    addBatch();
  }, [n, p, multipleRunCount, isRunning, paramValidation.valid]);
  
  // Reset function
  const handleReset = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setTrials([]);
    setIsRunning(false);
    setCurrentTrial([]);
    setCurrentFlipIndex(-1);
    setIsFlipping(false);
  }, []);
  
  // Current flip outcome display
  const FlipDisplay = () => {
    if (!singleRunMode || currentFlipIndex < 0) return null;
    
    return (
      <div className="mt-3 p-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
        <h4 className="text-sm font-semibold text-teal-400 mb-2">Current Trial Progress</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {[...Array(n)].map((_, i) => {
            const outcome = currentTrial[i];
            const isCurrent = i === currentFlipIndex;
            const hasOutcome = i < currentTrial.length;
            
            return (
              <div key={i} className="relative">
                {isCurrent && isFlipping && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatedOutcome
                      type="coin"
                      outcome={outcome}
                      isAnimating={true}
                      theme={theme}
                      size="small"
                    />
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  "border-2 transition-all duration-300",
                  hasOutcome && !isCurrent ? (
                    outcome ? "bg-teal-500/20 border-teal-500" : "bg-neutral-600/20 border-neutral-600"
                  ) : (
                    isCurrent ? "border-teal-400 animate-pulse" : "border-neutral-600"
                  )
                )}>
                  {hasOutcome && !isCurrent && (
                    <span className={cn(
                      "text-lg font-bold",
                      outcome ? "text-teal-400" : "text-neutral-400"
                    )}>
                      {outcome ? "H" : "T"}
                    </span>
                  )}
                  {!hasOutcome && !isCurrent && (
                    <span className="text-neutral-500 text-sm">{i + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {currentTrial.length > 0 && (
          <div className="text-sm text-neutral-400">
            Successes so far: <span className="font-mono text-teal-400">
              {currentTrial.filter(o => o).length}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Binomial Distribution Explorer</h3>
        <p className="text-sm text-neutral-400 mt-1">
          Models the number of successes in <span className="font-semibold text-teal-400">n</span> independent trials, 
          each with success probability <span className="font-semibold text-teal-400">p</span>
        </p>
      </div>
      
      {/* Controls Section - Compact */}
      <div className="px-6 py-4 border-b border-neutral-700 bg-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Parameters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-neutral-300">Parameters</h4>
              <div className="text-xs bg-neutral-900 px-3 py-1 rounded border border-neutral-700">
                <span className="text-neutral-400">Formula: </span>
                <span className="text-teal-400" dangerouslySetInnerHTML={{ 
                  __html: `\\(P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}\\)` 
                }} />
              </div>
            </div>
            
            {!paramValidation.valid && (
              <div className="mb-3 p-2 bg-red-900/20 border border-red-500/50 rounded text-xs text-red-400">
                {paramValidation.errors.join(', ')}
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-neutral-300 mb-2">
                  <span>Number of Trials (n)</span>
                  <span className="font-mono text-teal-400">{n}</span>
                </label>
                <RangeSlider
                  value={n}
                  onChange={(value) => setN(Math.round(value))}
                  min={1}
                  max={50}
                  step={1}
                  formatValue={v => v}
                />
              </div>
              
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-neutral-300 mb-2">
                  <span>Success Probability (p)</span>
                  <span className="font-mono text-teal-400">{p.toFixed(2)}</span>
                </label>
                <RangeSlider
                  value={p}
                  onChange={setP}
                  {...SliderPresets.probability}
                />
              </div>
            </div>
          </div>
          
          {/* Right: Simulation Controls */}
          <div>
            <h4 className="text-sm font-medium text-neutral-300 mb-3">Simulation Controls</h4>
            <SingleRunControls
              singleRunMode={singleRunMode}
              onToggleSingleRun={setSingleRunMode}
              onRunSingle={runSingleTrial}
              onRunMultiple={runMultipleTrials}
              onReset={handleReset}
              isRunning={isRunning}
              runCount={trials.length}
              multipleRunCount={multipleRunCount}
              onMultipleRunCountChange={setMultipleRunCount}
              theme={theme}
              singleRunLabel="Flip Coins"
              multipleRunLabel={`Run ${multipleRunCount} Trials`}
            />
          </div>
        </div>
      </div>
      
      {/* Visualization Section */}
      <div ref={contentRef} className="p-6">
        {/* PMF Chart - Centerpiece */}
        <div ref={containerRef} className="mb-4">
          <PMFBarChart
            data={pmfData}
            dimensions={dimensions}
            theme={theme}
            labels={{ x: 'Number of Successes (k)', y: 'Probability' }}
            showGrid={true}
            animate={true}
            highlights={highlightData}
            showValues={pmfData.length <= 20}
          />
        </div>
        
        {/* Compact Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Expected Value */}
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
            <div className="text-xs text-neutral-400 mb-1">Expected Value</div>
            <div className="text-lg font-mono text-teal-400">{stats.mean.toFixed(2)}</div>
            {observedStats && (
              <div className="text-xs text-neutral-500 mt-1">
                Observed: {observedStats.mean.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Variance */}
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
            <div className="text-xs text-neutral-400 mb-1">Variance</div>
            <div className="text-lg font-mono text-teal-400">{stats.variance.toFixed(2)}</div>
            {observedStats && (
              <div className="text-xs text-neutral-500 mt-1">
                Observed: {observedStats.variance.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Standard Deviation */}
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
            <div className="text-xs text-neutral-400 mb-1">Std Deviation</div>
            <div className="text-lg font-mono text-teal-400">{stats.stdDev.toFixed(2)}</div>
            {observedStats && (
              <div className="text-xs text-neutral-500 mt-1">
                Observed: {observedStats.stdDev.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Current Parameters */}
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
            <div className="text-xs text-neutral-400 mb-1">Current Parameters</div>
            <div className="text-sm">
              <span className="text-neutral-300">n = </span>
              <span className="font-mono text-teal-400">{n}</span>
              <span className="text-neutral-300">, p = </span>
              <span className="font-mono text-teal-400">{p.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Current Trial Display */}
        <FlipDisplay />
        
        {/* Trial Results Section */}
        {trials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trial History */}
            <div className="bg-neutral-900 rounded-lg p-4">
              <h4 className="text-base font-semibold text-white mb-3">Trial History</h4>
              <TrialHistory 
                trials={trials} 
                n={n}
                theme={theme}
                showRecent={10}
              />
            </div>
            
            {/* Success Counts */}
            <div className="bg-neutral-900 rounded-lg p-4">
              <h4 className="text-base font-semibold text-white mb-3">Success Count Distribution</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Object.entries(successCounts)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([k, count]) => (
                  <div key={k} className="flex justify-between bg-neutral-800/50 rounded px-3 py-2">
                    <span className="text-neutral-400">k={k}:</span>
                    <span className="font-mono text-teal-300">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}