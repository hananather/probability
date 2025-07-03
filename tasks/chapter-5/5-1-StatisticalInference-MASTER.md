# ENHANCED MASTER Plan: 5.1 - Statistical Inference

## Component Development Mandate

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery**
Our goal is to create a learning experience that is as aesthetically beautiful and intellectually satisfying as it is mathematically rigorous. We are building the world's best interactive textbook, inspired by the clarity and elegance of platforms like `brilliant.org`. The priority is **optimal teaching**, not gamification.

**Core Mandates:**
1. **Pedagogy First, Interaction Second:** The primary goal is to teach. Interactions must be purposeful, low-bug, and directly serve to build intuition. Prefer curated animations and controlled interactions over complex, bug-prone drag-and-drop interfaces.
2. **Aesthetic Excellence & Brand Consistency:**
   - **Internal Consistency is Key:** Follow the visual language established in Chapters 6-7
   - **Typography & Layout:** Use `font-mono` for numbers, maintain clear visual hierarchies, ensure layouts are clean and uncluttered
3. **Mathematical & Technical Rigor:**
   - **Content:** Align with MAT 2377 Chapter 5 (pages 2-7) (course-materials/content/chapter-05-statistical-inference.md)
   - **LaTeX:** Strictly follow `/docs/latex-guide.md` best practices - ALL LaTeX must use `dangerouslySetInnerHTML`
4. **Reference Gold Standards:**
   - **Component Structure:** `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
   - **UI/UX:** `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
   - **Animations:** `/src/components/landing/components/FloatingSymbols.jsx`

**CRITICAL: Course Material Alignment (Pages 2-7)**
- Page 2: Statistical inference definition and goals
- Page 3: Examples (product reliability, election polling)
- Page 4: Point estimates, statistics, sampling distributions
- Page 5: Types of statistics
- Page 6-7: Estimator variance and standard error

**NEW: Enhanced Features**
- Staged Learning Path System with progressive reveals
- CLT Animation with dramatic "aha moment" reveal
- Interactive Insights Cards with hover states and micro-interactions

## Component Architecture

### 1. Enhanced Progressive Learning Journey with Staged System

```jsx
const LearningStages = {
  INTRODUCTION: {
    id: 'intro',
    title: "What is Statistical Inference?",
    components: ['StatisticalInferenceIntroduction', 'CoreObjective', 'InteractiveInsights'],
    duration: 3000, // Auto-advance after 3s of viewing
    nextEnabled: 'automatic',
    enterAnimation: { opacity: 0, y: 20 },
    exitAnimation: { opacity: 0, x: -50 },
    requiredInteractions: 0
  },
  EXPLORATION: {
    id: 'explore',
    title: "Explore Through Examples",
    components: ['GearWheelFactory', 'SamplingVariability', 'StatisticsTypes'],
    duration: null,
    nextEnabled: 'afterInteraction', // Requires 2 interactions
    enterAnimation: { opacity: 0, scale: 0.95 },
    exitAnimation: { opacity: 0, scale: 1.05 },
    requiredInteractions: 2
  },
  DISCOVERY: {
    id: 'discover',
    title: "Discover the Patterns",
    components: ['CLTVisualization', 'StandardError', 'BaseballHeights'],
    duration: null,
    nextEnabled: 'afterAhaMoment', // Special trigger at 500 samples
    enterAnimation: { opacity: 0, x: 50 },
    exitAnimation: { opacity: 0, x: -50 },
    requiredInteractions: 1,
    ahaMomentTrigger: 'clt-pattern-revealed'
  },
  APPLICATION: {
    id: 'apply',
    title: "Apply Your Knowledge",
    components: ['InteractiveCalculator', 'ConceptConnections', 'SelfAssessment'],
    duration: null,
    nextEnabled: 'afterCompletion',
    enterAnimation: { opacity: 0, y: -20 },
    exitAnimation: { opacity: 0, y: 20 },
    requiredInteractions: 1
  }
};

// Main component with smooth stage transitions
export default function StatisticalInference() {
  const [currentStage, setCurrentStage] = useState('intro');
  const [completedStages, setCompletedStages] = useState(new Set());
  const [stageProgress, setStageProgress] = useState({});
  
  const handleStageComplete = (stageId) => {
    setCompletedStages(prev => new Set([...prev, stageId]));
    const nextStage = getNextStage(stageId);
    if (nextStage) {
      setTimeout(() => setCurrentStage(nextStage), 500);
    }
  };
  
  return (
    <VisualizationContainer
      title="5.1 Statistical Inference"
      description="From Data to Decisions - A Progressive Journey"
    >
      <BackToHub chapter={5} />
      
      {/* Stage Progress Bar with Visual Indicators */}
      <StageProgressBar 
        stages={Object.values(LearningStages)}
        currentStage={currentStage}
        completedStages={completedStages}
        className="mb-6"
      />
      
      {/* Staged Content with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={LearningStages[currentStage].enterAnimation}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={LearningStages[currentStage].exitAnimation}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-[600px]"
        >
          <StageContent 
            stage={LearningStages[currentStage]}
            onComplete={() => handleStageComplete(currentStage)}
            onProgress={(progress) => updateStageProgress(currentStage, progress)}
          />
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}
```

