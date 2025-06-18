// Optimized D3 imports - only import what we need
// This significantly reduces bundle size compared to importing all of D3

// Selection and manipulation
import { select, selectAll, selection, pointer } from 'd3-selection';

// Scales
import {
  scaleLinear,
  scaleOrdinal,
  scaleBand,
  scaleSequential,
  scaleDiverging,
  scaleQuantize,
  scaleTime,
  scaleLog
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
  curveNatural,
  symbol,
  symbolCircle,
  symbolSquare,
  linkHorizontal
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
  variance,
  histogram,
  rollup,
  shuffle
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
  schemeCategory10,
  interpolateWarm
} from 'd3-scale-chromatic';

// Easing
import {
  easeLinear,
  easeQuad,
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

// Hierarchy
import { hierarchy, tree } from 'd3-hierarchy';

// Color
import { color } from 'd3-color';

// Timer
import { interval } from 'd3-timer';

// Hexbin
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
  symbol,
  symbolCircle,
  symbolSquare,
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
  hexbin
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
  interpolateWarm
};

export default d3;