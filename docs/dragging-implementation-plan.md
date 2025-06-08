# Dragging Implementation Plan

## Overview
We've identified a recurring issue with clunky dragging mechanics across multiple visualization components. The root cause is SVG re-rendering during drag operations, causing lag and poor user experience.

## Solution Architecture

### 1. Core Utilities Created
- **`/src/hooks/useD3Drag.js`** - Reusable hooks for D3 dragging
  - `useD3Drag` - Basic dragging with constraints
  - `useD3ValueDrag` - Value-based dragging (sliders, thresholds)
  - `useD3BarDrag` - Multi-bar dragging with redistribution

- **`/src/components/ui/D3DragWrapper.jsx`** - Ready-to-use components
  - `D3DragWrapper` - Generic draggable wrapper
  - `DraggableHandle` - For sliders and value adjusters
  - `DraggableBars` - For probability distributions
  - `withSmoothDragging` - HOC for preventing re-renders

### 2. Components to Fix

#### High Priority (Currently Broken)
1. **ConditionalProbability** (`/src/components/01-introduction-to-probabilities/ConditionalProbability.jsx`)
   - Issue: Event rectangles likely recreate on drag
   - Fix: Use separate drag handlers, update positions directly
   - Example: See `/src/components/examples/ConditionalProbabilityFixed.jsx`

2. **NormalZScoreExplorer** (`/src/components/03-continuous-random-variables/NormalZScoreExplorer.jsx`)
   - Issue: Potential full re-render on value change
   - Fix: Use `DraggableHandle` component for the draggable point

#### Already Fixed
- ✅ TypeErrorVisualizer
- ✅ ExpectationVariance

### 3. Implementation Steps

#### Step 1: Audit Component
```javascript
// Look for these anti-patterns:
useEffect(() => {
  svg.selectAll("*").remove(); // ❌ Bad!
  // Rebuilds entire SVG
}, [someValue]);
```

#### Step 2: Separate Initialization from Updates
```javascript
// ✅ Good pattern:
// Initialize once
useEffect(() => {
  // Create static elements
  // Store refs to dynamic elements
}, []); // Empty deps

// Update only what changes
useEffect(() => {
  if (elementRef.current) {
    elementRef.current.attr("x", newValue);
  }
}, [newValue]);
```

#### Step 3: Apply Appropriate Solution

**For Simple Draggable Elements:**
```jsx
import { D3DragWrapper } from '../ui/D3DragWrapper';

<D3DragWrapper
  onDrag={(x, y) => updatePosition(x, y)}
  constraints={{ minX: 0, maxX: width }}
>
  <circle r="10" fill="#60a5fa" />
</D3DragWrapper>
```

**For Value-based Dragging:**
```jsx
import { DraggableHandle } from '../ui/D3DragWrapper';

<DraggableHandle
  value={threshold}
  onChange={setThreshold}
  scale={xScale}
  axis="x"
  bounds={[minValue, maxValue]}
/>
```

**For Probability Bars:**
```jsx
import { DraggableBars } from '../ui/D3DragWrapper';

<DraggableBars
  data={probabilities}
  xScale={xScale}
  yScale={yScale}
  onChange={setProbabilities}
  redistributeLogic="proportional"
/>
```

### 4. Testing Checklist

- [ ] Dragging feels smooth and responsive
- [ ] No lag or jumpiness during drag
- [ ] Values update in real-time
- [ ] Other components receive updates appropriately
- [ ] No console errors during drag
- [ ] Performance is good with rapid dragging

### 5. Migration Example: ConditionalProbability

**Current Issues:**
1. Event rectangles might recreate on position change
2. Overlap calculations might trigger re-renders
3. No clear separation of drag logic

**Migration Steps:**
1. Extract event rendering to initialization phase
2. Use direct D3 updates during drag
3. Update React state only on drag end
4. Use refs for accessing DOM elements

**Code Structure:**
```jsx
// Initialize once
useEffect(() => {
  const svg = d3.select(svgRef.current);
  
  // Create event rectangles
  const events = svg.selectAll('.event')
    .data(eventsData)
    .join('g')
    .attr('class', 'event');
    
  // Store refs
  eventsRef.current = events;
  
  // Apply drag behavior
  events.each(function(d) {
    d3.select(this).call(
      d3.drag()
        .on('drag', handleDrag)
        .on('end', handleDragEnd)
    );
  });
}, []); // Run once

// Update positions without re-creating
useEffect(() => {
  if (eventsRef.current) {
    eventsRef.current
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
  }
}, [eventsData]);
```

### 6. Future Components

When creating new draggable visualizations:

1. **Start with the reusable components** - Don't reinvent the wheel
2. **Follow the initialization pattern** - Set up once, update selectively
3. **Test dragging early** - Don't wait until the end to add drag behavior
4. **Document drag constraints** - Make it clear what can be dragged and how

### 7. Performance Considerations

- Use `transform` instead of individual x/y updates when possible
- Batch DOM operations
- Consider using `requestAnimationFrame` for very complex updates
- Profile with Chrome DevTools if performance issues arise

### 8. Next Steps

1. **Immediate**: Fix ConditionalProbability using the example pattern
2. **This Week**: Audit and fix NormalZScoreExplorer
3. **Ongoing**: Update any other components with dragging as discovered
4. **Future**: Use the new components for all new visualizations

## Resources

- Best practices guide: `/docs/dragging-best-practices.md`
- Example implementation: `/src/components/examples/ConditionalProbabilityFixed.jsx`
- Reusable hooks: `/src/hooks/useD3Drag.js`
- Component library: `/src/components/ui/D3DragWrapper.jsx`