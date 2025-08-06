"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { useMathJax } from "../../hooks/useMathJax";
import { Chapter6ReferenceSheet } from "../reference-sheets/Chapter6ReferenceSheet";
import { 
  Lightbulb, AlertCircle, TrendingUp, Calculator, 
  Scale, Target, Users, Percent, FlaskConical
} from 'lucide-react';

// Get consistent color scheme for hypothesis testing
const colors = createColorScheme('hypothesis');

/**
 * Key Concepts Card component for Chapter 6
 * Displays essential hypothesis testing concepts with LaTeX rendering
 * 
 * @component
 * @returns {JSX.Element} Key concepts display card
 */
const KeyConceptsCard = React.memo(() => {
  const concepts = [
    { term: "Null Hypothesis", definition: "The claim we test", latex: "H_0: \\mu = \\mu_0" },
    { term: "Test Statistic", definition: "Standardized evidence", latex: "Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}" },
    { term: "p-value", definition: "Probability of extreme data", latex: "P(|Z| > z_{obs} | H_0)" },
    { term: "Power", definition: "Detecting true effects", latex: "1 - \\beta" },
  ];
  
  const contentRef = useMathJax([concepts]);

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Key Concepts You'll Master</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          >
            <div className="flex flex-col space-y-2">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400">{concept.definition}</p>
              </div>
              <div className="text-lg font-mono text-purple-400 overflow-x-auto">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

KeyConceptsCard.displayName = 'KeyConceptsCard';

// All Chapter 6 sections
const CHAPTER_6_SECTIONS = [
  {
    id: 'hypothesis-fundamentals',
    title: '6.1 Hypothesis Testing Fundamentals',
    subtitle: 'Core concepts and framework',
    description: 'Master the systematic approach to testing claims with data. Build intuition for null/alternative hypotheses, test statistics, and p-values.',
    icon: Lightbulb,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Formulate null and alternative hypotheses',
      'Understand the hypothesis testing framework',
      'Interpret p-values correctly',
      'Avoid common misconceptions'
    ],
    route: '/chapter6/hypothesis-fundamentals',
    color: '#10b981',
    question: "How do we test claims with data?",
    preview: "Interactive hypothesis testing framework"
  },
  {
    id: 'types-of-hypotheses',
    title: '6.2 Types of Hypotheses',
    subtitle: 'One-tailed vs two-tailed tests',
    description: 'Learn when to use different types of tests. Understand directional vs non-directional hypotheses and their implications.',
    icon: Scale,
    difficulty: 'Intermediate',
    estimatedTime: '15 min',
    prerequisites: ['hypothesis-fundamentals'],
    learningGoals: [
      'Distinguish one-tailed from two-tailed tests',
      'Choose appropriate test types',
      'Set up rejection regions',
      'Understand power implications'
    ],
    route: '/chapter6/types-of-hypotheses',
    color: '#3b82f6',
    question: "Does direction matter in testing?",
    preview: "Visual comparison of test types"
  },
  {
    id: 'errors-and-power',
    title: '6.3 Errors and Power',
    subtitle: 'Type I/II errors and power analysis',
    description: 'Balance the risks of false positives and false negatives. Learn to calculate and optimize statistical power.',
    icon: AlertCircle,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['types-of-hypotheses'],
    learningGoals: [
      'Understand Type I and Type II errors',
      'Control error rates with α and β',
      'Perform power analysis',
      'Calculate and visualize power'
    ],
    route: '/chapter6/errors-and-power',
    color: '#3b82f6',
    question: "What's worse: convicting the innocent or letting the guilty go free?",
    preview: "Type I/II error trade-off visualization"
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
      'Draw appropriate conclusions'
    ],
    route: '/chapter6/test-mean-known-variance',
    color: '#3b82f6',
    question: "Is our sample mean significantly different?",
    preview: "Interactive z-test calculator"
  },
  {
    id: 'test-mean-unknown-variance',
    title: '6.5 Test for a Mean (Unknown Variance)',
    subtitle: 'The practical t-test',
    description: 'The realistic scenario: testing means without knowing population variance. Master the t-test and its applications.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['test-mean-known-variance'],
    learningGoals: [
      'Apply t-distribution for testing',
      'Handle unknown variance scenarios',
      'Calculate confidence intervals',
      'Connect to real-world problems'
    ],
    route: '/chapter6/test-mean-unknown-variance',
    color: '#3b82f6',
    question: "How do we handle uncertainty about variance?",
    preview: "t-test explorer with real data"
  },
  {
    id: 'test-for-proportion',
    title: '6.6 Test for a Proportion',
    subtitle: 'Testing percentage claims',
    description: 'Is the true proportion different from what\'s claimed? Learn to test hypotheses about percentages and rates.',
    icon: Percent,
    difficulty: 'Intermediate',
    estimatedTime: '18 min',
    prerequisites: ['test-mean-unknown-variance'],
    learningGoals: [
      'Set up proportion tests',
      'Use normal approximation appropriately',
      'Calculate standard errors for proportions',
      'Apply to polls and quality control'
    ],
    route: '/chapter6/test-for-proportion',
    color: '#3b82f6',
    question: "Is the success rate what we expect?",
    preview: "Proportion test visualizer"
  },
  {
    id: 'paired-two-sample',
    title: '6.7 Paired Two-Sample Tests',
    subtitle: 'Before vs after comparisons',
    description: 'Compare matched pairs: before/after treatment, twin studies, repeated measures. Learn when pairing increases power.',
    icon: Users,
    difficulty: 'Advanced',
    estimatedTime: '22 min',
    prerequisites: ['test-mean-unknown-variance'],
    learningGoals: [
      'Identify paired data scenarios',
      'Perform paired t-tests',
      'Understand power advantages',
      'Handle matched experimental designs'
    ],
    route: '/chapter6/paired-two-sample',
    color: '#8b5cf6',
    question: "Did the treatment make a difference?",
    preview: "Before/after comparison tool"
  },
  {
    id: 'unpaired-two-sample',
    title: '6.8 Unpaired Two-Sample Tests',
    subtitle: 'Comparing independent groups',
    description: 'Compare two independent groups: treatment vs control, method A vs B. Master pooled and Welch\'s t-tests.',
    icon: Target,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['paired-two-sample'],
    learningGoals: [
      'Test differences between groups',
      'Check and handle equal variance assumption',
      'Apply pooled vs Welch\'s t-test',
      'Design comparative experiments'
    ],
    route: '/chapter6/unpaired-two-sample',
    color: '#8b5cf6',
    question: "Are these two groups really different?",
    preview: "Group comparison simulator"
  },
  {
    id: 'difference-two-proportions',
    title: '6.9 Difference of Two Proportions',
    subtitle: 'Comparing success rates',
    description: 'Is treatment A\'s success rate higher than B\'s? Compare proportions between groups with proper statistical tests.',
    icon: FlaskConical,
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    prerequisites: ['test-for-proportion', 'unpaired-two-sample'],
    learningGoals: [
      'Compare proportions between groups',
      'Calculate pooled standard errors',
      'Test for significant differences',
      'Apply to A/B testing scenarios'
    ],
    route: '/chapter6/difference-two-proportions',
    color: '#8b5cf6',
    question: "Which treatment has a better success rate?",
    preview: "A/B test analyzer"
  }
];

