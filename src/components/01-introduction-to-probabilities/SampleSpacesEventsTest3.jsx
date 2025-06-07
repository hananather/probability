"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';

const colorScheme = createColorScheme('probability');

// Test 3: No Transforms - Direct pixel coordinates like ConditionalProbability fix
function SampleSpacesEventsTest3() {
  const [setData, setSetData] = useState([
    {name: 'A', cx: 0.5 - 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'B', cx: 0.5 + 0.1*Math.sqrt(3), cy: 0.4, r: 0.25},
    {name: 'C', cx: 0.5, cy: 0.7, r: 0.25},
    {name: 'U', cx: 0.5, cy: 0.5, r: 0.5}
  ]);
  
  const svgRef = useRef(null);
  const scalesRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = 30;
    
    // No transforms - bake margins into scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, height - margin]);
    const rScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([0, Math.min(width, height) / 2 - margin]);
    
    scalesRef.current = { xScale, yScale, rScale };
    
    svg.selectAll("*").remove();
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // No container transform - draw directly
    const eventsSet = svg.selectAll('g.event')
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
    
    // Direct coordinate drag - no transform math needed
    const drag = d3.drag()
      .on('drag', function(event, d) {
        if (d.name === 'U') return;
        
        // Use event.x and event.y directly with scale inversion
        const x = xScale.invert(event.x);
        const y = yScale.invert(event.y);
        
        // Constrain within universe
        const distCenter = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
        let finalX = x, finalY = y;
        
        if (distCenter + d.r > 0.5) {
          const ratio = (0.5 - d.r) / distCenter;
          finalX = ratio * (x - 0.5) + 0.5;
          finalY = ratio * (y - 0.5) + 0.5;
        }
        
        setSetData(prev => prev.map(s => 
          s.name === d.name ? { ...s, cx: finalX, cy: finalY } : s
        ));
      });
    
    eventsSet.selectAll('circle')
      .filter(d => d.name !== 'U')
      .style('cursor', 'grab')
      .call(drag);
    
  }, [setData]);
  
  return (
    <VisualizationContainer title="Test 3: No Transforms (Direct Coordinates)">
      <p className="text-sm text-gray-400 mb-4">
        This version uses direct pixel coordinates without transforms, like the ConditionalProbability fix.
        If smoother, transforms were causing coordinate calculation issues.
      </p>
      <div style={{ height: 400 }}>
        <svg ref={svgRef} style={{ width: "100%", height: 400 }} />
      </div>
    </VisualizationContainer>
  );
}

export default SampleSpacesEventsTest3;