### 2. Core Mathematical Framework

```jsx
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  const [selectedExample, setSelectedExample] = useState(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Primary Definition - Direct from Course */}
      <motion.div 
        className="bg-gradient-to-br from-emerald-900/20 via-neutral-800 to-neutral-900 
                   rounded-xl p-6 shadow-2xl border border-emerald-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-bold text-emerald-400 mb-4">
          The Fundamental Goal
        </h3>
        <p className="text-base text-neutral-200 leading-relaxed">
          One of the goals of statistical inference is to draw conclusions about a
          <span className="mx-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
            population
          </span>
          based on a
          <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            random sample
          </span>
          from the population.
        </p>
      </motion.div>
      
      {/* Course Examples Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <ExampleCard
          icon={Package}
          title="Manufacturing Reliability"
          description="Can we assess the reliability of a product's manufacturing process by randomly selecting a sample?"
          details={manufacturingDetails}
          isSelected={selectedExample === 'manufacturing'}
          onSelect={() => setSelectedExample('manufacturing')}
        />
        <ExampleCard
          icon={Vote}
          title="Election Polling"
          description="Can we determine who will win an election by polling a small sample of respondents?"
          details={electionDetails}
          isSelected={selectedExample === 'election'}
          onSelect={() => setSelectedExample('election')}
        />
      </div>
      
      {/* Mathematical Framework */}
      <AnimatePresence>
        {selectedExample && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800/50 rounded-lg p-4 space-y-3"
          >
            <h4 className="font-semibold text-white">Mathematical Framework</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Population Parameter</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\theta\\)` }} />
                <p className="text-xs mt-1">Unknown true value</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Point Estimate</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{\\theta}\\)` }} />
                <p className="text-xs mt-1">Our best guess</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Standard Error</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(SE(\\hat{\\theta})\\)` }} />
                <p className="text-xs mt-1">Uncertainty measure</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
