"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  GitBranch, AreaChart, Calculator, Bell, 
  Timer, Flame, Grid3x3, TrendingUp 
} from 'lucide-react';

// Get consistent color scheme for continuous distributions
const colors = createColorScheme('continuous');

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Probability Density", definition: "Probability per unit interval", latex: "f(x)" },
    { term: "Integration", definition: "Finding area under curves", latex: "\\int_{a}^{b} f(x)dx" },
    { term: "Normal Distribution", definition: "The bell curve", latex: "\\mathcal{N}(\\mu, \\sigma^2)" },
    { term: "Exponential", definition: "Waiting time distribution", latex: "\\lambda e^{-\\lambda x}" },
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

// Chapter 3 specific configuration with navigation
const CHAPTER_3_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction: Bridge to Continuous',
    subtitle: 'From discrete to continuous',
    description: 'Make the conceptual leap from discrete to continuous distributions. Understand probability density and area under curves.',
    icon: GitBranch,
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    prerequisites: [],
    learningGoals: [
      'Transition from PMF to PDF',
      'Understand probability as area',
      'Visualize continuous distributions',
      'Connect discrete and continuous concepts'
    ],
    route: '/chapter3/introduction',
    color: '#10b981',
    question: "How do we handle infinite possibilities?",
    preview: "Interactive discrete to continuous visualization"
  },
  {
    id: 'probability-density',
    title: '3.1 Probability Density Functions',
    subtitle: 'PDFs and integration',
    description: 'Master probability density functions and calculate probabilities through integration. Interactive visualizations make calculus intuitive.',
    icon: AreaChart,
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    prerequisites: ['introduction'],
    learningGoals: [
      'Define and work with PDFs',
      'Calculate probabilities via integration',
      'Find cumulative distribution functions',
      'Verify PDF properties'
    ],
    route: '/chapter3/probability-density',
    color: '#3b82f6',
    question: "How do we find probabilities from density?",
    preview: "PDF explorer with integral calculator"
  },
  {
    id: 'expectation-variance',
    title: '3.2 Expectation & Variance',
    subtitle: 'Continuous E[X] and Var(X)',
    description: 'Calculate expected values and variance for continuous distributions using integration. Build intuition through visualizations.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['probability-density'],
    learningGoals: [
      'Calculate E[X] = ∫xf(x)dx',
      'Find variance using E[X²]',
      'Apply continuous transformations',
      'Connect to discrete analogs'
    ],
    route: '/chapter3/expectation-variance',
    color: '#3b82f6',
    question: "How do we find center and spread continuously?",
    preview: "Continuous expectation visualizer"
  },
  {
    id: 'normal-distributions',
    title: '3.3 Normal Distributions',
    subtitle: 'The bell curve and z-scores',
    description: 'Master the most important continuous distribution. Learn z-scores, empirical rule, and normal table lookups through interactive tools.',
    icon: Bell,
    difficulty: 'Intermediate',
    estimatedTime: '40 min',
    prerequisites: ['expectation-variance'],
    learningGoals: [
      'Understand normal distribution properties',
      'Calculate and interpret z-scores',
      'Apply the empirical rule (68-95-99.7)',
      'Use normal tables effectively',
      'Solve real-world problems'
    ],
    route: '/chapter3/normal-distributions',
    color: '#3b82f6',
    question: "Why is the normal distribution everywhere?",
    preview: "Interactive z-score calculator and visualizer"
  },
  {
    id: 'exponential',
    title: '3.4 Exponential Distributions',
    subtitle: 'Modeling waiting times',
    description: 'Model continuous waiting times with the exponential distribution. Explore memoryless property and connections to Poisson.',
    icon: Timer,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['probability-density'],
    learningGoals: [
      'Derive exponential PDF',
      'Understand rate parameter λ',
      'Apply memoryless property',
      'Connect to Poisson processes'
    ],
    route: '/chapter3/exponential',
    color: '#3b82f6',
    question: "How long until the next event?",
    preview: "Exponential distribution simulator"
  },
  {
    id: 'gamma',
    title: '3.5 Gamma Distributions',
    subtitle: 'Generalized waiting times',
    description: 'Extend exponential to model waiting for multiple events. Master shape and scale parameters through visualization.',
    icon: Flame,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['exponential'],
    learningGoals: [
      'Understand gamma function Γ(α)',
      'Work with shape and scale parameters',
      'See exponential as special case',
      'Apply to reliability analysis'
    ],
    route: '/chapter3/gamma',
    color: '#8b5cf6',
    question: "How long for multiple events to occur?",
    preview: "Gamma distribution parameter explorer"
  },
  {
    id: 'joint-distributions',
    title: '3.6 Joint Distributions',
    subtitle: 'Multiple random variables',
    description: 'Extend to multiple continuous variables. Master joint PDFs, marginal distributions, and conditional distributions.',
    icon: Grid3x3,
    difficulty: 'Advanced',
    estimatedTime: '35 min',
    prerequisites: ['probability-density'],
    learningGoals: [
      'Work with joint PDFs f(x,y)',
      'Calculate marginal distributions',
      'Find conditional distributions',
      'Determine independence',
      'Calculate joint probabilities'
    ],
    route: '/chapter3/joint-distributions',
    color: '#8b5cf6',
    question: "How do multiple variables interact?",
    preview: "3D joint distribution visualizer"
  },
  {
    id: 'normal-approximation',
    title: '3.7 Normal Approximation',
    subtitle: 'Central Limit Theorem preview',
    description: 'See how discrete distributions approach normal for large n. Apply continuity correction for better approximations.',
    icon: TrendingUp,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['normal-distributions'],
    learningGoals: [
      'Apply normal approximation to binomial',
      'Use continuity correction',
      'Check approximation conditions',
      'Preview Central Limit Theorem'
    ],
    route: '/chapter3/normal-approximation',
    color: '#8b5cf6',
    question: "When can we use normal approximation?",
    preview: "Binomial to normal transition visualizer"
  }
];

export default function ContinuousDistributionsHub() {
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
            Chapter 3: Continuous Random Variables
          </h1>
          <p className="text-xl text-gray-400">
            Journey from discrete to continuous probability distributions
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">The Continuous Revolution</h2>
          <p className="text-gray-300">
            Move beyond counting to measuring. Continuous distributions open up a world of infinite 
            possibilities, from the ubiquitous normal distribution to exponential waiting times. 
            Master integration, probability density, and the tools that power modern statistics 
            and machine learning.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={3}
          chapterTitle="Continuous Random Variables"
          chapterSubtitle="From discrete counts to continuous measurements"
          sections={CHAPTER_3_SECTIONS}
          storageKey="continuousDistributionsProgress"
          progressVariant="emerald"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}