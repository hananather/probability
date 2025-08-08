"use client";
import dynamic from 'next/dynamic';

const ZScorePracticeProblems = dynamic(
  () => import('./3-3-5-ZScorePracticeProblems').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default ZScorePracticeProblems;