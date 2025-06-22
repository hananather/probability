// Chapter 4 Tutorial Steps
import React from 'react';

export const tutorial_4_3_1 = [
  {
    title: "Welcome to Sampling Distributions!",
    content: "This interactive visualization helps you understand how sample means form a predictable pattern called the sampling distribution.",
    target: ".visualization-title"
  },
  {
    title: "Sample Size Control",
    content: "Adjust the sample size (n) to see how it affects the spread of sample means. Larger samples lead to less variability!",
    target: "[data-tutorial='sample-size']"
  },
  {
    title: "Taking Samples",
    content: "Click 'Take Sample' to draw random observations and calculate their mean. Each mean becomes a point in the distribution.",
    target: "[data-tutorial='take-sample']"
  },
  {
    title: "Building the Distribution",
    content: "Take many samples to see the pattern emerge. The more samples you take, the clearer the bell-shaped curve becomes!",
    target: "[data-tutorial='take-many']"
  },
  {
    title: "Central Limit Theorem",
    content: "Notice how sample means cluster around the population mean (μ=100) and follow a normal distribution - this is the Central Limit Theorem in action!",
    target: "[data-tutorial='visualization']"
  },
  {
    title: "Standard Error",
    content: "The standard error (SE = σ/√n) tells us how much sample means typically vary. Watch how it changes with sample size!",
    target: "[data-tutorial='statistics']"
  }
];

// Enhanced tutorial with interactive elements
export const tutorial_4_3_1_enhanced = [
  {
    title: "The Magic of Averages",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          What happens when we take many samples and plot their averages?
        </p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-cyan-500/20">
          <p className="text-cyan-400 font-mono text-lg text-center">
            SE = σ / √n
          </p>
          <p className="text-sm text-neutral-400 text-center mt-2">
            Standard Error decreases with larger samples
          </p>
        </div>
        <p className="text-sm text-green-400">
          🎯 Try: Take a single sample to begin
        </p>
      </div>
    ),
    highlight: ["[data-tutorial='take-sample']"]
  },
  {
    title: "Understanding Sample Size",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          The <span className="text-cyan-400">sample size (n)</span> controls how many observations we take.
        </p>
        <div className="bg-neutral-800 p-3 rounded">
          <p className="text-sm mb-2">Larger samples mean:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• More accurate estimates</li>
            <li>• Less variability between samples</li>
            <li>• Smaller standard error</li>
          </ul>
        </div>
        <p className="text-sm text-green-400">
          🎯 Try: Adjust the slider and notice SE changes
        </p>
      </div>
    ),
    highlight: ["[data-tutorial='sample-size']"]
  },
  {
    title: "Building the Distribution",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Each sample mean becomes a <span className="text-purple-400">data point</span> in our histogram.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-cyan-400 font-semibold">Few samples</p>
            <p className="text-neutral-400">Random pattern</p>
          </div>
          <div className="bg-neutral-800 p-2 rounded">
            <p className="text-purple-400 font-semibold">Many samples</p>
            <p className="text-neutral-400">Bell curve emerges</p>
          </div>
        </div>
        <p className="text-sm text-green-400">
          🎯 Try: Take 100 samples for faster results!
        </p>
      </div>
    ),
    highlight: ["[data-tutorial='take-many']"]
  },
  {
    title: "Central Limit Theorem in Action",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Watch the <span className="text-yellow-400">magic</span> happen as the distribution becomes normal!
        </p>
        <div className="bg-neutral-900 p-4 rounded-lg border border-purple-500/20">
          <p className="text-purple-400 font-semibold text-center mb-2">
            Central Limit Theorem
          </p>
          <p className="text-sm text-neutral-300 text-center">
            Sample means follow a normal distribution<br/>
            regardless of the original population shape
          </p>
        </div>
        <p className="text-sm text-green-400">
          🎯 Enable &quot;Show theoretical curve&quot; to compare
        </p>
      </div>
    ),
    highlight: ["[data-tutorial='visualization']"]
  },
  {
    title: "Tracking Your Progress",
    content: (
      <div className="space-y-3">
        <p className="text-base">
          Complete <span className="text-green-400">milestones</span> and <span className="text-purple-400">challenges</span> as you explore!
        </p>
        <div className="bg-neutral-800 p-3 rounded">
          <p className="text-sm font-semibold text-cyan-400 mb-2">Pro Tips:</p>
          <ul className="text-sm space-y-1 text-neutral-300">
            <li>📊 Compare different sample sizes</li>
            <li>🎯 Complete all challenges</li>
            <li>✨ Reach 500 samples for mastery</li>
          </ul>
        </div>
        <p className="text-sm text-yellow-400">
          💡 The more you experiment, the deeper your understanding!
        </p>
      </div>
    )
  }
];