# Chapter 2: Discrete Distributions - Parallel Migration Instructions

## Overview
This document provides step-by-step instructions for migrating Chapter 2 to the standardized hub model. This can be executed independently by a Claude agent while another agent works on Chapter 3.

## Prerequisites
- Chapter 1 has been successfully migrated and serves as the template
- Chapter 7 is the gold standard for hub implementation
- All Chapter 2 components already exist and are functional

## Step 1: Create Parallel Implementation Structure (5 minutes)

```bash
# Create new parallel structure
mkdir -p /src/components/02-discrete-distributions-new
mkdir -p /src/app/chapter2-new
```

## Step 2: Create Hub Component (20 minutes)

Create `/src/components/02-discrete-distributions-new/2-0-DiscreteDistributionsHub.jsx`

Use this template based on Chapter 7:

```javascript
"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  Shuffle, Calculator, Binary, Dices, 
  TrendingDown, Layers, Zap, BookOpen 
} from 'lucide-react';

const colors = createColorScheme('probability');

const CHAPTER_2_SECTIONS = [
  {
    id: 'random-variables',
    title: '2.1 Random Variables & Distributions',
    subtitle: 'From outcomes to numbers',
    description: 'Learn how random variables map outcomes to numerical values. Build intuition through interactive spatial visualization.',
    icon: Shuffle,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Understand random variables as mapping functions',
      'Calculate probability mass functions',
      'Visualize probability through spatial regions',
      'Build cumulative distribution functions'
    ],
    route: '/chapter2-new/random-variables',
    color: '#10b981',
    question: "How do we turn random outcomes into numbers?",
    preview: "Interactive spatial probability explorer"
  },
  {
    id: 'expectation-variance',
    title: '2.2 Expectation & Variance',
    subtitle: 'Center and spread of distributions',
    description: 'Master the fundamental measures of distributions. Calculate expected values and understand variability through interactive examples.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    prerequisites: ['random-variables'],
    learningGoals: [
      'Calculate expected values E[X]',
      'Compute variance and standard deviation',
      'Apply linearity of expectation',
      'Work through real-world examples'
    ],
    route: '/chapter2-new/expectation-variance',
    color: '#3b82f6',
    question: "What is the average outcome and how much does it vary?",
    preview: "Expectation calculator with worked examples"
  },
  {
    id: 'transformations',
    title: '2.2.4 Transformations',
    subtitle: 'Linear and function transformations',
    description: 'Learn how transformations affect expectation and variance. Master the rules for linear and non-linear transformations.',
    icon: Binary,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['expectation-variance'],
    learningGoals: [
      'Apply linear transformation rules',
      'Calculate E[aX + b] and Var(aX + b)',
      'Handle function transformations E[g(X)]',
      'Visualize transformation effects'
    ],
    route: '/chapter2-new/transformations',
    color: '#3b82f6',
    question: "How do transformations change distributions?",
    preview: "Interactive transformation visualizer"
  },
  {
    id: 'binomial-distribution',
    title: '2.3 Binomial Distribution',
    subtitle: 'Counting successes in trials',
    description: 'Explore the most important discrete distribution. Model repeated independent trials with interactive simulations.',
    icon: Dices,
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    prerequisites: ['expectation-variance'],
    learningGoals: [
      'Derive the binomial formula',
      'Calculate binomial probabilities',
      'Find mean and variance',
      'Apply to real-world scenarios'
    ],
    route: '/chapter2-new/binomial-distribution',
    color: '#3b82f6',
    question: "How many successes in n independent trials?",
    preview: "Binomial probability calculator and simulator"
  },
  {
    id: 'geometric-distribution',
    title: '2.4 Geometric Distribution',
    subtitle: 'Waiting for the first success',
    description: 'Model the number of trials until the first success. Understand memoryless property through interactive examples.',
    icon: TrendingDown,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['binomial-distribution'],
    learningGoals: [
      'Derive geometric probabilities',
      'Understand the memoryless property',
      'Calculate expected waiting times',
      'Compare with other distributions'
    ],
    route: '/chapter2-new/geometric-distribution',
    color: '#3b82f6',
    question: "How long until the first success?",
    preview: "Geometric distribution simulator"
  },
  {
    id: 'negative-binomial',
    title: '2.5 Negative Binomial Distribution',
    subtitle: 'Waiting for multiple successes',
    description: 'Generalize the geometric distribution to model waiting for r successes. Explore through interactive visualizations.',
    icon: Layers,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['geometric-distribution'],
    learningGoals: [
      'Extend geometric to r successes',
      'Calculate negative binomial probabilities',
      'Find mean and variance',
      'Apply to queuing problems'
    ],
    route: '/chapter2-new/negative-binomial',
    color: '#8b5cf6',
    question: "How many trials to get r successes?",
    preview: "Negative binomial explorer"
  },
  {
    id: 'poisson-distribution',
    title: '2.6 Poisson Distribution',
    subtitle: 'Modeling rare events',
    description: 'Master the distribution of rare events in continuous time or space. See connections to binomial and exponential.',
    icon: Zap,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['binomial-distribution'],
    learningGoals: [
      'Derive Poisson from binomial limit',
      'Calculate Poisson probabilities',
      'Understand rate parameter λ',
      'Apply to counting processes'
    ],
    route: '/chapter2-new/poisson-distribution',
    color: '#8b5cf6',
    question: "How many rare events occur in a fixed interval?",
    preview: "Poisson process simulator"
  },
  {
    id: 'distribution-stories',
    title: '2.7 Distribution Stories',
    subtitle: 'Choosing the right model',
    description: 'Learn when to use each distribution through real-world scenarios. Master the art of distribution selection.',
    icon: BookOpen,
    difficulty: 'Advanced',
    estimatedTime: '35 min',
    prerequisites: ['binomial-distribution', 'geometric-distribution', 'poisson-distribution'],
    learningGoals: [
      'Identify distribution from context',
      'Compare distribution properties',
      'Solve complex word problems',
      'Build intuition for modeling'
    ],
    route: '/chapter2-new/distribution-stories',
    color: '#8b5cf6',
    question: "Which distribution fits this story?",
    preview: "Interactive story problem solver"
  }
];

// Rest of component following Chapter 7 pattern...
```

