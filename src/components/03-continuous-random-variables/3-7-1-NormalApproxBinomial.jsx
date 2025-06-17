"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { createColorScheme, typography, cn } from "../../lib/design-system";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { jStat } from "jstat";
import { NormalApproxBinomialWorkedExample } from "./3-7-2-NormalApproxBinomialWorkedExample";
import { Tutorial } from "../ui/Tutorial";
import { ProgressBar, ProgressNavigation } from "../ui/ProgressBar";
import { Button } from "../ui/button";
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { tutorial_3_7_1 } from '@/tutorials/chapter3';

// Add custom styles for the sliders
const sliderStyles = `
  .slider-teal::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #10B981;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
  .slider-amber::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #F59E0B;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
  .slider-orange::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #F97316;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
  .slider-teal::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #10B981;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
  .slider-amber::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #F59E0B;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
  .slider-orange::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #F97316;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`;

const NormalApproxBinomial = React.memo(function NormalApproxBinomial() {
  // Core parameter states
  const [n, setN] = useState(50);
  const [p, setP] = useState(0.5);
  const [k, setK] = useState(25);
  const [probType, setProbType] = useState("le"); // le, ge, eq
  const [showCC, setShowCC] = useState(true);
  const [stage, setStage] = useState(1); // Learning stages 1-4
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  
  // Refs for D3 and content
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Inject custom slider styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = sliderStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);
  
  // Color scheme - use distinct colors for clarity
  const colors = createColorScheme('hypothesis'); // Teal/Amber/Orange for better contrast
  
  // Calculate Normal approximation parameters
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  const variance = n * p * (1 - p);
  
  // Rule of thumb check with both conditions
  const np = n * p;
  const nq = n * (1 - p);
  const condition1Met = np >= 5;
  const condition2Met = nq >= 5;
  const ruleOfThumbMet = condition1Met && condition2Met;
  
  // Ensure k is within bounds
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      if (k > n) setK(n);
      if (k < 0) setK(0);
    }
    
    return () => { mounted = false; };
  }, [n, k]);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Normal Approximation!",
      content: (
        <div className="space-y-2">
          <p>When working with binomial distributions for large n, exact calculations become tedious.</p>
          <p className="font-semibold text-teal-400">The normal distribution can approximate binomial probabilities!</p>
          <p>Let's explore when and how this powerful technique works.</p>
        </div>
      )
    },
    {
      target: ".parameter-controls",
      title: "Set Your Parameters",
      content: "Start by adjusting n (number of trials) and p (probability of success). Watch how the distributions change!",
      position: "right"
    },
    {
      target: ".rule-of-thumb",
      title: "Rule of Thumb",
      content: "The approximation works best when both np ≥ 5 and n(1-p) ≥ 5. Green checkmarks mean good approximation!",
      position: "left"
    },
    {
      target: ".visualization-area",
      title: "Visual Comparison",
      content: "Blue bars show exact binomial probabilities. The orange curve is the normal approximation. Notice how they align!",
      position: "top"
    }
  ];
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [n, p, k, probType, showCC, stage]);
  
  // Calculate probabilities
  const calculateProbabilities = () => {
    let binomialProb = 0;
    let normalProb = 0;
    let zScore = 0;
    let correctedK = k;
    
    switch (probType) {
      case "le": // P(X ≤ k)
        binomialProb = jStat.binomial.cdf(k, n, p);
        correctedK = showCC ? k + 0.5 : k;
        zScore = (correctedK - mu) / sigma;
        normalProb = jStat.normal.cdf(correctedK, mu, sigma);
        break;
      case "ge": // P(X ≥ k)
        binomialProb = 1 - jStat.binomial.cdf(k - 1, n, p);
        correctedK = showCC ? k - 0.5 : k;
        zScore = (correctedK - mu) / sigma;
        normalProb = 1 - jStat.normal.cdf(correctedK, mu, sigma);
        break;
      case "eq": // P(X = k)
        binomialProb = jStat.binomial.pdf(k, n, p);
        if (showCC) {
          const lowerK = k - 0.5;
          const upperK = k + 0.5;
          normalProb = jStat.normal.cdf(upperK, mu, sigma) - jStat.normal.cdf(lowerK, mu, sigma);
        } else {
          // Without continuity correction, use the normal PDF scaled by the binomial spacing
          normalProb = jStat.normal.pdf(k, mu, sigma);
        }
        zScore = (k - mu) / sigma;
        break;
    }
    
    return { binomialProb, normalProb, zScore, correctedK };
  };
  
  const { binomialProb, normalProb, zScore } = calculateProbabilities();
  const error = Math.abs(binomialProb - normalProb);
  
  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const containerWidth = svgRef.current.getBoundingClientRect().width;
    const containerHeight = svgRef.current.getBoundingClientRect().height || 500;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);
    
    // Add transparent background for clean design
    svg.append("rect")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("fill", "transparent");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate x domain - add padding for visibility
    const xMin = Math.max(0, mu - 4 * sigma);
    const xMax = Math.min(n, mu + 4 * sigma);
    
    // X scale
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);
    
    // Calculate binomial PMF values
    const binomialData = [];
    let maxProb = 0;
    for (let i = Math.floor(xMin); i <= Math.ceil(xMax); i++) {
      const prob = jStat.binomial.pdf(i, n, p);
      binomialData.push({ x: i, prob });
      maxProb = Math.max(maxProb, prob);
    }
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, maxProb * 1.1])
      .range([height, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#374151");
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#374151");
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#9ca3af")
      .style("text-anchor", "middle")
      .text("x");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#9ca3af")
      .style("text-anchor", "middle")
      .text("Probability");
    
    // Draw binomial bars with better visibility
    const barWidth = Math.min(width / (xMax - xMin) * 0.8, 20); // Cap bar width for better aesthetics
    
    const bars = g.selectAll(".binomial-bar")
      .data(binomialData)
      .enter().append("rect")
      .attr("class", "binomial-bar")
      .attr("x", d => x(d.x) - barWidth / 2)
      .attr("y", height)
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("fill", d => {
        switch (probType) {
          case "le": return d.x <= k ? "#3B82F6" : "#e5e7eb"; // Blue for selected
          case "ge": return d.x >= k ? "#3B82F6" : "#e5e7eb"; // Blue for selected
          case "eq": return d.x === k ? "#3B82F6" : "#e5e7eb"; // Blue for selected
          default: return "#e5e7eb";
        }
      })
      .attr("stroke", d => {
        switch (probType) {
          case "le": return d.x <= k ? "#3B82F6" : "transparent";
          case "ge": return d.x >= k ? "#3B82F6" : "transparent";
          case "eq": return d.x === k ? "#3B82F6" : "transparent";
          default: return "transparent";
        }
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0.95);
    
    // Animate bars on mount
    bars.transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .attr("y", d => y(d.prob))
      .attr("height", d => height - y(d.prob));
    
    // Draw normal curve with animation
    const normalLine = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const normalData = [];
    const step = (xMax - xMin) / 300; // Higher resolution
    for (let i = xMin; i <= xMax; i += step) {
      normalData.push({
        x: i,
        y: jStat.normal.pdf(i, mu, sigma)
      });
    }
    
    const path = g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B") // Amber for normal curve
      .attr("stroke-width", 3)
      .attr("d", normalLine)
      .attr("opacity", 0);
    
    // Animate curve appearance
    path.transition()
      .duration(800)
      .delay(300)
      .attr("opacity", 1);
    
    // Draw shaded area for normal approximation
    if (showCC) {
      let areaData = [];
      switch (probType) {
        case "le":
          areaData = normalData.filter(d => d.x <= k + 0.5);
          break;
        case "ge":
          areaData = normalData.filter(d => d.x >= k - 0.5);
          break;
        case "eq":
          areaData = normalData.filter(d => d.x >= k - 0.5 && d.x <= k + 0.5);
          break;
      }
      
      if (areaData.length > 0) {
        const area = d3.area()
          .x(d => x(d.x))
          .y0(height)
          .y1(d => y(d.y));
        
        g.append("path")
          .datum(areaData)
          .attr("fill", colors.chart.secondary)
          .attr("opacity", 0.3)
          .attr("d", area);
        
        // Draw continuity correction markers
        if (probType === "le" && k + 0.5 <= xMax) {
          g.append("line")
            .attr("x1", x(k + 0.5))
            .attr("x2", x(k + 0.5))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", colors.chart.accent)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
          
          g.append("text")
            .attr("x", x(k + 0.5))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.accent)
            .style("font-size", "12px")
            .text(`k + 0.5 = ${k + 0.5}`);
        } else if (probType === "ge" && k - 0.5 >= xMin) {
          g.append("line")
            .attr("x1", x(k - 0.5))
            .attr("x2", x(k - 0.5))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", colors.chart.accent)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
          
          g.append("text")
            .attr("x", x(k - 0.5))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.accent)
            .style("font-size", "12px")
            .text(`k - 0.5 = ${k - 0.5}`);
        } else if (probType === "eq") {
          // Draw both boundaries
          if (k - 0.5 >= xMin) {
            g.append("line")
              .attr("x1", x(k - 0.5))
              .attr("x2", x(k - 0.5))
              .attr("y1", 0)
              .attr("y2", height)
              .attr("stroke", colors.chart.accent)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5");
          }
          
          if (k + 0.5 <= xMax) {
            g.append("line")
              .attr("x1", x(k + 0.5))
              .attr("x2", x(k + 0.5))
              .attr("y1", 0)
              .attr("y2", height)
              .attr("stroke", colors.chart.accent)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5");
          }
          
          g.append("text")
            .attr("x", x(k))
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.accent)
            .style("font-size", "12px")
            .text(`[${k - 0.5}, ${k + 0.5}]`);
        }
      }
    }
    
    // Add clean legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 180}, 20)`);
    
    // Binomial legend
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#3B82F6")
      .attr("opacity", 0.9);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`Binomial B(${n}, ${p.toFixed(2)})`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 15)
      .attr("y2", 30)
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 34)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`Normal N(${mu.toFixed(1)}, ${sigma.toFixed(1)})`);
    
  }, [n, p, k, probType, showCC, colors]);
  
  // Stage-based content
  const getStageContent = () => {
    switch(stage) {
      case 1:
        return {
          title: "Understanding the Concept",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                The binomial distribution counts successes in n independent trials. 
                As n grows large, calculating exact probabilities becomes computationally expensive.
              </p>
              <div className="p-3 bg-teal-900/20 border border-teal-600/30 rounded-lg">
                <p className="text-sm text-teal-300 font-semibold mb-1">Key Insight:</p>
                <p className="text-sm text-teal-200">
                  The normal distribution can approximate binomial probabilities, 
                  making calculations much faster!
                </p>
              </div>
              <p className="text-sm text-gray-300">
                Try adjusting n from 10 to 100 and watch how the binomial bars 
                start to resemble a bell curve.
              </p>
            </div>
          )
        };
      case 2:
        return {
          title: "The Rule of Thumb",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                For a good approximation, we need:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "p-2 rounded-lg border",
                  condition1Met 
                    ? "bg-green-900/20 border-green-600/30" 
                    : "bg-red-900/20 border-red-600/30"
                )}>
                  <p className="text-xs font-mono">
                    np ≥ 5
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Currently: {np.toFixed(2)}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg border",
                  condition2Met 
                    ? "bg-green-900/20 border-green-600/30" 
                    : "bg-red-900/20 border-red-600/30"
                )}>
                  <p className="text-xs font-mono">
                    n(1-p) ≥ 5
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Currently: {nq.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-amber-900/20 border border-amber-600/30 rounded">
                <p className="text-xs text-amber-300">
                  <strong>Try this:</strong> Set n=10, p=0.1. The approximation fails! 
                  Now try n=100, p=0.1. Much better!
                </p>
              </div>
            </div>
          )
        };
      case 3:
        return {
          title: "Continuity Correction",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Since we're using a continuous curve to approximate discrete bars, 
                we apply a continuity correction of ±0.5.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                    P(X ≤ k)
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-xs bg-teal-900/30 px-2 py-1 rounded">
                    P(Y ≤ k + 0.5)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                    P(X ≥ k)
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-xs bg-teal-900/30 px-2 py-1 rounded">
                    P(Y ≥ k - 0.5)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                    P(X = k)
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-xs bg-teal-900/30 px-2 py-1 rounded">
                    P(k - 0.5 ≤ Y ≤ k + 0.5)
                  </span>
                </div>
              </div>
              <p className="text-xs text-amber-300 mt-2">
                Toggle the continuity correction to see the difference!
              </p>
            </div>
          )
        };
      case 4:
        return {
          title: "Real-World Application",
          content: (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
                <p className="text-sm text-emerald-300 font-semibold mb-2">
                  Engineering Example:
                </p>
                <p className="text-sm text-emerald-200">
                  A factory produces 1000 items daily with a 2% defect rate. 
                  What's the probability of having between 15 and 25 defective items?
                </p>
                <p className="text-sm text-emerald-200 mt-2">
                  Using binomial: Very tedious calculation!
                  <br />
                  Using normal approximation: Quick and accurate!
                </p>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setShowWorkedExample(true)}
                className="w-full mt-3"
              >
                Try Worked Example
              </Button>
            </div>
          )
        };
      default:
        return { title: "", content: null };
    }
  };
  
  
  const stageContent = getStageContent();
  
  return (
    <VisualizationContainer 
      title="Normal Approximation to Binomial Distribution"
      tutorialSteps={tutorial_3_7_1}
      tutorialKey="normal-approx-binomial-3-7-1"
    >
      <div ref={contentRef} className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-900 to-neutral-950">
        <Tutorial
          steps={tutorialSteps}
          persistKey="normal-approx-binomial"
          mode="tooltip"
        />
      
      {/* Strip 1: Header & Key Controls */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto">
          {/* Title Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Interactive Visualization</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Discover when and how the normal distribution can approximate binomial probabilities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <ProgressBar
                current={stage}
                total={4}
                label="Learning Journey"
                variant="teal"
              />
              <ProgressNavigation
                current={stage}
                total={4}
                onPrevious={() => setStage(Math.max(1, stage - 1))}
                onNext={() => setStage(Math.min(4, stage + 1))}
                variant="teal"
              />
            </div>
          </div>
          
          {/* Primary Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="parameter-controls">
              <label className="text-sm text-neutral-300 block mb-1">Trials (n)</label>
              <input
                type="range"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                min={10}
                max={200}
                step={5}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider-teal"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>10</span>
                <span className="font-mono text-emerald-400">{n}</span>
                <span>200</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-neutral-300 block mb-1">Success probability (p)</label>
              <input
                type="range"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                min={0.05}
                max={0.95}
                step={0.05}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider-amber"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>0.05</span>
                <span className="font-mono text-amber-400">{p.toFixed(2)}</span>
                <span>0.95</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-neutral-300 block mb-1">Value of interest (k)</label>
              <input
                type="range"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                min={0}
                max={n}
                step={1}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider-orange"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>0</span>
                <span className="font-mono text-orange-400">{k}</span>
                <span>{n}</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-300 block mb-1">Stage Insight</label>
              <div className="p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg text-sm text-neutral-200 min-h-[52px] max-h-[80px] overflow-y-auto border border-neutral-700">
                {stageContent.title}: {(() => {
                  // Extract key message from stage content
                  switch(stage) {
                    case 1: return "Adjust n to see binomial approach normal shape";
                    case 2: return `Rule of thumb: ${ruleOfThumbMet ? '✓ Met' : '✗ Not met'} (np=${np.toFixed(1)}, nq=${nq.toFixed(1)})`;
                    case 3: return "Continuity correction improves approximation accuracy";
                    case 4: return "Try the worked example for real-world applications";
                    default: return "";
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Strip 2: Main Visualization */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 py-4 sm:py-6 visualization-area">
        <div className="h-full bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-lg border border-neutral-700 p-4">
          <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '400px' }}></svg>
        </div>
      </div>
      
      {/* Strip 3: Secondary Controls & Results */}
      <div className="bg-neutral-900 border-t border-neutral-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Probability Type */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-300 mb-2">Probability Type</h4>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: "le", label: "P(X ≤ k)" },
                  { value: "ge", label: "P(X ≥ k)" },
                  { value: "eq", label: "P(X = k)" }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setProbType(type.value)}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-mono transition-all duration-200",
                      probType === type.value
                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-300 mt-3">
                <input
                  type="checkbox"
                  checked={showCC}
                  onChange={(e) => setShowCC(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                Continuity Correction
              </label>
            </div>
            
            {/* Rule of Thumb */}
            <div className="rule-of-thumb space-y-2">
              <h4 className="text-sm font-semibold text-neutral-300 mb-2">Approximation Check</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  condition1Met 
                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700/50" 
                    : "bg-red-900/30 text-red-400 border-red-700/50"
                )}>
                  <div className="font-mono text-sm">np = {np.toFixed(1)}</div>
                  <div className="text-xs mt-1">{condition1Met ? "≥ 5 ✓" : "< 5 ✗"}</div>
                </div>
                <div className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  condition2Met 
                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700/50" 
                    : "bg-red-900/30 text-red-400 border-red-700/50"
                )}>
                  <div className="font-mono text-sm">n(1-p) = {nq.toFixed(1)}</div>
                  <div className="text-xs mt-1">{condition2Met ? "≥ 5 ✓" : "< 5 ✗"}</div>
                </div>
              </div>
            </div>
            
            {/* Probability Comparison */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-300 mb-2">Probability Values</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="text-xs text-neutral-400">Binomial (Exact)</div>
                  <div className="font-mono text-base text-blue-400 mt-1">{binomialProb.toFixed(4)}</div>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="text-xs text-neutral-400">Normal (Approx)</div>
                  <div className="font-mono text-base text-amber-400 mt-1">{normalProb.toFixed(4)}</div>
                </div>
              </div>
              <div className="text-sm text-neutral-300 mt-2">
                Error: <span className="font-mono text-orange-400">{error.toFixed(6)}</span>
                <span className={cn(
                  "ml-2 font-medium",
                  ruleOfThumbMet
                    ? error < 0.01 ? "text-emerald-400" : error < 0.05 ? "text-yellow-400" : "text-orange-400"
                    : "text-red-400"
                )}>
                  ({ruleOfThumbMet ? error < 0.01 ? "Excellent" : error < 0.05 ? "Good" : "Fair" : "Poor"})
                </span>
              </div>
            </div>
            
            {/* Distribution Parameters & Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-300 mb-2">Distribution Info</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="text-xs text-neutral-400">μ</div>
                  <div className="font-mono text-sm text-blue-400 mt-1">{mu.toFixed(1)}</div>
                </div>
                <div className="text-center p-2 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="text-xs text-neutral-400">σ</div>
                  <div className="font-mono text-sm text-amber-400 mt-1">{sigma.toFixed(2)}</div>
                </div>
                <div className="text-center p-2 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="text-xs text-neutral-400">z</div>
                  <div className="font-mono text-sm text-orange-400 mt-1">{zScore.toFixed(2)}</div>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWorkedExample(true)}
                className="w-full mt-2"
              >
                Try Example
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Worked Example Modal */}
      {showWorkedExample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 rounded-xl border border-neutral-700 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Worked Example</h3>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setShowWorkedExample(false)}
              >
                Close
              </Button>
            </div>
            <NormalApproxBinomialWorkedExample
              initialN={n}
              initialP={p}
              initialK={k}
              initialProbType={probType}
              initialShowCC={showCC}
            />
          </div>
        </div>
      )}
      </div>
    </VisualizationContainer>
  );
});

export default NormalApproxBinomial;