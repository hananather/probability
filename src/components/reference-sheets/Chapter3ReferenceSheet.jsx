"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 3: Continuous Random Variables - Complete Reference Sheet
 * A comprehensive quick reference for all continuous random variable concepts, formulas, and distributions
 */

// Define all sections for Chapter 3
const chapter3Sections = [
  // === CORE CONCEPTS ===
  {
    title: "1. Continuous Random Variable Fundamentals",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Continuous RV:</strong> Takes uncountably infinite values in an interval
        </div>
        <div>
          <strong>PDF f(x):</strong> Probability density function
        </div>
        <div>
          <strong>CDF F(x):</strong> Cumulative distribution function
        </div>
        <div>
          <strong>Key Property:</strong> P(X = c) = 0 for any specific value c
        </div>
      </div>
    )
  },

  // === PDF AND CDF RELATIONSHIPS ===
  {
    title: "2. PDF and CDF Relationships",
    color: "emerald",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Probability from PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(a \\leq X \\leq b) = \\int_a^b f(x) \\, dx\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>CDF Definition:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[F(x) = P(X \\leq x) = \\int_{-\\infty}^x f(t) \\, dt\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>PDF from CDF:</strong> f(x) = F'(x)
        </div>
        <div>
          <strong>Properties:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) \\geq 0, \\quad \\int_{-\\infty}^{\\infty} f(x) \\, dx = 1\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === EXPECTATION AND VARIANCE ===
  {
    title: "3. Expectation and Variance",
    color: "purple",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Expected Value:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[E[X] = \\int_{-\\infty}^{\\infty} x \\cdot f(x) \\, dx\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Variance:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(X) = \\int_{-\\infty}^{\\infty} (x-\\mu)^2 f(x) \\, dx\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Alternative:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(X) = E[X^2] - (E[X])^2\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === LINEAR TRANSFORMATIONS ===
  {
    title: "4. Linear Transformations",
    color: "purple",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>If Y = aX + b:</strong>
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs bg-purple-900/20 p-2 rounded">
          <div dangerouslySetInnerHTML={{ __html: `\\(E[Y] = aE[X] + b\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(Y) = a^2\\text{Var}(X)\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\(\\sigma_Y = |a|\\sigma_X\\)` }} />
        </div>
        <div>
          <strong>PDF Transformation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f_Y(y) = f_X\\left(\\frac{y-b}{a}\\right) \\cdot \\frac{1}{|a|}\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === UNIFORM DISTRIBUTION ===
  {
    title: "5. Uniform Distribution U(a,b)",
    color: "teal",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\begin{cases} \\frac{1}{b-a} & \\text{if } a \\leq x \\leq b \\\\ 0 & \\text{otherwise} \\end{cases}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{a+b}{2}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{(b-a)^2}{12}\\)` }} />
            <li>CDF is linear on [a,b]</li>
          </ul>
        </div>
      </div>
    )
  },

  // === NORMAL DISTRIBUTION ===
  {
    title: "6. Normal Distribution N(μ,σ²)",
    color: "yellow",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <div className="grid grid-cols-1 gap-1 text-xs bg-yellow-900/20 p-2 rounded">
            <div dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\mu\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\sigma^2\\)` }} />
            <div>Bell-shaped, symmetric about μ</div>
          </div>
        </div>
        <div>
          <strong>Standardization:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{X - \\mu}{\\sigma} \\sim N(0,1)\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === STANDARD NORMAL ===
  {
    title: "7. Standard Normal Z ~ N(0,1)",
    color: "orange",
    content: (
      <div className="space-y-3">
        <div>
          <strong className="text-orange-400">Z-Score Formula:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[Z = \\frac{X - \\mu}{\\sigma}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong className="text-orange-400">Key Z-Values:</strong>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq 1.96) = 0.975\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq 2.576) = 0.995\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(P(Z \\leq 1.645) = 0.95\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(P(-1 \\leq Z \\leq 1) = 0.68\\)` }} />
          </div>
        </div>
      </div>
    )
  },

  // === EMPIRICAL RULE ===
  {
    title: "8. Empirical Rule (68-95-99.7)",
    color: "pink",
    content: (
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-pink-900/20 rounded">
          <div dangerouslySetInnerHTML={{ __html: `• 68% within \\(\\mu \\pm \\sigma\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `• 95% within \\(\\mu \\pm 2\\sigma\\)` }} />
          <div dangerouslySetInnerHTML={{ __html: `• 99.7% within \\(\\mu \\pm 3\\sigma\\)` }} />
        </div>
        <div className="text-xs text-neutral-400">
          Applies to any normal distribution
        </div>
      </div>
    )
  },

  // === EXPONENTIAL DISTRIBUTION ===
  {
    title: "9. Exponential Distribution Exp(λ)",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\lambda e^{-\\lambda x}, \\quad x ≥ 0\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>CDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[F(x) = 1 - e^{-\\lambda x}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{1}{\\lambda}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{1}{\\lambda^2}\\)` }} />
            <li>Memoryless property</li>
            <li>Models waiting times</li>
          </ul>
        </div>
      </div>
    )
  },

  // === GAMMA DISTRIBUTION ===
  {
    title: "10. Gamma Distribution Gamma(α,β)",
    color: "green",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{\\beta^\\alpha}{\\Gamma(\\alpha)} x^{\\alpha-1} e^{-\\beta x}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{\\alpha}{\\beta}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{\\alpha}{\\beta^2}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `Exponential is \\(\\text{Gamma}(1,\\lambda)\\)` }} />
            <li>Sum of exponentials ~ Gamma</li>
          </ul>
        </div>
      </div>
    )
  },

  // === NORMAL APPROXIMATIONS ===
  {
    title: "11. Normal Approximation to Binomial",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Conditions:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• np ≥ 10</li>
            <li>• n(1-p) ≥ 10</li>
          </ul>
        </div>
        <div className="p-2 bg-red-900/20 rounded">
          <strong>Approximation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[B(n,p) \\approx N(np, np(1-p))\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Continuity Correction:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) \\approx P(k-0.5 < Y < k+0.5)\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === JOINT DISTRIBUTIONS ===
  {
    title: "12. Joint Continuous Distributions",
    color: "gray",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Joint PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(a ≤ X ≤ b, c ≤ Y ≤ d) = \\int_a^b \\int_c^d f(x,y) \\, dy \\, dx\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Independence:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x,y) = f_X(x) \\times f_Y(y)\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Marginal PDFs:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `\\(f_X(x) = \\int f(x,y) \\, dy\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(f_Y(y) = \\int f(x,y) \\, dx\\)` }} />
          </ul>
        </div>
      </div>
    )
  },

  // === BETA DISTRIBUTION ===
  {
    title: "13. Beta Distribution Beta(α,β)",
    color: "cyan",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PDF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[f(x) = \\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha,\\beta)}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Support:</strong> 0 ≤ x ≤ 1
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{\\alpha}{\\alpha + \\beta}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}\\)` }} />
            <li>Models proportions and probabilities</li>
          </ul>
        </div>
      </div>
    )
  },

  // === CHI-SQUARE DISTRIBUTION ===
  {
    title: "14. Chi-Square Distribution χ²(k)",
    color: "violet",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Special Case of Gamma:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\chi^2(k) = \\text{Gamma}\\left(\\frac{k}{2}, \\frac{1}{2}\\right)\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>k degrees of freedom</li>
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = k\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = 2k\\)` }} />
            <li>Used for variance testing</li>
          </ul>
        </div>
      </div>
    )
  },

  // === T-DISTRIBUTION ===
  {
    title: "15. t-Distribution t(ν)",
    color: "rose",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Use Case:</strong> Small sample inference when σ unknown
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>ν degrees of freedom</li>
            <li>Symmetric, bell-shaped</li>
            <li>Heavier tails than normal</li>
            <li>Approaches N(0,1) as ν → ∞</li>
          </ul>
        </div>
        <div>
          <strong>Common Use:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[T = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === DISTRIBUTION COMPARISON ===
  {
    title: "16. Continuous Distribution Summary",
    color: "amber",
    content: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-3 gap-2 font-semibold text-amber-400">
          <div>Distribution</div>
          <div>E[X]</div>
          <div>Var(X)</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Uniform(a,b)</div>
          <div>(a+b)/2</div>
          <div>(b-a)²/12</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Normal(μ,σ²)</div>
          <div>μ</div>
          <div>σ²</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Exponential(λ)</div>
          <div>1/λ</div>
          <div>1/λ²</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Gamma(α,β)</div>
          <div>α/β</div>
          <div>α/β²</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Beta(α,β)</div>
          <div>α/(α+β)</div>
          <div>αβ/[(α+β)²(α+β+1)]</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Chi-Square(k)</div>
          <div>k</div>
          <div>2k</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>t(ν)</div>
          <div>0</div>
          <div>ν/(ν-2), ν &gt; 2</div>
        </div>
      </div>
    )
  }
];

// Main Chapter 3 Reference Sheet Component
export const Chapter3ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter3Sections}
      title="Chapter 3: Continuous Random Variables - Complete Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'yellow',
        accent: 'purple',
        warning: 'orange'
      }}
    />
  );
};

// Normal Distribution specific reference
export const NormalDistributionReference = ({ mode = "inline" }) => {
  const normalSections = chapter3Sections.filter(section => 
    [6, 7, 8, 11].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={normalSections}
      title="Normal Distribution - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'yellow',
        secondary: 'orange',
        accent: 'blue',
        warning: 'pink'
      }}
    />
  );
};

// Continuous Distributions specific reference
export const ContinuousDistributionsOnly = ({ mode = "inline" }) => {
  const distributionSections = chapter3Sections.filter(section => 
    [5, 6, 9, 10, 13].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={distributionSections}
      title="Continuous Distributions - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'teal',
        secondary: 'indigo',
        accent: 'green',
        warning: 'yellow'
      }}
    />
  );
};

export default Chapter3ReferenceSheet;