## Step 3: Create Route Structure (15 minutes)

Create these directories and page files:

```bash
# Create all route directories
mkdir -p /src/app/chapter2-new/{random-variables,expectation-variance,transformations,binomial-distribution,geometric-distribution,negative-binomial,poisson-distribution,distribution-stories}
```

For each route, create a `page.js` file. Example for random-variables:

```javascript
import SpatialRandomVariable from '@/components/02-discrete-distributions/2-1-1-SpatialRandomVariable';
import BackToHub from '@/components/ui/BackToHub';

export default function RandomVariablesPage() {
  return (
    <>
      <BackToHub chapter={2} />
      <SpatialRandomVariable />
    </>
  );
}
```

## Step 4: Component Grouping Strategy

For sections with multiple components, combine them in the page file:

```javascript
// expectation-variance/page.js
import ExpectationVariance from '@/components/02-discrete-distributions/2-2-1-ExpectationVariance';
import ExpectationVarianceWorkedExample from '@/components/02-discrete-distributions/2-2-2-ExpectationVarianceWorkedExample';
import BackToHub from '@/components/ui/BackToHub';

export default function ExpectationVariancePage() {
  return (
    <>
      <BackToHub chapter={2} />
      <div className="space-y-12">
        <ExpectationVariance />
        <ExpectationVarianceWorkedExample />
      </div>
    </>
  );
}
```

## Step 5: Migration Execution (10 minutes)

1. Test at `/chapter2-new` to ensure hub renders
2. Test navigation to each section
3. Verify BackToHub works from each section
4. Once confirmed working:
   ```bash
   mv /src/app/chapter2 /src/app/chapter2-old
   mv /src/app/chapter2-new /src/app/chapter2
   ```

## Step 6: Update Sidebar Configuration (5 minutes)

Update `/src/config/sidebar-chapters.js`:

```javascript
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
}
```

## Step 7: Final Verification (10 minutes)

Run build and lint:
```bash
npm run build && npm run lint
```

## Time Estimate: ~90 minutes

## Success Checklist
- [ ] Hub renders at `/chapter2`
- [ ] All 8 sections accessible
- [ ] Navigation works both directions
- [ ] Components grouped logically
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Build passes