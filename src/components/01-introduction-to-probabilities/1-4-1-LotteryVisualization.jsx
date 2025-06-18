"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { InfoIcon } from 'lucide-react';

const colorScheme = createColorScheme('probability');

function LotteryVisualization({ n = 49, r = 6 }) {
  const [selectedBalls, setSelectedBalls] = useState(new Set());
  const [showInsight, setShowInsight] = useState(false);
  const svgRef = useRef(null);
  
  // Calculate combination value
  const combination = (n, r) => {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
  };
  
  const totalCombinations = combination(n, r);
  const odds = 1 / totalCombinations;
  
  // Reset when n or r changes
  useEffect(() => {
    setSelectedBalls(new Set());
    setShowInsight(false);
  }, [n, r]);
  
  // Show insight when selection is complete
  useEffect(() => {
    if (selectedBalls.size === r) {
      setTimeout(() => setShowInsight(true), 500);
    }
  }, [selectedBalls, r]);
  
  const handleBallClick = (ballNumber) => {
    const newSelected = new Set(selectedBalls);
    
    if (newSelected.has(ballNumber)) {
      newSelected.delete(ballNumber);
      setShowInsight(false);
    } else if (newSelected.size < r) {
      newSelected.add(ballNumber);
    }
    
    setSelectedBalls(newSelected);
  };
  
  const resetSelection = () => {
    setSelectedBalls(new Set());
    setShowInsight(false);
  };
  
  // Draw lottery visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 280; // Fixed height for the ball area
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    // Calculate optimal ball layout
    const maxBalls = Math.min(n, 49); // Show max 49 balls
    const ballRadius = Math.min(25, width / (Math.sqrt(maxBalls) * 2.5));
    const padding = ballRadius * 0.4;
    
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(maxBalls * (width / height)));
    const rows = Math.ceil(maxBalls / cols);
    
    // Center the grid
    const gridWidth = cols * (ballRadius * 2 + padding) - padding;
    const gridHeight = rows * (ballRadius * 2 + padding) - padding;
    const offsetX = (width - gridWidth) / 2 + ballRadius;
    const offsetY = (height - gridHeight) / 2 + ballRadius;
    
    // Draw balls
    for (let i = 1; i <= maxBalls; i++) {
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      const x = offsetX + col * (ballRadius * 2 + padding);
      const y = offsetY + row * (ballRadius * 2 + padding);
      
      const isSelected = selectedBalls.has(i);
      const isDisabled = selectedBalls.size >= r && !isSelected;
      
      const g = svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", isDisabled ? "not-allowed" : "pointer")
        .on("click", () => !isDisabled && handleBallClick(i));
      
      // Ball shadow
      g.append("ellipse")
        .attr("cx", 0)
        .attr("cy", ballRadius * 0.95)
        .attr("rx", ballRadius * 0.9)
        .attr("ry", ballRadius * 0.2)
        .attr("fill", "rgba(0,0,0,0.3)")
        .attr("filter", "blur(3px)");
      
      // Ball circle with gradient
      const gradientId = `ball-gradient-${i}`;
      const gradient = svg.append("defs").append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      if (isSelected) {
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colorScheme.chart.tertiary);
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorScheme.chart.primary);
      } else {
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#4a5568");
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#1a202c");
      }
      
      g.append("circle")
        .attr("r", ballRadius)
        .attr("fill", `url(#${gradientId})`)
        .attr("stroke", isSelected ? colorScheme.chart.primary : "#2d3748")
        .attr("stroke-width", 2)
        .style("opacity", isDisabled ? 0.3 : 1)
        .style("transition", "all 200ms ease-in-out");
      
      // Ball number
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isSelected ? "white" : "#e2e8f0")
        .style("font-size", ballRadius > 20 ? "16px" : "14px")
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .style("pointer-events", "none")
        .text(i);
      
      // Hover effect
      if (!isDisabled) {
        g.on("mouseenter", function() {
          if (!isSelected) {
            d3.select(this).select("circle")
              .attr("stroke", colorScheme.chart.secondary)
              .attr("stroke-width", 3);
          }
        })
        .on("mouseleave", function() {
          if (!isSelected) {
            d3.select(this).select("circle")
              .attr("stroke", "#2d3748")
              .attr("stroke-width", 2);
          }
        });
      }
    }
    
    // Show ellipsis if there are more balls
    if (n > maxBalls) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colors.chart.text)
        .style("font-size", "14px")
        .style("font-style", "italic")
        .text(`Showing ${maxBalls} of ${n} balls`);
    }
    
  }, [n, r, selectedBalls]);
  
  return (
    <div className="h-full flex flex-col p-4">
      {/* Header Controls - Horizontal Layout */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Selected:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {selectedBalls.size}/{r}
            </span>
          </div>
          {selectedBalls.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Numbers:</span>
              <span className="font-mono text-sm text-green-400">
                {Array.from(selectedBalls).sort((a, b) => a - b).join(', ')}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="neutral"
          size="sm"
          onClick={resetSelection}
          disabled={selectedBalls.size === 0}
        >
          Reset
        </Button>
      </div>
      
      {/* SVG Container - Takes remaining space */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Inline order display */}
        {selectedBalls.size > 0 && (
          <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">
              Order doesn't matter in combinations
            </p>
          </div>
        )}
      </div>
      
      {/* Stats Row - Compact */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex-1 bg-gray-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Total combinations:</span>
          <span className="font-mono text-sm text-yellow-400 font-bold">
            {formatNumber(totalCombinations)}
          </span>
        </div>
        <div className="flex-1 bg-gray-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Probability:</span>
          <span className="font-mono text-sm text-red-400 font-bold">
            {(odds * 100).toExponential(2)}%
          </span>
        </div>
      </div>
      
      {/* Insight Overlay */}
      {showInsight && selectedBalls.size === r && (
        <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Key Insight</p>
              <p className="text-xs">
                Your combination {`{${Array.from(selectedBalls).sort((a,b) => a-b).join(',')}}`} has 
                exactly the same {(odds * 100).toExponential(2)}% chance as any other combination. 
                Even "lucky" numbers like {`{1,2,3,4,5,6}`} are equally likely!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LotteryVisualization;