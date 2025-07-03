'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const ContinuousExpectationVariance = dynamic(
  () => import('@/components/03-continuous-random-variables/3-2-1-ContinuousExpectationVarianceClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ExpectationVariancePage() {
  return (
    <>
      <BackToHub chapter={3} />
      <ContinuousExpectationVariance />
    </>
  );
}