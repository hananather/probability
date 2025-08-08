'use client';

import dynamic from 'next/dynamic';

const JointDistribution3D = dynamic(
  () => import('./3-6-4-JointDistribution3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-neutral-900 rounded-lg">
        <div className="text-neutral-400">Loading 3D visualization...</div>
      </div>
    )
  }
);

export default function JointDistribution3DClient() {
  return <JointDistribution3D />;
}