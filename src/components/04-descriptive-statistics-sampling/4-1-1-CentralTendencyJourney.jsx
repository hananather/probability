"use client";
import React, { useState, useRef, useEffect } from "react";
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

// Levels configuration
const LEVELS = [
  {
    id: 'mean',
    title: 'Level 1: Mean - The Physics of Balance',
    subtitle: 'Find the balance point using real physics',
    description: 'All blocks weigh the same. Balance depends on their distance from the fulcrum at position 50!',
    challenge: 'Balance the seesaw by arranging blocks so left and right torques are equal',
    unlockNext: 'Unlock Median →'
  },
  {
    id: 'median',
    title: 'Level 2: Median - The Middle Ground',
    subtitle: 'Discover the robust center',
    description: 'The median is the middle value when data is sorted. It stays stable even with outliers!',
    challenge: 'Keep the median at 50 while adding values above 80',
    unlockNext: 'Unlock Mode →'
  },
  {
    id: 'mode',
    title: 'Level 3: Mode - The Popular Vote',
    subtitle: 'Find the most frequent value',
    description: 'The mode is the value that appears most often. Vote for your favorites!',
    challenge: 'Create a bimodal distribution (two modes)',
    unlockNext: 'Journey Complete! 🎉'
  }
];

// Badge configurations
const BADGES = {
  mean: { name: 'Balance Master', icon: '⚖️', color: '#facc15' },
  median: { name: 'Middle Ground Expert', icon: '🎯', color: '#14b8a6' },
  mode: { name: 'Popular Vote Champion', icon: '🗳️', color: '#8b5cf6' }
};

