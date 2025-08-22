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
      { title: '🎯 Formula Builder', url: '/chapter1/formula-builder' },
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
      { title: '1.11 Monty Hall Complete Analysis', url: '/chapter1/11-monty-hall-masterclass' },
      { title: '📝 End of Chapter Quiz', url: '/chapter1/quiz' },
    ]
  },
  {
    title: 'Chapter 2: Discrete Random Variables',
    path: '/chapter2',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter2/formula-builder' },
      { title: '2.1 Random Variables & Distributions', url: '/chapter2/random-variables' },
      { title: '2.2 Expectation & Variance', url: '/chapter2/expectation-variance' },
      { title: '2.2.4 Transformations', url: '/chapter2/transformations' },
      { title: '2.3 Binomial Distribution', url: '/chapter2/binomial-distribution' },
      { title: '2.4 Geometric Distribution', url: '/chapter2/geometric-distribution' },
      { title: '2.5 Negative Binomial Distribution', url: '/chapter2/negative-binomial' },
      { title: '2.6 Poisson Distribution', url: '/chapter2/poisson-distribution' },
      { title: '2.7 Distribution Stories', url: '/chapter2/distribution-stories' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/2/quiz' }
    ]
  },
  {
    title: 'Chapter 3: Continuous Random Variables',
    path: '/chapter3',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter3/formula-builder' },
      { title: '3.0 Bridge to Continuous', url: '/chapter3/introduction' },
      { title: '3.1 Probability Density Functions', url: '/chapter3/probability-density' },
      { title: '3.2 Expectation & Variance', url: '/chapter3/expectation-variance' },
      { title: '3.3 Normal Distributions', url: '/chapter3/normal-distributions' },
      { title: '  • Z-Score Explorer', url: '/chapter3/normal-distributions/z-score-explorer' },
      { title: '  • Empirical Rule (68-95-99.7)', url: '/chapter3/normal-distributions/empirical-rule' },
      { title: '  • Practice Problems', url: '/chapter3/normal-distributions/practice-problems' },
      { title: '3.4 Exponential Distributions', url: '/chapter3/exponential' },
      { title: '3.5 Gamma Distributions', url: '/chapter3/gamma' },
      { title: '3.6 Joint Distributions', url: '/chapter3/joint-distributions' },
      { title: '  • Double Integral Calculator', url: '/chapter3/double-integral-calculator' },
      { title: '3.7 Normal Approximation', url: '/chapter3/normal-approximation' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/3/quiz' }
    ]
  },
  {
    title: 'Chapter 4: Descriptive Statistics and Sampling Distributions',
    path: '/chapter4',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter4/formula-builder' },
      { title: '4.1 Introduction to Descriptive Statistics', url: '/chapter4/introduction' },
      { title: '  • What Are Descriptive Statistics?', url: '/chapter4/introduction#intro' },
      { title: '  • Types of Data', url: '/chapter4/introduction#types' },
      { title: '  • Why Summarize Data?', url: '/chapter4/introduction#why' },
      { title: '  • Overview of Measures', url: '/chapter4/introduction#overview' },
      { title: '4.2 Measures of Central Tendency', url: '/chapter4/central-tendency' },
      { title: '  • Central Tendency Introduction', url: '/chapter4/central-tendency#intro' },
      { title: '  • Descriptive Stats Journey', url: '/chapter4/central-tendency#journey' },
      { title: '  • Foundations', url: '/chapter4/central-tendency#foundations' },
      { title: '  • Mathematical Foundations', url: '/chapter4/central-tendency#mathematical' },
      { title: '4.3 Measures of Variability', url: '/chapter4/variability' },
      { title: '  • Range and IQR', url: '/chapter4/variability#range-iqr' },
      { title: '  • Variance Introduction', url: '/chapter4/variability#variance' },
      { title: '  • Standard Deviation', url: '/chapter4/variability#std-dev' },
      { title: '  • Coefficient of Variation', url: '/chapter4/variability#cv' },
      { title: '4.4 Exploratory Data Analysis', url: '/chapter4/exploratory-data-analysis' },
      { title: '  • Histogram Intuitive Intro', url: '/chapter4/exploratory-data-analysis#histogram-intro' },
      { title: '  • Histogram Shape Explorer', url: '/chapter4/exploratory-data-analysis#histogram-shape' },
      { title: '  • Histogram Interactive Journey', url: '/chapter4/exploratory-data-analysis#histogram-journey' },
      { title: '  • Histogram Shape Analysis', url: '/chapter4/exploratory-data-analysis#histogram-analysis' },
      { title: '  • Boxplot Quartiles Explorer', url: '/chapter4/exploratory-data-analysis#boxplot-quartiles' },
      { title: '  • Boxplot Quartiles Journey', url: '/chapter4/exploratory-data-analysis#boxplot-journey' },
      { title: '  • Boxplot Real World Explorer', url: '/chapter4/exploratory-data-analysis#boxplot-real-world' },
      { title: '  • Scatter Plot Animation', url: '/chapter4/exploratory-data-analysis#scatter' },
      { title: '  • Line Chart Animation', url: '/chapter4/exploratory-data-analysis#line' },
      { title: '  • Box Plot Animation', url: '/chapter4/exploratory-data-analysis#boxplot' },
      { title: '  • Bar Chart Animation', url: '/chapter4/exploratory-data-analysis#bar' },
      { title: '  • Pie Chart Animation', url: '/chapter4/exploratory-data-analysis#pie' },
      { title: '4.5 Introduction to Sampling Distributions', url: '/chapter4/sampling-distributions' },
      { title: '  • Sampling Distributions Interactive', url: '/chapter4/sampling-distributions#interactive' },
      { title: '  • Sampling Distributions Theory', url: '/chapter4/sampling-distributions#theory' },
      { title: '  • Sampling Distributions Visual', url: '/chapter4/sampling-distributions#visual' },
      { title: '4.6 Central Limit Theorem', url: '/chapter4/central-limit-theorem' },
      { title: '  • CLT Gateway', url: '/chapter4/central-limit-theorem#gateway' },
      { title: '  • CLT Properties', url: '/chapter4/central-limit-theorem#properties' },
      { title: '  • CLT Simulation', url: '/chapter4/central-limit-theorem#simulation' },
      { title: '4.7 Advanced Distributions', url: '/chapter4/advanced-distributions' },
      { title: '  • F-Distribution Introduction', url: '/chapter4/advanced-distributions#f-intro' },
      { title: '  • F-Distribution Explorer', url: '/chapter4/advanced-distributions#f-explorer' },
      { title: '  • F-Distribution Journey', url: '/chapter4/advanced-distributions#f-journey' },
      { title: '  • F-Distribution Worked Example', url: '/chapter4/advanced-distributions#f-example' },
      { title: '  • F-Distribution Masterclass', url: '/chapter4/advanced-distributions#f-masterclass' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/4/quiz' }
    ]
  },
  {
    title: 'Chapter 5: Estimation',
    path: '/chapter5',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter5/formula-builder' },
      { title: '5.1 Statistical Inference', url: '/chapter5/statistical-inference' },
      { title: '5.2 Confidence Intervals (σ Known)', url: '/chapter5/confidence-intervals-known' },
      { title: '5.2.1 Practice: CI Problems', url: '/chapter5/confidence-intervals-practice' },
      { title: '5.3 Sample Size Determination', url: '/chapter5/sample-size' },
      { title: '5.4 Confidence Intervals (σ Unknown)', url: '/chapter5/confidence-intervals-unknown' },
      { title: '5.5 Proportion Confidence Intervals', url: '/chapter5/proportions' },
      { title: '5.6 Bridge to Hypothesis Testing', url: '/chapter5/bonus/ci-hypothesis-bridge' },
      { title: '5.7 CI Interpretation Practice', url: '/chapter5/bonus/ci-interpretation' },
      { title: '5.8 Empirical Rule Interactive', url: '/chapter5/bonus/empirical-rule' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/5/quiz' }
    ]
  },
  {
    title: 'Chapter 6: Hypothesis Testing',
    path: '/chapter6',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter6/formula-builder' },
      { title: '6.1 Hypothesis Testing Fundamentals', url: '/chapter6/hypothesis-fundamentals' },
      { title: '  • Interactive Hypothesis Game', url: '/chapter6/hypothesis-game' },
      { title: '  • Evidence Accumulation Visualizer', url: '/chapter6/hypothesis-evidence' },
      { title: '  • Type I/II Error Interactive', url: '/chapter6/type-error-visualizer' },
      { title: '  • P-Value Deep Dive', url: '/chapter6/p-value-meaning' },
      { title: '6.2 Types of Hypotheses', url: '/chapter6/types-of-hypotheses' },
      { title: '  • Interactive Hypothesis Types', url: '/chapter6/types-hypotheses-interactive' },
      { title: '6.3 Errors & Power', url: '/chapter6/errors-and-power' },
      { title: '6.4 Test for a Mean (Known σ)', url: '/chapter6/test-mean-known-variance' },
      { title: '  • Critical Values & Z-Tables', url: '/chapter6/test-mean-known-variance/z-table-education' },
      { title: '  • Interactive Z-Table Explorer', url: '/chapter6/test-mean-known-variance/z-table-explorer' },
      { title: '6.5 Test for a Mean (Unknown σ)', url: '/chapter6/test-mean-unknown-variance' },
      { title: '6.6 Test for a Proportion', url: '/chapter6/test-for-proportion' },
      { title: '  • Sample Size Effects', url: '/chapter6/sample-size-effects' },
      { title: '6.7 Paired Two-Sample Test', url: '/chapter6/paired-two-sample' },
      { title: '6.8 Unpaired Two-Sample Test', url: '/chapter6/unpaired-two-sample' },
      { title: '6.9 Difference of Two Proportions', url: '/chapter6/difference-two-proportions' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/6/quiz' }
    ]
  },
  {
    title: 'Chapter 7: Linear Regression & Correlation',
    path: '/chapter7',
    sections: [
      { title: '🎯 Formula Builder', url: '/chapter7/formula-builder' },
      { title: '7.1 Correlation Coefficient', url: '/chapter7/correlation-coefficient' },
      { title: '7.2 Simple Linear Regression', url: '/chapter7/simple-linear-regression' },
      { title: '7.3 Hypothesis Testing in Regression', url: '/chapter7/hypothesis-testing-regression' },
      { title: '7.4 Confidence & Prediction Intervals', url: '/chapter7/confidence-prediction-intervals' },
      { title: '7.5 Analysis of Variance', url: '/chapter7/analysis-of-variance' },
      { title: '7.6 Coefficient of Determination', url: '/chapter7/coefficient-of-determination' },
      { title: '📝 End of Chapter Quiz', url: '/chapter/7/quiz' }
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