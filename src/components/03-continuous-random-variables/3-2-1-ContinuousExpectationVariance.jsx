"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from '../ui/RangeSlider';
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { jStat } from "jstat";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { Info, TrendingUp, Calculator, BarChart3 } from 'lucide-react';
import { tutorial_3_2_1 } from '@/tutorials/chapter3';
import BackToHub from '../ui/BackToHub';

// Memoized LaTeX components to prevent re-rendering
const FormulaDisplay = React.memo(function FormulaDisplay({ formula, color = "text-white", className = "" }) {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [formula]);
  
  return (
    <div ref={contentRef} className={cn("text-sm", color, className)}>
      <span dangerouslySetInnerHTML={{ __html: formula }} />
    </div>
  );
});

const ContinuousExpectationVariance = () => {
  // Use the same beautiful colors from Linear Transformations
  const colors = {
    discrete: '#3B82F6',      // Bright blue for discrete
    continuous: '#10B981',    // Bright green for continuous
    expectation: '#F59E0B',   // Amber for expectation lines
    variance: '#8B5CF6',      // Purple for variance
    text: '#E5E7EB',         // Light gray for text
    grid: '#4B5563',         // Medium gray for grid
    background: '#1F2937'     // Dark gray for backgrounds
  };
  
  // Refs for D3 visualizations
  const sideBySideRef = useRef(null);
  
  // Learning progression state - simplified to 3 main stages
  const [stage, setStage] = useState(0);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && stage > 0) {
      e.preventDefault();
      setStage(Math.max(0, stage - 1));
    } else if (e.key === 'ArrowRight' && stage < 2) {  // 3 stages total (0-2)
      e.preventDefault();
      setStage(Math.min(2, stage + 1));
    }
  }, [stage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Animation states
  const [animating, setAnimating] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0); // 0 = discrete, 1 = continuous
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Using normal distribution for both discrete and continuous
  // Discrete: sample normal at fixed points
  const discreteValues = [-2, -1, 0, 1, 2];
  const normalPDF = (x, mu = 0, sigma = 1) => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };
  
  // Calculate discrete probabilities using proper discretization
  // For each discrete value, integrate over a unit interval centered at that value
  const discreteProbs = discreteValues.map(x => {
    // Use jStat to calculate P(x - 0.5 < X < x + 0.5) for standard normal
    const lowerBound = x - 0.5;
    const upperBound = x + 0.5;
    // Calculate probability mass by integrating over the interval
    const prob = jStat.normal.cdf(upperBound, 0, 1) - jStat.normal.cdf(lowerBound, 0, 1);
    return prob;
  });
  
  // These probabilities already sum to approximately 1 (within the range we're considering)
  // But normalize to ensure exact sum = 1
  const probSum = discreteProbs.reduce((a, b) => a + b, 0);
  const normalizedProbs = discreteProbs.map(p => p / probSum);
  
  // Calculate expectations
  const discreteExpectation = discreteValues.reduce((sum, val, i) => sum + val * normalizedProbs[i], 0);
  const continuousExpectation = 0; // For standard normal
  
  // Simplified stage content - 3 main stages
  const stages = [
    {
      title: "From Discrete Sum to Continuous Integral",
      subtitle: "How expectation extends from countable to uncountable",
      description: "When we have infinite possibilities, we replace discrete sums with continuous integrals. The core concept remains: weighted average of all possible values.",
      discreteFormula: "\\(E[X] = \\sum_{i} x_i \\cdot P(X = x_i)\\)",
      continuousFormula: "\\(E[X] = \\int_{-\\infty}^{\\infty} x \\cdot f(x) \\, dx\\)",
      highlight: 'expectation'
    },
    {
      title: "Calculating Expectation: Side by Side",
      subtitle: "See how the calculations parallel each other",
      description: "Compare discrete summation and continuous integration for finding expected values.",
      highlight: 'calculation',
      showCalculations: true
    },
    {
      title: "Putting It All Together",
      subtitle: "Watch the transition from discrete to continuous",
      description: "See how increasing the number of discrete points approaches the continuous distribution.",
      highlight: 'animation',
      showAnimation: true
    }
  ];
  
  const currentStage = stages[stage];
  
  // Animation function - smoothly transition visualization
  const animateTransition = useCallback(() => {
    if (animating) return;
    
    setAnimating(true);
    setAnimationComplete(false);
    setTransitionProgress(0);
    
    const duration = 4000; // Slower animation
    const steps = 120;
    let currentStep = 0;
    
    const timer = d3.interval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Use easing function for smooth animation
      const easedProgress = d3.easeCubicInOut(progress);
      setTransitionProgress(easedProgress);
      
      if (currentStep >= steps) {
        timer.stop();
        setAnimating(false);
        setAnimationComplete(true);
        // Don't reset - stay at continuous state
      }
    }, duration / steps);
    
    return () => timer.stop();
  }, [animating]);
  
  // Reset animation
  const resetAnimation = useCallback(() => {
    setTransitionProgress(0);
    setAnimationComplete(false);
  }, []);
  
  // Main visualization effect - always show side by side
  useEffect(() => {
    if (!sideBySideRef.current) return;
    
    const svg = d3.select(sideBySideRef.current);
    const { width } = sideBySideRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 50, right: 20, bottom: 80, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Create panels - adjust based on animation
    const fullWidth = width - margin.left - margin.right;
    const panelWidth = animating && stage === 2 ? fullWidth : (fullWidth - 40) / 2;
    const innerHeight = height - margin.top - margin.bottom;
    
    // When animating, show morphing in center; otherwise show side-by-side
    let discreteG, continuousG;
    
    if (animating && stage === 2) {
      // During animation, center everything
      const centerG = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create morphing visualization from discrete to continuous normal
      const numBars = Math.floor(5 + 95 * transitionProgress); // Start with 5, end with 100
      const morphData = [];
      
      if (transitionProgress < 0.5) {
        // First half: animate discrete bars getting more numerous
        const barPositions = [];
        for (let i = 0; i < numBars; i++) {
          const x = -3 + (6 * i / (numBars - 1));
          barPositions.push(x);
        }
        
        barPositions.forEach(x => {
          morphData.push({
            x: x,
            height: normalPDF(x),
            width: 6 / numBars * 0.8
          });
        });
      } else {
        // Second half: bars approach continuous curve
        for (let i = 0; i < numBars; i++) {
          const x = -3 + (6 * i / (numBars - 1));
          morphData.push({
            x: x,
            height: normalPDF(x),
            width: 6 / numBars * (1 - (transitionProgress - 0.5) * 1.6)
          });
        }
      }
      
      const xScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([0, fullWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([innerHeight, 0]);
      
      // Draw morphing bars
      centerG.selectAll("rect.morph-bar")
        .data(morphData)
        .join("rect")
        .attr("class", "morph-bar")
        .attr("x", d => xScale(d.x) - xScale(0) * d.width / 6)
        .attr("y", d => yScale(d.height))
        .attr("width", d => xScale(0) * d.width / 3)
        .attr("height", d => innerHeight - yScale(d.height))
        .attr("fill", d3.interpolateRgb(colors.discrete, colors.continuous)(transitionProgress))
        .attr("opacity", 0.7 + 0.1 * transitionProgress)
        .attr("rx", 4 * (1 - transitionProgress));
      
      // Add continuous curve overlay when near the end
      if (transitionProgress > 0.7) {
        const curveData = d3.range(-3, 3.1, 0.1).map(x => ({ x, y: normalPDF(x) }));
        const line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveBasis);
        
        centerG.append("path")
          .datum(curveData)
          .attr("fill", "none")
          .attr("stroke", colors.continuous)
          .attr("stroke-width", 3)
          .attr("opacity", (transitionProgress - 0.7) / 0.3)
          .attr("d", line);
      }
      
      // Add title that morphs
      centerG.append("text")
        .attr("x", fullWidth / 2)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .attr("fill", d3.interpolateRgb(colors.discrete, colors.continuous)(transitionProgress))
        .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .text(transitionProgress < 0.5 ? "Discrete → Continuous" : "Approaching Continuous");
      
      // Add axes
      centerG.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("fill", colors.text);
      
      centerG.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text")
        .style("fill", colors.text);
      
      return; // Skip normal rendering during animation
    }
    
    // Normal side-by-side view
    discreteG = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    continuousG = svg.append("g")
      .attr("transform", `translate(${margin.left + panelWidth + 40},${margin.top})`);
    
    // Draw discrete distribution
    const discreteXScale = d3.scaleLinear()
      .domain([-3, 3])
      .range([0, panelWidth]);
    
    const discreteYScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    const barWidth = panelWidth / 8; // Width for discrete bars
    
    // Discrete grid
    discreteG.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(discreteYScale)
        .ticks(5)
        .tickSize(-panelWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .selectAll("line")
      .style("stroke", colors.grid);
    
    // Discrete bars with hover effects
    const discreteBars = discreteG.selectAll("rect")
      .data(discreteValues)
      .join("rect")
      .attr("x", (d, i) => discreteXScale(d) - barWidth / 2)
      .attr("y", (d, i) => discreteYScale(normalizedProbs[i]))
      .attr("width", barWidth)
      .attr("height", (d, i) => innerHeight - discreteYScale(normalizedProbs[i]))
      .attr("fill", colors.discrete)
      .attr("opacity", 0.7)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
      });
    
    // Discrete bar labels - only show in calculation stage
    if (currentStage.highlight === 'calculation') {
      discreteG.selectAll("text.bar-label")
        .data(discreteValues)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => discreteXScale(d))
        .attr("y", (d, i) => discreteYScale(normalizedProbs[i]) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.text)
        .attr("font-size", "11px")
        .style("font-weight", "500")
        .text((d, i) => `${d}×${normalizedProbs[i].toFixed(2)}`);
    }
    
    // Discrete axes
    discreteG.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(discreteXScale).ticks(5))
      .selectAll("text")
      .style("fill", colors.text);
    
    discreteG.append("g")
      .call(d3.axisLeft(discreteYScale).ticks(5))
      .selectAll("text")
      .style("fill", colors.text);
    
    // Discrete title
    discreteG.append("text")
      .attr("x", panelWidth / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("fill", colors.discrete)
      .attr("font-weight", "bold")
      .attr("font-size", "16px")
      .text("Discrete: Sum");
    
    // Draw continuous distribution (normal)
    const continuousXScale = d3.scaleLinear()
      .domain([-3, 3])
      .range([0, panelWidth]);
    
    const continuousYScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Continuous grid
    continuousG.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(continuousYScale)
        .ticks(5)
        .tickSize(-panelWidth)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .selectAll("line")
      .style("stroke", colors.grid);
    
    // Normal distribution curve
    const curveData = d3.range(-3, 3.1, 0.05).map(x => ({ x, y: normalPDF(x) }));
    const line = d3.line()
      .x(d => continuousXScale(d.x))
      .y(d => continuousYScale(d.y))
      .curve(d3.curveBasis);
    
    // Fill area under curve
    const area = d3.area()
      .x(d => continuousXScale(d.x))
      .y0(innerHeight)
      .y1(d => continuousYScale(d.y))
      .curve(d3.curveBasis);
    
    continuousG.append("path")
      .datum(curveData)
      .attr("fill", colors.continuous)
      .attr("opacity", 0.3)
      .attr("d", area);
    
    continuousG.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", colors.continuous)
      .attr("stroke-width", 3)
      .attr("opacity", 0.9)
      .attr("d", line);
    
    // Continuous axes
    continuousG.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(continuousXScale).ticks(5))
      .selectAll("text")
      .style("fill", colors.text);
    
    continuousG.append("g")
      .call(d3.axisLeft(continuousYScale).ticks(5).tickFormat(d => d.toFixed(2)))
      .selectAll("text")
      .style("fill", colors.text);
    
    // Continuous title
    continuousG.append("text")
      .attr("x", panelWidth / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("fill", colors.continuous)
      .attr("font-weight", "bold")
      .attr("font-size", "16px")
      .text("Continuous: Integral");
    
    // Add mean lines if showing expectation or calculation
    if (currentStage.highlight === 'expectation' || currentStage.highlight === 'calculation') {
      // Discrete mean line
      discreteG.append("line")
        .attr("x1", discreteXScale(discreteExpectation))
        .attr("x2", discreteXScale(discreteExpectation))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.expectation)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);
      
      discreteG.append("text")
        .attr("x", discreteXScale(discreteExpectation))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.expectation)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`E[X] ≈ ${discreteExpectation.toFixed(2)}`);
      
      // Continuous mean line
      continuousG.append("line")
        .attr("x1", continuousXScale(continuousExpectation))
        .attr("x2", continuousXScale(continuousExpectation))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.expectation)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);
      
      continuousG.append("text")
        .attr("x", continuousXScale(continuousExpectation))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.expectation)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`E[X] = ${continuousExpectation}`);
    }
    
  }, [stage, currentStage, animating, transitionProgress, normalizedProbs]);
  
  return (
    <VisualizationContainer 
      title="From Discrete to Continuous: Expectation & Variance"
      subtitle="Understanding how summation becomes integration"
      tutorialSteps={tutorial_3_2_1}
      tutorialKey="continuous-expectation-variance-3-2-1"
    >
      <BackToHub />
      <div className="space-y-6">
        {/* Progress Bar */}
        <ProgressBar
          current={stage + 1}
          total={stages.length}
          label="Learning Progress"
          variant="teal"
        />
        
        {/* Navigation Buttons */}
        <ProgressNavigation
          current={stage + 1}
          total={stages.length}
          onPrevious={() => setStage(Math.max(0, stage - 1))}
          onNext={() => setStage(Math.min(stages.length - 1, stage + 1))}
          variant="teal"
        />
        
        {/* Keyboard Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-neutral-500">
            Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
          </p>
        </div>
      
      {/* Stage Content */}
      <VisualizationSection className="mb-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{currentStage.title}</h2>
            <p className="text-sm text-gray-400">{currentStage.subtitle}</p>
          </div>
          
          <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <p className="text-sm text-gray-300 mb-4">{currentStage.description}</p>
            
            {/* Stage-specific formulas */}
            {stage === 0 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">DISCRETE</p>
                    <FormulaDisplay formula={currentStage.discreteFormula} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">CONTINUOUS</p>
                    <FormulaDisplay formula={currentStage.continuousFormula} />
                  </div>
                </div>
              </div>
            )}
            
            {stage === 1 && currentStage.showCalculations && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">DISCRETE CALCULATION</p>
                    <FormulaDisplay 
                      formula={`\\(\\begin{align}E[X] &= (-2)\\cdot${normalizedProbs[0].toFixed(2)} + (-1)\\cdot${normalizedProbs[1].toFixed(2)} \\\\ &\\quad + 0\\cdot${normalizedProbs[2].toFixed(2)} + 1\\cdot${normalizedProbs[3].toFixed(2)} + 2\\cdot${normalizedProbs[4].toFixed(2)} \\\\ &\\approx ${discreteExpectation.toFixed(2)}\\end{align}\\)`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">CONTINUOUS CALCULATION</p>
                    <FormulaDisplay 
                      formula={`\\(E[X] = \\int_{-\\infty}^{\\infty} x \\cdot \\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2} dx = 0\\)`} 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {stage === 2 && (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  {!animationComplete ? (
                    <Button
                      onClick={() => animateTransition()}
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      disabled={animating}
                    >
                      {animating ? 'Animating...' : 'Start Animation'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => resetAnimation()}
                      variant="primary"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Replay Animation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </VisualizationSection>
      
      {/* Main Visualization - Always Side by Side */}
      <GraphContainer className="mb-6">
        <svg ref={sideBySideRef} className="w-full" />
      </GraphContainer>
      
      
      {/* Key Insight Box */}
      <div className="mt-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
        <p className="text-sm text-amber-400 flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span className="font-semibold">Key Insight:</span>
        </p>
        <p className="text-sm text-gray-300 mt-1">
          {stage === 0 && "The integral is the continuous analog of the sum. Both compute weighted averages of all possible values."}
          {stage === 1 && "Notice how the discrete sum approximates the continuous integral. As we add more discrete points, we approach the true value."}
          {stage === 2 && "As we increase the number of discrete points, the histogram approaches the smooth continuous curve. This is the fundamental bridge from discrete to continuous."}
        </p>
      </div>
      </div>
    </VisualizationContainer>
  );
};

export default ContinuousExpectationVariance;