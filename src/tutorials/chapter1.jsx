// Chapter 1 Tutorial Content
// Academic tone, concise explanations focused on mathematical concepts

// Export individual Monty Hall component tutorials (actively used)
export { tutorial_1_7_1, tutorial_1_7_2, tutorial_1_7_3 } from './monty-hall-tutorials';

export const tutorial_1_6_1 = [
  {
    title: "Mastering Conditional Probability",
    content: (
      <div className="space-y-3">
        <p className="text-base">Conditional probability answers: <em className="text-cyan-400">What changes when we know something?</em></p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">P(B|A) = P(A∩B) / P(A)</p>
          <p className="text-sm text-neutral-400 text-center">
            The probability of B given that A has occurred
          </p>
        </div>
        <p className="text-xs text-neutral-500">
          This fundamental concept is the foundation of Bayes' theorem and machine learning!
        </p>
      </div>
    )
  },
  {
    target: '.event-A',
    title: "Interactive Event Manipulation",
    content: (
      <div className="space-y-3">
        <p>These rectangles represent probabilistic events. You have full control:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">↔</span>
            <div>
              <strong>Drag rectangles:</strong> Change event positions
              <p className="text-xs text-neutral-500">Hold and move entire events</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">◐</span>
            <div>
              <strong>Resize handles:</strong> Adjust probabilities
              <p className="text-xs text-neutral-500">White handles on the sides</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">∩</span>
            <div>
              <strong>Create overlaps:</strong> Form intersections
              <p className="text-xs text-neutral-500">Overlap = joint probability</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-2">
          🎯 Try it: Drag event A to overlap with B!
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "The Power of Perspective",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Switch between conditional views:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm mb-1">Universe View</p>
            <p className="text-xs text-neutral-400">Standard probabilities</p>
            <p className="font-mono text-xs mt-1">P(A), P(B), P(C)</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm mb-1">Given A View</p>
            <p className="text-xs text-neutral-400">World where A occurred</p>
            <p className="font-mono text-xs mt-1">P(B|A), P(C|A)</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            Conditioning "zooms in" on the given event, rescaling all probabilities relative to that new universe!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Independence: The Holy Grail",
    content: (
      <div className="space-y-3">
        <p className="text-base">Two events are <em className="text-green-400">independent</em> when:</p>
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-2">P(B|A) = P(B)</p>
          <p className="text-sm text-neutral-300 text-center">
            Knowing A doesn't change B's probability!
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-neutral-300">This means:</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• The events don't influence each other</li>
            <li>• P(A∩B) = P(A) × P(B) (multiplication rule)</li>
            <li>• Common in coin flips, dice rolls</li>
          </ul>
        </div>
        <p className="text-sm text-green-400 mt-3">
          🎯 <strong>Challenge:</strong> Can you arrange A and B to be independent?
        </p>
      </div>
    )
  },
  {
    title: "Sampling and Convergence",
    content: (
      <div className="space-y-3">
        <p className="text-base">Watch probability in action:</p>
        <div className="bg-neutral-800 p-3 rounded space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Click "Start Sampling"</span>
            <span className="text-cyan-400">→</span>
            <span className="text-neutral-300">Drop random points</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Points hit events</span>
            <span className="text-green-400">→</span>
            <span className="text-neutral-300">Count frequencies</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Many samples</span>
            <span className="text-yellow-400">→</span>
            <span className="text-neutral-300">Converge to theory!</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-purple-900/30 border border-purple-500/50 rounded">
          <p className="text-xs text-purple-300">
            <strong>Law of Large Numbers:</strong> With enough samples, empirical frequencies approach theoretical probabilities
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Advanced Analysis Tab",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Explore deeper mathematics:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
            <strong className="text-blue-400">Bayes' Theorem</strong>
            <p className="text-xs text-neutral-400 mt-1">Reverse conditional probabilities - foundation of AI!</p>
          </div>
          <div className="bg-green-900/20 p-2 rounded border-l-4 border-green-500">
            <strong className="text-green-400">Joint Probability Tables</strong>
            <p className="text-xs text-neutral-400 mt-1">See all event combinations at once</p>
          </div>
          <div className="bg-purple-900/20 p-2 rounded border-l-4 border-purple-500">
            <strong className="text-purple-400">Total Probability</strong>
            <p className="text-xs text-neutral-400 mt-1">Partition the sample space systematically</p>
          </div>
        </div>
        <p className="text-sm text-cyan-400 mt-3">
          🎯 <strong>Pro tip:</strong> Switch to the Mathematical Analysis tab!
        </p>
      </div>
    )
  }
];

// Tutorial for Section 1.1.1 - Sample Spaces and Events (UNUSED - kept for reference)
const tutorial_1_1_1 = [
  {
    title: "Sample Spaces and Events",
    content: (
      <div className="space-y-2">
        <p>A sample space Ω contains all possible outcomes of an experiment.</p>
        <p className="text-neutral-400 text-sm">
          Events are subsets of the sample space. Explore set operations on events.
        </p>
      </div>
    )
  },
  {
    title: "Event Operations",
    content: (
      <div className="space-y-2">
        <p>Fundamental set operations:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
          <li><strong>Union (A ∪ B):</strong> A or B occurs</li>
          <li><strong>Intersection (A ∩ B):</strong> Both A and B occur</li>
          <li><strong>Complement (A&apos;):</strong> A does not occur</li>
        </ul>
      </div>
    )
  },
  {
    title: "Interactive Exploration",
    content: (
      <div className="space-y-2">
        <p>Click outcomes to add them to events.</p>
        <p className="text-sm text-neutral-400">
          Observe how event operations affect the selected outcomes.
        </p>
      </div>
    )
  }
];

// Tutorial for Section 1.4.1 - Combination Builder (UNUSED - kept for reference)
const tutorial_1_4_1 = [
  {
    title: "Combinations",
    content: (
      <div className="space-y-2">
        <p>Calculate C(n,k) = n! / (k!(n-k)!), the number of ways to choose k items from n.</p>
        <p className="text-neutral-400 text-sm">
          Explore the relationship between permutations and combinations.
        </p>
      </div>
    )
  },
  {
    title: "Interactive Calculation",
    content: (
      <div className="space-y-2">
        <p>Adjust n and k to compute combinations.</p>
        <p className="text-sm text-neutral-400">
          The visualization shows the factorial decomposition and simplification process.
        </p>
      </div>
    )
  }
];

// Tutorial for Section 1.2.1 - Counting Techniques
export const tutorial_1_2_1 = [
  {
    title: "Introduction to Counting",
    content: (
      <div className="space-y-3">
        <p className="text-base">Counting techniques help us answer: <em className="text-blue-400">How many ways?</em></p>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-sm text-neutral-300 mb-2">Two fundamental questions in combinatorics:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span><strong>Does order matter?</strong> Is AB different from BA?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Can we repeat?</strong> Can we choose the same item twice?</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-neutral-500">This visualization will help you understand both concepts.</p>
      </div>
    )
  },
  {
    title: "Permutations: When Order Matters",
    content: (
      <div className="space-y-3">
        <p>Permutations count <em className="text-green-400">arrangements</em> where order is important.</p>
        <div className="bg-neutral-900 p-3 rounded-lg border border-green-500/20">
          <p className="text-green-400 font-mono text-lg text-center mb-2">P(n,r) = n!/(n-r)!</p>
          <p className="text-sm text-neutral-400 text-center">Choose r items from n total, order matters</p>
        </div>
        <div className="mt-3 text-sm">
          <p className="text-neutral-300 mb-2">Example: Arranging 3 letters (A,B,C) taken 2 at a time</p>
          <p className="font-mono text-xs bg-neutral-800 p-2 rounded">
            P(3,2) = 3!/(3-2)! = 3!/1! = 6 ways
          </p>
          <p className="text-xs text-neutral-500 mt-1">AB, AC, BA, BC, CA, CB</p>
        </div>
      </div>
    )
  },
  {
    title: "Combinations: When Order Doesn't Matter",
    content: (
      <div className="space-y-3">
        <p>Combinations count <em className="text-blue-400">selections</em> where order is irrelevant.</p>
        <div className="bg-neutral-900 p-3 rounded-lg border border-blue-500/20">
          <p className="text-blue-400 font-mono text-lg text-center mb-2">C(n,r) = n!/(r!(n-r)!)</p>
          <p className="text-sm text-neutral-400 text-center">Choose r items from n total, order doesn&apos;t matter</p>
        </div>
        <div className="mt-3 text-sm">
          <p className="text-neutral-300 mb-2">Example: Selecting 2 letters from {'{'}A,B,C{'}'}</p>
          <p className="font-mono text-xs bg-neutral-800 p-2 rounded">
            C(3,2) = 3!/(2!×1!) = 3 ways
          </p>
          <p className="text-xs text-neutral-500 mt-1">{'{'}AB{'}'}, {'{'}AC{'}'}, {'{'}BC{'}'}</p>
        </div>
      </div>
    )
  },
  {
    title: "The Key Relationship",
    content: (
      <div className="space-y-3">
        <p className="text-base">Understanding the connection:</p>
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center font-mono text-lg mb-3">C(n,r) = P(n,r) ÷ r!</p>
          <p className="text-sm text-neutral-300 text-center">
            We divide by r! because each combination can be arranged r! ways
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded text-sm">
          <p className="text-yellow-400 mb-2">💡 Key Insight:</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            <li>• Permutations: "In how many orders?"</li>
            <li>• Combinations: "Which items?"</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Using This Visualization",
    content: (
      <div className="space-y-3">
        <p>The tree diagram reveals the counting process:</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold mb-1">Permutation Mode</p>
            <p className="text-xs text-neutral-400">Each path is unique</p>
            <p className="text-xs text-neutral-500 mt-1">A→B differs from B→A</p>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold mb-1">Combination Mode</p>
            <p className="text-xs text-neutral-400">Equivalent paths merge</p>
            <p className="text-xs text-neutral-500 mt-1">{'{'}A,B{'}'} same as {'{'}B,A{'}'}</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Toggle between modes and watch branches merge/separate!
        </p>
      </div>
    )
  }
];

// Tutorial for Section 1.3.1 - Ordered Samples
export const tutorial_1_3_1 = [
  {
    title: "Understanding Ordered Sampling",
    content: (
      <div className="space-y-3">
        <p className="text-base">When we sample items <em className="text-purple-400">in sequence</em>, order matters!</p>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-sm text-neutral-300 mb-2">The crucial question:</p>
          <p className="text-center text-lg font-semibold text-yellow-400">
            Can we pick the same item twice?
          </p>
        </div>
        <p className="text-xs text-neutral-500">
          This fundamentally changes how we count possibilities.
        </p>
      </div>
    )
  },
  {
    title: "Sampling WITH Replacement",
    content: (
      <div className="space-y-3">
        <p>Items <em className="text-green-400">return to the pool</em> after each draw.</p>
        <div className="bg-neutral-900 p-3 rounded-lg border border-green-500/20">
          <p className="text-green-400 font-mono text-lg text-center mb-2">Total outcomes = n^r</p>
          <p className="text-sm text-neutral-400 text-center">n choices for each of r positions</p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded">
          <p className="text-sm text-neutral-300 mb-2">Example: 4-digit PIN from digits 0-9</p>
          <p className="font-mono text-xs">10^4 = 10,000 possible PINs</p>
          <p className="text-xs text-neutral-500 mt-1">Each position has all 10 digits available</p>
        </div>
        <p className="text-xs text-green-400 mt-2">
          ✓ Independence: Previous draws don&apos;t affect future options
        </p>
      </div>
    )
  },
  {
    title: "Sampling WITHOUT Replacement",
    content: (
      <div className="space-y-3">
        <p>Items are <em className="text-red-400">removed</em> after selection.</p>
        <div className="bg-neutral-900 p-3 rounded-lg border border-red-500/20">
          <p className="text-red-400 font-mono text-lg text-center mb-2">Total = n × (n-1) × ... × (n-r+1)</p>
          <p className="text-sm text-neutral-400 text-center">This equals P(n,r) = n!/(n-r)!</p>
        </div>
        <div className="mt-3 bg-neutral-800 p-3 rounded">
          <p className="text-sm text-neutral-300 mb-2">Example: Draw 3 cards from a deck</p>
          <p className="font-mono text-xs">52 × 51 × 50 = 132,600 sequences</p>
          <p className="text-xs text-neutral-500 mt-1">Each card can only appear once</p>
        </div>
        <p className="text-xs text-red-400 mt-2">
          ✗ Dependence: Each draw reduces future choices
        </p>
      </div>
    )
  },
  {
    title: "Comparing the Methods",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">See the dramatic difference:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm mb-1">With Replacement</p>
            <p className="font-mono text-xs">n = 5, r = 3</p>
            <p className="font-mono text-lg mt-1">5³ = 125</p>
          </div>
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm mb-1">Without Replacement</p>
            <p className="font-mono text-xs">n = 5, r = 3</p>
            <p className="font-mono text-lg mt-1">5×4×3 = 60</p>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-3 text-center">
          Without replacement always gives fewer possibilities!
        </p>
      </div>
    )
  },
  {
    title: "Using This Visualization",
    content: (
      <div className="space-y-3">
        <p className="mb-2">Watch the animation to see the difference:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔄</span>
            <div>
              <strong>With Replacement:</strong> Ball returns via curved path
              <p className="text-xs text-neutral-500">All balls stay available</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400">❌</span>
            <div>
              <strong>Without Replacement:</strong> Ball fades out
              <p className="text-xs text-neutral-500">Selected balls become unavailable</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Run trials and observe the sequence patterns!
        </p>
      </div>
    )
  }
];

// Tutorial for Section 1.5.1 - Probability of Events
export const tutorial_1_5_1 = [
  {
    title: "Understanding Probability",
    content: (
      <div className="space-y-3">
        <p className="text-base">Probability measures <em className="text-cyan-400">how likely</em> an event is to occur.</p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">P(A) = |A| / |S|</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-300">
            <div className="text-center">
              <p className="font-semibold">|A|</p>
              <p className="text-xs text-neutral-500">Favorable outcomes</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">|S|</p>
              <p className="text-xs text-neutral-500">Total outcomes</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500 text-center">
          This assumes all outcomes are equally likely (classical probability)
        </p>
      </div>
    )
  },
  {
    title: "Probability Rules",
    content: (
      <div className="space-y-3">
        <p className="text-base mb-2">Three fundamental axioms:</p>
        <div className="space-y-2">
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-green-500">
            <p className="font-mono text-sm text-green-400">0 ≤ P(A) ≤ 1</p>
            <p className="text-xs text-neutral-400 mt-1">Probability is always between 0 and 1</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-blue-500">
            <p className="font-mono text-sm text-blue-400">P(S) = 1</p>
            <p className="text-xs text-neutral-400 mt-1">Something must happen (certainty)</p>
          </div>
          <div className="bg-neutral-800 p-3 rounded border-l-4 border-purple-500">
            <p className="font-mono text-sm text-purple-400">P(∅) = 0</p>
            <p className="text-xs text-neutral-400 mt-1">Nothing cannot happen (impossibility)</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Die Example: Events",
    content: (
      <div className="space-y-3">
        <p>A fair die has sample space S = {1, 2, 3, 4, 5, 6}</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
            <p className="text-blue-400 font-semibold text-sm">Even Numbers</p>
            <p className="font-mono text-xs mt-1">A = {2, 4, 6}</p>
            <p className="text-xs text-neutral-500 mt-1">P(A) = 3/6 = 1/2</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-semibold text-sm">Prime Numbers</p>
            <p className="font-mono text-xs mt-1">B = {2, 3, 5}</p>
            <p className="text-xs text-neutral-500 mt-1">P(B) = 3/6 = 1/2</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-purple-400 font-semibold text-sm">Greater than 4</p>
            <p className="font-mono text-xs mt-1">C = {5, 6}</p>
            <p className="text-xs text-neutral-500 mt-1">P(C) = 2/6 = 1/3</p>
          </div>
          <div className="bg-orange-900/20 p-3 rounded border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-sm">Multiples of 3</p>
            <p className="font-mono text-xs mt-1">D = {3, 6}</p>
            <p className="text-xs text-neutral-500 mt-1">P(D) = 2/6 = 1/3</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Law of Large Numbers",
    content: (
      <div className="space-y-3">
        <p className="text-base">The magic of probability: <em className="text-yellow-400">Convergence!</em></p>
        <div className="bg-gradient-to-r from-red-900/20 via-yellow-900/20 to-green-900/20 p-4 rounded-lg border border-neutral-600">
          <p className="text-center text-sm font-semibold mb-3">As trials increase...</p>
          <div className="flex items-center justify-between text-xs">
            <div className="text-center">
              <p className="text-red-400 font-mono">n = 10</p>
              <p className="text-neutral-500">High variation</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-mono">n = 100</p>
              <p className="text-neutral-500">Getting closer</p>
            </div>
            <div className="text-center">
              <p className="text-green-400 font-mono">n → ∞</p>
              <p className="text-neutral-500">Converges!</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 text-center">
          Experimental probability approaches theoretical probability
        </p>
      </div>
    )
  },
  {
    title: "Using This Visualization",
    content: (
      <div className="space-y-3">
        <p className="mb-2">Interactive features to explore:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎲</span>
            <div>
              <strong>Visual Dice:</strong> See which outcomes are favorable
              <p className="text-xs text-neutral-500">Highlighted dice show event members</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong>Live Comparison:</strong> Theoretical vs Experimental
              <p className="text-xs text-neutral-500">Watch the bars converge as trials increase</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">🎯</span>
            <div>
              <strong>Auto-Run:</strong> Set target trials and watch convergence
              <p className="text-xs text-neutral-500">See the Law of Large Numbers in action!</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-neutral-300 mt-3">
          🎯 <strong>Try it:</strong> Run 1000+ trials to see clear convergence!
        </p>
      </div>
    )
  }
];
