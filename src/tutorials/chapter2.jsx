// Chapter 2 Tutorial Content
// Academic tone, concise explanations focused on discrete probability concepts

export const tutorial_2_1_1 = [
  {
    title: "Understanding Random Variables",
    content: (
      <div className="space-y-3">
        <p className="text-base">A random variable <em className="text-cyan-400">X</em> transforms randomness into numbers:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">X: Ω → ℝ</p>
          <p className="text-sm text-neutral-400 text-center">
            Maps outcomes in sample space to real numbers
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            Random variables let us do math with uncertain events!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Creating Your Probability Space",
    content: (
      <div className="space-y-3">
        <p>This grid represents your sample space Ω. Here's how to build a random variable:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🎨</span>
            <div>
              <strong>Paint regions:</strong> Click and drag to color grid cells
              <p className="text-xs text-neutral-500">Each colored region is an event</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔢</span>
            <div>
              <strong>Assign values:</strong> Give each color a numerical value
              <p className="text-xs text-neutral-500">This creates the mapping X</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>See the PMF:</strong> Probability mass function emerges
              <p className="text-xs text-neutral-500">P(X=x) proportional to region size</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Paint different sized regions and watch probabilities change!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "The Power of Spatial Probability",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Region size determines probability:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">P(X = x) = Area(X⁻¹(x)) / Total Area</p>
          <p className="text-sm text-neutral-300 text-center">
            Larger regions = higher probability
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Small Region</p>
            <p className="text-xs text-neutral-400">Low probability</p>
            <p className="font-mono text-xs mt-1">P(X=x) ≈ 0.1</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Large Region</p>
            <p className="text-xs text-neutral-400">High probability</p>
            <p className="font-mono text-xs mt-1">P(X=x) ≈ 0.6</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Sampling and Convergence",
    content: (
      <div className="space-y-3">
        <p className="text-base">Watch probability emerge through sampling:</p>
        <div className="bg-neutral-800 p-3 rounded space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Random point</span>
            <span className="text-cyan-400">→</span>
            <span className="text-neutral-300">Falls in region</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Region color</span>
            <span className="text-green-400">→</span>
            <span className="text-neutral-300">Maps to value X</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Many samples</span>
            <span className="text-yellow-400">→</span>
            <span className="text-neutral-300">PMF emerges!</span>
          </div>
        </div>
        <p className="text-sm text-green-400 mt-3">
          🎯 <strong>Challenge:</strong> Create a uniform distribution (all probabilities equal)
        </p>
      </div>
    )
  },
  {
    title: "Engineering Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Random variables model real systems:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Manufacturing</strong>
            <p className="text-xs text-neutral-400 mt-1">X = defect count in a batch</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Network Traffic</strong>
            <p className="text-xs text-neutral-400 mt-1">X = packets arriving per second</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Quality Control</strong>
            <p className="text-xs text-neutral-400 mt-1">X = measurement error in mm</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Try modeling a dice roll with 6 equal regions!
        </p>
      </div>
    )
  }
];

export const tutorial_2_2_1 = [
  {
    title: "Expectation: The Center of Mass",
    content: (
      <div className="space-y-3">
        <p className="text-base">The <em className="text-cyan-400">expected value</em> E[X] is the probabilistic average:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">E[X] = Σ x·P(X=x)</p>
          <p className="text-sm text-neutral-400 text-center">
            Weighted average of all possible values
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Physical Analogy:</p>
          <p className="text-xs text-neutral-300">
            E[X] is the balance point where the distribution would balance on a seesaw!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Building Your Distribution",
    content: (
      <div className="space-y-3">
        <p>Create a probability mass function (PMF) interactively:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong>Drag probability bars:</strong> Adjust P(X=x) values
              <p className="text-xs text-neutral-500">Heights must sum to 1.0</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">⚖️</span>
            <div>
              <strong>Watch the balance:</strong> Red dot shows E[X]
              <p className="text-xs text-neutral-500">It moves as you change probabilities</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📈</span>
            <div>
              <strong>See calculations:</strong> Live updates of E[X] and Var(X)
              <p className="text-xs text-neutral-500">Understand the formulas in action</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Create a symmetric distribution - what happens to E[X]?
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Variance: Measuring Spread",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Variance measures <em className="text-purple-400">how spread out</em> the distribution is:</p>
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">Var(X) = E[(X - μ)²]</p>
          <p className="text-sm text-neutral-300 text-center mb-3">
            Average squared distance from the mean
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <p className="text-purple-400">Low Variance</p>
              <p className="text-neutral-500">Concentrated near mean</p>
            </div>
            <div className="text-center">
              <p className="text-pink-400">High Variance</p>
              <p className="text-neutral-500">Spread out values</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Standard deviation σ = √Var(X) gives spread in original units
        </p>
      </div>
    )
  },
  {
    title: "Key Properties to Discover",
    content: (
      <div className="space-y-3">
        <p className="text-base">Experiment to verify these fundamental properties:</p>
        <div className="space-y-2">
          <div className="bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
            <p className="font-mono text-sm text-blue-400">E[X + Y] = E[X] + E[Y]</p>
            <p className="text-xs text-neutral-400 mt-1">Expectation is linear!</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border-l-4 border-green-500">
            <p className="font-mono text-sm text-green-400">Var(X) = E[X²] - (E[X])²</p>
            <p className="text-xs text-neutral-400 mt-1">Computational formula for variance</p>
          </div>
          <div className="bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-500">
            <p className="font-mono text-sm text-yellow-400">Var(X) ≥ 0</p>
            <p className="text-xs text-neutral-400 mt-1">Variance is always non-negative</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Challenge:</strong> Create a distribution with E[X] = 0 but Var(X) &gt; 0
        </p>
      </div>
    )
  },
  {
    title: "Common Distributions",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Use presets to explore famous distributions:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-cyan-400 font-semibold">Uniform</p>
            <p className="text-xs text-neutral-400">All outcomes equally likely</p>
            <p className="font-mono text-xs mt-1">E[X] = (a+b)/2</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-green-400 font-semibold">Binomial</p>
            <p className="text-xs text-neutral-400">Number of successes</p>
            <p className="font-mono text-xs mt-1">E[X] = np</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-purple-400 font-semibold">Poisson</p>
            <p className="text-xs text-neutral-400">Rare events</p>
            <p className="font-mono text-xs mt-1">E[X] = Var(X) = λ</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-orange-400 font-semibold">Custom</p>
            <p className="text-xs text-neutral-400">Your creation!</p>
            <p className="font-mono text-xs mt-1">E[X] = ?</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Each distribution tells a different probability story
        </p>
      </div>
    )
  }
];

export const tutorial_2_3_1 = [
  {
    title: "Linear Transformations",
    content: (
      <div className="space-y-3">
        <p className="text-base">Transform random variables with <em className="text-cyan-400">Y = aX + b</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <div className="space-y-2 text-center">
            <p className="font-mono text-sm">a = scale factor</p>
            <p className="font-mono text-sm">b = shift amount</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-2 rounded text-center">
            <p className="text-blue-400 text-sm">Scaling (a)</p>
            <p className="text-xs text-neutral-500">Stretches or shrinks</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded text-center">
            <p className="text-green-400 text-sm">Shifting (b)</p>
            <p className="text-xs text-neutral-500">Moves left or right</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Transformation Rules",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Linear transformations follow simple rules:</p>
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <div className="space-y-3">
            <div>
              <p className="text-cyan-400 font-mono text-center">E[aX + b] = aE[X] + b</p>
              <p className="text-xs text-neutral-400 text-center mt-1">Expectation transforms linearly</p>
            </div>
            <div className="mt-3">
              <p className="text-purple-400 font-mono text-center">Var(aX + b) = a²Var(X)</p>
              <p className="text-xs text-neutral-400 text-center mt-1">Variance scales by a² (b doesn't affect spread!)</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-yellow-400 mt-2">
          💡 Shifting doesn't change variance - only scaling does!
        </p>
      </div>
    )
  },
  {
    title: "Interactive Exploration",
    content: (
      <div className="space-y-3">
        <p>Use the sliders to transform your distribution:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">↔️</span>
            <div>
              <strong>Scale slider (a):</strong> Stretch or compress
              <p className="text-xs text-neutral-500">Watch how variance changes with a²</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">➡️</span>
            <div>
              <strong>Shift slider (b):</strong> Move the distribution
              <p className="text-xs text-neutral-500">Mean shifts by b, variance unchanged</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Overlay view:</strong> Compare original vs transformed
              <p className="text-xs text-neutral-500">See both distributions at once</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Set a = -1 to flip the distribution!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Engineering Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Linear transformations appear everywhere:</p>
        <div className="space-y-2">
          <div className="bg-orange-900/20 p-3 rounded border-l-4 border-orange-500">
            <strong className="text-orange-400 text-sm">Temperature Conversion</strong>
            <p className="font-mono text-xs mt-1">F = (9/5)C + 32</p>
            <p className="text-xs text-neutral-500">Celsius to Fahrenheit</p>
          </div>
          <div className="bg-teal-900/20 p-3 rounded border-l-4 border-teal-500">
            <strong className="text-teal-400 text-sm">Signal Amplification</strong>
            <p className="font-mono text-xs mt-1">V_out = G·V_in + V_offset</p>
            <p className="text-xs text-neutral-500">Gain and DC offset</p>
          </div>
          <div className="bg-pink-900/20 p-3 rounded border-l-4 border-pink-500">
            <strong className="text-pink-400 text-sm">Currency Exchange</strong>
            <p className="font-mono text-xs mt-1">EUR = rate·USD + fee</p>
            <p className="text-xs text-neutral-500">Exchange rate and fees</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Key Insights",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Remember these crucial points:</p>
        <div className="bg-neutral-800 p-4 rounded space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📏</span>
            <div>
              <p className="text-sm font-semibold">Scaling affects spread</p>
              <p className="text-xs text-neutral-400">|a| &gt; 1 increases variance, |a| &lt; 1 decreases it</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">↔️</span>
            <div>
              <p className="text-sm font-semibold">Shifting preserves shape</p>
              <p className="text-xs text-neutral-400">Only location changes, not the distribution form</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <p className="text-sm font-semibold">Negative a flips distribution</p>
              <p className="text-xs text-neutral-400">Y = -X reverses all values around zero</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Standard score Z = (X - μ)/σ uses both operations!
        </p>
      </div>
    )
  }
];

export const tutorial_2_3_2 = [
  {
    title: "Beyond Linear: Function Transformations",
    content: (
      <div className="space-y-3">
        <p className="text-base">Apply any function to transform <em className="text-cyan-400">Y = g(X)</em>:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-center text-sm mb-3">Common transformations:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <p className="font-mono text-green-400">Y = X²</p>
              <p className="text-neutral-500">Squaring</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-blue-400">Y = |X|</p>
              <p className="text-neutral-500">Absolute value</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-purple-400">Y = √X</p>
              <p className="text-neutral-500">Square root</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-orange-400">Y = eˣ</p>
              <p className="text-neutral-500">Exponential</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-yellow-400 mt-2">
          ⚠️ Warning: E[g(X)] ≠ g(E[X]) for nonlinear functions!
        </p>
      </div>
    )
  },
  {
    title: "Understanding Nonlinear Effects",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Nonlinear functions can dramatically change distributions:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm mb-1">Many-to-One</p>
            <p className="text-xs text-neutral-400">Multiple X values → same Y</p>
            <p className="text-xs text-neutral-500 mt-1">e.g., Y = X² maps ±2 → 4</p>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Domain Restrictions</p>
            <p className="text-xs text-neutral-400">Some Y values impossible</p>
            <p className="text-xs text-neutral-500 mt-1">e.g., Y = √X requires X ≥ 0</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-sm text-purple-400 mb-1">Key Formula:</p>
          <p className="font-mono text-xs">P(Y = y) = Σ P(X = x) for all x where g(x) = y</p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Function Builder",
    content: (
      <div className="space-y-3">
        <p>Explore how functions transform distributions:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📐</span>
            <div>
              <strong>Choose a function:</strong> Select from presets
              <p className="text-xs text-neutral-500">Or define your own custom g(x)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔄</span>
            <div>
              <strong>See the mapping:</strong> Arrows show X → Y
              <p className="text-xs text-neutral-500">Understand how values transform</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Compare PMFs:</strong> Original vs transformed
              <p className="text-xs text-neutral-500">Notice probability accumulation</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Apply Y = X² and see probabilities combine at positive values!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "Jensen's Inequality",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">A fundamental principle for convex functions:</p>
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center mb-3">For convex g (like x²):</p>
          <p className="text-purple-400 font-mono text-lg text-center">E[g(X)] ≥ g(E[X])</p>
          <p className="text-xs text-neutral-400 text-center mt-2">
            Average of transformed ≥ Transform of average
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-green-400 font-semibold">Convex: ∪</p>
            <p className="text-neutral-500">x², eˣ, |x|</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-red-400 font-semibold">Concave: ∩</p>
            <p className="text-neutral-500">log(x), √x</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Engineering Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Nonlinear transformations in practice:</p>
        <div className="space-y-2">
          <div className="bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400 text-sm">Power Calculations</strong>
            <p className="font-mono text-xs mt-1">P = I²R</p>
            <p className="text-xs text-neutral-500">Current squared times resistance</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-400 text-sm">Signal Processing</strong>
            <p className="font-mono text-xs mt-1">SNR_dB = 10·log₁₀(P_signal/P_noise)</p>
            <p className="text-xs text-neutral-500">Logarithmic scale for ratios</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400 text-sm">Risk Analysis</strong>
            <p className="font-mono text-xs mt-1">Loss = max(0, X - K)</p>
            <p className="text-xs text-neutral-500">Option payoff functions</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Challenge:</strong> Model V_out = V_in² for a square-law detector!
        </p>
      </div>
    )
  }
];