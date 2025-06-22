"use client";
import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { CheckCircle, Award, TrendingUp, Brain, Zap } from 'lucide-react';
import { tutorial_4_3_1 } from '@/tutorials/chapter4';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Milestone definitions
const MILESTONES = [
  { samples: 1, title: "First Sample", icon: "🎯", message: "You've taken your first sample!" },
  { samples: 10, title: "Pattern Seeker", icon: "🔍", message: "The distribution begins to emerge..." },
  { samples: 30, title: "Bell Curve Spotter", icon: "🔔", message: "The normal shape appears!" },
  { samples: 100, title: "CLT Master", icon: "🎓", message: "Central Limit Theorem demonstrated!" },
  { samples: 500, title: "Statistics Wizard", icon: "🧙", message: "You're a sampling expert!" }
];

// Learning challenges
const CHALLENGES = [
  {
    afterSamples: 30,
    question: "What shape is the distribution forming?",
    options: ["Uniform", "Normal (Bell)", "Exponential", "Bimodal"],
    correct: 1,
    explanation: "The Central Limit Theorem tells us sample means follow a normal distribution!"
  },
  {
    afterSamples: 100,
    question: "If you double the sample size, how does the standard error change?",
    options: ["Doubles", "Halves", "Decreases by √2", "Stays the same"],
    correct: 2,
    explanation: "SE = σ/√n, so doubling n decreases SE by a factor of √2"
  }
];