function CentralTendencyJourney() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelData, setLevelData] = useState({
    mean: [30, 40, 60, 70],
    median: [30, 40, 50, 60, 70],
    mode: []
  });
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [interactions, setInteractions] = useState(0);
  
  const meanVizRef = useRef(null);
  const medianVizRef = useRef(null);
  const modeVizRef = useRef(null);
  
  // Refs for D3 elements and state management
  const meanElementsRef = useRef({
    svg: null,
    beamGroup: null,
    weightsGroup: null,
    meanIndicator: null,
    xScale: null,
    initialized: false
  });
  
  const dragStateRef = useRef({
    isDragging: false,
    draggedIndex: null,
    startX: 0,
    startValue: 0
  });
  
  const level = LEVELS[currentLevel];
  const data = levelData[level.id];
  
  // Calculate statistics
  const calculateStats = (values) => {
    if (values.length === 0) return { mean: 0, median: 0, mode: [], totalTorque: 0 };
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    const frequency = {};
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq && frequency[key] > 1)
      .map(Number);
    
    // Calculate torque for physics-based seesaw
    // All blocks have equal weight (1 unit)
    // Torque = weight × distance from fulcrum (position 50)
    const BLOCK_WEIGHT = 1;
    let leftTorque = 0;
    let rightTorque = 0;
    
    values.forEach(position => {
      const distanceFromFulcrum = position - 50;
      const torque = BLOCK_WEIGHT * Math.abs(distanceFromFulcrum);
      
      if (distanceFromFulcrum < 0) {
        leftTorque += torque;
      } else if (distanceFromFulcrum > 0) {
        rightTorque += torque;
      }
      // Values at exactly 50 contribute no torque
    });
    
    const totalTorque = rightTorque - leftTorque; // positive tilts right, negative tilts left
    
    return { mean, median, modes, frequency, totalTorque, leftTorque, rightTorque };
  };
  
  const stats = calculateStats(data);
  
  // Check challenge completion
  useEffect(() => {
    let completed = false;
    
    if (level.id === 'mean' && data.length >= 2) {
      // Check if seesaw is balanced (torques are nearly equal)
      completed = Math.abs(stats.totalTorque) < 5; // Small tolerance for balance
    } else if (level.id === 'median') {
      const hasOutliers = data.some(d => d > 80);
      completed = hasOutliers && Math.abs(stats.median - 50) < 0.1;
    } else if (level.id === 'mode') {
      completed = stats.modes.length === 2;
    }
    
    if (completed && !challengeCompleted) {
      setChallengeCompleted(true);
      if (!earnedBadges.includes(level.id)) {
        setEarnedBadges([...earnedBadges, level.id]);
      }
    }
  }, [data, stats, level.id, challengeCompleted, earnedBadges]);
  
  // Initialize mean visualization once
  useEffect(() => {
    if (!meanVizRef.current || meanElementsRef.current.initialized) return;
    
    const svg = d3.select(meanVizRef.current);
    const { width } = meanVizRef.current.getBoundingClientRect();
    const height = 300;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const centerX = width / 2;
    const baseY = height * 0.7;
    
    // Fulcrum (static)
    svg.append("path")
      .attr("d", `M ${centerX - 30} ${baseY} L ${centerX} ${baseY - 40} L ${centerX + 30} ${baseY} Z`)
      .attr("fill", "#374151")
      .attr("stroke", "#4b5563")
      .attr("stroke-width", 2);
    
    // Add fulcrum base circle for visual polish
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", baseY - 40)
      .attr("r", 8)
      .attr("fill", "#4b5563");
    
    // Main beam group
    const beamGroup = svg.append("g")
      .attr("class", "beam-group")
      .attr("transform", `translate(${centerX}, ${baseY - 40})`);
    
    // Beam
    beamGroup.append("rect")
      .attr("class", "beam")
      .attr("x", -200)
      .attr("y", -10)
      .attr("width", 400)
      .attr("height", 20)
      .attr("fill", "#1f2937")
      .attr("stroke", "#374151")
      .attr("stroke-width", 2)
      .attr("rx", 10);
    
    // Fulcrum line at 50
    beamGroup.append("line")
      .attr("class", "fulcrum-line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", -35)
      .attr("y2", 15)
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);
    
    beamGroup.append("text")
      .attr("class", "fulcrum-label")
      .attr("x", 0)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#4ade80")
      .style("font-size", "12px")
      .style("font-family", "monospace")
      .text("Fulcrum (50)");
    
    // Torque indicators
    const torqueGroup = beamGroup.append("g")
      .attr("class", "torque-indicators");
    
    // Left torque
    torqueGroup.append("text")
      .attr("class", "left-torque")
      .attr("x", -100)
      .attr("y", -120)
      .attr("text-anchor", "middle")
      .attr("fill", "#ef4444")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace");
    
    // Right torque
    torqueGroup.append("text")
      .attr("class", "right-torque")
      .attr("x", 100)
      .attr("y", -120)
      .attr("text-anchor", "middle")
      .attr("fill", "#3b82f6")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace");
    
    // Weights group
    const weightsGroup = beamGroup.append("g")
      .attr("class", "weights-group");
    
    // Mean indicator group
    const meanIndicator = beamGroup.append("g")
      .attr("class", "mean-indicator");
    
    meanIndicator.append("line")
      .attr("class", "mean-line")
      .attr("y1", -40)
      .attr("y2", -80)
      .attr("stroke", colors.accent)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");
    
    meanIndicator.append("text")
      .attr("class", "mean-label")
      .attr("y", -90)
      .attr("text-anchor", "middle")
      .attr("fill", colors.accent)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "monospace");
    
    // Value tooltip (hidden by default)
    const tooltip = beamGroup.append("g")
      .attr("class", "value-tooltip")
      .style("opacity", 0);
    
    tooltip.append("rect")
      .attr("x", -25)
      .attr("y", -65)
      .attr("width", 50)
      .attr("height", 25)
      .attr("rx", 4)
      .attr("fill", "#1f2937")
      .attr("stroke", "#4b5563")
      .attr("stroke-width", 1);
    
    tooltip.append("text")
      .attr("class", "tooltip-text")
      .attr("text-anchor", "middle")
      .attr("y", -48)
      .attr("fill", "#fff")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace");
    
    // Store references
    meanElementsRef.current = {
      svg,
      beamGroup,
      weightsGroup,
      meanIndicator,
      tooltip,
      xScale: d3.scaleLinear().domain([0, 100]).range([-180, 180]),
      initialized: true
    };
  }, [level.id]);
  
  // Update mean visualization when data changes
  useEffect(() => {
    if (!meanElementsRef.current.initialized || level.id !== 'mean') return;
    
    const { beamGroup, weightsGroup, meanIndicator, tooltip, xScale } = meanElementsRef.current;
    
    // Calculate tilt based on torque physics
    // Maximum torque scenario: all blocks at one extreme (50 units from fulcrum)
    const maxPossibleTorque = Math.max(1, data.length) * 50; // max distance from fulcrum
    const tiltMagnitude = Math.min(20, Math.abs(stats.totalTorque) / maxPossibleTorque * 20);
    const tilt = Math.sign(stats.totalTorque) * tiltMagnitude; // positive = tilt right (clockwise)
    
    // Animate beam tilt
    beamGroup.select(".beam")
      .transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .attr("transform", `rotate(${tilt})`);
    
    // Update weights
    const weights = weightsGroup.selectAll(".weight")
      .data(data, d => d);
    
    // Enter new weights
    const weightsEnter = weights.enter()
      .append("g")
      .attr("class", "weight")
      .style("opacity", 0);
    
    weightsEnter.append("rect")
      .attr("class", "weight-box")
      .attr("fill", colors.primary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("rx", 5)
      .style("cursor", "grab");
    
    weightsEnter.append("text")
      .attr("class", "weight-label")
      .attr("text-anchor", "middle")
      .attr("y", 5)
      .attr("fill", "#fff")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .style("pointer-events", "none");
    
    // Add shadow for depth
    weightsEnter.append("ellipse")
      .attr("class", "weight-shadow")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("rx", 12)
      .attr("ry", 4)
      .attr("fill", "#000")
      .attr("opacity", 0.2)
      .style("pointer-events", "none");
    
    // Merge and update
    const allWeights = weightsEnter.merge(weights);
    
    // Fixed size for all blocks since they have equal weight
    const BLOCK_SIZE = 30;
    
    allWeights
      .transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .style("opacity", 1)
      .attr("transform", d => `translate(${xScale(d)}, ${-10 - BLOCK_SIZE/2})`);
    
    // Update weight box with fixed size
    allWeights.select(".weight-box")
      .transition()
      .duration(400)
      .attr("x", -BLOCK_SIZE/2)
      .attr("y", -BLOCK_SIZE/2)
      .attr("width", BLOCK_SIZE)
      .attr("height", BLOCK_SIZE);
    
    allWeights.select(".weight-label")
      .transition()
      .duration(400)
      .attr("y", 5)
      .style("font-size", "14px")
      .text(d => d);
    
    // Update shadow with fixed size
    allWeights.select(".weight-shadow")
      .transition()
      .duration(400)
      .attr("cy", BLOCK_SIZE/2 + 10)
      .attr("rx", BLOCK_SIZE * 0.4)
      .attr("ry", BLOCK_SIZE * 0.15);
    
    // Exit
    weights.exit()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
    
    // Enhanced drag behavior with proper coordinate handling
    const drag = d3.drag()
      .on("start", function(event, d) {
        const sizeScale = d3.scaleLinear().domain([0, 100]).range([10, 40]);
        // Store initial position in beam coordinates
        const transform = d3.select(this).node().transform.baseVal.getItem(0).matrix;
        dragStateRef.current = {
          isDragging: true,
          draggedIndex: data.indexOf(d),
          startMouseX: event.sourceEvent.clientX,
          startTransformX: transform.e,
          startValue: d
        };
        
        const BLOCK_SIZE = 30;
        d3.select(this)
          .raise()
          .select(".weight-box")
          .style("cursor", "grabbing")
          .transition()
          .duration(100)
          .attr("width", BLOCK_SIZE * 1.2)
          .attr("height", BLOCK_SIZE * 1.2)
          .attr("x", -BLOCK_SIZE * 0.6)
          .attr("y", -BLOCK_SIZE * 0.6)
          .attr("fill", colors.secondary);
        
        // Show tooltip
        tooltip
          .attr("transform", `translate(${xScale(d)}, 0)`)
          .style("opacity", 1);
        tooltip.select(".tooltip-text").text(d);
      })
      .on("drag", function(event) {
        const BLOCK_SIZE = 30;
        // Calculate movement in screen coordinates
        const deltaMouseX = event.sourceEvent.clientX - dragStateRef.current.startMouseX;
        
        // Convert screen movement to beam coordinates (accounting for rotation)
        const tiltRad = tilt * Math.PI / 180;
        const deltaBeamX = deltaMouseX * Math.cos(tiltRad);
        
        // Calculate new position
        const newX = dragStateRef.current.startTransformX + deltaBeamX;
        const newValue = Math.round(xScale.invert(newX));
        
        // Constrain and update
        if (newValue >= 0 && newValue <= 100) {
          d3.select(this)
            .attr("transform", `translate(${xScale(newValue)}, ${-10 - BLOCK_SIZE/2})`);
          
          d3.select(this).select(".weight-label")
            .text(newValue);
          
          // Update tooltip
          tooltip.attr("transform", `translate(${xScale(newValue)}, 0)`);
          tooltip.select(".tooltip-text").text(newValue);
        }
      })
      .on("end", function(event) {
        const BLOCK_SIZE = 30;
        // Calculate final position
        const deltaMouseX = event.sourceEvent.clientX - dragStateRef.current.startMouseX;
        const tiltRad = tilt * Math.PI / 180;
        const deltaBeamX = deltaMouseX * Math.cos(tiltRad);
        const newX = dragStateRef.current.startTransformX + deltaBeamX;
        const newValue = Math.round(xScale.invert(newX));
        
        // Update data if value changed and is valid
        if (newValue >= 0 && newValue <= 100 && newValue !== dragStateRef.current.startValue) {
          const newData = [...data];
          newData[dragStateRef.current.draggedIndex] = newValue;
          setLevelData({ ...levelData, mean: newData });
          setInteractions(prev => prev + 1);
        } else {
          // Snap back if invalid
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", `translate(${xScale(dragStateRef.current.startValue)}, ${-10 - BLOCK_SIZE/2})`);
        }
        
        // Restore original size
        d3.select(this).select(".weight-box")
          .style("cursor", "grab")
          .transition()
          .duration(100)
          .attr("width", BLOCK_SIZE)
          .attr("height", BLOCK_SIZE)
          .attr("x", -BLOCK_SIZE/2)
          .attr("y", -BLOCK_SIZE/2)
          .attr("fill", colors.primary);
        
        // Hide tooltip
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
        
        dragStateRef.current.isDragging = false;
      });
    
    // Apply drag to all weights
    allWeights.call(drag);
    
    // Add hover effects
    allWeights
      .on("mouseenter", function(event, d) {
        if (!dragStateRef.current.isDragging) {
          d3.select(this).select(".weight-box")
            .transition()
            .duration(150)
            .attr("fill", d3.interpolateRgb(colors.primary, "#ffffff")(0.3));
          
          d3.select(this).select(".weight-shadow")
            .transition()
            .duration(150)
            .attr("rx", 16)
            .attr("ry", 6)
            .attr("opacity", 0.3);
        }
      })
      .on("mouseleave", function(event, d) {
        if (!dragStateRef.current.isDragging) {
          d3.select(this).select(".weight-box")
            .transition()
            .duration(150)
            .attr("fill", colors.primary);
          
          d3.select(this).select(".weight-shadow")
            .transition()
            .duration(150)
            .attr("rx", 12)
            .attr("ry", 4)
            .attr("opacity", 0.2);
        }
      });
    
    // Update mean indicator with animation
    const meanX = xScale(stats.mean);
    
    meanIndicator
      .transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .attr("transform", `rotate(${tilt})`);
    
    meanIndicator.select(".mean-line")
      .transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .attr("x1", meanX)
      .attr("x2", meanX);
    
    meanIndicator.select(".mean-label")
      .transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .attr("x", meanX)
      .text(`Mean: ${stats.mean.toFixed(1)}`);
    
    // Update torque display with clearer labels
    beamGroup.select(".left-torque")
      .transition()
      .duration(400)
      .text(stats.leftTorque > 0 ? `Left: ${Math.round(stats.leftTorque)}` : '');
    
    beamGroup.select(".right-torque")
      .transition()
      .duration(400)
      .text(stats.rightTorque > 0 ? `Right: ${Math.round(stats.rightTorque)}` : '');
    
    // Don't rotate the weights group - they stay upright
    // The beam tilts but weights remain vertical for clarity
      
  }, [data, stats, level.id, levelData]);
  
  // Median visualization - Sorted values
  useEffect(() => {
    if (!medianVizRef.current || level.id !== 'median') return;
    
    const svg = d3.select(medianVizRef.current);
    const { width } = medianVizRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 60, right: 40, bottom: 60, left: 40 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Sort data for display
    const sorted = [...data].sort((a, b) => a - b);
    
    // Position scale
    const xScale = d3.scaleBand()
      .domain(sorted.map((d, i) => i))
      .range([0, innerWidth])
      .padding(0.1);
    
    // Value cards
    g.selectAll(".value-card")
      .data(sorted)
      .enter()
      .append("g")
      .attr("class", "value-card")
      .attr("transform", (d, i) => `translate(${xScale(i) + xScale.bandwidth() / 2}, ${innerHeight / 2})`)
      .each(function(d, i) {
        const g = d3.select(this);
        const isMedian = (sorted.length % 2 === 1 && i === Math.floor(sorted.length / 2)) ||
                        (sorted.length % 2 === 0 && (i === sorted.length / 2 - 1 || i === sorted.length / 2));
        
        // Card background
        g.append("rect")
          .attr("x", -25)
          .attr("y", -30)
          .attr("width", 50)
          .attr("height", 60)
          .attr("fill", isMedian ? colors.secondary : colors.primary)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("rx", 8)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 100)
          .style("opacity", 1);
        
        // Value
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 5)
          .attr("fill", "#fff")
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .style("font-family", "monospace")
          .text(d)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 100)
          .style("opacity", 1);
        
        // Position label
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -50)
          .attr("fill", colors.chart.text)
          .style("font-size", "12px")
          .style("font-family", "monospace")
          .text(i + 1)
          .style("opacity", 0.6);
      });
    
    // Median label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight - 40)
      .attr("text-anchor", "middle")
      .attr("fill", colors.secondary)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text(`Median: ${stats.median}`);
    
    // Cleanup
    return () => {
      g.selectAll("*").on(".drag", null);
    };
  }, [data, stats, level.id]);
  
  // Mode visualization - Voting bars
  useEffect(() => {
    if (!modeVizRef.current || level.id !== 'mode') return;
    
    const svg = d3.select(modeVizRef.current);
    const { width } = modeVizRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Prepare frequency data
    const frequencyData = [];
    for (let value = 0; value <= 100; value += 10) {
      frequencyData.push({
        value,
        count: stats.frequency[value] || 0
      });
    }
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(frequencyData.map(d => d.value))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(5, d3.max(frequencyData, d => d.count))])
      .range([innerHeight, 0]);
    
    // Bars
    g.selectAll(".bar")
      .data(frequencyData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.value))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.count))
      .attr("fill", d => stats.modes.includes(d.value) ? colors.tertiary : colors.primary)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        const newData = [...data, d.value];
        setLevelData({ ...levelData, mode: newData });
        setInteractions(prev => prev + 1);
        
        // Animation effect
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", colors.accent)
          .transition()
          .duration(200)
          .attr("fill", stats.modes.includes(d.value) ? colors.tertiary : colors.primary);
      });
    
    // Value labels
    g.selectAll(".value-label")
      .data(frequencyData)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.value) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text(d => d.count > 0 ? d.count : '');
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace")
      .attr("fill", colors.chart.text);
    
    // Mode indicators
    if (stats.modes.length > 0) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.tertiary)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .text(`Mode(s): ${stats.modes.join(', ')}`);
    }
    
    // Cleanup
    return () => {
      g.selectAll(".bar").on("click", null);
    };
  }, [data, stats, level.id, levelData]);
  
  const addDataPoint = (value) => {
    const newData = [...data, value];
    setLevelData({ ...levelData, [level.id]: newData });
    setInteractions(prev => prev + 1);
  };
  
  const clearData = () => {
    setLevelData({ ...levelData, [level.id]: [] });
    setChallengeCompleted(false);
  };
  
  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setChallengeCompleted(false);
    }
  };
  
  return (
    <VisualizationContainer title="4.1 Central Tendency Journey">
      <div className="flex flex-col gap-6">
        {/* Level Header */}
        <VisualizationSection className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-600/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">{level.title}</h3>
              <div className="flex gap-2">
                {LEVELS.map((l, i) => (
                  <div
                    key={l.id}
                    className={`w-3 h-3 rounded-full ${
                      i <= currentLevel ? 'bg-indigo-500' : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-neutral-300 mb-1">{level.subtitle}</p>
            <p className="text-sm text-neutral-400">{level.description}</p>
          </div>
        </VisualizationSection>
        
        {/* Challenge Box */}
        <AnimatePresence mode="wait">
          {!challengeCompleted && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VisualizationSection className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-600/30">
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">
                    🎯 Challenge
                  </h4>
                  <p className="text-neutral-300">{level.challenge}</p>
                </div>
              </VisualizationSection>
            </motion.div>
          )}
          
          {challengeCompleted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <VisualizationSection className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-600/30">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-green-400 mb-1">
                        🎉 Challenge Complete!
                      </h4>
                      <p className="text-neutral-300">
                        You've mastered the {level.id}! Ready for the next level?
                      </p>
                    </div>
                    {currentLevel < LEVELS.length - 1 && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={nextLevel}
                        className="animate-pulse"
                      >
                        {level.unlockNext}
                      </Button>
                    )}
                  </div>
                </div>
              </VisualizationSection>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Visualization */}
        <GraphContainer height="300px">
          {level.id === 'mean' && <svg ref={meanVizRef} style={{ width: "100%", height: "100%" }} />}
          {level.id === 'median' && <svg ref={medianVizRef} style={{ width: "100%", height: "100%" }} />}
          {level.id === 'mode' && <svg ref={modeVizRef} style={{ width: "100%", height: "100%" }} />}
        </GraphContainer>
        
        {/* Level-specific Controls */}
        {level.id === 'mean' && (
          <VisualizationSection>
            <ControlGroup>
              <label className="text-sm text-neutral-400">Add a weight:</label>
              <div className="flex gap-2">
                {[10, 30, 50, 70, 90].map(value => (
                  <Button
                    key={value}
                    variant="secondary"
                    size="sm"
                    onClick={() => addDataPoint(value)}
                    disabled={data.length >= 5}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Drag blocks left/right. All weigh the same - only position matters for balance!
              </p>
            </ControlGroup>
          </VisualizationSection>
        )}
        
        {level.id === 'median' && (
          <VisualizationSection>
            <ControlGroup>
              <label className="text-sm text-neutral-400">Add values to your dataset:</label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 25, 40, 50, 60, 75, 85, 90, 95, 100].map(value => (
                  <Button
                    key={value}
                    variant={value > 80 ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => addDataPoint(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </ControlGroup>
          </VisualizationSection>
        )}
        
        {level.id === 'mode' && (
          <VisualizationSection>
            <div className="p-4 text-center">
              <p className="text-neutral-300 mb-2">
                Click on the bars to vote for values! Create two peaks for a bimodal distribution.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearData}
              >
                Clear Votes
              </Button>
            </div>
          </VisualizationSection>
        )}
        
        {/* Statistics Display */}
        <div className="grid grid-cols-3 gap-4">
          <VisualizationSection className={`p-4 text-center ${level.id === 'mean' ? 'ring-2 ring-yellow-500' : ''}`}>
            <span className="text-sm text-neutral-400">
              {level.id === 'mean' ? 'Balance Status' : 'Mean'}
            </span>
            <div className="font-mono text-2xl" style={{ 
              color: level.id === 'mean' && Math.abs(stats.totalTorque) < 5 ? '#4ade80' : colors.accent 
            }}>
              {level.id === 'mean' ? 
                (Math.abs(stats.totalTorque) < 5 ? 'Balanced! ✓' : 
                 stats.totalTorque > 0 ? 'Right Heavy →' : '← Left Heavy') :
                (data.length > 0 ? stats.mean.toFixed(1) : '—')
              }
            </div>
          </VisualizationSection>
          
          <VisualizationSection className={`p-4 text-center ${level.id === 'median' ? 'ring-2 ring-teal-500' : ''}`}>
            <span className="text-sm text-neutral-400">Median</span>
            <div className="font-mono text-2xl" style={{ color: colors.secondary }}>
              {data.length > 0 ? stats.median : '—'}
            </div>
          </VisualizationSection>
          
          <VisualizationSection className={`p-4 text-center ${level.id === 'mode' ? 'ring-2 ring-purple-500' : ''}`}>
            <span className="text-sm text-neutral-400">Mode</span>
            <div className="font-mono text-2xl" style={{ color: colors.tertiary }}>
              {stats.modes.length > 0 ? stats.modes.join(', ') : '—'}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <VisualizationSection>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-neutral-400 mb-3">Earned Badges:</h4>
              <div className="flex gap-4">
                {earnedBadges.map(badgeId => {
                  const badge = BADGES[badgeId];
                  return (
                    <motion.div
                      key={badgeId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{ backgroundColor: badge.color + '20', border: `2px solid ${badge.color}` }}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: badge.color }}>
                        {badge.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </VisualizationSection>
        )}
        
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Interactions: {interactions}</span>
          <ProgressBar 
            current={earnedBadges.length} 
            total={3} 
            label="Badges Earned" 
            variant="purple"
            className="w-48"
          />
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default CentralTendencyJourney;