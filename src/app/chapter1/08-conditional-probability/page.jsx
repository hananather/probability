"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, GitBranch } from 'lucide-react';

// Import new tabs from new folder
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/08-conditional-probability/Tab1FoundationsTab'), 
  { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/08-conditional-probability/Tab2WorkedExamplesTab'), 
  { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/08-conditional-probability/Tab3QuickReferenceTab'), 
  { ssr: false }
);

// Import original component from its ORIGINAL location (unchanged)
const ConditionalProbability = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/08-conditional-probability'), 
  { ssr: false }
);

export default function ConditionalProbabilityPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      description: 'Motivation, intuition, and formal definitions',
      component: FoundationsTab, 
      color: '#10b981' // Green
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      description: 'Step-by-step solutions to exam problems',
      component: WorkedExamplesTab, 
      color: '#3b82f6' // Blue
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      description: 'Everything you need for the exam',
      component: QuickReferenceTab, 
      color: '#7c3aed' // Violet
    },
    { 
      id: 'interactive', 
      label: 'Interactive Visualization', 
      icon: GitBranch,
      description: 'Explore conditional probability with interactive demos',
      component: ConditionalProbability, 
      color: '#60a5fa' // Light blue (original component color)
    }
  ];
  
  return (
    <TabbedLearningPage
      title="Conditional Probability and Independence"
      subtitle="Master the foundation of probabilistic reasoning and Bayes' theorem"
      chapter={1}
      tabs={TABS}
      storageKey="chapter1-conditional-probability-progress"
      colorScheme="purple"
    />
  );
}