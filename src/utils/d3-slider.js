/**
 * D3 Slider Utility Function
 * Creates a customizable slider using D3.js
 * Based on the drag patterns from BayesSimulation.jsx
 */

import * as d3 from 'd3';

/**
 * Creates a D3-based slider
 * @param {Object} svg - D3 selection of the SVG container
 * @param {Object} options - Configuration options
 * @param {number} options.x - X position of the slider
 * @param {number} options.y - Y position of the slider
 * @param {number} options.width - Width of the slider track
 * @param {number} options.height - Height of the slider (default: 20)
 * @param {number} options.min - Minimum value (default: 0)
 * @param {number} options.max - Maximum value (default: 1)
 * @param {number} options.value - Initial value
 * @param {Function} options.onChange - Callback function when value changes
 * @param {string} options.color - Color of the slider handle (default: '#14b8a6')
 * @param {string} options.trackColor - Color of the slider track (default: '#374151')
 * @param {boolean} options.showValue - Whether to show the value label (default: true)
 * @param {number} options.handleRadius - Radius of the slider handle (default: 8)
 * @param {string} options.orientation - 'horizontal' or 'vertical' (default: 'horizontal')
 * @returns {Object} Slider API with update method
 */
export function create_slider(svg, options = {}) {
  // Default options
  const defaults = {
    x: 0,
    y: 0,
    width: 200,
    height: 20,
    min: 0,
    max: 1,
    value: 0.5,
    onChange: () => {},
    color: '#14b8a6',
    trackColor: '#374151',
    showValue: true,
    handleRadius: 8,
    orientation: 'horizontal'
  };
  
  const config = { ...defaults, ...options };
  
  // Create slider group
  const sliderGroup = svg.append('g')
    .attr('class', 'slider')
    .attr('transform', `translate(${config.x}, ${config.y})`);
  
  // Scales
  const scale = config.orientation === 'horizontal'
    ? d3.scaleLinear()
        .domain([config.min, config.max])
        .range([0, config.width])
        .clamp(true)
    : d3.scaleLinear()
        .domain([config.min, config.max])
        .range([config.height, 0])
        .clamp(true);
  
  // Track
  const track = sliderGroup.append('rect')
    .attr('class', 'slider-track')
    .attr('width', config.orientation === 'horizontal' ? config.width : 4)
    .attr('height', config.orientation === 'horizontal' ? 4 : config.height)
    .attr('x', config.orientation === 'horizontal' ? 0 : -2)
    .attr('y', config.orientation === 'horizontal' ? config.height / 2 - 2 : 0)
    .attr('rx', 2)
    .attr('fill', config.trackColor)
    .style('cursor', 'pointer');
  
  // Active track (shows current value)
  const activeTrack = sliderGroup.append('rect')
    .attr('class', 'slider-active-track')
    .attr('height', config.orientation === 'horizontal' ? 4 : 0)
    .attr('width', config.orientation === 'horizontal' ? 0 : 4)
    .attr('x', config.orientation === 'horizontal' ? 0 : -2)
    .attr('y', config.orientation === 'horizontal' ? config.height / 2 - 2 : 0)
    .attr('rx', 2)
    .attr('fill', config.color)
    .attr('opacity', 0.8)
    .style('pointer-events', 'none');
  
  // Handle
  const handle = sliderGroup.append('circle')
    .attr('class', 'slider-handle')
    .attr('r', config.handleRadius)
    .attr('cx', config.orientation === 'horizontal' ? scale(config.value) : 0)
    .attr('cy', config.orientation === 'horizontal' ? config.height / 2 : scale(config.value))
    .attr('fill', config.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'grab');
  
  // Value label
  let valueLabel;
  if (config.showValue) {
    valueLabel = sliderGroup.append('text')
      .attr('class', 'slider-value')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('dy', config.orientation === 'horizontal' ? -10 : 0)
      .attr('dx', config.orientation === 'horizontal' ? 0 : 25);
  }
  
  // Update function
  function updateSlider(value) {
    const clampedValue = Math.max(config.min, Math.min(config.max, value));
    
    if (config.orientation === 'horizontal') {
      handle.attr('cx', scale(clampedValue));
      activeTrack.attr('width', scale(clampedValue));
      if (valueLabel) {
        valueLabel
          .attr('x', scale(clampedValue))
          .attr('y', config.height / 2)
          .text(clampedValue.toFixed(2));
      }
    } else {
      handle.attr('cy', scale(clampedValue));
      activeTrack
        .attr('height', config.height - scale(clampedValue))
        .attr('y', scale(clampedValue));
      if (valueLabel) {
        valueLabel
          .attr('x', 0)
          .attr('y', scale(clampedValue))
          .text(clampedValue.toFixed(2));
      }
    }
    
    config.onChange(clampedValue);
  }
  
  // Drag behavior
  const drag = d3.drag()
    .on('start', function() {
      d3.select(this).style('cursor', 'grabbing');
    })
    .on('drag', function(event) {
      let newValue;
      if (config.orientation === 'horizontal') {
        const [x] = d3.pointer(event, sliderGroup.node());
        newValue = scale.invert(x);
      } else {
        const [, y] = d3.pointer(event, sliderGroup.node());
        newValue = scale.invert(y);
      }
      updateSlider(newValue);
    })
    .on('end', function() {
      d3.select(this).style('cursor', 'grab');
    });
  
  // Apply drag to handle
  handle.call(drag);
  
  // Click on track to set value
  track.on('click', function(event) {
    if (config.orientation === 'horizontal') {
      const [x] = d3.pointer(event, this);
      updateSlider(scale.invert(x));
    } else {
      const [, y] = d3.pointer(event, this);
      updateSlider(scale.invert(y));
    }
  });
  
  // Initialize
  updateSlider(config.value);
  
  // Return API
  return {
    update: updateSlider,
    getValue: () => scale.invert(
      config.orientation === 'horizontal' 
        ? parseFloat(handle.attr('cx'))
        : parseFloat(handle.attr('cy'))
    ),
    remove: () => sliderGroup.remove()
  };
}

/**
 * Creates a simple range slider (similar to HTML range input)
 * Simplified version for basic use cases
 */
export function createSimpleSlider(container, {
  min = 0,
  max = 100,
  value = 50,
  step = 1,
  label = '',
  onChange = () => {},
  width = 200
} = {}) {
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + 40)
    .attr('height', 60);
  
  if (label) {
    svg.append('text')
      .attr('x', 20)
      .attr('y', 15)
      .attr('font-size', '14px')
      .attr('fill', '#e0e0e0')
      .text(label);
  }
  
  const slider = create_slider(svg, {
    x: 20,
    y: label ? 25 : 20,
    width: width,
    min,
    max,
    value,
    onChange: (v) => {
      const stepped = Math.round(v / step) * step;
      onChange(stepped);
    }
  });
  
  return slider;
}

// Export a version that works like the missing function from the original code
export default create_slider;