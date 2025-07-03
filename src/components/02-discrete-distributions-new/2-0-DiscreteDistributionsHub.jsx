"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  Shuffle, Calculator, Binary, Dices, 
  TrendingDown, Layers, Zap, BookOpen 
} from 'lucide-react';

// Get consistent color scheme for probability
const colors = createColorScheme('probability');

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Random Variable", definition: "Maps outcomes to numbers", latex: "X: \\Omega \\to \\mathbb{R}" },
    { term: "PMF", definition: "Probability of each value", latex: "P(X = x)" },
    { term: "Expected Value", definition: "Long-run average", latex: "E[X] = \\sum x \\cdot P(X = x)" },
    { term: "Variance", definition: "Spread of distribution", latex: "\\text{Var}(X) = E[(X - \\mu)^2]" },
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

// Chapter 2 specific configuration with navigation
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
    route: '/chapter2/random-variables',
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
    route: '/chapter2/expectation-variance',
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
    route: '/chapter2/transformations',
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
    route: '/chapter2/binomial-distribution',
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
    route: '/chapter2/geometric-distribution',
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
    route: '/chapter2/negative-binomial',
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
    route: '/chapter2/poisson-distribution',
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
    route: '/chapter2/distribution-stories',
    color: '#8b5cf6',
    question: "Which distribution fits this story?",
    preview: "Interactive story problem solver"
  }
];

export default function DiscreteDistributionsHub() {
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
            Chapter 2: Discrete Random Variables
          </h1>
          <p className="text-xl text-gray-400">
            From random outcomes to probability distributions
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What are Discrete Random Variables?</h2>
          <p className="text-gray-300">
            Discrete random variables transform random experiments into mathematical objects we can analyze. 
            From coin flips to customer arrivals, you'll learn to model uncertainty, calculate probabilities, 
            and make predictions. Master the fundamental distributions that power statistics and data science.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={2}
          chapterTitle="Discrete Random Variables"
          chapterSubtitle="Master probability distributions and their applications"
          sections={CHAPTER_2_SECTIONS}
          storageKey="discreteDistributionsProgress"
          progressVariant="blue"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}