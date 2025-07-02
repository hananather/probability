# Plan: 7.1 - Correlation Coefficient

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
1. **Mathematical Rigor + Interactivity**: Focus on teaching correlation through meaningful visualizations
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match the structure of ErrorsAndPower and DifferenceOfTwoProportions
4. **Simplicity**: Avoid complex drag-and-drop; use controlled interactions
5. **LaTeX Excellence**: Every mathematical expression must follow `/docs/latex-guide.md` best practices

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
// Hypothesis Display equivalent - Show what we're exploring
const CorrelationIntroduction = React.memo(function CorrelationIntroduction() {
  // LaTeX-enabled introduction
  // "How strong is the linear relationship between X and Y?"
  // Show the correlation coefficient formula
});
```

### 2. Mathematical Framework
Following the pattern from DifferenceOfTwoProportions:
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with formula cards
  // Card 1: Population correlation ρ = Cov(X,Y)/(σx×σy)
  // Card 2: Sample correlation r = Sxy/√(Sxx×Syy)
  // Card 3: Interpretation scale (-1 to +1)
});
```

### 3. Main Interactive Visualization
```jsx
const CorrelationExplorer = () => {
  // State for scenario selection
  const [scenario, setScenario] = useState('strong-positive');
  
  // Pre-defined scenarios with different correlation values
  const scenarios = {
    'perfect-positive': { data: [...], rho: 1.0 },
    'strong-positive': { data: [...], rho: 0.85 },
    'moderate': { data: [...], rho: 0.50 },
    'none': { data: [...], rho: 0.0 },
    'strong-negative': { data: [...], rho: -0.85 }
  };
  
  // Main scatter plot with d3
  // Correlation value display
  // Interpretation guide
};
```

### 4. Worked Example Component
Following ErrorsAndPower pattern:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Step-by-step calculation using fuel quality data
  // Given: n=20 points, calculate correlation
  // Show all intermediate steps with LaTeX
  // Final result: r = 0.9367
});
```

### 5. Key Insights Section
```jsx
const KeyInsights = () => {
  // Three tabbed insights:
  // 1. Correlation ≠ Causation (with examples)
  // 2. Linear relationships only (show non-linear examples)
  // 3. Scale invariance (unit conversion demo)
};
```

### 6. Visual Components

**Correlation Strength Indicator:**
```jsx
const CorrelationStrengthBar = ({ value }) => {
  // Visual bar showing correlation strength
  // Color-coded: blue for positive, red for negative
  // Labels: Very Weak | Weak | Moderate | Strong | Very Strong
};
```

**Scatter Plot Component:**
```jsx
const ScatterPlot = ({ data, width, height }) => {
  // D3-based scatter plot
  // Show correlation line
  // Highlight deviations from means
  // Animate transitions between scenarios
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [scenario, setScenario] = useState('strong-positive');
const [showCalculation, setShowCalculation] = useState(false);
const [showDeviations, setShowDeviations] = useState(false);
```

**Data Structure:**
```javascript
const fuelQualityData = [
  { x: 0.99, y: 90.01 },
  { x: 1.02, y: 89.05 },
  // ... 20 points total
];
```

**Calculations:**
```javascript
const calculateCorrelation = (data) => {
  // Calculate means
  // Calculate Sxx, Syy, Sxy
  // Return correlation coefficient
};
```

### 8. Layout Structure

Following Chapter 6 components:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title and introduction
4. Mathematical framework grid
5. Main interactive section with controls
6. Worked example in expandable section
7. Key insights cards

### 9. Specific Features to Include

1. **Scenario Selector**: Button group to switch between correlation patterns
2. **Real-time Updates**: Show correlation value changing during transitions
3. **Interpretation Guide**: Visual scale showing correlation strength
4. **Step-by-Step Calculation**: Expandable section with full computation
5. **Non-Linear Examples**: Show why correlation misses curved relationships

### 10. Technical Notes

**Animation Requirements:**
- Smooth transitions between scenarios (1.5s duration)
- Use framer-motion for component transitions
- D3 transitions for scatter plot updates

**Performance Considerations:**
- Pre-calculate all scenario data
- Use React.memo for LaTeX-heavy sections
- Limit to 20-30 points per visualization

**Color Scheme:**
```javascript
const colors = createColorScheme('regression');
// Use consistent colors across Chapter 7
```

**File Location:** `/src/components/07-linear-regression/7-1-CorrelationCoefficient.jsx`