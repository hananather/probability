# Reusable Patterns Guide for prob-lab

This guide documents all the existing patterns, utilities, and components that can be reused when building new visualizations in the prob-lab codebase.

## 1. Design System (`/src/lib/design-system.js`)

The design system provides a comprehensive set of utilities for consistent styling:

### Color System
```javascript
import { colors, createColorScheme } from '../lib/design-system';

// Pre-defined color schemes for different statistical concepts
const colorScheme = createColorScheme('probability'); // Options: 'default', 'probability', 'inference', 'estimation', 'hypothesis', 'sampling'

// Access chart colors
colorScheme.chart.primary    // Main data color
colorScheme.chart.secondary  // Highlight color
colorScheme.chart.tertiary   // Comparison color
colorScheme.chart.grid       // Grid lines (#374151)
colorScheme.chart.text       // SVG text (#ffffff)
```

### Typography System
```javascript
import { typography } from '../lib/design-system';

// Consistent text styles
typography.h1     // text-2xl font-bold text-teal-400
typography.h2     // text-xl font-semibold text-teal-400
typography.h3     // text-lg font-medium text-white
typography.label  // text-sm text-neutral-300
typography.value  // font-mono text-teal-400 (ALWAYS use for numbers)
```

### Layout Utilities
```javascript
import { layout, spacing } from '../lib/design-system';

// Container styles
layout.container      // bg-neutral-800 rounded-lg shadow-xl p-5
layout.innerContainer // bg-neutral-900 rounded-md shadow-inner p-4

// Grid layouts
layout.gridMd2  // grid md:grid-cols-2 gap-5
layout.gridMd3  // grid md:grid-cols-3 gap-4

// Spacing
spacing.container  // p-5
spacing.section    // space-y-4
spacing.grid       // gap-5
```

### Helper Functions
```javascript
import { formatNumber, cn } from '../lib/design-system';

// Format numbers consistently
formatNumber(3.14159, 2)  // "3.14"

// Combine classes
cn('base-class', conditional && 'conditional-class', 'another-class')
```

## 2. D3 Utilities (`/src/utils/d3-utils.js`)

Optimized D3 imports to reduce bundle size:

```javascript
// Import only what you need
import { select, scaleLinear, axisBottom, line, drag, format, extent } from '../utils/d3-utils';

// Or use the default export for common patterns
import d3 from '../utils/d3-utils';

// Available functions:
// - Selection: select, selectAll
// - Scales: scaleLinear, scaleOrdinal, scaleBand, scaleTime
// - Axes: axisBottom, axisLeft, axisRight, axisTop
// - Shapes: line, area, arc, pie
// - Transitions: transition
// - Drag: drag
// - Arrays: min, max, extent, mean, median, sum
// - Random: randomNormal, randomUniform
// - Easing: easeQuadInOut, easeCubicInOut
```

## 3. Custom Hooks

### useD3 Hook (`/src/hooks/useD3.js`)
For imperative D3 rendering:

```javascript
import useD3 from '../hooks/useD3';

const ref = useD3((svg, { w, h }) => {
  // D3 rendering logic
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, w]);
  
  svg.append('rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', colors.chart.primary);
}, [dependency1, dependency2]); // Re-render when dependencies change

return <svg ref={ref} height={400} className="w-full" />;
```

### useD3Drag Hook (`/src/hooks/useD3Drag.js`)
For smooth dragging functionality:

```javascript
import { useD3Drag, useD3ValueDrag, useD3BarDrag } from '../hooks/useD3Drag';

// Basic dragging
const { dragRef } = useD3Drag({
  onDrag: (x, y, event) => {
    // Handle drag
  },
  constraints: { minX: 0, maxX: 100, minY: 0, maxY: 100 }
});

// Value dragging (for sliders)
const sliderRef = useD3ValueDrag({
  value: currentValue,
  onChange: setValue,
  scale: d3.scaleLinear().domain([0, 1]).range([0, width]),
  axis: 'x',
  bounds: [0, 1]
});

// Bar dragging (for probability distributions)
const barRefs = useD3BarDrag({
  values: probabilities,
  onChange: setProbabilities,
  xScale, yScale,
  redistributeValues: (values, index, newValue) => {
    // Custom redistribution logic
  }
});
```

