"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';

// Import new tabs from new folder (with tab numbers for clarity)
const FoundationsTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/01-foundations/Tab1FoundationsTab'), { ssr: false }
);
const WorkedExamplesTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/01-foundations/Tab2WorkedExamplesTab'), { ssr: false }
);
const QuickReferenceTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/01-foundations/Tab3QuickReferenceTab'), { ssr: false }
);

// Interactive tab
const InteractiveTab = dynamic(() => 
  import('@/components/01-introduction-to-probabilities/01-foundations/Tab4InteractiveTab'), { ssr: false }
);

export default function FoundationsPage() {
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
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b' 
    }
  ];
  
  return (
    <TabbedLearningPage
      title="Foundations of Probability"
      subtitle="Build intuitive understanding of probability through physical models"
      chapter={1}
      tabs={TABS}
      storageKey="chapter1-foundations-progress"
      colorScheme="teal"
    />
  );
}