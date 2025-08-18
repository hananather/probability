"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer, 
  VisualizationSection,
  ControlGroup,
  ControlPanel,
  StatsDisplay
} from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import { createColorScheme, cn, formatNumber } from '@/lib/design-system';
import { 
  Info, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Activity,
  FlaskConical,
  BarChart3,
  Target,
  Lightbulb,
  Award
} from "lucide-react";
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import SharedNavigation from '../shared/SharedNavigation';

// Color scheme
const colorScheme = createColorScheme('hypothesis');

// Learning stages with progressive disclosure
const learningStages = [
  {
    id: 'motivation',
    title: 'Why Compare Variances?',
    subtitle: 'Understanding the need for F-distribution',
    icon: <Target className="w-5 h-5" />,
    content: {
      main: "Imagine you're comparing the consistency of two manufacturing processes. Which produces more reliable results?",
      scenario: "Process A: Widget weights vary by ±2g\nProcess B: Widget weights vary by ±5g",
      question: "How can we test if this difference is statistically significant?",
      insight: "The F-distribution helps us compare the variability (variance) between two groups!"
    }
  },
  {
    id: 'concept',
    title: 'The Variance Ratio',
    subtitle: 'Building intuition for F-statistics',
    icon: <FlaskConical className="w-5 h-5" />,
    content: {
      main: "The F-statistic is simply the ratio of two sample variances:",
      formula: "F = S₁² / S₂²",
      interpretation: [
        "F ≈ 1: Similar variability in both groups",
        "F > 1: First group has more variability",
        "F < 1: Second group has more variability"
      ],
      activity: "Generate samples to see how variance ratios distribute!"
    }
  },
  {
    id: 'degrees-of-freedom',
    title: 'Understanding Degrees of Freedom',
    subtitle: 'Why df = n - 1?',
    icon: <Info className="w-5 h-5" />,
    content: {
      main: "Degrees of freedom (df) represents the number of values that are 'free to vary' when calculating a statistic.",
      analogy: "Imagine you have 5 numbers that must sum to 20. Once you know 4 of them, the 5th is determined! Only 4 are 'free to vary'.",
      formula: "df = n - 1",
      explanation: [
        "Sample size n: Total number of observations",
        "Degrees of freedom df: Number of independent pieces of information",
        "We lose 1 df because we estimate the mean from the same data"
      ],
      insight: "When calculating variance, we use the sample mean. This creates a constraint that 'uses up' one degree of freedom!",
      activity: "Notice how the sliders show both n (sample size) and df (degrees of freedom)"
    }
  },
  {
    id: 'interactive',
    title: 'Exploring F-Distribution Shape',
    subtitle: 'How degrees of freedom affect the curve',
    icon: <Activity className="w-5 h-5" />,
    content: {
      main: "The F-distribution's shape depends on two parameters: df₁ and df₂",
      explore: [
        "Increase df₁: See how the peak shifts",
        "Increase df₂: Watch the distribution become more symmetric",
        "Compare small vs large df: Notice the right skew"
      ],
      milestone: "Find the combination where the mean equals 1.2"
    }
  },
  {
    id: 'sampling',
    title: 'Sampling Distribution in Action',
    subtitle: 'Building the F-distribution empirically',
    icon: <BarChart3 className="w-5 h-5" />,
    content: {
      main: "Let's generate many F-statistics and watch the distribution emerge!",
      steps: [
        "1. Draw two random samples from normal populations",
        "2. Calculate their variances",
        "3. Compute F = S₁² / S₂²",
        "4. Repeat many times"
      ],
      goal: "Generate 100+ samples to see convergence"
    }
  },
  {
    id: 'hypothesis',
    title: 'Hypothesis Testing with F',
    subtitle: 'Making decisions about variance equality',
    icon: <Target className="w-5 h-5" />,
    content: {
      main: "Use the F-test to compare variances between two groups",
      hypotheses: "H₀: σ₁² = σ₂² (equal variances)\nHₐ: σ₁² ≠ σ₂² (unequal variances)",
      criticalRegion: "Reject H₀ if F > F_critical or F < 1/F_critical",
      practice: "Try different significance levels to see how critical values change"
    }
  },
  {
    id: 'applications',
    title: 'Real-World Applications',
    subtitle: 'Where F-distributions matter',
    icon: <Lightbulb className="w-5 h-5" />,
    content: {
      main: "F-distributions are fundamental in many statistical analyses:",
      applications: [
        "ANOVA: Comparing means across multiple groups",
        "Regression: Testing model significance",
        "Quality Control: Comparing process variabilities",
        "Experimental Design: Analyzing treatment effects"
      ],
      connection: "The F-test in ANOVA compares between-group to within-group variance!"
    }
  },
  {
    id: 'mastery',
    title: 'Complete!',
    subtitle: 'You\'ve learned the F-distribution',
    icon: <Award className="w-5 h-5" />,
    content: {
      main: "You now understand how to compare variances using the F-distribution!",
      learned: [
        "F-statistics measure variance ratios",
        "Shape depends on two df parameters",
        "Critical for ANOVA and regression",
        "Tests equality of variances"
      ],
      next: "Try the practice problems to solidify your understanding!"
    }
  }
];

