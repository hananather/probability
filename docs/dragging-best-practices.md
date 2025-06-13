# D3 Dragging Best Practices

## Common Issues and Solutions

### 0. Using Absolute Position Instead of Relative Movement (Most Common!)

**Issue**: Handle jumps to mouse position instead of moving smoothly. When you click a resize handle, it immediately collapses or expands to wherever your mouse is.

**Root Cause**: Using `event.x` directly as the new position instead of calculating the movement delta.

```jsx
// ❌ BAD: Direct position assignment causes jumping
const dragLeft = d3.drag()
  .on("drag", function(event, d) {
    const newX = scale.invert(event.x);
    // Element jumps to mouse position!
    updateElement(newX);
  });
```

**Solution**: Track initial position and calculate deltas:

```jsx
// ✅ GOOD: Delta-based movement
const dragLeft = d3.drag()
  .on("start", function(event, d) {
    // Store where the drag started
    d.dragStartX = event.x;
    d.initialX = d.x;
    d.initialWidth = d.width;
  })
  .on("drag", function(event, d) {
    // Calculate how far we've moved
    const deltaX = event.x - d.dragStartX;
    
    // Apply delta to initial position
    const newX = d.initialX + scale.invert(d.dragStartX + deltaX) - scale.invert(d.dragStartX);
    
    // Update with constraints
    updateElement(Math.max(minX, Math.min(maxX, newX)));
  });
```

**The Key Pattern**:
1. On drag start: Store initial mouse position and element state
2. On drag: Calculate delta from start position
3. Apply delta to initial element state
4. This maintains the relative position between mouse and element

Think of it like picking up a book - when you grab it, the book doesn't jump to your hand position, it maintains its relative position as you move.

### 1. The SVG Re-rendering Problem

**Issue**: Components rebuild the entire SVG on every state change, causing:
- Laggy, jumpy dragging
- Loss of drag state
- Poor performance

**Root Cause**: Mixing D3's imperative DOM manipulation with React's declarative rendering.

```jsx
// ❌ BAD: SVG recreated on every render
useEffect(() => {
  svg.selectAll("*").remove(); // Destroys everything!
  // ... rebuild entire visualization
}, [value]); // Runs whenever value changes
```

**Solution**: Separate initialization from updates:

```jsx
// ✅ GOOD: Initialize once, update only what changes
useEffect(() => {
  // Initialize SVG only once
  if (!isInitialized.current) {
    // ... create static elements
    isInitialized.current = true;
  }
}, []); // Empty deps - runs once

useEffect(() => {
  // Update only dynamic elements
  if (isInitialized.current) {
    d3.select(elementRef.current)
      .attr("x", newValue); // Direct update
  }
}, [newValue]); // Only update when value changes
```

### 2. Debouncing Causes Lag

**Issue**: Adding debouncing to "improve performance" actually makes dragging feel sluggish.

```jsx
// ❌ BAD: Debounced updates feel laggy
let dragTimeout;
drag.on("drag", (event) => {
  clearTimeout(dragTimeout);
  dragTimeout = setTimeout(() => {
    setValue(newValue);
  }, 10); // Even 10ms is noticeable!
});
```

**Solution**: Update immediately, optimize elsewhere:

```jsx
// ✅ GOOD: Immediate updates
drag.on("drag", (event) => {
  // Update D3 elements directly
  d3.select(this).attr("x", event.x);
  
  // Update React state for other components
  setValue(newValue);
});
```

### 3. State Update Patterns

**Issue**: Updating React state on every drag event can cause performance issues.

**Solution**: Use refs for drag state, update React state strategically:

```jsx
// ✅ GOOD: Ref for dragging, state for final value
const dragValueRef = useRef(value);

const drag = d3.drag()
  .on("drag", (event) => {
    // Update ref (no re-render)
    dragValueRef.current = newValue;
    
    // Update D3 directly
    d3.select(element).attr("x", scale(newValue));
  })
  .on("end", () => {
    // Update React state when done
    setValue(dragValueRef.current);
  });
```

## Using the Reusable Components

### 1. Basic Draggable Element

