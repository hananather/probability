"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { Button } from '../../ui/button';

export default function TypeErrorVisualizer() {
  // Fixed scenario parameters for medical test
  const SCENARIO = {
    healthy: { mean: 60, std: 10, label: "Healthy", color: "#3b82f6" },
    diseased: { mean: 85, std: 12, label: "Diseased", color: "#10b981" },
    prevalence: 0.01, // 1% have disease
    thresholdMin: 40,
    thresholdMax: 110
  };
  
  // State
  const [threshold, setThreshold] = useState(70);
  const [showAreas, setShowAreas] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Refs for D3 visualizations
  const svgRef = useRef(null);
  const scalesRef = useRef({ x: null, y: null });
  const thresholdLineRef = useRef(null);
  const errorAreasRef = useRef({ typeI: null, typeII: null });
  const innerDimensionsRef = useRef({ width: 0, height: 0 });
  
  // Reset animation state when component remounts
  useEffect(() => {
    return () => {
      setAnimateIn(false);
    };
  }, []);
  
  // Calculate errors
  const calculateErrors = (thresh) => {
    // Type I: Healthy people above threshold (false positive)
    const typeI = 1 - jStat.normal.cdf(thresh, SCENARIO.healthy.mean, SCENARIO.healthy.std);
    
    // Type II: Diseased people below threshold (false negative)
    const typeII = jStat.normal.cdf(thresh, SCENARIO.diseased.mean, SCENARIO.diseased.std);
    
    // Calculate actual numbers per 10,000 people
    const per10000 = {
      total: 10000,
      healthy: 9900,
      diseased: 100,
      falsePositives: Math.round(typeI * 9900),
      falseNegatives: Math.round(typeII * 100),
      truePositives: Math.round((1 - typeII) * 100),
      trueNegatives: Math.round((1 - typeI) * 9900)
    };
    
    return { typeI, typeII, per10000 };
  };
  
  const errors = calculateErrors(threshold);
  
  // Get insight based on threshold position
  const getInsight = () => {
    if (threshold < 55) {
      return {
        title: "Extreme Caution",
        content: "Almost everyone tests positive. Many healthy people suffer from false alarms.",
        color: "#ef4444"
      };
    }
    if (threshold < 70) {
      return {
        title: "High Sensitivity",
        content: "Catches most disease cases, but many false positives cause unnecessary worry.",
        color: "#fbbf24"
      };
    }
    if (threshold < 80) {
      return {
        title: "Balanced Approach",
        content: "Reasonable trade-off between catching disease and avoiding false alarms.",
        color: "#10b981"
      };
    }
    if (threshold < 95) {
      return {
        title: "Conservative Testing",
        content: "Few false alarms, but missing some disease cases.",
        color: "#fbbf24"
      };
    }
    return {
      title: "Extreme Conservatism",
      content: "Almost no false positives, but missing many sick patients!",
      color: "#ef4444"
    };
  };
  
  const insight = getInsight();
  
  // Initialize visualization (runs once)
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Store dimensions for later use
    innerDimensionsRef.current = { width: innerWidth, height: innerHeight };
    
    // Scales
    const x = d3.scaleLinear()
      .domain([20, 120])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.05])
      .range([innerHeight, 0]);
    
    // Store scales for later use
    scalesRef.current = { x, y };
    
    // Generate distribution data
    const generateCurve = (mean, std) => {
      return d3.range(20, 120, 0.5).map(x => ({
        x,
        y: jStat.normal.pdf(x, mean, std)
      }));
    };
    
    const healthyData = generateCurve(SCENARIO.healthy.mean, SCENARIO.healthy.std);
    const diseasedData = generateCurve(SCENARIO.diseased.mean, SCENARIO.diseased.std);
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Add gradient definitions
    const defs = svg.append("defs");
    
    // Type I error gradient (red)
    const typeIGradient = defs.append("linearGradient")
      .attr("id", "typeI-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    typeIGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.5);
    
    typeIGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.1);
    
    // Type II error gradient (yellow)
    const typeIIGradient = defs.append("linearGradient")
      .attr("id", "typeII-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    typeIIGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fbbf24")
      .attr("stop-opacity", 0.5);
    
    typeIIGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fbbf24")
      .attr("stop-opacity", 0.1);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Test Result Value");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d.toFixed(3)))
      .style("font-size", "12px")
      .style("color", "#9ca3af")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#e5e7eb")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Probability Density");
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);
    
    // Create error area groups
    const typeIAreaGroup = g.append("g").attr("class", "type-i-area-group");
    const typeIIAreaGroup = g.append("g").attr("class", "type-ii-area-group");
    
    // Store references
    errorAreasRef.current = { 
      typeI: typeIAreaGroup, 
      typeII: typeIIAreaGroup,
      healthyData,
      diseasedData
    };
    
    // Draw distribution curves
    g.append("path")
      .datum(healthyData)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", SCENARIO.healthy.color)
      .attr("stroke-width", 3)
      .attr("opacity", 0.8);
    
    g.append("path")
      .datum(diseasedData)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", SCENARIO.diseased.color)
      .attr("stroke-width", 3)
      .attr("opacity", 0.8);
    
    // Distribution labels
    g.append("text")
      .attr("x", x(SCENARIO.healthy.mean))
      .attr("y", y(jStat.normal.pdf(SCENARIO.healthy.mean, SCENARIO.healthy.mean, SCENARIO.healthy.std)) - 10)
      .attr("text-anchor", "middle")
      .attr("fill", SCENARIO.healthy.color)
      .style("font-weight", "600")
      .text("Healthy");
    
    g.append("text")
      .attr("x", x(SCENARIO.diseased.mean))
      .attr("y", y(jStat.normal.pdf(SCENARIO.diseased.mean, SCENARIO.diseased.mean, SCENARIO.diseased.std)) - 10)
      .attr("text-anchor", "middle")
      .attr("fill", SCENARIO.diseased.color)
      .style("font-weight", "600")
      .text("Diseased");
    
    // Create threshold group
    const thresholdGroup = g.append("g")
      .attr("class", "threshold-group")
      .style("cursor", "ew-resize");
    
    thresholdLineRef.current = thresholdGroup;
    
    // Threshold line
    thresholdGroup.append("line")
      .attr("class", "threshold-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");
    
    // Threshold handle - larger invisible drag area
    thresholdGroup.append("rect")
      .attr("class", "threshold-drag-area")
      .attr("y", 0)
      .attr("width", 60)
      .attr("height", innerHeight)
      .attr("fill", "#ffffff")
      .attr("fill-opacity", 0)
      .attr("stroke", "none")
      .style("cursor", "ew-resize");
    
    // Visible handle indicator
    thresholdGroup.append("rect")
      .attr("class", "threshold-handle")
      .attr("y", innerHeight / 2 - 20)
      .attr("width", 40)
      .attr("height", 40)
      .attr("fill", "#ffffff")
      .attr("fill-opacity", 0.1)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("rx", 5)
      .style("pointer-events", "none");
    
    thresholdGroup.append("text")
      .attr("class", "threshold-icon")
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text("⇔");
    
    // Threshold label
    thresholdGroup.append("text")
      .attr("class", "threshold-label")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "600");
    
    // Drag behavior
    const drag = d3.drag()
      .on("start", function() {
        d3.select(this).select(".threshold-line")
          .attr("stroke-width", 4)
          .attr("stroke", "#facc15");
        setIsDragging(true);
      })
      .on("drag", function(event) {
        const newX = Math.max(0, Math.min(innerWidth, event.x));
        const newThreshold = x.invert(newX);
        const clampedThreshold = Math.max(SCENARIO.thresholdMin, Math.min(SCENARIO.thresholdMax, newThreshold));
        
        // Update threshold line position immediately
        updateThresholdPosition(clampedThreshold);
        
        // Update React state (for error calculations)
        setThreshold(clampedThreshold);
      })
      .on("end", function() {
        d3.select(this).select(".threshold-line")
          .attr("stroke-width", 3)
          .attr("stroke", "#ffffff");
        setIsDragging(false);
      });
    
    thresholdGroup.call(drag);
    
    // Highlight on hover
    thresholdGroup
      .on("mouseenter", function() {
        if (!isDragging) {
          d3.select(this).select(".threshold-line")
            .attr("stroke-width", 4)
            .attr("stroke", "#facc15");
        }
      })
      .on("mouseleave", function() {
        if (!isDragging) {
          d3.select(this).select(".threshold-line")
            .attr("stroke-width", 3)
            .attr("stroke", "#ffffff");
        }
      });
    
    // Helper function to update threshold position
    const updateThresholdPosition = (thresh) => {
      const xPos = x(thresh);
      
      thresholdGroup.select(".threshold-line")
        .attr("x1", xPos)
        .attr("x2", xPos);
      
      thresholdGroup.select(".threshold-drag-area")
        .attr("x", xPos - 30);
      
      thresholdGroup.select(".threshold-handle")
        .attr("x", xPos - 20);
      
      thresholdGroup.select(".threshold-icon")
        .attr("x", xPos);
      
      thresholdGroup.select(".threshold-label")
        .attr("x", xPos)
        .text(`Threshold: ${thresh.toFixed(0)}`);
    };
    
    // Initial position
    updateThresholdPosition(threshold);
    
    // Animate on mount
    setAnimateIn(true);
    
    // Animate curves drawing
    const paths = g.selectAll("path").filter(function() {
      return d3.select(this).attr("fill") === "none";
    });
    
    paths.each(function() {
      const path = d3.select(this);
      try {
        const totalLength = this.getTotalLength();
        
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1500)
          .ease(d3.easeCubicInOut)
          .attr("stroke-dashoffset", 0);
      } catch (e) {
        // Path animation failed silently
      }
    });
    
  }, []); // Run only once on mount
  
  // Update threshold position and error areas
  useEffect(() => {
    if (!thresholdLineRef.current || !scalesRef.current.x) return;
    
    const { x, y } = scalesRef.current;
    const { width: innerWidth, height: innerHeight } = innerDimensionsRef.current;
    
    // Update threshold position
    const xPos = x(threshold);
    
    thresholdLineRef.current.select(".threshold-line")
      .attr("x1", xPos)
      .attr("x2", xPos);
    
    thresholdLineRef.current.select(".threshold-drag-area")
      .attr("x", xPos - 30);
    
    thresholdLineRef.current.select(".threshold-handle")
      .attr("x", xPos - 20);
    
    thresholdLineRef.current.select(".threshold-icon")
      .attr("x", xPos);
    
    thresholdLineRef.current.select(".threshold-label")
      .attr("x", xPos)
      .text(`Threshold: ${threshold.toFixed(0)}`);
    
    // Update error areas
    if (showAreas && errorAreasRef.current.typeI) {
      const { typeI, typeII, healthyData, diseasedData } = errorAreasRef.current;
      
      // Clear existing areas
      typeI.selectAll("*").remove();
      typeII.selectAll("*").remove();
      
      // Area generator
      const area = d3.area()
        .x(d => x(d.x))
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(d3.curveBasis);
      
      // Type I error area
      const typeIData = healthyData.filter(d => d.x >= threshold);
      if (typeIData.length > 0) {
        typeI.append("path")
          .datum(typeIData)
          .attr("d", area)
          .attr("fill", "url(#typeI-gradient)")
          .style("opacity", animateIn ? 0 : 1)
          .transition()
          .duration(500)
          .ease(d3.easeCubicInOut)
          .style("opacity", 1);
      }
      
      // Type II error area
      const typeIIData = diseasedData.filter(d => d.x <= threshold);
      if (typeIIData.length > 0) {
        typeII.append("path")
          .datum(typeIIData)
          .attr("d", area)
          .attr("fill", "url(#typeII-gradient)")
          .style("opacity", animateIn ? 0 : 1)
          .transition()
          .duration(500)
          .ease(d3.easeCubicInOut)
          .style("opacity", 1);
      }
    } else if (errorAreasRef.current.typeI) {
      // Clear areas if not showing
      errorAreasRef.current.typeI.selectAll("*").remove();
      errorAreasRef.current.typeII.selectAll("*").remove();
    }
  }, [threshold, showAreas, animateIn]);
  
  // Reset function
  const reset = () => {
    setThreshold(70);
    setShowAreas(true);
  };
  
  return (
    <VisualizationContainer
      title="Type I & II Errors: The Inevitable Trade-off"
      description="Adjust the test threshold to see how errors change. No test is perfect!"
    >
      <div className="space-y-4">
        {/* Main Visualization - Crown Jewel */}
        <GraphContainer title="Test Result Distributions - Drag the Threshold!">
          <svg ref={svgRef} className="w-full"></svg>
          
          {/* Inline Insights */}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-700 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-neutral-300">Healthy Population</span>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all duration-500",
              insight.color === "#ef4444" && "bg-red-500/20 text-red-400",
              insight.color === "#fbbf24" && "bg-yellow-500/20 text-yellow-400",
              insight.color === "#10b981" && "bg-green-500/20 text-green-400"
            )}>
              {insight.title}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-neutral-300">Diseased Population</span>
            </div>
          </div>
        </GraphContainer>
        
        {/* Error Cards - Horizontal Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Type I Error Card */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-red-400">Type I Error</h4>
              <span className="text-xs text-red-400">(False Positive)</span>
            </div>
            <div className="text-3xl font-mono font-bold text-red-400 mb-1">
              {errors.per10000.falsePositives}
            </div>
            <p className="text-xs text-neutral-300">
              healthy people out of {errors.per10000.healthy.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Unnecessary worry, further tests
            </p>
          </div>
          
          {/* Type II Error Card */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-400">Type II Error</h4>
              <span className="text-xs text-yellow-400">(False Negative)</span>
            </div>
            <div className="text-3xl font-mono font-bold text-yellow-400 mb-1">
              {errors.per10000.falseNegatives}
            </div>
            <p className="text-xs text-neutral-300">
              diseased people out of {errors.per10000.diseased}
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Missed diagnosis, delayed treatment
            </p>
          </div>
          
          {/* Center Info Card */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-teal-400 mb-3">Medical Test Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-400 mb-1">Sensitivity</div>
                <div className="text-2xl font-mono font-bold text-green-400">
                  {((1 - errors.typeII) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-neutral-500">Catches disease</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1">Specificity</div>
                <div className="text-2xl font-mono font-bold text-blue-400">
                  {((1 - errors.typeI) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-neutral-500">Avoids false alarms</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-neutral-700 flex items-center justify-between">
              <button
                onClick={() => setShowAreas(!showAreas)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                  showAreas
                    ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-500/50'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                }`}
              >
                {showAreas ? "Hide" : "Show"} Errors
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white border border-neutral-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Key Learning Points - Compact */}
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="grid md:grid-cols-4 gap-3 text-xs">
            <div className="text-neutral-300">
              <span className="text-teal-400 font-medium">Key Insight:</span> The overlap makes perfect tests impossible
            </div>
            <div className="text-neutral-300">
              <span className="text-teal-400 font-medium">Trade-off:</span> Reducing one error increases the other
            </div>
            <div className="text-neutral-300">
              <span className="text-teal-400 font-medium">Context:</span> Medical consequences guide threshold choice
            </div>
            <div className="text-neutral-300">
              <span className="text-teal-400 font-medium">Rarity:</span> 1% prevalence amplifies false positives
            </div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}