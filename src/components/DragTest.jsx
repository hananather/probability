"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function DragTest() {
  const [smallValue, setSmallValue] = useState(0.5);
  const [largeValue, setLargeValue] = useState(0.5);
  const smallSvgRef = useRef(null);
  const largeSvgRef = useRef(null);

  // Small canvas test
  useEffect(() => {
    const svg = d3.select(smallSvgRef.current);
    const width = 100;
    const height = 150;
    
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    
    // Add background for visibility
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1a1a1a");
    
    const margin = 20;
    const barWidth = 60;
    const x = (width - barWidth) / 2;
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin, margin]);
    
    // Draw bar
    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", y(smallValue))
      .attr("width", barWidth)
      .attr("height", y(0) - y(smallValue))
      .attr("fill", "#4f46e5")
      .style("cursor", "ns-resize");
    
    // Add drag behavior - simple and direct
    bar.call(
      d3.drag()
        .on("drag", (event) => {
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          setSmallValue(newVal);
        })
    );
    
    // Value label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text(`Small: ${(smallValue * 100).toFixed(0)}%`);
    
  }, [smallValue]);

  // Large canvas test
  useEffect(() => {
    const svg = d3.select(largeSvgRef.current);
    const width = 200;
    const height = 400;
    
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);
    
    // Add background for visibility
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1a1a1a");
    
    const margin = 40;
    const barWidth = 120;
    const x = (width - barWidth) / 2;
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin, margin]);
    
    // Draw bar
    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", y(largeValue))
      .attr("width", barWidth)
      .attr("height", y(0) - y(largeValue))
      .attr("fill", "#14b8a6")
      .style("cursor", "ns-resize");
    
    // Add drag behavior - same as small
    bar.call(
      d3.drag()
        .on("drag", (event) => {
          const newVal = Math.max(0, Math.min(1, y.invert(event.y)));
          setLargeValue(newVal);
        })
    );
    
    // Value label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text(`Large: ${(largeValue * 100).toFixed(0)}%`);
    
  }, [largeValue]);

  return (
    <div style={{ 
      display: 'flex', 
      gap: '2rem', 
      padding: '2rem',
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div>
        <h3>Small Canvas (100x150)</h3>
        <svg ref={smallSvgRef} />
        <p>Value: {(smallValue * 100).toFixed(1)}%</p>
      </div>
      
      <div>
        <h3>Large Canvas (200x400)</h3>
        <svg ref={largeSvgRef} />
        <p>Value: {(largeValue * 100).toFixed(1)}%</p>
      </div>
      
      <div style={{ maxWidth: '400px' }}>
        <h3>Observations:</h3>
        <ul>
          <li>Both use identical drag code</li>
          <li>Only difference is canvas size</li>
          <li>Test: Is dragging smoother on the larger canvas?</li>
          <li>Formula: y.invert(event.y) directly converts mouse position to value</li>
        </ul>
      </div>
    </div>
  );
}