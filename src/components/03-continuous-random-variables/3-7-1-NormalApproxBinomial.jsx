"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { createColorScheme, typography, cn } from "../../lib/design-system";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { jStat } from "jstat";
import { NormalApproxBinomialWorkedExample } from "./3-7-2-NormalApproxBinomialWorkedExample";
import { Tutorial } from "../ui/Tutorial";
import { ProgressBar, ProgressNavigation } from "../ui/ProgressBar";
import { Button } from "../ui/button";

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
    
    const margin = { top: 30, right: 40, bottom: 60, left: 70 };
    const containerWidth = svgRef.current.getBoundingClientRect().width;
    const containerHeight = svgRef.current.getBoundingClientRect().height;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);
    
    // No dark background - clean design
    
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
      .style("opacity", 0.3);
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("x");
    
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "white")
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
          case "le": return d.x <= k ? colors.chart.primary : "#374151";
          case "ge": return d.x >= k ? colors.chart.primary : "#374151";
          case "eq": return d.x === k ? colors.chart.primary : "#374151";
          default: return "#374151";
        }
      })
      .attr("stroke", d => {
        switch (probType) {
          case "le": return d.x <= k ? colors.chart.primary : "transparent";
          case "ge": return d.x >= k ? colors.chart.primary : "transparent";
          case "eq": return d.x === k ? colors.chart.primary : "transparent";
          default: return "transparent";
        }
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);
    
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
      .attr("stroke", colors.chart.secondary)
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
      .attr("fill", colors.chart.primary)
      .attr("opacity", 0.8);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", "white")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .text(`Binomial B(${n}, ${p.toFixed(2)})`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 15)
      .attr("y2", 30)
      .attr("stroke", colors.chart.secondary)
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 34)
      .attr("fill", "white")
      .style("font-size", "13px")
      .style("font-weight", "500")
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
  
  // Probability type buttons component
  const ProbabilityTypeSelector = () => {
    const types = [
      { value: "le", label: "P(X ≤ k)", description: "At most k successes" },
      { value: "ge", label: "P(X ≥ k)", description: "At least k successes" },
      { value: "eq", label: "P(X = k)", description: "Exactly k successes" }
    ];
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Probability Type</label>
        <div className="grid grid-cols-1 gap-2">
          {types.map(type => (
            <button
              key={type.value}
              onClick={() => setProbType(type.value)}
              className={cn(
                "p-3 rounded-lg border transition-all text-left",
                probType === type.value
                  ? "bg-teal-900/30 border-teal-600/50 text-teal-300"
                  : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800/70"
              )}
            >
              <div className="font-mono text-sm">{type.label}</div>
              <div className="text-xs mt-0.5">{type.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Clean comparison display
  const ComparisonDisplay = () => {
    const approximationQuality = ruleOfThumbMet 
      ? error < 0.01 ? "Excellent" : error < 0.05 ? "Good" : "Fair"
      : "Poor";
    
    const qualityColor = ruleOfThumbMet
      ? error < 0.01 ? "text-green-400" : error < 0.05 ? "text-yellow-400" : "text-orange-400"
      : "text-red-400";
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Binomial (Exact)</div>
            <div className="font-mono text-lg text-teal-400">{binomialProb.toFixed(4)}</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Normal (Approx)</div>
            <div className="font-mono text-lg text-amber-400">{normalProb.toFixed(4)}</div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Approximation Quality</span>
            <span className={cn("text-sm font-semibold", qualityColor)}>
              {approximationQuality}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-400 mb-1">Absolute Error</div>
            <div className="font-mono text-sm">{error.toFixed(6)}</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Rule of thumb display
  const RuleOfThumbDisplay = () => {
    return (
      <div className="rule-of-thumb space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Approximation Conditions</h3>
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg",
            condition1Met ? "bg-green-900/20" : "bg-red-900/20"
          )}>
            <span className="text-sm">np ≥ 5</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{np.toFixed(2)}</span>
              {condition1Met ? (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg",
            condition2Met ? "bg-green-900/20" : "bg-red-900/20"
          )}>
            <span className="text-sm">n(1-p) ≥ 5</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{nq.toFixed(2)}</span>
              {condition2Met ? (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {!ruleOfThumbMet && (
          <div className="mt-2 p-2 bg-amber-900/20 border border-amber-600/30 rounded-lg">
            <p className="text-xs text-amber-300">
              <strong>Warning:</strong> Approximation may be poor. Try increasing n or adjusting p.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  const stageContent = getStageContent();
  
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h2 className={typography.h2}>Normal Approximation to Binomial</h2>
        <p className={typography.description}>
          Discover when and how the normal distribution can approximate binomial probabilities, 
          making complex calculations simple and efficient.
        </p>
      </div>
      
      {/* Progress and Navigation */}
      <div className="space-y-3">
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
      
      {/* Stage Content */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-base font-semibold mb-3">{stageContent.title}</h3>
        {stageContent.content}
      </div>
      
      {/* Parameters */}
      <div className="parameter-controls space-y-4">
        <h3 className="text-sm font-semibold text-gray-300">Parameters</h3>
        
        <RangeSlider
          label="Number of trials (n)"
          value={n}
          onChange={setN}
          min={10}
          max={200}
          step={5}
          color="teal"
        />
        
        <RangeSlider
          label="Probability of success (p)"
          value={p}
          onChange={setP}
          min={0.05}
          max={0.95}
          step={0.05}
          color="amber"
        />
        
        <RangeSlider
          label="Value of interest (k)"
          value={k}
          onChange={setK}
          min={0}
          max={n}
          step={1}
          color="orange"
        />
        
        <ProbabilityTypeSelector />
        
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <label htmlFor="showCC" className="text-sm text-gray-300">
            Show Continuity Correction
          </label>
          <input
            type="checkbox"
            id="showCC"
            checked={showCC}
            onChange={(e) => setShowCC(e.target.checked)}
            className="w-4 h-4 accent-teal-500"
          />
        </div>
      </div>
      
      {/* Rule of Thumb Check */}
      <RuleOfThumbDisplay />
      
      {/* Probability Comparison */}
      <ComparisonDisplay />
      
      {/* Distribution Info */}
      <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Distribution Parameters</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-gray-400">Mean (μ)</div>
            <div className="font-mono text-teal-400">{mu.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400">Std Dev (σ)</div>
            <div className="font-mono text-amber-400">{sigma.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400">Z-score</div>
            <div className="font-mono text-orange-400">{zScore.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Worked Example (conditionally shown) */}
      {showWorkedExample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Worked Example</h3>
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
  );
  
  const rightPanel = (
    <div className="visualization-area h-full flex items-center justify-center p-4">
      <svg ref={svgRef} className="w-full h-full" style={{ maxHeight: '600px' }}></svg>
    </div>
  );
  
  return (
    <div ref={contentRef}>
      <Tutorial
        steps={tutorialSteps}
        persistKey="normal-approx-binomial"
        mode="tooltip"
      />
      <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />
    </div>
  );
});

export { NormalApproxBinomial };