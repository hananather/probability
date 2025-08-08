'use client';

import SampleSizeCalculation from "@/components/05-estimation/5-3-SampleSizeCalculation";
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function SampleSizeCalculationPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <Chapter5ReferenceSheet mode="floating" />
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <SampleSizeCalculation />
      </div>
    </div>
  );
}