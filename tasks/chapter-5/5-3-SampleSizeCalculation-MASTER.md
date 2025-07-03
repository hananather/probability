# MASTER Plan: 5.3 - Sample Size Calculation
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
Transform the abstract concept of sample size determination into an intuitive, visual experience. Students should understand not just the formula, but the trade-offs between precision, confidence, and cost.

**Core Mandates:**
1. **Visual-First Understanding:** Show the relationships between n, E, σ, and α visually before formulas
2. **Real-World Context:** Every example must have practical relevance
3. **Interactive Exploration:** Students manipulate parameters to see immediate effects
4. **Cost-Benefit Analysis:** Include practical considerations beyond just mathematics

**CRITICAL: Course Material Alignment (Pages 26-29)**
- Page 26: Sample size formula derivation (course-materials/content/chapter-05-statistical-inference.md)  
- Page 27: Four detailed examples (course-materials/content/chapter-05-statistical-inference.md)
- Page 28-29: Practice problems and solutions (course-materials/content/chapter-05-statistical-inference.md)

**Course Examples:**
1. σ = 15, E = 2, 95% CI → n = 217
2. σ = 3, E = 0.5, 95% CI → n = 139
3. σ = 15, E = 2, 90% CI → n = 153
4. σ = 15, E = 1, 95% CI → n = 865

**Gold Standard References:**
- **Component Structure:** `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- **Calculator Design:** `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- **Animations:** Landing page patterns

## Component Architecture

### 1. Three-Stage Learning Journey

```jsx
const SampleSizeJourney = {
  DISCOVER: {
    id: 'discover',
    title: 'Discover the Relationships',
    subtitle: 'How do n, E, σ, and confidence interact?',
    icon: Compass,
    color: 'blue',
    sections: ['VisualExploration', 'InteractiveRelationships', 'FirstInsights']
  },
  CALCULATE: {
    id: 'calculate',
    title: 'Master the Calculations',
    subtitle: 'Apply the formula with confidence',
    icon: Calculator,
    color: 'purple',
    sections: ['FormulaDerivation', 'GuidedExamples', 'PracticeMode']
  },
  APPLY: {
    id: 'apply',
    title: 'Real-World Applications',
    subtitle: 'Balance precision, confidence, and cost',
    icon: Briefcase,
    color: 'emerald',
    sections: ['CostAnalysis', 'ScenarioPlanning', 'OptimizationTool']
  }
};

export default function SampleSizeCalculation() {
  const [currentStage, setCurrentStage] = useState('discover');
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [savedCalculations, setSavedCalculations] = useState([]);
  
  return (
    <VisualizationContainer
      title="5.3 Sample Size Determination"
      description="Find the perfect balance"
    >
      <BackToHub chapter={5} />
      
      {/* Journey Progress */}
      <JourneyProgress
        stages={SampleSizeJourney}
        currentStage={currentStage}
        completedActivities={completedActivities}
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
            stage={SampleSizeJourney[currentStage]}
            onActivityComplete={(activity) => {
              setCompletedActivities(prev => new Set([...prev, activity]));
            }}
            savedCalculations={savedCalculations}
            onSaveCalculation={(calc) => setSavedCalculations([...savedCalculations, calc])}
          />
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}
```

### 2. Visual Exploration - Understanding Relationships

