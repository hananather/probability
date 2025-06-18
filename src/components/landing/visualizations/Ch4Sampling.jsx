'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch4Sampling = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Generate population
    const population = d3.range(50).map((_, i) => ({
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      value: Math.random(),
      id: i
    }));
    
    // Population dots
    const dots = svg.selectAll('.pop-dot')
      .data(population)
      .enter()
      .append('circle')
      .attr('class', 'pop-dot')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', '#525252')
      .attr('opacity', 0.5);
    
    if (isActive) {
      // Instant appearance with staggered effect
      dots.attr('r', 0)
        .transition()
        .duration(200)
        .delay((d, i) => i * 10)
        .attr('r', 3);
      
      // Quick sampling animation
      const sampleSize = 12;
      const sampleIndices = d3.shuffle(d3.range(population.length)).slice(0, sampleSize);
      
      timeoutRef.current = setTimeout(() => {
        // Highlight sampled points quickly
        svg.selectAll('.pop-dot')
          .data(population)
          .transition()
          .duration(300)
          .attr('fill', (d, i) => sampleIndices.includes(i) ? '#10b981' : '#525252')
          .attr('r', (d, i) => sampleIndices.includes(i) ? 6 : 3)
          .attr('opacity', (d, i) => sampleIndices.includes(i) ? 1 : 0.2);
        
        // Draw connecting lines from samples to mean
        const meanX = width / 2;
        const meanY = height - 40;
        
        const samplePoints = sampleIndices.map(i => population[i]);
        
        // Add lines from samples to center
        const lines = svg.selectAll('.sample-line')
          .data(samplePoints)
          .enter()
          .append('line')
          .attr('class', 'sample-line')
          .attr('x1', d => d.x)
          .attr('y1', d => d.y)
          .attr('x2', d => d.x)
          .attr('y2', d => d.y)
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3);
        
        lines.transition()
          .duration(400)
          .delay(100)
          .attr('x2', meanX)
          .attr('y2', meanY);
        
        // Mean indicator
        const meanGroup = svg.append('g');
        
        meanGroup.append('circle')
          .attr('cx', meanX)
          .attr('cy', meanY)
          .attr('r', 0)
          .attr('fill', '#f59e0b')
          .transition()
          .delay(400)
          .duration(200)
          .attr('r', 8);
        
        meanGroup.append('text')
          .attr('x', meanX)
          .attr('y', meanY + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text('x̄')
          .transition()
          .delay(500)
          .duration(200)
          .attr('opacity', 1);
      }, 300);
    } else {
      // Static view
      dots.attr('r', 3);
      const staticSample = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      dots.attr('fill', (d, i) => staticSample.includes(i) ? '#10b981' : '#525252')
        .attr('r', (d, i) => staticSample.includes(i) ? 4 : 3)
        .attr('opacity', (d, i) => staticSample.includes(i) ? 0.8 : 0.4);
    }
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch4Sampling.displayName = 'Ch4Sampling';

export default Ch4Sampling;