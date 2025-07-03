# Plan: 5.4 - Confidence Intervals (σ Unknown)

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Components to Consolidate:**
- `/src/components/05-estimation/5-4-ci-unknown-variance/5-4-1-TConfidenceIntervals.jsx`
- `/src/components/05-estimation/5-4-ci-unknown-variance/5-4-2-TDistributionShowcase.jsx`
- `/src/components/05-estimation/5-4-ci-unknown-variance/5-4-3-Bootstrapping.jsx`

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-5-TestForMeanUnknownVariance.jsx` (for t-distribution)
- `/src/components/04-descriptive-statistics-sampling/4-4-1-TDistribution.jsx` (for visuals)

**Core Development Principles:**
1. **Real-World Focus**: Most practical situations have unknown σ
2. **Visual Comparison**: Show t vs normal distribution clearly
3. **Modern Methods**: Include bootstrap alongside traditional t-intervals
4. **Small Sample Emphasis**: Where t-distribution matters most

## Component Structure

### 1. Opening Section
```jsx
const UnknownVarianceIntroduction = React.memo(function UnknownVarianceIntroduction() {
  const contentRef = useRef(null);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          What happens when σ is unknown?
        </p>
        <p>
          In practice, we rarely know σ. We estimate it with the sample standard deviation 
          <strong className="text-blue-400"> s</strong>, and use the <strong className="text-emerald-400">t-distribution</strong>:
        </p>
        <div className="text-center my-4">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[\\bar{X} \\pm t_{\\alpha/2, n-1} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
          }} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          with <span dangerouslySetInnerHTML={{ __html: `\\(n-1\\)` }} /> degrees of freedom
        </p>
      </div>
    </div>
  );
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  const concepts = [
    {
      title: "T-Distribution Properties",
      points: [
        "Heavier tails than normal",
        "Approaches normal as df → ∞",
        "Accounts for extra uncertainty"
      ],
      visual: "TvsNormalComparison"
    },
    {
      title: "Degrees of Freedom",
      formula: "df = n - 1",
      description: "Number of independent pieces of information",
      example: "n = 10 → df = 9"
    },
    {
      title: "When to Use T vs Z",
      comparison: {
        useT: ["σ unknown", "Small samples (n < 30)", "Normal population"],
        useZ: ["σ known", "Large samples", "CLT applies"]
      }
    },
    {
      title: "Bootstrap Alternative",
      description: "Resampling method for any distribution",
      advantages: ["No normality assumption", "Works for any statistic", "Visual understanding"]
    }
  ];
});
```

### 3. Main Interactive Components

**T-Distribution Explorer (from 5-4-2):**
```jsx
const TDistributionShowcase = () => {
  const [degreesOfFreedom, setDegreesOfFreedom] = useState(5);
  const [showNormal, setShowNormal] = useState(true);
  const [confidence, setConfidence] = useState(0.95);
  
  // Interactive t-distribution plot
  // Overlay with normal distribution
  // Show critical values
  // Animate df changes
  
  return (
    <GraphContainer>
      <TDistributionPlot 
        df={degreesOfFreedom}
        showNormal={showNormal}
        criticalValues={getCriticalValues(confidence, degreesOfFreedom)}
      />
      <ComparisonTable df={degreesOfFreedom} />
    </GraphContainer>
  );
};
```

**T-Confidence Interval Calculator (from 5-4-1):**
```jsx
const TConfidenceIntervalCalculator = () => {
  const [sampleData, setSampleData] = useState([]);
  const [confidence, setConfidence] = useState(0.95);
  
  // Calculate sample statistics
  const { mean, sd, n } = calculateStats(sampleData);
  const df = n - 1;
  const tCritical = getTValue(confidence, df);
  
  // Data input methods:
  // - Manual entry
  // - Paste from clipboard
  // - Generate sample data
  
  // Show calculation steps
  // Visual representation
  // Comparison with z-interval
};
```

**Bootstrap Visualization (from 5-4-3):**
```jsx
const BootstrapVisualization = () => {
  const [originalData, setOriginalData] = useState([]);
  const [numBootstraps, setNumBootstraps] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  
  // Bootstrap process:
  // 1. Resample with replacement
  // 2. Calculate statistic
  // 3. Repeat B times
  // 4. Find percentiles
  
  // Animated resampling
  // Bootstrap distribution
  // Confidence interval
  // Compare with t-interval
};
```

### 4. Comprehensive Examples
```jsx
const ComprehensiveExamples = () => {
  const examples = [
    {
      title: "Small Sample Case",
      context: "Ozone concentration (n=9)",
      data: [3.5, 5.1, 6.6, 6.0, 4.2, 4.4, 5.3, 5.6, 4.4],
      calculations: {
        mean: 5.01,
        sd: 0.97,
        tCritical: 2.306,
        ci: "[4.26, 5.76]"
      }
    },
    {
      title: "Medium Sample",
      context: "Test scores (n=25)",
      summary: { mean: 78.5, sd: 12.3 },
      comparison: "t-interval vs z-interval difference"
    },
    {
      title: "Bootstrap Example",
      context: "Non-normal data",
      visual: "Bootstrap vs parametric CI"
    }
  ];
};
```

### 5. Worked Example Component
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Example: Baseball player heights
  // Given: Sample of n=20, x̄=72.6, s=2.37
  // Calculate: 95% CI for population mean height
  
  const steps = [
    {
      step: 1,
      description: "Calculate degrees of freedom",
      calculation: "df = n - 1 = 20 - 1 = 19"
    },
    {
      step: 2,
      description: "Find t-critical value",
      calculation: "t_{0.025, 19} = 2.093"
    },
    {
      step: 3,
      description: "Calculate standard error",
      calculation: "SE = \\frac{s}{\\sqrt{n}} = \\frac{2.37}{\\sqrt{20}} = 0.530"
    },
    {
      step: 4,
      description: "Construct interval",
      calculation: "72.6 \\pm 2.093 \\times 0.530 = 72.6 \\pm 1.11 = [71.49, 73.71]"
    }
  ];
});
```

### 6. Comparison Tool
```jsx
const ComparisonTool = () => {
  const [sampleSize, setSampleSize] = useState(10);
  const [showDifference, setShowDifference] = useState(true);
  
  // Side-by-side comparison:
  // - t-interval width
  // - z-interval width
  // - Percentage difference
  // - When difference matters
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <IntervalComparison type="t" n={sampleSize} />
      <IntervalComparison type="z" n={sampleSize} />
      <DifferenceVisualization />
    </div>
  );
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [activeView, setActiveView] = useState('t-distribution'); // t-distribution, calculator, bootstrap
const [comparisonMode, setComparisonMode] = useState(false);
const [dataSource, setDataSource] = useState('manual'); // manual, generated, example
```

**Preserved Functionality:**
1. **T-Distribution Showcase**: All df animations, comparisons
2. **T-CI Calculator**: Data input, calculations, visuals
3. **Bootstrap Demo**: Full resampling visualization
4. **All examples and scenarios**

**New Additions:**
1. Enhanced comparison tools
2. T-table reference
3. Decision flowchart (when to use what)
4. Practice problems

### 8. Layout Structure

1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "5.4 Confidence Intervals (σ Unknown)"
4. Introduction with t-formula
5. Mathematical framework
6. View selector tabs:
   - T-Distribution Explorer
   - T-Interval Calculator
   - Bootstrap Method
   - Comparison Tool
7. Comprehensive examples
8. Worked example (expandable)
9. Quick reference (t-table)
10. BackToHub (bottom)

### 9. Visual Components

**T vs Normal Overlay:**
```jsx
const TvsNormalOverlay = ({ df, alpha }) => {
  // D3 plot showing both distributions
  // Highlight tail differences
  // Show critical values for both
  // Animate transitions
};
```

**Degrees of Freedom Visualization:**
```jsx
const DegreesOfFreedomViz = ({ maxDf = 30 }) => {
  // Show how t approaches normal
  // Interactive df selector
  // Tail probability comparison
  // Critical value evolution
};
```

**Bootstrap Process Animation:**
```jsx
const BootstrapAnimation = ({ data, currentIteration }) => {
  // Show resampling process
  // Highlight selected points
  // Build bootstrap distribution
  // Real-time percentile updates
};
```

### 10. Technical Notes

**Performance Considerations:**
- Limit bootstrap iterations in visualization
- Cache t-distribution calculations
- Use worker for heavy computations
- Optimize D3 rendering

**Statistical Accuracy:**
```javascript
const getTValue = (alpha, df) => {
  // Use accurate t-distribution quantiles
  // Handle edge cases (df = 1, large df)
  // Provide interpolation if needed
};
```

**Data Handling:**
```javascript
const validateData = (data) => {
  // Check for numeric values
  // Handle missing data
  // Detect outliers
  // Suggest transformations
};
```

**Educational Features:**
```javascript
const provideFeedback = (sampleSize, distribution) => {
  // When is t really necessary?
  // How much difference from z?
  // Bootstrap advantages
  // Practical recommendations
};
```

**Accessibility:**
- Alternative text for all plots
- Keyboard navigation
- Table view of distributions
- Clear value announcements

**File Location:** `/src/components/05-estimation/5-4-ConfidenceIntervalUnknownVariance.jsx`