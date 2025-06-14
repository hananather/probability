import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { Button } from '@/components/ui/button';

const SpatialRandomVariable = () => {
  // Refs for D3 elements
  const svgGridRef = useRef(null);
  const svgDistRef = useRef(null);
  const hexbinRef = useRef(null);
  const samplingIntervalRef = useRef(null);
  
  // State - Simplified and consolidated
  const [regions, setRegions] = useState([]);
  const [selectedHexagons, setSelectedHexagons] = useState(new Set());
  const [valueInput, setValueInput] = useState('');
  const [isSampling, setIsSampling] = useState(false);
  const [sampleData, setSampleData] = useState({ values: { 0: 0 }, total: 0 });
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState(null); // 'add' or 'remove'
  
  // Ref for MathJax content container
  const mathJaxContainerRef = useRef(null);
  
  // Constants
  const WIDTH_GRID = 780;
  const HEIGHT_GRID = 648;
  const RADIUS = 24;
  const BORDER = 1;
  const WIDTH_DIST = 380;
  const HEIGHT_DIST = 340;
  const PAD_DIST = 20;
  
  const AVAILABLE_COLORS = [
    '#14b8a6', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6', 
    '#10b981', '#f97316', '#ec4899', '#06b6d4', '#84cc16'
  ];
  
  // Helper function to get next available color
  const getNextColor = useCallback(() => {
    const usedColors = regions.map(r => r.color);
    return AVAILABLE_COLORS.find(c => !usedColors.includes(c)) || AVAILABLE_COLORS[0];
  }, [regions]);
  
  // Helper function to process MathJax
  const processMathJax = useCallback((elements) => {
    if (typeof window !== 'undefined' && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise(elements).catch(() => {
        // MathJax error handled silently
      });
    }
  }, []);
  
  // Initialize hexagon grid
  useEffect(() => {
    if (!svgGridRef.current) return;
    
    const svg = d3.select(svgGridRef.current);
    svg.selectAll("*").remove();
    
    // Create hexbin generator
    const hexbin = d3Hexbin()
      .extent([[0, 0], [WIDTH_GRID, HEIGHT_GRID]])
      .radius(RADIUS);
    
    hexbinRef.current = hexbin;
    
    // Create clipping path
    svg.append("defs")
      .append("clipPath")
      .attr("id", "hexagon-clip")
      .append("rect")
      .attr("width", WIDTH_GRID)
      .attr("height", HEIGHT_GRID);
    
    // Main group with clipping
    const mainGroup = svg.append("g")
      .attr("clip-path", "url(#hexagon-clip)")
      .attr("transform", `translate(0, ${RADIUS/2})`);
    
    // Draw mesh
    mainGroup.append("path")
      .attr("class", "mesh")
      .attr("d", hexbin.mesh())
      .style("fill", "none")
      .style("stroke", "#4B5563")
      .style("stroke-opacity", 0.4)
      .style("pointer-events", "none");
    
    // Create hexagons
    const centers = hexbin.centers();
    const hexagons = mainGroup.append("g")
      .attr("class", "hexagons")
      .selectAll("path")
      .data(centers.map((center, i) => ({
        x: center[0],
        y: center[1],
        id: `hex-${i}`,
        index: i
      })))
      .enter().append("path")
      .attr("class", "hexagon")
      .attr("d", hexbin.hexagon(RADIUS - BORDER/2))
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("data-index", d => d.index)
      .style("fill", "#1F2937")
      .style("stroke", "#4B5563")
      .style("stroke-width", BORDER)
      .style("cursor", "pointer")
      .style("opacity", 0.95)
      .style("transition", "all 0.15s ease");
    
    // Mouse event handlers - Simplified
    hexagons
      .on("mousedown", function(event, d) {
        const isSelected = selectedHexagons.has(d.index);
        setPaintMode(isSelected ? 'remove' : 'add');
        setIsPainting(true);
        handleHexagonInteraction(d.index, !isSelected);
      })
      .on("mouseenter", function(event, d) {
        if (isPainting) {
          handleHexagonInteraction(d.index, paintMode === 'add');
        } else {
          // Hover effect
          const regionColor = getRegionColor(d.index);
          if (!regionColor) {
            d3.select(this)
              .style("stroke", "#14b8a6")
              .style("stroke-width", 2);
          }
        }
      })
      .on("mouseleave", function(event, d) {
        if (!isPainting && !selectedHexagons.has(d.index)) {
          const regionColor = getRegionColor(d.index);
          if (!regionColor) {
            d3.select(this)
              .style("stroke", "#4B5563")
              .style("stroke-width", BORDER);
          }
        }
      });
    
    // Global mouse up
    const handleMouseUp = () => {
      setIsPainting(false);
      setPaintMode(null);
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isPainting, paintMode, selectedHexagons]);
  
  // Handle hexagon selection/deselection
  const handleHexagonInteraction = useCallback((index, select) => {
    setSelectedHexagons(prev => {
      const newSet = new Set(prev);
      if (select) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
    
    // Update visual
    const hex = d3.select(`[data-index="${index}"]`);
    if (select) {
      hex.style("fill", "#374151")
         .style("stroke", "#14b8a6")
         .style("stroke-width", 2);
    } else {
      hex.style("fill", "#1F2937")
         .style("stroke", "#4B5563")
         .style("stroke-width", BORDER);
    }
  }, []);
  
  // Get region color for a hexagon
  const getRegionColor = useCallback((hexIndex) => {
    const region = regions.find(r => r.hexagons.has(hexIndex));
    return region?.color;
  }, [regions]);
  
  // Initialize distribution chart
  useEffect(() => {
    if (!svgDistRef.current) return;
    
    const svg = d3.select(svgDistRef.current);
    svg.selectAll("*").remove();
    
    // Container
    const container = svg.append("g")
      .attr("transform", `translate(${PAD_DIST},${PAD_DIST})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .range([0, WIDTH_DIST - 2*PAD_DIST])
      .padding(0.4);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([HEIGHT_DIST - 2*PAD_DIST, 0]);
    
    // Store scales on the SVG element
    svg.node().__scales = { xScale, yScale };
    svg.node().__container = container;
    
    // Y-axis
    const yAxis = container.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`));
    
    // X-axis
    const xAxis = container.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${HEIGHT_DIST - 2*PAD_DIST})`);
    
    // Gridlines
    container.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-(WIDTH_DIST - 2*PAD_DIST))
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.15)
      .select(".domain").remove();
    
    // Style axes
    svg.selectAll(".y-axis, .x-axis")
      .style("font-size", "11px")
      .selectAll("path, line")
      .style("stroke", "#6B7280")
      .style("stroke-width", 0.5);
    
    svg.selectAll("text")
      .style("fill", "#D1D5DB");
  }, []);
  
  // Update distribution chart
  useEffect(() => {
    const svg = d3.select(svgDistRef.current);
    if (!svg.node()?.__scales) return;
    
    const { xScale, yScale } = svg.node().__scales;
    const container = svg.node().__container;
    
    // Get all values (including 0)
    const allValues = Object.keys(sampleData.values).sort((a, b) => Number(a) - Number(b));
    
    // Update scales
    xScale.domain(allValues);
    
    // Update x-axis
    container.select(".x-axis")
      .call(d3.axisBottom(xScale));
    
    // Data join for bars
    const bars = container.selectAll(".bar")
      .data(allValues, d => d);
    
    // Enter
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d))
      .attr("width", xScale.bandwidth())
      .attr("y", HEIGHT_DIST - 2*PAD_DIST)
      .attr("height", 0)
      .style("fill", d => {
        if (d === "0") return "#6B7280";
        const region = regions.find(r => r.value === Number(d));
        return region?.color || "#6B7280";
      })
      .style("opacity", 0.8);
    
    // Update
    const total = Math.max(sampleData.total, 1);
    container.selectAll(".bar")
      .transition()
      .duration(300)
      .attr("y", d => yScale(sampleData.values[d] / total))
      .attr("height", d => HEIGHT_DIST - 2*PAD_DIST - yScale(sampleData.values[d] / total));
    
    // Exit
    bars.exit().remove();
  }, [sampleData, regions]);
  
  // Handle value assignment
  const handleValueSubmit = (e) => {
    e?.preventDefault();
    if (selectedHexagons.size === 0 || !valueInput) return;
    
    const value = Number(valueInput);
    if (isNaN(value)) return;
    
    // Create new region
    const newRegion = {
      value,
      color: getNextColor(),
      hexagons: new Set(selectedHexagons)
    };
    
    setRegions(prev => [...prev, newRegion]);
    
    // Update hexagon visuals
    const svg = d3.select(svgGridRef.current);
    selectedHexagons.forEach(index => {
      svg.select(`[data-index="${index}"]`)
        .style("fill", newRegion.color)
        .style("stroke", newRegion.color)
        .style("stroke-width", BORDER)
        .style("opacity", 0.95);
    });
    
    // Clear selection
    setSelectedHexagons(new Set());
    setValueInput('');
  };
  
  // Improved animation for sampling
  const animateSample = useCallback((pos, color, value, hexElement) => {
    // Update sample data
    setSampleData(prev => ({
      values: {
        ...prev.values,
        [value]: (prev.values[value] || 0) + 1
      },
      total: prev.total + 1
    }));
    
    // Pulse the sampled hexagon
    const hex = d3.select(hexElement);
    hex.transition()
      .duration(200)
      .style("opacity", 1)
      .style("filter", `brightness(1.5) drop-shadow(0 0 10px ${color})`)
      .transition()
      .duration(300)
      .style("opacity", 0.95)
      .style("filter", "none");
    
    // Create animated dot
    const svg = d3.select(svgGridRef.current);
    const dot = svg.select("g[clip-path]").append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", 3)
      .style("fill", color)
      .style("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0)
      .style("filter", `drop-shadow(0 0 6px ${color})`);
    
    // Animate: appear -> expand -> fade
    dot.transition()
      .duration(150)
      .attr("r", 12)
      .style("opacity", 1)
      .transition()
      .duration(350)
      .attr("r", 4)
      .style("opacity", 0.8)
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
  }, []);
  
  // Start/stop sampling
  const startSampling = () => {
    if (regions.length === 0) return;
    
    setIsSampling(true);
    
    samplingIntervalRef.current = setInterval(() => {
      const x = Math.random() * WIDTH_GRID;
      const y = Math.random() * HEIGHT_GRID;
      
      // Find which hexagon was hit
      const hexagon = hexbinRef.current([x, y])[0];
      if (!hexagon) return;
      
      // Find the hexagon element and its region
      const hexElements = d3.selectAll(".hexagon").nodes();
      let targetHex = null;
      let targetRegion = null;
      
      for (let i = 0; i < hexElements.length; i++) {
        const hex = d3.select(hexElements[i]);
        const transform = hex.attr("transform");
        const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
        
        if (match) {
          const hx = parseFloat(match[1]);
          const hy = parseFloat(match[2]);
          const dist = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
          
          if (dist < RADIUS) {
            targetHex = hexElements[i];
            const index = parseInt(hex.attr("data-index"));
            targetRegion = regions.find(r => r.hexagons.has(index)) || { value: 0, color: "#6B7280" };
            break;
          }
        }
      }
      
      if (targetHex && targetRegion) {
        animateSample([x, y], targetRegion.color, targetRegion.value, targetHex);
      }
    }, 100);
  };
  
  const stopSampling = () => {
    if (samplingIntervalRef.current) {
      clearInterval(samplingIntervalRef.current);
      samplingIntervalRef.current = null;
    }
    setIsSampling(false);
  };
  
  // Reset functions
  const resetSamples = () => {
    setSampleData({ values: { 0: 0 }, total: 0 });
    stopSampling();
  };
  
  const handleFullReset = () => {
    resetSamples();
    setRegions([]);
    setSelectedHexagons(new Set());
    setValueInput('');
    
    // Reset all hexagon visuals
    d3.selectAll(".hexagon")
      .style("fill", "#1F2937")
      .style("stroke", "#4B5563")
      .style("stroke-width", BORDER)
      .style("opacity", 0.95);
  };
  
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (sampleData.total === 0) return { mean: 0, variance: 0 };
    
    let mean = 0;
    Object.entries(sampleData.values).forEach(([value, count]) => {
      mean += Number(value) * count;
    });
    mean /= sampleData.total;
    
    let variance = 0;
    Object.entries(sampleData.values).forEach(([value, count]) => {
      variance += Math.pow(Number(value) - mean, 2) * count;
    });
    variance /= sampleData.total;
    
    return { mean, variance };
  }, [sampleData]);
  
  // Calculate total hexagons for probability
  const totalHexagons = regions.reduce((sum, region) => sum + region.hexagons.size, 0);
  
  // Get contextual instruction
  const getInstruction = () => {
    if (regions.length === 0 && selectedHexagons.size === 0) {
      return "Step 1: Click and drag to select hexagons on the grid";
    } else if (selectedHexagons.size > 0) {
      return `Step 2: Assign a value to your ${selectedHexagons.size} selected hexagons`;
    } else if (regions.length > 0 && !isSampling) {
      return "Step 3: Start sampling to see the probability distribution emerge";
    } else if (isSampling) {
      return "Sampling in progress... Watch the distribution build!";
    }
    return "";
  };
  
  // Process MathJax on mount and updates
  useEffect(() => {
    if (mathJaxContainerRef.current) {
      const elements = mathJaxContainerRef.current.querySelectorAll('.mathjax-content');
      if (elements.length > 0) {
        processMathJax(Array.from(elements));
      }
    }
  }, [sampleData.total, processMathJax]);
  
  return (
    <div ref={mathJaxContainerRef} className="bg-neutral-800 rounded-lg shadow-xl overflow-hidden w-full">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Spatial Random Variable</h3>
          <p className="text-sm text-amber-400 font-medium">{getInstruction()}</p>
        </div>
      </div>
      
      {/* Workflow Controls */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Workflow Steps */}
          <div className="flex items-center gap-6">
            {[
              { num: 1, label: "Draw regions", active: regions.length === 0 },
              { num: 2, label: "Assign values", active: regions.length > 0 && !isSampling && sampleData.total === 0 },
              { num: 3, label: "Sample & observe", active: regions.length > 0 && (isSampling || sampleData.total > 0) }
            ].map(step => (
              <div key={step.num} className={`flex items-center gap-2 ${step.active ? 'text-teal-400' : 'text-neutral-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.active ? 'bg-teal-600 text-white' : 'bg-neutral-700 text-neutral-400'
                }`}>{step.num}</div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
          
          {/* Active Controls */}
          <div className="flex items-center gap-3">
            {/* Value assignment */}
            {selectedHexagons.size > 0 && (
              <div className="flex items-center gap-2 bg-neutral-700/50 rounded-lg px-3 py-2">
                <span className="text-sm text-neutral-300">{selectedHexagons.size} hexagons selected</span>
                <div className="w-px h-5 bg-neutral-600" />
                <input
                  type="number"
                  step="any"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="Value"
                  className="w-24 px-2.5 py-1.5 bg-neutral-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm border border-neutral-500"
                  autoFocus
                />
                <Button
                  onClick={handleValueSubmit}
                  disabled={!valueInput}
                  variant="primary"
                  size="sm"
                >
                  Assign
                </Button>
              </div>
            )}
            
            {/* Sampling controls */}
            {regions.length > 0 && (
              <>
                <Button
                  onClick={startSampling}
                  disabled={isSampling}
                  variant="success"
                  size="default"
                >
                  {isSampling ? 'Sampling...' : 'Start Sampling'}
                </Button>
                <Button
                  onClick={stopSampling}
                  disabled={!isSampling}
                  variant="danger"
                  size="default"
                >
                  Stop
                </Button>
              </>
            )}
            
            <div className="w-px h-8 bg-neutral-600" />
            <Button
              onClick={handleFullReset}
              variant="warning"
              size="default"
            >
              Reset All
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex h-[648px]">
        {/* Left: Hexagonal Grid */}
        <div className="bg-neutral-900 border-r border-neutral-700 overflow-hidden" style={{ width: '65%' }}>
          <svg
            ref={svgGridRef}
            width={WIDTH_GRID}
            height={HEIGHT_GRID}
            style={{ display: 'block' }}
            viewBox={`0 0 ${WIDTH_GRID} ${HEIGHT_GRID}`}
          />
        </div>
        
        {/* Right: Distribution Panel */}
        <div className="bg-neutral-800/70 p-4 flex flex-col overflow-y-auto" style={{ width: '35%' }}>
          {/* Region Summary */}
          {regions.length > 0 && (
            <div className="mb-4 space-y-2">
              <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Active Regions</h4>
              {regions.map((region, index) => {
                const probability = totalHexagons > 0 ? region.hexagons.size / totalHexagons : 0;
                return (
                  <div key={index} className="bg-neutral-700/50 p-3 rounded-lg flex items-center justify-between border border-neutral-600">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-md shadow-sm" 
                        style={{ backgroundColor: region.color }}
                      />
                      <div>
                        <div className="font-mono text-base text-white font-medium">X = {region.value}</div>
                        <div className="text-sm text-neutral-400">{region.hexagons.size} cells</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-teal-400">
                        {(probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-neutral-500">probability</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Distribution Chart */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-teal-400 mathjax-content">
              \(P(X = x)\)
            </h3>
            <div className="text-sm">
              <span className="text-neutral-400 mathjax-content">\(n = \)</span>
              <span className="font-mono text-teal-400 font-medium">{sampleData.total}</span>
            </div>
          </div>
          
          <div className="bg-neutral-900 rounded-lg p-2 shadow-inner flex-grow" style={{ minHeight: `${HEIGHT_DIST + 20}px` }}>
            <svg
              ref={svgDistRef}
              width={WIDTH_DIST}
              height={HEIGHT_DIST}
              style={{ display: 'block', width: '100%', height: 'auto' }}
              viewBox={`0 0 ${WIDTH_DIST} ${HEIGHT_DIST}`}
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
          
          {/* Statistics */}
          <div className="mt-4 pt-4 border-t border-neutral-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400 mathjax-content">\(E[X]\)</span>
              <span className="font-mono text-teal-400 font-medium text-lg">
                {stats.mean.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400 mathjax-content">\(\text{Var}(X)\)</span>
              <span className="font-mono text-teal-400 font-medium text-lg">
                {stats.variance.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialRandomVariable;