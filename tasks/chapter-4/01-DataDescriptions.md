# Plan: 4.1 - Data Descriptions

## Component Orchestration Mandate

**CRITICAL: Component Integration Best Practices**
- Seamlessly integrate 5 existing central tendency components
- Maintain individual component functionality while adding cohesive flow
- Implement shared state management across all components
- Use React.lazy() for performance optimization

**Gold Standard Integration Examples:**
- Chapter 6 section pages with multiple components
- Chapter 7's approach to component orchestration
- Reference successful multi-component implementations

**Guiding Philosophy:** Transform isolated components into a unified learning journey that builds understanding progressively while preserving each component's unique strengths.

**Core Orchestration Principles:**
1. **Component Autonomy**: Each component maintains its internal logic
2. **Shared Context**: Global state provides continuity between components
3. **Progressive Complexity**: Start simple, build to mathematical depth
4. **Performance Optimization**: Lazy load and unmount unused components
5. **Seamless Transitions**: Smooth visual and conceptual flow

## Component File
`/src/app/chapter4/data-descriptions/page.jsx`

## Course Content Coverage
From MAT 2377 Chapter 4.1:
- Numerical Summaries (p.5)
- Sample Median (p.6)  
- Sample Mean (p.8)
- Quartiles (p.13)
- Outliers (p.17)
- Standard Deviation (p.16)

## Components to Integrate (5 Total)

1. **4-1-0-CentralTendencyHub.jsx** - Transform into progress navigator
2. **4-1-1-CentralTendencyIntro.jsx** - Opening introduction
3. **4-1-2-DescriptiveStatsJourney.jsx** - Main interactive journey
4. **4-1-3-DescriptiveStatisticsFoundations.jsx** - Quartiles and variance
5. **4-1-4-MathematicalFoundations.jsx** - Proofs and theory

## Component Integration Map

```
Stage 1: Introduction
├── Primary: 4-1-1-CentralTendencyIntro.jsx
├── Enhancement: Custom welcome content
├── Data Flow: Initialize shared dataset
└── Transition: Fade → Stage 2 (duration: 0.5s)

Stage 2: Interactive Journey
├── Primary: 4-1-2-DescriptiveStatsJourney.jsx
├── Enhancement: Progress tracking overlay
├── Data Flow: Pass dataset, collect calculations
└── Transition: Slide → Stage 3 (duration: 0.6s)

Stage 3: Statistical Foundations
├── Primary: 4-1-3-DescriptiveStatisticsFoundations.jsx
├── Enhancement: Topic selector wrapper
├── Data Flow: Use previous calculations, add quartiles
└── Transition: Expand → Stage 4 (duration: 0.5s)

Stage 4: Mathematical Depth
├── Primary: 4-1-4-MathematicalFoundations.jsx
├── Enhancement: Proof navigator
├── Data Flow: Reference all previous results
└── Transition: Fade → Stage 5 (duration: 0.4s)

Stage 5: Practice & Application
├── Primary: Custom practice component
├── Components: Features from all previous stages
├── Data Flow: Comprehensive state access
└── Transition: Complete → Summary
```

## Implementation Structure

