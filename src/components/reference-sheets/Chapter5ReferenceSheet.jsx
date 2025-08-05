"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 5: Estimation - Complete Reference Sheet
 * A comprehensive quick reference for all estimation concepts, formulas, and procedures
 */

// Define all sections for Chapter 5
const chapter5Sections = [
  // === CORE CONCEPTS ===
  {
    title: "1. Statistical Inference Fundamentals",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Point Estimate:</strong> Single value θ̂ to estimate population parameter θ
        </div>
        <div>
          <strong>Interval Estimate:</strong> Range of plausible values with confidence level
        </div>
        <div>
          <strong>Standard Error:</strong> SE = σ/√n (σ known) or s/√n (σ unknown)
        </div>
        <div>
          <strong>Margin of Error:</strong> ME = critical value × SE
        </div>
      </div>
    )
  },

  // === CONFIDENCE INTERVALS - KNOWN VARIANCE ===
  {
    title: "2. CI with Known σ (Z-Interval)",
    color: "emerald",
    formula: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`,
    steps: [
      "Calculate sample mean (x̄)",
      "Find z-critical value for confidence level",
      "Calculate SE = σ/√n",
      "Find margin = z × SE",
      "CI = x̄ ± margin"
    ],
    description: "Use when population standard deviation σ is known"
  },

  // === CONFIDENCE INTERVALS - UNKNOWN VARIANCE ===
  {
    title: "3. CI with Unknown σ (t-Interval)",
    color: "purple",
    formula: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]`,
    steps: [
      "Calculate x̄ and s from sample",
      "Find df = n - 1",
      "Look up t-critical value",
      "Calculate SE = s/√n",
      "Find margin = t × SE",
      "CI = x̄ ± margin"
    ],
    description: "Use when σ is unknown (most real-world cases)"
  },

  // === PROPORTION CONFIDENCE INTERVALS ===
  {
    title: "4. Proportion CI",
    color: "teal",
    formula: `\\[\\hat{p} \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]`,
    steps: [
      "Calculate p̂ = x/n (sample proportion)",
      "Check: np̂ ≥ 10 and n(1-p̂) ≥ 10",
      "Find z-critical value",
      `Calculate SE = \\(\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\)`,
      "CI = p̂ ± z × SE"
    ],
    description: "For binary outcomes (success/failure)"
  },

  // === CRITICAL VALUES TABLE ===
  {
    title: "5. Critical Values",
    color: "yellow",
    content: (
      <div className="space-y-3">
        <div>
          <strong className="text-yellow-400">Z-Values (σ known):</strong>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div>90% CI: z = 1.645</div>
            <div>95% CI: z = 1.96</div>
            <div>98% CI: z = 2.326</div>
            <div>99% CI: z = 2.576</div>
          </div>
        </div>
        <div>
          <strong className="text-yellow-400">t-Values (σ unknown):</strong>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div>df=5, 95%: t = 2.571</div>
            <div>df=10, 95%: t = 2.228</div>
            <div>df=20, 95%: t = 2.086</div>
            <div>df=30, 95%: t = 2.042</div>
          </div>
        </div>
      </div>
    )
  },

  // === SAMPLE SIZE DETERMINATION ===
  {
    title: "6. Sample Size Calculation",
    color: "orange",
    content: (
      <div className="space-y-2">
        <div>
          <strong>For Mean (σ known):</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\times \\sigma}{E}\\right)^2\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>For Proportion:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\frac{z_{\\alpha/2}^2 \\times p(1-p)}{E^2}\\]` 
            }} />
          </div>
          <p className="text-xs text-neutral-400">Use p = 0.5 if unknown (conservative)</p>
        </div>
      </div>
    )
  },

  // === KEY RELATIONSHIPS ===
  {
    title: "7. Important Relationships",
    color: "pink",
    content: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>↑ Confidence Level</span>
          <span className="text-pink-400">→ ↑ Interval Width</span>
        </div>
        <div className="flex items-center justify-between">
          <span>↑ Sample Size (n)</span>
          <span className="text-emerald-400">→ ↓ Interval Width</span>
        </div>
        <div className="flex items-center justify-between">
          <span>↑ Variability (σ)</span>
          <span className="text-pink-400">→ ↑ Interval Width</span>
        </div>
        <div className="mt-2 p-2 bg-neutral-900 rounded">
          <strong>To halve width:</strong> Need 4× sample size
        </div>
      </div>
    )
  },

  // === DECISION FLOWCHART ===
  {
    title: "8. Which Method to Use?",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-blue-900/20 rounded">
          <strong>Population Mean:</strong>
          <ul className="mt-1 ml-4 space-y-1">
            <li>• σ known → Use z-interval</li>
            <li>• σ unknown → Use t-interval</li>
            <li>• n ≥ 30 → t ≈ z (but still use t)</li>
          </ul>
        </div>
        <div className="p-2 bg-purple-900/20 rounded">
          <strong>Population Proportion:</strong>
          <ul className="mt-1 ml-4 space-y-1">
            <li>• Check np̂ ≥ 10 and n(1-p̂) ≥ 10</li>
            <li>• Use z-interval if conditions met</li>
          </ul>
        </div>
      </div>
    )
  },

  // === INTERPRETATION GUIDE ===
  {
    title: "9. Correct Interpretation",
    color: "green",
    content: (
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-green-900/20 rounded">
          <strong className="text-green-400">✓ Correct:</strong>
          <p className="mt-1">"We are 95% confident that the true population mean lies between [a, b]"</p>
        </div>
        <div className="p-2 bg-red-900/20 rounded">
          <strong className="text-red-400">✗ Wrong:</strong>
          <p className="mt-1">"There's a 95% chance the true mean is in this interval"</p>
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          The confidence is in the method, not the specific interval
        </div>
      </div>
    )
  },

  // === COMMON MISTAKES ===
  {
    title: "10. Common Mistakes to Avoid",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div>❌ Using z when σ is unknown</div>
        <div>❌ Using n instead of n-1 for df</div>
        <div>❌ Forgetting √n in denominator</div>
        <div>❌ Wrong interpretation of CI</div>
        <div>❌ Not checking normality assumptions</div>
        <div>❌ Rounding sample size down</div>
      </div>
    )
  },

  // === QUICK FORMULAS SUMMARY ===
  {
    title: "11. Formula Quick Reference",
    color: "gray",
    content: (
      <div className="space-y-2 text-xs font-mono">
        <div>
          <strong>Sample Mean:</strong> x̄ = Σxᵢ/n
        </div>
        <div>
          <strong>Sample SD:</strong> s = √[Σ(xᵢ-x̄)²/(n-1)]
        </div>
        <div>
          <strong>Standard Error (mean):</strong> SE = σ/√n or s/√n
        </div>
        <div>
          <strong>Standard Error (prop):</strong> SE = √[p̂(1-p̂)/n]
        </div>
        <div>
          <strong>Margin of Error:</strong> ME = critical × SE
        </div>
      </div>
    )
  },

  // === EXAM TIPS ===
  {
    title: "12. Exam Strategy",
    color: "amber",
    content: (
      <div className="space-y-2 text-sm">
        <div className="font-semibold text-amber-400">Quick Checklist:</div>
        <ol className="ml-4 space-y-1">
          <li>1. Identify parameter (μ or p)</li>
          <li>2. Check what's known (σ?)</li>
          <li>3. Choose correct distribution</li>
          <li>4. Calculate step-by-step</li>
          <li>5. Interpret in context</li>
        </ol>
        <div className="mt-2 p-2 bg-amber-900/20 rounded">
          <strong>Time-saver:</strong> Memorize z₀.₀₂₅ = 1.96
        </div>
      </div>
    )
  }
];

// Main Chapter 5 Reference Sheet Component
export const Chapter5ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter5Sections}
      title="Chapter 5: Estimation - Complete Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'emerald',
        accent: 'purple',
        warning: 'yellow'
      }}
    />
  );
};

// Alternative compact version for specific topics
export const EstimationFormulasOnly = ({ mode = "inline" }) => {
  const formulaSections = chapter5Sections.filter(section => 
    [2, 3, 4, 5, 6, 11].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={formulaSections}
      title="Estimation Formulas - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'purple',
        secondary: 'blue',
        accent: 'emerald',
        warning: 'yellow'
      }}
    />
  );
};

// Confidence Intervals specific reference
export const ConfidenceIntervalsReference = ({ mode = "inline" }) => {
  const ciSections = chapter5Sections.filter(section => 
    [2, 3, 4, 5, 7, 9].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={ciSections}
      title="Confidence Intervals - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'emerald',
        secondary: 'purple',
        accent: 'blue',
        warning: 'yellow'
      }}
    />
  );
};

export default Chapter5ReferenceSheet;