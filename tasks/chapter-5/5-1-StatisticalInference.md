# Plan: 5.1 - Statistical Inference

## Component Development Mandate

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Components to Consolidate:**
- `/src/components/05-estimation/5-1-statistical-inference/5-1-1-BayesianInference.jsx`
- `/src/components/05-estimation/5-1-statistical-inference/5-1-2-StatisticalInferenceOverview.jsx`
- `/src/components/05-estimation/5-1-statistical-inference/5-1-3-InteractiveInferenceJourney.jsx`
- `/src/components/05-estimation/5-1-statistical-inference/5-1-4-PointEstimation.jsx`

**Reference Implementation Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/07-linear-regression/7-1-CorrelationCoefficient.jsx`

**Core Development Principles:**
1. **Preserve Functionality**: Keep all interactive elements from existing components
2. **Unified Experience**: Create cohesive flow through different concepts
3. **Mathematical Rigor**: Maintain all formulas and calculations
4. **Follow Chapter 6/7 Style**: Match structure and navigation patterns

## Component Structure

### 1. Opening Section
```jsx
const InferenceIntroduction = React.memo(function InferenceIntroduction() {
  const contentRef = useRef(null);
  
  // LaTeX-enabled introduction
  // "How do we draw conclusions about populations from samples?"
  // Show the fundamental flow: Population → Sample → Inference
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          From Data to Decisions: The Art of Statistical Inference
        </p>
        <p>
          Statistical inference allows us to draw conclusions about entire <strong className="text-emerald-400">populations</strong> 
          based on <strong className="text-blue-400">sample data</strong>. This fundamental process underlies:
        </p>
        <ul className="ml-4 space-y-1">
          <li>• Medical diagnosis and drug testing</li>
          <li>• Election polling and market research</li>
          <li>• Quality control in manufacturing</li>
          <li>• Scientific research conclusions</li>
        </ul>
      </div>
    </div>
  );
});
```

### 2. Mathematical Framework
Following the pattern from Chapter 6:
```jsx
const MathematicalFramework = React.memo(function MathematicalFramework() {
  // Grid layout with concept cards
  // Card 1: Population vs Sample
  // Card 2: Parameters vs Statistics
  // Card 3: Sampling Distribution
  // Card 4: Standard Error
  
  const concepts = [
    {
      title: "Population Parameter",
      symbol: "\\mu, \\sigma, p",
      description: "True but unknown values",
      example: "Average height of ALL students"
    },
    {
      title: "Sample Statistic", 
      symbol: "\\bar{X}, S, \\hat{p}",
      description: "Calculated from data",
      example: "Average height of 50 students"
    },
    {
      title: "Sampling Distribution",
      symbol: "\\bar{X} \\sim N(\\mu, \\sigma^2/n)",
      description: "Distribution of all possible samples",
      example: "CLT ensures normality"
    },
    {
      title: "Standard Error",
      symbol: "SE = \\sigma/\\sqrt{n}",
      description: "Precision of estimate",
      example: "How close is X̄ to μ?"
    }
  ];
});
```

### 3. Learning Path Navigation
Preserve the existing hub pattern but as sections within the component:
```jsx
const [activeSection, setActiveSection] = useState('overview');

const sections = {
  overview: {
    title: 'Population to Sample',
    component: StatisticalInferenceOverview,
    icon: Sparkles
  },
  journey: {
    title: 'Interactive Journey',
    component: InteractiveInferenceJourney,
    icon: Activity
  },
  bayesian: {
    title: 'Bayesian Inference',
    component: BayesianInference,
    icon: Brain
  },
  point: {
    title: 'Point Estimation',
    component: PointEstimation,
    icon: Target
  }
};
```

### 4. Preserved Components (Integrated)

**Statistical Inference Overview Section:**
- Population vs Sample visualization
- Parameters vs Statistics comparison
- Sampling variability demonstration
- Keep existing animations

**Interactive Inference Journey:**
- Central Limit Theorem animation
- Sample size effects
- Sampling distribution builder
- Real-time updates

**Bayesian Inference Calculator:**
- Medical testing scenario
- Prior/Posterior visualization
- Bayes' theorem application
- Interactive probability updates

**Point Estimation Demo:**
- Monte Carlo π estimation
- Convergence visualization
- Estimator properties
- Bias and variance concepts

### 5. Worked Example Component
New addition following Chapter 6 pattern:
```jsx
const WorkedExample = React.memo(function WorkedExample() {
  // Example: Estimating average student height
  // Given: Sample of n=36 students, x̄=170cm, σ=12cm
  // Calculate: Standard error, interpret sampling distribution
  // Show all steps with LaTeX
});
```

### 6. Key Insights Section
```jsx
const KeyInsights = () => {
  // Three tabbed insights:
  // 1. When to use Frequentist vs Bayesian
  // 2. Sample size and precision relationship
  // 3. Common misconceptions about inference
};
```

### 7. Implementation Requirements

**State Management:**
```jsx
const [activeSection, setActiveSection] = useState('overview');
const [sampleSize, setSampleSize] = useState(30);
const [showCalculations, setShowCalculations] = useState(false);
const [priorBelief, setPriorBelief] = useState(0.01); // For Bayesian
```

**Preserved Functionality:**
1. All interactive visualizations from existing components
2. Learning path navigation (now as internal sections)
3. Animations and transitions
4. Real-world examples and scenarios

**New Additions:**
1. BackToHub navigation (top and bottom)
2. Consistent styling with Chapter 6/7
3. Worked example section
4. Unified mathematical framework

### 8. Layout Structure

1. BackToHub navigation
2. VisualizationContainer wrapper
3. Title: "5.1 Statistical Inference"
4. Introduction section
5. Mathematical framework grid
6. Section selector (4 paths)
7. Active section content
8. Worked example (expandable)
9. Key insights
10. BackToHub (bottom)

### 9. Specific Features to Preserve

From existing components:
1. **CLT Animation** - Interactive sampling with adjustable parameters
2. **Bayesian Calculator** - Medical testing with visual updates
3. **Monte Carlo Simulation** - Pi estimation with dart throwing
4. **Population Visualizer** - Shows sampling process
5. **3D Distributions** - If performance allows

### 10. Visual Components

**Section Selector:**
```jsx
const SectionSelector = ({ sections, activeSection, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Object.entries(sections).map(([key, section]) => {
        const Icon = section.icon;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "p-4 rounded-lg border transition-all",
              activeSection === key
                ? "bg-emerald-900/30 border-emerald-600"
                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
            )}
          >
            <Icon className="w-8 h-8 mb-2 mx-auto" />
            <h4 className="font-semibold">{section.title}</h4>
          </button>
        );
      })}
    </div>
  );
};
```

### 11. Technical Notes

**Performance Optimizations:**
- Lazy load heavy visualizations
- Use React.memo for static sections
- Debounce interactive updates
- Limit animation frame rates

**Data Management:**
- Pre-calculate example datasets
- Cache Bayesian calculations
- Store user preferences

**Responsive Design:**
- Stack sections vertically on mobile
- Adjust visualization sizes
- Touch-friendly controls

**Color Scheme:**
```javascript
const colors = createColorScheme('estimation');
// Emerald/Green theme for estimation chapter
```

**Integration Requirements:**
- Import all functionality from existing 4 components
- Maintain backwards compatibility where possible
- Preserve all educational content
- Add navigation elements

**File Location:** `/src/components/05-estimation/5-1-StatisticalInference.jsx`