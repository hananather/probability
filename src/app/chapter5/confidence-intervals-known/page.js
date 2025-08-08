'use client';

import ConfidenceIntervalKnownVariance from '@/components/05-estimation/5-2-1-ConfidenceIntervalKnownVariance';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function ConfidenceIntervalsKnownPage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <ConfidenceIntervalKnownVariance />
    </>
  );
}