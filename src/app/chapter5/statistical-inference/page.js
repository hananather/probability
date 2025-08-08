'use client';

import StatisticalInference from '@/components/05-estimation/5-1-StatisticalInference';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function StatisticalInferencePage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <StatisticalInference />
    </>
  );
}