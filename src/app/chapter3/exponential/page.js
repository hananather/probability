'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const ExponentialDistribution = dynamic(
  () => import('@/components/03-continuous-random-variables/3-4-1-ExponentialDistributionClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const ExponentialWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-4-2-ExponentialDistributionWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ExponentialPage() {
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <ExponentialDistribution />
        <ExponentialWorkedExample />
      </div>
    </>
  );
}