### useMathJaxQueue Hook (`/src/hooks/useMathJaxQueue.js`)
For rendering LaTeX expressions:

```javascript
import { useMathJaxQueue } from '../hooks/useMathJaxQueue';

// In your component
useMathJaxQueue([equation1, equation2, params]); // Re-process when dependencies change
```

## 4. UI Components

### VisualizationContainer System (`/src/components/ui/VisualizationContainer.jsx`)
Provides consistent container styling:

```javascript
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlPanel,
  ControlGroup,
  StatsDisplay
} from './ui/VisualizationContainer';

// Main container
<VisualizationContainer title="My Visualization">
  <VisualizationSection title="Controls">
    <ControlPanel>
      <ControlGroup label="Parameter">
        <input type="range" />
      </ControlGroup>
    </ControlPanel>
  </VisualizationSection>
  
  <VisualizationSection title="Graph" divider>
    <GraphContainer height="500px">
      <svg ref={svgRef} />
    </GraphContainer>
  </VisualizationSection>
  
  <StatsDisplay stats={[
    { label: "Mean", value: formatNumber(mean, 3) },
    { label: "Variance", value: formatNumber(variance, 3), highlight: true }
  ]} />
</VisualizationContainer>
```

### WorkedExampleContainer (`/src/components/ui/WorkedExampleContainer.jsx`)
For step-by-step mathematical examples:

```javascript
import { 
  WorkedExampleContainer, 
  WorkedExampleStep,
  LaTeXEquation 
} from '../ui/WorkedExampleContainer';

<WorkedExampleContainer title="Calculating Expected Value">
  <WorkedExampleStep stepNumber={1} label="Define the formula">
    <LaTeXEquation equation="E[X] = \\sum_{i=1}^{n} x_i \\cdot P(X = x_i)" />
  </WorkedExampleStep>
  
  <WorkedExampleStep stepNumber={2} label="Substitute values">
    <LaTeXEquation equation={`E[X] = ${values.map((v, i) => 
      `${v} \\cdot ${probs[i]}`).join(' + ')}`} />
  </WorkedExampleStep>
</WorkedExampleContainer>
```

### RangeSlider (`/src/components/ui/RangeSlider.jsx`)
HTML-based range slider with consistent styling:

```javascript
import { RangeSlider } from "./ui/RangeSlider";

<RangeSlider
  label="Sample Size"
  value={n}
  onChange={setN}
  min={1}
  max={100}
  step={1}
/>
```

### D3 Slider (`/src/utils/d3-slider.js`)
For custom D3-based sliders:

```javascript
import { create_slider } from '../utils/d3-slider';

// Inside D3 rendering
const slider = create_slider(svg, {
  x: 50,
  y: 100,
  width: 200,
  min: 0,
  max: 1,
  value: 0.5,
  onChange: (value) => {
    // Handle value change
  },
  color: colorScheme.chart.primary,
  showValue: true
});

// Update slider programmatically
slider.update(0.75);
```

## 5. Statistics Utilities (`/src/utils/stats.js`)

Pre-configured distributions using jstat:

```javascript
import { distributions } from '../utils/stats';

// Available distributions
const normal = distributions.Normal;
normal.pdf(x)      // Probability density function
normal.sample()    // Generate random sample
normal.trueMean    // Theoretical mean
normal.trueVar     // Theoretical variance

// Also available: Uniform, Exponential
```

## 6. Common Visualization Patterns

### Pattern 1: Interactive Distribution Visualization
See `/src/components/03-continuous-random-variables/ContinuousDistributionsPDF.jsx`:
- Distribution selector
- Parameter controls
- Real-time PDF plotting
- Interval probability calculation
- Worked example integration

### Pattern 2: Progressive Learning with Milestones
See `/src/components/CLTSimulation.jsx`:
- Milestone tracking (e.g., "Collect 30 samples")
- Progressive UI updates
- Animation controls
- Statistical convergence visualization

### Pattern 3: Draggable Probability Bars
See `/src/components/02-discrete-random-variables/ExpectationVariance.jsx`:
- Draggable probability distribution
- Real-time redistribution
- Smooth D3 transitions
- Live statistical calculations

