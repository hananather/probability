"use client";
import React from 'react';
import { QuickReferenceCard } from '../ui/patterns/QuickReferenceCard';

/**
 * Chapter 1: Introduction to Probabilities - Complete Reference Sheet
 * A comprehensive quick reference for all probability concepts, formulas, and procedures
 */

// Define all sections for Chapter 1 - organized by logical learning progression
const chapter1Sections = [
  // === CORE CONCEPTS ===
  {
    title: "1. Fundamental Probability Concepts",
    color: "blue",
    content: (
      <div className="space-y-2 text-sm">
        <div>
          <strong>Sample Space (S):</strong> Set of all possible outcomes
        </div>
        <div>
          <strong>Event (A):</strong> Subset of sample space
        </div>
        <div>
          <strong>Basic Probability:</strong>
          <div className="text-xs text-neutral-400">For a finite sample space with equally likely outcomes:</div>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of outcomes}}\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Properties:</strong> 
          <span dangerouslySetInnerHTML={{ __html: `\\(0 \\leq P(A) \\leq 1\\)` }} />, 
          <span dangerouslySetInnerHTML={{ __html: `\\(P(S) = 1\\)` }} />, 
          <span dangerouslySetInnerHTML={{ __html: `\\(P(\\emptyset) = 0\\)` }} />
        </div>
      </div>
    )
  },

  // === SET OPERATIONS ===
  {
    title: "2. Set Operations and Probability Rules",
    color: "emerald",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>Complement Rule:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A^c) = 1 - P(A)\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Addition Rule (General):</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A \\cup B) = P(A) + P(B) - P(A \\cap B)\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Mutually Exclusive Events:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\text{If } A \\cap B = \\emptyset, \\text{ then } P(A \\cup B) = P(A) + P(B)\\]` 
            }} />
          </div>
        </div>
        <div className="bg-emerald-900/20 p-2 rounded text-xs">
          <strong>Set Notation:</strong> A ∪ B (union), A ∩ B (intersection), A^c (complement), A - B (difference)
        </div>
      </div>
    )
  },

  // === COUNTING PRINCIPLES ===
  {
    title: "3. Counting Techniques",
    color: "orange",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>Multiplication Principle:</strong> If task 1 has m ways and task 2 has n ways for every first-task choice, total = m × n
        </div>
        <div className="text-xs text-neutral-400">For permutations and combinations: select r of n distinct items without replacement, with integers 0 ≤ r ≤ n.</div>
        <div>
          <strong>Permutations (Order Matters):</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(n,r) = \\frac{n!}{(n-r)!}\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">All items: n!. Circular: (n-1)! for n ≥ 1 distinct items, treating rotations as the same arrangement and reflections as distinct.</div>
        </div>
        <div>
          <strong>Combinations (Order Doesn't Matter):</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Symmetry: C(n,r) = C(n,n-r)</div>
        </div>
      </div>
    )
  },

  // === CONDITIONAL PROBABILITY ===
  {
    title: "4. Conditional Probability",
    color: "purple",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>Definition:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A|B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(B) > 0\\]` 
            }} />
          </div>
        </div>
        <div>
          <strong>Multiplication Rule:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A \\cap B) = P(A|B) \\cdot P(B) = P(B|A) \\cdot P(A)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">The two conditional terms require P(B) &gt; 0 and P(A) &gt; 0, respectively.</div>
        </div>
        <div>
          <strong>Chain Rule for 3 Events:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A \\cap B \\cap C) = P(A) \\cdot P(B|A) \\cdot P(C|A \\cap B)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires P(A ∩ B) &gt; 0, which also gives P(A) &gt; 0.</div>
        </div>
        <div>
          <strong>Multiple Conditions:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A|B \\cap C) = \\frac{P(A \\cap B \\cap C)}{P(B \\cap C)}\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires P(B ∩ C) &gt; 0.</div>
        </div>
        <div>
          <strong>Complement with Condition:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A^c|B) = 1 - P(A|B)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires P(B) &gt; 0.</div>
        </div>
        <div className="bg-purple-900/20 p-2 rounded text-xs">
          <strong>Key insight:</strong> P(A|B) answers "What's the probability of A given that B occurred?"
        </div>
      </div>
    )
  },

  // === INDEPENDENCE ===
  {
    title: "5. Independence",
    color: "yellow",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>Definition - Events A and B are independent when:</strong>
          <div className="grid grid-cols-1 gap-1 mt-2 text-xs bg-yellow-900/20 p-2 rounded">
            <div>• <span dangerouslySetInnerHTML={{ __html: `\\(P(A \\cap B) = P(A) \\times P(B)\\)` }} /></div>
            <div>• Equivalently, if P(B) &gt; 0: <span dangerouslySetInnerHTML={{ __html: `\\(P(A|B) = P(A)\\)` }} /></div>
            <div>• Equivalently, if P(A) &gt; 0: <span dangerouslySetInnerHTML={{ __html: `\\(P(B|A) = P(B)\\)` }} /></div>
          </div>
        </div>
        <div>
          <strong>Independence Test:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A \\cap B) \\stackrel{?}{=} P(A) \\times P(B)\\]` 
            }} />
          </div>
        </div>
      </div>
    )
  },

  // === LAW OF TOTAL PROBABILITY ===
  {
    title: "6. Law of Total Probability",
    color: "indigo",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>For a partition B₁, B₂, ..., Bₙ of sample space, with P(Bᵢ) &gt; 0:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A) = \\sum_{i=1}^n P(A|B_i) \\cdot P(B_i)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">The partition events are disjoint and cover S. Omit zero-probability parts when using this conditional form.</div>
        </div>
        <div>
          <strong>Binary case (most common):</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A) = P(A|B) \\cdot P(B) + P(A|B^c) \\cdot P(B^c)\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires 0 &lt; P(B) &lt; 1.</div>
        </div>
        <div className="bg-indigo-900/20 p-2 rounded text-xs">
          <strong>Use when:</strong> Event A can occur through different scenarios and you know conditional probabilities
        </div>
      </div>
    )
  },

  // === BAYES THEOREM ===
  {
    title: "7. Bayes' Theorem",
    color: "teal",
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <strong>Basic Form:</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires P(A) &gt; 0 and P(B) &gt; 0 for the displayed conditional probabilities.</div>
        </div>
        <div>
          <strong>Expanded Form (Binary):</strong>
          <div className="text-center my-2">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B|A) \\cdot P(A) + P(B|A^c) \\cdot P(A^c)}\\]` 
            }} />
          </div>
          <div className="text-xs text-neutral-400">Requires 0 &lt; P(A) &lt; 1 and positive evidence P(B).</div>
        </div>
        <div className="bg-teal-900/20 p-2 rounded text-xs">
          <strong>Components:</strong> P(A) = prior, P(B|A) = likelihood, P(B) = evidence, P(A|B) = posterior
        </div>
      </div>
    )
  },

  // === COMPREHENSIVE FORMULA REFERENCE ===
  {
    title: "8. Complete Formula Reference",
    color: "gray",
    content: (
      <div className="space-y-3 text-xs font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-blue-400 font-semibold mb-1">Basic Probability:</div>
            <div>• P(A^c) = 1 - P(A)</div>
            <div>• P(A ∪ B) = P(A) + P(B) - P(A ∩ B)</div>
            <div>• If disjoint: P(A ∪ B) = P(A) + P(B)</div>
          </div>
          <div>
            <div className="text-green-400 font-semibold mb-1">Counting:</div>
            <div>• P(n,r) = n!/(n-r)!</div>
            <div>• C(n,r) = n!/[r!(n-r)!]</div>
            <div>• Circular: (n-1)!</div>
            <div className="text-neutral-400">Distinct items, without replacement; integers 0 ≤ r ≤ n. Circular: n ≥ 1, rotations identified, reflections distinct.</div>
          </div>
          <div>
            <div className="text-purple-400 font-semibold mb-1">Conditional:</div>
            <div>• P(A|B) = P(A ∩ B)/P(B), P(B) &gt; 0</div>
            <div>• P(A ∩ B) = P(A|B) × P(B), P(B) &gt; 0</div>
            <div>• Independence: P(A|B) = P(A), when P(B) &gt; 0</div>
          </div>
          <div>
            <div className="text-teal-400 font-semibold mb-1">Advanced:</div>
            <div>• Law of Total: P(A) = ΣP(A|Bᵢ)P(Bᵢ)</div>
            <div>• Bayes: P(A|B) = P(B|A)P(A)/P(B)</div>
            <div className="text-neutral-400">Law of Total: disjoint exhaustive partition, P(Bᵢ) &gt; 0. Bayes form: P(A) &gt; 0 and P(B) &gt; 0.</div>
          </div>
        </div>
      </div>
    )
  },

  // === PROBLEM SOLVING STRATEGY ===
  {
    title: "9. Problem Solving Approach",
    color: "green",
    content: (
      <div className="space-y-3 text-sm">
        <div className="bg-green-900/20 p-3 rounded">
          <strong className="text-green-400">Step-by-Step Strategy:</strong>
          <ol className="mt-2 ml-4 space-y-1 text-xs">
            <li>1. <strong>Identify:</strong> What type of probability problem?</li>
            <li>2. <strong>Define:</strong> Sample space and relevant events</li>
            <li>3. <strong>Check:</strong> Are events independent? Mutually exclusive?</li>
            <li>4. <strong>Choose:</strong> Appropriate formula based on given information</li>
            <li>5. <strong>Calculate:</strong> Apply formula carefully</li>
            <li>6. <strong>Verify:</strong> Does answer make sense? (0 ≤ P ≤ 1)</li>
          </ol>
        </div>
        <div className="bg-neutral-800 p-2 rounded text-xs">
          <strong>Key Words Guide:</strong><br/>
          • "and" → intersection (∩)<br/>
          • "or" → union (∪)<br/>
          • "given" → conditional (|)<br/>
          • "without replacement" → update the available items after each draw<br/>
          • "with replacement" → independent when each draw is a fresh independent uniform selection
        </div>
      </div>
    )
  }
];

// Main Chapter 1 Reference Sheet Component
export const Chapter1ReferenceSheet = ({ mode = "floating" }) => {
  return (
    <QuickReferenceCard
      sections={chapter1Sections}
      title="Chapter 1: Probability Fundamentals - Complete Reference"
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

// Alternative compact version for basic concepts and formulas
export const BasicProbabilityFormulas = ({ mode = "inline" }) => {
  const formulaSections = chapter1Sections.filter(section => 
    [1, 2, 3, 8].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={formulaSections}
      title="Basic Probability Formulas - Quick Reference"
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

// Conditional Probability and Bayes specific reference
export const ConditionalProbabilityReference = ({ mode = "inline" }) => {
  const conditionalSections = chapter1Sections.filter(section => 
    [4, 5, 6, 7, 9].includes(parseInt(section.title.split('.')[0]))
  );
  
  return (
    <QuickReferenceCard
      sections={conditionalSections}
      title="Conditional Probability & Bayes - Quick Reference"
      mode={mode}
      colorScheme={{
        primary: 'teal',
        secondary: 'purple',
        accent: 'blue',
        warning: 'yellow'
      }}
    />
  );
};

export default Chapter1ReferenceSheet;
