"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { VisualizationContainer, GraphContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { createColorScheme, cn, typography, colors } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Play, Pause, RotateCcw, ChevronRight, Target } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

// Tutorial steps
const tutorialSteps = [
  {
    id: 'welcome',
    title: "Welcome to the F-Distribution Journey!",
    content: "Let's explore how to compare variances between two groups. We'll build understanding step by step.",
    target: null,
    action: null,
    highlight: []
  },
  {
    id: 'variance-intro',
    title: "Understanding Variance",
    content: "Variance measures how spread out data is. Watch the two groups - one has low variance (tight cluster), the other has high variance (spread out).",
    target: 'variance-viz',
    action: null,
    highlight: ['variance-viz']
  },
  {
    id: 'adjust-samples',
    title: "Adjust Parameters",
    content: "Try changing the sample sizes and population variances. See how different variance ratios affect the F-distribution shape. Larger samples give more reliable estimates!",
    target: 'sample-controls',
    action: null,
    highlight: ['sample-size-1', 'sample-size-2']
  },
  {
    id: 'generate-first',
    title: "Generate Your First F-Statistic",
    content: "Click 'Generate Single F' to calculate one F-statistic. This is the ratio of two sample variances.",
    target: 'generate-button',
    action: 'generate-single',
    highlight: ['generate-single-btn']
  },
  {
    id: 'f-value-meaning',
    title: "What Does F Mean?",
    content: "The F-value you generated represents variance₁ ÷ variance₂. When F ≈ 1, variances are similar. When F >> 1, the first group has more variance!",
    target: 'f-display',
    action: null,
    highlight: ['f-value-display']
  },
  {
    id: 'build-distribution',
    title: "Build the Distribution",
    content: "Generate many F-values to see the pattern emerge. Click 'Generate Many' and watch the histogram build!",
    target: 'generate-many-button',
    action: 'generate-many',
    highlight: ['generate-many-btn']
  },
  {
    id: 'critical-values',
    title: "Critical Values",
    content: "Enable 'Show Critical Values' to see the cutoff points for hypothesis testing. These help determine if variances are significantly different.",
    target: 'critical-toggle',
    action: 'toggle-critical',
    highlight: ['critical-values-toggle']
  },
  {
    id: 'explore-parameters',
    title: "Explore Different Scenarios",
    content: "Try different sample sizes to see how the F-distribution shape changes. Small df = more skewed, Large df = more symmetric.",
    target: 'parameter-exploration',
    action: null,
    highlight: ['sample-size-1', 'sample-size-2']
  },
  {
    id: 'mastery',
    title: "F-Distribution Mastery!",
    content: "Congratulations! You've mastered the F-distribution. Use it to compare variances in ANOVA, regression diagnostics, and quality control.",
    target: null,
    action: null,
    highlight: []
  }
];

// Tutorial highlight overlay
const TutorialHighlight = ({ targetId, isActive }) => {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    if (!isActive || !targetId) {
      setPosition(null);
      return;
    }
    
    const updatePosition = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top - 5,
          left: rect.left - 5,
          width: rect.width + 10,
          height: rect.height + 10
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [targetId, isActive]);
  
  if (!position) return null;
  
  return (
    <div
      className="fixed border-2 border-violet-500 rounded-lg pointer-events-none z-40 animate-pulse"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
      }}
    />
  );
};

