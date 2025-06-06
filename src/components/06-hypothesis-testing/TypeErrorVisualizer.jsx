"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';

export default function TypeErrorVisualizer() {
  // Fixed scenario parameters for medical test
  const SCENARIO = {
    healthy: { mean: 60, std: 10, label: "Healthy", color: "#3b82f6" },
    diseased: { mean: 85, std: 12, label: "Diseased", color: "#f59e0b" },
    prevalence: 0.01, // 1% have disease
    thresholdMin: 40,
    thresholdMax: 110
  };
  
  // State
  const [threshold, setThreshold] = useState(70);
  const [showAreas, setShowAreas] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Reset animation state when component remounts
  useEffect(() => {
    return () => {
      setAnimateIn(false);
    };
  }, []);
  
  // Refs for D3 visualizations
  const svgRef = useRef(null);
  
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
        color: "#f59e0b"
      };
    }
    if (threshold < 80) {
      return {
        title: "Balanced Approach",
        content: "Reasonable trade-off between catching disease and avoiding false alarms.",
        color: "#14b8a6"
      };
    }
    if (threshold < 95) {
      return {
        title: "Conservative Testing",
        content: "Few false alarms, but missing some disease cases.",
        color: "#f59e0b"
      };
    }
    return {
      title: "Extreme Conservatism",
      content: "Almost no false positives, but missing many sick patients!",
      color: "#ef4444"
    };
  };
  
  const insight = getInsight();
  
  // Initialize and update visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const x = d3.scaleLinear()
      .domain([20, 120])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.05])
      .range([innerHeight, 0]);
    
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
    
    // Type II error gradient (orange)
    const typeIIGradient = defs.append("linearGradient")
      .attr("id", "typeII-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    typeIIGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0.5);
    
    typeIIGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0.1);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .text("Test Result Value");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d.toFixed(3)))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .text("Probability Density");
    
    // Draw error areas if enabled
    if (showAreas) {
      // Type I error area (healthy people above threshold)
      const typeIArea = d3.area()
        .x(d => x(d.x))
        .y0(innerHeight)
        .y1(d => y(d.y))
        .curve(d3.curveBasis);
      
      const typeIData = healthyData.filter(d => d.x >= threshold);
      if (typeIData.length > 0) {
        g.append("path")
          .datum(typeIData)
          .attr("d", typeIArea)
          .attr("fill", "url(#typeI-gradient)")
          .attr("class", "error-area type-i");
      }
      
      // Type II error area (diseased people below threshold)
      const typeIIData = diseasedData.filter(d => d.x <= threshold);
      if (typeIIData.length > 0) {
        g.append("path")
          .datum(typeIIData)
          .attr("d", typeIArea)
          .attr("fill", "url(#typeII-gradient)")
          .attr("class", "error-area type-ii");
      }
    }
    
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
    
    // Draggable threshold line
    const thresholdLine = g.append("g")
      .attr("class", "threshold-group")
      .style("cursor", "ew-resize");
    
    thresholdLine.append("line")
      .attr("x1", x(threshold))
      .attr("x2", x(threshold))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");
    
    // Threshold handle
    thresholdLine.append("rect")
      .attr("x", x(threshold) - 20)
      .attr("y", innerHeight / 2 - 20)
      .attr("width", 40)
      .attr("height", 40)
      .attr("fill", "#ffffff")
      .attr("fill-opacity", 0.1)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("rx", 5);
    
    thresholdLine.append("text")
      .attr("x", x(threshold))
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text("⇔");
    
    // Threshold label
    thresholdLine.append("text")
      .attr("x", x(threshold))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`Threshold: ${threshold.toFixed(0)}`);
    
    // Drag behavior with debouncing
    let dragTimeout;
    const drag = d3.drag()
      .on("start", () => setIsDragging(true))
      .on("drag", (event) => {
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          const newX = Math.max(0, Math.min(innerWidth, event.x));
          const newThreshold = x.invert(newX);
          const clampedThreshold = Math.max(SCENARIO.thresholdMin, Math.min(SCENARIO.thresholdMax, newThreshold));
          setThreshold(Math.round(clampedThreshold));
        }, 10); // Debounce for 10ms to prevent excessive updates
      })
      .on("end", () => {
        clearTimeout(dragTimeout);
        setIsDragging(false);
      });
    
    thresholdLine.call(drag);
    
    // Highlight on hover
    thresholdLine
      .on("mouseenter", function() {
        d3.select(this).select("line")
          .attr("stroke-width", 4)
          .attr("stroke", "#facc15");
      })
      .on("mouseleave", function() {
        if (!isDragging) {
          d3.select(this).select("line")
            .attr("stroke-width", 3)
            .attr("stroke", "#ffffff");
        }
      });
    
    // Animate on mount
    if (!animateIn) {
      setAnimateIn(true);
      
      // Animate curves drawing (only for line paths, not area paths)
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
          // If getTotalLength fails, just show the path immediately
          console.warn("Path animation failed:", e);
        }
      });
      
      // Fade in error areas
      g.selectAll(".error-area")
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
    }
    
  }, [threshold, showAreas, isDragging, animateIn]);
  
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
              insight.color === "#f59e0b" && "bg-orange-500/20 text-orange-400",
              insight.color === "#14b8a6" && "bg-teal-500/20 text-teal-400"
            )}>
              {insight.title}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
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
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-orange-400">Type II Error</h4>
              <span className="text-xs text-orange-400">(False Negative)</span>
            </div>
            <div className="text-3xl font-mono font-bold text-orange-400 mb-1">
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
              <Button
                onClick={() => setShowAreas(!showAreas)}
                size="sm"
                variant={showAreas ? "default" : "secondary"}
              >
                {showAreas ? "Hide" : "Show"} Errors
              </Button>
              <Button
                onClick={reset}
                size="sm"
                variant="outline"
              >
                Reset
              </Button>
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