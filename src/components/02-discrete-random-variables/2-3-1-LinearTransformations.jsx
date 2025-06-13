import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LinearTransformations = () => {
  // State for transformation parameters
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showTransformed, setShowTransformed] = useState(true);
  const [animating, setAnimating] = useState(false);
  
  // Refs for D3 visualizations
  const svgRef = useRef(null);
  const statsRef = useRef(null);
  
  // Base distribution data (dice roll)
  const baseDistribution = [
    { x: 1, p: 1/6 },
    { x: 2, p: 1/6 },
    { x: 3, p: 1/6 },
    { x: 4, p: 1/6 },
    { x: 5, p: 1/6 },
    { x: 6, p: 1/6 }
  ];
  
  // Calculate transformed distribution
  const getTransformedDistribution = () => {
    // Group by transformed values (important for negative 'a')
    const transformed = {};
    baseDistribution.forEach(({ x, p }) => {
      const newX = a * x + b;
      if (transformed[newX]) {
        transformed[newX] += p;
      } else {
        transformed[newX] = p;
      }
    });
    
    return Object.entries(transformed).map(([x, p]) => ({
      x: parseFloat(x),
      p
    })).sort((a, b) => a.x - b.x);
  };
  
  // Calculate statistics
  const calculateStats = (distribution) => {
    const expectation = distribution.reduce((sum, { x, p }) => sum + x * p, 0);
    const expectationSquared = distribution.reduce((sum, { x, p }) => sum + x * x * p, 0);
    const variance = expectationSquared - expectation * expectation;
    return { expectation, variance, sd: Math.sqrt(variance) };
  };
  
  // Animation constants
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  
  // Initialize and update visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate distributions and stats
    const transformedDist = getTransformedDistribution();
    const baseStats = calculateStats(baseDistribution);
    const transformedStats = calculateStats(transformedDist);
    
    // Create scales
    const allValues = [
      ...baseDistribution.map(d => d.x),
      ...transformedDist.map(d => d.x)
    ];
    const xExtent = d3.extent(allValues);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, plotWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.35])
      .range([plotHeight, 0]);
    
    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toFixed(1));
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);
    
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", plotWidth / 2)
      .attr("y", 40)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Value");
    
    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -plotHeight / 2)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Probability");
    
    // Style axes
    svg.selectAll(".x-axis, .y-axis")
      .style("color", "#9CA3AF");
    
    // Add gridlines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-plotWidth)
        .tickFormat("")
      );
    
    // Bar width calculation
    const barWidth = Math.min(30, plotWidth / (allValues.length * 2));
    
    // Draw original distribution
    if (showOriginal) {
      const originalBars = g.selectAll(".original-bar")
        .data(baseDistribution)
        .enter().append("rect")
        .attr("class", "original-bar")
        .attr("x", d => xScale(d.x) - barWidth / 2)
        .attr("y", d => yScale(d.p))
        .attr("width", barWidth)
        .attr("height", d => plotHeight - yScale(d.p))
        .attr("fill", "#3B82F6")
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 1);
          
          // Tooltip
          const tooltip = g.append("g")
            .attr("class", "tooltip");
          
          const rect = tooltip.append("rect")
            .attr("fill", "#1F2937")
            .attr("stroke", "#3B82F6")
            .attr("stroke-width", 1)
            .attr("rx", 4);
          
          const text = tooltip.append("text")
            .attr("fill", "#fff")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle");
          
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(`X = ${d.x}`);
          
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(`P(X = ${d.x}) = ${(d.p * 100).toFixed(1)}%`);
          
          const bbox = text.node().getBBox();
          rect.attr("x", bbox.x - 5)
            .attr("y", bbox.y - 5)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 10);
          
          tooltip.attr("transform", `translate(${xScale(d.x)},${yScale(d.p) - 40})`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.7);
          g.select(".tooltip").remove();
        });
      
      // Add expectation line for original
      g.append("line")
        .attr("class", "expectation-line-original")
        .attr("x1", xScale(baseStats.expectation))
        .attr("x2", xScale(baseStats.expectation))
        .attr("y1", 0)
        .attr("y2", plotHeight)
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);
      
      // Add expectation label
      g.append("text")
        .attr("x", xScale(baseStats.expectation))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#3B82F6")
        .attr("font-size", "12px")
        .text(`E[X] = ${baseStats.expectation.toFixed(2)}`);
    }
    
    // Draw transformed distribution
    if (showTransformed) {
      const transformedBars = g.selectAll(".transformed-bar")
        .data(transformedDist)
        .enter().append("rect")
        .attr("class", "transformed-bar")
        .attr("x", d => xScale(d.x) - barWidth / 2 + (showOriginal ? barWidth / 2 : 0))
        .attr("y", d => yScale(d.p))
        .attr("width", barWidth)
        .attr("height", d => plotHeight - yScale(d.p))
        .attr("fill", "#10B981")
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 1);
          
          // Tooltip
          const tooltip = g.append("g")
            .attr("class", "tooltip");
          
          const rect = tooltip.append("rect")
            .attr("fill", "#1F2937")
            .attr("stroke", "#10B981")
            .attr("stroke-width", 1)
            .attr("rx", 4);
          
          const text = tooltip.append("text")
            .attr("fill", "#fff")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle");
          
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(`Y = ${d.x}`);
          
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(`P(Y = ${d.x}) = ${(d.p * 100).toFixed(1)}%`);
          
          const bbox = text.node().getBBox();
          rect.attr("x", bbox.x - 5)
            .attr("y", bbox.y - 5)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 10);
          
          tooltip.attr("transform", `translate(${xScale(d.x)},${yScale(d.p) - 40})`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.7);
          g.select(".tooltip").remove();
        });
      
      // Add expectation line for transformed
      g.append("line")
        .attr("class", "expectation-line-transformed")
        .attr("x1", xScale(transformedStats.expectation))
        .attr("x2", xScale(transformedStats.expectation))
        .attr("y1", 0)
        .attr("y2", plotHeight)
        .attr("stroke", "#10B981")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);
      
      // Add expectation label
      g.append("text")
        .attr("x", xScale(transformedStats.expectation))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#10B981")
        .attr("font-size", "12px")
        .text(`E[Y] = ${transformedStats.expectation.toFixed(2)}`);
    }
    
    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${plotWidth - 150}, 20)`);
    
    if (showOriginal) {
      const originalLegend = legend.append("g");
      originalLegend.append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("fill", "#3B82F6")
        .attr("opacity", 0.7);
      
      originalLegend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .text("X (Original)");
    }
    
    if (showTransformed) {
      const transformedLegend = legend.append("g")
        .attr("transform", `translate(0, ${showOriginal ? 20 : 0})`);
      
      transformedLegend.append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("fill", "#10B981")
        .attr("opacity", 0.7);
      
      transformedLegend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .text("Y = aX + b");
    }
    
  }, [a, b, showOriginal, showTransformed]);
  
  // Process MathJax
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && statsRef.current) {
      window.MathJax.typesetPromise([statsRef.current]).catch(() => {
        // Silent error: MathJax processing error
      });
    }
  }, [a, b]);
  
  // Animate transformation
  const animateTransformation = () => {
    setAnimating(true);
    
    // Animate 'a' from 1 to current value
    const duration = 2000;
    const steps = 50;
    const aStep = (a - 1) / steps;
    const bStep = b / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setA(1 + aStep * currentStep);
        setB(bStep * currentStep);
      } else {
        clearInterval(interval);
        setAnimating(false);
        setA(a);
        setB(b);
      }
    }, duration / steps);
  };
  
  const baseStats = calculateStats(baseDistribution);
  const transformedStats = calculateStats(getTransformedDistribution());
  
  return (
    <div className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Linear Transformations: Y = aX + b</h3>
        <p className="text-sm text-neutral-400 mt-1">
          Explore how linear transformations affect distributions, expectation, and variance
        </p>
      </div>
      
      {/* Controls */}
      <div className="px-6 py-4 border-b border-neutral-700 bg-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Parameter Controls */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-neutral-300 mb-2">
                <span>Scale factor (a)</span>
                <span className="font-mono text-teal-400">{a.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                disabled={animating}
              />
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-neutral-300 mb-2">
                <span>Shift (b)</span>
                <span className="font-mono text-teal-400">{b.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                disabled={animating}
              />
            </div>
          </div>
          
          {/* Display Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-300 mb-2">Display Options</h4>
            <label className="flex items-center space-x-2 text-sm text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
                className="rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
              />
              <span>Show Original (X)</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showTransformed}
                onChange={(e) => setShowTransformed(e.target.checked)}
                className="rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
              />
              <span>Show Transformed (Y)</span>
            </label>
          </div>
          
          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={animateTransformation}
              disabled={animating}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              {animating ? 'Animating...' : 'Animate Transformation'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="p-6">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
        />
      </div>
      
      {/* Statistics Panel */}
      <div className="px-6 pb-6" ref={statsRef}>
        <div className="bg-neutral-900 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Properties of Linear Transformations</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expectation */}
            <div className="bg-neutral-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-teal-400 mb-2">Expectation</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(E[X]\\)` }} />
                  <span className="font-mono text-white">{baseStats.expectation.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(E[Y] = E[aX + b]\\)` }} />
                  <span className="font-mono text-white">{transformedStats.expectation.toFixed(3)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-neutral-700">
                  <div className="text-xs text-neutral-500">Verification:</div>
                  <div className="font-mono text-xs text-teal-400">
                    {a.toFixed(1)} × {baseStats.expectation.toFixed(3)} + {b.toFixed(1)} = {(a * baseStats.expectation + b).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Variance */}
            <div className="bg-neutral-800 rounded-md p-3">
              <h5 className="text-sm font-medium text-teal-400 mb-2">Variance</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X)\\)` }} />
                  <span className="font-mono text-white">{baseStats.variance.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(Y) = \\text{Var}(aX + b)\\)` }} />
                  <span className="font-mono text-white">{transformedStats.variance.toFixed(3)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-neutral-700">
                  <div className="text-xs text-neutral-500">Verification:</div>
                  <div className="font-mono text-xs text-teal-400">
                    {a.toFixed(1)}² × {baseStats.variance.toFixed(3)} = {(a * a * baseStats.variance).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Insights */}
          <div className="mt-4 p-3 bg-neutral-800 rounded-md">
            <h5 className="text-sm font-medium text-amber-400 mb-2">Key Properties</h5>
            <ul className="space-y-1 text-xs text-neutral-300">
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(E[aX + b] = aE[X] + b\\)` }} /> - Expectation is affected by both scaling and shifting</li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(aX + b) = a^2\\text{Var}(X)\\)` }} /> - Variance is only affected by scaling, not shifting</li>
              <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{SD}(aX + b) = |a|\\text{SD}(X)\\)` }} /> - Standard deviation scales by |a|</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearTransformations;