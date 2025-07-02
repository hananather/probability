# Plan: 7.5 - Analysis of Variance (ANOVA) for Regression

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
1. **Mathematical Rigor + Interactivity**: Teach variance decomposition visually
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match ErrorsAndPower and DifferenceOfTwoProportions structure
4. **Simplicity**: Use clear animations to show SST = SSR + SSE
5. **LaTeX Excellence**: Follow exact patterns from gold standard components

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
const ANOVAIntroduction = React.memo(function ANOVAIntroduction() {
  // Core question: "Where does the variation in Y come from?"
  // Preview: Total variation splits into explained + unexplained
  // Show the fundamental equation: SST = SSR + SSE
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with key concepts:
  // Card 1: SST - Total Sum of Squares
  // Card 2: SSR - Regression Sum of Squares
  // Card 3: SSE - Error Sum of Squares
  // Card 4: F-test = MSR/MSE
});
```

### 3. Main Interactive Visualization

**Variance Decomposition Animation:**
```jsx
const VarianceDecomposition = () => {
  const [showDecomposition, setShowDecomposition] = useState(false);
  const [highlightComponent, setHighlightComponent] = useState('total');
  
  // Visual breakdown:
  // 1. Show total variation (y - ȳ)
  // 2. Split into regression (ŷ - ȳ)
  // 3. And residual (y - ŷ)
  // Animate the decomposition
};
```

### 4. Worked Example Component
Following ErrorsAndPower pattern:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // ANOVA table construction:
  // Source | SS | df | MS | F
  // Regression | SSR | 1 | MSR | F
  // Error | SSE | n-2 | MSE |
  // Total | SST | n-1 | |
  
  // Calculate all values with fuel data
  // Show F = 128.86, p < 0.0001
});
```

### 5. Key Insights Section

**Visual Proof of SST = SSR + SSE:**
```jsx
const VarianceProof = () => {
  // Geometric demonstration
  // Show perpendicular components
  // Pythagorean theorem visualization
};
```

**F-test Connection:**
```jsx
const FTestConnection = () => {
  // Show F = t² for simple regression
  // Demonstrate with actual values
  // F = 128.86 = (11.35)²
};
```

### 6. Visual Components

**ANOVA Table Component:**
```jsx
const ANOVATable = ({ sst, ssr, sse, n }) => {
  // Formatted table with calculations
  // Highlight F-statistic
  // Show p-value interpretation
};
```

**Variation Bars:**
```jsx
const VariationBars = ({ sst, ssr, sse }) => {
  // Stacked bar showing decomposition
  // SSR portion (explained)
  // SSE portion (unexplained)
  // Percentages labeled
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [animationStep, setAnimationStep] = useState('initial');
const [showCalculations, setShowCalculations] = useState(false);
const [highlightedSS, setHighlightedSS] = useState(null);
```

**ANOVA Calculations:**
```javascript
const performANOVA = (regressionResults) => {
  const { sst, ssr, sse, n } = regressionResults;
  
  // Degrees of freedom
  const df_regression = 1;
  const df_error = n - 2;
  const df_total = n - 1;
  
  // Mean squares
  const msr = ssr / df_regression;
  const mse = sse / df_error;
  
  // F-statistic
  const f = msr / mse;
  
  // p-value
  const pValue = 1 - jStat.centralF.cdf(f, df_regression, df_error);
  
  return { f, pValue, msr, mse };
};
```

### 8. Layout Structure

Following Chapter 6 pattern:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title and introduction
4. Mathematical framework grid
5. Main decomposition visualization
6. ANOVA table display
7. Worked example
8. Key insights section

### 9. Specific Features to Include

1. **Animated Decomposition**: Show SST splitting into components
2. **Interactive ANOVA Table**: Build table step by step
3. **Variance Bars**: Visual representation of SS components
4. **F-Distribution Overlay**: Show test statistic location
5. **R² Connection**: Link to next section

### 10. Animation Choreography

```javascript
// Decomposition animation sequence
const animateDecomposition = () => {
  // Step 1: Show all (y - ȳ) deviations
  // Step 2: Highlight regression part (ŷ - ȳ)
  // Step 3: Highlight residual part (y - ŷ)
  // Step 4: Show sum of squares
};

// Bar chart animation
const animateVarianceBars = () => {
  // Start with total bar
  // Split into SSR and SSE
  // Show percentages
};
```

### 11. Visual Design

**Color Coding:**
```javascript
const anovaColors = {
  total: '#6b7280',      // Gray for total
  regression: '#3b82f6', // Blue for explained
  error: '#ef4444',      // Red for unexplained
  fStat: '#f59e0b'      // Orange for F-statistic
};
```

### 12. Technical Notes

**Performance:**
- Pre-calculate all SS values
- Smooth transitions with d3
- Limit animation complexity

**Accessibility:**
- Clear labels for all components
- Announce calculation results
- Keyboard navigation for steps

**Mathematical Accuracy:**
- Verify SST = SSR + SSE to machine precision
- Show rounding only in display

**File Location:** `/src/components/07-linear-regression/7-5-AnalysisOfVariance.jsx`