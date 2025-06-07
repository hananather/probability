"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';

const colorScheme = createColorScheme('probability');

// Test 1: Direct D3 Manipulation - Updates D3 directly, syncs React on dragend only
function SampleSpacesEventsTest1() {
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ]);
  
  const svgRef = useRef(null);
  const d3Container = useRef(null);
  
  // One-time setup effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const size = Math.min(width * 0.9, height);
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const container = svg.append('g')
      .attr("transform", `translate(${(width - size) / 2}, ${(height - size) / 2})`);
    
    d3Container.current = container;
    
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, size]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([0, size]);
    const rScale = d3.scaleLinear().domain([0, 0.5]).range([0, size/2]);
    
    // Store scales on the container for drag handler
    container.scales = { xScale, yScale, rScale };
    
    // Initial render
    updateVisualization();
  }, []); // Empty deps - run once
  
  // Update visualization when setData changes
  const updateVisualization = () => {
    if (!d3Container.current) return;
    
    const container = d3Container.current;
    const { xScale, yScale, rScale } = container.scales;
    
    // Data join pattern - efficiently update existing elements
    const circles = container.selectAll('circle')
      .data(setData, d => d.name);
    
    circles.enter()
      .append('circle')
      .attr('fill', 'none')
      .attr('stroke-width', d => d.name === 'U' ? 2 : 3)
      .attr('stroke-dasharray', d => d.name === 'U' ? '5,5' : 'none')
      .merge(circles)
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r))
      .attr('stroke', (d, i) => {
        if (i === 3) return colors.chart.grid;
        return [colorScheme.chart.primary, colorScheme.chart.secondary, colorScheme.chart.tertiary][i];
      });
    
    const labels = container.selectAll('text')
      .data(setData, d => d.name);
    
    labels.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '18px')
      .style('font-weight', '600')
      .merge(labels)
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .text(d => d.name);
    
    // Drag behavior - updates D3 directly, not React state
    const drag = d3.drag()
      .on('start', function(event, d) {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('drag', function(event, d) {
        if (d.name === 'U') return;
        
        const { xScale, yScale, rScale } = container.scales;
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        
        // Update d3 elements directly without React
        d3.select(this)
          .attr('cx', xScale(x))
          .attr('cy', yScale(y));
        
        container.selectAll('text')
          .filter(t => t.name === d.name)
          .attr('x', xScale(x))
          .attr('y', yScale(y));
      })
      .on('end', function(event, d) {
        d3.select(this).style('cursor', 'grab');
        
        // Only update React state on drag end
        const { xScale, yScale } = container.scales;
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        
        setSetData(prev => prev.map(s => 
          s.name === d.name ? { ...s, cx: x, cy: y } : s
        ));
      });
    
    container.selectAll('circle')
      .filter(d => d.name !== 'U')
      .style('cursor', 'grab')
      .call(drag);
  };
  
  // Update viz when setData changes (only on dragend)
  useEffect(() => {
    updateVisualization();
  }, [setData]);
  
  return (
    <VisualizationContainer title="Test 1: Direct D3 Manipulation (No React Updates During Drag)">
      <p className="text-sm text-gray-400 mb-4">
        This version updates D3 elements directly during drag and only syncs React state on dragend.
        If dragging is smooth here, it confirms the issue is React re-renders.
      </p>
      <div style={{ height: 400 }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEventsTest1;