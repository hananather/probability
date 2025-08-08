'use client';

import PairedTwoSampleTest from '@/components/06-hypothesis-testing/6-7-1-PairedTwoSampleTest';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export default function PairedTwoSampleTestPage() {
  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      <PairedTwoSampleTest />
    </>
  );
}