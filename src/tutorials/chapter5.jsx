// Chapter 5 Tutorial Content
// Academic tone, concise explanations focused on statistical inference concepts

// Tutorial for Section 5.2.1 - The 68-95-99.7 Rule
export const tutorial_5_2_1 = [
  {
    title: "What does 95% confident really mean?",
    content: (
      <div className="space-y-3">
        <p className="text-base">When we say we're <em className="text-cyan-400">95% confident</em>, what are we claiming?</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">CI = x̄ ± z*(σ/√n)</p>
          <div className="grid grid-cols-3 gap-2 text-sm text-neutral-300 mt-3">
            <div className="text-center">
              <p className="text-yellow-400">x̄</p>
              <p className="text-xs text-neutral-500">sample mean</p>
            </div>
            <div className="text-center">
              <p className="text-green-400">z</p>
              <p className="text-xs text-neutral-500">critical value</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400">σ/√n</p>
              <p className="text-xs text-neutral-500">standard error</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          95% of all possible confidence intervals will contain the true population mean
        </p>
      </div>
    )
  },
  {
    title: "The 68-95-99.7 Rule",
    content: (
      <div className="space-y-3">
        <p className="text-base">For normal distributions, data clusters predictably:</p>
        <div className="space-y-2">
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-green-400">μ ± 1σ</span>
              <span className="text-green-400 font-semibold">68%</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">About 2/3 of all data</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-blue-400">μ ± 2σ</span>
              <span className="text-blue-400 font-semibold">95%</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">19 out of 20 observations</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-purple-400">μ ± 3σ</span>
              <span className="text-purple-400 font-semibold">99.7%</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">Nearly all data</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "IQ Example: μ=100, σ=15",
    content: (
      <div className="space-y-3">
        <p>With IQ scores following N(100, 15²), we expect:</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm">68%</p>
            <p className="font-mono text-xs mt-1">85-115</p>
            <p className="text-xs text-neutral-500">±1σ</p>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm">95%</p>
            <p className="font-mono text-xs mt-1">70-130</p>
            <p className="text-xs text-neutral-500">±2σ</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm">99.7%</p>
            <p className="font-mono text-xs mt-1">55-145</p>
            <p className="text-xs text-neutral-500">±3σ</p>
          </div>
        </div>
        <p className="text-xs text-neutral-400 text-center mt-2">
          IQ above 145 or below 55? Only 3 in 1000 people!
        </p>
      </div>
    )
  },
  {
    title: "From Rule to Confidence Intervals",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">The connection to confidence intervals:</p>
        <div className="bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center text-sm font-semibold mb-3">Critical z-values</p>
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-green-400 font-mono text-lg">1.00</p>
              <p className="text-neutral-500">68% CI</p>
            </div>
            <div>
              <p className="text-blue-400 font-mono text-lg">1.96</p>
              <p className="text-neutral-500">95% CI</p>
            </div>
            <div>
              <p className="text-purple-400 font-mono text-lg">2.58</p>
              <p className="text-neutral-500">99% CI</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 text-center">
          Note: 95% uses z=1.96, not exactly 2 (more precise than the rule)
        </p>
      </div>
    )
  },
  {
    title: "Interactive Exploration",
    content: (
      <div className="space-y-3">
        <p className="mb-2">Use this visualization to explore:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎯</span>
            <div>
              <strong>Sample from population:</strong> Watch x̄ vary
              <p className="text-xs text-neutral-500">Each sample gives a different interval</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Track coverage:</strong> How many intervals contain μ?
              <p className="text-xs text-neutral-500">Should approach 68%, 95%, or 99.7%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">🔄</span>
            <div>
              <strong>Change confidence level:</strong> See interval width change
              <p className="text-xs text-neutral-500">Higher confidence = wider intervals</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            We're 95% confident because 95% of intervals capture the true parameter!
          </p>
        </div>
      </div>
    )
  }
];

