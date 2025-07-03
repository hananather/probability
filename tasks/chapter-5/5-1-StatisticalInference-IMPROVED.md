# Plan: 5.1 - Statistical Inference (IMPROVED - Course Aligned)

## Component Development Mandate

**CRITICAL: This component MUST align with MAT 2377 Chapter 5 content (pages 2-7)**

**Course Material Coverage:**
- Page 2: Statistical inference definition and goals
- Page 3: Examples (product reliability, election polling)
- Page 4: Point estimates, statistics, sampling distributions
- Page 5: Types of statistics
- Page 6-7: Estimator variance and standard error

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern
- Wrap LaTeX sections in React.memo to prevent re-rendering issues
- See reference: `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`

**Gold Standard Reference Components:**
- `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- `/src/components/07-linear-regression/7-1-CorrelationCoefficient.jsx`

**Guiding Philosophy:** Create an interactive learning experience that teaches the fundamental concepts of statistical inference through the exact examples and formulas from the course material.

## Component Structure

### 1. Opening Section - Course Definition
```jsx
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  
  // Direct quote from course material page 2:
  // "One of the goals of statistical inference is to draw conclusions about a
  // population based on a random sample from the population."
  
  return (
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-3">
        <p className="text-lg font-semibold text-white mb-3">
          Statistical Inference: From Sample to Population
        </p>
        <p className="text-base">
          One of the goals of statistical inference is to draw conclusions about a 
          <span className="text-emerald-400 font-semibold"> population</span> based on a 
          <span className="text-blue-400 font-semibold"> random sample</span> from the population.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manufacturing Example
            </h4>
            <p className="text-xs">
              Can we assess the reliability of a product's manufacturing process by 
              randomly selecting a sample of the final product and determining how 
              many of them are compliant?
            </p>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Election Polling Example
            </h4>
            <p className="text-xs">
              Can we determine who will win an election by polling a small sample of 
              respondents?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
```

### 2. Core Concepts Grid - Aligned with Course Pages 4-5
```jsx
const CoreConceptsGrid = React.memo(function CoreConceptsGrid() {
  const concepts = [
    {
      title: "Parameter θ",
      symbol: "\\theta",
      description: "Unknown population value we want to estimate",
      example: "True mean weight μ of ALL gear wheels",
      color: "emerald"
    },
    {
      title: "Point Estimate",
      symbol: "\\hat{\\theta}",
      description: "Single value estimate from sample data",
      example: "Sample mean X̄ estimates population mean μ",
      color: "blue"
    },
    {
      title: "Statistic",
      symbol: "T(X_1, ..., X_n)",
      description: "Function of random sample",
      example: "Sample mean, median, variance, etc.",
      color: "purple"
    },
    {
      title: "Sampling Distribution",
      symbol: "\\bar{X} \\sim N(\\mu, \\sigma^2/n)",
      description: "Distribution of the statistic",
      example: "CLT tells us X̄ is approximately normal",
      color: "orange"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {concepts.map((concept, index) => (
        <div key={index} className={`bg-gradient-to-br from-${concept.color}-900/20 to-neutral-800 
                                     rounded-lg p-4 border border-${concept.color}-500/30`}>
          <h3 className={`text-lg font-semibold text-${concept.color}-400 mb-2`}>
            {concept.title}
          </h3>
          <div className="text-center my-3 p-2 bg-neutral-900/50 rounded">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[${concept.symbol}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300 mb-2">{concept.description}</p>
          <p className="text-xs text-neutral-400 italic">Example: {concept.example}</p>
        </div>
      ))}
    </div>
  );
});
```

### 3. Gear Wheel Example - Direct from Course Page 3
```jsx
const GearWheelExample = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [showSampling, setShowSampling] = useState(false);
  const [samples, setSamples] = useState([]);
  const [sampleMean, setSampleMean] = useState(null);
  
  // True population parameters (unknown in practice)
  const TRUE_MU = 50; // grams
  const TRUE_SIGMA = 2; // grams
  
  const generateSample = () => {
    const newSamples = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(TRUE_MU, TRUE_SIGMA)()
    );
    setSamples(newSamples);
    setSampleMean(d3.mean(newSamples));
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Example: Gear Wheel Manufacturing
      </h3>
      
      <div className="bg-neutral-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-neutral-300 mb-2">
          Consider a process that manufactures gear wheels. Let X be the random variable 
          that records the weight of a randomly selected gear wheel. 
          <span className="text-yellow-400"> What is the population mean μ = E[X]?</span>
        </p>
      </div>
      
      {/* Population visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-emerald-400 mb-2">Population (Unknown)</h4>
          <div className="bg-neutral-900 rounded-lg p-4 h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">∞</div>
              <p className="text-sm text-neutral-400">Infinite gear wheels</p>
              <p className="text-xs text-neutral-500 mt-2">
                True μ = ? (unknown)<br/>
                True σ = ? (unknown)
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-400 mb-2">Sample (n = {sampleSize})</h4>
          <GraphContainer height="200px">
            {/* Histogram of sample weights */}
          </GraphContainer>
          {sampleMean && (
            <div className="mt-2 text-center">
              <p className="text-sm">
                Sample mean: <span className="font-mono text-blue-400">
                  X̄ = {sampleMean.toFixed(2)} grams
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <ControlGroup>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size (n)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={generateSample}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Draw Sample
          </button>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};
```

### 4. Types of Statistics - Course Page 5
```jsx
const StatisticsShowcase = React.memo(function StatisticsShowcase() {
  const [selectedStatistic, setSelectedStatistic] = useState('mean');
  
  const statistics = {
    mean: {
      name: "Sample Mean",
      formula: "\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i",
      description: "Average of all observations",
      icon: TrendingUp
    },
    median: {
      name: "Sample Median",
      formula: "\\tilde{X} = X_{((n+1)/2)}",
      description: "Middle value when sorted",
      icon: GitBranch
    },
    variance: {
      name: "Sample Variance",
      formula: "S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(X_i - \\bar{X})^2",
      description: "Measure of spread",
      icon: Maximize2
    },
    range: {
      name: "Sample Range",
      formula: "R = X_{(n)} - X_{(1)}",
      description: "Maximum minus minimum",
      icon: ArrowUpDown
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Types of Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(statistics).map(([key, stat]) => {
          const Icon = stat.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedStatistic(key)}
              className={`p-3 rounded-lg transition-all ${
                selectedStatistic === key
                  ? 'bg-emerald-900/30 border-2 border-emerald-500'
                  : 'bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium">{stat.name}</p>
            </button>
          );
        })}
      </div>
      
      {selectedStatistic && (
        <div className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-emerald-400 mb-3">
            {statistics[selectedStatistic].name}
          </h4>
          <div className="text-center my-4 p-3 bg-neutral-900/50 rounded">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[${statistics[selectedStatistic].formula}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            {statistics[selectedStatistic].description}
          </p>
        </div>
      )}
    </VisualizationSection>
  );
});
```

### 5. Standard Error Section - Course Pages 6-7
```jsx
const StandardErrorDemo = () => {
  const [n, setN] = useState(20);
  const [sigma, setSigma] = useState(5);
  
  // Baseball player heights example from page 6
  const baseballHeights = [74,74,72,72,73,69,69,71,76,71,73,73,74,74,69,70,72,73,75,78];
  const xBar = 72.6;
  const s2 = 5.6211;
  const estimatedSE = Math.sqrt(s2 / 20);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Standard Error of Estimators
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Known variance case */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="font-semibold text-blue-400 mb-3">When σ is Known</h4>
          <div className="text-center my-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            The standard error of X̄ when population variance is known
          </p>
        </div>
        
        {/* Unknown variance case */}
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <h4 className="font-semibold text-purple-400 mb-3">When σ is Unknown</h4>
          <div className="text-center my-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{\\sigma}_{\\bar{X}} = \\frac{S}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-300">
            Estimated standard error using sample standard deviation
          </p>
        </div>
      </div>
      
      {/* Baseball heights example */}
      <div className="mt-6 bg-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-400 mb-3">
          Example: Baseball Player Heights
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-neutral-400">Sample Mean</p>
            <p className="font-mono text-lg">X̄ = {xBar}"</p>
          </div>
          <div>
            <p className="text-neutral-400">Sample Variance</p>
            <p className="font-mono text-lg">S² = {s2.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-neutral-400">Standard Error</p>
            <p className="font-mono text-lg">SE = {estimatedSE.toFixed(4)}"</p>
          </div>
        </div>
      </div>
      
      {/* Interactive SE calculator */}
      <ControlGroup>
        <h4 className="font-medium text-white mb-3">Standard Error Calculator</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size (n): {n}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Population SD (σ): {sigma}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-center p-3 bg-emerald-900/20 rounded">
          <p className="text-sm text-neutral-300">Standard Error:</p>
          <p className="text-2xl font-mono text-emerald-400">
            σ(X̄) = {(sigma / Math.sqrt(n)).toFixed(4)}
          </p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};
```

### 6. Sampling Distribution Visualization
```jsx
const SamplingDistributionDemo = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(0);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Animation to show CLT in action
  const runSimulation = () => {
    setIsRunning(true);
    const means = [];
    
    const simulate = () => {
      if (means.length < 1000) {
        // Generate sample and calculate mean
        const sample = Array.from({ length: sampleSize }, () => 
          d3.randomNormal(100, 15)() // μ=100, σ=15
        );
        means.push(d3.mean(sample));
        setSampleMeans([...means]);
        setNumSamples(means.length);
        
        requestAnimationFrame(simulate);
      } else {
        setIsRunning(false);
      }
    };
    
    simulate();
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Sampling Distribution of X̄
      </h3>
      
      <div className="mb-4 p-4 bg-neutral-800 rounded-lg">
        <p className="text-sm text-neutral-300">
          According to the Central Limit Theorem:
        </p>
        <div className="text-center my-3">
          <span dangerouslySetInnerHTML={{ 
            __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` 
          }} />
        </div>
      </div>
      
      <GraphContainer height="300px">
        {/* Histogram showing distribution of sample means */}
        {/* Overlay theoretical normal curve */}
      </GraphContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">Samples Taken</p>
          <p className="text-xl font-mono">{numSamples}</p>
        </div>
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">Mean of Means</p>
          <p className="text-xl font-mono">
            {sampleMeans.length > 0 ? d3.mean(sampleMeans).toFixed(2) : '—'}
          </p>
        </div>
        <div className="bg-neutral-800 rounded p-3">
          <p className="text-xs text-neutral-400">SE of Means</p>
          <p className="text-xl font-mono">
            {sampleMeans.length > 1 ? d3.deviation(sampleMeans).toFixed(2) : '—'}
          </p>
        </div>
      </div>
      
      <ControlGroup>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
        <button
          onClick={() => {
            setSampleMeans([]);
            setNumSamples(0);
          }}
          className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700"
        >
          Reset
        </button>
      </ControlGroup>
    </VisualizationSection>
  );
};
```

### 7. Key Insights Aligned with Course
```jsx
const KeyInsights = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-8">
      <div className="bg-gradient-to-br from-blue-900/20 to-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Point Estimation
        </h4>
        <p className="text-sm text-neutral-300">
          We use statistics (like X̄) to estimate unknown parameters (like μ). 
          The estimate won't be exact, but it's our best guess from the data.
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-900/20 to-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Sampling Variability
        </h4>
        <p className="text-sm text-neutral-300">
          Different samples give different estimates. The standard error measures 
          how much our estimate typically varies from sample to sample.
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Precision & Sample Size
        </h4>
        <p className="text-sm text-neutral-300">
          Larger samples give more precise estimates. The standard error decreases 
          proportionally to 1/√n.
        </p>
      </div>
    </div>
  );
};
```

### 8. Implementation Requirements

**State Management:**
```jsx
const [activeSection, setActiveSection] = useState('introduction');
const [sampleSize, setSampleSize] = useState(30);
const [showMathDetails, setShowMathDetails] = useState(false);
```

**Section Structure:**
1. Introduction (Course definition)
2. Core concepts grid
3. Gear wheel example
4. Types of statistics
5. Standard error demonstration
6. Sampling distribution visualization
7. Key insights

**Data Alignment:**
- Use exact examples from course (gear wheels, baseball heights)
- Use exact formulas and notation from course
- Follow course progression (inference → statistics → standard error)

**Visual Design:**
- Consistent with Chapter 6/7 style
- Emerald green theme for Chapter 5
- Clear separation between known/unknown variance cases

**Technical Notes:**
- Pre-calculate baseball height statistics
- Use d3 for histograms and distributions
- Animate sampling process to show CLT
- React.memo for all LaTeX-heavy sections

**File Location:** `/src/components/05-estimation/5-1-StatisticalInference.jsx`