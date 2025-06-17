'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as d3 from 'd3';

// Journey dots visualization - shows progress as user scrolls
const JourneyPath = ({ currentSection }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 80;
    const height = 600;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();
    
    // Journey path data - creates a winding path
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
    
    // Progress path that fills as user scrolls
    const progress = (currentSection + 1) / 8;
    const pathLength = svg.append('path')
      .datum(pathData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .node().getTotalLength();
    
    svg.append('path')
      .datum(pathData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#14b8a6')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', pathLength * (1 - progress));
    
    // Milestone dots for each chapter
    const milestones = svg.selectAll('.milestone')
      .data(pathData.slice(1))
      .enter()
      .append('g')
      .attr('class', 'milestone')
      .attr('transform', (d, i) => `translate(${d.x}, ${d.y})`);
    
    milestones.append('circle')
      .attr('r', 6)
      .attr('fill', (d, i) => i <= currentSection ? '#14b8a6' : '#3f3f46')
      .attr('stroke', '#18181b')
      .attr('stroke-width', 2)
      .transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('r', (d, i) => i === currentSection ? 8 : 6);
    
    // Pulsing effect on current section
    if (currentSection >= 0 && currentSection < 8) {
      const currentMilestone = milestones.filter((d, i) => i === currentSection);
      const pulseCircle = () => {
        currentMilestone.append('circle')
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#14b8a6')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('r', 20)
          .attr('opacity', 0)
          .remove()
          .on('end', pulseCircle);
      };
      pulseCircle();
    }
  }, [currentSection]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

// Mini visualization components for each chapter
const Ch1Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Venn diagram - always visible
    const sets = [
      { name: 'A', cx: 100, cy: 100, r: 50 },
      { name: 'B', cx: 150, cy: 100, r: 50 },
      { name: 'C', cx: 125, cy: 140, r: 50 }
    ];
    
    const g = svg.append('g');
    
    // Draw circles (static or animated based on isActive)
    sets.forEach((set, i) => {
      const circle = g.append('circle')
        .attr('cx', set.cx)
        .attr('cy', set.cy)
        .attr('fill', 'none')
        .attr('stroke', ['#14b8a6', '#3b82f6', '#f59e0b'][i])
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
    
    // Intersection highlight (only on hover)
    if (isActive) {
      setTimeout(() => {
        g.append('path')
          .attr('d', 'M 125,100 A 50,50 0 0,1 125,140')
          .attr('fill', '#fbbf24')
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .attr('opacity', 0.4);
      }, 2000);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch2Visualization = ({ isActive }) => {
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
    
    // Draw bars (static or animated)
    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.k))
      .attr('width', x.bandwidth())
      .attr('fill', '#3b82f6');
    
    if (isActive) {
      bars.attr('y', height - margin.bottom)
        .attr('height', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('y', d => y(d.p))
        .attr('height', d => height - margin.bottom - y(d.p));
    } else {
      bars.attr('y', d => y(d.p))
        .attr('height', d => height - margin.bottom - y(d.p))
        .attr('opacity', 0.7);
    }
    
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
    
    function factorial(n) {
      return n <= 1 ? 1 : n * factorial(n - 1);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch3Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
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
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Normal distribution curve
    const normalPDF = (x, mu = 0, sigma = 1) => {
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
             Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    };
    
    const data = d3.range(-4, 4.1, 0.1).map(x => ({
      x: x,
      y: normalPDF(x)
    }));
    
    // Area under curve
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height - margin.bottom)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'normal-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.1);
    
    // Draw area
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'url(#normal-gradient)')
      .attr('d', area);
    
    if (isActive) {
      const pathLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0);
    } else {
      path.attr('opacity', 0.6);
    }
    
    // Curve line
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    const curvePath = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    if (isActive) {
      curvePath
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(1000)
        .attr('opacity', 1);
    } else {
      curvePath.attr('opacity', 0.7);
    }
    
    // Axis
    const axis = svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5));
    
    if (isActive) {
      axis.attr('opacity', 0)
        .transition()
        .delay(1500)
        .duration(500)
        .attr('opacity', 1);
    } else {
      axis.attr('opacity', 0.5);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch4Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Sampling animation
    const population = d3.range(50).map(() => ({
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      value: Math.random()
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
      dots.attr('r', 0)
        .transition()
        .duration(500)
        .attr('r', 3);
      
      // Animate random sampling
      const sampleSize = 10;
      const sampleIndices = d3.shuffle(d3.range(population.length)).slice(0, sampleSize);
      
      setTimeout(() => {
        svg.selectAll('.pop-dot')
          .data(population)
          .transition()
          .duration(800)
          .attr('fill', (d, i) => sampleIndices.includes(i) ? '#10b981' : '#525252')
          .attr('r', (d, i) => sampleIndices.includes(i) ? 5 : 3)
          .attr('opacity', (d, i) => sampleIndices.includes(i) ? 1 : 0.3);
        
        // Sample mean visualization
        const meanX = width / 2;
        const meanY = height - 30;
        
        svg.append('line')
          .attr('x1', meanX - 30)
          .attr('x2', meanX + 30)
          .attr('y1', meanY)
          .attr('y2', meanY)
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 0)
          .transition()
          .delay(1000)
          .duration(500)
          .attr('stroke-width', 3);
        
        svg.append('text')
          .attr('x', meanX)
          .attr('y', meanY - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '12px')
          .attr('opacity', 0)
          .text('x̄')
          .transition()
          .delay(1200)
          .duration(400)
          .attr('opacity', 1);
      }, 1000);
    } else {
      // Static view - show some sampled
      dots.attr('r', 3);
      const staticSample = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      dots.attr('fill', (d, i) => staticSample.includes(i) ? '#10b981' : '#525252')
        .attr('r', (d, i) => staticSample.includes(i) ? 4 : 3)
        .attr('opacity', (d, i) => staticSample.includes(i) ? 0.8 : 0.4);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch5Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Confidence interval visualization
    const trueValue = 150;
    const intervals = d3.range(5).map((_, i) => {
      const mean = trueValue + (Math.random() - 0.5) * 40;
      const margin = 20 + Math.random() * 10;
      return {
        y: 40 + i * 30,
        lower: mean - margin,
        upper: mean + margin,
        contains: mean - margin <= trueValue && trueValue <= mean + margin
      };
    });
    
    // True value line
    const trueLine = svg.append('line')
      .attr('x1', trueValue)
      .attr('x2', trueValue)
      .attr('y1', 20)
      .attr('y2', height - 20)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');
    
    if (isActive) {
      trueLine.attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    } else {
      trueLine.attr('opacity', 0.6);
    }
    
    // Intervals
    const g = svg.selectAll('.interval')
      .data(intervals)
      .enter()
      .append('g')
      .attr('class', 'interval');
    
    // Interval lines
    const intervalLines = g.append('line')
      .attr('x1', d => d.lower)
      .attr('x2', d => d.upper)
      .attr('y1', d => d.y)
      .attr('y2', d => d.y)
      .attr('stroke', d => d.contains ? '#10b981' : '#f59e0b');
    
    if (isActive) {
      intervalLines
        .attr('stroke-width', 0)
        .transition()
        .delay((d, i) => 500 + i * 200)
        .duration(400)
        .attr('stroke-width', 3);
    } else {
      intervalLines.attr('stroke-width', 2).attr('opacity', 0.7);
    }
    
    // End caps
    const caps = g.selectAll('.cap')
      .data(d => [{ value: d.lower, parent: d }, { value: d.upper, parent: d }])
      .enter()
      .append('line')
      .attr('x1', d => d.value)
      .attr('x2', d => d.value)
      .attr('y1', d => d.parent.y - 5)
      .attr('y2', d => d.parent.y + 5)
      .attr('stroke', d => d.parent.contains ? '#10b981' : '#f59e0b');
    
    if (isActive) {
      caps.attr('stroke-width', 0)
        .transition()
        .delay((d, i) => 700 + Math.floor(i/2) * 200)
        .duration(200)
        .attr('stroke-width', 2);
    } else {
      caps.attr('stroke-width', 2).attr('opacity', 0.7);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch6Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // P-value visualization
    const x = d3.scaleLinear().domain([-4, 4]).range([20, width - 20]);
    const y = d3.scaleLinear().domain([0, 0.4]).range([height - 30, 30]);
    
    // Normal curve
    const normalPDF = x => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    const curveData = d3.range(-4, 4.1, 0.1).map(x => ({ x, y: normalPDF(x) }));
    
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Draw curve
    const curvePath = svg.append('path')
      .datum(curveData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    if (isActive) {
      curvePath.attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 1);
    } else {
      curvePath.attr('opacity', 0.7);
    }
    
    // Critical region
    const criticalValue = 1.96;
    const criticalData = curveData.filter(d => Math.abs(d.x) >= criticalValue);
    
    const area = d3.area()
      .x(d => x(d.x))
      .y0(height - 30)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Show critical regions
    const criticalPath = svg.append('path')
      .datum(criticalData)
      .attr('fill', '#ef4444')
      .attr('d', area);
    
    if (isActive) {
      setTimeout(() => {
        criticalPath
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .attr('opacity', 0.3);
        
        // Labels
        svg.append('text')
          .attr('x', x(2.5))
          .attr('y', height - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', '12px')
          .attr('opacity', 0)
          .text('α/2')
          .transition()
          .delay(800)
          .duration(400)
          .attr('opacity', 1);
        
        svg.append('text')
          .attr('x', x(-2.5))
          .attr('y', height - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', '12px')
          .attr('opacity', 0)
          .text('α/2')
          .transition()
          .delay(800)
          .duration(400)
          .attr('opacity', 1);
      }, 1200);
    } else {
      criticalPath.attr('opacity', 0.2);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch7Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
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
    
    // Plot points
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
      points.attr('r', 0)
        .transition()
        .delay((d, i) => i * 50)
        .duration(300)
        .attr('r', 4);
    } else {
      points.attr('r', 3);
    }
    
    // Calculate and draw regression line
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
      regLine
        .attr('x2', xScale(lineData[0].x))
        .attr('y2', yScale(lineData[0].y))
        .transition()
        .delay(n * 50 + 500)
        .duration(1000)
        .attr('x2', xScale(lineData[1].x))
        .attr('y2', yScale(lineData[1].y));
    } else {
      regLine
        .attr('x2', xScale(lineData[1].x))
        .attr('y2', yScale(lineData[1].y))
        .attr('opacity', 0.6);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

const Ch8Visualization = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 300;
    const height = 200;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Network visualization
    const nodes = d3.range(7).map(i => ({
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
    const linkElements = svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => nodes[d.source].x)
      .attr('y1', d => nodes[d.source].y)
      .attr('stroke', '#525252')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);
    
    if (isActive) {
      linkElements
        .attr('x2', d => nodes[d.source].x)
        .attr('y2', d => nodes[d.source].y)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('x2', d => nodes[d.target].x)
        .attr('y2', d => nodes[d.target].y);
    } else {
      linkElements
        .attr('x2', d => nodes[d.target].x)
        .attr('y2', d => nodes[d.target].y);
    }
    
    // Draw nodes
    const nodeElements = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', '#a78bfa');
    
    if (isActive) {
      setTimeout(() => {
        nodeElements
          .attr('r', 0)
          .transition()
          .delay((d, i) => i * 100)
          .duration(300)
          .attr('r', 8);
      }, links.length * 100);
    } else {
      nodeElements.attr('r', 6).attr('opacity', 0.7);
    }
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full h-full" />;
};

// Chapter card component
const ChapterCard = ({ chapter, index, visualization: Visualization }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = ['teal', 'blue', 'purple', 'emerald', 'orange', 'pink', 'indigo', 'violet'];
  
  return (
    <div
      className="bg-neutral-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-48 bg-gradient-to-br from-neutral-900 to-neutral-800 relative overflow-hidden">
        <Visualization isActive={isHovered} />
      </div>
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">
            Chapter {index + 1}
          </h3>
          <span className="text-sm text-neutral-400">
            {chapter.duration}
          </span>
        </div>
        <h4 className={`text-xl font-bold mb-3 text-${colors[index]}-400`}>
          {chapter.title}
        </h4>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {chapter.description}
        </p>
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <Link href={`/chapter${index + 1}`}>
            <Button 
              variant="primary" 
              size="sm" 
              className={`w-full bg-${colors[index]}-600 hover:bg-${colors[index]}-700 group`}
            >
              Begin Learning
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Floating mathematical symbols background
const FloatingSymbols = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Extended set of mathematical symbols
  const symbolSets = [
    // Layer 1: Large, slow-moving symbols
    { symbols: ['∑', '∫', '∞', 'π', 'Φ'], size: 'text-6xl', opacity: 'text-neutral-800/10', speed: 0.2 },
    // Layer 2: Medium symbols
    { symbols: ['∂', 'μ', 'σ', 'Δ', 'λ', 'Ω', 'θ', 'ρ', 'χ²', 'α', 'β', 'γ'], size: 'text-4xl', opacity: 'text-neutral-700/15', speed: 0.35 },
    // Layer 3: Small, faster symbols
    { symbols: ['±', '√', '≈', '≠', '≤', '≥', '∈', '∉', '∪', '∩', '⊂', '⊃', '∀', '∃', '∇', 'ℝ', 'ℕ', 'ℤ'], size: 'text-2xl', opacity: 'text-neutral-600/10', speed: 0.5 }
  ];
  
  // Only render symbols after mount to avoid hydration issues
  if (!mounted) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" />;
  }
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {symbolSets.map((set, layerIndex) => (
        <div key={layerIndex} className="absolute inset-0">
          {/* Generate multiple instances of each symbol across the page */}
          {[...Array(3)].map((_, instanceIndex) => (
            set.symbols.map((symbol, symbolIndex) => {
              const totalIndex = instanceIndex * set.symbols.length + symbolIndex;
              const randomX = (totalIndex * 13 + layerIndex * 7) % 100;
              const randomY = (totalIndex * 17 + layerIndex * 11) % 100;
              const randomDelay = (totalIndex * 0.5) % 10;
              const randomRotation = totalIndex * 45;
              
              return (
                <div
                  key={`${layerIndex}-${instanceIndex}-${symbolIndex}`}
                  className={`absolute ${set.size} ${set.opacity} select-none`}
                  style={{
                    left: `${randomX}%`,
                    top: `${randomY}%`,
                    transform: `translateY(${scrollY * set.speed * 0.1}px) translateX(${Math.sin(scrollY * 0.0005 + randomDelay) * 30}px) rotate(${randomRotation + scrollY * 0.02}deg)`,
                    animation: `float ${30 + randomDelay * 2}s infinite ease-in-out ${randomDelay}s`,
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {symbol}
                </div>
              );
            })
          ))}
        </div>
      ))}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1); 
              opacity: 1;
            }
            20% { 
              transform: translateY(-15px) translateX(8px) scale(1.02); 
              opacity: 0.9;
            }
            40% { 
              transform: translateY(8px) translateX(-12px) scale(0.98); 
              opacity: 1;
            }
            60% { 
              transform: translateY(-8px) translateX(15px) scale(1.01); 
              opacity: 0.95;
            }
            80% { 
              transform: translateY(12px) translateX(-8px) scale(0.99); 
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  );
};

// Hero section
const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 animate-gradient">
            Probability Lab
          </span>
        </h1>
        <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
          Learn by doing. Explore interactive visualizations that make complex concepts click instantly.
        </p>
        <p className="text-lg text-neutral-400 mb-10 max-w-3xl mx-auto">
          An educational platform for engineering students to master probability, statistics, and linear regression through visual and interactive tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chapter1">
            <Button size="lg" variant="primary" className="group">
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#chapters">
            <Button size="lg" className="bg-neutral-700 hover:bg-neutral-600">
              Explore Curriculum
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Main component
export default function LandingAcademic() {
  const [currentSection, setCurrentSection] = useState(-1);
  const sectionRefs = useRef([]);
  
  const chapters = [
    {
      title: "Introduction to Probabilities",
      description: "Master fundamental concepts including sample spaces, events, and probability rules through interactive Venn diagrams and simulations.",
      duration: "12 sections",
      visualization: Ch1Visualization
    },
    {
      title: "Discrete Random Variables",
      description: "Explore probability mass functions, expected values, and variance. Work with binomial, geometric, and Poisson distributions.",
      duration: "15 sections",
      visualization: Ch2Visualization
    },
    {
      title: "Continuous Random Variables",
      description: "Understand probability density functions, cumulative distributions, and work with normal, exponential, and gamma distributions.",
      duration: "18 sections",
      visualization: Ch3Visualization
    },
    {
      title: "Descriptive Statistics & Sampling",
      description: "Learn data summarization techniques and observe how sample statistics behave through interactive sampling experiments.",
      duration: "14 sections",
      visualization: Ch4Visualization
    },
    {
      title: "Estimation",
      description: "Master point estimation, construct confidence intervals, and understand the principles of maximum likelihood estimation.",
      duration: "16 sections",
      visualization: Ch5Visualization
    },
    {
      title: "Hypothesis Testing",
      description: "Build intuition for statistical tests, p-values, significance levels, and power through interactive simulations.",
      duration: "20 sections",
      visualization: Ch6Visualization
    },
    {
      title: "Linear Regression & Correlation",
      description: "Analyze relationships between variables, fit models, and understand residuals through dynamic visualizations.",
      duration: "17 sections",
      visualization: Ch7Visualization
    },
    {
      title: "Advanced Topics",
      description: "Explore multivariate distributions, Bayesian inference, and modern statistical methods beyond the core curriculum.",
      duration: "10 sections",
      visualization: Ch8Visualization
    }
  ];
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setCurrentSection(index);
        }
      });
    }, observerOptions);
    
    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Floating mathematical symbols background */}
      <FloatingSymbols />
      
      {/* Journey Progress Indicator */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="w-20 h-[600px]">
          <JourneyPath currentSection={currentSection} />
        </div>
      </div>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Introduction */}
      <section className="py-16 px-4 lg:pl-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-neutral-300 leading-relaxed">
            This comprehensive course explores key concepts in probability, statistics, and linear regression 
            using visual and interactive tools. Each section is designed to build intuition through 
            experimentation, allowing you to observe outcomes and recognize important patterns.
          </p>
        </div>
      </section>
      
      {/* Chapter Grid */}
      <section id="chapters" className="py-20 px-4 lg:pl-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Course Curriculum
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                ref={el => sectionRefs.current[index] = el}
                data-index={index}
              >
                <ChapterCard
                  chapter={chapter}
                  index={index}
                  visualization={chapter.visualization}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Course Stats */}
      <section className="py-16 px-4 lg:pl-32 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '8', label: 'Chapters' },
              { value: '122', label: 'Interactive Widgets' },
              { value: '400+', label: 'Exercises' },
              { value: '24', label: 'Hours of Content' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-teal-400 mb-2">{stat.value}</div>
                <div className="text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 lg:pl-32 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-neutral-400 mb-6">
            Each widget is designed to support interactive learning and develop stronger intuition 
            about the concepts behind data analysis and statistical reasoning.
          </p>
          <Link href="/chapter1">
            <Button variant="primary" size="lg" className="group">
              Begin Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}