# Plan: 4.5 - Sampling Distributions (Reprise)

## Component Orchestration Mandate

**CRITICAL: Component Integration Best Practices**
- Orchestrate 8 components (1 t-dist + 7 F-dist) into coherent learning experience
- Create multiple learning paths for F-distribution mastery
- Build from "unknown σ" problem to practical statistical inference
- Maintain component autonomy while creating unified narrative

**Gold Standard Integration Examples:**
- Chapter 3's multi-path distribution explorers
- Chapter 6's comprehensive test procedures
- Reference successful multi-component orchestrations

**Guiding Philosophy:** Transform the challenge of unknown parameters into an empowering journey through t and F distributions, offering multiple paths to mastery while maintaining coherence across all 8 components.

**Core Orchestration Principles:**
1. **Problem-First Approach**: Start with why these distributions matter
2. **Multi-Path Learning**: Different routes for different learning styles
3. **Component Synergy**: Each component builds on previous understanding
4. **Practical Focus**: Emphasize real-world applications throughout
5. **Mastery Tracking**: Clear progression through complex content

## Component File
`/src/app/chapter4/sampling-distributions-reprise/page.jsx`

## Course Content Coverage
From MAT 2377 Chapter 4.5:
- Difference Between 2 Means (p.49)
- Sample Variance S² (p.51)
- Sample Mean With Unknown Population Variance (p.54) - t-distribution
- F-Distribution (p.60)

## Components to Integrate (8 Total)

### T-Distribution Component (1)
1. **4-4-1-TDistributionExplorer.jsx**

### F-Distribution Components (7)
2. **4-5-1-FDistributionIntuitiveIntro.jsx**
3. **4-5-1-FDistributionExplorer.jsx**
4. **4-5-2-FDistributionInteractiveJourney.jsx**
5. **4-5-2-FDistributionWorkedExample.jsx**
6. **4-5-3-FDistributionMasterclass.jsx**
7. **4-5-3-FDistributionMastery.jsx**
8. **4-5-4-FDistributionJourney.jsx**

## Component Integration Map

```
Topic 1: Overview
├── Primary: Custom introduction component
├── Enhancement: Problem motivation
├── Data Flow: Set context for all distributions
└── Transition: Fade → Topic 2 (0.5s)

Topic 2: Sample Variance
├── Primary: Custom variance explorer
├── Enhancement: Interactive calculations
├── Data Flow: Generate variance examples
└── Transition: Slide → Topic 3 (0.6s)

Topic 3: t-Distribution
├── Primary: 4-4-1-TDistributionExplorer.jsx
├── Enhancement: Multi-mode interface
├── Data Flow: Connect to sample variance
└── Transition: Morph → Topic 4 (0.5s)

Topic 4: F-Distribution (Multi-Path)
├── Path 1: Intuitive (2 components)
│   ├── 4-5-1-FDistributionIntuitiveIntro.jsx
│   └── 4-5-1-FDistributionExplorer.jsx
├── Path 2: Journey (3 components)
│   ├── 4-5-2-FDistributionInteractiveJourney.jsx
│   ├── 4-5-4-FDistributionJourney.jsx
│   └── 4-5-2-FDistributionWorkedExample.jsx
├── Path 3: Mastery (2 components)
│   ├── 4-5-3-FDistributionMasterclass.jsx
│   └── 4-5-3-FDistributionMastery.jsx
└── Transition: Path-specific → Topic 5

Topic 5: Synthesis
├── Primary: Distribution comparison tool
├── Enhancement: Decision tree interface
└── Data Flow: Reference all distributions
```

## Implementation Structure

