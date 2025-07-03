# Plan: 5.3 - Sample Size Calculation

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Components to Consolidate:**
- `/src/components/05-estimation/5-3-sample-size/5-3-1-SampleSizeCalculator.jsx`
- `/src/components/05-estimation/5-3-sample-size/5-3-2-SampleSizeLaboratory.jsx`

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx` (for mathematical framework)
- `/src/components/04-descriptive-statistics-sampling/4-3-3-CLTVisualization.jsx` (for 3D viz patterns)

**Core Development Principles:**
1. **Preserve 3D Visualization**: The sample size laboratory has stunning 3D visuals - keep them
2. **Practical Focus**: Emphasize real-world cost-benefit analysis
3. **Interactive Learning**: Let users explore relationships dynamically
4. **Clear Formulas**: Show derivation and application of sample size formula

## Component Structure

### 1. Opening Section
```jsx
const SampleSizeIntroduction = React.memo(function SampleSizeIntroduction() {
  const contentRef = useRef(null);
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          How many samples ensure reliable results?
        </p>
        <p>
          Sample size determination balances <strong className="text-emerald-400">precision</strong>, 
          <strong className="text-blue-400">confidence</strong>, and <strong className="text-orange-400">cost</strong>:
        </p>
        <div className="text-center my-4">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` 
          }} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          where E is the desired margin of error
        </p>
      </div>
    </div>
  );
});
```

### 2. Mathematical Framework
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  const factors = [
    {
      title: "Margin of Error (E)",
      description: "How precise do we need to be?",
      formula: "E = z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}",
      impact: "Smaller E → Larger n"
    },
    {
      title: "Confidence Level (1-α)",
      description: "How certain do we want to be?",
      formula: "\\text{Common: } 90\\%, 95\\%, 99\\%",
      impact: "Higher confidence → Larger n"
    },
    {
      title: "Population Variability (σ)",
      description: "How spread out is the population?",
      formula: "\\text{Estimate from pilot study}",
      impact: "Higher σ → Larger n"
    },
    {
      title: "Cost Considerations",
      description: "What's our budget?",
      formula: "\\text{Total Cost} = n \\times \\text{cost per unit}",
      impact: "Balance precision vs resources"
    }
  ];
  
  return (
    <VisualizationSection className="bg-neutral-800/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-6">Key Factors in Sample Size</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {factors.map((factor, i) => (
          <FactorCard key={i} {...factor} />
        ))}
      </div>
    </VisualizationSection>
  );
});
```

### 3. Main Interactive Components

**Sample Size Calculator (from 5-3-1):**
```jsx
const SampleSizeCalculator = () => {
  const [marginError, setMarginError] = useState(2);
  const [confidence, setConfidence] = useState(0.95);
  const [sigma, setSigma] = useState(15);
  const [costPerUnit, setCostPerUnit] = useState(10);
  
  // Calculate required sample size
  const calculateSampleSize = () => {
    const z = getZValue(confidence);
    const n = Math.ceil(Math.pow((z * sigma) / marginError, 2));
    return n;
  };
  
  // Interactive controls
  // Real-time calculation
  // Cost analysis
  // Visual representation
};
```

**3D Visualization Laboratory (from 5-3-2):**
```jsx
const SampleSizeLaboratory = () => {
  const [viewAngle, setViewAngle] = useState({ x: -30, y: 45 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // 3D surface plot showing n as function of E and confidence
  // Interactive rotation
  // Click to explore specific points
  // Color gradients for sample size
  
  return (
    <div className="relative">
      <Canvas3D>
        <SampleSizeSurface 
          marginErrorRange={[0.5, 5]}
          confidenceRange={[0.80, 0.99]}
          sigmaValue={sigma}
        />
      </Canvas3D>
      <Controls3D onRotate={setViewAngle} />
    </div>
  );
};
```

### 4. Real-World Scenarios
```jsx
const RealWorldScenarios = () => {
  const scenarios = [
    {
      title: "Election Polling",
      context: "Presidential election poll",
      requirements: {
        marginError: 3, // ±3%
        confidence: 0.95,
        proportion: 0.5, // worst case
        population: "300 million"
      },
      result: { n: 1067, cost: "$50,000", interpretation: "Standard national poll size" }
    },
    {
      title: "Medical Trial",
      context: "New drug effectiveness",
      requirements: {
        marginError: 5, // mmHg blood pressure
        confidence: 0.99,
        sigma: 12,
        population: "Hypertensive adults"
      },
      result: { n: 96, cost: "$480,000", interpretation: "Phase 3 trial subset" }
    },
    {
      title: "Quality Control",
      context: "Manufacturing defect rate",
      requirements: {
        marginError: 0.01, // 1% defect rate precision
        confidence: 0.90,
        proportion: 0.05, // expected defect rate
        population: "Daily production"
      },
      result: { n: 1825, cost: "$9,125", interpretation: "Daily sampling plan" }
    }
  ];
  
  return (
    <div className="space-y-4">
      {scenarios.map((scenario, i) => (
        <ScenarioCard key={i} {...scenario} />
      ))}
    </div>
  );
};
```

### 5. Worked Example Component
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Example: Estimating average commute time
  // Want: E = 5 minutes, 95% confidence
  // Know: σ ≈ 20 minutes from pilot study
  
  const steps = [
    {
      step: 1,
      description: "Identify requirements",
      calculation: "E = 5, \\alpha = 0.05, \\sigma = 20"
    },
    {
      step: 2,
      description: "Find critical value",
      calculation: "z_{0.025} = 1.96"
    },
    {
      step: 3,
      description: "Apply formula",
      calculation: "n = \\left(\\frac{1.96 \\times 20}{5}\\right)^2 = (7.84)^2"
    },
    {
      step: 4,
      description: "Calculate and round up",
      calculation: "n = 61.47 \\rightarrow n = 62"
    }
  ];
});
```

### 6. Cost-Benefit Analysis Tool
```jsx
const CostBenefitAnalysis = () => {
  const [budget, setBudget] = useState(10000);
  const [costPerSample, setCostPerSample] = useState(50);
  
  // Interactive tool showing:
  // - Achievable precision given budget
  // - Required budget for desired precision
  // - Tradeoff curves
  // - Recommendations
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [calculatorMode, setCalculatorMode] = useState('basic'); // basic, advanced, cost
const [show3D, setShow3D] = useState(true);
const [activeScenario, setActiveScenario] = useState(0);
```

**Preserved Functionality:**
1. **Calculator**: All input controls, formulas, results
2. **3D Lab**: Full 3D visualization with controls
3. **Scenarios**: All real-world examples
4. **Cost Analysis**: Budget calculations

**New Additions:**
1. Worked example section
2. Enhanced cost-benefit tool
3. Comparison of different approaches
4. Sample size tables reference

### 8. Layout Structure

1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "5.3 Sample Size Determination"
4. Introduction with main formula
5. Mathematical framework (factors)
6. Main content tabs:
   - Calculator
   - 3D Laboratory
   - Real-World Scenarios
   - Cost Analysis
7. Worked example (expandable)
8. Quick reference tables
9. BackToHub (bottom)

### 9. Visual Components

**Sample Size Curve:**
```jsx
const SampleSizeCurve = ({ sigma, confidence, errorRange }) => {
  // 2D plot of n vs E
  // Show how n changes with error
  // Highlight practical ranges
  // Interactive hover
};
```

**Budget Visualization:**
```jsx
const BudgetVisualization = ({ budget, costPerUnit, requirements }) => {
  // Bar chart showing allocation
  // Feasible vs desired sample size
  // Cost breakdown
  // ROI analysis
};
```

### 10. Technical Notes

**3D Rendering:**
- Use Three.js or similar for 3D surface
- Optimize mesh generation
- Implement smooth camera controls
- Add axis labels and grid

**Performance:**
- Lazy load 3D visualization
- Cache calculations
- Debounce slider inputs
- Use WebGL when available

**Accessibility:**
- Provide 2D alternative to 3D view
- Keyboard navigation for all controls
- Screen reader descriptions
- High contrast mode

**Validation:**
```javascript
const validateSampleSize = (n, context) => {
  // Check if n exceeds population
  // Warn about very large samples
  // Suggest alternatives
  // Provide practical guidance
};
```

**Export Features:**
```javascript
const exportResults = () => {
  // Generate report with:
  // - Calculation details
  // - Assumptions
  // - Recommendations
  // - Cost analysis
};
```

**File Location:** `/src/components/05-estimation/5-3-SampleSizeCalculation.jsx`