'use client';

import AnalysisOfVariance from '@/components/07-linear-regression/7-5-AnalysisOfVariance';
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function Page() {
  return (
    <>
      <Chapter7ReferenceSheet mode="floating" />
      <AnalysisOfVariance />
    </>
  );
}