### Page Component
```jsx
export default function SamplingDistributionsReprisePage() {
  const [currentTopic, setCurrentTopic] = useState('overview');
  const [distributionFocus, setDistributionFocus] = useState(null);
  const [masteryProgress, setMasteryProgress] = useState({
    tDistribution: 0,
    fDistribution: 0,
    applications: 0
  });
  
  const topics = {
    overview: 'When σ is Unknown',
    variance: 'Sample Variance S²',
    tDistribution: 't-Distribution',
    fDistribution: 'F-Distribution',
    comparison: 'Comparing Distributions',
    applications: 'Real-World Applications'
  };
  
  return (
    <VisualizationContainer className="reprise-page">
      <BackToHub chapter={4} />
      
      <div className="reprise-header">
        <h1>Advanced Sampling Distributions</h1>
        <p>When population parameters are unknown</p>
      </div>
      
      <TopicNavigator 
        topics={topics}
        current={currentTopic}
        onChange={setCurrentTopic}
        progress={masteryProgress}
      />
      
      <AnimatePresence mode="wait">
        {renderCurrentTopic()}
      </AnimatePresence>
      
      <MasteryDashboard 
        progress={masteryProgress}
        onViewDetails={showMasteryDetails}
      />
    </VisualizationContainer>
  );
}
```

### Topic 1: Overview - When σ is Unknown (5 min)
**Introduction to the problem**

```jsx
const OverviewSection = () => (
  <div className="overview-container">
    <ProblemStatement>
      <h2>The Real-World Challenge</h2>
      <p>In practice, we rarely know the population standard deviation σ</p>
      
      <div className="comparison-grid">
        <div className="known-variance">
          <h3>What We Learned (σ known)</h3>
          <MathDisplay>{`Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)`}</MathDisplay>
        </div>
        
        <div className="unknown-variance">
          <h3>What We Need (σ unknown)</h3>
          <MathDisplay>{`T = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t(n-1)`}</MathDisplay>
        </div>
      </div>
    </ProblemStatement>
    
    <SolutionPreview>
      <h3>New Distributions for Unknown Parameters</h3>
      <DistributionCard 
        name="t-Distribution"
        use="One sample, unknown σ"
        preview={<MiniTDistribution />}
      />
      <DistributionCard 
        name="F-Distribution"
        use="Comparing variances"
        preview={<MiniFDistribution />}
      />
    </SolutionPreview>
  </div>
);
```

### Topic 2: Sample Variance S² (10 min)
**Foundation for t and F distributions**

```jsx
const SampleVarianceSection = () => {
  const [showDerivation, setShowDerivation] = useState(false);
  
  return (
    <div className="sample-variance-container">
      <h2>Understanding Sample Variance</h2>
      
      <VarianceCalculator>
        <Formula>
          <MathDisplay>{`S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(X_i - \\bar{X})^2`}</MathDisplay>
        </Formula>
        
        <InteractiveCalculation 
          dataset={sampleData}
          showSteps={true}
          highlightDifferences={true}
        />
      </VarianceCalculator>
      
      <WhyNMinus1>
        <h3>Why divide by n-1?</h3>
        <Toggle onClick={() => setShowDerivation(!showDerivation)}>
          {showDerivation ? 'Hide' : 'Show'} Mathematical Explanation
        </Toggle>
        
        {showDerivation && <BesselsCorrectionProof />}
        
        <IntuititveExplanation>
          Using X̄ instead of μ "uses up" one degree of freedom
        </IntuititveExplanation>
      </WhyNMinus1>
      
      <ChiSquaredConnection>
        <h3>Connection to χ² Distribution</h3>
        <MathDisplay>{`\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)`}</MathDisplay>
        <VisualDemo />
      </ChiSquaredConnection>
    </div>
  );
};
```

### Topic 3: t-Distribution Deep Dive (15 min)
**Using the single t-distribution component extensively**

