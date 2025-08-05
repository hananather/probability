"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { useMathJax } from "../../hooks/useMathJax";
import { 
  Brain, Target, Calculator, Activity, PieChart, ArrowRight, GitBranch
} from 'lucide-react';

// Get consistent color scheme for estimation
const colors = createColorScheme('estimation');

/**
 * Key Concepts Card component for displaying fundamental estimation concepts with LaTeX formulas
 * @component
 * @returns {React.JSX.Element} Rendered key concepts card
 */
const KeyConceptsCard = React.memo(() => {
  const concepts = [
    { 
      term: "Point Estimate", 
      definition: "A single value that represents our best guess for an unknown population parameter", 
      latex: "\\hat{\\theta} = \\bar{X}",
      example: "Sample mean x̄ = 72.5 estimates population mean μ"
    },
    { 
      term: "Confidence Interval", 
      definition: "A range of values that likely contains the true population parameter", 
      latex: "\\bar{X} \\pm z_{\\alpha/2} \\cdot SE",
      example: "95% CI: [70.2, 74.8] means we're 95% confident μ is in this range"
    },
    { 
      term: "Standard Error", 
      definition: "Measures how much our estimate would vary if we repeated the sampling process", 
      latex: "SE = \\frac{\\sigma}{\\sqrt{n}}",
      example: "SE = 1.2 means sample means typically vary by ±1.2 from the true mean"
    },
    { 
      term: "Margin of Error", 
      definition: "The ± amount in a confidence interval, representing precision", 
      latex: "ME = z_{\\alpha/2} \\cdot SE",
      example: "Poll result: 52% ± 3% means ME = 3 percentage points"
    }
  ];
  
  const contentRef = useMathJax([concepts]);

  return (
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Core Concepts You'll Master</h3>
      <p className="text-sm text-gray-400 mb-4">
        These four concepts form the foundation of all statistical estimation. Click each to explore:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((concept, i) => (
          <div
            key={i}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          >
            <div className="flex flex-col space-y-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-white text-lg">{concept.term}</h4>
                <p className="text-sm text-gray-300">{concept.definition}</p>
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-base font-mono text-emerald-400 mb-1">
                    <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
                  </div>
                  <p className="text-xs text-gray-500 italic">{concept.example}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

KeyConceptsCard.displayName = 'KeyConceptsCard';

// All Chapter 5 sections
const CHAPTER_5_SECTIONS = [
  {
    id: 'statistical-inference',
    title: '5.1 Statistical Inference',
    subtitle: 'From samples to populations',
    description: 'Discover how statisticians perform "magic" – using small samples to make accurate statements about entire populations. You\'ll explore the difference between what we can measure (statistics) and what we want to know (parameters), and learn both classical and Bayesian approaches to inference.',
    icon: Brain,
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: [],
    learningGoals: [
      'Distinguish parameters (what we want) from statistics (what we have)',
      'Visualize how sampling distributions behave',
      'Update beliefs using Bayesian inference',
      'Choose appropriate point estimates for different scenarios'
    ],
    route: '/chapter5/statistical-inference',
    color: '#10b981', // Emerald
    question: "How can 1,000 survey responses tell us about 300 million people?",
    preview: "Interactive sampling simulator and live Bayesian updates"
  },
  {
    id: 'confidence-intervals-known',
    title: '5.2 Confidence Intervals (σ Known)',
    subtitle: 'Quantifying certainty with known variance',
    description: 'Learn to construct confidence intervals when you know the population standard deviation (common in quality control and standardized testing). You\'ll discover why 95% confidence doesn\'t mean "95% probability" and master the famous 68-95-99.7 rule that appears everywhere in statistics.',
    icon: Target,
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    prerequisites: ['statistical-inference'],
    learningGoals: [
      'Build confidence intervals using the normal distribution',
      'Apply the 68-95-99.7 rule (one, two, and three standard deviations)',
      'Correctly interpret what "95% confident" actually means',
      'Visualize how confidence intervals capture true values'
    ],
    route: '/chapter5/confidence-intervals-known',
    color: '#10b981',
    question: "If a poll shows 52% ± 3%, what does that really mean?",
    preview: "Build intervals interactively and test your interpretations"
  },
  {
    id: 'confidence-intervals-practice',
    title: '5.2 Practice: Confidence Intervals',
    subtitle: 'Master CI problems through practice',
    description: 'Solidify your understanding with multiple choice quizzes, worked examples, and interactive calculators. Practice common exam questions, avoid typical mistakes, and build confidence in solving CI problems.',
    icon: Target,
    difficulty: 'Practice',
    estimatedTime: '20 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Solve CI problems step-by-step',
      'Identify and avoid common mistakes',
      'Practice with multiple choice questions',
      'Use interactive calculators for quick verification'
    ],
    route: '/chapter5/confidence-intervals-practice',
    color: '#f59e0b', // Amber for practice
    badge: '📝 Practice',
    question: "Ready to test your CI skills?",
    preview: "Practice problems with immediate feedback"
  },
  {
    id: 'sample-size',
    title: '5.3 Sample Size Determination',
    subtitle: 'How many observations do we need?',
    description: 'One of the most practical questions in statistics: "How large should my sample be?" Too small and your results are unreliable; too large and you waste resources. Explore the mathematical relationships between sample size, precision, and confidence through interactive 3D visualizations that make these trade-offs crystal clear.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Calculate sample sizes for desired precision',
      'Balance statistical power with practical constraints',
      'Understand why doubling precision quadruples the sample size',
      'Apply formulas to real scenarios (clinical trials, surveys, QC)'
    ],
    route: '/chapter5/sample-size',
    color: '#3b82f6', // Blue
    question: "Why do national polls only need ~1,000 people for good accuracy?",
    preview: "Manipulate 3D surfaces to see sample size relationships"
  },
  {
    id: 'confidence-intervals-unknown',
    title: '5.4 Confidence Intervals (σ Unknown)',
    subtitle: 'Real-world estimation with t-distribution',
    description: 'In reality, we rarely know the population standard deviation. Enter the t-distribution – wider and more conservative than the normal distribution, especially for small samples. You\'ll see why "Student" (W.S. Gosset) developed this while working at Guinness brewery, and explore modern bootstrap methods that work without any distribution assumptions.',
    icon: Activity,
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Use the t-distribution when σ is estimated from data',
      'See how t-intervals widen for smaller samples',
      'Understand degrees of freedom intuitively',
      'Apply bootstrap resampling for complex situations'
    ],
    route: '/chapter5/confidence-intervals-unknown',
    color: '#3b82f6',
    question: "Why do small samples require different methods?",
    preview: "Compare t vs. normal distributions and create bootstrap intervals"
  },
  {
    id: 'proportions',
    title: '5.5 Proportion Confidence Intervals',
    subtitle: 'From polls to quality control',
    description: 'Proportions are everywhere: election polls, conversion rates, defect rates, and test pass rates. But proportion intervals behave differently than mean intervals, especially near 0% or 100%. Compare the simple (but flawed) Wald method with the superior Wilson method, and see why poll results need larger samples than you might think.',
    icon: PieChart,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Build confidence intervals for proportions and percentages',
      'Understand why the Wald method fails near boundaries',
      'Apply the Wilson method for better coverage',
      'Calculate sample sizes for polls and A/B tests'
    ],
    route: '/chapter5/proportions',
    color: '#8b5cf6', // Purple
    question: "Why do election polls sometimes get it spectacularly wrong?",
    preview: "Simulate polls and A/B tests with real-time confidence intervals"
  },
  // Bonus modules for building intuition
  {
    id: 'ci-hypothesis-bridge',
    title: 'CI-Hypothesis Testing Connection',
    subtitle: 'See the relationship',
    description: 'Explore how confidence intervals and hypothesis tests are connected. This interactive visualization shows why a 95% CI corresponds to a two-sided test at α=0.05.',
    icon: GitBranch,
    type: 'bonus',
    difficulty: 'Intuition',
    estimatedTime: '15 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Visualize the connection between confidence intervals and hypothesis tests',
      'Understand why 95% CI corresponds to α=0.05 significance level',
      'See how changing confidence levels affects test outcomes'
    ],
    route: '/chapter5/bonus/ci-hypothesis-bridge',
    color: '#f59e0b', // Amber
    badge: '🎯 Bonus'
  },
  {
    id: 'ci-interpretation',
    title: 'CI Interpretation',
    subtitle: 'What confidence really means',
    description: 'Build intuition for what confidence intervals actually mean. Work through common misconceptions with interactive examples.',
    icon: Brain,
    type: 'bonus',
    difficulty: 'Intuition',
    estimatedTime: '10 min',
    prerequisites: ['confidence-intervals-known'],
    learningGoals: [
      'Correctly interpret what "95% confidence" means',
      'Identify and avoid common CI misconceptions',
      'Build intuition through interactive simulations'
    ],
    route: '/chapter5/bonus/ci-interpretation',
    color: '#10b981', // Emerald
    badge: '🎯 Bonus'
  },
  {
    id: 'empirical-rule',
    title: 'Empirical Rule Interactive',
    subtitle: 'Why 68-95-99.7?',
    description: 'Understand where these percentages come from and how they connect to confidence intervals. Interactive visualization of the normal distribution.',
    icon: Activity,
    type: 'bonus',
    difficulty: 'Intuition',
    estimatedTime: '10 min',
    prerequisites: ['statistical-inference'],
    learningGoals: [
      'Understand the 68-95-99.7 rule visually',
      'Connect standard deviations to confidence levels',
      'Apply the empirical rule to real-world scenarios'
    ],
    route: '/chapter5/bonus/empirical-rule',
    color: '#3b82f6', // Blue
    badge: '🎯 Bonus'
  }
];

