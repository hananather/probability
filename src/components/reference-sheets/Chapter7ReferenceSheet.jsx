"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 7: Regression and Correlation - Complete Reference Sheet
 * A comprehensive quick reference for all regression and correlation concepts, formulas, and procedures
 */

// Define all sections for Chapter 7
const chapter7Sections = [
  // === CORRELATION FUNDAMENTALS ===
  {
    title: "1. Correlation Fundamentals",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Correlation (r):</strong> Measures linear relationship strength
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• -1 ≤ r ≤ 1</li>
            <li>• r = 0: No linear relationship</li>
            <li>• |r| = 1: Perfect linear relationship</li>
            <li>• r &gt; 0: Positive association</li>
            <li>• r &lt; 0: Negative association</li>
          </ul>
        </div>
        <div>
          <strong>Interpretation:</strong> |r| &gt; 0.7 is generally considered strong
        </div>
      </div>
    )
  },

  // === CORRELATION COEFFICIENT ===
  {
    title: "2. Sample Correlation Coefficient",
    color: "emerald",
    formula: `\\[r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}\\]`,
    steps: [
      "Calculate sample means x̄ and ȳ",
      "Find deviations from means",
      "Calculate numerator: Σ(x - x̄)(y - ȳ)",
      "Calculate denominator: √[Σ(x - x̄)² × Σ(y - ȳ)²]",
      "Divide numerator by denominator"
    ],
    description: "Alternative formula: r = Sxy / (Sx × Sy)"
  },

  // === SIMPLE LINEAR REGRESSION ===
  {
    title: "3. Simple Linear Regression Model",
    color: "purple",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Population Model:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Y = \\beta_0 + \\beta_1 X + \\epsilon\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Sample Regression Line:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{y} = b_0 + b_1 x\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Components:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>β₀: Population y-intercept</li>
            <li>β₁: Population slope</li>
            <li>ε: Random error term</li>
          </ul>
        </div>
      </div>
    )
  },

  // === LEAST SQUARES ESTIMATES ===
  {
    title: "4. Least Squares Estimates",
    color: "teal",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Slope:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[b_1 = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2} = r \\cdot \\frac{s_y}{s_x}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Intercept:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[b_0 = \\bar{y} - b_1\\bar{x}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Key Property:</strong> Regression line always passes through (x̄, ȳ)
        </div>
      </div>
    )
  },

  // === RESIDUALS ===
  {
    title: "5. Residuals and Model Assessment",
    color: "yellow",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Residual:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[e_i = y_i - \\hat{y}_i\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Σeᵢ = 0 (sum of residuals is zero)</li>
            <li>• Used to check model assumptions</li>
            <li>• Plot residuals vs. fitted values</li>
          </ul>
        </div>
        <div>
          <strong>Residual Analysis:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Random pattern: Good model</li>
            <li>• Curved pattern: Nonlinear relationship</li>
            <li>• Funnel shape: Non-constant variance</li>
          </ul>
        </div>
      </div>
    )
  },

  // === COEFFICIENT OF DETERMINATION ===
  {
    title: "6. Coefficient of Determination (R²)",
    color: "orange",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Definition:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[R^2 = r^2 = \\frac{\\text{SSR}}{\\text{SST}} = 1 - \\frac{\\text{SSE}}{\\text{SST}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Sum of Squares:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>SST = Σ(yᵢ - ȳ)² (Total variation)</li>
            <li>SSR = Σ(ŷᵢ - ȳ)² (Regression variation)</li>
            <li>SSE = Σ(yᵢ - ŷᵢ)² (Error variation)</li>
            <li>SST = SSR + SSE</li>
          </ul>
        </div>
        <div>
          <strong>Interpretation:</strong> Proportion of variation in Y explained by X
        </div>
      </div>
    )
  },

  // === REGRESSION ASSUMPTIONS ===
  {
    title: "7. Regression Assumptions (LINE)",
    color: "pink",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>L - Linear:</strong> Relationship between X and Y is linear
        </div>
        <div>
          <strong>I - Independent:</strong> Observations are independent
        </div>
        <div>
          <strong>N - Normal:</strong> Errors εᵢ are normally distributed
        </div>
        <div>
          <strong>E - Equal Variance:</strong> Constant variance of errors (homoscedasticity)
        </div>
        <div className="p-2 bg-pink-900/20 rounded text-xs">
          <strong>Check with:</strong> Residual plots, normality tests, scatter plots
        </div>
      </div>
    )
  },

  // === INFERENCE FOR SLOPE ===
  {
    title: "8. Inference for Slope (β₁)",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Standard Error of Slope:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[SE(b_1) = \\frac{s}{\\sqrt{\\sum(x_i - \\bar{x})^2}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{b_1 - \\beta_{1,0}}{SE(b_1)}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Common Test:</strong> H₀: β₁ = 0 vs H₁: β₁ ≠ 0
        </div>
        <div>
          <strong>df = n - 2</strong>
        </div>
      </div>
    )
  },

  // === CONFIDENCE INTERVALS ===
  {
    title: "9. Confidence and Prediction Intervals",
    color: "green",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Confidence Interval for Mean Response:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{y} \\pm t_{\\alpha/2} \\cdot SE(\\hat{y})\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Prediction Interval for Individual:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{y} \\pm t_{\\alpha/2} \\cdot \\sqrt{s^2 + SE(\\hat{y})^2}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Key Difference:</strong> Prediction intervals are wider (individual vs. mean)
        </div>
      </div>
    )
  },

  // === RESIDUAL STANDARD ERROR ===
  {
    title: "10. Residual Standard Error",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Formula:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[s = \\sqrt{\\frac{\\text{SSE}}{n-2}} = \\sqrt{\\frac{\\sum(y_i - \\hat{y}_i)^2}{n-2}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Interpretation:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Typical prediction error</li>
            <li>• Units same as Y variable</li>
            <li>• Smaller s indicates better fit</li>
          </ul>
        </div>
        <div>
          <strong>df = n - 2:</strong> Lost 2 df for estimating β₀ and β₁
        </div>
      </div>
    )
  },

  // === ANOVA F-TEST ===
  {
    title: "11. ANOVA F-Test for Regression",
    color: "gray",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Hypotheses:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>H₀: β₁ = 0 (no linear relationship)</li>
            <li>H₁: β₁ ≠ 0 (linear relationship exists)</li>
          </ul>
        </div>
        <div>
          <strong>F-Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\\\[F = \\\\frac{\\\\text{MSR}}{\\\\text{MSE}} = \\\\frac{\\\\text{SSR}/1}{\\\\text{SSE}/(n-2)}\\\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>ANOVA Table:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>Source: Regression, df = 1, SS = SSR</li>
            <li>Source: Error, df = n-2, SS = SSE</li>
            <li>Source: Total, df = n-1, SS = SST</li>
          </ul>
        </div>
        <div className="text-xs text-neutral-400">
          F-test equivalent to t-test for simple regression
        </div>
      </div>
    )
  },

  // === CORRELATION TEST ===
  {
    title: "12. Testing Correlation Significance",
    color: "slate",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Hypotheses:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>H₀: ρ = 0 (no linear correlation)</li>
            <li>H₁: ρ ≠ 0 (linear correlation exists)</li>
          </ul>
        </div>
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\\\[t = \\\\frac{r\\\\sqrt{n-2}}{\\\\sqrt{1-r^2}}\\\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>df = n - 2</strong>
        </div>
        <div className="text-xs text-neutral-400">
          This test is equivalent to testing β₁ = 0 in regression
        </div>
      </div>
    )
  },

];

