# Plan: 4.2 - Visual Summaries

## Component Orchestration Mandate

**CRITICAL: Component Integration Best Practices**
- Unify 8 visualization components (5 histogram + 3 boxplot) into cohesive experience
- Create seamless switching between histogram and boxplot views of same data
- Implement shared visualization engine for consistent rendering
- Maintain individual component features while adding unified controls

**Gold Standard Integration Examples:**
- Data visualization dashboards with multiple chart types
- Chapter 3's multi-distribution viewer
- Reference successful visualization orchestrations

**Guiding Philosophy:** Transform separate visualization components into a unified visual analytics suite where students can explore data through multiple lenses seamlessly.

**Core Orchestration Principles:**
1. **Unified Data Pipeline**: Single dataset flows to all visualization types
2. **Synchronized Updates**: Changes in one view reflect in others
3. **Progressive Disclosure**: Start with histograms, add complexity
4. **Visual Consistency**: Shared scales, colors, and animations
5. **Performance**: Efficient rendering with shared computation

## Component File
`/src/app/chapter4/visual-summaries/page.jsx`

## Course Content Coverage
From MAT 2377 Chapter 4.2:
- Skewness (p.21)
- Dispersion Measures (p.16)
- Histograms (p.23)
- Shapes of Datasets (p.24)
- Boxplots (implied as visual summary tool)

## Components to Integrate (8 Total)

### Histogram Components (5)
1. **4-2-0-HistogramHub.jsx** - Transform into visualization selector
2. **4-2-1-HistogramIntuitiveIntro.jsx** - Introduction to histograms
3. **4-2-1-HistogramShapeExplorer.jsx** - Shape analysis and skewness
4. **4-2-2-HistogramInteractiveJourney.jsx** - Building histograms step-by-step
5. **4-2-3-HistogramShapeAnalysis.jsx** - Advanced shape analysis

### Boxplot Components (3)
6. **4-6-1-BoxplotQuartilesExplorer.jsx** - Boxplot fundamentals
7. **4-6-1-BoxplotQuartilesJourney.jsx** - Guided boxplot learning
8. **4-6-2-BoxplotRealWorldExplorer.jsx** - Real-world applications

## Component Integration Map

```
Mode: Overview
├── Primary: Custom overview component
├── Enhancement: Preview cards for both viz types
├── Data Flow: Load sample datasets
└── Transition: Fade → Selected mode (0.4s)

Mode: Histograms
├── Stage 1: Introduction
│   ├── Primary: 4-2-1-HistogramIntuitiveIntro.jsx
│   └── Transition: Slide → Stage 2 (0.5s)
├── Stage 2: Journey
│   ├── Primary: 4-2-2-HistogramInteractiveJourney.jsx
│   └── Transition: Morph → Stage 3 (0.6s)
├── Stage 3: Shape Explorer
│   ├── Primary: 4-2-1-HistogramShapeExplorer.jsx
│   ├── Support: 4-2-3-HistogramShapeAnalysis.jsx
│   └── Transition: Fade → Complete (0.4s)

Mode: Boxplots
├── Stage 1: Explorer
│   ├── Primary: 4-6-1-BoxplotQuartilesExplorer.jsx
│   └── Transition: Slide → Stage 2 (0.5s)
├── Stage 2: Journey
│   ├── Primary: 4-6-1-BoxplotQuartilesJourney.jsx
│   └── Transition: Expand → Stage 3 (0.5s)
├── Stage 3: Real World
│   ├── Primary: 4-6-2-BoxplotRealWorldExplorer.jsx
│   └── Transition: Fade → Complete (0.4s)

Mode: Comparison
├── Primary: Split view with both viz types
├── Components: Selected from above based on dataset
└── Data Flow: Synchronized dataset across both views
```

## Implementation Structure

### Page Component
```jsx
export default function VisualSummariesPage() {
  // Unified state for all visualizations
  const [globalState, setGlobalState] = useState({
    mode: 'overview', // overview | histograms | boxplots | comparison
    dataset: {
      name: 'studentGrades',
      values: defaultDataset,
      statistics: null // Computed once, shared by all
    },
    visualizationSettings: {
      binCount: 10,
      showOutliers: true,
      colorScheme: 'purple',
      animationsEnabled: true
    },
    progress: {
      histogramStages: [],
      boxplotStages: [],
      conceptsLearned: []
    }
  });

  // Shared visualization engine
  const vizEngine = useVisualizationEngine(globalState.dataset);

  // Transform HistogramHub into mode selector
  const ModeSelector = useMemo(() => 
    transformHub(HistogramHub, ['overview', 'histograms', 'boxplots', 'comparison']),
    []
  );

  return (
    <VisualizationContainer className="visual-summaries-page">
      <BackToHub chapter={4} section="4.2" />
      
      {/* Mode Navigation */}
      <ModeSelector 
        currentMode={globalState.mode}
        onModeChange={(mode) => setGlobalState(prev => ({ ...prev, mode }))}
        completedModes={getCompletedModes(globalState.progress)}
      />
      
      {/* Main Visualization Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={globalState.mode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          {renderMode(globalState.mode)}
        </motion.div>
      </AnimatePresence>
      
      {/* Unified Controls */}
      <UnifiedControls 
        settings={globalState.visualizationSettings}
        onSettingsChange={updateVisualizationSettings}
        availableControls={getControlsForMode(globalState.mode)}
      />
    </VisualizationContainer>
  );
}
```

