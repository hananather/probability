'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const NormalApproxBinomial = dynamic(
  () => import('@/components/03-continuous-random-variables/3-7-1-NormalApproxBinomialClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const NormalApproxWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-7-2-NormalApproxBinomialWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function NormalApproximationPage() {
  return (
    <>
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <NormalApproxBinomial />
        <NormalApproxWorkedExample />
      </div>
    </>
  );
}