'use client';

import NegativeBinomialDistribution from '@/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function NegativeBinomialPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <NegativeBinomialDistribution />
    </>
  );
}