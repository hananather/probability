"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

const VariabilityHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-3-variability/4-3-0-VariabilityHub'),
  { ssr: false }
);

export default function VariabilityPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <VariabilityHub />
    </>
  );
}