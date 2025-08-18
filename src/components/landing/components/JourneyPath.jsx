'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";

const JourneyPath = React.memo(({ currentSection, scrollProgress = 0 }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Chapter configuration with unique colors for each chapter
  const chapters = [
    { name: 'Introduction', color: '#3b82f6' },    // Blue
    { name: 'Discrete', color: '#10b981' },        // Emerald
    { name: 'Continuous', color: '#f59e0b' },      // Amber
    { name: 'Statistics', color: '#8b5cf6' },      // Purple
    { name: 'Estimation', color: '#f97316' },      // Orange
    { name: 'Hypothesis', color: '#ef4444' },      // Red
    { name: 'Regression', color: '#06b6d4' }       // Cyan
  ];
  
  // Beautiful curved journey path for 7 chapters - defined outside useEffect
  const pathData = [
    { x: 40, y: 70 },   // Ch 1
    { x: 25, y: 130 },  // Ch 2
    { x: 55, y: 190 },  // Ch 3
    { x: 30, y: 250 },  // Ch 4
    { x: 50, y: 310 },  // Ch 5
    { x: 35, y: 370 },  // Ch 6
    { x: 45, y: 430 }   // Ch 7
  ];
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 80;
    const height = 500;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Only redraw if SVG is empty (first render)
    if (svg.select('.milestone').empty()) {
      svg.selectAll('*').remove();
      
      // Use pathData defined above
      const pathDataToUse = [
        ...pathData
      ];
      
      const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis);
      
      // Background path (subtle dotted line)
      svg.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#3f3f46')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.5);
      
      // Progress path
      const pathLength = svg.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .node().getTotalLength();
      
      // Create gradient for progress path
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'progressGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', height);
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6');
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#8b5cf6');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#06b6d4');
      
      svg.append('path')
        .datum(pathData)
        .attr('class', 'progress-path')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'url(#progressGradient)')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-linecap', 'round');
      
      // Milestone dots for 7 chapters
      const milestones = svg.selectAll('.milestone')
        .data(pathData)
        .enter()
        .append('g')
        .attr('class', 'milestone')
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event, d) {
          const index = pathData.indexOf(d);
          setHoveredIndex(index);
          
          // Hover animation
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .attr('r', 10)
            .attr('stroke-width', 4);
            
          d3.select(this).select('.milestone-dot')
            .transition()
            .duration(200)
            .attr('r', 4);
        })
        .on('mouseleave', function(event, d) {
          const index = pathData.indexOf(d);
          const isActive = index <= currentSection;
          
          setHoveredIndex(null);
          
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .attr('r', index === currentSection ? 9 : 8)
            .attr('stroke-width', 3);
            
          d3.select(this).select('.milestone-dot')
            .transition()
            .duration(200)
            .attr('r', index === currentSection ? 4 : 3);
        });
      
      // Outer circle with chapter colors
      milestones.append('circle')
        .attr('class', 'milestone-circle')
        .attr('r', 8)
        .attr('fill', '#18181b')
        .attr('stroke', (d, idx) => {
          const chapterIndex = pathData.indexOf(d);
          return chapters[chapterIndex] ? chapters[chapterIndex].color : '#525252';
        })
        .attr('stroke-width', 3)  // Thicker border for better visibility
        .attr('stroke-opacity', 0.8)  // Make colors more visible
        .style('transition', 'all 0.3s ease');
      
      // Inner dot
      milestones.append('circle')
        .attr('class', 'milestone-dot')
        .attr('r', 3)
        .attr('fill', '#3f3f46')
        .attr('pointer-events', 'none')
        .style('transition', 'all 0.3s ease');
    }
    
    // Update based on currentSection (starts at -1 for no progress)
    const activeIndex = Math.max(-1, Math.min(6, currentSection));
    
    // Update progress path based on scroll progress for smooth animation
    const pathLength = svg.select('.progress-path').node()?.getTotalLength() || 0;
    
    // Use scrollProgress for smooth line animation
    if (scrollProgress > 0) {
      // Map scroll progress to the path (with some adjustments for better visual)
      // Scale it so the line doesn't fill completely until near the end
      const scaledProgress = Math.min(1, scrollProgress * 0.9 + 0.05); // Start filling earlier, don't fill 100% until very end
      
      svg.select('.progress-path')
        .transition()
        .duration(200) // Faster transition for smoother response
        .ease(d3.easeLinear) // Linear for direct correlation with scroll
        .attr('stroke-dashoffset', pathLength * (1 - scaledProgress))
        .attr('opacity', 0.8);
    } else {
      // At the very top, hide the line completely
      svg.select('.progress-path')
        .transition()
        .duration(200)
        .attr('stroke-dashoffset', pathLength)
        .attr('opacity', 0);
    }
    
    // Update milestone appearance based on scroll progress
    // Calculate which milestones should be active based on scroll
    const totalSections = 7;
    const progressPerSection = 1 / totalSections;
    const activeMilestones = Math.floor(scrollProgress / progressPerSection);
    
    svg.selectAll('.milestone-circle')
      .transition()
      .duration(400)
      .attr('fill', (d, idx) => {
        // Color milestones based on scroll progress
        const milestoneIndex = pathData.indexOf(d);
        const milestoneProgress = (milestoneIndex + 1) * progressPerSection;
        if (scrollProgress >= milestoneProgress - progressPerSection * 0.5) {
          return chapters[milestoneIndex] ? chapters[milestoneIndex].color : '#525252';
        }
        return '#18181b';
      })
      .attr('stroke-opacity', (d, idx) => {
        const milestoneIndex = pathData.indexOf(d);
        if (milestoneIndex === activeIndex) return 1;     // Full opacity for active
        if (milestoneIndex < activeIndex) return 0.7;     // Good visibility for visited
        return 0.5;  // Still visible for upcoming chapters
      })
      .attr('r', (d, idx) => {
        const milestoneIndex = pathData.indexOf(d);
        return milestoneIndex === activeIndex ? 9 : 8;
      });
    
    svg.selectAll('.milestone-dot')
      .transition()
      .duration(400)
      .attr('fill', (d, idx) => {
        // Color dots based on scroll progress
        const milestoneIndex = pathData.indexOf(d);
        const milestoneProgress = (milestoneIndex + 1) * progressPerSection;
        if (scrollProgress >= milestoneProgress - progressPerSection * 0.5) {
          return '#ffffff';
        }
        return '#3f3f46';
      })
      .attr('r', (d, idx) => {
        const milestoneIndex = pathData.indexOf(d);
        return milestoneIndex === activeIndex ? 4 : 3;
      });
    
    // Clear any existing pulse animations
    svg.selectAll('.pulse-circle').remove();
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    // Subtle pulsing effect on current milestone
    if (activeIndex >= 0 && activeIndex < 7) {
      const currentMilestone = svg.selectAll('.milestone')
        .filter(function(d, i) { return i === activeIndex; });
      
      const pulseCircle = () => {
        const pulse = currentMilestone.append('circle')
          .attr('class', 'pulse-circle')
          .attr('r', 9)
          .attr('fill', 'none')
          .attr('stroke', chapters[activeIndex].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
        
        pulse.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', 20)
          .attr('opacity', 0)
          .remove();
        
        animationRef.current = setTimeout(pulseCircle, 3000);
      };
      
      pulseCircle();
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [currentSection, scrollProgress]);
  
  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Subtle tooltip on hover */}
      {hoveredIndex !== null && (
        <div 
          className="absolute left-full ml-2 pointer-events-none z-50"
          style={{ 
            top: `${70 + (hoveredIndex * 60)}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-neutral-800/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-neutral-700">
            Chapter {hoveredIndex + 1}
          </div>
        </div>
      )}
    </div>
  );
});

JourneyPath.displayName = 'JourneyPath';

export default JourneyPath;