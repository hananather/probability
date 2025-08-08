'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';

const DoubleIntegralCalculator = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-joint-distributions/3-6-6-DoubleIntegralCalculatorClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function DoubleIntegralCalculatorPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <BackToHub chapter={3} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">
          Interactive Double Integral Calculator
        </h1>
        <p className="text-center text-neutral-300 mb-8 max-w-3xl mx-auto">
          Explore how double integrals calculate probabilities over regions with step-by-step visualization.
          Select a distribution, drag to define a region, and watch the numerical integration process unfold.
        </p>
        <DoubleIntegralCalculator />
      </div>
    </div>
  );
}