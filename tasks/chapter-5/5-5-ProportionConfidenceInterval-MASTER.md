# MASTER Plan: 5.5 - Confidence Intervals for Proportions
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

## Component Development Mandate

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery**
Transform abstract proportion estimation into concrete understanding through real-world examples, interactive visualizations, and clear connections to the normal approximation.

**Core Mandates:**
1. **Real-World First:** Start with the election example to ground abstract concepts
2. **Visual Validation:** Show when normal approximation works (and when it doesn't)
3. **Interactive Discovery:** Let students explore the effect of n and p on intervals
4. **Practical Application:** Multiple scenarios beyond just elections

**CRITICAL: Course Material Alignment (Pages 35-38)**
- Page 35: Point estimator for proportion and standardization
- Page 36: Normal approximation and CI formula
- Pages 37-38: Election polling example

**Key Example from Course:**
- Election poll: n=1000, 52% support A, 48% support B
- 95% CI for A: 0.52 ± 0.031 = [0.489, 0.551]
- 95% CI for B: 0.48 ± 0.031 = [0.449, 0.511]
- Conclusion: Overlapping CIs mean "race is more likely to be a dead heat"

**Core Formulas:**
- Point estimator: P̂ = X/n
- Standard error: √(p(1-p)/n)
- CI: P̂ ± z_{α/2} √(P̂(1-P̂)/n)

**CRITICAL: LaTeX Rendering Best Practices**
- **ALWAYS** use `dangerouslySetInnerHTML` for ALL LaTeX content
- Follow the pattern in `/docs/latex-guide.md` exactly
- Use the processMathJax() + setTimeout(..., 100) pattern

**Gold Standard References:**
- **Structure:** `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- **Visualizations:** `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- **Animations:** Landing page patterns

## Component Architecture

### 1. Opening Section - Setting Up Proportions

```jsx
const ProportionIntroduction = React.memo(function ProportionIntroduction() {
  const contentRef = useRef(null);
  
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-3">
        <p className="text-lg font-semibold text-white mb-3">
          Confidence Intervals for Proportions
        </p>
        
        {/* Direct from course page 35 */}
        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
          <p className="text-sm mb-2">
            If X ~ B(n, p) (number of successes in n trials), then the point estimator 
            for p is:
          </p>
          <div className="text-center text-lg">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} = \\frac{X}{n}\\]` 
            }} />
          </div>
        </div>
        
        <p>
          Recall that E[X] = np and Var[X] = np(1-p). We can standardize:
        </p>
        
        <div className="bg-neutral-700/50 rounded-lg p-3">
          <div className="text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\hat{P} - p}{\\sqrt{\\frac{p(1-p)}{n}}} \\text{ is approximately } N(0,1)\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
          <p className="text-sm">
            <strong>Key Point:</strong> We don't know p (that's what we're estimating!), 
            so we use P̂ in the standard error calculation.
          </p>
        </div>
      </div>
    </div>
  );
});
```

### 2. Story-Driven Learning Journey

```jsx
const ProportionCIJourney = {
  SCENARIO: {
    id: 'scenario',
    title: 'The Election Story',
    subtitle: 'A real-world proportion problem',
    icon: Vote,
    color: 'purple',
    sections: ['ElectionSetup', 'PollResults', 'InitialQuestion']
  },
  THEORY: {
    id: 'theory',
    title: 'Building the Theory',
    subtitle: 'From binomial to normal approximation',
    icon: BookOpen,
    color: 'blue',
    sections: ['NormalApproximation', 'ConditionChecker', 'FormulaDerivation']
  },
  PRACTICE: {
    id: 'practice',
    title: 'Apply and Explore',
    subtitle: 'Build confidence with various scenarios',
    icon: Wrench,
    color: 'emerald',
    sections: ['InteractiveBuilder', 'ScenarioExplorer', 'InterpretationGuide']
  }
};

