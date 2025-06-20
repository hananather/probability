"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Cost Analysis Component
const CostAnalysisDisplay = memo(function CostAnalysisDisplay({ 
  sampleSize, costPerUnit, fixedCost 
}) {
  const totalCost = fixedCost + (sampleSize * costPerUnit);
  
  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-white mb-3">Cost Analysis</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-300">Fixed costs</span>
          <span className="font-mono text-yellow-400">${fixedCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-300">Variable costs</span>
          <span className="font-mono text-cyan-400">
            ${costPerUnit} × {sampleSize} = ${(sampleSize * costPerUnit).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-neutral-700">
          <span className="text-neutral-300 font-semibold">Total cost</span>
          <span className="font-mono text-purple-400 font-semibold">
            ${totalCost.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Cost breakdown visualization */}
      <div className="mt-4">
        <div className="h-6 bg-neutral-900 rounded overflow-hidden flex">
          <div 
            className="bg-yellow-600 transition-all duration-300"
            style={{ width: `${(fixedCost / totalCost) * 100}%` }}
          />
          <div 
            className="bg-cyan-600 transition-all duration-300"
            style={{ width: `${((sampleSize * costPerUnit) / totalCost) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Fixed ({((fixedCost / totalCost) * 100).toFixed(0)}%)</span>
          <span>Variable ({(((sampleSize * costPerUnit) / totalCost) * 100).toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
});

// Scenario Presets Component
const ScenarioPresets = memo(function ScenarioPresets({ onSelect }) {
  const scenarios = [
    {
      id: 'poll',
      name: 'Political Poll',
      sigma: 0.5,
      error: 0.03,
      confidence: 0.95,
      costPerUnit: 5,
      fixedCost: 1000,
      description: 'Standard election poll with ±3% margin'
    },
    {
      id: 'quality',
      name: 'Quality Control',
      sigma: 2.5,
      error: 0.5,
      confidence: 0.99,
      costPerUnit: 50,
      fixedCost: 5000,
      description: 'Manufacturing quality assessment'
    },
    {
      id: 'medical',
      name: 'Medical Study',
      sigma: 15,
      error: 2,
      confidence: 0.95,
      costPerUnit: 200,
      fixedCost: 10000,
      description: 'Clinical trial measurements'
    }
  ];
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white mb-2">Example Scenarios</h4>
      {scenarios.map(scenario => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario)}
          className="w-full p-3 bg-neutral-700 hover:bg-neutral-600 rounded text-left transition-colors"
        >
          <div className="text-sm font-medium text-white">{scenario.name}</div>
          <div className="text-xs text-neutral-400 mt-1">{scenario.description}</div>
        </button>
      ))}
    </div>
  );
});

function SampleSizeCalculator() {
  // State management - proportions mode
  const [mode, setMode] = useState('mean'); // 'mean' or 'proportion'
  const [sigma, setSigma] = useState(15);
  const [marginOfError, setMarginOfError] = useState(2);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [estimatedP, setEstimatedP] = useState(0.5); // For proportions
  const [costPerUnit, setCostPerUnit] = useState(10);
  const [fixedCost, setFixedCost] = useState(1000);
  const [showCostAnalysis, setShowCostAnalysis] = useState(true);
  
  const svgRef = useRef(null);
  
  // Calculate required sample size
  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
  
  const requiredN = mode === 'mean' 
    ? Math.ceil(Math.pow((zCritical * sigma) / marginOfError, 2))
    : Math.ceil(Math.pow(zCritical, 2) * estimatedP * (1 - estimatedP) / Math.pow(marginOfError, 2));
  
  // Apply scenario preset
  const applyScenario = (scenario) => {
    setSigma(scenario.sigma);
    setMarginOfError(scenario.error);
    setConfidenceLevel(scenario.confidence);
    setCostPerUnit(scenario.costPerUnit);
    setFixedCost(scenario.fixedCost);
    setMode('mean');
  };
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
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
      .text("Sample Size vs. Margin of Error Trade-off");
    
    // Generate data for the curve
    const errorValues = mode === 'mean'
      ? d3.range(0.1, sigma/2, sigma/100)
      : d3.range(0.005, 0.2, 0.001);
    
    const curveData = errorValues.map(e => ({
      error: e,
      n: mode === 'mean'
        ? Math.pow((zCritical * sigma) / e, 2)
        : Math.pow(zCritical, 2) * estimatedP * (1 - estimatedP) / Math.pow(e, 2)
    }));
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(curveData, d => d.error) * 1.1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.min(5000, d3.max(curveData, d => d.n) * 1.1)])
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
    
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Draw the trade-off curve
    const line = d3.line()
      .x(d => xScale(d.error))
      .y(d => yScale(d.n))
      .curve(d3.curveMonotoneX);
    
    // Gradient for the curve
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "curve-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.chart.success);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.chart.error);
    
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", "url(#curve-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Draw current point
    const currentPoint = {
      error: marginOfError,
      n: requiredN
    };
    
    // Vertical line from x-axis to point
    g.append("line")
      .attr("x1", xScale(currentPoint.error))
      .attr("x2", xScale(currentPoint.error))
      .attr("y1", innerHeight)
      .attr("y2", yScale(currentPoint.n))
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Horizontal line from y-axis to point
    g.append("line")
      .attr("x1", 0)
      .attr("x2", xScale(currentPoint.error))
      .attr("y1", yScale(currentPoint.n))
      .attr("y2", yScale(currentPoint.n))
      .attr("stroke", colorScheme.chart.accent)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Current point
    g.append("circle")
      .attr("cx", xScale(currentPoint.error))
      .attr("cy", yScale(currentPoint.n))
      .attr("r", 8)
      .attr("fill", colorScheme.chart.accent)
      .attr("stroke", "#0a0a0a")
      .attr("stroke-width", 2);
    
    // Annotations
    g.append("text")
      .attr("x", xScale(currentPoint.error))
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(mode === 'mean' ? `E = ${marginOfError}` : `E = ${(marginOfError * 100).toFixed(1)}%`);
    
    g.append("text")
      .attr("x", -10)
      .attr("y", yScale(currentPoint.n) + 5)
      .attr("text-anchor", "end")
      .attr("fill", colorScheme.chart.accent)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text(`n = ${requiredN}`);
    
    // Add regions annotations
    const regionY = 20;
    
    // High precision region
    g.append("text")
      .attr("x", innerWidth * 0.15)
      .attr("y", regionY)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.error)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("High Cost");
    
    g.append("text")
      .attr("x", innerWidth * 0.15)
      .attr("y", regionY + 15)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.success)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("High Precision");
    
    // Low precision region
    g.append("text")
      .attr("x", innerWidth * 0.85)
      .attr("y", regionY)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.success)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Low Cost");
    
    g.append("text")
      .attr("x", innerWidth * 0.85)
      .attr("y", regionY + 15)
      .attr("text-anchor", "middle")
      .attr("fill", colorScheme.chart.error)
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Low Precision");
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => mode === 'mean' ? d : `${(d * 100).toFixed(0)}%`));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 60})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(`Margin of Error (E)${mode === 'proportion' ? ' as %' : ''}`);
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Required Sample Size (n)");
    
  }, [mode, sigma, marginOfError, confidenceLevel, estimatedP, zCritical, requiredN]);
  
  return (
    <VisualizationContainer 
      title="Sample Size Calculator"
      className="p-2"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              Determine the required sample size to achieve a desired margin of error. 
              Balance statistical precision with practical constraints like cost and time.
            </p>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="font-semibold text-blue-400 mb-1">For Means (σ known)</p>
                <p className="text-neutral-300 font-mono">
                  n ≥ (z<sub>α/2</sub> × σ / E)²
                </p>
              </div>
              
              <div className="p-2 bg-purple-900/20 border border-purple-600/30 rounded">
                <p className="font-semibold text-purple-400 mb-1">For Proportions</p>
                <p className="text-neutral-300 font-mono">
                  n ≥ z²<sub>α/2</sub> × p(1-p) / E²
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Parameters</h4>
            
            <div className="space-y-3">
              {/* Mode selection */}
              <div>
                <label className="text-sm text-neutral-300 mb-1.5 block">
                  Estimation Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('mean')}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      mode === 'mean'
                        ? "bg-purple-600 text-white"
                        : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                    )}
                  >
                    Population Mean
                  </button>
                  <button
                    onClick={() => setMode('proportion')}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      mode === 'proportion'
                        ? "bg-purple-600 text-white"
                        : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                    )}
                  >
                    Population Proportion
                  </button>
                </div>
              </div>
              
              {/* Mode-specific controls */}
              {mode === 'mean' ? (
                <>
                  {/* Population std dev */}
                  <div>
                    <label className="text-sm text-neutral-300 mb-1.5 block">
                      Population Std Dev (σ = {sigma})
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={0.5}
                      value={sigma}
                      onChange={(e) => setSigma(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  
                  {/* Margin of error */}
                  <div>
                    <label className="text-sm text-neutral-300 mb-1.5 block">
                      Margin of Error (E = {marginOfError})
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={Math.min(10, sigma/2)}
                      step={0.1}
                      value={marginOfError}
                      onChange={(e) => setMarginOfError(Number(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Estimated proportion */}
                  <div>
                    <label className="text-sm text-neutral-300 mb-1.5 block">
                      Estimated p ({(estimatedP * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={estimatedP}
                      onChange={(e) => setEstimatedP(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Use 0.5 for maximum variability (conservative)
                    </p>
                  </div>
                  
                  {/* Margin of error for proportions */}
                  <div>
                    <label className="text-sm text-neutral-300 mb-1.5 block">
                      Margin of Error ({(marginOfError * 100).toFixed(1)}%)
                    </label>
                    <input
                      type="range"
                      min={0.005}
                      max={0.1}
                      step={0.001}
                      value={marginOfError}
                      onChange={(e) => setMarginOfError(Number(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </>
              )}
              
              {/* Confidence level */}
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
              
              {/* Cost parameters */}
              {showCostAnalysis && (
                <div className="pt-2 border-t border-neutral-700">
                  <div className="mb-2">
                    <label className="text-sm text-neutral-300 mb-1 block">
                      Cost per Unit ($)
                    </label>
                    <input
                      type="number"
                      value={costPerUnit}
                      onChange={(e) => setCostPerUnit(Number(e.target.value))}
                      className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-300 mb-1 block">
                      Fixed Cost ($)
                    </label>
                    <input
                      type="number"
                      value={fixedCost}
                      onChange={(e) => setFixedCost(Number(e.target.value))}
                      className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
              )}
              
              {/* View options */}
              <div className="pt-2 border-t border-neutral-700">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showCostAnalysis} 
                    onChange={e => setShowCostAnalysis(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-neutral-300">Show cost analysis</span>
                </label>
              </div>
            </div>
          </VisualizationSection>

          {/* Results Summary */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Results</h4>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded p-4">
              <div className="text-center">
                <p className="text-sm text-neutral-300 mb-2">Required Sample Size</p>
                <p className="text-4xl font-bold font-mono text-purple-400">
                  n ≥ {requiredN}
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  {mode === 'mean' 
                    ? `To estimate μ within ±${marginOfError} with ${(confidenceLevel * 100).toFixed(0)}% confidence`
                    : `To estimate p within ±${(marginOfError * 100).toFixed(1)}% with ${(confidenceLevel * 100).toFixed(0)}% confidence`
                  }
                </p>
              </div>
            </div>
            
            {/* Key factors */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 bg-neutral-800/50 rounded">
                <p className="text-cyan-400 font-semibold">Decrease n by:</p>
                <p className="text-neutral-300">
                  • Accepting larger error (↑E)<br/>
                  • Reducing confidence level (↓CL)<br/>
                  {mode === 'mean' && '• Having smaller variability (↓σ)'}
                </p>
              </div>
            </div>
          </VisualizationSection>

          {/* Cost Analysis */}
          {showCostAnalysis && (
            <CostAnalysisDisplay 
              sampleSize={requiredN}
              costPerUnit={costPerUnit}
              fixedCost={fixedCost}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="400px">
            <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
          </GraphContainer>
          
          {/* Scenario Presets */}
          {mode === 'mean' && (
            <VisualizationSection className="p-4">
              <ScenarioPresets onSelect={applyScenario} />
            </VisualizationSection>
          )}
          
          {/* Formula Reference */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-3">Formula Reference</h4>
            <div className="bg-neutral-800/50 p-4 rounded">
              {mode === 'mean' ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-300 mb-1">Sample size formula (σ known):</p>
                    <p className="font-mono text-center text-cyan-400">
                      n ≥ (z<sub>α/2</sub> × σ / E)²
                    </p>
                  </div>
                  <div className="text-xs text-neutral-400 space-y-1">
                    <p>• z<sub>α/2</sub> = {zCritical.toFixed(3)} (critical value)</p>
                    <p>• σ = {sigma} (population std dev)</p>
                    <p>• E = {marginOfError} (desired margin of error)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-300 mb-1">Sample size formula (proportions):</p>
                    <p className="font-mono text-center text-purple-400">
                      n ≥ z²<sub>α/2</sub> × p(1-p) / E²
                    </p>
                  </div>
                  <div className="text-xs text-neutral-400 space-y-1">
                    <p>• z<sub>α/2</sub> = {zCritical.toFixed(3)} (critical value)</p>
                    <p>• p = {estimatedP.toFixed(2)} (estimated proportion)</p>
                    <p>• E = {(marginOfError * 100).toFixed(1)}% (desired margin)</p>
                  </div>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default SampleSizeCalculator;