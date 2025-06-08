"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  select,
  scaleBand,
  scaleLinear,
  axisBottom,
  axisLeft,
  format
} from '../utils/d3-utils';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from './ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../lib/design-system';
import { RangeSlider, SliderPresets } from "./ui/RangeSlider";

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
  
  // D3 visualization
  useEffect(() => {
    const [heads, tails] = counts;
    const total = totalFlips;
    
    // Apply Laplace smoothing for small samples to prevent extreme bars
    // This prevents the visual issue where one bar shoots to 100% with n=1
    let observedHeadsProb, observedTailsProb;
    if (total === 0) {
      observedHeadsProb = 0.5;
      observedTailsProb = 0.5;
    } else if (total < 5) {
      // Add pseudo-counts (Laplace smoothing) to avoid 0% or 100% bars
      const smoothingFactor = 0.5;
      observedHeadsProb = (heads + smoothingFactor) / (total + 2 * smoothingFactor);
      observedTailsProb = (tails + smoothingFactor) / (total + 2 * smoothingFactor);
    } else {
      observedHeadsProb = heads / total;
      observedTailsProb = tails / total;
    }
    
    const data = [
      {
        state: "Observed",
        values: [
          { side: "Heads", value: observedHeadsProb, count: heads },
          { side: "Tails", value: observedTailsProb, count: tails }
        ]
      },
      {
        state: "Theoretical",
        values: [
          { side: "Heads", value: trueProb },
          { side: "Tails", value: 1 - trueProb }
        ]
      }
    ];
    
    const svg = select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 700;
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x0 = scaleBand()
      .domain(data.map(d => d.state))
      .range([0, innerWidth])
      .padding(0.3);
    
    const x1 = scaleBand()
      .domain(data[0].values.map(d => d.side))
      .range([0, x0.bandwidth()])
      .padding(0.1);
    
    const y = scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Draw bars
    const groups = g.selectAll("g.state")
      .data(data)
      .enter().append("g")
      .attr("class", "state")
      .attr("transform", d => `translate(${x0(d.state)},0)`);
    
    const bars = groups.selectAll("rect")
      .data(d => d.values.map(v => ({ ...v, state: d.state })))
      .enter().append("rect")
      .attr("x", d => x1(d.side))
      .attr("y", innerHeight)
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", d => {
        if (d.state === "Observed") {
          return d.side === "Heads" ? colorScheme.chart.primary : colorScheme.chart.secondary;
        } else {
          return d.side === "Heads" ? colorScheme.chart.primary + "60" : colorScheme.chart.secondary + "60";
        }
      })
      .attr("stroke", d => {
        if (d.state === "Theoretical") {
          return d.side === "Heads" ? colorScheme.chart.primary : colorScheme.chart.secondary;
        }
        return "none";
      })
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => d.state === "Theoretical" ? "5,5" : "none");
    
    // Animate bars
    bars.transition()
      .duration(300)
      .attr("y", d => y(d.value))
      .attr("height", d => innerHeight - y(d.value));
    
    // Value labels
    groups.selectAll("text.value")
      .data(d => d.values.map(v => ({ ...v, state: d.state })))
      .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x1(d.side) + x1.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(d => `${(d.value * 100).toFixed(2)}%`);
    
    // Count labels for observed
    groups.selectAll("text.count")
      .data(d => d.state === "Observed" ? d.values.map(v => ({ ...v, state: d.state })) : [])
      .enter().append("text")
      .attr("class", "count")
      .attr("x", d => x1(d.side) + x1.bandwidth() / 2)
      .attr("y", d => y(d.value) + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("opacity", 0.8)
      .text(d => `n = ${d.count}`);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(x0));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .call(axisLeft(y)
        .ticks(5)
        .tickFormat(format(".0%")));
    
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
    
    // Legend inside each group
    groups.each(function(d) {
      const group = select(this);
      const legendY = -20;
      
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
    
    // Convergence indicator with confidence interval
    if (totalFlips > 0) {
      const difference = Math.abs(observedHeadsProb - trueProb);
      const standardError = Math.sqrt(trueProb * (1 - trueProb) / totalFlips);
      const z95 = 1.96; // 95% confidence interval
      const marginOfError = z95 * standardError;
      
      // Convergence status
      const convergenceText = difference < marginOfError ? "Within 95% CI" : 
                            difference < 2 * marginOfError ? "Approaching convergence" : 
                            "Insufficient sample size";
      
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "600")
        .attr("fill", difference < marginOfError ? colorScheme.success : colorScheme.chart.tertiary)
        .text(convergenceText);
      
      // Only show error bars when we have sufficient samples
      if (totalFlips >= 10) {
        // Add confidence interval visualization for observed probability
        const observedX = x0("Observed") + x1("Heads") + x1.bandwidth() / 2;
        const ciUpper = Math.min(1, observedHeadsProb + marginOfError);
        const ciLower = Math.max(0, observedHeadsProb - marginOfError);
        
        // CI error bars
        g.append("line")
          .attr("x1", observedX)
          .attr("x2", observedX)
          .attr("y1", y(ciUpper))
          .attr("y2", y(ciLower))
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 2)
          .attr("opacity", 0.8);
        
        // CI caps
        [-1, 1].forEach(dir => {
          g.append("line")
            .attr("x1", observedX - 5)
            .attr("x2", observedX + 5)
            .attr("y1", y(dir === 1 ? ciUpper : ciLower))
            .attr("y2", y(dir === 1 ? ciUpper : ciLower))
            .attr("stroke", colorScheme.chart.primary)
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        });
      }
    }
    
  }, [counts, trueProb, totalFlips]);
  
  // Calculate statistics
  let observedHeadsProb;
  if (totalFlips === 0) {
    observedHeadsProb = 0.5;
  } else if (totalFlips < 5) {
    // Match the smoothing used in visualization
    const smoothingFactor = 0.5;
    observedHeadsProb = (counts[0] + smoothingFactor) / (totalFlips + 2 * smoothingFactor);
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
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-300">
                True Probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} />
              </label>
              <RangeSlider
                value={trueProb}
                onChange={setTrueProb}
                {...SliderPresets.probability}
              />
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
                    Sample Proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p}\\)` }} />
                    {totalFlips > 0 && totalFlips < 5 && <span className="text-xs"> (smoothed)</span>}:
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
                    {totalFlips < 5 && <span className="text-xs"> (Laplace smoothing applied to prevent extreme values)</span>}
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