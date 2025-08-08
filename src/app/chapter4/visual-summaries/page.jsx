"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Dynamic imports for histogram components - using standard naming convention
const FoundationsTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-1-HistogramIntuitiveIntro'),
  { ssr: false }
);

const WorkedExamplesTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-2-HistogramInteractiveJourney'),
  { ssr: false }
);

const QuickReferenceTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-3-HistogramShapeAnalysis'),
  { ssr: false }
);

// Combine the boxplot components into an interactive tab
const InteractiveTab = dynamic(() => 
  Promise.resolve({
    default: () => {
      const BoxplotQuartilesExplorer = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-4-BoxplotQuartilesExplorer'),
        { ssr: false }
      );
      const BoxplotQuartilesJourney = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-5-BoxplotQuartilesJourney'),
        { ssr: false }
      );
      const BoxplotRealWorldExplorer = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-6-BoxplotRealWorldExplorer'),
        { ssr: false }
      );
      
      const React = require('react');
      
      const [selectedView, setSelectedView] = React.useState('explorer');
      
      return (
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'explorer' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              onClick={() => setSelectedView('explorer')}
            >
              Quartiles Explorer
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'journey' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              onClick={() => setSelectedView('journey')}
            >
              Interactive Journey
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'realworld' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              onClick={() => setSelectedView('realworld')}
            >
              Real World Examples
            </button>
          </div>
          
          <div>
            {selectedView === 'explorer' && <BoxplotQuartilesExplorer />}
            {selectedView === 'journey' && <BoxplotQuartilesJourney />}
            {selectedView === 'realworld' && <BoxplotRealWorldExplorer />}
          </div>
        </div>
      );
    }
  }),
  { ssr: false }
);

export default function VisualSummariesPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Getting started with histogram fundamentals'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Hands-on histogram exploration and creation'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'Understanding distribution shapes and patterns'
    },
    { 
      id: 'interactive', 
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b',
      description: 'Boxplots and quartiles interactive exploration'
    }
  ];
  
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Visual Summaries: Histograms & Boxplots"
        subtitle="Master data visualization with histograms and boxplots"
        chapter={4}
        tabs={TABS}
        storageKey="chapter4-visual-summaries-progress"
        colorScheme="green"
      />
    </>
  );
}