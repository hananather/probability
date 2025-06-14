/**
 * Graph Styling System for Chapter 3 Components
 * 
 * This module provides consistent, reusable styling for D3 charts across all Chapter 3 components.
 * Features light, clean backgrounds (no black!) and professional appearance.
 * 
 * @module graphStyles
 * 
 * ## Usage Example:
 * 
 * ```jsx
 * import {
 *   graphColors,
 *   margins,
 *   getChartColors,
 *   styleSvgContainer,
 *   createGridLines,
 *   styleAxisElements,
 *   calculateDimensions,
 * } from './graphStyles';
 * 
 * // In your component:
 * const dimensions = calculateDimensions(container, margins.default);
 * const colors = getChartColors('probability');
 * 
 * // Style your SVG
 * styleSvgContainer(svg);
 * 
 * // Add grid lines
 * createGridLines(g, xScale, yScale, dimensions);
 * 
 * // Style axes after rendering
 * styleAxisElements(xAxis);
 * styleAxisElements(yAxis);
 * ```
 * 
 * ## Key Features:
 * - Light, professional backgrounds (no black!)
 * - Consistent color schemes from design system
 * - Responsive sizing and margins
 * - Subtle grid lines with proper opacity
 * - Gradients for visual interest
 * - Proper font hierarchy
 * - Smooth animations
 * 
 * ## Color Schemes Available:
 * - 'default': Teal/Yellow/Blue
 * - 'probability': Blue/Emerald/Amber
 * - 'hypothesis': Teal/Amber/Orange  
 * - 'estimation': Violet/Cyan/Amber
 * - 'inference': Teal/Orange/Yellow
 * - 'sampling': Cyan/Purple/Amber
 */

import { colorSchemes } from '@/lib/design-system';

/**
 * Core color palette for graphs
 * Light backgrounds with professional appearance
 */
export const graphColors = {
  // Background colors - light and clean
  background: {
    primary: '#ffffff',      // Pure white for main graph area
    secondary: '#f9fafb',    // Very light gray for containers
    tertiary: '#f3f4f6',     // Light gray for sections
    hover: '#e5e7eb',        // Hover state
  },
  
  // Grid and axis colors
  grid: {
    major: 'rgba(156, 163, 175, 0.2)',  // gray-400 with low opacity
    minor: 'rgba(209, 213, 219, 0.15)', // gray-300 with very low opacity
    axis: '#6b7280',                     // gray-500 for axis lines
    zero: '#9ca3af',                     // gray-400 for zero lines
  },
  
  // Text colors for SVG elements
  text: {
    primary: '#1f2937',      // gray-800 for main text
    secondary: '#4b5563',    // gray-600 for labels
    tertiary: '#6b7280',     // gray-500 for minor text
    value: '#111827',        // gray-900 for important values
  },
  
  // Interactive elements
  interactive: {
    hover: 'rgba(59, 130, 246, 0.1)',   // blue-500 with low opacity
    selection: 'rgba(16, 185, 129, 0.2)', // emerald-500 with low opacity
    cursor: '#3b82f6',                    // blue-500 for cursor lines
  }
};

/**
 * Standard margins for different chart types
 */
export const margins = {
  default: { top: 20, right: 30, bottom: 40, left: 50 },
  withTitle: { top: 40, right: 30, bottom: 40, left: 50 },
  compact: { top: 10, right: 20, bottom: 30, left: 40 },
  wide: { top: 20, right: 40, bottom: 40, left: 60 },
  withLegend: { top: 20, right: 120, bottom: 40, left: 50 },
};

/**
 * Font configuration for charts
 */
export const fonts = {
  // Font families
  family: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  },
  
  // Font sizes (in pixels)
  size: {
    title: 18,
    subtitle: 14,
    label: 12,
    tick: 11,
    annotation: 10,
  },
  
  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

/**
 * Animation durations (in milliseconds)
 */
export const transitions = {
  fast: 200,
  normal: 300,
  slow: 500,
  enter: 600,
  exit: 300,
};

/**
 * Get color scheme for specific chart type
 * @param {string} scheme - Color scheme name from design system
 * @returns {Object} Color configuration for charts
 */
