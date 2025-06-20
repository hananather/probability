// Chapter 4 Statistics Tutorials

export const tutorial_4_1_1 = [
  {
    title: "Welcome to Comprehensive Statistics!",
    content: "This interactive tool lets you explore all fundamental descriptive statistics concepts in one place. Let's start our journey!",
    target: ".visualization-title"
  },
  {
    title: "Interactive Data Points",
    content: "Click anywhere on the plot to add data points, or drag existing points to see how statistics change in real-time. Each point represents a single observation.",
    target: "[data-tutorial='main-plot']"
  },
  {
    title: "Distribution Templates",
    content: "Use these buttons to generate different types of distributions. Each has unique characteristics that affect the statistics differently.",
    target: "[data-tutorial='distribution-buttons']"
  },
  {
    title: "Central Tendency Measures",
    content: "Watch how mean (purple), median (yellow), and mode (cyan) respond differently to your data changes. The mean is sensitive to outliers, while the median is robust!",
    target: "[data-tutorial='statistics-display']"
  },
  {
    title: "Dispersion & Quartiles",
    content: "See variance, standard deviation, and the five-number summary update as you modify the data. These measure how spread out your data is.",
    target: "[data-tutorial='dispersion-stats']"
  },
  {
    title: "Outlier Detection",
    content: "Points that fall outside 1.5×IQR from the quartiles are marked as outliers. You can adjust the multiplier to see different outlier detection thresholds.",
    target: "[data-tutorial='outlier-control']"
  },
  {
    title: "Worked Example",
    content: "Toggle this to see detailed mathematical calculations for all statistics. Perfect for understanding the formulas behind the numbers!",
    target: "[data-tutorial='worked-example-toggle']"
  },
  {
    title: "Experiment and Learn",
    content: "Try creating different patterns: add outliers, make symmetric distributions, or create skewed data. Watch how each statistic responds!",
    target: "[data-tutorial='main-plot']"
  }
];

export const tutorial_4_2_1 = [
  {
    title: "Welcome to Histogram Explorer!",
    content: "Histograms are powerful tools for visualizing data distributions. Let's explore how they reveal patterns in your data.",
    target: ".visualization-title"
  },
  {
    title: "Understanding Bins",
    content: "The histogram groups data into bins. Adjust the number of bins to see how it affects the visualization - too few hide details, too many create noise.",
    target: "[data-tutorial='bin-control']"
  },
  {
    title: "Distribution Shapes",
    content: "Use these presets to generate different distribution shapes. Each shape tells a different story about your data.",
    target: "[data-tutorial='shape-buttons']"
  },
  {
    title: "Identifying Skewness",
    content: "Look for the tail of the distribution. Right-skewed has a long right tail, left-skewed has a long left tail, and symmetric is balanced.",
    target: "[data-tutorial='histogram-display']"
  },
  {
    title: "Overlay Options",
    content: "Toggle the density curve to see a smooth approximation of your distribution. This helps identify the overall shape more clearly.",
    target: "[data-tutorial='overlay-toggle']"
  }
];

export const tutorial_4_2_2 = [
  {
    title: "Welcome to Boxplot Explorer!",
    content: "Boxplots provide a compact summary of your data distribution using five key numbers. Let's discover what they reveal!",
    target: ".visualization-title"
  },
  {
    title: "The Five-Number Summary",
    content: "A boxplot displays: minimum, Q1 (25th percentile), median (Q2), Q3 (75th percentile), and maximum. These five numbers summarize your entire dataset!",
    target: "[data-tutorial='statistics']"
  },
  {
    title: "Understanding the Box",
    content: "The box shows the interquartile range (IQR = Q3 - Q1), containing the middle 50% of the data. The line inside is the median.",
    target: "[data-tutorial='boxplot']"
  },
  {
    title: "Whiskers and Outliers",
    content: "Whiskers extend to the furthest points within 1.5×IQR from the box. Points beyond are outliers, shown as individual dots.",
    target: "[data-tutorial='boxplot']"
  },
  {
    title: "Interactive Data Points",
    content: "Drag data points on the dot plot below to see how changes affect the boxplot and quartiles in real-time!",
    target: "[data-tutorial='dotplot']"
  },
  {
    title: "Generate Different Distributions",
    content: "Try different data distributions to see how skewness affects the boxplot's shape and outlier patterns.",
    target: "[data-tutorial='generate-data']"
  },
  {
    title: "Interpreting Shapes",
    content: "A symmetric boxplot has equal whiskers and the median centered in the box. Skewed boxplots have unequal whiskers and off-center medians.",
    target: "[data-tutorial='boxplot']"
  }
];

