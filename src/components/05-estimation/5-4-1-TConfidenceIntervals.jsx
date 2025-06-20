"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Comparison Table Component
const ComparisonTable = memo(function ComparisonTable({ sampleSize, confidenceLevel }) {
  const df = sampleSize - 1;
  const alpha = 1 - confidenceLevel;
  const tCritical = jStat.studentt.inv(1 - alpha/2, df);
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  const difference = ((tCritical - zCritical) / zCritical * 100).toFixed(1);
  
  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-white mb-3">Z vs T Critical Values</h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded">
          <span className="text-sm text-neutral-300">Z-critical (σ known)</span>
          <span className="font-mono text-blue-400">±{zCritical.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-purple-900/20 rounded">
          <span className="text-sm text-neutral-300">T-critical (σ unknown)</span>
          <span className="font-mono text-purple-400">±{tCritical.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-yellow-900/20 rounded">
          <span className="text-sm text-neutral-300">Difference</span>
          <span className="font-mono text-yellow-400">+{difference}%</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-700">
        <p className="text-xs text-neutral-400">
          T-intervals are wider to account for the additional uncertainty from estimating σ with s
        </p>
      </div>
    </div>
  );
});

// Worked Example Component
const TIntervalWorkedExample = memo(function TIntervalWorkedExample({ 
  sampleData, sampleMean, sampleStd, sampleSize, confidenceLevel 
}) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          // Silent error: MathJax error
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [sampleMean, sampleStd, sampleSize, confidenceLevel]);
  
  // Calculate CI components
  const df = sampleSize - 1;
  const alpha = 1 - confidenceLevel;
  const tCritical = jStat.studentt.inv(1 - alpha/2, df);
  const standardError = sampleStd / Math.sqrt(sampleSize);
  const marginOfError = tCritical * standardError;
  const lowerBound = sampleMean - marginOfError;
  const upperBound = sampleMean + marginOfError;
  
  return (
    <div ref={contentRef} className="bg-neutral-800 p-6 rounded-lg text-neutral-200">
      <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
        T-Confidence Interval Calculation (σ Unknown)
      </h4>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 1: Calculate Sample Statistics</p>
          <div className="bg-neutral-900 p-3 rounded text-sm">
            <p className="text-neutral-400 mb-2">Sample data: [{sampleData.slice(0, 5).map(x => x.toFixed(1)).join(', ')}...]</p>
            <div className="space-y-1">
              <div dangerouslySetInnerHTML={{ __html: `\\[\\bar{x} = \\frac{\\sum x_i}{n} = ${sampleMean.toFixed(3)}\\]` }} />
              <div dangerouslySetInnerHTML={{ __html: `\\[s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n-1}} = ${sampleStd.toFixed(3)}\\]` }} />
            </div>
          </div>
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 2: Find T-Critical Value</p>
          <div className="bg-neutral-900 p-3 rounded text-sm space-y-1">
            <div className="flex justify-between">
              <span>Degrees of freedom (df)</span>
              <span className="font-mono text-cyan-400">n - 1 = {df}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence level</span>
              <span className="font-mono text-cyan-400">{(confidenceLevel * 100).toFixed(0)}%</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: `\\[t_{\\alpha/2, df} = t_{${(alpha/2).toFixed(3)}, ${df}} = ${tCritical.toFixed(3)}\\]` }} />
          </div>
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 3: Calculate Confidence Interval</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[CI = \\bar{x} \\pm t_{\\alpha/2, df} \\times \\frac{s}{\\sqrt{n}}\\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\[CI = ${sampleMean.toFixed(3)} \\pm ${tCritical.toFixed(3)} \\times \\frac{${sampleStd.toFixed(3)}}{\\sqrt{${sampleSize}}}\\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\[CI = ${sampleMean.toFixed(3)} \\pm ${marginOfError.toFixed(3)}\\]` }} />
          
          <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3 mt-2">
            <p className="text-center text-purple-300 font-semibold">
              {confidenceLevel * 100}% CI: [{lowerBound.toFixed(2)}, {upperBound.toFixed(2)}]
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 p-3 rounded text-sm mt-4">
        <p className="text-yellow-400 font-medium mb-2">💡 Key Difference from Z-Interval:</p>
        <p className="text-neutral-300">
          We use the t-distribution because we're estimating σ with s. This adds uncertainty, 
          making the interval wider than if σ were known.
        </p>
      </div>
    </div>
  );
});

function TConfidenceIntervals() {
  // State management
  const [sampleSize, setSampleSize] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [currentSample, setCurrentSample] = useState([]);
  const [sampleMean, setSampleMean] = useState(null);
  const [sampleStd, setSampleStd] = useState(null);
  const [showComparison, setShowComparison] = useState(true);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [totalSamples, setTotalSamples] = useState(0);
  const [populationMean] = useState(100);
  const [populationStd] = useState(15);
  
  const svgRef = useRef(null);
  
  // Generate a new sample
  const generateNewSample = useCallback(() => {
    const sample = Array.from({ length: sampleSize }, () => 
      jStat.normal.sample(populationMean, populationStd)
    );
    const mean = jStat.mean(sample);
    const std = jStat.stdev(sample, true); // Sample standard deviation
    
    setCurrentSample(sample);
    setSampleMean(mean);
    setSampleStd(std);
    setTotalSamples(prev => prev + 1);
  }, [sampleSize, populationMean, populationStd]);
  
  // Calculate CI components
  const df = sampleSize - 1;
  const alpha = 1 - confidenceLevel;
  const tCritical = jStat.studentt.inv(1 - alpha/2, df);
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || sampleMean === null || sampleStd === null) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    const margin = { top: 60, right: 40, bottom: 100, left: 60 };
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
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("T-Distribution vs Normal Distribution Confidence Intervals");
    
    // Create scales
    const xExtent = [
      Math.min(sampleMean - 4 * populationStd, 40),
      Math.max(sampleMean + 4 * populationStd, 160)
    ];
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.15])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Draw distributions if comparison is enabled
    if (showComparison) {
      const xValues = d3.range(-4, 4.01, 0.05);
      
      // Normal distribution (scaled)
      const normalData = xValues.map(x => ({
        x: sampleMean + x * (populationStd / Math.sqrt(sampleSize)),
        y: jStat.normal.pdf(x, 0, 1) * Math.sqrt(sampleSize) / populationStd
      }));
      
      const normalLine = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.6)
        .attr("d", normalLine);
      
      // T-distribution (scaled)
      const tData = xValues.map(x => ({
        x: sampleMean + x * (sampleStd / Math.sqrt(sampleSize)),
        y: jStat.studentt.pdf(x, df) * Math.sqrt(sampleSize) / sampleStd
      }));
      
      const tLine = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      g.append("path")
        .datum(tData)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 2)
        .attr("d", tLine);
    }
    
    // Draw sample mean
    g.append("line")
      .attr("x1", xScale(sampleMean))
      .attr("x2", xScale(sampleMean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 2);
    
    g.append("text")
      .attr("x", xScale(sampleMean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(`x̄ = ${sampleMean.toFixed(2)}`);
    
    // Calculate confidence intervals
    const tStandardError = sampleStd / Math.sqrt(sampleSize);
    const tMarginOfError = tCritical * tStandardError;
    const tLower = sampleMean - tMarginOfError;
    const tUpper = sampleMean + tMarginOfError;
    
    const zStandardError = populationStd / Math.sqrt(sampleSize);
    const zMarginOfError = zCritical * zStandardError;
    const zLower = sampleMean - zMarginOfError;
    const zUpper = sampleMean + zMarginOfError;
    
    // Draw confidence intervals
    const ciY1 = innerHeight * 0.6;
    const ciY2 = innerHeight * 0.75;
    const bracketHeight = 15;
    
    // T-interval
    g.append("line")
      .attr("x1", xScale(tLower))
      .attr("x2", xScale(tUpper))
      .attr("y1", ciY1)
      .attr("y2", ciY1)
      .attr("stroke", colorScheme.chart.primary)
      .attr("stroke-width", 4);
    
    // T-interval brackets
    [tLower, tUpper].forEach(x => {
      g.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", ciY1 - bracketHeight/2)
        .attr("y2", ciY1 + bracketHeight/2)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 3);
    });
    
    // T-interval label
    g.append("text")
      .attr("x", xScale(sampleMean))
      .attr("y", ciY1 - 20)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`T-interval (σ unknown)`);
    
    // Z-interval (for comparison)
    if (showComparison) {
      g.append("line")
        .attr("x1", xScale(zLower))
        .attr("x2", xScale(zUpper))
        .attr("y1", ciY2)
        .attr("y2", ciY2)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", "5,5");
      
      // Z-interval brackets
      [zLower, zUpper].forEach(x => {
        g.append("line")
          .attr("x1", xScale(x))
          .attr("x2", xScale(x))
          .attr("y1", ciY2 - bracketHeight/2)
          .attr("y2", ciY2 + bracketHeight/2)
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5");
      });
      
      // Z-interval label
      g.append("text")
        .attr("x", xScale(sampleMean))
        .attr("y", ciY2 - 20)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`Z-interval (σ known)`);
    }
    
    // CI endpoints labels
    g.append("text")
      .attr("x", xScale(tLower))
      .attr("y", ciY1 + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(tLower.toFixed(2));
    
    g.append("text")
      .attr("x", xScale(tUpper))
      .attr("y", ciY1 + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.primary)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(tUpper.toFixed(2));
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // X axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 200}, 20)`);
    
    const legendItems = [
      { label: "T-distribution", color: colorScheme.chart.primary, dash: false },
      { label: "Normal distribution", color: colorScheme.chart.secondary, dash: true }
    ];
    
    legendItems.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 6)
        .attr("y2", 6)
        .attr("stroke", item.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", item.dash ? "5,5" : null);
      
      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("fill", colors.chart.text)
        .style("font-size", "12px")
        .text(item.label);
    });
    
    // Add annotation about width difference
    const widthDiff = ((tMarginOfError - zMarginOfError) / zMarginOfError * 100).toFixed(1);
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 80)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.warning)
      .style("font-size", "13px")
      .style("font-weight", "500")
      .text(`T-interval is ${widthDiff}% wider than Z-interval`);
    
  }, [sampleMean, sampleStd, currentSample, sampleSize, confidenceLevel, 
      showComparison, df, tCritical, zCritical, populationStd]);
  
  // Initialize with a sample on mount
  useEffect(() => {
    generateNewSample();
  }, []);
  
  return (
    <VisualizationContainer 
      title="T-Distribution Confidence Intervals"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              When the population standard deviation σ is unknown, we use the sample standard deviation s 
              and the t-distribution to construct confidence intervals. This is the most common real-world scenario.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                <p className="font-semibold text-purple-400 mb-1">T-Distribution Properties</p>
                <p className="text-neutral-300">
                  • Heavier tails than normal<br/>
                  • Approaches normal as n → ∞<br/>
                  • Accounts for uncertainty in s
                </p>
              </div>
              
              <div className="p-2 bg-yellow-900/20 border border-yellow-600/30 rounded">
                <p className="font-semibold text-yellow-400 mb-1">Degrees of Freedom</p>
                <p className="text-neutral-300">
                  df = n - 1 (we "lose" one df estimating x̄)
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Sample size control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize}, df = {df})
                </label>
                <input
                  type="range"
                  min={3}
                  max={50}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>3</span>
                  <span>50</span>
                </div>
              </div>
              
              {/* Confidence level control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Confidence Level
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0.90, 0.95, 0.99].map(level => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                        confidenceLevel === level
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                      )}
                    >
                      {(level * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={generateNewSample}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  Generate New Sample
                </button>
              </div>
              
              {/* View options */}
              <div className="space-y-2 pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showComparison} 
                    onChange={e => setShowComparison(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show Z-interval comparison</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showWorkedExample} 
                    onChange={e => setShowWorkedExample(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show worked example</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Statistics Display */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Current Statistics</h4>
            
            <div className="space-y-3">
              {/* Sample statistics */}
              {sampleMean !== null && (
                <div className="bg-neutral-800 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-400 mb-2">Sample Statistics</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-300">x̄ (sample mean)</span>
                      <span className="font-mono text-cyan-400">{sampleMean.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">s (sample std dev)</span>
                      <span className="font-mono text-cyan-400">{sampleStd?.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">n (sample size)</span>
                      <span className="font-mono text-cyan-400">{sampleSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-300">df (degrees of freedom)</span>
                      <span className="font-mono text-yellow-400">{df}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Comparison table */}
              <ComparisonTable 
                sampleSize={sampleSize} 
                confidenceLevel={confidenceLevel} 
              />
            </div>
          </VisualizationSection>

          {/* Learning insights */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insights</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              {sampleSize < 10 && (
                <div className="p-2 bg-red-900/20 border border-red-600/30 rounded">
                  <p className="text-red-400 font-semibold">Small sample (n &lt; 10)</p>
                  <p>T-distribution has very heavy tails. CI is much wider than normal.</p>
                </div>
              )}
              {sampleSize >= 10 && sampleSize < 30 && (
                <div className="p-2 bg-yellow-900/20 border border-yellow-600/30 rounded">
                  <p className="text-yellow-400 font-semibold">Moderate sample (10 ≤ n &lt; 30)</p>
                  <p>T-distribution still noticeably different from normal.</p>
                </div>
              )}
              {sampleSize >= 30 && (
                <div className="p-2 bg-green-900/20 border border-green-600/30 rounded">
                  <p className="text-green-400 font-semibold">Large sample (n ≥ 30)</p>
                  <p>T-distribution nearly identical to normal. Many use z for n ≥ 30.</p>
                </div>
              )}
              
              <ProgressBar 
                current={Math.min(sampleSize, 30)} 
                total={30} 
                label="Sample size effect"
                variant="purple"
              />
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="500px">
            <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
          </GraphContainer>
          
          {/* Worked Example */}
          {showWorkedExample && sampleMean !== null && sampleStd !== null && (
            <TIntervalWorkedExample 
              sampleData={currentSample}
              sampleMean={sampleMean}
              sampleStd={sampleStd}
              sampleSize={sampleSize}
              confidenceLevel={confidenceLevel}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default TConfidenceIntervals;