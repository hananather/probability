# Architecture Analysis Report - ProbLab Educational Statistics Platform

## Executive Summary

This report provides a comprehensive analysis of the ProbLab codebase, identifying architectural patterns, anti-patterns, and opportunities for improvement. The codebase demonstrates strong educational focus with interactive visualizations, but would benefit from better code reuse, performance optimizations, and standardized patterns.

### Key Findings
- **Strengths**: Consistent design system, good component separation, educational-first approach
- **Opportunities**: Significant code duplication in D3 setup, inconsistent state management, limited custom hook usage
- **Priority Areas**: Extract reusable D3 hooks, implement consistent error handling, optimize performance

## 1. State Management Patterns

### Current Patterns

#### 1.1 Prevalent useState Usage
Most components use multiple `useState` calls for local state:

```jsx
// Common pattern in components like ExpectationVariance.jsx
const [probs, setProbs] = useState(Array(6).fill(1 / 6));
const [counts, setCounts] = useState(Array(6).fill(0));
const [sampleCount, setSampleCount] = useState(10);
const [isRolling, setIsRolling] = useState(false);
```

**Issues:**
- Components with 10+ state variables become hard to manage
- Related state updates require multiple setter calls
- No centralized state logic

#### 1.2 Complex State Dependencies
Some components have interdependent state that could benefit from reducers:

```jsx
// From CLTSimulation.jsx - multiple related states
const [alpha, setAlpha] = useState(2);
const [beta, setBeta] = useState(5);
const [n, setN] = useState(10);
const [draws, setDraws] = useState(10);
const [counts, setCounts] = useState([]);
```

### Recommendations

#### Use useReducer for Complex State
```jsx
// Proposed pattern for components with related state
const initialState = {
  distribution: { alpha: 2, beta: 5 },
  sampling: { n: 10, draws: 10 },
  results: { counts: [], isAnimating: false }
};

function simulationReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DISTRIBUTION':
      return { ...state, distribution: { ...state.distribution, ...action.payload } };
    case 'UPDATE_SAMPLING':
      return { ...state, sampling: { ...state.sampling, ...action.payload } };
    case 'ADD_SAMPLE':
      return { ...state, results: { counts: [...state.results.counts, action.payload] } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

## 2. Custom Hooks Analysis

### Current Hook Usage
- Limited custom hooks: only `useD3`, `useD3Drag`, `useMathJaxQueue`
- Significant D3 code duplication across components
- No hooks for common statistical calculations

### Identified Patterns for Extraction

#### 2.1 D3 Visualization Setup
Every D3 component repeats similar setup:

```jsx
// Repeated pattern in 40+ components
useEffect(() => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
  
  const width = svgRef.current.clientWidth;
  const height = 350;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  
  // ... scales, axes, etc.
}, [/* dependencies */]);
```

#### Proposed Custom Hook
```jsx
function useD3Setup(ref, dimensions, margins) {
  const [scales, setScales] = useState({ x: null, y: null });
  const [sizes, setSizes] = useState({ width: 0, height: 0, innerWidth: 0, innerHeight: 0 });
  
  useEffect(() => {
    if (!ref.current) return;
    
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    
    const { width, height } = dimensions;
    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;
    
    setSizes({ width, height, innerWidth, innerHeight });
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);
    
    return { svg, g, innerWidth, innerHeight };
  }, [ref, dimensions, margins]);
  
  return { scales, sizes, setScales };
}
```

#### 2.2 Animation Patterns
Common animation patterns could be extracted:

```jsx
function useD3Animation(ref, animationFn, dependencies) {
  const animationRef = useRef();
  
  const startAnimation = useCallback(() => {
    if (animationRef.current) return;
    animationRef.current = animationFn();
  }, [animationFn]);
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    return () => stopAnimation();
  }, dependencies);
  
  return { startAnimation, stopAnimation, isAnimating: !!animationRef.current };
}
```

## 3. Component Composition Patterns

### Current Patterns

#### 3.1 Good Practices
- Consistent use of `VisualizationContainer` wrapper
- Modular component structure (visualization + controls + stats)
- Clear separation of concerns

#### 3.2 Issues Identified

**Prop Drilling**
Some components pass props through multiple levels:
```jsx
// In parent
<VisualizationContainer data={data}>
  <GraphSection data={data}>
    <Graph data={data} />
  </GraphSection>
