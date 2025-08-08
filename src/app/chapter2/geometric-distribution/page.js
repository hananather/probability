'use client';

import GeometricDistribution from '@/components/02-discrete-random-variables/2-4-1-GeometricDistribution';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function GeometricDistributionPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <GeometricDistribution />
    </>
  );
}