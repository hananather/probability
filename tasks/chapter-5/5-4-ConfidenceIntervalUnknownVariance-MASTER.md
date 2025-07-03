# MASTER Plan: 5.4 - Confidence Intervals for μ when σ is Unknown
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
Transform the abstract t-distribution into an intuitive concept by showing its connection to the normal distribution and its practical necessity when σ is unknown.

**Core Mandates:**
1. **Visual Comparison:** Always show t vs. normal distributions side-by-side
2. **Degrees of Freedom Focus:** Make df the star - show how t → normal as df increases
3. **Real Data Context:** Use the ozone example to ground abstract concepts
4. **Interactive Discovery:** Let students see the effect of sample size on uncertainty

**CRITICAL: Course Material Alignment (Pages 30-34)**
- Page 30: Introduction to the problem
- Page 31: The t-distribution and its properties
- Page 32-33: Ozone concentration example (n=6, x̄=4.76, s=0.370)
- Page 34: Comparison with known variance case

**Key Course Example:**
Ozone concentrations: {5.4, 4.7, 4.7, 4.5, 4.5, 4.9}
- n = 6, x̄ = 4.76, s = 0.370
- 95% CI: [4.37, 5.15]

**Gold Standard References:**
- **Structure:** `/src/components/06-hypothesis-testing/6-3-1-ErrorsAndPower.jsx`
- **Comparisons:** `/src/components/06-hypothesis-testing/6-9-1-DifferenceOfTwoProportions.jsx`
- **Animations:** Landing page patterns

## Component Architecture

### 1. Progressive Understanding Framework

```jsx
const TDistributionJourney = {
  PROBLEM: {
    id: 'problem',
    title: 'The Unknown σ Problem',
    subtitle: 'Why we need a new approach',
    icon: HelpCircle,
    color: 'yellow',
    sections: ['ProblemStatement', 'NaiveApproach', 'WhyItFails']
  },
  SOLUTION: {
    id: 'solution',
    title: 'Enter the t-Distribution',
    subtitle: 'A distribution that accounts for uncertainty',
    icon: Lightbulb,
    color: 'blue',
    sections: ['TDistributionIntro', 'DegreesOfFreedom', 'TvsNormal']
  },
  APPLICATION: {
    id: 'application',
    title: 'Apply to Real Data',
    subtitle: 'Build confidence intervals with t',
    icon: BarChart,
    color: 'emerald',
    sections: ['OzoneExample', 'InteractiveBuilder', 'Comparison']
  }
};

export default function ConfidenceIntervalUnknownVariance() {
  const [currentSection, setCurrentSection] = useState('problem');
  const [userInsights, setUserInsights] = useState({
    understoodProblem: false,
    sawTConvergence: false,
    completedExample: false
  });
  
  return (
    <VisualizationContainer
      title="5.4 Confidence Intervals (σ Unknown)"
      description="When uncertainty has uncertainty"
    >
      <BackToHub chapter={5} />
      
      {/* Journey Navigator */}
      <JourneyNavigator
        journey={TDistributionJourney}
        currentSection={currentSection}
        userInsights={userInsights}
        onNavigate={setCurrentSection}
      />
      
      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <SectionContent
            section={TDistributionJourney[currentSection]}
            onInsight={(insight) => setUserInsights({
              ...userInsights,
              [insight]: true
            })}
          />
        </motion.div>
      </AnimatePresence>
    </VisualizationContainer>
  );
}
```

### 2. The Problem: Why We Can't Just Use Z