### Pattern 4: Step-by-Step Calculations
See `/src/components/03-continuous-random-variables/IntegralWorkedExample.jsx`:
- Mathematical step breakdown
- LaTeX rendering with anti-flash
- Dynamic equation updates
- Consistent styling

## 7. Best Practices

### Maximize Visualization Space (80-90% Rule)
```javascript
// Bad: Small viz in large container
<div className="p-8">
  <svg width="200" height="150" />
</div>

// Good: Viz fills container
<GraphContainer height="500px">
  <svg ref={svgRef} className="w-full" />
</GraphContainer>
```

### Consistent Number Formatting
```javascript
// Always use monospace font for numbers
<span className={typography.value}>{formatNumber(value, 3)}</span>

// In D3
svg.append('text')
  .attr('font-family', 'monospace')
  .text(d3.format('.3f')(value));
```

### Responsive Design
```javascript
// Use Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="order-2 md:order-1">Controls</div>
  <div className="order-1 md:order-2">Visualization</div>
</div>
```

### Performance Optimization
```javascript
// Memoize expensive calculations
const memoizedData = useMemo(() => 
  calculateExpensiveData(params), [params]);

// Use React.memo for pure components
export default memo(MyComponent);

// Debounce rapid updates
const [displayValue, setDisplayValue] = useState(value);
useEffect(() => {
  const timer = setTimeout(() => setDisplayValue(value), 300);
  return () => clearTimeout(timer);
}, [value]);
```

## 8. File Structure for New Components

When creating a new visualization:

```
/src/components/[chapter-folder]/
  ├── MyVisualization.jsx          # Main component
  ├── MyVisualizationWorkedExample.jsx  # Mathematical examples
  └── index.js                     # Optional barrel export
```

## 9. Component Template

Here's a minimal template incorporating these patterns:

```javascript
"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "../utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, formatNumber, createColorScheme } from '../../lib/design-system';
import { RangeSlider } from "../ui/RangeSlider";
import useD3 from "../../hooks/useD3";

const colorScheme = createColorScheme('probability');

export default function MyVisualization() {
  const [param, setParam] = useState(0.5);
  
  const svgRef = useD3((svg, { w, h }) => {
    // D3 rendering logic
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Add background
    svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Your visualization code here
    
  }, [param]); // Re-render when param changes
  
  return (
    <VisualizationContainer title="My Visualization">
      <VisualizationSection title="Controls">
        <ControlGroup>
          <RangeSlider
            label="Parameter"
            value={param}
            onChange={setParam}
            min={0}
            max={1}
            step={0.01}
          />
        </ControlGroup>
      </VisualizationSection>
      
      <VisualizationSection title="Visualization" divider>
        <GraphContainer height="400px">
          <svg ref={svgRef} className="w-full" />
        </GraphContainer>
      </VisualizationSection>
    </VisualizationContainer>
  );
}
```

## 10. Common D3 Patterns

### Creating Scales
```javascript
const xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, innerWidth]);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([innerHeight, 0]);
```

### Adding Axes
```javascript
// X axis
svg.append("g")
  .attr("transform", `translate(0,${innerHeight})`)
  .call(d3.axisBottom(xScale))
  .selectAll("text")
  .attr("fill", colors.chart.text);

// Grid lines
svg.append("g")
  .attr("class", "grid")
  .call(d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickFormat("")
  )
  .style("stroke-dasharray", "3,3")
  .style("opacity", 0.3)
  .selectAll("line")
  .style("stroke", colors.chart.grid);
```

### Drawing Lines/Areas
```javascript
const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y))
  .curve(d3.curveMonotoneX);

svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", colorScheme.chart.primary)
  .attr("stroke-width", 2)
  .attr("d", line);
```

### Transitions
```javascript
svg.selectAll(".bar")
  .data(data)
  .transition()
  .duration(300)
  .ease(d3.easeCubicInOut)
  .attr("height", d => yScale(0) - yScale(d.value));
```

This guide covers the major reusable patterns in the codebase. When building new components, always check these existing utilities first to maintain consistency and reduce code duplication.