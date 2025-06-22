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
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { TutorialButton } from '../ui/TutorialButton';
import { Tutorial } from '../ui/Tutorial';

// Initial dataset to start with
const INITIAL_DATA = [30, 40, 50, 60, 70];

function DataExplorerIntro() {
  const [data, setData] = useState(INITIAL_DATA);
  const [showMean, setShowMean] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [achievedGoal, setAchievedGoal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const svgRef = useRef(null);
  const isInitialized = useRef(false);
  const interactionCount = useRef(0);
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
  
  // Track interactions and unlock mean
  const incrementInteractions = useCallback(() => {
    interactionCount.current += 1;
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    if (interactionCount.current >= 5 && !showMean) {
      setShowMean(true);
    }
  }, [showMean, hasInteracted]);
  
  // Educational tutorial steps
  const tutorialSteps = [
    {
      title: "Understanding Data Visualization",
      content: (
        <div className="space-y-2">
          <p>Welcome to interactive data exploration! This tool helps you understand fundamental statistical concepts.</p>
          <p className="text-sm text-neutral-400">You'll learn:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>How data points form distributions</li>
            <li>The concept of arithmetic mean</li>
            <li>How data clustering affects statistics</li>
          </ul>
        </div>
      )
    },
    {
      target: '.number-line',
      title: "The Number Line",
      content: (
        <div className="space-y-2">
          <p>This horizontal line represents values from 0 to 100.</p>
          <p className="text-sm text-neutral-400">Each point on this line corresponds to a specific numerical value - a fundamental concept in data visualization.</p>
        </div>
      ),
      position: 'top'
    },
    {
      target: '.point',
      title: "Data Points",
      content: (
        <div className="space-y-2">
          <p>These circles represent individual data values in your dataset.</p>
          <div className="text-sm space-y-1">
            <p>• <strong>Position</strong>: Shows the numerical value</p>
            <p>• <strong>Count</strong>: More points = more data</p>
            <p>• <strong>Spread</strong>: How data distributes</p>
          </div>
        </div>
      ),
      position: 'bottom'
    },
    {
      title: "Interacting with Data",
      content: (
        <div className="space-y-2">
          <p className="font-semibold">Three ways to manipulate your dataset:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-400">➕</span>
              <div>
                <strong>Add points:</strong> Click anywhere on the number line
                <p className="text-xs text-neutral-400">Creates new data at that value</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">↔️</span>
              <div>
                <strong>Move points:</strong> Drag existing dots
                <p className="text-xs text-neutral-400">Changes the value of that data point</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">❌</span>
              <div>
                <strong>Remove points:</strong> Right-click any dot
                <p className="text-xs text-neutral-400">Removes data from your set</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Mean: A Central Concept",
      content: (
        <div className="space-y-2">
          <p>After 5 interactions, you'll unlock the <strong className="text-orange-400">mean line</strong>.</p>
          <div className="bg-neutral-900 p-3 rounded-lg border border-orange-500/20">
            <p className="text-orange-400 font-mono text-center mb-1">Mean = Σx / n</p>
            <p className="text-xs text-neutral-400 text-center">Sum of all values divided by count</p>
          </div>
          <p className="text-sm">The mean represents the "center of mass" of your data - watch how it moves as you change values!</p>
        </div>
      )
    },
    {
      title: "Challenge: Understanding Clustering",
      content: (
        <div className="space-y-2">
          <p>Your mathematical challenge: Create a <strong>clustered distribution</strong>.</p>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-sm mb-2">Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>At least 5 data points</li>
              <li>60% between values 45-55</li>
            </ul>
          </div>
          <p className="text-sm text-neutral-400 mt-2">This teaches how data concentration affects statistical measures!</p>
        </div>
      )
    }
  ];
  
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
      .attr("class", "number-line")
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
    
    // Data points drag behavior - update DOM directly during drag
    const drag = d3.drag()
      .on("start", function(event, d) {
        dragState.current.isDragging = true;
        dragState.current.draggedIndex = data.indexOf(d);
        dragState.current.startX = event.x;
        dragState.current.initialValue = d;
        
        d3.select(this)
          .raise()
          .style("cursor", "grabbing")
          .transition()
          .duration(100)
          .attr("r", 12)
          .attr("opacity", 0.8);
      })
      .on("drag", function(event) {
        if (dragState.current.draggedIndex === -1) return;
        
        // Calculate new position based on mouse movement
        const deltaX = event.x - dragState.current.startX;
        const newX = xScale(dragState.current.initialValue) + deltaX;
        const constrainedX = Math.max(0, Math.min(innerWidth, newX));
        const newValue = Math.round(xScale.invert(constrainedX));
        
        // Update DOM directly for smooth visual feedback
        if (newValue >= 0 && newValue <= 100) {
          d3.select(this).attr("cx", xScale(newValue));
          
          // Update corresponding label
          elementsRef.current.pointsGroup.select(`.value-label-${dragState.current.draggedIndex}`)
            .attr("x", xScale(newValue))
            .text(newValue);
        }
      })
      .on("end", function(event) {
        const deltaX = event.x - dragState.current.startX;
        const newX = xScale(dragState.current.initialValue) + deltaX;
        const constrainedX = Math.max(0, Math.min(innerWidth, newX));
        const finalValue = Math.round(xScale.invert(constrainedX));
        
        // Update React state only when drag ends
        if (finalValue !== dragState.current.initialValue && finalValue >= 0 && finalValue <= 100) {
          const newData = [...data];
          newData[dragState.current.draggedIndex] = finalValue;
          setData(newData);
        }
        
        dragState.current.isDragging = false;
        dragState.current.draggedIndex = -1;
        incrementInteractions();
        
        d3.select(this)
          .style("cursor", "grab")
          .transition()
          .duration(100)
          .attr("r", 8)
          .attr("opacity", 1);
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
        incrementInteractions();
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
          // Add visual feedback for new point
          const tempCircle = g.append("circle")
            .attr("cx", xScale(value))
            .attr("cy", innerHeight / 2)
            .attr("r", 0)
            .attr("fill", colors.primary)
            .attr("opacity", 0.5)
            .transition()
            .duration(200)
            .attr("r", 15)
            .attr("opacity", 0)
            .remove();
          
          setData([...data, value]);
          incrementInteractions();
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
    <VisualizationContainer title="4.1 Data Explorer Intro">
      <TutorialButton 
        onClick={() => setShowTutorial(true)}
        position="top-right"
      />
      
      {showTutorial && (
        <Tutorial
          steps={tutorialSteps}
          showOnMount={true}
          persistKey="data-explorer-intro"
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
          mode="tooltip"
        />
      )}
      
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
          <svg 
            ref={svgRef} 
            style={{ width: "100%", height: "100%", cursor: "crosshair" }}
            className="data-explorer-svg"
          />
          <style jsx>{`
            .data-explorer-svg:has(.point:hover) {
              cursor: default !important;
            }
          `}</style>
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
          {showMean && interactionCount.current <= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
        
        {/* Controls */}
        <div className="flex items-center justify-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetData}
          >
            Reset Data
          </Button>
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