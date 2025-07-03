# Plan: 5.2 - Confidence Intervals (σ Known)

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Components to Consolidate:**
- `/src/components/05-estimation/5-2-ci-known-variance/5-2-1-ConfidenceIntervalBuilder.jsx`
- `/src/components/05-estimation/5-2-ci-known-variance/5-2-2-ConfidenceIntervalMasterclass.jsx`
- `/src/components/05-estimation/5-2-ci-known-variance/5-2-3-CriticalValuesExplorer.jsx`
- `/src/components/05-estimation/5-2-ci-known-variance/5-2-4-ConfidenceIntervalSimulation.jsx`

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- `/src/components/07-linear-regression/7-4-ConfidencePredictionIntervals.jsx`

**Core Development Principles:**
1. **Preserve All Visualizations**: Keep interactive CI builder, simulations, and critical values explorer
2. **Mathematical Clarity**: Show all formulas and calculations step-by-step
3. **Real Understanding**: Focus on interpretation, not just calculation
4. **Consistent Navigation**: Follow Chapter 6/7 patterns

## Component Structure

### 1. Opening Section
```jsx
const CIIntroduction = React.memo(function CIIntroduction() {
  const contentRef = useRef(null);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          How confident are we in our estimates?
        </p>
        <p>
          A <strong className="text-emerald-400">confidence interval</strong> provides a range of 
          plausible values for an unknown parameter. When σ is known, we use the normal distribution:
        </p>
        <div className="text-center my-4">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
          }} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          where confidence level = <span dangerouslySetInnerHTML={{ __html: `\\(1 - \\alpha\\)` }} />
        </p>
      </div>
    </div>
  );
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with key concepts
  const concepts = [
    {
      title: "68-95-99.7 Rule",
      content: "68% within 1σ, 95% within 2σ, 99.7% within 3σ",
      visual: "NormalDistributionWithShading"
    },
    {
      title: "Margin of Error",
      formula: "ME = z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}",
      description: "Half-width of confidence interval"
    },
    {
      title: "Critical Values",
      values: "z₀.₀₂₅ = 1.96, z₀.₀₀₅ = 2.575",
      description: "Common z-values for 95% and 99% CI"
    },
    {
      title: "Interpretation",
      content: "95% of all possible samples produce CIs containing μ",
      warning: "NOT '95% chance μ is in this interval'"
    }
  ];
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">Mathematical Framework</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {concepts.map((concept, i) => (
          <ConceptCard key={i} {...concept} />
        ))}
      </div>
    </VisualizationSection>
  );
});
```

### 3. Main Interactive Components

**Confidence Interval Builder (from 5-2-1):**
```jsx
const ConfidenceIntervalBuilder = () => {
  const [sampleMean, setSampleMean] = useState(50);
  const [sigma, setSigma] = useState(10);
  const [sampleSize, setSampleSize] = useState(25);
  const [confidence, setConfidence] = useState(0.95);
  
  // Interactive controls
  // Real-time CI calculation
  // Visual representation of interval
  // Interpretation guide
};
```

**Critical Values Explorer (from 5-2-3):**
```jsx
const CriticalValuesExplorer = () => {
  const [confidence, setConfidence] = useState(0.95);
  const [showArea, setShowArea] = useState(true);
  
  // Interactive normal distribution
  // Shaded rejection regions
  // Z-table lookup
  // Visual z-score finder
};
```

**Coverage Simulation (from 5-2-4):**
```jsx
const CoverageSimulation = () => {
  const [numSamples, setNumSamples] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  
  // Generate multiple samples
  // Show CIs for each sample
  // Highlight which contain true μ
  // Calculate coverage percentage
};
```

