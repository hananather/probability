'use client';

import SimpleLinearRegression from "@/components/07-linear-regression/7-2-SimpleLinearRegression";
import { Chapter7ReferenceSheet } from '@/components/reference-sheets/Chapter7ReferenceSheet';

export default function SimpleLinearRegressionPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <Chapter7ReferenceSheet mode="floating" />
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <SimpleLinearRegression />
      </div>
    </div>
  );
}