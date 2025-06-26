# Central Tendency: University-Level Mathematical Curriculum

## I. Foundational Concepts & Definitions

### 1.1 Mean (Arithmetic Mean)
- **Definition**: $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$
- **Population mean**: $\mu = \frac{1}{N}\sum_{i=1}^{N} x_i$
- **Weighted mean**: $\bar{x}_w = \frac{\sum_{i=1}^{n} w_i x_i}{\sum_{i=1}^{n} w_i}$

### 1.2 Median
- **Definition**: Middle value when data is ordered
- **Mathematical formulation**: 
  - Odd n: $x_{(\frac{n+1}{2})}$
  - Even n: $\frac{x_{(\frac{n}{2})} + x_{(\frac{n}{2}+1)}}{2}$
- **Continuous case**: Value m such that $P(X \leq m) = P(X \geq m) = 0.5$

### 1.3 Mode
- **Definition**: Most frequent value(s)
- **Continuous distributions**: Value(s) where pdf is maximized
- **Multimodal distributions**: Multiple local maxima

## II. Deeper Mathematical Insights

### 2.1 Mean as Expected Value
- **Connection to probability theory**: $E[X] = \int_{-\infty}^{\infty} x f(x) dx$
- **Properties of expectation**:
  - Linearity: $E[aX + b] = aE[X] + b$
  - For independent variables: $E[XY] = E[X]E[Y]$
- **Law of Large Numbers**: $\bar{X}_n \xrightarrow{P} \mu$ as $n \to \infty$
- **Central Limit Theorem**: $\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} N(0,1)$

### 2.2 Median as L¹ Minimizer
- **Optimization perspective**: $\text{median} = \arg\min_c \sum_{i=1}^{n} |x_i - c|$
- **Proof using subgradients**
- **Connection to robust statistics**
- **Geometric median in higher dimensions**

### 2.3 Mode as Maximum Likelihood Estimator
- **For uniform distribution on [θ-½, θ+½]**: MLE = mode
- **Kernel density estimation**: Mode = arg max of KDE
- **Connection to MAP (Maximum A Posteriori) estimation**

## III. Important Properties & Theorems

### 3.1 Robustness & Breakdown Points
- **Breakdown point definition**: Proportion of outliers that can arbitrarily affect estimator
- **Mean**: Breakdown point = 0 (single outlier can have unbounded effect)
- **Median**: Breakdown point = 0.5 (most robust possible)
- **Trimmed mean**: Intermediate robustness

### 3.2 Influence Functions
- **Mean influence function**: $IF(x; \bar{x}, F) = x - \mu$
- **Median influence function**: Bounded, sign function at F
- **Asymptotic variance comparison**

### 3.3 Relationships to Distributions

#### Symmetric Distributions
- **Theorem**: For symmetric unimodal distributions, mean = median = mode
- **Examples**: Normal, t-distribution (with df > 1), uniform

#### Skewed Distributions
- **Right-skewed**: mode < median < mean
- **Left-skewed**: mean < median < mode
- **Pearson's skewness coefficients**

#### Special Cases
- **Cauchy distribution**: Mean undefined, median exists
- **Pareto distribution**: Mean may not exist for α ≤ 1
- **Log-normal**: Relationships between arithmetic, geometric, and harmonic means

### 3.4 Jensen's Inequality
- For convex function f: $f(E[X]) \leq E[f(X)]$
- Applications to means of transformed data
- AM-GM-HM inequality as special case

## IV. Mathematical Applications & Connections

### 4.1 Statistical Inference
- **Method of Moments**: Equating sample mean to population mean
- **Maximum Likelihood**: Mode connection for certain distributions
- **Bayesian inference**: Posterior mean, median, mode as point estimates
- **Loss functions**: Squared loss → mean, absolute loss → median

### 4.2 Optimization Theory
- **Mean**: Minimizes squared deviations (L² norm)
- **Median**: Minimizes absolute deviations (L¹ norm)
- **Mode**: Maximizes likelihood/density
- **M-estimators**: Generalization using ψ-functions

