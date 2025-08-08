'use client';

import DistributionStories from '@/components/02-discrete-random-variables/2-7-1-DistributionStories';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function DistributionStoriesPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <DistributionStories />
    </>
  );
}