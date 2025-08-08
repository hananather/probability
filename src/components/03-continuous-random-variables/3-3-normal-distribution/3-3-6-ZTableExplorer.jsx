"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { createColorScheme } from "../../../lib/design-system";
import { 
  Search, Calculator
} from "lucide-react";
import * as jStat from "jstat";
import { cn } from "../../../lib/utils";
import { 
  VisualizationContainer,
  VisualizationSection
} from "../../ui/VisualizationContainer";
import { RangeSlider } from "../../ui/RangeSlider";
import { Button } from "../../ui/button";

const ZTableExplorer = ({ 
  practicalExamples, 
  criticalValues,
  showTutorial,
  setShowTutorial
}) => {
  const colors = createColorScheme('probability'); // Blue color scheme for consistency
  const svgRef = useRef(null);
  
  // Core state
  const [zValue, setZValue] = useState(1.96);
  const [probability, setProbability] = useState(0.975);
  const [lookupMode, setLookupMode] = useState('z-to-p');
  const [targetProbability, setTargetProbability] = useState(0.95);
  
  // Table view state - removed pagination
  
  // UI state
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Update probability when z changes
  useEffect(() => {
    const p = jStat.normal.cdf(zValue, 0, 1);
    setProbability(p);
    
    // Table highlighting is now handled directly in the render
  }, [zValue]);
  
  // Update z when target probability changes (in p-to-z mode)
  useEffect(() => {
    if (lookupMode === 'p-to-z') {
      const z = jStat.normal.inv(targetProbability, 0, 1);
      setZValue(z);
    }
  }, [targetProbability, lookupMode]);
  
  // Enhanced D3 Visualization
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    
    svg.attr("width", width).attr("height", height);
    
    // Create gradient defs
    const defs = svg.append("defs");
    
    // Add gradient background for better visual appeal
    const bgGradient = defs.append("linearGradient")
      .attr("id", "bg-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", height);
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 1);
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1e293b")
      .attr("stop-opacity", 1);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-gradient)");
    
    const g = svg.append("g");
    
    // Area gradient - blue with better visibility
    const areaGradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);
      
    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.1);
      
    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.3);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    
    // Generate curve data
    const curveData = d3.range(-4, 4.01, 0.01).map(x => ({ x, y: normalPDF(x) }));
    
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
      .style("opacity", 0.1)
      .selectAll("line")
      .style("stroke", "#374151");
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    const areaData = curveData.filter(d => d.x <= zValue);
    
    g.append("path")
      .datum(areaData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .style("filter", "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))");
    
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
      .style("font-size", "14px")
      .selectAll("text")
      .style("font-family", "monospace")
      .style("fill", "#e5e7eb");
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("font-size", "14px")
      .selectAll("text")
      .style("font-family", "monospace")
      .style("fill", "#e5e7eb");
    
    // Style axis lines
    g.selectAll(".domain")
      .style("stroke", "#374151");
    g.selectAll(".tick line")
      .style("stroke", "#374151");
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#e5e7eb")
      .text("z-score");
      
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#e5e7eb")
      .text("Probability Density");
    
    // Z-value indicator
    if (zValue >= -4 && zValue <= 4) {
      // Vertical line
      const zLine = g.append("line")
        .attr("x1", xScale(zValue))
        .attr("y1", height - margin.bottom)
        .attr("x2", xScale(zValue))
        .attr("y2", yScale(normalPDF(zValue)))
        .attr("stroke", "#facc15")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6,3")
        .style("opacity", 0);
        
      zLine.transition()
        .duration(300)
        .style("opacity", 1);
      
      // Point on curve
      g.append("circle")
        .attr("cx", xScale(zValue))
        .attr("cy", yScale(normalPDF(zValue)))
        .attr("r", 8)
        .attr("fill", "#facc15")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))");
    }
    
    // Stats display card
    const statsGroup = g.append("g")
      .attr("transform", `translate(${width - margin.right - 180}, ${margin.top})`);
      
    // Stats background
    statsGroup.append("rect")
      .attr("x", -15)
      .attr("y", -15)
      .attr("width", 180)
      .attr("height", 90)
      .attr("rx", 12)
      .attr("fill", "#1f2937")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1)
      .attr("fill-opacity", 0.9);
    
    // Z-value display
    statsGroup.append("text")
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("x", 70)
      .style("font-family", "monospace")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", "#3b82f6") // Bright blue
      .text(`z = ${zValue.toFixed(3)}`);
    
    // Probability display
    statsGroup.append("text")
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("x", 70)
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .attr("fill", "#eab308") // Bright yellow
      .text(`Φ(z) = ${probability.toFixed(4)}`);
    
    // Percentile display
    statsGroup.append("text")
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("x", 70)
      .style("font-size", "12px")
      .attr("fill", "#9ca3af")
      .text(`${(probability * 100).toFixed(1)}th percentile`);
    
    // Right tail probability
    statsGroup.append("text")
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .attr("x", 70)
      .style("font-size", "11px")
      .attr("fill", "#9ca3af")
      .text(`P(Z > z) = ${(1 - probability).toFixed(4)}`);
    
  }, [zValue, probability, colors]);
  
  // Generate Z-table data - simplified with 0.05 increments
  const zTable = useMemo(() => {
    const table = [];
    // From -3.0 to 3.0 in 0.1 increments
    for (let i = -30; i <= 30; i++) {
      const z = i / 10;
      const rowData = { 
        z: z.toFixed(1), 
        values: [] 
      };
      // Just 2 sub-columns for 0.00 and 0.05
      for (let col = 0; col <= 1; col++) {
        const zValue = z + col * 0.05;
        const p = jStat.normal.cdf(zValue, 0, 1);
        rowData.values.push({ 
          col: col * 5, // 0 or 5
          p: p.toFixed(4), 
          zExact: zValue 
        });
      }
      table.push(rowData);
    }
    return table;
  }, []);
  
  // Split table into negative and positive
  const negativeTable = useMemo(() => {
    return zTable.filter(row => parseFloat(row.z) < 0);
  }, [zTable]);
  
  const positiveTable = useMemo(() => {
    return zTable.filter(row => parseFloat(row.z) >= 0);
  }, [zTable]);
  
  // Search functionality
  const handleSearch = (value) => {
    const val = parseFloat(value);
    if (!isNaN(val) && val >= -3.5 && val <= 3.5) {
      setZValue(val);
      setSearchValue(value);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Main Visualization - Full width, centered */}
      <div className="w-full">
        {/* Visualization */}
        <VisualizationSection className="p-0 overflow-hidden z-visualization">
          <div 
            className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-xl mx-auto"
            style={{ height: '450px', maxWidth: '1000px' }}
          >
            <svg ref={svgRef} className="w-full h-full" />
          </div>
        </VisualizationSection>
      </div>
      
      {/* Controls Section - Centered */}
      <div className="w-full max-w-4xl mx-auto">
        <VisualizationSection className="z-controls">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Mode Switcher and Input Controls */}
              <div className="space-y-3">
                {/* Mode Switcher */}
                <div className="flex gap-2 p-1 bg-neutral-800 rounded-lg">
                  <button
                    onClick={() => setLookupMode('z-to-p')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm",
                      lookupMode === 'z-to-p' 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono">Z → P</span>
                      <span className="text-xs opacity-80 hidden sm:inline">Find Probability</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setLookupMode('p-to-z')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm",
                      lookupMode === 'p-to-z' 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono">P → Z</span>
                      <span className="text-xs opacity-80 hidden sm:inline">Find Z-Score</span>
                    </div>
                  </button>
                </div>
                
                {/* Input Controls */}
                {lookupMode === 'z-to-p' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter z-value (e.g., 1.96)"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg 
                          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200/20 
                          transition-all duration-200 font-mono text-sm text-white"
                      />
                    </div>
                    <RangeSlider
                      label="Z-Score"
                      value={zValue}
                      onChange={setZValue}
                      min={-3.5}
                      max={3.5}
                      step={0.01}
                      formatValue={(v) => v.toFixed(2)}
                    />
                  </>
                ) : (
                  <RangeSlider
                    label="Target Probability"
                    value={targetProbability}
                    onChange={setTargetProbability}
                    min={0.001}
                    max={0.999}
                    step={0.001}
                    formatValue={(v) => `${(v * 100).toFixed(1)}%`}
                  />
                )}
                
                {/* Current Value Insight */}
                <div className="mt-4 p-3 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-700/30">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Current Reading</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-neutral-300">
                      z = <span className="font-mono font-semibold text-blue-400">{zValue.toFixed(3)}</span>
                    </p>
                    <p className="text-neutral-400 text-xs">
                      {zValue === 0 ? (
                        "At the mean of the distribution"
                      ) : (
                        <>{Math.abs(zValue).toFixed(2)} standard deviations {zValue > 0 ? 'above' : 'below'} the mean</>
                      )}
                    </p>
                    <p className="text-neutral-400 text-xs">
                      <span className="font-mono text-yellow-400">{(probability * 100).toFixed(1)}%</span> of values fall below this point
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Access Critical Values */}
              <div>
                <p className="text-sm font-medium text-neutral-300 mb-3 text-center md:text-left">Common Critical Values</p>
                <div className="grid grid-cols-2 gap-2">
                {criticalValues.map((cv) => (
                  <button
                    key={cv.z}
                    onClick={() => {
                      setZValue(cv.z);
                      setSearchValue(cv.z.toString());
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border-2 transition-all duration-200",
                      Math.abs(zValue - cv.z) < 0.01
                        ? "bg-blue-900/30 border-blue-500 text-blue-300"
                        : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 text-neutral-300"
                    )}
                  >
                    <div className="text-sm font-semibold">{cv.confidence}</div>
                    <div className="font-mono text-xs mt-0.5 text-blue-400">z = ±{cv.z}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{cv.use}</div>
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>
      </div>
      
      {/* Reference Table - Full width at bottom */}
      <div className="w-full z-table-section">
        <VisualizationSection className="">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Z-Table Reference</h3>
            <div className="text-xs text-neutral-400">
              Shows Φ(z) = P(Z ≤ z) from -3.0 to +3.0
            </div>
          </div>
          
          {/* Table Instructions */}
          <div className="p-3 bg-blue-900/20 border border-blue-600/50 rounded-lg mb-4">
            <p className="text-sm text-blue-300">
              <strong>Quick Reference:</strong> Shows Φ(z) = P(Z ≤ z) for common z-values. 
              Click any cell to use that value.
              {zValue !== 0 && (
                <span className="block mt-1">
                  <span className="font-mono">z = {zValue.toFixed(2)}</span> → 
                  <span className="font-mono ml-2">Φ(z) = {probability.toFixed(4)}</span>
                </span>
              )}
            </p>
          </div>
          
          {/* Split Z-Tables */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Negative Z-values */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-2 text-center">Negative Z-values</h4>
                <div className="overflow-hidden rounded-lg border border-neutral-700">
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-neutral-800 z-10">
                        <tr>
                          <th className="py-1 px-2 border-b border-r border-neutral-600 font-semibold bg-neutral-700 text-white">
                            z
                          </th>
                          {[0, 5].map(col => (
                            <th key={col} className="py-1 px-2 border-b border-neutral-600 font-mono text-xs text-neutral-300">
                              .0{col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {negativeTable.map((row) => {
                          const isRowHighlighted = Math.abs(parseFloat(row.z) - Math.floor(zValue * 10) / 10) < 0.05;
                          const displayZ = row.z;
                          
                          return (
                            <tr 
                              key={row.z} 
                              className={cn(
                                "transition-all duration-200",
                                isRowHighlighted ? "bg-blue-900/20" : "hover:bg-neutral-800"
                              )}
                            >
                              <td className="py-1 px-2 border-r border-neutral-600 font-mono text-sm bg-neutral-800 font-semibold text-white">
                                {displayZ}
                              </td>
                              {row.values.map(({ col, p, zExact }) => {
                                const isCellHighlighted = Math.abs(zExact - zValue) < 0.025;
                                const displayP = p;
                                // Check if this is a key critical value
                                const isKeyValue = [0, 1, 1.65, 1.96, 2.58].some(v => Math.abs(Math.abs(zExact) - v) < 0.005);
                                
                                return (
                                  <td 
                                    key={col} 
                                    className={cn(
                                      "py-1 px-2 font-mono text-center text-xs transition-all duration-200 cursor-pointer",
                                      isCellHighlighted
                                        ? "bg-blue-600 text-white font-bold"
                                        : isKeyValue
                                        ? "text-yellow-400 hover:bg-neutral-700 font-semibold"
                                        : "text-neutral-300 hover:bg-neutral-700"
                                    )}
                                    onMouseEnter={() => setHoveredCell({ 
                                      z: zExact.toFixed(2), 
                                      p: displayP 
                                    })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onClick={() => {
                                      setZValue(zExact);
                                      setSearchValue(zExact.toFixed(2));
                                    }}
                                  >
                                    {displayP}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Positive Z-values */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-2 text-center">Positive Z-values</h4>
                <div className="overflow-hidden rounded-lg border border-neutral-700">
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-neutral-800 z-10">
                        <tr>
                          <th className="py-1 px-2 border-b border-r border-neutral-600 font-semibold bg-neutral-700 text-white">
                            z
                          </th>
                          {[0, 5].map(col => (
                            <th key={col} className="py-1 px-2 border-b border-neutral-600 font-mono text-xs text-neutral-300">
                              .0{col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {positiveTable.map((row) => {
                          const isRowHighlighted = Math.abs(parseFloat(row.z) - Math.floor(zValue * 10) / 10) < 0.05;
                          const displayZ = row.z;
                          
                          return (
                            <tr 
                              key={row.z} 
                              className={cn(
                                "transition-all duration-200",
                                isRowHighlighted ? "bg-blue-900/20" : "hover:bg-neutral-800"
                              )}
                            >
                              <td className="py-1 px-2 border-r border-neutral-600 font-mono text-sm bg-neutral-800 font-semibold text-white">
                                {displayZ}
                              </td>
                              {row.values.map(({ col, p, zExact }) => {
                                const isCellHighlighted = Math.abs(zExact - zValue) < 0.025;
                                const displayP = p;
                                // Check if this is a key critical value
                                const isKeyValue = [0, 1, 1.65, 1.96, 2.58].some(v => Math.abs(Math.abs(zExact) - v) < 0.005);
                                
                                return (
                                  <td 
                                    key={col} 
                                    className={cn(
                                      "py-1 px-2 font-mono text-center text-xs transition-all duration-200 cursor-pointer",
                                      isCellHighlighted
                                        ? "bg-blue-600 text-white font-bold"
                                        : isKeyValue
                                        ? "text-yellow-400 hover:bg-neutral-700 font-semibold"
                                        : "text-neutral-300 hover:bg-neutral-700"
                                    )}
                                    onMouseEnter={() => setHoveredCell({ 
                                      z: zExact.toFixed(2), 
                                      p: displayP 
                                    })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onClick={() => {
                                      setZValue(zExact);
                                      setSearchValue(zExact.toFixed(2));
                                    }}
                                  >
                                    {displayP}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Values Reference */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border border-blue-700/30 rounded-lg">
            <p className="text-xs font-semibold text-blue-400 mb-2">Common Values to Remember:</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <span className="font-mono text-neutral-300">Φ(0) = </span>
                <span className="font-mono text-yellow-400">0.5000</span>
              </div>
              <div className="text-center">
                <span className="font-mono text-neutral-300">Φ(1) ≈ </span>
                <span className="font-mono text-yellow-400">0.8413</span>
              </div>
              <div className="text-center">
                <span className="font-mono text-neutral-300">Φ(1.96) ≈ </span>
                <span className="font-mono text-yellow-400">0.9750</span>
              </div>
              <div className="text-center">
                <span className="font-mono text-neutral-300">Φ(2.58) ≈ </span>
                <span className="font-mono text-yellow-400">0.9951</span>
              </div>
            </div>
          </div>
          
          {/* Hover info */}
          {hoveredCell && (
            <div className="mt-4 p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-center">
              <p className="font-mono text-sm text-blue-400">
                z = {hoveredCell.z}, Φ(z) = {hoveredCell.p}
              </p>
            </div>
          )}
        </VisualizationSection>
      </div>
    </div>
  );
};

export default ZTableExplorer;