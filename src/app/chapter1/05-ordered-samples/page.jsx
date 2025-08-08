"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import BackToHub from '@/components/ui/BackToHub';
import { BookOpen, Target, Zap } from 'lucide-react';
import { Chapter1ReferenceSheet } from '@/components/reference-sheets/Chapter1ReferenceSheet';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/05-ordered-samples/Tab1FoundationsTab'), 
  { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/05-ordered-samples/Tab2WorkedExamplesTab'), 
  { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/05-ordered-samples/Tab3QuickReferenceTab'), 
  { ssr: false }
);

export default function OrderedSamplesPage() {
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
    }
  ];
  
  return (
    <>
      <Chapter1ReferenceSheet mode="floating" />
      <BackToHub chapter={1} />
      <TabbedLearningPage
        title="Ordered Samples (Permutations)"
        subtitle="Master the art of counting when order matters"
        chapter={1}
        tabs={TABS}
        storageKey="chapter1-ordered-samples-progress"
        colorScheme="purple"
      />
    </>
  );
}