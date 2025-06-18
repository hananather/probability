'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

const normalPDF = (x, mu = 0, sigma = 1) => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
         Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
};

const Ch3Normal = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const waveRef = useRef(0);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.5])
      .range([height - margin.bottom, margin.top]);
    
    // Gradient with animated colors
    const gradientId = 'normal-gradient-' + Date.now();
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.9);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);
    
    // Create path elements
    const areaPath = svg.append('path')
      .attr('fill', `url(#${gradientId})`);
    
    const curvePath = svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2.5);
    
    // Axis
    const axis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('opacity', isActive ? 0 : 0.5);
    
    // Animated wave effect
    const animateWave = () => {
      waveRef.current += 0.05;
      const waveOffset = waveRef.current;
      
      // Generate dynamic data with wave
      const data = d3.range(-4, 4.1, 0.05).map(xVal => {
        const baseY = normalPDF(xVal);
        const wave = isActive ? Math.sin(xVal * 2 + waveOffset) * 0.02 : 0;
        return {
          x: xVal,
          y: baseY + wave
        };
      });
      
      // Update area
      const area = d3.area()
        .x(d => x(d.x))
        .y0(height - margin.bottom)
        .y1(d => y(d.y))
        .curve(d3.curveBasis);
      
      areaPath.attr('d', area(data));
      
      // Update line
      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);
      
      curvePath.attr('d', line(data));
      
      if (isActive) {
        animationRef.current = requestAnimationFrame(animateWave);
      }
    };
    
    if (isActive) {
      // Quick fade in
      areaPath.attr('opacity', 0)
        .transition()
        .duration(300)
        .attr('opacity', 1);
      
      curvePath.attr('opacity', 0)
        .transition()
        .duration(300)
        .attr('opacity', 1);
      
      axis.transition()
        .duration(300)
        .attr('opacity', 1);
      
      // Start wave animation
      animateWave();
    } else {
      // Static view
      const staticData = d3.range(-4, 4.1, 0.1).map(x => ({
        x: x,
        y: normalPDF(x)
      }));
      
      const area = d3.area()
        .x(d => x(d.x))
        .y0(height - margin.bottom)
        .y1(d => y(d.y))
        .curve(d3.curveBasis);
      
      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveBasis);
      
      areaPath.attr('d', area(staticData)).attr('opacity', 0.6);
      curvePath.attr('d', line(staticData)).attr('opacity', 0.7);
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

Ch3Normal.displayName = 'Ch3Normal';

export default Ch3Normal;