```jsx
const TDistributionSection = () => {
  const [mode, setMode] = useState('explore');
  
  return (
    <div className="t-distribution-section">
      <ModeSelector 
        modes={['explore', 'theory', 'comparison', 'application']}
        current={mode}
        onChange={setMode}
      />
      
      {mode === 'explore' && (
        <div className="explore-mode">
          <h2>t-Distribution Explorer</h2>
          
          {/* Main component */}
          <TDistributionExplorer 
            enhanced={true}
            showFormula={true}
            showComparison={true}
          />
          
          {/* Additional exploration features */}
          <DegreesOfFreedomExplorer>
            <h3>Effect of Degrees of Freedom</h3>
            <DFSlider min={1} max={100} />
            <Observations>
              <li>df = 1: Very heavy tails (Cauchy)</li>
              <li>df = 30: Close to normal</li>
              <li>df → ∞: Becomes standard normal</li>
            </Observations>
          </DegreesOfFreedomExplorer>
        </div>
      )}
      
      {mode === 'theory' && (
        <div className="theory-mode">
          <h2>Mathematical Foundation</h2>
          
          <Definition>
            If Z ~ N(0,1) and V ~ χ²(ν) are independent:
            <MathDisplay>{`T = \\frac{Z}{\\sqrt{V/\\nu}} \\sim t(\\nu)`}</MathDisplay>
          </Definition>
          
          <Derivation>
            <Step1>Start with standardized sample mean</Step1>
            <Step2>Replace σ with S</Step2>
            <Step3>Show resulting distribution</Step3>
          </Derivation>
          
          <Properties>
            <Property name="Mean">E[T] = 0 (for ν > 1)</Property>
            <Property name="Variance">Var[T] = ν/(ν-2) (for ν > 2)</Property>
            <Property name="Symmetry">Symmetric around 0</Property>
          </Properties>
        </div>
      )}
      
      {mode === 'application' && (
        <div className="application-mode">
          <h2>Using the t-Distribution</h2>
          
          <ApplicationScenario 
            title="Small Sample Inference"
            scenario="Testing drug efficacy with n=12 patients"
          >
            <ProblemSetup />
            <StepByStepSolution />
            <TCalculator />
          </ApplicationScenario>
          
          <CriticalValueTable df={[5, 10, 20, 30]} />
        </div>
      )}
    </div>
  );
};
```

### Topic 4: F-Distribution Comprehensive (25 min)
**Utilizing all 7 F-distribution components**

```jsx
const FDistributionSection = () => {
  const [learningPath, setLearningPath] = useState('intuitive');
  const [currentComponent, setCurrentComponent] = useState(0);
  
  const paths = {
    intuitive: {
      name: 'Intuitive Path',
      components: [
        { component: FDistributionIntuitiveIntro, duration: 5 },
        { component: FDistributionExplorer, duration: 10 }
      ]
    },
    journey: {
      name: 'Guided Journey',
      components: [
        { component: FDistributionInteractiveJourney, duration: 10 },
        { component: FDistributionJourney, duration: 10 },
        { component: FDistributionWorkedExample, duration: 5 }
      ]
    },
    mastery: {
      name: 'Mastery Path',
      components: [
        { component: FDistributionMasterclass, duration: 15 },
        { component: FDistributionMastery, duration: 10 }
      ]
    }
  };
  
  return (
    <div className="f-distribution-section">
      <PathSelector 
        paths={paths}
        current={learningPath}
        onChange={(path) => {
          setLearningPath(path);
          setCurrentComponent(0);
        }}
      />
      
      <ComponentRenderer 
        component={paths[learningPath].components[currentComponent].component}
        onComplete={() => {
          if (currentComponent < paths[learningPath].components.length - 1) {
            setCurrentComponent(currentComponent + 1);
          } else {
            markPathComplete(learningPath);
          }
        }}
        enhancedProps={{
          showConnections: true,
          unifiedTheme: true
        }}
      />
      
      {/* Path-specific enhancements */}
      {learningPath === 'intuitive' && (
        <IntuitiveEnhancements>
          <ConceptConnection 
            from="Ratio of variances"
            to="F-distribution shape"
          />
          <VisualIntuition />
        </IntuitiveEnhancements>
      )}
      
      {learningPath === 'journey' && (
        <JourneySupport>
          <ProgressTracker 
            steps={paths.journey.components}
            current={currentComponent}
          />
          <HintSystem active={true} />
        </JourneySupport>
      )}
      
      {learningPath === 'mastery' && (
        <MasteryFeatures>
          <ChallengeMode />
          <LeaderBoard />
          <Achievements unlocked={getUnlockedAchievements()} />
        </MasteryFeatures>
      )}
    </div>
  );
};
```

### Topic 5: Distribution Comparison (10 min)
**Synthesizing understanding**

