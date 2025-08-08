'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const BridgeToContinuous = dynamic(
  () => import('@/components/03-continuous-random-variables/3-0-1-BridgeToContinuousClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function IntroductionPage() {
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      <BackToHub chapter={3} />
      <BridgeToContinuous />
    </>
  );
}