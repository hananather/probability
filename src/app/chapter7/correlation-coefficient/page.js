'use client';

import CorrelationCoefficient from '@/components/07-linear-regression/7-1-CorrelationCoefficient';
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function CorrelationCoefficientPage() {
  return (
    <>
      <Chapter7ReferenceSheet mode="floating" />
      <CorrelationCoefficient />
    </>
  );
}