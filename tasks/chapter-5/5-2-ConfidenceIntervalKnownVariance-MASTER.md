# MASTER Plan: 5.2 - Confidence Intervals for μ when σ is Known

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
Build confidence intervals through visual understanding, then connect to mathematical rigor. Start with the 68-95-99.7 rule, progress to critical values, and master CI construction through interactive examples.

**Core Mandates:**
1. **Progressive Complexity:** Start with intuitive 68-95-99.7 rule, build to formal z-critical values
2. **Visual-First Learning:** Every concept has a visualization before the formula
3. **Exact Course Alignment:** Use all examples from pages 8-25 exactly as presented
4. **Interactive Mastery:** Students manipulate parameters to see immediate effects on CIs

**CRITICAL: Course Material Alignment (Pages 8-25)**
- Pages 8-10: Setup and problem statement (course-materials/content/chapter-05-statistical-inference.md)
- Pages 11-13: The 68-95-99.7 Rule with example (n=64, σ=72, X̄=375.2)
- Pages 14-21: Critical values and formal CI construction
- Pages 22-25: Multiple examples showing effects of n, σ, and confidence level

**Gold Standard References:**
- **Structure:** `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- **Interactivity:** `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- **Animations:** Landing page floating symbols pattern

## Component Architecture

### 1. Progressive Learning System

```jsx
const LearningModes = {
  INTUITIVE: {
    id: 'intuitive',
    title: 'Build Intuition',
    subtitle: 'Start with the 68-95-99.7 Rule',
    color: 'blue',
    icon: Lightbulb,
    sections: ['Introduction', 'Rule68-95-99.7', 'FirstExample'],
    unlockNext: 'afterCompletion'
  },
  FORMAL: {
    id: 'formal',
    title: 'Formalize Understanding',
    subtitle: 'Learn critical values and CI formula',
    color: 'purple',
    icon: Calculator,
    sections: ['CriticalValues', 'CIFormula', 'InteractiveBuilder'],
    unlockNext: 'afterMastery'
  },
  EXPLORATION: {
    id: 'exploration',
    title: 'Explore Relationships',
    subtitle: 'See how n, σ, and α affect intervals',
    color: 'emerald',
    icon: Microscope,
    sections: ['ParameterEffects', 'ComparativeAnalysis', 'RealWorld'],
    unlockNext: 'always'
  }
};

export default function ConfidenceIntervalKnownVariance() {
  const [currentMode, setCurrentMode] = useState('intuitive');
  const [unlockedModes, setUnlockedModes] = useState(new Set(['intuitive']));
  const [masteryScores, setMasteryScores] = useState({});
  
  const checkModeUnlock = (completedSection) => {
    // Progressive unlocking based on demonstrated understanding
    if (currentMode === 'intuitive' && masteryScores.intuitive >= 80) {
      setUnlockedModes(prev => new Set([...prev, 'formal']));
      showUnlockAnimation('formal');
    }
  };
  
  return (
    <VisualizationContainer
      title="5.2 Confidence Intervals (σ Known)"
      description="From uncertainty to precision"
    >
      <BackToHub chapter={5} />
      
      {/* Mode Selector with Visual Progress */}
      <ModeSelector
        modes={LearningModes}
        currentMode={currentMode}
        unlockedModes={unlockedModes}
        masteryScores={masteryScores}
        onSelectMode={setCurrentMode}
      />
      
      {/* Dynamic Content Based on Mode */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <ModeContent 
            mode={LearningModes[currentMode]}
            onSectionComplete={checkModeUnlock}
          />
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}
```

### 2. Introduction with Visual Flow

