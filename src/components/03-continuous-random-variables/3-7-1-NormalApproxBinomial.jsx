"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { createColorScheme, typography } from "../../lib/design-system";
import { jStat } from "jstat";
import { NormalApproxBinomialWorkedExample } from "./3-7-2-NormalApproxBinomialWorkedExample";

const NormalApproxBinomial = React.memo(function NormalApproxBinomial() {
  // Core parameter states
  const [n, setN] = useState(50);
  const [p, setP] = useState(0.5);
  const [k, setK] = useState(25);
  const [probType, setProbType] = useState("le"); // le, ge, eq
  const [showCC, setShowCC] = useState(true);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Refs for D3
  const svgRef = useRef(null);
  
  // Color scheme
  const colors = createColorScheme('probability');
  
  // Calculate Normal approximation parameters
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  const variance = n * p * (1 - p);
  
  // Rule of thumb check
  const np = n * p;
  const nq = n * (1 - p);
  const ruleOfThumbMet = np >= 10 && nq >= 10;
  
  // Ensure k is within bounds
  useEffect(() => {
    if (k > n) setK(n);
    if (k < 0) setK(0);
  }, [n, k]);
  
  // Track interactions
  useEffect(() => {
    setInteractionCount(prev => prev + 1);
  }, [n, p, k, probType, showCC]);
  
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
    
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // Dark background
    svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "#0a0a0a");
    
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
    
    // Draw binomial bars
    const barWidth = width / (xMax - xMin) * 0.8;
    
    g.selectAll(".binomial-bar")
      .data(binomialData)
      .enter().append("rect")
      .attr("class", "binomial-bar")
      .attr("x", d => x(d.x) - barWidth / 2)
      .attr("y", d => y(d.prob))
      .attr("width", barWidth)
      .attr("height", d => height - y(d.prob))
      .attr("fill", d => {
        switch (probType) {
          case "le": return d.x <= k ? colors.chart.primary : colors.chart.grid;
          case "ge": return d.x >= k ? colors.chart.primary : colors.chart.grid;
          case "eq": return d.x === k ? colors.chart.primary : colors.chart.grid;
          default: return colors.chart.grid;
        }
      })
      .attr("opacity", 0.7);
    
    // Draw normal curve
    const normalLine = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);
    
    const normalData = [];
    const step = (xMax - xMin) / 200;
    for (let i = xMin; i <= xMax; i += step) {
      normalData.push({
        x: i,
        y: jStat.normal.pdf(i, mu, sigma)
      });
    }
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", colors.chart.secondary)
      .attr("stroke-width", 3)
      .attr("d", normalLine);
    
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
    
    // Add distribution labels
    g.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 200)
      .attr("height", 60)
      .attr("fill", "#1a1a1a")
      .attr("stroke", "#333")
      .attr("rx", 4);
    
    g.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", colors.chart.primary)
      .style("font-size", "14px")
      .text(`Binomial B(${n}, ${p.toFixed(2)})`);
    
    g.append("text")
      .attr("x", 20)
      .attr("y", 55)
      .attr("fill", colors.chart.secondary)
      .style("font-size", "14px")
      .text(`Normal N(${mu.toFixed(1)}, ${variance.toFixed(1)})`);
    
  }, [n, p, k, probType, showCC, colors]);
  
  // Educational insights based on interaction count
  const getInsights = () => {
    if (interactionCount === 0) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-purple-100">
            Normal Approximation to Binomial
          </h3>
          <p className="text-sm text-purple-200">
            When n is large, calculating exact Binomial probabilities is hard. The Normal distribution 
            can be a great shortcut! Set n and p, then pick a k to see the approximation.
          </p>
          <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300">
              🎯 Goal: Explore 20+ parameter combinations to master the approximation!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 5) {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-purple-100">
            Getting Started
          </h3>
          <p className="text-sm text-purple-200">
            Try a small n (e.g., 10) and p=0.5. The Normal curve roughly fits. 
            Now increase n to 50 or 100. See how much better the Normal curve matches the shape of the Binomial bars!
          </p>
          <div className="mt-2 p-2 bg-amber-900/20 border border-amber-600/30 rounded">
            <div className="text-xs text-amber-300">
              💡 Tip: The approximation improves as n gets larger!
            </div>
          </div>
        </div>
      );
    } else if (interactionCount <= 19) {
      const progress = ((interactionCount - 5) / 15) * 100;
      return (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-purple-100">
            Exploring the Rule of Thumb
          </h3>
          <p className="text-sm text-purple-200">
            The rule of thumb for a good approximation is np ≥ 5 and n(1-p) ≥ 5. Test this!
          </p>
          <ul className="text-xs text-purple-300 space-y-1 mt-2">
            <li>• Set n=100, p=0.02. (np=2, rule fails). How good is the fit?</li>
            <li>• Set n=20, p=0.5. (np=10, n(1-p)=10, rule holds). How good is the fit now?</li>
          </ul>
          <p className="text-sm text-purple-200 mt-2">
            Toggle 'Show Continuity Correction'. Notice how for P(X≤k), we find the area up to k+0.5 
            on the Normal curve. Why do you think we add 0.5?
          </p>
          <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
            <div className="text-xs text-purple-300">
              🎯 Progress: {interactionCount - 5} more explorations until mastery!
            </div>
            <div className="mt-1.5">
              <div className="w-full bg-purple-900/30 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-emerald-100">
            ✨ Approximation Ace!
          </h3>
          <p className="text-sm text-emerald-200">
            You've seen the power of the Normal Approximation!
          </p>
          <ul className="text-xs text-emerald-300 space-y-1 mt-2">
            <li>• It works best when n is large and p is not too close to 0 or 1 (rule of thumb satisfied)</li>
            <li>• Continuity Correction (adjusting by ±0.5) is VITAL because we're using a continuous curve to approximate discrete bars</li>
            <li>• P(X=k) is approximated by the area under Normal curve from k-0.5 to k+0.5</li>
          </ul>
          <div className="mt-3 p-3 bg-emerald-900/20 border border-emerald-600/30 rounded">
            <p className="text-xs text-emerald-300 font-semibold mb-2">
              🔧 Engineering Example:
            </p>
            <p className="text-xs text-emerald-200">
              A machine produces items with a 3% defect rate (p=0.03). If we produce n=500 items, 
              what's the probability of having exactly 15 defects (k=15)? Using the Normal approx: 
              μ=15, σ²=14.55. We'd find P(14.5≤Y≤15.5). This is much faster than the Binomial sum!
            </p>
          </div>
        </div>
      );
    }
  };
  
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h2 className={typography.h2}>Normal Approximation to Binomial Distribution</h2>
        <p className={typography.description}>
          Explore how the discrete Binomial distribution can be approximated by the continuous Normal 
          distribution, especially for large n. Understand when and how to apply the continuity correction.
        </p>
      </div>
      
      <div className="space-y-4">
        <RangeSlider
          label="Number of trials (n)"
          value={n}
          onChange={setN}
          min={10}
          max={200}
          step={5}
          color="blue"
        />
        
        <RangeSlider
          label="Probability of success (p)"
          value={p}
          onChange={setP}
          min={0.05}
          max={0.95}
          step={0.05}
          color="emerald"
        />
        
        <RangeSlider
          label="Value of interest (k)"
          value={k}
          onChange={setK}
          min={0}
          max={n}
          step={1}
          color="amber"
        />
        
        <div>
          <label className="text-sm font-medium text-gray-300">Probability Type</label>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => setProbType("le")}
              className={`px-3 py-1 rounded text-sm ${
                probType === "le" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              P(X ≤ k)
            </button>
            <button
              onClick={() => setProbType("ge")}
              className={`px-3 py-1 rounded text-sm ${
                probType === "ge" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              P(X ≥ k)
            </button>
            <button
              onClick={() => setProbType("eq")}
              className={`px-3 py-1 rounded text-sm ${
                probType === "eq" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              P(X = k)
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showCC"
            checked={showCC}
            onChange={(e) => setShowCC(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="showCC" className="text-sm text-gray-300">
            Show Continuity Correction
          </label>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Distribution Parameters</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">Mean (μ):</span>
            <span className="ml-2 font-mono text-blue-400">{mu.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Variance (σ²):</span>
            <span className="ml-2 font-mono text-emerald-400">{variance.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Std Dev (σ):</span>
            <span className="ml-2 font-mono text-amber-400">{sigma.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Rule of Thumb Check</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">np =</span>
            <span className="ml-2 font-mono">{np.toFixed(2)}</span>
            <span className={`ml-2 ${np >= 5 ? "text-green-400" : "text-red-400"}`}>
              {np >= 5 ? "✓" : "✗"} (≥ 5)
            </span>
          </div>
          <div>
            <span className="text-gray-400">n(1-p) =</span>
            <span className="ml-2 font-mono">{nq.toFixed(2)}</span>
            <span className={`ml-2 ${nq >= 5 ? "text-green-400" : "text-red-400"}`}>
              {nq >= 5 ? "✓" : "✗"} (≥ 5)
            </span>
          </div>
          <div className={`mt-2 p-2 rounded ${
            ruleOfThumbMet 
              ? "bg-green-900/20 border border-green-600/30" 
              : "bg-red-900/20 border border-red-600/30"
          }`}>
            <span className={`text-xs ${ruleOfThumbMet ? "text-green-300" : "text-red-300"}`}>
              Rule of Thumb: {ruleOfThumbMet ? "Met ✓" : "Not Met ✗"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Probability Comparison</h3>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400">Exact (Binomial):</span>
            <span className="ml-2 font-mono text-blue-400">{binomialProb.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-gray-400">Approx (Normal):</span>
            <span className="ml-2 font-mono text-emerald-400">{normalProb.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-gray-400">Absolute Error:</span>
            <span className="ml-2 font-mono text-amber-400">{error.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-gray-400">Z-score:</span>
            <span className="ml-2 font-mono text-purple-400">{zScore.toFixed(3)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
        {getInsights()}
      </div>
      
      <NormalApproxBinomialWorkedExample
        initialN={n}
        initialP={p}
        initialK={k}
        initialProbType={probType}
        initialShowCC={showCC}
      />
    </div>
  );
  
  const rightPanel = (
    <div className="bg-gray-900 p-6 rounded-lg" style={{ height: '700px' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
  
  return <VisualizationContainer leftPanel={leftPanel} rightPanel={rightPanel} />;
});

export { NormalApproxBinomial };