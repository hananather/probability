"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const colorScheme = createColorScheme('probability');

// Calculate binomial coefficient
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

function PascalsTriangle({ rows = 10 }) {
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [discoveredPatterns, setDiscoveredPatterns] = useState(new Set());
  const [highlightPattern, setHighlightPattern] = useState(null);
  const svgRef = useRef(null);
  
  // Pattern types
  const patterns = {
    horizontal: { name: "Row Sum = 2^n", color: colorScheme.chart.primary },
    diagonal: { name: "Diagonal Patterns", color: colorScheme.chart.secondary },
    hockey: { name: "Hockey Stick", color: colorScheme.chart.tertiary },
    sierpinski: { name: "Sierpinski's Triangle", color: '#f59e0b' }
  };
  
  // Generate triangle data
  const triangleData = [];
  for (let n = 0; n < rows; n++) {
    const row = [];
    for (let r = 0; r <= n; r++) {
      row.push({
        n,
        r,
        value: nCr(n, r),
        x: r - n/2, // Center the triangle
        y: n
      });
    }
    triangleData.push(row);
  }
  
  // Draw the triangle
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 350; // Fixed height as per requirement
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    // Calculate cell size to maximize space usage
    const cellSize = Math.min(40, (width - 40) / (rows + 1), (height - 40) / rows);
    const fontSize = Math.min(14, cellSize * 0.4);
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, 20)`);
    
    // Draw connections first (edges)
    triangleData.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;
      
      row.forEach((cell, cellIndex) => {
        // Connect to parent cells
        if (cellIndex > 0) {
          g.append("line")
            .attr("x1", triangleData[rowIndex - 1][cellIndex - 1].x * cellSize)
            .attr("y1", triangleData[rowIndex - 1][cellIndex - 1].y * cellSize)
            .attr("x2", cell.x * cellSize)
            .attr("y2", cell.y * cellSize)
            .attr("stroke", colors.chart.grid)
            .attr("stroke-width", 1)
            .attr("opacity", 0.3);
        }
        
        if (cellIndex < row.length - 1) {
          g.append("line")
            .attr("x1", triangleData[rowIndex - 1][cellIndex].x * cellSize)
            .attr("y1", triangleData[rowIndex - 1][cellIndex].y * cellSize)
            .attr("x2", cell.x * cellSize)
            .attr("y2", cell.y * cellSize)
            .attr("stroke", colors.chart.grid)
            .attr("stroke-width", 1)
            .attr("opacity", 0.3);
        }
      });
    });
    
    // Draw cells
    triangleData.forEach((row, rowIndex) => {
      row.forEach((cell) => {
        const group = g.append("g")
          .attr("transform", `translate(${cell.x * cellSize}, ${cell.y * cellSize})`);
        
        // Determine cell color based on patterns
        let fillColor = "#1a1a1a";
        let strokeColor = colors.chart.grid;
        let strokeWidth = 1;
        
        // Challenge mode: highlight specific patterns
        if (showChallenge) {
          if (highlightPattern === 'horizontal' && selectedCell?.n === cell.n) {
            fillColor = patterns.horizontal.color + "20";
            strokeColor = patterns.horizontal.color;
            strokeWidth = 2;
          } else if (highlightPattern === 'diagonal' && cell.r === 1) {
            fillColor = patterns.diagonal.color + "20";
            strokeColor = patterns.diagonal.color;
            strokeWidth = 2;
          } else if (highlightPattern === 'sierpinski' && cell.value % 2 === 1) {
            fillColor = patterns.sierpinski.color + "40";
            strokeColor = patterns.sierpinski.color;
            strokeWidth = 1.5;
          }
        }
        
        // Cell background
        const rect = group.append("rect")
          .attr("x", -cellSize/2 + 2)
          .attr("y", -cellSize/2 + 2)
          .attr("width", cellSize - 4)
          .attr("height", cellSize - 4)
          .attr("rx", 4)
          .attr("fill", fillColor)
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .style("cursor", "pointer")
          .style("transition", "all 200ms ease");
        
        // Cell value
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", colors.chart.text)
          .style("font-size", `${fontSize}px`)
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("pointer-events", "none")
          .text(cell.value);
        
        // Hover effect
        group.on("mouseenter", function() {
          if (!selectedCell || selectedCell.n !== cell.n || selectedCell.r !== cell.r) {
            rect.attr("fill", "#2a2a2a")
                .attr("stroke", colorScheme.chart.primary);
          }
        })
        .on("mouseleave", function() {
          if (!selectedCell || selectedCell.n !== cell.n || selectedCell.r !== cell.r) {
            rect.attr("fill", fillColor)
                .attr("stroke", strokeColor);
          }
        })
        .on("click", () => {
          setSelectedCell(cell);
          // Discover row sum pattern
          if (!discoveredPatterns.has('horizontal')) {
            setDiscoveredPatterns(prev => new Set([...prev, 'horizontal']));
          }
        });
      });
    });
    
  }, [triangleData, selectedCell, showChallenge, highlightPattern]);
  
  return (
    <div className="w-full" style={{ height: '450px' }}>
      {/* Controls Bar - 40px */}
      <div className="h-10 flex items-center justify-between px-4 bg-neutral-800/50 rounded-t-lg border-b border-neutral-700">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white">Pascal's Triangle</h3>
          <div className="text-xs font-mono text-neutral-400">
            Rows: {rows}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
            size="xs"
            onClick={() => setShowChallenge(!showChallenge)}
            className="flex items-center gap-1"
          >
            {showChallenge ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showChallenge ? 'Hide' : 'Show'} Patterns
          </Button>
          
          {showChallenge && (
            <div className="flex gap-1">
              {Object.entries(patterns).map(([key, pattern]) => (
                <button
                  key={key}
                  onClick={() => setHighlightPattern(highlightPattern === key ? null : key)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-all",
                    highlightPattern === key
                      ? "bg-neutral-700 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  )}
                  style={{
                    borderColor: highlightPattern === key ? pattern.color : 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Triangle Visualization - 350px */}
      <div className="h-[350px] bg-neutral-900/30 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Formula overlay when cell is selected */}
        {selectedCell && (
          <div className="absolute top-2 left-2 bg-neutral-800/95 backdrop-blur-sm rounded-lg p-3 border border-neutral-700 max-w-xs">
            <div className="text-sm font-semibold text-white mb-1">
              Binomial Coefficient
            </div>
            <div className="text-lg font-mono text-yellow-400">
              C({selectedCell.n},{selectedCell.r}) = {selectedCell.value}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              = {selectedCell.n}! / ({selectedCell.r}! × {selectedCell.n - selectedCell.r}!)
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="absolute top-1 right-1 text-neutral-500 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>
      
      {/* Pattern Display - 60px */}
      <div className="h-[60px] bg-neutral-800/30 rounded-b-lg border-t border-neutral-700 px-4 flex items-center">
        <div className="flex items-center gap-6 w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Discovered Patterns:</span>
          </div>
          
          <div className="flex gap-4 flex-1">
            {discoveredPatterns.size === 0 ? (
              <span className="text-sm text-neutral-500">Click on numbers to discover patterns!</span>
            ) : (
              Array.from(discoveredPatterns).map(pattern => (
                <div key={pattern} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: patterns[pattern]?.color || '#666' }}
                  />
                  <span className="text-sm text-neutral-300">
                    {patterns[pattern]?.name || pattern}
                  </span>
                </div>
              ))
            )}
          </div>
          
          {selectedCell && (
            <div className="text-sm font-mono text-neutral-400">
              Row {selectedCell.n} sum = 2^{selectedCell.n} = {Math.pow(2, selectedCell.n)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PascalsTriangle;