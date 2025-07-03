'use client';

import BinomialDistribution from '@/components/02-discrete-random-variables/2-3-3-BinomialDistribution';
import BackToHub from '@/components/ui/BackToHub';

export default function BinomialDistributionPage() {
  return (
    <>
      <BackToHub chapter={2} />
      <BinomialDistribution />
    </>
  );
}