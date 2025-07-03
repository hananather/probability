# Plan: 4.3 - Sampling Distributions

## Component Orchestration Mandate

**CRITICAL: Component Integration Best Practices**
- Integrate 5 sampling distribution components into progressive learning journey
- Build shared sampling engine for consistent behavior across components
- Implement persistent sampling history across all stages
- Create smooth conceptual bridge to Central Limit Theorem

**Gold Standard Integration Examples:**
- Multi-stage learning experiences in Chapter 2
- Progressive complexity builders in Chapter 3
- Reference successful simulation-based learning tools

**Guiding Philosophy:** Transform individual sampling components into a cohesive exploration where students build intuition through repeated sampling, discover patterns, and prepare for the CLT revelation.

**Core Orchestration Principles:**
1. **Persistent Sampling History**: All samples accumulate across components
2. **Progressive Understanding**: Each stage builds on previous discoveries
3. **Unified Simulation Engine**: Consistent random generation and statistics
4. **Interactive Discovery**: Students uncover principles through exploration
5. **Performance at Scale**: Handle thousands of samples efficiently

## Component File
`/src/app/chapter4/sampling-distributions/page.jsx`

## Course Content Coverage
From MAT 2377 Chapter 4.3:
- Sum of Independent Random Variables (p.31)
- Independent and Identically Distributed Random Variables (p.32)
- Sample Mean (Reprise) (p.35)
- Sum of Independent Normal Random Variables (p.37)

## Components to Integrate (5 Total)

1. **4-3-0-SamplingDistributionsHub.jsx** - Transform into learning path navigator
2. **4-3-0-SamplingDistributionsInteractive.jsx** - Core interactive sampling
3. **4-3-2-SamplingDistributionsProperties-impl.jsx** - Properties exploration
4. **4-3-2-SamplingDistributionsTheory.jsx** - Mathematical theory
5. **4-3-4-SamplingDistributionsVisual.jsx** - Advanced visualizations

## Component Integration Map

```
Learning Path Overview
├── Primary: 4-3-0-SamplingDistributionsHub.jsx (as navigator)
├── Data Flow: Initialize sampling engine
└── Transition: Select path → Start (0.3s)

Stage 1: Interactive Foundation
├── Primary: 4-3-0-SamplingDistributionsInteractive.jsx
├── Enhancement: Guided sampling tasks
├── Data Flow: Generate samples → Store in history
└── Transition: Fade → Stage 2 (0.5s)

Stage 2: Properties Discovery
├── Primary: 4-3-2-SamplingDistributionsProperties-impl.jsx
├── Enhancement: Live property calculations
├── Data Flow: Use sampling history → Compute properties
└── Transition: Expand → Stage 3 (0.6s)

Stage 3: Mathematical Theory
├── Primary: 4-3-2-SamplingDistributionsTheory.jsx
├── Enhancement: Interactive proofs
├── Data Flow: Reference empirical results
└── Transition: Morph → Stage 4 (0.5s)

Stage 4: Visual Mastery
├── Primary: 4-3-4-SamplingDistributionsVisual.jsx
├── Enhancement: Multi-dimensional views
├── Data Flow: Visualize complete history
└── Transition: Complete → CLT Preview (0.8s)
```

## Implementation Structure

### Page Component
```jsx
export default function SamplingDistributionsPage() {
  // Global sampling state
  const [globalState, setGlobalState] = useState({
    currentStage: 'introduction',
    populationDistribution: 'uniform',
    sampleSize: 30,
    samplingHistory: {
      samples: [],
      sampleMeans: [],
      metadata: {
        totalSamples: 0,
        startTime: Date.now()
      }
    },
    learningProgress: {
      completedStages: [],
      discoveries: [],
      tasksCompleted: 0
    },
    simulationSettings: {
      autoSample: false,
      sampleRate: 100, // ms between samples
      maxHistory: 10000
    }
  });

  // Shared sampling engine
  const samplingEngine = useSamplingEngine({
    population: globalState.populationDistribution,
    seed: null // for reproducibility in demos
  });

  // Navigation handler
  const navigateToStage = (stage) => {
    // Save current progress
    saveStageProgress(globalState.currentStage);
    
    setGlobalState(prev => ({
      ...prev,
      currentStage: stage,
      learningProgress: {
        ...prev.learningProgress,
        completedStages: [...prev.learningProgress.completedStages, prev.currentStage]
      }
    }));
  };

  return (
    <VisualizationContainer className="sampling-distributions-page">
      <BackToHub chapter={4} section="4.3" />
      
      {/* Learning Path Navigator (transformed Hub) */}
      <LearningPathNavigator 
        stages={['introduction', 'interactive', 'properties', 'theory', 'visualization']}
        current={globalState.currentStage}
        completed={globalState.learningProgress.completedStages}
        onNavigate={navigateToStage}
      />
      
      {/* Persistent Sampling Controls */}
      <SamplingControlPanel 
        population={globalState.populationDistribution}
        sampleSize={globalState.sampleSize}
        onPopulationChange={(pop) => handlePopulationChange(pop)}
        onSampleSizeChange={(n) => handleSampleSizeChange(n)}
        autoSample={globalState.simulationSettings.autoSample}
      />
      
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={globalState.currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentStage()}
        </motion.div>
      </AnimatePresence>
      
      {/* Persistent History Viewer */}
      <SamplingHistoryPanel 
        history={globalState.samplingHistory}
        minimized={globalState.currentStage === 'introduction'}
        onClear={() => clearSamplingHistory()}
      />
    </VisualizationContainer>
  );
}
```

