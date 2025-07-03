'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const JointDistributions = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-1-JointDistributionsClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const JointWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-2-JointDistributionWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const JointProbabilityCalculator = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-3-JointProbabilityCalculatorClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function JointDistributionsPage() {
  return (
    <>
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <JointDistributions />
        <JointWorkedExample />
        <JointProbabilityCalculator />
      </div>
    </>
  );
}