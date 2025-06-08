"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { DraggableHandle } from '../ui/D3DragWrapper';

/**
 * Example of fixing ConditionalProbability dragging using the new pattern
 * This shows how to make event rectangles smoothly draggable
 */
export default function ConditionalProbabilityFixed() {
  const svgRef = useRef(null);
  const elementsRef = useRef({});
  const [events, setEvents] = useState([
    { id: 'A', x: 100, width: 200, color: '#60a5fa' },
    { id: 'B', x: 250, width: 200, color: '#34d399' },
    { id: 'C', x: 400, width: 200, color: '#f59e0b' }
  ]);

  const width = 800;
  const height = 400;
  const barHeight = 50;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };

  // Scale for x position
  const xScale = d3.scaleLinear()
    .domain([0, width - margin.left - margin.right])
    .range([margin.left, width - margin.right]);

  // Initialize SVG once
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    // Create groups for each event
    const eventGroups = svg.selectAll(".event-group")
      .data(events)
      .join("g")
      .attr("class", "event-group");

    // Store references
    elementsRef.current.groups = eventGroups;

    // Create event rectangles
    eventGroups.each(function(d, i) {
      const group = d3.select(this);
      
      // Background rect
      const rect = group.append("rect")
        .attr("x", d.x)
        .attr("y", height / 2 - barHeight / 2 + i * 20)
        .attr("width", d.width)
        .attr("height", barHeight)
        .attr("fill", d.color)
        .attr("opacity", 0.6)
        .attr("rx", 4);

      // Draggable handles for position
      const leftHandle = group.append("circle")
        .attr("cx", d.x)
        .attr("cy", height / 2 + i * 20)
        .attr("r", 8)
        .attr("fill", d.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("cursor", "ew-resize");

      // Draggable handle for width
      const rightHandle = group.append("circle")
        .attr("cx", d.x + d.width)
        .attr("cy", height / 2 + i * 20)
        .attr("r", 8)
        .attr("fill", d.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("cursor", "ew-resize");

      // Labels
      const label = group.append("text")
        .attr("x", d.x + d.width / 2)
        .attr("y", height / 2 + i * 20)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#fff")
        .attr("font-weight", "600")
        .text(d.id);

      // Apply drag behavior to left handle (move position)
      leftHandle.call(
        d3.drag()
          .on("drag", function(event) {
            const newX = Math.max(0, Math.min(width - d.width, event.x));
            
            // Update visuals immediately
            rect.attr("x", newX);
            leftHandle.attr("cx", newX);
            rightHandle.attr("cx", newX + d.width);
            label.attr("x", newX + d.width / 2);
            
            // Update data
            d.x = newX;
          })
          .on("end", function() {
            // Update React state when done
            setEvents(prev => prev.map(e => 
              e.id === d.id ? { ...e, x: d.x } : e
            ));
          })
      );

      // Apply drag behavior to right handle (resize)
      rightHandle.call(
        d3.drag()
          .on("drag", function(event) {
            const newWidth = Math.max(50, Math.min(width - d.x, event.x - d.x));
            
            // Update visuals immediately
            rect.attr("width", newWidth);
            rightHandle.attr("cx", d.x + newWidth);
            label.attr("x", d.x + newWidth / 2);
            
            // Update data
            d.width = newWidth;
          })
          .on("end", function() {
            // Update React state when done
            setEvents(prev => prev.map(e => 
              e.id === d.id ? { ...e, width: d.width } : e
            ));
          })
      );
    });

    // Add axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d}px`);
      
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr("color", "#666");

  }, []); // Only run once!

  // Calculate overlaps
  const calculateOverlaps = () => {
    const overlaps = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];
        const overlapStart = Math.max(a.x, b.x);
        const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
        const overlapWidth = Math.max(0, overlapEnd - overlapStart);
        
        if (overlapWidth > 0) {
          overlaps.push({
            events: [a.id, b.id],
            x: overlapStart,
            width: overlapWidth,
            probability: (overlapWidth / (width - margin.left - margin.right)).toFixed(3)
          });
        }
      }
    }
    return overlaps;
  };

  const overlaps = calculateOverlaps();

  return (
    <div className="bg-neutral-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        Smooth Event Dragging Example
      </h3>
      
      <svg ref={svgRef} width={width} height={height} />
      
      <div className="mt-4 space-y-2">
        <h4 className="text-lg font-semibold text-white">Event Probabilities:</h4>
        {events.map(event => (
          <div key={event.id} className="flex items-center gap-4 text-sm">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: event.color }}
            />
            <span className="text-white font-mono">
              P({event.id}) = {(event.width / (width - margin.left - margin.right)).toFixed(3)}
            </span>
          </div>
        ))}
        
        {overlaps.length > 0 && (
          <>
            <h4 className="text-lg font-semibold text-white mt-4">Overlaps:</h4>
            {overlaps.map((overlap, i) => (
              <div key={i} className="text-sm text-white font-mono">
                P({overlap.events.join(' ∩ ')}) = {overlap.probability}
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-neutral-800 rounded text-sm text-neutral-300">
        <p className="font-semibold mb-2">Try it out:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Drag the colored circles to move events</li>
          <li>Drag the right handle to resize events</li>
          <li>Notice the smooth, responsive dragging!</li>
        </ul>
      </div>
    </div>
  );
}