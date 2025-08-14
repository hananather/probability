"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

const AdvancedDistributionsHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-7-advanced-distributions/4-7-0-AdvancedDistributionsHub'),
  { ssr: false }
);

export default function AdvancedDistributionsPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <AdvancedDistributionsHub />
    </>
  );
}