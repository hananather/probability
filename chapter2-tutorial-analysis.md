# Chapter 2 Tutorial Button Analysis

## Summary of Components

| Component | File | Uses VisualizationContainer? | Has title? | Has tutorialSteps? | Shows Tutorial Button? |
|-----------|------|----------------------------|------------|-------------------|----------------------|
| SpatialRandomVariable | 2-1-1-SpatialRandomVariable.jsx | Yes | No | Yes | No - Missing title |
| SpatialRandomVariable-Refactored | 2-1-1-SpatialRandomVariable-Refactored.jsx | No | N/A | N/A | No - Doesn't use VisualizationContainer |
| ExpectationVariance | 2-2-1-ExpectationVariance.jsx | Yes | Yes | Yes | Yes ✓ |
| ExpectationVarianceWorkedExample | 2-2-2-ExpectationVarianceWorkedExample.jsx | No | N/A | N/A | No - Worked example component |
| LinearTransformations | 2-3-1-LinearTransformations.jsx | Yes | No | Yes | No - Missing title |
| FunctionTransformations | 2-3-2-FunctionTransformations.jsx | Yes | No | Yes | No - Missing title |

## Components Missing Tutorial Buttons

The following components need the `title` prop added to show tutorial buttons:

1. **2-1-1-SpatialRandomVariable.jsx**
   - Line 720: `<VisualizationContainer tutorialSteps={tutorial_2_1_1} tutorialKey="spatial-random-variable-2-1-1">`
   - Need to add: `title="Spatial Random Variable"`

2. **2-3-1-LinearTransformations.jsx**
   - Line 367: `<VisualizationContainer tutorialSteps={tutorial_2_3_1} tutorialKey="linear-transformations-2-3-1">`
   - Need to add: `title="Linear Transformations"`

3. **2-3-2-FunctionTransformations.jsx**
   - Line 382: `<VisualizationContainer tutorialSteps={tutorial_2_3_2} tutorialKey="function-transformations-2-3-2">`
   - Need to add: `title="Function Transformations"`

## Note on Refactored Component

The refactored SpatialRandomVariable (2-1-1-SpatialRandomVariable-Refactored.jsx) doesn't use VisualizationContainer at all, so it would need a complete restructuring to add tutorial support.

## Working Example

ExpectationVariance (2-2-1-ExpectationVariance.jsx) correctly implements the tutorial button:
```jsx
<VisualizationContainer
  title="🎲 Expectation & Variance Explorer"
  tutorialSteps={tutorial_2_2_1}
  tutorialKey="expectation-variance-2-2-1"
  description={...}
>
```