```jsx
const ConfidenceIntervalIntroduction = React.memo(function ConfidenceIntervalIntroduction() {
  const contentRef = useRef(null);
  const [showFlow, setShowFlow] = useState(false);
  
  useEffect(() => {
    // LaTeX processing
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
      {/* Problem Setup - Direct from Course */}
      <motion.div 
        className="bg-gradient-to-br from-blue-900/20 via-neutral-800 to-neutral-900 
                   rounded-xl p-6 shadow-2xl border border-blue-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-blue-400 mb-4">The Challenge</h3>
        
        <div className="space-y-3 text-sm">
          <p>Consider a sample {`{x₁, ..., xₙ}`} from a normal population with:</p>
          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
              <p className="text-green-400 font-semibold">Known</p>
              <p>Variance σ² ✓</p>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
              <p className="text-yellow-400 font-semibold">Unknown</p>
              <p>Mean μ ?</p>
            </div>
          </div>
          
          <div className="bg-neutral-700/50 rounded-lg p-4">
            <p className="mb-2">Our point estimate:</p>
            <div className="text-center">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\bar{x} = \\frac{x_1 + \\cdots + x_n}{n}\\]` 
              }} />
            </div>
          </div>
          
          <motion.p 
            className="text-yellow-400 text-center mt-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            But x̄ ≈ μ, not x̄ = μ. How wrong could we be?
          </motion.p>
        </div>
      </motion.div>
      
      {/* Visual Flow Diagram */}
      <motion.button
        onClick={() => setShowFlow(!showFlow)}
        className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg 
                   text-white font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {showFlow ? 'Hide' : 'Show'} Confidence Interval Concept
      </motion.button>
      
      <AnimatePresence>
        {showFlow && <ConceptFlowDiagram />}
      </AnimatePresence>
    </div>
  );
});
```

### 3. The 68-95-99.7 Rule Interactive Visualization

```jsx
const Rule689599_7 = () => {
  const svgRef = useRef(null);
  const [selectedRule, setSelectedRule] = useState(2); // Default to 95%
  const [showExample, setShowExample] = useState(false);
  const animationRef = useRef(null);
  
  const rules = [
    { k: 1, percentage: 68.3, color: '#3b82f6', label: '68.3%' },
    { k: 2, percentage: 95.5, color: '#a855f7', label: '95.5%' },
    { k: 3, percentage: 99.7, color: '#10b981', label: '99.7%' }
  ];
  
  // Course example: n=64, σ=72, X̄=375.2
  const example = {
    n: 64,
    sigma: 72,
    xBar: 375.2,
    se: 72 / Math.sqrt(64) // = 9
  };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    
    // Clear and setup
    svg.selectAll("*").remove();
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Normal distribution function
    const normal = (x) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    };
    
    // Draw distribution curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const data = d3.range(-4, 4.1, 0.1).map(x => ({ x, y: normal(x) }));
    
    // Background curve
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#525252")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Animated area for selected rule
    const updateArea = (k) => {
      const areaData = data.filter(d => Math.abs(d.x) <= k);
      
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y));
      
      // Remove old area
      svg.selectAll(".confidence-area").remove();
      
      // Add new area with animation
      svg.append("path")
        .datum(areaData)
        .attr("class", "confidence-area")
        .attr("fill", rules[k-1].color)
        .attr("opacity", 0)
        .attr("d", area)
        .transition()
        .duration(800)
        .attr("opacity", 0.3);
      
      // Update labels
      updateLabels(k);
    };
    
    // Initial render
    updateArea(selectedRule);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedRule]);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">The 68-95-99.7 Rule</h3>
        <button
          onClick={() => setShowExample(!showExample)}
          className="text-sm px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded"
        >
          {showExample ? 'Hide' : 'Show'} Example
        </button>
      </div>
      
      {/* Rule Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {rules.map((rule, idx) => (
          <motion.button
            key={rule.k}
            onClick={() => setSelectedRule(rule.k)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedRule === rule.k
                ? `bg-${rule.color}/20 border-${rule.color}`
                : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-2xl font-bold" style={{ 
              color: selectedRule === rule.k ? rule.color : '#e5e5e5' 
            }}>
              {rule.label}
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              μ ± {rule.k}σ
            </p>
          </motion.button>
        ))}
      </div>
      
      {/* Main Visualization */}
      <GraphContainer height="400px">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 400" />
      </GraphContainer>
      
      {/* Example Application */}
      <AnimatePresence>
        {showExample && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-neutral-800/50 rounded-lg p-4"
          >
            <h4 className="font-semibold text-white mb-3">
              Example: Quality Control (n=64, σ=72, x̄=375.2)
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-400 mb-2">Calculation:</p>
                <div className="space-y-1 text-sm">
                  <p>SE = σ/√n = 72/√64 = 9</p>
                  <p>k = {selectedRule} → z = {selectedRule}</p>
                  <p className="font-semibold text-emerald-400">
                    CI: {example.xBar} ± {selectedRule * example.se}
                  </p>
                </div>
              </div>
              
              <div className="bg-neutral-900/50 rounded p-3">
                <p className="text-sm text-neutral-400 mb-1">
                  {rules[selectedRule-1].label} Confidence Interval:
                </p>
                <p className="text-lg font-mono text-emerald-400">
                  [{(example.xBar - selectedRule * example.se).toFixed(1)}, 
                   {(example.xBar + selectedRule * example.se).toFixed(1)}]
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </VisualizationSection>
  );
};
```

### 4. Critical Values Explorer

```jsx
const CriticalValuesExplorer = () => {
  const [confidence, setConfidence] = useState(95);
  const [showTable, setShowTable] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  
  // Common critical values from course
  const commonValues = [
    { confidence: 90, alpha: 0.10, z: 1.645 },
    { confidence: 95, alpha: 0.05, z: 1.960 },
    { confidence: 98, alpha: 0.02, z: 2.326 },
    { confidence: 99, alpha: 0.01, z: 2.576 }
  ];
  
  const calculateZ = (conf) => {
    const alpha = 1 - conf/100;
    // Using approximation for demonstration
    return Math.abs(jStat.normal.inv(alpha/2, 0, 1));
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Critical Values: From Confidence to z
      </h3>
      
      {/* Visual Connection */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4 items-center text-center">
          <div>
            <p className="text-sm text-neutral-400">Confidence Level</p>
            <p className="text-3xl font-bold text-blue-400">{confidence}%</p>
          </div>
          
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-8 h-8 text-neutral-500" />
            </motion.div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-400">Critical Value</p>
            <p className="text-3xl font-bold text-purple-400">
              z = {calculateZ(confidence).toFixed(3)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-400">α = {(1 - confidence/100).toFixed(3)}</p>
        </div>
      </div>
      
      {/* Interactive Slider */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-300 min-w-[120px]">
            Confidence: {confidence}%
          </label>
          <input
            type="range"
            min="80"
            max="99.9"
            step="0.1"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        
        {/* Quick Select Buttons */}
        <div className="flex gap-2">
          {commonValues.map(({ confidence: conf, z }) => (
            <button
              key={conf}
              onClick={() => setConfidence(conf)}
              className={`px-3 py-1 rounded text-sm ${
                confidence === conf
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {conf}%
            </button>
          ))}
        </div>
      </div>
      
      {/* Visual Distribution */}
      <GraphContainer height="300px" className="mt-6">
        <CriticalValueVisualization 
          confidence={confidence}
          z={calculateZ(confidence)}
        />
      </GraphContainer>
      
      {/* Reference Table */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="mt-4 text-sm text-purple-400 hover:text-purple-300"
      >
        {showTable ? 'Hide' : 'Show'} Reference Table
      </button>
      
      <AnimatePresence>
        {showTable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2">Confidence</th>
                  <th className="text-left py-2">α</th>
                  <th className="text-left py-2">z-critical</th>
                </tr>
              </thead>
              <tbody>
                {commonValues.map(({ confidence, alpha, z }) => (
                  <tr key={confidence} className="border-b border-neutral-800">
                    <td className="py-2">{confidence}%</td>
                    <td className="py-2">{alpha}</td>
                    <td className="py-2 font-mono">{z}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </VisualizationSection>
  );
};
```

### 5. Interactive CI Builder

```jsx
const InteractiveCIBuilder = () => {
  const [params, setParams] = useState({
    n: 25,
    sigma: 5,
    xBar: 19.93,
    confidence: 95
  });
  
  const [showSteps, setShowSteps] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  
  // Calculate CI components
  const calculate = (p) => {
    const z = calculateZ(p.confidence);
    const se = p.sigma / Math.sqrt(p.n);
    const margin = z * se;
    const lower = p.xBar - margin;
    const upper = p.xBar + margin;
    
    return { z, se, margin, lower, upper };
  };
  
  const result = calculate(params);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Build Your Confidence Interval
      </h3>
      
      {/* Parameter Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">Sample Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Size (n): {params.n}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={params.n}
              onChange={(e) => setParams({...params, n: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Population SD (σ): {params.sigma}
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={params.sigma}
              onChange={(e) => setParams({...params, sigma: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Mean (x̄): {params.xBar}
            </label>
            <input
              type="range"
              min="10"
              max="30"
              step="0.1"
              value={params.xBar}
              onChange={(e) => setParams({...params, xBar: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-400">Confidence Level</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {[90, 95, 98, 99].map(conf => (
              <button
                key={conf}
                onClick={() => setParams({...params, confidence: conf})}
                className={`py-2 rounded ${
                  params.confidence === conf
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {conf}%
              </button>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom: {params.confidence}%
            </label>
            <input
              type="range"
              min="80"
              max="99.9"
              step="0.1"
              value={params.confidence}
              onChange={(e) => setParams({...params, confidence: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Results Display */}
      <motion.div 
        className="mt-6 bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                   rounded-xl p-6 border border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-neutral-400 mb-2">
            {params.confidence}% Confidence Interval for μ
          </p>
          <p className="text-3xl font-mono text-emerald-400">
            [{result.lower.toFixed(3)}, {result.upper.toFixed(3)}]
          </p>
        </div>
        
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full py-2 text-sm text-emerald-400 hover:text-emerald-300"
        >
          {showSteps ? 'Hide' : 'Show'} Calculation Steps
        </button>
        
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-neutral-400">1. Standard Error:</p>
                  <p className="font-mono">SE = σ/√n = {params.sigma}/√{params.n} = {result.se.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-neutral-400">2. Critical Value:</p>
                  <p className="font-mono">z = {result.z.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-neutral-400">3. Margin of Error:</p>
                  <p className="font-mono">E = z × SE = {result.margin.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-neutral-400">4. Interval:</p>
                  <p className="font-mono">x̄ ± E = {params.xBar} ± {result.margin.toFixed(3)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Visual Representation */}
      <GraphContainer height="200px" className="mt-6">
        <CIVisualization params={params} result={result} />
      </GraphContainer>
    </VisualizationSection>
  );
};
```

### 7. Parameter Effects Explorer

```jsx
const ParameterEffectsExplorer = () => {
  const [activeParameter, setActiveParameter] = useState('n'); // n, sigma, confidence
  const baseParams = { n: 25, sigma: 5, xBar: 20, confidence: 95 };
  
  // Course examples for comparison
  const examples = [
    { label: "Example 1", n: 9, sigma: 5, xBar: 19.93 },
    { label: "Example 2", n: 25, sigma: 5, xBar: 19.93 },
    { label: "Example 3", n: 25, sigma: 10, xBar: 19.93 }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        How Parameters Affect Confidence Intervals
      </h3>
      
      {/* Parameter Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveParameter('n')}
          className={`px-4 py-2 rounded ${
            activeParameter === 'n' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          Sample Size (n)
        </button>
        <button
          onClick={() => setActiveParameter('sigma')}
          className={`px-4 py-2 rounded ${
            activeParameter === 'sigma' 
              ? 'bg-purple-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          Population SD (σ)
        </button>
        <button
          onClick={() => setActiveParameter('confidence')}
          className={`px-4 py-2 rounded ${
            activeParameter === 'confidence' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          Confidence Level
        </button>
      </div>
      
      {/* Interactive Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3">
            Effect of {activeParameter === 'n' ? 'Sample Size' : 
                       activeParameter === 'sigma' ? 'Population SD' : 
                       'Confidence Level'}
          </h4>
          
          <GraphContainer height="300px">
            <ParameterEffectVisualization 
              parameter={activeParameter}
              baseParams={baseParams}
            />
          </GraphContainer>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-white mb-3">Key Insights</h4>
          
          {activeParameter === 'n' && (
            <div className="space-y-3">
              <InsightCard
                icon={TrendingDown}
                title="Larger n → Narrower CI"
                description="Width ∝ 1/√n: Doubling n reduces width by √2"
                color="blue"
              />
              <InsightCard
                icon={Target}
                title="Diminishing Returns"
                description="Going from n=25 to n=100 only halves the width"
                color="blue"
              />
            </div>
          )}
          
          {activeParameter === 'sigma' && (
            <div className="space-y-3">
              <InsightCard
                icon={TrendingUp}
                title="Larger σ → Wider CI"
                description="Width ∝ σ: Doubling σ doubles the width"
                color="purple"
              />
              <InsightCard
                icon={AlertCircle}
                title="Population Variability"
                description="More variable populations need larger samples"
                color="purple"
              />
            </div>
          )}
          
          {activeParameter === 'confidence' && (
            <div className="space-y-3">
              <InsightCard
                icon={Shield}
                title="Higher Confidence → Wider CI"
                description="95% → 99% increases z from 1.96 to 2.58"
                color="emerald"
              />
              <InsightCard
                icon={Scale}
                title="The Trade-off"
                description="More confidence means less precision"
                color="emerald"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Course Examples Comparison */}
      <div className="mt-6 bg-neutral-800/50 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-3">
          Compare Course Examples
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {examples.map((ex, idx) => (
            <ExampleCard key={idx} example={ex} index={idx + 1} />
          ))}
        </div>
      </div>
    </VisualizationSection>
  );
};
```

### 8. Enhanced Key Implementation Requirements

**State Management:**
```jsx
const [currentMode, setCurrentMode] = useState('intuitive');
const [unlockedModes, setUnlockedModes] = useState(new Set(['intuitive']));
const [masteryScores, setMasteryScores] = useState({});
const [userProgress, setUserProgress] = useState({
  sectionsCompleted: [],
  interactionsCount: {},
  totalTime: 0
});
```

**Performance Optimizations:**
- Separate D3 visualizations into refs
- Use React.memo for all LaTeX sections
- Lazy load heavy visualizations
- RequestAnimationFrame for smooth animations

**Visual Consistency:**
```jsx
const theme = {
  modes: {
    intuitive: { primary: '#3b82f6', secondary: '#60a5fa' }, // blue
    formal: { primary: '#a855f7', secondary: '#c084fc' }, // purple
    exploration: { primary: '#10b981', secondary: '#34d399' } // emerald
  },
  animations: {
    smooth: { duration: 0.5, ease: "easeInOut" },
    bounce: { type: "spring", stiffness: 300, damping: 20 },
    reveal: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
  }
};
```

**Progressive Unlocking Logic:**
- Complete all sections in INTUITIVE → unlock FORMAL
- Achieve 80% mastery in FORMAL → unlock EXPLORATION
- Track interactions and provide feedback

**Course Example Integration:**
All four examples from pages 22-25 must be included:
1. n=64, σ=72, X̄=375.2 (main example)
2. n=9, σ=5, X̄=19.93 
3. n=25, σ=5, X̄=19.93
4. n=25, σ=10, X̄=19.93

**Mathematical Rigor:**
- Use exact formulas from course
- Show all calculation steps
- Connect visual and algebraic representations
- Emphasize the CI formula: X̄ ± z_(α/2) × σ/√n

**File Location:** `/src/components/05-estimation/5-2-ConfidenceIntervalKnownVariance.jsx`