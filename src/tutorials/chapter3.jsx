// Chapter 3 Tutorial Content
// Academic tone, concise explanations focused on continuous probability concepts

export const tutorial_3_0_1 = [
  {
    title: "From Discrete to Continuous",
    content: (
      <div className="space-y-3">
        <p className="text-base">Moving from <em className="text-blue-400">counting</em> to <em className="text-green-400">measuring</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">lim P(X = x) → f(x)dx</p>
          <p className="text-sm text-neutral-400 text-center">
            As bins shrink, histograms become smooth curves
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            Continuous RVs have zero probability at any single point - we measure probability over intervals!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "The Histogram Transformation",
    content: (
      <div className="space-y-3">
        <p>Watch how increasing bin count reveals the underlying distribution:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Adjust bin count:</strong> Use the slider to change granularity
              <p className="text-xs text-neutral-500">More bins = smoother approximation</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📈</span>
            <div>
              <strong>Observe convergence:</strong> Histogram approaches the true PDF
              <p className="text-xs text-neutral-500">The smooth curve is the limit</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🎯</span>
            <div>
              <strong>Select intervals:</strong> Drag to highlight regions
              <p className="text-xs text-neutral-500">Area under curve = probability</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Increase bins from 5 to 50 and watch the magic!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "The Fundamental Difference",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Discrete vs Continuous probabilities:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Discrete (PMF)</p>
            <p className="font-mono text-xs mt-1">P(X = x) {'>'}0</p>
            <p className="text-xs text-neutral-500 mt-1">Heights are probabilities</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Continuous (PDF)</p>
            <p className="font-mono text-xs mt-1">P(X = x) = 0</p>
            <p className="text-xs text-neutral-500 mt-1">Areas are probabilities</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">⚠️ Important:</p>
          <p className="text-xs text-neutral-300">
            PDF values can exceed 1! They're density, not probability.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Understanding Area as Probability",
    content: (
      <div className="space-y-3">
        <p className="text-base">For continuous RVs, probability is area:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">P(a ≤ X ≤ b) = ∫ᵇₐ f(x)dx</p>
          <p className="text-sm text-neutral-300 text-center">
            Integration replaces summation
          </p>
        </div>
        <div className="space-y-2 text-sm mt-3">
          <p className="text-neutral-300">This means:</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Single points have zero area → zero probability</li>
            <li>• Only intervals have positive probability</li>
            <li>• Total area under PDF must equal 1</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Exploring Different Scales",
    content: (
      <div className="space-y-3">
        <p className="text-base">Try these experiments:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Fine granularity:</strong>
            <p className="text-xs text-neutral-400 mt-1">Set bins to 40-50, see smooth approximation</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Coarse granularity:</strong>
            <p className="text-xs text-neutral-400 mt-1">Set bins to 5-10, see discrete-like behavior</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Probability calculation:</strong>
            <p className="text-xs text-neutral-400 mt-1">Select different intervals, compare areas</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Challenge:</strong> Find an interval with exactly 50% probability!
        </p>
      </div>
    )
  }
];

export const tutorial_3_1_1 = [
  {
    title: "Probability Density Functions",
    content: (
      <div className="space-y-3">
        <p className="text-base">A PDF <em className="text-cyan-400">f(x)</em> describes probability density:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <div className="space-y-2 text-center">
            <p className="font-mono text-sm">f(x) ≥ 0 for all x</p>
            <p className="font-mono text-sm">∫_{'{'}-∞{'}'}^{'{'}∞{'}'} f(x)dx = 1</p>
          </div>
          <p className="text-sm text-neutral-400 text-center mt-2">
            Density at a point × width = probability
          </p>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          PDFs are the continuous analog of probability mass functions (PMFs)
        </p>
      </div>
    )
  },
  {
    title: "Exploring Common Distributions",
    content: (
      <div className="space-y-3">
        <p>Each distribution models different phenomena:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Normal:</strong> Natural variation, measurement errors
              <p className="text-xs text-neutral-500">Bell curve - most common in nature</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">⏱️</span>
            <div>
              <strong>Exponential:</strong> Time between events
              <p className="text-xs text-neutral-500">Memoryless property - unique!</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🎲</span>
            <div>
              <strong>Uniform:</strong> Equal likelihood over range
              <p className="text-xs text-neutral-500">Simplest continuous distribution</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Switch between distributions and observe their shapes!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Understanding Parameters",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Parameters control distribution shape:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Location (μ)</p>
            <p className="text-xs text-neutral-400">Shifts left/right</p>
            <p className="font-mono text-xs mt-1">Center of distribution</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Scale (σ, λ)</p>
            <p className="text-xs text-neutral-400">Stretches/compresses</p>
            <p className="font-mono text-xs mt-1">Spread or rate</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Adjust parameters and watch the PDF transform!
        </p>
      </div>
    )
  },
  {
    title: "Area Under the Curve",
    content: (
      <div className="space-y-3">
        <p className="text-base">Calculating probabilities visually:</p>
        <div className="bg-neutral-800 p-3 rounded space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Drag interval</span>
            <span className="text-cyan-400">→</span>
            <span className="text-neutral-300">Select region</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Shaded area</span>
            <span className="text-green-400">→</span>
            <span className="text-neutral-300">Shows probability</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Integration</span>
            <span className="text-yellow-400">→</span>
            <span className="text-neutral-300">Exact calculation</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-purple-900/30 border border-purple-500/50 rounded">
          <p className="text-xs text-purple-300">
            <strong>Remember:</strong> P(X = x) = 0, but P(a ≤ X ≤ b) {'>'} 0
          </p>
        </div>
      </div>
    )
  },
  {
    title: "The CDF Connection",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">PDF and CDF are related:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-sm mb-2">F(x) = ∫_{'{'}-∞{'}'}^x f(t)dt</p>
          <p className="text-center font-mono text-sm">f(x) = dF(x)/dx</p>
          <p className="text-sm text-neutral-300 text-center mt-2">
            CDF is the accumulated area under PDF
          </p>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Toggle CDF view to see cumulative probabilities!
        </p>
      </div>
    )
  }
];

export const tutorial_3_1_2 = [
  {
    title: "Calculating Probabilities with Integrals",
    content: (
      <div className="space-y-3">
        <p className="text-base">For continuous RVs, we <em className="text-cyan-400">integrate</em> to find probabilities:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">P(a ≤ X ≤ b) = ∫ᵇₐ f(x)dx</p>
          <p className="text-sm text-neutral-400 text-center">
            This integral gives the area under the PDF curve
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Two Methods:</p>
          <p className="text-xs text-neutral-300">
            1. Direct integration of PDF<br/>
            2. Using CDF: F(b) - F(a)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Step-by-Step Integration",
    content: (
      <div className="space-y-3">
        <p>This example shows the complete calculation process:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">1️⃣</span>
            <div>
              <strong>Setup:</strong> Write the integral with limits
              <p className="text-xs text-neutral-500">Define the probability we want</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">2️⃣</span>
            <div>
              <strong>Substitute:</strong> Insert the PDF formula
              <p className="text-xs text-neutral-500">Use the specific distribution's f(x)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">3️⃣</span>
            <div>
              <strong>Evaluate:</strong> Calculate or use CDF
              <p className="text-xs text-neutral-500">Get the numerical result</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The CDF Method",
    content: (
      <div className="space-y-3">
        <p className="text-base">Often easier: use the cumulative distribution function</p>
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">P(a ≤ X ≤ b) = CDF(b) - CDF(a)</p>
          <p className="text-sm text-neutral-300 text-center">
            Subtract cumulative probabilities
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Why this works:</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            <li>• CDF(b) = P(X ≤ b) includes too much</li>
            <li>• CDF(a) = P(X ≤ a) is the excess</li>
            <li>• Difference gives P(a ≤ X ≤ b)</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Common Distribution CDFs",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Some distributions have known CDFs:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Normal:</strong> Use Φ(z) tables
            <p className="text-xs text-neutral-400 mt-1">Standard normal CDF is tabulated</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Exponential:</strong> 1 - e^(-λx)
            <p className="text-xs text-neutral-400 mt-1">Simple closed-form expression</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Uniform:</strong> (x-a)/(b-a)
            <p className="text-xs text-neutral-400 mt-1">Linear CDF function</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Practical Tips",
    content: (
      <div className="space-y-3">
        <p className="text-base">When solving probability problems:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Use CDF when:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• CDF is known/tabulated</li>
              <li>• Integration is complex</li>
              <li>• Need quick results</li>
            </ul>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Integrate when:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• PDF is simple</li>
              <li>• Learning concepts</li>
              <li>• CDF unavailable</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Remember:</strong> Both methods give the same answer!
        </p>
      </div>
    )
  }
];

export const tutorial_3_2_1 = [
  {
    title: "Expectation for Continuous RVs",
    content: (
      <div className="space-y-3">
        <p className="text-base">The expected value extends to continuous distributions:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">E[X] = ∫_{'{'}-∞{'}'}^{'{'}∞{'}'} x·f(x)dx</p>
          <p className="text-sm text-neutral-400 text-center">
            Weighted average using density instead of probability
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            Integration replaces summation, f(x)dx replaces P(X=x)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Density Shaping",
    content: (
      <div className="space-y-3">
        <p>Shape custom PDFs and see their properties:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🎨</span>
            <div>
              <strong>Draw density:</strong> Click and drag to create curves
              <p className="text-xs text-neutral-500">Auto-normalizes to integrate to 1</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>See calculations:</strong> E[X] and Var(X) update live
              <p className="text-xs text-neutral-500">Numerical integration in action</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">⚖️</span>
            <div>
              <strong>Balance point:</strong> Red line shows E[X]
              <p className="text-xs text-neutral-500">The "center of mass" of the distribution</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Create a skewed distribution and observe E[X]!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Variance for Continuous RVs",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Variance measures spread around the mean:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-sm mb-2">Var(X) = E[(X-μ)²]</p>
          <p className="text-center font-mono text-sm">= ∫_{'{'}{'{'}-∞{'}'}^{'{'}∞{'}'} (x-μ)²·f(x)dx</p>
          <p className="text-sm text-neutral-300 text-center mt-2">
            Average squared deviation from mean
          </p>
        </div>
        <div className="mt-3 text-sm">
          <p className="text-neutral-300">Alternative formula:</p>
          <p className="font-mono text-xs bg-neutral-800 p-2 rounded mt-1">
            Var(X) = E[X²] - (E[X])²
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Properties of Common Distributions",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Expected values and variances:</p>
        <div className="space-y-2">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm">Normal(μ, σ²)</p>
            <p className="font-mono text-xs mt-1">E[X] = μ, Var(X) = σ²</p>
            <p className="text-xs text-neutral-500">Parameters directly give mean and variance</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm">Exponential(λ)</p>
            <p className="font-mono text-xs mt-1">E[X] = 1/λ, Var(X) = 1/λ²</p>
            <p className="text-xs text-neutral-500">Mean equals standard deviation</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm">Uniform(a, b)</p>
            <p className="font-mono text-xs mt-1">E[X] = (a+b)/2, Var(X) = (b-a)²/12</p>
            <p className="text-xs text-neutral-500">Mean at midpoint, variance depends on range</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Understanding Through Experimentation",
    content: (
      <div className="space-y-3">
        <p className="text-base">Explore these concepts:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Symmetric distributions:</strong>
            <p className="text-xs text-neutral-400 mt-1">Create symmetric PDF → E[X] at center</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Skewed distributions:</strong>
            <p className="text-xs text-neutral-400 mt-1">Create skewed PDF → E[X] pulled toward tail</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Spread effects:</strong>
            <p className="text-xs text-neutral-400 mt-1">Wider distribution → larger variance</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Challenge:</strong> Create a PDF with E[X] = 0 and Var(X) = 1!
        </p>
      </div>
    )
  }
];

export const tutorial_3_3_1 = [
  {
    title: "The Standard Normal Distribution",
    content: (
      <div className="space-y-3">
        <p className="text-base">The <em className="text-cyan-400">Z-score</em> standardizes any normal distribution:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">Z = (X - μ) / σ</p>
          <p className="text-sm text-neutral-400 text-center">
            Converts any normal to standard normal N(0,1)
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Why standardize?</p>
          <p className="text-xs text-neutral-300">
            One table (Z-table) works for ALL normal distributions!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Z-Score Exploration",
    content: (
      <div className="space-y-3">
        <p>Understand the transformation visually:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📏</span>
            <div>
              <strong>Original scale:</strong> Shows X values with μ and σ
              <p className="text-xs text-neutral-500">Your actual data distribution</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong>Standard scale:</strong> Shows Z values (0, 1)
              <p className="text-xs text-neutral-500">Universal reference distribution</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">↔️</span>
            <div>
              <strong>Dual sliders:</strong> Move X or Z - they're linked!
              <p className="text-xs text-neutral-500">See the conversion in real-time</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Set X to μ + σ. What's the Z-score?
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Z-Score Interpretation",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">What Z-scores tell us:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Z = 0</p>
            <p className="text-xs text-neutral-400">At the mean</p>
            <p className="font-mono text-xs mt-1">50th percentile</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Z = ±1</p>
            <p className="text-xs text-neutral-400">One σ from mean</p>
            <p className="font-mono text-xs mt-1">~68% within</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Z = ±2</p>
            <p className="text-xs text-neutral-400">Two σ from mean</p>
            <p className="font-mono text-xs mt-1">~95% within</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Z = ±3</p>
            <p className="text-xs text-neutral-400">Three σ from mean</p>
            <p className="font-mono text-xs mt-1">~99.7% within</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Using Z-Tables",
    content: (
      <div className="space-y-3">
        <p className="text-base">Z-tables give cumulative probabilities:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">P(Z ≤ z) = Φ(z)</p>
          <p className="text-sm text-neutral-300 text-center">
            Area to the left of z under standard normal
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Common lookups:</p>
          <ul className="space-y-1 text-xs text-neutral-400 font-mono">
            <li>• Φ(0) = 0.5000</li>
            <li>• Φ(1) = 0.8413</li>
            <li>• Φ(1.96) = 0.9750</li>
            <li>• Φ(2.58) = 0.9951</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Practical Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base">Z-scores in engineering:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Quality Control:</strong>
            <p className="text-xs text-neutral-400 mt-1">How many σ from spec limits?</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Process Capability:</strong>
            <p className="text-xs text-neutral-400 mt-1">Cpk uses Z-score concepts</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Outlier Detection:</strong>
            <p className="text-xs text-neutral-400 mt-1">|Z| {'>'} 3 often considered outliers</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Master Z-scores - they're everywhere in statistics!
        </p>
      </div>
    )
  }
];

export const tutorial_3_3_2 = [
  {
    title: "Z-Score Worked Example",
    content: (
      <div className="space-y-3">
        <p className="text-base">Step-by-step problem solving with Z-scores:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400 mb-2">Given: Test scores ~ N(75, 10²)</p>
          <p className="text-sm text-neutral-400">Find: P(X {'>'} 85)</p>
          <p className="text-cyan-400 font-mono text-sm text-center mt-3">
            Z = (85 - 75) / 10 = 1.0
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Problem-solving pattern:</p>
          <p className="text-xs text-neutral-300">
            1. Identify μ and σ<br/>
            2. Calculate Z-score<br/>
            3. Use Z-table or calculator
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Problem Solving",
    content: (
      <div className="space-y-3">
        <p>Work through problems with visual feedback:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Problem selection:</strong> Choose from common scenarios
              <p className="text-xs text-neutral-500">Manufacturing, testing, measurements</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong>Visual solution:</strong> See each step graphically
              <p className="text-xs text-neutral-500">Distribution shifts and areas highlighted</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">✅</span>
            <div>
              <strong>Check your work:</strong> Compare with solution
              <p className="text-xs text-neutral-500">Common mistakes explained</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Solve a problem step-by-step!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Types of Probability Questions",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Four common question types:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">P(X {'<'} a)</p>
            <p className="text-xs text-neutral-400">Direct Z-table lookup</p>
            <p className="font-mono text-xs mt-1">Φ(z)</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">P(X {'>'} a)</p>
            <p className="text-xs text-neutral-400">Complement rule</p>
            <p className="font-mono text-xs mt-1">1 - Φ(z)</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">P(a {'<'} X {'<'} b)</p>
            <p className="text-xs text-neutral-400">Difference of CDFs</p>
            <p className="font-mono text-xs mt-1">Φ(z₂) - Φ(z₁)</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Find x given P</p>
            <p className="text-xs text-neutral-400">Inverse lookup</p>
            <p className="font-mono text-xs mt-1">x = μ + zσ</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Working Backwards",
    content: (
      <div className="space-y-3">
        <p className="text-base">Finding values from probabilities:</p>
        <div className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 mb-2">Given: P(X {'>'} x) = 0.10</p>
          <p className="text-sm text-neutral-300">Find: x</p>
          <p className="text-center font-mono text-sm mt-3">
            1. P(X ≤ x) = 0.90<br/>
            2. z = 1.28 (from table)<br/>
            3. x = μ + 1.28σ
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Percentile connections:</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            <li>• 90th percentile → z = 1.28</li>
            <li>• 95th percentile → z = 1.645</li>
            <li>• 99th percentile → z = 2.33</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Common Pitfalls",
    content: (
      <div className="space-y-3">
        <p className="text-base">Avoid these mistakes:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-red-900/20 p-2 rounded border-l-4 border-red-500">
            <strong className="text-red-400">Wrong direction:</strong>
            <p className="text-xs text-neutral-400 mt-1">P(X {'>'} a) ≠ Φ(z), use 1 - Φ(z)</p>
          </div>
          <div className="bg-red-900/20 p-2 rounded border-l-4 border-red-500">
            <strong className="text-red-400">Forgetting to standardize:</strong>
            <p className="text-xs text-neutral-400 mt-1">Can't use X directly in Z-table</p>
          </div>
          <div className="bg-red-900/20 p-2 rounded border-l-4 border-red-500">
            <strong className="text-red-400">Sign errors:</strong>
            <p className="text-xs text-neutral-400 mt-1">Z can be negative! Check carefully</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Always sketch the problem first!
        </p>
      </div>
    )
  }
];

export const tutorial_3_3_3 = [
  {
    title: "The 68-95-99.7 Rule",
    content: (
      <div className="space-y-3">
        <p className="text-base">The <em className="text-cyan-400">Empirical Rule</em> for normal distributions:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <div className="space-y-2 text-center">
            <p className="font-mono text-sm">μ ± 1σ contains 68% of data</p>
            <p className="font-mono text-sm">μ ± 2σ contains 95% of data</p>
            <p className="font-mono text-sm">μ ± 3σ contains 99.7% of data</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Quick mental math:</p>
          <p className="text-xs text-neutral-300">
            No Z-table needed for these common ranges!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Visual Understanding",
    content: (
      <div className="space-y-3">
        <p>See the rule in action:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🎯</span>
            <div>
              <strong>Interactive bands:</strong> Click σ levels to highlight
              <p className="text-xs text-neutral-500">See exact areas for each range</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Cumulative view:</strong> Build up from center
              <p className="text-xs text-neutral-500">68% → 95% → 99.7%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🔢</span>
            <div>
              <strong>Real examples:</strong> Apply to actual datasets
              <p className="text-xs text-neutral-500">Heights, test scores, measurements</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Remember: This ONLY works for normal distributions!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Practical Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Using the Empirical Rule:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Quality Control</p>
            <p className="text-xs text-neutral-400">3σ limits catch 99.7%</p>
            <p className="text-xs text-neutral-500 mt-1">0.3% false alarms</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Grading Curves</p>
            <p className="text-xs text-neutral-400">μ ± σ for B range</p>
            <p className="text-xs text-neutral-500 mt-1">Natural breakpoints</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Outlier Detection</p>
            <p className="text-xs text-neutral-400">Beyond 3σ is rare</p>
            <p className="text-xs text-neutral-500 mt-1">0.3% probability</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Estimation</p>
            <p className="text-xs text-neutral-400">Quick probability</p>
            <p className="text-xs text-neutral-500 mt-1">No calculation needed</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Beyond the Basic Rule",
    content: (
      <div className="space-y-3">
        <p className="text-base">More precise values:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <div className="space-y-1 text-sm font-mono">
            <p>μ ± 1σ: 68.27%</p>
            <p>μ ± 1.96σ: 95.00%</p>
            <p>μ ± 2σ: 95.45%</p>
            <p>μ ± 2.58σ: 99.00%</p>
            <p>μ ± 3σ: 99.73%</p>
          </div>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Engineering note:</p>
          <p className="text-xs text-neutral-400">
            Six Sigma quality means μ ± 6σ specification limits!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Quick Problem Solving",
    content: (
      <div className="space-y-3">
        <p className="text-base">Using the rule for estimates:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Example: IQ ~ N(100, 15²)</strong>
            <p className="text-xs text-neutral-400 mt-1">
              68% between 85-115<br/>
              95% between 70-130<br/>
              99.7% between 55-145
            </p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Reverse: Find unusual events</strong>
            <p className="text-xs text-neutral-400 mt-1">
              Outside 2σ: ~5% (unusual)<br/>
              Outside 3σ: ~0.3% (very rare)
            </p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Practice:</strong> Memorize 68-95-99.7 for quick calculations!
        </p>
      </div>
    )
  }
];

export const tutorial_3_3_4 = [
  {
    title: "Using Z-Tables",
    content: (
      <div className="space-y-3">
        <p className="text-base">Z-tables provide <em className="text-cyan-400">cumulative probabilities</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">Table value = P(Z ≤ z) = Φ(z)</p>
          <p className="text-sm text-neutral-400 text-center">
            Area to the LEFT of z-value
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key insight:</p>
          <p className="text-xs text-neutral-300">
            Tables give LEFT-tail probabilities. For right-tail, use 1 - Φ(z)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Table Navigation",
    content: (
      <div className="space-y-3">
        <p>Master table lookups with practice:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Row selection:</strong> First decimal place (e.g., 1.2)
              <p className="text-xs text-neutral-500">Tens and units of z</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📍</span>
            <div>
              <strong>Column selection:</strong> Second decimal (e.g., 0.05)
              <p className="text-xs text-neutral-500">Hundredths place of z</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🎯</span>
            <div>
              <strong>Intersection:</strong> Your probability!
              <p className="text-xs text-neutral-500">Highlighted for clarity</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Look up Φ(1.96) - a critical value!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Common Table Operations",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Four essential skills:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Forward lookup</p>
            <p className="text-xs text-neutral-400">z → probability</p>
            <p className="font-mono text-xs mt-1">Φ(1.5) = 0.9332</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Reverse lookup</p>
            <p className="text-xs text-neutral-400">probability → z</p>
            <p className="font-mono text-xs mt-1">Φ⁻¹(0.95) = 1.645</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Negative z</p>
            <p className="text-xs text-neutral-400">Use symmetry</p>
            <p className="font-mono text-xs mt-1">Φ(-z) = 1-Φ(z)</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Interpolation</p>
            <p className="text-xs text-neutral-400">Between values</p>
            <p className="font-mono text-xs mt-1">Linear estimate</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Critical Values to Memorize",
    content: (
      <div className="space-y-3">
        <p className="text-base">Important z-values for confidence intervals:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span>90% CI:</span>
              <span className="font-mono text-cyan-400">z = ±1.645</span>
            </p>
            <p className="flex justify-between">
              <span>95% CI:</span>
              <span className="font-mono text-cyan-400">z = ±1.96</span>
            </p>
            <p className="flex justify-between">
              <span>99% CI:</span>
              <span className="font-mono text-cyan-400">z = ±2.576</span>
            </p>
          </div>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Why these matter:</p>
          <p className="text-xs text-neutral-400">
            Used constantly in hypothesis testing and estimation!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Practice Makes Perfect",
    content: (
      <div className="space-y-3">
        <p className="text-base">Build your skills:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Speed drills:</strong>
            <p className="text-xs text-neutral-400 mt-1">Quick lookups build familiarity</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Reverse practice:</strong>
            <p className="text-xs text-neutral-400 mt-1">Find z from probability</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Real problems:</strong>
            <p className="text-xs text-neutral-400 mt-1">Apply to actual scenarios</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Goal:</strong> Look up common values without thinking!
        </p>
      </div>
    )
  }
];

export const tutorial_3_3_5 = [
  {
    title: "Z-Score Problem Practice",
    content: (
      <div className="space-y-3">
        <p className="text-base">Master normal distribution problems through <em className="text-cyan-400">guided practice</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400 text-center">
            Real-world scenarios with step-by-step solutions
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Problem types:</p>
          <p className="text-xs text-neutral-300">
            • Manufacturing tolerances<br/>
            • Test score analysis<br/>
            • Quality control limits
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Problem Solving",
    content: (
      <div className="space-y-3">
        <p>Work through problems with immediate feedback:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📝</span>
            <div>
              <strong>Select difficulty:</strong> Basic → Advanced
              <p className="text-xs text-neutral-500">Build confidence progressively</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong>Enter solution:</strong> Step-by-step input
              <p className="text-xs text-neutral-500">Identify where mistakes occur</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Visual feedback:</strong> See your answer graphically
              <p className="text-xs text-neutral-500">Understand what you calculated</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Goal: Solve 5 problems correctly in a row!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Common Problem Patterns",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Recognize these structures:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Single boundary</p>
            <p className="text-xs text-neutral-400">P(X {'>'} a) or P(X {'<'} a)</p>
            <p className="font-mono text-xs mt-1">One Z-score needed</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Interval</p>
            <p className="text-xs text-neutral-400">P(a {'<'} X {'<'} b)</p>
            <p className="font-mono text-xs mt-1">Two Z-scores, subtract</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Percentile</p>
            <p className="text-xs text-neutral-400">Find x for given P</p>
            <p className="font-mono text-xs mt-1">Reverse lookup</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Multiple parts</p>
            <p className="text-xs text-neutral-400">Combined conditions</p>
            <p className="font-mono text-xs mt-1">Break into steps</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Problem-Solving Strategy",
    content: (
      <div className="space-y-3">
        <p className="text-base">Systematic approach:</p>
        <div className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">1.</span>
              <span>Identify distribution parameters (μ, σ)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">2.</span>
              <span>Sketch the problem (always!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">3.</span>
              <span>Calculate Z-score(s)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">4.</span>
              <span>Use table or calculator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">5.</span>
              <span>Interpret in context</span>
            </li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "Building Mastery",
    content: (
      <div className="space-y-3">
        <p className="text-base">Track your progress:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Accuracy tracking:</strong>
            <p className="text-xs text-neutral-400 mt-1">See improvement over time</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Speed metrics:</strong>
            <p className="text-xs text-neutral-400 mt-1">Get faster with practice</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Weak areas:</strong>
            <p className="text-xs text-neutral-400 mt-1">Focus on problem types you miss</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Challenge:</strong> Complete all problem types with 90%+ accuracy!
        </p>
      </div>
    )
  }
];

export const tutorial_3_4_1 = [
  {
    title: "The Exponential Distribution",
    content: (
      <div className="space-y-3">
        <p className="text-base">Models <em className="text-cyan-400">time between events</em> in a Poisson process:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">f(x) = λe^(-λx), x ≥ 0</p>
          <p className="text-sm text-neutral-400 text-center">
            λ = rate parameter (events per unit time)
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key property:</p>
          <p className="text-xs text-neutral-300">
            Memoryless! P(X {'>'} s+t | X {'>'} s) = P(X {'>'} t)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Understanding the Rate Parameter",
    content: (
      <div className="space-y-3">
        <p>λ controls the distribution shape:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">⚡</span>
            <div>
              <strong>High λ:</strong> Frequent events, steep decay
              <p className="text-xs text-neutral-500">Short waiting times</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🐌</span>
            <div>
              <strong>Low λ:</strong> Rare events, gradual decay
              <p className="text-xs text-neutral-500">Long waiting times</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Mean:</strong> E[X] = 1/λ
              <p className="text-xs text-neutral-500">Average time between events</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Adjust λ and watch the distribution change!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Real-World Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Exponential models appear everywhere:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Reliability</p>
            <p className="text-xs text-neutral-400">Component lifetime</p>
            <p className="text-xs text-neutral-500 mt-1">Constant failure rate</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Queueing</p>
            <p className="text-xs text-neutral-400">Service times</p>
            <p className="text-xs text-neutral-500 mt-1">Customer arrivals</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Radioactive</p>
            <p className="text-xs text-neutral-400">Decay times</p>
            <p className="text-xs text-neutral-500 mt-1">Half-life calculations</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Network</p>
            <p className="text-xs text-neutral-400">Packet arrivals</p>
            <p className="text-xs text-neutral-500 mt-1">Call durations</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Memoryless Property",
    content: (
      <div className="space-y-3">
        <p className="text-base">Unique to exponential distribution:</p>
        <div className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 text-center mb-2">
            "The past doesn't affect the future"
          </p>
          <p className="text-center font-mono text-sm">
            P(X {'>'} 10 | X {'>'} 5) = P(X {'>'} 5)
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Example:</p>
          <p className="text-xs text-neutral-400">
            If a light bulb has lasted 1000 hours, the probability it lasts another 500 hours is the same as a new bulb lasting 500 hours!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Calculating Probabilities",
    content: (
      <div className="space-y-3">
        <p className="text-base">Simple CDF formula:</p>
        <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
          <p className="font-mono text-sm text-center mb-2">
            P(X ≤ x) = 1 - e^(-λx)
          </p>
          <p className="font-mono text-sm text-center">
            P(X {'>'} x) = e^(-λx)
          </p>
        </div>
        <div className="space-y-2 text-sm mt-3">
          <div className="bg-neutral-800 p-2 rounded">
            <strong className="text-green-400">Quick calculation:</strong>
            <p className="text-xs text-neutral-400 mt-1">
              P(wait {'>'} mean) = e^(-1) ≈ 0.368
            </p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Remember:</strong> No integration needed - use the formulas!
        </p>
      </div>
    )
  }
];

export const tutorial_3_4_2 = [
  {
    title: "Exponential Distribution Problems",
    content: (
      <div className="space-y-3">
        <p className="text-base">Step-by-step problem solving with <em className="text-cyan-400">exponential distributions</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400">Example: Call center receives calls at λ = 3/hour</p>
          <p className="text-sm text-neutral-400">Find: P(next call within 15 minutes)</p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Solution approach:</p>
          <p className="text-xs text-neutral-300">
            1. Convert units (15 min = 0.25 hr)<br/>
            2. Apply P(X ≤ x) = 1 - e^(-λx)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Common Problem Types",
    content: (
      <div className="space-y-3">
        <p>Master these scenarios:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">⏰</span>
            <div>
              <strong>Waiting time:</strong> Time until next event
              <p className="text-xs text-neutral-500">Use basic CDF formula</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔄</span>
            <div>
              <strong>Multiple events:</strong> Time for k events
              <p className="text-xs text-neutral-500">Leads to Gamma distribution</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Rate conversion:</strong> Different time units
              <p className="text-xs text-neutral-500">Always match λ and x units!</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Work through each type step-by-step!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Unit Conversion Pitfalls",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Critical: Keep units consistent!</p>
        <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
          <p className="text-red-400 font-semibold text-sm mb-2">⚠️ Common mistake:</p>
          <p className="text-sm text-neutral-300">λ = 5/hour, but x in minutes</p>
          <div className="mt-2 pt-2 border-t border-red-500/30">
            <p className="text-green-400 text-sm">✓ Correct approach:</p>
            <p className="text-xs text-neutral-400 mt-1">
              Convert: λ = 5/60 per minute, OR<br/>
              Convert: x = minutes/60 hours
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Memoryless Property Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base">Using memorylessness in problems:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 mb-2">Machine has run 100 hours without failure</p>
          <p className="text-sm text-neutral-300">P(lasts another 50 hours)?</p>
          <p className="text-center font-mono text-sm mt-3">
            Same as P(new machine {'>'} 50 hours)!
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Key insight:</p>
          <p className="text-xs text-neutral-400">
            Conditional probability simplifies dramatically
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Practice Problem Strategy",
    content: (
      <div className="space-y-3">
        <p className="text-base">Systematic problem solving:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Step 1: Identify parameters</strong>
            <p className="text-xs text-neutral-400 mt-1">What is λ? What are the units?</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Step 2: Set up equation</strong>
            <p className="text-xs text-neutral-400 mt-1">P(X ≤ x) or P(X {'>'} x)?</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Step 3: Calculate</strong>
            <p className="text-xs text-neutral-400 mt-1">Use e^(-λx) formula</p>
          </div>
          <div className="bg-orange-900/20 p-2 rounded border-l-4 border-orange-500">
            <strong className="text-orange-400">Step 4: Interpret</strong>
            <p className="text-xs text-neutral-400 mt-1">What does the answer mean?</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Practice:</strong> Try problems with different contexts!
        </p>
      </div>
    )
  }
];

export const tutorial_3_5_1 = [
  {
    title: "The Gamma Distribution",
    content: (
      <div className="space-y-3">
        <p className="text-base">Generalizes exponential to model <em className="text-cyan-400">time until k events</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-sm text-center mb-2">
            f(x) = (λ^α / Γ(α)) × x^(α-1) × e^(-λx)
          </p>
          <p className="text-sm text-neutral-400 text-center">
            α = shape, λ = rate (or β = 1/λ = scale)
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Special case:</p>
          <p className="text-xs text-neutral-300">
            When α = 1, Gamma reduces to Exponential!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Shape Parameter Effects",
    content: (
      <div className="space-y-3">
        <p>α controls the distribution shape dramatically:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📉</span>
            <div>
              <strong>α {'<'} 1:</strong> J-shaped, peak at zero
              <p className="text-xs text-neutral-500">Similar to exponential decay</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔔</span>
            <div>
              <strong>α {'>'} 1:</strong> Bell-shaped, peak away from zero
              <p className="text-xs text-neutral-500">More symmetric as α increases</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Integer α:</strong> Sum of α exponentials
              <p className="text-xs text-neutral-500">Time for α events in Poisson process</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Experiment: Watch the shape transform as you adjust α!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Gamma Distribution Family",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Related distributions:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Exponential</p>
            <p className="text-xs text-neutral-400">Gamma(1, λ)</p>
            <p className="text-xs text-neutral-500 mt-1">Single event</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">Chi-squared</p>
            <p className="text-xs text-neutral-400">Gamma(k/2, 1/2)</p>
            <p className="text-xs text-neutral-500 mt-1">Sum of squared normals</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Erlang</p>
            <p className="text-xs text-neutral-400">Gamma(k, λ), k integer</p>
            <p className="text-xs text-neutral-500 mt-1">k-th arrival time</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm mb-1">Normal (limit)</p>
            <p className="text-xs text-neutral-400">As α → {'∞'}</p>
            <p className="text-xs text-neutral-500 mt-1">Central limit theorem</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Mean and Variance",
    content: (
      <div className="space-y-3">
        <p className="text-base">Key properties of Gamma(α, λ):</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <div className="space-y-2 text-center">
            <p className="font-mono text-sm">E[X] = α/λ</p>
            <p className="font-mono text-sm">Var(X) = α/λ²</p>
            <p className="font-mono text-sm">Mode = (α-1)/λ (if α {'>'} 1)</p>
          </div>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Interpretation:</p>
          <p className="text-xs text-neutral-400">
            For integer α: Average time for α events = α × (average time per event)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Applications in Engineering",
    content: (
      <div className="space-y-3">
        <p className="text-base">Where Gamma distributions appear:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Reliability:</strong>
            <p className="text-xs text-neutral-400 mt-1">System with standby components</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Load modeling:</strong>
            <p className="text-xs text-neutral-400 mt-1">Aggregate demand patterns</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Signal processing:</strong>
            <p className="text-xs text-neutral-400 mt-1">Fading channel models</p>
          </div>
          <div className="bg-orange-900/20 p-2 rounded border-l-4 border-orange-500">
            <strong className="text-orange-400">Queue analysis:</strong>
            <p className="text-xs text-neutral-400 mt-1">Service completion times</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Key:</strong> Think "sum of exponentials" for intuition!
        </p>
      </div>
    )
  }
];

export const tutorial_3_5_2 = [
  {
    title: "Gamma Distribution Problems",
    content: (
      <div className="space-y-3">
        <p className="text-base">Solving problems with <em className="text-cyan-400">Gamma distributions</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400">Example: Server processes jobs at λ = 2/min</p>
          <p className="text-sm text-neutral-400">Find: P(5 jobs complete within 3 minutes)</p>
          <p className="text-xs text-neutral-500 mt-2">Uses Gamma(5, 2) distribution</p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Connection:</p>
          <p className="text-xs text-neutral-300">
            Time for k events ~ Gamma(k, λ)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Problem Setup Strategy",
    content: (
      <div className="space-y-3">
        <p>Identify the right parameters:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🎯</span>
            <div>
              <strong>What's being counted?</strong> Number of events (α)
              <p className="text-xs text-neutral-500">Jobs, arrivals, failures, etc.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">⏱️</span>
            <div>
              <strong>What's the rate?</strong> Events per time (λ)
              <p className="text-xs text-neutral-500">Must match time units in problem</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>What's asked?</strong> Time or probability
              <p className="text-xs text-neutral-500">Different calculation approaches</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Practice recognizing Gamma scenarios!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Calculation Methods",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Three approaches to Gamma probabilities:</p>
        <div className="space-y-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">1. Poisson connection</p>
            <p className="text-xs text-neutral-400">P(T_k ≤ t) = P(N(t) ≥ k)</p>
            <p className="text-xs text-neutral-500 mt-1">Often easier for integer α</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">2. Incomplete gamma</p>
            <p className="text-xs text-neutral-400">Use tables or software</p>
            <p className="text-xs text-neutral-500 mt-1">For non-integer α</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">3. Simulation</p>
            <p className="text-xs text-neutral-400">Sum exponentials</p>
            <p className="text-xs text-neutral-500 mt-1">Good for understanding</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Poisson-Gamma Connection",
    content: (
      <div className="space-y-3">
        <p className="text-base">Powerful relationship for calculations:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 text-center mb-2">
            Time for k events ≤ t ⟺ At least k events by time t
          </p>
          <p className="text-center font-mono text-sm">
            P(T_k ≤ t) = Σ(i=k to {'∞'}) [(λt)^i × e^(-λt)] / i!
          </p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Why this helps:</p>
          <p className="text-xs text-neutral-400">
            Can use Poisson tables instead of Gamma!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Common Problem Patterns",
    content: (
      <div className="space-y-3">
        <p className="text-base">Recognize these scenarios:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Machine maintenance:</strong>
            <p className="text-xs text-neutral-400 mt-1">Time until k-th failure ~ Gamma(k, failure rate)</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Customer service:</strong>
            <p className="text-xs text-neutral-400 mt-1">Time to serve k customers ~ Gamma(k, service rate)</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Project completion:</strong>
            <p className="text-xs text-neutral-400 mt-1">Sum of task times with same rate</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Master:</strong> Converting word problems to Gamma parameters!
        </p>
      </div>
    )
  }
];

export const tutorial_3_7_1 = [
  {
    title: "Normal Approximation to Binomial",
    content: (
      <div className="space-y-3">
        <p className="text-base">When n is large, <em className="text-cyan-400">Binomial approaches Normal</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400 text-center mb-2">If X ~ Binomial(n, p), then for large n:</p>
          <p className="text-cyan-400 font-mono text-center">X ≈ N(np, np(1-p))</p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Rule of thumb:</p>
          <p className="text-xs text-neutral-300">
            Use when np ≥ 10 AND n(1-p) ≥ 10
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Visual Convergence",
    content: (
      <div className="space-y-3">
        <p>Watch the approximation improve:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Adjust n:</strong> Increase sample size
              <p className="text-xs text-neutral-500">See bars approach smooth curve</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong>Compare shapes:</strong> Binomial vs Normal overlay
              <p className="text-xs text-neutral-500">Better fit as n increases</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📏</span>
            <div>
              <strong>Check conditions:</strong> np and n(1-p) indicators
              <p className="text-xs text-neutral-500">Green when approximation is valid</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Start with n=20, p=0.5 and increase n!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Continuity Correction",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Critical adjustment for accuracy:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 mb-2">Discrete → Continuous requires ±0.5:</p>
          <div className="space-y-1 font-mono text-xs text-center">
            <p>P(X = k) ≈ P(k-0.5 {'<'} Y {'<'} k+0.5)</p>
            <p>P(X ≤ k) ≈ P(Y {'<'} k+0.5)</p>
            <p>P(X {'<'} k) ≈ P(Y {'<'} k-0.5)</p>
          </div>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Why?</p>
          <p className="text-xs text-neutral-400">
            Discrete values become continuous intervals
          </p>
        </div>
      </div>
    )
  },
  {
    title: "When to Use the Approximation",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Practical guidelines:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">✓ Good for:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Large n ({'>'} 30)</li>
              <li>• p near 0.5</li>
              <li>• Central probabilities</li>
            </ul>
          </div>
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm mb-1">✗ Avoid when:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Small n ({'<'} 20)</li>
              <li>• p near 0 or 1</li>
              <li>• Tail probabilities</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          Check: np ≥ 10 AND n(1-p) ≥ 10
        </p>
      </div>
    )
  },
  {
    title: "Computational Advantages",
    content: (
      <div className="space-y-3">
        <p className="text-base">Why use the approximation?</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Speed:</strong>
            <p className="text-xs text-neutral-400 mt-1">No need to sum many terms</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Stability:</strong>
            <p className="text-xs text-neutral-400 mt-1">Avoids numerical overflow with large n</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Convenience:</strong>
            <p className="text-xs text-neutral-400 mt-1">Use Z-tables instead of binomial tables</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Modern note:</strong> Computers handle exact calculations, but approximation gives insight!
        </p>
      </div>
    )
  }
];

export const tutorial_3_7_2 = [
  {
    title: "Normal Approximation Examples",
    content: (
      <div className="space-y-3">
        <p className="text-base">Step-by-step worked examples using <em className="text-cyan-400">normal approximation</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-neutral-400">Example: 100 coin flips</p>
          <p className="text-sm text-neutral-400">Find: P(45 ≤ X ≤ 55 heads)</p>
          <p className="text-xs text-neutral-500 mt-2">X ~ Binomial(100, 0.5)</p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Solution steps:</p>
          <p className="text-xs text-neutral-300">
            1. Check conditions<br/>
            2. Find μ and σ<br/>
            3. Apply continuity correction<br/>
            4. Standardize and use Z-table
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Complete Problem Walkthrough",
    content: (
      <div className="space-y-3">
        <p>Follow along with interactive solutions:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">✓</span>
            <div>
              <strong>Step 1: Verify conditions</strong>
              <p className="text-xs text-neutral-500">np = 50 ≥ 10 ✓, n(1-p) = 50 ≥ 10 ✓</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Step 2: Parameters</strong>
              <p className="text-xs text-neutral-500">μ = 50, σ = √25 = 5</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">±</span>
            <div>
              <strong>Step 3: Continuity correction</strong>
              <p className="text-xs text-neutral-500">P(44.5 {'<'} Y {'<'} 55.5)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-400">📈</span>
            <div>
              <strong>Step 4: Standardize</strong>
              <p className="text-xs text-neutral-500">Z₁ = -1.1, Z₂ = 1.1</p>
            </div>
          </div>
        </div>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Common Mistakes to Avoid",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Watch out for these errors:</p>
        <div className="space-y-3">
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm">❌ Forgetting continuity correction</p>
            <p className="text-xs text-neutral-400 mt-1">
              Wrong: P(X = 50) ≈ P(Y = 50) = 0<br/>
              Right: P(X = 50) ≈ P(49.5 {'<'} Y {'<'} 50.5)
            </p>
          </div>
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm">❌ Wrong variance formula</p>
            <p className="text-xs text-neutral-400 mt-1">
              Wrong: σ² = np<br/>
              Right: σ² = np(1-p)
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Accuracy Comparison",
    content: (
      <div className="space-y-3">
        <p className="text-base">See exact vs approximate values:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-sm text-neutral-300 mb-2">Visual comparison shows:</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            <li>• Exact binomial probability (bars)</li>
            <li>• Normal approximation (curve)</li>
            <li>• Percentage error</li>
          </ul>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Observe:</p>
          <p className="text-xs text-neutral-400">
            Error decreases as n increases!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Practice Problem Strategy",
    content: (
      <div className="space-y-3">
        <p className="text-base">Master the approximation process:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Always check conditions first</strong>
            <p className="text-xs text-neutral-400 mt-1">If np {'<'} 10 or n(1-p) {'<'} 10, STOP!</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Draw the picture</strong>
            <p className="text-xs text-neutral-400 mt-1">Visualize what you're calculating</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Double-check continuity correction</strong>
            <p className="text-xs text-neutral-400 mt-1">Most common source of errors</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Goal:</strong> Solve problems both ways to verify understanding!
        </p>
      </div>
    )
  }
];