"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';

const colorScheme = createColorScheme('probability');

// Test 2: Throttled React Updates with requestAnimationFrame
function SampleSpacesEventsTest2() {
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ]);
  
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const pendingUpdateRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const size = Math.min(width * 0.9, height);
    const padding = 15;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const container = svg.append('g')
      .attr("transform", `translate(${(width - size) / 2}, ${(height - size) / 2})`);
    
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const rScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([0, size/2 - padding/2]);
    
    const eventsSet = container.selectAll('g.event')
      .data(setData)
      .enter()
      .append('g')
      .attr('class', 'event');
    
    eventsSet.append('circle')
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => {
        if (i === 3) return colors.chart.grid;
        return [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i];
      })
      .attr('stroke-width', d => d.name === 'U' ? 2 : 3)
      .attr('stroke-dasharray', d => d.name === 'U' ? '5,5' : 'none');
    
    eventsSet.append('text')
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '18px')
      .style('font-weight', '600')
      .text(d => d.name);
    
    // Throttled drag with requestAnimationFrame
    const drag = d3.drag()
      .on('drag', function(event, d) {
        if (d.name === 'U') return;
        
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        
        // Store pending update
        pendingUpdateRef.current = { name: d.name, x, y };
        
        // Cancel previous RAF if exists
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        // Schedule update on next animation frame
        rafRef.current = requestAnimationFrame(() => {
          if (pendingUpdateRef.current) {
            const { name, x, y } = pendingUpdateRef.current;
            setSetData(prev => prev.map(s => 
              s.name === name ? { ...s, cx: x, cy: y } : s
            ));
            pendingUpdateRef.current = null;
          }
        });
      });
    
    eventsSet.selectAll('circle')
      .filter(d => d.name !== 'U')
      .call(drag);
    
  }, [setData]); // Still recreates on state change but throttled
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return (
    <VisualizationContainer title="Test 2: Throttled Updates with requestAnimationFrame">
      <p className="text-sm text-gray-400 mb-4">
        This version throttles React updates to ~60fps using requestAnimationFrame.
        If still clunky, the issue is deeper than just update frequency.
      </p>
      <div style={{ height: 400 }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEventsTest2;