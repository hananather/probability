"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

// Import the HistogramHub that contains all visualization components
const HistogramHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-0-HistogramHub'),
  { ssr: false }
);

export default function VisualSummariesPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <HistogramHub />
    </>
  );
}