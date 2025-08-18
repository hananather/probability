"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { useMathJax } from "../../hooks/useMathJax";
import { Chapter1ReferenceSheet } from "../reference-sheets/Chapter1ReferenceSheet";
import { 
  CircleDot, Calculator, Grid3x3, Shuffle, 
  Dices, GitBranch, BrainCircuit, AlertTriangle, DoorOpen, Sparkles
} from 'lucide-react';

// Get consistent color scheme for probability/introduction
const colors = createColorScheme('probability');

/**
 * Key Concepts Card component for displaying fundamental probability concepts with LaTeX formulas
 * @component
 * @returns {React.JSX.Element} Rendered key concepts card
 */
const KeyConceptsCard = React.memo(() => {
  const concepts = [
    { term: "Sample Space", definition: "All possible outcomes", latex: `S = \\{\\omega_1, \\omega_2, ..., \\omega_n\\}` },
    { term: "Probability", definition: "Likelihood of an event", latex: `P(A) = \\frac{|A|}{|S|}` },
    { term: "Conditional", definition: "Given that B occurred", latex: `P(A|B) = \\frac{P(A \\cap B)}{P(B)}` },
    { term: "Bayes' Theorem", definition: "Update beliefs with evidence", latex: `P(A|B) = \\frac{P(B|A)P(A)}{P(B)}` },
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

KeyConceptsCard.displayName = 'KeyConceptsCard';

// All Chapter 1 sections
const CHAPTER_1_SECTIONS = [
  {
    id: 'formula-builder',
    title: 'Interactive Formula Builder',
    subtitle: 'Build formulas step-by-step',
    description: 'Master the fundamental formulas of probability by building them interactively. Click on each part to understand why it\'s there and how it works.',
    icon: Sparkles,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: [],
    learningGoals: [
      'Build basic probability formula interactively',
      'Understand each component of Bayes\' Theorem',
      'Connect formula parts to real-world meanings',
      'Master formula structure through interaction'
    ],
    route: '/chapter1/formula-builder',
    color: '#ec4899',
    question: "How do probability formulas really work?",
    preview: "Interactive formula builder with step-by-step explanations",
    isNew: true
  },
  {
    id: 'foundations',
    title: '1.1 Foundations',
    subtitle: 'Physical intuition for probability',
    description: 'Build intuitive understanding of probability through physical models. Learn the physical foundations before the mathematical notation.',
    icon: CircleDot,
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    prerequisites: [],
    learningGoals: [
      'Understand probability as physical intuition',
      'Distinguish equal vs unequal mass scenarios',
      'Connect pebble picking to mathematical concepts',
      'Build foundation for set notation'
    ],
    route: '/chapter1/01-foundations',
    color: '#10b981',
    question: "What happens when we randomly pick pebbles from a bag?",
    preview: "Interactive simulation with card deck examples"
  },
  {
    id: 'probability-dictionary',
    title: '1.2 English-to-Math Translation',
    subtitle: 'The probability language bridge',
    description: 'Master the translation between everyday English and mathematical notation. Your essential reference for converting word problems to math.',
    icon: Calculator,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: ['foundations'],
    learningGoals: [
      'Translate English phrases to set notation',
      'Use the complete translation dictionary',
      'Avoid common translation mistakes',
      'Practice with interactive challenges'
    ],
    route: '/chapter1/02-probability-dictionary',
    color: '#3b82f6',
    question: "How do we translate between English and mathematical notation?",
    preview: "Interactive translation practice with complete reference dictionary"
  },
  {
    id: 'sample-spaces-events',
    title: '1.3 Sample Spaces & Set Operations',
    subtitle: 'Events, sets, and the grammar of probability',
    description: 'Master sample spaces, events, and set operations in one unified approach. Learn Venn diagrams, De Morgan\'s laws, and how to build complex events.',
    icon: Grid3x3,
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    prerequisites: ['foundations', 'probability-dictionary'],
    learningGoals: [
      'Define sample spaces and events clearly',
      'Master union, intersection, complement, and difference',
      'Apply De Morgan\'s laws to solve problems',
      'Use Venn diagrams for visualization',
      'Build complex events from simple operations'
    ],
    route: '/chapter1/03-sample-spaces-events',
    color: '#8b5cf6',
    question: "How do we describe and combine probability events?",
    preview: "Interactive Venn diagrams with De Morgan's laws and real examples"
  },
  {
    id: 'counting-techniques',
    title: '1.4 Counting Techniques',
    subtitle: 'Fundamental counting principle',
    description: 'Learn systematic counting methods for multi-stage procedures. Master the multiplication principle for complex scenarios.',
    icon: Calculator,
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    prerequisites: ['sample-spaces-events'],
    learningGoals: [
      'Apply the fundamental counting principle',
      'Solve multi-stage counting problems',
      'Use tree diagrams for visualization',
      'Distinguish when to add vs multiply'
    ],
    route: '/chapter1/04-counting-techniques',
    color: '#10b981',
    question: "How many ways can something happen?",
    preview: "Tree diagram builder"
  },
  {
    id: 'ordered-samples',
    title: '1.5 Ordered Samples',
    subtitle: 'Permutations and arrangements',
    description: 'Understand when order matters. Calculate permutations with and without replacement using factorial notation.',
    icon: Shuffle,
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    prerequisites: ['counting-techniques'],
    learningGoals: [
      'Calculate permutations using nPr formula',
      'Distinguish between with and without replacement',
      'Apply factorial notation correctly',
      'Solve real-world ordering problems'
    ],
    route: '/chapter1/05-ordered-samples',
    color: '#10b981',
    question: "In how many ways can we arrange items?",
    preview: "Permutation visualizer"
  },
  {
    id: 'unordered-samples',
    title: '1.6 Unordered Samples',
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
    route: '/chapter1/06-unordered-samples',
    color: '#3b82f6',
    question: "How many ways can we choose without order?",
    preview: "Combination calculator with Pascal's triangle"
  },
  {
    id: 'probability-event',
    title: '1.7 Probability of an Event',
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
    route: '/chapter1/07-probability-event',
    color: '#3b82f6',
    question: "What's the chance of an event occurring?",
    preview: "Probability calculator with visual representations"
  },
  {
    id: 'conditional-probability',
    title: '1.8 Conditional Probability',
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
    route: '/chapter1/08-conditional-probability',
    color: '#3b82f6',
    question: "How does new information change probabilities?",
    preview: "Interactive conditional probability visualizer"
  },
  {
    id: 'bayes-theorem-visualizer',
    title: '1.9 Bayes\' Theorem',
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
    route: '/chapter1/09-bayes-theorem-visualizer',
    color: '#8b5cf6',
    question: "How do we update our beliefs with evidence?",
    preview: "Bayes' theorem calculator and visualizer"
  },
  {
    id: 'probabilistic-fallacies',
    title: '1.10 Probabilistic Fallacies',
    subtitle: 'Common probability mistakes',
    description: 'Identify and avoid common probability errors. Understand the gambler\'s fallacy, base rate neglect, and more.',
    icon: AlertTriangle,
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    prerequisites: ['conditional-probability', 'bayes-theorem-visualizer'],
    learningGoals: [
      'Recognize common probability fallacies',
      'Understand base rate neglect',
      'Avoid the gambler\'s fallacy',
      'Apply correct probabilistic reasoning'
    ],
    route: '/chapter1/10-probabilistic-fallacies',
    color: '#8b5cf6',
    question: "What probability mistakes should we avoid?",
    preview: "Interactive fallacy demonstrations"
  },
  {
    id: 'monty-hall-masterclass',
    title: '1.11 Monty Hall Complete Analysis',
    subtitle: 'The famous probability paradox',
    description: 'Explore the counterintuitive Monty Hall problem through interactive simulations. See why switching doors doubles your chances of winning!',
    icon: DoorOpen,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['conditional-probability', 'bayes-theorem-visualizer'],
    learningGoals: [
      'Understand the Monty Hall problem',
      'Apply Bayes\' theorem to the solution',
      'Run simulations to verify results',
      'Grasp why intuition fails here'
    ],
    route: '/chapter1/11-monty-hall-masterclass',
    color: '#8b5cf6',
    question: "Should you switch doors to double your chances?",
    preview: "Interactive Monty Hall game and simulator"
  }
];

/**
 * IntroductionToProbabilitiesHub - Main hub component for Chapter 1: Introduction to Probabilities
 * Provides navigation to all sections with progress tracking and interactive elements
 * @component
 * @returns {React.JSX.Element} Rendered introduction to probabilities hub page
 */
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

        {/* Floating Reference Sheet */}
        <Chapter1ReferenceSheet mode="floating" />
      </div>
    </div>
  );
}