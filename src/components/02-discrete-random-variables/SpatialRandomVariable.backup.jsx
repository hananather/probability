import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';

const SpatialRandomVariable = () => {
  const statsRef = useRef(null);
  const distPanelRef = useRef(null);
  // Refs for D3 elements
  const svgGridRef = useRef(null);
  const svgDistRef = useRef(null);
  const mousePaintingRef = useRef(0); // -1: erase, 0: not painting, 1: fill
  const samplingIntervalRef = useRef(null);
  const animationsRef = useRef(new Set());
  
  // State
  const [availableColors] = useState([
    '#14b8a6', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6', 
    '#10b981', '#f97316', '#ec4899', '#06b6d4', '#84cc16'
  ]);
  const [remainingColors, setRemainingColors] = useState([...availableColors]);
  const [colorMap, setColorMap] = useState({ 0: "white" });
  const [valueInput, setValueInput] = useState('');
  const [legendItems, setLegendItems] = useState([]);
  const [isSampling, setIsSampling] = useState(false);
  
  // Track values and total
  const valuesRef = useRef({});
  const totalRef = useRef(0);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Constants - Option E layout
  const WIDTH_GRID = 720;
  const HEIGHT_GRID = 420;
  const RADIUS = 25;
  const BORDER = 1;
  const WIDTH_DIST = 280;
  const HEIGHT_DIST = 200;
  const PAD_DIST = 20;
  
  // Initialize hexagon grid
  useEffect(() => {
    if (!svgGridRef.current) return;
    
    const svg = d3.select(svgGridRef.current);
    svg.selectAll("*").remove();
    
    // Create hexbin generator
    const hexbin = d3Hexbin()
      .size([WIDTH_GRID, HEIGHT_GRID])
      .radius(RADIUS);
    
    svgGridRef.current.hexbin = hexbin;
    
    // Draw mesh
    svg.append("path")
      .attr("class", "mesh")
      .attr("d", hexbin.mesh())
      .style("fill", "none")
      .style("stroke", "#4B5563")
      .style("stroke-opacity", 0.4)
      .style("pointer-events", "none");
    
    // Create hexagon data
    const centers = hexbin.centers();
    const hexData = centers.map(center => ({
      x: center[0],
      y: center[1],
      i: center.i,
      j: center.j,
      fixed: 0,
      value: 0,
      fill: 0
    }));
    
    // Store references
    svgGridRef.current.hexData = hexData;
    
    // Draw hexagons
    const hexagons = svg.append("g")
      .attr("class", "hexagon")
      .selectAll("path")
      .data(hexData)
      .enter().append("path")
      .attr("d", hexbin.hexagon(RADIUS - BORDER/2))
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("id", (d, i) => `hex-${i}`)
      .style("fill", "#1F2937")
      .style("stroke", "#4B5563")
      .style("stroke-width", BORDER)
      .style("cursor", "pointer")
      .style("opacity", 0.95)
      .style("transition", "all 0.15s ease");
    
    // Mouse event handlers
    const mousedown = function(event, d) {
      if (!d) return;
      mousePaintingRef.current = d.fill ? -1 : 1;
      mousemove.call(this, event, d);
    };
    
    const mousemove = function(event, d) {
      if (!d || !mousePaintingRef.current || d.fixed) return;
      
      d.fill = mousePaintingRef.current > 0;
      d3.select(this)
        .style("fill", d.fill ? "#374151" : "#1F2937")
        .style("opacity", d.fill ? 1 : 0.95);
    };
    
    const mouseup = function(event, d) {
      if (!d) return;
      mousemove.call(this, event, d);
      mousePaintingRef.current = 0;
    };
    
    // Attach events
    hexagons
      .on("mousedown", mousedown)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);
    
    // Global mouseup
    d3.select(window).on("mouseup.spatial", () => {
      mousePaintingRef.current = 0;
    });
    
    return () => {
      d3.select(window).on("mouseup.spatial", null);
    };
  }, []);
  
  // Initialize distribution chart
  useEffect(() => {
    if (!svgDistRef.current) return;
    
    const svg = d3.select(svgDistRef.current);
    svg.selectAll("*").remove();
    
    // Container
    const container = svg.append("g")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`);
    svgDistRef.current.container = container;
    
    // Scales
    const xScale = d3.scaleBand()
      .range([0, WIDTH_DIST - 2*PAD_DIST])
      .padding(0.4);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([HEIGHT_DIST - 2*PAD_DIST, 0]);
    
    svgDistRef.current.xScale = xScale;
    svgDistRef.current.yScale = yScale;
    
    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(0);
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);
    
    const axisRVD = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${PAD_DIST},${HEIGHT_DIST - PAD_DIST})`)
      .style("font-size", "11px")
      .call(xAxis);
    
    const axisYRVD = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`)
      .style("font-size", "11px")
      .call(yAxis);
    
    // Style axes
    svg.selectAll(".axis line, .axis path")
      .style("stroke", "#6B7280")
      .style("stroke-width", 0.5)
      .style("shape-rendering", "crispEdges");
    
    svg.selectAll(".axis text")
      .style("fill", "#D1D5DB")
      .style("font-size", "10px");
    
    // Add gridlines
    const gridlines = svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(WIDTH_DIST - 2*PAD_DIST))
        .tickFormat("")
      );
    
    // Style the gridlines properly
    gridlines.selectAll("line")
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15);
    
    // Remove the domain line
    gridlines.select(".domain").remove();
    
    svgDistRef.current.xAxisRVD = xAxis;
    svgDistRef.current.axisRVD = axisRVD;
  }, []);
  
  // Add rectangle to distribution
  const addRect = (color, value) => {
    if (!svgDistRef.current || !svgDistRef.current.container) return;
    
    const containerRVD = svgDistRef.current.container;
    const xScaleRVD = svgDistRef.current.xScale;
    const xAxisRVD = svgDistRef.current.xAxisRVD;
    const axisRVD = svgDistRef.current.axisRVD;
    
    const key = Object.keys(valuesRef.current);
    const range = key.sort((a, b) => parseFloat(a) - parseFloat(b));
    
    xScaleRVD.domain(range);
    xAxisRVD.ticks(range.length);
    axisRVD.call(xAxisRVD);
    
    const RVRects = containerRVD.selectAll("rect").data(key, d => d);
    
    RVRects.enter().append("rect")
      .attr("id", d => `bar${d}`)
      .attr("fill", color)
      .attr("opacity", 0.8)
      .attr("x", d => xScaleRVD(d))
      .attr("y", HEIGHT_DIST - 2*PAD_DIST)
      .attr("width", xScaleRVD.bandwidth())
      .attr("height", 0);
    
    RVRects.exit().remove();
    
    updateRect();
  };
  
  // Update bar heights
  const updateRect = () => {
    if (!svgDistRef.current || !svgDistRef.current.container) return;
    
    const containerRVD = svgDistRef.current.container;
    const xScaleRVD = svgDistRef.current.xScale;
    const yScaleRVD = svgDistRef.current.yScale;
    
    containerRVD.selectAll("rect")
      .transition()
      .duration(300)
      .attr("x", d => xScaleRVD(d))
      .attr("y", d => yScaleRVD(valuesRef.current[d] / Math.max(totalRef.current, 1)))
      .attr("height", d => yScaleRVD(1 - valuesRef.current[d] / Math.max(totalRef.current, 1)))
      .attr("width", xScaleRVD.bandwidth());
  };
  
  // Handle value submission
  const handleValueSubmit = (e) => {
    e?.preventDefault();
    if (remainingColors.length === 0) return;
    
    const value = parseFloat(valueInput);
    if (isNaN(value)) return;
    
    let color;
    if (colorMap[value] === undefined) {
      const index = Math.floor(Math.random() * remainingColors.length);
      color = remainingColors[index];
      const newRemainingColors = [...remainingColors];
      newRemainingColors.splice(index, 1);
      setRemainingColors(newRemainingColors);
      
      setColorMap(prev => ({ ...prev, [value]: color }));
      setLegendItems(prev => [...prev, { color, value }]);
    } else {
      color = colorMap[value];
    }
    
    // Fix color on hexagons
    const svg = d3.select(svgGridRef.current);
    svg.selectAll(".hexagon path").each(function(d) {
      if (d.fill) {
        d.fill = 0;
        d.value = value;
        d.fixed = 1;
        d3.select(this)
          .style("fill", color)
          .style("stroke", color)
          .style("stroke-width", BORDER);
      }
    });
    
    resetSamples();
    setValueInput('');
  };
  
  // Add point animation
  const addPoint = (pos, color, value) => {
    if (valuesRef.current[value] === undefined) {
      valuesRef.current[value] = 1;
      addRect(color, value);
    } else {
      valuesRef.current[value] += 1;
      updateRect();
    }
    totalRef.current += 1;
    setUpdateTrigger(prev => prev + 1);
    
    // Animate point
    const svg = d3.select(svgGridRef.current);
    const circle = svg.append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", 5)
      .style("fill", "black")
      .attr("opacity", 1);
    
    animationsRef.current.add(circle.node());
    
    circle.transition()
      .style("fill", color)
      .duration(1000)
      .on("end", function() {
        d3.select(this).remove();
        animationsRef.current.delete(this);
      });
  };
  
  // Start sampling
  const startSampling = () => {
    if (samplingIntervalRef.current) {
      clearInterval(samplingIntervalRef.current);
    }
    
    setIsSampling(true);
    const hexbin = svgGridRef.current?.hexbin;
    const hexData = svgGridRef.current?.hexData;
    if (!hexbin || !hexData) return;
    
    samplingIntervalRef.current = setInterval(() => {
      const randomX = Math.random() * WIDTH_GRID;
      const randomY = Math.random() * HEIGHT_GRID;
      const pos = [randomX, randomY];
      
      let minDist = Infinity;
      let closestData = null;
      let closestIndex = -1;
      
      hexData.forEach((d, i) => {
        const dx = pos[0] - d.x;
        const dy = pos[1] - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist) {
          minDist = dist;
          closestData = d;
          closestIndex = i;
        }
      });
      
      if (closestData && closestIndex >= 0) {
        const hexElement = d3.select(`#hex-${closestIndex}`);
        if (!hexElement.empty()) {
          const color = hexElement.style("fill");
          const value = closestData.value;
          addPoint(pos, color, value);
        }
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
  
  // Reset samples only
  const resetSamples = () => {
    valuesRef.current = {};
    totalRef.current = 0;
    setUpdateTrigger(prev => prev + 1);
    
    addRect('white', 0);
    stopSampling();
    
    animationsRef.current.forEach(node => {
      d3.select(node).remove();
    });
    animationsRef.current.clear();
  };
  
  // Full reset
  const handleFullReset = () => {
    resetSamples();
    setLegendItems([]);
    setRemainingColors([...availableColors]);
    setColorMap({ 0: "white" });
    
    const svg = d3.select(svgGridRef.current);
    svg.selectAll(".hexagon path").each(function(d) {
      d.fill = 0;
      d.value = 0;
      d.fixed = 0;
      d3.select(this)
        .style("fill", "#1F2937")
        .style("stroke", "#4B5563")
        .style("stroke-width", BORDER);
    });
  };
  
  // Calculate stats
  const calculateStats = () => {
    if (totalRef.current === 0) return { mean: 0, variance: 0 };
    
    let mean = 0;
    Object.entries(valuesRef.current).forEach(([value, count]) => {
      mean += parseFloat(value) * count;
    });
    mean /= totalRef.current;
    
    let variance = 0;
    Object.entries(valuesRef.current).forEach(([value, count]) => {
      variance += Math.pow(parseFloat(value) - mean, 2) * count;
    });
    variance /= totalRef.current;
    
    return { mean, variance };
  };
  
  useEffect(() => {
    resetSamples();
    
    // Initial MathJax processing
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        const elements = [];
        if (distPanelRef.current) elements.push(distPanelRef.current);
        
        if (elements.length > 0) {
          window.MathJax.typesetPromise(elements).catch(console.error);
        }
      }
    };
    
    // Process immediately and after a delay
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 200);
    return () => clearTimeout(timeoutId);
  }, []);
  
  useEffect(() => {
    return () => {
      stopSampling();
      animationsRef.current.forEach(node => {
        d3.select(node).remove();
      });
    };
  }, []);
  
  // Process MathJax for distribution panel
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
        const elements = [];
        if (distPanelRef.current) elements.push(distPanelRef.current);
        if (statsRef.current) elements.push(statsRef.current);
        
        if (elements.length > 0) {
          elements.forEach(el => {
            if (window.MathJax.typesetClear) {
              window.MathJax.typesetClear([el]);
            }
          });
          window.MathJax.typesetPromise(elements).catch(console.error);
        }
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [updateTrigger]); // Changed to updateTrigger to ensure it runs on every update
  
  const stats = calculateStats();
  
  return (
    <div className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
      {/* Main Content Area */}
      <div className="grid grid-cols-[1fr,auto]">
        
        {/* Left: Hexagonal Canvas - The Crown Jewel */}
        <div className="bg-neutral-900 border-r border-neutral-700">
          <svg
            ref={svgGridRef}
            width={WIDTH_GRID}
            height={HEIGHT_GRID}
            style={{ display: 'block', width: '100%', height: 'auto' }}
            viewBox={`0 0 ${WIDTH_GRID} ${HEIGHT_GRID}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
        
        {/* Right: Distribution Panel */}
        <div className="bg-neutral-800/70 w-[300px] p-3 flex flex-col" ref={distPanelRef}>
          {/* Distribution Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-teal-400">
              <span dangerouslySetInnerHTML={{ __html: `\\(P(X = x)\\)` }} />
            </h3>
            <div className="text-sm">
              <span className="text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(n = \\)` }} />
              <span className="font-mono text-teal-400">{totalRef.current}</span>
            </div>
          </div>
          
          {/* Distribution Chart */}
          <div className="bg-neutral-900 rounded-md p-1 shadow-inner">
            <svg
              ref={svgDistRef}
              width={WIDTH_DIST}
              height={HEIGHT_DIST}
              style={{ display: 'block', width: '100%', height: 'auto' }}
              viewBox={`0 0 ${WIDTH_DIST} ${HEIGHT_DIST}`}
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
          
          {/* Stats */}
          <div className="mt-3 pt-3 border-t border-neutral-700 space-y-1" ref={statsRef}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(E[X]\\)` }} />
              <span className="font-mono text-teal-400 font-medium">
                {stats.mean.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400" dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X)\\)` }} />
              <span className="font-mono text-teal-400 font-medium">
                {stats.variance.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom: Controls Bar */}
      <div className="bg-neutral-800 border-t border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Value Assignment */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Value"
              className="w-20 px-2.5 py-1.5 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm border border-neutral-600"
            />
            <button
              onClick={handleValueSubmit}
              disabled={remainingColors.length === 0 || !valueInput}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Assign
            </button>
            
            {/* Value Mappings */}
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-600">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1 bg-neutral-700 px-2 py-1 rounded-md">
                  <div 
                    className="w-3 h-3 rounded-sm shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono text-xs text-white">→{item.value}</span>
                </div>
              ))}
              {remainingColors.length > 0 && legendItems.length > 0 && (
                <span className="text-xs text-neutral-500">[{remainingColors.length} colors left]</span>
              )}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={startSampling}
              disabled={legendItems.length === 0}
              className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              {isSampling ? 'Sampling...' : 'Start Sampling'}
            </button>
            <button
              onClick={stopSampling}
              disabled={!isSampling}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Stop
            </button>
            <button
              onClick={handleFullReset}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialRandomVariable;