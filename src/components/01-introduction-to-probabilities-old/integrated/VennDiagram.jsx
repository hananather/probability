import React, { useRef, useEffect } from 'react';
import * as d3 from "@/utils/d3-utils";
import { colors } from '../../../lib/design-system';

/**
 * VennDiagram Component
 * Encapsulates all D3 logic for rendering and dragging Venn diagrams
 * Separates static elements (created once) from dynamic elements (updated on state change)
 */
export function VennDiagram({ 
  sets, 
  selectedSections, 
  onSetDrag, 
  dragEnabled = true,
  colorScheme,
  width = 800,
  height = 550 
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const scalesRef = useRef(null);
  const elementsRef = useRef({});
  
  // Initialize SVG and static elements once
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const padding = 15;
    const size = Math.min(width * 0.9, height);
    
    // Clear and setup
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    // Container for all elements
    const container = svg.append('g')
      .attr("transform", `translate(${(width - size) / 2}, ${(height - size) / 2})`);
    
    containerRef.current = container;
    
    // Setup scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([padding/2, size - padding/2]);
    const rScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([0, size/2 - padding/2]);
    
    scalesRef.current = { xScale, yScale, rScale, size };
    
    // Create static intersection sections
    createStaticSections(container, size);
    
    // Universal set label
    container.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", colors.chart.text)
      .attr("font-size", "14px")
      .attr("opacity", 0.7)
      .text("Universal Set U");
      
  }, [width, height]);
  
  // Create static sections for intersection highlighting
  function createStaticSections(container, size) {
    // Single set sections
    const singleSets = ['A', 'B', 'C'];
    singleSets.forEach((setName, index) => {
      container.append("rect")
        .attr("clip-path", `url(#${setName})`)
        .attr("class", "section single-set")
        .attr("id", `section-${setName.toLowerCase()}`)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', 'transparent')
        .attr('data-set', setName)
        .attr('data-index', index + 1);
    });
    
    // Pairwise intersections
    const pairs = [
      { sets: ['A', 'B'], id: 'ab', index: 5 },
      { sets: ['A', 'C'], id: 'ac', index: 4 },
      { sets: ['B', 'C'], id: 'bc', index: 6 }
    ];
    
    pairs.forEach(pair => {
      const g = container.append("g")
        .attr("clip-path", `url(#${pair.sets[0]})`);
      
      g.append("rect")
        .attr("clip-path", `url(#${pair.sets[1]})`)
        .attr("class", "section intersection")
        .attr("id", `section-${pair.id}`)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', 'transparent')
        .attr('data-sets', pair.sets.join(','))
        .attr('data-index', pair.index);
    });
    
    // Triple intersection
    container.append("g")
      .attr("clip-path", "url(#A)")
      .append("g")
      .attr("clip-path", "url(#B)")
      .append("rect")
      .attr("clip-path", "url(#C)")
      .attr("class", "section intersection triple")
      .attr("id", "section-abc")
      .attr('width', size)
      .attr('height', size)
      .attr('fill', 'transparent')
      .attr('data-sets', 'A,B,C')
      .attr('data-index', 7);
      
    // Universe background (area 8)
    container.append("rect")
      .attr("class", "section universe")
      .attr("id", "section-universe")
      .attr('width', size)
      .attr('height', size)
      .attr('fill', 'transparent')
      .attr('data-index', 8)
      .lower(); // Put at back
  }
  
  // Update dynamic elements when sets change
  useEffect(() => {
    if (!containerRef.current || !scalesRef.current) return;
    
    const container = containerRef.current;
    const { xScale, yScale, rScale } = scalesRef.current;
    
    // Update clip paths
    const clipPaths = container.selectAll("defs").selectAll("clipPath")
      .data(sets.filter(s => s.name !== 'U'), d => d.name);
    
    // Remove defs if exists and recreate
    container.select("defs").remove();
    const defs = container.append("defs");
    
    sets.filter(s => s.name !== 'U').forEach(set => {
      defs.append("clipPath")
        .attr("id", set.name)
        .append("circle")
        .attr('cx', xScale(set.cx))
        .attr('cy', yScale(set.cy))
        .attr('r', rScale(set.r));
    });
    
    // Update/create circles
    const circles = container.selectAll('circle.set-circle')
      .data(sets.filter(s => s.name !== 'U'), d => d.name);
    
    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', 'set-circle')
      .attr('fill', 'none')
      .attr('stroke-width', 3);
    
    circles.merge(circlesEnter)
      .attr('cx', d => xScale(d.cx))
      .attr('cy', d => yScale(d.cy))
      .attr('r', d => rScale(d.r))
      .attr('stroke', (d, i) => {
        const colors = [
          colorScheme.chart.primary,
          colorScheme.chart.secondary,
          colorScheme.chart.tertiary
        ];
        return colors[i] || colorScheme.chart.primary;
      })
      .attr('opacity', 0.8)
      .style('transition', 'stroke 0.3s ease');
    
    // Update/create labels
    const labels = container.selectAll('text.set-label')
      .data(sets.filter(s => s.name !== 'U'), d => d.name);
    
    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', 'set-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.chart.text)
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('pointer-events', 'none');
    
    labels.merge(labelsEnter)
      .attr('x', d => xScale(d.cx))
      .attr('y', d => yScale(d.cy))
      .text(d => d.name);
    
    // Store references
    elementsRef.current.circles = circles.merge(circlesEnter);
    elementsRef.current.labels = labels.merge(labelsEnter);
    
    // Apply or remove drag behavior
    if (dragEnabled) {
      applyDragBehavior();
    } else {
      removeDragBehavior();
    }
    
  }, [sets, dragEnabled, colorScheme]);
  
  // Apply smooth drag behavior
  function applyDragBehavior() {
    if (!elementsRef.current.circles || !scalesRef.current) return;
    
    const { xScale, yScale } = scalesRef.current;
    
    const drag = d3.drag()
      .on('start', function(event, d) {
        d3.select(this)
          .style('cursor', 'grabbing')
          .raise(); // Bring to front
      })
      .on('drag', function(event, d) {
        // Calculate new position with bounds checking
        const newX = xScale.invert(event.x);
        const newY = yScale.invert(event.y);
        const [cx, cy] = constrainToBounds(newX, newY, d.r);
        
        // Update circle position immediately
        d3.select(this)
          .attr('cx', xScale(cx))
          .attr('cy', yScale(cy));
        
        // Update corresponding label
        containerRef.current.select('text.set-label')
          .filter(label => label.name === d.name)
          .attr('x', xScale(cx))
          .attr('y', yScale(cy));
        
        // Update clip path
        containerRef.current.select(`#${d.name} circle`)
          .attr('cx', xScale(cx))
          .attr('cy', yScale(cy));
        
        // Notify parent of position during drag (for real-time updates)
        if (onSetDrag) {
          onSetDrag(d.name, { cx, cy }, false);
        }
      })
      .on('end', function(event, d) {
        d3.select(this).style('cursor', 'grab');
        
        // Final position update
        const newX = xScale.invert(event.x);
        const newY = yScale.invert(event.y);
        const [cx, cy] = constrainToBounds(newX, newY, d.r);
        
        // Notify parent of final position
        if (onSetDrag) {
          onSetDrag(d.name, { cx, cy }, true);
        }
      });
    
    elementsRef.current.circles
      .style('cursor', 'grab')
      .call(drag);
  }
  
  // Remove drag behavior
  function removeDragBehavior() {
    if (!elementsRef.current.circles) return;
    
    elementsRef.current.circles
      .style('cursor', 'default')
      .on('.drag', null);
  }
  
  // Constrain circles to rectangular bounds
  function constrainToBounds(x, y, r) {
    // Keep within [0, 1] normalized space with radius consideration
    const minX = r;
    const maxX = 1 - r;
    const minY = r;
    const maxY = 1 - r;
    
    return [
      Math.max(minX, Math.min(maxX, x)),
      Math.max(minY, Math.min(maxY, y))
    ];
  }
  
  // Update section highlighting based on selected sections
  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.selectAll('.section')
      .transition()
      .duration(200)
      .attr('fill', function() {
        const index = parseInt(this.getAttribute('data-index'));
        return selectedSections.includes(index) 
          ? colorScheme.chart.tertiary 
          : 'transparent';
      })
      .attr('opacity', function() {
        const index = parseInt(this.getAttribute('data-index'));
        return selectedSections.includes(index) ? 0.4 : 0;
      });
      
  }, [selectedSections, colorScheme]);
  
  return (
    <svg 
      ref={svgRef} 
      style={{ width: "100%", height: "100%" }}
      className="venn-diagram"
    />
  );
}