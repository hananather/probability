'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";

const JourneyPath = React.memo(({ currentSection }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredChapter, setHoveredChapter] = useState(null);
  
  // Chapter information for the 7 core chapters
  const chapters = [
    { name: 'Introduction to Probabilities', icon: '∩', shortName: 'Ch 1' },
    { name: 'Discrete Random Variables', icon: 'X', shortName: 'Ch 2' },
    { name: 'Continuous Random Variables', icon: '∫', shortName: 'Ch 3' },
    { name: 'Descriptive Statistics', icon: 'μ', shortName: 'Ch 4' },
    { name: 'Estimation', icon: '̂θ', shortName: 'Ch 5' },
    { name: 'Hypothesis Testing', icon: 'H₀', shortName: 'Ch 6' },
    { name: 'Linear Regression', icon: 'ρ', shortName: 'Ch 7' }
  ];
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 120;
    const height = 700;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Only redraw if SVG is empty (first render)
    if (svg.select('path').empty()) {
      svg.selectAll('*').remove();
      
      // Journey path data for 7 chapters with elegant curved path
      const pathData = [
        { x: 60, y: 50 },   // Start point
        { x: 35, y: 120 },  // Ch 1
        { x: 75, y: 190 },  // Ch 2
        { x: 45, y: 260 },  // Ch 3
        { x: 80, y: 330 },  // Ch 4
        { x: 50, y: 400 },  // Ch 5
        { x: 70, y: 470 },  // Ch 6
        { x: 60, y: 540 }   // Ch 7
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
        .attr('stroke', '#52525b')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '6,6')
        .attr('opacity', 0.6);
      
      // Progress path
      const pathLength = svg.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .node().getTotalLength();
      
      svg.append('path')
        .datum(pathData)
        .attr('class', 'progress-path')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'url(#progressGradient)')
        .attr('stroke-width', 4)
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-linecap', 'round');
      
      // Add gradient definition for progress path
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'progressGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', height);
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#06b6d4');
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#14b8a6');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#10b981');
      
      // Chapter milestone groups (skip first point, use only 7 chapters)
      const milestones = svg.selectAll('.milestone')
        .data(pathData.slice(1)) // Skip start point, use 7 chapters
        .enter()
        .append('g')
        .attr('class', 'milestone')
        .attr('transform', (d, i) => `translate(${d.x}, ${d.y})`)
        .style('cursor', 'pointer');
      
      // Outer ring for milestone
      milestones.append('circle')
        .attr('class', 'milestone-ring')
        .attr('r', 14)
        .attr('fill', 'none')
        .attr('stroke', '#52525b')
        .attr('stroke-width', 2)
        .attr('opacity', 0.3);
      
      // Main milestone circle
      milestones.append('circle')
        .attr('class', 'milestone-circle')
        .attr('r', 10)
        .attr('fill', '#27272a')
        .attr('stroke', '#52525b')
        .attr('stroke-width', 2);
      
      // Chapter number text
      milestones.append('text')
        .attr('class', 'milestone-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#71717a')
        .text((d, i) => i + 1);
      
      // Add hover effects
      milestones
        .on('mouseenter', function(event, d, i) {
          const index = pathData.slice(1).indexOf(d);
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .attr('r', 12);
          d3.select(this).select('.milestone-ring')
            .transition()
            .duration(200)
            .attr('opacity', 0.6);
        })
        .on('mouseleave', function(event, d) {
          const index = pathData.slice(1).indexOf(d);
          const isActive = index <= currentSection;
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .attr('r', index === currentSection ? 12 : 10);
          d3.select(this).select('.milestone-ring')
            .transition()
            .duration(200)
            .attr('opacity', isActive ? 0.8 : 0.3);
        });
    }
    
    // Update progress and milestones based on currentSection (7 chapters max)
    // Start from -1 (no progress) to 6 (all 7 chapters complete)
    const adjustedSection = Math.min(currentSection, 6);
    const progress = adjustedSection < 0 ? 0 : (adjustedSection + 1) / 7;
    const pathLength = svg.select('.progress-path').node()?.getTotalLength() || 0;
    
    svg.select('.progress-path')
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', pathLength * (1 - progress));
    
    // Update milestone states
    svg.selectAll('.milestone-circle')
      .transition()
      .duration(400)
      .attr('fill', (d, i) => {
        if (i <= adjustedSection) {
          return i === adjustedSection ? '#06b6d4' : '#14b8a6';
        }
        return '#27272a';
      })
      .attr('stroke', (d, i) => {
        if (i <= adjustedSection) {
          return i === adjustedSection ? '#0ea5e9' : '#10b981';
        }
        return '#52525b';
      })
      .attr('r', (d, i) => i === adjustedSection ? 12 : 10);
    
    svg.selectAll('.milestone-ring')
      .transition()
      .duration(400)
      .attr('stroke', (d, i) => i <= adjustedSection ? '#14b8a6' : '#52525b')
      .attr('opacity', (d, i) => i <= adjustedSection ? 0.8 : 0.3);
    
    svg.selectAll('.milestone-text')
      .transition()
      .duration(400)
      .attr('fill', (d, i) => {
        if (i <= adjustedSection) {
          return i === adjustedSection ? '#ffffff' : '#f4f4f5';
        }
        return '#71717a';
      })
      .attr('font-weight', (d, i) => i === adjustedSection ? 'bold' : 'normal');
    
    // Enhanced pulsing effect on current section with "You are here" indicator
    if (adjustedSection >= 0 && adjustedSection < 7) {
      const currentMilestone = svg.selectAll('.milestone')
        .filter((d, i) => i === adjustedSection);
      
      // Add "You are here" indicator
      currentMilestone.selectAll('.current-indicator').remove();
      const indicator = currentMilestone.append('g').attr('class', 'current-indicator');
      
      // Arrow pointing to current chapter
      indicator.append('path')
        .attr('d', 'M -25 -5 L -15 0 L -25 5 Z')
        .attr('fill', '#06b6d4')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
      
      indicator.append('text')
        .attr('x', -30)
        .attr('y', 0)
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('fill', '#06b6d4')
        .attr('opacity', 0)
        .text('You are here')
        .transition()
        .duration(500)
        .delay(200)
        .attr('opacity', 1);
      
      const pulseCircle = () => {
        if (adjustedSection !== Math.min(currentSection, 6)) return; // Stop if section changed
        
        const pulse = currentMilestone.append('circle')
          .attr('class', 'pulse-ring')
          .attr('r', 12)
          .attr('fill', 'none')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
        
        pulse.transition()
          .duration(2000)
          .ease(d3.easeCubicOut)
          .attr('r', 25)
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .remove();
        
        animationRef.current = setTimeout(pulseCircle, 2500);
      };
      
      // Clear previous animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      pulseCircle();
    } else {
      // Remove current indicators if no active section
      svg.selectAll('.current-indicator').remove();
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [currentSection]);
  
  // Calculate display values outside useEffect for render
  const adjustedSection = Math.min(currentSection, 6);
  
  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Journey Title */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-semibold text-cyan-400 mb-1">
          Learning Journey
        </div>
        <div className="text-xs text-gray-400">
          {adjustedSection >= 0 ? `${adjustedSection + 1}/7` : '0/7'} Complete
        </div>
      </div>
      
      {/* Chapter tooltip */}
      {hoveredChapter !== null && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600 max-w-48">
            <div className="font-semibold text-sm text-cyan-400">
              {chapters[hoveredChapter]?.shortName}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {chapters[hoveredChapter]?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

JourneyPath.displayName = 'JourneyPath';

export default JourneyPath;