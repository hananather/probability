"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';

const colorScheme = createColorScheme('probability');

export function OrderedVsUnordered() {
  const [mode, setMode] = useState('ordered'); // 'ordered' or 'unordered'
  const [animating, setAnimating] = useState(false);
  const svgRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 500; // Increased height for better spacing
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Sample data: selecting 3 items from {A, B, C, D, E}
    const items = ['A', 'B', 'C', 'D', 'E'];
    const selectedIndices = [0, 1, 2]; // Selecting A, B, C
    
    if (mode === 'ordered') {
      // Show permutations
      const permutations = [
        ['A', 'B', 'C'],
        ['A', 'C', 'B'],
        ['B', 'A', 'C'],
        ['B', 'C', 'A'],
        ['C', 'A', 'B'],
        ['C', 'B', 'A']
      ];
      
      const boxWidth = 36;
      const boxHeight = 36;
      const boxSpacing = 45;
      const groupSpacingX = 200; // Increased horizontal spacing
      const groupSpacingY = 100; // Increased vertical spacing
      
      // Title
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -height/2 + 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Ordered Samples (Permutations): Order Matters!");
      
      // Draw each permutation
      permutations.forEach((perm, permIndex) => {
        const row = Math.floor(permIndex / 2);
        const col = permIndex % 2;
        const groupX = (col - 0.5) * groupSpacingX;
        const groupY = (row - 1) * groupSpacingY;
        
        const permGroup = g.append("g")
          .attr("transform", `translate(${groupX}, ${groupY})`);
        
        // Draw boxes for this permutation
        perm.forEach((item, i) => {
          const x = (i - 1) * boxSpacing;
          
          // Box
          permGroup.append("rect")
            .attr("x", x - boxWidth/2)
            .attr("y", -boxHeight/2)
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("rx", 4)
            .attr("fill", colorScheme.chart.primary)
            .attr("fill-opacity", 0.2)
            .attr("stroke", colorScheme.chart.primary)
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .delay(permIndex * 100 + i * 50)
            .duration(300)
            .style("opacity", 1);
          
          // Letter
          permGroup.append("text")
            .attr("x", x)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "white")
            .style("font-size", "20px")
            .style("font-weight", "600")
            .style("font-family", "monospace")
            .style("opacity", 0)
            .text(item)
            .transition()
            .delay(permIndex * 100 + i * 50)
            .duration(300)
            .style("opacity", 1);
          
          // Position number - smaller and closer to box
          permGroup.append("text")
            .attr("x", x)
            .attr("y", boxHeight/2 + 12)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.text)
            .style("font-size", "9px")
            .style("font-weight", "500")
            .style("opacity", 0)
            .text(i + 1)
            .transition()
            .delay(permIndex * 100 + i * 50)
            .duration(300)
            .style("opacity", 0.5);
        });
        
        // Permutation number - positioned further left to avoid overlap
        permGroup.append("text")
          .attr("x", -boxSpacing * 2.2)
          .attr("text-anchor", "end")
          .attr("dy", "0.35em")
          .attr("fill", colorScheme.chart.secondary)
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("opacity", 0)
          .text(`#${permIndex + 1}`)
          .transition()
          .delay(permIndex * 100)
          .duration(300)
          .style("opacity", 1);
      });
      
      // Count
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height/2 - 50)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("opacity", 0)
        .text("Total: 6 different arrangements")
        .transition()
        .delay(800)
        .duration(500)
        .style("opacity", 1);
        
    } else {
      // Show combination
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -height/2 + 30)
        .attr("fill", colors.chart.text)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("Unordered Sample (Combination): Order Doesn't Matter!");
      
      // Show how permutations collapse
      if (animating) {
        // First show all permutations briefly
        const permutations = [
          ['A', 'B', 'C'],
          ['A', 'C', 'B'],
          ['B', 'A', 'C'],
          ['B', 'C', 'A'],
          ['C', 'A', 'B'],
          ['C', 'B', 'A']
        ];
        
        const startRadius = 120;
        const itemRadius = 20;
        
        permutations.forEach((perm, i) => {
          const angle = (2 * Math.PI * i) / permutations.length;
          const x = startRadius * Math.cos(angle);
          const y = startRadius * Math.sin(angle);
          
          const permGroup = g.append("g")
            .attr("transform", `translate(${x}, ${y})`);
          
          // Small representation of permutation
          perm.forEach((item, j) => {
            const itemX = (j - 1) * 25;
            
            permGroup.append("circle")
              .attr("cx", itemX)
              .attr("cy", 0)
              .attr("r", itemRadius * 0.6)
              .attr("fill", colorScheme.chart.primary)
              .attr("fill-opacity", 0.3)
              .style("opacity", 1)
              .transition()
              .delay(1000)
              .duration(1000)
              .attr("cx", 0)
              .attr("cy", 0)
              .style("opacity", 0);
            
            permGroup.append("text")
              .attr("x", itemX)
              .attr("text-anchor", "middle")
              .attr("dy", "0.35em")
              .attr("fill", "white")
              .style("font-size", "12px")
              .style("font-family", "monospace")
              .text(item)
              .transition()
              .delay(1000)
              .duration(1000)
              .attr("x", 0)
              .style("opacity", 0);
          });
        });
      }
      
      // Show single combination
      const combination = ['A', 'B', 'C'];
      const boxSize = 60;
      const spacing = 80;
      
      // Draw set notation
      const setGroup = g.append("g");
      
      // Opening brace
      setGroup.append("text")
        .attr("x", -spacing * 1.8)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "60px")
        .style("font-weight", "300")
        .style("opacity", 0)
        .text("{")
        .transition()
        .delay(animating ? 2000 : 0)
        .duration(500)
        .style("opacity", 1);
      
      // Items
      combination.forEach((item, i) => {
        // Circle for item
        setGroup.append("circle")
          .attr("cx", (i - 1) * spacing)
          .attr("cy", 0)
          .attr("r", boxSize/2)
          .attr("fill", colorScheme.chart.primary)
          .attr("fill-opacity", 0.2)
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .delay((animating ? 2000 : 0) + i * 100)
          .duration(500)
          .style("opacity", 1);
        
        // Letter
        setGroup.append("text")
          .attr("x", (i - 1) * spacing)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "white")
          .style("font-size", "28px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("opacity", 0)
          .text(item)
          .transition()
          .delay((animating ? 2000 : 0) + i * 100)
          .duration(500)
          .style("opacity", 1);
        
        // Comma (except last)
        if (i < combination.length - 1) {
          setGroup.append("text")
            .attr("x", (i - 0.5) * spacing)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", colors.chart.text)
            .style("font-size", "24px")
            .style("opacity", 0)
            .text(",")
            .transition()
            .delay((animating ? 2000 : 0) + i * 100)
            .duration(500)
            .style("opacity", 1);
        }
      });
      
      // Closing brace
      setGroup.append("text")
        .attr("x", spacing * 1.8)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "60px")
        .style("font-weight", "300")
        .style("opacity", 0)
        .text("}")
        .transition()
        .delay(animating ? 2300 : 300)
        .duration(500)
        .style("opacity", 1);
      
      // Explanation
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 100)
        .attr("fill", colors.chart.text)
        .style("font-size", "16px")
        .style("opacity", 0)
        .text("All 6 arrangements represent the same combination")
        .transition()
        .delay(animating ? 2500 : 500)
        .duration(500)
        .style("opacity", 1);
      
      // Count
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height/2 - 50)
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("opacity", 0)
        .text("Total: 1 combination")
        .transition()
        .delay(animating ? 2800 : 800)
        .duration(500)
        .style("opacity", 1);
    }
    
    // Cleanup function
    return () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Interrupt all D3 transitions
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").interrupt();
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [mode, animating]);

  const handleModeChange = (newMode) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (newMode === 'unordered' && mode === 'ordered') {
      setAnimating(true);
      setMode(newMode);
      timeoutRef.current = setTimeout(() => {
        setAnimating(false);
        timeoutRef.current = null;
      }, 3000);
    } else {
      setAnimating(false);
      setMode(newMode);
    }
  };

  return (
    <VisualizationContainer 
      title="Ordered vs Unordered Samples"
      className="p-2"
    >
      <div className="flex flex-col gap-4">
        {/* Mode selector */}
        <div className="flex justify-center gap-2">
          <Button
            variant={mode === 'ordered' ? 'primary' : 'neutral'}
            size="sm"
            onClick={() => handleModeChange('ordered')}
          >
            Show Permutations
          </Button>
          <Button
            variant={mode === 'unordered' ? 'primary' : 'neutral'}
            size="sm"
            onClick={() => handleModeChange('unordered')}
          >
            Show Combination
          </Button>
        </div>
        
        {/* Explanation */}
        <VisualizationSection className="p-3">
          <p className={cn(typography.description, "text-sm text-center")}>
            {mode === 'ordered' 
              ? "When order matters, ABC is different from BAC. Each arrangement is counted separately."
              : animating
              ? "Watch how all 6 permutations collapse into a single combination..."
              : "When order doesn't matter, {A,B,C} = {B,A,C} = {C,B,A}. They're all the same!"}
          </p>
        </VisualizationSection>
        
        {/* Visualization */}
        <GraphContainer height="500px">
          <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
        </GraphContainer>
        
        {/* Formula comparison */}
        <VisualizationSection className="p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className={cn(
              "p-3 rounded-lg border",
              mode === 'ordered' 
                ? "border-blue-600 bg-blue-900/20" 
                : "border-neutral-700 bg-neutral-800"
            )}>
              <h4 className="text-sm font-semibold text-white mb-2">Permutations</h4>
              <div className="text-lg font-mono text-blue-400">
                P(5,3) = 60
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                5 × 4 × 3 = 60
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-lg border",
              mode === 'unordered' 
                ? "border-purple-600 bg-purple-900/20" 
                : "border-neutral-700 bg-neutral-800"
            )}>
              <h4 className="text-sm font-semibold text-white mb-2">Combinations</h4>
              <div className="text-lg font-mono text-purple-400">
                C(5,3) = 10
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                60 ÷ 3! = 10
              </div>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}