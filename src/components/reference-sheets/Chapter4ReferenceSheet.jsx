"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 4: Sampling and Data - Complete Reference Sheet
 * A comprehensive quick reference for descriptive statistics, sampling distributions, and Central Limit Theorem
 */

// Define all sections for Chapter 4
const chapter4Sections = [
  // === DESCRIPTIVE STATISTICS ===
  {
    title: "1. Measures of Central Tendency",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Sample Mean:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Sample Median:</strong> Middle value when data is ordered
        </div>
        <div>
          <strong>Sample Mode:</strong> Most frequently occurring value
        </div>
        <div>
          <strong>Properties:</strong> Mean affected by outliers, median robust
        </div>
      </div>
    )
  },

  // === ALTERNATIVE MEANS ===
  {
    title: "2. Alternative Means (Special Cases)",
    color: "cyan",
    content: (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-cyan-900/20 p-2 rounded">
            <strong>Geometric Mean:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}_g = \\sqrt[n]{\\prod_{i=1}^n x_i} = (x_1 \\cdot x_2 \\cdots x_n)^{1/n}\\)` }} />
            <div className="text-xs mt-1">Use for growth rates, ratios</div>
          </div>
          <div className="bg-cyan-900/20 p-2 rounded">
            <strong>Harmonic Mean:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}_h = \\frac{n}{\\sum_{i=1}^n \\frac{1}{x_i}}\\)` }} />
            <div className="text-xs mt-1">Use for rates (e.g., speed)</div>
          </div>
          <div className="bg-cyan-900/20 p-2 rounded">
            <strong>Trimmed Mean:</strong> Remove top/bottom k% before averaging
            <div className="text-xs mt-1">Robust to outliers</div>
          </div>
        </div>
      </div>
    )
  },

  // === MEASURES OF VARIABILITY ===
  {
    title: "3. Measures of Variability",
    color: "emerald",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Sample Variance:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[s^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Sample Standard Deviation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[s = \\sqrt{s^2} = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Population Variance:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\sigma^2 = \\frac{1}{N} \\sum_{i=1}^N (x_i - \\mu)^2\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Coefficient of Variation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CV = \\frac{\\sigma}{\\mu} = \\frac{s}{\\bar{x}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Range:</strong> Maximum - Minimum
        </div>
        <div>
          <strong>Interquartile Range:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[IQR = Q_3 - Q_1\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === QUARTILES AND PERCENTILES ===
  {
    title: "4. Quartiles and Percentiles",
    color: "purple",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Quartiles:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>Q₁: 25th percentile</li>
            <li>Q₂: 50th percentile (median)</li>
            <li>Q₃: 75th percentile</li>
          </ul>
        </div>
        <div>
          <strong>Five Number Summary:</strong>
          <div className="text-xs bg-purple-900/20 p-2 rounded">
            Min, Q₁, Median, Q₃, Max
          </div>
        </div>
        <div>
          <strong>Outlier Detection:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Lower bound: } Q_1 - 1.5 \\times IQR\\]` 
            }} />
          </div>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Upper bound: } Q_3 + 1.5 \\times IQR\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === SKEWNESS AND KURTOSIS ===
  {
    title: "5. Skewness and Shape Measures",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Skewness:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Skew} = \\frac{E[(X - \\mu)^3]}{\\sigma^3}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Interpretation:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Skew = 0: Symmetric distribution</li>
            <li>• Skew &gt; 0: Right-skewed (tail extends right)</li>
            <li>• Skew &lt; 0: Left-skewed (tail extends left)</li>
          </ul>
        </div>
        <div>
          <strong>Relationship to Mean/Median:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>Right skewed: Mean &gt; Median</li>
            <li>Left skewed: Mean &lt; Median</li>
            <li>Symmetric: Mean ≈ Median</li>
          </ul>
        </div>
        <div className="bg-indigo-900/20 p-2 rounded text-xs">
          <strong>Kurtosis:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Kurt} = \\frac{E[(X-\\mu)^4]}{\\sigma^4} - 3\\)` }} />
          <div className="text-xs mt-1">Measures tail heaviness (excess kurtosis)</div>
        </div>
      </div>
    )
  },

  // === HISTOGRAMS ===
  {
    title: "6. Histograms and Distribution Shapes",
    color: "teal",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Shape Descriptions:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li><strong>Symmetric:</strong> Mean ≈ Median</li>
            <li><strong>Right Skewed:</strong> Mean &gt; Median</li>
            <li><strong>Left Skewed:</strong> Mean &lt; Median</li>
            <li><strong>Bimodal:</strong> Two peaks</li>
          </ul>
        </div>
        <div>
          <strong>Histogram Construction:</strong>
          <ol className="ml-4 space-y-1 text-xs">
            <li>1. Choose number of bins</li>
            <li>2. Calculate bin width</li>
            <li>3. Count frequencies</li>
            <li>4. Draw bars</li>
          </ol>
        </div>
      </div>
    )
  },

  // === BOXPLOTS ===
  {
    title: "7. Boxplots",
    color: "yellow",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Components:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Box: Q₁ to Q₃ (IQR)</li>
            <li>• Line in box: Median</li>
            <li>• Whiskers: 1.5 × IQR from box</li>
            <li>• Points: Individual outliers</li>
          </ul>
        </div>
        <div>
          <strong>Advantages:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Shows distribution shape</li>
            <li>• Identifies outliers</li>
            <li>• Easy to compare groups</li>
          </ul>
        </div>
      </div>
    )
  },

  // === SAMPLING DISTRIBUTIONS ===
  {
    title: "8. Sampling Distribution of Sample Mean",
    color: "orange",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Population: μ, σ²</strong>
        </div>
        <div>
          <strong>Sample Mean Properties:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[E[\\bar{X}] = \\mu\\]` 
            }} />
          </div>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}\\]` 
            }} />
          </div>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[SE(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        <div className="p-2 bg-orange-900/20 rounded">
          <strong>Standard Error decreases with √n</strong>
        </div>
        <div className="text-xs text-neutral-400">
          x̄ is unbiased estimator of μ
        </div>
      </div>
    )
  },

  // === CENTRAL LIMIT THEOREM ===
  {
    title: "9. Central Limit Theorem (CLT)",
    color: "pink",
    formula: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\text{ as } n \\to \\infty\\]`,
    steps: [
      "Take samples of size n from any population",
      "Calculate sample mean x̄ for each sample",
      "Distribution of x̄ approaches normal",
      "Works for n ≥ 30 (rule of thumb)",
      "Even works for non-normal populations"
    ],
    description: "Sample means are approximately normal for large n"
  },

  // === CLT APPLICATIONS ===
  {
    title: "10. CLT Applications",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Standardizing Sample Mean:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Probability Calculations:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(a < \\bar{X} < b) = P\\left(\\frac{a-\\mu}{\\sigma/\\sqrt{n}} < Z < \\frac{b-\\mu}{\\sigma/\\sqrt{n}}\\right)\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === T-DISTRIBUTION ===
  {
    title: "11. t-Distribution",
    color: "green",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>When to use:</strong> σ unknown, use sample standard deviation s
        </div>
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{x} - \\mu}{s/\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Degrees of freedom: df = n - 1</li>
            <li>• Symmetric, bell-shaped</li>
            <li>• Heavier tails than normal</li>
            <li>• Approaches normal as df → ∞</li>
          </ul>
        </div>
      </div>
    )
  },

  // === CHI-SQUARE DISTRIBUTION ===
  {
    title: "12. Chi-Square Distribution",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>For Sample Variance:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\frac{(n-1)s^2}{\\sigma^2} \\sim \\chi^2_{n-1}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Right-skewed</li>
            <li>• Always positive</li>
            <li>• df = n - 1</li>
            <li>• E[χ²] = df, Var(χ²) = 2df</li>
          </ul>
        </div>
      </div>
    )
  },

  // === F-DISTRIBUTION ===
  {
    title: "13. F-Distribution for ANOVA",
    color: "gray",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Ratio of Two Chi-Squares:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[F = \\frac{s_1^2/\\sigma_1^2}{s_2^2/\\sigma_2^2}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Two degrees of freedom: df₁, df₂</li>
            <li>• Right-skewed</li>
            <li>• Always positive</li>
            <li>• Used for comparing variances and ANOVA</li>
          </ul>
        </div>
        <div>
          <strong>ANOVA Application:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[F = \\frac{\\text{Between-group variance}}{\\text{Within-group variance}}\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === SUMMARY TABLE ===
  {
    title: "14. Distribution Summary",
    color: "amber",
    content: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-3 gap-2 font-semibold text-amber-400">
          <div>Distribution</div>
          <div>Use Case</div>
          <div>Parameters</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Normal</div>
          <div>σ known</div>
          <div>μ, σ</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>t</div>
          <div>σ unknown</div>
          <div>df = n-1</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>χ²</div>
          <div>Variance tests</div>
          <div>df = n-1</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>F</div>
          <div>Compare variances</div>
          <div>df₁, df₂</div>
        </div>
      </div>
    )
  }
];

// Main Chapter 4 Reference Sheet Component
export const Chapter4ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter4Sections}
      title="Chapter 4: Sampling and Data - Complete Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'emerald',
        accent: 'teal',
        warning: 'orange'
      }}
    />
  );
};

// Descriptive Statistics specific reference
export const DescriptiveStatisticsReference = ({ mode = "inline" }) => {
  const descriptiveSections = chapter4Sections.filter(section => 
    [1, 2, 3, 4, 5, 6].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={descriptiveSections}
      title="Descriptive Statistics - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'emerald',
        secondary: 'teal',
        accent: 'purple',
        warning: 'yellow'
      }}
    />
  );
};

// Central Limit Theorem specific reference
export const CentralLimitTheoremReference = ({ mode = "inline" }) => {
  const cltSections = chapter4Sections.filter(section => 
    [7, 8, 9, 10].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={cltSections}
      title="Central Limit Theorem - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'pink',
        secondary: 'orange',
        accent: 'green',
        warning: 'indigo'
      }}
    />
  );
};

// Sampling Distributions specific reference
export const SamplingDistributionsReference = ({ mode = "inline" }) => {
  const samplingSection = chapter4Sections.filter(section => 
    [8, 10, 11, 12, 13].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={samplingSection}
      title="Sampling Distributions - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'green',
        secondary: 'red',
        accent: 'gray',
        warning: 'amber'
      }}
    />
  );
};

export default Chapter4ReferenceSheet;