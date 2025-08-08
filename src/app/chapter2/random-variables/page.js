'use client';
import SpatialRandomVariable from '@/components/02-discrete-random-variables/2-1-1-SpatialRandomVariable';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function RandomVariablesPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <SpatialRandomVariable />
    </>
  );
}