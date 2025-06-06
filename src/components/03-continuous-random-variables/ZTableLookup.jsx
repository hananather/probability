"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { createColorScheme, typography } from "../../lib/design-system";
import { Button } from "../ui/button";
import { ArrowRight, ArrowLeft, Search, HelpCircle } from "lucide-react";
import * as jStat from "jstat";

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
  }, [zValue]);
  
  // Calculate z when target probability changes (in p-to-z mode)
  useEffect(() => {
    if (lookupMode === 'p-to-z') {
      const z = jStat.normal.inv(targetProbability, 0, 1);
      setZValue(z);
    }
  }, [targetProbability, lookupMode]);
  
  // Generate Z-table data (partial for display) - memoized for performance
  const zTable = useMemo(() => {
    const table = [];
    for (let row = 0; row <= 30; row++) {
      const zRow = row / 10;
      const rowData = { z: zRow.toFixed(1), values: [] };
      for (let col = 0; col <= 9; col++) {
        const z = zRow + col / 100;
        const p = jStat.normal.cdf(z, 0, 1);
        rowData.values.push({ col, p: p.toFixed(4) });
      }
      table.push(rowData);
    }
    return table;
  }, []); // Empty dependency array since Z-table values never change
  
  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg.append("g");
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    };
    
    // Generate data
    const data = d3.range(-4, 4, 0.1).map(x => ({ x, y: normalPDF(x) }));
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    const areaData = data.filter(d => d.x <= zValue);
    
    // Draw area
    g.append("path")
      .datum(areaData)
      .attr("d", area)
      .attr("fill", colors.primary)
      .attr("opacity", 0.3);
    
    // Draw PDF
    g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
    // Axes
    const xAxis = d3.axisBottom(xScale).tickValues([-3, -2, -1, 0, 1, 2, 3]);
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("color", colors.secondary);
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("color", colors.secondary);
    
    // Labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", colors.secondary)
      .text("z");
      
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", colors.text)
      .text("Standard Normal Distribution");
    
    // Z-value line
    if (zValue >= -4 && zValue <= 4) {
      g.append("line")
        .attr("x1", xScale(zValue))
        .attr("y1", margin.top)
        .attr("x2", xScale(zValue))
        .attr("y2", height - margin.bottom)
        .attr("stroke", colors.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
        
      g.append("text")
        .attr("x", xScale(zValue))
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", colors.accent)
        .text(`z = ${zValue.toFixed(2)}`);
    }
    
    // Probability annotation
    g.append("text")
      .attr("x", xScale(Math.min(zValue / 2, 0)))
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", colors.primary)
      .text(`Φ(${zValue.toFixed(2)}) = ${probability.toFixed(4)}`);
    
  }, [zValue, probability, colors]);
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Z-Table Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Controls and visualization */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Lookup Mode</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLookupMode('z-to-p')}
                    variant={lookupMode === 'z-to-p' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    Z → Probability
                  </Button>
                  <Button
                    onClick={() => setLookupMode('p-to-z')}
                    variant={lookupMode === 'p-to-z' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    Probability → Z
                  </Button>
                </div>
              </div>
              
              <div>
                {lookupMode === 'z-to-p' ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Find Probability for Z-Score</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Z-Score: {zValue.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="-3.5"
                        max="3.5"
                        step="0.01"
                        value={zValue}
                        onChange={(e) => setZValue(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Result:</span> Φ({zValue.toFixed(2)}) = {probability.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(probability * 100).toFixed(2)}% of values fall below z = {zValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Find Z-Score for Probability</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Target Probability: {targetProbability.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0.001"
                        max="0.999"
                        step="0.001"
                        value={targetProbability}
                        onChange={(e) => setTargetProbability(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Result:</span> z = {zValue.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        For P(Z ≤ z) = {targetProbability.toFixed(3)}, z = {zValue.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <svg 
                ref={svgRef} 
                width={400} 
                height={300}
                className="w-full"
              />
              
              <div className="space-y-2">
                <h4 className="font-semibold">Common Z-Values</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>90% confidence:</span>
                    <span className="font-mono">z = ±1.645</span>
                  </div>
                  <div className="flex justify-between">
                    <span>95% confidence:</span>
                    <span className="font-mono">z = ±1.96</span>
                  </div>
                  <div className="flex justify-between">
                    <span>99% confidence:</span>
                    <span className="font-mono">z = ±2.576</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Z-table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Standard Normal Table</h3>
                <Button
                  onClick={() => setShowTableGuide(!showTableGuide)}
                  variant="ghost"
                  size="sm"
                >
                  {showTableGuide ? 'Hide' : 'Show'} Guide
                </Button>
              </div>
              
              {showTableGuide && (
                <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg text-sm space-y-2">
                  <p className="font-semibold">How to use the Z-table:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Find the row for your z-value's first decimal (e.g., 1.9 for z=1.96)</li>
                    <li>Find the column for the second decimal (e.g., 0.06 for z=1.96)</li>
                    <li>The intersection gives Φ(z) = P(Z ≤ z)</li>
                  </ol>
                  {lookupMode === 'z-to-p' && highlightedRow !== null && (
                    <p className="text-xs mt-2 text-amber-400">
                      Currently highlighting: Row {highlightedRow.toFixed(1)}, Column 0.0{highlightedCol}
                    </p>
                  )}
                </div>
              )}
              
              <div className="overflow-auto max-h-[400px] border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th className="p-2 border-b border-r font-semibold">z</th>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                        <th key={col} className="p-2 border-b font-mono">
                          0.0{col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zTable.slice(0, 31).map((row) => (
                      <tr key={row.z} className={highlightedRow === parseFloat(row.z) ? 'bg-amber-900/20' : ''}>
                        <td className="p-2 border-r font-semibold font-mono">
                          {row.z}
                        </td>
                        {row.values.map(({ col, p }) => (
                          <td 
                            key={col} 
                            className={`p-2 font-mono text-center ${
                              highlightedRow === parseFloat(row.z) && highlightedCol === col
                                ? 'bg-amber-500/30 font-bold'
                                : ''
                            }`}
                          >
                            {p}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Quick Formulas</h4>
                <div className="space-y-1 text-xs font-mono">
                  <p>P(Z &gt; z) = 1 - Φ(z)</p>
                  <p>P(|Z| &gt; z) = 2(1 - Φ(z))</p>
                  <p>P(-z &lt; Z &lt; z) = 2Φ(z) - 1</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZTableLookup;