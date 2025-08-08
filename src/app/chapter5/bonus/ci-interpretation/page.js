'use client';

import { CIInterpretationTrainer } from '../../../../components/05-estimation/5-7-CIInterpretationTrainer';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function CIInterpretationTrainerPage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <CIInterpretationTrainer />
    </>
  );
}