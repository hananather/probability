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
      { title: 'Unordered Samples (Combinations)', component: 'UnorderedSamples', customPath: '/chapter1/1-4' },
      { title: 'Probability of an Event', component: 'ProbabilityEvent' },
      { title: 'Conditional Probability', component: 'ConditionalProbability' },
    ]
  },
  {
    title: 'Chapter 2: Discrete Random Variables',
    path: '/chapter2',
    sections: [
      { title: 'Random Variables & Distributions', component: 'SpatialRandomVariable' },
      { title: 'Expectation & Variance', component: 'ExpectationVariance' },
      { title: 'Transformations of Random Variables', component: 'Transformations' },
    ]
  },
  {
    title: 'Chapter 3: Continuous Random Variables',
    path: '/chapter3',
    sections: [
      { title: '3.1 Probability Density Functions', url: '#section-3-1' },
      { title: '3.2 Expectation of Continuous RV (ALL versions)', url: '#section-3-2' },
      { title: '3.3 Normal Distributions (ALL tools)', url: '#section-3-3' },
      { title: '3.4 Exponential Distributions', url: '#section-3-4' },
      { title: '3.5 Gamma Distributions', url: '#section-3-5' },
      { title: '3.6 Joint Distributions', url: '#section-3-6' },
      { title: '3.7 Normal Approximation', url: '#section-3-7' },
    ]
  },
  {
    title: 'Chapter 4: Descriptive Statistics & Sampling',
    path: '/chapter4',
    sections: [
      { title: 'Measures of Central Tendency', component: 'MeanMedianMode' },
      { title: 'Histograms & Data Shapes', component: 'HistogramShapeExplorer' },
      { title: 'Interactive Statistics Explorer', component: 'DescriptiveStatsExplorer' },
      { title: 't-Distribution vs Normal', component: 'TDistributionExplorer' },
      { title: 'F-Distribution Explorer', component: 'FDistributionExplorer' },
    ]
  },
  {
    title: 'Chapter 5: Estimation',
    path: '/chapter5',
    sections: [
      { title: 'Point Estimation', component: 'PointEstimation' },
      { title: 'Confidence Intervals', component: 'ConfidenceInterval' },
      { title: 'Bootstrapping', component: 'Bootstrapping' },
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