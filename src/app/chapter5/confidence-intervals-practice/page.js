'use client';

import ConfidenceIntervalPractice from '@/components/05-estimation/5-2-2-ConfidenceIntervalPractice';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function ConfidenceIntervalsPracticePage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <ConfidenceIntervalPractice />
    </>
  );
}