### Stage Implementations

#### Stage 1: Interactive Foundation
```jsx
const InteractiveFoundation = ({ globalState, samplingEngine, updateState }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [localSamples, setLocalSamples] = useState([]);
  
  const tasks = [
    { id: 'first-sample', instruction: 'Draw your first sample of 30 values' },
    { id: 'multiple-samples', instruction: 'Draw 10 samples and observe the means' },
    { id: 'different-sizes', instruction: 'Try different sample sizes (10, 30, 100)' },
    { id: 'pattern-recognition', instruction: 'What pattern do you see forming?' }
  ];
  
  const handleSampleDraw = async () => {
    const sample = await samplingEngine.drawSample(globalState.sampleSize);
    const sampleMean = d3.mean(sample.values);
    
    // Update local display
    setLocalSamples(prev => [...prev, sample]);
    
    // Update global history
    updateState({
      samplingHistory: {
        ...globalState.samplingHistory,
        samples: [...globalState.samplingHistory.samples, sample],
        sampleMeans: [...globalState.samplingHistory.sampleMeans, sampleMean],
        metadata: {
          ...globalState.samplingHistory.metadata,
          totalSamples: globalState.samplingHistory.metadata.totalSamples + 1
        }
      }
    });
    
    // Check task completion
    checkTaskCompletion(tasks[currentTask], globalState.samplingHistory);
  };
  
  return (
    <div className="interactive-foundation">
      <TaskGuide 
        tasks={tasks}
        current={currentTask}
        onTaskComplete={() => setCurrentTask(prev => prev + 1)}
      />
      
      <SamplingDistributionsInteractive 
        population={globalState.populationDistribution}
        sampleSize={globalState.sampleSize}
        onSampleDrawn={handleSampleDraw}
        samplingHistory={localSamples}
        enhancedMode={true}
      />
      
      <DiscoveryPrompts 
        samplesDrawn={globalState.samplingHistory.metadata.totalSamples}
        currentTask={tasks[currentTask]}
      />
    </div>
  );
};
```

#### Stage 2: Properties Discovery
```jsx
const PropertiesDiscovery = ({ globalState, updateState }) => {
  const [focusProperty, setFocusProperty] = useState('mean');
  const [calculations, setCalculations] = useState({});
  
  useEffect(() => {
    // Calculate properties from sampling history
    const props = calculateSamplingProperties(globalState.samplingHistory);
    setCalculations(props);
  }, [globalState.samplingHistory]);
  
  return (
    <div className="properties-discovery">
      <PropertySelector 
        properties={['mean', 'variance', 'shape', 'convergence']}
        selected={focusProperty}
        onChange={setFocusProperty}
      />
      
      <div className="properties-content">
        <SamplingDistributionsProperties 
          focusProperty={focusProperty}
          samplingHistory={globalState.samplingHistory}
          calculations={calculations}
          populationParams={getPopulationParams(globalState.populationDistribution)}
        />
        
        <PropertyInsights 
          property={focusProperty}
          empirical={calculations[focusProperty]}
          theoretical={getTheoreticalValue(focusProperty, globalState)}
        />
      </div>
      
      <InteractiveComparison 
        empiricalMean={calculations.meanOfMeans}
        theoreticalMean={getPopulationParams(globalState.populationDistribution).mean}
        sampleSize={globalState.sampleSize}
      />
    </div>
  );
};
```

## Technical Specifications

### Performance Requirements
- **Sample Generation**: < 50ms for n=1000
- **History Update**: < 16ms (60fps during animation)
- **Statistics Calculation**: < 100ms for 10k samples
- **Memory Limit**: Max 10k samples in history

### State Management Architecture
```javascript
const stateArchitecture = {
  global: {
    populationDistribution: 'uniform',
    sampleSize: 30,
    samplingHistory: {
      samples: [], // Array of {id, values, mean, timestamp}
      sampleMeans: [], // Quick access array
      metadata: {}
    }
  },
  computed: {
    // Memoized calculations
    distributionOfMeans: computeDistribution(sampleMeans),
    standardError: {
      empirical: sd(sampleMeans),
      theoretical: populationSD / sqrt(sampleSize)
    },
    convergenceMetrics: {}
  },
  persistence: {
    localStorage: ['learningProgress', 'discoveries'],
    sessionStorage: ['samplingHistory', 'currentStage'],
    indexedDB: 'largeSampleHistories' // For > 1000 samples
  }
};
```