```jsx
const DistributionComparison = () => {
  const [scenario, setScenario] = useState('oneample');
  
  return (
    <div className="comparison-container">
      <h2>Choosing the Right Distribution</h2>
      
      <DecisionTree>
        <Question>What are you testing?</Question>
        
        <Branch condition="One sample mean">
          <Question>Is σ known?</Question>
          <Branch condition="Yes">Use Z ~ N(0,1)</Branch>
          <Branch condition="No">Use t ~ t(n-1)</Branch>
        </Branch>
        
        <Branch condition="Two sample means">
          <Question>Are variances equal?</Question>
          <Branch condition="Yes">Use pooled t-test</Branch>
          <Branch condition="No">Use Welch's t-test</Branch>
        </Branch>
        
        <Branch condition="Variances">
          <Branch>Use F ~ F(ν₁, ν₂)</Branch>
        </Branch>
      </DecisionTree>
      
      <InteractiveComparison>
        <DistributionSelector 
          options={['Z', 't(5)', 't(30)', 'F(5,10)', 'χ²(10)']}
          max={2}
        />
        
        <ComparisonPlot 
          distributions={selectedDistributions}
          features={['pdf', 'tails', 'critical-values']}
        />
        
        <KeyDifferences />
      </InteractiveComparison>
    </div>
  );
};
```

### Topic 6: Real-World Applications (10 min)
**Practical problem solving**

```jsx
const ApplicationsSection = () => {
  const [problem, setProblem] = useState('quality');
  
  const problems = {
    quality: {
      title: 'Quality Control',
      description: 'Testing if machine variance has increased',
      distribution: 'F'
    },
    medical: {
      title: 'Clinical Trial',
      description: 'Comparing treatment means with small samples',
      distribution: 't'
    },
    education: {
      title: 'Test Score Analysis',
      description: 'Comparing variances between teaching methods',
      distribution: 'F'
    }
  };
  
  return (
    <div className="applications-container">
      <ProblemSelector 
        problems={problems}
        current={problem}
        onChange={setProblem}
      />
      
      <ProblemSolver problem={problems[problem]}>
        <DataPresentation />
        <HypothesisSetup />
        <CalculationSteps />
        <InterpretationGuide />
        <DecisionMaking />
      </ProblemSolver>
      
      <PracticeGenerator 
        type={problems[problem].distribution}
        difficulty="adaptive"
      />
    </div>
  );
};
```

## Unified Features

### Distribution Reference System
```javascript
const DistributionReference = {
  t: {
    when: "One sample, σ unknown",
    formula: "T = (X̄ - μ)/(S/√n)",
    df: "n - 1",
    shape: "Heavier tails than normal"
  },
  F: {
    when: "Comparing two variances",
    formula: "F = S₁²/S₂²",
    df: "(n₁-1, n₂-1)",
    shape: "Right-skewed"
  },
  connections: {
    "t² with df=1": "F(1,ν)",
    "F(ν,∞)": "χ²(ν)/ν"
  }
};
```

### Progressive Mastery System
```javascript
const MasterySystem = {
  checkpoints: [
    { id: 'variance', required: true },
    { id: 't-basics', required: true },
    { id: 't-application', required: true },
    { id: 'f-intro', required: true },
    { id: 'f-journey', required: false },
    { id: 'f-mastery', required: false },
    { id: 'comparison', required: true }
  ],
  
  calculateProgress: (completed) => {
    const required = checkpoints.filter(c => c.required);
    const requiredComplete = required.filter(c => completed.includes(c.id));
    return requiredComplete.length / required.length;
  }
};
```

## Technical Specifications

### Performance Requirements
- **Initial Load**: < 1s for topic navigation
- **Component Switch**: < 400ms within paths
- **Path Loading**: Lazy load inactive paths
- **Memory**: Max 3 F-distribution components loaded

### State Management Architecture
```javascript
const stateArchitecture = {
  global: {
    currentTopic: 'overview',
    selectedPath: null, // for F-distribution
    masteryProgress: {
      variance: 0,
      tDistribution: 0,
      fDistribution: {
        intuitive: 0,
        journey: 0,
        mastery: 0
      },
      synthesis: 0
    },
    sharedData: {
      sampleVariances: [],
      distributionComparisons: [],
      practiceResults: {}
    }
  },
  pathSpecific: {
    intuitive: { introComplete: false, explorerProgress: {} },
    journey: { currentStep: 0, hintsUsed: 0 },
    mastery: { challengesComplete: [], achievements: [] }
  },
  persistence: {
    localStorage: ['masteryProgress', 'selectedPath'],
    sessionStorage: ['sharedData', 'currentTopic']
  }
};
```

