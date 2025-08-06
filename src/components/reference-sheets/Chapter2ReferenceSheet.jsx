"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 2: Discrete Random Variables - Complete Reference Sheet
 * A comprehensive quick reference for all discrete random variable concepts, formulas, and distributions
 */

// Define all sections for Chapter 2
const chapter2Sections = [
  // === CORE CONCEPTS ===
  {
    title: "1. Random Variable Fundamentals",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Random Variable Definition:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[X: \\Omega \\to \\mathbb{R}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Random Variable (X):</strong> Function that assigns numbers to outcomes
        </div>
        <div>
          <strong>Discrete RV:</strong> Takes countable values (0, 1, 2, ...)
        </div>
        <div>
          <strong>PMF - P(X = x):</strong> Probability mass function
        </div>
        <div>
          <strong>PMF Properties:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = x) \\geq 0, \\quad \\sum_{x} P(X = x) = 1\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === EXPECTATION AND VARIANCE ===
  {
    title: "2. Expectation and Variance",
    color: "emerald",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Expected Value:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[E[X] = \\mu_X = \\sum x \\cdot P(X = x)\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Variance Definition:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(X) = E[(X - \\mu)^2]\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Variance (Alternative):</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{Var}(X) = \\sigma_X^2 = E[X^2] - (E[X])^2\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Standard Deviation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\sigma_X = \\sqrt{\\text{Var}(X)}\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === LINEAR TRANSFORMATIONS ===
  {
    title: "3. Linear Transformations",
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
        <div className="mt-2">
          <strong>Properties:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li dangerouslySetInnerHTML={{ __html: `• \\(E[X + c] = E[X] + c\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `• \\(E[cX] = cE[X]\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `• \\(\\text{Var}(X + c) = \\text{Var}(X)\\)` }} />
          </ul>
        </div>
      </div>
    )
  },

  // === BINOMIAL DISTRIBUTION ===
  {
    title: "4. Binomial Distribution B(n,p)",
    color: "teal",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PMF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Mean and Variance:</strong>
          <div className="grid grid-cols-1 gap-1 text-xs bg-teal-900/20 p-2 rounded">
            <div dangerouslySetInnerHTML={{ __html: `\\(E[X] = np\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = np(1-p)\\)` }} />
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Fixed n trials, constant p, independent trials
        </div>
      </div>
    )
  },

  // === GEOMETRIC DISTRIBUTION ===
  {
    title: "5. Geometric Distribution Geom(p)",
    color: "yellow",
    content: (
      <div className="space-y-3">
        <div>
          <strong className="text-yellow-400">PMF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = (1-p)^{k-1} p\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong className="text-yellow-400">Properties:</strong>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{1}{p}\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{1-p}{p^2}\\)` }} />
            <div>Memoryless property</div>
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Number of trials until first success
        </div>
      </div>
    )
  },

  // === NEGATIVE BINOMIAL ===
  {
    title: "6. Negative Binomial NB(r,p)",
    color: "orange",
    content: (
      <div className="space-y-2">
        <div>
          <strong>PMF (trials until r-th success):</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = \\binom{k-1}{r-1} p^r (1-p)^{k-r}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong>
          <ul className="text-xs space-y-1">
            <li dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\frac{r}{p}\\)` }} />
            <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\frac{r(1-p)}{p^2}\\)` }} />
            <li>Generalizes geometric (r=1)</li>
          </ul>
        </div>
      </div>
    )
  },

  // === POISSON DISTRIBUTION ===
  {
    title: "7. Poisson Distribution Pois(λ)",
    color: "pink",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>PMF:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Mean and Variance:</strong>
          <div className="grid grid-cols-1 gap-1 text-xs bg-pink-900/20 p-2 rounded">
            <div dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\lambda\\)` }} />
            <div dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = \\lambda\\)` }} />
          </div>
        </div>
        <div>
          <strong>Addition Property:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[X_1 + X_2 \\sim \\text{Poisson}(\\lambda_1 + \\lambda_2)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">when X₁ and X₂ are independent</div>
        </div>
        <div className="text-xs text-neutral-400">
          Models rare events in fixed time/space intervals
        </div>
      </div>
    )
  },

  // === POISSON APPROXIMATION ===
  {
    title: "8. Poisson Approximation to Binomial",
    color: "indigo",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>When to use:</strong>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• n is large (≥ 100)</li>
            <li>• p is small (≤ 0.01)</li>
            <li>• np ≤ 10</li>
          </ul>
        </div>
        <div className="p-2 bg-indigo-900/20 rounded">
          <strong>Approximation:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[B(n,p) \\approx \\text{Pois}(\\lambda = np)\\]` 
            }} />
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Much easier to calculate than binomial for large n
        </div>
      </div>
    )
  },

  // === DISTRIBUTION COMPARISON ===
  {
    title: "9. Distribution Comparison Table",
    color: "green",
    content: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-3 gap-2 font-semibold text-green-400">
          <div>Distribution</div>
          <div>E[X]</div>
          <div>Var(X)</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Binomial(n,p)</div>
          <div>np</div>
          <div>np(1-p)</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Geometric(p)</div>
          <div>1/p</div>
          <div>(1-p)/p²</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>NegBinom(r,p)</div>
          <div>r/p</div>
          <div>r(1-p)/p²</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>Poisson(λ)</div>
          <div>λ</div>
          <div>λ</div>
        </div>
      </div>
    )
  },

  // === MOMENT GENERATING FUNCTIONS ===
  {
    title: "10. Moment Generating Functions",
    color: "red",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Definition:</strong>
          <div className="text-center my-1">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[M_X(t) = E[e^{tX}] = \\sum e^{tx} P(X = x)\\]` 
            }} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div><strong>Binomial:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(M_X(t) = (pe^t + 1-p)^n\\)` }} /></div>
          <div><strong>Geometric:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(M_X(t) = \\frac{pe^t}{1-(1-p)e^t}\\)` }} /></div>
          <div><strong>Poisson:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(M_X(t) = e^{\\lambda(e^t - 1)}\\)` }} /></div>
        </div>
      </div>
    )
  },

  // === PROBLEM SOLVING STRATEGY ===
  {
    title: "11. Distribution Selection Guide",
    color: "gray",
    content: (
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-gray-900/20 rounded">
          <strong>Binomial:</strong> Fixed n trials, constant p
        </div>
        <div className="p-2 bg-gray-900/20 rounded">
          <strong>Geometric:</strong> Trials until first success
        </div>
        <div className="p-2 bg-gray-900/20 rounded">
          <strong>Negative Binomial:</strong> Trials until r-th success
        </div>
        <div className="p-2 bg-gray-900/20 rounded">
          <strong>Poisson:</strong> Rare events, fixed interval
        </div>
      </div>
    )
  },

];

// Main Chapter 2 Reference Sheet Component
export const Chapter2ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter2Sections}
      title="Chapter 2: Discrete Random Variables - Complete Reference"
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

// Distribution-specific references
export const DiscreteDistributionsOnly = ({ mode = "inline" }) => {
  const distributionSections = chapter2Sections.filter(section => 
    [4, 5, 6, 7, 9].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={distributionSections}
      title="Discrete Distributions - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'teal',
        secondary: 'emerald',
        accent: 'purple',
        warning: 'yellow'
      }}
    />
  );
};

// Expectation and Variance specific reference
export const ExpectationVarianceReference = ({ mode = "inline" }) => {
  const expectationSections = chapter2Sections.filter(section => 
    [2, 3, 9, 10].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={expectationSections}
      title="Expectation & Variance - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'purple',
        secondary: 'emerald',
        accent: 'blue',
        warning: 'yellow'
      }}
    />
  );
};

export default Chapter2ReferenceSheet;