```jsx
const ProblemStatement = () => {
  const [showNaiveApproach, setShowNaiveApproach] = useState(false);
  const [showWhyItFails, setShowWhyItFails] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* The Setup */}
      <motion.div
        className="bg-gradient-to-br from-yellow-900/20 to-neutral-800 
                   rounded-xl p-6 border border-yellow-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          The Reality of Data Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm">In practice, we rarely know σ. We only have:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample data: x₁, x₂, ..., xₙ</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample mean: x̄</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample standard deviation: s</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-neutral-500">Population σ: Unknown!</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <p className="text-sm text-neutral-400 mb-2">The Question:</p>
            <p className="text-lg text-yellow-400">
              Can we just replace σ with s in our confidence interval formula?
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Naive Approach */}
      <motion.button
        onClick={() => setShowNaiveApproach(!showNaiveApproach)}
        className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg
                   text-white font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {showNaiveApproach ? 'Hide' : 'Explore'} the Naive Approach
      </motion.button>
      
      <AnimatePresence>
        {showNaiveApproach && <NaiveApproachDemo onComplete={() => setShowWhyItFails(true)} />}
      </AnimatePresence>
      
      {/* Why It Fails */}
      <AnimatePresence>
        {showWhyItFails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-900/20 rounded-xl p-6 border border-red-500/30"
          >
            <h4 className="font-semibold text-red-400 mb-3">
              Why the Naive Approach Fails
            </h4>
            <div className="space-y-3 text-sm">
              <p>Using s instead of σ introduces additional uncertainty:</p>
              <ul className="space-y-2 ml-4">
                <li>• s is just an estimate of σ</li>
                <li>• s varies from sample to sample</li>
                <li>• Small samples → s is less reliable</li>
                <li>• Result: Coverage probability < claimed confidence level!</li>
              </ul>
              <motion.p
                className="mt-4 text-red-400 font-semibold text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                We need a distribution that accounts for this extra uncertainty!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### 3. The t-Distribution Interactive Explorer

```jsx
const TDistributionExplorer = () => {
  const svgRef = useRef(null);
  const [df, setDf] = useState(5);
  const [showComparison, setShowComparison] = useState(true);
  const [highlightTails, setHighlightTails] = useState(false);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    
    svg.selectAll("*").remove();
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height - margin.bottom, margin.top]);
    
    // Normal distribution
    const normal = (x) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    };
    
    // t-distribution
    const tDist = (x, df) => {
      const gamma = (n) => {
        // Simplified gamma function for visualization
        return Math.sqrt(Math.PI) * Math.pow(2, (n-1)/2) * factorial((n-1)/2);
      };
      
      const numerator = gamma((df + 1) / 2);
      const denominator = Math.sqrt(df * Math.PI) * gamma(df / 2);
      const base = Math.pow(1 + (x * x) / df, -(df + 1) / 2);
      
      return (numerator / denominator) * base;
    };
    
    // Generate data
    const xValues = d3.range(-4, 4.1, 0.1);
    const normalData = xValues.map(x => ({ x, y: normal(x) }));
    const tData = xValues.map(x => ({ x, y: tDist(x, df) }));
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw normal distribution
    if (showComparison) {
      svg.append("path")
        .datum(normalData)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", line);
      
      // Normal legend
      svg.append("text")
        .attr("x", width - margin.right - 100)
        .attr("y", margin.top)
        .attr("fill", "#3b82f6")
        .attr("font-size", "14px")
        .text("Normal(0,1)");
    }
    
    // Draw t-distribution
    const tPath = svg.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate t-distribution
    const totalLength = tPath.node().getTotalLength();
    tPath
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);
    
    // t legend
    svg.append("text")
      .attr("x", width - margin.right - 100)
      .attr("y", margin.top + 20)
      .attr("fill", "#10b981")
      .attr("font-size", "14px")
      .text(`t(${df})`);
    
    // Highlight tails if requested
    if (highlightTails) {
      // Shade tail areas
      const tailCutoff = 2;
      
      // Left tail
      const leftTailData = tData.filter(d => d.x <= -tailCutoff);
      const areaLeft = d3.area()
        .x(d => xScale(d.x))
        .y0(yScale(0))
        .y1(d => yScale(d.y));
      
      svg.append("path")
        .datum(leftTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .attr("d", areaLeft);
      
      // Right tail
      const rightTailData = tData.filter(d => d.x >= tailCutoff);
      svg.append("path")
        .datum(rightTailData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .attr("d", areaLeft);
      
      // Annotation
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .attr("font-size", "12px")
        .text("Heavier tails = more extreme values");
    }
    
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  }, [df, showComparison, highlightTails]);
  
  return (
    <VisualizationSection>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">The t-Distribution</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 rounded text-sm ${
              showComparison 
                ? 'bg-blue-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Compare to Normal
          </button>
          <button
            onClick={() => setHighlightTails(!highlightTails)}
            className={`px-3 py-1 rounded text-sm ${
              highlightTails 
                ? 'bg-red-600 text-white' 
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Show Tails
          </button>
        </div>
      </div>
      
      {/* Degrees of Freedom Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Degrees of Freedom (df = n - 1): {df}
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={df}
          onChange={(e) => setDf(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Heavy tails</span>
          <span>df = {df}</span>
          <span>→ Normal</span>
        </div>
      </div>
      
      {/* Visualization */}
      <GraphContainer height="400px">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400" />
      </GraphContainer>
      
      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <InsightCard
          icon={AlertTriangle}
          title="Heavier Tails"
          description="More probability in extremes than normal"
          color="red"
          visible={df < 10}
        />
        <InsightCard
          icon={TrendingUp}
          title="Convergence"
          description={`At df=${df}, t is ${df < 30 ? 'noticeably different from' : 'almost identical to'} normal`}
          color="emerald"
          visible={true}
        />
        <InsightCard
          icon={Calculator}
          title="Critical Values"
          description={`t₀.₀₂₅,${df} = ${tCritical(0.025, df).toFixed(3)} vs z = 1.96`}
          color="blue"
          visible={true}
        />
      </div>
    </VisualizationSection>
  );
};
```

### 4. Ozone Example - Step by Step

```jsx
const OzoneExample = React.memo(function OzoneExample() {
  const contentRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Course data
  const data = [5.4, 4.7, 4.7, 4.5, 4.5, 4.9];
  const n = 6;
  const xBar = 4.783; // More precise than course's 4.76
  const s = 0.370;
  const df = n - 1;
  const tCrit = 2.571; // t₀.₀₂₅,₅
  const se = s / Math.sqrt(n);
  const margin = tCrit * se;
  const ciLower = xBar - margin;
  const ciUpper = xBar + margin;
  
  const steps = [
    {
      title: "1. Collect Data",
      content: "Ozone concentrations (ppm) from 6 measurements",
      visual: <DataPointsVisualization data={data} />
    },
    {
      title: "2. Calculate Statistics",
      content: "Find x̄ and s from the sample",
      visual: <StatisticsCalculation data={data} xBar={xBar} s={s} />
    },
    {
      title: "3. Find Critical Value",
      content: `For 95% CI with df = ${df}, t₀.₀₂₅,₅ = ${tCrit}`,
      visual: <TCriticalVisualization df={df} alpha={0.05} />
    },
    {
      title: "4. Build Interval",
      content: `CI = x̄ ± t × (s/√n)`,
      visual: <IntervalConstruction xBar={xBar} margin={margin} />
    }
  ];
  
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
  }, [currentStep]);
  
  return (
    <div ref={contentRef} className="space-y-6">
      <motion.div
        className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                   rounded-xl p-6 border border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-emerald-400 mb-4">
          Real Example: Ozone Concentrations
        </h3>
        
        <p className="text-sm text-neutral-300 mb-4">
          Environmental scientists measure ozone levels to assess air quality.
          With only 6 measurements, can we estimate the true mean concentration?
        </p>
        
        {/* Step Navigator */}
        <div className="flex gap-2 mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                currentStep === idx
                  ? 'bg-emerald-600 text-white'
                  : currentStep > idx
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        
        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white">
              {steps[currentStep].title}
            </h4>
            <p className="text-sm text-neutral-300">
              {steps[currentStep].content}
            </p>
            <div className="bg-neutral-900/50 rounded-lg p-4">
              {steps[currentStep].visual}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Final Result */}
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-emerald-900/30 rounded-lg border border-emerald-500/50"
          >
            <p className="text-sm text-neutral-400 mb-2">95% Confidence Interval:</p>
            <p className="text-2xl font-mono text-emerald-400 text-center">
              [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}] ppm
            </p>
            <p className="text-sm text-neutral-300 mt-3 text-center">
              We are 95% confident the true mean ozone concentration 
              is between {ciLower.toFixed(2)} and {ciUpper.toFixed(2)} ppm.
            </p>
          </motion.div>
        )}
        
        {/* Detailed Calculation */}
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
        >
          {showCalculation ? 'Hide' : 'Show'} Detailed Calculation
        </button>
        
        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 text-sm font-mono"
            >
              <p>Data: {data.join(', ')}</p>
              <p>n = {n}, df = {df}</p>
              <p>x̄ = {xBar.toFixed(3)}</p>
              <p>s = {s}</p>
              <p>SE = s/√n = {s}/√{n} = {se.toFixed(3)}</p>
              <p>t₀.₀₂₅,₅ = {tCrit}</p>
              <p>Margin = {tCrit} × {se.toFixed(3)} = {margin.toFixed(3)}</p>
              <p>CI = {xBar.toFixed(3)} ± {margin.toFixed(3)}</p>
              <p>CI = [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
```

### 5. Interactive CI Builder with Comparison

```jsx
const InteractiveCIComparison = () => {
  const [params, setParams] = useState({
    n: 10,
    xBar: 50,
    s: 10,
    confidence: 95,
    sigmaKnown: false,
    sigma: 10 // For comparison
  });
  
  const [showBoth, setShowBoth] = useState(true);
  
  // Calculate CIs
  const calculateCI = (useT) => {
    const alpha = 1 - params.confidence / 100;
    const df = params.n - 1;
    
    if (useT) {
      const t = tCritical(alpha / 2, df);
      const se = params.s / Math.sqrt(params.n);
      const margin = t * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: t,
        se,
        margin,
        type: 't'
      };
    } else {
      const z = zCritical(alpha / 2);
      const se = params.sigma / Math.sqrt(params.n);
      const margin = z * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: z,
        se,
        margin,
        type: 'z'
      };
    }
  };
  
  const tCI = calculateCI(true);
  const zCI = calculateCI(false);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">
        Build and Compare Confidence Intervals
      </h3>
      
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">Sample Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Size (n): {params.n}
            </label>
            <input
              type="range"
              min="3"
              max="50"
              value={params.n}
              onChange={(e) => setParams({...params, n: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Mean (x̄): {params.xBar}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={params.xBar}
              onChange={(e) => setParams({...params, xBar: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample SD (s): {params.s}
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={params.s}
              onChange={(e) => setParams({...params, s: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-400">Comparison Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confidence Level: {params.confidence}%
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[90, 95, 98, 99].map(level => (
                <button
                  key={level}
                  onClick={() => setParams({...params, confidence: level})}
                  className={`py-1 rounded text-sm ${
                    params.confidence === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showBoth"
              checked={showBoth}
              onChange={(e) => setShowBoth(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showBoth" className="text-sm">
              Compare with known σ case (σ = {params.sigma})
            </label>
          </div>
        </div>
      </div>
      
      {/* Results Comparison */}
      <div className={`grid ${showBoth ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        {/* t-based CI */}
        <motion.div
          className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                     rounded-xl p-6 border border-emerald-500/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h5 className="font-semibold text-emerald-400 mb-4">
            σ Unknown (t-distribution)
          </h5>
          
          <div className="space-y-3">
            <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
              <p className="text-sm text-neutral-400 mb-1">
                {params.confidence}% Confidence Interval
              </p>
              <p className="text-2xl font-mono text-emerald-400">
                [{tCI.lower.toFixed(2)}, {tCI.upper.toFixed(2)}]
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Width: {(tCI.upper - tCI.lower).toFixed(2)}
              </p>
            </div>
            
            <div className="text-sm space-y-1">
              <p>Critical value: t₀.₀₂₅,{params.n-1} = {tCI.critical.toFixed(3)}</p>
              <p>Standard error: {tCI.se.toFixed(3)}</p>
              <p>Margin of error: {tCI.margin.toFixed(3)}</p>
            </div>
          </div>
        </motion.div>
        
        {/* z-based CI for comparison */}
        {showBoth && (
          <motion.div
            className="bg-gradient-to-br from-blue-900/20 to-neutral-800 
                       rounded-xl p-6 border border-blue-500/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h5 className="font-semibold text-blue-400 mb-4">
              σ Known (z-distribution)
            </h5>
            
            <div className="space-y-3">
              <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">
                  {params.confidence}% Confidence Interval
                </p>
                <p className="text-2xl font-mono text-blue-400">
                  [{zCI.lower.toFixed(2)}, {zCI.upper.toFixed(2)}]
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Width: {(zCI.upper - zCI.lower).toFixed(2)}
                </p>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Critical value: z₀.₀₂₅ = {zCI.critical.toFixed(3)}</p>
                <p>Standard error: {zCI.se.toFixed(3)}</p>
                <p>Margin of error: {zCI.margin.toFixed(3)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Visual Comparison */}
      {showBoth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <IntervalComparisonVisualization
            tCI={tCI}
            zCI={zCI}
            xBar={params.xBar}
          />
        </motion.div>
      )}
      
      {/* Key Insight */}
      <motion.div
        className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-yellow-400">
          <strong>Key Insight:</strong> The t-based interval is always wider than 
          the z-based interval because it accounts for the additional uncertainty 
          of estimating σ with s. This difference is most pronounced for small samples 
          (n < 30).
        </p>
      </motion.div>
    </VisualizationSection>
  );
};
```

### 6. Key Implementation Requirements

**State Management:**
```jsx
const [currentSection, setCurrentSection] = useState('problem');
const [userInsights, setUserInsights] = useState({
  understoodProblem: false,
  sawTConvergence: false,
  completedExample: false
});
const [comparisonMode, setComparisonMode] = useState(true);
const [savedCalculations, setSavedCalculations] = useState([]);
```

**Performance Optimizations:**
- Memoize t-distribution calculations
- Use refs for D3 visualizations
- Lazy load heavy comparisons
- Cache critical values

**Visual Design System:**
```jsx
const theme = {
  sections: {
    problem: { primary: '#eab308', gradient: 'from-yellow-600 to-yellow-700' },
    solution: { primary: '#3b82f6', gradient: 'from-blue-600 to-blue-700' },
    application: { primary: '#10b981', gradient: 'from-emerald-600 to-emerald-700' }
  },
  distributions: {
    normal: { color: '#3b82f6', dash: '5,5' },
    t: { color: '#10b981', width: 3 }
  }
};
```

**Course Integration:**
- Use exact ozone data from pages 32-33
- Show all calculation steps
- Emphasize df = n - 1
- Compare t and z critical values
- Highlight when t ≈ z (large samples)

**Mathematical Functions:**
```jsx
// t-critical value (simplified for demo)
const tCritical = (alpha, df) => {
  // Use lookup table or approximation
  const table = {
    5: { 0.025: 2.571 },
    10: { 0.025: 2.228 },
    20: { 0.025: 2.086 },
    30: { 0.025: 2.042 }
  };
  // Return appropriate value or use approximation
};
```

**File Location:** `/src/components/05-estimation/5-4-ConfidenceIntervalUnknownVariance.jsx`