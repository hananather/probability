# Plan: 7.2 - Simple Linear Regression

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
1. **Mathematical Rigor + Interactivity**: Teach least squares through visual demonstrations
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match ErrorsAndPower and DifferenceOfTwoProportions structure
4. **Simplicity**: Use controlled animations rather than complex dragging
5. **LaTeX Excellence**: Follow exact patterns from gold standard components

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
const RegressionIntroduction = React.memo(function RegressionIntroduction() {
  // Question: "What makes one line through our data 'better' than another?"
  // Show the regression model: Y = β₀ + β₁X + ε
  // Preview the least squares criterion
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with key concepts:
  // Card 1: Least Squares Criterion - minimize Σ(y - ŷ)²
  // Card 2: Normal Equations - formulas for b₀ and b₁
  // Card 3: Standard Errors - SE(b₁) = σ̂/√Sxx, SE(b₀) = σ̂√(1/n + x̄²/Sxx)
  // Card 4: Model Assumptions - linearity, constant variance, normal errors
});
```

### 3. Main Interactive Visualization

**Line Comparison Animation:**
```jsx
const LineComparisonDemo = () => {
  const [currentLine, setCurrentLine] = useState('initial');
  
  const lines = {
    'too-flat': { b0: 80, b1: 10, sse: 142.7 },
    'optimal': { b0: 74.28, b1: 14.95, sse: 21.19 },
    'too-steep': { b0: 70, b1: 20, sse: 98.3 }
  };
  
  // Animated comparison of different lines
  // Show residuals as vertical lines
  // Display SSE prominently
  // Smooth transitions between lines
};
```

**Why Squared Errors:**
```jsx
const WhySquaredErrors = () => {
  // Visual comparison of error methods:
  // 1. Sum of errors (cancels out)
  // 2. Sum of absolute errors (not differentiable)
  // 3. Sum of squared errors (optimal properties)
  // Animate the squaring process
};
```

### 4. Worked Example Component
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Step-by-step calculation with fuel data
  // Given: n=20, Sxx=0.68, Sxy=10.18, x̄=1.20, ȳ=92.16
  // Calculate b₁ = Sxy/Sxx = 14.95
  // Calculate b₀ = ȳ - b₁x̄ = 74.28
  // Show all intermediate steps with LaTeX
});
```

### 5. Key Insights Section

**Centroid Property:**
```jsx
const CentroidInsight = () => {
  // Interactive demo showing line always passes through (x̄, ȳ)
  // Rotate line around centroid
  // Show SSE changes but centroid remains fixed
};
```

**Residual Analysis:**
```jsx
const ResidualAnalysis = () => {
  // Show residual plot
  // Demonstrate that residuals sum to zero
  // Check for patterns (good vs bad fits)
};
```

### 6. Visual Components

**Regression Plot:**
```jsx
const RegressionPlot = ({ data, line, showResiduals }) => {
  // D3-based scatter plot with regression line
  // Option to show residuals as vertical lines
  // Highlight centroid point
  // Animate line changes smoothly
};
```

**SSE Visualization:**
```jsx
const SSEVisualization = ({ slope, intercept }) => {
  // Show SSE as function of parameters
  // 3D surface or 2D contour plot
  // Mark the minimum point
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [lineType, setLineType] = useState('optimal');
const [showResiduals, setShowResiduals] = useState(true);
const [animationStep, setAnimationStep] = useState(0);
const [showCalculation, setShowCalculation] = useState(false);
```

**Calculations:**
```javascript
const calculateRegression = (data) => {
  // Calculate means
  const xMean = data.reduce((sum, d) => sum + d.x, 0) / data.length;
  const yMean = data.reduce((sum, d) => sum + d.y, 0) / data.length;
  
  // Calculate Sxx, Sxy
  const sxx = data.reduce((sum, d) => sum + (d.x - xMean) ** 2, 0);
  const sxy = data.reduce((sum, d) => sum + (d.x - xMean) * (d.y - yMean), 0);
  
  // Calculate coefficients
  const b1 = sxy / sxx;
  const b0 = yMean - b1 * xMean;
  
  return { b0, b1, xMean, yMean };
};
```

### 8. Layout Structure

Following Chapter 6 pattern:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title and introduction
4. Mathematical framework cards
5. Main visualization with controls
6. Worked example (expandable)
7. Key insights section
8. Summary and next steps

### 9. Specific Features to Include

1. **Line Comparison**: Animated comparison of different regression lines
2. **Error Visualization**: Show why we use squared errors
3. **Centroid Property**: Interactive demo of line through (x̄, ȳ)
4. **Residual Plot**: Check model assumptions
5. **Step-by-Step Calculation**: Full worked example with fuel data

### 10. Animation Choreography

```javascript
// Smooth line transitions
const animateLine = (fromLine, toLine, duration = 1500) => {
  // Interpolate slope and intercept
  // Update residuals during transition
  // Show SSE changing in real-time
};

// Residual emphasis
const emphasizeResiduals = () => {
  // Pulse animation on residual lines
  // Color code positive (blue) vs negative (red)
  // Show sum balancing to zero
};
```

### 11. Technical Notes

**Performance:**
- Pre-calculate regression lines for all scenarios
- Use React.memo for formula-heavy sections
- Debounce rapid animation triggers

**Visual Consistency:**
- Use Chapter 7 color scheme consistently
- Match animation timing with Chapter 6 components
- Maintain responsive design

**Accessibility:**
- Provide text descriptions of visual changes
- Keyboard controls for animation steps
- High contrast mode support

**File Location:** `/src/components/07-linear-regression/7-2-SimpleLinearRegression.jsx`