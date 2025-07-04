"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Activity } from 'lucide-react';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-7-2-bayes-theorem-visualizer/Tab1FoundationsTab'), 
  { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-7-2-bayes-theorem-visualizer/Tab2WorkedExamplesTab'), 
  { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-7-2-bayes-theorem-visualizer/Tab3QuickReferenceTab'), 
  { ssr: false }
);

// Import original component from its ORIGINAL location (unchanged)
const BayesTheoremVisualizer = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-7-2-BayesTheoremVisualizer'), 
  { ssr: false }
);

export default function BayesTheoremVisualizerPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Core concepts and intuition behind Bayes\' Theorem'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Step-by-step solutions to exam-style problems'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'Formulas, decision guides, and speed practice'
    },
    { 
      id: 'interactive-visualizer', 
      label: 'Interactive Visualizer', 
      icon: Activity,
      component: BayesTheoremVisualizer, 
      color: '#ec4899',
      description: 'Explore Bayes\' Theorem with interactive scenarios'
    }
  ];
  
  return (
    <TabbedLearningPage
      title="Bayes' Theorem"
      subtitle="Master the art of updating beliefs with evidence - a cornerstone of machine learning and AI"
      chapter={1}
      tabs={TABS}
      storageKey="chapter1-bayes-theorem-visualizer-progress"
      colorScheme="purple"
    />
  );
}