/**
 * EstimationHub - Main hub component for Chapter 5: Point and Interval Estimation
 * Provides navigation to all sections with progress tracking and interactive elements
 * @component
 * @returns {React.JSX.Element} Rendered estimation hub page
 */
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Chapter 5: Point and Interval Estimation
          </h1>
          <p className="text-xl text-gray-400">
            Master the art of statistical estimation and uncertainty quantification
          </p>
        </div>

        {/* Why This Matters Card */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Why Estimation Matters: Real-World Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="font-semibold text-purple-400 mb-2">Medical Research</h3>
              <p className="text-sm text-gray-300 mb-2">
                A COVID vaccine shows 95% effectiveness in trials. But what's the confidence interval? 
                Understanding this determines public health policy affecting millions.
              </p>
              <p className="text-xs text-gray-500 italic">
                Real case: Pfizer's vaccine had 95% efficacy with CI [90.3%, 97.6%]
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="font-semibold text-purple-400 mb-2">Quality Control</h3>
              <p className="text-sm text-gray-300 mb-2">
                A factory must ensure chip defect rates stay below 0.001%. How many chips must 
                they test to be confident? Too few risks recalls; too many wastes resources.
              </p>
              <p className="text-xs text-gray-500 italic">
                Industry standard: Sample sizes calculated for 99% confidence
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="font-semibold text-purple-400 mb-2">Business Decisions</h3>
              <p className="text-sm text-gray-300 mb-2">
                An A/B test shows version B converts 2% better. Is this real or just random 
                variation? Estimation techniques prevent costly mistakes.
              </p>
              <p className="text-xs text-gray-500 italic">
                Rule: Don't act unless CI excludes zero difference
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center italic">
            Master estimation, and you'll make better decisions with incomplete information – a superpower in any field.
          </p>
        </Card>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Text */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">The Fundamental Challenge: From the Few to the Many</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Imagine you're a pharmaceutical company testing a new medication. You can't test it on all 8 billion people 
              on Earth – that would be impossible, unethical, and prohibitively expensive. Instead, you test it on perhaps 
              1,000 carefully selected volunteers. But here's the critical question: <span className="text-emerald-400 font-semibold">
              How do you use data from those 1,000 people to make confident statements about how the drug will work for everyone?</span>
            </p>
            <p>
              This is the essence of <span className="text-white font-semibold">statistical estimation</span>. We use samples (the few) 
              to estimate population parameters (the many). But unlike a simple guess, statistical estimation gives us two crucial things:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <span className="text-emerald-400 font-semibold">Point estimates</span>: Our best single guess based on the data 
                (like "the average effectiveness is 85%")
              </li>
              <li>
                <span className="text-emerald-400 font-semibold">Interval estimates</span>: A range of plausible values with a 
                specified confidence level (like "we're 95% confident the true effectiveness is between 82% and 88%")
              </li>
            </ul>
            <p className="mt-4">
              In this chapter, you'll master both types of estimation. You'll learn when to use each method, how to calculate 
              them correctly, and most importantly, <span className="text-emerald-400 font-semibold">how to interpret them properly</span> – 
              a skill that even many professionals struggle with.
            </p>
          </div>
        </Card>

        {/* Learning Journey Roadmap */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Your Learning Journey</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Foundation: Understanding Inference</p>
                <p className="text-sm text-gray-400">Learn the core concepts of estimation and how samples relate to populations</p>
              </div>
            </div>
            <div className="flex items-center ml-6">
              <ArrowRight className="text-gray-600 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Known Variance: The Ideal Case</p>
                <p className="text-sm text-gray-400">Master confidence intervals when population standard deviation is known</p>
              </div>
            </div>
            <div className="flex items-center ml-6">
              <ArrowRight className="text-gray-600 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Sample Size: Planning Studies</p>
                <p className="text-sm text-gray-400">Calculate how many observations you need before collecting data</p>
              </div>
            </div>
            <div className="flex items-center ml-6">
              <ArrowRight className="text-gray-600 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold">4</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Unknown Variance: The Real World</p>
                <p className="text-sm text-gray-400">Handle uncertainty when you must estimate both mean and variance</p>
              </div>
            </div>
            <div className="flex items-center ml-6">
              <ArrowRight className="text-gray-600 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">5</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Proportions: Beyond Means</p>
                <p className="text-sm text-gray-400">Extend your skills to percentages, rates, and categorical data</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-6 text-center italic">
            Each section builds on the previous. Master them in order for the smoothest learning experience.
          </p>
        </Card>

        {/* Prerequisites Review Card */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Before We Begin: Key Prerequisites</h2>
          <div className="space-y-4 text-gray-300">
            <p className="text-sm text-blue-400 mb-3">
              Estimation builds on concepts from Chapter 4. Let's quickly review the essentials:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h3 className="font-semibold text-white mb-2">Sampling Distribution</h3>
                <p className="text-sm text-gray-400 mb-2">
                  The distribution of a statistic (like x̄) across all possible samples of size n
                </p>
                <p className="text-xs text-gray-500">
                  Key insight: Even if individual data varies wildly, sample means cluster predictably around the population mean
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h3 className="font-semibold text-white mb-2">Central Limit Theorem (CLT)</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Sample means approach a normal distribution as n increases, regardless of the population shape
                </p>
                <p className="text-xs text-gray-500">
                  Why it matters: This allows us to use normal-based methods for estimation in most real-world scenarios
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h3 className="font-semibold text-white mb-2">Standard Error (SE)</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Measures how much sample statistics vary from sample to sample: SE = σ/√n
                </p>
                <p className="text-xs text-gray-500">
                  Critical concept: Smaller SE means more precise estimates. SE decreases as sample size increases
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h3 className="font-semibold text-white mb-2">Population vs. Sample Notation</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Population: μ (mean), σ (std dev) | Sample: x̄ (mean), s (std dev)
                </p>
                <p className="text-xs text-gray-500">
                  Remember: We use sample statistics (known) to estimate population parameters (unknown)
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 italic">
              💡 Not familiar with these concepts? Review Chapter 4 first, especially the sections on sampling distributions and the CLT.
            </p>
          </div>
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