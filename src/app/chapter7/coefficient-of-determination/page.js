'use client';

import CoefficientOfDetermination from '@/components/07-linear-regression/7-6-CoefficientOfDetermination';
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function CoefficientOfDeterminationPage() {
  return (
    <>
      <Chapter7ReferenceSheet mode="floating" />
      <CoefficientOfDetermination />
    </>
  );
}