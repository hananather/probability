"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  CircleDot, Calculator, Grid3x3, Shuffle, 
  Dices, GitBranch, BrainCircuit, AlertTriangle, DoorOpen
} from 'lucide-react';

// Get consistent color scheme for probability/introduction
const colors = createColorScheme('probability');

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Sample Space", definition: "All possible outcomes", latex: "S = \\{\\omega_1, \\omega_2, ..., \\omega_n\\}" },
    { term: "Probability", definition: "Likelihood of an event", latex: "P(A) = \\frac{|A|}{|S|}" },
    { term: "Conditional", definition: "Given that B occurred", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}" },
    { term: "Bayes' Theorem", definition: "Update beliefs with evidence", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}" },
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

// All Chapter 1 sections
const CHAPTER_1_SECTIONS = [
  {
    id: 'sample-spaces-events',
    title: '1.1 Sample Spaces and Events',
    subtitle: 'Sets and probability foundations',
    description: 'Master the fundamentals of sample spaces, events, and set operations. Learn to use Venn diagrams to visualize probability concepts.',
    icon: CircleDot,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Define sample spaces and events',
      'Perform set operations (union, intersection, complement)',
      'Create and interpret Venn diagrams',
      'Apply De Morgan\'s laws'
    ],
    route: '/chapter1/sample-spaces-events',
    color: '#10b981',
    question: "What are all the possible outcomes of an experiment?",
    preview: "Interactive Venn diagram explorer"
  },
  {
    id: 'counting-techniques',
    title: '1.2 Counting Techniques',
    subtitle: 'Fundamental counting principle',
    description: 'Learn systematic counting methods for multi-stage procedures. Master the multiplication principle for complex scenarios.',
    icon: Calculator,
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: [],
    learningGoals: [
      'Apply the fundamental counting principle',
      'Solve multi-stage counting problems',
      'Use tree diagrams for visualization',
      'Distinguish when to add vs multiply'
    ],
    route: '/chapter1/counting-techniques',
    color: '#10b981',
    question: "How many ways can something happen?",
    preview: "Tree diagram builder"
  },
  {
    id: 'ordered-samples',
    title: '1.3 Ordered Samples',
    subtitle: 'Permutations and arrangements',
    description: 'Understand when order matters. Calculate permutations with and without replacement using factorial notation.',
    icon: Grid3x3,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: ['counting-techniques'],
    learningGoals: [
      'Calculate permutations using nPr formula',
      'Distinguish between with and without replacement',
      'Apply factorial notation correctly',
      'Solve real-world ordering problems'
    ],
    route: '/chapter1/ordered-samples',
    color: '#10b981',
    question: "In how many ways can we arrange items?",
    preview: "Permutation visualizer"
  },
  {
    id: 'unordered-samples',
    title: '1.4 Unordered Samples',
    subtitle: 'Combinations and selections',
    description: 'Master combinations when order doesn\'t matter. Calculate binomial coefficients and explore Pascal\'s triangle.',
    icon: Shuffle,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['ordered-samples'],
    learningGoals: [
      'Calculate combinations using nCr formula',
      'Understand binomial coefficients',
      'Apply Pascal\'s triangle properties',
      'Distinguish permutations from combinations'
    ],
    route: '/chapter1/unordered-samples',
    color: '#3b82f6',
    question: "How many ways can we choose without order?",
    preview: "Combination calculator with Pascal's triangle"
  },
  {
    id: 'probability-event',
    title: '1.5 Probability of an Event',
    subtitle: 'Classical probability definition',
    description: 'Apply the classical definition of probability. Master the addition rule and calculate probabilities from counting.',
    icon: Dices,
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    prerequisites: ['sample-spaces-events', 'counting-techniques'],
    learningGoals: [
      'Apply P(A) = |A|/|S| formula',
      'Use the addition rule for probability',
      'Calculate complement probabilities',
      'Verify probability axioms'
    ],
    route: '/chapter1/probability-event',
    color: '#3b82f6',
    question: "What's the chance of an event occurring?",
    preview: "Probability calculator with visual representations"
  },
  {
    id: 'conditional-probability',
    title: '1.6 Conditional Probability',
    subtitle: 'Probability given information',
    description: 'Master conditional probability and independence. Apply the multiplication rule and Law of Total Probability.',
    icon: GitBranch,
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    prerequisites: ['probability-event'],
    learningGoals: [
      'Calculate P(A|B) using the formula',
      'Test for independence of events',
      'Apply multiplication rule',
      'Use probability trees effectively'
    ],
    route: '/chapter1/conditional-probability',
    color: '#3b82f6',
    question: "How does new information change probabilities?",
    preview: "Interactive conditional probability visualizer"
  },
  {
    id: 'bayes-theorem',
    title: '1.7 Bayes\' Theorem',
    subtitle: 'Updating beliefs with evidence',
    description: 'Learn to update probabilities with new evidence. Apply Bayes\' theorem to real-world problems like medical testing.',
    icon: BrainCircuit,
    difficulty: 'Advanced',
    estimatedTime: '35 min',
    prerequisites: ['conditional-probability'],
    learningGoals: [
      'Derive and apply Bayes\' theorem',
      'Distinguish prior and posterior probabilities',
      'Solve diagnostic test problems',
      'Update beliefs sequentially'
    ],
    route: '/chapter1/bayes-theorem',
    color: '#8b5cf6',
    question: "How do we update our beliefs with evidence?",
    preview: "Bayes' theorem calculator and visualizer"
  },
  {
    id: 'probabilistic-fallacies',
    title: '1.8 Probabilistic Fallacies',
    subtitle: 'Common probability mistakes',
    description: 'Identify and avoid common probability errors. Understand the gambler\'s fallacy, base rate neglect, and more.',
    icon: AlertTriangle,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['conditional-probability', 'bayes-theorem'],
    learningGoals: [
      'Recognize common probability fallacies',
      'Understand base rate neglect',
      'Avoid the gambler\'s fallacy',
      'Apply correct probabilistic reasoning'
    ],
    route: '/chapter1/probabilistic-fallacies',
    color: '#8b5cf6',
    question: "What probability mistakes should we avoid?",
    preview: "Interactive fallacy demonstrations"
  },
  {
    id: 'monty-hall-masterclass',
    title: '1.9 Monty Hall Masterclass',
    subtitle: 'The famous probability paradox',
    description: 'Explore the counterintuitive Monty Hall problem through interactive simulations. See why switching doors doubles your chances of winning!',
    icon: DoorOpen,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['conditional-probability', 'bayes-theorem'],
    learningGoals: [
      'Understand the Monty Hall problem',
      'Apply Bayes\' theorem to the solution',
      'Run simulations to verify results',
      'Grasp why intuition fails here'
    ],
    route: '/chapter1/monty-hall-masterclass',
    color: '#8b5cf6',
    question: "Should you switch doors to double your chances?",
    preview: "Interactive Monty Hall game and simulator"
  }
];

export default function IntroductionToProbabilitiesHub() {
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
            Chapter 1: Introduction to Probabilities
          </h1>
          <p className="text-xl text-gray-400">
            Build a solid foundation in probability theory and counting
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Introduction Card */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">What is Probability?</h2>
          <p className="text-gray-300">
            Probability is the mathematics of uncertainty. From weather forecasts to medical diagnoses, 
            probability helps us make informed decisions in an uncertain world. Start your journey by 
            understanding the fundamental concepts that underpin all of probability theory.
          </p>
        </Card>

        {/* Chapter Hub with Sections */}
        <ChapterHub
          chapterNumber={1}
          chapterTitle="Introduction to Probabilities"
          chapterSubtitle="Master the fundamentals of probability theory"
          sections={CHAPTER_1_SECTIONS}
          storageKey="chapter1Progress"
          progressVariant="blue"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}