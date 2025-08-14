'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

const ZTableExplorer = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-6-ZTableExplorer'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ZTableExplorerPage() {
  // Critical values for quick reference
  const criticalValues = [
    { z: 1.645, confidence: "90%", alpha: "0.10", use: "One-tailed" },
    { z: 1.96, confidence: "95%", alpha: "0.05", use: "Most common" },
    { z: 2.576, confidence: "99%", alpha: "0.01", use: "High precision" },
    { z: 1.282, confidence: "80%", alpha: "0.20", use: "Basic" },
    { z: 2.326, confidence: "98%", alpha: "0.02", use: "Higher conf." },
    { z: 3.090, confidence: "99.8%", alpha: "0.002", use: "Very high" }
  ];
  
  // Real-world examples
  const practicalExamples = [
    {
      title: "Quality Control",
      description: "A factory produces batteries with mean life 500 hours, σ = 50 hours.",
      question: "What percentage last more than 580 hours?",
      solution: "z = (580-500)/50 = 1.6, P(Z > 1.6) = 1 - 0.9452 = 5.48%",
      zValue: 1.6
    },
    {
      title: "Medical Testing",
      description: "Blood pressure readings: mean 120 mmHg, σ = 15 mmHg.",
      question: "What z-score defines the top 5% (hypertension)?",
      solution: "Need P(Z > z) = 0.05, so Φ(z) = 0.95, z ≈ 1.645",
      zValue: 1.645
    },
    {
      title: "Six Sigma",
      description: "Process capability for near-zero defects.",
      question: "What's the defect rate at 6σ quality?",
      solution: "P(|Z| > 6) ≈ 2 × 10⁻⁹ or 2 defects per billion",
      zValue: 6
    }
  ];

  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      
      <div className="mb-6">
        <Link href="/chapter6/test-mean-known-variance">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Z-Test (Known σ)
          </Button>
        </Link>
      </div>

      <div className="space-y-12">
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-4">Z-Table for Hypothesis Testing</h2>
          <p className="text-neutral-300 mb-4">
            Use this interactive z-table to find critical values for hypothesis testing with known population 
            standard deviation. This tool is essential for:
          </p>
          <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
            <li>Finding critical values for different significance levels (α)</li>
            <li>Determining rejection regions for one-tailed and two-tailed tests</li>
            <li>Looking up p-values for calculated test statistics</li>
            <li>Understanding the relationship between z-scores and probabilities</li>
            <li>Working through hypothesis testing examples</li>
          </ul>
        </div>

        <ZTableExplorer 
          practicalExamples={practicalExamples}
          criticalValues={criticalValues}
          showTutorial={false}
          setShowTutorial={() => {}}
        />
      </div>
    </>
  );
}