"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Dynamic imports for advanced sampling components
const FoundationsTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-1-FDistributionIntuitiveIntro'),
  { ssr: false }
);

// Dynamic imports for F-Distribution journey components
const FDistributionInteractiveJourney = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-2-FDistributionInteractiveJourney'),
  { ssr: false }
);
const FDistributionWorkedExample = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-2-FDistributionWorkedExample'),
  { ssr: false }
);

// Combine F-Distribution journey components
const WorkedExamplesTab = () => {
  const [view, setView] = React.useState('journey');
  
  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'journey' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          onClick={() => setView('journey')}
        >
          Interactive Journey
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'worked' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          onClick={() => setView('worked')}
        >
          Worked Examples
        </button>
      </div>
      
      <div>
        {view === 'journey' && <FDistributionInteractiveJourney />}
        {view === 'worked' && <FDistributionWorkedExample />}
      </div>
    </div>
  );
};

// Dynamic import for F-Distribution Explorer
const FDistributionExplorer = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-1-FDistributionExplorer'),
  { ssr: false }
);

// Quick Reference tab with t-Distribution and F-Distribution combined
const QuickReferenceTab = () => {
  const [distribution, setDistribution] = React.useState('t');
  
  return (
    <div className="space-y-6">
      <div className="bg-neutral-800/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Advanced Distributions Quick Reference</h3>
        
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              distribution === 't' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
            onClick={() => setDistribution('t')}
          >
            t-Distribution
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              distribution === 'f' 
                ? 'bg-purple-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
            onClick={() => setDistribution('f')}
          >
            F-Distribution
          </button>
        </div>
        
        {distribution === 't' ? (
          <>
            <div className="bg-neutral-900 rounded-lg p-6">
              <h4 className="font-semibold mb-4">t-Distribution Explorer</h4>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-neutral-400">t-Distribution Visualization</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    The t-distribution has heavier tails than the normal distribution, 
                    making it ideal for small sample sizes.
                  </p>
                </div>
                <div className="bg-neutral-800 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Formula:</strong>
                      <div className="font-mono mt-1">t = (x̄ - μ)/(s/√n)</div>
                    </div>
                    <div>
                      <strong>Degrees of Freedom:</strong>
                      <div className="font-mono mt-1">df = n - 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-400">t-Distribution Key Points</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Used when population variance is unknown</li>
                  <li>• Heavier tails than normal distribution</li>
                  <li>• Approaches normal as df increases</li>
                  <li>• Critical for small sample inference</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <FDistributionExplorer />
            <div className="mt-6 space-y-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-400">F-Distribution Key Points</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Ratio of two chi-squared distributions</li>
                  <li>• Always positive (F ≥ 0)</li>
                  <li>• Right-skewed distribution</li>
                  <li>• Used in ANOVA and variance tests</li>
                </ul>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-6 bg-neutral-700/30 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-orange-400">Common Applications</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>t-Distribution:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Confidence intervals</li>
                <li>• Hypothesis testing</li>
                <li>• Small sample inference</li>
              </ul>
            </div>
            <div>
              <strong>F-Distribution:</strong>
              <ul className="mt-1 space-y-1">
                <li>• ANOVA tests</li>
                <li>• Variance comparison</li>
                <li>• Model comparison</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic imports for Interactive mastery components
const FDistributionMasterclass = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-3-FDistributionMasterclass'),
  { ssr: false }
);
const FDistributionMastery = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-3-FDistributionMastery'),
  { ssr: false }
);
const FDistributionJourney = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-4-FDistributionJourney'),
  { ssr: false }
);

// Interactive mastery components
const InteractiveTab = () => {
  const [component, setComponent] = React.useState('masterclass');
  
  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            component === 'masterclass' 
              ? 'bg-orange-600 text-white' 
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          onClick={() => setComponent('masterclass')}
        >
          Masterclass
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            component === 'mastery' 
              ? 'bg-orange-600 text-white' 
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          onClick={() => setComponent('mastery')}
        >
          Test Mastery
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            component === 'journey' 
              ? 'bg-orange-600 text-white' 
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          onClick={() => setComponent('journey')}
        >
          Complete Journey
        </button>
      </div>
      
      <div>
        {component === 'masterclass' && <FDistributionMasterclass />}
        {component === 'mastery' && <FDistributionMastery />}
        {component === 'journey' && <FDistributionJourney />}
      </div>
    </div>
  );
};

export default function SamplingDistributionsReprisePage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Introduction to advanced distributions'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'F-Distribution journey and examples'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 't and F distributions reference'
    },
    { 
      id: 'interactive', 
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b',
      description: 'Advanced mastery challenges'
    }
  ];
  
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Advanced Sampling Distributions"
        subtitle="Master t-distribution and F-distribution for advanced statistical inference"
        chapter={4}
        tabs={TABS}
        storageKey="chapter4-advanced-sampling-progress"
        colorScheme="purple"
      />
    </>
  );
}