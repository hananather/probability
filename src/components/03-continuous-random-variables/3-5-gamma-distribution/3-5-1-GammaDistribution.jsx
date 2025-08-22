"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer, VisualizationSection } from "../../ui/VisualizationContainer";
import { Button } from "../../ui/button";
import { ProgressBar, ProgressNavigation } from "../../ui/ProgressBar";
import { useMathJax } from '@/hooks/useMathJax';
import { createColorScheme, typography } from "../../../lib/design-system";
import { jStat } from "jstat";
import { Tutorial } from "../../ui/Tutorial";
import { Clock, Zap, ChartBar, Target } from "lucide-react";
import { tutorial_3_5_1 } from '@/tutorials/chapter3';
import BackToHub from '../../ui/BackToHub';

const GammaDistribution = React.memo(function GammaDistribution() {
  // Core state
  const [stage, setStage] = useState(1);
  const totalStages = 4;
  const [shape, setShape] = useState(2);
  const [rate, setRate] = useState(1);
  
  // Refs
  const mainSvgRef = useRef(null);
  
  // Color scheme - memoized to prevent unnecessary re-renders
  const colors = useMemo(() => createColorScheme('probability'), []);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && stage > 1) {
      e.preventDefault();
      setStage(Math.max(1, stage - 1));
    } else if (e.key === 'ArrowRight' && stage < totalStages) {
      e.preventDefault();
      setStage(Math.min(totalStages, stage + 1));
    }
  }, [stage, totalStages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Derived values
  const scale = 1 / rate;
  const mean = shape * scale;
  const variance = shape * scale * scale;
  const stdDev = Math.sqrt(variance);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to the Gamma Distribution",
      content: "Learn how waiting times for multiple events create the Gamma distribution.",
    },
    {
      target: ".progress-bar",
      title: "Follow Your Progress",
      content: "Work through 4 stages to master the Gamma distribution.",
      position: "bottom"
    },
    {
      target: ".main-visualization",
      title: "Interactive Visualization",
      content: "Watch how the distribution changes as you adjust parameters.",
      position: "left"
    }
  ];
  
  const contentRef = useMathJax([shape, rate, stage]);
  
  // Main visualization
  useEffect(() => {
    if (!mainSvgRef.current) return;
    
    const containerWidth = mainSvgRef.current.getBoundingClientRect().width;
    const containerHeight = 500;
    const margin = { top: 40, right: 60, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous
    d3.select(mainSvgRef.current).selectAll("*").remove();
    
    const svg = d3.select(mainSvgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xMax = Math.min(20, mean + 3 * stdDev);
    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
    
    // Generate PDF data
    const data = [];
    const step = xMax / 300;
    let yMax = 0;
    
    for (let i = 0; i <= xMax; i += step) {
      const yValue = jStat.gamma.pdf(i, shape, scale);
      if (!isNaN(yValue) && isFinite(yValue) && yValue >= 0) {
        data.push({ x: i, y: yValue });
        yMax = Math.max(yMax, yValue);
      }
    }
    
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height, 0]);
    
    // Grid lines with better visibility
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#e5e7eb");
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#e5e7eb");
    
    // Axes with better visibility
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    xAxis.selectAll("text")
      .attr("fill", "#f3f4f6")
      .style("font-size", "12px");
    xAxis.selectAll("line")
      .style("stroke", "#e5e7eb");
    xAxis.select(".domain")
      .style("stroke", "#e5e7eb");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(y));
    
    yAxis.selectAll("text")
      .attr("fill", "#f3f4f6")
      .style("font-size", "12px");
    yAxis.selectAll("line")
      .style("stroke", "#e5e7eb");
    yAxis.select(".domain")
      .style("stroke", "#e5e7eb");
    
    // Labels with better visibility
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#f3f4f6")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Time");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#f3f4f6")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Probability Density");
    
    // Create gradient for area fill
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "gamma-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.7);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.2);
    
    // Area under curve with gradient
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height)
      .y1(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data)
      .attr("fill", "url(#gamma-gradient)")
      .attr("d", area);
    
    // Main curve with vibrant color
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("opacity", 0.95)
      .attr("d", line);
    
    // Animate
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);
    
    // Mean line with better color
    if (mean <= xMax) {
      g.append("line")
        .attr("x1", x(mean))
        .attr("x2", x(mean))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "5,3")
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .attr("opacity", 0.9);
      
      g.append("text")
        .attr("x", x(mean))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#fbbf24")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(`μ = ${mean.toFixed(1)}`)
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .attr("opacity", 1);
    }
    
    
  }, [shape, rate, stage, colors]);
  
  // Stage content
  const getStageContent = () => {
    switch(stage) {
      case 1:
        return (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-emerald-400 mb-6">Stage 1: Intuitive Understanding</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-2">Core Concept</h4>
                  <p className="text-sm text-gray-300">
                    The Gamma distribution represents a fundamental concept in probability theory: the waiting time for multiple events 
                    in processes where events occur at random intervals. Unlike the exponential distribution, which models the time until 
                    the first event, the Gamma distribution generalizes this to model the time until the k-th event occurs, where k can 
                    be any positive real number.
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-2">Flexibility & Power</h4>
                  <p className="text-sm text-gray-300">
                    The distribution's intuitive appeal lies in its ability to capture the natural asymmetry found in many real-world 
                    phenomena. When modeling times, durations, or magnitudes that cannot be negative but can vary widely, the Gamma 
                    distribution provides a mathematical framework that accommodates both the constraint of positivity and the 
                    often-observed right-skewed nature of such data.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Real-World Applications</h4>
                  <p className="text-sm text-blue-300">
                    In reliability engineering, the Gamma distribution models component lifetimes, capturing the "burn-in" period 
                    where components may fail early, followed by stable operation, and eventually increasing failure rates due to 
                    wear. In queuing theory, it models waiting times in multi-stage processes. Environmental scientists use it for 
                    rainfall intensity and pollutant concentrations, while actuaries apply it to insurance claim sizes.
                  </p>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Parameter Roles</h4>
                  <p className="text-sm text-green-300">
                    The shape parameter α controls how quickly the distribution rises from zero and how heavy its tail becomes, 
                    while the scale parameter θ stretches or compresses the entire distribution along the horizontal axis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-400 mb-6">Stage 2: Mathematical Connections</h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Sum of Exponentials</h4>
                  <p className="text-sm text-gray-300">
                    The Gamma distribution emerges naturally from the sum of independent exponential random variables. This fundamental 
                    connection provides both theoretical insight and practical utility. When k independent exponential waiting times, 
                    each with rate parameter λ, are added together, their sum follows a Gamma distribution with shape parameter k and 
                    rate parameter λ.
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Poisson Process Connection</h4>
                  <p className="text-sm text-gray-300">
                    Consider a Poisson process with rate λ, where events occur independently at random times. The waiting time until 
                    the k-th event follows a Gamma distribution with shape k and rate λ. This derivation directly connects the Gamma 
                    distribution to fundamental stochastic processes and explains its prevalence in queuing theory and reliability analysis.
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-700/30">
                <h4 className="text-sm font-semibold text-purple-400 mb-3">Interactive Shape Parameter</h4>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 5].map(k => (
                    <Button
                      key={k}
                      variant={shape === k ? "primary" : "neutral"}
                      size="sm"
                      onClick={() => setShape(k)}
                    >
                      Shape k = {k}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-purple-300">
                  As you adjust k, observe how the distribution transforms. For k=1, we have the exponential distribution 
                  (memoryless waiting time). As k increases, the distribution becomes more symmetric and bell-shaped, 
                  approaching a normal distribution for large k due to the central limit theorem. The mode shifts rightward 
                  as (k-1)/λ, creating the characteristic right-skewed shape that models so many natural phenomena.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">Stage 3: Parameter Deep Dive</h3>
            
            {/* Parameter explanation */}
            <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-300">
                The Gamma distribution's flexibility stems from its two parameters, each controlling distinct aspects of the 
                distribution's behavior. The shape parameter α fundamentally alters the distribution's form: for 0 &lt; α &lt; 1, 
                the density is strictly decreasing from infinity at zero (reverse J-shape), modeling processes with highest 
                probability near zero. When α = 1, we obtain the exponential distribution. For α &gt; 1, the distribution becomes 
                unimodal with mode at (α-1)θ, creating the familiar right-skewed bell shape.
              </p>
            </div>
            
            {/* Controls Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Parameter Controls */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-300">
                    Shape Parameter (α or k) = {shape.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={shape}
                    onChange={(e) => setShape(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Controls distribution shape: {shape < 1 ? "Reverse J-shape (decreasing)" : shape === 1 ? "Exponential (memoryless)" : "Bell-shaped with mode at " + ((shape-1)/rate).toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-300">
                    Rate Parameter (λ) = {rate.toFixed(1)} | Scale (θ = 1/λ) = {scale.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Stretches/compresses horizontally. Higher rate → events occur faster → distribution shifts left
                  </p>
                </div>
              </div>
              
              {/* Statistics and Insights */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Mean = α/λ</p>
                    <p className="text-lg font-mono text-emerald-400">{mean.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Std Dev = √(α)/λ</p>
                    <p className="text-lg font-mono text-blue-400">{stdDev.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Variance = α/λ²</p>
                    <p className="text-lg font-mono text-purple-400">{variance.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400">Mode</p>
                    <p className="text-lg font-mono text-orange-400">{shape > 1 ? ((shape-1)/rate).toFixed(2) : "0"}</p>
                  </div>
                </div>
                
                <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-700/30">
                  <p className="text-xs text-amber-300">
                    <strong>Hazard Function Insight:</strong> The shape parameter determines failure patterns. 
                    α &lt; 1: decreasing hazard (infant mortality), α = 1: constant hazard (random failures), 
                    α &gt; 1: increasing hazard (wear-out). Coefficient of variation = 1/√α decreases with α.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-purple-400 mb-6">Stage 4: Mathematical Foundation</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">The Gamma Function</h4>
                  <p className="text-sm text-gray-300">
                    The distribution's foundation rests on the Gamma function Γ(α) = ∫₀^∞ t^(α-1)e^(-t)dt, which extends the 
                    factorial concept to real numbers with the property Γ(n) = (n-1)! for positive integers. This function 
                    provides the normalization constant ensuring the PDF integrates to unity.
                  </p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Probability Density Function</h4>
                  <div className="text-center py-2" ref={contentRef}>
                    <span dangerouslySetInnerHTML={{ 
                      __html: `\\[f(x; \\alpha, \\theta) = \\frac{1}{\\Gamma(\\alpha)\\theta^\\alpha} x^{\\alpha-1} e^{-x/\\theta}\\]` 
                    }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Alternative: f(x) = (β^α/Γ(α))x^(α-1)e^(-βx) where β = 1/θ
                  </p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Statistical Properties</h4>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">MGF:</span>
                      <span className="text-gray-300 font-mono">M(t) = (1 - θt)^(-α)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mean:</span>
                      <span className="text-emerald-400 font-mono">{mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Variance:</span>
                      <span className="text-blue-400 font-mono">{variance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Skewness:</span>
                      <span className="text-yellow-400 font-mono">{(2/Math.sqrt(shape)).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Excess Kurtosis:</span>
                      <span className="text-purple-400 font-mono">{(6/shape).toFixed(3)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <h4 className="text-xs font-semibold text-green-400 mb-2">Reproductive Property</h4>
                  <p className="text-xs text-green-300">
                    If X₁ ~ Gamma(α₁, θ) and X₂ ~ Gamma(α₂, θ) are independent, 
                    then X₁ + X₂ ~ Gamma(α₁ + α₂, θ).
                  </p>
                </div>
                
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700/30">
                  <h4 className="text-xs font-semibold text-blue-400 mb-2">Special Cases</h4>
                  <ul className="text-xs text-blue-300 space-y-1">
                    <li>• χ²(ν) = Gamma(ν/2, 2)</li>
                    <li>• Exponential(λ) = Gamma(1, 1/λ)</li>
                    <li>• Erlang(k, λ) = Gamma(k, 1/λ), k ∈ ℤ⁺</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <VisualizationContainer 
      title="Understanding the Gamma Distribution"
      className="max-w-7xl mx-auto"
      tutorialSteps={tutorial_3_5_1}
      tutorialKey="gamma-distribution-3-5-1"
    >
      <BackToHub />
      <Tutorial
        steps={tutorialSteps}
        persistKey="gamma-distribution-simplified"
      />
      
      <div className="space-y-6">
        {/* Progress */}
        <div className="progress-bar">
          <ProgressBar
            current={stage}
            total={totalStages}
            label="Learning Progress"
            variant="orange"
          />
          <ProgressNavigation
            current={stage}
            total={totalStages}
            onPrevious={() => setStage(Math.max(1, stage - 1))}
            onNext={() => setStage(Math.min(totalStages, stage + 1))}
            variant="orange"
            className="mt-3"
          />
          
          {/* Keyboard Hint */}
          <div className="mt-2 text-center">
            <p className="text-xs text-neutral-500">
              Tip: Use <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">←</kbd> and{' '}
              <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">→</kbd> arrow keys to navigate
            </p>
          </div>
        </div>
        
        {/* Stage Content - Full Width */}
        <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
          {getStageContent()}
        </VisualizationSection>
        
        {/* Visualization */}
        <VisualizationSection className="bg-neutral-800/50 rounded-lg p-6">
          <div className="main-visualization">
            <svg ref={mainSvgRef} style={{ width: '100%', height: '500px' }}></svg>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
});

export default GammaDistribution;