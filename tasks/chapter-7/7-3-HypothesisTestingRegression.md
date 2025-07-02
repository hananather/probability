# Plan: 7.3 - Hypothesis Testing for Linear Regression

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
1. **Mathematical Rigor + Interactivity**: Teach hypothesis testing in regression context
2. **Reuse Existing Components**: Use VisualizationContainer, GraphContainer, ControlGroup
3. **Follow Chapter 6 Style**: Match the structure of ErrorsAndPower and DifferenceOfTwoProportions
4. **Simplicity**: Use controlled simulations rather than complex interactions
5. **LaTeX Excellence**: Follow exact patterns from gold standard components

## Component Structure

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`

### 1. Opening Section
```jsx
// Following HypothesisDisplay pattern from DifferenceOfTwoProportions
const HypothesisDisplay = React.memo(function HypothesisDisplay() {
  // H₀: β₁ = 0 (no linear relationship)
  // H₁: β₁ ≠ 0 (significant linear relationship)
  // Question: "Is the relationship real or just random noise?"
});
```

### 2. Mathematical Framework
Following DifferenceOfTwoProportions pattern:
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with cards:
  // Card 1: Test Statistic - t = b₁/SE(b₁)
  // Card 2: Standard Error - SE(b₁) = s/√Sxx
  // Card 3: Degrees of Freedom - df = n-2
  // Card 4: Decision Rule - Reject if |t| > t_{α/2,n-2}
});
```

### 3. Main Interactive Visualization
Following ErrorsAndPower visualization style:
```jsx
const RegressionTestVisualization = () => {
  const [showNullDistribution, setShowNullDistribution] = useState(false);
  const [showTestStatistic, setShowTestStatistic] = useState(false);
  const [showPValue, setShowPValue] = useState(false);
  
  // Real data vs null hypothesis visualization
  // Show scatter plot with/without relationship
  // Animate t-distribution with critical regions
};
```

### 4. Simulation Component
```jsx
const NullDistributionSimulation = () => {
  // Similar to ErrorsAndPower simulation approach
  // Generate data under H₀: β₁ = 0
  // Calculate test statistics from shuffled data
  // Build null distribution histogram
  // Show where our observed t falls
};
```

### 5. Worked Example Component
Following ErrorsAndPower pattern exactly:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Hypothesis Test Computation
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Given Information */}
        {/* Step 1: Calculate Standard Error */}
        {/* Step 2: Calculate t-statistic */}
        {/* Step 3: Find critical value */}
        {/* Step 4: Make decision */}
      </div>
    </VisualizationSection>
  );
});
```

### 6. Key Insights Section
```jsx
const KeyInsights = () => {
  // Three key insights with visual demos:
  // 1. Connection to correlation test (t_corr = t_slope)
  // 2. Why df = n-2 (lost 2 parameters)
  // 3. F-test equivalence (F = t²)
};
```

### 7. Visual Components

**Test Statistic Visualization:**
```jsx
const TestStatisticVisualization = ({ tValue, df }) => {
  // t-distribution curve
  // Shade rejection regions
  // Mark observed t-value
  // Show p-value area
};
```

**Confidence Interval for Slope:**
```jsx
const SlopeConfidenceInterval = ({ b1, se, alpha }) => {
  // Visual representation of CI
  // b₁ ± t_{α/2,n-2} × SE(b₁)
  // Show if 0 is included
};
```

### 8. Implementation Requirements

**State Management:**
```jsx
const [testType, setTestType] = useState('two-tailed');
const [alpha, setAlpha] = useState(0.05);
const [showSimulation, setShowSimulation] = useState(false);
const [animationStep, setAnimationStep] = useState('initial');
```

**Test Calculations:**
```javascript
const performHypothesisTest = (regressionResults) => {
  const { b1, se_b1, n } = regressionResults;
  
  // Calculate t-statistic
  const t = b1 / se_b1;
  
  // Degrees of freedom
  const df = n - 2;
  
  // Calculate p-value
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
  
  return { t, df, pValue };
};
```

### 9. Layout Structure

Following Chapter 6 components exactly:
1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "Hypothesis Testing for Linear Regression"
4. HypothesisDisplay section
5. MathematicalFramework grid
6. Main visualization with controls
7. WorkedExample (expandable)
8. Key insights section

### 10. Specific Features to Include

1. **Real vs Null Comparison**: Show data with and without relationship
2. **t-Distribution Visualization**: Interactive critical regions
3. **p-Value Animation**: Visual representation of extreme values
4. **Simulation Under H₀**: Generate null distribution
5. **Connection to Correlation**: Show equivalence of tests

### 11. Color Scheme and Styling

Following Chapter 6 color patterns:
```javascript
const chapterColors = createColorScheme('regression');

// Specific colors for hypothesis testing
const testColors = {
  null: '#6b7280',        // Gray for null hypothesis
  alternative: '#3b82f6', // Blue for alternative
  rejection: '#ef4444',   // Red for rejection region
  acceptance: '#10b981',  // Green for acceptance
  testStat: '#f59e0b'    // Orange for test statistic
};
```

### 12. Technical Notes

**Animation Patterns:**
- Use framer-motion for smooth transitions
- Stagger reveal of mathematical steps
- Animate test statistic movement on distribution

**Performance:**
- Pre-compute simulation results
- Use React.memo for LaTeX-heavy sections
- Limit simulation to 1000 iterations

**Accessibility:**
- Announce test results
- Provide text alternatives for visualizations
- Keyboard navigation for controls

**File Location:** `/src/components/07-linear-regression/7-3-HypothesisTestingRegression.jsx`