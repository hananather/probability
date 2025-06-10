"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { createColorScheme, typography } from "../../lib/design-system";
import { ArrowRight, ArrowLeft, Search, HelpCircle, Sparkles } from "lucide-react";
import * as jStat from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection, 
  ControlPanel,
  GraphContainer,
  StatsDisplay,
  ControlGroup
} from "../ui/VisualizationContainer";
import { RangeSlider, SliderPresets } from "../ui/RangeSlider";
import { ProgressTracker } from "../ui/ProgressTracker";
import { Button } from "../ui/button";

const ZTableLookup = () => {
  const colors = createColorScheme('inference');
  const svgRef = useRef(null);
  
  // State
  const [zValue, setZValue] = useState(1.96);
  const [probability, setProbability] = useState(0);
  const [lookupMode, setLookupMode] = useState('z-to-p'); // 'z-to-p' or 'p-to-z'
  const [targetProbability, setTargetProbability] = useState(0.95);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [highlightedCol, setHighlightedCol] = useState(null);
  const [showTableGuide, setShowTableGuide] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [lookupHistory, setLookupHistory] = useState([]);
  const [milestoneReached, setMilestoneReached] = useState(false);
  
  // Calculate probability when z changes
  useEffect(() => {
    const p = jStat.normal.cdf(zValue, 0, 1);
    setProbability(p);
    
    // Update table highlighting
    if (zValue >= 0 && zValue <= 3.09) {
      const row = Math.floor(zValue * 10) / 10;
      const col = Math.round((zValue - row) * 100);
      setHighlightedRow(row);
      setHighlightedCol(col);
    } else {
      setHighlightedRow(null);
      setHighlightedCol(null);
    }
    
    // Track lookup history
    if (lookupMode === 'z-to-p') {
      setLookupHistory(prev => {
        if (!prev.some(h => Math.abs(h.z - zValue) < 0.01)) {
          return [...prev, { z: zValue, p: p }].slice(-10);
        }
        return prev;
      });
    }
  }, [zValue, lookupMode]);
  
  // Calculate z when target probability changes (in p-to-z mode)
  useEffect(() => {
    if (lookupMode === 'p-to-z') {
      const z = jStat.normal.inv(targetProbability, 0, 1);
      setZValue(z);
    }
  }, [targetProbability, lookupMode]);
  
  // Check for milestones
  useEffect(() => {
    let timeoutId;
    if (lookupHistory.length >= 5 && !milestoneReached) {
      setMilestoneReached(true);
      timeoutId = setTimeout(() => setMilestoneReached(false), 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lookupHistory.length, milestoneReached]);
  
  // Generate Z-table data (partial for display) - memoized for performance
  const zTable = useMemo(() => {
    const table = [];
    for (let row = 0; row <= 30; row++) {
      const zRow = row / 10;
      const rowData = { z: zRow.toFixed(1), values: [] };
      for (let col = 0; col <= 9; col++) {
        const z = zRow + col / 100;
        const p = jStat.normal.cdf(z, 0, 1);
        rowData.values.push({ col, p: p.toFixed(4), zExact: z });
      }
      table.push(rowData);
    }
    return table;
  }, []);
  
  // Progressive insights based on z-value
  const getInsight = useCallback(() => {
    const absZ = Math.abs(zValue);
    if (absZ < 0.5) return "Small z-values indicate observations close to the mean.";
    if (absZ < 1) return "This z-value falls within one standard deviation of the mean.";
    if (absZ < 1.645) return "Common range for many statistical applications.";
    if (absZ < 1.96) return "Approaching the 95% confidence interval threshold.";
    if (absZ < 2.576) return "This z-value is used for 95% confidence intervals!";
    if (absZ < 3) return "This z-value is used for 99% confidence intervals!";
    return "Extreme z-value! Very rare in practice (>3σ from mean).";
  }, [zValue]);
  
  // D3 Visualization - Much larger and more prominent
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = Math.min(width * 0.5, 500); // Responsive height
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    
    // Set SVG dimensions
    svg.attr("width", width).attr("height", height);
    
    const g = svg.append("g");
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.42])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    };
    
    // Generate data
    const data = d3.range(-4, 4.01, 0.01).map(x => ({ x, y: normalPDF(x) }));
    
    // Create gradient for area fill
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", xScale(-4)).attr("y1", 0)
      .attr("x2", xScale(zValue)).attr("y2", 0);
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colors.primary)
      .attr("stop-opacity", 0.1);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colors.primary)
      .attr("stop-opacity", 0.4);
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    const areaData = data.filter(d => d.x <= zValue);
    
    // Draw area with animation
    const areaPath = g.append("path")
      .datum(areaData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      .style("opacity", 0);
      
    areaPath.transition()
      .duration(500)
      .style("opacity", 1);
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .style("filter", "drop-shadow(0 0 3px " + colors.primary + ")")
      .style("-webkit-filter", "drop-shadow(0 0 3px " + colors.primary + ")");
    
    // Grid lines
    const xGridlines = d3.axisBottom(xScale)
      .tickSize(-height + margin.top + margin.bottom)
      .tickValues([-3, -2, -1, 0, 1, 2, 3])
      .tickFormat("");
      
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xGridlines)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2);
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues([-4, -3, -2, -1, 0, 1, 2, 3, 4])
      .tickFormat(d => d === 0 ? "0" : d.toString());
      
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format(".2f"));
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("color", colors.secondary)
      .style("font-size", "14px");
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("color", colors.secondary)
      .style("font-size", "14px");
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", colors.text)
      .style("font-weight", "600")
      .text("z-score");
      
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", colors.text)
      .style("font-weight", "600")
      .text("Probability Density");
      
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", colors.text)
      .text("Standard Normal Distribution N(0,1)");
    
    // Z-value line and annotations
    if (zValue >= -4 && zValue <= 4) {
      // Vertical line at z-value
      const zLine = g.append("line")
        .attr("x1", xScale(zValue))
        .attr("y1", height - margin.bottom)
        .attr("x2", xScale(zValue))
        .attr("y2", yScale(normalPDF(zValue)))
        .attr("stroke", colors.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0);
        
      zLine.transition()
        .duration(300)
        .style("opacity", 1);
      
      // Point at intersection
      g.append("circle")
        .attr("cx", xScale(zValue))
        .attr("cy", yScale(normalPDF(zValue)))
        .attr("r", 5)
        .attr("fill", colors.accent)
        .style("filter", "drop-shadow(0 0 3px " + colors.accent + ")")
        .style("-webkit-filter", "drop-shadow(0 0 3px " + colors.accent + ")");
        
      // Z-value label
      const zLabel = g.append("g")
        .attr("transform", `translate(${xScale(zValue)}, ${margin.top - 10})`);
        
      zLabel.append("rect")
        .attr("x", -35)
        .attr("y", -15)
        .attr("width", 70)
        .attr("height", 25)
        .attr("rx", 4)
        .attr("fill", colors.accent)
        .attr("fill-opacity", 0.2)
        .attr("stroke", colors.accent)
        .attr("stroke-width", 1);
        
      zLabel.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 4)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", colors.accent)
        .style("font-family", "monospace")
        .text(`z = ${zValue.toFixed(2)}`);
    }
    
    // Probability annotation with background
    const probGroup = g.append("g")
      .attr("transform", `translate(${xScale(Math.min(zValue / 2, 0))}, ${height / 2})`);
      
    probGroup.append("rect")
      .attr("x", -80)
      .attr("y", -25)
      .attr("width", 160)
      .attr("height", 50)
      .attr("rx", 8)
      .attr("fill", "#0a0a0a")
      .attr("fill-opacity", 0.9)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 2);
      
    probGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -5)
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", colors.primary)
      .style("font-family", "monospace")
      .text(`Φ(${zValue.toFixed(2)}) = ${probability.toFixed(4)}`);
      
    probGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 15)
      .style("font-size", "14px")
      .style("fill", colors.secondary)
      .text(`${(probability * 100).toFixed(2)}% of area`);
    
  }, [zValue, probability, colors]);
  
  // Cell hover handler
  const handleCellHover = useCallback((z, p) => {
    setHoveredCell({ z: z.toFixed(2), p });
  }, []);
  
  // Stats for display - memoized for performance
  const stats = useMemo(() => [
    { label: "Current Z-Score", value: zValue.toFixed(4), highlight: true },
    { label: "Cumulative Probability", value: probability.toFixed(4), highlight: true },
    { label: "Percentile", value: `${(probability * 100).toFixed(2)}%` },
    { label: "Area in Right Tail", value: (1 - probability).toFixed(4) },
  ], [zValue, probability]);
  
  return (
    <VisualizationContainer 
      title="Interactive Z-Table Lookup Tool"
      className="max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Main visualization - takes up 3 columns on XL screens */}
        <div className="xl:col-span-3 space-y-6">
          <VisualizationSection>
            <GraphContainer height="500px">
              <svg ref={svgRef} className="w-full h-full" />
            </GraphContainer>
            
            {/* Progressive insights */}
            <div className={`mt-4 p-4 rounded-lg border transition-all duration-300 ${
              milestoneReached 
                ? 'bg-green-900/20 border-green-600/50' 
                : 'bg-blue-900/20 border-blue-600/30'
            }`}>
              <div className="flex items-center gap-2">
                {milestoneReached && <Sparkles className="w-5 h-5 text-green-400" />}
                <p className="text-sm font-semibold">
                  {milestoneReached ? "Great exploration! You've tried 5+ different z-values!" : "Insight"}
                </p>
              </div>
              <p className="text-sm text-gray-300 mt-1">{getInsight()}</p>
            </div>
          </VisualizationSection>
          
          {/* Controls */}
          <VisualizationSection title="Lookup Controls">
            <ControlPanel>
              <div className="space-y-4">
                {/* Mode selector */}
                <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
                  <Button
                    onClick={() => setLookupMode('z-to-p')}
                    variant={lookupMode === 'z-to-p' ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex-1 transition-all duration-300 ${
                      lookupMode === 'z-to-p' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                        : ''
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Z → Probability
                  </Button>
                  <Button
                    onClick={() => setLookupMode('p-to-z')}
                    variant={lookupMode === 'p-to-z' ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex-1 transition-all duration-300 ${
                      lookupMode === 'p-to-z' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500' 
                        : ''
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Probability → Z
                  </Button>
                </div>
                
                {/* Input controls */}
                {lookupMode === 'z-to-p' ? (
                  <ControlGroup label="Find Probability for Z-Score">
                    <RangeSlider
                      label="Z-Score"
                      value={zValue}
                      onChange={setZValue}
                      min={-3.5}
                      max={3.5}
                      step={0.01}
                      formatValue={(v) => v.toFixed(2)}
                      className="mb-4"
                    />
                    <StatsDisplay stats={stats} />
                  </ControlGroup>
                ) : (
                  <ControlGroup label="Find Z-Score for Probability">
                    <RangeSlider
                      {...SliderPresets.probability}
                      label="Target Probability"
                      value={targetProbability}
                      onChange={setTargetProbability}
                      min={0.001}
                      max={0.999}
                      className="mb-4"
                    />
                    <StatsDisplay stats={[
                      { label: "Target Probability", value: targetProbability.toFixed(4), highlight: true },
                      { label: "Resulting Z-Score", value: zValue.toFixed(4), highlight: true },
                      { label: "Percentile", value: `${(targetProbability * 100).toFixed(2)}%` },
                      { label: "Standard Deviations", value: `${Math.abs(zValue).toFixed(2)}σ from mean` },
                    ]} />
                  </ControlGroup>
                )}
              </div>
            </ControlPanel>
          </VisualizationSection>
          
          {/* Common values reference */}
          <VisualizationSection title="Common Critical Values">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { confidence: "90%", z: "±1.645", alpha: "0.10", colorClasses: "bg-amber-900/10 border-amber-600/30 hover:bg-amber-900/20 hover:border-amber-600/50 text-amber-400" },
                { confidence: "95%", z: "±1.96", alpha: "0.05", colorClasses: "bg-blue-900/10 border-blue-600/30 hover:bg-blue-900/20 hover:border-blue-600/50 text-blue-400" },
                { confidence: "99%", z: "±2.576", alpha: "0.01", colorClasses: "bg-purple-900/10 border-purple-600/30 hover:bg-purple-900/20 hover:border-purple-600/50 text-purple-400" },
              ].map((item) => (
                <div 
                  key={item.confidence}
                  className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${item.colorClasses.split(' ').slice(0, 4).join(' ')}`}
                  onClick={() => setZValue(parseFloat(item.z.substring(1)))}
                >
                  <h4 className={`text-lg font-semibold ${item.colorClasses.split(' ').slice(-1)}`}>
                    {item.confidence} Confidence
                  </h4>
                  <p className="text-2xl font-mono font-bold mt-2">{item.z}</p>
                  <p className="text-sm text-gray-400 mt-1">α = {item.alpha}</p>
                </div>
              ))}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Z-Table - takes up 2 columns on XL screens */}
        <div className="xl:col-span-2 space-y-4">
          <VisualizationSection 
            title="Standard Normal Table"
            className="sticky top-4"
          >
            {/* Table guide */}
            <div className="mb-4">
              <Button
                onClick={() => setShowTableGuide(!showTableGuide)}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showTableGuide ? 'Hide' : 'Show'} Guide
              </Button>
              
              {showTableGuide && (
                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 
                  border border-blue-600/30 rounded-lg space-y-2">
                  <h4 className="font-semibold text-blue-300">How to Read the Z-Table:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                    <li>Find the row for your z-value's tenths place (e.g., 1.9)</li>
                    <li>Find the column for the hundredths place (e.g., 0.06)</li>
                    <li>The intersection gives Φ(z) = P(Z ≤ z)</li>
                  </ol>
                  {lookupMode === 'z-to-p' && highlightedRow !== null && (
                    <div className="mt-3 p-2 bg-amber-900/30 rounded">
                      <p className="text-sm text-amber-300 font-mono">
                        Current: Row {highlightedRow.toFixed(1)}, Column 0.0{highlightedCol}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Z-table with improved styling */}
            <div className="overflow-auto max-h-[600px] rounded-lg border border-gray-700
              scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800
              [scrollbar-width:thin] [scrollbar-color:#4B5563_#1F2937]
              [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800
              [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr>
                    <th className="p-3 border-b border-r border-gray-700 font-semibold bg-gray-800">
                      z
                    </th>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                      <th key={col} className="p-3 border-b border-gray-700 font-mono 
                        text-blue-300 bg-gray-800">
                        .0{col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zTable.slice(0, 31).map((row) => {
                    const isRowHighlighted = highlightedRow === parseFloat(row.z);
                    return (
                      <tr 
                        key={row.z} 
                        className={`transition-all duration-200 ${
                          isRowHighlighted ? 'bg-amber-900/20' : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <td className="p-3 border-r border-gray-700 font-semibold font-mono
                          text-blue-300 bg-gray-800/50">
                          {row.z}
                        </td>
                        {row.values.map(({ col, p, zExact }) => {
                          const isCellHighlighted = isRowHighlighted && highlightedCol === col;
                          return (
                            <td 
                              key={col} 
                              role="button"
                              tabIndex={0}
                              aria-label={`z-value ${zExact.toFixed(2)}, probability ${p}`}
                              className={`p-3 font-mono text-center transition-all duration-200
                                cursor-pointer ${
                                isCellHighlighted
                                  ? 'bg-amber-500/40 font-bold text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                  : 'hover:bg-blue-900/30 hover:text-blue-200'
                              }`}
                              onMouseEnter={() => handleCellHover(zExact, p)}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => setZValue(zExact)}
                              onKeyPress={(e) => e.key === 'Enter' && setZValue(zExact)}
                            >
                              {p}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Hover info */}
            {hoveredCell && (
              <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                <p className="text-sm font-mono">
                  z = {hoveredCell.z}, Φ(z) = {hoveredCell.p}
                </p>
              </div>
            )}
          </VisualizationSection>
          
          {/* Quick formulas */}
          <VisualizationSection title="Quick Reference Formulas">
            <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
              {[
                { formula: "P(Z > z) = 1 - Φ(z)", desc: "Right tail probability" },
                { formula: "P(|Z| > z) = 2(1 - Φ(z))", desc: "Two-tailed probability" },
                { formula: "P(-z < Z < z) = 2Φ(z) - 1", desc: "Symmetric interval" },
                { formula: "z = Φ⁻¹(p)", desc: "Inverse normal (quantile)" },
              ].map((item, i) => (
                <div key={i} className="pb-3 border-b border-gray-700 last:border-0">
                  <p className="font-mono text-base text-blue-300">{item.formula}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </VisualizationSection>
          
          {/* Progress tracking */}
          {lookupHistory.length > 0 && (
            <VisualizationSection title="Your Progress">
              <ProgressTracker
                current={lookupHistory.length}
                goal={10}
                label="Z-values explored"
                showMilestones={true}
                color="purple"
              />
              <div className="mt-3 text-sm text-gray-400">
                Recent lookups: {lookupHistory.slice(-3).map(h => 
                  <span key={h.z} className="font-mono ml-2">z={h.z.toFixed(2)}</span>
                )}
              </div>
            </VisualizationSection>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default ZTableLookup;