export function getChartColors(scheme = 'default') {
  const schemeColors = colorSchemes[scheme] || colorSchemes.default;
  
  return {
    // Primary data colors
    primary: schemeColors.primary,
    secondary: schemeColors.secondary,
    tertiary: schemeColors.tertiary,
    
    // Area fills with proper opacity
    primaryArea: `${schemeColors.primary}33`,     // 20% opacity
    secondaryArea: `${schemeColors.secondary}33`,  // 20% opacity
    tertiaryArea: `${schemeColors.tertiary}33`,   // 20% opacity
    
    // Lighter fills for overlays
    primaryLight: `${schemeColors.primary}1A`,    // 10% opacity
    secondaryLight: `${schemeColors.secondary}1A`, // 10% opacity
    
    // Gradients for visual interest
    gradients: {
      primary: {
        start: schemeColors.primary,
        end: `${schemeColors.primary}00`, // Fade to transparent
      },
      secondary: {
        start: schemeColors.secondary,
        end: `${schemeColors.secondary}00`,
      }
    },
    
    // Semantic colors
    success: '#10b981',  // emerald-500
    warning: '#f59e0b',  // amber-500
    error: '#ef4444',    // red-500
    info: '#3b82f6',     // blue-500
  };
}

/**
 * Create consistent axis styling
 * @param {Object} axis - D3 axis object
 * @param {Object} options - Styling options
 * @returns {Object} Styled axis
 */
export function styleAxis(axis, options = {}) {
  const {
    gridLines = true,
    fontSize = fonts.size.tick,
    color = graphColors.text.secondary,
  } = options;
  
  return axis
    .tickSize(gridLines ? -1 : 6)
    .tickPadding(8);
}

/**
 * Apply consistent styling to SVG container
 * @param {Object} svg - D3 SVG selection
 * @param {Object} options - Styling options
 */
