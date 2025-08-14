'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const ZScorePracticeProblems = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-5-ZScorePracticeProblemsClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function PracticeProblemsPage() {
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      
      <div className="mb-6">
        <Link href="/chapter3/normal-distributions">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Normal Distributions
          </Button>
        </Link>
      </div>

      <div className="space-y-12">
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-4">Z-Score Practice Problems</h2>
          <p className="text-neutral-300 mb-4">
            Test your understanding of normal distributions and z-scores with these interactive practice problems. 
            Each problem provides immediate feedback and detailed explanations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">Problem Types</h3>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Calculate z-scores from raw data</li>
                <li>• Find probabilities using z-tables</li>
                <li>• Determine percentiles and critical values</li>
                <li>• Apply the empirical rule</li>
              </ul>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">Learning Features</h3>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Step-by-step solutions</li>
                <li>• Visual feedback with graphs</li>
                <li>• Hints when you need help</li>
                <li>• Track your progress</li>
              </ul>
            </div>
          </div>
        </div>

        <ZScorePracticeProblems />
      </div>
    </>
  );
}