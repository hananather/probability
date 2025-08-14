"use client";

import dynamic from 'next/dynamic';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

const IntroductionHub = dynamic(() => 
  import('@/components/04-descriptive-statistics-sampling/4-1-introduction/4-1-0-IntroductionHub'),
  { ssr: false }
);

export default function IntroductionPage() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <IntroductionHub />
    </>
  );
}