export default function ProportionConfidenceInterval() {
  const [currentStage, setCurrentStage] = useState('scenario');
  const [userProgress, setUserProgress] = useState({
    pollCompleted: false,
    conditionsUnderstood: false,
    formulaMastered: false,
    scenariosExplored: 0
  });
  
  return (
    <VisualizationContainer
      title="5.5 Proportion Confidence Intervals"
      description="From polls to population proportions"
    >
      <BackToHub chapter={5} />
      
      {/* Journey Progress Bar */}
      <JourneyProgressBar
        journey={ProportionCIJourney}
        currentStage={currentStage}
        progress={userProgress}
        onStageSelect={setCurrentStage}
      />
      
      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <StageContent
            stage={ProportionCIJourney[currentStage]}
            onProgress={(update) => setUserProgress({
              ...userProgress,
              ...update
            })}
          />
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}
```

### 3. The Election Story - Course Pages 37-38

```jsx
const ElectionExample = () => {
  const contentRef = useRef(null);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showOverlap, setShowOverlap] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Exact values from course
  const n = 1000;
  const supportA = 0.52;
  const supportB = 0.48;
  const z_alpha2 = 1.96; // 95% confidence
  
  // Calculate CIs
  const se_A = Math.sqrt((supportA * (1 - supportA)) / n);
  const se_B = Math.sqrt((supportB * (1 - supportB)) / n);
  const moe_A = z_alpha2 * se_A;
  const moe_B = z_alpha2 * se_B;
  
  const ci_A = {
    lower: supportA - moe_A,
    upper: supportA + moe_A
  };
  
  const ci_B = {
    lower: supportB - moe_B,
    upper: supportB + moe_B
  };
  
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
  }, [showCalculation]);
  
  return (
    <div className="space-y-6">
      {/* Story Introduction */}
      <motion.div
        className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                   rounded-xl p-6 border border-purple-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-purple-400 mb-4">
          The Election Dilemma
        </h3>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300">
            It's one week before a major election. A news organization wants to know:
            <span className="text-purple-400 font-semibold"> Will Candidate A win?</span>
          </p>
          <p className="text-neutral-300 mt-3">
            They can't ask all 10 million voters, so they poll a random sample...
          </p>
        </div>
      </motion.div>
      
      {/* Interactive Polling Simulation */}
      {stage === 'setup' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-neutral-800 rounded-xl p-6"
        >
          <h4 className="font-semibold text-white mb-4">Design the Poll</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-400 mb-3">
                How many voters should we poll?
              </p>
              <div className="space-y-3">
                {[100, 500, 1000, 2000].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setPollData({ size: n });
                      if (n === 1000) setStage('poll');
                    }}
                    className={`w-full py-3 rounded-lg transition-all ${
                      n === 1000
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                  >
                    <span className="font-mono">{n.toLocaleString()}</span> voters
                    {n === 1000 && (
                      <span className="text-sm ml-2">(Recommended)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center p-6 bg-neutral-900/50 rounded-lg">
                <BarChart className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">
                  Larger samples give more precise estimates,
                  but cost more time and money
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Poll Results */}
      {stage === 'poll' && (
        <PollResultsAnimation
          sampleSize={sampleSize}
          supportCount={supportCount}
          onComplete={() => setStage('results')}
        />
      )}
      
      {/* Confidence Interval Construction */}
      {stage === 'results' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Results Summary */}
          <div className="bg-neutral-800 rounded-xl p-6">
            <h4 className="font-semibold text-white mb-4">Poll Results</h4>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <p className="text-sm text-neutral-400">Sample Size</p>
                <p className="text-2xl font-mono">{sampleSize}</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <p className="text-sm text-neutral-400">Support Count</p>
                <p className="text-2xl font-mono text-purple-400">{supportCount}</p>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <p className="text-sm text-neutral-400">Sample Proportion</p>
                <p className="text-2xl font-mono text-purple-400">
                  {(pHat * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Build CI Step by Step */}
          <CIConstruction
            n={sampleSize}
            pHat={pHat}
            confidence={95}
            onComplete={() => setStage('interpretation')}
          />
        </motion.div>
      )}
      
      {/* Final Interpretation */}
      {stage === 'interpretation' && (
        <InterpretationPanel
          ci={[0.462, 0.524]}
          threshold={0.50}
          conclusion="statistical dead heat"
        />
      )}
    </div>
  );
};
```

### 4. Normal Approximation Validator with Course Integration

```jsx
const NormalApproximationValidator = () => {
  const [n, setN] = useState(100);
  const [p, setP] = useState(0.5);
  const [showDistributions, setShowDistributions] = useState(false);
  
  // Check conditions
  const np = n * p;
  const nq = n * (1 - p);
  const conditionsMet = np >= 10 && nq >= 10;
  
  // For visualization
  const mean = p;
  const sd = Math.sqrt(p * (1 - p) / n);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        When Can We Use Normal Approximation?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Interactive Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Size (n): {n}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              True Proportion (p): {p.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Rare event</span>
              <span>p = {p.toFixed(2)}</span>
              <span>Common event</span>
            </div>
          </div>
          
          {/* Condition Checker */}
          <motion.div
            className={`p-4 rounded-lg border-2 ${
              conditionsMet
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }`}
            animate={{
              borderColor: conditionsMet ? '#22c55e50' : '#ef444450'
            }}
          >
            <h4 className={`font-semibold mb-3 ${
              conditionsMet ? 'text-green-400' : 'text-red-400'
            }`}>
              {conditionsMet ? '✓ Conditions Met' : '✗ Conditions Not Met'}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${
                np >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>np = {n} × {p.toFixed(2)} = {np.toFixed(1)}</span>
                <span>{np >= 10 ? '≥' : '<'} 10 {np >= 10 ? '✓' : '✗'}</span>
              </div>
              <div className={`flex justify-between ${
                nq >= 10 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>n(1-p) = {n} × {(1-p).toFixed(2)} = {nq.toFixed(1)}</span>
                <span>{nq >= 10 ? '≥' : '<'} 10 {nq >= 10 ? '✓' : '✗'}</span>
              </div>
            </div>
            
            {!conditionsMet && (
              <p className="text-xs text-neutral-400 mt-3">
                When conditions fail, use exact binomial methods instead.
              </p>
            )}
          </motion.div>
          
          <button
            onClick={() => setShowDistributions(!showDistributions)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {showDistributions ? 'Hide' : 'Show'} Distribution Comparison
          </button>
        </div>
        
        {/* Visual Representation */}
        <div>
          <GraphContainer height="400px">
            <ApproximationVisualization
              n={n}
              p={p}
              showComparison={showDistributions}
            />
          </GraphContainer>
          
          {/* Insights */}
          <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm">
              <li>• Extreme p values (near 0 or 1) need larger n</li>
              <li>• p = 0.5 needs smallest sample size</li>
              <li>• SE = √(p(1-p)/n) is largest when p = 0.5</li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};
```

### 5. Interactive CI Builder with Step-by-Step Calculations

```jsx
const ProportionCIBuilder = () => {
  const [inputs, setInputs] = useState({
    n: 1000,
    x: 493,
    confidence: 95
  });
  
  const [mode, setMode] = useState('count'); // count or proportion
  const [showSteps, setShowSteps] = useState(false);
  const [compareWilson, setCompareWilson] = useState(false);
  
  // Calculations
  const pHat = inputs.x / inputs.n;
  const q = 1 - pHat;
  const z = getZCritical(inputs.confidence);
  const se = Math.sqrt(pHat * q / inputs.n);
  const margin = z * se;
  
  // Wald interval (standard)
  const waldLower = Math.max(0, pHat - margin);
  const waldUpper = Math.min(1, pHat + margin);
  
  // Wilson interval (better for small samples)
  const wilsonCenter = (pHat + z*z/(2*inputs.n)) / (1 + z*z/inputs.n);
  const wilsonRadius = z * Math.sqrt(pHat*q/inputs.n + z*z/(4*inputs.n*inputs.n)) / (1 + z*z/inputs.n);
  const wilsonLower = Math.max(0, wilsonCenter - wilsonRadius);
  const wilsonUpper = Math.min(1, wilsonCenter + wilsonRadius);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Proportion Confidence Interval Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('count')}
            className={`px-4 py-2 rounded ${
              mode === 'count' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Count Input
          </button>
          <button
            onClick={() => setMode('proportion')}
            className={`px-4 py-2 rounded ${
              mode === 'proportion' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Proportion Input
          </button>
        </div>
      </div>
      
      {/* Input Controls */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sample Size (n)
          </label>
          <input
            type="number"
            value={inputs.n}
            onChange={(e) => setInputs({...inputs, n: Math.max(1, Number(e.target.value))})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
            min="1"
          />
        </div>
        
        {mode === 'count' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Success Count (x)
            </label>
            <input
              type="number"
              value={inputs.x}
              onChange={(e) => setInputs({
                ...inputs, 
                x: Math.max(0, Math.min(inputs.n, Number(e.target.value)))
              })}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max={inputs.n}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Proportion (p̂)
            </label>
            <input
              type="number"
              value={pHat.toFixed(3)}
              onChange={(e) => {
                const newP = Math.max(0, Math.min(1, Number(e.target.value)));
                setInputs({...inputs, x: Math.round(newP * inputs.n)});
              }}
              className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
              min="0"
              max="1"
              step="0.001"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Level
          </label>
          <select
            value={inputs.confidence}
            onChange={(e) => setInputs({...inputs, confidence: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={98}>98%</option>
            <option value={99}>99%</option>
          </select>
        </div>
      </div>
      
      {/* Condition Check */}
      <ConditionCheckPanel n={inputs.n} pHat={pHat} />
      
      {/* Results */}
      <motion.div
        className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                   rounded-xl p-6 border border-purple-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        key={`${inputs.n}-${inputs.x}-${inputs.confidence}`}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-neutral-400 mb-2">
            {inputs.confidence}% Confidence Interval for p
          </p>
          <p className="text-3xl font-mono text-purple-400">
            [{(waldLower * 100).toFixed(1)}%, {(waldUpper * 100).toFixed(1)}%]
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Point estimate: p̂ = {(pHat * 100).toFixed(1)}%
          </p>
        </div>
        
        {/* Show Steps */}
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full py-2 text-sm text-purple-400 hover:text-purple-300"
        >
          {showSteps ? 'Hide' : 'Show'} Calculation Steps
        </button>
        
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm font-mono"
            >
              <p>1. p̂ = x/n = {inputs.x}/{inputs.n} = {pHat.toFixed(4)}</p>
              <p>2. SE = √(p̂(1-p̂)/n) = √({pHat.toFixed(3)}×{q.toFixed(3)}/{inputs.n})</p>
              <p>   SE = {se.toFixed(4)}</p>
              <p>3. z_{inputs.confidence}% = {z.toFixed(3)}</p>
              <p>4. Margin = z × SE = {z.toFixed(3)} × {se.toFixed(4)} = {margin.toFixed(4)}</p>
              <p>5. CI = p̂ ± margin = {pHat.toFixed(4)} ± {margin.toFixed(4)}</p>
              <p>6. CI = [{waldLower.toFixed(4)}, {waldUpper.toFixed(4)}]</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Wilson Interval Comparison */}
      <div className="mt-4">
        <button
          onClick={() => setCompareWilson(!compareWilson)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {compareWilson ? 'Hide' : 'Compare with'} Wilson Interval
        </button>
        
        <AnimatePresence>
          {compareWilson && (
            <WilsonComparison
              wald={{ lower: waldLower, upper: waldUpper }}
              wilson={{ lower: wilsonLower, upper: wilsonUpper }}
              n={inputs.n}
              pHat={pHat}
            />
          )}
        </AnimatePresence>
      </div>
    </VisualizationSection>
  );
};
```

### 6. Real-World Applications Beyond Elections

```jsx
const ScenarioExplorer = () => {
  const [selectedScenario, setSelectedScenario] = useState('election');
  
  const scenarios = {
    election: {
      title: 'Political Polling',
      icon: Vote,
      color: 'purple',
      description: 'Predicting election outcomes',
      examples: [
        { name: 'Presidential Race', n: 2000, p: 0.52, context: 'National poll' },
        { name: 'Local Election', n: 500, p: 0.48, context: 'City council' },
        { name: 'Exit Poll', n: 1500, p: 0.55, context: 'Election day' }
      ],
      insights: [
        'Margin of error typically ±3% for n=1000',
        'Watch for "statistical ties"',
        'Consider likely voter screens'
      ]
    },
    quality: {
      title: 'Quality Control',
      icon: CheckCircle,
      color: 'emerald',
      description: 'Manufacturing defect rates',
      examples: [
        { name: 'Electronics', n: 1000, p: 0.02, context: 'Defect rate' },
        { name: 'Pharmaceuticals', n: 10000, p: 0.001, context: 'Critical defects' },
        { name: 'Food Safety', n: 500, p: 0.05, context: 'Contamination' }
      ],
      insights: [
        'Small p requires large n',
        'Zero defects ≠ zero defect rate',
        'Consider sequential sampling'
      ]
    },
    medical: {
      title: 'Medical Studies',
      icon: Heart,
      color: 'red',
      description: 'Treatment success rates',
      examples: [
        { name: 'Drug Efficacy', n: 300, p: 0.75, context: 'Response rate' },
        { name: 'Side Effects', n: 1000, p: 0.15, context: 'Adverse events' },
        { name: 'Vaccine Trial', n: 5000, p: 0.95, context: 'Protection rate' }
      ],
      insights: [
        'Clinical vs. statistical significance',
        'Number needed to treat (NNT)',
        'Consider confidence level carefully'
      ]
    },
    marketing: {
      title: 'A/B Testing',
      icon: TrendingUp,
      color: 'blue',
      description: 'Conversion rate optimization',
      examples: [
        { name: 'Email Campaign', n: 5000, p: 0.23, context: 'Click rate' },
        { name: 'Landing Page', n: 2000, p: 0.08, context: 'Conversion' },
        { name: 'App Feature', n: 10000, p: 0.45, context: 'Adoption rate' }
      ],
      insights: [
        'Effect size matters more than p-value',
        'Consider practical significance',
        'Account for multiple comparisons'
      ]
    }
  };
  
  const scenario = scenarios[selectedScenario];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Real-World Applications
      </h3>
      
      {/* Scenario Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => {
          const Icon = scen.icon;
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-current'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              style={{
                borderColor: selectedScenario === key ? scen.color : undefined,
                backgroundColor: selectedScenario === key 
                  ? `${scen.color}15` 
                  : 'rgb(38 38 38)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" style={{
                color: selectedScenario === key ? scen.color : '#e5e5e5'
              }} />
              <p className="text-xs font-medium">{scen.title}</p>
            </motion.button>
          );
        })}
      </div>
      
      {/* Scenario Details */}
      <motion.div
        key={selectedScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Description */}
        <div className="bg-neutral-800 rounded-xl p-6">
          <h4 className="font-semibold text-white mb-2" style={{ color: scenario.color }}>
            {scenario.title}: {scenario.description}
          </h4>
          
          {/* Example Cases */}
          <div className="mt-4 space-y-3">
            {scenario.examples.map((example, idx) => (
              <ExampleCase
                key={idx}
                example={example}
                color={scenario.color}
                onCalculate={() => {}}
              />
            ))}
          </div>
        </div>
        
        {/* Key Insights */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-3">
            Important Considerations
          </h5>
          <ul className="space-y-2">
            {scenario.insights.map((insight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5"
                     style={{ backgroundColor: scenario.color }} />
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </VisualizationSection>
  );
};
```

### 7. Common Mistakes and Pitfalls

```jsx
const CommonMistakes = () => {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Common Mistakes to Avoid
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Using p instead of p̂
          </h4>
          <p className="text-sm text-neutral-300 mb-2">
            We don't know the true proportion p! Always use the sample proportion p̂ 
            in the standard error calculation.
          </p>
          <div className="bg-neutral-900 rounded p-2 text-center">
            <span className="text-red-400 line-through">√(p(1-p)/n)</span>
            <span className="text-green-400 ml-3">√(p̂(1-p̂)/n)</span>
          </div>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Ignoring np ≥ 10 rule
          </h4>
          <p className="text-sm text-neutral-300">
            The normal approximation requires both np ≥ 10 AND n(1-p) ≥ 10. 
            For small samples or extreme proportions, use exact binomial methods.
          </p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Misinterpreting overlapping CIs
          </h4>
          <p className="text-sm text-neutral-300">
            Overlapping confidence intervals suggest no significant difference, 
            but formal hypothesis testing is needed for conclusions.
          </p>
        </div>
        
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            CI extending beyond [0,1]
          </h4>
          <p className="text-sm text-neutral-300">
            Proportions must be between 0 and 1. If your CI extends beyond these 
            bounds, truncate at 0 or 1, or use better methods (Wilson).
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
};
```

### 8. Key Takeaways and Summary

```jsx
const KeyTakeaways = () => {
  const contentRef = useRef(null);
  
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
    <div ref={contentRef} className="mt-8 bg-gradient-to-br from-emerald-900/20 to-neutral-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">
        Key Takeaways
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            The Formula
          </h4>
          <div className="bg-neutral-900 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{P} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{P}(1-\\hat{P})}{n}}\\]` 
            }} />
          </div>
          <p className="text-sm text-neutral-400 mt-2">
            Remember: Use p̂, not p, in the SE calculation!
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            When to Use
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Binary outcomes (success/failure)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Large enough sample (np ≥ 10, n(1-p) ≥ 10)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Independent observations</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
        <p className="text-sm text-yellow-300">
          <strong>Remember the Election Example:</strong> A 4-point lead in polls 
          doesn't guarantee victory if the confidence intervals overlap!
        </p>
      </div>
    </div>
  );
};
```

### 9. Key Implementation Requirements

**State Management:**
```jsx
const [currentStage, setCurrentStage] = useState('scenario');
const [userProgress, setUserProgress] = useState({
  pollCompleted: false,
  conditionsUnderstood: false,
  formulaMastered: false,
  scenariosExplored: 0
});
const [savedCalculations, setSavedCalculations] = useState([]);
```

**Performance Optimizations:**
- Memoize proportion calculations
- Use refs for poll animations
- Lazy load scenario data
- Cache z-critical values

**Visual Design System:**
```jsx
const theme = {
  stages: {
    scenario: { primary: '#a855f7', gradient: 'from-purple-600 to-purple-700' },
    theory: { primary: '#3b82f6', gradient: 'from-blue-600 to-blue-700' },
    practice: { primary: '#10b981', gradient: 'from-emerald-600 to-emerald-700' }
  },
  scenarios: {
    election: '#a855f7',
    quality: '#10b981',
    medical: '#ef4444',
    marketing: '#3b82f6'
  }
};
```

**Course Integration:**
- Use exact election example (n=1000, x=493)
- Show all steps in CI calculation
- Emphasize normal approximation conditions
- Include "statistical dead heat" interpretation

**Mathematical Functions:**
```jsx
// Standard error for proportion
const proportionSE = (pHat, n) => {
  return Math.sqrt(pHat * (1 - pHat) / n);
};

// Wilson interval (better for edge cases)
const wilsonInterval = (x, n, confidence) => {
  const z = getZCritical(confidence);
  const pHat = x / n;
  const denominator = 1 + z*z/n;
  
  const center = (pHat + z*z/(2*n)) / denominator;
  const radius = z * Math.sqrt(pHat*(1-pHat)/n + z*z/(4*n*n)) / denominator;
  
  return {
    lower: Math.max(0, center - radius),
    upper: Math.min(1, center + radius)
  };
};
```

**Section Flow:**
1. Introduction with formulas using explicit LaTeX rendering
2. Normal approximation checker with visual validation
3. Election example (complete walkthrough matching pages 37-38)
4. Interactive CI builder with step-by-step calculations
5. Real-world applications across multiple domains
6. Common mistakes section to avoid pitfalls
7. Key takeaways with formula summary

**Visual Elements:**
- Number line showing CI overlap for election example
- Normal approximation validity checker with np and n(1-p) calculations
- Interactive proportion calculator with live updates
- Scenario-based examples with domain-specific insights

**Course Alignment:**
- Use exact election example (n=1000, 52% vs 48%)
- Show the "dead heat" conclusion with overlapping intervals
- Include all formulas from pages 35-36 with proper LaTeX
- Emphasize using p̂ not p in standard error

**LaTeX Rendering Pattern:**
```jsx
const contentRef = useRef(null);

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
```

**Interactive Elements:**
- Poll simulation with animation
- Condition checker with visual feedback
- Scenario explorer with real examples
- Comparison of Wald vs Wilson intervals
- Step-by-step calculation reveals

**File Location:** `/src/components/05-estimation/5-5-ProportionConfidenceInterval.jsx`