### Mode Implementations

#### Overview Mode
```jsx
const OverviewMode = ({ onSelectMode }) => (
  <div className="overview-container grid md:grid-cols-2 gap-6">
    <motion.div 
      className="histogram-preview"
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelectMode('histograms')}
    >
      <h3>Histograms</h3>
      <p>Reveal distribution shapes and patterns</p>
      <MiniHistogram data={sampleData} />
      <Button variant="outline">Explore Histograms →</Button>
    </motion.div>
    
    <motion.div 
      className="boxplot-preview"
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelectMode('boxplots')}
    >
      <h3>Boxplots</h3>
      <p>Compare groups and spot outliers</p>
      <MiniBoxplot data={sampleData} />
      <Button variant="outline">Explore Boxplots →</Button>
    </motion.div>
    
    <motion.div 
      className="comparison-preview md:col-span-2"
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelectMode('comparison')}
    >
      <h3>Compare Visualizations</h3>
      <p>See how different views reveal different insights</p>
      <Button variant="primary">Compare Side-by-Side →</Button>
    </motion.div>
  </div>
);
```

#### Histogram Mode
```jsx
const HistogramMode = ({ globalState, updateState }) => {
  const [stage, setStage] = useState('intro');
  
  const stages = {
    intro: HistogramIntuitiveIntro,
    journey: HistogramInteractiveJourney,
    explorer: HistogramShapeExplorer,
    analysis: HistogramShapeAnalysis
  };
  
  const CurrentStage = stages[stage];
  
  return (
    <div className="histogram-mode">
      <StageProgress 
        stages={Object.keys(stages)}
        current={stage}
        onNavigate={setStage}
      />
      
      <CurrentStage 
        dataset={globalState.dataset}
        settings={globalState.visualizationSettings}
        onDataChange={(data) => updateState({ dataset: { ...globalState.dataset, values: data }})}
        onComplete={() => advanceStage(stage, setStage)}
        sharedEngine={vizEngine}
      />
    </div>
  );
};
```

#### Comparison Mode
```jsx
const ComparisonMode = ({ globalState }) => {
  const [syncScrolling, setSyncScrolling] = useState(true);
  const [highlightFeature, setHighlightFeature] = useState(null);
  
  return (
    <div className="comparison-mode">
      <div className="comparison-header">
        <h2>Histogram vs Boxplot: Two Views, One Dataset</h2>
        <Toggle 
          label="Sync Interactions"
          checked={syncScrolling}
          onChange={setSyncScrolling}
        />
      </div>
      
      <div className="comparison-grid">
        <div className="histogram-panel">
          <h3>Distribution View</h3>
          <HistogramShapeExplorer 
            dataset={globalState.dataset}
            highlight={highlightFeature}
            compact={true}
          />
          <VisualizationInsights type="histogram" feature={highlightFeature} />
        </div>
        
        <div className="boxplot-panel">
          <h3>Summary View</h3>
          <BoxplotQuartilesExplorer 
            dataset={globalState.dataset}
            highlight={highlightFeature}
            compact={true}
          />
          <VisualizationInsights type="boxplot" feature={highlightFeature} />
        </div>
      </div>
      
      <FeatureSelector 
        features={['center', 'spread', 'skewness', 'outliers']}
        selected={highlightFeature}
        onChange={setHighlightFeature}
      />
    </div>
  );
};
```

## Technical Specifications

### Performance Requirements
- **Initial Load**: < 1s for mode selection
- **Component Switch**: < 500ms transition time
- **Visualization Render**: < 100ms for dataset updates
- **Memory**: Max 3 components loaded simultaneously

### State Management Architecture
```javascript
const stateArchitecture = {
  global: {
    dataset: {
      values: [],
      statistics: {}, // Computed once, cached
      metadata: {}
    },
    visualizationSettings: {
      // Shared across all viz types
      binCount: 10,
      showOutliers: true,
      colorScheme: 'purple'
    },
    mode: 'overview',
    progress: {}
  },
  computed: {
    // Memoized calculations
    histogram: {
      bins: [],
      frequencies: []
    },
    boxplot: {
      quartiles: {},
      outliers: [],
      whiskers: {}
    }
  },
  persistence: {
    localStorage: ['progress', 'visualizationSettings'],
    sessionStorage: ['currentDataset', 'mode']
  }
};
```