export const tutorial_4_3_1 = [
  {
    title: "Welcome to Sampling Distributions!",
    content: "This visualization helps you understand how sample means form a predictable pattern called the sampling distribution.",
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

export const tutorial_4_4_1 = [
  {
    title: "Welcome to the Central Limit Theorem!",
    content: "The CLT is one of the most important theorems in statistics. Watch how sample means always form a normal distribution!",
    target: ".visualization-title"
  },
  {
    title: "Original Distribution",
    content: "The top plot shows your original distribution (Beta). You can adjust α and β to change its shape - make it skewed, symmetric, or even U-shaped!",
    target: "[data-tutorial='beta-display']"
  },
  {
    title: "Sample Size Effect",
    content: "Adjust n to change the sample size. Watch how larger samples make the sampling distribution narrower and more normal-shaped!",
    target: "[data-tutorial='sample-size']"
  },
  {
    title: "Animation Controls",
    content: "Click 'Drop Samples' to see the CLT in action. Each ball represents one observation, and they combine to form a sample mean.",
    target: "[data-tutorial='drop-samples']"
  },
  {
    title: "The Magic Happens",
    content: "As you collect more sample means, they form a bell curve - even if the original distribution wasn't normal! This is the power of the CLT.",
    target: "[data-tutorial='histogram']"
  },
  {
    title: "n ≥ 30 Rule",
    content: "When n ≥ 30, the CLT works well even for very non-normal populations. Try it with different shapes!",
    target: "[data-tutorial='sample-size']"
  }
];

export const tutorial_4_5_1 = [
  {
    title: "Welcome to t-Distribution Explorer!",
    content: "The t-distribution is used when we estimate population parameters with small samples. Let's see how it differs from the normal distribution!",
    target: ".visualization-title"
  },
  {
    title: "Degrees of Freedom",
    content: "Adjust the degrees of freedom (df = n-1). Watch how the t-distribution gets closer to normal as df increases!",
    target: "[data-tutorial='df-control']"
  },
  {
    title: "Heavier Tails",
    content: "Notice the t-distribution has heavier tails than normal. This accounts for extra uncertainty in small samples.",
    target: "[data-tutorial='distribution-plot']"
  },
  {
    title: "Critical Values",
    content: "For any confidence level, t-critical values are larger than z-critical values, especially for small samples.",
    target: "[data-tutorial='critical-values']"
  },
  {
    title: "Practical Use",
    content: "Use t-distribution when: (1) sample size is small (n < 30), (2) population standard deviation is unknown, (3) data is approximately normal.",
    target: "[data-tutorial='use-cases']"
  }
];

export const tutorial_4_5_2 = [
  {
    title: "Welcome to F-Distribution Explorer!",
    content: "The F-distribution is used to compare variances from two different samples. Essential for ANOVA and variance ratio tests!",
    target: ".visualization-title"
  },
  {
    title: "Two Degrees of Freedom",
    content: "F-distribution has two df parameters: df1 (numerator) and df2 (denominator). Each represents the df from different samples.",
    target: "[data-tutorial='df-controls']"
  },
  {
    title: "Right-Skewed Shape",
    content: "Notice the F-distribution is always right-skewed and only takes positive values (since it's a ratio of variances).",
    target: "[data-tutorial='distribution-plot']"
  },
  {
    title: "F-Statistic",
    content: "F = s₁²/s₂², the ratio of two sample variances. Values near 1 suggest equal population variances.",
    target: "[data-tutorial='f-statistic']"
  },
  {
    title: "Critical Regions",
    content: "For hypothesis testing, we usually only care about the right tail (large F values indicate unequal variances).",
    target: "[data-tutorial='critical-region']"
  }
];