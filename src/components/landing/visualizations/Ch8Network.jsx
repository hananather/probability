'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch8Network = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Network visualization
    const nodes = d3.range(7).map((_, i) => ({
      id: i,
      x: width/2 + 60 * Math.cos(i * 2 * Math.PI / 7),
      y: height/2 + 60 * Math.sin(i * 2 * Math.PI / 7)
    }));
    
    const links = [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 6 },
      { source: 6, target: 0 },
      { source: 0, target: 3 },
      { source: 1, target: 4 },
      { source: 2, target: 5 }
    ];
    
    // Draw links
    links.forEach((link, index) => {
      const linkElement = svg.append('line')
        .attr('class', 'link')
        .attr('x1', nodes[link.source].x)
        .attr('y1', nodes[link.source].y)
        .attr('stroke', '#525252')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
      
      if (isActive) {
        linkElement
          .attr('x2', nodes[link.source].x)
          .attr('y2', nodes[link.source].y)
          .transition()
          .delay(index * 100)
          .duration(500)
          .attr('x2', nodes[link.target].x)
          .attr('y2', nodes[link.target].y);
      } else {
        linkElement
          .attr('x2', nodes[link.target].x)
          .attr('y2', nodes[link.target].y);
      }
    });
    
    // Draw nodes
    nodes.forEach((node, index) => {
      const nodeElement = svg.append('circle')
        .attr('class', 'node')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('fill', '#a78bfa');
      
      if (isActive) {
        // Delay node animation until links are drawn
        nodeElement
          .attr('r', 0)
          .transition()
          .delay(links.length * 100 + index * 100)
          .duration(300)
          .attr('r', 8);
      } else {
        nodeElement.attr('r', 6).attr('opacity', 0.7);
      }
    });
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch8Network.displayName = 'Ch8Network';

export default Ch8Network;