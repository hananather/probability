// Consolidated D3 imports from main package
// Using the main d3 package which includes all modules

import {
  // Selection and manipulation
  select,
  selectAll,
  selection,
  pointer,
  // Scales
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleTime,
  scaleLog,
  // Axes
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  // Shapes and lines
  line,
  area,
  arc,
  pie,
  curveLinear,
  curveBasis,
  curveCardinal,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStepAfter,
  symbol,
  symbolCircle,
  symbolSquare,
  symbolDiamond,
  linkHorizontal,
  // Transitions
  transition,
  // Drag
  drag,
  // Format
  format,
  formatPrefix,
  // Arrays
  min,
  max,
  extent,
  mean,
  median,
  sum,
  range,
  quantile,
  deviation,
  variance,
  histogram,
  rollup,
  shuffle,
  // Interpolation
  interpolate,
  interpolateRgb,
  interpolateNumber,
  // Colors
  interpolateBlues,
  interpolateRdBu,
  schemeCategory10,
  interpolateWarm,
  // Easing
  easeLinear,
  easeQuad,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackOut,
  easeBounceOut,
  easeSinInOut,
  // Random
  randomNormal,
  randomUniform,
  // Time
  timeFormat,
  timeParse,
  // Hierarchy
  hierarchy,
  tree,
  // Color
  color,
  // Timer
  interval,
  // Contour
  contours,
  // Geo
  geoPath,
  geoTransform
} from 'd3';

// Hexbin is not included in main d3 package, needs separate import
import { hexbin } from 'd3-hexbin';

// Re-export everything
export {
  // Selection
  select,
  selectAll,
  selection,
  pointer,
  // Scales
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleTime,
  scaleLog,
  // Axes
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  // Shapes
  line,
  area,
  arc,
  pie,
  curveLinear,
  curveBasis,
  curveCardinal,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStepAfter,
  symbol,
  symbolCircle,
  symbolSquare,
  symbolDiamond,
  linkHorizontal,
  // Transitions
  transition,
  // Drag
  drag,
  // Format
  format,
  formatPrefix,
  // Arrays
  min,
  max,
  extent,
  mean,
  median,
  sum,
  range,
  quantile,
  deviation,
  variance,
  histogram,
  rollup,
  shuffle,
  // Interpolation
  interpolate,
  interpolateRgb,
  interpolateNumber,
  // Colors
  interpolateBlues,
  interpolateRdBu,
  schemeCategory10,
  interpolateWarm,
  // Easing
  easeLinear,
  easeQuad,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackOut,
  easeBounceOut,
  easeSinInOut,
  // Random
  randomNormal,
  randomUniform,
  // Time
  timeFormat,
  timeParse,
  // Hierarchy
  hierarchy,
  tree,
  // Color
  color,
  // Timer
  interval,
  // Hexbin
  hexbin,
  // Contour
  contours,
  // Geo
  geoPath,
  geoTransform
};

// Utility to check if we missed any d3 functions
export const checkD3Usage = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    // Silent: D3 utils loaded for component
  }
};

// Re-export common patterns as a default object for easier migration
const d3 = {
  select,
  selectAll,
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleLog,
  axisBottom,
  axisLeft,
  line,
  drag,
  pointer,
  format,
  min,
  max,
  extent,
  mean,
  median,
  deviation,
  histogram,
  rollup,
  shuffle,
  transition,
  easeQuad,
  easeQuadInOut,
  easeCubicInOut,
  hierarchy,
  tree,
  linkHorizontal,
  color,
  interval,
  curveNatural,
  hexbin,
  interpolateWarm,
  contours,
  geoPath,
  geoTransform,
  interpolateBlues,
  area,
  curveBasis,
  range,
  interpolateRgb
};

export default d3;

// ==================== DISTRIBUTION VISUALIZATION UTILITIES ====================

/**
 * Set up an SVG element with consistent dimensions and margins
 */
export const setupDistributionSVG = (selection, dimensions, margins = {}) => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };
  const m = { ...defaultMargins, ...margins };
  
  const svg = selection
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
    
  // Clear previous content
  svg.selectAll('*').remove();
  
  // Create main group with margins
  const g = svg.append('g')
    .attr('transform', `translate(${m.left},${m.top})`);
    
  const innerWidth = dimensions.width - m.left - m.right;
  const innerHeight = dimensions.height - m.top - m.bottom;
  
  return { svg, g, innerWidth, innerHeight, margins: m };
};

/**
 * Create scales for distribution visualizations
 */
export const createDistributionScales = (data, dimensions, type = 'discrete') => {
  const { innerWidth, innerHeight } = dimensions;
  
  if (type === 'discrete') {
    const xScale = scaleBand()
      .domain(data.map(d => d.x))
      .range([0, innerWidth])
      .padding(0.1);
      
    const yScale = scaleLinear()
      .domain([0, max(data, d => d.y) * 1.1])
      .range([innerHeight, 0]);
      
    return { xScale, yScale };
  } else {
    // Continuous distributions
    const xScale = scaleLinear()
      .domain(extent(data, d => d.x))
      .range([0, innerWidth]);
      
    const yScale = scaleLinear()
      .domain([0, max(data, d => d.y) * 1.1])
      .range([innerHeight, 0]);
      
    return { xScale, yScale };
  }
};

