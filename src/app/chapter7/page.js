'use client';

import LinearRegressionHub from '@/components/07-linear-regression/7-0-LinearRegressionHub';
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function Chapter7Page() {
  return (
    <>
      <Chapter7ReferenceSheet mode="floating" />
      <LinearRegressionHub />
    </>
  );
}