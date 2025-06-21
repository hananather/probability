"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, formatNumber } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Initial dataset to start with
const INITIAL_DATA = [30, 40, 50, 60, 70];

function DataExplorerIntro() {
  const [data, setData] = useState(INITIAL_DATA);
  const [interactions, setInteractions] = useState(0);
  const [showMean, setShowMean] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [achievedGoal, setAchievedGoal] = useState(false);
  
  const svgRef = useRef(null);
  const isInitialized = useRef(false);
  const dragState = useRef({
    isDragging: false,
    draggedIndex: null,
    startX: 0,
    initialValue: 0
  });
  const elementsRef = useRef({
    pointsGroup: null,
    meanGroup: null,
    xScale: null
  });
  
  // Calculate mean
  const mean = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;
  
  // Check if most values cluster around 50 (for the challenge)
  const checkClusteringGoal = useCallback(() => {
    if (data.length < 5) return false;
    const nearFifty = data.filter(d => d >= 45 && d <= 55).length;
    return nearFifty >= Math.floor(data.length * 0.6);
  }, [data]);
  
  useEffect(() => {
    if (checkClusteringGoal() && !achievedGoal) {
      setAchievedGoal(true);
    }
  }, [data, checkClusteringGoal, achievedGoal]);
  
  // Unlock mean after 5 interactions
  useEffect(() => {
    if (interactions >= 5 && !showMean) {
      setShowMean(true);
    }
  }, [interactions, showMean]);
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 60, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    // Number line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", colors.chart.grid)
      .attr("stroke-width", 2);
    
    // Tick marks
    const ticks = [0, 25, 50, 75, 100];
    g.selectAll(".tick")
      .data(ticks)
      .enter()
      .append("g")
      .attr("class", "tick")
      .attr("transform", d => `translate(${xScale(d)}, ${innerHeight / 2})`)
      .each(function(d) {
        d3.select(this).append("line")
          .attr("y1", -5)
          .attr("y2", 5)
          .attr("stroke", colors.chart.grid)
          .attr("stroke-width", 2);
        
        d3.select(this).append("text")
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .style("font-size", "14px")
          .style("font-family", "monospace")
          .text(d);
      });
    
    // Store scale reference
    elementsRef.current.xScale = xScale;
    
    // Data points drag behavior with proper delta tracking
    const drag = d3.drag()
      .on("start", function(event, d) {
        dragState.current.isDragging = true;
        dragState.current.draggedIndex = data.indexOf(d);
        dragState.current.startX = event.x;
        dragState.current.initialValue = d;
        
        d3.select(this)
          .raise()
          .transition()
          .duration(100)
          .attr("r", 12);
      })
      .on("drag", function(event) {
        if (dragState.current.draggedIndex === -1) return;
        
        // Calculate delta from start position
        const deltaX = event.x - dragState.current.startX;
        const newX = xScale(dragState.current.initialValue) + deltaX;
        const constrainedX = Math.max(0, Math.min(innerWidth, newX));
        const newValue = Math.round(xScale.invert(constrainedX));
        
        // Only update if value actually changed
        if (newValue !== data[dragState.current.draggedIndex] && newValue >= 0 && newValue <= 100) {
          // Update D3 element immediately for smooth visual feedback
          d3.select(this).attr("cx", xScale(newValue));
          
          // Update corresponding label
          elementsRef.current.pointsGroup.select(`.value-label-${dragState.current.draggedIndex}`)
            .attr("x", xScale(newValue))
            .text(newValue);
          
          // Update React state
          const newData = [...data];
          newData[dragState.current.draggedIndex] = newValue;
          setData(newData);
        }
      })
      .on("end", function() {
        dragState.current.isDragging = false;
        dragState.current.draggedIndex = -1;
        setInteractions(prev => prev + 1);
        
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 8);
      });
    
    // Points group
    const pointsGroup = g.append("g").attr("class", "points");
    elementsRef.current.pointsGroup = pointsGroup;
    
    pointsGroup.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d))
      .attr("cy", innerHeight / 2)
      .attr("r", 0)
      .attr("fill", colors.primary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "grab")
      .on("mouseenter", function(event, d) {
        if (!dragState.current.isDragging) {
          setHoveredPoint(d);
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 10);
        }
      })
      .on("mouseleave", function() {
        if (!dragState.current.isDragging) {
          setHoveredPoint(null);
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 8);
        }
      })
      .on("contextmenu", function(event, d) {
        event.preventDefault();
        // Remove point on right-click
        setData(data.filter(val => val !== d));
        setInteractions(prev => prev + 1);
      })
      .call(drag)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr("r", 8);
    
    // Value labels with unique classes for updating
    pointsGroup.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", (d, i) => `value-label value-label-${i}`)
      .attr("x", d => xScale(d))
      .attr("y", innerHeight / 2 - 20)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .style("opacity", 0)
      .style("pointer-events", "none")
      .text(d => d)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .style("opacity", 0.8);
    
    // Mean line (if unlocked)
    if (showMean && data.length > 0) {
      const meanGroup = g.append("g").attr("class", "mean-group");
      elementsRef.current.meanGroup = meanGroup;
      
      meanGroup.append("line")
        .attr("x1", xScale(mean))
        .attr("x2", xScale(mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.accent)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 0.8);
      
      meanGroup.append("text")
        .attr("x", xScale(mean))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.accent)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Mean: ${mean.toFixed(1)}`)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    }
    
    // Add new point on click
    svg.on("click", function(event) {
      if (event.defaultPrevented || dragState.current.isDragging) return;
      
      const [x] = d3.pointer(event, g.node());
      if (x >= 0 && x <= innerWidth) {
        const value = Math.round(xScale.invert(x));
        if (value >= 0 && value <= 100) {
          setData([...data, value]);
          setInteractions(prev => prev + 1);
        }
      }
    });
    
    isInitialized.current = true;
    
    // Cleanup function
    return () => {
      svg.on("click", null);
      pointsGroup.selectAll(".point").on(".drag", null);
    };
  }, [data, mean, showMean]);
  
  // Update only mean line position when data changes
  useEffect(() => {
    if (!isInitialized.current || !showMean || !elementsRef.current.meanGroup) return;
    
    const meanGroup = elementsRef.current.meanGroup;
    const xScale = elementsRef.current.xScale;
    
    // Update mean line position smoothly
    meanGroup.select("line")
      .transition()
      .duration(300)
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean));
    
    meanGroup.select("text")
      .transition()
      .duration(300)
      .attr("x", xScale(mean))
      .text(`Mean: ${mean.toFixed(1)}`);
  }, [mean, showMean]);
  
  const resetData = () => {
    setData(INITIAL_DATA);
    setAchievedGoal(false);
  };
  
  return (
    <VisualizationContainer title="Meet Your Data">
      <div className="flex flex-col gap-6">
        {/* Instructions */}
        <VisualizationSection>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Your First Data Adventure!
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-2xl">👆</span>
                <div>
                  <p className="font-semibold text-neutral-300">Click to Add</p>
                  <p className="text-neutral-400">Click anywhere on the number line to add a new data point</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">✋</span>
                <div>
                  <p className="font-semibold text-neutral-300">Drag to Move</p>
                  <p className="text-neutral-400">Grab any dot and drag it to change its value</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">🖱️</span>
                <div>
                  <p className="font-semibold text-neutral-300">Right-Click to Remove</p>
                  <p className="text-neutral-400">Right-click (or Ctrl+click) on any dot to remove it</p>
                </div>
              </div>
            </div>
          </div>
        </VisualizationSection>
        
        {/* Challenge Box */}
        <AnimatePresence>
          {!achievedGoal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VisualizationSection className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30">
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">
                    🎯 Challenge: Create a Cluster!
                  </h4>
                  <p className="text-neutral-300">
                    Can you create a dataset where most values cluster around 50? 
                    You'll need at least 5 points, with 60% of them between 45 and 55.
                  </p>
                </div>
              </VisualizationSection>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Message */}
        <AnimatePresence>
          {achievedGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="transform"
            >
              <VisualizationSection className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-600/30">
                <div className="p-4 text-center">
                  <h4 className="text-2xl font-bold text-green-400 mb-2">
                    🎉 Excellent Work!
                  </h4>
                  <p className="text-neutral-300">
                    You've created a clustered dataset! Notice how the data points group together around 50.
                  </p>
                </div>
              </VisualizationSection>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Visualization */}
        <GraphContainer height="300px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">Data Points</span>
            <div className="font-mono text-2xl text-white">
              {data.length}
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">Min Value</span>
            <div className="font-mono text-2xl text-white">
              {data.length > 0 ? Math.min(...data) : '—'}
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">Max Value</span>
            <div className="font-mono text-2xl text-white">
              {data.length > 0 ? Math.max(...data) : '—'}
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-4 text-center">
            <span className="text-sm text-neutral-400">
              {hoveredPoint !== null ? 'Hovering' : 'Range'}
            </span>
            <div className="font-mono text-2xl text-white">
              {hoveredPoint !== null ? hoveredPoint : 
               data.length > 0 ? Math.max(...data) - Math.min(...data) : '—'}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Mean Unlock Message */}
        <AnimatePresence>
          {showMean && interactions === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <VisualizationSection className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30">
                <div className="p-4 text-center">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                    🔓 New Concept Unlocked: The Mean!
                  </h4>
                  <p className="text-neutral-300">
                    Look at the orange dashed line - that's the mean (average) of your data! 
                    Watch how it moves as you change your data points.
                  </p>
                </div>
              </VisualizationSection>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Controls and Progress */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetData}
          >
            Reset Data
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">Progress</span>
            <ProgressBar 
              current={Math.min(interactions, 10)} 
              total={10} 
              label={showMean ? "Mean Unlocked!" : "Interactions"} 
              variant={showMean ? "emerald" : "blue"}
              className="w-48"
            />
          </div>
        </div>
        
        {/* Current Data Display */}
        <VisualizationSection className="p-4">
          <h4 className="text-sm font-semibold text-neutral-400 mb-2">Your Dataset:</h4>
          <div className="flex flex-wrap gap-2">
            {data.sort((a, b) => a - b).map((value, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-neutral-800 rounded-full font-mono text-sm text-white"
              >
                {value}
              </span>
            ))}
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}

export default DataExplorerIntro;