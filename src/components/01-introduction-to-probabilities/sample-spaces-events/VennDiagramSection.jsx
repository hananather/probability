"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "@/utils/d3-utils";
import { Button } from '@/components/ui/button';
import { GraphContainer, ControlGroup } from '@/components/ui/VisualizationContainer';

// Simplified Venn diagram for the practice section
export default function VennDiagramSection() {
  const [selectedSet, setSelectedSet] = useState("");
  const [inputSet, setInputSet] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const svgRef = useRef(null);
  
  // Set data for circles
  const setData = [
    {name: 'A', cx: 0.3, cy: 0.35, r: 0.28},
    {name: 'B', cx: 0.7, cy: 0.35, r: 0.28},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.28}
  ];

  // Common set operations for practice
  const operations = [
    { label: "A ∪ B", value: "A∪B", hint: "Union - elements in A OR B" },
    { label: "A ∩ B", value: "A∩B", hint: "Intersection - elements in A AND B" },
    { label: "A'", value: "A'", hint: "Complement - everything NOT in A" },
    { label: "(A∪B)'", value: "(A∪B)'", hint: "De Morgan's first law" },
    { label: "A'∩B'", value: "A'∩B'", hint: "Should equal (A∪B)'" }
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 400;
    
    svg.selectAll("*").remove();
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Universal set
    svg.append("rect")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", width - 40)
      .attr("height", height - 40)
      .attr("fill", "none")
      .attr("stroke", "#444")
      .attr("stroke-width", 2);
    
    // Draw circles
    const g = svg.append("g");
    
    setData.forEach(set => {
      // Circle
      g.append("circle")
        .attr("cx", set.cx * width)
        .attr("cy", set.cy * height)
        .attr("r", set.r * Math.min(width, height))
        .attr("fill", selectedSet.includes(set.name) ? "rgba(139, 92, 246, 0.3)" : "none")
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
    
    // Highlight based on selected operation
    if (selectedSet) {
      // Simple highlighting logic for demonstration
      // In the full implementation, this would use the complex highlighting from the original
    }
    
  }, [selectedSet]);

  const handleOperation = (operation) => {
    setSelectedSet(operation);
    setInputSet(operation);
    setErrorMessage("");
  };

  return (
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
                onClick={() => handleOperation(op.value)}
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
  );
}