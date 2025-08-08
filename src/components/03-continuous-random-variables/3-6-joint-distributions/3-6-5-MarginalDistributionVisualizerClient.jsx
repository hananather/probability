'use client';

import dynamic from 'next/dynamic';

const MarginalDistributionVisualizer = dynamic(
  () => import('./3-6-5-MarginalDistributionVisualizer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-neutral-900 rounded-lg">
        <div className="text-neutral-400">Loading marginal distributions...</div>
      </div>
    )
  }
);

export default function MarginalDistributionVisualizerClient() {
  return <MarginalDistributionVisualizer />;
}