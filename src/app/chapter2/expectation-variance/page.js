'use client';

import ExpectationVariance from '@/components/02-discrete-random-variables/2-2-1-ExpectationVariance';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function ExpectationVariancePage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <ExpectationVariance />
    </>
  );
}