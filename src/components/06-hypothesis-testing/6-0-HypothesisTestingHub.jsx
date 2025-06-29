"use client";
import React from "react";
import ChapterHub from "../shared/ChapterHub";
import { 
  Lightbulb, AlertCircle, TrendingUp, Calculator, 
  Scale, Target, Users, Percent, FlaskConical
} from 'lucide-react';

// Chapter 6 specific configuration
const CHAPTER_6_SECTIONS = [
  {
    id: 'hypothesis-fundamentals',
    title: '6.1 Hypothesis Testing Fundamentals',
    subtitle: 'Start your journey here',
    description: 'What are null and alternative hypotheses? Learn the foundation of statistical decision-making through interactive exploration.',
    icon: Lightbulb,
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    prerequisites: [],
    learningGoals: [
      'Understand null and alternative hypotheses',
      'Learn the logic of hypothesis testing',
      'Explore real-world examples',
      'Practice formulating hypotheses'
    ],
    component: null,
    color: '#10b981' // Green for beginner
  },
  {
    id: 'types-of-hypotheses',
    title: '6.2 Types of Hypotheses',
    subtitle: 'One-tailed vs Two-tailed',
    description: 'Discover when to use one-tailed versus two-tailed tests. Master the art of choosing the right test for your question.',
    icon: Scale,
    difficulty: 'Beginner',
    estimatedTime: '12 min',
    prerequisites: ['hypothesis-fundamentals'],
    learningGoals: [
      'Differentiate one-tailed from two-tailed tests',
      'Understand directional hypotheses',
      'Learn when to use each type',
      'Practice with visual examples'
    ],
    component: null,
    color: '#10b981' // Green for beginner
  },
  {
    id: 'errors-and-power',
    title: '6.3 Errors & Power',
    subtitle: 'Type I, Type II, and Statistical Power',
    description: 'The trade-off between Type I and Type II errors. Learn about statistical power and how to balance different types of mistakes.',
    icon: AlertCircle,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['types-of-hypotheses'],
    learningGoals: [
      'Understand Type I and Type II errors',
      'Learn about statistical power',
      'Explore the trade-offs between errors',
      'Calculate and visualize power'
    ],
    component: null,
    color: '#3b82f6' // Blue for intermediate
  },
  {
    id: 'test-mean-known-variance',
    title: '6.4 Test for a Mean (Known Variance)',
    subtitle: 'Z-test fundamentals',
    description: 'How do we test a claim about an average when we know the population\'s variability? Master the z-test through interactive examples.',
    icon: TrendingUp,
    difficulty: 'Intermediate',
    estimatedTime: '18 min',
    prerequisites: ['errors-and-power'],
    learningGoals: [
      'Understand the z-test setup',
      'Calculate test statistics',
      'Interpret p-values',
      'Apply to real scenarios'
    ],
    component: null,
    color: '#3b82f6' // Blue for intermediate
  },
  {
    id: 'test-mean-unknown-variance',
    title: '6.5 Test for a Mean (Unknown Variance)',
    subtitle: 'Introduction to the t-test',
    description: 'What happens when we don\'t know the population\'s variability? Discover the t-test and its applications.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['test-mean-known-variance'],
    learningGoals: [
      'Understand when to use t-test vs z-test',
      'Learn about degrees of freedom',
      'Apply the one-sample t-test',
      'Interpret results correctly'
    ],
    component: null,
    color: '#3b82f6' // Blue for intermediate
  },
  {
    id: 'test-for-proportion',
    title: '6.6 Test for a Proportion',
    subtitle: 'Testing percentages and rates',
    description: 'How do we test a claim about a percentage or a rate? Learn to test proportions with confidence.',
    icon: Percent,
    difficulty: 'Intermediate',
    estimatedTime: '15 min',
    prerequisites: ['test-mean-unknown-variance'],
    learningGoals: [
      'Set up proportion tests',
      'Check test assumptions',
      'Calculate test statistics for proportions',
      'Apply to survey data'
    ],
    component: null,
    color: '#3b82f6' // Blue for intermediate
  },
  {
    id: 'paired-two-sample',
    title: '6.7 Paired Two-Sample Test',
    subtitle: 'Before & after comparisons',
    description: 'How do we compare two related groups (e.g., before and after a treatment)? Master paired sample analysis.',
    icon: Users,
    difficulty: 'Advanced',
    estimatedTime: '22 min',
    prerequisites: ['test-for-proportion'],
    learningGoals: [
      'Understand paired vs independent samples',
      'Learn the paired t-test',
      'Analyze before-after data',
      'Handle matched pairs designs'
    ],
    component: null,
    color: '#8b5cf6' // Purple for advanced
  },
  {
    id: 'unpaired-two-sample',
    title: '6.8 Unpaired Two-Sample Test',
    subtitle: 'Comparing independent groups',
    description: 'How do we compare two independent groups? Learn to test differences between separate populations.',
    icon: Target,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['paired-two-sample'],
    learningGoals: [
      'Differentiate paired from unpaired tests',
      'Apply two-sample t-tests',
      'Check equality of variances',
      'Interpret group differences'
    ],
    component: null,
    color: '#8b5cf6' // Purple for advanced
  },
  {
    id: 'difference-two-proportions',
    title: '6.9 Difference of Two Proportions',
    subtitle: 'Comparing percentages',
    description: 'How do we compare two percentages? Master the comparison of proportions between groups.',
    icon: FlaskConical,
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    prerequisites: ['unpaired-two-sample'],
    learningGoals: [
      'Set up two-proportion tests',
      'Calculate pooled proportions',
      'Test for significant differences',
      'Apply to A/B testing scenarios'
    ],
    component: null,
    color: '#8b5cf6' // Purple for advanced
  }
];

export default function HypothesisTestingHub() {
  return (
    <ChapterHub
      chapterNumber={6}
      chapterTitle="Hypothesis Testing"
      chapterSubtitle="Learn to make data-driven decisions and test statistical claims with confidence"
      sections={CHAPTER_6_SECTIONS}
      storageKey="hypothesisTestingProgress"
      progressVariant="purple"
    />
  );
}