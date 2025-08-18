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
    intervals.forEach((interval, index) => {
      const g = svg.append('g')
        .attr('class', 'interval');
      
      // Interval line
      const intervalLine = g.append('line')
        .attr('x1', interval.lower)
        .attr('x2', interval.upper)
        .attr('y1', interval.y)
        .attr('y2', interval.y)
        .attr('stroke', interval.contains ? '#10b981' : '#f59e0b');
      
      if (isActive) {
        intervalLine
          .attr('stroke-width', 0)
          .transition()
          .delay(500 + index * 200)
          .duration(400)
          .attr('stroke-width', 3);
      } else {
        intervalLine.attr('stroke-width', 2).attr('opacity', 0.7);
      }
      
      // End caps
      const capData = [
        { value: interval.lower, y: interval.y },
        { value: interval.upper, y: interval.y }
      ];
      
      capData.forEach((cap, capIndex) => {
        const capLine = g.append('line')
          .attr('x1', cap.value)
          .attr('x2', cap.value)
          .attr('y1', cap.y - 5)
          .attr('y2', cap.y + 5)
          .attr('stroke', interval.contains ? '#10b981' : '#f59e0b');
        
        if (isActive) {
          capLine.attr('stroke-width', 0)
            .transition()
            .delay(700 + index * 200)
            .duration(200)
            .attr('stroke-width', 2);
        } else {
          capLine.attr('stroke-width', 2).attr('opacity', 0.7);
        }
      });
    });
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch5Confidence.displayName = 'Ch5Confidence';

export default Ch5Confidence;