```jsx
const VisualExploration = () => {
  const [activeRelationship, setActiveRelationship] = useState('n-E'); // n-E, n-sigma, n-confidence
  const svgRef = useRef(null);
  const [animating, setAnimating] = useState(false);
  
  const relationships = {
    'n-E': {
      title: 'Sample Size vs. Margin of Error',
      description: 'Smaller margins require larger samples',
      formula: 'n ∝ 1/E²',
      color: '#3b82f6'
    },
    'n-sigma': {
      title: 'Sample Size vs. Population Variability',
      description: 'More variable populations need larger samples',
      formula: 'n ∝ σ²',
      color: '#a855f7'
    },
    'n-confidence': {
      title: 'Sample Size vs. Confidence Level',
      description: 'Higher confidence requires larger samples',
      formula: 'n ∝ z²',
      color: '#10b981'
    }
  };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    // Clear previous
    svg.selectAll("*").remove();
    
    // Scales based on relationship
    let xScale, yScale, data;
    
    if (activeRelationship === 'n-E') {
      // n vs E (inverse square relationship)
      xScale = d3.scaleLinear()
        .domain([0.5, 5])
        .range([margin.left, width - margin.right]);
      
      yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([height - margin.bottom, margin.top]);
      
      // Generate curve: n = (1.96 * 15 / E)²
      data = d3.range(0.5, 5.1, 0.1).map(E => ({
        x: E,
        y: Math.pow((1.96 * 15) / E, 2)
      }));
    }
    
    // Draw axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
    
    // Draw relationship curve with animation
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", relationships[activeRelationship].color)
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate path drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);
    
    // Add interactive hover effects
    const focus = svg.append("g")
      .attr("opacity", 0);
    
    focus.append("circle")
      .attr("r", 5)
      .attr("fill", relationships[activeRelationship].color);
    
    focus.append("rect")
      .attr("x", -50)
      .attr("y", -30)
      .attr("width", 100)
      .attr("height", 25)
      .attr("fill", "rgba(0,0,0,0.8)")
      .attr("rx", 5);
    
    focus.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -15)
      .attr("fill", "white")
      .attr("font-size", "12px");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", mousemove)
      .on("mouseout", () => focus.attr("opacity", 0));
    
    function mousemove(event) {
      const [mouseX] = d3.pointer(event);
      const x = xScale.invert(mouseX);
      const y = activeRelationship === 'n-E' ? Math.pow((1.96 * 15) / x, 2) : 0;
      
      focus.attr("opacity", 1)
        .attr("transform", `translate(${xScale(x)},${yScale(y)})`);
      
      focus.select("text")
        .text(`n = ${Math.round(y)}`);
    }
  }, [activeRelationship]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          How Sample Size Depends on Your Requirements
        </h3>
        <p className="text-neutral-400">
          Explore the fundamental relationships that drive sample size
        </p>
      </div>
      
      {/* Relationship Selector */}
      <div className="flex gap-3 justify-center">
        {Object.entries(relationships).map(([key, rel]) => (
          <motion.button
            key={key}
            onClick={() => setActiveRelationship(key)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeRelationship === key
                ? 'text-white shadow-lg'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
            style={{
              backgroundColor: activeRelationship === key ? rel.color : undefined
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {rel.title.split(' vs. ')[1]}
          </motion.button>
        ))}
      </div>
      
      {/* Visualization */}
      <div className="bg-neutral-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold text-white">
              {relationships[activeRelationship].title}
            </h4>
            <p className="text-sm text-neutral-400 mt-1">
              {relationships[activeRelationship].description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400">Relationship</p>
            <p className="font-mono text-lg" style={{ 
              color: relationships[activeRelationship].color 
            }}>
              {relationships[activeRelationship].formula}
            </p>
          </div>
        </div>
        
        <GraphContainer height="400px">
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400" />
        </GraphContainer>
        
        {/* Key Insights */}
        <motion.div 
          className="mt-4 p-4 bg-neutral-900/50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {activeRelationship === 'n-E' && (
            <div className="space-y-2 text-sm">
              <p>• Halving the margin of error quadruples the sample size</p>
              <p>• E = 2 → n ≈ 217, but E = 1 → n ≈ 865</p>
              <p>• Diminishing returns: precision gets expensive!</p>
            </div>
          )}
          {activeRelationship === 'n-sigma' && (
            <div className="space-y-2 text-sm">
              <p>• Doubling σ quadruples the required sample size</p>
              <p>• More homogeneous populations are easier to study</p>
              <p>• Consider stratification for highly variable populations</p>
            </div>
          )}
          {activeRelationship === 'n-confidence' && (
            <div className="space-y-2 text-sm">
              <p>• 90% → 95% confidence: n increases by 35%</p>
              <p>• 95% → 99% confidence: n increases by 73%</p>
              <p>• Common choice: 95% balances confidence and cost</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
```

### 3. Interactive Calculator with Course Examples

