// Centralized configuration for sidebar chapters
export const chapters = [
  {
    title: 'Overview',
    path: '/overview',
    sections: [
      { title: 'Chance Events', url: '#chance-events' },
      { title: 'Expectation & Variance', url: '#expectation-variance' },
      { title: 'Central Limit Theorem', url: '#central-limit-theorem' },
      { title: 'Point Estimation', url: '#point-estimation' },
      { title: 'Confidence Interval', url: '#confidence-interval' },
      { title: 'Bootstrapping', url: '#bootstrapping' },
      { title: 'Bayesian Inference', url: '#bayesian-inference' },
    ]
  },
  {
    title: 'Chapter 1: Introduction to Probabilities',
    path: '/chapter1',
    sections: [
      { title: 'Sample Spaces & Events', component: 'SampleSpacesEvents' },
      { title: 'Counting Techniques', component: 'CountingTechniques' },
      { title: 'Ordered Samples (Permutations)', component: 'OrderedSamples' },
      { title: 'Unordered Samples (Combinations)', component: 'UnorderedSamples' },
      { title: 'Probability of an Event', component: 'ProbabilityEvent' },
      { title: 'Conditional Probability', component: 'ConditionalProbability' },
      { title: 'Probabilistic Fallacies', component: 'ProbabilisticFallacies' },
      { title: 'Monty Hall Masterclass', component: 'MontyHallMasterclass' },
    ]
  },
  {
    title: 'Chapter 2: Discrete Random Variables',
    path: '/chapter2',
    sections: [
      { title: '2.1 Random Variables & Distributions', component: 'SpatialRandomVariable' },
      { title: '2.2 Expectation & Variance', component: 'ExpectationVariance' },
      { title: '2.2 Worked Example', component: 'ExpectationVarianceWorkedExample' },
      { title: '2.3.1 Linear Transformations', component: 'LinearTransformations' },
      { title: '2.3.2 Function Transformations', component: 'FunctionTransformations' },
      { title: '2.3.3 Binomial Distribution', component: 'BinomialDistribution' },
      { title: '2.4 Geometric Distribution', component: 'GeometricDistribution' },
      { title: '2.5 Negative Binomial Distribution', component: 'NegativeBinomialDistribution' },
      { title: '2.6 Poisson Distribution', component: 'PoissonDistribution' },
      { title: '2.7 Distribution Comparison', component: 'DistributionComparison' },
    ]
  },
  {
    title: 'Chapter 3: Continuous Random Variables',
    path: '/chapter3',
    sections: [
      { title: 'Introduction: Bridge to Continuous', component: 'BridgeToContinuous' },
      { title: '3.1 Probability Density Functions', component: 'ContinuousDistributionsPDF' },
      { title: '3.2 Expectation & Variance', component: 'ContinuousExpectationVariance' },
      { title: '3.3 Normal Distributions', component: 'NormalZScoreExplorer' },
      { title: '3.4 Exponential Distributions', component: 'ExponentialDistribution' },
      { title: '3.5 Gamma Distributions', component: 'GammaDistribution' },
      { title: '3.6 Joint Distributions', component: 'JointDistributions' },
      { title: '3.7 Normal Approximation', component: 'NormalApproxBinomial' },
    ]
  },
  {
    title: 'Chapter 4: Descriptive Statistics and Sampling Distributions',
    path: '/chapter4',
    sections: [
      { title: '4.1 Data Descriptions', component: 'central-tendency-hub' },
      { title: '4.2 Visual Summaries', component: 'histograms' },
      { title: '4.3 Sampling Distributions', component: 'sampling-distributions-hub' },
      { title: '4.4 t-Distribution vs Normal', component: 't-distribution' },
      { title: '4.5 F-Distribution Explorer', component: 'f-distribution' },
      { title: '4.5 F-Distribution Worked Example', component: 'f-distribution-worked' },
      { title: '4.6 Boxplot & Quartiles Explorer', component: 'boxplot-quartiles' },
    ]
  },
  {
    title: 'Chapter 5: Estimation',
    path: '/chapter5',
    sections: [
      { title: '5.1 Statistical Inference', component: 'StatisticalInferenceHub' },
      { title: '5.2 Confidence Intervals (σ Known)', component: 'CIKnownVarianceHub' },
      { title: '5.3 Sample Size Determination', component: 'SampleSizeHub' },
      { title: '5.4 Confidence Intervals (σ Unknown)', component: 'CIUnknownVarianceHub' },
      { title: '5.5 Proportion Confidence Intervals', component: 'ProportionsHub' },
    ]
  },
  {
    title: 'Chapter 6: Hypothesis Testing',
    path: '/chapter6',
    sections: [
      { title: 'Coin Bias Detection Game', component: 'HypothesisTestingGame' },
    ]
  },
  {
    title: 'Chapter 7: Linear Regression & Correlation',
    path: '/chapter7',
    sections: [
      { title: 'Coming Soon...', disabled: true },
    ]
  },
  {
    title: '🧪 Learning Sandbox',
    path: '/learn',
    sections: [
      { title: 'React Experiments', url: '' },
    ]
  },
];