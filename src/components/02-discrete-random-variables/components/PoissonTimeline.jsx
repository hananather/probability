"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { generatePoissonProcess } from "@/utils/distributions";
import { GraphContainer } from '../../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../../lib/design-system';

// Enhanced color scheme for Poisson timeline
const colorScheme = {
  primary: '#60A5FA', // bright blue-400
  primaryLight: '#93c5fd', // blue-300
  secondary: '#facc15', // bright yellow
  tertiary: '#10b981', // bright emerald-500
  area: 'rgba(96, 165, 250, 0.3)', // blue with moderate opacity for window
  grid: '#6b7280', // brighter gray-500 for better visibility
  event: '#3b82f6', // blue-600 for events
  gradients: {
    window: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)',
    event: 'linear-gradient(135deg, #60A5FA 0%, #3b82f6 100%)'
  }
};

const MAX_EVENTS = 100; // Maximum events to store to prevent memory issues

export function PoissonTimeline({ lambda, windowSize, isAnimating }) {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const eventsRef = useRef([]);
  const windowPosRef = useRef(3);
  const [eventCount, setEventCount] = useState(0);
  
  // Generate new events
  const generateEvents = useCallback(() => {
    if (lambda <= 0) {
      eventsRef.current = [];
      setEventCount(0);
      return;
    }
    
    const newEvents = generatePoissonProcess(lambda, 10);
    eventsRef.current = newEvents.slice(-MAX_EVENTS); // Limit stored events
    setEventCount(eventsRef.current.length);
  }, [lambda]);
  
  // Count events in window
  const countEventsInWindow = useCallback(() => {
    const windowStart = windowPosRef.current;
    const windowEnd = windowStart + windowSize;
    return eventsRef.current.filter(e => e >= windowStart && e < windowEnd).length;
  }, [windowSize]);
  
  // Draw visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = svg.node().getBoundingClientRect().width;
    const height = 200;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    
    svg.attr('height', height);
    
    // Timeline scale
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([margin.left, width - margin.right]);
    
    const g = svg.append('g');
    
    // Timeline axis
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(10))
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', colorScheme.grid)
      .attr('stroke-width', 2);
    
    // Time markers
    g.selectAll('.time-marker')
      .data(d3.range(0, 11))
      .enter()
      .append('g')
      .attr('class', 'time-marker')
      .attr('transform', d => `translate(${xScale(d)}, ${height / 2})`)
      .each(function(d) {
        const marker = d3.select(this);
        marker.append('line')
          .attr('y1', -5)
          .attr('y2', 5)
          .attr('stroke', colorScheme.grid)
          .attr('stroke-width', 1);
        marker.append('text')
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('fill', colors.chart.text)
          .style('font-size', '12px')
          .text(d);
      });
    
    // Counting window
    const windowGroup = g.append('g')
      .attr('class', 'counting-window')
      .attr('cursor', 'move');
    
    const updateWindow = () => {
      const windowStart = windowPosRef.current;
      const windowEnd = windowStart + windowSize;
      
      // Ensure window stays within bounds
      if (windowEnd > 10) {
        windowPosRef.current = 10 - windowSize;
      }
      if (windowPosRef.current < 0) {
        windowPosRef.current = 0;
      }
      
      windowGroup.selectAll('*').remove();
      
      // Enhanced window background with gradient
      windowGroup.append('rect')
        .attr('x', xScale(windowPosRef.current))
        .attr('y', 20)
        .attr('width', xScale(windowPosRef.current + windowSize) - xScale(windowPosRef.current))
        .attr('height', height - 60)
        .attr('fill', colorScheme.area)
        .attr('stroke', colorScheme.primary)
        .attr('stroke-width', 2.5)
        .attr('rx', 6)
        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');
      
      // Window label
      windowGroup.append('text')
        .attr('x', xScale(windowPosRef.current + windowSize / 2))
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.primary)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Window: ${windowSize} units`);
      
      // Enhanced event count display
      const count = countEventsInWindow();
      const countGroup = windowGroup.append('g')
        .attr('transform', `translate(${xScale(windowPosRef.current + windowSize / 2)}, ${height - 15})`);
      
      countGroup.append('rect')
        .attr('x', -30)
        .attr('y', -12)
        .attr('width', 60)
        .attr('height', 24)
        .attr('rx', 12)
        .attr('fill', '#f3f4f6')
        .attr('stroke', colorScheme.secondary)
        .attr('stroke-width', 1.5);
      
      countGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', colorScheme.secondary)
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(count);
    };
    
    // Dragging
    const drag = d3.drag()
      .on('start', () => {
        windowGroup.style('cursor', 'grabbing');
      })
      .on('drag', (event) => {
        const newX = xScale.invert(event.x);
        windowPosRef.current = Math.max(0, Math.min(10 - windowSize, newX));
        updateWindow();
        updateEvents();
      })
      .on('end', () => {
        windowGroup.style('cursor', 'move');
      });
    
    windowGroup.call(drag);
    
    // Events
    const eventsGroup = g.append('g').attr('class', 'events');
    
    const updateEvents = () => {
      const events = eventsGroup.selectAll('.event')
        .data(eventsRef.current, (d, i) => i);
      
      events.exit()
        .transition()
        .duration(300)
        .attr('opacity', 0)
        .remove();
      
      const enterEvents = events.enter()
        .append('g')
        .attr('class', 'event')
        .attr('transform', d => `translate(${xScale(d)}, ${height / 2})`);
      
      enterEvents.append('line')
        .attr('y1', -30)
        .attr('y2', 30)
        .attr('stroke', colorScheme.event)
        .attr('stroke-width', 2.5)
        .attr('opacity', 0)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
        .transition()
        .duration(300)
        .attr('opacity', 0.9);
      
      // Create gradient for event circles
      const gradientId = `event-gradient-${Date.now()}`;
      const gradient = svg.append('defs')
        .append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '50%')
        .attr('cy', '40%')
        .attr('r', '50%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScheme.primaryLight)
        .attr('stop-opacity', 1);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScheme.event)
        .attr('stop-opacity', 0.9);
      
      enterEvents.append('circle')
        .attr('r', 0)
        .attr('fill', `url(#${gradientId})`)
        .attr('stroke', colorScheme.event)
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
        .transition()
        .duration(300)
        .attr('r', 5);
      
      updateWindow();
    };
    
    // Initial setup
    generateEvents();
    updateEvents();
    
    // Animation using requestAnimationFrame
    if (isAnimating && lambda > 0) {
      let lastTime = 0;
      const animate = (timestamp) => {
        if (timestamp - lastTime > 2000) {
          generateEvents();
          updateEvents();
          lastTime = timestamp;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      svg.selectAll('*').remove();
    };
  }, [lambda, windowSize, isAnimating, generateEvents, countEventsInWindow]);
  
  // Handle lambda = 0 case
  if (lambda <= 0) {
    return (
      <GraphContainer title="Event Timeline">
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p>Set λ &gt; 0 to see events</p>
        </div>
      </GraphContainer>
    );
  }
  
  return (
    <GraphContainer title="Event Timeline">
      <svg ref={svgRef} className="w-full" />
    </GraphContainer>
  );
}