const FDistributionInteractiveJourney = () => {
  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Visualization state
  const [sampleSizeN1, setSampleSizeN1] = useState(10);
  const [sampleSizeN2, setSampleSizeN2] = useState(10);
  const [variance1, setVariance1] = useState(1);
  const [variance2, setVariance2] = useState(1);
  const [fValues, setFValues] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastFValue, setLastFValue] = useState(null);
  const [showCriticalValues, setShowCriticalValues] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs
  const svgRef = useRef(null);
  const varianceVizRef = useRef(null);
  const animationRef = useRef(null);
  const { setCleanInterval, setCleanTimeout } = useAnimationCleanup();
  
  // Calculate degrees of freedom
  const df1 = sampleSizeN1 - 1;
  const df2 = sampleSizeN2 - 1;
  
  // Color scheme
  const colorScheme = createColorScheme('estimation');
  
  // Current tutorial step data
  const currentStep = tutorialSteps[tutorialStep];
  const progress = ((tutorialStep + 1) / tutorialSteps.length) * 100;
  
  // Generate F-statistic
  const generateFStatistic = useCallback(() => {
    // Generate samples with specified variances
    const sample1 = Array.from({ length: sampleSizeN1 }, () => jStat.normal.sample(0, Math.sqrt(variance1)));
    const sample2 = Array.from({ length: sampleSizeN2 }, () => jStat.normal.sample(0, Math.sqrt(variance2)));
    
    const sampleVar1 = jStat.variance(sample1, true);
    const sampleVar2 = jStat.variance(sample2, true);
    const f = sampleVar1 / sampleVar2;
    
    return { f, variance1: sampleVar1, variance2: sampleVar2 };
  }, [sampleSizeN1, sampleSizeN2, variance1, variance2]);
  
  // Handle single generation
  const handleGenerateSingle = useCallback(() => {
    setIsGenerating(true);
    const { f, variance1, variance2 } = generateFStatistic();
    
    setCleanTimeout(() => {
      setFValues(prev => [...prev, f]);
      setLastFValue({ f, variance1, variance2 });
      setIsGenerating(false);
      
      // Progress tutorial if needed
      if (currentStep.action === 'generate-single' && !completedSteps.includes(currentStep.id)) {
        setCompletedSteps(prev => [...prev, currentStep.id]);
        setCleanTimeout(() => setTutorialStep(prev => Math.min(prev + 1, tutorialSteps.length - 1)), 1000);
      }
    }, 500);
  }, [generateFStatistic, fValues.length, currentStep, completedSteps, setCleanTimeout]);
  
  // Handle many generations
  const handleGenerateMany = useCallback(() => {
    setIsGenerating(true);
    const newValues = [];
    
    for (let i = 0; i < 50; i++) {
      const { f } = generateFStatistic();
      newValues.push(f);
    }
    
    let index = 0;
    const addValues = () => {
      if (index < newValues.length) {
        setFValues(prev => [...prev, newValues[index]]);
        index++;
        animationRef.current = requestAnimationFrame(addValues);
      } else {
        setIsGenerating(false);
        
        // Progress tutorial
        if (currentStep.action === 'generate-many' && !completedSteps.includes(currentStep.id)) {
          setCompletedSteps(prev => [...prev, currentStep.id]);
          setCleanTimeout(() => setTutorialStep(prev => Math.min(prev + 1, tutorialSteps.length - 1)), 1000);
        }
      }
    };
    
    addValues();
  }, [generateFStatistic, fValues.length, currentStep, completedSteps, setCleanTimeout]);
  
  // Handle critical values toggle
  const handleToggleCritical = useCallback(() => {
    setShowCriticalValues(prev => !prev);
    
    if (currentStep.action === 'toggle-critical' && !completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
      setCleanTimeout(() => setTutorialStep(prev => Math.min(prev + 1, tutorialSteps.length - 1)), 1000);
    }
  }, [currentStep, completedSteps, setCleanTimeout]);
  
  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isGenerating) {
      const interval = setCleanInterval(() => {
        handleGenerateSingle();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isGenerating, handleGenerateSingle, setCleanInterval]);
  
  // Variance visualization
  useEffect(() => {
    if (!varianceVizRef.current) return;
    
    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    
    d3.select(varianceVizRef.current).selectAll("*").remove();
    
    const svg = d3.select(varianceVizRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create sample data for visualization with actual variance values
    const createSampleData = (variance, n) => {
      return Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: jStat.normal.sample(50, Math.sqrt(variance) * 15)
      }));
    };
    
    const data1 = createSampleData(variance1, 30);
    const data2 = createSampleData(variance2, 30);
    
    // Draw groups
    const drawGroup = (data, x, color, label, varianceValue) => {
      // Points
      g.selectAll(`.points-${label.replace(/\s/g, '-')}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", color)
        .attr("opacity", 0.8);
      
      // Mean line
      const mean = d3.mean(data, d => d.y);
      g.append("line")
        .attr("x1", x - 40)
        .attr("x2", x + 40)
        .attr("y1", mean)
        .attr("y2", mean)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      // Label with variance value
      g.append("text")
        .attr("x", x)
        .attr("y", height - margin.bottom - 10)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .style("font-weight", "bold")
        .text(`Group ${label}`);
        
      g.append("text")
        .attr("x", x)
        .attr("y", height - margin.bottom + 5)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .style("font-size", "12px")
        .text(`σ² = ${varianceValue.toFixed(1)}`);
    };
    
    // Use distinct colors for better visibility
    drawGroup(data1, width * 0.3, '#10b981', "1", variance1); // Emerald green
    drawGroup(data2, width * 0.7, '#f97316', "2", variance2); // Orange
    
  }, [variance1, variance2]);
  
  // Main F-distribution visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xMax = Math.max(5, d3.max(fValues) || 5, jStat.centralF.inv(0.99, df1, df2));
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);
    
    // Calculate appropriate y-scale
    let yMax = 0.5;
    if (df1 > 2) {
      const mode = ((df1 - 2) / df1) * (df2 / (df2 + 2));
      yMax = Math.min(2, jStat.centralF.pdf(mode, df1, df2) * 1.2);
    }
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("F-value");
    
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text("Density");
    
    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Draw theoretical F-distribution
    const xValues = d3.range(0.01, xScale.domain()[1], 0.01);
    const curveData = xValues.map(x => ({
      x: x,
      y: jStat.centralF.pdf(x, df1, df2)
    }));
    
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6") // Blue for theoretical curve
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Draw histogram if we have data
    if (fValues.length > 0) {
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(25);
      
      const bins = histogram(fValues);
      const binWidth = bins.length > 0 && bins[0].x1 !== undefined ? bins[0].x1 - bins[0].x0 : 1;
      const totalArea = fValues.length * binWidth;
      
      g.selectAll(".bar")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", d => yScale(d.length / totalArea))
        .attr("height", d => innerHeight - yScale(d.length / totalArea))
        .attr("fill", "#8b5cf6") // Purple for observed data
        .attr("opacity", 0.6);
    }
    
    // Critical values
    if (showCriticalValues) {
      const criticalValues = [
        { alpha: 0.05, label: '95%', color: '#ef4444' },
        { alpha: 0.01, label: '99%', color: '#dc2626' }
      ];
      
      criticalValues.forEach(({ alpha, label, color }) => {
        const criticalValue = jStat.centralF.inv(1 - alpha, df1, df2);
        
        if (criticalValue <= xScale.domain()[1]) {
          g.append("line")
            .attr("x1", xScale(criticalValue))
            .attr("x2", xScale(criticalValue))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("id", "critical-values-lines");
          
          g.append("text")
            .attr("x", xScale(criticalValue))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", color)
            .attr("font-size", "12px")
            .text(`${label} (${criticalValue.toFixed(2)})`);
        }
      });
    }
    
    // Highlight last F-value
    if (lastFValue) {
      g.append("line")
        .attr("x1", xScale(lastFValue.f))
        .attr("x2", xScale(lastFValue.f))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.accent)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .attr("id", "f-value-display")
        .transition()
        .duration(300)
        .attr("opacity", 1)
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 0.3);
    }
    
    // Add legend
    const legendData = [
      { label: "Theoretical F-distribution", color: "#3b82f6" },
      { label: "Observed F-values", color: "#8b5cf6" }
    ];
    
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 3)
        .attr("fill", item.color);
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 3)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .attr("fill", "currentColor")
        .text(item.label);
    });
    
  }, [fValues, lastFValue, df1, df2, showCriticalValues, colorScheme]);
  
  // Tutorial navigation
  const handleNextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };
  
  const handleReset = () => {
    setFValues([]);
    setLastFValue(null);
    setIsGenerating(false);
    setIsPlaying(false);
  };
  
  return (
    <VisualizationContainer
      title="4.5 F-Distribution Interactive Journey"
      description="Master variance comparison through guided exploration"
    >
      {/* Tutorial progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Journey Progress</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Tutorial message */}
      <div className="mb-6 p-4 bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-lg border border-violet-600/30">
        <h3 className="text-lg font-semibold text-violet-400 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          {currentStep.title}
        </h3>
        <p className="text-sm text-gray-300">{currentStep.content}</p>
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={handlePrevStep}
            disabled={tutorialStep === 0}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            Step {tutorialStep + 1} of {tutorialSteps.length}
          </span>
          <Button
            onClick={handleNextStep}
            disabled={tutorialStep === tutorialSteps.length - 1}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Variance visualization */}
          <VisualizationSection className="p-4" id="variance-viz">
            <h3 className="text-base font-semibold mb-3">Variance Comparison</h3>
            <svg ref={varianceVizRef} className="w-full" style={{ height: "200px" }} />
          </VisualizationSection>
          
          {/* F-distribution chart */}
          <GraphContainer height="400px">
            <svg ref={svgRef} className="w-full h-full" />
          </GraphContainer>
        </div>
        
        {/* Controls panel */}
        <div className="space-y-4">
          {/* Sample size controls */}
          <VisualizationSection className="p-4" id="sample-controls">
            <h3 className="text-base font-semibold mb-3">Parameters</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">Group 1 (Green)</h4>
                <div id="sample-size-1" className="mb-2">
                  <label className="text-sm font-medium mb-1 block">
                    Sample Size (n₁ = {sampleSizeN1})
                    <span className="text-xs text-gray-500 ml-2">df₁ = {df1}</span>
                  </label>
                  <RangeSlider
                    value={sampleSizeN1}
                    onChange={setSampleSizeN1}
                    min={3}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Population Variance (σ₁² = {variance1.toFixed(1)})
                  </label>
                  <RangeSlider
                    value={variance1}
                    onChange={setVariance1}
                    min={0.5}
                    max={5}
                    step={0.1}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold text-orange-400 mb-2">Group 2 (Orange)</h4>
                <div id="sample-size-2" className="mb-2">
                  <label className="text-sm font-medium mb-1 block">
                    Sample Size (n₂ = {sampleSizeN2})
                    <span className="text-xs text-gray-500 ml-2">df₂ = {df2}</span>
                  </label>
                  <RangeSlider
                    value={sampleSizeN2}
                    onChange={setSampleSizeN2}
                    min={3}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Population Variance (σ₂² = {variance2.toFixed(1)})
                  </label>
                  <RangeSlider
                    value={variance2}
                    onChange={setVariance2}
                    min={0.5}
                    max={5}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Action buttons */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3">Generate F-Statistics</h3>
            <div className="space-y-2">
              <Button
                id="generate-single-btn"
                onClick={handleGenerateSingle}
                disabled={isGenerating}
                className="w-full"
                variant="default"
              >
                Generate Single F
              </Button>
              <Button
                id="generate-many-btn"
                onClick={handleGenerateMany}
                disabled={isGenerating}
                className="w-full"
                variant="secondary"
              >
                Generate Many (50)
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isGenerating}
                  className="flex-1"
                  variant="outline"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Auto-play'}
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={isGenerating || fValues.length === 0}
                  className="flex-1"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Options */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3">Display Options</h3>
            <label className="flex items-center gap-2 cursor-pointer" id="critical-values-toggle">
              <input
                type="checkbox"
                checked={showCriticalValues}
                onChange={handleToggleCritical}
                className="rounded"
              />
              <span className="text-sm">Show Critical Values</span>
            </label>
          </VisualizationSection>
          
          {/* Statistics */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-semibold mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-800 rounded">
                <div className="flex justify-between">
                  <span>Expected F-ratio:</span>
                  <span className="font-mono text-yellow-400">
                    σ₁²/σ₂² = {(variance1 / variance2).toFixed(2)}
                  </span>
                </div>
              </div>
              {fValues.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Samples:</span>
                    <span className="font-mono">{fValues.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Observed Mean F:</span>
                    <span className="font-mono">{jStat.mean(fValues).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Theoretical Mean:</span>
                    <span className="font-mono">
                      {df2 > 2 ? (df2 / (df2 - 2)).toFixed(3) : "∞"}
                    </span>
                  </div>
                  {lastFValue && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-500">Last F-value:</div>
                      <div className="font-mono text-emerald-400">{lastFValue.f.toFixed(3)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        s₁² = {lastFValue.variance1.toFixed(3)}, s₂² = {lastFValue.variance2.toFixed(3)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </VisualizationSection>
          
        </div>
      </div>
      
      {/* Tutorial highlights */}
      {currentStep.highlight.map(id => (
        <TutorialHighlight key={id} targetId={id} isActive={true} />
      ))}
    </VisualizationContainer>
  );
};

export default FDistributionInteractiveJourney;