'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const ContinuousDistributionsPDF = dynamic(
  () => import('@/components/03-continuous-random-variables/3-1-1-ContinuousDistributionsPDFClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const IntegralWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-1-2-IntegralWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ProbabilityDensityPage() {
  return (
    <>
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <ContinuousDistributionsPDF />
        <IntegralWorkedExample />
      </div>
    </>
  );
}