### Page Component
```jsx
export default function DataDescriptionsPage() {
  // Global state management
  const [globalState, setGlobalState] = useState({
    currentStage: 'introduction',
    completedStages: [],
    dataset: {
      name: 'studentGrades',
      values: defaultDataset,
      source: 'preloaded'
    },
    calculations: {
      mean: null,
      median: null,
      mode: null,
      quartiles: { Q1: null, Q2: null, Q3: null },
      variance: null,
      stdDev: null,
      outliers: []
    },
    userProgress: {
      conceptsMastered: [],
      exercisesCompleted: 0,
      timeSpent: 0,
      accuracy: null
    }
  });

  // Component lazy loading
  const CentralTendencyIntro = lazy(() => 
    import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyIntro')
  );
  // ... other lazy imports

  // Navigation logic
  const navigateToStage = (stage) => {
    setGlobalState(prev => ({
      ...prev,
      currentStage: stage,
      completedStages: [...new Set([...prev.completedStages, prev.currentStage])]
    }));
  };

  return (
    <VisualizationContainer className="data-descriptions-page">
      <BackToHub chapter={4} section="4.1" />
      
      {/* Progress Navigator (transformed CentralTendencyHub) */}
      <StageNavigator 
        stages={stages}
        current={globalState.currentStage}
        completed={globalState.completedStages}
        onNavigate={navigateToStage}
      />
      
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          {renderCurrentStage()}
        </Suspense>
      </AnimatePresence>
      
      {/* Persistent Elements */}
      <DatasetPanel 
        dataset={globalState.dataset}
        calculations={globalState.calculations}
        minimized={globalState.currentStage === 'introduction'}
      />
    </VisualizationContainer>
  );
}
```

### Stage Implementations

#### Stage 1: Introduction (10 min)
```jsx
const IntroductionStage = ({ globalState, onComplete }) => {
  const [interactionComplete, setInteractionComplete] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="introduction-stage"
    >
      <CentralTendencyIntro 
        onComplete={() => setInteractionComplete(true)}
        initialDataset={globalState.dataset.values}
      />
      
      {/* Extended introduction content */}
      <div className="mt-8 space-y-6">
        <RealWorldExamples />
        <WhyDescriptiveStats />
        
        {interactionComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="next-steps"
          >
            <h3>Ready to explore your data?</h3>
            <Button 
              onClick={() => onComplete('journey')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Learning Journey →
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
```

#### Stage 2: Interactive Learning Journey (20 min)
```jsx
const LearningJourneyStage = ({ globalState, updateGlobalState, onComplete }) => {
  const [journeyProgress, setJourneyProgress] = useState({
    currentConcept: 'mean',
    completedConcepts: [],
    conceptData: {}
  });
  
  const handleConceptComplete = (concept, data) => {
    // Update local journey progress
    setJourneyProgress(prev => ({
      ...prev,
      completedConcepts: [...prev.completedConcepts, concept],
      conceptData: { ...prev.conceptData, [concept]: data }
    }));
    
    // Update global calculations
    updateGlobalState({
      calculations: {
        ...globalState.calculations,
        [concept]: data.value
      },
      userProgress: {
        ...globalState.userProgress,
        conceptsMastered: [...globalState.userProgress.conceptsMastered, concept]
      }
    });
  };
  
  return (
    <motion.div className="journey-stage">
      <h2>Your Statistical Journey</h2>
      
      <ConceptProgress 
        concepts={['mean', 'median', 'mode', 'range', 'quartiles']}
        completed={journeyProgress.completedConcepts}
      />
      
      <DescriptiveStatsJourney 
        startingConcept={journeyProgress.currentConcept}
        dataset={globalState.dataset.values}
        onConceptComplete={handleConceptComplete}
        previousCalculations={globalState.calculations}
        enhancedMode={true}
      />
      
      <PracticeProblems 
        concept={journeyProgress.currentConcept}
        difficulty="adaptive"
      />
      
      {journeyProgress.completedConcepts.length >= 5 && (
        <CompleteButton onClick={() => onComplete('foundations')} />
      )}
    </motion.div>
  );
};
```

## Technical Specifications

### Performance Requirements
- **Component Load Time**: < 500ms per component
- **Transition Duration**: 400-600ms between stages
- **Memory Management**: Max 2 components in memory
- **State Updates**: Debounced at 100ms