```jsx
import { D3DragWrapper } from '../ui/D3DragWrapper';

function MyVisualization() {
  const handleDrag = (x, y) => {
    console.log('Dragging to:', x, y);
  };

  return (
    <svg width={600} height={400}>
      <D3DragWrapper
        onDrag={handleDrag}
        constraints={{ minX: 0, maxX: 600, minY: 0, maxY: 400 }}
        initialPosition={{ x: 300, y: 200 }}
      >
        <circle r="10" fill="#60a5fa" />
      </D3DragWrapper>
    </svg>
  );
}
```

### 2. Value-based Dragging (Sliders, Thresholds)

```jsx
import { DraggableHandle } from '../ui/D3DragWrapper';

function ThresholdAdjuster({ threshold, setThreshold }) {
  const scale = d3.scaleLinear()
    .domain([0, 100])
    .range([50, 550]);

  return (
    <svg width={600} height={100}>
      <line x1={50} x2={550} y1={50} y2={50} stroke="#ccc" />
      
      <DraggableHandle
        value={threshold}
        onChange={setThreshold}
        scale={scale}
        axis="x"
        bounds={[0, 100]}
      />
      
      <text x={scale(threshold)} y={30} textAnchor="middle">
        {threshold.toFixed(1)}
      </text>
    </svg>
  );
}
```

### 3. Draggable Probability Bars

```jsx
import { DraggableBars } from '../ui/D3DragWrapper';

function ProbabilityDistribution() {
  const [data, setData] = useState([
    { id: 1, label: 'A', value: 0.25, color: '#60a5fa' },
    { id: 2, label: 'B', value: 0.25, color: '#34d399' },
    { id: 3, label: 'C', value: 0.25, color: '#f59e0b' },
    { id: 4, label: 'D', value: 0.25, color: '#ef4444' }
  ]);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([50, 550])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([350, 50]);

  return (
    <svg width={600} height={400}>
      <DraggableBars
        data={data}
        xScale={xScale}
        yScale={yScale}
        onChange={setData}
        redistributeLogic="proportional"
      />
    </svg>
  );
}
```

## Migration Guide

### Fixing TypeErrorVisualizer Pattern

**Before**: Re-renders entire SVG on threshold change
```jsx
useEffect(() => {
  svg.selectAll("*").remove();
  // ... rebuild everything
}, [threshold]);
```

**After**: Separate static and dynamic elements
```jsx
// Initialize once
useEffect(() => {
  // Create distributions, axes, etc.
  // Store references
  thresholdLineRef.current = svg.append("line");
}, []);

// Update only threshold
useEffect(() => {
  if (thresholdLineRef.current) {
    thresholdLineRef.current
      .attr("x1", scale(threshold))
      .attr("x2", scale(threshold));
  }
}, [threshold]);
```

### Fixing ExpectationVariance Pattern

**Before**: Recreate bars on every probability change
```jsx
useEffect(() => {
  // Entire bar chart recreated
}, [probs]);
```

**After**: Use DraggableBars component
```jsx
<DraggableBars
  data={probs.map((p, i) => ({
    id: i,
    value: p,
    label: i + 1
  }))}
  onChange={handleProbsChange}
  redistributeLogic="proportional"
/>
```

## Performance Tips

1. **Use CSS for hover states** instead of D3 event handlers when possible
2. **Batch DOM updates** using `d3.selection.call()`
3. **Use `transform` instead of individual x/y attributes** for better performance
4. **Throttle state updates** to parent components if needed (but not the visual updates!)
5. **Use React.memo** for components that receive frequently updating props

## Testing Smooth Dragging

```jsx
// Test component for validating smooth dragging
function DragTest() {
  const [value, setValue] = useState(50);
  const [dragCount, setDragCount] = useState(0);

  return (
    <div>
      <p>Value: {value}</p>
      <p>Drag events: {dragCount}</p>
      <svg width={400} height={100}>
        <DraggableHandle
          value={value}
          onChange={setValue}
          scale={d3.scaleLinear().domain([0, 100]).range([50, 350])}
          axis="x"
          bounds={[0, 100]}
        />
      </svg>
    </div>
  );
}
```

## Summary

The key to smooth D3 dragging in React:
1. **Initialize once, update selectively**
2. **No debouncing during drag**
3. **Direct DOM manipulation for visual updates**
4. **Strategic React state updates**
5. **Use the provided reusable components**

By following these patterns, you'll achieve smooth, responsive dragging that feels native and performs well even with complex visualizations.