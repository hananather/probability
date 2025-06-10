"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { createColorScheme, typography, spacing, components, layout } from "../../lib/design-system";
import { ArrowRight, Search, HelpCircle, Sparkles, TrendingUp, Award, Calculator, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import * as jStat from "jstat";
import { cn } from "../../lib/utils";
import { 
  VisualizationContainer, 
  VisualizationSection
} from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { Button } from "../ui/button";

const ZTableLookupRedesigned = () => {
  const colors = createColorScheme('inference');
  const svgRef = useRef(null);
  
  // Core state
  const [zValue, setZValue] = useState(0);
  const [probability, setProbability] = useState(0.5);
  const [lookupMode, setLookupMode] = useState('z-to-p');
  const [targetProbability, setTargetProbability] = useState(0.95);
  
  // UI state
  const [showTable, setShowTable] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [highlightedCol, setHighlightedCol] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Learning state
  const [lookupHistory, setLookupHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentInsight, setCurrentInsight] = useState(null);
  
  // Learning stage calculation
  const getLearningStage = useCallback((count) => {
    if (count < 5) return 'foundation';
    if (count < 15) return 'pattern';
    if (count < 25) return 'application';
    return 'mastery';
  }, []);
  
  // Progressive insights system
  const stageInsights = {
    foundation: [
      "The z-table shows cumulative probabilities: P(Z ≤ z)",
      "Each row represents tenths, each column represents hundredths",
      "Notice how probability increases as z moves from negative to positive",
      "At z = 0, the probability is exactly 0.5000 - half the distribution!",
      "Try negative z-values to see the symmetry pattern"
    ],
    pattern: [
      "🎯 Pattern discovered: Φ(-z) = 1 - Φ(z) due to symmetry!",
      "z = 1.96 gives ≈0.975, meaning 95% lies between -1.96 and 1.96",
      "The 68-95-99.7 rule: Check probabilities at z = 1, 2, and 3",
      "For quality control: z = 3 captures 99.7% - only 0.3% defect rate!",
      "Engineering insight: ±2σ captures 95.45% of production values"
    ],
    application: [
      "💡 Two-tailed test: For α = 0.05, split into 0.025 each tail at z = ±1.96",
      "Process capability: If Cpk ≥ 1.33, then z ≥ 4, virtually no defects!",
      "Hypothesis testing: p-value = P(Z > |z|) for one-tailed tests",
      "Engineering tolerances: Set at ±3σ for 99.7% conformance",
      "Six Sigma quality: z = 6 means 3.4 defects per million!"
    ],
    mastery: [
      "🏆 Master level: You understand the full power of the normal distribution!",
      "Challenge: Find z such that P(-z < Z < z) = 0.90",
      "Real application: Machine tolerance ±0.005mm with σ = 0.002mm, what's the defect rate?",
      "Advanced: Use inverse normal for setting specification limits",
      "You're ready for hypothesis testing and confidence intervals!"
    ]
  };
  
  // Get context-aware insight
  const getContextualInsight = useCallback(() => {
    const stage = getLearningStage(lookupHistory.length);
    const absZ = Math.abs(zValue);
    
    // Check for special milestones
    if (lookupHistory.length === 10 && !achievements.includes('explorer')) {
      setAchievements(prev => [...prev, 'explorer']);
      return {
        type: 'milestone',
        icon: '🎉',
        title: 'Explorer Milestone!',
        message: "You've explored 10 z-values! You're discovering the patterns of the normal distribution.",
        subMessage: "Next: Try both positive and negative z-values to discover symmetry"
      };
    }
    
    // Check for critical value recognition
    if (Math.abs(absZ - 1.96) < 0.01) {
      return {
        type: 'critical',
        icon: '⭐',
        title: 'Critical Value: 95% Confidence',
        message: "z = ±1.96 captures 95% of the distribution",
        subMessage: "This is the most common critical value in engineering specifications!"
      };
    }
    
    // Engineering applications for large z
    if (absZ >= 3) {
      const defectRate = (1 - jStat.normal.cdf(absZ, 0, 1)) * 1000000;
      return {
        type: 'engineering',
        icon: '🏭',
        title: 'Six Sigma Territory',
        message: `At z = ${absZ.toFixed(2)}, defect rate is ${defectRate.toFixed(1)} per million`,
        subMessage: "This is why ±3σ is the gold standard for manufacturing!"
      };
    }
    
    // Return stage-appropriate insight
    const insights = stageInsights[stage];
    const index = Math.floor(lookupHistory.length / 3) % insights.length;
    return {
      type: 'learning',
      message: insights[index]
    };
  }, [zValue, lookupHistory, achievements, getLearningStage]);
  
  // Update probability when z changes
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
    
    // Update lookup history
    if (lookupMode === 'z-to-p' && zValue !== 0) {
      setLookupHistory(prev => {
        const newHistory = [...prev, { z: zValue, p: p, timestamp: Date.now() }];
        return newHistory.slice(-30); // Keep last 30
      });
    }
    
    // Update current insight
    setCurrentInsight(getContextualInsight());
  }, [zValue, lookupMode, getContextualInsight]);
  
  // Update z when target probability changes (in p-to-z mode)
  useEffect(() => {
    if (lookupMode === 'p-to-z') {
      const z = jStat.normal.inv(targetProbability, 0, 1);
      setZValue(z);
    }
  }, [targetProbability, lookupMode]);
  
  // Enhanced D3 Visualization - Hero size
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 60, right: 80, bottom: 80, left: 80 };
    
    svg.attr("width", width).attr("height", height);
    
    const g = svg.append("g");
    
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
      
    const areaData = curveData.filter(d => d.x <= zValue);
    
    g.append("path")
      .datum(areaData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
    
    // Draw PDF curve with glow effect
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Glow effect
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 6)
      .attr("fill", "none")
      .style("opacity", 0.3)
      .style("filter", "blur(8px)");
    
    // Main curve
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
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
      .style("font-size", typography.label)
      .selectAll("text")
      .style("font-family", "monospace");
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("font-size", typography.label)
      .selectAll("text")
      .style("font-family", "monospace");
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("class", typography.h3)
      .text("z-score");
      
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("class", typography.h3)
      .text("Probability Density");
    
    // Z-value indicator with enhanced visuals
    if (zValue >= -4 && zValue <= 4) {
      // Vertical line
      const zLine = g.append("line")
        .attr("x1", xScale(zValue))
        .attr("y1", height - margin.bottom)
        .attr("x2", xScale(zValue))
        .attr("y2", yScale(normalPDF(zValue)))
        .attr("stroke", colors.accent)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "8,4")
        .style("opacity", 0);
        
      zLine.transition()
        .duration(300)
        .style("opacity", 1);
      
      // Point at intersection with pulsing effect
      const pulseCircle = g.append("circle")
        .attr("cx", xScale(zValue))
        .attr("cy", yScale(normalPDF(zValue)))
        .attr("r", 8)
        .attr("fill", colors.accent)
        .style("opacity", 0.3);
        
      // Animate pulse
      pulseCircle
        .transition()
        .duration(1000)
        .attr("r", 20)
        .style("opacity", 0)
        .on("end", function repeat() {
          d3.select(this)
            .attr("r", 8)
            .style("opacity", 0.3)
            .transition()
            .duration(1000)
            .attr("r", 20)
            .style("opacity", 0)
            .on("end", repeat);
        });
      
      // Main point
      g.append("circle")
        .attr("cx", xScale(zValue))
        .attr("cy", yScale(normalPDF(zValue)))
        .attr("r", 6)
        .attr("fill", colors.accent)
        .attr("stroke", "#0a0a0a")
        .attr("stroke-width", 2);
    }
    
    // Large integrated stats display
    const statsGroup = g.append("g")
      .attr("transform", `translate(${width - margin.right - 200}, ${margin.top + 20})`);
      
    // Stats background
    statsGroup.append("rect")
      .attr("x", -20)
      .attr("y", -20)
      .attr("width", 220)
      .attr("height", 120)
      .attr("rx", 12)
      .attr("fill", "#0a0a0a")
      .attr("fill-opacity", 0.9)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 2);
    
    // Z-value display
    statsGroup.append("text")
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .attr("class", "font-mono text-2xl font-bold")
      .attr("fill", colors.primary)
      .text(`z = ${zValue.toFixed(3)}`);
    
    // Probability display
    statsGroup.append("text")
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .attr("class", "font-mono text-xl")
      .attr("fill", colors.secondary)
      .text(`Φ(z) = ${probability.toFixed(4)}`);
    
    // Percentile display
    statsGroup.append("text")
      .attr("y", 75)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .attr("class", "text-base")
      .attr("fill", colors.text)
      .text(`${(probability * 100).toFixed(1)}th percentile`);
    
  }, [zValue, probability, colors]);
  
  // Generate Z-table data
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
  
  // Search functionality
  const handleSearch = useCallback((value) => {
    const val = parseFloat(value);
    if (!isNaN(val) && val >= -3.5 && val <= 3.5) {
      setZValue(val);
      // Auto-scroll table if visible
      if (showTable && val >= 0) {
        const row = Math.floor(val * 10) / 10;
        setHighlightedRow(row);
        setHighlightedCol(Math.round((val - row) * 100));
      }
    }
  }, [showTable]);
  
  // Critical values
  const criticalValues = [
    { z: 1.645, confidence: "90%", alpha: "0.10", color: "amber" },
    { z: 1.96, confidence: "95%", alpha: "0.05", color: "blue" },
    { z: 2.576, confidence: "99%", alpha: "0.01", color: "purple" }
  ];
  
  // Achievement definitions
  const achievementDefs = [
    { id: 'first_lookup', name: 'First Steps', icon: '🎯', condition: () => lookupHistory.length >= 1 },
    { id: 'explorer', name: 'Explorer', icon: '🗺️', condition: () => lookupHistory.length >= 10 },
    { id: 'symmetry', name: 'Symmetry Master', icon: '🔄', condition: () => 
      lookupHistory.some(h => h.z > 0.5) && lookupHistory.some(h => h.z < -0.5) },
    { id: 'critical', name: 'Critical Thinker', icon: '⭐', condition: () => 
      lookupHistory.some(h => [1.645, 1.96, 2.576].some(cv => Math.abs(h.z - cv) < 0.01)) },
    { id: 'engineer', name: 'Quality Engineer', icon: '🏭', condition: () => 
      lookupHistory.some(h => Math.abs(h.z) >= 3) }
  ];
  
  const earnedAchievements = achievementDefs.filter(a => a.condition());
  
  return (
    <VisualizationContainer 
      title="Interactive Z-Table Lookup Tool"
      className="max-w-full"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Main visualization column - 3/5 on xl screens */}
        <div className="xl:col-span-3 space-y-4">
          {/* Hero Visualization */}
          <VisualizationSection className="p-0 overflow-hidden">
            <div 
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl"
              style={{ height: 'calc(70vh - 120px)', minHeight: '500px' }}
            >
              <svg ref={svgRef} className="w-full h-full" />
            </div>
          </VisualizationSection>
          
          {/* Progressive Insight Box */}
          {currentInsight && (
            <div className={cn(
              "p-6 rounded-xl border backdrop-blur-sm transition-all duration-500",
              currentInsight.type === 'milestone' 
                ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-600/50"
                : currentInsight.type === 'critical'
                ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-600/50"
                : currentInsight.type === 'engineering'
                ? "bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-600/50"
                : "bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-600/50"
            )}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{currentInsight.icon || '💡'}</div>
                <div className="flex-1">
                  {currentInsight.title && (
                    <h3 className={cn(typography.h3, "mb-2")}>{currentInsight.title}</h3>
                  )}
                  <p className="text-base leading-relaxed">{currentInsight.message}</p>
                  {currentInsight.subMessage && (
                    <p className="text-sm text-gray-400 mt-2">{currentInsight.subMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Control Strip */}
          <VisualizationSection className="p-4">
            <div className="space-y-4">
              {/* Mode Switcher */}
              <div className="relative p-1 bg-gray-900 rounded-xl">
                <div 
                  className="absolute inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-transform duration-300"
                  style={{ 
                    transform: `translateX(${lookupMode === 'z-to-p' ? '0' : '50%'})`,
                    width: 'calc(50% - 4px)'
                  }}
                />
                <div className="relative flex gap-1">
                  <button
                    onClick={() => setLookupMode('z-to-p')}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg transition-all duration-300",
                      lookupMode === 'z-to-p' 
                        ? "text-white font-semibold" 
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-mono">Z</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-lg font-mono">P</span>
                    </div>
                    <div className="text-xs mt-1 opacity-70">Find probability</div>
                  </button>
                  <button
                    onClick={() => setLookupMode('p-to-z')}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg transition-all duration-300",
                      lookupMode === 'p-to-z' 
                        ? "text-white font-semibold" 
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-mono">P</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-lg font-mono">Z</span>
                    </div>
                    <div className="text-xs mt-1 opacity-70">Find z-score</div>
                  </button>
                </div>
              </div>
              
              {/* Enhanced Slider with Quick Values */}
              <div className="space-y-3">
                {lookupMode === 'z-to-p' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Jump to z-value..."
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg 
                          focus:outline-none focus:border-blue-500 transition-colors duration-200
                          font-mono text-sm"
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
                      className="mb-2"
                    />
                    <div className="flex justify-between">
                      {[-3, -2, -1, 0, 1, 2, 3].map(tick => (
                        <button
                          key={tick}
                          onClick={() => setZValue(tick)}
                          className={cn(
                            "px-2 py-1 text-xs font-mono rounded transition-all duration-200",
                            Math.abs(zValue - tick) < 0.01
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 hover:text-white hover:bg-gray-800"
                          )}
                        >
                          {tick}
                        </button>
                      ))}
                    </div>
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
                
                {/* Quick Critical Values */}
                <div className="grid grid-cols-3 gap-2">
                  {criticalValues.map((cv) => (
                    <button
                      key={cv.z}
                      onClick={() => setZValue(cv.z)}
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-300 hover:scale-105",
                        Math.abs(zValue - cv.z) < 0.01
                          ? `bg-${cv.color}-900/40 border-${cv.color}-600/60 shadow-lg`
                          : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                      )}
                    >
                      <div className={cn("text-sm font-semibold", `text-${cv.color}-400`)}>
                        {cv.confidence}
                      </div>
                      <div className="font-mono text-base mt-1">±{cv.z}</div>
                      <div className="text-xs text-gray-500">α = {cv.alpha}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </VisualizationSection>
        </div>
        
        {/* Reference Panel - 2/5 on xl screens */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tabbed Reference Section */}
          <VisualizationSection className="sticky top-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 p-1 bg-gray-900 rounded-lg">
              {[
                { id: 'table', label: 'Z-Table', icon: BarChart3 },
                { id: 'formulas', label: 'Formulas', icon: Calculator },
                { id: 'achievements', label: 'Progress', icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="relative">
              {/* Z-Table Tab */}
              {activeTab === 'table' && (
                <div className="space-y-4">
                  {/* Show/Hide Table Toggle */}
                  <button
                    onClick={() => setShowTable(!showTable)}
                    className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 
                      rounded-lg transition-all duration-200"
                  >
                    <span className="font-medium">Standard Normal Table</span>
                    {showTable ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  
                  {showTable && (
                    <>
                      {/* Table Guide */}
                      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 
                        border border-blue-600/30 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2">How to Read:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                          <li>Find row for tenths place</li>
                          <li>Find column for hundredths</li>
                          <li>Intersection gives Φ(z)</li>
                        </ol>
                        {highlightedRow !== null && (
                          <div className="mt-3 p-2 bg-amber-900/30 rounded font-mono text-sm">
                            Row {highlightedRow.toFixed(1)}, Col 0.0{highlightedCol}
                          </div>
                        )}
                      </div>
                      
                      {/* Z-Table */}
                      <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-700">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-900 z-10">
                            <tr>
                              <th className="p-3 border-b border-r border-gray-700 font-semibold bg-gray-800">
                                z
                              </th>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                                <th key={col} className="p-3 border-b border-gray-700 font-mono text-blue-300 bg-gray-800">
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
                                  className={cn(
                                    "transition-all duration-200",
                                    isRowHighlighted ? "bg-amber-900/20" : "hover:bg-gray-800/50"
                                  )}
                                >
                                  <td className="p-3 border-r border-gray-700 font-semibold font-mono text-blue-300 bg-gray-800/50">
                                    {row.z}
                                  </td>
                                  {row.values.map(({ col, p, zExact }) => {
                                    const isCellHighlighted = isRowHighlighted && highlightedCol === col;
                                    return (
                                      <td 
                                        key={col} 
                                        className={cn(
                                          "p-3 font-mono text-center transition-all duration-200 cursor-pointer",
                                          isCellHighlighted
                                            ? "bg-amber-500/40 font-bold text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                            : "hover:bg-blue-900/30 hover:text-blue-200"
                                        )}
                                        onMouseEnter={() => setHoveredCell({ z: zExact.toFixed(2), p })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        onClick={() => setZValue(zExact)}
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
                        <div className="p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                          <p className="font-mono text-sm">
                            z = {hoveredCell.z}, Φ(z) = {hoveredCell.p}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Formulas Tab */}
              {activeTab === 'formulas' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                    {[
                      { formula: "P(Z > z) = 1 - Φ(z)", desc: "Right tail probability" },
                      { formula: "P(|Z| > z) = 2(1 - Φ(z))", desc: "Two-tailed probability" },
                      { formula: "P(-z < Z < z) = 2Φ(z) - 1", desc: "Symmetric interval" },
                      { formula: "z = Φ⁻¹(p)", desc: "Inverse normal (quantile)" },
                      { formula: "Φ(-z) = 1 - Φ(z)", desc: "Symmetry property" }
                    ].map((item, i) => (
                      <div key={i} className="pb-3 border-b border-gray-700 last:border-0 last:pb-0">
                        <p className="font-mono text-base text-blue-300">{item.formula}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Engineering Applications */}
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 
                    border border-purple-600/30 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-3">Engineering Applications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Quality Control (±2σ)</span>
                        <span className="font-mono">95.45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High Reliability (±3σ)</span>
                        <span className="font-mono">99.73%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Six Sigma (±6σ)</span>
                        <span className="font-mono">3.4 PPM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  {/* Progress Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-mono font-bold text-blue-400">
                        {lookupHistory.length}
                      </div>
                      <div className="text-sm text-gray-400">Lookups</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-mono font-bold text-green-400">
                        {earnedAchievements.length}/{achievementDefs.length}
                      </div>
                      <div className="text-sm text-gray-400">Achievements</div>
                    </div>
                  </div>
                  
                  {/* Learning Stage */}
                  <div className="p-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 
                    border border-indigo-600/30 rounded-lg">
                    <h4 className="font-semibold text-indigo-300 mb-2">Learning Stage</h4>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <span className="text-lg capitalize">
                        {getLearningStage(lookupHistory.length)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Achievements Grid */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Achievements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {achievementDefs.map(achievement => {
                        const earned = earnedAchievements.includes(achievement);
                        return (
                          <div 
                            key={achievement.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all duration-300",
                              earned
                                ? "bg-green-900/20 border-green-600/50"
                                : "bg-gray-800/50 border-gray-700 opacity-50"
                            )}
                          >
                            <div className="text-2xl mb-1">{achievement.icon}</div>
                            <div className="text-sm font-medium">{achievement.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  {lookupHistory.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Recent Lookups</h4>
                      <div className="space-y-1">
                        {lookupHistory.slice(-5).reverse().map((h, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="font-mono">z = {h.z.toFixed(2)}</span>
                            <span className="text-gray-400">Φ = {h.p.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default ZTableLookupRedesigned;