// Tutorial for Section 5.4.1 - T vs Z distributions
export const tutorial_5_4_1 = [
  {
    title: "What happens when σ is unknown?",
    content: (
      <div className="space-y-3">
        <p className="text-base">In reality, we rarely know the population standard deviation σ.</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-red-500/20">
          <p className="text-center text-lg mb-2">
            <span className="text-red-400">s</span> <span className="text-neutral-400">≠</span> <span className="text-cyan-400">σ</span>
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-red-400 font-semibold">s</p>
              <p className="text-xs text-neutral-500">sample std dev</p>
              <p className="text-xs text-neutral-600 mt-1">what we calculate</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-semibold">σ</p>
              <p className="text-xs text-neutral-500">population std dev</p>
              <p className="text-xs text-neutral-600 mt-1">what we don't know</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Using s instead of σ introduces extra uncertainty
        </p>
      </div>
    )
  },
  {
    title: "Enter the t-distribution",
    content: (
      <div className="space-y-3">
        <p className="text-base">William Gosset's solution: <em className="text-yellow-400">The t-distribution</em></p>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-sm text-neutral-300 mb-3">Key properties:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <div>
                <strong className="text-sm">Heavier tails</strong>
                <p className="text-xs text-neutral-500">More probability in extremes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <div>
                <strong className="text-sm">Depends on df = n-1</strong>
                <p className="text-xs text-neutral-500">Degrees of freedom</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <div>
                <strong className="text-sm">Approaches normal as n→∞</strong>
                <p className="text-xs text-neutral-500">Converges to z-distribution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Wider Confidence Intervals",
    content: (
      <div className="space-y-3">
        <p>The t-distribution creates <em className="text-orange-400">wider intervals</em> than z:</p>
        <div className="bg-neutral-900 p-3 rounded-lg border border-orange-500/20">
          <p className="text-center text-sm mb-3">95% Critical Values</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-mono">z₀.₀₂₅</span>
              <span className="text-cyan-400">1.96</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono">t₀.₀₂₅,₄</span>
              <span className="text-orange-400">2.776</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono">t₀.₀₂₅,₉</span>
              <span className="text-yellow-400">2.262</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono">t₀.₀₂₅,₂₉</span>
              <span className="text-green-400">2.045</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 text-center">
          Smaller samples → Larger critical values → Wider intervals
        </p>
      </div>
    )
  },
  {
    title: "Convergence to Normal",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">As sample size increases:</p>
        <div className="bg-gradient-to-r from-orange-900/20 to-cyan-900/20 p-4 rounded-lg border border-neutral-600">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-orange-400 font-mono">n = 5</p>
              <p className="text-xs text-neutral-500">Heavy tails</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400">→</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-mono">n = 30</p>
              <p className="text-xs text-neutral-500">Nearly normal</p>
            </div>
            <div className="text-center">
              <p className="text-green-400">→</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-mono">n → ∞</p>
              <p className="text-xs text-neutral-500">Exactly normal</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-900/30 border border-blue-500/50 rounded">
          <p className="text-xs text-blue-300">
            <strong>Rule of thumb:</strong> Use t for n {'<'} 30, z for n {'>='} 30 (if σ unknown)
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Using This Visualization",
    content: (
      <div className="space-y-3">
        <p className="mb-2">Explore the differences interactively:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">📈</span>
            <div>
              <strong>Overlay distributions:</strong> See t vs z shapes
              <p className="text-xs text-neutral-500">Notice the heavier tails on t</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-400">🎚️</span>
            <div>
              <strong>Adjust sample size:</strong> Watch t approach z
              <p className="text-xs text-neutral-500">Convergence happens around n=30</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Compare intervals:</strong> t-intervals are always wider
              <p className="text-xs text-neutral-500">Extra uncertainty from estimating σ</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Set n=5 to see maximum difference!
        </p>
      </div>
    )
  }
];

// Tutorial for Section 5.5.1 - Proportion intervals
export const tutorial_5_5_1 = [
  {
    title: "Election Polls: 52% vs 48%",
    content: (
      <div className="space-y-3">
        <p className="text-base">A poll shows Candidate A at <em className="text-blue-400">52%</em> and Candidate B at <em className="text-red-400">48%</em>.</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-600">
          <p className="text-center text-lg font-semibold mb-2">Who's really ahead?</p>
          <div className="flex justify-center gap-8 text-2xl font-mono">
            <span className="text-blue-400">52%</span>
            <span className="text-neutral-500">vs</span>
            <span className="text-red-400">48%</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 text-center">
          The answer depends on the margin of error!
        </p>
      </div>
    )
  },
  {
    title: "Proportion Confidence Intervals",
    content: (
      <div className="space-y-3">
        <p className="text-base">For proportions, we use a different formula:</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">CI = p̂ ± z*√(p̂(1-p̂)/n)</p>
          <div className="grid grid-cols-3 gap-2 text-sm text-neutral-300 mt-3">
            <div className="text-center">
              <p className="text-yellow-400">p̂</p>
              <p className="text-xs text-neutral-500">sample proportion</p>
            </div>
            <div className="text-center">
              <p className="text-green-400">√(p̂(1-p̂)/n)</p>
              <p className="text-xs text-neutral-500">standard error</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400">z</p>
              <p className="text-xs text-neutral-500">critical value</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Note: Maximum variability occurs at p̂ = 0.5
        </p>
      </div>
    )
  },
  {
    title: "Margin of Error Calculation",
    content: (
      <div className="space-y-3">
        <p>For a typical poll with n = 1000:</p>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-sm font-mono mb-2">MOE = 1.96 × √(0.5 × 0.5 / 1000)</p>
          <p className="text-sm font-mono mb-2">MOE = 1.96 × √(0.00025)</p>
          <p className="text-sm font-mono mb-2">MOE = 1.96 × 0.0158</p>
          <p className="text-lg font-mono text-yellow-400">MOE ≈ ±3.1%</p>
        </div>
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500/50 rounded">
          <p className="text-xs text-yellow-300">
            <strong>Remember:</strong> "±3% margin of error" typically means 95% confidence
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Overlapping Intervals",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">With ±3.1% margin of error:</p>
        <div className="space-y-2">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-semibold">Candidate A</span>
              <span className="font-mono text-sm">52% ± 3.1%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Range: 48.9% to 55.1%</p>
          </div>
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <div className="flex justify-between items-center">
              <span className="text-red-400 font-semibold">Candidate B</span>
              <span className="font-mono text-sm">48% ± 3.1%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Range: 44.9% to 51.1%</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-purple-900/30 rounded border border-purple-500/50">
          <p className="text-purple-300 text-sm">⚠️ The intervals overlap!</p>
          <p className="text-xs text-neutral-400 mt-1">
            We cannot confidently say who's ahead - it's a statistical tie
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Sample Size Matters",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">How sample size affects precision:</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-neutral-800 p-3 rounded">
            <p className="text-sm font-semibold text-red-400">n = 100</p>
            <p className="font-mono text-xs mt-1">±9.8%</p>
            <p className="text-xs text-neutral-600">Very wide</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded">
            <p className="text-sm font-semibold text-yellow-400">n = 1,000</p>
            <p className="font-mono text-xs mt-1">±3.1%</p>
            <p className="text-xs text-neutral-600">Standard poll</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded">
            <p className="text-sm font-semibold text-green-400">n = 10,000</p>
            <p className="font-mono text-xs mt-1">±1.0%</p>
            <p className="text-xs text-neutral-600">Very precise</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            To halve the margin of error, you need 4× the sample size!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Interactive Poll Simulator",
    content: (
      <div className="space-y-3">
        <p className="mb-2">Explore election polling dynamics:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🗳️</span>
            <div>
              <strong>Set true proportions:</strong> Hidden population values
              <p className="text-xs text-neutral-500">What the election would actually show</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Take poll samples:</strong> Simulate different polls
              <p className="text-xs text-neutral-500">Each poll gives different results</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">📈</span>
            <div>
              <strong>Visualize uncertainty:</strong> See overlapping intervals
              <p className="text-xs text-neutral-500">Understand "too close to call"</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Set a 51-49 split and see how often polls get it wrong!
        </p>
      </div>
    )
  }
];