```

### 3. Interactive Insights Cards with Hover Effects

```jsx
const InteractiveInsights = () => {
  const [revealedInsights, setRevealedInsights] = useState(new Set());
  
  const insights = [
    {
      id: 'population',
      title: 'Population',
      icon: Users,
      color: 'emerald',
      shortDesc: 'The entire group we want to study',
      fullDesc: 'A population includes all members of a defined group. In practice, it\'s often impossible or impractical to study everyone.',
      example: 'All voters in a country, all products from a factory',
      formula: 'Population parameter: θ (theta)'
    },
    {
      id: 'sample',
      title: 'Random Sample',
      icon: Dice6,
      color: 'blue',
      shortDesc: 'A subset selected from the population',
      fullDesc: 'A random sample ensures each member of the population has an equal chance of being selected, reducing bias.',
      example: '1000 randomly selected voters, 50 randomly tested products',
      formula: 'Sample statistic: θ̂ (theta hat)'
    },
    {
      id: 'inference',
      title: 'Inference',
      icon: TrendingUp,
      color: 'purple',
      shortDesc: 'Drawing conclusions about the population',
      fullDesc: 'Statistical inference uses sample data to make probabilistic statements about population parameters.',
      example: 'Estimating election outcome, determining product quality',
      formula: 'P(θ̂ - θ < ε) = confidence level'
    }
  ];
  
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {insights.map((insight, idx) => (
        <motion.div
          key={insight.id}
          className="relative group cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onHoverStart={() => setRevealedInsights(prev => new Set([...prev, insight.id]))}
        >
          {/* Background glow effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br from-${insight.color}-500/20 
                       to-transparent rounded-xl blur-xl transition-opacity duration-500`}
            animate={{ 
              opacity: revealedInsights.has(insight.id) ? 0.6 : 0,
              scale: revealedInsights.has(insight.id) ? 1.1 : 1
            }}
          />
          
          {/* Card content */}
          <motion.div
            className={`relative bg-gradient-to-br from-neutral-800 to-neutral-900 
                       rounded-xl p-4 border border-${insight.color}-500/30
                       hover:border-${insight.color}-500/60 transition-all duration-300
                       shadow-lg hover:shadow-${insight.color}-500/20`}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icon with rotation on hover */}
            <motion.div 
              className={`inline-flex p-2 rounded-lg bg-${insight.color}-500/20 mb-3`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <insight.icon className={`w-6 h-6 text-${insight.color}-400`} />
            </motion.div>
            
            {/* Title and description */}
            <h4 className={`font-bold text-${insight.color}-400 mb-2`}>
              {insight.title}
            </h4>
            
            <AnimatePresence mode="wait">
              {!revealedInsights.has(insight.id) ? (
                <motion.div
                  key="short"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-neutral-300">{insight.shortDesc}</p>
                  <p className="text-xs text-neutral-500 italic">Hover to explore →</p>
                </motion.div>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-neutral-300">{insight.fullDesc}</p>
                  <p className="text-xs text-neutral-400 italic">Example: {insight.example}</p>
                  <div className="mt-2 p-2 bg-neutral-900/50 rounded text-center">
                    <span className="text-xs font-mono text-${insight.color}-400"
                          dangerouslySetInnerHTML={{ __html: insight.formula }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
```

### 4. Interactive Gear Wheel Factory

```jsx
const GearWheelFactory = () => {
  const svgRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(30);
  const [issampling, setIsSampling] = useState(false);
  const [samples, setSamples] = useState([]);
  const [allSampleMeans, setAllSampleMeans] = useState([]);
  const [currentMean, setCurrentMean] = useState(null);
  
  // True population parameters (hidden from user)
  const TRUE_MU = 50;
  const TRUE_SIGMA = 2;
  
  // D3 setup with proper separation of concerns
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    
    // Create persistent layers
    const layers = {
      population: svg.append('g').attr('class', 'population-layer'),
      sample: svg.append('g').attr('class', 'sample-layer'),
      distribution: svg.append('g').attr('class', 'distribution-layer'),
      annotations: svg.append('g').attr('class', 'annotations-layer')
    };
    
    // Draw population representation
    drawPopulationVisualization(layers.population);
    
    return () => {
      // Cleanup
    };
  }, []);
  
  const performSampling = async () => {
    setIsSampling(true);
    const newSamples = [];
    
    // Smooth animation of sampling process
    for (let i = 0; i < sampleSize; i++) {
      const value = d3.randomNormal(TRUE_MU, TRUE_SIGMA)();
      newSamples.push(value);
      
      // Animate each sample point
      await animateSamplePoint(value, i);
      
      // Update running statistics
      if (i % 5 === 0) {
        updateRunningMean(newSamples);
      }
    }
    
    const mean = d3.mean(newSamples);
    setCurrentMean(mean);
    setAllSampleMeans([...allSampleMeans, mean]);
    
    // Show insight about variability
    showSamplingInsight(mean);
    setIsSampling(false);
  };
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">The Gear Wheel Factory</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Explore how sample statistics estimate population parameters
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Samples taken</p>
          <p className="text-2xl font-mono text-emerald-400">{allSampleMeans.length}</p>
        </div>
      </div>
      
      <GraphContainer height="400px" className="relative">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 400">
          <defs>
            {/* Gradients and filters */}
          </defs>
        </svg>
        
        {/* Floating insights */}
        <AnimatePresence>
          {currentMean && (
            <motion.div
              className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur-sm 
                         rounded-lg p-3 border border-emerald-500/30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-xs text-neutral-400">Current Sample Mean</p>
              <p className="text-xl font-mono text-emerald-400">
                {currentMean.toFixed(3)} g
              </p>
              <p className="text-xs text-yellow-400 mt-1">
                Error: {Math.abs(currentMean - TRUE_MU).toFixed(3)} g
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GraphContainer>
      
      <ControlGroup>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Sample Size Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Sample Size (n): {sampleSize}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
              disabled={issampling}
            />
            <p className="text-xs text-neutral-500">
              SE ∝ 1/√n (larger samples → smaller error)
            </p>
          </div>
          
          {/* Action Button */}
          <div className="flex items-center justify-center">
            <motion.button
              onClick={performSampling}
              disabled={issampling}
              className={`px-6 py-3 rounded-lg font-medium transition-all
                         ${issampling 
                           ? 'bg-neutral-600 cursor-not-allowed' 
                           : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                         } text-white shadow-lg`}
              whileHover={{ scale: issampling ? 1 : 1.05 }}
              whileTap={{ scale: issampling ? 1 : 0.95 }}
            >
              {issampling ? 'Sampling...' : 'Draw New Sample'}
            </motion.button>
          </div>
          
          {/* Statistics Display */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-400 mb-1">Sampling Distribution</p>
            {allSampleMeans.length > 1 && (
              <>
                <p className="text-sm">
                  Mean of means: <span className="font-mono text-blue-400">
                    {d3.mean(allSampleMeans).toFixed(3)}
                  </span>
                </p>
                <p className="text-sm">
                  SE of means: <span className="font-mono text-purple-400">
                    {d3.deviation(allSampleMeans).toFixed(3)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};
```

### 5. Enhanced CLT Visualization with "Aha Moment" Reveal

```jsx
const CLTVisualization = () => {
  const [distributionType, setDistributionType] = useState('uniform');
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(0);
  const [stage, setStage] = useState('setup'); // setup, sampling, reveal
  const [showTheory, setShowTheory] = useState(false);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [showAhaOverlay, setShowAhaOverlay] = useState(false);
  
  const distributions = {
    uniform: {
      name: 'Uniform',
      generator: () => Math.random() * 10,
      theoretical: { mean: 5, variance: 100/12 }
    },
    exponential: {
      name: 'Exponential',
      generator: () => -Math.log(1 - Math.random()) * 3,
      theoretical: { mean: 3, variance: 9 }
    },
    bimodal: {
      name: 'Bimodal',
      generator: () => Math.random() < 0.5 
        ? d3.randomNormal(2, 0.5)() 
        : d3.randomNormal(8, 0.5)(),
      theoretical: { mean: 5, variance: 10 }
    }
  };
  
  return (
    <VisualizationSection>
      <div className="space-y-4">
        {/* Header with Theory Toggle */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            Central Limit Theorem in Action
          </h3>
          <button
            onClick={() => setShowTheory(!showTheory)}
            className="text-sm px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
          >
            {showTheory ? 'Hide' : 'Show'} Theory
          </button>
        </div>
        
        {/* Theory Panel */}
        <AnimatePresence>
          {showTheory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-800/50 rounded-lg p-4"
            >
              <p className="text-sm text-neutral-300 mb-3">
                The Central Limit Theorem states that for large n:
              </p>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` 
                }} />
              </div>
              <p className="text-xs text-neutral-400 mt-3">
                Regardless of the population distribution shape!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Distribution Selector */}
        <div className="flex gap-2">
          {Object.entries(distributions).map(([key, dist]) => (
            <button
              key={key}
              onClick={() => setDistributionType(key)}
              className={`px-4 py-2 rounded transition-all ${
                distributionType === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {dist.name}
            </button>
          ))}
        </div>
        
        {/* Main Visualization Area */}
        <div className="grid md:grid-cols-2 gap-4">
          <GraphContainer title="Population Distribution">
            {/* Show selected distribution shape */}
          </GraphContainer>
          <GraphContainer title="Sampling Distribution of X̄">
            {/* Show emerging normal distribution */}
          </GraphContainer>
        </div>
        
        {/* Progress Indicators */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Samples Generated</span>
            <span className="font-mono text-emerald-400">{numSamples}</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(numSamples / 10, 100)}%` }}
            />
          </div>
          {numSamples >= 500 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-400 mt-2 text-center"
            >
              ✨ The normal pattern emerges! The CLT works its magic.
            </motion.p>
          )}
        </div>
        
        {/* Aha Moment Overlay */}
        <AnimatePresence>
          {showAhaOverlay && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAhaOverlay(false)}
            >
              <motion.div
                className="bg-neutral-900/95 backdrop-blur-sm rounded-xl p-8 max-w-md
                           border border-emerald-500/50 shadow-2xl"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="text-center space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="inline-flex p-3 rounded-full bg-emerald-500/20"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360, 720]
                    }}
                    transition={{ duration: 2 }}
                  >
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  
                  <h4 className="text-2xl font-bold text-emerald-400">
                    The Pattern Emerges!
                  </h4>
                  
                  <p className="text-neutral-300 leading-relaxed">
                    No matter the shape of the original population distribution,
                    the sampling distribution of the mean approaches a 
                    <span className="text-emerald-400 font-semibold"> normal distribution</span> 
                    as sample size increases.
                  </p>
                  
                  <div className="p-4 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-2">This is the magic of:</p>
                    <p className="text-xl font-bold text-transparent bg-clip-text 
                                  bg-gradient-to-r from-emerald-400 to-blue-400">
                      The Central Limit Theorem
                    </p>
                  </div>
                  
                  <motion.button
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 
                               rounded-lg text-white font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAhaOverlay(false)}
                  >
                    Continue Exploring
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </VisualizationSection>
  );
};

// Helper function to trigger aha moment
const runCLTSimulation = async () => {
  let means = [];
  let iteration = 0;
  
  const sample = () => {
    if (iteration < 1000) {
      // Generate sample
      const sampleData = generateSample(distributionType, sampleSize);
      const mean = d3.mean(sampleData);
      means.push(mean);
      
      // Update visualization
      if (iteration % 10 === 0) {
        updateHistogram(means);
        setNumSamples(iteration);
      }
      
      // Trigger aha moment at 500 samples
      if (iteration === 500) {
        setStage('reveal');
        revealNormalCurveOverlay();
        setTimeout(() => setShowAhaOverlay(true), 1000);
      }
      
      iteration++;
      requestAnimationFrame(sample);
    } else {
      setSampleMeans(means);
      completeSimulation();
    }
  };
  
  sample();
};
```

### 6. Baseball Heights Example (Direct from Course)

```jsx
const BaseballHeightsExample = React.memo(function BaseballHeightsExample() {
  const contentRef = useRef(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Exact data from course page 6
  const heights = [74,74,72,72,73,69,69,71,76,71,73,73,74,74,69,70,72,73,75,78];
  const n = 20;
  const xBar = 72.6;
  const s2 = 5.6211;
  const s = Math.sqrt(s2);
  const se = s / Math.sqrt(n);
  
  return (
    <div ref={contentRef} className="space-y-4">
      <h3 className="text-xl font-bold text-white">
        Example: Baseball Player Heights
      </h3>
      
      <div className="bg-neutral-800 rounded-lg p-4">
        <p className="text-sm text-neutral-300 mb-3">
          Heights (in inches) of 20 randomly selected baseball players:
        </p>
        <div className="flex flex-wrap gap-2">
          {heights.map((h, i) => (
            <span key={i} className="px-2 py-1 bg-neutral-700 rounded font-mono text-sm">
              {h}
            </span>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          label="Sample Mean"
          value={`${xBar}"`}
          formula="\\bar{X} = \\frac{1}{n}\\sum X_i"
          color="blue"
        />
        <StatCard
          label="Sample Variance"
          value={s2.toFixed(4)}
          formula="S^2 = \\frac{1}{n-1}\\sum(X_i - \\bar{X})^2"
          color="purple"
        />
        <StatCard
          label="Standard Error"
          value={se.toFixed(4)}
          formula="SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}"
          color="emerald"
        />
      </div>
      
      <motion.div
        className="bg-gradient-to-r from-emerald-900/20 to-transparent rounded-lg p-4"
        whileHover={{ scale: 1.02 }}
      >
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
        >
          <ChevronRight className={`w-4 h-4 transform transition-transform ${
            showCalculation ? 'rotate-90' : ''
          }`} />
          Show Calculation Steps
        </button>
        
        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm"
            >
              <div className="pl-6">
                <p>1. Calculate mean: <span dangerouslySetInnerHTML={{ 
                  __html: `\\(\\bar{X} = \\frac{1452}{20} = 72.6\\)` 
                }} /></p>
                <p>2. Calculate variance: <span dangerouslySetInnerHTML={{ 
                  __html: `\\(S^2 = \\frac{106.8}{19} = 5.6211\\)` 
                }} /></p>
                <p>3. Calculate SE: <span dangerouslySetInnerHTML={{ 
                  __html: `\\(SE = \\frac{\\sqrt{5.6211}}{\\sqrt{20}} = 0.5301\\)` 
                }} /></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
```

### 7. Interactive Calculator & Concept Synthesis

```jsx
const InteractiveCalculator = () => {
  const [mode, setMode] = useState('known-sigma'); // known-sigma, unknown-sigma
  const [values, setValues] = useState({
    n: 30,
    xBar: 100,
    sigma: 15,
    s: 14.5
  });
  
  const calculateSE = () => {
    if (mode === 'known-sigma') {
      return values.sigma / Math.sqrt(values.n);
    } else {
      return values.s / Math.sqrt(values.n);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">
        Standard Error Calculator
      </h3>
      
      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('known-sigma')}
          className={`px-4 py-2 rounded ${
            mode === 'known-sigma' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          σ Known
        </button>
        <button
          onClick={() => setMode('unknown-sigma')}
          className={`px-4 py-2 rounded ${
            mode === 'unknown-sigma' 
              ? 'bg-purple-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          σ Unknown
        </button>
      </div>
      
      {/* Input Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sample Size (n): {values.n}
          </label>
          <input
            type="range"
            min="5"
            max="200"
            value={values.n}
            onChange={(e) => setValues({...values, n: Number(e.target.value)})}
            className="w-full"
          />
        </div>
        
        {mode === 'known-sigma' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Population SD (σ): {values.sigma}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={values.sigma}
              onChange={(e) => setValues({...values, sigma: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample SD (s): {values.s}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={values.s}
              onChange={(e) => setValues({...values, s: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {/* Results Display */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-2">Standard Error of X̄</p>
          <p className="text-3xl font-mono text-emerald-400">
            {calculateSE().toFixed(4)}
          </p>
          <div className="mt-4 p-3 bg-neutral-900/50 rounded">
            {mode === 'known-sigma' ? (
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[SE(\\bar{X}) = \\frac{${values.sigma}}{\\sqrt{${values.n}}} = ${calculateSE().toFixed(4)}\\]` 
              }} />
            ) : (
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[SE(\\bar{X}) = \\frac{${values.s}}{\\sqrt{${values.n}}} = ${calculateSE().toFixed(4)}\\]` 
              }} />
            )}
          </div>
        </div>
      </div>
      
      {/* Visual SE Comparison */}
      <GraphContainer height="200px">
        {/* Bar chart showing SE for different sample sizes */}
      </GraphContainer>
    </div>
  );
};
```

### 8. Key Implementation Requirements

**State Management:**
```jsx
const [currentPath, setCurrentPath] = useState('foundation');
const [completedSections, setCompletedSections] = useState(new Set());
const [userInteractions, setUserInteractions] = useState({});
const [showMathDetails, setShowMathDetails] = useState(false);
```

**Performance Optimizations:**
- Separate D3 imperative updates from React renders
- Use requestAnimationFrame for smooth animations
- React.memo for all LaTeX-heavy sections
- Lazy load heavy visualizations

**Visual Design System:**
```jsx
const theme = {
  colors: {
    primary: '#10b981', // emerald-500
    secondary: '#3b82f6', // blue-500
    tertiary: '#a855f7', // purple-500
    background: '#171717', // neutral-900
    surface: '#262626', // neutral-800
    surfaceLight: '#404040' // neutral-700
  },
  gradients: {
    primary: 'from-emerald-600 to-emerald-700',
    card: 'from-emerald-900/20 via-neutral-800 to-transparent',
    glow: 'from-emerald-500/20 to-transparent'
  },
  animations: {
    smooth: { duration: 0.5, ease: "easeInOut" },
    bounce: { type: "spring", stiffness: 300, damping: 20 }
  }
};
```

**Content Organization with Stage System:**
1. **Introduction (Auto-advance after 3s)**: 
   - Definition with animated reveal
   - Interactive insight cards with hover effects
   - Core framework introduction
   
2. **Exploration (2 interactions required)**: 
   - Gear wheel factory with smooth animations
   - Sampling variability visualization
   - Statistics types explorer
   
3. **Discovery (Aha moment trigger at 500 samples)**: 
   - CLT demo with 3-stage progression
   - Dramatic normal curve reveal with overlay
   - Standard error insights
   - Baseball heights example
   
4. **Application (1 interaction required)**: 
   - Interactive calculator
   - Concept synthesis
   - Self-assessment with feedback

**Mathematical Rigor:**
- All formulas from course pages 2-7
- Exact examples (gear wheels, baseball heights)
- Clear notation following LaTeX guide
- Progressive complexity

**File Location:** `/src/components/05-estimation/5-1-StatisticalInference.jsx`