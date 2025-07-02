# Plan: 7.4 - Confidence and Prediction Intervals

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Gold Standard Task Files:**
- `/Users/hananather/Desktop/Javascript/prob-lab/tasks/chapter-6/09-DifferenceOfTwoProportions.md`
- `/Users/hananather/Desktop/Javascript/prob-lab/tasks/chapter-6/03-ErrorsAndPower.md`

**Guiding Philosophy:** Create a version that prioritizes rigorous learning with clear explanations, mathematical formulations, and meaningful interactions that reinforce understanding.

**Core Development Principles:**
1. **Mathematical Rigor + Interactivity**: Teach CI vs PI through visual comparison
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match ErrorsAndPower and DifferenceOfTwoProportions structure
4. **Simplicity**: Use clear visualizations to show interval differences
5. **LaTeX Excellence**: Follow exact patterns from gold standard components

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
const IntervalsIntroduction = React.memo(function IntervalsIntroduction() {
  // Core question: "How precise are our predictions?"
  // Distinguish between:
  // - CI: Interval for the mean response
  // - PI: Interval for individual observations
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with formulas:
  // Card 1: CI formula - ŷ ± t_{α/2,n-2} × SE(ŷ)
  // Card 2: PI formula - ŷ ± t_{α/2,n-2} × SE(pred)
  // Card 3: Why PI > CI always
  // Card 4: Interpretation differences
});
```

### 3. Main Interactive Visualization

**Interval Comparison:**
```jsx
const IntervalVisualization = () => {
  const [xValue, setXValue] = useState(1.2);
  const [showCI, setShowCI] = useState(true);
  const [showPI, setShowPI] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  
  // Scatter plot with regression line
  // CI bands (narrow, for mean)
  // PI bands (wide, for individuals)
  // Interactive x-value selector
};
```

### 4. Worked Example Component
Following ErrorsAndPower pattern:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Calculate both intervals for x₀ = 1.28
  // Show all steps:
  // 1. Calculate ŷ₀
  // 2. Calculate SE(ŷ₀) for CI
  // 3. Calculate SE(pred) for PI
  // 4. Find critical t-value
  // 5. Construct both intervals
});
```

### 5. Key Insights Section

**Why PI > CI:**
```jsx
const IntervalWidthExplanation = () => {
  // Visual demonstration:
  // CI: Uncertainty about the mean only
  // PI: Mean uncertainty + individual variation
  // Formula comparison showing extra σ² term
};
```

**Extrapolation Warning:**
```jsx
const ExtrapolationDanger = () => {
  // Show intervals widening outside data range
  // Visual warning zones
  // Real example of extrapolation failure
};
```

### 6. Visual Components

**Interval Band Visualization:**
```jsx
const IntervalBands = ({ regressionLine, alpha, type }) => {
  // Smooth curves for CI and PI
  // Different opacity/color for each
  // Animate width changes with confidence level
};
```

**Width Comparison Chart:**
```jsx
const WidthComparison = ({ x, ciWidth, piWidth }) => {
  // Bar chart showing relative widths
  // Update as x-value changes
  // Show ratio PI/CI
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [xValue, setXValue] = useState(1.2);
const [alpha, setAlpha] = useState(0.05);
const [showFormulas, setShowFormulas] = useState(false);
const [intervalType, setIntervalType] = useState('both');
```

**Interval Calculations:**
```javascript
const calculateIntervals = (x0, regressionResults, alpha) => {
  const { b0, b1, mse, xMean, sxx, n } = regressionResults;
  
  // Point estimate
  const y0 = b0 + b1 * x0;
  
  // Standard errors
  const se_mean = Math.sqrt(mse * (1/n + (x0 - xMean)**2 / sxx));
  const se_pred = Math.sqrt(mse * (1 + 1/n + (x0 - xMean)**2 / sxx));
  
  // Critical value
  const t_crit = jStat.studentt.inv(1 - alpha/2, n - 2);
  
  return {
    ci: { lower: y0 - t_crit * se_mean, upper: y0 + t_crit * se_mean },
    pi: { lower: y0 - t_crit * se_pred, upper: y0 + t_crit * se_pred }
  };
};
```

### 8. Layout Structure

Following Chapter 6 pattern:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title and introduction
4. Mathematical framework grid
5. Main visualization with slider
6. Worked example section
7. Key insights with demos
8. Summary comparison table

### 9. Specific Features to Include

1. **Interactive X-Value Slider**: Choose prediction point
2. **Confidence Level Control**: 90%, 95%, 99% options
3. **Interval Toggle**: Show/hide CI and PI separately
4. **Width Visualization**: Compare interval widths
5. **Extrapolation Warning**: Visual danger zones

### 10. Animation Details

```javascript
// Smooth interval transitions
const animateIntervals = (newX) => {
  // Interpolate band widths
  // Fade in/out interval fills
  // Highlight selected x-value
};

// Confidence level animation
const animateConfidenceChange = (newAlpha) => {
  // Smooth band expansion/contraction
  // Update width indicators
  // Show critical value change
};
```

### 11. Technical Notes

**Visual Design:**
- CI bands: Semi-transparent blue
- PI bands: Semi-transparent green
- Overlap area: Darker shade
- Selected point: Highlighted marker

**Performance:**
- Pre-calculate interval points
- Use React.memo for static formulas
- Efficient band rendering with d3

**Accessibility:**
- Announce interval values on change
- Keyboard control for slider
- Clear legend for band types

**File Location:** `/src/components/07-linear-regression/7-4-ConfidencePredictionIntervals.jsx`