// Optimized D3 imports - only import what we need
// This significantly reduces bundle size compared to importing all of D3

// Selection and manipulation
import { select, selectAll, selection } from 'd3-selection';

// Scales
import {
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleTime
} from 'd3-scale';

// Axes
import {
  axisBottom,
  axisLeft,
  axisRight,
  axisTop
} from 'd3-axis';

// Shapes and lines
import {
  line,
  area,
  arc,
  pie,
  curveLinear,
  curveBasis,
  curveCardinal,
  curveMonotoneX,
  curveMonotoneY,
  symbol,
  symbolCircle,
  symbolSquare
} from 'd3-shape';

// Transitions
import { transition } from 'd3-transition';

// Drag
import { drag } from 'd3-drag';

// Format
import { format, formatPrefix } from 'd3-format';

// Arrays
import {
  min,
  max,
  extent,
  mean,
  median,
  sum,
  range,
  quantile,
  deviation,
  variance
} from 'd3-array';

// Interpolation
import {
  interpolate,
  interpolateRgb,
  interpolateNumber
} from 'd3-interpolate';

// Colors
import {
  interpolateBlues,
  interpolateRdBu,
  schemeCategory10
} from 'd3-scale-chromatic';

// Easing
import {
  easeLinear,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackOut
} from 'd3-ease';

// Random
import { randomNormal, randomUniform } from 'd3-random';

// Time
import { timeFormat, timeParse } from 'd3-time-format';

// Re-export everything
export {
  // Selection
  select,
  selectAll,
  selection,
  // Scales
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleTime,
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
  symbol,
  symbolCircle,
  symbolSquare,
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
  // Interpolation
  interpolate,
  interpolateRgb,
  interpolateNumber,
  // Colors
  interpolateBlues,
  interpolateRdBu,
  schemeCategory10,
  // Easing
  easeLinear,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackOut,
  // Random
  randomNormal,
  randomUniform,
  // Time
  timeFormat,
  timeParse
};

// Utility to check if we missed any d3 functions
export const checkD3Usage = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`D3 utils loaded for ${componentName}`);
  }
};

// Re-export common patterns as a default object for easier migration
const d3 = {
  select,
  selectAll,
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  axisBottom,
  axisLeft,
  line,
  drag,
  format,
  min,
  max,
  extent,
  mean,
  transition,
  easeQuadInOut,
  easeCubicInOut
};

export default d3;