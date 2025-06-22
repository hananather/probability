"use client";
import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { tutorial_4_3_1_enhanced } from '@/tutorials/chapter4';

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Milestones for progressive learning
const MILESTONES = [
  { samples: 1, message: "First sample collected!", icon: "🎯" },
  { samples: 10, message: "Pattern starting to emerge...", icon: "📊" },
  { samples: 30, message: "The bell shape appears!", icon: "🔔" },
  { samples: 100, message: "Central Limit Theorem in action!", icon: "✨" },
  { samples: 500, message: "Perfect normal distribution achieved!", icon: "🏆" }
];

// Interactive challenges
const CHALLENGES = [
  {
    id: "predict-se",
    trigger: 5,
    prompt: "Can you predict the Standard Error?",
    question: "If σ = 15 and n = 25, what's SE?",
    answer: 3,
    tolerance: 0.1
  },
  {
    id: "sample-size-effect", 
    trigger: 50,
    prompt: "How does sample size affect spread?",
    question: "Double the sample size. What happens to SE?",
    requiresAction: "change-n"
  }
];


// Milestone tracker component
const MilestoneTracker = memo(function MilestoneTracker({ numSamples }) {
  const currentMilestone = MILESTONES.filter(m => numSamples >= m.samples).pop();
  const nextMilestone = MILESTONES.find(m => numSamples < m.samples);
  
  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <h4 className="text-purple-400 font-semibold mb-3 text-sm">Learning Progress</h4>
      
      <div className="space-y-2">
        {MILESTONES.map((milestone, idx) => {
          const isCompleted = numSamples >= milestone.samples;
          const isCurrent = currentMilestone?.samples === milestone.samples;
          
          return (
            <div 
              key={milestone.samples}
              className={cn(
                "flex items-center gap-3 p-2 rounded transition-all",
                isCompleted && "bg-green-900/20",
                isCurrent && "ring-2 ring-green-500/50"
              )}
            >
              <span className={cn(
                "text-lg transition-all",
                isCompleted ? "scale-110" : "opacity-50 grayscale"
              )}>
                {milestone.icon}
              </span>
              <div className="flex-1">
                <p className={cn(
                  "text-xs font-medium",
                  isCompleted ? "text-green-400" : "text-neutral-500"
                )}>
                  {milestone.samples} sample{milestone.samples > 1 ? 's' : ''}
                </p>
                <p className={cn(
                  "text-xs",
                  isCompleted ? "text-neutral-300" : "text-neutral-600"
                )}>
                  {milestone.message}
                </p>
              </div>
              {isCompleted && (
                <span className="text-green-400">✓</span>
              )}
            </div>
          );
        })}
      </div>
      
      {nextMilestone && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <p className="text-xs text-neutral-400">
            Next: {nextMilestone.samples - numSamples} more sample{nextMilestone.samples - numSamples > 1 ? 's' : ''} to {nextMilestone.message.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
});

// Challenge component
const ChallengeBox = memo(function ChallengeBox({ 
  challenge, 
  onComplete,
  sampleSize,
  populationStd 
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    if (challenge.answer) {
      const answer = parseFloat(userAnswer);
      const correct = Math.abs(answer - challenge.answer) <= challenge.tolerance;
      setIsCorrect(correct);
      setShowFeedback(true);
      if (correct) {
        setTimeout(() => onComplete(challenge.id), 1500);
      }
    }
  };
  
  return (
    <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
      <h4 className="text-purple-400 font-semibold text-sm mb-2">
        💡 Challenge: {challenge.prompt}
      </h4>
      <p className="text-sm text-neutral-300 mb-3">{challenge.question}</p>
      
      {challenge.answer && (
        <div className="flex gap-2">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-neutral-800 border border-neutral-600 rounded text-sm"
            placeholder="Your answer..."
            step="0.1"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
          >
            Check
          </button>
        </div>
      )}
      
      {showFeedback && (
        <div className={cn(
          "mt-2 p-2 rounded text-xs",
          isCorrect ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
        )}>
          {isCorrect ? "Correct! Well done!" : `Not quite. The answer is ${challenge.answer}`}
        </div>
      )}
      
      {challenge.requiresAction && (
        <p className="text-xs text-yellow-400 mt-2">
          Action required: {challenge.requiresAction === 'change-n' ? 'Try changing the sample size' : challenge.requiresAction}
        </p>
      )}
    </div>
  );
});

// Interactive formula display
const InteractiveFormula = memo(function InteractiveFormula({ 
  sigma, 
  n, 
  se,
  showCalculation 
}) {
  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
      <div className="text-center">
        <p className="text-cyan-400 font-mono text-lg mb-2">
          SE = σ / √n
        </p>
        {showCalculation && (
          <div className="space-y-1">
            <p className="text-sm text-neutral-400">
              = {sigma} / √{n}
            </p>
            <p className="text-sm text-neutral-400">
              = {sigma} / {Math.sqrt(n).toFixed(2)}
            </p>
            <p className="text-sm font-semibold text-cyan-400">
              = {se.toFixed(3)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Main component
function SamplingDistributions() {
  // State management
  const [sampleSize, setSampleSize] = useState(10);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [populationMean] = useState(100);
  const [populationStd] = useState(15);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTheoretical, setShowTheoretical] = useState(false);
  const [currentSample, setCurrentSample] = useState([]);
  const [showFormula, setShowFormula] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  
  // Refs for D3 and animations
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const isInitialized = useRef(false);
  const histogramRef = useRef(null);
  const theoreticalCurveRef = useRef(null);
  const meanLinesRef = useRef(null);
  
  // Calculate statistics
  const standardError = populationStd / Math.sqrt(sampleSize);
  const samplingStats = useMemo(() => ({
    mean: sampleMeans.length > 0 ? jStat.mean(sampleMeans) : 0,
    std: sampleMeans.length > 1 ? jStat.stdev(sampleMeans, true) : 0,
    theoreticalMean: populationMean,
    theoreticalStd: standardError
  }), [sampleMeans, populationMean, standardError]);
  
  // Get current challenge
  const currentChallenge = useMemo(() => {
    return CHALLENGES.find(c => 
      numSamples >= c.trigger && !completedChallenges.has(c.id)
    );
  }, [numSamples, completedChallenges]);
  
  // Generate a sample from the population
  const generateSample = useCallback(() => {
    const sample = [];
    for (let i = 0; i < sampleSize; i++) {
      sample.push(jStat.normal.sample(populationMean, populationStd));
    }
    return sample;
  }, [sampleSize, populationMean, populationStd]);
  
  // Take single sample with animation
  const takeSingleSample = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const sample = generateSample();
    const sampleMean = jStat.mean(sample);
    
    setCurrentSample(sample);
    
    // Animate the sample collection
    setTimeout(() => {
      setSampleMeans(prev => [...prev, sampleMean]);
      setNumSamples(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }, 200);
  }, [generateSample, isAnimating]);
  
  // Take many samples with smooth animation
  const takeManySamples = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const samplesToTake = 100;
    let samplesAdded = 0;
    
    const addBatch = () => {
      const batchSize = Math.min(10, samplesToTake - samplesAdded);
      const newMeans = [];
      
      for (let i = 0; i < batchSize; i++) {
        const sample = generateSample();
        newMeans.push(jStat.mean(sample));
      }
      
      setSampleMeans(prev => [...prev, ...newMeans]);
      setNumSamples(prev => prev + batchSize);
      samplesAdded += batchSize;
      
      if (samplesAdded < samplesToTake) {
        const delay = animationSpeed === 'fast' ? 50 : animationSpeed === 'slow' ? 200 : 100;
        animationRef.current = setTimeout(addBatch, delay);
      } else {
        setIsAnimating(false);
      }
    };
    
    addBatch();
  }, [generateSample, isAnimating, animationSpeed]);
  
  // Reset everything
  const reset = useCallback(() => {
    setSampleMeans([]);
    setNumSamples(0);
    setCurrentSample([]);
    setCompletedChallenges(new Set());
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  }, []);
  
  // Initialize static SVG elements once
  useEffect(() => {
    if (!svgRef.current || isInitialized.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Main group
    const g = svg.append("g")
      .attr("class", "main-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create groups for different elements
    g.append("g").attr("class", "grid-group");
    g.append("g").attr("class", "histogram-group");
    g.append("g").attr("class", "curve-group");
    g.append("g").attr("class", "mean-lines-group");
    g.append("g").attr("class", "dots-group");
    g.append("g").attr("class", "axes-group");
    
    // Title
    g.append("text")
      .attr("class", "chart-title")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sampling Distribution of Sample Means");
    
    histogramRef.current = g.select(".histogram-group");
    theoreticalCurveRef.current = g.select(".curve-group");
    meanLinesRef.current = g.select(".mean-lines-group");
    
    isInitialized.current = true;
  }, []);
  
  // Update visualization when data changes
  useEffect(() => {
    if (!svgRef.current || !isInitialized.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.select(".main-group");
    
    // Clear dynamic elements
    g.select(".grid-group").selectAll("*").remove();
    g.select(".axes-group").selectAll("*").remove();
    
    if (sampleMeans.length === 0) {
      // Show instruction
      histogramRef.current.selectAll("*").remove();
      histogramRef.current.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.5)
        .text("Click 'Take Sample' to start building the sampling distribution");
      return;
    }
    
    // Create scales
    const xExtent = d3.extent(sampleMeans);
    const xPadding = 10;
    const xScale = d3.scaleLinear()
      .domain([
        Math.min(xExtent[0], populationMean - 3 * samplingStats.theoreticalStd) - xPadding,
        Math.max(xExtent[1], populationMean + 3 * samplingStats.theoreticalStd) + xPadding
      ])
      .range([0, innerWidth]);
    
    // Create histogram bins
    const numBins = Math.min(30, Math.max(10, Math.floor(Math.sqrt(sampleMeans.length))));
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(sampleMeans);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines
    const gridGroup = g.select(".grid-group");
    gridGroup.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Update histogram bars
    const bars = histogramRef.current.selectAll("rect.bar")
      .data(bins, d => d.x0);
    
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
      .merge(bars)
      .transition()
      .duration(300)
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", d => innerHeight - yScale(d.length));
    
    bars.exit()
      .transition()
      .duration(300)
      .attr("height", 0)
      .attr("y", innerHeight)
      .remove();
    
    // Update theoretical normal curve
    theoreticalCurveRef.current.selectAll("*").remove();
    if (showTheoretical && sampleMeans.length > 5) {
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
      
      theoreticalCurveRef.current.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 0.8);
    }
    
    // Update mean lines
    meanLinesRef.current.selectAll("*").remove();
    
    // Population mean line
    meanLinesRef.current.append("line")
      .attr("x1", xScale(populationMean))
      .attr("x2", xScale(populationMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    meanLinesRef.current.append("text")
      .attr("x", xScale(populationMean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.tertiary)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`μ = ${populationMean}`);
    
    // Sample mean of means
    if (sampleMeans.length > 0) {
      meanLinesRef.current.append("line")
        .attr("x1", xScale(samplingStats.mean))
        .attr("x2", xScale(samplingStats.mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2);
      
      meanLinesRef.current.append("text")
        .attr("x", xScale(samplingStats.mean))
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`x̄̄ = ${samplingStats.mean.toFixed(2)}`);
    }
    
    // Axes
    const axesGroup = g.select(".axes-group");
    
    // X axis
    const xAxis = axesGroup.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = axesGroup.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    axesGroup.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Sample Mean");
    
    axesGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
    // Add animated dots for latest samples
    if (isAnimating && sampleMeans.length > 0) {
      const dotsGroup = g.select(".dots-group");
      dotsGroup.selectAll("*").remove();
      
      // Animate dots flowing into histogram
      const latestSamples = sampleMeans.slice(-5);
      
      const dots = dotsGroup.selectAll("circle")
        .data(latestSamples)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d))
        .attr("cy", -20)
        .attr("r", 4)
        .attr("fill", colorScheme.chart.secondary)
        .attr("opacity", 0);
      
      dots.transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .attr("cy", innerHeight)
        .attr("opacity", 0.8)
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .remove();
    }
    
  }, [sampleMeans, populationMean, samplingStats, showTheoretical, isAnimating]);
  
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
      title="4.3 Sampling Distributions"
      className="p-2"
      tutorialSteps={tutorial_4_3_1_enhanced}
      tutorialKey="sampling-distributions-4-3-1"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Discover how sample means create a predictable pattern - the foundation of statistical inference!
            </p>
            
            <InteractiveFormula 
              sigma={populationStd}
              n={sampleSize}
              se={standardError}
              showCalculation={showFormula}
            />
            
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs text-cyan-400 hover:text-cyan-300 mt-2"
            >
              {showFormula ? 'Hide' : 'Show'} calculation
            </button>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <div data-tutorial="sample-size">
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
              </div>
              
              {/* Animation speed */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Animation Speed
                </label>
                <div className="flex gap-2">
                  {['slow', 'normal', 'fast'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setAnimationSpeed(speed)}
                      className={cn(
                        "flex-1 px-2 py-1 rounded text-xs capitalize",
                        animationSpeed === speed
                          ? "bg-cyan-600 text-white"
                          : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                      )}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={takeSingleSample}
                  disabled={isAnimating}
                  data-tutorial="take-sample"
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-all",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white transform hover:scale-[1.02]"
                  )}
                >
                  {isAnimating ? 'Sampling...' : 'Take Single Sample'}
                </button>
                
                <button
                  onClick={takeManySamples}
                  disabled={isAnimating}
                  data-tutorial="take-many"
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-all",
                    isAnimating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-[1.02]"
                  )}
                >
                  {isAnimating ? 'Taking samples...' : 'Take 100 Samples'}
                </button>
                
                <button
                  onClick={reset}
                  disabled={isAnimating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset All
                </button>
              </div>
              
              {/* Options */}
              <div className="space-y-2 pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showTheoretical} 
                    onChange={e => setShowTheoretical(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-neutral-300">Show theoretical curve</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Milestone Tracker */}
          <MilestoneTracker numSamples={numSamples} />
          
          {/* Challenge Box */}
          {currentChallenge && (
            <ChallengeBox
              challenge={currentChallenge}
              onComplete={(id) => setCompletedChallenges(prev => new Set([...prev, id]))}
              sampleSize={sampleSize}
              populationStd={populationStd}
            />
          )}
        </div>

        {/* Right Panel - Visualization & Stats */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="500px" data-tutorial="visualization">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {/* Statistics Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-bold text-purple-400 mb-3">Population Parameters</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Mean (μ)</span>
                  <span className="font-mono text-white">{populationMean}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Std Dev (σ)</span>
                  <span className="font-mono text-white">{populationStd}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Sample Size (n)</span>
                  <span className="font-mono text-white">{sampleSize}</span>
                </div>
              </div>
            </VisualizationSection>
            
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-3">Sampling Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Mean of Means</span>
                  <span className="font-mono text-cyan-400">
                    {numSamples > 0 ? samplingStats.mean.toFixed(3) : '---'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Observed SE</span>
                  <span className="font-mono text-cyan-400">
                    {numSamples > 1 ? samplingStats.std.toFixed(3) : '---'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Theoretical SE</span>
                  <span className="font-mono text-yellow-400">{samplingStats.theoreticalStd.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Samples Taken</span>
                  <span className="font-mono text-white">{numSamples}</span>
                </div>
              </div>
            </VisualizationSection>
          </div>
          
          {/* Current Sample Display */}
          {currentSample.length > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-bold text-green-400 mb-2">Latest Sample</h4>
              <div className="bg-neutral-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-400">Values:</span>
                  <span className="text-xs font-mono text-neutral-300">
                    [{currentSample.slice(0, 5).map(v => v.toFixed(1)).join(', ')}{currentSample.length > 5 ? '...' : ''}]
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Sample Mean:</span>
                  <span className="text-sm font-mono text-green-400">{jStat.mean(currentSample).toFixed(3)}</span>
                </div>
              </div>
            </VisualizationSection>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SamplingDistributions;