### Data Flow Specification
```javascript
const dataFlow = {
  topicProgression: {
    flow: [
      'Overview introduces problem',
      'Variance section generates S² examples',
      't-distribution uses variance data',
      'F-distribution builds on both',
      'Synthesis references all learning'
    ]
  },
  fDistributionPaths: {
    intuitive: [
      'Visual introduction',
      'Interactive exploration'
    ],
    journey: [
      'Structured progression',
      'Guided examples',
      'Worked problems'
    ],
    mastery: [
      'Advanced challenges',
      'Comprehensive testing'
    ]
  },
  pathSwitching: {
    allowed: true,
    preserveProgress: true,
    recommendedOrder: 'intuitive → journey → mastery'
  }
};
```

### Animation Coordination
```javascript
const animationConfig = {
  topicTransitions: {
    duration: 500,
    type: 'slide',
    direction: 'horizontal'
  },
  pathSelection: {
    duration: 600,
    effect: 'split-screen',
    stagger: 100
  },
  componentSequence: {
    withinPath: {
      duration: 400,
      type: 'fade-slide'
    },
    betweenComponents: {
      delay: 200,
      transition: 'smooth'
    }
  }
};
```

## Layout Structure
```
┌─────────────────────────────────────────────┐
│ ← Back to Hub          Section 4.5         │
├─────────────────────────────────────────────┤
│ Advanced Sampling Distributions             │
│ "When population parameters are unknown"    │
├─────────────────────────────────────────────┤
│ Topics: [Overview] [S²] [t-dist] [F-dist]  │
│         [Compare] [Apply]                   │
├─────────────────────────────────────────────┤
│ ┌───────────────────┬─────────────────────┐ │
│ │                   │ Progress Dashboard  │ │
│ │  Active Topic     │ t-dist: ■■■□ 75%   │ │
│ │   Component(s)    │ F-dist: ■■□□ 50%   │ │
│ │                   │ [View Details]      │ │
│ └───────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────┤
│ F-Distribution Path: [Intuitive] [Journey]  │
│                     [Mastery]               │
└─────────────────────────────────────────────┘
```

## Component Lifecycle Management
```javascript
const lifecycleHooks = {
  onTopicEnter: (topic) => {
    // Preload relevant components
    if (topic === 'fDistribution') {
      // Show path selector first
      showPathSelector();
    }
    
    // Initialize topic-specific data
    initializeTopicState(topic);
  },
  
  onPathSelect: (path) => {
    // Load path components
    const components = getPathComponents(path);
    components.forEach((comp, idx) => {
      if (idx === 0) import(comp); // Load first immediately
      else setTimeout(() => import(comp), idx * 100); // Stagger others
    });
    
    // Track path selection
    analytics.track('f_distribution_path_selected', { path });
  },
  
  onComponentComplete: (component, path) => {
    // Update progress
    updatePathProgress(path, component);
    
    // Check if path complete
    if (isPathComplete(path)) {
      celebratePathCompletion(path);
      suggestNextPath();
    }
  }
};
```

## Fallback Strategies
```javascript
const fallbacks = {
  componentLoadError: {
    strategy: 'Show simplified version',
    implementation: 'Basic distribution viewer fallback'
  },
  
  pathOverload: {
    detection: 'User jumping between paths rapidly',
    strategy: 'Suggest focusing on one path',
    implementation: 'Gentle guidance modal'
  },
  
  complexityOverwhelm: {
    detection: 'Low progress after 10 minutes',
    strategy: 'Recommend simpler path',
    implementation: 'Adaptive difficulty system'
  }
};
```

## Success Metrics
- ✓ All 8 components meaningfully integrated
- ✓ Clear progression from problem to solution
- ✓ 3 distinct F-distribution learning paths working
- ✓ Path switching preserves progress
- ✓ < 500ms topic transitions
- ✓ Practical applications emphasized throughout
- ✓ Synthesis connects all distributions
- ✓ Mobile responsive with path selector
- ✓ 80%+ completion rate for chosen paths

## Reference Implementations
- Chapter 3's multi-path distribution learning
- Chapter 7's comprehensive section orchestration
- Online course platforms with learning paths
- Adaptive learning systems for complex topics