### State Management Architecture
```javascript
const stateArchitecture = {
  global: {
    // Shared across all stages
    dataset: { values: [], metadata: {} },
    calculations: { /* all statistical results */ },
    progress: { /* learning progress tracking */ }
  },
  local: {
    // Per-component state
    introduction: { animationComplete: false },
    journey: { currentConcept: 'mean', journeyPath: [] },
    foundations: { selectedTopic: 'quartiles' },
    mathematical: { selectedProof: null }
  },
  persistence: {
    localStorage: ['progress', 'completedStages', 'calculations'],
    sessionStorage: ['currentDataset', 'currentStage']
  }
};
```

### Data Flow Specification
```javascript
const dataFlow = {
  stage1to2: {
    pass: ['dataset', 'userPreferences'],
    receive: ['interactionComplete'],
    method: 'props + callback'
  },
  stage2to3: {
    pass: ['calculations.mean', 'calculations.median', 'calculations.mode'],
    receive: ['quartiles', 'outliers'],
    method: 'globalState'
  },
  stage3to4: {
    pass: ['allCalculations', 'conceptsMastered'],
    receive: ['proofsViewed'],
    method: 'globalState'
  },
  persistence: {
    onStageComplete: 'save to localStorage',
    onMount: 'restore from localStorage',
    onUnmount: 'cleanup sessionStorage'
  }
};
```

### Animation Coordination
```javascript
const transitionConfig = {
  stageTransitions: {
    introduction: { exit: 'fadeUp', duration: 500 },
    journey: { enter: 'slideRight', exit: 'slideLeft', duration: 600 },
    foundations: { enter: 'expand', duration: 500 },
    mathematical: { enter: 'fade', duration: 400 }
  },
  componentTransitions: {
    withinStage: { duration: 300, ease: 'easeInOut' },
    dataUpdate: { duration: 200, ease: 'easeOut' }
  }
};
```

## Layout Structure
```
┌─────────────────────────────────────────────┐
│ ← Back to Hub          Section 4.1         │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Progress: [■■■□□] Stage 3 of 5         │ │
│ │ Intro | Journey | Found. | Math | Prac.│ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌───────────────────┬─────────────────────┐ │
│ │                   │ Dataset Panel       │ │
│ │  Active Component │ Mean: 74.5          │ │
│ │      Area         │ Median: 72          │ │
│ │                   │ [Minimize]          │ │
│ └───────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────┤
│ Navigation: [← Previous] [Next →]           │
└─────────────────────────────────────────────┘
```

## Component Lifecycle Management
```javascript
const lifecycleHooks = {
  onComponentMount: (componentName) => {
    analytics.track('component_viewed', { component: componentName });
    performance.mark(`${componentName}_start`);
  },
  
  onComponentUnmount: (componentName) => {
    performance.mark(`${componentName}_end`);
    performance.measure(componentName, `${componentName}_start`, `${componentName}_end`);
    // Cleanup heavy resources
  },
  
  onStageTransition: (from, to) => {
    // Save progress
    saveToLocalStorage(globalState);
    // Preload next component
    if (nextComponent[to]) {
      import(nextComponent[to]);
    }
  }
};
```

## Fallback Strategies
```javascript
const fallbacks = {
  componentLoadError: {
    strategy: 'show cached version or simplified alternative',
    implementation: ErrorBoundary with fallback UI
  },
  stateCorruption: {
    strategy: 'reset to last known good state',
    implementation: stateValidator with recovery
  },
  performanceIssue: {
    strategy: 'disable animations, simplify visualizations',
    implementation: performanceMonitor with degradation
  }
};
```

## Success Metrics
- ✓ All 5 components successfully integrated
- ✓ Smooth transitions between stages (< 600ms)
- ✓ State persists correctly across sessions
- ✓ No memory leaks during component switches
- ✓ Load time < 2s for initial page
- ✓ 60fps animations throughout
- ✓ Mobile responsive at all breakpoints
- ✓ Accessibility score > 95

## Reference Implementations
- Multi-component orchestration in Chapter 3
- State management patterns from Chapter 6
- Transition strategies from Chapter 7
- Performance optimization from landing page