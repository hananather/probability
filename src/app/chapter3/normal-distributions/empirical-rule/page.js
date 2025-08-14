'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const EmpiricalRule = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-3-EmpiricalRuleClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function EmpiricalRulePage() {
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
          <h2 className="text-2xl font-bold text-white mb-4">The 68-95-99.7 Rule</h2>
          <p className="text-neutral-300 mb-4">
            The Empirical Rule, also known as the 68-95-99.7 rule, is a powerful shortcut for understanding 
            normal distributions. This rule tells us that for any normal distribution:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">68%</div>
              <p className="text-neutral-300 text-sm">of data falls within ±1σ of the mean</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">95%</div>
              <p className="text-neutral-300 text-sm">of data falls within ±2σ of the mean</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">99.7%</div>
              <p className="text-neutral-300 text-sm">of data falls within ±3σ of the mean</p>
            </div>
          </div>
          <p className="text-neutral-300">
            This rule is essential for quick probability estimates and understanding data spread in 
            normal distributions. The interactive visualization below shows how these percentages 
            remain constant regardless of the specific mean and standard deviation values.
          </p>
        </div>

        <EmpiricalRule />
      </div>
    </>
  );
}