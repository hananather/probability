'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const BinomialDistribution = dynamic(
  () => import('@/components/02-discrete-random-variables/2-3-3-BinomialDistribution'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function BinomialDistributionPage() {
  return (
    <>
      <BackToHub chapter={2} />
      <BinomialDistribution />
    </>
  );
}