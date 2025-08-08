'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const JointDistributions = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-1-JointDistributionsClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const JointWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-2-JointDistributionWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);


const MarginalDistributionVisualizer = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-5-MarginalDistributionVisualizerClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);


export default function JointDistributionsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Chapter3ReferenceSheet mode="floating" />
      <BackToHub chapter={3} />
      <div className="space-y-12 pb-20">
        <div>
          <h2 className="text-2xl font-bold text-center py-4 text-blue-400">3.6.1 - Joint Distributions Overview</h2>
          <JointDistributions />
        </div>
        
        <div className="border-t border-neutral-800 pt-12">
          <h2 className="text-2xl font-bold text-center py-4 text-yellow-400">3.6.2 - Joint Distribution Worked Example</h2>
          <JointWorkedExample />
        </div>
        
        <div className="border-t border-neutral-800 pt-12">
          <h2 className="text-2xl font-bold text-center py-4 text-orange-400">3.6.5 - Marginal Distribution Visualizer</h2>
          <MarginalDistributionVisualizer />
        </div>
      </div>
    </div>
  );
}