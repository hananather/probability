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

// Poll Results Display Component
const PollResultsDisplay = memo(function PollResultsDisplay({ 
  sampleSize, supportCount, confidenceLevel 
}) {
  const pHat = supportCount / sampleSize;
  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  const standardError = Math.sqrt((pHat * (1 - pHat)) / sampleSize);
  const marginOfError = zCritical * standardError;
  const lowerBound = Math.max(0, pHat - marginOfError);
  const upperBound = Math.min(1, pHat + marginOfError);
  
  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-white mb-3">Poll Analysis</h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-300">Sample proportion (p̂)</span>
          <span className="font-mono text-cyan-400">{(pHat * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-300">Margin of error</span>
          <span className="font-mono text-yellow-400">±{(marginOfError * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-300">{confidenceLevel * 100}% CI</span>
          <span className="font-mono text-purple-400">
            [{(lowerBound * 100).toFixed(1)}%, {(upperBound * 100).toFixed(1)}%]
          </span>
        </div>
      </div>
      
      {/* Visual bar representation */}
      <div className="mt-4">
        <div className="h-8 bg-neutral-900 rounded relative overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-purple-600/20 to-purple-600/20"
            style={{
              left: `${lowerBound * 100}%`,
              width: `${(upperBound - lowerBound) * 100}%`
            }}
          />
          <div 
            className="absolute h-full w-0.5 bg-cyan-400"
            style={{ left: `${pHat * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-neutral-700">
        <p className="text-xs text-neutral-400">
          {sampleSize >= 30 && pHat * sampleSize >= 10 && (1 - pHat) * sampleSize >= 10 ? (
            <span className="text-green-400">✓ Normal approximation conditions met</span>
          ) : (
            <span className="text-yellow-400">⚠ Normal approximation may not be accurate</span>
          )}
        </p>
      </div>
    </div>
  );
});

// Worked Example Component
const ProportionWorkedExample = memo(function ProportionWorkedExample({ 
  sampleSize, supportCount, confidenceLevel 
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
  }, [sampleSize, supportCount, confidenceLevel]);
  
  // Calculate CI components
  const pHat = supportCount / sampleSize;
  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  const standardError = Math.sqrt((pHat * (1 - pHat)) / sampleSize);
  const marginOfError = zCritical * standardError;
  const lowerBound = Math.max(0, pHat - marginOfError);
  const upperBound = Math.min(1, pHat + marginOfError);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 p-6 rounded-lg text-neutral-200">
      <h4 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-white">
        Proportion Confidence Interval Calculation
      </h4>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 1: Calculate Sample Proportion</p>
          <div className="bg-neutral-900 p-3 rounded text-sm">
            <div className="space-y-1">
              <div>Number supporting: {supportCount}</div>
              <div>Total surveyed: {sampleSize}</div>
              <div dangerouslySetInnerHTML={{ __html: `\\[\\hat{p} = \\frac{x}{n} = \\frac{${supportCount}}{${sampleSize}} = ${pHat.toFixed(4)}\\]` }} />
            </div>
          </div>
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 2: Check Conditions</p>
          <div className="bg-neutral-900 p-3 rounded text-sm space-y-1">
            <div className="flex justify-between">
              <span>n ≥ 30?</span>
              <span className={sampleSize >= 30 ? "text-green-400" : "text-red-400"}>
                {sampleSize >= 30 ? "✓" : "✗"} (n = {sampleSize})
              </span>
            </div>
            <div className="flex justify-between">
              <span>np̂ ≥ 10?</span>
              <span className={pHat * sampleSize >= 10 ? "text-green-400" : "text-red-400"}>
                {pHat * sampleSize >= 10 ? "✓" : "✗"} ({(pHat * sampleSize).toFixed(1)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>n(1-p̂) ≥ 10?</span>
              <span className={(1 - pHat) * sampleSize >= 10 ? "text-green-400" : "text-red-400"}>
                {(1 - pHat) * sampleSize >= 10 ? "✓" : "✗"} ({((1 - pHat) * sampleSize).toFixed(1)})
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 3: Calculate Standard Error</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{${pHat.toFixed(4)} \\times ${(1-pHat).toFixed(4)}}{${sampleSize}}} = ${standardError.toFixed(4)}\\]` }} />
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 4: Find Critical Value & Margin of Error</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[z_{\\alpha/2} = ${zCritical.toFixed(3)}\\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\[ME = z_{\\alpha/2} \\times SE = ${zCritical.toFixed(3)} \\times ${standardError.toFixed(4)} = ${marginOfError.toFixed(4)}\\]` }} />
        </div>
        
        <div>
          <p className="mb-2 font-medium text-purple-400">Step 5: Construct Confidence Interval</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[CI = \\hat{p} \\pm ME = ${pHat.toFixed(4)} \\pm ${marginOfError.toFixed(4)}\\]` }} />
          
          <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3 mt-2">
            <p className="text-center text-purple-300 font-semibold">
              {confidenceLevel * 100}% CI: [{(lowerBound * 100).toFixed(1)}%, {(upperBound * 100).toFixed(1)}%]
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 p-3 rounded text-sm mt-4">
        <p className="text-yellow-400 font-medium mb-2">💡 Interpretation:</p>
        <p className="text-neutral-300">
          We are {(confidenceLevel * 100).toFixed(0)}% confident that the true population proportion 
          lies between {(lowerBound * 100).toFixed(1)}% and {(upperBound * 100).toFixed(1)}%.
        </p>
      </div>
    </div>
  );
});

function ProportionConfidenceIntervals() {
  // State management
  const [scenario, setScenario] = useState('election'); // 'election', 'quality', 'survey'
  const [sampleSize, setSampleSize] = useState(1000);
  const [trueP, setTrueP] = useState(0.52);
  const [currentSample, setCurrentSample] = useState({ support: 0, oppose: 0 });
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const [simulationResults, setSimulationResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const svgRef = useRef(null);
  
  // Scenario configurations
  const scenarios = {
    election: {
      title: "Election Poll",
      supportLabel: "Candidate A",
      opposeLabel: "Candidate B",
      question: "Who will you vote for?",
      color: colorScheme.chart.primary
    },
    quality: {
      title: "Quality Control",
      supportLabel: "Pass",
      opposeLabel: "Fail",
      question: "Does the product meet specifications?",
      color: colorScheme.chart.success
    },
    survey: {
      title: "Customer Survey",
      supportLabel: "Satisfied",
      opposeLabel: "Not Satisfied",
      question: "Are you satisfied with our service?",
      color: colorScheme.chart.accent
    }
  };
  
  // Generate a new sample
  const generateNewSample = useCallback(() => {
    let supportCount = 0;
    for (let i = 0; i < sampleSize; i++) {
      if (Math.random() < trueP) supportCount++;
    }
    setCurrentSample({ 
      support: supportCount, 
      oppose: sampleSize - supportCount 
    });
  }, [sampleSize, trueP]);
  
  // Run simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    const results = [];
    const numSimulations = 100;
    
    for (let i = 0; i < numSimulations; i++) {
      let supportCount = 0;
      for (let j = 0; j < sampleSize; j++) {
        if (Math.random() < trueP) supportCount++;
      }
      
      const pHat = supportCount / sampleSize;
      const alpha = 1 - confidenceLevel;
      const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
      const standardError = Math.sqrt((pHat * (1 - pHat)) / sampleSize);
      const marginOfError = zCritical * standardError;
      
      results.push({
        pHat: pHat,
        lower: Math.max(0, pHat - marginOfError),
        upper: Math.min(1, pHat + marginOfError),
        containsTrue: (pHat - marginOfError <= trueP) && (trueP <= pHat + marginOfError)
      });
    }
    
    setSimulationResults(results);
    setIsSimulating(false);
  }, [sampleSize, trueP, confidenceLevel]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current || currentSample.support === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
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
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`${scenarios[scenario].title}: Proportion Confidence Interval`);
    
    // Calculate CI
    const pHat = currentSample.support / sampleSize;
    const alpha = 1 - confidenceLevel;
    const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
    const standardError = Math.sqrt((pHat * (1 - pHat)) / sampleSize);
    const marginOfError = zCritical * standardError;
    const lowerBound = Math.max(0, pHat - marginOfError);
    const upperBound = Math.min(1, pHat + marginOfError);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
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
    
    // Main visualization area
    const mainY = innerHeight * 0.4;
    
    // Draw sample proportion bar chart
    const barWidth = 60;
    const barHeight = 120;
    const barY = mainY - barHeight / 2;
    
    // Support bar
    g.append("rect")
      .attr("x", xScale(0.5) - barWidth - 10)
      .attr("y", barY + barHeight * (1 - pHat))
      .attr("width", barWidth)
      .attr("height", barHeight * pHat)
      .attr("fill", scenarios[scenario].color)
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    // Oppose bar
    g.append("rect")
      .attr("x", xScale(0.5) + 10)
      .attr("y", barY)
      .attr("width", barWidth)
      .attr("height", barHeight * (1 - pHat))
      .attr("fill", colorScheme.chart.error)
      .attr("opacity", 0.8)
      .attr("rx", 2);
    
    // Bar labels
    g.append("text")
      .attr("x", xScale(0.5) - barWidth/2 - 10)
      .attr("y", barY - 10)
      .attr("text-anchor", "middle")
      .attr("fill", scenarios[scenario].color)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(scenarios[scenario].supportLabel);
    
    g.append("text")
      .attr("x", xScale(0.5) + barWidth/2 + 10)
      .attr("y", barY - 10)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.error)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(scenarios[scenario].opposeLabel);
    
    // Percentage labels
    g.append("text")
      .attr("x", xScale(0.5) - barWidth/2 - 10)
      .attr("y", barY + barHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(`${(pHat * 100).toFixed(1)}%`);
    
    g.append("text")
      .attr("x", xScale(0.5) + barWidth/2 + 10)
      .attr("y", barY + barHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(`${((1 - pHat) * 100).toFixed(1)}%`);
    
    // Draw confidence interval
    const ciY = innerHeight * 0.85;
    
    // CI line
    g.append("line")
      .attr("x1", xScale(lowerBound))
      .attr("x2", xScale(upperBound))
      .attr("y1", ciY)
      .attr("y2", ciY)
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 4);
    
    // CI brackets
    const bracketHeight = 15;
    [lowerBound, upperBound].forEach(bound => {
      g.append("line")
        .attr("x1", xScale(bound))
        .attr("x2", xScale(bound))
        .attr("y1", ciY - bracketHeight/2)
        .attr("y2", ciY + bracketHeight/2)
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 3);
    });
    
    // Point estimate
    g.append("circle")
      .attr("cx", xScale(pHat))
      .attr("cy", ciY)
      .attr("r", 6)
      .attr("fill", scenarios[scenario].color);
    
    // True proportion line (if visible)
    g.append("line")
      .attr("x1", xScale(trueP))
      .attr("x2", xScale(trueP))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.warning)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);
    
    g.append("text")
      .attr("x", xScale(trueP))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.warning)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`True p = ${(trueP * 100).toFixed(0)}%`);
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // X axis label
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Proportion");
    
    // Add margin of error annotation
    const meX = xScale((lowerBound + upperBound) / 2);
    g.append("text")
      .attr("x", meX)
      .attr("y", ciY + 30)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(`ME = ±${(marginOfError * 100).toFixed(1)}%`);
    
  }, [currentSample, sampleSize, confidenceLevel, scenario, trueP]);
  
  // Initialize with a sample on mount
  useEffect(() => {
    generateNewSample();
  }, []);
  
  // Calculate coverage for simulation results
  const coverage = simulationResults.length > 0 
    ? (simulationResults.filter(r => r.containsTrue).length / simulationResults.length * 100).toFixed(1)
    : null;
  
  return (
    <VisualizationContainer 
      title="Confidence Intervals for Proportions"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Build confidence intervals for population proportions using the normal approximation. 
              Common applications include election polls, quality control, and survey analysis.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">Formula</p>
                <p className="text-neutral-300">
                  CI = p̂ ± z<sub>α/2</sub> × √(p̂(1-p̂)/n)
                </p>
              </div>
              
              <div className="p-2 bg-yellow-900/20 border border-yellow-600/30 rounded">
                <p className="font-semibold text-yellow-400 mb-1">Conditions</p>
                <p className="text-neutral-300">
                  • n ≥ 30<br/>
                  • np̂ ≥ 10 and n(1-p̂) ≥ 10
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Controls</h4>
            
            <div className="space-y-3">
              {/* Scenario selection */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Scenario
                </label>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="election">Election Poll</option>
                  <option value="quality">Quality Control</option>
                  <option value="survey">Customer Survey</option>
                </select>
              </div>
              
              {/* Sample size control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Sample Size (n = {sampleSize})
                </label>
                <input
                  type="range"
                  min={30}
                  max={5000}
                  step={10}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>30</span>
                  <span>5000</span>
                </div>
              </div>
              
              {/* True proportion control */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  True Proportion (p = {(trueP * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={trueP}
                  onChange={(e) => setTrueP(Number(e.target.value))}
                  className="w-full accent-yellow-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5%</span>
                  <span>95%</span>
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
                  Take New Sample
                </button>
                
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={cn(
                    "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                    isSimulating
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white"
                  )}
                >
                  {isSimulating ? "Simulating..." : "Run 100 Samples"}
                </button>
              </div>
              
              {/* View options */}
              <div className="pt-2 border-t border-neutral-700">
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

          {/* Current Results */}
          <PollResultsDisplay 
            sampleSize={sampleSize}
            supportCount={currentSample.support}
            confidenceLevel={confidenceLevel}
          />

          {/* Simulation Results */}
          {simulationResults.length > 0 && (
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">Simulation Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Coverage</span>
                  <span className={cn(
                    "font-mono font-semibold",
                    Math.abs(parseFloat(coverage) - confidenceLevel * 100) < 5 
                      ? "text-green-400" 
                      : "text-yellow-400"
                  )}>
                    {coverage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Expected</span>
                  <span className="font-mono text-purple-400">{(confidenceLevel * 100).toFixed(0)}%</span>
                </div>
              </div>
              <ProgressBar 
                current={simulationResults.filter(r => r.containsTrue).length} 
                total={simulationResults.length} 
                label="CIs containing true p"
                variant="cyan"
              />
            </VisualizationSection>
          )}
        </div>

        {/* Right Panel - Visualization */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          {/* Worked Example */}
          {showWorkedExample && currentSample.support > 0 && (
            <ProportionWorkedExample 
              sampleSize={sampleSize}
              supportCount={currentSample.support}
              confidenceLevel={confidenceLevel}
            />
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ProportionConfidenceIntervals;