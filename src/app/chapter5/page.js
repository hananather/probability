'use client';

import EstimationHub from "@/components/05-estimation/5-0-EstimationHub";
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function Chapter5() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <EstimationHub />
    </>
  );
}