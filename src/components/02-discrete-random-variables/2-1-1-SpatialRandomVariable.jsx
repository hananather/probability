import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { tutorial_2_1_1 } from '@/tutorials/chapter2';

const SpatialRandomVariable = () => {
  const statsRef = useRef(null);
  const distPanelRef = useRef(null);
  // Refs for D3 elements
  const svgGridRef = useRef(null);
  const svgDistRef = useRef(null);
  const mousePaintingRef = useRef(0); // -1: erase, 0: not painting, 1: fill
  const samplingIntervalRef = useRef(null);
  const animationsRef = useRef(new Set());
  
  // Add error boundary for debugging
  useEffect(() => {
    const handleError = (event) => {
      console.error('D3 Error caught:', event.error);
      console.error('Stack:', event.error?.stack);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // State
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
  const valuesRef = useRef({});
  const totalRef = useRef(0);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [drawnHexCount, setDrawnHexCount] = useState(0);
  
  // Constants - Responsive layout
  const WIDTH_GRID = 720;
  const HEIGHT_GRID = 560;
  const RADIUS = 22;
  const BORDER = 1;
  const WIDTH_DIST = 320;
  const HEIGHT_DIST = 300;
  const PAD_DIST = 15;
  
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
      if (!d || d.fixed) return;
      mousePaintingRef.current = d.fill ? -1 : 1;
      mousemove.call(this, event, d);
    };
    
    const mousemove = function(event, d) {
      if (!d || !mousePaintingRef.current || d.fixed) return;
      
      const wasFilled = d.fill;
      d.fill = mousePaintingRef.current > 0;
      
      if (wasFilled !== d.fill) {
        setDrawnHexCount(prev => d.fill ? prev + 1 : prev - 1);
      }
      
      d3.select(this)
        .style("fill", d.fill ? "#374151" : "#1F2937")
        .style("stroke", d.fill ? "#14b8a6" : "#4B5563")
        .style("stroke-width", d.fill ? 2 : BORDER)
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
      .on("mouseup", mouseup)
      .on("mouseenter", function(event, d) {
        if (!d.fixed && !mousePaintingRef.current) {
          d3.select(this)
            .style("stroke", "#14b8a6")
            .style("stroke-width", 2)
            .style("opacity", 1);
        }
      })
      .on("mouseleave", function(event, d) {
        if (!d.fixed && !mousePaintingRef.current && !d.fill) {
          d3.select(this)
            .style("stroke", "#4B5563")
            .style("stroke-width", BORDER)
            .style("opacity", 0.95);
        }
      });
    
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
    
    // Y-axis only (we'll handle X-axis labels manually)
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);
    
    const axisYRVD = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`)
      .style("font-size", "11px")
      .call(yAxis);
    
    // X-axis group (empty, we'll populate it manually)
    const xAxisGroup = svg.append("g")
      .attr("class", "x-axis-group")
      .attr("transform", `translate(${PAD_DIST},${HEIGHT_DIST - PAD_DIST})`);
    
    // Add x-axis line
    xAxisGroup.append("line")
      .attr("class", "x-axis-line")
      .attr("x1", 0)
      .attr("x2", WIDTH_DIST - 2*PAD_DIST)
      .attr("y1", 0)
      .attr("y2", 0)
      .style("stroke", "#6B7280")
      .style("stroke-width", 0.5);
    
    svgDistRef.current.xAxisGroup = xAxisGroup;
    
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
    
    // Initialize with value 0 bar
    setTimeout(() => {
      if (svgDistRef.current && svgDistRef.current.container) {
        valuesRef.current = { 0: 0 };
        addRect('#6B7280', 0);
      }
    }, 100);
  }, []);
  
  // Add rectangle to distribution
  const addRect = (color, value) => {
    if (!svgDistRef.current || !svgDistRef.current.container) return;
    
    const containerRVD = svgDistRef.current.container;
    const xScaleRVD = svgDistRef.current.xScale;
    const xAxisGroup = svgDistRef.current.xAxisGroup;
    
    const key = Object.keys(valuesRef.current);
    const range = key.sort((a, b) => parseFloat(a) - parseFloat(b));
    
    // Update scale domain
    xScaleRVD.domain(range);
    
    // Update x-axis labels manually
    if (xAxisGroup) {
      // Remove only text labels, keep the axis line
      xAxisGroup.selectAll("text").remove();
      
      // Add new labels
      range.forEach(val => {
        xAxisGroup.append("text")
          .attr("x", xScaleRVD(val) + xScaleRVD.bandwidth() / 2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .style("fill", "#D1D5DB")
          .style("font-size", "10px")
          .text(val);
      });
    }
    
    // Remove all existing rectangles and redraw
    containerRVD.selectAll("rect").remove();
    
    // Add rectangles for each value
    range.forEach(d => {
      containerRVD.append("rect")
        .attr("id", `bar${d}`)
        .attr("fill", colorMap[d] || color)
        .attr("opacity", 0.8)
        .attr("x", xScaleRVD(d))
        .attr("y", HEIGHT_DIST - 2*PAD_DIST)
        .attr("width", xScaleRVD.bandwidth())
        .attr("height", 0);
    });
    
    // Update heights after a small delay
    setTimeout(() => updateRect(), 50);
  };
  
  // Update bar heights
  const updateRect = () => {
    if (!svgDistRef.current || !svgDistRef.current.container) return;
    
    const containerRVD = svgDistRef.current.container;
    const xScaleRVD = svgDistRef.current.xScale;
    const yScaleRVD = svgDistRef.current.yScale;
    
    // Update each rect by ID to avoid data binding issues
    Object.keys(valuesRef.current).forEach(value => {
      const rect = containerRVD.select(`#bar${value}`);
      if (!rect.empty()) {
        const yPos = yScaleRVD(valuesRef.current[value] / Math.max(totalRef.current, 1));
        const height = yScaleRVD(1 - valuesRef.current[value] / Math.max(totalRef.current, 1));
        
        // Use try-catch to handle potential transition issues
        try {
          rect.transition()
            .duration(300)
            .attr("y", yPos)
            .attr("height", height);
        } catch (e) {
          // If transition fails, set attributes directly
          rect.attr("y", yPos).attr("height", height);
        }
      }
    });
  };
  
  // Handle value submission
  const handleValueSubmit = (e) => {
    e?.preventDefault();
    if (remainingColors.length === 0 || drawnHexCount === 0) return;
    
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
      setLegendItems(prev => [...prev, { color, value, hexCount: drawnHexCount }]);
    } else {
      color = colorMap[value];
      // Update hex count for existing color
      setLegendItems(prev => prev.map(item => 
        item.value === value ? { ...item, hexCount: item.hexCount + drawnHexCount } : item
      ));
    }
    
    // Fix color on hexagons - avoid .each() to prevent DOM errors
    const hexData = svgGridRef.current?.hexData;
    if (!hexData) return;
    
    // Update data first
    let assignedCount = 0;
    hexData.forEach((hexagon) => {
      if (hexagon && hexagon.fill) {
        hexagon.fill = 0;
        hexagon.value = value;
        hexagon.fixed = 1;
        assignedCount++;
      }
    });
    
    // Then update visuals using simple selectors
    const svg = d3.select(svgGridRef.current);
    for (let i = 0; i < hexData.length; i++) {
      if (hexData[i].fixed && hexData[i].value === value) {
        const hexPath = svg.select(`#hex-${i}`);
        if (!hexPath.empty()) {
          hexPath
            .style("fill", color)
            .style("stroke", color)
            .style("stroke-width", BORDER)
            .style("opacity", 0.95);
        }
      }
    }
    
    resetSamples();
    setValueInput('');
    setDrawnHexCount(0);
  };
  
  // Add point animation with improved visual feedback
  const addPoint = (pos, color, value, hexIndex) => {
    if (valuesRef.current[value] === undefined) {
      valuesRef.current[value] = 1;
      addRect(color, value);
    } else {
      valuesRef.current[value] += 1;
      updateRect();
    }
    totalRef.current += 1;
    setUpdateTrigger(prev => prev + 1);
    
    // Animate point with better visual feedback
    const svg = d3.select(svgGridRef.current);
    
    // Pulse the hexagon that was hit
    if (hexIndex >= 0) {
      const hexagon = svg.select(`#hex-${hexIndex}`);
      if (!hexagon.empty()) {
        const originalFill = hexagon.style("fill");
        const originalOpacity = hexagon.style("opacity");
        
        // Quick pulse effect
        hexagon
          .transition()
          .duration(100)
          .style("fill", d3.color(color).brighter(1))
          .style("opacity", 1)
          .style("filter", `drop-shadow(0 0 8px ${color})`)
          .transition()
          .duration(300)
          .style("fill", originalFill)
          .style("opacity", originalOpacity)
          .style("filter", "none");
      }
    }
    
    // Create the sample dot with immediate color
    const circle = svg.append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", 6)
      .style("fill", color)  // Start with target color
      .style("stroke", "#ffffff")  // White border for contrast
      .style("stroke-width", "2px")
      .style("filter", `drop-shadow(0 0 6px ${color})`)  // Colored glow
      .attr("opacity", 1);
    
    const circleNode = circle.node();
    if (circleNode) {
      animationsRef.current.add(circleNode);
    }
    
    // Expand and fade animation
    circle.transition()
      .duration(200)
      .attr("r", 12)  // Expand
      .style("stroke-width", "3px")
      .attr("opacity", 0.8)
      .transition()
      .duration(300)
      .attr("r", 16)  // Continue expanding
      .attr("opacity", 0)  // Fade out
      .on("end", function() {
        // Use try-catch to handle potential DOM issues
        try {
          const node = this;
          if (node && node.parentNode) {
            node.parentNode.removeChild(node);
          }
          animationsRef.current.delete(node);
        } catch (e) {
          // Ignore errors from already removed nodes
        }
      });
    
    // Add a subtle trail ring effect
    const trail = svg.insert("circle", ":first-child")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", 6)
      .style("fill", "none")
      .style("stroke", color)
      .style("stroke-width", "1px")
      .attr("opacity", 0.5);
    
    trail.transition()
      .duration(500)
      .attr("r", 25)
      .attr("opacity", 0)
      .on("end", function() {
        d3.select(this).remove();
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
          addPoint(pos, color, value, closestIndex);
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
    valuesRef.current = { 0: 0 };
    totalRef.current = 0;
    setUpdateTrigger(prev => prev + 1);
    
    // Only reset the bar chart if SVG is ready
    if (svgDistRef.current && svgDistRef.current.container) {
      const containerRVD = svgDistRef.current.container;
      // Remove existing rectangles
      containerRVD.selectAll("rect").remove();
      
      // Ensure colorMap has value 0
      if (!colorMap[0]) {
        setColorMap(prev => ({ ...prev, 0: "#6B7280" }));
      }
      
      // Add the initial bar after a delay
      setTimeout(() => {
        if (svgDistRef.current && svgDistRef.current.container) {
          addRect(colorMap[0] || '#6B7280', 0);
        }
      }, 100);
    }
    
    stopSampling();
    
    // Clean up animations
    animationsRef.current.forEach(node => {
      try {
        d3.select(node).remove();
      } catch (e) {
        // Ignore errors from already removed nodes
      }
    });
    animationsRef.current.clear();
  };
  
  // Full reset
  const handleFullReset = () => {
    resetSamples();
    setLegendItems([]);
    setRemainingColors([...availableColors]);
    setColorMap({ 0: "#6B7280" });
    setDrawnHexCount(0);
    
    const hexData = svgGridRef.current?.hexData;
    if (!hexData) return;
    
    // Reset data first
    for (let i = 0; i < hexData.length; i++) {
      hexData[i].fill = 0;
      hexData[i].value = 0;
      hexData[i].fixed = 0;
    }
    
    // Then reset visuals
    const svg = d3.select(svgGridRef.current);
    for (let i = 0; i < hexData.length; i++) {
      const hexPath = svg.select(`#hex-${i}`);
      if (!hexPath.empty()) {
        hexPath
          .style("fill", "#1F2937")
          .style("stroke", "#4B5563")
          .style("stroke-width", BORDER)
          .style("opacity", 0.95);
      }
    }
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
    // Initial setup - ensure value 0 is in the values
    valuesRef.current = { 0: 0 };
    totalRef.current = 0;
    
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
    
    // Initialize the chart after a delay
    const chartTimeout = setTimeout(() => {
      if (svgDistRef.current && svgDistRef.current.container && colorMap) {
        addRect(colorMap[0] || '#6B7280', 0);
      }
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(chartTimeout);
    };
  }, [colorMap]);
  
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
  
  // Calculate total hexagons for probability
  const totalHexagons = legendItems.reduce((sum, item) => sum + item.hexCount, 0);
  
  // Get contextual instruction
  const getInstruction = () => {
    if (legendItems.length === 0 && drawnHexCount === 0) {
      return "Click and drag to select hexagons, then assign them a value";
    } else if (drawnHexCount > 0) {
      return `${drawnHexCount} hexagons selected - assign them a value`;
    } else if (legendItems.length > 0) {
      return "Draw more regions or start sampling to see probabilities";
    }
    return "";
  };
  
  return (
    <VisualizationContainer
      tutorialSteps={tutorial_2_1_1}
      tutorialKey="spatial-random-variable-2-1-1"
    >
      <div className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full">
      {/* Top: Header with Instructions */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Spatial Random Variable</h3>
          <p className="text-xs text-amber-400 italic">{getInstruction()}</p>
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Value Assignment */}
          <div className="flex items-center gap-3">
            {drawnHexCount > 0 && (
              <>
                <span className="text-sm text-neutral-400">{drawnHexCount} hexagons selected:</span>
                <input
                  type="number"
                  step="any"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="Value"
                  className="w-24 px-2.5 py-1.5 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm border border-neutral-600"
                  autoFocus
                />
                <button
                  onClick={handleValueSubmit}
                  disabled={!valueInput}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  Assign Value
                </button>
              </>
            )}
            {drawnHexCount === 0 && legendItems.length === 0 && (
              <span className="text-sm text-neutral-500">Click and drag to select hexagons</span>
            )}
          </div>
          
          {/* Right: Sampling Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={startSampling}
              disabled={legendItems.length === 0}
              className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            >
              {isSampling ? 'Sampling...' : 'Start Sampling'}
            </button>
            <button
              onClick={stopSampling}
              disabled={!isSampling}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            >
              Stop
            </button>
            <div className="w-px h-5 bg-neutral-600" />
            <button
              onClick={handleFullReset}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-200 text-sm font-medium"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex h-[600px]">
        
        {/* Left: Hexagonal Canvas - 65% */}
        <div className="bg-neutral-900 border-r border-neutral-700 flex items-center justify-center" style={{ width: '65%' }}>
          <svg
            ref={svgGridRef}
            width={WIDTH_GRID}
            height={HEIGHT_GRID}
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
            viewBox={`0 0 ${WIDTH_GRID} ${HEIGHT_GRID}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
        
        {/* Right: Distribution Panel - 35% */}
        <div className="bg-neutral-800/70 p-3 flex flex-col overflow-y-auto" style={{ width: '35%' }} ref={distPanelRef}>
          {/* Region Summary Cards */}
          {legendItems.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Active Regions</h4>
              {legendItems.map((item, index) => {
                const probability = totalHexagons > 0 ? item.hexCount / totalHexagons : 0;
                return (
                  <div key={index} className="bg-neutral-700/50 p-2 rounded-md flex items-center justify-between border border-neutral-600">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-mono text-sm text-white">X = {item.value}</div>
                        <div className="text-xs text-neutral-400">
                          {item.hexCount} cells
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-teal-400">
                        {(probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
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
          <div className="bg-neutral-900 rounded-md p-2 shadow-inner" style={{ height: `${HEIGHT_DIST + 20}px` }}>
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
    </div>
    </VisualizationContainer>
  );
};

// Error boundary wrapper for the component
class SpatialRandomVariableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('SpatialRandomVariable Error:', error);
    console.error('Error Info:', errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-neutral-800 rounded-lg shadow-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Visualization Error</h3>
          <p className="text-sm text-neutral-300 mb-4">The visualization encountered an error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    
    return <SpatialRandomVariable />;
  }
}

export default SpatialRandomVariableErrorBoundary;