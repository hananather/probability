'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const JourneyPath = React.memo(({ currentSection }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 80;
    const height = 600;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Only redraw if SVG is empty (first render)
    if (svg.select('path').empty()) {
      svg.selectAll('*').remove();
      
      // Journey path data
      const pathData = [
        { x: 40, y: 75 },
        { x: 25, y: 125 },
        { x: 55, y: 175 },
        { x: 30, y: 225 },
        { x: 50, y: 275 },
        { x: 35, y: 325 },
        { x: 45, y: 375 },
        { x: 40, y: 425 },
        { x: 40, y: 475 }
      ];
      
      const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis);
      
      // Background path (dotted)
      svg.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#3f3f46')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4');
      
      // Progress path
      const pathLength = svg.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .node().getTotalLength();
      
      svg.append('path')
        .datum(pathData)
        .attr('class', 'progress-path')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#14b8a6')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength);
      
      // Milestone groups
      const milestones = svg.selectAll('.milestone')
        .data(pathData.slice(1))
        .enter()
        .append('g')
        .attr('class', 'milestone')
        .attr('transform', (d, i) => `translate(${d.x}, ${d.y})`);
      
      milestones.append('circle')
        .attr('class', 'milestone-circle')
        .attr('r', 6)
        .attr('fill', '#3f3f46')
        .attr('stroke', '#18181b')
        .attr('stroke-width', 2);
    }
    
    // Update progress and milestones based on currentSection
    const progress = (currentSection + 1) / 8;
    const pathLength = svg.select('.progress-path').node().getTotalLength();
    
    svg.select('.progress-path')
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', pathLength * (1 - progress));
    
    svg.selectAll('.milestone-circle')
      .transition()
      .duration(300)
      .attr('fill', (d, i) => i <= currentSection ? '#14b8a6' : '#3f3f46')
      .attr('r', (d, i) => i === currentSection ? 8 : 6);
    
    // Pulsing effect on current section
    if (currentSection >= 0 && currentSection < 8) {
      const currentMilestone = svg.selectAll('.milestone')
        .filter((d, i) => i === currentSection);
      
      const pulseCircle = () => {
        const pulse = currentMilestone.append('circle')
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#14b8a6')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
        
        pulse.transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('r', 20)
          .attr('opacity', 0)
          .remove();
        
        animationRef.current = setTimeout(pulseCircle, 2000);
      };
      
      pulseCircle();
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [currentSection]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

JourneyPath.displayName = 'JourneyPath';

export default JourneyPath;