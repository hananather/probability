Final Plan: Sampling Distributions with Guided Discovery Framework

  Hub Component: 4-3-0-SamplingDistributionsHub

  Title: Sampling Distributions Hub

  Intuitive Introduction:
  "When we take samples from a population and calculate statistics (like the mean), those statistics themselves follow predictable
  patterns. Understanding these patterns unlocks the door to statistical inference."

  Central Visual Anchor:
  - Interactive animation showing population → multiple samples → distribution of sample means
  - User can adjust sample size and watch the sampling distribution transform in real-time
  - Visual emphasis on how sample means cluster around population mean

  Roadmap (Spokes):
  1. "Why do sample means cluster around the population mean?"
    - Explores foundations of sampling distributions
  2. "What happens to averages as we take more samples?"
    - Discovers the Central Limit Theorem
  3. "How can we predict the reliability of our estimates?"
    - Applies sampling distributions to real problems

  ---
  Spoke 1: Foundations of Sampling Distributions

  Core Question: "Why do sample means cluster around the population mean?"

  Exploration Phase:
  1. Start with a known population (e.g., heights of all students)
  2. Interactive sampling: Draw samples of size n, calculate x̄
  3. Build histogram of sample means through repeated sampling
  4. Observe the pattern emerging around μ

  "Aha!" Moment:
  - Sample means form their own distribution
  - This distribution centers on the population mean
  - Spread decreases as sample size increases

  Formalization:
  - Definition: Sampling distribution of X̄
  - Mathematical proof: E[X̄] = μ
  - Variance formula: Var[X̄] = σ²/n
  - Standard error: SE(X̄) = σ/√n

  ---
  Spoke 2: Central Limit Theorem

  Core Question: "What happens to the shape of sample mean distributions as we take larger samples?"

  Exploration Phase:
  1. Start with non-normal population (exponential, uniform, bimodal)
  2. Slider for sample size n = 1 to 100
  3. Watch sampling distribution transform from original shape → bell curve
  4. Compare different starting distributions

  "Aha!" Moment:
  - Regardless of population shape, sample means become normal
  - The transformation happens around n = 30
  - Larger n = better approximation

  Formalization:
  - CLT statement: (X̄ - μ)/(σ/√n) → N(0,1)
  - Conditions: finite variance, independence
  - Practical applications and limitations