"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';

const colorScheme = createColorScheme('probability');

// Calculate nCr with overflow protection
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
    if (!isFinite(result)) return "∞";
  }
  return Math.round(result);
}

export function PascalsTriangleExplorer() {
  const [rows, setRows] = useState(8);
  const [highlightN, setHighlightN] = useState(5);
  const [highlightR, setHighlightR] = useState(2);
  const [showPattern, setShowPattern] = useState('none'); // 'none', 'diagonals', 'hockey-stick', 'powers'
  const [hoveredCell, setHoveredCell] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, 30)`);
    
    // Generate Pascal's triangle values
    const triangle = [];
    for (let n = 0; n < rows; n++) {
      triangle[n] = [];
      for (let r = 0; r <= n; r++) {
        triangle[n][r] = nCr(n, r);
      }
    }
    
    // Draw triangle with maximized space usage
    const cellSize = Math.min(50, (width - 40) / (rows + 1));
    const verticalSpacing = Math.min(45, (height - 100) / rows);
    
    // Pattern highlighting
    function getCellColor(n, r, value) {
      // Highlighted cell
      if (n === highlightN && r === highlightR) {
        return colorScheme.chart.secondary;
      }
      
      // Hovered cell
      if (hoveredCell && hoveredCell.n === n && hoveredCell.r === r) {
        return colorScheme.chart.tertiary;
      }
      
      // Pattern highlighting
      if (showPattern === 'diagonals') {
        // Highlight diagonal containing selected cell
        if (n - r === highlightN - highlightR) {
          return colorScheme.chart.primary;
        }
      } else if (showPattern === 'hockey-stick') {
        // Hockey stick pattern
        if ((r === highlightR && n >= highlightN) || (n === highlightN && r <= highlightR)) {
          return colorScheme.chart.primary;
        }
      } else if (showPattern === 'powers') {
        // Powers of 2 in each row
        if (n === highlightN) {
          return colorScheme.chart.primary;
        }
      }
      
      return null;
    }
    
    // Draw cells
    triangle.forEach((row, n) => {
      row.forEach((value, r) => {
        const x = (r - n/2) * cellSize;
        const y = n * verticalSpacing;
        const cellColor = getCellColor(n, r, value);
        
        const cellGroup = g.append("g")
          .attr("transform", `translate(${x}, ${y})`)
          .style("cursor", "pointer");
        
        // Cell background
        const rect = cellGroup.append("rect")
          .attr("x", -cellSize/2 + 2)
          .attr("y", -20)
          .attr("width", cellSize - 4)
          .attr("height", 36)
          .attr("fill", cellColor || "#1a1a1a")
          .attr("stroke", cellColor || colors.chart.grid)
          .attr("stroke-width", cellColor ? 2 : 1)
          .attr("rx", 4)
          .style("transition", "all 200ms ease-in-out");
        
        // Value
        const text = cellGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", cellColor ? (cellColor === colorScheme.chart.secondary ? "#0a0a0a" : "white") : colors.chart.text)
          .style("font-size", value.toString().length > 4 ? "10px" : value.toString().length > 3 ? "11px" : "14px")
          .style("font-weight", cellColor ? "600" : "400")
          .style("font-family", "monospace")
          .text(value);
        
        // Hover effects
        cellGroup
          .on("mouseenter", function() {
            setHoveredCell({ n, r, value });
            if (!cellColor) {
              rect.attr("fill", "#2a2a2a")
                  .attr("stroke", colorScheme.chart.tertiary);
              text.attr("fill", "white");
            }
          })
          .on("mouseleave", function() {
            setHoveredCell(null);
            if (!cellColor) {
              rect.attr("fill", "#1a1a1a")
                  .attr("stroke", colors.chart.grid);
              text.attr("fill", colors.chart.text);
            }
          })
          .on("click", function() {
            setHighlightN(n);
            setHighlightR(r);
          });
      });
    });
    
    // Row labels
    for (let n = 0; n < Math.min(rows, 8); n++) {
      g.append("text")
        .attr("x", -(n/2 + 0.7) * cellSize)
        .attr("y", n * verticalSpacing)
        .attr("text-anchor", "end")
        .attr("dy", "0.35em")
        .attr("fill", colors.chart.text)
        .style("font-size", "11px")
        .style("opacity", 0.7)
        .text(`n=${n}`);
    }
    
    // Pattern explanations
    if (showPattern !== 'none') {
      const patternGroup = g.append("g")
        .attr("transform", `translate(0, ${(rows - 0.5) * verticalSpacing + 40})`);
      
      let explanation = "";
      if (showPattern === 'diagonals') {
        explanation = "Each diagonal sums to a Fibonacci number";
      } else if (showPattern === 'hockey-stick') {
        const sum = Array.from({length: highlightN - highlightR + 1}, (_, i) => nCr(highlightR + i, highlightR))
          .reduce((a, b) => a + b, 0);
        explanation = `Hockey stick sum = ${sum} = C(${highlightN + 1},${highlightR + 1})`;
      } else if (showPattern === 'powers') {
        const sum = Math.pow(2, highlightN);
        explanation = `Row ${highlightN} sum = ${sum} = 2^${highlightN}`;
      }
      
      patternGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "16px")
        .style("font-weight", "600")
        .text(explanation);
    }
    
    // Cleanup function
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").interrupt();
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [rows, highlightN, highlightR, showPattern, hoveredCell]);

  return (
    <VisualizationContainer 
      title="Pascal's Triangle Explorer"
      className="p-2"
    >
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <VisualizationSection className="p-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-neutral-300">Rows:</label>
              <input
                type="range"
                min="5"
                max="12"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-mono text-yellow-400 w-8">{rows}</span>
            </div>
          </VisualizationSection>
          
          <VisualizationSection className="p-3">
            <div className="flex gap-2">
              <Button
                variant={showPattern === 'none' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setShowPattern('none')}
              >
                None
              </Button>
              <Button
                variant={showPattern === 'diagonals' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setShowPattern('diagonals')}
              >
                Diagonals
              </Button>
              <Button
                variant={showPattern === 'hockey-stick' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setShowPattern('hockey-stick')}
              >
                Hockey Stick
              </Button>
              <Button
                variant={showPattern === 'powers' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setShowPattern('powers')}
              >
                Powers of 2
              </Button>
            </div>
          </VisualizationSection>
        </div>
        
        {/* Info panel */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3">
            <VisualizationSection className="p-3">
              <h4 className="text-base font-bold text-white mb-3">Selected Value</h4>
              
              <div className="bg-neutral-800 rounded-lg p-3 border border-yellow-600/50">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-yellow-400 mb-2">
                    C({highlightN},{highlightR}) = {nCr(highlightN, highlightR)}
                  </div>
                  <div className="text-sm text-neutral-300">
                    Row {highlightN}, Position {highlightR}
                  </div>
                </div>
              </div>
              
              {hoveredCell && hoveredCell.n !== highlightN && (
                <div className="mt-3 p-3 bg-neutral-800 rounded-lg">
                  <div className="text-sm text-neutral-400">Hovering:</div>
                  <div className="text-lg font-mono text-purple-400">
                    C({hoveredCell.n},{hoveredCell.r}) = {hoveredCell.value}
                  </div>
                </div>
              )}
              
              <div className="mt-3 space-y-2 text-sm">
                <h5 className="font-semibold text-neutral-300">Key Properties:</h5>
                <ul className="space-y-1 text-neutral-400">
                  <li>• Each number is the sum of the two above it</li>
                  <li>• Symmetric: C(n,r) = C(n,n-r)</li>
                  <li>• Edge values are always 1</li>
                  <li>• Row n contains n+1 values</li>
                </ul>
              </div>
            </VisualizationSection>
          </div>
          
          <div className="lg:w-2/3">
            <GraphContainer height="500px">
              <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
            </GraphContainer>
          </div>
        </div>
        
        {/* Pattern descriptions */}
        {showPattern !== 'none' && (
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Pattern Description</h4>
            <div className="text-xs text-neutral-400">
              {showPattern === 'diagonals' && (
                <p>The diagonals in Pascal's Triangle have special properties. The first diagonal is all 1s, the second is counting numbers, the third is triangular numbers, and so on.</p>
              )}
              {showPattern === 'hockey-stick' && (
                <p>The Hockey Stick pattern: Start at any 1 on the edge, go down diagonally, and the sum equals the value one step further diagonally. This demonstrates the identity: ΣC(i,r) = C(n+1,r+1)</p>
              )}
              {showPattern === 'powers' && (
                <p>Each row sums to a power of 2. This makes sense because each element represents choosing a subset, and there are 2^n total subsets of n items.</p>
              )}
            </div>
          </VisualizationSection>
        )}
      </div>
    </VisualizationContainer>
  );
}