# Tab4InteractiveTab.jsx Bug Fixes - What I Learned

## Bugs Fixed

### 1. Infinite Loop Bug (CRITICAL)
**What was broken:** Component was stuck in an infinite render loop
**Why it was broken:** useEffect that initialized pebble positions used `pebbles` state but didn't include it in dependencies. This caused React to miss the dependency, and when `setPebbles` was called, it triggered a re-render without React knowing the effect depended on `pebbles`.
**Pattern that fixed it:** Used functional state update `setPebbles(prev => ...)` and only update positions if they haven't been set yet (checking for x === 0 && y === 0)

### 2. D3 Event Listener Memory Leak
**What was broken:** Click event listeners were attached during D3 enter selection but never cleaned up
**Why it was broken:** Event listeners were only added to entering elements, not to the merged selection, and cleanup didn't remove listeners
**Pattern that fixed it:** Moved event listener attachment to after the merge operation so all pebbles (enter + update) get handlers

### 3. SVG Text Element Accumulation
**What was broken:** Selected pebble info text kept appending new elements without removing old ones
**Why it was broken:** Code always appended new text elements without checking for or removing existing ones
**Pattern that fixed it:** Added class "selected-info" to text element and remove any existing element with that class before adding new one

## Key Patterns Learned

1. **useEffect Dependencies**: Always include all state variables used inside useEffect, or use functional updates to avoid dependencies
2. **D3 Cleanup**: Use specific class names for elements and remove them explicitly in cleanup
3. **Event Handlers in D3**: Attach handlers to the merged selection (enter + update), not just enter
4. **Preventing Accumulation**: Always remove existing elements before appending new ones, use unique classes/IDs

## Similar Issues to Watch For
- Other components with D3 visualizations may have similar cleanup issues
- Check for missing useEffect dependencies in other interactive components
- Look for append operations without corresponding remove operations