### 4.3 Information Theory
- **Entropy maximization**: Under moment constraints
- **Kullback-Leibler divergence**: Role of mean in exponential families
- **Fisher information**: Variance of score function at mode

### 4.4 Functional Analysis
- **Mean as projection**: In L² spaces
- **Median in Banach spaces**: Geometric median
- **Fréchet mean**: Generalization to metric spaces

### 4.5 Time Series & Stochastic Processes
- **Moving averages**: Local means
- **Median filters**: Robust signal processing
- **Ergodic theorems**: Time average = ensemble average

## V. Common Misconceptions to Address

### 5.1 "Average" Ambiguity
- **Misconception**: "Average" always means arithmetic mean
- **Reality**: Could refer to mean, median, or mode depending on context
- **Teaching approach**: Emphasize precise terminology

### 5.2 Outlier Effects
- **Misconception**: Small number of outliers don't matter
- **Reality**: Single outlier can drastically affect mean
- **Demonstration**: Interactive visualization showing breakdown

### 5.3 Distribution Assumptions
- **Misconception**: Mean is always the "best" measure
- **Reality**: Depends on distribution and objective
- **Examples**: 
  - Income data → median often more informative
  - Categorical data → mode is only option

### 5.4 Sample vs Population
- **Misconception**: Sample mean = population mean
- **Reality**: Sample mean is estimate with uncertainty
- **Key concept**: Sampling distribution of mean

### 5.5 Existence Assumptions
- **Misconception**: Mean always exists
- **Reality**: Heavy-tailed distributions may have undefined mean
- **Examples**: Cauchy, certain Pareto distributions

### 5.6 Uniqueness
- **Misconception**: Central tendency measures are always unique
- **Reality**: 
  - Median may be non-unique for even n
  - Multiple modes possible
  - Different definitions for grouped data

## VI. Advanced Topics & Extensions

### 6.1 Multivariate Central Tendency
- **Componentwise means**: Limitations
- **Geometric median**: L¹ multivariate generalization
- **Spatial median**: Robust multivariate location
- **Depth-based measures**: Tukey depth, simplicial depth

### 6.2 Functional Data
- **Mean functions**: Pointwise vs L² mean
- **Median functions**: Various definitions
- **Mode functions**: Via density estimation

### 6.3 Computational Aspects
- **Online algorithms**: Updating mean incrementally
- **Approximate medians**: Streaming algorithms
- **Parallel computation**: MapReduce for large-scale means

### 6.4 Robust Alternatives
- **Trimmed mean**: α-trimmed mean
- **Winsorized mean**: Replacing rather than removing extremes
- **Hodges-Lehmann estimator**: Median of pairwise averages
- **Biweight location**: Redescending ψ-function

## VII. Pedagogical Recommendations

### 7.1 Conceptual Progression
1. Start with finite samples (concrete)
2. Move to probability distributions (abstract)
3. Connect to optimization (unifying framework)
4. Explore robustness (practical considerations)

### 7.2 Interactive Components
- **Visualization**: Effect of outliers on different measures
- **Simulation**: Sampling distributions
- **Optimization**: Gradient descent for finding minima
- **Real data**: Income, grades, scientific measurements

### 7.3 Problem Sets Should Include
1. Theoretical proofs (influence functions, breakdown points)
2. Computational exercises (implementing robust estimators)
3. Data analysis (choosing appropriate measures)
4. Simulation studies (comparing estimator properties)

### 7.4 Connections to Make Explicit
- Probability theory ↔ Statistics
- Optimization ↔ Estimation
- Robustness ↔ Real-world data
- Computation ↔ Theory

## VIII. Assessment Ideas

### 8.1 Conceptual Understanding
- Explain when to use each measure
- Identify misconceptions in given scenarios
- Prove basic properties

### 8.2 Technical Skills
- Derive influence functions
- Calculate breakdown points
- Implement robust estimators

### 8.3 Application
- Analyze real datasets
- Choose and justify measures
- Interpret results in context

### 8.4 Integration
- Connect to other statistical concepts
- Relate to optimization theory
- Apply in novel contexts