"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 6: Hypothesis Testing - Complete Reference Sheet
 * A comprehensive quick reference for all hypothesis testing concepts, formulas, and procedures
 */

// Define all sections for Chapter 6
const chapter6Sections = [
  // === HYPOTHESIS TESTING FUNDAMENTALS ===
  {
    title: "1. Hypothesis Testing Fundamentals",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Null Hypothesis (H₀):</strong> Statement of no effect/no difference
        </div>
        <div>
          <strong>Alternative Hypothesis (H₁ or Hₐ):</strong> What we want to prove
        </div>
        <div>
          <strong>Test Statistic:</strong> Standardized measure of evidence
        </div>
        <div>
          <strong>P-value:</strong> Probability of observing data as extreme as observed, assuming H₀ is true
        </div>
        <div>
          <strong>Significance Level (α):</strong> Threshold for rejecting H₀ (typically 0.05)
        </div>
      </div>
    )
  },

  // === TYPES OF TESTS ===
  {
    title: "2. Types of Alternative Hypotheses",
    color: "emerald",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Two-tailed test:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>H₀: μ = μ₀</li>
            <li>H₁: μ ≠ μ₀</li>
            <li>Reject if |test statistic| &gt; critical value</li>
          </ul>
        </div>
        <div>
          <strong>Right-tailed test:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>H₀: μ ≤ μ₀</li>
            <li>H₁: μ &gt; μ₀</li>
            <li>Reject if test statistic &gt; critical value</li>
          </ul>
        </div>
        <div>
          <strong>Left-tailed test:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>H₀: μ ≥ μ₀</li>
            <li>H₁: μ &lt; μ₀</li>
            <li>Reject if test statistic &lt; -critical value</li>
          </ul>
        </div>
      </div>
    )
  },

  // === TYPE I AND TYPE II ERRORS ===
  {
    title: "3. Type I and Type II Errors",
    color: "purple",
    content: (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
          <div></div>
          <div>H₀ True</div>
          <div>H₀ False</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="font-semibold">Reject H₀</div>
          <div className="bg-red-900/30 p-1 rounded">Type I Error (α)</div>
          <div className="bg-green-900/30 p-1 rounded">Correct</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="font-semibold">Fail to Reject H₀</div>
          <div className="bg-green-900/30 p-1 rounded">Correct</div>
          <div className="bg-red-900/30 p-1 rounded">Type II Error (β)</div>
        </div>
        <div className="mt-2">
          <strong>Power = 1 - β:</strong> Probability of correctly rejecting false H₀
        </div>
      </div>
    )
  },

  // === ONE SAMPLE Z-TEST ===
  {
    title: "4. One-Sample Z-Test (σ known)",
    color: "teal",
    formula: `\\[z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}\\]`,
    steps: [
      "State H₀: μ = μ₀ and H₁",
      "Check assumptions: n ≥ 30 or population normal",
      "Calculate test statistic z",
      "Find p-value or critical value",
      "Make decision: reject H₀ if p-value < α"
    ],
    description: "Use when population standard deviation σ is known"
  },

  // === ONE SAMPLE T-TEST ===
  {
    title: "5. One-Sample t-Test (σ unknown)",
    color: "yellow",
    formula: `\\[t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}}\\]`,
    steps: [
      "State H₀: μ = μ₀ and H₁",
      "Check assumptions: approximately normal",
      "Calculate test statistic t with df = n-1",
      "Find p-value using t-distribution",
      "Make decision: reject H₀ if p-value < α"
    ],
    description: "Use when σ is unknown (most common case)"
  },

  // === PROPORTION TEST ===
  {
    title: "6. One-Sample Proportion Test",
    color: "orange",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[z = \\frac{\\hat{p} - p_0}{\\sqrt{\\frac{p_0(1-p_0)}{n}}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Assumptions:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• np₀ ≥ 10</li>
            <li>• n(1-p₀) ≥ 10</li>
            <li>• Random sample</li>
          </ul>
        </div>
        <div>
          <strong>Hypotheses:</strong> H₀: p = p₀, H₁: p ≠ p₀ (or &gt;, &lt;)
        </div>
      </div>
    )
  },

  // === TWO SAMPLE T-TEST ===
  {
    title: "7. Two-Sample t-Test (Independent)",
    color: "pink",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Equal Variances:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{x}_1 - \\bar{x}_2}{s_p\\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Pooled Standard Deviation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[s_p = \\sqrt{\\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1 + n_2 - 2}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>df = n₁ + n₂ - 2</strong>
        </div>
      </div>
    )
  },

  // === PAIRED T-TEST ===
  {
    title: "8. Paired t-Test",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[t = \\frac{\\bar{d} - \\mu_d}{s_d/\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Where:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>d̄ = sample mean of differences</li>
            <li>sd = sample standard deviation of differences</li>
            <li>df = n - 1 (n = number of pairs)</li>
          </ul>
        </div>
        <div>
          <strong>Use when:</strong> Same subjects measured twice
        </div>
      </div>
    )
  },

  // === TWO PROPORTION TEST ===
  {
    title: "9. Two-Sample Proportion Test",
    color: "green",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Test Statistic:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[z = \\frac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\hat{p}(1-\\hat{p})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Pooled Proportion:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\hat{p} = \\frac{x_1 + x_2}{n_1 + n_2}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>H₀:</strong> p₁ = p₂ (or p₁ - p₂ = 0)
        </div>
      </div>
    )
  },

  // === P-VALUE INTERPRETATION ===
  {
    title: "10. P-value Interpretation",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-green-900/20 rounded">
          <strong className="text-green-400">✓ Correct:</strong>
          <p className="mt-1 text-xs">"The probability of observing this sample result (or more extreme) if H₀ is true is [p-value]"</p>
        </div>
        <div className="p-2 bg-red-900/20 rounded">
          <strong className="text-red-400">✗ Wrong:</strong>
          <p className="mt-1 text-xs">"The probability that H₀ is true is [p-value]"</p>
        </div>
        <div>
          <strong>Decision Rules:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• p-value &lt; α: Reject H₀</li>
            <li>• p-value ≥ α: Fail to reject H₀</li>
          </ul>
        </div>
      </div>
    )
  },

  // === CRITICAL VALUES ===
  {
    title: "11. Common Critical Values",
    color: "gray",
    content: (
      <div className="space-y-2 text-xs">
        <div>
          <strong className="text-gray-400">Z-values (two-tailed):</strong>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>α = 0.10: z = ±1.645</div>
            <div>α = 0.05: z = ±1.96</div>
            <div>α = 0.01: z = ±2.576</div>
          </div>
        </div>
        <div>
          <strong className="text-gray-400">t-values (two-tailed, α = 0.05):</strong>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>df = 10: t = ±2.228</div>
            <div>df = 20: t = ±2.086</div>
            <div>df = 30: t = ±2.042</div>
            <div>df = ∞: t = ±1.96</div>
          </div>
        </div>
      </div>
    )
  },

];