/**
 * Chapter 6 Hub Component - Hypothesis Testing
 * 
 * Main hub for hypothesis testing concepts, providing navigation to all chapter sections.
 * Features comprehensive coverage from basic concepts to advanced two-sample tests.
 * 
 * @component
 * @returns {JSX.Element} The Chapter 6 hub page
 */
export default function HypothesisTestingHub() {
  const router = useRouter();

  const handleSectionClick = (section) => {
    if (section?.route) {
      router.push(section.route);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Chapter 6: Hypothesis Testing
          </h1>
          <p className="text-xl text-gray-400">
            Make data-driven decisions with statistical rigor
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">The Art of Statistical Decision Making</h2>
          <p className="text-gray-300">
            Hypothesis testing is the cornerstone of data-driven decision making. Learn to test claims 
            systematically, control error rates, and draw valid conclusions from data. From medical trials 
            to A/B testing, master the tools that power modern research and industry.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={6}
          chapterTitle="Hypothesis Testing"
          chapterSubtitle="Testing claims with statistical rigor"
          sections={CHAPTER_6_SECTIONS}
          storageKey="hypothesisTestingProgress"
          progressVariant="purple"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />

        {/* Floating Reference Sheet */}
        <Chapter6ReferenceSheet mode="floating" />
      </div>
    </div>
  );
}