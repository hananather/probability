'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const Ch6Hypothesis = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear().domain([-4, 4]).range([30, width - 30]);
    const y = d3.scaleLinear().domain([0, 0.45]).range([height - 40, 20]);
    
    // Normal curve data
    const normalPDF = x => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    const curveData = d3.range(-4, 4.1, 0.05).map(x => ({ x, y: normalPDF(x) }));
    
    // Create gradient for curve
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'hypothesis-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);
    
    // Main area under curve
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height - 40)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    const mainArea = svg.append('path')
      .datum(curveData)
      .attr('fill', 'url(#hypothesis-gradient)')
      .attr('d', area)
      .attr('opacity', isActive ? 0 : 0.5);
    
    // Curve outline
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    const curvePath = svg.append('path')
      .datum(curveData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', line)
      .attr('opacity', isActive ? 0 : 0.8);
    
    if (isActive) {
      // Quick fade in
      mainArea.transition()
        .duration(300)
        .attr('opacity', 1);
      
      curvePath.transition()
        .duration(300)
        .attr('opacity', 1);
      
      // Animated critical regions
      const criticalValue = 1.96;
      let progress = 0;
      
      const animateCritical = () => {
        progress = Math.min(progress + 0.04, 1);
        
        // Left tail
        const leftData = curveData.filter(d => d.x <= -criticalValue + (4 - criticalValue) * (1 - progress));
        const rightData = curveData.filter(d => d.x >= criticalValue - (4 - criticalValue) * (1 - progress));
        
        svg.selectAll('.critical-left').remove();
        svg.selectAll('.critical-right').remove();
        
        if (leftData.length > 0) {
          svg.append('path')
            .attr('class', 'critical-left')
            .datum(leftData)
            .attr('fill', '#ef4444')
            .attr('opacity', 0.5)
            .attr('d', area);
        }
        
        if (rightData.length > 0) {
          svg.append('path')
            .attr('class', 'critical-right')
            .datum(rightData)
            .attr('fill', '#ef4444')
            .attr('opacity', 0.5)
            .attr('d', area);
        }
        
        if (progress >= 1) {
          // Add labels and test statistic
          const testStat = 2.3;
          
          // Test statistic line
          svg.append('line')
            .attr('x1', x(testStat))
            .attr('x2', x(testStat))
            .attr('y1', height - 40)
            .attr('y2', y(normalPDF(testStat)))
            .attr('stroke', '#10b981')
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0)
            .transition()
            .duration(300)
            .attr('opacity', 1);
          
          // Labels
          svg.append('text')
            .attr('x', x(testStat))
            .attr('y', height - 25)
            .attr('text-anchor', 'middle')
            .attr('fill', '#10b981')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('z = 2.3')
            .attr('opacity', 0)
            .transition()
            .duration(300)
            .attr('opacity', 1);
          
          svg.append('text')
            .attr('x', x(0))
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .text('H₀')
            .attr('opacity', 0)
            .transition()
            .delay(200)
            .duration(300)
            .attr('opacity', 1);
        } else {
          animationRef.current = requestAnimationFrame(animateCritical);
        }
      };
      
      // Start animation after brief delay
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animateCritical);
      }, 400);
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

Ch6Hypothesis.displayName = 'Ch6Hypothesis';

export default Ch6Hypothesis;