// Main Chapter 6 Reference Sheet Component
export const Chapter6ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter6Sections}
      title="Chapter 6: Hypothesis Testing - Complete Reference"
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

// One-Sample Tests specific reference
export const OneSampleTestsReference = ({ mode = "inline" }) => {
  const oneSampleSections = chapter6Sections.filter(section => 
    [4, 5, 6, 10, 11].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={oneSampleSections}
      title="One-Sample Tests - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'teal',
        secondary: 'yellow',
        accent: 'orange',
        warning: 'red'
      }}
    />
  );
};

// Two-Sample Tests specific reference
export const TwoSampleTestsReference = ({ mode = "inline" }) => {
  const twoSampleSections = chapter6Sections.filter(section => 
    [7, 8, 9, 11].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={twoSampleSections}
      title="Two-Sample Tests - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'pink',
        secondary: 'indigo',
        accent: 'green',
        warning: 'amber'
      }}
    />
  );
};

// Hypothesis Testing Theory reference
export const HypothesisTestingTheoryReference = ({ mode = "inline" }) => {
  const theorySections = chapter6Sections.filter(section => 
    [1, 2, 3, 10].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={theorySections}
      title="Hypothesis Testing Theory - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'purple',
        accent: 'red',
        warning: 'amber'
      }}
    />
  );
};

export default Chapter6ReferenceSheet;