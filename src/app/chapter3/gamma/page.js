'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const GammaDistribution = dynamic(
  () => import('@/components/03-continuous-random-variables/3-5-1-GammaDistributionClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const GammaWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-5-2-GammaDistributionWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function GammaPage() {
  return (
    <>
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <GammaDistribution />
        <GammaWorkedExample />
      </div>
    </>
  );
}