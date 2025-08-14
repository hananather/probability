'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const NormalZScoreExplorer = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-1-NormalZScoreExplorerClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const NormalZScoreWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-2-NormalZScoreWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ZScoreExplorerPage() {
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
          <h2 className="text-2xl font-bold text-white mb-4">Understanding Z-Scores</h2>
          <p className="text-neutral-300 mb-4">
            The z-score transformation is a fundamental concept in statistics that allows us to standardize 
            any normal distribution. By converting values to z-scores, we can:
          </p>
          <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
            <li>Compare values from different normal distributions</li>
            <li>Calculate probabilities using the standard normal table</li>
            <li>Identify outliers and unusual observations</li>
            <li>Standardize data for analysis</li>
          </ul>
          <p className="text-neutral-300 mt-4">
            Use the interactive explorer below to see how changing the mean (μ) and standard deviation (σ) 
            affects the distribution, and how any value x can be transformed to its corresponding z-score.
          </p>
        </div>

        <NormalZScoreExplorer />
        <NormalZScoreWorkedExample />
      </div>
    </>
  );
}