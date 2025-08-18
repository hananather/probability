"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { RangeSlider, SliderPresets } from '@/components/ui/RangeSlider';
import * as d3 from "@/utils/d3-utils";
import { cn } from '@/lib/design-system';

// Import existing binomial utilities
import { 
  binomialPMF, 
  generateBinomialPMFData, 
  binomialStats, 
  validateBinomialParams,
  clearBinomialCache 
} from '@/utils/distributions';

// Import shared components
import PMFBarChart from '@/components/shared/distributions/PMFBarChart';
import SingleRunControls from '@/components/shared/distributions/SingleRunControls';
import AnimatedOutcome from '@/components/shared/distributions/AnimatedOutcome';
import { distributionThemes, getThemeStyles } from '@/utils/distribution-theme';
import { Chapter2ReferenceSheet } from '../reference-sheets/Chapter2ReferenceSheet';

// Get consistent color scheme for binomial
const colors = createColorScheme('binomial');
const theme = distributionThemes.binomial;
const themeStyles = getThemeStyles('binomial');

// Key Concepts Card with LaTeX (using LinearRegressionHub scaffolding)
const BinomialConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "PMF Formula", definition: "Probability mass function", latex: "P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}" },
    { term: "Expected Value", definition: "Average number of successes", latex: "E[X] = np" },
    { term: "Variance", definition: "Measure of spread", latex: "\\text{Var}(X) = np(1-p)" },
    { term: "Standard Deviation", definition: "Square root of variance", latex: "\\sigma = \\sqrt{np(1-p)}" },
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
      <h3 className="text-xl font-bold text-white mb-4">Binomial Distribution Concepts</h3>
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
              <div className="text-lg font-mono text-teal-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Trial History Component (preserved from original)
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
    
    // Draw line
    g.append("path")
      .datum(displayData)
      .attr("fill", "none")
      .attr("stroke", theme.primary)
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
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d))
      .call(axis => {
        axis.selectAll("path, line").attr("stroke", "#6b7280");
        axis.selectAll("text").attr("fill", "#f3f4f6");
      });
    
    g.append("g")
      .call(d3.axisLeft(y))
      .call(axis => {
        axis.selectAll("path, line").attr("stroke", "#6b7280");
        axis.selectAll("text").attr("fill", "#f3f4f6");
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

// Main Binomial Distribution Component (using LinearRegressionHub scaffolding)
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
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.min(width - 48, 800),
          height: 400
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
        setTrials(prev => [...prev, trial]);
        setIsRunning(false);
        setCurrentFlipIndex(-1);
        setIsFlipping(false);
        setTimeout(() => setCurrentTrial([]), 2000);
        return;
      }
      
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
    
    const newTrials = [];
    for (let i = 0; i < multipleRunCount; i++) {
      const trial = [];
      for (let j = 0; j < n; j++) {
        trial.push(Math.random() < p);
      }
      newTrials.push(trial);
    }
    
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

  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Binomial Distribution Explorer
          </h1>
          <p className="text-xl text-gray-400">
            Model the number of successes in n independent trials
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <BinomialConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is the Binomial Distribution?</h2>
          <p className="text-gray-300">
            The binomial distribution models the number of successes in a fixed number of independent trials, 
            each with the same probability of success. From coin flips to quality control, 
            it's one of the most fundamental probability distributions in statistics.
          </p>
        </Card>

        {/* Interactive Component */}
        <Card ref={containerRef} className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
          {/* Controls Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Parameters */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Parameters</h4>
              
              {!paramValidation.valid && (
                <div className="mb-3 p-2 bg-red-900/20 border border-red-500/50 rounded text-xs text-red-400">
                  {paramValidation.errors.join(', ')}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
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
                  <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
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
              <h4 className="text-lg font-semibold text-white mb-4">Simulation Controls</h4>
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
          
          {/* PMF Chart */}
          <div className="mb-6">
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
          
          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Expected Value</div>
              <div className="text-xl font-mono text-teal-400">{stats.mean.toFixed(2)}</div>
              {observedStats && (
                <div className="text-xs text-gray-500 mt-1">
                  Observed: {observedStats.mean.toFixed(2)}
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Variance</div>
              <div className="text-xl font-mono text-teal-400">{stats.variance.toFixed(2)}</div>
              {observedStats && (
                <div className="text-xs text-gray-500 mt-1">
                  Observed: {observedStats.variance.toFixed(2)}
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Std Deviation</div>
              <div className="text-xl font-mono text-teal-400">{stats.stdDev.toFixed(2)}</div>
              {observedStats && (
                <div className="text-xs text-gray-500 mt-1">
                  Observed: {observedStats.stdDev.toFixed(2)}
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Parameters</div>
              <div className="text-sm">
                <span className="text-gray-300">n = </span>
                <span className="font-mono text-teal-400">{n}</span>
                <span className="text-gray-300">, p = </span>
                <span className="font-mono text-teal-400">{p.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Trial Results */}
          {trials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trial History */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-3">Trial History</h4>
                <TrialHistory 
                  trials={trials} 
                  n={n}
                  theme={theme}
                  showRecent={10}
                />
              </div>
              
              {/* Success Counts */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-3">Success Count Distribution</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(successCounts)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([k, count]) => (
                    <div key={k} className="flex justify-between bg-gray-900/50 rounded px-3 py-2">
                      <span className="text-gray-400">k={k}:</span>
                      <span className="font-mono text-teal-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}