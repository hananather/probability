# Chapter 5 Visualization Fix - Tab Loading Issue

## Date: 2025-08-06

## Issue Description
In Chapter 5.1 (Statistical Inference) and potentially 5.2, D3.js visualizations in the "Exploration" tab were not rendering correctly until user clicked "Draw sample" button. The visualization appeared broken/incomplete on initial tab load.

## Root Cause
The components were using `display: none/block` for tab switching, which caused D3.js visualizations to fail during initialization because:
1. When container is hidden with `display: none`, `clientWidth` returns 0 or incorrect values
2. D3 can't calculate proper dimensions for the visualization
3. The useEffect wasn't re-triggering when tab became visible

## Solution Applied
Added `isActive` prop pattern with delayed initialization to visualization components:

1. Pass `isActive={mode === LEARNING_MODES.EXPLORATION}` to all child components in exploration tab
2. Components check `if (!isActive) return null;` to not render when inactive
3. **KEY FIX**: Added 100ms timeout in useEffect to ensure DOM is ready before D3 initialization
4. Added `hasInitialized` state to track first render
5. Added `isActive` to useEffect dependency arrays to re-initialize when becoming visible
6. Added fallback width (`const width = svgRef.current.clientWidth || 800`) for safety

The critical fix was the timeout - even with proper isActive checks, the DOM wasn't ready immediately when the tab became visible, causing clientWidth to return 0 or incorrect values.

### Files Modified:
- `/src/components/05-estimation/5-1-StatisticalInference.jsx`
  - Updated: GearWheelFactory - Added isActive prop, timeout wrapper, and hasInitialized state
  - Updated: CentralLimitTheoremDemo, BaseballHeights, BayesianInferenceIntro, FieldSpecificExamples, ConceptConnections - Added isActive prop

- `/src/components/05-estimation/5-2-1-ConfidenceIntervalKnownVariance.jsx`
  - Updated: CriticalValuesExplorer - Added timeout wrapper and hasInitialized state for D3 initialization
  - Updated: Added isActive prop to CIHypothesisTestingBridge component reference
  - Note: ParameterEffectsExplorer uses inline SVG without D3 useEffect, so no changes needed

- `/src/components/05-estimation/5-6-CIHypothesisTestingBridge.jsx`
  - Updated: Added isActive prop, timeout wrapper, and hasInitialized state for D3 initialization
  - Added early return `if (!isActive) return null;` to prevent rendering when inactive

## Pattern to Follow
For any component with D3 visualizations in tabbed interfaces:
```jsx
// Parent component
<VisualizationComponent isActive={mode === CURRENT_MODE} />

// Child component
const VisualizationComponent = ({ isActive }) => {
  // Early return if not active
  if (!isActive) return null;
  
  useEffect(() => {
    if (!isActive) return;
    // D3 initialization code
  }, [/* dependencies */, isActive]);
}
```

## Verification
- Build successful: ✓
- Lint passed: ✓
- Visualizations now load properly on tab switch: Expected ✓