"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  GraphContainer, 
  VisualizationSection,
  ControlGroup,
  StatsDisplay
} from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { createColorScheme, cn, formatNumber } from '@/lib/design-system';
import { 
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Target,
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react";

// Color scheme
const colorScheme = createColorScheme('hypothesis');

// Tutorial steps for guided learning
const tutorialSteps = [
  {
    title: "Welcome to F-Distribution Explorer!",
    content: "Let's discover how to compare variances between two groups using the F-distribution. Ready to begin?",
    target: null,
    action: null,
    highlight: []
  },
  {
    title: "Understanding the Problem",
    content: "Imagine comparing the consistency of two machines. Machine A produces items with variance 2.5, Machine B with variance 1.8. Is this difference significant?",
    target: "concept",
    action: null,
    highlight: ["variance-visual"]
  },
  {
    title: "The F-Statistic",
    content: "F = S₁²/S₂² = 2.5/1.8 = 1.39. This ratio follows an F-distribution when the true variances are equal.",
    target: "formula",
    action: null,
    highlight: ["f-formula"]
  },
  {
    title: "Degrees of Freedom",
    content: "The shape depends on two parameters: df₁ = n₁-1 and df₂ = n₂-1. Try adjusting the sample sizes!",
    target: "controls",
    action: "adjust-df",
    highlight: ["df-controls"]
  },
  {
    title: "Generate Your First F-Statistic",
    content: "Click 'Generate F-statistic' to simulate taking two samples and calculating their variance ratio.",
    target: "generate",
    action: "generate-single",
    highlight: ["generate-button"]
  },
  {
    title: "Building the Distribution",
    content: "Great! Now generate many more samples to see the F-distribution emerge. Notice how most values cluster around 1.",
    target: "generate-many",
    action: "generate-many",
    highlight: ["generate-many-button"]
  },
  {
    title: "Critical Values",
    content: "Enable 'Show Critical Values' to see the rejection regions for hypothesis testing at different significance levels.",
    target: "critical",
    action: "show-critical",
    highlight: ["critical-toggle"]
  },
  {
    title: "Making Decisions",
    content: "If your F-statistic falls in the tail beyond the critical value, you reject the null hypothesis of equal variances.",
    target: "decision",
    action: null,
    highlight: ["critical-region"]
  },
  {
    title: "Congratulations!",
    content: "You've mastered the F-distribution! Try different sample sizes to see how the shape changes, or reset to practice again.",
    target: null,
    action: null,
    highlight: []
  }
];

// Interactive Coin Flip Animation for variance illustration
const VarianceAnimation = ({ isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Initialize particles
    const createParticle = (groupIndex) => {
      const baseX = groupIndex === 0 ? width * 0.25 : width * 0.75;
      const variance = groupIndex === 0 ? 20 : 50; // Different variances
      return {
        x: baseX + (Math.random() - 0.5) * variance * 2,
        y: height / 2 + (Math.random() - 0.5) * variance,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        group: groupIndex,
        color: groupIndex === 0 ? colorScheme.primary : colorScheme.secondary
      };
    };
    
    // Create particles for both groups
    particlesRef.current = [];
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push(createParticle(0));
      particlesRef.current.push(createParticle(1));
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw group labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#e5e7eb';
      ctx.textAlign = 'center';
      ctx.fillText('Low Variance', width * 0.25, 30);
      ctx.fillText('High Variance', width * 0.75, 30);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        const baseX = particle.group === 0 ? width * 0.25 : width * 0.75;
        const maxDist = particle.group === 0 ? 40 : 80;
        
        if (Math.abs(particle.x - baseX) > maxDist) {
          particle.vx *= -0.8;
          particle.x = baseX + Math.sign(particle.x - baseX) * maxDist;
        }
        if (particle.y < 50 || particle.y > height - 20) {
          particle.vy *= -0.8;
          particle.y = particle.y < 50 ? 50 : height - 20;
        }
        
        // Apply damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={200} 
      className="w-full h-full bg-neutral-900 rounded-lg"
    />
  );
};

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-2 h-2 rounded-full transition-all duration-300",
          i === currentStep 
            ? "w-8 bg-teal-500" 
            : i < currentStep 
            ? "bg-teal-700" 
            : "bg-neutral-600"
        )}
      />
    ))}
  </div>
);