/**
 * Render axes with consistent styling
 */
export const renderDistributionAxes = (g, scales, dimensions, labels = {}) => {
  const { xScale, yScale } = scales;
  const { innerHeight } = dimensions;
  
  // X-axis
  const xAxis = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(axisBottom(xScale));
    
  // Style x-axis
  xAxis.selectAll('line').attr('stroke', '#6b7280');
  xAxis.selectAll('path').attr('stroke', '#6b7280');
  xAxis.selectAll('text')
    .attr('fill', '#4b5563')
    .attr('font-size', '12px');
    
  // X-axis label
  if (labels.x) {
    xAxis.append('text')
      .attr('x', dimensions.innerWidth / 2)
      .attr('y', 35)
      .attr('fill', '#4b5563')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text(labels.x);
  }
  
  // Y-axis
  const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(axisLeft(yScale).tickFormat(format('.3f')));
    
  // Style y-axis
  yAxis.selectAll('line').attr('stroke', '#6b7280');
  yAxis.selectAll('path').attr('stroke', '#6b7280');
  yAxis.selectAll('text')
    .attr('fill', '#4b5563')
    .attr('font-size', '12px');
    
  // Y-axis label
  if (labels.y) {
    yAxis.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -dimensions.innerHeight / 2)
      .attr('fill', '#4b5563')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text(labels.y);
  }
  
  return { xAxis, yAxis };
};

/**
 * Add grid lines to the visualization
 */
export const addDistributionGrid = (g, scales, dimensions) => {
  const { xScale, yScale } = scales;
  const { innerWidth, innerHeight } = dimensions;
  
  // Horizontal grid lines
  g.append('g')
    .attr('class', 'grid-lines-horizontal')
    .selectAll('line')
    .data(yScale.ticks())
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '2,2');
};

/**
 * Create an interactive tooltip
 */
export const createDistributionTooltip = () => {
  // Remove any existing tooltip
  select('body').selectAll('.distribution-tooltip').remove();
  
  const tooltip = select('body')
    .append('div')
    .attr('class', 'distribution-tooltip')
    .style('position', 'absolute')
    .style('padding', '8px 12px')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 200ms');
    
  return tooltip;
};

/**
 * Add hover effects to elements
 */
export const addHoverEffects = (selection, tooltip, formatters = {}) => {
  const formatX = formatters.x || (d => d.x);
  const formatY = formatters.y || (d => format('.4f')(d.y));
  
  selection
    .on('mouseenter', function(event, d) {
      // Highlight element
      select(this)
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('filter', 'brightness(1.1)');
        
      // Show tooltip
      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${formatX(d)}</strong><br/>
          Probability: ${formatY(d)}
        `);
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseleave', function() {
      // Reset element
      select(this)
        .transition()
        .duration(200)
        .style('opacity', 0.9)
        .style('filter', 'brightness(1)');
        
      // Hide tooltip
      tooltip.style('opacity', 0);
    });
};

/**
 * Animate bars or other elements
 */
export const animateDistributionBars = (selection, scales, transitionDuration = 300) => {
  const { xScale, yScale } = scales;
  
  selection
    .attr('x', d => xScale(d.x))
    .attr('width', xScale.bandwidth())
    .attr('y', scales.innerHeight)
    .attr('height', 0)
    .transition()
    .duration(transitionDuration)
    .ease(easeCubicOut)
    .attr('y', d => yScale(d.y))
    .attr('height', d => scales.innerHeight - yScale(d.y));
};

/**
 * Create a color scale for distributions
 */
export const createDistributionColorScale = (theme, domain) => {
  const themes = {
    blue: ['#dbeafe', '#60a5fa', '#2563eb', '#1d4ed8'],
    green: ['#d1fae5', '#34d399', '#10b981', '#059669'],
    purple: ['#ede9fe', '#a78bfa', '#8b5cf6', '#7c3aed'],
    orange: ['#fed7aa', '#fb923c', '#f97316', '#ea580c'],
    red: ['#fee2e2', '#f87171', '#ef4444', '#dc2626']
  };
  
  const colors = themes[theme] || themes.blue;
  
  if (typeof domain === 'number') {
    // For continuous scales
    return scaleSequential()
      .domain([0, domain])
      .interpolator(t => colors[Math.floor(t * (colors.length - 1))]);
  } else {
    // For ordinal scales
    return scaleOrdinal()
      .domain(domain)
      .range(colors);
  }
};

/**
 * Add animation keyframes to the document
 */
export const addDistributionAnimations = () => {
  // Check if animations already exist
  if (document.getElementById('distribution-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'distribution-animations';
  style.textContent = `
    @keyframes distributionPulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    
    @keyframes distributionBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes distributionGlow {
      0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
      100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    }
    
    @keyframes distributionSlideIn {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes distributionFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .distribution-transition {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
};

/**
 * Calculate responsive dimensions
 */
export const useResponsiveDimensions = (containerRef, aspectRatio = 16/9) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: width / aspectRatio
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef, aspectRatio]);
  
  return dimensions;
};

// Import React hooks for the responsive hook
import { useState, useEffect } from 'react';