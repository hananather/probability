# Plan: 5.5 - Proportion Confidence Intervals

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Components to Consolidate:**
- `/src/components/05-estimation/5-5-proportions/5-5-1-ProportionConfidenceIntervals.jsx`
- `/src/components/05-estimation/5-5-proportions/5-5-2-ProportionEstimationStudio.jsx`

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-6-1-TestForProportion.jsx` (for proportion formulas)
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx` (for scenarios)

**Core Development Principles:**
1. **Real-World Applications**: Focus on polling, A/B testing, quality control
2. **Method Comparison**: Show Wald, Wilson, and other intervals
3. **Visual Clarity**: Make abstract proportions concrete
4. **Practical Guidance**: When to use which method

## Component Structure

### 1. Opening Section
```jsx
const ProportionIntroduction = React.memo(function ProportionIntroduction() {
  const contentRef = useRef(null);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          How accurate are polls and surveys?
        </p>
        <p>
          From election polls to quality control, we often estimate 
          <strong className="text-emerald-400"> proportions</strong>. The standard CI is:
        </p>
        <div className="text-center my-4">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[\\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` 
          }} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          where <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = x/n\\)` }} /> is the sample proportion
        </p>
      </div>
    </div>
  );
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  const methods = [
    {
      title: "Wald Interval",
      formula: "\\hat{p} \\pm z \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}",
      when: "Large samples, p not near 0 or 1",
      pros: "Simple, widely known",
      cons: "Poor coverage for extreme p"
    },
    {
      title: "Wilson Score Interval",
      formula: "\\frac{\\hat{p} + \\frac{z^2}{2n} \\pm z\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n} + \\frac{z^2}{4n^2}}}{1 + \\frac{z^2}{n}}",
      when: "Any sample size or proportion",
      pros: "Better coverage, always in [0,1]",
      cons: "More complex formula"
    },
    {
      title: "Exact (Clopper-Pearson)",
      description: "Based on binomial distribution",
      when: "Small samples, guaranteed coverage",
      pros: "Conservative, exact coverage",
      cons: "Wider intervals"
    },
    {
      title: "Agresti-Coull",
      formula: "\\tilde{p} \\pm z\\sqrt{\\frac{\\tilde{p}(1-\\tilde{p})}{\\tilde{n}}}",
      description: "Add 2 successes and 2 failures",
      when: "Quick approximation",
      pros: "Simple adjustment, good coverage"
    }
  ];
});
```

### 3. Main Interactive Components

**Election Polling Simulator (from 5-5-1):**
```jsx
const ElectionPollingSimulator = () => {
  const [sampleSize, setSampleSize] = useState(1000);
  const [observedProportion, setObservedProportion] = useState(0.52);
  const [confidence, setConfidence] = useState(0.95);
  const [method, setMethod] = useState('wilson');
  
  // Calculate CI using selected method
  // Show margin of error
  // Visualize on proportion scale
  // Interpret in context
  
  return (
    <div className="space-y-4">
      <PollVisualization 
        proportion={observedProportion}
        ci={calculateCI(method, observedProportion, sampleSize, confidence)}
        threshold={0.5}
      />
      <InterpretationPanel 
        lead={observedProportion > 0.5}
        marginOfError={calculateMOE(method, observedProportion, sampleSize, confidence)}
      />
    </div>
  );
};
```

**A/B Testing Calculator (from 5-5-2):**
```jsx
const ABTestingCalculator = () => {
  const [groupA, setGroupA] = useState({ successes: 120, total: 1000 });
  const [groupB, setGroupB] = useState({ successes: 145, total: 1000 });
  const [confidence, setConfidence] = useState(0.95);
  
  // Calculate proportions and CIs
  // Show visual comparison
  // Determine significance
  // Provide recommendations
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <GroupResults group="A" data={groupA} />
      <GroupResults group="B" data={groupB} />
      <ComparisonVisualization />
      <SignificancePanel />
    </div>
  );
};
```

**Quality Control Dashboard (from 5-5-2):**
```jsx
const QualityControlDashboard = () => {
  const [defectRate, setDefectRate] = useState(0.03);
  const [sampleSize, setSampleSize] = useState(500);
  const [acceptableRate] = useState(0.05);
  
  // Monitor defect rates
  // Control charts
  // Alert thresholds
  // Sample size recommendations
};
```

### 4. Method Comparison Tool
```jsx
const MethodComparisonTool = () => {
  const [p, setP] = useState(0.1);
  const [n, setN] = useState(30);
  
  // Calculate all intervals:
  const intervals = {
    wald: calculateWaldCI(p, n),
    wilson: calculateWilsonCI(p, n),
    exact: calculateExactCI(p, n),
    agrestiCoull: calculateAgrestiCoullCI(p, n)
  };
  
  // Visual comparison
  // Coverage probability
  // Width comparison
  // Recommendations
};
```

