"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { useMathJax } from "../../hooks/useMathJax";
import { Chapter7ReferenceSheet } from "../reference-sheets/Chapter7ReferenceSheet";
import { 
  TrendingUp, Calculator, Target, BarChart3, 
  Sigma, Activity, ChartLine, GitBranch
} from 'lucide-react';

// Get consistent color scheme for regression
const colors = createColorScheme('regression');

/**
 * Key Concepts Card component for Chapter 7
 * Displays fundamental linear regression concepts with LaTeX notation
 */
const KeyConceptsCard = React.memo(() => {
  const concepts = [
    { term: "Correlation", definition: "Strength of linear relationship", latex: `\\rho` },
    { term: "Regression Line", definition: "Best prediction equation", latex: `\\hat{y} = b_0 + b_1x` },
    { term: "R-squared", definition: "Variation explained by model", latex: `R^2` },
    { term: "Standard Error", definition: "Typical prediction error", latex: `s_e` },
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
              <div className="text-lg font-mono text-cyan-400 overflow-x-auto">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Chapter 7 specific configuration with navigation
const CHAPTER_7_SECTIONS = [
  {
    id: 'correlation-coefficient',
    title: '7.1 Correlation Coefficient',
    subtitle: 'Measuring relationship strength',
    description: 'How strong is the linear relationship between two variables? Learn to calculate and interpret correlation.',
    icon: TrendingUp,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Calculate Pearson correlation coefficient',
      'Interpret correlation values (-1 to +1)',
      'Understand correlation vs causation',
      'Apply to real datasets'
    ],
    route: '/chapter7/correlation-coefficient',
    color: '#10b981',
    question: "How do we measure the strength of a linear relationship?",
    preview: "Interactive correlation explorer"
  },
  {
    id: 'simple-linear-regression',
    title: '7.2 Simple Linear Regression',
    subtitle: 'Finding the best-fit line',
    description: 'Discover how to find the line that best predicts one variable from another using least squares.',
    icon: ChartLine,
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: ['correlation-coefficient'],
    learningGoals: [
      'Derive the least squares equations',
      'Calculate regression coefficients',
      'Interpret slope and intercept',
      'Make predictions with confidence'
    ],
    route: '/chapter7/simple-linear-regression',
    color: '#10b981',
    question: "What's the best line to predict Y from X?",
    preview: "Least squares fitting visualization"
  },
  {
    id: 'hypothesis-testing-regression',
    title: '7.3 Hypothesis Testing in Regression',
    subtitle: 'Testing slope significance',
    description: 'Is the relationship real or just random noise? Test whether your regression slope is statistically significant.',
    icon: Target,
    difficulty: 'Intermediate',
    estimatedTime: '22 min',
    prerequisites: ['simple-linear-regression'],
    learningGoals: [
      'Test if slope equals zero',
      'Calculate t-statistics for regression',
      'Construct confidence intervals for slope',
      'Understand model assumptions'
    ],
    route: '/chapter7/hypothesis-testing-regression',
    color: '#3b82f6',
    question: "Is there really a relationship, or is it just chance?",
    preview: "Slope significance testing"
  },
  {
    id: 'confidence-prediction-intervals',
    title: '7.4 Confidence & Prediction Intervals',
    subtitle: 'Quantifying uncertainty',
    description: 'Learn the crucial difference between confidence intervals for the mean and prediction intervals for individual values.',
    icon: Activity,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['hypothesis-testing-regression'],
    learningGoals: [
      'Distinguish confidence vs prediction intervals',
      'Calculate both types of intervals',
      'Visualize uncertainty bands',
      'Apply to real predictions'
    ],
    route: '/chapter7/confidence-prediction-intervals',
    color: '#3b82f6',
    question: "How certain are we about our predictions?",
    preview: "Confidence and prediction bands"
  },
  {
    id: 'analysis-of-variance',
    title: '7.5 Analysis of Variance (ANOVA)',
    subtitle: 'Decomposing variation',
    description: 'Break down total variation into explained and unexplained parts. Understand the F-test for overall model significance.',
    icon: GitBranch,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['confidence-prediction-intervals'],
    learningGoals: [
      'Decompose sum of squares',
      'Understand SST, SSR, and SSE',
      'Perform F-test for regression',
      'Create ANOVA tables'
    ],
    route: '/chapter7/analysis-of-variance',
    color: '#8b5cf6',
    question: "How much variation does our model explain?",
    preview: "Variation decomposition visualization"
  },
  {
    id: 'coefficient-of-determination',
    title: '7.6 Coefficient of Determination',
    subtitle: 'Model goodness-of-fit',
    description: 'Master R-squared and adjusted R-squared. Learn what they really mean and their limitations.',
    icon: BarChart3,
    difficulty: 'Advanced',
    estimatedTime: '18 min',
    prerequisites: ['analysis-of-variance'],
    learningGoals: [
      'Calculate and interpret R²',
      'Understand adjusted R²',
      'Recognize R² limitations',
      'Compare model performance'
    ],
    route: '/chapter7/coefficient-of-determination',
    color: '#8b5cf6',
    question: "How well does our model fit the data?",
    preview: "R-squared interpretation guide"
  }
];

/**
 * Linear Regression Hub Component
 * 
 * Main hub page for Chapter 7: Linear Regression and Correlation.
 * Displays chapter overview, key concepts, and navigation to all sections.
 * 
 * Features:
 * - Interactive key concepts with LaTeX formulas
 * - Comprehensive section navigation
 * - Progress tracking
 * - Consistent styling with chapter theme
 * 
 * @returns {JSX.Element} The complete Chapter 7 hub interface
 */
export default function LinearRegressionHub() {
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
            Chapter 7: Linear Regression and Correlation
          </h1>
          <p className="text-xl text-gray-400">
            Learn to model relationships and make predictions with confidence
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is Linear Regression?</h2>
          <p className="text-gray-300">
            Linear regression reveals relationships between variables, enabling prediction and 
            understanding. From fuel quality to stock prices, master the tools to model 
            real-world relationships. You'll learn to quantify relationships, make predictions, 
            and understand the uncertainty in your models.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={7}
          chapterTitle="Linear Regression and Correlation"
          chapterSubtitle="Master prediction and relationship analysis"
          sections={CHAPTER_7_SECTIONS}
          storageKey="linearRegressionProgress"
          progressVariant="blue"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />

        {/* Floating Reference Sheet */}
        <Chapter7ReferenceSheet mode="floating" />
      </div>
    </div>
  );
}