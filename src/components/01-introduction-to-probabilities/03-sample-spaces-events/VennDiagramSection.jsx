"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "@/utils/d3-utils";
import { Button } from '@/components/ui/button';
import { GraphContainer, ControlGroup } from '@/components/ui/VisualizationContainer';
import { parseSetExpression } from './setExpressionParser';
import MathErrorBoundary from '@/components/ui/error-handling/MathErrorBoundary';

// Simplified Venn diagram for the practice section
export default function VennDiagramSection() {
  const [selectedSet, setSelectedSet] = useState("");
  const [inputSet, setInputSet] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [highlightedRegions, setHighlightedRegions] = useState([]);
  const svgRef = useRef(null);
  
  // Set data for circles
  const setData = [
    {name: 'A', cx: 0.3, cy: 0.35, r: 0.28},
    {name: 'B', cx: 0.7, cy: 0.35, r: 0.28},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.28}
  ];

  // Common set operations for practice
  const operations = [
    { label: "A ∪ B", value: "A∪B", hint: "Union - elements in A OR B", regions: [1, 2, 4, 5, 6, 7] },
    { label: "A ∩ B", value: "A∩B", hint: "Intersection - elements in A AND B", regions: [5, 7] },
    { label: "A'", value: "A'", hint: "Complement - everything NOT in A", regions: [2, 3, 6, 8] },
    { label: "(A∪B)'", value: "(A∪B)'", hint: "De Morgan's first law", regions: [3, 8] },
    { label: "A'∩B'", value: "A'∩B'", hint: "Should equal (A∪B)'", regions: [3, 8] }
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 400;
    
    // Clear existing elements with proper selection
    svg.select("rect.venn-background").remove();
    svg.select("rect.universal-set").remove();
    svg.select("defs").remove();
    svg.select("g.venn-regions").remove();
    svg.select("g.venn-circles").remove();
    svg.select("g.venn-labels").remove();
    
    // Background
    svg.append("rect")
      .attr("class", "venn-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Universal set
    svg.append("rect")
      .attr("class", "universal-set")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("fill", "none")
      .attr("stroke", "#444")
      .attr("stroke-width", 2);
    
    // Create clip paths for regions
    const defs = svg.append("defs");
    
    setData.forEach(set => {
      defs.append("clipPath")
        .attr("id", `clip-${set.name}`)
        .append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height));
    });
    
    // Create highlighting regions
    const g = svg.append("g").attr("class", "venn-regions");
    
    // Create mask for intersections to properly subtract overlaps
    defs.append("mask")
      .attr("id", "mask-A-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-A-only")
      .append("circle")
      .attr("cx", setData[1].cx * width)
      .attr("cy", setData[1].cy * height)
      .attr("r", setData[1].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.select("#mask-A-only")
      .append("circle")
      .attr("cx", setData[2].cx * width)
      .attr("cy", setData[2].cy * height)
      .attr("r", setData[2].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.append("mask")
      .attr("id", "mask-B-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-B-only")
      .append("circle")
      .attr("cx", setData[0].cx * width)
      .attr("cy", setData[0].cy * height)
      .attr("r", setData[0].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.select("#mask-B-only")
      .append("circle")
      .attr("cx", setData[2].cx * width)
      .attr("cy", setData[2].cy * height)
      .attr("r", setData[2].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.append("mask")
      .attr("id", "mask-C-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-C-only")
      .append("circle")
      .attr("cx", setData[0].cx * width)
      .attr("cy", setData[0].cy * height)
      .attr("r", setData[0].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.select("#mask-C-only")
      .append("circle")
      .attr("cx", setData[1].cx * width)
      .attr("cy", setData[1].cy * height)
      .attr("r", setData[1].r * Math.min(width, height))
      .attr("fill", "black");
    
    // Region 1: Only A (A but not B or C)
    g.append("rect")
      .attr("class", "region region-1")
      .attr("clip-path", "url(#clip-A)")
      .attr("mask", "url(#mask-A-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "1");
    
    // Region 2: Only B (B but not A or C)
    g.append("rect")
      .attr("class", "region region-2")
      .attr("clip-path", "url(#clip-B)")
      .attr("mask", "url(#mask-B-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "2");
    
    // Region 3: Only C (C but not A or B)
    g.append("rect")
      .attr("class", "region region-3")
      .attr("clip-path", "url(#clip-C)")
      .attr("mask", "url(#mask-C-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "3");
    
    // Create masks for pairwise intersections excluding triple intersection
    defs.append("mask")
      .attr("id", "mask-AB-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-AB-only")
      .append("circle")
      .attr("cx", setData[2].cx * width)
      .attr("cy", setData[2].cy * height)
      .attr("r", setData[2].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.append("mask")
      .attr("id", "mask-AC-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-AC-only")
      .append("circle")
      .attr("cx", setData[1].cx * width)
      .attr("cy", setData[1].cy * height)
      .attr("r", setData[1].r * Math.min(width, height))
      .attr("fill", "black");
    
    defs.append("mask")
      .attr("id", "mask-BC-only")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    defs.select("#mask-BC-only")
      .append("circle")
      .attr("cx", setData[0].cx * width)
      .attr("cy", setData[0].cy * height)
      .attr("r", setData[0].r * Math.min(width, height))
      .attr("fill", "black");
    
    // Region 5: A∩B only (A and B but not C)
    const abGroup = g.append("g")
      .attr("clip-path", "url(#clip-A)");
    abGroup.append("rect")
      .attr("class", "region region-5")
      .attr("clip-path", "url(#clip-B)")
      .attr("mask", "url(#mask-AB-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "5");
    
    // Region 4: A∩C only (A and C but not B)
    const acGroup = g.append("g")
      .attr("clip-path", "url(#clip-A)");
    acGroup.append("rect")
      .attr("class", "region region-4")
      .attr("clip-path", "url(#clip-C)")
      .attr("mask", "url(#mask-AC-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "4");
    
    // Region 6: B∩C only (B and C but not A)
    const bcGroup = g.append("g")
      .attr("clip-path", "url(#clip-B)");
    bcGroup.append("rect")
      .attr("class", "region region-6")
      .attr("clip-path", "url(#clip-C)")
      .attr("mask", "url(#mask-BC-only)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "6");
    
    // Region 7: A∩B∩C (all three)
    const abcGroup = g.append("g")
      .attr("clip-path", "url(#clip-A)")
      .append("g")
      .attr("clip-path", "url(#clip-B)");
    abcGroup.append("rect")
      .attr("class", "region region-7")
      .attr("clip-path", "url(#clip-C)")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("data-region", "7");
    
    // Create mask for universe excluding all circles
    defs.append("mask")
      .attr("id", "mask-universe")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white");
    
    setData.forEach(set => {
      defs.select("#mask-universe")
        .append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height))
        .attr("fill", "black");
    });
    
    // Region 8: Outside all sets
    g.append("rect")
      .attr("class", "region region-8")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("mask", "url(#mask-universe)")
      .attr("fill", "transparent")
      .attr("data-region", "8")
      .lower();
    
    // Draw circles
    setData.forEach(set => {
      // Circle
      g.append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height))
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 2);
      
      // Label
      g.append("text")
        .attr("x", set.cx * width)
        .attr("y", set.cy * height)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(set.name);
    });
    
    // Highlight regions based on selected operation
    svg.selectAll('.region')
      .attr('fill', function() {
        const region = parseInt(this.getAttribute('data-region'));
        return highlightedRegions.includes(region) ? 'rgba(139, 92, 246, 0.4)' : 'transparent';
      });
    
    // Cleanup function for D3
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
      }
    };
  }, [selectedSet, highlightedRegions]);

  const handleOperation = (operation) => {
    setSelectedSet(operation.value);
    setInputSet(operation.value);
    setErrorMessage("");
    
    // Set highlighted regions based on the operation
    try {
      const regions = operation.regions || parseSetExpression(operation.value);
      setHighlightedRegions(regions);
    } catch (error) {
      // Only log parsing errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error parsing set expression:', error);
      }
      setHighlightedRegions([]);
    }
  };

  return (
    <MathErrorBoundary 
      fallbackMessage="The Venn diagram visualization encountered an error. This may be due to complex set expressions or D3 rendering issues. Please try refreshing or selecting a different operation."
      showRetry={true}
    >
      <div className="space-y-4">
        <GraphContainer height="400px" className="bg-black/50 rounded-lg overflow-hidden">
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400" />
        </GraphContainer>
        
        <ControlGroup>
          <div className="space-y-3">
            <label className="text-sm text-neutral-400">Try these operations:</label>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((op) => (
                <Button
                  key={op.value}
                  variant={selectedSet === op.value ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleOperation(op)}
                  className="justify-start"
                >
                  <span className="font-mono">{op.label}</span>
                </Button>
              ))}
            </div>
            
            {selectedSet && (
              <div className="mt-2 p-2 bg-purple-900/20 rounded text-sm text-purple-300">
                {operations.find(op => op.value === selectedSet)?.hint}
              </div>
            )}
          </div>
        </ControlGroup>
      </div>
    </MathErrorBoundary>
  );
}