</VisualizationContainer>
```

**Inline Component Definitions**
Several components define sub-components inline, causing re-renders:
```jsx
// Anti-pattern found in multiple files
function ParentComponent() {
  // This recreates InnerComponent on every render
  const InnerComponent = ({ value }) => <div>{value}</div>;
  return <InnerComponent value={someValue} />;
}
```

### Recommendations

#### 3.3 Component Composition Best Practices
```jsx
// Extract sub-components
const GraphSection = memo(({ children }) => (
  <div className="graph-section">{children}</div>
));

// Use component composition
function VisualizationWrapper({ children, controls }) {
  return (
    <div className="flex">
      <div className="flex-1">{children}</div>
      <div className="w-1/3">{controls}</div>
    </div>
  );
}
```

## 4. Error Handling Strategies

### Current State
- Basic `ErrorBoundary` component exists but underutilized
- Silent error handling in some D3 code
- No consistent error reporting

### Identified Gaps
1. D3 errors often fail silently
2. No error boundaries around individual visualizations
3. Missing user-friendly error messages
4. No error logging/reporting mechanism

### Recommendations

#### 4.1 Enhanced Error Boundary
```jsx
// Proposed enhanced error boundary with fallback UI
function VisualizationErrorBoundary({ children, componentName }) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <VisualizationError 
          componentName={componentName}
          error={error}
          onRetry={() => window.location.reload()}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### 4.2 D3 Error Handling
```jsx
function safeD3Operation(operation, fallback = null) {
  try {
    return operation();
  } catch (error) {
    console.error('D3 operation failed:', error);
    return fallback;
  }
}

// Usage
const totalLength = safeD3Operation(
  () => path.node().getTotalLength(),
  1000 // fallback length
);
```

## 5. Performance Optimization Analysis

### Current Performance Patterns

#### 5.1 Good Practices Found
- `React.memo` used in some heavy components (CLTSimulation, ConfidenceInterval)
- Debouncing in ExpectationVariance for drag operations
- useRef for D3 elements to avoid re-renders

#### 5.2 Performance Issues

**Unnecessary Re-renders**
```jsx
// Anti-pattern: Creating new objects in render
<Graph data={{ values: counts, params: { alpha, beta } }} />
// This creates a new object every render
```

**Heavy Computations in Render**
```jsx
// Found in multiple components
const sampleMean = counts.reduce((sum, c, i) => sum + (i + 1) * c, 0) / sampleTotal;
// Computed on every render without memoization
```

### Optimization Recommendations

#### 5.3 Memoization Strategy
```jsx
// Memoize expensive calculations
const statistics = useMemo(() => {
  if (counts.length === 0) return { mean: 0, variance: 0 };
  
  const total = counts.reduce((a, b) => a + b, 0);
  const mean = counts.reduce((sum, c, i) => sum + (i + 1) * c, 0) / total;
  const variance = counts.reduce((sum, c, i) => 
    sum + Math.pow((i + 1) - mean, 2) * c, 0
  ) / total;
  
  return { mean, variance, total };
}, [counts]);

// Memoize callbacks
const handleReset = useCallback(() => {
  setProbs(Array(6).fill(1 / 6));
  setCounts(Array(6).fill(0));
  expectedDataRef.current = [];
}, []); // No dependencies = stable reference
```

## 6. Code Duplication Analysis

### Major Duplication Areas

#### 6.1 D3 Setup Code
- SVG initialization: ~40 instances
- Scale creation: ~35 instances
- Axis setup: ~30 instances
- Grid lines: ~25 instances

#### 6.2 Statistical Calculations
```jsx
// Normal PDF calculation appears in 8+ files
const normalPDF = (x, mean, std) => {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * 
    Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
};
```

#### 6.3 Animation Patterns
Ball drop animations, transitions, and progress animations repeated across components.

### Proposed Utilities

#### 6.4 Statistical Utilities
```jsx
// src/utils/statistics.js
export const distributions = {
  normal: {
    pdf: (x, μ, σ) => (1 / (σ * Math.sqrt(2 * Math.PI))) * 
      Math.exp(-0.5 * Math.pow((x - μ) / σ, 2)),
    cdf: (x, μ, σ) => jStat.normal.cdf(x, μ, σ),
    sample: (μ, σ) => jStat.normal.sample(μ, σ)
  },
  // ... other distributions
};

export const calculateStats = (data) => {
  const n = data.length;
  const mean = d3.mean(data);
  const variance = d3.variance(data);
  const std = Math.sqrt(variance);
  return { n, mean, variance, std };
};
```

