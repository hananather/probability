'use client';

import ConfidencePredictionIntervals from '@/components/07-linear-regression/7-4-ConfidencePredictionIntervals';
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function ConfidencePredictionIntervalsPage() {
  return (
    <>
      <Chapter7ReferenceSheet mode="floating" />
      <ConfidencePredictionIntervals />
    </>
  );
}