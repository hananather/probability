'use client';

import { CIHypothesisTestingBridge } from '../../../../components/05-estimation/5-6-CIHypothesisTestingBridge';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function CIHypothesisTestingBridgePage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <CIHypothesisTestingBridge />
    </>
  );
}