// Animated Sample Collection Component
const AnimatedSampleCollection = memo(function AnimatedSampleCollection({ 
  sampleSize, 
  isAnimating, 
  animationSpeed,
  onComplete 
}) {
  const [currentValues, setCurrentValues] = useState([]);
  const [showMean, setShowMean] = useState(false);
  const sampleMean = currentValues.length > 0 ? jStat.mean(currentValues) : 0;
  
  useEffect(() => {
    if (!isAnimating) {
      setCurrentValues([]);
      setShowMean(false);
      return;
    }
    
    const delays = {
      slow: 300,
      normal: 150,
      fast: 50
    };
    
    const delay = delays[animationSpeed] || delays.normal;
    
    // Animate collecting values
    const values = [];
    for (let i = 0; i < sampleSize; i++) {
      setTimeout(() => {
        const value = jStat.normal.sample(100, 15);
        values.push(value);
        setCurrentValues([...values]);
        
        if (i === sampleSize - 1) {
          setTimeout(() => {
            setShowMean(true);
            setTimeout(() => {
              onComplete(jStat.mean(values));
            }, 500);
          }, delay);
        }
      }, i * delay);
    }
  }, [isAnimating, sampleSize, animationSpeed, onComplete]);
  
  if (!isAnimating) return null;
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md">
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 backdrop-blur-sm border border-purple-600/30">
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {Array.from({ length: sampleSize }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                currentValues[i] !== undefined 
                  ? { scale: 1, opacity: 1 } 
                  : { scale: 0, opacity: 0 }
              }
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold">
                {currentValues[i] ? Math.round(currentValues[i]) : ''}
              </span>
            </motion.div>
          ))}
        </div>
        
        <AnimatePresence>
          {showMean && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center"
            >
              <div className="text-sm text-purple-300 mb-1">Sample Mean:</div>
              <div className="text-2xl font-bold text-cyan-400">
                x̄ = {formatNumber(sampleMean, 2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Interactive Formula Component
const InteractiveFormula = memo(function InteractiveFormula({ populationStd, sampleSize }) {
  const [revealed, setRevealed] = useState({ sigma: false, n: false });
  const se = populationStd / Math.sqrt(sampleSize);
  
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-purple-600/30">
      <h4 className="text-lg font-bold text-purple-400 mb-4">
        Build the Standard Error Formula
      </h4>
      
      <div className="flex items-center justify-center space-x-3 text-3xl">
        <span className="text-white">SE =</span>
        
        <motion.button
          onClick={() => setRevealed(prev => ({ ...prev, sigma: true }))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-4 py-2 rounded-lg transition-all",
            revealed.sigma 
              ? "bg-purple-600 text-white" 
              : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
          )}
        >
          {revealed.sigma ? populationStd : "σ"}
        </motion.button>
        
        <span className="text-white">/</span>
        
        <motion.button
          onClick={() => setRevealed(prev => ({ ...prev, n: true }))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-4 py-2 rounded-lg transition-all",
            revealed.n 
              ? "bg-blue-600 text-white" 
              : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
          )}
        >
          <span>√</span>
          <span className="border-t-2 border-current px-1">
            {revealed.n ? sampleSize : "n"}
          </span>
        </motion.button>
        
        <AnimatePresence>
          {revealed.sigma && revealed.n && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-white">=</span>
              <span className="text-3xl font-bold text-cyan-400">
                {formatNumber(se, 3)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 text-center text-sm">
        {!revealed.sigma && (
          <p className="text-neutral-400">Click σ to reveal the population standard deviation</p>
        )}
        {revealed.sigma && !revealed.n && (
          <p className="text-neutral-400">Click √n to reveal the sample size</p>
        )}
        {revealed.sigma && revealed.n && (
          <p className="text-green-400">
            ✨ Larger samples (n↑) = smaller standard error (SE↓)!
          </p>
        )}
      </div>
    </div>
  );
});

// Milestone Tracker Component
const MilestoneTracker = memo(function MilestoneTracker({ numSamples, unlockedMilestones }) {
  return (
    <div className="space-y-2">
      {MILESTONES.map((milestone, i) => {
        const unlocked = unlockedMilestones.has(milestone.samples);
        const current = numSamples >= MILESTONES[i - 1]?.samples && numSamples < milestone.samples;
        
        return (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all",
              unlocked ? "bg-green-900/30 border border-green-600/50" : 
              current ? "bg-blue-900/30 border border-blue-600/50 animate-pulse" :
              "bg-neutral-800/50 opacity-50"
            )}
          >
            <span className="text-2xl">{milestone.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{milestone.title}</div>
              <div className="text-xs text-neutral-400">
                {milestone.samples} sample{milestone.samples > 1 ? 's' : ''}
              </div>
            </div>
            {unlocked && <CheckCircle className="w-5 h-5 text-green-500" />}
          </motion.div>
        );
      })}
    </div>
  );
});

// Challenge Modal Component
const ChallengeModal = memo(function ChallengeModal({ challenge, onAnswer, onClose }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const handleSubmit = () => {
    setShowResult(true);
    setTimeout(() => {
      onAnswer(selected === challenge.correct);
      onClose();
    }, 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-900 rounded-lg p-6 max-w-md w-full border border-purple-600/30"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-purple-400 mb-4">
          🎯 Challenge Time!
        </h3>
        
        <p className="text-white mb-6">{challenge.question}</p>
        
        <div className="space-y-2 mb-6">
          {challenge.options.map((option, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={showResult}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all",
                selected === i 
                  ? showResult 
                    ? i === challenge.correct
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-purple-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              )}
            >
              {option}
            </button>
          ))}
        </div>
        
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-lg",
              selected === challenge.correct 
                ? "bg-green-900/30 border border-green-600/50"
                : "bg-red-900/30 border border-red-600/50"
            )}
          >
            <p className="text-sm">
              {selected === challenge.correct ? "✅ Correct! " : "❌ Not quite. "}
              {challenge.explanation}
            </p>
          </motion.div>
        )}
        
        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className={cn(
              "w-full py-2 rounded-lg font-medium transition-all",
              selected !== null
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
            )}
          >
            Submit Answer
          </button>
        )}
      </motion.div>
    </motion.div>
  );
});