### Data Flow Specification
```javascript
const dataFlow = {
  datasetChange: {
    trigger: 'user selection or upload',
    flow: [
      'Update global dataset',
      'Recompute statistics (once)',
      'Update all active visualizations',
      'Cache computed values'
    ]
  },
  settingsChange: {
    trigger: 'control panel interaction',
    flow: [
      'Update specific setting',
      'Recompute affected visualizations',
      'Animate transitions'
    ]
  },
  modeSwitch: {
    trigger: 'mode selector click',
    flow: [
      'Save current progress',
      'Transition animation',
      'Load new components',
      'Restore relevant state'
    ]
  }
};
```

### Animation Coordination
```javascript
const animationConfig = {
  modeTransitions: {
    duration: 400,
    easing: 'easeInOut',
    scale: { from: 0.95, to: 1 }
  },
  dataUpdates: {
    histogram: {
      bars: { duration: 300, stagger: 20 },
      axis: { duration: 200 }
    },
    boxplot: {
      box: { duration: 400 },
      whiskers: { duration: 300, delay: 100 },
      outliers: { duration: 200, stagger: 30 }
    }
  },
  synchronized: {
    // For comparison mode
    duration: 500,
    stagger: 0 // Update both simultaneously
  }
};
```

## Layout Structure
```
┌─────────────────────────────────────────────┐
│ ← Back to Hub          Section 4.2         │
├─────────────────────────────────────────────┤
│ Mode: [Overview] [Histograms] [Boxplots]   │
│       [Comparison]                          │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │         Active Visualization(s)         │ │
│ │                                         │ │
│ │  (Single or split view based on mode)  │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Controls: Bins [====] Outliers [✓]         │
│          Dataset [Select ▼]                 │
└─────────────────────────────────────────────┘
```

## Unified Visualization Engine
```javascript
class VisualizationEngine {
  constructor(dataset) {
    this.dataset = dataset;
    this.cache = new Map();
  }
  
  // Shared calculations
  computeStatistics() {
    if (this.cache.has('statistics')) {
      return this.cache.get('statistics');
    }
    
    const stats = {
      mean: d3.mean(this.dataset),
      median: d3.median(this.dataset),
      quartiles: this.computeQuartiles(),
      outliers: this.detectOutliers(),
      skewness: this.computeSkewness()
    };
    
    this.cache.set('statistics', stats);
    return stats;
  }
  
  // Shared scales
  getScales(width, height) {
    return {
      x: d3.scaleLinear()
        .domain(d3.extent(this.dataset))
        .range([0, width]),
      y: d3.scaleLinear()
        .domain([0, d3.max(this.frequencies)])
        .range([height, 0])
    };
  }
}
```

## Component Lifecycle Management
```javascript
const lifecycleManagement = {
  onModeEnter: (mode) => {
    // Preload required components
    const components = getComponentsForMode(mode);
    components.forEach(comp => import(comp));
    
    // Initialize mode-specific state
    initializeModeState(mode);
  },
  
  onModeExit: (mode) => {
    // Save progress
    saveProgress(mode, getCurrentProgress());
    
    // Cleanup unused resources
    cleanupVisualizationCache(mode);
  },
  
  onDatasetChange: () => {
    // Invalidate cache
    vizEngine.cache.clear();
    
    // Recompute all active visualizations
    updateAllVisualizations();
  }
};
```

## Fallback Strategies
```javascript
const fallbacks = {
  largeDataset: {
    threshold: 10000,
    strategy: 'sample and indicate sampling',
    implementation: 'Show warning, use reservoir sampling'
  },
  
  slowDevice: {
    detection: 'fps < 30 during animations',
    strategy: 'disable animations, simplify visualizations',
    implementation: 'CSS transforms only, no D3 transitions'
  },
  
  componentError: {
    strategy: 'show simplified version',
    implementation: 'Basic canvas rendering as fallback'
  }
};
```

## Success Metrics
- ✓ All 8 components integrated seamlessly
- ✓ < 100ms visualization updates
- ✓ Smooth mode transitions (60fps)
- ✓ Synchronized comparison mode working
- ✓ Unified controls affect all views
- ✓ Mobile responsive with touch support
- ✓ Accessibility: keyboard navigation + screen reader
- ✓ Performance: handles 10k+ data points

## Reference Implementations
- Observable's multi-view data visualizations
- Chapter 3's distribution comparison tools
- D3 Gallery synchronized visualizations
- Tableau's linked visualization approach