# Plan: 7.6 - Coefficient of Determination (R²)

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
1. **Mathematical Rigor + Interactivity**: Teach R² as proportion of variance explained
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match ErrorsAndPower and DifferenceOfTwoProportions structure
4. **Simplicity**: Clear visual representation of explained vs unexplained variation
5. **LaTeX Excellence**: Follow exact patterns from gold standard components

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
const RSquaredIntroduction = React.memo(function RSquaredIntroduction() {
  // Core question: "How good is our model?"
  // R² = Proportion of variation explained by regression
  // Preview: R² = SSR/SST = 1 - SSE/SST
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with key formulas:
  // Card 1: R² = SSR/SST (explained/total)
  // Card 2: R² = 1 - SSE/SST (complement)
  // Card 3: R² = r² (correlation squared)
  // Card 4: Interpretation scale (0 to 1)
});
```

### 3. Main Interactive Visualization

**R² Visual Representation:**
```jsx
const RSquaredVisualization = () => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [displayType, setDisplayType] = useState('pie'); // pie, bar, or area
  
  // Show R² = 87.7% for fuel data
  // Visual options:
  // - Pie chart (explained vs unexplained)
  // - Stacked bar
  // - Area representation
};
```

### 4. Worked Example Component
Following ErrorsAndPower pattern:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Calculate R² three ways:
  // Method 1: R² = SSR/SST = 152.14/173.38 = 0.877
  // Method 2: R² = 1 - SSE/SST = 1 - 21.24/173.38 = 0.877
  // Method 3: R² = r² = (0.937)² = 0.877
  // Show all calculations match
});
```

### 5. Key Insights Section

**R² vs Correlation:**
```jsx
const RSquaredVsCorrelation = () => {
  // Show relationship: R² = r² for simple regression
  // Visual proof with actual values
  // Explain why R² has no sign
};
```

**Model Comparison:**
```jsx
const ModelComparison = () => {
  // Compare different R² values:
  // Poor fit: R² < 0.3
  // Moderate: 0.3 < R² < 0.7
  // Good: R² > 0.7
  // Show visual examples
};
```

### 6. Visual Components

**Variance Pie Chart:**
```jsx
const VariancePieChart = ({ rSquared }) => {
  // Animated pie chart
  // Explained portion (blue)
  // Unexplained portion (gray)
  // Percentage labels
};
```

**Goodness of Fit Scale:**
```jsx
const GoodnessScale = ({ rSquared }) => {
  // Visual scale from 0 to 1
  // Color gradient (red to green)
  // Marker at current R²
  // Interpretation label
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [visualType, setVisualType] = useState('pie');
const [showCalculations, setShowCalculations] = useState(false);
const [comparisonMode, setComparisonMode] = useState(false);
```

**R² Calculations:**
```javascript
const calculateRSquared = (regressionResults) => {
  const { sst, ssr, sse, correlation } = regressionResults;
  
  // Three equivalent methods
  const method1 = ssr / sst;
  const method2 = 1 - (sse / sst);
  const method3 = correlation ** 2;
  
  return {
    value: method1,
    methods: { method1, method2, method3 },
    percentage: (method1 * 100).toFixed(1)
  };
};
```

### 8. Layout Structure

Following Chapter 6 pattern:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title and introduction
4. Mathematical framework grid
5. Main R² visualization
6. Worked example with three methods
7. Key insights section
8. Model interpretation guide

### 9. Specific Features to Include

1. **Multiple Visual Representations**: Pie, bar, and area charts
2. **Three Calculation Methods**: Show equivalence
3. **Interpretation Guide**: What R² values mean
4. **Connection to Correlation**: Show R² = r²
5. **Limitations Discussion**: What R² doesn't tell us

### 10. Animation Details

```javascript
// Pie chart animation
const animatePieChart = (rSquared) => {
  // Start from 0
  // Sweep to final R² value
  // Pulse on completion
};

// Scale animation
const animateScale = (value) => {
  // Marker slides to position
  // Color transitions smoothly
  // Label fades in
};
```

### 11. Visual Design

**Color Scheme:**
```javascript
const rSquaredColors = {
  explained: '#3b82f6',    // Blue for explained variation
  unexplained: '#9ca3af',  // Gray for unexplained
  excellent: '#10b981',    // Green for high R²
  good: '#3b82f6',        // Blue for moderate R²
  poor: '#ef4444'         // Red for low R²
};
```

### 12. Practical Interpretation

**R² Interpretation Guide:**
```jsx
const InterpretationGuide = () => {
  // Context-dependent interpretation
  // Physical sciences: expect high R²
  // Social sciences: lower R² common
  // Important warnings about R² limitations:
  // - R² alone doesn't indicate model adequacy
  // - High R² doesn't guarantee good predictions
  // - R² can be affected by number of observations
  // - Always check residual plots for model validity
};
```

**Note:** The interpretation thresholds (< 0.3 poor, 0.3-0.7 moderate, > 0.7 good) are general guidelines, not absolute rules. R² interpretation must consider the field of study and specific context.

### 13. Technical Notes

**Performance:**
- Smooth animations with requestAnimationFrame
- Pre-calculate all visualization data
- Efficient pie chart rendering

**Mathematical Precision:**
- Show all three methods yield same result
- Handle rounding consistently
- Verify 0 ≤ R² ≤ 1

**Summary Connection:**
- Link back to correlation (Section 7.1)
- Reference ANOVA decomposition (Section 7.5)
- Complete the regression story

**File Location:** `/src/components/07-linear-regression/7-6-CoefficientOfDetermination.jsx`