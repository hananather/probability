'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch1Venn = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Venn diagram - always visible
    const sets = [
      { name: 'A', cx: 100, cy: 100, r: 50, color: '#14b8a6' },
      { name: 'B', cx: 150, cy: 100, r: 50, color: '#3b82f6' },
      { name: 'C', cx: 125, cy: 140, r: 50, color: '#f59e0b' }
    ];
    
    const g = svg.append('g');
    
    // Draw circles
    sets.forEach((set, i) => {
      const circle = g.append('circle')
        .attr('cx', set.cx)
        .attr('cy', set.cy)
        .attr('fill', 'none')
        .attr('stroke', set.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);
      
      if (isActive) {
        circle.attr('r', 0)
          .transition()
          .delay(i * 200)
          .duration(800)
          .attr('r', set.r)
          .attr('opacity', 0.8);
      } else {
        circle.attr('r', set.r);
      }
      
      const text = g.append('text')
        .attr('x', set.cx)
        .attr('y', set.cy)
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('fill', '#ffffff')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold');
      
      if (isActive) {
        text.attr('opacity', 0)
          .text(set.name)
          .transition()
          .delay(i * 200 + 400)
          .duration(400)
          .attr('opacity', 1);
      } else {
        text.attr('opacity', 0.7).text(set.name);
      }
    });
    
    // Intersection highlight with cleanup
    if (isActive) {
      const timeoutId = setTimeout(() => {
        g.append('path')
          .attr('d', 'M 125,100 A 50,50 0 0,1 125,140')
          .attr('fill', '#fbbf24')
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .attr('opacity', 0.4);
      }, 2000);
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch1Venn.displayName = 'Ch1Venn';

export default Ch1Venn;