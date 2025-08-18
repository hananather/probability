'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";

/**
 * Straight-line version of JourneyPath for chapter hub pages
 * Features a clean vertical line with hover effects and chapter colors
 */
const JourneyPathStraight = React.memo(({ currentSection, scrollProgress = 0, compact = false }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Chapter configuration with unique colors for each chapter
  const chapters = [
    { name: 'Introduction', color: '#3b82f6', shortName: 'Ch 1' },    // Blue
    { name: 'Discrete', color: '#10b981', shortName: 'Ch 2' },        // Emerald
    { name: 'Continuous', color: '#f59e0b', shortName: 'Ch 3' },      // Amber
    { name: 'Statistics', color: '#8b5cf6', shortName: 'Ch 4' },      // Purple
    { name: 'Estimation', color: '#f97316', shortName: 'Ch 5' },      // Orange
    { name: 'Hypothesis', color: '#ef4444', shortName: 'Ch 6' },      // Red
    { name: 'Regression', color: '#06b6d4', shortName: 'Ch 7' }       // Cyan
  ];
  
  // Calculate path data based on compact prop - defined outside useEffect
  const width = compact ? 60 : 80;
  const height = compact ? 400 : 500;
  const centerX = width / 2;
  const spacing = compact ? 50 : 60;
  const startY = compact ? 50 : 70;
  
  // Simple vertical path with equal spacing
  const pathData = chapters.map((_, i) => ({
    x: centerX,
    y: startY + (i * spacing)
  }));
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Only redraw if SVG is empty (first render)
    if (svg.select('.milestone').empty()) {
      svg.selectAll('*').remove();
      
      // Background line (subtle)
      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', startY)
        .attr('x2', centerX)
        .attr('y2', startY + ((chapters.length - 1) * spacing))
        .attr('stroke', '#27272a')
        .attr('stroke-width', 2);
      
      // Progress line with gradient
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'straightProgressGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', startY)
        .attr('x2', 0).attr('y2', startY + ((chapters.length - 1) * spacing));
      
      chapters.forEach((chapter, index) => {
        gradient.append('stop')
          .attr('offset', `${(index / (chapters.length - 1)) * 100}%`)
          .attr('stop-color', chapter.color);
      });
      
      svg.append('line')
        .attr('class', 'progress-line')
        .attr('x1', centerX)
        .attr('y1', startY)
        .attr('x2', centerX)
        .attr('y2', startY)
        .attr('stroke', 'url(#straightProgressGradient)')
        .attr('stroke-width', 3)
        .attr('opacity', 0);
      
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
          
          // Hover animation with smooth scaling
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .attr('r', compact ? 8 : 10)
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1);
            
          d3.select(this).select('.milestone-dot')
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .attr('r', compact ? 3 : 4);
            
          // Add hover ring effect
          d3.select(this).append('circle')
            .attr('class', 'hover-ring')
            .attr('r', compact ? 8 : 10)
            .attr('fill', 'none')
            .attr('stroke', chapters[index].color)
            .attr('stroke-width', 1)
            .attr('opacity', 0.5)
            .transition()
            .duration(300)
            .attr('r', compact ? 15 : 18)
            .attr('opacity', 0)
            .remove();
        })
        .on('mouseleave', function(event, d) {
          const index = pathData.indexOf(d);
          const isActive = index <= currentSection;
          
          setHoveredIndex(null);
          
          d3.select(this).select('.milestone-circle')
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .attr('r', index === currentSection ? (compact ? 7 : 9) : (compact ? 6 : 8))
            .attr('stroke-width', 2)
            .attr('stroke-opacity', () => {
              if (index === currentSection) return 0.8;
              if (index < currentSection) return 0.3;
              return 0.1;
            });
            
          d3.select(this).select('.milestone-dot')
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .attr('r', index === currentSection ? (compact ? 3 : 4) : (compact ? 2 : 3));
        });
      
      // Outer circle with chapter colors
      milestones.append('circle')
        .attr('class', 'milestone-circle')
        .attr('r', compact ? 6 : 8)
        .attr('fill', '#18181b')
        .attr('stroke', (d, idx) => {
          const chapterIndex = pathData.indexOf(d);
          return chapters[chapterIndex] ? chapters[chapterIndex].color : '#525252';
        })
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.1)
        .style('transition', 'all 0.3s ease');
      
      // Inner dot
      milestones.append('circle')
        .attr('class', 'milestone-dot')
        .attr('r', compact ? 2 : 3)
        .attr('fill', '#3f3f46')
        .attr('pointer-events', 'none')
        .style('transition', 'all 0.3s ease');
        
      // Chapter numbers (optional, only if not compact)
      if (!compact) {
        milestones.append('text')
          .attr('class', 'milestone-number')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '9')
          .attr('font-weight', '600')
          .attr('fill', '#71717a')
          .attr('pointer-events', 'none')
          .text((d, i) => i + 1);
      }
    }
    
    // Update based on currentSection
    const activeIndex = Math.max(-1, Math.min(6, currentSection));
    
    // Update progress line based on scroll progress for smooth animation
    const maxY = startY + ((chapters.length - 1) * spacing);
    
    if (scrollProgress > 0) {
      // Map scroll progress to the line length
      const targetY = startY + (scrollProgress * ((chapters.length - 1) * spacing));
      
      svg.select('.progress-line')
        .transition()
        .duration(200) // Faster for smooth response
        .ease(d3.easeLinear)
        .attr('y2', Math.min(targetY, maxY))
        .attr('opacity', 0.8);
    } else {
      // At the very top, hide the line
      svg.select('.progress-line')
        .transition()
        .duration(200)
        .attr('y2', startY)
        .attr('opacity', 0);
    }
    
    // Update milestone appearance based on scroll progress
    const progressPerSection = 1 / chapters.length;
    
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
        if (milestoneIndex === activeIndex) return 0.8;
        if (milestoneIndex < activeIndex) return 0.3;
        return 0.1;
      })
      .attr('r', (d, idx) => {
        const milestoneIndex = pathData.indexOf(d);
        if (milestoneIndex === activeIndex) return compact ? 7 : 9;
        return compact ? 6 : 8;
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
        if (milestoneIndex === activeIndex) return compact ? 3 : 4;
        return compact ? 2 : 3;
      });
      
    // Update numbers if present
    svg.selectAll('.milestone-number')
      .transition()
      .duration(400)
      .attr('fill', (d, idx) => {
        const milestoneIndex = pathData.indexOf(d);
        if (milestoneIndex <= activeIndex) return '#ffffff';
        return '#71717a';
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
          .attr('r', compact ? 7 : 9)
          .attr('fill', 'none')
          .attr('stroke', chapters[activeIndex].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
        
        pulse.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', compact ? 15 : 20)
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
  }, [currentSection, scrollProgress, compact]);
  
  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Tooltip on hover */}
      {hoveredIndex !== null && (
        <div 
          className="absolute left-full ml-2 pointer-events-none z-50"
          style={{ 
            top: `${(compact ? 50 : 70) + (hoveredIndex * (compact ? 50 : 60))}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-neutral-800/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap border border-neutral-700 shadow-lg">
            <div className="font-semibold" style={{ color: chapters[hoveredIndex].color }}>
              {chapters[hoveredIndex].shortName}
            </div>
            <div className="text-neutral-400 text-[10px] mt-0.5">
              {chapters[hoveredIndex].name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

JourneyPathStraight.displayName = 'JourneyPathStraight';

export default JourneyPathStraight;