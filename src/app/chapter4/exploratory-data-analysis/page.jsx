"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

const ExploratoryDataAnalysisHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-4-exploratory-data-analysis/4-4-0-ExploratoryDataAnalysisHub'),
  { ssr: false }
);

export default function ExploratoryDataAnalysisPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <ExploratoryDataAnalysisHub />
    </>
  );
}