// Main Chapter 7 Reference Sheet Component
export const Chapter7ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter7Sections}
      title="Chapter 7: Regression and Correlation - Complete Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'emerald',
        accent: 'purple',
        warning: 'teal'
      }}
    />
  );
};

// Correlation specific reference
export const CorrelationReference = ({ mode = "inline" }) => {
  const correlationSections = chapter7Sections.filter(section => 
    [1, 2, 12].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={correlationSections}
      title="Correlation Analysis - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'emerald',
        secondary: 'blue',
        accent: 'gray',
        warning: 'amber'
      }}
    />
  );
};

// Simple Linear Regression specific reference
export const SimpleLinearRegressionReference = ({ mode = "inline" }) => {
  const regressionSections = chapter7Sections.filter(section => 
    [3, 4, 5, 6, 7, 10].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={regressionSections}
      title="Simple Linear Regression - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'purple',
        secondary: 'teal',
        accent: 'yellow',
        warning: 'orange'
      }}
    />
  );
};

// Regression Inference specific reference
export const RegressionInferenceReference = ({ mode = "inline" }) => {
  const inferenceSections = chapter7Sections.filter(section => 
    [8, 9, 10, 11, 12].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={inferenceSections}
      title="Regression Inference - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'indigo',
        secondary: 'green',
        accent: 'red',
        warning: 'amber'
      }}
    />
  );
};

export default Chapter7ReferenceSheet;