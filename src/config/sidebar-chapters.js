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
      { title: '1.1 Foundations', url: '/chapter1/01-foundations' },
      { title: '1.2 English-to-Math Translation', url: '/chapter1/02-probability-dictionary' },
      { title: '1.3 Sample Spaces & Set Operations', url: '/chapter1/03-sample-spaces-events' },
      { title: '1.4 Counting Techniques', url: '/chapter1/04-counting-techniques' },
      { title: '1.5 Ordered Samples', url: '/chapter1/05-ordered-samples' },
      { title: '1.6 Unordered Samples', url: '/chapter1/06-unordered-samples' },
      { title: '1.7 Probability of an Event', url: '/chapter1/07-probability-event' },
      { title: '1.8 Conditional Probability', url: '/chapter1/08-conditional-probability' },
      { title: '1.9 Bayes\' Theorem', url: '/chapter1/09-bayes-theorem-visualizer' },
      { title: '1.10 Probabilistic Fallacies', url: '/chapter1/10-probabilistic-fallacies' },
      { title: '1.11 Monty Hall Masterclass', url: '/chapter1/11-monty-hall-masterclass' },
    ]
  },
  {
    title: 'Chapter 2: Discrete Random Variables',
    path: '/chapter2',
    sections: [
      { title: '2.1 Random Variables & Distributions', url: '/chapter2/random-variables' },
      { title: '2.2 Expectation & Variance', url: '/chapter2/expectation-variance' },
      { title: '2.2.4 Transformations', url: '/chapter2/transformations' },
      { title: '2.3 Binomial Distribution', url: '/chapter2/binomial-distribution' },
      { title: '2.4 Geometric Distribution', url: '/chapter2/geometric-distribution' },
      { title: '2.5 Negative Binomial Distribution', url: '/chapter2/negative-binomial' },
      { title: '2.6 Poisson Distribution', url: '/chapter2/poisson-distribution' },
      { title: '2.7 Distribution Stories', url: '/chapter2/distribution-stories' }
    ]
  },
  {
    title: 'Chapter 3: Continuous Random Variables',
    path: '/chapter3',
    sections: [
      { title: 'Introduction: Bridge to Continuous', url: '/chapter3/introduction' },
      { title: '3.1 Probability Density Functions', url: '/chapter3/probability-density' },
      { title: '3.2 Expectation & Variance', url: '/chapter3/expectation-variance' },
      { title: '3.3 Normal Distributions', url: '/chapter3/normal-distributions' },
      { title: '3.4 Exponential Distributions', url: '/chapter3/exponential' },
      { title: '3.5 Gamma Distributions', url: '/chapter3/gamma' },
      { title: '3.6 Joint Distributions', url: '/chapter3/joint-distributions' },
      { title: '3.7 Normal Approximation', url: '/chapter3/normal-approximation' }
    ]
  },
  {
    title: 'Chapter 4: Descriptive Statistics and Sampling Distributions',
    path: '/chapter4',
    sections: [
      { title: '4.1 Data Descriptions', url: '/chapter4/data-descriptions' },
      { title: '4.2 Visual Summaries', url: '/chapter4/visual-summaries' },
      { title: '4.3 Sampling Distributions', url: '/chapter4/sampling-distributions' },
      { title: '4.4 Central Limit Theorem', url: '/chapter4/central-limit-theorem' },
      { title: '4.5 Advanced Sampling Distributions', url: '/chapter4/sampling-distributions-reprise' },
    ]
  },
  {
    title: 'Chapter 5: Estimation',
    path: '/chapter5',
    sections: [
      { title: '5.1 Statistical Inference', url: '/chapter5/statistical-inference' },
      { title: '5.2 Confidence Intervals (σ Known)', url: '/chapter5/confidence-intervals-known' },
      { title: '5.2 Practice: CI Problems', url: '/chapter5/confidence-intervals-practice' },
      { title: '5.3 Sample Size Determination', url: '/chapter5/sample-size' },
      { title: '5.4 Confidence Intervals (σ Unknown)', url: '/chapter5/confidence-intervals-unknown' },
      { title: '5.5 Proportion Confidence Intervals', url: '/chapter5/proportions' },
    ]
  },
  {
    title: 'Chapter 6: Hypothesis Testing',
    path: '/chapter6',
    sections: [
      { title: '6.1 Hypothesis Testing Fundamentals', url: '/chapter6/hypothesis-fundamentals' },
      { title: '6.2 Types of Hypotheses', url: '/chapter6/types-of-hypotheses' },
      { title: '6.3 Errors & Power', url: '/chapter6/errors-and-power' },
      { title: '6.4 Test for a Mean (Known σ)', url: '/chapter6/test-mean-known-variance' },
      { title: '6.5 Test for a Mean (Unknown σ)', url: '/chapter6/test-mean-unknown-variance' },
      { title: '6.6 Test for a Proportion', url: '/chapter6/test-for-proportion' },
      { title: '6.7 Paired Two-Sample Test', url: '/chapter6/paired-two-sample' },
      { title: '6.8 Unpaired Two-Sample Test', url: '/chapter6/unpaired-two-sample' },
      { title: '6.9 Difference of Two Proportions', url: '/chapter6/difference-two-proportions' },
    ]
  },
  {
    title: 'Chapter 7: Linear Regression & Correlation',
    path: '/chapter7',
    sections: [
      { title: '7.1 Correlation Coefficient', url: '/chapter7/correlation-coefficient' },
      { title: '7.2 Simple Linear Regression', url: '/chapter7/simple-linear-regression' },
      { title: '7.3 Hypothesis Testing in Regression', url: '/chapter7/hypothesis-testing-regression' },
      { title: '7.4 Confidence & Prediction Intervals', url: '/chapter7/confidence-prediction-intervals' },
      { title: '7.5 Analysis of Variance', url: '/chapter7/analysis-of-variance' },
      { title: '7.6 Coefficient of Determination', url: '/chapter7/coefficient-of-determination' },
    ]
  },
  {
    title: '🧪 Learning Sandbox',
    path: '/learn',
    sections: [
      { title: 'React Experiments', url: '' },
    ]
  },
  {
    title: '📚 Lesson-Based Approach',
    path: '/lesson-based-approach',
    sections: [
      { title: 'Execute Program Style Reference', url: '' },
    ]
  },
  {
    title: '📦 Legacy Components',
    path: '/legacy-components',
    sections: [
      { title: 'Bayesian Inference', url: '#bayesian-inference' },
      { title: 'Point Estimation', url: '#point-estimation' },
      { title: 'Confidence Intervals', url: '#confidence-intervals' },
      { title: 'Bootstrapping', url: '#bootstrapping' },
      { title: 'Central Limit Theorem', url: '#central-limit-theorem' },
    ]
  },
];