"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { poissonPMF, binomialPMF } from "@/utils/distributions";
import { GraphContainer } from '../../ui/VisualizationContainer';
import { RangeSlider } from '../../ui/RangeSlider';
import { colors, createColorScheme, formatNumber } from '../../../lib/design-system';

// Color scheme - bright and vibrant colors
const colorScheme = {
  primary: '#60A5FA', // bright blue-400 for Poisson
  secondary: '#facc15', // bright yellow
  tertiary: '#F59E0B', // bright amber-500 for Binomial
  area: 'rgba(96, 165, 250, 0.3)', // blue with moderate opacity
  grid: '#6b7280' // brighter gray-500 for better visibility
};

export function BinomialApproximation({ lambda }) {
  const svgRef = useRef(null);
  const [n, setN] = useState(20);
  
  const p = useMemo(() => lambda / n, [lambda, n]);
  
  // Memoize distribution calculations
  const { poissonData, binomialData, maxK } = useMemo(() => {
    if (lambda <= 0) return { poissonData: [], binomialData: [], maxK: 0 };
    
    const maxK = Math.min(50, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
    
    const poissonData = Array.from({ length: maxK + 1 }, (_, k) => ({
      k,
      p: poissonPMF(k, lambda),
      type: 'poisson'
    })).filter(d => d.p > 0.0001);
    
    const binomialData = Array.from({ length: Math.min(n + 1, maxK + 1) }, (_, k) => ({
      k,
      p: binomialPMF(k, n, p),
      type: 'binomial'
    })).filter(d => d.p > 0.0001);
    
    return { poissonData, binomialData, maxK };
  }, [lambda, n, p]);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    if (poissonData.length === 0 && binomialData.length === 0) return;
    
    const width = svg.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
    
    svg.attr('height', height);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(d3.range(0, maxK + 1))
      .range([margin.left, width - margin.right])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(
        d3.max(poissonData, d => d.p) || 0,
        d3.max(binomialData, d => d.p) || 0
      ) * 1.1])
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
    
    // Bar width for side-by-side bars
    const barWidth = xScale.bandwidth() / 2;
    
    // Binomial bars
    g.selectAll('.binomial-bar')
      .data(binomialData)
      .enter()
      .append('rect')
      .attr('class', 'binomial-bar')
      .attr('x', d => xScale(d.k))
      .attr('y', d => yScale(d.p))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.p))
      .attr('fill', colorScheme.tertiary)
      .attr('opacity', 0.8);
    
    // Poisson bars
    g.selectAll('.poisson-bar')
      .data(poissonData)
      .enter()
      .append('rect')
      .attr('class', 'poisson-bar')
      .attr('x', d => xScale(d.k) + barWidth)
      .attr('y', d => yScale(d.p))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.p))
      .attr('fill', colorScheme.primary)
      .attr('opacity', 0.9);
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(
        d3.range(0, maxK + 1).filter((d, i) => i % Math.ceil((maxK + 1) / 20) === 0)
      ))
      .style('color', colors.chart.text);
    
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => formatNumber(d, 3)))
      .style('color', colors.chart.text);
    
    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);
    
    // Binomial legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', colorScheme.tertiary)
      .attr('opacity', 0.8);
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('fill', colors.chart.text)
      .style('font-size', '12px')
      .text(`Binomial(${n}, ${formatNumber(p, 3)})`);
    
    // Poisson legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', colorScheme.primary)
      .attr('opacity', 0.9);
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .attr('fill', colors.chart.text)
      .style('font-size', '12px')
      .text(`Poisson(${lambda.toFixed(1)})`);
    
    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.chart.text)
      .style('font-size', '12px')
      .text('k (number of events)');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.chart.text)
      .style('font-size', '12px')
      .text('P(X = k)');
    
    return () => {
      svg.selectAll('*').remove();
    };
  }, [poissonData, binomialData, maxK, lambda, n, p]);
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Approximation Principle</h3>
        <p className="text-sm text-gray-400 mb-3">
          As n → ∞ and p → 0, with np = λ constant, the Binomial(n,p) distribution approaches Poisson(λ).
        </p>
        <div className="bg-gray-900/50 rounded p-3 font-mono text-sm">
          <div className="text-blue-400">Binomial(n, p) → Poisson(λ)</div>
          <div className="text-gray-400 mt-1">when n → ∞, p → 0, np = λ</div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="space-y-3">
          <RangeSlider
            label="n (number of trials)"
            value={n}
            onChange={setN}
            min={10}
            max={100}
            step={5}
            formatValue={v => v}
          />
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">p = λ/n =</span>
              <span className="font-mono text-blue-400">{formatNumber(p, 4)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">np =</span>
              <span className="font-mono text-blue-400">{formatNumber(n * p, 2)}</span>
              <span className="text-gray-400">= λ</span>
            </div>
          </div>
        </div>
      </div>
      
      <GraphContainer title="Distribution Comparison">
        <svg ref={svgRef} className="w-full" />
      </GraphContainer>
    </div>
  );
}