// Animated sample generation component
const AnimatedSampleGeneration = ({ isGenerating, stage }) => {
  if (!isGenerating || stage !== 'sampling') return null;
  
  return (
    <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-teal-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="text-sm text-teal-400">Generating samples...</span>
      </div>
    </div>
  );
};

// Variance visualization component
const VarianceVisualizer = ({ sample1Variance, sample2Variance, fStatistic }) => {
  const maxVar = Math.max(sample1Variance, sample2Variance, 5);
  const scale = 100 / maxVar;
  
  return (
    <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-300">Variance Comparison</h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-16">S₁² = {sample1Variance.toFixed(2)}</span>
          <div className="flex-1 bg-neutral-700 rounded-full h-6 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${sample1Variance * scale}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-1 bg-white/50"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-16">S₂² = {sample2Variance.toFixed(2)}</span>
          <div className="flex-1 bg-neutral-700 rounded-full h-6 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${sample2Variance * scale}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-1 bg-white/50"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t border-neutral-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">F-statistic:</span>
          <span className="text-lg font-mono font-bold text-teal-400">
            {fStatistic.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Interactive F-distribution visualization
const FDistributionVisualization = ({ 
  df1, 
  df2, 
  samples, 
  lastF, 
  showCritical, 
  alpha,
  highlightRegion,
  onHover 
}) => {
  const svgRef = useRef();
  const [hoveredF, setHoveredF] = useState(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth || 800;
    const height = 450;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);
    
    // Gradient definitions
    const defs = svg.append("defs");
    
    // Background gradient
    const bgGradient = defs.append("linearGradient")
      .attr("id", "f-bg-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    bgGradient.selectAll("stop")
      .data([
        { offset: "0%", color: "#0f172a" },
        { offset: "50%", color: "#1e293b" },
        { offset: "100%", color: "#0f172a" }
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
    // Area gradient - More vibrant colors
    const areaGradient = defs.append("linearGradient")
      .attr("id", "f-area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    areaGradient.selectAll("stop")
      .data([
        { offset: "0%", color: "#00ffcc", opacity: 0.9 },  // Bright cyan
        { offset: "50%", color: "#00e5ff", opacity: 0.7 }, // Bright light blue
        { offset: "100%", color: "#7c3aed", opacity: 0.4 } // Vibrant purple
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      .attr("stop-opacity", d => d.opacity);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#f-bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate domain
    const xMax = Math.max(6, d3.max(samples) || 6, jStat.centralF.inv(0.99, df1, df2));
    
    // Calculate y domain based on F-distribution peak
    let mode = 0;
    if (df1 > 2) {
      mode = ((df1 - 2) / df1) * (df2 / (df2 + 2));
    }
    const peakDensity = jStat.centralF.pdf(mode, df1, df2);
    const yMax = Math.min(2, peakDensity * 1.2);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
    
    // Grid lines
    const makeGridLines = (scale, ticks) => scale.ticks(ticks);
    
    // X grid
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(makeGridLines(xScale, 10))
      .enter().append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.3);
    
    // Y grid
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(makeGridLines(yScale, 8))
      .enter().append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.3);
    
    // Generate F-distribution curve
    const xValues = d3.range(0.01, xMax, 0.01);
    const curveData = xValues.map(x => ({
      x: x,
      y: jStat.centralF.pdf(x, df1, df2)
    }));
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw area
    g.append("path")
      .datum(curveData)
      .attr("fill", "url(#f-area-gradient)")
      .attr("d", area)
      .attr("opacity", 0.6);
    
    // Draw curve - Brighter, more vibrant
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "#00ffcc")  // Bright cyan
      .attr("stroke-width", 4)
      .attr("d", line)
      .attr("filter", "drop-shadow(0 0 12px rgba(0, 255, 204, 0.8)) drop-shadow(0 0 24px rgba(0, 255, 204, 0.5))");
    
    // Critical values
    if (showCritical) {
      const criticalValues = [
        { alpha: 0.1, color: '#f59e0b' },
        { alpha: 0.05, color: '#ef4444' },
        { alpha: 0.01, color: '#dc2626' }
      ];
      
      criticalValues.forEach(({ alpha: a, color }) => {
        const critical = jStat.centralF.inv(1 - a, df1, df2);
        if (critical <= xMax) {
          // Critical line
          g.append("line")
            .attr("x1", xScale(critical))
            .attr("x2", xScale(critical))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.8);
          
          // Label
          g.append("text")
            .attr("x", xScale(critical))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", color)
            .attr("font-size", "12px")
            .text(`${(1-a)*100}%`);
        }
      });
    }
    
    // Histogram for samples
    if (samples.length > 0) {
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(30);
      
      const bins = histogram(samples);
      
      // Normalize for density
      const binWidth = bins[0].x1 - bins[0].x0;
      const totalArea = samples.length * binWidth;
      
      g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", "#a855f7")  // Bright purple
        .attr("opacity", 0.8)
        .transition()
        .duration(300)
        .attr("y", d => yScale(d.length / totalArea))
        .attr("height", d => innerHeight - yScale(d.length / totalArea));
    }
    
    // Highlight last F value
    if (lastF !== null) {
      // Animated line
      const fLine = g.append("line")
        .attr("x1", xScale(lastF))
        .attr("x2", xScale(lastF))
        .attr("y1", innerHeight)
        .attr("y2", innerHeight)
        .attr("stroke", "#fbbf24")  // Bright amber
        .attr("stroke-width", 4)
        .attr("opacity", 0);
      
      fLine.transition()
        .duration(500)
        .attr("y2", 0)
        .attr("opacity", 1)
        .transition()
        .delay(1500)
        .duration(500)
        .attr("opacity", 0.5);
      
      // Animated circle at top
      g.append("circle")
        .attr("cx", xScale(lastF))
        .attr("cy", yScale(jStat.centralF.pdf(lastF, df1, df2)))
        .attr("r", 0)
        .attr("fill", "#fbbf24")  // Bright amber
        .attr("filter", "drop-shadow(0 0 15px rgba(251, 191, 36, 1)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))")
        .transition()
        .duration(300)
        .attr("r", 8)
        .transition()
        .delay(1500)
        .duration(300)
        .attr("r", 4);
    }
    
    // Axes
    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxisGroup.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    xAxisGroup.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("F-value");
    
    const yAxisGroup = g.append("g")
      .call(d3.axisLeft(yScale).ticks(8));
    
    yAxisGroup.selectAll("text")
      .attr("fill", "#f3f4f6");
    
    yAxisGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Density");
    
    // Interactive overlay
    const overlay = g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all");
    
    // Tooltip
    const tooltip = g.append("g")
      .style("display", "none");
    
    const tooltipRect = tooltip.append("rect")
      .attr("fill", "rgba(0,0,0,0.8)")
      .attr("rx", 4)
      .attr("ry", 4);
    
    const tooltipText = tooltip.append("text")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");
    
    overlay.on("mousemove", function(event) {
      const [mouseX] = d3.pointer(event);
      const fValue = xScale.invert(mouseX);
      
      if (fValue >= 0 && fValue <= xMax) {
        const density = jStat.centralF.pdf(fValue, df1, df2);
        const probability = jStat.centralF.cdf(fValue, df1, df2);
        
        tooltip.style("display", null);
        tooltipText.text(`F=${fValue.toFixed(2)}, P(F≤${fValue.toFixed(2)})=${probability.toFixed(3)}`);
        
        const bbox = tooltipText.node().getBBox();
        tooltipRect
          .attr("x", bbox.x - 5)
          .attr("y", bbox.y - 3)
          .attr("width", bbox.width + 10)
          .attr("height", bbox.height + 6);
        
        tooltip.attr("transform", `translate(${mouseX},${Math.max(20, yScale(density) - 20)})`);
        
        setHoveredF(fValue);
        if (onHover) onHover(fValue);
      }
    }).on("mouseout", function() {
      tooltip.style("display", "none");
      setHoveredF(null);
      if (onHover) onHover(null);
    });
    
  }, [df1, df2, samples, lastF, showCritical, alpha, onHover]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

// Main component
const FDistributionAdvanced = () => {
  // State management
  const [currentStage, setCurrentStage] = useState(0);
  const [df1Input, setDf1Input] = useState(10);
  const [df2Input, setDf2Input] = useState(15);
  const [samples, setSamples] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastF, setLastF] = useState(null);
  const [showCritical, setShowCritical] = useState(false);
  const [alpha, setAlpha] = useState(0.05);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [milestoneAchieved, setMilestoneAchieved] = useState(false);
  const [hoveredF, setHoveredF] = useState(null);
  
  // Refs
  const animationRef = useRef(null);
  const localSamplesRef = useRef([]);
  const contentRef = useRef(null);
  
  // Calculate degrees of freedom
  const df1 = Math.max(1, df1Input - 1);
  const df2 = Math.max(1, df2Input - 1);
  
  // Current stage data
  const stage = learningStages[currentStage];
  
  // Use safe MathJax processing
  useSafeMathJax(contentRef, [currentStage]);
  
  // Generate F-statistic
  const generateFStatistic = useCallback(() => {
    const sample1 = Array.from({ length: df1Input }, () => jStat.normal.sample(0, 1));
    const sample2 = Array.from({ length: df2Input }, () => jStat.normal.sample(0, 1));
    
    const variance1 = jStat.variance(sample1, true);
    const variance2 = jStat.variance(sample2, true);
    
    return {
      f: variance1 / variance2,
      s1: variance1,
      s2: variance2
    };
  }, [df1Input, df2Input]);
  
  // Generate single sample with animation
  const generateSingle = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setHasInteracted(true);
    
    const result = generateFStatistic();
    setLastF(result.f);
    
    // Animate the generation
    setTimeout(() => {
      setSamples(prev => [...prev, result.f]);
      localSamplesRef.current = [...localSamplesRef.current, result.f];
      setIsGenerating(false);
    }, 500);
  }, [generateFStatistic, isGenerating]);
  
  // Generate many samples
  const generateMany = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setHasInteracted(true);
    const newSamples = [];
    
    for (let i = 0; i < 100; i++) {
      const result = generateFStatistic();
      newSamples.push(result.f);
    }
    
    // Animate addition
    let index = 0;
    const addBatch = () => {
      const batchSize = 5;
      const batch = newSamples.slice(index, index + batchSize);
      
      setSamples(prev => [...prev, ...batch]);
      localSamplesRef.current = [...localSamplesRef.current, ...batch];
      
      index += batchSize;
      if (index < newSamples.length) {
        animationRef.current = setTimeout(addBatch, 50);
      } else {
        setIsGenerating(false);
      }
    };
    
    addBatch();
  }, [generateFStatistic, isGenerating]);
  
  // Reset
  const reset = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setSamples([]);
    localSamplesRef.current = [];
    setLastF(null);
    setIsGenerating(false);
  }, []);
  
  // Check milestones
  useEffect(() => {
    if (currentStage === 2 && df2 > 4) {
      const theoreticalMean = df2 / (df2 - 2);
      if (Math.abs(theoreticalMean - 1.2) < 0.05) {
        setMilestoneAchieved(true);
      }
    } else if (currentStage === 3 && samples.length >= 100) {
      setMilestoneAchieved(true);
    } else {
      setMilestoneAchieved(false);
    }
  }, [currentStage, df2, samples.length]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const sampleMean = samples.length > 0 ? jStat.mean(samples) : 0;
    const sampleStd = samples.length > 0 ? jStat.stdev(samples, true) : 0;
    const theoreticalMean = df2 > 2 ? df2 / (df2 - 2) : Infinity;
    const theoreticalVar = df2 > 4 ? 
      (2 * df2 * df2 * (df1 + df2 - 2)) / (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4)) : Infinity;
    
    return {
      sampleMean,
      sampleStd,
      theoreticalMean,
      theoreticalStd: Math.sqrt(theoreticalVar)
    };
  }, [samples, df1, df2]);
  
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
      title="4.5 F-Distribution Advanced Topics"
      subtitle="A comprehensive journey through variance comparison"
      tutorialSteps={[]}
      tutorialKey="f-distribution-masterclass"
    >
      <div ref={contentRef} className="space-y-6">
        {/* Progress Bar */}
        <ProgressBar
          current={currentStage + 1}
          total={learningStages.length}
          label="Learning Progress"
          variant="emerald"
        />
        
        {/* Navigation */}
        <SharedNavigation
          currentStep={currentStage}
          totalSteps={learningStages.length}
          onNavigate={setCurrentStage}
          showProgress={true}
          nextLabel="Next Stage"
          previousLabel="Previous Stage"
        />
        
        {/* Stage Content */}
        <VisualizationSection className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                {stage.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{stage.title}</h2>
                <p className="text-sm text-gray-400">{stage.subtitle}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Stage {currentStage + 1} of {learningStages.length}
            </div>
          </div>
          
          {/* Stage-specific content */}
          <div className="space-y-4">
            <p className="text-gray-300">{stage.content.main}</p>
            
            {stage.content.scenario && (
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <p className="text-sm font-mono text-blue-300 whitespace-pre-line">
                  {stage.content.scenario}
                </p>
              </div>
            )}
            
            {stage.content.question && (
              <p className="text-amber-400 italic">{stage.content.question}</p>
            )}
            
            {stage.content.formula && (
              <div className="text-center py-3">
                <span className="text-2xl font-mono text-teal-400">
                  {stage.content.formula}
                </span>
              </div>
            )}
            
            {stage.content.analogy && (
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4">
                <p className="text-sm text-emerald-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {stage.content.analogy}
                </p>
              </div>
            )}
            
            {stage.content.explanation && (
              <ul className="space-y-2">
                {stage.content.explanation.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {stage.content.interpretation && (
              <ul className="space-y-2">
                {stage.content.interpretation.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {stage.content.explore && (
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-400 mb-2">Try these:</p>
                {stage.content.explore.map((item, i) => (
                  <p key={i} className="text-sm text-gray-300 ml-4">• {item}</p>
                ))}
              </div>
            )}
            
            {stage.content.steps && (
              <div className="space-y-2">
                {stage.content.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center text-xs text-teal-400">
                      {i + 1}
                    </div>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )}
            
            {stage.content.applications && (
              <div className="grid grid-cols-2 gap-3">
                {stage.content.applications.map((app, i) => (
                  <div key={i} className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                    <p className="text-sm text-gray-300">{app}</p>
                  </div>
                ))}
              </div>
            )}
            
            {stage.content.learned && (
              <div className="space-y-2">
                {stage.content.learned.map((item, i) => (
                  <p key={i} className="text-sm text-emerald-400 font-medium">{item}</p>
                ))}
              </div>
            )}
            
            {stage.content.insight && (
              <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-4">
                <p className="text-sm text-teal-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {stage.content.insight}
                </p>
              </div>
            )}
            
            {stage.content.activity && (
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {stage.content.activity}
              </p>
            )}
            
            {stage.content.milestone && milestoneAchieved && (
              <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3">
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Complete! {stage.content.milestone}
                </p>
              </div>
            )}
          </div>
        </VisualizationSection>
        
        {/* Interactive Visualization - Only show after motivation stage */}
        {currentStage > 0 && (
          <div className="grid lg:grid-cols-[1fr,320px] gap-6">
            {/* Main Visualization */}
            <GraphContainer className="relative">
              <FDistributionVisualization
                df1={df1}
                df2={df2}
                samples={samples}
                lastF={lastF}
                showCritical={showCritical && currentStage >= 4}
                alpha={alpha}
                highlightRegion={currentStage === 4}
                onHover={setHoveredF}
              />
              <AnimatedSampleGeneration 
                isGenerating={isGenerating} 
                stage={stage.id}
              />
            </GraphContainer>
            
            {/* Controls Panel */}
            <ControlPanel className="space-y-4">
              {/* Parameters */}
              <ControlGroup title="Sample Sizes">
                <div className="space-y-3">
                  <div>
                    <label className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Sample 1 size: n₁ = {df1Input}</span>
                      <span className="text-xs bg-teal-500/20 px-2 py-0.5 rounded text-teal-300">df₁ = n₁ - 1 = {df1}</span>
                    </label>
                    <RangeSlider
                      value={df1Input}
                      onChange={setDf1Input}
                      min={2}
                      max={50}
                      step={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">Degrees of freedom = Sample size - 1</p>
                  </div>
                  <div>
                    <label className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Sample 2 size: n₂ = {df2Input}</span>
                      <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">df₂ = n₂ - 1 = {df2}</span>
                    </label>
                    <RangeSlider
                      value={df2Input}
                      onChange={setDf2Input}
                      min={2}
                      max={50}
                      step={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">Degrees of freedom = Sample size - 1</p>
                  </div>
                </div>
              </ControlGroup>
              
              {/* Actions */}
              {currentStage >= 1 && (
                <ControlGroup title="Generate Samples">
                  <div className="space-y-2">
                    <Button
                      onClick={generateSingle}
                      disabled={isGenerating}
                      className="w-full"
                      variant="default"
                    >
                      Generate One F-statistic
                    </Button>
                    <Button
                      onClick={generateMany}
                      disabled={isGenerating}
                      className="w-full"
                      variant="secondary"
                    >
                      Generate 100 Samples
                    </Button>
                    <Button
                      onClick={reset}
                      disabled={samples.length === 0}
                      className="w-full"
                      variant="outline"
                    >
                      Reset
                    </Button>
                  </div>
                  {samples.length > 0 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {samples.length} samples generated
                    </p>
                  )}
                </ControlGroup>
              )}
              
              {/* Variance Visualizer */}
              {lastF !== null && currentStage >= 1 && (
                <VarianceVisualizer
                  sample1Variance={2.5}
                  sample2Variance={2.5 / lastF}
                  fStatistic={lastF}
                />
              )}
              
              {/* Statistics */}
              {samples.length > 0 && (
                <StatsDisplay
                  stats={[
                    { label: "Sample Mean", value: formatNumber(stats.sampleMean), color: colorScheme.primary },
                    { label: "Sample Std Dev", value: formatNumber(stats.sampleStd), color: colorScheme.secondary },
                    { label: "Theoretical Mean", value: df2 > 2 ? formatNumber(stats.theoreticalMean) : "∞", color: colorScheme.accent }
                  ]}
                />
              )}
              
              {/* Critical Values Toggle */}
              {currentStage >= 4 && (
                <ControlGroup title="Hypothesis Testing">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showCritical}
                      onChange={(e) => setShowCritical(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show critical values</span>
                  </label>
                  {showCritical && (
                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Significance Level</label>
                      <RangeSlider
                        value={alpha}
                        onChange={setAlpha}
                        min={0.01}
                        max={0.1}
                        step={0.01}
                        formatValue={v => `α = ${v}`}
                      />
                    </div>
                  )}
                </ControlGroup>
              )}
            </ControlPanel>
          </div>
        )}
        
        {/* Additional Resources */}
        {currentStage === learningStages.length - 1 && (
          <VisualizationSection className="p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
            <h3 className="text-lg font-bold text-emerald-400 mb-3">Next Steps</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Practice Problems</h4>
                <p className="text-sm text-gray-400">
                  Try comparing variances from real datasets to solidify your understanding.
                </p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">ANOVA Connection</h4>
                <p className="text-sm text-gray-400">
                  Learn how F-distributions power the analysis of variance (ANOVA).
                </p>
              </div>
            </div>
          </VisualizationSection>
        )}
      </div>
    </VisualizationContainer>
  );
};

export default FDistributionAdvanced;