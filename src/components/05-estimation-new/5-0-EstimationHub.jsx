"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  Brain, Target, Calculator, Activity, PieChart
} from 'lucide-react';

// Get consistent color scheme for estimation
const colors = createColorScheme('estimation');

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Point Estimate", definition: "Best single guess from data", latex: "\\bar{X}" },
    { term: "Confidence Interval", definition: "Range of plausible values", latex: "\\bar{X} \\pm ME" },
    { term: "Standard Error", definition: "Precision of estimate", latex: "\\frac{\\sigma}{\\sqrt{n}}" },
    { term: "Sample Size", definition: "Observations needed", latex: "n = \\left(\\frac{z\\sigma}{E}\\right)^2" }
  ];

  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId = setTimeout(processMathJax, 100); // CRITICAL: Retry after 100ms
    return () => clearTimeout(timeoutId);
  }, []);

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
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
              </div>
              <div className="text-2xl font-mono text-emerald-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Chapter 5 specific configuration with navigation
const CHAPTER_5_SECTIONS = [
  {
    id: 'statistical-inference',
    title: '5.1 Statistical Inference',
    subtitle: 'From samples to populations',
    description: 'Draw conclusions about populations based on sample data. Master the foundations of statistical estimation and Bayesian thinking.',
    icon: Brain,
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: [],
    learningGoals: [
      'Distinguish parameters from statistics',
      'Understand sampling distributions',
      'Apply Bayesian inference to real problems',
      'Calculate point estimates effectively'
    ],
    route: '/chapter5/statistical-inference',
    color: '#10b981', // Emerald
    question: "How do we infer population truths from sample data?",
    preview: "Interactive sampling and Bayesian updates"
  },
  {
    id: 'confidence-intervals-known',
    title: '5.2 Confidence Intervals (σ Known)',
    subtitle: 'Quantifying certainty with known variance',
    description: 'When population standard deviation is known, construct confidence intervals using the normal distribution. Master the 68-95-99.7 rule.',
    icon: Target,
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    prerequisites: ['statistical-inference'],
    learningGoals: [
      'Construct confidence intervals with known σ',
      'Apply the 68-95-99.7 rule',
      'Interpret confidence levels correctly',
      'Visualize interval coverage'
    ],
    route: '/chapter5/confidence-intervals-known',
    color: '#10b981',
    question: "How confident are we in our estimates?",
    preview: "Interactive CI builder and simulations"
  },
  {
    id: 'sample-size',
    title: '5.3 Sample Size Determination',
    subtitle: 'How many observations do we need?',
    description: 'Calculate optimal sample sizes balancing precision, confidence, and cost. Explore the relationships through stunning 3D visualizations.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Calculate required sample sizes',
      'Understand precision-cost tradeoffs',
      'Visualize n-E-α relationships',
      'Apply to real-world scenarios'
    ],
    route: '/chapter5-new/sample-size-calculation',
    color: '#3b82f6', // Blue
    question: "How many samples ensure reliable results?",
    preview: "3D visualization laboratory"
  },
  {
    id: 'confidence-intervals-unknown',
    title: '5.4 Confidence Intervals (σ Unknown)',
    subtitle: 'Real-world estimation with t-distribution',
    description: 'When population standard deviation is unknown, use the t-distribution. Compare with z-intervals and explore bootstrapping methods.',
    icon: Activity,
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Apply t-distribution for small samples',
      'Compare t-intervals vs z-intervals',
      'Understand degrees of freedom',
      'Master bootstrap techniques'
    ],
    route: '/chapter5/confidence-intervals-unknown',
    color: '#3b82f6',
    question: "What happens when σ is unknown?",
    preview: "t-distribution explorer and bootstrap demo"
  },
  {
    id: 'proportions',
    title: '5.5 Proportion Confidence Intervals',
    subtitle: 'From polls to quality control',
    description: 'Apply confidence intervals to proportions in election polling, A/B testing, and quality control. Compare different methods and their accuracy.',
    icon: PieChart,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Construct proportion confidence intervals',
      'Compare Wald vs Wilson methods',
      'Apply to polling and testing',
      'Understand sample size requirements'
    ],
    route: '/chapter5/proportions',
    color: '#8b5cf6', // Purple
    question: "How accurate are polls and surveys?",
    preview: "Election polling and A/B testing scenarios"
  }
];

export default function EstimationHub() {
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
            Chapter 5: Point and Interval Estimation
          </h1>
          <p className="text-xl text-gray-400">
            Master the art of statistical estimation and uncertainty quantification
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is Estimation?</h2>
          <p className="text-gray-300">
            Estimation is the cornerstone of statistical inference. Every day, we make decisions 
            based on incomplete information – from medical diagnoses to election predictions. 
            This chapter teaches you how to quantify uncertainty, construct confidence intervals, 
            and determine optimal sample sizes for reliable conclusions.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={5}
          chapterTitle="Point and Interval Estimation"
          chapterSubtitle="From samples to population truths"
          sections={CHAPTER_5_SECTIONS}
          storageKey="estimationProgress"
          progressVariant="green"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}