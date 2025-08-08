'use client';

import dynamic from 'next/dynamic';

const JointProbabilityCalculator = dynamic(
  () => import('./3-6-3-JointProbabilityCalculator').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading probability calculator...</div>
      </div>
    )
  }
);

export default JointProbabilityCalculator;