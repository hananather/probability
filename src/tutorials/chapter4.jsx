// Chapter 4 Tutorials: Descriptive Statistics & Sampling

export const tutorial_4_1_0 = [
  {
    title: "What Makes a Value 'Central'?",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Imagine your class just got their test scores back. The principal asks: 
          <span className="text-cyan-400"> "How did the class do?"</span>
        </p>
        
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center">
            Central Tendency = The "Typical" Value
          </p>
          <p className="text-sm text-neutral-400 text-center">
            A single number that represents your entire dataset
          </p>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Click anywhere to add data points and discover the center!
        </p>
      </div>
    )
  },
  {
    title: "The Mean: Democracy in Action",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          The <span className="text-blue-400">mean</span> gives every data point an equal vote.
          It's the balance point of your data.
        </p>
        
        <div className="bg-neutral-800 p-3 rounded">
          <p className="text-sm">
            💡 Watch the seesaw balance when you find the mean!
          </p>
        </div>
        
        <p className="text-sm text-yellow-400">
          ⚠️ But be careful - outliers can tip the balance
        </p>
      </div>
    )
  },
  {
    title: "The Median: The True Middle",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          The <span className="text-green-400">median</span> is the middle value when sorted.
          Half the data is above, half below.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900 p-3 rounded text-center">
            <p className="text-xs text-neutral-400">Odd number of values</p>
            <p className="text-sm font-mono">Middle value</p>
          </div>
          <div className="bg-neutral-900 p-3 rounded text-center">
            <p className="text-xs text-neutral-400">Even number of values</p>
            <p className="text-sm font-mono">Average of two middle</p>
          </div>
        </div>
        
        <p className="text-sm text-green-400">
          🛡️ The median resists outliers - it's stable!
        </p>
      </div>
    )
  },
  {
    title: "The Mode: The Popular Choice",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          The <span className="text-amber-400">mode</span> is simply the most frequent value.
          It's what's most popular in your data.
        </p>
        
        <div className="bg-neutral-900 p-4 rounded-lg border border-amber-500/20">
          <p className="text-amber-400 font-mono text-center">
            Mode = Most Common Value
          </p>
          <p className="text-sm text-neutral-400 text-center mt-2">
            Can have multiple modes (or none!)
          </p>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Create duplicate values to see modes appear
        </p>
      </div>
    )
  },
  {
    title: "When to Use Which?",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Different measures for different situations:
        </p>
        
        <div className="space-y-2">
          <div className="bg-neutral-900 p-3 rounded">
            <p className="text-blue-400 font-semibold">Use Mean when:</p>
            <p className="text-sm">Data is symmetric, no extreme outliers</p>
          </div>
          
          <div className="bg-neutral-900 p-3 rounded">
            <p className="text-green-400 font-semibold">Use Median when:</p>
            <p className="text-sm">Data has outliers or is skewed</p>
          </div>
          
          <div className="bg-neutral-900 p-3 rounded">
            <p className="text-amber-400 font-semibold">Use Mode when:</p>
            <p className="text-sm">Data is categorical or you need the most common</p>
          </div>
        </div>
      </div>
    )
  }
];

export const tutorial_4_1_2 = [
  {
    title: "Challenge Mode Activated!",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Ready to test your understanding? Complete challenges to unlock achievements!
        </p>
        
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/30">
          <p className="text-purple-400 font-mono text-center">
            🏆 Challenges = Deep Learning
          </p>
          <p className="text-sm text-neutral-400 text-center">
            Each challenge reinforces a key concept
          </p>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Start with beginner challenges and work your way up!
        </p>
      </div>
    )
  },
  {
    title: "Interactive Modes",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Three ways to interact with data:
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-800 p-2 rounded text-center">
            <p className="text-xl">➕</p>
            <p className="text-xs">Add Points</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded text-center">
            <p className="text-xl">➖</p>
            <p className="text-xs">Remove Points</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded text-center">
            <p className="text-xl">↔️</p>
            <p className="text-xs">Move Points</p>
          </div>
        </div>
        
        <p className="text-sm text-yellow-400">
          💡 Try different modes to explore how measures change
        </p>
      </div>
    )
  },
  {
    title: "Unlock Achievements",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Your progress is tracked with achievements:
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-sm">First Data - Add your first point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-sm">Balance Master - Perfect balance achieved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm">Outlier Hunter - Discover outlier effects</span>
          </div>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Can you unlock them all?
        </p>
      </div>
    )
  }
];

// Histogram tutorials
export const tutorial_4_2_1 = [
  {
    title: "From Data Points to Bins",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          A <span className="text-purple-400">histogram</span> groups similar values together
          into bins, showing the shape of your data.
        </p>
        
        <div className="bg-neutral-900 p-4 rounded-lg border border-purple-500/20">
          <p className="text-purple-400 font-mono text-lg text-center">
            Histogram = Data Distribution Shape
          </p>
          <p className="text-sm text-neutral-400 text-center">
            Height shows frequency in each bin
          </p>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Try: Adjust bin size to see different patterns emerge
        </p>
      </div>
    )
  }
];

// Sampling distribution tutorials
export const tutorial_4_3_1 = [
  {
    title: "The Magic of Sample Means",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          What happens when you take many samples and calculate their means?
          <span className="text-cyan-400"> Something magical!</span>
        </p>
        
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-center">
            Sample Means → Normal Distribution
          </p>
          <p className="text-sm text-neutral-400 text-center">
            This is the Central Limit Theorem in action!
          </p>
        </div>
        
        <p className="text-sm text-green-400">
          🎯 Draw samples and watch the pattern emerge
        </p>
      </div>
    )
  }
];