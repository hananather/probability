"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import * as d3 from "@/utils/d3-utils";
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { 
  VisualizationContainer, 
  VisualizationSection,
  ControlGroup
} from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { useMathJax } from '../../hooks/useMathJax';
import { AnimatePresence } from 'framer-motion';
import { Chapter2ReferenceSheet } from '../reference-sheets/Chapter2ReferenceSheet';

// Import Gold Standard components
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox, StepInterpretation } from '../ui/patterns/InterpretationBox';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '../ui/patterns/StepByStepCalculation';

// Use probability color scheme for random variables
const colorScheme = createColorScheme('probability');

// Constants - Original dimensions
const WIDTH_GRID = 720;
const HEIGHT_GRID = 560;
const RADIUS = 22;
const WIDTH_DIST = 320;
const HEIGHT_DIST = 300;
const PAD_DIST = 15;


// Main component using original design with educational improvements
const SpatialRandomVariable = () => {
  // Refs for D3 elements
  const svgGridRef = useRef(null);
  const svgDistRef = useRef(null);
  const mousePaintingRef = useRef(0); // -1: erase, 0: not painting, 1: fill
  const samplingIntervalRef = useRef(null);
  const animationsRef = useRef(new Set());
  
  // Use MathJax hook for formula rendering
  useMathJax();
  
  // State - using original color scheme
  const [availableColors] = useState([
    '#14b8a6', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6', 
    '#10b981', '#f97316', '#ec4899', '#06b6d4', '#84cc16'
  ]);
  const [remainingColors, setRemainingColors] = useState([...availableColors]);
  const [colorMap, setColorMap] = useState({ 0: "#6B7280" });
  const [valueInput, setValueInput] = useState('');
  const [legendItems, setLegendItems] = useState([]);
  const [isSampling, setIsSampling] = useState(false);
  
  // Track values and total
  const valuesRef = useRef({ 0: 0 });
  const totalRef = useRef(0);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [drawnHexCount, setDrawnHexCount] = useState(0);

  // Initialize hexagonal grid
  const initializeHexGrid = useCallback(() => {
    const svg = d3.select(svgGridRef.current);
    svg.selectAll("*").remove();
    
    // Create hexbin generator
    const hexbin = d3Hexbin()
      .size([WIDTH_GRID, HEIGHT_GRID])
      .radius(RADIUS);
    
    // Generate hexagon centers
    const hexCenters = [];
    const cols = Math.floor(WIDTH_GRID / (RADIUS * Math.sqrt(3)));
    const rows = Math.floor(HEIGHT_GRID / (RADIUS * 1.5));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * RADIUS * Math.sqrt(3) + (row % 2 === 1 ? RADIUS * Math.sqrt(3) / 2 : 0) + RADIUS;
        const y = row * RADIUS * 1.5 + RADIUS;
        if (x <= WIDTH_GRID - RADIUS && y <= HEIGHT_GRID - RADIUS) {
          hexCenters.push([x, y]);
        }
      }
    }
    
    // Create hexagons
    const hexagons = svg.selectAll(".hexagon")
      .data(hexbin(hexCenters))
      .enter().append("path")
      .attr("class", "hexagon")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("fill", colorMap[0])
      .style("stroke", "#374151")
      .style("stroke-width", "1px")
      .style("cursor", "pointer")
      .each(function(d) {
        d.value = 0;
        d.drawn = false;
      });
    
    // Setup interactions
    setupHexagonInteractions(hexagons);
  }, [colorMap]);

  // Setup hexagon interactions
  const setupHexagonInteractions = (hexagons) => {
    hexagons
      .on("mouseenter", function() {
        if (mousePaintingRef.current === 0) {
          d3.select(this)
            .style("stroke", "#14B8A6")
            .style("stroke-width", "2px");
        }
      })
      .on("mouseleave", function() {
        const d = d3.select(this).datum();
        if (!d.drawn) {
          d3.select(this)
            .style("stroke", "#374151")
            .style("stroke-width", "1px");
        }
      })
      .on("mousedown", function() {
        const d = d3.select(this).datum();
        mousePaintingRef.current = d.drawn ? -1 : 1;
        updateHexagon.call(this, d);
      })
      .on("mousemove", function() {
        if (mousePaintingRef.current !== 0) {
          const d = d3.select(this).datum();
          updateHexagon.call(this, d);
        }
      });
    
    d3.select(svgGridRef.current).on("mouseup", () => {
      mousePaintingRef.current = 0;
    });
    
    window.addEventListener("mouseup", () => {
      mousePaintingRef.current = 0;
    });
  };

  // Update hexagon state
  const updateHexagon = function(d) {
    const shouldDraw = mousePaintingRef.current === 1;
    if (d.drawn === shouldDraw) return;
    
    d.drawn = shouldDraw;
    d3.select(this)
      .style("fill", shouldDraw ? "#374151" : colorMap[0])
      .style("stroke", shouldDraw ? "#14B8A6" : "#374151")
      .style("stroke-width", shouldDraw ? "2px" : "1px");
    
    const drawnCount = d3.select(svgGridRef.current)
      .selectAll(".hexagon")
      .nodes()
      .filter(node => d3.select(node).datum().drawn).length;
    
    setDrawnHexCount(drawnCount);
  };

  // Initialize distribution chart
  const initializeDistributionChart = useCallback(() => {
    const svg = d3.select(svgDistRef.current);
    svg.selectAll("*").remove();
    
    // Scales
    const xScale = d3.scaleBand()
      .range([0, WIDTH_DIST - 2*PAD_DIST])
      .padding(0.4);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([HEIGHT_DIST - 2*PAD_DIST, 0]);
    
    svgDistRef.current.xScale = xScale;
    svgDistRef.current.yScale = yScale;
    
    // Create groups
    const mainGroup = svg.append("g")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`);
    
    // Add grid lines
    const yAxisGrid = mainGroup.append("g")
      .attr("class", "y-axis-grid")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(WIDTH_DIST - 2*PAD_DIST))
        .tickFormat("")
      );
    
    yAxisGrid.selectAll("line")
      .style("stroke", "#374151")
      .style("stroke-opacity", 0.3);
    
    // Add axes
    const xAxisGroup = svg.append("g")
      .attr("class", "x-axis-group")
      .attr("transform", `translate(${PAD_DIST},${HEIGHT_DIST - PAD_DIST})`);
    
    xAxisGroup.append("line")
      .attr("class", "x-axis-line")
      .attr("x1", 0)
      .attr("x2", WIDTH_DIST - 2*PAD_DIST)
      .attr("y1", 0)
      .attr("y2", 0)
      .style("stroke", "#6B7280")
      .style("stroke-width", "1px");
    
    const yAxisGroup = svg.append("g")
      .attr("class", "y-axis-group")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`);
    
    // Add labels
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", WIDTH_DIST / 2)
      .attr("y", HEIGHT_DIST - 2)
      .style("fill", "#9CA3AF")
      .style("font-size", "11px")
      .text("Value");
    
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("y", 2)
      .attr("x", -HEIGHT_DIST / 2)
      .style("fill", "#9CA3AF")
      .style("font-size", "11px")
      .text("Frequency");
    
    // Create bars group
    mainGroup.append("g")
      .attr("class", "bars-group");
  }, []);

  // Update distribution chart
  const updateDistributionChart = useCallback(() => {
    if (!svgDistRef.current) return;
    
    const svg = d3.select(svgDistRef.current);
    const xScale = svgDistRef.current.xScale;
    const yScale = svgDistRef.current.yScale;
    
    // Prepare data
    const data = Object.entries(valuesRef.current)
      .filter(([value, count]) => count > 0)
      .map(([value, count]) => ({
        value: parseFloat(value),
        count: count,
        frequency: totalRef.current > 0 ? count / totalRef.current : 0
      }))
      .sort((a, b) => a.value - b.value);
    
    // Update scales
    xScale.domain(data.map(d => d.value));
    yScale.domain([0, Math.max(1, d3.max(data, d => d.count))]);
    
    // Update x-axis
    const xAxisGroup = svg.select(".x-axis-group");
    xAxisGroup.selectAll(".tick").remove();
    
    data.forEach(d => {
      const tick = xAxisGroup.append("g")
        .attr("class", "tick")
        .attr("transform", `translate(${xScale(d.value) + xScale.bandwidth() / 2},0)`);
      
      tick.append("line")
        .attr("y2", 6)
        .style("stroke", "#6B7280");
      
      tick.append("text")
        .attr("y", 16)
        .attr("text-anchor", "middle")
        .style("fill", "#9CA3AF")
        .style("font-size", "10px")
        .text(d.value);
    });
    
    // Update y-axis
    const yAxisGroup = svg.select(".y-axis-group");
    yAxisGroup.selectAll(".tick").remove();
    
    const yTicks = yScale.ticks(5);
    yTicks.forEach(tick => {
      const tickGroup = yAxisGroup.append("g")
        .attr("class", "tick")
        .attr("transform", `translate(0,${yScale(tick)})`);
      
      tickGroup.append("line")
        .attr("x2", -6)
        .style("stroke", "#6B7280");
      
      tickGroup.append("text")
        .attr("x", -10)
        .attr("text-anchor", "end")
        .attr("dy", "0.32em")
        .style("fill", "#9CA3AF")
        .style("font-size", "10px")
        .text(tick);
    });
    
    // Update bars
    const barsGroup = svg.select(".bars-group");
    const bars = barsGroup.selectAll(".bar").data(data, d => d.value);
    
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.value))
      .attr("y", HEIGHT_DIST - 2*PAD_DIST)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .style("fill", d => colorMap[d.value] || "#6B7280")
      .merge(bars)
      .transition()
      .duration(300)
      .attr("x", d => xScale(d.value))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => HEIGHT_DIST - 2*PAD_DIST - yScale(d.count))
      .style("fill", d => colorMap[d.value] || "#6B7280");
    
    bars.exit().remove();
  }, [colorMap]);

  // Handle value submission
  const handleValueSubmit = () => {
    const value = parseFloat(valueInput);
    if (isNaN(value)) return;
    
    const hexagons = d3.select(svgGridRef.current).selectAll(".hexagon");
    let color = colorMap[value];
    
    if (!color) {
      if (remainingColors.length > 0) {
        color = remainingColors[Math.floor(Math.random() * remainingColors.length)];
        setRemainingColors(prev => prev.filter(c => c !== color));
      } else {
        color = availableColors[Math.floor(Math.random() * availableColors.length)];
      }
      setColorMap(prev => ({ ...prev, [value]: color }));
    }
    
    hexagons.each(function(d) {
      if (d.drawn) {
        d.value = value;
        d.drawn = false;
        d3.select(this)
          .style("fill", color)
          .style("stroke", "#374151")
          .style("stroke-width", "1px");
      }
    });
    
    if (!legendItems.find(item => item.value === value)) {
      setLegendItems(prev => [...prev, { value, color }].sort((a, b) => a.value - b.value));
    }
    
    setValueInput('');
    setDrawnHexCount(0);
    resetSampling();
  };

  // Add sample point
  const addPoint = (pos, hexData) => {
    const value = hexData.value;
    const color = colorMap[value] || "#6B7280";
    
    valuesRef.current[value] = (valuesRef.current[value] || 0) + 1;
    totalRef.current += 1;
    setUpdateTrigger(prev => prev + 1);
    
    // Create animated sample dot
    const svg = d3.select(svgGridRef.current);
    const circle = svg.append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", 5)
      .style("fill", color)
      .style("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)
      .style("pointer-events", "none");
    
    animationsRef.current.add(circle.node());
    
    // Animate expansion and fade
    circle.transition()
      .duration(200)
      .attr("r", 12)
      .style("opacity", 0.6)
      .transition()
      .duration(300)
      .attr("r", 18)
      .style("opacity", 0)
      .remove()
      .on("end", () => {
        if (circle.node()) {
          animationsRef.current.delete(circle.node());
        }
      });
    
    // Highlight the hexagon
    const hexagon = svg.selectAll(".hexagon")
      .filter(d => d === hexData);
    
    hexagon
      .transition()
      .duration(100)
      .style("transform", "scale(1.05)")
      .style("filter", `brightness(1.3)`)
      .transition()
      .duration(200)
      .style("transform", "scale(1)")
      .style("filter", "brightness(1)");
  };

  // Start sampling
  const startSampling = () => {
    setIsSampling(true);
    
    samplingIntervalRef.current = setInterval(() => {
      const randomX = Math.random() * WIDTH_GRID;
      const randomY = Math.random() * HEIGHT_GRID;
      const pos = [randomX, randomY];
      
      // Find nearest hexagon
      const hexagons = d3.select(svgGridRef.current).selectAll(".hexagon");
      let closestHex = null;
      let minDistance = Infinity;
      
      hexagons.each(function(d) {
        const dist = Math.sqrt(Math.pow(d.x - randomX, 2) + Math.pow(d.y - randomY, 2));
        if (dist < minDistance && dist < RADIUS) {
          minDistance = dist;
          closestHex = d;
        }
      });
      
      if (closestHex) {
        addPoint(pos, closestHex);
      }
    }, 100);
  };

  // Stop sampling
  const stopSampling = () => {
    if (samplingIntervalRef.current) {
      clearInterval(samplingIntervalRef.current);
      samplingIntervalRef.current = null;
    }
    setIsSampling(false);
  };

  // Reset sampling
  const resetSampling = () => {
    stopSampling();
    valuesRef.current = Object.keys(colorMap).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    totalRef.current = 0;
    setUpdateTrigger(prev => prev + 1);
  };

  // Full reset
  const handleFullReset = () => {
    resetSampling();
    setColorMap({ 0: "#6B7280" });
    setRemainingColors([...availableColors]);
    setLegendItems([]);
    setDrawnHexCount(0);
    initializeHexGrid();
  };

  // Effects
  useEffect(() => {
    initializeHexGrid();
    initializeDistributionChart();
  }, []);

  useEffect(() => {
    updateDistributionChart();
  }, [updateTrigger, updateDistributionChart]);

  useEffect(() => {
    return () => {
      stopSampling();
      animationsRef.current.forEach(node => {
        d3.select(node).interrupt().remove();
      });
    };
  }, []);

  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <VisualizationContainer
      title="Random Variable Builder"
      description={
        <>
          <p className={typography.description}>
            <strong>See it in action!</strong> A random variable is simply a 
            <span className="text-teal-400 mx-1">function that assigns numbers to outcomes</span>.
            Build your own by creating regions and assigning them values.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            <span className="text-yellow-400">Remember:</span> Despite its confusing name, a random variable 
            is NOT random—it's a fixed mathematical function!
          </p>
        </>
      }
    >
      {/* Definition and Properties */}
      <VisualizationSection title="Definition & Key Properties" divider>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/20 p-4 rounded-lg border border-teal-700/50">
            <h3 className="text-lg font-semibold text-teal-400 mb-3">Mathematical Definition</h3>
            <p className="text-sm mb-3 text-neutral-300">A function that assigns numbers to outcomes</p>
            <div className="bg-neutral-800/50 p-3 rounded">
              <p className="text-sm font-mono text-teal-300">X: Ω → ℝ</p>
              <p className="text-xs text-neutral-400 mt-2">Maps each outcome ω ∈ Ω to a real number X(ω)</p>
            </div>
            <div className="mt-3 text-xs text-neutral-400">
              <p>• Domain: Sample space Ω</p>
              <p>• Codomain: Real numbers ℝ</p>
              <p>• Each outcome gets exactly one value</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-700/50">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Key Properties</h3>
            <p className="text-sm mb-3 text-neutral-300">What makes it special?</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">1.</span>
                <span className="text-neutral-300"><strong className="text-purple-300">Deterministic:</strong> Same outcome always gives same value</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">2.</span>
                <span className="text-neutral-300"><strong className="text-purple-300">Complete:</strong> Every outcome has a value</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">3.</span>
                <span className="text-neutral-300"><strong className="text-purple-300">Measurable:</strong> Enables probability calculations</span>
              </div>
            </div>
          </div>
        </div>
      </VisualizationSection>

      {/* Simple Instructions */}
      <VisualizationSection title="How to Use" className="mt-8">
        <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-teal-400">1.</span>
            <span>Click and drag to create regions on the grid</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-teal-400">2.</span>
            <span>Assign a numerical value to each region</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-teal-400">3.</span>
            <span>Click "Start Sampling" to see the distribution</span>
          </div>
        </div>
      </VisualizationSection>

      {/* Interactive Component */}
      <VisualizationSection title="Build Your Random Variable" className="mt-8">
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Left: Hexagonal Grid */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="p-0 bg-neutral-900 border-neutral-700">
              {/* Controls */}
              <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {drawnHexCount > 0 ? (
                      <>
                        <span className="text-sm text-neutral-400">{drawnHexCount} regions selected:</span>
                        <input
                          type="number"
                          step="any"
                          value={valueInput}
                          onChange={(e) => setValueInput(e.target.value)}
                          placeholder="Value"
                          className="px-2 py-1 w-20 text-sm bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500"
                          autoFocus
                        />
                        <Button
                          onClick={handleValueSubmit}
                          disabled={!valueInput}
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          Assign
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-500 italic">
                        {legendItems.length === 0 
                          ? "Click and drag to create regions" 
                          : "Create more regions or start sampling"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isSampling ? stopSampling : startSampling}
                      disabled={legendItems.length === 0}
                      size="sm"
                      className={isSampling ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {isSampling ? 'Stop' : 'Start Sampling'}
                    </Button>
                    <Button
                      onClick={handleFullReset}
                      size="sm"
                      variant="ghost"
                      className="hover:bg-neutral-700"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Grid */}
              <div className="p-4">
                <svg
                  ref={svgGridRef}
                  width={WIDTH_GRID}
                  height={HEIGHT_GRID}
                  style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                  viewBox={`0 0 ${WIDTH_GRID} ${HEIGHT_GRID}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="bg-neutral-950 rounded"
                />
              </div>
            </Card>
          </div>
          
          {/* Right: Stats and Distribution */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Legend */}
            <Card className="p-4 bg-neutral-900 border-neutral-700">
              <h4 className="text-sm font-semibold text-neutral-300 mb-3">Your Function X</h4>
              {legendItems.length === 0 ? (
                <p className="text-xs text-neutral-500">No mapping defined yet</p>
              ) : (
                <div className="space-y-2">
                  {legendItems.map(item => (
                    <div key={item.value} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-mono text-neutral-300">
                        X(<span style={{ color: item.color }}>■</span>) = {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Distribution Chart */}
            <Card className="p-4 bg-neutral-900 border-neutral-700">
              <h4 className="text-sm font-semibold text-neutral-300 mb-3">Sampling Results</h4>
              <div className="bg-neutral-950 rounded p-2">
                <svg
                  ref={svgDistRef}
                  width={WIDTH_DIST}
                  height={HEIGHT_DIST}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                  viewBox={`0 0 ${WIDTH_DIST} ${HEIGHT_DIST}`}
                  preserveAspectRatio="xMidYMid meet"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Bars show how often each value appears
              </p>
            </Card>
            
            {/* Sample Counter */}
            <Card className="p-4 bg-neutral-900 border-neutral-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Total samples</span>
                <span className="text-lg font-mono text-white font-semibold">
                  {totalRef.current}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </VisualizationSection>
    </VisualizationContainer>
    </>
  );
};

// Error boundary wrapper
class SpatialRandomVariableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('SpatialRandomVariable Error:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-neutral-800 rounded-lg shadow-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Visualization Error</h3>
          <p className="text-sm text-neutral-300">Please refresh the page.</p>
        </div>
      );
    }
    
    return <SpatialRandomVariable />;
  }
}

export default SpatialRandomVariableErrorBoundary;