// Achievement notification
const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
      <Trophy className="w-6 h-6" />
      <div>
        <p className="font-semibold">Achievement Unlocked!</p>
        <p className="text-sm opacity-90">{achievement}</p>
      </div>
    </div>
  );
};

// Main component
const FDistributionJourney = () => {
  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialActive, setTutorialActive] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  
  // Visualization state
  const [sampleSize1, setSampleSize1] = useState(15);
  const [sampleSize2, setSampleSize2] = useState(20);
  const [samples, setSamples] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastF, setLastF] = useState(null);
  const [lastVariances, setLastVariances] = useState({ s1: null, s2: null });
  const [showCriticalValues, setShowCriticalValues] = useState(false);
  const [isAnimatingVariance, setIsAnimatingVariance] = useState(false);
  
  // Refs
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  // Calculate degrees of freedom
  const df1 = sampleSize1 - 1;
  const df2 = sampleSize2 - 1;
  
  // Current tutorial step
  const currentTutorial = tutorialSteps[tutorialStep];
  
  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [];
    
    if (samples.length === 1 && !achievements.includes('first-sample')) {
      newAchievements.push({ id: 'first-sample', text: 'First F-statistic generated!' });
    }
    
    if (samples.length >= 30 && !achievements.includes('thirty-samples')) {
      newAchievements.push({ id: 'thirty-samples', text: 'Statistical Explorer - 30 samples!' });
    }
    
    if (samples.length >= 100 && !achievements.includes('hundred-samples')) {
      newAchievements.push({ id: 'hundred-samples', text: 'Distribution Master - 100 samples!' });
    }
    
    if (df1 === df2 && samples.length > 0 && !achievements.includes('equal-df')) {
      newAchievements.push({ id: 'equal-df', text: 'Balanced Design - Equal degrees of freedom!' });
    }
    
    newAchievements.forEach(achievement => {
      setAchievements(prev => [...prev, achievement.id]);
      setShowAchievement(achievement.text);
    });
  }, [samples.length, df1, df2, achievements]);
  
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);
  
  // Generate F-statistic
  const generateFStatistic = useCallback(() => {
    const sample1 = Array.from({ length: sampleSize1 }, () => jStat.normal.sample(0, 1));
    const sample2 = Array.from({ length: sampleSize2 }, () => jStat.normal.sample(0, 1));
    
    const variance1 = jStat.variance(sample1, true);
    const variance2 = jStat.variance(sample2, true);
    const f = variance1 / variance2;
    
    return { f, variance1, variance2 };
  }, [sampleSize1, sampleSize2]);
  
  // Generate single sample
  const generateSingle = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setIsAnimatingVariance(true);
    
    const result = generateFStatistic();
    
    // Animate variance display
    setTimeout(() => {
      setLastVariances({ s1: result.variance1, s2: result.variance2 });
      setLastF(result.f);
      
      setTimeout(() => {
        setSamples(prev => [...prev, result.f]);
        setIsGenerating(false);
        setIsAnimatingVariance(false);
        
        // Progress tutorial if needed
        if (tutorialActive && tutorialStep === 4) {
          setTutorialStep(5);
        }
      }, 500);
    }, 300);
  }, [generateFStatistic, isGenerating, tutorialActive, tutorialStep]);
  
  // Generate many samples
  const generateMany = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const newSamples = [];
    
    for (let i = 0; i < 100; i++) {
      const result = generateFStatistic();
      newSamples.push(result.f);
    }
    
    // Animate addition
    let index = 0;
    const addBatch = () => {
      const batchSize = 10;
      const batch = newSamples.slice(index, index + batchSize);
      
      setSamples(prev => [...prev, ...batch]);
      
      index += batchSize;
      if (index < newSamples.length) {
        animationRef.current = setTimeout(addBatch, 100);
      } else {
        setIsGenerating(false);
        if (tutorialActive && tutorialStep === 5) {
          setTutorialStep(6);
        }
      }
    };
    
    addBatch();
  }, [generateFStatistic, isGenerating, tutorialActive, tutorialStep]);
  
  // Reset
  const reset = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setSamples([]);
    setLastF(null);
    setLastVariances({ s1: null, s2: null });
    setIsGenerating(false);
  }, []);
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth || 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background gradient
    const defs = svg.append("defs");
    const bgGradient = defs.append("radialGradient")
      .attr("id", "bg-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1e293b")
      .attr("stop-opacity", 0.8);
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 1);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xMax = Math.max(5, d3.max(samples) || 5, jStat.centralF.inv(0.99, df1, df2));
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);
    
    // Dynamic y scale
    let mode = 0;
    if (df1 > 2) {
      mode = ((df1 - 2) / df1) * (df2 / (df2 + 2));
    }
    const peakDensity = jStat.centralF.pdf(mode, df1, df2);
    const yMax = Math.min(2, peakDensity * 1.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
    
    // Grid
    const gridLines = g.append("g").attr("class", "grid");
    
    // X grid
    gridLines.selectAll(".x-grid")
      .data(xScale.ticks(10))
      .enter().append("line")
      .attr("class", "x-grid")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.3);
    
    // Y grid
    gridLines.selectAll(".y-grid")
      .data(yScale.ticks(8))
      .enter().append("line")
      .attr("class", "y-grid")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.3);
    
    // F-distribution curve
    const xValues = d3.range(0.01, xMax, 0.01);
    const curveData = xValues.map(x => ({
      x: x,
      y: jStat.centralF.pdf(x, df1, df2)
    }));
    
    // Area gradient
    const areaGradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.primary)
      .attr("stop-opacity", 0.6);
    
    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.secondary)
      .attr("stop-opacity", 0.2);
    
    // Draw area
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);
    
    // Draw curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("filter", "drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))");
    
    // Critical values
    if (showCriticalValues) {
      const alphas = [0.1, 0.05, 0.01];
      const colors = ['#f59e0b', '#ef4444', '#dc2626'];
      
      alphas.forEach((alpha, i) => {
        const critical = jStat.centralF.inv(1 - alpha, df1, df2);
        if (critical <= xMax) {
          // Critical region shading
          const criticalArea = curveData.filter(d => d.x >= critical);
          
          g.append("path")
            .datum(criticalArea)
            .attr("fill", colors[i])
            .attr("opacity", 0.2)
            .attr("d", area)
            .attr("class", tutorialStep === 7 ? "critical-region" : "");
          
          // Critical line
          g.append("line")
            .attr("x1", xScale(critical))
            .attr("x2", xScale(critical))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
          
          // Label
          g.append("text")
            .attr("x", xScale(critical))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", colors[i])
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(`α=${alpha}`);
        }
      });
    }
    
    // Histogram
    if (samples.length > 0) {
      const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(25);
      
      const bins = histogram(samples);
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
        .attr("fill", colorScheme.secondary)
        .attr("opacity", 0.7)
        .transition()
        .duration(300)
        .attr("y", d => yScale(d.length / totalArea))
        .attr("height", d => innerHeight - yScale(d.length / totalArea));
    }
    
    // Last F value indicator
    if (lastF !== null) {
      const indicator = g.append("g")
        .attr("class", "f-indicator")
        .attr("transform", `translate(${xScale(lastF)}, 0)`);
      
      // Animated line
      indicator.append("line")
        .attr("y1", innerHeight)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.accent)
        .attr("stroke-width", 3)
        .transition()
        .duration(500)
        .attr("y2", 0);
      
      // Pulse circle
      indicator.append("circle")
        .attr("cy", yScale(jStat.centralF.pdf(lastF, df1, df2)))
        .attr("r", 0)
        .attr("fill", colorScheme.accent)
        .attr("opacity", 0.8)
        .transition()
        .duration(300)
        .attr("r", 8)
        .transition()
        .duration(200)
        .attr("r", 5);
      
      // Value label
      indicator.append("text")
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.accent)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(`F = ${lastF.toFixed(2)}`)
        .transition()
        .delay(300)
        .duration(300)
        .attr("opacity", 1);
    }
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("F-value");
    
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Density");
    
    // Distribution info
    const info = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);
    
    info.append("rect")
      .attr("width", 140)
      .attr("height", 60)
      .attr("fill", "rgba(30, 41, 59, 0.9)")
      .attr("stroke", colorScheme.border)
      .attr("rx", 4);
    
    info.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", colorScheme.text.primary)
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text(`F(${df1}, ${df2})`);
    
    info.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("fill", colorScheme.text.secondary)
      .attr("font-size", "12px")
      .text(`n = ${samples.length}`);
    
  }, [df1, df2, samples, lastF, showCriticalValues, tutorialStep]);
  
  // Tutorial navigation
  const handleNextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialActive(false);
    }
  };
  
  const handlePrevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };
  
  // Handle tutorial actions
  useEffect(() => {
    if (!tutorialActive) return;
    
    const action = currentTutorial.action;
    if (action === 'show-critical' && tutorialStep === 6) {
      setShowCriticalValues(true);
      setTimeout(() => setTutorialStep(7), 1000);
    }
  }, [tutorialStep, tutorialActive, currentTutorial]);
  
  return (
    <VisualizationContainer
      title="4.5 F-Distribution Journey"
      subtitle="Learn by doing - compare variances step by step"
    >
      {/* Achievement Notification */}
      {showAchievement && (
        <AchievementNotification 
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
      
      {/* Tutorial Overlay */}
      {tutorialActive && (
        <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
          <StepIndicator currentStep={tutorialStep} totalSteps={tutorialSteps.length} />
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-white mb-2">
              {currentTutorial.title}
            </h3>
            <p className="text-gray-300">{currentTutorial.content}</p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={handlePrevStep}
              disabled={tutorialStep === 0}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              variant="default"
              size="sm"
            >
              {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main Visualization */}
        <div className="space-y-4">
          {/* Variance Animation (Step 1) */}
          {tutorialStep === 1 && tutorialActive && (
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all duration-300",
              currentTutorial.highlight.includes("variance-visual") 
                ? "border-teal-500 shadow-lg shadow-teal-500/20" 
                : "border-neutral-700"
            )}>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Variance Comparison Visual
              </h4>
              <VarianceAnimation isPlaying={tutorialStep === 1} />
            </div>
          )}
          
          {/* F-Distribution Chart */}
          <GraphContainer className="relative">
            <svg ref={svgRef} className="w-full h-full" />
            {isGenerating && (
              <div className="absolute top-4 right-4 bg-black/80 rounded-lg px-3 py-2">
                <span className="text-sm text-teal-400">Generating samples...</span>
              </div>
            )}
          </GraphContainer>
          
          {/* Formula Display (Step 2) */}
          {(tutorialStep === 2 || !tutorialActive) && (
            <div className={cn(
              "p-4 bg-neutral-800/50 rounded-lg transition-all duration-300",
              tutorialStep === 2 && currentTutorial.highlight.includes("f-formula")
                ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                : ""
            )}>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">The F-Statistic Formula</h4>
              <div className="text-center">
                <span className="text-2xl font-mono text-teal-400">
                  F = S₁² / S₂²
                </span>
                {lastVariances.s1 && lastVariances.s2 && (
                  <div className="mt-2 text-sm text-gray-400">
                    = {lastVariances.s1.toFixed(3)} / {lastVariances.s2.toFixed(3)} = {lastF?.toFixed(3)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Degrees of Freedom Controls */}
          <VisualizationSection 
            className={cn(
              "p-4 transition-all duration-300",
              tutorialStep === 3 && currentTutorial.highlight.includes("df-controls")
                ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                : ""
            )}
          >
            <h3 className="text-base font-bold text-white mb-3">Sample Sizes</h3>
            <div className="space-y-3">
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Sample 1: n₁ = {sampleSize1}</span>
                  <span className="text-xs text-gray-500">df₁ = {df1}</span>
                </label>
                <RangeSlider
                  value={sampleSize1}
                  onChange={setSampleSize1}
                  min={3}
                  max={30}
                  step={1}
                />
              </div>
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Sample 2: n₂ = {sampleSize2}</span>
                  <span className="text-xs text-gray-500">df₂ = {df2}</span>
                </label>
                <RangeSlider
                  value={sampleSize2}
                  onChange={setSampleSize2}
                  min={3}
                  max={30}
                  step={1}
                />
              </div>
            </div>
          </VisualizationSection>
          
          {/* Action Buttons */}
          <VisualizationSection className="p-4">
            <h3 className="text-base font-bold text-white mb-3">Generate Samples</h3>
            <div className="space-y-2">
              <Button
                onClick={generateSingle}
                disabled={isGenerating}
                className={cn(
                  "w-full transition-all duration-300",
                  tutorialStep === 4 && currentTutorial.highlight.includes("generate-button")
                    ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                    : ""
                )}
              >
                <Play className="w-4 h-4 mr-2" />
                Generate F-statistic
              </Button>
              
              <Button
                onClick={generateMany}
                disabled={isGenerating}
                variant="secondary"
                className={cn(
                  "w-full transition-all duration-300",
                  tutorialStep === 5 && currentTutorial.highlight.includes("generate-many-button")
                    ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                    : ""
                )}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 100 Samples
              </Button>
              
              <Button
                onClick={reset}
                disabled={samples.length === 0}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </VisualizationSection>
          
          {/* Variance Display */}
          {lastVariances.s1 && lastVariances.s2 && (
            <VisualizationSection className="p-4">
              <h3 className="text-base font-bold text-white mb-3">Last Sample Variances</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">S₁²:</span>
                  <span className={cn(
                    "font-mono transition-all duration-500",
                    isAnimatingVariance ? "text-teal-300 scale-110" : "text-teal-400"
                  )}>
                    {lastVariances.s1.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">S₂²:</span>
                  <span className={cn(
                    "font-mono transition-all duration-500",
                    isAnimatingVariance ? "text-blue-300 scale-110" : "text-blue-400"
                  )}>
                    {lastVariances.s2.toFixed(3)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-700 flex justify-between">
                  <span className="text-sm text-gray-400">F-statistic:</span>
                  <span className={cn(
                    "font-mono font-bold transition-all duration-500",
                    isAnimatingVariance ? "text-yellow-300 scale-110" : "text-yellow-400"
                  )}>
                    {lastF?.toFixed(3)}
                  </span>
                </div>
              </div>
            </VisualizationSection>
          )}
          
          {/* Options */}
          <VisualizationSection 
            className={cn(
              "p-4 transition-all duration-300",
              tutorialStep === 6 && currentTutorial.highlight.includes("critical-toggle")
                ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                : ""
            )}
          >
            <h3 className="text-base font-bold text-white mb-3">Visualization Options</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCriticalValues}
                onChange={(e) => setShowCriticalValues(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Critical Values</span>
            </label>
          </VisualizationSection>
          
          {/* Statistics */}
          {samples.length > 0 && (
            <StatsDisplay
              stats={[
                { 
                  label: "Samples", 
                  value: samples.length, 
                  color: colorScheme.primary 
                },
                { 
                  label: "Mean F", 
                  value: formatNumber(jStat.mean(samples)), 
                  color: colorScheme.secondary 
                },
                { 
                  label: "Expected", 
                  value: df2 > 2 ? formatNumber(df2 / (df2 - 2)) : "∞", 
                  color: colorScheme.accent 
                }
              ]}
            />
          )}
          
          {/* Progress Indicator */}
          <div className="text-center text-sm text-gray-500">
            {samples.length === 0 && "Generate samples to begin"}
            {samples.length > 0 && samples.length < 30 && `${samples.length}/30 samples for pattern`}
            {samples.length >= 30 && samples.length < 100 && `${samples.length}/100 for convergence`}
            {samples.length >= 100 && "Distribution converged! 🎉"}
          </div>
        </div>
      </div>
      
      {/* Tutorial Controls */}
      {!tutorialActive && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => {
              setTutorialActive(true);
              setTutorialStep(0);
              reset();
            }}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Tutorial
          </Button>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default FDistributionJourney;