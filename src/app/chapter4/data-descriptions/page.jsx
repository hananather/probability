"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Dynamic imports for all components - rename to match Chapter 1 convention
const FoundationsTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyIntro'),
  { ssr: false }
);

const WorkedExamplesTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-2-DescriptiveStatsJourney'),
  { ssr: false }
);

const QuickReferenceTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-3-DescriptiveStatisticsFoundations'),
  { ssr: false }
);

const InteractiveTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-4-MathematicalFoundations'),
  { ssr: false }
);

export default function DataDescriptionsPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Getting started with central tendency concepts'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Hands-on exploration of mean, median, mode'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'Deep dive into statistical concepts'
    },
    { 
      id: 'interactive', 
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b',
      description: 'Advanced mathematical understanding'
    }
  ];
  
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Central Tendency & Data Descriptions"
        subtitle="Explore measures of central tendency: mean, median, and mode"
        chapter={4}
        tabs={TABS}
        storageKey="chapter4-central-tendency-progress"
        colorScheme="purple"
      />
    </>
  );
}