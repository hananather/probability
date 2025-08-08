"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap } from 'lucide-react';
import { Chapter1ReferenceSheet } from '@/components/reference-sheets/Chapter1ReferenceSheet';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/06-unordered-samples/Tab1FoundationsTab'), 
  { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/06-unordered-samples/Tab2WorkedExamplesTab'), 
  { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/06-unordered-samples/Tab3QuickReferenceTab'), 
  { ssr: false }
);

// Removed the non-existent UnorderedSamples component import

export default function UnorderedSamplesPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Motivation, intuition, and formal definitions'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Step-by-step solutions to exam problems'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'Everything you need for the exam'
    }
  ];
  
  return (
    <>
      <Chapter1ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Unordered Samples (Combinations)"
        subtitle="Master the art of counting when order doesn't matter"
        chapter={1}
        tabs={TABS}
        storageKey="chapter1-unordered-samples-progress"
        colorScheme="purple"
      />
    </>
  );
}