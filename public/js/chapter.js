/**
 * Common utilities for probability visualization chapters
 * This file provides utility functions used across different chapter visualizations
 */

// Round function - rounds a number to a specified number of decimal places
function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// D3 extension to move elements to the back of their parent
// This is useful for ensuring certain elements appear behind others
d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    const firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

// D3 extension to move elements to the front of their parent
// This is useful for ensuring certain elements appear on top
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

/**
 * Creates a D3-based slider
 * @param {Object} svg - D3 selection of the SVG container
 * @param {Object} options - Configuration options
 * @param {number} options.x - X position of the slider
 * @param {number} options.y - Y position of the slider
 * @param {number} options.width - Width of the slider track
 * @param {number} options.min - Minimum value (default: 0)
 * @param {number} options.max - Maximum value (default: 1)
 * @param {number} options.value - Initial value
 * @param {Function} options.callback - Function called when value changes
 * @param {string} options.color - Color of the slider handle (default: '#14b8a6')
 * @param {string} options.label - Label text for the slider
 * @param {boolean} options.showValue - Whether to show the value label (default: true)
 * @returns {Object} Slider object with update method
 */
function create_slider(svg, options = {}) {
  // Default options
  const defaults = {
    x: 0,
    y: 0,
    width: 200,
    min: 0,
    max: 1,
    value: 0.5,
    callback: () => {},
    color: '#14b8a6',
    label: '',
    showValue: true,
    decimals: 2
  };
  
  const config = { ...defaults, ...options };
  
  // Create slider group
  const sliderGroup = svg.append('g')
    .attr('class', 'slider')
    .attr('transform', `translate(${config.x}, ${config.y})`);
  
  // Add label if provided
  if (config.label) {
    sliderGroup.append('text')
      .attr('class', 'slider-label')
      .attr('x', 0)
      .attr('y', -20)
      .attr('font-size', '14px')
      .attr('fill', '#e0e0e0')
      .text(config.label);
  }
  
  // Scale for mapping values to positions
  const scale = d3.scaleLinear()
    .domain([config.min, config.max])
    .range([0, config.width])
    .clamp(true);
  
  // Track background
  const track = sliderGroup.append('rect')
    .attr('class', 'slider-track')
    .attr('width', config.width)
    .attr('height', 4)
    .attr('x', 0)
    .attr('y', -2)
    .attr('rx', 2)
    .attr('fill', '#374151')
    .style('cursor', 'pointer');
  
  // Active track (shows current value)
  const activeTrack = sliderGroup.append('rect')
    .attr('class', 'slider-active-track')
    .attr('height', 4)
    .attr('x', 0)
    .attr('y', -2)
    .attr('rx', 2)
    .attr('fill', config.color)
    .attr('opacity', 0.8)
    .style('pointer-events', 'none');
  
  // Handle
  const handle = sliderGroup.append('circle')
    .attr('class', 'slider-handle')
    .attr('r', 8)
    .attr('cy', 0)
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
      .attr('dy', -15);
  }
  
  // Update function
  function updateSlider(value) {
    const clampedValue = Math.max(config.min, Math.min(config.max, value));
    const xPos = scale(clampedValue);
    
    handle.attr('cx', xPos);
    activeTrack.attr('width', xPos);
    
    if (valueLabel) {
      valueLabel
        .attr('x', xPos)
        .text(round(clampedValue, config.decimals));
    }
    
    // Call the callback with the new value
    config.callback(clampedValue);
  }
  
  // Drag behavior
  const drag = d3.drag()
    .on('start', function() {
      d3.select(this).style('cursor', 'grabbing');
    })
    .on('drag', function(event) {
      const [x] = d3.pointer(event, sliderGroup.node());
      const newValue = scale.invert(x);
      updateSlider(newValue);
    })
    .on('end', function() {
      d3.select(this).style('cursor', 'grab');
    });
  
  // Apply drag to handle
  handle.call(drag);
  
  // Click on track to set value
  track.on('click', function(event) {
    const [x] = d3.pointer(event, this);
    const newValue = scale.invert(x);
    updateSlider(newValue);
  });
  
  // Initialize
  updateSlider(config.value);
  
  // Return API
  return {
    update: updateSlider,
    getValue: () => scale.invert(parseFloat(handle.attr('cx'))),
    remove: () => sliderGroup.remove()
  };
}

/**
 * Formats a number with commas as thousands separators
 * @param {number} x - Number to format
 * @returns {string} Formatted number string
 */
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculates factorial of a number
 * @param {number} n - Input number
 * @returns {number} Factorial result
 */
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculates binomial coefficient (n choose k)
 * @param {number} n - Total number of items
 * @param {number} k - Number of items to choose
 * @returns {number} Binomial coefficient
 */
function binomial(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

/**
 * Generates an array of numbers from start to end (inclusive)
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} step - Step size (default: 1)
 * @returns {Array} Array of numbers
 */
function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a color scale for probability visualizations
 * @param {string} type - Type of color scale ('sequential', 'diverging', 'categorical')
 * @returns {Function} D3 color scale
 */
function createColorScale(type = 'sequential') {
  switch (type) {
    case 'sequential':
      return d3.scaleSequential(d3.interpolateBlues);
    case 'diverging':
      return d3.scaleDiverging(d3.interpolateRdBu);
    case 'categorical':
      return d3.scaleOrdinal(d3.schemeCategory10);
    default:
      return d3.scaleSequential(d3.interpolateBlues);
  }
}

/**
 * Animates a transition with easing
 * @param {Selection} selection - D3 selection to animate
 * @param {number} duration - Animation duration in milliseconds
 * @returns {Transition} D3 transition
 */
function animateTransition(selection, duration = 750) {
  return selection
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut);
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    round,
    create_slider,
    numberWithCommas,
    factorial,
    binomial,
    range,
    shuffle,
    randomInt,
    createColorScale,
    animateTransition
  };
}