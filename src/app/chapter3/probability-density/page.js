'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const ContinuousDistributionsPDF = dynamic(
  () => import('@/components/03-continuous-random-variables/3-1-probability-density/3-1-1-ContinuousDistributionsPDFClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ProbabilityDensityPage() {
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <ContinuousDistributionsPDF />
      </div>
    </>
  );
}