// Monty Hall Problem Tutorial
// Guides users through understanding this counterintuitive probability puzzle

export const tutorial_1_7_monty_hall = [
  {
    title: "Welcome to the Monty Hall Problem!",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          You're about to discover one of probability's most famous paradoxes.
        </p>
        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-300">
            🎯 <strong>Your Goal:</strong> Win a car by choosing the right door!
          </p>
        </div>
        <p className="text-sm text-gray-400">
          What seems like a simple game will challenge your intuition about probability...
        </p>
      </div>
    )
  },
  {
    title: "How the Game Works",
    content: (
      <div className="space-y-3">
        <p className="text-base font-semibold text-blue-400">The Setup:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400">1.</span>
            <span>Three doors: one hides a car 🚗, two hide goats 🐐</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">2.</span>
            <span>You pick a door (but don't open it yet)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">3.</span>
            <span>The host opens a different door, revealing a goat</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">4.</span>
            <span>You decide: stick with your door or switch?</span>
          </div>
        </div>
        <p className="text-xs text-yellow-400 mt-3">
          ⚡ The host ALWAYS knows what's behind each door!
        </p>
      </div>
    )
  },
  {
    title: "Your First Game",
    content: (
      <div className="space-y-3">
        <p className="text-base">Let's play! Click any door to make your initial choice.</p>
        <div className="bg-purple-900/20 p-3 rounded-lg">
          <p className="text-sm text-purple-300">
            💭 <strong>Think:</strong> What are your chances of picking the car on your first try?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            With 3 doors and 1 car, it's 1/3 or about 33.3%
          </p>
        </div>
        <p className="text-sm text-gray-300">
          Remember this probability—it's key to understanding the paradox!
        </p>
      </div>
    ),
    target: '.flex.gap-8',
    position: 'bottom'
  },
  {
    title: "The Critical Decision",
    content: (
      <div className="space-y-3">
        <p className="text-base">The host has revealed a goat. Now you must decide:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm">Stay</p>
            <p className="text-xs text-gray-400">Keep your original choice</p>
          </div>
          <div className="bg-violet-900/20 p-3 rounded border border-violet-500/30">
            <p className="text-violet-400 font-semibold text-sm">Switch</p>
            <p className="text-xs text-gray-400">Change to the other door</p>
          </div>
        </div>
        <p className="text-sm text-yellow-400">
          🤔 Most people think it's now 50-50. But is it really?
        </p>
      </div>
    )
  },
  {
    title: "Play Multiple Games",
    content: (
      <div className="space-y-3">
        <p className="text-base">Play several games and track your results!</p>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-300 mb-2">Try this experiment:</p>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Play 10 games always staying</li>
            <li>• Play 10 games always switching</li>
            <li>• Compare your win rates</li>
          </ul>
        </div>
        <p className="text-sm text-blue-400">
          📊 Your statistics will update automatically below the game.
        </p>
      </div>
    )
  },
  {
    title: "Run a Simulation",
    target: 'button:contains("Run Simulation")',
    content: (
      <div className="space-y-3">
        <p className="text-base">Let's test this at scale!</p>
        <p className="text-sm text-gray-300">
          Click the "Run Simulation" tab to test thousands of games automatically.
        </p>
        <div className="bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-300">
            🚀 The simulation will play both strategies and show you the results in real-time!
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Watch as the win rates converge to surprising values...
        </p>
      </div>
    ),
    position: 'top'
  },
  {
    title: "The Surprising Truth",
    content: (
      <div className="space-y-3">
        <p className="text-base font-semibold">The results are in!</p>
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-400">33.3%</p>
              <p className="text-xs text-gray-400">Stay wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-400">66.7%</p>
              <p className="text-xs text-gray-400">Switch wins</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-yellow-400">
          💡 Switching doubles your chances of winning!
        </p>
      </div>
    )
  },
  {
    title: "Understanding Why",
    target: 'button:contains("See the Math")',
    content: (
      <div className="space-y-3">
        <p className="text-base">But why does switching work?</p>
        <p className="text-sm text-gray-300">
          Click "See the Math" to explore the probability tree and understand the logic.
        </p>
        <div className="bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-300">
            🔑 <strong>Key insight:</strong> Your initial 1/3 chance doesn't change when the host reveals a goat!
          </p>
        </div>
        <p className="text-xs text-gray-400">
          The probability tree shows all possible game outcomes...
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    title: "The Intuitive Explanation",
    content: (
      <div className="space-y-3">
        <p className="text-base font-semibold text-green-400">Think of it this way:</p>
        <div className="space-y-2 text-sm">
          <p>When you first pick a door:</p>
          <ul className="ml-4 space-y-1 text-gray-300">
            <li>• 1/3 chance you picked the car</li>
            <li>• 2/3 chance the car is behind one of the other doors</li>
          </ul>
        </div>
        <div className="bg-purple-900/20 p-3 rounded-lg mt-3">
          <p className="text-sm text-purple-300">
            When the host reveals a goat, they're essentially showing you which of the two other doors has the car (if either does).
          </p>
          <p className="text-xs text-gray-400 mt-2">
            By switching, you get the 2/3 probability that was split between those doors!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Real-World Applications",
    content: (
      <div className="space-y-3">
        <p className="text-base">This paradox teaches us:</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <p className="text-sm font-semibold">Information changes probability</p>
              <p className="text-xs text-gray-400">New information can dramatically shift odds</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🧠</span>
            <div>
              <p className="text-sm font-semibold">Intuition can mislead</p>
              <p className="text-xs text-gray-400">Mathematical analysis reveals hidden truths</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🎯</span>
            <div>
              <p className="text-sm font-semibold">Conditional probability matters</p>
              <p className="text-xs text-gray-400">Used in medical testing, quality control, and AI</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Congratulations! 🎉",
    content: (
      <div className="space-y-3">
        <p className="text-base">You've mastered the Monty Hall Problem!</p>
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-500/30">
          <p className="text-lg font-semibold text-green-400 text-center mb-2">
            Always switch doors!
          </p>
          <p className="text-sm text-gray-300 text-center">
            It doubles your chances from 33.3% to 66.7%
          </p>
        </div>
        <p className="text-sm text-gray-300">
          Keep exploring to test variations:
        </p>
        <ul className="text-xs text-gray-400 ml-4 space-y-1">
          <li>• What if there were 4 doors? Or 10?</li>
          <li>• What if the host could open the car door?</li>
          <li>• How does this relate to Bayes' theorem?</li>
        </ul>
      </div>
    )
  }
];