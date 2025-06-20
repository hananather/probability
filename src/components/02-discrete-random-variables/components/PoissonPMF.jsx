"use client";
import React, { useRef, useEffect, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { poissonPMF } from "@/utils/distributions";
import { GraphContainer } from '../../ui/VisualizationContainer';
import { colors, createColorScheme, formatNumber } from '../../../lib/design-system';

// Color scheme - bright and vibrant colors
const colorScheme = {
  primary: '#60A5FA', // bright blue-400
  secondary: '#facc15', // bright yellow
  tertiary: '#10b981', // bright emerald-500
  area: 'rgba(96, 165, 250, 0.4)', // blue with higher opacity
  grid: '#6b7280' // brighter gray-500 for better visibility
};

export function PoissonPMF({ lambda, highlightK = null }) {
  const svgRef = useRef(null);
  
  // Memoize PMF calculations
  const data = useMemo(() => {
    if (lambda <= 0) return [];
    
    const maxK = Math.min(50, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
    return Array.from({ length: maxK + 1 }, (_, k) => ({
      k,
      p: poissonPMF(k, lambda)
    })).filter(d => d.p > 0.0001); // Filter very small probabilities
  }, [lambda]);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    if (data.length === 0) return;
    
    const width = svg.node().getBoundingClientRect().width;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    svg.attr('height', height);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.p) * 1.1])
      .range([height - margin.bottom, margin.top]);
    
    const g = svg.append('g');
    
    // Grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', colorScheme.grid)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.3);
    
    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.k))
      .attr('y', d => yScale(d.p))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.p))
      .attr('fill', d => d.k === highlightK ? colorScheme.secondary : colorScheme.primary)
      .attr('opacity', 0.9)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('fill', colorScheme.secondary);
        
        // Tooltip
        const tooltip = g.append('g').attr('class', 'tooltip');
        const x = xScale(d.k) + xScale.bandwidth() / 2;
        const y = yScale(d.p) - 10;
        
        const rect = tooltip.append('rect')
          .attr('x', x - 45)
          .attr('y', y - 25)
          .attr('width', 90)
          .attr('height', 20)
          .attr('fill', colors.background.primary)
          .attr('stroke', colorScheme.primary)
          .attr('rx', 3);
        
        tooltip.append('text')
          .attr('x', x)
          .attr('y', y - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', colors.text.primary)
          .style('font-size', '12px')
          .text(`P(X=${d.k}) = ${formatNumber(d.p, 4)}`);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.9)
          .attr('fill', d.k === highlightK ? colorScheme.secondary : colorScheme.primary);
        
        g.select('.tooltip').remove();
      });
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(
        data.filter((d, i) => i % Math.ceil(data.length / 20) === 0).map(d => d.k)
      ))
      .style('color', colors.text.secondary);
    
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => formatNumber(d, 3)))
      .style('color', colors.text.secondary);
    
    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text.secondary)
      .style('font-size', '12px')
      .text('k (number of events)');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text.secondary)
      .style('font-size', '12px')
      .text('P(X = k)');
    
    // Mean indicator
    if (lambda > 0) {
      g.append('line')
        .attr('x1', xScale(Math.round(lambda)) + xScale.bandwidth() / 2)
        .attr('x2', xScale(Math.round(lambda)) + xScale.bandwidth() / 2)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', colorScheme.secondary)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.9);
      
      g.append('text')
        .attr('x', xScale(Math.round(lambda)) + xScale.bandwidth() / 2)
        .attr('y', margin.top - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.secondary)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(`λ = ${lambda.toFixed(1)}`);
    }
    
    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, lambda, highlightK]);
  
  if (lambda <= 0) {
    return (
      <GraphContainer title="Probability Mass Function">
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>Set λ &gt; 0 to see the distribution</p>
        </div>
      </GraphContainer>
    );
  }
  
  return (
    <GraphContainer title="Probability Mass Function">
      <svg ref={svgRef} className="w-full" />
    </GraphContainer>
  );
}