### Data Flow Specification
```javascript
const dataFlow = {
  sampleGeneration: {
    flow: [
      'User triggers sample',
      'SamplingEngine generates values',
      'Calculate sample statistics',
      'Update local component state',
      'Update global history',
      'Trigger visualization updates',
      'Check task completion'
    ]
  },
  populationChange: {
    flow: [
      'Clear sampling history',
      'Reset sampling engine',
      'Update all visualizations',
      'Reset task progress'
    ]
  },
  stageTransition: {
    flow: [
      'Save current stage data',
      'Preload next component',
      'Transfer sampling history',
      'Initialize new stage state'
    ]
  }
};
```

### Sampling Engine Architecture
```javascript
class SamplingEngine {
  constructor({ population, seed }) {
    this.population = population;
    this.rng = seed ? seedrandom(seed) : Math.random;
    this.distributions = {
      uniform: () => this.rng() * 100,
      normal: () => d3.randomNormal(50, 15)(this.rng),
      exponential: () => d3.randomExponential(1/50)(this.rng),
      bimodal: () => this.rng() < 0.5 
        ? d3.randomNormal(30, 10)(this.rng)
        : d3.randomNormal(70, 10)(this.rng)
    };
  }
  
  drawSample(size) {
    const values = Array(size).fill(0)
      .map(() => this.distributions[this.population]());
    
    return {
      id: uuid(),
      values,
      mean: d3.mean(values),
      variance: d3.variance(values),
      timestamp: Date.now()
    };
  }
  
  // Batch sampling for performance
  drawBatch(sampleSize, batchSize) {
    return Array(batchSize).fill(0)
      .map(() => this.drawSample(sampleSize));
  }
}
```

## Layout Structure
```
┌─────────────────────────────────────────────┐
│ ← Back to Hub          Section 4.3         │
├─────────────────────────────────────────────┤
│ Path: [Intro] → [Interactive] → [Props] →  │
│       [Theory] → [Visual]                   │
├─────────────────────────────────────────────┤
│ Population: [Uniform ▼] Size: [30] [Sample]│
│ □ Auto-sample (100ms)                       │
├─────────────────────────────────────────────┤
│ ┌───────────────────┬─────────────────────┐ │
│ │                   │ History (523 samples)│ │
│ │   Active Stage    │ Mean of means: 49.8  │ │
│ │    Component      │ SE: 2.89             │ │
│ │                   │ [Clear] [Export]     │ │
│ └───────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Animation Coordination
```javascript
const animationConfig = {
  sampleGeneration: {
    // Animate from population to sample
    duration: 800,
    stagger: 50, // ms between points
    easing: 'easeOutQuad'
  },
  meanCalculation: {
    // Animate mean line appearance
    duration: 400,
    delay: 800 // After sample animation
  },
  histogramUpdate: {
    // Add new bar to sampling distribution
    duration: 300,
    easing: 'easeInOut'
  },
  stageTransitions: {
    exit: { opacity: 0, y: -20, duration: 500 },
    enter: { opacity: 1, y: 0, duration: 500 }
  }
};
```

## Component Lifecycle Management
```javascript
const lifecycleHooks = {
  onStageMount: (stage) => {
    // Initialize stage-specific features
    if (stage === 'visualization') {
      precomputeVisualizations(globalState.samplingHistory);
    }
    
    // Set up auto-sampling if enabled
    if (globalState.simulationSettings.autoSample) {
      startAutoSampling();
    }
  },
  
  onStageUnmount: (stage) => {
    // Stop any running simulations
    stopAutoSampling();
    
    // Save discoveries
    if (stage === 'properties') {
      saveDiscoveries(getStageDiscoveries());
    }
  },
  
  onHistoryUpdate: debounce(() => {
    // Recalculate statistics
    updateComputedValues();
    
    // Check memory usage
    if (samplingHistory.samples.length > 9000) {
      showMemoryWarning();
    }
  }, 100)
};
```

## Fallback Strategies
```javascript
const fallbacks = {
  memoryOverflow: {
    threshold: 10000,
    strategy: 'Archive old samples, keep summary statistics',
    implementation: 'Move to IndexedDB, keep last 1000 in memory'
  },
  
  slowSampling: {
    detection: 'Sample generation > 100ms',
    strategy: 'Use Web Worker for generation',
    implementation: 'OffloadToWorker component'
  },
  
  renderingBottleneck: {
    detection: 'FPS < 30 during updates',
    strategy: 'Simplify visualizations, batch updates',
    implementation: 'Use RequestAnimationFrame batching'
  }
};
```

## Success Metrics
- ✓ All 5 components integrated cohesively
- ✓ Sampling history persists across stages
- ✓ < 50ms sample generation time
- ✓ Smooth animations at 60fps
- ✓ Handle 10k+ samples efficiently
- ✓ Clear learning progression
- ✓ Mobile responsive with touch
- ✓ Discoveries tracked and celebrated

## Reference Implementations
- PhET's sampling distribution simulator
- Seeing Theory's CLT visualization
- Chapter 3's distribution builders
- Performance patterns from data visualization libraries