// Main Component
function SamplingDistributionsImproved() {
  // Core state
  const [sampleSize, setSampleSize] = useState(5);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [populationMean] = useState(100);
  const [populationStd] = useState(15);
  
  // UI state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [showTheoretical, setShowTheoretical] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  
  // Progress tracking
  const [unlockedMilestones, setUnlockedMilestones] = useState(new Set());
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [totalInteractions, setTotalInteractions] = useState(0);
  
  // Refs for D3
  const svgRef = useRef(null);
  const svgInitialized = useRef(false);
  const histogramBarsRef = useRef({});
  const theoreticalPathRef = useRef(null);
  const meanLinesRef = useRef({});
  const animationRef = useRef(null);
  
  // Calculate statistics
  const samplingStats = useMemo(() => ({
    mean: sampleMeans.length > 0 ? jStat.mean(sampleMeans) : 0,
    std: sampleMeans.length > 1 ? jStat.stdev(sampleMeans, true) : 0,
    theoreticalMean: populationMean,
    theoreticalStd: populationStd / Math.sqrt(sampleSize)
  }), [sampleMeans, populationMean, populationStd, sampleSize]);
  
  // Initialize SVG structure once
  const initializeSVG = useCallback(() => {
    if (!svgRef.current || svgInitialized.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Create main group
    const g = svg.append("g")
      .attr("class", "main-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Title
    g.append("text")
      .attr("class", "title")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sampling Distribution of Sample Means");
    
    // Create containers for different elements
    g.append("g").attr("class", "grid-container");
    g.append("g").attr("class", "histogram-container");
    g.append("g").attr("class", "theoretical-container");
    g.append("g").attr("class", "axes-container");
    g.append("g").attr("class", "mean-lines-container");
    
    svgInitialized.current = true;
  }, []);
  
  // Update histogram with smooth animations
  const updateHistogram = useCallback(() => {
    if (!svgRef.current || !svgInitialized.current || sampleMeans.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select(".main-group");
    
    // Create scales
    const xExtent = d3.extent(sampleMeans);
    const xPadding = 10;
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(xExtent[0], populationMean - 3 * samplingStats.theoreticalStd) - xPadding,
        Math.max(xExtent[1], populationMean + 3 * samplingStats.theoreticalStd) + xPadding
      ])
      .range([0, innerWidth]);
    
    // Create histogram
    const numBins = Math.min(30, Math.max(10, Math.floor(Math.sqrt(sampleMeans.length))));
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(sampleMeans);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Update grid lines
    const gridContainer = g.select(".grid-container");
    gridContainer.selectAll(".grid-line").remove();
    
    gridContainer.selectAll(".grid-line")
      .data(yScale.ticks(5))
      .enter().append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .style("stroke", colors.chart.grid)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Update histogram bars with smooth transitions
    const histogramContainer = g.select(".histogram-container");
    
    const bars = histogramContainer.selectAll(".bar")
      .data(bins, d => d.x0);
    
    // Enter new bars
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0.7)
      .attr("rx", 2)
      .transition()
      .duration(300)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Update existing bars
    bars.transition()
      .duration(300)
      .attr("x", d => xScale(d.x0))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Remove old bars
    bars.exit()
      .transition()
      .duration(300)
      .attr("height", 0)
      .attr("y", innerHeight)
      .remove();
    
    // Update theoretical curve if enabled
    if (showTheoretical && sampleMeans.length > 5) {
      const theoreticalContainer = g.select(".theoretical-container");
      
      const xValues = d3.range(xScale.domain()[0], xScale.domain()[1], 
        (xScale.domain()[1] - xScale.domain()[0]) / 200);
      
      const normalData = xValues.map(x => ({
        x: x,
        y: jStat.normal.pdf(x, populationMean, samplingStats.theoreticalStd) * 
           sampleMeans.length * (bins[0] ? bins[0].x1 - bins[0].x0 : 1)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      let path = theoreticalContainer.select(".theoretical-curve");
      
      if (path.empty()) {
        path = theoreticalContainer.append("path")
          .attr("class", "theoretical-curve")
          .attr("fill", "none")
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0);
      }
      
      path.datum(normalData)
        .transition()
        .duration(500)
        .attr("d", line)
        .attr("opacity", 0.8);
    } else {
      g.select(".theoretical-curve")
        .transition()
        .duration(300)
        .attr("opacity", 0);
    }
    
    // Update mean lines
    const meanLinesContainer = g.select(".mean-lines-container");
    meanLinesContainer.selectAll("*").remove();
    
    // Population mean line
    meanLinesContainer.append("line")
      .attr("x1", xScale(populationMean))
      .attr("x2", xScale(populationMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .attr("opacity", 1);
    
    meanLinesContainer.append("text")
      .attr("x", xScale(populationMean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.tertiary)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`μ = ${populationMean}`)
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .attr("opacity", 1);
    
    // Sample mean of means
    if (sampleMeans.length > 0) {
      meanLinesContainer.append("line")
        .attr("x1", xScale(samplingStats.mean))
        .attr("x2", xScale(samplingStats.mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1);
      
      meanLinesContainer.append("text")
        .attr("x", xScale(samplingStats.mean))
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`x̄̄ = ${samplingStats.mean.toFixed(2)}`)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1);
    }
    
    // Update axes
    const axesContainer = g.select(".axes-container");
    axesContainer.selectAll("*").remove();
    
    // X axis
    const xAxis = axesContainer.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = axesContainer.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    axesContainer.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sample Mean");
    
    axesContainer.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
  }, [sampleMeans, populationMean, samplingStats, showTheoretical]);
  
  // Handle sample completion
  const handleSampleComplete = useCallback((sampleMean) => {
    setSampleMeans(prev => [...prev, sampleMean]);
    setNumSamples(prev => prev + 1);
    setIsAnimating(false);
    
    // Check for milestone unlocks
    const newNumSamples = numSamples + 1;
    const milestone = MILESTONES.find(m => m.samples === newNumSamples);
    if (milestone && !unlockedMilestones.has(milestone.samples)) {
      setUnlockedMilestones(prev => new Set([...prev, milestone.samples]));
      // Could add a celebration animation here
    }
    
    // Check for challenges
    const challenge = CHALLENGES.find(
      c => c.afterSamples === newNumSamples && !completedChallenges.has(c.afterSamples)
    );
    if (challenge) {
      setCurrentChallenge(challenge);
    }
  }, [numSamples, unlockedMilestones, completedChallenges]);
  
  // Take single sample
  const takeSingleSample = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTotalInteractions(prev => prev + 1);
  }, [isAnimating]);
  
  // Take many samples
  const takeManySamples = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTotalInteractions(prev => prev + 1);
    
    const delays = {
      slow: 100,
      normal: 50,
      fast: 10
    };
    
    const delay = delays[animationSpeed] || delays.normal;
    const samplesToTake = 100;
    
    const addSample = (index) => {
      if (index >= samplesToTake) {
        setIsAnimating(false);
        return;
      }
      
      const sample = [];
      for (let i = 0; i < sampleSize; i++) {
        sample.push(jStat.normal.sample(populationMean, populationStd));
      }
      const sampleMean = jStat.mean(sample);
      
      setSampleMeans(prev => [...prev, sampleMean]);
      setNumSamples(prev => {
        const newNum = prev + 1;
        
        // Check milestones
        const milestone = MILESTONES.find(m => m.samples === newNum);
        if (milestone && !unlockedMilestones.has(milestone.samples)) {
          setUnlockedMilestones(prev => new Set([...prev, milestone.samples]));
        }
        
        // Check challenges
        const challenge = CHALLENGES.find(
          c => c.afterSamples === newNum && !completedChallenges.has(c.afterSamples)
        );
        if (challenge && index === samplesToTake - 1) {
          setTimeout(() => setCurrentChallenge(challenge), 1000);
        }
        
        return newNum;
      });
      
      animationRef.current = setTimeout(() => {
        addSample(index + 1);
      }, Math.max(delay, delay / Math.sqrt(index + 1)));
    };
    
    addSample(0);
  }, [isAnimating, sampleSize, populationMean, populationStd, animationSpeed, unlockedMilestones, completedChallenges]);
  
  // Reset
  const reset = () => {
    setSampleMeans([]);
    setNumSamples(0);
    setUnlockedMilestones(new Set());
    setCompletedChallenges(new Set());
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  };
  
  // Handle challenge answer
  const handleChallengeAnswer = (correct) => {
    if (currentChallenge) {
      setCompletedChallenges(prev => new Set([...prev, currentChallenge.afterSamples]));
    }
  };
  
  // Initialize SVG
  useEffect(() => {
    initializeSVG();
  }, [initializeSVG]);
  
  // Update histogram when data changes
  useEffect(() => {
    updateHistogram();
  }, [updateHistogram]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  return (
    <VisualizationContainer 
      title="4.3 Sampling Distributions - Enhanced"
      className="p-2"
      tutorialSteps={tutorial_4_3_1}
      tutorialKey="sampling-distributions-4-3-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Discover how sample means create a predictable pattern - the foundation of statistical inference!
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <motion.div 
                className="p-2 bg-blue-900/20 border border-blue-600/30 rounded"
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-semibold text-blue-400 mb-1">🎯 Your Mission</p>
                <p className="text-neutral-300">
                  Take samples to build the sampling distribution and unlock the Central Limit Theorem!
                </p>
              </motion.div>
            </div>
          </VisualizationSection>

          {/* Milestones */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-purple-400 mb-3">
              Learning Milestones
            </h4>
            <MilestoneTracker 
              numSamples={numSamples} 
              unlockedMilestones={unlockedMilestones} 
            />
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <ControlGroup>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize})
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={sampleSize}
                  onChange={(e) => {
                    setSampleSize(Number(e.target.value));
                    reset();
                  }}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>Small (5)</span>
                  <span>Large (50)</span>
                </div>
              </ControlGroup>
              
              {/* Animation speed */}
              <ControlGroup>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Animation Speed
                </label>
                <div className="flex gap-2">
                  {['slow', 'normal', 'fast'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setAnimationSpeed(speed)}
                      className={cn(
                        "flex-1 py-1 px-2 rounded text-xs font-medium transition-colors capitalize",
                        animationSpeed === speed
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                      )}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={takeSingleSample}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-all",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white hover:scale-105"
                  )}
                >
                  {isAnimating ? "Sampling..." : "Take Single Sample"}
                </button>
                
                <button
                  onClick={takeManySamples}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-all",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
                  )}
                >
                  <Zap className="inline w-4 h-4 mr-1" />
                  Take 100 Samples
                </button>
                
                <button
                  onClick={reset}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset
                </button>
              </div>
              
              {/* Options */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showTheoretical} 
                    onChange={e => setShowTheoretical(e.target.checked)}
                    disabled={numSamples < 10}
                    className="w-4 h-4"
                  />
                  <span className={cn(
                    "text-neutral-300",
                    numSamples < 10 && "opacity-50"
                  )}>
                    Show theoretical curve {numSamples < 10 && "(10+ samples)"}
                  </span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showFormula} 
                    onChange={e => setShowFormula(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show interactive formula</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Statistics</h4>
            
            <div className="space-y-3">
              {/* Population parameters */}
              <div className="bg-neutral-800 rounded p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Population</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">μ</span>
                    <span className="font-mono text-white">{populationMean}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">σ</span>
                    <span className="font-mono text-white">{populationStd}</span>
                  </div>
                </div>
              </div>
              
              {/* Sampling distribution stats */}
              {numSamples > 0 && (
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-400 mb-2">
                    Sampling Distribution
                  </h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Mean of x̄</span>
                      <span className="font-mono text-cyan-400">
                        {formatNumber(samplingStats.mean, 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">SE (observed)</span>
                      <span className="font-mono text-cyan-400">
                        {formatNumber(samplingStats.std, 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">SE (theory)</span>
                      <span className="font-mono text-yellow-400">
                        {formatNumber(samplingStats.theoreticalStd, 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">Samples</span>
                      <span className="font-mono text-white">{numSamples}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Progress to next milestone */}
              {numSamples > 0 && numSamples < 500 && (
                <div className="mt-3">
                  <ProgressBar 
                    current={numSamples} 
                    total={MILESTONES.find(m => m.samples > numSamples)?.samples || 500} 
                    label="Next Milestone"
                    variant="purple"
                  />
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="500px" className="relative">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
            
            {/* Empty state */}
            {numSamples === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg text-white mb-2">
                    Ready to explore sampling distributions?
                  </p>
                  <p className="text-sm text-neutral-400">
                    Click "Take Single Sample" to begin your journey!
                  </p>
                </div>
              </div>
            )}
            
            {/* Animated sample collection overlay */}
            <AnimatedSampleCollection
              sampleSize={sampleSize}
              isAnimating={isAnimating}
              animationSpeed={animationSpeed}
              onComplete={handleSampleComplete}
            />
          </GraphContainer>
          
          {/* Interactive Formula */}
          {showFormula && (
            <InteractiveFormula 
              populationStd={populationStd} 
              sampleSize={sampleSize}
            />
          )}
          
          {/* Real-world insights */}
          {numSamples >= 30 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-600/30"
            >
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h5 className="font-bold text-green-400">Real-World Application</h5>
                  <p className="text-sm text-neutral-300 mt-1">
                    {numSamples >= 100 
                      ? "Quality control engineers use this principle to ensure products meet standards by testing small samples!"
                      : "Political polls use sampling distributions to predict election outcomes from surveying just a few thousand people!"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Challenge Modal */}
      <AnimatePresence>
        {currentChallenge && (
          <ChallengeModal
            challenge={currentChallenge}
            onAnswer={handleChallengeAnswer}
            onClose={() => setCurrentChallenge(null)}
          />
        )}
      </AnimatePresence>
    </VisualizationContainer>
  );
}

export default SamplingDistributionsImproved;