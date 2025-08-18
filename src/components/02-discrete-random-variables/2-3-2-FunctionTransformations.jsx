import React, { useState, useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { tutorial_2_3_2 } from '@/tutorials/chapter2.jsx';

const FunctionTransformations = () => {
  // State for function selection and display options
  const [functionType, setFunctionType] = useState('square');
  const [showMapping, setShowMapping] = useState(true);
  const [highlightedValue, setHighlightedValue] = useState(null);
  const [customA, setCustomA] = useState(1);
  const [customB, setCustomB] = useState(0);
  const [customC, setCustomC] = useState(0);
  
  // Refs for D3 visualizations
  const mappingRef = useRef(null);
  const distributionRef = useRef(null);
  const statsRef = useRef(null);
  
  // Base distribution - symmetric around 0 for better demonstrations
  const baseDistribution = [
    { x: -3, p: 0.1 },
    { x: -2, p: 0.15 },
    { x: -1, p: 0.2 },
    { x: 0, p: 0.1 },
    { x: 1, p: 0.2 },
    { x: 2, p: 0.15 },
    { x: 3, p: 0.1 }
  ];
  
  // Function definitions
  const functions = {
    square: {
      name: 'Square',
      formula: 'Y = X²',
      fn: x => x * x,
      latex: 'Y = X^2'
    },
    abs: {
      name: 'Absolute Value',
      formula: 'Y = |X|',
      fn: x => Math.abs(x),
      latex: 'Y = |X|'
    },
    cube: {
      name: 'Cube',
      formula: 'Y = X³',
      fn: x => x * x * x,
      latex: 'Y = X^3'
    },
    sqrt: {
      name: 'Square Root (X ≥ 0)',
      formula: 'Y = √X',
      fn: x => x >= 0 ? Math.sqrt(x) : null,
      latex: 'Y = \\sqrt{X}'
    },
    custom: {
      name: 'Custom Polynomial',
      formula: `Y = ${customA}X² + ${customB}X + ${customC}`,
      fn: x => customA * x * x + customB * x + customC,
      latex: `Y = ${customA}X^2 + ${customB}X + ${customC}`
    }
  };
  
  // Get current function
  const currentFunction = functions[functionType];
  
  // Calculate transformed distribution
  const getTransformedDistribution = () => {
    const transformed = {};
    
    baseDistribution.forEach(({ x, p }) => {
      const y = currentFunction.fn(x);
      if (y !== null && !isNaN(y)) {
        const key = y.toFixed(3); // Handle floating point precision
        if (transformed[key]) {
          transformed[key] += p;
        } else {
          transformed[key] = p;
        }
      }
    });
    
    return Object.entries(transformed).map(([y, p]) => ({
      y: parseFloat(y),
      p
    })).sort((a, b) => a.y - b.y);
  };
  
  // Calculate statistics
  const calculateStats = () => {
    // Original stats
    const EX = baseDistribution.reduce((sum, { x, p }) => sum + x * p, 0);
    const EX2 = baseDistribution.reduce((sum, { x, p }) => sum + x * x * p, 0);
    const VarX = EX2 - EX * EX;
    
    // Transformed stats
    const transformedDist = getTransformedDistribution();
    const EY = transformedDist.reduce((sum, { y, p }) => sum + y * p, 0);
    const EY2 = transformedDist.reduce((sum, { y, p }) => sum + y * y * p, 0);
    const VarY = EY2 - EY * EY;
    
    // Also calculate E[g(X)] directly
    const EgX = baseDistribution.reduce((sum, { x, p }) => {
      const y = currentFunction.fn(x);
      return sum + (y !== null ? y * p : 0);
    }, 0);
    
    return {
      original: { mean: EX, variance: VarX, sd: Math.sqrt(VarX) },
      transformed: { mean: EY, variance: VarY, sd: Math.sqrt(VarY) },
      direct: EgX
    };
  };
  
  // Draw mapping visualization
  useEffect(() => {
    if (!mappingRef.current || !showMapping) return;
    
    const svg = d3.select(mappingRef.current);
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xExtent = d3.extent(baseDistribution, d => d.x);
    const yValues = baseDistribution.map(d => currentFunction.fn(d.x)).filter(y => y !== null);
    const yExtent = d3.extent(yValues);
    
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
      .range([0, plotWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0] - 0.5), yExtent[1] + 0.5])
      .range([plotHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", plotWidth / 2)
      .attr("y", 35)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("X");
    
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -plotHeight / 2)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Y = g(X)");
    
    // Style axes
    svg.selectAll(".domain, .tick line")
      .style("stroke", "#6B7280");
    svg.selectAll(".tick text")
      .style("fill", "#f3f4f6");
    
    // Draw function curve
    const line = d3.line()
      .x(d => xScale(d))
      .y(d => yScale(currentFunction.fn(d)))
      .curve(d3.curveMonotoneX);
    
    const xRange = d3.range(xExtent[0], xExtent[1] + 0.1, 0.1);
    const validPoints = xRange.filter(x => {
      const y = currentFunction.fn(x);
      return y !== null && !isNaN(y);
    });
    
    g.append("path")
      .datum(validPoints)
      .attr("fill", "none")
      .attr("stroke", "#14B8A6")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Draw points and mappings
    baseDistribution.forEach(({ x, p }) => {
      const y = currentFunction.fn(x);
      if (y === null) return;
      
      const isHighlighted = highlightedValue === x;
      
      // Vertical line from x-axis
      g.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", plotHeight)
        .attr("y2", yScale(y))
        .attr("stroke", isHighlighted ? "#F59E0B" : "#4B5563")
        .attr("stroke-width", isHighlighted ? 2 : 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", isHighlighted ? 1 : 0.5);
      
      // Horizontal line to y-axis
      g.append("line")
        .attr("x1", xScale(x))
        .attr("x2", 0)
        .attr("y1", yScale(y))
        .attr("y2", yScale(y))
        .attr("stroke", isHighlighted ? "#F59E0B" : "#4B5563")
        .attr("stroke-width", isHighlighted ? 2 : 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", isHighlighted ? 1 : 0.5);
      
      // Point
      g.append("circle")
        .attr("cx", xScale(x))
        .attr("cy", yScale(y))
        .attr("r", isHighlighted ? 6 : 4)
        .attr("fill", isHighlighted ? "#F59E0B" : "#3B82F6")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", () => setHighlightedValue(x))
        .on("mouseout", () => setHighlightedValue(null));
    });
    
  }, [functionType, customA, customB, customC, showMapping, highlightedValue]);
  
  // Draw distribution comparison
  useEffect(() => {
    if (!distributionRef.current) return;
    
    const svg = d3.select(distributionRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const transformedDist = getTransformedDistribution();
    
    // Scales
    const allValues = [
      ...baseDistribution.map(d => d.x),
      ...transformedDist.map(d => d.y)
    ];
    const xExtent = d3.extent(allValues);
    
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 1, xExtent[1] + 1])
      .range([0, plotWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.35])
      .range([plotHeight, 0]);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", plotWidth / 2)
      .attr("y", 35)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Value");
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -plotHeight / 2)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Probability");
    
    // Style axes
    svg.selectAll(".domain, .tick line")
      .style("stroke", "#6B7280");
    svg.selectAll(".tick text")
      .style("fill", "#f3f4f6");
    
    // Draw original distribution
    const barWidth = 20;
    
    g.selectAll(".original-bar")
      .data(baseDistribution)
      .enter().append("rect")
      .attr("class", "original-bar")
      .attr("x", d => xScale(d.x) - barWidth)
      .attr("y", d => yScale(d.p))
      .attr("width", barWidth)
      .attr("height", d => plotHeight - yScale(d.p))
      .attr("fill", "#3B82F6")
      .attr("opacity", d => highlightedValue === d.x ? 1 : 0.7)
      .on("mouseover", (event, d) => setHighlightedValue(d.x))
      .on("mouseout", () => setHighlightedValue(null));
    
    // Draw transformed distribution
    g.selectAll(".transformed-bar")
      .data(transformedDist)
      .enter().append("rect")
      .attr("class", "transformed-bar")
      .attr("x", d => xScale(d.y))
      .attr("y", d => yScale(d.p))
      .attr("width", barWidth)
      .attr("height", d => plotHeight - yScale(d.p))
      .attr("fill", "#10B981")
      .attr("opacity", 0.7);
    
    // Add connecting lines for highlighted value
    if (highlightedValue !== null) {
      const y = currentFunction.fn(highlightedValue);
      if (y !== null) {
        g.append("path")
          .attr("d", `M ${xScale(highlightedValue)} ${yScale(0)} Q ${xScale((highlightedValue + y) / 2)} ${yScale(0.4)} ${xScale(y)} ${yScale(0)}`)
          .attr("fill", "none")
          .attr("stroke", "#F59E0B")
          .attr("stroke-width", 2)
          .attr("opacity", 0.5);
      }
    }
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${plotWidth - 120}, 10)`);
    
    legend.append("rect")
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#3B82F6")
      .attr("opacity", 0.7);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text("P(X = x)");
    
    legend.append("rect")
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 12)
      .attr("fill", "#10B981")
      .attr("opacity", 0.7);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text("P(Y = y)");
    
  }, [functionType, customA, customB, customC, highlightedValue]);
  
  // Process MathJax
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && statsRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([statsRef.current]);
        }
        window.MathJax.typesetPromise([statsRef.current]).catch(() => {});
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, [functionType, customA, customB, customC]);
  
  const stats = calculateStats();
  const transformedDist = getTransformedDistribution();
  
  return (
    <VisualizationContainer
      title="Function Transformations"
      tutorialSteps={tutorial_2_3_2}
      tutorialKey="function-transformations-2-3-2"
    >
      <div className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Functions of Random Variables: Y = g(X)</h3>
        <p className="text-sm text-neutral-400 mt-1">
          Explore how different functions transform probability distributions
        </p>
      </div>
      
      {/* Controls */}
      <div className="px-6 py-4 border-b border-neutral-700 bg-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Function Selection */}
          <div>
            <h4 className="text-sm font-medium text-neutral-300 mb-3">Select Transformation Function</h4>
            <div className="space-y-2">
              {Object.entries(functions).map(([key, func]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="function"
                    value={key}
                    checked={functionType === key}
                    onChange={(e) => setFunctionType(e.target.value)}
                    className="text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm text-neutral-300">
                    {func.name}: <span className="font-mono text-teal-400">{func.formula}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Custom Function Controls */}
          {functionType === 'custom' && (
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-3">Custom Polynomial Parameters</h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center justify-between text-sm text-neutral-400 mb-1">
                    <span>Coefficient a (X² term)</span>
                    <span className="font-mono text-teal-400">{customA.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={customA}
                    onChange={(e) => setCustomA(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-sm text-neutral-400 mb-1">
                    <span>Coefficient b (X term)</span>
                    <span className="font-mono text-teal-400">{customB.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={customB}
                    onChange={(e) => setCustomB(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-sm text-neutral-400 mb-1">
                    <span>Constant c</span>
                    <span className="font-mono text-teal-400">{customC.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={customC}
                    onChange={(e) => setCustomC(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Display Options */}
          {functionType !== 'custom' && (
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-3">Display Options</h4>
              <label className="flex items-center space-x-2 text-sm text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMapping}
                  onChange={(e) => setShowMapping(e.target.checked)}
                  className="rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
                />
                <span>Show function mapping visualization</span>
              </label>
            </div>
          )}
        </div>
      </div>
      
      {/* Visualizations */}
      <div className="p-6">
        <div className={`grid ${showMapping ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Function Mapping */}
          {showMapping && (
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Function Mapping</h4>
              <div className="bg-neutral-900 rounded-lg p-2">
                <svg
                  ref={mappingRef}
                  width={400}
                  height={300}
                  viewBox="0 0 400 300"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Hover over points to see mappings
              </p>
            </div>
          )}
          
          {/* Distribution Comparison */}
          <div className={showMapping ? '' : 'mx-auto max-w-3xl'}>
            <h4 className="text-sm font-medium text-neutral-300 mb-2">Distribution Comparison</h4>
            <div className="bg-neutral-900 rounded-lg p-2">
              <svg
                ref={distributionRef}
                width={700}
                height={300}
                viewBox="0 0 700 300"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Transformation Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">Transformation Details</h4>
          <div className="bg-neutral-900 rounded-lg p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 px-3 text-neutral-400">X</th>
                  <th className="text-left py-2 px-3 text-neutral-400">P(X = x)</th>
                  <th className="text-left py-2 px-3 text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: currentFunction.latex }} />
                  </th>
                  <th className="text-left py-2 px-3 text-neutral-400">Y</th>
                </tr>
              </thead>
              <tbody>
                {baseDistribution.map(({ x, p }) => {
                  const y = currentFunction.fn(x);
                  return (
                    <tr 
                      key={x} 
                      className={`border-b border-neutral-800 ${highlightedValue === x ? 'bg-amber-900/20' : ''}`}
                      onMouseOver={() => setHighlightedValue(x)}
                      onMouseOut={() => setHighlightedValue(null)}
                    >
                      <td className="py-2 px-3 font-mono">{x}</td>
                      <td className="py-2 px-3 font-mono">{(p * 100).toFixed(0)}%</td>
                      <td className="py-2 px-3 text-neutral-500">→</td>
                      <td className="py-2 px-3 font-mono text-teal-400">
                        {y !== null ? y.toFixed(2) : 'undefined'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Aggregated Y values */}
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <h5 className="text-sm font-medium text-teal-400 mb-2">Resulting Distribution of Y</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {transformedDist.map(({ y, p }) => (
                  <div key={y} className="bg-neutral-800 rounded p-2">
                    <div className="font-mono text-xs text-neutral-400">Y = {y.toFixed(2)}</div>
                    <div className="font-mono text-sm text-white">P = {(p * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Panel */}
      <div className="px-6 pb-6" ref={statsRef}>
        <div className="bg-neutral-900 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Statistical Properties</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Stats */}
            <div className="bg-neutral-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-blue-400 mb-2">Original (X)</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">E[X]</span>
                  <span className="font-mono text-white">{stats.original.mean.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Var(X)</span>
                  <span className="font-mono text-white">{stats.original.variance.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">SD(X)</span>
                  <span className="font-mono text-white">{stats.original.sd.toFixed(3)}</span>
                </div>
              </div>
            </div>
            
            {/* Transformed Stats */}
            <div className="bg-neutral-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-green-400 mb-2">Transformed (Y)</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">E[Y]</span>
                  <span className="font-mono text-white">{stats.transformed.mean.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Var(Y)</span>
                  <span className="font-mono text-white">{stats.transformed.variance.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">SD(Y)</span>
                  <span className="font-mono text-white">{stats.transformed.sd.toFixed(3)}</span>
                </div>
              </div>
            </div>
            
            {/* Important Note */}
            <div className="bg-neutral-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-amber-400 mb-2">Key Insight</h5>
              <p className="text-xs text-neutral-300 mb-2">
                For non-linear transformations:
              </p>
              <div className="text-xs font-mono text-teal-400">
                <span dangerouslySetInnerHTML={{ __html: `E[g(X)] = ${stats.direct.toFixed(3)}` }} />
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                <span dangerouslySetInnerHTML={{ __html: `Note: E[g(X)] \neq g(E[X]) in general!` }} />
              </p>
              {functionType === 'square' && (
                <p className="text-xs text-neutral-500 mt-2">
                  <span dangerouslySetInnerHTML={{ __html: `\\(g(E[X]) = (${stats.original.mean.toFixed(2)})^2 = ${(stats.original.mean ** 2).toFixed(3)}\\)` }} />
                </p>
              )}
            </div>
          </div>
          
          {/* Special Cases */}
          <div className="mt-4 p-3 bg-neutral-800 rounded-md">
            <h5 className="text-sm font-medium text-teal-400 mb-2">Properties by Function Type</h5>
            <div className="text-xs text-neutral-300 space-y-1">
              {functionType === 'square' && (
                <>
                  <p>• <span dangerouslySetInnerHTML={{ __html: `The square function maps negative values to positive, creating symmetry` }} /></p>                  <p>• <span dangerouslySetInnerHTML={{ __html: `Multiple X values can map to the same Y value (e.g., \\(X = -2\\) and \\(X = 2\\) both map to \\(Y = 4\\))` }} /></p>                  <p>• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X^2) \\neq [\\text{Var}(X)]^2\\)` }} /></p>
                </>
              )}
              {functionType === 'abs' && (
                <>
                  <p>• The absolute value function creates a "folding" effect at X = 0</p>
                  <p>• Negative values are reflected to positive</p>
                  <p>• Preserves the magnitude but not the sign</p>
                </>
              )}
              {functionType === 'cube' && (
                <>
                  <p>• The cube function preserves the sign of X</p>
                  <p>• Creates a one-to-one mapping (each X maps to unique Y)</p>
                  <p>• Amplifies differences for |X| &gt; 1</p>
                </>
              )}
              {functionType === 'sqrt' && (
                <>
                  <p>• Only defined for X ≥ 0</p>
                  <p>• Compresses the range of values</p>
                  <p>• Creates a concave transformation</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </VisualizationContainer>
  );
};

export default FunctionTransformations;