### 5. Worked Example Component
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Example: Election poll
  // 1000 voters, 520 support candidate A
  // Calculate 95% CI using Wilson method
  
  const steps = [
    {
      step: 1,
      description: "Calculate sample proportion",
      calculation: "\\hat{p} = \\frac{520}{1000} = 0.52"
    },
    {
      step: 2,
      description: "Find critical value",
      calculation: "z_{0.025} = 1.96"
    },
    {
      step: 3,
      description: "Apply Wilson formula",
      calculation: "\\text{Complex calculation...} = [0.489, 0.551]"
    },
    {
      step: 4,
      description: "Interpret",
      calculation: "52\\% \\pm 3.1\\% \\text{ or } [48.9\\%, 55.1\\%]"
    }
  ];
});
```

### 6. Real-World Scenarios
```jsx
const RealWorldScenarios = () => {
  const scenarios = [
    {
      title: "Presidential Election Poll",
      context: "National poll with n=1500",
      data: { support: 0.48, opponent: 0.47, undecided: 0.05 },
      analysis: "Statistical tie, within margin of error"
    },
    {
      title: "Vaccine Efficacy",
      context: "Clinical trial results",
      data: { vaccinated: { cases: 20, total: 10000 }, 
              placebo: { cases: 200, total: 10000 }},
      calculation: "90% efficacy with CI"
    },
    {
      title: "Website Conversion",
      context: "E-commerce A/B test",
      data: { 
        original: { conversions: 245, visitors: 5000 },
        variant: { conversions: 289, visitors: 5000 }
      },
      decision: "Statistically significant improvement"
    },
    {
      title: "Manufacturing Defects",
      context: "Daily quality control",
      data: { defects: 7, inspected: 500 },
      limits: "Control limits and alerts"
    }
  ];
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [activeScenario, setActiveScenario] = useState('polling');
const [comparisonMode, setComparisonMode] = useState(false);
const [showAllMethods, setShowAllMethods] = useState(false);
const [dataEntry, setDataEntry] = useState('counts'); // counts or proportion
```

**Preserved Functionality:**
1. **Polling simulator**: All interactive controls
2. **A/B testing**: Full comparison tools
3. **Quality control**: Dashboard and monitoring
4. **Method comparison**: All CI methods

**New Additions:**
1. Enhanced scenario library
2. Sample size calculator for proportions
3. Power analysis tools
4. Export functionality

### 8. Layout Structure

1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "5.5 Proportion Confidence Intervals"
4. Introduction with main formula
5. Mathematical framework (methods grid)
6. Scenario tabs:
   - Election Polling
   - A/B Testing
   - Quality Control
   - Method Comparison
7. Real-world examples gallery
8. Worked example (expandable)
9. Quick reference guide
10. BackToHub (bottom)

### 9. Visual Components

**Proportion Scale Visualization:**
```jsx
const ProportionScale = ({ proportion, ci, comparison }) => {
  // 0 to 1 scale
  // Show point estimate
  // CI as error bars
  // Reference lines (0.5, targets)
  // Color coding
};
```

**Comparison Forest Plot:**
```jsx
const ForestPlot = ({ groups, reference = 0.5 }) => {
  // Multiple groups/methods
  // Point estimates and CIs
  // Reference line
  // Significance indicators
};
```

**Sample Size Impact:**
```jsx
const SampleSizeImpact = ({ baseP, confidenceLevel }) => {
  // Show how CI width changes with n
  // Interactive n slider
  // Multiple proportions
  // Cost-precision tradeoff
};
```

### 10. Technical Notes

**Calculation Functions:**
```javascript
const calculateWilsonCI = (pHat, n, alpha) => {
  const z = getZValue(1 - alpha);
  const denominator = 1 + z*z/n;
  const center = (pHat + z*z/(2*n)) / denominator;
  const spread = z * Math.sqrt(pHat*(1-pHat)/n + z*z/(4*n*n)) / denominator;
  return [center - spread, center + spread];
};
```

**Edge Case Handling:**
```javascript
const handleExtremeProportion = (x, n, method) => {
  if (x === 0 && method === 'wald') {
    console.warn('Wald interval unreliable for p=0');
    return 'wilson'; // Suggest alternative
  }
  // Handle p near 0 or 1
};
```

**Interpretation Helpers:**
```javascript
const interpretPollResult = (ci, threshold = 0.5) => {
  if (ci[0] > threshold) return "Clear lead";
  if (ci[1] < threshold) return "Clear deficit";
  return "Too close to call";
};
```

**Visual Accessibility:**
- Use patterns in addition to colors
- Provide numerical readouts
- Clear labels and legends
- Keyboard navigation

**Performance:**
- Cache exact CI calculations
- Limit simulation iterations
- Use approximations for large n
- Progressive enhancement

**File Location:** `/src/components/05-estimation/5-5-ProportionConfidenceInterval.jsx`