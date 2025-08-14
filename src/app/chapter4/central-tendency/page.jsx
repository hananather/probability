"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

const CentralTendencyHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-0-CentralTendencyHub'),
  { ssr: false }
);

export default function CentralTendencyPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <CentralTendencyHub />
    </>
  );
}