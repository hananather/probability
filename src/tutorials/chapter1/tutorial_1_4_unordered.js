// Tutorial content for Unordered Samples (Combinations)
export const tutorial_1_4_unordered = [
  {
    title: "Welcome to Combinations Explorer",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Explore combinations through five interactive tabs:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎰</span>
            <div>
              <strong>Lottery:</strong> Interactive selection visualization
              <p className="text-xs text-neutral-500">Click balls to build combinations</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📐</span>
            <div>
              <strong>Formula:</strong> Step-by-step derivation
              <p className="text-xs text-neutral-500">See how C(n,r) is calculated</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">🔺</span>
            <div>
              <strong>Pascal&apos;s:</strong> Interactive triangle patterns
              <p className="text-xs text-neutral-500">Discover hidden relationships</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-400">🔧</span>
            <div>
              <strong>Builder:</strong> Drag-and-drop combinations
              <p className="text-xs text-neutral-500">Build sets with different item types</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🌍</span>
            <div>
              <strong>Applications:</strong> Real-world examples
              <p className="text-xs text-neutral-500">See combinations in practice</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Understanding Combinations",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          When order doesn&apos;t matter, we use <em className="text-cyan-400">combinations</em>:
        </p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center mb-2">
            C(n,r) = n! / (r!(n-r)!)
          </p>
          <p className="text-sm text-neutral-400 text-center">
            Choose r items from n items
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Insight:</p>
          <p className="text-xs text-neutral-300">
            {"{1,2,3}"} is the same as {"{3,1,2}"} in combinations!
          </p>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-cyan-400 text-sm mb-1">🎯 Try it:</p>
          <p className="text-xs text-neutral-300">
            Use the quick settings (n and r inputs) to explore different combinations
          </p>
        </div>
      </div>
    )
  },
  {
    title: "The Lottery Tab",
    content: (
      <div className="space-y-3">
        <p>The Lottery tab lets you interactively explore combinations:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🎱</span>
            <div>
              <strong>Click balls to select:</strong> Build your combination
              <p className="text-xs text-neutral-500">Numbers are automatically sorted</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✨</span>
            <div>
              <strong>Milestones:</strong> Watch for special notifications
              <p className="text-xs text-neutral-500">Complete selections trigger insights</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🔄</span>
            <div>
              <strong>Order toggle:</strong> See how order affects counting
              <p className="text-xs text-neutral-500">Shows permutations vs combinations</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Try this:</p>
          <p className="text-xs text-neutral-300">
            Click &ldquo;Lottery 6/49&rdquo; button to see real lottery odds!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "The Formula Tab",
    content: (
      <div className="space-y-3">
        <p>The Formula tab shows step-by-step derivation:</p>
        <div className="bg-neutral-800 rounded-lg p-3 space-y-2">
          <p className="text-sm font-semibold text-cyan-400">Interactive Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
            <li>Start with the problem</li>
            <li>Count ordered arrangements (permutations)</li>
            <li>See how each combination appears r! times</li>
            <li>Derive the formula</li>
            <li>Explore properties</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <p className="text-sm">
              Use <span className="font-mono text-cyan-400">Previous/Next</span> buttons to navigate
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">💡 Key Feature:</p>
          <p className="text-xs text-neutral-300">
            Watch the animated visualization in Step 2 showing how permutations group into combinations!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Pascal&apos;s Triangle Tab",
    content: (
      <div className="space-y-3">
        <p>The Pascal&apos;s Triangle tab reveals hidden patterns:</p>
        <div className="bg-neutral-800 rounded-lg p-3 space-y-2">
          <p className="text-sm font-semibold text-green-400">Interactive Features:</p>
          <ul className="space-y-1 text-sm ml-2">
            <li>• <strong>Click cells:</strong> Updates n and r values</li>
            <li>• <strong>Hover cells:</strong> See relationships</li>
            <li>• <strong>Pattern buttons:</strong> Discover 4 patterns</li>
            <li>• <strong>Row slider:</strong> Expand the triangle</li>
          </ul>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-yellow-400 text-sm mb-1">🎯 Pattern Hunt:</p>
          <p className="text-xs text-neutral-300">
            Try to discover all 4 patterns: Symmetry, Hockey Stick, Row Sums, and Recursive!
          </p>
        </div>
        <div className="mt-2 p-3 bg-neutral-800 rounded">
          <p className="text-cyan-400 text-sm mb-1">💡 Pro tip:</p>
          <p className="text-xs text-neutral-300">
            Enable &ldquo;Show Hints&rdquo; if you need help finding patterns
          </p>
        </div>
      </div>
    )
  },
  {
    title: "The Builder Tab",
    content: (
      <div className="space-y-3">
        <p>The Builder tab provides hands-on combination building:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-orange-400">🎨</span>
            <div>
              <strong>Multiple item types:</strong> Numbers, letters, colors, shapes
              <p className="text-xs text-neutral-500">Change the type to explore different sets</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🔄</span>
            <div>
              <strong>Drag & Drop:</strong> Move items between areas
              <p className="text-xs text-neutral-500">Also works with click/tap on mobile</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📊</span>
            <div>
              <strong>Compare mode:</strong> See permutations vs combinations
              <p className="text-xs text-neutral-500">Toggle to understand the difference</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Real-World Applications Tab",
    content: (
      <div className="space-y-3">
        <p>The Applications tab shows combinations in practice:</p>
        <div className="space-y-2">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
            <h4 className="font-semibold text-purple-400 text-sm mb-1">Interactive Examples</h4>
            <p className="text-xs text-neutral-300">
              • Lottery (6/49) - See real odds<br/>
              • Team Selection - Pick players<br/>
              • Restaurant Menu - Choose dishes<br/>
              • Committee Formation - Select members<br/>
              • Pizza Toppings - Build your pizza<br/>
              • Card Hands - Poker combinations
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-neutral-800 rounded">
          <p className="text-cyan-400 text-sm mb-1">🎯 Try this:</p>
          <p className="text-xs text-neutral-300">
            Click any example to load its values and see detailed calculations!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Tips & Tricks",
    content: (
      <div className="space-y-3">
        <p>Get the most out of this visualization:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✅</span>
            <div>
              <strong>Quick presets:</strong> Use &ldquo;Simple (6,3)&rdquo; or &ldquo;Lottery 6/49&rdquo;
              <p className="text-xs text-neutral-500">Jump to common examples instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🔍</span>
            <div>
              <strong>Info bar:</strong> Compare permutations and combinations
              <p className="text-xs text-neutral-500">See the relationship C = P/r!</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">📱</span>
            <div>
              <strong>Mobile friendly:</strong> All features work on touch devices
              <p className="text-xs text-neutral-500">Tabs scroll horizontally if needed</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];