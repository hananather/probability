"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap } from 'lucide-react';
import { Chapter1ReferenceSheet } from '@/components/reference-sheets/Chapter1ReferenceSheet';

// Dynamic imports for tab components
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/03-sample-spaces-events/Tab1FoundationsTab'),
  { ssr: false }
);

const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/03-sample-spaces-events/Tab2WorkedExamplesTab'),
  { ssr: false }
);

const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/03-sample-spaces-events/Tab3QuickReferenceTab'),
  { ssr: false }
);

// Tab configuration following the standard structure
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

export default function SampleSpacesEventsPage() {
  return (
    <>
      <Chapter1ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Sample Spaces and Events"
        subtitle="Master the foundation of probability theory"
        chapter={1}
        tabs={TABS}
        storageKey="chapter1-sample-spaces-events-progress"
        colorScheme="purple"
      />
    </>
  );
}