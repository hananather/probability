import React, { useEffect, useRef, useMemo } from 'react';
import {
  select,
  setupDistributionSVG,
  createDistributionScales,
  renderDistributionAxes,
  addDistributionGrid,
  createDistributionTooltip,
  addHoverEffects,
  animateDistributionBars,
  createDistributionColorScale,
  addDistributionAnimations,
  easeCubicOut,
  format
} from '@/utils/d3-utils';
import { gradientDefinitions } from '@/utils/distribution-theme';

/**
 * Reusable PMF Bar Chart component for all discrete distributions
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of {x, y} objects representing the PMF
 * @param {Object} props.dimensions - {width, height} of the chart
 * @param {Object} props.margins - Optional margin overrides
 * @param {Object} props.theme - Distribution theme from distribution-theme.js
 * @param {Object} props.labels - {x: 'X Label', y: 'Y Label'}
 * @param {Function} props.formatX - Custom X value formatter
 * @param {Function} props.formatY - Custom Y value formatter
 * @param {Function} props.onBarClick - Click handler for bars
 * @param {Boolean} props.showGrid - Whether to show grid lines
 * @param {Boolean} props.animate - Whether to animate on mount/update
 * @param {Number} props.animationDuration - Duration of animations in ms
 * @param {Object} props.highlights - Object mapping x values to highlight colors
 * @param {Boolean} props.showValues - Whether to show values on top of bars
 */
const PMFBarChart = ({
  data,
  dimensions = { width: 600, height: 400 },
  margins,
  theme,
  labels = { x: 'Value', y: 'Probability' },
  formatX,
  formatY,
  onBarClick,
  showGrid = true,
  animate = true,
  animationDuration = 300,
  highlights = {},
  showValues = false
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Add animations to document
  useEffect(() => {
    addDistributionAnimations();
  }, []);
  
  // Memoize processed data
  const processedData = useMemo(() => {
    return data.filter(d => d.y > 0.0001); // Filter out very small probabilities
  }, [data]);
  
  useEffect(() => {
    if (!processedData.length) return;
    
    const svg = select(svgRef.current);
    
    // Setup SVG with margins
    const { g, innerWidth, innerHeight } = setupDistributionSVG(
      svg,
      dimensions,
      margins
    );
    
    // Add gradient definitions
    const gradientSvg = svg.append('defs')
      .html(gradientDefinitions(theme));
    
    // Create scales
    const { xScale, yScale } = createDistributionScales(
      processedData,
      { innerWidth, innerHeight },
      'discrete'
    );
    
    // Add grid if enabled
    if (showGrid) {
      addDistributionGrid(g, { xScale, yScale }, { innerWidth, innerHeight });
    }
    
    // Render axes
    renderDistributionAxes(
      g,
      { xScale, yScale },
      { innerWidth, innerHeight },
      labels
    );
    
    // Create bars group
    const barsGroup = g.append('g').attr('class', 'bars');
    
    // Create bars
    const bars = barsGroup.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x))
      .attr('width', xScale.bandwidth())
      .attr('rx', 4) // Rounded corners
      .style('fill', d => {
        if (highlights[d.x]) {
          return highlights[d.x];
        }
        return `url(#${theme.name}-gradient)`;
      })
      .style('filter', `drop-shadow(0 2px 4px ${theme.primary}33)`)
      .style('opacity', 0.9)
      .style('cursor', onBarClick ? 'pointer' : 'default');
    
    // Animate bars if enabled
    if (animate) {
      bars
        .attr('y', innerHeight)
        .attr('height', 0)
        .transition()
        .duration(animationDuration)
        .ease(easeCubicOut)
        .delay((d, i) => i * 20) // Staggered animation
        .attr('y', d => yScale(d.y))
        .attr('height', d => innerHeight - yScale(d.y));
    } else {
      bars
        .attr('y', d => yScale(d.y))
        .attr('height', d => innerHeight - yScale(d.y));
    }
    
    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createDistributionTooltip();
    }
    
    // Add hover effects
    addHoverEffects(bars, tooltipRef.current, {
      x: formatX || (d => `X = ${d.x}`),
      y: formatY || (d => format('.4f')(d.y))
    });
    
    // Add click handler
    if (onBarClick) {
      bars.on('click', function(event, d) {
        onBarClick(d);
        // Visual feedback
        select(this)
          .transition()
          .duration(150)
          .style('transform', 'scale(0.95)')
          .transition()
          .duration(150)
          .style('transform', 'scale(1)');
      });
    }
    
    // Show values on top of bars if enabled
    if (showValues) {
      const valueLabels = barsGroup.selectAll('.value-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.x) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.y) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#f3f4f6')
        .attr('opacity', 0)
        .text(d => format('.3f')(d.y));
      
      if (animate) {
        valueLabels
          .transition()
          .duration(animationDuration)
          .delay((d, i) => i * 20 + animationDuration)
          .attr('opacity', 1);
      } else {
        valueLabels.attr('opacity', 1);
      }
    }
    
    // Add mean line if data has enough points
    if (processedData.length > 1) {
      const mean = processedData.reduce((sum, d) => sum + d.x * d.y, 0);
      const meanX = xScale(Math.round(mean)) + xScale.bandwidth() / 2;
      
      const meanLine = g.append('line')
        .attr('class', 'mean-line')
        .attr('x1', meanX)
        .attr('x2', meanX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', theme.accent)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0);
      
      const meanLabel = g.append('text')
        .attr('class', 'mean-label')
        .attr('x', meanX)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#f3f4f6')
        .attr('opacity', 0)
        .text(`μ = ${mean.toFixed(2)}`);
      
      if (animate) {
        meanLine.transition()
          .duration(animationDuration)
          .delay(animationDuration)
          .attr('opacity', 0.6);
        
        meanLabel.transition()
          .duration(animationDuration)
          .delay(animationDuration)
          .attr('opacity', 1);
      } else {
        meanLine.attr('opacity', 0.6);
        meanLabel.attr('opacity', 1);
      }
    }
    
    // Cleanup function
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [processedData, dimensions, margins, theme, labels, formatX, formatY, 
      onBarClick, showGrid, animate, animationDuration, highlights, showValues]);
  
  return (
    <div className="pmf-chart-container relative">
      <svg
        ref={svgRef}
        className="pmf-chart"
        style={{
          display: 'block',
          margin: '0 auto',
          overflow: 'visible'
        }}
      />
    </div>
  );
};

export default PMFBarChart;