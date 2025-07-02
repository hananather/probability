"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { createColorScheme } from "@/lib/design-system";
import { 
  Lightbulb, AlertCircle, TrendingUp, Calculator, 
  Scale, Target, Users, Percent, FlaskConical,
  PlayCircle, RefreshCw, ArrowRight
} from 'lucide-react';

// Get consistent color scheme for hypothesis testing
const colors = createColorScheme('hypothesis');

// Coin Flip Interactive Component
const CoinFlipOpening = ({ onComplete }) => {
  const [flipCount, setFlipCount] = useState(0);
  const [results, setResults] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro, flipping, question

  const flipCoin = () => {
    if (isFlipping || flipCount >= 10) return;
    
    setIsFlipping(true);
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    setTimeout(() => {
      setResults(prev => [...prev, result]);
      setFlipCount(prev => prev + 1);
      setIsFlipping(false);
      
      if (flipCount + 1 >= 4 && phase === 'flipping') {
        setPhase('question');
        setTimeout(() => setShowQuestion(true), 500);
      }
    }, 600);
  };

  const startFlipping = () => {
    setPhase('flipping');
  };

  const headsCount = results.filter(r => r === 'heads').length;
  const tailsCount = results.filter(r => r === 'tails').length;

  return (
    <div className="relative w-full mb-8 p-6 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 rounded-xl" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">The Coin Dilemma</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Person A claims they have a fair coin, but Person B is suspicious, 
                believing it's biased toward tails. How can we use data to determine 
                who's right?
              </p>
              <Button
                onClick={startFlipping}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Try It Yourself
              </Button>
            </motion.div>
          )}

          {(phase === 'flipping' || phase === 'question') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Flip the Coin to Gather Evidence
                </h3>
                <p className="text-gray-400">
                  Flips: {flipCount}/10 | Heads: {headsCount} | Tails: {tailsCount}
                </p>
              </div>

              {/* Coin Animation */}
              <div className="flex justify-center">
                <motion.div
                  className="relative w-32 h-32 cursor-pointer"
                  onClick={flipCoin}
                  whileHover={{ scale: !isFlipping && flipCount < 10 ? 1.05 : 1 }}
                  animate={isFlipping ? { rotateY: [0, 180, 360] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`absolute inset-0 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl
                    ${results[results.length - 1] === 'heads' 
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white' 
                      : 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                    }`}
                  >
                    {results.length === 0 ? '?' : results[results.length - 1] === 'heads' ? 'H' : 'T'}
                  </div>
                  {!isFlipping && flipCount < 10 && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Results Display */}
              <div className="flex justify-center gap-2">
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${result === 'heads' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                        : 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                      }`}
                  >
                    {result === 'heads' ? 'H' : 'T'}
                  </motion.div>
                ))}
              </div>

              {/* Question Reveal */}
              <AnimatePresence>
                {showQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                  >
                    <p className="text-center text-white mb-3">
                      You got {headsCount} heads out of {flipCount} flips. 
                      Is this evidence of bias? How can we decide scientifically?
                    </p>
                    <Button
                      onClick={onComplete}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Discover How <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Null Hypothesis", definition: "The claim we're testing", latex: "H_0" },
    { term: "Alternative Hypothesis", definition: "What we suspect is true", latex: "H_1" },
    { term: "p-value", definition: "Probability of seeing our data if H_0 is true", latex: "p" },
    { term: "Significance Level", definition: "Our threshold for 'rare enough'", latex: "\\alpha" },
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
              <div className="text-2xl font-mono text-cyan-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Chapter 6 specific configuration with navigation
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
    route: '/chapter6/hypothesis-fundamentals',
    color: '#10b981',
    question: "How do we turn suspicions into testable claims?",
    preview: "Interactive p-value visualization"
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
    route: '/chapter6/types-of-hypotheses',
    color: '#10b981',
    question: "Does it matter if we're looking for any change vs. a specific direction?",
    preview: "One-tailed vs. two-tailed test comparison"
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
      'Apply to real scenarios'
    ],
    route: '/chapter6/test-mean-known-variance',
    color: '#3b82f6',
    question: "Is the manufacturing process producing the claimed quality?",
    preview: "Z-test calculator with critical regions"
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
    route: '/chapter6/test-mean-unknown-variance',
    color: '#3b82f6',
    question: "What if we don't know the population's variability?",
    preview: "t-distribution emergence animation"
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
    route: '/chapter6/test-for-proportion',
    color: '#3b82f6',
    question: "Has the politician's approval rating really changed?",
    preview: "Proportion sampling distribution"
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
    route: '/chapter6/paired-two-sample',
    color: '#8b5cf6',
    question: "Did the training course actually improve performance?",
    preview: "Before/after difference visualization"
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
    route: '/chapter6/unpaired-two-sample',
    color: '#8b5cf6',
    question: "Which teaching method produces better results?",
    preview: "Two independent distributions comparison"
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
    route: '/chapter6/difference-two-proportions',
    color: '#8b5cf6',
    question: "Is the marketing campaign more effective in one city?",
    preview: "Proportion difference distribution"
  }
];

export default function HypothesisTestingHub() {
  const [showMainContent, setShowMainContent] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen the intro before
    const seen = localStorage.getItem('hypothesisTestingIntroSeen');
    if (seen) {
      setShowMainContent(true);
      setHasSeenIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowMainContent(true);
    localStorage.setItem('hypothesisTestingIntroSeen', 'true');
  };

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
            Learn to make data-driven decisions and test statistical claims with confidence
          </p>
        </motion.div>

        {/* Interactive Opening (only show if not seen before) */}
        {!hasSeenIntro && !showMainContent && (
          <CoinFlipOpening onComplete={handleIntroComplete} />
        )}

        {/* Main Content */}
        {showMainContent && (
          <>
            {/* Key Concepts Card */}
            <KeyConceptsCard />

            {/* Introduction Text */}
            <Card className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50">
              <h2 className="text-2xl font-bold text-white mb-3">What is Hypothesis Testing?</h2>
              <p className="text-gray-300">
                Hypothesis testing is a systematic method for evaluating claims using data. 
                Instead of relying on gut feelings, we use probability to determine when 
                evidence is strong enough to challenge a claim. Through this chapter, you'll 
                master the tools to make statistically sound decisions in any field.
              </p>
            </Card>

            {/* Chapter Hub with Sections */}
            <ChapterHub
              chapterNumber={6}
              chapterTitle="Hypothesis Testing"
              chapterSubtitle="Master the art of statistical decision-making"
              sections={CHAPTER_6_SECTIONS}
              storageKey="hypothesisTestingProgress"
              progressVariant="purple"
              onSectionClick={handleSectionClick}
              hideHeader={true}
            />

            {/* Replay Intro Button */}
            {hasSeenIntro && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => {
                    setHasSeenIntro(false);
                    setShowMainContent(false);
                    localStorage.removeItem('hypothesisTestingIntroSeen');
                  }}
                  variant="outline"
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Replay Introduction
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}