## 7. Event Handling Consistency

### Current Patterns
- Mix of inline handlers and extracted functions
- Inconsistent event cleanup in D3 code
- Some memory leaks from unremoved listeners

### Recommendations

#### 7.1 Consistent D3 Event Cleanup
```jsx
useEffect(() => {
  const svg = d3.select(ref.current);
  
  // Add listeners
  const handleClick = () => { /* ... */ };
  svg.on('click', handleClick);
  
  // Cleanup
  return () => {
    svg.on('click', null);
    svg.selectAll('*').remove();
  };
}, [dependencies]);
```

## 8. Architectural Improvements Roadmap

### Phase 1: Foundation (Week 1-2)
1. **Create Custom Hooks Library**
   - `useD3Setup` - Standard D3 initialization
   - `useD3Scales` - Reusable scale management
   - `useD3Animation` - Animation lifecycle management
   - `useStatistics` - Common statistical calculations

2. **Extract Utility Functions**
   - Statistical calculations
   - D3 helpers (axes, grids, transitions)
   - Format utilities

### Phase 2: Component Refactoring (Week 3-4)
1. **Refactor High-Impact Components**
   - Start with most duplicated patterns
   - Apply new custom hooks
   - Add proper error boundaries

2. **Performance Optimizations**
   - Add memoization to expensive calculations
   - Implement proper React.memo usage
   - Optimize re-render triggers

### Phase 3: Architecture Enhancement (Week 5-6)
1. **State Management**
   - Implement useReducer for complex components
   - Consider context for shared state (theme, settings)

2. **Error Handling**
   - Comprehensive error boundary strategy
   - User-friendly error messages
   - Error logging system

### Phase 4: Quality & Documentation (Week 7-8)
1. **Testing Strategy**
   - Unit tests for utilities
   - Component testing patterns
   - D3 visualization testing approach

2. **Documentation**
   - Component API documentation
   - Custom hooks usage guide
   - Architecture decision records

## 9. Priority Matrix

| Improvement | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Extract D3 Setup Hook | High | Low | P0 |
| Statistical Utilities | High | Low | P0 |
| Fix Memory Leaks | High | Medium | P0 |
| useReducer for Complex State | Medium | Medium | P1 |
| Comprehensive Error Handling | Medium | Medium | P1 |
| Performance Optimizations | Medium | High | P2 |
| TypeScript Migration | Low | High | P3 |

## 10. Code Examples for Immediate Implementation

### 10.1 useD3Visualization Hook
```jsx
// src/hooks/useD3Visualization.js
export function useD3Visualization(config) {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scales, setScales] = useState({});
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const { width, height } = svgRef.current.getBoundingClientRect();
    setDimensions({ width, height });
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const { margins = { top: 20, right: 20, bottom: 40, left: 40 } } = config;
    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);
    
    // Initialize scales
    const xScale = d3.scaleLinear().range([0, innerWidth]);
    const yScale = d3.scaleLinear().range([innerHeight, 0]);
    
    setScales({ x: xScale, y: yScale });
    
    // Add resize observer
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    
    resizeObserver.observe(svgRef.current);
    
    return () => {
      resizeObserver.disconnect();
      svg.selectAll("*").remove();
    };
  }, [config]);
  
  return { svgRef, dimensions, scales };
}
```

### 10.2 Visualization Error Boundary
```jsx
// src/components/shared/VisualizationErrorBoundary.jsx
export function VisualizationErrorBoundary({ children, name, onError }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6">
          <h3 className="text-red-400 font-bold text-lg mb-2">
            Visualization Error: {name}
          </h3>
          <p className="text-red-300 text-sm mb-4">{error.message}</p>
          <div className="flex gap-2">
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Conclusion

The ProbLab codebase demonstrates strong educational design principles but would significantly benefit from architectural improvements. The proposed refactoring plan prioritizes high-impact, low-effort improvements first, ensuring minimal disruption to the educational experience while improving code quality and maintainability.

Key next steps:
1. Implement core custom hooks (useD3Setup, useD3Scales)
2. Extract statistical utilities
3. Add error boundaries to all visualizations
4. Begin systematic component refactoring starting with highest duplication

These improvements will lead to:
- 40-50% reduction in code duplication
- Improved performance through proper memoization
- Better error handling and user experience
- Easier maintenance and feature additions
- Consistent patterns for new contributors