### 4. Comprehensive Examples Section
Consolidating from Masterclass component:
```jsx
const ComprehensiveExamples = () => {
  const examples = [
    {
      title: "Quality Control",
      scenario: "Battery lifetime testing",
      data: { n: 36, xbar: 48.2, sigma: 6, confidence: 0.95 }
    },
    {
      title: "Medical Research", 
      scenario: "Blood pressure medication",
      data: { n: 64, xbar: 132, sigma: 15, confidence: 0.99 }
    },
    {
      title: "Manufacturing",
      scenario: "Part dimensions",
      data: { n: 100, xbar: 25.03, sigma: 0.5, confidence: 0.90 }
    }
  ];
  
  // Step-by-step solutions
  // Visual representations
  // Interpretation in context
};
```

### 5. Worked Example Component
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Example: Gear wheel weights
  // Given: n = 9, x̄ = 19.93, σ = 5
  // Calculate 95% and 99% CIs
  // Show all steps with LaTeX
  
  const steps = [
    { 
      step: 1, 
      description: "Identify given values",
      calculation: "n = 9, \\bar{x} = 19.93, \\sigma = 5, \\alpha = 0.05"
    },
    {
      step: 2,
      description: "Find critical value",
      calculation: "z_{0.025} = 1.96"
    },
    {
      step: 3,
      description: "Calculate margin of error",
      calculation: "ME = 1.96 \\times \\frac{5}{\\sqrt{9}} = 3.27"
    },
    {
      step: 4,
      description: "Construct interval",
      calculation: "19.93 \\pm 3.27 = (16.66, 23.20)"
    }
  ];
});
```

### 6. Key Features Section
```jsx
const KeyFeatures = () => {
  // Tabbed interface with:
  // 1. Effect of sample size on CI width
  // 2. Effect of confidence level on CI width
  // 3. Common misconceptions
  // 4. When to use z vs t
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [activeView, setActiveView] = useState('builder'); // builder, explorer, simulation
const [showSteps, setShowSteps] = useState(false);
const [exampleIndex, setExampleIndex] = useState(0);
```

**Preserved Functionality:**
1. **CI Builder**: All parameter controls, real-time updates
2. **Critical Values**: Interactive normal curve, area shading
3. **Simulation**: Multiple samples, coverage visualization
4. **Examples**: All scenarios from masterclass

**Visual Components to Preserve:**
1. Normal distribution with shaded areas
2. Confidence interval visualization (number line)
3. Multiple CI plot (simulation)
4. Z-table reference
5. Parameter sliders with live updates

### 8. Layout Structure

1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "5.2 Confidence Intervals (σ Known)"
4. Introduction with formula
5. Mathematical framework grid
6. Tab selector for main views:
   - CI Builder
   - Critical Values Explorer
   - Coverage Simulation
7. Comprehensive examples
8. Worked example (expandable)
9. Key insights and features
10. BackToHub (bottom)

### 9. Interactive Visualizations

**CI Visualization:**
```jsx
const ConfidenceIntervalViz = ({ mean, lowerBound, upperBound, trueValue }) => {
  // Number line representation
  // Highlight interval
  // Show true value if known
  // Animate changes
};
```

**Normal Distribution Component:**
```jsx
const NormalDistribution = ({ mean, sd, criticalValues, shadeArea }) => {
  // D3-based normal curve
  // Shade rejection regions
  // Label critical values
  // Interactive hover
};
```

### 10. Technical Notes

**Animation Requirements:**
- Smooth transitions for parameter changes
- Animated CI width changes
- Simulation replay capability

**Performance Considerations:**
- Limit simulation to 100 samples max
- Debounce slider inputs
- Use React.memo for static sections

**Accessibility:**
- Keyboard controls for sliders
- Screen reader descriptions
- High contrast mode support

**Color Scheme:**
```javascript
const colors = {
  primary: '#10b981', // Emerald for estimation
  confidence: '#3b82f6', // Blue for intervals
  critical: '#ef4444', // Red for rejection regions
  success: '#22c55e' // Green for coverage
};
```

**Data Validation:**
```javascript
const validateInputs = (mean, sigma, n, confidence) => {
  // Ensure sigma > 0
  // Ensure n >= 2
  // Ensure 0 < confidence < 1
  // Provide helpful error messages
};
```

**File Location:** `/src/components/05-estimation/5-2-ConfidenceIntervalKnownVariance.jsx`