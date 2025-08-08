"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Dynamic imports for sampling distribution components
const FoundationsTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-1-SamplingDistributionsInteractive'),
  { ssr: false }
);

const WorkedExamplesTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-SamplingDistributionsTheory'),
  { ssr: false }
);

// Combine CLT components into Quick Reference
const QuickReferenceTab = dynamic(() => 
  Promise.resolve({
    default: () => {
      const CLTGateway = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-3-CLTGateway'),
        { ssr: false }
      );
      
      const React = require('react');
      
      return (
        <div className="space-y-6">
          <CLTGateway />
          
          <div className="bg-neutral-800/50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Quick Reference: Sampling Distributions</h3>
            
            <div className="space-y-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-400">Key Concepts</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Sampling distribution: Distribution of a sample statistic</li>
                  <li>• Standard error: Standard deviation of the sampling distribution</li>
                  <li>• Sample mean distribution: Centers around population mean</li>
                  <li>• Law of Large Numbers: Larger samples → more accurate estimates</li>
                </ul>
              </div>
              
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-400">Important Formulas</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div>Mean of X̄: μ_X̄ = μ</div>
                  <div>Standard Error: SE = σ/√n</div>
                  <div>For proportions: SE_p = √(p(1-p)/n)</div>
                  <div>Finite population: SE × √((N-n)/(N-1))</div>
                </div>
              </div>
              
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-purple-400">Central Limit Theorem</h4>
                <p className="text-sm mb-2">As n increases, the sampling distribution of X̄ approaches normal:</p>
                <div className="bg-neutral-900 p-2 rounded font-mono text-sm">
                  X̄ ~ N(μ, σ²/n) for large n
                </div>
                <p className="text-xs text-neutral-400 mt-2">Rule of thumb: n ≥ 30 for most distributions</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }),
  { ssr: false }
);

// Combine advanced CLT components into Interactive
const InteractiveTab = dynamic(() => 
  Promise.resolve({
    default: () => {
      const CLTProperties = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-4-CLTProperties'),
        { ssr: false }
      );
      const SamplingDistributionsVisual = dynamic(() => 
        import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-5-SamplingDistributionsVisual'),
        { ssr: false }
      );
      
      const React = require('react');
      
      const [view, setView] = React.useState('properties');
      
      return (
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'properties' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              onClick={() => setView('properties')}
            >
              CLT Properties
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'visual' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
              onClick={() => setView('visual')}
            >
              Visual Mastery
            </button>
          </div>
          
          <div>
            {view === 'properties' && <CLTProperties />}
            {view === 'visual' && <SamplingDistributionsVisual />}
          </div>
        </div>
      );
    }
  }),
  { ssr: false }
);

export default function SamplingDistributionsPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Hands-on exploration with dice sampling'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Mathematical theory of sampling distributions'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'CLT gateway and key formulas'
    },
    { 
      id: 'interactive', 
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b',
      description: 'Advanced CLT exploration and applications'
    }
  ];
  
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="Sampling Distributions"
        subtitle="Discover how sample statistics behave and why the CLT is magical"
        chapter={4}
        tabs={TABS}
        storageKey="chapter4-sampling-distributions-progress"
        colorScheme="indigo"
      />
    </>
  );
}