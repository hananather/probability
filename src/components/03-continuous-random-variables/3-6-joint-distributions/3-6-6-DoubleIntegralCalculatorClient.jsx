'use client';

import dynamic from 'next/dynamic';

const DoubleIntegralCalculator = dynamic(
  () => import('./3-6-6-DoubleIntegralCalculator'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-neutral-900 rounded-lg">
        <div className="text-neutral-400">Loading double integral calculator...</div>
      </div>
    )
  }
);

export default function DoubleIntegralCalculatorClient() {
  return <DoubleIntegralCalculator />;
}