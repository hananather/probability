'use client';

import LinearTransformations from '@/components/02-discrete-random-variables/2-3-1-LinearTransformations';
import FunctionTransformations from '@/components/02-discrete-random-variables/2-3-2-FunctionTransformations';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

export default function TransformationsPage() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <BackToHub chapter={2} />
      <div className="space-y-12">
        <LinearTransformations />
        <FunctionTransformations />
      </div>
    </>
  );
}