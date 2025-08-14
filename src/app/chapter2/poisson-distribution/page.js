'use client';

import PoissonDistribution from '@/components/02-discrete-random-variables/2-6-1-PoissonDistribution-Enhanced';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function PoissonDistributionPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <PoissonDistribution />
    </>
  );
}