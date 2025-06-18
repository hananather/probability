'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch5Confidence = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Confidence interval visualization
    const trueValue = 150;
    const intervals = d3.range(5).map((_, i) => {
      const mean = trueValue + (Math.random() - 0.5) * 40;
      const margin = 20 + Math.random() * 10;
      return {
        y: 40 + i * 30,
        lower: mean - margin,
        upper: mean + margin,
        contains: mean - margin <= trueValue && trueValue <= mean + margin
      };
    });
    
    // True value line
    const trueLine = svg.append('line')
      .attr('x1', trueValue)
      .attr('x2', trueValue)
      .attr('y1', 20)
      .attr('y2', height - 20)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');
    
    if (isActive) {
      trueLine.attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    } else {
      trueLine.attr('opacity', 0.6);
    }
    
    // Intervals
    const g = svg.selectAll('.interval')
      .data(intervals)
      .enter()
      .append('g')
      .attr('class', 'interval');
    
    // Interval lines
    const intervalLines = g.append('line')
      .attr('x1', d => d.lower)
      .attr('x2', d => d.upper)
      .attr('y1', d => d.y)
      .attr('y2', d => d.y)
      .attr('stroke', d => d.contains ? '#10b981' : '#f59e0b');
    
    if (isActive) {
      intervalLines
        .attr('stroke-width', 0)
        .transition()
        .delay((d, i) => 500 + i * 200)
        .duration(400)
        .attr('stroke-width', 3);
    } else {
      intervalLines.attr('stroke-width', 2).attr('opacity', 0.7);
    }
    
    // End caps
    const caps = g.selectAll('.cap')
      .data(d => [{ value: d.lower, parent: d }, { value: d.upper, parent: d }])
      .enter()
      .append('line')
      .attr('x1', d => d.value)
      .attr('x2', d => d.value)
      .attr('y1', d => d.parent.y - 5)
      .attr('y2', d => d.parent.y + 5)
      .attr('stroke', d => d.parent.contains ? '#10b981' : '#f59e0b');
    
    if (isActive) {
      caps.attr('stroke-width', 0)
        .transition()
        .delay((d, i) => 700 + Math.floor(i/2) * 200)
        .duration(200)
        .attr('stroke-width', 2);
    } else {
      caps.attr('stroke-width', 2).attr('opacity', 0.7);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch5Confidence.displayName = 'Ch5Confidence';

export default Ch5Confidence;