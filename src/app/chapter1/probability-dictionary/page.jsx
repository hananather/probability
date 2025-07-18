"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Languages } from 'lucide-react';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-1-3-probability-dictionary/Tab1FoundationsTab'), { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-1-3-probability-dictionary/Tab2WorkedExamplesTab'), { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-1-3-probability-dictionary/Tab3QuickReferenceTab'), { ssr: false }
);

// Interactive tab
const InteractiveTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/1-1-3-probability-dictionary/Tab4InteractiveTab'), { ssr: false }
);

export default function ProbabilityDictionaryPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981' 
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6' 
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed' 
    },
    { 
      id: 'interactive', 
      label: 'Interactive Translation Hub', 
      icon: Languages,
      component: InteractiveTab, 
      color: '#f59e0b' 
    }
  ];
  
  return (
    <TabbedLearningPage
      title="English-to-Math Translation Hub"
      subtitle="Master the translation between natural language and mathematical notation"
      chapter={1}
      tabs={TABS}
      storageKey="chapter1-probability-dictionary-progress"
      colorScheme="blue"
    />
  );
}