```jsx
const SampleSizeCalculator = () => {
  const [mode, setMode] = useState('calculate'); // calculate, explore
  const [inputs, setInputs] = useState({
    sigma: 15,
    E: 2,
    confidence: 95
  });
  
  const [showDerivation, setShowDerivation] = useState(false);
  const [compareExamples, setCompareExamples] = useState(false);
  
  // Course examples
  const courseExamples = [
    { id: 1, sigma: 15, E: 2, confidence: 95, n: 217 },
    { id: 2, sigma: 3, E: 0.5, confidence: 95, n: 139 },
    { id: 3, sigma: 15, E: 2, confidence: 90, n: 153 },
    { id: 4, sigma: 15, E: 1, confidence: 95, n: 865 }
  ];
  
  // Calculate z-value based on confidence
  const getZ = (confidence) => {
    const zValues = {
      90: 1.645,
      95: 1.960,
      98: 2.326,
      99: 2.576
    };
    return zValues[confidence] || 1.960;
  };
  
  // Calculate sample size
  const calculateN = (sigma, E, confidence) => {
    const z = getZ(confidence);
    return Math.ceil(Math.pow((z * sigma) / E, 2));
  };
  
  const n = calculateN(inputs.sigma, inputs.E, inputs.confidence);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          Sample Size Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('calculate')}
            className={`px-4 py-2 rounded ${
              mode === 'calculate' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Calculate
          </button>
          <button
            onClick={() => setMode('explore')}
            className={`px-4 py-2 rounded ${
              mode === 'explore' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Explore
          </button>
        </div>
      </div>
      
      {mode === 'calculate' ? (
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Population SD (σ)
              </label>
              <input
                type="number"
                value={inputs.sigma}
                onChange={(e) => setInputs({...inputs, sigma: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Known or estimated from pilot study
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Margin of Error (E)
              </label>
              <input
                type="number"
                value={inputs.E}
                onChange={(e) => setInputs({...inputs, E: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-neutral-700 rounded-lg text-white"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Maximum acceptable error
              </p>
            </div>
            
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
              <p className="text-xs text-neutral-500 mt-1">
                Typically 95%
              </p>
            </div>
          </div>
          
          {/* Results */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/20 to-neutral-800 
                       rounded-xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={n} // Re-animate on change
          >
            <p className="text-sm text-neutral-400 mb-2">Required Sample Size</p>
            <p className="text-5xl font-bold text-purple-400 mb-4">n = {n}</p>
            
            <button
              onClick={() => setShowDerivation(!showDerivation)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              {showDerivation ? 'Hide' : 'Show'} Calculation
            </button>
            
            <AnimatePresence>
              {showDerivation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-left bg-neutral-900/50 rounded-lg p-4"
                >
                  <p className="text-sm mb-2">Step-by-step calculation:</p>
                  <div className="space-y-2 font-mono text-sm">
                    <p>1. z_{inputs.confidence}% = {getZ(inputs.confidence)}</p>
                    <p>2. n = (z × σ / E)²</p>
                    <p>3. n = ({getZ(inputs.confidence)} × {inputs.sigma} / {inputs.E})²</p>
                    <p>4. n = ({(getZ(inputs.confidence) * inputs.sigma).toFixed(2)} / {inputs.E})²</p>
                    <p>5. n = {Math.pow((getZ(inputs.confidence) * inputs.sigma) / inputs.E, 2).toFixed(2)}</p>
                    <p>6. n = {n} (rounded up)</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Compare with Course Examples */}
          <div>
            <button
              onClick={() => setCompareExamples(!compareExamples)}
              className="mb-4 text-sm text-purple-400 hover:text-purple-300"
            >
              {compareExamples ? 'Hide' : 'Compare with'} Course Examples
            </button>
            
            <AnimatePresence>
              {compareExamples && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {courseExamples.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-neutral-800 rounded-lg p-4 cursor-pointer
                                 hover:bg-neutral-700 transition-colors"
                      onClick={() => setInputs({
                        sigma: ex.sigma,
                        E: ex.E,
                        confidence: ex.confidence
                      })}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-neutral-400">Example {ex.id}</p>
                          <p className="text-xs mt-1">
                            σ = {ex.sigma}, E = {ex.E}, {ex.confidence}% CI
                          </p>
                        </div>
                        <p className="text-xl font-mono text-emerald-400">
                          n = {ex.n}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <ExplorationMode inputs={inputs} setInputs={setInputs} />
      )}
    </VisualizationSection>
  );
};
```

### 4. Cost-Benefit Analysis Tool

```jsx
const CostBenefitAnalysis = () => {
  const [scenario, setScenario] = useState({
    costPerSubject: 50,
    fixedCosts: 5000,
    sigma: 15,
    budgetLimit: 25000,
    minPrecision: 1,
    maxPrecision: 5
  });
  
  const [optimalPoint, setOptimalPoint] = useState(null);
  const svgRef = useRef(null);
  
  // Calculate total cost for given n
  const calculateCost = (n) => {
    return scenario.fixedCosts + (n * scenario.costPerSubject);
  };
  
  // Calculate precision (E) for given n
  const calculatePrecision = (n) => {
    const z = 1.96; // 95% confidence
    return (z * scenario.sigma) / Math.sqrt(n);
  };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    
    svg.selectAll("*").remove();
    
    // Generate data points
    const data = [];
    for (let E = scenario.minPrecision; E <= scenario.maxPrecision; E += 0.1) {
      const n = Math.ceil(Math.pow((1.96 * scenario.sigma) / E, 2));
      const cost = calculateCost(n);
      if (cost <= scenario.budgetLimit) {
        data.push({ E, n, cost });
      }
    }
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([scenario.minPrecision, scenario.maxPrecision])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, scenario.budgetLimit])
      .range([height - margin.bottom, margin.top]);
    
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .text("Margin of Error (E)");
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .text("Total Cost ($)");
    
    // Budget limit line
    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(scenario.budgetLimit))
      .attr("y2", yScale(scenario.budgetLimit))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    // Cost curve
    const line = d3.line()
      .x(d => xScale(d.E))
      .y(d => yScale(d.cost))
      .curve(d3.curveBasis);
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Find optimal point (smallest E within budget)
    if (data.length > 0) {
      const optimal = data[0]; // Smallest E is first
      setOptimalPoint(optimal);
      
      // Highlight optimal point
      svg.append("circle")
        .attr("cx", xScale(optimal.E))
        .attr("cy", yScale(optimal.cost))
        .attr("r", 8)
        .attr("fill", "#10b981")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
      
      // Annotation
      svg.append("text")
        .attr("x", xScale(optimal.E) + 10)
        .attr("y", yScale(optimal.cost) - 10)
        .attr("fill", "white")
        .attr("font-size", "14px")
        .text(`Optimal: E=${optimal.E.toFixed(1)}, n=${optimal.n}`);
    }
  }, [scenario]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Cost-Benefit Analysis
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">Scenario Parameters</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cost per Subject: ${scenario.costPerSubject}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={scenario.costPerSubject}
              onChange={(e) => setScenario({
                ...scenario, 
                costPerSubject: Number(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fixed Costs: ${scenario.fixedCosts}
            </label>
            <input
              type="range"
              min="0"
              max="20000"
              step="1000"
              value={scenario.fixedCosts}
              onChange={(e) => setScenario({
                ...scenario, 
                fixedCosts: Number(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget Limit: ${scenario.budgetLimit}
            </label>
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={scenario.budgetLimit}
              onChange={(e) => setScenario({
                ...scenario, 
                budgetLimit: Number(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          {/* Results Summary */}
          {optimalPoint && (
            <motion.div
              className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h5 className="font-semibold text-emerald-400 mb-2">
                Optimal Solution
              </h5>
              <div className="space-y-1 text-sm">
                <p>Sample Size: n = {optimalPoint.n}</p>
                <p>Margin of Error: E = ±{optimalPoint.E.toFixed(2)}</p>
                <p>Total Cost: ${optimalPoint.cost.toFixed(0)}</p>
                <p>Budget Used: {((optimalPoint.cost / scenario.budgetLimit) * 100).toFixed(0)}%</p>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Visualization */}
        <div>
          <GraphContainer height="400px">
            <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400" />
          </GraphContainer>
          
          <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg text-sm">
            <p className="text-neutral-400 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-neutral-300">
              <li>• Green curve shows total cost vs. precision trade-off</li>
              <li>• Red line indicates budget constraint</li>
              <li>• Optimal point maximizes precision within budget</li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};
```

### 5. Real-World Scenarios

```jsx
const RealWorldScenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState('medical');
  
  const scenarios = {
    medical: {
      title: 'Clinical Trial',
      description: 'Testing a new drug\'s effect on blood pressure',
      icon: Heart,
      color: '#ef4444',
      parameters: {
        sigma: 12, // mmHg
        E: 2, // clinically significant difference
        confidence: 95,
        context: 'FDA requires 95% confidence, 2 mmHg is clinically meaningful'
      },
      considerations: [
        'Patient safety is paramount',
        'Recruitment costs are high',
        'Dropout rate must be considered'
      ]
    },
    manufacturing: {
      title: 'Quality Control',
      description: 'Monitoring product dimensions',
      icon: Factory,
      color: '#3b82f6',
      parameters: {
        sigma: 0.05, // mm
        E: 0.01, // tolerance
        confidence: 99,
        context: 'Six Sigma requires tight tolerances'
      },
      considerations: [
        'Automated measurement is cheap',
        'High volume production',
        'Cost of defects is very high'
      ]
    },
    market: {
      title: 'Market Research',
      description: 'Estimating customer satisfaction',
      icon: TrendingUp,
      color: '#10b981',
      parameters: {
        sigma: 1.2, // satisfaction scale SD
        E: 0.1, // desired precision
        confidence: 90,
        context: 'Business decisions need reasonable confidence'
      },
      considerations: [
        'Survey fatigue affects response',
        'Online surveys are cost-effective',
        'Seasonal variations exist'
      ]
    }
  };
  
  const scenario = scenarios[selectedScenario];
  const n = Math.ceil(Math.pow((getZ(scenario.parameters.confidence) * 
    scenario.parameters.sigma) / scenario.parameters.E, 2));
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Real-World Applications
      </h3>
      
      {/* Scenario Selector */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => {
          const Icon = scen.icon;
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedScenario === key
                  ? 'border-current shadow-lg'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              style={{
                borderColor: selectedScenario === key ? scen.color : undefined,
                backgroundColor: selectedScenario === key 
                  ? `${scen.color}20` 
                  : 'rgb(38 38 38)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" style={{
                color: selectedScenario === key ? scen.color : '#e5e5e5'
              }} />
              <p className="font-semibold">{scen.title}</p>
              <p className="text-xs text-neutral-400 mt-1">{scen.description}</p>
            </motion.button>
          );
        })}
      </div>
      
      {/* Scenario Details */}
      <motion.div
        key={selectedScenario}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-800 rounded-xl p-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Parameters */}
          <div>
            <h4 className="font-semibold text-white mb-4">Study Parameters</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Population SD (σ)</span>
                <span className="font-mono">{scenario.parameters.sigma}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Margin of Error (E)</span>
                <span className="font-mono">±{scenario.parameters.E}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-700">
                <span className="text-neutral-400">Confidence Level</span>
                <span className="font-mono">{scenario.parameters.confidence}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Required Sample Size</span>
                <span className="font-mono text-2xl" style={{ color: scenario.color }}>
                  n = {n}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-neutral-900/50 rounded text-sm">
              <p className="text-neutral-400">Context:</p>
              <p>{scenario.parameters.context}</p>
            </div>
          </div>
          
          {/* Considerations */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              Practical Considerations
            </h4>
            
            <div className="space-y-3">
              {scenario.considerations.map((consideration, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: `${scenario.color}30` }}>
                    <Check className="w-4 h-4" style={{ color: scenario.color }} />
                  </div>
                  <p className="text-sm">{consideration}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: `${scenario.color}10` }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: scenario.color }}>
                Sample Size Recommendation
              </p>
              <p className="text-sm">
                Plan for n = {Math.ceil(n * 1.1)} ({n} + 10% buffer for dropouts)
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </VisualizationSection>
  );
};
```

### 6. Key Implementation Requirements

**State Management:**
```jsx
const [currentStage, setCurrentStage] = useState('discover');
const [completedActivities, setCompletedActivities] = useState(new Set());
const [savedCalculations, setSavedCalculations] = useState([]);
const [userPreferences, setUserPreferences] = useState({
  defaultConfidence: 95,
  costUnit: 'USD',
  precisionUnit: 'absolute'
});
```

**Performance Optimizations:**
- D3 visualizations in separate refs
- Memoize expensive calculations
- Lazy load scenario data
- Debounce slider inputs

**Visual Design System:**
```jsx
const theme = {
  stages: {
    discover: { primary: '#3b82f6', gradient: 'from-blue-600 to-blue-700' },
    calculate: { primary: '#a855f7', gradient: 'from-purple-600 to-purple-700' },
    apply: { primary: '#10b981', gradient: 'from-emerald-600 to-emerald-700' }
  },
  animations: {
    smooth: { duration: 0.5, ease: "easeInOut" },
    bounce: { type: "spring", stiffness: 300, damping: 20 }
  }
};
```

**Learning Path:**
1. **Discover Stage**: Visual exploration of relationships
2. **Calculate Stage**: Master the formula with examples
3. **Apply Stage**: Real-world scenarios and optimization

**Course Integration:**
- All four examples from page 27 must be included
- Show step-by-step calculations
- Connect visual and algebraic representations
- Emphasize the formula: n = (z_α/2 × σ / E)²

**File Location:** `/src/components/05-estimation/5-3-SampleSizeCalculation.jsx`