"use client";

import dynamic from 'next/dynamic';
import TabbedLearningPage from '@/components/ui/TabbedLearningPage';
import { BookOpen, Target, Zap, Palette } from 'lucide-react';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Dynamic imports for CLT components - organized as tabs
const FoundationsTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-3-CLTGateway'), 
  { ssr: false }
);

const WorkedExamplesTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-4-CLTProperties'), 
  { ssr: false }
);

// Create wrapper components for the existing CLT content
const QuickReferenceTab = dynamic(() => 
  Promise.resolve({
    default: () => {
      return (
        <div className="space-y-6">
          <div className="bg-neutral-800/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Central Limit Theorem Quick Reference</h3>
            
            <div className="space-y-4">
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-400">The Theorem</h4>
                <p className="mb-2">For ANY population with mean μ and finite variance σ²:</p>
                <div className="bg-neutral-900 p-3 rounded font-mono text-sm">
                  X̄ ~ N(μ, σ²/n) as n → ∞
                </div>
              </div>
              
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-400">Key Conditions</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Random sampling from the population</li>
                  <li>• Finite population variance (σ² is finite)</li>
                  <li>• Sample size n ≥ 30 for practical use</li>
                  <li>• Independence of observations</li>
                </ul>
              </div>
              
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-purple-400">Applications</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Polling:</strong> Margin of error = 1.96 × SE</li>
                  <li>• <strong>Quality Control:</strong> Control limits = μ ± 3σ/√n</li>
                  <li>• <strong>Finance:</strong> Portfolio risk reduction by √n</li>
                  <li>• <strong>Clinical Trials:</strong> Testing treatment effects</li>
                </ul>
              </div>
              
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-orange-400">Common Formulas</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div>Standard Error: SE = σ/√n</div>
                  <div>Z-score: Z = (X̄ - μ)/(σ/√n)</div>
                  <div>95% CI: X̄ ± 1.96 × SE</div>
                  <div>99% CI: X̄ ± 2.58 × SE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }),
  { ssr: false }
);

const InteractiveTab = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-5-SamplingDistributionsVisual'), 
  { ssr: false }
);

export default function CentralLimitTheoremPage() {
  const TABS = [
    { 
      id: 'foundations', 
      label: 'Foundations', 
      icon: BookOpen, 
      component: FoundationsTab, 
      color: '#10b981',
      description: 'Discover the magic of the Central Limit Theorem'
    },
    { 
      id: 'worked-examples', 
      label: 'Worked Examples', 
      icon: Target,
      component: WorkedExamplesTab, 
      color: '#3b82f6',
      description: 'Deep dive into CLT properties and applications'
    },
    { 
      id: 'quick-reference', 
      label: 'Quick Reference', 
      icon: Zap,
      component: QuickReferenceTab, 
      color: '#7c3aed',
      description: 'Essential formulas and conditions at a glance'
    },
    { 
      id: 'interactive', 
      label: 'Interactive Explorer', 
      icon: Palette,
      component: InteractiveTab, 
      color: '#f59e0b',
      description: 'Experiment with different distributions and sample sizes'
    }
  ];
  
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <TabbedLearningPage
        title="The Central Limit Theorem"
        subtitle="Statistics' most powerful result - see why everything becomes normal"
        chapter={4}
        tabs={TABS}
        storageKey="chapter4-clt-progress"
        colorScheme="blue"
      />
    </>
  );
}