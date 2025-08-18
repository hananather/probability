'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

// Memoized factorial function
const factorial = (n) => {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

const Ch2Binomial = React.memo(({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Binomial distribution bars
    const n = 10, p = 0.5;
    const data = d3.range(n + 1).map(k => ({
      k: k,
      p: (factorial(n) / (factorial(k) * factorial(n - k))) * Math.pow(p, k) * Math.pow(1 - p, n - k)
    }));
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.p)])
      .range([height - margin.bottom, margin.top]);
    
    // Draw bars
    data.forEach((d, index) => {
      const bar = svg.append('rect')
        .attr('class', 'bar')
        .attr('x', x(d.k))
        .attr('width', x.bandwidth())
        .attr('fill', '#3b82f6');
      
      if (isActive) {
        bar.attr('y', height - margin.bottom)
          .attr('height', 0)
          .transition()
          .duration(800)
          .delay(index * 50)
          .attr('y', y(d.p))
          .attr('height', height - margin.bottom - y(d.p));
      } else {
        bar.attr('y', y(d.p))
          .attr('height', height - margin.bottom - y(d.p))
          .attr('opacity', 0.7);
      }
    });
    
    // Add axis
    const axis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => d));
    
    if (isActive) {
      axis.attr('opacity', 0)
        .transition()
        .delay(500)
        .duration(500)
        .attr('opacity', 1);
    } else {
      axis.attr('opacity', 0.5);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
});

Ch2Binomial.displayName = 'Ch2Binomial';

export default Ch2Binomial;