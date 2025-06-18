'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch7Regression = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Generate correlated data
    const n = 20;
    const data = d3.range(n).map(() => {
      const x = Math.random() * 200 + 50;
      const y = 0.5 * x + (Math.random() - 0.5) * 40 + 50;
      return { x, y };
    });
    
    const xScale = d3.scaleLinear().domain([0, 300]).range([30, width - 30]);
    const yScale = d3.scaleLinear().domain([0, 200]).range([height - 30, 30]);
    
    // Plot points with staggered animation
    const points = svg.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.7);
    
    if (isActive) {
      // Fast staggered appearance
      points
        .attr('r', 0)
        .transition()
        .duration(200)
        .delay((d, i) => i * 15)
        .attr('r', 4)
        .on('end', function(d, i) {
          if (i === data.length - 1) {
            drawRegressionLine();
          }
        });
    } else {
      points.attr('r', 3);
      drawRegressionLine();
    }
    
    function drawRegressionLine() {
      // Calculate regression line
      const xMean = d3.mean(data, d => d.x);
      const yMean = d3.mean(data, d => d.y);
      const slope = d3.sum(data, d => (d.x - xMean) * (d.y - yMean)) / 
                    d3.sum(data, d => (d.x - xMean) * (d.x - xMean));
      const intercept = yMean - slope * xMean;
      
      const lineData = [
        { x: 50, y: slope * 50 + intercept },
        { x: 250, y: slope * 250 + intercept }
      ];
      
      // Draw regression line
      const regLine = svg.append('line')
        .attr('x1', xScale(lineData[0].x))
        .attr('y1', yScale(lineData[0].y))
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 2);
      
      if (isActive) {
        // Draw line quickly with glow effect
        regLine
          .attr('x2', xScale(lineData[0].x))
          .attr('y2', yScale(lineData[0].y))
          .attr('opacity', 0.8)
          .transition()
          .duration(400)
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y));
        
        // Add glow effect
        svg.append('line')
          .attr('x1', xScale(lineData[0].x))
          .attr('y1', yScale(lineData[0].y))
          .attr('x2', xScale(lineData[0].x))
          .attr('y2', yScale(lineData[0].y))
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 6)
          .attr('opacity', 0.3)
          .attr('filter', 'blur(2px)')
          .transition()
          .duration(400)
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y));
        
        // Add R² value
        const r2 = 0.87; // Example R² value
        svg.append('text')
          .attr('x', width - 40)
          .attr('y', 30)
          .attr('text-anchor', 'end')
          .attr('fill', '#dc2626')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(`R² = ${r2}`)
          .transition()
          .delay(400)
          .duration(300)
          .attr('opacity', 1);
      } else {
        regLine
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y))
          .attr('opacity', 0.6);
      }
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch7Regression.displayName = 'Ch7Regression';

export default Ch7Regression;