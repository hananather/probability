"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { RangeSlider, SliderPresets } from "../ui/RangeSlider";

// Use probability color scheme
const colorScheme = createColorScheme('probability');

export default function CoinFlipSimulation() {
  // State management
  const [counts, setCounts] = useState([0, 0]); // [heads, tails]
  const [trueProb, setTrueProb] = useState(0.5);
  const [sampleCount, setSampleCount] = useState(10);
  const [inputValue, setInputValue] = useState("10");
  
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  const scalesRef = useRef({ x0: null, x1: null, y: null });
  const elementsRef = useRef({
    observedBars: null,
    theoreticalBars: null,
    dragHandles: null,
    valueLabels: null,
    countLabels: null,
    convergenceText: null,
    ciLines: null
  });
  
  const totalFlips = counts[0] + counts[1];
  
  // Single flip handler
  function handleFlip() {
    const head = Math.random() < trueProb ? 1 : 0;
    setCounts(([h, t]) => [h + head, t + 1 - head]);
  }
  
  // Batch flip handler
  function handleMultipleFlip() {
    let headCount = 0;
    for (let i = 0; i < sampleCount; i++) {
      headCount += Math.random() < trueProb ? 1 : 0;
    }
    setCounts(([h, t]) => [h + headCount, t + (sampleCount - headCount)]);
  }
  
  // Reset simulation
  function handleReset() {
    setCounts([0, 0]);
    setTrueProb(0.5);
    setSampleCount(10);
    setInputValue("10");
  }
  
  // Process MathJax
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [totalFlips, trueProb, counts]);
  
  // Initialize D3 visualization once
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 700;
    const margin = { top: 70, right: 40, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a")
      .style("pointer-events", "none");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Initialize data structure
    const initialData = [
      {
        state: "Observed",
        values: [
          { side: "Heads", value: 0, count: 0 },
          { side: "Tails", value: 0, count: 0 }
        ]
      },
      {
        state: "Theoretical",
        values: [
          { side: "Heads", value: 0.5 },
          { side: "Tails", value: 0.5 }
        ]
      }
    ];
    
    // Scales
    const x0 = d3.scaleBand()
      .domain(initialData.map(d => d.state))
      .range([0, innerWidth])
      .padding(0.3);
    
    const x1 = d3.scaleBand()
      .domain(initialData[0].values.map(d => d.side))
      .range([0, x0.bandwidth()])
      .padding(0.1);
    
    // Adjust y scale to leave room for legend
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 60]); // Leave 60px at top for legend with safe padding
    
    scalesRef.current = { x0, x1, y };
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .style("pointer-events", "none")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .style("pointer-events", "none")
      .call(d3.axisBottom(x0));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .style("pointer-events", "none")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d3.format(".0%")));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.chart.text);
    
    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("fill", colors.chart.text)
      .text("Probability");
    
    // Create groups for observed and theoretical
    const groups = g.selectAll("g.state")
      .data(initialData)
      .enter().append("g")
      .attr("class", d => `state ${d.state.toLowerCase()}`)
      .attr("transform", d => `translate(${x0(d.state)},0)`);
    
    // Create bar groups for each value
    const barGroups = groups.selectAll("g.bar-group")
      .data(d => d.values.map(v => ({ ...v, state: d.state })))
      .enter().append("g")
      .attr("class", "bar-group");
    
    // Create bars
    const bars = barGroups.append("rect")
      .attr("class", "bar")
      .attr("x", d => x1(d.side))
      .attr("y", innerHeight)
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", d => {
        if (d.state === "Observed") {
          return d.side === "Heads" ? colorScheme.chart.primary : colorScheme.chart.secondary;
        } else {
          return d.side === "Heads" ? colorScheme.chart.primary : colorScheme.chart.secondary;
        }
      })
      .attr("opacity", d => d.state === "Theoretical" ? 0.6 : 0.8)
      .style("cursor", d => d.state === "Theoretical" ? "ns-resize" : "default")
      .style("transition", "all 150ms ease-in-out");
    
    // Add drag handles for theoretical bars
    const handles = barGroups.filter(d => d.state === "Theoretical")
      .append("rect")
      .attr("class", "drag-handle")
      .attr("x", d => x1(d.side) + x1.bandwidth() / 2 - 20)
      .attr("y", d => y(d.value) - 6)
      .attr("width", 40)
      .attr("height", 12)
      .attr("rx", 6)
      .attr("fill", "white")
      .attr("opacity", 0.3)
      .style("cursor", "ns-resize")
      .style("transition", "all 150ms ease-in-out");
    
    // Hover effects for theoretical bars
    g.selectAll(".theoretical .bar-group")
      .on("mouseover", function() {
        const group = d3.select(this);
        group.select(".bar")
          .style("transition", "all 150ms ease-in-out")
          .attr("opacity", 0.8);
        group.select(".drag-handle")
          .style("transition", "all 150ms ease-in-out")
          .attr("opacity", 0.6);
      })
      .on("mouseout", function() {
        const group = d3.select(this);
        group.select(".bar")
          .style("transition", "all 150ms ease-in-out")
          .attr("opacity", 0.6);
        group.select(".drag-handle")
          .style("transition", "all 150ms ease-in-out")
          .attr("opacity", 0.3);
      });
    
    // Drag behavior for theoretical bars
    let dragProb = trueProb;
    
    g.selectAll(".theoretical .bar-group")
      .call(
        d3.drag()
          .on("start", function(event, d) {
            const group = d3.select(this);
            dragProb = trueProb;
            
            // Remove transitions during drag
            group.selectAll(".bar, .drag-handle")
              .style("transition", "none");
            g.selectAll(".value")
              .style("transition", "none");
              
            // Change handle color to indicate active dragging
            group.select(".drag-handle")
              .attr("fill", "#60a5fa")
              .attr("opacity", 1);
          })
          .on("drag", function(event, d) {
            if (d.side === "Heads") {
              // Only allow dragging on heads bar
              const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
              dragProb = newVal;
              
              // Update both theoretical bars immediately
              updateTheoreticalBars(dragProb);
            }
          })
          .on("end", function(event, d) {
            const group = d3.select(this);
            
            // Restore transitions
            g.selectAll(".theoretical .bar, .theoretical .drag-handle")
              .style("transition", "all 150ms ease-in-out");
            g.selectAll(".value")
              .style("transition", "all 150ms ease-in-out");
              
            // Reset handle color
            group.select(".drag-handle")
              .attr("fill", "white")
              .attr("opacity", 0.3);
              
            // Update React state
            if (d.side === "Heads") {
              setTrueProb(dragProb);
            }
          })
      );
    
    // Value labels
    const valueLabels = barGroups.append("text")
      .attr("class", "value")
      .attr("x", d => x1(d.side) + x1.bandwidth() / 2)
      .attr("y", innerHeight - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text("0.00%");
    
    // Count labels for observed
    const countLabels = barGroups.filter(d => d.state === "Observed")
      .append("text")
      .attr("class", "count")
      .attr("x", d => x1(d.side) + x1.bandwidth() / 2)
      .attr("y", innerHeight - 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("opacity", 0.8)
      .style("pointer-events", "none")
      .text("n = 0");
    
    // Legend inside each group
    groups.each(function(d) {
      const group = d3.select(this);
      const legendY = 10; // Position legend at top of chart area
      
      group.selectAll("rect.legend")
        .data(d.values)
        .enter().append("rect")
        .attr("x", (d, i) => i * 80)
        .attr("y", legendY)
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 3)
        .attr("fill", v => v.side === "Heads" ? colorScheme.chart.primary : colorScheme.chart.secondary)
        .attr("opacity", d.state === "Theoretical" ? 0.6 : 1);
      
      group.selectAll("text.legend")
        .data(d.values)
        .enter().append("text")
        .attr("x", (d, i) => i * 80 + 20)
        .attr("y", legendY + 8)
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px")
        .attr("fill", colors.chart.text)
        .text(v => v.side);
    });
    
    // Convergence text placeholder
    const convergenceText = g.append("text")
      .attr("class", "convergence-text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colorScheme.chart.tertiary);
    
    // Store references
    elementsRef.current = {
      observedBars: g.selectAll(".observed .bar"),
      theoreticalBars: g.selectAll(".theoretical .bar"),
      dragHandles: g.selectAll(".drag-handle"),
      valueLabels: g.selectAll(".value"),
      countLabels: g.selectAll(".count"),
      convergenceText: convergenceText,
      g: g
    };
    
    // Helper function to update theoretical bars
    function updateTheoreticalBars(prob) {
      const y = scalesRef.current.y;
      const theoreticalData = [
        { side: "Heads", value: prob },
        { side: "Tails", value: 1 - prob }
      ];
      
      g.selectAll(".theoretical .bar-group").each(function(d, i) {
        const group = d3.select(this);
        const newData = theoreticalData.find(td => td.side === d.side);
        
        group.select(".bar")
          .attr("y", y(newData.value))
          .attr("height", innerHeight - y(newData.value));
          
        group.select(".drag-handle")
          .attr("y", y(newData.value) - 6);
          
        group.select(".value")
          .attr("y", y(newData.value) - 5)
          .text(`${(newData.value * 100).toFixed(2)}%`);
      });
    }
    
    // Initial update to show theoretical bars at 50%
    updateTheoreticalBars(0.5);
    
  }, []); // Run once on mount
  
  // Update visualization when data changes
  useEffect(() => {
    if (!elementsRef.current.g) return;
    
    const [heads, tails] = counts;
    const total = totalFlips;
    const { x1, y } = scalesRef.current;
    const innerHeight = y(0);
    
    // Calculate observed probabilities
    let observedHeadsProb, observedTailsProb;
    if (total === 0) {
      observedHeadsProb = 0;
      observedTailsProb = 0;
    } else {
      observedHeadsProb = heads / total;
      observedTailsProb = tails / total;
    }
    
    const observedData = [
      { side: "Heads", value: observedHeadsProb, count: heads },
      { side: "Tails", value: observedTailsProb, count: tails }
    ];
    
    const theoreticalData = [
      { side: "Heads", value: trueProb },
      { side: "Tails", value: 1 - trueProb }
    ];
    
    // Update observed bars
    elementsRef.current.g.selectAll(".observed .bar-group").each(function(d, i) {
      const group = d3.select(this);
      const newData = observedData.find(od => od.side === d.side);
      
      group.select(".bar")
        .transition()
        .duration(300)
        .attr("y", y(newData.value))
        .attr("height", innerHeight - y(newData.value));
        
      group.select(".value")
        .transition()
        .duration(300)
        .attr("y", newData.value > 0 ? y(newData.value) - 5 : innerHeight - 5)
        .text(`${(newData.value * 100).toFixed(2)}%`);
        
      group.select(".count")
        .transition()
        .duration(300)
        .attr("y", newData.value > 0 ? y(newData.value) + 20 : innerHeight - 20)
        .text(`n = ${newData.count}`);
    });
    
    // Update theoretical bars
    elementsRef.current.g.selectAll(".theoretical .bar-group").each(function(d, i) {
      const group = d3.select(this);
      const newData = theoreticalData.find(td => td.side === d.side);
      
      group.select(".bar")
        .transition()
        .duration(300)
        .attr("y", y(newData.value))
        .attr("height", innerHeight - y(newData.value));
        
      group.select(".drag-handle")
        .transition()
        .duration(300)
        .attr("y", y(newData.value) - 6);
        
      group.select(".value")
        .transition()
        .duration(300)
        .attr("y", y(newData.value) - 5)
        .text(`${(newData.value * 100).toFixed(2)}%`);
    });
    
    // Update convergence indicator
    if (totalFlips > 0) {
      const difference = Math.abs(observedHeadsProb - trueProb);
      const standardError = Math.sqrt(trueProb * (1 - trueProb) / totalFlips);
      const z95 = 1.96;
      const marginOfError = z95 * standardError;
      
      const convergenceText = difference < marginOfError ? "Within 95% CI" : 
                            difference < 2 * marginOfError ? "Approaching convergence" : 
                            "Insufficient sample size";
      
      elementsRef.current.convergenceText
        .text(convergenceText)
        .attr("fill", difference < marginOfError ? colorScheme.success : colorScheme.chart.tertiary);
      
      // Remove old CI lines (keeping this line to clean up any existing ones)
      elementsRef.current.g.selectAll(".ci-line, .ci-cap").remove();
    } else {
      elementsRef.current.convergenceText.text("");
    }
    
  }, [counts, trueProb, totalFlips]);
  
  // Calculate statistics
  let observedHeadsProb;
  if (totalFlips === 0) {
    observedHeadsProb = 0;
  } else {
    observedHeadsProb = counts[0] / totalFlips;
  }
  
  const difference = totalFlips > 0 ? Math.abs(observedHeadsProb - trueProb) : 0;
  const standardError = totalFlips > 0 ? Math.sqrt(trueProb * (1 - trueProb) / totalFlips) : 0;
  const marginOfError = 1.96 * standardError; // 95% CI
  
  return (
    <VisualizationContainer title="Law of Large Numbers: Bernoulli Trials" className="p-2">
      <div ref={contentRef} className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              The Law of Large Numbers states that as the number of independent trials increases, 
              the sample proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} /> converges 
              to the true probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} /> with 
              standard error <span dangerouslySetInnerHTML={{ __html: `\\(SE = \\sqrt{\\frac{p(1-p)}{n}}\\)` }} />.
            </p>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Parameters</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  True Probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} />
                </label>
                <RangeSlider
                  value={trueProb}
                  onChange={setTrueProb}
                  {...SliderPresets.probability}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Drag the theoretical bars to adjust probability
                </p>
              </div>
            </div>
            
            <ControlGroup label="Sample Size per Trial">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    const num = parseInt(e.target.value, 10);
                    if (!isNaN(num)) setSampleCount(Math.min(1000, Math.max(1, num)));
                  }}
                  onBlur={() => inputValue === "" && setInputValue(String(sampleCount))}
                  className={cn(components.input, "w-24")}
                />
                <span className="text-sm text-neutral-400">trials</span>
              </div>
            </ControlGroup>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleFlip}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  Single Trial
                </button>
                <button
                  onClick={handleMultipleFlip}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  Run {sampleCount} Trials
                </button>
              </div>
              <button
                onClick={handleReset}
                className={cn(
                  "w-full px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  "bg-neutral-700 hover:bg-neutral-600 text-white"
                )}
              >
                Reset Simulation
              </button>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Sample Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Trials <span dangerouslySetInnerHTML={{ __html: `\\((n)\\)` }} />:</span>
                <span className="font-mono text-white">{totalFlips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Successes (Heads):</span>
                <span className="font-mono text-white">{counts[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Failures (Tails):</span>
                <span className="font-mono text-white">{counts[1]}</span>
              </div>
              <div className="border-t border-neutral-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">
                    Sample Proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} />:
                  </span>
                  <span className="font-mono text-white">{(observedHeadsProb).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">True Probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} />:</span>
                  <span className="font-mono text-white">{(trueProb).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Absolute Error:</span>
                  <span className={cn(
                    "font-mono",
                    difference < marginOfError ? "text-green-400" : "text-yellow-400"
                  )}>
                    {(difference).toFixed(4)}
                  </span>
                </div>
                {totalFlips > 10 && (
                  <>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-neutral-500">Standard Error:</span>
                      <span className="font-mono text-neutral-300">{(standardError).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">95% CI Margin:</span>
                      <span className="font-mono text-neutral-300">±{(marginOfError).toFixed(4)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Statistical Insights</h4>
            
            <div className="space-y-2 text-xs text-neutral-300">
              {totalFlips === 0 && (
                <div>
                  <p className="text-purple-200">🎯 Ready to demonstrate the Law of Large Numbers</p>
                  <p className="text-purple-300 mt-1">
                    This fundamental theorem shows that sample means converge to population means as <span dangerouslySetInnerHTML={{ __html: `\\(n \\to \\infty\\)` }} />.
                  </p>
                  <div className="mt-2 p-2 bg-indigo-900/30 rounded">
                    <p className="text-indigo-300">
                      💡 <strong>Key Concept:</strong> The standard error decreases proportionally to <span dangerouslySetInnerHTML={{ __html: `\\(\\frac{1}{\\sqrt{n}}\\)` }} />
                    </p>
                  </div>
                </div>
              )}
              
              {totalFlips > 0 && totalFlips <= 30 && (
                <div>
                  <p className="text-purple-200">📊 High Variability Phase (n = {totalFlips})</p>
                  <p className="text-purple-300 mt-1">
                    With small sample size, the sample proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = ${observedHeadsProb.toFixed(3)}\\)` }} /> 
                    exhibits high variance around <span dangerouslySetInnerHTML={{ __html: `\\(p = ${trueProb}\\)` }} />.
                  </p>
                  <div className="mt-2 p-2 bg-amber-900/30 rounded">
                    <p className="text-amber-300">
                      🎮 <strong>Challenge:</strong> Reach n = 30 to observe variance reduction
                    </p>
                  </div>
                </div>
              )}
              
              {totalFlips > 30 && totalFlips <= 100 && (
                <div>
                  <p className="text-purple-200">📈 Variance Reduction Phase (n = {totalFlips})</p>
                  <div className="mt-2 p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                    <div className="text-xs text-purple-300">
                      🎯 Approaching Central Limit Theorem conditions
                    </div>
                    <div className="mt-1.5">
                      <div className="w-full bg-purple-900/30 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalFlips / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-center mt-1 text-purple-400 font-mono" style={{ fontSize: '10px' }}>
                        {totalFlips}/100 trials
                      </div>
                    </div>
                  </div>
                  <p className="text-purple-300 mt-2">
                    Current SE = {standardError.toFixed(4)}, theoretical minimum for n=100: {Math.sqrt(trueProb * (1 - trueProb) / 100).toFixed(4)}
                  </p>
                </div>
              )}
              
              {totalFlips > 100 && totalFlips <= 500 && (
                <div>
                  <p className="text-purple-200">📊 Convergence Demonstration (n = {totalFlips})</p>
                  <div className="mt-2 p-2 bg-green-900/20 border border-green-600/30 rounded">
                    <p className="text-green-300">
                      95% Confidence Interval: [{Math.max(0, observedHeadsProb - marginOfError).toFixed(4)}, {Math.min(1, observedHeadsProb + marginOfError).toFixed(4)}]
                    </p>
                    <p className="text-green-300 mt-1">
                      Interval width: {(2 * marginOfError).toFixed(4)} {trueProb >= observedHeadsProb - marginOfError && trueProb <= observedHeadsProb + marginOfError ? "(contains true p ✓)" : "(does not contain true p)"}
                    </p>
                  </div>
                </div>
              )}
              
              {totalFlips > 500 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Strong Convergence Achieved (n = {totalFlips})
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Relative Error:</span>
                      <span className="text-emerald-400 font-mono">{(difference / Math.max(0.001, trueProb) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CI Width/p Ratio:</span>
                      <span className="text-purple-400 font-mono">{(2 * marginOfError / Math.max(0.001, trueProb)).toFixed(3)}</span>
                    </div>
                  </div>
                  <p className="text-purple-300 mt-2">
                    The convergence rate follows <span dangerouslySetInnerHTML={{ __html: `\\(O(n^{-1/2})\\)` }} /> as predicted by theory.
                  </p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3">
          <GraphContainer height="700px">
            <svg ref={svgRef} style={{ width: "100%", height: 700 }} />
          </GraphContainer>
        </div>
      </div>
    </VisualizationContainer>
  );
}