export function styleSvgContainer(svg, options = {}) {
  const {
    background = graphColors.background.primary,
    borderRadius = 8,
    shadow = true,
  } = options;
  
  svg
    .style('background-color', background)
    .style('border-radius', `${borderRadius}px`);
    
  if (shadow) {
    svg.style('box-shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
  }
}

/**
 * Create grid lines for chart
 * @param {Object} g - D3 group selection
 * @param {Object} xScale - X scale function
 * @param {Object} yScale - Y scale function
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Grid options
 */
export function createGridLines(g, xScale, yScale, dimensions, options = {}) {
  const {
    showX = true,
    showY = true,
    color = graphColors.grid.major,
    strokeDasharray = '2,2',
  } = options;
  
  // Remove any existing grid
  g.selectAll('.grid').remove();
  
  if (showY) {
    g.append('g')
      .attr('class', 'grid grid-y')
      .attr('transform', `translate(0,0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-dimensions.width)
          .tickFormat('')
      )
      .style('stroke', color)
      .style('stroke-dasharray', strokeDasharray)
      .style('stroke-width', 0.5);
  }
  
  if (showX) {
    g.append('g')
      .attr('class', 'grid grid-x')
      .attr('transform', `translate(0,${dimensions.height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-dimensions.height)
          .tickFormat('')
      )
      .style('stroke', color)
      .style('stroke-dasharray', strokeDasharray)
      .style('stroke-width', 0.5);
  }
  
  // Style the domain lines to be invisible
  g.selectAll('.grid .domain').style('display', 'none');
}

/**
 * Style axis elements after rendering
 * @param {Object} g - D3 group selection containing axis
 * @param {Object} options - Styling options
 */
export function styleAxisElements(g, options = {}) {
  const {
    textColor = graphColors.text.secondary,
    lineColor = graphColors.grid.axis,
    fontSize = fonts.size.tick,
    fontFamily = fonts.family.sans,
  } = options;
  
  // Style axis line
  g.select('.domain')
    .style('stroke', lineColor)
    .style('stroke-width', 1);
    
  // Style ticks
  g.selectAll('.tick line')
    .style('stroke', lineColor)
    .style('stroke-width', 1);
    
  // Style tick labels
  g.selectAll('.tick text')
    .style('fill', textColor)
    .style('font-size', `${fontSize}px`)
    .style('font-family', fontFamily);
}

/**
 * Create a gradient definition for SVG
 * @param {Object} defs - D3 defs selection
 * @param {string} id - Gradient ID
 * @param {Object} colors - Gradient colors configuration
 * @param {string} direction - 'horizontal' or 'vertical'
 */
export function createGradient(defs, id, colors, direction = 'vertical') {
  const gradient = defs.append('linearGradient')
    .attr('id', id)
    .attr('x1', direction === 'horizontal' ? '0%' : '0%')
    .attr('y1', direction === 'horizontal' ? '0%' : '0%')
    .attr('x2', direction === 'horizontal' ? '100%' : '0%')
    .attr('y2', direction === 'horizontal' ? '0%' : '100%');
    
  gradient.append('stop')
    .attr('offset', '0%')
    .attr('style', `stop-color:${colors.start};stop-opacity:1`);
    
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('style', `stop-color:${colors.end};stop-opacity:1`);
    
  return gradient;
}

/**
 * Calculate responsive dimensions based on container
 * @param {Object} container - DOM element or D3 selection
 * @param {Object} margins - Margin configuration
 * @param {Object} options - Additional options
 * @returns {Object} Dimensions object with width, height, innerWidth, innerHeight
 */
export function calculateDimensions(container, margins = margins.default, options = {}) {
  const {
    aspectRatio = null,
    minHeight = 300,
    maxHeight = 600,
  } = options;
  
  const containerRect = container.getBoundingClientRect ? 
    container.getBoundingClientRect() : 
    container.node().getBoundingClientRect();
    
  const width = containerRect.width;
  let height = containerRect.height || minHeight;
  
  // Apply aspect ratio if specified
  if (aspectRatio) {
    height = width / aspectRatio;
  }
  
  // Apply height constraints
  height = Math.max(minHeight, Math.min(maxHeight, height));
  
  return {
    width,
    height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - margins.top - margins.bottom,
    margins,
  };
}

/**
 * Create tooltip styling
 * @returns {Object} Tooltip style configuration
 */
export function getTooltipStyles() {
  return {
    container: {
      position: 'absolute',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: fonts.family.sans,
      color: graphColors.text.primary,
      pointerEvents: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    },
    value: {
      fontWeight: fonts.weight.semibold,
      fontFamily: fonts.family.mono,
      color: graphColors.text.value,
    },
    label: {
      color: graphColors.text.secondary,
      marginRight: '4px',
    }
  };
}

/**
 * Format number for display in charts
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number
 */
export function formatChartNumber(value, options = {}) {
  const {
    decimals = 2,
    prefix = '',
    suffix = '',
    compact = false,
  } = options;
  
  if (compact && Math.abs(value) >= 1000) {
    const suffixes = ['', 'K', 'M', 'B'];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
    const scaled = value / Math.pow(1000, tier);
    return `${prefix}${scaled.toFixed(1)}${suffixes[tier]}${suffix}`;
  }
  
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

/**
 * Common chart patterns and configurations
 */
export const chartPatterns = {
  // Line chart configuration
  line: {
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    tension: 0.5, // For curved lines
  },
  
  // Area chart configuration
  area: {
    fillOpacity: 0.3,
    strokeWidth: 2,
    strokeOpacity: 1,
  },
  
  // Bar chart configuration
  bar: {
    cornerRadius: 2,
    hoverOpacity: 0.8,
    gap: 0.1, // 10% gap between bars
  },
  
  // Scatter plot configuration
  scatter: {
    radius: 4,
    hoverRadius: 6,
    strokeWidth: 1,
    fillOpacity: 0.7,
  }
};

/**
 * Responsive breakpoints for charts
 */
export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
};

/**
 * Get responsive configuration based on width
 * @param {number} width - Container width
 * @returns {Object} Responsive configuration
 */
export function getResponsiveConfig(width) {
  if (width < breakpoints.mobile) {
    return {
      margins: margins.compact,
      fontSize: {
        title: 16,
        label: 10,
        tick: 9,
      },
      showAllTicks: false,
    };
  } else if (width < breakpoints.tablet) {
    return {
      margins: margins.default,
      fontSize: {
        title: 17,
        label: 11,
        tick: 10,
      },
      showAllTicks: false,
    };
  } else {
    return {
      margins: margins.default,
      fontSize: fonts.size,
      showAllTicks: true,
    };
  }
}

// Export all configurations as a single object for convenience
const graphStyles = {
  colors: graphColors,
  margins,
  fonts,
  transitions,
  getChartColors,
  styleAxis,
  styleSvgContainer,
  createGridLines,
  styleAxisElements,
  createGradient,
  calculateDimensions,
  getTooltipStyles,
  formatChartNumber,
  chartPatterns,
  breakpoints,
  getResponsiveConfig,
};

export default graphStyles;